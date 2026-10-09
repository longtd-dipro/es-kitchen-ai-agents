import { ApiError } from '@/lib/api/errors';
import type { DocRepo } from '@/lib/ops/core/area';
import { pickingWarehouses, stockAt } from './stock';
import { TAX_STD } from './tax';
import type { Course, Material, MaterialOrder, Plan, Warehouse } from './types';

/*
 * 資材マスタ（master.materials）の決まり。運営の資材マスタ（app/ops/masters/materials）・CSV・法人Web／運営の資材注文が同じものを読む。
 * 元：台帳 F「資材マスタの作り」「資材の納期（日）」（hong 2026-10-08）・受付簿 #358〜#361・画面設計書 AW_MATE。
 *   項目：資材名・コース（複数）・単位・規格・写真・単価（税抜）・税率・公開ステータス・取扱倉庫（複数）。仕入価格・個別コード（JAN）・納期は持たない
 *   削除：論理削除（status＝削除済）。使用中（プランの初期備品／月の無料数量・未納品の資材注文・倉庫の資材在庫 > 0）は削除できない（E259）
 */

export const MATERIAL_COURSES: Course[] = ['ESスタンダード', 'ESライト（冷蔵庫）', 'ESライト（自販機）'];
/** 取扱倉庫の初期値：ES事務所（倉庫マスタ WH00004） */
export const MATERIAL_DEFAULT_WH = 'WH00004';
export const MATERIAL_NAME_MAX = 60;
export const MATERIAL_UNIT_MAX = 20;
export const MATERIAL_SPEC_MAX = 60;
export const MATERIAL_PRICE_MAX = 999_999_999;
/** 写真：PNG・JPEG・WebP・5MB・1枚（商品マスタの商品写真と同じ。長い辺 1200px の確かめは画面のみ） */
export const MATERIAL_PHOTO_BYTES = 5 * 1024 * 1024;
export const MATERIAL_PHOTO_TYPES = ['image/png', 'image/jpeg', 'image/webp'];

/** 項目のない古いデータ（コース・単位・規格などを持つ前）に既定を補った資材 */
export type MaterialFull = Required<Pick<Material, 'id' | 'name' | 'courses' | 'unit' | 'spec' | 'photo' | 'publish' | 'warehouseIds' | 'status'>> & Pick<Material, 'priceYen' | 'taxRateId' | 'ver'>;
export function matOf(m: Material): MaterialFull {
  /* 以前の CSV 取込は status に 公開／非公開 を入れていた：非公開は公開ステータスへ寄せる */
  const legacy = (m.status as string | undefined) === '非公開';
  return {
    ...m, courses: m.courses ?? [...MATERIAL_COURSES], unit: m.unit ?? '個', spec: m.spec ?? '', photo: m.photo ?? '',
    publish: m.publish ?? (legacy ? '非公開' : '公開'), warehouseIds: m.warehouseIds ?? [MATERIAL_DEFAULT_WH], status: m.status === '削除済' ? '削除済' : '有効',
  };
}
/** 資材の一覧（共通データ）。削除済は既定で除く */
export const materialsOf = (r: DocRepo, withDeleted = false): MaterialFull[] =>
  r.list<Material>('dm.master.materials').map(matOf).filter((m) => withDeleted || m.status !== '削除済');
/** 法人Webに出す資材：削除済でなく、公開ステータスが公開のもの（非公開は出さない。運営の選択肢には出す：台帳 F 資材マスタの作り ③） */
export const corpMaterialsOf = (r: DocRepo): MaterialFull[] => materialsOf(r).filter((m) => m.publish === '公開');

/** 倉庫区分「ピッキング倉庫（資材）」の倉庫（有効）。取扱倉庫の選択肢（受付簿 #361） */
export const isMaterialWh = (w: Warehouse) => w.type === 'picking' && (w.forMaterial !== undefined ? w.forMaterial : w.name.includes('資材'));
export const materialWarehouses = (r: DocRepo): Warehouse[] => r.list<Warehouse>('dm.master.warehouses').filter((w) => isMaterialWh(w) && w.status === '有効');

/** 次の資材ID（S＋3桁の続き番号。削除済も数える） */
export function nextMaterialId(r: DocRepo): string {
  const n = Math.max(0, ...r.list<Material>('dm.master.materials').map((m) => Number(/^S(\d+)$/.exec(m.id)?.[1] ?? 0)));
  return `S${String(n + 1).padStart(3, '0')}`;
}

/* ---------- 使用中（削除できるか） ---------- */

