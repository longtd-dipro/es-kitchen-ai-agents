import type { Block, Cell, Discount, FeeLine, FieldDef, IntakeCfg, Logistics, TabDef, TableRow, TargetDef } from './types';
import type { Channel } from '@/lib/domain/types';
import type { FormMaster } from '@/lib/domain/formMaster';
import { CHARGE_IDS } from '@/lib/domain/charges';

/*
 * 受付画面（新規・お試し・切替）の計算。元：11_運営_申請受付.html の engine.js（デモエンジン）。
 * 見本の CFG を画面の形に整える（prepareCfg）・配送ルート・異動の表・①固定額の表の組み立て。
 * 画面の状態（IntakeState）は受付画面が持ち、ここの関数はそれを読むだけ（書き換えは画面の側）。
 */

/* ---------------- 見本の整え（元の init の mergeTabs・v16Tabs・routeInit・ebInit） ---------------- */
const TAB_LABEL: Record<string, string> = { corp: '法人', br: '拠点', ct: '親契約', mc: '子契約', eq: '設備・オプション', fee: '料金・請求', sw: '契約種別の切替' };
const REF_RE = /（参照）|・参照）/;

/** 2026/09/29：拠点の基本情報・請求・資料は「拠点」タブにまとめる。タブ名は短く */
function mergeTabs(t: TargetDef) {
  const get = (k: string) => t.tabs.find((x) => x.key === k);
  const br = get('br'), bill = get('bill'), at = get('at');
  if (br) {
    if (bill) br.blocks = br.blocks.concat(bill.blocks);
    if (at) br.blocks = br.blocks.concat([{ b: 'h', text: '資料' }]).concat(at.blocks.filter((b) => b.b !== 'note'));
    t.tabs = t.tabs.filter((x) => x !== bill && x !== at);
  }
  t.tabs.forEach((tb) => { if (TAB_LABEL[tb.key]) tb.label = TAB_LABEL[tb.key]; });
  v16Tabs(t);
}
/* 2026/09/29 v1.6（決定 28-145）：アプリの利用設定・オプション・割引・価格調整は子契約（このサイクル月）で持つ。（参照）の項目は出さない */
function v16Tabs(t: TargetDef) {
  const get = (k: string) => t.tabs.find((x) => x.key === k);
  const br = get('br'), mc = get('mc'), fee = get('fee'), eq = get('eq');
  if (br && mc) {
    let hi = -1;
    br.blocks.forEach((b, k) => { if (hi < 0 && b.b === 'h' && /^アプリの利用設定/.test(b.text)) hi = k; });
    if (hi >= 0) {
      let n = 1;
      while (hi + n < br.blocks.length && /^(sw|fields)$/.test(br.blocks[hi + n].b)) n++;
      const mv = br.blocks.splice(hi, n), carry = /引き継ぎ/.test((mv[0] as { text: string }).text);
      mv[0] = { b: 'h', text: 'アプリの利用設定（このサイクル月）' };
      mv.splice(1, 0, { b: 'note', tone: 'mut', html: '<b>サイクル月ごとに子契約で持ちます</b>（拠点ではありません）。' + (carry ? 'お試しの設定を引き継いでいます。' : '') + 'あとで変えるときは、保存のときに「この子契約だけ／この子契約以降すべて」を選びます。' });
      let at = -1;
      mc.blocks.forEach((b, k) => { if (b.b === 'h' && b.text === '契約') at = k; });
      if (at >= 0) { at++; while (at < mc.blocks.length && mc.blocks[at].b !== 'h') at++; } else at = mc.blocks.length;
      mc.blocks.splice(at, 0, ...mv);
    }
  }
  if (fee && !/お試し/.test(fee.sub || '')) {
    fee.blocks.forEach((b) => {
      if (b.b !== 'fields') return;
      const si = b.items.findIndex((f) => f.key === 'sub');
      let ad = b.items.find((f) => f.key === 'adj');
      if (si >= 0 && !ad) { ad = { key: 'adj', label: '価格調整の適用', type: 'sel', value: 'なし', opts: ['なし', '値上げ', '値下げ', '無料提供（企業負担）'] }; b.items.splice(si + 1, 0, ad); }
      if (ad) { ad.label = '価格調整（このサイクル月）'; ad.hint = 'サイクル月ごとに子契約で持ちます（親契約・拠点には持ちません）。金額は10円単位。'; }
    });
  }
  if (eq) eq.blocks.forEach((b) => { if (b.b === 'h' && /^オプション・割引の異動/.test(b.text)) b.text = 'オプション・割引（このサイクル月）'; });
  t.tabs.forEach((tb) => {
    tb.blocks = tb.blocks.filter((b) => {
      if (b.b === 'h' && REF_RE.test(b.text)) return false;
      if (b.b === 'fields') { b.items = b.items.filter((f) => !REF_RE.test(f.label || '')); return b.items.length > 0; }
      return true;
    });
    /* 中身のなくなった見出しを消す */
    tb.blocks = tb.blocks.filter((b, k, a) => !(b.b === 'h' && (k === a.length - 1 || a[k + 1].b === 'h')));
  });
}

/** 担当者の表（その場で編集） */
export const isStaff = (b: { head?: unknown[] }) => { const h = b.head || []; return h[0] === '区分' && h[1] === '担当者名'; };

/** 編集できる表（設備の異動・オプション・割引の異動・担当者）の元の行 */
export type EditTable = { eid: string; ti: number; kind: 'eq' | 'ap' | 'staff'; head: (string | { t: string; c?: string })[]; orig: TableRow[]; edit: boolean };

export type PreparedCfg = IntakeCfg & { tables: Record<string, EditTable> };

