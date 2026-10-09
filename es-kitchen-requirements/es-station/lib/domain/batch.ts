import { ApiError } from '@/lib/api/errors';
import type { DocRepo } from '@/lib/ops/core/area';
import { addDays, demoToday, nowStamp, setDemoToday, today } from '@/lib/supplier/dates';
import menuArea from './areas/menu';
import surveyArea from './areas/survey';
import { refreshDefaultOrders } from './areas/order';
import { altLateTrips } from './alt';
import { cycleAt, dailyTick, ensureDeliveries, journaled, refreshOrders, rollback, type Journal } from './lifecycle';
import orgArea from './areas/org';
import { isAnnual } from './adjust';
import { addYm } from './menu';
import { listMenus } from './menu';
import { notify, notifyOnce } from './notify';
import { customerNotices } from './customerNotices';
import { honSchedule } from './stock';
import type { Branch, ChildContract, Contact, Contract, Cycle, Delivery, MonthlyMenu, Pause, ProductOrder, Role } from './types';
import { can } from '@/lib/ops/permissions';

/*
 * 日次バッチ（2026/10/03 決定：画面は作らない・裏で1日1回動かす）。batch.daily({ date }) が1日ぶんの処理を決まった順に動かす。
 * 同じ日を2回動かしても何もしない（実行の記録 dm.batch.runs があれば飛ばす。各処理も状態を見て1回だけ）。
 *   1. menuTick     月間メニューの自動公開・路線便の「本日届きます」（9:00 の予約を出す）＝menu.tick
 *   2. orderOpen    メニューが公開中で受付期間に入ったサイクルを「受付中」に
 *   3. orderClose   オーダー締切（月間メニューの orderTo）の翌日：メニュー・サイクルを締切済、デフォルト（お試し（自動））の注文を基準注文数で確定、
 *                   そのサイクルの配送（予定）を出荷待・変更不可に
 *   4. menuStatus   締切済のメニューをサイクルの A1 から配送中に
 *   5. applyTick    休止の開始・終わり、解約日の終了・閉鎖、入金期限のあとのアカウント停止＝apply.tick
 *   6. surveyTick   アンケートの回答開始のお知らせ・リマインド＝survey.tick（9:00）
 *   7. honReminder  本発注の時期の始まり・最終日に運営へ通知（月2回・課題 2-4）
 *   8. confirmAlert 20日締めのあと 21日から、請求の確定（実績精算・前払い）が済むまで運営の TOP にアラート（中身は運営の billing.confirmAlert が数える。ここは記録だけ）
 *   9. altLate      仕入先が答えた入荷予定日が便に間に合わない追加発注（運営の TOP にアラート・stock.alerts の altLate。ここは記録だけ・便は動かさない）
 *  10. customerNotice お客様への予定のお知らせ（受付開始・締切7日前と3日前の未入力・前月21日のお届け予定日）とお知らせのメール（重要は 8:00）＝lib/domain/customerNotices.ts。
 *                   お客様の休み（土日・全社の祝日）にあたる日のお知らせは前の営業日に送る（notify.ts の customerSendDay）。メニューの自動公開・路線便の 9:00・アンケートのリマインドも同じ
 * 動かし方：サーバーが日付の変わった最初の API で、前回の日（dm.batch.state の lastRunDate）の翌日〜今日をまとめて動かす（lib/server/daily.ts）。
 *   デモの「今日」を先へ進めたときも、間の日を1日ずつ動かす（setDemoDay）。戻したときは日付だけ変える（動かした処理は元に戻さない）。
 * 1つの処理が失敗したら、その処理の書き換えだけ戻して（lifecycle の journaled）次へ進む（エラーは記録に残す）。
 */

export const BATCH = { state: 'dm.batch.state', runs: 'dm.batch.runs', demo: 'dm.demo.settings' } as const;
/* 足す処理は後ろに足す（前の記録の check のため。childGen は 2026-10-05） */
export const BATCH_STEPS = ['menuTick', 'orderOpen', 'orderClose', 'menuStatus', 'applyTick', 'surveyTick', 'honReminder', 'confirmAlert', 'altLate', 'customerNotice', 'childGen'] as const;
export type BatchStep = (typeof BATCH_STEPS)[number];
/**
 * 本番はスケジューラで時刻どおりに動かす（台帳 E「本番のバッチの動かし方」・受付簿 No.51）：
 *   midnight（0:00）＝日付が変わったときの処理、morning（9:00）＝お客様へのお知らせ（本日届きます・アンケート・メニューの自動公開）。
 *   all＝両方を続けて（デモ・開発：その日の最初のアクセスで実行）
 */
