/*
 * 法人Web の 請求書・棚卸報告・売上・ユーザー管理（領域 corp-docs）の型。
 * 元：02_デモ/20_法人_まとめ.html の iframe fcb（＝部品/22_法人_拠点管理.html の Bills・Inv・Stock）と fsl（売上・ユーザー管理）。
 *
 * 法人・拠点・請求書・棚卸報告は共通データ（lib/domain・dm.org／dm.billing／dm.report）を読み、lib/corp/docs/fromDomain.ts でこの形に直して出す。
 * 売上・ユーザーは共通データ（dm.app.purchases・dm.app.users）から作る。
 */

/** ご担当者：[区分, 担当者名, フリガナ, メールアドレス, 電話番号]（拠点管理デモと同じ並び） */
export type Staff = [string, string, string, string, string];

/** 法人（請求書の宛先・送付先・支払方法と、申告した方の候補に要る分だけ）。dm.org.corps・dm.org.contacts から作る */
export type CorpMeta = {
  id: string;
  name: string;
  /** 請求先法人名（請求書の宛先） */
  bname: string;
  /** 請求書の送付先（請求担当者：氏名 ／ メール） */
  billTo: string;
  /** 支払方法 */
  pay: string;
  staff: Staff[];
};

/** 拠点（この区切りで使う分）。dm.org.branches・contracts・childContracts・contacts から作る。並び順は seq */
export type SiteMeta = {
  id: string;
  corpId: string;
  seq: number;
  name: string;
  /** 売上・ユーザー管理の短い名前（本社・大阪支店…） */
  short: string;
  /** 配送の方法（ES配送便・COOL便。休止中は —） */
  dlv: string;
  /** 請求先（法人／この拠点）。親契約の請求先 */
  billTo: '法人' | 'この拠点';
  /** 支払方法（拠点あての請求書） */
  pay: string;
  /** ES-QR を利用しているか（QR コードの出力） */
  esqr: boolean;
  /** 休止中（QR コードの出力に出さない） */
  paused: boolean;
  staff: Staff[];
};

/* ---------------- 請求書 ---------------- */

/** 明細の区分（3つ：台帳 E 2026-10-05 B-24。「前払い」「後払い」は出さない） */
export type InvKind = '固定額' | 'ご利用実績の精算' | '調整';
/** 調整の行の種類（B-24） */
export type AdjKind = '相殺' | '差額' | '繰越' | '再請求';
/** 明細の1行。tx＝税率ごとの対象額（税率を2つに分けて計算する1行は {8:…,10:…}） */
/** mg＝請求書で1行にまとめる行（福利厚生の適用 OFF のプラン料金・InvoiceLine.group）。adj＝調整の種類（kind＝調整 のとき） */
export type CorpInvLine = { site: string; kind: InvKind; n: string; a: number; rate: string; tx: Record<string, number>; qty: string; from?: string; mg?: string; adj?: AdjKind };

/** 法人Web で見る請求書。site＝拠点あての請求書の拠点ID（法人あては null） */
export type CorpInv = {
  id: string;
  corpId: string;
  site: string | null;
  /** 発行日 YYYY/MM/DD */
  issued: string;
  /** ご請求月（表示）2026年10月 */
  mon: string;
  /** 固定額の対象（表示）2026年11月サイクル */
  tgt: string;
  /** ご利用実績の精算の対象（表示）2026/08/21〜09/20（なければ —） */
  actPeriod: string;
  due: string;
  /** 状態：確定（25日に確定・発行前）／請求済み（発行済み）。入金済・未入金は出さない（台帳 E 2026-10-05） */
  st: BillState;
  /** 再請求のバッジ（前の請求書を再請求した請求書＝元の番号／再請求された前の請求書＝再請求した番号） */
  rebillMark?: string;
  lines: CorpInvLine[];
  /** 請求書の金額（税込・dm.billing.invoices の total）。法人の請求書全体を出すときはこの値を使う */
  total?: number;
  tax?: number;
  /** 最終請求書（解約した拠点だけの1通・dm.billing.invoices の final） */
  final?: boolean;
};

/** 法人Web で見る請求書の状態 */
export type BillState = '確定' | '請求済';
/** 請求書の一覧の1行 */
export type BillRow = { no: string; at: string; mon: string; to: string; amt: number; due: string; st: BillState; rebillMark?: string; site: string | null; part: boolean; /** 最終請求書 */ final?: boolean };

/** 区分 × 税率（キー）ごとの対象額（税抜） */
export type BillByKind = { 固定額: Record<string, number>; ご利用実績の精算: Record<string, number> };

