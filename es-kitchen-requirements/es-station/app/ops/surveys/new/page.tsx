'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import SurveyEdit from '../_components/SurveyEdit';

/** アンケート登録（?tpl＝一覧の「テンプレートから作成」で選んだテンプレート） */
export default function Page() {
  return <Suspense><New /></Suspense>;
}
function New() {
  const tpl = useSearchParams().get('tpl') ?? undefined;
  return <SurveyEdit mode="new" tplId={tpl} />;
}
