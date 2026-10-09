'use client';

import { CarrierCsvImportPage } from '../../_ui/csv';

/** 配送スタッフ の CSV取込（画面。lib/csv/sites.ts の carrierStaff・登録は「新規登録」と同じ確かめ） */
export default function Page() {
  return (
    <CarrierCsvImportPage crumbs={[['ホーム', '/carrier'], ['配送スタッフ', '/carrier/staff']]} title="配送スタッフ CSV取込" back="/carrier/staff" entity="carrierStaff"
      desc={<>1行＝1人（配送スタッフID は空欄）。配送スタッフ名・カナ（全角カタカナ）・メールアドレスは必須です。免許証の写真は CSV で送れないため「免許未登録」で登録します（スタッフ詳細で写真を追加してください）。</>} />
  );
}
