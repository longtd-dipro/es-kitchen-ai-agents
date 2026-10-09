'use client';

import { useParams } from 'next/navigation';
import MasterDetail from '../../../_masters/MasterDetail';

/** オプションマスタの編集 */
export default function Page() {
  const { id } = useParams<{ id: string }>();
  return <MasterDetail kind="options" id={decodeURIComponent(id)} mode="edit" />;
}
