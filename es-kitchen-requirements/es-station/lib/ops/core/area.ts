/*
 * 運営Web（ほかのサイトも同じ）の「領域」（申請・法人契約・マスタ・請求・配送…）の決まり。
 * 1つの領域 = 見本データ（seed）＋ 読み取り（queries）＋ 書き換え（actions）。
 * queries / actions は DocRepo だけを使う純粋な関数にする。こうすると
 *   - mock：ブラウザのメモリの DocRepo で動く
 *   - http：app/api/ops/area/[area]/[op] が SQLite の DocRepo で同じ関数を動かす
 * の両方が同じ動きになる。本物のバックエンドも、この関数の動きに合わせる。
 */

/** 文書（JSON）の置き場所。kind＝種類（テーブルのようなもの）、id＝その中の ID */
export interface DocRepo {
  /** 入れた順（seq）に返す */
  list<T>(kind: string): T[];
  get<T>(kind: string, id: string): T | undefined;
  /** なければ末尾に足し、あれば置き換える */
  put<T>(kind: string, id: string, data: T): void;
  remove(kind: string, id: string): void;
  /** 連番を払い出す（申請番号など）。key ごとに 1, 2, 3… */
  nextSeq(key: string): number;
}

export type Seed = Record<string, { id: string; data: unknown }[]>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Fn = (repo: DocRepo, args: any) => unknown;

export type Area<Q extends Record<string, Fn> = Record<string, Fn>, A extends Record<string, Fn> = Record<string, Fn>> = {
  /** URL に使う名前（英小文字とハイフン） */
  name: string;
  seed: () => Seed;
  queries: Q;
  actions: A;
};

/** 型を残したまま領域を定義する */
export function defineArea<Q extends Record<string, Fn>, A extends Record<string, Fn>>(a: Area<Q, A>): Area<Q, A> {
  return a;
}

/** id を持つ行の配列を Seed の形にする */
export const toDocs = <T extends { id: string }>(rows: T[]) => rows.map((data) => ({ id: data.id, data }));
