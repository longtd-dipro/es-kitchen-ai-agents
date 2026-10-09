import type { DocRepo } from '@/lib/ops/core/area';
import { addDays, nowStamp, parseDate, today } from '@/lib/supplier/dates';
import { ADJ, nextId as nextAdjId } from './adjust';
import { cycleMonthAt, MAT_EXTRA_OPTION, optionRate } from './charges';
import { DEFAULT_MATERIAL_LEAD_DAYS, materialLeadDays } from './materialLead';
import type { BillAdjustment, Branch, ChildContract, Contract, Delivery, Holiday, Invoice, MaterialOrder, Option } from './types';

/*
 * 資材注文の決まり（台帳 H「資材の注文」・E・受付簿 #260〜#262・#277）。
 *   リードタイム＝契約の配送区分（資材）のリードタイム（子契約の配送の流れ channels の temp＝資材の leadDays）。入っていなければ 2日（仮・初期値）
 *   「何回目」＝納品予定日のサイクル月で数える（取消は数えない・取り消したら次が繰り上がる）。お試しの拠点には OP000036 を付けない
 *   請求済みの月にかかる変更（2回目の有料が付く・外れる）は調整明細にする（請求書に載せ直す）
 */
const MO = 'dm.delivery.materialOrders';
/** 契約の配送区分（資材）のリードタイムが入っていないときの日数（受付簿 #262：いまは2日で仮） */
export const MAT_LEAD_DEFAULT = DEFAULT_MATERIAL_LEAD_DAYS;

/** その拠点の、そのサイクル月の子契約（なければ最新の子契約） */
function childOf(r: DocRepo, branchId: string, cyc: string): ChildContract | undefined {
  const ccs = r.list<ChildContract>('dm.org.childContracts').filter((x) => x.branchId === branchId && !x.canceled);
  return ccs.find((x) => x.cycleMonth === cyc) ?? ccs.sort((a, b) => b.cycleMonth.localeCompare(a.cycleMonth))[0];
}
/** リードタイム（出荷から納品までの日数）。day＝注文日（そのサイクルの子契約の値。範囲 0〜7日：配送_05）。そのサイクルの子契約に配送区分（資材）がなければ、いちばん新しい月の値（materialLeadDays）、それもなければ 2日 */
export function matLeadDays(r: DocRepo, branchId: string, day: string = today()): number {
  const ch = childOf(r, branchId, cycleMonthAt(r, day))?.channels.find((c) => c.temp === '資材');
  return typeof ch?.leadDays === 'number' && ch.leadDays >= 0 ? Math.min(7, ch.leadDays) : materialLeadDays(r, branchId);
}
/** お試しの拠点か（そのサイクル月の子契約が お試しキャンペーン） */
export const isTrialCycle = (r: DocRepo, branchId: string, cyc: string) => childOf(r, branchId, cyc)?.kind === 'お試しキャンペーン';

const isOff = (r: DocRepo, d: string) => parseDate(d).getDay() === 0 || r.list<Holiday>('dm.delivery.holidays').some((h) => h.date === d && h.noDelivery);
/** 納品予定日の初期値：注文日の翌日以降で、リードタイムを守れる最初の納品可能日（日曜・お届けしない祝日を除く） */
export function matNextDue(r: DocRepo, branchId: string, from: string = today()): string {
  let d = addDays(from, Math.max(1, matLeadDays(r, branchId, from)));
  while (isOff(r, d)) d = addDays(d, 1);
  return d;
}
const dayDiff = (a: string, b: string) => Math.round((parseDate(a).getTime() - parseDate(b).getTime()) / 86400000);
/** 納品予定日の警告（休日マスタ・拠点の納品不可曜日・リードタイム未満）。なければ []（止めない：台帳 L「配送の日付の移動」と同じ・W119） */
export function matDueWarn(r: DocRepo, branchId: string, due: string, orderedOn: string): string[] {
  const out: string[] = [];
  const hol = r.list<Holiday>('dm.delivery.holidays').some((h) => h.date === due && h.noDelivery);
  if (hol) out.push('休日');
  const ng = r.get<Branch>('dm.org.branches', branchId)?.deliveryCond?.ngDays ?? [];
  /* 日曜は資材便もお届けしない（納品予定日の初期値も日曜を除く）ので、納品不可曜日に入っていなくても警告する */
  if (parseDate(due).getDay() === 0 || ng.includes('日月火水木金土'[parseDate(due).getDay()]) || (ng.includes('祝日') && hol)) out.push('お届けできない曜日');
  if (dayDiff(due, orderedOn) < matLeadDays(r, branchId, orderedOn)) out.push('リードタイム未満');
  return out;
}

/** 同じ拠点の通常注文（取消を除く）を 納品予定日のサイクル月ごとに、注文の古い順で並べる */
function groups(r: DocRepo, branchId: string) {
  const out = new Map<string, MaterialOrder[]>();
  r.list<MaterialOrder>(MO).filter((m) => m.branchId === branchId && m.kind === 'regular' && m.status !== '取消')
    .sort((a, b) => a.orderedAt.localeCompare(b.orderedAt) || a.id.localeCompare(b.id))
    .forEach((m) => { const k = cycleMonthAt(r, m.dueOn); out.set(k, [...(out.get(k) ?? []), m]); });
  return out;
}
/** 「何回目」（納品予定日のサイクル月で数える）。初期セット・取消は 0。このサイクル月の注文が増えると 後ろの注文が繰り下がる */
export function matOrdinal(r: DocRepo, m: MaterialOrder): number {
  if (m.kind !== 'regular' || m.status === '取消') return 0;
  return (groups(r, m.branchId).get(cycleMonthAt(r, m.dueOn)) ?? []).findIndex((x) => x.id === m.id) + 1;
}
/** これから登録する注文（納品予定日 due）の「何回目」＝ そのサイクル月の注文の数 ＋ 1。exceptId＝直す注文（自分は数えない） */
export function matNextOrdinal(r: DocRepo, branchId: string, due: string, exceptId = ''): number {
  return (groups(r, branchId).get(cycleMonthAt(r, due)) ?? []).filter((x) => x.id !== exceptId).length + 1;
}

