import { netTotal, taxBuckets, taxTotal } from '@/lib/domain/invoiceTax';
import type { DocRepo } from '@/lib/ops/core/area';
import { INIT_REASON, PULL_REASON } from '@/lib/domain/lifecycle';
import report, { hasStockCheck } from '@/lib/domain/areas/report';
import { altLabel, tripOf } from '@/lib/domain/alt';
import { slotOf } from '@/lib/domain/calendar';
import { unitPrice } from '@/lib/domain/menu';
import { feesFor } from '@/lib/domain/snapshot';
import { anchorOf, finalBillMonth, pendingAdjustments } from '@/lib/domain/adjust';
import { deductibleOf, MAT_EXTRA_OPTION, optionRate, welfarePerMeal } from '@/lib/domain/charges';
import { rateOf } from '@/lib/domain/tax';
import type {
  Branch, Carrier, ChildContract, Contract, Corp, Cycle, DeliveryReport, Delivery, DeliveryLine, Driver, Invoice as DInvoice, InvoiceLine, Material, MaterialOrder, Option, Plan, Product, ProductOrder, StockCheck,
} from '@/lib/domain/types';
import { addM } from './logic';
import type { AdjLine, Br, CashRow, Co, InvLine, Invoice, MonthSnap, Prod, StockRow } from './types';

/*
 * 共通データ（lib/domain・dm.*）から、請求の画面の形（Co・Br・Invoice・商品）を作る。
 *   法人＝dm.org.corps、拠点（親契約）＝dm.org.branches・contracts・childContracts、前払いの費目＝子契約とプラン・オプション・値引きのマスタ、
 *   在庫＝dm.report.stockChecks（申告がまだなら棚卸の下書き＝前回の数・届けた数）と配送の報告の廃棄、現金＝配送の報告の集金、
 *   請求書＝dm.billing.invoices、商品＝dm.master.products
 * 共通データにない、運営の月次の確定の流れ（①②の確定・内訳の確定・価格調整・③ 調整・リードタイムの上書き・棚卸の取り込みのデモ）は
 * 運営の billing.br（拠点ID）・billing.co（法人ID）にあり、BrState・CoState として受け取る。
 */

/**
 * 「確定」したときの金額の写し（影響一覧 A6・決定 7-1 Q2）。確定のあいだはマスタ・子契約・在庫・集金が変わってもこの値で計算する。確定解除で消える。
 *   fix＝① 前払いの費目（fixOK のとき）、act＝② 実績精算の元（在庫の行・商品の単価・現金の集金・棚卸の申告。actOK のとき）。m＝締め月
 */
export type Frozen = {
  fix?: { m: string; at: string; fixLines: Br['fixLines']; planId: string; plan: string; qty: number };
  act?: { m: string; at: string; rows: StockRow[]; prices: Record<number, number>; cashRows: CashRow[]; filed: boolean; stockDay: string; by: string; altRows?: Br['altRows']; optRows?: Br['optRows'] };
};
/** 運営だけが持つ拠点の月次の状態（billing.br。id＝拠点ID） */
export type BrState = { id: string; fixOK?: boolean; actOK?: boolean; actParts?: Br['actParts']; adjMode?: Br['adjMode']; adjYen?: number; adj?: AdjLine[]; leadOv?: number | null; filed?: boolean; frozen?: Frozen; actLater?: string };
/** 運営だけが持つ法人の状態（billing.co。id＝法人ID） */
export type CoState = { id: string; confirmed?: boolean };
/** 共通データの請求書に、運営だけが持つ印（再請求なし・送信エラー・再発行のつながり） */
export type InvFlag = Partial<Pick<Invoice, 'rqWd' | 'unpaidAt' | 'sendErr' | 'retried' | 'reissueOf' | 'reissuedTo'>>;

/** 品番 ↔ 画面の商品の番号（M005 ↔ 5） */
export const prodNo = (id: string) => Number(id.slice(1));
export const prodId = (n: number) => 'M' + String(n).padStart(3, '0');

