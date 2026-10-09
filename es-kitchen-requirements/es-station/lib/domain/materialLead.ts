import type { ChildContract } from './types';

/** 資材便のリードタイムの既定値（契約に配送区分「資材」がないときだけ。範囲は 0〜7日：配送仕様 配送_05） */
export const DEFAULT_MATERIAL_LEAD_DAYS = 2;

/**
 * 資材便のリードタイム（出荷日→お届け日の日数）。持ち主は**契約の配送区分「資材」**（倉庫マスタは持たない・配送_05・REQ-DL-831）。
 * 拠点の子契約のうち、いちばん新しい月の「資材」の配送区分の leadDays を返す。なければ既定値。
 */
export function materialLeadDays(r: { list<T>(key: string): T[] }, branchId: string): number {
  const cc = r.list<ChildContract>('dm.org.childContracts').filter((c) => c.branchId === branchId).sort((a, b) => b.cycleMonth.localeCompare(a.cycleMonth));
  for (const c of cc) {
    const ch = c.channels.find((x) => x.temp === '資材');
    if (ch) return Math.min(7, Math.max(0, ch.leadDays));
  }
  return DEFAULT_MATERIAL_LEAD_DAYS;
}
