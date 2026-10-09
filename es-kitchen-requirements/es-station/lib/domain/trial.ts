import { ApiError } from '@/lib/api/errors';
import type { DocRepo } from '@/lib/ops/core/area';
import { nowStamp } from '@/lib/supplier/dates';
import { addYm } from './menu';
import { notifyBranch } from './notify';
import { feesNow } from './snapshot';
import { closeOf, ensureDeliveries, liveChildren, refreshOrders } from './lifecycle';
import type { Branch, ChildContract, Contract, TrialExtension } from './types';
import { TRIAL_DISCOUNT } from './charges';

/*
 * お試しの延長（2026/10/03 決定・課題一覧「Chức năng chưa làm – chốt」）。
 *   運営だけが延長する（法人Web からはできない。法人Web はお試しの期間と延長を見るだけ＝決定 T3）。
 *   月数は今のところ上限なし（長くなるなら本導入へ切り替える）。延長の月の子契約は お試しの子契約だが、お試しキャンペーン割引（DC000013）は付けない＝プラン料金を請求（台帳「お試し割引」K1・受付簿 No.53）。
 *   お試しの最後の子契約と同じ中身で、次のサイクルから月数ぶん子契約を作る（請求は未確定・手動生成）。配送・注文（お試し（自動））もそろえる。
 *   延長は親契約の trialExt に残し、法人へ通知・メール（文面 trial_extended）
 * お試しの期間（開始・終了のサイクル月）は お試しの子契約 から決める（別に持たない）
 */

/** お試しキャンペーン割引（ID は lib/domain/charges.ts の CHARGE_IDS） */
export { TRIAL_DISCOUNT } from './charges';
const K = { contracts: 'dm.org.contracts', children: 'dm.org.childContracts', branches: 'dm.org.branches' } as const;

/** お試しの期間（取り消していない お試しの子契約 の最初〜最後のサイクル月・月数）。お試しの子契約がなければ from・to は '' */
export function trialPeriod(r: DocRepo, contractId: string) {
  const kids = liveChildren(r, contractId).filter((x) => x.kind === 'お試しキャンペーン');
  const to = kids[kids.length - 1]?.cycleMonth ?? '';
  return { from: kids[0]?.cycleMonth ?? '', to, months: kids.length, decideBy: to ? closeOf(r, addYm(to, 1)) : '' };
}

/** 延長できるか（できないときは理由） */
export function trialExtendBlock(r: DocRepo, ct: Contract | undefined): string {
  if (!ct) return '親契約が見つかりません';
  if (ct.kind !== 'お試しキャンペーン') return 'お試しキャンペーンの契約だけ延長できます';
  if (!['有効', '利用休止'].includes(ct.status)) return `${ct.status} の契約は延長できません`;
  if (!trialPeriod(r, ct.id).to) return 'お試しの子契約がありません';
  return '';
}

/** お試しを延長する（運営）。返り値＝延長の記録・新しいお試しの期間 */
export function extendTrial(r: DocRepo, a: { contractId: string; months: number; note?: string; by: string }) {
  const ct = r.get<Contract>(K.contracts, a.contractId);
  const block = trialExtendBlock(r, ct);
  if (block) throw new ApiError(block, ct ? 409 : 404);
  const months = Number(a.months);
  if (!Number.isInteger(months) || months < 1) throw new ApiError('延長する月数を1以上の整数で入れてください', 400);
  const kids = liveChildren(r, ct!.id).filter((x) => x.kind === 'お試しキャンペーン');
  const last = kids[kids.length - 1];
  const yms = Array.from({ length: months }, (_, i) => addYm(last.cycleMonth, i + 1));
  /* 延長する月にもう子契約がある（取り消したものは除く）なら延長しない */
  for (const ym of yms) {
    const id = `${ct!.id}-${ym.replace('-', '')}`;
    const ex = r.get<ChildContract>(K.children, id);
    if (ex && !ex.canceled) throw new ApiError(`${ym} サイクルの子契約（${id}）がもうあります。延長できるのは、お試しの最後の月（${last.cycleMonth}）の次からです`, 409);
  }
  const made: ChildContract[] = [];
  for (const ym of yms) {
    const id = `${ct!.id}-${ym.replace('-', '')}`;
    const { canceled: _c, ...base } = last;
    void _c;
    const cc: ChildContract = {
      ...base, id, cycleMonth: ym, kind: 'お試しキャンペーン', billStatus: '未確定', gen: '手動生成',
      /* 延長の月は割引しない（プラン料金を請求：台帳 K1） */
      discountIds: last.discountIds.filter((x) => x !== TRIAL_DISCOUNT),
      /* 費用（extras）は月額だけ引き継ぐ（org.addChild と同じ） */
      extras: (last.extras ?? []).filter((e) => e.kind === '月額'),
    };
    const next = { ...cc, fees: feesNow(r, cc) };
    r.put<ChildContract>(K.children, id, next);
    made.push(next);
  }
  for (const cc of made) { ensureDeliveries(r, cc); refreshOrders(r, cc); }
  const ext: TrialExtension = { at: nowStamp(), by: a.by || 'system', months, fromCycle: yms[0], toCycle: yms[yms.length - 1], note: (a.note ?? '').trim(), childIds: made.map((x) => x.id) };
  const contract: Contract = { ...ct!, trialExt: [...(ct!.trialExt ?? []), ext] };
  r.put<Contract>(K.contracts, ct!.id, contract);
  const p = trialPeriod(r, ct!.id);
  const name = r.get<Branch>(K.branches, ct!.branchId)?.name ?? ct!.branchId;
  notifyBranch(r, ct!.branchId, {
    templateId: 'trial_extended', title: `お試し期間を延長しました（${name}）`,
    body: `お試し期間を ${ext.fromCycle}〜${ext.toCycle} サイクルの${months}ヶ月延長しました（延長の期間はプラン料金がかかります）。お試し期間：${p.from}〜${p.to} サイクル。`
      + `正式なご契約へ切り替えるお申し込みの期限：${p.decideBy}。`,
    link: { type: '', id: '' },
  });
  return { ext, period: p, contract };
}

