import type { DocRepo } from '@/lib/ops/core/area';
import { nowStamp } from '@/lib/supplier/dates';
import { costOn, selectedSupplier } from './product';
import { carrierFeeFor } from './carrierFee';
import type { Branch, Carrier, Channel, ChildContract, ChildFees, Delivery, DeliveryLine, Discount, FeeLine, Leg, Option, Plan, PlanCoursePrice, PriceGen, Product, ServiceForm, TaxRate } from './types';
import { billRate, DEFAULT_RATES, discountTax, optionTax, planBaseTax, planWelfareTax } from './tax';
import { calcOf, optionAmount, optionQtyOf, welfareOf, welfarePerMeal } from './charges';

/*
 * マスタを変えても古いデータが変わらないための「写し」と「ロック」（課題 7-1・マスタ・データ変更の影響一覧 A1〜A6）。
 *   ① 費目（子契約 fees）：子契約を作ったときのプラン・オプション・値引きの金額。請求の画面・請求書はこの値
 *   子契約のロック：請求の状態が 確定／請求済 の子契約は変えられない（④。差額は請求調整）。確定は請求の画面の「確定」、請求済は請求書の発行で付く
 *   納品の写し：納品したときの商品名（配送の明細）・拠点名（配送の destination.name）・委託の支払額（区間 feeYen）
 *   仕入単価の写し：本発注したときの仕入単価（発注 unitCostYen）
 */

/* ---------------- ① 費目 ---------------- */

/**
 * 福利厚生（企業負担分）＝ プランの企業負担額（既定 100円・税込）× 食数 ÷（1＋企業負担分の税率）の切り捨て（28-148）。残りが基本料金。
 * 計算は lib/domain/charges.ts の welfareOf（プランマスタの設定を読む）
 */
export { welfareOf } from './charges';

/** ① 費目を作るときに子契約から読む項目 */
export type FeeInput = Pick<ChildContract, 'planId' | 'course' | 'optionIds' | 'discountIds'> & Partial<Pick<ChildContract, 'amounts' | 'deliveryExtra' | 'optionQty' | 'priceGenId' | 'channels'>> & { cycleMonth?: string };

/**
 * 子契約の ① 費目を作る（プランの基本料金・福利厚生・オプション・値引き）。値引きはプラン料金と同じ税率で引く。
 * 税率はマスタの taxRateId（プラン・オプション・値引き。lib/domain/tax.ts の既定）。rate＝税率 ID → ％（省くと見本の TX01 8%・TX02 10%）。
 *   オプション：子契約の金額の上書き（amounts・REQ-CT-304）があればそれ。配送回数追加（OP000001）は 回数（deliveryExtra）× 金額。単発料金のオプションも この子契約の月だけの行
 *   値引き（calcKind・lib/domain/charges.ts）：liteBase＝基本料金をライト（冷蔵庫）の価格に（差額を1行）／refPlan＝参照するプラン・コースの料金（請求額を超えない。基本料金分・福利厚生分に分けて引く）／
 *   fixed・rate＝プラン料金から（rate は上限あり）。skipDiscount（法人ごとの回数の上限など）が true の値引きは付けない
 * マスタは呼ぶ側が渡す（seed はマスタの見本、action は共通データ）
 */
