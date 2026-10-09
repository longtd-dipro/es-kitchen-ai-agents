import { ApiError } from '@/lib/api/errors';
import type { DocRepo } from '@/lib/ops/core/area';
import { addDays, nowStamp, today } from '@/lib/supplier/dates';
import { ALT_POS, ALTS, instructionSent, isNormal, syncTrip, tripOf, type AltStockIn } from './alt';
import { slotDate } from './calendar';
import { notifyBranch } from './notify';
import type {
  AltPo, AltSetting, Cycle, Delivery, DeliveryLine, MaterialOrder, ProductOrder, Receipt, ReceiptFix, ReceiptImpact, StockBase, StockMove, Warehouse,
} from './types';

/*
 * 倉庫在庫・入荷（area: stock。課題 2-3・2-5・2c の残り）。
 *   在庫＝起点（dm.stock.bases：THOMAS・ES事務所の棚卸しの数）＋入荷（dm.stock.receipts）−出荷（配送の明細・資材便）±在庫の記録（dm.stock.moves）
 *   出荷：商品＝便の配送（倉庫＝配送の warehouseId・出荷日の数＝予定数）。資材＝資材便（資材の注文）だけ（資材は食品の便では送らない・課題 2-5）
 *   入荷：倉庫にアカウントがないので運営（システム管理）が発注ごとに商品の数・箱数を手で入れる（THOMAS の入荷指示 CSV は今までどおり出す・入荷実績 CSV は使わない）。
 *     発注の数と違えば「差異あり・対応待ち」（運営の TOP・発注の一覧にアラート）→ 対応を選ぶまで出し続ける：
 *       分納を待つ（3回まで・次の入荷予定日）／代替品で対応（代替品設定に進む・できた設定をつなぐ）／不足を受け入れる（影響する便を ③ 除外・請求しない・法人へ通知）
 *   本発注：月に2回（前半 A・B の便＝前のサイクルの B5〜C1、後半 C・D の便＝D5〜次のサイクルの A1。課題 2-4）。仮発注はメニューの公開の前（menu.readiness）
 * 発注そのもの（仕入先サイトと同じ発注データ・共通 DB の orders）は domain の DocRepo では読めないので、運営の画面・領域から発注の形（PoLike）で渡す。
 * 代替品の追加発注（dm.order.altPos）はここで読む。
 */

export const RECEIPTS = 'dm.stock.receipts';
export const BASES = 'dm.stock.bases';
export const MOVES = 'dm.stock.moves';
/** 分納は3回まで（仮・決定 C2 と同じ） */
export const SPLIT_MAX = 3;
/** 在庫の差分率・廃棄率のアラート（課題 2-1：いまは 10% で固定） */
export const ALERT_RATE = 0.1;

/** 発注の形（lib/supplier/types の Order のうち、ここで使う項目） */
export type PoLike = {
  no: string; sup: string; pid: string; type: string; wh: string; ym: string; hon: number; ans: string; recv?: string; eta?: string;
  rows: { slot: string; deliver: string; wish: string; qty: number }[]; parts?: { eta: string; qty: number; box?: number | ''; /** 仕入先が本発注の承認で入れた賞味期限／消費期限 */ bb?: string }[]; lot?: number;
  /** 運営が発注で入れた希望の期限 */ wishBB?: string;
};

/** 入荷の記録の賞味期限／消費期限の初期値：仕入先が本発注の承認で入れた期限（その回の分納。受付簿 #130）。資材は持たない */
/** 入荷の記録の期限の初期値：運営が発注で入れた希望の期限、なければ仕入先の承認の期限（資材は空） */
export const defaultBb = (o: Pick<PoLike, 'pid' | 'parts' | 'wishBB'>, part: number) => (itemKind(o.pid) === '資材' ? '' : o.wishBB || supplierBb(o, part));
export const supplierBb = (o: Pick<PoLike, 'pid' | 'parts'>, part: number) => (itemKind(o.pid) === '資材' ? '' : o.parts?.[part]?.bb ?? '');

/* ---------------- 倉庫・品目 ---------------- */

/** 倉庫の ID（倉庫マスタの ID か名前から） */
export function whIdOf(r: DocRepo, idOrName: string) {
  const ws = r.list<Warehouse>('dm.master.warehouses');
  return ws.find((w) => w.id === idOrName)?.id ?? ws.find((w) => w.name === idOrName)?.id ?? '';
}
/** ピッキング倉庫（ES事務所も入る。資材はすべてのピッキング倉庫で持つ・課題 2-5） */
export const pickingWarehouses = (r: DocRepo) => r.list<Warehouse>('dm.master.warehouses').filter((w) => w.type === 'picking' && w.status === '有効');
export const itemKind = (id: string): '商品' | '資材' => (/^S\d+/.test(id) ? '資材' : '商品');
const baseOf = (r: DocRepo, wh: string, itemId: string) => r.get<StockBase>(BASES, `${wh}|${itemId}`);
const DEAD: Delivery['status'][] = ['取消', '中止'];

