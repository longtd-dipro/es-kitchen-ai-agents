import { addDays, nowStamp } from '@/lib/supplier/dates';
import type { Order, OrderRow } from '@/lib/supplier/types';
import {
  ALT, DEM, GROUPS, IN_MENU, MAT_WH, MAT_YM, MATS, MENU, MO, MONTHS, SMP, SUP_BIZ, TODAY, WH, WH_CODE,
  daysBetween, dFmt, iso, lotUp, mat, prod, SLOT, slash, slotDate, slotK, wishDate,
} from './master';
import type { Bill, Group, OrderMeta, Plan, POrder, Prod } from './types';

/*
 * 発注・入荷の計算（純粋な関数）。画面と領域（lib/ops/areas/purchasing.ts）の両方で使う。
 * 発注の状態は発注データ（共通 DB の発注）から計算する。元のデモ（ORD.data）の「発注単位」「短消費期限の行」を、
 * 商品注文管理の数（DEM）と発注データから組み立てる。
 */

/* ===== 必要数（商品注文管理の数＋サンプル枠） ===== */
/** 調整数（サービスで足した数）の必要数。サーバー（purchasing.meta の svc：配送の明細の serviceQty）から画面が入れる。キー＝ym|商品ID|倉庫名|k */
let SVC: Record<string, number> = {};
export const setServiceDemand = (m: Record<string, number> | undefined) => { SVC = m ?? {}; };
/** [注文数, 調整数]。調整数＝見本の値＋共通データの注文の調整数（出荷指示・発注・理論在庫に入れる：受付簿 #252） */
export const dem = (ym: string, pid: string, wh: string, k: number): [number, number] => {
  const [q, a] = DEM[ym]?.[pid]?.[wh]?.[String(k)] ?? [0, 0];
  return [q, a + (SVC[`${ym}|${pid}|${wh}|${k}`] ?? 0)];
};
const split = (total: number, cnt: number) => Array.from({ length: cnt }, (_, i) => Math.floor(total / cnt) + (i < total % cnt ? 1 : 0));
/** 発注の「サンプル枠」：月の件数×対象商品（各1個）を4週・取扱倉庫へ均等に（翌月のメニューだけ・仮置き） */
export function smFrame(ym: string, pid: string, wh: string, k: number) {
  if (ym !== MONTHS[0] || !SMP.flag[pid]) return 0;
  const N = SMP.quota[ym];
  if (!N || k % 7 !== 0 || k > 21) return 0;
  const W = (SMP.wh[pid] ?? []).filter((w) => WH.includes(w));
  const wi = W.indexOf(wh);
  if (wi < 0) return 0;
  return split(split(N, 4)[k / 7], W.length)[wi];
}

export type URow = { k: number; std: number; free: number; smp: number; tmp: number; kari: number; hon: number; wish: string };
export const rNeed = (r: { std: number; free: number; smp: number }) => r.std + r.free + r.smp;
export const uNeed = (rows: URow[]) => rows.reduce((s, r) => s + rNeed(r), 0);
export const uSum = (rows: URow[], key: 'std' | 'kari' | 'hon') => rows.reduce((s, r) => s + r[key], 0);
/** 数量を行に割り振る（必要数の比率。端数は最初の必要数のある行へ） */
export function setQty(rows: URow[], qty: number, key: 'kari' | 'hon') {
  const tot = uNeed(rows);
  rows.forEach((r) => { r[key] = 0; });
  if (!qty || !rows.length) return rows;
  if (!tot) { rows[0][key] = qty; return rows; }
  let left = qty;
  rows.forEach((r) => { const v = Math.floor((qty * rNeed(r)) / tot); r[key] = v; left -= v; });
  (rows.find((r) => rNeed(r) > 0) ?? rows[0])[key] += left;
  return rows;
}
/** 合計をロット（箱）単位に切り上げる（端数は最初の必要数のある行へ）。足した数を返す */
export function roundLot(rows: URow[], lot: number) {
  const t = uSum(rows, 'kari');
  const add = lotUp(t, lot) - t;
  if (add > 0) (rows.find((r) => rNeed(r) > 0) ?? rows[0]).kari += add;
  return add;
}

/* ===== 発注データと発注単位を結びつける ===== */
/** 発注番号の元（出し直したら「元-2」「元-3」…） */
const ordersOf = (orders: POrder[], base: string) => orders.filter((o) => o.no === base || o.no.startsWith(base + '-'));
const nextNo = (base: string, prev: POrder[]) => (prev.length ? `${base}-${prev.length + 1}` : base);
const wishCode = (ym: string, k: number, wish: string) => String(Math.max(0, Math.min(2, daysBetween(wish, addDays(slotDate(ym, k), -1)))));

