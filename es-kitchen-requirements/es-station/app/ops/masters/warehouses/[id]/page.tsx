'use client';

import { useParams } from 'next/navigation';
import { MasterRecordPage } from '@/app/ops/_general/master/MasterRecordPage';
import { BulkChangeModal } from '@/app/ops/_ui/BulkChangeModal';
import { useOps } from '@/app/ops/_ui/OpsProvider';
import { useCanAct } from '@/app/ops/_ui/perm';
import bulk from '@/lib/domain/areas/bulk';
import { domainApi } from '@/lib/domain/client';

const bulkApi = domainApi(bulk);

/** 倉庫の詳細（表示だけ）。「この倉庫の契約を一括変更」はピッキング倉庫・中継倉庫だけ（AW_WRHS_003。返送先・無効には出さない） */
export default function Page() {
  const { id } = useParams<{ id: string }>();
  const { openModal } = useOps();
  const canAct = useCanAct();
  return (
    <MasterRecordPage mkey="warehouse" id={decodeURIComponent(id)} mode="detail"
      actions={(r) => canAct(bulkApi, 'start') && /^(WH|HU)/.test(r.id) && r.status === '有効'
        ? <button className="btn out lg" onClick={() => openModal(<BulkChangeModal source="倉庫マスタ" sourceId={r.id} sourceName={r.name} />)}>この倉庫の契約を一括変更</button>
        : null} />
  );
}
