'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import notice from '@/lib/domain/areas/notice';
import { domainApi, useDomainQuery } from '@/lib/domain/client';
import { fmtDateTime } from '@/lib/format/date';
import { OpsCsvExport } from '../_ui/csv';
import { Badge, Notice, PageHead } from '../_ui/ui';

/*
 * お知らせ設定 ＞ お問い合わせ（HubSpot 送信）。法人Web の「お問い合わせ」から HubSpot へ送ったものの記録（HubSpot Phase 2）。
 * デモは HubSpot に送らず、共通データ（dm.notice.inquiries）に 送信済（HubSpot） として残すだけ。返事・対応は HubSpot で行う（CRM の同期は Phase 3）。
 * 行を押すと お問い合わせ詳細（/ops/inquiries/[id]）へ。開いた時点で「新着」が外れる（hong 2026-10-05 I4＝B・I5＝A）。
 */
const api = domainApi(notice);

export default function InquiriesPage() {
  const router = useRouter();
  const { data } = useDomainQuery(api, 'inquiries', {});
  const rows = data ?? [];
  return (
    <>
      <PageHead crumbs={['お知らせ設定', 'お問い合わせ（HubSpot 送信）']} title="お問い合わせ（HubSpot 送信）">
        <OpsCsvExport<(typeof rows)[number]> screen="お問い合わせ" rows={rows} columns={[]} source={{ kind: 'dm.notice.inquiries', id: (x) => x.id }} />
      </PageHead>
      <Notice>法人Web のお問い合わせは HubSpot に送ります（デモ：実際には送らず、送った記録だけを残します）。返事・対応は HubSpot で行います。行を押すと詳細を開き、「新着」が外れます（運営の TOP の件数）。</Notice>
      <div className="card">
        <div className="tbl-wrap">
          <table className="tbl">
            <thead><tr><th>送信日時</th><th>受付番号（HubSpot）</th><th>法人・拠点</th><th>お名前・メール</th><th>種類</th><th>件名</th><th>状態</th></tr></thead>
            <tbody>
              {rows.length ? rows.map((x) => (
                <tr key={x.id} onClick={() => router.push(`/ops/inquiries/${x.id}`)} style={{ cursor: 'pointer' }}>
                  <td>{fmtDateTime(x.at)}{!x.readAt && <div><Badge v="新着" cls="b-warn" /></div>}</td>
                  <td className="mono">{x.hubspotId}<div className="hint">{x.id}</div></td>
                  <td>{x.corpId}{x.branchId ? ` ／ ${x.branchId}` : ''}</td>
                  <td>{x.name}<div className="hint">{x.email}{x.tel ? ` ・ ${x.tel}` : ''}</div></td>
                  <td>{x.category}</td>
                  <td><Link className="lnk u" href={`/ops/inquiries/${x.id}`} onClick={(e) => e.stopPropagation()}>{x.subject}</Link></td>
                  <td><Badge v={x.status} cls="b-ok" /></td>
                </tr>
              )) : <tr><td colSpan={7} className="hint">{data ? 'まだお問い合わせはありません' : '読み込み中…'}</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="hint" style={{ marginTop: '0.571429rem' }}>行を押すと詳細を開きます。</div>
      </div>
    </>
  );
}