/** 見本の CFG を受付画面の形に整える（元の init）。元の CFG は書き換えない */
export function prepareCfg(src: IntakeCfg): PreparedCfg {
  setIntakeMaster(src.master);
  const cfg = structuredClone(src) as PreparedCfg;
  cfg.tables = {};
  let n = 0;
  cfg.targets.forEach((t, i) => {
    mergeTabs(t);
    /* 2026/09/29：受付では 設備・オプション を 料金・請求 の前に置く */
    const fi = t.tabs.findIndex((x) => x.key === 'fee'), ei = t.tabs.findIndex((x) => x.key === 'eq');
    if (fi >= 0 && ei > fi) t.tabs.splice(fi, 0, t.tabs.splice(ei, 1)[0]);
    t.tabs.forEach((tb) => tb.blocks.forEach((b, k) => {
      /* 配送ルートの表は、運営が入れる配送ルートの設定に置き換える */
      if (b.b === 'table' && /配送ルート/.test(b.title || '')) { t._rdef = b.rows as string[][]; tb.blocks[k] = { b: 'routes' }; return; }
      if (b.b === 'table' && (b.edit || isStaff(b))) {
        const eid = 'e' + (++n);
        b._eid = eid;
        const orig = (b.rows || []).map((r) => { const x = (Array.isArray(r) ? r : r.cells).slice(); while (x.length < (b.head || []).length) x.push(''); return x; });
        cfg.tables[eid] = { eid, ti: i, kind: isStaff(b) ? 'staff' : (b.head || []).join().indexOf('機種') >= 0 ? 'eq' : 'ap', head: b.head, orig, edit: !!b.edit };
      }
    }));
    /* 2026/09/29：拠点の資料は自動保存（保存ボタンは置かない） */
    t.tabs.forEach((tb) => { if (tb.key === 'at') tb.auto = true; });
  });
  return cfg;
}
/** 申込内容確認で確かめたタブ（法人・拠点・子契約の料金）は「確認済み」で始める */
export const PRE_TABS = ['corp', 'br', 'bill', 'ct', 'fee'];

/* ---------------- 画面の状態 ---------------- */
export type Route = { kind: string; wh: string; c1: string; via: string; c2: string; lead: string; cnt: number | null; pat: string; slots: string[] };
export type Saved = { at: string; pre?: boolean; auto?: boolean } | null;
export type IntakeState = {
  phase: 'A' | 'D';
  target: number;
  tab: number;
  atab: string;
  saved: Saved[][];
  confirmed: boolean[];
  acct: boolean;
  acctChk: boolean;
  route: Route[][];
  rtWarn: Record<number, boolean>;
  init: Record<number, string>;
  /** 入力した値（f_<拠点>_<タブ>_<キー>・sw_…） */
  val: Record<string, string | boolean>;
  edit: null | 'A' | 'D';
  snap: string | null;
  /** 行を追加する入力行を開いている表 */
  form: string | null;
  /** 削除した元の行の ID・名前（①の表から外す） */
  hide: string[][];
  /** 編集できる表の今の行 */
  eb: Record<string, TableRow[]>;
  /** 未入力で赤くする欄 */
  bad: string[];
  /** 保存できなかったタブ（タブに「要確認」） */
  saveBad: string | null;
};

/** 運営が保存した受付の入力（サーバーの applications.state に残す。再読込しても戻らない：台帳 運営A 2026-10-06 J1-6） */
export type IntakeDraft = Partial<Pick<IntakeState, 'val' | 'route' | 'init' | 'eb' | 'hide' | 'saved'>>;
/** 画面の状態のうち保存するもの */
export const draftOf = (s: IntakeState): IntakeDraft => ({ val: s.val, route: s.route, init: s.init, eb: s.eb, hide: s.hide, saved: s.saved });

export function initState(cfg: PreparedCfg): IntakeState {
  const eb: Record<string, TableRow[]> = {};
  Object.values(cfg.tables).forEach((e) => { eb[e.eid] = structuredClone(e.orig); });
  const d = cfg.draft ?? {};
  /* 保存したタブ・入力は、拠点の並び・タブの並びが同じときだけ戻す（申込の中身が変わったときは古い入力を持ち込まない） */
  const same = <T,>(x: T[][] | undefined, ref: unknown[][]) => !!x && x.length === ref.length;
  const saved0 = cfg.targets.map((t) => t.tabs.map((tb): Saved => (tb.auto ? { at: '自動保存', auto: true } : PRE_TABS.includes(tb.key) ? { at: '申込内容確認で確認済', pre: true } : null)));
  /* 完了した申込は参照のみ：必須のタブは保存済みとして見せる */
  if (cfg.done) saved0.forEach((r) => r.forEach((_, j) => { r[j] = r[j] ?? { at: '本登録済', pre: true }; }));
  const saved = same(d.saved, saved0) ? saved0.map((r, i) => r.map((x, j) => (d.saved![i]?.[j] && !x?.pre && !x?.auto ? d.saved![i][j] : x))) : saved0;
  return {
    phase: 'A', target: 0, tab: 0, atab: 'info',
    saved,
    confirmed: cfg.targets.map(() => false),
    acct: !!cfg.acctIssued,
    acctChk: !!cfg.modalB?.check?.on,
    route: routesFromCfg(cfg, d.route),
    rtWarn: {}, init: d.init ?? {}, val: d.val ?? {}, edit: null, snap: null, form: null,
    hide: same(d.hide, cfg.targets.map(() => [])) ? d.hide! : cfg.targets.map(() => []),
    eb: Object.fromEntries(Object.entries(eb).map(([k, v]) => [k, d.eb?.[k] ?? v])), bad: [], saveBad: null,
  };
}

