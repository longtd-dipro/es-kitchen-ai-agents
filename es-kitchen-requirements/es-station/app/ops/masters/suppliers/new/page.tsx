'use client';

import { MasterRecordPage } from '@/app/ops/_general/master/MasterRecordPage';

/** 仕入先の登録（新規。ID はシステムが採番） */
export default function Page() {
  return <MasterRecordPage mkey="supplier" mode="new" />;
}
