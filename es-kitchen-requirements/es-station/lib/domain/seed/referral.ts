import type { Agency, FeePayLine, FeePayment, FeePlan, Referral } from '../types';

/*
 * 代理店・紹介フィーの見本（area: referral と org.agencies）。もとは運営の 代理・紹介管理（general.feePlan・general.agency・general.refMeta・general.payment）。
 * 共通データでは：
 *   - 代理店は org.agencies（親契約の agencyId が指す）。AG00004 は運営の見本の名前（株式会社アーバンネットワーク）
 *   - 紹介は親契約ごと。紹介元の代理店は親契約の agencyId、紹介元の法人は srcCorpId（みらい商事 名古屋本社 ← 株式会社サンプル）
 *   - 紹介元の代理店は法人に1つ（シナリオ説明書 ⑱・S7-21）：株式会社サンプルは本社・大阪支店とも AG00021（C：パートナー紹介 10%・36ヶ月）。
 *     本社の基準額は ¥53,000（税抜・値引き後の固定額）
 *   - 紹介の支払い開始年月・支払は共通データの親契約の開始サイクル月・終了日に合わせた
 *     （本社 CP0000001＝2026-03〜、大阪 CP0000002＝2026-05〜、さくら建設 CP0000005＝2025/03/31 で終了 → 支払の月も合わせた）
 */

export const FEE_PLANS: FeePlan[] = [
  {id:"RFP000001",code:"A",name:"A：企業紹介",src:"法人",pay:"単発",months:1,calc:"固定額",amount:33000,rate:null,tiers:null,status:"有効",updated:"2026-08-07",note:"法人からの紹介。初回契約時に1回支払い。",linkedDiscounts:["DC000009 紹介割引（請求書表示名：ご紹介割引）"],history:[{at:"2026/08/17 09:15",what:"紹介フィーマスタを登録",by:"佐藤 花子"}]},
  {id:"RFP000002",code:"B",name:"B：代理店紹介",src:"代理店",pay:"単発",months:1,calc:"月次提供数別の金額",amount:null,rate:null,tiers:[[50,22000],[100,33000],[9999,55000]],status:"有効",updated:"2026-08-07",note:"",linkedDiscounts:["DC000007 代理店割引（リンクアップ・固定額）"],history:[{at:"2026/08/17 09:15",what:"紹介フィーマスタを登録",by:"佐藤 花子"}]},
  {id:"RFP000003",code:"C",name:"C：パートナー紹介",src:"代理店",pay:"継続（ヶ月）",months:36,calc:"請求額割合",amount:null,rate:10,tiers:null,status:"有効",updated:"2026-08-07",note:"",linkedDiscounts:["DC000001 代理店割引（パートナーズ・料率）"],history:[{at:"2026/08/17 09:15",what:"紹介フィーマスタを登録",by:"佐藤 花子"}]},
  {id:"RFP000004",code:"D",name:"D：特別代理店",src:"代理店",pay:"継続（永続）",months:null,calc:"請求額割合",amount:null,rate:7,tiers:null,status:"有効",updated:"2026-08-07",note:"特別契約代理店向け。",linkedDiscounts:[],history:[{at:"2026/08/17 09:15",what:"紹介フィーマスタを登録",by:"佐藤 花子"}]},
];

