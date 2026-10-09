/*
 * 全サイト共通の業務データ（正規化した形）。運営・法人・委託配送先・ドライバー・仕入先・システム管理の画面は、
 * ここの型のデータを読み書きする（画面の表示用の形は各サイトの query で作る）。
 * 正の元データ：01_仕様/90_デモ確認/共通サンプルデータ_20261002.md、ID の形：01_仕様/基本設計_全体の定義_提案_20261001.md §6-3
 * 日付は 'YYYY/MM/DD'、日時は 'YYYY/MM/DD HH:mm'、サイクル月は 'YYYY-MM'。
 */

import type { Grants } from '@/lib/ops/permissions';

export type Address = { zip: string; pref: string; city: string; addr1: string; addr2: string };

/* ===================== 法人・拠点・契約（area: org） ===================== */

/** 取消＝仮登録のあとに申込を却下・取り下げした（台帳 2026/10/03） */
export type CorpStatus = '仮登録' | '正式登録' | '休眠' | '取消';
export type PayMethod = '口座振替' | '銀行振込' | 'クレジットカード';
export type Billing = {
  /** 請求のリードタイム（-1＝1ヶ月前請求） */
  lead: -3 | -2 | -1 | 0 | 1;
  invoiceUnit: 'まとめて発行（法人1通）' | '拠点ごと発行';
  payMethod: PayMethod;
  debitStatus: '未手続き' | '手続き中' | '完了' | '';
  payCycle: '月払い' | '年払い';
  dueRule: '請求月の27日' | '請求月の翌月27日';
  billonePayerId: string;
};

/** 法人（org.corps）。ID＝CU＋5桁（拠点と同じ連番） */
export type Corp = {
  id: string;
  name: string;
  contractName: string;
  kana: string;
  billToName: string;
  status: CorpStatus;
  /** ES営業担当（運営アカウント Ad…） */
  salesRepId: string;
  address: Address;
  tel: string;
  fax: string;
  billing: Billing;
  registeredAt: string;
  /** ご注文のリマインド（締切の7日前・3日前のお知らせ）。false＝送らない（法人が法人Web の法人情報で切り替える・2026-10-03 決定）。省く＝送る */
  orderReminder?: boolean;
  /** データの出どころ。'移行'＝フェーズ1から移行 CSV で入れた（受付簿 No.28・契約_01 §9-1）。省く＝フェーズ2 で作った */
  source?: '移行';
  /** 移行で空だったので既定値を入れた請求条件の項目（支払い方法・支払サイクル・発行時期・発行単位）。運営が請求条件を直したら消える（「要補完」一覧） */
  billingBlank?: string[];
};

export type ContactKind = 'メイン担当者' | '請求担当者' | 'サブ担当者';
/** 担当者（org.contacts）。法人・拠点・委託配送会社・仕入先のどれかに付く */
export type Contact = {
  id: string;
  owner: { type: 'corp' | 'branch' | 'carrier'; id: string };
  kind: ContactKind;
  name: string;
  kana: string;
  email: string;
  tel: string;
};

/** 拠点の状態。休止は契約（Contract.status＝利用休止）から決まる（仕様整理 §6-2） */
export type BranchStatus = '仮登録' | '本登録' | '閉鎖予定' | '閉鎖' | '取消';
/** 拠点（org.branches）。ID＝CU＋5桁。法人なしの拠点は corpId＝null */
export type Branch = {
  id: string;
  corpId: string | null;
  name: string;
  kana: string;
  status: BranchStatus;
  employees: number;
  /** 当初契約開始日 */
  originalStartOn: string;
  address: Address;
  tel: string;
  fax: string;
  /** 受取できる時間帯（配送に写す） */
  receiveWindows: { from: string; to: string }[];
  /** 設置場所・納品の条件 */
  deliveryNote: string;
  /** 設置フロア（申込で聞く。自販機は必須・冷蔵庫は任意：台帳 2026/10/03） */
  floor?: string;
  note: string;
  registeredAt: string;
  /**
   * 棚卸なし（課題 2-1・2026/10/02 決定：拠点ごと）。true の拠点は管理ロスを出さない・点検の督促（未申告の一覧・事務手数料）を出さない。
   * 運営の画面は差分率の代わりに「棚卸なし」。運営の拠点の画面（法人・契約）で変える
   */
  noStockCheck?: boolean;
  /** データの出どころ（'移行'＝移行 CSV。Corp.source と同じ） */
  source?: '移行';
  /** 納品の条件（移行 CSV：納品不可曜日・納品不可になった場合・消費期限の短い商品の扱い。配送を作るときに使う。空＝要補完） */
  deliveryCond?: { ngDays: string[]; shift: '前倒す' | '後ろ倒す' | ''; short: '通常' | '短消費期限なし' | '' };
};

export type ContractKind = '本導入' | 'お試しキャンペーン';
export type ContractStatus = '仮登録' | '有効' | '解約手続き中' | '停止' | '利用休止' | '終了' | '取消';
/** 親契約（org.contracts）。拠点に1つ。ID＝CP＋7桁。お試し→本導入も同じ親契約（kindHistory に残す） */
export type Contract = {
  id: string;
  branchId: string;
  kind: ContractKind;
  kindHistory: { kind: ContractKind; from: string }[];
  status: ContractStatus;
  /** 開始サイクル月 */
  startCycle: string;
  /** 終了日（解約・終了のとき） */
  endOn: string;
  agencyId: string;
  billTo: '法人' | 'この拠点';
  /** billTo＝この拠点のときだけ使う */
  billing: Billing | null;
  /**
   * お試しの延長の記録（古い順・運営だけが延長できる。2026/10/03 決定）。お試しの期間（開始・終了のサイクル月）は お試しの子契約 から決まる。
   * 延長の月の子契約は お試しキャンペーン割引（DC000013）を付けない＝プラン料金を請求（台帳 K1・lib/domain/trial.ts）
   */
  trialExt?: TrialExtension[];
  /** データの出どころ（'移行'＝移行 CSV） */
  source?: '移行';
  /** 移行で空だった請求条件（billTo＝この拠点のときの billing。Corp.billingBlank と同じ） */
  billingBlank?: string[];
  /**
   * 移行のときの記録。at＝取り込んだ日時、courseBlank＝コースが空で既定（ESライト）にした、courseDefault＝そのとき入れたコース
   * （自販機の貸出があれば ESライト（自販機）に合わせ直す：lib/domain/migrate.ts）
   */
  migration?: { at: string; courseBlank: boolean; courseDefault: Course | ''; /** 移行で子契約を作った最初・最後のサイクル月 */ cycles?: [string, string]; /** 適用中の価格世代の名前（A の「適用中の価格世代」） */ gen?: string };
};
/** お試しの延長1回（fromCycle〜toCycle＝足したサイクル月・childIds＝作った子契約） */
export type TrialExtension = { at: string; by: string; months: number; fromCycle: string; toCycle: string; note: string; childIds: string[] };

export type Course = 'ESスタンダード' | 'ESライト（冷蔵庫）' | 'ESライト（自販機）';
export type ServiceForm = 'ES配送便' | 'COOL便' | '資材便';
/** 運び手：自社ドライバー／委託ドライバー／路線便（ヤマトなど。ドライバーなし・完了は推定） */
export type Regime = 'self' | 'partner_driver' | 'parcel_carrier';
export type TempType = '冷蔵' | '冷凍' | '常温' | '資材';

/** 配送の流れ（子契約に写す）。slots＝お届けするサイクルの枠（A1〜D7） */
export type Channel = {
  temp: TempType;
  serviceForm: ServiceForm;
  regime: Regime;
  warehouseId: string;
  /** 中継（ハブ）を通すとき */
  hubId: string;
  /** 区間1（倉庫→拠点 または 倉庫→ハブ）の運び手。路線便は DE00002 など */
  carrierId: string;
  /** 区間2（ハブ→拠点）の運び手 */
  carrier2Id: string;
  /** 担当ドライバー（委託は委託配送先が割り当てる。路線便は ''） */
  driverId: string;
  /** 出荷日→お届け日の日数 */
  leadDays: number;
  slots: string[];
  mealsPerDelivery: number;
  /** 回ごとのルートの上書き（キー＝枠 A1〜D7。配送回数追加の回など、この回だけ倉庫・運び手・中継を変える：2026/10/03 案B）。lib/domain/route.ts の routeOfSlot で引く */
  slotRoutes?: Record<string, SlotRoute>;
};
/** 回ごとのルート（倉庫・運び手①②・中継・運び手の種類） */
export type SlotRoute = Pick<Channel, 'warehouseId' | 'hubId' | 'carrierId' | 'carrier2Id' | 'regime'>;

/** 子契約（org.childContracts）。親契約×サイクル月。ID＝CP0000002-202610 */
export type ChildContract = {
  id: string;
  contractId: string;
  branchId: string;
  cycleMonth: string;
  kind: ContractKind;
  planId: string;
  course: Course;
  channels: Channel[];
  optionIds: string[];
  discountIds: string[];
  /** 月額（税抜・円） */
  monthlyYen: number;
  /**
   * guestSplit＝ゲストモードのフラグ（使える）と OP000003（料金）が違うのは決まりどおり（保存した時点で使える・料金は締切ルール：台帳 2026/10/03）。
   * true の子契約は A型のそろえ（syncLinked・check）でゲストモードを見ない
   */
  app: { allowCash: boolean; allowGuest: boolean; allowEsqr: boolean; dailyCapMeals: number; guestSplit?: boolean };
  /**
   * 配送回数追加（OP000001）の回数：温度帯ごとにプランの標準の配送回数を超えた回数（足りない温度帯と相殺しない・28-154・28-156）。
   * 便（channels）から決まる（lib/domain/charges.ts の deliveryExtraOf）。① 費目は 回数の合計 × 金額
   */
  deliveryExtra?: { cool: number; frozen: number };
  /** オプションの金額の上書き（オプション ID → 税抜の円。REQ-CT-304：ES-QR の既存のお客様 0円・自販機リース・初期費用など） */
  amounts?: Record<string, number>;
  /**
   * 福利厚生の適用（28-150・台帳 E 2026-10-05）。ON＝請求書でプラン料金を「基本料金（10%）」「福利厚生（企業負担分・8%）」の2行に分けて出す、
   * OFF（既定・省く）＝請求書では1行にまとめて出す。① 費目はどちらでも2行・消費税も2つの税率で計算（金額・税は変わらない）。運営のシステム管理だけが直す
   */
  welfareOn?: boolean;
  /** オプションの数（オプション ID → 数。省くと1。自販機リース OP000037＝自販機の台数：台帳 2026/10/03。配送回数追加は deliveryExtra） */
  optionQty?: Record<string, number>;
  /** 適用された価格プラン（プランの価格世代の ID・28-181）。省くとサイクル月の世代（適用開始 ≦ サイクル月のいちばん新しい世代）。価格は配送方法（channels の serviceForm）で選ぶ */
  priceGenId?: string;
  /** 請求の状態（法人から見えるのは 未確定／確定／請求済） */
  billStatus: '未確定' | '確定' | '請求済';
  gen: '日次バッチ' | '手動生成' | '年一括';
  /** 商品の価格と精算 */
  pricing: ContractPricing;
  /**
   * ① 費目の写し（前払い。v2.3「子契約の①費目行は生成時に金額を固める」）。子契約を作ったとき・未確定の子契約のプラン／コース／オプション／値引きを変えたときに、
   * その時点のマスタから作る（lib/domain/snapshot.ts の feesOf）。請求の画面・請求書はこの値を使い、マスタの価格を変えても作った子契約は変わらない。
   * 未確定の子契約に新しい価格を当てるときは org.repriceChildren（価格世代の切り替え・誤りの訂正）。確定・請求済には当てない（請求調整）
   */
  fees?: ChildFees;
  /**
   * 取り消した子契約（休止・解約で、その月を配送しなくなったもの。決定 28-12）。データは残し、運営の子契約一覧には『取消』として出す（台帳 運営A 2026-10-06）。法人Web・請求・配送などには出さない。
   * 確定・請求済の子契約は取り消さない（請求調整）
   */
  canceled?: { at: string; reason: string; applicationId: string };
  /**
   * ① 費目のほかに請求する額（設備の異動・違約金・入れ替えの配送など。税抜・10%）。単発＝この子契約の請求書だけ、月額＝毎月（org.addChild が引き継ぐ）。
   * 申請の承認で付ける（applicationId）。金額は運営が承認の前に直せる
   */
  extras?: ExtraFee[];
};

/** 子契約の ① 費目のほかの額（lib/domain/lifecycle.ts） */
export type ExtraFee = {
  name: string; amountYen: number; taxRate: number; kind: '単発' | '月額';
  src: '設備の異動' | '入れ替えの配送' | 'サイズ差額' | '冷凍庫の賃料' | 'お試し設備の差額' | '違約金';
  applicationId: string;
};

