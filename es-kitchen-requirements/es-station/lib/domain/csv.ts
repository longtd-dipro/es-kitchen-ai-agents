import { ApiError } from '@/lib/api/errors';
import { nowStamp } from '@/lib/supplier/dates';
import type { DocRepo } from '@/lib/ops/core/area';
import {
  cellText, CSV_BG_UPDATES, CSV_MAX_ROWS, headText, matchHeader, parseCell, parseCsv,
  type CsvColSpec, type CsvFilter, type CsvLine, type Parsed,
} from '@/lib/csv/core';

/*
 * CSV取込・CSV出力の仕組み（00_確認してほしい/CSV入出力_定義_20261003.md）。エンティティ（商品・倉庫・受注の回答…）の列と保存のしかたは lib/csv/*.ts。
 *
 *   取込は2段階：importPreview（確かめるだけ・何も保存しない）→ importCommit（もう一度確かめてから全部を保存）
 *     - キーが一致すれば上書き、空欄なら新規（決定 28-183。NEW/UPDATE/DELETE の列はない）。キーがあって見つからない＝エラー。
 *       子の表（1つの商品の仕入先など）はキーをくり返した行。新規で子の表があるときは仮キー（「新規1」など）で行をまとめる
 *     - 空欄＝変えない、「-」＝消す（消してよい列だけ）。消すのは画面の削除だけ（【削除】の列があるものを除く）
 *     - 業務の確かめは画面の保存と同じ関数を通す：保存の関数を「上に重ねた DocRepo（overlay）」で動かし、エラーをその行のエラーにする
 *     - エラーの行は取り込まず、ほかの行を保存する（エラー一覧CSV を出せる。hong 2026/10/05。旧：1行でもエラーなら何も保存しない）。警告は「警告を確認しました」が要る
 *     - 更新が 100件を超えたら裏で少しずつ書く（dm.csv.jobs・jobStep で進める）
 *     - 取込の記録（dm.csv.imports）・レコードごとの変更履歴「CSV取込で更新」（dm.csv.changes）
 *   出力は画面の検索条件のとおり全件。出力の記録（dm.csv.exports）
 */

/** 裏の取込を1回で進める件数 */
const STEP = 500;

export const K = {
  previews: 'dm.csv.previews',
  jobs: 'dm.csv.jobs',
  /** 裏の取込の書く内容を STEP 個ずつに分けたもの（1つの文書に全部を入れると、進めるたびに全部を読み書きして遅くなる） */
  jobOps: 'dm.csv.jobOps',
  imports: 'dm.csv.imports',
  exports: 'dm.csv.exports',
  changes: 'dm.csv.changes',
} as const;

/** 誰が・どのサイトから（見てよい範囲・取込先のメニューなど） */
export type CsvScope = {
  site: 'ops' | 'corp' | 'supplier' | 'carrier';
  carrierId?: string; supplierId?: string; corpId?: string; branchId?: string;
  /** 取込先（月間メニューのサイクル月・お知らせの配信対象の区分など） */
  target?: string;
  /** 取込のオプション（月間メニューの法人への再通知など） */
  opts?: Record<string, boolean>;
};
export type Ctx = { r: DocRepo; scope: CsvScope; by: string; at: string };

/** エンティティの列。get＝出力の値（親の項目）、cget＝子の表の項目、put＝取込の値を下書きに入れる（undefined＝消す） */
export type EntityCol<R, D> = CsvColSpec & {
  get?: (rec: R, x: Ctx) => unknown;
  /** 子の表の列（1行＝子の1件） */
  child?: boolean;
  cget?: (item: never, rec: R, x: Ctx) => unknown;
  put?: (draft: D, v: unknown, x: Ctx) => void;
  /** ほかのレコードと同じ値にできない（JAN・メールなど） */
  unique?: boolean;
  /** 選べる値（マスタから。取込のときに読む） */
  optsOf?: (x: Ctx) => readonly string[];
  /** 新規・更新のどちらでも必須（適用開始など） */
  reqAlways?: boolean;
};

/** 列がわかっている取込のエラー（確認の表の「列名」に出す） */
export class CsvColError extends Error {
  constructor(public col: string, msg: string) { super(msg); }
}

export type RowError = { line: number; col: string; msg: string };
export type RowResult = {
  line: number; lines: number[]; key: string; name: string;
  action: '新規' | '更新' | '変更なし' | '対象外' | 'エラー';
  errors: RowError[]; warnings: string[]; diff: { col: string; before: string; after: string }[];
  /** 対象外（取り込まない行・エラーではない）の理由 */
  reason?: string;
};

/** 保存のあと、画面（呼んだ側）がすること（仕入先サイトの回答の API・発注を入荷済にする など） */
export type FollowUp = { kind: string; payload: unknown };

