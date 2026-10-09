import { ApiError } from '@/lib/api/errors';
import { defineArea, toDocs, type DocRepo } from '@/lib/ops/core/area';
import { FEE_PLANS, PAYMENTS, REFERRALS } from '../seed/referral';
import type { Agency, Contract, Corp, FeePayment, FeePlan, Referral } from '../types';
import { refEnd } from '@/lib/ops/general/logic';

/*
 * 代理店・紹介フィー（area: referral）。kind：dm.referral.feePlans／dm.referral.referrals／dm.referral.payments。
 * 代理店そのものは org.agencies（親契約の agencyId が指す。見本はこの領域の seed/referral.ts）。
 *   紹介の紹介元＝親契約の agencyId（代理店）か、紹介の srcCorpId（紹介元の法人）。親契約に紹介は1つ。
 *   saveAgency    代理店の登録・保存（新規は AG＋5桁を採番・履歴を残す）
 *   deleteAgency  代理店の削除（紹介がある・親契約が指していると 409。削除済にして残す）
 *   saveFeePlan   紹介フィーマスタの登録・保存（新規は RFP＋6桁）。返り値＝適用済みの紹介の数
 *   deleteFeePlan 紹介フィーマスタの削除（代理店・紹介で使っていると 409。削除済にして残す）
 *   saveReferral  紹介の保存（フィープラン・条件の写し・支払い開始年月・終了予定月・状態・備考。履歴を残す）
 *   savePayment   支払の保存（支払状況・支払日・備考・行ごとの調整額。履歴を残す）
 * 画面の入力チェック・状態の計算（lib/ops/general/logic.ts）は運営の画面と同じものを呼ぶ側で使う。ここは ID・つながりを確かめて書く。
 */

const K = { plans: 'dm.referral.feePlans', refs: 'dm.referral.referrals', pays: 'dm.referral.payments', agencies: 'dm.org.agencies' } as const;
type Hist = { at: string; what: string; by: string };

const plans = (r: DocRepo) => r.list<FeePlan>(K.plans);
const agencies = (r: DocRepo) => r.list<Agency>(K.agencies);
const referrals = (r: DocRepo) => r.list<Referral>(K.refs);

/** 紹介の紹介元（代理店は親契約の agencyId、法人は srcCorpId） */
export function referralSource(r: DocRepo, x: Referral): { type: '代理店' | '法人'; id: string } | null {
  const c = r.get<Contract>('dm.org.contracts', x.contractId);
  if (c?.agencyId) return { type: '代理店', id: c.agencyId };
  return x.srcCorpId ? { type: '法人', id: x.srcCorpId } : null;
}

/** 代理店コードに指定できる代理店か（あって、有効なものだけ。「無効」「削除済」は新しく指定できない：受付簿 #400） */
export function assertAgencyUsable(r: DocRepo, id: string) {
  const a = r.get<Agency>(K.agencies, id);
  if (!a) throw new ApiError(`代理店が見つかりません（${id}）`, 404);
  if (a.status !== '有効') throw new ApiError(`${a.status}の代理店は指定できません（${id}）。有効な代理店を選んでください`, 409);
}

const nextRefId = (r: DocRepo) => 'REF' + String(Math.max(0, ...referrals(r).map((x) => Number(x.id.slice(3)) || 0)) + 1).padStart(6, '0');

/**
 * 親契約の紹介元を決める（受付・承認と、紹介履歴の手での登録で共通）。agencyId＝代理店（親契約の代理店コード）、srcCorpId＝紹介元の法人（企業紹介：紹介を1つ作る）。
 * どちらも空＝紹介なし。紹介元を変えるとき、すでに支払がある紹介は外せない（紹介を中止する）
 */
