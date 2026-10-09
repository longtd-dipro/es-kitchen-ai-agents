import { ApiError } from '@/lib/api/errors';
import { isRealDate } from './dateCheck';
import type { DocRepo } from '@/lib/ops/core/area';
import { addDays, nowStamp, today } from '@/lib/supplier/dates';
import { canDeliver, slotOf } from './calendar';
import { unitPrice } from './menu';
import { notifyBranch } from './notify';
import { costOn, productCourseOf, selectedSupplier, supplierNameOf, vmFits, vmModelsOf } from './product';
import type {
  AltDisposal, AltPo, AltRow, AltSetting, AltShortage, ChildContract, Contract, Cycle, Delivery, DeliveryLine, DeliveryReport, Holiday, Leg, Loan, Model,
  OrderLine, Product, ProductOrder, SupplierClaim, Warehouse,
} from './types';

/*
 * 代替品設定（2026/10/01 決定の3パターン・Q-ALT1〜10＝おすすめ・OPEN-2〜4＝A、2026/10/02 の追加の決定）。
 * 01_仕様/50_注文/質問一覧_代替品設定と下流への影響_20261001.md、00_確認してほしい/課題一覧_データ統合と画面_20261002.md（末尾）。
 *   ① 差し替え：対象期間（出荷日）の、まだ出荷していない便。不良商品の数を代替商品に替える（請求は元の商品のメニューの単価）。
 *      出荷指示を送ったあと（出荷日の前まで）なら版番号つきで再送（shipRev+1）。出荷日以降は ② になる
 *   ② 補償：出荷済みの便（既納品）。不良発覚日より後のその拠点の最初の便に代替商品を足す（請求は0円の行）。
 *      次の便がない・14日より先なら追加配送（子の配送・配送費は ES 負担）。便ごとに 次の便／その次の便／追加配送 に変えられる
 *   ③ 除外のみ：まだ出荷していない便から不良商品を外すだけ（請求しない）
 * 代替商品：同じ温度帯・コース・倉庫の商品を提案（altSuggest）。ほかの商品も選べる（警告つき）。商品マスタにある商品だけ
 * 在庫：保存の前に倉庫ごとの 必要数／倉庫在庫／入荷予定／不足 を出す（stock は呼ぶ側＝運営の発注・倉庫在庫から渡す。
 *   渡さないときは倉庫在庫 0・入荷予定＝これまでの代替品の追加発注だけで数える）。createPo（既定 true）で不足分の追加発注（dm.order.altPos）を作り、
 *   入荷予定日より前の便は入荷のあとのその拠点の最初の便に回す（その便では元の商品を除外・請求しない → 後の便で代替品を届け、元の単価で1回だけ請求）
 * 代替商品が拠点の便の倉庫にない → 在庫のある倉庫から追加配送（ES 負担）。倉庫間の移動はまだ作らない
 * 不良ロット：返品／廃棄（どちらも出荷停止）。仕入先への請求＝不良の数 × 仕入単価（dm.order.supplierClaims・不良控除・マイナスの額）
 * 拠点に残る不良品：廃棄として記録（管理ロスにしない）。ES配送便＝ドライバーが次の便で回収、COOL便＝法人が廃棄して棚卸報告で申告
 */

export const ALTS = 'dm.order.alts';
export const ALT_POS = 'dm.order.altPos';
export const CLAIMS = 'dm.order.supplierClaims';
/** 追加発注の入荷予定（発注から何日後。仮。仕入先が仕入先サイトで納期を回答したら、その日に直す＝altPoAnswered・etaFrom） */
export const ALT_PO_LEAD = 3;
/** 次の便がこれより先なら追加配送（OPEN-4＝A） */
const FAR_DAYS = 14;

/** 配送（委託配送先・ドライバーの見方では運営のメモを除く） */
type DL = Omit<Delivery, 'internalMemo'>;

/* ---------------- 行の種類（注文・配送の明細） ---------------- */

export const isNormal = (l: Pick<OrderLine, 'kind'>) => !l.kind || l.kind === '通常';
/** 月の上限に数える行（通常・差替。補償は ES の負担、除外は届けない。ほかの月の注文の分の差替は数えない） */
export const countsToLimit = (l: Pick<OrderLine, 'kind' | 'fromOrderId'>) => isNormal(l) || (l.kind === '差替' && !l.fromOrderId);
/** 配送の明細になる行（除外は届けない） */
export const onDelivery = (l: Pick<OrderLine, 'kind'>) => l.kind !== '除外';
/** 明細の ID（代替品の行は代替品設定の ID を付ける） */
export const lineIdOf = (deliveryId: string, l: Pick<OrderLine, 'productId' | 'kind' | 'altId'>) =>
  isNormal(l) ? `${deliveryId}:${l.productId}` : `${deliveryId}:${l.productId}:${l.altId || l.kind}`;

/** 注文の調整数（サービスで足す数）→ 通常の行と同じ形の行。配送の明細・予定数に足す（出荷指示・発注・理論在庫に入れる。月の上限・便の差には数えない） */
export const adjustLinesOf = (o: Pick<ProductOrder, 'adjust'> | null | undefined): OrderLine[] =>
  (o?.adjust ?? []).filter((a) => a.qty > 0).map((a) => ({ productId: a.productId, slot: a.slot, qty: a.qty, service: true }));
/** 注文の行 → 配送の明細（除外を除き、同じ ID は足す） */
export function toDeliveryLines(deliveryId: string, lines: OrderLine[]): DeliveryLine[] {
  const m = new Map<string, DeliveryLine>();
  for (const l of lines.filter(onDelivery)) {
    const id = lineIdOf(deliveryId, l);
    const cur = m.get(id);
    if (cur) { cur.plannedQty += l.qty; if (l.service) cur.serviceQty = (cur.serviceQty ?? 0) + l.qty; continue; }
    m.set(id, {
      id, deliveryId, productId: l.productId, plannedQty: l.qty, deliveredQty: null,
      ...(l.service ? { serviceQty: l.qty } : {}),
      ...(isNormal(l) ? {} : { kind: l.kind, substitutedFrom: l.altOf ?? '', billPrice: l.billPrice ?? 0, altId: l.altId ?? '' }),
    });
  }
  return [...m.values()];
}

