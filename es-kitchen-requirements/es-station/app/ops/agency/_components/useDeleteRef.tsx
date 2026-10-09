'use client';

import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import type { RefData } from '@/lib/ops/areas/general';
import { api, DEL_MSG, useAskDelete } from '@/app/ops/_general/parts';
import { useOps } from '@/app/ops/_ui/OpsProvider';
import { R } from './common';

/**
 * 代理店・紹介フィーマスタの削除（元：askDelete）。使われているデータは確認の前に理由を出して消さない。
 * 削除は論理削除（削除済として残る）。終わったら一覧へ
 */
export function useDeleteRef(kind: 'agency' | 'feeplan') {
  const router = useRouter();
  const { toast, toastError } = useOps();
  const ask = useAskDelete();
  return useCallback((id: string, d: RefData) => {
    if (kind === 'agency' && d.referrals.some((r) => r.srcType === '代理店' && r.src === id)) { toast('紹介履歴がある代理店は削除できません。ステータスを「無効」にしてください'); return; }
    if (kind === 'feeplan' && (d.agencies.some((a) => a.plan === id) || Object.values(d.metas).some((m) => m.plan === id))) { toast('代理店または紹介履歴で使われているフィープランは削除できません'); return; }
    ask(async () => {
      try {
        await api.action('deleteRef', { kind, id });
        toast(`${kind === 'agency' ? '代理店' : '紹介フィーマスタ'} ${id} を${DEL_MSG}`);
        router.push(R[kind]);
      } catch (e) { toastError(e); }
    });
  }, [kind, ask, router, toast, toastError]);
}
