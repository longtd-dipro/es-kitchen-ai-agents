/*
 * 委託配送先Web のサイドメニュー（30_委託配送先_まとめ.html の shell() と同じ並び）。
 * icon＝app/carrier/_ui/Icon.tsx のアイコンの名前
 */
/** group＝この項目から始まる区切りの見出し（サイドメニューに小さく出す） */
export type CarrierMenuItem = { key: string; label: string; href: string; icon: string; group?: string };

export const CARRIER_MENU: CarrierMenuItem[] = [
  { key: 'home', label: 'ホーム', href: '/carrier', icon: 'house' },
  { key: 'schedule', label: 'スケジュール', href: '/carrier/schedule', icon: 'cal', group: '日々の配送' },
  { key: 'deliveries', label: '配送管理', href: '/carrier/deliveries', icon: 'truck' },
  { key: 'troubles', label: 'トラブル', href: '/carrier/troubles', icon: 'warn' },
  { key: 'collect', label: '集金管理', href: '/carrier/collect', icon: 'wallet', group: 'お金・案件' },
  { key: 'quotes', label: '見積依頼', href: '/carrier/quotes', icon: 'clip' },
  { key: 'staff', label: '配送スタッフ', href: '/carrier/staff', icon: 'users', group: '管理' },
  { key: 'profile', label: 'プロフィール', href: '/carrier/profile', icon: 'user' },
];

/** ログインしなくても開ける画面（枠を出さない） */
export const PUBLIC_PATHS = ['/carrier/login', '/carrier/password', '/carrier/apply'];

/** URL に合うメニューの項目（ホーム以外は前方一致。お知らせ詳細はホーム） */
export function carrierActive(path: string): string {
  const hit = CARRIER_MENU.find((m) => m.href !== '/carrier' && (path === m.href || path.startsWith(m.href + '/')));
  return hit?.key ?? 'home';
}

/** DEMO 帯の画面ジャンプ（元の proto() の画面一覧） */
export const SCREEN_LIST: { group?: string; label: string; href: string; code: string }[] = [
  { group: '認証', label: 'ログイン', href: '/carrier/login', code: 'OW_AUTH_001' },
  { label: 'パスワード再設定', href: '/carrier/password', code: 'OW_AUTH_002' },
  { label: '申し込みフォーム 1/2', href: '/carrier/apply', code: 'R01' },
  { label: '申し込みフォーム 2/2', href: '/carrier/apply/2', code: 'R02' },
  { group: '配送パートナー', label: 'ホーム', href: '/carrier', code: 'OW_ANNO_001' },
  { label: 'お知らせ詳細', href: '/carrier/news/1', code: 'OW_ANNO_001' },
  { label: 'スケジュール（月・週）', href: '/carrier/schedule', code: 'OW_SCHED_001' },
  { label: '配送管理（一覧＋一括設定）', href: '/carrier/deliveries', code: 'OW_SCHED_001' },
  /* 共通データの栄成ロジ（DE00001）の配送：川崎工場 10/07 便の2次の区間（代替品設定 ALT-2610-0001 で出荷指示 rev2・シナリオ説明書 ⑦ の DL-261005-0001 の例） */
  { label: '配送詳細', href: '/carrier/deliveries/DL-261006-0001:2', code: 'OW_SCHED_002' },
  { label: '集金管理', href: '/carrier/collect', code: 'OW_SCHED_001' },
  { label: 'トラブル一覧（追加）', href: '/carrier/troubles', code: '—' },
  { label: '見積依頼一覧', href: '/carrier/quotes', code: 'quote-list' },
  { label: '見積依頼回答（新規）', href: '/carrier/quotes/QT-2026-0930-021/answer', code: 'quote-response' },
  { label: '見積依頼回答（金額再確認）', href: '/carrier/quotes/QT-2026-0929-017/answer', code: 'quote-response' },
  { label: '見積依頼詳細', href: '/carrier/quotes/QT-2026-0920-010', code: 'quote-details' },
  { label: '配送スタッフ一覧（一括発行）', href: '/carrier/staff', code: 'OW_SCHED_001' },
  { label: '配送スタッフ詳細', href: '/carrier/staff/DR00014', code: 'OW_SCHED_001' },
  { label: '配送スタッフ登録', href: '/carrier/staff/new', code: 'OW_SCHED_001' },
  { label: 'プロフィール', href: '/carrier/profile', code: 'OW_ANNO_001-6/8' },
];
