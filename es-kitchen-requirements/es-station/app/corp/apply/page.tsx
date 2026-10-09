'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { ApplyForm } from './_components/ApplyForm';

/**
 * 新規のお申し込み（ログイン前）。元：22_法人_拠点管理.html の Public（ヘッダー）＋ 21_法人_申込フォーム.html の新規契約申込。
 * ?kind=trial でお試しキャンペーンから始める（元の「お試しキャンペーン」メニュー）
 */
function Inner() {
  const kind = useSearchParams().get('kind') === 'trial' ? 'trial' : 'main';
  return <ApplyForm key={kind} initialKind={kind} />;
}

export default function ApplyPage() {
  return (
    <Suspense fallback={null}>
      <Inner />
    </Suspense>
  );
}
