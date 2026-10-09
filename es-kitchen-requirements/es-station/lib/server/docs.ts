import type Database from 'better-sqlite3';
import type { DocRepo, Seed } from '@/lib/ops/core/area';
import type { GenRow, SupplierApp } from '@/lib/ops/general/types';
import { fromOld } from '@/lib/ops/general/suppliers';

/* 共通 DB の文書テーブル（運営Web などの領域のデータ）。テーブルは db.ts の SCHEMA で作る */

export const DOCS_SCHEMA = `
CREATE TABLE IF NOT EXISTS docs (
  kind TEXT NOT NULL,
  id TEXT NOT NULL,
  seq INTEGER NOT NULL,
  data TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
  PRIMARY KEY (kind, id)
);
/* 新しい文書の seq（MAX(seq)）を引くための索引。ないと1件足すたびに、その種類の全件を読む（5,000行のCSV取込が遅くなる） */
CREATE INDEX IF NOT EXISTS docs_kind_seq ON docs (kind, seq);
CREATE TABLE IF NOT EXISTS seqs (key TEXT PRIMARY KEY, value INTEGER NOT NULL);
`;

/**
 * 共通 DB の発注（仕入先サイトと同じ orders テーブル・lib/server/supplierRepo.ts と同じデータ）を、領域から読むだけの kind（lib/domain/stock.ts の DB_ORDERS と同じ名前）。
 * 倉庫在庫の入荷予定・代替品設定の在庫の見込みが、仕入先サイトの発注も数えるため。書き換えは仕入先サイト・運営の発注の API（lib/supplier/service.ts）から
 */
const DB_ORDERS = 'db.orders';
/**
 * 共通 DB の仕入先（仕入先サイトと同じ suppliers テーブル）を、領域から読み書きする kind（lib/ops/general/suppliers.ts の SUPPLIERS と同じ名前）。
 * 運営の仕入先マスタ・仕入先の申込・承認・仕入先サイトのログインが同じ行を使う（課題 11）
 */
const DB_SUPPLIERS = 'db.suppliers';

/**
 * 運営の古い置き場（docs の general.supplier・general.supplierApp）にだけある仕入先を suppliers テーブルへ移す（ID はそのまま・何度呼んでもよい）。
 * 見本を入れ直さずに、いまの共通 DB をそろえるため（lib/server/db.ts の open と、最初に仕入先を読むとき）
 */
const ensured = new WeakSet<Database.Database>();
export function ensureSuppliers(db: Database.Database) {
  if (ensured.has(db)) return;
  ensured.add(db);
  const have = new Set((db.prepare('SELECT id FROM suppliers').all() as { id: string }[]).map((x) => x.id));
  const rows = (db.prepare(`SELECT data FROM docs WHERE kind = 'general.supplier' ORDER BY seq`).all() as { data: string }[]).map((x) => JSON.parse(x.data) as GenRow);
  const ins = db.prepare('INSERT INTO suppliers (id, data) VALUES (?, ?)');
  for (const g of rows) {
    const id = String(g.id ?? '');
    if (!/^SP\d{5}$/.test(id) || have.has(id)) continue;
    const app = db.prepare(`SELECT data FROM docs WHERE kind = 'general.supplierApp' AND id = ?`).get(id) as { data: string } | undefined;
    ins.run(id, JSON.stringify(fromOld(g, app ? (JSON.parse(app.data) as SupplierApp) : null)));
    have.add(id);
  }
}

export function sqliteDocRepo(db: Database.Database): DocRepo {
  return {
    list: <T,>(kind: string) => {
      if (kind === DB_SUPPLIERS) { ensureSuppliers(db); return (db.prepare('SELECT data FROM suppliers ORDER BY id').all() as { data: string }[]).map((r) => JSON.parse(r.data) as T); }
      return (kind === DB_ORDERS
        ? (db.prepare('SELECT data FROM orders ORDER BY seq').all() as { data: string }[])
        : (db.prepare('SELECT data FROM docs WHERE kind = ? ORDER BY seq').all(kind) as { data: string }[])).map((r) => JSON.parse(r.data) as T);
    },
    get<T>(kind: string, id: string) {
      if (kind === DB_SUPPLIERS) ensureSuppliers(db);
      const r = (kind === DB_ORDERS ? db.prepare('SELECT data FROM orders WHERE no = ?').get(id)
        : kind === DB_SUPPLIERS ? db.prepare('SELECT data FROM suppliers WHERE id = ?').get(id)
          : db.prepare('SELECT data FROM docs WHERE kind = ? AND id = ?').get(kind, id)) as { data: string } | undefined;
      return r ? (JSON.parse(r.data) as T) : undefined;
    },
    put(kind, id, data) {
      if (kind === DB_SUPPLIERS) {
        db.prepare('INSERT INTO suppliers (id, data) VALUES (?, ?) ON CONFLICT (id) DO UPDATE SET data = excluded.data').run(id, JSON.stringify(data));
        return;
      }
      if (kind === DB_ORDERS) throw new Error('共通 DB の発注はここでは書き換えられません（lib/supplier/service.ts を使う）');
      const cur = db.prepare('SELECT seq FROM docs WHERE kind = ? AND id = ?').get(kind, id) as { seq: number } | undefined;
      const seq = cur?.seq ?? ((db.prepare('SELECT COALESCE(MAX(seq), -1) + 1 AS n FROM docs WHERE kind = ?').get(kind) as { n: number }).n);
      db.prepare(`INSERT INTO docs (kind, id, seq, data) VALUES (?, ?, ?, ?)
        ON CONFLICT (kind, id) DO UPDATE SET data = excluded.data, updated_at = datetime('now', 'localtime')`).run(kind, id, seq, JSON.stringify(data));
    },
    remove: (kind, id) => {
      if (kind === DB_ORDERS) throw new Error('共通 DB の発注はここでは消せません');
      if (kind === DB_SUPPLIERS) throw new Error('仕入先は消さずに状態を削除済にしてください');
      db.prepare('DELETE FROM docs WHERE kind = ? AND id = ?').run(kind, id);
    },
    nextSeq(key) {
      db.prepare('INSERT INTO seqs (key, value) VALUES (?, 1) ON CONFLICT (key) DO UPDATE SET value = value + 1').run(key);
      return (db.prepare('SELECT value FROM seqs WHERE key = ?').get(key) as { value: number }).value;
    },
  };
}

/** 全領域の見本データを入れ直す（db.ts の seed から呼ぶ） */
export function seedDocs(db: Database.Database, seeds: Seed[]) {
  db.prepare('DELETE FROM docs').run();
  db.prepare('DELETE FROM seqs').run();
  const ins = db.prepare('INSERT INTO docs (kind, id, seq, data) VALUES (?, ?, ?, ?)');
  for (const seed of seeds) {
    /* db.* は docs ではなく共通 DB のテーブル（db.ts の seed が入れる）。メモリの DocRepo のための見本なので入れない */
    for (const [kind, rows] of Object.entries(seed)) if (!kind.startsWith('db.')) rows.forEach((r, i) => ins.run(kind, r.id, i, JSON.stringify(r.data)));
  }
}
