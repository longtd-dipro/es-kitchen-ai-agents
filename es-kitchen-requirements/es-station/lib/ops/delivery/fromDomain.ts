import { areaFeesText } from '@/lib/domain/carrierFee';
import { altLabel, instructionSent } from '@/lib/domain/alt';
import { DELIVERED, shownName } from '@/lib/domain/snapshot';
import { trackingUrlOf } from '@/lib/domain/tracking';
import type { DocRepo } from '@/lib/ops/core/area';
import { addDays, today } from '@/lib/supplier/dates';
import { canDeliver, canPick, NO_PICKING_SLOTS, slotOf } from '@/lib/domain/calendar';
import { cycleLockReason, MOVES } from '@/lib/domain/move';
import type { DeliveryMove, MonthlyMenu, ParkingReport } from '@/lib/domain/types';
import { addYm } from '@/lib/domain/menu';
import type {
  Branch, Carrier, ChangeRequest as DCr, ChildContract, Contact, Corp, Cycle, Delivery, DeliveryLine, Driver, Holiday as DHoliday, Leg,
  DeliveryReport, Material as DMaterial, MaterialOrder, Option, Plan, Product, Tracking, Trouble, TroubleType, Warehouse,
} from '@/lib/domain/types';
import { RESOLVE_OPTS, ST_TONE, TROUBLE_KINDS } from './constants';
import { addDaysIso, pauseSpan, slashW } from './logic';
import { fmtMd, fmtMdW } from '@/lib/format/date';
import type {
  CalCell, CalLine, ChangeRequest, Consignee, CrJudge, CycleBand, CycleSettings, DayRow, DayView, DeliveryRecord, EsInvoice, HistItem, Hub, Inquiry, ListRow,
  MatShipment, Memo, MonthView, PlanRow, ReviewItem, RoutePoint, ShipOrder, Stage, TempKind, Tone, WeekDay, WeekItem, WeekView,
} from './types';
import { yen } from '@/lib/format/money';
import { MAT_EXTRA_OPTION } from '@/lib/domain/charges';

/*
 * 共通データ（lib/domain・dm.*）から、運営Web の配送管理の画面の形（月・週・日・一覧・配送データ詳細・変更申請・要確認・
 * 出荷指示・配送サイクル設定・配送問い合わせ・資材の集計）を作る。ここは読むだけ（書き換えは lib/domain の action）。
 * 共通データにないもの（THOMAS の出荷指示）は配送から毎回作る（保存しない）。
 */

/* ---------- 読み込み（1回の query で1度だけ読む） ---------- */

export type Ctx = ReturnType<typeof ctxOf>;

export function ctxOf(r: DocRepo) {
  const map = <T extends { id: string }>(kind: string) => new Map(r.list<T>(kind).map((x) => [x.id, x]));
  const deliveries = r.list<Delivery>('dm.delivery.deliveries');
  return {
    r, today: today(),
    cycles: r.list<Cycle>('dm.delivery.cycles').sort((a, b) => a.a1.localeCompare(b.a1)),
    holidays: r.list<DHoliday>('dm.delivery.holidays').sort((a, b) => a.date.localeCompare(b.date)),
    deliveries, byId: new Map(deliveries.map((d) => [d.id, d])),
    lines: r.list<DeliveryLine>('dm.delivery.lines'), legs: r.list<Leg>('dm.delivery.legs'), tracking: r.list<Tracking>('dm.delivery.tracking'),
    troubles: r.list<Trouble>('dm.delivery.troubles'), crs: r.list<DCr>('dm.delivery.changeRequests'), mos: r.list<MaterialOrder>('dm.delivery.materialOrders'),
    branches: map<Branch>('dm.org.branches'), corps: map<Corp>('dm.org.corps'), children: map<ChildContract>('dm.org.childContracts'),
    warehouses: map<Warehouse>('dm.master.warehouses'), carriers: map<Carrier>('dm.master.carriers'), drivers: map<Driver>('dm.master.drivers'),
    products: map<Product>('dm.master.products'), plans: map<Plan>('dm.master.plans'), materials: map<DMaterial>('dm.master.materials'),
    troubleTypes: map<TroubleType>('dm.master.troubleTypes'),
  };
}

/* ---------- 言い方・日付 ---------- */

