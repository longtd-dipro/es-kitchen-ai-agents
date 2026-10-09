'use client';

import { useParams } from 'next/navigation';
import MasterDetail from '../../_masters/MasterDetail';

/** 値引きマスタの詳細 */
export default function Page() {
  const { id } = useParams<{ id: string }>();
  return <MasterDetail kind="discounts" id={decodeURIComponent(id)} mode="detail" />;
}
