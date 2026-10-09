import { ApiError } from '@/lib/api/errors';
import { defineArea, toDocs, type DocRepo } from '@/lib/ops/core/area';
import { SAMPLE_QUOTAS, SAMPLES, WEEK_CLOSES } from '../seed/sample';
import type { Product, SalesSample, SampleQuota, SampleWeekClose, Warehouse } from '../types';

/*
 * 営業サンプル（area: sample）。kind：dm.sample.samples／dm.sample.weekCloses／dm.sample.quotas。
 * 運営の 発注・入荷 ＞ 営業サンプル と メニュー管理 ＞ 月間メニュー（件数）が同じデータを読む。
 *   list      営業サンプル（ym で絞る）
 *   quotas    月の件数（サイクル月 → 件数）
 *   add       登録（倉庫ごとに分けた行をまとめて。商品・倉庫を確かめ、月の件数を超えると 409）
 *   closeWeek 出荷週の受付を締める（受付済に出荷指示 SS-YYMMDD-倉庫の記号 を付ける）
 *   reopenWeek 締めの取消（その週の最初の発送日の前日まで。締め済は受付済に戻し出荷指示を消す。締め後追加はそのまま。2026-10-08 台帳 F）
 *   setQuota  月の件数（0〜999）
 */

const K = { samples: 'dm.sample.samples', weeks: 'dm.sample.weekCloses', quotas: 'dm.sample.quotas' } as const;

/** 出荷指示の番号に使う倉庫の記号 */
export const SAMPLE_WH_CODE: Record<string, string> = { WH00001: 'K', WH00002: 'W', WH00003: 'C' };
export const sampleShipOrder = (week: string, warehouseId: string) => 'SS-' + week.slice(2).replace(/-/g, '') + '-' + (SAMPLE_WH_CODE[warehouseId] || 'X');

const quotas = (r: DocRepo) => Object.fromEntries(r.list<SampleQuota>(K.quotas).map((q) => [q.id, q.n])) as Record<string, number>;
/** その月の件数（宛先1件＝base 1つ。倉庫で分けた行は1件と数える） */
export const usedOf = (rows: SalesSample[], ym: string) => new Set(rows.filter((x) => x.ym === ym).map((x) => x.base)).size;

export default defineArea({
  name: 'sample',
  seed: () => ({
    [K.samples]: toDocs(SAMPLES),
    [K.weeks]: toDocs(WEEK_CLOSES),
    [K.quotas]: toDocs(SAMPLE_QUOTAS),
  }),
  queries: {
    list: (r, a?: { ym?: string }) => r.list<SalesSample>(K.samples).filter((x) => !a?.ym || x.ym === a.ym),
    weekCloses: (r) => r.list<SampleWeekClose>(K.weeks),
    quotas: (r) => quotas(r),
    quota: (r, { ym }: { ym: string }) => quotas(r)[ym] ?? null,
  },
  actions: {
    add: (r, { rows }: { rows: SalesSample[] }) => {
      if (!rows.length) throw new ApiError('登録する行がありません', 400);
      for (const x of rows) {
        if (r.get(K.samples, x.id)) throw new ApiError(`${x.id} はもうあります`, 409);
        const w = r.get<Warehouse>('dm.master.warehouses', x.warehouseId);
        if (!w || w.type !== 'picking') throw new ApiError(`ピッキング倉庫 ${x.warehouseId} がありません`, 400);
        for (const it of x.items) if (!r.get<Product>('dm.master.products', it.productId)) throw new ApiError(`商品 ${it.productId} がありません`, 400);
      }
      const all = r.list<SalesSample>(K.samples);
      for (const ym of new Set(rows.map((x) => x.ym))) {
        const q = quotas(r)[ym];
        const used = usedOf([...all, ...rows], ym);
        if (q != null && used > q) throw new ApiError(`${ym.slice(0, 4)}年${Number(ym.slice(5))}月の営業サンプル枠を超えるため登録できません（残り枠 0件）`, 409);
      }
      rows.forEach((x) => r.put<SalesSample>(K.samples, x.id, x));
      return rows;
    },
    closeWeek: (r, { mon, at, by }: { mon: string; at: string; by: string }) => {
      if (r.get(K.weeks, mon)) throw new ApiError('この出荷週はすでに締めています', 409);
      r.put<SampleWeekClose>(K.weeks, mon, { id: mon, at, by });
      const rs = r.list<SalesSample>(K.samples).filter((x) => x.week === mon && x.status === '受付済');
      rs.forEach((x) => r.put<SalesSample>(K.samples, x.id, { ...x, status: '締め済', shipOrder: sampleShipOrder(mon, x.warehouseId) }));
      return rs.length;
    },
    reopenWeek: (r, { mon, today }: { mon: string; today: string }) => {
      if (!r.get(K.weeks, mon)) throw new ApiError('この出荷週は締めていません', 409);
      const all = r.list<SalesSample>(K.samples).filter((x) => x.week === mon);
      const first = all.map((x) => x.ship).sort()[0];
      if (first && today >= first) throw new ApiError('最初の発送日を過ぎたため、締めは取り消せません', 409);
      r.remove(K.weeks, mon);
      const rs = all.filter((x) => x.status === '締め済');
      rs.forEach((x) => r.put<SalesSample>(K.samples, x.id, { ...x, status: '受付済', shipOrder: '' }));
      return rs.length;
    },
    /** 登録後に直せるのはメモと送り状番号だけ（2026-10-08 台帳 F）。メモ＝500文字まで、送り状番号＝半角英数字とハイフン30文字まで（空も可） */
    update: (r, { id, memo, trackingNo, at, by }: { id: string; memo: string; trackingNo: string; at?: string; by?: string }) => {
      const x = r.get<SalesSample>(K.samples, id);
      if (!x) throw new ApiError(`営業サンプル ${id} がありません`, 404);
      if (String(memo ?? '').length > 500) throw new ApiError('メモは500文字以内で入力してください', 400);
      if (!/^[0-9A-Za-z-]{0,30}$/.test(trackingNo ?? '')) throw new ApiError('送り状番号は半角英数字とハイフンで30文字以内にしてください', 400);
      const nm = String(memo ?? '').trim(), nt = trackingNo ?? '';
      /* 変わった項目だけ履歴に足す（日時・変更した人・項目・変更前→後。2026-10-08 台帳 F） */
      const add = [['メモ', x.memo ?? '', nm], ['送り状番号', x.trackingNo ?? '', nt]].filter(([, b, a]) => b !== a)
        .map(([field, before, after]) => ({ at: at ?? '', by: by ?? '', field, before, after }));
      r.put<SalesSample>(K.samples, id, { ...x, memo: nm, trackingNo: nt, history: [...(x.history ?? []), ...add] });
    },
    setQuota: (r, { ym, n }: { ym: string; n: number }) => {
      if (!/^\d{4}-\d{2}$/.test(ym)) throw new ApiError('サイクル月が正しくありません', 400);
      if (!Number.isInteger(n) || n < 0 || n > 999) throw new ApiError('0〜999 の数字を入れてください', 400);
      r.put<SampleQuota>(K.quotas, ym, { id: ym, n });
    },
  },
});
