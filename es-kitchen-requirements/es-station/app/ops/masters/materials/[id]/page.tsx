'use client';

import { useParams } from 'next/navigation';
import MaterialScreen from '../../_masters/MaterialScreen';

/** 資材マスタの詳細（AW_MATE_002。表示だけ） */
export default function Page() {
  const { id } = useParams<{ id: string }>();
  return <MaterialScreen key={id} mode="detail" id={decodeURIComponent(id)} />;
}
