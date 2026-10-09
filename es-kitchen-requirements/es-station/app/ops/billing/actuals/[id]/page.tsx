'use client';

import { Suspense } from 'react';
import ActualDetail from './ActualDetail';

/** 実績精算詳細 */
export default function ActualDetailPage() {
  return <Suspense><ActualDetail edit={false} /></Suspense>;
}
