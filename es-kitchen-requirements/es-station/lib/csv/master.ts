import { ApiError } from '@/lib/api/errors';
import { listSuppliers, nextSupplierId, putSupplierRow, supplierRow } from '@/lib/ops/general/suppliers';
import master from '@/lib/domain/areas/master';
import { parseAreaFees } from '@/lib/domain/carrierFee';
import type { CsvEntity, Ctx, EntityCol } from '@/lib/domain/csv';
import { rowResult } from '@/lib/domain/csv';
import type { Account, Carrier, CarrierEsFee, Course, Driver, MonthlyMenu, NutKey, Nutrition, Product, ProductCategory, ProductHistory, ProductSupplier, ProductTag, TaxRate, Warehouse } from '@/lib/domain/types';
import { jansOf, NUT_KEYS, NUT_MAX, nutRange, nutTo, SERVING_MAX } from '@/lib/domain/product';
import { addPartnerHistory } from '@/lib/domain/partnerHistory';
import {
  checkMaterial, MATERIAL_COURSES, MATERIAL_DEFAULT_WH, MATERIAL_NAME_MAX, MATERIAL_SPEC_MAX, MATERIAL_UNIT_MAX, materialsOf, materialWarehouses, nextMaterialId, type MaterialFull,
} from '@/lib/domain/material';
import { TAX_STD } from '@/lib/domain/tax';
import { expandAreas, NG_DAYS, PREFS } from '@/lib/domain/prefs';
import { CARS, formDiff, PAY_TERMS } from '@/lib/ops/general/masterForms';
import { consignForm, ensureEsFees, ES_FEES, esFeesOf, putCarrierAll } from '@/lib/ops/general/masterRecs';
import { carrierAll, licenseOf, relayKindOf, staffKindOf, warehouseContacts, type CarrierAll } from '@/lib/ops/general/partnerParts';
import type { DocRepo } from '@/lib/ops/core/area';
import masters from '@/lib/ops/areas/masters';
import opsMenu from '@/lib/ops/areas/menu';
import { opsRowOf, whKind } from '@/lib/ops/general/fromDomain';
import { nextProductId, saveProduct, type ProductInput } from '@/lib/ops/general/product';
import type { GenRow } from '@/lib/ops/general/types';
import { recsOf } from '@/lib/ops/masters/fromDomain';
import { fieldEditable, indexOf, newValues, tablesOf, valueOfName, valueParts, valuesOf, type Tables, type Values } from '@/lib/ops/masters/logic';
import { analyze, COLS as PLAN_COLS, exportPlans, PLAN_CSV_SAMPLE } from '@/lib/ops/masters/planCsv';
import type { MasterKind, MasterRec } from '@/lib/ops/masters/types';
import { today } from '@/lib/supplier/dates';
import { parseCsv as parseCsvRows } from './core';

/*
 * 運営Web のマスタの CSV の列（出力とテンプレートで同じ）と、取込の保存（画面の保存と同じ関数）。
 *   商品（general.saveProduct・公開したメニューにある商品の価格の変更は行のエラー）・商品カテゴリ（menu.saveCat）・商品タグ（master.addProductTag。税率の CSV は作らない：受付簿 #234）・
 *   プラン（決定 28-183 の独自の形：プラン／コース／価格【削除】／設備の行）・機種・オプション・値引き（masters.save／create：画面の項目そのもの）・
 *   倉庫・委託配送先・資材（master.create／update）・ドライバー（master.addDriver／updateDriver）・仕入先（運営の一覧の行）
 */

const OPS_BY = 'CSV取込';
const s = (v: unknown) => (v == null ? '' : String(v));
const strOf = (v: unknown) => (v === undefined ? '' : String(v));
const arr = (v: unknown) => (Array.isArray(v) ? (v as string[]) : v === undefined ? [] : [String(v)]);
const bad = (m: string): never => { throw new ApiError(m, 400); };
const nextNo = (ids: string[], head: string, w: number) =>
  `${head}${String(Math.max(0, ...ids.filter((x) => x.startsWith(head)).map((x) => Number(x.slice(head.length)) || 0)) + 1).padStart(w, '0')}`;

/* ===================================================================== */
/* 商品マスタ                                                             */
/* ===================================================================== */

type P = Product;
type PD = ProductInput;
const taxLabel = (x: Ctx, id: string) => x.r.get<TaxRate>('dm.master.taxRates', id)?.label ?? id;
const whName = (x: Ctx, id: string) => x.r.get<Warehouse>('dm.master.warehouses', id)?.name ?? id;
const histOf = (x: Ctx, id: string) => x.r.list<ProductHistory>('dm.master.productHistory').filter((h) => h.productId === id).sort((a, b) => a.at.localeCompare(b.at));
/** 1食当たり内容量・その他（100g当たりの列。範囲ではない1つの値） */
const nut = (f: 'servingG' | 'other', label: string): EntityCol<P, PD> => ({
  label: `栄養成分（100g当たり）_${label}`, type: f === 'other' ? 'text' : 'num', min: f === 'servingG' ? 1 : 0, ...(f === 'servingG' ? { maxNum: SERVING_MAX } : {}), clear: f === 'other', reqNew: f !== 'other',
  get: (p) => p.nutrition?.per100g?.[f], put: (d, v) => { d.nutrition = { ...d.nutrition, per100g: { ...d.nutrition.per100g, [f]: f === 'other' ? strOf(v) : Number(v ?? 0) } }; },
});
/**
 * 栄養成分（100g当たり）の5項目は範囲（台帳 F 2026-10-08）：列 _from・_to。
 * from を入れると、to が空・from より小さい・前の from と同じなら to も同じ値にする（画面と同じ：to の初期値＝from）。_to の列があればその値
 */
const nutFrom = (f: NutKey, label: string): EntityCol<P, PD> => ({
  label: `栄養成分（100g当たり）_${label}_from`, alias: [`栄養成分（100g当たり）_${label}`], type: 'num', min: 0, maxNum: NUT_MAX, reqNew: true,
  get: (p) => p.nutrition?.per100g?.[f],
  put: (d, v) => {
    const n = d.nutrition.per100g, to = nutTo(n), x = Number(v ?? 0);
    const keepTo = to[f] !== n[f] && to[f] >= x;
    d.nutrition = { ...d.nutrition, per100g: { ...n, [f]: x, to: { ...to, [f]: keepTo ? to[f] : x } } };
  },
});
const nutToCol = (f: NutKey, label: string): EntityCol<P, PD> => ({
  label: `栄養成分（100g当たり）_${label}_to`, type: 'num', min: 0, maxNum: NUT_MAX, hint: '空欄＝from と同じ',
  get: (p) => (p.nutrition?.per100g ? nutTo(p.nutrition.per100g)[f] : undefined),
  put: (d, v) => { const n = d.nutrition.per100g; d.nutrition = { ...d.nutrition, per100g: { ...n, to: { ...nutTo(n), [f]: Number(v ?? 0) } } }; },
});
const NUT_COLS: [NutKey, string][] = [['kcal', 'エネルギー(kcal)'], ['protein', 'たんぱく質(g)'], ['fat', '脂質(g)'], ['carbs', '炭水化物(g)'], ['salt', '食塩相当量(g)']];
const blankNut = (): Nutrition => ({ servingG: 0, kcal: 0, protein: 0, fat: 0, carbs: 0, salt: 0, other: '', to: { kcal: 0, protein: 0, fat: 0, carbs: 0, salt: 0 } });
/** 1食当たりの列（出力だけ。取込では読まない）。5項目は 1つのセルに「from〜to」（同じなら1つの数） */
const nutRo = (f: keyof Nutrition, label: string): EntityCol<P, PD>[] => [{
  label: `栄養成分（1食当たり）_${label}`, ro: true,
  get: (p) => { const n = p.nutrition?.perServing; if (!n) return ''; return (NUT_KEYS as string[]).includes(f) ? nutRange(n, f as NutKey) : n[f as 'servingG' | 'other']; },
}];

