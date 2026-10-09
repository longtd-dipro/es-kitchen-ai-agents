'use client';

import { checkEta, TIMES } from '@/lib/driver/logic';
import type { DeliveryView } from '@/lib/driver/types';
import { useCommit, useDraft, useDriverSignedIn } from './DriverProvider';
import { useRun } from './parts';
import { driverApi } from './useDay';

/** 到着予定（納品先・運営と共有。元の etaCard。改善案 B2） */
export default function EtaCard({ d }: { d: DeliveryView }) {
  const { staff, offline, toast } = useDriverSignedIn();
  const commit = useCommit();
  const [busy, run] = useRun();
  const [e, setE] = useDraft<[string, string]>('eta.' + d.no, d.eta ?? ['10:30', '11:00']);
  const share = () => {
    const err = checkEta(e);
    if (err) return toast(err);
    run(async () => commit(await driverApi().action('shareEta', { staff, no: d.no, eta: e, offline })));
  };
  return (
    <>
      <div className="h3">到着予定（納品先・運営と共有）</div>
      <div className="info" style={{ padding: '0.857143rem' }}>
        <div className="etarow">
          <select aria-label="到着予定 開始" value={e[0]} onChange={(x) => setE([x.target.value, e[1]])}>{TIMES.map((t) => <option key={t}>{t}</option>)}</select>
          <span>〜</span>
          <select aria-label="到着予定 終了" value={e[1]} onChange={(x) => setE([e[0], x.target.value])}>{TIMES.map((t) => <option key={t}>{t}</option>)}</select>
          <button type="button" className="btn pri" style={{ height: '2.857143rem', width: 'auto', padding: '0 1.285714rem', fontSize: '1rem' }} disabled={busy} onClick={share}>共有する</button>
        </div>
        <p className="hint muted" style={{ margin: '0.571429rem 0 0' }}>{d.eta ? `共有済み：${d.eta.join('〜')}（${d.etaAt ?? ''} 更新）` : 'まだ共有していません。'}</p>
      </div>
    </>
  );
}
