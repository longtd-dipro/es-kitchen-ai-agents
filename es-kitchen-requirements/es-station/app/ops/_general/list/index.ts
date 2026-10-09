/*
 * 一覧の共通の仕組み（元の list engine：lst・filterBlock・applyList・pager・table）。ほかの領域の一覧でも使える。
 *
 *   import { ActCell, ListView, useList, type ListCol, type ListFilter } from '@/app/ops/_general/list';
 *   const list = useList('po');                         // 一覧ごとの key。検索条件・ページは画面を移っても残る
 *   const filters: ListFilter[] = [{ t: 'search', ph: '発注番号', span: 2 }, { t: 'select', ph: '状態', col: 'status', opts: ['有効', '無効'] }];
 *   const cols: ListCol<Row>[] = [
 *     { key: 'id', label: 'ID', td: (r) => <td><Link className="lnk mono" href={...}>{r.id}</Link></td> },
 *     { key: 'amt', label: '金額', num: true },
 *     { key: '_act', label: '操作', act: true, td: (r) => <ActCell onEdit={...} onDel={...} /> },
 *   ];
 *   <div className="card"><ListView list={list} filters={filters} cols={cols} rows={rows} /></div>
 *
 * - 削除済み（status＝'削除済'）の行は既定で出さない。行に削除済みがあると「削除済みを表示しない」が出る
 * - 並べ替えは '_' で始まらない列から選ぶ。数の列は数で並ぶ
 * - 合計の行は foot、検索条件の並びに足すボタンは extra、No の列なしは noNo
 * - 表示中の行がほしいとき（CSV など）は list.apply(rows)
 */
export { ActCell, downloadCsv, FilterBlock, ListTable, ListView, MultiCheck, Pager, sameConds, UnappliedMark } from './ListView';
export { applyList, dropList, hideRulesOf, initList, searchKeysOf, showKey, useList, useUnapplied, type HideRule, type ListApi } from './useList';
export type { ListCol, ListFilter, ListState } from './types';
