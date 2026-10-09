import { alloc, split, rnd } from '@/lib/ops/menu/logic';
import type { CDl, CSite, ProdX, Qty } from './types';
import { fmtDate, fmtYm } from '@/lib/format/date';

export { split };

/*
 * 法人Web 月次注文の計算（部品/23_法人_月次注文.html と同じ）。画面と actions の両方で使う。
 * 商品の一覧 P は query view の products（その月のメニュー）。
 */

export const TEMP_L: Record<string, string> = { chilled: '冷蔵', ambient: '常温', frozen: '冷凍' };
export const TAG_TONE: Record<string, string> = { 'NEW': 'info', '再登場': 'success', '定番': 'success' };
/** 注文の状態のお客様向けの言い方（データの値は変えない。ES登録済→ESキッチン入力済み、デフォルト→自動注文） */
export const stLabel = (st: string) => ({ 'ES登録済': 'ESキッチン入力済', 'デフォルト': '自動注文' } as Record<string, string>)[st] ?? st;
export const ST_TONE: Record<string, string> = { '登録済': 'info', 'ES登録済': 'warning', 'デフォルト': 'success', '未注文': 'neutral', '休止中': 'neutral', '受付前': 'neutral' };
/** 資材の配送状態（法人向けの表示名）の色 */
export const MAT_TONE: Record<string, string> = { 'お届け済': 'success', '納品済': 'success', '出荷待': 'info', '出荷指示済': 'info', '出荷済': 'info', '配送日調整中': 'warning', '再配送予定': 'warning', 'お届け中止': 'neutral', '取消': 'neutral' };
/** 自販機の枠 */
export const FRAMES = [
  { k: 'W', label: 'ダブルの棚', sub: 'ダブル（8/10列）', cap: 98 },
  { k: 'S', label: 'シングルの棚', sub: 'シングル（8/10列）', cap: 60 },
  { k: 'B', label: 'ベルトの棚', sub: 'ベルト', cap: 40 },
  { k: 'X', label: '自販機に入らない商品', sub: '注文するかはお客様のご判断（自販機に入りません）', cap: 0 },
] as const;
export const SURVEY_RULE = '食べたい 2点・気になる 1点（1人 15品まで）';

export const isStd = (s: CSite) => s.course === 'ESスタンダード';
export const isVm = (s: CSite) => s.course === 'ESライト（自販機）';
export const capTxt = (c: [number, number]) => c[0] + '〜' + c[1] + '個';
export { yen } from '@/lib/format/money';
/** '2026-11' → 表示の '2026-11'（共通の表示ルール・決定 8-1） */
export const ym = (c: string) => fmtYm(c);
export const prevMonth = (c: string) => { const a = c.split('-').map(Number); a[1]--; if (!a[1]) { a[1] = 12; a[0]--; } return a[0] + '-' + (a[1] < 10 ? '0' : '') + a[1]; };
/** '2026/9/1' → 表示の '2026-09-01'（共通の表示ルール・決定 8-1） */
export const fmtD = (s: string) => fmtDate(s);
/** その月のオーダー期間の始め（前の月の1日）・終わり（前の月の15日） */
const ymSlash = (c: string) => { const a = c.split('-'); return a[0] + '/' + parseInt(a[1], 10); };
export const orderFrom = (m: string) => ymSlash(prevMonth(m)) + '/01';
export const orderTo = (m: string) => ymSlash(prevMonth(m)) + '/15';
/** メニューID（202611-5567 …） */
export const menuId = (m: string) => { const a = m.split('-').map(Number), i = (2026 - a[0]) * 12 + (11 - a[1]); return m.replace('-', '') + '-' + (5567 - i); };
export const clone = <T,>(o: T): T => JSON.parse(JSON.stringify(o));
export const sameQ = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);
/** 法人アカウント／拠点アカウント（変更履歴の「変更した人」） */
export const whoOf = (role: string) => (role === 'branch' ? '拠点アカウント' : '法人アカウント');

/* ---------------- 商品・便 ---------------- */
/** その拠点で選べる商品（共通データの選べる商品 s.ok。冷凍はスタンダードだけ） */
/** withGone＝メニューから外れた商品（注文に残っているもの）も含める（商品注文の一覧だけ。AI の提案・既定の数には入れない：受付簿 #266①） */
export const prods = (s: CSite, P: ProdX[], withGone = false) => P.filter((p) => (withGone || !p.gone) && (isStd(s) || p.st !== 'frozen') && (!s.ok || s.ok.includes(p.id)));
export const dlsOf = (s: CSite, p: { st: string }) => s.dl.filter((d) => (p.st === 'frozen' ? d.t === 'frozen' : d.t !== 'frozen'));
export const coldDl = (s: CSite) => s.dl.filter((d) => d.t !== 'frozen');
export const frozDl = (s: CSite) => s.dl.filter((d) => d.t === 'frozen');

