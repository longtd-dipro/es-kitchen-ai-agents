'use client';

import { useParams } from 'next/navigation';
import { Suspense } from 'react';
import SiteDetail from '../../_components/SiteDetail';
import { SitesFrame } from '../../_components/parts';

/** 拠点編集 */
export default function Page() {
  const { id } = useParams<{ id: string }>();
  return <SitesFrame><Suspense><SiteDetail key={id + '-e'} id={id} editing /></Suspense></SitesFrame>;
}
