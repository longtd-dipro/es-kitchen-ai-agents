import type { AltShortage, MonthlyMenu } from '@/lib/domain/types';

/* 運営Web メニュー管理（月間メニュー・商品注文管理・代替品設定・資材注文管理）＋ 商品カテゴリ管理の型 */

/** 保存方法 */
export type Temp = 'chilled' | 'ambient' | 'frozen';
/** 自販機の枠（W＝ダブル／S＝シングル／B＝ベルト） */
export type Frame = 'W' | 'S' | 'B';

/** 商品（商品マスタのうちメニューで使う項目） */
export type Product = {
  id: string; name: string; cat: string; /** 商品カテゴリの ID（受付簿 #233） */ catId?: string; st: Temp; /** 画面に出す保存方法（商品マスタの「保管方法（表示用）」だけで決める。便の振り分け・冷凍の判定は st：受付簿 #258） */ keep: Temp; price: number;
  /** 短消費期限（'' ＝なし） */
  exp: string;
  /** 自販機の枠（null ＝自販機に入らない） */
  vm: Frame | null;
  /** 枠の表示（例：ダブル8・10） */
  vmL: string;
  /** 前月の注文（重みの初期値に使う） */
  past: number;
  /** 写真の絵の種（photo() に渡す） */
  img: number;
  /** ピッキング倉庫（商品マスタ。拠点の便の倉庫がこの中にある商品だけ出す） */
  wh?: string[];
  /** 出せるコース（ライト／スタンダード） */
  courses?: string[];
  /** 自販機の対応機種 */
  vmModels?: string[];
  /** 削除済の商品 */
  off?: boolean;
  /** 管理名（社内の名前。公開名と同じなら空）・仕入先名（運営の注文の画面に出す：受付簿 #245） */
  mgmt?: string; sup?: string;
};

export type Category = { id: string; name: string; order: number; note: string;
  /** 画像。'' ＝なし、'photo:<種>' ＝見本の絵、それ以外は data URL */
  img: string;
  /** 同時更新の検知の版（E31：保存のたびに進める。lib/ops/core/concurrency.ts） */
  ver?: string };

/** 便（子契約の配送ルート設定）。日付は月ごとの A1 から出す */
export type DlSlot = { k: string; l: string; slot: string; t: 'chilled' | 'frozen'; n: number };
export type Dl = DlSlot & { date: string; ship: string };

/** 拠点（子契約の値のスナップショット） */
export type Site = {
  id: string; corp: string; corpName: string; short: string; plan: number; planId: string; course: string; dlvKind: string; eq: string;
  /** 月次提供数の [下限, 上限] */
  cap: { chilled: [number, number]; frozen?: [number, number] };
  mult: number; dl: DlSlot[]; addr: string; wh: string; kid: string;
  /** 便の倉庫（子契約 channel.warehouseId）・置いている自販機（機種ID） */
  whId?: string; vmModels?: string[];
  ai?: 'ON' | 'OFF'; trial?: boolean; ended?: string; paused?: boolean;
};

export type MenuStatus = '編集中' | '公開中' | '締切済' | '配送中' | '終了' | '削除済';
/**
 * 基準注文数（50プランの代表値）。共通データ（dm.order.menus の items[].base）の写し：
 * std＝ライト・スタンダード（lite も同じ値を出す）、ns＝短消費期限なし、vm＝自販機。man＝運営が手で直した値（再計算で上書きしない）、ex ＝対象外
 */
export type Base = { std: number; lite: number; ns?: number; vm?: number; ex?: boolean; man?: { std?: boolean; ns?: boolean; vm?: boolean } };
export type AvgRange = { min: number; max: number };
export type AvgTarget = { fr: AvgRange; vm: AvgRange };

export type Menu = {
  ym: string; id: string; status: MenuStatus; pub: string; from: string; to: string; items: string[]; upd: string;
  base: Record<string, Base>;
  /** 自販機の品数（機種ID → 枠 → 品数）。運営が直した値だけ */
  vmN?: Record<string, Partial<Record<Frame, number>>>;
  /** 平均仕入単価の目標（メニューごと。公開したメニューは公開時の値で固定） */
  avgT?: AvgTarget;
  /** 共通データの月間メニュー（法人向けの公開・自動公開日付・メニューPDF・商品ごとの公開可能・タグ・営業サンプル） */
  dm?: MonthlyMenu;
  /** 平均仕入単価（税抜・50プランの基準注文数の加重平均。lib/domain/menu.ts の avgCostOf） */
  avgCost?: number;
};

