'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { alertCount, canShip, tabOf } from '@/lib/supplier/orders';
import { R } from '@/lib/supplier/routes';
import { useSignedIn } from '@/lib/supplier/store';
import { useDownload } from '../../_components/useDownload';
import type { Tab } from '@/lib/supplier/types';
import { Badge, Icon, Notice, PageHead } from '../../_components/ui';
import { fmtDateTime } from '@/lib/format/date';

/** S04 ホーム（未処理の知らせ・件数・お知らせ） */
export default function HomePage() {
  const { orders: mine, me, notices, setTab, setSelected, noticeOpen, setNoticeOpen } = useSignedIn();
  const download = useDownload();
  const router = useRouter();
  const count = (t: Tab) => mine.filter((o) => tabOf(o) === t).length;
  const ready = mine.filter(canShip).length;
  const alerts = mine.filter((o) => alertCount(o, me) > 0);
  const cancels = mine.filter((o) => o.ans === 'キャンセル' && !o.seen);
  const openTab = (t: Tab) => { setTab(t); setSelected((s) => { s.clear(); return s; }); router.push(R.orders); };

  return (
    <>
      <PageHead crumbs={['ホーム']} title="ホーム" />
      {alerts.length > 0 && (
        <div className="notice ng" style={{ marginBottom: '0.857143rem' }}>
          <Icon name="warn" />
          <span>本発注の承認が未処理です（{alerts.length}件）。本発注から営業日24時間ごとにアラートメールをお送りしています。処理が完了するまで繰り返します。</span>
          <button className="btn sm" style={{ marginLeft: 'auto' }} onClick={() => openTab('本発注の承認待ち')}>承認待ちを見る</button>
        </div>
      )}
      {cancels.length > 0 && (
        <div className="notice warn" style={{ marginBottom: '0.857143rem' }}>
          <Icon name="warn" />
          <span>運営が発注をキャンセルしました（{cancels.length}件）。出荷しないでください。</span>
          <button className="btn sm" style={{ marginLeft: 'auto' }} onClick={() => openTab('キャンセル')}>キャンセルを見る</button>
        </div>
      )}
      <div className="kpis">
        {([['納期回答待ち', '納期回答待ち'], ['本発注の承認待ち', '本発注の承認待ち'], ['出荷待ち', `出荷待ち（うち出荷可 ${ready}件）`], ['出荷済', '出荷済']] as [Tab, string][]).map(([t, l]) => (
          <button key={t} className="kpi" onClick={() => openTab(t)}>
            <small>{l}</small><b>{count(t)}</b><span>件</span>
          </button>
        ))}
      </div>
      <div className="card">
        <h2>お知らせ</h2>
        <ul className="news">
          {notices.map((n) => (
            <li key={n.id} className={noticeOpen === n.id ? 'open' : ''}>
              <button className="hd" onClick={() => setNoticeOpen(noticeOpen === n.id ? null : n.id)}>
                <span className="dt">{fmtDateTime(n.date)}</span>
                {n.imp && <span className="badge imp">重要</span>}
                <Badge v={n.cat} cls="b-mute" />
                <span className="tt">{n.title}</span>
                <Icon name="chev" className="chev" />
              </button>
              {noticeOpen === n.id && (
                <div className="bd">
                  {n.body}
                  {n.files.length > 0 && (
                    <div style={{ marginTop: '0.571429rem' }}>
                      {n.files.map((f) => (
                        <div key={f}>📎 <button className="lnk" onClick={() => download(f)}>{f}</button></div>
                      ))}
                    </div>
                  )}
                  <div style={{ marginTop: '0.571429rem' }}><Link className="lnk" href={R.notice(n.id)}>詳細ページを開く</Link></div>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
