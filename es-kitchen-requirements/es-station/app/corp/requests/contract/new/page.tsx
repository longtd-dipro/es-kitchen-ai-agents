'use client';

import { Suspense } from 'react';
import ApplyForm from '../../../sites/_components/ApplyForm';
import { SitesFrame } from '../../../sites/_components/parts';

/** 変更のお申し込み（新しい申請）。?kind=…&site=… で手続きと拠点を選んだ状態から */
export default function Page() {
  return <SitesFrame><Suspense><ApplyForm /></Suspense></SitesFrame>;
}
