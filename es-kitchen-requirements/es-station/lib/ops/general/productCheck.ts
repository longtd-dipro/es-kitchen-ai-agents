import { ALLERGEN_NONE, crossesFrames, JAN_MAX, JAN_RE, NUT_KEYS, nutTo } from '@/lib/domain/product';
import type { ProductInput } from './product';

/*
 * 商品マスタの入力の確かめ（画面とサーバーで同じ。画面は保存の前に全項目をまとめて確かめる＝P-FORMBOX）。
 * 文言は共通メッセージ（ja_o）：E01 必須／E02 選択／E03 カナ／E04 文字数／E10 URL／E12 範囲／E13 絵文字／E14 数値／E245（自販機コラム）／E256（JAN の桁）・E253（JAN の件数）／E257（半角）／E258（なし）。
 * キー＝項目（画面の赤枠の場所）。データベースを見る確かめ（JAN の重複・カテゴリ・倉庫の有無）は lib/ops/general/product.ts
 */

/** 数値の上限（2026-10-06 確認メモ Q-H8・受付簿 #236） */
export const LIMIT = { yen: 999_999_999, nut: 9999.9, serving: 9999, lot: 9999, esDay: 999, esMonth: 99, text: 60, memo: 500, url: 255 } as const;
export const ERR_PHOTO = 'PNG・JPEG・WebPの5MB以内・長い辺1200pxまでにしてください。';
/** 写真の長い辺の上限（px。縮小はしない：受付簿 #236） */
export const PHOTO_MAX_SIDE = 1200;

const E01 = (l: string) => `${l}は必須項目です。`;
const E02 = (l: string) => `${l}を選択してください。`;
const E04 = (n: number) => `${n}文字以内で入力してください。`;
const E12 = (l: string, min: string, max: string) => `${l}は${min}〜${max}の範囲で入力してください。`;
const E13 = (l: string) => `${l}に絵文字は使えません。`;
const E14 = (l: string) => `${l}は数値で入力してください。`;
const EMOJI = /\p{Extended_Pictographic}/u;
const KANA = /^[ァ-ヶー・（）　 ]+$/;
const comma = (n: number) => n.toLocaleString('ja-JP');
const dec1 = (v: number) => Math.round(v * 10) / 10 === v;

/** 自由な文字の項目：文字数・絵文字（空はよい） */
function text(e: Record<string, string>, key: string, label: string, v: string | undefined, max: number) {
  const t = (v ?? '').trim();
  if (t.length > max) e[key] = E04(max);
  else if (EMOJI.test(t)) e[key] = E13(label);
}

/** 数（空欄＝NaN・undefined は E01）：範囲と小数の桁。なければ null */
function num(label: string, v: number | undefined, min: number, max: number, o: { int?: boolean; dec1?: boolean } = {}): string | null {
  if (v === undefined || v === null || (typeof v === 'number' && Number.isNaN(v))) return E01(label);
  if (typeof v !== 'number' || !Number.isFinite(v)) return E14(label);
  if (v < min || v > max || (o.int && !Number.isInteger(v)) || (o.dec1 && !dec1(v))) return E12(label, comma(min), comma(max));
  return null;
}

const NUT_NAME: Record<(typeof NUT_KEYS)[number], string> = { kcal: 'エネルギー', protein: 'たんぱく質', fat: '脂質', carbs: '炭水化物', salt: '食塩相当量' };