export function feesOf(
  cc: FeeInput,
  m: { plan: (id: string) => Plan | undefined; option: (id: string) => Option | undefined; discount: (id: string) => Discount | undefined; rate?: (taxRateId: string) => number | undefined; skipDiscount?: (d: Discount) => boolean },
  at = nowStamp(),
): ChildFees {
  const plan = m.plan(cc.planId);
  /* 価格は子契約の世代（priceGenId・なければサイクル月）× コース × 配送方法（COOL便／ES配送便。台帳 E 2026-10-05） */
  const method = methodOf(cc);
  const prices = pricesAt(plan, cc.cycleMonth, cc.priceGenId);
  const price = yenOf(prices.find((p) => p.course === cc.course), method);
  const meals = plan?.monthlyMeals ?? 0;
  const pct = (id: string) => m.rate?.(id) ?? DEFAULT_RATES[id] ?? 10;
  const welfare = plan ? Math.min(price, welfareOf(meals, welfarePerMeal(plan), pct(planWelfareTax(plan)))) : 0;
  const label = `${plan?.name ?? cc.planId}（${cc.course}）`;
  const tx = (id: string) => billRate(pct(id));
  const baseTx = tx(planBaseTax(plan)), welTx = tx(planWelfareTax(plan));
  const lines: FeeLine[] = [
    { name: `${label} 基本料金`, amountYen: price - welfare, taxRate: baseTx, src: 'plan', refId: cc.planId },
    { name: `${label} 福利厚生（企業負担分）`, amountYen: welfare, taxRate: welTx, src: 'plan', refId: cc.planId },
  ];
  for (const id of cc.optionIds) {
    const o = m.option(id);
    if (!o) continue;
    const unit = optionAmount(o, cc);
    /* 配送回数追加：温度帯ごとに標準を超えた回数 × 金額（回数がわからない古いデータは1回）。自販機リース：台数 × 1台の金額 */
    const qty = optionQtyOf(id, cc);
    if (unit) lines.push({ name: qty > 1 ? `${o.name} × ${qty}${o.unit || '回'}（${o.id}）` : `${o.name}（${o.id}）`, amountYen: unit * qty, taxRate: tx(optionTax(o)), src: 'option', refId: o.id });
  }
  for (const id of cc.discountIds) {
    const d = m.discount(id);
    if (!d || m.skipDiscount?.(d)) continue;
    const dTx = discountTax(d) ? tx(discountTax(d)) : baseTx;
    const calc = calcOf(d);
    /* 旧ライト→スタンダード移行割（7-2）：基本料金を同じプランの ESライト（冷蔵庫）の価格にする（差額だけ 10% の行で引く） */
    if (calc === 'liteBase' || calc === 'diffAuto') {
      const lite = prices.some((p) => p.course === 'ESライト（冷蔵庫）') ? yenOf(prices.find((p) => p.course === 'ESライト（冷蔵庫）'), method) : price;
      if (price > lite) lines.push({ name: `${d.name}（${d.id}）`, amountYen: -(price - lite), taxRate: dTx, src: 'discount', refId: d.id });
      continue;
    }
    if (calc === 'fixed' || calc === 'rate') {
      const v = calc === 'fixed' ? d.amountYen ?? 0 : Math.floor((price * (d.ratePct ?? 0)) / 100);
      const amt = Math.min(price, d.capYen ? Math.min(v, d.capYen) : v);
      if (amt > 0) lines.push({ name: `${d.name}（${d.id}）`, amountYen: -amt, taxRate: dTx, src: 'discount', refId: d.id });
      continue;
    }
    /*
     * refPlan（お試しキャンペーン割引 DC000013）：参照するプラン・コース（50プラン ESライト（冷蔵庫））のそのサイクル月の料金。請求額（プラン料金）を超えない。
     * 参照するプランの内訳どおりに引く：福利厚生分＝参照するプランの企業負担分（この子契約の企業負担分まで）、基本料金分＝残り（この子契約の基本料金まで）。
     * プラン50 なら両方の行がちょうど 0 円（台帳 E「お試し割引の税率の分け方」2026-10-05）。0円の行は出さない。参照がなければプラン料金をすべて（今の割合で）
     */
    const refPlan = d.refPlanId ? m.plan(d.refPlanId) : undefined;
    const refPrice = refPlan ? pricesAt(refPlan, cc.cycleMonth).find((p) => p.course === (d.refCourse ?? 'ESライト（冷蔵庫）')) : undefined;
    const ref = refPrice ? yenOf(refPrice, method) : undefined;
    const amt = Math.min(price, ref ?? price);
    const refWel = refPlan && ref !== undefined ? Math.min(ref, welfareOf(refPlan.monthlyMeals, welfarePerMeal(refPlan), pct(planWelfareTax(refPlan)))) : price > 0 ? Math.floor((amt * welfare) / price) : 0;
    const wel = Math.min(refWel, welfare, amt);
    const base = Math.min(amt - wel, price - welfare);
    if (base > 0) lines.push({ name: `${d.name}（基本料金分）`, amountYen: -base, taxRate: baseTx, src: 'discount', refId: d.id });
    if (wel > 0) lines.push({ name: `${d.name}（福利厚生分）`, amountYen: -wel, taxRate: welTx, src: 'discount', refId: d.id });
  }
  return { at, meals, lines };
}

/**
 * プランの価格（価格世代）。genId（子契約の「適用された価格プラン」）があればその世代、なければ fromCycle ≦ サイクル月のいちばん新しい世代。
 * どちらもなければ prices（公開用の世代と同じ値）。サイクル月も世代も渡さないときは prices
 */
