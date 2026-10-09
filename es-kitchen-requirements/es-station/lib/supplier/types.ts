/** 発注の種類。区分は商品ごと（決定 Q6） */
export type OrderType = '通常' | '短消費期限' | '資材';
/** 仕入先の回答の状態 */
export type Answer = '納期回答待ち' | '納期回答済' | '出荷済' | '受注不可' | 'キャンセル';
export type PartStatus = '未出荷' | '出荷済';

/** 入荷希望の明細（Slot ごと） */
export type OrderRow = { slot: string; deliver: string; wish: string; qty: number };

/** 出荷の回（分納なら複数）。日付はすべて YYYY/MM/DD */
export type Part = {
  eta: string;
  qty: number;
  st: PartStatus;
  dlv?: string;
  box?: number | '';
  ship?: string;
  carrier?: string;
  method?: string;
  slip?: string;
  bb?: string;
  note?: string;
};

export type Order = {
  sup: string;
  no: string;
  type: OrderType;
  pid: string;
  name: string;
  ym: string;
  wh: string;
  period: string;
  kari: number;
  hon: number;
  unit: string;
  ans: Answer;
  orderedAt: string;
  rows: OrderRow[];
  parts: Part[];
  honAck: boolean;
  honAt?: string;
  honAckAt?: string;
  recv: string;
  recvDate: string;
  lot?: number;
  seen: boolean;
  re?: { prev: number } | null;
  add?: string;
  /** メニューにない商品を「商品追加」で足した発注（台帳 I・2026-10-07：一覧に「メニュー外」の印） */
  offMenu?: boolean;
  wishBB?: string;
  split?: boolean;
  comment?: string;
  reject?: { reason: string; comment: string };
  cancel?: { at: string; by: string; reason: string };
  hist?: { at: string; who: string; t: string }[];
  /** 運営が仕入先の回答を代理入力したときのメモ（決定 C3） */
  proxy?: string;
  /** 仕入単価（税抜）の写し。本発注したときの商品マスタの仕入単価（資材は持たない）。発注金額・支払額はこの値（マスタを変えても過去の月は変わらない） */
  unitCostYen?: number;
  /* 最後に出荷した回の写し（一覧・CSV 用。syncOrder が入れる） */
  eta: string;
  ship: string;
  carrier: string;
  slip: string;
  bb: string;
  method: string;
};

export type Contact = { kind: string; name: string; kana: string; mail: string; tel: string };
/** [品番, 商品名, 保管方法, 区分, 入り数, 仕入単価] */
/** 6番目（仕入単価）は運営だけが読む。仕入先サイトへ返す前に落とす（lib/supplier/view.ts） */
export type ProductRow = [string, string, string, string, number, number?];

export type Supplier = {
  id: string;
  name: string;
  kana: string;
  kind: string;
  goods: string;
  status: string;
  zip: string;
  addr: string;
  tel: string;
  pic: string;
  picKana: string;
  mail: string;
  picTel: string;
  since: string;
  rep: string;
  corpNo: string;
  invoice: string;
  factory: string;
  whs: string;
  days: string;
  bizDay: 'はい' | 'いいえ';
  defMethod: string;
  defCarrier: string;
  /** 前回の出荷報告の配送方法・運送会社（REQ-PO-619：次の出荷報告の初期値。なければ defMethod／defCarrier） */
  lastMethod?: string;
  lastCarrier?: string;
  cert: string;
  close: string;
  pay: string;
  bank: { name: string; branch: string; type: string; no: string; holder: string };
  lastLogin: string;
  contacts: Contact[];
  products: ProductRow[];
};

export type Notice = { id: number; cat: string; imp: boolean; title: string; date: string; body: string; files: string[] };
export type Mail = { t: string; to: string; body: string };

/** 受注一覧（2026/10/02 名称変更・REQ-PO-620。旧：発注一覧）のタブ */
export type Tab = '納期回答待ち' | '本発注の承認待ち' | '出荷待ち' | '出荷済' | '受注不可' | 'キャンセル';

/* ===== 運営Web（発注・入荷）からの発注の書き換え。lib/supplier/service.ts の runOps が動かす ===== */
export type HonPart = { eta: string; dlv: string; qty: number; box: number };
export type OpsOp =
  /** 仮発注・追加発注・資材の発注（新しい発注を作る） */
  | { op: 'create'; orders: Order[] }
  /** 仮発注の数量・入荷希望日・希望消費期限を直す。reanswer＝仕入先に再回答を依頼する（納期回答待ちに戻す） */
  | { op: 'reviseKari'; no: string; rows: OrderRow[]; wishBB?: string; reanswer: boolean }
  /** 本発注（rows＝本発注数の明細） */
  | { op: 'issueHon'; items: { no: string; qty: number; rows?: OrderRow[] }[] }
  /** 本発注数を直す（仕入先の承認前だけ） */
  | { op: 'changeHon'; no: string; qty: number; rows?: OrderRow[] }
  | { op: 'cancel'; nos: string[]; reason: string }
  /** 入荷（倉庫の入荷確認・運営の入荷登録） */
  | { op: 'receive'; no: string; date?: string }
  /** 代理入力：納期回答 */
  | { op: 'proxyAnswer'; no: string; eta: string; how: string }
  /** 代理入力：本発注の承認 */
  | { op: 'proxyHon'; no: string; dlv: string; box: number; bb?: string }
  /** 代理入力：出荷報告（発注方法＝外部などの仕入先。次の未出荷の回を出荷済みにする。送り状番号・運送会社は任意） */
  | { op: 'proxyShip'; no: string; ship: string; method?: string; carrier: string; slip: string; bb?: string }
  /* ===== デモだけ：仕入先の操作をまねる ===== */
  | { op: 'simAnswer'; no: string; eta: string }
  | { op: 'simHon'; no: string; parts: HonPart[] }
  | { op: 'simShip'; no: string; ship: string; carrier: string; slip: string; bb: string }
  | { op: 'simReject'; no: string; reason: string; comment: string };
