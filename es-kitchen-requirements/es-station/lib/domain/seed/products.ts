import { perServingOf } from '../product';
import type { NutKey, Nutrition, Product, ProductCategory, ProductCourse, ProductHistory, ProductSupplier, ProductTag, ShortClass, TaxRate, TempType } from '../types';

/*
 * 商品マスタの見本（Phase 1 の運営Web 商品マスタ詳細：基本情報・管理用・表示用・変更履歴）。
 * 品番 M001〜M032 は運営のメニュー・仕入先サイトの発注と同じ（JAN は別の項目）。
 * つながり（決定）：仕入先 ↔ 商品 ↔ ピッキング倉庫 ↔ メニュー
 *   ・仕入先：仕入先サイトの見本（mocks/supplier/orders.source.json の prods）の品番は、その仕入先・入り数（lot）にそろえる。
 *     ほかの品番はカテゴリで SP00001（肉・惣菜・汁物）／SP00003（魚）／SP00005（ごはん・パン・サラダ・甘味・飲み物）に付けた
 *   ・ピッキング倉庫：関東（WH00001）は全部。関西（WH00002）・中部（WH00003）は仕入先サイトの発注の倉庫と、いまの配送（大阪＝関西、みらい商事＝中部）に合わせた一部
 *   ・コース：冷凍はスタンダードだけ（冷凍の便はスタンダードだけ）。デミグラスハンバーグはライト・スタンダード
 *     （シナリオ説明書 ⑦：大阪支店（ESライト）の 9/29・10/13 の便に入っている。9/15 の変更は商品の備考だけ）
 *   ・自販機：vmFrame（W ダブル／S シングル／B ベルト）と同じコラム。ベルトは VM000001 だけ
 * 販売価格は税込。税率はすべて 8%（軽減）。仕入単価は税抜。
 * 仕入単価は、メニューの平均仕入単価の目標（既定 170〜179円・lib/domain/seed/settings.ts）に標準数の調整（受付簿 No.66）が届くよう、2026-10-05 に見本を 1.9 倍にした（hong＝B）。
 * 法人Web の月次注文の 商品解説・アレルゲン（もとは lib/corp/order/data.ts の DESC・ALG）もここ。
 */

export const TAX_RATES: TaxRate[] = [
  { id: 'TX01', label: '8%（軽減）', rate: 8 },
  { id: 'TX02', label: '10%', rate: 10 },
];

/*
 * 商品タグ。「おすすめ」タグ・表記は使わない（RD-MN-106）。短消費期限はタグではなく商品の「短消費期限の区分」（shelfLife.shortClass。RD-MN-099：2026/07/07 にタグから分けた）。
 * ID は前の見本のまま（TG002 おすすめ・TG003 短消費期限 は欠番）
 */
export const PRODUCT_TAGS: ProductTag[] = ([['TG001', 'NEW'], ['TG004', '再登場'], ['TG005', '定番'], ['TG006', '冷たくても美味しい']] as const)
  .map(([id, name]) => ({ id, name }));

/** 商品カテゴリ（運営の「商品カテゴリ管理」。2026-10-05 決定：7つ。上段 肉・魚・惣菜／下段 主食・汁物・「サラダ・果物」・「飲料・甘味」。並びは表示順。最終の名前は 2026-10-06 の客先確認・hong 回答） */
export const PRODUCT_CATEGORIES: ProductCategory[] = ([
  ['CAT00001', '肉', 1, '鶏肉、豚肉、牛肉を使用した商品を分類します。'],
  ['CAT00002', '魚', 2, '魚介類を主な食材とする商品を分類します。'],
  ['CAT00003', '惣菜', 3, '主菜や副菜として提供される調理済み商品を分類します。'],
  ['CAT00004', '主食', 4, 'ごはん、丼、カレー、パン、おにぎり、サンドイッチなどの主食を分類します。'],
  ['CAT00005', '汁物', 5, 'スープや味噌汁などの汁物商品を分類します。'],
  ['CAT00006', 'サラダ・果物', 6, '野菜を中心としたサラダ商品と、果物の商品を分類します。'],
  ['CAT00007', '飲料・甘味', 7, '水、お茶、ジュースなどの飲料と、デザートなどの甘味商品を分類します。'],
] as const).map(([id, name, order, note], i) => ({ id, name, order, note, img: `photo:${name}:${80 + i}` }));

/* ---------------- 商品 ---------------- */

const MAKER: Record<string, string> = {
  SP00001: 'https://sample-shoji.example.jp', SP00003: 'https://aozora-suisan.example.jp', SP00005: 'https://marushin-foods.example.jp',
};
const WH: Record<string, string> = { K: 'WH00001', S: 'WH00002', C: 'WH00003' };
const COURSE: Record<string, ProductCourse[]> = { LS: ['ライト', 'スタンダード'], S: ['スタンダード'], L: ['ライト'] };
const VM: Record<'W' | 'S' | 'B', { columns: string[]; models: string[] }> = {
  W: { columns: ['ダブル8', 'ダブル10'], models: ['VM000001', 'VM000002'] },
  S: { columns: ['シングル8', 'シングル10'], models: ['VM000001', 'VM000002'] },
  B: { columns: ['ベルト5'], models: ['VM000001'] },
};

