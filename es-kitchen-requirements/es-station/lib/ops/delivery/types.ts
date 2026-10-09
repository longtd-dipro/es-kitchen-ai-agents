/* 配送管理（部品 16_運営_配送.html と 本体の 配送問い合わせ・資材の集計）の型 */

/** ES Kitchen の色の名前（Badge の tone） */
export type Tone = 'neutral' | 'success' | 'info' | 'warning' | 'negative' | 'primary';
/** 温度帯のタグ（TempTag の kind） */
export type TempKind = 'frozen' | 'chilled' | 'ambient' | 'mixed' | 'material';

/* ---------- スケジュール（月・週・日） ---------- */

/** カレンダーのマスの1行。parts は「休：出荷・配送」のように色を分けるとき */
export type CalLine = { pre?: string; value?: string; tone?: string; post?: string } | { parts: { text: string; tone?: string }[] };

/** カレンダーのマス（ESKitchen.CalendarCell） */
export type CalCell = {
  date: string;
  today?: boolean;
  holiday?: string;
  cycle?: string;
  slot?: string;
  week?: string;
  /** es-calcell--<state>（out・over・draft・pause・holiday・first） */
  state: string[];
  lines: CalLine[];
  /** セルに出すバッジ（2つまで＋「+N」。2026/10/03） */
  badges: { tone: Tone; label: string; title?: string }[];
  /** 出す条件に合うバッジ全部（CSV） */
  allBadges?: string[];
  /** その日を含む週の月曜（YYYY-MM-DD）。押すと週表示を開く */
  wk?: string;
};

export type StageStep = { label: string; state: 'done' | 'current' | 'future' };
/** 段階の表示（ESKitchen.StageIndicator） */
export type Stage = { mode: 'fixed' | 'edit'; title: string; detail: string; steps: StageStep[] };

/** 月表示（確定＝10月・予定＝11月） */
export type MonthView = { id: string; label: string; draft: boolean; stage: Stage; cells: CalCell[]; legend: boolean };

export type WeekItem = {
  /** 押すと開く配送データ（ないものは見本の配送データ） */
  dl?: string;
  tpKind: TempKind;
  nm: string;
  tip: string;
  dt: string;
  dtCls: string;
  cls: string;
};
export type WeekDay = {
  wd: string;
  d: number;
  slot: string;
  today: boolean;
  off: boolean;
  a: string;
  w: string;
  wc: string;
  p?: string;
  b: string;
  badge?: string;
  items: WeekItem[];
  /** その日の動かせる配送（出荷の前）の ID（「全て選択」で全部を選ぶとき。画面に出していない分も含む） */
  ids?: string[];
  more: number;
  /** 予定の週：その日の件数（全て選択の件数） */
  n?: number;
};
/** 週表示。確定の週は出荷・納品の2つの基準で持つ。予定の週（編集）は出荷だけ */
export type WeekView = {
  id: string;
  from: string;
  to: string;
  edit: boolean;
  cycleLabel: string;
  stage: Stage;
  ship: WeekDay[];
  dlv?: WeekDay[];
  /** 予定の週：最初に選んである行（'日-行'） */
  defaultSel?: string[];
};

export type DayRow = {
  id: string;
  site: string;
  svc: string;
  st: string;
  stTone: Tone;
  cr: string;
  tpKind: TempKind;
  plan: string;
  pick: string;
  wh: string;
  c1: string;
  hub: string;
  c2: string;
  drv: string;
  drvCls: string;
  dlv: string;
  mv: string;
  att: string;
  cls: string;
};
export type PlanRow = {
  /** 配送データの ID（チェックで選んで移動するとき） */
  id: string;
  plan: string;
  site: string;
  svc: string;
  tpKind: TempKind;
  pick: string;
  wh: string;
  c1: string;
  hub: string;
  c2: string;
  cr: string;
  dlv: string;
  mv: string;
};
/** 日表示（確定＝配送データの表、予定＝予定の表） */
export type DayView = {
  id: string;
  edit: boolean;
  stage: Stage;
  head: string;
  /** 見出しの右の説明（件数・要対応・変更） */
  stats: { text: string; strong?: string; badge?: string; tail?: string }[];
  total: number;
  rows?: DayRow[];
  plans?: PlanRow[];
  defaultSel?: number[];
};

/* ---------- 要確認 ---------- */

export type ReviewState = '未対応' | '対応済' | '対象外';
/** 要確認の詳細の見た目。sample＝予定生成不可の見本（#142）、shelf＝消費期限の注意（#156） */
export type ReviewDetailKind = 'sample' | 'shelf';
export type ReviewItem = {
  id: string;
  /** 詳細の見出しの番号（#142 など。ないときは対象） */
  no?: string;
  tone: Tone;
  kind: string;
  what: string;
  target: string;
  site: string;
  /** 一覧の納品日（MM/DD（曜）） */
  dlv: string;
  found: string;
  last: string;
  state: ReviewState;
  /** 対象を押したときの行き先（元の href） */
  link: string;
  /** 対応したときのメモ（対応者・日時） */
  doneBy?: string;
  memo?: string;
};

