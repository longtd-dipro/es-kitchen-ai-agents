import { DEVICES_SPEC } from './spec/devices';
import { DISCOUNTS_SPEC } from './spec/discounts';
import { OPTIONS_SPEC } from './spec/options';
import { MATERIALS_SPEC } from './spec/materials';
import { PLANS_SPEC } from './spec/plans';
import type { Block, Card, Cell, Field, Fill, MasterKind, MasterRec, MasterSpec, Part, TRow, V, VmGrid } from './types';
import { yen } from '@/lib/format/money';

/*
 * マスタの計算（画面と actions の両方で使う）。元のデモの mlFill・mlSetMode・mlFilter・mlDelete と
 * プランマスタの保存時のチェック（決定 28-178・RV-OPS-20261002 O-i）を関数にしたもの。
 */

export const SPECS: Record<MasterKind, MasterSpec> = { devices: DEVICES_SPEC, plans: PLANS_SPEC, options: OPTIONS_SPEC, discounts: DISCOUNTS_SPEC, materials: MATERIALS_SPEC };
export const specOf = (kind: MasterKind) => SPECS[kind];

/** ID の頭（新規登録の採番）。機種は機種区分で決まる */
export const ID_HEAD: Record<MasterKind, string> = { devices: 'RF', plans: 'ES', options: 'OP', discounts: 'DC', materials: 'S' };
export const DEVICE_HEAD: Record<string, string> = { 冷蔵庫: 'RF', 冷凍庫: 'FZ', 自販機: 'VM', 電子レンジ: 'MW', ホットウォーマー: 'HW', 資材ボックス: 'BX' };

/* ---------- spec をたどる ---------- */

/** 項目の置き場所：タブ（pane）・区分パネル（kpanel）・カード */
export type FieldAt = { f: Field; pane: string; kpanel?: string; card: Card };
export type TableAt = { b: Extract<Block, { t: 'table' }>; pane: string; card: Card };

function walkBlocks(bs: Block[], at: { pane: string; card: Card; kpanel?: string }, fs: FieldAt[], ts: TableAt[]) {
  for (const b of bs) {
    if (b.t === 'cols') b.fields.forEach((f) => fs.push({ f, ...at }));
    else if (b.t === 'kpanel') walkBlocks(b.blocks, { ...at, kpanel: b.k }, fs, ts);
    else if (b.t === 'table') ts.push({ b, pane: at.pane, card: at.card });
  }
}
const cache = new Map<MasterKind, { fields: FieldAt[]; tables: TableAt[] }>();
export function indexOf(kind: MasterKind) {
  let c = cache.get(kind);
  if (!c) {
    const d = specOf(kind).detail, fields: FieldAt[] = [], tables: TableAt[] = [];
    (d.top ?? []).forEach((card) => walkBlocks(card.blocks, { pane: 'top', card }, fields, tables));
    d.panes.forEach((p) => p.cards.forEach((card) => walkBlocks(card.blocks, { pane: p.id, card }, fields, tables)));
    c = { fields, tables };
    cache.set(kind, c);
  }
  return c;
}
/** 項目名（data-name）から項目を探す（タブを指定できる） */
export function fieldByName(kind: MasterKind, name: string, pane?: string) {
  return indexOf(kind).fields.find((x) => x.f.name === name && (!pane || x.pane === pane))?.f;
}

/* ---------- 値 ---------- */

export type Values = Record<string, V[]>;
export type Tables = Record<string, TRow[]>;

/** 値を持つ部品を順に（V[] の位置と対応） */
export function valueParts(ps: Part[], out: Part[] = []): Part[] {
  for (const p of ps) {
    if (p.t === 'in' || p.t === 'sel' || p.t === 'ta' || p.t === 'ck' || p.t === 'photos' || p.t === 'vmbox') out.push(p);
    else if (p.t === 'box') valueParts(p.kids, out);
  }
  return out;
}

const clone = <T,>(x: T): T => (x === undefined ? x : JSON.parse(JSON.stringify(x)));

/** 選択肢に合う文字（元の mlFill：同じ／前方一致。なければその文字のまま＝選択肢に足す） */
function pickOption(o: string[], v: string) {
  return o.find((x) => x === v) ?? o.find((x) => x.indexOf(v) === 0) ?? v;
}

/** 一覧の行の差し替え（fill）を1項目に当てる（元の mlFill） */
export function fillField(f: Field, fill: Fill | undefined): V[] {
  const v = clone(f.v);
  if (!fill) return v;
  const ps = valueParts(f.ctl);
  const put = (i: number, x: string) => {
    const p = ps[i];
    v[i] = p && p.t === 'sel' ? pickOption(p.o, x) : x;
  };
  if (f.name && f.mi !== undefined && typeof fill[f.name] === 'string') put(f.mi, fill[f.name] as string);
  for (const [lbl, i] of Object.entries(f.sub ?? {})) {
    const x = fill[`${f.name}/${lbl}`];
    if (typeof x === 'string') put(i, x);
  }
  return v;
}

/** 文字だけの表の行（fill の '#見出し'） */
export const textRows = (rows: string[][]): TRow[] => rows.map((r) => ({ c: r.map((text) => ({ text: String(text) })) }));

/** 1件の値（保存した値 ＞ fill ＞ 見本） */
export function valuesOf(kind: MasterKind, rec: MasterRec | null): Values {
  const out: Values = {};
  for (const { f } of indexOf(kind).fields) out[f.k] = rec?.values?.[f.k] ? clone(rec.values[f.k]) : fillField(f, rec?.fill);
  return out;
}
export function tablesOf(kind: MasterKind, rec: MasterRec | null): Tables {
  const out: Tables = {};
  for (const { b } of indexOf(kind).tables) {
    const saved = rec?.tables?.[b.key];
    const filled = rec?.fill?.['#' + b.key];
    out[b.key] = saved ? clone(saved) : Array.isArray(filled) ? textRows(filled) : clone(b.rows);
  }
  return out;
}

