import { ApiError } from '@/lib/api/errors';
import { nowStamp } from '@/lib/supplier/dates';
import { defineArea, toDocs, type DocRepo } from '@/lib/ops/core/area';
import {
  CARRIER_ES_FEES, CARRIERS, PARTNER_HISTORY, DISCOUNTS, DRIVERS, MATERIALS, MODELS, OPTION_CATEGORIES, OPTIONS, PLANS, PRODUCT_CATEGORIES, PRODUCT_HISTORY, PRODUCT_TAGS, PRODUCTS, TAX_RATES, TROUBLE_TYPES, WAREHOUSES,
} from '../seed/master';
import { listMenus, priceSnap, PRICE_LOCKED, PRODUCT_TAG_MAX } from '../menu';
import { notifyBranch } from '../notify';
import { ALLERGEN_NONE, JAN_MAX, JAN_RE, jansOf, NUT_KEYS, NUT_MAX, nutTo, perServingOf, sellable, SERVING_MAX, settleCosts, vmModelsOf } from '../product';
import { taxRateOpts, taxUses } from '../tax';
import { VM_LAYOUTS } from '../seed/settings';
import type { VmLayout } from '../types';
import { log as auditLog } from './account';
import { formMasterOf } from '../formMaster';
import { checkMaterial, checkMaterialDelete, matOf } from '../material';
import { nextVersion } from '@/lib/ops/core/concurrency';
import type { AuditLog, Material, OptionCategory, Plan } from '../types';
import type { ChildContract, Delivery, DeliveryLine, Driver, Invoice, Loan, Model, MonthlyMenu, Product, ProductCategory, ProductHistory, ProductOrder, ProductSupplier, ProductTag, TaxRate } from '../types';
import { routeOfSlot } from '../route';
import { syncPartnerAccounts, type PartnerType } from '../partnerLock';
import { addPartnerHistory, diffWhat, isDeleted, PARTNER_LABELS, type PartnerHistKind } from '../partnerHistory';

/** マスタの状態が変わったら、そのアカウントを止める・戻す（委託配送先・倉庫・配送スタッフ。台帳 F 2026-10-06・lib/domain/partnerLock.ts） */
const LOCK_TYPE: Partial<Record<string, PartnerType>> = { carriers: 'carrier', warehouses: 'warehouse', drivers: 'driver' };
function syncLock(r: DocRepo, kind: string, id: string, prev: unknown, next: unknown, by?: string) {
  const t = LOCK_TYPE[kind];
  if (t && prev !== next && typeof next === 'string') syncPartnerAccounts(r, { type: t, id, status: next, by });
}

/**
 * 委託配送先・倉庫・配送スタッフの変更履歴（lib/domain/partnerHistory.ts）。hist＝呼んだ側が作った変更内容（'' は記録しない）。
 * 省くと変わった項目から作る。状態を削除済にしたときは「削除」
 */
const PARTNER_KINDS: Partial<Record<string, Exclude<PartnerHistKind, 'suppliers'>>> = { carriers: 'carriers', warehouses: 'warehouses', drivers: 'drivers' };
function recordPartner(r: DocRepo, kind: string, id: string, prev: Record<string, unknown> | null, next: Record<string, unknown>, by?: string, hist?: string) {
  const k = PARTNER_KINDS[kind];
  if (!k) return;
  const what = hist !== undefined ? hist : !prev ? 'データ登録' : isDeleted(next.status) && !isDeleted(prev.status) ? '削除' : diffWhat(PARTNER_LABELS[k], prev, next);
  addPartnerHistory(r, k, id, what, by);
}

/*
 * マスタ（area: master）。kind＝master.<下の KINDS>、商品の変更履歴＝master.productHistory（query productHistory）
 * 商品タグはメニューの画面（メニュー作成の商品ごとのタグ）で、税率は商品マスタのドロップダウンから、その場で足す・消す（使っていれば消せない＝409）
 * 販売価格・税率の変更（2026/10/02 決定）：公開中・締切済・配送中のメニューにある商品は priceMode が要る（productImpact で先に聞く）
 *   価格改定＝その月は公開したときの価格のまま（メニューの写し prices はそのまま）。次に公開するメニューから新しい価格
 *   誤りの訂正＝理由が要る。今のメニューの写し・代替品の請求の単価を直す。未確定の請求はそのまま新しい価格で計算、確定済みの請求書は一覧を返す（請求調整）
 *   notify＝法人へ通知。ピッキング倉庫・コース・自販機の変更で、公開したメニューの注文に出せなくなる拠点があるときは confirm が要る
 */

export const KINDS = [
  'plans', 'models', 'options', 'discounts', 'warehouses', 'carriers', 'drivers', 'products', 'materials', 'troubleTypes',
  'taxRates', 'productTags', 'productCategories', 'optionCategories',
] as const;
export type MasterKind = (typeof KINDS)[number];
export { PRODUCT_TAG_MAX };

const kindOf = (k: string) => {
  if (!(KINDS as readonly string[]).includes(k)) throw new ApiError(`マスタ ${k} はありません`, 404);
  return `dm.master.${k}`;
};
const drivers = (r: DocRepo) => r.list<Driver>('dm.master.drivers');
const products = (r: DocRepo) => r.list<Product>('dm.master.products');

/** 商品の項目の名前（変更履歴の「変更内容」） */
const PRODUCT_LABEL: Record<string, string> = {
  name: '商品名（公開名）', kana: '商品名カナ', mgmtName: '管理名', nameEn: '商品名（英語）', supplierItemName: '仕入先向けの名前', jans: 'JANコード', category: 'カテゴリ', temp: '保管方法', priceYen: '販売価格', taxRateId: '税率', note: '商品備考',
  images: '商品写真', description: '商品解説', nutrition: '栄養成分', allergens: 'アレルゲン', ingredients: '原材料名', additives: '添加物', makerUrl: '製造元',
  courses: 'コース', storage: '保管方法', vending: '自販機', bundledMaterialIds: '同梱資材', shipInstructions: '出荷時の特殊指示', shelfLife: '賞味期限',
  suppliers: '仕入先', pickWarehouseIds: 'ピッキング倉庫', status: '状態',
};
/** 値が短いものは「前 → 後」を出す */
const SHOW_VALUE = ['name', 'mgmtName', 'nameEn', 'supplierItemName', 'kana', 'jans', 'category', 'temp', 'priceYen', 'taxRateId', 'status'];

