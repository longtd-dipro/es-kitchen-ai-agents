/*
 * 法人Web のホーム・お届け・申請（お届け日の変更）・お知らせ・レビューの型。
 * 元：配送デモ 16_運営_配送.html の法人Web の画面（CorpHome・CorpDeliveryDetail・CorpChangeRequests・CorpChangeRequest・
 *     CorpNewsList・CorpNewsDetail・CorpReviewList・CorpReviewDetail）
 */

export type Tone = 'neutral' | 'success' | 'info' | 'warning' | 'negative' | 'primary';

/* ---------- お届け（カレンダーの1件） ---------- */

/** カレンダーに出すお届け（kind: corp-delivery.events）。元の CorpHome の EVS */
export type CorpEvent = {
  id: string;
  /** お届け日 YYYY-MM-DD */
  d: string;
  /** 拠点ID */
  site: string;
  /** 温度帯（冷蔵・冷凍・資材） */
  t: string;
  /** 法人向けの表示名（納品済・出荷待・一部お届け済み・配送日調整中…） */
  st: string;
  tone: Tone;
  /** 食数など（予定は ''） */
  note: string;
  /** 詳細を開けるお届け（corp-delivery.deliveries の id）。ないものは詳細なし */
  rec?: string;
  /** まだ確定していないお届け（予定） */
  plan?: boolean;
  /** いつもと違う表示の理由（バッジのツールチップ） */
  why?: string;
  /** 配送状況を確認中（未解決のトラブル） */
  chk?: boolean;
  /** ESキッチンが締切後に日付を変えた（#63）。ツールチップの文 */
  moved?: string;
};

/* ---------- お届け詳細 ---------- */

/** 商品の表の1行。oq・fq＝数（納品書で合計を出す）、altFrom＝代替品の元の商品名、short＝足りなかった数 */
export type DeliveryItem = { n: string; /** 商品名（英語。空のことがある・受付簿 #280） */ nEn?: string; o: string; f: string; diff: string; dCls: string; note: string; oq: number; fq: number | null; altFrom?: string; short?: number };
/** 送り状。url＝運送会社の追跡ページ（ヤマトは番号入り）、carrier＝運送会社名 */
export type TrackNo = { no: string; box: string; url?: string; carrier?: string };
/** 関連するお届け。child＝再配送の子（残り）、date＝そのお届け日 YYYY-MM-DD */
export type RelatedDelivery = { id: string; text: string; st: string; tone: Tone; date: string; child: boolean };

/** お届け詳細（kind: corp-delivery.deliveries）。元の CorpDeliveryDetail の R0 */
export type CorpDelivery = {
  /** 配送No（DL-…）または予定No（PL-…） */
  id: string;
  site: string;
  cycle: string;
  st: string;
  tone: Tone;
  /** お届け日 YYYY-MM-DD（変更申請が承認されたら、その日を出す） */
  dateIso: string;
  dateHelper?: string;
  /** 予定（翌月以降・ご注文・変更の締切まで申請できる） */
  plan?: boolean;
  /** 申請の締切（YYYY/MM/DD。ご注文・変更の締切） */
  deadline?: string;
  /** 申請で選べる日の範囲（YYYY-MM-DD）と説明 */
  window?: { from: string; to: string; label: string; note: string };
  /** ご利用月（サイクル）の全日（A1〜D7・YYYY-MM-DD）。申請のモーダルの月のカレンダー */
  cycleRange?: { from: string; to: string };
  svc: string;
  temp: string;
  kindText: string;
  /** 納品書（PDF）を出せる（確定（出荷待）以降・資材便を除く。版1.1） */
  canPdf: boolean;
  /** 納品書の宛先：法人名・拠点の納品先住所（〒 住所） */
  corpName: string;
  address: string;
  /** 納品書の発行元（会社マスタ＝ESキッチンの会社情報。ない値は fallback の見本） */
  issuer?: { name: string; address: string; tel: string };
  /** 再配送の親（自分が再配送の子のとき） */
  parentId?: string;
  /** 足りなかった数（一部お届け済み） */
  short?: number;
  msg?: { tone: 'info' | 'warning'; title: string; text: string };
  itemsTitle: string;
  items: DeliveryItem[];
  noItemsText?: string;
  doneAt?: string;
  receiver?: string;
  collected?: string;
  /** お届けの状況が空のときの見出し・説明（状態で変わる：お届け中止は「お届けしません」など） */
  noResultTitle?: string;
  noResultText?: string;
  track: TrackNo[];
  noTrackText?: string;
  /** 申請できないときの説明（確定・お届け済み） */
  noApplyText?: string;
  related: RelatedDelivery[];
};