export function setContractSource(r: DocRepo, a: { contractId: string; agencyId: string; srcCorpId: string; payStart?: string; note?: string; by: string; at: string }) {
  const c = r.get<Contract>('dm.org.contracts', a.contractId);
  if (!c) throw new ApiError(`親契約が見つかりません（${a.contractId}）`, 404);
  if (a.agencyId && a.srcCorpId) throw new ApiError('紹介元は代理店か法人のどちらか一方です', 400);
  if (a.agencyId && a.agencyId !== c.agencyId) assertAgencyUsable(r, a.agencyId);
  if (a.srcCorpId && !r.get<Corp>('dm.org.corps', a.srcCorpId)) throw new ApiError(`紹介元の法人が見つかりません（${a.srcCorpId}）`, 404);
  const x = referrals(r).find((y) => y.contractId === a.contractId);
  if (x && x.srcCorpId && x.srcCorpId !== a.srcCorpId && r.list<FeePayment>(K.pays).some((p) => p.lines.some((l) => l.referralId === x.id))) throw new ApiError('支払履歴のある紹介元は変えられません。紹介を中止してください', 409);
  if (c.agencyId !== a.agencyId) r.put<Contract>('dm.org.contracts', c.id, { ...c, agencyId: a.agencyId });
  if (!a.srcCorpId) {
    if (x?.srcCorpId) { if (x.status === '中止' || r.list<FeePayment>(K.pays).some((p) => p.lines.some((l) => l.referralId === x.id))) r.put<Referral>(K.refs, x.id, { ...x, srcCorpId: '' }); else r.remove(K.refs, x.id); }
    return;
  }
  if (x) { if (x.srcCorpId !== a.srcCorpId) r.put<Referral>(K.refs, x.id, { ...x, srcCorpId: a.srcCorpId, history: [{ at: a.at, what: '紹介元の法人を変更', by: a.by }, ...x.history] }); return; }
  /* 企業紹介（紹介元＝法人）：標準は「紹介元区分＝法人」の有効なプラン（A：企業紹介）。支払い開始は親契約の開始月 */
  const plan = r.list<FeePlan>(K.plans).find((p) => p.src === '法人' && p.status === '有効');
  if (!plan) throw new ApiError('紹介元区分が「法人」の有効な紹介フィープランがありません。紹介フィーマスタを確認してください', 409);
  const cond = { pay: plan.pay, months: plan.months, calc: plan.calc, amount: plan.amount, rate: plan.rate, tiers: plan.tiers };
  const payStart = a.payStart ?? (c.status === '仮登録' ? '' : c.startCycle);
  const id = nextRefId(r);
  r.put<Referral>(K.refs, id, {
    id, contractId: c.id, srcCorpId: a.srcCorpId, feePlanId: plan.id, cond, payStart, status: c.status === '仮登録' ? '契約前' : '有効',
    endPlan: payStart ? refEnd(plan, payStart) : '', end: '', note: a.note ?? '', history: [{ at: a.at, what: '紹介履歴を登録（紹介元の法人）', by: a.by }],
  });
}

/** 本登録で親契約が有効になったとき、契約前の紹介を有効にする（支払い開始年月が空なら契約の開始月）。中止中の紹介は変えない */
export function activateReferral(r: DocRepo, a: { contractId: string; startCycle: string; at: string }) {
  const x = referrals(r).find((y) => y.contractId === a.contractId);
  if (!x || x.status !== '契約前') return;
  const payStart = x.payStart || a.startCycle;
  const endPlan = x.cond ? refEnd({ pay: x.cond.pay, months: x.cond.months }, payStart) : x.endPlan;
  r.put<Referral>(K.refs, x.id, { ...x, status: '有効', payStart, endPlan, history: [{ at: a.at, what: '親契約の本登録により有効にしました', by: 'システム' }, ...x.history] });
}