/** 新規登録の初期値（元の mlSetMode('new')：入力する項目は空・先頭の選択肢、ID は「（登録時に採番）」。表は空） */
export function newValues(kind: MasterKind): { values: Values; tables: Tables } {
  const values: Values = {};
  for (const { f } of indexOf(kind).fields) {
    const v = clone(f.v), ps = valueParts(f.ctl);
    if (f.edit !== '1') {
      const i = ps.findIndex((p) => p.t === 'in' || p.t === 'ta');
      if (i >= 0 && /ID$/.test(f.name ?? '')) v[i] = '（登録時に採番）';
    } else {
      ps.forEach((p, i) => {
        if ((p.t === 'in' || p.t === 'ta') && !p.ro) v[i] = '';
        else if (p.t === 'sel' && !p.dis) v[i] = p.o[0] ?? '';
      });
    }
    values[f.k] = v;
  }
  /* オプション：A型（契約項目に連動）はシステム定義。新規では選べないので「連動しない」にする（2026/09/28） */
  if (kind === 'options') {
    const lt = fieldByName(kind, '連動タイプ');
    if (lt) {
      const p = valueParts(lt.ctl)[0];
      if (p.t === 'sel') values[lt.k] = [p.o.find((x) => !/^A/.test(x)) ?? p.o[0]];
    }
    for (const n of ['連動する契約項目', '連動条件', '連動の不一致を検知']) {
      const f = fieldByName(kind, n);
      if (f) values[f.k] = [ '—（連動しない）' ];
    }
  }
  /* プラン：残りわずか率の初期値 25%（台帳 F 2026-10-05） */
  if (kind === 'plans') {
    for (const { f } of indexOf(kind).fields) {
      if (f.name === '残りわずか率（%）' && f.edit === '1') values[f.k] = values[f.k].map((x, i) => (valueParts(f.ctl)[i]?.t === 'in' ? '25' : x));
    }
  }
  const tables: Tables = {};
  for (const { b } of indexOf(kind).tables) tables[b.key] = [];
  return { values, tables };
}

/** 価格プランの表のキー（コースごとのタブ） */
export const PRICE_KEYS = ['ESスタンダード 価格プラン', 'ESライト 価格プラン', 'ESライト（自販機） 価格プラン'] as const;
/**
 * プランマスタの新規登録：価格プランの表に、ほかのプランにある世代の名前の行を全部入れておく（価格は空・公開用は最新＝最後の行。
 * 使わない行は消せる。台帳 F「プランマスタ新規登録の価格プランの初期値」・受付簿 #105）。names＝世代の名前（古い順）
 */
export function withGenRows(s: { values: Values; tables: Tables }, names: string[]): { values: Values; tables: Tables } {
  if (!names.length) return s;
  const tables = { ...s.tables };
  for (const key of PRICE_KEYS) {
    tables[key] = names.map((name, i) => {
      const r = blankRow('plans', key, []);
      if (!r) return { c: [] };
      const c = r.c.map((cell, ci) => (ci === 0 ? { ...cell, v: [i === names.length - 1] } : ci === 1 ? { ...cell, v: [name] } : cell));
      return { ...r, c };
    }).filter((r) => r.c.length);
  }
  return { values: s.values, tables };
}

/** チェックボックスのラベル（box の中の txt。値の配列と同じ並び） */
export const ckLabels = (f: Field | undefined): string[] => (f?.ctl ?? []).filter((p) => p.t === 'box').map((p) => (p.t === 'box' ? p.kids.find((k) => k.t === 'txt') : undefined)).map((k) => (k && k.t === 'txt' ? k.text ?? '' : ''));
/** オプションの「すべて」を先頭に持つチェック（対象のコース・対象の機種区分。受付簿 #119） */
export const ALL_CHECKS = ['対象のコース', '対象の機種区分'];
/** 「すべて」のチェックの値 → 選んだもの（すべて＝空。共通データの targetCourses／targetModelKinds の形） */
export function allCheckTargets(f: Field | undefined, v: V[] | undefined): string[] {
  if (!f || !v || v[0] === true) return [];
  return ckLabels(f).slice(1).filter((_, i) => v[i + 1] === true);
}
/** 共通データの targetCourses／targetModelKinds → チェックの値（空＝すべて ON） */
export function allCheckValues(f: Field | undefined, sel: string[] | undefined): V[] {
  const labels = ckLabels(f).slice(1);
  return [!sel?.length, ...labels.map((x) => !!sel?.length && sel.includes(x))];
}

/** 主な値（文字）。fill と同じ位置（mi） */
export function mainValue(f: Field | undefined, values: Values): string {
  if (!f) return '';
  const v = values[f.k]?.[f.mi ?? 0];
  return v === undefined || v === null ? '' : String(v);
}
export const valueOfName = (kind: MasterKind, values: Values, name: string, pane?: string) => mainValue(fieldByName(kind, name, pane), values);

/* ---------- 画面の出し分け ---------- */

/** 機種区分のドロップダウン（data-kubun）の値。区分パネルはこの値のものだけ出す */
export function kubunOf(kind: MasterKind, values: Values): string | undefined {
  const at = indexOf(kind).fields.find((x) => x.f.ctl.some((p) => p.t === 'sel' && p.kubun));
  return at ? String(values[at.f.k]?.[0] ?? '') : undefined;
}
/** A型（契約項目に連動）のオプションか */
export function isAType(values: Values): boolean {
  const f = fieldByName('options', '連動タイプ');
  return !!f && /^A/.test(String(values[f.k]?.[0] ?? ''));
}
/** A型だけの欄（連動しないときは出さない。2026/09/29） */
export const A_ONLY = ['連動する契約項目', '連動条件', '数量の取り方', '連動の不一致を検知'];

