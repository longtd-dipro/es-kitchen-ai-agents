import type { DocRepo } from '@/lib/ops/core/area';
import { addDays } from '@/lib/supplier/dates';
import { BULK } from './bulk';
import { MOVES } from './move';
import type { BulkChange, ChildContract, Cycle, Delivery, DeliveryMove, DeliveryReport, Holiday, Leg, Plan, Trouble, Warehouse } from './types';

/*
 * check.run の続き（課題 2-4 スケジュールの移動・4-1〜4-4 ドライバー・4-9 削除済・4-10 サイクル・7-2 一括変更・価格世代）。
 */
export const MOVE_COUNT_KINDS = [MOVES, BULK];

/** 移動で「お届けしない日（休日）」を確かめて動かした配送（check.run のお届けできる日の確認を飛ばす） */
export function holidayConfirmed(r: DocRepo, d: Pick<Delivery, 'moveId' | 'deliverOn'>) {
  if (!d.moveId) return false;
  const m = r.get<DeliveryMove>(MOVES, d.moveId);
  return !!m && m.confirmed.includes('休日') && m.to === d.deliverOn;
}

export function moveProblems(r: DocRepo): string[] {
  const p: string[] = [];
  const need = (cond: boolean, msg: string) => { if (!cond) p.push(msg); };
  const deliveries = r.list<Delivery>('dm.delivery.deliveries');
  const byId = new Map(deliveries.map((d) => [d.id, d]));
  const moves = r.list<DeliveryMove>(MOVES).sort((a, b) => a.id.localeCompare(b.id));

  /* 移動：配送がある・本発注の後は1便（同じ拠点・同じ日）で理由あり・トラブルの対応は理由あり・冷凍と冷蔵が一緒に動いた */
  for (const m of moves) {
    need(m.rows.length > 0 && m.rows.every((x) => byId.has(x.deliveryId)), `移動 ${m.id} の配送がない`);
    const units = new Set(m.rows.map((x) => `${x.branchId}|${x.fromDeliver}`));
    if (m.phase === '本発注後') need(units.size === 1 && !!m.reason.trim(), `移動 ${m.id} は本発注の後なのに複数の便・理由なし`);
    if (m.trouble || m.confirmed.includes('別のサイクル')) need(m.trouble && !!m.reason.trim(), `移動 ${m.id} は別のサイクルへの移動なのにトラブルの対応・理由がない`);
    need(m.rows.every((x) => x.toDeliver === m.to && Math.round((new Date(x.toDeliver).getTime() - new Date(x.toShip).getTime()) / 86400000) === Math.round((new Date(x.fromDeliver).getTime() - new Date(x.fromShip).getTime()) / 86400000)),
      `移動 ${m.id} のリードタイムが変わっている`);
    for (const x of m.rows) {
      const d = byId.get(x.deliveryId);
      if (!d || d.moveId !== m.id) continue;
      /* 同じ拠点・同じ日の冷凍・冷蔵の便（出荷の前）は同じ移動に入っている */
      const sib = deliveries.filter((y) => y.id !== d.id && y.branchId === d.branchId && y.cycleMonth === d.cycleMonth && y.parentId === d.parentId && y.moveId !== m.id
        && ['予定', '出荷待'].includes(y.status) && ['冷蔵', '冷凍'].includes(y.temp) && y.deliverOn === x.fromDeliver && !m.rows.some((z) => z.deliveryId === y.id));
      need(!sib.length, `移動 ${m.id} で ${d.id} だけ動き、同じ日の ${sib.map((y) => y.id).join('・')} が残っている`);
    }
  }
  for (const d of deliveries.filter((x) => x.moveId)) {
    const m = r.get<DeliveryMove>(MOVES, d.moveId!);
    need(!!m && m.rows.some((x) => x.deliveryId === d.id), `配送 ${d.id} の移動 ${d.moveId} がない`);
    need(d.changeState === '調整済', `移動した配送 ${d.id} が調整済でない`);
  }
  /* 出荷の前の配送の最初の区間は配送の倉庫から（一括変更で倉庫を変えたとき） */
  const legs = r.list<Leg>('dm.delivery.legs');
  for (const d of deliveries.filter((x) => !x.parentId && ['予定', '出荷待'].includes(x.status) && x.temp !== '資材')) {
    const l1 = legs.find((l) => l.deliveryId === d.id && l.legNo === 1);
    need(!!l1 && l1.from.type === 'warehouse' && l1.from.id === d.warehouseId, `配送 ${d.id} の区間1の倉庫が配送の倉庫 ${d.warehouseId} と違う`);
  }

  /* サイクル暦：A1 は月曜・B7＝A1＋13・D7＝A1＋27・B7 がサイクル月・重ならない（課題 4-10 で A1 を変えても） */
  const cs = r.list<Cycle>('dm.delivery.cycles').sort((a, b) => a.a1.localeCompare(b.a1));
  cs.forEach((c, i) => {
    need(new Date(c.a1).getDay() === 1 && c.b7 === addDays(c.a1, 13) && c.d7 === addDays(c.a1, 27) && c.b7.slice(0, 7).replace('/', '-') === c.id, `サイクル ${c.id} の A1・B7・D7 が合わない`);
    if (i > 0) need(cs[i - 1].d7 < c.a1, `サイクル ${cs[i - 1].id} と ${c.id} が重なる`);
  });
  /* 倉庫ごとの出荷禁止日：ピッキング倉庫 */
  for (const h of r.list<Holiday>('dm.delivery.holidays')) for (const w of h.warehouseIds ?? []) {
    need(r.get<Warehouse>('dm.master.warehouses', w)?.type === 'picking' && h.noPicking, `出荷禁止日 ${h.date} の倉庫 ${w} がピッキング倉庫でない・出荷不可でない`);
  }

  /* ドライバー：数量相違のトラブルは配送に1つ（開いているもの）・完了した報告の検品の数＝配送の届けた数・お届け日より前の納品は理由あり・集金は集金ありの拠点だけ */
  const troubles = r.list<Trouble>('dm.delivery.troubles');
  for (const d of deliveries) need(troubles.filter((t) => t.deliveryId === d.id && !t.resolution && t.typeId === 'qty_diff').length <= 1, `配送 ${d.id} に開いている数量相違のトラブルが2つ以上ある`);
  for (const x of r.list<DeliveryReport>('dm.report.deliveryReports')) {
    const d = byId.get(x.deliveryId);
    if (!d) continue;
    /* 運営がトラブルの解決で「納品できた数」を直した配送は、ドライバーの検品の数と違ってよい */
    if (x.status === '完了' && d.deliveredQty !== null && x.inspection.length && !troubles.some((t) => t.deliveryId === d.id && t.resolution)) need(x.inspection.reduce((a, l) => a + l.qty, 0) === d.deliveredQty, `報告 ${x.id} の検品の数が配送の届けた数（${d.deliveredQty}）と違う`);
    /* 検品の行（lineId）はこの配送の明細・同じ行は1回（B1） */
    const lids = x.inspection.map((l) => l.lineId).filter(Boolean) as string[];
    need(new Set(lids).size === lids.length, `報告 ${x.id} の検品に同じ明細の行が2つ以上ある`);
    for (const lid of lids) need(r.get<{ deliveryId: string }>('dm.delivery.lines', lid)?.deliveryId === x.deliveryId, `報告 ${x.id} の検品の明細 ${lid} がこの配送にない`);
    if (x.status === '完了' && x.completedAt && x.completedAt.slice(0, 10) < d.deliverOn) need(!!x.earlyReason?.trim(), `報告 ${x.id} はお届け日（${d.deliverOn}）より前に完了したのに理由がない`);
    const cc = r.get<ChildContract>('dm.org.childContracts', d.childContractId);
    if (x.cash && cc) need(cc.app.allowCash, `報告 ${x.id} は集金なしの拠点なのに集金がある`);
  }

  /* 価格世代：形・適用開始が重ならない・コースがプランと同じ */
  for (const pl of r.list<Plan>('dm.master.plans')) {
    const gens = pl.priceGens ?? [];
    need(new Set(gens.map((g) => g.fromCycle)).size === gens.length, `プラン ${pl.id} の価格世代の適用開始が重なる`);
    const yenOk = (n: number | undefined) => n === undefined || (Number.isInteger(n) && n > 0);
    for (const g of gens) need(/^\d{4}-\d{2}$/.test(g.fromCycle) && g.prices.length === pl.prices.length && g.prices.every((x) => pl.prices.some((y) => y.course === x.course) && Number.isInteger(x.monthlyYen) && x.monthlyYen > 0 && yenOk(x.coolYen) && yenOk(x.esYen)), `プラン ${pl.id} の価格世代 ${g.id} の形が違う`);
    /* 公開用の世代は1つ（運営が付ける印。台帳 E 2026-10-05）。ライト（自販機）は COOL便の価格を持たない */
    if (gens.length) need(gens.filter((g) => g.public).length === 1, `プラン ${pl.id} の公開用の価格世代が1つではない`);
    for (const g of gens) need(g.prices.every((x) => x.course !== 'ESライト（自販機）' || x.coolYen === undefined), `プラン ${pl.id} の価格世代 ${g.id} のライト（自販機）に COOL便の価格がある`);
  }

  /* 一括変更：進み具合と結果の数が合う・完了したものは全部終わっている・実行中は1つまで */
  const jobs = r.list<BulkChange>(BULK);
  need(jobs.filter((j) => j.status === '実行中').length <= 1, '実行中の一括変更が2つ以上ある');
  for (const j of jobs) {
    const s = j.summary;
    need(j.results.length === j.processed && j.processed <= j.total && j.total === j.contractIds.length && s.changed + s.skipped + s.failed === j.processed, `一括変更 ${j.id} の進み具合・結果の数が合わない`);
    if (j.status === '完了') need(j.processed === j.total && !!j.finishedAt, `一括変更 ${j.id} は完了なのに終わっていない`);
    for (const x of j.results) for (const id of x.children) {
      const k = r.get<ChildContract>('dm.org.childContracts', id);
      need(!!k && k.cycleMonth >= j.fromCycle, `一括変更 ${j.id} の子契約 ${id} がない・適用開始より前`);
    }
  }
  return p;
}
