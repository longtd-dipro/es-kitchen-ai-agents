'use client';

import { Suspense } from 'react';
import StockDetail from '../StockDetail';

/** 在庫調整（在庫詳細の編集） */
export default function StockEditPage() {
  return <Suspense><StockDetail edit /></Suspense>;
}