export type UnitSt = '未発注' | '仮発注済' | '本発注済';
export type Unit = {
  no: number; base: string; from: number; to: number; wh: string; rows: URow[];
  /** いまの発注（キャンセルしたものは prev へ） */
  order?: POrder; prev: POrder[]; st: UnitSt; add?: string;
};
export const unitPo = (ym: string, pid: string, no: number) => `PO-${ym.replace('-', '')}-${pid}-U${String(no).padStart(2, '0')}`;
export const planId = (ym: string, pid: string) => `${ym}|${pid}`;
export const draftKey = (wh: string, k: number) => `${wh}|${k}`;

function rowsFromOrder(ym: string, rows: URow[], o: Order) {
  const by = new Map(o.rows.map((r) => [r.slot, r]));
  rows.forEach((r) => {
    const x = by.get(SLOT(r.k));
    r.wish = x ? wishCode(ym, r.k, x.wish) : '0';
    if (o.hon > 0) r.hon = x?.qty ?? 0;
    else r.kari = x?.qty ?? 0;
  });
  if (o.hon > 0) {
    if (o.kari === o.hon) rows.forEach((r) => { r.kari = r.hon; });
    else setQty(rows, o.kari, 'kari');
  }
}
const unitSt = (o?: POrder): UnitSt => (!o ? '未発注' : o.hon > 0 ? '本発注済' : '仮発注済');

/** 通常商品：発注単位＝サイクル範囲×倉庫（必要数がある倉庫だけ）。追加発注は最後に足す */
export function normalData(ym: string, p: Prod, orders: POrder[], plan?: Plan) {
  const group: Group = plan?.group ?? '4';
  const drafts = plan?.drafts ?? {};
  const units: Unit[] = [];
  const mkRows = (from: number, to: number, w: string) => {
    const rows: URow[] = [];
    for (let k = from; k <= to; k++) {
      const [q, a] = dem(ym, p.id, w, k);
      rows.push({ k, std: q, free: a, smp: smFrame(ym, p.id, w, k), tmp: ym === MONTHS[0] && q >= 4 && k % 9 === 2 ? Math.min(2, q) : 0, kari: 0, hon: 0, wish: '0' });
    }
    return rows;
  };
  GROUPS[group].forEach(([from, to]) => WH.forEach((w) => {
    const rows = mkRows(from, to, w);
    if (!rows.some((r) => rNeed(r) > 0)) return;
    const no = units.length + 1;
    const base = unitPo(ym, p.id, no);
    const period = `${SLOT(from)}〜${SLOT(to)}`;
    const all = ordersOf(orders, base).filter((o) => o.wh === w && o.period === period && !o.add);
    const cur = all.filter((o) => o.ans !== 'キャンセル').pop();
    const prev = all.filter((o) => o !== cur);
    if (cur) rowsFromOrder(ym, rows, cur);
    else rows.forEach((r) => { const d = drafts[draftKey(w, r.k)]; if (d) { r.kari = d.kari ?? 0; r.wish = d.wish ?? '0'; } });
    units.push({ no, base, from, to, wh: w, rows, order: cur, prev, st: unitSt(cur) });
  }));
  /* 追加発注（オーダー締切の後に増えた分・決定 Q5） */
  const pre = `PO-${ym.replace('-', '')}-${p.id}-U`;
  orders.filter((o) => o.no.startsWith(pre) && o.add && o.ans !== 'キャンセル').forEach((o) => {
    const [a, b] = o.period.split('〜');
    const from = slotK(a);
    const to = slotK(b ?? a);
    const rows = mkRows(from, to, o.wh);
    rowsFromOrder(ym, rows, o);
    units.push({ no: units.length + 1, base: o.no, from, to, wh: o.wh, rows, order: o, prev: [], st: unitSt(o), add: o.add });
  });
  return { group, units, locked: units.some((u) => u.st !== '未発注' && !u.add) };
}

