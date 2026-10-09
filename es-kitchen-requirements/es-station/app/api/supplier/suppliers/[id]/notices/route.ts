import { handle, requireSupplier } from '@/lib/server/http';
import { service } from '@/lib/server/supplierRepo';

export const GET = (_req: Request, { params }: { params: Promise<{ id: string }> }) =>
  handle(async () => {
    await requireSupplier((await params).id);
    return service().listNotices();
  });
