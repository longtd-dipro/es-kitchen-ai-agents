'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import notice from '@/lib/domain/areas/notice';
import { domainApi, useDomainQuery } from '@/lib/domain/client';
import { fmtDateTime } from '@/lib/format/date';
import { useCanAct } from '../../_ui/perm';
import { Badge, Field, Notice, PageHead } from '../../_ui/ui';

/*
 * お問い合わせ詳細（hong 2026-10-05 I4＝B：一覧の行の中ではなく、別の画面で読む）。
 * 読むだけ：受付番号（HubSpot）・ID・送信日時・状態・法人名（ID）・拠点名（ID）・お名前・メール・電話・種類・件名・本文・通知先メールに送ったか。
 * 開いた時点で「新着」が外れる（運営の TOP の件数も減る）。返事・対応は HubSpot で行う（この画面では書かない）。
 */
const api = domainApi(notice);
const LIST = '/ops/inquiries';

function Ro({ label, value, mono, className = '' }: { label: string; value: React.ReactNode; mono?: boolean; className?: string }) {
  return (
    <Field label={label} className={className}>
      <div className={`inp${mono ? ' mono' : ''}`} style={{ display: 'flex', alignItems: 'center', background: 'var(--input-dis)', borderColor: 'var(--input-dis)', gap: '0.428571rem' }}>{value || <span className="muted">—</span>}</div>
    </Field>
  );
}

export default function InquiryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const canAct = useCanAct();
  const { data: x, loading } = useDomainQuery(api, 'inquiry', { id: decodeURIComponent(id) });
  /* 開いた時点で既読にする（権限がなければ既読にしない） */
  useEffect(() => {
    if (x && !x.readAt && canAct(api, 'markInquiryRead')) api.action('markInquiryRead', { id: x.id }).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [x?.id]);
  const back = () => router.push(LIST);
  return (
    <>
      <PageHead crumbs={['お知らせ設定', 'お問い合わせ（HubSpot 送信）', 'お問い合わせ詳細']} title={`お問い合わせ詳細${x ? `（${x.hubspotId}）` : ''}`}>
        <button className="btn out lg" onClick={back}>一覧へ戻る</button>
      </PageHead>
      {!x ? (
        <div className="card">{loading ? <span className="hint">読み込み中…</span> : <Notice kind="warn">お問い合わせ（{id}）が見つかりません。</Notice>}</div>
      ) : (
        <div className="card">
          <div className="sec">
            <div className="sec-h"><h2>お問い合わせの内容</h2></div>
            <div className="sec-b">
              <div className="fg c2">
                <Ro label="受付番号（HubSpot）" value={x.hubspotId} mono />
                <Ro label="ID" value={x.id} mono />
                <Ro label="送信日時" value={fmtDateTime(x.at)} />
                <Ro label="状態" value={<Badge v={x.status} cls={'b-ok'} />} />
                <Ro label="法人名" value={<>{x.corpName}<span className="hint mono">{x.corpId}</span></>} />
                <Ro label="拠点名" value={x.branchId ? <>{x.branchName}<span className="hint mono">{x.branchId}</span></> : ''} />
                <Ro label="お名前" value={x.name} />
                <Ro label="メールアドレス" value={x.email} />
                <Ro label="電話番号" value={x.tel} />
                <Ro label="種類" value={x.category} />
                <Ro label="件名" value={x.subject} className="full" />
                <Field label="本文" className="full">
                  <div className="inp" style={{ height: 'auto', minHeight: '8rem', whiteSpace: 'pre-wrap', padding: '0.571429rem 0.857143rem', background: 'var(--input-dis)', borderColor: 'var(--input-dis)' }}>{x.body}</div>
                </Field>
                <Ro label="通知先メール" value={x.mailedTo ? `${x.mailedTo} に送信済` : '送っていない（通知先メールの設定なし）'} className="full" />
              </div>
              <p className="hint" style={{ margin: '0.571429rem 0 0' }}>返事・対応は HubSpot で行います（この画面では書きません）。開いた時点で「新着」が外れます。</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