const iso = (d: string) => d.replace(/\//g, '-');
const slash = (d: string) => d.replace(/-/g, '/');
/** 'YYYY/MM/DD…' → 'MM-DD'（表示用。共通の表示ルール・決定 8-1） */
const md = (d: string) => fmtMd(d.slice(0, 10));
/** 'YYYY/MM/DD' → 'MM-DD（曜）' */
const mdW = (d: string) => fmtMdW(d);
/** 'YYYY/MM/DD' → 'MM-DD'（元は '9/15'） */
const mdShort = (d: string) => fmtMd(d);
const monday = (d: string) => addDays(d, -((new Date(slash(d)).getDay() + 6) % 7));
const cycleLabel = (c?: Cycle) => (c ? `${+c.id.slice(5)}月サイクル` : '');
const leadOf = (d: Delivery) => Math.round((new Date(d.deliverOn).getTime() - new Date(d.shipOn).getTime()) / 86400000);
const addrText = (a?: { pref: string; city: string; addr1: string; addr2: string }) => (a ? `${a.pref}${a.city}${a.addr1}${a.addr2 ? ' ' + a.addr2 : ''}` : '');
const windowsText = (d: Delivery) => d.destination.windows.map((w) => `${w.from}〜${w.to}`).join('・') || '—';
export const tpKind = (t: string): TempKind => (t === '冷凍' ? 'frozen' : t === '常温' ? 'ambient' : t === '資材' ? 'material' : 'chilled');
/** 運営の画面の状態の言い方（共通データの状態名と同じ「再配達待」） */
export const stLabel = (s: Delivery['status']) => s as string;
const stTone = (s: Delivery['status']): Tone => ST_TONE[stLabel(s)] ?? 'neutral';
/** 共通データのトラブルの種類 → 運営の6区分 */
export const TROUBLE_TYPE: Record<TroubleType['id'], string> = {
  qty_diff: TROUBLE_KINDS[0], wrong_delivery: TROUBLE_KINDS[1], damage: TROUBLE_KINDS[2], absent: TROUBLE_KINDS[3], delay: TROUBLE_KINDS[4], other: TROUBLE_KINDS[5], undecided: '種別未定',
};
/** 運営の「対応を決める」の選択肢 → 共通データの解決 */
export const RESOLUTION: Record<string, Exclude<Trouble['resolution'], ''>> = {
  full: 'full', partial: 'partial', partial_no_resend: 'partial_no_resend', redelivery: 'redelivery', same_day: 'same_day_revisit', stop: 'stop',
};

/* ---------- 配送ごとの事実 ---------- */

const active = (d: Delivery) => d.status !== '取消';
const done = (d: Delivery) => ['納品済', '一部納品済', '中止', '取消'].includes(d.status);
const legsOf = (c: Ctx, id: string) => c.legs.filter((l) => l.deliveryId === id).sort((a, b) => a.legNo - b.legNo);
const openTroubles = (c: Ctx, id: string) => c.troubles.filter((t) => t.deliveryId === id && !t.resolution);
const openCr = (c: Ctx, id: string) => c.crs.find((x) => x.deliveryId === id && ['申請中', '別の日のご提案'].includes(x.status));
/* 納品した配送は納品したときの拠点名（変わっていれば「旧名（現：新名）」） */
const siteOf = (c: Ctx, d: Delivery) => (DELIVERED.includes(d.status) ? shownName(d.destination.name, c.branches.get(d.branchId)?.name) : c.branches.get(d.branchId)?.name ?? d.destination.name);
/** ドライバーが決まっていない区間（路線便は割り当てない） */
const unassigned = (c: Ctx, d: Delivery) => (done(d) || d.status === '確認中' ? [] : legsOf(c, d.id).filter((l) => l.regime !== 'parcel_carrier' && !l.driverId));
const carrierName = (c: Ctx, id: string) => c.carriers.get(id)?.name ?? id;
const carrierShort = (c: Ctx, l: Leg) => (l.regime === 'self' ? '自社' : carrierName(c, l.carrierId));
const carrierCol = (c: Ctx, l?: Leg) => (!l ? '—' : l.regime === 'self' ? '自社便' : l.regime === 'partner_driver' && !l.from.id.startsWith('HU') ? `${carrierName(c, l.carrierId)}（引き取り）` : carrierName(c, l.carrierId));
const whName = (c: Ctx, id: string) => c.warehouses.get(id)?.name ?? id;
const planName = (c: Ctx, d: Delivery) => (d.temp === '資材' ? '資材' : c.plans.get(c.children.get(d.childContractId)?.planId ?? '')?.name ?? '—');

/** 配送スタッフの表示（区間ごと）。例：1次 西村 拓也（みどり便）／小林 翔（自社）／—（運送会社） */
function staffText(c: Ctx, d: Delivery) {
  if (d.status === '取消') return { text: '—', muted: true };
  if (d.status === '確認中') return { text: '—（確定後に割当）', muted: true };
  const ls = legsOf(c, d.id).filter((l) => l.regime !== 'parcel_carrier');
  if (!ls.length) return { text: '—（運送会社）', muted: true };
  const multi = legsOf(c, d.id).length > 1;
  const text = ls.map((l) => {
    const name = c.drivers.get(l.driverId)?.name;
    if (l.regime === 'self' && name && !multi) return `${name}（自社）`;
    return `${l.legNo}次 ${name ?? '割当待ち'}（${carrierShort(c, l)}）`;
  }).join('・');
  return { text, muted: ls.some((l) => !l.driverId) };
}

/** 一覧の小さな字（温度帯 ・ 補足） */
function subText(c: Ctx, d: Delivery) {
  const x: string[] = [d.temp];
  if (d.parentId) x.push(`${d.parentId.slice(-4)} の子${d.internalMemo ? `・${d.internalMemo.split('\n')[0]}` : ''}`);
  const mo = c.mos.find((m) => m.deliveryId === d.id);
  if (mo) x.push(`資材の注文 ${mo.id}${mo.paid ? '（2回目・有料）' : ''}`);
  const tr = openTroubles(c, d.id).length;
  if (tr) x.push(`トラブル未解決 ${tr}件`);
  if (d.completion === 'presumed') x.push('みなし完了（運送会社が配達）');
  if (d.changeState === '調整済') x.push('お届け日の変更（調整済）');
  const cr = openCr(c, d.id);
  if (cr) x.push(`変更申請 ${cr.id}`);
  return x.join(' ・ ');
}

/** 行の色（cx＝取消、mv＝確定後に変更・子、att＝要対応） */
const rowCls = (c: Ctx, d: Delivery) =>
  !active(d) || d.status === '中止' ? 'cx' : openTroubles(c, d.id).length || unassigned(c, d).length ? 'att' : d.parentId || d.changeState === '調整済' ? 'mv' : '';

/* ---------- 段階（スケジュール） ---------- */

const FIXED_DETAIL = 'チェックで選んで別の日へ移動（本発注の前は複数・後は1便ずつ・理由必須。出荷日の前日まで）';

export function stageOf(c: Ctx, cy: Cycle, editDetail = '週表示・日表示でチェックした配送を別の日へ移動できます（移動・変更したものは青い印）'): Stage {
  const close = cy.orderCloseOn, open = close.slice(0, 8) + '01', regEnd = addDays(open, -1);
  const fixed = cy.orderState === '締切済';
  const labels = ['1. スケジュール設定', `2. メニュー登録 〜${mdShort(regEnd)}`, `3. メニュー公開・オーダー開始 ${mdShort(open)}〜`, `4. オーダー締切 ${mdShort(close)}`, '5. 配送データ（確定）'];
  const cur = fixed ? 4 : c.today < open ? 1 : 2;
  return {
    mode: fixed ? 'fixed' : 'edit', title: cycleLabel(cy), detail: fixed ? FIXED_DETAIL : editDetail,
    steps: labels.map((label, i) => ({ label, state: i < cur ? 'done' : i === cur ? 'current' : 'future' })),
  };
}

/* ---------- 月表示 ---------- */

const holidayOf = (c: Ctx, date: string) => c.holidays.find((h) => h.date === date);

export function monthView(c: Ctx, ym: string): MonthView | null {
  if (!/^\d{4}-\d{2}$/.test(ym)) return null;
  const first = `${ym.replace('-', '/')}/01`;
  const [y, m] = ym.split('-').map(Number);
  const last = addDays(`${m === 12 ? y + 1 : y}/${String(m === 12 ? 1 : m + 1).padStart(2, '0')}/01`, -1);
  const start = monday(first), end = addDays(monday(last), 6);
  const days: string[] = [];
  for (let d = start; d <= end; d = addDays(d, 1)) days.push(d);
  if (!days.some((d) => slotOf(c.cycles, d))) return null;
  const main = c.cycles.find((x) => x.id === ym) ?? slotOf(c.cycles, `${ym.replace('-', '/')}/15`)?.cycle ?? slotOf(c.cycles, days.find((d) => slotOf(c.cycles, d))!)!.cycle;
  const draft = main.orderState !== '締切済';
  const cells: CalCell[] = days.map((date) => {
    const s = slotOf(c.cycles, date), h = holidayOf(c, date);
    const ship = c.deliveries.filter((d) => active(d) && d.shipOn === date);
    const dlv = c.deliveries.filter((d) => active(d) && d.deliverOn === date);
    const isDraft = !!s && s.cycle.orderState !== '締切済';
    const pre = isDraft ? '予定 ' : '';
    const lines: CalLine[] = [];
    if (s) {
      lines.push(!canPick(c.cycles, c.holidays, date) && !ship.length ? { pre: '休：', value: '出荷', tone: 'ship', post: '' }
        : { pre: '', value: '出荷：', tone: ship.length > 300 ? 'over' : 'ship', post: `${pre}${ship.length}件` });
      lines.push(!canDeliver(c.cycles, c.holidays, date) && !dlv.length ? { pre: '休：', value: '配送', tone: 'deliver', post: '' }
        : { pre: '', value: '配送：', tone: 'deliver', post: `${pre}${dlv.length}件` });
    }
    /* バッジ（台帳 B「運営スケジュールの月表示」2026/10/03）：赤＝上限超過・トラブル、黄＝未割当（出荷待から）・変更申請、灰＝移動・変更・取消。
       過ぎた日は赤だけ。セルには赤→黄→灰の順で2つまで、残りは「+N」 */
    const past = date < c.today;
    const all: CalCell['badges'] = [];
    const count = (label: string, tone: Tone, n: number) => { if (n) all.push({ tone, label: `${label} ${n}件` }); };
    if (ship.length > 300) all.push({ tone: 'negative', label: '上限300件を超過' });
    count('トラブル', 'negative', dlv.filter((d) => openTroubles(c, d.id).length).length);
    if (!past) {
      count('未割当', 'warning', dlv.filter((d) => d.status !== '予定' && unassigned(c, d).length).length);
      count('変更申請', 'warning', c.crs.filter((x) => x.currentDate === date && ['申請中', '別の日のご提案'].includes(x.status)).length);
      count('移動・変更', 'neutral', dlv.filter((d) => d.parentId || d.changeState === '調整済').length);
      count('取消', 'neutral', c.deliveries.filter((d) => !active(d) && d.shipOn === date).length);
    }
    const badges: CalCell['badges'] = all.slice(0, 2);
    if (all.length > 2) badges.push({ tone: 'neutral', label: `+${all.length - 2}`, title: all.slice(2).map((b) => b.label).join('・') });
    const state: string[] = [];
    if (date.slice(0, 7) !== first.slice(0, 7)) state.push('out');
    if (isDraft) state.push('draft');
    if (h) state.push('holiday');
    if (ship.length > 300) state.push('over');
    return {
      date: String(+date.slice(8)), today: date === c.today, holiday: h?.name ?? '', cycle: cycleLabel(s?.cycle), slot: s?.slot ?? '', week: s?.slot.charAt(0) ?? '',
      state, lines, badges, allBadges: all.map((b) => b.label), wk: iso(monday(date)),
    };
  });
  return { id: ym, label: ym, draft, legend: draft, stage: stageOf(c, main), cells };
}

/* ---------- 週表示 ---------- */

const WDS = ['月', '火', '水', '木', '金', '土', '日'];

function weekItem(c: Ctx, d: Delivery, isShip: boolean): WeekItem {
  const tags = [!active(d) ? '取消' : '', d.parentId ? '子' : '', d.changeState === '調整済' ? '変更' : '', openTroubles(c, d.id).length ? 'トラブル' : '', unassigned(c, d).length ? '未割当' : ''].filter(Boolean);
  const cls = rowCls(c, d);
  return {
    dl: d.id, tpKind: tpKind(d.temp), nm: siteOf(c, d),
    tip: (tags.length ? `【${tags.join('・')}】` : '') + `${siteOf(c, d)} ・ 出荷 ${md(d.shipOn)} → 納品 ${md(d.deliverOn)}（押すと配送データ詳細）`,
    dt: isShip ? `着${md(d.deliverOn)}` : `出${md(d.shipOn)}`, dtCls: 'dt ' + (isShip ? 'v' : 's'), cls: 'it' + (cls ? ' ' + cls : ''),
  };
}

export function weekView(c: Ctx, id: string): WeekView | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(id)) return null;
  const from = monday(slash(id));
  const dates = WDS.map((_, i) => addDays(from, i));
  const s0 = slotOf(c.cycles, from) ?? dates.map((d) => slotOf(c.cycles, d)).find(Boolean);
  if (!s0) return null;
  const edit = s0.cycle.orderState !== '締切済';
  const max = edit ? 12 : 16;
  const build = (isShip: boolean): WeekDay[] => dates.map((date, i) => {
    const s = slotOf(c.cycles, date);
    const list = c.deliveries.filter((d) => (isShip ? d.shipOn : d.deliverOn) === date).sort((a, b) => Number(!active(a)) - Number(!active(b)));
    const n = list.filter(active).length;
    const ok = isShip ? canPick(c.cycles, c.holidays, date) : canDeliver(c.cycles, c.holidays, date);
    const day: WeekDay = { wd: WDS[i], d: +date.slice(8), slot: s?.slot ?? '', today: date === c.today, off: false, a: '', w: '', wc: isShip ? 's' : 'v', b: '', items: [], more: 0, n };
    if (!ok && !list.length) return { ...day, off: true, a: '休：', w: isShip ? '出荷' : '配送' };
    day.w = isShip ? '出荷：' : '配送：';
    day.p = edit ? '予定 ' : '';
    day.b = `${n}件`;
    day.items = list.slice(0, max).map((d) => weekItem(c, d, isShip));
    day.ids = list.filter((d) => ['予定', '出荷待'].includes(d.status) && d.temp !== '資材' && d.shipOn > c.today).map((d) => d.id);
    day.more = Math.max(0, list.length - day.items.length);
    const ua = list.filter((d) => unassigned(c, d).length).length;
    if (!isShip && ua) day.badge = `未割当 ${ua}件`;
    return day;
  });
  return {
    id: iso(from), from: iso(from), to: iso(addDays(from, 6)), edit, cycleLabel: cycleLabel(s0.cycle),
    stage: stageOf(c, s0.cycle, 'チェックで選んで「出荷データの移動」（本発注の前は複数・後は1便ずつ）。左に青い線＝移動・変更済み'),
    ship: build(true), dlv: edit ? undefined : build(false), defaultSel: edit ? [] : undefined,
  };
}

/* ---------- 日表示 ---------- */

function routeCols(c: Ctx, d: Delivery) {
  const ls = legsOf(c, d.id);
  const hub = ls.find((l) => l.to.type === 'relay');
  return { wh: whName(c, d.warehouseId), c1: carrierCol(c, ls[0]), hub: hub ? whName(c, hub.to.id) : '—', c2: ls[1] ? carrierCol(c, ls[1]) : '—' };
}
function moveNote(c: Ctx, d: Delivery) {
  if (d.parentId) return `${d.parentId} の子（${d.internalMemo.split('\n')[0] || '確認中'}）`;
  const mv = d.moveId ? c.r.get<DeliveryMove>(MOVES, d.moveId) : undefined;
  const row = mv?.rows.find((x) => x.deliveryId === d.id);
  if (mv && row) return `移動：納品 ${md(row.fromDeliver)} → ${md(d.deliverOn)}（${mv.id}${mv.reason ? `・${mv.reason}` : ''}${mv.confirmed.length ? `・${mv.confirmed.join('・')}を確認` : ''}）`;
  if (d.changeState === '調整済') {
    const cr = c.crs.filter((x) => x.deliveryId === d.id && x.status === '承認').pop();
    return cr ? `移動：納品 ${md(cr.currentDate)} → ${md(d.deliverOn)}（変更申請 ${cr.id} を承認）` : '移動：運営がお届け日を変更';
  }
  return !active(d) ? `取消（${d.internalMemo.split('\n').filter((x) => x.includes('取消')).pop()?.replace(/^.*取消：/, '') || '運営'}）` : '';
}

