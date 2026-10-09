import type { DocRepo } from '@/lib/ops/core/area';
import type { Channel, ChildContract, Delivery, Leg, SlotRoute } from './types';

/**
 * その回（枠）のルート。回ごとの上書き（Channel.slotRoutes）があれば倉庫・運び手・中継をそれにする（配送回数追加の回など：2026/10/03 案B）。
 * 上書きで最後の運び手が変わったら担当ドライバーは外す（割り当て直し）。配送区分は運び手の種類から（路線便＝COOL便）
 */
export function routeOfSlot(ch: Channel, slot: string): Channel {
  const o: SlotRoute | undefined = ch.slotRoutes?.[slot];
  if (!o) return ch;
  const finalOf = (x: Pick<Channel, 'carrierId' | 'carrier2Id'>) => x.carrier2Id || x.carrierId;
  return {
    ...ch, ...o,
    serviceForm: ch.temp === '資材' ? ch.serviceForm : o.regime === 'parcel_carrier' ? 'COOL便' : ch.serviceForm === 'COOL便' ? 'ES配送便' : ch.serviceForm,
    driverId: o.regime === 'parcel_carrier' || finalOf(o) !== finalOf(ch) ? '' : ch.driverId,
  };
}

/** 区間を作る（倉庫→（中継→）拠点。見本の seed/delivery.ts と同じ形） */
export function legsFor(id: string, ch: Channel, branchId: string): Leg[] {
  const scope = ch.regime === 'partner_driver' ? 'carrier' : 'ops';
  const driver = ch.regime === 'parcel_carrier' ? '' : ch.driverId;
  if (ch.hubId) {
    return [
      { id: `${id}:1`, deliveryId: id, legNo: 1, from: { type: 'warehouse', id: ch.warehouseId }, to: { type: 'relay', id: ch.hubId }, carrierId: ch.carrierId, regime: ch.regime, isFinal: false, assignScope: scope, driverId: '', pickedUpAt: '' },
      { id: `${id}:2`, deliveryId: id, legNo: 2, from: { type: 'relay', id: ch.hubId }, to: { type: 'destination', id: branchId }, carrierId: ch.carrier2Id || ch.carrierId, regime: ch.regime, isFinal: true, assignScope: scope, driverId: driver, pickedUpAt: '' },
    ];
  }
  return [{ id: `${id}:1`, deliveryId: id, legNo: 1, from: { type: 'warehouse', id: ch.warehouseId }, to: { type: 'destination', id: branchId }, carrierId: ch.carrierId, regime: ch.regime, isFinal: true, assignScope: scope, driverId: driver, pickedUpAt: '' }];
}

/**
 * 回ごとのルートを直したら、その回のまだ予定の配送（出荷指示の前）の倉庫・区間・運び手を直す。
 * 出荷待より後（出荷指示を送った・出荷した）は変えない（一括変更・この配送だけの変更で直す）。返り値＝直した配送ID
 */
export function rerouteSlots(r: DocRepo, before: ChildContract, after: ChildContract): string[] {
  const out: string[] = [];
  for (const ch of after.channels) {
    const old = before.channels.find((x) => x.temp === ch.temp);
    for (const slot of ch.slots) {
      if (JSON.stringify(old?.slotRoutes?.[slot] ?? null) === JSON.stringify(ch.slotRoutes?.[slot] ?? null)) continue;
      const rc = routeOfSlot(ch, slot);
      for (const d of r.list<Delivery>('dm.delivery.deliveries').filter((x) => x.childContractId === after.id && !x.parentId && x.temp === ch.temp && x.slot === slot && x.status === '予定')) {
        r.list<Leg>('dm.delivery.legs').filter((l) => l.deliveryId === d.id).forEach((l) => r.remove('dm.delivery.legs', l.id));
        for (const l of legsFor(d.id, rc, d.branchId)) r.put<Leg>('dm.delivery.legs', l.id, l);
        r.put<Delivery>('dm.delivery.deliveries', d.id, { ...d, warehouseId: rc.warehouseId, regime: rc.regime, serviceForm: rc.serviceForm });
        out.push(d.id);
      }
    }
  }
  return out;
}
