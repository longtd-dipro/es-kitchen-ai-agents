'use client';

import { useState } from 'react';

/** 表示件数の選択肢（全リスト共通：10／20／50／100・既定10。台帳 2026-10-08） */
export const PER_OPTIONS = [10, 20, 50, 100];

/** ページの状態（ページ番号と表示件数）。行が決まる前（早期 return の前）に置けるよう、行を切る pageOf と分けてある */
export function usePager(per0 = 10) {
  const [per, setPerState] = useState(PER_OPTIONS.includes(per0) ? per0 : 10);
  const [page, setPage] = useState(1);
  return { per, page, setPage, setPer: (n: number) => { setPerState(n); setPage(1); } };
}
export type Pager = ReturnType<typeof usePager>;

/**
 * いまのページの行と、ページ送りの部品に渡す値（props）。条件が変わって行が減ったときは最後のページまで戻す。
 *   const pager = usePager();   …（rows が決まったあと）…   const pg = pageOf(pager, rows);
 *   pg.rows.map(...)   <Pagination {...pg.props} />      start＝このページの最初の行の番号（0 から）
 */
export function pageOf<T>(p: Pager, rows: T[]) {
  const pages = Math.max(1, Math.ceil(rows.length / p.per));
  const cur = Math.min(p.page, pages);
  const start = (cur - 1) * p.per;
  return { rows: rows.slice(start, start + p.per), start, props: { total: rows.length, per: p.per, page: cur, onPage: p.setPage, onPer: p.setPer } };
}

/** usePager ＋ pageOf（rows が最初から決まっているとき） */
export function usePaging<T>(rows: T[], per0 = 10) {
  return pageOf(usePager(per0), rows);
}

/** ページ送りの部品に渡す値（pageOf・usePaging の props） */
export type PagerProps = ReturnType<typeof pageOf>['props'];
