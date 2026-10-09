import { ApiError } from '@/lib/api/errors';
import { DEMO } from '@/lib/demo';
import { resetDb } from '@/lib/server/db';
import { handle } from '@/lib/server/http';

/* 開発用：共通 DB を見本データに戻す。本番のビルド（デモ以外）では使えない（権限なしで全データが消えるため） */
export const POST = () =>
  handle(() => {
    if (process.env.NODE_ENV === 'production' && !DEMO) throw new ApiError('開発・デモのビルドだけで使えます', 404);
    return resetDb();
  });
