/*
 * 領域 contracts（法人・拠点・子契約・配送ルートの一括変更）の型。
 * 元：02_デモ/部品/12_運営_法人拠点契約.html（法人一覧・拠点一覧・子契約一覧と、その詳細・編集）
 *     ＋ 運営の本体 main_script2.js の「配送ルートの一括変更」（renderRtBulk）
 *
 * ほかの領域（請求・配送など）から読むときは、次の kind を repo.list で読む（読むだけ）：
 *   contracts.corps      … Corp（法人）
 *   contracts.branches   … Branch（拠点。親契約の主な項目もここに持つ）
 *   contracts.children   … ChildContract（子契約＝サイクル月ごとの契約）
 *   contracts.routes     … RouteSite（拠点ごとの配送ルート。一括変更の対象）
 *   contracts.routeRuns  … RouteRun（配送ルートの一括変更の履歴）
 */

/* ---------- 詳細画面の項目の値 ---------- */

/** 表のセル。文字だけのセルは string */
export type Cell =
  | string
  | { t: 'in'; v: string; ph?: string; w?: number; ro?: boolean; r?: boolean }
  | { t: 'sel'; v: string; opts: SelOpt[] }
  | { t: 'cyc'; v: string[]; opts: SelOpt[] }
  | { t: 'del' }
  | { t: 'html'; html: string };
/** ドロップダウンの選択肢（optgroup は group） */
export type SelOpt = string | { group: string; opts: string[] };
/** 表の行。band＝休止期間の帯（子契約ではない） */
export type TableRow = { c: Cell[]; cls?: string } | { band: { from: string; to: string; html: string } };

/** 項目の値。チェックボックスの欄は選んだラベルの配列 */
export type FormVal = string | string[];
/**
 * 詳細画面の値のうち、見本（画面の定義の初期値）と違うものだけを持つ（元の data-fill と同じ形）。
 *   '<項目名>'          … 項目の値（項目名は画面の定義の name）
 *   '<項目名>/n'        … 価格調整の適用の金額
 *   '@<要約の見出し>'   … 画面上部の要約（sumbar）の値
 *   '#<カードの見出し>' … 表の行（string[][] は元のデモの形。保存すると TableRow[] になる）
 */
export type FormFill = Record<string, FormVal | string[][] | TableRow[]>;

/* ---------- 法人・拠点・子契約 ---------- */

export type CorpStatus = '仮登録' | '正式登録' | '休眠' | '取消';
/** 法人（kind: contracts.corps） */
export type Corp = {
  id: string;                 // 法人ID（CU00001）
  name: string;               // 法人名
  status: CorpStatus;
  invoiceUnit: string;        // 請求書の発行単位（まとめて発行（法人1通）／拠点ごと発行）
  branchLabel: string;        // 配下の拠点（一覧の表示。例 3拠点）
  invoiceLead: string;        // 請求書発行リードタイム（一覧の表示。例 1ヶ月前請求）
  salesRep: string;           // ES営業担当
  registeredAt: string;       // 登録日時 YYYY/MM/DD HH:mm
  /** 仮登録の間の申請番号（契約申請管理の申請詳細で編集する） */
  apNo?: string;
  form: FormFill;
};

export type BranchStatus = '仮登録' | '本登録' | '閉鎖予定' | '閉鎖' | '取消';
/** 拠点（kind: contracts.branches）。親契約（CP…）は拠点に1つ */
export type Branch = {
  id: string;                 // 拠点ID（CU00643）
  name: string;               // 拠点名
  corpId: string;             // 所属法人の ID（法人なしは ''）
  corpName: string;           // 所属法人（一覧の表示。法人なしは（法人なし））
  status: BranchStatus;
  parentNo: string;           // 親契約番号（CP0000001）
  contractStatus: string;     // 契約ステータス（有効・仮登録・解約手続き中・利用休止・終了）
  contractKind: string;       // 契約種別（本導入・お試しキャンペーン）
  plan: string;               // 現在のプラン（ES000004 100プラン）
  startYm: string;            // 当初契約開始年月（2026/03）
  duration: string;           // 継続年月（0年7ヶ月）
  billTo: '法人' | 'この拠点';  // 請求先
  addr: string;               // 住所（一覧の表示。東京都港区）
  registeredAt: string;
  apNo?: string;
  /** 承認待ちの変更申請。子契約の、申請の対象の項目は承認後に変えられる（決定 TL-1） */
  pending?: { no: string; kind: string; fields: string[] };
  form: FormFill;
};

