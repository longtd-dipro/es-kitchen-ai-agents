'use client';

import { PoListPage } from '../_components/PoList';

/** 発注・入荷履歴＝発注一覧の「発注データごと」（決定 R6：履歴を発注一覧に統合）。元のデモの s6DataList */
export default function Page() {
  return <PoListPage view="data" />;
}
