import type { ShipmentInput } from '@/lib/api/supplier';
import { body, handle, requireOwnOrder } from '@/lib/server/http';
import { orderView } from '@/lib/supplier/view';
import { service } from '@/lib/server/supplierRepo';

/** チェックした回をまとめて出荷済みにする（REQ-PO-621） */
export const POST = (req: Request) =>
  handle(async () => {
    const { items = [] } = await body<{ items: ShipmentInput[] }>(req);
    for (const x of items) await requireOwnOrder(x.no);
    return service().reportShipments(items).map(orderView);
  });
