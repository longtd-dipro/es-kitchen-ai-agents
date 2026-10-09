import { ApiError } from '@/lib/api/errors';
import { defineArea, toDocs } from '@/lib/ops/core/area';
import { today } from '@/lib/supplier/dates';
import { altLateTrips } from '../alt';
import {
  addMove, altStockIn, BASES, honSchedule, impactsOf, incomingOf, knownOrders, materialDemand, materialStock, MOVES, poReceiving, receipt, receiptAlerts, receiptImpact, RECEIPTS, receive, resolveReceipt,
  stockAt, stockLedgers, type PoLike,
} from '../stock';
import type { Receipt, ReceiptFix, StockBase, StockMove } from '../types';

/*
 * 倉庫在庫・入荷（area: stock）。kind：dm.stock.bases（在庫の起点）／dm.stock.receipts（入荷の記録）／dm.stock.moves（在庫の記録）
 * 計算・決まりは lib/domain/stock.ts。運営の発注・入荷（lib/ops/areas/purchasing.ts）・代替品設定の在庫の見込み・資材の在庫が読む。
 */

/**
 * 見本：THOMAS の在庫（2026/09/30 棚卸し）、資材（ES事務所・関東・関西）、入荷の差異（対応待ち）1件。
 * 商品の数は、見本の便の予定（2026年12月サイクルまでの注文・代替品設定）と入荷予定（仕入先サイト・運営の発注）でデモの期間に
 * マイナスにならない数＋余り（1割・入り数で切り上げ）にした（シナリオ実行チェックリスト §1-3）。
 * チキンのチーズソテー（M003・11月の新商品）は 11月・12月の注文の分だけ持ち、代替品設定 ALT-2610-0001 の分は足りない
 * （シナリオ説明書 ⑦：不足分を追加発注）
 */
function seed() {
  const ON = '2026/09/30';
  const P: Record<string, string> = {
    WH00001: '001:48 002:48 003:36 004:6 005:96 006:24 007:18 008:90 009:36 010:6 011:90 012:8 013:96 014:132 015:108 016:72 017:108 018:80 019:30 020:18 021:120 022:120 023:60 024:80 025:24 026:30 027:18 029:20 031:8',
    WH00002: '001:72 002:42 003:42 004:3 005:72 006:24 008:39 009:24 010:3 011:50 012:8 013:72 014:96 015:84 017:72 018:48 019:37 021:28 022:48 023:47 025:24 026:18 029:6',
    WH00003: '001:36 005:36 006:9 008:24 011:8 013:36 014:24 015:36 018:27 019:21 021:36 022:21 023:26',
  };
  const bases: StockBase[] = Object.entries(P).flatMap(([wh, s]) => s.split(' ').map((x) => {
    const [n, q] = x.split(':');
    return { id: `${wh}|M${n}`, warehouseId: wh, itemId: `M${n}`, item: '商品' as const, qty: Number(q), on: ON, minQty: 0 };
  }));
  /* 資材：[資材ID, ES事務所の数, しきい値, 関東, 関西] */
  const M: [string, number, number, number, number][] = [
    ['S001', 400, 100, 300, 200], ['S002', 60, 50, 100, 0], ['S003', 60, 50, 100, 0], ['S004', 80, 50, 0, 0], ['S005', 40, 50, 0, 0],
    ['S006', 60, 50, 0, 0], ['S007', 300, 100, 200, 100], ['S008', 80, 50, 0, 0], ['S009', 80, 50, 0, 0],
  ];
  for (const [id, es, min, kt, ks] of M) {
    bases.push({ id: `WH00004|${id}`, warehouseId: 'WH00004', itemId: id, item: '資材', qty: es, on: ON, minQty: min });
    if (kt) bases.push({ id: `WH00001|${id}`, warehouseId: 'WH00001', itemId: id, item: '資材', qty: kt, on: ON, minQty: Math.round(min / 2) });
    if (ks) bases.push({ id: `WH00002|${id}`, warehouseId: 'WH00002', itemId: id, item: '資材', qty: ks, on: ON, minQty: Math.round(min / 2) });
  }
  const receipts: Receipt[] = [{
    id: 'RC-PO-202610-M002-KA2-1', poNo: 'PO-202610-M002-KA2', part: 1, supplierId: 'SP00002', itemId: 'M002', item: '商品', warehouseId: 'WH00001', ym: '2026-10',
    planQty: 8, planBox: 1, qty: 6, box: 1, receivedOn: '2026/10/05', bb: '', note: '箱の中が6個（仕入先に確認中）', status: '差異あり・対応待ち', by: 'Ad00010', at: '2026/10/05 09:40',
  }];
  /* 在庫の記録（運営の倉庫在庫の見本 purchasing.stockRecs の WR00001〜WR00003 を移したもの） */
  const mv = (id: string, warehouseId: string, itemId: string, on: string, kind: string, qty: number, reason: string, by: string): StockMove =>
    ({ id, warehouseId, itemId, item: '商品', on, kind, qty, reason, by, at: `${on} 10:00` });
  const moves: StockMove[] = [
    mv('SM-261002-0001', 'WH00001', 'M002', '2026/10/02', 'NG品ロス', -10, 'ピッキング前の検品で容器の破損（10食）。別保管', '後藤（運営）'),
    mv('SM-261003-0001', 'WH00001', 'M005', '2026/10/03', '再送', -2, 'ヤマトの行方不明分を再送（配送データを複製）', '大田（運営）'),
    mv('SM-261003-0002', 'WH00002', 'M021', '2026/10/03', '棚卸し差異', 3, '9/30 棚卸しの数え直し（関西倉庫から連絡）', '後藤（運営）'),
  ];
  return { [BASES]: toDocs(bases), [RECEIPTS]: toDocs(receipts), [MOVES]: toDocs(moves) };
}