/** 画面に出す言い方：差替・補償＝「代替品（元：〇〇）」、除外＝「納品分に含まれません」 */
export function altLabel(l: { kind?: OrderLine['kind']; altOf?: string; substitutedFrom?: string; movedTo?: string }, name: (id: string) => string): string {
  if (l.kind === '差替' || l.kind === '補償') return `代替品（元：${name(l.altOf ?? l.substitutedFrom ?? '')}）${l.kind === '補償' ? '・補償（0円）' : ''}`;
  if (l.kind === '除外') return l.movedTo ? '納品分に含まれません（代替品を別の便でお届けします）' : '納品分に含まれません';
  return '';
}

/** 便（拠点の子契約の枠）の配送：注文の slot（温度帯:枠）→ 親の配送 */
export const tripOf = (r: DocRepo, childContractId: string, slot: string) => {
  const [temp, s] = slot.split(':');
  return r.list<Delivery>('dm.delivery.deliveries').find((d) => d.childContractId === childContractId && !d.parentId && d.slot === s && d.temp === temp);
};
/** 配送で届けない（除外の）注文の行：便の配送はその枠の除外の行、追加配送は deliveryId の行 */
export function excludedFor(r: DocRepo, d: DL): OrderLine[] {
  if (!d.childContractId) return [];
  const o = r.list<ProductOrder>('dm.order.orders').find((x) => x.childContractId === d.childContractId);
  if (!o) return [];
  const key = `${d.temp}:${d.slot}`;
  return o.lines.filter((l) => l.kind === '除外' && (l.deliveryId ? l.deliveryId === d.id : !d.parentId && l.slot === key));
}
/** その配送で回収・廃棄する不良品（ドライバー・委託配送先の納品リストの指示） */
export const disposalsFor = (r: DocRepo, deliveryId: string) =>
  r.list<AltSetting>(ALTS).flatMap((a) => a.disposals.filter((x) => x.deliveryId === deliveryId).map((x) => ({ ...x, altId: a.id })));
/** 拠点・期間の廃棄（棚卸報告で申告する分。管理ロスにしない） */
export const disposalsOfBranch = (r: DocRepo, branchId: string, from: string, to: string) =>
  r.list<AltSetting>(ALTS).filter((a) => a.foundOn >= from && a.foundOn <= to).flatMap((a) => a.disposals.filter((x) => x.branchId === branchId).map((x) => ({ ...x, altId: a.id })));
/** 回収・廃棄の指示の文 */
export const disposalText = (x: AltDisposal, name: (id: string) => string) =>
  x.how === 'ドライバーが回収・廃棄' ? `不良品の回収・廃棄：${name(x.productId)} ${x.qty}個（代替品設定。管理ロスにしない）` : `不良品は法人が廃棄して棚卸報告で申告：${name(x.productId)} ${x.qty}個`;

/**
 * 出荷指示を送ったか。出荷指示は2週間分（サイクルの前半 A・B／後半 C・D）を、その最初のお届け日の3日前に倉庫へ送る。
 * 子の配送・資材は出荷日の前日に送る
 */
export function instructionSent(r: DocRepo, d: DL, day: string) {
  if (!['予定', '出荷待'].includes(d.status)) return true;
  const c = d.cycleMonth && !d.parentId ? r.get<Cycle>('dm.delivery.cycles', d.cycleMonth) : undefined;
  if (!c) return addDays(d.shipOn, -1) <= day;
  return addDays(d.slot[0] <= 'B' ? c.a1 : addDays(c.a1, 14), -3) <= day;
}
const leadOf = (d: Delivery) => Math.round((new Date(d.deliverOn).getTime() - new Date(d.shipOn).getTime()) / 86400000);

/* ---------------- 代替商品の提案・警告 ---------------- */

/** 代替商品の警告（温度帯・コース・倉庫・自販機が不良商品と違う） */
export function altWarnings(def: Product, alt: Product): string[] {
  const w: string[] = [];
  if (alt.temp !== def.temp) w.push(`温度帯が違います（${def.temp} → ${alt.temp}）`);
  const lackC = def.courses.filter((c) => !alt.courses.includes(c));
  if (lackC.length) w.push(`代替商品は ${lackC.join('・')} のコースで出せません`);
  const lackW = def.pickWarehouseIds.filter((x) => !alt.pickWarehouseIds.includes(x));
  if (lackW.length) w.push(`代替商品は ${lackW.join('・')} の倉庫にありません（その倉庫の拠点は在庫のある倉庫から追加配送）`);
  if (def.vending.columns.length && !alt.vending.columns.length) w.push('代替商品は自販機に入りません（入れるかは法人次第）');
  if (alt.status === '削除済') w.push('代替商品は削除済の商品です');
  return w;
}
/** 代替商品の候補（同じ温度帯・コース・倉庫の商品。自販機に入る不良商品なら自販機に入る商品を先に） */
export function altSuggest(r: DocRepo, productId: string) {
  const def = r.get<Product>('dm.master.products', productId);
  if (!def) throw new ApiError(`${productId} は商品マスタにありません`, 404);
  return r.list<Product>('dm.master.products').filter((p) => p.id !== def.id && p.status !== '削除済' && p.temp !== '資材')
    .map((p) => ({ productId: p.id, name: p.name, temp: p.temp, priceYen: p.priceYen, warnings: altWarnings(def, p) }))
    .sort((a, b) => a.warnings.length - b.warnings.length || a.productId.localeCompare(b.productId))
    .map((x) => ({ ...x, suggested: !x.warnings.length }));
}