export type MaterialUse = { plans: number; orders: number; warehouses: number };
/**
 * 使用中の数（E259 の {n}{m}{k}）：プラン＝初期備品／月の無料数量に載っているプラン（削除済を除く）、
 * 資材注文＝未納品（取消・納品済でない）の資材注文で、この資材を含むもの、倉庫＝この資材の在庫が 0 より多いピッキング倉庫
 */
export function materialUse(r: DocRepo, id: string): MaterialUse {
  const plans = r.list<Plan>('dm.master.plans').filter((p) => p.status !== '削除済' && ((p.initialItems ?? []).some((x) => x.materialId === id) || (p.includedMaterials ?? []).some((x) => x.materialId === id))).length;
  const orders = r.list<MaterialOrder>('dm.delivery.materialOrders').filter((o) => o.status !== '取消' && o.status !== '納品済' && o.lines.some((l) => l.materialId === id)).length;
  const warehouses = pickingWarehouses(r).filter((w) => stockAt(r, w.id, id).qty > 0).length;
  return { plans, orders, warehouses };
}
export const materialInUse = (u: MaterialUse) => u.plans + u.orders + u.warehouses > 0;
/** E259（削除できない。画面はモーダルで出す） */
export const materialBlockedText = (u: MaterialUse) =>
  `使用中のプラン ${u.plans}件・未納品の資材注文 ${u.orders}件・資材在庫のある倉庫 ${u.warehouses}件があるため削除できません。新規に選べなくする場合は公開ステータスを「非公開」にしてください。`;

/* ---------- 入力のチェック（画面とサーバーが同じもの） ---------- */

/** 登録・編集の入力（単価は文字のまま：空・数字以外を見分けるため） */
export type MaterialInput = {
  name: string; courses: string[]; unit: string; spec: string; photo: string; priceYen: string; taxRateId: string; publish: string; warehouseIds: string[];
};
/** チェックに要る外の情報（ほかの資材の名前・税率の ID・取扱倉庫に選べる倉庫の ID） */
export type MaterialCheckCtx = { otherNames: string[]; taxIds: string[]; whIds: string[] };
/** 写真の大きさ（data URL の本体のバイト数） */
const dataBytes = (url: string) => Math.floor(((url.split(',')[1] ?? '').length * 3) / 4);
export const PHOTO_ERR = 'PNG・JPEG・WebPの5MB以内・長い辺1200px以内にしてください。';

/**
 * 項目ごとのエラー（E01 必須・E04 文字数・E09 重複・E12 範囲・E14 数字）。メッセージは運営向け（画面設計書データ _共通_メッセージ）。なければ空
 */
export function materialErrors(m: MaterialInput, ctx: MaterialCheckCtx): Record<string, string> {
  const e: Record<string, string> = {};
  const name = m.name.trim();
  if (!name) e.name = '資材名は必須項目です。';
  else if ([...name].length > MATERIAL_NAME_MAX) e.name = `資材名は${MATERIAL_NAME_MAX}文字以内で入力してください。`;
  else if (ctx.otherNames.includes(name)) e.name = '資材名は既に登録されています。';
  if (!m.courses.length) e.courses = 'コースは必須項目です。';
  else if (m.courses.some((c) => !MATERIAL_COURSES.includes(c as Course))) e.courses = 'コースが正しくありません。';
  const unit = m.unit.trim();
  if (!unit) e.unit = '単位は必須項目です。';
  else if ([...unit].length > MATERIAL_UNIT_MAX) e.unit = `単位は${MATERIAL_UNIT_MAX}文字以内で入力してください。`;
  if ([...m.spec.trim()].length > MATERIAL_SPEC_MAX) e.spec = `規格は${MATERIAL_SPEC_MAX}文字以内で入力してください。`;
  const price = m.priceYen.trim();
  if (!price) e.priceYen = '単価（税抜）は必須項目です。';
  else if (!/^\d+$/.test(price)) e.priceYen = '単価（税抜）は数値で入力してください。';
  else if (Number(price) > MATERIAL_PRICE_MAX) e.priceYen = `単価（税抜）は0〜${MATERIAL_PRICE_MAX.toLocaleString('ja-JP')}の範囲で入力してください。`;
  if (!m.taxRateId) e.taxRateId = '税率は必須項目です。';
  else if (!ctx.taxIds.includes(m.taxRateId)) e.taxRateId = '税率が正しくありません。';
  if (!['公開', '非公開'].includes(m.publish)) e.publish = '公開ステータスは必須項目です。';
  if (!m.warehouseIds.length) e.warehouseIds = '取扱倉庫は必須項目です。';
  else if (m.warehouseIds.some((w) => !ctx.whIds.includes(w))) e.warehouseIds = '取扱倉庫が正しくありません。';
  if (m.photo && !m.photo.startsWith('photo:')) {
    const t = /^data:(image\/[a-z+]+);base64,/.exec(m.photo)?.[1];
    if (!t || !MATERIAL_PHOTO_TYPES.includes(t) || dataBytes(m.photo) > MATERIAL_PHOTO_BYTES) e.photo = PHOTO_ERR;
  }
  return e;
}

