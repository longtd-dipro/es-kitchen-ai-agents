import type { Invoice, InvoiceLine, TaxBucket } from './types';

/*
 * 請求書の税率ごとの欄（2026-10-05：税率マスタのどの率でも請求できる。前は 8%・10% の2つだけ）。
 *   繰越（再請求）の行は税をかけない（kind＝繰越）。ほかの行は税率ごとに小計を出し、消費税は税率ごとに四捨五入（インボイスの決まり）。
 *   subtotal10・subtotal8・tax10・tax8 は前からある画面・CSV のための写し（ほかの率は byRate だけ）
 */

/** 消費税＝|税抜| × 税率% を四捨五入（整数で計算して小数の誤差を出さない。負の額は符号を戻す。運営の請求の画面 taxRound と同じ） */
export function taxOfRate(amt: number, pct: number) {
  const n = Math.abs(amt) * pct, q = Math.floor(n / 100), v = q + ((n - q * 100) >= 50 ? 1 : 0);
  return amt < 0 ? -v : v;
}

/** 請求書の行から、税率ごとの欄（大きい率から・0円の欄は出さない）・繰越・合計を作る */
export function invoiceTotals(lines: Pick<InvoiceLine, 'amountYen' | 'taxRate' | 'kind'>[]) {
  const sub = new Map<number, number>();
  let carried = 0;
  for (const l of lines) {
    if (l.kind === '繰越') { carried += l.amountYen; continue; }
    sub.set(l.taxRate, (sub.get(l.taxRate) ?? 0) + l.amountYen);
  }
  const byRate: TaxBucket[] = [...sub.entries()].filter(([, v]) => v !== 0).sort((a, b) => b[0] - a[0])
    .map(([rate, subtotal]) => ({ rate, subtotal, tax: taxOfRate(subtotal, rate) }));
  const pick = (rate: number) => byRate.find((b) => b.rate === rate);
  const total = byRate.reduce((a, b) => a + b.subtotal + b.tax, 0) + carried;
  return {
    byRate, carried, total,
    subtotal10: pick(10)?.subtotal ?? 0, subtotal8: pick(8)?.subtotal ?? 0, tax10: pick(10)?.tax ?? 0, tax8: pick(8)?.tax ?? 0,
  };
}

/** 請求書の税率ごとの欄（古い DB の請求書は 10%・8% の欄から作る） */
export function taxBuckets(i: Pick<Invoice, 'subtotal10' | 'subtotal8' | 'tax10' | 'tax8'> & { byRate?: TaxBucket[] }): TaxBucket[] {
  if (i.byRate) return i.byRate;
  return [{ rate: 10, subtotal: i.subtotal10, tax: i.tax10 }, { rate: 8, subtotal: i.subtotal8, tax: i.tax8 }].filter((b) => b.subtotal !== 0 || b.tax !== 0);
}
/** 消費税の合計 */
export const taxTotal = (i: Parameters<typeof taxBuckets>[0]) => taxBuckets(i).reduce((a, b) => a + b.tax, 0);
/** 税抜の合計（繰越を除く） */
export const netTotal = (i: Parameters<typeof taxBuckets>[0]) => taxBuckets(i).reduce((a, b) => a + b.subtotal, 0);

/**
 * 請求書の表示：同じ group の行（福利厚生の適用 OFF のプラン料金の2行）を1行にまとめる（28-150・台帳 E 2026-10-05）。
 * 金額は足し、税率は並べる。まとめるのは表示だけ（税率ごとの欄 byRate は行のまま）。最初の行の位置に置く
 */
export function mergeByGroup<T>(rows: T[], groupOf: (x: T) => string | undefined, merge: (xs: T[]) => T): T[] {
  const out: T[] = [];
  const done = new Set<string>();
  for (const x of rows) {
    const g = groupOf(x);
    if (!g) { out.push(x); continue; }
    if (done.has(g)) continue;
    done.add(g);
    const xs = rows.filter((y) => groupOf(y) === g);
    out.push(xs.length > 1 ? merge(xs) : x);
  }
  return out;
}
/** まとめた行の名前：「50プラン（ESライト（冷蔵庫）） 基本料金（10月分）」→「50プラン（ESライト（冷蔵庫）） プラン料金（10月分）」 */
export const planLineName = (name: string) => name.replace(/ 基本料金/, ' プラン料金').replace(/ 福利厚生（企業負担分）/, ' プラン料金');