/** 項目を出すか（区分パネル・A型だけの欄） */
export function fieldShown(kind: MasterKind, at: FieldAt, values: Values): boolean {
  if (at.kpanel && at.kpanel !== kubunOf(kind, values)) return false;
  if (kind === 'options' && at.f.name && A_ONLY.includes(at.f.name) && !isAType(values)) return false;
  return true;
}

/** 項目を入力できるか（元の mlFields：data-rop='0' かつ data-na!='1'） */
export const fieldEditable = (f: Field) => f.rop === '0' && f.na !== '1';

/* ---------- サマリー（見出しの下の小さい表示） ---------- */

const yenS = (s: string) => {
  const n = num(s);
  return s.trim() === '' || isNaN(n) ? s : yen(n);
};

/** サマリーの値（保存した値から作れるものは作る。ほかは fill の '@ラベル'・見本） */
export function sumOf(kind: MasterKind, rec: MasterRec | null, values: Values, tables: Tables): { label: string; value: string; corp?: string | null }[] {
  const spec = specOf(kind).detail;
  const live: Record<string, string> = {};
  const v = (n: string, pane?: string) => valueOfName(kind, values, n, pane);
  if (rec?.values) {
    if (kind === 'devices') {
      const kb = kubunOf(kind, values) ?? '';
      Object.assign(live, {
        機種ID: rec.id, 機種名: v('機種名'), 機種区分: kb, 公開ステータス: v('公開ステータス'),
        '月額料金（税抜き）': yenS(v('月額料金（税抜き）')), 最低利用期間: v('最低利用期間') ? v('最低利用期間') + 'ヶ月' : '—',
        メーカー: deviceMaker(values) || '—', 貸出中: rec.row?.n ?? '0台',
      });
    } else if (kind === 'plans') {
      const pubRow = (key: string) => (tables[key] ?? []).find((r) => r.c[0]?.v?.[0] === true);
      const price = (key: string, col: number) => { const r = pubRow(key); const x = r ? String(r.c[col]?.v?.[0] ?? '') : ''; return x ? yenS(x) : '—'; };
      const st = pubRow('ESスタンダード 価格プラン');
      Object.assign(live, {
        プランID: rec.id, プラン名: v('公開用プラン名'), コース: coursesOf(values).map((c) => COURSE_SHORT[c]).join('・'),
        月次提供上限: v('月次提供上限の合計') + '食', 公開ステータス: v('公開ステータス'),
        'スタンダード COOL便': price('ESスタンダード 価格プラン', 4), 'ライト COOL便': price('ESライト 価格プラン', 4), 'ライト（自販機） ES配送便': price('ESライト（自販機） 価格プラン', 4),
        公開中の価格プラン: st ? `${st.c[1]?.v?.[0]}（${st.c[2]?.v?.[0]}〜）` : '—',
      });
    } else if (kind === 'options') {
      Object.assign(live, { オプションID: rec.id, オプション名: v('管理名（社内用）'), 連動タイプ: v('連動タイプ'), 料金種別: v('料金種別'), 標準金額: /^[\d,]+$/.test(v('標準金額（税抜）')) ? v('標準金額（税抜）') + '円' : rec.row?.amt ?? v('標準金額（税抜）'), 適用中: rec.row?.n ?? '0拠点' });
    } else {
      Object.assign(live, { 値引きID: rec.id, 値引き名: v('値引き名（管理用）'), 値引き区分: v('値引き区分'), 適用対象: v('適用対象'), 計算区分: v('計算区分'), 適用中: rec.row?.n ?? '0拠点' });
    }
  }
  return spec.sum.map((s) => {
    const f = rec?.fill?.['@' + s.label];
    return { ...s, value: live[s.label] ?? (typeof f === 'string' ? f : s.value) };
  });
}

/** 機種のメーカー（機種区分ごとの欄） */
export function deviceMaker(values: Values): string {
  const kb = kubunOf('devices', values) ?? '';
  const name = { 冷蔵庫: '冷蔵庫／冷凍庫メーカー', 冷凍庫: '冷蔵庫／冷凍庫メーカー', 自販機: '自販機メーカー', 電子レンジ: '電子レンジメーカー', ホットウォーマー: 'ホットウォーマーメーカー' }[kb];
  const at = name ? indexOf('devices').fields.find((x) => x.kpanel === kb && x.f.name === name) : undefined;
  return at ? mainValue(at.f, values) : '';
}

/* ---------- プラン（計算・チェック） ---------- */

export const num = (s: unknown) => Number(String(s ?? '').replace(/[^\d.\-]/g, ''));
const comma = (n: number) => n.toLocaleString('ja-JP');

/** コース（プランのチェックボックスの並び）。CSV の「選べるコース」の書き方とタブ */
export const COURSES = ['ESスタンダード', 'ESライト（冷蔵庫）', 'ESライト（自販機）'] as const;
export const COURSE_SHORT: Record<string, string> = { ESスタンダード: 'スタンダード', 'ESライト（冷蔵庫）': 'ライト（冷蔵庫）', 'ESライト（自販機）': 'ライト（自販機）' };
export const COURSE_PANE: Record<string, string> = { ESスタンダード: 'pm-1', 'ESライト（冷蔵庫）': 'pm-2', 'ESライト（自販機）': 'pm-3' };
export function coursesOf(values: Values): string[] {
  const f = fieldByName('plans', 'コース');
  const v = f ? values[f.k] ?? [] : [];
  return COURSES.filter((_, i) => v[i] === true);
}