/** 資材の項目 → 入力の形（編集の初期値） */
export function inputOf(m: MaterialFull): MaterialInput {
  return {
    name: m.name, courses: [...m.courses], unit: m.unit, spec: m.spec, photo: m.photo, priceYen: m.priceYen === undefined ? '' : String(m.priceYen),
    taxRateId: m.taxRateId || TAX_STD, publish: m.publish, warehouseIds: [...m.warehouseIds],
  };
}
/** 入力 → 保存する資材の項目（id・ver・status は呼び出し側が決める） */
export function patchOf(m: MaterialInput): Pick<Material, 'name' | 'courses' | 'unit' | 'spec' | 'photo' | 'priceYen' | 'taxRateId' | 'publish' | 'warehouseIds'> {
  return {
    name: m.name.trim(), courses: MATERIAL_COURSES.filter((c) => m.courses.includes(c)), unit: m.unit.trim(), spec: m.spec.trim(), photo: m.photo,
    priceYen: Number(m.priceYen.trim()), taxRateId: m.taxRateId, publish: m.publish as '公開' | '非公開', warehouseIds: [...m.warehouseIds],
  };
}

/** チェックに要る外の情報をいまの共通データから集める（selfId＝編集中の資材。重複の対象から外す） */
export const materialCtx = (r: DocRepo, selfId?: string): MaterialCheckCtx => ({
  otherNames: materialsOf(r).filter((x) => x.id !== selfId).map((x) => x.name), taxIds: r.list<{ id: string }>('dm.master.taxRates').map((t) => t.id), whIds: materialWarehouses(r).map((w) => w.id),
});
/** 保存の前のチェック（サーバー）。完全な入力（登録・編集・CSV）はぜんぶ、一部だけ変える呼び出し（単価・税率・状態だけ）は入っている項目だけ確かめる */
export function checkMaterial(r: DocRepo, m: Partial<Material>, o: { id?: string; full?: boolean } = {}) {
  if (o.full) {
    const input: MaterialInput = {
      name: m.name ?? '', courses: m.courses ?? [], unit: m.unit ?? '', spec: m.spec ?? '', photo: m.photo ?? '', priceYen: m.priceYen === undefined ? '' : String(m.priceYen),
      taxRateId: m.taxRateId ?? '', publish: m.publish ?? '', warehouseIds: m.warehouseIds ?? [],
    };
    const e = materialErrors(input, materialCtx(r, o.id));
    const first = Object.values(e)[0];
    if (first) throw new ApiError(first, e.name?.includes('既に') ? 409 : 400);
    return;
  }
  if (m.priceYen !== undefined && !(Number.isInteger(m.priceYen) && m.priceYen >= 0 && m.priceYen <= MATERIAL_PRICE_MAX)) throw new ApiError('資材の単価（税抜）は 0以上の整数の円で入れてください', 400);
  if (m.taxRateId !== undefined && !r.get('dm.master.taxRates', m.taxRateId)) throw new ApiError(`税率が見つかりません（${m.taxRateId}）`, 400);
  if (m.publish !== undefined && !['公開', '非公開'].includes(m.publish)) throw new ApiError('公開ステータスは 公開／非公開 のどちらかです', 400);
  if (m.status !== undefined && !['有効', '削除済'].includes(m.status)) throw new ApiError('状態は 有効／削除済 のどちらかです', 400);
}
/** 削除（status を 削除済 にする）の前のチェック：削除済は変えられない（E36）・使用中は削除できない（E259） */
export function checkMaterialDelete(r: DocRepo, id: string) {
  const cur = r.get<Material>('dm.master.materials', id);
  if (cur && matOf(cur).status === '削除済') throw new ApiError('削除済みのため編集できません。', 400);
  const u = materialUse(r, id);
  if (materialInUse(u)) throw new ApiError(materialBlockedText(u), 409);
}