/* ---------------- 進捗 ---------------- */
export const activeTargets = (cfg: IntakeCfg) => cfg.targets.filter((t) => t.active !== false);
export function targetSaved(cfg: IntakeCfg, s: IntakeState, i: number) {
  let n = 0, tot = 0;
  cfg.targets[i].tabs.forEach((tb, j) => { if (tb.req) { tot++; if (s.saved[i][j]) n++; } });
  return { n, tot };
}
export const targetReady = (cfg: IntakeCfg, s: IntakeState, i: number) => { const p = targetSaved(cfg, s, i); return p.tot > 0 && p.n === p.tot; };
export const confirmedCount = (cfg: IntakeCfg, s: IntakeState) => cfg.targets.filter((t, i) => t.active !== false && s.confirmed[i]).length;
export const allConfirmed = (cfg: IntakeCfg, s: IntakeState) => confirmedCount(cfg, s) === activeTargets(cfg).length;
/** 詳細情報設定を開いたら、まだ保存していない必須タブから始める */
export function firstOpen(cfg: IntakeCfg, s: IntakeState, i: number) {
  const ts = cfg.targets[i].tabs;
  for (let j = 0; j < ts.length; j++) if (ts[j].req && !s.saved[i][j]) return j;
  return 0;
}
export function phaseStatus(cfg: IntakeCfg, s: IntakeState): { t: string; tone: 'warning' | 'success' | 'info' } {
  if (s.phase === 'A') return { t: '受付中', tone: 'warning' };
  return allConfirmed(cfg, s) ? { t: '完了', tone: 'success' } : { t: '契約設定中', tone: 'info' };
}
/** 文言の {no} {name} {date} {label} を拠点の値にする（値は HTML にそのまま入るので逃がす） */
export function tok(str: string, t: TargetDef) {
  const e = (x: string) => x.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);
  return String(str || '').replace(/\{no\}/g, e(t.no)).replace(/\{name\}/g, e(t.name)).replace(/\{date\}/g, e(t.applyDate || '—')).replace(/\{label\}/g, e(t.applyLabel || '適用日'));
}

/* ---------------- 入力欄 ---------------- */
export const fid = (ti: number | string, tb: number | string, key: string) => `f_${ti}_${tb}_${key}`;
/** 欄の今の値 */
export function fieldValue(s: IntakeState, id: string, f: FieldDef): string {
  const v = s.val[id];
  return v !== undefined ? String(v) : String(f.value ?? '');
}
/** 連動で入力できない欄：請求先＝この拠点 のときだけ請求条件、支払方法＝口座振替 のときだけ手続きステータス、支払サイクル＝年払い のときだけ起算月 */
export function fieldDisabled(s: IntakeState, tab: TabDef, ti: number, tb: number, f: FieldDef): boolean {
  const fieldOf = (key: string) => {
    for (const b of tab.blocks) if (b.b === 'fields') { const x = b.items.find((y) => y.key === key); if (x) return x; }
    return null;
  };
  const valOf = (key: string) => { const x = fieldOf(key); return x ? fieldValue(s, fid(ti, tb, key), x) : null; };
  let dis = false;
  if (f.dep) { const v = valOf(f.dep); if (v !== null && v !== 'この拠点') dis = true; }
  if (f.when) { const [k, v] = f.when.split('='); const cur = valOf(k); if (cur !== null && cur !== v) dis = true; }
  return dis;
}

/* ---------------- 配送ルート（2026/09/29：運営が詳細情報設定の「子契約」タブで拠点・配送種別ごとに設定する） ----------------
   運送会社・納品会社は常に必須。途中経由1も「なし」を明示して選ぶ（既定「なし」・必須）。中継しないときは運送会社＝納品会社（2026/10/03・REQ-DL-710）。
   配送回数の合計がプラン標準を超えた分は A型オプション「配送回数追加」（OP000001）で自動計上。納品サイクルは配送回数の分だけ選ぶ */