/** 企業負担分（税抜）＝ 企業負担額 × 月次提供上限の合計 ÷（1＋税率）、1円未満四捨五入（台帳 F 2026-10-05。旧：切り捨て 28-148） */
export function planSubsidy(values: Values) {
  const v = (n: string) => valueOfName('plans', values, n);
  const tot = num(v('月次提供上限の合計')), sub = num(v('企業負担額（税込・1食）')) || 0;
  const rt = /8%/.test(v('企業負担分の税率')) ? 0.08 : 0.1;
  return { tot, sub, rt, subEx: Math.round((sub * tot) / (1 + rt)) };
}

/** 自動で計算する欄（企業負担分・1回の納品数・価格の内訳・スタンダードアップ差額）を入れ直す */
export function planDerive(values: Values, tables: Tables): { values: Values; tables: Tables } {
  const vs = { ...values }, ts = { ...tables };
  const { tot, sub, rt, subEx } = planSubsidy(values);
  const f = fieldByName('plans', '企業負担分（税抜・自動計算）');
  if (f && tot > 0) vs[f.k] = [`${comma(subEx)} 円（${sub}円 × ${tot}食 ÷ ${1 + rt}・1円未満四捨五入）`];
  for (const pane of ['pm-1', 'pm-2', 'pm-3']) {
    for (const [what, up, cnt] of [['冷蔵・常温', '冷蔵・常温_月次提供数_上限', '冷蔵・常温_標準の配送回数'], ['冷凍', '冷凍_月次提供数_上限', '冷凍_標準の配送回数']]) {
      const out = fieldByName('plans', `1回の納品数（${what}）`, pane);
      if (!out) continue;
      const a = num(valueOfName('plans', values, up, pane)), b = num(valueOfName('plans', values, cnt, pane));
      if (a >= 0 && b >= 1) vs[out.k] = [String(Math.ceil(a / b))];
    }
  }
  const split = (p: unknown) => { const n = num(p); return String(p ?? '').trim() === '' || isNaN(n) ? '' : `${comma(n - subEx)} ／ ${comma(subEx)}`; };
  const head = (key: string) => (indexOf('plans').tables.find((x) => x.b.key === key)?.b.head ?? []).map((h) => h.text);
  /* 価格プランの終了期間：空の行に、次に始まる行の開始期間の前日を自動で入れる（行を足すと前の行の終了期間に前日が入る・期間は重ねない：台帳 F） */
  const ymd = (x: unknown) => { const m = /^(\d{4})[/-](\d{1,2})[/-](\d{1,2})$/.exec(String(x ?? '').trim()); return m ? `${m[1]}/${m[2].padStart(2, '0')}/${m[3].padStart(2, '0')}` : ''; };
  const dayBefore = (d: string) => { const [y, m, dd] = d.split('/').map(Number); const t = new Date(y, m - 1, dd - 1); return `${t.getFullYear()}/${String(t.getMonth() + 1).padStart(2, '0')}/${String(t.getDate()).padStart(2, '0')}`; };
  for (const key of ['ESスタンダード 価格プラン', 'ESライト 価格プラン', 'ESライト（自販機） 価格プラン']) {
    const hs = head(key), iC = hs.indexOf('価格（COOL便）'), iE = hs.indexOf('価格（ES配送便）');
    const iSC = hs.findIndex((h) => h.startsWith('内訳 COOL便')), iSE = hs.findIndex((h) => h.startsWith('内訳 ES配送便')), iUp = hs.findIndex((h) => h.startsWith('スタンダードアップ差額'));
    const std = ts['ESスタンダード 価格プラン'] ?? [];
    const starts = (ts[key] ?? []).map((r) => ymd(r.c[2]?.v?.[0])).filter(Boolean).sort();
    ts[key] = (ts[key] ?? []).map((r) => {
      if (!r.c[1]?.v) return r;
      const c = r.c.map((x) => ({ ...x, v: x.v ? [...x.v] : x.v }));
      const from = ymd(c[2]?.v?.[0]);
      if (from && c[3]?.v && String(c[3].v[0] ?? '').trim() === '') { const next = starts.find((d) => d > from); if (next) c[3].v = [dayBefore(next)]; }
      if (iSC >= 0 && iC >= 0) c[iSC].v = [split(c[iC].v?.[0])];
      if (iSE >= 0 && iE >= 0) c[iSE].v = [split(c[iE].v?.[0])];
      if (iUp >= 0) {
        const s = std.find((x) => x.c[1]?.v?.[0] === c[1].v?.[0]);
        const d = (i: number) => (s && String(c[i].v?.[0] ?? '') !== '' ? comma(num(s.c[i]?.v?.[0]) - num(c[i].v?.[0])) : '—');
        c[iUp].v = [s ? `${d(iC)} ／ ${d(iE)}` : '—'];
      }
      return { ...r, c };
    });
  }
  return { values: vs, tables: ts };
}

/* ---------- 入力チェック ---------- */

export type Check = {
  errs: string[];
  /** 赤枠にする項目キー、または「表のキー#行#列」 */
  bad: string[];
  /** プランマスタは見出しの下にまとめて出す（vbox）。ほかはトースト */
  box: boolean;
  /** 項目キー → その項目の下に出す文言（hong 2026/10/05：必須などのエラーは対象の項目の下に出す） */
  msgs: Record<string, string[]>;
  /** 警告（保存は止めない。確かめてから保存：W03 最大収納数 < 1回の納品数） */
  warns: string[];
};
/** チェックに要るデータ（画面・actions が渡す）。capacity＝機種ID → 最大収納数（機種マスタ。なければ W03 は見ない） */
export type ValidateCtx = { capacity?: (modelId: string) => number | undefined };
const addMsg = (msgs: Record<string, string[]>, key: string, m: string) => { (msgs[key] ??= []).push(m.replace(/^[^：]+：/, '')); };

