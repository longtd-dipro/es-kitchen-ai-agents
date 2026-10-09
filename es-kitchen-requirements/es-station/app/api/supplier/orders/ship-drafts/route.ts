import type { ShipmentInput } from '@/lib/api/supplier';
import { body, handle, requireOwnOrder } from '@/lib/server/http';
import { orderView } from '@/lib/supplier/view';
import { service } from '@/lib/server/supplierRepo';

/** 出荷一覧の入力をまとめて保存（出荷済みにはしない・REQ-PO-621） */
export const POST = (req: Request) =>
  handle(async () => {
    const { items = [] } = await body<{ items: ShipmentInput[] }>(req);
    for (const x of items) await requireOwnOrder(x.no);
    return service().saveShipDrafts(items).map(orderView);
  });