/** 子契約の ① 費目の1行（税抜・円）。src＝元のマスタ（plan＝プランの基本料金・福利厚生、option、discount）、refId＝そのマスタの ID */
export type FeeLine = { name: string; amountYen: number; taxRate: number; src: 'plan' | 'option' | 'discount'; refId: string };
/** 子契約の ① 費目の写し。at＝写した日時、meals＝プランの月次提供上限（福利厚生の元） */
export type ChildFees = { at: string; meals: number; lines: FeeLine[] };

/**
 * 商品の価格と精算（子契約）。
 *   通常価格／従量：商品マスタの販売価格（税込）で、売れた数だけ請求（実績精算）
 *   企業独自価格／買取：prices（品番 → 税込の円）で、届けた数だけ請求。売れ残りは企業の負担（lib/domain/product.ts の buyoutOf）
 */
export type ContractPricing = { mode: '通常価格' | '企業独自価格'; billing: '従量' | '買取'; prices: Record<string, number> };

/** 休止（org.pauses）。休止中は配送を作らない */
export type Pause = {
  id: string; contractId: string; fromCycle: string; toCycle: string; resumeCycle: string; applicationNo: string; keepEquipment: boolean; reason: string;
  /**
   * 取り消した休止（まだ始まっていない休止を『再開』の申請で取り消したもの・台帳 運営A 2026-10-06）。休止期間は0か月（toCycle＝開始の前の月・再開＝開始月）。
   * 履歴に残し、通算1年には入れない。cancelApplicationNo＝取り消した再開の申請
   */
  voided?: boolean; cancelApplicationNo?: string;
};
/**
 * 終わりが決まっていない休止の toCycle（移行 No.28：フェーズ1の「休止中」には休止の期間・再開月がない。要補完「休止の期間・再開月」で運営が決める）。
 * 期間の月数に数えない・画面には「未定」と出す。再開の申請（lifecycle.applyResume）で toCycle が実際の月に直る
 */
export const PAUSE_OPEN = '9999-12';
export const isOpenPause = (p: { toCycle: string }) => p.toCycle === PAUSE_OPEN;
/**
 * 代理店（org.agencies）。ID＝AG＋5桁。feePlanId＝既定の紹介フィープラン（dm.referral.feePlans）。
 * 担当者・変更履歴は代理店の中に持つ（代理店の担当者は org.contacts に置かない）
 */
export type Agency = {
  id: string; name: string; kana: string; feePlanId: string; status: '有効' | '無効' | '削除済';
  tel: string; fax: string; address: Address; note: string;
  contacts: { kind: ContactKind; name: string; kana: string; email: string; tel: string }[];
  history: { at: string; what: string; by: string }[];
};
/** 貸出（org.loans）。ID＝LN-#### */
export type Loan = {
  id: string; branchId: string; modelId: string; qty: number; startOn: string; status: '貸出中' | '回収予定' | '回収済';
  /** 最低利用期間を数え始める日（お試し中に置いた設備は本導入の開始日から・決定 28-17。省くと startOn） */
  countFrom?: string;
  /** 回収予定日・返却予定日（解約日・設備の異動の日。回収の配送は作らない＝運営が回収したら「回収済」） */
  dueOn?: string;
  /** 回収した日 */
  returnedOn?: string;
  /** この行を作った・変えた申請 */
  applicationId?: string;
  /** 移行 CSV（設備B）で入れた。startOnBlank＝貸出日が空だったので推定の日付を入れた（最低利用期間・違約金は「推定」。「要補完」一覧に出す） */
  source?: '移行';
  startOnBlank?: boolean;
  note?: string;
};

/* ===================== マスタ（area: master） ===================== */

/**
 * コースごとの価格（税抜・月額）。配送方法ごとに2つ持つ（台帳 E「プランの価格の持ち方（価格世代）」・F「プランマスタの価格の持ち方」2026-10-05）：
 *   coolYen＝価格（COOL便）、esYen＝価格（ES配送便）。ESライト（自販機）は ES配送便だけ（coolYen を持たない）。
 *   monthlyYen＝配送方法ごとの価格がないときの値（ES配送便の価格と同じにしておく。古いデータの互換）。読むときは lib/domain/snapshot.ts の yenOf
 */
export type PlanCoursePrice = { course: Course; monthlyYen: number; coolYen?: number; esYen?: number };
/** プラン（master.plans）。ID＝ES＋6桁 */
export type Plan = {
  id: string; name: string; monthlyMeals: number; public: boolean; status: '有効' | '削除済'; prices: PlanCoursePrice[];
  /**
   * 価格世代（課題 7-1 Q1・7-2）。fromCycle のサイクル月から prices の代わりにこの価格を使う（いちばん新しい fromCycle ≦ 子契約のサイクル月）。
   * 足しただけでは作った子契約は変わらない（① 費目の写し）。一括変更（bulk・価格世代）で未確定の子契約に当てる。省くと prices だけ
   */
  priceGens?: PriceGen[];
  /**
   * 温度帯ごとの月次提供上限と標準の配送回数（決定 28-153・28-154）。temp＝冷蔵（冷蔵・常温）／冷凍。
   * 1回の納品数＝月次提供上限 ÷ 配送回数（契約の配送回数）。ESライトは冷凍の行を持たない
   */
  limits?: PlanLimit[];
  /** 標準貸出設備（決定 28-182。載っている機種・台数は無料。載っていない機種・台数を超えた分は機種マスタの月額） */
  stdEquipment?: PlanEquipment[];
  /** 基本料金の税率（master.taxRates。省くと TX02 10%・lib/domain/tax.ts） */
  taxRateId?: string;
  /** 企業負担分（福利厚生）の税率（省くと TX01 8%・決定 28-149） */
  welfareTaxRateId?: string;
  /** 企業負担額（税込・1食。省くと 100円・28-147）。企業負担分（税抜）＝ 企業負担額 × 月次提供上限の合計 ÷（1＋税率）の1円未満切り捨て（28-148） */
  welfareYenPerMeal?: number;
  /** 免責金額（実績精算の管理ロスの許容額・税込。省くと 0） */
  deductibleYen?: number;
  /** 基本比×倍（デフォルト注文＝基準注文数 50 × この倍。省くと 月次提供上限の合計 ÷ 50） */
  baseRatio?: number;
  /** 残りわずか率（％）・利用人数目安（表示用）：持つだけ（使う画面はあとで決める・2026/10/03 回答） */
  lowStockRate?: number;
  peopleText?: string;
  /** 初期備品（資材の初期セット・コースごとの資材と数。28-129） */
  initialItems?: { course: Course; materialId: string; qty: number }[];
  /** プランに含む資材の数（1サイクル月あたり。超えた分は資材の単価で請求。載っていない資材は 0） */
  includedMaterials?: { materialId: string; qty: number }[];
  /** 最後に画面で保存した日時（yyyy-mm-dd HH:MM。一覧の「更新日」の検索。見本データは持たない） */
  updatedAt?: string;
};
export type PlanLimit = { course: Course; temp: '冷蔵' | '冷凍'; meals: number; deliveries: number };
export type PlanEquipment = { course: Course; modelId: string; qty: number };
/** 機種（master.models）。ID＝種類の頭文字＋6桁（RF・FZ・VM・MW・HW・BX） */
export type Model = {
  id: string; name: string; category: '冷蔵庫' | '冷凍庫' | '自販機' | '電子レンジ' | 'ホットウォーマー' | '資材ボックス'; monthlyYen: number; minMonths: number; public: boolean; status: '有効' | '無効' | '削除済';
  /** 解約時の回収額（違約金の元・決定 28-2・28-7。省くと 0） */
  recoveryYen?: number;
  /** 初期料金（税抜・自販機。OP000008 初期費用の初期値。省くと OP000008 のマスタの金額：台帳「自販機の初期費用」2026/10/03） */
  initFeeYen?: number;
  /** 月額・初期・回収額（税抜）の税率（master.taxRates。省くと TX02 10%） */
  taxRateId?: string;
};
/*
 * オプション・値引き（master.options／master.discounts）＝費目のマスタ（Charge）。2026/10/03 決定：1つのマスタ・ID は変えない。
 * 決まり：00_確認してほしい/オプション・値引き_定義_20261003.md §4。コードが使う ID は lib/domain/charges.ts（trigger → ID）だけに書く。
 *   invoiceName（請求書の表示名）＝ name、adminName（管理名・社内用）＝ mgmtName（今あるデータの項目名のまま）
 */
/** 連動タイプA の契約項目（28-43。A型は契約項目と1つのデータ：項目を変えるとオプションも付く・外れる） */
export type ChargeLink = 'deliveryCount' | 'esqr' | 'guestMode' | 'userCash';
/**
 * いつ発生するか（コードと1対1。lib/domain/charges.ts の CHARGE_IDS）。
 *   item.*＝契約項目に連動（A型）、event.*＝システムが決まったときに立てる、manual＝運営が手で付ける、apply＝法人が申込で選ぶ
 */
export type ChargeTrigger =
  | 'item.deliveryOver' | 'item.esqr' | 'item.guest' | 'item.cash'
  | 'event.inventoryUnfiled' | 'event.materialOrderPaid' | 'event.equipSwapOne' | 'event.equipSwapMany' | 'event.equipStairs'
  | 'event.equipSizeDiff' | 'event.equipPickup' | 'event.contractInit' | 'event.trialChild' | 'event.planUpMigrate'
  | 'contract.vmLease' | 'apply' | 'manual';
/** 金額の種類（STEP3追補 §3）。契約ごと＝子契約で金額を入れる（REQ-CT-304・初期値は amountYen） */
/** 機種参照＝機種マスタの値が初期値・契約ごとに直せる（OP000037 自販機リース・OP000008 初期費用：台帳 2026/10/03） */
export type ChargeAmountKind = '固定' | '最低額から' | '都度入力' | '拠点ごと' | '差額で決まる' | '参照' | '契約ごと' | '機種参照';
export type ChargeStatus = '使用中' | '停止中' | '終了' | '削除済';
/** オプション（master.options）。ID＝OP＋6桁 */
/** オプション。削除済＝運営が削除した（データは残す・一覧と選択肢には既定で出さない。課題 4-9） */
export type Option = { id: string;
  /** 請求書の表示名（invoiceName。請求書・法人Web に出る） */
  name: string;
  /** オプション区分（master.optionCategories の名前。台帳 F「オプション区分の持ち方」） */
  category: string; feeType: '月額料金' | '単発料金'; amountYen: number; status: ChargeStatus;
  /** 標準金額（税抜）の税率（master.taxRates。省くと TX02 10%） */
  taxRateId?: string;
  /** 管理名（adminName・社内用・運営の一覧と選択肢に出す。2026/10/03 決定） */
  mgmtName?: string;
  /** 説明・備考（根拠の決定番号・【仮】の金額などのメモ） */
  note?: string;
  /** 連動タイプ（A＝契約項目に連動・システム定義で新規に作れない／none＝連動しない。28-43） */
  linkType?: 'A' | 'none';
  /** A型の契約項目 */
  linkedItem?: ChargeLink;
  /** 金額の種類（省くと 固定） */
  amountKind?: ChargeAmountKind;
  /** 数量にかけるもの（OP000001＝回・OP000022＝台。'' は1件） */
  unit?: '回' | '台' | '件' | '月' | '';
  /** いつ発生するか（省くと manual） */
  trigger?: ChargeTrigger;
  /** 自動で立つ／運営が手で付ける／法人が申込で選ぶ（省くと manual） */
  auto?: 'auto' | 'manual' | 'apply';
  /** 対象のコース・機種区分（空・省くとすべて） */
  targetCourses?: Course[];
  targetModelKinds?: Model['category'][];
};
/**
 * オプション区分マスタ（master.optionCategories・台帳 F「オプション区分の持ち方」2026-10-05）。ID＝OC＋6桁。
 * オプションマスタの「オプション区分」はここから選ぶ。選択肢・請求書の並びは 並び順（sortNo）→ オプションID（「表示順」の欄は持たない）。運営（システム管理）が足せる
 */
