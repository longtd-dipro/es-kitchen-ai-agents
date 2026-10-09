'use client';

import { useParams } from 'next/navigation';
import MaterialScreen from '../../../_masters/MaterialScreen';

/** 資材マスタの編集（AW_MATE_003） */
export default function Page() {
  const { id } = useParams<{ id: string }>();
  return <MaterialScreen key={id} mode="edit" id={decodeURIComponent(id)} />;
}
