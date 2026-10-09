import { ApiError } from '@/lib/api/errors';
import type { DocRepo } from '@/lib/ops/core/area';
import { addDays, nowStamp, today } from '@/lib/supplier/dates';
import { instructionSent } from './alt';
import { canPick, slotOf, WEEKS } from './calendar';
import { cycleMonthAt } from './charges';
import { addYm } from './menu';
import { notify, notifyBranch } from './notify';
import { honSchedule } from './stock';
import type { Carrier, ChangeRequest, Cycle, Delivery, DeliveryMove, Holiday, Leg, MonthlyMenu, MoveRow, Trouble, Warehouse } from './types';

/*
 * スケジュールの移動（課題 2-4・決定 v2.3 追補8 #63 を 2026/10/02 の答えで改める）。ドラッグはしない：チェックで選んだ配送（1件・複数・その日全部）を、選んだお届け日へ動かす。
 *   本発注（月2回）の時期の終わりより前：何便でも動かせる（同じサイクルの中。移動先の半分も本発注の前であること）
 *   本発注の後：1便だけ（同じ拠点・同じ日の冷凍・冷蔵は一緒に動く＝1便と数える）・理由が要る・同じ半分の中（A↔B／C↔D）だけ。
 *     複数を選んだら動かせない（理由を返す）
 *   どちらも出荷日の前日まで（今の出荷日・新しい出荷日が明日以降）。出荷日はリードタイムを保って一緒に動く。便（slot）は変えない（注文の行の便のキーのまま）
 *   移動先がお届けしない日（祝日・日曜・月曜＝枠の1）：止めない。「本当に移動しますか？お客様に確認済みですか？」を確かめて動かす（confirmHoliday）
 *   移動先が別のサイクル（月）・本発注の後の別の半分：トラブルの対応のときだけ（trouble・理由・記録したトラブルを1つ選ぶ troubleId・confirmCross。課題 4b-4）
 *   出荷できない日（出荷不可の枠・出荷禁止日・その倉庫の出荷禁止日）は動かせない。止めるのは倉庫の暦だけ（月曜で一律に止めない・課題 4b-2）
 *   件数・ドライバーの数が多いときは警告（止めない）。出荷指示を送ったあとなら版番号つきで再送（shipRev+1）。委託配送先・ドライバーへ通知、法人へは notifyCorp のとき
 * 記録は dm.delivery.moves（変更前・変更後・理由・操作者）と配送の運営のメモ。配送の moveId に最後の移動を持つ
 */

export const MOVES = 'dm.delivery.moves';
/** 1日の出荷件数のしきい値（スケジュールの月表示と同じ） */
export const SHIP_DAY_MAX = 300;
/** 1人のドライバーが1日に届ける件数の目安（【仮】ドライバー・ルートの容量のマスタがないため） */
export const DRIVER_DAY_MAX = 15;
/** 動かせる配送の状態（出荷の前） */
const MOVABLE: Delivery['status'][] = ['予定', '出荷待'];

const DL = 'dm.delivery.deliveries';
const all = (r: DocRepo) => r.list<Delivery>(DL);
const cyclesOf = (r: DocRepo) => r.list<Cycle>('dm.delivery.cycles').sort((a, b) => a.a1.localeCompare(b.a1));
const holidaysOf = (r: DocRepo) => r.list<Holiday>('dm.delivery.holidays');
const leadOf = (d: Delivery) => Math.round((new Date(d.deliverOn).getTime() - new Date(d.shipOn).getTime()) / 86400000);
const halfOf = (slot: string) => (slot[0] <= 'B' ? '前半' : '後半');
const isFood = (d: Delivery) => d.temp === '冷蔵' || d.temp === '冷凍' || d.temp === '常温';

