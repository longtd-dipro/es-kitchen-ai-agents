'use client';

import MasterList from '../_masters/MasterList';

/** 資材マスタ一覧（AW_MATE_001）。詳細・登録・編集は画面（機種マスタと同じ。モーダルにしない） */
export default function Page() {
  return <MasterList kind="materials" />;
}
