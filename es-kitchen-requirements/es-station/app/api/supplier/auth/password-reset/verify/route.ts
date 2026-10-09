import { body, handle } from '@/lib/server/http';
import { service } from '@/lib/server/supplierRepo';

export const POST = (req: Request) =>
  handle(async () => service().verifyResetCode((await body<{ code: string }>(req)).code ?? ''));
