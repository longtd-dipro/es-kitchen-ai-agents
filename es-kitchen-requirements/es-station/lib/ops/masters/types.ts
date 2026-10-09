/*
 * マスタ（機種・プラン・オプション・値引き・資材）の型。資材は一覧だけこの型（詳細・編集は MaterialScreen・lib/ops/masters/material.ts）。
 * 元のデモ（部品/13_運営_機種プランマスタ.html・14_運営_オプション値引きマスタ.html）は
 * 「項目の定義（ラベル・入力欄・説明）」を HTML に直書きし、一覧の行の data-fill で主な項目だけ差し替えていた。
 * ここでは、項目の定義を spec（spec/*.ts）に、行ごとの値を MasterRec に分けて持つ。
 */

/** マスタの種類（URL の区切りと同じ） */
export type MasterKind = 'devices' | 'plans' | 'options' | 'discounts' | 'materials';

/** 自販機のレイアウト（段 × 列。ダブルは2列ぶん） */
export type VmCell = { t: string; span: number; off: boolean };
export type VmGrid = { cols: number; rows: { h: string; c: VmCell[] }[] };

/** 入力欄の値。テキスト・選択肢は文字、チェック・ラジオは真偽、写真はメインの番号、自販機はレイアウト */
export type V = string | boolean | number | VmGrid;

/**
 * 入力欄の部品。値を持つ部品（in・sel・ta・ck・photos・vmbox）は、出てくる順に値の配列（V[]）の位置と対応する
 */
export type Part =
  | { t: 'in'; ro?: 1; dis?: 1; style?: string; type?: string; ph?: string; num?: 1 /* 金額（右寄せ） */ }
  | { t: 'sel'; o: string[]; dis?: 1; kubun?: 1; style?: string }
  | { t: 'ta'; rows: number; ro?: 1 }
  | { t: 'ck'; type: 'checkbox' | 'radio' }
  | { t: 'txt'; tag?: string; cls?: string; text?: string; html?: string }
  | { t: 'btn'; cls: string; label: string; dis?: 1; dt?: string; de?: string }
  | { t: 'box'; tag: string; cls: string; style?: string | null; kids: Part[] }
  | { t: 'photos' }
  | { t: 'mainphoto' }
  | { t: 'vmbox' }
  | { t: 'html'; html: string };

/** 1つの項目（元の .f） */
export type Field = {
  /** 値のキー（タブ／区分パネル ＋ 項目名） */
  k: string;
  /** 項目名（元の data-name。一覧の行の差し替え（fill）のキー） */
  name?: string | null;
  label: string;
  /** 必須（req＝*）／条件付き（cond＝△） */
  req?: 'req' | 'cond';
  /** 仕様の印（P1・P2新・法人に出さない など）。デモのときだけ出す */
  tags?: [string, string][];
  lx?: string;
  /** 説明（作り手向け）。デモのときだけ出す */
  note?: string;
  /** 項目定義（物理名・型）。デモの「項目定義」をオンにしたときだけ出す */
  meta?: string;
  corp?: string;
  ro?: string;
  /** '1'＝運営も編集しない（読み取り専用） */
  rop?: string;
  na?: string;
  /** '1'＝入力する項目（新規登録で空にする） */
  edit?: string;
  newf?: 1;
  chgf?: 1;
  style?: string;
  ctlCls?: string;
  ctl: Part[];
  /** 見本（spec の元の画面）の値 */
  v: V[];
  /** 一覧の行の差し替え（fill）で入れ替える値の位置 */
  mi?: number;
  /** 1つの欄に複数のドロップダウンがあるとき：ラベル → 値の位置（fill のキーは「項目名/ラベル」） */
  sub?: Record<string, number>;
};

/** 表のセル。文字だけのセルは text、入力欄のセルは p・v */
/** lock＝この行は消せない（子契約が使っている価格の世代）。画面で付ける（保存しない） */
export type Cell = { p?: Part[]; v?: V[]; text?: string; cls?: string; corp?: string; span?: number; th?: 1; dt?: string; style?: string; lock?: 1 };
export type TRow = { c: Cell[]; cls?: string };
export type THead = { text: string; corp?: string; style?: string; cls?: string };

