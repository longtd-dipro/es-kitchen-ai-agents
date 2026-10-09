import { ApiError, STALE } from '@/lib/api/errors';

/*
 * 同時更新の検知（E31・Message List No.43・受付簿 No.98）。楽観的な排他：フォームが読み込んだ版（baseVersion）と、保存するときの版を比べる。
 *
 * 他のフォームに入れるとき（マスタ管理の masters.ts／MasterDetail.tsx が見本）
 *   1. 保存するドキュメントに版（version）を持たせる。保存のたびに nextVersion で進める（空は '0'）
 *   2. get／list の出力に version を足す（画面が読み込んだ値を覚える）
 *   3. 保存の action の引数に baseVersion?: string・force?: boolean を足し、書く前に assertFresh(いまの版, a.baseVersion, a.force) を呼ぶ
 *   4. 保存の action は新しい version を返す（画面は返り値か、読み直した get で版を更新する）
 *   5. 画面：isStale(e) のとき、E31 の警告（「キャンセル」「上書きして保存」）を出し、上書きは force: true で送り直す
 * baseVersion を送らない呼び出し（CSV取込など）は検査しない。force: true は検査を飛ばす。
 */

/** 版が違えば 409（code: STALE）。base が無い（新規・古い呼び出し）か force のときは通す */
export function assertFresh(current: string | undefined, base?: string, force?: boolean) {
  if (force || base === undefined) return;
  if ((current ?? '0') !== base) throw new ApiError('他のユーザーにより内容が更新されています。上書きすると保存されます。', 409, STALE);
}

/** 保存のあとの版（数字を1つ進める） */
export const nextVersion = (current?: string) => String((Number(current) || 0) + 1);
export const versionOf = (current?: string) => current ?? '0';