export function dayView(c: Ctx, id: string): DayView | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(id)) return null;
  const date = slash(id);
  const s = slotOf(c.cycles, date);
  if (!s) return null;
  const edit = s.cycle.orderState !== '締切済';
  const list = c.deliveries.filter((d) => d.shipOn === date).sort((a, b) => a.id.localeCompare(b.id));
  const n = list.filter(active).length;
  const head = `${isoW(date)} ${cycleLabel(s.cycle)} ${s.slot}`;
  const moved = list.filter((d) => moveNote(c, d)).length;
  if (edit) {
    const plans: PlanRow[] = list.map((d) => {
      const cr = openCr(c, d.id);
      return {
        id: d.id, plan: d.temp === '資材' ? d.id : `${d.contractId}・${d.slot}`, site: siteOf(c, d), svc: d.serviceForm, tpKind: tpKind(d.temp), pick: mdW(d.shipOn), ...routeCols(c, d),
        cr: cr ? `申請中 ${cr.id}（→ ${cr.wishDates.map(md).join('・') || '希望日なし'}）` : d.changeState, dlv: mdW(d.deliverOn), mv: moveNote(c, d),
      };
    });
    const crs = list.filter((d) => openCr(c, d.id)).length;
    return {
      id: iso(date), edit, head, total: n, plans, defaultSel: [],
      stage: stageOf(c, s.cycle, '予定をチェックして別の日へ移動できます（ピッキング日はリードタイムを保って一緒に動きます）'),
      stats: [{ text: `出荷 予定 ${n}件（しきい値 300件・残り ${300 - n}件）` }, { text: `変更申請 ${crs}件` }, { badge: `移動・変更 ${moved}件`, text: ' 青い行＝この日へ移動・変更したもの' }],
    };
  }
  const rows: DayRow[] = list.map((d) => {
    const st = staffText(c, d), tr = openTroubles(c, d.id).length, ua = unassigned(c, d).length;
    const mv = moveNote(c, d);
    const att = tr ? `要確認：トラブル未解決 ${tr}件` : ua ? '要確認：ドライバー未設定' : '';
    return {
      id: d.id, site: siteOf(c, d), svc: d.serviceForm, st: stLabel(d.status), stTone: stTone(d.status), cr: d.changeState, tpKind: tpKind(d.temp),
      plan: planName(c, d), pick: md(d.shipOn), ...routeCols(c, d), drv: st.text, drvCls: ua ? 'ua' : '', dlv: md(d.deliverOn), mv, att,
      cls: !active(d) ? 'cx' : mv ? 'mv' : att ? 'att' : '',
    };
  });
  const att = rows.filter((x) => x.att).length;
  return {
    id: iso(date), edit, head, total: n, rows, stage: stageOf(c, s.cycle),
    stats: [{ text: `出荷 ${n}件（しきい値 300件）` }, { text: '要対応 ', strong: `${att}件`, tail: '（ドライバー未設定・トラブル）' }, { badge: `変更 ${moved}件`, text: ' 青い行＝確定後に変更・取消したもの' }],
  };
}

/* ---------- 出荷・配送管理の一覧 ---------- */

/** 一覧の行（予定は配送データになるまで一覧に出さない） */
/** 一覧の絞り込みで見る値（法人・拠点・契約・住所・送り状・区間の担当など）。画面の選択肢の表記と同じ（whLabel など） */
export const whLabel = (c: Ctx, id: string) => (c.warehouses.get(id) ? `${whName(c, id)} ${id}` : id);
export const staffLabel = (c: Ctx, id: string) => `${id} ${c.drivers.get(id)?.name ?? ''}`.trim();
export const hubLabel = (c: Ctx, id: string) => (c.warehouses.get(id) ? `${whName(c, id)} ${id}` : id);

function filterKeys(c: Ctx, d: Delivery): ListRow['fq'] {
  const b = c.branches.get(d.branchId), corp = b?.corpId ? c.corps.get(b.corpId) : undefined, ls = legsOf(c, d.id);
  const ad = d.destination.address, mc = mainContact(c, d.branchId);
  return {
    who: [corp?.id, corp?.name, d.branchId, b?.name, d.destination.name, d.contractId, d.childContractId].filter(Boolean).join(' '),
    addr: [ad.zip, addrText(ad), d.destination.tel, b?.tel, mc?.tel].filter(Boolean).join(' '),
    slips: c.tracking.filter((t) => t.deliveryId === d.id && t.status === 'active').map((t) => t.trackingNo),
    course: c.children.get(d.childContractId)?.course ?? '',
    wh: whLabel(c, d.warehouseId),
    carriers: [...new Set(ls.map((l) => carrierName(c, l.carrierId)))],
    hubs: ls.flatMap((l) => [l.from, l.to]).filter((p) => p.id.startsWith('HU')).map((p) => hubLabel(c, p.id)),
    staffs: ls.filter((l) => l.driverId).map((l) => staffLabel(c, l.driverId)),
    unassigned: unassigned(c, d).length > 0,
    trouble: openTroubles(c, d.id).length > 0,
    childCheck: !!d.parentId && d.status === '確認中',
  };
}

/** スケジュールの検索条件（月・週・日で共通。sq1＝法人・拠点・契約、sq2＝住所・電話、sq3＝送り状、s1〜s10＝選ぶ条件） */
export type ScheduleFilter = Partial<Record<'sq1' | 'sq2' | 'sq3' | 's1' | 's2' | 's3' | 's4' | 's5' | 's6' | 's7' | 's8' | 's9' | 's10', string>>;

/**
 * 検索条件に合う配送だけにした Ctx（月・週・日の集計は、条件で絞ってからまとめる）。
 * 配送パターン：資材＝都度配送、それ以外＝サイクル（個別指定は配送に持っていないので当たらない）。配送回数＝その子契約・温度帯の便の枠の数
 */
export function scheduleCtx(c: Ctx, f?: ScheduleFilter): Ctx {
  if (!f || !Object.values(f).some((v) => v && v.trim())) return c;
  const q1 = (f.sq1 ?? '').trim(), q2 = (f.sq2 ?? '').trim(), q3 = (f.sq3 ?? '').trim();
  const deliveries = c.deliveries.filter((d) => {
    const k = filterKeys(c, d);
    if (q1 && !(d.id + ' ' + siteOf(c, d) + ' ' + k.who).includes(q1)) return false;
    if (q2 && !k.addr.includes(q2)) return false;
    if (q3 && !k.slips.some((x) => x.includes(q3))) return false;
    if (f.s1 && k.course !== f.s1) return false;
    if (f.s2 && stLabel(d.status) !== f.s2) return false;
    if (f.s3 && (k.course === 'ESライト（自販機）') !== (f.s3 === '自販機あり')) return false;
    if (f.s4 && (d.temp === '資材' ? '都度配送' : 'サイクル') !== f.s4) return false;
    if (f.s5 && d.serviceForm !== f.s5) return false;
    if (f.s6) {
      const n = c.children.get(d.childContractId)?.channels.find((x) => x.temp === d.temp)?.slots.length ?? 0;
      if (`${n}回` !== f.s6) return false;
    }
    if (f.s7 && k.wh !== f.s7) return false;
    if (f.s8 && !k.carriers.includes(f.s8)) return false;
    if (f.s9 && !k.hubs.includes(f.s9)) return false;
    if (f.s10 && !k.staffs.includes(f.s10)) return false;
    return true;
  });
  return { ...c, deliveries, byId: new Map(deliveries.map((d) => [d.id, d])) };
}

export function listRows(c: Ctx): ListRow[] {
  return c.deliveries.filter((d) => d.status !== '予定').map((d) => {
    const st = staffText(c, d);
    return {
      id: d.id, site: siteOf(c, d), sub: subText(c, d), temp: d.temp, method: d.serviceForm, st: stLabel(d.status), stTone: stTone(d.status), cr: d.changeState,
      ship: mdW(d.shipOn), shipped: d.shippedOn ? mdW(d.shippedOn) : '', dlv: mdW(d.deliverOn), shipIso: d.shipOn, dlvIso: d.deliverOn, staff: st.text, staffMuted: st.muted, cls: rowCls(c, d),
      canEdit: ['予定', '出荷待'].includes(d.status), go: openTroubles(c, d.id).length ? 'trouble' : undefined,
      fq: filterKeys(c, d),
    };
  });
}

/** 出荷・配送管理の選択肢（倉庫・委託配送会社・中継倉庫・配送スタッフ・コースは、使っている配送のデータから） */
export function listOpts(c: Ctx) {
  const ds = c.deliveries.filter((d) => d.status !== '予定'), rows = ds.map((d) => filterKeys(c, d));
  const uniq = (xs: string[]) => [...new Set(xs.filter(Boolean))].sort((a, b) => a.localeCompare(b, 'ja'));
  return {
    wh: uniq(rows.map((r) => r.wh)), carrier: uniq(rows.flatMap((r) => r.carriers)), hub: uniq(rows.flatMap((r) => r.hubs)),
    staff: uniq(rows.flatMap((r) => r.staffs)), course: uniq(rows.map((r) => r.course)),
    temp: uniq(ds.map((d) => d.temp)), method: uniq(ds.map((d) => d.serviceForm)), status: uniq(ds.map((d) => stLabel(d.status))),
  };
}

/* ---------- 配送データ詳細 ---------- */

const mainContact = (c: Ctx, branchId: string) =>
  c.r.list<Contact>('dm.org.contacts').find((x) => x.owner.type === 'branch' && x.owner.id === branchId && x.kind === 'メイン担当者');

