import { ApiError } from '@/lib/api/errors';
import type { DocRepo } from '@/lib/ops/core/area';
import domainApply from '@/lib/domain/areas/apply';
import { formMasterOf } from '@/lib/domain/formMaster';
import { today } from '@/lib/supplier/dates';
import { setApplyMaster } from './data';
import { normalizeApply, requestRows, startCycleOf, submitError, whoOf } from './logic';
import type { ApplySubmit } from './types';

export type { ApplySubmit } from './types';

/*
 * 申込フォーム（ログイン前の新規のお申し込み）の「登録」。
 *   dm.apply.applications … 共通データの新規申込（受付中）。受付番号は共通データの決め方（AP-<今日YYYYMMDD>-NNNN）
 *   運営Web の契約申請管理（新規契約タブ）も共通データを読むので、ほかの kind には書かない。
 */
export function submitApply(repo: DocRepo, a: ApplySubmit): { no: string } {
  /* 料金・プラン・オプションの表は共通データのマスタから（画面と同じ元）。サーバーで作り直してから入力を確かめる */
  setApplyMaster(formMasterOf(repo));
  const A = normalizeApply(structuredClone(a));
  const bad = submitError(A);
  if (bad) throw new ApiError(bad, 400);
  const d = today();
  const app = domainApply.actions.submitNew(repo, {
    kubun: A.kind === 'trial' ? 'お試し' : '本導入', companyName: String(A.corp.name || '').trim(),
    branchNames: A.branches.map((b) => String(b.name || '').trim()), startCycle: startCycleOf(A, d),
    name: whoOf(A.who, A)?.name ?? A.who, request: requestRows(A),
    /* M1：お申し込み者と法人のメイン担当者（同じ人なら1通） */
    mailTo: [
      { name: whoOf(A.who, A)?.name ?? '', email: A.who },
      ...(A.corp._st || []).filter((x) => /メイン/.test(x.kind || '')).map((x) => ({ name: x.name ?? '', email: x.mail ?? '' })),
    ],
  });
  return { no: app.id };
}
