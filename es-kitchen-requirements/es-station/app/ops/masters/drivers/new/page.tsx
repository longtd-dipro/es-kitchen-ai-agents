'use client';

import { MasterRecordPage } from '@/app/ops/_general/master/MasterRecordPage';

/** 配送スタッフの登録（新規。ID はシステムが採番） */
export default function Page() {
  return <MasterRecordPage mkey="driver" mode="new" />;
}
