import { ApiError } from '@/lib/api/errors';
import { isRealDate } from '../dateCheck';
import { defineArea, toDocs, type DocRepo } from '@/lib/ops/core/area';
import { notify, notifyApp, notifyBranch } from '../notify';
import { addDays, nowStamp, today } from '@/lib/supplier/dates';
import { canDeliver, canPick, slotDate, slotOf, WEEKS } from '../calendar';
import { buildChildContracts, buildDeliveries, CYCLES, CYCLE_SETTINGS_LOG, HOLIDAYS } from '../seed/delivery';
import type { Branch, Carrier, ChangeRequest, Cycle, Delivery, DeliveryLine, Driver, Holiday, Leg, MaterialOrder, Tracking, Trouble, TroubleType, Warehouse } from '../types';
import { altLabel, disposalsFor, disposalText, excludedFor, instructionSent } from '../alt';
import { DELIVERED, lineName, stampDelivered } from '../snapshot';
import { isYamato, isYamatoNo, trackingDigits, trackingUrlOf } from '../tracking';
import { deliveryRequestCheck, hasTracking } from '../mails';
import { moveCalendar, moveDeliveries, movePlan, MOVES, orderDeadlineWarnings, setCycleA1, unfitCycles, type MoveArgs } from '../move';
import type { CycleSettingsLog, DeliveryMove } from '../types';
import { yen } from '@/lib/format/money';
import { cycleMonthAt, materialExcess } from '../charges';
import { matLeadDays, matLocked, matNextDue, recountMat } from '../matOrder';

/*
 * 配送（area: delivery）。kind：delivery.cycles／holidays／deliveries／lines／legs／tracking／troubles／changeRequests／materialOrders
 * 見せる範囲（統合仕様書 v2.3・決定 STEP4）：
 *   法人：倉庫・出荷日・委託配送会社・ドライバー・運営のメモは見せない（送り状番号と追跡 URL は見せる）
 *   委託配送先：自社の区間を含む配送だけ／ドライバー：自分の区間だけ（完了から90日で見えなくする）
 */

const all = (r: DocRepo) => r.list<Delivery>('dm.delivery.deliveries');
const legs = (r: DocRepo) => r.list<Leg>('dm.delivery.legs');
const cycles = (r: DocRepo) => r.list<Cycle>('dm.delivery.cycles');
const holidays = (r: DocRepo) => r.list<Holiday>('dm.delivery.holidays');
const get = (r: DocRepo, id: string) => {
  const d = r.get<Delivery>('dm.delivery.deliveries', id);
  if (!d) throw new ApiError(`配送が見つかりません（${id}）`, 404);
  return d;
};
const linesOf = (r: DocRepo, id: string) => r.list<DeliveryLine>('dm.delivery.lines').filter((l) => l.deliveryId === id);
const nameOf = (r: DocRepo, kind: string, id: string) => (id ? r.get<{ name: string }>(kind, id)?.name ?? id : '');
const pnameOf = (r: DocRepo) => (id: string) => nameOf(r, 'dm.master.products', id);
/** 明細＋代替品の表示（altLabel＝「代替品（元：〇〇）」）。除外の行（届けない不良商品）は excluded に「納品分に含まれません」 */
/* 商品名：納品した明細は納品したときの名前（変わっていれば「旧名（現：新名）」） */
const linesView = (r: DocRepo, d: Omit<Delivery, 'internalMemo'>) => linesOf(r, d.id).map((l) => ({ ...l, name: lineName(r, l), altLabel: altLabel(l, pnameOf(r)) }));
const excludedView = (r: DocRepo, d: Omit<Delivery, 'internalMemo'>) => excludedFor(r, d).map((l) => ({ productId: l.productId, name: nameOf(r, 'dm.master.products', l.productId), qty: l.qty, altLabel: altLabel(l, pnameOf(r)) }));

/** 品目ごとの数の入力（明細の ID＝lineId で1行ずつ。lineId がなければ商品ID で、同じ商品の行が複数あるとき〔代替品の差替など〕は商品ID の行の数の合計を、その商品の明細へ上の行から埋める） */
export type LineQty = { productId: string; qty: number; lineId?: string };

/**
 * 明細ごとの数を決める（B1：同じ商品の行が2つ＝通常＋代替品の差替でも、行ごとに数を持つ）。
 * rows にない行は fallback(l)。数が 0〜予定数 でなければ例外（msg）
 */
export function lineQtys(lines: DeliveryLine[], rows: LineQty[] | undefined, fallback: (l: DeliveryLine) => number, msg: (l: DeliveryLine, max: number) => string = (l, max) => `${l.productId} の数を 0〜${max} で入れてください`) {
  const out = new Map<string, number>();
  const byLine = new Map((rows ?? []).filter((x) => x.lineId).map((x) => [x.lineId!, x.qty]));
  const byProduct = (rows ?? []).filter((x) => !x.lineId);
  for (const l of lines) {
    if (byLine.has(l.id)) {
      const q = byLine.get(l.id)!;
      if (!(Number.isInteger(q) && q >= 0 && q <= l.plannedQty)) throw new ApiError(msg(l, l.plannedQty), 400);
      out.set(l.id, q);
    }
  }
  const productIds = [...new Set(lines.filter((l) => !out.has(l.id)).map((l) => l.productId))];
  for (const pid of productIds) {
    const same = lines.filter((l) => l.productId === pid && !out.has(l.id));
    /* 商品ID だけの行が同じ商品に複数あれば（明細の行ごとに商品ID で送る古い形）、足して商品の合計にする */
    const rs = byProduct.filter((x) => x.productId === pid);
    if (!rs.length) { same.forEach((l) => out.set(l.id, fallback(l))); continue; }
    const max = same.reduce((a, l) => a + l.plannedQty, 0);
    if (rs.some((x) => !(Number.isInteger(x.qty) && x.qty >= 0))) throw new ApiError(msg(same[0], max), 400);
    const sum = rs.reduce((a, x) => a + x.qty, 0);
    if (sum > max) throw new ApiError(msg(same[0], max), 400);
    let rest = sum;
    for (const l of same) { const q = Math.min(rest, l.plannedQty); out.set(l.id, q); rest -= q; }
  }
  for (const l of lines) {
    const q = out.get(l.id)!;
    if (!(Number.isInteger(q) && q >= 0 && q <= l.plannedQty)) throw new ApiError(msg(l, l.plannedQty), 400);
  }
  return out;
}

/** 親の明細 ID → 子の明細 ID（商品ID のあとの代替品の印も残す。B1：同じ商品の行が上書きされないように） */
const childLineId = (l: DeliveryLine, parentId: string, id: string) => (l.id.startsWith(`${parentId}:`) ? `${id}${l.id.slice(parentId.length)}` : `${id}:${l.productId}${l.altId ? `:${l.altId}` : l.kind && l.kind !== '通常' ? `:${l.kind}` : ''}`);

/** 法人に見せる状態の言い方 */
const CORP_LABEL: Partial<Record<Delivery['status'], string>> = {
  予定: 'お届け予定', 出荷待: 'お届け予定', 出荷済: '配送中', 受取済: '配送中', 納品済: 'お届け済', 一部納品済: '一部お届け済',
  再配達待: '再配送準備中', 確認中: '配送状況を確認中です', 中止: 'お届け中止',
};

/** 法人Web に出す形（倉庫・運び手・メモを除く） */
function forCorpView(r: DocRepo, d: Delivery) {
  const tr = r.list<Tracking>('dm.delivery.tracking').filter((t) => t.deliveryId === d.id && t.status === 'active');
  const cr = r.list<ChangeRequest>('dm.delivery.changeRequests').filter((c) => c.deliveryId === d.id);
  return {
    id: d.id, parentId: d.parentId, branchId: d.branchId, cycleMonth: d.cycleMonth, deliverOn: d.deliverOn, temp: d.temp, serviceForm: d.serviceForm,
    status: CORP_LABEL[d.status] ?? d.status, plannedQty: d.plannedQty, deliveredQty: d.deliveredQty, deliveredAt: d.deliveredAt,
    changeState: d.changeState, changeRequest: cr[cr.length - 1] ?? null,
    lines: linesView(r, d).map((l) => ({ productId: l.productId, name: l.name, plannedQty: l.plannedQty, deliveredQty: l.deliveredQty, altLabel: l.altLabel })),
    excluded: excludedView(r, d),
    tracking: tr.map((t) => ({ trackingNo: t.trackingNo, url: trackingUrlOf(r.get<Carrier>('dm.master.carriers', t.carrierId), t.trackingNo) })),
  };
}

