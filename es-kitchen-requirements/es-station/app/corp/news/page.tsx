'use client';

import Link from 'next/link';
import { areaApi, useQuery } from '@/lib/ops/core/client';
import corpDelivery from '@/lib/corp/areas/corp-delivery';
import { Badge, Card, Loading, Page, PageHead } from '../_delivery/kit';
import { fmtDateTime } from '@/lib/format/date';

/* お知らせ一覧（元の CorpNewsList）。公開中で、自分が配信対象のお知らせだけ */
const api = areaApi(corpDelivery);

export default function CorpNewsListPage() {
  const { data } = useQuery(api, 'news', {});
  return (
    <Page>
      <PageHead crumbs={['ホーム', 'お知らせ一覧']} links={{ 0: '/corp' }} title="お知らせ一覧" />
      {!data ? <Loading /> : (
        <Card>
          <div className="es-table-wrap">
            <table className="es-table">
              <thead><tr><th style={{ width: '12.857143rem' }}>投稿日時</th><th style={{ width: '10rem' }}>カテゴリ</th><th>タイトル</th></tr></thead>
              <tbody>
                {data.map((n) => (
                  <tr key={n.id}><td className="es-num">{fmtDateTime(n.at)}</td><td><Badge tone="neutral">{n.cat}</Badge></td><td><Link href={`/corp/news/${n.id}`} className="es-link">{n.title}</Link></td></tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="nl-n">公開中で、自分が配信対象のお知らせだけを表示します。タイトルを押すと詳細を開きます。</div>
        </Card>
      )}
    </Page>
  );
}
