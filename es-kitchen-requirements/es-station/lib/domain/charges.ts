import type { DocRepo } from '@/lib/ops/core/area';
import type { Channel, ChargeLink, ChargeTrigger, ChildContract, Course, Discount, Loan, Material, MaterialOrder, Model, Option, Plan } from './types';
import { DEFAULT_RATES, billRate } from './tax';

/*
 * 費目（オプション・値引き）の決まり（2026/10/03 決定：1つのマスタ・ID は変えない。00_確認してほしい/オプション・値引き_定義_20261003.md §4）。
 *   コードが使う OP／DC の ID はここ（CHARGE_IDS：いつ発生するか → ID）だけに書く。金額・税率・名前はマスタ（dm.master.options／discounts）から読む。
 *   A型（契約項目に連動・28-43）は契約項目とオプションを1つのデータにそろえる（syncLinked）：ES-QR・ゲストモード・ユーザー現金利用・配送回数
 *   プランマスタの設定（企業負担額・免責金額・基本比×倍・初期費用・初期備品・プランに含む資材）もここで読む（既定は今までの値）
 */

/** いつ発生するか → ID（コードと1対1。check.run がマスタにあるか・trigger が合うかを確かめる） */
export const CHARGE_IDS = {
  'item.deliveryOver': 'OP000001',
  'item.esqr': 'OP000002',
  'item.guest': 'OP000003',
  'item.cash': 'OP000035',
  'event.contractInit': 'OP000008',
  'event.inventoryUnfiled': 'OP000016',
  'event.equipSwapOne': 'OP000019',
  'event.equipSwapMany': 'OP000020',
  'event.equipStairs': 'OP000021',
  'event.equipPickup': 'OP000022',
  'event.equipSizeDiff': 'OP000023',
  'event.materialOrderPaid': 'OP000036',
  'contract.vmLease': 'OP000037',
  'event.trialChild': 'DC000013',
  'event.planUpMigrate': 'DC000021',
} as const satisfies Partial<Record<ChargeTrigger, string>>;
export type ChargeKey = keyof typeof CHARGE_IDS;

/** よく使う ID（読みやすさのため。値は CHARGE_IDS） */
export const EXTRA_DELIVERY_OPTION = CHARGE_IDS['item.deliveryOver'];
export const TRIAL_DISCOUNT = CHARGE_IDS['event.trialChild'];
export const MIGRATE_DISCOUNT = CHARGE_IDS['event.planUpMigrate'];
export const INIT_OPTION = CHARGE_IDS['event.contractInit'];
export const PENALTY_OPTION = CHARGE_IDS['event.inventoryUnfiled'];
export const PULL_OPTION = CHARGE_IDS['event.equipPickup'];
export const MAT_EXTRA_OPTION = CHARGE_IDS['event.materialOrderPaid'];
export const VM_LEASE_OPTION = CHARGE_IDS['contract.vmLease'];
const LIGHT_VM: Course = 'ESライト（自販機）';

/** A型の契約項目 → オプション ID と子契約のフラグ（deliveryCount は便の数から決まる） */
export const LINKS: Record<Exclude<ChargeLink, 'deliveryCount'>, { id: string; flag: 'allowEsqr' | 'allowGuest' | 'allowCash'; label: string }> = {
  esqr: { id: CHARGE_IDS['item.esqr'], flag: 'allowEsqr', label: 'ES-QR' },
  guestMode: { id: CHARGE_IDS['item.guest'], flag: 'allowGuest', label: 'ゲストモード' },
  userCash: { id: CHARGE_IDS['item.cash'], flag: 'allowCash', label: 'ユーザー現金利用' },
};