/** 数量を作る：frozenTotal を冷凍の便へ、残りを冷蔵・常温の便へ。weightOf(p) の重みで商品に配る */
export function build(s: CSite, P: ProdX[], frozenTotal: number, weightOf: (p: ProdX, d: CDl) => number, list?: ProdX[]): Qty {
  const q: Qty = {}, ps = list || prods(s, P);
  ps.forEach((p) => { q[p.id] = {}; dlsOf(s, p).forEach((d) => { q[p.id][d.k] = 0; }); });
  const fz = ps.filter((p) => p.st === 'frozen'), cd = ps.filter((p) => p.st !== 'frozen');
  const fdl = frozDl(s), cdl = coldDl(s);
  if (!fz.length) frozenTotal = 0;
  /* 代替品設定の対象（不良商品）の便には入れない */
  const w = (p: ProdX, d: CDl) => (s.blocked?.[p.id]?.includes(d.k) ? 0 : weightOf(p, d));
  split(frozenTotal, fdl.length || 1).forEach((t, i) => { if (!fdl[i]) return; alloc(t, fz.map((p) => w(p, fdl[i]))).forEach((n, j) => { q[fz[j].id][fdl[i].k] = n; }); });
  split(s.plan - frozenTotal, cdl.length || 1).forEach((t, i) => { if (!cdl[i]) return; alloc(t, cd.map((p) => w(p, cdl[i]))).forEach((n, j) => { q[cd[j].id][cdl[i].k] = n; }); });
  return q;
}

export type Sum = { total: number; frozen: number; cold: number; byDl: Record<string, number>; items: number };
export function sumBy(s: CSite, P: ProdX[], q: Qty): Sum {
  const t: Sum = { total: 0, frozen: 0, cold: 0, byDl: {}, items: 0 };
  const PM = new Map(P.map((p) => [p.id, p]));
  s.dl.forEach((d) => { t.byDl[d.k] = 0; });
  Object.keys(q).forEach((pid) => {
    const p = PM.get(pid); let any = 0;
    Object.keys(q[pid]).forEach((k) => { const n = q[pid][k] || 0; t.byDl[k] = (t.byDl[k] || 0) + n; t.total += n; if (p?.st === 'frozen') t.frozen += n; else t.cold += n; any += n; });
    if (any) t.items++;
  });
  return t;
}
export type Check = { label: string; state: 'ok' | 'ng'; reason?: string };
/**
 * 登録できる条件（台帳 E 2026-10-05・CW_ORDER No.3.8）：①合計＝月のお届け数（E310） ②温度帯ごとに 下限〜上限（E12）
 * ③便ごとの数の差 ±1 以内（温度帯ごとに判定・E311）。画面（登録ボタン・AI のプレビュー）と actions で同じものを使う
 */
export function checks(s: CSite, P: ProdX[], q: Qty): Check[] {
  const t = sumBy(s, P, q), out: Check[] = [];
  const dif = t.total - s.plan;
  out.push({
    label: '合計が月のお届け数（' + s.plan + '個）と同じ', state: dif === 0 ? 'ok' : 'ng',
    reason: '今 ' + t.total + '個' + (dif === 0 ? '' : dif > 0 ? '（' + dif + '個多い）。合計が月のお届け数（' + s.plan + '個）と同じになるようにご入力ください。' : '（' + -dif + '個足りない）。合計が月のお届け数（' + s.plan + '個）と同じになるようにご入力ください。'),
  });
  ([['chilled', '冷蔵・常温', t.cold]] as [string, string, number][]).concat(isStd(s) ? [['frozen', '冷凍', t.frozen]] : []).forEach((x) => {
    const c = s.cap[x[0] as 'chilled' | 'frozen']!, ok = x[2] >= c[0] && x[2] <= c[1];
    out.push({ label: x[1] + 'は ' + capTxt(c) + '（ご契約の月のお届け数）', state: ok ? 'ok' : 'ng', reason: x[1] + ' ' + x[2] + '個' + (ok ? '' : (x[2] > c[1] ? '（' + (x[2] - c[1]) + '個多い）' : '（' + (c[0] - x[2]) + '個足りない）') + '。' + x[1] + 'は' + c[0] + '〜' + c[1] + 'の範囲でご入力ください。') });
  });
  /* 便ごとの差（温度帯ごと）。便が1つの温度帯は見ない */
  const groups: [string, CDl[]][] = [['冷蔵・常温', coldDl(s)]].concat(isStd(s) ? [['冷凍', frozDl(s)]] : []) as [string, CDl[]][];
  const bad: string[] = [], txt: string[] = [];
  groups.forEach(([name, g]) => {
    if (g.length < 2) return;
    const v = g.map((d) => t.byDl[d.k] || 0);
    txt.push(g.map((d) => d.l + ' ' + (t.byDl[d.k] || 0)).join('・'));
    if (Math.max(...v) - Math.min(...v) > 1) bad.push(name);
  });
  if (groups.some(([, g]) => g.length >= 2)) {
    out.push({ label: '便ごとの数の差が1個以内（温度帯ごと）', state: bad.length ? 'ng' : 'ok', reason: txt.join('／') + (bad.length ? '。便ごとの数の差が1個以内になるようにご入力ください。' : '') });
  }
  return out;
}
/** 便ごとの目安 */
export function target(s: CSite, t: Sum, d: CDl) {
  const g = d.t === 'frozen' ? frozDl(s) : coldDl(s), tot = d.t === 'frozen' ? t.frozen : s.plan - t.frozen, a = split(tot, g.length);
  return a[g.indexOf(g.filter((x) => x.k === d.k)[0])];
}