export const products: CsvEntity<P, PD> = {
  id: 'products', screen: '商品マスタ', key: '品番', create: true,
  list: (x) => x.r.list<P>('dm.master.products'),
  keyOf: (p) => p.id, nameOf: (p) => p.name,
  find: (x, k) => x.r.get<P>('dm.master.products', k),
  locked: (p) => (p.status === '削除済' ? '削除済の商品は変えられません' : null),
  children: (p) => p.suppliers ?? [],
  /* JAN の重複は削除済の商品を除いて見る（受付簿 #273） */
  uniqSkip: (p) => p.status === '削除済',
  impact: ['公開中・締切済・配送中のメニューにある商品の販売価格・税率は CSV では変えられません（商品の編集画面で「価格改定／誤りの訂正」を選んでください）', 'ピッキング倉庫・コースの変更で注文している拠点に出せなくなる商品はエラーになります（商品の編集画面で確認してください）'],
  cols: [
    { label: '品番', hint: '空欄＝新規（採番）', get: (p) => p.id },
    { label: '商品名', reqNew: true, max: 60, hint: '公開名（日本語）：法人Web・アプリ・請求書に出す名前', get: (p) => p.name, put: (d, v) => { d.name = strOf(v); } },
    { label: '商品名カナ', clear: true, max: 60, hint: '任意（全角カタカナ）', get: (p) => p.kana, put: (d, v) => { d.kana = strOf(v); } },
    /* 商品名の4種類（2026/10/03 決定）・英語の商品名（RD-MN-073：CSV 出力に含める） */
    { label: '商品名（英語）', reqNew: true, max: 60, hint: '半角の英語。必須', get: (p) => p.nameEn ?? '', put: (d, v) => { d.nameEn = strOf(v); } },
    { label: '管理名（社内）', clear: true, max: 60, hint: '空欄＝商品名（公開名）', get: (p) => p.mgmtName ?? '', put: (d, v) => { d.mgmtName = strOf(v); } },
    { label: '仕入先向けの名前', clear: true, max: 60, hint: '空欄＝商品名（公開名）', get: (p) => p.supplierItemName ?? '', put: (d, v) => { d.supplierItemName = strOf(v); } },
    /* JAN は複数（1つのセルに「;」でつなぐ・先頭が主 JAN・10件まで）。ほかの商品との重複（E09）は保存（master）で確かめる（台帳 F 2026-10-08） */
    { label: 'JANコード', type: 'list', clear: true, hint: '複数は「;」でつなぐ（先頭が主）', get: (p) => jansOf(p), put: (d, v) => { d.jans = arr(v); d.jan = d.jans[0] ?? ''; } },
    /* 商品はカテゴリを ID で持つ（受付簿 #233）：CSV にはカテゴリの名前を書き、取り込むとき ID に引き当てる */
    { label: 'カテゴリ', reqNew: true, optsOf: (x) => x.r.list<ProductCategory>('dm.master.productCategories').map((c) => c.name),
      get: (p, x) => x.r.get<ProductCategory>('dm.master.productCategories', p.categoryId ?? '')?.name ?? p.category,
      put: (d, v, x) => { const c = x.r.list<ProductCategory>('dm.master.productCategories').find((y) => y.name === v); d.categoryId = c?.id ?? ''; d.category = c?.name ?? ''; } },
    { label: '販売価格（税込）', type: 'money', reqNew: true, get: (p) => p.priceYen, put: (d, v) => { d.priceYen = Number(v ?? 0); } },
    { label: '税率', reqNew: true, optsOf: (x) => x.r.list<TaxRate>('dm.master.taxRates').map((t) => t.label), get: (p, x) => taxLabel(x, p.taxRateId),
      put: (d, v, x) => { d.taxRateId = x.r.list<TaxRate>('dm.master.taxRates').find((t) => t.label === v)?.id ?? ''; } },
    /* 商品タグ・営業サンプルの列は持たない（メニューで指定する。台帳 F 2026-10-08） */
    { label: 'コース', type: 'list', reqNew: true, opts: ['ライト', 'スタンダード'], get: (p) => p.courses, put: (d, v) => { d.courses = arr(v) as PD['courses']; } },
    { label: '保管方法（管理用）', opts: ['冷蔵', '冷凍', '常温'], get: (p) => p.storage?.admin, put: (d, v) => { d.storage = { ...d.storage, admin: v as PD['storage']['admin'] }; } },
    { label: '保管方法（表示用）', opts: ['冷蔵', '冷凍', '常温'], get: (p) => p.storage?.display, put: (d, v) => { d.storage = { ...d.storage, display: v as PD['storage']['display'] }; } },
    { label: 'ピッキング倉庫ID', type: 'list', reqNew: true, optsOf: (x) => x.r.list<Warehouse>('dm.master.warehouses').filter((w) => w.type === 'picking').map((w) => w.id),
      get: (p) => p.pickWarehouseIds, put: (d, v) => { d.pickWarehouseIds = arr(v); } },
    { label: 'ピッキング倉庫名', ro: true, get: (p, x) => p.pickWarehouseIds.map((id) => whName(x, id)) },
    { label: '商品解説', reqNew: true, get: (p) => p.description, put: (d, v) => { d.description = strOf(v); } },
    { label: '原材料名', clear: true, get: (p) => p.ingredients, put: (d, v) => { d.ingredients = strOf(v); } },
    { label: '添加物', clear: true, get: (p) => p.additives, put: (d, v) => { d.additives = strOf(v); } },
    { label: 'アレルゲン（特定原材料）', type: 'list', reqNew: true, hint: 'ない場合は「なし」', get: (p) => p.allergens?.specific, put: (d, v) => { d.allergens = { ...d.allergens, specific: arr(v) }; } },
    { label: 'アレルゲン（特定原材料に準ずるもの）', type: 'list', clear: true, get: (p) => p.allergens?.equivalent, put: (d, v) => { d.allergens = { ...d.allergens, equivalent: arr(v) }; } },
    { label: '製造元のホームページ', clear: true, get: (p) => p.makerUrl, put: (d, v) => { d.makerUrl = strOf(v); } },
    { label: '商品備考', clear: true, get: (p) => p.note, put: (d, v) => { d.note = strOf(v); } },
    { label: 'ESの期限', type: 'int', min: 1, reqNew: true, get: (p) => p.shelfLife?.esValue, put: (d, v) => { d.shelfLife = { ...d.shelfLife, esValue: Number(v ?? NaN) }; } },
    { label: 'ESの期限の単位', opts: ['日', 'ヶ月'], get: (p) => p.shelfLife?.esUnit, put: (d, v) => { d.shelfLife = { ...d.shelfLife, esUnit: v as '日' | 'ヶ月' }; } },
    { label: 'メーカーの期限', clear: true, get: (p) => p.shelfLife?.maker, put: (d, v) => { d.shelfLife = { ...d.shelfLife, maker: strOf(v) }; } },
    { label: '短消費期限の区分', opts: ['対象外', 'ショート', 'セミショート'], get: (p) => p.shelfLife?.shortClass, put: (d, v) => { d.shelfLife = { ...d.shelfLife, shortClass: v as PD['shelfLife']['shortClass'] }; } },
    { label: 'メインコラム', alias: ['自販機コラム'], type: 'list', clear: true, get: (p) => p.vending?.columns, put: (d, v) => { d.vending = { ...d.vending, columns: arr(v) }; } },
    /* サブコラム（メインと重ならない。意味は設計書の open のため保存・表示だけ。台帳 F 2026-10-08） */
    { label: 'サブコラム', type: 'list', clear: true, get: (p) => p.vending?.subColumns ?? [], put: (d, v) => { d.vending = { ...d.vending, subColumns: arr(v) }; } },
    { label: '対応機種ID', type: 'list', clear: true, get: (p) => p.vending?.models, put: (d, v) => { d.vending = { ...d.vending, models: arr(v) }; } },
    { label: '自販機の備考', clear: true, get: (p) => p.vending?.note, put: (d, v) => { d.vending = { ...d.vending, note: strOf(v) }; } },
    { label: '同梱資材ID', type: 'list', clear: true, get: (p) => p.bundledMaterialIds, put: (d, v) => { d.bundledMaterialIds = arr(v); } },
    { label: '出荷時の特殊指示', type: 'list', clear: true, get: (p) => p.shipInstructions, put: (d, v) => { d.shipInstructions = arr(v); } },
    nut('servingG', '内容量(g)'), ...NUT_COLS.flatMap(([f, l]) => [nutFrom(f, l), nutToCol(f, l)]), nut('other', 'その他'),
    /* 1食当たりは 100g当たり × 内容量 の自動計算（RD-MN-118）。出力だけ */
    ...nutRo('servingG', '内容量(g)'), ...nutRo('kcal', 'エネルギー(kcal)'), ...nutRo('protein', 'たんぱく質(g)'), ...nutRo('fat', '脂質(g)'),
    ...nutRo('carbs', '炭水化物(g)'), ...nutRo('salt', '食塩相当量(g)'), ...nutRo('other', 'その他'),
    { label: '商品写真', ro: true, get: (p) => p.images?.map((i) => (i.main ? `${i.file}(メイン)` : i.file)) },
    { label: '温度帯（便）', ro: true, get: (p) => p.temp },
    /* 状態：有効／無効（削除済は CSV では変えない。無効＝一覧・メニューの商品選択に既定で出さない） */
    { label: '状態', opts: ['有効', '無効'], get: (p) => p.status, put: (d, v) => { d.status = v as '有効' | '無効'; } },
    { label: '登録日時', ro: true, get: (p, x) => histOf(x, p.id)[0]?.at ?? '' },
    { label: '更新日時', ro: true, get: (p, x) => histOf(x, p.id).slice(-1)[0]?.at ?? '' },
    { label: '更新者', ro: true, get: (p, x) => { const h = histOf(x, p.id).slice(-1)[0]; return h ? x.r.get<Account>('dm.account.accounts', h.by)?.name ?? h.by : ''; } },
    /* 子の表：仕入先（1行＝1社。複数可・1社以上必須はサーバーで確かめる：受付簿 #286。旧：1商品＝1仕入先 #231） */
    { label: '仕入先ID', child: true, optsOf: (x) => x.r.list<Account>('dm.account.accounts').filter((a) => a.site === 'supplier').map((a) => a.id), cget: (it: ProductSupplier) => it.supplierId },
    { label: '仕入先名', child: true, ro: true, cget: (it: ProductSupplier, _p, x) => x.r.get<Account>('dm.account.accounts', it.supplierId)?.name ?? '' },
    { label: '仕入単価（税抜）', child: true, type: 'money', cget: (it: ProductSupplier) => it.unitCostYen },
    /* 仕入単価の改定（RD-MN-076）：新しい単価と適用開始日（YYYY/MM/DD）。両方空＝改定なし */
    { label: '改定後の仕入単価（税抜）', child: true, type: 'money', clear: true, cget: (it: ProductSupplier) => it.nextCost?.unitCostYen ?? '' },
    { label: '仕入単価の適用開始日', child: true, type: 'date', clear: true, cget: (it: ProductSupplier) => it.nextCost?.from ?? '' },
    { label: '入り数（ロット）', child: true, type: 'int', min: 1, cget: (it: ProductSupplier) => it.lot },
    { label: '選択中の仕入先(1=選択)', child: true, type: 'bool', cget: (it: ProductSupplier) => it.selected },
    { label: '仕入先の備考', child: true, cget: (it: ProductSupplier) => it.note },
  ],
  draftOf: (p) => { const { id: _i, status: _s, temp: _t, vmFrame: _v, supplierId: _p, ...d } = p; return structuredClone(d); },
  newDraft: () => ({
    name: '', kana: '', mgmtName: '', nameEn: '', supplierItemName: '', jan: '', jans: [], category: '', categoryId: '', priceYen: 0, taxRateId: '', note: '', images: [], description: '',
    nutrition: { per100g: blankNut(), perServing: blankNut() }, allergens: { specific: [], equivalent: [] }, ingredients: '', additives: '', makerUrl: '',
    courses: [], storage: { admin: '冷蔵', display: '冷蔵' }, vending: { columns: [], subColumns: [], models: [], note: '' }, bundledMaterialIds: [], shipInstructions: [],
    shelfLife: { esValue: NaN, esUnit: '日', maker: '', shortClass: '対象外' }, suppliers: [], pickWarehouseIds: [],
  }),
  /* 仕入先の行：書いた仕入先は直す・足す（書いていない仕入先はそのまま）。選択中を1にした行があれば、その会社を選択中にする */
  childPut: (d, items) => {
    const sups = [...d.suppliers];
    for (const it of items) {
      const id = it.get('仕入先ID');
      if (id?.k !== 'set') bad('仕入先の列を書いた行には「仕入先ID」を入れてください');
      const sid = String((id as { v: unknown }).v);
      const i = sups.findIndex((x) => x.supplierId === sid);
      const cur: ProductSupplier = i >= 0 ? { ...sups[i] } : { supplierId: sid, unitCostYen: 0, lot: 1, note: '', selected: false };
      const v = (l: string) => it.get(l);
      const cost = v('仕入単価（税抜）'), lot = v('入り数（ロット）'), sel = v('選択中の仕入先(1=選択)'), note = v('仕入先の備考');
      const nc = v('改定後の仕入単価（税抜）'), nf = v('仕入単価の適用開始日');
      if (cost?.k === 'set') cur.unitCostYen = Number(cost.v);
      if (nc?.k === 'clear' || nf?.k === 'clear') delete cur.nextCost;
      else if (nc?.k === 'set' || nf?.k === 'set') {
        const from = nf?.k === 'set' ? String(nf.v) : cur.nextCost?.from ?? '';
        if (!/^\d{4}\/\d{2}\/\d{2}$/.test(from)) bad('仕入単価の適用開始日は YYYY/MM/DD で入れてください');
        cur.nextCost = { unitCostYen: nc?.k === 'set' ? Number(nc.v) : cur.nextCost?.unitCostYen ?? cur.unitCostYen, from };
      }
      if (lot?.k === 'set') cur.lot = Number(lot.v);
      if (note?.k === 'set') cur.note = String(note.v); else if (note?.k === 'clear') cur.note = '';
      if (sel?.k === 'set') cur.selected = sel.v === true;
      if (i >= 0) sups[i] = cur; else sups.push(cur);
      if (cur.selected) sups.forEach((x, j) => { if (x.supplierId !== sid) sups[j] = { ...x, selected: false }; });
    }
    if (sups.length && !sups.some((x) => x.selected)) sups[0] = { ...sups[0], selected: true };
    d.suppliers = sups;
  },
  save: (x, d, cur) => saveProduct(x.r, { id: cur?.id, data: d, by: OPS_BY }).id,
  warn: (b, a) => (a && !a.images?.length ? ['商品写真がありません（商品の編集画面で追加してください）'] : []),
  sample: (x): Record<string, string>[] => [
    { 品番: 'M001', 商品名: '', 商品備考: '冷蔵で届きます' },
    {
      品番: '', 商品名: '（例）鶏の照り焼き', 商品名カナ: 'トリノテリヤキ', '商品名（英語）': 'Chicken Teriyaki', カテゴリ: x.r.list<ProductCategory>('dm.master.productCategories')[0]?.name ?? '', '販売価格（税込）': '450',
      税率: x.r.list<TaxRate>('dm.master.taxRates')[0]?.label ?? '', コース: 'ライト;スタンダード', '保管方法（管理用）': '冷蔵', '保管方法（表示用）': '冷蔵', ピッキング倉庫ID: 'WH00001',
      商品解説: '（例）甘辛いたれの照り焼き', ESの期限: '5', ESの期限の単位: '日', 仕入先ID: 'SP00001', '仕入単価（税抜）': '250', '入り数（ロット）': '6', '選択中の仕入先(1=選択)': '1',
    },
  ],
};
/* 新規の品番は保存のとき（nextProductId）。テンプレートの説明のために使う */
export const _nextProductId = (r: DocRepo) => nextProductId(r);

