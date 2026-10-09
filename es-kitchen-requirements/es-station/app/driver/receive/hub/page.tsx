'use client';

import { Suspense } from 'react';
import ReceiveView from '../../_ui/ReceiveView';

/** 荷物受取（中継先） */
export default function Page() {
  return <Suspense><ReceiveView type="hub" /></Suspense>;
}
