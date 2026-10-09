'use client';

import { useParams, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import type { Entity } from '@/lib/ops/contracts/types';
import DetailScreen from './DetailScreen';

/** 詳細・編集のページ（URL の [id] と ?tab=・?from=detail を読む） */
export default function EntityPage({ entity, mode }: { entity: Entity; mode: 'detail' | 'edit' }) {
  return <Suspense><Inner entity={entity} mode={mode} /></Suspense>;
}
function Inner({ entity, mode }: { entity: Entity; mode: 'detail' | 'edit' }) {
  const { id } = useParams<{ id: string }>();
  const sp = useSearchParams();
  return <DetailScreen entity={entity} id={decodeURIComponent(id)} mode={mode} tab={sp.get('tab') ?? undefined} from={sp.get('from') ?? undefined} back={sp.get('back') ?? undefined} />;
}
