'use client';

import { useParams } from 'next/navigation';
import { MasterRecordPage } from '@/app/ops/_general/master/MasterRecordPage';
import { BulkChangeModal } from '@/app/ops/_ui/BulkChangeModal';
import { useOps } from '@/app/ops/_ui/OpsProvider';
import { useCanAct } from '@/app/ops/_ui/perm';
import bulk from '@/lib/domain/areas/bulk';
import { domainApi } from '@/lib/domain/client';

const bulkApi = domainApi(bulk);

/** 委託配送先の詳細（表示だけ）。「この配送先の契約を一括変更」もここに置く（AW_CNSG_003。無効の配送先には出さない） */
export default function Page() {
  const { id } = useParams<{ id: string }>();
  const { openModal } = useOps();
  const canAct = useCanAct();
  return (
    <MasterRecordPage mkey="consign" id={decodeURIComponent(id)} mode="detail"
      actions={(r) => canAct(bulkApi, 'start') && r.status !== '無効'
        ? <button className="btn out lg" onClick={() => openModal(<BulkChangeModal source="委託配送先マスタ" sourceId={r.id} sourceName={r.name} />)}>この配送先の契約を一括変更</button>
        : null} />
  );
}
