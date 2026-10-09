'use client';

import { useState } from 'react';
import { api } from '@/app/ops/_general/parts';
import { useOps } from '@/app/ops/_ui/OpsProvider';
import { ConfirmModal, Field, Modal } from '@/app/ops/_ui/ui';
import { DateInput } from '@/components/DateInput';
import { todayIso } from '@/lib/ops/general/logic';

/** 支払履歴の一括変更。「支払済にする」は支払日を指定する画面、「未払いに戻す」「対象外にする」は確認（Q01） */
export function BulkPayModal({ ids, status, onDone }: { ids: string[]; status: '未払い' | '支払済' | '対象外'; onDone: () => void }) {
  const { closeModal, toast, toastError } = useOps();
  const [date, setDate] = useState(todayIso());
  const [err, setErr] = useState('');
  const run = async () => {
    if (status === '支払済' && !date) { setErr('支払日は必須項目です。'); return; }
    try {
      await api.action('bulkPayments', { ids, status, date: status === '支払済' ? date : '' });
      closeModal();
      onDone();
      toast('保存しました。');
    } catch (x) { toastError(x); }
  };
  if (status !== '支払済') {
    return <ConfirmModal kind="warn" title={`${status === '未払い' ? '未払いに戻す' : '対象外にする'}`} text={<>選んだ{ids.length}件の支払状況を「{status}」にします。よろしいですか？</>} ok={status === '未払い' ? '未払いに戻す' : '対象外にする'} okCls="warn-solid" onOk={async () => { try { await api.action('bulkPayments', { ids, status }); onDone(); toast('保存しました。'); } catch (x) { toastError(x); } }} />;
  }
  return (
    <Modal title="支払済にする" width={480}
      footer={<><button className="btn" onClick={closeModal}>キャンセル</button><button className="btn pri" onClick={run}>支払済にする</button></>}>
      <p>選んだ{ids.length}件を「支払済」にします。支払日を指定してください。</p>
      <Field label="支払日" req htmlFor="bulk-date" err={err}>
        <DateInput className={`inp${err ? ' err' : ''}`} id="bulk-date" value={date} onChange={(x) => { setDate(x.target.value); setErr(''); }} />
      </Field>
    </Modal>
  );
}
