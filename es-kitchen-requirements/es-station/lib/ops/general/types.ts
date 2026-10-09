/* 領域 general（ダッシュボード・一覧の画面・代理紹介・お知らせ・売上・設定）の型 */

/** 一覧だけの画面の行（元の GEN の行）。_uid＝行の ID（文書の id） */
export type GenRow = { _uid: string; status?: string; [k: string]: unknown };

/** 一覧だけの画面の種類（元の GEN のキー） */
export type GenKey = 'product' | 'consign' | 'warehouse' | 'driver' | 'cooler' | 'supplier' | 'perm' | 'version' | 'ip' | 'notices' | 'accounts';

/* ---------- 代理・紹介管理 ---------- */
export type PayKind = '単発' | '継続（ヶ月）' | '継続（永続）';
export type CalcKind = '固定額' | '月次提供数別の金額' | '請求額割合';
/** [その食数まで, 金額]。最後の段は 9999 */
export type Tier = [number, number | string];

export type FeePlan = {
  id: string; code?: string; name: string; src: '法人' | '代理店'; pay: PayKind; calc: CalcKind;
  amount?: number | string | null; rate?: number | string | null; months: number | string | null; tiers?: Tier[] | null;
  status: string; updated?: string; note: string; history?: History[];
};
/** 紹介に適用した時点のフィー条件 */
export type FeeCond = { pay: PayKind; months: number | string | null; calc: CalcKind; amount: number | string | null; rate: number | string | null; tiers: Tier[] | null };

export type Contact = { kind: string; name: string; kana: string; email: string; tel: string };
export type History = { at: string; what: string; by: string };
export type AgencyRow = {
  id: string; name: string; kana: string; plan: string; status: string; tel: string; fax: string; zip: string;
  pref: string; city: string; addr: string; bldg: string; note: string; contacts: Contact[]; history: History[];
};
export type Corp = { id: string; name: string };
/** 親契約（法人・契約管理の拠点一覧と同じ） */
export type RefContract = { id: string; br: string; branch: string; cu: string; st: string; start: string; end?: string; plan: string; meals: number; bill: number; agent: string; corpSrc?: string };
export type RefMeta = { id: string; plan: string; cond: FeeCond | null; payStart: string; status: string; endPlan: string; end: string; note: string; history: History[] };
/** 紹介履歴（親契約＋紹介ごとの設定） */
export type Referral = RefMeta & { contract: string; srcType: '代理店' | '法人'; src: string; start: string };

export type PayLine = { ref: string; corp: string; plan: string; pay: string; sites: number; calc: string; base: number; rateTxt: string; fee: number; adj: number | string };
export type Payment = { id: string; month: string; type: '代理店' | '法人'; target: string; method: string; status: string; date: string; note: string; lines: PayLine[]; history: History[] };

/* ---------- お知らせ ---------- */
/** 条件で絞る（法人・拠点とアプリユーザーだけ）：ym＝注文した年月（空＝問わない）、kind＝その月のメニュー／商品を注文、vending＝自販機のある・なし */
export type NoticeCond = { ym: string; kind: 'menu' | 'product'; vending: 'any' | 'yes' | 'no' };
export type NoticeTarget = { ess: boolean; mail: string[]; mode: 'all' | 'pick' | 'cond'; picks: string[]; cond?: NoticeCond };
/** sign＝メールの署名欄（空＝設定値のまま。お知らせごとに直せる：hong 2026-10-05） */
export type NoticeDetail = { tg: Record<string, NoticeTarget>; start: string; end: string; files: number; body: string; subj: string; mailAt: string; mailBody: string; sign?: string };
/** 編集フォームの中身（詳細＋タイトル・カテゴリ） */
/** important＝重要なお知らせ（法人Web などで上に出し、公開開始日の 8:00 にメールを自動で送る） */
export type NoticeForm = NoticeDetail & { title: string; cat: string; important?: boolean };

/* ---------- 設定 ---------- */
export type MaintCard = { on: boolean; title: string; body: string };
export type MaintState = { ios: MaintCard; android: MaintCard; log: { os: string; title: string; body: string; s: string; e: string }[] };

export type SupplierApp = { no: string; at: string; rep: string; zip: string; addr: string; tel: string; pic: string; mail: string; biz: string; goods: string; cert: string; memo: string };

/* ---------- 売上・お気に入り・ダッシュボード ---------- */
export type SalesSite = { id: string; name: string; cnt: number; amt: number; payN: number; refN: number; refAmt: number; cl: number; pay: number[] };
export type SalesItem = { pid: string; name: string; menu: string; cnt: number; amt: number; ord: number; fav: number };
export type SalesUser = { uid: string; no: string; site: string; sname: string; amt: number; /** 購入の個数 */ qty: number; pay: string; st: string; reason: string; at: string };
export type RankRow = { pid: string; name: string; cat: string; order: number; q: number; amt: number };
export type FavRow = { pid: string; name: string; last: string; n: number; cat: string; tot: number; m: number; f: number; [age: string]: string | number };
/** ダッシュボードのグラフの条件の選択肢（購入の月・法人・拠点・カテゴリ） */
export type DashData = {
  /** いちばん新しい月（yyyy-mm） */
  ym: string;
  /** 月ごとの購入の集計がある月（古い順） */
  months: string[];
  corps: { id: string; name: string }[];
  branches: { id: string; name: string; corpId: string }[];
  cats: string[];
};
/** 月次購入額推移の条件（期間＝yyyy-mm の から〜まで・法人・拠点） */
export type DashLineArgs = { from?: string; to?: string; corpId?: string; branchId?: string };
export type DashLine = { months: string[]; sales: number[] };
/** お気に入り × 購入分析の条件（期間＝yyyy-mm の から〜まで・法人・拠点・カテゴリ） */
export type DashFavArgs = DashLineArgs & { cats?: string[] };
/** rows＝[商品名, 購入金額, お気に入り件数] */
export type DashFav = { rows: [string, number, number][]; from: string; to: string };
