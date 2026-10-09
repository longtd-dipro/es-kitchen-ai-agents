import type { DocRepo, Seed } from './area';

/** ブラウザのメモリに置く DocRepo（mock のとき）。version は書き換えのたびに増える */
export function memoryRepo(seed: Seed): DocRepo & { version(): number; bump(): void } {
  const kinds = new Map<string, Map<string, unknown>>();
  const seqs = new Map<string, number>();
  for (const [kind, rows] of Object.entries(seed)) kinds.set(kind, new Map(rows.map((r) => [r.id, structuredClone(r.data)])));
  let ver = 1;
  const k = (kind: string) => kinds.get(kind) ?? kinds.set(kind, new Map()).get(kind)!;
  return {
    list: <T,>(kind: string) => [...k(kind).values()] as T[],
    get: <T,>(kind: string, id: string) => k(kind).get(id) as T | undefined,
    put: (kind, id, data) => { k(kind).set(id, structuredClone(data)); },
    remove: (kind, id) => { k(kind).delete(id); },
    nextSeq: (key) => { const n = (seqs.get(key) ?? 0) + 1; seqs.set(key, n); return n; },
    version: () => ver,
    bump: () => { ver++; },
  };
}
