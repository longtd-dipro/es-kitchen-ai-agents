/*
 * 運営Web のサイドメニュー（10_運営_まとめ.html の MENU と同じ並び）。
 * href＝画面の URL、area＝その画面のデータを持つ領域（lib/ops/areas/<area>.ts）。
 */
import { can, MENU_FEATURES, type Grants } from './permissions';

export type MenuLeaf = { key: string; label: string; href: string; area: string; badge?: string };
/** caption＝グループ内の小見出し（階層は増やさず、見出しで区切る） */
export type MenuCaption = { key: string; caption: string };
export type MenuGroup = { key: string; label: string; children: MenuItem[] };
export type MenuItem = (MenuLeaf | MenuGroup | MenuCaption) & { icon?: string };

const L = (key: string, label: string, href: string, area: string, extra: Partial<MenuLeaf> = {}): MenuLeaf => ({ key, label, href, area, ...extra });
const C = (key: string, caption: string): MenuCaption => ({ key, caption });

/* 並びは業務の流れ：申請→法人・契約→メニュー→発注・入荷→配送→請求→購入→お客様対応→マスタ→代理・紹介→アカウント→設定。メニュー名＝画面のタイトル */
export const MENU: MenuItem[] = [
  { ...L('dash', 'ダッシュボード', '/ops', 'general'), icon: 'chart' },
  { ...L('ap', '契約申請管理', '/ops/applications', 'applications', { badge: 'applications' }), icon: 'inbox' },
  {
    key: 'corpg', label: '法人・契約管理', icon: 'building', children: [
      L('corps', '法人一覧', '/ops/corps', 'contracts'),
      L('branches', '拠点一覧', '/ops/branches', 'contracts'),
      L('contracts', '子契約一覧', '/ops/contracts', 'contracts'),
      /* 既存のお客様の移行（受付簿 No.28）：移行した拠点のうち補完が残っているもの。移行CSV取込は /ops/migration/import */
      L('migrate', '移行の要補完', '/ops/migration', 'contracts'),
    ],
  },
  {
    key: 'menug', label: 'メニュー管理', icon: 'cloche', children: [
      L('monthly', '月間メニュー', '/ops/menu/monthly', 'menu'),
      L('menuorders', '商品注文管理', '/ops/menu/orders', 'menu'),
      L('menumats', '資材注文管理', '/ops/menu/materials', 'menu'),
    ],
  },
  {
    key: 'orderg', label: '発注・入荷', icon: 'box', children: [
      L('po', '発注', '/ops/purchasing/orders', 'purchasing'),
      L('poh', '発注・入荷履歴', '/ops/purchasing/history', 'purchasing'),
      L('whchk', '入荷登録', '/ops/purchasing/receiving', 'purchasing'),
      L('whs', '倉庫在庫', '/ops/purchasing/stock', 'purchasing'),
      L('mpo', '資材発注', '/ops/purchasing/materials', 'purchasing'),
      L('smp', '営業サンプル', '/ops/purchasing/samples', 'purchasing'),
    ],
  },
  {
    key: 'dlg', label: '配送管理', icon: 'truck', children: [
      L('schedule', 'スケジュール', '/ops/delivery/schedule', 'delivery'),
      L('dlist', '出荷・配送管理', '/ops/delivery/list', 'delivery'),
      L('dreview', '要確認', '/ops/delivery/review', 'delivery', { badge: 'deliveryReview' }),
      L('matsum', '資材の集計', '/ops/delivery/material-summary', 'delivery'),
      L('dlinq', '委託配送先・中継先の検索', '/ops/delivery/inquiries', 'delivery'),
    ],
  },
  {
    key: 'blg', label: '請求', icon: 'receipt', children: [
      L('bladjs', '棚卸し（拠点在庫）', '/ops/billing/stock', 'billing'),
      L('blact', '実績精算', '/ops/billing/actuals', 'billing'),
      L('blconfirm', '請求の確定・請求書', '/ops/billing/confirm', 'billing'),
      L('blcash', '集金管理', '/ops/billing/collection', 'billing'),
    ],
  },
  {
    key: 'salesg', label: '購入管理', icon: 'cash', children: [
      L('sales', '購入管理', '/ops/sales', 'general'),
      L('fav', 'お気に入り集計', '/ops/sales/favorites', 'general'),
    ],
  },
  {
    key: 'cstg', label: 'お客様対応', icon: 'chat', children: [
      L('rv', 'レビュー・ご意見', '/ops/reviews', 'reviews'),
      L('survey', 'アンケート管理', '/ops/surveys', 'general'),
      L('notices', 'お知らせ一覧', '/ops/notices', 'general'),
      L('inquiries', 'お問い合わせ（法人Webから）', '/ops/inquiries', 'general'),
    ],
  },
  {
    key: 'masterg', label: 'マスタ管理', icon: 'folder', children: [
      C('cap-contract', '契約・料金'),
      L('plans', 'プランマスタ', '/ops/masters/plans', 'masters'),
      L('options', 'オプションマスタ', '/ops/masters/options', 'masters'),
      L('optcats', 'オプション区分マスタ', '/ops/masters/option-categories', 'masters'),
      L('discounts', '値引きマスタ', '/ops/masters/discounts', 'masters'),
      L('devices', '機種マスタ', '/ops/masters/devices', 'masters'),
      C('cap-product', '商品・仕入'),
      L('products', '商品マスタ', '/ops/masters/products', 'general'),
      L('categories', '商品カテゴリ管理', '/ops/masters/categories', 'menu'),
      L('materials', '資材マスタ', '/ops/masters/materials', 'general'),
      L('suppliers', '仕入先マスタ', '/ops/masters/suppliers', 'general'),
      C('cap-deliv', '配送'),
      L('consignees', '委託配送先', '/ops/masters/consignees', 'general'),
      L('warehouses', '倉庫マスタ', '/ops/masters/warehouses', 'general'),
      L('drivers', '配送スタッフ', '/ops/masters/drivers', 'general'),
      L('coolers', '保冷バッグ台帳', '/ops/masters/coolers', 'general'),
    ],
  },
  {
    key: 'agencyg', label: '代理・紹介管理', icon: 'handshake', children: [
      L('agency', '代理店マスタ', '/ops/agency/agencies', 'general'),
      L('feeplan', '紹介フィーマスタ', '/ops/agency/fee-plans', 'general'),
      L('referral', '紹介履歴', '/ops/agency/referrals', 'general'),
      L('payment', '支払履歴', '/ops/agency/payments', 'general'),
    ],
  },
  {
    key: 'accountg', label: 'アカウント管理', icon: 'users', children: [
      L('accounts', 'アカウント一覧', '/ops/accounts', 'general'),
      L('perm', '権限', '/ops/accounts/permissions', 'general'),
    ],
  },
  {
    key: 'settingsg', label: '設定管理', icon: 'gear', children: [
      L('maint', 'メンテナンス管理', '/ops/settings/maintenance', 'general'),
      L('version', 'バージョン&強制アップデート', '/ops/settings/version', 'general'),
      L('ip', 'IPホワイトリスト管理', '/ops/settings/ip', 'general'),
    ],
  },
];

