import { addDays } from '@/lib/supplier/dates';
import { DEMO_TODAY, schedule, slotDate } from '../calendar';
import type {
  Branch, ChangeRequest, ChildContract, Contract, Cycle, CycleSettingsLog, Delivery, DeliveryLine, Holiday, Leg, MaterialOrder, ProductOrder, Tracking, Trouble,
} from '../types';
import { buildOrders, slotKey } from './order';
import { CARRIERS, DISCOUNTS, OPTIONS, PLANS, PRODUCTS } from './master';
import { BRANCHES, CHILD_PLANS, CONTRACTS, CORPS, NORMAL_PRICING, PAUSES } from './org';
import { APPLICATIONS } from './apply';
import { DELIVERED, feesOf } from '../snapshot';
import { carrierFeeFor } from '../carrierFee';
import { MAT_EXTRA_OPTION, syncLinkedWith } from '../charges';
import { routeOfSlot } from '../route';

/*
 * 配送の見本。子契約（org.ts の CHILD_PLANS）とサイクル暦から作る（日付の食い違いが出ないように）。
 * 状態は「今日」2026/10/05 を基準に決める：
 *   お届け日 < 今日 → 納品済（COOL便は推定）／ 9月・10月サイクル（締切済）→ 出荷待（出荷日が過ぎたら出荷済・受取済）／
 *   11月サイクル（受付中）・12月サイクルから先（受付前・先行生成）→ 予定
 * デモ・シナリオ説明書にある番号（大阪支店 9/29 の DL-260928-0014・10/13 の DL-261012-0011 など）はそのまま使う。
 */

export const CYCLES: Cycle[] = [
  { id: '2026-09', a1: '2026/09/14', b7: '2026/09/27', d7: '2026/10/11', orderCloseOn: '2026/08/15', orderState: '締切済' },
  { id: '2026-10', a1: '2026/10/12', b7: '2026/10/25', d7: '2026/11/08', orderCloseOn: '2026/09/15', orderState: '締切済' },
  { id: '2026-11', a1: '2026/11/09', b7: '2026/11/22', d7: '2026/12/06', orderCloseOn: '2026/10/15', orderState: '受付中' },
  /* 課題 3-13：12月サイクルから先（本社の休止 12月〜2月・再開 3月が見られるように。子契約・配送はまだ作らない＝日次バッチの分） */
  { id: '2026-12', a1: '2026/12/07', b7: '2026/12/20', d7: '2027/01/03', orderCloseOn: '2026/11/15', orderState: '受付前' },
  { id: '2027-01', a1: '2027/01/04', b7: '2027/01/17', d7: '2027/01/31', orderCloseOn: '2026/12/15', orderState: '受付前' },
  { id: '2027-02', a1: '2027/02/01', b7: '2027/02/14', d7: '2027/02/28', orderCloseOn: '2027/01/15', orderState: '受付前' },
  { id: '2027-03', a1: '2027/03/01', b7: '2027/03/14', d7: '2027/03/28', orderCloseOn: '2027/02/15', orderState: '受付前' },
  { id: '2027-04', a1: '2027/03/29', b7: '2027/04/11', d7: '2027/04/25', orderCloseOn: '2027/03/15', orderState: '受付前' },
  /* デモの見本だけ：2027-05 を設定しない「穴」にする（配送サイクル設定の帯・状態 003 の警告 I132 が撮れるように。本物のデータには影響しない。子契約・配送は作らない） */
  { id: '2027-06', a1: '2027/05/31', b7: '2027/06/13', d7: '2027/06/27', orderCloseOn: '2027/05/15', orderState: '受付前' },
];

