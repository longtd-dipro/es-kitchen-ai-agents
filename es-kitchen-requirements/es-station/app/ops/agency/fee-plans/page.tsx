'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { planAmountTxt, planPayTxt, planPeriodTxt } from '@/lib/ops/general/logic';
import type { FeePlan } from '@/lib/ops/general/types';
import { ActCell, ListView, useList, type ListCol } from '@/app/ops/_general/list';
import { api, DemoNote, Loading } from '@/app/ops/_general/parts';
import { useCanAct, useScreenCan } from '@/app/ops/_ui/perm';
import { Icon } from '@/app/ops/_ui/Icon';
import { ListCsv } from '@/app/ops/_ui/csv';
import { Badge, PageHead } from '@/app/ops/_ui/ui';
import { R, useRefData } from '../_components/common';
import { useDeleteRef } from '../_components/useDeleteRef';

type Row = FeePlan & { amt: string; per: string };

/** 代理・紹介管理 ＞ 紹介フィーマスタ（元：renderFeeList） */
export default function Page() {
  const router = useRouter();
  const d = useRefData();
  const list = useList('feeplan');
  const del = useDeleteRef('feeplan');
  const canAct = useCanAct();
  const screenCan = useScreenCan();
  if (!d) return <Loading />;
  const rows: Row[] = d.plans.map((p) => ({ ...p, pay: planPayTxt(p) as FeePlan['pay'], amt: planAmountTxt(p), per: planPeriodTxt(p) }));
  const cols: ListCol<Row>[] = [
    { key: 'id', label: 'フィープランID', td: (r) => <td><Link className="lnk u mono" href={`${R.feeplan}/${r.id}`}>{r.id}</Link></td> },
    { key: 'name', label: 'フィープラン名' }, { key: 'src', label: '紹介元区分' }, { key: 'pay', label: '支払区分' }, { key: 'calc', label: '算定方式' },
    { key: 'amt', label: 'フィー金額・率（税込）' }, { key: 'per', label: '支払期間' },
    { key: 'status', label: '状態', td: (r) => <td><Badge v={r.status} /></td> },
    { key: 'updated', label: '最終更新日' },
    { key: '_act', label: '操作', td: (r) => <ActCell onEdit={screenCan('update') ? () => router.push(`${R.feeplan}/${r.id}/edit`) : undefined} onDel={canAct(api, 'deleteRef', { kind: 'feeplan' }) ? () => del(r.id, d) : undefined} /> },
  ];
  return (
    <>
      <DemoNote />
      <PageHead crumbs={['代理・紹介管理', '紹介フィーマスタ']} title="紹介フィーマスタ">
        <ListCsv screen="紹介フィーマスタ" list={list} filters={null} cols={cols} rows={rows} source={{ kind: 'dm.referral.feePlans', id: (r) => r.id }} />
        {/* 権限がなければ出さない */}
        {screenCan('create') && <button className="btn pri lg" onClick={() => router.push(`${R.feeplan}/new`)}><Icon name="plus" />新規登録</button>}
      </PageHead>
      <div className="card"><ListView list={list} filters={null} cols={cols} rows={rows} rowKey={(r) => r.id} /></div>
    </>
  );
}