/* ===================================================================== */
/* 商品カテゴリ・商品タグ                                                */
/* ===================================================================== */

type CatD = { id: string; name: string; order: number | string; note: string; img: string };
export const categories: CsvEntity<ProductCategory, CatD> = {
  id: 'categories', screen: '商品カテゴリ管理', key: '商品カテゴリID', create: true,
  list: (x) => x.r.list<ProductCategory>('dm.master.productCategories').slice().sort((a, b) => a.order - b.order),
  keyOf: (c) => c.id, nameOf: (c) => c.name,
  find: (x, k) => x.r.get<ProductCategory>('dm.master.productCategories', k),
  cols: [
    { label: '商品カテゴリID', hint: '空欄＝新規（採番）', get: (c) => c.id },
    { label: '商品カテゴリ名', reqNew: true, max: 60, get: (c) => c.name, put: (d, v) => { d.name = strOf(v); } },
    { label: '表示順', type: 'int', min: 1, get: (c) => c.order, put: (d, v) => { d.order = Number(v); } },
    { label: '備考', clear: true, get: (c) => c.note, put: (d, v) => { d.note = strOf(v); } },
    { label: 'カテゴリ画像', reqNew: true, hint: '画面で登録した画像の名前（photo:… ）', get: (c) => (c.img.startsWith('data:') ? '（アップロードした画像）' : c.img), put: (d, v) => { if (strOf(v) !== '（アップロードした画像）') d.img = strOf(v); } },
    { label: '登録商品数', ro: true, type: 'int', get: (c, x) => x.r.list<Product>('dm.master.products').filter((p) => p.status !== '削除済' && (p.categoryId ? p.categoryId === c.id : p.category === c.name)).length },
  ],
  draftOf: (c) => ({ ...c }),
  newDraft: (x) => ({ id: '', name: '', order: x.r.list('dm.master.productCategories').length + 1, note: '', img: '' }),
  save: (x, d) => {
    opsMenu.actions.saveCat(x.r, { d });
    return d.id || x.r.list<ProductCategory>('dm.master.productCategories').find((c) => c.name === d.name.trim())?.id;
  },
};

