import { ApiError } from '@/lib/api/errors';
import type { DocRepo } from '@/lib/ops/core/area';
import { nowStamp, today } from '@/lib/supplier/dates';
import { instructionSent, isNormal } from './alt';
import { canPick } from './calendar';
import { legsFor } from './lifecycle';
import { getMenu } from './menu';
import { notify, notifyBranch } from './notify';
import { childLocked, feesNow, methodOf as serviceFormOf, yenOf } from './snapshot';
import { refreshDefaultOrders, slotsOf, syncDeliveryLines } from './areas/order';
import orgArea from './areas/org';
import type {
  Branch, BulkChange, BulkFilter, BulkResult, BulkTo, Carrier, Channel, ChildContract, Contract, Corp, Cycle, Delivery, Holiday, Leg, Plan, PlanCoursePrice,
  PriceGen, Product, ProductOrder, Regime, Warehouse,
} from './types';

/*
 * 契約の一括変更（課題 7-2・2026/10/02 決定）。別の画面は作らず、マスタの画面のモーダルから使う：
 *   倉庫マスタ「この倉庫の契約を一括変更」・委託配送先マスタ「この配送先の契約を一括変更」・プランマスタ「価格世代を一括切替」
 * 変えられる項目はピッキング倉庫・中継・委託配送先／路線便（お届けする運び手）・価格世代だけ。倉庫には担当エリアがない（決定 Q-E）ので、
 * 運営が条件（今の倉庫・中継・運び手・都道府県（複数）・市区町村・郵便番号の頭・配送方法・法人・拠点・コース・温度帯）で選ぶ。
 * 適用開始＝子契約が未確定のサイクル月。確定・請求済の子契約は変えない（スキップ・請求調整）。
 * 配送：変える子契約の出荷の前（予定・出荷待）の便だけ、倉庫・区間を直す（出荷指示を送ったあとなら版番号つきで再送）。出荷したものは変えない。
 * 注文：新しい倉庫にない商品を頼んでいる登録済の注文はデフォルトに戻す（法人へ再注文のお願い）。
 *   オーダー締切（月間メニューの締切日）を過ぎた月で新しい倉庫にない商品を頼んでいたら、その拠点のその月は変えない（スキップ・理由を結果に出す。課題 4b-8）。
 * 新しい倉庫の出荷禁止日に当たる便・リードタイムの見直しは、確認の画面で注意に出す。SA が確かめたら実行できる（ackAlerts・記録 acks。課題 4b-6）。
 * 中継があるときの区間1（倉庫→中継）の運び手は、中継を運営する会社か委託配送会社から選べる（leg1CarrierId。課題 4b-7）。
 * 件数の上限はない（100件を超えたら件数を打ち直して確かめる）。分けて進める（start → step を繰り返す）。元に戻す操作はない（履歴だけ）
 */

export const BULK = 'dm.bulk.changes';
/** この件数を超えたら、件数を打ち直して確かめる */
export const CONFIRM_OVER = 100;
/** 1回の step で進める契約の数 */
export const STEP_SIZE = 25;

const K = { children: 'dm.org.childContracts', contracts: 'dm.org.contracts', branches: 'dm.org.branches', corps: 'dm.org.corps', wh: 'dm.master.warehouses', carriers: 'dm.master.carriers', plans: 'dm.master.plans' };
const liveChildren = (r: DocRepo, contractId: string) =>
  r.list<ChildContract>(K.children).filter((x) => x.contractId === contractId && !x.canceled).sort((x, y) => x.cycleMonth.localeCompare(y.cycleMonth));
const nameOf = (r: DocRepo, kind: string, id: string) => (id ? r.get<{ name: string }>(kind, id)?.name ?? id : '');
const sumFees = (cc: Pick<ChildContract, 'fees'>) => (cc.fees?.lines ?? []).reduce((a, l) => a + l.amountYen, 0);
const methodOf = (regime: Regime) => (regime === 'self' ? '自社便' : regime === 'partner_driver' ? '委託' : '路線便');
const regimeOf = (c?: Carrier): Regime => (c?.kind === '路線' ? 'parcel_carrier' : c?.kind === '自社' ? 'self' : 'partner_driver');
/** お届けする運び手（中継があれば2次） */
const finalCarrier = (ch: Channel) => ch.carrier2Id || ch.carrierId;

export type BulkMode = BulkChange['mode'];
/** planId＝価格世代のプラン（プランマスタから開いたとき。子契約一覧からは filter.planId） */
export type BulkArgs = { mode: BulkMode; filter: BulkFilter; to: BulkTo; planId?: string; fromCycle: string; contractIds?: string[] };
const planIdOf = (a: Pick<BulkArgs, 'planId' | 'filter'>) => a.planId || a.filter?.planId || '';
const RESET_REASON = '注文をデフォルトに戻した';
/** 締切後の月をスキップする理由（課題 4b-8） */
const skipWhy = (deadline: string, names: string[]) =>
  `オーダー締切（${deadline || '—'}）を過ぎた月に、新しい倉庫にない商品（${names.join('・')}）の注文があるため、この月は変えません（今の倉庫のまま）`;

/** 適用開始の候補：未確定の子契約があるサイクル月（確定・請求済だけの月は選べない） */
export function bulkCycles(r: DocRepo) {
  const kids = r.list<ChildContract>(K.children).filter((x) => !x.canceled);
  return r.list<Cycle>('dm.delivery.cycles').sort((a, b) => a.id.localeCompare(b.id)).map((c) => {
    const mine = kids.filter((x) => x.cycleMonth === c.id);
    const open = mine.filter((x) => !childLocked(x)).length;
    return { id: c.id, orderState: c.orderState, open, locked: mine.length - open, selectable: open > 0 };
  }).filter((c) => c.selectable);
}

/**
 * 中継があるときの区間1（倉庫→中継）に選べる運び手：中継を運営する会社と、有効な委託配送会社（課題 4b-7）。
 * 契約の配送ルートの編集・一括変更のモーダルで同じ候補を出す
 */
export function leg1Carriers(r: DocRepo, hubId: string) {
  const op = r.get<Warehouse>(K.wh, hubId)?.carrierId ?? '';
  return r.list<Carrier>(K.carriers).filter((c) => c.status === '有効' && (c.id === op || c.kind === '委託・引き取り'))
    .map((c) => ({ id: c.id, name: c.name, kind: c.id === op ? '中継を運営する会社' as const : '委託配送会社' as const }))
    .sort((a, b) => (a.kind === b.kind ? a.id.localeCompare(b.id) : a.kind === '中継を運営する会社' ? -1 : 1));
}

