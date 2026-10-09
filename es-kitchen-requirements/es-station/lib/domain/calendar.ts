import { addDays, parseDate } from '@/lib/supplier/dates';
import type { Cycle, Holiday } from './types';

/*
 * サイクル暦（統合仕様書 v2.3 §2・共通サンプルデータ 2026/10/02）。
 * 1サイクル＝月曜始まりの4週（A1〜D7・28枠）。サイクル月＝B7 が属する月。
 * 枠の 1（月曜）はお届けしない。ピッキングしない枠（既定）：A6・A7・B4〜B7・C6・C7・D4〜D7。
 */

/** 見本データの「今日」（共通サンプルデータ：2026年9月サイクル D1） */
export const DEMO_TODAY = '2026/10/05';

export const WEEKS = ['A', 'B', 'C', 'D'] as const;
export const NO_PICKING_SLOTS = ['A6', 'A7', 'B4', 'B5', 'B6', 'B7', 'C6', 'C7', 'D4', 'D5', 'D6', 'D7'];

/** 枠（A3 など）の日付 */
export function slotDate(c: Cycle, slot: string) {
  const w = WEEKS.indexOf(slot[0] as (typeof WEEKS)[number]);
  return addDays(c.a1, w * 7 + Number(slot.slice(1)) - 1);
}

/** 日付がどのサイクルの何の枠か（範囲外は null） */
export function slotOf(cycles: Cycle[], date: string) {
  for (const c of cycles) {
    const n = Math.round((parseDate(date).getTime() - parseDate(c.a1).getTime()) / 86400000);
    if (n >= 0 && n < 28) return { cycle: c, slot: WEEKS[Math.floor(n / 7)] + ((n % 7) + 1) };
  }
  return null;
}

/** その枠が出荷不可か。倉庫ごとの出荷不可枠（Cycle.ngSlots）があればそれ、なければ既定。倉庫を渡さないときは全倉庫が不可の枠だけ */
export function slotNoPick(c: Cycle, slot: string, warehouseId?: string) {
  const m = c.ngSlots;
  if (!m || !Object.keys(m).length) return NO_PICKING_SLOTS.includes(slot);
  if (warehouseId) return (m[warehouseId] ?? NO_PICKING_SLOTS).includes(slot);
  return Object.values(m).every((l) => l.includes(slot));
}

/** その日に出荷（ピッキング）できるか。warehouseId を渡すと、その倉庫だけの出荷禁止日も見る（課題 4-10。渡さないときは全倉庫の日だけ） */
export function canPick(cycles: Cycle[], holidays: Holiday[], date: string, warehouseId?: string) {
  const s = slotOf(cycles, date);
  return !!s && !slotNoPick(s.cycle, s.slot, warehouseId) && !holidays.some((h) => h.date === date && h.noPicking && (!h.warehouseIds?.length || (!!warehouseId && h.warehouseIds.includes(warehouseId))));
}

/** その日にお届けできるか（枠の 1 と祝日はお届けしない） */
export function canDeliver(cycles: Cycle[], holidays: Holiday[], date: string) {
  const s = slotOf(cycles, date);
  return !!s && !s.slot.endsWith('1') && !holidays.some((h) => h.date === date && h.noDelivery);
}

/** 前半（A・B）か後半（C・D）か */
const half = (slot: string) => (slot[0] <= 'B' ? 1 : 2);

/**
 * お届け日と出荷日を決める。お届けできない日・出荷できない日なら、同じサイクルの同じ半分（A・B／C・D）の中で
 * 前の日へずらす（休日の扱い＝前倒す・既定）。なければ同じ半分の後ろの日、それもなければ null（その回は作らない）。
 */
export function schedule(cycles: Cycle[], holidays: Holiday[], wish: string, leadDays: number) {
  const home = slotOf(cycles, wish);
  if (!home) return null;
  const ok = (d: string) => {
    const s = slotOf(cycles, d);
    return !!s && s.cycle.id === home.cycle.id && half(s.slot) === half(home.slot)
      && canDeliver(cycles, holidays, d) && canPick(cycles, holidays, addDays(d, -leadDays));
  };
  for (const step of [-1, 1]) {
    for (let i = 0; i < 14; i++) {
      const d = addDays(wish, step * i);
      if (ok(d)) return { deliverOn: d, shipOn: addDays(d, -leadDays), shifted: i > 0 };
    }
  }
  return null;
}
