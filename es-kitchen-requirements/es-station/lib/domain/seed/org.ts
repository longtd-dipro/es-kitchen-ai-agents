import type { Address, Billing, Branch, Channel, Contact, Contract, ContractKind, ContractPricing, Corp, Course, Loan, Pause } from '../types';
import { PRODUCTS } from './products';

/*
 * 法人・拠点・契約の見本。
 * 株式会社サンプル（CU00001）と5拠点・ほかの法人は 01_仕様/90_デモ確認/共通サンプルデータ_20261002.md と
 * 運営の見本（lib/ops/contracts/seed.ts）と同じ ID・値。
 * ★印（ひかり物産・ことぶき商会の拠点 CU019xx）は、ドライバー・委託配送先の画面に「今日」（10/05〜）の配送を出すために足した見本。
 * 大阪キッチン株式会社（CU00003・淀屋橋ES CU00671・CP0000051）は運営の請求の見本（C3）と同じ法人：当月請求（リードタイム 0）・拠点ごと発行。
 *   シナリオ説明書 ⑩ の「大阪キッチン（C3）あての請求書は1回目の送信がタイムアウト」の見本（課題 4-11 で戻した話）。
 * 名古屋営業所の休止：2026年10月〜12月サイクル・再開 2027年1月・設備は置いたまま・休止の前に約2ヶ月使用。デモの今日は休止予定（10/12 から）。
 */

const a = (zip: string, pref: string, city: string, addr1: string, addr2 = ''): Address => ({ zip, pref, city, addr1, addr2 });

const BILL_CORP: Billing = { lead: -1, invoiceUnit: 'まとめて発行（法人1通）', payMethod: '口座振替', debitStatus: '完了', payCycle: '月払い', dueRule: '請求月の27日', billonePayerId: '' };
const billing = (over: Partial<Billing>): Billing => ({ ...BILL_CORP, ...over });

export const CORPS: Corp[] = [
  {
    id: 'CU00001', name: '株式会社サンプル', contractName: '株式会社サンプルホールディングス', kana: 'カブシキガイシャサンプル', billToName: '株式会社サンプル 経理部',
    status: '正式登録', salesRepId: 'Ad00001', address: a('105-0011', '東京都', '港区', '芝公園2-4-1', '芝パークビル8F'), tel: '03-5401-2200', fax: '03-5401-2201',
    billing: billing({ billonePayerId: 'BO-778201' }), registeredAt: '2026/02/20 10:00',
  },
  {
    id: 'CU00012', name: '株式会社みらい商事', contractName: '株式会社みらい商事', kana: 'カブシキガイシャミライショウジ', billToName: '株式会社みらい商事',
    status: '正式登録', salesRepId: 'Ad00002', address: a('450-0003', '愛知県', '名古屋市中村区', '名駅南1-1-1'), tel: '052-000-0012', fax: '',
    billing: billing({ invoiceUnit: '拠点ごと発行', payMethod: '銀行振込', debitStatus: '', billonePayerId: 'BO-778212' }), registeredAt: '2026/08/10 14:00',
  },
  {
    id: 'CU00071', name: '株式会社みちのく商事', contractName: '株式会社みちのく商事', kana: 'カブシキガイシャミチノクショウジ', billToName: '株式会社みちのく商事',
    status: '正式登録', salesRepId: 'Ad00002', address: a('980-0021', '宮城県', '仙台市青葉区', '中央1-1-1'), tel: '022-000-0071', fax: '',
    billing: billing({ invoiceUnit: '拠点ごと発行', payMethod: '銀行振込', debitStatus: '', billonePayerId: 'BO-778271' }), registeredAt: '2026/09/01 11:00',
  },
  {
    id: 'CU00020', name: '株式会社あおば工業', contractName: '株式会社あおば工業', kana: 'カブシキガイシャアオバコウギョウ', billToName: '株式会社あおば工業',
    status: '仮登録', salesRepId: 'Ad00002', address: a('983-0001', '宮城県', '仙台市宮城野区', '港1-2-3'), tel: '022-000-0020', fax: '',
    billing: billing({ debitStatus: '未手続き' }), registeredAt: '2026/09/30 16:20',
  },
  {
    id: 'CU00031', name: '株式会社ひかり物産', contractName: '株式会社ひかり物産', kana: 'カブシキガイシャヒカリブッサン', billToName: '株式会社ひかり物産 総務部',
    status: '正式登録', salesRepId: 'Ad00003', address: a('101-0047', '東京都', '千代田区', '内神田2-3-4'), tel: '03-0000-0031', fax: '',
    billing: billing({ billonePayerId: 'BO-778231' }), registeredAt: '2026/07/01 10:00',
  },
  {
    id: 'CU00044', name: '株式会社ことぶき商会', contractName: '株式会社ことぶき商会', kana: 'カブシキガイシャコトブキショウカイ', billToName: '株式会社ことぶき商会',
    status: '正式登録', salesRepId: 'Ad00001', address: a('330-0802', '埼玉県', 'さいたま市大宮区', '宮町1-5'), tel: '048-000-0044', fax: '',
    billing: billing({ invoiceUnit: '拠点ごと発行', billonePayerId: 'BO-778244' }), registeredAt: '2026/07/10 10:00',
  },
  {
    id: 'CU00003', name: '大阪キッチン株式会社', contractName: '大阪キッチン株式会社', kana: 'オオサカキッチンカブシキガイシャ', billToName: '大阪キッチン株式会社',
    status: '正式登録', salesRepId: 'Ad00001', address: a('541-0042', '大阪府', '大阪市中央区', '淀屋橋1-5-9'), tel: '06-6200-3300', fax: '06-6200-3301',
    /* 当月請求（リードタイム 0）・拠点ごと発行（運営の請求の見本 C3） */
    billing: billing({ lead: 0, invoiceUnit: '拠点ごと発行', payMethod: '銀行振込', debitStatus: '', billonePayerId: 'BO-778203' }), registeredAt: '2026/04/10 10:00',
  },
  {
    id: 'CU00052', name: '株式会社さくら建設', contractName: '株式会社さくら建設', kana: 'カブシキガイシャサクラケンセツ', billToName: '株式会社さくら建設',
    status: '休眠', salesRepId: 'Ad00003', address: a('104-0061', '東京都', '中央区', '銀座1-1-1'), tel: '03-0000-0052', fax: '',
    billing: billing({ billonePayerId: 'BO-778252' }), registeredAt: '2019/07/01 10:00',
  },
  /* 取消の見本（取消の仮登録の申込から作った法人。配下の拠点なし。参照のみ・灰・法人一覧に既定で出す：台帳 F 2026-10-06 運営A (1)） */
  {
    id: 'CU01340', name: 'サンプル 取消法人', contractName: 'サンプル 取消法人 株式会社', kana: 'サンプル トリケシホウジン', billToName: 'サンプル 取消法人',
    status: '取消', salesRepId: 'Ad00002', address: a('460-0008', '愛知県', '名古屋市中区', '栄1-1-1'), tel: '052-000-1340', fax: '',
    billing: billing({ debitStatus: '未手続き' }), registeredAt: '2026/09/20 15:00',
  },
];

