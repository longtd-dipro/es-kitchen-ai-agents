import { PRODUCTS } from '@/lib/domain/seed/products';
import { supplierProductRows } from '@/lib/supplier/fromDomain';
import type { ProductRow, Supplier } from '@/lib/supplier/types';
import orders from './orders.source.json';
import { GEN_SUPPLIER, SUPPLIER_APPS } from '@/lib/ops/general/seed';
import { fromOld, type SupplierRec } from '@/lib/ops/general/suppliers';

/* 見本の仕入先（運営Web「マスタ管理 ＞ 仕入先マスタ」と同じ項目・架空データ） */
const SP00001: Supplier = {
  id: 'SP00001', name: '株式会社サンプル商事', kana: 'カブシキガイシャ サンプルショウジ', kind: '通常商品・短消費期限商品', goods: '惣菜・肉類', status: '本登録',
  zip: '103-0027', addr: '東京都中央区日本橋1-2-3 サンプルビル5F', tel: '03-0000-0001', pic: '佐藤 直樹', picKana: 'サトウ ナオキ', mail: 'n.sato@sample-shoji.example.jp', picTel: '03-0000-0011', since: '2026/04/01',
  rep: '山田 太郎', corpNo: '1234567890123', invoice: 'T1234567890123', factory: '〒332-0011 埼玉県川口市元郷4-5-6 サンプル商事 川口工場', whs: '関東倉庫・関西倉庫・中部倉庫', days: '月〜土', bizDay: 'いいえ',
  defMethod: '直送（運送会社利用）', defCarrier: 'ヤマト運輸', cert: '食品製造業許可、HACCP', close: '毎月末日締め', pay: '翌月末日払い（銀行振込）',
  bank: { name: 'みずほ銀行', branch: '日本橋支店', type: '普通', no: '●●●●567', holder: 'カ）サンプルショウジ' }, lastLogin: '2026/10/05 08:12',
  contacts: [
    { kind: 'メイン担当者', name: '佐藤 直樹', kana: 'サトウ ナオキ', mail: 'n.sato@sample-shoji.example.jp', tel: '03-0000-0011' },
    { kind: 'サブ担当者', name: '高橋 恵', kana: 'タカハシ メグミ', mail: 'm.takahashi@sample-shoji.example.jp', tel: '03-0000-0012' },
  ],
  products: [],
};

/** 青空水産（受注不可の見本）。会社以外の項目はサンプル商事と同じ */
const SP00003: Supplier = {
  ...structuredClone(SP00001),
  id: 'SP00003', name: '株式会社青空水産', kana: 'カブシキガイシャ アオゾラスイサン', kind: '通常商品・短消費期限商品', goods: '魚類',
  zip: '425-0026', addr: '静岡県焼津市焼津1-2-3', tel: '054-000-0003', pic: '村上 大輔', picKana: 'ムラカミ ダイスケ', mail: 'd.murakami@aozora-suisan.example.jp', picTel: '054-000-0013',
  rep: '青空 一郎', corpNo: '4567890123456', invoice: 'T4567890123456', factory: '〒425-0026 静岡県焼津市焼津1-2-3 青空水産 焼津工場', bizDay: 'いいえ', lastLogin: '2026/10/04 18:02',
  contacts: [{ kind: 'メイン担当者', name: '村上 大輔', kana: 'ムラカミ ダイスケ', mail: 'd.murakami@aozora-suisan.example.jp', tel: '054-000-0013' }],
};

