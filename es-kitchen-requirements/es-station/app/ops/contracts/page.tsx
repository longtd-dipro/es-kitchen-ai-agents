'use client';

import contracts from '@/lib/ops/areas/contracts';
import { areaApi, useQuery } from '@/lib/ops/core/client';
import type { ChildContract } from '@/lib/ops/contracts/types';
import bulk from '@/lib/domain/areas/bulk';
import { domainApi } from '@/lib/domain/client';
import MasterList, { EsBadge, uniq } from '../corps/_components/MasterList';
import { BulkChangeModal } from '../_ui/BulkChangeModal';
import { useOps } from '../_ui/OpsProvider';
import { useCanAct } from '../_ui/perm';

const api = areaApi(contracts);
const bulkApi = domainApi(bulk);

/** 子契約一覧（元の s-ctl） */
export default function ContractsPage() {
  const { data: rows } = useQuery(api, 'children');
  const { openModal } = useOps();
  const canAct = useCanAct();
  const text = (r: ChildContract, k: string) => ({
    id: r.id, branch: r.branchName, corp: r.corpName, month: r.month, kind: r.kind, plan: r.plan, ship: r.ship, billst: r.billStatus, gen: r.gen,
  } as Record<string, string>)[k] ?? '';
  return (
    <MasterList<ChildContract>
      title="子契約一覧" crumb="子契約"
      search={[
        { t: 'text', keys: ['id', 'branch', 'corp'], ph: '子契約ID、拠点名、法人名' },
        { t: 'select', key: 'month', ph: '契約・サイクル月', opts: uniq((rows ?? []).map((r) => r.month)).reverse() },
        { t: 'select', key: 'kind', ph: '契約種別', opts: ['本導入', 'お試しキャンペーン'] },
        { t: 'select', key: 'plan', ph: 'プラン', opts: uniq((rows ?? []).map((r) => r.plan)) },
        { t: 'select', key: 'ship', ph: '配送区分', opts: ['ES配送便', 'COOL便'] },
        { t: 'select', key: 'billst', ph: '請求ステータス（前払い）', opts: ['未確定', '確定', '請求済'] },
        { t: 'select', key: 'gen', ph: '生成方法', opts: ['日次バッチ', '手動生成', '年一括'] },
      ]}
      cols={[
        { label: '子契約ID', mono: true, cell: (r) => (r.apNo ? <> <EsBadge v="仮登録" tone="info" /></> : r.canceled ? <> <EsBadge v="取消" tone="neutral" /></> : null) },
        { label: '契約・サイクル月', cell: (r) => r.month },
        { label: '拠点', cell: (r) => r.branchName },
        { label: '所属法人', cell: (r) => r.corpName },
        { label: '契約種別', cell: (r) => r.kind },
        { label: 'プラン', cell: (r) => r.plan },
        { label: '配送区分・納品回数', cell: (r) => r.ship },
        { label: '請求月（前払い）', cell: (r) => r.billMonth },
        { label: '当月請求額（税抜）', cell: (r) => r.amount, num: true, sort: (r) => r.amountYen },
        { label: '請求ステータス', cell: (r) => r.billStatus },
        { label: '生成方法', cell: (r) => r.gen },
      ]}
      rows={rows} initialDesc={(r) => r.month} rowId={(r) => r.id} name={(r) => r.branchName} muted={(r) => !!r.canceled} apNo={(r) => r.apNo} text={text}
      href={(id) => `/ops/contracts/${id}`}
      /* 一括変更は契約の側から（価格世代モード：プラン・価格の世代を条件に未確定の子契約に当てる。台帳 F 運営A Q-C2・受付簿 #96）。CSV出力の左・編集権限のある役割だけ */
      actions={canAct(bulkApi, 'start') && <button type="button" className="es-btn es-btn--outline es-btn--primary es-btn--lg" onClick={() => openModal(<BulkChangeModal source="子契約一覧" sourceId="" sourceName="子契約一覧" />)}>一括変更</button>}
      csv={{ entity: 'contracts', key: (r) => r.id, importHref: '/ops/contracts/import' }}
    />
  );
}