export const AGENCIES: Agency[] = [
  {id:"AG00003",name:"株式会社ビジネスリンク",kana:"カブシキガイシャビジネスリンク",feePlanId:"RFP000002",status:"有効",tel:"03-1234-5678",fax:"",address:{zip:"100-0005",pref:"東京都",city:"千代田区丸の内",addr1:"1-2-3",addr2:""},note:"",contacts:[{kind:"メイン担当者",name:"山田太郎",kana:"",email:"contact@ag00003.example.jp",tel:"090-1234-5678"}],history:[{at:"2026/08/17 09:15",what:"代理店を登録",by:"佐藤 花子"}]},
  {id:"AG00008",name:"ネクストパートナーズ株式会社",kana:"ネクストパートナーズカブシキガイシャ",feePlanId:"RFP000003",status:"有効",tel:"03-1234-5678",fax:"",address:{zip:"100-0005",pref:"東京都",city:"港区芝公園",addr1:"2-4-1",addr2:""},note:"",contacts:[{kind:"メイン担当者",name:"鈴木花子",kana:"",email:"contact@ag00008.example.jp",tel:"090-1234-5678"}],history:[{at:"2026/08/17 09:15",what:"代理店を登録",by:"佐藤 花子"}]},
  {id:"AG00009",name:"株式会社オフィスサポート",kana:"カブシキガイシャオフィスサポート",feePlanId:"RFP000004",status:"無効",tel:"03-1234-5678",fax:"",address:{zip:"100-0005",pref:"福岡県",city:"福岡市博多区",addr1:"3-1-8",addr2:""},note:"",contacts:[{kind:"メイン担当者",name:"中島健太",kana:"",email:"contact@ag00009.example.jp",tel:"090-1234-5678"}],history:[{at:"2026/08/17 09:15",what:"代理店を登録",by:"佐藤 花子"}]},
  {id:"AG00010",name:"東和ソリューションズ株式会社",kana:"トウワソリューションズカブシキガイシャ",feePlanId:"RFP000003",status:"有効",tel:"03-1234-5678",fax:"",address:{zip:"100-0005",pref:"京都府",city:"京都市下京区四条",addr1:"5-12",addr2:""},note:"",contacts:[{kind:"メイン担当者",name:"佐々木美咲",kana:"",email:"contact@ag00010.example.jp",tel:"090-1234-5678"}],history:[{at:"2026/08/17 09:15",what:"代理店を登録",by:"佐藤 花子"}]},
  {id:"AG00002",name:"株式会社スマートコネクト",kana:"カブシキガイシャスマートコネクト",feePlanId:"RFP000002",status:"有効",tel:"03-1234-5678",fax:"",address:{zip:"100-0005",pref:"大阪府",city:"大阪市北区梅田",addr1:"1-1-3",addr2:""},note:"",contacts:[{kind:"メイン担当者",name:"高田翔太",kana:"",email:"contact@ag00002.example.jp",tel:"090-1234-5678"}],history:[{at:"2026/08/17 09:15",what:"代理店を登録",by:"佐藤 花子"}]},
  {id:"AG00007",name:"日本ビジネスパートナー株式会社",kana:"ニホンビジネスパートナーカブシキガイシャ",feePlanId:"RFP000002",status:"無効",tel:"03-1234-5678",fax:"",address:{zip:"100-0005",pref:"宮城県",city:"仙台市青葉区",addr1:"2-2-10",addr2:""},note:"",contacts:[{kind:"メイン担当者",name:"小林優子",kana:"",email:"contact@ag00007.example.jp",tel:"090-1234-5678"}],history:[{at:"2026/08/17 09:15",what:"代理店を登録",by:"佐藤 花子"}]},
  {id:"AG00001",name:"株式会社フューチャーブリッジ",kana:"カブシキガイシャフューチャーブリッジ",feePlanId:"RFP000002",status:"有効",tel:"03-1234-5678",fax:"",address:{zip:"100-0005",pref:"北海道",city:"札幌市中央区",addr1:"北1条西4-1",addr2:""},note:"",contacts:[{kind:"メイン担当者",name:"松本大輔",kana:"",email:"contact@ag00001.example.jp",tel:"090-1234-5678"}],history:[{at:"2026/08/17 09:15",what:"代理店を登録",by:"佐藤 花子"}]},
  {id:"AG00005",name:"グローバルサポート株式会社",kana:"グローバルサポートカブシキガイシャ",feePlanId:"RFP000002",status:"有効",tel:"03-1234-5678",fax:"",address:{zip:"100-0005",pref:"神奈川県",city:"横浜市西区",addr1:"みなとみらい2-3",addr2:""},note:"",contacts:[{kind:"メイン担当者",name:"加藤恵子",kana:"",email:"contact@ag00005.example.jp",tel:"090-1234-5678"}],history:[{at:"2026/08/17 09:15",what:"代理店を登録",by:"佐藤 花子"}]},
  {id:"AG00004",name:"株式会社アーバンネットワーク",kana:"カブシキガイシャアーバンネットワーク",feePlanId:"RFP000004",status:"有効",tel:"03-1234-5678",fax:"",address:{zip:"100-0005",pref:"兵庫県",city:"神戸市中央区",addr1:"三宮町1-5",addr2:""},note:"",contacts:[{kind:"メイン担当者",name:"藤田直樹",kana:"",email:"contact@ag00004.example.jp",tel:"090-1234-5678"}],history:[{at:"2026/08/17 09:15",what:"代理店を登録",by:"佐藤 花子"}]},
  {id:"AG00006",name:"ライフデザインパートナーズ株式会社",kana:"ライフデザインパートナーズカブシキガイシャ",feePlanId:"RFP000002",status:"有効",tel:"03-1234-5678",fax:"",address:{zip:"100-0005",pref:"広島県",city:"広島市中区",addr1:"紙屋町2-1",addr2:""},note:"",contacts:[{kind:"メイン担当者",name:"石井真理",kana:"",email:"contact@ag00006.example.jp",tel:"090-1234-5678"}],history:[{at:"2026/08/17 09:15",what:"代理店を登録",by:"佐藤 花子"}]},
  {id:"AG00011",name:"株式会社サンライズエージェント",kana:"カブシキガイシャサンライズエージェント",feePlanId:"RFP000003",status:"有効",tel:"03-1234-5678",fax:"",address:{zip:"100-0005",pref:"愛知県",city:"名古屋市中村区",addr1:"名駅4-7-1",addr2:""},note:"",contacts:[{kind:"メイン担当者",name:"森本拓也",kana:"",email:"contact@ag00011.example.jp",tel:"090-1234-5678"}],history:[{at:"2026/08/17 09:15",what:"代理店を登録",by:"佐藤 花子"}]},
  {id:"AG00012",name:"株式会社ブリッジワークス",kana:"カブシキガイシャブリッジワークス",feePlanId:"RFP000003",status:"有効",tel:"03-1234-5678",fax:"",address:{zip:"100-0005",pref:"東京都",city:"千代田区丸の内",addr1:"1-2-3",addr2:"丸の内ビル 8F"},note:"関東エリアを中心に法人紹介を担当",contacts:[{kind:"メイン担当者",name:"山田 太郎",kana:"ヤマダ タロウ",email:"taro.yamada@example.jp",tel:"090-1234-5678"},{kind:"サブ担当者",name:"佐藤 花子",kana:"サトウ ハナコ",email:"hanako.sato@example.jp",tel:"080-2345-6789"}],history:[{at:"2026/08/17 09:15",what:"代理店を登録",by:"佐藤 花子"}]},
  {id:"AG00021",name:"株式会社パートナーズ",kana:"カブシキガイシャパートナーズ",feePlanId:"RFP000003",status:"有効",tel:"03-1234-5678",fax:"",address:{zip:"100-0005",pref:"東京都",city:"渋谷区道玄坂",addr1:"1-10-8",addr2:""},note:"",contacts:[{kind:"メイン担当者",name:"青木 修",kana:"",email:"contact@ag00021.example.jp",tel:"090-1234-5678"}],history:[{at:"2026/08/17 09:15",what:"代理店を登録",by:"佐藤 花子"}]},
  {id:"AG00034",name:"株式会社リンクアップ",kana:"カブシキガイシャリンクアップ",feePlanId:"RFP000002",status:"有効",tel:"03-1234-5678",fax:"",address:{zip:"100-0005",pref:"神奈川県",city:"横浜市中区",addr1:"本町4-40",addr2:""},note:"",contacts:[{kind:"メイン担当者",name:"原田 奈々",kana:"",email:"contact@ag00034.example.jp",tel:"090-1234-5678"}],history:[{at:"2026/08/17 09:15",what:"代理店を登録",by:"佐藤 花子"}]},
  {id:"AG00102",name:"ESパートナー西日本（特別代理店）",kana:"イーエスパートナーニシニホン",feePlanId:"RFP000004",status:"有効",tel:"03-1234-5678",fax:"",address:{zip:"100-0005",pref:"大阪府",city:"大阪市中央区",addr1:"本町2-5-7",addr2:""},note:"",contacts:[{kind:"メイン担当者",name:"西川 誠",kana:"",email:"contact@ag00102.example.jp",tel:"090-1234-5678"}],history:[{at:"2026/08/17 09:15",what:"代理店を登録",by:"佐藤 花子"}]},
];

