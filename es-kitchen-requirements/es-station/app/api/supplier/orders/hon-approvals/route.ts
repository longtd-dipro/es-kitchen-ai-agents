import type { HonInput } from '@/lib/api/supplier';
import { body, handle, requireOwnOrder } from '@/lib/server/http';
import { orderView } from '@/lib/supplier/view';
import { service } from '@/lib/server/supplierRepo';

export const POST = (req: Request) =>
  handle(async () => {
    const { items = [] } = await body<{ items: HonInput[] }>(req);
    for (const x of items) await requireOwnOrder(x.no);
    return service().approveHon(items).map(orderView);
  });
