/*
 * 日付の「表示」と「入力」の共通ルール（全サイト共通・決定 8-1）。
 *   日付     → yyyy-mm-dd        例：2026-11-01
 *   日時     → yyyy-mm-dd HH:mm  例：2026-11-01 09:30
 *   年月     → yyyy-mm           例：2026-12
 * 保存しているデータ・domain の形（'YYYY/MM/DD'・サイクル月 'YYYY-MM' など）は変えない。
 * 画面に出すときにここで変換し、入力欄から受け取るときに元の形へ戻す。
 * ID（202612・DL-261002-0001・INV-2026100001 など）は日付ではないので変換しない
 * （区切り「/」「-」「年月日」のない数字は日付として扱わない）。
 */

const pad = (n: number | string) => String(n).padStart(2, '0');
const WD = '日月火水木金土';

type DateLike = string | Date | null | undefined;

/* 文字の全体が日付・日時・年月か（前後の空白は許す） */
const RE_DATE = /^(\d{4})\s*[/\-年]\s*(\d{1,2})\s*[/\-月]\s*(\d{1,2})\s*日?$/;
const RE_DT = /^(\d{4})\s*[/\-年]\s*(\d{1,2})\s*[/\-月]\s*(\d{1,2})\s*日?(?:\s+|T)(\d{1,2}):(\d{2})(?::\d{2}(?:\.\d+)?)?(Z|[+-]\d{2}:?\d{2})?$/;
const RE_YM = /^(\d{4})\s*(?:[/\-]\s*(\d{1,2})|年\s*(\d{1,2})\s*月)$/;

const okYmd = (y: number, m: number, d: number) => {
  if (m < 1 || m > 12 || d < 1 || d > 31) return false;
  const t = new Date(Date.UTC(y, m - 1, d));
  return t.getUTCMonth() === m - 1 && t.getUTCDate() === d;
};

const ofDate = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const ofTime = (d: Date) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;

/** 日付の文字（YYYY/MM/DD・YYYY-M-D・YYYY年M月D日 など）か Date → 'yyyy-mm-dd'。日付でなければ '' */
export function isoDate(v: DateLike): string {
  if (v == null || v === '') return '';
  if (v instanceof Date) return Number.isNaN(v.getTime()) ? '' : ofDate(v);
  const s = String(v).trim();
  const m = RE_DATE.exec(s) ?? RE_DT.exec(s);
  if (!m) return '';
  if (m[6]) { const d = new Date(s); return Number.isNaN(d.getTime()) ? '' : ofDate(d); } // タイムゾーン付きはこの端末の時刻で
  return okYmd(+m[1], +m[2], +m[3]) ? `${m[1]}-${pad(m[2])}-${pad(m[3])}` : '';
}

/** 年月の文字（YYYY-MM・YYYY/M・YYYY年M月・日付）→ 'yyyy-mm'。年月でなければ '' */
export function isoYm(v: DateLike): string {
  if (v == null || v === '') return '';
  if (v instanceof Date) return isoDate(v).slice(0, 7);
  const s = String(v).trim();
  const m = RE_YM.exec(s);
  if (m) { const mo = +(m[2] ?? m[3]); return mo >= 1 && mo <= 12 ? `${m[1]}-${pad(mo)}` : ''; }
  return isoDate(s).slice(0, 7);
}

/** 表示用の日付 'yyyy-mm-dd'。日付として読めないときは元の文字のまま（'—' などを壊さない） */
export function fmtDate(v: DateLike): string {
  if (v == null) return '';
  return isoDate(v) || (v instanceof Date ? '' : String(v));
}

/** 表示用の日時 'yyyy-mm-dd HH:mm'（秒は出さない）。時刻がなければ日付だけ。読めないときは元の文字のまま */
export function fmtDateTime(v: DateLike): string {
  if (v == null) return '';
  if (v instanceof Date) return Number.isNaN(v.getTime()) ? '' : `${ofDate(v)} ${ofTime(v)}`;
  const s = String(v).trim();
  const m = RE_DT.exec(s);
  if (m) {
    if (m[6]) { const d = new Date(s); return Number.isNaN(d.getTime()) ? s : `${ofDate(d)} ${ofTime(d)}`; }
    return okYmd(+m[1], +m[2], +m[3]) ? `${m[1]}-${pad(m[2])}-${pad(m[3])} ${pad(m[4])}:${m[5]}` : s;
  }
  return fmtDate(s);
}

/** 表示用の年月 'yyyy-mm'。読めないときは元の文字のまま */
export function fmtYm(v: DateLike): string {
  if (v == null) return '';
  return isoYm(v) || (v instanceof Date ? '' : String(v));
}

/** 曜日（日〜土）。日付でなければ '' */
export function wdOf(v: DateLike): string {
  const s = isoDate(v);
  if (!s) return '';
  return WD[new Date(Date.UTC(+s.slice(0, 4), +s.slice(5, 7) - 1, +s.slice(8, 10))).getUTCDay()];
}

/** 'yyyy-mm-dd（火）' */
export function fmtDateW(v: DateLike): string {
  const s = isoDate(v);
  return s ? `${s}（${wdOf(s)}）` : fmtDate(v);
}

/** 狭い所（カレンダー・カード）向けの短い日付 'mm-dd'（年なし） */
export function fmtMd(v: DateLike): string {
  const s = isoDate(v);
  return s ? s.slice(5) : fmtDate(v);
}