/* 配送ルートの選択肢は共通データのマスタ（倉庫・中継・運び手）から作る（setIntakeMaster）。マスタがまだ入っていないときは空 */
export const RT_WH: string[] = [];
export const RT_CAR: { g: string; o: string[] }[] = [];
/** 途中経由1の「なし」（中継しない＝倉庫で受け取ってそのまま配送） */
export const RT_NO_VIA = 'なし（倉庫で受け取ってそのまま配送）';
export const RT_HUB: string[] = [];
export const RT_LT = ['1日', '2日', '3日', '4日'];
export const RT_PAT = ['ESサイクル', 'スペシャル'];
export const RT_CNT = [0, 1, 2, 3, 4, 5, 6, 7, 8].map((n) => ({ v: String(n), t: n + '回' }));
export const RT_HEAD: [string, boolean][] = [['配送種別', false], ['ピッキング倉庫', true], ['運送会社', true], ['納品会社', true], ['途中経由1', true], ['リードタイム', true], ['配送回数', true], ['配送パターン', true]];
export const RT_WD = '月火水木金土日';
/** プランマスタの標準の配送回数（温度帯ごと・28-154）。ライトは L を付けて引く（ESライトは冷凍なし）。共通データのプランから作る（setIntakeMaster） */
let PLAN_STD: Record<string, { c: number; f?: number }> = {};
/** OP000001 配送回数追加の1回の金額（オプションマスタ。2026/10/03：直書きしない・見本の seed も読まない）。setIntakeMaster で入れる（import した側にも反映される） */
export let OP_ADD_YEN = 0;
export { yen as rtYen } from '@/lib/format/money';
export const rtIsMat = (r: Route) => /資材/.test(r.kind);
export const rtOn = (r: Route) => rtIsMat(r) || (r.cnt ?? 0) > 0;
export function rtParse(a: string[]): Route {
  const mat = /資材/.test(a[0]), v = (x: string | undefined) => (x && x !== '—' ? x : '');
  return { kind: a[0], wh: v(a[1]), c1: v(a[2]), via: v(a[3]) || RT_NO_VIA, c2: a[8] ? v(a[8]) : v(a[2]), lead: v(a[4]),
    cnt: mat ? null : parseInt(a[5], 10) || 0, pat: mat ? '都度配送' : v(a[6]), slots: v(a[7]) ? a[7].split(/\s*／\s*/) : [] };
}
/** 申込の配送回数を初期値にし、倉庫・配送会社などは空で始める（配送パターンの初期値は ESサイクル） */
export function rtBlank(a: string[]): Route {
  const r = rtParse(a);
  return { kind: r.kind, wh: '', c1: '', via: RT_NO_VIA, c2: '', lead: '', cnt: r.cnt, pat: rtIsMat(r) ? '都度配送' : 'ESサイクル', slots: [] };
}
export function rtSlotOpts(r: Route) {
  const o: { v: string; t: string }[] = [];
  if (r.pat === 'スペシャル') { for (let d = 1; d <= 28; d++) o.push({ v: '毎月' + d + '日', t: '毎月' + d + '日' }); o.push({ v: '毎月末日', t: '毎月末日' }); return o; }
  ['A', 'B', 'C', 'D'].forEach((w) => { for (let d = 1; d <= 7; d++) o.push({ v: w + d, t: `${w}${d}（週${w}・${RT_WD.charAt(d - 1)}）` }); });
  return o;
}
export const RT_ORDER: Record<string, number> = (() => {
  const o: Record<string, number> = {};
  let n = 0;
  ['A', 'B', 'C', 'D'].forEach((w) => { for (let d = 1; d <= 7; d++) o[w + d] = n++; });
  for (let d = 1; d <= 28; d++) o['毎月' + d + '日'] = 100 + d;
  o['毎月末日'] = 200;
  return o;
})();
export const routeTotal = (s: IntakeState, i: number) => (s.route[i] || []).reduce((n, r) => n + (rtIsMat(r) ? 0 : r.cnt || 0), 0);
export function routeStd(cfg: IntakeCfg, i: number): { c: number; f?: number } | null {
  const t = cfg.targets[i];
  if (t.planStd != null) return typeof t.planStd === 'number' ? { c: t.planStd } : t.planStd;
  const m = /ES\d{6}/.exec(t.sub || '');
  const lk = m ? m[0] + (/ライト/.test(t.sub || '') ? 'L' : '') : '';
  return m && PLAN_STD[lk] ? PLAN_STD[lk] : m && PLAN_STD[m[0]] ? PLAN_STD[m[0]] : null;
}
const rtTemp = (r: Route) => (/冷凍/.test(r.kind) ? 'f' : 'c');
/** 配送回数追加は温度帯ごとに「契約の回数 − 標準の回数」の超えた分を数える。相殺しない（28-154・28-156） */
export function routeExtra(cfg: IntakeCfg, s: IntakeState, i: number) {
  const std = routeStd(cfg, i);
  if (!std) return 0;
  let n = 0;
  (s.route[i] || []).forEach((r) => { if (rtIsMat(r)) return; const st = std[rtTemp(r)]; if (st != null) n += Math.max(0, (r.cnt || 0) - st); });
  return n;
}
/** 配送回数0は持たない：冷蔵は1回以上、ESスタンダードは冷凍も1回以上（28-156） */
export function routeZeroNg(cfg: IntakeCfg, s: IntakeState, i: number) {
  const std = routeStd(cfg, i) || { c: 0 }, ng: string[] = [];
  (s.route[i] || []).forEach((r) => { if (rtIsMat(r)) return; const tp = rtTemp(r); if ((tp === 'c' || std.f != null) && !((r.cnt ?? 0) > 0)) ng.push(r.kind); });
  return ng;
}
/** 申込内容確認で入れる倉庫の未入力の数 */
export function routeMissing(cfg: IntakeCfg, s: IntakeState) {
  let n = 0;
  cfg.targets.forEach((t, i) => { if (t.active === false) return; (s.route[i] || []).forEach((r) => { if (rtOn(r) && !r.wh) n++; }); });
  return n;
}
/** 納品不可曜日（拠点の値。入力していればその値） */
export function rtNgDays(cfg: IntakeCfg, s: IntakeState, i: number) {
  let ng = '';
  cfg.targets[i].tabs.forEach((tb) => tb.blocks.forEach((b) => { if (b.b === 'fields') b.items.forEach((f) => { if (f.key === 'ng') ng = String(f.value || ''); }); }));
  Object.keys(s.val).forEach((k) => { if (new RegExp('^f_' + i + '_\\d+_ng$').test(k)) ng = String(s.val[k]); });
  return ng;
}
/** 配送ルートの必須の欄（未入力のキー：rt:<拠点>:<行>:<欄>・sp:<拠点>:<行>・init:<拠点>） */
export function routeBadKeys(cfg: IntakeCfg, s: IntakeState, i: number): string[] {
  const bad: string[] = [];
  (s.route[i] || []).forEach((r, k) => {
    if (!rtOn(r)) return;
    const mat = rtIsMat(r);
    const req: (keyof Route)[] = ['wh', 'c1', 'c2', 'via', 'lead'];
    /* 中継しない（なし）ときは運送会社＝納品会社 */
    if (r.via === RT_NO_VIA && r.c1 && r.c2 && r.c1 !== r.c2) bad.push(`rt:${i}:${k}:c2`);
    if (!mat) req.push('pat');
    req.forEach((f) => { if (!String(r[f] ?? '').trim()) bad.push(`rt:${i}:${k}:${f}`); });
    if (!mat && (r.cnt ?? 0) > 0 && r.slots.filter(Boolean).length !== r.cnt) bad.push(`sp:${i}:${k}`);
  });
  if (cfg.orderMode && !s.init[i]) bad.push(`init:${i}`);
  const zn = routeZeroNg(cfg, s, i);
  (s.route[i] || []).forEach((r, k) => { if (zn.includes(r.kind)) bad.push(`rt:${i}:${k}:cnt`); });
  return bad;
}

/* ---------------- 異動の表（設備の異動・オプション・割引の異動） ----------------
   「行を追加」はマスタから選ぶ入力行を出し、「追加する」でデータの行にする。追加・削除した行は ①の表・合計・内訳と
   「この月に効いているオプション・割引」に反映する */
/*
 * 受付の機種・オプション・値引きの選択肢は、共通データのマスタ（サーバーが cfg.master に入れる）から作る（2026/10/03：コピー・見本の seed を持たない）。
 * 受付画面を開くとき（prepareCfg）に setIntakeMaster で入れ替える（配列は中身を入れ替えるので、import した側にも反映される）
 */