/* ---------- 出荷・配送データ ---------- */

/** 出荷・配送管理の一覧の行 */
export type ListRow = {
  id: string;
  site: string;
  /** 拠点名の下の小さな字（温度帯 ・ 補足） */
  sub: string;
  temp: string;
  method: string;
  st: string;
  stTone: Tone;
  cr: string;
  /** 一覧の表示（MM/DD（曜）・（仮）） */
  ship: string;
  /** 出荷日（実績）（MM/DD（曜）。まだ出ていなければ空）。配送No の横に出す */
  shipped: string;
  dlv: string;
  /** 絞り込み・並べ替え用（YYYY/MM/DD） */
  shipIso: string;
  dlvIso: string;
  staff: string;
  staffMuted: boolean;
  cls: string;
  canEdit: boolean;
  /** 元の一覧で押したときの行き先（見本の配送データの種類） */
  go?: 'done' | 'trouble' | 'child' | 'pending';
  /** 絞り込み用（検索の欄・選ぶ条件が見る値。画面には出さない） */
  fq: {
    /** 法人ID・名、拠点ID・名、契約ID・子契約ID */
    who: string;
    /** 住所・郵便番号・電話番号 */
    addr: string;
    /** 送り状番号 */
    slips: string[];
    course: string;
    wh: string;
    carriers: string[];
    hubs: string[];
    /** 配送スタッフ（区間の担当）『DR00001 小林 翔』 */
    staffs: string[];
    unassigned: boolean;
    trouble: boolean;
    /** 確認中の子（トラブルの子で確認中） */
    childCheck: boolean;
  };
};

export type QtyRow = { n: string; id?: string; p: string; f: string; how: string };
export type CrRow = { id: string; date: string; who: string; whoSub: string; what: string; why: string; judge: string; st: string; tone: Tone; by: string; byWhy: string; cls: string };
export type RoutePoint = { no: number; nm: string; id: string; addr: string; addrSub: string; tel: string; person: string; cond: string; condSub: string; next: string; nextSub: string; pick: string; pickSub: string; docs: string };
/** 送り状。tid＝共通データの送り状ID、url＝追跡ページ（ヤマトは番号入り・課題 0-2） */
export type Invoice = { no: string; src: string; c: string; box: string; st: string; tone: Tone; track: string; tid?: string; url?: string; active?: boolean };
export type Trouble = { no: number; kind: string; tone: Tone; raw: string; who: string; at: string; note: string; photo: string; child: string; st: string; stTone: Tone };
export type HistItem = { time: string; who: string; what: string };
export type Memo = { at: string; who: string; text: string };

/** 配送データ詳細の中身（見本 5件：pending・done・trouble・child・plan） */
export type DeliveryRecord = {
  id: string;
  sample: 'pending' | 'done' | 'trouble' | 'child' | 'plan';
  site: string;
  siteShort: string;
  temp: string;
  st: string;
  stTone: Tone;
  stage: string;
  locked: boolean;
  deadline: string;
  pkg: string;
  cycle: string;
  dlv: string;
  pick: string;
  /** 出荷日（実績）（まだなら —） */
  shipped: string;
  /** 駐車料金（ドライバーの駐車報告の合計。なければ —） */
  park: string;
  leadHelper: string;
  time: string;
  svc: string;
  so: string;
  soHelper: string;
  cp: string;
  child: string;
  kindLabel: string;
  kind: string;
  kindHelper: string;
  qtyTitle: string;
  qty: QtyRow[];
  crs: CrRow[];
  crOpen: boolean;
  crOpenId?: string;
  /** 申請中の変更申請の中身（帯に出す。共通データの変更申請から：受付簿 No.47） */
  crOpenView?: {
    judge: CrJudge; close: string; cur: string; curPick: string; why: string; who: string; at: string;
    /** 希望日（第一・第二…）：お届け日（枠）・ピッキング日・注意（件数・リードタイム） */
    wishes: { label: string; date: string; pick: string; note: string }[];
    /** 同じ拠点・同じお届け日のほかの配送（一緒に動く） */
    also: string;
  };
  points: RoutePoint[];
  hasInvoice: boolean;
  invoices: Invoice[];
  invNote: string;
  /** 運営が送り状番号を入れられるか（路線便＝ヤマトなど。課題 0-2：API は使わない） */
  canTrack?: boolean;
  hasResult: boolean;
  noResultText: string;
  /** 納品実績の中身（共通データの配送・区間・明細・ドライバーの報告から。ないものは出さない：受付簿 No.47） */
  result?: {
    doneAt: string; method: string; staff: string;
    follow: { id: string; st: string; qty: number }[];
    steps: { state: 'ok' | 'ng' | 'warn' | 'na'; label: string; reason: string }[];
    diffs: { n: string; plan: number; got: number; sub: string; why: string }[];
    stock: { n: string; before: number; disp: number; dlv: number; after: number }[];
    legs: { route: string; carrier: string; regime: string; at: string }[];
  };
  trbOpen: boolean;
  trbDone: boolean;
  trbCount: number;
  autoChild?: string;
  trb: Trouble[];
  noTrbTitle: string;
  noTrbText: string;
  isChild: boolean;
  parent?: string;
  canCancel: boolean;
  canDup: boolean;
  canReport: boolean;
  canEdit: boolean;
  canDateChange: boolean;
  dateLimit: string;
  relay: string;
  lead: string;
  hist: HistItem[];
  memos: Memo[];
  /** 配送スタッフ（この配送だけ変更する） */
  carrier2: string;
  staff: string;
  addr: string;
  /** 見本の中身を一覧の行の値で上書きして作ったもの（書き換えたときに保存する） */
  isSample?: boolean;
  sampleId?: string;
  /** トラブルを解決したときの内容（解決の欄） */
  resolved?: { how: string; by: string; next: string; reason: string };
};

