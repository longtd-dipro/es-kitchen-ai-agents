/*
 * 契約申請管理（11_運営_申請受付.html）の型。
 *   新規契約タブ＝申込（受付）：IntakeRow（一覧の1行）＋ 受付画面の見本（IntakeCfg）
 *   契約変更・休止・解約タブ＝変更申請（承認）：ChangeApp（拠点ごとに承認）
 */

import type { FormMaster } from '@/lib/domain/formMaster';
import type { IntakeDraft } from './intake';

/** 申請の種類（契約変更・休止・解約） */
export type ChangeKind = 'プランの変更' | '配送の変更' | '設備の変更' | '拠点情報の変更' | '法人情報の変更' | '休止' | '再開' | '解約';
/** 一覧のタブ */
export type ApTab = 'new' | 'change' | 'stop';

/** 変更される項目の1行：[画面, タブ, 項目, 変更前, 変更後, いつから] */
export type ChangeLine = [string, string, string, string, string, string];
/** 承認すると動くもの：[対象, 件数・内容, いつ] */
export type ImpactLine = [string, string, string];

/** 拠点ごとの承認の結果（'' 承認待ち／ok 承認済み／ng 却下／wd 取り下げ済み） */
export type BranchResult = { st: '' | 'ok' | 'ng' | 'wd'; why: string; by: string; late?: string };

/** 休止の通算：過去の休止 [サイクル, 月数]・今回の月数・再開予定月 */
export type PauseData = { hist: [string, number][]; cur: number; resume: string };

/** 申請の中の1拠点（法人情報の変更は法人1件） */
export type ChangeBranch = {
  /** 冷蔵庫→自販機の切替（プランの変更で ESライト（自販機）へ）。現場調査の結果が要る・開始月は運営が決める（受付簿 No.27） */
  toVm?: boolean;
  /** 冷蔵庫→自販機の開始月の選択肢（締切に間に合う月から4つ。YYYY-MM） */
  vmStarts?: string[];
  /** 移行割 DC000021 の対象（プランの変更・ライト→スタンダード）。承認のダイアログにあらかじめチェックした欄を出す（受付簿 No.16） */
  migrate?: boolean;
  name: string;
  ids: string;
  head: string;
  amount?: string;
  amtCls?: string;
  changes: ChangeLine[];
  total?: [string, string, string];
  impacts: ImpactLine[];
  warn?: string[];
  /** 設備が自販機の拠点（配送方法は ES配送便に固定） */
  vm?: boolean;
  ship?: string;
  carrier?: string;
  pause?: PauseData;
  /** 代理入力の解約：最後のサイクル月（年×12＋月） */
  cxlLast?: number;
  /**
   * 請求済みの月にかかる差額（調整明細・TL-7 A）。承認の前は試算（共通データの apply.billedPreview）、承認のあとは作った調整明細。
   * done＝承認済み、err＝試算できなかった理由（承認するとエラーになる）
   */
  billed?: {
    total: string; rows: [string, string, string, string, string][]; done?: boolean; ids?: string[]; err?: string;
    /** 確定（未発行）のため変えない月（承認の前の試算） */
    locked?: string[];
    /** 承認のあとの反映待ち（lib/domain/locked.ts。確定解除してから反映） */
    skips?: { id: string; cycleMonth: string; billStatus: string; canApply: boolean; status: string }[];
  };
  /** 承認の結果 */
  res: BranchResult;
  /** 承認の前にする設定の入力値 */
  set: Record<string, string | boolean>;
};

/** 承認ダイアログで入れる欄（申請ごと） */
export type ApproveField = { key: string; label?: string; opts?: string[]; text?: string; hint?: string; check?: string };

/** 変更申請（法人Web・代理入力） */
export type ChangeApp = {
  id: string;
  no: string;
  kind: ChangeKind;
  cls: string;
  date: string;
  applicant: string;
  company: string;
  companyId: string;
  /** オーダー締切（yyyy/mm/dd。法人情報の変更は —） */
  close: string;
  start: string;
  request: [string, string][];
  branches: ChangeBranch[];
  approveFields?: ApproveField[];
  memo?: string[];
  /** 処理済み（履歴として見るだけ） */
  done?: boolean;
  /** 運営の代理入力 */
  proxy?: boolean;
  /** 受付経路（検索の値。AP_ROUTES のどれか） */
  channel?: string;
  /** 開始サイクル月（yyyy-mm。検索用。法人情報の変更は空） */
  startYm?: string;
  /** 一覧で同じ申請日のときの並び（代理入力は先頭へ） */
  seq?: number;
  /** ES営業担当（法人の担当。共通データから） */
  es?: string;
};

