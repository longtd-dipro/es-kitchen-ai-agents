import { addDays } from '@/lib/supplier/dates';
import type { ChildContract, DeliveryReport, ParkingReport, StockCheck } from '../types';
import { buildDeliveries, type DeliverySeed } from './delivery';
import { CONTACTS } from './org';

const mainOf = (branchId: string) => CONTACTS.find((c) => c.owner.id === branchId && c.kind === 'メイン担当者')?.name;

/*
 * 現場の報告の見本：配送の報告（5ステップ）・駐車場代・棚卸。配送の見本（seed/delivery.ts）から作る。
 *   配送の報告：ドライバーが届けて完了した配送（納品済・一部納品済）にはすべて完了の報告がある
 *   棚卸：2026-09 の締め（2026/08/21〜09/20）は申告・確認済み（横浜営業所だけ未申告・25日の判定で事務手数料）。2026-10 の締め（09/21〜10/20）はまだ（今日 10/05）
 */

/** 締め月の期間（前月21日〜当月20日） */
export function periodRange(period: string): [string, string] {
  const [y, m] = period.split('-').map(Number);
  const prev = new Date(y, m - 2, 21);
  return [`${prev.getFullYear()}/${String(prev.getMonth() + 1).padStart(2, '0')}/21`, `${period.replace('-', '/')}/20`];
}

const cashOf = (cc: ChildContract | undefined, n: number) => (cc?.app.allowCash ? { expectedYen: 1200 + (n % 3) * 200, collectedYen: 1200 + (n % 3) * 200, note: '' } : null);

export function buildReports(children: ChildContract[], s: DeliverySeed = buildDeliveries(children)) {
  const reports: DeliveryReport[] = [];
  s.deliveries.forEach((d, n) => {
    if (!['納品済', '一部納品済'].includes(d.status) || d.regime === 'parcel_carrier') return;
    const fin = s.legs.find((l) => l.deliveryId === d.id && l.isFinal);
    if (!fin?.driverId) return;
    const ls = s.lines.filter((l) => l.deliveryId === d.id);
    const photos = (k: string) => [1, 2].map((i) => `${d.id}-${k}-${i}.jpg`);
    reports.push({
      id: d.id, deliveryId: d.id, branchId: d.branchId, driverId: fin.driverId, status: '完了',
      photosBefore: photos('before'),
      stock: ls.map((l, i) => ({ productId: l.productId, remaining: (n + i) % 4, disposed: i === 0 && n % 2 === 0 ? 1 : 0 })),
      inspection: ls.map((l) => ({ productId: l.productId, lineId: l.id, qty: l.deliveredQty ?? l.plannedQty })),
      photosAfter: photos('after'),
      /* 集金は元の配送だけ（残りを届けた子の配送では集金しない） */
      cash: d.parentId ? null : cashOf(children.find((c) => c.id === d.childContractId), n),
      startedAt: `${d.deliverOn} 10:50`, completedAt: d.deliveredAt, editableUntil: addDays(d.deliverOn, 7),
    });
  });

  const osaka = s.deliveries.find((d) => d.id === 'DL-260928-0014');
  const kawasaki = s.deliveries.filter((d) => d.branchId === 'CU01902' && d.status === '納品済').pop();
  const parking: ParkingReport[] = [
    ...(osaka ? [{ id: 'PK-260929-0001', driverId: 'DR00041', carrierId: 'DE00006', deliveryId: osaka.id, date: osaka.deliverOn, feeYen: 600, receiptFile: 'PK-260929-0001.jpg', reportedBy: 'DR00041', reportedAt: `${osaka.deliverOn} 11:30` }] : []),
    ...(kawasaki ? [{ id: `PK-${kawasaki.deliverOn.slice(2).replace(/\//g, '')}-0001`, driverId: 'DR00011', carrierId: 'DE00001', deliveryId: kawasaki.id, date: kawasaki.deliverOn, feeYen: 400, receiptFile: 'parking-kawasaki.jpg', reportedBy: 'DR00011', reportedAt: `${kawasaki.deliverOn} 12:10` }] : []),
  ];

  /* 棚卸（2026-09 の締め） */
  const period = '2026-09';
  const [from, to] = periodRange(period);
  const stockChecks: StockCheck[] = [];
  /* 横浜営業所（CU00950）は 2026-09 の棚卸報告を25日までにしなかった拠点（見本：法人Web の「未報告（事務手数料あり）」E322・受付簿 No.157）。報告の記録を作らない */
  const NOT_FILED = ['CU00950'];
  const branchIds = [...new Set(s.deliveries.filter((d) => d.temp !== '資材' && d.deliverOn >= from && d.deliverOn <= to && d.deliveredQty !== null).map((d) => d.branchId))];
  branchIds.forEach((branchId, bi) => {
    if (NOT_FILED.includes(branchId)) return;   /* 並び（bi）は変えない：ほかの拠点の見本の数が変わらないように */
    const ds = s.deliveries.filter((d) => d.branchId === branchId && d.temp !== '資材' && d.deliverOn >= from && d.deliverOn <= to);
    const delivered = new Map<string, number>();
    for (const d of ds) for (const l of s.lines.filter((x) => x.deliveryId === d.id)) delivered.set(l.productId, (delivered.get(l.productId) ?? 0) + (l.deliveredQty ?? 0));
    const parcel = ds.every((d) => d.regime === 'parcel_carrier');
    const driver = s.legs.find((l) => ds.some((d) => d.id === l.deliveryId) && l.isFinal)?.driverId ?? '';
    const rows = [...delivered].map(([productId, q], i) => {
      const prev = (i + bi) % 3;
      const disposed = i === 1 ? 1 : 0;
      const actual = Math.min((i + 2 * bi) % 4, prev + q - disposed);
      return { productId, prev, delivered: q, disposed, actual, sold: prev + q - disposed - actual };
    });
    stockChecks.push({
      id: `SC-${period}-${branchId}`, branchId, period, checkedOn: `2026/09/${18 + (bi % 3)}`,
      /* 法人の申告は申告した方（拠点のメイン担当者）の氏名を残す（受付簿 No.44） */
      checkedBy: parcel || !driver ? { site: 'corp' as const, accountId: branchId, ...(mainOf(branchId) ? { name: mainOf(branchId) } : {}) } : { site: 'driver', accountId: driver },
      rows, status: '確認済',
    });
  });

  /* 横浜営業所は 2026-08 までは報告済み（前の月の記録だけ。商品の行はなし）。「最初の棚卸報告」（受付簿 No.134）の対象にならず、2026-09 だけが未報告になる */
  for (const id of NOT_FILED) {
    stockChecks.push({ id: `SC-2026-08-${id}`, branchId: id, period: '2026-08', checkedOn: '2026/08/19', checkedBy: { site: 'corp' as const, accountId: id, ...(mainOf(id) ? { name: mainOf(id) } : {}) }, rows: [], status: '確認済' });
  }
  return { reports, parking, stockChecks };
}

