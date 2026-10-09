/*
 * 領域 corp-sites（法人Web の拠点管理・契約の申請・法人情報）の型。
 * 元：02_デモ/部品/22_法人_拠点管理.html（20_法人_まとめ.html の iframe fcb）の App・List・Detail・Kid・Req・Corp。
 *
 * データは共通データ（lib/domain・dm.*）から lib/corp/sites/fromDomain.ts で作る（SiteSeed・CorpSeed は画面の値の形の名前として残す）。
 * 共通データにまだない値：corp-sites.app（1ヶ月上限金額）・corp-sites.kover（月ごとのご契約の配送備考）・sites/seed.ts（納品不可曜日・資料など）。
 */

/** ご担当者の1行：[区分, 担当者名, フリガナ, メールアドレス, 電話番号] */
export type StaffRow = [string, string, string, string, string];

export type SiteBill = { unit: string; pay: string; debit: string; lead: string; cycle: string; start: string; due: string };
export type SiteCt = {
  no: string; kind: string; status: string; startCyc: string; startOn: string; orig: string; origYm: string; dur: string; endOn: string;
  trial: string; switch: string; plan: string; course: string; dlv: string; times: string; amt: string; term: string; next: string;
};
export type SiteBand = { kind: string; from: string; to: string; n: string; resume: string; reason: string; eq: string; at: number };
/** 月ごとのご契約（一覧の1行） */
/** subsidy＝価格補助（企業負担額）の参照だけの表示（台帳 E 2026-10-05「画像の拡大・価格補助（参照だけ）」・受付簿 No.57）。プランの企業負担額（税込・1食）と月の企業負担分（税抜） */
export type Kid = { cyc: string; id: string; plan: string; dlv: string; n: string; billFor: string; amt: string; pre: string; post: string; subsidy?: { perMeal: string; monthly: string; meals: number; ratePct: number } };
export type KidInfo = { ng: string[]; shift: string; memo: string; dno: string; wish: string; wishFridge: string; wishOther: string; free: string };
/** src＝画像の URL（あれば画面にサムネイルを出し、押すと拡大する：受付簿 No.56。見本の資料にはまだない） */
export type SiteFile = { name: string; meta: string; ph?: string; ro?: number; missing?: number; src?: string };
export type TrialInfo = { from: string; to: string; first: string; ext: string[][]; decide: string };
/** 申込フォーム（変更のお申し込み）で使う値（部品21 の MYBRANCH） */
export type SiteApply = {
  term: string;
  /** 休止の予定が承認済みなどで選べない手続き */
  block?: string[];
  blockWhy?: string;
  /** 過去の休止の月数の合計 */
  susUsed?: number;
  cur: { ship: string; dcount: string; ng: string };
  /** 設備に自販機がある（配送方法は ES配送便に固定） */
  vend?: boolean;
  /** プランの標準の配送回数 */
  dstd: number;
  /** 配送回数追加の1回の月額（税抜・オプションマスタ OP000001。2026/10/03：画面に直書きしない） */
  dlvFee: number;
  /** 休止前の内容（再開） */
  prev?: Record<string, string>;
};

/** 拠点の、法人Web の表示用の値（共通データから作る） */
export type SiteSeed = {
  id: string;
  order: number;
  /** アプリの利用設定（月ごとのご契約に記録する値。運営Web の見本は CU00643 の値のままのため、ここに持つ） */
  day: string;
  month: string;
  guest: string;
  qr: string;
  qrHist?: string;
  bill: SiteBill;
  ct: SiteCt;
  band: SiteBand | null;
  kids: Kid[];
  /** 貸出一覧：貸出ID・設備区分・機種・個体番号・貸出数・返却済数・未返却数・貸出日・返却予定日・返却日・貸出ステータス・回収理由・満了日・違約金の判定・備考・最終更新 */
  loans: (string | number)[][];
  /** 子契約ID（適用ID は持たない：2026/10/03）・区分・コード・請求書表示名・連動タイプ・持ち主・数量・金額・適用開始月・適用終了月・ステータス・根拠・最終更新 */
  opts: string[][];
  /** 請求書番号・発行日・ご請求月・固定額・前払いの対象・精算・精算の対象・消費税・請求金額・入金期限・ステータス */
  inv: string[][];
  files: SiteFile[];
  /** 申請の履歴：受付番号・申請の種類・申請日・申請者・開始ご利用月・申請内容・承認状態・却下理由・取り下げ日時 */
  aps: string[][];
  kidInfo: KidInfo;
  trialInfo?: TrialInfo;
  apply: SiteApply;
};

/** 法人情報の値の形（請求の条件 bill を使う） */
export type CorpSeed = {
  id: string;
  name: string; cname: string; kana: string; bname: string; status: string;
  zip: string; pref: string; city: string; a1: string; a2: string; tel: string; fax: string;
  staff: StaffRow[];
  bill: { lead: string; unit: string; pay: string; debit: string; cycle: string; start: string; due: string; now: string; split: string; to: string };
  inv: string[][];
};

/** 画面に渡すアカウント（ログイン中） */
export type Acct = { corpId: string; branchId?: string; role: 'admin' | 'branch' | 'trial' };

/** 変更の1項目（承認待ちの表示・保存の確認） */
export type ChangeItem = { k: string; label: string; from: string; to: string };

/** 承認待ち（拠点情報の変更）・確認中のお申し込み */
export type Pending = { no: string; kind: string; at: string; from: string; what: string; who: string; acct: string; items: ChangeItem[] };

/** 拠点の値（運営Web の値＋法人Web の値） */
export type SiteView = SiteSeed & {
  name: string; kana: string; emp: string; note: string; status: string; created: string;
  zip: string; pref: string; city: string; a1: string; a2: string; tel: string; fax: string;
  billTo: string; staff: StaffRow[]; acct: { login: string; last: string };
  /** 承認待ちの拠点情報の変更 */
  pinfo: Pending | null;
  /** ESキッチンが確認中のお申し込み（拠点情報の変更以外） */
  pend: Pending | null;
};

/** 申請の一覧の1行 */
export type ReqRow = {
  /** 受付番号・申請の種類・申請日・申請者・開始ご利用月・申請内容・承認状態・却下理由・取り下げ日時 */
  r: string[];
  st: string;
  site: { id: string; name: string; corp?: boolean };
  /** 申請したアカウント（取り下げの可否） */
  acct: string;
  /** 拠点情報の変更（取り下げると承認待ちが消える） */
  info?: boolean;
};

/** 申請者の候補（ご担当者） */
export type WhoCand = { value: string; name: string; where: string; kind: string; mail: string };