export type BatchPhase = 'all' | 'midnight' | 'morning';
export const STEP_PHASE: Record<BatchStep, Exclude<BatchPhase, 'all'>> = {
  menuTick: 'morning', orderOpen: 'midnight', orderClose: 'midnight', menuStatus: 'midnight', applyTick: 'midnight', childGen: 'midnight',
  surveyTick: 'morning', honReminder: 'midnight', confirmAlert: 'midnight', altLate: 'midnight', customerNotice: 'morning',
};
/** スケジューラで動かす（本番）。このときは API の最初のアクセスでの追いかけ実行をしない（lib/server/daily.ts） */
export const SCHEDULED = process.env.BATCH_SCHEDULER === '1';
/** 日次バッチの状態（id＝state）。lastRunDate＝最後に動かした日、sent＝1回だけ出す通知のキー */
export type BatchState = { id: 'state'; lastRunDate: string; sent: string[]; updatedAt: string };
/** 1日ぶんの実行の記録（id＝日付）。trigger＝auto（サーバーが日付の変わり目に）／demo（デモの「今日」を進めた）／manual */
export type BatchRun = { id: string; at: string; trigger: 'auto' | 'demo' | 'manual' | 'scheduler'; phase?: BatchPhase; steps: { step: BatchStep; ok: boolean; result: unknown; error?: string }[] };
/** デモの「今日」（id＝today）。DEMO 帯で選んだ日 */
export type DemoSetting = { id: 'today'; today: string; prev: string; setAt: string };

const isDate = (s: unknown): s is string => typeof s === 'string' && /^\d{4}\/\d{2}\/\d{2}$/.test(s);
/** 先に進める日の上限（デモで大きく飛ばしたときの重さを抑える） */
const MAX_DAYS = 400;

export const batchState = (r: DocRepo) => r.get<BatchState>(BATCH.state, 'state');
const putState = (r: DocRepo, s: Omit<BatchState, 'id' | 'updatedAt'>) => r.put<BatchState>(BATCH.state, 'state', { id: 'state', ...s, updatedAt: nowStamp() });

/** その日のあいだだけ「今日」を day にする（通知の番号・日時、配送の状態などが day で決まる） */
function withToday<T>(day: string, fn: () => T): T {
  const prev = demoToday();
  setDemoToday(day);
  try { return fn(); } finally { setDemoToday(prev); }
}

/* ---------------- 各処理 ---------------- */

/** 受付期間に入ったサイクル（受付前）を受付中に */
function orderOpen(r: DocRepo, day: string) {
  const opened: string[] = [];
  for (const c of r.list<Cycle>('dm.delivery.cycles')) {
    if (c.orderState !== '受付前') continue;
    const m = r.get<MonthlyMenu>('dm.order.menus', c.id);
    if (!m || m.status !== '公開中' || day < m.orderFrom || day > m.orderTo) continue;
    r.put<Cycle>('dm.delivery.cycles', c.id, { ...c, orderState: '受付中' });
    opened.push(c.id);
  }
  return { opened };
}