/**
 * 商品と単価（税込）。単価はその締め月（前月21日〜当月20日）に届けた便の月間メニューの販売価格の写し（menu.prices・影響一覧 A1）。
 * 2つのサイクルにまたがるときは、その商品を多く届けたサイクルのメニュー（同じなら後のサイクル）。届けていない商品は締め日のサイクルのメニュー。
 * メニューに写しがない商品だけ商品マスタの価格（unitPrice）
 */
export function prodsOf(r: DocRepo, month?: string): Prod[] {
  const ps = r.list<Product>('dm.master.products');
  /* 税率は商品マスタ（実績精算・代替品の行。2026/10/03 回答：8% 固定にしない） */
  const t = (p: Product) => rateOf(r, p.taxRateId, 8);
  if (!month) return ps.map((p) => ({ id: prodNo(p.id), n: p.name, list: p.priceYen, t: t(p) }));
  const [from, to] = periodOf(month);
  const ds = new Map(r.list<Delivery>('dm.delivery.deliveries').filter((d) => d.cycleMonth && d.deliverOn >= from && d.deliverOn <= to && ['納品済', '一部納品済'].includes(d.status)).map((d) => [d.id, d]));
  const qty = new Map<string, Map<string, number>>();
  for (const l of r.list<DeliveryLine>('dm.delivery.lines')) {
    const d = ds.get(l.deliveryId);
    if (!d) continue;
    const m = qty.get(l.productId) ?? qty.set(l.productId, new Map()).get(l.productId)!;
    m.set(d.cycleMonth, (m.get(d.cycleMonth) ?? 0) + (l.deliveredQty ?? 0));
  }
  const endCycle = slotOf(r.list<Cycle>('dm.delivery.cycles'), to)?.cycle.id ?? month;
  return ps.map((p) => {
    const q = [...(qty.get(p.id) ?? new Map<string, number>())].sort((a, b) => b[1] - a[1] || b[0].localeCompare(a[0]));
    return { id: prodNo(p.id), n: p.name, list: unitPrice(r, q[0]?.[0] ?? endCycle, p.id), t: t(p) };
  });
}

/** 締め月の期間（前月21日〜当月20日） */
const periodOf = (m: string): [string, string] => [`${addM(m, -1).replace('-', '/')}/21`, `${m.replace('-', '/')}/20`];
const COURSE: Record<string, Br['course']> = { ESスタンダード: 'std', 'ESライト（冷蔵庫）': 'light', 'ESライト（自販機）': 'vm' };
const CT_ST: Record<Contract['status'], Br['ct']['st']> = { 仮登録: 'draft', 有効: 'active', 解約手続き中: 'cancelling', 停止: 'stopped', 利用休止: 'paused', 終了: 'stopped', 取消: 'stopped' };

/** 請求先の設定（請求先＝この拠点 なら親契約の設定、ほかは法人の設定） */
const billingOf = (corp: Corp | undefined, ct: Contract) => (ct.billTo === 'この拠点' && ct.billing ? ct.billing : corp?.billing);

/* ---------- 法人 ---------- */
export function corpsFor(r: DocRepo, brs: Br[], st: (id: string) => CoState | undefined): Co[] {
  return r.list<Corp>('dm.org.corps').filter((c) => brs.some((b) => b.co === c.id)).map((c) => ({
    id: c.id, name: c.name, code: c.id, issue: c.billing.invoiceUnit === 'まとめて発行（法人1通）' ? 'merged' : 'branch',
    lead: -c.billing.lead, confirmed: !!st(c.id)?.confirmed, due: c.billing.dueRule, billOne: c.billing.billonePayerId, pay: c.billing.payMethod,
  }));
}

/* ---------- 拠点（親契約） ---------- */

/**
 * 子契約の前払いの費目（プランの基本料金 10%・福利厚生 8%・オプション・値引き）＝子契約の ① 費目の写し（fees）。
 * いまのプラン・オプション・値引きのマスタは読まない（v2.3「生成時に金額を固める」・影響一覧 A2）
 */