export type CsvEntity<R = any, D = any> = {
  id: string;
  /** 画面名（ファイル名・記録） */
  screen: string;
  /** キーの列の見出し（例 品番） */
  key: string;
  /** 2つ以上の列でキーにする（親契約番号＋適用開始など）。keyOf は「|」でつないだ値を返す */
  keyCols?: string[];
  cols: EntityCol<R, D>[];
  /** 取込で使わない（出力だけ）。取込のボタンがない画面 */
  exportOnly?: boolean;
  /** 法人一覧・拠点一覧の CSV取込（更新だけ・共通メッセージ E100〜E116）。subject＝法人／拠点 */
  listCsv?: { subject: string };
  /** ファイル全体のエラー（E106・E107・E113）を更新だけの取込と同じ文言にする（新規申込CSV取込。listCsv の行の決まりは使わない） */
  strictFile?: true;
  /** 新規を作れるか（文字＝作れない理由） */
  create?: true | string;
  /** 見てよい範囲の全件（出力・キーで探す） */
  list: (x: Ctx) => R[];
  keyOf: (rec: R) => string;
  nameOf?: (rec: R) => string;
  find?: (x: Ctx, key: string) => R | undefined;
  /** 保存したあとの1件の読み直し（重ねた DocRepo から1件だけ作る。なければ list を作り直す＝件数が多いと遅い）。find と違い、取込の最初の突合（元のデータ）には使わない */
  refind?: (x: Ctx, key: string) => R | undefined;
  /** 1行の保存がほかの行のレコードを変えない（法人・拠点）。true なら、行ごとに「前の行で変わったあとの今」を読み直さない（読み直しは件数に比例して重い） */
  independent?: true;
  /** 子の表（キーをくり返した行で出す） */
  children?: (rec: R, x: Ctx) => unknown[];
  /** 取込：下書き（いまのレコード／新規） */
  draftOf?: (rec: R, x: Ctx) => D;
  newDraft?: (x: Ctx) => D;
  /** 取込：子の表の行（その行に子の列が1つでも書いてあれば呼ぶ） */
  childPut?: (draft: D, items: Map<string, Parsed>[], x: Ctx) => void;
  /** unique の列で重複を数えない記録（例：削除済の商品の JAN は新しい商品で使える） */
  uniqSkip?: (rec: R) => boolean;
  /** 取込：保存（画面の保存と同じ関数を呼ぶ）。返り値＝保存したレコードのキー */
  save?: (x: Ctx, draft: D, cur: R | undefined) => string | void | { key?: string; follow?: FollowUp };
  /** 変えられないレコード（確定・請求済・出荷指示済など）の理由 */
  locked?: (rec: R, x: Ctx) => string | null;
  /** find が返した「まだ無い」行（キーの列をそのまま書けるように空で返したもの）。true なら変更の有無を比べず新規として保存する */
  fresh?: (rec: R) => boolean;
  warn?: (before: R | undefined, after: R | undefined, x: Ctx) => string[];
  /** 確認の画面に出す、あとの流れへの影響の説明 */
  impact?: string[];
  /** テンプレートの記入例（列の見出し → 値） */
  sample?: (x: Ctx) => Record<string, string>[];
  /** 独自の形の CSV（プランマスタ・月間メニュー・お知らせの配信対象・受注の回答） */
  custom?: {
    head: () => string[];
    /** なければならない列（省くと全部） */
    required?: string[];
    template?: (x: Ctx) => string[][];
    exportRows?: (x: Ctx) => string[][];
    /** 確かめる（x.r は重ねた DocRepo。書いてよい）。value＝画面に返す値（配信対象の ID など） */
    run: (x: Ctx, text: string, lines: CsvLine[]) => { fileErrors?: string[]; rows: RowResult[]; follow?: FollowUp[]; value?: unknown };
  };
};

/* ===================================================================== */
/* 重ねた DocRepo（確かめるときに保存の関数を動かす。あとでまとめて書く） */
/* ===================================================================== */

type Op = { op: 'put'; kind: string; id: string; data: unknown } | { op: 'remove'; kind: string; id: string };
const DEL = Symbol('del');
const clone = <T,>(x: T): T => (x === undefined ? x : JSON.parse(JSON.stringify(x)));
/** 文書の ID（運営の一覧の行は _uid） */
const docId = (x: unknown) => {
  const o = x as { _uid?: unknown; id?: unknown } | null;
  return typeof o?._uid === 'string' ? o._uid : o?.id != null ? String(o.id) : undefined;
};

/**
 * 重ねた DocRepo。put・remove は重ねた側にだけ残し（journal に記録）、読むときは base と重ねた分を合わせて返す。
 * 5,000行の取込でも遅くならないように（受付簿 #236 の上限）：
 *   - 保存の関数は1行ごとに list() を何度も呼ぶ。以前は呼ぶたびに重ねた分の全件を JSON で複製し、base を読み直し、全件を突き合わせていて、行数の2乗の時間とメモリになった。
 *     いまは put のときに1回だけ複製して置き、list() は種類ごとの「合わせた表」（ID → 文書）から並べるだけにする。
 *     list() は複製しない（メモリの DocRepo と同じく、返した行は書き換えない約束）。get() は1件だけ複製する。
 *   - frozenBase＝base はこの重ねの寿命の間は変わらない（いちばん下の base＝本物の DB）。base.list の結果を種類ごとに1回だけ読む（SQLite は呼ぶたびに JSON を読み直すため）
 *   - mark()／rollback(m)＝1行の保存を試して、エラー・変更なしのときにその間の書き込みを取り消す（行ごとに重ねを作り直さない）
 */