/** その配送の半分の本発注の時期の終わり（前半＝前のサイクルの C1、後半＝このサイクルの A1）。サイクルのない配送（資材・子）は '' */
export function honDeadline(r: DocRepo, d: Pick<Delivery, 'cycleMonth' | 'slot'>) {
  if (!d.cycleMonth || !d.slot) return '';
  const h = honSchedule(r, d.cycleMonth)?.halves.find((x) => x.half === halfOf(d.slot));
  return h?.to ?? '';
}
/** 本発注の時期を過ぎたか（過ぎたら1便だけ・理由が要る）。サイクルのない配送は過ぎた扱い */
export const afterHon = (r: DocRepo, d: Pick<Delivery, 'cycleMonth' | 'slot'>, day = today()) => { const t = honDeadline(r, d); return !t || day > t; };

/** 一緒に動く配送：同じ拠点・同じお届け日の食品の便（冷凍・冷蔵）で、出荷の前のもの */
export function siblingsOf(r: DocRepo, d: Delivery) {
  return all(r).filter((x) => x.branchId === d.branchId && x.deliverOn === d.deliverOn && isFood(x) && MOVABLE.includes(x.status) && x.parentId === d.parentId);
}

export type MoveArgs = {
  ids: string[]; to: string; reason?: string; trouble?: boolean; confirmHoliday?: boolean; confirmCross?: boolean; notifyCorp?: boolean; by?: string;
  /** トラブルの対応で別のサイクルへ動かすとき：記録したトラブル（dm.delivery.troubles）の ID（課題 4b-4） */
  troubleId?: string;
};

/**
 * お届けしない日（祝日・日曜・月曜＝枠の1）か。どれも止めずに確かめて動かす。
 * 止めるのは出荷日が倉庫の出荷できない日のときだけ（倉庫ごとの出荷禁止日・出荷不可の枠。課題 4b-2）
 */
function offDay(r: DocRepo, date: string) {
  const h = holidaysOf(r).find((x) => x.date === date && x.noDelivery);
  if (h) return h.name;
  const wd = new Date(date).getDay();
  return wd === 0 ? '日曜' : wd === 1 ? '月曜（お届けしない枠の1）' : '';
}

/** トラブルの対応で選べるトラブル：動かす便の拠点の配送に記録したトラブル（新しい順） */
function troublesFor(r: DocRepo, branchIds: Set<string>) {
  return r.list<Trouble>('dm.delivery.troubles').map((t) => ({ t, d: r.get<Delivery>(DL, t.deliveryId) }))
    .filter((x) => !!x.d && branchIds.has(x.d.branchId))
    .sort((x, y) => y.t.reportedAt.localeCompare(x.t.reportedAt))
    .map(({ t, d }) => ({ id: t.id, deliveryId: t.deliveryId, deliverOn: d!.deliverOn, name: d!.destination.name, typeId: t.typeId, note: t.note, reportedAt: t.reportedAt, resolved: !!t.resolution }));
}

/**
 * 移動の確認（画面の「移動先」を選んだときの中身）。errors があれば動かせない。needs＝確かめること（休日・別のサイクル）。
 * many＝複数の便を動かせるか（本発注の前だけ）、lockReason＝動かせない・複数を選べない理由
 */