/** オーダー締切（月間メニューの締切日。メニューがなければサイクルの締切日）と、過ぎたか */
export function orderDeadline(r: DocRepo, cycleMonth: string, day = today()) {
  const cy = r.get<Cycle>('dm.delivery.cycles', cycleMonth);
  const on = getMenu(r, cycleMonth)?.orderTo || cy?.orderCloseOn || '';
  return { on, closed: cy?.orderState === '締切済' || (!!on && day > on) };
}

/** 新しい流れ（変える項目だけ）。to.carrierId＝お届けする運び手（中継があれば2次）。to.leg1CarrierId＝中継があるときの区間1の運び手 */
export function nextChannel(r: DocRepo, ch: Channel, to: BulkTo): Channel {
  const hubId = to.hubId === undefined ? ch.hubId : to.hubId;
  const fin = to.carrierId || finalCarrier(ch);
  const hubOp = hubId ? r.get<Warehouse>(K.wh, hubId)?.carrierId : '';
  const carrierId = hubId ? (to.leg1CarrierId || (ch.hubId ? ch.carrierId : hubOp || ch.carrierId)) : fin;
  /* ②は常に入れる（中継しないときは①と同じ。2026/10/03） */
  const carrier2Id = fin;
  const car = r.get<Carrier>(K.carriers, fin);
  const regime = regimeOf(car);
  return {
    ...ch, warehouseId: to.warehouseId || ch.warehouseId, hubId, carrierId, carrier2Id, regime,
    serviceForm: regime === 'parcel_carrier' ? 'COOL便' : 'ES配送便',
    driverId: regime === 'parcel_carrier' ? '' : fin === finalCarrier(ch) ? ch.driverId : '',
  };
}
const sameRoute = (a: Channel, b: Channel) => a.warehouseId === b.warehouseId && a.hubId === b.hubId && a.carrierId === b.carrierId && a.carrier2Id === b.carrier2Id && a.regime === b.regime;

/** 絞り込みに合う流れか（ルート） */
function channelHit(ch: Channel, f: BulkFilter) {
  return ch.temp !== '資材' && (!f.temp || ch.temp === f.temp) && (!f.warehouseId || ch.warehouseId === f.warehouseId) && (!f.hubId || ch.hubId === f.hubId)
    && (!f.carrierId || ch.carrierId === f.carrierId || ch.carrier2Id === f.carrierId) && (!f.method || methodOf(ch.regime) === f.method);
}