export const tags: CsvEntity<ProductTag, { name: string }> = {
  id: 'tags', screen: '商品タグ', key: 'タグID', create: true,
  list: (x) => x.r.list<ProductTag>('dm.master.productTags'),
  keyOf: (t) => t.id, nameOf: (t) => t.name,
  cols: [
    { label: 'タグID', hint: '空欄＝新規（採番）', get: (t) => t.id },
    { label: 'タグ名', reqNew: true, max: 30, get: (t) => t.name, put: (d, v) => { d.name = strOf(v); } },
    /* 商品タグは商品マスタに持たない（メニューの商品ごと。台帳 F 2026-10-08） */
    { label: '使っている月間メニューの数', ro: true, type: 'int', get: (t, x) => x.r.list<MonthlyMenu>('dm.order.menus').filter((m) => (m.items ?? []).some((i) => typeof i !== 'string' && i.tags?.includes(t.name))).length },
  ],
  draftOf: (t) => ({ name: t.name }),
  newDraft: () => ({ name: '' }),
  save: (x, d, cur) => {
    if (cur) { if (cur.name !== d.name) bad('タグの名前は変えられません（月間メニューが名前で持っているため。新しいタグを足してください）'); return cur.id; }
    return master.actions.addProductTag(x.r, { name: d.name }).id;
  },
};

/* ===================================================================== */
/* 機種・オプション・値引き（画面の項目そのもの。保存は masters.save／create） */
/* ===================================================================== */

type MD = { values: Values; tables: Tables };
const month = () => today().slice(0, 7).replace('/', '-');
const valCache = new WeakMap<MasterRec, Values>();
const vals = (kind: MasterKind, rec: MasterRec) => { let v = valCache.get(rec); if (!v) { v = valuesOf(kind, rec); valCache.set(rec, v); } return v; };

/** 画面の項目（名前のある項目。同じ名前は1つ） */
function formCols(kind: MasterKind, idName: string): EntityCol<MasterRec, MD>[] {
  const seen = new Set<string>();
  const out: EntityCol<MasterRec, MD>[] = [{ label: idName, hint: '空欄＝新規（採番）', get: (r) => r.id }];
  seen.add(idName);
  for (const { f } of indexOf(kind).fields) {
    const name = f.name;
    if (!name || seen.has(name)) continue;
    seen.add(name);
    const p = valueParts(f.ctl)[f.mi ?? 0];
    if (!p || p.t === 'photos' || p.t === 'vmbox') continue;
    const type = p.t === 'ck' ? 'bool' as const : p.t === 'in' && p.num ? 'money' as const : 'text' as const;
    const opts = p.t === 'sel' ? p.o : undefined;
    out.push({
      label: name, type, opts, ro: !fieldEditable(f), clear: type === 'text' && !opts,
      /* 画面で必須（*）の項目は、新規の行で必須（2026/10/05：CSV取込の画面の列の定義と同じ） */
      reqNew: f.req === 'req' && fieldEditable(f),
      get: (r) => { const v = vals(kind, r)[f.k]?.[f.mi ?? 0]; return typeof v === 'boolean' ? v : valueOfName(kind, vals(kind, r), name); },
      put: (d, v) => {
        /* 同じ名前の欄（タブ・区分パネル）は全部に入れる */
        for (const at of indexOf(kind).fields.filter((a) => a.f.name === name)) {
          const i = at.f.mi ?? 0, part = valueParts(at.f.ctl)[i];
          const cur = [...(d.values[at.f.k] ?? at.f.v)];
          cur[i] = part?.t === 'ck' ? v === true : v === undefined ? '' : String(v);
          d.values[at.f.k] = cur;
        }
      },
    });
  }
  out.push({ label: '使用中の件数', ro: true, type: 'int', get: (r) => r.use }, { label: '削除済(1=削除済)', ro: true, type: 'bool', get: (r) => !!r.deleted });
  return out;
}
const colCache: Partial<Record<MasterKind, EntityCol<MasterRec, MD>[]>> = {};
function formEntity(kind: MasterKind, id: string, screen: string, idName: string): CsvEntity<MasterRec, MD> {
  return {
    id, screen, key: idName, create: true,
    list: (x) => recsOf(x.r, kind, month()),
    keyOf: (r) => r.id, nameOf: (r) => r.name,
    locked: (r) => (r.deleted ? '削除済みのため変えられません' : null),
    /* 列は使うときに作る（画面の定義を読むので、読み込みのときには作らない） */
    get cols() { return (colCache[kind] ??= formCols(kind, idName)); },
    draftOf: (r) => ({ values: structuredClone(valuesOf(kind, r)), tables: structuredClone(tablesOf(kind, r)) }),
    newDraft: () => newValues(kind),
    save: (x, d, cur) => (cur
      ? masters.actions.save(x.r, { kind, id: cur.id, values: d.values, tables: d.tables }).id
      : masters.actions.create(x.r, { kind, values: d.values, tables: d.tables }).id),
  };
}
export const devices = formEntity('devices', 'devices', '機種マスタ', '機種ID');
export const options = formEntity('options', 'options', 'オプションマスタ', 'オプションID');
export const discounts = formEntity('discounts', 'discounts', '値引きマスタ', '値引きID');

