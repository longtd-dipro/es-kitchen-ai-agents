import { ApiError } from '@/lib/api/errors';
import master, { vmSlotTypes } from '@/lib/domain/areas/master';
import { taxRateOpts } from '@/lib/domain/tax';
import { ALLERGEN_NONE, crossesFrames, JAN_MAX, JAN_RE, jansOf, NUT_KEYS, NUT_MAX, nutTo, perServingOf, SERVING_MAX } from '@/lib/domain/product';
import type { Account, Material, Model, Nutrition, Product, ProductCategory, ProductHistory, TaxRate } from '@/lib/domain/types';
import type { DocRepo } from '../core/area';
import { pickWarehouses } from './fromDomain';
import { listMenus } from '@/lib/domain/menu';
import { pickingWarehouses, stockAt } from '@/lib/domain/stock';
import type { Branch, MonthlyMenu, StockCheck } from '@/lib/domain/types';
import { checkProductInput, withLabel } from './productCheck';
import { assertFresh } from '../core/concurrency';

/*
 * 運営Web 商品マスタ（一覧・詳細・編集・新規登録）の読み書き。データは共通データ（dm.master.*）だけ。
 *   書き換えは master.create / master.update（変更履歴 dm.master.productHistory を残す）、税率のその場の追加・削除は master.addTaxRate など（使っていれば 409）。
 *   商品タグ・営業サンプルは商品マスタに持たない（メニューの画面で指定する。台帳 F 2026-10-08）
 */

/** 画面で入力する商品の項目（品番・状態・互換の項目は除く。temp・vmFrame・supplierId はここで決める） */
/** 画面・CSV からの商品の入力。status＝有効／無効（画面は編集の「状態」欄・CSV は状態の列。削除は一覧・詳細の「削除」だけ。受付簿 #278・#279） */
export type ProductInput = Omit<Product, 'id' | 'status' | 'temp' | 'vmFrame' | 'supplierId'> & { status?: '有効' | '無効' };

const products = (r: DocRepo) => r.list<Product>('dm.master.products');
const live = (r: DocRepo) => products(r).filter((p) => p.status !== '削除済');

/** 次の品番（M＋3桁の続き番号） */
export function nextProductId(r: DocRepo) {
  const n = Math.max(0, ...products(r).map((p) => Number(p.id.replace(/^\D+/, '')) || 0)) + 1;
  return `M${String(n).padStart(3, '0')}`;
}

/** 商品マスタの画面で選ぶもの（カテゴリ・税率・ピッキング倉庫・自販機・資材・仕入先） */
export function productMasters(r: DocRepo) {
  return {
    /* 商品はカテゴリを ID で持つ（受付簿 #233） */
    categories: r.list<ProductCategory>('dm.master.productCategories').slice().sort((a, b) => a.order - b.order).map((c) => ({ id: c.id, name: c.name })),
    /* 税率の used はプラン・機種・オプションなどで使っている数も含む（使っていれば消せない・lib/domain/tax.ts） */
    taxRates: taxRateOpts(r),
    warehouses: pickWarehouses(r).map((w) => ({ id: w.id, name: w.name })),
    /* 自販機コラムの選択肢は機種マスタ（自販機レイアウトの収納タイプ）を参照する（受付簿 #259） */
    vmColumns: vmSlotTypes(r),
    models: r.list<Model>('dm.master.models').filter((m) => m.category === '自販機' && m.status !== '削除済').map((m) => ({ id: m.id, name: m.name })),
    materials: r.list<Material>('dm.master.materials').map((m) => ({ id: m.id, name: m.name })),
    suppliers: r.list<Account>('dm.account.accounts').filter((a) => a.site === 'supplier' && a.status !== '削除済').map((a) => ({ id: a.id, name: a.name })),
    nextId: nextProductId(r),
  };
}
export type ProductMasters = ReturnType<typeof productMasters>;

/** 同時更新の検知の版（E31）：その商品の変更履歴の件数（保存のたびに1行増える） */
export const productVersion = (r: DocRepo, id: string) => String(r.list<ProductHistory>('dm.master.productHistory').filter((h) => h.productId === id).length);

