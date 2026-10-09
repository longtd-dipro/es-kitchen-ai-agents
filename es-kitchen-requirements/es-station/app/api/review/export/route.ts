import { handle } from '@/lib/server/http';
import { commentsMarkdown, preflight, requireReviewEnabled, saveMarkdown, withCors } from '@/lib/server/review';

/*
 * 画面ごとのコメントを Markdown で。
 * GET  ?open=1 で未対応だけ。そのまま .md でダウンロード
 * POST プロジェクトの 00_確認してほしい/画面コメント_YYYYMMDD.md に置く（返り値はその場所）
 */
export async function GET(req: Request) {
  try {
    requireReviewEnabled();
    const md = commentsMarkdown(new URL(req.url).searchParams.get('open') === '1');
    return withCors(new Response(md, {
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent('画面コメント.md')}`,
      },
    }));
  } catch (e) {
    return withCors(await handle(() => { throw e; }));
  }
}

export const POST = async () => withCors(await handle(() => { requireReviewEnabled(); return { path: saveMarkdown() }; }));

export const OPTIONS = preflight;
