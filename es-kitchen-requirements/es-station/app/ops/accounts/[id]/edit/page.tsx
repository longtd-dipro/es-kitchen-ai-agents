'use client';

import { use } from 'react';
import { OpsAccountPage } from '../../_ui/OpsAccountPage';

/** アカウント管理（運営）編集（詳細の「編集」） */
export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <OpsAccountPage id={decodeURIComponent(id)} mode="edit" />;
}