/* ---------------- 代替品設定 ---------------- */

export type AltStockIn = Record<string, { onHand: number; incoming: { date: string; qty: number }[] }>;
export type AltArgs = {
  productId: string; altProductId: string; foundOn?: string; from: string; to: string;
  scope?: AltSetting['scope']; lotNo?: string; reason: string;
  mode?: AltSetting['mode']; comp?: AltSetting['comp']; when?: AltSetting['when']; whenDate?: string;
  lotAction?: AltSetting['lotAction']; createPo?: boolean; notify?: boolean;
  /** 対象から外す便（不良商品の入っていた配送の ID） */
  skip?: string[];
  /** 便ごとの届け方（② 補償。不良商品の入っていた配送の ID → 次の便／その次の便／追加配送） */
  override?: Record<string, '次の便' | 'その次の便' | '追加配送'>;
  /** 代替商品の倉庫在庫・入荷予定（倉庫ID ごと） */
  stock?: AltStockIn;
  /** 保存しないで結果だけ返す（保存前の確認） */
  dryRun?: boolean;
  today?: string; at?: string; accountId?: string;
};

type Trip = Delivery;
type Plan = AltRow & { altWh: string; need: number; target?: Trip; childOf?: Trip; childOn?: string; price: number; slotTo: string };

const isFrozen = (t: string) => t === '冷凍';
const pname = (r: DocRepo, id: string) => r.get<Product>('dm.master.products', id)?.name ?? id;

/** 拠点のこれからの便（親の配送・予定／出荷待・同じ温度帯の組） */
function tripsOf(r: DocRepo, branchId: string, frozen: boolean) {
  return r.list<Delivery>('dm.delivery.deliveries')
    .filter((d) => d.branchId === branchId && !d.parentId && d.temp !== '資材' && isFrozen(d.temp) === frozen && ['予定', '出荷待'].includes(d.status))
    .sort((a, b) => a.shipOn.localeCompare(b.shipOn) || a.id.localeCompare(b.id));
}
/** お届けできる最初の日（暦の外は日曜だけ除く） */
function firstDeliverable(r: DocRepo, from: string) {
  const cycles = r.list<Cycle>('dm.delivery.cycles'), hs = r.list<Holiday>('dm.delivery.holidays');
  for (let i = 0; i < 21; i++) {
    const d = addDays(from, i);
    if (slotOf(cycles, d) ? canDeliver(cycles, hs, d) : new Date(d).getDay() !== 0) return d;
  }
  return from;
}
/** 拠点の便に代替商品を出せるか（倉庫・コース・自販機。温度帯は警告だけ） */
function fitsTrip(r: DocRepo, alt: Product, d: Trip) {
  const cc = r.get<ChildContract>('dm.org.childContracts', d.childContractId);
  if (!alt.pickWarehouseIds.includes(d.warehouseId)) return { ok: false, why: `${d.warehouseId} にない` };
  if (cc && !alt.courses.includes(productCourseOf(cc.course))) return { ok: true, why: `${cc.course} のコースの商品ではない（警告）` };
  if (cc?.course === 'ESライト（自販機）' && !vmFits(alt, vmModelsOf(r.list<Loan>('dm.org.loans'), r.list<Model>('dm.master.models'), d.branchId))) return { ok: true, why: '自販機に入らない（警告）' };
  return { ok: true, why: '' };
}
const orderOfTrip = (r: DocRepo, d: Trip) => r.list<ProductOrder>('dm.order.orders').find((o) => o.childContractId === d.childContractId);

/** 番号 ALT-YYMM-NNNN */
function nextAltId(r: DocRepo, day: string) {
  const p = `ALT-${day.slice(2, 4)}${day.slice(5, 7)}-`;
  const max = Math.max(0, ...r.list<{ id: string }>(ALTS).filter((x) => x.id.startsWith(p)).map((x) => Number(x.id.slice(p.length))));
  return p + String(max + 1).padStart(4, '0');
}

/**
 * 代替品設定を作って注文・配送・発注・仕入先への請求・お知らせに反映する（dryRun＝確かめるだけ）。
 * 返り値：設定（rows＝便ごとの結果・shortage＝在庫の見込み・warnings）と、変えた注文・作った配送・追加発注の ID
 */
