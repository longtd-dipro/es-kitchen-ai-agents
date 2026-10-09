import type { DocRepo } from '../core/area';
import { today } from '@/lib/supplier/dates';
import { altPoLikes, knownOrders, poReceiving, stockAt, BASES, MOVES, RECEIPTS, type PoLike } from '@/lib/domain/stock';
import type { ChildContract, Contract, Delivery, Driver, Leg, Receipt, StockBase, StockMove } from '@/lib/domain/types';

/*
 * 運営Web マスタの「使用中は削除できない」の件数（台帳 F 2026-10-06・受付簿 No.178／No.179・メッセージ E241〜E244）。
 *   仕入先＝進行中の発注（キャンセル・受注不可・入荷済・入荷を閉じた発注を除く）
 *   倉庫＝在庫が残っている品目 ＋ 利用中の契約（便の倉庫・中継）
 *   委託配送先＝利用中の契約（便の運び手）＋ 配送予定（終わっていない配送の区間）＋ 所属する配送スタッフ（削除済を除く）
 *   配送スタッフ＝割り当て済みで終わっていない配送（区間の担当）
 * 利用中の契約＝終了・取消でない親契約のうち、いちばん新しい子契約（取消していない）の便がそれを使っているもの
 */

/** 終わった配送（数えない） */
const DONE: Delivery['status'][] = ['納品済', '一部納品済', '中止', '取消'];
const ymNow = () => today().slice(0, 7).replace('/', '-');

/** 利用中の契約の最新の子契約（親契約ごとに1つ） */
function liveLatestChildren(r: DocRepo): ChildContract[] {
  const live = new Set(r.list<Contract>('dm.org.contracts').filter((c) => !['終了', '取消'].includes(c.status)).map((c) => c.id));
  const latest = new Map<string, ChildContract>();
  for (const k of r.list<ChildContract>('dm.org.childContracts')) {
    if (k.canceled || !live.has(k.contractId)) continue;
    const cur = latest.get(k.contractId);
    if (!cur || cur.cycleMonth < k.cycleMonth) latest.set(k.contractId, k);
  }
  return [...latest.values()];
}
/** 便（回ごとのルートの上書きも）のどれかが条件に合う親契約の数 */
function contractsUsing(r: DocRepo, hit: (x: { warehouseId: string; hubId: string; carrierId: string; carrier2Id: string }) => boolean) {
  return liveLatestChildren(r).filter((k) => k.channels.some((c) => hit(c) || Object.values(c.slotRoutes ?? {}).some(hit))).length;
}
/** 終わっていない配送の区間（配送ごとに1つ） */
function openLegs(r: DocRepo, hit: (l: Leg) => boolean) {
  const st = new Map(r.list<Delivery>('dm.delivery.deliveries').map((d) => [d.id, d.status]));
  return new Set(r.list<Leg>('dm.delivery.legs').filter((l) => hit(l) && !DONE.includes(st.get(l.deliveryId) ?? '取消')).map((l) => l.deliveryId)).size;
}

/** 仕入先の進行中の発注の数（E241） */
export function supplierInUse(r: DocRepo, supplierId: string) {
  const seen = new Set<string>();
  const ym = ymNow();
  return [...knownOrders(r), ...altPoLikes(r)].filter((o: PoLike) => {
    if (!o?.no || seen.has(o.no) || o.sup !== supplierId) return false;
    seen.add(o.no);
    if (['キャンセル', '受注不可'].includes(o.ans) || o.recv === '入荷済') return false;
    /* 本発注のある発注は入荷を閉じるまで、仮発注（本発注 0）はその月が終わるまで進行中 */
    return o.hon > 0 ? !poReceiving(r, o).closed : String(o.ym ?? '').replace('/', '-') >= ym;
  }).length;
}

/** 倉庫の在庫が残っている品目の数＋利用中の契約の数（E242） */
export function warehouseInUse(r: DocRepo, warehouseId: string) {
  const items = new Set<string>([
    ...r.list<StockBase>(BASES).filter((x) => x.warehouseId === warehouseId).map((x) => x.itemId),
    ...r.list<Receipt>(RECEIPTS).filter((x) => x.warehouseId === warehouseId).map((x) => x.itemId),
    ...r.list<StockMove>(MOVES).filter((x) => x.warehouseId === warehouseId).map((x) => x.itemId),
  ]);
  const stock = [...items].filter((id) => stockAt(r, warehouseId, id).qty > 0).length;
  return stock + contractsUsing(r, (c) => c.warehouseId === warehouseId || c.hubId === warehouseId);
}

/** 委託配送先の利用中の契約・配送予定・所属する配送スタッフの数（E243） */
export function carrierInUse(r: DocRepo, carrierId: string) {
  const contracts = contractsUsing(r, (c) => c.carrierId === carrierId || c.carrier2Id === carrierId);
  const legs = openLegs(r, (l) => l.carrierId === carrierId);
  const staff = r.list<Driver>('dm.master.drivers').filter((d) => d.carrierId === carrierId && d.status !== '削除済').length;
  return contracts + legs + staff;
}

/** 配送スタッフの割り当て済みで終わっていない配送の数（E244） */
export const driverInUse = (r: DocRepo, driverId: string) => openLegs(r, (l) => l.driverId === driverId);
