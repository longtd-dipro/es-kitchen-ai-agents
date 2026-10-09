import { defineArea, type DocRepo } from '../core/area';
import app from '@/lib/domain/areas/app';
import type { AppReview, AppUser, Branch, Corp } from '@/lib/domain/types';
import { csvRows, CSV_HEAD, searchRows, toRow } from '../reviews/logic';
import type { Company, Review, ReviewSearch, ReviewUser } from '../reviews/types';

/*
 * レビュー・ご意見（部品/17_運営_レビュー.html）。
 * 個人アプリ「マイページ ＞ レビュー・ご意見」の投稿を運営Web で見る。閲覧・検索・CSV出力だけなので actions はない。
 * データは共通データ（dm.app.reviews・dm.app.users・dm.app.reviewTags、法人・拠点は dm.org）。法人Web のレビュー・ご意見と同じ投稿。
 */

/** 共通データのレビュー → 画面の形（ID・日時・注文番号・商品の並びはそのまま） */
const reviewOf = (x: AppReview): Review => ({
  id: x.id, dt: x.at, uid: x.userId, order: x.orderNo, comment: x.comment, items: x.items.map((i) => ({ pid: i.productId, name: i.name, star: i.star, tags: i.tags })),
});
const userOf = (r: DocRepo, u: AppUser): ReviewUser => ({
  id: u.id, nick: u.nickname, left: u.status === '退会', coId: r.get<Branch>('dm.org.branches', u.branchId)?.corpId ?? '', brId: u.branchId,
});
/** 法人（拠点つき）：レビューを書いた利用者のいる拠点だけ */
function companiesOf(r: DocRepo, users: ReviewUser[]): Company[] {
  const brIds = [...new Set(users.map((u) => u.brId))];
  const out = new Map<string, Company>();
  for (const id of brIds.sort()) {
    const b = r.get<Branch>('dm.org.branches', id);
    if (!b) continue;
    const coId = b.corpId ?? '';
    const c = out.get(coId) ?? { id: coId, name: coId ? r.get<Corp>('dm.org.corps', coId)?.name ?? coId : '（法人なし）', branches: [] };
    c.branches.push({ id: b.id, name: b.name });
    out.set(coId, c);
  }
  return [...out.values()].sort((a, b) => a.id.localeCompare(b.id));
}

const rowsOf = (repo: DocRepo) => {
  const users = app.queries.users(repo).map((u) => userOf(repo, u));
  const cos = companiesOf(repo, users);
  return app.queries.reviews(repo).map((x) => toRow(reviewOf(x), users, cos));
};

export default defineArea({
  name: 'reviews',
  /* 自分のデータは持たない（共通データを読む） */
  seed: () => ({}),
  queries: {
    /** 一覧：検索条件で絞り込み、並べ替えた全件（ページ送りは画面で） */
    list: (repo, args: Partial<ReviewSearch> | null) => searchRows(rowsOf(repo), args ?? {}),
    /** 詳細（id＝注文番号。内部のキーでも引ける） */
    detail: (repo, args: { id: string }) => rowsOf(repo).find((r) => r.order === args.id || r.id === args.id) ?? null,
    /** 検索の選択肢：法人（拠点つき）・評価タグ（不満／満足） */
    options: (repo) => {
      const t = app.queries.reviewTags(repo);
      const users = app.queries.users(repo).map((u) => userOf(repo, u));
      return { companies: companiesOf(repo, users.filter((u) => app.queries.reviews(repo).some((x) => x.userId === u.id))), ng: t.ng, ok: t.ok };
    },
    /** CSV：1行＝1商品・検索条件に一致する全件。reviews＝投稿の件数 */
    csv: (repo, args: Partial<ReviewSearch> | null) => {
      const rows = searchRows(rowsOf(repo), args ?? {});
      return { head: CSV_HEAD, rows: csvRows(rows), reviews: rows.length };
    },
  },
  actions: {},
});
