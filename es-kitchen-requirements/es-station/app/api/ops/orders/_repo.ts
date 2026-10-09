import { bumpVersion, getDb } from '@/lib/server/db';
import { service } from '@/lib/server/supplierRepo';
import { sqliteDocRepo } from '@/lib/server/docs';
import { unitCostOf } from '@/lib/domain/snapshot';
import type { Product } from '@/lib/domain/types';
import { supplierService, type SupplierRepo } from '@/lib/supplier/service';
import type { Order } from '@/lib/supplier/types';
import { withAltPos } from '@/lib/ops/purchasing/docRepo';

/*
 * 運営Web（発注・入荷）用の発注の書き換え。共通 DB（SQLite）の orders テーブルに、
 * lib/server/supplierRepo の Repo では足せない「新しい発注を足す」（addOrder）を加えたもの。
 * 発注を足すほかは lib/server/supplierRepo と同じ（読み書きは service() の Repo に任せる）。
 */
export function opsOrderService() {
  const db = getDb();
  const base = service();
  const parse = (row: unknown) => (row ? (JSON.parse((row as { data: string }).data) as Order) : undefined);
  const repo: SupplierRepo = {
    getSupplier: (id) => base.getSupplier(id),
    saveSupplier: (s) => { base.updateSupplier(s); },
    listOrders: (id) => (id ? base.listOrders(id) : base.listAllOrders()),
    getOrder: (no) => parse(db.prepare('SELECT data FROM orders WHERE no = ?').get(no)),
    saveOrder(o) {
      db.prepare(`UPDATE orders SET data = ?, ans = ?, updated_at = datetime('now', 'localtime') WHERE no = ?`).run(JSON.stringify(o), o.ans, o.no);
      bumpVersion(db);
    },
    addOrder(o) {
      const { n } = db.prepare('SELECT COALESCE(MAX(seq), -1) + 1 AS n FROM orders').get() as { n: number };
      db.prepare('INSERT INTO orders (no, seq, sup, ans, data) VALUES (?, ?, ?, ?, ?)').run(o.no, n, o.sup, o.ans, JSON.stringify(o));
      bumpVersion(db);
    },
    listNotices: () => base.listNotices(),
    listManuals: () => base.listManuals(),
    addApplication: (no, form) => { void no; void form; throw new Error('使わない'); },
    countApplications: () => 0,
    unitCost: (o) => unitCostOf(sqliteDocRepo(db).get<Product>('dm.master.products', o.pid), o.sup),
    version: () => base.version(),
    transaction: (fn) => db.transaction(fn)(),
  };
  /* 代替品の追加発注（dm.order.altPos）の読み書きは共通データへ（仕入先サイトと同じ） */
  return supplierService(withAltPos(repo, sqliteDocRepo(db), () => bumpVersion(db)));
}
