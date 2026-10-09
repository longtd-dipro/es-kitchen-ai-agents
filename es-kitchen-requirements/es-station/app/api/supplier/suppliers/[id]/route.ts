import { body, handle, requireSupplier } from '@/lib/server/http';
import { service } from '@/lib/server/supplierRepo';
import { supplierView, withMainContact } from '@/lib/supplier/view';
import type { Supplier } from '@/lib/supplier/types';

export const GET = (_req: Request, { params }: { params: Promise<{ id: string }> }) =>
  handle(async () => supplierView(withMainContact(service().getSupplier(await requireSupplier((await params).id)))));

/* 仕入先が直せるのは連絡先（電話・メール・担当者・住所）だけ（台帳 F 2026-10-07）。送られたほかの項目は捨てる */
export const PUT = (req: Request, { params }: { params: Promise<{ id: string }> }) =>
  handle(async () => {
    const id = await requireSupplier((await params).id);
    const patch = await body<Partial<Supplier>>(req);
    const cur = service().getSupplier(id);
    return supplierView(withMainContact(service().updateSupplierContact(id, { ...patch, contacts: patch.contacts ?? withMainContact(cur).contacts })));
  });
