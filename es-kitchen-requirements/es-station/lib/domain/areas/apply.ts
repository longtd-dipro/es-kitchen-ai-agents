import { ApiError } from '@/lib/api/errors';
import { LOCKED_KIND, type LockedSkip } from '../locked';
import { defineArea, toDocs, type DocRepo } from '@/lib/ops/core/area';
import { notify } from '../notify';
import { applyReceivedMail, applyRejectedMail, esPlanNotices } from '../mails';
import { nowStamp, today } from '@/lib/supplier/dates';
import { APPLICATIONS } from '../seed/apply';
import type { Application, Branch, ChangeKind, ChildContract, Contract, Corp, Course, EquipProposal, NewSetup, Pause } from '../types';
import { isOpenPause } from '../types';
import {
  applyCancel, applyEquipChange, applyPause, applyPlanChange, applyResume, resumablePause, dailyTick, equipFees, finalDue, equipRows, liveChildren, migrating, missingOf,
  cancelProvisional, closeOf as cycleCloseOf, proposalFor, provisional, register, setupOf,
} from '../lifecycle';
import { ADJ, dryRun } from '../adjust';
import { setBasePattern } from './order';
import { assertAgencyUsable, setContractSource } from './referral';
import { log as auditLog } from './account';
import type { AuditLog, BillAdjustment, Plan } from '../types';
import { initFeeOf } from '../charges';

/*
 * 申請（area: apply）。kind：apply.applications
 *   法人Web：変更申請を出す・取り下げる・状況を見る／新規申込（申込フォーム）
 *   運営：新規申込の受付（受付中→契約設定中→完了／却下）、変更申請の承認（拠点ごと）
 * 承認すると共通データを変える：プランの変更→その月からの子契約、休止→休止、再開→休止の再開月、解約→親契約
 */

const apps = (r: DocRepo) => r.list<Application>('dm.apply.applications');
const getApp = (r: DocRepo, id: string) => {
  const a = r.get<Application>('dm.apply.applications', id);
  if (!a) throw new ApiError(`申請が見つかりません（${id}）`, 404);
  return a;
};
/* 対応中＝まだ承認待ちの拠点が残る（画面は「対応中 n/m」：旧「一部処理済み」・台帳 E 2026-10-05） */
const OPEN: Application['status'][] = ['承認待ち', '対応中'];

/** 拠点ごとの結果から申請の状態を決める */
export function statusOf(results: Application['results']): Application['status'] {
  const rs = results.map((x) => x.result);
  if (rs.every((x) => x === 'wd')) return '取り下げ済';
  if (rs.some((x) => x === '')) return rs.some((x) => x !== '') ? '対応中' : '承認待ち';
  if (rs.every((x) => x === 'ng')) return '却下';
  return rs.some((x) => x === 'ng') ? '一部承認' : '承認済';
}

