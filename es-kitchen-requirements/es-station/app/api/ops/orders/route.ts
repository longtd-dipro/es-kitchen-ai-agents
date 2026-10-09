import { requireOps } from '@/lib/server/access';
import { getDb } from '@/lib/server/db';
import { sqliteDocRepo } from '@/lib/server/docs';
import { handle } from '@/lib/server/http';
import { service } from '@/lib/server/supplierRepo';

/* 運営Web：全仕入先の発注（運営のログイン・発注管理の閲覧（入荷管理・倉庫在庫の画面も読む）） */
export const GET = (req: Request) => handle(async () => {
  await requireOps(req, sqliteDocRepo(getDb()), 'purchasing', 'read', ['receiving', 'stockFood', 'stockMaterial']);
  return service().listAllOrders();
});