/** JAN（13桁）：458080466＋品番3桁＋チェックデジット */
function jan(id: string) {
  const d = `458080466${id.slice(1).padStart(3, '0')}`;
  const sum = [...d].reduce((s, c, i) => s + Number(c) * (i % 2 ? 3 : 1), 0);
  return d + ((10 - (sum % 10)) % 10);
}

type Spec = {
  id: string; name: string; kana: string; cat: string; temp: TempType; price: number; /** 見本のメニューの商品タグの初期値（商品マスタには持たない） */ tags: string[]; vm: 'W' | 'S' | 'B' | null;
  /** [ES の期限, 単位, 短消費期限の区分, メーカーの期限] */
  life: [number, '日' | 'ヶ月', ShortClass, string];
  /** 1食当たり [内容量g, kcal, たんぱく質, 脂質, 炭水化物, 食塩相当量] */
  nut: [number, number, number, number, number, number];
  alg: [string[], string[]];
  desc: string; raw: string; add: string;
  /** ピッキング倉庫（K 関東・S 関西・C 中部） */
  wh: string;
  course: keyof typeof COURSE;
  /** 仕入先 [仕入先, 仕入単価（税抜）, 入り数, 備考]。複数可（2026-10-08 決定・受付簿 #286。旧：1商品＝1仕入先 #231） */
  sup: [string, number, number, string][];
  mats?: string[]; ship?: string[]; note?: string; vmNote?: string; other?: string;
};

const FROZEN_LIFE: Spec['life'] = [6, 'ヶ月', '対象外', '製造日から12ヶ月'];
const CHILL_LIFE: Spec['life'] = [30, '日', '対象外', '製造日から35日'];
const AMB_LIFE: Spec['life'] = [12, 'ヶ月', '対象外', '製造日から18ヶ月'];
const FROZEN_SHIP = ['冷凍便で出荷（解凍しない）'];

