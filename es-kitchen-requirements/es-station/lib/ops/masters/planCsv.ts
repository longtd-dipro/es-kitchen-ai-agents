import { DEMO } from '@/lib/demo';
import { COURSES, coursesOf, fieldByName, indexOf, newValues, num, planDerive, valueOfName, valueParts, type Tables, type Values } from './logic';
import type { MasterRec, TRow } from './types';

/*
 * プランマスタの CSV取込・CSV出力（決定 28-183。元：部品/13 の「プランマスタの CSV取込」のスクリプト）
 * 1つのファイルに プラン／コース／価格／設備 の行を入れる。区分（NEW／UPDATE／DELETE）の列は持たない：
 * キーが一致すれば上書き、なければ新規・追加。プラン・コース＝上書き／新規、価格＝追加／上書き／削除（削除＝1）、
 * 設備＝置き換え（プラン×コースごと）。
 * プランの値は画面の項目（MasterRec の値・表）が正。CSV の形（PlanDb）との行き来をここに置く。
 */

export const COLS = ['行区分', 'プランID／仮キー', 'コース', '公開用プラン名', '管理用プラン名', '公開ステータス', '月次提供上限の合計', '基本比×倍', '選べるコース', '利用人数目安', '企業負担額（税込・1食）', '企業負担分の税率', '基本料金の税率', '免責金額', '冷凍_月次提供数_上限', '冷凍_月次提供数_下限', '冷蔵常温_月次提供数_上限', '冷蔵常温_月次提供数_下限', '冷蔵常温_標準の配送回数', '冷凍_標準の配送回数', '残りわずか率', '相談して決める', 'スタンダードと同じ構成にする', 'コースの備考', '価格プラン', '開始期間', '終了期間', '価格（COOL便）', '価格（ES配送便）', '公開用', '削除', 'パターン', '機種ID', '台数', '設備の備考'];
/** CSV のコース（ライト＝ESライト（冷蔵庫）。28-184） */
export const CL = ['スタンダード', 'ライト', 'ライト（自販機）'] as const;
type Course = (typeof CL)[number];
const V: Course = 'ライト（自販機）';
const PLAN_F = COLS.slice(3, 14), COURSE_F = COLS.slice(14, 24), PRICE_F = ['開始期間', '終了期間', '価格（COOL便）', '価格（ES配送便）', '公開用'];
const REQ: Record<string, string[]> = {
  プラン: ['公開用プラン名', '公開ステータス', '月次提供上限の合計', '基本比×倍', '選べるコース', '企業負担額（税込・1食）', '企業負担分の税率', '基本料金の税率', '免責金額'],
  コース_スタンダード: ['冷凍_月次提供数_上限', '冷凍_月次提供数_下限', '冷蔵常温_月次提供数_上限', '冷蔵常温_月次提供数_下限', '冷蔵常温_標準の配送回数', '冷凍_標準の配送回数', '残りわずか率', '相談して決める'],
  コース_ライト: ['冷蔵常温_月次提供数_上限', '冷蔵常温_月次提供数_下限', '冷蔵常温_標準の配送回数', '残りわずか率', '相談して決める', 'スタンダードと同じ構成にする'],
  'コース_ライト（自販機）': ['冷蔵常温_月次提供数_上限', '冷蔵常温_月次提供数_下限', '冷蔵常温_標準の配送回数', '残りわずか率', '相談して決める'],
  価格: ['開始期間', '価格（COOL便）', '価格（ES配送便）'],
  '価格_ライト（自販機）': ['開始期間', '価格（ES配送便）'],
  設備: ['パターン', '機種ID', '台数'],
};

/** CSV の形のプラン。used＝その価格の世代を使っている子契約の件数 */
type Row = Record<string, string>;
interface Gen { [k: string]: string | number | undefined; used?: number }
export type PlanDb = { contracts: number; plan: Row | null; courses: Partial<Record<Course, Row>>; prices: Partial<Record<Course, Gen[]>>; equip: Partial<Record<Course, Row[]>> };

/* ---------- 画面の項目 ⇄ CSV の形 ---------- */

const C_IDX: Record<Course, number> = { スタンダード: 0, ライト: 1, 'ライト（自販機）': 2 };
const PANE: Record<Course, string> = { スタンダード: 'pm-1', ライト: 'pm-2', 'ライト（自販機）': 'pm-3' };
export const PRICE_KEY: Record<Course, string> = { スタンダード: 'ESスタンダード 価格プラン', ライト: 'ESライト 価格プラン', 'ライト（自販機）': 'ESライト（自販機） 価格プラン' };
export const EQUIP_KEY: Record<Course, string> = { スタンダード: 'ESスタンダード 標準貸出設備', ライト: 'ESライト 標準貸出設備', 'ライト（自販機）': 'ESライト（自販機） 標準貸出設備' };
/** 項目名（画面）⇄ CSV の列名 */
const PLAN_MAP: [string, string][] = [['公開用プラン名', '公開用プラン名'], ['管理用プラン名', '管理用プラン名'], ['公開ステータス', '公開ステータス'], ['月次提供上限の合計', '月次提供上限の合計'], ['基本比×倍', '基本比×倍'], ['利用人数目安（表示用）', '利用人数目安'], ['企業負担額（税込・1食）', '企業負担額（税込・1食）'], ['企業負担分の税率', '企業負担分の税率'], ['基本料金の税率', '基本料金の税率'], ['免責金額', '免責金額']];
const COURSE_MAP: [string, string][] = [['冷凍_月次提供数_上限', '冷凍_月次提供数_上限'], ['冷凍_月次提供数_下限', '冷凍_月次提供数_下限'], ['冷蔵・常温_月次提供数_上限', '冷蔵常温_月次提供数_上限'], ['冷蔵・常温_月次提供数_下限', '冷蔵常温_月次提供数_下限'], ['冷蔵・常温_標準の配送回数', '冷蔵常温_標準の配送回数'], ['冷凍_標準の配送回数', '冷凍_標準の配送回数'], ['残りわずか率（%）', '残りわずか率'], ['相談して決める', '相談して決める'], ['スタンダードと同じ構成にする', 'スタンダードと同じ構成にする'], ['備考', 'コースの備考']];