export const MD_KINDS = ['冷蔵庫', '冷凍庫', '電子レンジ', '資材ボックス', '自販機'];
/** 機種：月額（m）・初期（init）は税抜。自販機の月額＝自販機リース（OP000037）の1台の金額・初期＝初期費用（OP000008）の初期値（機種マスタ・台帳 2026/10/03）。機種マスタにない料金は持たない */
export const MD_MODELS: { id: string; n: string; k: string; m: number; init?: number }[] = [];
/**
 * オプションマスタ：連動しない・使用中だけ（A型は契約項目から自動のため選ばない）。
 * 金額の種類が 固定 以外（都度入力・拠点ごと・差額で決まる・契約ごと）は「金額は入力」（a＝null）
 */
export const MD_OPTS: { id: string; n: string; t: string; a: number | null }[] = [];
/** 値引きマスタ：使用中・手で付けるものだけ（お試し・移行割は自動）。決定のない値引きはお客様の確認まで入れない */
export const MD_DISC: Discount[] = [];
/** 共通データのマスタから、受付の選択肢を作り直す */
export function setIntakeMaster(m?: FormMaster & { logistics?: Logistics }) {
  if (!m) return;
  const lg = m.logistics;
  if (lg) {
    RT_WH.splice(0, RT_WH.length, ...lg.warehouses.map((w) => `${w.id} ${w.name}`));
    RT_HUB.splice(0, RT_HUB.length, ...lg.hubs.map((w) => `${w.id} ${w.name}`));
    const grp = (g: string, ks: string[]) => ({ g, o: lg.carriers.filter((c) => ks.includes(c.kind)).map((c) => c.name) });
    RT_CAR.splice(0, RT_CAR.length, grp('運送会社', ['路線']), grp('委託配送会社', ['委託・引き取り']), grp('自社便', ['自社']));
  }
  MD_MODELS.splice(0, MD_MODELS.length, ...m.models.filter((x) => MD_KINDS.includes(x.category))
    .map((x) => ({ id: x.id, n: x.name, k: x.category, m: x.monthlyYen, ...(x.category === '自販機' && x.initFeeYen ? { init: x.initFeeYen } : {}) })));
  /* 自販機リース（OP000037）は ESライト（自販機）の子契約に自動で付くので選ばない */
  MD_OPTS.splice(0, MD_OPTS.length, ...m.options.filter((o) => o.status === '使用中' && o.linkType !== 'A' && o.trigger !== 'contract.vmLease')
    .map((o) => ({ id: o.id, n: o.mgmtName || o.name, t: o.feeType, a: !o.amountKind || o.amountKind === '固定' ? o.amountYen : null })));
  MD_DISC.splice(0, MD_DISC.length, ...m.discounts.filter((d) => d.status === '使用中' && d.auto !== 'auto' && (d.calcKind === 'fixed' || d.calcKind === 'rate')).map((d): Discount => ({
    id: d.id, n: d.mgmtName || d.name, g: d.target === 'オプション料金' ? 'option' : d.target === '設備料金' ? 'model' : d.target === '初期料金' ? 'init' : d.target === '請求全体' ? 'all' : 'plan',
    c: d.calcKind === 'rate' ? 'rate' : 'fixed', v: (d.calcKind === 'rate' ? d.ratePct : d.amountYen) ?? 0, ...(d.capYen ? { cap: d.capYen } : {}),
    l: d.calcKind === 'rate' ? `${d.ratePct ?? 0}%${d.capYen ? `（上限 ${yenS(d.capYen)}）` : ''}` : yenS(d.amountYen ?? 0),
  })));
  OP_ADD_YEN = m.options.find((o) => o.id === CHARGE_IDS['item.deliveryOver'])?.amountYen ?? 0;
  PLAN_STD = Object.fromEntries(m.plans.flatMap((p) => {
    const d = (course: string, t: '冷蔵' | '冷凍') => p.limits?.find((x) => x.course === course && x.temp === t)?.deliveries;
    const std = d('ESスタンダード', '冷蔵'), lite = d('ESライト（冷蔵庫）', '冷蔵');
    return [...(std ? [[p.id, { c: std, f: d('ESスタンダード', '冷凍') }]] : []), ...(lite ? [[`${p.id}L`, { c: lite }]] : [])];
  }));
}
export { yen as yenS } from '@/lib/format/money';
import { yen as yenS } from '@/lib/format/money';
const esc = (s: unknown) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);

export const rowCells = (r: TableRow): Cell[] => (Array.isArray(r) ? r : r.cells);
export const cellText = (c: Cell) => (c && typeof c === 'object' ? c.t : c == null ? '' : String(c));
/** この子契約のサイクル月（yyyy-mm） */
export function cycMonth(cfg: IntakeCfg, ti: number) {
  const m = /(\d{4})年(\d{1,2})月/.exec(cfg.targets[ti].applyDate || '');
  return m ? m[1] + '-' + ('0' + m[2]).slice(-2) : '2026-10';
}
export function addMonth(ym: string, n: number) {
  let y = +ym.slice(0, 4), m = +ym.slice(5) + n;
  while (m > 12) { m -= 12; y++; }
  return y + '-' + ('0' + m).slice(-2);
}
/** 表の見出し（設備には月額・初期の列、オプション・割引は ＋請求／−値引き） */
export function ebHead(e: EditTable) {
  const h = e.head.map((x) => (typeof x === 'object' ? x : { t: x } as { t: string; c?: string }));
  if (e.kind === 'eq') h.splice(5, 0, { t: '月額（税抜）', c: 'r' }, { t: '初期（税抜）', c: 'r' });
  else h[4] = { t: '金額・率（＋請求／−値引き）', c: 'r' };
  return h;
}
/** 設備の行には機種マスタの料金（月額・初期）を、オプション・割引の行には符号を付けて見せる */
export function ebCells(e: EditTable, cs0: Cell[]): Cell[] {
  const cs = cs0.slice();
  if (e.kind === 'eq') {
    const ids = String(cs[3]).match(/(RF|FZ|MW|BX|VM)\d{6}/g) || [], md = ids.length ? MD_MODELS.find((x) => x.id === ids[ids.length - 1]) : null;   /* 機種変更は変更後（右側）の機種 */
    const q = parseInt(String(cs[4]), 10) || 1, off = /回収/.test(String(cs[0]));
    const mo = !md || off ? '—' : yenS(md.m * q) + (q > 1 && md.m ? `<div class="mm">${yenS(md.m)} × ${q}</div>` : '');
    const ini = !md || off || !md.init || /機種変更/.test(String(cs[0])) ? '—' : yenS(md.init * q);
    cs.splice(5, 0, { t: mo, c: 'r' }, { t: ini, c: 'r' });
  } else {
    const v = cellText(cs[4]).replace(/^[+＋−-]/, ''), disc = cs[1] === '値引き';
    cs[4] = { t: `<b class="${disc ? 'amt-m' : 'amt-p'}">${disc ? '−' : '+'}${v}</b>`, c: 'r' };
  }
  return cs;
}
export const ebModelOpts = (k: string) => MD_MODELS.filter((m) => m.k === k).map((m) => ({ v: m.id, t: `${m.id} ${m.n}（月額 ${yenS(m.m)}）` }));
export const ebCodeOpts = (c: string) => (c === '値引き'
  ? MD_DISC.map((d) => ({ v: d.id, t: `${d.id} ${d.n}（${d.l}）` }))
  : MD_OPTS.map((o) => ({ v: o.id, t: `${o.id} ${o.n}（${o.t.replace('料金', '')} ${o.a == null ? '金額は入力' : yenS(o.a)}）` })));

