'use client';

import { GenListPage } from '@/app/ops/_general/GenListPage';
import { useRouter } from 'next/navigation';
import { listLinks } from '@/app/ops/_general/master/config';
import { useMasterDelete } from '@/app/ops/_general/master/useMasterDelete';
import { BulkChangeModal } from '@/app/ops/_ui/BulkChangeModal';
import { useOps } from '@/app/ops/_ui/OpsProvider';
import { useCanAct } from '@/app/ops/_ui/perm';
import bulk from '@/lib/domain/areas/bulk';
import { domainApi } from '@/lib/domain/client';

const bulkApi = domainApi(bulk);

/** 委託配送先（元：renderGen('consign')）。「この配送先の契約を一括変更」（課題 7-2） */
export default function Page() {
  const { openModal } = useOps();
  const canAct = useCanAct();
  const router = useRouter();
  const del = useMasterDelete('consign');
  return (
    /* 権限がなければ一括変更を出さない。名前→詳細・新規登録→登録・鉛筆→編集・ごみ箱→削除（Q01 → S02、使用中は E243） */
    <GenListPage genKey="consign" {...listLinks('consign', router.push)} onDel={(r) => del(r._uid)} rowAct={canAct(bulkApi, 'start') ? {
      label: 'この配送先の契約を一括変更',
      onClick: (r) => openModal(<BulkChangeModal source="委託配送先マスタ" sourceId={String(r.id)} sourceName={String(r.name)} />),
    } : undefined} />
  );
}
