import source from '@/mocks/supplier/orders.source.json';
import { addDays } from './dates';
import { syncOrder } from './orders';
import type { Order } from './types';
import { PRODUCTS } from '@/lib/domain/seed/products';
import { stampUnitCost } from '@/lib/domain/snapshot';

/**
 * 見本の発注データ（mocks/supplier/orders.source.json）を、画面が使う形にそろえる。
 * ブラウザだけのモック（lib/api/supplier.mock.ts）と、共通 DB の初期データ（lib/server/db.ts）の両方で使う。
 */
export function seedOrders(): Order[] {
  return structuredClone(source.orders as unknown as Partial<Order>[]).map((src) => {
    const o = {
      honAck: true, seen: true, re: null, ship: '', carrier: '', slip: '', bb: '', method: '', comment: '', recv: '', recvDate: '', eta: '',
      ...src,
    } as Order;
    o.parts ??= [];
    o.parts.forEach((p) => {
      p.dlv ||= addDays(p.eta, 1);
      if (p.box === undefined) p.box = '';
    });
    if (o.honAck && o.hon > 0) o.honAckAt ||= o.honAt;
    /* 本発注済みの見本は、商品マスタの見本の仕入単価を写しておく（本発注したときの単価） */
    stampUnitCost(o, (id) => PRODUCTS.find((x) => x.id === id));
    return syncOrder(o);
  });
}
