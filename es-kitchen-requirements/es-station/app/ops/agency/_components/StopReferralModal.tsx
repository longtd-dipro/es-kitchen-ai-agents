'use client';

import { useState } from 'react';
import { api } from '@/app/ops/_general/parts';
import { useOps } from '@/app/ops/_ui/OpsProvider';
import { Field, Modal } from '@/app/ops/_ui/ui';

/**
 * 紹介の中止（契約の中止ではない：親契約・代理店コードは変えず、この紹介のフィーの支払だけを止める）。
 * 確認（Q01）と理由（必須・500文字まで）を1つの画面で。中止した月より後の未払いの支払からこの紹介の行を外す（サーバー側）
 */
export function StopReferralModal({ id }: { id: string }) {
  const { closeModal, toast, toastError } = useOps();
  const [reason, setReason] = useState('');
  const [err, setErr] = useState('');
  const run = async () => {
    const v = reason.trim();
    if (!v) { setErr('理由は必須項目です。'); return; }
    if (v.length > 500) { setErr('理由は500文字以内で入力してください。'); return; }
    try {
      await api.action('stopReferral', { id, reason: v });
      closeModal();
      toast('保存しました。');
    } catch (x) { toastError(x); }
  };
  return (
    <Modal title="紹介の中止" width={560}
      footer={<><button className="btn" onClick={closeModal}>キャンセル</button><button className="btn dan-solid" onClick={run}>中止する</button></>}>
      <p>本当に中止してもよろしいですか？</p>
      <p className="hint" style={{ fontSize: '0.857143rem', color: 'var(--fg-2)' }}>契約の中止ではありません。親契約・契約・代理店コードは変わらず、この紹介のフィーの支払だけを止めます。中止した月より後の未払いの支払からこの紹介を外し（支払済みの月はそのまま）、あとから取り消せます。</p>
      <Field label="理由" req htmlFor="stop-reason" err={err}>
        <textarea className={`inp${err ? ' err' : ''}`} id="stop-reason" rows={4} maxLength={600} value={reason} placeholder="例：契約の解約にともない紹介を中止" onChange={(e) => { setReason(e.target.value); setErr(''); }} />
      </Field>
    </Modal>
  );
}
