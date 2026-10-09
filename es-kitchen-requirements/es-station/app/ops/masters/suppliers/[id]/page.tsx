'use client';

import { useParams } from 'next/navigation';
import { MasterRecordPage } from '@/app/ops/_general/master/MasterRecordPage';

/** 仕入先の詳細（表示だけ） */
export default function Page() {
  const { id } = useParams<{ id: string }>();
  return <MasterRecordPage mkey="supplier" id={decodeURIComponent(id)} mode="detail" />;
}
