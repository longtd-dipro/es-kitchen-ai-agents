'use client';

import { useRouter } from 'next/navigation';
import { GenListPage } from '@/app/ops/_general/GenListPage';
import { useDeleteRole } from './_ui/useDeleteRole';

/** 権限（元：renderGen('perm')）。権限名で詳細（表示だけ）・鉛筆で編集・「権限登録」で作成（システム管理＝「権限付与」の担当） */
export default function Page() {
  const router = useRouter();
  const deleteRole = useDeleteRole();
  const to = (path: string) => router.push(`/ops/accounts/permissions/${path}`);
  return <GenListPage genKey="perm" onNew={() => to('new')} onLink={(r) => to(encodeURIComponent(r._uid))} onEdit={(r) => to(`${encodeURIComponent(r._uid)}/edit`)} onDel={(r) => deleteRole(r._uid)} />;
}