/** 商品の変更履歴を足す。ID は PH-<品番>-NNN */
function addHistory(r: DocRepo, productId: string, what: string, by: string, more: Pick<ProductHistory, 'items' | 'reason'> = {}) {
  const n = r.list<ProductHistory>('dm.master.productHistory').filter((h) => h.productId === productId).length + 1;
  const id = `PH-${productId}-${String(n).padStart(3, '0')}`;
  r.put<ProductHistory>('dm.master.productHistory', id, { id, productId, at: nowStamp(), what, by, ...more });
}
/** 変わった項目（項目の名前・変更前・変更後。値が長いものは前後を出さない） */
function diffItems(prev: Record<string, unknown>, next: Record<string, unknown>): NonNullable<ProductHistory['items']> {
  const seen = new Set<string>();
  return Object.keys(next).filter((k) => k in PRODUCT_LABEL && k !== 'categoryId' && JSON.stringify(prev[k]) !== JSON.stringify(next[k])).flatMap((k) => {
    if (seen.has(PRODUCT_LABEL[k])) return [];
    seen.add(PRODUCT_LABEL[k]);
    return [{ field: PRODUCT_LABEL[k], before: SHOW_VALUE.includes(k) ? String(prev[k] ?? '') : '', after: SHOW_VALUE.includes(k) ? String(next[k] ?? '') : '' }];
  });
}
/** 変わった項目から変更内容の文を作る（例：販売価格を「180 → 200」に変更） */
function diffText(prev: Record<string, unknown>, next: Record<string, unknown>) {
  const keys = Object.keys(next).filter((k) => k in PRODUCT_LABEL && JSON.stringify(prev[k]) !== JSON.stringify(next[k]));
  /* JAN（複数）は「;」でつなぐ。jans のない前の形は jan から */
  const val = (o: Record<string, unknown>, k: string) => (k === 'jans' ? jansOf(o as Pick<Product, 'jan'>).join(';') : String(o[k] ?? ''));
  return keys.filter((k) => k !== 'jans' || val(prev, k) !== val(next, k))
    .map((k) => (SHOW_VALUE.includes(k) ? `${PRODUCT_LABEL[k]}を「${val(prev, k)} → ${val(next, k)}」に変更` : `${PRODUCT_LABEL[k]}を更新`))
    .filter((x, i, a) => a.indexOf(x) === i).join('・');
}
/**
 * 商品を直したときにそろえる：選択中の仕入先を1社にして supplierId に写す。自販機コラムがなければ vmFrame は null。
 * 適用開始日を過ぎた仕入単価の改定は unitCostYen に入れ替える（RD-MN-076）。1食当たりの栄養成分は 100g当たり × 内容量 で出し直す（RD-MN-118）。
 * 栄養成分の to がなければ from（範囲：台帳 F 2026-10-08）。JAN は jans（先頭が主）→ jan＝jans[0]。サブコラムはメインと重ねない。
 * 営業サンプル（前の形の sampleOn）・商品タグ（前の形の tags）は商品マスタに持たない（メニューの商品ごとの指定。台帳 F 2026-10-08・受付簿 #179）ので消す
 */
function normalizeProduct(raw: Product): Product {
  const { sampleOn: _legacySample, tags: _legacyTags, ...p } = raw as Product & { sampleOn?: unknown; tags?: unknown };
  const jans = [...new Set((Array.isArray(p.jans) ? p.jans : jansOf(p)).map((x) => String(x).trim()).filter(Boolean))];
  const vending = p.vending ? { ...p.vending, subColumns: (p.vending.subColumns ?? []).filter((c) => !p.vending.columns.includes(c)) } : p.vending;
  let suppliers: ProductSupplier[] = settleCosts(p.suppliers ?? []);
  if (suppliers.length && suppliers.filter((x) => x.selected).length !== 1) {
    const i = Math.max(0, suppliers.findIndex((x) => x.selected));
    suppliers = suppliers.map((x, j) => ({ ...x, selected: j === i }));
  }
  const sel = suppliers.find((x) => x.selected);
  const per100g = p.nutrition?.per100g ? { ...p.nutrition.per100g, to: nutTo(p.nutrition.per100g) } : undefined;
  const nutrition = per100g ? { per100g, perServing: perServingOf(per100g) } : p.nutrition;
  return { ...p, jans, jan: jans[0] ?? '', vending, suppliers, nutrition, supplierId: sel?.supplierId ?? '', vmFrame: p.vending && !p.vending.columns.length ? null : p.vmFrame };
}
/**
 * JAN（複数）：1件ごとに8〜13桁の数字（E256）・10件まで（E253）・同じ商品の中で重複不可・ほかの商品（削除済を除く）と重複不可（E09。Q8＝A）。
 * 画面の保存も CSV 取込も同じ（台帳 F 2026-10-07 Q8・2026-10-08）
 */
function checkProductJans(r: DocRepo, p: Product) {
  const bad = (m: string) => { throw new ApiError(m, 400); };
  const jans = p.jans ?? [];
  if (jans.some((j) => !JAN_RE.test(j))) bad('JANコードは8〜13桁の数字で入力してください。');
  if (jans.length > JAN_MAX) bad(`JANは${JAN_MAX}個までです。`);
  const dup = jans.find((j) => products(r).some((o) => o.id !== p.id && o.status !== '削除済' && jansOf(o).includes(j)));
  if (dup) bad(`JANコード（${dup}）は既に登録されています。`);
}
/**
 * 商品の必須項目（2026-10-05 決定・台帳 F「商品マスタの必須項目」）：基本情報（商品名・カナ・カテゴリ・販売価格・税率）に加えて
 * 商品解説・ピッキング倉庫・コース・ES賞味期限（空を既定にして手で入れる）・栄養成分（100g当たり）・特定原材料（ないときは「なし」）。
 * 登録・更新（CSV 取込も同じ）で足りなければ 400
 */
