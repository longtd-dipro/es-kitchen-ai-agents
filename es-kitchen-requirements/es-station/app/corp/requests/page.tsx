'use client';

import Link from 'next/link';
import { useState } from 'react';
import { DEMO } from '@/lib/demo';
import { areaApi, useQuery } from '@/lib/ops/core/client';
import corpDelivery from '@/lib/corp/areas/corp-delivery';
import { CR_STATES } from '@/lib/corp/delivery/logic';
import { useCorpSignedIn } from '../_ui/CorpProvider';
import { Badge, Button, Card, EsIcon, Page, PageHead, Pagination, usePaging, useWho } from '../_delivery/kit';
/* requests/ の layout は契約の申請（別の担当）にも効くので、CSS はこの画面で読み込む */
import '../_delivery/delivery.css';
import { fmtDatesIn } from '@/lib/format/date';

/*
 * 申請 ＞ お届け日の変更（元の CorpChangeRequests）。「契約の申請」のタブは /corp/requests/contract（別の担当の画面）。
 * 法人アカウントは自社のすべての拠点の申請、拠点アカウントはその拠点の申請だけ。新しい申請はお届け詳細から出す。
 */
const api = areaApi(corpDelivery);
const EMPTY = { q: '', st: '', from: '', to: '' };

export default function CorpChangeRequestsPage() {
  const { account, isBranch, toast } = useCorpSignedIn();
  const who = useWho();
  const [f, setF] = useState(EMPTY);
  const [args, setArgs] = useState(EMPTY);
  const { data } = useQuery(api, 'requests', { ...who, ...args });
  const rows = data?.rows ?? [];
  const paging = usePaging(JSON.stringify(args));
  const shown = rows.slice((paging.page - 1) * paging.per, paging.page * paging.per);
  const whoName = isBranch ? `${account.corpName} ${account.branchName ?? ''}` : account.corpName;
  const scope = isBranch ? '拠点アカウント（この拠点の申請だけ表示）' : '法人アカウント（自社のすべての拠点の申請を表示）';
  const input = (k: 'q' | 'from' | 'to', ph: string, icon: string, type = 'text', style?: React.CSSProperties) => (
    <div className={`es-field${k === 'q' ? ' es-grow' : ''}`} style={style}>
      <div className="es-input es-input--md">
        <EsIcon name={icon} size={18} />
        <input type={type} placeholder={ph} aria-label={ph} value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} />
      </div>
    </div>
  );

  return (
    <Page>
      <PageHead
        crumbs={['申請', 'お届け日の変更申請']}
        title="申請"
        stat={<><span>{whoName}</span><span className="k">権限</span><span>{scope}</span></>}
      />
      <Card>
        <div className="es-tabs" role="tablist">
          <button type="button" role="tab" aria-selected="true" className="es-tab is-active">お届け日の変更{data && data.att > 0 && <span className="es-tab__count">{data.att}</span>}</button>
          <Link role="tab" aria-selected="false" className="es-tab" href="/corp/requests/contract">契約の申請</Link>
        </div>
        <form className="es-search" role="search" onSubmit={(e) => { e.preventDefault(); setArgs(f); }}>
          <div className="es-search__left">
            <div className="es-search__fields">
              {input('q', '申請番号・お届け番号', 'Search')}
              <div className="es-field">
                <div className="es-input es-select es-input--md">
                  <select value={f.st} aria-label="状態" onChange={(e) => setF({ ...f, st: e.target.value })}>
                    <option value="">状態</option>
                    {CR_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <EsIcon name="CaretDown" size={16} />
                </div>
              </div>
              {input('from', 'お届け日（から）', 'CalendarBlank', 'date', { width: '12.571429rem' })}
              {input('to', 'お届け日（まで）', 'CalendarBlank', 'date', { width: '12.571429rem' })}
            </div>
          </div>
          <div className="es-search__actions">
            <div className="es-search__main">
              <Button variant="outline" onClick={() => { setF(EMPTY); setArgs(EMPTY); }}>クリア</Button>
              <button type="submit" className="es-btn es-btn--solid es-btn--primary es-btn--md"><span>検索</span></button>
            </div>
          </div>
        </form>
        <div className="tools">
          <span><b style={{ color: 'var(--text-high)' }}>お届け日の変更申請 {rows.length}件</b>（申請日の新しい順）</span>
          <span className="note">新しい申請は、お届け詳細の「お届け日の変更を申請」から出します。</span>
        </div>
        <div className="es-table-wrap">
          <table className="es-table">
            <thead><tr><th>申請番号</th><th>拠点</th><th>申請日</th><th>お届け日（今）</th><th>変更したい日</th><th>状態</th><th>ESキッチンからのご返事</th><th>期限・処理日</th></tr></thead>
            <tbody>
              {shown.map((r) => (
                <tr key={r.id} className={r.status === '別の日のご提案' ? 'att' : ''}>
                  <td className="es-mono">
                    {r.hasDetail
                      ? <Link href={`/corp/deliveries/${r.delivery}?from=requests`}>{r.id}</Link>
                      : <a href="#" onClick={(e) => { e.preventDefault(); toast(DEMO ? 'このお届けの詳細はデモでは省略しています（9/15・10/05・10/13・11/10・11/24 を開けます）' : 'このお届けの詳細はまだ表示できません'); }}>{r.id}</a>}
                  </td>
                  <td>{r.siteName}</td>
                  <td className="es-num">{fmtDatesIn(r.at)}</td>
                  <td className="es-num">{r.curText}</td>
                  <td className="es-num">{r.wantText}</td>
                  <td><Badge tone={r.tone}>{r.status}</Badge></td>
                  <td className="clip" style={{ maxWidth: '17.142857rem' }} title={r.reply}>{r.reply}</td>
                  <td className="es-num">{fmtDatesIn(r.due)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {data && (rows.length > 0
          ? <Pagination total={rows.length} page={paging.page} per={paging.per} onPage={paging.setPage} onPer={paging.setPer} />
          : <p className="note" style={{ padding: '1.142857rem 0' }}>お届け日の変更申請はありません。</p>)}
        <div className="legend">
          <span><Badge tone="info">申請中</Badge>ESキッチンが確認しています</span>
          <span><Badge tone="warning">別の日のご提案</Badge>ご返事が必要です（期限までにお届け詳細から）</span>
          <span><Badge tone="success">承認</Badge>お届け日を変更しました</span>
          <span><Badge tone="neutral">否認</Badge>今のお届け日のままです（理由を表示）</span>
          <span><Badge tone="neutral">取り下げ</Badge>申請を取り下げました</span>
          <span><Badge tone="neutral">お断り済（ESキッチンで調整中）</Badge>別の日のご提案をお断りしました（ESキッチンが調整してご連絡します）</span>
        </div>
      </Card>
    </Page>
  );
}