export type LineSt = '未発注' | 'エラー' | '仮発注済' | '本発注済';
export type Line = { i: number; k: number; wh: string; std: number; free: number; need: number; kari: number; hon: number; wish: string; bb: string; base: string; order?: POrder; prev: POrder[]; st: LineSt };
export const linePo = (ym: string, pid: string, wh: string, k: number) => `PO-${ym.replace('-', '')}-${pid}-${WH_CODE[wh]}${SLOT(k)}`;
/** 希望消費期限 − 顧客納品日（日） */
export const remain = (ym: string, l: { k: number; bb: string }) => (l.bb ? daysBetween(slotDate(ym, l.k), slash(l.bb)) : null);
/** 保証日数を満たす希望消費期限（顧客納品日＋保証日数） */
export const bbOK = (ym: string, p: Prod, k: number) => iso(addDays(slotDate(ym, k), p.g));

/** 短消費期限：1倉庫×1顧客納品日＝1発注データ */
export function shortData(ym: string, p: Prod, orders: POrder[], plan?: Plan) {
  const drafts = plan?.drafts ?? {};
  const lines: Line[] = [];
  WH.forEach((w) => {
    for (let k = 0; k < 28; k++) {
      const [q, a] = dem(ym, p.id, w, k);
      if (q + a <= 0) continue;
      const base = linePo(ym, p.id, w, k);
      const all = ordersOf(orders, base);
      const cur = all.filter((o) => o.ans !== 'キャンセル').pop();
      const l: Line = { i: 0, k, wh: w, std: q, free: a, need: q + a, kari: 0, hon: 0, wish: '0', bb: '', base, order: cur, prev: all.filter((o) => o !== cur), st: '未発注' };
      if (cur) {
        l.kari = cur.kari;
        l.hon = cur.hon;
        l.bb = iso(cur.wishBB ?? '');
        l.wish = cur.rows[0] ? wishCode(ym, k, cur.rows[0].wish) : '0';
        l.st = cur.hon > 0 ? '本発注済' : '仮発注済';
      } else {
        const d = drafts[draftKey(w, k)];
        if (d) { l.kari = d.kari ?? 0; l.wish = d.wish ?? '0'; l.bb = d.bb ?? ''; }
        const rm = remain(ym, l);
        if (rm !== null && rm < p.g) l.st = 'エラー';
      }
      lines.push(l);
    }
  });
  /* 商品追加で足したメニュー外の行と、追加発注で足した行（台帳 I・2026-10-07：短消費期限商品の追加発注は行を足す） */
  orders.filter((o) => o.pid === p.id && o.ym === ym && (o.offMenu || o.add) && o.type === '短消費期限' && o.ans !== 'キャンセル').forEach((o) => {
    const k = o.rows[0] ? slotK(o.rows[0].slot) : 0;
    lines.push({
      i: 0, k, wh: o.wh, std: 0, free: 0, need: o.kari, kari: o.kari, hon: o.hon, wish: o.rows[0] ? wishCode(ym, k, o.rows[0].wish) : '0', bb: iso(o.wishBB ?? ''),
      base: o.no, order: o, prev: [], st: o.hon > 0 ? '本発注済' : '仮発注済',
    });
  });
  lines.sort((a, b) => a.k - b.k || WH.indexOf(a.wh) - WH.indexOf(b.wh));
  lines.forEach((l, i) => { l.i = i; });
  return { lines };
}

/** 1商品の集計（オーダー数＝注文数の合計、必要数＝注文数＋調整数＋サンプル枠） */
export type Sum = { need: number; order: number; kari: number; hon: number; n: number; nKari: number; nHon: number; nNone: number; nErr: number };
export function poSum(ym: string, p: Prod, orders: POrder[], plan?: Plan): Sum {
  if (!p.short) {
    const { units } = normalData(ym, p, orders, plan);
    const sts = units.map((u) => u.st);
    return {
      need: units.reduce((s, u) => s + uNeed(u.rows), 0), order: units.reduce((s, u) => s + uSum(u.rows, 'std'), 0),
      kari: units.filter((u) => u.st !== '未発注').reduce((s, u) => s + uSum(u.rows, 'kari'), 0),
      hon: units.filter((u) => u.st === '本発注済').reduce((s, u) => s + uSum(u.rows, 'hon'), 0),
      n: units.length, nKari: sts.filter((s) => s === '仮発注済').length, nHon: sts.filter((s) => s === '本発注済').length, nNone: sts.filter((s) => s === '未発注').length, nErr: 0,
    };
  }
  const { lines } = shortData(ym, p, orders, plan);
  const sts = lines.map((l) => l.st);
  return {
    need: lines.reduce((s, l) => s + l.need, 0), order: lines.reduce((s, l) => s + l.std, 0),
    kari: lines.filter((l) => ['仮発注済', '本発注済'].includes(l.st)).reduce((s, l) => s + l.kari, 0),
    hon: lines.filter((l) => l.st === '本発注済').reduce((s, l) => s + l.hon, 0),
    n: lines.length, nKari: sts.filter((s) => s === '仮発注済').length, nHon: sts.filter((s) => s === '本発注済').length,
    nNone: sts.filter((s) => s === '未発注' || s === 'エラー').length, nErr: sts.filter((s) => s === 'エラー').length,
  };
}
export function poStatus(s: Sum) {
  if (!s.n) return '未発注';
  if (s.nHon === s.n) return '本発注済';
  if (s.nNone === s.n) return '未発注';
  if (s.nNone === 0) return s.nHon ? '一部本発注' : '仮発注済';
  return '一部仮発注';
}