export function checkProductRequired(p: Product) {
  const bad = (m: string) => { throw new ApiError(m, 400); };
  if (!p.name?.trim()) bad('商品名（公開名）を入れてください');
  /* 商品名カナは任意（2026-10-06 決定・受付簿 #236）。英語の商品名は必須（受付簿 #235）。既存の商品は次に保存するときに入れる（受付簿 #267） */
  if (!p.nameEn?.trim()) bad('商品名（英語）を入れてください');
  if (!p.category) bad('カテゴリを選んでください');
  if (!p.taxRateId) bad('税率を選んでください');
  if (!p.description?.trim()) bad('商品解説を入れてください');
  if (!p.pickWarehouseIds?.length) bad('ピッキング倉庫を選んでください');
  if (!p.courses?.length) bad('コースを選んでください');
  if (!(Number.isInteger(p.shelfLife?.esValue) && p.shelfLife.esValue >= 1)) bad('ESの賞味期限または消費期限を1以上の整数で入れてください');
  const n = p.nutrition?.per100g;
  const num = (v: unknown) => typeof v === 'number' && Number.isFinite(v) && v >= 0 && v <= NUT_MAX;
  if (!n || ![n.kcal, n.protein, n.fat, n.carbs, n.salt, ...Object.values(nutTo(n))].every(num)) bad('栄養成分（100g当たり）は from・to をすべて 0〜9,999 の数で入れてください');
  if (NUT_KEYS.some((k) => nutTo(n)[k] < n[k])) bad('栄養成分（100g当たり）の to は from 以上にしてください');
  if (!(n.servingG >= 1 && n.servingG <= SERVING_MAX)) bad('1食当たり内容量を 1〜9,999 で入れてください');
  const alg = p.allergens?.specific ?? [];
  if (!alg.length) bad(`特定原材料を選んでください（ない場合は「${ALLERGEN_NONE}」）`);
  if (alg.includes(ALLERGEN_NONE) && alg.length > 1) bad(`特定原材料の「${ALLERGEN_NONE}」はほかの原材料と同時に選べません`);
  /* 仕入先は1社以上（2026-10-08 決定・受付簿 #286：1つの商品に複数の仕入先。旧：1商品＝1仕入先 #231）。各行の仕入先・仕入単価・ロットは必須（受付簿 #273）。同じ仕入先は2行に入れられない */
  const sups = p.suppliers ?? [];
  if (!sups.length) bad('仕入先を1社以上入れてください');
  for (const s of sups) {
    if (!s.supplierId) bad('仕入先を選んでください');
    if (!(Number.isFinite(s.unitCostYen) && s.unitCostYen >= 0)) bad('仕入単価を0以上で入れてください');
    if (!(Number.isInteger(s.lot) && s.lot >= 1)) bad('ロットを1以上の整数で入れてください');
  }
  if (new Set(sups.map((s) => s.supplierId)).size !== sups.length) bad('同じ仕入先は2行に入力できません。');
}
/** カテゴリは ID で持つ（受付簿 #233）。categoryId があればカテゴリの名前の写し（category）をそろえる。名前だけ来たとき（CSV など）は名前から ID を引く */
function syncCategory(r: DocRepo, p: Product) {
  const cats = r.list<ProductCategory>('dm.master.productCategories');
  const c = (p.categoryId && cats.find((x) => x.id === p.categoryId)) || (!p.categoryId && p.category ? cats.find((x) => x.name === p.category) : undefined);
  if (!c) { if (p.categoryId || p.category) throw new ApiError('カテゴリを選んでください', 400); return; }
  p.categoryId = c.id; p.category = c.name;
}
/**
 * 自販機コラムの選択肢＝機種マスタの自販機レイアウトの収納タイプ（model_vm_cell.slot_type：ダブル8・ダブル10・シングル8・シングル10・ベルト5…）。
 * 商品マスタ側には固定で持たない（受付簿 #259）。列の構成（dm.master.vmLayouts）の各枠の [1列の格納数, 列数] から「枠の名前＋格納数」を作る。ダブル→シングル→ベルトの順・格納数の小さい順
 */
export function vmSlotTypes(r: DocRepo): string[] {
  const NAME = { W: 'ダブル', S: 'シングル', B: 'ベルト' } as const;
  const live = new Set(r.list<Model>('dm.master.models').filter((m) => m.category === '自販機' && m.status !== '削除済').map((m) => m.id));
  const out: { f: number; n: number }[] = [];
  for (const v of r.list<VmLayout>('dm.master.vmLayouts')) {
    if (!live.has(v.id)) continue;
    (['W', 'S', 'B'] as const).forEach((k, f) => { for (const [n, cols] of v.lanes[k] ?? []) if (cols > 0 && !out.some((x) => x.f === f && x.n === n)) out.push({ f, n }); });
  }
  return out.sort((a, b) => a.f - b.f || a.n - b.n).map((x) => `${(['ダブル', 'シングル', 'ベルト'])[x.f]}${x.n}`);
}
/** 商品の参照先があるか（税率・タグ・カテゴリ・倉庫・資材・機種・自販機コラム） */
function checkProductRefs(r: DocRepo, p: Partial<Product>) {
  if (p.taxRateId !== undefined && !r.get('dm.master.taxRates', p.taxRateId)) throw new ApiError(`税率が見つかりません（${p.taxRateId}）`, 400);
  const badWh = p.pickWarehouseIds?.find((id) => r.get<{ type: string }>('dm.master.warehouses', id)?.type !== 'picking');
  if (badWh) throw new ApiError(`ピッキング倉庫が見つかりません（${badWh}）`, 400);
  const badMat = p.bundledMaterialIds?.find((id) => !r.get('dm.master.materials', id));
  if (badMat) throw new ApiError(`同梱資材が見つかりません（${badMat}）`, 400);
  const badModel = p.vending?.models.find((id) => !r.get('dm.master.models', id));
  if (badModel) throw new ApiError(`対応機種が見つかりません（${badModel}）`, 400);
  /* 自販機コラムは機種マスタにある収納タイプだけ（受付簿 #259） */
  const types = vmSlotTypes(r), badCol = p.vending?.columns?.find((c) => !types.includes(c));
  if (badCol) throw new ApiError(`自販機コラム「${badCol}」は機種マスタにありません（${types.join('・') || '機種マスタの自販機レイアウトがありません'}から選んでください）`, 400);
  if (p.priceYen !== undefined && !(Number.isInteger(p.priceYen) && p.priceYen >= 0)) throw new ApiError('販売価格（税込）を正しく入れてください', 400);
}


/* ---------- プラン・資材・オプション・値引きの変更の記録（操作の記録 dm.account.audit・target＝<種類>:<ID>） ---------- */