export type OptionCategory = { id: string; name: string; sortNo: number; status: '使用中' | '終了' };
/** 値引きの計算区分：fixed＝固定額／rate＝率（上限あり）／diffAuto＝差額自動／refPlan＝参照するプラン・コースの料金（請求額を超えない）／liteBase＝基本料金をライト（冷蔵庫）の価格にする */
export type DiscountCalc = 'fixed' | 'rate' | 'diffAuto' | 'refPlan' | 'liteBase';
export type Discount = {
  /** 削除済＝運営が削除した（データは残す・一覧と選択肢には既定で出さない。課題 4-9）。終了＝ほかの値引きに統合・廃止（ID は再利用しない） */
  id: string;
  /** 請求書の表示名（invoiceName） */
  name: string; target: string; note: string; status: ChargeStatus;
  /** 引き方（旧項目。calcKind と同じ。liteBase＝旧ライト→スタンダード移行割） */
  rule?: 'liteBase';
  /** 税率の扱い「個別に指定」の税率（master.taxRates）。省くと 元の費目と同じ（プラン料金なら 基本料金 10%・企業負担 8%） */
  taxRateId?: string;
  /** 管理名（adminName・社内用） */
  mgmtName?: string;
  /** 計算区分（省くと refPlan のない「プラン料金をすべて」＝旧お試し。lib/domain/charges.ts の discountLines） */
  calcKind?: DiscountCalc;
  /** fixed の金額（税抜）・rate の率（％）と上限（税抜） */
  amountYen?: number; ratePct?: number; capYen?: number;
  /** refPlan の参照するプラン・コース（DC000013＝ES000003 50プラン・ESライト（冷蔵庫）） */
  refPlanId?: string; refCourse?: Course;
  /** 期間（月数。null・省く＝ずっと） */
  months?: number | null;
  /** 法人ごとの回数の上限（DC000013＝1：同じ法人で同じ月に1拠点だけ） */
  maxPerCorp?: number;
  /** 自動で付ける条件（文） */
  autoCondition?: string;
  /** 受付期間（申請期限。空欄可） */
  acceptFrom?: string; acceptTo?: string;
  trigger?: ChargeTrigger;
  auto?: 'auto' | 'manual' | 'apply';
};

/** 倉庫・中継・返送先（master.warehouses）。ID＝WH／HU／RT＋5桁 */
export type Warehouse = {
  id: string;
  type: 'picking' | 'relay' | 'return';
  name: string;
  address: Address;
  tel: string;
  /** ピッキング倉庫（資材）か（type＝picking のとき。省くと名前に「資材」を含むかで決める：lib/ops/general/fromDomain.ts whKind） */
  forMaterial?: boolean;
  /** THOMAS の倉庫コード（連携しない倉庫は ''） */
  thomasCode: string;
  /** 中継のとき、運営している委託配送会社 */
  carrierId: string;
  /** 中継のときの営業所コード */
  branchCode: string;
  status: '有効' | '無効' | '削除済';
  /* ---- 運営の倉庫マスタの登録・編集（AW_WRHS_004・hong 2026-10-06 の参考画面）。省くと空 ---- */
  /** 倉庫名（伝票用）。省くと name */
  slipName?: string;
  kana?: string;
  /** 中継倉庫区分（倉庫区分＝中継倉庫のときだけ）。運送会社＝carrierId が要る */
  relayKind?: '運送会社' | 'それ以外（SC含む）';
  fax?: string;
  note?: string;
  /** 担当者（メイン担当者1人＋サブ担当者）。省くと運営の見本の行（general.warehouse の pic・picTel）から作る */
  contacts?: PartnerContact[];
};

/** 取引先のマスタ（倉庫など）の担当者。メイン担当者はちょうど1人 */
export type PartnerContact = { kind: 'メイン担当者' | 'サブ担当者'; name: string; kana: string; email: string; tel: string };

/**
 * 委託配送先の ES配送費（dm.master.carrierEsFees）。委託配送先詳細の「ES配送費」タブ。CSV取込・CSV出力で直す（画面で1行ずつは直さない・hong 2026-10-06）。
 * actual＝実績有無、add1／add2＝地域加算（配送1回あたり／2回あたり）、similar＝類似住所の有無（絞り込みだけ・列には出さない）
 */
export type CarrierEsFee = {
  id: string; carrierId: string; pref: string; gun: string; town: string; actual: 'あり' | 'なし';
  feeYen: number; add1Yen: number; add2Yen: number; note: string; similar: 'あり' | 'なし';
};

/** 委託配送会社（master.carriers）。ID＝DE＋5桁。路線便はヤマト・佐川・福山の3社だけ */
export type Carrier = {
  id: string;
  name: string;
  kind: '委託・引き取り' | '路線' | '自社';
  areas: string[];
  weekdays: string;
  temps: TempType[];
  /** 1件あたりの支払額（委託・税抜）。エリア別の額がないときの額 */
  feePerDelivery: number;
  /** エリア別の支払額（税抜）。届け先の都道府県のエリア（lib/domain/carrierFee.ts）に合う行があればその額、なければ feePerDelivery（台帳 E 2026-10-05 フェーズ2・受付簿 No.59） */
  areaFees?: { area: string; feeYen: number }[];
  /** 支払額の税率（master.taxRates。省くと TX02 10%） */
  feeTaxRateId?: string;
  trackingUrl: string;
  /** 削除済＝論理削除（運営の委託配送先マスタの削除。台帳 F 2026-10-06・受付簿 No.178） */
  status: '有効' | '無効' | '削除済';
  /** 支払条件（運営の委託配送先マスタ。選択肢は lib/ops/general/masterForms.ts の PAY_TERMS） */
  payTerms?: string;
  /** 備考（運営だけが見る） */
  note?: string;
};

/** ドライバー（master.drivers）。ID＝DR＋5桁。自社ドライバーは carrierId＝DE00000（ES 自社） */
export type Driver = {
  id: string;
  carrierId: string;
  name: string;
  kana: string;
  tel: string;
  email: string;
  employment: 'self' | 'partner';
  areas: string[];
  /** 削除済＝論理削除（運営の配送スタッフの削除。台帳 F 2026-10-06・受付簿 No.178） */
  status: '有効' | '無効' | '利用停止' | '免許未登録' | '削除済';
  /** パスワードのハッシュ（lib/domain/driverAuth.ts。まだ設定していない見本は省く） */
  passwordHash?: string;
  passwordUpdatedAt?: string;
  /** スタッフ区分（画面・CSV：個人／会社所属。hong 2026-10-06）。省くと会社所属。employment（自社／委託）は所属先から決まる内部の値 */
  staffKind?: '個人' | '会社所属';
  /** 免許証の写真（data URL。運営の配送スタッフの登録・編集でアップロード）。省くと：免許未登録でなければ見本の画像 */
  licenseImg?: string;
};
/** ドライバーのパスワード再設定の4桁の認証コード（account.driverResetCodes）。コードはハッシュだけ持つ。issuedBy＝本人の ID か代行した運営・委託配送会社 */
export type DriverResetCode = {
  id: string; driverId: string; codeHash: string; issuedAt: string; expiresMs: number;
  verifiedAt: string; usedAt: string; issuedBy: string;
};

/** 商品のコース（商品マスタの「コース」。子契約のコース ESスタンダード＝スタンダード、ESライト（冷蔵庫・自販機）＝ライト） */
export type ProductCourse = 'ライト' | 'スタンダード';
/** 栄養成分の範囲で持つ5項目（エネルギー・たんぱく質・脂質・炭水化物・食塩相当量） */
export type NutKey = 'kcal' | 'protein' | 'fat' | 'carbs' | 'salt';
/**
 * 栄養成分（per100g＝管理用タブ「100g当たり」、perServing＝表示用タブ「1食当たり」。servingG＝1食当たり内容量）。
 * 5項目は範囲（from〜to）：kcal などが from、to が to（台帳 F 2026-10-08・受付簿 #223。to の初期値＝from・両方必須・to ≧ from）。
 * to のない前の形のデータは to＝from として読む（lib/domain/product.ts の nutTo）
 */
export type Nutrition = { servingG: number; kcal: number; protein: number; fat: number; carbs: number; salt: number; other: string; to: Record<NutKey, number> };
/** 商品の仕入先（複数。selected＝選択中の1社。unitCostYen＝仕入単価（税抜）、lot＝入り数） */
export type ProductSupplier = { supplierId: string; unitCostYen: number; lot: number; note: string; selected: boolean;
  /** 仕入単価の税率（master.taxRates。省くと商品の税率） */
  taxRateId?: string;
  /**
   * 仕入単価の改定（値上げ・値下げ。RD-MN-076：適用時期を選んで仕入単価を変える）。from（YYYY/MM/DD）からは unitCostYen ではなくこの単価。
   * 読むときは lib/domain/product.ts の costOn（日付で選ぶ）。適用開始日を過ぎたあとに商品を保存すると unitCostYen に入れ替える
   */
  nextCost?: { unitCostYen: number; from: string } };
/** 短消費期限の区分（ショート＝1週間以内、セミショート＝1週間〜1ヶ月程度） */
export type ShortClass = '対象外' | 'ショート' | 'セミショート';

/**
 * 商品（master.products）。品番 M001〜M032 は仕入先サイトの発注・運営のメニューと同じ（JAN は別の項目）。
 * つながり：仕入先（suppliers）↔ 商品 ↔ ピッキング倉庫（pickWarehouseIds）↔ メニュー（拠点の便の倉庫がこの中にある商品だけ出す）。
 * 互換のための項目：priceYen＝販売価格（税込）、supplierId＝選択中の仕入先、vmFrame＝自販機の枠（W ダブル／S シングル／B ベルト。入らないものは null。vending.columns と同じ）
 */
export type Product = {
  id: string;
  /** 公開名（日本語）：法人Web・アプリ・請求書に出す名前（2026/10/03 決定：商品名は4種類） */
  name: string;
  kana: string;
  /** 管理名（社内）：運営の一覧・選択肢に出す名前（品番と並べる）。空＝公開名（lib/domain/product.ts の mgmtNameOf） */
  mgmtName?: string;
  /** 公開名（英語）（RD-MN-073：英語の商品名。Phase 2 は項目と CSV だけ） */
  nameEn?: string;
  /** 仕入先向けの名前：仕入先サイト・発注書・仕入先への CSV に出す名前。空＝公開名（lib/domain/product.ts の supplierNameOf） */
  supplierItemName?: string;
  /** 主 JAN コード（＝jans[0]。1つだけ必要なところで使う。空＝JAN なし） */
  jan: string;
  /** JAN コード（複数・先頭が主 JAN。1件ごとに8〜13桁・10件まで・商品をまたいで重複不可。台帳 F 2026-10-08・受付簿 #224） */
  jans: string[];
  /** 商品カテゴリの名前（表示・検索用の写し。持ち主は categoryId で、カテゴリの名前を変えると lib/ops/areas/menu.ts の saveCat が写しも直す） */
  category: string;
  /** 商品カテゴリの ID（master.productCategories。2026-10-06 決定・受付簿 #233：商品はカテゴリを ID で持つ。名前を変えても商品は外れない） */
  categoryId?: string;
  temp: TempType;
  /** 販売価格（税込・円） */
  priceYen: number;
  /** 税率（master.taxRates） */
  taxRateId: string;
  /* 商品タグ（Product.tags）は持たない。タグはメニューの商品ごと（MenuItem.tags）に月ごとに付ける（台帳 F 2026-10-08・受付簿 #179） */
  /** 商品備考 */
  note: string;
  /** 商品写真（複数。main＝メインの1枚） */
  images: { file: string; main: boolean }[];
  /** 商品解説（表示用） */
  description: string;
  nutrition: { per100g: Nutrition; perServing: Nutrition };
  /** アレルゲン（specific＝特定原材料、equivalent＝特定原材料に準ずるもの） */
  allergens: { specific: string[]; equivalent: string[] };
  /** 原材料名・添加物（成分表示） */
  ingredients: string;
  additives: string;
  /** 製造元のホームページ */
  makerUrl: string;
  /** 出せるコース */
  courses: ProductCourse[];
  /** 保管方法（管理用・表示用） */
  storage: { admin: '冷蔵' | '冷凍' | '常温'; display: '冷蔵' | '冷凍' | '常温' };
  /**
   * 自販機（columns＝メインコラム（例 ダブル8）、subColumns＝サブコラム（メインと重ならない。意味・使い方は設計書の open のため保存・表示だけ。台帳 F 2026-10-08）、
   * models＝対応機種（master.models の自販機）。入らない商品は columns が空）
   */
  vending: { columns: string[]; subColumns?: string[]; models: string[]; note: string };
  /** 出荷指示の同梱資材（master.materials） */
  bundledMaterialIds: string[];
  /** 出荷時の特殊指示（例 OPP袋封入） */
  shipInstructions: string[];
  /** 賞味期限または消費期限（ES の期限・メーカーの期限・短消費期限の区分） */
  shelfLife: { esValue: number; esUnit: '日' | 'ヶ月'; maker: string; shortClass: ShortClass };
  suppliers: ProductSupplier[];
  /** ピッキング倉庫（master.warehouses の picking） */
  pickWarehouseIds: string[];
  /** 状態。無効＝スポット商品など、商品一覧・メニュー作成の商品選択に既定で出さない（絞り込めば見える・有効に戻せる。過去のメニューは変えない。2026-10-05 台帳 F） */
  status: '有効' | '無効' | '削除済';
  vmFrame: 'W' | 'S' | 'B' | null;
  supplierId: string;
};
/** 商品の変更履歴（master.productHistory。商品マスタ詳細の「変更履歴」タブ）。ID＝PH-<品番>-NNN */
export type ProductHistory = { id: string; productId: string; at: string; what: string; by: string;
  /** 変えた項目（P-HIST：項目・変更前・変更後。古い記録にはない＝what の文だけ） */
  items?: { field: string; before: string; after: string }[];
  /** 理由（価格の誤りの訂正など） */
  reason?: string };
