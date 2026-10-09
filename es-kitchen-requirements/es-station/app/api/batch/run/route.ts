import { ApiError } from '@/lib/api/errors';
import { runDaily, type BatchPhase } from '@/lib/domain/batch';
import { bumpVersion, getDb } from '@/lib/server/db';
import { sqliteDocRepo } from '@/lib/server/docs';
import { ensureDomainDocs } from '@/lib/server/domainSeed';
import { body, handle } from '@/lib/server/http';

/*
 * スケジューラの入口（本番：0:00＝midnight、9:00＝morning。台帳 E「本番のバッチの動かし方」・受付簿 No.51）。
 *   POST { phase: 'midnight' | 'morning', date?: 'YYYY/MM/DD' }。ヘッダー x-batch-token ＝ 環境変数 BATCH_TOKEN（ないときは使えない＝404）。
 *   同じ日・同じ時刻は2回動かさない（skipped）。失敗した処理はシステム管理へ知らせる（lib/domain/batch.ts の runDaily）
 */
export async function POST(req: Request) {
  const token = process.env.BATCH_TOKEN;
  const a = await body<{ phase?: BatchPhase; date?: string }>(req);
  return handle(() => {
    if (!token) throw new ApiError('スケジューラの設定がありません', 404);
    if (req.headers.get('x-batch-token') !== token) throw new ApiError('トークンが違います', 403);
    if (a.phase !== 'midnight' && a.phase !== 'morning') throw new ApiError('phase は midnight か morning にしてください', 400);
    const db = getDb();
    ensureDomainDocs(db);
    return db.transaction(() => {
      const out = runDaily(sqliteDocRepo(db), { date: a.date, phase: a.phase, trigger: 'scheduler' });
      if (!out.skipped) bumpVersion(db);
      return out;
    })();
  });
}
