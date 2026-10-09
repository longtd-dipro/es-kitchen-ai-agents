import { today } from '@/lib/supplier/dates';
import type { ChildContract, Course, Delivery, DeliveryLine, Loan, Model, NutKey, Nutrition, Product, ProductCourse, ProductSupplier, ShortClass } from './types';

/*
 * 商品の決まり（純粋な関数。seed・area・各サイトの fromDomain から使う）。
 *   ・メニューに出す商品：拠点の便の倉庫（子契約 channel.warehouseId）が商品のピッキング倉庫にある、
 *     子契約のコースが商品のコースにある、ESライト（自販機）は拠点の自販機（機種）に入る商品だけ
 *   ・短消費期限の表示（ショート 3日以内／1週間以内、セミショート 1週間〜1ヶ月程度）
 *   ・買取（企業独自価格）の金額＝届けた数 × 企業の価格
 */

/** 特定原材料がないときに入れる値（特定原材料は必須。2026-10-05 決定・台帳 F） */
export const ALLERGEN_NONE = 'なし';

/** 子契約のコース → 商品のコース */
export const productCourseOf = (c: Course): ProductCourse => (c === 'ESスタンダード' ? 'スタンダード' : 'ライト');

/** 短消費期限の表示（対象外は ''）。法人Web・運営のメニューの「短消費期限」の値 */
export function shortLabel(p: Pick<Product, 'shelfLife'>): string {
  const s = p.shelfLife;
  if (!s || s.shortClass === '対象外') return '';
  if (s.shortClass === 'セミショート') return '1週間〜1ヶ月程度';
  return s.esUnit === '日' && s.esValue <= 3 ? '3日以内' : '1週間以内';
}

/** ES の期限の表示（例 5日・6ヶ月） */
export const shelfText = (p: Pick<Product, 'shelfLife'>) => (p.shelfLife ? `${p.shelfLife.esValue}${p.shelfLife.esUnit}` : '');

/**
 * ES の期限の日（お届け日 ＋ ES の賞味期限または消費期限。2026/10/03 回答：法人に見せ・発注と棚卸（廃棄の提案）に使う）。
 * 期限がない（0）商品は ''。ヶ月は暦の月で足す（月末をこえるときはその月の末日）
 */
export function esExpiryOn(p: Pick<Product, 'shelfLife'> | undefined, deliverOn: string): string {
  const s = p?.shelfLife;
  if (!s || !(s.esValue > 0) || !/^\d{4}\/\d{2}\/\d{2}$/.test(deliverOn)) return '';
  const [y, m, d] = deliverOn.split('/').map(Number);
  const dt = s.esUnit === '日' ? new Date(y, m - 1, d + s.esValue) : new Date(y, m - 1 + s.esValue, Math.min(d, new Date(y, m - 1 + s.esValue + 1, 0).getDate()));
  return `${dt.getFullYear()}/${String(dt.getMonth() + 1).padStart(2, '0')}/${String(dt.getDate()).padStart(2, '0')}`;
}

/** 選択中の仕入先 */
export const selectedSupplier = (p: Pick<Product, 'suppliers'>) => p.suppliers.find((s) => s.selected) ?? p.suppliers[0];

/* ---------------- 商品名（2026/10/03 決定：管理名・公開名（日本語）・公開名（英語）・仕入先向けの名前） ---------------- */

/** 管理名（社内。運営の一覧は品番と並べて出す）。空なら公開名 */
export const mgmtNameOf = (p: Pick<Product, 'name' | 'mgmtName'>) => p.mgmtName?.trim() || p.name;
/** 仕入先向けの名前（仕入先サイト・発注・仕入先への CSV）。空なら公開名 */
export const supplierNameOf = (p: Pick<Product, 'name' | 'supplierItemName'>) => p.supplierItemName?.trim() || p.name;

/* ---------------- 仕入単価の改定（RD-MN-076） ---------------- */

/** その日の仕入単価（税抜）：改定（nextCost）の適用開始日からは新しい単価 */
export const costOn = (s: Pick<ProductSupplier, 'unitCostYen' | 'nextCost'> | undefined, day = today()) =>
  !s ? 0 : s.nextCost && s.nextCost.from && day >= s.nextCost.from ? s.nextCost.unitCostYen : s.unitCostYen;