export function overlayRepo(base: DocRepo, opts?: { frozenBase?: boolean }) {
  const mem = new Map<string, Map<string, unknown>>();
  const journal: Op[] = [];
  /** 取り消し用：書く前の値（ABSENT＝重ねになかった） */
  const ABSENT = Symbol('absent');
  const undo: { kind: string; id: string; prev: unknown }[] = [];
  const m = (kind: string) => mem.get(kind) ?? mem.set(kind, new Map()).get(kind)!;
  const baseCache = new Map<string, unknown[]>();
  const baseList = <T,>(kind: string): T[] => {
    if (!opts?.frozenBase) return base.list<T>(kind);
    let rows = baseCache.get(kind);
    if (!rows) baseCache.set(kind, (rows = base.list<unknown>(kind)));
    return rows as T[];
  };
  /** base にその ID の文書があるか（frozenBase のときは結果を覚える。「無い」も覚えないと、新しい行の数だけ毎回 DB へ聞きに行く） */
  const hasMemo = new Map<string, Map<string, boolean>>();
  const inBase = (kind: string, id: string) => {
    if (!opts?.frozenBase) return base.get(kind, id) !== undefined;
    let h = hasMemo.get(kind);
    if (!h) hasMemo.set(kind, (h = new Map()));
    let v = h.get(id);
    if (v === undefined) h.set(id, (v = base.get(kind, id) !== undefined));
    return v;
  };
  /** 合わせた表（ID → 文書。入れた順）。list() を最初に呼んだ種類だけ作り、そのあとの put・remove で直す */
  const views = new Map<string, Map<string, unknown>>();
  /** 合わせた表を作ったときに base にあった ID（消したあとに同じ ID を入れ直したとき、表に戻すため） */
  const viewBase = new Map<string, Set<string>>();
  const viewOf = (kind: string) => {
    let v = views.get(kind);
    if (v) return v;
    v = new Map<string, unknown>();
    const ov = mem.get(kind);
    let i = 0;
    const ids = new Set<string>();
    viewBase.set(kind, ids);
    for (const x of baseList<unknown>(kind)) {
      const id = docId(x);
      if (id === undefined) { v.set(`\u0000${i++}`, x); continue; }
      ids.add(id);
      if (ov?.has(id)) { const o = ov.get(id); if (o !== DEL) v.set(id, o); } else v.set(id, x);
    }
    if (ov) for (const [id, o] of ov) if (!v.has(id) && o !== DEL && !inBase(kind, id)) v.set(id, o);
    views.set(kind, v);
    return v;
  };
  const write = (kind: string, id: string, value: unknown) => {
    const ov = m(kind);
    undo.push({ kind, id, prev: ov.has(id) ? ov.get(id) : ABSENT });
    ov.set(id, value);
    const v = views.get(kind);
    if (v) { if (value === DEL) v.delete(id); else if (v.has(id) || viewBase.get(kind)?.has(id) || !inBase(kind, id)) v.set(id, value); }
  };
  const repo: DocRepo & { journal: Op[]; merge(o: Op[]): void; mark(): { j: number; u: number }; rollback(k: { j: number; u: number }): void; release(k: { j: number; u: number }): void } = {
    journal,
    list<T>(kind: string): T[] {
      if (!mem.get(kind)?.size && !views.has(kind)) { const rows = baseList<T>(kind); return opts?.frozenBase ? rows.slice() : rows; }
      return [...viewOf(kind).values()] as T[];
    },
    get<T>(kind: string, id: string): T | undefined {
      const ov = mem.get(kind);
      if (ov?.has(id)) { const v = ov.get(id); return v === DEL ? undefined : (clone(v) as T); }
      return base.get<T>(kind, id);
    },
    put(kind, id, data) { const c = clone(data); write(kind, id, c); journal.push({ op: 'put', kind, id, data: c }); },
    remove(kind, id) { write(kind, id, DEL); journal.push({ op: 'remove', kind, id }); },
    nextSeq: (key) => base.nextSeq(key),
    merge(ops: Op[]) { for (const o of ops) if (o.op === 'put') repo.put(o.kind, o.id, o.data); else repo.remove(o.kind, o.id); },
    mark: () => ({ j: journal.length, u: undo.length }),
    /** 取り消しの記録を捨てる（その行の書き込みを確定する） */
    release(k) { undo.length = k.u; },
    rollback(k) {
      journal.length = k.j;
      while (undo.length > k.u) {
        const { kind, id, prev } = undo.pop()!;
        const ov = m(kind);
        if (prev === ABSENT) ov.delete(id); else ov.set(id, prev);
        const v = views.get(kind);
        if (v) { if (prev === ABSENT) { if (inBase(kind, id)) { views.delete(kind); } else v.delete(id); } else if (prev === DEL) v.delete(id); else v.set(id, prev); }
      }
    },
  };
  return repo;
}
/**
 * 確かめている間の読み取り専用の写し（base は run の間は変わらない：書き込みは重ねた DocRepo に入る）。
 * 保存の関数は1行ごとに全件を読み直すので、DB を毎回読まず、最初に読んだ中身（JSON の文字）から作り直す
 */
function snapshotRepo(base: DocRepo): DocRepo {
  const lists = new Map<string, string[]>();
  const gets = new Map<string, string | undefined>();
  return {
    list<T>(kind: string): T[] {
      let xs = lists.get(kind);
      if (!xs) { xs = base.list<T>(kind).map((x) => JSON.stringify(x)); lists.set(kind, xs); }
      return xs.map((x) => JSON.parse(x) as T);
    },
    get<T>(kind: string, id: string): T | undefined {
      const k = `${kind}\u0001${id}`;
      if (!gets.has(k)) { const v = base.get<T>(kind, id); gets.set(k, v === undefined ? undefined : JSON.stringify(v)); }
      const j = gets.get(k);
      return j === undefined ? undefined : (JSON.parse(j) as T);
    },
    put: (kind, id, data) => base.put(kind, id, data),
    remove: (kind, id) => base.remove(kind, id),
    nextSeq: (key) => base.nextSeq(key),
  };
}
const applyOps = (r: DocRepo, ops: Op[]) => { for (const o of ops) if (o.op === 'put') r.put(o.kind, o.id, o.data); else r.remove(o.kind, o.id); };

/* ===================================================================== */
/* 出力                                                                  */
/* ===================================================================== */