const SPECS: Spec[] = [
  { id: 'M001', name: '牛肉とごぼうの甘辛煮', kana: 'ギュウニクトゴボウノアマカラニ', cat: '肉', temp: '冷蔵', price: 200, tags: [], vm: null,
    life: [5, '日', 'ショート', '製造日から6日'], nut: [150, 245, 12.8, 13.5, 17.2, 1.9], alg: [['小麦'], ['牛肉', '大豆', 'ごま']],
    desc: '国産牛とごぼうを甘辛く炊き上げました。ご飯がすすむ、やさしい味の定番のおかずです。',
    raw: '牛肉（国産）、ごぼう、しょうゆ（小麦・大豆を含む）、砂糖、みりん、ごま油、しょうが', add: '調味料（アミノ酸等）', wh: 'KSC', course: 'LS',
    sup: [['SP00001', 243, 12, '']], mats: ['S001'] },
  { id: 'M002', name: 'デミグラスハンバーグ', kana: 'デミグラスハンバーグ', cat: '肉', temp: '冷蔵', price: 200, tags: [], vm: null,
    life: [14, '日', 'セミショート', '製造日から16日'], nut: [160, 298, 14.2, 18.6, 16.8, 2.1], alg: [['小麦', '卵', '乳'], ['牛肉', '豚肉', '大豆']],
    desc: '手ごね仕上げの肉汁たっぷりのハンバーグに、コクのあるデミグラスソースを合わせました。',
    raw: '牛肉、豚肉、玉ねぎ、パン粉（小麦を含む）、卵、牛乳、デミグラスソース（小麦・乳成分を含む）、塩、こしょう', add: '増粘剤（加工でんぷん）、カラメル色素、調味料（アミノ酸等）',
    wh: 'KS', course: 'LS', sup: [['SP00001', 251, 6, '']], mats: ['S001'], note: '電子レンジで温めるとよりおいしい（冷たいままでも可）' },
  { id: 'M003', name: 'チキンのチーズソテー', kana: 'チキンノチーズソテー', cat: '肉', temp: '冷蔵', price: 200, tags: ['NEW'], vm: null,
    life: CHILL_LIFE, nut: [140, 276, 21.5, 17.8, 6.4, 1.6], alg: [['小麦', '乳'], ['鶏肉', '大豆']],
    desc: '鶏もも肉をこんがり焼いて、とろけるチーズをのせました。冷めても柔らかい仕上がりです。',
    raw: '鶏肉（国産）、ナチュラルチーズ（乳成分を含む）、小麦粉、植物油脂、食塩、こしょう、にんにく', add: '調味料（アミノ酸等）、pH調整剤',
    wh: 'KS', course: 'LS', sup: [['SP00001', 239, 6, '']], mats: ['S001'] },
  { id: 'M004', name: '豚の生姜焼き', kana: 'ブタノショウガヤキ', cat: '肉', temp: '冷凍', price: 200, tags: [], vm: null,
    life: FROZEN_LIFE, nut: [150, 262, 15.6, 15.2, 13.8, 2.0], alg: [['小麦'], ['豚肉', '大豆', 'りんご']],
    desc: '豚肩ロースを生姜の効いたたれで焼き上げました。凍ったまま電子レンジで温められます。',
    raw: '豚肉（国産）、玉ねぎ、しょうゆ（小麦・大豆を含む）、しょうが、砂糖、りんご果汁、みりん', add: '調味料（アミノ酸等）、増粘剤（キサンタン）',
    wh: 'KS', course: 'S', sup: [['SP00001', 236, 6, '']], mats: ['S001'], ship: FROZEN_SHIP },
  { id: 'M005', name: 'トラウトサーモンの旨塩焼き', kana: 'トラウトサーモンノウマシオヤキ', cat: '魚', temp: '冷蔵', price: 200, tags: [], vm: null,
    life: [5, '日', 'ショート', '製造日から6日'], nut: [110, 198, 18.4, 12.1, 2.6, 1.4], alg: [['なし'], ['さけ']],
    desc: '脂ののったトラウトサーモンを旨塩でシンプルに焼き上げました。骨を取り除いてあります。',
    raw: 'トラウトサーモン（チリ）、食塩、昆布エキス、こしょう', add: '調味料（アミノ酸等）',
    wh: 'KSC', course: 'LS', sup: [['SP00003', 262, 12, '']], mats: ['S001'] },
  { id: 'M006', name: 'さばの味噌煮', kana: 'サバノミソニ', cat: '魚', temp: '冷蔵', price: 100, tags: [], vm: null,
    life: CHILL_LIFE, nut: [140, 226, 15.8, 12.4, 11.6, 1.8], alg: [['小麦'], ['さば', '大豆']],
    desc: '脂ののったさばを、合わせ味噌でじっくり煮込みました。骨まで柔らかく食べやすい一品です。',
    raw: 'さば（ノルウェー）、みそ（大豆を含む）、砂糖、しょうゆ（小麦・大豆を含む）、しょうが、みりん', add: '増粘剤（加工でんぷん）',
    wh: 'KSC', course: 'LS', sup: [['SP00003', 125, 6, ''], ['SP00001', 129, 6, '予備（青空水産の欠品時のみ）']], mats: ['S001'] },
  { id: 'M007', name: 'いわしのトマトバジル煮', kana: 'イワシノトマトバジルニ', cat: '魚', temp: '冷凍', price: 200, tags: ['NEW'], vm: null,
    life: FROZEN_LIFE, nut: [140, 184, 14.6, 9.8, 8.2, 1.5], alg: [['なし'], ['大豆']],
    desc: '国産いわしをトマトとバジルで洋風に煮込みました。骨まで食べられる柔らかさです。',
    raw: 'いわし（国産）、トマトピューレ、玉ねぎ、オリーブ油、にんにく、バジル、食塩', add: '調味料（アミノ酸等）',
    wh: 'K', course: 'S', sup: [['SP00003', 238, 6, '']], mats: ['S001'], ship: FROZEN_SHIP },
  { id: 'M008', name: '寒干し大根の五目煮', kana: 'カンボシダイコンノゴモクニ', cat: '惣菜', temp: '冷蔵', price: 100, tags: [], vm: null,
    life: CHILL_LIFE, nut: [100, 78, 2.6, 2.4, 11.8, 1.2], alg: [['小麦'], ['大豆']],
    desc: '寒干し大根に人参・椎茸・油揚げを合わせ、だしを含ませて炊きました。もう一品にどうぞ。',
    raw: '切干大根、人参、油揚げ（大豆を含む）、椎茸、しょうゆ（小麦・大豆を含む）、砂糖、かつおだし', add: '',
    wh: 'KSC', course: 'LS', sup: [['SP00001', 118, 6, '']], mats: ['S001'] },
  { id: 'M009', name: 'ひじきの煮物', kana: 'ヒジキノニモノ', cat: '惣菜', temp: '冷蔵', price: 100, tags: ['再登場'], vm: null,
    life: CHILL_LIFE, nut: [90, 72, 2.8, 2.6, 9.6, 1.1], alg: [['小麦'], ['大豆', 'ごま']],
    desc: 'ひじきと大豆・人参を甘辛く煮た、毎日食べても飽きない家庭の味です。',
    raw: 'ひじき、大豆、人参、こんにゃく、しょうゆ（小麦・大豆を含む）、砂糖、ごま油', add: '水酸化カルシウム（こんにゃく用凝固剤）',
    wh: 'KS', course: 'LS', sup: [['SP00001', 110, 6, '']], mats: ['S001'] },
  { id: 'M010', name: 'ロールキャベツのクリーム煮', kana: 'ロールキャベツノクリームニ', cat: '惣菜', temp: '冷凍', price: 200, tags: [], vm: null,
    life: FROZEN_LIFE, nut: [200, 214, 9.8, 12.6, 15.4, 1.9], alg: [['小麦', '乳'], ['豚肉', '大豆']],
    desc: '豚ひき肉をキャベツで包み、まろやかなクリームソースで煮込みました。',
    raw: 'キャベツ、豚肉、玉ねぎ、牛乳、小麦粉、バター、パン粉（小麦を含む）、食塩', add: '増粘剤（加工でんぷん）、調味料（アミノ酸等）',
    wh: 'K', course: 'S', sup: [['SP00001', 247, 6, '']], mats: ['S002'], ship: FROZEN_SHIP },
  { id: 'M011', name: 'シェフの作ったビーフカレー（甘口）', kana: 'シェフノツクッタビーフカレー（アマクチ）', cat: '主食', temp: '常温', price: 200, tags: ['定番'], vm: null,
    life: AMB_LIFE, nut: [200, 236, 7.4, 13.2, 21.6, 2.4], alg: [['小麦', '乳'], ['牛肉', '大豆', 'りんご', 'バナナ']],
    desc: '牛肉と野菜を長時間煮込んだ、お子さまにも食べやすい甘口のビーフカレーです。',
    raw: '牛肉、玉ねぎ、人参、じゃがいも、小麦粉、カレー粉、りんごペースト、バナナピューレ、乳製品', add: 'カラメル色素、調味料（アミノ酸等）、酸味料、香料',
    wh: 'KSC', course: 'LS', sup: [['SP00001', 232, 10, '']], mats: ['S002', 'S004'], note: 'レトルト。常温で保管' },
  { id: 'M012', name: '青じそ昆布の五目ごはん', kana: 'アオジソコンブノゴモクゴハン', cat: '主食', temp: '冷凍', price: 200, tags: [], vm: null,
    life: FROZEN_LIFE, nut: [180, 268, 5.2, 2.1, 56.8, 1.3], alg: [['なし'], ['大豆']],
    desc: '昆布と五目の具を炊き込み、青じその香りで仕上げたさっぱりごはんです。',
    raw: 'うるち米（国産）、人参、ごぼう、昆布、青じそ、しょうゆ（大豆を含む）、食塩', add: '',
    wh: 'KS', course: 'S', sup: [['SP00005', 224, 6, '']], mats: ['S001'], ship: FROZEN_SHIP },
  { id: 'M013', name: '鮭おにぎり', kana: 'サケオニギリ', cat: '主食', temp: '冷蔵', price: 100, tags: ['冷たくても美味しい'], vm: 'W',
    life: [3, '日', 'ショート', '製造日から3日'], nut: [110, 182, 4.6, 1.4, 37.2, 1.0], alg: [['なし'], ['さけ']],
    desc: '焼き鮭をほぐして、ふっくら炊いたご飯で包みました。冷たいままでもおいしく食べられます。',
    raw: 'うるち米（国産）、焼鮭（さけ）、のり、食塩', add: 'pH調整剤、グリシン',
    wh: 'KSC', course: 'LS', sup: [['SP00005', 118, 12, '']], ship: ['OPP袋封入'] },
  { id: 'M014', name: 'ミックスサンドイッチ', kana: 'ミックスサンドイッチ', cat: '主食', temp: '冷蔵', price: 200, tags: [], vm: 'W',
    life: [3, '日', 'ショート', '製造日から3日'], nut: [130, 312, 10.8, 16.4, 30.2, 1.5], alg: [['小麦', '卵', '乳'], ['豚肉', '大豆']],
    desc: 'たまご・ハム・野菜の3種類を詰め合わせました。片手で食べられる軽食です。',
    raw: 'パン（小麦・乳成分を含む）、卵、ハム（豚肉を含む）、レタス、マヨネーズ（卵・大豆を含む）、トマト', add: '乳化剤、イーストフード、調味料（アミノ酸等）',
    wh: 'KSC', course: 'LS', sup: [['SP00005', 243, 12, '']], ship: ['OPP袋封入'], vmNote: 'ダブルコラムだけ（つぶれ防止）' },
  { id: 'M015', name: '王道のポテトサラダ', kana: 'オウドウノポテトサラダ', cat: 'サラダ・果物', temp: '冷蔵', price: 100, tags: [], vm: 'W',
    life: [5, '日', 'ショート', '製造日から6日'], nut: [100, 152, 2.0, 10.6, 12.4, 0.8], alg: [['卵'], ['豚肉', '大豆', 'りんご']],
    desc: 'ほくほくのじゃがいもにきゅうり・ハムを合わせた、昔ながらのポテトサラダです。',
    raw: 'じゃがいも（国産）、マヨネーズ（卵・大豆・りんごを含む）、きゅうり、ハム（豚肉を含む）、人参、食塩', add: '調味料（アミノ酸等）',
    wh: 'KSC', course: 'LS', sup: [['SP00005', 114, 12, ''], ['SP00001', 120, 12, '予備']], mats: ['S003'] },
  { id: 'M016', name: '季節野菜3種のピクルス（ズッキーニ、ニンジン、パプリカ）', kana: 'キセツヤサイサンシュノピクルス', cat: 'サラダ・果物', temp: '冷蔵', price: 100, tags: ['NEW', '再登場', '冷たくても美味しい'], vm: 'W',
    life: CHILL_LIFE, nut: [80, 34, 0.6, 0.1, 7.6, 0.6], alg: [['なし'], []],
    desc: 'ズッキーニ・人参・パプリカを、まろやかな甘酢に漬けました。箸休めにどうぞ。',
    raw: 'ズッキーニ、人参、パプリカ、醸造酢、砂糖、食塩、香辛料', add: '',
    wh: 'K', course: 'LS', sup: [['SP00005', 110, 12, '']], mats: ['S003'] },
  { id: 'M017', name: 'カットパイン', kana: 'カットパイン', cat: '飲料・甘味', temp: '冷蔵', price: 200, tags: [], vm: 'W',
    life: [3, '日', 'ショート', '製造日から3日'], nut: [120, 61, 0.7, 0.1, 15.5, 0.0], alg: [['なし'], []],
    desc: '完熟パインを食べやすい大きさにカットしました。みずみずしい甘さです。',
    raw: 'パインアップル（フィリピン）', add: '',
    wh: 'KS', course: 'LS', sup: [['SP00005', 232, 12, '']], mats: ['S003'], ship: ['天地無用', '他の商品と分けて梱包'] },
  { id: 'M018', name: '具だくさん豚汁', kana: 'グダクサントンジル', cat: '汁物', temp: '常温', price: 100, tags: ['定番'], vm: null,
    life: AMB_LIFE, nut: [230, 98, 6.2, 4.8, 7.4, 1.8], alg: [['なし'], ['豚肉', '大豆', 'ごま']],
    desc: '豚肉と根菜をたっぷり入れた、温めるだけで食べられる豚汁です。',
    raw: '大根、豚肉、人参、ごぼう、こんにゃく、みそ（大豆を含む）、ごま油、かつおだし', add: '調味料（アミノ酸等）',
    wh: 'KSC', course: 'LS', sup: [['SP00001', 114, 10, '']], mats: ['S002'], ship: ['天地無用'] },
  { id: 'M019', name: 'あさりのお味噌汁', kana: 'アサリノオミソシル', cat: '汁物', temp: '常温', price: 100, tags: [], vm: null,
    life: AMB_LIFE, nut: [200, 42, 3.8, 1.2, 4.0, 1.6], alg: [['なし'], ['大豆']],
    desc: 'あさりのうまみが溶け出した、ほっとするお味噌汁です。',
    raw: 'あさり、みそ（大豆を含む）、ねぎ、かつおだし、昆布だし', add: '調味料（アミノ酸等）',
    wh: 'K', course: 'LS', sup: [['SP00001', 104, 10, '']], mats: ['S002'], ship: ['天地無用'] },
  { id: 'M020', name: '野菜たっぷりミネストローネ', kana: 'ヤサイタップリミネストローネ', cat: '汁物', temp: '冷凍', price: 200, tags: ['NEW'], vm: null,
    life: FROZEN_LIFE, nut: [250, 96, 3.0, 2.6, 15.2, 1.7], alg: [['なし'], ['大豆', '鶏肉']],
    desc: '7種類の野菜と豆をトマトで煮込んだ、具だくさんのスープです。',
    raw: 'トマト、玉ねぎ、キャベツ、人参、セロリ、ひよこ豆、チキンブイヨン、オリーブ油、食塩', add: '調味料（アミノ酸等）',
    wh: 'K', course: 'S', sup: [['SP00001', 224, 6, '']], mats: ['S002'], ship: FROZEN_SHIP },
  { id: 'M021', name: 'まろやかプリン', kana: 'マロヤカプリン', cat: '飲料・甘味', temp: '冷蔵', price: 100, tags: [], vm: 'S',
    life: CHILL_LIFE, nut: [90, 128, 3.4, 5.6, 16.2, 0.1], alg: [['卵', '乳'], ['ゼラチン']],
    desc: '卵と牛乳をたっぷり使った、なめらかな口どけのプリンです。',
    raw: '牛乳、砂糖、卵、生クリーム（乳成分を含む）、カラメルソース、ゼラチン', add: '香料',
    wh: 'KSC', course: 'LS', sup: [['SP00005', 122, 12, '']], mats: ['S002'] },
  { id: 'M022', name: 'ほうじ茶ラテ', kana: 'ホウジチャラテ', cat: '飲料・甘味', temp: '常温', price: 100, tags: [], vm: 'S',
    life: [9, 'ヶ月', '対象外', '製造日から12ヶ月'], nut: [200, 118, 3.6, 3.8, 17.4, 0.2], alg: [['乳'], ['大豆']],
    desc: '香ばしいほうじ茶にミルクを合わせた、ほっと一息つける飲み物です。',
    raw: '牛乳、砂糖、ほうじ茶、全粉乳、デキストリン', add: '乳化剤、香料、カラメル色素',
    wh: 'KSC', course: 'LS', sup: [['SP00005', 110, 24, '']] },
  { id: 'M023', name: 'マドレーヌ', kana: 'マドレーヌ', cat: '飲料・甘味', temp: '常温', price: 100, tags: ['再登場'], vm: 'B',
    life: [60, '日', '対象外', '製造日から90日'], nut: [35, 158, 2.2, 8.6, 18.0, 0.1], alg: [['小麦', '卵', '乳'], ['アーモンド']],
    desc: 'バターの香りがふんわり広がる、しっとり焼き上げたマドレーヌです。',
    raw: '小麦粉、砂糖、卵、バター（乳成分を含む）、アーモンドパウダー、はちみつ', add: '膨張剤、香料',
    wh: 'K', course: 'LS', sup: [['SP00005', 104, 20, '']] },
  { id: 'M024', name: 'プロテインバー チョコ', kana: 'プロテインバーチョコ', cat: '飲料・甘味', temp: '常温', price: 100, tags: ['NEW'], vm: 'B',
    life: [6, 'ヶ月', '対象外', '製造日から9ヶ月'], nut: [40, 196, 15.2, 9.8, 13.6, 0.3], alg: [['乳'], ['大豆', 'アーモンド']],
    desc: '1本でたんぱく質15gがとれる、チョコレート味のバーです。',
    raw: '乳たんぱく、大豆パフ、チョコレート（乳成分を含む）、アーモンド、砂糖', add: '乳化剤（大豆由来）、香料', note: '1本入',
    wh: 'K', course: 'LS', sup: [['SP00005', 114, 20, '']] },
  { id: 'M025', name: '鶏の唐揚げ', kana: 'トリノカラアゲ', cat: '肉', temp: '冷蔵', price: 200, tags: ['NEW'], vm: null,
    life: [5, '日', 'ショート', '製造日から6日'], nut: [130, 318, 19.6, 20.4, 12.8, 1.7], alg: [['小麦'], ['鶏肉', '大豆', 'ごま']],
    desc: 'しょうゆとにんにくで下味をつけた鶏もも肉を、からっと揚げました。',
    raw: '鶏肉（国産）、小麦粉、でん粉、しょうゆ（小麦・大豆を含む）、にんにく、しょうが、ごま油、植物油脂', add: '調味料（アミノ酸等）',
    wh: 'KS', course: 'LS', sup: [['SP00001', 247, 12, '']], mats: ['S001'] },
  { id: 'M026', name: 'ぶりの照り焼き', kana: 'ブリノテリヤキ', cat: '魚', temp: '冷蔵', price: 200, tags: ['NEW'], vm: null,
    life: CHILL_LIFE, nut: [110, 236, 18.2, 12.6, 10.8, 1.6], alg: [['小麦'], ['大豆']],
    desc: '脂ののったぶりを、甘辛い照り焼きのたれで香ばしく焼き上げました。',
    raw: 'ぶり（国産）、しょうゆ（小麦・大豆を含む）、砂糖、みりん、清酒', add: '増粘剤（加工でんぷん）',
    wh: 'KS', course: 'LS', sup: [['SP00003', 258, 6, '']], mats: ['S001'] },
  { id: 'M027', name: '親子丼', kana: 'オヤコドン', cat: '主食', temp: '冷凍', price: 200, tags: ['NEW'], vm: null,
    life: FROZEN_LIFE, nut: [300, 498, 21.4, 12.8, 72.6, 2.6], alg: [['小麦', '卵'], ['鶏肉', '大豆']],
    desc: '鶏肉と玉ねぎをふんわり卵でとじた、だしの効いた親子丼です。',
    raw: 'うるち米（国産）、鶏肉、卵、玉ねぎ、しょうゆ（小麦・大豆を含む）、砂糖、かつおだし', add: '調味料（アミノ酸等）、増粘剤（加工でんぷん）',
    wh: 'K', course: 'S', sup: [['SP00001', 256, 6, '']], mats: ['S001'], ship: FROZEN_SHIP },
  { id: 'M028', name: 'クロワッサン', kana: 'クロワッサン', cat: '主食', temp: '常温', price: 100, tags: [], vm: null,
    life: [3, '日', 'ショート', '製造日から3日'], nut: [80, 334, 6.2, 19.8, 32.4, 0.9], alg: [['小麦', '卵', '乳'], ['大豆']],
    desc: 'バターを折り込んで焼き上げた、さくさくのクロワッサン（2個入）です。',
    raw: '小麦粉、バター（乳成分を含む）、砂糖、卵、イースト、食塩', add: '乳化剤、イーストフード',
    wh: 'KS', course: 'LS', sup: [['SP00005', 108, 12, '']], ship: ['OPP袋封入'], note: '2個入' },
  { id: 'M029', name: 'コーンポタージュ', kana: 'コーンポタージュ', cat: '汁物', temp: '常温', price: 100, tags: ['再登場'], vm: null,
    life: AMB_LIFE, nut: [180, 112, 2.4, 4.6, 15.6, 1.3], alg: [['乳'], ['大豆', '鶏肉']],
    desc: '北海道産のスイートコーンを裏ごしした、なめらかなポタージュです。',
    raw: 'スイートコーン（北海道）、牛乳、玉ねぎ、バター、チキンブイヨン、食塩', add: '増粘剤（キサンタン）',
    wh: 'KS', course: 'LS', sup: [['SP00001', 106, 10, '']], mats: ['S002'], ship: ['天地無用'] },
  { id: 'M030', name: 'オレンジジュース', kana: 'オレンジジュース', cat: '飲料・甘味', temp: '常温', price: 100, tags: [], vm: null,
    life: [9, 'ヶ月', '対象外', '製造日から12ヶ月'], nut: [200, 84, 1.4, 0.0, 21.0, 0.0], alg: [['なし'], ['オレンジ']],
    desc: '果汁100%のすっきりした味わいのオレンジジュースです。',
    raw: 'オレンジ（ブラジル）', add: '香料',
    wh: 'KS', course: 'LS', sup: [['SP00005', 99, 24, '']] },
  { id: 'M031', name: 'わかめごはん', kana: 'ワカメゴハン', cat: '主食', temp: '冷凍', price: 200, tags: [], vm: null,
    life: FROZEN_LIFE, nut: [180, 276, 5.0, 1.0, 60.4, 1.4], alg: [['なし'], []],
    desc: '国産わかめを混ぜ込んだ、やさしい塩味のごはんです。',
    raw: 'うるち米（国産）、わかめ、食塩、昆布エキス', add: '',
    wh: 'K', course: 'S', sup: [['SP00005', 220, 6, '']], mats: ['S001'], ship: FROZEN_SHIP },
  { id: 'M032', name: 'かぼちゃのサラダ', kana: 'カボチャノサラダ', cat: 'サラダ・果物', temp: '冷蔵', price: 100, tags: [], vm: null,
    life: [5, '日', 'ショート', '製造日から6日'], nut: [100, 134, 2.0, 6.8, 16.6, 0.6], alg: [['卵', '乳'], ['大豆', 'りんご']],
    desc: 'ほっくり甘いかぼちゃに、クリームチーズとレーズンを合わせました。',
    raw: 'かぼちゃ（国産）、マヨネーズ（卵・大豆・りんごを含む）、クリームチーズ（乳成分を含む）、レーズン、食塩', add: '',
    wh: 'K', course: 'LS', sup: [['SP00005', 116, 12, '']], mats: ['S003'] },
];