export function pricesAt(plan: Plan | undefined, cycleMonth?: string, genId?: string) {
  if (!plan) return [];
  const byId = genId ? (plan.priceGens ?? []).find((x) => x.id === genId) : undefined;
  const g = byId ?? (cycleMonth ? (plan.priceGens ?? []).filter((x) => x.fromCycle <= cycleMonth).sort((a, b) => a.fromCycle.localeCompare(b.fromCycle)).pop() : undefined);
  return g ? g.prices : plan.prices;
}
/** 公開用の世代（運営が印を付けた世代。法人Web の申込・プラン変更に出す。印がない古いデータは いちばん新しい世代） */
export function publicGenOf(plan: Plan | undefined): PriceGen | undefined {
  const gens = [...(plan?.priceGens ?? [])].sort((a, b) => a.fromCycle.localeCompare(b.fromCycle));
  return gens.find((g) => g.public) ?? gens[gens.length - 1];
}
/** 公開用の価格（コースごと。法人Web の申込・プラン変更・運営のプラン変更が出す価格） */
export const publicPricesOf = (plan: Plan | undefined): PlanCoursePrice[] => publicGenOf(plan)?.prices ?? plan?.prices ?? [];
/** 子契約（申込）の配送方法：資材以外の便の serviceForm（なければ ES配送便） */
export const methodOf = (cc: { channels?: Channel[] }): ServiceForm => cc.channels?.find((ch) => ch.temp !== '資材')?.serviceForm ?? 'ES配送便';
/** コースの価格を配送方法で選ぶ（COOL便＝coolYen、ES配送便＝esYen。ないときは monthlyYen） */
export const yenOf = (p: PlanCoursePrice | undefined, method?: ServiceForm): number =>
  !p ? 0 : method === 'COOL便' ? p.coolYen ?? p.esYen ?? p.monthlyYen : p.esYen ?? p.coolYen ?? p.monthlyYen;

/** 共通データのマスタから ① 費目を作る（いまのマスタの金額。サイクル月があればその月の価格世代） */
export const feesNow = (r: DocRepo, cc: FeeInput & Partial<Pick<ChildContract, 'id' | 'branchId'>>) => feesOf(cc, {
  plan: (id) => r.get<Plan>('dm.master.plans', id),
  option: (id) => r.get<Option>('dm.master.options', id),
  discount: (id) => r.get<Discount>('dm.master.discounts', id),
  rate: (id) => r.get<TaxRate>('dm.master.taxRates', id)?.rate,
  skipDiscount: (d) => corpLimitHit(r, cc, d),
});

/**
 * 法人ごとの回数の上限（maxPerCorp。お試しキャンペーン割引＝法人ごとに1回：同じ法人で同じサイクル月にこの値引きのある拠点が複数なら、
 * 拠点ID の小さい順に上限まで。拠点ごとに請求する法人は先頭の拠点だけ・2026/10/03）
 */
export function corpLimitHit(r: DocRepo, cc: Partial<Pick<ChildContract, 'branchId' | 'cycleMonth' | 'id'>>, d: Discount) {
  if (!d.maxPerCorp || !cc.branchId || !cc.cycleMonth) return false;
  const corpId = r.get<Branch>('dm.org.branches', cc.branchId)?.corpId;
  if (!corpId) return false;
  const mine = new Set(r.list<Branch>('dm.org.branches').filter((b) => b.corpId === corpId).map((b) => b.id));
  const holders = [...new Set(r.list<ChildContract>('dm.org.childContracts')
    .filter((x) => !x.canceled && x.cycleMonth === cc.cycleMonth && mine.has(x.branchId) && x.discountIds.includes(d.id)).map((x) => x.branchId))].sort();
  if (!holders.includes(cc.branchId)) holders.push(cc.branchId), holders.sort();
  return holders.indexOf(cc.branchId) >= d.maxPerCorp;
}

/** 子契約の ① 費目（写し）。写しがない古いデータだけ、いまのマスタから作る（check.run が「写しがない」と出す） */
export const feesFor = (r: DocRepo, cc: ChildContract): ChildFees => cc.fees ?? feesNow(r, cc);

/** ① 費目の中身を変える項目（未確定の子契約でこれが変わったら作り直す） */
export const FEE_KEYS = ['planId', 'course', 'optionIds', 'discountIds', 'amounts', 'deliveryExtra', 'optionQty', 'priceGenId', 'channels'] as const;

/* ---------------- 子契約のロック ---------------- */

/** 確定・請求済の子契約は変えられない（④） */
export const childLocked = (cc: Pick<ChildContract, 'billStatus'>) => cc.billStatus !== '未確定';

