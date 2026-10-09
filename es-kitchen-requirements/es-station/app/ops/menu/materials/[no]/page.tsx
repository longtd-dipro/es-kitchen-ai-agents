'use client';

import { useParams } from 'next/navigation';
import MatDetail from '../../_components/MatDetail';

/** 資材注文詳細 */
export default function MatDetailPage() {
  const { no } = useParams<{ no: string }>();
  return <MatDetail key={no} no={no} mode="view" />;
}
