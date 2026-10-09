'use client';

import { GenCsvImportPage } from '@/app/ops/_general/GenCsvImportPage';

/** 仕入先マスタ の CSV取込（画面） */
export default function Page() {
  return <GenCsvImportPage genKey="supplier" />;
}
