import { regionOf } from './carrierFee';

/*
 * 都道府県と地方（委託配送先の対応エリア・hong 2026-10-06：配送会社の申込フォームと同じく都道府県で選ぶ）。
 * 以前の対応エリア（地方の名前：全国・北海道・東北・関東・中部・関西・中国・四国・九州・沖縄・西日本）は、その地方の都道府県に広げて読む。
 * 委託配送先Web のプロフィールの都道府県の短い名前（東京・神奈川…）も読める。
 */

export const PREFS = [
  '北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県', '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県',
  '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県', '静岡県', '愛知県', '三重県', '滋賀県', '京都府', '大阪府', '兵庫県',
  '奈良県', '和歌山県', '鳥取県', '島根県', '岡山県', '広島県', '山口県', '徳島県', '香川県', '愛媛県', '高知県', '福岡県', '佐賀県', '長崎県',
  '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県',
] as const;

/** 対応エリアを選ぶときの地方のまとまり（申込フォームと同じ並び） */
export const PREF_GROUPS: { name: string; prefs: string[] }[] = [
  { name: '北海道', prefs: ['北海道'] },
  { name: '東北', prefs: ['青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県'] },
  { name: '関東', prefs: ['茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県'] },
  { name: '中部', prefs: ['新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県', '静岡県', '愛知県'] },
  { name: '近畿（関西）', prefs: ['三重県', '滋賀県', '京都府', '大阪府', '兵庫県', '奈良県', '和歌山県'] },
  { name: '中国', prefs: ['鳥取県', '島根県', '岡山県', '広島県', '山口県'] },
  { name: '四国', prefs: ['徳島県', '香川県', '愛媛県', '高知県'] },
  { name: '九州・沖縄', prefs: ['福岡県', '佐賀県', '長崎県', '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県'] },
];

const WEST = ['関西', '中国', '四国', '九州', '沖縄'];
/** 都道府県の短い名前（東京・大阪…）→ 正式な名前 */
const fullPref = (s: string) => PREFS.find((p) => p === s || (p !== '北海道' && p.slice(0, -1) === s)) ?? '';

/** 地方の名前・都道府県の名前（短い名前も）が混ざった対応エリア → 都道府県（PREFS の順・重なりなし）。読めない値は捨てる */
export function expandAreas(xs: readonly string[] | undefined): string[] {
  const set = new Set<string>();
  for (const raw of xs ?? []) {
    const x = raw.trim();
    if (!x) continue;
    if (x === '全国') { PREFS.forEach((p) => set.add(p)); continue; }
    const region = x === '近畿' || x === '近畿（関西）' ? '関西' : x === '九州・沖縄' ? '九州・沖縄' : x;
    const inRegion = PREFS.filter((p) => (region === '西日本' ? WEST.includes(regionOf(p)) : region === '九州・沖縄' ? ['九州', '沖縄'].includes(regionOf(p)) : regionOf(p) === region));
    /* 北海道は地方の名前でも都道府県の名前でも同じ */
    if (inRegion.length && x !== '北海道') { inRegion.forEach((p) => set.add(p)); continue; }
    const f = fullPref(x);
    if (f) set.add(f);
  }
  return PREFS.filter((p) => set.has(p));
}

/** 委託配送先Web のプロフィールの書き方（都道府県の短い名前） */
export const shortPref = (p: string) => (p === '北海道' ? p : p.replace(/[都府県]$/, ''));

/** 曜日（配送不可曜日） */
export const NG_DAYS = ['月', '火', '水', '木', '金', '土', '日', '祝日'] as const;
const WEEK = ['月', '火', '水', '木', '金', '土', '日'];

/** 対応曜日（文字。例「月〜土」「火・木・土」）→ 配送不可曜日（対応しない曜日。祝日は分からないので入れない） */
export function ngDaysOfWeekdays(s: string | undefined): string[] {
  const t = (s ?? '').trim();
  if (!t) return [];
  const m = /^([月火水木金土日])[〜~ー-]([月火水木金土日])$/.exec(t);
  let ok: string[];
  if (m) {
    const a = WEEK.indexOf(m[1]), b = WEEK.indexOf(m[2]);
    ok = a <= b ? WEEK.slice(a, b + 1) : [...WEEK.slice(a), ...WEEK.slice(0, b + 1)];
  } else ok = WEEK.filter((d) => t.includes(d));
  return WEEK.filter((d) => !ok.includes(d));
}
/** 配送不可曜日 → 対応曜日の文字（一覧・配送の画面の表示に使う。例「月〜土」「火・木・土」） */
export function weekdaysOfNg(ng: readonly string[]): string {
  const ok = WEEK.filter((d) => !ng.includes(d));
  if (!ok.length) return '';
  const a = WEEK.indexOf(ok[0]);
  const run = ok.every((d, i) => WEEK.indexOf(d) === a + i);
  return run && ok.length > 2 ? `${ok[0]}〜${ok[ok.length - 1]}` : ok.join('・');
}
