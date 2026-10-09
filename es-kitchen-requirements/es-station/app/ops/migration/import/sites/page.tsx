'use client';

import MigrationImport from '../../_components/MigrationImport';

/** 移行CSV取込 A. 法人・拠点・契約：1. ファイルを選ぶ（切替のサイクル月も選ぶ） → 2. 確認・登録 */
export default function Page() {
  return <MigrationImport kind="sites" />;
}
