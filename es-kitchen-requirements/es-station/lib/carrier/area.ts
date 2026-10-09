import { ApiError } from '@/lib/api/errors';
import { defineArea, type DocRepo } from '@/lib/ops/core/area';
import { nowStamp } from '@/lib/supplier/dates';
import domainDelivery from '@/lib/domain/areas/delivery';
import { issueResetCode } from '@/lib/domain/driverAuth';
import master from '@/lib/domain/areas/master';
import domainCarrier from '@/lib/domain/areas/carrier';
import report from '@/lib/domain/areas/report';
import notice from '@/lib/domain/areas/notice';
import account, { log } from '@/lib/domain/areas/account';
import type { Account, Delivery, Driver } from '@/lib/domain/types';
import { checkQuoteAnswer, checkStaff, dAssignable, issueNg, staffBlock, sumRows, type Errors } from './logic';
import { profiles } from './seed';
import {
  answerFor, carrierName, carrierOf, coolersOf, deliveryViews, foodsOf, newsBody, newsItems, partOf, quoteViews, STAFF_EXT, staffHist, staffList, troubleViews,
} from './fromDomain';
import type { AltInfo, ApplyForm, ApplyForm2, Profile, ProfileRequest, QuoteAnswerInput, Staff, StaffDraft, StaffExt } from './types';

/*
 * 委託配送先Web の領域（30_委託配送先_まとめ.html の画面のデータ）。
 * データは共通データ（lib/domain・dm.*）：自社の区間・配送・明細・トラブル（dm.delivery）、ドライバー（dm.master.drivers）と
 *   そのアカウント（dm.account）、保冷バッグ・見積（dm.carrier）、集金・駐車場代（dm.report）、お知らせ・通知（dm.notice）。
 *   画面の形は lib/carrier/fromDomain.ts で作る。割り当て・見積の回答・ドライバーの登録と変更は共通データの action を呼ぶ。
 * 自分の kind（carrier.*）は共通データにないものだけ：
 *   carrier.staff（雇用形態・削除）、carrier.profiles（住所・担当者・車両など）・carrier.profileRequests（変更申請）・carrier.applications（申し込み）
 * どの query / action も company（委託配送会社ID＝ログインID）を受け取り、その会社のデータだけを返す・書く。
 */

const K = { staff: STAFF_EXT, profile: 'carrier.profiles', profReq: 'carrier.profileRequests', apply: 'carrier.applications' } as const;

type C = { company: string };
const fail = (errors: Errors) => { if (Object.keys(errors).length) throw new ApiError(Object.values(errors)[0], 400); };

/** プロフィール（会社名・種別・対応エリアは委託配送会社のマスタ、ほかは carrier.profiles） */
function profileOf(repo: DocRepo, company: string): Profile {
  const m = carrierOf(repo, company);
  const p = repo.get<Omit<Profile, 'name' | 'kind' | 'masterArea'>>(K.profile, company);
  return {
    company, name: m?.name ?? company, kind: m?.kind ?? '', masterArea: m?.areas.join('・') ?? '',
    kana: '', zip: '', pref: '', city: '', addr: '', bld: '', tel: '', fax: '', contacts: [],
    areas: [], ngDays: [], areaNote: '', cars: [], frz: '不要', ref: '不要', sp: 'あり', carNote: '',
    ...(p ?? {}),
  };
}

/** 自社のスタッフ（なければ 404） */
function staffOf(repo: DocRepo, company: string, id: string) {
  const s = staffList(repo, company).find((x) => x.id === id);
  if (!s) throw new ApiError('配送スタッフが見つかりません', 404);
  return s;
}
/** 雇用形態・削除（共通データにない値）を書く */
const writeExt = (repo: DocRepo, company: string, id: string, patch: Partial<StaffExt>) =>
  repo.put<StaffExt>(K.staff, id, { ...(repo.get<StaffExt>(K.staff, id) ?? {}), ...patch, id, company });

