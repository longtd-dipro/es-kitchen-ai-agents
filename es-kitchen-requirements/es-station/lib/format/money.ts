/*
 * 金額の「表示」の共通ルール（全サイト共通・決定 2026/10/03「円」）。
 *   金額       → 1,000円          （¥ は使わない）
 *   マイナス   → −1,000円         （記号は「−」U+2212）
 *   差額       → +1,000円／−1,000円／0円
 *   税の注記   → 1,000円（税込）／1,000円（税抜）（かっこは全角）
 * 保存しているデータ（整数の円）は変えない。CSV は整数のまま（lib/csv の決まり）。
 * 画面の表のセル・入力欄は右寄せ（既存の td.num／td.r・.inp.num／.es-input--num）。
 */

type Num = number | string | null | undefined;

/** マイナスの記号（全サイト共通） */
export const MINUS = '−';

/** 数にする（「1,000円」「¥1,000」「−500」も読む）。読めなければ NaN */
export function toNum(v: Num): number {
  if (v == null || v === '') return NaN;
  if (typeof v === 'number') return v;
  const s = String(v).trim().replace(/[−－]/g, '-').replace(/[＋]/g, '+').replace(/[¥￥,円\s]/g, '');
  return s === '' ? NaN : Number(s);
}

/** 桁区切りの数（単位なし）。小数は四捨五入。マイナスは「−」 */
export function fmtNum(v: Num): string {
  const n = toNum(v);
  if (!Number.isFinite(n)) return v == null ? '' : String(v);
  const r = Math.round(n);
  return (r < 0 ? MINUS : '') + Math.abs(r).toLocaleString('ja-JP');
}

/** 金額 '1,000円'（マイナスは '−1,000円'）。null・空は ''、数でない文字はそのまま */
export function yen(v: Num): string {
  const n = toNum(v);
  if (!Number.isFinite(n)) return v == null ? '' : String(v);
  return fmtNum(n) + '円';
}

/** 金額。値がない（null・空）ときは '—' */
export function yenOr(v: Num, empty = '—'): string {
  return v == null || v === '' ? empty : yen(v);
}

/** 差額 '+1,000円'／'−1,000円'／'0円' */
export function yenSigned(v: Num): string {
  const n = toNum(v);
  if (!Number.isFinite(n)) return v == null ? '' : String(v);
  return (Math.round(n) > 0 ? '+' : '') + yen(n);
}

/* ---------- 税の注記 ---------- */

/** 税込なら「（税込）」、税抜なら「（税抜）」 */
export const taxNote = (included: boolean) => (included ? '（税込）' : '（税抜）');
export const TAX_IN = '（税込）';
export const TAX_EX = '（税抜）';

/** 金額＋税の注記 '1,000円（税込）' */
export function yenTax(v: Num, included: boolean): string {
  const s = yen(v);
  return s ? s + taxNote(included) : s;
}

/** 税率の表示 '10%'（null は ''） */
export const fmtRate = (rate: number | null | undefined) => (rate == null ? '' : `${rate}%`);

/* ---------- 税込 ⇔ 税抜（表示で両方を並べるとき。保存している金額は変えない） ---------- */

/** 税込 → 税抜（税率%。1円未満は四捨五入。マイナスは絶対値で計算して符号を戻す） */
export function exTax(incl: number, rate: number): number {
  const a = Math.round((Math.abs(incl) * 100) / (100 + rate));
  return incl < 0 ? -a : a;
}
/** 税抜 → 税込（税率%。1円未満は四捨五入。マイナスは絶対値で計算して符号を戻す） */
export function inTax(ex: number, rate: number): number {
  const a = Math.abs(ex) + Math.round((Math.abs(ex) * rate) / 100);
  return ex < 0 ? -a : a;
}
/** 金額の税込・税抜の組（base＝持っている金額が税込か税抜か） */
export function taxPair(v: number, rate: number, base: 'in' | 'ex'): { incl: number; ex: number } {
  return base === 'in' ? { incl: v, ex: exTax(v, rate) } : { incl: inTax(v, rate), ex: v };
}
