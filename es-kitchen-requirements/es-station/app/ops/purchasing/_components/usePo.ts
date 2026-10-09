'use client';

import { useMemo } from 'react';
import { useMeta, useOrders, useStock } from '@/lib/ops/purchasing/client';
import { setServiceDemand, toRec } from '@/lib/ops/purchasing/logic';
import { MONTHS } from '@/lib/ops/purchasing/master';

/** 発注（共通 DB＋この領域）と運営だけの情報。recs＝発注データ1件ごとの見え方 */
export function usePo() {
  const o = useOrders();
  const m = useMeta();
  /* 調整数の必要数（共通データの注文から）を、発注の計算（dem）が読めるようにする */
  setServiceDemand((m.data as { svc?: Record<string, number> } | undefined)?.svc);
  const recs = useMemo(() => (o.data && m.data ? o.data.map((x) => toRec(x, m.data!.meta[x.no])) : undefined), [o.data, m.data]);
  return { orders: o.data, meta: m.data?.meta, plans: m.data?.plans, esLife: m.data?.esLife, supMethod: m.data?.supMethod, recs, error: o.error || m.error };
}

/** 倉庫在庫の計算に使うもの（発注データ＋在庫の記録） */
export function useStockData() {
  const po = usePo();
  const s = useStock();
  return { ...po, stock: s.data, error: po.error || s.error };
}


/** 発注の画面の状態（元の S.po）。画面を移っても残す */
export const PO = {
  /** 発注詳細で見るメニュー年月 */
  ym: MONTHS[0],
  /** 発注一覧で選んだ商品 */
  sel: new Set<string>(),
  /** 発注一覧の見方（商品ごと／発注データごと） */
  view: 'prod' as 'prod' | 'data',
};
