'use client';

import { Suspense } from 'react';
import StockDetail from './StockDetail';

/** 在庫詳細 */
export default function StockDetailPage() {
  return <Suspense><StockDetail edit={false} /></Suspense>;
}