function fixLinesOf(r: DocRepo, cc: ChildContract, anchor?: string): Br['fixLines'] {
  /* 年払い（anchor＝起算月）：① 費目と月額の費用は起算月の請求書に12サイクル分（Y）。単発の費用はその月だけ（M）・S3-1 */
  const y = (monthly: boolean) => (anchor && monthly ? { tim: 'Y' as const, anchor } : { tim: 'M' as const });
  return [
    /* 福利厚生の適用 OFF（既定）：プラン料金の2行は請求書で1行にまとめる（28-150・台帳 E 2026-10-05） */
    ...feesFor(r, cc).lines.map((l, i) => ({ n: l.name, a: l.amountYen, t: l.taxRate, id: `${cc.branchId}-L${i + 1}`, ...y(true), ...(l.src === 'plan' && !cc.welfareOn ? { mg: `plan:${cc.id}` } : {}) })),
    /* 子契約の追加の費目（設備の異動・入れ替えの配送・お試し設備の差額・違約金など。単発はその子契約の月だけ・課題 3-11） */
    ...(cc.extras ?? []).map((x, i) => ({ n: `${x.name}（${x.kind}）`, a: x.amountYen, t: x.taxRate, id: `${cc.branchId}-X${i + 1}`, ...y(x.kind === '月額') })),
  ];
}

/**
 * 子契約の ① 固定額（前払い）の合計・税抜＝請求書の前払いの行（値引き〔お試しキャンペーン割引など〕を引いた額）の合計。
 * 子契約一覧・詳細の「当月請求額」はこれを使う（請求の画面の固定額と同じ計算。台帳 F 運営A QC2）。
 * 年払いの起算月の12ヶ月分は掛けない（毎月の額）
 */
export const fixedYenOf = (r: DocRepo, cc: ChildContract): number => fixLinesOf(r, cc).reduce((s, l) => s + l.a, 0);

/**
 * 共通データの調整明細（申請の承認で自動でできた・まだ請求書に載っていないもの。TL-7 A）→ ③ 調整の単発の行。
 * 次に作る請求書（この締め月）に載せる。前払いを確定（25日の確定）したあとにできたものは翌月の請求書へ（仕様整理 §3）
 */
function dmAdjLines(r: DocRepo, branchId: string, month: string, frozenAt?: string, finalM?: string): AdjLine[] {
  /* 解約した拠点は、調整明細（違約金・前払いの返金など）を最終請求書（解約日を含む締め月）にまとめる（2026/10/03 決定） */
  const at = (x: { at: string }) => (finalM && finalM > month ? finalM : frozenAt && x.at > frozenAt ? addM(month, 1) : month);
  return pendingAdjustments(r, branchId).flatMap((a) => a.lines.map((l): AdjLine => ({
    n: l.name, a: l.amountYen, t: l.taxRate, kind: 'adj', rep: 'once', m: at(a), dm: a.id,
    ...((a.kind === '設備の費用' && a.reason === PULL_REASON) || (a.kind === '初期費用' && a.reason === INIT_REASON) ? { dmEdit: true } : {}),
  })));
}

/**
 * 代替品の実績精算の行（課題 3-11）：締めの期間にお届けする便の 差替＝元の商品のメニューの単価 × 数、補償＝0円の行（お客様に見える）、除外＝出さない。
 * 便の日付は追加配送ならその配送、ほかは便（子契約の枠）の配送のお届け日
 */
function altRowsOf(r: DocRepo, branchId: string, m: string): NonNullable<Br['altRows']> {
  const [from, to] = periodOf(m);
  const name = (id: string) => r.get<Product>('dm.master.products', id)?.name ?? id;
  /* 税率は元の商品の税率（商品マスタ） */
  const t = (id: string) => rateOf(r, r.get<Product>('dm.master.products', id)?.taxRateId, 8);
  return r.list<ProductOrder>('dm.order.orders').filter((o) => o.branchId === branchId).flatMap((o) => o.lines.filter((l) => l.kind === '差替' || l.kind === '補償').flatMap((l) => {
    const d = l.deliveryId ? r.get<Delivery>('dm.delivery.deliveries', l.deliveryId) : tripOf(r, o.childContractId, l.slot);
    if (!d || ['取消', '中止'].includes(d.status) || d.deliverOn < from || d.deliverOn > to) return [];
    const a = l.kind === '補償' ? 0 : l.qty * (l.billPrice ?? 0);
    return [{ n: `${name(l.productId)} ×${l.qty}　${altLabel(l, name)}（${d.deliverOn.slice(5)} お届け・${l.altId}）`, a, t: t(l.altOf ?? l.productId), altId: l.altId ?? '' }];
  }));
}