/** 適用開始日を過ぎた改定を unitCostYen に入れ替える（商品を保存するとき） */
export const settleCosts = (sups: ProductSupplier[], day = today()): ProductSupplier[] =>
  sups.map((s) => {
    if (!s.nextCost) return s;
    if (!s.nextCost.from || day >= s.nextCost.from) { const { nextCost, ...rest } = s; return { ...rest, unitCostYen: nextCost.unitCostYen }; }
    return s;
  });

/* ---------------- 短消費期限の区分（RD-MN-097：ES の期限の日数から自動で選ぶ） ---------------- */

/**
 * ES の期限 → 短消費期限の区分の初期値。変換ルールは議事録で「要確認」のため【仮】：7日以内＝ショート、30日以内＝セミショート、ほか（ヶ月）＝対象外。
 * 商品マスタの画面は日数を入れたときにこの値を選ぶ（運営が手で変えられる）
 */
export const SHORT_DAYS = { short: 7, semi: 30 } as const;
export function shortClassOf(esValue: number, esUnit: '日' | 'ヶ月'): ShortClass {
  if (!(esValue > 0) || esUnit !== '日') return '対象外';
  return esValue <= SHORT_DAYS.short ? 'ショート' : esValue <= SHORT_DAYS.semi ? 'セミショート' : '対象外';
}

/* ---------------- 栄養成分（RD-MN-118：1食当たり＝100g当たり × 1食当たり内容量 で自動計算。5項目は範囲 from〜to：台帳 F 2026-10-08） ---------------- */

/** 範囲で持つ5項目（画面・CSV の並び） */
export const NUT_KEYS: NutKey[] = ['kcal', 'protein', 'fat', 'carbs', 'salt'];
/** 5項目の名前と単位 */
export const NUT_LABEL: Record<NutKey, [string, string]> = { kcal: ['エネルギー', 'kcal'], protein: ['たんぱく質', 'g'], fat: ['脂質', 'g'], carbs: ['炭水化物', 'g'], salt: ['食塩相当量', 'g'] };
/** 栄養成分の値の上限（0〜9,999・小数1桁。台帳 F 2026-10-07 Q15） */
export const NUT_MAX = 9999;
/** 1食当たり内容量の範囲（1〜9,999。台帳 F 2026-10-08） */
export const SERVING_MAX = 9999;

const r1 = (n: number) => Math.round(n * 10) / 10;
/** to（to のない前の形のデータは from と同じ） */
export const nutTo = (n: Pick<Nutrition, NutKey> & { to?: Partial<Record<NutKey, number>> }): Record<NutKey, number> =>
  Object.fromEntries(NUT_KEYS.map((k) => [k, typeof n.to?.[k] === 'number' ? n.to[k]! : n[k]])) as Record<NutKey, number>;
/** 1食当たりの栄養成分（100g当たりの値 × 内容量 ÷ 100。from・to それぞれ。小数1桁） */
export function perServingOf(n: Nutrition): Nutrition {
  const k = (Number(n.servingG) || 0) / 100;
  const to = nutTo(n);
  return {
    servingG: Number(n.servingG) || 0, kcal: r1(n.kcal * k), protein: r1(n.protein * k), fat: r1(n.fat * k), carbs: r1(n.carbs * k), salt: r1(n.salt * k), other: n.other,
    to: Object.fromEntries(NUT_KEYS.map((x) => [x, r1(to[x] * k)])) as Record<NutKey, number>,
  };
}
/** 範囲の表示（例 50〜60。同じなら 50） */
export const nutRange = (n: Nutrition, k: NutKey) => { const t = nutTo(n)[k]; return t === n[k] ? `${n[k]}` : `${n[k]}〜${t}`; };

/* ---------------- JAN（複数。先頭が主 JAN：台帳 F 2026-10-08） ---------------- */

