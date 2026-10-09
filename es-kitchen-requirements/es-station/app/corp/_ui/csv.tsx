'use client';

import type { ReactNode } from 'react';
import { CsvExportButton } from '@/components/csv/CsvExportButton';
import type { ExportOpts } from '@/components/csv/api';
import { useCorpSignedIn } from './CorpProvider';

/*
 * 法人Web の「CSV出力」（components/csv の部品に、法人Web のボタンのクラス・トーストをつないだもの）。
 * 見てよい範囲（法人＝自社の全拠点、拠点アカウント＝その拠点）は画面の行（query が絞ったもの）のまま。法人Web は CSV取込なし（2026/10/03 決定）
 */
export function CorpCsvExport<R>({ className = 'es-btn es-btn--outline es-btn--primary es-btn--md', children, ...o }: Omit<ExportOpts<R>, 'site' | 'by'> & { className?: string; children?: ReactNode; disabled?: boolean }) {
  const { account, toast } = useCorpSignedIn();
  return (
    <CsvExportButton<R> className={className} site="corp" by={account.loginId} notify={toast} scope={{ site: 'corp', corpId: account.corpId, branchId: account.branchId }} {...o}>
      {children ?? 'CSV出力'}
    </CsvExportButton>
  );
}