const HIST_KINDS: readonly string[] = ['plans', 'materials', 'options', 'discounts'];
/** 変更の記録に出す項目の名前 */
const HIST_LABEL: Record<string, string> = {
  name: '名前', mgmtName: '管理名', status: '状態', priceYen: '単価（税抜）', taxRateId: '税率', amountYen: '標準金額（税抜）', feeType: '料金種別', category: '区分', public: '公開',
  monthlyMeals: '月次提供上限の合計', welfareYenPerMeal: '企業負担額（税込・1食）', deductibleYen: '免責金額', baseRatio: '基本比×倍', limits: '月次提供上限・標準の配送回数',
  initialItems: '初期備品', includedMaterials: 'プランに含む資材', ratePct: '率（％）', capYen: '上限（税抜）',
  /* 資材マスタ（受付簿 #358） */
  courses: 'コース', unit: '単位', spec: '規格', photo: '写真', publish: '公開ステータス', warehouseIds: '取扱倉庫',
};
const SHORT = ['name', 'mgmtName', 'status', 'priceYen', 'taxRateId', 'amountYen', 'feeType', 'category', 'public', 'monthlyMeals', 'welfareYenPerMeal', 'deductibleYen', 'baseRatio', 'ratePct', 'capYen', 'unit', 'spec', 'publish'];
/** 資材の数の表（初期備品・プランに含む資材）の違い：資材ごとに「割り箸 10 → 50」 */
function qtyDiff(r: DocRepo, prev: { course?: string; materialId: string; qty: number }[] = [], next: { course?: string; materialId: string; qty: number }[] = []) {
  const key = (x: { course?: string; materialId: string }) => `${x.course ?? ''}|${x.materialId}`;
  const a = new Map(prev.map((x) => [key(x), x.qty])), b = new Map(next.map((x) => [key(x), x.qty]));
  const out: string[] = [];
  for (const k of new Set([...a.keys(), ...b.keys()])) {
    if ((a.get(k) ?? 0) === (b.get(k) ?? 0)) continue;
    const [course, id] = k.split('|');
    out.push(`${course ? course + ' ' : ''}${r.get<Material>('dm.master.materials', id)?.name ?? id} ${a.get(k) ?? 0} → ${b.get(k) ?? 0}`);
  }
  return out;
}
/** 変わった項目から変更内容の文を作る */
function masterDiff(r: DocRepo, prev: Record<string, unknown>, next: Record<string, unknown>) {
  return Object.keys(HIST_LABEL).filter((k) => k in next && JSON.stringify(prev[k]) !== JSON.stringify(next[k])).map((k) => {
    if (SHORT.includes(k)) return `${HIST_LABEL[k]}を「${String(prev[k] ?? '')} → ${String(next[k] ?? '')}」に変更`;
    if (k === 'initialItems' || k === 'includedMaterials') return `${HIST_LABEL[k]}を変更（${qtyDiff(r, prev[k] as never, next[k] as never).join('、')}）`;
    return `${HIST_LABEL[k]}を更新`;
  }).join('・');
}
/** プラン・資材・オプション・値引きの変更を記録する（運営の画面の「変更履歴」に出る） */
function recordMaster(r: DocRepo, kind: string, id: string, what: string, by?: string, items?: NonNullable<AuditLog['items']>) {
  if (what && HIST_KINDS.includes(kind)) auditLog(r, by ?? 'system', 'master.update', `${kind}:${id}`, what, 'ops', items ? { items } : {});
}
/** 資材の変更履歴（P-HIST）の項目：項目の名前・変更前・変更後（写真は あり／なし、複数の値は「、」でつなぐ） */
function materialItems(prev: Record<string, unknown>, next: Record<string, unknown>): NonNullable<AuditLog['items']> {
  const show = (k: string, v: unknown) => (k === 'photo' ? (v ? 'あり' : 'なし') : Array.isArray(v) ? v.join('、') : String(v ?? ''));
  return Object.keys(HIST_LABEL).filter((k) => k in next && JSON.stringify(prev[k]) !== JSON.stringify(next[k]))
    .map((k) => ({ field: HIST_LABEL[k], before: show(k, prev[k]), after: show(k, next[k]) }));
}
/** オプション区分マスタのチェック（名前は必須・同じ名前は1つ・並び順は 0以上の整数・状態は 使用中／終了） */
function checkOptionCategory(r: DocRepo, id: string, c: Partial<OptionCategory>) {
  if (c.name !== undefined) {
    if (!c.name.trim()) throw new ApiError('オプション区分の名前を入れてください', 400);
    if (r.list<OptionCategory>('dm.master.optionCategories').some((x) => x.id !== id && x.name === c.name!.trim())) throw new ApiError(`オプション区分「${c.name.trim()}」はもうあります`, 409);
  }
  if (c.sortNo !== undefined && !(Number.isInteger(c.sortNo) && c.sortNo >= 0)) throw new ApiError('並び順は 0以上の整数で入れてください', 400);
  if (c.status !== undefined && !['使用中', '終了'].includes(c.status)) throw new ApiError('状態は 使用中／終了 のどちらかです', 400);
}
/** 実績精算の期間（'2026/08/21〜2026/09/20'）に日付が入るか */
const inPeriod = (period: string, d: string) => { const [f, t] = period.split('〜'); return !!f && !!t && f <= d && d <= t; };

/**
 * 商品の変更が、公開したメニュー（公開中・締切済・配送中）と注文に与える影響。商品マスタの保存の前に画面が聞く。
 *   needPriceMode＝販売価格・税率が変わり、公開したメニューにある（価格改定／誤りの訂正を選ぶ）
 *   confirmedInvoices＝この商品を届けた拠点の、発行済みの請求書（誤りの訂正なら請求調整が要る）、unconfirmed＝まだ確定していない子契約（新しい価格で計算）
 *   branches＝ピッキング倉庫・コース・自販機の変更で、注文している便に出せなくなる拠点（needConfirm）
 */
export function productImpact(r: DocRepo, productId: string, patch: Partial<Product>) {
  const p = r.get<Product>('dm.master.products', productId);
  if (!p) throw new ApiError(`商品が見つかりません（${productId}）`, 404);
  const next = { ...p, ...patch } as Product;
  const menus = listMenus(r).filter((m) => PRICE_LOCKED.includes(m.status) && m.items.some((x) => x.productId === productId));
  const months = menus.map((m) => m.id);
  const priceChanged = next.priceYen !== p.priceYen || next.taxRateId !== p.taxRateId;
  const orders = r.list<ProductOrder>('dm.order.orders').filter((o) => months.includes(o.cycleMonth) && o.lines.some((l) => l.productId === productId || l.altOf === productId));
  /* 確定済みの請求書：この商品を届けた配送（その月）の日付が実績精算の期間に入る、取消でない請求書 */
  const ds = r.list<Delivery>('dm.delivery.deliveries').filter((d) => months.includes(d.cycleMonth) && d.deliveredQty !== null);
  const lines = r.list<DeliveryLine>('dm.delivery.lines');
  const got = ds.filter((d) => lines.some((l) => l.deliveryId === d.id && (l.productId === productId || l.substitutedFrom === productId) && (l.deliveredQty ?? 0) > 0));
  const confirmedInvoices = priceChanged ? r.list<Invoice>('dm.billing.invoices').filter((i) => i.status !== '取消'
    && got.some((d) => (i.branchId ? i.branchId === d.branchId : i.lines.some((l) => l.branchId === d.branchId)) && inPeriod(i.actualPeriod, d.deliverOn)))
    .map((i) => ({ id: i.id, corpId: i.corpId, branchId: i.branchId, issueMonth: i.issueMonth, actualPeriod: i.actualPeriod, status: i.status })) : [];
  const unconfirmed = priceChanged ? r.list<ChildContract>('dm.org.childContracts').filter((c) => months.includes(c.cycleMonth) && c.billStatus === '未確定' && orders.some((o) => o.childContractId === c.id)).map((c) => c.id) : [];
  /* 倉庫・コース・自販機：変えたあとの商品を、注文している便に出せるか */
  const branches: { branchId: string; orderId: string; slot: string; reason: string }[] = [];
  if (['pickWarehouseIds', 'courses', 'vending', 'temp', 'status'].some((k) => k in patch && JSON.stringify((patch as Record<string, unknown>)[k]) !== JSON.stringify((p as Record<string, unknown>)[k]))) {
    const loans = r.list<Loan>('dm.org.loans'), models = r.list<Model>('dm.master.models');
    for (const o of orders) {
      const cc = r.get<ChildContract>('dm.org.childContracts', o.childContractId);
      if (!cc) continue;
      for (const l of o.lines.filter((x) => x.productId === productId && x.kind !== '除外')) {
        const [temp, slot] = l.slot.split(':');
        const c0 = cc.channels.find((c) => c.temp === temp && c.slots.includes(slot)), ch = c0 && routeOfSlot(c0, slot);
        if (!ch || sellable(next, { course: cc.course, temp: ch.temp, warehouseId: ch.warehouseId, vmModelIds: vmModelsOf(loans, models, cc.branchId) })) continue;
        const why = !next.pickWarehouseIds.includes(ch.warehouseId) ? `便の倉庫 ${ch.warehouseId} がピッキング倉庫にない` : 'コース・自販機・温度帯が合わない';
        if (!branches.some((b) => b.orderId === o.id && b.slot === l.slot)) branches.push({ branchId: cc.branchId, orderId: o.id, slot: l.slot, reason: why });
      }
    }
  }
  return {
    productId, priceChanged, menus: menus.map((m) => ({ menuId: m.id, status: m.status, priceYen: m.prices?.[productId]?.priceYen ?? p.priceYen })),
    needPriceMode: priceChanged && menus.length > 0, confirmedInvoices, unconfirmed, branches, needConfirm: branches.length > 0,
  };
}

