'use client';

import { useParams } from 'next/navigation';
import SurveyEdit from '../_components/SurveyEdit';

/** アンケートの詳細（公開中・終了は 設問 タブが回答の集計） */
export default function Page() {
  const { id } = useParams<{ id: string }>();
  return <SurveyEdit key={`v${id}`} mode="view" id={id} />;
}
