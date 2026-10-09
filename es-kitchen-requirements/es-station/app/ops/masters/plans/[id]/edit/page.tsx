'use client';

import { useParams } from 'next/navigation';
import MasterDetail from '../../../_masters/MasterDetail';

/** プランマスタの編集 */
export default function Page() {
  const { id } = useParams<{ id: string }>();
  return <MasterDetail kind="plans" id={decodeURIComponent(id)} mode="edit" />;
}
