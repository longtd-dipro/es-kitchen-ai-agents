import Database from 'better-sqlite3';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { MOCK_MANUALS } from '@/mocks/supplier/manuals';
import { MOCK_NOTICES } from '@/mocks/supplier/notices';
import { allSuppliers } from '@/mocks/supplier/suppliers';
import { seedOrders } from '@/lib/supplier/seed';
import { allSeeds } from '@/lib/ops/registry';
import { domainSeeds } from '@/lib/domain/registry';
import { DOCS_SCHEMA, ensureSuppliers, seedDocs } from './docs';
import { ensureDomainDocs, ensureTroubleUndecided } from './domainSeed';

/*
 * 開発用の共通 DB（SQLite・data/es.db）。全サイトの画面が app/api を通してこの1つを読み書きする。
 * 画面の型をそのまま JSON（data 列）で持ち、絞り込み・並べ替えに使う値だけ列にも出す。
 * 初回に見本データ（mocks/）を入れる。消して作り直すときは npm run db:reset か 開発用の画面の「見本データに戻す」。
 */

const FILE = process.env.ES_DB_FILE || join(process.cwd(), 'data', 'es.db');

const SCHEMA = `
CREATE TABLE IF NOT EXISTS meta (key TEXT PRIMARY KEY, value INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS suppliers (id TEXT PRIMARY KEY, data TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS orders (
  no TEXT PRIMARY KEY,
  seq INTEGER NOT NULL,
  sup TEXT NOT NULL,
  ans TEXT NOT NULL,
  data TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
);
CREATE INDEX IF NOT EXISTS orders_sup ON orders (sup, seq);
CREATE TABLE IF NOT EXISTS notices (id INTEGER PRIMARY KEY, data TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS manuals (file TEXT PRIMARY KEY, seq INTEGER NOT NULL, data TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS applications (
  receipt_no TEXT PRIMARY KEY,
  data TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
);
`;

const TABLES = ['suppliers', 'orders', 'notices', 'manuals', 'applications'];

function open() {
  mkdirSync(join(FILE, '..'), { recursive: true });
  const db = new Database(FILE);
  db.pragma('journal_mode = WAL');
  db.pragma('busy_timeout = 3000');
  db.exec(SCHEMA);
  db.exec(DOCS_SCHEMA);
  db.prepare(`INSERT OR IGNORE INTO meta (key, value) VALUES ('version', 1)`).run();
  const { n } = db.prepare('SELECT COUNT(*) AS n FROM orders').get() as { n: number };
  if (n === 0) seed(db);
  else {
    /* 運営Web などの領域のデータがまだなければ入れる（あとから足した領域も） */
    const { d } = db.prepare('SELECT COUNT(*) AS d FROM docs').get() as { d: number };
    if (d === 0) seedDocs(db, [...allSeeds(), ...domainSeeds()]);
    /* 全サイト共通の業務データ（lib/domain）があとから足されたとき */
    else { ensureDomainDocs(db); ensureTroubleUndecided(db); }
    /* 運営の古い置き場にだけある仕入先を suppliers へ（課題 11） */
    ensureSuppliers(db);
  }
  return db;
}

/** 見本データを入れ直す（いまの中身は消える） */
function seed(db: Database.Database) {
  db.transaction(() => {
    for (const t of TABLES) db.prepare(`DELETE FROM ${t}`).run();
    const sup = db.prepare('INSERT INTO suppliers (id, data) VALUES (?, ?)');
    /* 仕入先は運営の仕入先マスタ・申込と同じ置き場（課題 11）：仕入先サイトの4社＋運営の見本にだけあった仕入先 */
    for (const s of allSuppliers()) sup.run(s.id, JSON.stringify(s));
    const ord = db.prepare('INSERT INTO orders (no, seq, sup, ans, data) VALUES (?, ?, ?, ?, ?)');
    seedOrders().forEach((o, i) => ord.run(o.no, i, o.sup, o.ans, JSON.stringify(o)));
    const nt = db.prepare('INSERT INTO notices (id, data) VALUES (?, ?)');
    for (const x of MOCK_NOTICES) nt.run(x.id, JSON.stringify(x));
    const mn = db.prepare('INSERT INTO manuals (file, seq, data) VALUES (?, ?, ?)');
    MOCK_MANUALS.forEach((x, i) => mn.run(x.file, i, JSON.stringify(x)));
    seedDocs(db, [...allSeeds(), ...domainSeeds()]);
    bumpVersion(db);
  })();
}

export function bumpVersion(db: Database.Database) {
  db.prepare(`UPDATE meta SET value = value + 1 WHERE key = 'version'`).run();
}

/* 開発中の再読み込み（HMR）で何度も開かないよう、1つを使い回す */
const g = globalThis as unknown as { __esDb?: Database.Database };

export function getDb() {
  return (g.__esDb ??= open());
}

export function resetDb() {
  seed(getDb());
}
