import { DEMO } from '@/lib/demo';
import { handle } from '@/lib/server/http';
import { service } from '@/lib/server/supplierRepo';
import { today } from '@/lib/supplier/dates';

/*
 * データの版。画面はこれを数秒ごとに見て、変わっていたら読み直す（ほかのタブ・サイトの変更を出すため）。
 * デモのビルドではデモの「今日」も返す（ほかのタブで DEMO 帯の日付を変えたとき・components/DemoToday.tsx）
 */
export const GET = () => handle(() => ({ version: service().version(), ...(DEMO ? { today: today() } : {}) }));
