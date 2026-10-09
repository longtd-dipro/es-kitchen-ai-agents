/** 実在する日付か（YYYY/MM/DD。2026/11/31 や 2026/02/29 は偽）。サーバー側の日付の入力チェックに共通で使う */
export function isRealDate(s: unknown): s is string {
  if (typeof s !== 'string') return false;
  const m = /^(\d{4})\/(\d{2})\/(\d{2})$/.exec(s);
  if (!m) return false;
  const y = Number(m[1]), mo = Number(m[2]), d = Number(m[3]);
  const t = new Date(Date.UTC(y, mo - 1, d));
  return t.getUTCFullYear() === y && t.getUTCMonth() === mo - 1 && t.getUTCDate() === d;
}