/** 'mm-dd（火）' */
export function fmtMdW(v: DateLike): string {
  const s = isoDate(v);
  return s ? `${s.slice(5)}（${wdOf(s)}）` : fmtDate(v);
}

/**
 * 文字の全体が日時・日付・年月なら表示の形にする（うしろの「（火）」などはそのまま残す）。それ以外はそのまま。
 * 汎用の表のセルなど、何が入っているか決まっていない所で使う。
 */
export function fmtAuto(v: unknown): string {
  if (v == null) return '';
  const s = String(v);
  const m = /^(.*?)(\s*[（(][日月火水木金土][）)])?$/.exec(s);
  const body = (m?.[1] ?? s).trim(), tail = m?.[2] ?? '';
  if (RE_DT.test(body)) return fmtDateTime(body) + tail;
  if (RE_DATE.test(body)) { const d = isoDate(body); return d ? d + tail : s; }
  if (RE_YM.test(body)) { const y = isoYm(body); return y ? y + tail : s; }
  return s;
}

/**
 * 文の中の日付（YYYY/MM/DD[ HH:mm]・YYYY年M月D日・YYYY年M月）を表示の形にする。
 * ID のような区切りのない数字は変えない。
 */
export function fmtDatesIn(text: string | null | undefined): string {
  if (!text) return text ?? '';
  const whole = fmtAuto(text);
  if (whole !== text) return whole; // 全体が日付・日時・年月
  return text
    /* 期間 'YYYY/MM/DD〜MM/DD'：うしろの年なしの日付も 'MM-DD' にそろえる */
    .replace(/(?<![\d/\-])(\d{4})\/(\d{1,2})\/(\d{1,2})(\s*[〜～~]\s*)(\d{1,2})\/(\d{1,2})(?![\d/])/g, (all, y, mo, d, sep, mo2, d2) =>
      okYmd(+y, +mo, +d) ? `${y}-${pad(mo)}-${pad(d)}${sep}${pad(mo2)}-${pad(d2)}` : all)
    .replace(/(?<![\d/\-])(\d{4})[/年](\d{1,2})[/月](\d{1,2})日?(?:\s+(\d{1,2}):(\d{2})(?::\d{2})?)?(?![\d/])/g, (all, y, mo, d, h, mi) =>
      okYmd(+y, +mo, +d) ? `${y}-${pad(mo)}-${pad(d)}${h ? ` ${pad(h)}:${mi}` : ''}` : all)
    .replace(/(?<![\d/\-])(\d{4})年(\d{1,2})月(?!\d)/g, (all, y, mo) => (+mo >= 1 && +mo <= 12 ? `${y}-${pad(mo)}` : all));
}

/* ---------- 入力欄 ---------- */

/** 入力された文字（yyyy-mm-dd・yyyy/m/d・yyyymmdd）→ 'yyyy-mm-dd'。読めなければ null（空なら ''） */
export function parseDateInput(text: string): string | null {
  const s = text.trim();
  if (!s) return '';
  const m = /^(\d{4})(\d{2})(\d{2})$/.exec(s);
  if (m) return okYmd(+m[1], +m[2], +m[3]) ? `${m[1]}-${m[2]}-${m[3]}` : null;
  return RE_DATE.test(s) ? isoDate(s) || null : null;
}

/** 入力された文字（yyyy-mm・yyyy/m・yyyymm）→ 'yyyy-mm'。読めなければ null（空なら ''） */
export function parseYmInput(text: string): string | null {
  const s = text.trim();
  if (!s) return '';
  const m = /^(\d{4})(\d{2})$/.exec(s);
  if (m) return +m[2] >= 1 && +m[2] <= 12 ? `${m[1]}-${m[2]}` : null;
  return RE_YM.test(s) ? isoYm(s) || null : null;
}

/** 'yyyy-mm-dd' → domain の 'YYYY/MM/DD'（空はそのまま） */
export const toSlash = (iso: string) => (iso ? iso.replace(/-/g, '/') : '');
/** 'YYYY/MM/DD'（など）→ 入力欄の値 'yyyy-mm-dd'（読めなければ ''） */
export const toInput = (v: DateLike) => isoDate(v);

/** 表示部品（読み取り専用の欄・表のセル）用：文字なら fmtAuto、それ以外（要素・数値）はそのまま */
export function fmtAutoNode<T>(v: T): T | string {
  return typeof v === 'string' ? fmtAuto(v) : v;
}

/** 自由入力の欄で「-」区切りの日付・日時・年月が入力されたら、保存の形（「/」区切り）にする。それ以外は入力のまま */
export function toSlashIfDate(text: string): string {
  const m = /^(\d{4})-(\d{1,2})(?:-(\d{1,2}))?(\s+\d{1,2}:\d{2})?$/.exec(text.trim());
  if (!m) return text;
  return `${m[1]}/${m[2]}${m[3] ? '/' + m[3] : ''}${m[4] ?? ''}`;
}

/**
 * 自由入力の欄で、表示を fmtAuto にしたときの戻し方：
 * もとの値が「/」区切りの日付・日時・年月なら、「-」区切りの入力を「/」区切りに戻す。それ以外は入力のまま。
 */
export function backToStored(text: string, stored: string | null | undefined): string {
  return stored && /^\d{4}\/\d{1,2}/.test(stored) ? toSlashIfDate(text) : text;
}

/** 文の表示部品（読み取り専用の文・注記）用：文字なら fmtDatesIn、それ以外はそのまま */
export function fmtTextNode<T>(v: T): T | string {
  return typeof v === 'string' ? fmtDatesIn(v) : v;
}