/** 古い記録（項目の組がない）：「販売価格を「180 → 200」に変更」は項目・前・後に分ける。ほかは文のまま項目に出す */
function legacyItem(what: string) {
  const m = /^(.+?)を「(.*) → (.*)」に変更/.exec(what);
  return m ? { field: m[1], before: m[2], after: m[3] } : { field: what === 'データ登録' ? '—' : what, before: '', after: '' };
}

/** 商品1件と変更履歴（変更者はアカウントの名前。CSV取込・system はそのまま） */
export function productDetail(r: DocRepo, id: string) {
  const p = r.get<Product>('dm.master.products', id);
  if (!p || p.status === '削除済') return null;
  /* 変更履歴は P-HIST の列（日時・操作した人・操作・項目・変更前・変更後・理由）。1行＝変えた項目1つ（新しいものが上） */
  const history = (master.queries.productHistory(r, { productId: id }) as ProductHistory[]).flatMap((h) => {
    const by = r.get<Account>('dm.account.accounts', h.by)?.name ?? h.by;
    const items = h.items?.length ? h.items : [legacyItem(h.what)];
    const op = h.by === 'CSV取込' ? 'CSV取込' : h.what === 'データ登録' ? '登録' : items.some((x) => x.field === '状態' && x.after === '削除済') ? '削除' : '変更';
    return items.map((x) => ({ at: h.at, by, op, field: x.field, before: x.before, after: x.after, reason: h.reason ?? '' }));
  });
  return { product: p, history, version: productVersion(r, id) };
}

/** 自販機コラム → 自販機の枠（W ダブル／S シングル／B ベルト）。コラムがなければ null */
function frameOf(columns: string[], cur: Product['vmFrame']): Product['vmFrame'] {
  if (!columns.length) return null;
  const has = (k: string) => columns.some((c) => c.startsWith(k));
  if (cur && has({ W: 'ダブル', S: 'シングル', B: 'ベルト' }[cur])) return cur;
  return has('ダブル') ? 'W' : has('シングル') ? 'S' : has('ベルト') ? 'B' : (cur ?? 'S');
}

/**
 * 入力の確かめ（画面と同じ決まり＝productCheck.ts。参照先の有無・JAN の重複はここで確かめる）。
 * 必須（2026-10-05 決定・台帳 F・受付簿 #235・#236・#273）：基本情報（商品名・商品名（英語）・カテゴリ・販売価格・税率。カナは任意）＋商品解説・ピッキング倉庫・コース・ES賞味期限・栄養成分（100g当たり）・特定原材料（ないときは「なし」）・仕入先（1社）の仕入先・仕入単価・ロット。
 * 必須の最終の確かめは共通データ（master.create／update の checkProductRequired）
 */
function validate(r: DocRepo, d: ProductInput, id?: string) {
  const bad = (m: string) => { throw new ApiError(m, 400); };
  const errs = checkProductInput(d);
  const first = Object.keys(errs)[0];
  if (first) bad(withLabel(first, errs[first]));
  if (!r.list<ProductCategory>('dm.master.productCategories').some((c) => c.id === d.categoryId)) bad('カテゴリを選択してください。');
  /* JAN（複数）は 8〜13桁・10件まで・同じ商品の中で重複不可（productCheck.ts）。ほかの商品と同じ JAN は重複（削除済の商品の JAN は使える：受付簿 #273。E09） */
  const mine = (d.jans ?? (d.jan ? [d.jan] : [])).map((j) => j.trim()).filter(Boolean);
  const dup = mine.find((j) => live(r).some((p) => p.id !== id && jansOf(p).includes(j)));
  if (dup) bad(`JANコード（${dup}）は既に登録されています。`);
  for (const w of d.pickWarehouseIds ?? []) if (!r.get('dm.master.warehouses', w)) bad(`ピッキング倉庫が見つかりません（${w}）`);
}
/** 栄養成分の空欄（画面の NaN・CSV の空）は 0 にする。to のない前の形は to＝from */
const nut0 = (n: Partial<Nutrition> | undefined): Nutrition => {
  const v = (x: unknown) => (typeof x === 'number' && Number.isFinite(x) ? x : 0);
  const from = { kcal: v(n?.kcal), protein: v(n?.protein), fat: v(n?.fat), carbs: v(n?.carbs), salt: v(n?.salt) };
  const to = n?.to ? nutTo({ ...from, to: Object.fromEntries(NUT_KEYS.map((k) => [k, v(n.to![k])])) }) : nutTo(from);
  return { servingG: v(n?.servingG), ...from, other: n?.other ?? '', to };
};

