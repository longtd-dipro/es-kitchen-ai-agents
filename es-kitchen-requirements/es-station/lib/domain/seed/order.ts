import { menuIds, newItem, recalcItems, baseWeights, baseKindOf, defaultLines } from '../menu';
import { sellable, shortLabel, vmModelsOf } from '../product';
import type { Channel, ChildContract, KariApproval, MonthlyMenu, OrderPref, Product, ProductOrder } from '../types';
import { MODELS, PRODUCTS, TAX_RATES } from './master';
import { SEED_MENU_TAGS } from './products';
import { AVG_TARGET } from './settings';
import { CONTRACTS, LOANS, PAUSES } from './org';

/*
 * 月次注文の見本：月間メニュー・商品注文（拠点×サイクル月）・注文の設定・仮発注の承認。
 * 運営のメニュー管理（lib/ops/menu/seed.ts）と同じ作り：
 *   2026-12＝編集中（自動公開 2026/11/01。新商品 M025〜M027 が公開可能でない・メニューPDF なし・仮発注が未承認 → 公開の条件を満たさない見本）
 *   2026-11＝公開中（10/01〜10/15 受付・PDF あり）／2026-10＝締切済／2026-09＝配送中
 *   11月の注文の状態：本社＝登録済、大阪支店・横浜営業所＝デフォルト（基準注文数のまま）、お試し＝お試し（自動）
 *   12月の注文（先行生成の子契約）：デフォルト（編集中のメニューの基準注文数から。公開のときに作り直す）。2027年1月から先はメニューがないので注文もない
 *   大阪支店の 9/29（9月 C2）・10/13（10月 A2）の便にはデミグラスハンバーグ 2個（シナリオ説明書 ⑦ の代替品設定 ALT-2610-0001 の元）
 * 基準注文数は月の古い順に自動で入れる（lib/domain/menu.ts の recalcItems。前の月までの注文の割合）。
 * 配送の明細（delivery.lines）はこの注文から作る（法人が注文した品目＝倉庫が出す品目＝ドライバーが届ける品目）。
 */

const NEW11 = ['M003', 'M007', 'M009', 'M016', 'M020', 'M024'];
const MENU_IDS = PRODUCTS.filter((p) => Number(p.id.slice(1)) <= 24).map((p) => p.id);
const OLD = MENU_IDS.filter((id) => !NEW11.includes(id));
const NEW12 = ['M025', 'M026', 'M027'];
/* メニューPDF はライト用（冷蔵のみ）とスタンダード用（冷蔵＋冷凍）の2つ（2026-10-05 台帳 F） */
const pdf = (ym: string, at: string): MonthlyMenu['pdfs'] => [
  { name: `${ym.replace('-', '年')}月_月間メニュー_ライト用.pdf`, size: 1243200, uploadedAt: at, kind: 'ライト用' },
  { name: `${ym.replace('-', '年')}月_月間メニュー_スタンダード用.pdf`, size: 1843200, uploadedAt: at, kind: 'スタンダード用' },
];

/** メニューの見本（基準注文数は buildOrderSeed で入れる） */
type MenuSpec = Omit<MonthlyMenu, 'items'> & { ids: string[]; notReady?: string[] };
const MENU_SPECS: MenuSpec[] = [
  { id: '2026-12', status: '編集中', publishOn: '2026/11/01', orderFrom: '2026/11/01', orderTo: '2026/11/15', corpPublish: '自動公開', autoPublishOn: '2026/11/01',
    pdfs: [], publishedAt: '', updatedAt: '2026/10/02 18:20', updatedBy: 'Ad00010',
    ids: MENU_IDS.filter((id) => !['M006', 'M009', 'M019', 'M023'].includes(id)).concat(NEW12), notReady: NEW12 },
  { id: '2026-11', status: '公開中', publishOn: '2026/10/01', orderFrom: '2026/10/01', orderTo: '2026/10/15', corpPublish: '公開', autoPublishOn: '2026/10/01',
    pdfs: pdf('2026-11', '2026/09/28 15:10'), publishedAt: '2026/10/01 00:00', updatedAt: '2026/09/28 15:12', updatedBy: 'Ad00010', ids: MENU_IDS },
  { id: '2026-10', status: '締切済', publishOn: '2026/09/01', orderFrom: '2026/09/01', orderTo: '2026/09/15', corpPublish: '公開', autoPublishOn: '',
    pdfs: pdf('2026-10', '2026/08/27 11:00'), publishedAt: '2026/09/01 09:00', updatedAt: '2026/08/27 11:02', updatedBy: 'Ad00010', ids: OLD },
  { id: '2026-09', status: '配送中', publishOn: '2026/08/01', orderFrom: '2026/08/01', orderTo: '2026/08/15', corpPublish: '公開', autoPublishOn: '',
    pdfs: pdf('2026-09', '2026/07/28 10:30'), publishedAt: '2026/08/01 09:00', updatedAt: '2026/07/28 10:31', updatedBy: 'Ad00010', ids: OLD },
];

