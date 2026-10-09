'use client';

import { MANUALS } from '@/lib/driver/seed';
import { TabBar, TopBar, useNav } from '../_ui/parts';

/** マニュアル一覧（元の V.manual・追加の画面） */
export default function DriverManuals() {
  const nav = useNav();
  return (
    <>
      <TopBar title="マニュアル" trouble={false} noBack />
      <div className="scroll pad stack">
        <div className="bar-h">手順書</div>
        {MANUALS.map((m, i) => (
          <button type="button" key={i} className="noti" onClick={() => nav.go(`/driver/manuals/${i}`)}><span style={{ padding: 0, color: '#1f2733', fontWeight: 500 }}>{m.t}</span></button>
        ))}
      </div>
      <TabBar on="account" />
    </>
  );
}