/** 税率（master.taxRates）。商品タグと同じく、ドロップダウンからその場で足せる。ID＝TX＋2桁 */
export type TaxRate = { id: string; label: string; rate: number };
/** 請求の設定（dm.billing.settings。ID＝current）。cashDiffTaxRateId＝現金回収差額の税率（税率マスタの ID・既定 TX01 8%。システム管理が変える：台帳 E 2026-10-05） */
export type BillingSettings = { id: 'current'; cashDiffTaxRateId: string; log: { at: string; who: string; what: string }[] };
/** 商品タグ（master.productTags）。ID＝TG＋3桁 */
export type ProductTag = { id: string; name: string };
/** 商品カテゴリ（master.productCategories。運営の「商品カテゴリ管理」）。ID＝CAT＋5桁、order＝表示順、img＝画像（'photo:<種>'＝見本の絵） */
export type ProductCategory = { id: string; name: string; order: number; note: string; img: string; /** 同時更新の検知の版（E31） */ ver?: string };
/**
 * 資材（master.materials。運営の「資材マスタ」。ID＝S＋3桁の続き番号）。priceYen＝単価（税抜・既定 0＝無料）・taxRateId（省くと 10%）。
 * プランの数量（Plan.includedMaterials）を超えて注文した分は 単価 × 超えた数 を請求する（2026/10/03 回答。0円なら行は出さない）。
 * 法人Web 資材注文が読む コース・単位・規格・写真もここに持つ（台帳 F「資材マスタの作り」・受付簿 #358）。仕入価格・個別コード（JAN）・納期（日）は持たない。
 *   courses＝使うコース（複数）、unit＝単位（20文字）、spec＝規格（60文字）、photo＝写真（'photo:<カテゴリ>:<種>'＝見本の絵、data URL＝アップロード）、
 *   publish＝公開ステータス（非公開は法人Webの資材注文に出さない。運営の選択肢には出す）、warehouseIds＝取扱倉庫（倉庫区分「ピッキング倉庫（資材）」・複数）、
 *   status＝有効／削除済（論理削除）、ver＝同時更新の検知の版（E31）。項目のない古いデータは lib/domain/material.ts の matOf で既定を補う
 */
export type Material = {
  id: string; name: string; priceYen?: number; taxRateId?: string;
  courses?: Course[]; unit?: string; spec?: string; photo?: string; publish?: '公開' | '非公開'; warehouseIds?: string[]; status?: '有効' | '削除済'; ver?: string;
};
export type TroubleType = { id: 'qty_diff' | 'wrong_delivery' | 'damage' | 'absent' | 'delay' | 'other' | 'undecided'; name: string; autoChild: boolean };

/* ===================== 配送（area: delivery） ===================== */

/** サイクル（delivery.cycles）。ID＝サイクル月。A1 は月曜、サイクル月＝B7 が属する月 */
export type Cycle = { id: string; a1: string; b7: string; d7: string; orderCloseOn: string; orderState: '締切済' | '受付中' | '受付前';
  /** 倉庫ごとの出荷不可枠（倉庫ID → 枠コード）。運営が配送サイクル設定で保存したもの。省く＝既定の枠（NO_PICKING_SLOTS） */
  ngSlots?: Record<string, string[]> };
/** 祝日・配送しない日（delivery.holidays） */
/** warehouseIds＝その倉庫だけの出荷禁止日（課題 4-10。省く・空＝全倉庫） */
export type Holiday = { id: string; date: string; name: string; noDelivery: boolean; noPicking: boolean; warehouseIds?: string[] };

export type DeliveryStatus = '予定' | '出荷待' | '出荷済' | '受取済' | '納品済' | '一部納品済' | '再配達待' | '確認中' | '中止' | '取消';

/** 配送（delivery.deliveries）。ID＝配送No＝DL-YYMMDD-NNNN（YYMMDD＝作ったときの予定の出荷日。一度付けたら変えない：2026/10/03）。子は DL-…-1 */
export type Delivery = {
  id: string;
  /** 分割・トラブルの子のとき親の ID */
  parentId: string;
  branchId: string;
  contractId: string;
  childContractId: string;
  cycleMonth: string;
  /** サイクルの枠（A1〜D7） */
  slot: string;
  temp: TempType;
  serviceForm: ServiceForm;
  regime: Regime;
  warehouseId: string;
  /** 予定の出荷日（日付を変えても配送No は変えない） */
  shipOn: string;
  /** 出荷日（実績）＝倉庫が実際に出した日（出荷実績の取込で入る。まだなら省く）。配送No の横に出す */
  shippedOn?: string;
  deliverOn: string;
  status: DeliveryStatus;
  plannedQty: number;
  deliveredQty: number | null;
  deliveredAt: string;
  completion: '' | 'reported' | 'presumed';
  /** 拠点の情報の写し（作ったとき。納品したときに拠点名 name を写し直す＝納品した時点の名前） */
  destination: { name: string; address: Address; tel: string; windows: { from: string; to: string }[]; note: string };
  /** 日付変更申請の状態（法人の画面に出す） */
  changeState: '変更可' | '申請中' | '提案中' | '調整済' | '変更不可';
  /** 運営だけのメモ */
  internalMemo: string;
  /** 出荷指示の版（送ったあとに中身を直して再送したら +1。省くと 1） */
  shipRev?: number;
  /** 配送費の負担（代替品の追加配送など ES が持つときだけ 'ES'） */
  feeBy?: 'ES';
  /** 代替品設定で作った配送（追加配送）のとき、その設定の ID */
  altId?: string;
  /** スケジュールで最後に動かしたときの移動の記録（dm.delivery.moves の ID。課題 2-4） */
  moveId?: string;
};

/**
 * 配送の明細（delivery.lines）。ID＝<配送ID>:<品番>（代替品の行は <配送ID>:<品番>:<代替品設定ID>）。
 * kind・substitutedFrom・billPrice・altId は代替品の行だけ（注文の行と同じ。lib/domain/alt.ts）
 */
export type DeliveryLine = {
  id: string; deliveryId: string; productId: string; plannedQty: number; deliveredQty: number | null;
  kind?: OrderLineKind; substitutedFrom?: string; billPrice?: number; altId?: string;
  /** 予定数のうち調整数（サービスで足した数）。出荷・理論在庫には入れ、請求（買取＝届けた数×企業価格）からは引く（受付簿 #251・#252・#272） */
  serviceQty?: number;
  /** 商品名の写し（納品したとき。画面は名前が変わっていれば「旧名（現：新名）」、納品書・請求書はこの名前だけ。lib/domain/snapshot.ts の shownName） */
  productName?: string;
};

/** 配送の区間（delivery.legs）。ID＝<配送ID>:<区間番号>。委託配送先は自社の区間だけ見る */
export type Leg = {
  id: string;
  deliveryId: string;
  legNo: 1 | 2;
  from: { type: 'warehouse' | 'relay'; id: string };
  to: { type: 'relay' | 'destination'; id: string };
  carrierId: string;
  regime: Regime;
  isFinal: boolean;
  /** 割り当ての担当（ops＝運営、carrier＝委託配送先） */
  assignScope: 'ops' | 'carrier';
  driverId: string;
  pickedUpAt: string;
  /** 1件あたりの支払額の写し（納品したときの配送会社の feePerDelivery。委託の月の集計はこの値。マスタの金額を変えても過去の月は変わらない） */
  feeYen?: number;
};

/** 送り状（delivery.tracking） */
export type Tracking = { id: string; deliveryId: string; carrierId: string; trackingNo: string; boxNo: number; boxTotal: number; status: 'active' | 'voided' };

/** トラブル（delivery.troubles）。ID＝TR-YYMMDD-NNNN */
export type Trouble = {
  id: string;
  deliveryId: string;
  typeId: TroubleType['id'];
  reportedBy: { site: 'driver' | 'carrier' | 'ops'; accountId: string };
  reportedAt: string;
  note: string;
  resolution: '' | 'full' | 'partial' | 'partial_no_resend' | 'redelivery' | 'same_day_revisit' | 'stop';
  resolvedAt: string;
  /** 自動で作った子の配送 */
  childDeliveryId: string;
};

/** お届け日の変更申請（delivery.changeRequests）。ID＝DD-YYYYMMDD-NNNN。配送に開いている申請は1つまで */
export type ChangeRequest = {
  id: string;
  deliveryId: string;
  branchId: string;
  requestedBy: { site: 'corp' | 'ops'; accountId: string };
  requestedAt: string;
  currentDate: string;
  wishDates: string[];
  reason: string;
  status: '申請中' | '別の日のご提案' | '承認' | '否認' | '取り下げ';
  proposedDate: string;
  /** 法人が「別の日のご提案」を断った日（運営が別の日を調整する） */
  declinedAt?: string;
  decidedAt: string;
  decisionReason: string;
};

/** 資材の注文（delivery.materialOrders）。ID＝MO-YYMM-NNNN。1件＝1つの資材便 */
export type MaterialOrder = {
  id: string; branchId: string; kind: 'initial_set' | 'regular'; orderedAt: string; orderedBy: string; dueOn: string; deliveryId: string;
  lines: { materialId: string; qty: number }[];
  /** 有料（同じサイクル月の2回目から OP000036） */
  paid: boolean;
  /** 注文したサイクル月（2回目の判定・2026/10/03 回答：暦の月ではなくサイクル） */
  cycleMonth?: string;
  /** プランの数量を超えた資材（超えた数・単価（税抜）・税率。単価 0 の資材は入れない） */
  excess?: { materialId: string; qty: number; unitYen: number; taxRate: number }[];
  /** 運営が資材注文管理で入れる 発送日（YYYY-MM-DD）・送り状番号（受付簿 No.154）。未入力なら undefined */
  shippedOn?: string; trackingNo?: string;
  /** 状態は配送データの状態（決定 #36） */
  status: '出荷待' | '出荷指示済' | '出荷済' | '納品済' | '取消';
};

/* ===================== アカウント・権限（area: account） ===================== */

export type Site = 'sysadmin' | 'ops' | 'corp' | 'carrier' | 'driver' | 'supplier';
/** 法人・拠点は 未発行→発行済（ログイン前）→有効、解約後は 参照のみ→利用停止。運営などは 有効／無効／利用停止／削除済 */
export type AccountStatus = '未発行' | '発行済（ログイン前）' | '有効' | '参照のみ' | '無効' | '利用停止' | '削除済';

/**
 * アカウント（account.accounts）。ID＝サイトごとの ID（運営 Ad＋5桁、システム管理 SY＋5桁、
 * 法人・拠点・委託配送・ドライバー・仕入先はその ID）。ログインID＝ID（拠点アカウントも大文字の CU…）。
 * 開発中はパスワードを持たない（空でなければ通す）。
 */
export type Account = {
  id: string;
  site: Site;
  loginId: string;
  name: string;
  email: string;
  status: AccountStatus;
  /** 利用停止の理由（申込取消＝仮登録のあとに申込を却下・取り下げした。ログインの文言を変える） */
  stopReason?: '申込取消';
  roleIds: string[];
  /** 見てよい範囲。corp＝法人アカウント（配下の全拠点）、branch＝拠点アカウント */
  scope:
    | { type: 'all' }
    | { type: 'corp'; corpId: string }
    | { type: 'branch'; branchId: string }
    | { type: 'carrier'; carrierId: string }
    | { type: 'driver'; driverId: string; carrierId: string }
    | { type: 'supplier'; supplierId: string }
    | { type: 'warehouse'; warehouseId: string };
  issuedAt: string;
  lastLoginAt: string;
  /** 版（同時更新の検知 E31。運営アカウントの編集で進める） */
  version?: string;
  /**
   * マスタ（仕入先・委託配送先・配送スタッフ・倉庫）を「無効」「削除済」にしたため止めたアカウント（lib/domain/partnerLock.ts）。
   * prev＝止める前の状態（マスタを「有効」に戻すと、この印のあるアカウントだけ prev に戻す）。台帳 F 2026-10-06・受付簿 No.178
   */
  lockedBy?: { prev: AccountStatus };
};

/** ◎ 登録・編集・削除まで／○ 参照＋一部の操作／△ 参照だけ／× 出さない（基本設計 §4-3。運営は grants を使う） */
export type Perm = '◎' | '○' | '△' | '×';
/**
 * 役割（account.roles）。権限は足し算（複数の役割を持てる）。
 * 運営（site＝ops）は grants（機能ごとに許す操作・lib/ops/permissions.ts）で決める。システム管理（権限付与の編集ができる人）が作る・直す。
 * ほかのサイトは perms（画面の目安。データの範囲はアカウントの scope で決める）
 */
