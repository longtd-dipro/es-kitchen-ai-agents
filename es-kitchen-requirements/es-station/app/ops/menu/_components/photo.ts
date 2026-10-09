import { rnd } from '@/lib/ops/menu/logic';

/* 商品・資材・カテゴリの写真の代わりに描いた絵（カテゴリの色）。法人の月次注文デモと同じ絵 */
const COL: Record<string, string[]> = {
  '肉': ['#7A3B1D', '#B8612F', '#E3A15B'], '魚': ['#B5553A', '#E58A5E', '#F4C39B'], '惣菜': ['#6B5A2A', '#A98E43', '#D9C27A'],
  '主食': ['#8C6A2E', '#F2E6C9', '#D9B45F'], '汁物': ['#8A4F1E', '#C98A45', '#6E8B3D'], 'サラダ・果物': ['#5E8C31', '#9CC45A', '#E8723A'],
  '飲料・甘味': ['#7A5230', '#C9A57A', '#E9D8BE'], '資材': ['#9AA3AE', '#D5DAE0', '#6B7580'],
};
const cache = new Map<string, string>();
/** カテゴリ cat・種 seed の絵（data URL） */
export function photo(cat: string, seed: number) {
  const key = cat + ':' + seed;
  const hit = cache.get(key); if (hit) return hit;
  const c = COL[cat] || COL['惣菜'];
  let s = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 160">';
  s += '<rect width="240" height="160" fill="#6F6258"/><rect width="240" height="160" fill="url(#g)" opacity=".35"/>';
  s += '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#000"/></linearGradient></defs>';
  s += '<ellipse cx="120" cy="84" rx="92" ry="66" fill="#FFFFFF"/><ellipse cx="120" cy="84" rx="74" ry="52" fill="#F4F1EC"/>';
  if (cat === '資材') {
    s += '<rect x="80" y="50" width="80" height="64" rx="6" fill="' + c[1] + '" stroke="' + c[2] + '" stroke-width="3"/><path d="M80 66h80" stroke="' + c[2] + '" stroke-width="3"/>';
  } else {
    for (let i = 0; i < 7; i++) {
      const a = rnd(seed + i) * 6.28, r = 10 + rnd(seed * 3 + i) * 30;
      const x = 120 + Math.cos(a) * r * 1.3, y = 84 + Math.sin(a) * r * 0.8, w = 16 + rnd(seed * 7 + i) * 18, hh = 10 + rnd(seed * 11 + i) * 14;
      s += '<ellipse cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" rx="' + w.toFixed(1) + '" ry="' + hh.toFixed(1) + '" fill="' + c[i % 3] + '" transform="rotate(' + Math.round(rnd(seed + i * 5) * 90) + ' ' + x.toFixed(1) + ' ' + y.toFixed(1) + ')"/>';
    }
    s += '<path d="M66 60c20 8 30 2 40-6" stroke="#6E9A3A" stroke-width="4" fill="none" stroke-linecap="round"/>';
  }
  s += '</svg>';
  const url = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(s);
  cache.set(key, url);
  return url;
}
/** カテゴリの画像（'photo:<カテゴリ>:<種>' は見本の絵、それ以外は data URL のまま） */
export function catImg(img: string) {
  const m = /^photo:(.+):(\d+)$/.exec(img);
  return m ? photo(m[1], Number(m[2])) : img;
}
