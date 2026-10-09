import type { DocRepo } from '@/lib/ops/core/area';
import { nowStamp } from '@/lib/supplier/dates';
import type { Branch, ChildContract } from './types';

/*
 * 確定（まだ発行していない）の月にかかる変更の「反映待ち」（2026/10/03 決定）。
 *   プランの変更・誤りの訂正を承認したとき、請求の画面で確定済みの子契約の月はロックしたまま変えない（7-1）。
 *   その月をここ（dm.billing.lockedSkips）に記録し、承認の画面と運営の TOP に「確定解除してから反映」のアラートを出す。
 *   運営（システム管理者）が請求の画面で確定解除すると「反映」できる（billing.reapplyLocked）。反映・取り下げで閉じる
 */

export const LOCKED_KIND = 'dm.billing.lockedSkips';

export type LockedSkip = {
  /** LS-＋子契約ID */
  id: string;
  childContractId: string; branchId: string; contractId: string; cycleMonth: string;
  source: 'プランの変更' | '誤りの訂正';
  /** プランの変更：申請と新しいプラン・コース */
  applicationId: string;
  planId?: string; course?: ChildContract['course']; migrate?: boolean;
  /** 誤りの訂正：理由 */
  reason: string;
  at: string; by: string;
  status: '反映待ち' | '反映済' | '取り下げ';
  doneAt: string; doneBy: string;
};

/** 確定の月を反映待ちとして残す（同じ子契約の反映待ちは新しい中身で上書き） */
export function recordLockedSkip(r: DocRepo, cc: ChildContract, x: Pick<LockedSkip, 'source' | 'applicationId' | 'planId' | 'course' | 'migrate' | 'reason' | 'by'>) {
  const id = `LS-${cc.id}`;
  const s: LockedSkip = {
    id, childContractId: cc.id, branchId: cc.branchId, contractId: cc.contractId, cycleMonth: cc.cycleMonth,
    source: x.source, applicationId: x.applicationId, planId: x.planId, course: x.course, migrate: x.migrate, reason: x.reason,
    at: nowStamp(), by: x.by, status: '反映待ち', doneAt: '', doneBy: '',
  };
  r.put<LockedSkip>(LOCKED_KIND, id, s);
  return s;
}

/** 反映待ちの一覧（画面用：拠点名・いまの請求の状態・反映できるか） */
export function lockedSkips(r: DocRepo, a?: { branchId?: string; applicationId?: string; all?: boolean }) {
  return r.list<LockedSkip>(LOCKED_KIND)
    .filter((x) => (a?.all || x.status === '反映待ち') && (!a?.branchId || x.branchId === a.branchId) && (!a?.applicationId || x.applicationId === a.applicationId))
    .map((x) => {
      const cc = r.get<ChildContract>('dm.org.childContracts', x.childContractId);
      const billStatus = cc?.billStatus ?? '未確定';
      return {
        ...x, branchName: r.get<Branch>('dm.org.branches', x.branchId)?.name ?? x.branchId, billStatus,
        /** 確定解除してあれば反映できる。請求済になったら反映できない（調整明細で） */
        canApply: !!cc && !cc.canceled && billStatus === '未確定',
      };
    })
    .sort((p, q) => p.cycleMonth.localeCompare(q.cycleMonth) || p.id.localeCompare(q.id));
}

/** check.run：反映待ちの子契約がある・反映待ちなのに請求済（反映できない）・閉じた記録に日時がある */
export function lockedProblems(r: DocRepo): string[] {
  const p: string[] = [];
  for (const x of r.list<LockedSkip>(LOCKED_KIND)) {
    const cc = r.get<ChildContract>('dm.org.childContracts', x.childContractId);
    if (!cc) { p.push(`反映待ち ${x.id} の子契約 ${x.childContractId} がない`); continue; }
    if (x.cycleMonth !== cc.cycleMonth || x.branchId !== cc.branchId) p.push(`反映待ち ${x.id} のサイクル月・拠点が子契約と違う`);
    if (x.source === 'プランの変更' && (!x.planId || !x.applicationId)) p.push(`反映待ち ${x.id}（プランの変更）にプラン・申請がない`);
    if (x.status !== '反映待ち' && !x.doneAt) p.push(`反映待ち ${x.id} は ${x.status} なのに日時がない`);
    if (x.status === '反映待ち' && cc.canceled) p.push(`反映待ち ${x.id} の子契約 ${cc.id} は取消済（取り下げにする）`);
  }
  return p;
}
