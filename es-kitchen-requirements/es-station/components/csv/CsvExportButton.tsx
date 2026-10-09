'use client';

import { useState, type ReactNode } from 'react';
import { errorMessage } from '@/lib/api/errors';
import { runCsvExport, type ExportOpts } from './api';

/**
 * 「CSV出力」のボタン（全サイト同じ動き）。検索条件のとおりの全件・システムにある全部の項目を出す（lib/csv・00_確認してほしい/CSV入出力_定義_20261003.md）。
 * 見た目は各サイトのボタン（className・中身）。終わったら notify でサイトのトーストに出す
 */
export function CsvExportButton<R>({ className, children, notify, disabled, ...o }: ExportOpts<R> & {
  className: string;
  children?: ReactNode;
  notify?: (msg: string) => void;
  disabled?: boolean;
}) {
  const [busy, setBusy] = useState(false);
  const run = async () => {
    setBusy(true);
    try {
      const { count, fileName } = await runCsvExport(o);
      notify?.(`CSVを出力しました（${count.toLocaleString()}行・${fileName}）`);
    } catch (e) {
      notify?.(errorMessage(e));
    } finally { setBusy(false); }
  };
  return <button type="button" className={className} disabled={busy || disabled} aria-busy={busy} onClick={run}>{children ?? 'CSV出力'}</button>;
}