/**
 * 単発のオプションの行（締めの期間＝前月21日〜当月20日に注文した資材の注文。その締めの請求書（後払い）に1回だけ）：
 *   同じサイクル月の2回目からの資材便（OP000036 資材の追加配送・金額と税率はオプションマスタ）、
 *   プランの数量を超えた資材（資材の単価 × 超えた数・注文したときの単価の写し excess。2026/10/03 回答：両方とる）
 */
function optRowsOf(r: DocRepo, branchId: string, m: string): NonNullable<Br['optRows']> {
  const [from, to] = periodOf(m);
  const op = r.get<Option>('dm.master.options', MAT_EXTRA_OPTION);
  const mat = (id: string) => r.get<Material>('dm.master.materials', id)?.name ?? id;
  return r.list<MaterialOrder>('dm.delivery.materialOrders')
    .filter((x) => x.branchId === branchId && x.kind === 'regular' && x.status !== '取消' && x.orderedAt.slice(0, 10) >= from && x.orderedAt.slice(0, 10) <= to)
    .flatMap((x) => [
      ...(x.paid && op ? [{ n: `${op.name}（単発・${x.orderedAt.slice(5, 10)} 注文 ${x.id}）`, a: op.amountYen, t: optionRate(r, op), src: `${MAT_EXTRA_OPTION}・資材の注文 ${x.id}（同じサイクル月の2回目から有料）` }] : []),
      ...(x.excess ?? []).map((e) => ({ n: `資材の追加分：${mat(e.materialId)} ×${e.qty}（プランの数量を超えた分・${x.id}）`, a: e.unitYen * e.qty, t: e.taxRate, src: `資材マスタの単価 ${e.unitYen}円 × ${e.qty}（プランの数量を超えた分）` })),
    ]).filter((x) => x.a > 0);
}

/** 配送の報告のうち、この拠点・締め月のもの */
function reportsIn(r: DocRepo, branchId: string, m: string) {
  const [from, to] = periodOf(m);
  const ds = new Map(r.list<Delivery>('dm.delivery.deliveries').filter((d) => d.branchId === branchId && d.deliverOn >= from && d.deliverOn <= to).map((d) => [d.id, d]));
  return r.list<DeliveryReport>('dm.report.deliveryReports').filter((x) => x.status === '完了' && ds.has(x.deliveryId));
}

/** 棚卸の行 → 画面の在庫の行 */
const stockRows = (sc: StockCheck): StockRow[] =>
  sc.rows.map((x) => ({ id: prodNo(x.productId), prev: x.prev, deliv: x.delivered, sold: x.sold, waste: x.disposed, appr: 0, real: x.actual }));

/**
 * 当月の在庫：申告があれば棚卸、なければ下書き（前回の数・届けた数）と配送の報告の廃棄。運営の在庫調整は appr に足す。
 * 販売はアプリの販売数（棚卸の appSold・下書きの appSold）。理論在庫＝前回＋納品（お届け中で届いた数を含む）−販売−廃棄±在庫調整（課題 2-1 の差分率の「理論」）。
 * appSold のない古い棚卸は、申告から計算した販売数のまま
 */
function currentRows(r: DocRepo, branchId: string, m: string, sc: StockCheck | undefined, adjs: { prod: number; delta: number }[]): StockRow[] {
  let rows: StockRow[];
  if (sc) rows = sc.rows.map((x) => ({ id: prodNo(x.productId), prev: x.prev, deliv: x.delivered + (x.arrived ?? 0), sold: x.appSold ?? x.sold, waste: x.disposed, appr: 0, real: x.actual }));
  else {
    const sheet = report.queries.stockSheet(r, { branchId, period: m });
    const waste = new Map<string, number>();
    reportsIn(r, branchId, m).forEach((x) => x.stock.forEach((s) => waste.set(s.productId, (waste.get(s.productId) ?? 0) + s.disposed)));
    rows = sheet.rows.map((x) => ({ id: prodNo(x.productId), prev: x.prev, deliv: x.delivered, sold: x.appSold, waste: waste.get(x.productId) ?? 0, appr: 0, real: 0 }));
  }
  adjs.forEach((a) => {
    const row = rows.find((x) => x.id === a.prod) ?? (rows.push({ id: a.prod, prev: 0, deliv: 0, sold: 0, waste: 0, appr: 0, real: 0 }), rows[rows.length - 1]);
    row.appr += a.delta;
  });
  return rows;
}

