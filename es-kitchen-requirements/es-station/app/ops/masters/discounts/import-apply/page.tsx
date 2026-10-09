'use client';

import MasterCsvImport from '../../_masters/MasterCsvImport';

/** discounts の CSV取込（画面） */
export default function Page() {
  return <MasterCsvImport kind="discounts" entity="discountApply" title="値引きの適用 CSV取込" />;
}