export default defineArea({
  name: 'stock',
  seed,
  queries: {
    /** 入荷の記録（発注・状態で絞る） */
    receipts: (r, a?: { poNo?: string; status?: Receipt['status'] }) =>
      r.list<Receipt>(RECEIPTS).filter((x) => (!a?.poNo || x.poNo === a.poNo) && (!a?.status || x.status === a.status)),
    /**
     * 運営の TOP・発注の一覧のアラート（差異あり・対応待ち・分納の予定日を過ぎた）。
     * altLate＝仕入先の回答の入荷予定日が、入荷を待って回した便の出荷に間に合わない（課題 4a-10。便は自動で動かさない）
     */
    alerts: (r, a?: { today?: string }) => {
      /* count は入荷の差異だけ（入荷登録の画面の件数）。altLate は別に数える */
      return { ...receiptAlerts(r, a?.today ?? today()), altLate: altLateTrips(r, a?.today ?? today()) };
    },
    /**
     * 入荷の登録の画面：渡した発注（運営の発注一覧）ごとの入荷の状況（入った数・残り・閉じたか・分納の次の予定日）と、
     * 差異あり・対応待ちの入荷の影響（法人の注文・便）
     */
    receiving: (r, a: { orders: PoLike[] }) => a.orders.filter((o) => o.hon > 0 && !['キャンセル', '受注不可'].includes(o.ans)).map((o) => {
      const st = poReceiving(r, o);
      const pending = st.receipts.find((x) => x.status === '差異あり・対応待ち');
      return { no: o.no, ...st, impact: pending ? receiptImpact(r, pending, o) : null };
    }),
    /** 差異の影響（不足の数・影響する便） */
    impact(r, a: { id: string; po?: PoLike }) {
      const rc = receipt(r, a.id);
      return receiptImpact(r, rc, a.po);
    },
    /** 不足の影響の見込み（入荷を記録する前の確認） */
    preview: (r, a: { itemId: string; warehouseId: string; short: number; from: string; deliverFrom?: string; deliverTo?: string }) => impactsOf(r, a),
    /** 倉庫在庫（倉庫・品目で絞る。day の日の終わり） */
    levels: (r, a?: { warehouseId?: string; itemId?: string; day?: string }) =>
      r.list<StockBase>(BASES).filter((b) => (!a?.warehouseId || b.warehouseId === a.warehouseId) && (!a?.itemId || b.itemId === a.itemId))
        .map((b) => stockAt(r, b.warehouseId, b.itemId, a?.day ?? today())),
    /** 1つの倉庫×品目の在庫と入荷予定（発注は渡した発注＋共通 DB の発注＋運営の発注・knownOrders） */
    level: (r, a: { warehouseId: string; itemId: string; orders?: PoLike[]; day?: string }) => ({
      ...stockAt(r, a.warehouseId, a.itemId, a.day ?? today()), incoming: incomingOf(r, a.warehouseId, a.itemId, knownOrders(r, a.orders)),
    }),
    /** 代替品設定の在庫の見込み（倉庫ごとの 在庫−これからの出荷・入荷予定。発注は knownOrders・追加発注は入れない） */
    altStock: (r, a: { productId: string; orders?: PoLike[] }) => altStockIn(r, a.productId, knownOrders(r, a.orders)),
    /** 資材の在庫（すべてのピッキング倉庫・ES事務所）と在庫不足 */
    materials: (r, a?: { orders?: PoLike[] }) => materialStock(r, knownOrders(r, a?.orders)),
    /** 資材注文の需要（倉庫×資材：受けて未出荷・直近28日の数）。資材発注の目安に使う */
    materialDemand: (r) => materialDemand(r),
    /** 倉庫在庫の見込み（倉庫×品目の出し入れの明細・今日の在庫・足りなくなる日。運営の倉庫在庫・発注一覧） */
    ledger: (r, a?: { warehouseId?: string; itemId?: string; item?: '商品' | '資材'; orders?: PoLike[]; day?: string }) => stockLedgers(r, a ?? {}),
    /** 仮発注・本発注（前半・後半）の時期 */
    honSchedule: (r, a: { cycleMonth: string }) => honSchedule(r, a.cycleMonth),
    moves: (r, a?: { warehouseId?: string; itemId?: string }) => r.list<StockMove>(MOVES).filter((x) => (!a?.warehouseId || x.warehouseId === a.warehouseId) && (!a?.itemId || x.itemId === a.itemId)),
  },
  actions: {
    /** 入荷を記録する（運営）。発注の数と違えば 差異あり・対応待ち */
    receive: (r, a: { po?: PoLike; poNo: string; qty: number; box: number; receivedOn: string; bb?: string; note?: string; by: string }) => receive(r, a),
    /** 入荷の差異の対応を決める（分納を待つ／代替品で対応／不足を受け入れる／多い分を受け入れる） */
    resolve: (r, a: { id: string; how: ReceiptFix; note?: string; nextOn?: string; altId?: string; po?: PoLike; by: string; notify?: boolean; payBasis?: '発注数' | '入荷数' }) => resolveReceipt(r, a),
    /** 在庫の記録を足す */
    addMove: (r, a: Omit<StockMove, 'id' | 'at' | 'item'>) => addMove(r, a),
    /** 在庫の起点（棚卸しの数）・在庫不足のしきい値を入れる */
    setBase(r, a: { warehouseId: string; itemId: string; qty?: number; on?: string; minQty?: number }) {
      if (!r.get('dm.master.warehouses', a.warehouseId)) throw new ApiError('倉庫が見つかりません', 404);
      const id = `${a.warehouseId}|${a.itemId}`;
      const cur = r.get<StockBase>(BASES, id);
      const item = /^S\d+/.test(a.itemId) ? '資材' as const : '商品' as const;
      if (!r.get(item === '資材' ? 'dm.master.materials' : 'dm.master.products', a.itemId)) throw new ApiError('品目が見つかりません', 404);
      if ([a.qty, a.minQty].some((v) => v !== undefined && !(Number.isInteger(v) && v >= 0))) throw new ApiError('数は0以上の整数で入れてください', 400);
      const next: StockBase = {
        id, warehouseId: a.warehouseId, itemId: a.itemId, item, qty: a.qty ?? cur?.qty ?? 0, on: a.on ?? cur?.on ?? today(), minQty: a.minQty ?? cur?.minQty ?? 0,
      };
      r.put(BASES, id, next);
      return next;
    },
  },
});
