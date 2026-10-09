/*
 * 資材の写真（資材マスタ Material.photo）→ 画面の絵。'photo:資材:<種>' は見本の絵の種（画面が photo('資材', 種) で描く）、
 * data URL はアップロードした写真（src）、空は種を番号から決めた見本の絵
 */
export function matImg(photo: string, fallback: number): { img: number; src?: string } {
  const m = /^photo:[^:]+:(\d+)$/.exec(photo);
  if (m) return { img: Number(m[1]) };
  return photo ? { img: fallback, src: photo } : { img: fallback };
}