/** 出荷指示に拾い上げられた（資材注文の状態、または資材便の配送が出荷待のままでない）。数・納品予定日を直す・取り消すことはできない */
export function matLocked(r: DocRepo, m: MaterialOrder): boolean {
  const d = r.get<Delivery>('dm.delivery.deliveries', m.deliveryId);
  return m.status !== '出荷待' || (!!d && !['予定', '出荷待'].includes(d.status));
}

/** 同時更新の版（E31）：注文と配送の状態・日付・数・発送日・送り状番号。ほかの人の保存や出荷指示の拾い上げで変わる */
export function matVer(r: DocRepo, m: MaterialOrder): string {
  const d = r.get<Delivery>('dm.delivery.deliveries', m.deliveryId);
  return [m.status, m.dueOn, m.shippedOn ?? '', m.trackingNo ?? '', m.lines.map((l) => `${l.materialId}:${l.qty}`).join(','), d?.status ?? '', d?.shipRev ?? '', (d?.internalMemo ?? '').length].join('|');
}

/** その日に注文した分を載せた（載せる）請求書。実績精算の期間（前月21日〜当月20日）に注文の日が入る請求書で、この拠点の行があるもの */
function invoiceOf(r: DocRepo, branchId: string, day: string) {
  return r.list<Invoice>('dm.billing.invoices').find((i) => {
    if (i.status === '取消' || !i.lines.some((l) => l.branchId === branchId)) return false;
    const [from, to] = i.actualPeriod.split('〜');
    return !!to && from <= day && day <= to;
  });
}
/** 請求済みの月の資材の追加配送（OP000036）の増減を調整明細にする（sign＝+1 付く／−1 外れる・取り消した）。次の請求書に載る */
function adjustBilled(r: DocRepo, m: MaterialOrder, sign: 1 | -1, by: string) {
  const day = m.orderedAt.slice(0, 10), inv = invoiceOf(r, m.branchId, day), op = r.get<Option>('dm.master.options', MAT_EXTRA_OPTION);
  const ct = r.list<Contract>('dm.org.contracts').find((c) => c.branchId === m.branchId);
  if (!inv || !op || !ct || !(op.amountYen > 0)) return;
  const id = nextAdjId(r), amt = sign * op.amountYen;
  r.put<BillAdjustment>(ADJ, id, {
    id, branchId: m.branchId, contractId: ct.id, childContractId: '', cycleMonth: '', kind: '資材の追加配送', applicationId: '',
    reason: sign > 0 ? `資材注文 ${m.id} が同じサイクル月の2回目以降になった` : `資材注文 ${m.id} が2回目以降でなくなった（前の注文の取消など）`,
    lines: [{ name: `${op.name}（${m.id}）${sign > 0 ? '' : ' 取消分'}`, amountYen: amt, taxRate: optionRate(r, op) }],
    billedYen: sign > 0 ? 0 : op.amountYen, afterYen: sign > 0 ? op.amountYen : 0, fromInvoiceId: inv.id, invoiceId: '', at: nowStamp(), by,
  });
}
const MEMO_RE = /このサイクル2回目の資材注文（[^）]*）(／)?/;
/**
 * 拠点の資材注文の「2回目以降＝有料」を付け直す（登録・納品予定日の変更・取消のあとに呼ぶ）。
 * 納品予定日のサイクル月ごとに古い順で数え、2回目以降は有料（お試しの拠点は付けない：受付簿 #277）。変わった注文の資材便のメモも直す。
 * 請求済みの月の分は調整明細にする。cancelled＝いま取り消した注文（有料だった分を請求済みなら戻す）
 */
export function recountMat(r: DocRepo, branchId: string, by: string, cancelled?: MaterialOrder) {
  const op = r.get<Option>('dm.master.options', MAT_EXTRA_OPTION);
  const fee = `このサイクル2回目の資材注文（${MAT_EXTRA_OPTION} ${(op?.amountYen ?? 0).toLocaleString('ja-JP')}円）`;
  if (cancelled?.paid) adjustBilled(r, cancelled, -1, by);
  for (const [cyc, list] of groups(r, branchId)) {
    const trial = isTrialCycle(r, branchId, cyc);
    list.forEach((m, i) => {
      const paid = i >= 1 && !trial;
      if (paid === m.paid) return;
      r.put<MaterialOrder>(MO, m.id, { ...m, paid });
      adjustBilled(r, m, paid ? 1 : -1, by);
      const d = r.get<Delivery>('dm.delivery.deliveries', m.deliveryId);
      if (d) {
        const rest = d.internalMemo.replace(MEMO_RE, '');
        r.put('dm.delivery.deliveries', d.id, { ...d, internalMemo: paid ? fee + (rest && !rest.startsWith('\n') ? '／' : '') + rest : rest.replace(/^[／\n]+/, '') });
      }
    });
  }
}
