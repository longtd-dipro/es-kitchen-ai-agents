import { ApiError } from '@/lib/api/errors';
import { defineArea } from '@/lib/ops/core/area';
import { addPriceGen, BULK, bulkCycles, bulkPreview, bulkStart, bulkStep, CONFIRM_OVER, correctPriceGen, deletePriceGen, leg1Carriers, priceGenUse, STEP_SIZE, updatePriceGen, type BulkArgs } from '../bulk';
import type { BulkChange, Plan } from '../types';

/*
 * 契約の一括変更（area: bulk・課題 7-2）。kind：dm.bulk.changes（一括変更の履歴・進み具合）。決まりは lib/domain/bulk.ts。
 * 画面：運営の倉庫マスタ・委託配送先マスタ・プランマスタのモーダル（app/ops/_ui/BulkChangeModal.tsx）
 *   preview → start（記録して実行中）→ step を繰り返す（進み具合のバー）→ 完了（結果の一覧）
 */
export default defineArea({
  name: 'bulk',
  seed: () => ({ [BULK]: [] }),
  queries: {
    /** 適用開始の候補（未確定の子契約があるサイクル月） */
    cycles: (r) => bulkCycles(r),
    /** 絞り込みに合う契約と、選んだ契約の影響（子契約・配送・注文・発注・委託配送先・請求） */
    preview: (r, a: BulkArgs | null) => (a?.mode ? bulkPreview(r, a) : null),
    /** 一括変更の履歴（新しい順。source・sourceId で絞る） */
    history: (r, a?: { source?: BulkChange['source']; sourceId?: string }) =>
      r.list<BulkChange>(BULK).filter((x) => (!a?.source || x.source === a.source) && (!a?.sourceId || x.sourceId === a.sourceId))
        .sort((x, y) => y.at.localeCompare(x.at) || y.id.localeCompare(x.id)),
    get: (r, a: { id: string }) => {
      const x = r.get<BulkChange>(BULK, a.id);
      if (!x) throw new ApiError(`一括変更が見つかりません（${a.id}）`, 404);
      return x;
    },
    /** プランの価格世代 */
    priceGens: (r, a: { planId: string } | null) => {
      if (!a?.planId) return null;
      const p = r.get<Plan>('dm.master.plans', a.planId);
      if (!p) throw new ApiError(`プラン ${a.planId} がありません`, 404);
      /* 世代ごとに 使っている子契約の数・直せるか（課題 4b-9） */
      return { planId: p.id, name: p.name, base: p.prices, gens: priceGenUse(r, p) };
    },
    limits: () => ({ confirmOver: CONFIRM_OVER, stepSize: STEP_SIZE }),
    /** 中継があるときの区間1（倉庫→中継）に選べる運び手（中継を運営する会社・委託配送会社。課題 4b-7） */
    leg1Carriers: (r, a: { hubId: string }) => (a?.hubId ? leg1Carriers(r, a.hubId) : []),
  },
  actions: {
    /** 一括変更を始める（100件を超えたら confirmCount＝件数が要る。注意（出荷禁止日・リードタイム）があれば ackAlerts＝SA が確かめた） */
    start: (r, a: Parameters<typeof bulkStart>[1]) => bulkStart(r, a),
    /** 一括変更を進める（n 件ずつ） */
    step: (r, a: { id: string; n?: number }) => bulkStep(r, a),
    /** プランマスタ：価格世代を足す（適用開始・コースごとの月額） */
    addPriceGen: (r, a: Parameters<typeof addPriceGen>[1]) => addPriceGen(r, a),
    /** 使っていない世代を直す・消す（使っている世代・期間が終わった世代は 409） */
    updatePriceGen: (r, a: Parameters<typeof updatePriceGen>[1]) => updatePriceGen(r, a),
    deletePriceGen: (r, a: Parameters<typeof deletePriceGen>[1]) => deletePriceGen(r, a),
    /** 誤りの訂正：使っている世代の金額を直す（理由が要る・未確定の子契約の ① 費目を作り直す） */
    correctPriceGen: (r, a: Parameters<typeof correctPriceGen>[1]) => correctPriceGen(r, a),
  },
});