export type OrderStatus = '登録済' | 'ES登録済' | 'デフォルト' | 'お試し（自動）' | '取消';
/** 数量：商品ID → 便 → 数 */
export type Qty = Record<string, Record<string, number>>;
/** 変更履歴の1行。item・before・after・why は P-HIST の列（項目・変更前・変更後・理由。法人Web の変更履歴で出す。ないものは detail だけ） */
export type LogRow = { at: string; who: string; what: string; detail: string; item?: string; before?: string; after?: string; why?: string };
export type Extra = { alt: string; kind: string; dl: string; name: string; n: number; bill: string; flow: string };
export type Order = {
  no: string; site: string; ym: string; status: OrderStatus;
  /** 調整率（%）＝調整数 ÷ 食数（小数1桁）。表示だけで入力しない（受付簿 #272） */
  rate: number;
  q: Qty;
  /** 調整数（システム管理が自由に入れる整数。上限＝プランの食数・請求しない・冷凍の便にも足せる：台帳 H・受付簿 #272・#282） */
  a: Qty;
  /** 発注締め日（便が前半＝A・B週は B7、後半＝C・D週は D7）を過ぎた便（運営は直せない。キー＝便 k：台帳 H・受付簿 #270） */
  shut: Record<string, boolean>;
  /** そのサイクルの発注締め日（前半の便・後半の便） */
  closeOn: { front: string; back: string };
  extra: Extra[]; log: LogRow[]; upd: string;
  /** 同時更新の検知の版（E31）：注文の更新・変更履歴・配送の出荷指示（版・状態）。ほかの人の保存や出荷指示の拾い上げで変わる */
  ver: string;
};

export type DlvState = '出荷待' | '出荷指示済' | '出荷済' | '納品済' | '取消';
/** 資材注文（1件＝1つの資材便の配送データ） */
export type MatOrder = {
  no: string; site: string; kind: '通常注文' | '初期セット'; at: string; by: string; due: string; st: DlvState;
  q: Record<string, number>; sent: string; inv: string; dlId: string; memo: string;
  /** 運営が資材注文管理で入れる 発送日（YYYY-MM-DD）・送り状番号（受付簿 No.154）。未入力なら '' */
  shippedOn?: string; trackingNo?: string;
  /** リードタイム（契約の配送区分（資材）の値。なければ2日）・「何回目」（納品予定日のサイクル月で数える。初期セット・取消は 0）・お試しの拠点か・追加配送料（OP000036・税抜）・同時更新の版（E31） */
  lead?: number; nth?: number; trial?: boolean; fee?: number; ver?: string;
  /** 変更履歴 [日時, 内容, 変更者]（新しい順） */
  log?: [string, string, string][];
};
/** 資材マスタ（コース名＝その資材を使うコース） */
/** 資材（資材マスタ）。img＝見本の絵の種、src＝アップロードした写真（data URL。あれば絵より優先） */
export type Material = { id: string; name: string; course: string; unit: string; spec: string; img: number; src?: string };

/** 拠点の設定（法人Webの「注文の設定」と同じ） */
export type SitePref = { cats: string[] | null; short: boolean; price: number[]; ex: string[]; next?: boolean; upd: string };

/** 代替品設定の入力 */
export type AltCond = { def: string; alt: string; found: string; from: string; to: string; scope: 'all' | 'lot'; lot: string; reason: string };
export type AltMethod = { comp: 'order' | 'stock'; when: 'next' | 'date' | 'extra'; whenDate: string; swap: 'swap' | 'exclude'; lotAct: 'return' | 'dispose' };
export type RowWhen = 'auto' | 'next' | 'next2' | 'extra';
/** createPo＝不足分の追加発注を作る（既定 true） */
export type AltInput = { cond: AltCond; m: AltMethod; off: Record<string, boolean>; rowWhen: Record<string, RowWhen>; createPo?: boolean };
export type AltRec = { id: string; cond: AltCond; m: AltMethod };
/** 保存の結果（共通データの代替品設定 dm.order.alts の結果。shortage＝在庫の見込み、pos＝追加発注の番号） */
export type AltDone = { id: string; msg: string; flow: [string, string][]; shortage?: AltShortage[]; pos?: string[]; warnings?: string[] };

/** 機種マスタの「列の構成」（自販機）：枠 → [格納数, 列数][] */
export type VmLayout = { id: string; name: string; maker: string; status: string; lanes: Partial<Record<Frame, [number, number][]>> };
export type Machine = { id: string; name: string; lanes: Partial<Record<Frame, [number, number][]>> };

/** 画面の計算に使う固定のデータ（商品・拠点・資材マスタ・サイクル・設定） */
export type Master = {
  products: Product[]; sites: Site[]; materials: Material[];
  /** 各サイクルの A1（月曜） */
  a1: Record<string, string>;
  /** 自販機の列の構成（正は 機種マスタ） */
  vmLayout: VmLayout[];
};
