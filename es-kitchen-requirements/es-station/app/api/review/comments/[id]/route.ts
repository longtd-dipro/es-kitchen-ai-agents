import { body, handle } from '@/lib/server/http';
import { deleteComment, preflight, requireReviewEnabled, updateComment, withCors, type ReviewComment } from '@/lib/server/review';

/* 画面ごとのコメント。PATCH 本文・状態（open／done）の変更／DELETE 削除 */
type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Ctx) {
  const { id } = await params;
  const input = await body<Partial<ReviewComment>>(req);
  return withCors(await handle(() => { requireReviewEnabled(); return updateComment(Number(id), input); }));
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const { id } = await params;
  return withCors(await handle(() => { requireReviewEnabled(); deleteComment(Number(id)); }));
}

export const OPTIONS = preflight;
