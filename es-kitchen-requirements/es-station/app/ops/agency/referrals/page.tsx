'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DEMO } from '@/lib/demo';
import { planPayTxt, refPlan, ymJa } from '@/lib/ops/general/logic';
import type { Referral } from '@/lib/ops/general/types';
import { ActCell, ListView, useList, type ListCol, type ListFilter } from '@/app/ops/_general/list';
import { demoMsg, DemoNote, Loading } from '@/app/ops/_general/parts';
import { Icon } from '@/app/ops/_ui/Icon';
import { useOps } from '@/app/ops/_ui/OpsProvider';
import { useCanAct, useScreenCan } from '@/app/ops/_ui/perm';
import { ListCsv } from '@/app/ops/_ui/csv';
import { Badge, PageHead } from '@/app/ops/_ui/ui';
import { api } from '@/app/ops/_general/parts';
import { contractOf, corpName, R, srcName, useRefData } from '../_components/common';

type Row = Referral & { srcN: string; dest: string; branch: string; planName: string; pay: string; calc: string };

/** 代理・紹介管理 ＞ 紹介履歴（元：renderRefList。親契約の代理店コードから自動で作る） */
export default function Page() {
  const router = useRouter();
  const { toast } = useOps();
  const d = useRefData();
  const list = useList('referral');
  const screenCan = useScreenCan();
  const canAct = useCanAct();
  if (!d) return <Loading />;
  const openBranches = (note?: string) => { router.push(R.branches); if (note) toast(note); };
  const rows: Row[] = d.referrals.map((r) => { const c = contractOf(d, r.contract), p = refPlan(r, d.plans); return { ...r, srcN: srcName(d, r), dest: `${c.cu || '—'}　${corpName(d, c)}`, branch: `${c.br}　${c.branch}`, planName: p.name, pay: planPayTxt(p), calc: p.calc }; });
  const ymTd = (v: string) => <td style={{ whiteSpace: 'nowrap' }}>{ymJa(v)}</td>;
  const cols: ListCol<Row>[] = [
    { key: 'id', label: '紹介ID', td: (r) => <td><Link className="lnk u mono" href={`${R.referral}/${r.id}`}>{r.id}</Link></td> },
    { key: 'srcN', label: '紹介元' }, { key: 'srcType', label: '紹介元区分' }, { key: 'dest', label: '紹介先法人ID-法人名' }, { key: 'branch', label: '紹介先拠点' },
    { key: 'contract', label: '契約ID', td: (r) => <td><button className="lnk u mono" onClick={() => openBranches(`法人・契約管理 ＞ 拠点一覧を開きました（親契約 ${r.contract}）`)}>{r.contract}</button></td> },
    { key: 'planName', label: '紹介フィープラン' }, { key: 'pay', label: '支払区分' },
    { key: 'status', label: 'ステータス', td: (r) => <td><Badge v={r.status} /></td> },
    { key: 'calc', label: 'フィー算定方式' },
    { key: 'start', label: '開始月', td: (r) => ymTd(r.start) }, { key: 'endPlan', label: '終了予定月', td: (r) => ymTd(r.endPlan) }, { key: 'end', label: '終了月', td: (r) => ymTd(r.end) },
    { key: '_act', label: '操作', td: (r) => <ActCell onEdit={screenCan('update') ? () => router.push(`${R.referral}/${r.id}/edit`) : undefined} /> },
  ];
  const filters: ListFilter[] = [
    { t: 'search', ph: '代理店名・ID、法人名・ID、紹介ID、契約ID', span: 2, keys: ['id', 'srcN', 'dest', 'contract'] },
    { t: 'select', ph: '紹介フィープラン', col: 'planName', opts: d.plans.map((p) => p.name) },
    { t: 'select', ph: '支払区分', col: 'pay', opts: ['単発', '継続'] },
    { t: 'select', ph: 'ステータス', col: 'status', opts: ['契約前', '有効', '満了', '途中解約', '中止'] },
    { t: 'select', ph: 'フィー算定方式', col: 'calc', opts: ['固定額', '月次提供数別の金額', '請求額割合'] },
    { t: 'month', ph: '開始月', col: 'start' },
    { t: 'month', ph: '終了月', col: 'endPlan' },
  ];
  return (
    <>
      <DemoNote />
      <PageHead crumbs={['代理・紹介管理', '紹介履歴']} title="紹介履歴">
        <ListCsv screen="紹介履歴" list={list} filters={filters} cols={cols} rows={rows} source={{ kind: 'dm.referral.referrals', id: (r) => r.id }} />
        {/* 紹介元が法人のものを手で登録（承認の後の後付け）。権限がなければ出さない */}
        {canAct(api, 'createReferral', {}) && <button className="btn pri lg" onClick={() => router.push(`${R.referral}/new`)}><Icon name="plus" />新規登録</button>}
      </PageHead>
      <div className="card">
        <div className="notice"><Icon name="bell" /><span>紹介履歴は、親契約の<b>「代理店コード（紹介有無）」</b>から自動で作られます。新しい紹介は <button className="lnk" onClick={() => openBranches()}>法人・契約管理 ＞ 拠点一覧</button> で親契約に代理店コードを設定してください。ここで変更できるのは紹介フィープラン・支払い開始年月・備考です。</span></div>
        <ListView list={list} filters={filters} cols={cols} rows={rows} rowKey={(r) => r.id} />
      </div>
    </>
  );
}
