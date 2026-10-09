'use client';

import CsvImportScreen from '../../_ui/CsvImportScreen';

/** 子契約CSV取込（画面。更新だけ・キーは子契約ID。その月から後ろの未確定の子契約にも当てる） */
export default function Page() {
  return (
    <CsvImportScreen
      entity="contracts" title="子契約CSV取込" listTitle="子契約一覧" crumb0="法人・契約管理" listUrl="/ops/contracts"
      desc={<>キーは子契約ID（更新だけ）。新しい子契約は拠点の「子契約を先まで作る」から作ってください。列は子契約一覧の CSV出力と同じです。</>}
      descMore={<>変更は、その子契約の月から後ろの<b>未確定</b>の子契約にも当てます（確定・請求済の月はエラー）。</>}
    />
  );
}