/* 取込の突合は run() の中で1回だけ索引（Map）を作る（1行ごとに list を作り直すと 件数×行数 で遅い） */
/** 元のデータでの1件探し：find があればそれ、なければ全件の索引（Map）を1回だけ作って引く（1行ごとに list を作り直さない） */
function baseFinder<R>(e: CsvEntity<R>, x: Ctx) {
  let list: R[] | undefined;
  let idx: Map<string, R> | undefined;
  return {
    all: () => (list ??= e.list(x)),
    find: (key: string): R | undefined => {
      if (e.find) return e.find(x, key);
      if (!idx) { idx = new Map(); for (const r of (list ??= e.list(x))) if (!idx.has(e.keyOf(r))) idx.set(e.keyOf(r), r); }
      return idx.get(key);
    },
  };
}
/** 保存のあと（重ねた DocRepo）の1件探し */
const refindOf = <R,>(e: CsvEntity<R>, x: Ctx, key: string) => (e.find ? e.find(x, key) : e.refind ? e.refind(x, key) : e.list(x).find((r) => e.keyOf(r) === key));
const hasChild = (e: CsvEntity) => e.cols.some((c) => c.child);
export const entityHead = (e: CsvEntity) => (e.custom ? e.custom.head() : e.cols.map((c) => headText(c)));

/** 1件 → 出力の行（子の表があれば子の数だけ） */
function rowsOf<R>(e: CsvEntity<R>, rec: R, x: Ctx): string[][] {
  const base = (c: EntityCol<R, unknown>) => (c.get ? cellText(c.get(rec, x), c.type) : '');
  if (!hasChild(e)) return [e.cols.map(base)];
  const items = e.children?.(rec, x) ?? [];
  if (!items.length) return [e.cols.map((c) => (c.child ? '' : base(c)))];
  return items.map((it) => e.cols.map((c) => (c.child ? cellText(c.cget?.(it as never, rec, x), c.type) : base(c))));
}

/** エンティティの出力（keys＝画面で絞った行のキー。省くと全件） */
export function exportEntity(e: CsvEntity, x0: Ctx, keys?: string[]) {
  if (e.custom?.exportRows) return { head: e.custom.head(), rows: e.custom.exportRows(x0) };
  /* 出力の間はデータは変わらない：種類ごとに1回だけ読んだものを使う（行ごとに変更履歴などの全件を読み直すと、行数 × 件数の時間になる） */
  const x: Ctx = { ...x0, r: overlayRepo(x0.r, { frozenBase: true }) };
  const want = keys ? new Set(keys) : null;
  const list = e.list(x).filter((r) => !want || want.has(e.keyOf(r)));
  /* 画面の並び（keys の順）にそろえる */
  if (keys) list.sort((a, b) => keys.indexOf(e.keyOf(a)) - keys.indexOf(e.keyOf(b)));
  return { head: entityHead(e), rows: list.flatMap((r) => rowsOf(e, r, x)) };
}

/** テンプレート：見出し＋記入例（1〜2件） */
export function templateOf(e: CsvEntity, x: Ctx) {
  if (e.custom) return { head: e.custom.head(), rows: e.custom.template?.(x) ?? [] };
  const head = entityHead(e);
  const s = e.sample?.(x);
  if (s) return { head, rows: s.map((o) => e.cols.map((c) => o[c.label] ?? '')) };
  const first = e.list(x)[0];
  return { head, rows: first ? rowsOf(e, first, x).slice(0, 2) : [] };
}

export type ExportLog = { id: string; at: string; by: string; site: string; screen: string; filters: CsvFilter[]; count: number; fileName: string };
export function logExport(r: DocRepo, a: Omit<ExportLog, 'id' | 'at'> & { at?: string }) {
  const id = `EX-${String(r.nextSeq('csv.export')).padStart(6, '0')}`;
  const log: ExportLog = { id, at: a.at ?? nowStamp(), by: a.by, site: a.site, screen: a.screen, filters: a.filters ?? [], count: a.count, fileName: a.fileName };
  r.put(K.exports, id, log);
  return log;
}

/* ===================================================================== */
/* 取込                                                                  */
/* ===================================================================== */

export type PreviewOut = {
  token: string; entity: string; screen: string; fileName: string; total: number;
  counts: { 新規: number; 更新: number; 変更なし: number; 対象外: number; エラー: number };
  fileErrors: string[]; rows: RowResult[]; warnings: number; impact: string[]; background: boolean;
};
type RunOut = { fileErrors: string[]; rows: RowResult[]; journal: Op[]; follow: FollowUp[]; value?: unknown };

const isTemp = (k: string) => /^新規/.test(k);
const MONEY_JUMP = 0.3;