const win = (...w: [string, string][]) => w.map(([from, to]) => ({ from, to }));
const br = (b: Omit<Branch, 'fax' | 'note' | 'receiveWindows' | 'deliveryNote'> & Partial<Branch>): Branch => ({
  fax: '', note: '', receiveWindows: win(['09:00', '12:00'], ['13:00', '17:00']), deliveryNote: '', ...b,
});

export const BRANCHES: Branch[] = [
  br({ id: 'CU00643', corpId: 'CU00001', name: '株式会社サンプル 本社', kana: 'カブシキガイシャサンプル ホンシャ', status: '本登録', employees: 100, originalStartOn: '2026/02/23',
    address: a('105-0011', '東京都', '港区', '芝公園2-4-1', '芝パークビル8F'), tel: '03-5401-2200', fax: '03-5401-2201', deliveryNote: '8F 社員食堂横に設置', registeredAt: '2026/02/20 10:10' }),
  br({ id: 'CU00871', corpId: 'CU00001', name: '株式会社サンプル 大阪支店', kana: 'カブシキガイシャサンプル オオサカシテン', status: '本登録', employees: 46, originalStartOn: '2026/04/27',
    address: a('530-0001', '大阪府', '大阪市北区', '梅田1-11-4', '大阪駅前第4ビル12F'), tel: '06-6344-1100', receiveWindows: win(['10:00', '12:00'], ['13:00', '16:00']), deliveryNote: '12F 受付で入館証を受け取る', registeredAt: '2026/04/15 09:30' }),
  br({ id: 'CU00902', corpId: 'CU00001', name: '株式会社サンプル 名古屋営業所', kana: 'カブシキガイシャサンプル ナゴヤエイギョウショ', status: '本登録', employees: 28, originalStartOn: '2026/08/18',
    address: a('450-0002', '愛知県', '名古屋市中村区', '名駅3-28-12', '大名古屋ビル5F'), tel: '052-551-3300', fax: '052-551-3301', note: '改装のため 2026年10月〜12月サイクルは休止（設備は置いたまま）', registeredAt: '2026/08/03 10:00' }),
  br({ id: 'CU00961', corpId: 'CU00001', name: '株式会社サンプル 千葉営業所', kana: 'カブシキガイシャサンプル チバエイギョウショ', status: '本登録', employees: 22, originalStartOn: '2026/05/25',
    address: a('260-0028', '千葉県', '千葉市中央区', '新町1-1-1'), tel: '043-000-0961', registeredAt: '2026/05/12 10:00' }),
  br({ id: 'CU00950', corpId: 'CU00001', name: '株式会社サンプル 横浜営業所', kana: 'カブシキガイシャサンプル ヨコハマエイギョウショ', status: '本登録', employees: 60, originalStartOn: '2026/06/15',
    address: a('220-0011', '神奈川県', '横浜市西区', '高島2-1-1'), tel: '045-000-0950', registeredAt: '2026/06/01 10:00' }),
  br({ id: 'CU00975', corpId: 'CU00071', name: '株式会社みちのく商事 仙台本社', kana: 'カブシキガイシャミチノクショウジ センダイホンシャ', status: '本登録', employees: 35, originalStartOn: '2026/10/12',
    address: a('980-0021', '宮城県', '仙台市青葉区', '中央1-1-1'), tel: '022-000-0975', registeredAt: '2026/09/01 11:10' }),
  br({ id: 'CU00701', corpId: 'CU00012', name: '株式会社みらい商事 名古屋本社', kana: 'カブシキガイシャミライショウジ ナゴヤホンシャ', status: '本登録', employees: 40, originalStartOn: '2026/09/14',
    address: a('450-0003', '愛知県', '名古屋市中村区', '名駅南1-1-1'), tel: '052-000-0701', registeredAt: '2026/08/10 14:10' }),
  br({ id: 'CU01012', corpId: 'CU00020', name: '株式会社あおば工業 仙台工場', kana: 'カブシキガイシャアオバコウギョウ センダイコウジョウ', status: '仮登録', employees: 150, originalStartOn: '',
    address: a('983-0001', '宮城県', '仙台市宮城野区', '港1-2-3'), tel: '022-000-1012', registeredAt: '2026/09/30 16:30' }),
  br({ id: 'CU00671', corpId: 'CU00003', name: '大阪キッチン株式会社 淀屋橋ES', kana: 'オオサカキッチンカブシキガイシャ ヨドヤバシイーエス', status: '本登録', employees: 120, originalStartOn: '2026/04/28',
    address: a('541-0042', '大阪府', '大阪市中央区', '淀屋橋1-5-9', '3F'), tel: '06-6200-3300', fax: '06-6200-3301', receiveWindows: win(['10:00', '12:00'], ['13:00', '16:00']), deliveryNote: '3F 総務で受付', registeredAt: '2026/04/10 10:10' }),
  br({ id: 'CU01310', corpId: null, name: 'カフェ花 横浜店', kana: 'カフェハナ ヨコハマテン', status: '閉鎖予定', employees: 12, originalStartOn: '2024/06/24',
    address: a('231-0062', '神奈川県', '横浜市中区', '桜木町1-1'), tel: '045-000-1310', note: '10月サイクルで解約', registeredAt: '2024/06/01 10:00' }),
  br({ id: 'CU00588', corpId: 'CU00052', name: '株式会社さくら建設 本社', kana: 'カブシキガイシャサクラケンセツ ホンシャ', status: '閉鎖', employees: 0, originalStartOn: '2019/07/22',
    address: a('104-0061', '東京都', '中央区', '銀座1-1-1'), tel: '03-0000-0588', registeredAt: '2019/07/01 10:00' }),
  /* 取消の見本（取消の申込から開いた拠点。親契約も取消。法人は有効のまま。参照のみの画面・付け替え不可の確認用：台帳 F 2026-10-06 運営A） */
  br({ id: 'CU01320', corpId: 'CU00001', name: 'サンプル 取消支店', kana: 'サンプル トリケシシテン', status: '取消', employees: 0, originalStartOn: '',
    address: a('105-0011', '東京都', '港区', '芝公園2-4-1', '芝パークビル9F'), tel: '03-5401-2290', registeredAt: '2026/09/28 15:00' }),
  /* 付け替えの見本（本登録・親契約が有効・発行済み請求書なし・承認待ちの申請なし → 「所属法人の付け替え」が押せる。台帳 F 運営A）。法人は稼働中の CU00044（休眠の CU00052 の下に本登録の拠点を置くと、法人ステータスと食い違う。CU00052 は閉鎖の CU00588 だけ＝休眠の見本。付け替え先に CU00052 を選ぶと正式登録に戻る） */
  br({ id: 'CU01330', corpId: 'CU00044', name: 'サンプル 付け替え支店', kana: 'サンプル ツケカエシテン', status: '本登録', employees: 18, originalStartOn: '2026/11/16',
    address: a('104-0061', '東京都', '中央区', '銀座1-1-2'), tel: '03-0000-1330', registeredAt: '2026/10/01 10:00' }),
  /* ★ 配送の見本（ドライバー・委託配送先の画面用） */
  br({ id: 'CU01901', corpId: 'CU00031', name: '株式会社ひかり物産 本社', kana: 'カブシキガイシャヒカリブッサン ホンシャ', status: '本登録', employees: 90, originalStartOn: '2026/07/20',
    address: a('101-0047', '東京都', '千代田区', '内神田2-3-4', 'ひかりビル3F'), tel: '03-0000-1101', deliveryNote: '3F 休憩室', registeredAt: '2026/07/01 10:10' }),
  br({ id: 'CU01902', corpId: 'CU00031', name: '株式会社ひかり物産 川崎工場', kana: 'カブシキガイシャヒカリブッサン カワサキコウジョウ', status: '本登録', employees: 45, originalStartOn: '2026/07/20',
    address: a('210-0858', '神奈川県', '川崎市川崎区', '大川町8-1'), tel: '044-000-1102', receiveWindows: win(['08:30', '11:30']), deliveryNote: '守衛室で受付', registeredAt: '2026/07/01 10:20' }),
  br({ id: 'CU01903', corpId: 'CU00044', name: '株式会社ことぶき商会 本店', kana: 'カブシキガイシャコトブキショウカイ ホンテン', status: '本登録', employees: 30, originalStartOn: '2026/07/20',
    address: a('330-0802', '埼玉県', 'さいたま市大宮区', '宮町1-5'), tel: '048-000-1121', registeredAt: '2026/07/10 10:10' }),
  br({ id: 'CU01904', corpId: 'CU00044', name: '株式会社ことぶき商会 横浜倉庫', kana: 'カブシキガイシャコトブキショウカイ ヨコハマソウコ', status: '本登録', employees: 25, originalStartOn: '2026/07/20',
    address: a('236-0003', '神奈川県', '横浜市金沢区', '幸浦2-2'), tel: '045-000-1122', receiveWindows: win(['13:00', '17:00']), registeredAt: '2026/07/10 10:20' }),
];

