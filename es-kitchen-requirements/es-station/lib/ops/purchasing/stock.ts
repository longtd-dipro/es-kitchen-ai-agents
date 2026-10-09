import type { Ledger } from '@/lib/domain/stock';
import { mat, prod, SMP } from './master';
import type { StockRec, StockRet, StockState } from './types';

/*
 * 倉庫在庫（フェーズ2：見るだけ・記録するだけ）。正しい在庫は THOMAS（倉庫システム）。
 * 数は共通データの倉庫在庫（lib/domain/stock.ts の stockLedgers・dm.stock）：起点（THOMAS の棚卸し）＋入荷の記録＋入荷予定（発注の残り）−出荷（便の予定数）±在庫の記録。
 * 入荷登録・代替品設定の在庫の見込み・発注一覧の「倉庫（見込み）」と同じ数（引き当てない・止めない）。ここは画面の形に直すだけ
 */

export const WS_KINDS = ['NG品ロス', '棚卸し差異', '再送', '在庫戻し', 'ES外発注の入荷', 'その他'];
export const WS_DOWN = ['NG品ロス', '在庫戻し', '再送'];
export const WS_UP = ['ES外発注の入荷'];
export const wsDir = (k: string) => (WS_DOWN.includes(k) ? '減る' : WS_UP.includes(k) ? '増える' : '');
/** 出荷のリードタイム（倉庫ごと・決定 W4。表示だけ。出荷日は便の出荷日） */
export const wsLead = (wh: string) => SMP.lead[wh] || 1;
export const wsType = (short: boolean) => (short ? '短消費期限' : '通常');

export type WsEvent = { date: string; kind: string; qty: number; ref: string; done: boolean; note: string; rec?: { by: string }; bal?: number };
export type WsCalc = { wh: string; pid: string; base: number; inQ: number; outQ: number; recQ: number; fin: number; now: number; rows: WsEvent[]; shortDate: string | null; minV: number; minDate: string | null; active: boolean };
/** 倉庫在庫の画面のデータ（運営の領域 purchasing.stock） */
export type WsData = {
  state: StockState; recs: StockRec[]; rets: StockRet[]; rows: WsCalc[];
  /** 次のメニュー（今日のサイクルの次の月の共通データの月間メニュー）とその商品。在庫戻しの初期値（決定 W6）に使う */
  nextMenu?: { ym: string; ids: string[] };
};

/** 共通データの倉庫在庫の見込み → 画面の形（倉庫は名前・出荷はマイナス・在庫の記録は登録者つき） */
export function wsFromLedger(l: Ledger, nameOf: (by: string) => string = (x) => x): WsCalc {
  return {
    wh: l.warehouseName, pid: l.itemId, base: l.base, inQ: l.inQ, outQ: -l.outQ, recQ: l.moveQ, fin: l.fin, now: l.now,
    rows: l.rows.map(({ by, ...x }) => ({ ...x, rec: x.kind !== '入荷' && x.kind !== '出荷' ? { by: nameOf(by ?? '') } : undefined })),
    shortDate: l.shortDate, minV: l.minV, minDate: l.minDate, active: true,
  };
}
const empty = (wh: string, pid: string): WsCalc => ({ wh, pid, base: 0, inQ: 0, outQ: 0, recQ: 0, fin: 0, now: 0, rows: [], shortDate: null, minV: 0, minDate: null, active: false });

/** 出し入れか在庫のある 倉庫×商品 */
export const wsAll = (s: WsData) => s.rows;
export const wsCalc = (s: WsData, wh: string, pid: string) => s.rows.find((c) => c.wh === wh && c.pid === pid) ?? empty(wh, pid);
export const wsState = (c: WsCalc) => (c.shortDate ? '不足見込み' : c.fin > 0 ? '余り見込み' : '過不足なし');
/** 発注一覧に出す倉庫の見込み在庫（参考・全倉庫の合計といちばん早い不足の日） */
export function wsForPid(s: WsData, pid: string) {
  let fin = 0;
  let short: string | null = null;
  s.rows.filter((c) => c.pid === pid).forEach((c) => { fin += c.fin; if (c.shortDate && (!short || c.shortDate < short)) short = c.shortDate; });
  return { fin, short: short as string | null };
}

/* ===== 入荷の数の単位（入荷登録） ===== */
export const lotOf = (pid: string) => { const p = prod(pid); return p ? (p.short ? 12 : p.lot) : mat(pid)?.lot || 1; };
export const catOf = (pid: string) => (prod(pid)?.short ? '生鮮' : '冷蔵惣菜・常温品');