/** 倉庫から出た数（after より後〜upTo まで。出荷日で数える）。商品＝便の明細の予定数、資材＝資材便の資材の注文の数 */
export function shippedOf(r: DocRepo, wh: string, itemId: string, after: string, upTo: string) {
  const ds = r.list<Delivery>('dm.delivery.deliveries').filter((d) => d.warehouseId === wh && !DEAD.includes(d.status) && d.shipOn > after && d.shipOn <= upTo);
  if (itemKind(itemId) === '資材') {
    const mos = r.list<MaterialOrder>('dm.delivery.materialOrders').filter((m) => m.status !== '取消' && m.deliveryId);
    return ds.filter((d) => d.temp === '資材').reduce((s, d) => s + mos.filter((m) => m.deliveryId === d.id).flatMap((m) => m.lines).filter((l) => l.materialId === itemId).reduce((a, l) => a + l.qty, 0), 0);
  }
  const ids = new Set(ds.filter((d) => d.temp !== '資材').map((d) => d.id));
  return r.list<DeliveryLine>('dm.delivery.lines').filter((l) => ids.has(l.deliveryId) && l.productId === itemId).reduce((s, l) => s + l.plannedQty, 0);
}

/** 倉庫在庫（day の日の終わりの数）。内訳つき */
export function stockAt(r: DocRepo, wh: string, itemId: string, day = today()) {
  const b = baseOf(r, wh, itemId);
  const from = b?.on ?? '0000/00/00';
  const base = b?.qty ?? 0;
  const inQ = r.list<Receipt>(RECEIPTS).filter((x) => x.warehouseId === wh && x.itemId === itemId && x.receivedOn > from && x.receivedOn <= day).reduce((s, x) => s + x.qty, 0);
  const moveQ = r.list<StockMove>(MOVES).filter((x) => x.warehouseId === wh && x.itemId === itemId && x.on > from && x.on <= day).reduce((s, x) => s + x.qty, 0);
  const outQ = shippedOf(r, wh, itemId, from, day);
  return { warehouseId: wh, itemId, item: itemKind(itemId), base, baseOn: b?.on ?? '', inQ, outQ, moveQ, qty: base + inQ + moveQ - outQ, minQty: b?.minQty ?? 0 };
}

/* ---------------- 発注・入荷予定 ---------------- */

/** 代替品の追加発注（発注の形） */
export const altPoLikes = (r: DocRepo) => r.list<AltPo>(ALT_POS).map((x) => x.order as unknown as PoLike);
const receiptsOf = (r: DocRepo, poNo: string) => r.list<Receipt>(RECEIPTS).filter((x) => x.poNo === poNo).sort((a, b) => a.part - b.part);
/** 発注の入荷予定日（仕入先の回答・分納の回 → 入荷希望日） */
export const etaOfPo = (o: PoLike) => (o.parts?.find((p) => p.eta)?.eta || o.eta || o.rows.map((x) => x.wish || x.deliver).filter(Boolean).sort()[0] || '');

/**
 * 発注の入荷の状況：入荷した数・残り・次の回・閉じたか（全部入った・不足を受け入れた・代替品で対応した）
 */
export function poReceiving(r: DocRepo, o: PoLike) {
  const rs = receiptsOf(r, o.no);
  const got = rs.reduce((s, x) => s + x.qty, 0);
  const closedBy = rs.find((x) => x.fix && x.fix.how !== '分納を待つ');
  const open = rs.find((x) => x.status === '差異あり・対応待ち');
  const remain = Math.max(0, o.hon - got);
  const last = rs[rs.length - 1];
  return {
    receipts: rs, got, remain, part: rs.length + 1, open: !!open,
    closed: !!closedBy || (remain === 0 && !open) || o.recv === '入荷済',
    /** 分納を待つ：次の入荷予定日 */
    nextOn: last?.fix?.how === '分納を待つ' ? last.fix.nextOn ?? '' : '',
  };
}

/** 入荷予定（倉庫×品目。閉じていない本発注の残り）。orders＝運営の発注（仕入先サイトと同じ発注データ）、追加発注は足す */
export function incomingOf(r: DocRepo, wh: string, itemId: string, orders: PoLike[] = [], withAlt = true) {
  const all = [...orders, ...(withAlt ? altPoLikes(r) : [])];
  const seen = new Set<string>();
  return all.filter((o) => {
    if (seen.has(o.no)) return false;
    seen.add(o.no);
    return o.pid === itemId && whIdOf(r, o.wh) === wh && o.hon > 0 && !['キャンセル', '受注不可'].includes(o.ans) && o.recv !== '入荷済';
  }).map((o) => {
    const st = poReceiving(r, o);
    return { no: o.no, date: st.nextOn || etaOfPo(o), qty: st.closed ? 0 : st.remain };
  }).filter((x) => x.qty > 0);
}

