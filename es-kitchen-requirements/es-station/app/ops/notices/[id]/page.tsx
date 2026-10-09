'use client';

import { useParams } from 'next/navigation';
import NoticeEdit from '../_components/NoticeEdit';

/** お知らせ詳細 */
export default function Page() {
  const { id } = useParams<{ id: string }>();
  return <NoticeEdit key={`v${id}`} mode="view" id={id} />;
}
