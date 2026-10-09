/** 仕入先サイトの画面（S01〜S09）と URL */
export const R = {
  login: '/supplier/login',
  forgot: '/supplier/forgot',
  apply: '/supplier/apply',
  home: '/supplier/home',
  notice: (id: number) => `/supplier/notices/${id}`,
  orders: '/supplier/orders',
  ordersImport: '/supplier/orders/import',
  order: (no: string) => `/supplier/orders/${encodeURIComponent(no)}`,
  profile: '/supplier/profile',
  manual: '/supplier/manual',
};

/** サイドメニューのどれを選択中にするか */
export function menuOf(path: string): 'home' | 'orders' | 'profile' | 'manual' | '' {
  if (path.startsWith('/supplier/notices') || path.startsWith(R.home)) return 'home';
  if (path.startsWith(R.orders)) return 'orders';
  if (path.startsWith(R.profile)) return 'profile';
  if (path.startsWith(R.manual)) return 'manual';
  return '';
}
