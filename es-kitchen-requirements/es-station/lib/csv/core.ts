import { nowStamp } from '@/lib/supplier/dates';

/*
 * CSV の入出力の共通の決まり（00_確認してほしい/CSV入出力_定義_20261003.md・2026/10/03 決定）。画面とサーバーの両方で使う。
 *   出力：UTF-8（BOM あり）・CRLF・カンマ区切り（, " 改行 を含む値は "…"）、日付 yyyy-mm-dd・日時 yyyy-mm-dd HH:mm・年月 yyyy-mm、
 *         金額は円の整数（カンマ・円なし）、真偽は 1／0、複数の値は「;」でつなぐ
 *   取込：UTF-8（BOM あり・なし）だけ。空欄＝変えない、「-」＝消す（消してよい列だけ）。1ファイル 5,000行まで
 * 列の定義（エンティティごと）は lib/csv/*.ts、取込の確認・登録の仕組みは lib/domain/csv.ts。
 */

export const CSV_MAX_ROWS = 5000; // 1ファイルの行数の上限（見出しを除く。5,000行は通り、5,001行は E106）
/** 更新がこの数を超えたら、裏で少しずつ進める（進み具合を出す） */
export const CSV_BG_UPDATES = 100;
/** ファイル名の条件の部分の長さ（超えたら切って「ほか」） */
export const CSV_COND_MAX = 80;
/** 消すときに書く文字 */
export const CSV_CLEAR = '-';

export type CsvType = 'text' | 'int' | 'money' | 'num' | 'date' | 'datetime' | 'ym' | 'bool' | 'list';

/** 列の定義（出力の見出し・取込のテンプレートで同じ） */
export type CsvColSpec = {
  /** 見出し（画面の項目名と同じ日本語） */
  label: string;
  /** 昔の見出し（取込だけ受け付ける。見出しの言い換えのとき、古い CSV を読めるように） */
  alias?: string[];
  /** 見出しの後ろに【】で書く、この列の扱い（決定 28-183。例：空欄＝新規） */
  hint?: string;
  type?: CsvType;
  /** 取込で入れられない（出力だけの列。ID に対する名前・状態・作成日時など） */
  ro?: boolean;
  /** 新規のときに必須 */
  reqNew?: boolean;
  /** 「-」で消せる */
  clear?: boolean;
  /** 選べる値（マスタ・選択肢） */
  opts?: readonly string[];
  /** 取込だけ受け付ける値の言い換え（例：「路線」→「路線（中継あり）」）。出力は opts の値 */
  valueAlias?: Readonly<Record<string, string>>;
  /** 文字の最大の長さ */
  max?: number;
  /** 数の下限（金額は省くと 0） */
  min?: number;
  /** 数の上限 */
  maxNum?: number;
};

/** 見出しの文字（【】つき） */
export const headText = (c: Pick<CsvColSpec, 'label' | 'hint'>) => (c.hint ? `${c.label}【${c.hint}】` : c.label);
/** 見出しを比べるための形（【】・空白を外す） */
export const headKey = (h: string) => h.replace(/^﻿/, '').replace(/【[^】]*】/g, '').replace(/[\s　]+/g, '').trim();

/* ---------------- 出力 ---------------- */

const DATE = /^(\d{4})\/(\d{1,2})\/(\d{1,2})$/;
const DATETIME = /^(\d{4})\/(\d{1,2})\/(\d{1,2})[ T](\d{1,2}):(\d{2})(?::\d{2})?$/;
const YM = /^(\d{4})\/(\d{1,2})$/;
const p2 = (s: string) => s.padStart(2, '0');
/** 画面の金額の文字（1,000円・¥1,000・1,000）か */
const MONEY_TXT = /^-?[¥￥]?\s?-?[\d,]+(?:\.\d+)?\s?円?$/;

/** 1つの文字を CSV の決まりの形にする（日付の / → -・金額の文字 → 整数・「—」→ 空） */
export function normText(s: string, type?: CsvType): string {
  const t = s.trim();
  if (/^[—–－]+$/.test(t) || t === '-') return type === 'text' ? t : '';
  let m = DATETIME.exec(t);
  if (m) return `${m[1]}-${p2(m[2])}-${p2(m[3])} ${p2(m[4])}:${m[5]}`;
  m = DATE.exec(t);
  if (m) return `${m[1]}-${p2(m[2])}-${p2(m[3])}`;
  if (type === 'ym' || type === undefined) { m = YM.exec(t); if (m) return `${m[1]}-${p2(m[2])}`; }
  /* 画面の金額のマイナスは「−」（lib/format/money.ts）。CSV は「-」の整数にする */
  const tm = t.replace(/^[−－]/, '-');
  if ((type === 'money' || type === 'int' || type === 'num' || (type === undefined && /[,円¥￥]/.test(tm))) && MONEY_TXT.test(tm)) {
    const n = Number(tm.replace(/[¥￥,円\s]/g, ''));
    if (Number.isFinite(n)) return String(type === 'money' || type === 'int' ? Math.round(n) : n);
  }
  return s;
}

