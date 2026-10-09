'use client';

import { useParams } from 'next/navigation';
import RefDetail from '../../_components/RefDetail';

/** 紹介履歴編集 */
export default function Page() {
  const { id } = useParams<{ id: string }>();
  return <RefDetail key={`e${id}`} mode="edit" id={id} />;
}
