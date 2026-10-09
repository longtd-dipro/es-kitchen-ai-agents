'use client';

import { ApiError } from '@/lib/api/errors';
import { onUnauthorized, siteHeader } from '@/lib/api/site';
import { cellText, csvFileName, toCsv, type CsvFilter, type CsvType } from '@/lib/csv/core';
import type { CsvScope, FollowUp, PreviewOut } from '@/lib/domain/csv';
import { notify } from '@/lib/ops/core/sync';

/*
 * 画面から CSV の入出力（共通データの area: csv。POST /api/domain/csv/<名前>）を呼ぶ口と、ファイルの保存。
 * 仕組みは lib/domain/csv.ts、列は lib/csv/*.ts。部品は CsvExportButton・CsvImportModal（このフォルダ）
 */
const BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? '/api';

async function call<T>(op: string, args: unknown, write = false): Promise<T> {
  const sentAt = Date.now();
  const res = await fetch(`${BASE}/domain/csv/${op}`, {
    method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json', ...siteHeader() }, body: JSON.stringify({ args: args ?? null }),
  });
  if (!res.ok) {
    onUnauthorized(res.status, sentAt);
    const data = await res.json().catch(() => ({}));
    throw new ApiError(data.message ?? `エラーが起きました（${res.status}）`, res.status);
  }
  const out = (res.status === 204 ? undefined : await res.json()) as T;
  /* 書き換えたら、開いている画面（ほかのタブ・サイトも）が読み直す */
  if (write) notify();
  return out;
}

export type CsvColumnDef = { label: string; hint: string; type: string; ro?: boolean; req?: boolean; reqAlways?: boolean; clear?: boolean; unique?: boolean; opts?: string[]; max?: number; min?: number; maxNum?: number; child?: boolean };
export type CommitOut = { importId: string; counts: PreviewOut['counts']; jobId: string; follow: FollowUp[]; value?: unknown };
export const csvApi = {
  template: (entity: string, scope?: CsvScope) => call<{ head: string[]; rows: string[][]; fileName: string }>('template', { entity, scope }),
  columns: (entity: string, scope?: CsvScope) => call<{ screen: string; key: string; custom: boolean; cols: CsvColumnDef[] }>('columns', { entity, scope }),
  export: (entity: string, scope?: CsvScope, keys?: string[]) => call<{ screen: string; head: string[]; rows: string[][] }>('export', { entity, scope, keys }),
  records: (kind: string, ids: string[], childKey?: string | null) => call<{ head: string[]; groups: string[][][] }>('records', { kind, ids, childKey }),
  preview: (a: { entity: string; text: string; fileName: string; scope?: CsvScope; by: string }) => call<PreviewOut>('importPreview', a, false),
  commit: (a: { entity: string; token: string; ack?: boolean }) => call<CommitOut>('importCommit', a, true),
  jobStep: (id: string) => call<{ id: string; done: number; total: number; status: '実行中' | '完了' }>('jobStep', { id }, true),
  logExport: (a: { screen: string; filters: CsvFilter[]; count: number; fileName: string; site: string; by: string }) => call('logExport', a),
};

/** CSV を保存する（BOM・CRLF は toCsv が付ける） */
export function saveCsv(fileName: string, rows: string[][]) {
  try {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([toCsv(rows)], { type: 'text/csv;charset=utf-8' }));
    a.download = fileName;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  } catch { /* 保存できない環境では何もしない */ }
}

/** 画面の列（見出しと値の取り方） */
export type ViewCol<R> = { label: string; get: (r: R) => unknown; type?: CsvType };

/**
 * 出力のしかた。
 *   entity：取込と同じ列のエンティティ（lib/csv/*.ts）。keys で画面で絞った行だけ（省くと全件）
 *   columns＋rows：画面の行（検索条件のとおりの全件・ページ送りの前）。source を渡すと、その行の文書（dm.*）の全部の項目を右に足す
 */
export type ExportOpts<R> = {
  screen: string;
  filters?: CsvFilter[];
  site: CsvScope['site'];
  by: string;
  rows?: R[] | (() => R[] | Promise<R[]>);
  columns?: ViewCol<R>[];
  source?: { kind: string; id: (r: R) => string; childKey?: string | null };
  entity?: string;
  keys?: (r: R) => string;
  scope?: CsvScope;
};

/** 出力する（ファイルを保存して、出力の記録を残す）。返り値＝行数・ファイル名 */
export async function runCsvExport<R>(o: ExportOpts<R>) {
  const rows = typeof o.rows === 'function' ? await o.rows() : o.rows ?? [];
  let table: string[][];
  if (o.entity) {
    const res = await csvApi.export(o.entity, o.scope ?? { site: o.site }, o.keys ? rows.map(o.keys) : undefined);
    table = [res.head, ...res.rows];
  } else {
    const cols = o.columns ?? [];
    const head = cols.map((c) => c.label);
    let body = rows.map((r) => [cols.map((c) => cellText(c.get(r), c.type))]);
    if (o.source) {
      const rec = await csvApi.records(o.source.kind, rows.map(o.source.id), o.source.childKey);
      const use = rec.head.map((h, i) => [h, i] as const).filter(([h]) => !head.includes(h));
      head.push(...use.map(([h]) => h));
      body = body.map(([v], i) => {
        const g = rec.groups[i] ?? [];
        return g.length ? g.map((x) => [...v, ...use.map(([, j]) => x[j] ?? '')]) : [[...v, ...use.map(() => '')]];
      });
    }
    table = [head, ...body.flat()];
  }
  const fileName = csvFileName(o.screen, o.filters ?? []);
  saveCsv(fileName, table);
  const count = table.length - 1;
  await csvApi.logExport({ screen: o.screen, filters: (o.filters ?? []).filter((f) => f.value !== ''), count, fileName, site: o.site, by: o.by }).catch(() => undefined);
  return { count, fileName };
}