/** 子契約（kind: contracts.children）。ID＝親契約番号-YYYYMM */
export type ChildContract = {
  id: string;                 // CP0000001-202611
  parentNo: string;           // CP0000001
  branchId: string;           // CU00643
  corpId?: string;            // 所属法人の ID（詳細のヘッダーのリンク）
  month: string;              // 契約・サイクル月 YYYY-MM
  branchName: string;
  corpName: string;
  kind: string;               // 契約種別
  plan: string;               // ES000004 100プラン
  ship: string;               // 配送区分・納品回数（ES配送便 月2回）
  /** 取消した子契約（休止の承認などで取り消したもの。一覧では灰・既定で出す） */
  canceled?: boolean;
  billMonth: string;          // 請求月（前払い）YYYY-MM（年一括は注記つき）
  amount: string;             // 当月請求額（表示。53,000円）
  amountYen: number;          // 当月請求額（円）
  billStatus: string;         // 請求ステータス（前払い ／ 後払い）
  gen: string;                // 生成方法（日次バッチ・手動生成・年一括）
  apNo?: string;
  form: FormFill;
};

export type Entity = 'corp' | 'branch' | 'child';

/* ---------- 詳細画面の定義（forms.ts） ---------- */

export type Ctl =
  | { t: 'input'; v: string; s7c?: string }
  | { t: 'textarea'; v: string; rows: number }
  | { t: 'select'; v: string; opts: SelOpt[] }
  | { t: 'zip'; v: string }
  | { t: 'buttons'; items: { label: string; act?: string }[] }
  | { t: 'file'; fn: string; btns: string[] }
  | { t: 'chk'; items: string[]; v: string[] }
  | { t: 'adjust'; v: string; opts: SelOpt[]; n: string; unit: string };

export type FieldDef = {
  name: string;
  /** 表示名（name と違うときだけ） */
  label?: string;
  /** req＝必須（*）、cond＝条件付き（△） */
  mark?: 'req' | 'cond';
  /** 項目定義のタグ（P2新・承認必須・通知・法人に出さない など） */
  tags?: { cls: string; text: string }[];
  /** new＝フェーズ2で新設、chg＝持ち方が変わる */
  phase?: 'new' | 'chg';
  /** 運営も参照だけ */
  rop: boolean;
  /** 入力する項目（「入力する項目だけ」で残る） */
  input?: boolean;
  /** 最初から非活性（条件しだい） */
  na?: boolean;
  ctl: Ctl;
  /** 説明（項目定義を出したときだけ見える） */
  note?: string;
  meta?: { code: string; type: string };
};
export type TableDef = { cols: { label: string; ops?: boolean }[]; rows: TableRow[] };
export type CardBlock =
  | { t: 'fields'; fields: FieldDef[] }
  | ({ t: 'table' } & TableDef)
  | { t: 'add' }
  | { t: 'note'; text: string };
export type CardDef = { title: string; chip?: string; ops?: boolean; body: CardBlock[] };
export type TabDef = { label: string; ops?: boolean; cards: CardDef[] };
export type FormDef = {
  /** 元の画面の見出し */
  title: string;
  /** 見本の ID（この ID の値が初期値） */
  sample: string;
  sum: { k: string; v: string; ops?: boolean }[];
  tabs: TabDef[];
};

/** 詳細の読み取り（detail）が返す、見本と合わせた値 */
export type DetailData<R> = {
  row: R;
  values: Record<string, FormVal>;
  tables: Record<string, TableRow[]>;
  sum: { k: string; v: string }[];
  /** 読み込んだ版（保存で baseVersion として送る。E31） */
  version?: string;
};

/* ---------- 配送ルートの一括変更 ---------- */

/** 拠点の配送ルート（kind: contracts.routes）。c1＝1次の配送会社、hub＝中継先、c2＝2次の配送会社 */
export type RouteSite = {
  id: string; name: string; pref: string; course: string; kind: string;
  wh: string; c1: string; hub: string; c2: string; lead: string;
};
/** 一括変更の履歴（kind: contracts.routeRuns） */
export type RouteRun = { id: string; no: string; at: string; how: string; cyc: string; n: number; what: string; mail: number };
/** 変更後のルート（空＝変えない） */
export type RouteTo = { wh: string; c1: string; hub: string; c2: string };
export type RouteFilter = { wh: string; c: string; hub: string; pref: string };
