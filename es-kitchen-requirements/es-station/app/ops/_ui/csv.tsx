'use client';

import { useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import { CsvExportButton } from '@/components/csv/CsvExportButton';
import type { CsvUi } from '@/components/csv/CsvImportModal';
import { runCsvExport, type ExportOpts } from '@/components/csv/api';
import type { CsvFilter } from '@/lib/csv/core';
import { hideRulesOf, searchKeysOf, type ListApi, type ListFilter } from '../_general/list';
import { Icon } from './Icon';
import { useOps } from './OpsProvider';
import { Modal } from './ui';
import { useScreenCan } from './perm';

/*
 * 運営Web の CSV出力・CSV取込（components/csv の部品に、運営のモーダル・ボタン・表のクラスをつないだもの）。
 *   <OpsCsvExport screen="商品マスタ" filters={...} entity="products" rows={() => list.apply(rows)} keys={(r) => r.id} />
 *   <OpsCsvImport href="/ops/masters/products/import" />（取込の画面は app/ops/_ui/CsvImportPage.tsx）
 */

/** 権限がないときのトースト（ボタンを関数で使う画面） */
const NO_PERM = (what: string) => `${what}の権限がありません（必要な場合はシステム管理に権限の追加を依頼してください）`;

/** 運営の操作したアカウント（ログインしていないときの既定。運営 フル権限） */
export const OPS_ID = 'Ad00010';

/** 既定の枠（モーダル）。画面の枠は CsvImportPage が差し替える */
function Frame({ title, footer, children }: { title: string; onClose: () => void; busy: boolean; footer: ReactNode; children: ReactNode }) {
  return <Modal title={title} width={980} footer={footer}>{children}</Modal>;
}
const TONE = { ok: 'b-ok', info: 'b-info', warn: 'b-warn', ng: 'b-ng', mute: 'b-mute' } as const;
export const OPS_CSV_UI: CsvUi = {
  Frame, pri: 'btn pri lg', out: 'btn out', table: 'tbl', wrap: 'tbl-wrap', num: 'num',
  badge: (t) => `badge ${TONE[t]}`, notice: (k) => `notice ${k}`, hint: 'hint', steps: 'steps',
};

/** 「CSV取込」のボタン（運営の一覧の見出しの右）→ CSV取込の画面（…/import。モーダルではなく画面・hong 2026/10/05）。今の画面の「CSV取込」の権限がなければ出さない */
export function OpsCsvImport({ href, className = 'btn csv lg', children }: { href: string; className?: string; children?: ReactNode }) {
  const router = useRouter();
  if (!useScreenCan()('csvImport')) return null;
  return <button type="button" className={className} onClick={() => router.push(href)}>{children ?? <><Icon name="upl" />CSV取込</>}</button>;
}

/** 「CSV出力」のボタン（運営の一覧の見出しの右）。検索条件のとおりの全件・全部の項目。今の画面の「CSV出力」の権限がなければ出さない */
export function OpsCsvExport<R>({ className = 'btn csv lg', children, ...o }: Omit<ExportOpts<R>, 'site' | 'by'> & { className?: string; children?: ReactNode }) {
  const { toast, account } = useOps();
  if (!useScreenCan()('csvExport')) return null;
  return <CsvExportButton<R> className={className} site="ops" by={account?.id ?? OPS_ID} notify={toast} {...o}>{children ?? <><Icon name="down" />CSV出力</>}</CsvExportButton>;
}

/** 出力を関数で呼ぶ（画面のボタンの見た目をそのまま使うとき） */
export function useOpsCsvExport() {
  const { toast, toastError, account } = useOps();
  const can = useScreenCan();
  return async <R,>(o: Omit<ExportOpts<R>, 'site' | 'by'>) => {
    if (!can('csvExport')) { toast(NO_PERM('CSV出力')); return; }
    try {
      const { count, fileName } = await runCsvExport({ ...o, site: 'ops', by: account?.id ?? OPS_ID });
      toast(`CSVを出力しました（${count.toLocaleString()}行・${fileName}）`);
    } catch (e) { toastError(e); }
  };
}

/** 一覧の検索の状態（q＝文字の検索、f＝選ぶ条件の値）と検索欄の定義 → 出力の条件（発注・入荷などの一覧も同じ形） */
export function stateCsvFilters(st: { q: string; f: Record<string, string>; hideDel?: boolean }, filters: readonly { t: string; ph: string; col?: string; init?: string }[] | null | undefined, extra: CsvFilter[] = []): CsvFilter[] {
  const out: CsvFilter[] = [];
  const label = (ph: string) => ph.replace(/^(全て|すべての?)/, '').replace(/[（(]すべて[）)]$/, '').trim() || ph;
  if (st.q) out.push({ label: '検索', value: st.q });
  (filters ?? []).forEach((f, i) => {
    if (f.t === 'search') return;
    if (f.t === 'show' && f.col) { if (st.f[`show:${f.col}`] === '1') out.push({ label: f.ph, value: 'あり' }); return; }
    if (f.t === 'monthRange' && f.col) {
      const a = st.f[`${f.col}@from`] || f.init || '', b = st.f[`${f.col}@to`] || f.init || '';
      out.push({ label: label(f.ph), value: a === b ? a : `${a}〜${b}` });
      return;
    }
    if (f.t === 'range' && f.col) {
      const a = st.f[`${f.col}@from`], b = st.f[`${f.col}@to`];
      if (a || b) out.push({ label: label(f.ph), value: `${a ?? ''}〜${b ?? ''}` });
      return;
    }
    const v = st.f[f.col || `none:${i}`] ?? (f.col ? undefined : st.f.none);
    if (v) out.push({ label: label(f.ph), value: v.split('\u001f').join('・') });
  });
  if (st.hideDel === false) out.push({ label: '削除済', value: '含む' });
  return [...out, ...extra];
}
/** 一覧の検索条件（共通の一覧 ListView）→ ファイル名・出力の記録の条件 */
export const listCsvFilters = (list: ListApi, filters: ListFilter[] | null | undefined, extra: CsvFilter[] = []) => stateCsvFilters(list.st, filters, extra);
/** 発注・入荷などの一覧の列（[キー, 見出し, 種類]）→ 出力の列（操作・チェックの列は除く） */
export const tupleCols = <R,>(cols: readonly (readonly [string, string, string?])[], get?: (r: R, k: string) => unknown) =>
  cols.filter((c) => c[0] && c[0][0] !== '_').map((c) => ({ label: c[1], type: c[2] === 'num' ? ('num' as const) : undefined, get: (r: R) => (get ? get(r, c[0]) : (r as Record<string, unknown>)[c[0]]) }));

/**
 * 共通の一覧（ListView）の「CSV出力」：検索条件のとおりの全件（ページ送りの前）。列＝画面の列（操作・写真の列は除く）＋ source の文書の全部の項目。
 *   <ListCsv screen="代理店マスタ" list={list} filters={filters} cols={cols} rows={rows} source={{ kind: 'dm.org.agencies', id: (r) => r.id }} />
 */
export function ListCsv<R extends object>({ screen, list, filters, cols, rows, statusKey, extra, ...o }: {
  screen: string; list: ListApi; filters: ListFilter[] | null | undefined; cols: { key: string; label: string; act?: boolean }[]; rows: R[] | undefined;
  statusKey?: string; extra?: CsvFilter[];
} & Pick<ExportOpts<R>, 'source' | 'entity' | 'keys' | 'scope'> & { className?: string; children?: ReactNode }) {
  return (
    <OpsCsvExport<R>
      screen={screen} filters={listCsvFilters(list, filters, extra)} rows={() => list.apply(rows ?? [], statusKey, searchKeysOf(filters), hideRulesOf(filters))}
      columns={cols.filter((c) => c.key && c.key[0] !== '_' && !c.act).map((c) => ({ label: c.label, get: (r: R) => (r as Record<string, unknown>)[c.key] }))}
      {...o}
    />
  );
}

/** 検索欄（キー・見出し・選択肢 [値, 表示]）と入れた値 → 出力の条件 */
export function fieldCsvFilters(fields: { k: string; k2?: string; ph: string; opts?: [string, string][] | string[] }[], v: Record<string, string>): CsvFilter[] {
  return fields.flatMap((f) => {
    const x = v[f.k];
    if (!x) return [];
    const nm = (z: string) => { const o = (f.opts ?? []).find((y) => (Array.isArray(y) ? y[0] : y) === z); return Array.isArray(o) ? o[1] : z; };
    /* 月の範囲（開始月〜終了月）。同じ月ならその月だけ */
    const to = f.k2 ? v[f.k2] : '';
    return [{ label: f.ph.replace(/[（(]すべて[）)]$/, '').trim(), value: to && to !== x ? `${nm(x)}〜${nm(to)}` : nm(x) }];
  });
}