/** 現金の集金（配送の報告） */
function cashRowsOf(r: DocRepo, branchId: string, m: string): CashRow[] {
  return reportsIn(r, branchId, m).filter((x) => x.cash).map((x) => ({
    d: x.completedAt.slice(0, 10), no: x.deliveryId, drv: r.get<Driver>('dm.master.drivers', x.driverId)?.name ?? x.driverId,
    plan: x.cash!.expectedYen, got: x.cash!.collectedYen,
  }));
}

/** 集金管理（簡易版・台帳 F 2026-10-05）の1行：配送の報告の現金の集金を、締め月の全拠点でならべる。状態（未請求／請求済／入金済）は持たない */
export type CashListRow = { d: string; no: string; br: string; brName: string; co: string; coName: string; drvId: string; drv: string; carrierId: string; carrier: string; plan: number; got: number; note: string };
export function cashListOf(r: DocRepo, m: string): CashListRow[] {
  const [from, to] = periodOf(m);
  const ds = new Map(r.list<Delivery>('dm.delivery.deliveries').filter((d) => d.deliverOn >= from && d.deliverOn <= to).map((d) => [d.id, d]));
  return r.list<DeliveryReport>('dm.report.deliveryReports').filter((x) => x.status === '完了' && !!x.cash && ds.has(x.deliveryId)).map((x) => {
    const d = ds.get(x.deliveryId)!, b = r.get<Branch>('dm.org.branches', d.branchId), c = b?.corpId ? r.get<Corp>('dm.org.corps', b.corpId) : undefined;
    const drv = r.get<Driver>('dm.master.drivers', x.driverId), car = drv ? r.get<Carrier>('dm.master.carriers', drv.carrierId) : undefined;   /* ドライバーの所属先の配送会社（自社＝DE00000） */
    return {
      d: x.completedAt.slice(0, 10), no: x.deliveryId, br: d.branchId, brName: b?.name ?? d.branchId, co: b?.corpId ?? '', coName: c?.name ?? '',
      drvId: x.driverId, drv: drv?.name ?? x.driverId, carrierId: drv?.carrierId ?? '', carrier: car?.name ?? drv?.carrierId ?? '', plan: x.cash!.expectedYen, got: x.cash!.collectedYen, note: x.cash!.note ?? '',
    };
  }).sort((a, b) => b.d.localeCompare(a.d) || a.no.localeCompare(b.no));
}

/** 集金管理で選べる月：現金の集金（配送の報告）がある実績精算の月を新しい順に（当月は画面側で足す。台帳 F 2026-10-08） */
export function cashMonthsOf(r: DocRepo): string[] {
  const ds = new Map(r.list<Delivery>('dm.delivery.deliveries').map((d) => [d.id, d.deliverOn]));
  const ms = new Set<string>();
  for (const x of r.list<DeliveryReport>('dm.report.deliveryReports')) {
    const on = ds.get(x.deliveryId);
    if (x.status !== '完了' || !x.cash || !on) continue;
    const [y, m, d] = on.split(/[/-]/).map(Number);
    ms.add(addM(`${y}-${String(m).padStart(2, '0')}`, d >= 21 ? 1 : 0));   /* 21日〜翌20日が 翌月の実績精算 */
  }
  return [...ms].sort().reverse();
}

/** 集金管理の全行（選べる月すべて。月は実績精算の月 yyyy-mm）。月は検索の条件で絞る */
export function cashAllOf(r: DocRepo): (CashListRow & { month: string })[] {
  return cashMonthsOf(r).flatMap((m) => cashListOf(r, m).map((x) => ({ ...x, month: m })));
}