export type PriceMode = '価格改定' | '誤りの訂正';
export type UpdateOpts = { priceMode?: PriceMode; reason?: string; notify?: boolean; confirm?: boolean };

/** 商品の更新の前の確認と、更新のあとの処理（価格の写し・代替品の単価・法人への通知） */
function productUpdate(r: DocRepo, id: string, prev: Product, patch: Partial<Product>, o: UpdateOpts, by: string) {
  const imp = productImpact(r, id, patch);
  if (imp.needPriceMode && !o.priceMode) {
    throw new ApiError(`公開中・締切済・配送中のメニュー（${imp.menus.map((m) => m.menuId).join('・')}）にある商品です。価格の変更方法（価格改定／誤りの訂正）を選んでください`, 409);
  }
  if (imp.needPriceMode && o.priceMode === '誤りの訂正' && !o.reason?.trim()) throw new ApiError('誤りの訂正の理由を入れてください', 400);
  if ((o.reason ?? '').length > 500) throw new ApiError('訂正の理由は500文字以内で入力してください。', 400);
  if (imp.needConfirm && !o.confirm) {
    throw new ApiError(`公開したメニューで注文している拠点に出せなくなります（${[...new Set(imp.branches.map((b) => b.branchId))].join('・')}）。確認してから保存してください`, 409);
  }
  return {
    imp,
    after(next: Product) {
      const at = nowStamp();
      const note: string[] = [];
      if (imp.needPriceMode && o.priceMode === '誤りの訂正') {
        /* 今のメニューの写しを直す・代替品（差替）の請求の単価を直す */
        for (const m of imp.menus) {
          const cur = r.get<MonthlyMenu>('dm.order.menus', m.menuId)!;
          r.put<MonthlyMenu>('dm.order.menus', m.menuId, {
            ...cur, prices: { ...(cur.prices ?? {}), [id]: priceSnap(r, next, at) },
            log: [{ at, by, what: `${id} の販売価格を誤りの訂正で ${prev.priceYen} → ${next.priceYen} に変更（${o.reason!.trim()}）` }, ...(cur.log ?? [])],
          });
        }
        const months = imp.menus.map((m) => m.menuId);
        for (const ord of r.list<ProductOrder>('dm.order.orders').filter((x) => months.includes(x.cycleMonth) && x.lines.some((l) => l.kind === '差替' && l.altOf === id))) {
          r.put<ProductOrder>('dm.order.orders', ord.id, { ...ord, lines: ord.lines.map((l) => (l.kind === '差替' && l.altOf === id ? { ...l, billPrice: next.priceYen } : l)) });
        }
        for (const l of r.list<DeliveryLine>('dm.delivery.lines').filter((x) => x.kind === '差替' && x.substitutedFrom === id)) {
          const d = r.get<Delivery>('dm.delivery.deliveries', l.deliveryId);
          if (d && months.includes(d.cycleMonth)) r.put<DeliveryLine>('dm.delivery.lines', l.id, { ...l, billPrice: next.priceYen });
        }
        note.push(`誤りの訂正（${o.reason!.trim()}）`);
      } else if (imp.needPriceMode) note.push('価格改定（次のメニューから）');
      if (imp.needConfirm) note.push(`注文している拠点に出せなくなる変更を確認（${[...new Set(imp.branches.map((b) => b.branchId))].join('・')}）`);
      if (o.notify && imp.needPriceMode) {
        const months = imp.menus.map((m) => m.menuId);
        const bs = [...new Set(r.list<ProductOrder>('dm.order.orders').filter((x) => months.includes(x.cycleMonth) && x.lines.some((l) => l.productId === id)).map((x) => x.branchId))];
        const fix = o.priceMode === '誤りの訂正';
        for (const b of bs) notifyBranch(r, b, {
          templateId: '', title: fix ? `販売価格の訂正（${next.name}）` : `販売価格の改定（${next.name}）`,
          body: fix ? `${next.name} の販売価格を ${prev.priceYen}円 → ${next.priceYen}円 に訂正しました（${o.reason!.trim()}）。${months.join('・')} のご注文・まだ確定していないご請求に使います。`
            : `${next.name} の販売価格を、次に公開するメニューから ${next.priceYen}円 にします（公開中のメニューとご注文は ${prev.priceYen}円 のまま）。`,
          link: { type: '', id: '' },
        });
      }
      return note.join('・');
    },
  };
}

