'use client';

import { useCallback } from 'react';
import { ApiError } from '@/lib/api/errors';
import type { MKey } from '@/lib/ops/general/masterForms';
import { api } from '../parts';
import { useOps } from '../../_ui/OpsProvider';
import { ConfirmModal, Modal } from '../../_ui/ui';
import { MASTER_UI } from './config';

/** P-DEL の文言（Q01・S02。_共通_メッセージ.py の社内向け） */
export const Q01_DELETE = <>本当に削除してもよろしいですか？<br />削除すると元に戻せません。</>;
export const S02 = '削除が完了しました。';

/**
 * 仕入先・委託配送先・倉庫・配送スタッフの削除（一覧のごみ箱・詳細の「削除」で共通）。
 * 確認 Q01（タイトル「削除」・「キャンセル」「削除する」）→ general.deleteRow（論理削除＝削除済）→ S02。
 * 使用中（サーバー 409：E241〜E244 の文言）は「削除できません」のモーダル（「閉じる」）。ほかのエラーはトースト（E30 など）
 */
export function useMasterDelete(key: MKey) {
  const { toast, toastError, openModal, closeModal } = useOps();
  return useCallback((id: string, onDone?: () => void) => {
    openModal(<ConfirmModal title="削除" text={Q01_DELETE} ok="削除する" cancel="キャンセル" onOk={async () => {
      try {
        await api.action('deleteRow', { key: MASTER_UI[key].genKey, uid: id });
        toast(S02);
        onDone?.();
      } catch (e) {
        if (e instanceof ApiError && e.status === 409) {
          openModal(
            <Modal title="削除できません" width={480} footer={<><span style={{ flex: 1 }} /><button className="btn lg" onClick={closeModal} autoFocus>閉じる</button></>}>
              <p style={{ margin: 0 }}>{e.message}</p>
            </Modal>,
          );
        } else toastError(e);
      }
    }} />);
  }, [key, openModal, closeModal, toast, toastError]);
}
