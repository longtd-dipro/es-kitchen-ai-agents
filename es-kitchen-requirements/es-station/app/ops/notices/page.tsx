'use client';

import { useRouter } from 'next/navigation';
import { GenListPage } from '@/app/ops/_general/GenListPage';

/** お知らせ設定 ＞ お知らせ一覧（元：renderGen('notices')。新規登録・ID・鉛筆はお知らせの画面へ） */
export default function Page() {
  const router = useRouter();
  return (
    <GenListPage
      genKey="notices"
      onNew={() => router.push('/ops/notices/new')}
      onLink={(r) => router.push(`/ops/notices/${r.id}`)}
      onEdit={(r) => router.push(`/ops/notices/${r.id}/edit`)}
    />
  );
}