/** オーダー締切（orderTo）を過ぎた公開中のメニュー：締切済・デフォルトの注文を確定・配送を出荷待に */
function orderClose(r: DocRepo, day: string) {
  const out: { menuId: string; defaults: number; deliveries: number }[] = [];
  const unpublished: string[] = [];
  for (const m of listMenus(r)) {
    if (!m.orderTo || day <= m.orderTo) continue;
    if (m.status === '編集中') { unpublished.push(m.id); continue; }
    if (m.status !== '公開中') continue;
    const at = nowStamp();
    /* 注文のない拠点にもデフォルトの注文を作ってから締める（基準注文数） */
    refreshDefaultOrders(r, m.id);
    let defaults = 0;
    for (const o of r.list<ProductOrder>('dm.order.orders').filter((x) => x.cycleMonth === m.id && ['デフォルト', 'お試し（自動）'].includes(x.status))) {
      const total = o.lines.reduce((a, l) => a + l.qty, 0);
      r.put<ProductOrder>('dm.order.orders', o.id, { ...o, log: [{ at, by: 'system', what: 'オーダー締切', detail: `締切（${m.orderTo}）までにご注文がなかったため、基準注文数（${o.status}）のまま確定しました・合計 ${total}個` }, ...o.log] });
      defaultFixedNotice(r, o, m.id, m.orderTo, total);
      defaults++;
    }
    const raw = r.get<MonthlyMenu>('dm.order.menus', m.id)!;
    r.put<MonthlyMenu>('dm.order.menus', m.id, { ...raw, status: '締切済', log: [{ at, by: 'system', what: `オーダー締切（${m.orderTo}）で締切済にしました（日次バッチ）` }, ...(raw.log ?? [])] });
    const c = r.get<Cycle>('dm.delivery.cycles', m.id);
    if (c && c.orderState !== '締切済') r.put<Cycle>('dm.delivery.cycles', c.id, { ...c, orderState: '締切済' });
    let n = 0;
    for (const d of r.list<Delivery>('dm.delivery.deliveries').filter((x) => x.cycleMonth === m.id && x.status === '予定')) {
      r.put<Delivery>('dm.delivery.deliveries', d.id, { ...d, status: '出荷待', changeState: d.changeState === '変更可' ? '変更不可' : d.changeState });
      n++;
    }
    out.push({ menuId: m.id, defaults, deliveries: n });
  }
  return { closed: out, unpublished };
}

/**
 * 自動注文で確定したお知らせ（サイクル・拠点ごとに1回。お試しも：台帳 E 2026-10-05・受付簿 No.50）。
 * 法人Web のお知らせ＝拠点・法人のアカウント、メール＝拠点のメイン担当者だけ
 */
function defaultFixedNotice(r: DocRepo, o: ProductOrder, cycle: string, closeOn: string, total: number) {
  const b = r.get<Branch>('dm.org.branches', o.branchId);
  if (!b) return;
  const title = `${cycle} のご注文は基準注文数で確定しました（${b.name}）`;
  const body = `オーダー締切（${closeOn}）までにご注文がなかったため、基準注文数（自動注文）のまま確定しました（合計 ${total}個）。お届けの内容は法人Web の「月次注文」で見られます。`;
  const link = { type: 'order' as const, id: o.id };
  notifyOnce(r, `default-fixed:${cycle}:${b.id}:branch`, { to: { site: 'corp', accountId: b.id, role: '' }, channels: ['site'], templateId: 'order_default_fixed', title, body, link });
  if (b.corpId) notifyOnce(r, `default-fixed:${cycle}:${b.id}:corp`, { to: { site: 'corp', accountId: b.corpId, role: '' }, channels: ['site'], templateId: 'order_default_fixed', title, body, link });
  const main = r.list<Contact>('dm.org.contacts').find((c) => c.owner.type === 'branch' && c.owner.id === b.id && c.kind === 'メイン担当者')
    ?? (b.corpId ? r.list<Contact>('dm.org.contacts').find((c) => c.owner.type === 'corp' && c.owner.id === b.corpId && c.kind === 'メイン担当者') : undefined);
  if (main?.email) notifyOnce(r, `default-fixed:${cycle}:${b.id}:mail`, { to: { site: 'corp', accountId: '', role: `mail:${main.email}` }, channels: ['mail'], templateId: 'order_default_fixed', title, body: `${main.name} 様\n${body}`, link });
}

/**
 * 締切済のメニューを、サイクルの A1 から配送中に。D7 の翌日から「終了」（運営の一覧の状態だけ。お客様・アプリの表示や販売には使わない：
 * 拠点に残った在庫はそのまま買える・注文履歴も見える。台帳 E「日次バッチに足す3つ」(a)・受付簿 No.50）
 */
function menuStatus(r: DocRepo, day: string) {
  const delivering: string[] = [], ended: string[] = [];
  for (const m of r.list<MonthlyMenu>('dm.order.menus')) {
    const c = r.get<Cycle>('dm.delivery.cycles', m.id);
    if (!c) continue;
    if (m.status === '締切済' && day >= c.a1) {
      r.put<MonthlyMenu>('dm.order.menus', m.id, { ...m, status: '配送中' });
      delivering.push(m.id);
    } else if (m.status === '配送中' && day > c.d7) {
      r.put<MonthlyMenu>('dm.order.menus', m.id, { ...m, status: '終了', log: [{ at: nowStamp(), by: 'system', what: `D7（${c.d7}）の翌日なので終了にしました（日次バッチ）` }, ...(m.log ?? [])] });
      ended.push(m.id);
    }
  }
  return { delivering, ended };
}