/** 値 → CSV の1セルの文字 */
export function cellText(v: unknown, type?: CsvType): string {
  if (v === null || v === undefined) return '';
  if (Array.isArray(v)) return v.map((x) => cellText(x)).filter((x) => x !== '').join(';');
  if (typeof v === 'boolean') return v ? '1' : '0';
  if (typeof v === 'number') {
    if (!Number.isFinite(v)) return '';
    return type === 'money' || type === 'int' ? String(Math.round(v)) : String(v);
  }
  if (typeof v === 'object') return Object.entries(v as Record<string, unknown>).map(([k, x]) => `${k}=${cellText(x)}`).join(';');
  return normText(String(v), type);
}

/**
 * 数式として読まれる文字（= + - @ ・タブ・CR）で始まる文字の セル は、先頭に「'」を付けて数式にしない（CSV インジェクション対策）。
 * 数・日付（-5・2026-10）と、「-」だけ（消す印）は付けない。取込は「'」＋この文字の並びだけ「'」を外す（unneutral）
 */
const FORMULA = /^[=+\-@\t\r]/;
const PLAIN_NUM = /^[-+]?\d+(?:\.\d+)?$/;
export const neutralize = (s: string) => (FORMULA.test(s) && s !== '-' && !PLAIN_NUM.test(s) ? `'${s}` : s);
/** 出力で付けた「'」を外す（「'」の次が = + - @ タブ CR のときだけ） */
export const unneutral = (s: string) => (/^'[=+\-@\t\r]/.test(s) ? s.slice(1) : s);

const quote = (s: string) => (/[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s);
/** 行 → CSV の文字（BOM・CRLF） */
export function toCsv(rows: string[][]): string {
  return '﻿' + rows.map((r) => r.map((c) => quote(neutralize(c))).join(',')).join('\r\n') + '\r\n';
}

/** 出力の条件（画面の検索条件。値が空のものは使わない） */
export type CsvFilter = { label: string; value: string };

/** いまの日時（yyyymmdd-HHmm。見本の「今日」に合わせる） */
export function fileStamp(at = nowStamp()) {
  const m = /^(\d{4})\/(\d{2})\/(\d{2}) (\d{2}):(\d{2})/.exec(at);
  return m ? `${m[1]}${m[2]}${m[3]}-${m[4]}${m[5]}` : at.replace(/\D/g, '').slice(0, 12);
}

/** 出力の条件の文字（項目-値_項目-値。なし＝全件） */
export function condText(filters: CsvFilter[]) {
  return filters.filter((f) => f.value !== '' && f.value !== undefined && f.value !== null).map((f) => `${f.label}-${normText(String(f.value))}`).join('_') || '全件';
}

/**
 * ファイル名：<画面名>_<条件>_<yyyymmdd-HHmm>.csv（1-2）。条件は「項目-値」を _ でつなぐ・なければ「全件」、
 * 80文字を超えたら切って「ほか」（全部の条件は出力の記録に残す）。ファイル名に使えない文字は -
 */
export function csvFileName(screen: string, filters: CsvFilter[], at?: string) {
  const bad = /[/\\:*?"<>|\r\n\t]/g;
  let cond = condText(filters).replace(bad, '-');
  if (cond.length > CSV_COND_MAX) cond = cond.slice(0, CSV_COND_MAX) + 'ほか';
  return `${screen.replace(bad, '-')}_${cond}_${fileStamp(at)}.csv`;
}

/* ---------------- 取込 ---------------- */

/** ファイルの中身（バイト）→ 文字。UTF-8 でなければ null（BOM は外す） */
export function decodeUtf8(buf: ArrayBuffer | Uint8Array): string | null {
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(buf).replace(/^﻿/, '');
  } catch {
    return null;
  }
}

/** CSV の1行（line＝ファイルの何行目から始まるか。1 が見出し） */
export type CsvLine = { line: number; cells: string[] };

/** CSV の文字 → 行（"…" の中のカンマ・改行・"" に対応。空の行は飛ばす） */
export function parseCsv(text: string): CsvLine[] {
  const s = text.replace(/^﻿/, '');
  const out: CsvLine[] = [];
  let row: string[] = [], cell = '', q = false, line = 1, start = 1;
  const end = () => {
    row.push(cell);
    if (row.some((c) => c.trim() !== '')) out.push({ line: start, cells: row });
    row = []; cell = '';
  };
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (q) {
      if (c === '"' && s[i + 1] === '"') { cell += '"'; i++; }
      else if (c === '"') q = false;
      else { if (c === '\n') line++; cell += c; }
    } else if (c === '"') q = true;
    else if (c === ',') { row.push(cell); cell = ''; }
    else if (c === '\r' || c === '\n') {
      if (c === '\r' && s[i + 1] === '\n') i++;
      end();
      line++; start = line;
    } else cell += c;
  }
  if (cell !== '' || row.length) end();
  return out;
}

/** 1セルを読んだ結果：keep＝空欄（変えない）、clear＝「-」（消す）、set＝値、err＝形の間違い */
export type Parsed = { k: 'keep' } | { k: 'clear' } | { k: 'set'; v: unknown } | { k: 'err'; msg: string };

const realDate = (y: number, m: number, d: number) => {
  const x = new Date(y, m - 1, d);
  return x.getFullYear() === y && x.getMonth() === m - 1 && x.getDate() === d;
};

/**
 * 1セルを列の型で読む。日付は共通データの形（YYYY/MM/DD・YYYY/MM/DD HH:mm）、年月は YYYY-MM にして返す。
 * 金額・整数は「1,000」「1000円」も受け付ける（出力は整数だけ）
 */
export function parseCell(raw: string, c: CsvColSpec): Parsed {
  const t0 = (raw ?? '').trim();
  /* 出力が数式にならないよう付けた「'」は外す（数・日付の列には付かない） */
  const t = !c.type || c.type === 'text' || c.type === 'list' ? unneutral(t0) : t0;
  if (t === '') return { k: 'keep' };
  if (t === CSV_CLEAR) return c.clear ? { k: 'clear' } : { k: 'err', msg: '「-」（消す）はこの列では使えません' };
  const err = (msg: string): Parsed => ({ k: 'err', msg });
  switch (c.type ?? 'text') {
    case 'int': case 'money': case 'num': {
      const s = t.replace(/[,円¥￥\s]/g, '');
      const n = Number(s);
      if (s === '' || !Number.isFinite(n)) return err(`数で入れてください（${t}）`);
      if ((c.type === 'int' || c.type === 'money') && !Number.isInteger(n)) return err(`整数で入れてください（${t}）`);
      const min = c.min ?? (c.type === 'money' || c.type === 'int' ? 0 : undefined);
      if (min !== undefined && n < min) return err(`${min} 以上にしてください（${t}）`);
      if (c.maxNum !== undefined && n > c.maxNum) return err(`${c.maxNum} 以下にしてください（${t}）`);
      return { k: 'set', v: n };
    }
    case 'date': {
      const m = /^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/.exec(t);
      if (!m || !realDate(+m[1], +m[2], +m[3])) return err(`日付は yyyy-mm-dd で入れてください（${t}）`);
      return { k: 'set', v: `${m[1]}/${p2(m[2])}/${p2(m[3])}` };
    }
    case 'datetime': {
      const m = /^(\d{4})[-/](\d{1,2})[-/](\d{1,2})[ T](\d{1,2}):(\d{2})$/.exec(t);
      if (!m || !realDate(+m[1], +m[2], +m[3]) || +m[4] > 23) return err(`日時は yyyy-mm-dd HH:mm で入れてください（${t}）`);
      return { k: 'set', v: `${m[1]}/${p2(m[2])}/${p2(m[3])} ${p2(m[4])}:${m[5]}` };
    }
    case 'ym': {
      const m = /^(\d{4})[-/](\d{1,2})$/.exec(t);
      if (!m || +m[2] < 1 || +m[2] > 12) return err(`年月は yyyy-mm で入れてください（${t}）`);
      return { k: 'set', v: `${m[1]}-${p2(m[2])}` };
    }
    case 'bool': {
      if (['1', 'TRUE', 'true'].includes(t)) return { k: 'set', v: true };
      if (['0', 'FALSE', 'false'].includes(t)) return { k: 'set', v: false };
      return err(`1 か 0 で入れてください（${t}）`);
    }
    case 'list': {
      const xs = t.split(/[;；]/).map((x) => x.trim()).filter(Boolean);
      const bad = c.opts ? xs.filter((x) => !c.opts!.includes(x)) : [];
      if (bad.length) return err(`マスタにない値です（${bad.join('・')}）`);
      return { k: 'set', v: [...new Set(xs)] };
    }
    default: {
      if (c.max !== undefined && t.length > c.max) return err(`${c.max}文字以内にしてください（${t.length}文字）`);
      const tv = c.valueAlias?.[t] ?? t;
      if (c.opts && !c.opts.includes(tv)) return err(`選べる値ではありません（${t}）。選べる値：${c.opts.slice(0, 12).join('・')}${c.opts.length > 12 ? '…' : ''}`);
      return { k: 'set', v: tv };
    }
  }
}

/** 見出しの行を列の定義と合わせる：列の番号・足りない列・知らない列 */
export function matchHeader(head: string[], cols: CsvColSpec[], required: string[]) {
  const keys = head.map(headKey);
  const at = new Map<string, number>();
  const unknown: string[] = [];
  const dup: string[] = [];
  keys.forEach((k, i) => {
    if (!k) return;
    const c = cols.find((x) => headKey(x.label) === k || x.alias?.some((y) => headKey(y) === k));
    if (!c) unknown.push(head[i].trim());
    else if (at.has(c.label)) dup.push(c.label);
    else at.set(c.label, i);
  });
  const missing = required.filter((l) => !at.has(l));
  return { at, unknown, missing, dup };
}
