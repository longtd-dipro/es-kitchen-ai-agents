import type { DocRepo } from '@/lib/ops/core/area';
import type {
  Account, Branch, ChildContract, Contract, Corp, Cycle, Delivery, Loan, MaterialOrder, Model, MonthlyMenu, OrderPref,
  Plan, Product as DProduct, ProductOrder, Tracking, Warehouse,
} from '@/lib/domain/types';
import { mgmtNameOf, selectedSupplier, shortLabel, vmModelsOf } from '@/lib/domain/product';
import { supplierName } from '../general/fromDomain';
import { avgCostOf, avgTargetOf, menuIds, phaseOf, type SaveItemIn } from '@/lib/domain/menu';
import { isNormal } from '@/lib/domain/alt';
import { closedSlots } from '@/lib/domain/areas/order';
import { addD } from './logic';
import { materialsOf } from '@/lib/domain/material';
import { matImg } from '@/lib/domain/matPhoto';
import type { Base, DlSlot, Frame, MatOrder, Material, Menu, Order, Product, Qty, Site, SitePref, Temp } from './types';
import { fmtDate, fmtDateTime } from '@/lib/format/date';
import { yen } from '@/lib/format/money';
import { baseRatioOf, cycleMonthAt, MAT_EXTRA_OPTION } from '@/lib/domain/charges';
import { isTrialCycle, matLeadDays, matOrdinal, matVer } from '@/lib/domain/matOrder';

/*
 * 共通データ（lib/domain・dm.*）から、メニュー管理の画面の形（商品・拠点・サイクル・月間メニュー・商品注文・資材注文・拠点の設定）を作る。
 *   商品＝dm.master.products、拠点＝dm.org（便・食数は子契約の channels）、サイクルの A1＝dm.delivery.cycles、
 *   月間メニュー＝dm.order.menus、商品注文＝dm.order.orders、拠点の設定＝dm.order.prefs、資材注文＝dm.delivery.materialOrders（＋資材便の配送）
 * 基準注文数は共通データの月間メニュー（items[].base）。
 * 共通データにない画面の項目（自販機の品数・公開したときの平均単価の目標・調整率・調整数・補償の行）は
 * 運営の kind から受け取る（menu.menuBase・menu.orderAdj）。資材のコース・単位・規格・写真は資材マスタ（dm.master.materials）。
 */

const TEMP: Record<string, Temp> = { 冷蔵: 'chilled', 冷凍: 'frozen', 常温: 'ambient' };
const FRAME_L: Record<Frame, string> = { W: 'ダブル', S: 'シングル', B: 'ベルト' };
const name = (r: DocRepo, id: string) => r.get<Account>('dm.account.accounts', id)?.name ?? id;

/* ---------- 商品 ---------- */

/** 商品（past＝前のサイクルの注文の数・全拠点の合計の 1/10。基準数の重みの初期値） */
export function productsFor(r: DocRepo, pastCycle: string): Product[] {
  const past = new Map<string, number>();
  r.list<ProductOrder>('dm.order.orders').filter((o) => o.cycleMonth === pastCycle).forEach((o) => o.lines.forEach((l) => past.set(l.productId, (past.get(l.productId) ?? 0) + l.qty)));
  return r.list<DProduct>('dm.master.products').map((p, i) => ({
    id: p.id, name: p.name, cat: p.category, catId: p.categoryId, st: TEMP[p.temp] ?? 'chilled', keep: TEMP[p.storage?.display ?? p.temp] ?? 'chilled', price: p.priceYen, exp: shortLabel(p),
    vm: p.vmFrame, vmL: p.vmFrame ? FRAME_L[p.vmFrame] : '', past: Math.round((past.get(p.id) ?? 0) / 10), img: i + 1,
    /* 拠点に出せるか（domain の eligible と同じ決まり）：ピッキング倉庫・コース・自販機の対応機種 */
    wh: p.pickWarehouseIds, courses: p.courses, vmModels: p.vending.models, off: p.status === '削除済' || undefined,
    /* 管理名（公開名と同じなら空）・仕入先名（選択中の1社。運営の注文の画面に出す：受付簿 #245） */
    mgmt: mgmtNameOf(p) !== p.name ? mgmtNameOf(p) : '', sup: (() => { const sp = selectedSupplier(p); return sp ? supplierName(r, sp.supplierId) : ''; })(),
  }));
}