/* ===================================================================== */
/* プランマスタ（決定 28-183 の形：プラン／コース／価格【削除】／設備の行。lib/ops/masters/planCsv.ts） */
/* ===================================================================== */

export const plans: CsvEntity = {
  id: 'plans', screen: 'プランマスタ', key: 'プランID／仮キー', cols: [], list: () => [], keyOf: () => '',
  impact: ['価格の行の「削除」＝1 は、どの子契約にも使われていない世代だけ消せます（決定 28-183）', '設備の行があるプラン×コースは構成を全部入れ替えます。貸出中の設備は変わりません'],
  custom: {
    head: () => PLAN_COLS,
    template: () => parseCsvRows(PLAN_CSV_SAMPLE).slice(1).map((l) => l.cells),
    exportRows: (x) => parseCsvRows(masters.queries.planCsvExport(x.r)).slice(1).map((l) => l.cells),
    run: (x, text) => {
      const res = masters.queries.planCsvPreview(x.r, { text }) as ReturnType<typeof analyze>;
      if (res.fatal) return { fileErrors: [res.fatal], rows: [] };
      const rows = res.plans.map((p) => {
        const line = p.errors[0]?.line ?? Number(p.items[0]?.line) ?? 0;
        const changed = p.items.filter((i) => i.act !== '変更なし');
        return rowResult(Number(line) || 0, p.key, p.name, p.errors.length ? 'エラー' : p.isNew ? '新規' : changed.length ? '更新' : '変更なし', {
          errors: p.errors.map((e) => ({ line: e.line, col: '—', msg: e.msg })), warnings: p.warn,
          diff: changed.map((i) => ({ col: `${i.kind}${i.course ? `（${i.course}）` : ''}`, before: i.act, after: i.text })),
        });
      });
      if (!rows.some((r) => r.action === 'エラー') && rows.some((r) => r.action !== '変更なし')) masters.actions.planCsvCommit(x.r, { text });
      return { rows };
    },
  },
};
void exportPlans;

/* ===================================================================== */
/* 倉庫・委託配送先・資材・ドライバー・仕入先                                 */
/* ===================================================================== */

const WH_KIND: Record<Warehouse['type'], string> = { picking: 'ピッキング倉庫', relay: '中継倉庫', return: '返送先' };
/** 倉庫区分の選択肢（ピッキング倉庫（資材）は type＝picking のまま forMaterial で区別。ID の頭は WH） */
const WH_KIND_MAT = 'ピッキング倉庫（資材）';
const WH_KIND_OPTS = ['ピッキング倉庫', WH_KIND_MAT, '中継倉庫', '返送先'];
const addrCols = <R extends { address: Warehouse['address'] }, D extends { address: Warehouse['address'] }>(): EntityCol<R, D>[] => ([
  ['郵便番号', 'zip'], ['都道府県', 'pref'], ['市区町村', 'city'], ['町名・番地', 'addr1'], ['建物等', 'addr2'],
] as const).map(([label, k]) => ({ label, clear: true, get: (w: R) => w.address?.[k], put: (d: D, v: unknown) => { d.address = { ...d.address, [k]: strOf(v) }; } }));

export const warehouses: CsvEntity<Warehouse, Warehouse> = {
  id: 'warehouses', screen: '倉庫マスタ', key: '倉庫ID', create: true,
  list: (x) => x.r.list<Warehouse>('dm.master.warehouses'),
  keyOf: (w) => w.id, nameOf: (w) => w.name,
  locked: (w) => (w.status === '削除済' ? '削除済の倉庫は変えられません' : null),
  cols: [
    { label: '倉庫ID', hint: '空欄＝新規（倉庫区分で採番）', get: (w) => w.id },
    { label: '倉庫名', reqNew: true, max: 50, get: (w) => w.name, put: (d, v) => { d.name = strOf(v); } },
    { label: '倉庫区分', reqNew: true, opts: WH_KIND_OPTS, get: (w, x) => whKind(w, opsRowOf(x.r, 'warehouse', w.id)),
      put: (d, v) => {
        d.type = v === WH_KIND_MAT ? 'picking' : ((Object.entries(WH_KIND).find(([, l]) => l === v)?.[0] ?? 'picking') as Warehouse['type']);
        if (d.type === 'picking') d.forMaterial = v === WH_KIND_MAT; else delete d.forMaterial;
      } },
    ...addrCols<Warehouse, Warehouse>(),
    { label: '電話番号', clear: true, get: (w) => w.tel, put: (d, v) => { const t = strOf(v); if (t && !/^[\d-]+$/.test(t)) bad('電話番号は半角の数字とハイフンで入れてください'); d.tel = t; } },
    { label: 'THOMAS倉庫コード', clear: true, get: (w) => w.thomasCode, put: (d, v) => { d.thomasCode = strOf(v); } },
    { label: '運営している委託配送会社ID（中継）', clear: true, optsOf: (x) => x.r.list<Carrier>('dm.master.carriers').map((c) => c.id), get: (w) => w.carrierId, put: (d, v) => { d.carrierId = strOf(v); } },
    { label: '運営している委託配送会社名', ro: true, get: (w, x) => (w.carrierId ? x.r.get<Carrier>('dm.master.carriers', w.carrierId)?.name ?? '' : '') },
    { label: '営業所コード（中継）', clear: true, get: (w) => w.branchCode, put: (d, v) => { d.branchCode = strOf(v); } },
    /* 倉庫マスタの登録・編集の項目（hong 2026-10-06）。中継倉庫区分：運送会社＝運営している委託配送会社IDが要る */
    { label: '中継倉庫区分', clear: true, opts: ['運送会社', 'それ以外（SC含む）'], get: (w) => relayKindOf(w), put: (d, v) => { if (v === undefined) delete d.relayKind; else d.relayKind = v as Warehouse['relayKind']; } },
    { label: '倉庫名（伝票用）', clear: true, max: 60, get: (w) => w.slipName ?? w.name, put: (d, v) => { d.slipName = strOf(v); } },
    { label: '倉庫名カナ', clear: true, max: 60, get: (w) => w.kana ?? '', put: (d, v) => { d.kana = strOf(v); } },
    { label: 'FAX番号', clear: true, get: (w) => w.fax ?? '', put: (d, v) => { const t = strOf(v); if (t && !/^[\d-]+$/.test(t)) bad('FAX番号は半角の数字とハイフンで入れてください'); d.fax = t; } },
    { label: '備考', clear: true, max: 500, get: (w) => w.note ?? '', put: (d, v) => { d.note = strOf(v); } },
    { label: '状態', opts: ['有効', '無効'], get: (w) => w.status, put: (d, v) => { d.status = v as Warehouse['status']; } },
    { label: '担当者名', ro: true, get: (w, x) => warehouseContacts(x.r, w)[0]?.name ?? '' },
  ],
  draftOf: (w) => structuredClone(w),
  newDraft: () => ({ id: '', type: 'picking', name: '', address: { zip: '', pref: '', city: '', addr1: '', addr2: '' }, tel: '', thomasCode: '', carrierId: '', branchCode: '', status: '有効' }),
  save: (x, d, cur) => {
    if (!d.name.trim()) bad('倉庫名を入れてください');
    if (d.type !== 'relay') { delete d.relayKind; d.carrierId = ''; }
    if (d.type === 'relay' && relayKindOf(d) === '運送会社' && !d.carrierId) bad('中継倉庫（運送会社）は運営している委託配送会社IDを入れてください');
    const { id: _id, ...patch } = d;
    if (cur) { master.actions.update(x.r, { kind: 'warehouses', id: cur.id, patch, by: OPS_BY }); return cur.id; }
    const head = { picking: 'WH', relay: 'HU', return: 'RT' }[d.type];
    const id = nextNo(x.r.list<Warehouse>('dm.master.warehouses').map((w) => w.id), head, 5);
    master.actions.create(x.r, { kind: 'warehouses', data: { ...patch, id }, by: OPS_BY });
    return id;
  },
};

