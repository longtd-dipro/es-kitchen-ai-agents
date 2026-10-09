import type { DocRepo } from '@/lib/ops/core/area';
import { ALT_POS, ALTS } from './alt';
import report, { firstStockPending } from './areas/report';
import { today } from '@/lib/supplier/dates';
import { altStockIn, BASES, incomingOf, knownOrders, materialStock, MOVES, poReceiving, RECEIPTS, shippedOf, SPLIT_MAX, stockAt, stockLedgers, type PoLike } from './stock';
import type { AltPo, AltSetting, Branch, DeliveryLine, MaterialOrder, ProductOrder, Receipt, StockBase, StockMove, StockCheck, Delivery } from './types';

/*
 * check.run の続き：倉庫在庫・入荷・棚卸なし（area: stock・課題 2-1・2-3・2-5・2c の残り）。
 * 入荷の記録の回・状態・差異の対応（分納・代替品・不足の ③ 除外の行）、追加発注の入荷予定日（仕入先の回答）と入荷済、在庫の起点・記録、資材は食品の便に入れない
 */
export const STOCK_COUNT_KINDS = [BASES, RECEIPTS, MOVES];

export function stockProblems(r: DocRepo): string[] {
  const p: string[] = [];
  const need = (cond: boolean, msg: string) => { if (!cond) p.push(msg); };
  const has = (kind: string, id: string) => !!id && !!r.get(kind, id);
  const itemOk = (id: string) => has(/^S\d+/.test(id) ? 'dm.master.materials' : 'dm.master.products', id);
  const rs = r.list<Receipt>(RECEIPTS);
  const orders = r.list<ProductOrder>('dm.order.orders');
  const alts = r.list<AltSetting>(ALTS);

  /* 入荷の記録 */
  for (const x of rs) {
    need(x.id === `RC-${x.poNo}-${x.part}`, `入荷 ${x.id} の ID の形が違う（RC-<発注番号>-<回>）`);
    need(has('dm.master.warehouses', x.warehouseId), `入荷 ${x.id} の倉庫 ${x.warehouseId} がない`);
    need(itemOk(x.itemId), `入荷 ${x.id} の品目 ${x.itemId} がない`);
    need(x.part >= 1 && x.part <= SPLIT_MAX, `入荷 ${x.id} の回が 1〜${SPLIT_MAX} でない`);
    need([x.qty, x.box, x.planQty].every((n) => Number.isInteger(n) && n >= 0), `入荷 ${x.id} の数・箱数が正しくない`);
    if (x.status === '一致') need(x.qty === x.planQty && !x.fix, `入荷 ${x.id} は一致なのに数が予定と違う・対応がある`);
    if (x.status === '差異あり・対応待ち') need(x.qty !== x.planQty && !x.fix, `入荷 ${x.id} は差異あり・対応待ちなのに数が予定と同じ・対応がある`);
    if (x.status === '対応済') {
      need(!!x.fix && x.qty !== x.planQty, `入荷 ${x.id} は対応済なのに対応がない・数が予定と同じ`);
      const f = x.fix;
      if (f?.how === '分納を待つ') need(!!f.nextOn && x.part < SPLIT_MAX && x.qty < x.planQty, `入荷 ${x.id} の分納（次の予定日・${SPLIT_MAX}回まで・不足）が合わない`);
      if (f?.how === '代替品で対応') need(alts.some((a) => a.id === f.altId && a.productId === x.itemId), `入荷 ${x.id} の代替品設定 ${f.altId} がない・商品が違う`);
      if (f?.how === '多い分を受け入れる') need(x.qty > x.planQty, `入荷 ${x.id} は多い分を受け入れたのに多くない`);
      if (f?.how === '不足を受け入れる') {
        need(x.qty < x.planQty, `入荷 ${x.id} は不足を受け入れたのに足りている`);
        const imp = (f.impacts ?? []).reduce((s, i) => s + i.qty, 0);
        need(imp <= x.planQty - x.qty, `入荷 ${x.id} の外した数（${imp}）が不足（${x.planQty - x.qty}）より多い`);
        const lines = orders.flatMap((o) => o.lines.filter((l) => l.shortId === x.id));
        need(lines.reduce((s, l) => s + l.qty, 0) === imp, `入荷 ${x.id} の外した数が注文の ③ 除外の行と合わない`);
        for (const i of f.impacts ?? []) need(orders.some((o) => o.id === i.orderId && o.lines.some((l) => l.shortId === x.id && l.slot === i.slot)), `入荷 ${x.id} の便 ${i.deliveryId} の除外の行が注文 ${i.orderId} にない`);
      }
    }
  }
  /* 発注ごとの回：1から続く・前の回は「分納を待つ」・次の回の予定＝前の回の残り */
  for (const no of [...new Set(rs.map((x) => x.poNo))]) {
    const mine = rs.filter((x) => x.poNo === no).sort((a, b) => a.part - b.part);
    mine.forEach((x, i) => {
      need(x.part === i + 1, `発注 ${no} の入荷の回が続いていない`);
      if (i < mine.length - 1) {
        need(x.fix?.how === '分納を待つ', `発注 ${no} の ${x.part}回目のあとに入荷があるのに分納を待っていない`);
        need(mine[i + 1].planQty === x.planQty - x.qty, `発注 ${no} の ${x.part + 1}回目の予定が前の回の残りと違う`);
      }
    });
  }
  /* 不足を受け入れて外した注文の行 */
  for (const o of orders) for (const l of o.lines.filter((x) => x.shortId)) {
    const x = rs.find((y) => y.id === l.shortId);
    need(!!x && x.fix?.how === '不足を受け入れる' && x.itemId === l.productId, `注文 ${o.id} の除外の行 ${l.productId} の入荷の記録 ${l.shortId} がない・不足を受け入れていない`);
  }
  const lines = r.list<DeliveryLine>('dm.delivery.lines');
  need(!lines.some((l) => l.kind === '除外'), '除外の行が配送の明細にある（入荷の不足）');

  /* 代替品の追加発注：仕入先の回答の入荷予定日・入荷済 */
  for (const x of r.list<AltPo>(ALT_POS)) {
    const o = x.order as { ans?: string; eta?: string; parts?: { eta?: string }[]; recv?: string };
    if (x.etaFrom === '仕入先の回答') {
      const etas = (o.parts ?? []).map((y) => y.eta ?? '').filter(Boolean).sort();
      need(['納期回答済', '出荷済'].includes(o.ans ?? '') && x.eta === (etas[etas.length - 1] || o.eta), `追加発注 ${x.id} の入荷予定日 ${x.eta} が仕入先の回答と違う`);
    }
    const st = poReceiving(r, { ...(x.order as unknown as PoLike), recv: '' });
    if (st.receipts.length && st.closed) need(o.recv === '入荷済', `追加発注 ${x.id} は入荷が終わったのに入荷済でない`);
  }

  /* 在庫の起点・記録 */
  for (const b of r.list<StockBase>(BASES)) {
    need(b.id === `${b.warehouseId}|${b.itemId}`, `在庫の起点 ${b.id} の ID の形が違う`);
    need(r.get<{ type: string }>('dm.master.warehouses', b.warehouseId)?.type === 'picking', `在庫の起点 ${b.id} の倉庫がピッキング倉庫でない`);
    need(itemOk(b.itemId) && b.item === (/^S\d+/.test(b.itemId) ? '資材' : '商品'), `在庫の起点 ${b.id} の品目がない・区分が違う`);
    need(Number.isInteger(b.qty) && b.qty >= 0 && Number.isInteger(b.minQty) && b.minQty >= 0, `在庫の起点 ${b.id} の数・しきい値が正しくない`);
  }
  for (const m of r.list<StockMove>(MOVES)) need(has('dm.master.warehouses', m.warehouseId) && itemOk(m.itemId) && m.qty !== 0 && !!m.reason, `在庫の記録 ${m.id} の倉庫・品目・数・理由が正しくない`);

  /* 資材は食品の便に入れない（資材便だけ・課題 2-5）。資材便は資材の注文の配送 */
  const ds = r.list<Delivery>('dm.delivery.deliveries');
  const food = new Set(ds.filter((d) => d.temp !== '資材').map((d) => d.id));
  need(!lines.some((l) => food.has(l.deliveryId) && /^S\d+/.test(l.productId)), '食品の便の明細に資材がある');
  for (const mo of r.list<MaterialOrder>('dm.delivery.materialOrders').filter((m) => m.deliveryId)) need(ds.find((d) => d.id === mo.deliveryId)?.temp === '資材', `資材の注文 ${mo.id} の配送が資材便でない`);

  /* 棚卸なしの拠点：督促（未申告の一覧）に出さない */
  const noCheck = new Set(r.list<Branch>('dm.org.branches').filter((b) => b.noStockCheck).map((b) => b.id));
  if (noCheck.size) need(!report.queries.stockDue(r).some((x) => noCheck.has(x.branchId)), '棚卸なしの拠点が未申告の一覧に出ている');

  /* 切り替えのときの最初の在庫（受付簿 No.134）：最初の棚卸報告の前の拠点は、理論在庫が 0 から始まる（前回の数がない）・棚卸が1つもない・棚卸なしの拠点は出ない */
  const pending = firstStockPending(r);
  const checked = new Set(r.list<StockCheck>('dm.report.stockChecks').map((c) => c.branchId));
  for (const b of pending) {
    need(!checked.has(b.id), `最初の棚卸報告の前の拠点 ${b.id} に棚卸がある`);
    need(!noCheck.has(b.id), `棚卸なしの拠点 ${b.id} が最初の棚卸報告の前の一覧に出ている`);
    need(report.queries.stockSheet(r, { branchId: b.id }).rows.every((x) => x.prev === 0), `最初の棚卸報告の前の拠点 ${b.id} の理論在庫が 0 から始まっていない（前回の数がある）`);
  }

  p.push(...ledgerProblems(r));
  return p;
}