/** 1つのファイルを確かめる（base の上に重ねて保存の関数を動かす。base は変えない） */
function run(e: CsvEntity, realBase: DocRepo, scope: CsvScope, by: string, text: string): RunOut {
  const base = snapshotRepo(realBase);
  const at = nowStamp();
  const O = overlayRepo(base, { frozenBase: true });
  const x: Ctx = { r: O, scope, by, at };
  /* 取込の前の今のデータ（書き込まない）。list を読み直さないように、種類ごとに1回だけ読んだものを使う */
  const X0: Ctx = { r: overlayRepo(base, { frozenBase: true }), scope, by, at };
  const B = baseFinder(e, X0);
  const lines = parseCsv(text);
  const out: RunOut = { fileErrors: [], rows: [], journal: O.journal, follow: [] };
  const strict = !!e.listCsv || !!e.strictFile;
  const E107 = 'ファイルにデータの行がありません。見出しの下に1行以上入れてください。';
  if (!lines.length) { out.fileErrors.push(strict ? E107 : 'ファイルが空です'); return out; }
  if (lines.length - 1 > CSV_MAX_ROWS) { out.fileErrors.push(strict ? `ファイルが${CSV_MAX_ROWS.toLocaleString()}行を超えています（${(lines.length - 1).toLocaleString()}行）。ファイルを分けて取り込んでください。` : `行が多すぎます（${(lines.length - 1).toLocaleString()}行）。1ファイル ${CSV_MAX_ROWS.toLocaleString()}行までです。ファイルを分けてください`); return out; }
  if (lines.length < 2) { out.fileErrors.push(strict ? E107 : '取り込む行がありません（1行目は見出し）'); return out; }
  if (e.exportOnly) { out.fileErrors.push('この画面は CSV取込ができません'); return out; }
  if (e.custom) {
    const head = e.custom.head();
    const h = lines[0].cells.map((s) => s.trim().replace(/^﻿/, ''));
    const m = matchHeader(h, head.map((label) => ({ label })), (e.custom.required ?? head).map((l) => l.replace(/【[^】]*】/g, '')));
    if (m.unknown.length || m.missing.length) {
      out.fileErrors.push(strict ? '1行目の見出しが取込用の列と違います。テンプレートのファイルを元に作り直してください。' : `1行目の見出しがテンプレートと違います${m.missing.length ? `（足りない列：${m.missing.join('・')}）` : ''}${m.unknown.length ? `（知らない列：${m.unknown.join('・')}）` : ''}`);
      return out;
    }
    const res = e.custom.run(x, text, lines);
    return { fileErrors: res.fileErrors ?? [], rows: res.rows, journal: O.journal, follow: res.follow ?? [], value: res.value };
  }

  /* ---- 見出し ---- */
  const keyCol = e.cols.find((c) => c.label === e.key)!;
  const keyCols = e.keyCols ?? [e.key];
  const cols = e.cols.map((c) => (c.optsOf ? { ...c, opts: c.optsOf(X0) } : c));
  const m = matchHeader(lines[0].cells, cols, keyCols);
  if (strict) {
    /* E113：見出しが取込用の列と違う（足りない・知らない・重なる列は1つのメッセージに） */
    if (m.missing.length || m.unknown.length || m.dup.length) out.fileErrors.push('1行目の見出しが取込用の列と違います。CSV出力のファイルを元に作り直してください。');
  } else {
    if (m.missing.length) out.fileErrors.push(`1行目（見出し）に「${m.missing.join('・')}」の列がありません`);
    if (m.unknown.length) out.fileErrors.push(`知らない列があります（${m.unknown.join('・')}）。テンプレートの見出しを使ってください`);
    if (m.dup.length) out.fileErrors.push(`同じ列が2つあります（${m.dup.join('・')}）`);
  }
  if (out.fileErrors.length) return out;
  const cell = (l: CsvLine, label: string) => { const i = m.at.get(label); return i === undefined ? '' : (l.cells[i] ?? ''); };
  const writable = cols.filter((c) => !c.ro && m.at.has(c.label) && !keyCols.includes(c.label));
  const keyOfLine = (l: CsvLine) => {
    const ks = keyCols.map((k) => cell(l, k).trim());
    return ks.every((k) => k === '') ? '' : ks.join('|');
  };

  /* ---- キーでまとめる（子の表はキーをくり返す。空欄は1行ずつ新規） ---- */
  const groups: { key: string; lines: CsvLine[] }[] = [];
  const byKey = new Map<string, { key: string; lines: CsvLine[] }>();
  const child = hasChild(e);
  for (const l of lines.slice(1)) {
    const k = keyOfLine(l);
    if (!k) { groups.push({ key: '', lines: [l] }); continue; }
    const g = byKey.get(k);
    if (g) {
      if (!child) { out.rows.push(errRow(l, k, keyCol.label, `${e.key} ${k} が ${g.lines[0].line}行目と重複しています`)); continue; }
      g.lines.push(l);
    } else { const ng = { key: k, lines: [l] }; byKey.set(k, ng); groups.push(ng); }
  }

  /* ---- ほかのレコードと同じにできない値（ファイルの中も） ---- */
  const uniq = cols.filter((c) => c.unique && m.at.has(c.label));
  const uniqSeen = new Map<string, Map<string, string>>();
  const uniqNow = new Map<string, Map<string, unknown[]>>();

  for (const g of groups) {
    const first = g.lines[0];
    const row: RowResult = { line: first.line, lines: g.lines.map((l) => l.line), key: g.key, name: '', action: 'エラー', errors: [], warnings: [], diff: [] };
    const bad = (col: string, msg: string, line = first.line) => row.errors.push({ line, col, msg });
    const cur = g.key && !isTemp(g.key) ? B.find(g.key) : undefined;
    if (g.key && !isTemp(g.key) && !cur && e.listCsv) bad(e.key, `${e.listCsv.subject}（${g.key}）が見つかりません。`);
    else if (g.key && !isTemp(g.key) && !cur) bad(e.key, `${e.key} ${g.key} が見つかりません（削除済みを含む。${e.create === true ? `新しく登録するときは${child ? '空欄か仮キー（新規1 など）' : '空欄'}にしてください` : '新しい行は CSV では作れません'}）`);
    if (!cur && e.create !== true && !(g.key && !isTemp(g.key))) bad(e.key, typeof e.create === 'string' ? e.create : 'CSV では新しく登録できません（キーを入れてください）');
    row.name = cur && e.nameOf ? e.nameOf(cur) : '';
    /* 今の値（出力の文字）。今と同じセルは確かめず、入れない（出力したファイルをそのまま取り込んでも何も変わらない） */
    const nowOf = (c: EntityCol<unknown, unknown>) => (cur && c.get ? cellText(c.get(cur, X0), c.type) : undefined);

    /* 親の項目：キーをくり返した行で違う値があればエラー */
    const vals = new Map<string, Parsed>();
    for (const c of writable.filter((c) => !c.child)) {
      let got: Parsed = { k: 'keep' }, from = first.line;
      const now = nowOf(c);
      /* E116：2行目以降の法人／拠点の列は、空欄か1行目と同じ値（違えばその行はエラー） */
      const dif = e.listCsv ? g.lines.slice(1).find((l) => cell(l, c.label).trim() !== '' && cell(l, c.label).trim() !== cell(first, c.label).trim()) : undefined;
      if (dif) { bad(c.label, `同じ${e.listCsv!.subject}IDの行で、${e.listCsv!.subject}の列の値が違います（${c.label}）。`, dif.line); vals.set(c.label, { k: 'err', msg: '' }); continue; }
      for (const l of g.lines) {
        const raw = cell(l, c.label).trim();
        if (now !== undefined && raw !== '' && raw === now) continue;
        const p = parseCell(raw, c);
        if (p.k === 'keep') continue;
        if (p.k === 'err') { bad(c.label, p.msg, l.line); got = p; break; }
        if (got.k !== 'keep' && JSON.stringify(got) !== JSON.stringify(p)) { bad(c.label, `${from}行目と値が違います（同じ ${e.key} の行は同じ値にしてください）`, l.line); break; }
        if (got.k === 'keep') { got = p; from = l.line; }
      }
      vals.set(c.label, got);
    }
    /* E115：参照の列（出力だけの列）がファイルにあって今の値と違う行はエラー（同じなら無視） */
    if (e.listCsv && cur) {
      for (const c of cols.filter((c) => c.ro && m.at.has(c.label) && !keyCols.includes(c.label))) {
        const bd = g.lines.find((l) => { const raw = cell(l, c.label).trim(); return raw !== '' && cellText(raw, c.type) !== nowOf(c); });
        if (bd) bad(c.label, `${c.label}は CSV では変更できません。`, bd.line);
      }
    }
    /* 子の表（今の子の行と同じなら変えない） */
    const items: Map<string, Parsed>[] = [];
    if (child) {
      const cc = writable.filter((c) => c.child);
      const sig = (xs: string[][]) => xs.map((r) => r.join('\u0001')).sort().join('\u0002');
      const fileRows = g.lines.map((l) => cc.map((c) => cell(l, c.label).trim())).filter((r) => r.some((v) => v !== ''));
      const idx = cc.map((c) => e.cols.findIndex((x) => x.label === c.label));
      const nowRows = cur ? rowsOf(e, cur, X0).map((r) => idx.map((i) => r[i])).filter((r) => r.some((v) => v !== '')) : [];
      if (fileRows.length && (!cur || sig(fileRows) !== sig(nowRows))) {
        for (const l of g.lines) {
          const it = new Map<string, Parsed>();
          for (const c of cc) {
            const p = parseCell(cell(l, c.label), c);
            if (p.k === 'err') bad(c.label, p.msg, l.line);
            it.set(c.label, p);
          }
          if ([...it.values()].some((p) => p.k !== 'keep')) items.push(it);
        }
      }
    }
    /* 今の値と違うセルだけ入れる */
    const eff = new Map<string, Parsed>();
    for (const c of writable.filter((c) => !c.child)) {
      const p = vals.get(c.label)!;
      if (p.k !== 'set' && p.k !== 'clear') continue;
      const now = nowOf(c);
      if (now !== undefined && (p.k === 'set' ? cellText(p.v, c.type) === now : now === '')) continue;
      eff.set(c.label, p);
    }
    const isNew = !cur || !!e.fresh?.(cur);
    const changing = isNew || eff.size > 0 || items.length > 0;
    if (cur && !changing && !row.errors.length) { row.action = '変更なし'; out.rows.push(row); continue; }
    /* 変えるときだけ：変えられないレコード（確定・請求済・削除済など）・必須 */
    if (cur && !isNew) { const lk = e.locked?.(cur, X0); if (lk) bad(e.key, lk); }
    for (const c of cols.filter((c) => (c.reqAlways || (isNew && c.reqNew)) && !c.child && !keyCols.includes(c.label))) {
      const p = vals.get(c.label);
      const has = p?.k === 'set' || (c.reqAlways && cur && nowOf(c) !== undefined && nowOf(c) !== '' && p?.k !== 'clear');
      if (!has && !row.errors.some((x) => x.col === c.label)) bad(c.label, c.reqAlways ? `「${c.label}」を入れてください` : `新しく登録するときは「${c.label}」が必須です`);
    }
    if (keyCols.length > 1 && g.key && keyCols.some((k) => !cell(first, k).trim())) bad(keyCols.join('・'), `${keyCols.join('・')}をすべて入れてください`);
    /* 同じにできない値（変える値だけ。ファイルの中の重なりも） */
    for (const c of uniq) {
      const p = eff.get(c.label) ?? (isNew ? vals.get(c.label) : undefined);
      if (p?.k !== 'set') continue;
      const v = cellText(p.v, c.type);
      const seen = uniqSeen.get(c.label) ?? uniqSeen.set(c.label, new Map()).get(c.label)!;
      if (seen.has(v)) bad(c.label, `${c.label}「${v}」が ${seen.get(v)} と重複しています`);
      seen.set(v, `${first.line}行目`);
      /* 今のデータの値の表は列ごとに1回だけ作る（行ごとに全件を読み直すと、行数 × 件数の時間になる） */
      let tbl = uniqNow.get(c.label);
      if (!tbl) {
        tbl = new Map();
        if (c.get) for (const r of B.all()) { if (e.uniqSkip?.(r)) continue; const t = cellText(c.get(r, X0), c.type); const xs = tbl.get(t); if (xs) xs.push(r); else tbl.set(t, [r]); }
        uniqNow.set(c.label, tbl);
      }
      const other = tbl.get(v)?.find((r) => !cur || e.keyOf(r as never) !== e.keyOf(cur));
      if (other) bad(c.label, `${c.label}「${v}」はほかのデータ（${e.keyOf(other)}）で使っています`);
    }
    /* キーが見つからない行（E100）・キーが空欄の行（E101）は、それだけ出す（ほかの列のエラーは重ねない） */
    if (e.listCsv && !cur && row.errors.length) row.errors = row.errors.slice(0, 1);
    if (row.errors.length) { out.rows.push(row); continue; }

    /* ---- 下書きに入れて、画面と同じ保存の関数を重ねた DocRepo で動かす ---- */
    const xn: Ctx = x;
    const mk = O.mark();
    try {
      /* 前の行で変わっていれば（後ろの月にも当てる契約など）、その値から */
      const curN = cur ? (e.independent ? cur : refindOf(e, xn, g.key) ?? cur) : undefined;
      const draft = curN ? e.draftOf!(curN, xn) : e.newDraft!(xn);
      for (const c of writable.filter((c) => !c.child)) {
        const p = eff.get(c.label);
        if (p?.k === 'set') c.put?.(draft, p.v, xn);
        else if (p?.k === 'clear') c.put?.(draft, undefined, xn);
      }
      if (items.length) e.childPut?.(draft, items, xn);
      const res = e.save!(xn, draft, cur);
      const key = typeof res === 'string' ? res : (res && typeof res === 'object' && res.key) || (cur ? e.keyOf(cur) : '');
      if (res && typeof res === 'object' && res.follow) out.follow.push(res.follow);
      const after = key ? refindOf(e, xn, key) : undefined;
      const before = cur && !isNew ? rowsOf(e, cur, X0) : [];
      const aft = after ? rowsOf(e, after, xn) : [];
      row.key = key || g.key;
      row.name = (after && e.nameOf?.(after)) || row.name;
      row.diff = diffOf(e, before, aft, isNew);
      if (cur && !isNew && !row.diff.length && !(res && typeof res === 'object' && res.follow)) { O.rollback(mk); row.action = '変更なし'; out.rows.push(row); continue; }
      row.action = isNew ? '新規' : '更新';
      row.warnings.push(...moneyWarn(e, before, aft), ...(e.warn?.(cur, after, xn) ?? []));
      O.release(mk);
    } catch (err) {
      O.rollback(mk);
      bad(err instanceof CsvColError ? err.col : (err as { col?: string }).col ?? '—', err instanceof Error ? err.message : String(err));
      row.action = 'エラー';
    }
    out.rows.push(row);
  }
  out.rows.sort((a, b) => a.line - b.line);
  return out;
}