/**
 * 資材（資材マスタ dm.master.materials：コース・単位・規格・写真もここ。受付簿 #358）。削除済は除く。
 * 非公開の資材も出す（運営の資材注文管理・在庫の選択肢には出せる：台帳 F。法人Webへの表示だけ lib/corp/order/fromDomain.ts が外す）
 */
export const materialsFor = (r: DocRepo): Material[] =>
  materialsOf(r).map((m, i) => ({ id: m.id, name: m.name, course: m.courses.join('・'), unit: m.unit, spec: m.spec, ...matImg(m.photo, 40 + i) }));

/* ---------- サイクル ---------- */

/** 各サイクルの A1（月曜）。共通データのサイクルの暦。暦がない月は 28日ずつ前後に延ばす */
export function a1For(r: DocRepo, from = '2026-05', to = '2027-03'): Record<string, string> {
  const cs = r.list<Cycle>('dm.delivery.cycles').sort((x, y) => x.id.localeCompare(y.id));
  const out: Record<string, string> = Object.fromEntries(cs.map((c) => [c.id, c.a1]));
  if (!cs.length) return out;
  const step = (ym: string, n: number) => { const [y, m] = ym.split('-').map(Number); const d = new Date(y, m - 1 + n, 1); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`; };
  for (let ym = step(cs[0].id, -1), a = cs[0].a1; ym >= from; ym = step(ym, -1)) { a = addD(a, -28); out[ym] = a; }
  for (let ym = step(cs[cs.length - 1].id, 1), a = cs[cs.length - 1].a1; ym <= to; ym = step(ym, 1)) { a = addD(a, 28); out[ym] = a; }
  return out;
}

/* ---------- 拠点 ---------- */

/** 子契約の便（冷蔵・常温＝c1…、冷凍＝f1…）。枠は子契約の channels */
function dlOf(cc: ChildContract): DlSlot[] {
  const cold = cc.channels.filter((c) => c.temp !== '冷凍').flatMap((c) => c.slots), fz = cc.channels.filter((c) => c.temp === '冷凍').flatMap((c) => c.slots);
  return [
    ...cold.map((slot, i) => ({ k: 'c' + (i + 1), l: '第' + (i + 1) + '便', slot, t: 'chilled' as const, n: i + 1 })),
    ...fz.map((slot, i) => ({ k: 'f' + (i + 1), l: '冷凍 第' + (i + 1) + '便', slot, t: 'frozen' as const, n: i + 1 })),
  ];
}
const mealsOf = (cc: ChildContract, frozen: boolean) => cc.channels.filter((c) => (c.temp === '冷凍') === frozen).reduce((s, c) => s + c.slots.length * c.mealsPerDelivery, 0);

/** 拠点（有効・休止中・解約手続き中の親契約があり、子契約があるもの）。値は cycle の子契約（なければいちばん新しい子契約） */
export function sitesFor(r: DocRepo, cycle: string): Site[] {
  const out: Site[] = [];
  for (const b of r.list<Branch>('dm.org.branches')) {
    const ct = r.list<Contract>('dm.org.contracts').find((c) => c.branchId === b.id);
    if (!ct || !['有効', '利用休止', '解約手続き中'].includes(ct.status)) continue;
    const ccs = r.list<ChildContract>('dm.org.childContracts').filter((c) => c.contractId === ct.id && !c.canceled).sort((x, y) => x.cycleMonth.localeCompare(y.cycleMonth));
    const cc = ccs.find((c) => c.cycleMonth === cycle) ?? ccs[ccs.length - 1];
    if (!cc) continue;
    const corp = b.corpId ? r.get<Corp>('dm.org.corps', b.corpId) : undefined;
    const plan = r.get<Plan>('dm.master.plans', cc.planId);
    const cold = mealsOf(cc, false), fz = mealsOf(cc, true), wh = r.get<Warehouse>('dm.master.warehouses', cc.channels[0]?.warehouseId ?? '');
    const loans = r.list<Loan>('dm.org.loans').filter((l) => l.branchId === b.id && l.status !== '回収済');
    const models = r.list<Model>('dm.master.models');
    const pref = r.get<OrderPref & { applyNext?: boolean }>('dm.order.prefs', b.id);
    out.push({
      id: b.id, corp: b.corpId ?? '', corpName: corp?.name ?? b.name, short: corp && b.name.startsWith(corp.name + ' ') ? b.name.slice(corp.name.length + 1) : b.name,
      plan: cold + fz, planId: cc.planId, course: cc.course, dlvKind: [...new Set(cc.channels.map((c) => c.serviceForm))].join('・'),
      eq: loans.map((l) => (r.get<Model>('dm.master.models', l.modelId)?.name ?? l.modelId) + (l.qty > 1 ? `×${l.qty}` : '')).join('・') || '—',
      /* ESスタンダードは冷凍の枠を持つ（冷凍の便がなければ 0 個） */
      cap: { chilled: [0, cold], ...(fz || cc.course === 'ESスタンダード' ? { frozen: [fz ? 1 : 0, fz] as [number, number] } : {}) },
      /* 基本比×倍＝プランマスタの設定（なければ食数 ÷ 50） */
      mult: baseRatioOf(plan, cold + fz), dl: dlOf(cc),
      addr: `${b.address.pref}${b.address.city}${b.address.addr1}${b.address.addr2 ? ' ' + b.address.addr2 : ''}`,
      wh: wh ? `${wh.id} ${wh.name}` : '—', kid: cc.id, ai: pref?.applyNext ? 'ON' : 'OFF',
      whId: cc.channels[0]?.warehouseId, vmModels: vmModelsOf(loans, models, b.id),
      trial: cc.kind === 'お試しキャンペーン' || undefined,
      ended: ct.status === '解約手続き中' ? ccs[ccs.length - 1].cycleMonth : undefined,
      paused: ct.status === '利用休止' || undefined,
    });
  }
  return out;
}

/* ---------- 月間メニュー ---------- */

/** 運営だけが持つ月間メニューの項目（menu.menuBase。id＝サイクル月）。基準注文数は共通データに移した（base は古いデータの名残・読まない） */
export type MenuX = { id: string; base?: Record<string, Base>; vmN?: Menu['vmN']; upd?: string };

/** 共通データの月間メニュー → 画面の月間メニュー（基準注文数は共通データ。lite＝std） */
export const menuFor = (r: DocRepo, m: MonthlyMenu, x: MenuX | undefined): Menu => ({
  ym: m.id, id: m.id.replace('-', ''), status: phaseOf(m), pub: m.publishOn, from: m.orderFrom, to: m.orderTo, items: menuIds(m),
  upd: m.updatedAt ? `${fmtDateTime(m.updatedAt)} ${m.updatedBy === 'system' ? 'システム' : name(r, m.updatedBy)}` : x?.upd ?? '',
  base: Object.fromEntries(m.items.map((i) => [i.productId, { std: i.base.std, lite: i.base.std, ns: i.base.ns, vm: i.base.vm, man: { ...i.manual } }])),
  ...(x?.vmN ? { vmN: x.vmN } : {}), avgT: avgTargetOf(m), dm: m,
  /* メニュー一覧の 平均仕入単価（50プラン・税抜。RD-MN-048） */
  avgCost: avgCostOf(m, (id) => r.get<DProduct>('dm.master.products', id)),
});

/**
 * 画面の月間メニュー → 共通データに保存する商品（表示順）。今の値から変えた基準注文数は「手で直した値」にする
 * （ライトの列だけ変えたときはその値を std に）。新しい商品・変えていない値は自動（共通データが入れ直す）
 */
export function itemsOf(m: Menu, cur: MonthlyMenu | undefined): SaveItemIn[] {
  return m.items.map((id) => {
    const b = m.base[id], old = cur?.items.find((x) => x.productId === id);
    if (!b) return { productId: id };
    const ob = old?.base ?? { std: 0, ns: 0, vm: 0 }, man = { std: false, ns: false, vm: false, ...old?.manual, ...b.man };
    const std = b.std !== ob.std ? b.std : b.lite !== ob.std ? b.lite : ob.std, ns = b.ns ?? ob.ns, vm = b.vm ?? ob.vm;
    /* 新しい商品は 0 より大きい値を入れたら手で直した値 */
    if (old ? std !== ob.std : std > 0) man.std = true;
    if (old ? ns !== ob.ns : ns > 0) man.ns = true;
    if (old ? vm !== ob.vm : vm > 0) man.vm = true;
    return { productId: id, base: { std, ns, vm }, manual: man };
  });
}

/* ---------- 商品注文 ---------- */

/** 調整数は共通データの注文（ProductOrder.adjust）が持つ（出荷指示・発注・理論在庫に反映するため。受付簿 #252）。運営の kind menu.orderAdj は前の形の名残・読まない */

const PATTERN: Record<string, string> = { 差替: '① 差し替え', 補償: '② 補償', 除外: '③ 除外のみ' };
/** 共通データの代替品の行（差替・補償・除外）→ 画面の「代替品・補償の追加」の行 */
function extraOf(r: DocRepo, o: ProductOrder, s: Site): Order['extra'] {
  const pn = (id: string) => r.get<DProduct>('dm.master.products', id)?.name ?? id;
  return o.lines.filter((l) => !isNormal(l)).map((l) => {
    const d = s.dl.find((x) => slotKey(x) === l.slot);
    const dl = (l.deliveryId ? `追加配送 ${l.deliveryId}` : d ? d.l : l.slot) + (l.movedTo ? `（代替品は ${l.movedTo}）` : '') + (l.fromOrderId ? `（${l.fromOrderId} の分）` : '');
    const kind = l.kind === '除外' && l.movedTo ? '① 差し替え（入荷待ち・別便）' : PATTERN[l.kind!];
    return {
      alt: l.altId ?? '', kind, dl, name: l.kind === '除外' ? pn(l.productId) : `${pn(l.altOf ?? '')} → ${pn(l.productId)}`, n: l.qty,
      bill: l.kind === '差替' ? `元の商品の単価（${l.billPrice ?? 0}円）` : l.kind === '補償' ? '請求しない（実績精算に0円の行）' : '請求しない',
      flow: l.kind === '除外' ? '配送データの明細から外す・お客様へ「納品分に含まれません」' : `配送データの明細に「代替品（元：${pn(l.altOf ?? '')}）」`,
    };
  });
}

/** 便のキー（共通データの slot＝温度帯:枠）→ 画面の便 */
const dlKey = (dl: DlSlot[], slot: string) => {
  const [temp, s] = slot.split(':');
  return dl.find((d) => d.slot === s && (d.t === 'frozen') === (temp === '冷凍'))?.k;
};
/** 画面の便 → 共通データの slot */
export const slotKey = (d: DlSlot) => `${d.t === 'frozen' ? '冷凍' : '冷蔵'}:${d.slot}`;

/** 調整率（%）＝調整数 ÷ 食数（小数1桁。入力しない：受付簿 #272） */
export const adjRate = (n: number, plan: number) => (plan ? Math.round(n / plan * 1000) / 10 : 0);

/** 注文の版（同時更新の検知 E31）：注文の更新・変更履歴の数・配送の状態と出荷指示の版。出荷指示に拾い上げられると変わる */
export const orderVer = (r: DocRepo, o: ProductOrder) =>
  `${o.updatedAt}|${o.log.length}|` + r.list<Delivery>('dm.delivery.deliveries').filter((d) => d.childContractId === o.childContractId).map((d) => `${d.status}${d.shipRev ?? ''}`).join(',');

/** 共通データの商品注文 → 画面の注文。q は拠点のメニューの商品を 0 で埋めてから入れる（メニューから外れた商品も注文に残っていれば出す） */
export function orderFor(r: DocRepo, o: ProductOrder, s: Site, prods: Product[]): Order {
  const q: Qty = {}, a: Qty = {};
  prods.forEach((p) => { q[p.id] = {}; a[p.id] = {}; s.dl.filter((d) => (p.st === 'frozen') === (d.t === 'frozen')).forEach((d) => { q[p.id][d.k] = 0; a[p.id][d.k] = 0; }); });
  /* 数は通常の行だけ（代替品の行は extra。運営が注文を保存しても代替品の行は共通データに残る） */
  o.lines.filter(isNormal).forEach((l) => { const k = dlKey(s.dl, l.slot); if (k) { q[l.productId] = q[l.productId] ?? {}; q[l.productId][k] = (q[l.productId][k] ?? 0) + l.qty; if (!a[l.productId]) a[l.productId] = {}; if (a[l.productId][k] == null) a[l.productId][k] = 0; } });
  let adjN = 0;
  (o.adjust ?? []).forEach((x) => { const k = dlKey(s.dl, x.slot); if (!k) return; q[x.productId] = q[x.productId] ?? {}; if (q[x.productId][k] == null) q[x.productId][k] = 0; a[x.productId] = a[x.productId] ?? {}; a[x.productId][k] = (a[x.productId][k] ?? 0) + x.qty; adjN += x.qty; });
  const who = (by: string) => (by === 'system' ? 'システム' : name(r, by));
  const cy = r.get<Cycle>('dm.delivery.cycles', o.cycleMonth);
  const shutKeys = closedSlots(r, o.cycleMonth, s.dl.map(slotKey));
  return {
    no: o.id, site: o.branchId, ym: o.cycleMonth, status: o.status, rate: adjRate(adjN, s.plan), q, a, extra: extraOf(r, o, s),
    shut: Object.fromEntries(s.dl.filter((d) => shutKeys.has(slotKey(d))).map((d) => [d.k, true])),
    closeOn: { front: cy?.b7 ?? '', back: cy?.d7 ?? '' },
    log: o.log.map((l) => ({ at: l.at, who: who(l.by), what: l.what, detail: l.detail, item: l.item, before: l.before, after: l.after, why: l.why })), upd: o.updatedAt,
    ver: orderVer(r, o),
  };
}
/** 画面の注文 → 共通データの注文の行 */
export const linesOf = (o: Order, s: Site) =>
  Object.entries(o.q).flatMap(([productId, byDl]) => Object.entries(byDl).filter(([, n]) => n > 0)
    .map(([k, qty]) => { const d = s.dl.find((x) => x.k === k); return d ? { productId, slot: slotKey(d), qty } : null; })
    .filter((x): x is { productId: string; slot: string; qty: number } => !!x));
/** 画面の調整数 → 共通データの調整数の行 */
export const adjustOf = (o: Order, s: Site) =>
  Object.entries(o.a).flatMap(([productId, byDl]) => Object.entries(byDl).filter(([, n]) => n > 0)
    .map(([k, qty]) => { const d = s.dl.find((x) => x.k === k); return d ? { productId, slot: slotKey(d), qty } : null; })
    .filter((x): x is { productId: string; slot: string; qty: number } => !!x));

/* ---------- 拠点の設定 ---------- */

export const prefFor = (r: DocRepo, p: OrderPref & { applyNext?: boolean }): SitePref => ({
  cats: p.categories, short: p.allowShortLife, price: p.priceRange, ex: p.excluded, next: p.applyNext, upd: `${fmtDateTime(p.updatedAt)} ${name(r, p.updatedBy)}`,
});

/* ---------- 資材注文 ---------- */

const KIND: Record<MaterialOrder['kind'], MatOrder['kind']> = { initial_set: '初期セット', regular: '通常注文' };

/** 資材便の配送のメモ（日時 内容）を変更履歴にする（新しい順） */
const logOf = (d: Delivery | undefined): MatOrder['log'] =>
  (d?.internalMemo ?? '').split('\n').map((l) => l.match(/^(\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}) (.+)$/)).filter(Boolean).map((m) => [m![1], m![2], '運営'] as [string, string, string]).reverse();

export function matFor(r: DocRepo, m: MaterialOrder): MatOrder {
  const fee = r.get<{ amountYen: number }>('dm.master.options', MAT_EXTRA_OPTION)?.amountYen ?? 0;
  const d = r.get<Delivery>('dm.delivery.deliveries', m.deliveryId);
  const tr = r.list<Tracking>('dm.delivery.tracking').find((t) => t.deliveryId === m.deliveryId && t.status === 'active');
  return {
    no: m.id, site: m.branchId, kind: KIND[m.kind], at: m.orderedAt,
    by: m.orderedBy === 'system' ? 'システム（仮登録で自動作成）' : name(r, m.orderedBy), due: m.dueOn, st: m.status,
    q: Object.fromEntries(m.lines.map((l) => [l.materialId, l.qty])),
    sent: d && m.status !== '出荷待' && m.status !== '取消' ? `${fmtDate(d.shipOn)} 06:00` : '',
    /* 送り状番号：運営が資材注文管理で入れた値（受付簿 No.154）、なければ送り状の取込の値 */
    inv: m.trackingNo || tr?.trackingNo || '', shippedOn: m.shippedOn ?? '', trackingNo: m.trackingNo ?? '', dlId: m.deliveryId,
    memo: m.paid ? `このサイクル2回目の資材注文（${MAT_EXTRA_OPTION} ${yen(fee)}）` : '', log: logOf(d),
    /* リードタイム・何回目（納品予定日のサイクル月）・お試し・追加配送料・版（lib/domain/matOrder.ts） */
    lead: matLeadDays(r, m.branchId, m.orderedAt.slice(0, 10)), nth: matOrdinal(r, m), trial: isTrialCycle(r, m.branchId, cycleMonthAt(r, m.dueOn)), fee, ver: matVer(r, m),
  };
}
