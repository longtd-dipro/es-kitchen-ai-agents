import { handle, requireSupplier } from '@/lib/server/http';
import { service } from '@/lib/server/supplierRepo';

export const GET = () =>
  handle(async () => {
    await requireSupplier();
    return service().listManuals();
  });