export const optionOf = (r: DocRepo, key: ChargeKey) => r.get<Option>('dm.master.options', CHARGE_IDS[key]);
export const discountOf = (r: DocRepo, key: ChargeKey) => r.get<Discount>('dm.master.discounts', CHARGE_IDS[key]);
/** 管理名（社内用）。空なら請求書の表示名 */
export const adminNameOf = (x: Pick<Option, 'name' | 'mgmtName'>) => x.mgmtName?.trim() || x.name;
/** 金額（税抜）：子契約の上書き（REQ-CT-304）があればそれ、なければマスタ */
export const optionAmount = (o: Pick<Option, 'id' | 'amountYen'>, cc?: Pick<ChildContract, 'amounts'>) => cc?.amounts?.[o.id] ?? o.amountYen;
/** オプションの数：配送回数追加は温度帯ごとの回数の合計（わからない古いデータは1）、ほかは optionQty（自販機リースの台数など。省くと1） */
export const optionQtyOf = (id: string, cc: Partial<Pick<ChildContract, 'optionQty' | 'deliveryExtra'>>) =>
  id === EXTRA_DELIVERY_OPTION ? Math.max(1, extraCount(cc.deliveryExtra)) : Math.max(1, cc.optionQty?.[id] ?? 1);
/** 子契約の月額のオプション分（税抜）：金額の上書き・数（配送回数追加の回数・自販機の台数）を含む（金額の上書きを直したときの月額の差の計算に使う） */
export function monthlyOptionsYen(r: DocRepo, cc: Pick<ChildContract, 'optionIds' | 'amounts' | 'deliveryExtra' | 'optionQty'>) {
  return cc.optionIds.reduce((a, id) => {
    const o = r.get<Option>('dm.master.options', id);
    return a + (o && o.feeType === '月額料金' ? optionAmount(o, cc) * optionQtyOf(id, cc) : 0);
  }, 0);
}
/** マスタのオプションの金額（なければ fallback） */
export const amountOf = (r: DocRepo, key: ChargeKey, fallback = 0) => optionOf(r, key)?.amountYen ?? fallback;
/** オプションの税率（％・税率マスタ） */
export const optionRate = (r: DocRepo, o: Pick<Option, 'taxRateId'> | undefined): number =>
  billRate(r.get<{ rate: number }>('dm.master.taxRates', o?.taxRateId ?? 'TX02')?.rate ?? DEFAULT_RATES[o?.taxRateId ?? 'TX02'] ?? 10);

/* ---------------- 配送回数追加（OP000001・A型） ---------------- */

/**
 * 温度帯ごとにプランの標準の配送回数を超えた回数（28-154・28-156：足りない温度帯と相殺しない）。
 * 冷蔵＝冷蔵・常温の便、冷凍＝冷凍の便。資材の便は数えない
 */
export function deliveryExtraOf(plan: Plan | undefined, course: Course | '', channels: Pick<Channel, 'temp' | 'slots'>[]): { cool: number; frozen: number } {
  const lim = (t: '冷蔵' | '冷凍') => plan?.limits?.find((x) => x.course === course && x.temp === t);
  const n = (frozen: boolean) => channels.filter((c) => c.temp !== '資材' && (c.temp === '冷凍') === frozen).reduce((a, c) => a + c.slots.length, 0);
  const over = (frozen: boolean) => { const k = n(frozen); const std = lim(frozen ? '冷凍' : '冷蔵')?.deliveries ?? k; return k ? Math.max(0, k - std) : 0; };
  return { cool: over(false), frozen: over(true) };
}
export const extraCount = (x: ChildContract['deliveryExtra']) => (x?.cool ?? 0) + (x?.frozen ?? 0);

/* ---------------- A型：契約項目とオプションを1つに ---------------- */

/**
 * 子契約の A型のオプションと契約項目（フラグ・配送回数）をそろえる（2026/10/03：1つのデータ）。
 *   ES-QR・ゲストモード・ユーザー現金利用：前の子契約（prev）と比べ、フラグを変えたらオプションをそろえる・オプションを付け外ししたらフラグをそろえる。
 *   prev がない（新しく作る・見本）ときは どちらかが「利用する」なら両方 利用する。
 *   配送回数追加：便とプランから回数を出し（deliveryExtra）、1回以上なら OP000001 を付ける（金額は 回数 × マスタの金額）
 */