/**
 * 代替品設定の在庫の見込み（倉庫ごと）：倉庫在庫（今日）からこれからの出荷の予定を引いた数（0 未満は 0）と、入荷予定（運営の発注の残り）。
 * 代替品の追加発注は applyAlt が自分で足すので入れない
 */
export function altStockIn(r: DocRepo, productId: string, orders: PoLike[] = [], day = today()): AltStockIn {
  return Object.fromEntries(pickingWarehouses(r).map((w) => {
    const now = stockAt(r, w.id, productId, day).qty;
    const future = shippedOf(r, w.id, productId, day, '9999/12/31');
    return [w.id, { onHand: Math.max(0, now - future), incoming: incomingOf(r, w.id, productId, orders, false).map((x) => ({ date: x.date, qty: x.qty })) }];
  }));
}

/* ---------------- 本発注の時期（月2回・課題 2-4） ---------------- */

/**
 * サイクル月の仮発注・本発注の時期。前半（A・B の便）＝前のサイクルの B5〜C1、後半（C・D の便）＝前のサイクルの D5〜このサイクルの A1。
 * 仮発注はメニューの公開の前（公開の条件＝仮発注の承認）
 */
export function honSchedule(r: DocRepo, cycleMonth: string) {
  const cs = r.list<Cycle>('dm.delivery.cycles').sort((a, b) => a.id.localeCompare(b.id));
  const c = cs.find((x) => x.id === cycleMonth);
  if (!c) return null;
  const prev = cs[cs.indexOf(c) - 1] ?? ({ ...c, id: '', a1: addDays(c.a1, -28) } as Cycle);
  const menu = r.get<{ publishOn?: string; autoPublishOn?: string }>('dm.order.menus', cycleMonth);
  return {
    cycleMonth, a1: c.a1, orderCloseOn: c.orderCloseOn,
    kari: { by: menu?.publishOn || menu?.autoPublishOn || '', note: 'メニューの公開の前（仮発注の承認が公開の条件）' },
    halves: [
      { half: '前半' as const, slots: 'A・B', from: slotDate(prev, 'B5'), to: slotDate(prev, 'C1'), firstDeliver: slotDate(c, 'A2') },
      { half: '後半' as const, slots: 'C・D', from: slotDate(prev, 'D5'), to: c.a1, firstDeliver: slotDate(c, 'C2') },
    ],
  };
}
/** その日の本発注の時期の状態（前・中・過ぎた） */
export const honPhase = (h: { from: string; to: string }, day = today()) => (day < h.from ? '前' : day <= h.to ? '本発注の時期' : '過ぎた');

/* ---------------- 入荷の記録・差異の対応 ---------------- */

/** 不足で影響する便：その倉庫から出る、その商品の入った便（予定・出荷待・入荷日より後に出荷）。不足は後ろの便から割り当てる（先の便に入った分を回す） */
export function impactsOf(r: DocRepo, a: { itemId: string; warehouseId: string; short: number; from: string; deliverFrom?: string; deliverTo?: string }): ReceiptImpact[] {
  if (a.short <= 0 || itemKind(a.itemId) === '資材') return [];
  const orders = r.list<ProductOrder>('dm.order.orders');
  const cand = r.list<Delivery>('dm.delivery.deliveries')
    .filter((d) => !d.parentId && d.temp !== '資材' && d.warehouseId === a.warehouseId && ['予定', '出荷待'].includes(d.status) && d.shipOn >= a.from
      && (!a.deliverFrom || d.deliverOn >= a.deliverFrom) && (!a.deliverTo || d.deliverOn <= a.deliverTo))
    .sort((x, y) => y.shipOn.localeCompare(x.shipOn) || y.id.localeCompare(x.id));
  const out: ReceiptImpact[] = [];
  let left = a.short;
  for (const d of cand) {
    if (left <= 0) break;
    const o = orders.find((x) => x.childContractId === d.childContractId);
    const slot = `${d.temp}:${d.slot}`;
    const q = o?.lines.filter((l) => isNormal(l) && !l.deliveryId && l.slot === slot && l.productId === a.itemId).reduce((s, l) => s + l.qty, 0) ?? 0;
    if (!o || q <= 0) continue;
    const n = Math.min(q, left);
    left -= n;
    out.push({ deliveryId: d.id, branchId: d.branchId, orderId: o.id, slot, shipOn: d.shipOn, deliverOn: d.deliverOn, qty: n });
  }
  return out.sort((x, y) => x.shipOn.localeCompare(y.shipOn));
}

/** 発注の範囲（お届け日の最初〜最後） */
const poRange = (o: PoLike) => {
  const ds = o.rows.map((x) => x.deliver).filter((x) => /^\d{4}\/\d{2}\/\d{2}$/.test(x)).sort();
  return ds.length ? { deliverFrom: ds[0], deliverTo: ds[ds.length - 1] } : {};
};

