'use client';

import { useParams } from 'next/navigation';
import { MasterRecordPage } from '@/app/ops/_general/master/MasterRecordPage';

/** 配送スタッフの編集 */
export default function Page() {
  const { id } = useParams<{ id: string }>();
  return <MasterRecordPage mkey="driver" id={decodeURIComponent(id)} mode="edit" />;
}
