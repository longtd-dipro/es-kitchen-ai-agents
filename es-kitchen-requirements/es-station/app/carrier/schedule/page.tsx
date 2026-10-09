'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import carrier from '@/lib/carrier/area';
import { calRows, isoOf } from '@/lib/carrier/logic';
import { areaApi, useQuery } from '@/lib/ops/core/client';
import { today } from '@/lib/supplier/dates';
import { CalDay, Dow, Legend } from '../_ui/Calendar';
import { Icon } from '../_ui/Icon';
import { useCarrierSignedIn } from '../_ui/CarrierProvider';
import { Crumb, Loading, TagIcon, Unapplied } from '../_ui/parts';

/** スケジュール（元の schedule()・OW_SCHED_001）：月・週の切替。件数は配送管理の配送の納品日で数える */
export default function CarrierSchedule() {
  const { company, toast } = useCarrierSignedIn();
  const router = useRouter();
  const [view, setView] = useState<'month' | 'week'>('month');
  const { data } = useQuery(areaApi(carrier), 'deliveries', { company });
  /* 検索（RD-CM-073：送り状番号・拠点名・住所）。下書き（draft）は「検索」か Enter で q に入る */
  const [draft, setDraft] = useState({ a: '', b: '' });
  const [q, setQ] = useState({ a: '', b: '' });
  const t = isoOf(today()), ym = t.slice(0, 7);
  const month = view === 'month';
  const sinput = { border: 0, outline: 0, background: 'none', flex: 1, minWidth: 0 } as const;
  let grid = null;
  if (data) {
    const ds0 = data.deliveries.filter((d) => (!q.a || [d.to, d.no, d.deliveryId, ...(d.track ?? []).map((x) => x.no)].join(' ').includes(q.a)) && (!q.b || d.addr.includes(q.b)));
    const rows = calRows(ds0, ym, t);
    if (month) {
      grid = <><div className="cal-wrap"><div className="cal-inner"><Dow /><div className="cal">{rows.flat().map((c) => <CalDay key={c.iso} c={c} />)}</div></div></div><Legend /></>;
    } else {
      const wk = rows.find((r) => r.some((c) => c.today)) ?? rows[0];
      grid = (
        <div className="cal-wrap">
          <div className="cal-inner">
            <Dow boxed />
            <div className="cal">{wk.map((c) => <CalDay key={c.iso} c={c} />)}</div>
            <div className="cal">
              {wk.map((c) => {
                const ds = ds0.filter((d) => d.date === c.iso);
                return (
                  <div key={c.iso} className="wk-list">
                    {ds.map((d) => (
                      <button type="button" key={d.no} title={`${d.no} ${d.to}`} onClick={() => router.push(`/carrier/deliveries/${d.no}`)}><TagIcon k={d.temp} /><span>{d.to}</span></button>
                    ))}
                    {!ds.length && <span className="hint" style={{ fontSize: '0.857143rem' }}>配送なし</span>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      );
    }
  }
  return (
    <>
      <Crumb items={[['ホーム', '/carrier'], 'スケジュール']} />
      <h1 className="ptitle">スケジュール</h1>
      <div className="panel">
        <div className="calbar">
          <div className="toggle" role="tablist">
            <button type="button" className={month ? 'on' : ''} onClick={() => setView('month')}><Icon name="cal" />月</button>
            <button type="button" className={!month ? 'on' : ''} onClick={() => setView('week')}><Icon name="list" />週</button>
          </div>
          <div className="inp" style={{ width: '12.142857rem' }}>{ym}<span style={{ marginLeft: 'auto' }}><Icon name="cal" /></span></div>
          <button type="button" className="icb" aria-label="前へ"><Icon name="left" /></button>
          <button type="button" className="icb" aria-label="次へ"><Icon name="right" /></button>
          <button type="button" className="btn sm">今日</button>
        </div>
        <form className="search-row" onSubmit={(e) => { e.preventDefault(); const nq = { a: draft.a.trim(), b: draft.b.trim() }; setQ(nq); toast(data ? `検索しました（${data.deliveries.filter((d) => (!nq.a || [d.to, d.no, d.deliveryId, ...(d.track ?? []).map((x) => x.no)].join(' ').includes(nq.a)) && (!nq.b || d.addr.includes(nq.b))).length}件）` : '検索しました'); }}>
          <button type="button" className="icb" style={{ border: 0 }} aria-label="詳細検索"><Icon name="down" /></button>
          <div className="inp"><Icon name="search" /><input style={sinput} placeholder="拠点名、配送No、送り状番号" value={draft.a} onChange={(e) => setDraft({ ...draft, a: e.target.value })} /></div>
          <div className="inp"><Icon name="search" /><input style={sinput} placeholder="届け先の住所" value={draft.b} onChange={(e) => setDraft({ ...draft, b: e.target.value })} /></div>
          <button type="button" className="btn out" onClick={() => { setDraft({ a: '', b: '' }); setQ({ a: '', b: '' }); }}>クリア</button><Unapplied show={draft.a.trim() !== q.a || draft.b.trim() !== q.b} /><button className="btn pri">検索</button>
        </form>
        {grid ?? <Loading />}
      </div>
    </>
  );
}
