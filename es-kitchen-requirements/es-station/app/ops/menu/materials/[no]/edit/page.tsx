'use client';

import { useParams } from 'next/navigation';
import MatDetail from '../../../_components/MatDetail';

/** 資材注文編集（出荷待のときだけ） */
export default function MatEditPage() {
  const { no } = useParams<{ no: string }>();
  return <MatDetail key={no} no={no} mode="edit" />;
}
