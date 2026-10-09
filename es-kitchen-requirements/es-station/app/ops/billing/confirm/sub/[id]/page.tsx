'use client';

import { Suspense } from 'react';
import SubDetail from './SubDetail';

/** 請求詳細（子契約） */
export default function SubDetailPage() {
  return <Suspense><SubDetail edit={false} /></Suspense>;
}
