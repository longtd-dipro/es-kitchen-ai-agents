'use client';

import { GenCsvImportPage } from '@/app/ops/_general/GenCsvImportPage';

/** 配送スタッフ（マスタ）の CSV取込（画面） */
export default function Page() {
  return <GenCsvImportPage genKey="driver" />;
}
