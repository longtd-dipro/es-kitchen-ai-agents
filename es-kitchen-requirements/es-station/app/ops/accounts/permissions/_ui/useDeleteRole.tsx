'use client';

import { ApiError } from '@/lib/api/errors';
import { api, DEL_MSG, useAskDelete } from '@/app/ops/_general/parts';
import { useOps } from '@/app/ops/_ui/OpsProvider';
import { Modal } from '@/app/ops/_ui/ui';

/**
 * 権限の削除（一覧の鉛筆の隣・詳細の「削除」で共通）。確認 → general.deleteRow。
 * その権限を持つアカウントがあるとき（サーバー 409「使用中のアカウント {n}件のため削除できません。」＝E261）は、トーストではなくモーダルで出す。
 * ほかのエラー（E262 など）は、これまでどおりトースト
 */
export function useDeleteRole() {
  const { toast, toastError, openModal, closeModal } = useOps();
  const askDelete = useAskDelete();
  return (id: string, onDone?: () => void) => askDelete(async () => {
    try {
      await api.action('deleteRow', { key: 'perm', uid: id });
      toast(DEL_MSG);
      onDone?.();
    } catch (e) {
      if (e instanceof ApiError && e.status === 409 && e.message.startsWith('使用中のアカウント')) {
        openModal(
          <Modal title="削除できません" width={480} footer={<><span style={{ flex: 1 }} /><button className="btn lg" onClick={closeModal} autoFocus>閉じる</button></>}>
            <p style={{ margin: 0 }}>{e.message}</p>
          </Modal>,
        );
      } else toastError(e);
    }
  });
}
