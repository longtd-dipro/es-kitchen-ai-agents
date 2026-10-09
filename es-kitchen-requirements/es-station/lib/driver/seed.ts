import { PRODUCTS as MASTER_PRODUCTS } from '@/lib/domain/seed/master';
import type { Manual } from './types';

/*
 * ドライバーの画面の決まった文言（40_ドライバーブラウザ.html の MANUALS・選択肢・画面一覧）。
 * 受取地点・配送・お知らせ・在庫は共通データ（lib/domain・dm.*）から読む（lib/driver/fromDomain.ts）。ここには業務データを持たない。
 */

/** 送り状がない配送の箱の番号（「配送No-01」）。箱数は食数から出す（仮：25食で1箱） */
export const MEALS_PER_BOX = 25;
export const boxNos = (no: string, n: number) => Array.from({ length: n }, (_, i) => ({ no: `${no}-${String(i + 1).padStart(2, '0')}` }));

/** 廃棄登録の商品の選択肢（商品マスタ M001〜M032 の名前。登録のときに共通データの商品マスタで商品ID に直す） */
export const PRODUCTS = MASTER_PRODUCTS.map((p) => p.name);
export const RECV_REASONS = ['箱数不足', '誤配送', '荷物破損', 'その他'];
export const DLV_REASONS = ['商品不足・誤配送', '交通渋滞・事故', '不在・連絡不可', 'その他'];
/** 送り状番号を選ぶのが必須のトラブル */
export const NEED_INV = ['箱数不足', '誤配送', '荷物破損', '商品不足・誤配送'];
export const WASTE_REASONS_BASE = ['賞味期限切れ', '破損', '品質不良'];
/** 緊急連絡先 */
export const ES_TEL = '050-5784-2777';

/*
 * 代替品設定（商品不良）の回収の廃棄理由。代替品の中身（代替品（元：〇〇）・回収・廃棄の指示）は共通データの配送の明細・納品備考から出す
 * （lib/driver/fromDomain.ts の altNotes・altLabel・altIdOf）。前の見本の固定の札（ALT-2610-0001）は外した
 */
export const ALT_WASTE_REASON = '代替品の回収（不良品）';
export const WASTE_REASONS = [...WASTE_REASONS_BASE, ALT_WASTE_REASON, 'その他'];

export const MANUALS: Manual[] = [
  { t: '荷物受取の手順', b: '1. 受取地点（倉庫・中継先）に着いたら「配送一覧」の「倉庫受取」から地点を開きます。\n2. 荷物の送り状番号を1件ずつチェックします。\n3. すべてチェックしたら「完了」を押します。\n4. 足りない荷物がある場合は、ESへ電話するか「未受取分は連絡済み」にチェックして「一部未受取のまま完了」を押します。未受取分は自動でトラブル（箱数不足）として運営に報告されます。\n5. 同じ日に同じ地点で追加の荷物を受け取るときは、完了後の画面の「追加の荷物を受け取る」を使います。' },
  { t: 'ES配送便（5ステップ）', b: 'STEP1 陳列前の写真\nSTEP2 在庫・廃棄の確認（バーコード読取可）\nSTEP3 陳列（検品）：実際に並べた数を入力。予定と違う場合は自動でトラブルとして運営に報告されます\nSTEP4 陳列後の写真\nSTEP5 集金登録（集金がある納品先のみ・任意）\n\n完了後も7日間は各ステップの内容を修正できます。' },
  { t: 'COOL便', b: '納品先で荷物（送り状番号）をチェックし「完了」を押します。渡せなかった荷物があるときは「一部未配送のまま完了」を押してください。未配送分は自動でトラブルとして運営に報告され、運営が再配送を手配します。' },
  { t: 'トラブル報告', b: '配送中に問題が起きたら、画面右上のベルのボタン、または下部メニューの「トラブル」から報告します。\n荷物受取時：箱数不足／誤配送／荷物破損／その他\n配達時：商品不足・誤配送／交通渋滞・事故／不在・連絡不可／その他\n\n報告は運営に届きます。取消・再配送などの対応は運営が行います。急ぎの場合は「ESへ電話する（050-5784-2777）」を使ってください。' },
  { t: '廃棄・棚卸し', b: 'ホームの「廃棄・棚卸し」から開きます。\n廃棄登録：商品を検索またはバーコードで読み取り、数量と理由を入れて登録します。\n棚卸し：実際の在庫数を入力（またはスキャン）して送信します。理論在庫と差がある商品は運営管理者に通知されます。' },
];

/** 画面一覧（元の SCREENS。DEMO 帯の画面ジャンプ） */
export const SCREENS: { code: string; label: string; group: string; href: string }[] = [
  { code: 'DA_AUTHEN_001', label: 'ログイン', group: '認証', href: '/driver/login' },
  { code: 'DA_AUTHEN_002_01', label: 'パスワードリセット（ID・メール）', group: '認証', href: '/driver/password' },
  { code: 'DA_AUTHEN_002_02/03', label: '認証コード入力', group: '認証', href: '/driver/password?step=2' },
  { code: 'DA_AUTHEN_002_04', label: '新しいパスワード', group: '認証', href: '/driver/password?step=3' },
  { code: 'DA_AUTHEN_002_06', label: 'リセット完了', group: '認証', href: '/driver/password?step=4' },
  { code: 'DA_HOME_001', label: 'ホーム', group: 'ホーム', href: '/driver' },
  { code: 'DA_HOME_005', label: 'アカウント', group: 'ホーム', href: '/driver/account' },
  { code: 'DA_NOTI_001', label: 'お知らせ一覧', group: 'ホーム', href: '/driver/news' },
  { code: 'DA_NOTI_002', label: 'お知らせ詳細', group: 'ホーム', href: '/driver/news/0' },
  { code: '（追加）', label: 'マニュアル一覧', group: 'ホーム', href: '/driver/manuals' },
  { code: '（追加）', label: '廃棄・棚卸し', group: 'ホーム', href: '/driver/stock' },
  { code: 'DA_LIST_001〜003', label: '配送一覧', group: '配達', href: '/driver/list' },
  { code: 'DA_RECV_001/003', label: '荷物受取（倉庫）', group: '配達', href: '/driver/receive' },
  { code: '（追加）', label: '荷物受取（中継先）', group: '配達', href: '/driver/receive/hub' },
  { code: 'DA_COOL_001', label: 'COOL便', group: '配達', href: '/driver/cool' },
  { code: 'DA_ESDL_000', label: 'ES配送便 詳細', group: 'ES配送便', href: '/driver/es' },
  { code: 'DA_ESDL_001', label: '① 陳列前', group: 'ES配送便', href: '/driver/es?step=s1' },
  { code: 'DA_ESDL_002', label: '② 在庫/廃棄', group: 'ES配送便', href: '/driver/es?step=s2' },
  { code: 'DA_ESDL_002-02', label: 'バーコードスキャン', group: 'ES配送便', href: '/driver/es?step=scan' },
  { code: 'DA_ESDL_003', label: '③ 陳列', group: 'ES配送便', href: '/driver/es?step=s3' },
  { code: 'DA_ESDL_004', label: '④ 陳列後', group: 'ES配送便', href: '/driver/es?step=s4' },
  { code: 'DA_ESDL_005', label: '⑤ 集金登録', group: 'ES配送便', href: '/driver/es?step=s5' },
  { code: 'DA_RPTD_001', label: 'トラブル報告（対象選択）', group: 'トラブル', href: '/driver/trouble' },
  { code: 'DA_RPTD_002', label: 'トラブル報告（内容入力）', group: 'トラブル', href: '/driver/trouble?form=1' },
];