const ct = (c: Omit<Contract, 'kindHistory' | 'endOn' | 'agencyId' | 'billing'> & Partial<Contract>): Contract => ({
  kindHistory: [{ kind: c.kind, from: c.startCycle }], endOn: '', agencyId: '', billing: null, ...c,
});

export const CONTRACTS: Contract[] = [
  ct({ id: 'CP0000001', branchId: 'CU00643', kind: '本導入', status: '有効', startCycle: '2026-03', agencyId: 'AG00021', billTo: '法人' }),
  /* 紹介元の代理店は法人に1つ（シナリオ説明書 ⑱・S7-21）：大阪支店も本社と同じ AG00021 */
  ct({ id: 'CP0000002', branchId: 'CU00871', kind: '本導入', status: '有効', startCycle: '2026-05', agencyId: 'AG00021', billTo: '法人' }),
  /*
   * 名古屋：10月〜12月サイクルは休止（再開 2027年1月）。規則どおり、デモの今日（10/05）はまだ「有効」（10/12＝2026-10 サイクルの A1 から休止予定）。
   * 10/12 以降に日次バッチ（lifecycle の dailyTick）で「利用休止」になる（受付簿 No.52・2026-10-05）。9月サイクルの便は 9/16 で終わり
   */
  ct({ id: 'CP0000003', branchId: 'CU00902', kind: '本導入', status: '有効', startCycle: '2026-08', billTo: 'この拠点',
    billing: billing({ invoiceUnit: '拠点ごと発行', payMethod: '銀行振込', debitStatus: '', billonePayerId: 'BO-00902' }) }),
  ct({ id: 'CP0000004', branchId: 'CU00950', kind: '本導入', status: '有効', startCycle: '2026-07', billTo: 'この拠点',
    billing: billing({ invoiceUnit: '拠点ごと発行', billonePayerId: 'BO-00950' }) }),
  ct({ id: 'CP0000005', branchId: 'CU00588', kind: '本導入', status: '終了', startCycle: '2019-08', endOn: '2025/03/31', agencyId: 'AG00009', billTo: '法人' }),
  ct({ id: 'CP0000008', branchId: 'CU01330', kind: '本導入', status: '有効', startCycle: '2026-11', billTo: '法人' }),
  ct({ id: 'CP0000007', branchId: 'CU01320', kind: '本導入', status: '取消', startCycle: '2026-11', billTo: '法人' }),
  ct({ id: 'CP0000006', branchId: 'CU00961', kind: '本導入', status: '有効', startCycle: '2026-06', billTo: 'この拠点',
    billing: billing({ invoiceUnit: '拠点ごと発行', billonePayerId: 'BO-00961' }) }),
  /* 淀屋橋ES：年払い（シナリオ説明書 ⑬ の「2026年4月サイクルから契約した拠点。起算月は4月、12サイクル分を1通で請求」・S3-1）。当月請求（リードタイム 0） */
  ct({ id: 'CP0000051', branchId: 'CU00671', kind: '本導入', status: '有効', startCycle: '2026-04', billTo: 'この拠点',
    billing: billing({ lead: 0, invoiceUnit: '拠点ごと発行', payMethod: '銀行振込', debitStatus: '', payCycle: '年払い', billonePayerId: 'BO-00671' }) }),
  ct({ id: 'CP0000010', branchId: 'CU00701', kind: 'お試しキャンペーン', status: '有効', startCycle: '2026-09', billTo: '法人' }),
  /* お試し 10月〜11月サイクル＝当初1ヶ月（10月）＋1ヶ月延長（11月）。延長の日時・担当は見本（共通サンプルデータには書いていない） */
  ct({ id: 'CP0000012', branchId: 'CU00975', kind: 'お試しキャンペーン', status: '有効', startCycle: '2026-10', billTo: 'この拠点',
    billing: billing({ invoiceUnit: '拠点ごと発行', payMethod: '銀行振込', debitStatus: '', billonePayerId: 'BO-00975' }),
    trialExt: [{ at: '2026/09/30 10:00', by: 'Ad00012', months: 1, fromCycle: '2026-11', toCycle: '2026-11', note: 'お試しの延長（見本）', childIds: ['CP0000012-202611'] }] }),
  ct({ id: 'CP0000021', branchId: 'CU01012', kind: '本導入', status: '仮登録', startCycle: '2026-11', agencyId: 'AG00102', billTo: '法人' }),
  ct({ id: 'CP0000030', branchId: 'CU01310', kind: '本導入', status: '解約手続き中', startCycle: '2024-07', endOn: '2026/11/08', agencyId: 'AG00034', billTo: 'この拠点',
    billing: billing({ invoiceUnit: '拠点ごと発行', payMethod: 'クレジットカード', debitStatus: '', billonePayerId: 'BO-01310' }) }),
  ct({ id: 'CP0000091', branchId: 'CU01901', kind: '本導入', status: '有効', startCycle: '2026-08', billTo: '法人' }),
  ct({ id: 'CP0000092', branchId: 'CU01902', kind: '本導入', status: '有効', startCycle: '2026-08', billTo: '法人' }),
  ct({ id: 'CP0000093', branchId: 'CU01903', kind: '本導入', status: '有効', startCycle: '2026-08', billTo: 'この拠点', billing: billing({ invoiceUnit: '拠点ごと発行', billonePayerId: 'BO-01121' }) }),
  ct({ id: 'CP0000094', branchId: 'CU01904', kind: '本導入', status: '有効', startCycle: '2026-08', billTo: 'この拠点', billing: billing({ invoiceUnit: '拠点ごと発行', billonePayerId: 'BO-01122' }) }),
];