const r1 = (n: number) => Math.round(n * 10) / 10;
/** 100g当たりは見本の1食当たりの値から出し、1食当たりは 100g当たり × 内容量 で出し直す（RD-MN-118。画面・保存と同じ perServingOf） */
function nutrition(s: Spec): Product['nutrition'] {
  const [g, kcal, protein, fat, carbs, salt] = s.nut;
  const k = 100 / g;
  const from = { kcal: r1(kcal * k), protein: r1(protein * k), fat: r1(fat * k), carbs: r1(carbs * k), salt: r1(salt * k) };
  /* 5項目は範囲（from〜to。台帳 F 2026-10-08）。見本は to＝from、NUT_RANGE の商品だけ幅がある */
  const per100g: Nutrition = { servingG: g, ...from, other: s.other ?? '', to: { ...from, ...NUT_RANGE[s.id] } };
  return { per100g, perServing: perServingOf(per100g) };
}
/** 栄養成分（100g当たり）に幅がある見本の to */
const NUT_RANGE: Record<string, Partial<Record<NutKey, number>>> = { M001: { kcal: 170, fat: 9.5 } };
/** JAN を2つ以上持つ見本（先頭は jan(品番)。台帳 F 2026-10-08：1つの商品に複数の JAN） */
const MORE_JANS: Record<string, string[]> = { M001: [jan('M901')] };

