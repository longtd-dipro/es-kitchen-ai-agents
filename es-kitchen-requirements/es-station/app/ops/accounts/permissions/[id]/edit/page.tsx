'use client';

import { use } from 'react';
import { RoleEditor } from '../../_ui/RoleEditor';

/** 権限の編集（詳細の「編集」・一覧の鉛筆） */
export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <RoleEditor id={id} />;
}