export type IntakeStatus = '受付中' | '契約設定中' | '完了' | '却下' | '取り下げ済';

/** 新規契約タブの行（申込） */
export type IntakeRow = {
  id: string;
  no: string;
  kubun: '本導入' | 'お試し' | '切替';
  company: string;
  branch: string;
  plan: string;
  course: string;
  eq: string;
  ship: string;
  cnt: string;
  acct: string;
  es: string;
  st: IntakeStatus;
  date: string;
  /** 受付画面の見本（0＝新規・1＝お試し・2＝切替。-1＝開かない） */
  go: number;
  /** 代理入力の受付経路 */
  route?: string;
  /** 受付経路（検索の値。AP_ROUTES のどれか） */
  channel?: string;
  /** 開始サイクル月（yyyy-mm。検索用） */
  startYm?: string;
  /** 却下した人・日時／取り下げ日時 */
  by?: string;
  reason?: string;
  memo?: string;
  /** 登録したばかり（一覧の先頭に出す） */
  fresh?: boolean;
};

/* ---------------- 受付画面（新規・お試し・切替）の見本 ----------------
   元の CFG（画面ごとの定義）。中身の多くは見本の HTML 文字列なので、型はゆるく持つ */

/** 表のセル（文字列・HTML か {t, c}） */
export type Cell = string | number | { t: string; c?: string } | null;
export type TableRow = Cell[] | { cls?: string; cells: Cell[]; fee?: FeeLine[]; name?: string };
export type FieldDef = {
  key: string;
  label: string;
  type: 'ro' | 'sel' | 'text' | 'date' | 'ta' | 'wd';
  value?: string;
  req?: boolean;
  lock?: boolean;
  opts?: (string | { v: string; t: string })[];
  blank?: string;
  hint?: string;
  err?: string;
  ph?: string;
  wide?: boolean;
  dep?: string;
  when?: string;
  dis?: boolean;
};
export type SwDef = { key: string; n: string; d?: string; p?: string; on?: boolean; lab?: string };
export type Block =
  | { b: 'h'; text: string }
  | { b: 'note'; tone?: string; html: string }
  | { b: 'html'; html: string }
  | { b: 'kv'; title?: string; items: [string, string][] }
  | { b: 'table'; title?: string; head: (string | { t: string; c?: string })[]; rows: TableRow[]; note?: string; edit?: boolean; _eid?: string }
  | { b: 'routes' }
  | { b: 'tot'; label: string; value: string; unit?: string; cls?: string }
  | { b: 'fields'; items: FieldDef[] }
  | { b: 'sw'; items: SwDef[] }
  | { b: 'files'; title?: string; rows: string[][]; add?: boolean };
