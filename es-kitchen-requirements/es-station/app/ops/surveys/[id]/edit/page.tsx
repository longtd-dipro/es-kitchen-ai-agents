'use client';

import { useParams } from 'next/navigation';
import SurveyEdit from '../../_components/SurveyEdit';

/** アンケート編集 */
export default function Page() {
  const { id } = useParams<{ id: string }>();
  return <SurveyEdit key={`e${id}`} mode="edit" id={id} />;
}