export type Role = { id: string; site: Site; name: string; note: string; perms: Record<string, Perm>; grants?: Grants; /** 論理削除（undefined＝有効） */ status?: '有効' | '削除済'; updatedAt?: string; updatedBy?: string };
/** IP ホワイトリスト（account.ipRules）。sites＝効かせるサイト */
export type IpRule = { id: string; cidr: string; note: string; sites: Site[]; createdAt: string; createdBy: string };
/** サイトの設定（account.siteSettings）。ID＝サイト */
export type SiteSetting = { id: Site; name: string; baseUrl: string; sessionMinutes: number; resetCode: { digits: number; minutes: number }; maintenance: { on: boolean; message: string } };
/** 操作の記録（account.audit） */
export type AuditLog = { id: string; at: string; accountId: string; site: Site; action: string; target: string; detail: string;
  /** 変えた項目（P-HIST：項目・変更前・変更後。資材マスタだけ持つ。古い記録にはない＝detail の文だけ） */
  items?: { field: string; before: string; after: string }[];
  /** 理由（あれば） */
  reason?: string };

/* ===================== 月次注文（area: order） ===================== */

/** 基準注文数の種類：std＝ライト・スタンダード、ns＝短消費期限なし、vm＝ライト（自販機）。どれも 50プランの代表値 */
export type MenuBaseKind = 'std' | 'ns' | 'vm';
/**
 * 月間メニューの1商品。order＝表示順（法人が注文画面で見る順・1から）、publishable＝公開可能（運営が準備OKにした）、
 * tags＝この月の商品タグ（master.productTags の名前）、sample＝営業サンプルに使う、
 * base＝基準注文数（50プランの代表値。種類ごとの合計＝50）、manual＝運営が手で直した値（再計算で上書きしない）
 */
export type MenuItem = {
  productId: string;
  order: number;
  publishable: boolean;
  tags: string[];
  sample: boolean;
  base: Record<MenuBaseKind, number>;
  manual: Record<MenuBaseKind, boolean>;
  /** 標準数の提案 ②（平均仕入単価が目標の幅に入るように自動で調整した数。①との差。画面に ↑n／↓n）。ないか 0＝調整なし */
  adj?: Record<MenuBaseKind, number>;
  /** CSV の備考（保存のみ） */
  note: string;
};
/** 法人向けの公開：非公開／公開／自動公開（autoPublishOn に条件がそろっていれば公開） */
export type CorpPublish = '非公開' | '公開' | '自動公開';
/** メニューPDF（法人が見る） */
/**
 * メニューPDF の種別（2026-10-05 台帳 F「月間メニューの単位と PDF」）：メニューは1ヶ月に1つ、PDF だけ分ける。
 * ライト用＝冷蔵のみ、スタンダード用＝1ページ目 冷蔵・2ページ目 冷凍。ESスタンダードのお客様には2つとも、ESライトのお客様にはライト用だけ見せる（受付簿 #238）。ライトのお客様にはスタンダード用を見せない
 */
export type MenuPdfKind = 'ライト用' | 'スタンダード用';
export type MenuPdf = { name: string; size: number; uploadedAt: string; kind: MenuPdfKind };
/** 公開したときの販売価格の写し（税込・税率）。その月の注文・請求はこの値（商品マスタの価格改定は次のメニューから） */
export type MenuPrice = { priceYen: number; taxRateId: string; rate: number; at: string };
/** 月間メニューの変更履歴（公開中に直したときなど） */
export type MenuLog = { at: string; by: string; what: string };
/**
 * 月間メニュー（order.menus）。ID＝サイクル月。受付は前月1日〜15日。
 * items は表示順（order の順）に並べて持つ。品番だけほしいときは lib/domain/menu.ts の menuIds
 */
export type MonthlyMenu = {
  id: string;
  /** 削除済＝論理削除（dm.order.menusDeleted に残す。一覧で「削除済」を選んだときだけ出す。受付簿 #237） */
  status: '編集中' | '公開中' | '締切済' | '配送中' | '終了' | '削除済';
  publishOn: string;
  orderFrom: string;
  orderTo: string;
  items: MenuItem[];
  corpPublish: CorpPublish;
  /** 自動公開日付（自動公開のとき） */
  autoPublishOn: string;
  pdfs: MenuPdf[];
  /** 公開した日時（手動・自動） */
  publishedAt: string;
  updatedAt: string;
  updatedBy: string;
  /** 公開したときの販売価格の写し（品番 → 価格）。公開中に足した商品は足したときの値 */
  prices?: Record<string, MenuPrice>;
  /** 変更履歴（新しい順） */
  log?: MenuLog[];
  /**
   * 平均仕入単価の目標（冷蔵庫・自販機それぞれ 下限〜上限）。メニュー作成の画面で入れる。初期値＝前月のメニューの値（なければ見本の既定）。
   * 公開したメニューは公開時の値で固定。ないときは lib/domain/menu.ts の avgTargetOf が既定を返す（2026-10-05 台帳 F。設定管理の専用画面はなくした）
   */
  avgTarget?: AvgTarget;
  /** 標準数の提案 ②（平均単価の調整）を使わない（「調整を戻す」。①の按分のまま）。省くと調整する */
  noAdjust?: boolean;
};
/** 仮発注の承認（dm.menu.kariApprovals）。ID＝メニューのサイクル月。承認されていないと公開の条件を満たさない */
export type KariApproval = { id: string; status: '未承認' | '承認'; approvedAt: string; approvedBy: string };
/**
 * 注文の行の種類（代替品設定・2026/10/01 決定の3パターン）：
 *   通常＝法人の注文、差替＝① 不良商品の代わりに届ける代替品（元の商品の単価で請求）、
 *   補償＝② 届けた不良品の代わりの代替品（請求は0円の行）、除外＝不良商品を届けない数（請求しない）
 */
export type OrderLineKind = '通常' | '差替' | '補償' | '除外';
/**
 * 注文の行。kind を省くと通常。altOf＝元の商品（不良商品）、billPrice＝請求に使う単価（税込。差替＝元の商品のメニューの価格、補償＝0）、
 * altId＝代替品設定の ID、deliveryId＝便ではなく決まった配送（追加配送）で届けるとき、movedTo＝除外した分を別の便・配送で届けるとき（入荷待ち・倉庫が違う）、
 * fromOrderId＝ほかの月の注文の分をこの月の便で届けるとき（その月の上限には数えない）
 */
export type OrderLine = {
  productId: string; slot: string; qty: number;
  kind?: OrderLineKind; altOf?: string; billPrice?: number; altId?: string; deliveryId?: string; movedTo?: string; fromOrderId?: string;
  /** 入荷の不足を受け入れて外した行（③ 除外・請求しない）の入荷の記録（dm.stock.receipts の ID）。このときは altId なし */
  shortId?: string;
  /** 調整数（サービスで足した数）の行（adjustLinesOf が付ける。注文には保存しない）。配送の明細で serviceQty になり、請求しない */
  service?: boolean;
};
/**
 * 商品注文（order.orders）。拠点×サイクル月に1つ。ID＝O-YYYYMM-<拠点ID>。
 * lines の slot＝便のキー（温度帯:枠。例 冷蔵:A2）。月の合計（通常＋差替）＝子契約の上限まで
 */
export type ProductOrder = {
  id: string;
  branchId: string;
  childContractId: string;
  cycleMonth: string;
  status: '登録済' | 'ES登録済' | 'デフォルト' | 'お試し（自動）' | '取消';
  lines: OrderLine[];
  updatedAt: string;
  updatedBy: string;
  /**
   * 調整数（運営＝システム管理がお客様へのサービスとして足す数・請求しない：台帳 H「商品注文の調整数・調整率」2026-10-06・受付簿 #251〜#272）。
   * 行は通常の行と同じ形（品番・便・数）。合計＝プラン数・便の差 ±1 の計算には入れない（lines に混ぜない）が、配送の明細・予定数（出荷指示・発注・理論在庫）には足す。
   * 上限＝プランの食数・冷凍の便にも足せる（#282）・お試し（自動）には足せない・発注締め日（B7・D7）のあとは直せない
   */
  adjust?: { productId: string; slot: string; qty: number }[];
  /** item・before・after・why は変更履歴の P-HIST の列（項目・変更前・変更後・理由。ないものは detail だけ） */
  log: { at: string; by: string; what: string; detail: string; item?: string; before?: string; after?: string; why?: string }[];
};
/** 注文の設定（order.prefs）。ID＝拠点ID */
export type OrderPref = { id: string; categories: string[] | null; allowShortLife: boolean; priceRange: [number, number]; excluded: string[]; updatedAt: string; updatedBy: string };

/* ---------- 代替品設定（dm.order.alts・lib/domain/alt.ts） ---------- */

export type AltPattern = '① 差し替え' | '② 補償' | '③ 除外のみ';
/**
 * 代替品設定の1便ぶんの結果。deliveryId＝不良商品の入っていた便、toDeliveryId＝代替品を届ける配送（同じ便・次の便・追加配送）。
 * how＝届け方、resent＝出荷指示を送ったあとなので版番号つきで再送（rev+1）、short＝入荷を待って後の便に回した
 */
export type AltRow = {
  deliveryId: string; branchId: string; orderId: string; slot: string; shipOn: string; pattern: AltPattern;
  qty: number; altQty: number; toDeliveryId: string; toOrderId: string;
  how: '同じ便' | '次の便' | '指定の便' | '追加配送' | '入荷後の便' | '届けない';
  resent: boolean; short: boolean; note: string;
};
/** 代替商品の在庫の見込み（倉庫ごと）。必要数・倉庫在庫・入荷予定・不足 */
export type AltShortage = { warehouseId: string; need: number; stock: number; incoming: number; short: number; eta: string };
/** 拠点に残っている不良品の扱い（廃棄として記録・管理ロスにしない）。ES配送便＝ドライバーが回収、COOL便＝法人が棚卸で申告 */
export type AltDisposal = { branchId: string; productId: string; qty: number; how: 'ドライバーが回収・廃棄' | '法人が廃棄して棚卸報告で申告'; deliveryId: string };
/** 代替品設定（dm.order.alts）。ID＝ALT-YYMM-NNNN */
export type AltSetting = {
  id: string;
  /** 不良商品・代替商品 */
  productId: string; altProductId: string;
  /** 不良発覚日・対象期間（出荷日） */
  foundOn: string; from: string; to: string;
  scope: '全ロット' | 'ロット単位'; lotNo: string; reason: string;
  /** 未納品分：差し替え／除外のみ。既納品分：注文数量／残理論在庫、届ける便 */
  mode: '差し替え' | '除外のみ'; comp: '注文数量' | '残理論在庫'; when: '次の便' | '日付を指定' | '追加配送'; whenDate: string;
  /** 倉庫の不良ロット（どちらも出荷停止） */
  lotAction: '返品' | '廃棄';
  createPo: boolean;
  warnings: string[];
  rows: AltRow[];
  shortage: AltShortage[];
  /** 不足分の追加発注（dm.order.altPos の ID） */
  poIds: string[];
  /** 仕入先への請求（dm.order.supplierClaims の ID） */
  claimId: string;
  disposals: AltDisposal[];
  notify: boolean;
  createdAt: string; createdBy: string;
};
/**
 * 代替品の不足分の追加発注（dm.order.altPos）。ID＝発注番号（PO-YYYYMM-<品番>-ALTnn）。
 * order＝仕入先サイト・運営の発注と同じ形（lib/supplier/types の Order）。運営の発注・入荷はこの order を読み書きする
 */
export type AltPo = {
  id: string; altId: string; supplierId: string; productId: string; warehouseId: string; qty: number; unitCostYen: number; eta: string; order: Record<string, unknown>;
  /** 入荷予定日の出どころ：仮＝発注日＋3日（ALT_PO_LEAD）、仕入先の回答＝仕入先サイトの納期回答（分納は最後の回）。古いデータにはない（＝仮） */
  etaFrom?: '仮' | '仕入先の回答';
};
/** 仕入先への請求（不良控除。dm.order.supplierClaims）。ID＝SC-<代替品設定ID>。amountYen はマイナス（支払額から引く） */
export type SupplierClaim = { id: string; altId: string; ym: string; supplierId: string; productId: string; qty: number; unitCostYen: number; amountYen: number; label: string; lotAction: '返品' | '廃棄'; at: string };

/* ===================== 申請（area: apply） ===================== */

export type ChangeKind = 'プランの変更' | '配送の変更' | '設備の変更' | '拠点情報の変更' | '法人情報の変更' | '休止' | '再開' | '解約';
/**
 * 申請（apply.applications）。
 *   新規申込：ID＝AP-YYYYMMDD-NNNN、status＝受付中／契約設定中／完了／却下／取り下げ済み
 *   変更申請：ID＝CH-YYYYMMDD-NNNN、拠点ごとに承認（results）。status は results から決まる
 */