/** 入荷を見た発注（運営の画面が渡す発注か、代替品の追加発注） */
function poFor(r: DocRepo, po: PoLike | undefined, poNo: string): PoLike {
  const alt = r.get<AltPo>(ALT_POS, poNo);
  const o = alt ? (alt.order as unknown as PoLike) : po;
  if (!o || o.no !== poNo) throw new ApiError(`発注が見つかりません（${poNo}）`, 404);
  return o;
}

/** 入荷の記録（なければ 404） */
export function receipt(r: DocRepo, id: string) {
  const rc = r.get<Receipt>(RECEIPTS, id);
  if (!rc) throw new ApiError(`入荷の記録が見つかりません（${id}）`, 404);
  return rc;
}

/** 入荷の影響（差異の確認画面）：不足の数と、影響する法人の注文・便 */
export function receiptImpact(r: DocRepo, rc: Receipt, po?: PoLike) {
  const short = rc.planQty - rc.qty;
  const o = po ?? (r.get<AltPo>(ALT_POS, rc.poNo)?.order as unknown as PoLike | undefined);
  return { short, impacts: impactsOf(r, { itemId: rc.itemId, warehouseId: rc.warehouseId, short, from: rc.receivedOn, ...(o ? poRange(o) : {}) }) };
}

/** 代替品の追加発注の入荷を記録する（閉じたら入荷済）。追加発注なら true（呼ぶ側は発注を入荷済にしない） */
function markAltPo(r: DocRepo, poNo: string, on: string, closed: boolean) {
  const x = r.get<AltPo>(ALT_POS, poNo);
  if (!x) return false;
  if (closed) r.put<AltPo>(ALT_POS, poNo, { ...x, order: { ...x.order, recv: '入荷済', recvDate: on } });
  return true;
}

/**
 * 入荷を記録する（運営）。qty＝入った商品の数、box＝箱数。発注の残り（分納の2回目からは残り）と同じなら一致、違えば 差異あり・対応待ち。
 * 返り値の closePo＝発注を入荷済にする（仕入先サイトの発注は呼ぶ側が入荷済にする。追加発注はここで入荷済にする）
 */
export function receive(r: DocRepo, a: { po?: PoLike; poNo: string; qty: number; box: number; receivedOn: string; bb?: string; note?: string; by: string; at?: string }) {
  const o = poFor(r, a.po, a.poNo);
  if (!(o.hon > 0) || ['キャンセル', '受注不可'].includes(o.ans)) throw new ApiError('本発注していない（取消・受注不可の）発注です', 409);
  const st = poReceiving(r, o);
  if (st.closed) throw new ApiError('この発注の入荷はもう終わっています', 409);
  if (st.open) throw new ApiError('差異の対応が決まっていない入荷があります。先に対応を選んでください', 409);
  if (st.receipts.length >= SPLIT_MAX) throw new ApiError(`分納は${SPLIT_MAX}回までです`, 409);
  if (!Number.isInteger(a.qty) || a.qty < 0 || !Number.isInteger(a.box) || a.box < 0) throw new ApiError('商品の数・箱数は0以上の整数で入れてください', 400);
  if (!/^\d{4}\/\d{2}\/\d{2}$/.test(a.receivedOn) || a.receivedOn > today()) throw new ApiError('入荷日を正しく入れてください（未来の日は選べません）', 400);
  /* 賞味期限／消費期限は仕入先が入れた（本発注の承認）もの・運営が発注で入れた希望の期限を写して表示するだけ。入荷登録では入れない（台帳 I・2026-10-08）。空でも保存できる（資材は持たない） */
  const material = itemKind(o.pid) === '資材';
  const bb = material ? '' : (a.bb ?? '').trim();
  if (bb && !/^\d{4}\/\d{2}\/\d{2}$/.test(bb)) throw new ApiError('賞味期限／消費期限を正しく入れてください（yyyy/mm/dd）', 400);
  const wh = whIdOf(r, o.wh);
  if (!wh) throw new ApiError(`納入倉庫 ${o.wh} が倉庫マスタにありません`, 400);
  const planBox = Number(o.parts?.[st.receipts.length]?.box) || Math.ceil(st.remain / Math.max(1, o.lot ?? 1));
  const rc: Receipt = {
    id: `RC-${o.no}-${st.part}`, poNo: o.no, part: st.part, supplierId: o.sup, itemId: o.pid, item: itemKind(o.pid), warehouseId: wh, ym: o.ym,
    planQty: st.remain, planBox, qty: a.qty, box: a.box, receivedOn: a.receivedOn, bb, note: a.note?.trim() ?? '',
    status: a.qty === st.remain ? '一致' : '差異あり・対応待ち', by: a.by, at: a.at ?? nowStamp(),
  };
  r.put(RECEIPTS, rc.id, rc);
  const closed = rc.status === '一致';
  const alt = markAltPo(r, o.no, rc.receivedOn, closed);
  /* closePo＝呼ぶ側が発注（仕入先サイトと同じ発注データ）を入荷済にする */
  return { receipt: rc, closed, closePo: closed && !alt, ...receiptImpact(r, rc, o) };
}

