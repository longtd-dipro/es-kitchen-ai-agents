import type { Address, Carrier, CarrierEsFee, Course, Discount, Driver, Material, Model, Option, OptionCategory, Plan, PlanCoursePrice, PlanEquipment, PlanLimit, TroubleType, Warehouse } from '../types';
import { TAX_REDUCED, TAX_STD } from '../tax';

/*
 * マスタの見本。運営の見本（lib/ops/general/seed.ts の GEN_CONSIGN・GEN_WAREHOUSE・GEN_DRIVER、
 * lib/ops/masters の機種・プラン）と同じ ID・名前にそろえている。
 * 料金：01_仕様/40_マスタ・料金・請求、決定_STEP3（ES000001 お試しプランは廃止）
 */

const addr = (pref: string, city: string, addr1 = '', addr2 = '', zip = ''): Address => ({ zip, pref, city, addr1, addr2 });

const LIGHT_FRIDGE = 'ESライト（冷蔵庫）' as const;
const LIGHT_VM = 'ESライト（自販機）' as const;
const STD = 'ESスタンダード' as const;

/**
 * 温度帯ごとの月次提供上限・標準の配送回数（決定 28-153・28-154）。冷凍はプランの冷凍の月次提供数（2割【仮】・28-14 改定）。
 * 標準の配送回数は冷蔵庫の表（ES50＝1回・ES100 以上＝2回。決定_冷蔵庫マスタとプラン別構成）。冷凍_標準の配送回数は全プラン 1回／月（運営が後から直す。台帳 F 2026-10-05）
 */
const limits = (meals: number, deliveries: number, courses: Course[]): PlanLimit[] => courses.flatMap((course): PlanLimit[] => course === STD
  ? [{ course, temp: '冷蔵' as const, meals: meals - Math.round(meals * 0.2), deliveries }, { course, temp: '冷凍' as const, meals: Math.round(meals * 0.2), deliveries: 1 }]
  : [{ course, temp: '冷蔵' as const, meals, deliveries }]);
/**
 * 標準貸出設備（決定 28-182・冷蔵庫の表・資材ボックス 28-160）。ESスタンダードは冷凍庫1台を含む（新しいスタンダードのお客様は無料・7-2）。
 * ESライト（自販機）は自販機（決定 STEP3 Q5）。資材ボックスは決定 28-160・28-161・28-165 の表
 * （ES30〜ES200＝仕切り皿（ES30 は ES50 と同じ：台帳 E 2026-10-05） BX000001・深皿 BX000002・フード類 BX000003・カゴ BX000005 各1。タンス型 BX000004 は ES300〜500 のデフォルトで、ここのプランにはない。
 * ES250・ES600 以上はデフォルトなし＝運営が設備の異動で手で入れる。コースで変えない【暫定】）
 */
const BOX_DEFAULT = ['BX000001', 'BX000002', 'BX000003', 'BX000005'];
const equip = (fridge: string, courses: Course[]): PlanEquipment[] => courses.flatMap((course): PlanEquipment[] => [
  course === LIGHT_VM ? { course, modelId: 'VM000001', qty: 1 } : { course, modelId: fridge, qty: 1 },
  ...(course === STD ? [{ course, modelId: 'FZ000001', qty: 1 }] : []),
  ...BOX_DEFAULT.map((modelId) => ({ course, modelId, qty: 1 })),
]);

/*
 * ESライト（自販機）の料金：リース料（OP000037＝機種マスタの月額 × 台数）を含めない（台帳「自販機のリース料」2026/10/03）。
 * 【仮】客先の新しい料金が来るまで ライト（冷蔵庫）と同じ金額（hong 2026-10-05「仮の料金で」。元は 48,000・74,000・96,000 円でリース料込み）
 */
const PLAN_ROWS: Plan[] = [
  { id: 'ES000002', name: '30プラン', monthlyMeals: 30, public: false, status: '有効', prices: [{ course: STD, monthlyYen: 17000 }, { course: LIGHT_FRIDGE, monthlyYen: 15000 }],
    limits: limits(30, 1, [STD, LIGHT_FRIDGE]), stdEquipment: equip('RF000001', [STD, LIGHT_FRIDGE]) },
  { id: 'ES000003', name: '50プラン', monthlyMeals: 50, public: true, status: '有効', prices: [{ course: STD, monthlyYen: 27500 }, { course: LIGHT_FRIDGE, monthlyYen: 24500 }],
    limits: limits(50, 1, [STD, LIGHT_FRIDGE]), stdEquipment: equip('RF000001', [STD, LIGHT_FRIDGE]) },
  { id: 'ES000004', name: '100プラン', monthlyMeals: 100, public: true, status: '有効', prices: [{ course: STD, monthlyYen: 49500 }, { course: LIGHT_FRIDGE, monthlyYen: 46000 }, { course: LIGHT_VM, monthlyYen: 46000 }],
    limits: limits(100, 2, [STD, LIGHT_FRIDGE, LIGHT_VM]), stdEquipment: equip('RF000001', [STD, LIGHT_FRIDGE, LIGHT_VM]) },
  { id: 'ES000005', name: '150プラン', monthlyMeals: 150, public: true, status: '有効', prices: [{ course: STD, monthlyYen: 71500 }, { course: LIGHT_FRIDGE, monthlyYen: 67000 }, { course: LIGHT_VM, monthlyYen: 67000 }],
    limits: limits(150, 2, [STD, LIGHT_FRIDGE, LIGHT_VM]), stdEquipment: equip('RF000002', [STD, LIGHT_FRIDGE, LIGHT_VM]) },
  { id: 'ES000006', name: '200プラン', monthlyMeals: 200, public: true, status: '有効', prices: [{ course: STD, monthlyYen: 93500 }, { course: LIGHT_FRIDGE, monthlyYen: 88500 }, { course: LIGHT_VM, monthlyYen: 88500 }],
    limits: limits(200, 2, [STD, LIGHT_FRIDGE, LIGHT_VM]), stdEquipment: equip('RF000003', [STD, LIGHT_FRIDGE, LIGHT_VM]) },
  /* 削除済の見本（画面設計書の「削除済みも表示」の確認用・hong 2026/10/05）。一覧では既定で隠れる */
  { id: 'ES000020', name: '20プラン（旧）', monthlyMeals: 20, public: false, status: '削除済', prices: [{ course: STD, monthlyYen: 12000 }, { course: LIGHT_FRIDGE, monthlyYen: 10500 }],
    limits: limits(20, 1, [STD, LIGHT_FRIDGE]), stdEquipment: equip('RF000001', [STD, LIGHT_FRIDGE]) },
];

