import { DISCOUNTS as DM_DISCOUNTS, PRODUCTS } from '@/lib/domain/seed/master';
import { calcOf, TRIAL_DISCOUNT } from '@/lib/domain/charges';
import type { Prod } from './types';

/*
 * 請求の計算に使うマスタ（15_運営_請求.html と同じ値。請求デモで使う分だけ）。
 * プラン・値引き・機種は運営の機種・プランマスタ／値引きマスタに揃えたもの（2026/10/01 STEP3）。
 */

/**
 * 商品（定価）。共通データの商品マスタ（M001〜M032）と同じ。id は品番の数字の部分（M005 → 5）。
 * 画面（在庫調整の入力など）が決まった一覧として使うので、共通データの見本と同じ一覧から作る。計算は state の prods（dm.master.products）を使う
 */
export const PROD: Prod[] = PRODUCTS.map((p) => ({ id: Number(p.id.slice(1)), n: p.name, list: p.priceYen }));
export const prodName = (id: number) => PROD.find((p) => p.id === id)?.n ?? '';

/* ===== プランマスタ（料金表 2026/09 版・案2＝割引方式） =====
   [食数, スタンダード, ライト（冷蔵庫）, ライト（自販機）, 免責金額]（税抜）。料金改定①〜④の世代を持つ */
const TIERS: [number, number, number, number, number][] = [
  [30, 17000, 15000, 0, 0], [50, 27500, 24500, 0, 200], [100, 49500, 46000, 48000, 250], [150, 71500, 67000, 74000, 0], [200, 93500, 88500, 96000, 0], [250, 115500, 109500, 0, 0],
  [300, 137500, 130500, 139000, 0], [400, 181500, 172500, 0, 1200], [500, 225500, 214500, 0, 0], [600, 269500, 256500, 0, 0], [1000, 445500, 424500, 0, 0]];
const REV = [
  { n: '元の料金', from: '2024-01', to: '2024-09' },
  { n: '改訂第一回目', from: '2024-10', to: '2024-12' },
  { n: '改訂第二回目', from: '2025-01', to: '2026-03' },
  { n: '改訂第三回目', from: '2026-04', to: '' },
];
/* 価格プランの世代の履歴（50・100プラン）。ほかのプランは今の世代だけ */
const HIST: Record<number, Partial<Record<Course, number[]>>> = {
  50: { std: [24000, 25000, 26500, 27500], light: [21000, 22000, 23500, 24500] },
  100: { std: [44000, 46000, 48000, 49500], light: [41000, 43000, 45000, 46000], vm: [47000, 49000, 51000, 48000] },
};
export type Course = 'std' | 'light' | 'vm';
export type PriceRow = { n: string; from: string; to: string; cool: number; es: number };
const prices = (q: number, c: Course, cur: number): PriceRow[] => {
  const h = HIST[q]?.[c];
  return h ? REV.map((r, i) => ({ ...r, cool: c === 'vm' ? 0 : h[i], es: h[i] })) : [{ ...REV[3], cool: c === 'vm' ? 0 : cur, es: cur }];
};
const DEDOF = (q: number) => (q <= 100 ? 300 : q <= 200 ? 500 : q <= 400 ? 1000 : q <= 600 ? 1500 : 2000);
export type Plan = { id: string; pub: string; cap: number; ded: number; emp: number } & Partial<Record<Course, { prices: PriceRow[] }>>;
export const PLANS: Plan[] = TIERS.map(([q, std, lgt, vm, ded], i) => ({
  id: 'ES' + String(i + 2).padStart(6, '0'), pub: q + 'プラン', cap: q,
  std: { prices: prices(q, 'std', std) },
  light: { prices: prices(q, 'light', lgt) },
  ...(vm ? { vm: { prices: prices(q, 'vm', vm) } } : {}),
  ded: ded || DEDOF(q),
  emp: 100,   /* 企業負担額（税込・1食）＝ プランマスタの既定 100円（28-147） */
}));
export const plan = (id: string) => PLANS.find((p) => p.id === id) ?? PLANS[1];