const errRow = (l: CsvLine, key: string, col: string, msg: string): RowResult =>
  ({ line: l.line, lines: [l.line], key, name: '', action: 'エラー', errors: [{ line: l.line, col, msg }], warnings: [], diff: [] });

/** 変わった列（子の表は「;」でつないだ値で比べる） */
function diffOf(e: CsvEntity, before: string[][], after: string[][], isNew: boolean) {
  const out: RowResult['diff'] = [];
  e.cols.forEach((c, i) => {
    /* 登録日時・更新日時・更新者は差分に出さない */
    if (c.ro && /(登録|更新|作成)(日時|者)$/.test(c.label)) return;
    const join = (rows: string[][]) => (c.child ? rows.map((r) => r[i]).filter((v) => v !== '').join(';') : rows[0]?.[i] ?? '');
    const b = join(before), a = join(after);
    if (b !== a && !(isNew && a === '')) out.push({ col: c.label, before: isNew ? '' : b, after: a });
  });
  return out;
}
/** 金額が大きく変わる（±30%） */
function moneyWarn(e: CsvEntity, before: string[][], after: string[][]) {
  const w: string[] = [];
  e.cols.forEach((c, i) => {
    if (c.type !== 'money' || c.child || !before.length) return;
    const b = Number(before[0]?.[i]), a = Number(after[0]?.[i]);
    if (b > 0 && Number.isFinite(a) && Math.abs(a - b) / b >= MONEY_JUMP) w.push(`${c.label}が30%以上変わります（${b} → ${a}）`);
  });
  return w;
}