/**
 * 価格世代（Plan.priceGens・課題 7-1 Q1／7-2）。いまの世代＝運営のプランマスタの「改訂第三回目（2026/04/01〜）」で、料金はプランの価格と同じ。
 * シナリオ説明書 ⑲ の「改訂第四回目（ESライト ¥25,000）」はシナリオの中で足す（bulk.addPriceGen → 価格世代を一括切替）
 */
/*
 * 前の世代（課題 4b-9：運営のプランマスタの旧「価格プラン」の表 lib/ops/masters/seed.ts の PLAN_DB から移した。元の料金・改訂第一回目・改訂第二回目）。
 * 適用開始＝旧表の開始期間の月。月額＝ES配送便の価格（COOL便と同じ）。旧表の ES000003 ライト「改訂第四回目（2026/10/01〜・¥25,000・未使用）」は
 * シナリオ説明書 ⑲ で足す世代なので移さない。旧表の ES000009（400プラン）は共通データにないプランなので移さない
 */
const HIST: Record<string, [from: string, note: string, prices: Record<string, number>][]> = {
  ES000003: [
    ['2024-01', '元の料金（2024/01/30〜2024/09/30）', { [STD]: 24000, [LIGHT_FRIDGE]: 21000 }],
    ['2024-10', '改訂第一回目（2024/10/01〜2024/12/31）', { [STD]: 25000, [LIGHT_FRIDGE]: 22000 }],
    ['2025-01', '改訂第二回目（2025/01/01〜2026/03/31）', { [STD]: 26500, [LIGHT_FRIDGE]: 23500 }],
  ],
  ES000004: [
    ['2024-01', '元の料金（2024/01/30〜2024/09/30）', { [STD]: 44000, [LIGHT_FRIDGE]: 41000, [LIGHT_VM]: 47000 }],
    ['2024-10', '改訂第一回目（2024/10/01〜2024/12/31）', { [STD]: 46000, [LIGHT_FRIDGE]: 43000, [LIGHT_VM]: 49000 }],
    ['2025-01', '改訂第二回目（2025/01/01〜2026/03/31）', { [STD]: 48000, [LIGHT_FRIDGE]: 45000, [LIGHT_VM]: 51000 }],
  ],
};
/**
 * プランマスタの設定（運営のプランマスタの見本 lib/ops/masters/seed.ts の PLAN_DB と請求の見本の免責金額 lib/ops/billing/masters.ts と同じ値）。
 * 免責金額：50＝200円・100＝250円、ほかは食数の段階（〜100＝300・〜200＝500）。基本比×倍＝食数 ÷ 50。利用人数目安は 50＝7名・100＝14名
 */
const SETTINGS: Record<string, Pick<Plan, 'deductibleYen' | 'baseRatio' | 'peopleText'>> = {
  ES000002: { deductibleYen: 300, baseRatio: 1, peopleText: '' },
  ES000003: { deductibleYen: 200, baseRatio: 1, peopleText: '7名' },
  ES000004: { deductibleYen: 250, baseRatio: 2, peopleText: '14名' },
  ES000005: { deductibleYen: 500, baseRatio: 3, peopleText: '21名' },
  ES000006: { deductibleYen: 500, baseRatio: 4, peopleText: '' },
};
/**
 * 初期備品（資材の初期セット・28-129）：今までの見本の数（割り箸・おしぼり＝食数（10以上）、スプーン・フォーク・深皿・深皿フタ 10、ゴミ袋 20）。
 * 深皿フタはスタンダード＝S006・ほか＝S005
 */
const initialItems = (meals: number, courses: Course[]): NonNullable<Plan['initialItems']> => courses.flatMap((course) =>
  ([['S001', Math.max(10, meals)], ['S002', 10], ['S003', 10], ['S004', 10], [course === STD ? 'S006' : 'S005', 10], ['S007', Math.max(10, meals)], ['S008', 20]] as const)
    .map(([materialId, qty]) => ({ course, materialId, qty })));
/** 配送方法ごとの価格（見本：ES配送便＝COOL便と同じ金額。ライト（自販機）は ES配送便だけ。台帳 E 2026-10-05） */
const byMethod = (course: Course, yen: number): PlanCoursePrice => ({ course, monthlyYen: yen, esYen: yen, ...(course === LIGHT_VM ? {} : { coolYen: yen }) });
export const PLANS: Plan[] = PLAN_ROWS.map((p) => {
  const hist = HIST[p.id] ?? [];
  const id = (n: number) => `PG-${p.id}-${String(n).padStart(2, '0')}`;
  const courses = p.prices.map((x) => x.course);
  return {
    ...p,
    prices: p.prices.map((x) => byMethod(x.course, x.monthlyYen)),
    /* 税率：基本料金 10%・企業負担分 8%（決定 28-149・lib/domain/tax.ts） */
    taxRateId: TAX_STD, welfareTaxRateId: TAX_REDUCED,
    /* 企業負担額 100円（税込・1食・28-147）・免責金額・基本比×倍・残りわずか率 25%（持つだけ）・利用人数目安（持つだけ） */
    welfareYenPerMeal: 100, lowStockRate: 25, ...SETTINGS[p.id],
    /* 初期費用：ライト（自販機）＝プランマスタの初期料金 50,000円（税抜）。ほかは OP000008 の金額。自販機以外の機種の初期料金は 0（仕様では必須・hong 2026/10/05 A・受付簿 #125） */
    initialItems: initialItems(p.monthlyMeals, courses),
    /* プランに含む資材の数（1サイクル月）：まだ決まっていない（資材の単価が 0円のあいだは請求しない） */
    includedMaterials: [],
    priceGens: [
      ...hist.map(([fromCycle, note, m], i) => ({ id: id(i + 1), fromCycle, prices: p.prices.map((x) => byMethod(x.course, m[x.course])), note, at: '2026/03/20 10:00', by: 'Ad00010' })),
      /* いまの世代＝公開用（運営が付ける印。台帳 E 2026-10-05） */
      { id: id(hist.length + 1), fromCycle: '2026-04', prices: p.prices.map((x) => byMethod(x.course, x.monthlyYen)), note: '改訂第三回目（2026/04/01〜・いまの世代）', at: '2026/03/20 10:00', by: 'Ad00010', public: true },
    ],
  };
});

