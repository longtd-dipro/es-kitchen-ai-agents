import { ApiError } from '@/lib/api/errors';
import { PASSWORD_RULE, passwordValid } from '@/lib/auth/rules';
import { body, handle } from '@/lib/server/http';

/* 見本では保存しない（本番は Cognito）。パスワードの形だけ確かめる */
export const POST = (req: Request) =>
  handle(async () => {
    const { password } = await body<{ password?: string }>(req);
    if (!passwordValid(password)) throw new ApiError(`パスワードは${PASSWORD_RULE}`, 400);
  });