export type TabDef = { key: string; label: string; req: boolean; optLabel?: string; sub?: string; blocks: Block[]; auto?: boolean };
export type TargetDef = {
  no: string;
  name: string;
  sub?: string;
  open?: boolean;
  active?: boolean;
  planStd?: number | { c: number; f?: number };
  applyLabel?: string;
  applyDate?: string;
  line?: string[];
  badges?: { t: string; c: string }[];
  confirmNote?: string;
  confirmRows?: (string[])[];
  sections?: { title: string; kv: [string, string][] }[];
  tabs: TabDef[];
  /** 配送ルートの既定（申込から） */
  _rdef?: string[][];
  /** 共通データの本登録の状態（受付画面の「この拠点を本登録」の元。サーバーが申込の中身から入れる） */
  reg?: { stage: '' | '仮登録' | '本登録' | '取消'; done: boolean; missing: string[]; ready: boolean; branchId: string; contractId: string };
};
export type IntakeCfg = {
  /** 受付の機種・オプション・値引き・標準の配送回数の元（共通データのマスタ。サーバーが入れる）。logistics＝配送ルートの選択肢（倉庫・中継・運び手） */
  master?: FormMaster & { logistics?: Logistics };
  /** 運営が保存した受付の入力（詳細情報設定の保存・配送の設定。再読込しても残る） */
  draft?: IntakeDraft;
  /** 完了した申込（詳細情報設定は参照のみ） */
  done?: boolean;
  mode: string;
  code: string;
  routeCarry?: boolean;
  badge: { text: string; cls: string };
  apNo: string;
  apDate: string;
  companyName: string;
  opUser: string;
  acctBtnLabel?: string;
  acctIssued?: boolean;
  saveStamp: string;
  confirmBtn?: string;
  mainHeading: string;
  mainBtn: string;
  preBlocks?: Block[];
  /** 受付中の申込の、開始サイクル月のオーダー締切（yyyy/mm/dd）。開始スケジュールのタブに『締切まであと○日』を出す（台帳 運営A 2026-10-07 Q19） */
  orderClose?: string;
  /**
   * 締切後の開始月の扱い（申込フォーム §10-5・台帳 B）。受付中でオーダー締切を過ぎた申込だけ運営が2択から選ぶ（既定＝繰り下げ）。
   * shift＝繰り下げたときの開始サイクル月（yyyy-mm）、start＝希望の開始サイクル月、close＝その月のオーダー締切
   */
  late?: { value: '繰り下げ' | '代理'; choose: boolean; close: string; shift: string; start: string };
  orderMode?: 'main' | 'trial';
  trialTimeline?: string;
  summary?: { l: string; v: string }[];
  side: {
    contacts: { name: string; kana?: string; at: string; appl?: boolean; same?: boolean; mail: string; tel: string; role: string }[];
    company: { existing?: boolean; none?: boolean; rows: [string, string][] };
    billing?: [string, string][];
    extra?: { title: string; rows: [string, string][] };
  };
  targets: TargetDef[];
  modalB: {
    title: string;
    desc?: string;
    notes?: string[];
    noteTone?: string;
    countsTitle?: string;
    counts?: { l: string; v: string; u?: string; cls?: string }[];
    extra?: Block[];
    check?: { fixed?: boolean; acct?: number; label: string; hint?: string; note?: string; secttl?: string; to?: string[][]; toNote?: string; on?: boolean };
    confirm?: { label: string; err?: string };
    btn: string;
    btnCls?: string;
  };
  modalC: {
    title: string;
    desc?: string;
    btn?: string;
    rows?: string[][];
    acctRow?: { name: string; yes: string; no: string; id: string };
    corp?: { name: string; id: string; st?: string };
    corpAcct?: { id: string; to?: string; existing?: boolean };
    branches?: { no: string; name: string; id: string; cpKind: string; cp: string; cyc: string; ch: string; acct: string; acctTo?: string }[];
    after?: string;
  };
  confirm: { title: string; desc?: string; btn?: string; btnCls?: string };
  modalF: { title: string; desc?: string; rows: string[][]; after?: string };
};

/** 配送ルートの選択肢（共通データの 倉庫・中継・運び手。kind＝運び手の種類） */
export type Logistics = {
  warehouses: { id: string; name: string }[];
  hubs: { id: string; name: string }[];
  carriers: { id: string; name: string; kind: string }[];
};

/** 異動の表で足した行の料金（①の表に立つ） */
export type FeeLine = { n: string; t: string; a?: number; s: string; d?: Discount };
export type Discount = { id: string; n: string; g: string; c: 'fixed' | 'rate'; v: number; cap?: number; l: string };

/** 一覧の検索条件 */
export type ListFilter = {
  tab: ApTab;
  q: string;
  /** 並べ替えの項目（一覧の列：新規＝no・kubun・company・plan・course・eq・ship・cnt・acct・es・st・date／変更＝no・kind・company・head・start・dl・es・st・date） */
  sort: string;
  /** 並びの向き（なければ 申請ID＝昇順・それ以外＝降順） */
  dir?: 'asc' | 'desc';
  kubun?: string;
  plan?: string;
  course?: string;
  eq?: string;
  es?: string;
  st?: string;
  kind?: string;
  br?: string;
  st2?: string;
  route?: string;
  /** 申請日の範囲（yyyy-mm-dd。片方だけでもよい）・法人（法人名）・開始サイクル月（yyyy-mm）。台帳 運営A Q5 */
  from?: string;
  to?: string;
  corp?: string;
  start?: string;
  /** 契約変更・休止・解約タブ：オーダー締切を過ぎたものだけ（'1'） */
  over?: string;
};