export default defineArea({
  name: 'master',
  seed: () => ({
    'dm.master.plans': toDocs(PLANS),
    'dm.master.models': toDocs(MODELS),
    'dm.master.options': toDocs(OPTIONS),
    'dm.master.discounts': toDocs(DISCOUNTS),
    'dm.master.warehouses': toDocs(WAREHOUSES),
    'dm.master.carriers': toDocs(CARRIERS),
    'dm.master.drivers': toDocs(DRIVERS),
    'dm.master.products': toDocs(PRODUCTS),
    'dm.master.materials': toDocs(MATERIALS),
    'dm.master.troubleTypes': toDocs(TROUBLE_TYPES),
    'dm.master.taxRates': toDocs(TAX_RATES),
    'dm.master.productTags': toDocs(PRODUCT_TAGS),
    'dm.master.productCategories': toDocs(PRODUCT_CATEGORIES),
    /* オプション区分マスタ（オプションマスタの「オプション区分」の選択肢。台帳 F 2026-10-05） */
    'dm.master.optionCategories': toDocs(OPTION_CATEGORIES),
    'dm.master.productHistory': toDocs(PRODUCT_HISTORY),
    /* 自販機の列の構成（機種マスタの自販機ごと。運営の機種マスタ・月間メニューが読む） */
    'dm.master.vmLayouts': toDocs(VM_LAYOUTS),
    /* 委託配送先の ES配送費（委託配送先詳細の「ES配送費」タブ。CSV取込・CSV出力で直す） */
    'dm.master.carrierEsFees': toDocs(CARRIER_ES_FEES),
    /* 取引先のマスタ（仕入先・委託配送先・倉庫・配送スタッフ）の変更履歴（lib/domain/partnerHistory.ts） */
    'dm.master.partnerHistory': toDocs(PARTNER_HISTORY),
  }),
  queries: {
    /** 税率の選択肢（used＝使っている数・uses＝使っているもの。全画面の税率ドロップダウン） */
    taxRates: (r) => taxRateOpts(r),
    /** 一覧：list({ kind: 'carriers' }) */
    list: (r, { kind, includeDeleted }: { kind: MasterKind; includeDeleted?: boolean }) =>
      /* オプション・値引きの削除済は既定で出さない（選択肢に出さない・課題 4-9） */
      r.list<{ status?: string }>(kindOf(kind)).filter((x) => includeDeleted || !['options', 'discounts'].includes(kind) || x.status !== '削除済'),
    get(r, { kind, id }: { kind: MasterKind; id: string }) {
      const x = r.get(kindOf(kind), id);
      if (!x) throw new ApiError(`${kind} の ${id} が見つかりません`, 404);
      return x;
    },
    /** 委託配送会社のドライバー（委託配送先Web のスタッフ管理） */
    drivers: (r, args?: { carrierId?: string }) => drivers(r).filter((d) => !args?.carrierId || d.carrierId === args.carrierId),
    /** 商品の変更履歴（新しい順。商品マスタ詳細の「変更履歴」タブ） */
    productHistory: (r, { productId }: { productId: string }) =>
      r.list<ProductHistory>('dm.master.productHistory').filter((h) => h.productId === productId).sort((a, b) => b.at.localeCompare(a.at) || b.id.localeCompare(a.id)),
    /** 商品の変更の影響（価格の変更方法を選ぶ・出せなくなる拠点の確認）。patch＝変えたい項目 */
    productImpact: (r, { productId, patch }: { productId: string; patch: Partial<Product> }) => productImpact(r, productId, patch),
    /** 仕入先の取扱商品（仕入先サイトのプロフィール・運営の仕入先マスタ）：商品の仕入先にその会社がある商品 */
    supplierProducts: (r, { supplierId }: { supplierId: string }) =>
      products(r).filter((p) => p.status !== '削除済' && p.suppliers.some((s) => s.supplierId === supplierId)),
    /** 申込・受付の画面が読むマスタ（プラン・機種・オプション・値引き。lib/domain/formMaster.ts） */
    formMaster: (r) => formMasterOf(r),
    /** プラン・資材・オプション・値引きの変更履歴（新しい順。kind＝plans／materials／options／discounts） */
    history: (r, { kind, id }: { kind: MasterKind; id: string }) =>
      r.list<AuditLog>('dm.account.audit').filter((x) => x.target === `${kind}:${id}`).reverse(),
    /** 自販機の列の構成（機種ID ごと） */
    vmLayouts: (r) => r.list<VmLayout>('dm.master.vmLayouts'),
    vmLayout: (r, { id }: { id: string }) => r.get<VmLayout>('dm.master.vmLayouts', id) ?? null,
  },
  actions: {
    /** ドライバーの登録（委託配送先は自社のドライバーだけ）。ID は DR＋5桁の続き番号 */
    addDriver(r, { by, ...d }: Omit<Driver, 'id' | 'status'> & { by?: string }) {
      if (!r.get('dm.master.carriers', d.carrierId)) throw new ApiError('委託配送会社が見つかりません', 404);
      if (!d.name.trim() || !d.email.trim()) throw new ApiError('氏名とメールアドレスを入れてください（アカウントの発行にメールが要ります）', 400);
      const max = Math.max(...drivers(r).map((x) => Number(x.id.slice(2))));
      const id = `DR${String(max + 1).padStart(5, '0')}`;
      const next: Driver = { ...d, id, status: '有効' };
      r.put('dm.master.drivers', id, next);
      recordPartner(r, 'drivers', id, null, next as unknown as Record<string, unknown>, by);
      return next;
    },
    /** ドライバーの基本情報の更新（委託配送先は自社のドライバーだけ。ID・所属は変えない） */
    updateDriver(r, { by, hist, ...a }: { id: string; carrierId?: string; by?: string; hist?: string } & Partial<Pick<Driver, 'name' | 'kana' | 'tel' | 'email' | 'status'>>) {
      const d = r.get<Driver>('dm.master.drivers', a.id);
      if (!d) throw new ApiError(`ドライバーが見つかりません（${a.id}）`, 404);
      if (a.carrierId && d.carrierId !== a.carrierId) throw new ApiError('ほかの会社のドライバーは変えられません', 403);
      const { id: _id, carrierId: _c, ...patch } = a;
      const next: Driver = { ...d, ...Object.fromEntries(Object.entries(patch).filter(([, v]) => v !== undefined)) };
      if (!next.name.trim()) throw new ApiError('氏名を入れてください', 400);
      r.put('dm.master.drivers', a.id, next);
      syncLock(r, 'drivers', a.id, d.status, next.status, by);
      recordPartner(r, 'drivers', a.id, d as unknown as Record<string, unknown>, next as unknown as Record<string, unknown>, by, hist);
      return next;
    },
    /** ドライバーの状態の変更（委託配送先は自社のドライバーだけ） */
    setDriverStatus(r, { id, status, carrierId, by, hist }: { id: string; status: Driver['status']; carrierId?: string; by?: string; hist?: string }) {
      const d = r.get<Driver>('dm.master.drivers', id);
      if (!d) throw new ApiError(`ドライバーが見つかりません（${id}）`, 404);
      if (carrierId && d.carrierId !== carrierId) throw new ApiError('ほかの会社のドライバーは変えられません', 403);
      const next = { ...d, status };
      r.put('dm.master.drivers', id, next);
      syncLock(r, 'drivers', id, d.status, status, by);
      recordPartner(r, 'drivers', id, d as unknown as Record<string, unknown>, next as unknown as Record<string, unknown>, by, hist);
      return next;
    },
    /**
     * マスタの1件の更新（運営のマスタ管理：プラン・機種・オプション・値引き・商品）。ID は変えない。
     * 商品は変更履歴を残す（by＝変更者のアカウントID・'CSV取込' など。省くと system）。
     * 公開したメニューにある商品の販売価格・税率を変えるときは priceMode（＋誤りの訂正は reason）、出せなくなる拠点があるときは confirm（productImpact）
     */
    update(r, { kind, id, patch, by, hist, ...opts }: { kind: MasterKind; id: string; patch: Record<string, unknown>; by?: string; /** 取引先のマスタの変更履歴の文（'' は記録しない） */ hist?: string } & UpdateOpts) {
      const k = kindOf(kind);
      const x = r.get<Record<string, unknown>>(k, id);
      if (!x) throw new ApiError(`${kind} の ${id} が見つかりません`, 404);
      let next: Record<string, unknown> = { ...x, ...patch, id };
      if (typeof next.name === 'string' && !next.name.trim()) throw new ApiError('名前を入れてください', 400);
      if (kind === 'products') {
        checkProductRefs(r, patch as Partial<Product>);
        next = normalizeProduct(next as Product);
        /* 状態だけを変える（削除・無効）ときは必須の確かめをしない（英語名が空の既存の商品も削除・無効にできる） */
        if (Object.keys(patch).some((k) => k !== 'status')) { syncCategory(r, next as unknown as Product); checkProductRequired(next as unknown as Product); checkProductJans(r, next as unknown as Product); }
        const chk = productUpdate(r, id, x as unknown as Product, patch as Partial<Product>, opts, by ?? 'system');
        r.put(k, id, next);
        const extra = chk.after(next as unknown as Product);
        const what = diffText(x, next);
        if (what) addHistory(r, id, what + (extra ? `（${extra}）` : ''), by ?? 'system', { items: diffItems(x, next), ...(extra ? { reason: extra } : {}) });
        const { confirmedInvoices, unconfirmed, branches } = chk.imp;
        return opts.priceMode === '誤りの訂正' ? { ...next, priceFix: { confirmedInvoices, unconfirmed }, affectedBranches: branches } : { ...next, affectedBranches: branches };
      }
      if (kind === 'materials') {
        /* 資材マスタ：削除済は変えられない（E36）・使用中は削除できない（E259）・一部だけ変えるときは入っている項目だけ確かめる。保存のたびに版を進める（E31） */
        const mp = patch as Partial<Material>;
        if (matOf(x as unknown as Material).status === '削除済') throw new ApiError('削除済みのため編集できません。', 400);
        if (mp.status === '削除済') checkMaterialDelete(r, id);
        checkMaterial(r, mp, { id });
        if (typeof next.name === 'string') next.name = next.name.trim();
        next.ver = nextVersion(x.ver as string | undefined);
      }
      if (kind === 'optionCategories') { checkOptionCategory(r, id, patch as Partial<OptionCategory>); if (typeof next.name === 'string') next.name = next.name.trim(); }
      r.put(k, id, next);
      recordMaster(r, kind, id, masterDiff(r, x, next), by, kind === 'materials' ? materialItems(x, next) : undefined);
      recordPartner(r, kind, id, x, next, by, hist);
      syncLock(r, kind, id, x.status, next.status, by);
      return next;
    },
    /** マスタの登録（運営のマスタ管理）。ID は画面の決まり（頭＋6桁）で採番して渡す。商品は変更履歴に「データ登録」 */
    create(r, { kind, data, by, hist }: { kind: MasterKind; data: { id: string; name?: string } & Record<string, unknown>; by?: string; hist?: string }) {
      const k = kindOf(kind);
      if (!data.id || r.get(k, data.id)) throw new ApiError(`${kind} の ${data.id} はもうあります`, 409);
      if (typeof data.name === 'string' && !data.name.trim()) throw new ApiError('名前を入れてください', 400);
      if (kind === 'products') {
        checkProductRefs(r, data as Partial<Product>);
        const p = normalizeProduct(data as unknown as Product);
        syncCategory(r, p);
        checkProductRequired(p);
        checkProductJans(r, p);
        r.put(k, data.id, p);
        addHistory(r, data.id, 'データ登録', by ?? 'system');
        return p;
      }
      if (kind === 'materials') {
        /* 資材マスタの登録：全項目を確かめる（必須・文字数・重複・範囲）。状態は 有効、版は 1 から */
        checkMaterial(r, data as Partial<Material>, { id: data.id, full: true });
        data = { ...data, name: String(data.name ?? '').trim(), status: '有効', ver: '1' };
      }
      if (kind === 'optionCategories') { checkOptionCategory(r, data.id, data as Partial<OptionCategory>); data = { ...data, name: String(data.name ?? '').trim() }; }
      r.put(k, data.id, data);
      recordMaster(r, kind, data.id, 'データ登録', by);
      recordPartner(r, kind, data.id, null, data, by, hist);
      return data;
    },
    /**
     * プランの初期備品（コースごとの資材と数・仮登録の資材の初期セット）とプランに含む資材（1サイクル月あたりの数。超えた分は資材の単価で請求）を保存する。
     * 変更は履歴に残る。初期備品は全コースに1つ以上（check.run）。数は 0以上の整数・同じ資材を二重に入れない
     */
    setPlanMaterials(r, { planId, initialItems, includedMaterials, by }: { planId: string; initialItems: NonNullable<Plan['initialItems']>; includedMaterials: NonNullable<Plan['includedMaterials']>; by?: string }) {
      const p = r.get<Plan>('dm.master.plans', planId);
      if (!p) throw new ApiError(`プランが見つかりません（${planId}）`, 404);
      const courses = p.prices.map((x) => x.course);
      const qtyOk = (q: number) => Number.isInteger(q) && q >= 0 && q <= 9999;
      const seen = new Set<string>();
      for (const it of initialItems) {
        if (!courses.includes(it.course)) throw new ApiError(`このプランにないコースです（${it.course}）`, 400);
        if (!r.get('dm.master.materials', it.materialId)) throw new ApiError(`資材が見つかりません（${it.materialId}）`, 400);
        if (!qtyOk(it.qty)) throw new ApiError('数は 0以上の整数で入れてください', 400);
        if (seen.has(`${it.course}|${it.materialId}`)) throw new ApiError(`初期備品に同じ資材が重なっています（${it.course}・${it.materialId}）`, 400);
        seen.add(`${it.course}|${it.materialId}`);
      }
      for (const c of courses) if (!initialItems.some((x) => x.course === c && x.qty > 0)) throw new ApiError(`${c} の初期備品（資材の初期セット）を1つ以上入れてください`, 400);
      const seen2 = new Set<string>();
      for (const it of includedMaterials) {
        if (!r.get('dm.master.materials', it.materialId)) throw new ApiError(`資材が見つかりません（${it.materialId}）`, 400);
        if (!qtyOk(it.qty)) throw new ApiError('数は 0以上の整数で入れてください', 400);
        if (seen2.has(it.materialId)) throw new ApiError(`プランに含む資材に同じ資材が重なっています（${it.materialId}）`, 400);
        seen2.add(it.materialId);
      }
      const next: Plan = { ...p, initialItems: initialItems.filter((x) => x.qty > 0), includedMaterials /* 0 も残す（0＝無料なし。入れない＝プランの食数） */ };
      r.put('dm.master.plans', planId, next);
      recordMaster(r, 'plans', planId, masterDiff(r, p as unknown as Record<string, unknown>, next as unknown as Record<string, unknown>), by);
      return next;
    },
    /** 資材マスタの単価（税抜・既定 0円＝無料）と税率。プランの数量を超えた資材の請求に使う。変更は履歴に残る */
    setMaterialPrice(r, { id, priceYen, taxRateId, by }: { id: string; priceYen: number; taxRateId: string; by?: string }) {
      const m = r.get<Material>('dm.master.materials', id);
      if (!m) throw new ApiError(`資材が見つかりません（${id}）`, 404);
      checkMaterial(r, { priceYen, taxRateId });
      const next: Material = { ...m, priceYen, taxRateId, ver: nextVersion(m.ver) };
      r.put('dm.master.materials', id, next);
      recordMaster(r, 'materials', id, masterDiff(r, m as unknown as Record<string, unknown>, next as unknown as Record<string, unknown>), by, materialItems(m as unknown as Record<string, unknown>, next as unknown as Record<string, unknown>));
      return next;
    },

    /* ---------- 商品タグ（メニューの画面で足す・消す）・税率（商品マスタのドロップダウンで足す・消す） ---------- */

    /** 商品タグを足す（同じ名前はもうある＝409）。ID は TG＋3桁の続き番号 */
    addProductTag(r, { name }: { name: string }) {
      const n = name?.trim();
      if (!n) throw new ApiError('タグの名前を入れてください', 400);
      if (n.length > 60) throw new ApiError('タグ名は60文字以内で入力してください。', 400);
      const all = r.list<ProductTag>('dm.master.productTags');
      if (all.some((t) => t.name === n)) throw new ApiError(`タグ名（${n}）は既に登録されています。`, 409);
      /* 商品タグは約20個まで（RD-MN-102） */
      if (all.length >= PRODUCT_TAG_MAX) throw new ApiError(`商品タグは ${PRODUCT_TAG_MAX}個までです（使っていないタグを消してから足してください）`, 409);
      const id = `TG${String(Math.max(0, ...all.map((t) => Number(t.id.slice(2)) || 0)) + 1).padStart(3, '0')}`;
      const next: ProductTag = { id, name: n };
      r.put('dm.master.productTags', id, next);
      return next;
    },
    /** 商品タグを消す（月間メニューの商品で使っていれば消せない＝409。商品マスタには商品タグを持たない：台帳 F 2026-10-08） */
    removeProductTag(r, { id }: { id: string }) {
      const t = r.get<ProductTag>('dm.master.productTags', id);
      if (!t) throw new ApiError(`タグが見つかりません（${id}）`, 404);
      /* 月間メニューの商品ごとのタグ（その月のタグ）で使っていても消せない */
      const inMenus = r.list<MonthlyMenu>('dm.order.menus').filter((m) => (m.items ?? []).some((x) => typeof x !== 'string' && x.tags?.includes(t.name))).map((m) => m.id);
      if (inMenus.length) throw new ApiError(`タグ「${t.name}」は月間メニュー（${inMenus.join('・')}）で使っているので消せません`, 409);
      r.remove('dm.master.productTags', id);
      return { ok: true };
    },
    /** 税率を足す（label 例 '8%（軽減）'、rate＝％）。同じ表示はもうある＝409。ID は TX＋2桁の続き番号 */
    addTaxRate(r, { label, rate }: { label: string; rate: number }) {
      const l = label?.trim();
      if (!l) throw new ApiError('税率の表示を入れてください', 400);
      if (!(typeof rate === 'number' && rate >= 0 && rate < 100)) throw new ApiError('税率（％）を正しく入れてください', 400);
      const all = r.list<TaxRate>('dm.master.taxRates');
      if (all.some((t) => t.label === l)) throw new ApiError(`税率「${l}」はもうあります`, 409);
      const id = `TX${String(Math.max(0, ...all.map((t) => Number(t.id.slice(2)) || 0)) + 1).padStart(2, '0')}`;
      const next: TaxRate = { id, label: l, rate };
      r.put('dm.master.taxRates', id, next);
      return next;
    },
    /**
     * 税率を直す（表示・％。台帳 E 2026-10-05：ドロップダウンで足す・直す・消す）。表示は同じものがあれば 409。
     * ％は使っていない税率だけ直せる（使っている税率の％を変えると、商品・プランなどの税がさかのぼって変わるため。新しい税率を足して切り替える）
     */
    updateTaxRate(r, { id, label, rate }: { id: string; label: string; rate: number }) {
      const t = r.get<TaxRate>('dm.master.taxRates', id);
      if (!t) throw new ApiError(`税率が見つかりません（${id}）`, 404);
      const l = label?.trim();
      if (!l) throw new ApiError('税率の表示を入れてください', 400);
      if (!(typeof rate === 'number' && rate >= 0 && rate < 100)) throw new ApiError('税率（％）を正しく入れてください', 400);
      if (r.list<TaxRate>('dm.master.taxRates').some((x) => x.id !== id && x.label === l)) throw new ApiError(`税率「${l}」はもうあります`, 409);
      if (rate !== t.rate) {
        const uses = taxUses(r, id);
        if (uses.length) throw new ApiError(`税率「${t.label}」は使っているので％は変えられません（${uses.join('・')}）。新しい税率を足して切り替えてください（表示だけなら直せます）`, 409);
      }
      const next: TaxRate = { ...t, label: l, rate };
      r.put('dm.master.taxRates', id, next);
      return next;
    },
    /** 税率を消す（使っている商品・プラン・機種・オプション・値引き・委託の支払額・仕入単価があれば消せない＝409。lib/domain/tax.ts の taxUses） */
    removeTaxRate(r, { id }: { id: string }) {
      const t = r.get<TaxRate>('dm.master.taxRates', id);
      if (!t) throw new ApiError(`税率が見つかりません（${id}）`, 404);
      const uses = taxUses(r, id);
      if (uses.length) throw new ApiError(`税率「${t.label}」は使っているので消せません（${uses.join('・')}）`, 409);
      r.remove('dm.master.taxRates', id);
      return { ok: true };
    },
    /** 自販機の列の構成を保存（機種マスタにある自販機だけ） */
    setVmLayout(r, { id, maker, lanes }: { id: string; maker: string; lanes: VmLayout['lanes'] }) {
      const m = r.get<Model>('dm.master.models', id);
      if (!m || m.category !== '自販機') throw new ApiError(`自販機の機種が見つかりません（${id}）`, 404);
      const v: VmLayout = { id, maker, lanes };
      r.put('dm.master.vmLayouts', id, v);
      return v;
    },
  },
});