/** 商品写真の上限（RD-MN-068：5枚まで・1枚 5MB 以下） */
export const MAX_PHOTOS = 5;
/** 写真はメインを1枚に（なければ先頭） */
function mainOne(images: Product['images']) {
  if (!images.length) return images;
  const i = Math.max(0, images.findIndex((x) => x.main));
  return images.map((x, j) => ({ file: x.file, main: j === i }));
}

/**
 * 商品の登録・更新。id がなければ新規（品番は続き番号）。返り値＝品番・商品名。
 * temp（便の温度帯の判定に使う）＝保管方法（管理用）。資材の商品（temp＝資材）は常温のままなら資材のまま
 */
/** 画面の入力 → 共通データの商品の項目 */
function fieldsOf(data: ProductInput, cur: Product | null | undefined): Omit<Product, 'id' | 'status' | 'supplierId'> & { status?: '有効' | '無効' } {
  const temp: Product['temp'] = cur?.temp === '資材' && data.storage.admin === '常温' ? '資材' : data.storage.admin;
  const per100g = nut0(data.nutrition?.per100g);
  const esValue = Number.isFinite(data.shelfLife?.esValue) ? data.shelfLife.esValue : NaN;
  const { status, ...rest } = data;
  return {
    ...rest, ...(status === '有効' || status === '無効' ? { status } : {}), name: data.name.trim(), kana: data.kana?.trim() ?? '', images: mainOne(data.images ?? []).slice(0, MAX_PHOTOS), temp, vmFrame: frameOf(data.vending.columns, cur?.vmFrame ?? null),
    mgmtName: data.mgmtName?.trim() ?? '', nameEn: data.nameEn?.trim() ?? '', supplierItemName: data.supplierItemName?.trim() ?? '',
    /* JAN は jans（先頭が主）。jan は jans[0] の写し */
    ...(() => { const jans = (Array.isArray(data.jans) ? data.jans : jansOf(data)).map((j) => j.trim()).filter(Boolean); return { jans, jan: jans[0] ?? '' }; })(),
    vending: { ...data.vending, subColumns: (data.vending.subColumns ?? []).filter((c) => !data.vending.columns.includes(c)) },
    /* 1食当たりは 100g当たり × 内容量 で出す（RD-MN-118・入力しない） */
    nutrition: { per100g, perServing: perServingOf(per100g) },
    shelfLife: { ...data.shelfLife, esValue },
    /* 仕入先は複数可（受付簿 #286）。選択中が1社でないときは master 側（settle）が先頭にそろえる */
    suppliers: (data.suppliers ?? []).map((s) => (s.nextCost ? s : (({ nextCost: _n, ...x }) => x)(s))),
  };
}
/** 保存の前の確認：公開したメニューにある商品の価格の変更（価格改定／誤りの訂正）・出せなくなる拠点（共通データの master.productImpact） */
export function productImpactOf(r: DocRepo, id: string, data: ProductInput) {
  const cur = r.get<Product>('dm.master.products', id);
  if (!cur) throw new ApiError('商品が見つかりません', 404);
  return master.queries.productImpact(r, { productId: id, patch: fieldsOf(data, cur) });
}
/** 価格の変更方法・法人への通知・出せなくなる拠点の確認（共通データの master.update に渡す） */
export type SaveOpts = { priceMode?: '価格改定' | '誤りの訂正'; reason?: string; notify?: boolean; confirm?: boolean };

