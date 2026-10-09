'use client';

import { useRouter } from 'next/navigation';
import { PauseModal } from './_components/PauseModal';
import { useOps } from '../_ui/OpsProvider';
import { useCanAct } from '../_ui/perm';
import org from '@/lib/domain/areas/org';
import { useDomainQuery, domainApi } from '@/lib/domain/client';
import { TODO_LABELS, type TodoRow } from '@/lib/domain/migrate';
import { ListView, useList, type ListCol, type ListFilter } from '../_general/list';
import { ListCsv } from '../_ui/csv';
import { Icon } from '../_ui/Icon';
import { useScreenCan } from '../_ui/perm';
import { Badge, PageHead } from '../_ui/ui';

/**
 * 法人・契約管理 ＞ 移行の要補完（受付簿 No.28・契約_01 §9-1）。
 * フェーズ1から移行 CSV で入れた拠点のうち、補完する項目（空で取り込んだもの）が残っているものを拠点ごとに出す。
 * データは共通データ（org.migrationTodo → lib/domain/migrate.ts の todoOf）。画面で埋める（または A〜D を取り込み直す）と一覧から消える。
 */
const api = domainApi(org);
const IMPORT = '/ops/migration/import';

const FILTERS: ListFilter[] = [
  { t: 'search', ph: '拠点ID、拠点名、法人ID、法人名', span: 2, keys: ['branchId', 'branchName', 'corpId', 'corpName'] },
  { t: 'select', ph: '足りない項目', col: 'labels', opts: Object.values(TODO_LABELS) },
  { t: 'select', ph: '契約区分', col: 'kind', opts: ['本導入', 'お試しキャンペーン'] },
  { t: 'select', ph: '契約の状態', col: 'status', opts: ['仮登録', '有効', '利用休止', '解約手続き中'] },
  { t: 'range', ph: '取込日', col: 'importedAt' },
];

export default function Page() {
  const router = useRouter();
  const screenCan = useScreenCan();
  const { openModal } = useOps();
  const canAct = useCanAct();
  const list = useList('migrationTodo');
  const { data } = useDomainQuery(api, 'migrationTodo');
  const rows = (data ?? []) as TodoRow[];
  const go = (e: { preventDefault: () => void }, href: string) => { e.preventDefault(); router.push(href); };

  const cols: ListCol<TodoRow>[] = [
    { key: 'branchId', label: '拠点ID', td: (r) => <td><a className="lnk u mono" href={`/ops/branches/${r.branchId}`} onClick={(e) => go(e, `/ops/branches/${r.branchId}`)}>{r.branchId}</a></td> },
    { key: 'branchName', label: '拠点名', td: (r) => <td><div className="clip" title={r.branchName}>{r.branchName}</div></td> },
    {
      key: 'corpName', label: '法人',
      td: (r) => <td>{r.corpId ? <a className="lnk u" href={`/ops/corps/${r.corpId}`} onClick={(e) => go(e, `/ops/corps/${r.corpId}`)}>{r.corpName}</a> : r.corpName}</td>,
    },
    { key: 'kind', label: '契約区分' },
    { key: 'status', label: '契約の状態', td: (r) => <td><Badge v={r.status} /></td> },
    { key: 'count', label: '足りない項目の数', num: true },
    {
      key: 'labels', label: '足りない項目',
      td: (r) => (
        <td>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.285714rem' }}>
            {r.items.map((x) => (x.where === 'application' && r.appId
              ? <a key={x.code} className="badge b-warn" href={`/ops/applications/${r.appId}`} onClick={(e) => go(e, `/ops/applications/${r.appId}`)} title="申込の受付を開く（受付 → 契約設定 → 本登録）">{x.label}（{r.appId}）</a>
              : <span key={x.code} className={`badge ${x.where === 'csv' ? 'b-info' : 'b-warn'}`} title={`${x.level}の項目${x.where === 'csv' ? '（CSV取込 A〜C の取り込み直しで入れます）' : ''}`}>{x.label}</span>))}
          </div>
        </td>
      ),
    },
    { key: 'importedAt', label: '取込日' },
    {
      key: '_act', label: '操作', act: true,
      td: (r) => (
        <td className="act">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.285714rem', justifyContent: 'flex-end' }}>
            {r.corpId && r.items.some((x) => x.where === 'corp') && <button className="btn out sm" onClick={() => router.push(`/ops/corps/${r.corpId}/edit`)}>法人を編集</button>}
            {r.items.some((x) => x.where === 'branch') && <button className="btn out sm" onClick={() => router.push(`/ops/branches/${r.branchId}/edit`)}>拠点を編集</button>}
            {r.appId && r.items.some((x) => x.where === 'application') && <button className="btn out sm" onClick={() => router.push(`/ops/applications/${r.appId}`)}>申込を開く</button>}
            {r.items.some((x) => x.code === 'contract.pause') && canAct(api, 'setMigrationPause') && <button className="btn out sm" onClick={() => openModal(<PauseModal contractId={r.contractId} branchName={r.branchName} fromCycle={r.pauseFrom} />)}>休止の期間を入れる</button>}
            {r.childId && r.items.some((x) => x.where === 'child') && <button className="btn out sm" onClick={() => router.push(`/ops/contracts/${r.childId}/edit`)}>子契約を編集</button>}
          </div>
        </td>
      ),
    },
  ];

  return (
    <>
      <PageHead crumbs={['法人・契約管理']} title="移行の要補完">
        {screenCan('csvImport') && <button className="btn csv lg" onClick={() => router.push(IMPORT)}><Icon name="upl" />移行CSV取込</button>}
        {/* CSV出力：検索条件のとおりの全件（足りない項目を「 ／ 」でつないだ列つき） */}
        <ListCsv screen="移行の要補完" list={list} filters={FILTERS} rows={rows} cols={cols} />
      </PageHead>
      <div className="card">
        <p className="hint" style={{ margin: '0 0 0.857143rem', lineHeight: 1.7 }}>
          フェーズ1から移行した拠点のうち、空のまま取り込んで補完が残っているものです（足りない項目を拠点ごとに並べています）。
          <b>橙のラベル</b>は「操作」の編集画面で埋めると一覧から消えます。<b>青のラベル</b>（受取できる時間帯・納品の条件・企業独自価格の単価・貸出日）は、移行CSV（A〜D）の同じ拠点IDの行を取り込み直して入れます。
          「配送の設定」はフェーズ1から出せないため、移行のあとに子契約の編集（配送ルート設定）で入れます。
          「仮登録（申込の承認が必要）」は、フェーズ1で仮登録のお客様です。運営の申込の受付（受付中）に載っているので、受付 → 契約設定 → 本登録の順に進めます（それまで子契約・注文・ログインはありません）。
          「休止の期間・再開月」は、フェーズ1の休止中のお客様です（休止の期間・再開月はフェーズ1にないため未定で取り込んでいます）。お客様に確かめて、再開の申請（代理入力）で再開月を入れると消えます。
        </p>
        {!data ? <div className="ph-empty"><span>読み込み中…</span></div>
          : <ListView list={list} filters={FILTERS} cols={cols} rows={rows} rowKey={(r) => r.id} />}
      </div>
    </>
  );
}
