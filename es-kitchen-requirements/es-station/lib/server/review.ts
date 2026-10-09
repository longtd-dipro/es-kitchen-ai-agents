import Database from 'better-sqlite3';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { ApiError } from '@/lib/api/errors';

/*
 * 画面ごとのコメント（レビュー用。2026/10/02）。画面右下の「コメント」（public/review/comments.js）から書く。
 * 業務データ（data/es.db）とは別のファイル data/review.db に持つので、データリセット・npm run db:reset では消えない。
 * 02_デモ の HTML（ファイルで開いたもの・06_nextjs の legacy）からも書けるよう、CORS を開けている。
 * 開発・デモ用。本番（next build で NEXT_PUBLIC_DEMO なし）では API ごと閉じる。
 */

export type ReviewStatus = 'open' | 'done';

export interface ReviewComment {
  id: number;
  site: string;        // 運営Web・法人Web など
  screen: string;      // 画面名（メニュー ＞ 見出し）
  url: string;
  target: string;      // 画面の中で指した場所（任意）
  body: string;
  author: string;
  status: ReviewStatus;
  createdAt: string;
  updatedAt: string;
}

const FILE = process.env.ES_REVIEW_DB_FILE || join(process.cwd(), 'data', 'review.db');

let db: Database.Database | null = null;
function getReviewDb() {
  if (db) return db;
  mkdirSync(join(FILE, '..'), { recursive: true });
  db = new Database(FILE);
  db.pragma('journal_mode = WAL');
  db.pragma('busy_timeout = 3000');
  db.exec(`
CREATE TABLE IF NOT EXISTS comments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  site TEXT NOT NULL,
  screen TEXT NOT NULL,
  url TEXT NOT NULL DEFAULT '',
  target TEXT NOT NULL DEFAULT '',
  body TEXT NOT NULL,
  author TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'open',
  created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
);
CREATE INDEX IF NOT EXISTS comments_screen ON comments (site, screen);
`);
  return db;
}

type Row = { id: number; site: string; screen: string; url: string; target: string; body: string; author: string; status: ReviewStatus; created_at: string; updated_at: string };
const toComment = (r: Row): ReviewComment => ({
  id: r.id, site: r.site, screen: r.screen, url: r.url, target: r.target, body: r.body, author: r.author,
  status: r.status, createdAt: r.created_at, updatedAt: r.updated_at,
});

/** 開発（next dev）とデモ（NEXT_PUBLIC_DEMO=1）のときだけ使える */
export function requireReviewEnabled() {
  if (process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_DEMO !== '1') throw new ApiError('見つかりません', 404);
}

const str = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

export function listComments(): ReviewComment[] {
  return (getReviewDb().prepare('SELECT * FROM comments ORDER BY site, screen, id').all() as Row[]).map(toComment);
}

export function addComment(input: Partial<ReviewComment>): ReviewComment {
  const body = str(input.body, 4000);
  const site = str(input.site, 40) || '（サイト不明）';
  const screen = str(input.screen, 200) || '（画面不明）';
  if (!body) throw new ApiError('コメントを入力してください');
  const d = getReviewDb();
  const { lastInsertRowid } = d.prepare('INSERT INTO comments (site, screen, url, target, body, author) VALUES (?, ?, ?, ?, ?, ?)')
    .run(site, screen, str(input.url, 1000), str(input.target, 300), body, str(input.author, 40));
  return toComment(d.prepare('SELECT * FROM comments WHERE id = ?').get(lastInsertRowid) as Row);
}

export function updateComment(id: number, input: Partial<ReviewComment>): ReviewComment {
  const d = getReviewDb();
  const cur = d.prepare('SELECT * FROM comments WHERE id = ?').get(id) as Row | undefined;
  if (!cur) throw new ApiError(`コメントが見つかりません（${id}）`, 404);
  const status: ReviewStatus = input.status === 'done' || input.status === 'open' ? input.status : cur.status;
  const body = input.body === undefined ? cur.body : str(input.body, 4000);
  if (!body) throw new ApiError('コメントを入力してください');
  d.prepare(`UPDATE comments SET body = ?, status = ?, updated_at = datetime('now', 'localtime') WHERE id = ?`).run(body, status, id);
  return toComment(d.prepare('SELECT * FROM comments WHERE id = ?').get(id) as Row);
}

export function deleteComment(id: number) {
  getReviewDb().prepare('DELETE FROM comments WHERE id = ?').run(id);
}

/** Markdown（サイト ＞ 画面ごと。未対応を先に） */
export function commentsMarkdown(onlyOpen = false): string {
  const all = listComments().filter((c) => !onlyOpen || c.status === 'open');
  const now = new Date().toLocaleString('ja-JP');
  const open = all.filter((c) => c.status === 'open').length;
  const out = [`# 画面ごとのコメント`, '', `書き出し：${now}／${all.length} 件（未対応 ${open}・対応済み ${all.length - open}）`, ''];
  const bySite = new Map<string, Map<string, ReviewComment[]>>();
  for (const c of all) {
    const s = bySite.get(c.site) ?? new Map<string, ReviewComment[]>();
    s.set(c.screen, [...(s.get(c.screen) ?? []), c]);
    bySite.set(c.site, s);
  }
  for (const [site, screens] of bySite) {
    out.push(`## ${site}`, '');
    for (const [screen, cs] of screens) {
      out.push(`### ${screen}`, '');
      const url = cs.find((c) => c.url)?.url;
      if (url) out.push(`画面：${url}`, '');
      for (const c of [...cs].sort((a, b) => (a.status === b.status ? a.id - b.id : a.status === 'open' ? -1 : 1))) {
        const meta = [`#${c.id}`, c.createdAt.slice(0, 16), c.author].filter(Boolean).join('・');
        const where = c.target ? `（場所：${c.target}）` : '';
        const [first, ...rest] = c.body.split('\n');
        out.push(`- [${c.status === 'done' ? 'x' : ' '}] ${first}${where}　<small>${meta}</small>`);
        for (const l of rest) out.push(`  ${l}`);
      }
      out.push('');
    }
  }
  return out.join('\n');
}

/** プロジェクトの 00_確認してほしい/ に Markdown を置く（Claude に渡すとき用） */
export function saveMarkdown(): string {
  const day = new Date().toLocaleDateString('sv-SE').replaceAll('-', '');
  const dir = join(process.cwd(), '..', '00_確認してほしい');
  const name = `画面コメント_${day}.md`;
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, name), commentsMarkdown(), 'utf-8');
  return `00_確認してほしい/${name}`;
}

/* ファイルで開いた HTML（Origin: null）・ほかのポートのデモからも呼べるように */
export const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export function withCors(res: Response): Response {
  for (const [k, v] of Object.entries(CORS)) res.headers.set(k, v);
  return res;
}

export const preflight = () => new Response(null, { status: 204, headers: CORS });