export function applyAlt(r: DocRepo, a: AltArgs) {
  const day = a.today ?? today(), at = a.at ?? nowStamp(), by = a.accountId ?? 'system';
  const def = r.get<Product>('dm.master.products', a.productId), alt = r.get<Product>('dm.master.products', a.altProductId);
  if (!def) throw new ApiError(`不良商品 ${a.productId} は商品マスタにありません`, 400);
  if (!alt) throw new ApiError(`代替商品 ${a.altProductId} は商品マスタにありません`, 400);
  if (def.id === alt.id) throw new ApiError('不良商品と同じ商品は選べません', 400);
  if (alt.status === '削除済' || alt.temp === '資材') throw new ApiError(`${alt.id} は代替商品にできません（削除済・資材）`, 400);
  const isD = (s?: string) => isRealDate(s);
  const foundOn = a.foundOn ?? day;
  if (!isD(foundOn) || !isD(a.from) || !isD(a.to) || a.from > a.to) throw new ApiError('不良発覚日・対象期間（出荷日）を正しく入れてください', 400);
  if (!a.reason?.trim()) throw new ApiError('不良理由を入れてください', 400);
  if (a.reason.trim().length > 500) throw new ApiError('不良理由は500文字以内で入力してください。', 400);
  if (a.scope === 'ロット単位' && !a.lotNo?.trim()) throw new ApiError('ロット番号を入れてください', 400);
  if (a.when === '日付を指定' && !isD(a.whenDate)) throw new ApiError('補償品を届ける日付を入れてください', 400);
  const mode = a.mode ?? '差し替え', comp = a.comp ?? '注文数量', when = a.when ?? '次の便', lotAction = a.lotAction ?? '返品';
  const createPo = a.createPo ?? true, notify = a.notify ?? true;
  const id = nextAltId(r, day);
  const warnings = altWarnings(def, alt);
  const orders = new Map(r.list<ProductOrder>('dm.order.orders').map((o) => [o.id, structuredClone(o)]));
  const contracts = r.list<Contract>('dm.org.contracts');

  /* 1) 対象の便：対象期間に出荷する、不良商品の入った便 */
  const plans: Plan[] = [];
  for (const o of orders.values()) {
    for (const l of o.lines.filter((x) => isNormal(x) && x.productId === def.id && !x.deliveryId)) {
      const d = tripOf(r, o.childContractId, l.slot);
      if (!d || ['取消', '中止'].includes(d.status) || d.shipOn < a.from || d.shipOn > a.to || a.skip?.includes(d.id)) continue;
      const ct = contracts.find((c) => c.id === d.contractId);
      if (ct && ['終了', '停止'].includes(ct.status)) continue;
      const shipped = d.shipOn <= foundOn || d.shipOn <= day || !['予定', '出荷待'].includes(d.status);
      const dl = r.get<DeliveryLine>('dm.delivery.lines', `${d.id}:${def.id}`);
      let qty = shipped ? dl?.deliveredQty ?? dl?.plannedQty ?? l.qty : l.qty;
      if (shipped && comp === '残理論在庫') {
        /* 残理論在庫：その便のあとの配送の報告に残っていた数（なければ届けた数） */
        const rep = r.list<DeliveryReport>('dm.report.deliveryReports').filter((x) => x.branchId === d.branchId && x.startedAt.slice(0, 10) >= d.deliverOn && x.deliveryId !== d.id)
          .sort((x, y) => x.startedAt.localeCompare(y.startedAt))[0];
        const rem = rep?.stock.find((s) => s.productId === def.id)?.remaining;
        if (rem != null) qty = Math.min(qty, rem);
      }
      if (qty <= 0) continue;
      const pattern: AltRow['pattern'] = shipped ? '② 補償' : mode === '除外のみ' ? '③ 除外のみ' : '① 差し替え';
      plans.push({
        deliveryId: d.id, branchId: d.branchId, orderId: o.id, slot: l.slot, shipOn: d.shipOn, pattern, qty, altQty: pattern === '③ 除外のみ' ? 0 : qty,
        toDeliveryId: d.id, toOrderId: o.id, how: pattern === '③ 除外のみ' ? '届けない' : '同じ便', resent: false, short: false, note: '',
        altWh: d.warehouseId, need: 0, price: unitPrice(r, o.cycleMonth, def.id), slotTo: l.slot,
      });
    }
  }
  if (!plans.length) throw new ApiError('対象の便がありません（対象期間・不良商品を確かめてください）', 400);

  /* 2) 代替品を届ける便（同じ便／次の便／追加配送） */
  const altWhOf = (wh: string) => (alt.pickWarehouseIds.includes(wh) ? wh : alt.pickWarehouseIds.find((x) => a.stock?.[x]?.onHand) ?? alt.pickWarehouseIds[0] ?? wh);
  const toChild = (p: Plan, parent: Trip, on: string, how: AltRow['how']) => {
    p.target = undefined; p.childOf = parent; p.childOn = firstDeliverable(r, on); p.how = how; p.altWh = altWhOf(parent.warehouseId);
    p.toOrderId = p.orderId; p.slotTo = p.slot;
  };
  const toTrip = (p: Plan, t: Trip, how: AltRow['how']) => {
    const o = orderOfTrip(r, t);
    if (!o || !fitsTrip(r, alt, t).ok) return false;
    p.target = t; p.childOf = undefined; p.toDeliveryId = t.id; p.toOrderId = o.id; p.slotTo = `${t.temp}:${t.slot}`; p.how = how; p.altWh = t.warehouseId;
    return true;
  };
  for (const p of plans) {
    const d = r.get<Delivery>('dm.delivery.deliveries', p.deliveryId)!;
    if (p.pattern === '③ 除外のみ') continue;
    if (p.pattern === '① 差し替え') {
      const f = fitsTrip(r, alt, d);
      if (f.ok) { p.target = d; p.altWh = d.warehouseId; if (f.why) p.note = `代替商品が${f.why}`; }
      else { toChild(p, d, d.deliverOn, '追加配送'); p.note = `代替商品が便の倉庫（${d.warehouseId}）にないため、${p.altWh} から追加配送（配送費は ES 負担）`; }
      continue;
    }
    /* ② 補償：次の便（不良発覚日より後）。ない・14日より先・追加配送を選んだときは追加配送 */
    const ov = a.override?.[d.id];
    const base = when === '日付を指定' ? a.whenDate! : foundOn;
    const trips = tripsOf(r, d.branchId, isFrozen(d.temp)).filter((t) => t.shipOn > base && t.shipOn > day);
    const nx = ov === 'その次の便' ? trips[1] : trips[0];
    const extra = ov === '追加配送' || (!ov && when === '追加配送') || !nx || (!ov && when === '次の便' && nx.deliverOn > addDays(foundOn, FAR_DAYS));
    if (extra || !toTrip(p, nx, when === '日付を指定' && !ov ? '指定の便' : '次の便')) {
      toChild(p, d, addDays(day, 2), '追加配送');
      p.note = !nx ? '次の便がないため追加配送（配送費は ES 負担）' : extra ? (ov === '追加配送' || when === '追加配送' ? '追加配送（配送費は ES 負担）' : `次の便 ${nx.deliverOn} が14日より先のため追加配送（配送費は ES 負担）`) : '次の便に出せないため追加配送（配送費は ES 負担）';
    }
  }

  /* 3) 在庫の見込みと不足：倉庫ごとに、出荷日の順に在庫・入荷予定から引き当てる */
  const knownPos = r.list<AltPo>(ALT_POS).filter((x) => x.productId === alt.id && (x.order as { recv?: string }).recv !== '入荷済');
  const shortage: AltShortage[] = [];
  const shipOf = (p: Plan) => (p.target ? p.target.shipOn : addDays(p.childOn!, -leadOf(p.childOf!)));
  const pos: AltPo[] = [];
  const eta = addDays(day, ALT_PO_LEAD);
  for (const wh of [...new Set(plans.filter((p) => p.altQty > 0).map((p) => p.altWh))].sort()) {
    const ps = plans.filter((p) => p.altQty > 0 && p.altWh === wh).sort((x, y) => shipOf(x).localeCompare(shipOf(y)));
    const st = a.stock?.[wh];
    const onHand = Math.max(0, st?.onHand ?? 0);
    const incoming = [...(st?.incoming ?? []), ...knownPos.filter((x) => x.warehouseId === wh).map((x) => ({ date: x.eta, qty: x.qty }))].sort((x, y) => x.date.localeCompare(y.date));
    const need = ps.reduce((s, p) => s + p.altQty, 0), inc = incoming.reduce((s, x) => s + x.qty, 0);
    const short = Math.max(0, need - onHand - inc);
    let poQty = 0;
    if (short > 0 && createPo) {
      const sup = selectedSupplier(alt);
      poQty = Math.ceil(short / Math.max(1, sup?.lot ?? 1)) * Math.max(1, sup?.lot ?? 1);
      const ym = r.get<Delivery>('dm.delivery.deliveries', ps[0].deliveryId)?.cycleMonth || day.slice(0, 7).replace('/', '-');
      const n = r.list<AltPo>(ALT_POS).filter((x) => x.productId === alt.id).length + pos.filter((x) => x.productId === alt.id).length + 1;
      const no = `PO-${ym.replace('-', '')}-${alt.id}-ALT${String(n).padStart(2, '0')}`;
      const whName = r.get<Warehouse>('dm.master.warehouses', wh)?.name ?? wh;
      pos.push({
        id: no, altId: id, supplierId: sup?.supplierId ?? alt.supplierId, productId: alt.id, warehouseId: wh, qty: poQty, unitCostYen: costOn(sup, day), eta, etaFrom: '仮',
        /* 仕入先サイト・運営の発注と同じ形（lib/supplier/types の Order） */
        order: {
          sup: sup?.supplierId ?? alt.supplierId, no, type: '通常', pid: alt.id, name: supplierNameOf(alt), ym, wh: whName, period: `代替品 ${id}（不足分）`,
          kari: poQty, hon: poQty, unit: '個', ans: '納期回答待ち', orderedAt: at, rows: [{ slot: '—', deliver: eta, wish: eta, qty: poQty }], parts: [],
          honAck: false, honAt: at, honAckAt: '', recv: '', recvDate: '', lot: sup?.lot ?? 1, seen: false, re: null, add: `代替品 ${id} の不足分（${def.name} の代わり）`,
          comment: '', eta: '', ship: '', carrier: '', slip: '', bb: '', method: '', hist: [{ at, who: '運営', t: `追加発注（${poQty}個）：代替品 ${id} の不足分` }],
          /* 仕入単価の写し（本発注として出すので、いまの仕入単価で固める） */
          unitCostYen: costOn(sup, day),
        },
      });
    }
    shortage.push({ warehouseId: wh, need, stock: onHand, incoming: inc, short, eta: poQty ? eta : '' });
    /* 引き当て：在庫・入荷予定・追加発注で、出荷日の前日までに足りる便はそのまま。足りない便は入荷のあとの便へ（追加発注があるとき） */
    const supply = [{ date: '0000/00/00', qty: onHand }, ...incoming, ...(poQty ? [{ date: eta, qty: poQty }] : [])].sort((x, y) => x.date.localeCompare(y.date));
    let used = 0;
    for (const p of ps) {
      const cut = addDays(shipOf(p), -1);
      const have = supply.filter((x) => x.date <= cut).reduce((s, x) => s + x.qty, 0);
      if (have - used >= p.altQty) { used += p.altQty; continue; }
      /* いつ足りるか */
      let acc = 0, ready = '';
      for (const x of supply) { acc += x.qty; if (acc - used >= p.altQty) { ready = x.date; break; } }
      used += p.altQty;
      p.short = true;
      if (!ready) { p.note = [p.note, '在庫が足りません（追加発注をしないため、このまま）'].filter(Boolean).join('・'); continue; }
      const d = r.get<Delivery>('dm.delivery.deliveries', p.deliveryId)!;
      const later = tripsOf(r, d.branchId, isFrozen(d.temp)).filter((t) => addDays(t.shipOn, -1) >= ready && t.shipOn > day);
      if (!(later[0] && toTrip(p, later[0], '入荷後の便'))) toChild(p, d, addDays(ready, 1 + leadOf(d)), '追加配送');
      p.note = [p.note, `代替商品の入荷（${ready}）を待って${p.how === '追加配送' ? '追加配送' : `${later[0]?.deliverOn ?? ''} の便`}でお届け`].filter(Boolean).join('・');
    }
  }

  /* 4) 結果の行（届け先の配送 ID・再送）。追加配送は親の配送ごとに枝番（-1〜-9） */
  const usedIds = new Set(r.list<Delivery>('dm.delivery.deliveries').map((x) => x.id));
  const childIds = new Map<string, string>();
  for (const p of plans.filter((x) => x.childOf)) {
    const key = `${p.childOf!.id}|${p.childOn}|${p.altWh}`;
    if (!childIds.has(key)) {
      let n = 1;
      while (usedIds.has(`${p.childOf!.id}-${n}`)) n++;
      if (n > 9) throw new ApiError(`${p.childOf!.id} の子の配送は枝番 9 までです`, 409);
      usedIds.add(`${p.childOf!.id}-${n}`);
      childIds.set(key, `${p.childOf!.id}-${n}`);
    }
    p.toDeliveryId = childIds.get(key)!;
  }
  const rows: AltRow[] = plans.map((p) => {
    const src = r.get<Delivery>('dm.delivery.deliveries', p.deliveryId)!;
    const dst = p.target;
    p.resent = (p.pattern !== '② 補償' && instructionSent(r, src, day)) || (!!dst && instructionSent(r, dst, day) && dst.id !== src.id);
    const { altWh: _w, need: _n, target: _t, childOf: _c, childOn: _o, price: _p, slotTo: _s, ...row } = p;
    return row;
  });
  const claimQty = plans.reduce((s, p) => s + p.qty, 0);
  const sup = selectedSupplier(def);
  const claim: SupplierClaim = {
    id: `SC-${id}`, altId: id, ym: foundOn.slice(0, 7).replace('/', '-'), supplierId: sup?.supplierId ?? def.supplierId, productId: def.id, qty: claimQty,
    unitCostYen: costOn(sup, at.slice(0, 10)), amountYen: -claimQty * costOn(sup, at.slice(0, 10)), label: `不良控除（${lotAction}）`, lotAction, at,
  };
  const disposals: AltDisposal[] = plans.filter((p) => p.pattern === '② 補償').map((p) => {
    const d = r.get<Delivery>('dm.delivery.deliveries', p.deliveryId)!;
    const cool = d.serviceForm === 'COOL便';
    return { branchId: p.branchId, productId: def.id, qty: p.qty, how: cool ? '法人が廃棄して棚卸報告で申告' : 'ドライバーが回収・廃棄', deliveryId: cool ? d.id : p.toDeliveryId };
  });
  const setting: AltSetting = {
    id, productId: def.id, altProductId: alt.id, foundOn, from: a.from, to: a.to, scope: a.scope ?? '全ロット', lotNo: a.lotNo ?? '', reason: a.reason.trim(),
    mode, comp, when, whenDate: a.whenDate ?? '', lotAction, createPo, warnings, rows, shortage, poIds: pos.map((x) => x.id), claimId: claim.id, disposals, notify,
    createdAt: at, createdBy: by,
  };
  if (a.dryRun) return { setting, orders: [] as string[], deliveries: [] as string[], pos, claim };

  /* 5) 注文の行を直す */
  const changed = new Set<string>();
  const sub = (o: ProductOrder, slot: string, n: number) => {
    const l = o.lines.find((x) => isNormal(x) && x.productId === def.id && x.slot === slot && !x.deliveryId)!;
    l.qty -= n;
    o.lines = o.lines.filter((x) => x.qty > 0);
  };
  const add = (o: ProductOrder, l: OrderLine) => { o.lines.push(l); changed.add(o.id); };
  for (const p of plans) {
    const o = orders.get(p.orderId)!;
    const to = orders.get(p.toOrderId)!;
    const viaChild = !!p.childOf;
    const alt1 = (kind: '差替' | '補償'): OrderLine => ({
      productId: alt.id, slot: p.slotTo, qty: p.altQty, kind, altOf: def.id, billPrice: kind === '差替' ? p.price : 0, altId: id, ...(viaChild ? { deliveryId: p.toDeliveryId } : {}),
      ...(p.toOrderId !== p.orderId ? { fromOrderId: p.orderId } : {}),
    });
    changed.add(o.id);
    if (p.pattern === '③ 除外のみ') { sub(o, p.slot, p.qty); add(o, { productId: def.id, slot: p.slot, qty: p.qty, kind: '除外', altOf: def.id, billPrice: 0, altId: id }); continue; }
    if (p.pattern === '① 差し替え') {
      sub(o, p.slot, p.qty);
      if (p.how === '同じ便') add(o, alt1('差替'));
      else { add(o, { productId: def.id, slot: p.slot, qty: p.qty, kind: '除外', altOf: def.id, billPrice: 0, altId: id, movedTo: p.toDeliveryId }); add(to, alt1('差替')); }
      continue;
    }
    add(to, alt1('補償'));
  }
  for (const oid of changed) {
    const o = orders.get(oid)!;
    const mine = rows.filter((x) => x.orderId === oid || x.toOrderId === oid);
    const detail = mine.map((x) => `${x.pattern}：${x.shipOn} 出荷の便の${pname(r, def.id)} ${x.qty}個${x.altQty ? ` → 代替品（元：${def.name}）${alt.name} ${x.altQty}個（${x.how}${x.toDeliveryId !== x.deliveryId ? ` ${x.toDeliveryId}` : ''}）` : '（納品分に含まれません）'}`).join('／');
    r.put<ProductOrder>('dm.order.orders', oid, {
      ...o, status: ['デフォルト', 'お試し（自動）'].includes(o.status) ? 'ES登録済' : o.status, updatedAt: at, updatedBy: by,
      log: [{ at, by, what: `代替品設定 ${id} を反映`, detail: detail + (notify ? '。お客様へメール・お知らせで通知' : '') }, ...o.log],
    });
  }

  /* 6) 配送：便の明細を注文と同じにする（出荷指示を送ったあとは版番号つきで再送）、追加配送（子の配送）を作る */
  const touched = new Set(plans.flatMap((p) => [p.deliveryId, ...(p.target ? [p.target.id] : [])]));
  for (const did of touched) {
    const d = r.get<Delivery>('dm.delivery.deliveries', did)!;
    if (!['予定', '出荷待'].includes(d.status)) continue;
    const o = r.list<ProductOrder>('dm.order.orders').find((x) => x.childContractId === d.childContractId);
    if (!o) continue;
    syncTrip(r, d, o.lines);
    if (instructionSent(r, d, day)) {
      const rev = (d.shipRev ?? 1) + 1;
      const cur = r.get<Delivery>('dm.delivery.deliveries', did)!;
      r.put<Delivery>('dm.delivery.deliveries', did, { ...cur, shipRev: rev, internalMemo: [cur.internalMemo, `${at} 代替品設定 ${id}：出荷指示を再送（rev${rev}）`].filter(Boolean).join('\n') });
    }
  }
  const created: string[] = [];
  for (const p of plans.filter((x) => x.childOf)) {
    const cid = p.toDeliveryId;
    const ls = [...orders.values()].flatMap((o) => r.get<ProductOrder>('dm.order.orders', o.id)!.lines).filter((l) => l.deliveryId === cid);
    const parent = p.childOf!, lead = leadOf(parent);
    const cur = r.get<Delivery>('dm.delivery.deliveries', cid);
    if (!cur) {
      r.put<Delivery>('dm.delivery.deliveries', cid, {
        ...parent, id: cid, parentId: parent.id, status: '出荷待', deliverOn: p.childOn!, shipOn: addDays(p.childOn!, -lead), slot: parent.slot, warehouseId: p.altWh,
        plannedQty: 0, deliveredQty: null, deliveredAt: '', completion: '', changeState: '変更不可', shipRev: undefined, feeBy: 'ES', altId: id,
        internalMemo: `${at} 代替品の追加配送（${id}・${p.pattern}・配送費は ES 負担）`,
      });
      r.list<Leg>('dm.delivery.legs').filter((l) => l.deliveryId === parent.id).forEach((l) => r.put<Leg>('dm.delivery.legs', `${cid}:${l.legNo}`, {
        ...l, id: `${cid}:${l.legNo}`, deliveryId: cid, driverId: l.regime === 'parcel_carrier' ? '' : l.driverId, pickedUpAt: '',
        from: l.legNo === 1 ? { type: 'warehouse', id: p.altWh } : l.from,
      }));
      created.push(cid);
    }
    r.list<DeliveryLine>('dm.delivery.lines').filter((l) => l.deliveryId === cid).forEach((l) => r.remove('dm.delivery.lines', l.id));
    const dls = toDeliveryLines(cid, ls);
    dls.forEach((l) => r.put('dm.delivery.lines', l.id, l));
    r.put<Delivery>('dm.delivery.deliveries', cid, { ...r.get<Delivery>('dm.delivery.deliveries', cid)!, plannedQty: dls.reduce((s, l) => s + l.plannedQty, 0) });
  }

  /* 7) 追加発注・仕入先への請求・設定 */
  pos.forEach((x) => r.put(ALT_POS, x.id, x));
  r.put(CLAIMS, claim.id, claim);
  r.put(ALTS, id, setting);

  /* 8) 法人へのお知らせ（メール＋法人Web。運営が外せる） */
  if (notify) {
    for (const b of [...new Set(rows.map((x) => x.branchId))]) {
      const mine = rows.filter((x) => x.branchId === b);
      const body = [
        `${def.name} に不良（${a.reason.trim()}）が見つかったため、次のとおり対応します。`,
        ...mine.map((x) => {
          const d = r.get<Delivery>('dm.delivery.deliveries', x.deliveryId)!;
          const to = r.get<Delivery>('dm.delivery.deliveries', x.toDeliveryId);
          return x.pattern === '③ 除外のみ' ? `・${d.deliverOn} のお届け：${def.name} ${x.qty}個は納品分に含まれません（ご請求しません）`
            : x.pattern === '① 差し替え' ? `・${d.deliverOn} のお届け：${def.name} ${x.qty}個の代わりに 代替品（元：${def.name}）${alt.name} ${x.altQty}個を${to && to.id !== d.id ? ` ${to.deliverOn} に` : ''}お届けします（ご請求は元の商品の単価）`
            : `・${d.deliverOn} にお届けした ${def.name} ${x.qty}個の補償として、代替品（元：${def.name}）${alt.name} ${x.altQty}個を ${to?.deliverOn ?? ''} にお届けします（ご請求しません）`;
        }),
        disposals.some((x) => x.branchId === b && x.how === '法人が廃棄して棚卸報告で申告') ? '・お手元の不良品は廃棄し、棚卸報告の「捨てた数」にご入力ください（管理ロスにはしません）。'
          : disposals.some((x) => x.branchId === b) ? '・お手元の不良品は、次のお届けのときにドライバーが回収します。' : '',
      ].filter(Boolean).join('\n');
      notifyBranch(r, b, { templateId: 'alt_notice', title: `代替品のお知らせ（${def.name}）`, body, link: { type: 'order', id: mine[0].orderId } });
    }
  }
  return { setting, orders: [...changed], deliveries: created, pos, claim };
}

