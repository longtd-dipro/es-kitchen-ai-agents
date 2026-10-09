'use client';

import { useQuery } from '@/lib/ops/core/client';
import { Icon } from '../_ui/Icon';
import { useDriverSignedIn } from '../_ui/DriverProvider';
import { HHead, Loading, TabBar, useNav } from '../_ui/parts';
import { driverApi, useDay } from '../_ui/useDay';

/** アカウント（元の V.account・DA_HOME_005）：基本情報とログアウト */
export default function DriverAccount() {
  const { staff, logout } = useDriverSignedIn();
  const { data: day } = useDay();
  const { data } = useQuery(driverApi(), 'session', { staff });
  const nav = useNav();
  if (!data?.me || !day) return <><Loading /><TabBar on="account" /></>;
  const m = data.me!;
  const rows: [string, string][] = [['ログインID', m.id], ['メールアドレス', m.mail || '—'], ['配送スタッフ名', m.name], ['カナ', m.kana || '—'], ['電話番号', m.tel || '—'], ['所属先', m.org]];
  return (
    <>
      <div className="scroll">
        <HHead name={m.name} unread={day.unread} />
        <div className="hbody pad stack">
          <div className="bar-h">基本情報</div>
          <div className="info">{rows.map(([k, v]) => <div key={k} className="r" style={{ gridTemplateColumns: '1fr auto' }}><span className="k">{k}</span><span>{v}</span></div>)}</div>
          <button type="button" className="btn sec" style={{ fontSize: '1.285714rem', height: '3.714286rem' }} onClick={() => nav.go('/driver/manuals')}>マニュアル <Icon name="book" /></button>
          <button type="button" className="btn sec" style={{ fontSize: '1.285714rem', height: '3.714286rem' }} onClick={() => nav.guard(() => { logout(); nav.router.replace('/driver/login'); })}>ログアウト <Icon name="logout" /></button>
        </div>
      </div>
      <TabBar on="account" />
    </>
  );
}
