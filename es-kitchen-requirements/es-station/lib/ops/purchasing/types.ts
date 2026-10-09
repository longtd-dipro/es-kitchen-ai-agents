import type { Order } from '@/lib/supplier/types';

/*
 * 発注・入荷（運営Web）の型。
 * 仕入先への発注そのもの（Order）は仕入先サイトと同じデータ（共通 DB の orders）。
 * 仕入先サイトのアカウントがない仕入先の発注だけ、この領域（purchasing.orders）に同じ形で持つ。
 */

/** 商品（運営Web の商品マスタと同じ ID・名前。pname＝仕入時の商品名・決定 R12） */
export type Prod = {
  id: string; name: string; pname: string; cat: string; sup: string; lot: number; price: number; cost: number;
  keep: string; exp: string; short: boolean;
  /** 消費期限の保証日数 */
  g: number;
  /** 製造後の消費期限（日） */
  life: number;
};
/** 資材（資材マスタと同じ ID）。在庫は共通データの倉庫在庫（dm.stock・stock.materials） */
export type Mat = { id: string; name: string; spec: string; unit: string; course: string; cost: number; lot: number; sup: string };
export type MenuMonth = { st: string; deadline: string; a1: string };
/** 商品注文管理の数：年月 → 品番 → 倉庫 → Slot 番号 → [注文数, 調整数] */
export type Demand = Record<string, Record<string, Record<string, Record<string, [number, number]>>>>;

/** 発注（src＝置き場所。db＝共通 DB（仕入先サイトと同じ）、doc＝この領域） */
export type POrder = Order & { src: 'db' | 'doc' };

export type Bill = '未照合' | '照合済' | '差異あり';
/** 発注ごとの運営だけの情報（請求照合・通知を見たか） */
/** 請求照合を変えた記録（台帳 I・2026-10-08：変えた人・日時・変更前後を残す） */
export type BillLog = { at: string; by: string; from: Bill; to: Bill };
export type OrderMeta = { id: string; bill?: Bill; billLog?: BillLog[]; rejSeen?: boolean; splitSeen?: boolean };

/** 発注前の入力（仮発注していない行の仮発注数・入荷希望日・希望消費期限）。キーは「倉庫|Slot番号」 */
export type Draft = { kari?: number; wish?: string; bb?: string };
/** 商品×メニュー年月の発注の設定（id＝年月|品番） */
export type Plan = { id: string; group: Group; drafts: Record<string, Draft> };
export type Group = '4' | '2' | '1';

/* ===== 営業サンプル ===== */
export type SampleItem = { pid: string; qty: number; how: string };
export type Sample = {
  no: string; base: string; branch: number; split: number; regDate: string; regAt: string; by: string;
  company: string; pic: string; tel: string; zip: string; pref: string; city: string; town: string; bld: string;
  items: SampleItem[]; deliv: string; ship: string; lead: number; note: string; why: string; wh: string; ym: string; week: string;
  status: '受付済' | '締め済' | '締め後追加'; shipOrder: string; memo: string;
  /** 配送ルート（登録のたびに入れる）と送り状番号（出荷後に入れる） */
  routeCarrier: string; routeHub: string; trackingNo: string;
  /** メモ・送り状番号の変更履歴（古いデータは持たない） */
  history?: { at: string; by: string; field: string; before: string; after: string }[];
};
export type WeekClose = { id: string; at: string; by: string };
/** サンプル登録の入力 */
export type SampleForm = {
  company: string; pic: string; tel: string; zip: string; pref: string; city: string; town: string; bld: string; deliv: string; memo: string;
  items: Record<string, { on: boolean; qty: number }>;
  /** 配送ルート：ピッキング倉庫（倉庫の名前）・配送会社・中継先。lead＝リードタイム（日。入力中は文字） */
  wh: string; routeCarrier: string; routeHub: string; lead: string;
};

/* ===== 倉庫在庫（数は共通データ dm.stock。ここは THOMAS の取り込みの記録・在庫戻しの出荷指示と、画面の形） ===== */
export type StockImport = { date: string; file: string; by: string; at: string };
/** THOMAS在庫の取り込みの記録（最後の1回。棚卸しの数そのものは dm.stock.bases） */
export type StockState = { id: 'state'; imp: StockImport };
/** 在庫の記録（画面の形。正は dm.stock.moves：no＝記録の ID、wh＝倉庫の名前） */
export type StockRec = { no: string; date: string; wh: string; pid: string; kind: string; qty: number; reason: string; by: string; at: string };
export type StockRet = { no: string; at: string; date: string; to: string; lines: { wh: string; pid: string; qty: number }[] };