function points(c: Ctx, d: Delivery): RoutePoint[] {
  const ls = legsOf(c, d.id);
  const out: RoutePoint[] = ls.map((l, i) => {
    const w = c.warehouses.get(l.from.id);
    const driver = c.drivers.get(l.driverId)?.name;
    return {
      no: i + 1, nm: w?.name ?? l.from.id, id: `${l.from.id} ・ ${l.from.type === 'warehouse' ? 'ピッキング倉庫' : '中継拠点'}`, addr: addrText(w?.address), addrSub: '', tel: w?.tel || '—',
      person: '担当者 未設定', cond: '—', condSub: '',
      next: `${carrierName(c, l.carrierId)}（${l.regime === 'self' ? '自社' : l.regime === 'partner_driver' ? '委託' : '運送会社'}）`,
      nextSub: `${l.legNo}次${l.isFinal ? '＝最終区間' : ''} ・ ${l.regime === 'parcel_carrier' ? '運送会社（割当なし）' : `配送スタッフ ${driver ?? '割当待ち'}`}`,
      pick: l.pickedUpAt ? md(l.pickedUpAt) + l.pickedUpAt.slice(10) : '—', pickSub: l.pickedUpAt ? `${driver ?? carrierName(c, l.carrierId)}（ここで受取済）` : '', docs: '—',
    };
  });
  const b = c.branches.get(d.branchId), corp = b?.corpId ? c.corps.get(b.corpId) : undefined, mc = mainContact(c, d.branchId);
  out.push({
    no: out.length + 1, nm: siteOf(c, d), id: `${d.branchId}${corp ? ' ・ ' + corp.name : ''}`, addr: addrText(d.destination.address), addrSub: '納品日時点の住所',
    tel: mc?.name ?? '—', person: mc?.tel ?? d.destination.tel, cond: d.destination.note || '—', condSub: `受取 ${windowsText(d)}`, next: '—（到着）', nextSub: '', pick: '—', pickSub: '', docs: '—',
  });
  return out;
}

/** 運営のメモ・操作の記録（internalMemo の1行＝'YYYY/MM/DD HH:mm 内容' か、日時なしのメモ） */
function memoLines(d: Delivery) {
  return d.internalMemo.split('\n').filter(Boolean).map((x) => {
    const m = x.match(/^(\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}) (.*)$/);
    return m ? { at: m[1], text: m[2] } : { at: '', text: x };
  });
}

function history(c: Ctx, d: Delivery): HistItem[] {
  const h: HistItem[] = [];
  const who = (t: Trouble) => t.reportedBy.site === 'driver' ? `ドライバー ${c.drivers.get(t.reportedBy.accountId)?.name ?? t.reportedBy.accountId}`
    : t.reportedBy.site === 'carrier' ? `委託配送先 ${carrierName(c, t.reportedBy.accountId)}` : '運営';
  for (const x of c.crs.filter((y) => y.deliveryId === d.id)) {
    h.push({ time: x.requestedAt, who: x.requestedBy.site === 'corp' ? `法人 ${x.requestedBy.accountId}` : '運営', what: `変更申請 ${x.id}：納品日 ${md(x.currentDate)} → ${x.wishDates.map(md).join('・') || '希望日なし'}（${x.reason}）` });
    if (x.decidedAt) h.push({ time: x.decidedAt, who: x.status === '取り下げ' ? '法人' : '運営', what: `変更申請 ${x.id}：${x.status}${x.proposedDate ? ` ${md(x.proposedDate)}` : ''}${x.decisionReason ? `（理由：${x.decisionReason}）` : ''}` });
  }
  for (const l of legsOf(c, d.id).filter((x) => x.pickedUpAt)) h.push({ time: l.pickedUpAt, who: c.drivers.get(l.driverId)?.name ?? carrierName(c, l.carrierId), what: `荷物受取（${whName(c, l.from.id)}・${l.legNo}次）。状態：→ 受取済` });
  for (const t of c.troubles.filter((x) => x.deliveryId === d.id)) {
    h.push({ time: t.reportedAt, who: who(t), what: `トラブル報告（${TROUBLE_TYPE[t.typeId]}）：${t.note}` });
    if (t.resolvedAt) h.push({ time: t.resolvedAt, who: '運営', what: `トラブルを解決：${resolveLabel(t.resolution)}` });
  }
  if (d.deliveredAt) h.push({ time: d.deliveredAt, who: d.completion === 'presumed' ? 'システム（みなし完了）' : 'ドライバー', what: `納品完了（${d.deliveredQty ?? 0}/${d.plannedQty}）。状態：→ ${stLabel(d.status)}` });
  for (const m of memoLines(d).filter((x) => x.at)) h.push({ time: m.at, who: '運営', what: m.text });
  return h.sort((a, b) => a.time.localeCompare(b.time));
}
const resolveLabel = (res: Trouble['resolution']) => RESOLVE_OPTS.find((o) => RESOLUTION[o.v] === res)?.label ?? res;

/** 出荷指示（THOMAS）の状態。THOMAS の倉庫で、予定・確認中・資材でない配送だけ */
const soTarget = (c: Ctx, d: Delivery) => !!c.warehouses.get(d.warehouseId)?.thomasCode && !['予定', '確認中'].includes(d.status) && d.temp !== '資材';

