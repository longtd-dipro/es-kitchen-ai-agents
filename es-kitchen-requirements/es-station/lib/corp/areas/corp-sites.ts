import { ApiError } from '@/lib/api/errors';
import { nowStamp, today } from '@/lib/supplier/dates';
import { notify } from '@/lib/domain/notify';
import { defineArea, type DocRepo } from '@/lib/ops/core/area';
import domainApply, { type InfoEdits } from '@/lib/domain/areas/apply';
import domainOrg from '@/lib/domain/areas/org';
import { penaltyOf } from '@/lib/domain/lifecycle';
import type { Application, Branch, ChangeKind, Course, Loan, Model, Plan } from '@/lib/domain/types';
import {
  acctName, CFIELDS, chErrors, chSummary, chWhat, cxlOpts, FIELDS, firstCycle, kindOf, lenMonths, NOW_CYC, procsOf, KIND_OF_PROC,
  rvCheck, splitChanges, staffError, whoCands, type ChKind, type ChPen, type ChSite,
} from '../sites/logic';
import {
  addMonth, branchesOf, contactRows, corpPending, corpView, cycOfJa, fieldsToEdits, K, reqRowsOf, siteView, type Kover,
} from '../sites/fromDomain';
import type { Acct, SiteView, StaffRow } from '../sites/types';

/*
 * 法人Web の拠点管理・契約の申請・法人情報（元：部品/22_法人_拠点管理.html）。
 *
 * データは共通データ（lib/domain・dm.*）：法人・拠点・契約・子契約・休止・貸出・担当者（dm.org）、申請（dm.apply）、請求書（dm.billing）、
 *   プラン・機種・オプション（dm.master）。画面の形は lib/corp/sites/fromDomain.ts で作る。
 *   書くときは共通データの actions（org.updateBranchNow・updateCorpNow・setAppLimits・updateReceive、apply.submitChange・withdraw・submitNew）を呼ぶ。
 * 共通データにまだない値：1ヶ月上限金額（corp-sites.app）・月ごとのご契約の配送備考（corp-sites.kover）、納品不可曜日・資料など（sites/seed.ts）。
 * 運営Web も共通データ（dm.*）を読むので、運営Web の kind（contracts.*・applications.*）には書かない。
 * queries・actions には、ログイン中のアカウント（acct：corpId・branchId・role）を渡す。拠点アカウントはその拠点のデータだけ。
 */

/** ログイン中のアカウントの ID（共通データの申請の accountId） */
const accountOf = (a: Acct) => (a.role === 'branch' && a.branchId ? a.branchId : a.corpId);

/* ---------------- 読む ---------------- */
const visible = (repo: DocRepo, a: Acct) => branchesOf(repo, a).map((b) => siteView(repo, b));
function mustSite(repo: DocRepo, a: Acct, id: string): { b: Branch; v: SiteView } {
  const b = branchesOf(repo, a).find((x) => x.id === id);
  if (!b) throw new ApiError('この拠点は見られません', 404);
  return { b, v: siteView(repo, b) };
}
function mustCorp(repo: DocRepo, corpId: string) {
  const c = corpView(repo, corpId);
  if (!c) throw new ApiError('法人が見つかりません', 404);
  return c;
}
const cpendOf = (repo: DocRepo, corpId: string, d: Record<string, string>) => corpPending(repo, corpId, (k) => d[k] ?? '');

function whoName(repo: DocRepo, a: Acct, who: string, siteIds: string[]) {
  const corp = mustCorp(repo, a.corpId);
  const sites = visible(repo, a).filter((v) => siteIds.includes(v.id) || a.role === 'branch');
  const c = whoCands(a.role, corp.staff, sites).find((x) => x.value === who);
  if (!c) throw new ApiError('変更した方を選んでください', 400);
  return c.name;
}

