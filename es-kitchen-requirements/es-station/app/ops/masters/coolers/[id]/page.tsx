'use client';

import Link from 'next/link';
import { use, useState } from 'react';
import { ListTable, useList, type ListCol } from '@/app/ops/_general/list';
import { Loading } from '@/app/ops/_general/parts';
import { useOps } from '@/app/ops/_ui/OpsProvider';
import { Badge, Field, PageHead } from '@/app/ops/_ui/ui';
import carrierArea from '@/lib/domain/areas/carrier';
import { domainApi, useDomainQuery } from '@/lib/domain/client';
import type { GenRow } from '@/lib/ops/general/types';
import { CoolerModal } from '../_ui/CoolerModal';

const api = domainApi(carrierArea);
type Hist = { id: string; at: string; action: string; detail: string; by: string };
const HIST_COLS: ListCol<Hist>[] = [
  { key: 'at', label: '変更日時', td: (r) => <td style={{ whiteSpace: 'nowrap' }}>{r.at.replace(/\//g, '-')}</td> },
  { key: 'detail', label: '変更内容', td: (r) => <td><b>{r.action}</b>{r.detail ? `：${r.detail}` : ''}</td> },
  { key: 'by', label: '変更者' },
];
const dash = (v: unknown) => (v === undefined || v === null || v === '' ? '—' : String(v));
const TABS = ['基本情報', '変更履歴'] as const;

/**
 * 保冷バッグ台帳の詳細（AW_COOL_003・表示だけ）。タブ：基本情報／変更履歴（変更日時・変更内容・変更者。新しい順・10件／ページ）。
 * 「編集」は一覧と同じ「貸与の記録の編集」のモーダル（権限 rental の編集ができる役割だけ）
 */
export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { can, openModal } = useOps();
  const [tab, setTab] = useState<(typeof TABS)[number]>('基本情報');
  const list = useList(`cooler-hist:${id}`);
  const { data } = useDomainQuery(api, 'cooler', { id });
  const back = '/ops/masters/coolers';
  if (data === undefined) return <Loading />;
  if (!data) return <div className="card"><p>データが見つかりません（{id}）</p><Link className="lnk u" href={back}>一覧へ戻る</Link></div>;
  const c = data.cooler;
  const row: GenRow = {
    _uid: c.id, no: c.id, kind: c.kind, qty: String(c.qty), cid: c.carrierId, did: c.driverId, date: c.issuedOn, status: c.status, memo: c.memo,
    retOn: c.returnedOn ?? '', retQty: c.returnedQty !== undefined ? String(c.returnedQty) : '',
  };
  const editable = can('rental', 'update') && c.status !== '廃棄';
  return (
    <>
      <PageHead crumbs={['マスタ管理', '配送関連', '保冷バッグ台帳', c.id]} title={`保冷バッグ台帳 ${c.id}`}>
        <Link className="btn lg" href={back}>一覧へ戻る</Link>
        {editable && <button className="btn pri lg" onClick={() => openModal(<CoolerModal row={row} />)}>編集</button>}
      </PageHead>
      <div className="card">
        <div className="tabs">
          {TABS.map((t) => <button key={t} className={t === tab ? 'on' : ''} onClick={() => setTab(t)}>{t}</button>)}
        </div>
        {tab === '基本情報' ? (
          <div className="fg c2">
            <Field label="番号"><span className="mono">{c.id}</span></Field>
            <Field label="状態"><Badge v={c.status} /></Field>
            <Field label="種類"><span>{c.kind}</span></Field>
            <Field label="数"><span>{c.qty}</span></Field>
            <Field label="委託配送先"><span>{data.carrierName}</span></Field>
            <Field label="都道府県"><span>{dash(c.pref)}</span></Field>
            <Field label="渡した配送スタッフ"><span>{c.driverId ? `${c.driverId} ${data.driverName}`.trim() : '—'}</span></Field>
            <Field label="渡した日"><span>{c.issuedOn.replace(/\//g, '-')}</span></Field>
            <Field label="返却日"><span>{c.returnedOn ? c.returnedOn.replace(/\//g, '-') : '—'}</span></Field>
            <Field label="返却数"><span>{dash(c.returnedQty)}</span></Field>
            <Field label="メモ" className="full"><span style={{ whiteSpace: 'pre-wrap' }}>{dash(c.memo)}</span></Field>
          </div>
        ) : (
          <ListTable list={list} cols={HIST_COLS} rows={data.history} rowKey={(r) => r.id} />
        )}
      </div>
    </>
  );
}
