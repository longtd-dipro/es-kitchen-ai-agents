import { ApiError } from '@/lib/api/errors';
import { gate, principalOf, siteOf } from '@/lib/server/access';
import { sqliteDocRepo } from '@/lib/server/docs';
import { bumpVersion, getDb } from '@/lib/server/db';
import { body, handle } from '@/lib/server/http';
import { setSession } from '@/lib/server/session';
import { AREAS } from '@/lib/ops/registry';

/*
 * 運営Web（と法人Web・委託配送先Web・ドライバー）の領域の API。POST /api/ops/area/<領域>/<名前>  body: { args }  ヘッダー x-es-site：呼んだサイト
 * queries はそのまま、actions はトランザクションの中で動かし、データの版を上げる。
 * 呼ぶ前に、ログイン中のアカウントの権限・見てよい範囲を確かめる（lib/server/access.ts）。driver.login に成功したらログインの Cookie を入れる。
 * 本番では領域ごとの API に置き換える（動きは lib/ops/areas/* の関数のとおり）。
 */
export async function POST(req: Request, { params }: { params: Promise<{ area: string; op: string }> }) {
  const { area, op } = await params;
  const { args } = await body<{ args: unknown }>(req);
  const site = siteOf(req);
  return handle(async () => {
    const a = AREAS[area];
    if (!a) throw new ApiError(`領域 ${area} がありません`, 404);
    const db = getDb();
    const repo = sqliteDocRepo(db);
    const isQuery = Object.hasOwn(a.queries, op);
    if (!isQuery && !Object.hasOwn(a.actions, op)) throw new ApiError(`${area}.${op} がありません`, 404);
    const g = gate(repo, await principalOf(repo, site), site, { kind: 'ops', area, op, action: !isQuery, args });
    const out = isQuery
      ? a.queries[op](repo, g.args) ?? null
      : db.transaction(() => {
        const o = a.actions[op](repo, g.args);
        bumpVersion(db);
        return o ?? null;
      })();
    /* ドライバーのログイン（query だがログインの記録を書く）：できたら Cookie を入れる */
    if (area === 'driver' && op === 'login') {
      const r = out as { ok: boolean; me?: { id: string } };
      await setSession('driver', r.ok && r.me ? r.me.id : null);
    }
    return g.filter ? g.filter(out) : out;
  });
}
