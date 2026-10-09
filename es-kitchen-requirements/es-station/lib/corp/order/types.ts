/* 法人Web 月次注文（商品注文・資材注文・注文履歴）の型。元：部品/23_法人_月次注文.html */
import type { Frame, LogRow, OrderStatus, Qty, SitePref, Temp } from '@/lib/ops/menu/types';
import type { MenuPdf } from '@/lib/domain/types';

export type { LogRow, Qty };

/** 商品（共通データの商品 dm.master.products ＋ 法人Web の画面だけに出す項目） */
export type ProdX = {
  id: string; name: string; /** 商品名（英語）。法人Web・アプリの表示用の商品名（受付簿 #235・#250）。空のことがある（既存の商品は運営が手で入れる） */ nameEn?: string; cat: string; st: Temp; /** 画面に出す保存方法（商品マスタの「保管方法（表示用）」だけで決める。便の振り分けは st：受付簿 #258） */ keep: Temp; price: number; tags: string[]; exp: string; vm: Frame | null; vmL: string;
  /** ES の賞味期限または消費期限（お届け日から。例 5日・商品マスタ。2026/10/03 回答：法人に見せる） */
  life?: string;
  /** 前月の注文（重みに使う） */
  past: number;
  /** 写真の絵の種 */
  img: number;
  /** 商品マスタで取り込んだメイン画像（あればこちらを出す） */
  src?: string;
  /** 廃棄率・アンケートの見本（食べたい・気になる） */
  waste: number; like: number; cur: number;
  desc: string; alg: string[]; alg2: string[]; maker: string; raw: string; add: string;
  nut: { kcal: number; g: number; pro: string; fat: string; carb: string; salt: string };
  rating: string; reviews: number;
  /** メニューから外れた商品（公開したあとにメニューから外したが、注文にまだ残っている。数は減らす・0にするだけ：受付簿 #266①） */
  gone?: boolean;
};

/** 便（その月の日付つき。date は '11/10(火)'）。key＝共通データの便のキー（温度帯:枠）、meals＝その便の食数 */
export type CDl = { k: string; l: string; slot: string; t: 'chilled' | 'frozen'; n: number; date: string; key?: string; meals?: number };

/** 拠点（共通データの拠点・子契約から作る。lib/corp/order/fromDomain.ts） */
export type CSite = {
  id: string; corp: string; corpName: string; short: string; name: string;
  plan: number; planId: string; course: string; dlvKind: string; kid: string; eq: string; wh: string;
  cap: { chilled: [number, number]; frozen?: [number, number] };
  mult: number; ai: 'ON' | 'OFF';
  dl: CDl[];
  /** オプション・備考 */
  opt?: string; note?: string;
  /** ご契約の最初のサイクル（注文履歴を出す月） */
  start: string;
  paused?: boolean; pauseFrom?: string;
  /** 休止中の説明（共通データの休止の期間・理由・再開の予定） */
  pauseNote?: string;
  trial?: boolean; trialNote?: string;
  /** 選べる商品（共通データの order.forBranch。ないときはメニューの全部） */
  ok?: string[];
  /** 代替品設定の対象の不良商品で、入れられない便（品番 → 便のキー k）と、その説明 */
  blocked?: Record<string, string[]>;
  altNote?: string;
  /** 過去の月の注文の数（注文履歴・納品書） */
  pastQ?: Record<string, Qty>;
};

/**
 * 今の受付のサイクル。closedYm＝締切を過ぎた直近の月間メニューの月（受付中でないとき、商品注文を開いたら移る注文履歴 詳細の月。版 1.1 ⑥・No.56）。
 * 受付中なら undefined
 */
export type Cycle = { ym: string; label: string; from: string; to: string; daysLeft: number; open: boolean; closedYm?: string };

/** 今のサイクルの商品注文（共通データの dm.order.orders） */
export type CurOrder = { no: string; status: OrderStatus | '休止中'; q: Qty; log: LogRow[] };

/** 注文の設定（共通データの dm.order.prefs） */
export type Pref = { cats: string[]; short: boolean; price: number[]; ex: string[] };
export type { SitePref };

/** アンケート（corp-order.surveys） */
export type Survey = { id: string; site: string; ym: string; due: string; N: number };

/** 法人Web で足した変更履歴（注文の設定・アンケート）（corp-order.logs） */
export type ExtraLog = LogRow & { id: string; site: string; ym: string };

/** 資材 */
export type CMat = { id: string; name: string; course: string; unit: string; img: number; /** アップロードした写真（data URL。あれば絵より優先） */ src?: string };

/**
 * 注文履歴（資材注文）の行。ym＝注文したサイクル月、lines＝資材ごとの数（注文履歴 詳細で資材注文No ごとに出す：B-19）、sd＝発送日・slip＝送り状番号（運営が資材注文管理で入れたもの。なければ ''）、
 * dd＝お届け予定日（発送日＋リードタイム。発送日がなければ ''＝「—」・I223）。版 1.1・受付簿 No.154
 */
export type MatHist = { no: string; kind: string; site: string; od: string; sd: string; dd: string; slip: string; what: string; st: string; check?: string; ym: string; lines: { id: string; name: string; qty: number; unit: string }[] };

/** 過去の注文（注文履歴に出す月のステータス・変更履歴）。共通データの dm.order.orders から */
export type Past = { id: string; st: Record<string, string>; log?: Record<string, LogRow[]> };

/** 画面に渡すもの（query view） */
export type OrderView = {
  cycle: Cycle;
  products: ProdX[];
  cats: string[];
  sites: CSite[];
  orders: Record<string, CurOrder>;
  prefs: Record<string, Pref>;
  next: Record<string, boolean>;
  surveys: Record<string, Survey>;
  logs: Record<string, LogRow[]>;
  materials: CMat[];
  /** 資材注文の画面の初めの数（拠点ごと） */
  matInit: Record<string, Record<string, number>>;
  /** 資材注文の状態（このサイクル月に注文があれば 登録済、なければ 未注文：B-15） */
  matStatus: Record<string, string>;
  /** このサイクル月の資材注文（2回目以降の判定） */
  matThisMonth: Record<string, { no: string; at: string }[]>;
  matHist: MatHist[];
  past: Record<string, Past>;
  /** メニューPDF（運営がメニュー編集で載せたファイル。月 → ファイル名・大きさ・載せた日時・種別）。スタンダードの拠点は2つ・ライトの拠点はライト用だけ見せる（lib/domain/menu.ts の pdfsForCourse） */
  menuPdfs: Record<string, MenuPdf[]>;
  /** 資材の追加配送（OP000036）の料金（税抜・オプションマスタ）。注文履歴（資材注文）の注記に出す */
  matExtraYen: number;
  /** 商品タグの選択肢（商品タグのマスタ dm.master.productTags の名前。商品注文の検索条件） */
  tags: string[];
};

/** 画面から渡すログイン中のアカウント */
/** ro＝解約後（参照のみ）。書き込みの操作はサーバーが断る（受付簿 No.157）。corp-docs の ro と同じく画面から渡す */
export type Acc = { corpId: string; branchId?: string; role: 'admin' | 'branch' | 'trial'; ro?: boolean };