export type Application = {
  id: string;
  type: 'new' | 'change';
  kind: ChangeKind | '新規申込';
  /** 新規申込の区分 */
  kubun: '' | '本導入' | 'お試し' | '切替';
  status: '受付中' | '契約設定中' | '完了' | '却下' | '取り下げ済' | '承認待ち' | '対応中' | '承認済' | '一部承認';
  /** 申込の法人（まだ登録していない会社は null で companyName だけ） */
  corpId: string | null;
  companyName: string;
  branchIds: string[];
  /** まだ登録していない拠点の名前（新規申込） */
  branchNames: string[];
  requestedBy: { site: 'corp' | 'ops' | 'public'; accountId: string; name: string };
  requestedAt: string;
  /** 開始・反映するサイクル月（法人情報の変更は ''） */
  startCycle: string;
  orderCloseOn: string;
  /** 申請の中身（画面の表示用の [項目, 値]） */
  request: [string, string][];
  /** 変更の中身（承認したときにデータを変える。kind ごとに使う項目が違う） */
  change: { planId?: string; course?: Course; fromCycle?: string; toCycle?: string; resumeCycle?: string; keepEquipment?: boolean; lastCycle?: string };
  results: { branchId: string; result: '' | 'ok' | 'ng' | 'wd'; reason: string; by: string; at: string }[];
  proxy: boolean;
  reason: string;
  /** 新規申込の受付の中身（仮登録・本登録で共通データを作る。lib/domain/lifecycle.ts） */
  setup?: NewSetup;
  /** 設備の異動の案（プランの変更・お試し→本導入。拠点ID ごと。運営が承認の前に直せる） */
  equipment?: Record<string, EquipProposal>;
};

/* ---------- 新規申込の受付（仮登録 → 本登録）・設備の異動 ---------- */

/** 受付の拠点ごとの中身。branchId／contractId は仮登録で作った（または今ある）ID */
export type SetupBranch = {
  name: string; kana: string; address: Address; tel: string; employees: number;
  receiveWindows: { from: string; to: string }[]; deliveryNote: string;
  /** 設置フロア（申込の「設置フロア（拠点N）」から） */
  floor?: string;
  /** FAX・この拠点に請求するときの支払い（新規申込の CSV などで入れたとき） */
  fax?: string;
  billing?: Partial<Billing>;
  /** 拠点のメイン担当者（ログイン案内の宛先） */
  contact: { name: string; email: string; tel: string };
  planId: string; course: Course | '';
  /** 配送の流れ（1回の納品数は本登録のときにプランから計算する） */
  channels: Channel[];
  optionIds: string[]; discountIds: string[];
  /** 置く設備（省くとプランの標準貸出設備） */
  equipment: { modelId: string; qty: number }[];
  billTo: Contract['billTo'];
  /** 基準数のパターン＝短消費期限なし（REQ-CT-300。申込で選び、仮登録・本登録で拠点の注文の設定に入れる。変更は運営だけ）。省く＝通常 */
  noShortLife?: boolean;
  /** 初期費用（OP000008・税抜）。省くと自販機の機種マスタの初期料金、なければ OP000008 の金額。0＝請求しない。お試し・切替でも請求（台帳 E 2026-10-05） */
  initFeeYen?: number;
  /** オプションの金額の上書き（REQ-CT-304。子契約の amounts に入れる） */
  amounts?: Record<string, number>;
  branchId: string; contractId: string;
  /** 取消＝仮登録のあとに申込を却下・取り下げした */
  stage: '' | '仮登録' | '本登録' | '取消';
  /** 運営が「必須の情報をすべて入れた」と確かめた（本登録のボタンの条件） */
  checked: boolean;
};
export type NewSetup = {
  /** 開始サイクル月（締切を過ぎたら翌サイクル・決定 28-27） */
  startCycle: string;
  /** 新しい法人（申込に法人がないとき） */
  /** fax・billing（支払い方法・支払サイクル・発行時期）は新規申込の CSV などで入れたとき（なければ既定） */
  corp: { name: string; kana: string; address: Address; tel: string; contact: { name: string; email: string; tel: string }; fax?: string; billing?: Partial<Billing> } | null;
  branches: SetupBranch[];
  /** 仮登録・本登録で出した注意（締切で開始月を繰り下げたなど） */
  notes: string[];
  /**
   * 締切後（開始サイクルのオーダー締切を過ぎてから）に申込内容の確認を完了するときの開始月の扱い。運営が選ぶ（申込フォーム §10-5・台帳 B）。
   * 繰り下げ＝開始サイクル月を締切に間に合う翌サイクルへ（未選択も同じ）／代理＝運営が代理でオーダーし、希望の月から開始する
   */
  late?: '繰り下げ' | '代理';
  /** 紹介元（運営が受付・承認のときに入れる）。agencyId＝代理店（有効な代理店だけ・親契約の代理店コードになる）、srcCorpId＝紹介元の法人（企業紹介）。どちらか一方。省く＝紹介なし */
  agencyId?: string; srcCorpId?: string;
  /** 仮登録でアカウントを発行しない（確認ダイアログのチェックを外した）。本登録のときに発行する（契約_04 アカウント・28-145） */
  accountsOff?: boolean;
};

/** 設備の異動の1行。継続＝そのまま／入替＝大きいサイズへ／追加／回収（回収の配送は作らない） */
export type EquipRow = { category: Model['category']; action: '継続' | '入替' | '追加' | '回収'; fromModelId: string; toModelId: string; qty: number; loanId: string; note: string };
/** 設備の異動で請求する額の案（運営が直せる。on＝請求する） */
export type EquipFee = { key: string; name: string; amountYen: number; kind: ExtraFee['kind']; src: ExtraFee['src']; on: boolean; basis: string };
export type EquipProposal = { rows: EquipRow[]; fees: EquipFee[]; note: string; updatedAt: string; updatedBy: string; edited: boolean };

/* ===================== 請求（area: billing） ===================== */

/**
 * 請求書の1行。cycleTo＝年払いの前払いの行が請求するサイクル月の終わり（請求書の cycleMonth〜cycleTo の12サイクル分・S3-1）。
 * adjId＝調整明細（dm.billing.adjustments）を載せた行
 */
export type InvoiceLine = { branchId: string; name: string; amountYen: number; taxRate: number; kind: '前払い' | '後払い' | '調整' | '繰越'; fromInvoiceId?: string; cycleTo?: string; adjId?: string;
  /** 請求書で1行にまとめて出す行（福利厚生の適用 OFF のプラン料金の2行＝plan:子契約ID。税率ごとの内訳は行のまま） */
  group?: string };
/** 請求書の税率ごとの欄（rate＝％・subtotal＝税抜の小計・tax＝消費税） */
export type TaxBucket = { rate: number; subtotal: number; tax: number };
/**
 * 請求書（billing.invoices）。ID＝INV-YYYYMMNNNN（YYYYMM＝発行月）。毎月1日に Bill One で発行。
 * 前払い＝発行月＋1 のサイクル（1ヶ月前請求）、後払い（実績精算）＝前々月21日〜前月20日。消費税は税率ごとに四捨五入（byRate）
 */
export type Invoice = {
  id: string;
  corpId: string;
  /** 拠点ごと発行のときの拠点（まとめて発行は null） */
  branchId: string | null;
  issueMonth: string;
  issuedOn: string;
  dueOn: string;
  /** 前払いの対象のサイクル月 */
  cycleMonth: string;
  actualPeriod: string;
  lines: InvoiceLine[];
  /**
   * 税率ごとの小計（税抜）と消費税（四捨五入）。税率マスタのどの率でも（2026-10-05：税率マスタで足した率も請求できる）。大きい率から。
   * 古い DB の請求書にはない（subtotal10・subtotal8・tax10・tax8 から読む：lib/domain/invoiceTax.ts の taxBuckets）
   */
  byRate?: TaxBucket[];
  /** 10%・8% の小計と税（byRate の写し。前からある画面・CSV 用。ほかの率は byRate だけ） */
  subtotal10: number;
  subtotal8: number;
  carried: number;
  tax10: number;
  tax8: number;
  total: number;
  status: '発行済' | '入金済' | '未入金' | '繰越済' | '取消';
  carriedTo: string;
  note: string;
  /** 送付（Bill One。デモは状態だけを動かす＝課題 0-2。古い DB の請求書にはない） */
  send?: InvoiceSend;
  /**
   * 最終請求書（解約した拠点だけの1通・2026/10/03 決定）：解約日を含む実績精算の締め月の、最後の実績精算・違約金・回収の費用・調整明細。
   * この入金期限のあと、参照のみのアカウントを停止する
   */
  final?: boolean;
};

/**
 * 調整明細（dm.billing.adjustments・決定 TL-7 A・仕様整理 §1-1・§3）。ID＝AJ-YYMMDD-NNNN。
 * 請求済みの月にかかる変更（プランの変更・休止・再開・解約・誤りの訂正・設備の変更。運営が請求済の子契約を締切までに直した「契約の変更」も）を承認・保存したとき、サイクル月ごとの差額をシステムが作る。
 * 違約金・設備の費用で、載せる子契約が請求済みのものもここ。次の請求書を作るときに、まだ載っていない（invoiceId＝''）ものを1行ずつ載せる。
 * lines＝税率ごとの差額（税抜・円。プラン料金は基本料金 10%・福利厚生 8% の2行になることがある）。日割りはしない（サイクル月ごとの満額の差）
 */
export type BillAdjustment = {
  id: string; branchId: string; contractId: string;
  /** 元の子契約・サイクル月（違約金などで月がないときは ''） */
  childContractId: string; cycleMonth: string;
  kind: 'プランの変更' | '休止' | '再開' | '解約' | '誤りの訂正' | '設備の変更' | '契約の変更' | '違約金' | '設備の費用' | '初期費用' | '資材の追加配送';
  reason: string; applicationId: string;
  lines: { name: string; amountYen: number; taxRate: number }[];
  /** 承認の画面の表示用：その月にこれまで請求した額・変更後の額（税抜の合計。違約金などは 0 → 金額） */
  billedYen: number; afterYen: number;
  /** 元の請求書（その月の前払いを請求した請求書。まだ発行していない確定の月は ''） */
  fromInvoiceId: string;
  /** 載せた請求書（'' ＝まだ載っていない） */
  invoiceId: string;
  at: string; by: string;
};

/**
 * 請求書の送付の状態（Bill One・課題 0-2 の決定：外部には送らず状態だけを持つ）。
 * 発行（billing.issue）で 送付待ち → Bill One が送付 送付済 → 法人が開く 開封済。届かなければ エラー（再送で 送付待ち に戻る）
 */
export type InvoiceSendStatus = '送付待ち' | '送付済' | '開封済' | 'エラー';
export type InvoiceSend = { method: 'Bill One'; status: InvoiceSendStatus; log: { at: string; status: InvoiceSendStatus; note: string }[] };

/* ===================== 現場の報告（area: report） ===================== */

/**
 * 配送の報告（dm.report.deliveryReports）。ID＝配送ID。ドライバーアプリの5ステップ：
 *   ① 陳列前の写真 → ② 在庫・廃棄（残っていた数・捨てた数）→ ③ 検品（届けた数）→ ④ 陳列後の写真 → ⑤ 集金（現金利用の拠点）
 * 写真は1〜20枚。完了から7日まで直せる（検品の数も。トラブルがある配送は直せない・課題 4-4）
 */
export type DeliveryReport = {
  id: string;
  deliveryId: string;
  branchId: string;
  driverId: string;
  status: '入力中' | '完了';
  photosBefore: string[];
  stock: { productId: string; remaining: number; disposed: number }[];
  inspection: { productId: string; qty: number; lineId?: string }[];
  photosAfter: string[];
  /** 現金利用がない拠点は null（ステップを飛ばす） */
  cash: { expectedYen: number; collectedYen: number; note: string } | null;
  startedAt: string;
  completedAt: string;
  editableUntil: string;
  /** お届け日より前に納品したときの理由（課題 4-1：確かめて理由を入れたときだけ納品できる） */
  earlyReason?: string;
};

/**
 * 駐車報告（dm.report.parking）。ID＝PK-YYMMDD-NNNN。配送・ドライバーごとに1つ。
 * 入力したら確定（承認・否認はない。委託配送先・運営は見るだけ：2026/10/03）。運営は理由つきで代理入力・修正できる
 */
export type ParkingReport = {
  id: string; driverId: string; carrierId: string; deliveryId: string; date: string; feeYen: number; receiptFile: string;
  reportedBy: string; reportedAt: string;
  /** 修正したとき（ドライバーの入れ直し・運営の代理） */
  correctedBy?: string; correctedAt?: string; correctionReason?: string;
};

