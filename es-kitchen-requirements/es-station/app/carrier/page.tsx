'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import carrier from '@/lib/carrier/area';
import { calRows, isoOf } from '@/lib/carrier/logic';
import { areaApi, useQuery } from '@/lib/ops/core/client';
import { today } from '@/lib/supplier/dates';
import { CalDay, Dow, Legend } from './_ui/Calendar';
import { Icon } from './_ui/Icon';
import { useCarrierSignedIn } from './_ui/CarrierProvider';
import { Crumb, Loading } from './_ui/parts';
import { fmtDate } from '@/lib/format/date';

/** ホーム（元の home()・OW_ANNO_001）：今月の配送スケジュール・お知らせ・未回答の見積もり依頼 */
export default function CarrierHome() {
  const { company } = useCarrierSignedIn();
  const router = useRouter();
  const { data } = useQuery(areaApi(carrier), 'home', { company });
  const t = isoOf(today());
  return (
    <>
      <Crumb items={['ホーム']} />
      <h1 className="ptitle">ホーム</h1>
      {!data ? <Loading /> : (
        <div className="home">
          <section className="box">
            <div className="bh"><h2>今月の配送スケジュール</h2><Link className="linkbtn" href="/carrier/schedule">スケジュールへ</Link></div>
            <div className="cal-wrap">
              <div className="cal-inner" style={{ minWidth: '40rem' }}>
                <Dow />
                <div className="cal">{calRows(data.deliveries, t.slice(0, 7), t).flat().map((c) => <CalDay key={c.iso} c={c} mode="home" />)}</div>
              </div>
            </div>
            <Legend />
          </section>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.142857rem', minWidth: 0 }}>
            <section className="box">
              <div className="bh"><h2>お知らせ</h2></div>
              <div className="news">
                {data.news.map((n) => (
                  <button type="button" key={n.id} onClick={() => router.push(`/carrier/news/${n.id}`)}>
                    <span className="meta">{fmtDate(n.when)} <span className="badge b-gray">{n.cat}</span></span>
                    <span className="t">{n.t}</span>
                    <span className="go"><Icon name="right" /></span>
                  </button>
                ))}
              </div>
            </section>
            <section className="box">
              <div className="bh"><h2>未回答の見積もり依頼</h2><Link className="linkbtn" href="/carrier/quotes">見積もり一覧へ</Link></div>
              <div className="news">
                {data.quotes.map((q) => (
                  <button type="button" key={q.id} onClick={() => router.push(`/carrier/quotes/${q.id}/answer`)}>
                    <span className="meta">{fmtDate(q.recv)} 受信 <span className="badge b-amber">未回答</span><span style={{ marginLeft: 'auto' }}><Icon name="cal" /> 回答期限: {fmtDate(q.due)}</span></span>
                    <span className="t">{q.t}</span>
                    <span className="go"><Icon name="right" /></span>
                  </button>
                ))}
                {!data.quotes.length && <p className="hint" style={{ margin: 0, padding: '0.571429rem 0' }}>未回答の見積もり依頼はありません。</p>}
              </div>
            </section>
          </div>
        </div>
      )}
    </>
  );
}
