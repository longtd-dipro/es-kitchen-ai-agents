/* 請求（運営Web：在庫管理・実績精算・請求の確定・請求書）の型。元は 15_運営_請求.html の S */
import type { InvoiceSend } from '@/lib/domain/types';

/** 税率（0＝繰越の再請求：税込のまま） */
/** 税率（％）。税率マスタのどの率でも（2026-10-05）。0＝税なし（繰越など） */
export type Tax = number;

/** 法人（請求に要る項目だけ） */
export type Co = {
  id: string;
  name: string;
  code: string;
  /** 請求書の発行単位：merged＝まとめて発行（法人1通）／branch＝拠点ごと */
  issue: 'merged' | 'branch';
  /** 請求リードタイム（前払いのサイクル月＝発行月＋lead） */
  lead: number;
  confirmed: boolean;
  /** 入金期限の設定（請求月の27日／請求月の翌月27日） */
  due: string;
  billOne?: string;
  /** 支払方法（口座振替・銀行振込・クレジットカード。請求書一覧の絞り込み・RD-BL-104） */
  pay?: string;
};

/** 契約の費目（前払い）。tim：M＝毎月前払い／Y＝1年一括前払い（anchor＝起算月） */
/** mg＝請求書で1行にまとめる行（福利厚生の適用 OFF のプラン料金：InvoiceLine.group） */
export type FixLine = { id: string; n: string; a: number; t: Tax; tim: 'M' | 'Y'; anchor?: string; modelId?: string; src?: 'plan'; eq?: boolean; mg?: string };

/** 商品ごとの在庫（前回申告・納品・販売・廃棄・承認調整・点検申告）。id は品番（M005）の数字の部分 */
export type StockRow = { id: number; prev: number; deliv: number; sold: number; waste: number; appr: number; real: number };

/** 調整明細（初期費用・スポット費用・調整。単発 once／繰越 every） */
export type AdjLine = {
  n: string; a: number; t: Tax; kind: 'init' | 'spot' | 'adj'; m: string; rep: 'once' | 'every'; to?: string;
  /** 共通データの調整明細（dm.billing.adjustments・申請の承認で自動でできたもの）の ID。運営の ③ 調整としては保存しない・消せない */
  dm?: string;
  /** 共通データの調整明細のうち、③ 調整で金額を直せるもの（解約の設備引揚費。billing.editAdjustment） */
  dmEdit?: boolean;
};

/** 確定した過去の子契約（スナップショット） */
export type MonthSnap = {
  no: string; m: string; tgt: string; actPeriod: string; adv: number; arr: number; adj: number;
  by: string; at: string; inv: string;
  snap: { planId: string; plan: string; prName: string; lines: { n: string; a: number; t: Tax }[] };
};

/** 拠点＝親契約。当月の子契約の状態（fixOK・actOK）もここに持つ */
export type Br = {
  id: string;
  co: string;
  name: string;
  code: string;
  planId: string;
  plan: string;
  fixLines: FixLine[];
  course: 'std' | 'light' | 'vm';
  ship: 'cool' | 'es';
  discIds: string[];
  emp: number;
  kind: 'normal' | 'trial';
  /** 価格調整（なし／値上げ／値下げ／無料提供）と金額 */
  adjMode: 'none' | 'up' | 'down' | 'free';
  adjYen: number;
  /** 棚卸の申告 */
  filed: boolean;
  stockDay: string;
  by: string;
  rows: StockRow[];
  adj: AdjLine[];
  /** ② 前払い（固定額）の確定／① 後払い（実績精算）の確定 */
  fixOK: boolean;
  actOK: boolean;
  /** 実績精算の内訳ごとの確定（loss・cash・adj） */
  actParts?: Partial<Record<'loss' | 'cash' | 'adj', boolean>>;
  billTo: '法人' | 'この拠点';
  qty: number;
  leadOv: number | null;
  /** 現金利用 */
  cash: boolean;
  due: string;
  ct: { no: string; st: 'draft' | 'active' | 'cancelling' | 'stopped' | 'paused' };
  months: MonthSnap[];
  /** アプリの現金支払い（ドライバーの集金）。共通データの配送の報告から */
  cashRows?: CashRow[];
  /** 過去の締め月の在庫（共通データの棚卸から） */
  hist?: Record<string, StockRow[]>;
  /** 実績精算を確定したときの商品の単価の写し（商品の番号 → 税込）。あれば商品の単価（prods）より先に使う */
  prices?: Record<number, number>;
  /** 棚卸なしの拠点（課題 2-1：管理ロス・事務手数料なし・差分率の代わりに「棚卸なし」） */
  noCheck?: boolean;
  /** 最初の棚卸報告の前（この月までに棚卸が1つもない。受付簿 No.134：始まりの数がないので管理ロスを出さない＝実績精算の管理ロスの行を作らない）。この月に申告すれば（filed）管理ロスを出す */
  firstPending?: boolean;
  /** 締め月（実績の月）の子契約がお試し（事務手数料なし。B4） */
  trialAct?: boolean;
  /** 棚卸の申告が25日（事務手数料の判定日）より後。数は実績精算に使い、事務手数料はかかる（台帳 H 2026-10-05。21〜25日の運営の代理入力はかからない） */
  lateFiled?: boolean;
  /** 支払サイクル＝年払い（起算月の前払いで12サイクル分・S3-1）。値は起算月 */
  annual?: string;
  /** 解約した拠点の最後の締め月（この月の請求書が最終請求。備考「最終請求」・2026/10/03） */
  final?: boolean;
  /** 代替品の実績精算の行（差替＝元の商品の単価・補償＝0円。締めの期間にお届けする便。課題 3-11） */
  altRows?: { n: string; a: number; t: Tax; altId: string }[];
  /** 単発のオプションの行（このサイクルの2回目からの資材の注文＝OP000036 資材の追加配送・プランの数量を超えた資材。締めの期間に注文した分） */
  optRows?: { n: string; a: number; t: Tax; src: string }[];
  /** プランマスタの免責金額（税込）・企業負担額（税込・1食）。共通データのプラン（なければ請求の見本の値） */
  ded?: number;
  welfare?: number;
  /**
   * 実績精算を確定しないまま請求書を発行した締め月（REQ-CT-301：未確定の実績精算はその請求書に入れず、確定したら翌月の請求書で精算する）。
   * この月の実績精算を確定すると、後払いの行を翌月の ③ 調整（単発）にする
   */
  actLater?: string;
};

