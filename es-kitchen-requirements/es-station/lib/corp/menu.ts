/*
 * 法人Web のサイドメニュー（20_法人_まとめ.html と同じ並び）。
 * area＝その画面のデータを持つ領域（lib/corp/areas/<area>.ts）。adminOnly＝拠点アカウントでは出さない
 */
export type CorpLeaf = { key: string; label: string; href: string; area: string; icon?: string; adminOnly?: boolean };
export type CorpItem = CorpLeaf & { children?: CorpLeaf[] };

export const CORP_MENU: CorpItem[] = [
  { key: 'home', label: 'ホーム', href: '/corp', area: 'corp-delivery', icon: 'home' },
  /* 2026/10/03 決定：お客様の毎月の流れ（注文 → 棚卸報告 → 請求書）を上に、ときどきの申請・拠点・法人情報を下に。メニュー名＝画面タイトル */
  {
    key: 'order', label: '月次注文', href: '/corp/order', area: 'corp-order', icon: 'order', children: [
      { key: 'order', label: '商品注文', href: '/corp/order', area: 'corp-order' },
      { key: 'mat', label: '資材注文', href: '/corp/order/materials', area: 'corp-order' },
      { key: 'hist', label: '注文履歴', href: '/corp/order/history', area: 'corp-order' },
    ],
  },
  /* 台帳 E 2026-10-05：メニュー名は「棚卸報告」（「在庫点検」は使わない）。押すと棚卸一覧（/corp/stock）。報告の画面は /corp/stock/<拠点ID>/<月度> */
  { key: 'stock', label: '棚卸報告', href: '/corp/stock', area: 'corp-docs', icon: 'stock' },
  { key: 'bills', label: '請求書', href: '/corp/bills', area: 'corp-docs', icon: 'bills' },
  {
    key: 'reqg', label: '申請', href: '/corp/requests', area: 'corp-delivery', icon: 'req', children: [
      { key: 'req', label: 'お届け日の変更', href: '/corp/requests', area: 'corp-delivery' },
      { key: 'creq', label: '契約の申請', href: '/corp/requests/contract', area: 'corp-sites' },
    ],
  },
  /* REQ-UI-012：「法人情報の下に拠点」は画面の中で守る（法人情報の画面に拠点）。メニューは拠点管理・法人情報の2つだけ（URL は変えない） */
  {
    key: 'corpg', label: '拠点・法人情報', href: '/corp/sites', area: 'corp-sites', icon: 'corp', children: [
      { key: 'site', label: '拠点管理', href: '/corp/sites', area: 'corp-sites' },
      { key: 'corp', label: '法人情報', href: '/corp/corp-info', area: 'corp-sites', adminOnly: true },
    ],
  },
  { key: 'sales', label: '購入・ユーザー管理', href: '/corp/sales', area: 'corp-docs', icon: 'sales' },
  { key: 'review', label: 'レビュー', href: '/corp/reviews', area: 'corp-delivery', icon: 'review' },
  /* HubSpot Phase 2：お問い合わせ（共通データ notice.sendInquiry） */
  { key: 'contact', label: 'お問い合わせ', href: '/corp/contact', area: 'corp-docs', icon: 'chat' },
];

/** ログインしなくても開ける画面 */
export const PUBLIC_PATHS = ['/corp/login', '/corp/apply'];

/**
 * お届け詳細を開いた元（?from=）。台帳 2026-10-05・受付簿 No.157：サイドメニュー・パンくず・戻るボタンは開いた元に合わせる。
 * home（ホーム・既定）／requests（申請 ＞ お届け日の変更の一覧）／news（お知らせ一覧）。これ以外の値・なしは home
 */
export type DeliveryFrom = 'home' | 'requests' | 'news';
export const deliveryFrom = (v: string | null | undefined): DeliveryFrom => (v === 'requests' || v === 'news' ? v : 'home');
export const isDeliveryPath = (path: string) => path.startsWith('/corp/deliveries/');

/** URL に合うメニューの項目（ホーム以外は前方一致。グループは子の URL で決める。お知らせはホーム。お届け詳細は開いた元の項目：from なしはホーム） */
export function corpActive(path: string, from?: string | null): { item?: string; sub?: string } {
  if (isDeliveryPath(path)) return deliveryFrom(from) === 'requests' ? { item: 'reqg', sub: 'req' } : { item: 'home' };
  if (path.startsWith('/corp/order')) {
    const sub = path.startsWith('/corp/order/materials') ? 'mat' : path.startsWith('/corp/order/history') ? 'hist' : 'order';
    return { item: 'order', sub };
  }
  const under = (href: string) => path === href || path.startsWith(href + '/');
  for (const m of CORP_MENU) {
    /* いちばん長く合う子（/corp/requests と /corp/requests/contract を取り違えない） */
    const c = (m.children ?? []).filter((x) => under(x.href)).sort((x, y) => y.href.length - x.href.length)[0];
    if (c) return { item: m.key, sub: c.key };
  }
  const hit = CORP_MENU.find((m) => m.href !== '/corp' && under(m.href));
  return { item: hit?.key ?? 'home' };
}
