'use client';

import { useState } from 'react';
import org from '@/lib/domain/areas/org';
import { domainApi } from '@/lib/domain/client';
import { fmtYm } from '@/lib/format/date';
import { useOps } from '../../_ui/OpsProvider';
import { Field, Modal } from '../../_ui/ui';

const api = domainApi(org);

/**
 * 移行した「休止中」のお客様の休止の期間・再開月を入れる（要補完「休止の期間・再開月」。受付簿 No.28・hong 2026-10-05）。
 * 休止の開始月（フェーズ1の切替のサイクル月が入っている。直せる）と再開月を入れる。
 * 再開の申請を承認したときと同じ反映：休止の終わり＝再開月の前月、再開の月から子契約を作る、今のサイクルが再開月以降なら契約は有効に戻る
 */
export function PauseModal({ contractId, branchName, fromCycle }: { contractId: string; branchName: string; fromCycle: string }) {
  const { toast, toastError, closeModal } = useOps();
  const [from, setFrom] = useState(fromCycle);
  const [resume, setResume] = useState('');
  const [busy, setBusy] = useState(false);
  const ym = /^\d{4}-(0[1-9]|1[0-2])$/;
  const err = !resume ? '再開月を入れてください' : !ym.test(from) || !ym.test(resume) ? '開始月・再開月は年月で入れてください' : resume <= from ? '再開月は、休止の開始月より後にしてください' : '';
  const save = async () => {
    setBusy(true);
    try {
      const out = await api.action('setMigrationPause', { contractId, fromCycle: from, resumeCycle: resume });
      toast(`休止の期間を入れました（${fmtYm(from)} 〜 ${fmtYm(resume)}の前月。再開月 ${fmtYm(resume)}）${out.note ? '　' + out.note : ''}`);
      closeModal();
    } catch (e) { toastError(e); } finally { setBusy(false); }
  };
  return (
    <Modal title="休止の期間・再開月を入れる" width={560}
      footer={<><button className="btn lg ghost" onClick={closeModal}>キャンセル</button><button className="btn lg pri" disabled={busy || !!err} onClick={save}>入れる</button></>}>
      <p className="hint" style={{ margin: '0 0 0.857143rem' }}>{branchName}（{contractId}）は、フェーズ1の「休止中」で取り込んだお客様です。お客様に確かめた休止の期間を入れてください。再開月のサイクルから、子契約と配送を作ります。</p>
      <Field label="休止の開始月" req hint="フェーズ1の切替のサイクル月が入っています。違うときは直してください">
        <input type="month" value={from} onChange={(e) => setFrom(e.target.value)} />
      </Field>
      <Field label="再開月" req hint="この月から再開します（休止の終わりは前の月）" err={resume ? err : undefined}>
        <input type="month" value={resume} onChange={(e) => setResume(e.target.value)} />
      </Field>
    </Modal>
  );
}