/** アプリの現金支払い（ドライバーが回収） */
export type CashRow = { d: string; no: string; drv: string; plan: number; got: number };

/** 商品（共通データの商品マスタ。id は品番 M005 の数字の部分） */
/** t＝商品の税率（商品マスタの税率。8／10。省くと 8%）。実績精算の行はこの税率（2026/10/03） */
export type Prod = { id: number; n: string; list: number; t?: Tax };

/** 請求書の明細。k：前払い／後払い／調整／繰越 */
export type InvLine = {
  br: string; n: string; a: number; t: Tax; k: '前払い' | '後払い' | '調整' | '繰越'; from?: string; src?: string; kind?: string; m?: string; rep?: string; to?: string;
  /** 年払いの前払いの行：12サイクル目のサイクル月（共通データの InvoiceLine.cycleTo） */
  yTo?: string;
  /** 共通データの調整明細の ID（InvoiceLine.adjId） */
  dm?: string;
  /** 請求書で1行にまとめる行（InvoiceLine.group） */
  mg?: string;
  /** 後払いの行で、販売価格（税込）から出した行のもとの税込の額（a は税抜。保存しない） */
  incl?: number;
};

/** 税の合計。by＝税率ごと（r＝％・t＝税抜の小計・x＝消費税。大きい率から・2026-10-05）。t10・t8・x10・x8 は 10%・8% の写し */
export type TaxSum = { t10: number; t8: number; t0: number; x10: number; x8: number; net: number; tax: number; tot: number; by: { r: number; t: number; x: number }[] };

/** 請求書。status は Bill One の状態（REGISTERED 登録済／DISPATCHED 発行済／CARRIED 繰越済／WITHDRAWN 取消） */
export type Invoice = TaxSum & {
  id: string;
  /** 締め月 */
  m: string;
  co: string;
  br: string | null;
  lines: InvLine[];
  total: number;
  status: 'REGISTERED' | 'DISPATCHED' | 'CARRIED' | 'WITHDRAWN';
  unpaid: boolean;
  unpaidAt?: string;
  rqWd?: boolean;
  carriedTo?: string | null;
  tgt: string;
  due: string;
  dueRule?: string;
  issued?: string;
  sendErr?: string;
  retried?: boolean;
  reissueOf?: string;
  reissuedTo?: string;
  note?: string;
  /** Bill One の送付の状態と記録（共通データの請求書の send。発行したものだけ。課題 0-2：状態だけを動かす） */
  send?: InvoiceSend;
  /** 最終請求書（解約した拠点だけの1通・2026/10/03 決定） */
  final?: boolean;
};

/** 在庫調整（運営が登録。計算在庫に入る） */
export type Adjust = { id: string; at: string; by: string; br: string; prod: number; delta: number; reason: string; seq: number };

export type LogRow = { t: string; who: string; what: string };

export type Meta = {
  month: string;
  cfg: {
    /** 事務手数料（棚卸の未報告・税抜）と税率。読むときはオプションマスタ OP000016 の値（lib/ops/areas/billing.ts の load）。ここの値はマスタがないときだけ */
    penalty: number; penaltyTax?: Tax; wasteTh: number;
    /** デモの見本：Bill One への1回目の送信がエラーになる法人（見本データにだけ入れる。本番の設定には入れない。M4） */
    boFailOnce?: string[];
  };
};

/** 画面と計算で使う、請求の全データ */
export type BillingState = { month: string; cfg: Meta['cfg']; cos: Co[]; brs: Br[]; invoices: Invoice[]; adjs: Adjust[]; prods: Prod[] };