export type Block =
  | { t: 'cols'; fields: Field[] }
  | { t: 'note'; cls: string; html: string; style?: string; id?: string }
  | { t: 'table'; key: string; head: THead[]; rows: TRow[]; tcls?: string; tbodyId?: string }
  | { t: 'pad'; corp?: string | null; html: string }
  | { t: 'ktabs'; o: string[] }
  | { t: 'kpanel'; k: string; blocks: Block[] }
  | { t: 'tbar'; btns: { label: string; cls: string; title: string }[]; tsum: { name: string; label: string; value: string } | null }
  | { t: 'html'; html: string };

export type Card = { title: string; blocks: Block[]; corp?: string; id?: string; hide?: 1 };

/** 詳細・編集の画面 */
export type DetailSpec = {
  crumb: string;
  title: string;
  /** 見本の ID */
  pid: string;
  sum: { label: string; value: string; corp?: string | null }[];
  tabs: { id: string; label: string; corp?: string | null }[];
  panes: { id: string; cards: Card[] }[];
  /** タブの上に常に出すカード（プランマスタのプラン設定） */
  top?: Card[];
};

/** 一覧の画面 */
export type ListSpec = {
  /** 詳細の見出しの名詞（〇〇詳細／〇〇編集／〇〇新規登録） */
  noun: string;
  title: string;
  crumb0: string;
  crumbCur: string;
  /**
   * 検索条件。in＝部分一致の入力、sel＝ドロップダウン（dyn＝選択肢をデータから作る：gen＝価格プランの世代名／model＝標準貸出設備の機種。o は空）、
   * range＝数の範囲（keys_min・keys_max。金額）、date＝日付の範囲（keys_from・keys_to）。hong 2026/10/05 プランマスタ一覧に A〜E を追加
   */
  search: (
    | { t: 'in'; keys: string; ph: string; cls: string }
    | { t: 'sel'; keys: string; label: string; o: string[]; cls: string; dyn?: 'gen' | 'model' | 'cat' | 'wh'; match?: 'has' }
    | { t: 'range'; keys: string; label: string; cls: string; unit?: string }
    | { t: 'date'; keys: string; label: string; cls: string }
  )[];
  cols: { text: string; cls?: string }[];
  /** 列（data-k）ごとのセルのクラス */
  tdcls: Record<string, string>;
  /** 列の並び（data-k。操作の列は除く） */
  keys: string[];
  /** デモの説明（一覧の下） */
  info?: string;
};

export type MasterSpec = { kind: MasterKind; list: ListSpec; detail: DetailSpec };

/** 一覧の行の差し替え（元の data-fill）。項目名 → 値、'@ラベル' → サマリー、'#カード見出し' → 表の行（文字） */
export type Fill = Record<string, string | string[][]>;

/** マスタの1件 */
export type MasterRec = {
  id: string;
  kind: MasterKind;
  /** 一覧の名前（管理用） */
  name: string;
  /** 一覧のセル（data-k → 文字） */
  row: Record<string, string>;
  /** 一覧のバッジの色（data-k → es-badge--success など） */
  badge: Record<string, string>;
  deleted?: boolean;
  /** システム定義（削除できない。A型のオプション） */
  system?: boolean;
  /** 見本の差し替え（元の data-fill） */
  fill?: Fill;
  /** 保存した値（項目キー → 値）。ないキーは fill・spec の見本の値 */
  values?: Record<string, V[]>;
  /** 保存した表（表のキー → 行） */
  tables?: Record<string, TRow[]>;
  /** 使用中の件数（契約・拠点）。1以上は削除できない */
  use: number;
  /** プランの契約中の拠点数（CSV取込の確認に出す） */
  contracts?: number;
  /** プランの価格の世代を使っている子契約の件数（コース → 価格プラン名 → 件数） */
  priceUsed?: Record<string, Record<string, number>>;
  /** 一覧に足した順（新しいものほど大きい） */
  seq?: number;
};

/** 自販機の列の構成（機種マスタが正。月間メニューが読む）。lanes：W＝ダブル・S＝シングル・B＝ベルト → [格納数, 列数] */
export type VmLayout = { id: string; name: string; maker: string; status: string; lanes: Record<'W' | 'S' | 'B', [number, number][]> };