export default defineArea({
  name: 'referral',
  seed: () => ({
    [K.plans]: toDocs(FEE_PLANS),
    [K.refs]: toDocs(REFERRALS),
    [K.pays]: toDocs(PAYMENTS),
  }),
  queries: {
    feePlans: (r) => plans(r),
    agencies: (r) => agencies(r),
    referrals: (r) => referrals(r).map((x) => ({ ...x, source: referralSource(r, x) })),
    payments: (r) => r.list<FeePayment>(K.pays),
  },
  actions: {
    /** 代理店の登録・保存。新規は先頭に足す（運営の一覧の並び）。返り値＝代理店ID */
    saveAgency: (r, { agency, isNew, by, at }: { agency: Omit<Agency, 'history'>; isNew: boolean; by: string; at: string }) => {
      if (!r.get<FeePlan>(K.plans, agency.feePlanId)) throw new ApiError(`紹介フィープラン ${agency.feePlanId} がありません`, 400);
      if (isNew) {
        const all = agencies(r);
        const id = 'AG' + String(Math.max(0, ...all.map((a) => Number(a.id.slice(2)) || 0)) + 1).padStart(5, '0');
        const a: Agency = { ...agency, id, history: [{ at, what: '代理店を登録', by }] };
        all.forEach((x) => r.remove(K.agencies, x.id));
        [a, ...all].forEach((x) => r.put(K.agencies, x.id, x));
        return { id };
      }
      const old = r.get<Agency>(K.agencies, agency.id);
      if (!old) throw new ApiError('代理店が見つかりません', 404);
      r.put<Agency>(K.agencies, agency.id, { ...agency, history: [{ at, what: '代理店情報を更新', by }, ...old.history] });
      return { id: agency.id };
    },
    deleteAgency: (r, { id }: { id: string }) => {
      const a = r.get<Agency>(K.agencies, id);
      if (!a) throw new ApiError('代理店が見つかりません', 404);
      if (r.list<Contract>('dm.org.contracts').some((c) => c.agencyId === id)) throw new ApiError('紹介履歴がある代理店は削除できません。ステータスを「無効」にしてください', 409);
      r.put<Agency>(K.agencies, id, { ...a, status: '削除済' });
    },
    /** 紹介フィーマスタの登録・保存。返り値＝ID・この紹介フィーを使っている紹介の数 */
    saveFeePlan: (r, { plan, isNew, by, at }: { plan: Omit<FeePlan, 'id'> & { id?: string }; isNew: boolean; by?: string; at?: string }) => {
      if (isNew) {
        const id = 'RFP' + String(plans(r).length + 1).padStart(6, '0');
        r.put<FeePlan>(K.plans, id, { ...plan, id, history: [{ at: at ?? '', what: '紹介フィーマスタを登録', by: by ?? '' }] } as FeePlan);
        return { id, users: 0 };
      }
      if (!plan.id || !r.get<FeePlan>(K.plans, plan.id)) throw new ApiError('紹介フィーマスタが見つかりません', 404);
      const oldP = r.get<FeePlan>(K.plans, plan.id) as FeePlan;
      r.put<FeePlan>(K.plans, plan.id, { ...plan, history: [{ at: at ?? '', what: '紹介フィーマスタを更新', by: by ?? '' }, ...(oldP.history ?? [])] } as FeePlan);
      return { id: plan.id, users: referrals(r).filter((x) => x.feePlanId === plan.id).length };
    },
    deleteFeePlan: (r, { id }: { id: string }) => {
      const p = r.get<FeePlan>(K.plans, id);
      if (!p) throw new ApiError('紹介フィーマスタが見つかりません', 404);
      if (agencies(r).some((a) => a.feePlanId === id && a.status !== '削除済') || referrals(r).some((x) => x.feePlanId === id)) throw new ApiError('代理店または紹介履歴で使われているフィープランは削除できません', 409);
      r.put<FeePlan>(K.plans, id, { ...p, status: '削除済' });
    },
    /** 紹介の保存（親契約ごと）。what＝履歴に残す文 */
    saveReferral: (r, a: { contractId: string; patch: Pick<Referral, 'feePlanId' | 'cond' | 'payStart' | 'endPlan' | 'status' | 'end' | 'note'>; what: string; by: string; at: string }) => {
      const x = referrals(r).find((y) => y.contractId === a.contractId);
      if (!x) throw new ApiError('紹介履歴が見つかりません', 404);
      if (!r.get<FeePlan>(K.plans, a.patch.feePlanId)) throw new ApiError(`紹介フィープラン ${a.patch.feePlanId} がありません`, 400);
      const h: Hist = { at: a.at, what: a.what, by: a.by };
      r.put<Referral>(K.refs, x.id, { ...x, ...a.patch, history: [h, ...x.history] });
      return { id: x.id };
    },
    /**
     * 紹介の中止（契約の中止ではない：親契約・代理店コードは変えない）。status＝中止・end＝中止した年月。
     * 中止した年月より後の月の支払は、未払いのものから この紹介の行を外す（行がなくなれば対象外）。支払済みの月はそのまま
     */
    stopReferral: (r, a: { id: string; reason: string; month: string; by: string; at: string }) => {
      const x = r.get<Referral>(K.refs, a.id);
      if (!x) throw new ApiError('紹介履歴が見つかりません', 404);
      if (x.status === '中止') throw new ApiError('すでに中止しています', 409);
      if (!a.reason.trim()) throw new ApiError('理由を入力してください', 400);
      r.put<Referral>(K.refs, a.id, {
        ...x, status: '中止', end: a.month, stop: { reason: a.reason.trim(), month: a.month, prev: { status: x.status, end: x.end } },
        history: [{ at: a.at, what: `紹介を中止（理由：${a.reason.trim()}）`, by: a.by }, ...x.history],
      });
      for (const p of r.list<FeePayment>(K.pays)) {
        if (p.status !== '未払い' || p.month <= a.month || !p.lines.some((l) => l.referralId === a.id)) continue;
        const lines = p.lines.filter((l) => l.referralId !== a.id);
        r.put<FeePayment>(K.pays, p.id, {
          ...p, lines, status: lines.length ? p.status : '対象外',
          history: [{ at: a.at, what: `紹介 ${a.id} の中止により、この月の行を外しました${lines.length ? '' : '（行がなくなったので対象外）'}`, by: a.by }, ...p.history],
        });
      }
      return { id: a.id };
    },
    /** 紹介の中止の取り消し（中止前の状態・終了月に戻す。止めた月の支払は作り直さない） */
    resumeReferral: (r, a: { id: string; by: string; at: string }) => {
      const x = r.get<Referral>(K.refs, a.id);
      if (!x) throw new ApiError('紹介履歴が見つかりません', 404);
      if (x.status !== '中止' || !x.stop) throw new ApiError('中止していません', 409);
      const { stop, ...rest } = x;
      r.put<Referral>(K.refs, a.id, { ...rest, status: stop.prev.status, end: stop.prev.end, history: [{ at: a.at, what: '紹介の中止を取り消し', by: a.by }, ...x.history] });
      return { id: a.id };
    },
    /** 支払の保存。adj＝行ごとの調整額（円）。支払済みは支払日（YYYY/MM/DD）が要る */
    savePayment: (r, a: { id: string; status: FeePayment['status']; paidOn: string; note: string; adj: number[]; method?: FeePayment['method']; what: string; by: string; at: string }) => {
      const p = r.get<FeePayment>(K.pays, a.id);
      if (!p) throw new ApiError('支払履歴が見つかりません', 404);
      if (a.status === '支払済' && !/^\d{4}\/\d{2}\/\d{2}$/.test(a.paidOn)) throw new ApiError('支払日は必須項目です。', 400);
      const lines = p.lines.map((l, i) => ({ ...l, adjYen: Math.round(Number(a.adj[i]) || 0) }));
      r.put<FeePayment>(K.pays, a.id, {
        ...p, method: a.method ?? p.method, status: a.status, note: a.note, paidOn: a.status === '支払済' ? a.paidOn : '', lines, history: [{ at: a.at, what: a.what, by: a.by }, ...p.history],
      });
    },
  },
});

/** 法人の名前（紹介元・支払先の表示） */
export const corpName = (r: DocRepo, id: string) => r.get<Corp>('dm.org.corps', id)?.name ?? id;