/*
 * 子契約の元（サイクルごとに同じ中身で作る。delivery の見本はここの channels から作る）。
 * cycles＝子契約を作るサイクル月。slots は配送の枠（ピッキングしない枠 A6・A7・B4〜B7・C6・C7・D4〜D7 の翌日には置かない）
 */
export type ChildPlan = {
  contractId: string;
  cycles: string[];
  kind?: ContractKind;
  planId: string;
  course: Course;
  channels: Channel[];
  optionIds?: string[];
  discountIds?: string[];
  monthlyYen: number;
  allowEsqr?: boolean;
  /** アプリの現金利用（ドライバーが集金する） */
  allowCash?: boolean;
  /** 商品の価格と精算（省くと 通常価格・従量） */
  pricing?: ContractPricing;
};

/** 通常価格・従量（商品マスタの販売価格で、売れた数だけ請求） */
export const NORMAL_PRICING: ContractPricing = { mode: '通常価格', billing: '従量', prices: {} };
/**
 * ことぶき商会 本店の企業独自価格（買取）：関東倉庫のライトの商品（冷凍以外）を販売価格の 9割（税込・10円単位）で。
 * 届けた数 × この価格で請求し、売れ残りは企業の負担
 */
const KOTOBUKI_PRICING: ContractPricing = {
  mode: '企業独自価格', billing: '買取',
  prices: Object.fromEntries(PRODUCTS.filter((p) => p.temp !== '冷凍' && p.courses.includes('ライト') && p.pickWarehouseIds.includes('WH00001'))
    .map((p) => [p.id, Math.round((p.priceYen * 0.9) / 10) * 10])),
};