/** recoveryYen＝解約時の回収額（違約金の元。決定 28-2・28-7。金額は【仮】・デモの ¥150,000 は自販機） */
export const MODELS: Model[] = ([
  { id: 'RF000001', name: '冷蔵ショーケース 48L', category: '冷蔵庫', monthlyYen: 5000, minMonths: 3, public: true, status: '有効', recoveryYen: 50000, initFeeYen: 0 },
  { id: 'RF000002', name: '冷蔵ショーケース 84L', category: '冷蔵庫', monthlyYen: 6000, minMonths: 3, public: true, status: '有効', recoveryYen: 60000, initFeeYen: 0 },
  { id: 'RF000003', name: '冷蔵ショーケース 105L', category: '冷蔵庫', monthlyYen: 6500, minMonths: 3, public: true, status: '有効', recoveryYen: 70000, initFeeYen: 0 },
  { id: 'RF000004', name: '冷蔵ショーケース 142L', category: '冷蔵庫', monthlyYen: 7000, minMonths: 3, public: true, status: '有効', recoveryYen: 80000, initFeeYen: 0 },
  { id: 'FZ000001', name: '業務用冷凍庫 FZ-600', category: '冷凍庫', monthlyYen: 4000, minMonths: 12, public: true, status: '有効', recoveryYen: 80000, initFeeYen: 0 },
  { id: 'VM000001', name: 'カップ式自販機 VM-6010', category: '自販機', monthlyYen: 15000, minMonths: 12, public: false, status: '有効', recoveryYen: 150000, initFeeYen: 50000 },
  /* 運営のメニュー（lib/ops/menu/data.ts の VM_LAYOUT）の2台目。商品の「対応機種」に使う（料金は仮） */
  { id: 'VM000002', name: '自販機 S-1【仮】', category: '自販機', monthlyYen: 12000, minMonths: 12, public: false, status: '有効', recoveryYen: 120000, initFeeYen: 50000 },
  { id: 'MW000001', name: '電子レンジ', category: '電子レンジ', monthlyYen: 1000, minMonths: 3, public: true, status: '有効', recoveryYen: 10000, initFeeYen: 0 },
  /* 資材ボックス：種類ごとに1機種・5機種（決定 28-161・28-164。名前は決定の表の案。月額 ¥0・最低利用期間なし） */
  { id: 'BX000001', name: 'ボックス《仕切り皿》', category: '資材ボックス', monthlyYen: 0, minMonths: 0, public: true, status: '有効', initFeeYen: 0 },
  { id: 'BX000002', name: 'ボックス《深皿》', category: '資材ボックス', monthlyYen: 0, minMonths: 0, public: true, status: '有効', initFeeYen: 0 },
  { id: 'BX000003', name: 'ボックス《フード類》', category: '資材ボックス', monthlyYen: 0, minMonths: 0, public: true, status: '有効', initFeeYen: 0 },
  { id: 'BX000004', name: 'タンス型ボックス（大）', category: '資材ボックス', monthlyYen: 0, minMonths: 0, public: true, status: '有効', initFeeYen: 0 },
  { id: 'BX000005', name: 'カゴ', category: '資材ボックス', monthlyYen: 0, minMonths: 0, public: true, status: '有効', initFeeYen: 0 },
] as Model[]).map((m): Model => ({ ...m, taxRateId: TAX_STD }));

/*
 * オプション（費目のマスタ・2026/10/03 決定：1つのマスタ・ID は変えない。00_確認してほしい/オプション・値引き_定義_20261003.md）。
 *   name＝請求書表示名（invoiceName。請求書・法人Web）、mgmtName＝管理名（adminName・社内用。運営の一覧と選択肢）。
 *   trigger＝いつ発生するか（コードが使う ID は lib/domain/charges.ts の CHARGE_IDS だけ）。auto＝自動／運営が手で付ける（manual）／法人が申込で選ぶ（apply）。
 *   決定の根拠がないもの（OP000009 再配送手数料・OP000012 設備管理費・OP000018 標準設置）と OP000033（冷凍庫 初期費用）はお客様の確認まで入れない。
 *   金額が決まっていないものは 金額の種類＝都度入力（amountYen は既定値・【仮】は note）
 */