/*
 * 商品名の4種類（2026/10/03 決定）。公開名（日本語）＝Spec の name。
 * 仕入先向けの名前は運営の発注の見本（lib/ops/purchasing/master.json の pname＝仕入時の商品名・決定 R12）と同じ。管理名は長い名前だけ短くした
 */
const MGMT: Record<string, string> = { M011: 'ビーフカレー甘口', M016: '季節野菜ピクルス3種' };
const SUP_NAME: Record<string, string> = {
  M011: 'ビーフカレー甘口 200g（レトルト）', M013: '鮭おにぎり（関東）', M015: 'ポテトサラダ 80g', M016: '季節野菜ピクルス3種 70g', M022: 'ほうじ茶ラテ 250ml', M028: 'クロワッサン 2個入',
};
const NAME_EN: Record<string, string> = {
  M001: 'Simmered Beef and Burdock', M002: 'Hamburg Steak with Demi-glace Sauce', M003: 'Chicken Sauté with Cheese', M004: 'Ginger Pork',
  M005: 'Salt-grilled Trout Salmon', M006: 'Mackerel Simmered in Miso', M007: 'Sardines in Tomato Basil Sauce', M008: 'Simmered Dried Daikon with Vegetables',
  M009: 'Simmered Hijiki Seaweed', M010: 'Cabbage Rolls in Cream Sauce', M011: "Chef's Beef Curry (Mild)", M012: 'Shiso and Kelp Mixed Rice',
  M013: 'Salmon Rice Ball', M014: 'Mixed Sandwich', M015: 'Classic Potato Salad', M016: 'Seasonal Vegetable Pickles (Zucchini, Carrot, Paprika)',
  M017: 'Cut Pineapple', M018: 'Hearty Pork Miso Soup', M019: 'Clam Miso Soup', M020: 'Vegetable Minestrone',
  M021: 'Smooth Custard Pudding', M022: 'Roasted Green Tea Latte', M023: 'Madeleine', M024: 'Protein Bar (Chocolate)',
  M025: 'Fried Chicken (Karaage)', M026: 'Teriyaki Yellowtail', M027: 'Chicken and Egg Rice Bowl (Oyakodon)', M028: 'Croissant',
  M029: 'Corn Potage', M030: 'Orange Juice', M031: 'Wakame Seaweed Rice', M032: 'Pumpkin Salad',
};

