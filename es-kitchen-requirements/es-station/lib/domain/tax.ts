import type { DocRepo } from '@/lib/ops/core/area';
import type { Carrier, Discount, Model, Option, Plan, Product, TaxRate } from './types';

/*
 * 税率（dm.master.taxRates）の共通の決まり（2026/10/03「お金の項目はすべて税込／税抜と税率をはっきり」）。
 *   税率は全画面で同じドロップダウン（運営 app/ops/_ui/TaxRateSelect.tsx）から選ぶ。その場で足せる・使っていれば消せない（409）。
 *   金額の持ち方：商品の販売価格だけ税込、ほか（プラン・機種・オプション・値引き・委託の支払額・仕入単価）は税抜。
 *   既定（項目を省いたとき）：プランの基本料金 10%・企業負担（福利厚生）8%（決定 28-149）、機種・オプション・委託 10%、
 *   仕入単価＝商品の税率、値引き＝元の費目と同じ（移行割は基本料金と同じ）。
 *   請求書は税率ごとの欄（インボイスの税率ごとの合計）。税率マスタのどの率でも（2026-10-05。前は 8%／10% の2つだけ）
 */

/** 標準税率 10% */
export const TAX_STD = 'TX02';
/** 軽減税率 8%（食事・企業負担分） */
export const TAX_REDUCED = 'TX01';
/** マスタが読めないときの率（見本の TX01・TX02 と同じ） */
export const DEFAULT_RATES: Record<string, number> = { TX01: 8, TX02: 10 };

/** 税率 ID → ％（ないときは fallback） */
export const rateOf = (r: DocRepo, id: string | undefined, fallback = 10) =>
  r.get<TaxRate>('dm.master.taxRates', id ?? '')?.rate ?? DEFAULT_RATES[id ?? ''] ?? fallback;

/** 請求書の欄の税率（％）。税率マスタのどの率でも（2026-10-05。前は 8% 以外を 10% にまとめていた） */
export const billRate = (rate: number): number => rate;

/* ---------- 項目ごとの税率 ID（省いたときの既定） ---------- */
export const planBaseTax = (p?: Pick<Plan, 'taxRateId'>) => p?.taxRateId || TAX_STD;
export const planWelfareTax = (p?: Pick<Plan, 'welfareTaxRateId'>) => p?.welfareTaxRateId || TAX_REDUCED;
export const modelTax = (m?: Pick<Model, 'taxRateId'>) => m?.taxRateId || TAX_STD;
export const optionTax = (o?: Pick<Option, 'taxRateId'>) => o?.taxRateId || TAX_STD;
export const carrierFeeTax = (c?: Pick<Carrier, 'feeTaxRateId'>) => c?.feeTaxRateId || TAX_STD;
/** 値引き：個別に指定した税率。省くと ''（元の費目と同じ） */
export const discountTax = (d?: Pick<Discount, 'taxRateId'>) => d?.taxRateId || '';
/** 仕入単価の税率（省くと商品の税率） */
export const supplierCostTax = (p: Pick<Product, 'taxRateId' | 'suppliers'>, supplierId: string) =>
  p.suppliers.find((s) => s.supplierId === supplierId)?.taxRateId || p.taxRateId;

/** 税率を使っているもの（「商品 3件」など）。空なら消せる */
export function taxUses(r: DocRepo, id: string): string[] {
  const out: string[] = [];
  const add = (what: string, n: number) => { if (n) out.push(`${what} ${n}件`); };
  const products = r.list<Product>('dm.master.products').filter((p) => p.status !== '削除済');
  add('商品', products.filter((p) => p.taxRateId === id).length);
  add('仕入単価', products.reduce((a, p) => a + p.suppliers.filter((s) => (s.taxRateId || p.taxRateId) === id && s.taxRateId).length, 0));
  const plans = r.list<Plan>('dm.master.plans').filter((p) => p.status !== '削除済');
  add('プラン', plans.filter((p) => planBaseTax(p) === id || planWelfareTax(p) === id).length);
  add('機種', r.list<Model>('dm.master.models').filter((m) => m.status !== '削除済' && modelTax(m) === id).length);
  add('オプション', r.list<Option>('dm.master.options').filter((o) => o.status !== '削除済' && optionTax(o) === id).length);
  add('値引き', r.list<Discount>('dm.master.discounts').filter((d) => d.status !== '削除済' && discountTax(d) === id).length);
  add('委託配送会社', r.list<Carrier>('dm.master.carriers').filter((c) => c.kind !== '路線' && carrierFeeTax(c) === id).length);
  return out;
}

/** ドロップダウンの選択肢（used＝使っている数の合計・removable＝消せる） */
export function taxRateOpts(r: DocRepo) {
  return r.list<TaxRate>('dm.master.taxRates').map((t) => {
    const uses = taxUses(r, t.id);
    return { ...t, used: uses.reduce((a, s) => a + (Number(/(\d+)件$/.exec(s)?.[1]) || 0), 0), uses };
  });
}

/** 税率の表示（'10%'・'軽減税率 8%' など）→ 税率 ID。同じ表示がなければ同じ％の税率。見つからなければ undefined */
export function taxIdByLabel(r: DocRepo, label: string | undefined): string | undefined {
  if (!label) return undefined;
  const all = r.list<TaxRate>('dm.master.taxRates');
  const pct = /(\d+(?:\.\d+)?)\s*[%％]/.exec(label)?.[1];
  return (all.find((t) => t.label === label || t.id === label) ?? all.find((t) => pct !== undefined && String(t.rate) === pct))?.id;
}
/** 税率 ID → 表示（ないときは ID） */
export const taxLabel = (r: DocRepo, id: string | undefined) => (id ? r.get<TaxRate>('dm.master.taxRates', id)?.label ?? id : '');
