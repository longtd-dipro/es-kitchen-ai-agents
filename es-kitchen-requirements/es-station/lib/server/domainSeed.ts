import type Database from 'better-sqlite3';
import { domainSeeds } from '@/lib/domain/registry';

/*
 * 全サイト共通の業務データ（lib/domain）の見本を共通 DB の docs テーブルに入れる。
 * db.ts の見本の入れ直し（seedDocs）には domainSeeds() も渡している。ここは、すでにある DB に
 * あとから共通データを足すとき（dm.* がまだないとき）だけ使う。いまある行は消さない。
 */
export function ensureDomainDocs(db: Database.Database) {
  const { n } = db.prepare(`SELECT COUNT(*) AS n FROM docs WHERE kind LIKE 'dm.%'`).get() as { n: number };
  if (n > 0) return;
  const ins = db.prepare('INSERT OR IGNORE INTO docs (kind, id, seq, data) VALUES (?, ?, ?, ?)');
  db.transaction(() => {
    for (const seed of domainSeeds()) {
      for (const [kind, rows] of Object.entries(seed)) rows.forEach((r, i) => ins.run(kind, r.id, i, JSON.stringify(r.data)));
    }
    db.prepare(`UPDATE meta SET value = value + 1 WHERE key = 'version'`).run();
  })();
}

/**
 * 種別未定（トラブルの種類 undecided）をすでにある DB へ足す。
 * 古い DB は、アプリの「商品不足・誤配送」を「その他」＋原文のメモで持っている。それは種別未定にする
 * （「その他」を自由に入力して報告したもの＝メモが「その他：…」のものは変えない）。見本データを入れ直した DB には最初からある。
 */
export function ensureTroubleUndecided(db: Database.Database) {
  const has = db.prepare(`SELECT 1 FROM docs WHERE kind = 'dm.master.troubleTypes' AND id = 'undecided'`).get();
  const hasTypes = db.prepare(`SELECT 1 FROM docs WHERE kind = 'dm.master.troubleTypes' LIMIT 1`).get();
  if (has || !hasTypes) return;
  const { s } = db.prepare(`SELECT COALESCE(MAX(seq), -1) AS s FROM docs WHERE kind = 'dm.master.troubleTypes'`).get() as { s: number };
  const RAW = '商品不足・誤配送';
  db.transaction(() => {
    db.prepare('INSERT OR IGNORE INTO docs (kind, id, seq, data) VALUES (?, ?, ?, ?)').run('dm.master.troubleTypes', 'undecided', s + 1, JSON.stringify({ id: 'undecided', name: '種別未定', autoChild: false }));
    const rows = db.prepare(`SELECT id, data FROM docs WHERE kind = 'dm.delivery.troubles'`).all() as { id: string; data: string }[];
    const upd = db.prepare(`UPDATE docs SET data = ? WHERE kind = 'dm.delivery.troubles' AND id = ?`);
    for (const r of rows) {
      const t = JSON.parse(r.data) as { typeId: string; note: string };
      if (t.typeId === 'other' && (t.note === RAW || t.note.startsWith(`${RAW}：`))) upd.run(JSON.stringify({ ...t, typeId: 'undecided' }), r.id);
    }
    db.prepare(`UPDATE meta SET value = value + 1 WHERE key = 'version'`).run();
  })();
}