/* ---------------- 申請の資料（追加・変更はいつでも。運営には画面のお知らせだけ：台帳 F「法人Web 契約の申請」） ---------------- */
export type AttachFile = { name: string; size: number; at: string; by: string };
export const ATTACH_MAX_SIZE = 5 * 1024 * 1024;
export const ATTACH_MAX_COUNT = 10;
function mustApp(repo: DocRepo, a: Acct, no: string): Application {
  const app = repo.get<Application>('dm.apply.applications', no);
  if (!app || app.corpId !== a.corpId) throw new ApiError('この申請は見られません', 404);
  /* 拠点アカウントは自分の拠点の申請だけ */
  if (a.role === 'branch' && a.branchId && app.type === 'change' && !app.branchIds.includes(a.branchId)) throw new ApiError('この申請は見られません', 404);
  return app;
}

/* ---------------- 変更のお申し込み ---------------- */
/** 貸出中の設備（いまお使いのもの）と、解約日ごとの違約金の目安（設備ごとの回収額 × 残り月数 ÷ 最低利用期間・台帳 28-2） */
function equipOf(repo: DocRepo, v: SiteView): Pick<ChSite, 'equip' | 'pen'> {
  const loans = repo.list<Loan>('dm.org.loans').filter((l) => l.branchId === v.id && l.status === '貸出中');
  const mod = (l: Loan) => repo.get<Model>('dm.master.models', l.modelId);
  const equip = loans.filter((l) => mod(l)).map((l) => ({ name: l.modelId + '　' + mod(l)!.name, qty: l.qty }));
  const trial = v.ct.kind === 'お試しキャンペーン';
  const pen: Record<string, ChPen> = {};
  for (const o of cxlOpts(today())) {
    const rows = trial ? [] : loans.map((l) => ({ l, r: penaltyOf(repo, l, o.v, v.ct.no) })).filter((x) => x.r.model).map((x) => ({
      name: x.l.modelId + '　' + x.r.model!.name, qty: x.l.qty, remaining: x.r.remaining, min: x.r.model!.minMonths, yen: x.r.yen,
    }));
    pen[o.v] = { total: rows.reduce((s, x) => s + x.yen, 0), rows };
  }
  return { equip, pen };
}
function chSite(v: SiteView, repo?: DocRepo): ChSite {
  const pn = (/(\d+プラン)/.exec(v.ct.plan) || [])[1];
  return {
    id: v.id, name: v.name, cp: v.ct.no, plan: pn ? pn + '（' + v.ct.course + '）' : v.ct.plan,
    state: v.status === '休止中' ? 'suspended' : 'active', start: v.ct.startCyc.replace(/分$/, ''), term: v.apply.term, qr: v.qr, trial: v.ct.trial, apply: v.apply,
    ...(repo ? equipOf(repo, v) : {}),
  };
}
/** その手続きを申し込める拠点か（理由つき） */
function canApply(k: ChKind, v: SiteView): string {
  const ki = kindOf(k)!;
  if (v.pend || v.pinfo) return '承認待ちのお申し込み（' + (v.pend || v.pinfo)!.no + '）があるため、承認後にお申し込みください。';
  /* 再開の対象は『休止中』と『休止予定』の拠点（台帳 F・運営A 休止予定の取消 2026-10-06） */
  const st = v.status === '休止中' || (k === 'rsm' && !!v.band) ? 'suspended' : 'active';
  if (st !== ki.need && st !== ki.also) return (st === 'suspended' ? '休止中の拠点' : 'ご利用中の拠点') + 'のため、このお手続きの対象外です。';
  const proc = (Object.entries(KIND_OF_PROC).find(([, x]) => x === k) || [])[0];
  if (proc && v.apply.block?.includes(proc)) return (v.apply.blockWhy || '') + 'のため、このお手続きの対象外です。';
  return '';
}
/** 「100プラン（ESスタンダード）」→ プランとコース（ESライトは自販機の拠点なら自販機） */
function planOf(repo: DocRepo, label: string | undefined, vend: boolean): { planId?: string; course?: Course } {
  const m = /^(\d+プラン)（(.+)）$/.exec(label || '');
  if (!m) return {};
  const plan = repo.list<Plan>('dm.master.plans').find((p) => p.name === m[1] && p.status === '有効');
  const course: Course = m[2] === 'ESスタンダード' ? 'ESスタンダード' : m[2] === 'ESライト（自販機）' || vend ? 'ESライト（自販機）' : 'ESライト（冷蔵庫）';
  return plan ? { planId: plan.id, course } : {};
}
/** 申込フォームの値 → 共通データの申請（開始サイクル月・変更の中身・承認したら直す欄） */
function changeOf(repo: DocRepo, k: ChKind, v: SiteView, val: Record<string, string>): { start: string; change: Application['change']; edits?: InfoEdits } {
  const start = cycOfJa(val.cyc);
  if (k === 'chg' || k === 'rsm') return { start, change: { ...planOf(repo, val.plan, !!v.apply.vend), ...(k === 'rsm' ? { resumeCycle: start } : {}) } };
  if (k === 'sus') {
    const n = lenMonths(val.len);
    return { start, change: { fromCycle: start, toCycle: addMonth(start, n - 1), resumeCycle: addMonth(start, n), keepEquipment: /^置いたまま/.test(val.eqkeep || '') } };
  }
  if (k === 'cxl') {
    const o = cxlOpts(today()).find((x) => val.end?.startsWith(x.v));
    const s = o ? cycOfJa(o.apply) : '';
    return { start: s, change: s ? { lastCycle: addMonth(s, -1) } : {} };
  }
  if (k === 'inf') {
    const e: InfoEdits = fieldsToEdits({
      ...(val.name ? { name: val.name } : {}), ...(val.kana ? { kana: val.kana } : {}), ...(val.zip ? { zip: val.zip } : {}), ...(val.pref ? { pref: val.pref } : {}),
      ...(val.city ? { city: val.city } : {}), ...(val.addr1 ? { a1: val.addr1 } : {}), ...(val.addr2 ? { a2: val.addr2 } : {}), ...(val.tel ? { tel: val.tel } : {}),
      ...(val.bill ? { billTo: val.bill === '法人に請求' ? '法人' : 'この拠点' } : {}), ...(val.guest ? { guest: val.guest } : {}),
    });
    return { start, change: {}, edits: e };
  }
  return { start, change: {} };
}

