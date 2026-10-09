'use client';

import { MasterRecordPage } from '@/app/ops/_general/master/MasterRecordPage';

/** 倉庫の登録（新規。ID はシステムが採番） */
export default function Page() {
  return <MasterRecordPage mkey="warehouse" mode="new" />;
}