/**
 * 次のサイクルの子契約を作る（契約_01 §1 の先行生成・台帳 E 2026-10-05：今のサイクル＋4か月まで、年払いは 12 サイクル）。
 * 有効・利用休止・解約手続き中の親契約。休止の月・解約日より後の月・サイクルがまだない月は作らない。作り方は運営の手動の追加と同じ（org.addChild）
 */
function childGen(r: DocRepo, day: string) {
  const cur = cycleAt(r, day);
  if (!cur) return { made: [] as string[] };
  const cycles = new Map(r.list<Cycle>('dm.delivery.cycles').map((c) => [c.id, c]));
  const made: string[] = [];
  for (const ct of r.list<Contract>('dm.org.contracts').filter((x) => ['有効', '利用休止', '解約手続き中'].includes(x.status))) {
    const kids = r.list<ChildContract>('dm.org.childContracts').filter((x) => x.contractId === ct.id);
    /* 子契約がまだない契約：移行の休止中（休止の月だけで子契約がない）は、休止が明けてから作り始める。ほかは作らない */
    if (!kids.length && !(ct.migration?.cycles && r.list<Pause>('dm.org.pauses').some((p) => p.contractId === ct.id))) continue;
    const horizon = addYm(cur, isAnnual(r, ct) ? 11 : 4);
    const pauses = r.list<Pause>('dm.org.pauses').filter((p) => p.contractId === ct.id);
    for (let ym = kids.length ? addYm(kids.map((x) => x.cycleMonth).sort().pop()!, 1) : (ct.migration!.cycles![0] > cur ? ct.migration!.cycles![0] : cur); ym <= horizon; ym = addYm(ym, 1)) {
      const c = cycles.get(ym);
      if (!c) break;
      if (ct.endOn && c.a1 > ct.endOn) break;
      if (pauses.some((p) => p.fromCycle <= ym && ym <= p.toCycle)) continue;
      if (ct.kind === 'お試しキャンペーン') break;
      const cc = orgArea.actions.addChild(r, { contractId: ct.id, cycleMonth: ym }) as ChildContract;
      const next = { ...cc, gen: '日次バッチ' as const };
      r.put<ChildContract>('dm.org.childContracts', next.id, next);
      ensureDeliveries(r, next);
      refreshOrders(r, next);
      made.push(next.id);
    }
  }
  return { made };
}

/** 運営のシステム管理＝「権限付与」を編集できる役割（運営Web_権限表：初期値はフル権限） */
export const sysAdminRoles = (r: DocRepo) =>
  r.list<Role>('dm.account.roles').filter((x) => x.site === 'ops' && can(x.grants, 'grant', 'update')).map((x) => x.id);

/** 本発注の時期の始まりと最終日に、運営のシステム管理へ1回ずつ知らせる */
function honReminder(r: DocRepo, day: string, sent: Set<string>) {
  const out: string[] = [];
  for (const c of r.list<Cycle>('dm.delivery.cycles')) {
    const h = honSchedule(r, c.id);
    if (!h) continue;
    for (const x of h.halves) {
      const kind = day === x.from ? 'start' : day === x.to ? 'end' : '';
      const key = `hon:${c.id}:${x.half}:${kind}`;
      if (!kind || sent.has(key)) continue;
      /* 宛先はシステム管理（「権限付与」を編集できる役割）だけ（台帳 E「本発注のリマインドの宛先」2026-10-05）。役割ごとに1件 */
      for (const role of sysAdminRoles(r)) notify(r, {
        to: { site: 'ops', accountId: '', role }, templateId: '', link: { type: '', id: '' },
        title: kind === 'start' ? `本発注の時期になりました（${c.id} サイクル ${x.half}）` : `本日が本発注の最終日です（${c.id} サイクル ${x.half}）`,
        body: `${c.id} サイクル ${x.half}（${x.slots} の便・最初のお届け ${x.firstDeliver}）の本発注の時期は ${x.from}〜${x.to} です。${kind === 'end' ? '今日までに本発注してください。' : ''}`,
      });
      sent.add(key);
      out.push(key);
    }
  }
  return { sent: out };
}

