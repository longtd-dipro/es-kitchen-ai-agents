/*
 * 請求の締め月と設定（15_運営_請求.html の seed() の値）。
 * 法人・拠点・請求書・在庫などの事実は共通データ（lib/domain・dm.*）から読む（fromDomain.ts）。
 */
import type { Meta } from './types';

/* boFailOnce＝デモの見本（大阪キッチン CU00003 あての1回目の送信エラー。NEXT_PUBLIC_DEMO なしでもデモの手順で見せる。M4） */
export const META: Meta = { month: '2026-10', cfg: { penalty: 3000, wasteTh: 3, boFailOnce: ['CU00003'] } };