export function syncLinkedWith(plan: Plan | undefined, next: ChildContract, prev?: Pick<ChildContract, 'optionIds' | 'app'>): ChildContract {
  let optionIds = [...next.optionIds];
  const app = { ...next.app };
  for (const l of Object.values(LINKS)) {
    /* ゲストモードの使える／料金の月の違い（guestSplit）はそろえない */
    if (l.flag === 'allowGuest' && app.guestSplit) continue;
    const has = optionIds.includes(l.id), flag = !!app[l.flag];
    let on: boolean;
    if (!prev) on = has || flag;
    else if (flag !== !!prev.app[l.flag]) on = flag;
    else if (has !== prev.optionIds.includes(l.id)) on = has;
    else on = has || flag;
    app[l.flag] = on;
    optionIds = on ? (has ? optionIds : [...optionIds, l.id]) : optionIds.filter((x) => x !== l.id);
  }
  const deliveryExtra = deliveryExtraOf(plan, next.course, next.channels);
  const extra = extraCount(deliveryExtra) > 0;
  optionIds = [...optionIds.filter((x) => x !== EXTRA_DELIVERY_OPTION), ...(extra ? [EXTRA_DELIVERY_OPTION] : [])];
  /* 自販機リース（OP000037）：ESライト（自販機）の子契約には必ず付ける・ほかのコースでは外す（台帳「自販機のリース料」2026/10/03） */
  const vm = next.course === LIGHT_VM;
  optionIds = [...optionIds.filter((x) => x !== VM_LEASE_OPTION), ...(vm ? [VM_LEASE_OPTION] : [])];
  const out: ChildContract = { ...next, optionIds, app, deliveryExtra };
  if (!vm) {
    const drop = <T,>(m?: Record<string, T>) => (m && VM_LEASE_OPTION in m ? Object.fromEntries(Object.entries(m).filter(([k]) => k !== VM_LEASE_OPTION)) : m);
    if (out.amounts) out.amounts = drop(out.amounts);
    if (out.optionQty) out.optionQty = drop(out.optionQty);
  }
  return out;
}
/**
 * 自販機リースの台数と1台の金額の初期値：拠点に貸出中の自販機（機種マスタの分類＝自販機）があればその台数・機種、
 * なければプランの ESライト（自販機）の標準貸出設備。金額＝機種マスタの月額（なければ OP000037 のマスタの金額）
 */
export function vmLeaseOf(r: DocRepo, branchId: string, planId: string): { qty: number; unitYen: number } {
  const model = (id: string) => r.get<Model>('dm.master.models', id);
  const loans = r.list<Loan>('dm.org.loans').filter((l) => l.branchId === branchId && l.status === '貸出中' && model(l.modelId)?.category === '自販機');
  const std = (r.get<Plan>('dm.master.plans', planId)?.stdEquipment ?? []).filter((x) => x.course === LIGHT_VM && model(x.modelId)?.category === '自販機');
  const rows = loans.length ? loans : std;
  const qty = rows.reduce((a, x) => a + x.qty, 0) || 1;
  const unitYen = (rows[0] && model(rows[0].modelId)?.monthlyYen) ?? amountOf(r, 'contract.vmLease');
  return { qty, unitYen };
}
/**
 * A型・自販機リースをそろえる（共通データ）。自販機リースの台数は拠点の自販機の台数、1台の金額は上書きがなければ機種マスタの月額で入れる
 * （契約ごとに直した金額 amounts はそのまま）
 */
