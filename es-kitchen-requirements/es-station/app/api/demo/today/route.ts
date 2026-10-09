import { ApiError } from '@/lib/api/errors';
import { DEMO } from '@/lib/demo';
import { BATCH, batchState, setDemoDay, type DemoSetting } from '@/lib/domain/batch';
import { bumpVersion, getDb } from '@/lib/server/db';
import { sqliteDocRepo } from '@/lib/server/docs';
import { ensureDomainDocs } from '@/lib/server/domainSeed';
import { body, handle } from '@/lib/server/http';
import { today } from '@/lib/supplier/dates';

/*
 * デモの「今日」（DEMO 帯の日付）。デモのビルド（NEXT_PUBLIC_DEMO=1）のときだけ。本番・開発では 404。
 *   GET：いまの「今日」・.env の日付（NEXT_PUBLIC_FIXED_TODAY）・日次バッチの最後の日
 *   POST { date: 'YYYY/MM/DD' | '' }：「今日」を変える。先へ進めたら間の日の日次バッチを1日ずつ動かす（lib/domain/batch.ts の setDemoDay）。'' で .env の日付に戻す
 */
const guard = () => { if (!DEMO) throw new ApiError('デモのビルドだけで使えます', 404); };

export const GET = () => handle(() => {
  guard();
  const db = getDb();
  const repo = sqliteDocRepo(db);
  return { today: today(), env: process.env.NEXT_PUBLIC_FIXED_TODAY ?? '', demo: repo.get<DemoSetting>(BATCH.demo, 'today')?.today ?? '', lastRunDate: batchState(repo)?.lastRunDate ?? '' };
});

export async function POST(req: Request) {
  const { date } = await body<{ date?: string }>(req);
  return handle(() => {
    guard();
    const db = getDb();
    ensureDomainDocs(db);
    return db.transaction(() => {
      const out = setDemoDay(sqliteDocRepo(db), { date: date ?? '' });
      bumpVersion(db);
      return out;
    })();
  });
}
