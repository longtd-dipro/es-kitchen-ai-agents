import type { DocRepo } from '@/lib/ops/core/area';
import { BULK } from './bulk';
import { MOVES } from './move';
import { countedDeliveries } from './areas/report';
import { periodRange } from './seed/report';
import type { Account, BulkChange, Delivery, DeliveryMove, Plan, StockCheck, Trouble } from './types';

/*
 * check.run の続き（00_確認してほしい/課題一覧 の「Trả lời 4a / 4b」「Chốt thêm 2026/10/03」と課題 11）。
 *   4a-11 棚卸：数に入れた配送は1回の点検だけ（点検の日より後に届いた分は次の点検）
 *   4b-4 移動：トラブルの対応はトラブルの記録につなぐ
 *   4b-6 一括変更：注意（出荷禁止日・リードタイム）を確かめた記録
 *   4b-9 価格世代：プランごとに1つ以上・訂正には理由
 *   11 仕入先：仕入先サイトのアカウントがある仕入先は共通 DB の仕入先（本登録）にある
 */

/** 一括変更で SA が注意（新しい倉庫の出荷禁止日）を確かめて変えた配送（出荷日・倉庫がそのまま）。check.run の出荷できる日の確認を飛ばす */
export function bulkAckedShip(r: DocRepo, d: Pick<Delivery, 'id' | 'shipOn' | 'warehouseId'>) {
  return r.list<BulkChange>(BULK).some((j) => j.acks?.deliveries.some((x) => x.id === d.id && x.shipOn === d.shipOn && x.warehouseId === d.warehouseId));
}

export function decisionProblems(r: DocRepo): string[] {
  const p: string[] = [];
  const need = (cond: boolean, msg: string) => { if (!cond) p.push(msg); };
  const deliveries = r.list<Delivery>('dm.delivery.deliveries');
  const byId = new Map(deliveries.map((d) => [d.id, d]));

  /* 4a-11 棚卸：残した配送はこの拠点の届けた食品の配送・同じ配送を2つの点検で数えない */
  const checks = r.list<StockCheck>('dm.report.stockChecks');
  for (const c of checks) {
    for (const id of c.deliveryIds ?? []) {
      const d = byId.get(id);
      need(!!d && d.branchId === c.branchId && d.temp !== '資材' && d.deliveredQty !== null, `棚卸 ${c.id} の数えた配送 ${id} がこの拠点の届けた配送でない`);
    }
    for (const id of c.transitIds ?? []) need(byId.get(id)?.branchId === c.branchId, `棚卸 ${c.id} のお届け中の配送 ${id} がこの拠点の配送でない`);
    if (c.deliveryIds) need(c.checkedOn >= periodRange(c.period)[0], `棚卸 ${c.id} の点検日 ${c.checkedOn} が締めの期間より前`);
  }
  for (const b of new Set(checks.map((c) => c.branchId))) {
    const mine = checks.filter((c) => c.branchId === b).sort((x, y) => x.period.localeCompare(y.period));
    const seen = new Map<string, string>();
    for (const c of mine) for (const id of countedDeliveries(r, c, deliveries)) {
      need(!seen.has(id), `配送 ${id} が棚卸 ${seen.get(id)} と ${c.id} の両方で数えられている`);
      seen.set(id, c.id);
    }
  }

  /* 4b-4 移動：トラブルの記録は動かした便の拠点のトラブル */
  for (const m of r.list<DeliveryMove>(MOVES)) {
    if (!m.troubleId) continue;
    const t = r.get<Trouble>('dm.delivery.troubles', m.troubleId);
    need(!!t && m.trouble && m.rows.some((x) => x.branchId === byId.get(t.deliveryId)?.branchId), `移動 ${m.id} のトラブル ${m.troubleId} がない・動かした便の拠点のトラブルでない`);
  }

  /* 4b-6 一括変更：確かめた記録は注意があるときだけ・配送がある */
  for (const j of r.list<BulkChange>(BULK)) {
    if (!j.acks) continue;
    need(j.acks.alerts.length > 0 && !!j.acks.at, `一括変更 ${j.id} の確かめた記録に注意がない`);
    for (const x of j.acks.deliveries) need(byId.has(x.id), `一括変更 ${j.id} の確かめた配送 ${x.id} がない`);
  }

  /* 4b-9 価格世代：プランごとに1つ以上・ID は重ならない・訂正には理由 */
  for (const pl of r.list<Plan>('dm.master.plans').filter((x) => x.status !== '削除済')) {
    const gens = pl.priceGens ?? [];
    need(gens.length > 0, `プラン ${pl.id} に価格世代がない（料金の元は価格世代）`);
    need(new Set(gens.map((g) => g.id)).size === gens.length, `プラン ${pl.id} の価格世代の ID が重なる`);
    for (const g of gens) for (const f of g.fixes ?? []) need(!!f.reason.trim() && f.before.length === g.prices.length, `価格世代 ${g.id} の誤りの訂正に理由・前の金額がない`);
  }

  /* 11 仕入先：仕入先サイトのアカウント（削除済でない）がある仕入先は、共通 DB の仕入先に本登録である */
  const sups = new Map(r.list<{ id: string; status: string }>('db.suppliers').map((s) => [s.id, s]));
  if (sups.size) {
    for (const a of r.list<Account>('dm.account.accounts').filter((x) => x.site === 'supplier' && !['削除済', '無効', '利用停止'].includes(x.status))) {
      need(sups.get(a.id)?.status === '本登録', `仕入先のアカウント ${a.id} の仕入先が共通 DB に本登録でない（ログインできない）`);
    }
    for (const s of sups.values()) need(['申込中', '却下', '本登録', '未発行', '削除済'].includes(s.status), `仕入先 ${s.id} の状態「${s.status}」が使えない`);
  }
  return p;
}
