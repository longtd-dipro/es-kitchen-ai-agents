'use client';

import { Suspense } from 'react';
import ReceiveView from '../_ui/ReceiveView';

/** 荷物受取（倉庫） */
export default function Page() {
  return <Suspense><ReceiveView type="wh" /></Suspense>;
}