type OptRow = Omit<Option, 'taxRateId'>;
const A = (x: Omit<OptRow, 'linkType' | 'auto'> & Partial<OptRow>): OptRow => ({ linkType: 'A', auto: 'auto', ...x });
const N = (x: Omit<OptRow, 'linkType'> & Partial<OptRow>): OptRow => ({ linkType: 'none', ...x });
/** オプション区分マスタの初期値：配送／アプリ機能／設置・作業／事務／ペナルティ（台帳 F「オプション区分の持ち方」） */
export const OPTION_CATEGORIES: OptionCategory[] = ['配送', 'アプリ機能', '設置・作業', '事務', 'ペナルティ'].map((name, i) => ({ id: `OC${String(i + 1).padStart(6, '0')}`, name, sortNo: (i + 1) * 10, status: '使用中' }));
export const OPTIONS: Option[] = ([
  A({ id: 'OP000001', name: '配送回数追加', mgmtName: '配送回数追加', category: '配送', feeType: '月額料金', amountYen: 3000, status: '使用中', linkedItem: 'deliveryCount', amountKind: '固定', unit: '回', trigger: 'item.deliveryOver',
    note: '温度帯ごとに標準の配送回数を超えた回数 × 金額（月額）。足りない温度帯と相殺しない（28-85・28-154・28-156）' }),
  A({ id: 'OP000002', name: 'ES-QR', mgmtName: 'ES-QR 利用料', category: 'アプリ機能', feeType: '月額料金', amountYen: 1000, status: '使用中', linkedItem: 'esqr', amountKind: '固定', unit: '', trigger: 'item.esqr',
    note: '契約項目 ES-QR「利用する」と連動。既存のお客様の無料は子契約の金額の上書き（0円・REQ-CT-304）' }),
  A({ id: 'OP000003', name: 'ゲストモード', mgmtName: 'ゲストモード利用料', category: 'アプリ機能', feeType: '月額料金', amountYen: 0, status: '使用中', linkedItem: 'guestMode', amountKind: '都度入力', unit: '', trigger: 'item.guest',
    note: '金額が決まるまで 0円（STEP3追補 O13）' }),
  N({ id: 'OP000004', name: '地域配送料', mgmtName: '地域配送料', category: '配送', feeType: '月額料金', amountYen: 4000, status: '使用中', amountKind: '拠点ごと', unit: '', trigger: 'manual', auto: 'manual',
    note: '配送エリアによる。金額は拠点ごと（子契約で上書き）。既定 4,000円（STEP3回答 Q5\'）' }),
  N({ id: 'OP000005', name: '現金回収サービス', mgmtName: '現金回収サービス', category: '事務', feeType: '月額料金', amountYen: 3000, status: '削除済', amountKind: '固定', trigger: 'manual', auto: 'manual', note: '削除済（ID は再利用しない）' }),
  N({ id: 'OP000007', name: '設置代行', mgmtName: '設置代行（冷蔵庫）', category: '設置・作業', feeType: '単発料金', amountYen: 20000, status: '使用中', amountKind: '固定', unit: '', trigger: 'apply', auto: 'apply',
    note: '法人が申込・変更申請で冷蔵庫の設置代行を選んだとき。金額＝¥22,000（税込・税抜 ¥20,000）。設置代行・初期設置サポート・初期配送設置パックを1つにまとめた（客先回答 2026-10-06・台帳 B）。要件シート 行156' }),
  /* 新規導入の最初の子契約に1回だけ（当月請求・REQ-CT-182）。金額の初期値はプランマスタの初期費用（なければこの金額）・受付で直せる（REQ-PM-055）。請求書の表示名は「初期費用」（2026/10/03 回答） */
  N({ id: 'OP000008', name: '初期費用', mgmtName: '初期費用', category: '事務', feeType: '単発料金', amountYen: 10000, status: '使用中', amountKind: '機種参照', unit: '', trigger: 'event.contractInit', auto: 'auto',
    note: '新規導入の本登録で1回だけ（当月請求・REQ-CT-182）。金額はプランマスタの初期費用（契約ごとに直せる・REQ-PM-055）' }),
  N({ id: 'OP000010', name: '冷蔵庫交換（お客様都合）', mgmtName: '冷蔵庫交換（お客様都合）', category: '設置・作業', feeType: '単発料金', amountYen: 0, status: '使用中', amountKind: '都度入力', trigger: 'manual', auto: 'manual', note: 'STEP3追補 Q-A（名前を変えて残す）' }),
  N({ id: 'OP000011', name: '月次運用レポート', mgmtName: '月次運用レポート', category: '事務', feeType: '月額料金', amountYen: 5000, status: '終了', amountKind: '固定', trigger: 'manual', auto: 'manual', note: '終了（申込フォームから外した）' }),
  N({ id: 'OP000013', name: '資材定期補充', mgmtName: '資材定期補充', category: '配送', feeType: '月額料金', amountYen: 1500, status: '終了', amountKind: '固定', trigger: 'manual', auto: 'manual', note: '使わない（決定_STEP5回答_法人Web Q-STEP3）' }),
  N({ id: 'OP000014', name: '配送時間帯指定サービス', mgmtName: '配送時間帯指定サービス', category: '配送', feeType: '月額料金', amountYen: 2000, status: '使用中', amountKind: '固定', trigger: 'apply', auto: 'apply', note: '申込フォームで選べる（決定_v2.3追補_申込フォームとマスタ §1）' }),
  N({ id: 'OP000015', name: '再設置・移設', mgmtName: '再設置・移設（荷物移動）', category: '設置・作業', feeType: '単発料金', amountYen: 8000, status: '使用中', amountKind: '都度入力', trigger: 'manual', auto: 'manual', note: '【仮】金額の根拠なし（STEP3追補 §1 O6）' }),
  N({ id: 'OP000016', name: '事務手数料', mgmtName: '棚卸し未実施', category: 'ペナルティ', feeType: '単発料金', amountYen: 3000, status: '使用中', amountKind: '固定', trigger: 'event.inventoryUnfiled', auto: 'auto',
    note: '棚卸の報告期限は毎月20日、未報告の判定は25日（20日までに報告がなければ、25日に未報告として事務手数料を1回請求する）。休止中・棚卸なし・お試しは除く' }),
  N({ id: 'OP000017', name: '自販機ラッピング変更', mgmtName: '自販機ラッピング変更', category: '設置・作業', feeType: '単発料金', amountYen: 0, status: '使用中', amountKind: '都度入力', trigger: 'apply', auto: 'apply', targetCourses: ['ESライト（自販機）'], note: '別途見積（自販機のときだけ申込で選べる）' }),
  N({ id: 'OP000019', name: '設備配送料（1台）', mgmtName: '設備配送料（1台）', category: '設置・作業', feeType: '単発料金', amountYen: 4800, status: '使用中', amountKind: '固定', unit: '台', trigger: 'event.equipSwapOne', auto: 'auto', note: '設備の入替・追加・回収の配送が1台（28-16・28-53。承認の前に直せる）' }),
  N({ id: 'OP000020', name: '設備配送料（2台以上）', mgmtName: '設備配送料（2台以上）', category: '設置・作業', feeType: '単発料金', amountYen: 7800, status: '使用中', amountKind: '固定', unit: '台', trigger: 'event.equipSwapMany', auto: 'auto', note: '設備の入替・追加・回収の配送が2台以上（28-16・28-53）' }),
  N({ id: 'OP000021', name: '階段作業の加算', mgmtName: '階段作業の加算', category: '設置・作業', feeType: '単発料金', amountYen: 3000, status: '使用中', amountKind: '固定', trigger: 'event.equipStairs', auto: 'manual', note: 'エレベーターなしで3階以上（28-16）。設備の異動の案に運営が足す' }),
  /* 2026/10/03 回答：0円・必要なときは運営が請求の ③ 調整で入れる（解約で自動では載せない） */
  N({ id: 'OP000022', name: '設備引揚費', mgmtName: '設備引揚費（1台）', category: '設置・作業', feeType: '単発料金', amountYen: 0, status: '使用中', amountKind: '都度入力', unit: '台', trigger: 'event.equipPickup', auto: 'manual',
    note: '0円（28-54・2026/10/03 回答）。必要なときは運営が請求の ③ 調整で入れる' }),
  N({ id: 'OP000023', name: 'サイズ差額（月額）', mgmtName: 'サイズ差額（月額）', category: '設置・作業', feeType: '月額料金', amountYen: 0, status: '使用中', amountKind: '差額で決まる', unit: '台', trigger: 'event.equipSizeDiff', auto: 'auto',
    note: '新しい機種の月額 − 古い機種の月額（＋のときだけ・機種マスタ）。STEP3回答 Q4' }),
  N({ id: 'OP000024', name: '緊急出動料金', mgmtName: '緊急出動料金', category: '設置・作業', feeType: '単発料金', amountYen: 0, status: '使用中', amountKind: '都度入力', trigger: 'manual', auto: 'manual', note: 'STEP3追補 §1（E7・O1）' }),
  N({ id: 'OP000025', name: '特殊作業費（手上げ）', mgmtName: '特殊作業費（手上げ）', category: '設置・作業', feeType: '単発料金', amountYen: 0, status: '使用中', amountKind: '都度入力', trigger: 'manual', auto: 'manual', note: 'STEP3追補 §1（B21・O2）' }),
  N({ id: 'OP000026', name: '特殊作業費（クレーン対応）', mgmtName: '特殊作業費（クレーン対応）', category: '設置・作業', feeType: '単発料金', amountYen: 0, status: '使用中', amountKind: '都度入力', trigger: 'manual', auto: 'manual', note: 'STEP3追補 §1（B22・O2）' }),
  N({ id: 'OP000027', name: '特殊作業費（その他）', mgmtName: '特殊作業費（その他）', category: '設置・作業', feeType: '単発料金', amountYen: 0, status: '使用中', amountKind: '都度入力', trigger: 'manual', auto: 'manual', note: 'STEP3追補 §1（B23・O2）' }),
  N({ id: 'OP000028', name: '搬入設置個所の下見費用', mgmtName: '搬入設置個所の下見費用', category: '設置・作業', feeType: '単発料金', amountYen: 0, status: '使用中', amountKind: '都度入力', trigger: 'manual', auto: 'manual', note: 'STEP3追補 §1（B24・O3）' }),
  N({ id: 'OP000029', name: '故障による交換（同型サイズ）', mgmtName: '故障による交換（同型サイズ）', category: '設置・作業', feeType: '単発料金', amountYen: 0, status: '使用中', amountKind: '固定', trigger: 'manual', auto: 'manual', note: '0円の記録（STEP3追補 §1 E19・O5）' }),
  N({ id: 'OP000030', name: '自販機手数料', mgmtName: '自販機手数料', category: '事務', feeType: '月額料金', amountYen: 0, status: '使用中', amountKind: '都度入力', trigger: 'manual', auto: 'manual', targetCourses: ['ESライト（自販機）'], note: 'STEP3追補 §1（O10）。自販機リース（OP000037）とは別の手数料【要確認】' }),
  N({ id: 'OP000031', name: '買取惣菜料金', mgmtName: '買取惣菜料金', category: '事務', feeType: '単発料金', amountYen: 0, status: '使用中', amountKind: '都度入力', trigger: 'manual', auto: 'manual', note: 'STEP3追補 §1（O10）。商品の買取（企業独自価格）と重なる【要確認】' }),
  /* 2026/10/03 回答：既存のお客様の冷凍庫の賃料は機種マスタの月額（旧ライト→スタンダード移行割の設備の異動の案）。OP000032 は参考として残す */
  N({ id: 'OP000032', name: '冷凍庫レンタル（既存のお客様）', mgmtName: '冷凍庫レンタル（既存のお客様）', category: '設置・作業', feeType: '月額料金', amountYen: 0, status: '終了', amountKind: '参照', trigger: 'manual', auto: 'manual',
    note: '参考（終了）：賃料は機種マスタの月額で移行割の設備の異動の案が自動で出す（2026/10/03 回答）' }),
  N({ id: 'OP000034', name: '追加配送（単発・1回）', mgmtName: '追加配送（単発・1回）', category: '配送', feeType: '単発料金', amountYen: 5000, status: '使用中', amountKind: '固定', trigger: 'manual', auto: 'manual', note: 'お客様に頼まれた単発の追加配送（Q-B）。代替品・補償の追加配送は請求しない' }),
  A({ id: 'OP000035', name: 'ユーザー現金利用', mgmtName: 'ユーザー現金利用', category: 'アプリ機能', feeType: '月額料金', amountYen: 0, status: '使用中', linkedItem: 'userCash', amountKind: '固定', trigger: 'item.cash', note: '【仮】0円（STEP3追補 §6）' }),
  /* 金額は追補5 Q13 の ¥2,000（税抜・仮。シナリオ説明書 ⑰。正式な金額はお客様確認） */
  N({ id: 'OP000036', name: '資材の追加配送', mgmtName: '資材の追加配送（単発・1回）', category: '配送', feeType: '単発料金', amountYen: 2000, status: '使用中', amountKind: '固定', trigger: 'event.materialOrderPaid', auto: 'auto',
    note: '同じサイクル月の2回目からの資材便ごと（2026/10/03 回答：サイクル）。【仮】金額はお客様確認' }),
  /* 2026/10/03 回答：自販機のリース料（毎月）。金額は契約ごと（子契約の上書き）・初期値は機種マスタの月額（REQ-PM-054・REQ-CT-303/304） */
  N({ id: 'OP000037', name: '自販機月額料金', mgmtName: '自販機リース', category: '設置・作業', feeType: '月額料金', amountYen: 15000, status: '使用中', amountKind: '機種参照', unit: '台', trigger: 'contract.vmLease', auto: 'auto', targetCourses: ['ESライト（自販機）'], targetModelKinds: ['自販機'],
    note: 'ESライト（自販機）の子契約に自動で付く。1台の金額の初期値＝拠点の自販機の機種マスタの月額（契約ごとに直せる）× 台数。REQ-PM-054・REQ-CT-303/304' }),
] as OptRow[]).map((o): Option => ({ ...o, taxRateId: TAX_STD }));

