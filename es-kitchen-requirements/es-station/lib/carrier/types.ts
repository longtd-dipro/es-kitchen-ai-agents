/* 委託配送先Web（30_委託配送先_まとめ.html）の型 */

/** 温度帯（f＝冷凍・r＝冷蔵・m＝資材） */
export type Temp = 'f' | 'r' | 'm';

/** 配送の状態（運営の配送管理と同じ。予定＝共通データの、締切前でまだ確定していない配送） */
export type DeliveryStatus = '予定' | '確認中' | '出荷待' | '出荷済' | '受取済' | '納品済' | '一部納品済' | '再配達待' | '中止' | '取消';

/**
 * 委託配送先が運ぶ配送（元の DELIV）。共通データ（dm.delivery の配送と自社の区間）から lib/carrier/fromDomain.ts で作る。
 * ドライバーの見本（lib/driver）も、移行が済むまでこの形の carrier.deliveries を読む。
 */
export type CarrierDelivery = {
  /** 配送No（DL-YYMMDD-NNNN。日付は作ったときの出荷予定日。あとで日付を変えても変わらない） */
  no: string;
  /** 委託配送会社ID（DE…） */
  company: string;
  /** 納品日（YYYY-MM-DD） */
  date: string;
  /** 出荷予定日（YYYY-MM-DD） */
  ship: string;
  /** 出荷日（実績）（YYYY-MM-DD。まだ出ていなければ省く） */
  shipped?: string;
  temp: Temp;
  /** 引取先（WH・HU のID） */
  from: string;
  /** 担当区間 */
  leg: string;
  /** 届け先拠点名 */
  to: string;
  addr: string;
  /** 配送スタッフID（未設定は null） */
  staff: string | null;
  st: DeliveryStatus;
  /** 配送区分（ES配送便・COOL便） */
  kbn: string;
  boxes: number;
  /** 集金額・駐車料金（円） */
  cash: number;
  park: number;
  /** 駐車報告のレシートのファイル名（なければ省く） */
  parkFile?: string;
  /** 中継からの2次（出荷済でも配送スタッフを割り当てられる） */
  relay?: boolean;
  /** 納品の時刻 */
  doneAt?: string;
  /** 出荷指示の送信後に配送スタッフを変えた（運営が出荷指示を再送する） */
  resend?: boolean;
  /** 代替品の設定ID */
  alt?: string;
  /** 路線便（ヤマトなど）の送り状番号と追跡ページ（課題 0-2。中継で路線便の荷物を受け取るときなど） */
  track?: { no: string; carrier: string; url: string }[];
};

/** 画面に出す配送（運営の配送管理の状態をかぶせたもの・トラブルのまとめ） */
export type DeliveryView = CarrierDelivery & {
  /** 「対応中 2件（不在・連絡不可／商品不足・誤配送）」 */
  trouble?: string;
  /** 運営の配送管理にある配送か（共通データの配送は常に true） */
  linked: boolean;
  /** 共通データの区間ID・配送ID（no は、同じ配送の2区間を運ぶときだけ区間ID） */
  legId?: string;
  deliveryId?: string;
};

/** トラブル（配送スタッフがドライバーアプリで報告したもの） */
export type CarrierTrouble = {
  id: string;
  company: string;
  /** 'YYYY-MM-DD HH:mm' */
  at: string;
  no: string;
  scene: string;
  kind: string;
  note: string;
  staff: string;
  photo: number;
  auto?: boolean;
  st: '対応中' | '解決済';
  resAt?: string;
  res: string;
};

/** 一部納品の内訳（理由・再配送） */
export type PartInfo = { why: string; resend: string };

/** 実績の商品 [品番, 商品名, カテゴリ, 廃棄数, 賞味期限, 理論在庫, 実在庫, 予定数, 一部納品のときの納品数] */
export type Food = [string, string, string, number, string, number, number, number, number];

/** 代替品の設定（ALT） */
export type AltInfo = { id: string; del: string; prev: string; bad: string; sub: string; found: string; why: string; newsId: number };

export type NewsItem = { id: number; when: string; cat: string; t: string };
export type NewsBody = { at: string; body: string };

/* ---------- 見積依頼 ---------- */