/** 区間＋配送（委託配送先・ドライバー用。運営のメモは除く） */
function legView(r: DocRepo, l: Leg) {
  const { internalMemo: _memo, ...d } = get(r, l.deliveryId);
  const place = (p: Leg['from'] | Leg['to']) =>
    p.type === 'destination' ? { type: p.type, id: p.id, name: d.destination.name, address: d.destination.address, tel: d.destination.tel }
      : (() => { const w = r.get<Warehouse>('dm.master.warehouses', p.id); return { type: p.type, id: p.id, name: w?.name ?? p.id, address: w?.address, tel: w?.tel ?? '' }; })();
  return {
    leg: l, delivery: d, from: place(l.from), to: place(l.to),
    driverName: nameOf(r, 'dm.master.drivers', l.driverId), carrierName: nameOf(r, 'dm.master.carriers', l.carrierId),
    lines: linesView(r, d),
    /** 届けない不良商品（代替品設定の除外）・回収／廃棄の指示（代替品設定） */
    excluded: excludedView(r, d),
    instructions: disposalsFor(r, d.id).map((x) => disposalText(x, pnameOf(r))),
    troubles: r.list<Trouble>('dm.delivery.troubles').filter((t) => t.deliveryId === d.id),
  };
}

/** 番号の続き（prefix-NNNN。見本の番号と重ならないよう、いまある最大の次） */
function nextNo(r: DocRepo, kind: string, prefix: string) {
  const max = Math.max(0, ...r.list<{ id: string }>(kind).filter((x) => x.id.startsWith(prefix + '-')).map((x) => Number(x.id.slice(prefix.length + 1))));
  return `${prefix}-${String(max + 1).padStart(4, '0')}`;
}

/**
 * 納品の完了（ドライバー）。品目ごとの数量（省略で予定どおり）。足りなければ一部納品済＋数量相違のトラブル。
 * 配送の報告（dm.report の5ステップ）を終えたときもこれを使う
 */
export function completeDelivery(r: DocRepo, a: { deliveryId: string; driverId: string; lines?: LineQty[]; earlyReason?: string }) {
  const d = get(r, a.deliveryId);
  const fin = legs(r).find((l) => l.deliveryId === d.id && l.isFinal);
  if (!fin || fin.driverId !== a.driverId) throw new ApiError('自分の区間ではありません', 403);
  if (!fin.pickedUpAt) throw new ApiError('先に受取を登録してください', 409);
  if (d.status !== '受取済') throw new ApiError(`この配送は完了にできません（${d.status}）`, 409);
  /* 納品はお届け日だけ。前の日に納品するときは確かめて理由を入れる（課題 4-1） */
  if (today() < d.deliverOn && !a.earlyReason?.trim()) throw new ApiError(`お届け日（${d.deliverOn}）より前です。前に納品するときは理由を入れてください`, 409);
  if (today() < d.deliverOn) audit(r, get(r, d.id), `お届け日より前に納品（${today()}・理由：${a.earlyReason!.trim()}）`);
  const ls = linesOf(r, d.id);
  const qs = lineQtys(ls, a.lines, (l) => l.plannedQty, (l) => `${l.productId} の数量が正しくありません`);
  let total = 0;
  for (const l of ls) {
    const q = qs.get(l.id)!;
    total += q;
    r.put('dm.delivery.lines', l.id, { ...l, deliveredQty: q });
  }
  const short = total < d.plannedQty;
  r.put('dm.delivery.deliveries', d.id, { ...get(r, d.id), status: short ? '一部納品済' : '納品済', deliveredQty: total, deliveredAt: nowStamp(), completion: 'reported' });
  /* 納品したときの写し（商品名・拠点名・委託の支払額。影響一覧 A4・決定 7-1 Q3） */
  stampDelivered(r, d.id);
  /* アプリの利用者へ「届きました」（ドライバーの便は完了したとき。路線便は当日 9:00＝menu.tick） */
  if (d.temp !== '資材' && total > 0) notifyApp(r, d.branchId, { templateId: 'meal_arrived', title: 'お食事が届きました', body: `${d.deliverOn} の便（${total}食）が届きました。`, link: { type: 'delivery', id: d.id } });
  if (short) shortTrouble(r, d, a.driverId, `予定 ${d.plannedQty}・納品 ${total}（自動）`);
  return get(r, d.id);
}

/**
 * 数量相違のトラブル（課題 4-3：1つにまとめる）。開いている数量相違（ドライバーの報告・前の自動）があれば追記し、なければ作る
 */
function shortTrouble(r: DocRepo, d: Delivery, driverId: string, note: string) {
  const open = r.list<Trouble>('dm.delivery.troubles').find((t) => t.deliveryId === d.id && !t.resolution && t.typeId === 'qty_diff');
  if (open) {
    if (!open.note.includes(note)) r.put<Trouble>('dm.delivery.troubles', open.id, { ...open, note: [open.note, note].filter(Boolean).join('／') });
    return r.get<Trouble>('dm.delivery.troubles', open.id)!;
  }
  const id = nextNo(r, 'dm.delivery.troubles', `TR-${d.deliverOn.slice(2).replace(/\//g, '')}`);
  const t: Trouble = { id, deliveryId: d.id, typeId: 'qty_diff', reportedBy: { site: 'driver', accountId: driverId }, reportedAt: nowStamp(), note, resolution: '', resolvedAt: '', childDeliveryId: '' };
  r.put<Trouble>('dm.delivery.troubles', id, t);
  troubleNotice(r, d, t);
  return t;
}

/**
 * 完了したあとの検品の直し（ドライバー・完了から7日・トラブルがないとき。課題 4-4）。明細の届けた数・配送の数と状態を直す。
 * 足りなくなったら数量相違のトラブル（1つ）
 */
export function reinspect(r: DocRepo, a: { deliveryId: string; driverId: string; lines: LineQty[] }) {
  const d = get(r, a.deliveryId);
  if (!DELIVERED.includes(d.status)) throw new ApiError(`納品の前は直せません（${d.status}）`, 409);
  let total = 0;
  const ls = linesOf(r, d.id);
  const qs = lineQtys(ls, a.lines, (l) => l.deliveredQty ?? l.plannedQty, (l) => `${l.productId} の数量が正しくありません`);
  for (const l of ls) {
    const q = qs.get(l.id)!;
    total += q;
    if (q !== l.deliveredQty) r.put('dm.delivery.lines', l.id, { ...l, deliveredQty: q });
  }
  if (total === d.deliveredQty) return d;
  const short = total < d.plannedQty;
  audit(r, { ...d, deliveredQty: total, status: short ? '一部納品済' : '納品済' }, `完了後に検品の数を修正（${d.deliveredQty ?? 0} → ${total}・ドライバー）`);
  if (short) shortTrouble(r, d, a.driverId, `予定 ${d.plannedQty}・納品 ${total}（完了後の修正・自動）`);
  return get(r, d.id);
}

/** トラブルの通知：運営（配送担当）と法人（「配送状況を確認しています」。中身は運営から連絡） */
function troubleNotice(r: DocRepo, d: Delivery, t: Trouble) {
  notify(r, { to: { site: 'ops', accountId: '', role: 'ops.delivery' }, templateId: 'trouble', title: `トラブルの報告（${t.id}）`, body: `${d.destination.name} ${d.deliverOn}：${r.get<TroubleType>('dm.master.troubleTypes', t.typeId)?.name ?? t.typeId} ${t.note}`, link: { type: 'trouble', id: t.id } });
  notifyBranch(r, d.branchId, { templateId: 'trouble', title: '配送状況を確認しています', body: `${d.deliverOn} の便で確認が必要なことがありました。運営から連絡します。`, link: { type: 'delivery', id: d.id } });
}