export function deliveryRecord(c: Ctx, d: Delivery): DeliveryRecord & { children: string[] } {
  const cy = c.cycles.find((x) => x.id === d.cycleMonth);
  const ls = legsOf(c, d.id), fin = ls.find((l) => l.isFinal);
  const lines = c.lines.filter((l) => l.deliveryId === d.id);
  const mo = c.mos.find((m) => m.deliveryId === d.id);
  const trs = c.troubles.filter((t) => t.deliveryId === d.id), open = trs.filter((t) => !t.resolution);
  const crs = c.crs.filter((x) => x.deliveryId === d.id), oc = openCr(c, d.id);
  const children = c.deliveries.filter((x) => x.parentId === d.id).map((x) => x.id);
  const autoChild = open.find((t) => t.childDeliveryId)?.childDeliveryId ?? (d.parentId ? undefined : children.find((x) => c.byId.get(x)?.status === '確認中'));
  const memos = memoLines(d);
  const lastRes = trs.filter((t) => t.resolution).sort((a, b) => a.resolvedAt.localeCompare(b.resolvedAt)).pop();
  const resMemo = memos.filter((m) => m.text.startsWith('トラブル解決：')).pop()?.text.match(/（(.*)）$/)?.[1] ?? '';
  const so = soTarget(c, d);
  const sent = so && d.shipOn < c.today;
  const tracking = c.tracking.filter((t) => t.deliveryId === d.id);
  const lead = leadOf(d);
  const closed = cy?.orderState === '締切済';
  const st = stLabel(d.status);
  const sample: DeliveryRecord['sample'] = d.status === '予定' ? 'plan' : d.parentId && d.status === '確認中' ? 'child' : open.length ? 'trouble' : d.deliveredQty !== null ? 'done' : 'pending';
  const qty = mo
    ? mo.lines.map((l) => ({ n: c.materials.get(l.materialId)?.name ?? l.materialId, id: l.materialId, p: String(l.qty), f: String(l.qty), how: '資材の注文' }))
    : lines.map((l) => ({
      n: shownName(l.productName, c.products.get(l.productId)?.name ?? l.productId) + (l.kind ? `（${altLabel(l, (x) => c.products.get(x)?.name ?? x)}）` : ''), id: l.productId, p: `${l.plannedQty}個`,
      /* 単位：商品ごとの数は「個」、便の合計の食数は「食」（2026/10/03 決定） */
      f: l.deliveredQty !== null ? `${l.deliveredQty}個` : closed && d.status !== '確認中' ? `${l.plannedQty}個` : '—',
      how: d.status === '確認中' ? '仮（解決・確定で決まる）' : l.deliveredQty !== null ? '納品の実績' : closed ? '法人のオーダー（締切で確定）' : '法人のオーダー（締切前）',
    }));
  return {
    id: d.id, sample, site: siteOf(c, d), siteShort: siteOf(c, d), temp: d.temp, st, stTone: stTone(d.status),
    stage: d.status === '予定' ? '予定' : d.status === '確認中' ? '確定待ち（出荷指示の対象外）' : sent ? '確定（出荷指示済み）' : '確定',
    locked: closed && d.status === '出荷待', deadline: cy?.orderCloseOn ?? '—',
    pkg: d.temp === '資材' ? '資材' : `${d.temp} 惣菜セット`, cycle: cy ? `${cycleLabel(cy)} ・ ${d.slot}` : '資材（サイクルなし）',
    dlv: isoW(d.deliverOn) + (d.status === '確認中' ? '（仮）' : ''), pick: isoW(d.shipOn) + (d.status === '確認中' ? '（仮）' : ''), shipped: d.shippedOn ? isoW(d.shippedOn) : '—（まだ出荷していない）',
    park: ((ps) => ps.length ? `${ps.reduce((a, p) => a + p.feeYen, 0).toLocaleString('ja-JP')}円（${ps.map((p) => p.receiptFile).join('・')}）` : '—')(c.r.list<ParkingReport>('dm.report.parking').filter((p) => p.deliveryId === d.id)),
    leadHelper: `リードタイム ${lead}日`, time: windowsText(d), svc: d.serviceForm,
    so: !so ? '対象外' : sent || (d.shipRev ?? 1) > 1 ? `送信済 rev${d.shipRev ?? 1}` : '未送信', soHelper: !so ? (d.temp === '資材' ? '資材は ES事務所から出荷（THOMAS 連携なし）' : '確定して出荷待になるまで出荷指示に含めません') : sent ? `${md(addDays(d.shipOn, -3))} 16:00 に送信` : `${md(addDays(d.shipOn, -3))} に送信予定`,
    cp: d.contractId, child: d.childContractId || '—',
    kindLabel: mo ? '資材の注文' : d.parentId ? '子の種類' : 'オーダーID', kind: mo ? mo.id : d.parentId ? (d.internalMemo.split('\n')[0] || '子の配送') : `O-${d.cycleMonth.replace('-', '')}-${d.branchId}`,
    kindHelper: d.parentId ? `親 ${d.parentId}` : '',
    qtyTitle: d.status === '予定' ? '数量（予定・オーダー締切で確定）' : d.status === '確認中' ? '数量（仮・再送しうる最大量）' : '数量（オーダー締切で確定）', qty,
    crs: crs.filter((x) => x !== oc).map((x) => ({
      id: x.id, date: x.requestedAt.slice(0, 10), who: x.requestedBy.accountId, whoSub: x.requestedBy.site === 'corp' ? '法人Web' : '運営', what: `納品日 ${mdW(x.currentDate)} → ${x.wishDates.map(mdW).join('・') || '希望日なし'}`, why: x.reason,
      judge: judgeOf(c, x), st: x.status, tone: x.status === '承認' ? 'success' : x.status === '否認' ? 'negative' : 'neutral', by: x.decidedAt ? `運営 ・ ${md(x.decidedAt)}` : '—', byWhy: x.decisionReason, cls: '',
    })),
    crOpen: !!oc, crOpenId: oc?.id, ...(oc ? { crOpenView: crOpenView(c, d, oc) } : {}),
    points: points(c, d), hasInvoice: tracking.length > 0,
    invoices: tracking.map((t) => {
      const url = trackingUrlOf(c.carriers.get(t.carrierId), t.trackingNo);
      return { no: t.trackingNo, src: c.carriers.get(t.carrierId)?.kind === '路線' ? '運送会社' : 'ES採番', c: carrierName(c, t.carrierId), box: `${t.boxNo} / ${t.boxTotal}`, st: t.status === 'active' ? '有効' : '無効', tone: t.status === 'active' ? 'success' : 'neutral', track: url ? '追跡ページ' : '—', tid: t.id, url, active: t.status === 'active' };
    }),
    canTrack: d.regime === 'parcel_carrier' && !['予定', '取消'].includes(d.status),
    invNote: d.regime === 'parcel_carrier' ? '送り状は出荷のあとに運送会社の CSV で取り込むか、ここで入れます（ヤマトは12桁の数字）。配送の状況はヤマトの追跡ページで確かめます（API 連携なし）。' : '1次が委託・自社の便は ES が採番します（配送No＋箱番号）。追跡ページはありません。',
    hasResult: d.deliveredQty !== null, ...(d.deliveredQty !== null ? { result: resultOf(c, d) } : {}), noResultText: d.status === '確認中' ? '確認中の子です。確定して出荷されると実績が入ります。' : `納品日（${isoW(d.deliverOn)}）の当日、${d.regime === 'parcel_carrier' ? '翌朝にみなし完了で' : 'ドライバーの報告で'}登録されます。`,
    trbOpen: open.length > 0, trbDone: trs.length > 0 && !open.length, trbCount: open.length, autoChild,
    trb: trs.map((t, i) => ({
      no: i + 1, kind: TROUBLE_TYPE[t.typeId], tone: t.resolution ? 'warning' : 'negative', raw: t.typeId === 'undecided' ? t.note.split('：')[0] : c.troubleTypes.get(t.typeId)?.name ?? t.typeId,
      who: t.reportedBy.site === 'driver' ? `${c.drivers.get(t.reportedBy.accountId)?.name ?? t.reportedBy.accountId}（ドライバー）` : t.reportedBy.site === 'carrier' ? `${carrierName(c, t.reportedBy.accountId)}（委託配送先）` : '運営（代理登録）',
      at: md(t.reportedAt) + t.reportedAt.slice(10), note: t.note, photo: '—', child: t.childDeliveryId || '—', st: t.resolution ? '解決済' : '未解決', stTone: t.resolution ? 'success' : 'negative',
    })),
    noTrbTitle: d.parentId ? 'この子にはトラブル報告はありません' : 'トラブル報告はありません',
    noTrbText: d.parentId ? `元のトラブルは親 ${d.parentId} の「トラブル」タブで解決します。` : '出荷後にドライバー・委託配送会社から報告があるとここに並びます。',
    isChild: !!d.parentId, parent: d.parentId || undefined,
    canCancel: ['予定', '出荷待', '確認中'].includes(d.status), canDup: !d.parentId && !['予定', '取消'].includes(d.status),
    canReport: ['出荷済', '受取済', '納品済', '一部納品済', '再配達待'].includes(d.status), canEdit: ['予定', '出荷待'].includes(d.status),
    /* 日付の変更の候補は dateAlt({ id }) で出す（画面がまだ id を渡さないので、編集の画面では出さない） */
    canDateChange: d.status === '出荷待' && today() < d.shipOn, dateLimit: isoW(addDays(d.shipOn, -1)),
    relay: ls.some((l) => l.to.type === 'relay') ? '中継あり' : '中継なし', lead: `${lead}日`,
    hist: history(c, d),
    memos: memos.filter((m) => !m.at || m.text.startsWith('メモ：')).reverse().map((m): Memo => ({ at: m.at ? md(m.at) + m.at.slice(10) : '—', who: '運営', text: m.text.replace(/^メモ：/, '') })),
    carrier2: fin ? carrierCol(c, fin) : '—', staff: c.drivers.get(fin?.driverId ?? '')?.name ?? '', addr: addrText(d.destination.address),
    resolved: lastRes && !open.length ? { how: resolveLabel(lastRes.resolution), by: `運営 ・ ${lastRes.resolvedAt}`, next: lastRes.childDeliveryId || children.join('・') || '—', reason: resMemo } : undefined,
    children,
  };
}

/* ---------- 日付の変更の候補（締切後・同じサイクルの同じ半分） ---------- */

function sameHalf(c: Ctx, d: Delivery) {
  const cy = c.cycles.find((x) => x.id === d.cycleMonth);
  if (!cy || !d.slot) return [];
  const start = addDays(cy.a1, d.slot[0] <= 'B' ? 0 : 14);
  return Array.from({ length: 14 }, (_, i) => addDays(start, i));
}
const shipCount = (c: Ctx, date: string) => c.deliveries.filter((d) => active(d) && d.shipOn === date).length;
const slotText = (c: Ctx, date: string) => { const s = slotOf(c.cycles, date); return s ? `${cycleLabel(s.cycle)} ${s.slot}` : '—'; };

