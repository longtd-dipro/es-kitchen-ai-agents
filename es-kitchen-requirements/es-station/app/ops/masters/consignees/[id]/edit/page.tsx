'use client';

import { useParams } from 'next/navigation';
import { MasterRecordPage } from '@/app/ops/_general/master/MasterRecordPage';

/** 委託配送先の編集 */
export default function Page() {
  const { id } = useParams<{ id: string }>();
  return <MasterRecordPage mkey="consign" id={decodeURIComponent(id)} mode="edit" />;
}
