'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { opsApi } from '@/lib/api/ops';
import type { OpsOp, Order } from '@/lib/supplier/types';
import { areaApi, useQuery } from '../core/client';
import { notify, subscribe } from '../core/sync';
import purchasing from '../areas/purchasing';
import { SHARED_SUPS } from './master';
import type { POrder } from './types';

/*
 * 画面から発注を読み書きする口。
 *   - 仕入先サイトにいる仕入先の発注：共通 DB（lib/api/ops.ts。仕入先サイトと同じデータ）
 *   - それ以外の仕入先の発注：この領域（purchasing.orders）
 * の2か所を1つの一覧にまとめ、書き換えは発注の置き場所に合わせて振り分ける。
 */
export const api = areaApi(purchasing);

/** すべての発注（置き場所 src つき）。データが変わったら読み直す */
export function useOrders() {
  const [data, setData] = useState<POrder[] | undefined>(undefined);
  const [error, setError] = useState<unknown>(null);
  const seq = useRef(0);
  const load = useCallback(async () => {
    const n = ++seq.current;
    try {
      const [db, doc] = await Promise.all([opsApi.listOrders(), api.query('orders')]);
      if (n !== seq.current) return;
      /* 代替品の追加発注は共通 DB の発注一覧にも出る（仕入先サイトと同じ）ので、同じ番号は共通 DB の方を使う */
      const has = new Set(db.map((o) => o.no));
      setData([...db.map((o) => ({ ...o, src: 'db' as const })), ...(doc as Order[]).filter((o) => !has.has(o.no)).map((o) => ({ ...o, src: 'doc' as const }))]);
      setError(null);
    } catch (e) {
      if (n === seq.current) setError(e);
    }
  }, []);
  useEffect(() => { load(); return subscribe(load); }, [load]);
  return { data, error, reload: load };
}

export const useMeta = () => useQuery(api, 'meta');
export const useStock = () => useQuery(api, 'stock');
export const useSamples = () => useQuery(api, 'samples');

const runAt = async (src: 'db' | 'doc', op: OpsOp) => (src === 'db' ? opsApi.run(op) : (api.action('orderOp', op) as Promise<Order[]>));

/** 発注の書き換え。対象の発注の置き場所に合わせて振り分ける */
export async function runOp(op: OpsOp, orders: POrder[]): Promise<Order[]> {
  const srcOf = (no: string) => orders.find((o) => o.no === no)?.src ?? 'db';
  let out: Order[] = [];
  switch (op.op) {
    case 'create': {
      const db = op.orders.filter((o) => SHARED_SUPS.has(o.sup));
      const doc = op.orders.filter((o) => !SHARED_SUPS.has(o.sup));
      if (db.length) out = out.concat(await runAt('db', { op: 'create', orders: db }));
      if (doc.length) out = out.concat(await runAt('doc', { op: 'create', orders: doc }));
      break;
    }
    case 'issueHon': {
      for (const src of ['db', 'doc'] as const) {
        const items = op.items.filter((x) => srcOf(x.no) === src);
        if (items.length) out = out.concat(await runAt(src, { op: 'issueHon', items }));
      }
      break;
    }
    case 'cancel': {
      for (const src of ['db', 'doc'] as const) {
        const nos = op.nos.filter((no) => srcOf(no) === src);
        if (nos.length) out = out.concat(await runAt(src, { op: 'cancel', nos, reason: op.reason }));
      }
      break;
    }
    default:
      out = await runAt(srcOf(op.no), op);
  }
  notify();
  return out;
}
