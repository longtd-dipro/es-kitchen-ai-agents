'use client';

import { useParams } from 'next/navigation';
import RefDetail from '../_components/RefDetail';

/** 紹介履歴詳細 */
export default function Page() {
  const { id } = useParams<{ id: string }>();
  return <RefDetail key={`v${id}`} mode="view" id={id} />;
}