/** 保存・登録の前のチェック（画面と actions で同じ） */
export function validate(kind: MasterKind, values: Values, tables: Tables, mode: 'edit' | 'new', ctx: ValidateCtx = {}): Check {
  const errs: string[] = [], bad: string[] = [], msgs: Record<string, string[]> = {};
  const empty = (x: V | undefined) => x === undefined || (typeof x === 'string' && x.trim() === '');
  if (kind === 'plans') return validatePlan(values, tables, errs, bad, msgs, ctx);
  /* 入力する項目（*）が空 */
  for (const at of indexOf(kind).fields) {
    const f = at.f;
    if (f.req !== 'req' || f.edit !== '1' || !fieldEditable(f) || !fieldShown(kind, at, values)) continue;
    const ps = valueParts(f.ctl), v = values[f.k] ?? [];
    const i = ps.findIndex((p) => (p.t === 'in' || p.t === 'ta') && !p.ro);
    if (i >= 0 && empty(v[i])) { bad.push(f.k); addMsg(msgs, f.k, `${f.label}は必須項目です。`); }
  }
  if (bad.length) errs.push(`必須の項目を入力してください（${bad.map((k) => k.split('/').pop()).join('・')}）`);
  /* オプション：対象のコース・対象の機種区分は「すべて」か個別を1つ以上（E02。受付簿 #119） */
  if (kind === 'options') {
    for (const n of ALL_CHECKS) {
      const f = fieldByName(kind, n);
      if (f && !(values[f.k] ?? []).some((x) => x === true)) { bad.push(f.k); const m = `${f.label}を選択してください。`; errs.push(m); addMsg(msgs, f.k, m); }
    }
  }
  if (mode === 'new' && kind === 'devices' && !DEVICE_HEAD[kubunOf(kind, values) ?? '']) errs.push('機種区分を選択してください。');
  return { errs, bad, box: false, msgs, warns: [] };
}

/**
 * プランマスタの保存時のチェック（決定 28-178〜28-184）。文言は画面設計書の共通メッセージ（docs/05_画面設計書/データ/_共通_メッセージ.py）：
 *   E40 冷凍＋冷蔵・常温の上限 ≧ 合計／E41 温度帯の上限 ≦ 合計／E42 下限 ≦ 上限／E43 配送回数 ≧ 1／E44 価格 ≧ 企業負担分／E45 公開用は1行／
 *   E46 冷凍がないコースは 冷蔵・常温の上限 ＝ 合計／E48 価格プランの期間は重ねない／E49 標準貸出設備に「標準」の行／E50 ライト（自販機）は自販機の行だけ／
 *   W03 標準の冷蔵庫・冷凍庫・自販機の最大収納数 ≧ 1回の納品数（警告：確かめてから保存）
 */