/** 入力の確かめ。エラーのあるキー → 文言（なければ空） */
export function checkProductInput(d: ProductInput): Record<string, string> {
  const e: Record<string, string> = {};
  const set = (k: string, m: string | null) => { if (m) e[k] = m; };
  /* 基本情報 */
  const name = (d.name ?? '').trim();
  if (!name) e.name = E01('商品名（公開名・日本語）'); else text(e, 'name', '商品名（公開名・日本語）', name, LIMIT.text);
  /* 商品名カナは任意（受付簿 #236）。入れたときだけ全角カタカナか確かめる */
  const kana = (d.kana ?? '').trim();
  if (kana) { if (!KANA.test(kana)) e.kana = '商品名カナは全角カタカナで入力してください。'; else text(e, 'kana', '商品名カナ', kana, LIMIT.text); }
  const en = (d.nameEn ?? '').trim();
  if (!en) e.nameEn = E01('商品名（公開名・英語）');
  else if (/[　-鿿＀-￯]/.test(en)) e.nameEn = '商品名（公開名・英語）は半角の文字で入力してください。';
  else text(e, 'nameEn', '商品名（公開名・英語）', en, LIMIT.text);
  text(e, 'mgmtName', '管理名（社内）', d.mgmtName, LIMIT.text);
  text(e, 'supplierItemName', '仕入先向けの名前', d.supplierItemName, LIMIT.text);
  /* JAN（複数・先頭が主）：1件ごとに8〜13桁・10件まで・同じ商品の中で重複不可（台帳 F 2026-10-08）。ほかの商品との重複はサーバー（master）で確かめる */
  const jans = (d.jans ?? (d.jan ? [d.jan] : [])).map((j) => j.trim()).filter(Boolean);
  if (jans.some((j) => !JAN_RE.test(j))) e.jan = 'JANコードは8〜13桁の数字で入力してください。';
  else if (jans.length > JAN_MAX) e.jan = `JANは${JAN_MAX}個までです。`;
  else if (new Set(jans).size !== jans.length) e.jan = '同じJANコードは2行に入力できません。';
  if (!d.categoryId) e.category = E02('カテゴリ');
  set('priceYen', num('販売価格（税込）', d.priceYen, 0, LIMIT.yen, { int: true }));
  if (!d.taxRateId) e.taxRateId = E02('税率');
  text(e, 'note', '商品備考', d.note, LIMIT.memo);
  if ((d.images ?? []).length > 5) e.images = '商品写真は5枚までです。';
  /* 管理用：栄養成分（100g当たり）は6項目すべて必須。5項目は範囲 from〜to（両方必須・to ≧ from。台帳 F 2026-10-08）、内容量は1つの数 */
  const n = d.nutrition?.per100g;
  set('n.servingG', num('1食当たり内容量', n?.servingG, 1, LIMIT.serving, { dec1: true }));
  const to = n ? nutTo(n) : undefined;
  for (const k of NUT_KEYS) {
    const l = `${NUT_NAME[k]}/100g`;
    set(`n.${k}`, num(l, n?.[k], 0, LIMIT.nut, { dec1: true }));
    set(`n.${k}.to`, num(`${l}（to）`, n?.to ? n.to[k] : to?.[k], 0, LIMIT.nut, { dec1: true }));
    if (!e[`n.${k}`] && !e[`n.${k}.to`] && n && n.to && n.to[k] < n[k]) e[`n.${k}.to`] = `${l}の to は from 以上で入力してください。`;
  }
  text(e, 'n.other', 'その他成分', n?.other, LIMIT.text);
  if (!d.pickWarehouseIds?.length) e.pick = E02('ピッキング倉庫');
  if (!d.courses?.length) e.courses = E02('コース');
  if (crossesFrames(d.vending?.columns ?? [])) e.vm = '自販機コラムはシングルとダブルの両方を選べません。';
  if ((d.vending?.subColumns ?? []).some((c) => d.vending.columns.includes(c))) e.vmSub = 'サブコラムにはメインコラムと同じものを選べません。';
  text(e, 'vmNote', '自販機コラム備考', d.vending?.note, LIMIT.memo);
  for (const t of d.shipInstructions ?? []) if (t.length > LIMIT.text) { e.ship = E04(LIMIT.text); break; }
  const life = d.shelfLife;
  set('shelf', num('ESの賞味期限または消費期限', life?.esValue, 1, life?.esUnit === 'ヶ月' ? LIMIT.esMonth : LIMIT.esDay, { int: true }));
  text(e, 'maker', 'メーカーの賞味期限または消費期限', life?.maker, LIMIT.text);
  /* 仕入先：1社以上（複数可・使うのは「選択中」の1社。受付簿 #286）。各行の仕入先・仕入単価・ロットは必須（受付簿 #273）。同じ仕入先は2行に入れられない（E246）。キー＝sup.行番号.項目 */
  const sups = d.suppliers ?? [];
  if (!sups.length) e['sup.0.supplierId'] = E02('仕入先名');
  const seen = new Set<string>();
  sups.forEach((s, i) => {
    const k = (x: string) => `sup.${i}.${x}`;
    if (!s.supplierId) e[k('supplierId')] = E02('仕入先名');
    else if (seen.has(s.supplierId)) e[k('supplierId')] = '同じ仕入先は2行に入力できません。';
    seen.add(s.supplierId);
    set(k('cost'), num('仕入単価（税抜）', s.unitCostYen, 0, LIMIT.yen, { int: true }));
    set(k('lot'), num('ロット', s.lot, 1, LIMIT.lot, { int: true }));
    text(e, k('note'), '仕入れ備考', s.note, LIMIT.text);
    if (s.nextCost) {
      set(k('next'), num('改定後の仕入単価（税抜）', s.nextCost.unitCostYen, 0, LIMIT.yen, { int: true }));
      if (!e[k('next')] && !s.nextCost.from) e[k('from')] = E01('仕入単価の適用開始日');
    }
  });
  /* 表示用 */
  const desc = (d.description ?? '').trim();
  if (!desc) e.description = E01('商品解説'); else text(e, 'description', '商品解説', desc, LIMIT.memo);
  const alg = d.allergens?.specific ?? [];
  if (!alg.length) e.alg = E02('特定原材料');
  else if (alg.includes(ALLERGEN_NONE) && alg.length > 1) e.alg = '「なし」はほかの特定原材料と同時に選べません。';
  text(e, 'ingredients', '原材料名', d.ingredients, LIMIT.memo);
  text(e, 'additives', '添加物', d.additives, LIMIT.memo);
  const url = (d.makerUrl ?? '').trim();
  if (url && (!/^https?:\/\/\S+$/.test(url) || url.length > LIMIT.url)) e.makerUrl = '正しいURLの形式で入力してください。';
  return e;
}