/**
 * 倉庫在庫の見込み（stockLedgers）：運営の倉庫在庫・発注一覧・入荷登録・代替品設定・資材の在庫が同じ数を出すか。
 * 在庫がマイナスになるなら必ず「不足見込み」（shortDate）が付いている。発注は二重に数えない（同じ番号・追加発注）
 */
function ledgerProblems(r: DocRepo): string[] {
  const p: string[] = [];
  const need = (cond: boolean, msg: string) => { if (!cond) p.push(msg); };
  const day = today();
  const orders = knownOrders(r);
  need(new Set(orders.map((o) => o.no)).size === orders.length, '入荷予定に数える発注に同じ発注番号が2つある');
  const altNos = new Set(r.list<AltPo>(ALT_POS).map((x) => x.id));
  need(!orders.some((o) => altNos.has(o.no)), '代替品の追加発注が運営・共通 DB の発注と二重に数えられている');
  const ls = stockLedgers(r);
  const key = (wh: string, id: string) => `${wh}|${id}`;
  const by = new Map(ls.map((l) => [key(l.warehouseId, l.itemId), l]));
  for (const l of ls) {
    const id = key(l.warehouseId, l.itemId);
    need(l.now === stockAt(r, l.warehouseId, l.itemId, day).qty, `倉庫在庫 ${id} の今日の数（${l.now}）が stockAt と違う`);
    need(l.fin === l.base + l.inQ - l.outQ + l.moveQ && (l.rows.length ? l.rows[l.rows.length - 1].bal : l.base) === l.fin, `倉庫在庫 ${id} の見込み（${l.fin}）が 起点＋入荷−出荷±記録 と合わない`);
    const neg = l.now < 0 || l.rows.some((x) => x.date > day && x.bal < 0);
    need(neg === (l.shortDate !== null), `倉庫在庫 ${id} がマイナスになるのに不足見込みが付いていない（または逆）`);
    const inc = l.rows.filter((x) => x.kind === '入荷' && !x.done);
    need(new Set(inc.map((x) => x.ref)).size === inc.length, `倉庫在庫 ${id} の入荷予定に同じ発注が2回ある`);
    need(inc.reduce((s, x) => s + x.qty, 0) === incomingOf(r, l.warehouseId, l.itemId, orders).reduce((s, x) => s + x.qty, 0), `倉庫在庫 ${id} の入荷予定が入荷登録（incomingOf）と違う`);
  }
  /* 起点のある組み合わせは必ず出る・在庫の一覧（levels）と同じ */
  for (const b of r.list<StockBase>(BASES)) need(by.has(b.id), `在庫の起点 ${b.id} が倉庫在庫の見込みに出ていない`);
  /* 資材の在庫（運営の TOP・資材発注）と同じ */
  for (const m of materialStock(r, orders)) need(by.get(key(m.warehouseId, m.itemId))?.now === m.qty, `資材の在庫 ${m.warehouseId}|${m.itemId} が倉庫在庫の見込みと違う`);
  /* 代替品設定の在庫の見込み（今日の在庫−これからの出荷） */
  for (const pid of [...new Set(r.list<AltSetting>(ALTS).map((a) => a.altProductId))]) {
    for (const [wh, v] of Object.entries(altStockIn(r, pid, orders, day))) {
      const l = by.get(key(wh, pid));
      need(v.onHand === Math.max(0, (l?.now ?? 0) - shippedOf(r, wh, pid, day, '9999/12/31')), `代替品設定の在庫の見込み ${wh}|${pid} が倉庫在庫と違う`);
    }
  }
  return p;
}
