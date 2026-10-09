'use client';

import { DEMO } from '@/lib/demo';

import { useRouter } from 'next/navigation';
import type { BillingLogic, GroupView } from '@/lib/ops/billing/logic';
import { Btn } from './ds';
import { useInvoiceOps } from './useInvoiceOps';
import { R } from './useBilling';

/** 次にすること（行の右のボタン）。元の actBtn */
export default function NextBtn({ L, x, sm }: { L: BillingLogic; x: GroupView; sm?: boolean }) {
  const router = useRouter();
  const ops = useInvoiceOps(L);
  if (x.past) return null;
  if (x.st.k === 'wait') return <Btn sm={sm} onClick={() => router.push(R.grp(L.groupHref(x)))}>子契約を確定する</Btn>;
  /* 権限がなければ出さない */
  if (x.st.k === 'ready') return !ops.can('makeInvoice') ? <span className="dim">—</span> : <Btn sm={sm} kind="pri" onClick={() => ops.askMake(x.g.c.id, x.g.bid)}>{x.amt === 0 ? '0円の請求書を出力' : '請求書を作成'}</Btn>;
  if (x.st.k === 'made' && x.i && ops.can('dispatch')) { const id = x.i.id; return <Btn sm={sm} kind="pri" onClick={() => ops.dispatch(id)}>Bill One で発行{DEMO ? '（デモ）' : ''}</Btn>; }
  return <span className="dim">—</span>;
}
