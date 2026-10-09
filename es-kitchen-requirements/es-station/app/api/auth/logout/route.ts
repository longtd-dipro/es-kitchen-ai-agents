import { siteOf } from '@/lib/server/access';
import { handle } from '@/lib/server/http';
import { setSession } from '@/lib/server/session';

/* ログアウト：呼んだサイト（ヘッダー x-es-site）のログインの Cookie を消す */
export const POST = (req: Request) =>
  handle(async () => {
    const site = siteOf(req);
    if (site) await setSession(site, null);
    return { ok: true };
  });
