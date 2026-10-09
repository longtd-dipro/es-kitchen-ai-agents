'use client';

import CsvImportScreen from '../../_ui/CsvImportScreen';

/** 法人CSV取込（画面。更新だけ・キーは法人ID。担当者も同じファイル） */
export default function Page() {
  return (
    <CsvImportScreen
      entity="corps" title="法人CSV取込" listTitle="法人一覧" crumb0="法人・契約管理" listUrl="/ops/corps"
      desc={<>キーは法人ID（更新だけ）。新しい法人は契約申請管理の「代理入力」から登録してください。列は法人一覧の CSV出力と同じです。</>}
      descMore={<>担当者は1行＝1人で、同じ法人IDの行を並べます（2行目以降の法人の列は空欄でよい。「区分＋メールアドレス」で突き合わせ、あれば更新・なければ追加。CSV では削除しません）。</>}
    />
  );
}
