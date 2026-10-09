'use client';

import Link from 'next/link';
import { areaApi, useQuery } from '@/lib/ops/core/client';
import corpDelivery from '@/lib/corp/areas/corp-delivery';
import { useCorpSignedIn } from '../_ui/CorpProvider';
import { CorpCsvExport } from '../_ui/csv';
import { Badge, Card, InlineMessage, Loading, Page, PageHead, useWho } from '../_delivery/kit';
import { fmtDateTime } from '@/lib/format/date';

/*
 * レビュー・ご意見（元の CorpReviewList）。自社の拠点の利用者が商品に付けたレビュー（運営Web の reviews.*）。
 * 投稿者はニックネームだけ出す。ユーザーID・メールアドレス・ご意見（自由記述）は出さない（REQ-UI-008・2026/10/02。10/01 の「匿名」を上書き）。拠点アカウントは自分の拠点だけ。
 */
const api = areaApi(corpDelivery);

export default function CorpReviewListPage() {
  const { account, isBranch } = useCorpSignedIn();
  const who = useWho();
  const { data } = useQuery(api, 'reviews', who);
  const scope = isBranch
    ? `拠点アカウントは自分の拠点（${account.branchName ?? ''}）のレビューだけを見られます。`
    : data && !data.rows.length ? '法人アカウントは自社のすべての拠点のレビューを見られます（まだレビューはありません）。' : '法人アカウントは自社のすべての拠点のレビューを見られます。';
  return (
    <Page>
      <PageHead
        crumbs={['ホーム', 'レビュー']} links={{ 0: '/corp' }} title="レビュー"
        sub={<div className="es-pagehead__sub" style={{ color: 'var(--text-low)', fontSize: '1rem' }}><span>{account.corpName}</span> ・ 自社の拠点の利用者が、商品に付けたレビューです</div>}
      />
      {data && (
        /* CSV出力：見てよい拠点のレビュー全件。画面の列だけ（ニックネームは出す。ユーザーID・メール・ご意見（自由記述）は出さない。REQ-UI-008） */
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <CorpCsvExport<NonNullable<typeof data>['rows'][number]> screen="レビュー・ご意見" rows={data.rows}
            columns={[{ label: 'レビューID', get: (r) => r.id }, { label: '投稿日時', get: (r) => r.at }, { label: '拠点', get: (r) => r.site }, { label: 'ニックネーム', get: (r) => r.nick }, { label: '商品と評価', get: (r) => r.p1 },
              { label: 'ほかの商品', get: (r) => r.more }, { label: '評価タグ', get: (r) => r.tags }]} />
        </div>
      )}
      <InlineMessage tone="info" title="利用者のレビュー（星と評価タグ）">投稿者はニックネームだけを表示します（ユーザーID・メールアドレスは出しません）。ご意見（自由記述）は法人には出しません。{scope}</InlineMessage>
      {!data ? <Loading /> : (
        <Card>
          <div className="rv-sum"><span>レビュー <b className="es-num">{data.sum.n}</b> 件</span><span>平均評価 <b className="es-num">{data.sum.avg}</b></span><span className="rv-st">{data.sum.stars}</span></div>
          <div className="es-table-wrap">
            <table className="es-table">
              <thead><tr><th>レビューID</th><th>投稿日時</th><th>拠点</th><th>ニックネーム</th><th>商品と評価</th><th>評価タグ</th></tr></thead>
              <tbody>
                {data.rows.map((r) => (
                  <tr key={r.id}>
                    <td><Link href={`/corp/reviews/${r.id}`} className="es-link es-mono">{r.id}</Link></td>
                    <td className="es-num">{fmtDateTime(r.at)}</td>
                    <td>{r.site}</td>
                    <td>{r.nick}</td>
                    <td><div className="rv-prod"><span>{r.p1}</span><span className="es-mono" style={{ fontSize: '0.857143rem', color: 'var(--text-low)' }}>{r.more}</span></div></td>
                    <td>{r.tags.map((t) => <span key={t} className="rv-tag"><Badge tone="neutral" outline>{t}</Badge></span>)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="rv-note">レビューIDを押すと詳細を開きます。</div>
        </Card>
      )}
    </Page>
  );
}