/* ---------------- 見本の数 ---------------- */
const MONTHS_ALL = ['2026-11', '2026-10', '2026-09', '2026-08', '2026-07', '2026-06', '2026-05', '2026-04'];
/** 過去の月の注文（注文履歴・納品書）。共通データの注文があればその数、なければ見本の数 */
export function pastQty(s: CSite, P: ProdX[], m: string): Qty {
  if (s.pastQ?.[m]) return s.pastQ[m];
  const i = MONTHS_ALL.indexOf(m);
  return build(s, P, isStd(s) ? s.cap.frozen![1] : 0, (p) => 1 + rnd(i * 31 + parseInt(p.id.slice(1), 10)) * (p.past + 1));
}

/* ---------------- AI の提案 ---------------- */
export type AiCond = { byCat: boolean; cats: string[]; short: boolean; init: string; money: 'none' | 'max' | 'range'; min: string; max: string };
export type AiState = {
  mode: 'even' | 'past' | 'chat'; cond: AiCond; prev: Qty | null; showPrev: boolean;
  msgs: { me: boolean; t: string; at: string }[]; input: string;
  boost?: Record<string, number>; noFrozen?: boolean; next?: boolean;
  /** 条件に合う提案が作れなかった（W204。「確定」は押せない） */
  fail?: boolean;
};
/**
 * AI の提案。登録の条件（checks：合計＝プラン数・温度帯の範囲・便の差±1）を必ず満たす数だけを返す（台帳 E 180：AI の提案も同じ条件で作る）。
 * 条件に合う提案が作れないとき（絞り込みで冷蔵・冷凍の商品がなくなる等）は null（画面は W204 を出し、「確定」を押せなくする）
 */
export function aiSuggest(s: CSite, P: ProdX[], ai: AiState): Qty | null {
  const c = ai.cond;
  let list = prods(s, P).filter((p) => {
    if (c.byCat && c.cats.indexOf(p.cat) < 0) return false;
    if (!c.short && p.exp) return false;
    if (c.money !== 'none' && c.max && p.price > Number(c.max)) return false;
    if (c.money === 'range' && c.min && p.price < Number(c.min)) return false;
    return true;
  });
  const w = ai.mode === 'even' ? () => 1 : (p: ProdX) => {
    const base = (p.past || 2) * (1 - p.waste);
    const f = ai.boost && ai.boost[p.cat] != null ? ai.boost[p.cat] : 1;
    return base * f;
  };
  if (ai.boost) list = list.filter((p) => ai.boost![p.cat] !== 0);
  /* 冷凍の数：冷凍の範囲と、冷蔵・常温の範囲（残り＝プラン数 − 冷凍）の両方に入る数だけ。通常は上限、「冷凍なし」は下限。冷凍の商品がなければ 0 */
  let lo = 0, hi = 0;
  if (isStd(s)) {
    lo = Math.max(s.cap.frozen![0], s.plan - s.cap.chilled[1]); hi = Math.min(s.cap.frozen![1], s.plan - s.cap.chilled[0]);
    if (!list.some((p) => p.st === 'frozen')) hi = Math.min(hi, 0);
  }
  if (lo > hi) return null;
  const fz = ai.noFrozen ? lo : hi;
  const q = build(s, P, fz, w, list), full: Qty = {};
  prods(s, P).forEach((p) => { full[p.id] = {}; dlsOf(s, p).forEach((d) => { full[p.id][d.k] = q[p.id] ? q[p.id][d.k] : 0; }); });
  /* 最後に登録の条件をそのまま確かめる（代替品設定の対象の便に数が入った提案も出さない） */
  if (checks(s, P, full).some((x) => x.state === 'ng')) return null;
  if (Object.keys(s.blocked || {}).some((pid) => (s.blocked![pid] || []).some((k) => (full[pid]?.[k] || 0) > 0))) return null;
  return full;
}
/** チャットの言葉 → カテゴリ（2026-10-05 決定：商品カテゴリマスタの7つ 肉・魚・惣菜・主食・汁物・サラダ・果物・飲料・甘味） */
export const CHAT_ALIAS: Record<string, string> = { '肉': '肉', '魚': '魚', '惣菜': '惣菜', '主食': '主食', 'ごはん': '主食', '丼': '主食', 'カレー': '主食', 'パン': '主食', '汁物': '汁物', 'スープ': '汁物', 'サラダ': 'サラダ・果物', '果物': 'サラダ・果物', 'フルーツ': 'サラダ・果物', 'デザート': '飲料・甘味', '甘い': '飲料・甘味', '甘味': '飲料・甘味', '飲料': '飲料・甘味', 'ドリンク': '飲料・甘味' };

