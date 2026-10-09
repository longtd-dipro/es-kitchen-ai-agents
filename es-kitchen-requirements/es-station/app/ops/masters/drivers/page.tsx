'use client';

import { useRouter } from 'next/navigation';
import { GenListPage } from '@/app/ops/_general/GenListPage';
import { listLinks } from '@/app/ops/_general/master/config';
import { useMasterDelete } from '@/app/ops/_general/master/useMasterDelete';

/** 配送スタッフ（元：renderGen('driver')）。名前→詳細・新規登録→登録・鉛筆→編集・ごみ箱→削除（Q01 → S02、割り当て済みの配送があれば E244） */
export default function Page() {
  const router = useRouter();
  const del = useMasterDelete('driver');
  return <GenListPage genKey="driver" {...listLinks('driver', router.push)} onDel={(r) => del(r._uid)} />;
}