function altRow(c: Ctx, d: Delivery, v: string, date: string, lead = leadOf(d)) {
  const ship = addDays(date, -lead);
  const okD = canDeliver(c.cycles, c.holidays, date), okS = canPick(c.cycles, c.holidays, ship, d.warehouseId), n = shipCount(c, ship);
  return {
    v, d: isoW(date), dc: slotText(c, date) + (okD ? '' : '（納品不可）'), s: isoW(ship), sc: slotText(c, ship) + (okS ? '' : '（出荷不可）'), lt: `${lead}日`,
    n: `${n}件${n >= 300 ? '（上限 300）' : ''}`, dC: okD ? '' : 'ua', sC: okS ? '' : 'ua', nC: n >= 300 ? 'ua' : '', lC: '', dis: !okD || !okS,
  };
}
const isoW = (date: string) => slashW(date).replace(/\//g, '-');

export function dateAlt(c: Ctx, d: Delivery) {
  return [{ ...altRow(c, d, 'cur', d.deliverOn), d: `${isoW(d.deliverOn)}（今の日）` },
    ...sameHalf(c, d).filter((x) => x !== d.deliverOn && x > c.today).map((x, i) => ({ ...altRow(c, d, `a${i + 1}`, x) }))];
}
/** 候補の値（cur・a1…）→ 日付 */
export const altDate = (c: Ctx, d: Delivery, v: string) => {
  const i = Number(v.replace(/^a/, '')) - 1;
  return sameHalf(c, d).filter((x) => x !== d.deliverOn && x > c.today)[i];
};

/* ---------- 変更申請 ---------- */

/** 納品実績（受付簿 No.47：見本ではなく共通データから。受取者のデータはないので出さない） */
function resultOf(c: Ctx, d: Delivery): NonNullable<DeliveryRecord['result']> {
  const pname = (id: string) => c.products.get(id)?.name ?? id;
  const place = (x: Leg['from'] | Leg['to']) => x.type === 'destination' ? c.branches.get(x.id)?.name ?? x.id : c.warehouses.get(x.id)?.name ?? x.id;
  const legs = c.legs.filter((l) => l.deliveryId === d.id).sort((a, b) => a.legNo - b.legNo);
  const fin = legs.find((l) => l.isFinal) ?? legs[legs.length - 1];
  const drv = fin?.driverId ? c.drivers.get(fin.driverId)?.name ?? fin.driverId : '';
  const REG: Record<string, string> = { self: '自社便', partner_driver: '委託', parcel_carrier: '路線便' };
  const rep = c.r.list<DeliveryReport>('dm.report.deliveryReports').find((x) => x.deliveryId === d.id);
  const lines = c.lines.filter((l) => l.deliveryId === d.id);
  const time = (s: string) => (s ? s.slice(11, 16) : '');
  const steps: NonNullable<DeliveryRecord['result']>['steps'] = [];
  if (rep) {
    if (fin?.pickedUpAt) steps.push({ state: 'ok', label: `荷物受取（${place(fin.from)}）`, reason: time(fin.pickedUpAt) });
    steps.push({ state: rep.photosBefore.length ? 'ok' : 'na', label: '① 陳列前', reason: `写真 ${rep.photosBefore.length}枚` });
    const disp = rep.stock.reduce((a, x) => a + x.disposed, 0);
    steps.push({ state: 'ok', label: '② 在庫/廃棄', reason: disp ? `廃棄 ${disp}食を登録` : '廃棄なし' });
    const insp = rep.inspection.reduce((a, x) => a + x.qty, 0), plan = lines.reduce((a, l) => a + l.plannedQty, 0);
    steps.push({ state: insp === plan ? 'ok' : 'warn', label: '③ 陳列（検品）', reason: insp === plan ? `${insp}食` : `${insp}食（予定 ${plan}食・差 ${insp - plan}）` });
    steps.push({ state: rep.photosAfter.length ? 'ok' : 'na', label: '④ 陳列後', reason: `${time(rep.completedAt)}${rep.photosAfter.length ? ` ・ 写真 ${rep.photosAfter.length}枚` : ''}`.trim() });
    if (rep.cash) steps.push({ state: rep.cash.collectedYen === rep.cash.expectedYen ? 'ok' : 'warn', label: '⑤ 集金登録', reason: `予定 ${rep.cash.expectedYen.toLocaleString('ja-JP')}円 ・ 実収 ${rep.cash.collectedYen.toLocaleString('ja-JP')}円` });
  }
  const trs = c.troubles.filter((t) => t.deliveryId === d.id);
  return {
    doneAt: d.deliveredAt ? `${isoW(d.deliveredAt.slice(0, 10))} ${time(d.deliveredAt)}`.trim() : '—',
    method: d.completion === 'presumed' ? '路線便のみなし完了（翌朝）' : d.completion === 'reported' ? `ドライバーの報告（${REG[fin?.regime ?? d.regime] ?? ''}）` : '—',
    staff: drv ? `${drv}（${carrierName(c, fin!.carrierId)}）` : fin ? carrierName(c, fin.carrierId) : '—',
    follow: c.deliveries.filter((x) => x.parentId === d.id && active(x)).map((x) => ({ id: x.id, st: x.status, qty: x.plannedQty })),
    steps,
    diffs: lines.filter((l) => l.deliveredQty !== null && (l.deliveredQty !== l.plannedQty || l.substitutedFrom)).map((l) => ({
      n: l.productName ?? pname(l.productId), plan: l.plannedQty, got: l.deliveredQty ?? 0,
      sub: l.substitutedFrom ? pname(l.substitutedFrom) : '',
      why: l.substitutedFrom ? '代替品（元の商品の料金で請求）' : trs.map((t) => t.note).filter(Boolean).join('／'),
    })),
    stock: rep ? rep.stock.map((x) => {
      const dlv = rep.inspection.filter((y) => y.productId === x.productId).reduce((a, y) => a + y.qty, 0);
      return { n: pname(x.productId), before: x.remaining, disp: x.disposed, dlv, after: x.remaining - x.disposed + dlv };
    }) : [],
    legs: legs.map((l) => ({ route: `${l.legNo}次${l.isFinal ? '（最終区間）' : ''} ${place(l.from)} → ${place(l.to)}`, carrier: carrierName(c, l.carrierId), regime: REG[l.regime] ?? l.regime, at: l.pickedUpAt ? `${md(l.pickedUpAt)} ${time(l.pickedUpAt)}` : '—' })),
  };
}

/** 申請中の変更申請の帯（受付簿 No.47：見本の文ではなく共通データから） */
function crOpenView(c: Ctx, d: Delivery, x: DCr): NonNullable<DeliveryRecord['crOpenView']> {
  const slot = (date: string) => slotOf(c.cycles, date)?.slot ?? '';
  const cy = c.cycles.find((y) => y.id === d.cycleMonth);
  const close = cy?.orderCloseOn ?? '';
  const left = close ? Math.round((new Date(close.replace(/\//g, '-')).getTime() - new Date(c.today.replace(/\//g, '-')).getTime()) / 86400000) : NaN;
  const lead = leadOf(d);
  const acc = c.r.get<{ name: string }>('dm.account.accounts', x.requestedBy.accountId);
  const who = x.requestedBy.site === 'corp' ? `${acc?.name ?? x.requestedBy.accountId}（法人Web）` : `${acc?.name ?? '運営'}（運営）`;
  const also = c.deliveries.filter((y) => y.id !== d.id && active(y) && y.branchId === d.branchId && y.deliverOn === d.deliverOn).map((y) => `${y.temp} ${y.id}`);
  return {
    judge: judgeOf(c, x), close: close ? `${md(close)}（オーダー締切${Number.isFinite(left) ? `・あと${left}日` : ''}）` : '—',
    cur: `${isoW(x.currentDate)} ${slot(x.currentDate)}`.trim(), curPick: `ピッキング ${mdW(d.shipOn)}`, why: x.reason || '—', who, at: x.requestedAt,
    wishes: x.wishDates.map((w, i) => {
      const ship = addDays(w, -lead), n = shipCount(c, ship);
      return { label: i === 0 ? '第一希望' : `第${'一二三四五'[i] ?? i + 1}希望`, date: `${isoW(w)} ${slot(w)}`.trim(), pick: `ピッキング ${mdW(ship)}`, note: `${n}件（上限 300）${n >= 300 ? '・上限を超える' : ''}` };
    }),
    also: also.length ? `同じ拠点・同じ納品日の ${also.join('・')} も一緒に動きます。` : '',
  };
}

/** システムの判定：希望日なし／提案中／第一希望でお届け・出荷できて件数が上限以内なら問題なし */
export function judgeOf(c: Ctx, x: DCr): CrJudge {
  if (x.status === '別の日のご提案') return '提案中（法人の返事待ち）';
  const d = c.byId.get(x.deliveryId);
  if (!x.wishDates.length || !d) return '希望日なし';
  const w = x.wishDates[0], ship = addDays(w, -leadOf(d));
  return sameHalf(c, d).includes(w) && canDeliver(c.cycles, c.holidays, w) && canPick(c.cycles, c.holidays, ship, d.warehouseId) && shipCount(c, ship) < 300 ? '問題なし' : '要再確認';
}

const CR_STATE: Record<DCr['status'], ChangeRequest['state']> = { 申請中: '未処理', 別の日のご提案: '未処理', 承認: '承認', 否認: '否認', 取り下げ: '否認' };

export function crView(c: Ctx, x: DCr): ChangeRequest {
  const d = c.byId.get(x.deliveryId);
  const judge = judgeOf(c, x), w = x.wishDates[0], lead = d ? leadOf(d) : 1;
  return {
    id: x.id, rcv: iso(x.requestedAt.slice(0, 10)), site: c.branches.get(x.branchId)?.name ?? x.branchId, svc: d?.serviceForm ?? '—', temp: d?.temp ?? '—',
    cur: isoW(x.currentDate), want: w ? isoW(w) : '希望日なし', judge,
    why: x.reason + (x.status === '別の日のご提案' ? `（${md(x.proposedDate)} をご提案済み${x.decisionReason ? `：${x.decisionReason}` : ''}）` : ''),
    on: judge === '問題なし', after: w ? isoW(w) : undefined, pick: w && d ? `${md(d.shipOn)} → ${md(addDays(w, -lead))}` : undefined,
    note: x.wishDates[1] ? `第二希望 ${mdW(x.wishDates[1])}` : undefined, dl: x.deliveryId, state: CR_STATE[x.status],
  };
}

/** 変更申請の確認（希望日 w1… と、同じ半分の別日 a1…） */
export function crProcess(c: Ctx, x: DCr) {
  const d = c.byId.get(x.deliveryId)!;
  const want = x.wishDates.map((w, i) => ({ ...altRow(c, d, `w${i + 1}`, w), no: i + 1 }));
  const alt = crAltDates(c, x).map((w, i) => ({ ...altRow(c, d, `a${i + 1}`, w), no: i + 1 }));
  return { want, alt };
}
export const crAltDates = (c: Ctx, x: DCr) => {
  const d = c.byId.get(x.deliveryId);
  return d ? sameHalf(c, d).filter((w) => w !== d.deliverOn && !x.wishDates.includes(w) && w > c.today && canDeliver(c.cycles, c.holidays, w)).slice(0, 6) : [];
};

/* ---------- 要確認（共通データから毎回見つける。状態だけ運営のメモとして持つ） ---------- */

export type ReviewState = { id: string; state: ReviewItem['state']; memo?: string; doneBy?: string };

export function reviewItems(c: Ctx, states: Map<string, ReviewState>): ReviewItem[] {
  const out: ReviewItem[] = [];
  const add = (x: Omit<ReviewItem, 'state'>) => { const s = states.get(x.id); out.push({ ...x, state: s?.state ?? '未対応', memo: s?.memo, doneBy: s?.doneBy }); };
  const at = (s: string) => `${md(s)}${s.slice(10)}`;
  /* トラブル報告（未解決）：配送ごと */
  const byDl = new Map<string, Trouble[]>();
  for (const t of c.troubles.filter((x) => !x.resolution)) byDl.set(t.deliveryId, [...(byDl.get(t.deliveryId) ?? []), t]);
  for (const [id, ts] of byDl) {
    const d = c.byId.get(id);
    if (!d) continue;
    add({ id: `RV-TR-${id}`, tone: 'negative', kind: 'トラブル報告（未解決）', what: ts.map((t) => `${TROUBLE_TYPE[t.typeId]}：${t.note}`).join('／'), target: id, site: siteOf(c, d), dlv: mdW(d.deliverOn),
      found: at(ts[0].reportedAt), last: at(ts[ts.length - 1].reportedAt), link: 'DeliveryTrouble' });
  }
  for (const d of c.deliveries) {
    /* 子の確定待ち */
    if (d.parentId && d.status === '確認中') add({ id: `RV-CH-${d.id}`, tone: 'warning', kind: '子の確定待ち', what: `${d.internalMemo.split('\n')[0] || '子の配送'}。日付・数量が未確定`, target: d.id, site: siteOf(c, d), dlv: `（仮）${mdW(d.deliverOn)}`, found: '—', last: '—', link: 'DeliveryChild' });
    /* 欠配：お届け日を過ぎても完了していない */
    if (d.deliverOn < c.today && ['出荷待', '出荷済', '受取済'].includes(d.status)) add({ id: `RV-MS-${d.id}`, tone: 'negative', kind: '欠配', what: `お届け日 ${md(d.deliverOn)} を過ぎても完了していません（${stLabel(d.status)}）`, target: d.id, site: siteOf(c, d), dlv: mdW(d.deliverOn), found: `${md(addDays(d.deliverOn, 1))} 06:00`, last: `${md(c.today)} 06:00`, link: 'DeliveryDetail' });
    /* ドライバー未設定：お届け日の3日前から */
    const ua = unassigned(c, d);
    if (ua.length && d.deliverOn >= c.today && d.deliverOn <= addDays(c.today, 3)) {
      const eve = d.deliverOn <= addDays(c.today, 1);
      add({ id: `RV-DR-${d.id}`, tone: 'warning', kind: 'ドライバー未設定', what: `納品日の${eve ? '前日' : '3日前'}になっても、割り当てる区間（${ua.map((l) => `${l.legNo}次・${carrierShort(c, l)}`).join('・')}）に担当者がいません`,
        target: d.id, site: siteOf(c, d), dlv: mdW(d.deliverOn), found: `${md(addDays(d.deliverOn, -3))} 00:00`, last: `${md(c.today)} 00:00`, link: 'DeliveryDetail' });
    }
  }
  /* 変更申請：締切3日前を過ぎても未処理／別の日のご提案の返事待ち */
  for (const x of c.crs) {
    const d = c.byId.get(x.deliveryId), cy = d && c.cycles.find((y) => y.id === d.cycleMonth);
    if (!d || !cy) continue;
    if (x.status === '申請中' && c.today >= addDays(cy.orderCloseOn, -3)) add({ id: `RV-CR-${x.id}`, tone: 'warning', kind: '変更申請の期限到来', what: `オーダー締切（${mdShort(cy.orderCloseOn)}）が近い・過ぎても未処理。自動で却下しないため処理するまで残ります`, target: x.id, site: siteOf(c, d), dlv: mdW(d.deliverOn), found: `${md(addDays(cy.orderCloseOn, -3))} 03:00`, last: `${md(c.today)} 03:00`, link: 'DeliveryDetail' });
    if (x.status === '別の日のご提案') add({ id: `RV-PR-${x.id}`, tone: 'info', kind: 'オーバーライドの失効・提案中', what: `${md(x.proposedDate)} をご提案中（法人の返事待ち）`, target: x.id, site: siteOf(c, d), dlv: mdW(d.deliverOn), found: at(x.decidedAt || x.requestedAt), last: at(x.decidedAt || x.requestedAt), link: 'DeliveryDetail' });
  }
  return out.sort((a, b) => b.found.localeCompare(a.found));
}

/* ---------- 出荷指示（THOMAS）：配送から毎回作る。送信の記録だけ運営が持つ ---------- */

export function shipOrders(c: Ctx, sent: Map<string, string>): ShipOrder[] {
  const rows = c.deliveries.filter((d) => soTarget(c, d)).map((d): ShipOrder & { ship: string } => {
    const id = d.id.replace(/^DL-/, 'SO-');
    const at = sent.get(id) ?? (d.shipOn < c.today ? `${md(addDays(d.shipOn, -3))} 16:00` : '');
    return {
      id, ship: d.shipOn, at: at || '未送信', target: d.id, targetIsDl: true, sub: `${siteOf(c, d)} ・ ${d.temp} ${d.plannedQty}食 ・ 出荷 ${md(d.shipOn)} → 納品 ${md(d.deliverOn)}`,
      wh: `${whName(c, d.warehouseId)}（${c.warehouses.get(d.warehouseId)?.thomasCode}）`, count: '1', ver: 'rev1',
      kind: !active(d) ? '取消（数量0）' : d.parentId ? '新規（子）' : '新規', st: at ? '送信済' : '再送待ち', csv: 'thomas_sent',
    };
  });
  /* 未送信を出荷日の近い順に上、送信済みは新しい順 */
  return [...rows.filter((x) => x.st !== '送信済').sort((a, b) => a.ship.localeCompare(b.ship)), ...rows.filter((x) => x.st === '送信済').sort((a, b) => b.ship.localeCompare(a.ship))]
    .map(({ ship: _s, ...x }) => x);
}

/**
 * 出荷指示 CSV（THOMAS）：これから出荷する便（出荷指示の対象・今日以降の出荷）の明細の行。列の順序は THOMAS から届くまで暫定。
 * 同梱資材・出荷時の特殊指示は商品マスタの値を出す（2026/10/03 回答：出荷指示 CSV に出す・資材の在庫は引かない）
 */
export const THOMAS_HEAD = ['出荷指示No', '倉庫コード', '支店コード', 'ピッキング日', '納品日', '配送No', '納品先名', '住所', '電話番号', '温度帯', '便種別', '運び手（最終区間）', '配送会社コード（1次）', '商品コード', '数量', '受取時間帯', '納品条件', '取消フラグ', '同梱資材', '出荷時の特殊指示'];
export function thomasCsv(c: Ctx): { file: string; head: string[]; rows: string[][] } {
  const ds = c.deliveries.filter((d) => soTarget(c, d) && d.shipOn >= c.today).sort((a, b) => a.shipOn.localeCompare(b.shipOn) || a.id.localeCompare(b.id));
  const rows = ds.flatMap((d) => {
    const wh = c.warehouses.get(d.warehouseId), fin = legsOf(c, d.id).find((l) => l.isFinal), first = legsOf(c, d.id)[0];
    const by = fin?.regime === 'parcel_carrier' ? `運送会社（${c.carriers.get(fin.carrierId)?.name ?? fin.carrierId}）` : fin?.regime === 'partner_driver' ? `委託（${c.carriers.get(fin.carrierId)?.name ?? fin.carrierId}）` : '自社';
    const addr = `${d.destination.address.pref}${d.destination.address.city}${d.destination.address.addr1}${d.destination.address.addr2 ? ' ' + d.destination.address.addr2 : ''}`;
    const win = d.destination.windows.map((w) => `${w.from}-${w.to}`).join('・');
    return c.lines.filter((l) => l.deliveryId === d.id).map((l) => {
      const p = c.products.get(l.productId);
      const mats = (p?.bundledMaterialIds ?? []).map((id) => c.materials.get(id)?.name ?? id).join('・');
      return [`${d.id.replace(/^DL-/, 'SO-')}/rev${d.shipRev ?? 1}`, d.warehouseId, wh?.branchCode ?? '', iso(d.shipOn), iso(d.deliverOn), d.id, d.destination.name, addr, d.destination.tel,
        d.temp, d.serviceForm, by, first?.carrierId ?? '', l.productId, String(active(d) ? l.plannedQty : 0), win, d.destination.note, active(d) ? '0' : '1', mats, (p?.shipInstructions ?? []).join('・')];
    });
  });
  return { file: `thomas_shiporder_${c.today.replace(/\//g, '')}.csv`, head: THOMAS_HEAD, rows };
}

/** ES で採番する送り状（1次が委託の引き取り・自社の便。出荷指示を送ったもの・直近2週間） */
export function esInvoices(c: Ctx): EsInvoice[] {
  return c.deliveries.filter((d) => soTarget(c, d) && active(d) && d.shipOn < c.today && d.shipOn >= addDays(c.today, -14) && legsOf(c, d.id)[0]?.regime !== 'parcel_carrier')
    .map((d) => ({ no: `${d.id}-01`, box: '1 / 1', made: `${md(addDays(d.shipOn, -3))} 出荷指示の送信`, st: '有効', tone: 'success', cls: '' }));
}

/* ---------- 配送サイクル設定（サイクル暦・祝日は共通データ） ---------- */

/** 出荷不可の画面の倉庫のタブ → 共通データの倉庫（課題 4-10：出荷禁止日は倉庫ごと） */
export const NG_TABS: Record<string, string> = { wh1: 'WH00001', wh2: 'WH00002' };

/** 設定状況の帯（配送_02 §4-2・REQ-DL-718）。上段＝サイクルの設定、下段＝メニューの公開 */
export function cycleBand(c: Ctx): CycleBand {
  const ids = c.cycles.map((x) => x.id), have = new Set(ids);
  const first = ids[0] ?? c.today.slice(0, 7).replace('/', '-'), last = ids[ids.length - 1] ?? first;
  const months: CycleBand['months'] = [];
  for (let ym = first; ym <= addYm(last, 6); ym = addYm(ym, 1)) {
    const reason = have.has(ym) ? cycleLockReason(c.r, ym, c.today) : '';
    const m = c.r.get<MonthlyMenu>('dm.order.menus', ym);
    months.push({
      ym, reason,
      cycle: !have.has(ym) ? (ym < last ? 'hole' : 'future') : reason ? 'locked' : 'set',
      menu: !m ? '未公開' : m.status === '編集中' ? '公開準備中' : m.status === '公開中' ? '公開済' : '運用中',
    });
  }
  const locked = months.filter((x) => x.cycle === 'locked'), now = c.today.slice(0, 7).replace('/', '-');
  const [ly, lm] = last.split('-').map(Number), [ny, nm] = now.split('-').map(Number);
  return {
    months, lastSet: last, remain: Math.max(0, (ly - ny) * 12 + lm - nm), lockedTo: locked[locked.length - 1]?.ym ?? '',
    editableFrom: months.find((x) => x.cycle === 'set')?.ym ?? '', holes: months.filter((x) => x.cycle === 'hole').map((x) => x.ym),
  };
}

export function cycleSettings(c: Ctx): CycleSettings {
  const f = c.cycles[0], l = c.cycles[c.cycles.length - 1];
  const ngByWarehouse = [...c.cycles].reverse().find((x) => x.ngSlots && Object.keys(x.ngSlots).length)?.ngSlots ?? {};
  /* 出荷しない日（お届けはする・ピッキングしない日）：全倉庫の日は両方のタブ、倉庫だけの日はその倉庫のタブ */
  const ng = (wh: string) => c.holidays.filter((h) => !isPauseHoliday(h) && !h.noDelivery && h.noPicking && (!h.warehouseIds?.length || h.warehouseIds.includes(wh))).map((h) => ({ id: h.id, d: iso(h.date), why: h.name }));
  return {
    /* 参照のみ＝当月・メニュー公開済み・オーダー期間が始まった月・配送データを作った月（A1 を変えられない・課題 4-10・2026/10/03） */
    periodFrom: f?.id ?? '', periodTo: l?.id ?? '', a1: f ? iso(f.a1) : '', readOnly: c.cycles.filter((x) => cycleLockReason(c.r, x.id, c.today)).map((x) => x.id),
    lockReasons: Object.fromEntries(c.cycles.map((x) => [x.id, cycleLockReason(c.r, x.id, c.today)]).filter(([, w]) => w)),
    band: cycleBand(c),
    a1s: Object.fromEntries(c.cycles.map((x) => [x.id, iso(x.a1)])),
    holidays: c.holidays.filter((h) => h.noDelivery && !isPauseHoliday(h)).map((h) => ({ id: h.id, n: h.name, d: iso(h.date), s: h.noPicking, v: true })),
    /* サイクル休止は運営の設定として保存したもの（なければ空）。倉庫ごとの出荷不可枠の持ち主は暦（Cycle.ngSlots）だけ（なければ標準の枠） */
    pauses: c.r.get<{ id: string; items: CycleSettings['pauses'] }>('delivery.cycleConfig', 'pauses')?.items ?? [],
    ngSlots: Object.fromEntries(Object.entries(NG_TABS).map(([k, wh]) => [k, [...(ngByWarehouse[wh] ?? NO_PICKING_SLOTS)]])),
    ngDates: Object.fromEntries(Object.entries(NG_TABS).map(([k, wh]) => [k, ng(wh)])),
  };
}

/** 画面の設定 → 共通データの祝日（祝日・臨休＋出荷不可日。日付ごとに1つ。出荷不可日が片方の倉庫のタブだけなら、その倉庫だけの日） */
/** サイクル休止の日として自動で作った祝日（画面の祝日・出荷しない日には出さない） */
const PAUSE_ID = 'PAUSE-';
const isPauseHoliday = (h: DHoliday) => h.id.startsWith(PAUSE_ID);

export function holidaysFrom(st: CycleSettings): DHoliday[] {
  const m = new Map<string, DHoliday>();
  for (const h of st.holidays) m.set(h.d, { id: h.d.replace(/-/g, ''), date: slash(h.d), name: h.n, noDelivery: h.v, noPicking: h.s });
  const tabs = Object.keys(NG_TABS);
  const dates = [...new Set(tabs.flatMap((k) => (st.ngDates[k] ?? []).map((x) => x.d)))];
  for (const d of dates) {
    const on = tabs.filter((k) => (st.ngDates[k] ?? []).some((x) => x.d === d));
    const why = tabs.map((k) => (st.ngDates[k] ?? []).find((x) => x.d === d)?.why).find(Boolean) ?? '出荷不可日';
    const h = m.get(d);
    if (h) { m.set(d, { ...h, noPicking: true }); continue; }
    const whs = on.length === tabs.length ? undefined : on.map((k) => NG_TABS[k]);
    m.set(d, { id: d.replace(/-/g, ''), date: slash(d), name: why, noDelivery: false, noPicking: true, ...(whs ? { warehouseIds: whs } : {}) });
  }
  /* サイクル休止：休止のあいだ（7日にそろえる調整日を含む）はお届けしない。出荷も止めるのは p.ship のとき（配送_02 §4-5）。
     保存した休止が暦に効くように、日ごとの祝日（PAUSE-…）として共通データへ渡す */
  for (const p of st.pauses) {
    const sp = pauseSpan(p);
    for (let d = sp.start; d <= sp.end; d = addDaysIso(d, 1)) {
      const h = m.get(d);
      if (h) m.set(d, { ...h, noDelivery: true, noPicking: h.noPicking || p.ship });
      else m.set(d, { id: PAUSE_ID + d.replace(/-/g, ''), date: slash(d), name: p.name || 'サイクル休止', noDelivery: true, noPicking: p.ship });
    }
  }
  return [...m.values()].sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * 配送サイクル設定を保存したときの影響（保存の確認のダイアログ）。共通データの配送（予定・出荷待）のうち、
 * 新しい祝日・出荷不可日でお届けできない日／出荷できない日になる便を数える。保存しても配送の日付は自動では動かない
 * （スケジュールの「日付を変える」で動かす・課題 2-4）。出荷指示を送った便は再送（rev+1）が要る
 */
export function cycleImpact(c: Ctx, st: CycleSettings) {
  const next = holidaysFrom(st);
  const key = (h: DHoliday) => `${h.date}|${h.noDelivery}|${h.noPicking}|${(h.warehouseIds ?? []).join(',')}`;
  const before = new Set(c.holidays.map(key)), after = new Set(next.map(key));
  const added = next.filter((h) => !before.has(key(h))), removed = c.holidays.filter((h) => !after.has(key(h)));
  const a1Changed = Object.entries(st.a1s ?? {}).filter(([ym, v]) => c.cycles.find((x) => x.id === ym) && iso(c.cycles.find((x) => x.id === ym)!.a1) !== v).map(([ym]) => ym);
  const open = c.deliveries.filter((d) => !d.parentId && d.temp !== '資材' && ['予定', '出荷待'].includes(d.status) && d.deliverOn >= c.today);
  const rows = open.map((d) => {
    const noDeliver = !canDeliver(c.cycles, next, d.deliverOn) && canDeliver(c.cycles, c.holidays, d.deliverOn);
    const noShip = !canPick(c.cycles, next, d.shipOn, d.warehouseId) && canPick(c.cycles, c.holidays, d.shipOn, d.warehouseId);
    return { d, noDeliver, noShip };
  }).filter((x) => x.noDeliver || x.noShip);
  const ids = new Set(rows.map((x) => x.d.id));
  return {
    added: added.map((h) => ({ date: iso(h.date), name: h.name, kind: h.noDelivery ? (h.noPicking ? 'お届け・出荷なし' : 'お届けなし') : `出荷なし${h.warehouseIds?.length ? `（${h.warehouseIds.map((w) => c.warehouses.get(w)?.name ?? w).join('・')}）` : ''}` })),
    removed: removed.map((h) => ({ date: iso(h.date), name: h.name })),
    a1Changed,
    deliveries: rows.length,
    noDeliver: rows.filter((x) => x.noDeliver).length,
    noShip: rows.filter((x) => x.noShip).length,
    sent: rows.filter((x) => instructionSent(c.r, x.d, c.today)).length,
    requests: c.crs.filter((x) => x.status === '申請中' && ids.has(x.deliveryId)).length,
    carriers: new Set(rows.flatMap((x) => legsOf(c, x.d.id).filter((l) => l.regime === 'partner_driver').map((l) => l.carrierId))).size,
    sample: rows.slice(0, 5).map((x) => `${x.d.id}（${siteOf(c, x.d)}・${iso(x.d.deliverOn)}${x.noDeliver ? '・お届けできない日' : '・出荷できない日'}）`),
  };
}

/* ---------- 配送問い合わせ（委託配送先・中継先は共通データのマスタ） ---------- */

export function consignees(c: Ctx): Consignee[] {
  return [...c.carriers.values()].filter((x) => x.kind !== '自社').map((x) => ({
    id: x.id, name: x.name, kind: x.kind === '路線' ? '路線（中継あり）' : x.kind, area: x.areas.join('・'), days: x.weekdays,
    fee: x.kind === '路線' ? '運賃表（送り状ごと）' : x.areaFees?.length ? `エリア別（${areaFeesText(x)}）` : `1件 ${x.feePerDelivery.toLocaleString()}円`, status: x.status === '有効' ? '本登録' : '無効',
    cars: c.r.get<{ cars?: string[] }>('carrier.profiles', x.id)?.cars ?? [],
  }));
}
export const hubs = (c: Ctx): Hub[] =>
  [...c.warehouses.values()].filter((w) => w.type === 'relay').map((w) => ({ id: w.id, name: w.name, kind: '中継倉庫', addr: addrText(w.address), status: w.status }));

/** 中継先を通る拠点と、その直近の配送（今日までの最後。なければ次の配送） */
export function inquiries(c: Ctx): Inquiry[] {
  const groups = new Map<string, Delivery[]>();
  for (const l of c.legs.filter((x) => x.from.type === 'relay')) {
    const d = c.byId.get(l.deliveryId);
    if (!d || !active(d)) continue;
    const k = `${l.from.id}|${d.branchId}`;
    groups.set(k, [...(groups.get(k) ?? []), d]);
  }
  return [...groups.entries()].map(([k, ds]) => {
    const hu = k.split('|')[0];
    const sorted = ds.sort((a, b) => a.deliverOn.localeCompare(b.deliverOn));
    const d = sorted.filter((x) => x.deliverOn <= c.today).pop() ?? sorted[0];
    const leg2 = legsOf(c, d.id).find((l) => l.from.id === hu)!;
    const b = c.branches.get(d.branchId), mc = mainContact(c, d.branchId);
    const tr = openTroubles(c, d.id).length, ua = unassigned(c, d).length;
    return {
      hu, site: d.branchId, name: siteOf(c, d), addr: addrText(b?.address ?? d.destination.address),
      method: `${d.serviceForm}（${c.carriers.get(c.warehouses.get(hu)?.carrierId ?? '')?.kind === '路線' ? '営業所止め' : '委託の中継'}）`,
      c2: `${carrierName(c, leg2.carrierId)}（${leg2.regime === 'self' ? '自社' : '委託'}）`, dl: d.id, date: isoW(d.deliverOn),
      st: stLabel(d.status) + (tr ? `（トラブル未解決 ${tr}件）` : ua ? '（2次の担当者が未設定）' : ''),
      inv: c.tracking.filter((t) => t.deliveryId === d.id && t.status === 'active').map((t) => t.trackingNo),
      pic: mc ? `${mc.name} ・ ${mc.tel}` : d.destination.tel,
    };
  });
}

/* ---------- 資材の集計（資材の注文＝資材便） ---------- */

export function matShipments(c: Ctx): MatShipment[] {
  const fee = c.r.get<Option>('dm.master.options', MAT_EXTRA_OPTION);
  return c.mos.filter((m) => m.status !== '取消').flatMap((m) => {
    const d = c.byId.get(m.deliveryId);
    if (!d) return [];
    return [{
      dl: d.id, site: `${d.branchId} ${siteOf(c, d)}`, date: iso(d.shipOn), deliv: slashW(d.deliverOn),
      kind: m.kind === 'initial_set' ? '資材の初期セット（新規の申込・無料）' : m.paid ? '通常の資材注文（このサイクルの2回目以降）' : '通常の資材注文（料金に含む）',
      lines: m.lines.map((l): [{ id: string; name: string }, number] => [{ id: l.materialId, name: c.materials.get(l.materialId)?.name ?? l.materialId }, l.qty]),
      fee: m.paid && fee ? `${fee.id} ${fee.name} ${yen(fee.amountYen)}` : '',
    }];
  }).sort((a, b) => a.date.localeCompare(b.date) || a.dl.localeCompare(b.dl));
}

/** 運営の画面の「冷凍」「冷蔵・常温」「資材」→ 見積の温度帯 */
export const quoteTemp = (t: string): Delivery['temp'] => (t === '冷凍' ? '冷凍' : t === '資材' ? '資材' : '冷蔵');