/** 1日ぶんを動かす（順番どおり）。各処理は失敗したらその処理の書き換えだけ戻す */
function runSteps(r: DocRepo, day: string, sent: Set<string>, phase: BatchPhase = 'all'): BatchRun['steps'] {
  const now = `${day} ${phase === 'midnight' ? '00:00' : '09:00'}`;
  const fns: Record<BatchStep, (x: DocRepo) => unknown> = {
    menuTick: (x) => menuArea.actions.tick(x, { today: day, now }),
    orderOpen: (x) => orderOpen(x, day),
    orderClose: (x) => orderClose(x, day),
    menuStatus: (x) => menuStatus(x, day),
    applyTick: (x) => dailyTick(x, day),
    childGen: (x) => childGen(x, day),
    surveyTick: (x) => surveyArea.actions.tick(x, { now }),
    honReminder: (x) => honReminder(x, day, sent),
    /* 20日締めのあと（21日から）。中身は運営の請求の確定の状態から画面で数える（運営の billing.confirmAlert） */
    confirmAlert: () => ({ active: Number(day.slice(8, 10)) >= 21, closeMonth: day.slice(0, 7).replace('/', '-') }),
    altLate: (x) => ({ count: altLateTrips(x, day).length }),
    customerNotice: (x) => customerNotices(x, day),
  };
  return BATCH_STEPS.filter((step) => phase === 'all' || STEP_PHASE[step] === phase).map((step) => {
    const j: Journal = [];
    try {
      return { step, ok: true, result: fns[step](journaled(r, j)) ?? null };
    } catch (e) {
      rollback(r, j);
      return { step, ok: false, result: null, error: e instanceof Error ? e.message : String(e) };
    }
  });
}

/**
 * 1日ぶんの日次バッチ（batch.daily）。その日の記録があれば何もしない（skipped）。
 * 「今日」はその日のあいだ date にする。lastRunDate は進むだけ（戻さない）
 */
export function runDaily(r: DocRepo, a: { date?: string; trigger?: BatchRun['trigger']; phase?: BatchPhase } = {}) {
  const day = a.date ?? today();
  const phase = a.phase ?? 'all';
  if (!isDate(day)) throw new ApiError('日付の形が違います（YYYY/MM/DD）', 400);
  /* 記録：all＝日付、スケジューラの時刻ごと＝「日付 midnight／morning」。同じものは2回動かさない（all で動かした日は時刻ごとも動かさない） */
  const id = phase === 'all' ? day : `${day} ${phase}`;
  const done = r.get<BatchRun>(BATCH.runs, id) ?? (phase === 'all' ? undefined : r.get<BatchRun>(BATCH.runs, day));
  if (done) return { skipped: true as const, run: done };
  const st = batchState(r);
  const sent = new Set(st?.sent ?? []);
  const run = withToday(day, () => {
    const steps = runSteps(r, day, sent, phase);
    const x: BatchRun = { id, at: nowStamp(), trigger: a.trigger ?? 'manual', ...(phase === 'all' ? {} : { phase }), steps };
    r.put<BatchRun>(BATCH.runs, id, x);
    /* 最後に動かした日は 0:00 の分（と all）で進める */
    putState(r, { lastRunDate: phase !== 'morning' && !(st && st.lastRunDate > day) ? day : st?.lastRunDate ?? day, sent: [...sent] });
    /* 失敗した処理があればシステム管理へ知らせる（本番のスケジューラの失敗の通知：受付簿 No.51） */
    const ng = steps.filter((s) => !s.ok);
    if (ng.length) for (const role of sysAdminRoles(r)) notify(r, {
      to: { site: 'ops', accountId: '', role }, templateId: '', link: { type: '', id: '' },
      title: `日次バッチの失敗（${id}）`, body: ng.map((s) => `${s.step}：${s.error ?? ''}`).join('\n'),
    });
    return x;
  });
  return { skipped: false as const, run };
}

/**
 * 前回の日の翌日〜to をまとめて動かす（記録のある日は飛ばす）。初めて（状態がない）ときは、いまのデータを to の日の状態として扱い、動かさない（init）。
 */