/**
 * 入荷の差異の対応を決める（運営）。
 *   分納を待つ：次の入荷予定日（nextOn）。分納は3回まで。発注は開いたまま（次の入荷で残りを入れる）
 *   代替品で対応：代替品設定（altId・その商品の設定）をつなぐ。発注は閉じる
 *   不足を受け入れる：影響する便のその商品を不足の数だけ ③ 除外（届けない・請求しない）。出荷指示を送った便は版番号つきで再送。法人へ通知。発注は閉じる
 *   多い分を受け入れる：多く入ったとき。発注は閉じる
 */
export function resolveReceipt(r: DocRepo, a: { id: string; how: ReceiptFix; note?: string; nextOn?: string; altId?: string; po?: PoLike; by: string; at?: string; notify?: boolean; payBasis?: '発注数' | '入荷数' }) {
  const rc = r.get<Receipt>(RECEIPTS, a.id);
  if (!rc) throw new ApiError(`入荷の記録が見つかりません（${a.id}）`, 404);
  if (rc.status !== '差異あり・対応待ち') throw new ApiError('この入荷は差異の対応待ちではありません', 409);
  const at = a.at ?? nowStamp(), day = today();
  const short = rc.planQty - rc.qty;
  const fix: NonNullable<Receipt['fix']> = { how: a.how, at, by: a.by, note: a.note?.trim() ?? '' };
  if (a.how === '多い分を受け入れる') {
    if (short >= 0) throw new ApiError('多く入った入荷ではありません', 400);
    fix.payBasis = a.payBasis === '入荷数' ? '入荷数' : '発注数';
  } else if (short <= 0) throw new ApiError('不足の入荷ではありません（多い分を受け入れる を選んでください）', 400);
  if (a.how === '分納を待つ') {
    if (rc.part >= SPLIT_MAX) throw new ApiError(`分納は${SPLIT_MAX}回までです。代替品で対応するか、不足を受け入れてください`, 409);
    if (!/^\d{4}\/\d{2}\/\d{2}$/.test(a.nextOn ?? '') || a.nextOn! < rc.receivedOn) throw new ApiError('次の入荷予定日（仕入先の回答）を入れてください', 400);
    fix.nextOn = a.nextOn;
  }
  if (a.how === '代替品で対応') {
    const alt = r.get<AltSetting>(ALTS, a.altId ?? '');
    if (!alt || alt.productId !== rc.itemId) throw new ApiError('この商品の代替品設定を選んでください（代替品設定で作ってから選びます）', 400);
    fix.altId = alt.id;
  }
  if (a.how === '不足を受け入れる') {
    const { impacts } = receiptImpact(r, rc, a.po);
    fix.impacts = impacts;
    for (const x of impacts) excludeShort(r, rc, x, day);
    if (a.notify ?? true) {
      for (const b of [...new Set(impacts.map((x) => x.branchId))]) {
        const mine = impacts.filter((x) => x.branchId === b);
        const name = r.get<{ name: string }>('dm.master.products', rc.itemId)?.name ?? rc.itemId;
        notifyBranch(r, b, {
          templateId: 'stock_short', title: `お届けする商品の変更のお知らせ（${name}）`,
          body: [`仕入先からの入荷が足りなかったため、次のお届けでは ${name} をお届けできません（ご請求しません）。`, ...mine.map((x) => `・${x.deliverOn} のお届け：${name} ${x.qty}個は納品分に含まれません`)].join('\n'),
          link: { type: 'order', id: mine[0].orderId },
        });
      }
    }
  }
  const next: Receipt = { ...rc, status: '対応済', fix };
  r.put(RECEIPTS, rc.id, next);
  const closed = a.how !== '分納を待つ';
  const alt = markAltPo(r, rc.poNo, rc.receivedOn, closed);
  return { receipt: next, closed, closePo: closed && !alt };
}

/** 不足を受け入れた便の注文の行を ③ 除外にして、配送の明細をそろえる（出荷指示を送ったあとなら版番号つきで再送） */
function excludeShort(r: DocRepo, rc: Receipt, x: ReceiptImpact, day: string) {
  const o = r.get<ProductOrder>('dm.order.orders', x.orderId);
  if (!o) return;
  let left = x.qty;
  const lines = o.lines.map((l) => {
    if (left <= 0 || !isNormal(l) || l.deliveryId || l.slot !== x.slot || l.productId !== rc.itemId) return l;
    const n = Math.min(l.qty, left);
    left -= n;
    return { ...l, qty: l.qty - n };
  }).filter((l) => l.qty > 0);
  const done = x.qty - left;
  if (done <= 0) return;
  lines.push({ productId: rc.itemId, slot: x.slot, qty: done, kind: '除外', altOf: rc.itemId, billPrice: 0, shortId: rc.id });
  const at = nowStamp();
  r.put<ProductOrder>('dm.order.orders', o.id, {
    ...o, lines, updatedAt: at, updatedBy: 'system',
    log: [{ at, by: 'system', what: `入荷の不足（${rc.id}）`, detail: `${x.deliverOn} の便の ${rc.itemId} ${done}個を納品分から外しました（請求しません）` }, ...o.log],
  });
  const d = r.get<Delivery>('dm.delivery.deliveries', x.deliveryId) ?? tripOf(r, o.childContractId, x.slot);
  if (!d || !['予定', '出荷待'].includes(d.status)) return;
  syncTrip(r, d, lines);
  if (instructionSent(r, d, day)) {
    const cur = r.get<Delivery>('dm.delivery.deliveries', d.id)!;
    const rev = (cur.shipRev ?? 1) + 1;
    r.put<Delivery>('dm.delivery.deliveries', d.id, { ...cur, shipRev: rev, internalMemo: [cur.internalMemo, `${at} 入荷の不足 ${rc.id}：出荷指示を再送（rev${rev}）`].filter(Boolean).join('\n') });
  }
}