export function movePlan(r: DocRepo, a: Pick<MoveArgs, 'ids' | 'to' | 'reason' | 'trouble' | 'troubleId'>, day = today()) {
  const errors: string[] = [], warnings: string[] = [];
  const picked = [...new Set(a.ids ?? [])].map((id) => {
    const d = r.get<Delivery>(DL, id);
    if (!d) throw new ApiError(`配送が見つかりません（${id}）`, 404);
    return d;
  });
  if (!picked.length) throw new ApiError('移動する配送を選んでください', 400);
  for (const d of picked) {
    if (!isFood(d)) errors.push(`${d.id} は資材便です（資材の注文の画面で日付を変えてください）`);
    else if (!MOVABLE.includes(d.status)) errors.push(`${d.id} は ${d.status} のため動かせません（出荷の前の配送だけ）`);
    else if (d.shipOn <= day) errors.push(`${d.id} は出荷日（${d.shipOn}）の前日を過ぎたため動かせません（取消＋複製で対応）`);
  }
  /* 同じ拠点・同じ日の冷凍・冷蔵は一緒に動く（1便と数える） */
  const units = new Map<string, Delivery[]>();
  for (const d of picked.filter((x) => isFood(x) && MOVABLE.includes(x.status))) {
    const k = `${d.branchId}|${d.deliverOn}|${d.parentId}`;
    if (!units.has(k)) units.set(k, siblingsOf(r, d));
  }
  const rows = [...new Map([...units.values()].flat().map((d) => [d.id, d])).values()].sort((x, y) => x.deliverOn.localeCompare(y.deliverOn) || x.id.localeCompare(y.id));
  const after = rows.some((d) => afterHon(r, d, day));
  const phase: DeliveryMove['phase'] = after ? '本発注後' : '本発注前';
  const lockReason = after && units.size > 1
    ? `本発注（${[...new Set(rows.filter((d) => afterHon(r, d, day)).map((d) => `${d.cycleMonth} ${halfOf(d.slot)}：${honDeadline(r, d) || '—'}`))].join('・')}）を過ぎた便があるため、1便ずつしか動かせません（同じ日の冷凍・冷蔵は一緒）`
    : '';
  if (lockReason) errors.push(lockReason);
  if (after && !a.reason?.trim()) errors.push('本発注を過ぎた便を動かすときは理由を入れてください');
  if (a.trouble && !a.reason?.trim()) errors.push('トラブルの対応で動かすときは理由を入れてください');
  /* トラブルの対応：記録したトラブルを1つ選ぶ（動かす便の拠点の配送のトラブル。課題 4b-4） */
  const troubles = troublesFor(r, new Set(rows.map((d) => d.branchId)));
  if (a.trouble && !a.troubleId) errors.push('トラブルの対応で動かすときは、記録したトラブルを選んでください（なければ先にトラブルを登録してください）');
  else if (a.trouble && !troubles.some((t) => t.id === a.troubleId)) errors.push(`トラブル ${a.troubleId} は動かす便の拠点のトラブルではありません`);

  const to = (a.to ?? '').replace(/-/g, '/');
  const needs: { holiday: string; cross: string } = { holiday: '', cross: '' };
  const out: (MoveRow & { lead: number; warehouseId: string })[] = [];
  if (!/^\d{4}\/\d{2}\/\d{2}$/.test(to)) errors.push('移動先のお届け日を選んでください');
  else {
    const cs = cyclesOf(r), hs = holidaysOf(r);
    const s = slotOf(cs, to);
    if (!s) errors.push(`${to} はサイクル暦にない日です`);
    needs.holiday = offDay(r, to);
    for (const d of rows) {
      if (d.deliverOn === to) { errors.push(`${d.id} のお届け日はもう ${to} です`); continue; }
      const lead = leadOf(d), ship = addDays(to, -lead);
      if (ship <= day) errors.push(`${d.id}：新しい出荷日 ${ship} が今日より前です（明日以降にしてください）`);
      if (!canPick(cs, hs, ship, d.warehouseId)) errors.push(`${d.id}：新しい出荷日 ${ship} は ${r.get<Warehouse>('dm.master.warehouses', d.warehouseId)?.name ?? d.warehouseId} が出荷できない日です`);
      if (s) {
        const otherCycle = !!d.cycleMonth && s.cycle.id !== d.cycleMonth;
        const otherHalf = halfOf(s.slot) !== halfOf(d.slot);
        if (otherCycle) needs.cross = `${d.cycleMonth} サイクルの便を ${s.cycle.id} サイクル（${s.slot}）へ動かします`;
        else if (otherHalf && afterHon(r, d, day)) needs.cross = `本発注を過ぎた便を別の半分（${halfOf(d.slot)} → ${halfOf(s.slot)}）へ動かします`;
        else if (otherHalf && afterHon(r, { cycleMonth: s.cycle.id, slot: s.slot }, day)) errors.push(`移動先（${s.cycle.id} ${halfOf(s.slot)}）は本発注（${honDeadline(r, { cycleMonth: s.cycle.id, slot: s.slot })}）を過ぎています`);
      }
      out.push({ deliveryId: d.id, branchId: d.branchId, temp: d.temp, fromDeliver: d.deliverOn, fromShip: d.shipOn, toDeliver: to, toShip: ship, resent: instructionSent(r, d, day), lead, warehouseId: d.warehouseId });
    }
    if (needs.cross && !a.trouble) errors.push(`${needs.cross}。別のサイクル・本発注の後の別の半分へは、トラブルの対応のときだけ動かせます`);
    /* 件数（その日の出荷）・ドライバー（その日に届ける数）の警告 */
    const moving = new Set(rows.map((d) => d.id));
    const active = all(r).filter((x) => x.status !== '取消' && !moving.has(x.id));
    for (const [ship, n] of out.reduce((m, x) => m.set(x.toShip, (m.get(x.toShip) ?? 0) + 1), new Map<string, number>())) {
      const total = active.filter((x) => x.shipOn === ship).length + n;
      if (total > SHIP_DAY_MAX) warnings.push(`出荷日 ${ship} の出荷が ${total}件になり、しきい値（${SHIP_DAY_MAX}件）を超えます`);
    }
    const legs = r.list<Leg>('dm.delivery.legs');
    const driverOf = (id: string) => legs.find((l) => l.deliveryId === id && l.isFinal)?.driverId ?? '';
    for (const drv of new Set(rows.map((d) => driverOf(d.id)).filter(Boolean))) {
      const n = active.filter((x) => x.deliverOn === to && driverOf(x.id) === drv).length + rows.filter((d) => driverOf(d.id) === drv).length;
      if (n > DRIVER_DAY_MAX) warnings.push(`ドライバー ${r.get<{ name: string }>('dm.master.drivers', drv)?.name ?? drv} の ${to} の配送が ${n}件になります（目安 ${DRIVER_DAY_MAX}件）`);
    }
    for (const d of rows) {
      if (active.some((x) => x.branchId === d.branchId && x.deliverOn === to && x.temp === d.temp && isFood(x))) warnings.push(`${d.destination.name}：${to} に同じ温度帯（${d.temp}）の便がもうあります`);
      const cr = r.list<ChangeRequest>('dm.delivery.changeRequests').find((x) => x.deliveryId === d.id && ['申請中', '別の日のご提案'].includes(x.status));
      if (cr) warnings.push(`${d.id} には処理していない変更申請 ${cr.id} があります（移動しても申請は残ります）`);
    }
  }
  return {
    phase, many: !after, lockReason, units: units.size, errors, warnings, needs, troubles,
    rows: out.map(({ lead: _l, warehouseId: _w, ...x }) => ({ ...x, name: r.get<Delivery>(DL, x.deliveryId)?.destination.name ?? '' })),
    resend: out.filter((x) => x.resent).map((x) => x.deliveryId),
    deadline: [...new Set(rows.map((d) => honDeadline(r, d)).filter(Boolean))],
  };
}

