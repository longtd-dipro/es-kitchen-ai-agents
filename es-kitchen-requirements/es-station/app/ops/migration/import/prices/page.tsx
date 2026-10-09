'use client';

import MigrationImport from '../../_components/MigrationImport';

/** 移行CSV取込 D. 企業独自価格：1. ファイルを選ぶ → 2. 確認・登録 */
export default function Page() {
  return <MigrationImport kind="prices" />;
}