/*
 * 値引き。DC000003（スタンダードアップ差額）は DC000021 に統合（2026/10/03 回答・終了）。
 * DC000001・002 は 2026/10/03 決定（案A）で【仮】として追加（金額・期間はお客様に未確認）。
 * DC000004・007〜012（決定の根拠がないデモの値引き）は入れない（案は 00_確認してほしい/オプション・値引き_定義_20261003.md §9）
 */
export const DISCOUNTS: Discount[] = [
  { id: 'DC000001', name: '代理店割引', mgmtName: '代理店割引（料率）【仮】', target: 'プラン料金', status: '使用中', calcKind: 'rate', ratePct: 5, capYen: 5000, months: null,
    autoCondition: '代理店のある契約だけ', trigger: 'manual', auto: 'manual',
    note: '【仮】料率5%（上限 ¥5,000）・プラン料金から。代理店（agencyId）のある契約だけ。金額はお客様に未確認。紹介フィー（ESが代理店へ払う）とは別' },
  { id: 'DC000002', name: '初回キャンペーン割引', mgmtName: '初回キャンペーン割引【仮】', target: 'プラン料金', status: '使用中', calcKind: 'fixed', amountYen: 3000, months: 3,
    trigger: 'manual', auto: 'manual',
    note: '【仮】固定 ¥3,000 × 3ヶ月・プラン料金から。運営が手で付ける。金額・期間はお客様に未確認' },
  { id: 'DC000003', name: 'スタンダードアップ差額', mgmtName: 'スタンダードアップ差額（ライト→スタンダード・既存のお客様）', target: 'プラン料金', status: '終了', calcKind: 'liteBase', months: null, trigger: 'manual', auto: 'manual',
    note: '終了：DC000021（旧ライト→スタンダード移行割）に統合（28-170 → 7-2・2026/10/03 回答）' },
  { id: 'DC000005', name: '春の新規キャンペーン', target: 'プラン料金', status: '終了', calcKind: 'rate', ratePct: 20, trigger: 'manual', auto: 'manual', note: '過去の例（終了）' },
  { id: 'DC000006', name: '夏季キャンペーン', target: 'プラン料金', status: '削除済', calcKind: 'rate', ratePct: 10, trigger: 'manual', auto: 'manual', note: '過去の例（削除済）' },
  { id: 'DC000013', name: 'お試しキャンペーン割引', mgmtName: 'お試しキャンペーン割引', target: 'プラン料金', status: '使用中', calcKind: 'refPlan', refPlanId: 'ES000003', refCourse: LIGHT_FRIDGE, maxPerCorp: 1,
    autoCondition: '契約種別＝お試しキャンペーン', trigger: 'event.trialChild', auto: 'auto', months: null,
    note: '50プラン ESライト（冷蔵庫）の料金分。請求額を超えない。法人ごとに1回（同じ月に1拠点だけ）。延長の月は割引しない（プラン料金を請求）' },
  /* 7-2：今のライトのお客様がスタンダードに上げるとき、基本料金をライト（冷蔵庫）の価格のままにする。冷凍庫は機種マスタの月額をいただく */
  { id: 'DC000021', name: '旧ライト→スタンダード移行割', mgmtName: '旧ライト→スタンダード移行割', target: 'プラン料金', status: '使用中', rule: 'liteBase', calcKind: 'liteBase', months: null, acceptFrom: '', acceptTo: '',
    autoCondition: 'プランの変更（ライト→スタンダード）の承認', trigger: 'event.planUpMigrate', auto: 'auto',
    note: '基本料金＝同じプランの ESライト（冷蔵庫）の価格。冷凍庫の賃料は別（機種マスタの月額）。旧 DC000003 を統合' },
];