/** 便の配送の明細と予定数を注文の行と同じにする（その枠の行・除外と追加配送の行を除く） */
export function syncTrip(r: DocRepo, d: Delivery, lines: OrderLine[]) {
  const key = `${d.temp}:${d.slot}`;
  r.list<DeliveryLine>('dm.delivery.lines').filter((l) => l.deliveryId === d.id).forEach((l) => r.remove('dm.delivery.lines', l.id));
  /* 調整数（サービスで足す数）も明細・予定数に入れる */
  const adj = adjustLinesOf(r.list<ProductOrder>('dm.order.orders').find((o) => o.childContractId === d.childContractId));
  const ls = toDeliveryLines(d.id, [...lines, ...adj].filter((l) => l.slot === key && !l.deliveryId));
  ls.forEach((l) => r.put('dm.delivery.lines', l.id, l));
  r.put<Delivery>('dm.delivery.deliveries', d.id, { ...r.get<Delivery>('dm.delivery.deliveries', d.id)!, plannedQty: ls.reduce((a, l) => a + l.plannedQty, 0) });
}

/* ---------------- 請求・仕入先 ---------------- */

/**
 * 代替品の請求の行（実績精算に出す）：差替＝元の商品の単価、補償＝0円の行、除外＝出さない。
 * 追加配送の配送費は ES の負担（請求しない）
 */
