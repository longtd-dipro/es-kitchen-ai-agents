import { ApiError } from '@/lib/api/errors';
import { service } from './supplierRepo';
import { beforeApi } from './daily';
import { getDb } from './db';
import { sqliteDocRepo } from './docs';
import { sessionId, setSession } from './session';
import type { Account } from '@/lib/domain/types';

/* app/api の Route Handler の共通処理 */

/** 結果を JSON で返す。ApiError はその status、それ以外は 500 */
export async function handle(fn: () => unknown | Promise<unknown>): Promise<Response> {
  try {
    /* デモの「今日」を読み直し、日付が変わっていたら日次バッチ（lib/server/daily.ts） */
    beforeApi();
    const out = await fn();
    return out === undefined ? new Response(null, { status: 204 }) : Response.json(out);
  } catch (e) {
    if (e instanceof ApiError) return Response.json({ message: e.message, ...(e.code ? { code: e.code } : {}) }, { status: e.status ?? 400 });
    console.error('[api]', e);
    return Response.json({ message: 'サーバーでエラーが起きました' }, { status: 500 });
  }
}

export const body = <T,>(req: Request) => req.json().catch(() => ({})) as Promise<T>;

/* ===== 仕入先のログイン（署名付きの Cookie：lib/server/session.ts） ===== */

export async function setSupplierSession(id: string | null) {
  await setSession('supplier', id);
}

/** ログイン中の仕入先（止めたアカウントは不可）。id を渡したら、その仕入先本人かも確かめる */
export async function requireSupplier(id?: string) {
  const me = await sessionId('supplier');
  const acc = me ? sqliteDocRepo(getDb()).get<Account>('dm.account.accounts', me) : undefined;
  if (!me || !acc || acc.site !== 'supplier' || !['有効', '発行済（ログイン前）', '参照のみ'].includes(acc.status)) throw new ApiError('ログインしてください', 401);
  if (id && id !== me) throw new ApiError('この仕入先のデータは見られません', 403);
  return me;
}

/** 発注がログイン中の仕入先のものか確かめる */
export async function requireOwnOrder(no: string) {
  const me = await requireSupplier();
  const o = service().listOrders(me).find((x) => x.no === no);
  if (!o) throw new ApiError(`発注が見つかりません（${no}）`, 404);
  return me;
}
