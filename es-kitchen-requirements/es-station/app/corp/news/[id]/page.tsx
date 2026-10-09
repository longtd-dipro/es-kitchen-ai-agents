'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { DEMO } from '@/lib/demo';
import { areaApi, useQuery } from '@/lib/ops/core/client';
import corpDelivery from '@/lib/corp/areas/corp-delivery';
import { useCorpSignedIn } from '../../_ui/CorpProvider';
import { Badge, Card, Loading, NotFound, Page, PageHead } from '../../_delivery/kit';
import { fmtDateTime } from '@/lib/format/date';

/* お知らせ詳細（元の CorpNewsDetail） */
const api = areaApi(corpDelivery);

export default function CorpNewsDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useCorpSignedIn();
  const { data: d, loading } = useQuery(api, 'newsItem', { id: decodeURIComponent(id) });
  return (
    <Page>
      <PageHead crumbs={['ホーム', 'お知らせ詳細']} links={{ 0: '/corp' }} title="お知らせ詳細" />
      {loading ? <Loading /> : !d ? <NotFound title="お知らせが見つかりません" back="/corp/news" backLabel="一覧に戻る" /> : (
        <Card>
          <div className="nd">
            <div className="nd-meta">
              <Badge tone="neutral">{d.cat}</Badge>
              <span className="nd-at">投稿日時：{fmtDateTime(d.at)}</span>
            </div>
            <h2 className="nd-title">{d.title}</h2>
            <div className="nd-body">
              {d.blocks.map((b, i) => (
                <div key={i} style={{ display: 'contents' }}>
                  {b.p && <p>{b.p}</p>}
                  {b.h && <div className="nd-h">■ {b.h}</div>}
                  {b.li && <ul className="nd-ul">{b.li.map((t, j) => <li key={j}>{t}</li>)}</ul>}
                </div>
              ))}
              {d.att && d.att.length > 0 && (
                <>
                  <div className="nd-h">■ 添付ファイル</div>
                  <div className="nd-att">
                    {d.att.map((a) => <a key={a} href="#" className="es-link" onClick={(e) => { e.preventDefault(); toast(DEMO ? '添付ファイルを開きます（デモの対象外）' : '添付ファイルを開きます'); }}>{a}</a>)}
                  </div>
                </>
              )}
            </div>
            <div className="nd-foot"><Link href="/corp/news" className="nd-back">‹ 一覧に戻る</Link></div>
          </div>
        </Card>
      )}
    </Page>
  );
}