/** 委託配送先の CSV の下書き（共通データ＋プロフィール＋担当者。lib/ops/general/partnerParts.ts の CarrierAll） */
const blankCarrierAll = (): CarrierAll => ({
  c: { id: '', name: '', kind: '委託・引き取り', areas: [], weekdays: '', temps: [], feePerDelivery: 0, trackingUrl: '', status: '有効' },
  kana: '', zip: '', pref: '', city: '', addr1: '', addr2: '', tel: '', fax: '', prefs: [], ngDays: [], areaNote: '', cars: [], frz: '不要', ref: '不要', sp: 'あり', carNote: '',
  payTerms: PAY_TERMS[0], note: '', contacts: [],
});
/** 文字の列（clear＝「-」で空にできる） */
const caText = (label: string, k: 'kana' | 'zip' | 'city' | 'addr1' | 'addr2' | 'areaNote' | 'carNote' | 'note', max?: number): EntityCol<Carrier, CarrierAll> =>
  ({ label, clear: true, max, get: (_c, x) => caOf(x, _c)[k], put: (d, v) => { d[k] = strOf(v); } });
const telCol = (label: string, k: 'tel' | 'fax'): EntityCol<Carrier, CarrierAll> => ({
  label, clear: true, get: (c, x) => caOf(x, c)[k], put: (d, v) => { const t = strOf(v); if (t && !/^[\d-]+$/.test(t)) bad(`${label}は半角の数字とハイフンで入れてください`); d[k] = t; },
});
const caCache = new WeakMap<Carrier, CarrierAll>();
const caOf = (x: Ctx, c: Carrier) => { let a = caCache.get(c); if (!a) { a = carrierAll(x.r, c); caCache.set(c, a); } return a; };

export const carriers: CsvEntity<Carrier, CarrierAll> = {
  id: 'carriers', screen: '委託配送先', key: '委託配送先ID', create: true,
  list: (x) => x.r.list<Carrier>('dm.master.carriers').filter((c) => c.kind !== '自社'),
  keyOf: (c) => c.id, nameOf: (c) => c.name,
  cols: [
    { label: '委託配送先ID', hint: '空欄＝新規（採番）', get: (c) => c.id },
    { label: '委託配送先名', reqNew: true, max: 60, get: (c) => c.name, put: (d, v) => { d.c.name = strOf(v); } },
    caText('カナ', 'kana', 60),
    { label: '区分', reqNew: true, opts: ['委託・引き取り', '路線（中継あり）'], valueAlias: { '路線': '路線（中継あり）' },
      get: (c) => (c.kind === '路線' ? '路線（中継あり）' : c.kind), put: (d, v) => { d.c.kind = (v === '路線（中継あり）' || v === '路線' ? '路線' : v) as Carrier['kind']; } },
    caText('郵便番号', 'zip'),
    { label: '都道府県', clear: true, opts: PREFS, get: (c, x) => caOf(x, c).pref, put: (d, v) => { d.pref = strOf(v); } },
    caText('市区町村', 'city', 60), caText('町域・番地', 'addr1', 100), caText('建物・部屋番号', 'addr2', 100),
    telCol('電話番号', 'tel'), telCol('FAX番号', 'fax'),
    /* 対応エリアは都道府県（hong 2026-10-06）。以前の地方の名前（関東・全国・西日本 など）も受け付け、都道府県に広げる */
    { label: '対応エリア', type: 'list', hint: '都道府県（関東・全国 などの地方の名前も可）', get: (c, x) => caOf(x, c).prefs,
      put: (d, v) => { const xs = arr(v); const ps = expandAreas(xs); if (xs.length && !ps.length) bad('対応エリアは都道府県か地方の名前で入れてください'); d.prefs = ps; } },
    { label: '配送不可曜日', type: 'list', clear: true, opts: NG_DAYS, get: (c, x) => caOf(x, c).ngDays, put: (d, v) => { d.ngDays = arr(v); } },
    caText('対応エリアに関する備考', 'areaNote', 500),
    { label: '温度帯', type: 'list', opts: ['冷蔵', '冷凍', '常温', '資材'], get: (c) => c.temps, put: (d, v) => { d.c.temps = arr(v) as Carrier['temps']; } },
    { label: '保有車両', type: 'list', clear: true, opts: CARS, get: (c, x) => caOf(x, c).cars, put: (d, v) => { d.cars = arr(v); } },
    { label: '冷凍ボックスのレンタル希望', opts: ['不要', '要'], get: (c, x) => caOf(x, c).frz, put: (d, v) => { d.frz = strOf(v); } },
    { label: '冷蔵ボックスのレンタル希望', opts: ['不要', '要'], get: (c, x) => caOf(x, c).ref, put: (d, v) => { d.ref = strOf(v); } },
    { label: '冷蔵保管スペース', opts: ['あり', 'なし'], get: (c, x) => caOf(x, c).sp, put: (d, v) => { d.sp = strOf(v); } },
    caText('車両・設備情報に関する備考', 'carNote', 500),
    { label: '1件の支払額', type: 'money', get: (c) => c.feePerDelivery, put: (d, v) => { d.c.feePerDelivery = Number(v ?? 0); } },
    { label: 'エリア別の支払額', hint: '関東:2000・中部:2300（空欄＝エリア別なし）', clear: true, get: (c) => (c.areaFees ?? []).map((x) => `${x.area}:${x.feeYen}`).join('・'), put: (d, v) => { d.c.areaFees = parseAreaFees(strOf(v)); } },
    { label: '追跡URLのひな形', clear: true, get: (c) => c.trackingUrl, put: (d, v) => { d.c.trackingUrl = strOf(v); } },
    { label: '支払条件', opts: PAY_TERMS, get: (c, x) => caOf(x, c).payTerms, put: (d, v) => { d.payTerms = strOf(v); } },
    caText('備考', 'note', 500),
    { label: '状態', opts: ['有効', '無効'], get: (c) => c.status, put: (d, v) => { d.c.status = v as Carrier['status']; } },
    { label: '担当者名', ro: true, get: (c, x) => caOf(x, c).contacts[0]?.name ?? '' },
    { label: 'アカウントの状態', ro: true, get: (c, x) => x.r.get<Account>('dm.account.accounts', c.id)?.status ?? '未発行' },
  ],
  draftOf: (c, x) => structuredClone(carrierAll(x.r, c)),
  newDraft: () => blankCarrierAll(),
  impact: ['1件の支払額は、これから納品する区間に使います（納品済みの区間は納品したときの額のまま）', '担当者は CSV では変えられません（委託配送先の編集画面で直してください）'],
  save: (x, d, cur) => {
    if (!d.c.name.trim()) bad('委託配送先名を入れてください');
    const hist = cur ? formDiff('consign', consignForm(carrierAll(x.r, cur)), consignForm(d)) : 'データ登録';
    return putCarrierAll(x.r, cur?.id ?? null, d, OPS_BY, hist);
  },
};

