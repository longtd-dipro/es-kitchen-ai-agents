'use client';

import { mdW } from '@/lib/driver/logic';
import type { DeliveryView } from '@/lib/driver/types';
import { today } from '@/lib/supplier/dates';
import { Icon } from './_ui/Icon';
import { useDraft, useDriver } from './_ui/DriverProvider';
import { delHref, ptHref } from './_ui/nav';
import { DelCard, HHead, Loading, PtCard, TabBar, useNav } from './_ui/parts';
import { useDay } from './_ui/useDay';

/** ホーム（元の V.home・DA_HOME_001）：今日の件数・進捗、納品（今日お届けする分）と受取（今日受け取り、明日以降に納品） */
export default function DriverHome() {
  const { data, delsOf } = useDay();
  const { toast } = useDriver();
  const nav = useNav();
  const [open, setOpen] = useDraft<Record<string, boolean>>('home.open', {});
  if (!data) return <><Loading /><TabBar on="home" /></>;
  const { points, dels, me } = data;
  const td = dels.filter((d) => !d.later), done = td.filter((d) => d.status === '配送完了').length, tot = td.length;
  const pct = tot ? Math.round((done / tot) * 100) : 0;
  const openDel = (d: DeliveryView) => (d.later ? toast(`この配送の納品日は ${d.later} です。今日は受取だけです`) : nav.go(delHref(d)));
  const isOpen = (id: string) => open[id] !== false;
  return (
    <>
      <div className="scroll">
        <HHead name={me.name} unread={data.unread} />
        <div className="hstat">
          <div className="stats">
            <div className="row">
              <div className="c"><div className="n"><Icon name="truck" />{tot}</div><div className="l">本日の配送件数</div></div>
              <div className="c"><div className="n"><Icon name="ok" />{done}</div><div className="l">完了件数</div></div>
              <div className="c"><div className="n"><Icon name="hour" />{tot - done}</div><div className="l">残り件数</div></div>
            </div>
            <div className="prog">本日の進捗<div className="bar"><b style={{ width: `${Math.max(pct, 12)}%` }}>{pct}%</b></div></div>
          </div>
          <div className="qa">
            <button type="button" onClick={() => nav.go('/driver/stock')}><Icon name="trash" />廃棄・棚卸し</button>
            <button type="button" onClick={() => nav.go('/driver/manuals')}><Icon name="book" />マニュアル</button>
          </div>
        </div>
        <div className="hbody">
          <div className="sech" style={{ paddingTop: '0.428571rem' }}>配送予定一覧</div>
          <div className="date">■本日（{mdW(today())}）</div>
          <div className="pad stack" style={{ paddingTop: 0 }}>
            <div className="sech" style={{ marginTop: 0 }}><Icon name="truck" s /> 納品（今日お届けする分）</div>
            {points.filter((p) => delsOf(p.id).some((d) => !d.later)).map((p) => {
              const kids = delsOf(p.id).filter((d) => !d.later && (d.status !== '配送完了' || d.tr.length));
              return (
                <div className="group" key={p.id}>
                  <PtCard p={p} dels={delsOf(p.id)} onClick={() => nav.go(ptHref(p))} />
                  <div style={{ padding: '0 0.857143rem 0.571429rem', display: 'flex', justifyContent: 'flex-end' }}>
                    <button type="button" className="toggle" style={{ marginTop: '0.428571rem' }} aria-expanded={isOpen(p.id)} onClick={() => setOpen({ ...open, [p.id]: !isOpen(p.id) })}>
                      {isOpen(p.id) ? '非表示' : '表示'} <svg className="ico s" viewBox="0 0 24 24" aria-hidden="true"><path d={isOpen(p.id) ? 'M18 15l-6-6-6 6' : 'M6 9l6 6 6-6'} /></svg>
                    </button>
                  </div>
                  {isOpen(p.id) && kids.map((d) => <DelCard key={d.no} d={d} pt={p} onClick={() => openDel(d)} />)}
                </div>
              );
            })}
            <div className="sech"><Icon name="box" s /> 受取（今日受け取り、明日以降に納品）</div>
            {points.filter((p) => delsOf(p.id).some((d) => d.later)).map((p) => (
              <div className="group" key={p.id}>
                <PtCard p={p} dels={delsOf(p.id)} onClick={() => nav.go(ptHref(p))} />
                {delsOf(p.id).filter((d) => d.later).map((d) => <DelCard key={d.no} d={d} pt={p} onClick={() => openDel(d)} />)}
              </div>
            ))}
            <p className="muted" style={{ fontSize: '0.857143rem', margin: '0.285714rem 0 0' }}>受け取ったその日に届けるとは限りません。中継先まで運び、別のドライバーが届けることもあります（区間ごとの割当）。</p>
          </div>
        </div>
      </div>
      <TabBar on="home" />
    </>
  );
}