/** 倉庫の担当者（メイン担当者。倉庫の登録・編集の担当者の表） */
const mc = (name: string, kana: string, email: string, tel: string) => ({ kind: 'メイン担当者' as const, name, kana, email, tel });
export const WAREHOUSES: Warehouse[] = [
  { id: 'WH00001', type: 'picking', name: '関東倉庫', address: addr('神奈川県', '厚木市', '中町1-2-3', '', '243-0018'), tel: '046-000-0001', thomasCode: 'KNT-01', carrierId: '', branchCode: '', status: '有効', slipName: 'ESキッチン 関東倉庫', kana: 'カントウソウコ', contacts: [mc('加藤真由美', 'カトウ マユミ', 'kanto-wh@esstation.example.jp', '046-000-0001')] },
  { id: 'WH00002', type: 'picking', name: '関西倉庫', address: addr('大阪府', '茨木市', '駅前1-2-3', '', '567-0888'), tel: '072-000-0002', thomasCode: 'KNS-01', carrierId: '', branchCode: '', status: '有効', slipName: 'ESキッチン 関西倉庫', kana: 'カンサイソウコ', contacts: [mc('森田 修', 'モリタ オサム', 'kansai-wh@esstation.example.jp', '072-000-0002')] },
  { id: 'WH00003', type: 'picking', name: '中部倉庫', address: addr('愛知県', '小牧市'), tel: '', thomasCode: '', carrierId: '', branchCode: '', status: '有効' },
  { id: 'WH00004', type: 'picking', name: 'ES事務所（資材）', address: addr('東京都', '（ES事務所）'), tel: '03-0000-0004', thomasCode: '', carrierId: '', branchCode: '', status: '有効' },
  { id: 'HU00123', type: 'relay', name: 'ヤマト 渋谷営業所', address: addr('東京都', '渋谷区'), tel: '', thomasCode: '', carrierId: 'DE00002', branchCode: '', status: '有効' },
  { id: 'HU00124', type: 'relay', name: 'ヤマト 品川営業所', address: addr('東京都', '品川区', '東品川5-1-1', '', '140-0002'), tel: '03-5555-0124', thomasCode: '', carrierId: 'DE00002', branchCode: '', status: '有効' },
  { id: 'HU00210', type: 'relay', name: '佐川 江東営業所', address: addr('東京都', '江東区'), tel: '', thomasCode: '', carrierId: 'DE00003', branchCode: '', status: '有効' },
  { id: 'HU00301', type: 'relay', name: '栄成ロジ 川崎デポ', address: addr('神奈川県', '川崎市川崎区'), tel: '044-000-0301', thomasCode: '', carrierId: 'DE00001', branchCode: 'KWS', status: '有効' },
  { id: 'RT00001', type: 'return', name: 'ESキッチン 本社', address: addr('東京都', '（本社）'), tel: '03-0000-0001', thomasCode: '', carrierId: '', branchCode: '', status: '有効' },
];