/* 委託配送先の ES配送費（委託配送先詳細の「ES配送費」タブ。取込先の委託配送先は scope.target。CSV取込・CSV出力だけで直す：hong 2026-10-06） */
type EsD = Omit<CarrierEsFee, 'id' | 'carrierId'>;
export const carrierEsFees: CsvEntity<CarrierEsFee, EsD> = {
  id: 'carrierEsFees', screen: 'ES配送費', key: 'ES配送費ID', create: true,
  list: (x) => (x.scope.target ? esFeesOf(x.r, x.scope.target) : []),
  keyOf: (f) => f.id, nameOf: (f) => `${f.pref}${f.gun}${f.town}`,
  find: (x, k) => esFeesOf(x.r, x.scope.target ?? '').find((f) => f.id === k),
  cols: [
    { label: 'ES配送費ID', hint: '空欄＝新規（採番）', get: (f) => f.id },
    { label: '都道府県名', reqNew: true, opts: PREFS, get: (f) => f.pref, put: (d, v) => { d.pref = strOf(v); } },
    { label: '市郡名', clear: true, max: 30, get: (f) => f.gun, put: (d, v) => { d.gun = strOf(v); } },
    { label: '区町村名', reqNew: true, max: 30, get: (f) => f.town, put: (d, v) => { d.town = strOf(v); } },
    { label: '実績有無', opts: ['あり', 'なし'], get: (f) => f.actual, put: (d, v) => { d.actual = v === 'あり' ? 'あり' : 'なし'; } },
    { label: '委託費用', type: 'money', reqNew: true, get: (f) => f.feeYen, put: (d, v) => { d.feeYen = Number(v ?? 0); } },
    { label: '地域加算（配送1回あたり）', type: 'money', get: (f) => f.add1Yen, put: (d, v) => { d.add1Yen = Number(v ?? 0); } },
    { label: '地域加算（配送2回あたり）', type: 'money', get: (f) => f.add2Yen, put: (d, v) => { d.add2Yen = Number(v ?? 0); } },
    { label: '備考欄', clear: true, max: 200, get: (f) => f.note, put: (d, v) => { d.note = strOf(v); } },
    { label: '類似住所の有無', opts: ['あり', 'なし'], get: (f) => f.similar, put: (d, v) => { d.similar = v === 'あり' ? 'あり' : 'なし'; } },
  ],
  draftOf: (f) => { const { id: _i, carrierId: _c, ...d } = f; return { ...d }; },
  newDraft: () => ({ pref: '', gun: '', town: '', actual: 'なし', feeYen: 0, add1Yen: 0, add2Yen: 0, note: '', similar: 'なし' }),
  save: (x, d, cur) => {
    const cid = x.scope.target ?? '';
    if (!x.r.get<Carrier>('dm.master.carriers', cid)) bad('取込先の委託配送先が見つかりません（委託配送先の詳細の「ES配送費」から取り込んでください）');
    ensureEsFees(x.r);
    const id = cur?.id ?? nextNo(esFeesOf(x.r, cid).map((f) => f.id.replace(`EF-${cid}-`, 'N')), 'N', 3).replace(/^N/, `EF-${cid}-`);
    x.r.put<CarrierEsFee>(ES_FEES, id, { ...d, id, carrierId: cid });
    addPartnerHistory(x.r, 'carriers', cid, `ES配送費を${cur ? '更新' : '追加'}（${d.pref}${d.gun}${d.town}）`, OPS_BY);
    return id;
  },
  sample: () => [{ ES配送費ID: '', 都道府県名: '東京都', 市郡名: '', 区町村名: '品川区', 実績有無: 'なし', 委託費用: '2000', '地域加算（配送1回あたり）': '0', '地域加算（配送2回あたり）': '0', 備考欄: '', 類似住所の有無: 'なし' }],
};

/*
 * 資材マスタ（台帳 F「資材マスタの作り」・受付簿 #358〜#361）：列＝資材ID・資材名・コース・単位・規格・単価（税抜）・税率・公開ステータス・取扱倉庫。
 * 写真は CSV で取り込まない（画面で上げる）。仕入価格・個別コード・納期は持たない。
 * 【要確認・仮】コース・取扱倉庫は複数の値を1つのセルに入れる。区切りは「・」で仮に実装（画面の一覧と同じ）。取扱倉庫は倉庫ID・倉庫名のどちらでも読み、出力は倉庫名
 */
const SEP = '・';
const splitCell = (v: unknown) => strOf(v).split(/[・;；]/).map((t) => t.trim()).filter(Boolean);
const whByText = (x: Ctx, t: string) => materialWarehouses(x.r).find((w) => w.id === t || w.name === t);
export const materials: CsvEntity<MaterialFull, MaterialFull> = {
  id: 'materials', screen: '資材マスタ', key: '資材ID', create: true,
  list: (x) => materialsOf(x.r, true),
  keyOf: (m) => m.id, nameOf: (m) => m.name,
  locked: (m) => (m.status === '削除済' ? '削除済の資材は変えられません' : null),
  impact: ['単価・税率を変えても、受付済みの資材注文の請求額は変わりません（注文時点の値を持ちます）', '写真は CSV では取り込めません（資材の編集画面で登録してください）'],
  cols: [
    { label: '資材ID', hint: '空欄＝新規（採番）', get: (m) => m.id },
    { label: '資材名', reqNew: true, max: MATERIAL_NAME_MAX, get: (m) => m.name, put: (d, v) => { d.name = strOf(v); } },
    /* 複数を1つのセルに入れるので、選べる値の確かめ（opts）は使わず put で確かめる */
    { label: 'コース', reqNew: true, hint: `複数は「${SEP}」でつなぐ`, get: (m) => m.courses.join(SEP),
      put: (d, v) => {
        const xs = splitCell(v), no = xs.filter((c) => !MATERIAL_COURSES.includes(c as Course));
        if (no.length) bad(`選べる値ではありません（${no.join(SEP)}）。選べる値：${MATERIAL_COURSES.join(SEP)}`);
        d.courses = MATERIAL_COURSES.filter((c) => xs.includes(c));
      } },
    { label: '単位', reqNew: true, max: MATERIAL_UNIT_MAX, get: (m) => m.unit, put: (d, v) => { d.unit = strOf(v); } },
    { label: '規格', clear: true, max: MATERIAL_SPEC_MAX, get: (m) => m.spec, put: (d, v) => { d.spec = strOf(v); } },
    { label: '単価（税抜）', type: 'money', reqNew: true, get: (m) => m.priceYen, put: (d, v) => { d.priceYen = Number(v ?? 0); } },
    { label: '税率', optsOf: (x) => x.r.list<TaxRate>('dm.master.taxRates').map((t) => t.label), get: (m, x) => taxLabel(x, m.taxRateId || TAX_STD),
      put: (d, v, x) => { d.taxRateId = x.r.list<TaxRate>('dm.master.taxRates').find((t) => t.label === v)?.id ?? ''; } },
    { label: '公開ステータス', opts: ['公開', '非公開'], get: (m) => m.publish, put: (d, v) => { d.publish = v as MaterialFull['publish']; } },
    { label: '取扱倉庫', hint: `倉庫区分「ピッキング倉庫（資材）」・複数は「${SEP}」でつなぐ`, get: (m, x) => m.warehouseIds.map((id) => x.r.get<Warehouse>('dm.master.warehouses', id)?.name ?? id).join(SEP),
      put: (d, v, x) => {
        const ws = splitCell(v).map((t) => ({ t, w: whByText(x, t) }));
        const no = ws.filter((a) => !a.w).map((a) => a.t);
        if (no.length) bad(`取扱倉庫に選べない倉庫です（${no.join(SEP)}）。倉庫区分「ピッキング倉庫（資材）」の倉庫のIDか名前で入れてください`);
        d.warehouseIds = [...new Set(ws.map((a) => a.w!.id))];
      } },
  ],
  draftOf: (m) => ({ ...m, courses: [...m.courses], warehouseIds: [...m.warehouseIds] }),
  /* 新規で空欄の列は画面の初期値（税率 10%・公開・取扱倉庫 ES事務所）。単価は空＝エラー（入れ忘れで無料にしない） */
  newDraft: () => ({ id: '', name: '', courses: [], unit: '', spec: '', photo: '', taxRateId: TAX_STD, publish: '公開', warehouseIds: [MATERIAL_DEFAULT_WH], status: '有効' }),
  save: (x, d, cur) => {
    const id = cur?.id ?? nextMaterialId(x.r);
    const data = { name: d.name, courses: d.courses, unit: d.unit, spec: d.spec, photo: d.photo, priceYen: d.priceYen, taxRateId: d.taxRateId, publish: d.publish, warehouseIds: d.warehouseIds };
    if (cur) {
      /* 更新も全項目を確かめる（重複・範囲・取扱倉庫） */
      checkMaterial(x.r, data, { id, full: true });
      master.actions.update(x.r, { kind: 'materials', id, patch: data, by: OPS_BY });
    } else master.actions.create(x.r, { kind: 'materials', data: { id, ...data }, by: OPS_BY });
    return id;
  },
};