/** エラーのキー → タブ（保存できないとき、そのタブを開く） */
export const TAB_OF = (k: string): '管理用' | '表示用' | undefined => {
  if (['description', 'alg', 'ingredients', 'additives', 'makerUrl'].includes(k)) return '表示用';
  if (k.startsWith('n.') || k.startsWith('sup.') || ['pick', 'courses', 'vm', 'vmSub', 'vmNote', 'ship', 'shelf', 'maker'].includes(k)) return '管理用';
  return undefined;
};

/** エラーのキー → 項目名（サーバー・CSV のエラーの文言に付ける） */
export const LABEL: Record<string, string> = {
  name: '商品名（公開名・日本語）', kana: '商品名カナ', nameEn: '商品名（公開名・英語）', mgmtName: '管理名（社内）', supplierItemName: '仕入先向けの名前', jan: 'JANコード', category: 'カテゴリ',
  priceYen: '販売価格（税込）', taxRateId: '税率', note: '商品備考', images: '商品写真', 'n.servingG': '1食当たり内容量', 'n.kcal': 'エネルギー/100g', 'n.protein': 'たんぱく質/100g', 'n.fat': '脂質/100g', 'n.carbs': '炭水化物/100g',
  'n.salt': '食塩相当量/100g', 'n.kcal.to': 'エネルギー/100g（to）', 'n.protein.to': 'たんぱく質/100g（to）', 'n.fat.to': '脂質/100g（to）', 'n.carbs.to': '炭水化物/100g（to）', 'n.salt.to': '食塩相当量/100g（to）', 'n.other': 'その他成分', pick: 'ピッキング倉庫', courses: 'コース', vm: 'メインコラム', vmSub: 'サブコラム', vmNote: '自販機コラム備考', ship: '出荷時の特殊指示', shelf: 'ESの賞味期限または消費期限',
  maker: 'メーカーの賞味期限または消費期限', 'sup.supplierId': '仕入先名', 'sup.cost': '仕入単価（税抜）', 'sup.lot': 'ロット', 'sup.note': '仕入れ備考', 'sup.next': '改定後の仕入単価（税抜）', 'sup.from': '仕入単価の適用開始日',
  description: '商品解説', alg: '特定原材料', ingredients: '原材料名', additives: '添加物', makerUrl: 'ホームページ',
};
/** エラーの文言に項目名を付ける（もう入っていれば付けない） */
export const withLabel = (k: string, m: string) => {
  const l = LABEL[k.replace(/^sup\.\d+\./, 'sup.')];
  return l && !m.includes(l) ? `${l}：${m}` : m;
};