function product(s: Spec): Product {
  const suppliers: ProductSupplier[] = s.sup.map(([supplierId, unitCostYen, lot, note], i) => ({ supplierId, unitCostYen, lot, note, selected: i === 0 }));
  const storage = s.temp === '資材' ? '常温' : s.temp;
  const [esValue, esUnit, shortClass, maker] = s.life;
  return {
    id: s.id, name: s.name, kana: s.kana, mgmtName: MGMT[s.id] ?? s.name, nameEn: NAME_EN[s.id] ?? '', supplierItemName: SUP_NAME[s.id] ?? s.name,
    jan: jan(s.id), jans: [jan(s.id), ...(MORE_JANS[s.id] ?? [])], category: s.cat, categoryId: PRODUCT_CATEGORIES.find((c) => c.name === s.cat)?.id, temp: s.temp, priceYen: s.price, taxRateId: 'TX01', note: s.note ?? '',
    images: [{ file: `products/${s.id}-1.jpg`, main: true }, { file: `products/${s.id}-2.jpg`, main: false }],
    description: s.desc, nutrition: nutrition(s), allergens: { specific: s.alg[0], equivalent: s.alg[1] },
    ingredients: s.raw, additives: s.add, makerUrl: MAKER[suppliers[0].supplierId] ?? '',
    courses: COURSE[s.course], storage: { admin: storage, display: storage },
    vending: s.vm ? { ...VM[s.vm], subColumns: [], note: s.vmNote ?? '' } : { columns: [], subColumns: [], models: [], note: '' },
    bundledMaterialIds: s.mats ?? [], shipInstructions: s.ship ?? [],
    shelfLife: { esValue, esUnit, maker, shortClass },
    suppliers, pickWarehouseIds: [...s.wh].map((c) => WH[c]), status: '有効',
    vmFrame: s.vm, supplierId: suppliers[0].supplierId,
  };
}

