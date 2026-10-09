/* レビュー・ご意見（運営Web：閲覧・検索・CSV出力だけ）の型 */

/** 拠点 */
export type Branch = { id: string; name: string };
/** 法人（拠点を持つ） */
export type Company = { id: string; name: string; branches: Branch[] };

/** 投稿したユーザー。id＝ユーザーID（U＋8桁・dm.app.users）。nick が '' ＝ニックネーム未設定（「匿名ユーザー」と表示） */
export type ReviewUser = { id: string; nick: string; left: boolean; coId: string; brId: string };

/** 評価した商品（★1〜5 と評価タグ） */
export type ReviewItem = { pid: string; name: string; star: number; tags: string[] };

/**
 * 1回の投稿。dt は 'YYYY/MM/DD HH:mm'。comment が '' ＝コメントなし。
 * id は共通データの内部のキー。画面・CSV・URL には出さず、注文番号（order＝OD＋7桁。1回の注文に1回の投稿）で特定する（hong 2026-10-05：レビューIDは持たない）
 */
export type Review = { id: string; dt: string; uid: string; order: string; comment: string; items: ReviewItem[] };

/** 画面に出す1件（ユーザー・法人・拠点の名前と、最低評価を付けたもの） */
export type ReviewRow = Review & {
  user: { uid: string; nick: string; left: boolean };
  co: Branch;
  br: Branch;
  /** 最低評価（★の一番低い値） */
  min: number;
};

/** 並べ替えの項目＝一覧の全列（hong 2026-10-05）：注文番号・投稿日時・投稿者（ニックネーム）・法人・拠点・品数・最低評価・コメント */
export type SortCol = 'order' | 'dt' | 'nick' | 'co' | 'br' | 'n' | 'min' | 'comment';
/** 並べ替え：項目＋昇順／降順（'dt:desc' など） */
export type SortKey = `${SortCol}:${'asc' | 'desc'}`;

/** 検索条件（画面の入力のまま。'' は指定なし） */
export type ReviewSearch = {
  /** 投稿日（から／まで）。<input type="date"> の値（YYYY-MM-DD） */
  from: string;
  to: string;
  /** 注文番号、商品名、商品ID */
  prod: string;
  /** コメントのキーワード */
  kw: string;
  /** 法人ID・拠点ID */
  co: string;
  br: string;
  /** ユーザーID、ニックネーム（未設定は「匿名ユーザー」で探せる） */
  user: string;
  /** 評価タグ */
  tag: string;
  /** コメント有無：'1'＝あり・'0'＝なし */
  hasCm: '' | '1' | '0';
  /** 評価：'1'〜'5'＝その★の商品を含む・'low'＝最低評価が★2以下 */
  star: '' | '1' | '2' | '3' | '4' | '5' | 'low';
  sort: SortKey;
};