/** 行を追加する入力行の値 */
export type NewRow = { k: string; l: string; c: string; m: string; q: string; d: string; r: string; a: string };
export const newRowFor = (e: EditTable, cfg: IntakeCfg): NewRow => (e.kind === 'eq'
  ? { k: '新規貸出', l: '（新規）', c: '', m: '', q: '1', d: '', r: '', a: '' }
  : { k: '追加', l: '', c: 'オプション', m: '', q: '1', d: cycMonth(cfg, e.ti), r: '', a: '' });
/** 入力行から追加する行を作る。足りない欄があれば bad（入力行の欄名）を返す */
export function ebCommitRow(cfg: IntakeCfg, e: EditTable, f: NewRow): { row?: TableRow; bad: string[]; msg?: string; label?: string } {
  const bad: string[] = [], need = (k: keyof NewRow) => { if (!String(f[k]).trim()) bad.push(k); };
  const qty = parseInt(f.q, 10) || 0, fee: FeeLine[] = [];
  if (e.kind === 'eq') {
    need('k'); need('c'); need('m'); need('d');
    if (/回収|機種変更/.test(f.k)) need('l');
    if (qty < 1) bad.push('q');
    if (bad.length) return { bad, msg: `入力内容に不足があります（${bad.length}件）` };
    const md = MD_MODELS.find((m) => m.id === f.m)!, kind = f.k;
    if (/新規貸出|追加貸出|機種変更/.test(kind)) {
      if (md.m > 0) fee.push({ n: `${md.n}（${md.id}）月額${qty > 1 ? ' × ' + qty : ''}`, t: '月額料金', a: md.m * qty, s: 'model' });
      if (md.init && kind !== '機種変更') fee.push({ n: `${md.n}（${md.id}）初期料金${qty > 1 ? ' × ' + qty : ''}`, t: '初期料金', a: md.init * qty, s: 'model' });
    }
    return { bad, row: { cls: 'added', fee, name: md.n, cells: [kind, /新規|追加/.test(kind) ? '（新規）' : esc(f.l), f.c, `<span class="idc">${md.id}</span> ${esc(md.n)}`, qty, f.d.replace(/-/g, '/'), esc(f.r) || '—'] } };
  }
  need('m'); need('a');
  if (qty < 1) bad.push('q');
  if (bad.length) return { bad, msg: `入力内容に不足があります（${bad.length}件）` };
  const hasYm = e.head.indexOf('適用開始月') >= 0, disc = f.c === '値引き', kind2 = f.k, ym = hasYm ? f.d : cycMonth(cfg, e.ti);
  const ms = (disc ? MD_DISC : MD_OPTS).find((x) => x.id === f.m)!;
  let label = f.a;
  const inThis = ym <= cycMonth(cfg, e.ti) && kind2 === '追加';   /* この子契約のサイクル月から効く「追加」だけ①に立つ */
  if (inThis) {
    if (disc) fee.push({ n: `${ms.n}（${ms.id}）`, t: '値引き', d: ms as Discount, s: 'discount' });
    else {
      const am = parseInt(label.replace(/[^\d]/g, ''), 10);
      if (isNaN(am)) return { bad: ['a'], msg: '金額を数字で入力してください' };
      fee.push({ n: `${ms.n}（${ms.id}）${qty > 1 ? ' × ' + qty : ''}`, t: (ms as { t: string }).t, a: am * qty, s: 'option' });
      label = yenS(am);
    }
  }
  const cells: Cell[] = [kind2, f.c, `<span class="idc">${ms.id}</span> ${esc(ms.n)}`, qty, esc(label), ym, esc(f.r) || '—'];
  if (!hasYm) cells.splice(5, 1);
  return { bad, row: { cls: 'added', fee, name: ms.n + (kind2 !== '追加' ? `（${kind2}）` : '') + (ym > cycMonth(cfg, e.ti) ? `（${ym} から）` : ''), cells } };
}
/** 元の行を削除したら、その ID・名前を①の表から外す */
export function hideKeysOf(e: EditTable, row: TableRow): string[] {
  if (!Array.isArray(row) && row.cls) return [];
  const cs = rowCells(row), out: string[] = [];
  cs.map(cellText).join(' ').replace(/[A-Z]{2}\d{6}/g, (id) => { out.push(id); return id; });
  if (e.kind === 'ap') {
    const nm = cellText(cs[2]).replace(/<[^>]+>/g, '').replace(/[A-Z]{2}\d{6}/, '').trim().replace(/（.*$/, '');
    if (nm) out.push(nm);
  }
  return out;
}