export default defineArea({
  name: 'carrier',
  /* 共通データにないプロフィールの詳細だけ見本を持つ */
  seed: () => ({ [K.profile]: profiles().map((p) => ({ id: p.company, data: p })) }),

  queries: {
    /** 枠のヘッダーの会社名 */
    company: (repo, a: C) => ({ id: a.company, name: carrierName(repo, a.company) }),

    /** ホーム：カレンダーの配送・お知らせ・未回答の見積もり依頼（＋通知・ドライバーが決まっていない区間） */
    home: (repo, a: C) => ({
      deliveries: deliveryViews(repo, a.company),
      news: newsItems(repo),
      quotes: quoteViews(repo, a.company).filter((q) => q.st === '未回答'),
      inbox: notice.queries.inbox(repo, { accountId: a.company }),
      alerts: domainCarrier.queries.alerts(repo, { carrierId: a.company }).filter((x) => x.level),
    }),
    /** お知らせ詳細（代替品のお知らせは共通データにないので出さない） */
    news: (repo, a: { id: number }) => {
      const n = newsBody(repo, Number(a.id));
      return n ? { item: n.item, body: n.body, alt: null as AltInfo | null } : null;
    },

    /** 配送の一覧（スケジュール・配送管理・集金）と配送スタッフ */
    deliveries: (repo, a: C) => ({ deliveries: deliveryViews(repo, a.company), staff: staffList(repo, a.company) }),
    /** 配送詳細 */
    delivery: (repo, a: C & { no: string }) => {
      const all = deliveryViews(repo, a.company);
      const d = all.find((x) => x.no === a.no) ?? null;
      if (!d) return null;
      const dm = repo.get<Delivery>('dm.delivery.deliveries', d.deliveryId!)!;
      return {
        d, all, staff: staffList(repo, a.company), troubles: troubleViews(repo, a.company, all).filter((t) => t.no === a.no),
        part: partOf(repo, dm), foods: foodsOf(repo, dm.id), alt: null as AltInfo | null, company: carrierName(repo, a.company),
      };
    },
    /** トラブル一覧 */
    troubles: (repo, a: C) => {
      const deliveries = deliveryViews(repo, a.company);
      return { troubles: troubleViews(repo, a.company, deliveries), deliveries, staff: staffList(repo, a.company) };
    },

    /** 見積依頼の一覧 */
    quotes: (repo, a: C) => quoteViews(repo, a.company),
    /** 見積依頼（詳細・回答） */
    quote: (repo, a: C & { id: string }) => {
      const q = quoteViews(repo, a.company).find((x) => x.id === a.id);
      return q ? { q, answer: answerFor(q), company: carrierName(repo, a.company) } : null;
    },

    /** 配送スタッフ一覧 */
    staff: (repo, a: C) => {
      const staff = staffList(repo, a.company), dels = deliveryViews(repo, a.company), cb = coolersOf(repo, a.company);
      // 削除できない理由（担当中の配送・貸与中の保冷バッグ）
      const blocks = Object.fromEntries(staff.map((s) => [s.id, staffBlock(s.id, dels, cb)]));
      return { staff, blocks, company: carrierName(repo, a.company) };
    },
    /** 配送スタッフ詳細（担当配送・変更履歴） */
    staffDetail: (repo, a: C & { id: string }) => {
      const s = staffList(repo, a.company).find((x) => x.id === a.id);
      if (!s) return null;
      const dels = deliveryViews(repo, a.company);
      return {
        s, company: carrierName(repo, a.company), deliveries: dels.filter((d) => d.staff === s.id),
        hist: staffHist(repo, s.id), block: staffBlock(s.id, dels, coolersOf(repo, a.company)),
      };
    },

    /** プロフィール（委託配送会社のマスタ＋詳細）・承認待ちの変更申請・保冷バッグ */
    profile: (repo, a: C) => ({
      profile: profileOf(repo, a.company),
      pending: repo.get<ProfileRequest>(K.profReq, a.company) ?? null,
      coolers: coolersOf(repo, a.company),
    }),

    /** 駐車場代の報告（自社のドライバーの分） */
    parking: (repo, a: C) => report.queries.parking(repo, { carrierId: a.company }),
  },

  actions: {
    /** 配送スタッフを割り当てる（配送詳細の確定・一覧の一括設定）。rs＝出荷指示の送信後（出荷待）に変えた件数 */
    assignStaff: (repo, a: C & { nos: string[]; staff: string }) => {
      const staff = staffList(repo, a.company).find((s) => s.id === a.staff);
      if (!staff) throw new ApiError('配送スタッフを選択してください', 400);
      if (staff.st !== '有効' || staff.del) throw new ApiError('ステータスが「有効」の配送スタッフのみ選択できます。', 400);
      if (!a.nos?.length) throw new ApiError('配送を選択してください', 400);
      const views = deliveryViews(repo, a.company), comp = carrierName(repo, a.company);
      const targets = a.nos.map((no) => {
        const v = views.find((x) => x.no === no);
        if (!v) throw new ApiError(`配送 ${no} が見つかりません`, 404);
        if (!dAssignable(v)) throw new ApiError(`${no}：この状態では配送スタッフを変更できません`, 409);
        return v;
      });
      let rs = 0;
      for (const v of targets) {
        if (v.staff === staff.id) continue;
        if (v.staff && v.st === '出荷待') rs++;
        domainDelivery.actions.assignDriver(repo, { legId: v.legId!, driverId: staff.id, carrierId: a.company });
        log(repo, a.company, 'ドライバー割り当て', staff.id, `${v.deliveryId} ${v.leg}`);
      }
      return { n: targets.length, rs, name: staff.name };
    },

    /** 見積の回答（承認＝金額と開始日・NG＝辞退。金額再確認の回答もいまの回答を書き直す） */
    answerQuote: (repo, a: QuoteAnswerInput) => {
      fail(checkQuoteAnswer(a));
      const q = quoteViews(repo, a.company).find((x) => x.id === a.id);
      if (!q) throw new ApiError('見積依頼が見つかりません', 404);
      if (q.st === '対応不可' || q.st === '期限切れ') throw new ApiError('この見積依頼には回答できません', 409);
      const weekdays = carrierOf(repo, a.company)?.weekdays || '月〜土';
      if (a.mode === 'ng') {
        domainCarrier.actions.answerQuote(repo, { id: q.id, carrierId: a.company, decline: true, note: [a.ng, a.ngc?.trim()].filter(Boolean).join('：') });
        return { msg: 'NG回答を送信しました', st: '対応不可' as const, total: 0 };
      }
      const prev = q.answer?.type === 'ok' ? sumRows(q.answer.rows ?? []) : 0;
      const total = a.mode === 'ok' ? sumRows(a.rows) : a.mode === 'change' ? Number(a.newAmt) : prev;
      const note = a.mode === 'ok' ? a.cm ?? '' : a.mode === 'change' ? a.chg ?? '' : q.answer?.comment ?? '';
      domainCarrier.actions.answerQuote(repo, {
        id: q.id, carrierId: a.company, feeYen: total, weekdays, note,
        startCycle: a.mode === 'ok' && a.sd ? a.sd.slice(0, 7) : undefined,
      });
      return { msg: a.mode === 'ok' ? '回答を送信しました' : '再確認の回答を送信しました', st: '回答済' as const, total };
    },

    /** 配送スタッフの保存（基本情報。氏名・カナ・電話・メール・状態は共通データのドライバー） */
    saveStaff: (repo, a: C & { id: string; draft: StaffDraft }) => {
      fail(checkStaff(a.draft, !!a.draft.lic));
      const s = staffOf(repo, a.company, a.id);
      if (s.del) throw new ApiError('配送スタッフが見つかりません', 404);
      const next = { name: a.draft.name.trim(), kana: a.draft.kana.trim(), kbn: a.draft.kbn, st: a.draft.st, tel: a.draft.tel ?? '', email: a.draft.email.trim() };
      const ch = (Object.keys(next) as (keyof typeof next)[]).filter((k) => (next[k] || '') !== (s[k] || ''));
      master.actions.updateDriver(repo, { id: s.id, carrierId: a.company, name: next.name, kana: next.kana, tel: next.tel, email: next.email, status: next.st as Driver['status'] });
      writeExt(repo, a.company, s.id, { kbn: next.kbn as Staff['kbn'] });
      if (ch.length) log(repo, a.company, '基本情報を更新', s.id, `${ch.length}項目`);
      return { ok: true };
    },

    /** 配送スタッフの登録（共通データのドライバーを足す。ID は DR＋5桁の続き番号） */
    createStaff: (repo, a: C & { draft: StaffDraft }) => {
      fail(checkStaff(a.draft, !!a.draft.lic));
      const c = carrierOf(repo, a.company);
      if (!c) throw new ApiError('委託配送会社が見つかりません', 404);
      const d = master.actions.addDriver(repo, {
        carrierId: c.id, name: a.draft.name.trim(), kana: a.draft.kana.trim(), tel: a.draft.tel ?? '', email: a.draft.email.trim(), employment: 'partner', areas: c.areas,
      });
      if (a.draft.st && a.draft.st !== '有効') master.actions.setDriverStatus(repo, { id: d.id, status: a.draft.st as Driver['status'], carrierId: c.id });
      writeExt(repo, a.company, d.id, { kbn: a.draft.kbn as Staff['kbn'] });
      log(repo, a.company, 'データ登録', d.id, d.name);
      return { id: d.id };
    },

    /** 配送スタッフの削除（ドライバーを無効・アカウントを削除済に。担当中の配送・貸与中の保冷バッグがあると削除できない） */
    deleteStaff: (repo, a: C & { id: string }) => {
      const s = staffOf(repo, a.company, a.id);
      if (staffBlock(s.id, deliveryViews(repo, a.company), coolersOf(repo, a.company))) throw new ApiError('担当中の配送・貸与中の保冷バッグがあるため削除できません', 409);
      master.actions.setDriverStatus(repo, { id: s.id, status: '無効', carrierId: a.company });
      if (repo.get<Account>('dm.account.accounts', s.id)) account.actions.setStatus(repo, { id: s.id, status: '削除済', by: a.company });
      writeExt(repo, a.company, s.id, { del: true });
      log(repo, a.company, 'スタッフを削除', s.id, s.name);
      return { name: s.name };
    },

    /** アカウント一括発行（有効でメールのある人だけ。ドライバーのアカウント＝ドライバーID） */
    issueAccounts: (repo, a: C & { ids: string[] }) => {
      const rows = staffList(repo, a.company).filter((s) => a.ids.includes(s.id));
      const ok = rows.filter((s) => !issueNg(s));
      for (const s of ok.filter((x) => x.acct === '未発行')) {
        const acc = repo.get<Account>('dm.account.accounts', s.id);
        if (acc) account.actions.setStatus(repo, { id: s.id, status: '発行済（ログイン前）', by: a.company });
        else account.actions.create(repo, { account: { id: s.id, site: 'driver', loginId: s.id, name: s.name, email: s.email, roleIds: ['driver.driver'], scope: { type: 'driver', driverId: s.id, carrierId: a.company } }, by: a.company });
      }
      return { ok: ok.length, fail: rows.length - ok.length };
    },

    /** 自社の配送スタッフのパスワード再設定の代行（4桁の認証コードを登録メールへ。メールは仮・2026/10/03） */
    resetStaffPassword: (repo, a: C & { id: string }) => issueResetCode(repo, { loginId: a.id, by: a.company, carrierId: a.company }),

    /** プロフィールの変更を申請（運営の承認後に反映） */
    requestProfile: (repo, a: C & { draft: Partial<Profile> }) => {
      if (repo.get(K.profReq, a.company)) throw new ApiError('承認待ちの申請があります', 409);
      repo.put<ProfileRequest>(K.profReq, a.company, { company: a.company, at: nowStamp(), draft: a.draft ?? {} });
      return { ok: true };
    },
    withdrawProfile: (repo, a: C) => {
      repo.remove(K.profReq, a.company);
      return { ok: true };
    },

    /** 申し込み（ログイン前のお申し込みフォーム） */
    apply: (repo, a: { form1: ApplyForm; form2: ApplyForm2 }) => {
      if (!a.form1?.name || !a.form2?.agree) throw new ApiError('必須の項目を入力してください', 400);
      const id = 'CA' + String(repo.nextSeq('carrier.apply')).padStart(5, '0');
      repo.put(K.apply, id, { id, at: nowStamp(), ...a });
      return { id };
    },
  },
});
