'use client';

import { useState } from 'react';
import { useQuery } from '@/lib/ops/core/client';
import { GenListPage } from '@/app/ops/_general/GenListPage';
import { useRouter } from 'next/navigation';
import { listLinks } from '@/app/ops/_general/master/config';
import { KvGrid } from '@/app/ops/_general/master/parts';
import { useMasterDelete } from '@/app/ops/_general/master/useMasterDelete';
import { ListTable, useList, type ListCol } from '@/app/ops/_general/list';
import { api } from '@/app/ops/_general/parts';
import { Icon } from '@/app/ops/_ui/Icon';
import { useOps } from '@/app/ops/_ui/OpsProvider';
import { useCanAct } from '@/app/ops/_ui/perm';
import { Badge, Field, Modal } from '@/app/ops/_ui/ui';
import type { GenRow } from '@/lib/ops/general/types';
import { fmtAuto } from '@/lib/format/date';

/*
 * 仕入先マスタ（AW_SUPP_001）と申込の確認（AW_SUPP_002：申込中の仕入先の表）・申込の内容（AW_SUPP_007：承認・却下）・却下（AW_SUPP_003）。
 * 仕入先は仕入先サイトと同じ（共通 DB の suppliers）。承認・却下の処理と文言（S170・S171・E30）は前と同じ
 */
export default function Page() {
  const { openModal } = useOps();
  const router = useRouter();
  const del = useMasterDelete('supplier');
  const { data } = useQuery(api, 'supplierApps');
  const n = data?.length ?? 0;
  const before = n ? (
    <div className="notice warn" style={{ marginBottom: '0.857143rem' }}>
      <Icon name="warn" />
      <span>仕入先からの<b>取引の申込</b>が {n}件あります（申込中）。内容を確認して、承認（アカウントを発行）か却下を選びます。</span>
      <button className="btn sm" style={{ marginLeft: 'auto' }} onClick={() => openModal(<AppsModal />)}>申込を確認する</button>
    </div>
  ) : null;
  /* 名前→詳細・新規登録→登録・鉛筆→編集・ごみ箱→削除（Q01 → S02、進行中の発注があれば E241） */
  return <GenListPage genKey="supplier" before={before} {...listLinks('supplier', router.push)} onDel={(r) => del(r._uid)} />;
}

const APP_NOTE = '承認するとアカウント（ログインID＝仕入先ID）を発行し、担当者にメールで知らせます。却下は理由を入れてメールで知らせます。発注方法（ESステーション／メール／外部）は承認のあと仕入先マスタで決めます。';

/** 仕入先の申込の確認（AW_SUPP_002）：申込中の仕入先の表（申込日時の古い順・1ページ 10件）。「内容を見る」か名前で申込の内容へ */
function AppsModal() {
  const { openModal, closeModal } = useOps();
  const { data } = useQuery(api, 'supplierApps');
  const list = useList('supplierApps');
  type R = { _uid: string; no: string; at: string; name: string; rep: string; pic: string; kind: string; goods: string };
  const rows: R[] = (data ?? []).map(({ row: r, app: a }) => ({
    _uid: String(r.id), no: a?.no ?? '', at: a?.at ?? '', name: String(r.name ?? ''), rep: a?.rep ?? '', pic: a?.pic || String(r.pic ?? ''), kind: String(r.kind ?? ''), goods: a?.goods || String(r.goods ?? ''),
  })).sort((x, y) => x.at.localeCompare(y.at) || x.no.localeCompare(y.no));
  const open = (id: string) => openModal(<AppDetailModal id={id} />);
  const cols: ListCol<R>[] = [
    { key: 'no', label: '受付番号', td: (r) => <td className="mono">{r.no || '—'}</td> },
    { key: 'at', label: '申込日時', td: (r) => <td className="num" style={{ whiteSpace: 'nowrap' }}>{fmtAuto(r.at) || '—'}</td> },
    { key: 'name', label: '仕入先名', td: (r) => <td><button type="button" className="lnk u" onClick={() => open(r._uid)}>{r.name}</button></td> },
    { key: 'rep', label: '代表者', td: (r) => <td>{r.rep || '—'}</td> },
    { key: 'pic', label: '担当者', td: (r) => <td>{r.pic || '—'}</td> },
    { key: 'kind', label: '仕入れ先区分', td: (r) => <td>{r.kind || '—'}</td> },
    { key: 'goods', label: '作れる商品', td: (r) => <td><div className="clip" title={r.goods}>{r.goods || '—'}</div></td> },
    { key: '_act', label: '操作', act: true, td: (r) => <td className="act"><button type="button" className="btn out sm" onClick={() => open(r._uid)}>内容を見る</button></td> },
  ];
  return (
    <Modal title="仕入先の申込の確認" width={1080} footer={<><span style={{ flex: 1 }} /><button className="btn lg" onClick={closeModal}>閉じる</button></>}>
      {!data ? <p className="hint">読み込み中…</p>
        : rows.length ? <ListTable list={list} cols={cols} rows={list.apply(rows)} noNo />
          : <div className="empty" style={{ padding: '1.142857rem', textAlign: 'center' }}>表示するデータがありません。</div>}
      <div className="hint" style={{ marginTop: '0.714286rem' }}>{APP_NOTE}</div>
    </Modal>
  );
}