/** 詳細の画面に渡すもの。見本の中身を一覧の行の値で上書きしたときは isSample。children＝この配送の子（枝番） */
export type DeliveryDetail = DeliveryRecord & { isSample: boolean; sampleId?: string; children: string[] };

/* ---------- 変更申請 ---------- */

export type CrJudge = '問題なし' | '希望日なし' | '要再確認' | '提案中（法人の返事待ち）';
export type ChangeRequest = {
  id: string;
  rcv: string;
  site: string;
  svc: string;
  temp: string;
  cur: string;
  want: string;
  judge: CrJudge;
  why: string;
  /** 一括承認の初期の選択 */
  on: boolean;
  /** 一括承認のときの承認後の納品日・ピッキング日・補足 */
  after?: string;
  pick?: string;
  note?: string;
  /** 配送データ（見本は DL-261116-0007） */
  dl?: string;
  state: '未処理' | '承認' | '否認' | '提案中';
};

/* ---------- 出荷指示・取込 ---------- */

export type ShipOrder = {
  id: string;
  at: string;
  /** 対象（配送No のときは mono で出す） */
  target: string;
  targetIsDl: boolean;
  sub: string;
  wh: string;
  count: string;
  ver: string;
  kind: string;
  st: '再送待ち' | '送信済' | '送信失敗';
  err?: string;
  /** 送信済みの CSV（出力するときの見本） */
  csv?: string;
};
export type EsInvoice = { no: string; box: string; made: string; st: string; tone: Tone; cls: string };
export type ImportLog = { id: string; at: string; file: string; kind: string; lines: number; ok: number; ng: number; st: string; tone: Tone; sub: string; errCsv?: boolean };

/* ---------- 配送サイクル設定 ---------- */

export type Holiday = { id: string; n: string; d: string; s: boolean; v: boolean };
export type Pause = { id: string; name: string; start: string; end: string; ship: boolean };
export type NgDate = { id: string; d: string; why: string };
/** 設定状況の帯の1か月。cycle：locked＝確定済み（編集不可）／set＝設定済み（編集可）／hole＝未設定（穴）／future＝未設定（今後） */
export type CycleBandMonth = { ym: string; cycle: 'locked' | 'set' | 'hole' | 'future'; reason: string; menu: '運用中' | '公開済' | '公開準備中' | '未公開' };
export type CycleBand = {
  months: CycleBandMonth[];
  /** 設定済みの最終月・今日から数えた残りヶ月・確定済みの最後の月・変更できる最初の月 */
  lastSet: string; remain: number; lockedTo: string; editableFrom: string;
  /** 未設定（穴）の月 */
  holes: string[];
};
export type CycleSettings = {
  periodFrom: string;
  periodTo: string;
  a1: string;
  /** 参照のみの月（当月・メニュー公開済み・オーダー期間が始まった月・配送データを作った月。A1 を変えられない・課題 4-10・2026/10/03） */
  readOnly: string[];
  /** 参照のみの月の理由（サイクル月 → 理由） */
  lockReasons?: Record<string, string>;
  /** 設定状況の帯（配送_02 §4-2：運用開始月〜設定の最終月＋6ヶ月） */
  band?: CycleBand;
  /** サイクル月ごとの A1（'YYYY-MM-DD'）。参照のみでない月だけ変えられる */
  a1s?: Record<string, string>;
  holidays: Holiday[];
  pauses: Pause[];
  /** 倉庫ごとの出荷不可枠（wh1＝関東倉庫・wh2＝関西倉庫） */
  ngSlots: Record<string, string[]>;
  ngDates: Record<string, NgDate[]>;
};

/* ---------- 配送問い合わせ・資材の集計 ---------- */

/** cars＝保有車両（委託配送会社のプロフィール） */
export type Consignee = { id: string; name: string; kind: string; area: string; days: string; fee: string; status: string; cars: string[] };
export type Hub = { id: string; name: string; kind: string; addr: string; status: string };
export type Inquiry = { hu: string; site: string; name: string; addr: string; method: string; c2: string; dl: string; date: string; st: string; inv: string[]; pic: string };
export type Material = { id: string; name: string };
export type MatShipment = { dl: string; site: string; kind: string; date: string; deliv: string; lines: [Material, number][]; fee: string };