/** 確定した過去の月（共通データの請求書のうち、この拠点の行があるもの） */
function monthsOf(r: DocRepo, b: Branch, ct: Contract, ccs: ChildContract[], invs: DInvoice[]): MonthSnap[] {
  return invs.filter((i) => i.status !== '取消' && i.lines.some((l) => l.branchId === b.id)).map((i) => {
    const ls = i.lines.filter((l) => l.branchId === b.id), sum = (k: InvoiceLine['kind']) => ls.filter((l) => l.kind === k).reduce((s, l) => s + l.amountYen, 0);
    const cc = ccs.find((c) => c.cycleMonth === i.cycleMonth);
    return {
      no: `${ct.id}-${i.cycleMonth.replace('-', '')}`, m: addM(i.issueMonth, -1), tgt: i.cycleMonth, actPeriod: i.actualPeriod,
      adv: sum('前払い'), arr: sum('後払い'), adj: sum('調整'), by: '運営', at: i.issuedOn, inv: i.id,
      snap: { planId: cc?.planId ?? '', plan: r.get<Plan>('dm.master.plans', cc?.planId ?? '')?.name ?? '', prName: '', lines: ls.filter((l) => l.kind === '前払い').map((l) => ({ n: l.name, a: l.amountYen, t: l.taxRate })) },
    };
  });
}

