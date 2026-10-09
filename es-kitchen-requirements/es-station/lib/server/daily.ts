import { DEMO } from '@/lib/demo';
import { catchUp, BATCH, SCHEDULED, type BatchState, type DemoSetting } from '@/lib/domain/batch';
import { setDemoToday, today } from '@/lib/supplier/dates';
import { bumpVersion, getDb } from './db';
import { sqliteDocRepo } from './docs';
import { ensureDomainDocs } from './domainSeed';

/*
 * API の前に毎回（lib/server/http.ts の handle）：
 *   1. デモのビルド（NEXT_PUBLIC_DEMO=1）なら、共通 DB のデモの「今日」（dm.demo.settings）を today() に入れる（本番・開発では入れない）
 *   2. 日付が変わっていたら日次バッチ（lib/domain/batch.ts）を前回の日の翌日〜今日まで動かす（1日1回・何度呼んでも同じ）
 * 日次バッチが失敗しても API は止めない（ログに出して、次の API でまた試す）
 */

const row = <T,>(kind: string, id: string): T | undefined => {
  const x = getDb().prepare('SELECT data FROM docs WHERE kind = ? AND id = ?').get(kind, id) as { data: string } | undefined;
  return x ? (JSON.parse(x.data) as T) : undefined;
};

/** デモの「今日」を共通 DB から読み直す（デモのビルドのときだけ） */
export function syncDemoToday() {
  if (!DEMO) return;
  setDemoToday(row<DemoSetting>(BATCH.demo, 'today')?.today ?? '');
}

export function beforeApi() {
  try {
    syncDemoToday();
    /* 本番（BATCH_SCHEDULER=1）はスケジューラが 0:00・9:00 に動かす（app/api/batch/run）。最初のアクセスでは動かさない。デモは今のまま */
    if (SCHEDULED && !DEMO) return;
    const t = today();
    const st = row<BatchState>(BATCH.state, 'state');
    if (st && st.lastRunDate >= t) return;
    const db = getDb();
    ensureDomainDocs(db);
    db.transaction(() => {
      const out = catchUp(sqliteDocRepo(db), { to: t, trigger: 'auto' });
      if (out.ran.length) bumpVersion(db);
    })();
  } catch (e) {
    console.error('[daily]', e);
  }
}
