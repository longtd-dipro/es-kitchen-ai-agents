'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { DEMO } from '@/lib/demo';
import { payTotals, ymJa } from '@/lib/ops/general/logic';
import type { Payment } from '@/lib/ops/general/types';
import { ActCell, ListView, useList, type ListCol, type ListFilter } from '@/app/ops/_general/list';
import { demoMsg, DemoNote, Loading } from '@/app/ops/_general/parts';
import { Icon } from '@/app/ops/_ui/Icon';
import { useOps } from '@/app/ops/_ui/OpsProvider';
import { useCanAct, useScreenCan } from '@/app/ops/_ui/perm';
import { ListCsv } from '@/app/ops/_ui/csv';
import { Badge, PageHead, yen } from '@/app/ops/_ui/ui';
import { Check, SelBar } from '@/app/ops/billing/_components/ds';
import { api } from '@/app/ops/_general/parts';
import { R, targetName, useRefData } from '../_components/common';
import { BulkPayModal } from './_components/BulkPayModal';

type Row = Payment & { calcBase: number; fee: number; adj: number; total: number; cnt: number; targetN: string; refs: string; plans: string; payKinds: string; calcs: string };

/** 代理・紹介管理 ＞ 支払履歴（元：renderPayList） */
export default function Page() {
  const router = useRouter();
  const { toast } = useOps();
  const d = useRefData();
  const list = useList('payment');
  const screenCan = useScreenCan();
  const canAct = useCanAct();
  const { openModal } = useOps();
  const [sel, setSel] = useState<Record<string, boolean>>({});
  if (!d) return <Loading />;
  const rows: Row[] = d.payments.map((p) => ({ ...p, ...payTotals(p), cnt: p.lines.length, targetN: `${p.target} ${targetName(d, p)}`, refs: p.lines.map((l) => l.ref).join(' '), plans: p.lines.map((l) => l.plan).join(' '), payKinds: p.lines.map((l) => l.pay).join(' '), calcs: p.lines.map((l) => l.calc).join(' ') }));
  const money = (k: 'fee' | 'adj' | 'total') => (r: Row) => <td className="num">{yen(r[k])}</td>;
  const canBulk = canAct(api, 'bulkPayments', {});
  const ids = Object.keys(sel).filter((k) => sel[k] && rows.some((r) => r.id === k));
  const bulk = (status: '未払い' | '支払済' | '対象外') => openModal(<BulkPayModal ids={ids} status={status} onDone={() => setSel({})} />);
  const cols: ListCol<Row>[] = [
    ...(canBulk ? [{ key: '_sel', label: '選択', td: (r: Row) => <td className="c"><Check checked={!!sel[r.id]} onChange={(on) => setSel((x) => ({ ...x, [r.id]: on }))} /></td> } as ListCol<Row>] : []),
    { key: 'month', label: '支払対象月', td: (r) => <td style={{ whiteSpace: 'nowrap' }}>{ymJa(r.month)}</td> },
    { key: 'id', label: '支払いID', td: (r) => <td><Link className="lnk mono" href={`${R.payment}/${r.id}`}>{r.id}</Link></td> },
    { key: 'type', label: '支払先区分' }, { key: 'targetN', label: '支払先' }, { key: 'method', label: '処理方法' },
    { key: 'cnt', label: '対象件数', num: true },
    { key: 'fee', label: '算定合計額（税込）', num: true, td: money('fee') }, { key: 'adj', label: '調整合計額（税込）', num: true, td: money('adj') }, { key: 'total', label: '支払合計額（税込）', num: true, td: money('total') },
    { key: 'status', label: '支払状況', td: (r) => <td><Badge v={r.status} /></td> },
    { key: 'date', label: '支払日' },
    { key: '_act', label: '操作', td: (r) => <ActCell onEdit={screenCan('update') ? () => router.push(`${R.payment}/${r.id}/edit`) : undefined} /> },
  ];
  const filters: ListFilter[] = [
    { t: 'search', ph: '代理店名・ID、法人名・ID、紹介ID', span: 2, keys: ['id', 'targetN', 'refs'] },
    { t: 'select', ph: '紹介フィープラン', col: 'plans', opts: d.plans.map((p) => p.name) },
    { t: 'select', ph: '支払区分', col: 'payKinds', opts: ['単発', '継続'] },
    { t: 'select', ph: '支払状況', col: 'status', opts: ['未払い', '支払済', '対象外'] },
    { t: 'select', ph: 'フィー算定方式', col: 'calcs', opts: ['固定額', '月次提供数別の金額', '請求額割合'] },
    { t: 'month', ph: '支払対象月', col: 'month' },
  ];
  return (
    <>
      <DemoNote />
      <PageHead crumbs={['代理・紹介管理', '支払履歴']} title="支払履歴">
        <ListCsv screen="支払履歴" list={list} filters={filters} cols={cols} rows={rows} source={{ kind: 'dm.referral.payments', id: (r) => r.id }} />
      </PageHead>
      <div className="card"><ListView list={list} filters={filters} cols={cols} rows={rows} rowKey={(r) => r.id} /></div>
      {canBulk && <SelBar n={ids.length} onClear={() => setSel({})}>
        <button type="button" className="btn pri" onClick={() => bulk('支払済')}>支払済にする</button>
        <button type="button" className="btn out" onClick={() => bulk('未払い')}>未払いに戻す</button>
        <button type="button" className="btn out" onClick={() => bulk('対象外')}>対象外にする</button>
      </SelBar>}
    </>
  );
}