/* ===== 発注データ1件ごとの見え方（発注一覧の「発注データごと」・発注データ詳細） ===== */
export type HonPart = { eta: string; dlv: string; qty: number; box: number };
export type HonInfo = { st: '—' | '承認待ち' | '承認済'; at?: string; parts?: HonPart[]; box?: number };
export type Rec = {
  no: string; ym: string; pid: string; name: string; pn: string; type: '通常' | '短消費期限' | '資材'; sup: string; wh: string; period: string; from: number;
  kari: number; hon: number; qty: number; amt: number; st: '仮発注済' | '本発注済'; st2: string; ansSt: string; recvSt: string; recvDate: string;
  eta: string; ship: string; carrier: string; slip: string; bbOut: string; bb: string; at: string; hon_: HonInfo; box: number; bill: Bill | '—';
  alerts: number; kind: string; order: POrder;
};

/** 本発注の承認（仕入先が納品日・入荷箱数を入れて承認するまで出荷できない） */
export function honInfo(o: Order): HonInfo {
  if (!(o.hon > 0)) return { st: '—' };
  const done = o.honAck || o.ans === '出荷済' || o.recv === '入荷済';
  if (!done) return { st: '承認待ち', at: '' };
  const parts = (o.parts.length ? o.parts : [{ eta: o.eta, qty: o.hon } as Order['parts'][number]]).map((x) => ({
    eta: x.eta || '', dlv: x.dlv || (x.eta ? addDays(x.eta, 1) : ''), qty: x.qty, box: Number(x.box) || Math.ceil(x.qty / 6),
  }));
  return { st: '承認済', at: o.honAckAt || '', parts, box: parts.reduce((t, x) => t + x.box, 0) };
}
const isBiz = (d: string) => { const w = new Date(iso(d) + 'T12:00:00').getDay(); return w !== 0 && w !== 6; };
/** 本発注から営業日24時間ごとに仕入先へ送ったアラートの回数 */
export function alertsOf(o: Order) {
  if (!(o.hon > 0) || o.ans === 'キャンセル' || o.ans === '受注不可' || honInfo(o).st !== '承認待ち') return 0;
  const from = (o.honAt || o.orderedAt).slice(0, 10);
  const t = TODAY();
  if (SUP_BIZ[o.sup] === 'はい') return Math.max(0, daysBetween(from, t));
  let cnt = 0;
  let d = from;
  while (d < t) { d = addDays(d, 1); if (d <= t && isBiz(d)) cnt++; }
  return cnt;
}

export function toRec(o: POrder, meta?: OrderMeta): Rec {
  const isMat = o.type === '資材';
  const m = isMat ? mat(o.pid) : undefined;
  const p = isMat ? undefined : prod(o.pid);
  const st = o.hon > 0 ? '本発注済' : '仮発注済';
  const qty = o.hon > 0 ? o.hon : o.kari;
  const st2 = o.ans === 'キャンセル' ? '取消済' : o.ans === '受注不可' ? '受注不可' : st;
  const recvSt = o.recv === '入荷済' ? '入荷済' : '未入荷';
  const hon_ = honInfo(o);
  const from = o.rows.length && o.rows[0].slot !== '—' ? Math.min(...o.rows.map((r) => slotK(r.slot))) : 0;
  const bill: Bill | '—' = meta?.bill ?? (st === '本発注済' ? '未照合' : '—');
  return {
    no: o.no, ym: o.ym, pid: o.pid, name: (isMat ? m?.name : p?.name) ?? o.name, pn: o.name, type: o.type, sup: o.sup, wh: o.wh, period: o.period, from,
    /* 金額：本発注の仕入単価の写しがあればそれ（マスタを変えても過去の発注は変わらない） */
    kari: o.kari, hon: o.hon, qty, amt: Math.round(qty * (o.unitCostYen ?? (isMat ? m?.cost : p?.cost) ?? 0)), st, st2,
    ansSt: o.ans === 'キャンセル' ? '—' : o.ans, recvSt, recvDate: o.recvDate,
    eta: o.eta, ship: o.ship, carrier: o.carrier, slip: o.slip, bbOut: o.bb, bb: o.wishBB ?? '', at: o.honAt || o.orderedAt,
    hon_, box: hon_.box ?? 0, bill, alerts: alertsOf(o), kind: o.offMenu ? 'メニュー外' : o.add ? '追加発注' : o.type, order: o,
  };
}

