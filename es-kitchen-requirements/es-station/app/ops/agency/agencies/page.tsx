'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DEMO } from '@/lib/demo';
import type { AgencyRow } from '@/lib/ops/general/types';
import { ActCell, ListView, useList, type ListCol, type ListFilter } from '@/app/ops/_general/list';
import { api, demoMsg, DemoNote, Loading } from '@/app/ops/_general/parts';
import { Icon } from '@/app/ops/_ui/Icon';
import { useOps } from '@/app/ops/_ui/OpsProvider';
import { useCanAct, useScreenCan } from '@/app/ops/_ui/perm';
import { ListCsv } from '@/app/ops/_ui/csv';
import { Badge, PageHead } from '@/app/ops/_ui/ui';
import { agencyCounts, planOf, R, useRefData } from '../_components/common';
import { useDeleteRef } from '../_components/useDeleteRef';

type Row = AgencyRow & { planName?: string; main?: string; c1: number; c2: number; c3: number };

/** 代理・紹介管理 ＞ 代理店マスタ（元：renderAgencyList） */
export default function Page() {
  const router = useRouter();
  const { toast } = useOps();
  const d = useRefData();
  const list = useList('agency');
  const del = useDeleteRef('agency');
  const canAct = useCanAct();
  const screenCan = useScreenCan();
  if (!d) return <Loading />;
  const rows: Row[] = d.agencies.map((a) => { const [c1, c2, c3] = agencyCounts(d, a.id); return { ...a, planName: planOf(d, a.plan)?.name, main: a.contacts[0]?.name, c1, c2, c3 }; }).sort((x, y) => (x.id < y.id ? -1 : 1));
  const cols: ListCol<Row>[] = [
    { key: 'id', label: '代理店ID', td: (r) => <td><Link className="lnk mono" href={`${R.agency}/${r.id}`}>{r.id}</Link></td> },
    { key: 'name', label: '代理店名' }, { key: 'planName', label: '紹介フィープラン' }, { key: 'main', label: 'メイン担当者名' },
    { key: 'c1', label: '紹介合計数', num: true }, { key: 'c2', label: '有効紹介数', num: true }, { key: 'c3', label: '現在契約中', num: true },
    { key: 'status', label: 'ステータス', td: (r) => <td><Badge v={r.status} /></td> },
    { key: '_act', label: '操作', td: (r) => <ActCell onEdit={screenCan('update') ? () => router.push(`${R.agency}/${r.id}/edit`) : undefined} onDel={canAct(api, 'deleteRef', { kind: 'agency' }) ? () => del(r.id, d) : undefined} /> },
  ];
  const filters: ListFilter[] = [{ t: 'search', ph: '代理店名・ID', span: 2, keys: ['id', 'name'] }, { t: 'select', ph: '紹介フィープラン', col: 'planName', opts: d.plans.map((p) => p.name) }, { t: 'select', ph: 'ステータス', col: 'status', opts: ['有効', '無効'] }];
  return (
    <>
      <DemoNote />
      <PageHead crumbs={['代理・紹介管理', '代理店マスタ']} title="代理店マスタ">
        <ListCsv screen="代理店マスタ" list={list} filters={filters} cols={cols} rows={rows} source={{ kind: 'dm.org.agencies', id: (r) => r.id }} />
        {/* 権限がなければ出さない */}
        {screenCan('create') && <button className="btn pri lg" onClick={() => router.push(`${R.agency}/new`)}><Icon name="plus" />新規登録</button>}
      </PageHead>
      <div className="card"><ListView list={list} filters={filters} cols={cols} rows={rows} rowKey={(r) => r.id} /></div>
    </>
  );
}