/* ---------------- 資材 ---------------- */
/** 資材便のリードタイム（発送日からお届けまでの日数）は契約の配送区分「資材」が持つ（lib/domain/materialLead.ts・hong 2026-10-06）。受付簿 No.154 */
/** 発送日（YYYY-MM-DD か YYYY/MM/DD）→ お届け予定日 'YYYY/MM/DD'。発送日がなければ undefined（画面は「—」・I223） */
export function matDueOf(shippedOn: string | undefined, leadDays: number): string | undefined {
  if (!shippedOn || !/^\d{4}[-/]\d{2}[-/]\d{2}$/.test(shippedOn)) return undefined;
  const a = shippedOn.split(/[-/]/).map(Number), d = new Date(a[0], a[1] - 1, a[2] + leadDays, 12);
  return d.getFullYear() + '/' + String(d.getMonth() + 1).padStart(2, '0') + '/' + String(d.getDate()).padStart(2, '0');
}
/** 'YYYY/MM/DD' → 'mm-dd（曜）'（注文履歴（資材注文）の日付） */
export function mdWd(s: string) {
  const a = s.split(/[-/]/).map(Number);
  return String(a[1]).padStart(2, '0') + '-' + String(a[2]).padStart(2, '0') + '（' + '日月火水木金土'[new Date(a[0], a[1] - 1, a[2], 12).getDay()] + '）';
}
/** 'YYYY-MM' → 翌月 'YYYY-MM'（注文の設定のトースト） */
export const nextMonth = (c: string) => { const a = c.split('-').map(Number); a[1]++; if (a[1] > 12) { a[1] = 1; a[0]++; } return a[0] + '-' + (a[1] < 10 ? '0' : '') + a[1]; };
/** その拠点のコースで使う資材 */
export const matFor = (s: { course: string }, m: { course: string }) => m.course.split('・').indexOf(s.course) >= 0;
/** 資材注文の登録前のチェック（エラーの文言。なければ ''） */
export function matError(q: Record<string, number>) {
  if (!Object.keys(q).some((k) => q[k] > 0)) return '注文数を1つ以上入れてください';
  return '';
}
/** アンケートの締切日のチェック（受付期間の終わりまで） */
export function surveyError(due: string, today: string, last: string) {
  if (!due) return 'アンケートの締切日を選んでください';
  if (due < today || due > last) return '受付期間の終わり（' + last + '）までの日を選んでください';
  return '';
}

/* ---------------- 注文履歴 ---------------- */
export type HistRow = { site: CSite; m: string; st: string; open: boolean; from: string; to: string };
export function histRows(sites: CSite[], cyc: string, curSt: Record<string, string>, pastSt: Record<string, Record<string, string>>): HistRow[] {
  const rows: HistRow[] = [];
  sites.forEach((x) => {
    MONTHS_ALL.forEach((m) => {
      if (m < x.start) return;
      const paused = !!x.paused && !!x.pauseFrom && m >= x.pauseFrom, stx = m === cyc ? curSt[x.id] : paused ? '休止中' : (pastSt[x.id] || {})[m];
      if (!stx) return;
      rows.push(x.trial
        ? { site: x, m, st: stx, open: m === cyc, from: ({ '2026-11': '2026/10/01', '2026-10': '2026/09/30' } as Record<string, string>)[m] || '2026/10/01', to: ({ '2026-11': '2026/10/25', '2026-10': '2026/10/11' } as Record<string, string>)[m] || '2026/10/25' }
        : { site: x, m, st: stx, open: m === cyc && !paused, from: orderFrom(m), to: orderTo(m) });
    });
  });
  rows.sort((a, b) => (a.m < b.m ? 1 : a.m > b.m ? -1 : a.site.id < b.site.id ? -1 : 1));
  return rows;
}
