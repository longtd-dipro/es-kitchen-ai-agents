'use client';

import { useParams } from 'next/navigation';
import PayDetail from '../_components/PayDetail';

/** フィー支払履歴詳細 */
export default function Page() {
  const { id } = useParams<{ id: string }>();
  return <PayDetail key={`v${id}`} mode="view" id={id} />;
}
