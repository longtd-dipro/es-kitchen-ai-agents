'use client';

import { useParams } from 'next/navigation';
import PayDetail from '../../_components/PayDetail';

/** フィー支払履歴編集 */
export default function Page() {
  const { id } = useParams<{ id: string }>();
  return <PayDetail key={`e${id}`} mode="edit" id={id} />;
}
