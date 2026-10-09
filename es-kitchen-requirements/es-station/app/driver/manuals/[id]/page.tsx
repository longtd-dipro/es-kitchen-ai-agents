'use client';

import { useParams } from 'next/navigation';
import { MANUALS } from '@/lib/driver/seed';
import { NotFound, TopBar } from '../../_ui/parts';

/** マニュアル（元の V.manuald） */
export default function DriverManual() {
  const { id } = useParams<{ id: string }>();
  const m = MANUALS[Number(id)];
  return (
    <>
      <TopBar title="マニュアル" trouble={false} onBack={undefined} />
      {!m ? <NotFound text="マニュアルが見つかりません。" /> : (
        <div className="scroll pad stack">
          <div style={{ background: '#fff', borderRadius: 8, padding: '0.857143rem', fontSize: '1.285714rem', fontWeight: 500 }}>{m.t}</div>
          <div style={{ background: '#fff', borderRadius: 8, padding: '0.857143rem', fontSize: '1.035714rem', lineHeight: 1.8, whiteSpace: 'pre-line' }}>{m.b}</div>
        </div>
      )}
    </>
  );
}
