'use client';

import { useRouter } from 'next/navigation';
import { DEMO } from '@/lib/demo';
import { useDomainQuery } from '@/lib/domain/client';
import { SURVEY_STATUSES } from '@/lib/domain/survey';
import { fmtDateTime } from '@/lib/format/date';
import { ActCell, ListView, useList, type ListCol, type ListFilter } from '../_general/list';
import { ListCsv } from '../_ui/csv';
import { DEL_MSG, demoMsg, useAskDelete } from '../_general/parts';
import { Icon } from '../_ui/Icon';
import { useOps } from '../_ui/OpsProvider';
import { useCanAct, useScreenCan } from '../_ui/perm';
import { PageHead } from '../_ui/ui';
import { LIST, ME, StBadge, svApi } from './_components/parts';
import { TemplatePick } from './_components/Templates';

/**
 * アンケート管理 ＞ アンケート一覧（Phase 1 画面 22）。データは共通データ（survey.list）。
 * 終了・削除済は鉛筆・ごみ箱を出さない。削除は「削除済」として残る（検索の「削除済みを表示しない」）
 */
type Row = { id: string; name: string; qCount: string; startAt: string; endAt: string; targetCount: number; answered: number; progress: string; status: string; startYm: string; endYm: string };

const FILTERS: ListFilter[] = [
  { t: 'search', ph: 'アンケートID、アンケート名', span: 2, keys: ['id', 'name'] },
  { t: 'select', ph: 'ステータス', col: 'status', opts: SURVEY_STATUSES },
  { t: 'month', ph: '開始月', col: 'startYm' },
  { t: 'month', ph: '終了月', col: 'endYm' },
];

export default function Page() {
  const router = useRouter();
  const { toast, toastError, openModal, account } = useOps();
  const askDelete = useAskDelete();
  const canAct = useCanAct();
  const screenCan = useScreenCan();
  const list = useList('surveys');
  const { data } = useDomainQuery(svApi, 'list');
  const rows = (data ?? []) as Row[];

  const del = (r: Row) => askDelete(async () => {
    try { await svApi.action('remove', { id: r.id, by: account?.name ?? ME }); toast(DEL_MSG); } catch (e) { toastError(e); }
  }, <>アンケート「{r.name}」を削除してもよろしいですか？<br />回答の受付をやめ、アプリに出なくなります（データと回答は「削除済」として残ります）。</>);

  const cols: ListCol<Row>[] = [
    { key: 'id', label: 'アンケートID', td: (r) => <td><button className="lnk u mono" onClick={() => router.push(`${LIST}/${r.id}`)}>{r.id}</button></td> },
    { key: 'name', label: 'アンケート名', td: (r) => <td><div className="clip" title={r.name}>{r.name}</div></td> },
    { key: 'qCount', label: '設問数', num: true },
    { key: 'startAt', label: '開始期間', td: (r) => <td style={{ whiteSpace: 'pre-line' }}>{fmtDateTime(r.startAt).replace(' ', '\n')}</td> },
    { key: 'endAt', label: '終了期間', td: (r) => <td style={{ whiteSpace: 'pre-line' }}>{fmtDateTime(r.endAt).replace(' ', '\n')}</td> },
    { key: 'targetCount', label: '対象者数', num: true },
    { key: 'progress', label: '回答進捗', td: (r) => <td style={{ whiteSpace: 'pre-line' }}>{r.progress.replace(' ', '\n')}</td> },
    { key: 'status', label: 'ステータス', td: (r) => <td><StBadge v={r.status} /></td> },
    {
      key: '_act', label: '操作', act: true,
      td: (r) => (['終了', '削除済'].includes(r.status) ? <td className="act" /> : <ActCell onEdit={screenCan('update') ? () => router.push(`${LIST}/${r.id}/edit`) : undefined} onDel={canAct(svApi, 'remove') ? () => del(r) : undefined} />),
    },
  ];

  return (
    <>
      <PageHead crumbs={['アンケート管理']} title="アンケート管理">
        {screenCan('csvImport') && <button className="btn csv lg" onClick={() => router.push(`${LIST}/import`)}><Icon name="upl" />CSV取込</button>}
        {screenCan('create') && <button className="btn out lg" onClick={() => openModal(<TemplatePick onPick={(t) => router.push(`${LIST}/new?tpl=${t.id}`)} />)}>テンプレートから作成</button>}
        {/* CSV出力：検索条件のとおりの全件・1行＝アンケートの1設問（アンケートの項目をくり返す。dm.survey.surveys） */}
        <ListCsv screen="アンケート一覧" list={list} filters={FILTERS} rows={rows} cols={[...cols.filter((c) => c.key !== 'progress'), { key: 'answered', label: '回答数' }]}
          source={{ kind: 'dm.survey.surveys', id: (r) => r.id, childKey: 'questions' }} />
        {screenCan('create') && <button className="btn pri lg" onClick={() => router.push(`${LIST}/new`)}><Icon name="plus" />新規登録</button>}
      </PageHead>
      <div className="card">
        {!data ? <div className="ph-empty"><span>読み込み中…</span></div> : <ListView list={list} filters={FILTERS} cols={cols} rows={rows} rowKey={(r) => r.id} />}
      </div>
    </>
  );
}