/** 請求書詳細（画面に出す値をまとめたもの） */
export type BillDetail = {
  no: string;
  corpInv: boolean;
  /** 拠点の画面から：その拠点の分だけ（法人あての請求書なら内訳（参考）） */
  site: { id: string; name: string } | null;
  toCorp: boolean;
  dest: string;
  sendTo: string;
  pay: string;
  issued: string;
  mon: string;
  due: string;
  tgt: string;
  actPeriod: string;
  st: BillState;
  rebillMark?: string;
  rows: (CorpInvLine & { siteName: string })[];
  rebill: { no: string; amt: number } | null;
  sub: number;
  fixed: number;
  act: number;
  base8: number;
  base10: number;
  t8: number;
  t10: number;
  /** 税率ごとの対象額（税抜）・消費税（小さい率から・2026-10-05 版1.3） */
  rates: { r: number; base: number; tax: number }[];
  /** 区分（固定額・ご利用実績の精算）× 税率ごとの対象額（税抜）。請求金額の表の行 */
  byKind: BillByKind;
  tax: number;
  total: number;
  /** 最終請求書（解約した拠点だけの1通） */
  final?: boolean;
};

/* ---------------- 棚卸報告 ---------------- */

/** 棚卸する人：corp＝企業担当者（法人Web で申告）／driver＝ES配送便ドライバー／none＝棚卸なし */
/** nocheck＝棚卸報告なしの拠点（課題 2-1・運営が拠点に付ける） */
export type StockWay = 'corp' | 'driver' | 'none' | 'nocheck';
/** 拠点ごとの棚卸報告の設定。from＝この月度から対象／pauseFrom＝この月度から休止中。契約・子契約（COOL便だけ＝企業担当者）から作る */
/** pauseCheck＝休止の始めの棚卸報告の月度（休止の前の最後のお届けの月。ES配送便の拠点もお客様が法人Webで報告：台帳 E 2026-10-05） */
export type StockCfg = { id: string; way: StockWay; from?: string; pauseFrom?: string; pauseCheck?: string };
/** 申告（月度ごと）。n は商品の並び（STOCK_PROD）の数（扱っていない商品は 0）。dm.report.stockChecks から作る（id＝拠点ID|月度） */
export type StockRec = { id: string; site: string; m: string; at: string; who: string; acct?: string; n: number[];
  /** 棚卸した商品（この拠点に関係する商品だけ・課題 4-6）・捨てた数・お届け中で届いて数に入れた数（STOCK_IDS の並び） */
  ids?: string[]; d?: number[]; a?: number[];
  /** ESキッチンが確認済み（確認済みの報告は直せない：E326） */
  confirmed?: boolean };
/** 棚卸報告の入力の行（この拠点に関係する商品だけ：前回の棚卸にある・届けた・お届け中・廃棄する。課題 4-6） */
/** expired＝ES の期限を過ぎた見込みの数（廃棄の提案・商品マスタの ES の期限）、expiresOn＝期限内の分のいちばん近い期限の日。added＝「商品を追加」で足した行（前回 0・E327 の対象外） */
export type StockItem = { id: string; name: string; /** 商品名（英語。空のことがある・受付簿 #280） */ nameEn?: string; prev: number; delivered: number; inTransit: number; toDispose: number; expired?: number; expiresOn?: string; added?: boolean };
/** 棚卸報告の下書き（拠点 × 月度） */
export type StockSheetView = { site: string; m: string; items: StockItem[]; transit: { deliveryId: string; deliverOn: string; status: string; lines: { productId: string; qty: number }[] }[] };
/** 月度。close＝お客様の報告期限（20日）・judge＝未報告の判定日（25日）。open＝お客様が報告できる／judged＝判定日を過ぎた */
export type StockMonth = { m: string; label: string; period: string; close: string; due: string; judge: string; prev: string; open?: boolean; judged?: boolean };

/** 報告した方の候補。main＝その拠点のメイン担当者（既定で選ぶ） */
export type WhoCand = { value: string; name: string; where: string; kind: string; mail: string; main?: boolean };
/** 「商品を追加」の候補（ESキッチンの商品マスタで販売中の商品） */
/** jans＝商品の JAN（複数・先頭が主 jan。JAN で引くときはどれでもよい） */
export type StockProduct = { id: string; name: string; nameEn?: string; kana: string; jan: string; jans?: string[]; temp: string };

/* ---------------- 売上・ユーザー管理 ---------------- */

export type BuyStatus = '支払済' | '返金中' | '返金済';
/** 購入（画面の形。共通データ dm.app.purchases から作る） */
export type Buy = { id: string; no: string; uid: string; site: string; item: string; code: string; qty: number; amt: number; pay: string; st: BuyStatus; reason: string; at: string; seq: number;
  /** 購入したユーザーの性別・年代（絞り込み用：台帳 E 2026-10-05） */
  gender: string; age: string };
/** アプリのユーザー（画面の形。共通データ dm.app.users から作る） */
export type AppUser = { id: string; site: string; emp: string; link: '連携中' | '解除済'; limit: 'なし' | '購入不可'; since: string; seq: number; gender: string; age: string };

/** 画面から渡すログイン中のアカウント */
export type Who = { corpId: string; branchId?: string; role: 'admin' | 'branch' | 'trial' };
