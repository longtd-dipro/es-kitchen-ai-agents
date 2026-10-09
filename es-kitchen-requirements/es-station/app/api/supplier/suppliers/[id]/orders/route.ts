import { handle, requireSupplier } from '@/lib/server/http';
import { orderView } from '@/lib/supplier/view';
import { service } from '@/lib/server/supplierRepo';

export const GET = (_req: Request, { params }: { params: Promise<{ id: string }> }) =>
  handle(async () => service().listOrders(await requireSupplier((await params).id)).map(orderView));
