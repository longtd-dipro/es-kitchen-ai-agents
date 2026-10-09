'use client';

import { PoDetailShell } from '../../_components/PoDetailShell';

/** 発注詳細（短消費期限商品）：行（倉庫×顧客納品日）ごとに仮発注・本発注する。AW_PURC_004 */
export default function ShortDetailPage({ pid }: { pid: string }) {
  return <PoDetailShell pid={pid} short />;
}