export const PRODUCTS: Product[] = SPECS.map(product);
/** 見本のメニューの商品ごとの商品タグの初期値（商品マスタには持たない：台帳 F 2026-10-08。NEW もほかのタグと同じ） */
export const SEED_MENU_TAGS: Record<string, string[]> = Object.fromEntries(SPECS.map((s) => [s.id, s.tags]));
/* 仕入単価の改定の見本（RD-MN-076）：M001 は仕入先の値上げで 2026/11/01 から 243 → 256円 */
PRODUCTS.find((p) => p.id === 'M001')!.suppliers[0].nextCost = { unitCostYen: 256, from: '2026/11/01' };

/* ---------------- 変更履歴 ---------------- */

const HIST: [string, string, string, string][] = [
  ['M001', '2026/08/20 15:32', '販売価格を「180 → 200」に変更', 'CSV取込'],
  ['M005', '2026/09/01 11:00', '栄養成分を更新', 'Ad00010'],
  ['M006', '2026/09/10 10:00', '仕入先を追加（SP00001 株式会社サンプル商事・予備）', 'Ad00010'],
  ['M015', '2026/09/10 10:05', '仕入先を追加（SP00001 株式会社サンプル商事・予備）', 'Ad00010'],
  ['M002', '2026/09/15 09:40', '備考を「電子レンジで温めるとよりおいしい（冷たいままでも可）」に変更', 'Ad00010'],
  ['M001', '2026/09/25 10:00', '仕入単価の改定を登録（SP00001：243 → 256円・2026/11/01 から）', 'Ad00010'],
];

/** 変更履歴：全商品の登録（CSV取込）と、見本の変更。M025〜M027 は 12月メニューのために 9月に登録 */
export const PRODUCT_HISTORY: ProductHistory[] = [
  ...PRODUCTS.map((p) => {
    const late = ['M025', 'M026', 'M027'].includes(p.id);
    return { productId: p.id, at: late ? '2026/09/20 14:00' : '2026/04/01 10:00', what: 'データ登録', by: late ? 'Ad00010' : 'CSV取込' };
  }),
  ...HIST.map(([productId, at, what, by]) => ({ productId, at, what, by })),
].map((h) => h as Omit<ProductHistory, 'id'>)
  .reduce<ProductHistory[]>((out, h) => {
    const n = out.filter((x) => x.productId === h.productId).length + 1;
    out.push({ ...h, id: `PH-${h.productId}-${String(n).padStart(3, '0')}` });
    return out;
  }, []);
