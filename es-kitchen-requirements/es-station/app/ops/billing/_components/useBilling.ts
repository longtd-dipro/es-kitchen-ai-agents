'use client';

import { useMemo } from 'react';
import billing from '@/lib/ops/areas/billing';
import { billingLogic } from '@/lib/ops/billing/logic';
import { areaApi, useQuery } from '@/lib/ops/core/client';
import { useOps } from '../../_ui/OpsProvider';
import { useCanAct } from '../../_ui/perm';
import { fmtYm } from '@/lib/format/date';

export const api = areaApi(billing);
type Acts = typeof billing.actions;
type ArgOf<K extends keyof Acts> = Parameters<Acts[K]>[1];

/** 請求の全データと計算（logic.ts）。run は書き換え（終わったら文言をトーストに出す） */
export function useBilling() {
  const { data, error } = useQuery(api, 'state');
  const { toast, toastError } = useOps();
  const canAct = useCanAct();
  const L = useMemo(() => (data ? billingLogic(structuredClone(data)) : null), [data]);
  async function run<K extends keyof Acts & string>(op: K, args: ArgOf<K>, quiet?: boolean) {
    try {
      const out = (await api.action(op, args as never)) as { msg?: string } | undefined;
      if (!quiet && out?.msg) toast(out.msg);
      return true;
    } catch (e) {
      toastError(e);
      return false;
    }
  }
  /** その書き換え（op）を呼べるか（権限がなければボタンを出さない） */
  const can = (op: keyof Acts & string) => canAct(api, op);
  return { L, run, can, error };
}

/** 締め月の表示（2026年10月度（当月）） */
/** 対象月の表示 'YYYY-MM'（当月は「（当月）」付き。共通の表示ルール・決定 8-1） */
export const pLabel = (m: string, month: string) => `${fmtYm(m)}${m === month ? '（当月）' : ''}`;

/** 画面の URL */
export const R = {
  stock: '/ops/billing/stock',
  stockD: (id: string, m?: string) => `/ops/billing/stock/${id}${m ? `?m=${m}` : ''}`,
  stockE: (id: string) => `/ops/billing/stock/${id}/edit`,
  stockBulk: (ids: string[]) => `/ops/billing/stock/bulk?ids=${ids.join(',')}`,
  act: '/ops/billing/actuals',
  actD: (id: string, m?: string) => `/ops/billing/actuals/${id}${m ? `?m=${m}` : ''}`,
  actE: (id: string) => `/ops/billing/actuals/${id}/edit`,
  cfm: '/ops/billing/confirm',
  cash: '/ops/billing/collection',
  grp: (key: string, m?: string) => `/ops/billing/confirm/${key}${m ? `?m=${m}` : ''}`,
  invE: (id: string) => `/ops/billing/confirm/${id}/edit`,
  sub: (id: string, m?: string, tab?: string) => `/ops/billing/confirm/sub/${id}${m || tab ? '?' + [m ? `m=${m}` : '', tab ? `tab=${tab}` : ''].filter(Boolean).join('&') : ''}`,
  subE: (id: string) => `/ops/billing/confirm/sub/${id}/edit`,
};