/* ===== 新しい発注データを作る ===== */
const blank = (at: string): Omit<Order, 'sup' | 'no' | 'type' | 'pid' | 'name' | 'ym' | 'wh' | 'period' | 'kari' | 'rows' | 'lot'> => ({
  hon: 0, unit: '個', ans: '納期回答待ち', orderedAt: at, parts: [], honAck: true, honAt: '', honAckAt: '', recv: '', recvDate: '', seen: false, re: null,
  comment: '', eta: '', ship: '', carrier: '', slip: '', bb: '', method: '',
});
export const unitRows = (ym: string, rows: URow[], key: 'kari' | 'hon'): OrderRow[] =>
  rows.filter((r) => r[key] > 0).map((r) => ({ slot: SLOT(r.k), deliver: slotDate(ym, r.k), wish: wishDate(ym, r.k, r.wish), qty: r[key] }));

/** 通常商品の発注単位の仮発注 */
export function unitOrder(ym: string, p: Prod, u: Unit, rows: URow[], at = nowStamp()): Order {
  const kari = uSum(rows, 'kari');
  return {
    ...blank(at), sup: p.sup, no: nextNo(u.base, u.prev), type: '通常', pid: p.id, name: p.pname, ym, wh: u.wh, period: `${SLOT(u.from)}〜${SLOT(u.to)}`,
    kari, rows: unitRows(ym, rows, 'kari'), lot: p.lot, hist: [{ at, who: '運営', t: `仮発注（${kari}個）` }],
  };
}
/** 短消費期限の行の仮発注 */
export function lineOrder(ym: string, p: Prod, l: Line, at = nowStamp()): Order {
  return {
    ...blank(at), sup: p.sup, no: nextNo(l.base, l.prev), type: '短消費期限', pid: p.id, name: p.pname, ym, wh: l.wh, period: `${SLOT(l.k)}（${dFmt(slotDate(ym, l.k), false)}）`,
    kari: l.kari, rows: [{ slot: SLOT(l.k), deliver: slotDate(ym, l.k), wish: wishDate(ym, l.k, l.wish), qty: l.kari }], lot: 12, wishBB: slash(l.bb),
    hist: [{ at, who: '運営', t: `仮発注（${l.kari}個）` }],
  };
}
/** その月の発注一覧の商品：その月のメニューの商品＋「商品追加」で足したメニュー外の商品（台帳 I・2026-10-07） */
export const menuPids = (ym: string, orders: POrder[]): string[] => {
  const base = IN_MENU[ym] ?? [];
  const extra = [...new Set(orders.filter((o) => o.offMenu && o.ym === ym && o.ans !== 'キャンセル').map((o) => o.pid))].filter((id) => !base.includes(id));
  return [...base, ...extra];
};
/** 商品追加：メニューにない商品の仮発注（顧客納品日・倉庫ごとに1発注データ。通常商品は発注単位として、短消費期限商品は行として発注詳細に出る） */
export function offMenuOrder(ym: string, p: Prod, a: { wh: string; k: number; qty: number; wish: string; bb: string; reason: string }, orders: POrder[], at = nowStamp()): Order {
  const deliver = slotDate(ym, a.k);
  const w = slash(a.wish);
  const pre = p.short ? linePo(ym, p.id, a.wh, a.k) : `PO-${ym.replace('-', '')}-${p.id}-U`;
  const n = orders.filter((o) => o.no === pre || o.no.startsWith(pre)).length;
  const no = p.short ? (n ? `${pre}-${n + 1}` : pre) : unitPo(ym, p.id, n + 1);
  return {
    ...blank(at), sup: p.sup, no, type: p.short ? '短消費期限' : '通常', pid: p.id, name: p.pname, ym, wh: a.wh,
    period: p.short ? `${SLOT(a.k)}（${dFmt(deliver, false)}）` : `${SLOT(a.k)}〜${SLOT(a.k)}`,
    kari: a.qty, rows: [{ slot: SLOT(a.k), deliver, wish: w, qty: a.qty }], lot: p.short ? 12 : p.lot, wishBB: slash(a.bb), offMenu: true,
    ...(p.short ? {} : { add: `商品追加（${a.reason}）` }),
    hist: [{ at, who: '運営', t: `商品追加の仮発注（${a.qty}個）：${a.reason}` }],
  };
}
/** 短消費期限商品の追加発注：行（倉庫×顧客納品日）を足して、新しい発注データを本発注で作る（台帳 I・2026-10-07） */
export function addShortOrder(ym: string, p: Prod, a: { wh: string; k: number; qty: number; wish: string; bb: string; reason: string }, orders: POrder[], at = nowStamp()): Order {
  const deliver = slotDate(ym, a.k);
  const n = orders.filter((o) => o.pid === p.id && o.ym === ym && o.type === '短消費期限' && o.add).length;
  return {
    ...blank(at), sup: p.sup, no: `PO-${ym.replace('-', '')}-${p.id}-ADD${n + 1}-${WH_CODE[a.wh]}${SLOT(a.k)}`, type: '短消費期限', pid: p.id, name: p.pname, ym, wh: a.wh,
    period: `${SLOT(a.k)}（${dFmt(deliver, false)}）`, kari: a.qty, hon: a.qty, honAck: false, honAt: at, rows: [{ slot: SLOT(a.k), deliver, wish: slash(a.wish), qty: a.qty }],
    lot: 12, wishBB: slash(a.bb), add: a.reason, hist: [{ at, who: '運営', t: `追加発注（${a.qty}個）：${a.reason}` }],
  };
}
/** 追加発注（本発注済みの発注単位と同じ倉庫・期間で、新しい発注データを本発注で作る） */
export function addOrder(ym: string, p: Prod, base: Unit, unitCount: number, qty: number, reason: string, at = nowStamp()): Order {
  const rows = setQty(base.rows.map((r) => ({ ...r })), qty, 'kari');
  const r = unitRows(ym, rows, 'kari');
  return {
    ...blank(at), sup: p.sup, no: unitPo(ym, p.id, unitCount + 1), type: '通常', pid: p.id, name: p.pname, ym, wh: base.wh, period: `${SLOT(base.from)}〜${SLOT(base.to)}`,
    kari: qty, hon: qty, honAck: false, honAt: at, rows: r, lot: p.lot, add: reason, hist: [{ at, who: '運営', t: `追加発注（${qty}個）：${reason}` }],
  };
}
/** 資材の発注（本発注だけ・随時。決定 R5・Q10） */
export function matOrder(id: string, qty: number, wish: string, count: number, at = nowStamp()): Order {
  const m = mat(id)!;
  const w = slash(wish);
  return {
    ...blank(at), sup: m.sup, no: `PO-${MAT_YM.replace('-', '')}-${id}-${String(count + 1).padStart(2, '0')}`, type: '資材', pid: id, name: m.name, ym: MAT_YM, wh: MAT_WH,
    period: `随時（納品希望 ${w}）`, kari: qty, hon: qty, honAck: false, honAt: at, unit: m.unit, rows: [{ slot: '—', deliver: w, wish: w, qty }], lot: m.lot,
    hist: [{ at, who: '運営', t: `本発注（${qty}${m.unit}）` }],
  };
}

