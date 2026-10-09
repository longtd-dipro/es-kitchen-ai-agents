import { handle } from '@/lib/server/http';

/* 見本ではファイルを置いていない */
export const GET = () => handle(() => ({ url: 'about:blank' }));
