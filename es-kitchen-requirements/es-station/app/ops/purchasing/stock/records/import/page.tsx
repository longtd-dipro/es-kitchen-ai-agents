'use client';

import { OpsCsvImportPage } from '@/app/ops/_ui/CsvImportPage';

const BACK = '/ops/purchasing/stock/records';

/** 在庫の記録 の CSV取込（画面。足すだけ・lib/csv/data.ts の stockMoves） */
export default function Page() {
  return (
    <OpsCsvImportPage crumbs={['発注・入荷', ['倉庫在庫', '/ops/purchasing/stock'], ['在庫の記録', BACK]]} title="在庫の記録 CSV取込" back={BACK} entity="stockMoves"
      desc={<>1行＝1つの記録（足すだけ。登録した記録は直せません）。倉庫ID・品番・区分・増減（増える／減る）・数量・日付・理由を入れます。</>} />
  );
}