const YAMATO_URL = 'https://toi.kuronekoyamato.co.jp/cgi-bin/tneko?number00=1&number01={送り状番号}';

/** DE00000＝ES配送便（自社）。自社ドライバーの所属先として置く（運営の一覧の「ES配送便（自社）」） */
export const CARRIERS: Carrier[] = ([
  { id: 'DE00000', name: 'ES配送便（自社）', kind: '自社', areas: ['関東'], weekdays: '月〜土', temps: ['冷蔵', '冷凍', '常温'], feePerDelivery: 0, trackingUrl: '', status: '有効' },
  { id: 'DE00001', name: '栄成ロジ', kind: '委託・引き取り', areas: ['関東', '中部'], weekdays: '月〜土', temps: ['冷蔵', '冷凍', '常温'], feePerDelivery: 2000, areaFees: [{ area: '関東', feeYen: 2000 }, { area: '中部', feeYen: 2300 }], trackingUrl: '', status: '有効' },
  { id: 'DE00002', name: 'ヤマト運輸', kind: '路線', areas: ['全国'], weekdays: '月〜日', temps: ['冷蔵', '冷凍', '常温', '資材'], feePerDelivery: 0, trackingUrl: YAMATO_URL, status: '有効' },
  { id: 'DE00003', name: '佐川急便', kind: '路線', areas: ['全国'], weekdays: '月〜土', temps: ['冷蔵', '冷凍', '常温'], feePerDelivery: 0, trackingUrl: '', status: '有効' },
  { id: 'DE00004', name: '福山通運', kind: '路線', areas: ['西日本'], weekdays: '月〜金', temps: ['常温', '資材'], feePerDelivery: 0, trackingUrl: '', status: '有効' },
  { id: 'DE00006', name: 'みどり便', kind: '委託・引き取り', areas: ['中部', '関西'], weekdays: '火〜土', temps: ['冷蔵', '冷凍', '常温'], feePerDelivery: 1800, trackingUrl: '', status: '有効' },
  { id: 'DE00007', name: '山本配送（個人）', kind: '委託・引き取り', areas: ['関東'], weekdays: '火・木・土', temps: ['冷蔵', '常温'], feePerDelivery: 1500, trackingUrl: '', status: '有効' },
] as Carrier[]).map((c): Carrier => (c.kind === '委託・引き取り' ? { ...c, feeTaxRateId: TAX_STD } : c));

const dr = (id: string, carrierId: string, name: string, kana: string, status: Driver['status'] = '有効', areas = ['関東']): Driver => ({
  id, carrierId, name, kana, tel: `090-0000-${id.slice(-4)}`, email: `${id.toLowerCase()}@driver.example.jp`,
  employment: carrierId === 'DE00000' ? 'self' : 'partner', areas, status,
});

export const DRIVERS: Driver[] = [
  dr('DR00001', 'DE00000', '小林 翔', 'コバヤシ ショウ'),
  dr('DR00002', 'DE00000', '高橋 誠', 'タカハシ マコト'),
  dr('DR00005', 'DE00000', '中村 亮', 'ナカムラ リョウ', '利用停止'),
  dr('DR00008', 'DE00000', '森 拓海', 'モリ タクミ', '免許未登録'),
  dr('DR00022', 'DE00000', '佐々木 大地', 'ササキ ダイチ'),
  dr('DR00011', 'DE00001', '斉藤 健太', 'サイトウ ケンタ', '有効', ['関東']),
  dr('DR00014', 'DE00001', '山口 健', 'ヤマグチ ケン', '有効', ['関東']),
  dr('DR00015', 'DE00001', '石田 光', 'イシダ ヒカル', '有効', ['中部']),
  dr('DR00018', 'DE00001', '西村 陽介', 'ニシムラ ヨウスケ', '無効'),
  dr('DR00041', 'DE00006', '西村 拓也', 'ニシムラ タクヤ', '有効', ['関西']),
  dr('DR00045', 'DE00007', '山本 修', 'ヤマモト オサム'),
].map((d): Driver => (
  /* スタッフ区分（個人／会社所属・hong 2026-10-06）：自社（ES配送便）・委託配送先のスタッフは会社所属。個人で請けているスタッフを見本に2人 */
  ({ ...d, staffKind: ['DR00045', 'DR00022'].includes(d.id) ? '個人' : '会社所属' })
));

/**
 * 委託配送先の ES配送費（委託配送先詳細の「ES配送費」タブ。CSV取込・CSV出力で直す：hong 2026-10-06）。
 * 見本：栄成ロジ（DE00001）・みどり便（DE00006）・山本配送（DE00007）。金額は税抜・架空
 */
const esFee = (carrierId: string, n: number, pref: string, gun: string, town: string, actual: 'あり' | 'なし', feeYen: number, add1Yen: number, add2Yen: number, note = '', similar: 'あり' | 'なし' = 'なし'): CarrierEsFee =>
  ({ id: `EF-${carrierId}-${String(n).padStart(3, '0')}`, carrierId, pref, gun, town, actual, feeYen, add1Yen, add2Yen, note, similar });
