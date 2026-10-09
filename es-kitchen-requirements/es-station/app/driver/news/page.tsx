'use client';

import { useQuery } from '@/lib/ops/core/client';
import { useDriverSignedIn } from '../_ui/DriverProvider';
import { Loading, TopBar, useNav } from '../_ui/parts';
import { driverApi } from '../_ui/useDay';

/** お知らせ一覧（元の V.noti・DA_NOTI_001） */
export default function DriverNews() {
  const { staff } = useDriverSignedIn();
  const { data } = useQuery(driverApi(), 'news', { staff });
  const nav = useNav();
  return (
    <>
      <TopBar title="お知らせ" trouble={false} />
      {!data ? <Loading /> : (
        <div className="scroll pad stack">
          <div className="bar-h">お知らせ一覧</div>
          {data.map((n, i) => (
            <button type="button" key={i} className={`noti ${n.read ? '' : 'unread'}`} onClick={() => nav.go(`/driver/news/${i}`)}><small>{n.t}</small><span>{n.title}</span></button>
          ))}
        </div>
      )}
    </>
  );
}