/** 延長の記録とお試しの子契約の食い違い（check.run）。お試しのままの契約は、延長で作った子契約が お試し・DC000013 なし（請求する）で、お試しの子契約の月が続いている */
export function trialProblems(r: DocRepo): string[] {
  const p: string[] = [];
  const need = (cond: boolean, msg: string) => { if (!cond) p.push(msg); };
  for (const ct of r.list<Contract>(K.contracts)) {
    const exts = ct.trialExt ?? [];
    let prevTo = '';
    for (const e of exts) {
      need(Number.isInteger(e.months) && e.months >= 1 && addYm(e.fromCycle, e.months - 1) === e.toCycle, `契約 ${ct.id} のお試しの延長（${e.fromCycle}〜${e.toCycle}）の月数 ${e.months} が合わない`);
      need(!prevTo || e.fromCycle > prevTo, `契約 ${ct.id} のお試しの延長の期間が重なっている・古い順でない`);
      need(e.childIds.length === e.months, `契約 ${ct.id} のお試しの延長（${e.fromCycle}〜）の子契約の数が月数と違う`);
      prevTo = e.toCycle;
      for (const id of e.childIds) {
        const cc = r.get<ChildContract>(K.children, id);
        need(!!cc && cc.contractId === ct.id && e.fromCycle <= cc.cycleMonth && cc.cycleMonth <= e.toCycle, `契約 ${ct.id} のお試しの延長の子契約 ${id} がない・期間の外`);
        /* お試しのままなら、延長の月は お試しの子契約・割引なし（請求する：台帳 K1。本導入へ切り替えたあとは本導入の子契約に作り直されることがある） */
        if (cc && ct.kind === 'お試しキャンペーン' && !cc.canceled) need(cc.kind === 'お試しキャンペーン' && !cc.discountIds.includes(TRIAL_DISCOUNT), `お試しの延長の子契約 ${id} が お試しの子契約でない・お試しキャンペーン割引（${TRIAL_DISCOUNT}）が付いている（延長の月は請求）`);
      }
    }
    if (exts.length) need(ct.kindHistory.some((h) => h.kind === 'お試しキャンペーン'), `契約 ${ct.id} はお試しでないのに延長の記録がある`);
    if (ct.kind === 'お試しキャンペーン') {
      const kids = liveChildren(r, ct.id).filter((x) => x.kind === 'お試しキャンペーン');
      need(kids.every((x, i) => i === 0 || addYm(kids[i - 1].cycleMonth, 1) === x.cycleMonth), `お試しの契約 ${ct.id} のお試しの子契約の月が続いていない`);
      const last = exts[exts.length - 1];
      if (last) need(kids[kids.length - 1]?.cycleMonth === last.toCycle, `お試しの契約 ${ct.id} のお試しの終わり（${kids[kids.length - 1]?.cycleMonth ?? '—'}）が最後の延長（${last.toCycle}）と違う`);
    }
  }
  return p;
}

/** 「お試し 10月＋延長 11月」（月が続くときは 10月〜11月） */
export function trialMonthsLabel(months: string[], extMonths: string[]) {
  const mj = (ym: string) => `${Number(ym.slice(5))}月`;
  const span = (xs: string[]) => (xs.length ? (xs.length > 1 ? `${mj(xs[0])}〜${mj(xs[xs.length - 1])}` : mj(xs[0])) : '');
  const ext = new Set(extMonths), base = months.filter((m) => !ext.has(m)), ex = months.filter((m) => ext.has(m));
  return `お試し ${span(base)}${ex.length ? `＋延長 ${span(ex)}` : ''}`;
}