/**
 * 棚卸（dm.report.stockChecks）。拠点×締め月（period）。ID＝SC-<period>-<拠点ID>。
 * period '2026-09'＝2026/08/21〜2026/09/20（実績精算と同じ締め）。COOL便の拠点はドライバーが行かないので法人が申告する
 * 1行＝商品：前回の数＋届けた数−売れた数−捨てた数＝今回の数（actual）。sold は計算で出す
 */
export type StockCheck = {
  id: string;
  branchId: string;
  period: string;
  checkedOn: string;
  /** name＝法人Web で選んだ申告した方の、その時点の氏名（3-14・受付簿 No.44。古い記録・ドライバーにはない） */
  checkedBy: { site: 'corp' | 'driver'; accountId: string; name?: string };
  rows: { productId: string; prev: number; delivered: number; disposed: number; actual: number; sold: number;
    /** お届け中だった数のうち、点検のときに届いていて数に入れた数（課題 4-6）。sold＝prev＋delivered＋arrived−disposed−actual */
    arrived?: number;
    /** アプリの販売数（この締め。理論在庫＝prev＋delivered＋arrived−appSold−disposed。差分率＝(理論−actual)÷理論） */
    appSold?: number;
  }[];
  status: '申告済' | '確認済';
  /**
   * この点検で数に入れた届けた配送・点検のときお届け中だった配送（課題 4a-11）。次の点検は、ここにない届けた配送を数える
   * （点検の日より後に届いた分は次の点検に入る）。古い点検にはない（＝その締めの期間の届けた配送）
   */
  deliveryIds?: string[];
  transitIds?: string[];
};

/* ===================== 委託配送先（area: carrier） ===================== */

/** 保冷バッグ・保冷剤の台帳（dm.carrier.coolers）。ID＝CB-#### */
export type Cooler = {
  id: string; kind: '保冷バッグ' | '保冷剤'; qty: number; carrierId: string; pref: string; driverId: string;
  issuedOn: string; status: '貸与中' | '紛失' | '廃棄' | '返却'; memo: string;
  /** 返却日（YYYY/MM/DD・任意。渡した日より前にはしない） */
  returnedOn?: string;
  /** 返却数（任意。0〜数） */
  returnedQty?: number;
};
/** 見積（dm.carrier.quotes）。新しい拠点の配送を委託配送会社に聞く。ID＝QT-YYYY-MMDD-NNN */
export type Quote = {
  id: string;
  applicationId: string;
  branchName: string;
  address: Address;
  temp: TempType;
  deliveriesPerMonth: number;
  mealsPerDelivery: number;
  /** 希望の曜日（複数は「月・水」） */
  wishWeekdays: string;
  /* ---- 見積依頼の項目（台帳 B「委託配送会社への見積依頼の項目」2026/10/03）。保有車両は委託配送会社のプロフィール ---- */
  /** 法人名 */
  corpName?: string;
  /** 土日の配送が要る */
  weekend?: boolean;
  /** プラン（自販機の有無） */
  planName?: string;
  vending?: boolean;
  /** 金額条件（自由記入） */
  priceCond?: string;
  /** 冷蔵／冷凍（両方のときは2つ。temp は1つ目） */
  temps?: TempType[];
  /** まとめて聞くほかの拠点 */
  moreSites?: { name: string; address: string }[];
  requestedAt: string;
  requestedBy: string;
  answerBy: string;
  responses: { carrierId: string; status: '回答待ち' | '回答済' | '辞退'; feeYen: number; weekdays: string; startCycle: string; note: string; answeredAt: string }[];
  status: '依頼中' | '決定' | '取消';
  decidedCarrierId: string;
};

/* ===================== お知らせ・通知（area: notice） ===================== */

/** お知らせ（dm.notice.announcements）。サイトごとに出す。ID＝5桁 */
export type Announcement = {
  id: string; sites: Site[]; category: string; important: boolean; title: string; body: string; publishFrom: string; publishTo: string; files: string[];
  /**
   * メールでも送るとき（課題 5-4：メールだけのお知らせ＝sites が空でもよい。どのサイトにも出さず、運営・システム管理の一覧と送信の記録にだけ出る）。
   * to＝宛先の説明（「法人：全員」など）、sendAt＝送る日時（YYYY/MM/DD HH:mm）
   */
  mail?: { subject: string; sendAt: string; to: string[]; /** 重要なお知らせの自動のメール（公開開始日の 8:00・過ぎていればすぐ。日付を直すと送る日時も直す） */ auto?: boolean };
  /** 送信の記録（登録・更新・メール送信予約・メール送信（日次バッチ）。新しいものが後） */
  sendLog?: { at: string; kind: '登録' | '更新' | 'メール送信予約' | 'メール送信'; to: string; note: string }[];
};

/**
 * お問い合わせ（dm.notice.inquiries）。法人Web の「お問い合わせ」から HubSpot へ送る（Phase 2。デモは送ったことにして記録だけ残す。CRM の同期は Phase 3）。
 * ID＝IQ-YYMMDD-NNNN
 */
export type Inquiry = {
  id: string; at: string;
  corpId: string; branchId: string; accountId: string;
  name: string; email: string; tel: string;
  category: string; subject: string; body: string;
  /** 送れなかったお問い合わせは ES に残さない（お客様にエラーを出して送り直してもらう。台帳 F 2026-10-05）ので、状態は送信済だけ */
  status: '送信済（HubSpot）';
  /** HubSpot の受付番号（デモは作った番号） */
  hubspotId: string;
  /** 運営が一覧で開いた日時（空＝新しい（未読）。運営の TOP に件数） */
  readAt?: string;
  /** 通知先メールに送った記録（環境変数 INQUIRY_NOTIFY_MAIL。空なら送らない） */
  mailedTo?: string;
};
/**
 * 通知（dm.notice.notifications）。操作のたびに作る（画面のベル・メール）。ID＝NT-YYMMDD-NNNN
 * to：アカウントID、または サイト全体（accountId＝''。運営は role で絞る）。
 *     site＝app はアプリの利用者（accountId＝拠点ID。その拠点のアプリ利用者みんな。アンケートの通知は利用者ID U＋8桁＝その人だけ）
 * scheduledAt：予約（この日時になったら出す。出すまではどの画面にも出さない。menu.tick が出す）
 */
export type Notification = {
  id: string; at: string;
  to: { site: Site | 'app'; accountId: string; role: string };
  channels: ('site' | 'mail')[];
  templateId: string;
  title: string; body: string;
  link: { type: 'delivery' | 'application' | 'invoice' | 'order' | 'trouble' | 'parking' | 'quote' | 'menu' | 'survey' | ''; id: string };
  readAt: string;
  scheduledAt?: string;
  /** 1回だけ出す通知のキー（notifyOnce）。'sched:' で始まるものは予定のお知らせ（お客様の休みの日には出さない・前の営業日に前倒し） */
  key?: string;
};
/** メールの文面（dm.notice.templates）。{名前} を差し込む */
export type MailTemplate = { id: string; name: string; sites: Site[]; subject: string; body: string; updatedAt: string };

/* ===================== システム管理（area: account に追加） ===================== */

/** ログインの記録（dm.account.loginHistory） */
export type LoginRecord = { id: string; at: string; site: Site; loginId: string; accountId: string; ip: string; result: 'success' | 'fail' | 'blocked'; reason: string };
/**
 * ログインの認証コード（dm.account.otps）。運営Web に IP ホワイトリスト外からログインするとき、メールで送る 4桁・5分（台帳 E・受付簿 #61）。
 * コードは SHA-256 で持つ。間違えた回数が上限で無効（usedAt）
 */
export type LoginOtp = { id: string; site: Site; accountId: string; codeHash: string; ip: string; issuedAt: string; expiresMs: number; usedAt: string };
/** アプリのバージョン（dm.account.appVersions） */
export type AppVersion = { id: string; os: 'iOS' | 'Android'; version: string; force: boolean; note: string; updatedAt: string };

/* ===================== アプリの利用者・購入・レビュー・お気に入り・売上の集計（area: app） ===================== */

export type AppUserStatus = '有効' | '利用停止' | '退会' | '削除済';
/**
 * アプリの利用者（dm.app.users）。ID＝U＋8桁。拠点（branchId）の従業員が個人アプリで商品を買う。
 * nickname が '' ＝未設定（レビューでは「匿名ユーザー」）。link＝社員証（従業員番号）の連携、limit＝法人がかけた購入制限
 */
export type AppUserGender = '男性' | '女性';
export type AppUserAge = '10代' | '20代' | '30代' | '40代' | '50代' | '60代以上';
export type AppUser = {
  id: string; branchId: string; name: string; nickname: string; email: string; employeeNo: string;
  /** 性別・年代（アプリの登録情報。運営の購入管理・お気に入りの条件。年代は10歳ごと） */
  gender: AppUserGender; ageGroup: AppUserAge;
  link: '連携中' | '解除済'; limit: 'なし' | '購入不可'; status: AppUserStatus;
  /** 登録日 */
  registeredOn: string;
  lastLoginAt: string;
};
export type PurchaseStatus = '支払済' | '返金中' | '返金済';
/**
 * アプリの購入（dm.app.purchases）。ID＝購入番号。1件＝1商品（数量つき）。
 * productName・unitPriceYen は買ったときの写し（商品マスタを変えても変わらない）。amountYen＝qty × unitPriceYen
 */
export type AppPurchase = {
  id: string; userId: string; branchId: string; productId: string; productName: string;
  qty: number; unitPriceYen: number; amountYen: number; payMethod: string; status: PurchaseStatus; refundReason: string; at: string;
};
/** レビューの1商品（★1〜5 と評価タグ）。name は投稿したときの商品名 */
export type AppReviewItem = { productId: string; name: string; star: number; tags: string[] };
/** レビュー・ご意見（dm.app.reviews）。ID＝RV＋6桁。orderNo＝アプリの注文番号（OD＋7桁）。comment が '' ＝コメントなし */
export type AppReview = { id: string; at: string; userId: string; orderNo: string; comment: string; items: AppReviewItem[] };
/** 評価タグ（dm.app.reviewTags。ID＝tags）：ng＝不満（★1〜2）、ok＝満足（★3〜5） */
export type ReviewTags = { id: 'tags'; ng: string[]; ok: string[] };
/**
 * お気に入りの集計（dm.app.favoriteStats）。ID＝品番。total＝お気に入りにしているユーザーの数、
 * male＋female＝total、ages（10代・20代・30代・40代・50代・60代以上）の合計＝total。
 * cells＝性別×年代の件数（[男性の年代ごと, 女性の年代ごと]。男性の合計＝male・女性の合計＝female・年代ごとの合計＝ages。性別・年代で絞るときの元）
 */
export type FavoriteStat = { id: string; total: number; male: number; female: number; ages: number[]; cells: [number[], number[]] };
/**
 * 月ごとの売上の集計（dm.app.monthlySales）。ID＝YYYY-MM。アプリの購入の明細（dm.app.purchases）がない過去の月の値（ダッシュボード）。
 * byBranch・byProduct は一部（主な拠点・商品）だけ。byPay は決済方法ごと（あれば合計＝totalYen）
 */
export type MonthlySales = { id: string; totalYen: number; byBranch: Record<string, number>; byPay: Record<string, number>; byProduct: Record<string, number> };

/* ===================== 代理店・紹介フィー（area: referral） ===================== */

export type FeePay = '単発' | '継続（ヶ月）' | '継続（永続）';
export type FeeCalc = '固定額' | '月次提供数別の金額' | '請求額割合';
/** フィーの条件。tiers＝[月次提供数の上限, 金額]（月次提供数別の金額のとき） */
export type FeeCond = { pay: FeePay; months: number | null; calc: FeeCalc; amount: number | null; rate: number | null; tiers: [number, number][] | null };
/**
 * 紹介フィーマスタ（dm.referral.feePlans）。ID＝RFP＋6桁。src＝紹介元（法人／代理店）。updated＝最終更新日（YYYY-MM-DD）。
 * linkedDiscounts＝連動する値引き（表示だけ。値引きマスタにまだない値引きもあるので文字で持つ）
 */
export type FeePlan = FeeCond & {
  id: string; code: string; name: string; src: '法人' | '代理店'; status: '有効' | '無効' | '削除済'; updated: string; note: string; linkedDiscounts: string[];
  /** 変更履歴（新しい順。省くと空） */
  history?: { at: string; what: string; by: string }[];
};
/**
 * 紹介（dm.referral.referrals）。ID＝REF＋6桁。親契約に1つ。紹介元は 親契約の agencyId（代理店）か srcCorpId（紹介元の法人）。
 * cond＝紹介に適用した時点のフィー条件の写し。payStart・endPlan・end は YYYY-MM。status＝契約前／有効／満了／途中解約
 */
