import type { DocRepo } from '../core/area';
import type {
  Agency, Branch, ChildContract, Contract, Corp as DCorp, FeePayment, FeePlan as DFeePlan, Plan, Referral as DReferral,
} from '@/lib/domain/types';
import { today } from '@/lib/supplier/dates';
import { buildReferrals } from './logic';
import type { AgencyRow, Corp, FeePlan, Payment, RefContract, RefMeta } from './types';

/*
 * 代理・紹介管理の画面の形を共通データから作る（もとは general.feePlan・agency・corp・refContract・refMeta・payment・linkedDiscount）。
 *   紹介フィー＝dm.referral.feePlans、代理店＝dm.org.agencies、法人＝dm.org.corps、
 *   親契約（拠点・プラン・食数・月額）＝dm.org.contracts・branches・childContracts・dm.master.plans、
 *   紹介＝dm.referral.referrals（紹介元の代理店は親契約の agencyId）、支払＝dm.referral.payments
 */

export const planOf = (p: DFeePlan): FeePlan => ({
  id: p.id, code: p.code, name: p.name, src: p.src, pay: p.pay, calc: p.calc, amount: p.amount, rate: p.rate, months: p.months, tiers: p.tiers,
  status: p.status, updated: p.updated, note: p.note, history: p.history ?? [],
});
/** 画面の紹介フィー → 共通データ（連動する値引きは今の値を残す） */
export const dmPlanOf = (p: FeePlan, cur?: DFeePlan): Omit<DFeePlan, 'id'> & { id?: string } => ({
  id: p.id || undefined, code: p.code ?? '', name: p.name, src: p.src, pay: p.pay, calc: p.calc,
  amount: p.amount == null || p.amount === '' ? null : Number(p.amount), rate: p.rate == null || p.rate === '' ? null : Number(p.rate),
  months: p.months == null || p.months === '' ? null : Number(p.months), tiers: p.tiers ? p.tiers.map((t) => [Number(t[0]), Number(t[1])] as [number, number]) : null,
  status: p.status as DFeePlan['status'], updated: p.updated ?? '', note: p.note, linkedDiscounts: cur?.linkedDiscounts ?? [], history: cur?.history ?? [],
});

export const agencyRowOf = (a: Agency): AgencyRow => ({
  id: a.id, name: a.name, kana: a.kana, plan: a.feePlanId, status: a.status, tel: a.tel, fax: a.fax, zip: a.address.zip, pref: a.address.pref, city: a.address.city,
  addr: a.address.addr1, bldg: a.address.addr2, note: a.note, contacts: a.contacts, history: a.history,
});
export const dmAgencyOf = (a: AgencyRow): Omit<Agency, 'history'> => ({
  id: a.id, name: a.name, kana: a.kana, feePlanId: a.plan, status: a.status as Agency['status'], tel: a.tel, fax: a.fax,
  address: { zip: a.zip, pref: a.pref, city: a.city, addr1: a.addr, addr2: a.bldg }, note: a.note, contacts: a.contacts as Agency['contacts'],
});

const ymOf = (d: string) => (d ? d.slice(0, 7).replace('/', '-') : '');

/** 親契約の行（プラン・食数・月額は今のサイクル月の子契約。なければいちばん近い子契約） */
export function refContracts(r: DocRepo): RefContract[] {
  const cur = ymOf(today());
  const children = r.list<ChildContract>('dm.org.childContracts');
  const refs = r.list<DReferral>('dm.referral.referrals');
  return r.list<Contract>('dm.org.contracts').map((c) => {
    const b = r.get<Branch>('dm.org.branches', c.branchId);
    const mine = children.filter((x) => x.contractId === c.id && !x.canceled).sort((x, y) => x.cycleMonth.localeCompare(y.cycleMonth));
    const ch = mine.find((x) => x.cycleMonth === cur) ?? [...mine].reverse().find((x) => x.cycleMonth < cur) ?? mine[0];
    const pl = ch && r.get<Plan>('dm.master.plans', ch.planId);
    const paused = c.status === '利用休止';
    const bill = ch ? (ch.fees ? Math.max(0, ch.fees.lines.reduce((s, l) => s + l.amountYen, 0)) : ch.monthlyYen) : 0;
    const corpSrc = refs.find((x) => x.contractId === c.id)?.srcCorpId || undefined;
    return {
      id: c.id, br: c.branchId, branch: b?.name ?? c.branchId, cu: b?.corpId ?? '', st: c.status, start: c.status === '仮登録' ? '' : c.startCycle,
      ...(c.endOn ? { end: ymOf(c.endOn) } : {}),
      plan: paused ? '—（休止中）' : pl ? `${pl.id} ${pl.name}` : '—', meals: paused || !pl ? 0 : pl.monthlyMeals, bill: paused ? 0 : bill,
      agent: c.agencyId, ...(corpSrc ? { corpSrc } : {}),
    };
  });
}

/** 紹介ごとの設定（キー＝親契約番号） */
export function refMetas(r: DocRepo): Record<string, RefMeta> {
  return Object.fromEntries(r.list<DReferral>('dm.referral.referrals').map((x) => [x.contractId, {
    id: x.id, plan: x.feePlanId, cond: x.cond, payStart: x.payStart, status: x.status, endPlan: x.endPlan, end: x.end, note: x.note, history: x.history,
  } as RefMeta]));
}

export const paymentOf = (p: FeePayment): Payment => ({
  id: p.id, month: p.month, type: p.type, target: p.targetId, method: p.method, status: p.status, date: p.paidOn, note: p.note,
  lines: p.lines.map((l) => ({ ref: l.referralId, corp: l.corp, plan: l.plan, pay: l.pay, sites: l.sites, calc: l.calc, base: l.baseYen, rateTxt: l.rateTxt, fee: l.feeYen, adj: l.adjYen })),
  history: p.history,
});

/** 代理・紹介管理の全部（画面で絞り込み・計算する） */
export function refDataOf(r: DocRepo) {
  const dmPlans = r.list<DFeePlan>('dm.referral.feePlans');
  const plans = dmPlans.map(planOf);
  const agencies = r.list<Agency>('dm.org.agencies').map(agencyRowOf);
  const contracts = refContracts(r);
  const metas = refMetas(r);
  return {
    plans,
    agencies,
    corps: r.list<DCorp>('dm.org.corps').map((c): Corp => ({ id: c.id, name: c.name })),
    contracts,
    metas,
    referrals: buildReferrals(contracts, metas, plans, agencies),
    payments: r.list<FeePayment>('dm.referral.payments').map(paymentOf),
    linked: Object.fromEntries(dmPlans.filter((p) => p.linkedDiscounts.length).map((p) => [p.id, p.linkedDiscounts])) as Record<string, string[]>,
  };
}
