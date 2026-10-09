import { requireOps } from '@/lib/server/access';
import { getDb } from '@/lib/server/db';
import { sqliteDocRepo } from '@/lib/server/docs';
import { handle } from '@/lib/server/http';
import { service } from '@/lib/server/supplierRepo';

/* 入荷：入荷管理の「入荷」 */
export const POST = (req: Request, { params }: { params: Promise<{ no: string }> }) =>
  handle(async () => {
    await requireOps(req, sqliteDocRepo(getDb()), 'receiving', 'receive');
    return service().receiveOrder((await params).no);
  });