/** 変えられない理由とほかの方法（画面のトースト・エラーに出す） */
export function lockMsg(cc: Pick<ChildContract, 'id' | 'cycleMonth' | 'billStatus'>) {
  return cc.billStatus === '確定'
    ? `子契約 ${cc.id}（${cc.cycleMonth} サイクル）は請求の画面で確定済みのため変更できません。請求の画面で「確定解除」してから直してください`
    : `子契約 ${cc.id}（${cc.cycleMonth} サイクル）は請求済みのため変更できません。差額は請求の画面の ③ 調整（請求調整）で対応してください`;
}

/* ---------------- 名前の写し ---------------- */

/** 画面に出す名前：写しといまの名前が違えば「旧名（現：新名）」。写しがなければいまの名前（納品書・請求書は写しだけを使う） */
export const shownName = (snap: string | undefined, current: string | undefined) =>
  !snap ? current ?? '' : current && current !== snap ? `${snap}（現：${current}）` : snap;

/** 配送の明細の商品名（画面用） */
export const lineName = (r: DocRepo, l: Pick<DeliveryLine, 'productId' | 'productName'>) =>
  shownName(l.productName, r.get<Product>('dm.master.products', l.productId)?.name ?? l.productId);

/** 配送の拠点名（画面用）。納品した配送は納品したときの名前（destination.name） */
export const deliveryBranchName = (r: DocRepo, d: Pick<Delivery, 'branchId' | 'status' | 'destination'>) => {
  const cur = r.get<Branch>('dm.org.branches', d.branchId)?.name;
  return DELIVERED.includes(d.status) ? shownName(d.destination.name, cur) : cur ?? d.destination.name;
};

/** 納品した（写しを持つ）配送の状態 */
export const DELIVERED: Delivery['status'][] = ['納品済', '一部納品済'];

/**
 * 納品したときの写し：明細の商品名・拠点名（destination.name）・区間の支払額（配送会社の feePerDelivery）。
 * すでに写しがあるものは変えない（トラブルの解決で状態が変わっても、最初に納品したときの値）
 */
export function stampDelivered(r: DocRepo, deliveryId: string) {
  const d = r.get<Delivery>('dm.delivery.deliveries', deliveryId);
  if (!d) return;
  const legs = r.list<Leg>('dm.delivery.legs').filter((x) => x.deliveryId === d.id);
  /* 区間の支払額があれば写し済み（もう一度納品済になったときは変えない） */
  if (legs.some((l) => l.feeYen !== undefined)) return;
  for (const l of r.list<DeliveryLine>('dm.delivery.lines').filter((x) => x.deliveryId === d.id && x.productName === undefined)) {
    r.put<DeliveryLine>('dm.delivery.lines', l.id, { ...l, productName: r.get<Product>('dm.master.products', l.productId)?.name ?? l.productId });
  }
  /* 区間の支払額：届け先の都道府県のエリア別の額（なければ 1件の支払額。lib/domain/carrierFee.ts） */
  const br = r.get<Branch>('dm.org.branches', d.branchId);
  for (const l of legs) r.put<Leg>('dm.delivery.legs', l.id, { ...l, feeYen: carrierFeeFor(r.get<Carrier>('dm.master.carriers', l.carrierId), br?.address?.pref) });
  const name = br?.name;
  if (name && name !== d.destination.name) r.put<Delivery>('dm.delivery.deliveries', d.id, { ...d, destination: { ...d.destination, name } });
}

/* ---------------- 仕入単価 ---------------- */

/** 仕入単価（税抜）：その仕入先の単価、なければ選択中の仕入先の単価。仕入単価の改定（nextCost）は適用開始日から（RD-MN-076） */
export const unitCostOf = (p: Product | undefined, supplierId: string) => {
  if (!p) return undefined;
  const s = p.suppliers.find((x) => x.supplierId === supplierId) ?? selectedSupplier(p);
  return s ? costOn(s) : undefined;
};

/** 本発注した発注に仕入単価の写しを付ける（資材・写しがあるもの・本発注前は変えない）。付けたら true */
export function stampUnitCost(o: { pid: string; sup: string; type: string; hon: number; unitCostYen?: number }, product: (id: string) => Product | undefined) {
  if (o.type === '資材' || !(o.hon > 0) || o.unitCostYen !== undefined) return false;
  const c = unitCostOf(product(o.pid), o.sup);
  if (c === undefined) return false;
  o.unitCostYen = c;
  return true;
}
