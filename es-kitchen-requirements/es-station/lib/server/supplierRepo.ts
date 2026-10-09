import type { Manual } from '@/lib/api/supplier';
import type { Product } from '@/lib/domain/types';
import { supplierService, type SupplierRepo } from '@/lib/supplier/service';
import { supplierProductRows } from '@/lib/supplier/fromDomain';
import { unitCostOf } from '@/lib/domain/snapshot';
import type { Notice, Order, Supplier } from '@/lib/supplier/types';
import { bumpVersion, getDb } from './db';
import { sqliteDocRepo } from './docs';
import { withAltPos } from '@/lib/ops/purchasing/docRepo';
import { addSupplierApplication, lastReceiptSeq } from '@/lib/ops/general/supplierApps';
import { today } from '@/lib/supplier/dates';

/** 共通 DB（SQLite）に置く SupplierRepo。書き換えのたびに版（meta.version）を上げる */
function sqliteRepo(): SupplierRepo {
  const db = getDb();
  const parse = <T,>(row: unknown) => (row ? (JSON.parse((row as { data: string }).data) as T) : undefined);
  const parseAll = <T,>(rows: unknown[]) => rows.map((r) => parse<T>(r)!);

  return {
    /* 取扱商品は共通データの商品マスタから作る（商品の仕入先にこの仕入先がある商品） */
    getSupplier: (id) => {
      const s = parse<Supplier>(db.prepare('SELECT data FROM suppliers WHERE id = ?').get(id));
      if (!s) return s;
      const products = sqliteDocRepo(db).list<Product>('dm.master.products');
      return { ...s, products: supplierProductRows(products, id, s.products) };
    },
    saveSupplier(s) {
      db.prepare('UPDATE suppliers SET data = ? WHERE id = ?').run(JSON.stringify(s), s.id);
      bumpVersion(db);
    },
    listOrders: (id) =>
      parseAll<Order>(
        id
          ? db.prepare('SELECT data FROM orders WHERE sup = ? ORDER BY seq').all(id)
          : db.prepare('SELECT data FROM orders ORDER BY seq').all(),
      ),
    getOrder: (no) => parse<Order>(db.prepare('SELECT data FROM orders WHERE no = ?').get(no)),
    saveOrder(o) {
      db.prepare(`UPDATE orders SET data = ?, ans = ?, updated_at = datetime('now', 'localtime') WHERE no = ?`).run(JSON.stringify(o), o.ans, o.no);
      bumpVersion(db);
    },
    listNotices: () => parseAll<Notice>(db.prepare('SELECT data FROM notices').all()),
    listManuals: () => parseAll<Manual>(db.prepare('SELECT data FROM manuals ORDER BY seq').all()),
    /* 申込は共通 DB の suppliers（申込中の行）に書く＝運営の「仕入先の申込」に出て、承認すると同じ行でログインできる（B5・課題 11。SQL の applications テーブルは使わない） */
    addApplication(receiptNo, form) {
      addSupplierApplication(sqliteDocRepo(db), receiptNo, form);
      bumpVersion(db);
    },
    /** その日の受付番号の最後の数（次の番号＝これ＋1） */
    countApplications: () => lastReceiptSeq(sqliteDocRepo(db), today().replace(/\//g, '')),
    /* 本発注したときに写す仕入単価（共通データの商品マスタ） */
    unitCost: (o) => unitCostOf(sqliteDocRepo(db).get<Product>('dm.master.products', o.pid), o.sup),
    version: () => (db.prepare(`SELECT value FROM meta WHERE key = 'version'`).get() as { value: number }).value,
    transaction: (fn) => db.transaction(fn)(),
  };
}

/** app/api から使う（作るのは軽いので毎回作る。開発中に service.ts を直してもすぐ効く） */
/* 代替品の追加発注（共通データ dm.order.altPos）も仕入先サイトの発注に出す（課題 2c-1・lib/ops/purchasing/docRepo.ts の withAltPos） */
export const service = () => {
  const db = getDb();
  return supplierService(withAltPos(sqliteRepo(), sqliteDocRepo(db), () => bumpVersion(db)));
};
