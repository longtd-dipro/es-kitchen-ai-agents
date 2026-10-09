'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { R } from '@/lib/supplier/routes';
import { useSignedIn } from '@/lib/supplier/store';
import { useDownload } from '../../../_components/useDownload';
import { Badge, Icon, PageHead } from '../../../_components/ui';
import { fmtDateTime } from '@/lib/format/date';

/** S05 お知らせ詳細 */
export default function NoticePage() {
  const { id } = useParams<{ id: string }>();
  const { notices } = useSignedIn();
  const dl = useDownload();
  const n = notices.find((x) => x.id === +id);
  if (!n) {
    return (
      <>
        <PageHead crumbs={['ホーム', 'お知らせ']} title="お知らせ詳細" />
        <div className="empty">お知らせが見つかりません</div>
      </>
    );
  }
  return (
    <>
      <PageHead crumbs={['ホーム', 'お知らせ']} title="お知らせ詳細">
        <Link className="btn" href={R.home} style={{ textDecoration: 'none' }}>一覧に戻る</Link>
      </PageHead>
      <div className="card">
        <div style={{ display: 'flex', gap: '0.571429rem', alignItems: 'center', marginBottom: '0.571429rem' }}>
          {n.imp && <span className="badge imp b-ng">重要</span>}
          <Badge v={n.cat} cls="b-mute" />
          <span className="muted">{fmtDateTime(n.date)}</span>
        </div>
        <h2 style={{ fontSize: '1.428571rem', margin: '0 0 1.142857rem' }}>{n.title}</h2>
        <div style={{ whiteSpace: 'pre-wrap' }}>{n.body}</div>
        {n.files.length > 0 && (
          <div style={{ marginTop: '1.428571rem', borderTop: '1px solid var(--line)', paddingTop: '0.857143rem' }}>
            <b>添付ファイル</b>
            {n.files.map((f) => (
              <div className="manual-item" style={{ padding: '0.571429rem 0' }} key={f}>
                <div className="pdf">PDF</div>
                <div className="t">{f}</div>
                <button className="btn sm out" onClick={() => dl(f)}><Icon name="down" />ダウンロード</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
