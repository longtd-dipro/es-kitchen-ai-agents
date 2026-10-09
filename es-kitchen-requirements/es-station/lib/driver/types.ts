/* ドライバー（40_ドライバーブラウザ.html）の型 */

/** ログイン中の配送スタッフ（共通データのドライバー dm.master.drivers と所属の委託配送会社 dm.master.carriers） */
export type DriverMe = {
  /** ログインID（配送スタッフID DR…） */
  id: string;
  name: string;
  kana: string;
  tel: string;
  mail: string;
  /** 所属先（「ES配送便（自社）」・委託配送先名） */
  org: string;
  /** 自社のスタッフ（委託業者向けの資料は出さない） */
  own: boolean;
  /** 委託配送会社ID（DE…。自社は null） */
  company: string | null;
};

/** 便の種類（ES配送便・COOL便） */
export type DelType = 'es' | 'cool';
/** 受取地点の種類（倉庫・中継先） */
export type PtType = 'wh' | 'hub';

/** トラブル（画面に出す形。元の o.tr の1件） */
export type Trouble = {
  /** 共通データのトラブルID（TR-…）。オフラインでまだ送っていないものは driver.troubles の ID（DT…） */
  id: string;
  /** アプリの選択肢（原文） */
  raw: string;
  note: string;
  /** 報告した時刻（H:mm） */
  at: string;
  auto: boolean;
  resolved?: boolean;
  resAt?: string;
};

/** 送り状（荷物1箱） */
export type Inv = { no: string; late?: boolean };

/** 受取地点（倉庫・中継先）。元の S.pts の1件 */
export type Point = {
  id: string;
  /** 担当の配送スタッフ */
  staff: string;
  type: PtType;
  name: string;
  /** 倉庫コード・営業所コード */
  code: string;
  zip: string;
  addr: string;
  tel: string;
  /** 委託業者向けの資料 */
  docs: string[];
};
/** 受取地点の進み具合（受取済は共通データの区間の受取から出す。箱ごとのチェック・回数は driver.pointState に持つ） */
export type PointProgress = {
  status: '未受取' | '受取済';
  doneAt: string | null;
  round: number;
  /** 受け取った荷物（'<配送No>|<送り状番号>' → true） */
  recv: Record<string, boolean>;
  /** オフラインで端末に保存した（未送信） */
  unsent?: boolean;
};
/** driver.pointState の文書（ID＝'<スタッフ>|<受取地点>|<日付>'） */
export type PointDoc = { id: string } & Partial<PointProgress>;
/** 画面に出す受取地点 */
export type PointView = Point & PointProgress & { tr: Trouble[] };

/** 配送（納品先1件）。元の S.dels の1件 */
export type Delivery = {
  /** 配送No（DL-…） */
  no: string;
  staff: string;
  /** 受取地点の ID */
  pt: string;
  type: DelType;
  name: string;
  zip: string;
  addr: string;
  person: string;
  tel: string;
  /** 受取時間帯 [[開始, 終了], …] */
  win: [string, string][];
  /** 納品条件・納品備考 */
  cond: string;
  note: string;
  docs: string[];
  boxes: number;
  /** 冷蔵・冷凍の品数（わからないときは null） */
  fr: number | null;
  fz: number | null;
  inv: Inv[];
  /** 集金予定額（円） */
  cash: number;
  /** 納品日（今日でないとき。「10/06（火）」。今日は受取だけ） */
  later?: string;
  /** 受け取ったが、納品日はまだ先（「10/06（火）」）。納品するときは確認と理由が要る（課題 4-1） */
  early?: string;
};
/** 配送の進み具合（配送完了は共通データの配送の状態から出す。到着予定・箱のチェック・未送信は driver.deliveryState に持つ） */
export type DeliveryProgress = {
  status: '未配送' | '配送完了';
  doneAt: string | null;
  /** 配送でチェックした荷物（送り状番号 → true） */
  ck: Record<string, boolean>;
  /** 到着予定（共有済み） */
  eta: [string, string] | null;
  etaAt?: string;
  /** 受取のあとに足した荷物 */
  extra?: Inv[];
  unsent?: boolean;
};
export type DeliveryDoc = Partial<DeliveryProgress> & { no: string; staff: string };
/** 画面に出す配送 */
export type DeliveryView = Delivery & DeliveryProgress & {
  tr: Trouble[];
  /** 運営の配送管理にある配送か */
  ops: boolean;
  /** 委託配送先の配送管理にある配送か */
  carrier: boolean;
  /** 代替品の設定（ALT-…） */
  alt?: string;
};

