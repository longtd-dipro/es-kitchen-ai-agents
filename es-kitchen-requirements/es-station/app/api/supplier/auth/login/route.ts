import { ApiError } from '@/lib/api/errors';
import type { Account } from '@/lib/domain/types';
import { getDb } from '@/lib/server/db';
import { sqliteDocRepo } from '@/lib/server/docs';
import { body, handle, setSupplierSession } from '@/lib/server/http';
import { service } from '@/lib/server/supplierRepo';

/* 仕入先サイトのアカウント（共通データ dm.account.accounts）がない・止めた仕入先はログインできない（課題 11：承認でアカウントを発行する） */
const CAN_LOGIN: Account['status'][] = ['発行済（ログイン前）', '有効', '参照のみ'];

export const POST = (req: Request) =>
  handle(async () => {
    const { loginId, password } = await body<{ loginId: string; password: string }>(req);
    const out = service().login(loginId, password);
    const acc = sqliteDocRepo(getDb()).get<Account>('dm.account.accounts', out.supplierId);
    if (!acc || acc.site !== 'supplier' || !CAN_LOGIN.includes(acc.status)) throw new ApiError('ログインIDまたはパスワードが正しくありません', 401);
    await setSupplierSession(out.supplierId);
    return out;
  });