type DrD = Driver;
/** 配送スタッフの区分（個人／会社所属・hong 2026-10-06）。以前の「自社」「委託」は会社所属として受け付ける */
export const drivers: CsvEntity<Driver, DrD> = {
  id: 'drivers', screen: '配送スタッフ', key: '配送スタッフID', create: true,
  list: (x) => x.r.list<Driver>('dm.master.drivers'),
  keyOf: (d) => d.id, nameOf: (d) => d.name,
  impact: ['免許証の写真は CSV で送れないため、新しいスタッフは「免許未登録」で登録し、アカウントは発行しません（配送スタッフの編集画面で免許証を登録してから発行・台帳 K）'],
  warn: (b) => (!b ? ['免許証の写真がないため「免許未登録」で登録します（アカウントは発行しません）'] : []),
  cols: [
    { label: '配送スタッフID', hint: '空欄＝新規（採番）', get: (d) => d.id },
    { label: '所属先ID', reqNew: true, optsOf: (x) => x.r.list<Carrier>('dm.master.carriers').map((c) => c.id), get: (d) => d.carrierId, put: (d, v) => { d.carrierId = strOf(v); } },
    { label: '所属先名', ro: true, get: (d, x) => { const c = x.r.get<Carrier>('dm.master.carriers', d.carrierId); return c?.kind === '自社' ? 'ES配送便' : c?.name ?? ''; } },
    { label: '氏名', reqNew: true, max: 50, get: (d) => d.name, put: (d, v) => { d.name = strOf(v); } },
    { label: 'フリガナ', reqNew: true, max: 50, get: (d) => d.kana, put: (d, v) => { d.kana = strOf(v); } },
    { label: '電話番号', clear: true, get: (d) => d.tel, put: (d, v) => { const t = strOf(v); if (t && !/^[\d-]+$/.test(t)) bad('電話番号は半角の数字とハイフンで入れてください'); d.tel = t; } },
    { label: 'メールアドレス', reqNew: true, unique: true, get: (d) => d.email, put: (d, v) => { const t = strOf(v); if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(t)) bad('メールアドレスの形式が正しくありません'); d.email = t; } },
    { label: '区分', opts: ['個人', '会社所属'], valueAlias: { 自社: '会社所属', 委託: '会社所属' }, get: (d) => staffKindOf(d), put: (d, v) => { d.staffKind = v === '個人' ? '個人' : '会社所属'; } },
    { label: '対応エリア', type: 'list', clear: true, get: (d) => d.areas, put: (d, v) => { d.areas = arr(v); } },
    { label: '状態', opts: ['有効', '無効', '利用停止', '免許未登録'], get: (d) => d.status, put: (d, v) => { d.status = v as Driver['status']; } },
    { label: '免許証', ro: true, get: (d) => (licenseOf(d) ? 'あり' : 'なし') },
    { label: 'アカウントの状態', ro: true, get: (d, x) => x.r.get<Account>('dm.account.accounts', d.id)?.status ?? '未発行' },
  ],
  draftOf: (d) => structuredClone(d),
  newDraft: () => ({ id: '', carrierId: '', name: '', kana: '', tel: '', email: '', employment: 'partner', areas: [], status: '有効', staffKind: '会社所属' }),
  save: (x, d, cur) => {
    if (cur) {
      if (cur.carrierId !== d.carrierId) bad('所属先は CSV では変えられません');
      if (staffKindOf(cur) !== staffKindOf(d) || JSON.stringify(cur.areas) !== JSON.stringify(d.areas)) {
        master.actions.update(x.r, { kind: 'drivers', id: cur.id, patch: { staffKind: staffKindOf(d), areas: d.areas }, by: OPS_BY });
      }
      master.actions.updateDriver(x.r, { id: cur.id, name: d.name, kana: d.kana, tel: d.tel, email: d.email, status: d.status, by: OPS_BY });
      return cur.id;
    }
    const c = x.r.get<Carrier>('dm.master.carriers', d.carrierId);
    const { id: _i, status: _s, ...rest } = d;
    /* 雇用形態（内部）は所属先で決まる：ES配送便（自社）＝self、委託配送先＝partner */
    const n = master.actions.addDriver(x.r, { ...rest, employment: c?.kind === '自社' ? 'self' : 'partner', staffKind: staffKindOf(d), by: OPS_BY });
    /* 免許証の写真は CSV で送れないので「免許未登録」（アカウントは発行しない・台帳 K） */
    master.actions.setDriverStatus(x.r, { id: n.id, status: '免許未登録', by: OPS_BY, hist: '' });
    return n.id;
  },
};

/* 仕入先は共通 DB の suppliers（仕入先サイト・運営の仕入先マスタ・申込と同じ置き場。lib/ops/general/suppliers.ts・課題 11） */
export const suppliers: CsvEntity<GenRow, GenRow> = {
  id: 'suppliers', screen: '仕入先マスタ', key: '仕入先ID', create: true,
  list: (x) => listSuppliers(x.r).filter((g) => g.status !== '削除済').map(supplierRow),
  keyOf: (g) => s(g.id), nameOf: (g) => s(g.name),
  cols: [
    { label: '仕入先ID', hint: '空欄＝新規（採番・未発行）', get: (g) => g.id },
    { label: '仕入先名', reqNew: true, max: 100, get: (g) => g.name, put: (d, v) => { d.name = strOf(v); } },
    { label: '本社住所', clear: true, get: (g) => g.addr, put: (d, v) => { d.addr = strOf(v); } },
    { label: '担当者名', clear: true, get: (g) => g.pic, put: (d, v) => { d.pic = strOf(v); } },
    { label: '担当者の電話番号', clear: true, get: (g) => g.tel, put: (d, v) => { const t = strOf(v); if (t && !/^[\d-]+$/.test(t)) bad('電話番号は半角の数字とハイフンで入れてください'); d.tel = t; } },
    { label: '土日祝を営業日', opts: ['はい', 'いいえ'], get: (g) => g.biz, put: (d, v) => { d.biz = strOf(v); } },
    { label: '発注方法', opts: ['ESステーション', 'メール', '外部'], get: (g) => g.method, put: (d, v) => { d.method = strOf(v); } },
    { label: 'ステータス', ro: true, get: (g) => g.status },
    { label: 'アカウントの状態', ro: true, get: (g, x) => x.r.get<Account>('dm.account.accounts', s(g.id))?.status ?? '未発行' },
  ],
  locked: (g) => (['申込中', '却下'].includes(s(g.status)) ? `${s(g.status)}の仕入先は申込の確認から処理してください` : null),
  draftOf: (g) => ({ ...g }),
  newDraft: () => ({ _uid: '', id: '', name: '', addr: '', pic: '', tel: '', biz: 'いいえ', method: 'ESステーション', status: '未発行' }),
  save: (x, d, cur) => {
    if (!s(d.name).trim()) bad('仕入先名を入れてください');
    const id = cur ? s(cur.id) : nextSupplierId(x.r);
    putSupplierRow(x.r, { ...d, _uid: id, id });
    return id;
  },
};

/* ---------- 使わない import の警告よけ ---------- */
export type _Unused = DocRepo;
