'use client';

import { useParams } from 'next/navigation';
import FeeDetail from '../../_components/FeeDetail';

/** 紹介フィーマスタ編集 */
export default function Page() {
  const { id } = useParams<{ id: string }>();
  return <FeeDetail key={`e${id}`} mode="edit" id={id} />;
}
