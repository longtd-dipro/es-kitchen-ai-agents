import { handle, requireOwnOrder } from '@/lib/server/http';
import { orderView } from '@/lib/supplier/view';
import { service } from '@/lib/server/supplierRepo';

export const POST = (_req: Request, { params }: { params: Promise<{ no: string }> }) =>
  handle(async () => {
    const { no } = await params;
    await requireOwnOrder(no);
    return orderView(service().markSeen(no));
  });
