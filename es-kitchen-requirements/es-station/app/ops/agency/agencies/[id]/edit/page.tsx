'use client';

import { useParams } from 'next/navigation';
import AgencyDetail from '../../_components/AgencyDetail';

/** 代理店情報編集 */
export default function Page() {
  const { id } = useParams<{ id: string }>();
  return <AgencyDetail key={`e${id}`} mode="edit" id={id} />;
}