/* 配送会社②は常に入れる（中継しないときは①と同じ。2026/10/03） */
const ch = (c: Partial<Channel> & Pick<Channel, 'slots' | 'mealsPerDelivery' | 'warehouseId'>): Channel => {
  const x: Channel = { temp: '冷蔵', serviceForm: 'ES配送便', regime: 'self', hubId: '', carrierId: 'DE00000', carrier2Id: '', driverId: '', leadDays: 1, ...c };
  return { ...x, carrier2Id: x.carrier2Id || x.carrierId };
};
const cool = (c: Partial<Channel> & Pick<Channel, 'slots' | 'mealsPerDelivery' | 'warehouseId'>) =>
  ch({ serviceForm: 'COOL便', regime: 'parcel_carrier', carrierId: 'DE00002', ...c });
/**
 * 子契約を作るサイクル月。2026-12〜2027-03 は先行生成（請求は未確定。プランの変更・一括変更・価格世代を当てられる月）。
 * 承認済みの休止の月（PAUSES）は取消の子契約（buildChildContracts）
 */
const PAST = ['2026-09', '2026-10', '2026-11'];
const FUTURE = ['2026-12', '2027-01', '2027-02', '2027-03'];
const ALL = [...PAST, ...FUTURE];

export const CHILD_PLANS: ChildPlan[] = [
  /* 本社：100プラン ESライト（自販機）・ES配送便 A3・C3（水）。¥53,000＝48,000＋地域配送 4,000＋ES-QR 1,000 */
  { contractId: 'CP0000001', cycles: ALL, planId: 'ES000004', course: 'ESライト（自販機）', monthlyYen: 66000, optionIds: ['OP000004', 'OP000002'] /* 46,000（ライト（自販機）【仮】）＋地域配送料・ES-QR＋自販機リース 15,000 × 1台（OP000037 は syncLinked で付く） */, allowEsqr: true,
    channels: [ch({ warehouseId: 'WH00001', slots: ['A3', 'C3'], mealsPerDelivery: 50, driverId: 'DR00001' })] },
  /* 大阪支店：50プラン ESライト・関西倉庫→みどり便・月2回 25食（火 A2・C2）。¥27,500＝24,500＋配送回数の追加 3,000 */
  { contractId: 'CP0000002', cycles: ALL, planId: 'ES000003', course: 'ESライト（冷蔵庫）', monthlyYen: 27500, optionIds: ['OP000001'], allowCash: true,
    channels: [ch({ warehouseId: 'WH00002', regime: 'partner_driver', carrierId: 'DE00006', driverId: 'DR00041', slots: ['A2', 'C2'], mealsPerDelivery: 25 })] },
  /* 千葉営業所：COOL便（ヤマト）月2回 25食（A3・C3＝運営のメニューと同じ） */
  { contractId: 'CP0000006', cycles: ALL, planId: 'ES000003', course: 'ESライト（冷蔵庫）', monthlyYen: 24500,
    channels: [cool({ warehouseId: 'WH00001', slots: ['A3', 'C3'], mealsPerDelivery: 25 })] },
  /* 横浜営業所：100プラン ESスタンダード・COOL便 冷蔵2回（各40）・冷凍2回（各10）。枠は運営のメニュー（lib/ops/menu/data.ts）と同じ */
  { contractId: 'CP0000004', cycles: ALL, planId: 'ES000004', course: 'ESスタンダード', monthlyYen: 49500,
    channels: [
      cool({ warehouseId: 'WH00001', slots: ['A2', 'C2'], mealsPerDelivery: 40 }),
      cool({ warehouseId: 'WH00001', temp: '冷凍', slots: ['A2', 'C2'], mealsPerDelivery: 10 }),
    ] },
  /* 名古屋営業所：50プラン ESライト・中部倉庫→栄成ロジ・月1回 50食（水 A3）。10月〜12月サイクルは休止（子契約は取消）・2027年1月から再開 */
  { contractId: 'CP0000003', cycles: ALL, planId: 'ES000003', course: 'ESライト（冷蔵庫）', monthlyYen: 24500,
    channels: [ch({ warehouseId: 'WH00003', regime: 'partner_driver', carrierId: 'DE00001', driverId: 'DR00015', slots: ['A3'], mealsPerDelivery: 50 })] },
  /* 大阪キッチン 淀屋橋ES：200プラン ESライト（冷蔵庫）¥88,500・関西倉庫→みどり便 西村・月2回 100食（水 A3・C3） */
  { contractId: 'CP0000051', cycles: ALL, planId: 'ES000006', course: 'ESライト（冷蔵庫）', monthlyYen: 88500,
    channels: [ch({ warehouseId: 'WH00002', regime: 'partner_driver', carrierId: 'DE00006', driverId: 'DR00041', slots: ['A3', 'C3'], mealsPerDelivery: 100 })] },
  /*
   * みちのく商事 仙台本社：お試し 10月サイクル＋延長 11月サイクル・COOL便 月1回（後半の便）。
   * お試しの月だけお試しキャンペーン割引（DC000013）＝無料、延長の月は割引なし＝¥24,500 を請求（台帳 K1・受付簿 No.53）
   */
  { contractId: 'CP0000012', cycles: ['2026-10'], kind: 'お試しキャンペーン', planId: 'ES000003', course: 'ESライト（冷蔵庫）', monthlyYen: 24500, discountIds: ['DC000013'],
    channels: [cool({ warehouseId: 'WH00001', slots: ['C4'], mealsPerDelivery: 50, leadDays: 2 })] },
  { contractId: 'CP0000012', cycles: ['2026-11'], kind: 'お試しキャンペーン', planId: 'ES000003', course: 'ESライト（冷蔵庫）', monthlyYen: 24500,
    channels: [cool({ warehouseId: 'WH00001', slots: ['C4'], mealsPerDelivery: 50, leadDays: 2 })] },
  /* みらい商事 名古屋本社：お試し 9月〜10月サイクル・中部倉庫→栄成ロジ・月1回 */
  { contractId: 'CP0000010', cycles: ['2026-09', '2026-10'], kind: 'お試しキャンペーン', planId: 'ES000003', course: 'ESライト（冷蔵庫）', monthlyYen: 24500, discountIds: ['DC000013'],
    channels: [ch({ warehouseId: 'WH00003', regime: 'partner_driver', carrierId: 'DE00001', driverId: 'DR00015', slots: ['B3'], mealsPerDelivery: 50 })] },
  /* あおば工業 仙台工場：仮登録（配送はまだ作らない）。1回の納品数＝月次提供上限 150 ÷ 配送回数 4 の切り捨て（決定 28-153） */
  { contractId: 'CP0000021', cycles: ['2026-11'], planId: 'ES000005', course: 'ESスタンダード', monthlyYen: 71500,
    channels: [ch({ warehouseId: 'WH00001', regime: 'partner_driver', carrierId: 'DE00001', slots: ['A2', 'B2', 'C2', 'D2'], mealsPerDelivery: 37 })] },
  /* カフェ花 横浜店：解約手続き中（10月サイクルまで）・COOL便 月2回 */
  { contractId: 'CP0000030', cycles: ['2026-09', '2026-10'], planId: 'ES000003', course: 'ESライト（冷蔵庫）', monthlyYen: 24500,
    channels: [cool({ warehouseId: 'WH00001', slots: ['A2', 'C2'], mealsPerDelivery: 25 })] },
  /* ★ ひかり物産 本社：自社ドライバー 高橋 */
  { contractId: 'CP0000091', cycles: ALL, planId: 'ES000004', course: 'ESライト（冷蔵庫）', monthlyYen: 46000,
    channels: [ch({ warehouseId: 'WH00001', slots: ['B2', 'D2'], mealsPerDelivery: 50, driverId: 'DR00002' })] },
  /* ★ ひかり物産 川崎工場：関東倉庫→川崎デポ（栄成ロジ 山口）→拠点（栄成ロジ 斉藤）の2区間 */
  { contractId: 'CP0000092', cycles: ALL, planId: 'ES000003', course: 'ESライト（冷蔵庫）', monthlyYen: 24500,
    channels: [ch({ warehouseId: 'WH00001', regime: 'partner_driver', hubId: 'HU00301', carrierId: 'DE00001', carrier2Id: 'DE00001', driverId: 'DR00011', slots: ['B3', 'D3'], mealsPerDelivery: 25 })] },
  /* ★ ことぶき商会 本店：自社ドライバー 佐々木。企業独自価格（買取）＝届けた数 × 企業の価格で請求 */
  { contractId: 'CP0000093', cycles: ALL, planId: 'ES000003', course: 'ESライト（冷蔵庫）', monthlyYen: 24500, pricing: KOTOBUKI_PRICING,
    channels: [ch({ warehouseId: 'WH00001', slots: ['B2', 'D2'], mealsPerDelivery: 25, driverId: 'DR00022' })] },
  /* ★ ことぶき商会 横浜倉庫：山本配送（個人） */
  { contractId: 'CP0000094', cycles: ALL, planId: 'ES000003', course: 'ESスタンダード', monthlyYen: 27500,
    channels: [ch({ warehouseId: 'WH00001', regime: 'partner_driver', carrierId: 'DE00007', driverId: 'DR00045', slots: ['B4', 'D4'], mealsPerDelivery: 25 })] },
];