/** 前月15日（オーダー締切） */
const closeOf = (cycle: string) => {
  const [y, m] = cycle.split('-').map(Number);
  const d = new Date(y, m - 2, 15);
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/15`;
};
const months = (from: string, to: string) => {
  const [a, b] = [from, to].map((x) => x.split('-').map(Number));
  return (b[0] - a[0]) * 12 + (b[1] - a[1]) + 1;
};
const nextNo = (r: DocRepo, prefix: string) => {
  const ymd = today().replace(/\//g, '');
  const max = Math.max(0, ...apps(r).filter((a) => a.id.startsWith(`${prefix}-${ymd}-`)).map((a) => Number(a.id.slice(-4))));
  return `${prefix}-${ymd}-${String(max + 1).padStart(4, '0')}`;
};

/**
 * 拠点情報の変更・法人情報の変更で、承認したら直す欄（法人Web の編集・申込フォームから。申請の edits に持つ）。
 * 住所・電話・FAX は拠点（法人情報の変更は法人）、billTo は親契約、allowGuest は開始サイクル月からの子契約
 */
export type InfoEdits = Partial<{ name: string; kana: string; zip: string; pref: string; city: string; addr1: string; addr2: string; tel: string; fax: string; billTo: Contract['billTo']; allowGuest: boolean }>;
export type ApplicationWithEdits = Application & { edits?: InfoEdits };

/** 住所・電話・FAX を直す（拠点・法人で同じ形） */
function withEdits<T extends { address: Branch['address']; tel: string; fax: string }>(x: T, e: InfoEdits): T {
  const { zip, pref, city, addr1, addr2, tel, fax } = e;
  const address = { ...x.address, ...Object.fromEntries(Object.entries({ zip, pref, city, addr1, addr2 }).filter(([, v]) => v !== undefined)) };
  return { ...x, address, tel: tel ?? x.tel, fax: fax ?? x.fax };
}

/** 承認したときに共通データを変える。返り値は反映についての注意（確定・請求済の月を飛ばしたときなど。通知に足す） */
function apply(r: DocRepo, a: Application, branchId: string, late?: '繰り下げ' | '代理', by = '', migrate?: boolean): string {
  const edits = (a as ApplicationWithEdits).edits;
  if (a.kind === '法人情報の変更' && edits) {
    const corp = r.get<Corp>('dm.org.corps', branchId);
    if (corp) r.put('dm.org.corps', corp.id, withEdits(corp, edits));
    return '';
  }
  const contract = r.list<Contract>('dm.org.contracts').find((c) => c.branchId === branchId);
  if (!contract) return '';
  let note = '';
  if (a.kind === '拠点情報の変更' && edits) {
    const b = r.get<Branch>('dm.org.branches', branchId);
    if (b) r.put('dm.org.branches', b.id, { ...withEdits(b, edits), name: edits.name ?? b.name, kana: edits.kana ?? b.kana });
    if (edits.billTo) r.put('dm.org.contracts', contract.id, { ...contract, billTo: edits.billTo });
    if (edits.allowGuest !== undefined) {
      for (const cc of r.list<ChildContract>('dm.org.childContracts').filter((x) => x.contractId === contract.id && x.cycleMonth >= a.startCycle)) {
        r.put('dm.org.childContracts', cc.id, { ...cc, app: { ...cc.app, allowGuest: edits.allowGuest } });
      }
    }
  }
  /* プランの変更・休止・再開・解約は lib/domain/lifecycle.ts（子契約・配送・注文・設備・アカウントまでそろえる） */
  if (a.kind === 'プランの変更' && a.change.planId) note = applyPlanChange(r, a, branchId, { late, by, migrate });
  if (a.kind === '休止') note = applyPause(r, a, branchId, by);
  if (a.kind === '再開') note = applyResume(r, a, branchId, by);
  if (a.kind === '解約') note = applyCancel(r, a, branchId, by);
  /* 設備の変更：運営が直した設備の異動の案で貸出・子契約の費用を変える（28-18・28-163） */
  if (a.kind === '設備の変更') note = applyEquipChange(r, a, branchId, { late, by });
  return note;
}

/**
 * 承認の前の試算：承認したらできる調整明細（請求済みの月の差額・費用）。データは変えない（dryRun）。
 * 承認済みなら、その承認で作った調整明細。運営の承認の画面の「請求済みの月 n件・差額の合計」（TL-7）
 */
export function billedPreview(r: DocRepo, id: string, branchId: string, late?: '繰り下げ' | '代理') {
  const app = getApp(r, id);
  const row = app.results.find((x) => x.branchId === branchId);
  if (!row) throw new ApiError('この拠点は申請の対象ではありません', 404);
  if (row.result === 'ok') return { done: true, error: '', rows: r.list<BillAdjustment>(ADJ).filter((x) => x.applicationId === id && x.branchId === branchId).sort((x, y) => x.id.localeCompare(y.id)), locked: [] as string[] };
  if (row.result !== '' || app.type !== 'change') return { done: false, error: '', rows: [] as BillAdjustment[], locked: [] as string[] };
  const t = dryRun(r, (x) => apply(x, app, branchId, late, ''));
  const rows = [...(t.writes.get(ADJ)?.values() ?? [])].filter(Boolean) as BillAdjustment[];
  /* 確定（未発行）でロックしたまま変えない月（承認すると反映待ちに残る。lib/domain/locked.ts） */
  const locked = ([...(t.writes.get(LOCKED_KIND)?.values() ?? [])].filter(Boolean) as LockedSkip[]).map((x) => x.cycleMonth).sort();
  return { done: false, error: t.error ?? '', rows: rows.sort((x, y) => x.id.localeCompare(y.id)), locked };
}

export default defineArea({
  name: 'apply',
  seed: () => ({ 'dm.apply.applications': toDocs(APPLICATIONS) }),
  queries: {
    /**
     * 解約した法人・拠点の参照のみの期間（法人Web の帯・課題 3-12）：終了日（親契約の endOn のいちばん後）と最後の請求書の入金期限
     * （まだ発行していなければ ''）。解約した契約がなければ null
     */
    closeInfo(r, a: { corpId?: string; branchId?: string }) {
      const bs = r.list<Branch>('dm.org.branches').filter((b) => (a.branchId ? b.id === a.branchId : !!a.corpId && b.corpId === a.corpId));
      const cs = r.list<Contract>('dm.org.contracts').filter((c) => bs.some((b) => b.id === c.branchId) && ['解約手続き中', '終了'].includes(c.status) && c.endOn);
      if (!cs.length) return null;
      const last = cs.sort((x, y) => x.endOn.localeCompare(y.endOn))[cs.length - 1];
      return { endOn: last.endOn, due: finalDue(r, last.branchId, last.endOn) };
    },
    /** 運営：一覧 */
    list: (r, a?: { type?: Application['type']; status?: Application['status']; kind?: Application['kind'] }) =>
      apps(r).filter((x) => (!a?.type || x.type === a.type) && (!a?.status || x.status === a.status) && (!a?.kind || x.kind === a.kind))
        .sort((x, y) => y.requestedAt.localeCompare(x.requestedAt)),
    get: (r, { id }: { id: string }) => getApp(r, id),
    /** 法人Web：法人アカウント＝法人の全申請、拠点アカウント（branchId）＝その拠点の申請だけ */
    forCorp: (r, a: { corpId?: string; branchId?: string }) =>
      apps(r).filter((x) => (a.branchId ? x.branchIds.includes(a.branchId) : x.corpId === a.corpId))
        .sort((x, y) => y.requestedAt.localeCompare(x.requestedAt)),
    /** 運営の受付画面：受付の中身・本登録に足りない情報 */
    setup: (r, { id }: { id: string }) => setupView(r, id),
    /** 運営の承認画面：設備の異動の案（プランの変更・設備の変更） */
    equipment: (r, { id, branchId }: { id: string; branchId: string }) => equipView(r, id, branchId),
    /** 運営の承認画面：請求済みの月にかかる差額（承認したらできる調整明細の試算・承認済みは作った調整明細。TL-7） */
    billedPreview: (r, a: { id: string; branchId: string; late?: '繰り下げ' | '代理' }) => billedPreview(r, a.id, a.branchId, a.late),
    /** 運営のメニューのバッジ（承認待ち・受付中の件数） */
    navBadge: (r) => ({ count: apps(r).filter((x) => OPEN.includes(x.status) || x.status === '受付中').length }),
  },
  actions: {
    /** 法人Web：変更申請を出す（accountId＝法人アカウントの CU… か拠点アカウントの CU…） */
    submitChange(r, a: { kind: ChangeKind; corpId: string; branchIds: string[]; accountId: string; name: string; startCycle: string; request: [string, string][]; change?: Application['change']; edits?: InfoEdits; /** 運営の代理入力：受付日（yyyy/mm/dd）。締切の判定に今日の代わりに使う */ receivedOn?: string }) {
      const isCorpAccount = a.accountId === a.corpId;
      if (a.kind === '法人情報の変更' && !isCorpAccount) throw new ApiError('法人情報の変更は法人アカウントだけが申請できます', 403);
      const targets = a.kind === '法人情報の変更' ? [a.corpId] : a.branchIds;
      if (!targets.length) throw new ApiError('拠点を選んでください', 400);
      for (const b of a.branchIds) {
        const br = r.get<Branch>('dm.org.branches', b);
        if (!br || br.corpId !== a.corpId) throw new ApiError(`${b} はこの法人の拠点ではありません`, 400);
        if (!isCorpAccount && b !== a.accountId) throw new ApiError('拠点アカウントは自分の拠点だけ申請できます', 403);
        if (apps(r).some((x) => x.type === 'change' && OPEN.includes(x.status) && x.results.some((y) => y.branchId === b && y.result === ''))) throw new ApiError(`${br.name} には処理中の申請があります（承認・却下のあとに出してください）`, 409);
      }
      if (a.kind !== '法人情報の変更' && !/^\d{4}-\d{2}$/.test(a.startCycle)) throw new ApiError('開始するサイクル月を選んでください', 400);
      if (a.kind !== '法人情報の変更' && (a.receivedOn?.replace(/-/g, '/') || today()) > closeOf(a.startCycle)) throw new ApiError(`${a.startCycle} サイクルの締切（${closeOf(a.startCycle)}）を過ぎています`, 409);
      if (a.kind === '休止') {
        const c = a.change ?? {};
        if (!c.fromCycle || !c.toCycle || !c.resumeCycle) throw new ApiError('休止の期間と再開予定月を入れてください', 400);
        for (const b of a.branchIds) {
          const ct = r.list<Contract>('dm.org.contracts').find((x) => x.branchId === b);
          const used = r.list<Pause>('dm.org.pauses').filter((p) => p.contractId === ct?.id && !isOpenPause(p)).reduce((s, p) => s + months(p.fromCycle, p.toCycle), 0);
          if (used + months(c.fromCycle, c.toCycle) > 12) throw new ApiError(`休止は通算12サイクルまでです（いま ${used}サイクル）`, 400);
        }
      }
      if (a.kind === '再開') {
        /* 再開できるのは休止中・休止予定の拠点だけ（台帳 運営A Q12・Q14）。休止予定の取消は 再開予定月＝休止の開始月 */
        for (const b of a.branchIds) {
          const ct = r.list<Contract>('dm.org.contracts').find((x) => x.branchId === b);
          const t = ct ? resumablePause(r, ct.id) : undefined;
          if (!t) throw new ApiError(`${r.get<Branch>('dm.org.branches', b)?.name ?? b} は休止中・休止予定ではないため、再開できません`, 409);
        }
      }
      const id = nextNo(r, 'CH');
      const next: Application = {
        id, type: 'change', kind: a.kind, kubun: '', status: '承認待ち', corpId: a.corpId, companyName: r.get<{ name: string }>('dm.org.corps', a.corpId)?.name ?? '',
        branchIds: a.kind === '法人情報の変更' ? [] : a.branchIds, branchNames: [],
        requestedBy: { site: 'corp', accountId: a.accountId, name: a.name }, requestedAt: nowStamp(),
        startCycle: a.kind === '法人情報の変更' ? '' : a.startCycle, orderCloseOn: a.kind === '法人情報の変更' ? '' : closeOf(a.startCycle),
        request: a.request, change: a.change ?? {}, results: targets.map((branchId) => ({ branchId, result: '', reason: '', by: '', at: '' })), proxy: false, reason: '',
        /* 拠点情報の変更・法人情報の変更：承認したら直す欄 */
        ...(a.edits && (a.kind === '拠点情報の変更' || a.kind === '法人情報の変更') ? { edits: a.edits } : {}),
      };
      r.put('dm.apply.applications', id, next);
      notify(r, { to: { site: 'ops', accountId: '', role: 'ops.sales' }, templateId: 'application_received', title: `${a.kind}の申請（${id}）`, body: `${next.companyName}：${a.request.map((x) => x[1]).join('・')}`, link: { type: 'application', id } });
      notify(r, { to: { site: 'corp', accountId: a.accountId, role: '' }, templateId: 'application_received', title: `${a.kind}を受け付けました（${id}）`, body: '結果はあらためてお知らせします。', link: { type: 'application', id } });
      return next;
    },
    /** 法人Web：取り下げ（拠点アカウントは法人アカウントが出した申請を取り下げられない）。branchId を渡すとその拠点の分だけ */
    withdraw(r, { id, accountId, corpId, branchId }: { id: string; accountId: string; corpId: string; branchId?: string }) {
      const a = getApp(r, id);
      if (a.corpId !== corpId) throw new ApiError('この法人の申請ではありません', 403);
      if (accountId !== corpId && a.requestedBy.accountId === corpId) throw new ApiError('法人アカウントが出した申請は、拠点アカウントからは取り下げられません', 403);
      if (a.type === 'new' ? a.status !== '受付中' : !OPEN.includes(a.status)) throw new ApiError('取り下げられるのは処理前の申請だけです', 409);
      if (branchId && a.type === 'change' && !a.results.some((x) => x.branchId === branchId && x.result === '')) throw new ApiError('この拠点の分は取り下げられません（処理済みか対象外）', 409);
      const results = a.results.map((x) => (x.result === '' && (!branchId || x.branchId === branchId) ? { ...x, result: 'wd' as const, by: accountId, at: nowStamp() } : x));
      const next = { ...a, results, status: a.type === 'new' ? '取り下げ済' as const : statusOf(results) };
      r.put('dm.apply.applications', id, next);
      return next;
    },
    /** 運営：変更申請の拠点ごとの承認・却下（却下は理由が要る） */
    /** late＝オーダー締切を過ぎてから承認するときの扱い（繰り下げ＝翌サイクルから・既定／代理＝運営が今月分を代理でオーダーし開始月は変えない。28-27・E-7'） */
    decide(r, a: { id: string; branchId: string; result: 'ok' | 'ng'; reason?: string; by: string; late?: '繰り下げ' | '代理'; migrate?: boolean }) {
      const app = getApp(r, a.id);
      const row = app.results.find((x) => x.branchId === a.branchId);
      if (!row || row.result !== '') throw new ApiError('この拠点は処理できません（処理済みか対象外）', 409);
      if (a.result === 'ng' && !a.reason?.trim()) throw new ApiError('却下の理由を入れてください', 400);
      const results = app.results.map((x) => (x.branchId === a.branchId ? { ...x, result: a.result, reason: a.reason ?? '', by: a.by, at: nowStamp() } : x));
      const next = { ...app, results, status: statusOf(results) };
      r.put('dm.apply.applications', a.id, next);
      /* 承認・却下はその場で確定（やり直しはしない。直すときは新しい申請：課題一覧 4-8・台帳 2026/10/02） */
      const note = a.result === 'ok' ? apply(r, app, a.branchId, a.late, a.by, a.migrate) : '';
      const msg = { templateId: 'application_decided', title: `${app.kind}の申請が${a.result === 'ok' ? '承認' : '却下'}されました（${app.id}）`, body: a.result === 'ok' ? (note || `${app.startCycle ? app.startCycle + ' サイクルから反映します。' : '反映しました。'}`) : `理由：${a.reason}`, link: { type: 'application' as const, id: app.id } };
      notify(r, { ...msg, to: { site: 'corp', accountId: app.requestedBy.accountId || a.branchId, role: '' } });
      if (app.corpId && app.requestedBy.accountId !== app.corpId) notify(r, { ...msg, to: { site: 'corp', accountId: app.corpId, role: '' } });
      /* note＝反映についての注意（確定・請求済の月を飛ばしたとき。運営の画面のトースト用） */
      return note ? { ...next, note } : next;
    },
    /** 申込フォーム（公開・法人Web）：新規申込 */
    submitNew(r, a: { kubun: Application['kubun']; companyName: string; corpId?: string; branchIds?: string[]; branchNames: string[]; startCycle: string; name: string; accountId?: string; request: [string, string][]; mailTo?: { name: string; email: string }[] }) {
      const branchIds = a.branchIds ?? [];
      if (!a.companyName.trim() || !(a.branchNames.length + branchIds.length)) throw new ApiError('法人名と拠点を入れてください', 400);
      /* 今ある拠点（切替＝お試しの拠点。B2）はその法人の拠点だけ */
      for (const b of branchIds) if (!a.corpId || r.get<Branch>('dm.org.branches', b)?.corpId !== a.corpId) throw new ApiError(`拠点 ${b} はこの法人の拠点ではありません`, 400);
      if (a.kubun === '切替' && !branchIds.length) throw new ApiError('切替（お試し→本導入）はお試し中の拠点を選んでください', 400);
      const id = nextNo(r, 'AP');
      const next: Application = {
        id, type: 'new', kind: '新規申込', kubun: a.kubun || '本導入', status: '受付中', corpId: a.corpId ?? null, companyName: a.companyName,
        branchIds, branchNames: a.branchNames, requestedBy: { site: a.accountId ? 'corp' : 'public', accountId: a.accountId ?? '', name: a.name },
        requestedAt: nowStamp(), startCycle: a.startCycle, orderCloseOn: closeOf(a.startCycle), request: a.request, change: {}, results: [], proxy: false, reason: '',
      };
      r.put('dm.apply.applications', id, next);
      /* M1 受付完了：お申し込み者とメイン担当者へ（文面を作るだけ・送らない） */
      if (a.mailTo?.length) applyReceivedMail(r, next, a.mailTo);
      return next;
    },
    /**
     * 運営：新規申込の受付を進める（受付中→契約設定中→完了。却下・取り下げは理由が要る）。
     * 仮登録のあと（契約設定中）の却下・取り下げは、まだ本登録していない拠点・親契約・注文・資材の初期セットを取消・アカウント停止（lifecycle の cancelProvisional）。
     * 仮登録のあとの取り下げは運営だけ（法人は運営へ連絡：台帳 2026/10/03）
     */
    advanceNew(r, a: { id: string; status: '契約設定中' | '完了' | '却下' | '取り下げ済'; reason?: string; by: string }) {
      const app = getApp(r, a.id);
      const from: Record<string, Application['status'][]> = { 契約設定中: ['受付中'], 完了: ['契約設定中'], 却下: ['受付中', '契約設定中'], 取り下げ済: ['受付中', '契約設定中'] };
      if (app.type !== 'new' || !from[a.status].includes(app.status)) throw new ApiError(`${app.status} から ${a.status} にはできません`, 409);
      if ((a.status === '却下' || a.status === '取り下げ済') && !a.reason?.trim()) throw new ApiError(`${a.status === '却下' ? '却下' : '取り下げ'}の理由を入れてください`, 400);
      let next: Application = { ...app, status: a.status, reason: a.reason ?? app.reason };
      /* 受付中でも、移行の仮登録のお客様（拠点が仮登録で作ってある）は同じく取り消す */
      const migrated = app.status === '受付中' && !!app.setup?.branches.some((b) => b.stage === '' && b.branchId);
      if ((a.status === '却下' || a.status === '取り下げ済') && (app.status === '契約設定中' || migrated)) {
        const setup = structuredClone(app.setup);
        const done = setup ? cancelProvisional(r, { ...app, setup }, a.by) : [];
        next = { ...next, ...(setup ? { setup } : {}) };
        if (done.length) auditLog(r, a.by, `apply.${a.status === '却下' ? 'reject' : 'withdraw'}`, app.id, `仮登録の取消：${done.join('・')}`);
      }
      r.put('dm.apply.applications', a.id, next);
      /* 却下はお申し込み者へ理由つきで知らせる（Mail List No.28。取り下げは運営がお客様のご連絡を受けて行うので送らない） */
      if (a.status === '却下') applyRejectedMail(r, next, a.reason ?? '');
      return next;
    },
    /** 運営：代理入力（電話・紙など）で受けた申請にする（submitChange・submitNew のすぐあとに呼ぶ） */
    markProxy(r, a: { id: string; accountId: string; name: string }) {
      const next = { ...getApp(r, a.id), proxy: true, requestedBy: { site: 'ops' as const, accountId: a.accountId, name: a.name } };
      r.put('dm.apply.applications', a.id, next);
      return next;
    },
    /* ---------- 新規申込の受付：仮登録 → 本登録（課題 3-2・3-7） ---------- */
    /** 受付の中身を保存する（運営の受付画面）。仮登録・本登録で作った ID・段階は変えない */
    saveSetup(r, a: { id: string; setup: NewSetup }) {
      const app = getApp(r, a.id);
      if (app.type !== 'new' || !['受付中', '契約設定中'].includes(app.status)) throw new ApiError(`${app.status} の申込は直せません`, 409);
      const cur = setupOf(r, app);
      if (a.setup.branches.length < cur.branches.length) throw new ApiError('仮登録した拠点は外せません', 400);
      /* 初期費用（OP000008・税抜）・オプションの金額の上書き（REQ-CT-304）：0以上の整数の円。0＝請求しない */
      for (const b of a.setup.branches) {
        if (b.initFeeYen !== undefined && !(Number.isInteger(b.initFeeYen) && b.initFeeYen >= 0)) throw new ApiError(`初期費用（税抜）は 0以上の整数の円で入れてください（${b.name || '拠点'}）`, 400);
        for (const [oid, v] of Object.entries(b.amounts ?? {})) if (!(Number.isInteger(v) && v >= 0) || !r.get('dm.master.options', oid)) throw new ApiError(`オプションの金額が正しくありません（${oid}）`, 400);
      }
      /* 紹介元（運営が受付・承認のときに入れる）：代理店は有効なものだけ・代理店か法人のどちらか一方 */
      const agencyId = a.setup.agencyId ?? '', srcCorpId = a.setup.srcCorpId ?? '';
      if (agencyId && srcCorpId) throw new ApiError('紹介元は代理店か法人のどちらか一方です', 400);
      if (agencyId && agencyId !== (cur.agencyId ?? '')) assertAgencyUsable(r, agencyId);
      if (srcCorpId && !r.get('dm.org.corps', srcCorpId)) throw new ApiError(`紹介元の法人が見つかりません（${srcCorpId}）`, 404);
      const setup: NewSetup = {
        ...a.setup, startCycle: cur.branches.some((b) => b.stage !== '') ? cur.startCycle : a.setup.startCycle || cur.startCycle, notes: cur.notes,
        corp: cur.corp && a.setup.corp ? a.setup.corp : cur.corp,
        branches: a.setup.branches.map((b, i) => {
          const c = cur.branches[i];
          return c ? { ...b, branchId: c.branchId, contractId: c.contractId, stage: c.stage } : { ...b, branchId: '', contractId: '', stage: '' as const };
        }),
      };
      const next = { ...app, setup };
      r.put('dm.apply.applications', a.id, next);
      /* 仮登録した拠点（親契約がある）は、紹介元をすぐ親契約・紹介履歴に反映する（まだの拠点は仮登録のとき反映） */
      if (agencyId !== (cur.agencyId ?? '') || srcCorpId !== (cur.srcCorpId ?? '')) {
        const now = nowStamp();
        for (const b of setup.branches) if (b.contractId) setContractSource(r, { contractId: b.contractId, agencyId, srcCorpId, by: '運営', at: now });
      }
      /* 初期費用を直したら履歴に残す（受付画面の「変更履歴」・本登録の調整明細の金額になる） */
      setup.branches.forEach((b, i) => {
        const was = cur.branches[i]?.initFeeYen;
        if (b.initFeeYen !== was) auditLog(r, 'ops', 'apply.saveSetup', a.id, `拠点「${b.name || i + 1}」の初期費用（税抜）を ${was === undefined ? 'プランマスタの金額' : was.toLocaleString('ja-JP') + '円'} → ${b.initFeeYen === undefined ? 'プランマスタの金額' : b.initFeeYen.toLocaleString('ja-JP') + '円'} に変更`, 'ops');
      });
      /* 基準数のパターン（REQ-CT-300）：仮登録した拠点は、受付で直した値をすぐ拠点の注文の設定に入れる */
      for (const b of setup.branches) if (b.stage === '仮登録' && b.branchId && b.noShortLife !== undefined) setBasePattern(r, { branchId: b.branchId, noShortLife: b.noShortLife, by: 'ops' });
      return next;
    },
    /**
     * 運営：オーダー締切を過ぎた申込の、開始月の扱いを選ぶ（繰り下げ／代理オーダー。申込フォーム §10-5・台帳 B。28-27 の自動の繰り下げは使わない）。
     * 申込内容の確認を完了する（仮登録）前の申込だけ。選んだ内容は受付の変更履歴に残り、仮登録・本登録の注意に書く
     */
    setLate(r, a: { id: string; late: '繰り下げ' | '代理'; by: string }) {
      if (a.late !== '繰り下げ' && a.late !== '代理') throw new ApiError('開始月の扱いを選んでください', 400);
      const app = getApp(r, a.id);
      if (app.type !== 'new' || app.status !== '受付中') throw new ApiError('選べるのは、申込内容の確認を完了する前（受付中）の申込だけです', 409);
      const cur = setupOf(r, app), want = cur.startCycle || app.startCycle, close = cycleCloseOf(r, want);
      if (today() <= close) throw new ApiError(`オーダー締切（${close}）の前なので、選ぶ必要はありません`, 409);
      const was = cur.late ?? '繰り下げ';
      if (was === a.late && cur.late) return app;
      const next = { ...app, setup: { ...cur, late: a.late } };
      r.put('dm.apply.applications', a.id, next);
      const L = { 繰り下げ: '開始月を翌サイクルへ繰り下げる', 代理: '運営が代理でオーダーする（希望の月から開始）' };
      auditLog(r, a.by, 'apply.setLate', a.id, `締切後の開始月の扱い：${cur.late ? `${L[was]} → ${L[a.late]}` : `${L[a.late]}を選択（未選択のときの既定は繰り下げ）`}（オーダー締切 ${close}・開始希望 ${want}）`);
      return next;
    },
    /** 仮登録（法人・拠点・親契約・アカウント・最初の注文・資材の初期セット）。申込は契約設定中 */
    /* ES配送便の委託配送先へ「新規ES配送プラン追加のお知らせ」（便の設定がまだなら本登録のとき・lib/domain/mails.ts） */
    provisional: (r, a: { id: string; by: string }) => { const x = provisional(r, getApp(r, a.id), a.by); esPlanNotices(r, x); return x; },
    /** 本登録（拠点ごと。必須の情報がそろい、運営が確かめた拠点だけ）。全拠点がそろうと申込は完了 */
    register: (r, a: { id: string; index: number; by: string }) => { const x = register(r, getApp(r, a.id), a.index, a.by); esPlanNotices(r, x.app); return x; },
    /** 設備の異動の案を保存する（運営が承認の前に直す。rows を渡すと費用の案を作り直す） */
    saveEquipment(r, a: { id: string; branchId: string; proposal: EquipProposal; recalc?: boolean; by: string }) {
      const app = getApp(r, a.id);
      const ctx = equipCtx(r, app, a.branchId);
      const fees = a.recalc ? equipFees(r, a.proposal.rows, ctx) : a.proposal.fees;
      if (fees.some((f) => !Number.isInteger(f.amountYen) || f.amountYen < 0)) throw new ApiError('金額は0以上の整数で入れてください', 400);
      if (a.proposal.rows.some((x) => !Number.isInteger(x.qty) || x.qty < 1)) throw new ApiError('台数は1以上の整数で入れてください', 400);
      const p: EquipProposal = { ...a.proposal, fees, updatedAt: nowStamp(), updatedBy: a.by, edited: true };
      r.put('dm.apply.applications', a.id, { ...app, equipment: { ...app.equipment, [a.branchId]: p } });
      return p;
    },
    /** 設備の異動の案を今のデータから作り直す（保存した案を消す） */
    resetEquipment(r, a: { id: string; branchId: string }) {
      const app = getApp(r, a.id);
      const equipment = { ...app.equipment };
      delete equipment[a.branchId];
      r.put('dm.apply.applications', a.id, { ...app, equipment });
      return { ok: true };
    },
    /** 毎日の処理（開発中は POST /api/domain/apply/tick）：休止の開始・終わり、解約日の終了・閉鎖、入金期限のあとのアカウント停止 */
    tick: (r, a?: { today?: string }) => dailyTick(r, a?.today),
  },
});

/** 設備の異動の案の前提（プランの変更＝plan／お試し→本導入＝trial／設備の変更＝equip）。migrate＝移行割の対象（承認の画面のチェックを出す） */
export function equipCtx(r: DocRepo, app: Application, branchId: string): { planId: string; course: Course | ''; mode: 'plan' | 'trial' | 'equip'; migrate: boolean } {
  if (app.type === 'new') {
    const b = setupOf(r, app).branches.find((x) => x.branchId === branchId);
    return { planId: b?.planId ?? '', course: (b?.course ?? '') as Course | '', mode: 'trial' as const, migrate: false };
  }
  const ct = r.list<Contract>('dm.org.contracts').find((c) => c.branchId === branchId);
  const before = ct ? liveChildren(r, ct.id).filter((x) => x.cycleMonth < app.startCycle).pop() ?? liveChildren(r, ct.id)[0] : undefined;
  if (app.kind === '設備の変更') return { planId: before?.planId ?? '', course: before?.course ?? '', mode: 'equip', migrate: false };
  const course = (app.change.course ?? before?.course ?? '') as Course | '';
  return { planId: app.change.planId ?? '', course, mode: 'plan' as const, migrate: migrating(before, course) };
}

/** 受付の中身と、拠点ごとの本登録に足りない情報・設備の異動の案（お試し→本導入）。運営の受付画面が読む */
export function setupView(r: DocRepo, id: string) {
  const app = getApp(r, id);
  const setup = setupOf(r, app);
  return {
    setup, saved: !!app.setup, status: app.status,
    /* 受付の変更履歴（初期費用など）。新しい順 */
    history: r.list<AuditLog>('dm.account.audit').filter((x) => x.target === id).reverse(),
    branches: setup.branches.map((b, i) => {
      const ct = b.contractId ? r.get<Contract>('dm.org.contracts', b.contractId) : undefined;
      const trial = !!ct && ct.kind === 'お試しキャンペーン' && app.kubun !== 'お試し';
      /* 初期費用（税抜）の既定＝自販機の機種マスタの初期料金、なければオプション OP000008 の金額。本登録（お試し・切替も）の調整明細の金額（受付で直せる・0＝請求しない） */
      const initFeeDefaultYen = initFeeOf(r, b.equipment);
      return { index: i, initFeeDefaultYen, missing: missingOf(r, setup, i), ready: !missingOf(r, setup, i).length && b.checked, trial, equipment: trial && b.branchId ? proposalFor(r, app, b.branchId, 'trial', b.planId, b.course) : null };
    }),
  };
}

/** 変更申請の設備の異動の案（プランの変更）。保存した案があればそれ */
export function equipView(r: DocRepo, id: string, branchId: string) {
  const app = getApp(r, id);
  const ctx = equipCtx(r, app, branchId);
  return { ...ctx, proposal: proposalFor(r, app, branchId, ctx.mode, ctx.planId, ctx.course), saved: !!app.equipment?.[branchId], fresh: { rows: equipRows(r, branchId, ctx.planId, ctx.course, ctx.mode) } };
}