/** 仮発注の承認（発注・入荷。メニューの月ごと）。11月は承認済、12月はまだ */
export const KARI_APPROVALS: KariApproval[] = [
  { id: '2026-09', status: '承認', approvedAt: '2026/07/25 16:00', approvedBy: 'Ad00010' },
  { id: '2026-10', status: '承認', approvedAt: '2026/08/25 16:00', approvedBy: 'Ad00010' },
  { id: '2026-11', status: '承認', approvedAt: '2026/09/25 16:00', approvedBy: 'Ad00010' },
  { id: '2026-12', status: '未承認', approvedAt: '', approvedBy: '' },
];

/** 注文の設定（法人Web「注文の設定」。運営の見本 SPREF と同じ） */
export const ORDER_PREFS: OrderPref[] = [
  { id: 'CU00871', categories: null, allowShortLife: true, priceRange: [100, 200], excluded: ['M021'], updatedAt: '2026/09/12 10:20', updatedBy: 'CU00871' },
  { id: 'CU00950', categories: null, allowShortLife: false, priceRange: [100, 200], excluded: [], updatedAt: '2026/09/03 09:00', updatedBy: 'CU00950' },
];

/** 11月の注文の状態（運営の見本 ST11 と同じ。ほかは登録済） */
const ST11: Record<string, ProductOrder['status']> = { CU00643: '登録済', CU00871: 'デフォルト', CU00950: 'デフォルト' };

/** 決まった数を入れる注文の行（注文ID → 便のキー → 品番 → 個数）。差は同じ便のいちばん多い行から引く */
const PIN: Record<string, Record<string, Record<string, number>>> = {
  'O-202609-CU00871': { '冷蔵:C2': { M002: 2 } },
  'O-202610-CU00871': { '冷蔵:A2': { M002: 2 } },
};
function pinLines(id: string, lines: ProductOrder['lines']) {
  for (const [slot, want] of Object.entries(PIN[id] ?? {})) {
    for (const [productId, qty] of Object.entries(want)) {
      const cur = lines.find((l) => l.slot === slot && l.productId === productId);
      const diff = qty - (cur?.qty ?? 0);
      if (!diff) continue;
      const big = lines.filter((l) => l.slot === slot && l.productId !== productId).sort((a, b) => b.qty - a.qty)[0];
      if (!big || big.qty <= diff) continue;
      big.qty -= diff;
      if (cur) cur.qty = qty; else lines.push({ productId, slot, qty });
    }
  }
  return lines;
}

/** 便のキー（温度帯:枠。横浜は同じ枠に冷蔵と冷凍がある） */
export const slotKey = (temp: string, slot: string) => `${temp}:${slot}`;

/** eligible に渡す商品マスタ・拠点の自販機（area からは DocRepo の値、seed からは見本の値） */
export type EligibleCtx = { product: (id: string) => Product | undefined; vmModelIds: string[] };
const seedCtx = (branchId: string): EligibleCtx => ({ product: (id) => PRODUCTS.find((p) => p.id === id), vmModelIds: vmModelsOf(LOANS, MODELS, branchId) });

/**
 * 拠点・便の条件に合うメニューの商品（決定：仕入先 ↔ 商品 ↔ ピッキング倉庫 ↔ メニュー）。
 *   ・便の倉庫（子契約 channel.warehouseId）が商品のピッキング倉庫にある
 *   ・子契約のコース（ライト／スタンダード）が商品のコースにある、ESライト（自販機）は拠点の自販機に入る（lib/domain/product.ts の sellable）
 *   ・冷凍の便は冷凍の商品だけ
 *   ・注文の設定（除く商品・短消費期限）
 */
export function eligible(menu: Pick<MonthlyMenu, 'items'>, cc: ChildContract, ch: Pick<Channel, 'temp' | 'warehouseId'>, pref?: OrderPref, ctx: EligibleCtx = seedCtx(cc.branchId)): Product[] {
  return menuIds(menu).map((id) => ctx.product(id)).filter((p): p is Product => {
    if (!p) return false;
    if (!sellable(p, { course: cc.course, temp: ch.temp, warehouseId: ch.warehouseId, vmModelIds: ctx.vmModelIds })) return false;
    if (pref?.excluded.includes(p.id)) return false;
    if (pref && !pref.allowShortLife && shortLabel(p)) return false;
    return true;
  });
}

/** 数量を品目に割り振る（決まった重みで。合計＝食数） */
export function spread(products: Product[], total: number, seed: number) {
  const pick = products.length > 8 ? products.filter((_, i) => (i + seed) % 2 === 0) : products;
  const w = pick.map((_, i) => 1 + ((i * 7 + seed * 3) % 5));
  const sum = w.reduce((a, b) => a + b, 0);
  const q = w.map((x) => Math.floor((x * total) / sum));
  let rest = total - q.reduce((a, b) => a + b, 0);
  for (let i = 0; rest > 0; i = (i + 1) % q.length, rest--) q[i]++;
  return pick.map((p, i) => ({ productId: p.id, qty: q[i] })).filter((x) => x.qty > 0);
}

