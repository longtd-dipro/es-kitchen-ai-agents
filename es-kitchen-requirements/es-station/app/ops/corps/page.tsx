'use client';

import contracts from '@/lib/ops/areas/contracts';
import { areaApi, useQuery } from '@/lib/ops/core/client';
import { tone } from '@/lib/ops/contracts/logic';
import MasterList, { EsBadge, uniq } from './_components/MasterList';

const api = areaApi(contracts);
type Row = NonNullable<ReturnType<typeof useRows>>[number];
const useRows = () => useQuery(api, 'corps').data;

/** 法人一覧（元の s-col） */
export default function CorpsPage() {
  const rows = useRows();
  const text = (r: Row, k: string) => ({
    id: r.id, name: `${r.name} ${r.extra.kana}`, zip: r.extra.zip, tel: r.extra.tel, status: r.status, unit: r.invoiceUnit, es: r.salesRep, reg: r.registeredAt,
  } as Record<string, string>)[k] ?? '';
  return (
    <MasterList<Row>
      title="法人一覧" crumb="法人"
      search={[
        { t: 'text', keys: ['id', 'name'], ph: '法人ID、法人名、フリガナ' },
        { t: 'text', keys: ['zip', 'tel'], ph: '郵便番号、電話番号' },
        { t: 'select', key: 'status', ph: '法人ステータス', opts: ['仮登録', '正式登録', '休眠', '取消'] },
        { t: 'select', key: 'unit', ph: '請求書の発行単位', opts: ['まとめて発行（法人1通）', '拠点ごと発行'] },
        { t: 'select', key: 'es', ph: 'ES営業担当', opts: uniq((rows ?? []).map((r) => r.salesRep)) },
        { t: 'range', key: 'reg', ph: '登録日' },
      ]}
      cols={[
        { label: '法人ID', mono: true, cell: () => null },
        { label: '法人名', cell: (r) => r.name },
        { label: '法人ステータス', cell: (r) => <EsBadge v={r.status} tone={tone(r.status)} />, sort: (r) => r.status },
        { label: '請求書の発行単位', cell: (r) => r.invoiceUnit },
        { label: '配下の拠点', cell: (r) => r.branchLabel },
        { label: '請求書発行リードタイム', cell: (r) => r.invoiceLead },
        { label: 'ES営業担当', cell: (r) => r.salesRep },
        { label: '登録日時', cell: (r) => r.registeredAt },
      ]}
      rows={rows} initialDesc={(r) => r.registeredAt} rowId={(r) => r.id} name={(r) => r.name} muted={(r) => r.status === '取消'} apNo={(r) => r.apNo} text={text}
      href={(id) => `/ops/corps/${id}`}
      csv={{ entity: 'corps', importHref: '/ops/corps/import' }}
    />
  );
}
