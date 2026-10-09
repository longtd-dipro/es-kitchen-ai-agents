import type { Company, Review, ReviewRow, ReviewSearch, ReviewUser, SortCol, SortKey } from './types';

/* レビュー・ご意見の絞り込み・並べ替え・CSV（元の search()・bCsv と同じ条件） */

/** ニックネーム未設定のユーザーの表示名 */
export const ANON = '匿名ユーザー';

/** 並べ替えの項目（一覧の全列。hong 2026-10-05） */
export const SORT_COLS: [SortCol, string][] = [
  ['order', '注文番号'],
  ['dt', '投稿日時'],
  ['nick', '投稿者'],
  ['co', '法人'],
  ['br', '拠点'],
  ['n', '品数'],
  ['min', '最低評価'],
  ['comment', 'コメント'],
];
/** 初期の並び：投稿日時の新しい順 */
export const DEFAULT_SORT: SortKey = 'dt:desc';
/** 'dt:desc' → ['dt', 'desc']（読めない値は初期の並び） */
export const splitSort = (k: string | undefined): [SortCol, 'asc' | 'desc'] => {
  const [c, d] = (k ?? '').split(':');
  return SORT_COLS.some((x) => x[0] === c) ? [c as SortCol, d === 'asc' ? 'asc' : 'desc'] : ['dt', 'desc'];
};
export const sortLabel = (k: SortKey) => { const [c, d] = splitSort(k); return `${SORT_COLS.find((x) => x[0] === c)?.[1]}（${d === 'asc' ? '昇順' : '降順'}）`; };

/** 検索条件の初期値（クリア） */
export const EMPTY_SEARCH: ReviewSearch = { from: '', to: '', prod: '', kw: '', co: '', br: '', user: '', tag: '', hasCm: '', star: '', sort: DEFAULT_SORT };

/** 拠点の選択肢（法人を選んでいればその法人の拠点だけ） */
export const branchesOf = (cos: Company[], co: string) => cos.filter((x) => !co || x.id === co).flatMap((x) => x.branches);

/** 投稿にユーザー・法人・拠点の名前と最低評価を付ける */
export function toRow(r: Review, users: ReviewUser[], cos: Company[]): ReviewRow {
  const u = users.find((x) => x.id === r.uid);
  const c = cos.find((x) => x.id === u?.coId);
  const b = c?.branches.find((x) => x.id === u?.brId);
  return {
    ...r,
    user: { uid: r.uid, nick: u?.nick ?? '', left: !!u?.left },
    co: { id: c?.id ?? '', name: c?.name ?? '' },
    br: { id: b?.id ?? '', name: b?.name ?? '' },
    min: Math.min(...r.items.map((x) => x.star)),
  };
}

/** 'YYYY/MM/DD HH:mm' → 'YYYY-MM-DD'（<input type="date"> の値と比べる） */
const isoDay = (dt: string) => dt.slice(0, 10).replace(/\//g, '-');

/** 検索条件に合うか（元の search() の filter） */
export function matches(r: ReviewRow, f: Partial<ReviewSearch>): boolean {
  const d = isoDay(r.dt);
  const pr = (f.prod ?? '').trim(), kw = (f.kw ?? '').trim(), us = (f.user ?? '').trim();
  if (f.from && d < f.from) return false;
  if (f.to && d > f.to) return false;
  if (pr && !r.order.includes(pr) && !r.items.some((x) => x.pid.includes(pr) || x.name.includes(pr))) return false;
  if (kw && !r.comment.includes(kw)) return false;
  if (f.co && r.co.id !== f.co) return false;
  if (f.br && r.br.id !== f.br) return false;
  if (us && !r.user.uid.includes(us) && !(r.user.nick || ANON).includes(us)) return false;
  if (f.tag && !r.items.some((x) => x.tags.includes(f.tag!))) return false;
  if (f.star === 'low' && r.min > 2) return false;
  if (f.star && f.star !== 'low' && !r.items.some((x) => x.star === +f.star!)) return false;
  if (f.hasCm === '1' && !r.comment) return false;
  if (f.hasCm === '0' && r.comment) return false;
  return true;
}

/** 並べ替えに使う値（項目ごと）。日時は 'YYYY/MM/DD HH:mm' なので文字列で比べられる */
const sortVal = (r: ReviewRow, c: SortCol): string | number =>
  c === 'order' ? r.order : c === 'dt' ? r.dt : c === 'nick' ? r.user.nick || ANON : c === 'co' ? r.co.name : c === 'br' ? r.br.name : c === 'n' ? r.items.length : c === 'min' ? r.min : r.comment;

/** 並べ替え（項目＋昇順／降順。同じ値なら投稿日時の新しい順） */
export function sortRows(rows: ReviewRow[], so: SortKey | string | undefined): ReviewRow[] {
  const [c, d] = splitSort(so);
  const byDt = (a: ReviewRow, b: ReviewRow) => (a.dt < b.dt ? -1 : a.dt > b.dt ? 1 : 0);
  const cmp = (a: ReviewRow, b: ReviewRow) => {
    const x = sortVal(a, c), y = sortVal(b, c);
    return typeof x === 'number' && typeof y === 'number' ? x - y : String(x).localeCompare(String(y), 'ja', { numeric: true });
  };
  return [...rows].sort((a, b) => (d === 'asc' ? cmp(a, b) : cmp(b, a)) || byDt(b, a));
}

/** 絞り込んで並べ替える */
export const searchRows = (rows: ReviewRow[], f: Partial<ReviewSearch>) => sortRows(rows.filter((r) => matches(r, f)), f.sort);

/** 一覧の商品セル：★の低い順（同じ★は投稿の並びのまま） */
export const itemsByStar = (r: Review) => [...r.items].sort((a, b) => a.star - b.star);

/** CSV の列（1行＝1商品。レビューIDは持たないので注文番号が先頭：hong 2026-10-05） */
export const CSV_HEAD = ['注文番号', '投稿日時', 'ユーザーID', 'ニックネーム', '退会', '法人ID', '法人', '拠点ID', '拠点', '商品ID', '商品名', '評価', '評価タグ', 'コメント'];

/** CSV の行（1行＝1商品・検索条件に一致する全件。メールアドレスは出さない） */
export const csvRows = (rows: ReviewRow[]): string[][] =>
  rows.flatMap((r) =>
    r.items.map((x) => [
      r.order, r.dt, r.user.uid, r.user.nick || ANON, r.user.left ? '退会済' : '', r.co.id, r.co.name, r.br.id, r.br.name,
      x.pid, x.name, String(x.star), x.tags.join('・'), r.comment,
    ]),
  );

/** CSV の文字列（BOM 付き・CRLF） */
export const toCsv = (head: string[], rows: string[][]) =>
  '﻿' + [head, ...rows].map((r) => r.map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\r\n');
