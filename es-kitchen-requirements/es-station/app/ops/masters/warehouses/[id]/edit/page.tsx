'use client';

import { useParams } from 'next/navigation';
import { MasterRecordPage } from '@/app/ops/_general/master/MasterRecordPage';

/** 倉庫の編集 */
export default function Page() {
  const { id } = useParams<{ id: string }>();
  return <MasterRecordPage mkey="warehouse" id={decodeURIComponent(id)} mode="edit" />;
}
