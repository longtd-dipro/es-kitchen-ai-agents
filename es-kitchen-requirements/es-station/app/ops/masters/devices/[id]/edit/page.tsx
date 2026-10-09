'use client';

import { useParams } from 'next/navigation';
import MasterDetail from '../../../_masters/MasterDetail';

/** 機種マスタの編集 */
export default function Page() {
  const { id } = useParams<{ id: string }>();
  return <MasterDetail kind="devices" id={decodeURIComponent(id)} mode="edit" />;
}
