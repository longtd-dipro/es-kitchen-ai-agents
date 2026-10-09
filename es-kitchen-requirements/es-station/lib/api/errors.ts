/** API のエラー。message は画面にそのまま出せる文言にする。code は画面が分岐するための印（例：STALE＝同時更新） */
export class ApiError extends Error {
  constructor(message: string, readonly status?: number, readonly code?: string) {
    super(message);
    this.name = 'ApiError';
  }
}

/** 画面に出すエラーの文言 */
export const errorMessage = (e: unknown) => (e instanceof ApiError ? e.message : '通信に失敗しました。時間をおいてもう一度お試しください');

/** 同時更新（ほかのユーザーが先に保存した）のエラーか（決定台帳 F「同時更新のメッセージ（E31）」） */
export const STALE = 'STALE';
export const isStale = (e: unknown) => e instanceof ApiError && e.code === STALE;