/** 請求の対象の拠点（有効・休止中・解約手続き中の親契約があり、子契約があるもの） */
export function branchesFor(r: DocRepo, month: string, st: (id: string) => BrState | undefined, adjs: { br: string; prod: number; delta: number }[]): Br[] {
  const corps = r.list<Corp>('dm.org.corps'), invs = r.list<DInvoice>('dm.billing.invoices'), raw = r.list<ChildContract>('dm.org.childContracts'), all = raw.filter((c) => !c.canceled);
  const out: Br[] = [];
  for (const b of r.list<Branch>('dm.org.branches')) {
    const ct = r.list<Contract>('dm.org.contracts').find((c) => c.branchId === b.id);
    /* 解約した拠点は、解約日を含む実績精算の締め月まで（その月の請求書が最終請求・2026/10/03） */
    const lastM = ct?.endOn && ['解約手続き中', '終了'].includes(ct.status) ? finalBillMonth(ct.endOn) : '';
    if (!ct || !(['有効', '利用休止', '解約手続き中'].includes(ct.status) || (ct.status === '終了' && lastM >= month))) continue;
    if (lastM && lastM < month) continue;
    const corp = corps.find((c) => c.id === b.corpId), bill = billingOf(corp, ct), s = st(b.id);
    const ccs = all.filter((c) => c.contractId === ct.id).sort((x, y) => x.cycleMonth.localeCompare(y.cycleMonth));
    const tgt = addM(month, 1 - (bill?.lead ?? -1));
    const cc = ccs.filter((c) => c.cycleMonth <= tgt).pop() ?? ccs[0];
    if (!cc) continue;
    /*
     * 前払いの対象の月に子契約がない（取り消した＝休止・解約、または作っていない＝お試しが終わった月など）ときは前払いなし。
     * 前の月の子契約の額を出さない（B3：お試し 10・11月だけの拠点に 12月分の前払いが出ていた）
     */
    const noPrepay = !ccs.some((c) => c.cycleMonth === tgt);
    const sc = r.get<StockCheck>('dm.report.stockChecks', `SC-${month}-${b.id}`);
    const past = r.list<StockCheck>('dm.report.stockChecks').filter((x) => x.branchId === b.id && x.period < month);
    const plan = r.get<Plan>('dm.master.plans', cc.planId);
    /* 実績の締め月の子契約のプラン（免責金額・企業負担額はプランマスタ。2026/10/03 回答：プランマスタの設定を効かせる） */
    const actPlan = r.get<Plan>('dm.master.plans', (ccs.find((c) => c.cycleMonth === month) ?? cc).planId) ?? plan;
    const filed = s?.filed ?? !!sc;
    const fz = s?.frozen;
    /* 年払い：起算月（契約開始のサイクル月から12ヶ月ごと）。起算月でない月は「前払い済み（カバー期間中）」 */
    const anchor = bill?.payCycle === '年払い' ? anchorOf(ct.startCycle, tgt) : undefined;
    const fzAt = s?.fixOK && fz?.fix?.m === month ? fz.fix.at : undefined;
    out.push({
      id: b.id, co: b.corpId ?? '', name: b.name, code: b.id, planId: cc.planId, plan: plan?.name ?? cc.planId, fixLines: noPrepay ? [] : fixLinesOf(r, cc, anchor),
      course: COURSE[cc.course] ?? 'light', ship: cc.channels.some((c) => c.serviceForm === 'COOL便') ? 'cool' : 'es', discIds: [],
      emp: b.employees, kind: cc.kind === 'お試しキャンペーン' ? 'trial' : 'normal',
      adjMode: s?.adjMode ?? 'none', adjYen: s?.adjYen ?? 0,
      filed, stockDay: sc?.checkedOn ?? (filed ? '（取り込み）' : '—'),
      by: sc ? (sc.checkedBy.site === 'driver' ? `ES配送便ドライバー（${r.get<Driver>('dm.master.drivers', sc.checkedBy.accountId)?.name ?? sc.checkedBy.accountId}）` : `企業担当者${sc.checkedBy.name ? `（${sc.checkedBy.name}）` : ''}`) : filed ? '企業担当者' : '—',
      rows: currentRows(r, b.id, month, sc, adjs.filter((a) => a.br === b.id)),
      adj: [...(s?.adj ?? []).filter((l) => !l.dm), ...dmAdjLines(r, b.id, month, fzAt, lastM)], fixOK: !!s?.fixOK, actOK: !!s?.actOK, actParts: s?.actParts,
      billTo: ct.billTo, qty: cc.fees?.meals ?? plan?.monthlyMeals ?? 0,
      /* 棚卸なしの拠点（課題 2-1：管理ロス・事務手数料なし。画面は「棚卸なし」） */
      noCheck: !!b.noStockCheck, firstPending: !hasStockCheck(r, b.id, month), altRows: altRowsOf(r, b.id, month), optRows: optRowsOf(r, b.id, month),
      ded: deductibleOf(actPlan), welfare: welfarePerMeal(actPlan), ...(s?.actLater ? { actLater: s.actLater } : {}),
      trialAct: (ccs.find((c) => c.cycleMonth === month) ?? cc).kind === 'お試しキャンペーン',
      /* 事務手数料の判定は25日（台帳 H 2026-10-05）。お客様の入力は20日まで・21〜25日は運営が代理で入れられ、25日までに入れば事務手数料はかからない。25日より後の申告は実績精算に使い、事務手数料はかかる */
      lateFiled: !!sc && sc.checkedOn > `${month.replace('-', '/')}/25`,
      ...(anchor ? { annual: anchor } : {}),
      final: !!lastM && month >= lastM,
      leadOv: s?.leadOv ?? (ct.billTo === 'この拠点' && ct.billing && corp && ct.billing.lead !== corp.billing.lead ? -ct.billing.lead : null),
      cash: cc.app.allowCash, due: bill?.dueRule ?? '請求月の27日', ct: { no: ct.id, st: CT_ST[ct.status] },
      months: monthsOf(r, b, ct, ccs, invs), cashRows: cashRowsOf(r, b.id, month),
      hist: Object.fromEntries(past.map((x) => [x.period, stockRows(x)])),
    });
    /* 確定しているあいだは、確定したときの写しで計算する（マスタ・子契約・在庫・集金が変わっても金額は変わらない） */
    const br = out[out.length - 1];
    if (fz?.fix?.m === month && s?.fixOK) Object.assign(br, { fixLines: fz.fix.fixLines, planId: fz.fix.planId, plan: fz.fix.plan, qty: fz.fix.qty });
    if (fz?.act?.m === month && s?.actOK) Object.assign(br, { rows: fz.act.rows, prices: fz.act.prices, cashRows: fz.act.cashRows, filed: fz.act.filed, stockDay: fz.act.stockDay, by: fz.act.by, ...(fz.act.altRows ? { altRows: fz.act.altRows } : {}), ...(fz.act.optRows ? { optRows: fz.act.optRows } : {}) });
  }
  return out;
}