/**
 * ES配送便の5ステップ（元の S.flow[id]）。中身は共通データの配送の報告（dm.report.deliveryReports）から作る。
 * id＝商品ID（M…）。画面は行をそのまま返すので、id を手がかりに報告に書き戻す
 */
/** w＝読み込んだときに dc に入っていた「廃棄・棚卸し」の画面の廃棄の数（あとから登録した廃棄を完了のときに足すため） */
export type StockRow = { id?: string; n: string; th: number; dc: number; ac: number; ck: boolean; alt?: boolean; w?: number };
/** 陳列（検品）の行。lid＝配送の明細 ID（同じ商品の通常・代替品の行を分ける。B1） */
export type DispRow = { id?: string; lid?: string; n: string; pl: number; ac: number; ck: boolean };
export type Flow = {
  /** 進んだところ（0〜6。['s1','s1','s2','s3','s4','s5'][step] から再開） */
  step: number;
  before: string[];
  after: string[];
  stock: StockRow[];
  stockDone: boolean;
  stockAt?: string;
  disp: DispRow[];
  dispDone: boolean;
  dispAt?: string;
  /** 集金予定額・実集金額（入力は数字だけ。未入力は ''） */
  plan: number;
  cash: string;
  park: { fee: string; rc: string | null };
  alt?: boolean;
  /** 納品日より前に納品する理由（課題 4-1。確認のモーダルで入れる） */
  early?: string;
};

/** お知らせ（共通データのお知らせ（ドライバー向け）と自分あての通知） */
export type News = { t: string; title: string; body: string; read: boolean };
export type Manual = { t: string; b: string };

/** 廃棄登録の行・棚卸しの行 */
export type WasteRow = { n: string; qty: number; reason: string };
export type InvRow = { id?: string; n: string; th: number; ac: number };

/** driver.troubles の文書（ドライバーが報告したトラブル。共通データのトラブルにない、アプリの選択肢・受取地点・写真の数を持つ） */
export type TroubleDoc = {
  id: string;
  staff: string;
  /** 'pt:<受取地点ID>' または 'd:<配送No>' */
  target: string;
  raw: string;
  note: string;
  /** 'YYYY/MM/DD HH:mm' */
  at: string;
  auto: boolean;
  photos: number;
  /** 選んだ送り状番号 */
  nos: string[];
  /** 共通データに書いたトラブル（TR-…）。オフラインでまだ送っていないときは空 */
  dm: string[];
};

/** 共通データに送るもの（オフラインのときは送らずに driver.outbox にためる） */
export type Effect =
  | { k: 'pickup'; no: string; leg: string; what: string; at: string }
  | { k: 'trouble'; tid: string; no: string; raw: string; note: string; at: string }
  | { k: 'append'; tid: string; text: string; at: string }
  | { k: 'resolve'; no: string; at: string; why: string }
  | { k: 'complete'; no: string; what: string; at: string; early?: string }
  | { k: 'finish'; no: string; flow: Flow; what: string; at: string }
  | { k: 'inspect'; no: string; flow: Flow; at: string }
  | { k: 'edit'; no: string; flow: Flow; what: string; at: string }
  | { k: 'park'; no: string; fee: number; file: string; at: string }
  | { k: 'waste'; no: string; rows: { productId: string; qty: number }[]; at: string }
  | { k: 'stock'; branchId: string; rows: { productId: string; actual: number }[]; at: string }
  | { k: 'eta'; no: string; eta: [string, string]; at: string }
  | { k: 'hist'; no: string; what: string; at: string };
export type OutboxItem = { msg: string; effects: Effect[]; objs: string[] };
