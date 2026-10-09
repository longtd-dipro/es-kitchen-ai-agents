/*
 * 認証の決まり（全サイト共通）。
 *   - 認証コード：4桁・有効期限5分（台帳 K「パスワードの再設定」・F 2026-10-07「認証コード（全サイト共通）」）。ロックなし。再送の間隔は定義しない
 *   - パスワード：8〜64文字・半角・英字と数字を含む（台帳 F 2026-10-07「パスワードの最大文字数」）
 */
export const CODE_DIGITS = 4;
export const CODE_MINUTES = 5;
export const PASSWORD_MIN = 8;
export const PASSWORD_MAX = 64;

export const isCode = (v: unknown): v is string => typeof v === 'string' && new RegExp(`^\\d{${CODE_DIGITS}}$`).test(v);

/** 半角（ASCII の記号を含む・空白なし）で、英字と数字を1文字以上含む 8〜64文字 */
export const passwordValid = (v: unknown): v is string =>
  typeof v === 'string' && v.length >= PASSWORD_MIN && v.length <= PASSWORD_MAX && /^[\x21-\x7E]+$/.test(v) && /[A-Za-z]/.test(v) && /\d/.test(v);

export const PASSWORD_RULE = `${PASSWORD_MIN}〜${PASSWORD_MAX}文字の半角で、英字と数字を含めてください`;
export const PASSWORD_HINT = `${PASSWORD_MIN}〜${PASSWORD_MAX}文字・半角・英字と数字を含む`;

/** 認証コードを作る（暗号用の乱数。ブラウザ・Node のどちらでも動く） */
export function randomCode(): string {
  const n = new Uint32Array(1);
  globalThis.crypto.getRandomValues(n);
  return String(n[0] % 10 ** CODE_DIGITS).padStart(CODE_DIGITS, '0');
}