/* ---------- お届け日の変更申請 ---------- */

/** 法人Web で見る申請の状況 */
export type CrStatus = '申請中' | '別の日のご提案' | '承認' | '否認' | '取り下げ' | 'お断り済（ESキッチンで調整中）';

/**
 * お届け日の変更申請の、法人Web 側の情報（kind: corp-delivery.requests）。
 * 運営Web が受け付ける申請そのものは delivery.changeRequests（運営Web の「スケジュール ＞ 変更申請」）に同じ申請番号で書く。
 * 状況は delivery.changeRequests があればそちらから決め、なければ st（運営Web にない過去の申請）を出す。
 */
export type CorpCr = {
  id: string;
  site: string;
  /** 対象のお届け（詳細のあるもの） */
  delivery?: string;
  /** 申請日 YYYY/MM/DD */
  at: string;
  /** 今のお届け日 YYYY-MM-DD */
  cur: string;
  /** 変更したい日（第一希望・第二希望）。空＝希望日なし */
  wants: string[];
  reason: string;
  /** 運営Web にない申請の状況 */
  st: CrStatus;
  /** ESキッチンからのご返事 */
  reply: string;
  /** 期限・処理日 */
  due: string;
  /** ご返事の期限（ESキッチンの処理期限＝そのご利用月のご注文・変更の締切）YYYY-MM-DD */
  limit?: string;
  /** 申請したアカウント（法人 CU00001／拠点 CU00871）。拠点アカウントは法人の申請を取り下げられない（H2） */
  by?: string;
  /** 別の日のご提案（ESキッチンから） */
  proposal?: { date: string; note: string; msg: string; deadline: string };
  /** ご提案をお断りした日（YYYY/MM/DD） */
  declinedAt?: string;
  /** ご提案を受けて決まったお届け日（YYYY-MM-DD）。運営Web の申請がないときに使う */
  approved?: string;
};

/** 申請の一覧・詳細に出す形。canWithdraw＝このアカウントで取り下げられる（申請中・自分の申請） */
export type CrView = CorpCr & { status: CrStatus; tone: Tone; siteName: string; curText: string; wantText: string; hasDetail: boolean; canWithdraw?: boolean };

/** 申請のモーダルの月のカレンダーの1日。dis＝選べない（tip に理由）、cur＝今のお届け日 */
export type CalCell = { iso: string; day: number; wd: string; dis: boolean; tip: string; cur: boolean };

/* ---------- お知らせ ---------- */

export type NewsBlock = { p?: string; h?: string; li?: string[] };
/** お知らせ（kind: corp-delivery.news）。detail が false のものは詳細なし（ホームだけ） */
export type CorpNews = { id: string; at: string; cat: string; title: string; important?: boolean; blocks: NewsBlock[]; att?: string[]; detail: boolean };

/** 確認が必要なお届け（kind: corp-delivery.todos） */
export type CorpTodo = {
  id: string;
  site: string;
  at: string;
  category: string;
  tone: Tone;
  note: string;
  title: string;
  /** 押したときに開くお届け（corp-delivery.deliveries の id） */
  link?: string;
  /** この申請が「別の日のご提案」の間だけ出す */
  crOpen?: string;
  /** このお届けが申請できる間だけ出す */
  applyOf?: string;
  /** ④ の行：お届けの月（まとめた行から、その月のカレンダーを開くため） */
  applyYm?: string;
};

/* ---------- 画面に返す形 ---------- */

export type CalBadge = { tone: Tone; label: string; title?: string };
export type CalLine = { pre: string; value: string; post: string };
/** 同じ日のお届けの一覧（Q-H2）の1行：行の文字・そのお届けのバッジ・開く詳細 */
export type CalItem = { go: string | null; line: CalLine; badges: CalBadge[] };
/** 日付のマス。go＝その日のお届けが1件のときに開く詳細、items＝その日のお届け（2件以上なら一覧（ポップオーバー）で選ぶ） */
export type HomeCell = { date: number; iso: string; today: boolean; holiday: string; cycle: string; state: string[]; lines: CalLine[]; badges: CalBadge[]; items: CalItem[]; go: string | null; has: boolean };
export type NoticeItem = { at: string; category: string; tone?: Tone; note?: string; title: string; href?: string };
