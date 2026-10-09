'use client';

import type { BillingLogic } from '@/lib/ops/billing/logic';
import type { Br } from '@/lib/ops/billing/types';
import { Tag } from './ds';

/*
 * 在庫の差分率・廃棄率（課題 2-1）。差分率＝(理論 − 申告) ÷ 理論、廃棄率＝廃棄 ÷ (前回の申告 ＋ 納品)。
 * 10%（いまは固定）以上は色を付ける。棚卸なしの拠点は差分率の代わりに「棚卸なし」
 */
export const pct = (v: number) => `${(v * 100).toFixed(1)}%`;

/** 表のセル（差分率・廃棄率の2つ） */
export function RateTds({ L, b }: { L: BillingLogic; b: Br }) {
  const x = L.rates(b);
  return (
    <>
      <td className={`r es-num${x.diffAlert ? ' hot' : ''}`}>{x.noCheck ? <Tag>棚卸なし</Tag> : x.diff === null ? <span className="dim">棚卸前</span> : pct(x.diff)}</td>
      <td className={`r es-num${x.wasteAlert ? ' hot' : ''}`}>{pct(x.waste)}</td>
    </>
  );
}

/** 詳細の上のタグ（差分率・廃棄率・アラート） */
export function RateTags({ L, b }: { L: BillingLogic; b: Br }) {
  const x = L.rates(b);
  return (
    <>
      {x.noCheck ? <Tag>棚卸なし</Tag> : x.diff !== null && <Tag c={x.diffAlert ? 'no' : 'mut'}>差分率 {pct(x.diff)}</Tag>}
      <Tag c={x.wasteAlert ? 'no' : 'mut'}>廃棄率 {pct(x.waste)}</Tag>
      {x.alert && <Tag c="no">要確認（10%以上）</Tag>}
    </>
  );
}

/** 行（商品）のスタイル：差分率・廃棄率が 10% 以上なら色を付ける */
export const rowHot = (L: BillingLogic, b: Br, r: Br['rows'][number]) => (L.rowRates(b, r).alert ? { background: 'var(--negative-50)' } : undefined);