/* ===== 一括の仮発注・本発注（発注一覧） ===== */
export type Req = { half: '前半' | '後半' | 'その他'; from: number; to: number; wish: string; bb: string; note: string };
export const newReqs = (ym: string): Req[] => [
  { half: '前半', from: 0, to: 13, wish: iso(addDays(slotDate(ym, 0), -3)), bb: iso(addDays(slotDate(ym, 13), 30)), note: '' },
  { half: '後半', from: 14, to: 27, wish: iso(addDays(slotDate(ym, 14), -3)), bb: iso(addDays(slotDate(ym, 27), 30)), note: '' },
];
const whMatch = (wh: string, w: string) => wh === '全倉庫' || wh === w;
const unitsIn = (units: Unit[], from: number, to: number, wh: string) => units.filter((u) => !u.add && u.from <= to && u.to >= from && whMatch(wh, u.wh));
const okAns = (o?: POrder) => !!o && ['納期回答待ち', '納期回答済'].includes(o.ans);

export type BulkCtx = { ym: string; wh: string; orders: POrder[]; plans: Record<string, Plan> };
const dataOf = (c: BulkCtx, ym: string, p: Prod) => (p.short ? shortData(ym, p, c.orders, c.plans[planId(ym, p.id)]) : normalData(ym, p, c.orders, c.plans[planId(ym, p.id)]));

