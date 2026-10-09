'use client';

import { useParams } from 'next/navigation';
import FeeDetail from '../_components/FeeDetail';

/** 紹介フィーマスタ詳細 */
export default function Page() {
  const { id } = useParams<{ id: string }>();
  return <FeeDetail key={`v${id}`} mode="view" id={id} />;
}
