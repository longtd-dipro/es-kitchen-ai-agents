import { ApiError } from '@/lib/api/errors';
import type { DocRepo } from '../core/area';
import type { SupplierRepo } from '@/lib/supplier/service';
import type { Order } from '@/lib/supplier/types';
import type { AltPo, Product } from '@/lib/domain/types';
import { unitCostOf } from '@/lib/domain/snapshot';
import { altPoAnswered } from '@/lib/domain/alt';

/**
 * 仕入先サイトのアカウントがない仕入先の発注（purchasing.orders）と、代替品設定の不足分の追加発注（共通データ dm.order.altPos の order）を、
 * 仕入先サイトと同じ書き換え（lib/supplier/service.ts）で動かすための Repo。追加発注の書き換えは dm.order.altPos に戻す。
 * 発注のほかの読み書き（仕入先・お知らせ・申込）は使わない。
 */
export const ORDER_KIND = 'purchasing.orders';
export const ALT_PO_KIND = 'dm.order.altPos';
/** 代替品の追加発注（発注の形） */
export const altPoOrders = (repo: DocRepo) => repo.list<AltPo>(ALT_PO_KIND).map((x) => x.order as unknown as Order);

export function docSupplierRepo(repo: DocRepo): SupplierRepo {
  const no = () => { throw new ApiError('この発注では使えません', 400); };
  return {
    getSupplier: () => undefined,
    saveSupplier: no,
    listOrders: (id) => [...repo.list<Order>(ORDER_KIND), ...altPoOrders(repo)].filter((o) => !id || o.sup === id),
    getOrder: (n) => repo.get<Order>(ORDER_KIND, n) ?? (repo.get<AltPo>(ALT_PO_KIND, n)?.order as unknown as Order | undefined),
    saveOrder: (o) => {
      /* 追加発注は dm.order.altPos に戻す（仕入先の回答があれば入荷予定日も直す） */
      if (!altPoAnswered(repo, o.no, o as unknown as Record<string, unknown>) && !repo.get<AltPo>(ALT_PO_KIND, o.no)) repo.put(ORDER_KIND, o.no, o);
    },
    addOrder: (o) => repo.put(ORDER_KIND, o.no, o),
    listNotices: () => [],
    listManuals: () => [],
    addApplication: no,
    countApplications: () => 0,
    unitCost: (o) => unitCostOf(repo.get<Product>('dm.master.products', o.pid), o.sup),
    version: () => 0,
    transaction: (fn) => fn(),
  };
}

/**
 * 仕入先サイト・運営の発注の Repo（共通 DB の orders）に、代替品の追加発注（共通データ dm.order.altPos）を足す（課題 2c-1）。
 * 追加発注も仕入先サイトの発注一覧・回答（納期回答・出荷・分納）に出る。書き換えは dm.order.altPos に戻し、
 * 仕入先の回答があれば入荷予定日（eta）を回答の日にする（altPoAnswered）。onWrite＝書いたあと（共通 DB の版を上げる）
 */
export function withAltPos(base: SupplierRepo, docs: DocRepo, onWrite: () => void = () => {}): SupplierRepo {
  const alts = (id?: string) => altPoOrders(docs).filter((o) => !id || o.sup === id);
  return {
    ...base,
    listOrders: (id) => {
      const own = base.listOrders(id);
      return [...own, ...alts(id).filter((o) => !own.some((x) => x.no === o.no))];
    },
    getOrder: (no) => base.getOrder(no) ?? (docs.get<AltPo>(ALT_PO_KIND, no)?.order as unknown as Order | undefined),
    saveOrder: (o) => {
      if (base.getOrder(o.no) || !docs.get<AltPo>(ALT_PO_KIND, o.no)) { base.saveOrder(o); return; }
      altPoAnswered(docs, o.no, o as unknown as Record<string, unknown>);
      onWrite();
    },
  };
}