/** 基準値＝対象期間・倉庫の必要数 */
export function poBase(c: BulkCtx, pid: string, from: number, to: number) {
  const p = prod(pid)!;
  const d = dataOf(c, c.ym, p);
  return 'lines' in d ? d.lines.filter((l) => l.k >= from && l.k <= to && whMatch(c.wh, l.wh)).reduce((s, l) => s + l.need, 0) : unitsIn(d.units, from, to, c.wh).reduce((s, u) => s + uNeed(u.rows), 0);
}
/** オーダー数（対象期間・倉庫の注文数） */
export function poOrderCnt(c: BulkCtx, pid: string, from: number, to: number) {
  const p = prod(pid)!;
  const d = dataOf(c, c.ym, p);
  return 'lines' in d ? d.lines.filter((l) => l.k >= from && l.k <= to && whMatch(c.wh, l.wh)).reduce((s, l) => s + l.std, 0) : unitsIn(d.units, from, to, c.wh).reduce((s, u) => s + uSum(u.rows, 'std'), 0);
}
/** 過去発注＝前月メニューの同じ期間・倉庫の本発注数 */
export function poPast(c: BulkCtx, pid: string, from: number, to: number) {
  const prev = MONTHS[MONTHS.indexOf(c.ym) + 1];
  if (!prev || !IN_MENU[prev]?.includes(pid)) return 0;
  const p = prod(pid)!;
  const d = dataOf(c, prev, p);
  return 'lines' in d
    ? d.lines.filter((l) => l.k >= from && l.k <= to && whMatch(c.wh, l.wh) && l.st === '本発注済').reduce((s, l) => s + l.hon, 0)
    : unitsIn(d.units, from, to, c.wh).filter((u) => u.st === '本発注済').reduce((s, u) => s + uSum(u.rows, 'hon'), 0);
}
/** 対象期間に仮発注されている数 */
export function poKariIn(c: BulkCtx, pid: string, from: number, to: number) {
  const p = prod(pid)!;
  const d = dataOf(c, c.ym, p);
  return 'lines' in d
    ? d.lines.filter((l) => l.k >= from && l.k <= to && whMatch(c.wh, l.wh) && l.st === '仮発注済').reduce((s, l) => s + l.kari, 0)
    : unitsIn(d.units, from, to, c.wh).filter((u) => u.st === '仮発注済').reduce((s, u) => s + uSum(u.rows, 'kari'), 0);
}
/** 数量の初期値（仮発注：未発注の必要数をロットに切り上げ／本発注：仮発注数） */
export function poDefQty(c: BulkCtx, kind: 'kari' | 'hon', pid: string, R: Req) {
  const p = prod(pid)!;
  const d = dataOf(c, c.ym, p);
  if ('lines' in d) {
    const ls = d.lines.filter((l) => l.k >= R.from && l.k <= R.to && whMatch(c.wh, l.wh));
    return kind === 'hon' ? ls.filter((l) => l.st === '仮発注済').reduce((s, l) => s + Math.max(l.kari, l.need), 0) : ls.filter((l) => l.st === '未発注' || l.st === 'エラー').reduce((s, l) => s + l.need, 0);
  }
  const us = unitsIn(d.units, R.from, R.to, c.wh);
  return kind === 'hon' ? us.filter((u) => u.st === '仮発注済').reduce((s, u) => s + uSum(u.rows, 'kari'), 0) : us.filter((u) => u.st === '未発注').reduce((s, u) => s + lotUp(uNeed(u.rows), p.lot), 0);
}