/** JAN の数の上限（台帳 F 2026-10-08 ④：Claude 案・hong 確認待ち） */
export const JAN_MAX = 10;
/** JAN コード1件：8〜13桁の数字（RD-MN-069） */
export const JAN_RE = /^\d{8,13}$/;
/** 商品の JAN（jans のない前の形のデータは jan だけ） */
export const jansOf = (p: Pick<Product, 'jan'> & { jans?: string[] }): string[] => (p.jans?.length ? p.jans : p.jan ? [p.jan] : []);

/* ---------------- 自販機コラム（RD-MN-129：シングル・ダブルの両方をまたぐ登録はできない） ---------------- */

/** シングルとダブルの両方のコラムを選んでいるか */
export const crossesFrames = (columns: string[]) => columns.some((c) => c.startsWith('シングル')) && columns.some((c) => c.startsWith('ダブル'));

/** 拠点に置いている自販機（貸出中の機種のうち自販機） */
export function vmModelsOf(loans: Loan[], models: Model[], branchId: string): string[] {
  return loans.filter((l) => l.branchId === branchId && l.status !== '回収済')
    .map((l) => models.find((m) => m.id === l.modelId)).filter((m): m is Model => !!m && m.category === '自販機').map((m) => m.id);
}

/** 自販機に入るか：自販機コラムがあり、拠点の自販機（わからないときは問わない）に対応している */
export const vmFits = (p: Product, vmModelIds: string[]) =>
  p.vending.columns.length > 0 && (vmModelIds.length === 0 || vmModelIds.some((id) => p.vending.models.includes(id)));

/** 商品を拠点の便に出せるか（メニューに入っているか・注文の設定は見ない） */
export function sellable(p: Product, a: { course: Course; temp: string; warehouseId: string; vmModelIds: string[] }): boolean {
  if (p.status === '削除済') return false;
  /* 冷凍の便は冷凍の商品だけ、ほかの便は冷凍でない商品だけ */
  if (a.temp === '冷凍' ? p.temp !== '冷凍' : p.temp === '冷凍') return false;
  if (!p.pickWarehouseIds.includes(a.warehouseId)) return false;
  if (!p.courses.includes(productCourseOf(a.course))) return false;
  if (a.course === 'ESライト（自販機）' && !vmFits(p, a.vmModelIds)) return false;
  return true;
}

/* ---------------- 買取（企業独自価格） ---------------- */

export type BuyoutRow = { productId: string; qty: number; unitYen: number; amountYen: number };
export type Buyout = { childContractId: string; rows: BuyoutRow[]; totalYen: number; missing: string[] };

/** 届けたことになる配送の状態（納品済・一部納品済・確認中は届けた数） */
const DONE: Delivery['status'][] = ['納品済', '一部納品済', '確認中'];

/**
 * 買取の金額（税込）：子契約の配送（分割・トラブルの子も含む）の届けた数 × 企業の価格。
 * 調整数（サービスで足した数：DeliveryLine.serviceQty）は請求しないので届けた数から引く（受付簿 #251・#272）。
 * 通常価格（従量）の子契約は rows が空・0円（売れた数で精算するので、棚卸・アプリの売上から出す）。
 * missing＝企業の価格がない品番（請求できない）
 */
export function buyoutOf(cc: ChildContract, deliveries: Delivery[], lines: DeliveryLine[]): Buyout {
  const out: Buyout = { childContractId: cc.id, rows: [], totalYen: 0, missing: [] };
  if (cc.pricing?.billing !== '買取') return out;
  const ids = new Set(deliveries.filter((d) => d.childContractId === cc.id && DONE.includes(d.status)).map((d) => d.id));
  const qty = new Map<string, number>();
  for (const l of lines) if (ids.has(l.deliveryId)) qty.set(l.productId, (qty.get(l.productId) ?? 0) + Math.max(0, (l.deliveredQty ?? 0) - (l.serviceQty ?? 0)));
  for (const [productId, q] of qty) {
    const unit = cc.pricing.prices[productId];
    if (unit == null) { out.missing.push(productId); continue; }
    out.rows.push({ productId, qty: q, unitYen: unit, amountYen: q * unit });
  }
  out.rows.sort((a, b) => a.productId.localeCompare(b.productId));
  out.totalYen = out.rows.reduce((s, r) => s + r.amountYen, 0);
  return out;
}