const countsOf = (rows: RowResult[]) => ({
  新規: rows.filter((r) => r.action === '新規').length, 更新: rows.filter((r) => r.action === '更新').length,
  変更なし: rows.filter((r) => r.action === '変更なし').length, 対象外: rows.filter((r) => r.action === '対象外').length, エラー: rows.filter((r) => r.action === 'エラー').length,
});

type PreviewDoc = { id: string; entity: string; scope: CsvScope; by: string; fileName: string; text: string; at: string };
export type ImportLog = {
  id: string; at: string; by: string; site: string; entity: string; screen: string; fileName: string;
  counts: PreviewOut['counts']; status: '完了' | '実行中' | '画面で反映'; jobId: string;
};
export type ChangeLog = { id: string; importId: string; entity: string; key: string; at: string; by: string; what: 'CSV取込で更新' | 'CSV取込で登録'; diff: RowResult['diff'] };

/** 取込の確認（保存しない）。token で importCommit を呼ぶ */
export function importPreview(r: DocRepo, e: CsvEntity, a: { text: string; fileName: string; scope: CsvScope; by: string }): PreviewOut {
  const res = run(e, r, a.scope, a.by, a.text ?? '');
  const token = `PV-${String(r.nextSeq('csv.preview')).padStart(6, '0')}`;
  /* 古い確認は消す（同じ人・同じエンティティの分） */
  for (const p of r.list<PreviewDoc>(K.previews)) if (p.by === a.by && p.entity === e.id) r.remove(K.previews, p.id);
  r.put<PreviewDoc>(K.previews, token, { id: token, entity: e.id, scope: a.scope, by: a.by, fileName: a.fileName, text: a.text, at: nowStamp() });
  const counts = countsOf(res.rows);
  return {
    token, entity: e.id, screen: e.screen, fileName: a.fileName, total: res.rows.length, counts, fileErrors: res.fileErrors, rows: res.rows,
    warnings: res.rows.reduce((s, x) => s + x.warnings.length, 0), impact: e.impact ?? [], background: counts.新規 + counts.更新 > CSV_BG_UPDATES,
  };
}