/** 仕入先の申込の内容（AW_SUPP_007）：申込フォームの項目を全部（表示だけ）。「却下する」「承認してアカウントを発行」「一覧へ戻る」 */
function AppDetailModal({ id }: { id: string }) {
  const { openModal, toast, toastError } = useOps();
  const canAct = useCanAct();
  const { data } = useQuery(api, 'supplierAppDetail', { id });
  const back = () => openModal(<AppsModal />);
  const ok = async () => {
    try {
      const r = await api.action('supplierApprove', { id });
      toast(`${r.name} を承認し、アカウント（${id}）を発行しました。担当者にメールで知らせました。`); /* S170 */
      back();
    } catch (e) { toastError(e); }
  };
  const fmt = (l: string, v: string) => (l === '申込日時' ? fmtAuto(v) : v);
  return (
    <Modal title="仕入先の申込の内容" width={960} onClose={back} footer={(
      <>
        <button className="btn lg ghost" onClick={back}>一覧へ戻る</button>
        <span style={{ flex: 1 }} />
        {data && canAct(api, 'supplierReject') && <button className="btn lg" onClick={() => openModal(<RejectModal id={id} />)}>却下する</button>}
        {data && canAct(api, 'supplierApprove') && <button className="btn pri lg" onClick={ok}>承認してアカウントを発行</button>}
      </>
    )}>
      {data === undefined ? <p className="hint">読み込み中…</p>
        : !data ? <p>この申込はもう処理されています（承認・却下済み）。「一覧へ戻る」で申込の表へ戻ります。</p>
          : (
            <>
              <h2 style={{ margin: '0 0 0.714286rem', fontSize: '1.142857rem' }}>{data.name} <span className="mono" style={{ fontSize: '0.928571rem' }}>{data.id}</span> <Badge v="申込中" /></h2>
              <KvGrid items={data.items.map(([l, v]) => [l, fmt(l, v)])} />
              <div className="hint">{APP_NOTE}</div>
            </>
          )}
    </Modal>
  );
}

/** 申込を却下する（AW_SUPP_003。理由は必須・500文字まで） */
function RejectModal({ id }: { id: string }) {
  const { openModal, toast, toastError } = useOps();
  const [reason, setReason] = useState('');
  const [err, setErr] = useState('');
  const back = () => openModal(<AppDetailModal id={id} />);
  const run = async () => {
    /* E01（必須）・E04（500文字まで） */
    if (!reason.trim()) { setErr('理由は必須項目です。'); return; }
    if ([...reason.trim()].length > 500) { setErr('500文字以内で入力してください。'); return; }
    try { const r = await api.action('supplierReject', { id, reason: reason.trim() }); toast(`${r.name} の申込を却下しました。メールで知らせました。`); /* S171 */ openModal(<AppsModal />); } catch (e) { toastError(e); }
  };
  return (
    <div className="ov">
      <div className="mbox" role="dialog" aria-modal="true" aria-label="申込を却下する" style={{ width: 'min(40rem,100%)' }}>
        <div className="mbox-h"><h3>申込を却下する</h3></div>
        <div className="mbox-b">
          <div className="stack" style={{ display: 'grid', gap: '0.857143rem' }}>
            <Field label="理由（メールに書きます）" req err={err || undefined} hint="500文字まで">
              <textarea className={`inp${err ? ' err' : ''}`} rows={4} placeholder="例）取扱商品の区分が募集条件に合わないため" value={reason} onChange={(e) => { setReason(e.target.value); if (err) setErr(''); }} />
            </Field>
          </div>
        </div>
        <div className="mbox-f"><span style={{ flex: 1 }} /><button className="btn lg ghost" onClick={back}>戻る</button><button className="btn pri lg" onClick={run}>却下する</button></div>
      </div>
    </div>
  );
}
