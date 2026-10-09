/*
 * 画面・メールで使う外のリンク（変わることがあるので環境変数で設定する。.env.*）。
 * 法人Web（ブラウザ）と共通データ（メール）の両方から読むので、ほかの import を持たない
 */

/** キックオフ面談の予約（申込の完了画面・M1：台帳「申込の完了のキックオフ面談の案内」2026/10/03） */
export const KICKOFF_URL = process.env.NEXT_PUBLIC_KICKOFF_URL || 'https://booking.receptionist.jp/kickoff-mtg-schedule/60min';
