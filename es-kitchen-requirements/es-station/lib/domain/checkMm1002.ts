import type { DocRepo } from '@/lib/ops/core/area';
import type { Order } from '@/lib/supplier/types';
import type { Application, Branch, OrderPref } from './types';

/*
 * check.run の続き（2026/10/02 定例の決定・優先 A）：
 *   ・基準数のパターン（REQ-CT-300）：注文の設定は今ある拠点のもの。仮登録の間は申込の値と拠点の注文の設定が合う（契約の画面では直せないため）
 *   ・仕入先の出荷（REQ-PO-619・135・606）：出荷済みの回は出荷日・配送方法がある。期限は出荷日より後。送り状番号は任意（入れたときは 10〜12桁）
 */
const ORDER_KIND = 'purchasing.orders';

export function mm1002Problems(r: DocRepo): string[] {
  const p: string[] = [];
  const need = (c: boolean, m: string) => { if (!c) p.push(m); };

  for (const x of r.list<OrderPref>('dm.order.prefs')) {
    need(!!r.get<Branch>('dm.org.branches', x.id), `注文の設定 ${x.id} の拠点がない`);
    need(typeof x.allowShortLife === 'boolean', `注文の設定 ${x.id} の基準数のパターン（allowShortLife）が真偽でない`);
  }
  for (const a of r.list<Application>('dm.apply.applications')) {
    for (const b of a.setup?.branches ?? []) {
      if (b.stage !== '仮登録' || !b.branchId || b.noShortLife === undefined) continue;
      const pref = r.get<OrderPref>('dm.order.prefs', b.branchId);
      need(!!pref && pref.allowShortLife === !b.noShortLife, `申込 ${a.id} の拠点 ${b.branchId}（仮登録）の基準数のパターンが拠点の注文の設定と違う`);
    }
  }

  for (const o of r.list<Order>(ORDER_KIND)) {
    (o.parts ?? []).forEach((x, i) => {
      const at = `発注 ${o.no} の ${i + 1}回目`;
      if (x.st !== '出荷済') return;
      need(!!x.ship && !!x.method, `${at} は出荷済みなのに出荷日・配送方法がない`);
      if (o.type === '資材') need(!x.bb, `${at} は資材なのに期限がある`);
      else if (x.bb && x.ship) need(x.bb > x.ship, `${at} の期限 ${x.bb} が出荷日 ${x.ship} より後でない`);
    });
  }
  return p;
}
