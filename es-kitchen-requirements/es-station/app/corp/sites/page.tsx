'use client';

import { CorpCsvExport } from '../_ui/csv';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useQuery } from '@/lib/ops/core/client';
import { blocked, siteSt, TONE_SITE } from '@/lib/corp/sites/logic';
import { useCorpSignedIn } from '../_ui/CorpProvider';
import { Badge, Button, Card, EmptyState, PageHead, Pagination, RowActions, SearchPanel, Select, TextField } from './_components/es';
import { api, Loading, Lnk, SitesFrame, Tbl, Td, useAcct } from './_components/parts';
import { corpTerm } from '@/lib/domain/terms';

/* 拠点一覧（列は ENTITY の拠点一覧と同じ）。元：22_法人_拠点管理.html の List */
type Q = { t?: string; st?: string; kind?: string; bill?: string; pref?: string };

export default function SitesPage() {
  return <SitesFrame><List /></SitesFrame>;
}

function List() {
  const router = useRouter();
  const acct = useAcct();
  const { isBranch } = useCorpSignedIn();
  const { data } = useQuery(api, 'sites', { acct });
  const [q, setQ] = useState<Q>({});
  const [qv, setQv] = useState<Q>({});
  if (!data) return <Loading />;
  const rows = data.rows.filter((s) => {
    if (q.t && !(s.id + s.name).includes(q.t)) return false;
    if (q.st && siteSt(s.status) !== q.st) return false;
    if (q.kind && corpTerm(s.ct.kind) !== q.kind) return false;
    if (q.bill && s.billTo !== q.bill) return false;
    if (q.pref && s.pref !== q.pref) return false;
    return true;
  });
  const prefs = data.rows.map((x) => x.pref).filter((x, i, a) => a.indexOf(x) === i);
  const set = (k: keyof Q) => (v: string) => setQv({ ...qv, [k]: v });
  return (
    <>
      <PageHead crumbs={['拠点管理']} title="拠点管理"
        stat={<><span>{data.corpName}</span><span className="k">権限</span><span>{isBranch ? '拠点アカウント（この拠点だけ）' : '法人アカウント（自社のすべての拠点）'}</span></>}
        actions={<>
          <CorpCsvExport<(typeof rows)[number]> screen="拠点一覧" rows={rows}
            filters={[{ label: '拠点ID・拠点名', value: q.t ?? '' }, { label: '拠点状態', value: q.st ?? '' }, { label: '契約種別', value: q.kind ?? '' }, { label: '請求書のあて先', value: q.bill ?? '' }, { label: '都道府県', value: q.pref ?? '' }]}
            columns={[{ label: '拠点ID', get: (s) => s.id }, { label: '拠点名', get: (s) => s.name }, { label: '所属法人', get: () => data.corpName }, { label: '拠点状態', get: (s) => siteSt(s.status) },
              { label: '契約種別', get: (s) => corpTerm(s.ct.kind) }, { label: '現在のプラン', get: (s) => s.ct.plan }, { label: '当初契約開始年月', get: (s) => s.ct.origYm }, { label: '継続年月', get: (s) => s.ct.dur },
              { label: '請求書のあて先', get: (s) => s.billTo }, { label: '住所', get: (s) => s.pref + s.city + s.a1 }, { label: '登録日時', get: (s) => s.created }]}
            source={{ kind: 'dm.org.branches', id: (s) => s.id }} />
          <Button variant="outline" onClick={() => router.push('/corp/requests/contract/new')}>変更のお申し込み</Button>
          {!isBranch ? <Button icon="Plus" onClick={() => router.push('/corp/sites/new')}>拠点を追加</Button> : null /* RV-CORP-20261002 C-b */}
        </>} />
      <Card>
        <SearchPanel onSearch={() => setQ(qv)} onClear={() => { setQ({}); setQv({}); }}>
          <TextField className="es-grow" icon="Search" placeholder="拠点ID・拠点名" value={qv.t ?? ''} onChange={set('t')} />
          <Select placeholder="拠点状態" options={['ご契約手続き中', 'ご利用中', '休止中', '閉鎖予定', '閉鎖済']} value={qv.st ?? ''} onChange={set('st')} />
          <Select placeholder="契約種別" options={[corpTerm('本導入'), 'お試しキャンペーン']} value={qv.kind ?? ''} onChange={set('kind')} />
          <Select placeholder="請求書のあて先" options={['法人', 'この拠点']} value={qv.bill ?? ''} onChange={set('bill')} />
          <Select placeholder="都道府県" options={prefs} value={qv.pref ?? ''} onChange={set('pref')} />
        </SearchPanel>
        <div className="tools">
          <span><b style={{ color: 'var(--text-high)' }}>拠点 {rows.length}件</b></span>
          <span className="note">「ご契約手続き中」は、お申し込みの受付後、ご利用開始前の状態です。拠点の情報・ご担当者・請求書のあて先は拠点詳細の「編集」で、プラン・お届け・設備・休止・解約は「変更のお申し込み」で承ります。</span>
        </div>
        {rows.length ? (
          <Tbl cols={['拠点ID', '拠点名', '所属法人', '拠点状態', '契約種別', '現在のプラン', '当初契約開始年月', '継続年月', '請求書のあて先', '住所', '登録日時', { label: '操作', cls: 'c' }]}>
            {rows.map((s) => (
              <tr key={s.id}>
                <td className="es-mono"><Lnk onClick={() => router.push('/corp/sites/' + s.id)}>{s.id}</Lnk></td>
                <Td v={s.name} /><Td v={data.corpName} />
                <td><span className="cb-badges"><Badge tone={TONE_SITE[s.status]}>{siteSt(s.status)}</Badge>
                  {blocked(s) ? <Badge tone="info">申請中</Badge> : s.band && s.band.at ? <Badge tone="warning" outline>休止の予定</Badge> : null}</span></td>
                <Td v={corpTerm(s.ct.kind)} /><Td v={s.ct.plan} /><Td v={s.ct.origYm} cls="es-num" /><Td v={s.ct.dur} cls="es-num" />
                <Td v={s.billTo} /><Td v={s.pref + s.city + s.a1} /><Td v={s.created} cls="es-num" />
                <td className="c"><RowActions label={s.name} onEdit={() => router.push(`/corp/sites/${s.id}/edit`)} /></td>
              </tr>
            ))}
          </Tbl>
        ) : <EmptyState title="条件に合う拠点はありません" compact />}
        <Pagination total={rows.length} perPage={10} />
        <div className="legend">
          <span><Badge tone="info">申請中</Badge>ESキッチンが確認しています。終わるまで、その拠点の新しいお申し込みはできません</span>
          <span><Badge tone="warning" outline>休止の予定</Badge>休止のお申し込みが承認され、休止を待っている拠点</span>
          <span>鉛筆＝拠点の編集（削除はESキッチンだけ）</span>
        </div>
      </Card>
    </>
  );
}
