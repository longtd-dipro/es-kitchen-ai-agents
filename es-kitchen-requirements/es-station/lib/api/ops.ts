import type { OpsOp, Order } from '@/lib/supplier/types';
import { call } from './supplier.http';
import { mockService, wait } from './supplier.mock';

/* ===== 運営Web の発注・入荷の API。仕入先サイトと同じデータ（共通 DB）を読み書きする ===== */

export interface OpsApi {
  listOrders(): Promise<Order[]>;
  /** 仮発注・本発注・数量変更・キャンセル・入荷・代理入力など（lib/supplier/service.ts の runOps） */
  run(op: OpsOp): Promise<Order[]>;
  issueHon(no: string, qty: number): Promise<Order>;
  changeKari(no: string, qty: number): Promise<Order>;
  cancelOrder(no: string, reason: string): Promise<Order>;
  receiveOrder(no: string): Promise<Order>;
  getVersion(): Promise<number>;
  /** 共通 DB を見本データに戻す（開発用） */
  resetData(): Promise<void>;
}

const path = (no: string, action: string) => `/ops/orders/${encodeURIComponent(no)}/${action}`;

const httpOpsApi: OpsApi = {
  listOrders: () => call('GET', '/ops/orders'),
  run: (op) => call('POST', '/ops/orders/op', op),
  issueHon: (no, qty) => call('POST', path(no, 'hon'), { qty }),
  changeKari: (no, qty) => call('POST', path(no, 'kari'), { qty }),
  cancelOrder: (no, reason) => call('POST', path(no, 'cancel'), { reason }),
  receiveOrder: (no) => call('POST', path(no, 'receive')),
  getVersion: () => call<{ version: number }>('GET', '/sync/version').then((r) => r.version),
  resetData: () => call('POST', '/dev/reset'),
};

const mockOpsApi: OpsApi = {
  listOrders: () => wait(() => mockService.listAllOrders()),
  run: (op) => wait(() => {
    /* モックの Repo には addOrder がないので、発注の一覧（メモリの配列そのもの）に足す */
    if (op.op === 'create') {
      const all = mockService.listAllOrders();
      op.orders.forEach((o) => {
        if (all.some((x) => x.no === o.no)) throw new Error(`同じ発注番号がすでにあります（${o.no}）`);
      });
      all.push(...structuredClone(op.orders));
      return op.orders;
    }
    return mockService.runOps(op);
  }),
  issueHon: (no, qty) => wait(() => mockService.issueHon(no, qty)),
  changeKari: (no, qty) => wait(() => mockService.changeKari(no, qty)),
  cancelOrder: (no, reason) => wait(() => mockService.cancelOrder(no, reason)),
  receiveOrder: (no) => wait(() => mockService.receiveOrder(no)),
  getVersion: () => wait(() => mockService.version()),
  resetData: () => wait(() => location.reload()),
};

export const opsApi: OpsApi = process.env.NEXT_PUBLIC_API_MODE === 'http' ? httpOpsApi : mockOpsApi;