export default defineArea({
  name: 'corp-sites',
  /* 自分の見本は持たない（共通データを読む。corp-sites.app・corp-sites.kover は法人Web で直したときにできる） */
  seed: () => ({}),
  queries: {
    /** 拠点一覧 */
    sites: (repo: DocRepo, a: { acct: Acct }) => ({ corpName: mustCorp(repo, a.acct.corpId).name, rows: visible(repo, a.acct) }),
    /** 拠点詳細（申請の履歴・変更した方の候補つき） */
    site: (repo: DocRepo, a: { acct: Acct; id: string }) => {
      const { v } = mustSite(repo, a.acct, a.id);
      const corp = mustCorp(repo, a.acct.corpId);
      const kover = Object.fromEntries(v.kids.map((k) => [k.id, repo.get<Kover>(K.kover, k.id) ?? null]).filter(([, o]) => o));
      return {
        site: v, corpName: corp.name, procs: procsOf(v), reqs: reqRowsOf(repo, a.acct.corpId, [{ id: v.id, name: v.name }], null),
        who: whoCands(a.acct.role, corp.staff, [{ name: v.name, staff: v.staff }]), kover: kover as Record<string, Kover>,
      };
    },
    /** 契約の申請の一覧 */
    requests: (repo: DocRepo, a: { acct: Acct }) => {
      const corp = mustCorp(repo, a.acct.corpId);
      const sites = visible(repo, a.acct);
      const isBranch = a.acct.role === 'branch';
      return {
        corpName: corp.name, rows: reqRowsOf(repo, a.acct.corpId, sites, isBranch ? null : corp),
        sites: sites.map((s) => ({ id: s.id, name: s.name, pend: s.pend, pinfo: s.pinfo })), cpend: isBranch ? null : cpendOf(repo, a.acct.corpId, corp.d),
      };
    },
    /** 申請に付けた資料（ファイル名・大きさ・追加した日時。中身は持たない＝お知らせの資料と同じ） */
    attachments: (repo: DocRepo, a: { acct: Acct; no: string }) => {
      mustApp(repo, a.acct, a.no);
      return repo.get<{ files: AttachFile[] }>('corp-sites.attach', a.no)?.files ?? [];
    },
    /** 法人情報（法人アカウントだけ） */
    corp: (repo: DocRepo, a: { acct: Acct }) => {
      if (a.acct.role === 'branch') throw new ApiError('法人情報は法人アカウントだけが見られます', 403);
      const c = mustCorp(repo, a.acct.corpId);
      return {
        id: a.acct.corpId, name: c.name, status: c.status, d: c.d, staff: c.staff, bill: c.bill, inv: c.inv,
        cpend: cpendOf(repo, a.acct.corpId, c.d), sites: visible(repo, a.acct), who: whoCands(a.acct.role, c.staff, []),
        orderReminder: repo.get<{ orderReminder?: boolean }>('dm.org.corps', a.acct.corpId)?.orderReminder !== false,
      };
    },
    /** 変更のお申し込み・拠点を追加で使う値 */
    applyCtx: (repo: DocRepo, a: { acct: Acct }) => {
      const c = mustCorp(repo, a.acct.corpId);
      const sites = visible(repo, a.acct);
      return {
        corpName: c.name, corpId: a.acct.corpId,
        sites: sites.map((v) => ({
          ...chSite(v, repo), staff: v.staff,
          why: Object.fromEntries((['chg', 'opt', 'eqp', 'inf', 'sus', 'rsm', 'cxl'] as ChKind[]).map((kd) => [kd, canApply(kd, v)])) as Record<string, string>,
        })),
        corpStaff: c.staff, cpend: a.acct.role === 'branch' ? null : cpendOf(repo, a.acct.corpId, c.d),
        corpAddr: { zip: c.d.zip, pref: c.d.pref, city: c.d.city, a1: c.d.a1, a2: c.d.a2, tel: c.d.tel, fax: c.d.fax },
      };
    },
  },
  actions: {
    /**
     * 拠点の編集の保存。承認が必要な欄は拠点情報の変更の申請（CH-）にし、ほかは共通データにすぐ書く。
     * 休止中はご担当者だけ直せる（RV-CORP-20261002 C-c）
     */
    saveSite: (repo: DocRepo, a: { acct: Acct; id: string; d: Record<string, string>; staff: StaffRow[]; who: string }) => {
      const { b, v } = mustSite(repo, a.acct, a.id);
      const ck = rvCheck(FIELDS, a.d, a.staff);
      if (ck.list.length) throw new ApiError('入力内容に誤りがあります（' + ck.list.length + '件）。' + ck.list[0].label + '：' + ck.list[0].msg, 400);
      /* 請求担当者は請求書のあて先がこの拠点のときだけ必須（受付簿 No.45） */
      const se = staffError(ck.staff, v.billTo !== '法人');
      if (se) throw new ApiError(se, 400);
      const cur = (k: string) => String((v as unknown as Record<string, unknown>)[k] ?? '');
      const { ch, now } = splitChanges(FIELDS, ck.d, cur);
      if (v.status === '休止中' && (ch.length || now.length)) throw new ApiError('休止中は参照のみです。ご担当者の変更だけできます', 409);
      if (ch.length && (v.pinfo || v.pend)) throw new ApiError('承認待ちの変更があるため、承認後に直せます', 409);
      const stChanged = JSON.stringify(ck.staff) !== JSON.stringify(v.staff);
      if (!ch.length && !now.length && !stChanged) return { no: '', ch: 0, now: 0, st: false };
      const who = whoName(repo, a.acct, a.who, [a.id]);
      /* すぐ反映：従業員数・備考・FAX・ご担当者は拠点、1日上限数は今のサイクル以降の子契約、1ヶ月上限金額は corp-sites.app */
      const to = Object.fromEntries(now.map((it) => [it.k, it.to]));
      if (to.emp !== undefined || to.note !== undefined || to.fax !== undefined || stChanged) {
        domainOrg.actions.updateBranchNow(repo, {
          id: b.id, employees: to.emp !== undefined ? Number(to.emp) : undefined, note: to.note, fax: to.fax, contacts: stChanged ? contactRows(ck.staff) : undefined,
        });
      }
      if (to.day !== undefined) domainOrg.actions.setAppLimits(repo, { branchId: b.id, fromCycle: NOW_CYC, dailyCapMeals: Number(to.day) });
      if (to.month !== undefined) repo.put(K.app, b.id, { id: b.id, month: to.month });
      /* ゲストモード：保存した時点で使える／止まる。料金は締切ルールの最初の月から（台帳 2026/10/03） */
      if (to.guest !== undefined) domainOrg.actions.setGuest(repo, { branchId: b.id, on: to.guest === '利用する', nowCycle: NOW_CYC, feeFrom: cycOfJa(firstCycle(today()).v), by: accountOf(a.acct) });
      /* 承認が必要：拠点情報の変更の申請（承認したら共通データの拠点・契約・子契約が直る） */
      let no = '';
      if (ch.length) {
        const applicant = `${who}（${acctName(a.acct.role)}）`;
        const head = ch.map((it) => `${it.label}「${it.from || '（空欄）'}」→「${it.to || '（空欄）'}」`).join('　');
        const request: [string, string][] = [['変更したいこと', ch.map((it) => it.label).join('・')], ['申請内容', head], ['受付', `法人Web（拠点詳細の「編集」）・${nowStamp()}`]];
        const app = domainApply.actions.submitChange(repo, {
          kind: '拠点情報の変更', corpId: a.acct.corpId, branchIds: [b.id], accountId: accountOf(a.acct), name: applicant,
          startCycle: cycOfJa(firstCycle(today()).v), request, edits: fieldsToEdits(Object.fromEntries(ch.map((it) => [it.k, it.to]))),
        });
        no = app.id;
      }
      return { no, ch: ch.length, now: now.length, st: stChanged };
    },

    /** 月ごとのご契約の配送備考（すぐ反映）。scope＝このサイクルだけ／このサイクル以降すべて（以降すべては拠点の納品の条件も直す） */
    saveKid: (repo: DocRepo, a: { acct: Acct; id: string; kid: string; memo: string; scope: 'only' | 'after'; who: string }) => {
      const { b, v } = mustSite(repo, a.acct, a.id);
      const k = v.kids.find((y) => y.id === a.kid);
      if (!k) throw new ApiError('月ごとのご契約が見つかりません', 404);
      whoName(repo, a.acct, a.who, [a.id]);
      const targets = a.scope === 'after' ? v.kids.filter((y) => y.cyc >= k.cyc).map((y) => y.id) : [k.id];
      for (const id of targets) repo.put<Kover>(K.kover, id, { id, memo: a.memo, at: today(), scope: a.scope });
      if (a.scope === 'after') domainOrg.actions.updateReceive(repo, { id: b.id, receiveWindows: b.receiveWindows, deliveryNote: a.memo });
      return { n: targets.length };
    },

    /** 法人情報の編集の保存。請求書に載る住所・電話・FAX は法人情報の変更の申請にする */
    /** ご注文のリマインド（締切の7日前・3日前のお知らせ）の入り切り（法人アカウントだけ・承認なし） */
    setOrderReminder: (repo: DocRepo, a: { acct: Acct; on: boolean }) => {
      if (a.acct.role === 'branch') throw new ApiError('法人情報は法人アカウントだけが直せます', 403);
      domainOrg.actions.setOrderReminder(repo, { id: a.acct.corpId, on: a.on });
      return { on: !!a.on };
    },
    saveCorp: (repo: DocRepo, a: { acct: Acct; d: Record<string, string>; staff: StaffRow[]; who: string }) => {
      if (a.acct.role === 'branch') throw new ApiError('法人情報は法人アカウントだけが直せます', 403);
      const c = mustCorp(repo, a.acct.corpId);
      const ck = rvCheck(CFIELDS, a.d, a.staff);
      if (ck.list.length) throw new ApiError('入力内容に誤りがあります（' + ck.list.length + '件）。' + ck.list[0].label + '：' + ck.list[0].msg, 400);
      const se = staffError(ck.staff);
      if (se) throw new ApiError(se, 400);
      const { ch, now } = splitChanges(CFIELDS, ck.d, (k) => c.d[k] ?? '');
      if (ch.length && cpendOf(repo, a.acct.corpId, c.d)) throw new ApiError('承認待ちの変更があるため、承認後に直せます', 409);
      const stChanged = JSON.stringify(ck.staff) !== JSON.stringify(c.staff);
      if (!ch.length && !now.length && !stChanged) return { no: '', ch: 0, now: 0, st: false };
      const who = whoName(repo, a.acct, a.who, []);
      if (now.length || stChanged) {
        const to = Object.fromEntries(now.map((it) => [it.k, it.to]));
        domainOrg.actions.updateCorpNow(repo, { id: a.acct.corpId, name: to.name, contractName: to.cname, kana: to.kana, billToName: to.bname, contacts: stChanged ? contactRows(ck.staff) : undefined });
      }
      let no = '';
      if (ch.length) {
        const applicant = `${who}（${acctName(a.acct.role)}）`;
        const head = ch.map((it) => it.label).join('・') + 'の変更（請求書に載る）';
        const request: [string, string][] = [['変更したいこと', ch.map((it) => it.label).join('・')], ['申請内容', head], ['受付', `法人Web（法人情報の「編集」）・${nowStamp()}`]];
        const app = domainApply.actions.submitChange(repo, {
          kind: '法人情報の変更', corpId: a.acct.corpId, branchIds: [], accountId: accountOf(a.acct), name: applicant, startCycle: '', request,
          edits: fieldsToEdits(Object.fromEntries(ch.map((it) => [it.k, it.to]))),
        });
        no = app.id;
      }
      return { no, ch: ch.length, now: now.length, st: stChanged };
    },

    /** 申請の取り下げ（2026/10/01 決定 H2：拠点アカウントは法人アカウントが出した申請を取り下げられない） */
    withdraw: (repo: DocRepo, a: { acct: Acct; no: string; site?: string }) => {
      const before = repo.get<Application>('dm.apply.applications', a.no);
      if (!before || before.corpId !== a.acct.corpId) throw new ApiError('この申請は取り下げられません', 403);
      /* 拠点アカウントは自分の拠点の分だけ。法人アカウントは拠点を選べる（法人情報の変更は法人の分） */
      const branchId = before.type !== 'change' ? undefined : a.acct.role === 'branch' ? a.acct.branchId : a.site && a.site !== a.acct.corpId ? a.site : undefined;
      if (branchId && !branchesOf(repo, a.acct).some((b) => b.id === branchId)) throw new ApiError('この拠点は見られません', 404);
      const next = domainApply.actions.withdraw(repo, { id: a.no, accountId: accountOf(a.acct), corpId: a.acct.corpId, branchId });
      const n = before.type === 'new' ? 1 : next.results.filter((x, i) => x.result === 'wd' && before.results[i]?.result === '').length;
      return { n };
    },

    /** 申請に資料を足す／差し替える（同じファイル名は差し替え）。運営への知らせは画面のお知らせだけ（メールなし） */
    addAttachment: (repo: DocRepo, a: { acct: Acct; no: string; name: string; size: number }) => {
      const app = mustApp(repo, a.acct, a.no);
      const name = String(a.name ?? '').trim();
      if (!name) throw new ApiError('ファイルをお選びください', 400);
      if (!(a.size > 0) || a.size > ATTACH_MAX_SIZE) throw new ApiError('ファイルは1つ5MBまで、10件までです。', 400);
      const cur = repo.get<{ files: AttachFile[] }>('corp-sites.attach', a.no)?.files ?? [];
      const rest = cur.filter((x) => x.name !== name);
      if (rest.length >= ATTACH_MAX_COUNT) throw new ApiError('ファイルは1つ5MBまで、10件までです。', 400);
      const by = a.acct.role === 'branch' ? '拠点アカウント' : '法人アカウント';
      repo.put('corp-sites.attach', a.no, { files: [...rest, { name, size: a.size, at: nowStamp(), by }] });
      notify(repo, {
        to: { site: 'ops', accountId: '', role: 'ops.sales' }, channels: ['site'], templateId: '',
        title: `申請に資料が${cur.length > rest.length ? '差し替え' : '追加'}されました（${a.no}）`, body: `${app.companyName}：${name}（${by}）`, link: { type: 'application', id: a.no },
      });
      return { n: rest.length + 1 };
    },
    removeAttachment: (repo: DocRepo, a: { acct: Acct; no: string; name: string }) => {
      const app = mustApp(repo, a.acct, a.no);
      const cur = repo.get<{ files: AttachFile[] }>('corp-sites.attach', a.no)?.files ?? [];
      if (!cur.some((x) => x.name === a.name)) throw new ApiError('このファイルは見つかりません', 404);
      repo.put('corp-sites.attach', a.no, { files: cur.filter((x) => x.name !== a.name) });
      notify(repo, {
        to: { site: 'ops', accountId: '', role: 'ops.sales' }, channels: ['site'], templateId: '',
        title: `申請の資料が削除されました（${a.no}）`, body: `${app.companyName}：${a.name}`, link: { type: 'application', id: a.no },
      });
      return { n: cur.length - 1 };
    },

    /** パスワード再設定（メイン担当者に認証コードの案内を送る） */
    pwReset: (repo: DocRepo, a: { acct: Acct; id: string }) => {
      mustSite(repo, a.acct, a.id);
      return { at: nowStamp() };
    },

    /**
     * 変更のお申し込み（申込フォームの変更のお申し込み）。1回のお申し込みで1種類・拠点ごとに承認。
     * 開始サイクル月・変更の中身が同じ拠点は1件の申請にまとめる（違うときは申請を分ける。受付番号は「・」でつなぐ）
     */
    apply: (repo: DocRepo, a: { acct: Acct; kind: ChKind; sites: string[]; vals: Record<string, Record<string, string>>; who: string }) => {
      const ki = kindOf(a.kind);
      if (!ki) throw new ApiError('お手続きが見つかりません', 404);
      if (ki.corp && a.acct.role === 'branch') throw new ApiError('法人情報の変更は法人アカウントだけが申し込めます', 403);
      const d = today(), corp = mustCorp(repo, a.acct.corpId);
      const kind = ki.t as ChangeKind;
      const who = whoName(repo, a.acct, a.who, a.sites);
      const applicant = `${who}（${acctName(a.acct.role)}）`;
      const first = a.vals[a.sites[0] ?? a.acct.corpId] ?? {};
      const baseReq: [string, string][] = [['変更したいこと', ki.t], ...chSummary(a.kind, null, first).filter(([l]) => !/^(いまのプラン)$/.test(l))];

      if (ki.corp) {
        if (cpendOf(repo, a.acct.corpId, corp.d)) throw new ApiError('法人情報の承認待ちの変更があるため、お申し込みできません', 409);
        const v = a.vals[a.acct.corpId] ?? {};
        const e = chErrors('cop', null, v, d);
        if (Object.keys(e).length) throw new ApiError('未入力の項目があります（' + Object.values(e)[0] + '）', 400);
        const f: Record<string, string> = {};
        if (/住所/.test(v.what || '')) Object.assign(f, { zip: v.zip, pref: v.pref, city: v.city, a1: v.addr1, a2: v.addr2 });
        if (/電話番号/.test(v.what || '')) Object.assign(f, { tel: v.tel, fax: v.fax });
        const fields = Object.fromEntries(Object.entries(f).filter(([, x]) => x !== undefined && x !== ''));
        const head = (v.what || '') + 'の変更（請求書に載る）';
        const request: [string, string][] = [...baseReq, ['申請内容', head]];
        const app = domainApply.actions.submitChange(repo, { kind, corpId: a.acct.corpId, branchIds: [], accountId: accountOf(a.acct), name: applicant, startCycle: '', request, edits: fieldsToEdits(fields) });
        return { no: app.id, n: 1, who };
      }

      if (!a.sites.length) throw new ApiError('拠点を1つ以上お選びください', 400);
      /* 先に全部の拠点を確かめる（途中で止まって一部だけ申請にならないように） */
      const groups = new Map<string, { start: string; change: Application['change']; edits?: InfoEdits; sites: { v: SiteView; what: string }[] }>();
      for (const id of a.sites) {
        const { v } = mustSite(repo, a.acct, id);
        const b = chSite(v), val = a.vals[id] ?? {};
        const why = canApply(a.kind, v);
        if (why) throw new ApiError(`${v.name}：${why}`, 409);
        if (a.kind === 'chg' && val.plan === b.plan) throw new ApiError(`${v.name}：いまのプランは選べません`, 400);
        const e = chErrors(a.kind, b, val, d);
        if (Object.keys(e).length) throw new ApiError(`${v.name}：未入力の項目があります（${Object.values(e)[0]}）`, 400);
        const c = changeOf(repo, a.kind, v, val);
        if (!c.start) throw new ApiError(`${v.name}：開始するご利用月を選んでください`, 400);
        if (a.kind === 'chg' && !c.change.planId) throw new ApiError(`${v.name}：変更後のプランが見つかりません`, 400);
        const what = chWhat(a.kind, b, val);
        const key = JSON.stringify([c.start, c.change, c.edits ?? null]);
        const g = groups.get(key) ?? { start: c.start, change: c.change, edits: c.edits, sites: [] };
        g.sites.push({ v, what });
        groups.set(key, g);
      }
      const nos: string[] = [];
      for (const g of groups.values()) {
        const request: [string, string][] = [...baseReq, ['申請内容', [...new Set(g.sites.map((s) => s.what))].join('／')]];
        const app = domainApply.actions.submitChange(repo, {
          kind, corpId: a.acct.corpId, branchIds: g.sites.map((s) => s.v.id), accountId: accountOf(a.acct), name: applicant, startCycle: g.start, request, change: g.change,
          ...(g.edits ? { edits: g.edits } : {}),
        });
        nos.push(app.id);
      }
      return { no: nos.join('・'), n: a.sites.length, who };
    },

    /** 拠点を追加（法人アカウントだけ・RV-CORP-20261002 C-b）。共通データの新規申込（受付中）が1件でき、運営Web の新規契約タブにも出る（運営Web も共通データを読む） */
    addSite: (repo: DocRepo, a: { acct: Acct; f: Record<string, string>; who: string }) => {
      if (a.acct.role === 'branch') throw new ApiError('拠点の追加は法人アカウントだけができます', 403);
      const f = a.f, need: [string, string][] = [['name', '拠点名'], ['kana', '拠点名フリガナ'], ['zip', '郵便番号'], ['pref', '都道府県'], ['city', '市区町村'], ['a1', '町名・番地'], ['tel', '電話番号'], ['emp', '従業員数'], ['plan', 'プラン'], ['ship', '配送方法'], ['cyc', '開始したいご利用月'], ['bill', '請求書'], ['sname', 'ご担当者のお名前'], ['smail', 'ご担当者のメールアドレス']];
      const miss = need.filter(([k]) => !String(f[k] ?? '').trim());
      if (miss.length) throw new ApiError(`未入力の項目があります（${miss.length}件）。${miss[0][1]}をご入力ください。`, 400);
      const ck = rvCheck({ kana: FIELDS.kana, zip: FIELDS.zip, tel: FIELDS.tel, emp: FIELDS.emp }, { kana: f.kana, zip: f.zip, tel: f.tel, emp: f.emp }, []);
      if (ck.list.length) throw new ApiError(ck.list[0].msg, 400);
      const start = cycOfJa(f.cyc);
      if (!start) throw new ApiError('開始したいご利用月をお選びください', 400);
      const corp = mustCorp(repo, a.acct.corpId);
      const who = whoName(repo, a.acct, a.who, []);
      const name = f.name.trim(), plan = f.plan.replace(/（.*$/, '');
      const app = domainApply.actions.submitNew(repo, {
        kubun: '本導入', companyName: corp.name, corpId: a.acct.corpId, branchNames: [name], startCycle: start, name: `${who}（法人アカウント）`, accountId: a.acct.corpId,
        request: [
          ['拠点', `${name}（新しい拠点）`], ['申請内容', [plan, f.ship].filter(Boolean).join('・')], ['プラン', f.plan], ['配送', f.ship], ['設備', f.eq || '冷蔵庫'],
          ['住所', `〒${f.zip} ${f.pref}${f.city}${f.a1}${f.a2 ? ' ' + f.a2 : ''}`], ['電話番号', f.tel], ['従業員数', f.emp], ['請求書', f.bill], ['ご担当者', `${f.sname}（${f.smail}）`],
        ],
      });
      return { no: app.id };
    },
  },
});

