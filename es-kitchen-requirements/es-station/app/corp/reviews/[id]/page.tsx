'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { areaApi, useQuery } from '@/lib/ops/core/client';
import corpDelivery from '@/lib/corp/areas/corp-delivery';
import { Badge, Card, Loading, NotFound, Page, PageHead, SectionTitle, useWho } from '../../_delivery/kit';
import { fmtDateTime } from '@/lib/format/date';

/* レビュー詳細（元の CorpReviewDetail）。投稿者はニックネームだけ（REQ-UI-008・2026/10/02） */
const api = areaApi(corpDelivery);

export default function CorpReviewDetailPage() {
  const { id } = useParams<{ id: string }>();
  const who = useWho();
  const { data: d, loading } = useQuery(api, 'review', { ...who, id: decodeURIComponent(id) });
  const head = (
    <PageHead
      crumbs={['ホーム', 'レビュー', 'レビュー詳細']} links={{ 0: '/corp', 1: '/corp/reviews' }}
      title={<>レビュー詳細 <span className="es-mono">{d?.id ?? ''}</span></>}
      actions={<Link className="es-btn es-btn--outline es-btn--primary es-btn--md" href="/corp/reviews">一覧へ戻る</Link>}
    />
  );
  if (loading) return <Page>{head}<Loading /></Page>;
  if (!d) return <Page>{head}<NotFound title="レビューが見つかりません" back="/corp/reviews" backLabel="一覧へ戻る" /></Page>;
  return (
    <Page>
      {head}
      <Card>
        <SectionTitle>投稿情報</SectionTitle>
        <div className="rd-g">
          <div><label>投稿日時</label>{fmtDateTime(d.at)}</div>
          <div><label>拠点</label>{d.site}</div>
          <div><label>ニックネーム</label>{d.nick}</div>
        </div>
      </Card>
      <Card>
        <SectionTitle>評価した商品</SectionTitle>
        <div className="es-table-wrap">
          <table className="es-table">
            <thead><tr><th>商品名</th><th>評価</th><th>評価タグ</th></tr></thead>
            <tbody>
              {d.items.map((p, i) => (
                <tr key={i}><td>{p.n}</td><td className="rv-st">{p.s}</td><td>{p.tags.map((t) => <span key={t} className="rv-tag"><Badge tone="neutral" outline>{t}</Badge></span>)}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <div className="rv-note">ご意見（自由記述）は法人には出しません。投稿者はニックネームだけを表示します（ユーザーID・メールアドレスは出しません）。</div>
    </Page>
  );
}
