'use client';

import { useParams } from 'next/navigation';
import NoticeEdit from '../../_components/NoticeEdit';

/** お知らせ編集 */
export default function Page() {
  const { id } = useParams<{ id: string }>();
  return <NoticeEdit key={`e${id}`} mode="edit" id={id} />;
}