const SP00005: Supplier = {
  id: 'SP00005', name: '株式会社マルシンフーズ', kana: 'カブシキガイシャ マルシンフーズ', kind: '通常商品・短消費期限商品', goods: 'ごはん・パン（おにぎり・サンドイッチなど）', status: '本登録',
  zip: '332-0012', addr: '埼玉県川口市本町3-4-5', tel: '048-000-0005', pic: '小川 美香', picKana: 'オガワ ミカ', mail: 'm.ogawa@marushin-foods.example.jp', picTel: '048-000-0015', since: '2026/04/01',
  rep: '丸山 慎一', corpNo: '2345678901234', invoice: 'T2345678901234', factory: '〒332-0012 埼玉県川口市本町3-4-5 マルシン川口デリカ工場', whs: '関東倉庫・関西倉庫', days: '毎日', bizDay: 'はい',
  defMethod: '直送（運送会社利用）', defCarrier: '栄成ロジ', cert: '食品製造業許可、HACCP、菓子製造業許可', close: '毎月20日締め', pay: '翌月末日払い（銀行振込）',
  bank: { name: '埼玉りそな銀行', branch: '川口支店', type: '普通', no: '●●●●214', holder: 'カ）マルシンフーズ' }, lastLogin: '2026/10/05 07:40',
  contacts: [{ kind: 'メイン担当者', name: '小川 美香', kana: 'オガワ ミカ', mail: 'm.ogawa@marushin-foods.example.jp', tel: '048-000-0015' }],
  products: [],
};

const SP00009: Supplier = {
  id: 'SP00009', name: 'フジ包装株式会社', kana: 'フジホウソウ カブシキガイシャ', kind: '資材', goods: '割り箸・カトラリー・容器', status: '本登録',
  zip: '332-0015', addr: '埼玉県川口市川口2-3-4', tel: '048-000-0009', pic: '藤井 薫', picKana: 'フジイ カオル', mail: 'k.fujii@fuji-houso.example.jp', picTel: '048-000-0019', since: '2026/04/01',
  rep: '藤井 清', corpNo: '3456789012345', invoice: 'T3456789012345', factory: '〒332-0015 埼玉県川口市川口2-3-4 フジ包装 川口倉庫', whs: '関東倉庫', days: '月〜金', bizDay: 'いいえ',
  defMethod: '直送（運送会社利用）', defCarrier: 'ヤマト運輸', cert: '', close: '毎月末日締め', pay: '翌々月10日払い（銀行振込）',
  bank: { name: '三井住友銀行', branch: '川口支店', type: '普通', no: '●●●●908', holder: 'フジホウソウ（カ' }, lastLogin: '2026/10/04 16:55',
  contacts: [{ kind: 'メイン担当者', name: '藤井 薫', kana: 'フジイ カオル', mail: 'k.fujii@fuji-houso.example.jp', tel: '048-000-0019' }],
  products: [],
};

/**
 * 仕入先（並び：SP00001・SP00003・SP00005・SP00009）。
 * 取扱商品は共通データの商品マスタの見本（商品の仕入先にこの仕入先がある商品）。資材は見本の発注データ（prods）から。
 * 共通 DB では lib/server/supplierRepo.ts が、読むたびに dm.master.products から作り直す
 */
export function mockSuppliers(): Record<string, Supplier> {
  const prods = orders.prods as unknown as Record<string, [string, string, string, string, number][]>;
  const list = [SP00001, SP00003, SP00005, SP00009].map((s) => {
    const x = structuredClone(s);
    const p = prods[x.id];
    x.products = supplierProductRows(PRODUCTS, x.id, (p ?? []).map((r) => [...r, 0] as ProductRow));
    return x;
  });
  return Object.fromEntries(list.map((s) => [s.id, s]));
}

/**
 * 共通 DB の仕入先の見本（課題 11：運営の仕入先マスタ・申込・仕入先サイトのログインの置き場を1つにする）。
 * 仕入先サイトの4社（上）＋運営の仕入先マスタの見本にだけあった仕入先（SP00002 など・申込中の SP00010／SP00011）。ID はそのまま。
 * 4社と重なる仕入先は上の値（仕入先サイトの値）を使う
 */
export function allSuppliers(): SupplierRec[] {
  const site = Object.values(mockSuppliers()).map((x) => ({ ...x, method: GEN_SUPPLIER.find((g) => g.id === x.id)?.method as string | undefined ?? 'ESステーション' }));
  const ids = new Set(site.map((x) => x.id));
  const rest = GEN_SUPPLIER.filter((g) => !ids.has(String(g.id))).map((g) => fromOld(g, SUPPLIER_APPS[String(g.id)] ?? null));
  return [...site, ...rest].sort((a, b) => a.id.localeCompare(b.id));
}
