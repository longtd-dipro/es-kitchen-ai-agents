'use client';

import MasterCsvImport from '../../_masters/MasterCsvImport';

/** 資材マスタの CSV取込（画面。AW_MATE_004。列は lib/csv/master.ts の materials） */
export default function Page() {
  return <MasterCsvImport kind="materials" />;
}
