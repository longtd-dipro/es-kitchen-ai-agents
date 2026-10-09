import { requireOps } from '@/lib/server/access';
import { getDb } from '@/lib/server/db';
import { sqliteDocRepo } from '@/lib/server/docs';
import { body, handle } from '@/lib/server/http';
import { service } from '@/lib/server/supplierRepo';

export const POST = (req: Request, { params }: { params: Promise<{ no: string }> }) =>
  handle(async () => {
    await requireOps(req, sqliteDocRepo(getDb()), 'purchasing', 'update');
    return service().changeKari((await params).no, Number((await body<{ qty: number }>(req)).qty));
  });
