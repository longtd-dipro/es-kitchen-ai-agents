'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ApiError } from '@/lib/api/errors';
import { onUnauthorized, siteHeader } from '@/lib/api/site';
import type { Area, DocRepo, Fn } from './area';
import { memoryRepo } from './memoryRepo';
import { notify, subscribe } from './sync';

/*
 * 画面から領域（lib/ops/areas/*）を呼ぶ口。
 *   const api = areaApi(applications);
 *   const { data } = useQuery(api, 'list', { status: '受付中' });
 *   await api.action('approve', { id });
 * http：POST {BASE}/ops/area/<領域>/<名前>（app/api/ops/area/[area]/[op]）
 * mock：全領域で1つのメモリの DocRepo（mock のときだけ lib/ops/registry を読み込む）
 */
const MODE = process.env.NEXT_PUBLIC_API_MODE === 'http' ? 'http' : 'mock';
const BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? '/api';

let mem: Promise<ReturnType<typeof memoryRepo>> | null = null;
const memRepo = () => (mem ??= import('../registry').then(({ allSeeds }) => memoryRepo(Object.assign({}, ...allSeeds()))));

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
  const res = await fetch(`${BASE}/ops/area/${area.name}/${op}`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...siteHeader() },
    body: JSON.stringify({ args: args ?? null }),
  });
  if (!res.ok) {
    onUnauthorized(res.status, sentAt);
    const data = await res.json().catch(() => ({}));
    throw new ApiError(data.message ?? `エラーが起きました（${res.status}）`, res.status, data.code);
  }
  return res.status === 204 ? undefined : res.json();
}

type Arg<F> = F extends (repo: DocRepo, args: infer A) => unknown ? A : never;
type Out<F> = F extends (...a: never[]) => infer R ? Awaited<R> : never;

/* 領域ごとに1つだけ作る（毎回作ると useQuery の読み直しが止まらなくなる） */
const apis = new WeakMap<Area, unknown>();

export function areaApi<Q extends Record<string, Fn>, A extends Record<string, Fn>>(area: Area<Q, A>) {
  const hit = apis.get(area as unknown as Area);
  if (hit) return hit as ReturnType<typeof makeApi<Q, A>>;
  const api = makeApi(area);
  apis.set(area as unknown as Area, api);
  return api;
}

function makeApi<Q extends Record<string, Fn>, A extends Record<string, Fn>>(area: Area<Q, A>) {
  return {
    area,
    /** 運営Web などの領域（POST /api/ops/area/…）。権限の出し分け（app/ops/_ui/perm.ts）で使う */
    kind: 'ops' as const,
    query: <K extends keyof Q & string>(op: K, args?: Arg<Q[K]>) => run(area, 'queries', op, args) as Promise<Out<Q[K]>>,
    /** 書き換え。終わったら、開いている画面のデータを読み直す */
    action: async <K extends keyof A & string>(op: K, args?: Arg<A[K]>) => {
      const out = (await run(area, 'actions', op, args)) as Out<A[K]>;
      notify();
      return out;
    },
  };
}
export type AreaApi<Q extends Record<string, Fn>, A extends Record<string, Fn>> = ReturnType<typeof makeApi<Q, A>>;

/** 読み取りを呼び、データが変わったら読み直す。args は JSON にして比べる */
export function useQuery<Q extends Record<string, Fn>, A extends Record<string, Fn>, K extends keyof Q & string>(
  api: AreaApi<Q, A>, op: K, args?: Arg<Q[K]>, opts?: { skip?: boolean },
) {
  const skip = !!opts?.skip;
  const [data, setData] = useState<Out<Q[K]> | undefined>(undefined);
  const [error, setError] = useState<unknown>(null);
  const key = JSON.stringify(args ?? null);
  /* 出した順に番号を振り、それより新しい結果をもう出していたら捨てる（遅い応答でも、いちばん新しいものは必ず出る） */
  const seq = useRef(0);
  const shown = useRef(0);
  const busy = useRef(false);
  /* 読み込み中に版・引数が変わったら、終わってからいちばん新しい引数でもう一度読む */
  const pending = useRef(false);
  const latest = useRef<() => Promise<void>>(async () => {});
  const load = useCallback(async () => {
    if (busy.current) { pending.current = true; return; } /* 読み込み中は重ねて呼ばない */
    busy.current = true;
    const n = ++seq.current;
    try {
      const out = await api.query(op, JSON.parse(key));
      if (n > shown.current) { shown.current = n; setData(out); setError(null); }
    } catch (e) {
      if (n > shown.current) { shown.current = n; setError(e); }
    } finally {
      busy.current = false;
      if (pending.current) { pending.current = false; latest.current(); }
    }
  }, [api, op, key]);
  useEffect(() => { latest.current = load; }, [load]);
  /* skip＝ログイン前などは呼ばない（401 を出さない：結合テスト B5） */
  useEffect(() => { if (skip) return; load(); return subscribe(load); }, [load, skip]);
  return { data: skip ? undefined : data, error, loading: !skip && data === undefined && !error, reload: load };
}

/** 開発用：データを見本に戻す */
export async function resetAllData() {
  if (MODE === 'http') await fetch(`${BASE}/dev/reset`, { method: 'POST', credentials: 'include' });
  location.reload();
}
