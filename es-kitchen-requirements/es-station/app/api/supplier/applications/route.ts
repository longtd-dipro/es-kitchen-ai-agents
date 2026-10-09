import type { ApplicationForm } from '@/lib/api/supplier';
import { body, handle } from '@/lib/server/http';
import { service } from '@/lib/server/supplierRepo';

export const POST = (req: Request) => handle(async () => service().submitApplication(await body<ApplicationForm>(req)));
