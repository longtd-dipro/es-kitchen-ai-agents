import { ApiError } from '@/lib/api/errors';
import { DOMAIN_AREAS } from '@/lib/domain/registry';
import type { Site } from '@/lib/domain/types';
import { gate, principalOf, siteOf } from '@/lib/server/access';
import { sqliteDocRepo } from '@/lib/server/docs';
import { bumpVersion, getDb } from '@/lib/server/db';
import { ensureDomainDocs } from '@/lib/server/domainSeed';
import { body, handle } from '@/lib/server/http';
import { setSession } from '@/lib/server/session';

/*
 * 全サイト共通の業務データの API。POST /api/domain/<領域>/<名前>  body: { args }  ヘッダー x-es-site：呼んだサイト
 * queries はそのまま、actions はトランザクションの中で動かし、データの版を上げる（開いている全サイトの画面が読み直す）。
 * 呼ぶ前に、ログイン中のアカウントの権限・見てよい範囲を確かめる（lib/server/access.ts）。account.signIn に成功したらログインの Cookie を入れる。
 */
/** 接続元の IPv4（プロキシのヘッダー x-forwarded-for の先頭か x-real-ip。なければ undefined＝ローカル開発） */
function clientIp(req: Request) {
  const fwd = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip')?.trim() || '';
  /* 自分自身（127.x。next dev はこれを入れる）は確かめない＝ローカル開発では OTP にならない */
  return /^\d{1,3}(\.\d{1,3}){3}$/.test(fwd) && !fwd.startsWith('127.') ? fwd : undefined;
}

export async function POST(req: Request, { params }: { params: Promise<{ area: string; op: string }> }) {
  const { area, op } = await params;
  const { args } = await body<{ args: unknown }>(req);
  const site = siteOf(req);
  return handle(async () => {
    const a = DOMAIN_AREAS[area];
    if (!a) throw new ApiError(`領域 ${area} がありません`, 404);
    const db = getDb();
    /* 開いている DB に共通データがまだなければ入れる（運営などのデータは消さない） */
    ensureDomainDocs(db);
    const repo = sqliteDocRepo(db);
    const isQuery = Object.hasOwn(a.queries, op);
    if (!isQuery && !Object.hasOwn(a.actions, op)) throw new ApiError(`${area}.${op} がありません`, 404);
    const g = gate(repo, await principalOf(repo, site), site, { kind: 'domain', area, op, action: !isQuery, args: args ?? undefined });
    /* ログイン・認証コード：接続元の IP はサーバーが入れる（IP ホワイトリスト・受付簿 #61。プロキシのヘッダーがなければ確かめない） */
    if (area === 'account' && (op === 'signIn' || op === 'verifyOtp') && g.args && typeof g.args === 'object') (g.args as { ip?: string }).ip = clientIp(req);
    const out = isQuery
      ? a.queries[op](repo, g.args) ?? null
      : db.transaction(() => {
        const o = a.actions[op](repo, g.args);
        bumpVersion(db);
        return o ?? null;
      })();
    /* ログインできたら（認証コードで通ったときも）、そのサイトのログインの Cookie を入れる */
    if (area === 'account' && (op === 'signIn' || op === 'verifyOtp')) {
      const r = out as { ok: boolean; account?: { id: string } };
      await setSession((g.args as { site: Site }).site, r.ok && r.account ? r.account.id : null);
    }
    return g.filter ? g.filter(out) : out;
  });
}
