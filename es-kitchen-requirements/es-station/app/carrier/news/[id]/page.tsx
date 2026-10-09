'use client';

import { useParams, useRouter } from 'next/navigation';
import carrier from '@/lib/carrier/area';
import { areaApi, useQuery } from '@/lib/ops/core/client';
import { AltPatterns, altTask } from '../../_ui/alt';
import { Icon } from '../../_ui/Icon';
import { Crumb, Loading } from '../../_ui/parts';
import { fmtDate } from '@/lib/format/date';

/** お知らせ詳細（元の newsDetail・altNews） */
export default function CarrierNews() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data } = useQuery(areaApi(carrier), 'news', { id: Number(id) });
  const back = (
    <div style={{ borderTop: '1px solid var(--line-2)', marginTop: '1.142857rem', paddingTop: '0.857143rem' }}>
      <button type="button" className="linkbtn" style={{ color: 'var(--green)', textDecoration: 'none', fontWeight: 700, display: 'flex', gap: '0.285714rem', alignItems: 'center' }} onClick={() => router.push('/carrier')}><Icon name="left" />一覧に戻る</button>
    </div>
  );
  if (!data) return <><Crumb items={[['ホーム', '/carrier'], 'お知らせ詳細']} /><Loading /></>;
  const a = data.alt;
  return (
    <>
      <Crumb items={[['ホーム', '/carrier'], 'お知らせ詳細']} />
      <h1 className="ptitle">お知らせ詳細</h1>
      {a ? (
        <article className="card" style={{ maxWidth: '82.857143rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.857143rem', flexWrap: 'wrap', alignItems: 'center' }}><span className="badge b-red">重要</span><span style={{ fontSize: '0.857143rem', color: 'var(--text-3)' }}>投稿日時：2026-10-02 15:00</span></div>
          <h2 style={{ margin: '0.714286rem 0 0', fontSize: '1.428571rem', paddingBottom: '1rem', borderBottom: '1px solid var(--line-2)' }}>【代替品のお知らせ】{a.id}：{a.bad}</h2>
          <div className="news-body">
            <p>{a.bad}（全ロット）に不良が見つかりました（不良発覚 {fmtDate(a.found)}・理由：{a.why}）。代わりの商品は「{a.sub}」です。</p>
            <h3>■ 対応のしかた</h3>
            <AltPatterns a={a} />
            <h3>■ 委託配送会社へのお願い</h3>
            <ul>
              <li>出荷指示は版番号つきで再送（rev+1）。荷物の中身が変わります</li>
              <li>{altTask(a)}</li>
              <li>対象の配送：<a href={`/carrier/deliveries/${a.del}`} onClick={(e) => { e.preventDefault(); router.push(`/carrier/deliveries/${a.del}`); }}>{a.del}</a>（青空フーズ 新宿本社・2026-10-07 納品）</li>
            </ul>
          </div>
          {back}
        </article>
      ) : (
        <article className="card" style={{ maxWidth: '82.857143rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.857143rem', flexWrap: 'wrap', alignItems: 'center' }}><span className="badge b-gray">{data.item.cat}</span><span style={{ fontSize: '0.857143rem', color: 'var(--text-3)' }}>投稿日時：{data.body.at}</span></div>
          <h2 style={{ margin: '0.714286rem 0 0', fontSize: '1.428571rem', paddingBottom: '1rem', borderBottom: '1px solid var(--line-2)' }}>{data.item.t}</h2>
          {/* 本文はお知らせの見本（seed）の HTML */}
          <div className="news-body" dangerouslySetInnerHTML={{ __html: data.body.body }} />
          {back}
        </article>
      )}
    </>
  );
}