/** 子の配送の明細・区間を親から写す（数は qty で変えられる・0 の品目は除く。ドライバーは委託・自社だけ引き継ぎ、受取はまだ） */
function copyChildParts(r: DocRepo, parentId: string, id: string, qty?: LineQty[], warehouseId?: string) {
  /* 納品の写し（商品名・支払額）は子に写さない（子が納品したときに写す）。明細 ID は親の行ごと（同じ商品の通常・代替品の行を別に持つ。B1） */
  const src = linesOf(r, parentId);
  const qs = lineQtys(src, qty, (l) => l.plannedQty, (l, max) => `${l.productId} の子の数量は 0〜${max} で入れてください`);
  const lines = src.map(({ productName: _n, ...l }) => ({ ...l, id: childLineId(l, parentId, id), deliveryId: id, plannedQty: qs.get(l.id)!, deliveredQty: null, ...(l.serviceQty ? { serviceQty: Math.min(l.serviceQty, qs.get(l.id)!) } : {}) }))
    .filter((l) => l.plannedQty > 0);
  lines.forEach((l) => r.put('dm.delivery.lines', l.id, l));
  legs(r).filter((l) => l.deliveryId === parentId).forEach(({ feeYen: _f, ...l }) => r.put<Leg>('dm.delivery.legs', `${id}:${l.legNo}`, {
    ...l, id: `${id}:${l.legNo}`, deliveryId: id, driverId: l.regime === 'parcel_carrier' ? '' : l.driverId, pickedUpAt: '',
    from: l.legNo === 1 && warehouseId ? { type: 'warehouse', id: warehouseId } : l.from,
  }));
  return lines.reduce((s, l) => s + l.plannedQty, 0);
}

/**
 * トラブルの自動子（確認中）を作る。親子は1階層まで：子でトラブルが起きたら、子からは複製せず親の次の枝番を作る（中身はトラブルが起きた子から・決定v2.3 #28）。
 * 枝番は9まで。数量は明細の合計（全量）。日付・数量は運営が確定するまで 確認中のまま
 */
function makeAutoChild(r: DocRepo, d: Delivery, typeName: string, troubleId: string) {
  const root = d.parentId || d.id;
  let n = 1;
  while (r.get('dm.delivery.deliveries', `${root}-${n}`) && n <= 9) n++;
  if (n > 9) throw new ApiError('枝番は最大9までです', 409);
  const id = `${root}-${n}`;
  const qty = copyChildParts(r, d.id, id);
  r.put<Delivery>('dm.delivery.deliveries', id, { ...d, id, parentId: root, status: '確認中', plannedQty: qty, shippedOn: undefined, deliveredQty: null, deliveredAt: '', completion: '', changeState: '変更不可', internalMemo: `${typeName}の自動の子（${troubleId}）` });
  return id;
}

/** 一部納品の残数を子の明細へ（親の行ごとに 予定 − 納品できた数。0 の行は子から外す）。子の配送の数量（残数の合計）を返す。残りが無ければ null（子はそのまま） */
function partialRest(r: DocRepo, parentId: string, childId: string): number | null {
  const src = linesOf(r, parentId);
  const rest = src.map((l) => ({ l, q: l.plannedQty - (l.deliveredQty ?? l.plannedQty) }));
  const total = rest.reduce((n, x) => n + x.q, 0);
  if (total <= 0) return null;
  for (const { l, q } of rest) {
    const id = childLineId(l, parentId, childId);
    const cl = r.get<DeliveryLine>('dm.delivery.lines', id);
    if (q > 0) r.put('dm.delivery.lines', id, { ...(cl ?? { ...l, id, deliveryId: childId, deliveredQty: null }), plannedQty: q });
    else if (cl) r.remove('dm.delivery.lines', id);
  }
  return total;
}

/** トラブルの解決のあとの親の状態（当日中の再訪は変えない） */
const RESOLVED_STATUS: Partial<Record<Trouble['resolution'], Delivery['status']>> = {
  full: '納品済', partial: '一部納品済', partial_no_resend: '一部納品済', redelivery: '再配達待', stop: '中止',
};

const hidden90 =(d: Pick<Delivery, 'status' | 'deliverOn'>) => ['納品済', '中止', '取消'].includes(d.status) && d.deliverOn < addDays(today(), -90);

function audit(r: DocRepo, d: Delivery, t: string) {
  d.internalMemo = [d.internalMemo, `${nowStamp()} ${t}`].filter(Boolean).join('\n');
  r.put('dm.delivery.deliveries', d.id, d);
}