/* 子契約の配送区分に「資材」を足す（資材便のリードタイムの持ち主は契約の配送区分・配送_05・hong 2026-10-06）。
   サイクルからは自動生成しない（slots が空）。ES事務所 WH00004 → ヤマト（DE00002）。 */
const MATERIAL_CHANNEL = (): Channel => ({ temp: '資材', serviceForm: '資材便', regime: 'parcel_carrier', hubId: '', carrierId: 'DE00002', carrier2Id: 'DE00002', driverId: '', warehouseId: 'WH00004', leadDays: 2, slots: [], mealsPerDelivery: 0 });
for (const p of CHILD_PLANS) if (!p.channels.some((c) => c.temp === '資材')) p.channels = [...p.channels, MATERIAL_CHANNEL()];

export const PAUSES: Pause[] = [
  { id: 'CH-20260715-0001', contractId: 'CP0000003', fromCycle: '2026-10', toCycle: '2026-12', resumeCycle: '2027-01', applicationNo: 'CH-20260715-0001', keepEquipment: true, reason: '改装のため' },
  { id: 'CH-20260918-0001', contractId: 'CP0000001', fromCycle: '2026-12', toCycle: '2027-02', resumeCycle: '2027-03', applicationNo: 'CH-20260918-0001', keepEquipment: true, reason: '年末年始・事務所移転の準備' },
];

