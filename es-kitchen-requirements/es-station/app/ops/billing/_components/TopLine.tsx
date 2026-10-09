'use client';

import { DEMO } from '@/lib/demo';
import { addM } from '@/lib/ops/billing/logic';
import { Tag } from './ds';
import { useBilling } from './useBilling';

/** 締め月と締めの決まり（元の請求デモの上の帯） */
export default function TopLine() {
  const { L, error } = useBilling();
  if (error) return <div className="bl-meta">読み込めませんでした：{String(error)}</div>;
  if (!L) return null;
  const m = L.month, iss = addM(m, 1) + '-01';
  return (
    <div className="bl-meta" style={{ marginTop: 0 }}>
      <span>締め月 <b>{m}</b>　<span className="small">（20日締め・25日確定・<b>翌月1日発行</b> {iss}）{DEMO && <>／デモの今日 2026-10-05：実績精算 2026-09-21〜10-20 は締め前（10/25 確定予定）。発行済みは 10/01 発行分まで</>}</span></span>
      {DEMO && <Tag c="ok">決定：確定日＝毎月25日（2026-09-25）</Tag>}
    </div>
  );
}