/** 取込の登録。もう一度確かめて、エラーがなければ全部を書く（更新が 100件を超えたら裏で進める＝jobId） */
export function importCommit(r: DocRepo, e: CsvEntity, a: { token: string; ack?: boolean }) {
  const p = r.get<PreviewDoc>(K.previews, a.token);
  if (!p || p.entity !== e.id) throw new ApiError('取込の確認が見つかりません。もう一度ファイルを選んでください', 404);
  const res = run(e, r, p.scope, p.by, p.text);
  const counts = countsOf(res.rows);
  /* ファイル全体のエラーだけ止める。行のエラーはその行を取り込まず、ほかの行を登録する（hong 2026/10/05・マスタ項目一覧 一覧画面 #8。旧：1行でもエラーなら何も保存しない） */
  if (res.fileErrors.length) throw new ApiError(`エラーがあるため登録できません（${res.fileErrors[0]}）。データは変えていません`, 409);
  if (!counts.新規 && !counts.更新) throw new ApiError('登録する行がありません（すべてエラー・変更なし・対象外）。データは変えていません', 409);
  if (res.rows.some((x) => x.warnings.length) && !a.ack) throw new ApiError('警告があります。「警告を確認しました」にチェックしてください', 400);
  const id = `IM-${String(r.nextSeq('csv.import')).padStart(6, '0')}`;
  const at = nowStamp();
  const bg = counts.新規 + counts.更新 > CSV_BG_UPDATES;
  const log: ImportLog = {
    id, at, by: p.by, site: p.scope.site, entity: e.id, screen: e.screen, fileName: p.fileName, counts,
    status: bg ? '実行中' : res.follow.length && !res.journal.length ? '画面で反映' : '完了', jobId: bg ? `JB-${id.slice(3)}` : '',
  };
  /* レコードごとの変更履歴「CSV取込で更新」 */
  let n = 0;
  const changes: ChangeLog[] = res.rows.filter((x) => x.action === '新規' || x.action === '更新').map((x) => ({
    id: `${id}-${String(++n).padStart(5, '0')}`, importId: id, entity: e.id, key: x.key, at, by: p.by,
    what: x.action === '新規' ? 'CSV取込で登録' : 'CSV取込で更新', diff: x.diff,
  }));
  if (bg) {
    for (let i = 0; i * STEP < res.journal.length; i++) r.put(K.jobOps, `${log.jobId}#${i}`, res.journal.slice(i * STEP, (i + 1) * STEP));
    r.put(K.jobs, log.jobId, { id: log.jobId, importId: id, total: res.journal.length, done: 0, status: '実行中', at });
    r.put(K.jobOps, `${log.jobId}@changes`, changes);
  } else {
    applyOps(r, res.journal);
    for (const c of changes) r.put(K.changes, c.id, c);
  }
  r.put(K.imports, id, log);
  r.remove(K.previews, p.id);
  return { importId: id, counts, jobId: log.jobId, follow: res.follow, value: res.value };
}

type Job = { id: string; importId: string; total: number; done: number; status: '実行中' | '完了'; at: string };
/** 裏で進める取込を少し進める（画面がくり返し呼ぶ）。done／total が進み具合 */
export function jobStep(r: DocRepo, a: { id: string }) {
  const j = r.get<Job>(K.jobs, a.id);
  if (!j) throw new ApiError('取込の処理が見つかりません', 404);
  if (j.status === '完了') return { id: j.id, done: j.total, total: j.total, status: j.status };
  /* done は STEP の倍数で進む：次の1かたまり（jobOps）を読んで書く */
  const chunk = `${j.id}#${Math.floor(j.done / STEP)}`;
  const next = r.get<Op[]>(K.jobOps, chunk) ?? [];
  applyOps(r, next);
  r.remove(K.jobOps, chunk);
  const done = Math.min(j.total, j.done + STEP);
  if (done >= j.total) {
    for (const c of r.get<ChangeLog[]>(K.jobOps, `${j.id}@changes`) ?? []) r.put(K.changes, c.id, c);
    r.remove(K.jobOps, `${j.id}@changes`);
    r.put(K.jobs, j.id, { ...j, done, status: '完了' });
    const log = r.get<ImportLog>(K.imports, j.importId);
    if (log) r.put(K.imports, log.id, { ...log, status: '完了' });
    return { id: j.id, done, total: j.total, status: '完了' as const };
  }
  r.put(K.jobs, j.id, { ...j, done });
  return { id: j.id, done, total: j.total, status: '実行中' as const };
}

/** エラー一覧CSV：元のファイル＋「エラー内容」の列 */
export function errorCsvRows(text: string, rows: RowResult[], fileErrors: string[]) {
  const lines = parseCsv(text);
  const msg = new Map<number, string[]>();
  for (const r of rows) for (const e of r.errors) msg.set(e.line, [...(msg.get(e.line) ?? []), `${e.col !== '—' ? e.col + '：' : ''}${e.msg}`]);
  const head = [...(lines[0]?.cells ?? []), 'エラー内容'];
  const body = lines.slice(1).map((l) => [...l.cells, (msg.get(l.line) ?? []).join(' ／ ')]);
  return [head, ...(fileErrors.length ? [[...new Array(Math.max(0, head.length - 1)).fill(''), fileErrors.join(' ／ ')]] : []), ...body];
}

/** 取込の行（RowResult）を作る道具（独自の形の CSV 用） */
export const rowResult = (line: number, key: string, name: string, action: RowResult['action'], o?: Partial<RowResult>): RowResult =>
  ({ line, lines: [line], key, name, action, errors: [], warnings: [], diff: [], ...o });
