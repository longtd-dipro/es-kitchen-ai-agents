'use client';

import { useParams } from 'next/navigation';
import { useEffect } from 'react';
import { useQuery } from '@/lib/ops/core/client';
import { useDriverSignedIn } from '../../_ui/DriverProvider';
import { Loading, NotFound, TopBar } from '../../_ui/parts';
import { driverApi } from '../../_ui/useDay';

/** お知らせ詳細（元の V.notid・DA_NOTI_002）。開くと既読にする */
export default function DriverNewsDetail() {
  const { id } = useParams<{ id: string }>();
  const i = Number(id);
  const { staff } = useDriverSignedIn();
  const api = driverApi();
  const { data } = useQuery(api, 'news', { staff });
  const n = data?.[i];
  useEffect(() => { if (n && !n.read) api.action('readNews', { staff, i }).catch(() => {}); }, [n, api, staff, i]);
  return (
    <>
      <TopBar title="お知らせ" trouble={false} />
      {!data ? <Loading /> : !n ? <NotFound text="お知らせが見つかりません。" /> : (
        <div className="scroll pad stack">
          <div style={{ background: '#fff', borderRadius: 8, padding: '0.714286rem 0.571429rem', fontSize: '1.285714rem', fontWeight: 500, lineHeight: 1.5 }}>{n.title}</div>
          <div style={{ background: '#fff', borderRadius: 8, padding: '0.714286rem 0.571429rem', fontSize: '1rem', lineHeight: 1.7 }}><small>{n.t}</small><p style={{ whiteSpace: 'pre-line', margin: '0.571429rem 0 0' }}>{n.body}</p></div>
        </div>
      )}
    </>
  );
}