/** 代理店（org.agencies）。見本は代理店・紹介フィーの見本（seed/referral.ts）に持つ */
export { AGENCIES } from './referral';

export const LOANS: Loan[] = [
  { id: 'LN-0003', branchId: 'CU00643', modelId: 'VM000001', qty: 1, startOn: '2026/02/27', status: '貸出中' },
  { id: 'LN-0004', branchId: 'CU00643', modelId: 'RF000002', qty: 1, startOn: '2026/02/27', status: '貸出中' },
  { id: 'LN-0005', branchId: 'CU00643', modelId: 'BX000001', qty: 2, startOn: '2026/02/27', status: '貸出中' },
  { id: 'LN-0021', branchId: 'CU00871', modelId: 'RF000001', qty: 1, startOn: '2026/05/08', status: '貸出中' },
  { id: 'LN-0022', branchId: 'CU00871', modelId: 'BX000001', qty: 1, startOn: '2026/05/08', status: '貸出中' },
  /* 名古屋：休止の前に約2ヶ月使用（8月・9月サイクル）。置いたまま */
  { id: 'LN-0041', branchId: 'CU00902', modelId: 'RF000001', qty: 1, startOn: '2026/08/14', status: '貸出中' },
  /* 千葉・横浜：標準貸出設備どおり（資材ボックス4つも）。貸出日＝当初契約開始日（受付簿 No.46・2026-10-05） */
  { id: 'LN-0061', branchId: 'CU00961', modelId: 'RF000001', qty: 1, startOn: '2026/05/25', status: '貸出中' },
  { id: 'LN-0062', branchId: 'CU00961', modelId: 'BX000001', qty: 1, startOn: '2026/05/25', status: '貸出中' },
  { id: 'LN-0063', branchId: 'CU00961', modelId: 'BX000002', qty: 1, startOn: '2026/05/25', status: '貸出中' },
  { id: 'LN-0064', branchId: 'CU00961', modelId: 'BX000003', qty: 1, startOn: '2026/05/25', status: '貸出中' },
  { id: 'LN-0065', branchId: 'CU00961', modelId: 'BX000005', qty: 1, startOn: '2026/05/25', status: '貸出中' },
  { id: 'LN-0071', branchId: 'CU00950', modelId: 'RF000001', qty: 1, startOn: '2026/06/15', status: '貸出中' },
  { id: 'LN-0072', branchId: 'CU00950', modelId: 'FZ000001', qty: 1, startOn: '2026/06/15', status: '貸出中' },
  { id: 'LN-0073', branchId: 'CU00950', modelId: 'BX000001', qty: 1, startOn: '2026/06/15', status: '貸出中' },
  { id: 'LN-0074', branchId: 'CU00950', modelId: 'BX000002', qty: 1, startOn: '2026/06/15', status: '貸出中' },
  { id: 'LN-0075', branchId: 'CU00950', modelId: 'BX000003', qty: 1, startOn: '2026/06/15', status: '貸出中' },
  { id: 'LN-0076', branchId: 'CU00950', modelId: 'BX000005', qty: 1, startOn: '2026/06/15', status: '貸出中' },
  { id: 'LN-0051', branchId: 'CU00671', modelId: 'RF000003', qty: 1, startOn: '2026/04/22', status: '貸出中' },
  { id: 'LN-0052', branchId: 'CU00671', modelId: 'BX000001', qty: 3, startOn: '2026/04/22', status: '貸出中' },
];

const ct2 = (id: string, type: Contact['owner']['type'], ownerId: string, kind: Contact['kind'], name: string, kana: string, email: string, tel: string): Contact =>
  ({ id, owner: { type, id: ownerId }, kind, name, kana, email, tel });