/** 確定・確定解除に合わせて写しを付け外しする（mutate で保存する前に呼ぶ）。prods＝その締め月の商品の単価 */
export function frozenOf(b: Br, prev: Frozen | undefined, month: string, prods: Prod[], at: string): Frozen | undefined {
  const fix = b.fixOK ? (prev?.fix?.m === month ? prev.fix : { m: month, at, fixLines: b.fixLines, planId: b.planId, plan: b.plan, qty: b.qty }) : undefined;
  const act = b.actOK ? (prev?.act?.m === month ? prev.act : {
    m: month, at, rows: b.rows, cashRows: b.cashRows ?? [], filed: b.filed, stockDay: b.stockDay, by: b.by, altRows: b.altRows ?? [], optRows: b.optRows ?? [],
    prices: Object.fromEntries(b.rows.map((x) => [x.id, b.prices?.[x.id] ?? prods.find((p) => p.id === x.id)?.list ?? 0])),
  }) : undefined;
  return fix || act ? { ...(fix ? { fix } : {}), ...(act ? { act } : {}) } : undefined;
}

/* ---------- 請求書 ---------- */

const ST: Record<DInvoice['status'], Invoice['status']> = { 発行済: 'DISPATCHED', 入金済: 'DISPATCHED', 未入金: 'DISPATCHED', 繰越済: 'CARRIED', 取消: 'WITHDRAWN' };

/** 共通データの請求書 → 画面の請求書。行の br は拠点名（画面は拠点名で拠点と結びつける） */
export function invoiceFor(d: DInvoice, nameOf: (id: string) => string, f: InvFlag = {}): Invoice {
  const lines: InvLine[] = d.lines.map((l) => ({
    br: l.kind === '繰越' && !d.branchId ? '（法人まとめ）' : nameOf(l.branchId), n: l.name, a: l.amountYen, t: l.taxRate, k: l.kind,
    ...(l.fromInvoiceId ? { from: l.fromInvoiceId } : {}), ...(l.cycleTo ? { yTo: l.cycleTo } : {}), ...(l.adjId ? { dm: l.adjId } : {}), ...(l.group ? { mg: l.group } : {}),
  }));
  return {
    id: d.id, m: addM(d.issueMonth, -1), co: d.corpId, br: d.branchId, lines,
    /* 税率ごとの欄（古い DB の請求書は 10%・8% の欄から：lib/domain/invoiceTax.ts） */
    t10: d.subtotal10, t8: d.subtotal8, t0: d.carried, x10: d.tax10, x8: d.tax8, net: netTotal(d), tax: taxTotal(d), tot: d.total, total: d.total,
    by: taxBuckets(d).map((b) => ({ r: b.rate, t: b.subtotal, x: b.tax })),
    status: ST[d.status], unpaid: d.status === '繰越済' || (d.status === '未入金' && !f.rqWd), carriedTo: d.carriedTo || null,
    tgt: d.cycleMonth, due: d.dueOn, issued: d.issuedOn, note: d.note, ...(d.send ? { send: d.send } : {}), ...(d.final ? { final: true } : {}), ...f,
  };
}

/** 画面で発行した請求書 → 共通データに入れる形（合計・税・状態は domain の billing.issue で決める） */
export function issueOf(i: Invoice, idOf: (name: string) => string, actualPeriod: string) {
  return {
    id: i.id, corpId: i.co, branchId: i.br, issueMonth: addM(i.m, 1), issuedOn: i.issued ?? '', dueOn: i.due, cycleMonth: i.tgt, actualPeriod,
    lines: i.lines.map((l): InvoiceLine => ({
      branchId: idOf(l.br) || i.br || idOf(i.lines[0]?.br ?? ''), name: l.n, amountYen: l.a, taxRate: l.t, kind: l.k,
      ...(l.from ? { fromInvoiceId: l.from } : {}), ...(l.yTo ? { cycleTo: l.yTo } : {}), ...(l.dm ? { adjId: l.dm } : {}), ...(l.mg ? { group: l.mg } : {}),
    })),
    carriedTo: '', note: i.note ?? '', ...(i.final ? { final: true } : {}),
  };
}