export type Referral = {
  id: string; contractId: string; srcCorpId: string; feePlanId: string; cond: FeeCond | null;
  payStart: string; status: '契約前' | '有効' | '満了' | '途中解約' | '中止'; endPlan: string; end: string; note: string;
  /** 紹介の中止（契約の中止ではない。status＝中止、end＝中止した年月）。prev＝中止前の状態・終了月（取り消しで戻す） */
  stop?: { reason: string; month: string; prev: { status: '契約前' | '有効' | '満了' | '途中解約'; end: string } };
  history: { at: string; what: string; by: string }[];
};
/** 支払の1行（作ったときの写し）。referralId＝紹介 */
export type FeePayLine = { referralId: string; corp: string; plan: string; pay: string; sites: number; calc: string; baseYen: number; rateTxt: string; feeYen: number; adjYen: number };
/**
 * 紹介フィーの支払（dm.referral.payments）。ID＝FP＋YYYYMM＋-＋4桁。type＝支払先の種類、targetId＝代理店ID か 法人ID。
 * month＝対象年月（YYYY-MM）、paidOn＝支払日（YYYY/MM/DD・支払済みのとき）
 */
export type FeePayment = {
  id: string; month: string; type: '代理店' | '法人'; targetId: string; method: '振込' | '請求値引き'; status: '未払い' | '支払済' | '対象外';
  paidOn: string; note: string; lines: FeePayLine[]; history: { at: string; what: string; by: string }[];
};

/* ===================== 営業サンプル（area: sample） ===================== */

/** 営業サンプルの1商品。how＝倉庫の決め方 */
export type SampleItem = { productId: string; qty: number; how: string };
/**
 * 営業サンプル（dm.sample.samples）。ID＝SM-YYMM-NNN-枝番（倉庫ごとに分けた1件）。宛先だけ持つ（法人・拠点・契約は作らない）。
 * 日付は運営の画面と同じ YYYY-MM-DD（regDate・deliv・ship・week）。ym＝サイクル月、week＝出荷週の月曜、warehouseId＝ピッキング倉庫
 */
export type SalesSample = {
  id: string; base: string; branch: number; split: number; regDate: string; regAt: string; by: string;
  company: string; pic: string; tel: string; zip: string; pref: string; city: string; town: string; bld: string;
  items: SampleItem[]; deliv: string; ship: string; lead: number; note: string; why: string; warehouseId: string; ym: string; week: string;
  status: '受付済' | '締め済' | '締め後追加'; shipOrder: string; memo: string;
  /** 配送ルート（登録のたびに入れる。2026-10-08 台帳 F）と送り状番号（出荷後に入れる）。見本データは持たなくてよい */
  routeCarrier?: string; routeHub?: string; trackingNo?: string;
  /** メモ・送り状番号の変更履歴（2026-10-08 台帳 F。古いデータは持たない） */
  history?: SampleChange[];
};
/** 営業サンプルの変更履歴の1行。field＝メモ／送り状番号 */
export type SampleChange = { at: string; by: string; field: string; before: string; after: string };
/** 出荷週の締め（dm.sample.weekCloses）。ID＝出荷週の月曜（YYYY-MM-DD） */
export type SampleWeekClose = { id: string; at: string; by: string };
/** 営業サンプルの件数（月の合計。dm.sample.quotas）。ID＝サイクル月。メニュー管理 ＞ 月間メニューで決める */
export type SampleQuota = { id: string; n: number };

/* ===================== マスタ・メニューの設定（area: master・menu に追加） ===================== */

/** 自販機の列（[列の数, 1列の数]）。W＝ワイド、S＝スタンダード、B＝ボトル */
export type VmFrame = 'W' | 'S' | 'B';
/** 自販機の列の構成（dm.master.vmLayouts）。ID＝機種ID（VM…。機種マスタ dm.master.models にある自販機）。maker＝メーカー */
export type VmLayout = { id: string; maker: string; lanes: Partial<Record<VmFrame, [number, number][]>> };
/** 平均仕入単価（税抜・50プラン）の目標の幅（下限〜上限・円）。fr＝冷蔵庫（std・ns）、vm＝自販機。メニューごとに持つ（MonthlyMenu.avgTarget。2026-10-05 台帳 F「平均単価の目標」） */
export type AvgRange = { min: number; max: number };
export type AvgTarget = { fr: AvgRange; vm: AvgRange };

/* ===================== 倉庫在庫・入荷（area: stock・lib/domain/stock.ts） ===================== */

/**
 * 倉庫在庫の起点（dm.stock.bases）。ID＝<倉庫ID>|<品番か資材ID>。THOMAS の棚卸し・ES事務所の棚卸しの数（on の日の終わりの数）。
 * いまの在庫＝qty＋その日より後の入荷（dm.stock.receipts）−出荷（配送の明細・資材便）±在庫の記録（dm.stock.moves）。
 * minQty＝これを下回ったら在庫不足のアラート（資材。0＝見ない）
 */
export type StockBase = { id: string; warehouseId: string; itemId: string; item: '商品' | '資材'; qty: number; on: string; minQty: number };
/** 在庫の記録（dm.stock.moves）。ID＝SM-YYMMDD-NNNN。qty は ±（NG品ロス・棚卸し差異・在庫戻し・資材の入荷（発注なし）など） */
export type StockMove = { id: string; warehouseId: string; itemId: string; item: '商品' | '資材'; on: string; kind: string; qty: number; reason: string; by: string; at: string };
/** 入荷の差異の対応（課題 2-3）：分納を待つ（3回まで）／代替品で対応／不足を受け入れる（③ 除外・請求しない・法人へ通知） */
export type ReceiptFix = '分納を待つ' | '代替品で対応' | '不足を受け入れる' | '多い分を受け入れる';
/** 不足で影響する便（拠点の注文の行）。qty＝その便で足りなくなる数 */
export type ReceiptImpact = { deliveryId: string; branchId: string; orderId: string; slot: string; shipOn: string; deliverOn: string; qty: number };
/**
 * 入荷の記録（dm.stock.receipts）。ID＝RC-<発注番号>-<回>。倉庫にアカウントがないので、運営（システム管理）が商品の数・箱数を手で入れる（THOMAS の入荷実績 CSV は使わない）。
 * 発注の数（planQty。分納の2回目からは残り）と違えば 差異あり・対応待ち（運営の TOP・発注の一覧に出し続ける）→ 対応を選ぶと閉じる
 */
export type Receipt = {
  id: string; poNo: string; part: number; supplierId: string; itemId: string; item: '商品' | '資材'; warehouseId: string; ym: string;
  planQty: number; planBox: number; qty: number; box: number; receivedOn: string; bb: string; note: string;
  status: '一致' | '差異あり・対応待ち' | '対応済';
  /** 差異の対応（status＝対応済のとき） */
  fix?: { how: ReceiptFix; at: string; by: string; note: string; nextOn?: string; altId?: string; impacts?: ReceiptImpact[]; /** 多い分を受け入れるときの支払いの数（運営がそのとき選ぶ） */ payBasis?: '発注数' | '入荷数' };
  by: string; at: string;
};

/* ===================== スケジュールの移動・価格世代・一括変更（課題 2-4・7-2） ===================== */

/** 価格世代（Plan.priceGens）。ID＝PG-<プランID>-NN。fromCycle＝適用開始のサイクル月 */
export type PriceGen = {
  id: string; fromCycle: string; prices: PlanCoursePrice[]; note: string; at: string; by: string;
  /**
   * 公開用（運営が世代に付ける印・プランに1つ。最新＝公開ではない。法人Web の申込・プラン変更に出すのはこの世代だけ。
   * 公開しない世代は特定の法人向けの個別価格（子契約の priceGenId で選ぶ）。台帳 E 2026-10-05
   */
  public?: boolean;
  /** 開始期間・終了期間（yyyy/mm/dd・参考の記録。契約が使う世代は子契約の priceGenId で決まり、期間で制限しない：台帳 F） */
  periodFrom?: string; periodTo?: string;
  /** 誤りの訂正（子契約が使っている世代の金額を直した記録。課題 4b-9） */
  fixes?: { at: string; by: string; reason: string; before: PlanCoursePrice[] }[];
};

/** 移動の1件（変更前・変更後のお届け日と出荷日。resent＝出荷指示を送ったあとなので版番号つきで再送） */
export type MoveRow = { deliveryId: string; branchId: string; temp: TempType; fromDeliver: string; fromShip: string; toDeliver: string; toShip: string; resent: boolean };
/**
 * スケジュールの移動の記録（dm.delivery.moves）。ID＝MV-YYMMDD-NNNN。
 * phase＝本発注（その半分の本発注の時期の終わり）の前か後か。後は1便（同じ日の冷凍・冷蔵は一緒）・理由が要る・A↔B／C↔D だけ。
 * confirmed＝運営が確かめた（休日＝お届けしない日・日曜／別のサイクル＝トラブルの対応）
 */
export type DeliveryMove = {
  id: string; at: string; by: string; to: string; phase: '本発注前' | '本発注後'; reason: string; trouble: boolean;
  confirmed: ('休日' | '別のサイクル')[]; notifyCorp: boolean; rows: MoveRow[]; warnings: string[]; carriers: string[];
  /** トラブルの対応のとき：選んだトラブル（dm.delivery.troubles。課題 4b-4）。古い記録にはない */
  troubleId?: string;
};

/**
 * 配送サイクル設定の変更履歴の1行（dm.delivery.cycleSettingsLog。P-HIST の列＋影響件数）。保存のたびに、変えた項目ごとに1行。
 * 影響件数＝その保存で作り直した配送の数／要確認に出した配送の数（日付は自動では動かさないので、新しい休みにかかる配送は要確認へ出す）
 */
export type CycleSettingsLog = {
  id: string; at: string; by: string; op: '登録' | '変更' | '削除'; item: string; before: string; after: string; reason?: string;
  rebuilt: number; flagged: number;
};

/** 一括変更で変える項目（7-2）。省いた項目は変えない。hubId＝'' は中継なし */
export type BulkTo = {
  warehouseId?: string; hubId?: string; carrierId?: string; carrier2Id?: string;
  /** 中継があるときの区間1（倉庫→中継）の運び手：中継を運営する会社か委託配送会社（課題 4b-7）。省くと中継を運営する会社（今の中継のままなら今の運び手） */
  leg1CarrierId?: string;
  /** 価格世代の一括切替：切り替える先の価格世代（子契約の priceGenId に書く）。省くとサイクル月の世代 */
  priceGenId?: string;
};
/** 一括変更の絞り込み（倉庫には担当エリアがない＝運営が条件で選ぶ・決定 Q-E） */
export type BulkFilter = {
  warehouseId?: string; hubId?: string; carrierId?: string; prefs?: string[]; city?: string; zip?: string;
  method?: '' | '自社便' | '委託' | '路線便'; corpId?: string; branchId?: string; course?: string; temp?: '' | '冷蔵' | '冷凍';
  /** 価格世代の一括切替（子契約一覧から・台帳 F「価格世代を一括切替の置き場所」）：プラン・いま使っている価格の世代 */
  planId?: string; genId?: string;
};
/** 一括変更の1契約の結果 */
export type BulkResult = { contractId: string; branchId: string; result: '変更' | 'スキップ' | '失敗'; reason: string; children: string[]; skipped: { id: string; why: string }[]; deliveries: string[]; resent: string[] };
/**
 * 一括変更（dm.bulk.changes）。ID＝BK-YYMMDD-NNNN。実行は分けて進める（status：実行中 → 完了。processed／total が進み具合）。
 * mode＝ルート（倉庫・中継・委託配送先／路線便）／価格世代。元に戻す操作はない（履歴だけ）
 */
export type BulkChange = {
  id: string; mode: 'ルート' | '価格世代'; source: '倉庫マスタ' | '委託配送先マスタ' | 'プランマスタ' | '子契約一覧'; sourceId: string;
  filter: BulkFilter; to: BulkTo; planId: string; fromCycle: string; contractIds: string[]; notifyCorp: boolean;
  status: '実行中' | '完了'; total: number; processed: number; results: BulkResult[];
  summary: { changed: number; skipped: number; failed: number; children: number; deliveries: number; resent: number; ordersReset: number; carriers: string[] };
  /** 委託配送先へ知らせる拠点（終わったときに1社1通。off＝担当の終了、on＝担当の追加） */
  carrierNotes?: Record<string, { off: string[]; on: string[] }>;
  /**
   * 確認の画面で出した注意（新しい倉庫の出荷禁止日・リードタイム）を SA が確かめて実行した記録（課題 4b-6）。
   * deliveries＝出荷日が新しい倉庫の出荷禁止日に当たる配送（そのまま変えた。日付は運営が直す）
   */
  acks?: { at: string; by: string; alerts: string[]; deliveries: { id: string; shipOn: string; warehouseId: string }[] };
  at: string; by: string; finishedAt: string;
};