/** 運営の TOP・発注の一覧のアラート：差異あり・対応待ち、分納の入荷予定日を過ぎた入荷 */
export function receiptAlerts(r: DocRepo, day = today()) {
  const rs = r.list<Receipt>(RECEIPTS);
  const pending = rs.filter((x) => x.status === '差異あり・対応待ち');
  const late = rs.filter((x) => x.fix?.how === '分納を待つ' && (x.fix.nextOn ?? '') < day && !rs.some((y) => y.poNo === x.poNo && y.part > x.part));
  return { pending, late, count: pending.length + late.length };
}

/* ---------------- 在庫の記録・資材 ---------------- */

/** 在庫の記録を足す（運営。NG品ロス・棚卸し差異・資材の入荷（発注なし）など） */
export function addMove(r: DocRepo, a: Omit<StockMove, 'id' | 'at' | 'item'> & { at?: string }) {
  if (!r.get('dm.master.warehouses', a.warehouseId)) throw new ApiError('倉庫を選んでください', 400);
  if (!Number.isInteger(a.qty) || a.qty === 0) throw new ApiError('数を入れてください（増える＋／減る−）', 400);
  if (!a.reason?.trim()) throw new ApiError('理由を入れてください', 400);
  const ymd = a.on.slice(2).replace(/\//g, '');
  const n = r.list<StockMove>(MOVES).filter((x) => x.id.startsWith(`SM-${ymd}-`)).length + 1;
  const x: StockMove = { ...a, id: `SM-${ymd}-${String(n).padStart(4, '0')}`, item: itemKind(a.itemId), reason: a.reason.trim(), at: a.at ?? nowStamp() };
  r.put(MOVES, x.id, x);
  return x;
}

/** 資材の在庫（ピッキング倉庫ごと・ES事務所も）。在庫不足＝しきい値（minQty）を下回った */
export function materialStock(r: DocRepo, orders: PoLike[] = [], day = today()) {
  const mats = r.list<{ id: string; name: string }>('dm.master.materials');
  return pickingWarehouses(r).flatMap((w) => mats.map((m) => {
    const s = stockAt(r, w.id, m.id, day);
    const inc = incomingOf(r, w.id, m.id, orders);
    return { ...s, warehouseName: w.name, name: m.name, incoming: inc.reduce((a, x) => a + x.qty, 0), low: s.minQty > 0 && s.qty < s.minQty };
  })).filter((x) => x.base || x.inQ || x.outQ || x.moveQ || x.minQty || x.incoming);
}

/** 資材発注の目安に使う直近の日数（1日あたりの平均を出す期間。台帳 I「資材の発注」） */
export const MATERIAL_AVG_DAYS = 28;
/**
 * 資材注文の需要（倉庫×資材）。pending＝受けて未出荷（出荷待・出荷指示済）の資材注文の数、recent＝直近 28日に受けた資材注文の数（取消を除く）。
 * 倉庫は資材便の出荷元（配送の倉庫）。発注の目安＝（pending ＋ recent ÷ 28 × 納品までの日数）− 在庫 − 発注中（lib/ops/purchasing/logic.ts の matRows）
 */
export function materialDemand(r: DocRepo, day = today()) {
  const from = addDays(day, -MATERIAL_AVG_DAYS);
  const wh = new Map(r.list<Delivery>('dm.delivery.deliveries').map((d) => [d.id, d.warehouseId]));
  const out = new Map<string, { warehouseId: string; itemId: string; pending: number; recent: number }>();
  for (const o of r.list<MaterialOrder>('dm.delivery.materialOrders').filter((x) => x.status !== '取消')) {
    const w = wh.get(o.deliveryId) ?? 'WH00004';
    const at = o.orderedAt.slice(0, 10).replace(/-/g, '/');
    for (const l of o.lines) {
      const k = `${w}|${l.materialId}`;
      const cur = out.get(k) ?? { warehouseId: w, itemId: l.materialId, pending: 0, recent: 0 };
      if (o.status === '出荷待' || o.status === '出荷指示済') cur.pending += l.qty;
      if (at > from && at <= day) cur.recent += l.qty;
      out.set(k, cur);
    }
  }
  return [...out.values()];
}

/* ---------------- 発注をそろえる・倉庫在庫の見込み（運営の倉庫在庫・発注一覧・代替品設定が同じ数を出す） ---------------- */

/**
 * 共通 DB の発注（仕入先サイトと同じ orders テーブル・lib/server/supplierRepo.ts と同じデータ）を読むだけの kind。
 * 共通 DB では lib/server/docs.ts の sqliteDocRepo が orders テーブルを返す（書けない）。メモリの DocRepo では見本を入れたときだけある
 */
export const DB_ORDERS = 'db.orders';
/** 仕入先サイトのアカウントがない仕入先の発注（運営の領域 purchasing.orders。形は共通 DB の発注と同じ） */
export const OPS_ORDERS = 'purchasing.orders';

/**
 * 入荷予定に数える発注：呼ぶ側が渡した発注＋共通 DB の発注＋運営の発注。同じ発注番号は1つだけ（先に来たもの）。
 * 代替品の追加発注（dm.order.altPos）は入れない（incomingOf が足す・代替品設定の見込みは applyAlt が自分で足す）＝二重に数えない
 */
export function knownOrders(r: DocRepo, orders: PoLike[] = []): PoLike[] {
  const alt = new Set(r.list<AltPo>(ALT_POS).flatMap((x) => [x.id, (x.order as { no?: string }).no ?? '']));
  const seen = new Set<string>();
  return [...orders, ...r.list<PoLike>(DB_ORDERS), ...r.list<PoLike>(OPS_ORDERS)].filter((o) => {
    if (!o?.no || alt.has(o.no) || seen.has(o.no)) return false;
    seen.add(o.no);
    return true;
  });
}

/** 倉庫在庫の見込みの1行（日付の順。bal＝その行のあとの数） */
export type LedgerRow = { date: string; kind: string; qty: number; ref: string; done: boolean; note: string; by?: string; bal: number };
/**
 * 倉庫×品目の在庫の見込み。now＝今日の在庫（stockAt と同じ数）、fin＝これからの入荷予定・出荷・在庫の記録のあと、
 * inQ＝入荷（記録＋予定）、outQ＝出荷（便の予定数・資材便）、moveQ＝在庫の記録。shortDate＝足りなくなる最初の日（今日すでにマイナスなら今日）
 */
export type Ledger = {
  warehouseId: string; warehouseName: string; itemId: string; item: '商品' | '資材'; base: number; baseOn: string; minQty: number;
  inQ: number; outQ: number; moveQ: number; now: number; fin: number; rows: LedgerRow[]; shortDate: string | null; minV: number; minDate: string | null;
};

/**
 * 倉庫在庫の見込み（倉庫×品目ごと）。在庫＝起点（棚卸し）＋入荷の記録−出荷（便の予定数）±在庫の記録 に、入荷予定（閉じていない発注の残り・追加発注）を足す。
 * orders＝呼ぶ側が渡す発注（省くと共通 DB の発注＋運営の発注・knownOrders）。入荷予定日を過ぎてまだ入っていない分は今日の行に置く（遅れ）。
 * 起点・出し入れのない組み合わせは出さない
 */
export function stockLedgers(r: DocRepo, a: { warehouseId?: string; itemId?: string; item?: '商品' | '資材'; orders?: PoLike[]; day?: string } = {}): Ledger[] {
  const day = a.day ?? today();
  const whs = pickingWarehouses(r).filter((w) => !a.warehouseId || w.id === a.warehouseId);
  const items = [
    ...(a.item === '資材' ? [] : r.list<{ id: string }>('dm.master.products').map((p) => p.id)),
    ...(a.item === '商品' ? [] : r.list<{ id: string }>('dm.master.materials').map((m) => m.id)),
  ].filter((id) => !a.itemId || id === a.itemId);
  const ds = r.list<Delivery>('dm.delivery.deliveries').filter((d) => !DEAD.includes(d.status));
  const linesBy = new Map<string, DeliveryLine[]>();
  for (const l of r.list<DeliveryLine>('dm.delivery.lines')) linesBy.set(l.deliveryId, [...(linesBy.get(l.deliveryId) ?? []), l]);
  const mosBy = new Map<string, MaterialOrder[]>();
  for (const m of r.list<MaterialOrder>('dm.delivery.materialOrders').filter((x) => x.status !== '取消' && x.deliveryId)) mosBy.set(m.deliveryId, [...(mosBy.get(m.deliveryId) ?? []), m]);
  const rcs = r.list<Receipt>(RECEIPTS);
  const mvs = r.list<StockMove>(MOVES);
  const bases = new Map(r.list<StockBase>(BASES).map((b) => [b.id, b]));
  const allWh = r.list<Warehouse>('dm.master.warehouses');
  const whOf = (s: string) => allWh.find((w) => w.id === s)?.id ?? allWh.find((w) => w.name === s)?.id ?? '';
  const pos = [...(a.orders ? knownOrders(r, a.orders) : knownOrders(r)), ...altPoLikes(r)]
    .filter((o, i, xs) => xs.findIndex((x) => x.no === o.no) === i && o.hon > 0 && !['キャンセル', '受注不可'].includes(o.ans) && o.recv !== '入荷済')
    .map((o) => ({ o, wh: whOf(o.wh) }));
  const out: Ledger[] = [];
  for (const w of whs) for (const itemId of items) {
    const b = bases.get(`${w.id}|${itemId}`);
    const from = b?.on ?? '0000/00/00';
    const kind = itemKind(itemId);
    const rows: Omit<LedgerRow, 'bal'>[] = [];
    /* 入荷の記録（実績） */
    for (const x of rcs) if (x.warehouseId === w.id && x.itemId === itemId && x.receivedOn > from && x.receivedOn <= day) {
      rows.push({ date: x.receivedOn, kind: '入荷', qty: x.qty, ref: x.poNo, done: true, note: `入荷済（${x.part}回目${x.status === '一致' ? '' : '・' + x.status}）`, by: x.by });
    }
    /* 入荷予定（閉じていない発注の残り） */
    for (const { o, wh } of pos) if (wh === w.id && o.pid === itemId) {
      const st = poReceiving(r, o);
      if (st.closed || st.remain <= 0) continue;
      const eta = st.nextOn || etaOfPo(o);
      const late = !eta || eta < day;
      rows.push({ date: late ? day : eta, kind: '入荷', qty: st.remain, ref: o.no, done: false, note: late ? `入荷予定（${eta ? `予定日 ${eta} を過ぎています` : '予定日なし'}）` : st.nextOn ? '分納の入荷予定' : '入荷予定' });
    }
    /* 出荷（便の予定数。資材は資材便だけ）。出荷日・サイクル月・枠・お届け日ごとにまとめる */
    const ship = new Map<string, Omit<LedgerRow, 'bal'> & { n: number }>();
    for (const d of ds) {
      if (d.warehouseId !== w.id || d.shipOn <= from || (kind === '資材') !== (d.temp === '資材')) continue;
      const q = kind === '資材'
        ? (mosBy.get(d.id) ?? []).flatMap((m) => m.lines).filter((l) => l.materialId === itemId).reduce((s, l) => s + l.qty, 0)
        : (linesBy.get(d.id) ?? []).filter((l) => l.productId === itemId).reduce((s, l) => s + l.plannedQty, 0);
      if (!q) continue;
      const k = `${d.shipOn}|${d.cycleMonth}|${d.slot}|${d.deliverOn}`;
      const cur = ship.get(k);
      if (cur) { cur.qty -= q; cur.n += 1; continue; }
      ship.set(k, { date: d.shipOn, kind: '出荷', qty: -q, ref: `${d.cycleMonth} ${d.slot}（${d.deliverOn}納品）`, done: d.shipOn <= day, note: d.shipOn <= day ? '出荷済' : '出荷予定', n: 1 });
    }
    for (const x of ship.values()) { const { n, ...rest } = x; rows.push({ ...rest, note: `${rest.note}（${n}便）` }); }
    /* 在庫の記録 */
    for (const m of mvs) if (m.warehouseId === w.id && m.itemId === itemId && m.on > from) {
      rows.push({ date: m.on, kind: m.kind || '在庫の記録', qty: m.qty, ref: m.id, done: m.on <= day, note: m.reason, by: m.by });
    }
    if (!b && !rows.length) continue;
    /* 同じ日は入りを先に */
    rows.sort((x, y) => x.date.localeCompare(y.date) || y.qty - x.qty);
    const base = b?.qty ?? 0;
    let bal = base;
    const all: LedgerRow[] = rows.map((x) => ({ ...x, bal: (bal += x.qty) }));
    const now = base + rows.filter((x) => x.done).reduce((s, x) => s + x.qty, 0);
    const future = all.filter((x) => x.date > day);
    const low = future.reduce<LedgerRow | null>((m, x) => (!m || x.bal < m.bal ? x : m), null);
    const sum = (f: (x: LedgerRow) => boolean) => all.filter(f).reduce((s, x) => s + x.qty, 0);
    out.push({
      warehouseId: w.id, warehouseName: w.name, itemId, item: kind, base, baseOn: b?.on ?? '', minQty: b?.minQty ?? 0,
      inQ: sum((x) => x.kind === '入荷'), outQ: -sum((x) => x.kind === '出荷'), moveQ: sum((x) => x.kind !== '入荷' && x.kind !== '出荷'),
      now, fin: bal, rows: all,
      shortDate: now < 0 ? day : future.find((x) => x.bal < 0)?.date ?? null,
      minV: low ? Math.min(low.bal, now) : now, minDate: low && low.bal < now ? low.date : null,
    });
  }
  return out;
}