export type QuoteStatus = '未回答' | '再確認待ち' | '回答済' | '対応不可' | '期限切れ';
export type QuoteKind = '新規見積' | '金額再確認';
/** 運営が設定した依頼内容 */
export type QuoteReq = {
  pick: string; area: string; goods: string; vend: string; plan: string; course: string; ship: string; cycle: string; start: string; dueJ: string; note: string;
  /** 住所・土日対応・金額条件・まとめて聞くほかの拠点（2026/10/03 見積依頼の項目） */
  addr: string; weekend: string; priceCond: string; moreSites: string;
};
/** 回答履歴 [日時, 内容, だれ] */
export type HistRow = [string, string, string];
/** 自社の回答 */
export type QuoteAnswer = {
  type: 'ok' | 'ng' | 'expired';
  rows?: [string, number | string][];
  file?: string;
  start?: string;
  comment?: string;
  /** 回答日（YYYY年M月D日） */
  date?: string;
  /** 回答日時 */
  at?: string;
  reason?: string;
  dueAt?: string;
  hist: HistRow[];
};
export type Quote = {
  id: string;
  company: string;
  t: string;
  corp: string;
  kind: QuoteKind;
  ship: string;
  /** 回答期限（YYYY/MM/DD） */
  due: string;
  st: QuoteStatus;
  /** 受信日（YYYY/MM/DD） */
  recv: string;
  req: QuoteReq;
  /** 自社の回答（まだのときはなし。金額再確認は前回の回答を出す） */
  answer?: QuoteAnswer;
  /** 運営Web の配送問い合わせから届いた見積依頼（delivery.quotes。いまは使わない） */
  fromOps?: boolean;
};

/** 運営Web の配送問い合わせが書く見積依頼（delivery.quotes。lib/ops/areas/delivery.ts の requestQuote と同じ形）＋委託配送先の回答 */
export type OpsQuoteDoc = {
  id: string; consignee: string; name: string; pref: string; city: string; temp: string; at: string;
  /** ここから下は委託配送先Web が書く */
  title?: string; corp?: string; kind?: QuoteKind; ship?: string; due?: string;
  st?: QuoteStatus; answer?: QuoteAnswer; answeredAt?: string;
};

/** 回答フォームの中身（送るもの） */
export type QuoteAnswerInput = {
  company: string;
  id: string;
  mode: 'ok' | 'ng' | 'same' | 'change';
  rows: [string, string][];
  file?: string;
  /** 最短開始可能日（YYYY-MM-DD） */
  sd?: string;
  cm?: string;
  ng?: string;
  ngc?: string;
  newAmt?: string;
  file2?: string;
  chg?: string;
};

/* ---------- 配送スタッフ ---------- */

export type StaffStatus = '有効' | '無効' | '利用停止' | '免許未登録';
/** 委託配送先Web の配送スタッフ（共通データのドライバー dm.master.drivers ＋ アカウント ＋ 委託配送先だけの値） */
export type Staff = {
  id: string;
  name: string;
  kana: string;
  /** 雇用形態 */
  kbn: '社員' | '個人事業主';
  tel: string;
  st: StaffStatus;
  /** アカウント状態 */
  acct: '発行済' | '未発行';
  email: string;
  lic: number;
  last: string;
  /** 削除済（論理削除） */
  del?: boolean;
  /** 共通データのドライバーか（常に true） */
  inMaster?: boolean;
};
/** carrier.staff に持つもの（共通データにない値：雇用形態・削除。ドライバーの見本は古い文書の名前なども読む） */
export type StaffExt = Partial<Staff> & { id: string; company: string };
/** 編集・登録のフォーム */
export type StaffDraft = { name: string; kana: string; kbn: string; st: string; tel: string; email: string; lic: number };

/** 保冷バッグ・保冷剤（共通データの台帳 dm.carrier.coolers の行。staff＝「DR… 名前」） */
export type Cooler = { no: string; kind: string; qty: number; staff: string; date: string; status: string; memo: string };

/* ---------- プロフィール ---------- */

export type Contact = { k: string; n: string; f: string; m: string; t: string };
export type Profile = {
  company: string;
  name: string;
  kana: string;
  kind: string;
  zip: string;
  pref: string;
  city: string;
  addr: string;
  bld: string;
  tel: string;
  fax: string;
  contacts: Contact[];
  /** 対応エリア（都道府県の短い名前） */
  areas: string[];
  /** 運営のマスタの対応エリア（関東・中部） */
  masterArea: string;
  ngDays: string[];
  areaNote: string;
  cars: string[];
  /** 冷凍ボックス・冷蔵ボックスのレンタル希望・冷蔵保管スペース */
  frz: string;
  ref: string;
  sp: string;
  carNote: string;
};
export type ProfileRequest = { company: string; at: string; draft: Partial<Profile> };

/* ---------- 申し込み ---------- */

export type ApplyContact = { k: string; n?: string; f?: string; m?: string; t?: string };
export type ApplyForm = {
  name?: string; kana?: string; zip?: string; pref?: string; city?: string; addr?: string; bld?: string; tel?: string; fax?: string;
  contacts?: ApplyContact[];
};
export type ApplyForm2 = { area: string; ng: string[]; areaNote: string; car: string; frz: string; ref: string; sp: string; carNote: string; agree: boolean };