/* ---------------- ①固定額の表（元の行＋追加した行・削除した行・配送回数追加） ---------------- */
function rowAmt(r: TableRow) {
  const t = cellText(rowCells(r)[4]);
  const n = parseInt(String(t).replace(/[^\d]/g, ''), 10) || 0;
  return /−|-/.test(String(t)) ? -n : n;
}
function feeBase(cfg: IntakeCfg, ti: number): Extract<Block, { b: 'table' }> | null {
  let f: Extract<Block, { b: 'table' }> | null = null;
  cfg.targets[ti].tabs.forEach((tb) => tb.blocks.forEach((b) => { if (b.b === 'table' && (b.head || []).map((h) => (typeof h === 'object' ? h.t : h)).join().indexOf('料金項目') >= 0) f = b; }));
  return f;
}
export type FeeSum = { init: number; month: number; single: number; disc: number; total: number };
/** 変わったところがなければ null（force なら必ず作る） */
export function feeRowsFor(cfg: PreparedCfg, s: IntakeState, ti: number, force?: boolean): { rows: { cls?: string; cells: Cell[] }[]; sum: FeeSum } | null {
  const fb = feeBase(cfg, ti);
  if (!fb) return null;
  const hide = s.hide[ti] || [];
  let changed = false;
  let out: TableRow[] = [];
  const per = fb.rows[0] ? rowCells(fb.rows[0])[3] : '';
  fb.rows.forEach((r) => { const nm = cellText(rowCells(r)[1]); if (hide.some((id) => nm.indexOf(id) >= 0)) { changed = true; return; } out.push(r); });
  const mk = (n: string, t: string, a: number, src: string, tax?: string): TableRow => ({ cls: 'added', cells: [0, n, t, per, { t: yenS(a), c: 'r' }, tax || (a < 0 ? '—' : '10%'), src] });
  const std = routeStd(cfg, ti);
  if (std != null && s.route[ti] && s.route[ti].length) {
    const need = routeExtra(cfg, s, ti);
    let bq = 0, bi = -1;
    out.forEach((r, x) => { const nm = cellText(rowCells(r)[1]); if (/OP000001/.test(nm)) { const m = /×\s*(\d+)/.exec(nm); bq = m ? +m[1] : 1; bi = x; } });
    if (need !== bq) {
      changed = true;
      if (bi >= 0) out.splice(bi, 1);
      if (need > 0) out.push(mk(`配送回数追加（OP000001）× ${need}回（配送回数から自動）`, '月額料金', need * OP_ADD_YEN, 'option'));
    }
  }
  const discs: FeeLine[] = [];
  Object.values(cfg.tables).forEach((e) => {
    if (e.ti !== ti || !e.edit) return;
    (s.eb[e.eid] || []).forEach((r) => { if (Array.isArray(r)) return; (r.fee || []).forEach((l) => { changed = true; if (l.d) discs.push(l); else out.push(mk(l.n, l.t, l.a || 0, l.s)); }); });
  });
  discs.forEach((l) => {
    const d = l.d!;
    let base = 0;
    out.forEach((r) => {
      const cs = rowCells(r), a = rowAmt(r);
      if (a <= 0) return;
      if (d.g === 'plan' && cs[6] === 'plan') base += a;
      else if (d.g === 'option' && cs[6] === 'option') base += a;
      else if (d.g === 'model' && cs[6] === 'model' && cs[2] === '月額料金') base += a;
      else if (d.g === 'init' && cs[2] === '初期料金') base += a;
      else if (d.g === 'all') base += a;
    });
    let amt = d.c === 'fixed' ? Math.min(d.v, base) : Math.round(base * d.v / 100);
    if (d.cap) amt = Math.min(amt, d.cap);
    out.push(mk(l.n, '値引き', -amt, 'discount', '—'));
  });
  if (!changed && !force) return null;
  const rows = out.map((r, x) => { const o = { cls: Array.isArray(r) ? undefined : r.cls, cells: rowCells(r).slice() }; o.cells[0] = x + 1; return o; });
  const sum: FeeSum = { init: 0, month: 0, single: 0, disc: 0, total: 0 };
  rows.forEach((r) => {
    const a = rowAmt(r), t = r.cells[2];
    sum.total += a;
    if (a < 0) sum.disc += a; else if (t === '初期料金') sum.init += a; else if (t === '単発料金') sum.single += a; else sum.month += a;
  });
  return { rows, sum };
}
/** この月に効いているオプション・割引（参照）：元の値から削除した分を外し、追加した分を足す */
export function effText(cfg: PreparedCfg, s: IntakeState, ti: number, orig: string) {
  const add: string[] = [];
  Object.values(cfg.tables).forEach((e) => {
    if (e.ti !== ti || !e.edit || e.kind !== 'ap') return;
    (s.eb[e.eid] || []).forEach((r) => { if (!Array.isArray(r) && r.cls === 'added') add.push(esc(r.name) + '（追加）'); });
  });
  const hide = s.hide[ti] || [];
  let o = String(orig || '');
  if (hide.length) o = o.split('／').filter((p) => !hide.some((h) => p.indexOf(h) >= 0)).join('／');
  return [o && o !== 'なし' ? o : ''].concat(add).filter(Boolean).join('／') || 'なし';
}

/** 申込内容の「設備」には機種マスタの料金（税抜）を添える */
export function feeNote(title: string, x: string) {
  if (!/^設備/.test(title)) return x;
  const out: string[] = [], seen: Record<string, boolean> = {};
  String(x).replace(/(RF|FZ|MW|BX|VM)\d{6}/g, (id) => {
    if (seen[id]) return id;
    seen[id] = true;
    const md = MD_MODELS.find((m) => m.id === id);
    if (md) out.push('月額 ' + yenS(md.m) + (md.init ? ' ・ 初期 ' + yenS(md.init) : ''));
    return id;
  });
  return out.length ? x + '<div class="feen">' + out.join('／') + '（税抜）</div>' : x;
}

