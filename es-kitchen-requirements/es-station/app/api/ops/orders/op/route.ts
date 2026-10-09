import { body, handle } from '@/lib/server/http';
import type { OpsOp } from '@/lib/supplier/types';
import { getDb } from '@/lib/server/db';
import { sqliteDocRepo } from '@/lib/server/docs';
import { supplierOrderNotices } from '@/lib/domain/mails';
import { requireOps } from '@/lib/server/access';
import { orderOpRule } from '@/lib/ops/apiPerm';
import { opsOrderService } from '../_repo';

/* 運営Web（発注・入荷）：発注の書き換え（仮発注・本発注・キャンセル・代理入力など）。中身は lib/supplier/service.ts の runOps */
/* 仮発注・本発注は仕入先へ通知（共通データの通知。lib/domain/mails.ts） */
export const POST = (req: Request) => handle(async () => {
  const op = await body<OpsOp>(req);
  /* 入荷＝入荷管理の「入荷」、本発注・キャンセル＝発注管理の「本発注・キャンセル」、ほか＝発注管理の作成・編集（lib/ops/apiPerm.ts） */
  await requireOps(req, sqliteDocRepo(getDb()), ...orderOpRule(op.op));
  const out = opsOrderService().runOps(op);
  supplierOrderNotices(sqliteDocRepo(getDb()), op, out);
  return out;
});