export function altBillRows(r: DocRepo, a: { branchId?: string; cycleMonth?: string }) {
  return r.list<ProductOrder>('dm.order.orders').filter((o) => (!a.branchId || o.branchId === a.branchId) && (!a.cycleMonth || o.cycleMonth === a.cycleMonth))
    .flatMap((o) => o.lines.filter((l) => l.kind === '差替' || l.kind === '補償').map((l) => ({
      orderId: o.id, branchId: o.branchId, cycleMonth: o.cycleMonth, altId: l.altId ?? '', productId: l.productId, kind: l.kind!, qty: l.qty,
      unitYen: l.billPrice ?? 0, amountYen: l.kind === '補償' ? 0 : l.qty * (l.billPrice ?? 0),
      name: `${pname(r, l.productId)}　${altLabel(l, (x) => pname(r, x))}`,
    })));
}

/** 配送に関係する代替品設定の ID（明細の代替品・除外・回収／廃棄・追加配送）。なければ '' */
export function altIdOf(r: DocRepo, d: DL): string {
  const ids = [
    ...r.list<DeliveryLine>('dm.delivery.lines').filter((l) => l.deliveryId === d.id).map((l) => l.altId ?? ''),
    ...excludedFor(r, d).map((l) => l.altId ?? ''), ...disposalsFor(r, d.id).map((x) => x.altId), d.altId ?? '',
  ];
  return [...new Set(ids.filter(Boolean))].join('・');
}
/** ドライバー・委託配送先の納品リストの注意書き：代替品（元：〇〇）・届けない不良商品・回収／廃棄の指示 */
export function altNotes(r: DocRepo, d: DL): string[] {
  const name = (id: string) => pname(r, id);
  return [
    ...r.list<DeliveryLine>('dm.delivery.lines').filter((l) => l.deliveryId === d.id && l.kind).map((l) => `${name(l.productId)} ×${l.plannedQty}　${altLabel(l, name)}`),
    ...excludedFor(r, d).map((l) => `${name(l.productId)} ×${l.qty}　${altLabel(l, name)}（積まない）`),
    ...disposalsFor(r, d.id).map((x) => disposalText(x, name)),
  ];
}

