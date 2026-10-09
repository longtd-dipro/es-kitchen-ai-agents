import type { ShipmentInput } from '@/lib/api/supplier';
import { body, handle, requireOwnOrder } from '@/lib/server/http';
import { orderView } from '@/lib/supplier/view';
import { service } from '@/lib/server/supplierRepo';

export const POST = (req: Request, { params }: { params: Promise<{ no: string }> }) =>
  handle(async () => {
    const { no } = await params;
    await requireOwnOrder(no);
    return orderView(service().reportShipment({ ...(await body<Omit<ShipmentInput, 'no'>>(req)), no }));
  });