export function syncLinked(r: DocRepo, next: ChildContract, prev?: Pick<ChildContract, 'optionIds' | 'app'>): ChildContract {
  const out = syncLinkedWith(r.get<Plan>('dm.master.plans', next.planId), next, prev);
  if (!out.optionIds.includes(VM_LEASE_OPTION)) return out;
  const v = vmLeaseOf(r, out.branchId, out.planId);
  return { ...out, optionQty: { ...out.optionQty, [VM_LEASE_OPTION]: v.qty }, amounts: { ...out.amounts, [VM_LEASE_OPTION]: out.amounts?.[VM_LEASE_OPTION] ?? v.unitYen } };
}

/** A型の食い違い（check.run）：フラグとオプション・配送回数とオプションの回数 */
export function linkedProblems(plan: Plan | undefined, cc: ChildContract): string[] {
  const p: string[] = [];
  for (const l of Object.values(LINKS)) {
    if (l.flag === 'allowGuest' && cc.app.guestSplit) continue;
    if (!!cc.app[l.flag] !== cc.optionIds.includes(l.id)) p.push(`子契約 ${cc.id} の${l.label}（${cc.app[l.flag] ? '利用する' : '利用しない'}）と A型オプション ${l.id}（${cc.optionIds.includes(l.id) ? 'あり' : 'なし'}）が合わない`);
  }
  if ((cc.course === LIGHT_VM) !== cc.optionIds.includes(VM_LEASE_OPTION)) p.push(`子契約 ${cc.id} のコース（${cc.course}）と 自販機リース ${VM_LEASE_OPTION}（${cc.optionIds.includes(VM_LEASE_OPTION) ? 'あり' : 'なし'}）が合わない`);
  const x = deliveryExtraOf(plan, cc.course, cc.channels);
  if (extraCount(x) > 0 !== cc.optionIds.includes(EXTRA_DELIVERY_OPTION)) p.push(`子契約 ${cc.id} の配送回数追加（標準を超える ${extraCount(x)}回）と ${EXTRA_DELIVERY_OPTION}（${cc.optionIds.includes(EXTRA_DELIVERY_OPTION) ? 'あり' : 'なし'}）が合わない`);
  if (extraCount(x) !== extraCount(cc.deliveryExtra) && (cc.deliveryExtra || extraCount(x) > 0)) p.push(`子契約 ${cc.id} の配送回数追加の回数 ${extraCount(cc.deliveryExtra)} が便から出した ${extraCount(x)} と違う`);
  return p;
}

/* ---------------- プランマスタの設定 ---------------- */

/** 企業負担額（税込・1食。既定 100円・28-147） */
export const welfarePerMeal = (plan: Pick<Plan, 'welfareYenPerMeal'> | undefined) => plan?.welfareYenPerMeal ?? 100;
/**
 * 企業負担分（税抜）＝ 企業負担額 × 月次提供上限の合計 ÷（1＋税率）、1円未満切り捨て（28-148）。
 * 残りが基本料金。整数で割る（小数の誤差を出さない）
 */
export const welfareOf = (meals: number, yenPerMeal = 100, ratePct = 8) => Math.floor((meals * yenPerMeal * 100) / (100 + ratePct));
/** 免責金額（実績精算の管理ロスの許容・税込。既定 0） */
export const deductibleOf = (plan: Pick<Plan, 'deductibleYen'> | undefined) => plan?.deductibleYen ?? 0;
/** 基本比×倍（デフォルト注文＝基準注文数 × この倍。既定 月次提供上限の合計 ÷ 50 の四捨五入・1以上） */
export const baseRatioOf = (plan: Pick<Plan, 'baseRatio' | 'monthlyMeals'> | undefined, meals?: number) =>
  plan?.baseRatio && plan.baseRatio > 0 ? plan.baseRatio : Math.max(1, Math.round((meals ?? plan?.monthlyMeals ?? 50) / 50));
/**
 * 初期費用（税抜・OP000008 の初期値）：自販機を置く拠点は自販機の機種マスタの初期料金、なければ・自販機のない拠点は OP000008 のマスタの金額
 * （プランマスタの初期料金は廃止：台帳「自販機の初期費用」2026/10/03）。契約ごとに直せる（受付・請求の調整）
 */
