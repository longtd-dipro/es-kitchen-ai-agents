import { body, handle } from '@/lib/server/http';
import { addComment, listComments, preflight, requireReviewEnabled, withCors, type ReviewComment } from '@/lib/server/review';

/* 画面ごとのコメント（lib/server/review.ts）。GET 一覧／POST 追加 */
export const GET = async () => withCors(await handle(() => { requireReviewEnabled(); return listComments(); }));

export async function POST(req: Request) {
  const input = await body<Partial<ReviewComment>>(req);
  return withCors(await handle(() => { requireReviewEnabled(); return addComment(input); }));
}

export const OPTIONS = preflight;