/** 受付画面は説明文を出さない（注記・入力欄の説明・小見出しの補足。2026/09/29） */
export function stripNotes(h: string) {
  return String(h).replace(/<div class="note[^"]*"[^>]*>[\s\S]*?<\/div>/g, '').replace(/<span class="sub">[\s\S]*?<\/span>/g, '');
}

/** 編集中の内容を比べるための写し */
export const capture = (s: IntakeState) => JSON.stringify({ v: s.val, r: s.route, i: s.init, e: s.eb, h: s.hide });


/* ---------------- 配送ルート ⇔ 共通データの便（channels） ----------------
   受付の配送ルートの入力は、共通データの拠点の便（Channel）と同じもの。保存すると便に入れ、開くと便から戻す（二重入力にしない） */
const ROUTE_REGIME: Record<string, Channel['regime']> = { 自社: 'self', 路線: 'parcel_carrier', '委託・引き取り': 'partner_driver' };
const idOf = (v: string) => v.match(/^[A-Z]{2}\d{5}/)?.[0] ?? '';
/** 画面の配送ルート → 便。配送回数が0の行は便にしない。運び手は名前で引く（lg）。担当ドライバー・1回の納品数は前の便から引き継ぐ */
export function routesToChannels(routes: Route[], serviceForm: Channel['serviceForm'], lg: Logistics, prev: Channel[]): Channel[] {
  const out: Channel[] = [];
  routes.forEach((r) => {
    if (rtIsMat(r) || !((r.cnt ?? 0) > 0)) return;
    const temp: Channel['temp'] = /冷凍/.test(r.kind) ? '冷凍' : '冷蔵';
    const old = prev.find((c) => c.temp === temp);
    const c1 = lg.carriers.find((c) => c.name === r.c1), c2 = lg.carriers.find((c) => c.name === r.c2) ?? c1;
    out.push({
      temp, serviceForm, regime: ROUTE_REGIME[c1?.kind ?? '自社'] ?? 'self', warehouseId: idOf(r.wh), hubId: r.via === RT_NO_VIA ? '' : idOf(r.via),
      carrierId: c1?.id ?? '', carrier2Id: c2?.id ?? '', driverId: old?.driverId ?? '', leadDays: parseInt(r.lead, 10) || 0,
      slots: r.slots.filter(Boolean), mealsPerDelivery: old?.mealsPerDelivery ?? 0,
    });
  });
  return out;
}
/** 便 → 画面の配送ルートの元の行（_rdef。冷蔵・冷凍・資材）。便がなければ配送回数だけプランの標準を入れる */
export function channelsToRdef(channels: Channel[], std: { c: number; f?: number } | null, lg: Logistics): string[][] {
  const name = (id: string) => lg.carriers.find((c) => c.id === id)?.name ?? '';
  const whOf = (id: string) => { const w = lg.warehouses.find((x) => x.id === id); return w ? `${w.id} ${w.name}` : ''; };
  const hubOf = (id: string) => { const w = lg.hubs.find((x) => x.id === id) ?? lg.warehouses.find((x) => x.id === id); return w ? `${w.id} ${w.name}` : ''; };
  const row = (kind: string, temp: '冷蔵' | '冷凍', n: number) => {
    const c = channels.find((x) => x.temp === temp);
    return [kind, c ? whOf(c.warehouseId) : '', c ? name(c.carrierId) : '', c ? hubOf(c.hubId) : '', c && c.leadDays ? `${c.leadDays}日` : '', String(c ? c.slots.length : n), 'ESサイクル', c ? c.slots.join('／') : '', c ? name(c.carrier2Id) : ''];
  };
  const rows = [row('冷蔵配送', '冷蔵', std?.c ?? 0)];
  if (std?.f != null || channels.some((c) => c.temp === '冷凍')) rows.push(row('冷凍配送', '冷凍', std?.f ?? 0));
  /* 資材の初期セットの便は、ES事務所（資材）の倉庫から出す（本登録で作る。lib/domain/lifecycle.ts の shipInitialSet：ヤマト運輸 DE00002・出荷の2日後にお届け） */
  rows.push(['資材配送', whOf('WH00004'), name('DE00002'), '', '2日', '', '', '', name('DE00002')]);
  return rows;
}

/** 共通データへ入れる欄の key（保存すると画面だけの入力から外し、共通データを正とする） */
export const MAPPED_KEYS = new Set(['cn', 'ckana', 'czip', 'cpref', 'ccity', 'cad1', 'cad2', 'ctel', 'bn', 'bkana', 'emp', 'zip', 'pref', 'city', 'ad1', 'ad2', 'tel', 'billto', 'plan', 'course', 'ship', 'dnote']);

/** 保存するときの画面の状態：共通データへ入れる欄・担当者の表は外す（共通データを正とする） */
export function draftForSave(cfg: PreparedCfg, s: IntakeState): IntakeDraft {
  const staff = new Set(Object.values(cfg.tables).filter((e) => e.kind === 'staff').map((e) => e.eid));
  return {
    ...draftOf(s),
    val: Object.fromEntries(Object.entries(s.val).filter(([id]) => !MAPPED_KEYS.has(id.split('_').slice(3).join('_')))),
    eb: Object.fromEntries(Object.entries(s.eb).filter(([k]) => !staff.has(k))),
  };
}
/** 共通データ（申込の受付の中身）から作り直した配送ルート。配送回数は、画面で入れた回数が便の枠の数より多ければそれを残す */
export function routesFromCfg(cfg: IntakeCfg, prev?: Route[][]): Route[][] {
  return cfg.targets.map((t, i) => (t._rdef || []).map((a, k) => {
    const r = cfg.routeCarry ? rtParse(a) : rtBlank(a), p = prev?.[i]?.[k];
    if (p && !rtIsMat(r) && (p.cnt ?? 0) > (r.cnt ?? 0)) r.cnt = p.cnt;
    return r;
  }));
}