/**
 * 仕入先が追加発注に回答した（仕入先サイト・運営の代理入力。発注の形 order が変わった）とき、入荷予定日を仕入先の回答に直す（課題 2c-2）。
 * 回答の日＝分納の最後の回の入荷予定日（なければ発注の eta）。回答がなければ仮のまま。変えたら true
 */
export function altPoAnswered(r: DocRepo, no: string, order: Record<string, unknown>) {
  const x = r.get<AltPo>(ALT_POS, no);
  if (!x) return false;
  const o = order as { eta?: string; parts?: { eta?: string }[]; ans?: string };
  const etas = (o.parts ?? []).map((p) => p.eta ?? '').filter(Boolean).sort();
  const eta = etas[etas.length - 1] || o.eta || '';
  const answered = !!eta && ['納期回答済', '出荷済'].includes(o.ans ?? '');
  r.put<AltPo>(ALT_POS, no, { ...x, order, ...(answered ? { eta, etaFrom: '仕入先の回答' as const } : {}) });
  return answered && eta !== x.eta;
}

/**
 * 仕入先が答えた入荷予定日が、入荷のあとに出す予定の便（入荷後の便・入荷を待つ追加配送・設定のときの入荷予定日より後に出荷する便）の
 * 出荷に間に合わない（課題 4a-10）。便は自動では動かさない：運営の TOP・発注の一覧に出して、SA がスケジュールの移動などで直す。
 * 間に合わない＝出荷日の前日までに入荷しない（入荷予定日 ≧ 出荷日）。出荷の前（予定・出荷待）で、今日より後に出荷する便だけ
 */
