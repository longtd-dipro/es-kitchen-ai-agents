import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { cookies } from 'next/headers';
import type { Site } from '@/lib/domain/types';

/*
 * ログインの状態（サーバー側）。サイトごとの Cookie（es_s_<サイト>）にアカウントID と署名を入れる。
 *   - ログインした（account.signIn・driver.login・仕入先のログイン）ときにサーバーが入れる。画面からは書けない（httpOnly）
 *   - 署名の鍵：環境変数 ES_SESSION_SECRET、なければ data/session-secret（初回に作る・git に入れない）
 * 同じブラウザで法人Web と運営Web を開いてもぶつからないように、サイトごとに別の Cookie にする。
 * 本番は API の認証（Cognito など）に置き換える。
 */

const name = (site: Site) => `es_s_${site}`;

let key: Buffer | null = null;
function secret() {
  if (key) return key;
  if (process.env.ES_SESSION_SECRET) return (key = Buffer.from(process.env.ES_SESSION_SECRET));
  const dir = join(process.cwd(), 'data');
  const file = join(dir, 'session-secret');
  if (!existsSync(file)) {
    mkdirSync(dir, { recursive: true });
    writeFileSync(file, randomBytes(32).toString('hex'), { mode: 0o600 });
  }
  return (key = Buffer.from(readFileSync(file, 'utf8').trim()));
}

/** ログインの期限：全サイト1日（台帳 K「ログインの期限」）。Cookie の maxAge と、署名に入れた期限の両方で切る */
export const SESSION_SECONDS = 24 * 60 * 60;

const sign = (site: Site, id: string, exp: number) => createHmac('sha256', secret()).update(`${site}:${id}:${exp}`).digest('base64url');

/** ログインした（id）／ログアウトした（null）を Cookie に入れる */
export async function setSession(site: Site, id: string | null) {
  const c = await cookies();
  if (id) {
    const exp = Date.now() + SESSION_SECONDS * 1000;
    c.set(name(site), `${encodeURIComponent(id)}.${exp}.${sign(site, id, exp)}`, { httpOnly: true, sameSite: 'lax', path: '/', maxAge: SESSION_SECONDS, secure: process.env.NODE_ENV === 'production' });
  }
  else c.delete(name(site));
}

/** ログイン中のアカウントID（署名が合わない・ないときは null） */
export async function sessionId(site: Site): Promise<string | null> {
  const v = (await cookies()).get(name(site))?.value;
  if (!v) return null;
  const parts = v.split('.');
  if (parts.length !== 3) return null;
  const exp = Number(parts[1]);
  if (!Number.isFinite(exp) || exp <= Date.now()) return null;
  let id: string;
  try { id = decodeURIComponent(parts[0]); } catch { return null; }
  const a = Buffer.from(parts[2]), b = Buffer.from(sign(site, id, exp));
  return a.length === b.length && timingSafeEqual(a, b) ? id : null;
}
