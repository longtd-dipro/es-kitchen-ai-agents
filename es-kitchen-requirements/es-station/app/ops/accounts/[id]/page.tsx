'use client';

import { use } from 'react';
import { OpsAccountPage } from '../_ui/OpsAccountPage';

/** アカウント管理（運営）詳細（表示だけ。アカウント一覧の運営タブの名前から） */
export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <OpsAccountPage id={decodeURIComponent(id)} mode="view" />;
}
