/*
 * API を呼ぶときに「どのサイトの画面から呼んだか」を伝えるヘッダー（x-es-site）。
 * サーバーは、そのサイトのログイン（Cookie：lib/server/session.ts）で見てよい範囲を決める（lib/server/access.ts）。
 */
export const SITES = ['ops', 'corp', 'carrier', 'driver', 'supplier'] as const;
export type WebSite = (typeof SITES)[number];

/** 今開いている画面のサイト（/corp/… → corp）。サイトの外の画面（トップなど）は空 */
export function currentSite(): WebSite | '' {
  if (typeof location === 'undefined') return '';
  const s = location.pathname.split('/')[1] as WebSite;
  return SITES.includes(s) ? s : '';
}

export const siteHeader = (): Record<string, string> => {
  const s = currentSite();
  return s ? { 'x-es-site': s } : {};
};

/**
 * サーバーが「ログインしていない」（401）と返したときに出すイベント。各サイトの Provider がログイン画面に戻す。
 * detail.sentAt＝その API を呼んだ時刻。ログインより前に呼んだもの（ログイン画面で読んだもの）の 401 は Provider が無視する
 */
export const UNAUTHORIZED = 'es:unauthorized';
export type UnauthorizedDetail = { site: string; sentAt: number };
export function onUnauthorized(status: number, sentAt: number) {
  if (status === 401 && typeof window !== 'undefined') window.dispatchEvent(new CustomEvent<UnauthorizedDetail>(UNAUTHORIZED, { detail: { site: currentSite(), sentAt } }));
}

/** Provider 用：ログインした時刻より後に呼んだ API の 401 だけ、ログアウトにする */
export function listenUnauthorized(loginAt: () => number, logout: () => void) {
  const f = (e: Event) => { if ((e as CustomEvent<UnauthorizedDetail>).detail.sentAt >= loginAt()) logout(); };
  window.addEventListener(UNAUTHORIZED, f);
  return () => window.removeEventListener(UNAUTHORIZED, f);
}

/** ログアウト：サーバーのログインの Cookie を消す（失敗しても画面はログアウトする） */
export const serverLogout = () =>
  fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL ?? '/api'}/auth/logout`, { method: 'POST', credentials: 'include', headers: siteHeader() }).catch(() => undefined);