function validatePlan(values: Values, tables: Tables, errs: string[], bad: string[], msgs: Record<string, string[]>, ctx: ValidateCtx): Check {
  const k = (n: string, pane?: string) => fieldByName('plans', n, pane)?.k ?? n;
  const v = (n: string, pane?: string) => valueOfName('plans', values, n, pane);
  const fail = (key: string, m: string) => { bad.push(key); errs.push(m); addMsg(msgs, key, m); };
  const warns: string[] = [];
  /* RV-OPS-20261002 O-i：空の 公開用プラン名・管理用プラン名・基本比×倍 もまとめに出す */
  for (const n of ['公開用プラン名', '管理用プラン名', '基本比×倍']) if (!v(n).trim()) fail(k(n), n + 'は必須項目です。');
  const { tot, subEx } = planSubsidy(values);
  if (!(tot > 0)) fail(k('月次提供上限の合計'), '月次提供上限の合計は必須項目です。');
  const cs = coursesOf(values);
  const ymd = (s: unknown) => String(s ?? '').trim().replace(/\//g, '-');
  const tab = (pane: string, label: string, frozen: boolean, priceKey: string, equipKey: string) => {
    const ch = num(v('冷蔵・常温_月次提供数_上限', pane)), cl = num(v('冷蔵・常温_月次提供数_下限', pane));
    if (frozen) {
      const fz = num(v('冷凍_月次提供数_上限', pane)), fl = num(v('冷凍_月次提供数_下限', pane));
      if (fz + ch < tot) fail(k('冷蔵・常温_月次提供数_上限', pane), `${label}：冷凍と冷蔵・常温の上限の合計が、月次提供上限の合計（${tot}食）より少なくなっています。`);
      if (fz > tot || ch > tot) fail(k(fz > tot ? '冷凍_月次提供数_上限' : '冷蔵・常温_月次提供数_上限', pane), `${label}：各温度帯の上限は月次提供上限の合計（${tot}食）以下にしてください。`);
      if (fl > fz) fail(k('冷凍_月次提供数_下限', pane), `${label}：冷凍の下限が上限を超えています。`);
      if (!(num(v('冷凍_標準の配送回数', pane)) >= 1)) fail(k('冷凍_標準の配送回数', pane), `${label}：冷凍の標準の配送回数は1以上にしてください。`);
    } else if (ch !== tot) fail(k('冷蔵・常温_月次提供数_上限', pane), `${label}：冷凍がないので、冷蔵・常温の上限は月次提供上限の合計（${tot}食）と同じにしてください。`);
    if (cl > ch) fail(k('冷蔵・常温_月次提供数_下限', pane), `${label}：冷蔵・常温の下限が上限を超えています。`);
    if (!(num(v('冷蔵・常温_標準の配送回数', pane)) >= 1)) fail(k('冷蔵・常温_標準の配送回数', pane), `${label}：冷蔵・常温の標準の配送回数は1以上にしてください。`);
    /* 価格プラン（1行＝価格世代） */
    const hs = (indexOf('plans').tables.find((x) => x.b.key === priceKey)?.b.head ?? []).map((h) => h.text);
    const cols = [hs.indexOf('価格（COOL便）'), hs.indexOf('価格（ES配送便）')].filter((i) => i >= 0);
    let pub = 0;
    const rows = (tables[priceKey] ?? []).filter((r) => r.c[1]?.v);
    rows.forEach((r, ri) => {
      if (r.c[0]?.v?.[0] === true) pub++;
      for (const i of cols) {
        const x = r.c[i]?.v?.[0];
        if (x !== undefined && String(x).trim() !== '' && num(x) < subEx) { bad.push(`${priceKey}#${ri}#${i}`); errs.push(`${label}：価格 ${comma(num(x))}円が企業負担分（${comma(subEx)}円）より小さく、基本料金が0円未満になります。`); }
      }
    });
    if (pub !== 1) errs.push(`${label}：公開用の価格プランを1行だけ選んでください。`);
    /* E48：期間（開始期間〜終了期間。終了が空＝続く）が重なる行 */
    let overlap = false;
    rows.forEach((a, i) => rows.forEach((b, j) => {
      if (j <= i) return;
      const af = ymd(a.c[2]?.v?.[0]), at = ymd(a.c[3]?.v?.[0]) || '9999-99-99', bf = ymd(b.c[2]?.v?.[0]), bt = ymd(b.c[3]?.v?.[0]) || '9999-99-99';
      if (!af || !bf || af > bt || bf > at) return;
      overlap = true; bad.push(`${priceKey}#${i}#2`, `${priceKey}#${j}#2`);
    }));
    if (overlap) errs.push(`${label}：価格プランの期間が重なっています。`);
    /* 標準貸出設備（28-182⑦・⑧・28-184⑨）。ライト（冷蔵庫）で「スタンダードと同じ構成にする＝する」のときは見ない */
    if (pane === 'pm-2' && /^する/.test(v('スタンダードと同じ構成にする', pane))) return;
    const eq = (tables[equipKey] ?? []).filter((r) => r.c[2]?.v).map((r, ri) => ({ ri, pattern: String(r.c[0]?.v?.[0] ?? ''), modelId: String(r.c[2]?.v?.[0] ?? '').split(' ')[0], model: String(r.c[2]?.v?.[0] ?? '') }));
    if (!eq.some((e) => e.pattern === '標準')) errs.push(`${label}：標準貸出設備に「標準」パターンの行を1つ以上入れてください。`);
    if (pane === 'pm-3') {
      const cold = eq.filter((e) => /^(RF|FZ)/.test(e.modelId));
      if (!eq.some((e) => /^VM/.test(e.modelId)) || cold.length) { errs.push('ESライト（自販機）：標準貸出設備に自販機の行を1つ以上入れ、冷蔵庫・冷凍庫の行は入れないでください。'); cold.forEach((e) => bad.push(`${equipKey}#${e.ri}#2`)); }
    }
    for (const e of eq.filter((x) => x.pattern === '標準' && /^(RF|FZ|VM)/.test(x.modelId))) {
      const cap = ctx.capacity?.(e.modelId);
      const need = num(v(/^FZ/.test(e.modelId) ? '1回の納品数（冷凍）' : '1回の納品数（冷蔵・常温）', pane));
      if (cap !== undefined && need > 0 && cap < need) warns.push(`${label}：${e.model}の最大収納数（${cap}）が1回の納品数（${need}）より少ないです。このまま保存しますか？`);
    }
  };
  if (cs.includes('ESスタンダード')) tab('pm-1', 'ESスタンダード', true, 'ESスタンダード 価格プラン', 'ESスタンダード 標準貸出設備');
  if (cs.includes('ESライト（冷蔵庫）')) tab('pm-2', 'ESライト（冷蔵庫）', false, 'ESライト 価格プラン', 'ESライト 標準貸出設備');
  if (cs.includes('ESライト（自販機）')) tab('pm-3', 'ESライト（自販機）', false, 'ESライト（自販機） 価格プラン', 'ESライト（自販機） 標準貸出設備');
  return { errs, bad, box: true, msgs, warns };
}

/* ---------- 一覧 ---------- */

/** 「／」でつないだ文字（重複なし・空は除く）。検索の dyn の選択肢と match: 'has' の判定に使う */
export const uniqText = (xs: string[]) => [...new Set(xs.filter(Boolean))].join('／');
const numOf = (s: string) => { const t = String(s ?? '').replace(/[,円\s]/g, ''); if (!t) return undefined; const n = Number(t); return isNaN(n) ? undefined : n; };

/**
 * 一覧の絞り込み（元の mlFilter：入力欄は部分一致、ドロップダウンは前方一致。削除済みは既定で隠す）。
 * range＝q[keys_min]〜q[keys_max]（数・空は無制限。プランの価格は 公開用の価格プランの値）、date＝q[keys_from]〜q[keys_to]（yyyy-mm-dd）、
 * sel の match: 'has'＝「／」でつないだ値のどれかに一致（世代名・機種）。hong 2026/10/05 A〜E
 */
export function filterRows(kind: MasterKind, recs: MasterRec[], q: Record<string, string>, hideDeleted: boolean): MasterRec[] {
  const spec = specOf(kind).list;
  const RANGE_COLS: Record<string, string[]> = { p_cool: ['s_cool', 'l_cool'], p_es: ['s_es', 'l_es', 'v_es'] };
  return recs.filter((r) => {
    const ok = spec.search.every((s) => {
      if (s.t === 'range') {
        const lo = numOf(q[s.keys + '_min'] ?? ''), hi = numOf(q[s.keys + '_max'] ?? '');
        if (lo === undefined && hi === undefined) return true;
        return (RANGE_COLS[s.keys] ?? [s.keys]).some((k) => { const n = numOf(r.row[k] ?? ''); return n !== undefined && (lo === undefined || n >= lo) && (hi === undefined || n <= hi); });
      }
      if (s.t === 'date') {
        const from = (q[s.keys + '_from'] ?? '').trim(), to = (q[s.keys + '_to'] ?? '').trim();
        if (!from && !to) return true;
        const d = (r.row[s.keys] ?? '').slice(0, 10);
        return !!d && (!from || d >= from) && (!to || d <= to);
      }
      const x = (q[s.keys] ?? '').trim();
      if (!x) return true;
      return s.keys.split(',').some((k) => {
        const c = r.row[k];
        if (c === undefined) return false;
        if (s.t === 'sel' && s.match === 'has') return c.split('／').includes(x);
        return s.t === 'sel' ? c.indexOf(x) === 0 : c.toLowerCase().indexOf(x.toLowerCase()) >= 0;
      });
    });
    if (!ok) return false;
    const st = (q.status ?? '').trim();
    if (r.deleted && hideDeleted && st !== '削除済') return false;
    return true;
  });
}

/* ---------- 並べ替え（受付簿 #87・台帳 F「プランマスタ一覧の並べ替え」） ---------- */

export type SortKey = { key: string; dir: 'asc' | 'desc' };
/** オプション区分の並び（オプション区分マスタがないときの既定。台帳 F「オプションの表示順」） */
export const OPTION_CATEGORY_ORDER = ['配送', 'アプリ機能', '設置・作業', '事務', 'ペナルティ'];
/** 並べ替えできる列（data-k）。プラン＝プランID・管理用プラン名・月次提供上限数・公開ステータス（STEP7 L2）。ほかのマスタは主な列 */
export const SORT_COLS: Record<MasterKind, string[]> = {
  plans: ['id', 'name', 'cap', 'status'],
  devices: ['id', 'name', 'kind', 'fee', 'pubst', 'status'],
  options: ['id', 'name', 'kind', 'ftype', 'amt', 'pubst', 'status'],
  discounts: ['id', 'name', 'target', 'calc', 'status'],
  materials: ['id', 'name', 'unit', 'price', 'pubst'],
};
/** 初期の並び：プラン＝月次提供上限数 昇順 → プランID 昇順、オプション＝区分の並び順 → オプションID、ほかは ID 昇順（台帳 E「一覧の初期の並び」） */
export const DEFAULT_SORT: Record<MasterKind, SortKey[]> = {
  plans: [{ key: 'cap', dir: 'asc' }, { key: 'id', dir: 'asc' }],
  devices: [{ key: 'id', dir: 'asc' }],
  options: [{ key: 'kind', dir: 'asc' }, { key: 'id', dir: 'asc' }],
  discounts: [{ key: 'id', dir: 'asc' }],
  materials: [{ key: 'id', dir: 'asc' }],
};
/**
 * 一覧の行を並べる。sort＝運営が選んだ列（その列のあと、初期の並びの残りで並べる）。
 * 数（月次提供上限数・金額）は数として、オプションの区分は区分の並び順（catOrder）で、ほかは文字で比べる
 */
export function sortRows<T extends { row: Record<string, string> }>(kind: MasterKind, rows: T[], sort?: SortKey | null, catOrder: string[] = OPTION_CATEGORY_ORDER): T[] {
  const keys = sort ? [sort, ...DEFAULT_SORT[kind].filter((k) => k.key !== sort.key)] : DEFAULT_SORT[kind];
  const cmp = (k: string, a: string, b: string): number => {
    if (kind === 'options' && k === 'kind') {
      const ia = catOrder.indexOf(a), ib = catOrder.indexOf(b);
      const d = (ia < 0 ? catOrder.length : ia) - (ib < 0 ? catOrder.length : ib);
      if (d) return d;
    }
    const na = numOf(a), nb = numOf(b);
    if (na !== undefined && nb !== undefined) return na - nb;
    if (na !== undefined) return -1;
    if (nb !== undefined) return 1;
    return a.localeCompare(b, 'ja');
  };
  return [...rows].sort((x, y) => {
    for (const { key, dir } of keys) {
      const d = cmp(key, x.row[key] ?? '', y.row[key] ?? '');
      if (d) return dir === 'asc' ? d : -d;
    }
    return 0;
  });
}

/** 使用中の件数（RV-OPS-20261002 O-b：プランは親契約の数、オプション・値引きは適用中の拠点の数） */
export function useCountOf(kind: MasterKind, row: Record<string, string>, planUse?: number): number {
  if (kind === 'plans') return planUse ?? 0;
  const m = (row.n ?? '').match(/(\d[\d,]*)\s*拠点/);
  return m ? +m[1].replace(/,/g, '') : 0;
}
export const deleteBlockedText = (n: number) => `使用中の契約 ${n}件のため削除できません。非公開にする場合は公開ステータスを変えてください。`;

/* ---------- 保存したときに一覧の行を作り直す ---------- */

const badgeOf = (s: string) => (['公開', '有効', '使用中'].includes(s) ? 'es-badge--success' : 'es-badge--neutral');

export function rowFromValues(kind: MasterKind, rec: MasterRec, values: Values, tables: Tables): { row: Record<string, string>; badge: Record<string, string>; name: string } {
  const v = (n: string, pane?: string) => valueOfName(kind, values, n, pane);
  const row = { ...rec.row }, badge = { ...rec.badge };
  let name = rec.name;
  if (kind === 'devices') {
    name = v('機種名');
    Object.assign(row, { id: rec.id, name, kind: kubunOf(kind, values) ?? '', maker: deviceMaker(values) || '—', fee: yenS(v('月額料金（税抜き）') || '0'), term: v('最低利用期間') ? v('最低利用期間') + 'ヶ月' : '—', pubst: v('公開ステータス'), status: rec.deleted ? '削除済' : v('有効状態') });
    row.n ??= '0台';
  } else if (kind === 'plans') {
    name = v('管理用プラン名');
    const pub = (key: string, col: number) => { const r = (tables[key] ?? []).find((x) => x.c[0]?.v?.[0] === true); const x = r ? String(r.c[col]?.v?.[0] ?? '') : ''; return x ? comma(num(x)) : '—'; };
    const cs = coursesOf(values);
    Object.assign(row, {
      id: rec.id, name, pubname: v('公開用プラン名'), cap: v('月次提供上限の合計'), course: cs.map((c) => COURSE_SHORT[c]).join('・'),
      s_cool: cs.includes('ESスタンダード') ? pub('ESスタンダード 価格プラン', 4) : '—', s_es: cs.includes('ESスタンダード') ? pub('ESスタンダード 価格プラン', 5) : '—',
      l_cool: cs.includes('ESライト（冷蔵庫）') ? pub('ESライト 価格プラン', 4) : '—', l_es: cs.includes('ESライト（冷蔵庫）') ? pub('ESライト 価格プラン', 5) : '—',
      v_es: cs.includes('ESライト（自販機）') ? pub('ESライト（自販機） 価格プラン', 4) : '—', status: rec.deleted ? '削除済' : v('公開ステータス'),
      /* 検索だけに使う（一覧の列には出さない。hong 2026/10/05 A〜E）：価格プランの世代名（全コース・「／」でつなぐ）、標準貸出設備の機種名 */
      gen: uniqText(['ESスタンダード 価格プラン', 'ESライト 価格プラン', 'ESライト（自販機） 価格プラン'].flatMap((k) => (tables[k] ?? []).map((r) => String(r.c[1]?.v?.[0] ?? '').trim()))),
      equip: uniqText(['ESスタンダード 標準貸出設備', 'ESライト 標準貸出設備', 'ESライト（自販機） 標準貸出設備'].flatMap((k) => (tables[k] ?? []).map((r) => String(r.c[2]?.v?.[0] ?? '').trim()))),
    });
  } else if (kind === 'options') {
    name = v('管理名（社内用）');
    const amt = v('標準金額（税抜）');
    Object.assign(row, { id: rec.id, name, kind: v('オプション区分'), link: v('連動タイプ'), ftype: v('料金種別').replace(/（.*$/, ''), amt: /^[\d,]+$/.test(amt) ? amt + '円' : row.amt ?? amt, pubst: v('公開ステータス'), status: rec.deleted ? '削除済' : v('利用状態') });
    row.n ??= '0拠点';
  } else {
    name = v('値引き名（管理用）');
    const kindV = v('値引きの種別'), per = v('適用期間の持ち方'), months = v('適用月数');
    Object.assign(row, {
      id: rec.id, name, target: v('適用対象'), calc: v('計算区分'), val: v('値引きの値'),
      period: /単発/.test(kindV) ? '単発' : per === '月数指定' ? `毎月・${months}ヶ月` : '毎月・ずっと', status: rec.deleted ? '削除済' : v('利用状態'),
    });
    row.n ??= '0拠点';
  }
  for (const k of ['pubst', 'status']) if (row[k] !== undefined) badge[k] = badgeOf(row[k]);
  return { row, badge, name };
}

/** 次の ID（頭 ＋ 6桁）。いちばん大きい番号の次 */
export function nextId(head: string, ids: string[]): string {
  const n = Math.max(0, ...ids.filter((x) => x.startsWith(head)).map((x) => +x.slice(head.length) || 0));
  return head + String(n + 1).padStart(6, '0');
}

/* ---------- 表 ---------- */

/** 表の新しい行（先頭の行の形で、値は空） */
export function blankRow(kind: MasterKind, key: string, rows: TRow[]): TRow | null {
  const b = indexOf(kind).tables.find((x) => x.b.key === key)?.b;
  const tpl = b?.rows[0] ?? rows[0];
  if (!tpl) return null;
  return {
    c: tpl.c.map((c): Cell => {
      if (!c.p) return { ...c, text: '' };
      const v = (c.v ?? []).map((x, i) => {
        const p = valueParts(c.p!)[i];
        if (p?.t === 'sel') return p.o[0] ?? '';
        if (p?.t === 'ck') return false;
        if (p?.t === 'in' && p.ro && /^(冷蔵庫|冷凍庫|自販機|資材ボックス)$/.test(String(x))) return String(x);
        return '';
      });
      return { ...c, v };
    }),
  };
}

/** 標準貸出設備の行：機種を選ぶと機種区分を入れ直す */
export function equipKind(model: string): string {
  const h = model.slice(0, 2);
  return { RF: '冷蔵庫', FZ: '冷凍庫', VM: '自販機', BX: '資材ボックス', MW: '電子レンジ', HW: 'ホットウォーマー' }[h] ?? '';
}

/** 自販機の最大収納数：有効なマスの数字 × 列数（ダブルは2）の合計 */
export const vmCapacity = (g: VmGrid) => g.rows.reduce((a, r) => a + r.c.reduce((b, c) => b + (c.off ? 0 : (parseInt(c.t.replace(/\D/g, ''), 10) || 0) * (c.span || 1)), 0), 0);
