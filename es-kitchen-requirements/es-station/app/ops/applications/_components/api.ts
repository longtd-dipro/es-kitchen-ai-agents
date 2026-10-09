'use client';

import { areaApi } from '@/lib/ops/core/client';
import applications from '@/lib/ops/areas/applications';
import type { ApTab, ListFilter } from '@/lib/ops/applications/types';

/** 契約申請管理の領域を呼ぶ口 */
export const api = areaApi(applications);

/*
 * 一覧の検索条件（元の S.f）。申請詳細から戻ったときも残すため、画面の外（このタブのメモリ）に持つ。
 * 申請詳細の「契約申請管理」へ戻るときは、その申請のタブにする（元の APX.back）
 */
let filter: ListFilter = { tab: 'new', q: '', sort: 'id' };
export const getFilter = () => filter;
export const setFilter = (f: ListFilter) => { filter = f; };
/** タブを変える（検索語は残し、ほかの条件は外す。並びは新規＝申請ID・ほか＝申請日） */
export const tabFilter = (t: ApTab, q = filter.q): ListFilter => ({ tab: t, q, sort: t === 'new' ? 'id' : 'date' });
export const backTo = (t: ApTab) => { filter = { ...filter, tab: t }; };
