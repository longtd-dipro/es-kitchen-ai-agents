'use client';

import { useCallback } from 'react';
import { api, useAskDelete } from '@/app/ops/_general/parts';
import { useOps } from '@/app/ops/_ui/OpsProvider';
import { Modal } from '@/app/ops/_ui/ui';

/*
 * 商品の削除・無効の「できません」のモーダル（E272・E273。理由として、入っている有効なメニューの年月と在庫がある場所を並べる：確認メモ §4）。
 * 有効なメニュー＝公開中・締切済・配送中、在庫がある＝倉庫または拠点の在庫が1以上（受付簿 #268）。判定はサーバー（lib/ops/general/product.ts の productBlockers）
 */
export type Blockers = { menus: string[]; stock: { where: string; qty: number }[]; blocked: boolean };

export function BlockedModal({ what, b }: { what: '削除' | '無効'; b: Blockers }) {
  const { closeModal } = useOps();
  return (
    <Modal title={what === '削除' ? '削除できません' : '無効にできません'} width={560} footer={<><span style={{ flex: 1 }} /><button className="btn lg" onClick={closeModal} autoFocus>閉じる</button></>}>
      <p style={{ marginTop: 0 }}>
        {what === '削除'
          ? '有効なメニューに入っている商品、または在庫がある商品のため削除できません。メニューから外す・在庫をなくしてから削除してください。'
          : '有効なメニューに入っている商品、または在庫がある商品のため無効にできません。'}
      </p>
      {b.menus.length > 0 && <p>入っているメニュー：<b>{b.menus.join('・')}</b></p>}
      {b.stock.length > 0 && <p>在庫がある場所：<b>{b.stock.map((x) => `${x.where}（${x.qty}）`).join('・')}</b></p>}
    </Modal>
  );
}

/** 削除の流れ：有効なメニュー・在庫があれば理由のモーダルだけ。なければ確認（Q01）→ 論理削除（S02） */
export function useProductDelete() {
  const { toast, toastError, openModal } = useOps();
  const askDelete = useAskDelete();
  return useCallback(async (id: string, name: string, done?: () => void) => {
    try {
      const b = await api.query('productBlockers', { id });
      if (b.blocked) { openModal(<BlockedModal what="削除" b={b} />); return; }
    } catch (e) { toastError(e); return; }
    askDelete(async () => {
      try { await api.action('deleteRow', { key: 'product', uid: id }); toast('削除が完了しました。'); done?.(); } catch (e) { toastError(e); }
    }, <>本当に削除してもよろしいですか？<br />削除すると元に戻せません。<br /><b>{id} {name}</b></>);
  }, [askDelete, openModal, toast, toastError]);
}