const plain = (s: unknown) => String(s ?? '').replace(/,/g, '').trim();
const comma = (s: string) => (s === '' || isNaN(Number(s)) ? s : Number(s).toLocaleString('ja-JP'));
const head = (key: string) => (indexOf('plans').tables.find((x) => x.b.key === key)?.b.head ?? []).map((h) => h.text);

/** 画面の値 → CSV の形 */
export function planDbOf(rec: Pick<MasterRec, 'priceUsed'> & { contracts?: number }, values: Values, tables: Tables): PlanDb {
  const v = (n: string, pane?: string) => valueOfName('plans', values, n, pane);
  const cs = coursesOf(values);
  const plan: Row = {};
  for (const [f, c] of PLAN_MAP) plan[c] = v(f);
  plan['基本比×倍'] = plan['基本比×倍'].replace(/倍$/, '');
  plan['選べるコース'] = CL.filter((c) => cs.includes(COURSES[C_IDX[c]])).join('・');
  const db: PlanDb = { contracts: rec.contracts ?? 0, plan, courses: {}, prices: {}, equip: {} };
  for (const c of CL) {
    if (!cs.includes(COURSES[C_IDX[c]])) continue;
    const o: Row = {};
    for (const [f, col] of COURSE_MAP) {
      const fd = fieldByName('plans', f, PANE[c]);
      o[col] = fd ? v(f, PANE[c]).replace(/^する（.*$/, 'する') : '';
    }
    db.courses[c] = o;
    const hs = head(PRICE_KEY[c]), iC = hs.indexOf('価格（COOL便）'), iE = hs.indexOf('価格（ES配送便）');
    db.prices[c] = (tables[PRICE_KEY[c]] ?? []).filter((r) => r.c[1]?.v).map((r) => {
      const name = String(r.c[1].v?.[0] ?? '');
      const cell = (i: number) => (i >= 0 ? plain(r.c[i]?.v?.[0]) : '');
      return { 価格プラン: name, 開始期間: cell(2), 終了期間: cell(3), '価格（COOL便）': cell(iC), '価格（ES配送便）': cell(iE), 公開用: r.c[0]?.v?.[0] === true ? '1' : '', used: rec.priceUsed?.[c]?.[name] ?? 0 };
    });
    db.equip[c] = (tables[EQUIP_KEY[c]] ?? []).filter((r) => r.c[2]?.v).map((r) => ({ パターン: String(r.c[0].v?.[0] ?? ''), 機種ID: String(r.c[2].v?.[0] ?? '').split(' ')[0], 台数: plain(r.c[3]?.v?.[0]), 設備の備考: String(r.c[4]?.v?.[0] ?? '') }));
  }
  return db;
}

/** CSV の形 → 画面の値（いまの値に重ねる） */
export function writePlanDb(values: Values, tables: Tables, db: PlanDb): { values: Values; tables: Tables } {
  const vs: Values = { ...values }, ts: Tables = { ...tables };
  const set = (name: string, x: string, pane?: string) => {
    const f = fieldByName('plans', name, pane);
    if (!f) return;
    const ps = valueParts(f.ctl), i = f.mi ?? 0, p = ps[i];
    const cur = [...(vs[f.k] ?? f.v)];
    cur[i] = p?.t === 'sel' ? p.o.find((o) => o === x) ?? p.o.find((o) => o.indexOf(x) === 0) ?? x : x;
    vs[f.k] = cur;
  };
  if (db.plan) {
    for (const [f, c] of PLAN_MAP) {
      let x = db.plan[c] ?? '';
      if (f === '基本比×倍' && x && !/倍$/.test(x)) x += '倍';
      set(f, x);
    }
    const toks = (db.plan['選べるコース'] || '').split('・').map((s) => s.trim());
    const cf = fieldByName('plans', 'コース');
    if (cf) vs[cf.k] = CL.map((c) => toks.includes(c));
  }
  for (const c of CL) {
    const o = db.courses[c];
    if (o) for (const [f, col] of COURSE_MAP) if (fieldByName('plans', f, PANE[c])) set(f, o[col] ?? '', PANE[c]);
    const gs = db.prices[c];
    if (gs) {
      const tpl = indexOf('plans').tables.find((x) => x.b.key === PRICE_KEY[c])!.b;
      const hs = tpl.head.map((h) => h.text), iC = hs.indexOf('価格（COOL便）'), iE = hs.indexOf('価格（ES配送便）');
      ts[PRICE_KEY[c]] = gs.map((g): TRow => ({
        c: tpl.rows[0].c.map((cell, i) => {
          if (!cell.p || !valueParts(cell.p).length) return { ...cell };
          const val = i === 0 ? g['公開用'] === '1' : i === 1 ? String(g['価格プラン']) : i === 2 ? String(g['開始期間']) : i === 3 ? String(g['終了期間'] ?? '') : i === iC ? comma(String(g['価格（COOL便）'] ?? '')) : i === iE ? comma(String(g['価格（ES配送便）'] ?? '')) : '';
          return { ...cell, v: [val] };
        }),
      }));
    }
    const es = db.equip[c];
    if (es) {
      const tpl = indexOf('plans').tables.find((x) => x.b.key === EQUIP_KEY[c])!.b;
      ts[EQUIP_KEY[c]] = es.map((e): TRow => ({
        c: tpl.rows[0].c.map((cell, i) => {
          if (!cell.p || !valueParts(cell.p).length) return { ...cell };
          const sel = valueParts(cell.p)[0];
          const opt = sel?.t === 'sel' ? sel.o.find((o) => o.split(' ')[0] === e['機種ID']) ?? e['機種ID'] : e['機種ID'];
          const val = i === 0 ? e['パターン'] : i === 1 ? ({ RF: '冷蔵庫', FZ: '冷凍庫', VM: '自販機', BX: '資材ボックス' }[e['機種ID'].slice(0, 2)] ?? '') : i === 2 ? opt : i === 3 ? e['台数'] : i === 4 ? e['設備の備考'] ?? '' : '';
          return { ...cell, v: [val] };
        }),
      }));
    }
  }
  return planDerive(vs, ts);
}

