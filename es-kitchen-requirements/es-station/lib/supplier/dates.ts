import { fmtYm } from '@/lib/format/date';
/* 日付は全体で 'YYYY/MM/DD' の文字列で持つ（文字列の大小で前後を比べられる） */

export const WD = ['日', '月', '火', '水', '木', '金', '土'];
/** カレンダーは月曜始まり（全サイト共通の CalendarGrid） */
export const WD_M = ['月', '火', '水', '木', '金', '土', '日'];

export const parseDate = (s: string) => {
  const [y, m, d] = s.split('/').map(Number);
  return new Date(y, m - 1, d, 12);
};
export const formatDate = (d: Date) =>
  `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;
export const addDays = (s: string, n: number) => {
  const d = parseDate(s);
  d.setDate(d.getDate() + n);
  return formatDate(d);
};
/** 'YYYY/MM/DD' → <input type="date"> の 'YYYY-MM-DD' */
export const toIso = (s: string | undefined) => (s ?? '').replace(/\//g, '-');
/** <input type="date"> の値 → 'YYYY/MM/DD' */
export const fromIso = (s: string) => s.replace(/-/g, '/');
export const ymOf = (s: string) => s.slice(0, 7).replace('/', '-');
/** 年月の表示 'yyyy-mm'（共通の表示ルール・決定 8-1） */
export const ymJa = (ym: string) => fmtYm(ym);
export const pad2 = (n: number) => String(n).padStart(2, '0');

/**
 * 今日（YYYY/MM/DD）。NEXT_PUBLIC_FIXED_TODAY があればその日に固定する
 * （モックの見本データは 2026/10/05 を今日として作ってあるので、開発中は .env.development で固定している）
 */
export function today(): string {
  return demoToday() || process.env.NEXT_PUBLIC_FIXED_TODAY || formatDate(new Date());
}

/*
 * デモの「今日」（DEMO 帯の日付で選んだ日・共通 DB の dm.demo.settings）。デモのビルド（NEXT_PUBLIC_DEMO=1）のときだけ入る。
 * サーバーは API の前（lib/server/daily.ts）、画面は DemoToday（components/DemoToday.tsx）が入れる。
 * 同じプロセスの中のどのモジュールからも同じ値を見るよう globalThis に置く
 */
const G = globalThis as unknown as { __esDemoToday?: string };
export function demoToday(): string {
  return G.__esDemoToday ?? '';
}
/** デモの「今日」を入れる（'' で外す＝NEXT_PUBLIC_FIXED_TODAY・本当の今日に戻る） */
export function setDemoToday(d: string) {
  G.__esDemoToday = /^\d{4}\/\d{2}\/\d{2}$/.test(d) ? d : '';
}
/** いまの日時（YYYY/MM/DD HH:mm） */
export function nowStamp(): string {
  const d = new Date();
  return `${today()} ${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}