/** 一括の実行で作る・本発注する発注データ */
export type BulkPlan = { create: Order[]; hon: { order: POrder; qty: number; rows?: OrderRow[] }[]; skipped: number };
export function bulkPlan(c: BulkCtx, kind: 'kari' | 'hon', ids: string[], reqs: Req[], qty: Record<string, number>, at = nowStamp()): BulkPlan {
  const out: BulkPlan = { create: [], hon: [], skipped: 0 };
  const done = new Set<string>();
  reqs.forEach((R, ti) => ids.forEach((pid) => {
    const q = qty[`${ti}:${pid}`] ?? poDefQty(c, kind, pid, R);
    if (!q) return;
    const p = prod(pid)!;
    const d = dataOf(c, c.ym, p);
    if ('units' in d) {
      const us = unitsIn(d.units, R.from, R.to, c.wh).filter((u) => !done.has(u.base));
      const tgt = us.filter((u) => (kind === 'hon' ? u.st === '仮発注済' && okAns(u.order) : u.st === '未発注'));
      out.skipped += us.length - tgt.length;
      const tot = tgt.reduce((s, u) => s + uNeed(u.rows), 0) || 1;
      tgt.forEach((u) => {
        done.add(u.base);
        const share = lotUp(Math.round((q * uNeed(u.rows)) / tot), p.lot);
        const rows = u.rows.map((r) => ({ ...r }));
        if (kind === 'hon') {
          setQty(rows, share, 'hon');
          if (share > 0) out.hon.push({ order: u.order!, qty: share, rows: unitRows(c.ym, rows, 'hon') });
        } else {
          setQty(rows, share, 'kari');
          if (share > 0) out.create.push(unitOrder(c.ym, p, u, rows, at));
        }
      });
    } else {
      d.lines.filter((l) => l.k >= R.from && l.k <= R.to && whMatch(c.wh, l.wh) && !done.has(l.base) && (kind === 'hon' ? l.st === '仮発注済' && okAns(l.order) : l.st === '未発注' || l.st === 'エラー')).forEach((l) => {
        done.add(l.base);
        if (kind === 'hon') {
          const h = Math.max(l.kari, l.need);
          out.hon.push({ order: l.order!, qty: h, rows: l.order!.rows.map((r) => ({ ...r, qty: h })) });
        } else out.create.push(lineOrder(c.ym, p, { ...l, kari: l.need, bb: bbOK(c.ym, p, l.k) }, at));
      });
    }
  }));
  return out;
}

/* ===== 資材発注 ===== */
/** 納品までの日数の初期値（資材発注の画面で倉庫と一緒に毎回入れる。資材マスタには持たない：台帳 F「資材の納期（日）」・受付簿 #360） */
export const MAT_LEAD_DEFAULT = 7;
/** 納品までの日数のチェック（E01 必須・E14 数字・E12 範囲）。問題なければ ''。空なら入力は必須 */
export function leadDaysError(s: string): string {
  const t = s.trim();
  if (!t) return '納品までの日数は必須項目です。';
  if (!/^\d+$/.test(t)) return '納品までの日数は数値で入力してください。';
  return Number(t) > 365 ? '納品までの日数は0〜365の範囲で入力してください。' : '';
}
/**
 * 資材発注の行。stockOf＝ES事務所の在庫（共通データの倉庫在庫 stock.materials。画面が渡す）。
 * demandOf＝（受けて未出荷, 直近28日に受けた数）。渡すと 発注の目安＝（受けて未出荷 ＋ 直近28日の1日あたり平均 × 納品までの日数 days）− 在庫 − 発注中（台帳 I「資材の発注」）。
 * 渡さないときは今までどおり（月の見込みの固定値 MO）
 */
export function matRows(orders: POrder[], stockOf: (id: string) => number = () => 0, demandOf?: (id: string) => { pending: number; recent: number }, days = MAT_LEAD_DEFAULT) {
  const mos = orders.filter((o) => o.type === '資材' && o.ans !== 'キャンセル');
  return MATS.map((m) => {
    const d = demandOf?.(m.id);
    const need = d ? d.pending + Math.ceil((d.recent / 28) * days) : MO[MAT_YM]?.[m.id] ?? 0;
    const open = mos.filter((o) => o.pid === m.id && o.recv !== '入荷済').reduce((a, o) => a + (o.hon || o.kari), 0);
    const stock = stockOf(m.id);
    const short = stock + open < need;
    const sug = lotUp(Math.max(0, need - stock - open), m.lot);
    return { ...m, stock, need, open, short, sug };
  });
}

/* ===== 代替品設定（ALT-MORE-20261001） ===== */
export const altOf = (ym: string, pid: string) => ALT[ym]?.[pid];
/** 代替品の追加発注のうち、その月のメニューにない商品 */
export const altOutside = (ym: string) => Object.keys(ALT[ym] ?? {}).filter((id) => !(IN_MENU[ym] ?? []).includes(id) && ALT[ym][id].n > 0);

export const isBefore = (ym: string) => TODAY() < MENU[ym].deadline;
