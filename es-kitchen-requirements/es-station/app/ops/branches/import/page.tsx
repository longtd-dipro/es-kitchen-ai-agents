'use client';

import CsvImportScreen from '../../_ui/CsvImportScreen';

/** 拠点CSV取込（画面。更新だけ・キーは拠点ID。担当者も同じファイル） */
export default function Page() {
  return (
    <CsvImportScreen
      entity="branches" title="拠点CSV取込" listTitle="拠点一覧" crumb0="法人・契約管理" listUrl="/ops/branches"
      desc={<>キーは拠点ID（更新だけ）。新しい拠点は契約申請管理の「代理入力」から登録してください。列は拠点一覧の CSV出力と同じです。</>}
      descMore={<>担当者は1行＝1人で、同じ拠点IDの行を並べます（2行目以降の拠点の列は空欄でよい。「区分＋メールアドレス」で突き合わせ、あれば更新・なければ追加。CSV では削除しません）。</>}
    />
  );
}