/** 祝日はお届けしない。倉庫は動く（ピッキングする）＝共通サンプルの DL-261012-0011 は 10/12（祝日）に出荷 */
/** 配送サイクル設定の変更履歴の見本（P-HIST の列＋影響件数。保存のたびに actions.logCycleSettings が足す） */
export const CYCLE_SETTINGS_LOG: CycleSettingsLog[] = [
  { id: 'CSL-0001', at: '2026/09/28 10:12', by: 'Ad00001', op: '登録', item: '祝日・臨休（2027/02/23）', before: '—', after: '天皇誕生日', rebuilt: 0, flagged: 0 },
  { id: 'CSL-0002', at: '2026/10/02 15:40', by: 'Ad00001', op: '変更', item: '2027-02 サイクルの A1', before: '2027/02/01', after: '2027/02/08', reason: '年始の休みが長いため', rebuilt: 0, flagged: 0 },
  { id: 'CSL-0003', at: '2026/10/05 09:30', by: 'Ad00001', op: '削除', item: '祝日・臨休（2026/11/24）', before: '臨時休業', after: '—', reason: '臨時休業の予定が取りやめになったため', rebuilt: 0, flagged: 2 },
];

export const HOLIDAYS: Holiday[] = [
  ['2026/09/21', '敬老の日'], ['2026/09/22', '国民の休日'], ['2026/09/23', '秋分の日'],
  ['2026/10/12', 'スポーツの日'], ['2026/11/03', '文化の日'], ['2026/11/23', '勤労感謝の日'],
  ['2026/12/31', '年末'], ['2027/01/01', '元日'], ['2027/01/02', '年始'], ['2027/01/03', '年始'], ['2027/01/11', '成人の日'],
  ['2027/02/11', '建国記念の日'], ['2027/02/23', '天皇誕生日'], ['2027/03/21', '春分の日'], ['2027/03/22', '振替休日'],
].map(([date, name]) => ({ id: date.replace(/\//g, ''), date, name, noDelivery: true, noPicking: false }));

/** 決まっている番号（お届け日・拠点 → 配送ID） */
const FIXED_IDS: Record<string, string> = {
  /* シナリオ説明書 ⑦（運営デモの配送データ詳細と同じ番号） */
  'CU00871|2026/09/29': 'DL-260928-0014',
  'CU00871|2026/10/13': 'DL-261012-0011',
};

const yymmdd = (d: string) => d.slice(2).replace(/\//g, '');
const cycleOf = (id: string) => CYCLES.find((c) => c.id === id)!;
const branchOf = (id: string) => BRANCHES.find((b) => b.id === id)!;

/** 見本の今日の時点で発行済みの最後の請求月（10/01 発行。次は 11/01） */
export const LAST_ISSUED = '2026-10';
const addYm = (ym: string, n: number) => {
  const [y, m] = ym.split('-').map(Number);
  const d = new Date(y, m - 1 + n, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};
/** 前払いの請求月＝サイクル月＋請求書発行リードタイム（請求先の設定。リードタイム −1＝前の月に請求・0＝当月請求） */
export function issueMonthOf(contractId: string, cycleMonth: string) {
  const c = CONTRACTS.find((x) => x.id === contractId)!;
  const b = BRANCHES.find((x) => x.id === c.branchId);
  const corp = CORPS.find((x) => x.id === b?.corpId);
  const lead = (c.billTo === 'この拠点' ? c.billing?.lead : corp?.billing.lead) ?? -1;
  return addYm(cycleMonth, lead);
}
/** 年払い（請求先の支払サイクル）の親契約か */
export function annualContract(contractId: string) {
  const c = CONTRACTS.find((x) => x.id === contractId)!;
  const corp = CORPS.find((x) => x.id === BRANCHES.find((b) => b.id === c.branchId)?.corpId);
  return (c.billTo === 'この拠点' ? c.billing?.payCycle : corp?.billing.payCycle) === '年払い';
}
/** 年払いの起算月（契約開始のサイクル月から12ヶ月ごと・S3-1）。その月を含む年の起算月 */
export function annualAnchor(contractId: string, cycleMonth: string) {
  const s = CONTRACTS.find((x) => x.id === contractId)!.startCycle;
  const [a, b] = [s, cycleMonth].map((x) => x.split('-').map(Number));
  return addYm(s, Math.floor(((b[0] - a[0]) * 12 + (b[1] - a[1])) / 12) * 12);
}
/** 前払いを請求する月（年払いは起算月の前払いで12サイクル分） */
export const prepayIssueOf = (contractId: string, cycleMonth: string) =>
  annualContract(contractId) ? issueMonthOf(contractId, annualAnchor(contractId, cycleMonth)) : issueMonthOf(contractId, cycleMonth);
/** 承認済みの休止（その月を含むもの） */
const pauseIn = (contractId: string, m: string) => PAUSES.find((q) => q.contractId === contractId && q.fromCycle <= m && m <= q.toCycle);

/**
 * 子契約（サイクルごと）。請求の状態は前払いの請求月で決める（10/01 までに発行した月＝請求済、11/01 から先＝未確定）。
 * 承認済みの休止の月は「取消」として残す（休止の承認 lifecycle.applyPause と同じ形・一覧に出さない・運営の請求は前払いなし）
 */
export function buildChildContracts(): ChildContract[] {
  const out: ChildContract[] = [];
  for (const p of CHILD_PLANS) {
    const c = CONTRACTS.find((x) => x.id === p.contractId)!;
    for (const m of p.cycles) {
      const pz = pauseIn(c.id, m);
      const ok = pz && APPLICATIONS.find((x) => x.id === pz.applicationNo)?.results[0];
      const raw: ChildContract = {
        id: `${c.id}-${m.replace('-', '')}`, contractId: c.id, branchId: c.branchId, cycleMonth: m, kind: p.kind ?? c.kind,
        planId: p.planId, course: p.course, channels: p.channels, optionIds: p.optionIds ?? [], discountIds: p.discountIds ?? [],
        monthlyYen: p.monthlyYen,
        app: { allowCash: !!p.allowCash, allowGuest: false, allowEsqr: !!p.allowEsqr, dailyCapMeals: 3 },
        billStatus: pz || c.status === '仮登録' || prepayIssueOf(c.id, m) > LAST_ISSUED ? '未確定' : '請求済',
        ...(pz ? { canceled: { at: ok?.at ?? `${m.replace('-', '/')}/01 00:00`, reason: `${pz.applicationNo} 休止`, applicationId: pz.applicationNo } } : {}),
        gen: '日次バッチ',
        pricing: structuredClone(p.pricing ?? NORMAL_PRICING),
      };
      /* A型のオプションと契約項目をそろえる（ES-QR・ゲスト・現金・配送回数追加の回数。lib/domain/charges.ts） */
      const cc = syncLinkedWith(PLANS.find((x) => x.id === p.planId), raw);
      out.push({
        ...cc,
        /* ① 費目の写し（作ったときのマスタの金額） */
        fees: feesOf(cc, {
          plan: (id) => PLANS.find((x) => x.id === id), option: (id) => OPTIONS.find((x) => x.id === id), discount: (id) => DISCOUNTS.find((x) => x.id === id),
        }, `${m.replace('-', '/')}/01 00:00`),
      });
    }
  }
  return out;
}

/** 配送を作る契約か（仮登録・終了・休止の月は作らない。利用休止の契約も休止の前の月は届ける） */
const delivers = (c: Contract, cycle: string) =>
  ['有効', '解約手続き中', '利用休止'].includes(c.status) && !PAUSES.some((p) => p.contractId === c.id && p.fromCycle <= cycle && cycle <= p.toCycle);

/** 配送の明細＝その便の商品注文（order.orders）の行 */
function linesFromOrder(orders: ProductOrder[], cc: ChildContract, temp: string, slot: string, deliveryId: string): DeliveryLine[] {
  const o = orders.find((x) => x.childContractId === cc.id);
  return (o?.lines ?? []).filter((l) => l.slot === slotKey(temp, slot))
    .map((l) => ({ id: `${deliveryId}:${l.productId}`, deliveryId, productId: l.productId, plannedQty: l.qty, deliveredQty: null }));
}

/*
 * 資材の注文（運営のメニュー管理の資材注文 lib/ops/menu/seed.ts の MO のうち、共通データの拠点のもの）。
 * 1件＝1つの資材便（ES事務所 WH00004 → ヤマト）。出荷はお届けの2日前
 */
type MoSpec = [id: string, branchId: string, kind: MaterialOrder['kind'], at: string, by: string, due: string, st: MaterialOrder['status'], q: Record<string, number>, slip: string, paid: boolean, cycle?: string];
const MATERIAL_ORDERS: MoSpec[] = [
  ['MO-2605-0004', 'CU00871', 'initial_set', '2026/04/20 00:00', 'system', '2026/05/08', '納品済', { S001: 80, S002: 10, S003: 10, S004: 10, S005: 10, S007: 50, S008: 20 }, '4471-8820-0112', false],
  ['MO-2609-0026', 'CU00950', 'regular', '2026/09/18 09:12', 'CU00950', '2026/09/24', '納品済', { S001: 150, S006: 20, S007: 100 }, '4471-8820-0790', false],
  ['MO-2609-0029', 'CU00871', 'regular', '2026/09/24 13:02', 'CU00871', '2026/09/28', '納品済', { S001: 80, S007: 50 }, '4471-8820-0870', false],
  ['MO-2610-0012', 'CU00643', 'regular', '2026/10/03 10:15', 'CU00001', '2026/10/07', '出荷待', { S001: 150, S002: 20, S003: 20, S004: 20, S006: 20, S007: 100, S008: 30, S009: 50 }, '', false],
  /* 大阪支店のこのサイクル2回目の資材注文（OP000036 資材の追加配送・有料）。配送番号は共通サンプルの DL-261006-0103 */
  ['MO-2610-0013', 'CU00871', 'regular', '2026/10/04 16:20', 'CU00871', '2026/10/08', '出荷待', { S001: 1, S004: 1, S008: 1 }, '', true],
  /*
   * 大阪支店の 2026-11 分（ご利用月 2026/11/09〜）の資材注文（法人Web 注文履歴 詳細 /corp/order/history/CU00871/2026-11 の「資材」の表の見本・受付簿 No.157）。
   * 注文日の10/05 は サイクル 2026-09 の中だが、11月分の注文として登録した見本のため、サイクル月は 2026-11（お届け日 2026/11/09＝サイクル 2026-11 の A1）。
   「何回目」は納品予定日のサイクル月で数える（受付簿 #277）ので、お届け日も 2026-11 の中に置く（10/09 だと 10/08 の注文と同じサイクルの2回目になり、有料でないと check が止まる：結合テスト B3）。1回目なので無料（paid=false）
   */
  ['MO-2610-0014', 'CU00871', 'regular', '2026/10/05 09:40', 'CU00871', '2026/11/09', '出荷待', { S001: 40, S004: 5, S007: 20 }, '', false, '2026-11'],
];

export type DeliverySeed = {
  deliveries: Delivery[]; lines: DeliveryLine[]; legs: Leg[]; tracking: Tracking[];
  troubles: Trouble[]; changeRequests: ChangeRequest[]; materialOrders: MaterialOrder[];
};

export function buildDeliveries(children: ChildContract[], orders: ProductOrder[] = buildOrders(children)): DeliverySeed {
  const deliveries: Delivery[] = [];
  const lines: DeliveryLine[] = [];
  const legs: Leg[] = [];
  const tracking: Tracking[] = [];
  const seqByShip = new Map<string, number>();
  const used = new Set(Object.values(FIXED_IDS));
  const nextId = (shipOn: string) => {
    let n = seqByShip.get(shipOn) ?? 0;
    let id: string;
    do { n++; id = `DL-${yymmdd(shipOn)}-${String(n).padStart(4, '0')}`; } while (used.has(id));
    seqByShip.set(shipOn, n);
    used.add(id);
    return id;
  };

  /* お届け日の順に番号を振る */
  const plans: { cc: ChildContract; ch: ChildContract['channels'][number]; slot: string; deliverOn: string; shipOn: string }[] = [];
  for (const cc of children) {
    const c = CONTRACTS.find((x) => x.id === cc.contractId)!;
    if (!delivers(c, cc.cycleMonth)) continue;
    for (const chn of cc.channels) {
      for (const slot of chn.slots) {
        const s = schedule(CYCLES, HOLIDAYS, slotDate(cycleOf(cc.cycleMonth), slot), chn.leadDays);
        /* 回ごとのルート（上書きがあればその回だけ倉庫・運び手・中継が違う） */
        if (s) plans.push({ cc, ch: routeOfSlot(chn, slot), slot, ...s });
      }
    }
  }
  plans.sort((x, y) => x.shipOn.localeCompare(y.shipOn) || x.cc.branchId.localeCompare(y.cc.branchId));

  plans.forEach(({ cc, ch, slot, deliverOn, shipOn }, i) => {
    const b: Branch = branchOf(cc.branchId);
    const id = FIXED_IDS[`${b.id}|${deliverOn}`] ?? nextId(shipOn);
    const cyc = cycleOf(cc.cycleMonth);
    const parcel = ch.regime === 'parcel_carrier';
    const done = deliverOn < DEMO_TODAY;
    const status: Delivery['status'] = cyc.orderState === '受付中' || cyc.orderState === '受付前' ? '予定'
      : done ? '納品済'
      : shipOn < DEMO_TODAY ? (parcel ? '出荷済' : '受取済')
      : '出荷待';
    const d: Delivery = {
      id, parentId: '', branchId: b.id, contractId: cc.contractId, childContractId: cc.id, cycleMonth: cc.cycleMonth, slot,
      temp: ch.temp, serviceForm: ch.serviceForm, regime: ch.regime, warehouseId: ch.warehouseId, shipOn, deliverOn, status,
      plannedQty: ch.mealsPerDelivery, deliveredQty: done ? ch.mealsPerDelivery : null,
      deliveredAt: done ? `${deliverOn} ${parcel ? '18:00' : '11:20'}` : '', completion: done ? (parcel ? 'presumed' : 'reported') : '',
      destination: { name: b.name, address: b.address, tel: b.tel, windows: b.receiveWindows, note: b.deliveryNote },
      changeState: status === '予定' ? '変更可' : '変更不可',
      internalMemo: '',
    };
    deliveries.push(d);
    const ls = linesFromOrder(orders, cc, ch.temp, slot, id);
    /* 注文のない月（メニューがまだない 2027年1月から先）は明細なし・予定数 0（注文ができたら注文の数になる） */
    if (!orders.some((o) => o.childContractId === cc.id)) d.plannedQty = 0;
    if (done) ls.forEach((l) => { l.deliveredQty = l.plannedQty; });
    lines.push(...ls);

    /* 区間：倉庫→（ハブ→）拠点 */
    const picked = status === '受取済' || status === '納品済' ? `${shipOn} 08:${parcel ? '00' : '30'}` : '';
    const scope = ch.regime === 'partner_driver' ? 'carrier' : 'ops';
    if (ch.hubId) {
      legs.push({ id: `${id}:1`, deliveryId: id, legNo: 1, from: { type: 'warehouse', id: ch.warehouseId }, to: { type: 'relay', id: ch.hubId },
        carrierId: ch.carrierId, regime: ch.regime, isFinal: false, assignScope: scope, driverId: 'DR00014', pickedUpAt: picked });
      legs.push({ id: `${id}:2`, deliveryId: id, legNo: 2, from: { type: 'relay', id: ch.hubId }, to: { type: 'destination', id: b.id },
        carrierId: ch.carrier2Id || ch.carrierId, regime: ch.regime, isFinal: true, assignScope: scope,
        /* 11月サイクル（予定）は委託配送先がまだ割り当てていない見本 */
        driverId: status === '予定' && deliverOn > '2026/11/20' ? '' : ch.driverId, pickedUpAt: picked && `${shipOn} 14:00` });
    } else {
      legs.push({ id: `${id}:1`, deliveryId: id, legNo: 1, from: { type: 'warehouse', id: ch.warehouseId }, to: { type: 'destination', id: b.id },
        carrierId: ch.carrierId, regime: ch.regime, isFinal: true, assignScope: scope, driverId: parcel ? '' : ch.driverId, pickedUpAt: picked });
    }
    if (parcel && status !== '予定' && status !== '出荷待') {
      tracking.push({ id: `${id}:1`, deliveryId: id, carrierId: ch.carrierId, trackingNo: `4471-${yymmdd(shipOn).slice(2)}-${String(i).padStart(4, '0')}`, boxNo: 1, boxTotal: 1, status: 'active' });
    }
  });

  /* ---- トラブルの見本：大阪支店 9/15 の便で箱数不足 → 一部納品済、残りを子の配送で 9/17 に届けた ---- */
  const troubles: Trouble[] = [];
  const osakaSep = deliveries.find((d) => d.branchId === 'CU00871' && d.cycleMonth === '2026-09' && d.slot === 'A2');
  if (osakaSep) {
    osakaSep.status = '一部納品済';
    osakaSep.deliveredQty = osakaSep.plannedQty - 5;
    const childId = `${osakaSep.id}-1`;
    /* 足りなかった5食は5食以上ある明細の1行（届けた数がマイナスにならないように） */
    const ls = lines.filter((l) => l.deliveryId === osakaSep.id).sort((a, b) => Number(b.plannedQty >= 5) - Number(a.plannedQty >= 5));
    ls[0].deliveredQty = ls[0].plannedQty - 5;
    deliveries.push({
      ...osakaSep, id: childId, parentId: osakaSep.id, slot: 'A4', shipOn: '2026/09/16', deliverOn: '2026/09/17', status: '納品済',
      plannedQty: 5, deliveredQty: 5, deliveredAt: '2026/09/17 10:40', internalMemo: '箱数不足の残り5食（TR-260915-0001）',
    });
    lines.push({ id: `${childId}:${ls[0].productId}`, deliveryId: childId, productId: ls[0].productId, plannedQty: 5, deliveredQty: 5 });
    legs.push({ ...legs.find((l) => l.deliveryId === osakaSep.id)!, id: `${childId}:1`, deliveryId: childId, pickedUpAt: '2026/09/16 08:30' });
    troubles.push({
      id: 'TR-260915-0001', deliveryId: osakaSep.id, typeId: 'qty_diff', reportedBy: { site: 'driver', accountId: 'DR00041' },
      reportedAt: `${osakaSep.deliverOn} 11:05`, note: '箱数不足（1箱足りない）。運営に連絡済み', resolution: 'partial', resolvedAt: `${osakaSep.deliverOn} 15:30`, childDeliveryId: childId,
    });
  }
  /*
   * ---- お届け中の見本：横浜営業所（COOL便）の 9/29 の冷蔵の便に追加で手配した配送が、出荷済でまだ届いていない（10/02 出荷・10/06 お届け予定）。
   *      法人Web の棚卸報告に「お届け中の商品があります」と「届いた数」が出る見本（受付簿 No.157）。親の便は納品済のまま（足りなかった分の補充ではない） ----
   */
  const yokoA = deliveries.find((d) => d.branchId === 'CU00950' && d.temp === '冷蔵' && d.deliverOn === '2026/09/29' && !d.parentId);
  const yokoL = yokoA ? lines.find((l) => l.deliveryId === yokoA.id && l.plannedQty >= 4) : undefined;
  if (yokoA && yokoL) {
    const childId = `${yokoA.id}-1`;
    deliveries.push({
      ...yokoA, id: childId, parentId: yokoA.id, slot: 'A4', shipOn: '2026/10/02', deliverOn: '2026/10/06', status: '出荷済', changeState: '変更不可',
      plannedQty: 4, deliveredQty: null, deliveredAt: '', completion: '', internalMemo: '追加配送（9/29 の便に追加で手配した4食。COOL便・出荷済）',
    });
    lines.push({ id: `${childId}:${yokoL.productId}`, deliveryId: childId, productId: yokoL.productId, plannedQty: 4, deliveredQty: null });
    const lg = legs.find((l) => l.deliveryId === yokoA.id)!;
    legs.push({ ...lg, id: `${childId}:1`, deliveryId: childId, pickedUpAt: '2026/10/02 15:00' });
    tracking.push({ id: `${childId}:1`, deliveryId: childId, carrierId: lg.carrierId, trackingNo: '4471-2610-0902', boxNo: 1, boxTotal: 1, status: 'active' });
  }

  /* 未解決のトラブル：ひかり物産 川崎工場の直近の便で遅延（運営の対応待ち） */
  const kawasaki = deliveries.filter((d) => d.branchId === 'CU01902' && d.deliverOn < DEMO_TODAY).pop();
  if (kawasaki) {
    troubles.push({
      id: `TR-${yymmdd(kawasaki.deliverOn)}-0001`, deliveryId: kawasaki.id, typeId: 'delay', reportedBy: { site: 'driver', accountId: 'DR00011' },
      reportedAt: `${kawasaki.deliverOn} 11:50`, note: '首都高の事故で到着が 12:40 になった（受取時間外）', resolution: '', resolvedAt: '', childDeliveryId: '',
    });
  }

  /* ---- お届け日の変更申請（見本。法人Web のホーム・お届け詳細・申請一覧の各状態を見本データで出せるようにする：受付簿 No.157）
        ・DD-20261005-0095：大阪支店 11/10 → 第1希望 11/12・第2希望 11/17。運営が「別の日のご提案」（11/13）を出した状態（法人のご返事待ち）
        ・DD-20261005-0096：大阪支店 12/08 → 第1希望 12/10・第2希望 12/11。申請中（運営の確認待ち）
        ・DD-20260930-0001：大阪支店 12/22 → 第1希望 12/24。否認（10/02 に運営が処理。ホームの「申請の結果」に14日間出る） ---- */
  const changeRequests: ChangeRequest[] = [];
  const putCr = (cr: Omit<ChangeRequest, 'branchId' | 'currentDate' | 'requestedBy'> & { by?: string }, state: Delivery['changeState']) => {
    const d = deliveries.find((x) => x.id === cr.deliveryId);
    if (!d) return;
    d.changeState = state;
    const { by, ...rest } = cr;
    changeRequests.push({ ...rest, branchId: d.branchId, currentDate: d.deliverOn, requestedBy: { site: 'corp', accountId: by ?? d.branchId } });
  };
  putCr({ id: 'DD-20261005-0095', deliveryId: 'DL-261109-0001', requestedAt: '2026/10/05 09:12', wishDates: ['2026/11/12', '2026/11/17'], reason: '社内イベントのため不在',
    status: '別の日のご提案', proposedDate: '2026/11/13', decidedAt: '2026/10/05 14:20', decisionReason: 'ご希望の日は配送の枠に空きがありません' }, '提案中');
  putCr({ id: 'DD-20261005-0096', deliveryId: 'DL-261207-0001', requestedAt: '2026/10/05 10:30', wishDates: ['2026/12/10', '2026/12/11'], reason: '拠点の棚卸しと重なるため',
    status: '申請中', proposedDate: '', decidedAt: '', decisionReason: '' }, '申請中');
  putCr({ id: 'DD-20260930-0001', deliveryId: 'DL-261221-0001', requestedAt: '2026/09/30 10:05', wishDates: ['2026/12/24'], reason: '年末の棚卸しのため',
    status: '否認', proposedDate: '', decidedAt: '2026/10/02 15:40', decisionReason: '12/24 は配送の枠に空きがないため' }, '変更可');

  /* ---- 資材の配送（資材の注文ごとに1つ） ---- */
  const materialOrders: MaterialOrder[] = [];
  for (const [moId, branchId, kind, at, by, due, st, q, slip, paid, cycle] of MATERIAL_ORDERS) {
    const b = branchOf(branchId);
    const shipOn = addDays(due, -2);
    const id = moId === 'MO-2610-0013' ? 'DL-261006-0103' : nextId(shipOn);
    const done = st === '納品済';
    const qty = Object.values(q).reduce((a, x) => a + x, 0);
    deliveries.push({
      id, parentId: '', branchId, contractId: CONTRACTS.find((c) => c.branchId === branchId)!.id, childContractId: '', cycleMonth: '', slot: '',
      temp: '資材', serviceForm: '資材便', regime: 'parcel_carrier', warehouseId: 'WH00004', shipOn, deliverOn: due,
      status: done ? '納品済' : st === '出荷待' ? '出荷待' : '出荷済', plannedQty: qty, deliveredQty: done ? qty : null,
      deliveredAt: done ? `${due} 18:00` : '', completion: done ? 'presumed' : '',
      destination: { name: b.name, address: b.address, tel: b.tel, windows: b.receiveWindows, note: b.deliveryNote },
      changeState: '変更不可', internalMemo: paid ? `このサイクル2回目の資材注文（${MAT_EXTRA_OPTION} ${(OPTIONS.find((o) => o.id === MAT_EXTRA_OPTION)?.amountYen ?? 0).toLocaleString('ja-JP')}円）` : '',
    });
    legs.push({ id: `${id}:1`, deliveryId: id, legNo: 1, from: { type: 'warehouse', id: 'WH00004' }, to: { type: 'destination', id: branchId },
      carrierId: 'DE00002', regime: 'parcel_carrier', isFinal: true, assignScope: 'ops', driverId: '', pickedUpAt: done ? `${shipOn} 15:00` : '' });
    if (slip) tracking.push({ id: `${id}:1`, deliveryId: id, carrierId: 'DE00002', trackingNo: slip, boxNo: 1, boxTotal: 1, status: 'active' });
    /* 注文したサイクル月（2回目の判定はサイクル・2026/10/03） */
    const cyc = cycle ?? CYCLES.find((c) => c.a1 <= at.slice(0, 10) && at.slice(0, 10) <= c.d7)?.id ?? at.slice(0, 7).replace('/', '-');
    materialOrders.push({ id: moId, branchId, kind, orderedAt: at, orderedBy: by, dueOn: due, deliveryId: id, paid, status: st, ...(kind === 'regular' ? { cycleMonth: cyc } : {}),
      /* 出荷した注文は、運営が資材注文管理で入れた発送日・送り状番号（受付簿 No.154。見本は出荷日と送り状） */
      ...(slip && st !== '出荷待' ? { shippedOn: shipOn.replace(/\//g, '-'), trackingNo: slip } : {}),
      lines: Object.entries(q).map(([materialId, n]) => ({ materialId, qty: n })) });
  }

  /* 納品した配送の写し（商品名・区間の支払額。拠点名は作ったときの destination.name のまま＝lib/domain/snapshot.ts の stampDelivered と同じ） */
  const done = new Set(deliveries.filter((d) => DELIVERED.includes(d.status)).map((d) => d.id));
  for (const l of lines) if (done.has(l.deliveryId)) l.productName = PRODUCTS.find((x) => x.id === l.productId)?.name ?? l.productId;
  for (const l of legs) if (done.has(l.deliveryId)) l.feeYen = carrierFeeFor(CARRIERS.find((x) => x.id === l.carrierId), BRANCHES.find((b) => b.id === deliveries.find((d) => d.id === l.deliveryId)?.branchId)?.address?.pref);

  /* 出荷日（実績）：見本は倉庫から出た配送が予定の出荷日どおりに出た（本物は出荷実績の取込で入る） */
  for (const d of deliveries) if (!['予定', '出荷待', '取消'].includes(d.status)) d.shippedOn = d.shipOn;

  deliveries.sort((x, y) => x.shipOn.localeCompare(y.shipOn) || x.id.localeCompare(y.id));
  return { deliveries, lines, legs, tracking, troubles, changeRequests, materialOrders };
}

