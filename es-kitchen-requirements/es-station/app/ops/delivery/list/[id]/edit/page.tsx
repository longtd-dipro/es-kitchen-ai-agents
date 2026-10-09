'use client';

import { useParams } from 'next/navigation';
import { Suspense } from 'react';
import DeliveryDetail from '../../../_components/DeliveryDetail';

/* 出荷・配送データ編集（部品 16 の DeliveryDetail mode=edit） */
export default function Page() {
  const { id } = useParams<{ id: string }>();
  return <Suspense><DeliveryDetail id={decodeURIComponent(id)} mode="edit" /></Suspense>;
}