export function catchUp(r: DocRepo, a: { to?: string; trigger: BatchRun['trigger'] }) {
  const to = a.to ?? today();
  if (!isDate(to)) throw new ApiError('日付の形が違います（YYYY/MM/DD）', 400);
  const st = batchState(r);
  if (!st) { putState(r, { lastRunDate: to, sent: [] }); return { init: true, ran: [] as string[] }; }
  const ran: string[] = [];
  for (let d = addDays(st.lastRunDate, 1), i = 0; d <= to; d = addDays(d, 1), i++) {
    if (i >= MAX_DAYS) throw new ApiError(`一度に進められるのは ${MAX_DAYS}日までです`, 400);
    if (!runDaily(r, { date: d, trigger: a.trigger }).skipped) ran.push(d);
  }
  return { init: false, ran };
}

/**
 * デモの「今日」を変える（DEMO 帯）。先へ進めたら間の日の日次バッチを1日ずつ動かす。前に戻したら日付だけ変える（動かした処理は戻らない）。
 * date＝'' で外す（.env の NEXT_PUBLIC_FIXED_TODAY・本当の今日に戻る。日次バッチは動かさない）
 */
export function setDemoDay(r: DocRepo, a: { date: string }) {
  const from = today();
  if (a.date === '') {
    r.remove(BATCH.demo, 'today');
    setDemoToday('');
    return { from, to: today(), ran: [] as string[], backward: false, cleared: true };
  }
  if (!isDate(a.date)) throw new ApiError('日付の形が違います（YYYY/MM/DD）', 400);
  /* 状態がなければ、いまの日を最後に動かした日にしてから進める */
  if (!batchState(r)) putState(r, { lastRunDate: from, sent: [] });
  const backward = a.date < from;
  const { ran } = backward ? { ran: [] as string[] } : catchUp(r, { to: a.date, trigger: 'demo' });
  r.put<DemoSetting>(BATCH.demo, 'today', { id: 'today', today: a.date, prev: from, setAt: nowStamp() });
  setDemoToday(a.date);
  return { from, to: a.date, ran, backward, cleared: false };
}

/** 日次バッチの記録の食い違い（check.run） */
export function batchProblems(r: DocRepo): string[] {
  const p: string[] = [];
  const need = (cond: boolean, msg: string) => { if (!cond) p.push(msg); };
  const st = batchState(r);
  const runs = r.list<BatchRun>(BATCH.runs);
  if (runs.length) need(!!st, '日次バッチの記録があるのに状態（dm.batch.state）がない');
  if (st) {
    need(isDate(st.lastRunDate), `日次バッチの最後の日 ${st.lastRunDate} の形が違う`);
    need(new Set(st.sent).size === st.sent.length, '日次バッチの1回だけの通知のキーが重なっている');
  }
  for (const x of runs) {
    /* id＝日付（all）か「日付 midnight／morning」（スケジューラ・受付簿 No.51） */
    const day = x.id.slice(0, 10), phase = x.phase ?? 'all';
    need(isDate(day) && x.at.startsWith(day) && x.id === (phase === 'all' ? day : `${day} ${phase}`), `日次バッチの記録 ${x.id} の日付・実行日時（${x.at}）が合わない`);
    need(!!st && day <= st.lastRunDate, `日次バッチの記録 ${x.id} が最後の日（${st?.lastRunDate ?? '—'}）より後`);
    /* 処理を足す前の記録は前の部分だけ（足した処理は後ろに足す） */
    const want = BATCH_STEPS.filter((s) => phase === 'all' || STEP_PHASE[s] === phase);
    need(x.steps.length > 0 && x.steps.map((s) => s.step).join(',') === want.slice(0, x.steps.length).join(','), `日次バッチの記録 ${x.id} の処理の順・数が違う`);
    need(x.steps.every((s) => s.ok || !!s.error), `日次バッチの記録 ${x.id} の失敗した処理にエラーの記録がない`);
  }
  const demo = r.get<DemoSetting>(BATCH.demo, 'today');
  if (demo) need(isDate(demo.today), `デモの「今日」${demo.today} の形が違う`);
  /* 締切を過ぎた公開中のメニューが残っていない（日次バッチを動かした日まで） */
  if (st) for (const m of listMenus(r)) need(!(m.status === '公開中' && m.orderTo && m.orderTo < st.lastRunDate && runs.some((x) => x.id > m.orderTo)), `メニュー ${m.id} はオーダー締切（${m.orderTo}）を過ぎて日次バッチを動かしたのに公開中`);
  return p;
}