export const isGroup = (m: MenuItem): m is MenuGroup & { icon?: string } => 'children' in m;
export const isCaption = (m: MenuItem): m is MenuCaption & { icon?: string } => 'caption' in m;

/** すべての画面（葉） */
export const LEAVES: MenuLeaf[] = (function walk(items: MenuItem[]): MenuLeaf[] {
  return items.flatMap((m) => (isGroup(m) ? walk(m.children) : isCaption(m) ? [] : [m]));
})(MENU);

/** URL にいちばん長く一致する画面と、その親のグループの key */
export function activeOf(path: string): { leaf?: MenuLeaf; chain: string[] } {
  let best: { leaf: MenuLeaf; chain: string[] } | undefined;
  (function walk(items: MenuItem[], chain: string[]) {
    for (const m of items) {
      if (isCaption(m)) continue;
      if (isGroup(m)) walk(m.children, [...chain, m.key]);
      else if ((path === m.href || (m.href !== '/ops' && path.startsWith(m.href + '/'))) && (!best || m.href.length > best.leaf.href.length)) best = { leaf: m, chain };
    }
  })(MENU, []);
  return best ?? { chain: [] };
}

/*
 * メニューを出すかどうか：役割の権限（機能ごとの操作・lib/ops/permissions.ts）で、その画面の機能のどれかを閲覧できる画面だけ。
 * 画面 → 機能は MENU_FEATURES。ここにない画面は出す。
 */
const canSeeLeaf = (key: string, g: Grants) => { const fs = MENU_FEATURES[key]; return !fs || fs.some((f) => can(g, f, 'read')); };

/** 見られる画面だけのメニュー（子が1つもないグループは出さない） */
export function visibleMenu(items: MenuItem[], g: Grants): MenuItem[] {
  return items.flatMap((m): MenuItem[] => {
    if (isCaption(m)) return [m];
    if (isGroup(m)) {
      const kids = visibleMenu(m.children, g);
      /* 見出しは、次の見出しまでに見える画面が1つもなければ出さない */
      const children = kids.filter((c, i) => {
        if (!isCaption(c)) return true;
        const next = kids.slice(i + 1).findIndex(isCaption);
        return kids.slice(i + 1, next < 0 ? undefined : i + 1 + next).length > 0;
      });
      return children.some((c) => !isCaption(c)) ? [{ ...m, children }] : [];
    }
    return canSeeLeaf(m.key, g) ? [m] : [];
  });
}
