'use client';

import { useParams } from 'next/navigation';
import AgencyDetail from '../_components/AgencyDetail';

/** 代理店情報詳細 */
export default function Page() {
  const { id } = useParams<{ id: string }>();
  return <AgencyDetail key={`v${id}`} mode="view" id={id} />;
}
