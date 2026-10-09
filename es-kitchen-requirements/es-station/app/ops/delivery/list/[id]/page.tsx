'use client';

import { useParams } from 'next/navigation';
import { Suspense } from 'react';
import DeliveryDetail from '../../_components/DeliveryDetail';

/* 出荷・配送データ詳細（部品 16 の DeliveryDetail） */
export default function Page() {
  const { id } = useParams<{ id: string }>();
  return <Suspense><DeliveryDetail id={decodeURIComponent(id)} mode="view" /></Suspense>;
}