export function altLateTrips(r: DocRepo, day = today()) {
  const alts = new Map(r.list<AltSetting>(ALTS).map((a) => [a.id, a]));
  return r.list<AltPo>(ALT_POS).filter((x) => x.etaFrom === '仕入先の回答').flatMap((x) => {
    const a = alts.get(x.altId);
    if (!a) return [];
    /* 設定のときの入荷予定日（倉庫ごとの見込み）。この日より後に出す便は追加発注の入荷を当てにしている */
    const planned = a.shortage.find((s) => s.warehouseId === x.warehouseId)?.eta || '';
    const ids = [...new Set(a.rows.filter((w) => w.altQty > 0).map((w) => w.toDeliveryId))];
    const trips = ids.map((id) => ({ d: r.get<Delivery>('dm.delivery.deliveries', id), w: a.rows.find((w) => w.toDeliveryId === id)! }))
      .filter(({ d, w }) => !!d && d.warehouseId === x.warehouseId && ['予定', '出荷待'].includes(d.status) && d.shipOn > day && x.eta >= d.shipOn
        && ((w.short && ['入荷後の便', '追加配送'].includes(w.how)) || (!!planned && d.shipOn > planned)))
      .map(({ d }) => ({ deliveryId: d!.id, branchId: d!.branchId, name: d!.destination.name, shipOn: d!.shipOn, deliverOn: d!.deliverOn }))
      .sort((p, q) => p.shipOn.localeCompare(q.shipOn));
    return trips.length ? [{ poNo: x.id, altId: x.altId, productId: x.productId, warehouseId: x.warehouseId, eta: x.eta, planned, trips }] : [];
  });
}