const SYS = { at: '2026/08/17 09:15', what: '親契約の代理店コードから紹介履歴を作成', by: 'システム' };
const D_COND = { pay: '継続（永続）', months: null, calc: '請求額割合', amount: null, rate: 7, tiers: null } as const;

/** 紹介（親契約ごと） */
export const REFERRALS: Referral[] = [
  { id: 'REF000001', contractId: 'CP0000001', srcCorpId: '', feePlanId: 'RFP000003', cond: { pay: '継続（ヶ月）', months: 36, calc: '請求額割合', amount: null, rate: 10, tiers: null },
    payStart: '2026-03', status: '有効', endPlan: '2029-02', end: '', note: '', history: [SYS] },
  { id: 'REF000002', contractId: 'CP0000002', srcCorpId: '', feePlanId: 'RFP000003', cond: { pay: '継続（ヶ月）', months: 36, calc: '請求額割合', amount: null, rate: 10, tiers: null },
    payStart: '2026-05', status: '有効', endPlan: '2029-04', end: '', note: '法人の代理店（AG00021）を既定にした拠点の追加',
    history: [{ at: '2026/09/01 10:05', what: '支払い開始年月を「2026年6月 → 2026年5月」に変更', by: '山田' }, SYS] },
  { id: 'REF000003', contractId: 'CP0000005', srcCorpId: '', feePlanId: 'RFP000004', cond: { ...D_COND },
    payStart: '2019-08', status: '途中解約', endPlan: '', end: '2025-03', note: '親契約の終了にともない終了', history: [SYS] },
  { id: 'REF000004', contractId: 'CP0000010', srcCorpId: 'CU00001', feePlanId: 'RFP000001', cond: { pay: '単発', months: 1, calc: '固定額', amount: 33000, rate: null, tiers: null },
    payStart: '2026-09', status: '有効', endPlan: '2026-09', end: '', note: '紹介元法人は親契約の項目が未定義のため仮データ', history: [SYS] },
  { id: 'REF000005', contractId: 'CP0000021', srcCorpId: '', feePlanId: 'RFP000004', cond: { ...D_COND },
    payStart: '', status: '契約前', endPlan: '', end: '', note: '', history: [SYS] },
  { id: 'REF000006', contractId: 'CP0000030', srcCorpId: '', feePlanId: 'RFP000002', cond: { pay: '単発', months: 1, calc: '月次提供数別の金額', amount: null, rate: null, tiers: [[50, 22000], [100, 33000], [9999, 55000]] },
    payStart: '2024-07', status: '満了', endPlan: '2024-07', end: '2024-07', note: '', history: [SYS] },
];

