/*
 * px → rem（ルートは 14px＝1rem。app/globals.css の html{font-size:87.5%}）。
 * 幅・高さを rem にすると、ブラウザの「フォントサイズ」設定に合わせて文字と一緒に大きくなる。
 * 数字は px とみなす（React の style と同じ）。'120px'・'min(720px,100%)' の px も変える。1px・2px（罫線）はそのまま。
 */
const r = (n: number) => `${+(n / 14).toFixed(6)}rem`;

export function rem(v: number | string): string;
export function rem(v: number | string | undefined): string | undefined;
export function rem(v: number | string | undefined): string | undefined {
  if (v === undefined) return undefined;
  if (typeof v === 'number') return Math.abs(v) < 3 ? `${v}px` : r(v);
  return v.replace(/(^|[^\w.#-])(-?\d*\.?\d+)px\b/g, (m, pre: string, n: string) => (Math.abs(+n) < 3 ? m : pre + r(+n)));
}
