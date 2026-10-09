'use client';

import { OpsCsvImportPage } from '@/app/ops/_ui/CsvImportPage';
import { closePo } from '../../_components/receipts';
import { usePo } from '../../_components/usePo';

const BACK = '/ops/purchasing/receiving';

/** 入荷登録 の CSV取込（画面。lib/csv/data.ts の receiving・stock.receive と同じ確かめ）。一致した発注は入荷済にする */
export default function Page() {
  const { orders } = usePo();
  return (
    <OpsCsvImportPage crumbs={['発注・入荷', ['入荷登録', BACK]]} title="入荷登録 CSV取込" back={BACK} entity="receiving"
      desc={<>1行＝1つの発注の今回の入荷。発注番号・入荷した数・箱数・入荷日（空なら今日）を入れます（賞味期限／消費期限は仕入先が入れたものを使うので入れません）。予定と違う数は「差異あり・対応待ち」で保存し、入荷登録の画面で対応を選びます。</>}
      onFollow={async (fs) => { for (const x of fs) if (x.kind === 'closePo') { const p = x.payload as { no: string; date: string }; await closePo(p.no, p.date, orders ?? []); } }} />
  );
}