export function initFeeOf(r: DocRepo, equipment: { modelId: string; qty: number }[] = []) {
  const vm = equipment.map((e) => r.get<Model>('dm.master.models', e.modelId)).find((m) => m?.category === '自販機');
  return vm?.initFeeYen ?? amountOf(r, 'event.contractInit');
}
/** 初期備品（資材の初期セット）：プランのコースの資材と数 */
export const initialItemsOf = (plan: Plan | undefined, course: Course | '') =>
  (plan?.initialItems ?? []).filter((x) => x.course === course && x.qty > 0).map((x) => ({ materialId: x.materialId, qty: x.qty }));

/* ---------------- 値引き ---------------- */

/** 値引きの計算区分（旧の rule・省略を読み替える） */
export const calcOf = (d: Pick<Discount, 'calcKind' | 'rule'>) => d.calcKind ?? (d.rule === 'liteBase' ? 'liteBase' : 'refPlan');

/* ---------------- 資材（プランの数量を超えた分・2回目の資材便） ---------------- */

/** その日のサイクル月（暦の外は暦の月） */
export function cycleMonthAt(r: DocRepo, day: string) {
  const c = r.list<{ id: string; a1: string; d7: string }>('dm.delivery.cycles').find((x) => x.a1 <= day && day <= x.d7);
  return c?.id ?? day.slice(0, 7).replace('/', '-');
}

/**
 * プランの数量を超えた資材（同じサイクル月の注文の合計 − 月の無料数量〈資材 × プラン。入れていなければプランの食数〉。前の注文で超えた分は数えない）。
 * 単価 0 の資材は請求しないので入れない。order＝これから入れる注文（直すときはその注文を除いて数える）
 */
export function materialExcess(r: DocRepo, branchId: string, cycleMonth: string, lines: { materialId: string; qty: number }[], exceptId = ''): NonNullable<MaterialOrder['excess']> {
  const cc = r.list<ChildContract>('dm.org.childContracts').find((x) => x.branchId === branchId && x.cycleMonth === cycleMonth && !x.canceled)
    ?? r.list<ChildContract>('dm.org.childContracts').filter((x) => x.branchId === branchId && !x.canceled).sort((a, b) => b.cycleMonth.localeCompare(a.cycleMonth))[0];
  const plan = cc ? r.get<Plan>('dm.master.plans', cc.planId) : undefined;
  const included = new Map((plan?.includedMaterials ?? []).map((x) => [x.materialId, x.qty]));
  const before = new Map<string, number>();
  for (const m of r.list<MaterialOrder>('dm.delivery.materialOrders').filter((x) => x.id !== exceptId && x.branchId === branchId && x.kind === 'regular' && x.status !== '取消' && (x.cycleMonth ?? cycleMonthAt(r, x.orderedAt.slice(0, 10))) === cycleMonth)) {
    for (const l of m.lines) before.set(l.materialId, (before.get(l.materialId) ?? 0) + l.qty);
  }
  const out: NonNullable<MaterialOrder['excess']> = [];
  for (const l of lines) {
    const mat = r.get<Material>('dm.master.materials', l.materialId);
    const unit = mat?.priceYen ?? 0;
    if (!(unit > 0)) continue;
    /* 月の無料数量：資材 × プランの表の値、入れていなければプランの食数（台帳「資材の無料の数量」2026/10/03） */
    const inc = included.get(l.materialId) ?? plan?.monthlyMeals ?? 0, prior = before.get(l.materialId) ?? 0;
    const over = Math.max(0, prior + l.qty - inc) - Math.max(0, prior - inc);
    if (over > 0) out.push({ materialId: l.materialId, qty: over, unitYen: unit, taxRate: billRate(r.get<{ rate: number }>('dm.master.taxRates', mat?.taxRateId ?? 'TX02')?.rate ?? 10) });
  }
  return out;
}
