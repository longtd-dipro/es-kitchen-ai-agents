'use client';

import { PoDetailShell } from '../../_components/PoDetailShell';

/** 発注詳細（通常商品）：発注単位（サイクル範囲×納入倉庫）ごとに仮発注・本発注する。AW_PURC_003 */
export default function NormalDetailPage({ pid }: { pid: string }) {
  return <PoDetailShell pid={pid} short={false} />;
}