export const COURSE: Record<Course, string> = { std: 'ESスタンダード（冷凍・冷蔵・常温）', light: 'ESライト（冷蔵・常温）', vm: 'ESライト（自販機）' };
export const SHIP: Record<'cool' | 'es', string> = { cool: 'COOL便', es: 'ES配送便' };

/* ===== 機種マスタ（無料判定のしきい値 freeAt は持たない＝0。2026/10/01 STEP3 Q1） ===== */
export const MODELS = [
  { id: 'RF000001', n: '冷蔵ショーケース 48L', freeAt: 0 },
  { id: 'RF000002', n: '冷蔵ショーケース 84L', freeAt: 0 },
  { id: 'RF000003', n: '冷蔵ショーケース 105L', freeAt: 0 },
  { id: 'RF000004', n: '冷蔵ショーケース 142L', freeAt: 0 },
  { id: 'FZ000001', n: '業務用冷凍庫 FZ-600', freeAt: 0 },
  { id: 'VM000001', n: 'カップ式自販機 VM-6010', freeAt: 0 },
  { id: 'MW000001', n: '業務用電子レンジ MRO-1200', freeAt: 0 },
  { id: 'BX000001', n: 'ボックス《仕切り皿》', freeAt: 0 },
];
export const model = (id?: string) => MODELS.find((m) => m.id === id);

/* ===== 値引きマスタ（共通データの値引きマスタ lib/domain/seed/master.ts の DISCOUNTS から作る。2026/10/03：コピーを持たない） =====
   請求の画面の拠点の discIds はいつも空（値引きは子契約の ① 費目の写しに入っている）。ここは表示・見本の計算のためだけ */
export type Discount = { id: string; code: string; name: string; from: string; to: string; course: string; auto?: boolean; calc: 'gap' | 'fixed' | 'all'; amt: number; trial?: boolean };
const CALC: Record<string, Discount['calc']> = { liteBase: 'gap', diffAuto: 'gap', refPlan: 'all', fixed: 'fixed', rate: 'fixed' };
export const DISCOUNTS: Discount[] = DM_DISCOUNTS.filter((d) => d.status === '使用中').map((d) => ({
  id: d.id, code: d.id, name: d.name, from: d.acceptFrom || '2024-01', to: d.acceptTo || '', course: calcOf(d) === 'liteBase' ? 'スタンダードのみ' : '全コース',
  auto: d.auto === 'auto', calc: CALC[calcOf(d)] ?? 'fixed', amt: d.amountYen ?? 0, trial: d.id === TRIAL_DISCOUNT,
}));
export const disc = (id: string) => DISCOUNTS.find((d) => d.id === id)!;
/** お試しキャンペーン割引の値引き額＝参照するプラン（DC000013 の refPlanId＝ES000003）・ライトのプラン料金 */
export const TRIAL_PLAN = DM_DISCOUNTS.find((d) => d.id === TRIAL_DISCOUNT)?.refPlanId ?? 'ES000003';

/** 価格調整の区分 */
export const ADJMODE: Record<'none' | 'up' | 'down' | 'free', string> = { none: 'なし', up: '値上げ', down: '値下げ', free: '無料提供（企業負担）' };

/** 請求リードタイムの表示 */
export const LEADLBL: Record<string, string> = { 3: '3ヶ月前（−3）', 2: '2ヶ月前（−2）', 1: '1ヶ月前（−1）', 0: '当月（0）', '-1': '翌月（+1・後払い）' };

/** 入金期限の決め方（請求先の設定） */
export const DUES = ['請求月の27日', '請求月の翌月27日'];

/** Bill One の送信が1回目だけ失敗する法人（デモ：大阪キッチン（C3・シナリオ説明書 ⑩）あての請求書。再送で発行できる） */
export const BO_FAIL_ONCE: Record<string, boolean> = { CU00003: true };

/** 請求書番号を固定する請求先（法人Webと同じ番号：法人あて 0001・名古屋 0014・千葉 0015・横浜 0016） */
export const INVFIX: Record<string, number> = { CU00001: 1, CU00902: 14, CU00961: 15, CU00950: 16 };