/** 移動を実行する（movePlan の errors がなく、確かめること（休日・別のサイクル）を確かめたとき） */
export function moveDeliveries(r: DocRepo, a: MoveArgs) {
  const p = movePlan(r, a);
  if (p.errors.length) throw new ApiError(p.errors[0], p.lockReason ? 409 : 400);
  if (p.needs.holiday && !a.confirmHoliday) throw new ApiError(`${a.to} はお届けしない日（${p.needs.holiday}）です。本当に移動しますか？お客様に確認済みですか？`, 409);
  if (p.needs.cross && !a.confirmCross) throw new ApiError(`${p.needs.cross}（トラブルの対応）。確認してから移動してください`, 409);
  const at = nowStamp(), by = a.by || '運営';
  const ymd = today().slice(2).replace(/\//g, '');
  const n = r.list<{ id: string }>(MOVES).filter((x) => x.id.startsWith(`MV-${ymd}-`)).length + 1;
  const id = `MV-${ymd}-${String(n).padStart(4, '0')}`;
  const reason = a.reason?.trim() ?? '';
  for (const x of p.rows) {
    const d = r.get<Delivery>(DL, x.deliveryId)!;
    const rev = x.resent ? (d.shipRev ?? 1) + 1 : d.shipRev;
    const memo = `${at} 移動 ${id}：お届け ${x.fromDeliver} → ${x.toDeliver}（出荷 ${x.fromShip} → ${x.toShip}）${x.resent ? `・出荷指示を再送（rev${rev}）` : ''}${reason ? `（理由：${reason}）` : ''}${a.trouble && a.troubleId ? `（トラブル ${a.troubleId}）` : ''}`;
    r.put<Delivery>(DL, d.id, {
      ...d, deliverOn: x.toDeliver, shipOn: x.toShip, changeState: '調整済', moveId: id, ...(x.resent ? { shipRev: rev } : {}),
      internalMemo: [d.internalMemo, memo].filter(Boolean).join('\n'),
    });
  }
  /* 委託配送先・ドライバーへ通知（運び手ごとに1通） */
  const legs = r.list<Leg>('dm.delivery.legs').filter((l) => p.rows.some((x) => x.deliveryId === l.deliveryId));
  const carriers = [...new Set(legs.map((l) => l.carrierId))];
  for (const c of carriers) {
    const car = r.get<Carrier>('dm.master.carriers', c);
    const mine = p.rows.filter((x) => legs.some((l) => l.deliveryId === x.deliveryId && l.carrierId === c));
    const body = mine.map((x) => `${x.name} ${x.fromDeliver} → ${x.toDeliver}`).join('・');
    if (car?.kind !== '自社') notify(r, { to: { site: 'carrier', accountId: r.get('dm.account.accounts', c) ? c : '', role: '' }, templateId: 'date_change', title: `お届け日の変更（${mine.length}件）`, body, link: { type: 'delivery', id: mine[0].deliveryId } });
  }
  for (const drv of new Set(legs.map((l) => l.driverId).filter(Boolean))) {
    const mine = p.rows.filter((x) => legs.some((l) => l.deliveryId === x.deliveryId && l.driverId === drv));
    if (r.get('dm.account.accounts', drv)) notify(r, { to: { site: 'driver', accountId: drv, role: '' }, channels: ['site'], templateId: '', title: 'お届け日が変わりました', body: mine.map((x) => `${x.name} ${x.fromDeliver} → ${x.toDeliver}`).join('・'), link: { type: 'delivery', id: mine[0].deliveryId } });
  }
  if (a.notifyCorp) {
    for (const b of new Set(p.rows.map((x) => x.branchId))) {
      const mine = p.rows.filter((x) => x.branchId === b);
      notifyBranch(r, b, { templateId: 'date_change', title: 'お届け日を変更しました', body: `${[...new Set(mine.map((x) => x.fromDeliver))].join('・')} の便を ${a.to.replace(/-/g, '/')} にお届けします。${reason ? `理由：${reason}` : ''}`, link: { type: 'delivery', id: mine[0].deliveryId } });
    }
  }
  const confirmed: DeliveryMove['confirmed'] = [...(p.needs.holiday ? ['休日' as const] : []), ...(p.needs.cross ? ['別のサイクル' as const] : [])];
  const rec: DeliveryMove = {
    id, at, by, to: a.to.replace(/-/g, '/'), phase: p.phase, reason, trouble: !!a.trouble, ...(a.trouble && a.troubleId ? { troubleId: a.troubleId } : {}), confirmed, notifyCorp: !!a.notifyCorp,
    rows: p.rows.map(({ name: _n, ...x }) => x), warnings: p.warnings, carriers: carriers.filter((c) => r.get<Carrier>('dm.master.carriers', c)?.kind !== '自社'),
  };
  r.put<DeliveryMove>(MOVES, id, rec);
  return rec;
}

/** 移動先の候補（同じサイクル・前後のサイクルの28枠）。画面の小さなカレンダー用 */
export function moveCalendar(r: DocRepo, a: { ids: string[]; trouble?: boolean }, day = today()) {
  const ds = (a.ids ?? []).map((id) => r.get<Delivery>(DL, id)).filter((d): d is Delivery => !!d);
  const d = ds[0];
  if (!d) return [];
  const cs = cyclesOf(r), hs = holidaysOf(r);
  const i = Math.max(0, cs.findIndex((c) => c.id === d.cycleMonth));
  const show = cs.slice(Math.max(0, i - 1), i + 2);
  const lead = leadOf(d);
  return show.map((c) => ({
    cycle: c.id,
    days: WEEKS.flatMap((w, wi) => [1, 2, 3, 4, 5, 6, 7].map((k) => {
      const date = addDays(c.a1, wi * 7 + k - 1), ship = addDays(date, -lead);
      const off = offDay(r, date);
      /* 選べない理由（movePlan と同じ決まり。台帳 L 配送の日付の移動）：本発注の前＝同じサイクルの中／後＝同じ半分の中／別サイクル・別の半分＝トラブルの対応のときだけ。
         動かす先の半分がもう本発注を過ぎているときは、トラブルの対応でないかぎり選べない（movePlan の errors と同じ） */
      let block = '';
      for (const x of ds) {
        if (!isFood(x)) continue;
        const slot = `${w}${k}`, otherCycle = !!x.cycleMonth && c.id !== x.cycleMonth, otherHalf = halfOf(slot) !== halfOf(x.slot);
        if (otherCycle) { if (!a.trouble) block = `別のサイクル（${x.cycleMonth} → ${c.id}）へは、トラブルの対応のときだけ動かせます`; }
        else if (otherHalf && afterHon(r, x, day)) { if (!a.trouble) block = `本発注を過ぎた便は、別の半分（${halfOf(x.slot)} → ${halfOf(slot)}）へはトラブルの対応のときだけ動かせます`; }
        else if (otherHalf && afterHon(r, { cycleMonth: c.id, slot }, day)) block = `この日（${c.id} ${halfOf(slot)}）はもう本発注（${honDeadline(r, { cycleMonth: c.id, slot }) || '—'}）を過ぎています`;
        if (block) break;
      }
      return {
        date, slot: `${w}${k}`, half: halfOf(`${w}`), cur: ds.some((x) => x.deliverOn === date), past: ship <= day,
        /* 月曜（枠の1）は止めない（お届けしない日として確かめて動かす・課題 4b-2）。止めるのは倉庫が出荷できない日 */
        monday: k === 1, off, canShip: canPick(cs, hs, ship, d.warehouseId), ship,
        ships: all(r).filter((x) => x.status !== '取消' && x.shipOn === ship).length,
        afterHon: afterHon(r, { cycleMonth: c.id, slot: `${w}${k}` }, day), block,
      };
    })),
  }));
}

/* ---------------- サイクルの A1（課題 4-10） ---------------- */

/** サイクル月に配送データがあるか（資材便は数えない。ほかのサイクルから動かして来た配送も、その期間の日付なら数える）。あれば A1 は変えられない */
export function cycleHasDeliveries(r: DocRepo, ym: string) {
  const c = r.get<Cycle>('dm.delivery.cycles', ym);
  return all(r).some((d) => d.temp !== '資材' && d.status !== '取消' && (d.cycleMonth === ym || (!!c && ((d.deliverOn >= c.a1 && d.deliverOn <= c.d7) || (d.shipOn >= c.a1 && d.shipOn <= c.d7)))));
}

/**
 * サイクル月の設定（A1）を変えられない理由。''＝変えられる（2026/10/03・REQ-DL-708）。
 * 当月（と過ぎた月）・メニューを公開した月・オーダー期間が始まった月（月間メニューの orderFrom。メニューがまだなければ前月1日）・配送データを作った月
 */
export function cycleLockReason(r: DocRepo, ym: string, day = today()): string {
  if (ym <= cycleMonthAt(r, day)) return '当月・過ぎた月';
  const m = r.get<MonthlyMenu>('dm.order.menus', ym);
  if (m && m.status !== '編集中') return 'メニューを公開した月';
  if ((m?.orderFrom ?? `${addYm(ym, -1).replace('-', '/')}/01`) <= day) return 'オーダー期間が始まった月';
  if (cycleHasDeliveries(r, ym)) return '配送データを作った月';
  return '';
}

/**
 * 変えられる（cycleLockReason が空の）サイクル月の A1 を変える（月曜だけ・B7 がそのサイクル月に入る・前後のサイクルと重ならない）。
 * B7・D7 は同じ日数だけ動かす。オーダー締切日は動かさない（受付期間は月間メニューの orderFrom〜orderTo が元・課題 4b-10）。
 * 締切がサイクルに合わなくなったら orderDeadlineWarnings で知らせる。次のサイクルと重なるときは、次のサイクル（その先も）を同じ日数だけ後ろへ動かす
 */
export function setCycleA1(r: DocRepo, a: { cycleMonth: string; a1: string }) {
  const cs = cyclesOf(r);
  const c = cs.find((x) => x.id === a.cycleMonth);
  if (!c) throw new ApiError(`サイクル ${a.cycleMonth} がありません`, 404);
  const a1 = a.a1.replace(/-/g, '/');
  if (a1 === c.a1) return c;
  if (!/^\d{4}\/\d{2}\/\d{2}$/.test(a1) || new Date(a1).getDay() !== 1) throw new ApiError('A1 は月曜日にしてください', 400);
  const lock = cycleLockReason(r, c.id);
  if (lock) throw new ApiError(`${c.id} サイクルは${lock}のため A1 を変えられません`, 409);
  const b7 = addDays(a1, 13), d7 = addDays(a1, 27);
  if (b7.slice(0, 7).replace('/', '-') !== c.id) throw new ApiError(`B7（${b7}）が ${c.id} に入りません（サイクル月＝B7 が属する月）`, 400);
  const i = cs.indexOf(c), prev = cs[i - 1], next = cs[i + 1];
  if (prev && a1 <= prev.d7) throw new ApiError(`前のサイクル（${prev.id}：〜${prev.d7}）と重なります`, 409);
  const shift = Math.round((new Date(a1).getTime() - new Date(c.a1).getTime()) / 86400000);
  /* 次のサイクルと重なるときは、次のサイクルも同じ日数だけ後ろへ（配送データがない月だけ。だめなら止める） */
  if (next && d7 >= next.a1) setCycleA1(r, { cycleMonth: next.id, a1: addDays(next.a1, shift) });
  const x: Cycle = { ...c, a1, b7, d7 };
  r.put<Cycle>('dm.delivery.cycles', c.id, x);
  return x;
}

/**
 * A1 を動かしたあと、オーダー締切（月間メニューの締切日。メニューがなければサイクルの締切日）が合わなくなったサイクル（課題 4b-10）。
 * 合わない＝締切日が前半の本発注の時期（前のサイクルの B5〜）の初日以降、または最初のお届け（A2）の日以降。
 * 動かしたサイクルと、その次のサイクル（本発注の時期が前のサイクルの暦で決まる）を見る
 */
export function orderDeadlineWarnings(r: DocRepo, months: string[], before?: Set<string>) {
  const cs = cyclesOf(r);
  const ids = new Set(months.flatMap((m) => { const i = cs.findIndex((c) => c.id === m); return i < 0 ? [] : [cs[i].id, cs[i + 1]?.id].filter(Boolean) as string[]; }));
  const out: string[] = [];
  for (const id of [...ids].sort()) {
    /* before＝動かす前から合わなかったサイクル（動かしたことで合わなくなったものだけ知らせる） */
    if (before?.has(id)) continue;
    const h = honSchedule(r, id);
    if (!h) continue;
    const menu = r.get<{ orderTo?: string }>('dm.order.menus', id);
    const on = menu?.orderTo || h.orderCloseOn;
    const first = h.halves[0];
    if (on && on >= first.from) out.push(`${id} サイクル：オーダー締切（${on}${menu?.orderTo ? '・月間メニュー' : ''}）が前半の本発注の時期（${first.from}〜${first.to}）に入っています。月間メニューの締切日を見直してください`);
    else if (on && on >= first.firstDeliver) out.push(`${id} サイクル：オーダー締切（${on}）が最初のお届け（${first.firstDeliver}）より後です。月間メニューの締切日を見直してください`);
  }
  return out;
}
/** いま合わないサイクル（A1 を動かす前に取って、orderDeadlineWarnings の before に渡す） */
export const unfitCycles = (r: DocRepo, months: string[]) => new Set(orderDeadlineWarnings(r, months).map((m) => m.slice(0, 7)));