/** リードタイムの見込み：新しい倉庫から同じ都道府県へ届けているほかの流れでいちばん多い日数（なければ今の日数） */
function leadEstimate(r: DocRepo, warehouseId: string, pref: string, cur: number) {
  const bs = new Map(r.list<Branch>(K.branches).map((b) => [b.id, b]));
  const m = new Map<number, number>();
  for (const k of r.list<ChildContract>(K.children)) {
    if (bs.get(k.branchId)?.address.pref !== pref) continue;
    for (const ch of k.channels) if (ch.warehouseId === warehouseId && ch.temp !== '資材') m.set(ch.leadDays, (m.get(ch.leadDays) ?? 0) + 1);
  }
  return [...m.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? cur;
}

/** 契約ごとの見込み（プレビューの1行） */
function rowOf(r: DocRepo, a: BulkArgs, ct: Contract) {
  const b = r.get<Branch>(K.branches, ct.branchId);
  const kids = liveChildren(r, ct.id).filter((x) => x.cycleMonth >= a.fromCycle);
  const base = kids[0];
  if (!b || !base) return null;
  const f = a.filter;
  if (f.prefs?.length && !f.prefs.includes(b.address.pref)) return null;
  if (f.city && !b.address.city.includes(f.city)) return null;
  if (f.zip && !b.address.zip.replace(/\D/g, '').startsWith(f.zip.replace(/\D/g, ''))) return null;
  if (f.corpId && b.corpId !== f.corpId) return null;
  if (f.branchId && b.id !== f.branchId) return null;
  if (f.course && base.course !== f.course) return null;
  const corp = b.corpId ? r.get<Corp>(K.corps, b.corpId) : undefined;
  const warnings: string[] = [];
  /* 確認の画面で SA が確かめる注意（新しい倉庫の出荷禁止日・リードタイム。課題 4b-6） */
  const alerts: string[] = [];
  const noPick: { id: string; shipOn: string; warehouseId: string }[] = [];
  const cs = r.list<Cycle>('dm.delivery.cycles'), hs = r.list<Holiday>('dm.delivery.holidays');
  const hit = a.mode === 'ルート' ? base.channels.filter((ch) => channelHit(ch, f)) : base.channels.filter((ch) => ch.temp !== '資材');
  if (a.mode === 'ルート' && !hit.length) return null;
  if (a.mode === '価格世代' && base.planId !== planIdOf(a)) return null;
  const plan = a.mode === '価格世代' ? r.get<Plan>(K.plans, planIdOf(a)) : undefined;
  const ch0 = hit[0] ?? base.channels[0];
  const next0 = ch0 && a.mode === 'ルート' ? nextChannel(r, ch0, a.to) : ch0;
  const route = (ch?: Channel) => ch ? {
    warehouse: nameOf(r, K.wh, ch.warehouseId), hub: ch.hubId ? nameOf(r, K.wh, ch.hubId) : '—', carrier: nameOf(r, K.carriers, finalCarrier(ch)),
    method: `${methodOf(ch.regime)}（${ch.serviceForm}）`, lead: ch.leadDays,
  } : null;
  const children: { id: string; cycleMonth: string; billStatus: ChildContract['billStatus']; action: '変更' | 'スキップ'; why: string; feeDiff: number }[] = [];
  const unstocked = new Set<string>();
  let dChange = 0, dResend = 0, dShipped = 0, ordersReset = 0;
  for (const k of kids) {
    if (childLocked(k)) { children.push({ id: k.id, cycleMonth: k.cycleMonth, billStatus: k.billStatus, action: 'スキップ', why: `${k.billStatus}（請求調整）`, feeDiff: 0 }); continue; }
    if (a.mode === '価格世代') {
      /* いま使っている価格の世代で絞る（子契約一覧の条件「価格の世代」） */
      if (f.genId && plan && usingGenOf(plan, k)?.id !== f.genId) { children.push({ id: k.id, cycleMonth: k.cycleMonth, billStatus: k.billStatus, action: 'スキップ', why: '価格の世代が違う', feeDiff: 0 }); continue; }
      const diff = feesNow(r, a.to?.priceGenId ? { ...k, priceGenId: a.to.priceGenId } : k).lines.reduce((s, l) => s + l.amountYen, 0) - sumFees(k);
      children.push({ id: k.id, cycleMonth: k.cycleMonth, billStatus: k.billStatus, action: '変更', why: '', feeDiff: diff });
      continue;
    }
    const chs = k.channels.filter((ch) => channelHit(ch, f));
    const nexts = chs.map((ch) => ({ ch, nx: nextChannel(r, ch, a.to) })).filter((x) => !sameRoute(x.ch, x.nx));
    if (!nexts.length) continue;
    /* 注文：新しい倉庫にない商品 */
    const o = r.list<ProductOrder>('dm.order.orders').find((x) => x.childContractId === k.id);
    const bad = new Set<string>();
    for (const { ch, nx } of nexts) {
      if (nx.warehouseId === ch.warehouseId) continue;
      for (const l of (o?.lines ?? []).filter((x) => isNormal(x) && x.slot.startsWith(`${ch.temp}:`))) {
        const p = r.get<Product>('dm.master.products', l.productId);
        if (p && !p.pickWarehouseIds.includes(nx.warehouseId)) bad.add(p.name);
      }
    }
    bad.forEach((x) => unstocked.add(x));
    const dl = orderDeadline(r, k.cycleMonth);
    if (bad.size && dl.closed) {
      children.push({ id: k.id, cycleMonth: k.cycleMonth, billStatus: k.billStatus, action: 'スキップ', why: skipWhy(dl.on, [...bad]), feeDiff: 0 });
      continue;
    }
    if (bad.size && o && ['登録済', 'ES登録済'].includes(o.status)) ordersReset++;
    children.push({ id: k.id, cycleMonth: k.cycleMonth, billStatus: k.billStatus, action: '変更', why: '', feeDiff: 0 });
    for (const d of r.list<Delivery>('dm.delivery.deliveries').filter((x) => x.childContractId === k.id && !x.parentId && nexts.some((n) => n.ch.temp === x.temp && n.ch.slots.includes(x.slot) && !n.ch.slotRoutes?.[x.slot]))) {
      if (['予定', '出荷待'].includes(d.status)) {
        dChange++;
        if (instructionSent(r, d, today())) dResend++;
        const nx = nexts.find((n) => n.ch.temp === d.temp && n.ch.slots.includes(d.slot))?.nx;
        if (nx && nx.warehouseId !== d.warehouseId && !canPick(cs, hs, d.shipOn, nx.warehouseId)) noPick.push({ id: d.id, shipOn: d.shipOn, warehouseId: nx.warehouseId });
      }
      else if (d.status !== '取消') dShipped++;
    }
  }
  if (a.mode === 'ルート' && ch0 && next0) {
    const est = leadEstimate(r, next0.warehouseId, b.address.pref, ch0.leadDays);
    if (next0.warehouseId !== ch0.warehouseId && est !== ch0.leadDays) {
      const m = `リードタイムの見直しが必要です（${ch0.leadDays}日 → ${est}日の見込み。日数は変えません）`;
      warnings.push(m); alerts.push(m);
    }
    if (noPick.length) {
      const m = `出荷日が新しい倉庫（${nameOf(r, K.wh, noPick[0].warehouseId)}）の出荷禁止日に当たる便があります：${noPick.map((x) => `${x.id}（${x.shipOn}）`).join('・')}（日付は変えません。実行のあとスケジュールで直してください）`;
      warnings.push(m); alerts.push(m);
    }
    const car = r.get<Carrier>(K.carriers, finalCarrier(next0));
    if (car && !car.temps.includes(ch0.temp)) warnings.push(`${car.name} は ${ch0.temp} を運びません`);
    if (unstocked.size) warnings.push(`拠点が頼んでいる商品が新しい倉庫にありません：${[...unstocked].join('・')}`);
  }
  return {
    contractId: ct.id, branchId: b.id, branchName: b.name, corpName: corp?.name ?? '（法人なし）', pref: b.address.pref, city: b.address.city, zip: b.address.zip,
    course: base.course, planId: base.planId, temps: [...new Set(hit.map((x) => x.temp))].join('・'),
    cur: route(ch0), next: route(next0), leadNext: next0 && a.mode === 'ルート' ? leadEstimate(r, next0.warehouseId, b.address.pref, ch0.leadDays) : ch0?.leadDays ?? 0,
    warnings, alerts, noPick, children, unstocked: [...unstocked],
    deliveries: { change: dChange, resend: dResend, shipped: dShipped }, ordersReset,
    feeDiff: children.reduce((s, x) => s + x.feeDiff, 0),
    offCarrier: ch0 && next0 && finalCarrier(ch0) !== finalCarrier(next0) ? finalCarrier(ch0) : '', onCarrier: ch0 && next0 && finalCarrier(ch0) !== finalCarrier(next0) ? finalCarrier(next0) : '',
    willChange: children.some((x) => x.action === '変更'),
  };
}
export type BulkRow = NonNullable<ReturnType<typeof rowOf>>;

function checkArgs(r: DocRepo, a: BulkArgs) {
  if (!['ルート', '価格世代'].includes(a.mode)) throw new ApiError('一括変更の種類が正しくありません', 400);
  if (!/^\d{4}-\d{2}$/.test(a.fromCycle ?? '')) throw new ApiError('適用開始のサイクル月を選んでください', 400);
  if (!bulkCycles(r).some((c) => c.id === a.fromCycle)) throw new ApiError(`${a.fromCycle} は未確定の子契約がないため適用開始にできません`, 400);
  if (a.mode === '価格世代') {
    const p = r.get<Plan>(K.plans, planIdOf(a));
    if (!p) throw new ApiError('プランを選んでください', 400);
    if (a.filter?.genId && !(p.priceGens ?? []).some((g) => g.id === a.filter.genId)) throw new ApiError(`価格世代 ${a.filter.genId} は ${p.id} にありません`, 400);
    if (a.to?.priceGenId && !(p.priceGens ?? []).some((g) => g.id === a.to.priceGenId)) throw new ApiError(`価格世代 ${a.to.priceGenId} は ${p.id} にありません`, 400);
    return;
  }
  const t = a.to ?? {};
  if (t.warehouseId === undefined && t.hubId === undefined && t.carrierId === undefined) throw new ApiError('変更後の倉庫・中継・委託配送先のどれかを選んでください', 400);
  if (t.warehouseId && r.get<Warehouse>(K.wh, t.warehouseId)?.type !== 'picking') throw new ApiError(`ピッキング倉庫 ${t.warehouseId} がありません`, 400);
  if (t.warehouseId && r.get<Warehouse>(K.wh, t.warehouseId)?.status !== '有効') throw new ApiError(`倉庫 ${t.warehouseId} は有効ではありません`, 400);
  if (t.hubId && r.get<Warehouse>(K.wh, t.hubId)?.type !== 'relay') throw new ApiError(`中継 ${t.hubId} がありません`, 400);
  if (t.carrierId && r.get<Carrier>(K.carriers, t.carrierId)?.status !== '有効') throw new ApiError(`委託配送先 ${t.carrierId} がない・有効ではありません`, 400);
  if (t.leg1CarrierId) {
    if (!t.hubId) throw new ApiError('区間1（倉庫→中継）の運び手は、変更後の中継を選んだときだけ選べます', 400);
    if (!leg1Carriers(r, t.hubId).some((c) => c.id === t.leg1CarrierId)) throw new ApiError('区間1（倉庫→中継）の運び手は、中継を運営する会社か委託配送会社を選んでください', 400);
  }
}

/** プレビュー：絞り込みに合う契約（選んだ契約の影響の合計つき） */
export function bulkPreview(r: DocRepo, a: BulkArgs) {
  checkArgs(r, a);
  const rows = r.list<Contract>(K.contracts).filter((c) => !['終了', '仮登録'].includes(c.status)).sort((x, y) => x.id.localeCompare(y.id))
    .map((c) => rowOf(r, a, c)).filter((x): x is BulkRow => !!x);
  const sel = a.contractIds ? rows.filter((x) => a.contractIds!.includes(x.contractId)) : rows;
  const ch = sel.flatMap((x) => x.children);
  const carriers = { off: [...new Set(sel.map((x) => x.offCarrier).filter(Boolean))], on: [...new Set(sel.map((x) => x.onCarrier).filter(Boolean))] };
  const named = (ids: string[]) => ids.map((id) => ({ id, name: nameOf(r, K.carriers, id) }));
  const hon = new Map<string, number>();
  if (a.mode === 'ルート' && a.to.warehouseId) {
    /* 発注：適用開始からの注文の数が、元の倉庫から新しい倉庫へ移る */
    for (const x of sel) for (const c of x.children.filter((y) => y.action === '変更')) {
      const k = r.get<ChildContract>(K.children, c.id)!;
      const o = r.list<ProductOrder>('dm.order.orders').find((y) => y.childContractId === k.id);
      for (const ch0 of k.channels.filter((y) => channelHit(y, a.filter) && y.warehouseId !== a.to.warehouseId)) {
        const n = (o?.lines ?? []).filter((l) => isNormal(l) && l.slot.startsWith(`${ch0.temp}:`)).reduce((s, l) => s + l.qty, 0);
        hon.set(ch0.warehouseId, (hon.get(ch0.warehouseId) ?? 0) - n);
        hon.set(a.to.warehouseId, (hon.get(a.to.warehouseId) ?? 0) + n);
      }
    }
  }
  return {
    rows, cycles: bulkCycles(r), selected: sel.length, needRetype: sel.length > CONFIRM_OVER,
    impact: {
      contracts: sel.filter((x) => x.willChange).length,
      children: { change: ch.filter((x) => x.action === '変更').length, skipLocked: ch.filter((x) => x.action === 'スキップ' && x.billStatus !== '未確定').length, skipOrder: ch.filter((x) => x.action === 'スキップ' && x.billStatus === '未確定').length },
      deliveries: sel.reduce((s, x) => ({ change: s.change + x.deliveries.change, resend: s.resend + x.deliveries.resend, shipped: s.shipped + x.deliveries.shipped }), { change: 0, resend: 0, shipped: 0 }),
      orders: { reset: sel.reduce((s, x) => s + x.ordersReset, 0), unstockedBranches: sel.filter((x) => x.unstocked.length).length },
      menu: a.mode === 'ルート' && a.to.warehouseId ? '新しい倉庫にない商品は、その拠点のメニュー（注文の画面）に出なくなります' : '',
      /** SA が確かめてから実行する注意（新しい倉庫の出荷禁止日・リードタイム。課題 4b-6） */
      alerts: sel.flatMap((x) => x.alerts.map((m) => `${x.branchName}（${x.contractId}）：${m}`)),
      hon: [...hon.entries()].filter(([, n]) => n).map(([w, n]) => ({ warehouseId: w, name: nameOf(r, K.wh, w), qty: n })),
      carriers: { off: named(carriers.off), on: named(carriers.on) },
      billing: a.mode === '価格世代' ? { diffYen: sel.reduce((s, x) => s + x.feeDiff, 0), children: ch.filter((x) => x.action === '変更' && x.feeDiff).length } : null,
    },
  };
}

/* ---------------- 実行（分けて進める） ---------------- */

/** 一括変更を始める（選んだ契約を記録して、実行中にする。中身は step で進める） */
export function bulkStart(r: DocRepo, a: BulkArgs & { source: BulkChange['source']; sourceId: string; notifyCorp?: boolean; confirmCount?: number; by?: string; ackAlerts?: boolean }) {
  const p = bulkPreview(r, a);
  const ids = (a.contractIds ?? p.rows.map((x) => x.contractId)).filter((id) => p.rows.some((x) => x.contractId === id));
  if (!ids.length) throw new ApiError('変える契約を選んでください', 400);
  if (ids.length > CONFIRM_OVER && Number(a.confirmCount) !== ids.length) throw new ApiError(`${CONFIRM_OVER}件を超えるため、確認のため件数（${ids.length}）を入れてください`, 400);
  if (r.list<BulkChange>(BULK).some((x) => x.status === '実行中')) throw new ApiError('実行中の一括変更があります。終わってから実行してください', 409);
  /* 新しい倉庫の出荷禁止日・リードタイムの注意は、SA が確かめたら実行できる（課題 4b-6） */
  const alerts = p.impact.alerts;
  if (alerts.length && !a.ackAlerts) throw new ApiError(`確かめる注意が ${alerts.length}件あります（新しい倉庫の出荷禁止日・リードタイム）。確認の画面で確かめてから実行してください`, 409);
  const ymd = today().slice(2).replace(/\//g, '');
  const n = r.list<BulkChange>(BULK).filter((x) => x.id.startsWith(`BK-${ymd}-`)).length + 1;
  const job: BulkChange = {
    id: `BK-${ymd}-${String(n).padStart(4, '0')}`, mode: a.mode, source: a.source, sourceId: a.sourceId, filter: a.filter ?? {}, to: a.to ?? {}, planId: planIdOf(a),
    fromCycle: a.fromCycle, contractIds: ids, notifyCorp: !!a.notifyCorp, status: '実行中', total: ids.length, processed: 0, results: [],
    summary: { changed: 0, skipped: 0, failed: 0, children: 0, deliveries: 0, resent: 0, ordersReset: 0, carriers: [] },
    carrierNotes: {}, at: nowStamp(), by: a.by || '運営', finishedAt: '',
    ...(alerts.length ? { acks: { at: nowStamp(), by: a.by || '運営', alerts, deliveries: p.rows.filter((x) => ids.includes(x.contractId)).flatMap((x) => x.noPick) } } : {}),
  };
  r.put<BulkChange>(BULK, job.id, job);
  return job;
}

/** 1契約を変える（ルート） */
function runRoute(r: DocRepo, job: BulkChange, contractId: string): BulkResult {
  const ct = r.get<Contract>(K.contracts, contractId)!;
  const res: BulkResult = { contractId, branchId: ct.branchId, result: 'スキップ', reason: '', children: [], skipped: [], deliveries: [], resent: [] };
  const kids = liveChildren(r, contractId).filter((x) => x.cycleMonth >= job.fromCycle);
  const cs = r.list<Cycle>('dm.delivery.cycles'), hs = r.list<Holiday>('dm.delivery.holidays');
  let reset = false;
  const months = new Set<string>();
  for (const k of kids) {
    if (childLocked(k)) { res.skipped.push({ id: k.id, why: `${k.billStatus}（請求調整）` }); continue; }
    const pairs = k.channels.map((ch) => ({ ch, nx: channelHit(ch, job.filter) ? nextChannel(r, ch, job.to) : ch }));
    if (pairs.every((x) => sameRoute(x.ch, x.nx))) continue;
    const o = r.list<ProductOrder>('dm.order.orders').find((x) => x.childContractId === k.id);
    const bad = (o?.lines ?? []).filter((l) => isNormal(l) && pairs.some(({ ch, nx }) => nx.warehouseId !== ch.warehouseId && l.slot.startsWith(`${ch.temp}:`) && !r.get<Product>('dm.master.products', l.productId)?.pickWarehouseIds.includes(nx.warehouseId)));
    const dl = orderDeadline(r, k.cycleMonth);
    if (bad.length && dl.closed) { res.skipped.push({ id: k.id, why: skipWhy(dl.on, [...new Set(bad.map((l) => r.get<Product>('dm.master.products', l.productId)?.name ?? l.productId))]) }); continue; }
    orgArea.actions.updateChild(r, { id: k.id, patch: { channels: pairs.map((x) => x.nx) } });
    res.children.push(k.id);
    /* 注文：新しい倉庫にない商品を頼んだ登録済の注文はデフォルトに戻す（代替品の行は残す） */
    if (bad.length && o && ['登録済', 'ES登録済'].includes(o.status)) {
      const at = nowStamp();
      r.put<ProductOrder>('dm.order.orders', o.id, {
        ...o, status: 'デフォルト', lines: o.lines.filter((l) => !isNormal(l)), updatedAt: at, updatedBy: job.by,
        log: [{ at, by: job.by, what: `一括変更 ${job.id} でデフォルトに戻しました`, detail: `新しい倉庫にない商品：${[...new Set(bad.map((l) => l.productId))].join('・')}` }, ...o.log],
      });
      reset = true;
    }
    months.add(k.cycleMonth);
    /* 配送：出荷の前の便の倉庫・区間を直す（出荷指示を送ったあとは版番号つきで再送）。出荷したものは変えない */
    for (const d of r.list<Delivery>('dm.delivery.deliveries').filter((x) => x.childContractId === k.id && !x.parentId && ['予定', '出荷待'].includes(x.status))) {
      /* 回ごとのルートを上書きした回は一括変更で変えない（その回の上書きのまま） */
      const p = pairs.find((x) => x.ch.temp === d.temp && x.ch.slots.includes(d.slot) && !x.ch.slotRoutes?.[d.slot]);
      if (!p || sameRoute(p.ch, p.nx)) continue;
      const sent = instructionSent(r, d, today());
      r.list<Leg>('dm.delivery.legs').filter((l) => l.deliveryId === d.id).forEach((l) => r.remove('dm.delivery.legs', l.id));
      for (const l of legsFor(d.id, p.nx, d.branchId)) r.put<Leg>('dm.delivery.legs', l.id, l);
      const rev = sent ? (d.shipRev ?? 1) + 1 : d.shipRev;
      const memo = `${nowStamp()} 一括変更 ${job.id}：${nameOf(r, K.wh, p.ch.warehouseId)} → ${nameOf(r, K.wh, p.nx.warehouseId)}・${nameOf(r, K.carriers, finalCarrier(p.ch))} → ${nameOf(r, K.carriers, finalCarrier(p.nx))}${sent ? `・出荷指示を再送（rev${rev}）` : ''}`
        + (canPick(cs, hs, d.shipOn, p.nx.warehouseId) ? '' : `（出荷日 ${d.shipOn} は新しい倉庫の出荷禁止日：日付を確かめる）`);
      r.put<Delivery>('dm.delivery.deliveries', d.id, {
        ...d, warehouseId: p.nx.warehouseId, regime: p.nx.regime, serviceForm: p.nx.serviceForm, ...(sent ? { shipRev: rev } : {}),
        internalMemo: [d.internalMemo, memo].filter(Boolean).join('\n'),
      });
      res.deliveries.push(d.id);
      if (sent) res.resent.push(d.id);
    }
    /* 委託配送先へ知らせる（外れる・新しい） */
    for (const { ch, nx } of pairs) {
      const off = finalCarrier(ch), on = finalCarrier(nx);
      if (off === on) continue;
      const name = r.get<Branch>(K.branches, ct.branchId)?.name ?? ct.branchId;
      const notes = job.carrierNotes ?? {};
      notes[off] = { off: [...new Set([...(notes[off]?.off ?? []), name])], on: notes[off]?.on ?? [] };
      notes[on] = { on: [...new Set([...(notes[on]?.on ?? []), name])], off: notes[on]?.off ?? [] };
      job.carrierNotes = notes;
    }
  }
  /* 注文の明細と配送の明細をそろえる（公開中の月はデフォルトの注文を作り直す） */
  for (const ym of months) {
    const st = getMenu(r, ym)?.status;
    if (st === '公開中') refreshDefaultOrders(r, ym);
    /* 公開前（編集中）の月も、便の倉庫が変わった子契約のデフォルトは作り直す（新しい倉庫にない商品を残さない） */
    else if (st === '編集中') refreshDefaultOrders(r, ym, res.children.filter((id) => r.get<ChildContract>(K.children, id)?.cycleMonth === ym));
  }
  for (const id of res.children) {
    const k = r.get<ChildContract>(K.children, id)!;
    const o = r.list<ProductOrder>('dm.order.orders').find((x) => x.childContractId === k.id);
    syncLines(r, k, o?.lines ?? []);
  }
  if (reset) {
    notifyBranch(r, ct.branchId, {
      templateId: 'order_reset', title: '配送の倉庫の変更にともない、商品注文をデフォルトに戻しました',
      body: `お届けする倉庫が変わり、ご注文の一部の商品をお届けできなくなりました（${job.fromCycle} サイクルから）。受付期間中にあらためてご注文ください。`, link: { type: '', id: '' },
    });
  }
  res.result = res.children.length ? '変更' : 'スキップ';
  /* スキップした月があれば理由に出す（結果の一覧に出る。課題 4b-8） */
  const skippedMonths = res.skipped.length ? `変えなかった月 ${res.skipped.length}件（${res.skipped.map((x) => x.why).filter((w, i, xs) => xs.indexOf(w) === i).join('／')}）` : '';
  res.reason = res.children.length ? [reset ? RESET_REASON : '', skippedMonths].filter(Boolean).join('・') : res.skipped.length ? `変える子契約がない：${skippedMonths}` : '変える流れがない';
  return res;
}

/** 1契約を変える（価格世代：org.repriceChildren） */
function runPrice(r: DocRepo, job: BulkChange, contractId: string): BulkResult {
  const ct = r.get<Contract>(K.contracts, contractId)!;
  /* 条件「価格の世代」：その世代を使っている子契約だけ（lib/domain/areas/org.ts repriceChildren の childIds） */
  const plan = r.get<Plan>(K.plans, job.planId);
  const childIds = job.filter.genId && plan ? liveChildren(r, contractId).filter((k) => k.cycleMonth >= job.fromCycle && usingGenOf(plan, k)?.id === job.filter.genId).map((k) => k.id) : undefined;
  const out = orgArea.actions.repriceChildren(r, { fromCycle: job.fromCycle, planId: job.planId, mode: '価格世代', by: job.by, contractIds: [contractId], ...(childIds ? { childIds } : {}), ...(job.to?.priceGenId ? { priceGenId: job.to.priceGenId } : {}) });
  return {
    contractId, branchId: ct.branchId, result: out.updated.length ? '変更' : 'スキップ', reason: out.updated.length ? '' : out.locked.length ? '確定・請求済だけ（請求調整）' : '価格が変わらない',
    children: out.updated, skipped: out.locked.map((x) => ({ id: x.id, why: `${x.billStatus}（請求調整）` })), deliveries: [], resent: [],
  };
}

/** 一括変更を進める（n 件ずつ。終わったら通知を出して完了にする） */
export function bulkStep(r: DocRepo, a: { id: string; n?: number }) {
  const job = r.get<BulkChange>(BULK, a.id);
  if (!job) throw new ApiError(`一括変更が見つかりません（${a.id}）`, 404);
  if (job.status === '完了') return job;
  const next = job.contractIds.slice(job.processed, job.processed + Math.max(1, Math.min(a.n ?? STEP_SIZE, 200)));
  for (const id of next) {
    let res: BulkResult;
    try {
      if (!r.get<Contract>(K.contracts, id)) throw new ApiError(`親契約 ${id} がありません`, 404);
      res = job.mode === '価格世代' ? runPrice(r, job, id) : runRoute(r, job, id);
    } catch (e) {
      res = { contractId: id, branchId: r.get<Contract>(K.contracts, id)?.branchId ?? '', result: '失敗', reason: e instanceof Error ? e.message : String(e), children: [], skipped: [], deliveries: [], resent: [] };
    }
    job.results.push(res);
    job.processed++;
    const s = job.summary;
    s[res.result === '変更' ? 'changed' : res.result === '失敗' ? 'failed' : 'skipped']++;
    s.children += res.children.length; s.deliveries += res.deliveries.length; s.resent += res.resent.length;
    if (res.reason.startsWith(RESET_REASON)) s.ordersReset++;
  }
  if (job.processed >= job.total) finish(r, job);
  r.put<BulkChange>(BULK, job.id, job);
  return job;
}

function finish(r: DocRepo, job: BulkChange) {
  job.status = '完了';
  job.finishedAt = nowStamp();
  const notes = job.carrierNotes ?? {};
  job.summary.carriers = Object.keys(notes);
  for (const [c, x] of Object.entries(notes)) {
    const car = r.get<Carrier>(K.carriers, c);
    if (!car || car.kind === '自社') continue;
    const body = [x.off.length ? `担当の終了（${job.fromCycle} サイクルの前のサイクルまで）：${x.off.join('・')}` : '', x.on.length ? `担当の追加（${job.fromCycle} サイクルから）：${x.on.join('・')}` : ''].filter(Boolean).join('／');
    notify(r, { to: { site: 'carrier', accountId: r.get('dm.account.accounts', c) ? c : '', role: '' }, templateId: '', title: `担当する拠点の変更（一括変更 ${job.id}）`, body, link: { type: '', id: '' } });
  }
  if (job.notifyCorp) {
    for (const b of new Set(job.results.filter((x) => x.result === '変更').map((x) => x.branchId))) {
      notifyBranch(r, b, {
        templateId: '', title: job.mode === '価格世代' ? 'ご契約の料金が変わります' : 'お届けの体制が変わります',
        body: job.mode === '価格世代' ? `${job.fromCycle} サイクルから、新しい料金（価格の改定）になります。` : `${job.fromCycle} サイクルから、お届けする倉庫・配送会社が変わります。お届け日は変わりません。`,
        link: { type: '', id: '' },
      });
    }
  }
}

/* 注文の明細と配送の明細をそろえる（lib/domain/areas/order.ts の関数を使う） */
const syncLines = (r: DocRepo, k: ChildContract, lines: ProductOrder['lines']) => syncDeliveryLines(r, slotsOf(r, k), lines);

/* ---------------- 価格世代（プランマスタ） ---------------- */

/** 価格世代を足す（適用開始のサイクル月・コースごとの月額）。作った子契約は一括変更（価格世代）で当てるまで変わらない */
export function addPriceGen(r: DocRepo, a: { planId: string; fromCycle: string; prices: PlanCoursePrice[]; note?: string; by?: string }) {
  const p = r.get<Plan>(K.plans, a.planId);
  if (!p || p.status === '削除済') throw new ApiError(`プラン ${a.planId} がありません`, 404);
  if (!/^\d{4}-\d{2}$/.test(a.fromCycle ?? '')) throw new ApiError('適用開始のサイクル月を YYYY-MM で選んでください', 400);
  const now = today().slice(0, 7).replace('/', '-');
  if (a.fromCycle < now) throw new ApiError('適用開始は今月以降のサイクル月にしてください', 400);
  if ((p.priceGens ?? []).some((g) => g.fromCycle === a.fromCycle)) throw new ApiError(`${a.fromCycle} から始まる価格世代はもうあります`, 409);
  const prices = normPrices(p, a.prices);
  /* 番号は消した世代と重ならないよう、いちばん大きい番号の次 */
  const n = Math.max(0, ...(p.priceGens ?? []).map((g) => Number(g.id.split('-').pop()) || 0)) + 1;
  const g: PriceGen = { id: `PG-${p.id}-${String(n).padStart(2, '0')}`, fromCycle: a.fromCycle, prices, note: a.note ?? '', at: nowStamp(), by: a.by || '運営' };
  const next: Plan = { ...p, priceGens: [...(p.priceGens ?? []), g].sort((x, y) => x.fromCycle.localeCompare(y.fromCycle)) };
  r.put<Plan>(K.plans, p.id, next);
  return g;
}

/*
 * 価格世代を直す・消す（課題 4b-9：運営だけの旧「価格プラン」の表はやめて、価格世代を1つの元にする）。
 *   どの子契約も使っていない世代（その世代の期間のサイクル月の子契約がない）で、期間が終わっていない世代：直せる・消せる
 *   子契約が使っている世代・期間が終わった世代：見るだけ。料金を変えるときは新しい世代を足す（価格世代を一括切替）か、
 *   子契約が使っている世代の金額の誤りは「誤りの訂正」（理由が要る・org.repriceChildren で未確定の子契約の ① 費目を作り直す。確定・請求済は請求調整）
 */

/**
 * 子契約がいま使っている価格の世代（① 費目のプラン料金の金額と同じ世代。写しがなければサイクル月の世代）。
 * 子契約一覧の一括変更の条件「価格の世代」と、priceGenUse の数え方は同じ考え方
 */
export function usingGenOf(plan: Plan, k: ChildContract): PriceGen | undefined {
  const gens = [...(plan.priceGens ?? [])].sort((a, b) => a.fromCycle.localeCompare(b.fromCycle));
  /* 適用された価格プラン（priceGenId・28-181）があればそれ */
  const byId = k.priceGenId ? gens.find((g) => g.id === k.priceGenId) : undefined;
  if (byId) return byId;
  const byCycle = gens.filter((g) => g.fromCycle <= k.cycleMonth).pop();
  const y = k.fees ? k.fees.lines.filter((l) => l.src === 'plan').reduce((a, l) => a + l.amountYen, 0) : null;
  if (y === null) return byCycle;
  const m = serviceFormOf(k);
  return [...gens].reverse().find((g) => g.fromCycle <= k.cycleMonth && yenOf(g.prices.find((x) => x.course === k.course), m) === y) ?? byCycle;
}

/**
 * 世代の期間（fromCycle〜次の世代の前の月）と、使っている子契約の数・直せるか。
 * 使っている＝期間のサイクル月の子契約で、① 費目のプラン料金（基本料金＋福利厚生）がこの世代の金額のもの
 * （足しただけの世代は、一括切替で当てるまでは前の世代の金額のままなので使っていない）。① 費目の写しがない子契約は使っている扱い
 */
export function priceGenUse(r: DocRepo, plan: Plan, day = today()) {
  const gens = [...(plan.priceGens ?? [])].sort((a, b) => a.fromCycle.localeCompare(b.fromCycle));
  const now = day.slice(0, 7).replace('/', '-');
  const kids = r.list<ChildContract>(K.children).filter((k) => !k.canceled && k.planId === plan.id);
  const planYen = (k: ChildContract) => (k.fees ? k.fees.lines.filter((l) => l.src === 'plan').reduce((a, l) => a + l.amountYen, 0) : null);
  return gens.map((g, i) => {
    const until = gens[i + 1]?.fromCycle ?? '';
    const used = kids.filter((k) => {
      /* 適用された価格プラン（priceGenId）がある子契約はそれで数える（期間に関係なく。台帳 F） */
      if (k.priceGenId) return k.priceGenId === g.id;
      if (k.cycleMonth < g.fromCycle || (until && k.cycleMonth >= until)) return false;
      const y = planYen(k);
      /* 前の世代と同じ金額のコースは、前の世代の金額のままとみなす（一括切替で当てるまで変わらない）。価格は子契約の配送方法で選ぶ */
      const m = serviceFormOf(k);
      const mine = yenOf(g.prices.find((x) => x.course === k.course), m), before = gens[i - 1] ? yenOf(gens[i - 1].prices.find((x) => x.course === k.course), m) : undefined;
      return y === null || (y === mine && (i === 0 || y !== before));
    }).length;
    const ended = !!until && until <= now;
    return { ...g, until, used, ended, editable: !used && !ended, why: used ? `子契約 ${used}件が使っています` : ended ? '期間が終わった世代です' : '' };
  });
}

const genOf = (r: DocRepo, planId: string, genId: string) => {
  const p = r.get<Plan>(K.plans, planId);
  if (!p || p.status === '削除済') throw new ApiError(`プラン ${planId} がありません`, 404);
  const g = priceGenUse(r, p).find((x) => x.id === genId);
  if (!g) throw new ApiError(`価格世代 ${genId} がありません`, 404);
  return { p, g };
};
/** コースごとの価格をそろえる：monthlyYen＝ES配送便の価格（なければ COOL便）。ライト（自販機）は COOL便を持たない。1円以上の整数 */
export const normPrices = (p: Plan, list: PlanCoursePrice[] | undefined): PlanCoursePrice[] => {
  const courses = p.prices.map((x) => x.course);
  const prices = (list ?? []).filter((x) => courses.includes(x.course)).map((x) => {
    const es = x.esYen ?? x.monthlyYen, cool = x.course === 'ESライト（自販機）' ? undefined : x.coolYen ?? x.monthlyYen;
    return { course: x.course, monthlyYen: es ?? cool ?? 0, esYen: es, ...(cool !== undefined ? { coolYen: cool } : {}) };
  });
  const ok = (n: number | undefined) => n === undefined || (Number.isInteger(n) && n > 0);
  if (prices.length !== courses.length || prices.some((x) => !Number.isInteger(x.monthlyYen) || x.monthlyYen <= 0 || !ok(x.coolYen) || !ok(x.esYen))) throw new ApiError(`コース（${courses.join('・')}）ごとの月額（COOL便・ES配送便）を1円以上の整数で入れてください`, 400);
  return prices;
};
const checkPrices = normPrices;
const putGens = (r: DocRepo, p: Plan, gens: PriceGen[]) => r.put<Plan>(K.plans, p.id, { ...p, priceGens: [...gens].sort((x, y) => x.fromCycle.localeCompare(y.fromCycle)) });

/** 使っていない世代を直す（適用開始・月額・メモ） */
export function updatePriceGen(r: DocRepo, a: { planId: string; genId: string; fromCycle?: string; prices?: PlanCoursePrice[]; note?: string; by?: string }) {
  const { p, g } = genOf(r, a.planId, a.genId);
  if (!g.editable) throw new ApiError(`${g.id} は${g.why}。直せません（料金を変えるときは新しい世代を足すか、誤りの訂正をしてください）`, 409);
  const fromCycle = a.fromCycle ?? g.fromCycle;
  if (!/^\d{4}-\d{2}$/.test(fromCycle)) throw new ApiError('適用開始のサイクル月を YYYY-MM で選んでください', 400);
  if (fromCycle !== g.fromCycle && fromCycle < today().slice(0, 7).replace('/', '-')) throw new ApiError('適用開始は今月以降のサイクル月にしてください', 400);
  if ((p.priceGens ?? []).some((x) => x.id !== g.id && x.fromCycle === fromCycle)) throw new ApiError(`${fromCycle} から始まる価格世代はもうあります`, 409);
  const prices = a.prices ? checkPrices(p, a.prices) : g.prices;
  const next: PriceGen = { id: g.id, fromCycle, prices, note: a.note ?? g.note, at: nowStamp(), by: a.by || '運営', ...(g.fixes ? { fixes: g.fixes } : {}) };
  /* 適用開始を動かしたら、ほかの世代の期間も変わる。動かしたあとに子契約が入る期間になるならやめる */
  const trial: Plan = { ...p, priceGens: [...(p.priceGens ?? []).filter((x) => x.id !== g.id), next] };
  const after = priceGenUse(r, trial).find((x) => x.id === g.id)!;
  if (after.used) throw new ApiError(`${fromCycle} からにすると子契約 ${after.used}件が入る期間になります（使っている世代は直せません）`, 409);
  putGens(r, p, trial.priceGens!);
  return next;
}

/** 使っていない世代を消す（世代は1つ以上残す） */
export function deletePriceGen(r: DocRepo, a: { planId: string; genId: string }) {
  const { p, g } = genOf(r, a.planId, a.genId);
  if (!g.editable) throw new ApiError(`${g.id} は${g.why}。消せません`, 409);
  const rest = (p.priceGens ?? []).filter((x) => x.id !== g.id);
  if (!rest.length) throw new ApiError('価格世代は1つ以上いります', 409);
  /* 使っていない世代なので、消して前の世代の期間がのびても子契約の金額は変わらない */
  putGens(r, p, rest);
  return { removed: g.id };
}

/**
 * 誤りの訂正：子契約が使っている世代の金額を直す（理由が要る）。その世代の期間の未確定の子契約の ① 費目を作り直す（org.repriceChildren・誤りの訂正）。
 * 確定・請求済の子契約は変えない（請求調整）。訂正の記録を世代に残す
 */
export function correctPriceGen(r: DocRepo, a: { planId: string; genId: string; prices: PlanCoursePrice[]; reason: string; by?: string }) {
  const { p, g } = genOf(r, a.planId, a.genId);
  if (!a.reason?.trim()) throw new ApiError('誤りの訂正は理由を入れてください', 400);
  const prices = checkPrices(p, a.prices);
  const by = a.by || '運営';
  const next: PriceGen = {
    id: g.id, fromCycle: g.fromCycle, prices, note: g.note, at: g.at, by: g.by,
    fixes: [...(g.fixes ?? []), { at: nowStamp(), by, reason: a.reason.trim(), before: g.prices }],
  };
  putGens(r, p, [...(p.priceGens ?? []).filter((x) => x.id !== g.id), next]);
  /* その世代の期間の子契約だけ（次の世代の期間は変えない） */
  const out = orgArea.actions.repriceChildren(r, { fromCycle: g.fromCycle, ...(g.until ? { untilCycle: g.until } : {}), planId: p.id, mode: '誤りの訂正', reason: a.reason, by });
  return { gen: next, updated: out.updated, locked: out.locked, message: out.message };
}
