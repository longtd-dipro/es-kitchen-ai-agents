import { handle, requireSupplier } from '@/lib/server/http';

/* 見本ではメールを送らない */
export const POST = (_req: Request, { params }: { params: Promise<{ id: string }> }) =>
  handle(async () => {
    await requireSupplier((await params).id);
  });
