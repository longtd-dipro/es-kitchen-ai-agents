'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ApiError } from '@/lib/api/errors';
import { onUnauthorized, siteHeader } from '@/lib/api/site';
import type { Area, DocRepo, Fn } from '@/lib/ops/core/area';
import { memoryRepo } from '@/lib/ops/core/memoryRepo';
import { notify, subscribe } from '@/lib/ops/core/sync';

/*
 * 画面から共通の業務データ（lib/domain/areas/*）を呼ぶ口。運営Web の lib/ops/core/client.ts と同じ使い方。
 *   import delivery from '@/lib/domain/areas/delivery';
 *   const api = domainApi(delivery);
 *   const { data } = useDomainQuery(api, 'driverDay', { driverId: 'DR00041' });
 *   await api.action('pickup', { legId, driverId });   // 終わると開いている画面（ほかのタブ・サイトも）が読み直す
 * http：POST {BASE}/domain/<領域>/<名前>（app/api/domain/[area]/[op]）／mock：このタブのメモリ
 */
const MODE = process.env.NEXT_PUBLIC_API_MODE === 'http' ? 'http' : 'mock';
const BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? '/api';

let mem: Promise<ReturnType<typeof memoryRepo>> | null = null;
const memRepo = () => (mem ??= import('./registry').then(({ domainSeeds }) => memoryRepo(Object.assign({}, ...domainSeeds()))));

async function run(area: Area, kind: 'queries' | 'actions', op: string, args: unknown) {
  if (MODE === 'mock') {
    const repo = await memRepo();
    const fn = area[kind][op] as Fn | undefined;
    if (!fn) throw new ApiError(`${area.name}.${op} がありません`, 404);
    await new Promise((r) => setTimeout(r, 60));
    const out = structuredClone(fn(repo as DocRepo, structuredClone(args)));
    if (kind === 'actions') repo.bump();
    return out;
  }
  const sentAt = Date.now();
  const res = await fetch(`${BASE}/domain/${area.name}/${op}`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...siteHeader() },
    body: JSON.stringify({ args: args ?? null }),
  });
  if (!res.ok) {
    onUnauthorized(res.status, sentAt);
    const data = await res.json().catch(() => ({}));
    throw new ApiError(data.message ?? `エラーが起きました（${res.status}）`, res.status);
  }
  return res.status === 204 ? undefined : res.json();
}

type Arg<F> = F extends (repo: DocRepo, args: infer A) => unknown ? A : never;
type Out<F> = F extends (...a: never[]) => infer R ? Awaited<R> : never;

export function domainApi<Q extends Record<string, Fn>, A extends Record<string, Fn>>(area: Area<Q, A>) {
  return {
    area,
    /** 共通データの領域（POST /api/domain/…）。権限の出し分け（app/ops/_ui/perm.ts）で使う */
    kind: 'domain' as const,
    query: <K extends keyof Q & string>(op: K, args?: Arg<Q[K]>) => run(area, 'queries', op, args) as Promise<Out<Q[K]>>,
    action: async <K extends keyof A & string>(op: K, args?: Arg<A[K]>) => {
      const out = (await run(area, 'actions', op, args)) as Out<A[K]>;
      notify();
      return out;
    },
  };
}
export type DomainApi<Q extends Record<string, Fn>, A extends Record<string, Fn>> = ReturnType<typeof domainApi<Q, A>>;

/** 読み取りを呼び、データが変わったら（ほかのタブ・サイトの書き換えも）読み直す */
export function useDomainQuery<Q extends Record<string, Fn>, A extends Record<string, Fn>, K extends keyof Q & string>(
  api: DomainApi<Q, A>, op: K, args?: Arg<Q[K]>, opts?: { skip?: boolean },
) {
  const skip = !!opts?.skip;
  const [data, setData] = useState<Out<Q[K]> | undefined>(undefined);
  const [error, setError] = useState<unknown>(null);
  const key = JSON.stringify(args ?? null);
  const seq = useRef(0);
  const load = useCallback(async () => {
    const n = ++seq.current;
    try {
      const out = await api.query(op, JSON.parse(key));
      if (n === seq.current) { setData(out); setError(null); }
    } catch (e) {
      if (n === seq.current) setError(e);
    }
  }, [api, op, key]);
  /* skip＝ログイン前などは呼ばない（401 を出さない：結合テスト B5） */
  useEffect(() => { if (skip) return; load(); return subscribe(load); }, [load, skip]);
  return { data: skip ? undefined : data, error, loading: !skip && data === undefined && !error, reload: load };
}
