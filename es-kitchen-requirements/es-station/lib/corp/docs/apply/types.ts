/*
 * 申込フォーム（ログイン前の「新規のお申し込み」・元：21_法人_申込フォーム.html を 22_法人_拠点管理.html に入れたもの）の型。
 * 画面の状態（ApplyState）のうち、送るもの（ApplySubmit）＝ 区分・法人・契約（拠点）・お申し込み者・同意。
 */

/** 区分（main＝本導入／trial＝お試しキャンペーン） */
export type ApplyKind = 'main' | 'trial';
/** 設備タイプ（rf＝冷蔵庫・冷凍庫／vm＝自動販売機） */
export type DevType = 'rf' | 'vm';

/** ご担当者（法人・拠点の担当者テーブルの1行） */
export type Staff = { kind: string; name?: string; kana?: string; mail?: string; tel?: string };

/** 添付ファイル（名前と大きさだけ。アップロードはまだつないでいない） */
export type ApplyFile = { n: string; s: string };

/** 法人情報（ステップ2） */
export type ApplyCorp = {
  name?: string; kana?: string; billname?: string;
  zip?: string; pref?: string; city?: string; addr1?: string; addr2?: string; tel?: string; fax?: string;
  pay?: string; cycle?: string; lead?: string;
  _st?: Staff[];
};

/** 契約（希望プラン・納品先）1件 */
export type ApplyBranch = {
  /** 画面で開いているか */
  _o?: boolean;
  dev: DevType;
  meals: string;
  course: string;
  ship?: string;
  dcount?: string;
  start?: string;
  floor?: string;
  note?: string;
  name?: string; kana?: string;
  zip?: string; pref?: string; city?: string; addr1?: string; addr2?: string; tel?: string; fax?: string;
  emp?: string;
  bill: string;
  pay?: string;
  cycle?: string;
  ngmove?: string;
  /** 基準数のパターン（通常／短消費期限なし。REQ-CT-300：申込で選ぶ。あとから変えられるのは運営だけ）。省く＝通常 */
  pattern?: string;
  /** 追加でご希望の設備の台数（機種キー → 台数） */
  _eq: Record<string, number>;
  /** その他オプション（オプションID → 選んだか） */
  _so: Record<string, boolean>;
  /** プランに含まれる設備のサイズの入れ替え（区分 → 機種キー） */
  _incl?: Record<string, string>;
  /** 納品不可曜日 */
  _ng: Record<string, boolean | number>;
  _files: ApplyFile[];
  /** 法人の担当者情報と同じ */
  _same?: boolean;
  _st?: Staff[];
};

/** 送るもの（submitApply の引数） */
export type ApplySubmit = {
  kind: ApplyKind;
  corp: ApplyCorp;
  branches: ApplyBranch[];
  /** お申し込み者（ご担当者のメールアドレス） */
  who: string;
  agree: boolean;
};

/** 画面の状態 */
export type ApplyState = ApplySubmit & {
  step: 1 | 2 | 3;
  sent: boolean;
  /** 受付番号（登録したあと） */
  no?: string;
};

/** 入力欄の定義（元の field() の引数） */
export type FieldDef = {
  id: string;
  key: string;
  label: string;
  req?: boolean;
  type: 'text' | 'sel' | 'ro' | 'ta' | 'month' | 'zip';
  /** 形式チェック（zip／tel／mail） */
  vt?: 'zip' | 'tel' | 'mail';
  ph?: string | null;
  opts?: (string | { v: string; t: string; ok?: boolean })[];
  /** 補足（HTML。？を押すか欄に入ると出る） */
  hint?: string;
  err?: string;
  wide?: boolean;
  value?: string;
  /** 郵便番号の住所検索の対象（欄 ID の頭） */
  scope?: string;
  /** 変えたら描き直す（元の onch：プラン・請求書） */
  onch?: boolean;
};

/** 見積（契約1件） */
export type QuoteLine = { l: string; v: number | null; once?: boolean };
export type Quote = {
  plan: number;
  planName: string;
  opt: number;
  byQuote: boolean;
  lines: QuoteLine[];
  incl: { l: string; v: number; code: string; up: boolean; base?: string }[];
  total: number;
};
/** 見積（申込全体） */
export type QuoteAll = { sum: number; n: number; nq: number; discount: number; discTo: '' | 'corp' | 'first'; corpSum: number; corpN: number; net: number };

/** 入力チェックの結果：欄 ID → 文言。担当者は scope（'c'・'b0'…）→ 文言（全角スペースでつなぐ）と、だめな行 */
export type FormErrors = {
  fields: Record<string, string>;
  staff: Record<string, { msg: string; rows: number[] }>;
};
