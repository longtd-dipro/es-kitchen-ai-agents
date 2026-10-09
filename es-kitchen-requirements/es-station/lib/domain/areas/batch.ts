import { ApiError } from '@/lib/api/errors';
import { defineArea } from '@/lib/ops/core/area';
import { today } from '@/lib/supplier/dates';
import { BATCH, batchState, catchUp, runDaily, type BatchRun, type DemoSetting } from '../batch';

/*
 * 日次バッチ（area: batch・lib/domain/batch.ts）。画面はない（2026/10/03 決定）。kind：dm.batch.state／dm.batch.runs／dm.demo.settings
 *   daily：1日ぶん（同じ日は2回動かさない）。catchUp：前回の日の翌日〜to。サーバーは日付の変わった最初の API で catchUp する（lib/server/daily.ts）
 *   今日より先の日は動かさない。デモの「今日」を変えるのは /api/demo/today（デモのビルドのときだけ・lib/domain/batch.ts の setDemoDay）
 */
/** 今日より先の日は動かさない（先の日の処理を先に済ませてしまわないように） */
const notAhead = (d?: string) => {
  if (d && d > today()) throw new ApiError(`今日（${today()}）より先の日は動かせません`, 400);
  return d;
};

export default defineArea({
  name: 'batch',
  seed: () => ({}),
  queries: {
    /** 状態（最後に動かした日）とデモの「今日」 */
    state: (r) => ({ state: batchState(r) ?? null, demo: r.get<DemoSetting>(BATCH.demo, 'today') ?? null }),
    /** 実行の記録（新しい順。limit で件数） */
    runs: (r, a?: { limit?: number }) => r.list<BatchRun>(BATCH.runs).sort((x, y) => y.id.localeCompare(x.id)).slice(0, a?.limit ?? 60),
  },
  actions: {
    daily: (r, a?: { date?: string }) => runDaily(r, { date: notAhead(a?.date), trigger: 'manual' }),
    catchUp: (r, a?: { to?: string }) => catchUp(r, { to: notAhead(a?.to), trigger: 'manual' }),
  },
});