export function saveProduct(r: DocRepo, { id, data, by, opts, baseVersion, force }: { id?: string; data: ProductInput; by: string; opts?: SaveOpts; baseVersion?: string; force?: boolean }) {
  validate(r, data, id);
  /* 他の人が先に保存していたら E31（読み込んだ版と違う）。force＝上書きして保存。CSV取込は版を送らないので確かめない */
  if (id) assertFresh(productVersion(r, id), baseVersion, force);
  const cur = id ? r.get<Product>('dm.master.products', id) : null;
  if (id && (!cur || cur.status === '削除済')) throw new ApiError('商品が見つかりません', 404);
  /* 有効 → 無効 は、有効なメニューに入っている商品・在庫がある商品はできない（受付簿 #232・#268・E273） */
  if (cur && data.status === '無効' && cur.status !== '無効') guardProduct(r, cur.id, '無効にできません');
  const fields = fieldsOf(data, cur);
  if (cur) {
    const p = master.actions.update(r, { kind: 'products', id: cur.id, patch: fields, by, ...opts }) as Product & { priceFix?: { confirmedInvoices: { id: string; issueMonth: string; actualPeriod: string; status: string }[]; unconfirmed: string[] } };
    return { id: p.id, name: p.name, priceFix: p.priceFix ?? null };
  }
  const nid = nextProductId(r);
  const p = master.actions.create(r, { kind: 'products', data: { status: '有効', ...fields, id: nid, supplierId: '' }, by }) as unknown as Product;
  return { id: p.id, name: p.name, priceFix: null };
}

/* ---------------- 削除・無効にできない条件（受付簿 #232・#268） ---------------- */

/** 「有効なメニュー」＝公開中・締切済・配送中（編集中・終了は含めない） */
const ACTIVE_MENU: MonthlyMenu['status'][] = ['公開中', '締切済', '配送中'];

/**
 * 商品を削除・無効にできない理由。入っている有効なメニュー（年月）と、在庫がある場所（倉庫・拠点）。
 * 「在庫がある」＝倉庫の在庫（lib/domain/stock.ts の stockAt）または拠点の在庫（その拠点のいちばん新しい在庫点検の数）が1以上
 */
export function productBlockers(r: DocRepo, id: string) {
  const menus = listMenus(r).filter((m) => ACTIVE_MENU.includes(m.status) && m.items.some((x) => x.productId === id)).map((m) => m.id);
  const stock: { where: string; qty: number }[] = [];
  for (const w of pickingWarehouses(r)) {
    const qty = stockAt(r, w.id, id).qty;
    if (qty >= 1) stock.push({ where: w.name, qty });
  }
  const latest = new Map<string, StockCheck>();
  for (const c of r.list<StockCheck>('dm.report.stockChecks')) if (!latest.has(c.branchId) || latest.get(c.branchId)!.period < c.period) latest.set(c.branchId, c);
  for (const c of latest.values()) {
    const qty = c.rows.find((x) => x.productId === id)?.actual ?? 0;
    if (qty >= 1) stock.push({ where: r.get<Branch>('dm.org.branches', c.branchId)?.name ?? c.branchId, qty });
  }
  return { menus, stock, blocked: menus.length > 0 || stock.length > 0 };
}
/** 理由の文（E272・E273 の趣旨＋入っているメニュー・在庫がある場所） */
export function blockText(b: ReturnType<typeof productBlockers>, what: '削除' | '無効にできません') {
  const head = what === '削除'
    ? '有効なメニューに入っている商品、または在庫がある商品のため削除できません。メニューから外す・在庫をなくしてから削除してください。'
    : '有効なメニューに入っている商品、または在庫がある商品のため無効にできません。';
  return [head, b.menus.length ? `入っているメニュー：${b.menus.join('・')}` : '', b.stock.length ? `在庫がある場所：${b.stock.map((x) => `${x.where} ${x.qty}`).join('・')}` : ''].filter(Boolean).join('\n');
}
function guardProduct(r: DocRepo, id: string, what: '削除できません' | '無効にできません') {
  const b = productBlockers(r, id);
  if (b.blocked) throw new ApiError(blockText(b, what === '削除できません' ? '削除' : '無効にできません'), 409);
}
/** 商品の論理削除（状態「削除済」。有効なメニューに入っている商品・在庫がある商品は削除できない） */
export function deleteProduct(r: DocRepo, id: string, by: string) {
  const p = r.get<Product>('dm.master.products', id);
  if (!p || p.status === '削除済') throw new ApiError('商品が見つかりません', 404);
  guardProduct(r, id, '削除できません');
  master.actions.update(r, { kind: 'products', id, patch: { status: '削除済' }, by });
}

/* CSV取込（商品マスタ一覧の「CSV取込」）は共通の仕組み：lib/csv/master.ts の products（保存は saveProduct・変更者「CSV取込」） */