/** used（価格の世代を使っている子契約の件数）だけを取り出す */
export const usedOf = (db: PlanDb) => Object.fromEntries(CL.filter((c) => db.prices[c]).map((c) => [c, Object.fromEntries((db.prices[c] ?? []).map((g) => [g['価格プラン'], g.used ?? 0]))]));

/* ---------- CSV ---------- */

export function parseCSV(text: string): string[][] {
  text = text.replace(/^﻿/, '');
  const rows: string[][] = [];
  let row: string[] = [], f = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) { if (c === '"') { if (text[i + 1] === '"') { f += '"'; i++; } else q = false; } else f += c; }
    else if (c === '"') q = true;
    else if (c === ',') { row.push(f); f = ''; }
    else if (c === '\n' || c === '\r') { if (c === '\r' && text[i + 1] === '\n') i++; row.push(f); rows.push(row); row = []; f = ''; }
    else f += c;
  }
  if (f !== '' || row.length) { row.push(f); rows.push(row); }
  return rows.filter((r) => r.some((x) => x !== ''));
}
export const toCSV = (rows: string[][]) => '﻿' + rows.map((r) => r.map((x) => { x = String(x ?? ''); return /[",\n]/.test(x) ? '"' + x.replace(/"/g, '""') + '"' : x; }).join(',')).join('\r\n') + '\r\n';

/** CSV出力（取込と同じ形式） */
export function exportPlans(dbs: [string, PlanDb][]): string {
  const out: string[][] = [COLS];
  const line = (kind: string, key: string, course: string, o: Row) => COLS.map((c) => (c === '行区分' ? kind : c === 'プランID／仮キー' ? key : c === 'コース' ? course : o[c] != null ? String(o[c]) : ''));
  for (const [k, d] of dbs) {
    out.push(line('プラン', k, '', d.plan ?? {}));
    CL.forEach((c) => { if (d.courses[c]) out.push(line('コース', k, c, d.courses[c]!)); });
    CL.forEach((c) => (d.prices[c] ?? []).forEach((g) => out.push(line('価格', k, c, g as unknown as Row))));
    /* ライトが「スタンダードと同じ構成にする＝する」のときはライトの設備の行を出さない（取込で書けない行。出力→取込で 変更なし にする） */
    CL.forEach((c) => { if (c === 'ライト' && d.courses[c]?.['スタンダードと同じ構成にする'] === 'する') return; (d.equip[c] ?? []).forEach((e) => out.push(line('設備', k, c, e))); });
  }
  return toCSV(out);
}

/* ---------- 取込の判定（確定前の計算だけ。データは確定まで変えない） ---------- */

export type ImportItem = { kind: string; course: string; line: string | number; act: string; text: string; html?: { cls: string; text: string }[] };
export type ImportPlan = { key: string; isNew: boolean; name: string; items: ImportItem[]; errors: { line: number; msg: string }[]; warn: string[]; cnt: Record<string, number> };
export type ImportResult = { fatal: string | null; plans: ImportPlan[] };

const yen = (v: string) => { const n = num(v); return isNaN(n) || v === '' ? String(v || '') : n.toLocaleString('ja-JP'); };

/**
 * 取込前の確認。dbs＝いまのプラン（ID → CSV の形）、models＝機種ID → 機種名（冷蔵庫・冷凍庫・自販機・資材ボックス）
 */
export function analyze(text: string, dbs: Record<string, PlanDb>, models: Record<string, string>): ImportResult {
  const rows = parseCSV(text), res: ImportResult = { fatal: null, plans: [] };
  if (!rows.length) { res.fatal = 'ファイルが空です'; return res; }
  const headRow = rows[0].map((x) => x.trim());
  if (headRow.join(',') !== COLS.join(',')) { res.fatal = '1行目の見出しがテンプレートと違います（列名・列の順番を変えないでください）'; return res; }
  const groups: Record<string, (Row & { _line: number })[]> = {}, order: string[] = [];
  rows.slice(1).forEach((r, i) => {
    const o = { _line: i + 2 } as Row & { _line: number };
    COLS.forEach((c, j) => { o[c] = (r[j] || '').trim(); });
    const k = o['プランID／仮キー'] || '（空欄）';
    if (!groups[k]) { groups[k] = []; order.push(k); }
    groups[k].push(o);
  });
  for (const k of order) res.plans.push(analyzePlan(k, groups[k], dbs, models));
  return res;
}

function analyzePlan(key: string, rows: (Row & { _line: number })[], dbs: Record<string, PlanDb>, models: Record<string, string>): ImportPlan {
  const isNew = !/^ES\d{6}$/.test(key);
  let cur: PlanDb | null = dbs[key] ?? null;
  const P: ImportPlan = { key, isNew, name: '', items: [], errors: [], warn: [], cnt: { 新規: 0, 上書き: 0, 追加: 0, 削除: 0, 置き換え: 0, 変更なし: 0 } };
  const err = (line: number, msg: string) => P.errors.push({ line, msg });
  const item = (kind: string, c: string, line: string | number, act: string, text: string, html?: ImportItem['html']) => { P.items.push({ kind, course: c, line, act, text, html }); P.cnt[act] = (P.cnt[act] || 0) + 1; };
  const diffItem = (kind: string, c: string, r: Row & { _line: number }, o: Row | null | undefined, fields: string[]) => {
    if (!o) {
      const fs = fields.filter((f) => r[f]);
      item(kind, c, r._line, '新規', fs.slice(0, 6).map((f) => f + '：' + r[f]).join('／') + (fs.length > 6 ? ' …' : ''));
      return;
    }
    const ch = fields.filter((f) => (o[f] || '') !== (r[f] || ''));
    item(kind, c, r._line, ch.length ? '上書き' : '変更なし', ch.map((f) => f + ' ' + (o[f] || '（空）') + ' → ' + (r[f] || '（空）')).join('／'));
  };
  if (key === '（空欄）') { rows.forEach((r) => err(r._line, 'プランID／仮キーが空欄です')); return P; }
  if (!isNew && !cur) { rows.forEach((r) => err(r._line, 'プランID ' + key + ' が登録されていません（新しいプランは 仮キー を入れてください）')); return P; }
  if (!cur) cur = { contracts: 0, plan: null, courses: {}, prices: {}, equip: {} };
  const seen: Record<string, number> = {};
  let planRow: (Row & { _line: number }) | null = null;
  const courseRows: Partial<Record<Course, Row & { _line: number }>> = {}, priceRows: Partial<Record<Course, (Row & { _line: number })[]>> = {}, eqRows: Partial<Record<Course, (Row & { _line: number })[]>> = {};
  rows.forEach((r) => {
    const kind = r['行区分'], c = r['コース'] as Course, L = r._line;
    if (!['プラン', 'コース', '価格', '設備'].includes(kind)) { err(L, '行区分「' + kind + '」は使えません（プラン／コース／価格／設備）'); return; }
    if (kind !== 'プラン' && !CL.includes(c)) { err(L, kind + 'の行はコース（スタンダード／ライト／ライト（自販機））が必須です'); return; }
    const dk = kind + '|' + (kind === 'プラン' ? '' : c) + '|' + (kind === '価格' ? r['価格プラン'] : kind === '設備' ? r['パターン'] + '|' + r['機種ID'] : '');
    if (seen[dk]) { err(L, '同じキーの行が2回あります（' + seen[dk] + '行目と同じ）'); return; }
    seen[dk] = L;
    let need = kind === 'コース' ? REQ['コース_' + c] : kind === '価格' && c === V ? REQ['価格_' + V] : REQ[kind];
    if (kind === '価格') { if (!r['価格プラン']) { err(L, '価格プランが空欄です'); return; } if (r['削除'] === '1') need = []; }
    const miss = need.filter((f) => !r[f]);
    if (miss.length) { err(L, kind + 'の行の必須の列が空欄です：' + miss.join('・')); return; }
    if (kind === 'プラン') planRow = r;
    else if (kind === 'コース') courseRows[c] = r;
    else if (kind === '価格') (priceRows[c] = priceRows[c] || []).push(r);
    else (eqRows[c] = eqRows[c] || []).push(r);
  });
  if (isNew && !planRow) err(rows[0]._line, '新しいプラン（仮キー ' + key + '）にはプランの行が必要です');
  /* プラン */
  const plan: Row | null = planRow ?? cur.plan;
  if (planRow) diffItem('プラン', '', planRow, cur.plan, PLAN_F);
  P.name = (cur.plan?.['公開用プラン名']) || (planRow as Row | null)?.['公開用プラン名'] || '—';
  const courses = plan?.['選べるコース'] || 'スタンダード・ライト';
  const toks = courses === '全て' ? ['スタンダード', 'ライト'] : courses.split('・').map((x) => x.trim());
  const allow = Object.fromEntries(CL.map((c) => [c, toks.includes(c)])) as Record<Course, boolean>;
  if (planRow) toks.forEach((t) => { if (!CL.includes(t as Course)) err(planRow!._line, '選べるコース「' + t + '」は使えません（スタンダード／ライト／ライト（自販機）を「・」でつなぐ）'); });
  const tot = num(plan?.['月次提供上限の合計']);
  for (const g of [courseRows, priceRows, eqRows] as Partial<Record<Course, unknown>>[]) {
    for (const c of Object.keys(g) as Course[]) if (!allow[c]) { const rs = ([] as (Row & { _line: number })[]).concat(g[c] as never); err(rs[0]._line, '選べるコース（' + courses + '）に ' + c + ' は含まれません'); }
  }
  /* コース */
  const effC: Partial<Record<Course, Row | null>> = {};
  for (const c of CL) {
    const r = courseRows[c], cc = cur.courses[c];
    effC[c] = r || cc || null;
    if (r) diffItem('コース', c, r, cc, COURSE_F);
    const x = effC[c];
    if (!x || !allow[c]) continue;
    const L = r ? r._line : planRow ? (planRow as Row & { _line: number })._line : rows[0]._line;
    if (c === 'スタンダード' && num(x['冷凍_月次提供数_上限']) + num(x['冷蔵常温_月次提供数_上限']) !== tot) err(L, 'スタンダード：冷凍の上限（' + x['冷凍_月次提供数_上限'] + '）＋冷蔵常温の上限（' + x['冷蔵常温_月次提供数_上限'] + '）が月次提供上限の合計（' + tot + '）と合いません');
    if (c !== 'スタンダード' && num(x['冷蔵常温_月次提供数_上限']) !== tot) err(L, c + '：冷蔵常温の上限（' + x['冷蔵常温_月次提供数_上限'] + '）は月次提供上限の合計（' + tot + '）と同じにしてください');
    if (num(x['冷蔵常温_月次提供数_下限']) > num(x['冷蔵常温_月次提供数_上限'])) err(L, c + '：冷蔵常温の下限が上限を超えています');
    if (!(num(x['冷蔵常温_標準の配送回数']) >= 1) || (c === 'スタンダード' && !(num(x['冷凍_標準の配送回数']) >= 1))) err(L, c + '：標準の配送回数は1以上にしてください');
  }
  /* 価格 */
  const rate = /8%/.test(plan?.['企業負担分の税率'] ?? '') ? 0.08 : 0.1, sub = Math.floor((num(plan?.['企業負担額（税込・1食）']) * tot) / (1 + rate));
  for (const c of CL) {
    const list: Gen[] = (cur.prices[c] || []).map((g) => ({ ...g }));
    (priceRows[c] || []).forEach((r) => {
      const ex = list.find((g) => g['価格プラン'] === r['価格プラン']) ?? null;
      /* 料金の元は価格世代（課題 4b-9）。いまのプランの価格の行は CSV では変えない（変更なしの行だけ置ける） */
      const NO_PRICE = c + '「' + r['価格プラン'] + '」：価格はプランマスタの編集の「価格プラン」の表で足す・直す・消してください（CSV の価格の行では変えられません）';
      if (r['削除'] === '1') {
        if (!isNew) { err(r._line, NO_PRICE); return; }
        if (!ex) { err(r._line, c + '「' + r['価格プラン'] + '」は登録されていないので削除できません'); return; }
        if (ex.used) { err(r._line, c + '「' + r['価格プラン'] + '」は子契約 ' + ex.used + '件で使われているので削除できません'); return; }
        list.splice(list.indexOf(ex), 1);
        item('価格', c, r._line, '削除', '「' + r['価格プラン'] + '」（' + ex['開始期間'] + '〜 ' + yen(String(ex['価格（COOL便）'] ?? '')) + '円）を削除');
        return;
      }
      if (ex) {
        if (ex.used && (num(ex['価格（COOL便）']) !== num(r['価格（COOL便）']) || num(ex['価格（ES配送便）']) !== num(r['価格（ES配送便）']) || ex['開始期間'] !== r['開始期間'])) {
          err(r._line, c + '「' + r['価格プラン'] + '」は子契約 ' + ex.used + '件で使われているので、価格・開始期間は変えられません（料金を変えるときは新しい世代を追加する）');
          return;
        }
        const ch = PRICE_F.filter((f) => (f.indexOf('価格') === 0 ? num(ex[f]) !== num(r[f]) : (ex[f] || '') !== (r[f] || '')));
        if (ch.length && !isNew) { err(r._line, NO_PRICE); return; }
        if (ch.length) { item('価格', c, r._line, '上書き', '「' + r['価格プラン'] + '」 ' + ch.map((f) => f + ' ' + (ex[f] || '（空）') + ' → ' + (r[f] || '（空）')).join('／')); ch.forEach((f) => { ex[f] = r[f]; }); }
        else item('価格', c, r._line, '変更なし', '「' + r['価格プラン'] + '」');
      } else {
        if (!isNew) { err(r._line, NO_PRICE); return; }
        const g: Gen = { used: 0, 価格プラン: r['価格プラン'] };
        PRICE_F.forEach((f) => { g[f] = r[f]; });
        list.push(g);
        item('価格', c, r._line, '追加', '「' + r['価格プラン'] + '」 ' + r['開始期間'] + '〜' + (r['終了期間'] || '') + ' COOL便 ' + yen(r['価格（COOL便）']) + '円・ES配送便 ' + yen(r['価格（ES配送便）']) + '円' + (r['公開用'] === '1' ? '（公開用）' : ''));
      }
    });
    if (!allow[c]) continue;
    if (!(priceRows[c] || []).length && !isNew) continue;
    const L = priceRows[c]?.[0]._line || rows[0]._line;
    if (list.length) { const pub = list.filter((g) => g['公開用'] === '1').length; if (pub !== 1) err(L, c + '：公開用の価格プランが' + pub + '行あります（1行だけにしてください）'); }
    else if (isNew) err(L, c + '：価格の行がありません（新しいプランは価格の行が必要です）');
    list.forEach((g) => { if ((c !== V && num(g['価格（COOL便）']) < sub) || num(g['価格（ES配送便）']) < sub) err(L, c + '「' + g['価格プラン'] + '」：価格が企業負担分（' + sub.toLocaleString() + '円）より小さく、基本料金が0円未満になります'); });
  }
  /* 設備（置き換え） */
  for (const c of CL) {
    const rs = eqRows[c];
    if (!rs) continue;
    if (c === 'ライト' && effC['ライト']?.['スタンダードと同じ構成にする'] === 'する') { err(rs[0]._line, 'ライトは「スタンダードと同じ構成にする＝する」なので、ライトの設備の行は書けません'); continue; }
    let bad = false;
    rs.forEach((r) => {
      if (!models[r['機種ID']]) { err(r._line, '機種ID ' + r['機種ID'] + ' は機種マスタ（冷蔵庫・冷凍庫・資材ボックス）にありません'); bad = true; }
      if (!(num(r['台数']) >= 1)) { err(r._line, '台数は1以上にしてください'); bad = true; }
    });
    if (!rs.some((r) => r['パターン'] === '標準')) { err(rs[0]._line, c + '：標準 の行がありません'); bad = true; }
    rs.forEach((r) => {
      const m = r['機種ID'];
      if (c === V && /^(RF|FZ)/.test(m)) { err(r._line, 'ライト（自販機）の設備に冷蔵庫・冷凍庫（' + m + '）は入れられません'); bad = true; }
      if (c !== V && /^VM/.test(m)) { err(r._line, c + 'の設備に自販機（' + m + '）は入れられません（自販機は ライト（自販機）のコース）'); bad = true; }
    });
    if (c === V && !rs.some((r) => /^VM/.test(r['機種ID']))) { err(rs[0]._line, 'ライト（自販機）の設備に自販機（VM）の行がありません'); bad = true; }
    if (bad) continue;
    const old = cur.equip[c] || [], det: { cls: string; text: string }[] = [];
    rs.forEach((r) => {
      const o = old.find((e) => e['パターン'] === r['パターン'] && e['機種ID'] === r['機種ID']);
      const nm = r['パターン'] + ' ' + r['機種ID'] + ' ' + models[r['機種ID']];
      if (!o) det.push({ cls: 'pmci-add', text: '＋ ' + nm + ' ×' + r['台数'] });
      else if (o['台数'] !== r['台数'] || (o['設備の備考'] || '') !== (r['設備の備考'] || '')) det.push({ cls: 'pmci-upd', text: nm + ' ×' + o['台数'] + ' → ×' + r['台数'] });
      else det.push({ cls: 'pmci-same', text: nm + ' ×' + r['台数'] });
    });
    old.forEach((e) => { if (!rs.some((r) => r['パターン'] === e['パターン'] && r['機種ID'] === e['機種ID'])) det.push({ cls: 'pmci-del', text: '− ' + e['パターン'] + ' ' + e['機種ID'] + ' ' + (models[e['機種ID']] || '') + ' ×' + e['台数'] + '（消える）' }); });
    const changed = det.some((h) => h.cls !== 'pmci-same');
    item('設備', c, rs.map((r) => r._line).join('・'), changed ? '置き換え' : '変更なし', '', det);
  }
  if (!isNew && cur.contracts && (P.cnt['上書き'] || P.cnt['置き換え']))
    P.warn.push('契約中 ' + cur.contracts + '拠点。作成済みの子契約は変わらず、次に作る子契約から効きます' + (P.cnt['置き換え'] ? '（設備の置き換えは、これからの申込・受付の標準だけ。貸出中の設備は変わりません）' : ''));
  if (P.name === '—') {
    const pi = P.items.find((i) => i.kind === 'プラン');
    P.name = pi ? pi.text.replace(/^公開用プラン名：([^／]*).*/, '$1') : '—';
  }
  return P;
}

/** 確定：エラーのないプランだけ、CSV の行を当てた形を返す（新しいプランは null を返し、呼び出し側で採番する） */
export function applyRows(text: string, key: string, cur: PlanDb | null): PlanDb {
  const d: PlanDb = cur ? JSON.parse(JSON.stringify(cur)) : { contracts: 0, plan: null, courses: {}, prices: {}, equip: {} };
  const eqNew: Partial<Record<Course, Row[]>> = {};
  for (const r of parseCSV(text).slice(1)) {
    const o: Row = {};
    COLS.forEach((c, j) => { o[c] = (r[j] || '').trim(); });
    if (o['プランID／仮キー'] !== key) continue;
    const c = o['コース'] as Course;
    if (o['行区分'] === 'プラン') d.plan = Object.fromEntries(PLAN_F.map((k) => [k, o[k] ?? '']));
    else if (o['行区分'] === 'コース') d.courses[c] = Object.fromEntries(COURSE_F.map((k) => [k, o[k] ?? '']));
    else if (o['行区分'] === '価格') {
      const l = (d.prices[c] = d.prices[c] || []);
      const ex = l.find((g) => g['価格プラン'] === o['価格プラン']);
      if (o['削除'] === '1') { if (ex) l.splice(l.indexOf(ex), 1); }
      else if (ex) PRICE_F.forEach((f) => { ex[f] = o[f]; });
      else l.push({ 価格プラン: o['価格プラン'], 開始期間: o['開始期間'], 終了期間: o['終了期間'], '価格（COOL便）': c === V ? '' : o['価格（COOL便）'], '価格（ES配送便）': o['価格（ES配送便）'], 公開用: o['公開用'] === '1' ? '1' : '', used: 0 });
    } else if (o['行区分'] === '設備') (eqNew[c] = eqNew[c] || []).push({ パターン: o['パターン'], 機種ID: o['機種ID'], 台数: o['台数'], 設備の備考: o['設備の備考'] });
  }
  for (const c of Object.keys(eqNew) as Course[]) d.equip[c] = eqNew[c];
  return d;
}

/** 新しいプランの値（新規登録の空の値に CSV の形を重ねる） */
export function valuesForNewPlan(db: PlanDb) {
  const { values, tables } = newValues('plans');
  return writePlanDb(values, tables, db);
}

/** 取込の説明（ダイアログの表）。DEMO のときだけ決定番号をつける */
export const IMPORT_RULES: [string, string[], string][] = [
  ['プラン・コース', ['上書き', '新規'], 'プランID なら上書き（任意の列を空欄にすると空にする）、仮キー（例：新規1）なら新規登録して採番'],
  ['価格', ['追加', '上書き', '削除'], 'コース＋価格プランがあれば上書き、なければ追加。ファイルにない世代は残る。「削除」＝1 で削除（どの子契約にも使われていない世代だけ）。使われている世代の価格・開始期間は変えられない'],
  ['ライト（自販機）', [], (DEMO ? '28-184：' : '') + '冷蔵庫の代わりに自販機を置くコース。価格は ES配送便だけ（COOL便は空欄）、設備は自販機の行が必須（初期料金は機種マスタ：2026/10/03）'],
  ['設備', ['置き換え'], 'ファイルに設備の行があるプラン×コースだけ、構成を全部入れ替える（ファイルにない機種は消える）。貸出中の設備は変わらない'],
];

/** エラーを含む例（記入例を少し変えたもの） */
export function errSample(sample: string) {
  let t = sample.replace(/^﻿/, '').split(/\r?\n/);
  t = t.map((l) => (/^価格,ES000004,スタンダード,/.test(l) && /,元の料金,/.test(l) ? l.replace(',44000,44000,', ',45000,45000,') : l));
  t.push('設備,ES000009,ライト' + new Array(29).join(',') + ',標準,RF000002,1,');
  t.push('価格,ES000003,スタンダード' + new Array(22).join(',') + ',改訂第三回目,2026/04/01,,27500,27500,1,,,,,');
  return t.join('\r\n');
}

export const PLAN_CSV_SAMPLE =
  "行区分,プランID／仮キー,コース,公開用プラン名,管理用プラン名,公開ステータス,月次提供上限の合計,基本比×倍,選べるコース,利用人数目安,企業負担額（税込・1食）,企業負担分の税率,基本料金の税率,免責金額,冷凍_月次提供数_上限,冷凍_月次提供数_下限,冷蔵常温_月次提供数_上限,冷蔵常温_月次提供数_下限,冷蔵常温_標準の配送回数,冷凍_標準の配送回数,残りわずか率,相談して決める,スタンダードと同じ構成にする,コースの備考,価格プラン,開始期間,終了期間,価格（COOL便）,価格（ES配送便）,公開用,削除,パターン,機種ID,台数,設備の備考\n" +
  "プラン,ES000004,,100プラン,100プラン,公開,100,2,スタンダード・ライト・ライト（自販機）,14名,100,軽減税率 8%,標準税率 10%,300,,,,,,,,,,,,,,,,,,,,,\n" +
  "コース,ES000004,スタンダード,,,,,,,,,,,,20,1,80,0,2,2,25,しない,,,,,,,,,,,,,\n" +
  "コース,ES000004,ライト,,,,,,,,,,,,,,100,0,2,,25,しない,する,,,,,,,,,,,,\n" +
  "コース,ES000004,ライト（自販機）,,,,,,,,,,,,,,100,0,2,,25,しない,,,,,,,,,,,,,\n" +
  "価格,ES000004,スタンダード,,,,,,,,,,,,,,,,,,,,,,元の料金,2024/01/30,2024/09/30,44000,44000,,,,,,\n" +
  "価格,ES000004,スタンダード,,,,,,,,,,,,,,,,,,,,,,改訂第一回目,2024/10/01,2024/12/31,46000,46000,,,,,,\n" +
  "価格,ES000004,スタンダード,,,,,,,,,,,,,,,,,,,,,,改訂第二回目,2025/01/01,2026/03/31,48000,48000,,,,,,\n" +
  "価格,ES000004,スタンダード,,,,,,,,,,,,,,,,,,,,,,改訂第三回目,2026/04/01,,49500,49500,1,,,,,\n" +
  "価格,ES000004,ライト,,,,,,,,,,,,,,,,,,,,,,元の料金,2024/01/30,2024/09/30,41000,41000,,,,,,\n" +
  "価格,ES000004,ライト,,,,,,,,,,,,,,,,,,,,,,改訂第一回目,2024/10/01,2024/12/31,43000,43000,,,,,,\n" +
  "価格,ES000004,ライト,,,,,,,,,,,,,,,,,,,,,,改訂第二回目,2025/01/01,2026/03/31,45000,45000,,,,,,\n" +
  "価格,ES000004,ライト,,,,,,,,,,,,,,,,,,,,,,改訂第三回目,2026/04/01,,46000,46000,1,,,,,\n" +
  "価格,ES000004,ライト（自販機）,,,,,,,,,,,,,,,,,,,,,,元の料金,2024/01/30,2024/09/30,,47000,,,,,,\n" +
  "価格,ES000004,ライト（自販機）,,,,,,,,,,,,,,,,,,,,,,改訂第一回目,2024/10/01,2024/12/31,,49000,,,,,,\n" +
  "価格,ES000004,ライト（自販機）,,,,,,,,,,,,,,,,,,,,,,改訂第二回目,2025/01/01,2026/03/31,,51000,,,,,,\n" +
  "価格,ES000004,ライト（自販機）,,,,,,,,,,,,,,,,,,,,,,改訂第三回目,2026/04/01,,,48000,1,,,,,\n" +
  "設備,ES000004,スタンダード,,,,,,,,,,,,,,,,,,,,,,,,,,,,,標準,RF000001,1,1回の納品数40 ≦ 最大収納数50\n" +
  "設備,ES000004,スタンダード,,,,,,,,,,,,,,,,,,,,,,,,,,,,,標準,FZ000001,1,【仮】冷凍庫の表は資料待ち\n" +
  "設備,ES000004,スタンダード,,,,,,,,,,,,,,,,,,,,,,,,,,,,,標準,BX000001,1,\n" +
  "設備,ES000004,スタンダード,,,,,,,,,,,,,,,,,,,,,,,,,,,,,標準,BX000002,1,\n" +
  "設備,ES000004,スタンダード,,,,,,,,,,,,,,,,,,,,,,,,,,,,,標準,BX000003,1,衛生上、床に直置きしない\n" +
  "設備,ES000004,スタンダード,,,,,,,,,,,,,,,,,,,,,,,,,,,,,標準,BX000005,1,解約時は回収\n" +
  "設備,ES000004,ライト（自販機）,,,,,,,,,,,,,,,,,,,,,,,,,,,,,標準,VM000001,1,冷蔵庫の代わり\n" +
  "設備,ES000004,ライト（自販機）,,,,,,,,,,,,,,,,,,,,,,,,,,,,,標準,BX000001,1,\n" +
  "設備,ES000004,ライト（自販機）,,,,,,,,,,,,,,,,,,,,,,,,,,,,,標準,BX000002,1,\n" +
  "設備,ES000004,ライト（自販機）,,,,,,,,,,,,,,,,,,,,,,,,,,,,,標準,BX000003,1,衛生上、床に直置きしない\n" +
  "設備,ES000004,ライト（自販機）,,,,,,,,,,,,,,,,,,,,,,,,,,,,,標準,BX000005,1,解約時は回収\n" +
  "プラン,新規1,,○○社専用150プラン,○○社専用150プラン,非公開,150,3,スタンダード,21名,100,軽減税率 8%,標準税率 10%,400,,,,,,,,,,,,,,,,,,,,,\n" +
  "コース,新規1,スタンダード,,,,,,,,,,,,30,1,120,0,2,2,25,しない,,,,,,,,,,,,,\n" +
  "価格,新規1,スタンダード,,,,,,,,,,,,,,,,,,,,,,元の料金,2026/11/01,,69800,69800,1,,,,,\n" +
  "設備,新規1,スタンダード,,,,,,,,,,,,,,,,,,,,,,,,,,,,,標準,RF000002,1,\n" +
  "設備,新規1,スタンダード,,,,,,,,,,,,,,,,,,,,,,,,,,,,,標準,FZ000001,1,\n" +
  "設備,新規1,スタンダード,,,,,,,,,,,,,,,,,,,,,,,,,,,,,標準,BX000001,1,\n" +
  "設備,新規1,スタンダード,,,,,,,,,,,,,,,,,,,,,,,,,,,,,標準,BX000002,1,\n" +
  "設備,新規1,スタンダード,,,,,,,,,,,,,,,,,,,,,,,,,,,,,標準,BX000003,1,衛生上、床に直置きしない\n" +
  "設備,新規1,スタンダード,,,,,,,,,,,,,,,,,,,,,,,,,,,,,標準,BX000005,1,解約時は回収\n" +
  "価格,ES000003,スタンダード,,,,,,,,,,,,,,,,,,,,,,改訂第三回目,2026/04/01,,27500,27500,1,,,,,\n" +
  "価格,ES000003,ライト,,,,,,,,,,,,,,,,,,,,,,改訂第四回目,,,,,,1,,,,\n" +
  "設備,ES000009,スタンダード,,,,,,,,,,,,,,,,,,,,,,,,,,,,,標準,RF000002,1,標準 84L＋142L\n" +
  "設備,ES000009,スタンダード,,,,,,,,,,,,,,,,,,,,,,,,,,,,,標準,RF000004,1,\n" +
  "設備,ES000009,スタンダード,,,,,,,,,,,,,,,,,,,,,,,,,,,,,代替,RF000002,2,代替 84L×2\n" +
  "設備,ES000009,スタンダード,,,,,,,,,,,,,,,,,,,,,,,,,,,,,標準,BX000004,1,タンス型\n" +
  "設備,ES000009,スタンダード,,,,,,,,,,,,,,,,,,,,,,,,,,,,,標準,BX000005,1,\n" +
  "";