export const CONTACTS: Contact[] = [
  ct2('PC00001', 'corp', 'CU00001', 'メイン担当者', '佐藤 誠', 'サトウ マコト', 'sato@sample.co.jp', '03-5401-2200'),
  ct2('PC00002', 'corp', 'CU00001', '請求担当者', '高橋 由紀', 'タカハシ ユキ', 'takahashi@sample.co.jp', '03-5401-2210'),
  ct2('PC00003', 'branch', 'CU00643', 'メイン担当者', '佐藤 誠', 'サトウ マコト', 'sato@sample.co.jp', '03-5401-2200'),
  ct2('PC00004', 'branch', 'CU00871', 'メイン担当者', '中村 里奈', 'ナカムラ リナ', 'nakamura@sample.co.jp', '06-6344-1100'),
  ct2('PC00005', 'branch', 'CU00902', 'メイン担当者', '山本 由紀', 'ヤマモト ユキ', 'yamamoto@sample.co.jp', '052-551-3300'),
  ct2('PC00006', 'branch', 'CU00902', '請求担当者', '山本 由紀', 'ヤマモト ユキ', 'yamamoto@sample.co.jp', '052-551-3300'),
  ct2('PC00007', 'branch', 'CU00961', 'メイン担当者', '木下 翼', 'キノシタ ツバサ', 'chiba@sample.co.jp', '043-000-0961'),
  ct2('PC00008', 'branch', 'CU00950', 'メイン担当者', '岡田 涼子', 'オカダ リョウコ', 'yokohama@sample.co.jp', '045-000-0950'),
  ct2('PC00009', 'corp', 'CU00071', 'メイン担当者', '菅原 健', 'スガワラ ケン', 'sugawara@michinoku.example.jp', '022-000-0071'),
  ct2('PC00010', 'corp', 'CU00012', 'メイン担当者', '伊藤 健', 'イトウ ケン', 'ito@mirai.example.jp', '052-000-0012'),
  ct2('PC00011', 'corp', 'CU00031', 'メイン担当者', '光岡 舞', 'ミツオカ マイ', 'mitsuoka@hikari.example.jp', '03-0000-0031'),
  ct2('PC00012', 'corp', 'CU00044', 'メイン担当者', '寿 一郎', 'コトブキ イチロウ', 'kotobuki@kotobuki.example.jp', '048-000-0044'),
  /* 請求担当者（受付簿 No.45・2026-10-05）：請求書のあて先がこの拠点の 千葉・横浜・仙台本社、みちのく商事（法人）。仙台本社はメイン担当者も */
  ct2('PC00031', 'branch', 'CU00961', '請求担当者', '木下 翼', 'キノシタ ツバサ', 'chiba@sample.co.jp', '043-000-0961'),
  ct2('PC00032', 'branch', 'CU00950', '請求担当者', '岡田 涼子', 'オカダ リョウコ', 'yokohama@sample.co.jp', '045-000-0950'),
  ct2('PC00033', 'corp', 'CU00071', '請求担当者', '阿部 美咲', 'アベ ミサキ', 'abe@michinoku.example.jp', '022-000-0072'),
  ct2('PC00036', 'branch', 'CU01320', 'メイン担当者', '佐藤 誠', 'サトウ マコト', 'sato@sample.co.jp', '03-5401-2200'),
  ct2('PC00037', 'branch', 'CU01320', '請求担当者', '高橋 由紀', 'タカハシ ユキ', 'takahashi@sample.co.jp', '03-5401-2210'),
  ct2('PC00038', 'branch', 'CU01330', 'メイン担当者', '森田 健太', 'モリタ ケンタ', 'tsukekae@sample.co.jp', '03-0000-1330'),
  ct2('PC00039', 'branch', 'CU01330', '請求担当者', '森田 健太', 'モリタ ケンタ', 'tsukekae@sample.co.jp', '03-0000-1330'),
  ct2('PC00034', 'branch', 'CU00975', 'メイン担当者', '菅原 健', 'スガワラ ケン', 'sugawara@michinoku.example.jp', '022-000-0071'),
  ct2('PC00035', 'branch', 'CU00975', '請求担当者', '阿部 美咲', 'アベ ミサキ', 'abe@michinoku.example.jp', '022-000-0072'),
  ct2('PC00013', 'carrier', 'DE00001', 'メイン担当者', '加藤 真由美', 'カトウ マユミ', 'ops@eisei-logi.example.jp', '045-000-0001'),
  ct2('PC00014', 'carrier', 'DE00006', 'メイン担当者', '西村 拓也', 'ニシムラ タクヤ', 'info@midori-bin.example.jp', '090-0000-0041'),
  ct2('PC00016', 'corp', 'CU00003', 'メイン担当者', '森本 亮', 'モリモト リョウ', 'somu@osaka-kitchen.example.jp', '06-6200-3302'),
  ct2('PC00017', 'corp', 'CU00003', '請求担当者', '森本 亮', 'モリモト リョウ', 'somu@osaka-kitchen.example.jp', '06-6200-3302'),
  ct2('PC00018', 'branch', 'CU00671', 'メイン担当者', '森本 亮', 'モリモト リョウ', 'somu@osaka-kitchen.example.jp', '06-6200-3302'),
  ct2('PC00015', 'carrier', 'DE00007', 'メイン担当者', '山本 修', 'ヤマモト オサム', 'yamamoto@yamamoto-haiso.example.jp', '090-0000-0045'),
];
