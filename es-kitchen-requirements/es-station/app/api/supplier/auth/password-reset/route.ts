import { handle } from '@/lib/server/http';

/* 見本ではメールを送らない */
export const POST = () => handle(() => undefined);
