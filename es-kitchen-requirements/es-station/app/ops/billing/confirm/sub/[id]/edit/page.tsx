'use client';

import { Suspense } from 'react';
import SubDetail from '../SubDetail';

/** 請求編集（子契約の ③ 調整） */
export default function SubEditPage() {
  return <Suspense><SubDetail edit /></Suspense>;
}