const MADE = { at: '2026/09/01 10:05', what: '支払履歴を作成', by: 'システム' };
const ln = (referralId: string, corp: string, plan: string, pay: string, calc: string, baseYen: number, rateTxt: string, feeYen: number, adjYen = 0): FeePayLine =>
  ({ referralId, corp, plan, pay, sites: 1, calc, baseYen, rateTxt, feeYen, adjYen });
const OSAKA = (adj = 0) => ln('REF000002', '株式会社サンプル／株式会社サンプル 大阪支店', 'C：パートナー紹介', '継続', '請求額割合', 27500, '10%', 2750, adj);
const HQ = () => ln('REF000001', '株式会社サンプル／株式会社サンプル 本社', 'C：パートナー紹介', '継続', '請求額割合', 53000, '10%', 5300);

/** 紹介フィーの支払（新しい順） */
export const PAYMENTS: FeePayment[] = [
  { id: 'FP202609-0001', month: '2026-09', type: '法人', targetId: 'CU00001', method: '請求値引き', status: '未払い', paidOn: '', note: '',
    lines: [ln('REF000004', '株式会社みらい商事／株式会社みらい商事 名古屋本社', 'A：企業紹介', '単発', '固定額', 0, '33,000円', 33000)], history: [MADE] },
  { id: 'FP202608-0001', month: '2026-08', type: '代理店', targetId: 'AG00021', method: '振込', status: '未払い', paidOn: '', note: '', lines: [HQ(), OSAKA()], history: [MADE] },
  { id: 'FP202607-0001', month: '2026-07', type: '代理店', targetId: 'AG00021', method: '振込', status: '支払済', paidOn: '2026/08/25', note: '', lines: [HQ(), OSAKA()], history: [MADE] },
  { id: 'FP202606-0001', month: '2026-06', type: '代理店', targetId: 'AG00021', method: '振込', status: '支払済', paidOn: '2026/07/24', note: '', lines: [HQ(), OSAKA(-100)], history: [MADE] },
  { id: 'FP202603-0001', month: '2026-03', type: '代理店', targetId: 'AG00021', method: '振込', status: '支払済', paidOn: '2026/04/24', note: '',
    lines: [ln('REF000001', '株式会社サンプル／株式会社サンプル 本社', 'C：パートナー紹介', '継続', '請求額割合', 53000, '10%', 5300)], history: [MADE] },
  { id: 'FP202503-0001', month: '2025-03', type: '代理店', targetId: 'AG00009', method: '振込', status: '支払済', paidOn: '2025/04/25', note: '',
    lines: [ln('REF000003', '株式会社さくら建設／株式会社さくら建設 本社', 'D：特別代理店', '継続', '請求額割合', 33000, '7%', 2310)], history: [MADE] },
  { id: 'FP202407-0001', month: '2024-07', type: '代理店', targetId: 'AG00034', method: '振込', status: '支払済', paidOn: '2024/08/23', note: '',
    lines: [ln('REF000006', '（法人なし）／カフェ花 横浜店', 'B：代理店紹介', '単発', '月次提供数別の金額', 21400, '50食→プラン別', 22000)], history: [MADE] },
];