export const CARRIER_ES_FEES: CarrierEsFee[] = [
  esFee('DE00001', 1, '東京都', '', '千代田区', 'あり', 2000, 0, 0),
  esFee('DE00001', 2, '東京都', '', '港区', 'あり', 2000, 0, 0),
  esFee('DE00001', 3, '東京都', '', '中央区', 'あり', 2000, 0, 0),
  esFee('DE00001', 4, '東京都', '', '府中市', 'なし', 2200, 300, 500, '多摩地区は地域加算'),
  esFee('DE00001', 5, '東京都', '西多摩郡', '瑞穂町', 'なし', 2200, 500, 800, '', 'あり'),
  esFee('DE00001', 6, '神奈川県', '横浜市', '西区', 'あり', 2000, 0, 0),
  esFee('DE00001', 7, '神奈川県', '横浜市', '中区', 'あり', 2000, 0, 0),
  esFee('DE00001', 8, '神奈川県', '川崎市', '川崎区', 'あり', 2000, 0, 0),
  esFee('DE00001', 9, '神奈川県', '愛甲郡', '愛川町', 'なし', 2200, 400, 700, '', 'あり'),
  esFee('DE00001', 10, '埼玉県', 'さいたま市', '大宮区', 'あり', 2100, 0, 0),
  esFee('DE00001', 11, '千葉県', '', '船橋市', 'なし', 2100, 200, 300),
  esFee('DE00001', 12, '愛知県', '名古屋市', '中区', 'あり', 2300, 0, 0, '中部は 2,300円'),
  esFee('DE00006', 1, '愛知県', '名古屋市', '中村区', 'あり', 1800, 0, 0),
  esFee('DE00006', 2, '大阪府', '大阪市', '北区', 'あり', 1800, 0, 0),
  esFee('DE00006', 3, '京都府', '京都市', '中京区', 'なし', 1900, 200, 300),
  esFee('DE00007', 1, '東京都', '', '世田谷区', 'あり', 1500, 0, 0),
  esFee('DE00007', 2, '東京都', '', '目黒区', 'なし', 1500, 100, 200),
];

/* 商品（M001〜M032）・税率・商品タグ・商品カテゴリ・商品の変更履歴は seed/products.ts */
export { PRODUCTS, PRODUCT_CATEGORIES, PRODUCT_HISTORY, PRODUCT_TAGS, TAX_RATES } from './products';

/*
 * 資材：仕入先 SP00009 の品番。priceYen＝単価（税抜・既定 0）。コース・単位・規格・写真・公開ステータス・取扱倉庫もここ（資材マスタ1か所。
 * 法人Web・運営の資材注文もここを読む：受付簿 #358）。規格は運営で足したもの。取扱倉庫の初期値は ES事務所（WH00004）
 */
const ALLC: Course[] = ['ESスタンダード', 'ESライト（冷蔵庫）', 'ESライト（自販機）'], LTC: Course[] = ['ESライト（冷蔵庫）', 'ESライト（自販機）'];
export const MATERIALS: Material[] = ([
  ['S001', '割り箸', ALLC, '膳', '24cm・個包装'],
  ['S002', 'スプーン', ALLC, '本', 'プラスチック・個包装'],
  ['S003', 'フォーク', ALLC, '本', 'プラスチック・個包装'],
  ['S004', '深皿', ALLC, '枚', 'φ150mm・耐熱'],
  ['S005', '深皿フタ（ライト）', LTC, '枚', 'φ150mm用'],
  ['S006', '深皿フタ（スタンダード）', ['ESスタンダード'], '枚', 'φ150mm用・レンジ対応'],
  ['S007', 'おしぼり', ALLC, '個', '個包装'],
  ['S008', 'ゴミ袋（45L）', ALLC, '枚', '45L・半透明'],
  ['S009', '保冷用ビニール袋', ['ESスタンダード'], '枚', '300×400mm'],
] as [string, string, Course[], string, string][]).map(([id, name, courses, unit, spec], i): Material =>
  ({ id, name, priceYen: 0, taxRateId: TAX_STD, courses, unit, spec, photo: `photo:資材:${40 + i}`, publish: '公開', warehouseIds: ['WH00004'], status: '有効' }));
/* 資材の単価は 0円（無料）。有料の資材は運営が資材マスタで単価を入れる（プランの数量を超えた分を請求・2026/10/03 回答） */

export const TROUBLE_TYPES: TroubleType[] = [
  { id: 'qty_diff', name: '数量相違', autoChild: false },
  { id: 'wrong_delivery', name: '誤配送', autoChild: true },
  { id: 'damage', name: '破損・品質不良', autoChild: true },
  { id: 'absent', name: '不在・受け取り不可', autoChild: true },
  { id: 'delay', name: '遅延', autoChild: false },
  { id: 'other', name: 'その他', autoChild: false },
  /* 種別未定：アプリの「商品不足・誤配送」・検品の差異など、運営が解決のときに6区分を付けるもの（配送_07 §13-1。6区分ではない・自動の子は作らない） */
  { id: 'undecided', name: '種別未定', autoChild: false },
];

/**
 * 取引先のマスタの変更履歴の見本（dm.master.partnerHistory。運営の各マスタの詳細の「変更履歴」タブ：P-HIST）。
 * 変更者は運営のアカウントID（画面では名前）か「CSV取込」
 */
type PartnerHistSeed = { id: string; kind: 'suppliers' | 'carriers' | 'warehouses' | 'drivers'; targetId: string; at: string; what: string; by: string };
const ph = (kind: PartnerHistSeed['kind'], targetId: string, n: number, at: string, what: string, by = 'Ad00010'): PartnerHistSeed =>
  ({ id: `${kind}:${targetId}:${String(n).padStart(4, '0')}`, kind, targetId, at, what, by });
export const PARTNER_HISTORY: PartnerHistSeed[] = [
  ph('suppliers', 'SP00001', 1, '2026/04/01 10:00', 'データ登録'),
  ph('suppliers', 'SP00001', 2, '2026/06/12 14:20', '担当者を更新'),
  ph('suppliers', 'SP00001', 3, '2026/09/01 09:05', '発注方法を「メール → ESステーション」に変更', 'CSV取込'),
  ph('carriers', 'DE00001', 1, '2026/03/10 11:00', 'データ登録'),
  ph('carriers', 'DE00001', 2, '2026/07/01 09:30', '対応エリアを更新・配送不可曜日を「（空） → 日・祝日」に変更'),
  ph('carriers', 'DE00001', 3, '2026/09/15 16:40', 'ES配送費を追加（東京都西多摩郡瑞穂町）', 'CSV取込'),
  ph('warehouses', 'WH00001', 1, '2026/02/01 10:00', 'データ登録'),
  ph('warehouses', 'WH00001', 2, '2026/08/20 13:15', '電話番号を「046-000-0000 → 046-000-0001」に変更'),
  ph('drivers', 'DR00001', 1, '2026/03/01 09:00', 'データ登録'),
  ph('drivers', 'DR00001', 2, '2026/05/18 17:45', '区分を「個人 → 会社所属」に変更'),
  ph('drivers', 'DR00011', 1, '2026/04/05 10:30', 'データ登録', 'CSV取込'),
];
