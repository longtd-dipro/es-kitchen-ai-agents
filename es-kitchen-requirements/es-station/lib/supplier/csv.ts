import { honVisible } from './orders';
import type { Order } from './types';

/** 発注明細の CSV の列 */
export const ORDERS_CSV_HEAD = ['発注番号', '種類', '品番', '商品名', '納入倉庫', '入荷希望日', '数量', '区分', 'ステータス', '出荷予定日', '納品日', '入荷箱数', '出荷日', '送り状番号'];

/** 発注明細の行（入荷希望日で絞り込む）。保存は共通の CSV の仕組み（components/csv/api.ts の runCsvExport） */
export function ordersCsvRows(mine: Order[], from: string, to: string, pid: string): string[][] {
  const rows: string[][] = [];
  mine.forEach((o) =>
    o.rows.forEach((r) => {
      if (r.wish < from || r.wish > to || (pid && o.pid !== pid)) return;
      rows.push([
        o.no, o.type, o.pid, o.name, o.wh, r.wish, r.qty, honVisible(o) ? '本発注' : '仮発注', o.ans, o.eta,
        (o.parts ?? []).map((x) => (x.dlv ?? '').replace(/\//g, '-')).join(';'),
        (o.parts ?? []).reduce((a, x) => a + (+(x.box ?? 0) || 0), 0) || '',
        o.ship, o.slip,
      ].map((v) => String(v ?? '')));
    }),
  );
  return rows;
}
