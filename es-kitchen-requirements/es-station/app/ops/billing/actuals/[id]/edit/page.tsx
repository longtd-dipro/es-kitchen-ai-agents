'use client';

import { Suspense } from 'react';
import ActualDetail from '../ActualDetail';

/** 実績精算編集 */
export default function ActualEditPage() {
  return <Suspense><ActualDetail edit /></Suspense>;
}