const delivers = (contractId: string, cycle: string) => {
  const c = CONTRACTS.find((x) => x.id === contractId)!;
  return ['有効', '解約手続き中', '利用休止'].includes(c.status) && !PAUSES.some((p) => p.contractId === c.id && p.fromCycle <= cycle && cycle <= p.toCycle);
};

const productOf = (id: string) => PRODUCTS.find((p) => p.id === id);

/**
 * メニューと注文を月の古い順に作る：メニューの基準注文数（前の月までの注文の割合）→ その月の注文。
 * デフォルトの注文は基準注文数を便の食数に按分（lib/domain/menu.ts の defaultLines）。登録済・お試しは決まった重みで按分（spread）
 */
export function buildOrderSeed(children: ChildContract[]): { menus: MonthlyMenu[]; orders: ProductOrder[] } {
  const menus: MonthlyMenu[] = [];
  const out: { n: number; o: ProductOrder }[] = [];
  for (const spec of [...MENU_SPECS].sort((a, b) => a.id.localeCompare(b.id))) {
    const { ids, notReady, ...rest } = spec;
    /* 平均単価の目標（メニューごと）：見本は既定の値（公開したメニューは公開時の値で固定） */
    rest.avgTarget = { fr: { ...AVG_TARGET.fr }, vm: { ...AVG_TARGET.vm } };
    const items = ids.map((id, i) => newItem(id, i + 1, { publishable: !notReady?.includes(id), tags: [...(SEED_MENU_TAGS[id] ?? [])], sample: i % 7 === 0 }));
    const menu: MonthlyMenu = { ...rest, items: recalcItems(items, baseWeights(spec.id, ids, productOf, menus, out.map((x) => x.o)), productOf) };
    /* 公開したメニューは公開したときの販売価格の写し（見本は商品マスタの今の値） */
    if (menu.status !== '編集中') {
      menu.prices = Object.fromEntries(ids.map((id) => { const p = productOf(id)!; return [id, { priceYen: p.priceYen, taxRateId: p.taxRateId, rate: TAX_RATES.find((t) => t.id === p.taxRateId)?.rate ?? 0, at: menu.publishedAt }]; }));
      menu.log = [{ at: menu.publishedAt, by: 'Ad00010', what: '公開' }];
    }
    menus.push(menu);
    children.forEach((cc, n) => {
      if (cc.cycleMonth !== menu.id || !delivers(cc.contractId, cc.cycleMonth)) return;
      const pref = ORDER_PREFS.find((p) => p.id === cc.branchId);
      const trial = cc.kind === 'お試しキャンペーン';
      const ahead = menu.status === '編集中';
      const status: ProductOrder['status'] = trial ? 'お試し（自動）' : ahead ? 'デフォルト' : cc.cycleMonth === '2026-11' ? (ST11[cc.branchId] ?? '登録済') : '登録済';
      const lines = status === 'デフォルト'
        ? defaultLines(menu, baseKindOf(cc, pref), cc.channels.flatMap((ch) => ch.slots.map((slot) => ({ key: slotKey(ch.temp, slot), meals: ch.mealsPerDelivery, ids: eligible(menu, cc, ch, pref).map((p) => p.id) }))))
        : cc.channels.flatMap((ch) => ch.slots.flatMap((slot, si) =>
          spread(eligible(menu, cc, ch, pref), ch.mealsPerDelivery, n + si).map((x) => ({ ...x, slot: slotKey(ch.temp, slot) }))));
      pinLines(`O-${cc.cycleMonth.replace('-', '')}-${cc.branchId}`, lines);
      const at = ahead ? '2026/10/01 00:00' : status === 'デフォルト' || trial ? `${menu.orderFrom} 00:00` : `${menu.orderFrom.slice(0, 8)}0${3 + (n % 6)} 10:12`;
      const by = status === 'デフォルト' || trial ? 'system' : cc.branchId;
      out.push({ n, o: {
        id: `O-${cc.cycleMonth.replace('-', '')}-${cc.branchId}`, branchId: cc.branchId, childContractId: cc.id, cycleMonth: cc.cycleMonth, status, lines,
        updatedAt: at, updatedBy: by,
        log: [
          ...(status === '登録済' ? [{ at, by, what: '商品注文を登録', detail: `合計 ${lines.reduce((a, l) => a + l.qty, 0)}個` }] : []),
          ahead
            ? { at, by: 'system', what: '自動注文を作成（子契約の先行生成）', detail: '編集中のメニューの基準注文数から。メニューを公開したときに作り直します' }
            : { at: `${menu.orderFrom} 00:00`, by: 'system', what: trial ? 'お試しのオーダーを作成' : 'オーダー受付開始', detail: trial ? '全商品に按分・法人は参照のみ' : '自動注文（基準注文数）を作成' },
        ],
      } });
    });
  }
  return { menus: menus.reverse(), orders: out.sort((a, b) => a.n - b.n).map((x) => x.o) };
}

export const buildOrders = (children: ChildContract[]) => buildOrderSeed(children).orders;
