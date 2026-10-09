/*
 * 画面側が覚えておくログインの印（どのアカウントで入っているか）。ログインの期限は全サイト1日（台帳 K）。
 * 本当の認証はサーバーの Cookie（lib/server/session.ts・同じ1日）。ここは「画面を開いたとき、ログイン画面を出さずに読み込む」ためだけ。
 * タブを閉じても1日は残す（localStorage）。期限が過ぎた印は読まない。サーバー側が切れていたら API が 401 を返し、各サイトの Provider がログイン画面に戻す。
 */
export const KEEP_LOGIN_MS = 24 * 60 * 60 * 1000;

export function keepLoginGet(key: string): string | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const x = JSON.parse(raw) as { v?: string; exp?: number };
    if (typeof x.v !== 'string' || typeof x.exp !== 'number' || x.exp <= Date.now()) { localStorage.removeItem(key); return null; }
    return x.v;
  } catch {
    return null;
  }
}

export function keepLoginSet(key: string, value: string) {
  try { localStorage.setItem(key, JSON.stringify({ v: value, exp: Date.now() + KEEP_LOGIN_MS })); } catch { /* 使えなくてもよい（次はログインからやり直す） */ }
}

export function keepLoginClear(key: string) {
  try { localStorage.removeItem(key); } catch { /* 無視 */ }
}