export default defineArea({
  name: 'delivery',
  seed: () => {
    const s = buildDeliveries(buildChildContracts());
    return {
      'dm.delivery.cycles': toDocs(CYCLES),
      'dm.delivery.holidays': toDocs(HOLIDAYS),
      'dm.delivery.cycleSettingsLog': toDocs(CYCLE_SETTINGS_LOG),
      'dm.delivery.deliveries': toDocs(s.deliveries),
      'dm.delivery.lines': toDocs(s.lines),
      'dm.delivery.legs': toDocs(s.legs),
      'dm.delivery.tracking': toDocs(s.tracking),
      'dm.delivery.troubles': toDocs(s.troubles),
      'dm.delivery.changeRequests': toDocs(s.changeRequests),
      'dm.delivery.materialOrders': toDocs(s.materialOrders),
    };
  },
  queries: {
    cycles: (r) => cycles(r),
    holidays: (r) => holidays(r),
    /** サイクル暦（28枠）。お届け・出荷できるか付き */
    calendar(r, { cycleMonth }: { cycleMonth: string }) {
      const c = cycles(r).find((x) => x.id === cycleMonth);
      if (!c) throw new ApiError(`サイクル ${cycleMonth} がありません`, 404);
      return WEEKS.flatMap((w) => [1, 2, 3, 4, 5, 6, 7].map((n) => {
        const slot = `${w}${n}`;
        const date = slotDate(c, slot);
        return { slot, date, holiday: holidays(r).find((h) => h.date === date)?.name ?? '', canDeliver: canDeliver(cycles(r), holidays(r), date), canPick: canPick(cycles(r), holidays(r), date) };
      }));
    },
    /** 運営：一覧（絞り込み） */
    list: (r, a?: { cycleMonth?: string; branchId?: string; status?: Delivery['status']; date?: string }) =>
      all(r).filter((d) => (!a?.cycleMonth || d.cycleMonth === a.cycleMonth) && (!a?.branchId || d.branchId === a.branchId) && (!a?.status || d.status === a.status) && (!a?.date || d.deliverOn === a.date)),
    /** 運営：詳細（すべて） */
    detail(r, { id }: { id: string }) {
      const d = get(r, id);
      return {
        delivery: d, lines: linesOf(r, id), legs: legs(r).filter((l) => l.deliveryId === id).map((l) => legView(r, l)),
        tracking: r.list<Tracking>('dm.delivery.tracking').filter((t) => t.deliveryId === id),
        troubles: r.list<Trouble>('dm.delivery.troubles').filter((t) => t.deliveryId === id),
        changeRequests: r.list<ChangeRequest>('dm.delivery.changeRequests').filter((c) => c.deliveryId === id),
        children: all(r).filter((x) => x.parentId === id),
      };
    },
    /** 法人Web：拠点のお届け（拠点アカウント）。corpId なら配下の全拠点（法人アカウント） */
    forCorp(r, a: { branchId?: string; corpId?: string; cycleMonth?: string }) {
      const ids = a.branchId ? [a.branchId] : r.list<Branch>('dm.org.branches').filter((b) => b.corpId === a.corpId).map((b) => b.id);
      return all(r).filter((d) => ids.includes(d.branchId) && (!a.cycleMonth || d.cycleMonth === a.cycleMonth)).map((d) => forCorpView(r, d));
    },
    /** 委託配送先Web：自社の区間（date＝その日に受け取る・届ける区間） */
    forCarrier(r, a: { carrierId: string; from?: string; to?: string; unassigned?: boolean }) {
      return legs(r).filter((l) => l.carrierId === a.carrierId && (!a.unassigned || !l.driverId)).map((l) => legView(r, l))
        .filter((v) => (!a.from || v.delivery.deliverOn >= a.from) && (!a.to || v.delivery.shipOn <= a.to) && !hidden90(v.delivery));
    },
    /** ドライバー：その日の受取（倉庫・ハブで受け取る）と納品（届ける） */
    driverDay(r, { driverId, date }: { driverId: string; date?: string }) {
      const day = date ?? today();
      const mine = legs(r).filter((l) => l.driverId === driverId).map((l) => legView(r, l));
      const active = (v: ReturnType<typeof legView>) => !['取消', '中止'].includes(v.delivery.status);
      return {
        date: day,
        driver: r.get<Driver>('dm.master.drivers', driverId) ?? null,
        pickups: mine.filter((v) => active(v) && v.delivery.shipOn === day),
        deliveries: mine.filter((v) => active(v) && (v.leg.isFinal ? v.delivery.deliverOn : v.delivery.shipOn) === day),
      };
    },
    troubles: (r, a?: { open?: boolean }) => r.list<Trouble>('dm.delivery.troubles').filter((t) => !a?.open || !t.resolution),
    changeRequests: (r, a?: { status?: ChangeRequest['status']; branchId?: string }) =>
      r.list<ChangeRequest>('dm.delivery.changeRequests').filter((c) => (!a?.status || c.status === a.status) && (!a?.branchId || c.branchId === a.branchId)),
    materialOrders: (r, a?: { branchId?: string }) => r.list<MaterialOrder>('dm.delivery.materialOrders').filter((m) => !a?.branchId || m.branchId === a.branchId),
    /** 運営：スケジュールの移動の確認（errors・needs・warnings・行。課題 2-4） */
    movePlan: (r, a: Pick<MoveArgs, 'ids' | 'to' | 'reason' | 'trouble' | 'troubleId'>) => movePlan(r, a),
    /** 運営：移動先の候補のカレンダー（前後のサイクルを含む） */
    moveCalendar: (r, a: { ids: string[] }) => moveCalendar(r, a),
    /** 運営：配送サイクル設定の変更履歴（新しい順。P-HIST） */
    cycleSettingsLog: (r) => r.list<CycleSettingsLog>('dm.delivery.cycleSettingsLog').sort((x, y) => y.at.localeCompare(x.at) || y.id.localeCompare(x.id)),
    /** 運営：移動の履歴（新しい順。deliveryId でその配送の移動だけ） */
    moves: (r, a?: { deliveryId?: string }) => r.list<DeliveryMove>(MOVES).filter((m) => !a?.deliveryId || m.rows.some((x) => x.deliveryId === a.deliveryId)).sort((x, y) => y.at.localeCompare(x.at) || y.id.localeCompare(x.id)),
  },
  actions: {
    /** 運営：配送サイクル設定を保存したときの変更履歴を足す（変えた項目ごとに1行。保存のたびに呼ぶ） */
    logCycleSettings: (r, a: { by: string; rows: Omit<CycleSettingsLog, 'id' | 'at' | 'by'>[] }) => {
      const at = nowStamp();
      return a.rows.map((x) => {
        const id = `CSL-${String(r.list('dm.delivery.cycleSettingsLog').length + 1).padStart(4, '0')}`;
        const row: CycleSettingsLog = { id, at, by: a.by, ...x };
        r.put<CycleSettingsLog>('dm.delivery.cycleSettingsLog', id, row);
        return row;
      });
    },
    /** 運営：スケジュールで選んだ配送を別のお届け日へ動かす（課題 2-4。決まりは lib/domain/move.ts） */
    move: (r, a: MoveArgs) => moveDeliveries(r, a),
    /** 運営：配送データをまだ作っていないサイクル月の A1 を変える（課題 4-10） */
    /** A1 を変える（オーダー締切は動かさない。合わなくなった締切は warnings・課題 4b-10） */
    setCycleA1: (r, a: { cycleMonth: string; a1: string }) => {
      const before = unfitCycles(r, [a.cycleMonth]);
      return { ...setCycleA1(r, a), warnings: orderDeadlineWarnings(r, [a.cycleMonth], before) };
    },
    /** 法人：お届け日の変更申請（次のサイクルから・締切前・予定のものだけ。開いている申請は1つまで） */
    requestDateChange(r, a: { deliveryId: string; wishDates: string[]; reason: string; accountId: string }) {
      const d = get(r, a.deliveryId);
      const c = cycles(r).find((x) => x.id === d.cycleMonth)!;
      if (d.status !== '予定' || c.orderState !== '受付中') throw new ApiError('締切前のお届け予定だけ変更を申請できます', 409);
      if (r.list<ChangeRequest>('dm.delivery.changeRequests').some((x) => x.deliveryId === d.id && ['申請中', '別の日のご提案'].includes(x.status))) throw new ApiError('この配送には申請中の変更があります', 409);
      /* 希望日なし（ESキッチンにおまかせ）は空でよい（台帳 E 2026-10-05・法人Web の「希望日なし」） */
      const wish = a.wishDates.filter(Boolean);
      for (const w of wish) {
        const s = slotOf(cycles(r), w);
        if (!s || s.cycle.id !== d.cycleMonth || (s.slot[0] <= 'B') !== (d.slot[0] <= 'B')) throw new ApiError(`希望日 ${w} は同じサイクルの同じ半分（A・B／C・D）にしてください`, 400);
        if (!canDeliver(cycles(r), holidays(r), w)) throw new ApiError(`${w} はお届けできない日です`, 400);
      }
      const id = nextNo(r, 'dm.delivery.changeRequests', `DD-${today().replace(/\//g, '')}`);
      const cr: ChangeRequest = {
        id, deliveryId: d.id, branchId: d.branchId, requestedBy: { site: 'corp', accountId: a.accountId }, requestedAt: nowStamp(),
        currentDate: d.deliverOn, wishDates: wish, reason: a.reason, status: '申請中', proposedDate: '', decidedAt: '', decisionReason: '',
      };
      r.put('dm.delivery.changeRequests', id, cr);
      r.put('dm.delivery.deliveries', d.id, { ...d, changeState: '申請中' });
      notify(r, { to: { site: 'ops', accountId: '', role: 'ops.delivery' }, templateId: 'date_change', title: `お届け日の変更の申請（${id}）`, body: `${d.destination.name}：${d.deliverOn} → ${wish.join('・')}`, link: { type: 'delivery', id: d.id } });
      return cr;
    },
    /** 運営：承認（date＝決めた日）・否認・別の日の提案 */
    decideDateChange(r, a: { id: string; decision: '承認' | '否認' | '別の日のご提案'; date?: string; reason?: string }) {
      const cr = r.get<ChangeRequest>('dm.delivery.changeRequests', a.id);
      if (!cr || !['申請中', '別の日のご提案'].includes(cr.status)) throw new ApiError('処理できる申請が見つかりません', 409);
      const d = get(r, cr.deliveryId);
      if (a.decision === '否認' && !a.reason?.trim()) throw new ApiError('否認の理由を入れてください', 400);
      const next: ChangeRequest = { ...cr, status: a.decision, decidedAt: nowStamp(), decisionReason: a.reason ?? '' };
      if (a.decision === '別の日のご提案') next.proposedDate = a.date ?? '';
      if (a.decision === '承認') {
        const date = a.date ?? cr.wishDates[0];
        const lead = Math.round((new Date(d.deliverOn).getTime() - new Date(d.shipOn).getTime()) / 86400000);
        r.put('dm.delivery.deliveries', d.id, { ...d, deliverOn: date, shipOn: addDays(date, -lead), slot: slotOf(cycles(r), date)?.slot ?? d.slot, changeState: '調整済' });
      } else {
        r.put('dm.delivery.deliveries', d.id, { ...d, changeState: a.decision === '否認' ? '変更可' : '提案中' });
      }
      r.put('dm.delivery.changeRequests', cr.id, next);
      notifyBranch(r, d.branchId, { templateId: 'date_change', title: `お届け日の変更：${a.decision}（${cr.id}）`, body: a.decision === '承認' ? `${cr.currentDate} の便を ${a.date ?? cr.wishDates[0]} にお届けします。` : a.decision === '否認' ? `理由：${a.reason}` : `${a.date} はいかがでしょうか（法人Web でお返事ください）`, link: { type: 'delivery', id: d.id } });
      return next;
    },
    /** 法人：別の日のご提案への返事。受ける＝承認（お届け日がご提案の日）／断る＝運営が別の日を調整する */
    answerProposal(r, a: { id: string; accept: boolean; accountId: string }) {
      const cr = r.get<ChangeRequest>('dm.delivery.changeRequests', a.id);
      if (!cr || cr.status !== '別の日のご提案' || !cr.proposedDate) throw new ApiError('ご返事できる申請ではありません', 409);
      const d = get(r, cr.deliveryId);
      if (a.accept) {
        const lead = Math.round((new Date(d.deliverOn).getTime() - new Date(d.shipOn).getTime()) / 86400000);
        r.put('dm.delivery.deliveries', d.id, { ...d, deliverOn: cr.proposedDate, shipOn: addDays(cr.proposedDate, -lead), slot: slotOf(cycles(r), cr.proposedDate)?.slot ?? d.slot, changeState: '調整済' });
        r.put('dm.delivery.changeRequests', cr.id, { ...cr, status: '承認', decidedAt: nowStamp(), decisionReason: '法人がご提案を受けました' });
      } else {
        r.put('dm.delivery.changeRequests', cr.id, { ...cr, status: '申請中', declinedAt: today() });
        r.put('dm.delivery.deliveries', d.id, { ...d, changeState: '申請中' });
      }
      notify(r, { to: { site: 'ops', accountId: '', role: 'ops.delivery' }, templateId: 'date_change', title: `ご提案への返事：${a.accept ? '受ける' : '断る'}（${cr.id}）`, body: `${d.destination.name} ${cr.currentDate} の便`, link: { type: 'delivery', id: d.id } });
      return r.get<ChangeRequest>('dm.delivery.changeRequests', cr.id);
    },
    /** 法人：申請の取り下げ */
    withdrawDateChange(r, { id }: { id: string }) {
      const cr = r.get<ChangeRequest>('dm.delivery.changeRequests', id);
      if (!cr || !['申請中', '別の日のご提案'].includes(cr.status)) throw new ApiError('取り下げられる申請が見つかりません', 409);
      r.put('dm.delivery.changeRequests', id, { ...cr, status: '取り下げ', decidedAt: nowStamp() });
      const d = get(r, cr.deliveryId);
      r.put('dm.delivery.deliveries', d.id, { ...d, changeState: '変更可' });
      return { ok: true };
    },
    /** 委託配送先：自社の区間にドライバーを割り当てる（driverId＝'' で外す） */
    assignDriver(r, { legId, driverId, carrierId }: { legId: string; driverId: string; carrierId: string }) {
      const l = r.get<Leg>('dm.delivery.legs', legId);
      if (!l || l.carrierId !== carrierId) throw new ApiError('自社の区間ではありません', 403);
      if (l.regime === 'parcel_carrier') throw new ApiError('路線便の区間はドライバーを割り当てません', 400);
      if (driverId) {
        const dr = r.get<Driver>('dm.master.drivers', driverId);
        if (!dr || dr.carrierId !== carrierId || dr.status !== '有効') throw new ApiError('自社の有効なドライバーを選んでください', 400);
      }
      const next = { ...l, driverId };
      r.put('dm.delivery.legs', legId, next);
      if (driverId) {
        const d = get(r, l.deliveryId);
        notify(r, { to: { site: 'driver', accountId: driverId, role: '' }, channels: ['site'], templateId: '', title: '配送が割り当てられました', body: `${d.deliverOn} ${d.destination.name}`, link: { type: 'delivery', id: d.id } });
      }
      return next;
    },
    /** ドライバー：倉庫・ハブで受け取った */
    pickup(r, { legId, driverId }: { legId: string; driverId: string }) {
      const l = r.get<Leg>('dm.delivery.legs', legId);
      if (!l || l.driverId !== driverId) throw new ApiError('自分の区間ではありません', 403);
      if (l.pickedUpAt) throw new ApiError('すでに受け取り済みです', 409);
      const d = get(r, l.deliveryId);
      if (!['出荷待', '出荷済', '受取済'].includes(d.status)) throw new ApiError(`この配送は受け取れません（${d.status}）`, 409);
      r.put('dm.delivery.legs', legId, { ...l, pickedUpAt: nowStamp() });
      if (d.status !== '受取済') r.put('dm.delivery.deliveries', d.id, { ...d, status: '受取済' });
      return { ok: true };
    },
    /** ドライバー：納品の完了。品目ごとの数量（省略で予定どおり）。足りなければ一部納品済＋数量相違のトラブル */
    complete: (r, a: { deliveryId: string; driverId: string; lines?: LineQty[]; earlyReason?: string }) => completeDelivery(r, a),
    /** ドライバー・委託配送先・運営：トラブル報告。自動で子を作る種類（誤配送・破損・不在）は確認中の子の配送を作る（開いている子は1つまで） */
    reportTrouble(r, a: { deliveryId: string; typeId: TroubleType['id']; note: string; site: Trouble['reportedBy']['site']; accountId: string }) {
      const d = get(r, a.deliveryId);
      const type = r.get<TroubleType>('dm.master.troubleTypes', a.typeId);
      if (!type) throw new ApiError('トラブルの種類が正しくありません', 400);
      /* 数量相違は配送に1つ（開いていれば追記する・課題 4-3） */
      const dup = a.typeId === 'qty_diff' ? r.list<Trouble>('dm.delivery.troubles').find((t) => t.deliveryId === d.id && !t.resolution && t.typeId === 'qty_diff') : undefined;
      if (dup) {
        const next: Trouble = { ...dup, note: [dup.note, a.note].filter(Boolean).join('／') };
        r.put('dm.delivery.troubles', dup.id, next);
        return next;
      }
      const id = nextNo(r, 'dm.delivery.troubles', `TR-${d.deliverOn.slice(2).replace(/\//g, '')}`);
      let childDeliveryId = '';
      if (type.autoChild && !all(r).some((x) => x.parentId === d.id && x.status === '確認中')) {
        childDeliveryId = makeAutoChild(r, d, type.name, id);
      }
      const t: Trouble = { id, deliveryId: d.id, typeId: a.typeId, reportedBy: { site: a.site, accountId: a.accountId }, reportedAt: nowStamp(), note: a.note, resolution: '', resolvedAt: '', childDeliveryId };
      r.put('dm.delivery.troubles', id, t);
      troubleNotice(r, d, t);
      return t;
    },
    /** ドライバー・委託配送先・運営：報告済みのトラブルに追記（解決前だけ） */
    appendTrouble(r, a: { id: string; text: string }) {
      const t = r.get<Trouble>('dm.delivery.troubles', a.id);
      if (!t) throw new ApiError(`トラブルが見つかりません（${a.id}）`, 404);
      if (t.resolution) throw new ApiError('解決済みのトラブルには追記できません', 409);
      if (!a.text?.trim()) throw new ApiError('追記する内容を入れてください', 400);
      const next: Trouble = { ...t, note: [t.note, a.text.trim()].filter(Boolean).join('／') };
      r.put('dm.delivery.troubles', t.id, next);
      return next;
    },
    /** 運営：トラブルの解決（配送ごとに、開いている報告をまとめて閉じる） */
    resolveTrouble(r, a: { deliveryId: string; resolution: Exclude<Trouble['resolution'], ''>; reason?: string; childDate?: string; lines?: LineQty[]; typeId?: Trouble['typeId'] }) {
      const open = r.list<Trouble>('dm.delivery.troubles').filter((t) => t.deliveryId === a.deliveryId && !t.resolution);
      if (!open.length) throw new ApiError('開いているトラブルがありません', 409);
      /* 納品できた数（商品ごと。納品済・一部納品済にするときだけ）：明細の届けた数と配送の合計に残す */
      let qtyNote = '';
      if (a.lines?.length && ['full', 'partial', 'partial_no_resend'].includes(a.resolution)) {
        const ls = linesOf(r, a.deliveryId);
        const qs = lineQtys(ls, a.lines, (l) => l.deliveredQty ?? l.plannedQty, (l, max) => `${l.productId} の納品できた数は 0〜${max} で入れてください`);
        let total = 0;
        for (const l of ls) { const q = qs.get(l.id)!; total += q; r.put('dm.delivery.lines', l.id, { ...l, deliveredQty: q }); }
        r.put('dm.delivery.deliveries', a.deliveryId, { ...get(r, a.deliveryId), deliveredQty: total });
        qtyNote = `・納品できた数 ${total}`;
      }
      /* 種別未定の報告には、解決のときに運営が6区分の種別を付ける（typeId） */
      open.forEach((t) => r.put('dm.delivery.troubles', t.id, { ...t, ...(a.typeId && t.typeId === 'undecided' ? { typeId: a.typeId } : {}), resolution: a.resolution, resolvedAt: nowStamp() }));
      const d = get(r, a.deliveryId);
      audit(r, d, `トラブル解決：${a.resolution}${qtyNote}${a.reason ? `（${a.reason}）` : ''}`);
      /* 解決のあとの親の状態（当日中の再訪は受取済のまま） */
      const st = RESOLVED_STATUS[a.resolution];
      if (st) r.put('dm.delivery.deliveries', d.id, { ...get(r, d.id), status: st });
      if (st === '納品済' || st === '一部納品済') stampDelivered(r, d.id);
      /* 子：送り直す（再配送・当日の再訪・一部の残り）は出荷待（日付を指定できる）、ほかは取消 */
      /* 種別未定の報告に「作る」種別を付けて、送り直す解決にするときは、その時点で自動子を作る（配送_07 §13-2） */
      if (a.typeId && open.some((t) => t.typeId === 'undecided') && r.get<TroubleType>('dm.master.troubleTypes', a.typeId)?.autoChild
        && ['redelivery', 'same_day_revisit', 'partial'].includes(a.resolution) && !all(r).some((x) => x.parentId === d.id && x.status === '確認中')) {
        const cid = makeAutoChild(r, d, r.get<TroubleType>('dm.master.troubleTypes', a.typeId)!.name, open[0].id);
        open.forEach((t) => r.put('dm.delivery.troubles', t.id, { ...(r.get<Trouble>('dm.delivery.troubles', t.id) ?? t), childDeliveryId: t.childDeliveryId || cid }));
      }
      const openIds = new Set(open.map((t) => t.id));
      const autoIds = new Set(r.list<Trouble>('dm.delivery.troubles').filter((t) => openIds.has(t.id)).map((t) => t.childDeliveryId).filter(Boolean));
      for (const c of all(r).filter((x) => x.status === '確認中' && (x.parentId === d.id || autoIds.has(x.id)))) {
        const keep = ['redelivery', 'same_day_revisit', 'partial'].includes(a.resolution);
        const lead = Math.round((new Date(c.deliverOn).getTime() - new Date(c.shipOn).getTime()) / 86400000);
        const dates = keep && a.childDate ? { deliverOn: a.childDate, shipOn: addDays(a.childDate, -lead) } : {};
        /* 分納（partial）：子の数量＝まだ届いていない数（親の予定 − 納品できた数）。配送_07 §13-2（自動の子も「数量・明細＝残数」で使い回す） */
        const rest = a.resolution === 'partial' ? partialRest(r, d.id, c.id) : null;
        r.put('dm.delivery.deliveries', c.id, { ...c, ...dates, ...(rest !== null ? { plannedQty: rest } : {}), status: keep ? '出荷待' : '取消' });
      }
      return { closed: open.length };
    },
    /** 運営：配送の取消（出荷の前・確認中の子だけ） */
    cancelDelivery(r, a: { id: string; reason: string }) {
      const d = get(r, a.id);
      if (!['予定', '出荷待', '確認中'].includes(d.status)) throw new ApiError(`この配送は取消できません（${d.status}）`, 409);
      if (!a.reason?.trim()) throw new ApiError('理由を入れてください', 400);
      audit(r, { ...d, status: '取消', changeState: '変更不可' }, `取消：${a.reason}`);
      notifyBranch(r, d.branchId, { templateId: '', title: 'お届けの取消', body: `${d.deliverOn} のお届けを取り消しました。`, link: { type: 'delivery', id: d.id } });
      return get(r, a.id);
    },
    /** 運営：子の配送を作る（分納・再配送・代替便・返送など。確認中で作る・枝番は9まで）。qty 省略で親と同じ数 */
    addChild(r, a: { id: string; kind: string; reason: string; deliverOn: string; warehouseId?: string; qty?: LineQty[] }) {
      const d = get(r, a.id);
      if (d.parentId || ['予定', '取消'].includes(d.status)) throw new ApiError('この配送からは子を作れません', 409);
      let n = 1;
      while (r.get('dm.delivery.deliveries', `${d.id}-${n}`) && n <= 9) n++;
      if (n > 9) throw new ApiError('枝番は最大9までです', 409);
      const id = `${d.id}-${n}`;
      const pq = lineQtys(linesOf(r, d.id), a.qty, (l) => l.plannedQty, (l, max) => `${l.productId} の子の数量は 0〜${max} で入れてください`);
      if (![...pq.values()].some((q) => q > 0)) throw new ApiError('子の数量を入れてください', 400);
      const lead = Math.round((new Date(d.deliverOn).getTime() - new Date(d.shipOn).getTime()) / 86400000);
      const qty = copyChildParts(r, d.id, id, a.qty, a.warehouseId);
      r.put<Delivery>('dm.delivery.deliveries', id, {
        ...d, id, parentId: d.id, status: '確認中', deliverOn: a.deliverOn, shipOn: addDays(a.deliverOn, -lead), slot: slotOf(cycles(r), a.deliverOn)?.slot ?? d.slot,
        warehouseId: a.warehouseId || d.warehouseId, plannedQty: qty, shippedOn: undefined, deliveredQty: null, deliveredAt: '', completion: '', changeState: '変更不可', internalMemo: `${a.kind}（${a.reason}）`,
      });
      return get(r, id);
    },
    /** 運営：確認中の子の日付を決めて出荷待にする（親のトラブルが解決してから） */
    confirmChild(r, a: { id: string; deliverOn: string }) {
      const c = get(r, a.id);
      if (!c.parentId || c.status !== '確認中') throw new ApiError('確認中の子ではありません', 409);
      if (r.list<Trouble>('dm.delivery.troubles').some((t) => t.deliveryId === c.parentId && !t.resolution)) throw new ApiError('親のトラブルが未解決のため確定できません', 409);
      const lead = Math.round((new Date(c.deliverOn).getTime() - new Date(c.shipOn).getTime()) / 86400000);
      audit(r, { ...c, status: '出荷待', deliverOn: a.deliverOn, shipOn: addDays(a.deliverOn, -lead) }, `子の納品日を ${a.deliverOn} に確定 → 出荷待`);
      return get(r, a.id);
    },
    /** 運営：この配送だけの変更（受取の時間帯・お届け日。お届け日は同じサイクルの同じ半分で、出荷の前だけ）。理由は運営のメモに残す */
    editDelivery(r, a: { id: string; reason: string; windows?: { from: string; to: string }[]; deliverOn?: string; note?: string; carrierId?: string; address?: { pref: string; city: string; addr1: string; addr2: string } }) {
      const d = get(r, a.id);
      if (!a.reason?.trim()) throw new ApiError('変更理由を入れてください', 400);
      if (['納品済', '一部納品済', '中止', '取消'].includes(d.status)) throw new ApiError(`この配送は変更できません（${d.status}）`, 409);
      const next: Delivery = { ...d };
      const what: string[] = a.note ? [a.note] : [];
      if (a.windows) { next.destination = { ...d.destination, windows: a.windows }; what.push(`受取の時間帯 → ${a.windows.map((w) => `${w.from}〜${w.to}`).join('・')}`); }
      if (a.deliverOn && a.deliverOn !== d.deliverOn) {
        if (!['予定', '出荷待'].includes(d.status) || d.shipOn <= today()) throw new ApiError('出荷の前日までの配送だけ日付を変えられます', 409);
        const s = slotOf(cycles(r), a.deliverOn);
        if (!s || s.cycle.id !== d.cycleMonth || (s.slot[0] <= 'B') !== (d.slot[0] <= 'B')) throw new ApiError('同じサイクルの同じ半分（A・B／C・D）の日にしてください', 400);
        const lead = Math.round((new Date(d.deliverOn).getTime() - new Date(d.shipOn).getTime()) / 86400000);
        const ship = addDays(a.deliverOn, -lead);
        if (!canDeliver(cycles(r), holidays(r), a.deliverOn) || !canPick(cycles(r), holidays(r), ship, d.warehouseId)) throw new ApiError('お届け・出荷できない日です', 400);
        Object.assign(next, { deliverOn: a.deliverOn, shipOn: ship, slot: s.slot, changeState: '調整済' });
        what.push(`お届け日 ${d.deliverOn} → ${a.deliverOn}（出荷 ${ship}）`);
        notifyBranch(r, d.branchId, { templateId: 'date_change', title: 'お届け日を変更しました', body: `${d.deliverOn} の便を ${a.deliverOn} にお届けします。理由：${a.reason}`, link: { type: 'delivery', id: d.id } });
      }
      /* 配送会社②・納品先の住所（配送_08 §15-13）：出荷指示を送ったあとなら版を上げて再送。住所は送り状を無効にして取り直す */
      const sent = instructionSent(r, d, today());
      let resend = false;
      if (a.carrierId) {
        const ca = r.get<Carrier>('dm.master.carriers', a.carrierId);
        const fin = legs(r).filter((l) => l.deliveryId === d.id).sort((x, y) => y.legNo - x.legNo)[0];
        if (!ca || !fin) throw new ApiError('配送会社が見つかりません', 400);
        if (fin.carrierId !== ca.id) {
          const regime: Leg['regime'] = ca.kind === '自社' ? 'self' : ca.kind === '路線' ? 'parcel_carrier' : 'partner_driver';
          r.put<Leg>('dm.delivery.legs', fin.id, { ...fin, carrierId: ca.id, regime, driverId: '', assignScope: regime === 'partner_driver' ? 'carrier' : 'ops', feeYen: undefined });
          /* 配送全体の運び手も最終区間に合わせる。配送区分（ES配送便／COOL便）は変えない。路線便でなくなったら送り状は無効にする */
          next.regime = regime;
          if (regime !== 'parcel_carrier') r.list<Tracking>('dm.delivery.tracking').filter((t) => t.deliveryId === d.id && t.status === 'active').forEach((t) => r.put<Tracking>('dm.delivery.tracking', t.id, { ...t, status: 'voided' }));
          what.push(`配送会社② ${r.get<Carrier>('dm.master.carriers', fin.carrierId)?.name ?? fin.carrierId} → ${ca.name}`);
          resend = true;
        }
      }
      if (a.address) {
        next.destination = { ...(next.destination), address: { ...d.destination.address, ...a.address } };
        what.push(`納品先の住所 → ${a.address.pref}${a.address.city}${a.address.addr1}${a.address.addr2 ? ' ' + a.address.addr2 : ''}`);
        r.list<Tracking>('dm.delivery.tracking').filter((t) => t.deliveryId === d.id && t.status === 'active').forEach((t) => r.put<Tracking>('dm.delivery.tracking', t.id, { ...t, status: 'voided' }));
        resend = true;
      }
      if (resend && sent) { next.shipRev = (d.shipRev ?? 1) + 1; what.push(`出荷指示を再送（rev${next.shipRev}）`); }
      audit(r, next, `変更：${what.join('、') || '変更なし'}（理由：${a.reason}）`);
      return get(r, a.id);
    },
    /**
     * 運営：送り状番号の登録・訂正（路線便＝ヤマトなど。課題 0-2：ヤマトの API は使わないので運営が入れる）。
     * id があればその送り状の番号を直す、なければ足す（箱の番号は続き）。ヤマトは12桁の数字（ハイフンは除いて持たない＝入れたまま）
     */
    setTracking(r, a: { deliveryId: string; trackingNo: string; id?: string; carrierId?: string; by?: string }) {
      const d = get(r, a.deliveryId);
      const no = (a.trackingNo ?? '').trim();
      if (!no) throw new ApiError('送り状番号を入れてください', 400);
      const leg = legs(r).find((l) => l.deliveryId === d.id && l.regime === 'parcel_carrier') ?? legs(r).find((l) => l.deliveryId === d.id && l.isFinal);
      const carrierId = a.carrierId || leg?.carrierId || '';
      const c = r.get<Carrier>('dm.master.carriers', carrierId);
      if (!c || c.kind !== '路線') throw new ApiError('送り状番号は路線便（ヤマトなど）の配送だけに入れられます', 400);
      if (isYamato(c) && !isYamatoNo(no)) throw new ApiError('ヤマトの送り状番号は12桁の数字です', 400);
      const mine = r.list<Tracking>('dm.delivery.tracking').filter((t) => t.deliveryId === d.id);
      if (r.list<Tracking>('dm.delivery.tracking').some((t) => t.id !== a.id && t.status === 'active' && trackingDigits(t.trackingNo) === trackingDigits(no))) throw new ApiError(`送り状番号 ${no} はほかの荷物で使っています`, 409);
      let next: Tracking;
      if (a.id) {
        const cur = mine.find((t) => t.id === a.id);
        if (!cur) throw new ApiError('送り状が見つかりません', 404);
        next = { ...cur, trackingNo: no, carrierId, status: 'active' };
        audit(r, d, `送り状番号の訂正：${cur.trackingNo} → ${no}`);
      } else {
        const n = mine.length + 1;
        next = { id: `${d.id}:${n}`, deliveryId: d.id, carrierId, trackingNo: no, boxNo: n, boxTotal: n, status: 'active' };
        mine.forEach((t) => r.put<Tracking>('dm.delivery.tracking', t.id, { ...t, boxTotal: n }));
        audit(r, d, `送り状番号の登録：${no}`);
      }
      r.put<Tracking>('dm.delivery.tracking', next.id, next);
      /* 同じ出荷日・同じ運送会社の送り状がそろったら配送依頼（旧システムの「配送依頼通知」・lib/domain/mails.ts） */
      deliveryRequestCheck(r, d.id, hasTracking(r), '路線');
      return { ...next, url: trackingUrlOf(c, no) };
    },
    /** 運営：送り状を無効にする（誤って入れた番号。記録は残す） */
    voidTracking(r, a: { id: string; by?: string }) {
      const t = r.get<Tracking>('dm.delivery.tracking', a.id);
      if (!t) throw new ApiError('送り状が見つかりません', 404);
      r.put<Tracking>('dm.delivery.tracking', t.id, { ...t, status: 'voided' });
      audit(r, get(r, t.deliveryId), `送り状番号を無効：${t.trackingNo}`);
      return { ok: true };
    },
    /** 運営：運営だけのメモを足す */
    addMemo(r, a: { id: string; text: string }) {
      if (!a.text?.trim()) throw new ApiError('メモを入れてください', 400);
      audit(r, get(r, a.id), `メモ：${a.text.trim()}`);
      return { ok: true };
    },
    /** 運営：祝日・出荷しない日の暦を置き換える（作り済みの配送の日付は動かさない） */
    setHolidays(r, a: { holidays: Holiday[] }) {
      if (a.holidays.some((h) => !/^\d{4}\/\d{2}\/\d{2}$/.test(h.date) || !h.name.trim())) throw new ApiError('日付・名前が正しくありません', 400);
      /* 倉庫ごとの出荷禁止日（課題 4-10）：ピッキング倉庫だけ */
      const badWh = a.holidays.flatMap((h) => h.warehouseIds ?? []).find((w) => r.get<Warehouse>('dm.master.warehouses', w)?.type !== 'picking');
      if (badWh) throw new ApiError(`出荷禁止日の倉庫 ${badWh} はピッキング倉庫ではありません`, 400);
      const keep = new Set(a.holidays.map((h) => h.id));
      holidays(r).filter((h) => !keep.has(h.id)).forEach((h) => r.remove('dm.delivery.holidays', h.id));
      a.holidays.forEach((h) => r.put('dm.delivery.holidays', h.id, h));
      return holidays(r);
    },
    /**
     * 法人（運営の代理も）：資材の注文。いつでも注文でき、1件＝1つの資材便（ES事務所 WH00004 → ヤマト・出荷はお届けのリードタイム分前）。
     * リードタイム＝契約の配送区分（資材）の値（なければ2日：lib/domain/matOrder.ts・受付簿 #262）。お届けは 注文日の翌日以降でリードタイムを守れる最初の日（日曜・お届けしない祝日を除く）。
     * 運営が日付を決めて登録することもできる（dueOn）。
     * 「何回目」は納品予定日のサイクル月で数え、2回目からは有料（OP000036・お試しの拠点は付けない・2026/10/06 受付簿 #277）。
     * プランの数量を超えた資材は 資材の単価 × 超えた数（excess・lib/domain/charges.ts の materialExcess。単価 0 の資材は請求しない）
     */
    placeMaterialOrder(r, a: { branchId: string; lines: { materialId: string; qty: number }[]; accountId: string; dueOn?: string }) {
      const b = r.get<Branch>('dm.org.branches', a.branchId);
      if (!b) throw new ApiError('拠点が見つかりません', 404);
      const ct = r.list<{ id: string; branchId: string; status: string }>('dm.org.contracts').find((c) => c.branchId === b.id && ['有効', '解約手続き中'].includes(c.status));
      if (!ct) throw new ApiError('資材を注文できる契約がありません', 409);
      const lines = a.lines.filter((l) => l.qty > 0);
      if (!lines.length) throw new ApiError('注文数を1つ以上入れてください', 400);
      if (lines.some((l) => !Number.isInteger(l.qty) || l.qty > 999 || !r.get('dm.master.materials', l.materialId))) throw new ApiError('資材・数が正しくありません', 400);
      if (a.dueOn && (!isRealDate(a.dueOn) || a.dueOn <= today())) throw new ApiError('お届け日は明日以降の日付にしてください', 400);
      const lead = matLeadDays(r, b.id, today());
      const dueOn = a.dueOn || matNextDue(r, b.id, today());
      const shipOn = addDays(dueOn, -lead);
      const cyc = cycleMonthAt(r, today());
      const excess = materialExcess(r, b.id, cyc, lines);
      /* 番号：MO-YYMM-NNNN／DL-<出荷日>-NNNN（子の配送 -1 などは数えない） */
      const seq = (kind: string, prefix: string) => `${prefix}-${String(Math.max(0, ...r.list<{ id: string }>(kind).map((x) => x.id.match(new RegExp(`^${prefix}-(\\d{4})$`))).filter(Boolean).map((m) => Number(m![1]))) + 1).padStart(4, '0')}`;
      const id = seq('dm.delivery.materialOrders', `MO-${today().slice(2, 4)}${today().slice(5, 7)}`);
      const deliveryId = seq('dm.delivery.deliveries', `DL-${shipOn.slice(2).replace(/\//g, '')}`);
      const qty = lines.reduce((x, l) => x + l.qty, 0);
      r.put<Delivery>('dm.delivery.deliveries', deliveryId, {
        id: deliveryId, parentId: '', branchId: b.id, contractId: ct.id, childContractId: '', cycleMonth: '', slot: '',
        temp: '資材', serviceForm: '資材便', regime: 'parcel_carrier', warehouseId: 'WH00004', shipOn, deliverOn: dueOn,
        status: '出荷待', plannedQty: qty, deliveredQty: null, deliveredAt: '', completion: '',
        destination: { name: b.name, address: b.address, tel: b.tel, windows: b.receiveWindows, note: b.deliveryNote },
        changeState: '変更不可', internalMemo: excess.length ? `プランの数量を超えた資材 ${excess.map((x) => `${x.materialId}×${x.qty}`).join('・')}（${yen(excess.reduce((a, x) => a + x.qty * x.unitYen, 0))}）` : '',
      });
      r.put<Leg>('dm.delivery.legs', `${deliveryId}:1`, { id: `${deliveryId}:1`, deliveryId, legNo: 1, from: { type: 'warehouse', id: 'WH00004' }, to: { type: 'destination', id: b.id },
        carrierId: 'DE00002', regime: 'parcel_carrier', isFinal: true, assignScope: 'ops', driverId: '', pickedUpAt: '' });
      const mo: MaterialOrder = { id, branchId: b.id, kind: 'regular', orderedAt: nowStamp(), orderedBy: a.accountId, dueOn, deliveryId, lines, paid: false, cycleMonth: cyc, ...(excess.length ? { excess } : {}), status: '出荷待' };
      r.put('dm.delivery.materialOrders', id, mo);
      /* 2回目以降の有料（OP000036）を付ける（納品予定日のサイクル月で数える） */
      recountMat(r, b.id, a.accountId);
      const now = r.get<MaterialOrder>('dm.delivery.materialOrders', id)!;
      notify(r, { to: { site: 'ops', accountId: '', role: 'ops.delivery' }, templateId: '', title: `資材の注文（${id}）`, body: `${b.name}：${dueOn} お届け${now.paid ? '（2回目・有料）' : ''}`, link: { type: 'delivery', id: deliveryId } });
      return now;
    },
    /** 運営：資材の注文の数・お届け日を直す（出荷待のときだけ。資材便の配送の数・日付も直す。出荷はお届けのリードタイム分前）。直したあと「何回目」を数え直す */
    updateMaterialOrder(r, a: { id: string; lines: { materialId: string; qty: number }[]; dueOn: string; reason?: string; accountId?: string }) {
      const mo = r.get<MaterialOrder>('dm.delivery.materialOrders', a.id);
      if (!mo) throw new ApiError('資材の注文が見つかりません', 404);
      if (matLocked(r, mo)) throw new ApiError('出荷待の資材の注文だけ直せます', 409);
      const lines = a.lines.filter((l) => l.qty > 0);
      if (!lines.length) throw new ApiError('注文数を1つ以上入れてください', 400);
      if (lines.some((l) => !Number.isInteger(l.qty) || l.qty > 999 || !r.get('dm.master.materials', l.materialId))) throw new ApiError('資材・数が正しくありません', 400);
      if (!isRealDate(a.dueOn) || a.dueOn <= today()) throw new ApiError('お届け日は明日以降の日付にしてください', 400);
      const d = r.get<Delivery>('dm.delivery.deliveries', mo.deliveryId);
      const shipOn = addDays(a.dueOn, -matLeadDays(r, mo.branchId, mo.orderedAt.slice(0, 10)));
      /* プランの数量を超えた資材は数を直したら出し直す */
      const excess = mo.kind === 'regular' ? materialExcess(r, mo.branchId, mo.cycleMonth ?? cycleMonthAt(r, mo.orderedAt.slice(0, 10)), lines, mo.id) : [];
      const { excess: _old, ...rest } = mo;
      void _old;
      const next: MaterialOrder = { ...rest, lines, dueOn: a.dueOn, ...(excess.length ? { excess } : {}) };
      r.put('dm.delivery.materialOrders', mo.id, next);
      /* 出荷日が変わっても配送No（DL-<作ったときの出荷日>-NNNN）は変えない（2026/10/03） */
      if (d) audit(r, { ...d, deliverOn: a.dueOn, shipOn, plannedQty: lines.reduce((x, l) => x + l.qty, 0) }, `資材の注文の変更${a.reason ? `：${a.reason}` : ''}`);
      recountMat(r, mo.branchId, a.accountId ?? 'ops');
      return r.get<MaterialOrder>('dm.delivery.materialOrders', mo.id)!;
    },
    /** 資材の注文の取消（出荷待のときだけ。資材便の配送も取消）。取り消したら、同じサイクル月の次の注文が繰り上がる（有料を付け直す） */
    cancelMaterialOrder(r, a: { id: string; reason: string; accountId?: string }) {
      const mo = r.get<MaterialOrder>('dm.delivery.materialOrders', a.id);
      if (!mo) throw new ApiError('資材の注文が見つかりません', 404);
      if (matLocked(r, mo)) throw new ApiError('出荷の前だけ取り消せます', 409);
      if (!a.reason?.trim()) throw new ApiError('理由を入れてください', 400);
      r.put('dm.delivery.materialOrders', mo.id, { ...mo, status: '取消' });
      const d = r.get<Delivery>('dm.delivery.deliveries', mo.deliveryId);
      if (d) audit(r, { ...d, status: '取消' }, `資材の注文の取消：${a.reason}`);
      recountMat(r, mo.branchId, a.accountId ?? 'ops', mo);
      return { ok: true };
    },
  },
});

