'use client';

import { Suspense } from 'react';
import CorpInfo from '../sites/_components/CorpInfo';
import { SitesFrame } from '../sites/_components/parts';

/** 法人情報（?tab=info|bill|sites） */
export default function Page() {
  return <SitesFrame><Suspense><CorpInfo editing={false} /></Suspense></SitesFrame>;
}
