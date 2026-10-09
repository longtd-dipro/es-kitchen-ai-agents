'use client';

import contracts from '@/lib/ops/areas/contracts';
import { areaApi, useQuery } from '@/lib/ops/core/client';
import { tone } from '@/lib/ops/contracts/logic';
import MasterList, { EsBadge, uniq } from '../corps/_components/MasterList';

const api = areaApi(contracts);
type Row = NonNullable<ReturnType<typeof useRows>>[number];
const useRows = () => useQuery(api, 'branches').data;

/** 住所の先頭の都道府県（選択肢を拠点の住所から作る） */
const prefOf = (addr: string) => /^(北海道|.{2,3}?[都道府県])/.exec(addr)?.[0];

/** 拠点一覧（元の s-brl） */
export default function BranchesPage() {
  const rows = useRows();
  const text = (r: Row, k: string) => ({
    id: r.id, name: r.name, cp: r.parentNo, zip: r.extra.zip, tel: r.extra.tel, addr: `${r.addr} ${r.extra.city}`, legacy: r.extra.legacy,
    corp: r.corpName, status: r.status, kind: r.contractKind, cst: r.contractStatus, bill: r.billTo, plan: r.plan, start: r.startYm, reg: r.registeredAt,
  } as Record<string, string>)[k] ?? '';
  return (
    <MasterList<Row>
      title="拠点一覧" crumb="拠点"
      search={[
        { t: 'text', keys: ['id', 'name', 'cp'], ph: '拠点ID、拠点名、親契約番号' },
        { t: 'text', keys: ['zip', 'tel', 'addr', 'legacy'], ph: '郵便番号、電話番号、市区町村、旧ES ユーザーID' },
        { t: 'select', key: 'corp', ph: '所属法人', opts: uniq((rows ?? []).map((r) => r.corpName)) },
        { t: 'select', key: 'status', ph: '拠点ステータス', opts: ['仮登録', '本登録', '閉鎖予定', '閉鎖', '取消'] },
        { t: 'select', key: 'kind', ph: '契約種別', opts: ['本導入', 'お試しキャンペーン'] },
        { t: 'select', key: 'cst', ph: '契約ステータス', opts: ['有効', '仮登録', '解約手続き中', '利用休止', '終了', '取消'] },
        { t: 'select', key: 'bill', ph: '請求先', opts: ['法人', 'この拠点'] },
        { t: 'select', key: 'addr', ph: '都道府県', opts: uniq((rows ?? []).map((r) => prefOf(r.addr))) },
        { t: 'select', key: 'plan', ph: '現在のプラン', opts: uniq((rows ?? []).map((r) => r.plan)) },
        { t: 'range', key: 'start', ph: '当初契約開始年月', month: true },
        { t: 'range', key: 'reg', ph: '登録日' },
      ]}
      cols={[
        { label: '拠点ID', mono: true, cell: () => null },
        { label: '拠点名', cell: (r) => r.name },
        { label: '所属法人', cell: (r) => r.corpName },
        { label: '拠点ステータス', cell: (r) => <EsBadge v={r.status} tone={tone(r.status)} />, sort: (r) => r.status },
        { label: '親契約番号', cell: (r) => r.parentNo },
        { label: '契約ステータス', cell: (r) => <EsBadge v={r.contractStatus} tone={tone(r.contractStatus)} />, sort: (r) => r.contractStatus },
        { label: '契約種別', cell: (r) => r.contractKind },
        { label: '現在のプラン', cell: (r) => r.plan },
        { label: '当初契約開始年月', cell: (r) => r.startYm },
        { label: '継続年月', cell: (r) => r.duration },
        { label: '請求先', cell: (r) => r.billTo },
        { label: '住所', cell: (r) => r.addr },
        { label: '登録日時', cell: (r) => r.registeredAt },
      ]}
      rows={rows} initialDesc={(r) => r.registeredAt} rowId={(r) => r.id} name={(r) => r.name} apNo={(r) => r.apNo} text={text}
      href={(id) => `/ops/branches/${id}`}
      csv={{ entity: 'branches', importHref: '/ops/branches/import' }}
    />
  );
}
