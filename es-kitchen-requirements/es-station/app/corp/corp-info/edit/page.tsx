'use client';

import { Suspense } from 'react';
import CorpInfo from '../../sites/_components/CorpInfo';
import { SitesFrame } from '../../sites/_components/parts';

/** 法人情報編集 */
export default function Page() {
  return <SitesFrame><Suspense><CorpInfo editing /></Suspense></SitesFrame>;
}
