import type {
  AltCond, AvgTarget, Base, Category, Dl, Frame, Machine, Master, MatOrder, Menu, Order, Product, Qty, Site,
} from './types';
import { isRealDate } from '@/lib/domain/dateCheck';
import { fmtDate, fmtMd, fmtYm } from '@/lib/format/date';

/*
 * メニュー管理の計算（部品/18_運営_メニュー注文.html と同じ）。画面と actions の両方で使う。
 * 日付は 'YYYY/MM/DD' の文字列。今日・いまの日時は引数で受け取る（today()・nowStamp() は呼ぶ側で）。
 */

/* ---------------- 日付 ---------------- */
const pd = (s: string) => { const a = s.split('/').map(Number); return new Date(Date.UTC(a[0], a[1] - 1, a[2])); };
const fd = (d: Date) => d.getUTCFullYear() + '/' + ('0' + (d.getUTCMonth() + 1)).slice(-2) + '/' + ('0' + d.getUTCDate()).slice(-2);
export const addD = (s: string, n: number) => { const d = pd(s); d.setUTCDate(d.getUTCDate() + n); return fd(d); };
export const wd = (s: string) => '日月火水木金土'[pd(s).getUTCDay()];
/** 10-05(月)（表示用。共通の表示ルール・決定 8-1） */
export const md = (s: string) => fmtMd(s) + '(' + wd(s) + ')';
const slotOff = (sl: string) => ({ A: 0, B: 7, C: 14, D: 21 } as Record<string, number>)[sl[0]] + Number(sl.slice(1)) - 1;
/** '2026-11' → 表示の '2026-11'（共通の表示ルール・決定 8-1） */
export const ymJa = (c: string) => fmtYm(c);
/** <input type="date"> の値との変換 */
export const toIso = (s: string) => (s ? s.replace(/\//g, '-') : '');
export const fromIso = (s: string) => s.replace(/-/g, '/');
export const clone = <T,>(o: T): T => JSON.parse(JSON.stringify(o));

/* ---------------- 表示の決まり ---------------- */
export const TAG_TONE: Record<string, string> = { 'NEW': 'info', '再登場': 'success', '定番': 'success' };
export const TEMP_L: Record<string, string> = { chilled: '冷蔵', ambient: '常温', frozen: '冷凍' };
/** 商品注文管理の対象年月 */
export const MONTHS = ['2026-11', '2026-10', '2026-09'];
export const MENU_STATUSES = ['編集中', '公開中', '締切済', '配送中', '終了', '削除済'] as const;
export const MENU_TONE: Record<string, string> = { '編集中': 'neutral', '公開中': 'info', '締切済': 'warning', '配送中': 'warning', '終了': 'success', '削除済': 'neutral' };
export const ORD_TONE: Record<string, string> = { '登録済': 'info', 'ES登録済': 'warning', 'デフォルト': 'success', 'お試し（自動）': 'primary', '取消': 'neutral' };
/**
 * 注文のステータスの表示名（法人Web と同じ：台帳 H・受付簿 #244。データの値は変えない）：
 * デフォルト＝自動注文／ES登録済＝ESキッチン入力済み。取消（休止・解約で取り消した注文）は灰
 */
export const ORD_LABEL: Record<string, string> = { 'デフォルト': '自動注文', 'ES登録済': 'ESキッチン入力済' };
export const ordLabel = (st: string) => ORD_LABEL[st] ?? st;
/** 一覧の絞り込みの選択肢（表示名 → データの値） */
export const ORD_STATUSES: { value: string; label: string }[] = ['デフォルト', '登録済', 'ES登録済', 'お試し（自動）', '取消'].map((v) => ({ value: v, label: ordLabel(v) }));
/** 配送区分（子契約の配送の形。注文.md §10-1） */
export const DLV_KINDS = ['ES配送便', 'COOL便'];
export const DLV_TONE: Record<string, string> = { '出荷待': 'neutral', '出荷指示済': 'info', '出荷済': 'warning', '納品済': 'success', '取消': 'negative' };
export const DLV_STEPS = ['注文', '出荷待', '出荷指示済', '出荷済', '納品済'];
export const FR_L: Record<Frame, string> = { W: 'ダブル枠', S: 'シングル枠', B: 'ベルト枠' };
export const COURSES = ['ESスタンダード', 'ESライト（冷蔵庫）', 'ESライト（自販機）'];
/** 公開中は「公開中（受付中）」と出す */
export const menuLabel = (st: string) => (st === '公開中' ? '公開中（受付中）' : st);
/** メニューが平均単価の目標を持っていないときの値（見本の既定と同じ） */
export const DEFAULT_AVG: AvgTarget = { fr: { min: 170, max: 179 }, vm: { min: 140, max: 159 } };

/* ---------------- 按分 ---------------- */
/** total を重み w で按分（大きい端数から1ずつ） */
export function alloc(total: number, w: number[]): number[] {
  const n = w.length; if (!n) return [];
  let s = w.reduce((a, b) => a + b, 0);
  if (s <= 0) { w = w.map(() => 1); s = n; }
  const raw = w.map((x) => total * x / s), out = raw.map(Math.floor);
  const rest = total - out.reduce((a, b) => a + b, 0);
  raw.map((x, i) => [x - Math.floor(x), i]).sort((a, b) => b[0] - a[0] || a[1] - b[1]).slice(0, rest).forEach((t) => { out[t[1]]++; });
  return out;
}
/** total を n 個にできるだけ均等に */
export function split(total: number, n: number): number[] { const b = Math.floor(total / n), r = total - b * n, a: number[] = []; for (let i = 0; i < n; i++) a.push(b + (i < r ? 1 : 0)); return a; }
/** 見本データ用の決まった乱数（法人デモと同じ） */
export function rnd(seed: number) { const x = Math.sin(seed * 9301 + 49297) * 233280; return x - Math.floor(x); }
/** 仕入単価（デモの仮の値） */
export function costOf(p: Product) { let h0 = 0; for (let i = 0; i < p.id.length; i++) h0 = (h0 * 31 + p.id.charCodeAt(i)) % 997; return p.st === 'frozen' ? 132 + h0 % 50 : p.price >= 200 ? 168 + h0 % 90 : 97 + h0 % 70; }
export const capTxt = (c: [number, number]) => c[0] + '〜' + c[1] + '個';
export const isStd = (s: Site) => s.course === 'ESスタンダード';
export const isVm = (s: Site) => s.course === 'ESライト（自販機）';

export type VmFrame = { k: Frame; cols: number; cap: number; nDef: number; n: number; avail: number; pick: Product[] };
export type VmPlan = { D: number; frames: VmFrame[]; items: Product[]; c: Record<string, number> };
export type Check = { label: string; state: 'ok' | 'ng'; reason?: string };
export type Sum = { total: number; frozen: number; cold: number; byDl: Record<string, number>; items: number };

/** 商品・拠点を引ける計算の道具。master は query 'master' の値 */
export function calc(M: Master) {
  const PM = new Map(M.products.map((p) => [p.id, p]));
  const SM = new Map(M.sites.map((s) => [s.id, s]));
  const prod = (id: string) => PM.get(id)!;
  const site = (id: string) => SM.get(id)!;
  /** 機種マスタの「列の構成」（利用状態が有効の自販機）。機種を足せば行が増える */
  const MACHINES: Machine[] = M.vmLayout.filter((x) => x.status === '有効').map((x) => ({ id: x.id, name: x.name + '（' + x.maker + '）', lanes: x.lanes }));

  /** その月の便（日付・出荷日つき） */
  const dls = (s: Site, m: string): Dl[] => s.dl.map((d) => { const date = addD(M.a1[m], slotOff(d.slot)); return { ...d, date, ship: addD(date, -2) }; });
  const dlsOf = (s: Site, m: string, p: Product) => dls(s, m).filter((d) => (p.st === 'frozen' ? d.t === 'frozen' : d.t !== 'frozen'));

  /* ---------------- メニューの基準数（基本50個あたり・28-179） ---------------- */
  function initBase(items: string[]) {
    const ps = items.map(prod), fz = ps.filter((p) => p.st === 'frozen'), cd = ps.filter((p) => p.st !== 'frozen'), b: Record<string, Base> = {};
    ps.forEach((p) => { b[p.id] = { std: 0, lite: 0 }; });
    alloc(10, fz.map((p) => p.past + 1)).forEach((n, i) => { b[fz[i].id].std = n; });
    alloc(40, cd.map((p) => p.past + 1)).forEach((n, i) => { b[cd[i].id].std = n; });
    alloc(50, cd.map((p) => p.past + 1)).forEach((n, i) => { b[cd[i].id].lite = n; });
    return b;
  }
  /* ---- STEP5-MO-20261001：標準数の按分・平均仕入単価 ---- */
  /** 目標：メニューごとの値（m.avgT。公開したメニューは公開時の値で固定）。ないときは既定 */
  const tgtOf = (m: Menu): AvgTarget => m.avgT ?? DEFAULT_AVG;
  const wOf = (m: Menu, p: Product, k: 'std' | 'lite') => { const b = m.base[p.id] ?? ({} as Base); return b.ex ? 0 : (b[k] || 0); };
  /** 短消費期限なし・自販機の基準数（重みから自動で按分。運営が直した値はそのまま） */
  function derived(m: Menu) {
    const ps = m.items.map(prod), cd = ps.filter((p) => p.st !== 'frozen'), out = { ns: {} as Record<string, number>, vm: {} as Record<string, number> };
    const nsL = cd.filter((p) => !p.exp), vmL = cd.filter((p) => p.vm);
    alloc(50, nsL.map((p) => wOf(m, p, 'lite'))).forEach((n, i) => { out.ns[nsL[i].id] = n; });
    alloc(50, vmL.map((p) => wOf(m, p, 'lite'))).forEach((n, i) => { out.vm[vmL[i].id] = n; });
    ps.forEach((p) => { const b = m.base[p.id] ?? ({} as Base); if (b.ns != null) out.ns[p.id] = b.ns; if (b.vm != null) out.vm[p.id] = b.vm; if (b.ex) { out.ns[p.id] = 0; out.vm[p.id] = 0; } });
    return out;
  }
  function cnt50(m: Menu, k: 'std' | 'lite') { const c: Record<string, number> = {}; m.items.map(prod).forEach((p) => { c[p.id] = k === 'lite' && p.st === 'frozen' ? 0 : wOf(m, p, k); }); return c; }
  function avgOf(c: Record<string, number>) { let t = 0, y = 0; Object.keys(c).forEach((id) => { t += c[id]; y += c[id] * costOf(prod(id)); }); return t ? Math.round(y / t * 100) / 100 : 0; }

  /* ---- STEP5-VM-20261001：自販機の標準数（機種ごと・枠ごと） ----
     品数の初期値＝枠の列数（メニューに合う商品の数まで）。運営はメニューごとに品数を直せる（m.vmN）。
     各商品の数＝プラン数を重みで按分（1回 50個まで・便の差±1）。列の格納数を超えたら警告（格納数は参考・プラン数が優先）。 */
  const laneCaps = (p: Product) => { const a = (p.vmL || '').match(/\d+/g); return a ? a.map(Number) : []; };
  /** その機種でこの商品が入る列の格納数（入らなければ 0） */
  function fitCap(mc: Machine, p: Product) {
    const ls = (p.vm && mc.lanes[p.vm]) || [], ok = laneCaps(p); let best = 0;
    ls.forEach((l) => { if (!ok.length || ok.indexOf(l[0]) >= 0) best = Math.max(best, l[0]); });
    return best;
  }
  function vmPlan(m: Menu, mc: Machine, plan: number): VmPlan {
    const D = Math.max(2, Math.ceil(plan / 50)), per = Math.floor(plan / D);
    const ps = m.items.map(prod).filter((p) => p.st !== 'frozen' && p.vm && !(m.base[p.id] ?? ({} as Base)).ex && fitCap(mc, p));
    const out: VmPlan = { D, frames: [], items: [], c: {} };
    (['W', 'S', 'B'] as Frame[]).forEach((k) => {
      const lanes = mc.lanes[k] || [];
      const cols = lanes.reduce((a, l) => a + l[1], 0), cand = ps.filter((p) => p.vm === k).sort((a, b) => wOf(m, b, 'lite') - wOf(m, a, 'lite') || (a.id < b.id ? -1 : 1));
      const nDef = Math.min(cols, cand.length); let n = (m.vmN?.[mc.id] ?? {})[k]; n = n == null ? nDef : Math.min(n, cand.length);
      const pick = cand.slice(0, n);
      out.frames.push({ k, cols, cap: lanes.reduce((a, l) => a + l[0] * l[1], 0), nDef, n, avail: cand.length, pick });
      out.items = out.items.concat(pick);
    });
    const w = out.items.map((p) => Math.max(1, wOf(m, p, 'lite')));
    alloc(per, w).forEach((n, i) => { out.c[out.items[i].id] = n; });   // 1回あたり
    return out;
  }
  /** 重み → プラン×コースの数（按分）。course＝std／lite／vm:<機種ID> */
  function mixOf(m: Menu, plan: number, course: string) {
    const ps = m.items.map(prod), fz = ps.filter((p) => p.st === 'frozen'), cd = ps.filter((p) => p.st !== 'frozen'), c: Record<string, number> = {};
    if (course === 'std') {
      const fzW = fz.map((p) => wOf(m, p, 'std')), fT = Math.round(fzW.reduce((a, b) => a + b, 0) * plan / 50);
      alloc(fT, fzW).forEach((n, i) => { c[fz[i].id] = n; });
      alloc(plan - fT, cd.map((p) => wOf(m, p, 'std'))).forEach((n, i) => { c[cd[i].id] = n; });
    } else if (course === 'vm' || course.indexOf('vm:') === 0) {
      const mc = MACHINES.filter((x) => 'vm:' + x.id === course)[0] || MACHINES[0], vp = vmPlan(m, mc, plan);
      vp.items.forEach((p) => { c[p.id] = vp.c[p.id] * vp.D; });
      const rest = plan - Object.keys(c).reduce((a, k) => a + c[k], 0); if (rest > 0 && vp.items.length) c[vp.items[0].id] += rest;
    } else alloc(plan, cd.map((p) => wOf(m, p, 'lite'))).forEach((n, i) => { c[cd[i].id] = n; });
    return c;
  }
  /**
   * 拠点に出せるメニューの商品（共通データの order の eligible と同じ決まり。注文の設定は見ない）：
   * 冷凍はスタンダードだけ・便の倉庫が商品のピッキング倉庫にある・コースが合う・ESライト（自販機）は置いている自販機に入る
   */
  const prodsFor = (s: Site, menu: Menu) => menu.items.map(prod).filter((p) => !!p && !p.off && (isStd(s) || p.st !== 'frozen')
    && (!s.whId || !p.wh || p.wh.includes(s.whId))
    && (!p.courses || p.courses.includes(isStd(s) ? 'スタンダード' : 'ライト'))
    && (!isVm(s) || (!!p.vm && (!s.vmModels?.length || s.vmModels.some((m) => p.vmModels?.includes(m))))));

  /* ---------------- 注文の数量 ---------------- */
  function makeQty(s: Site, m: string, menu: Menu, variant: number): Qty {
    const ps = prodsFor(s, menu), key = isStd(s) ? 'std' : 'lite', q: Qty = {};
    const fz = ps.filter((p) => p.st === 'frozen'), cd = ps.filter((p) => p.st !== 'frozen');
    const w = s.trial ? () => 1 : (p: Product, i: number) => { const b = menu.base[p.id][key] || 0; return variant ? b * (0.4 + rnd(i * 7 + variant + p.id.charCodeAt(3))) + (rnd(i + variant) > 0.8 ? 1 : 0) : b; };
    const fT = isStd(s) ? Math.min(s.cap.frozen![1], Math.round(fz.reduce((a, p) => a + (menu.base[p.id].std || 0), 0) * s.mult)) : 0;
    const per: Record<string, number> = {};
    alloc(fT, fz.map(w)).forEach((n, i) => { per[fz[i].id] = n; });
    alloc(s.plan - fT, cd.map(w)).forEach((n, i) => { per[cd[i].id] = n; });
    const tot: Record<string, number> = {}; dls(s, m).forEach((d) => { tot[d.k] = 0; });
    ps.forEach((p) => {
      const ds = dlsOf(s, m, p); q[p.id] = {}; ds.forEach((d) => { q[p.id][d.k] = 0; });
      for (let i = 0; i < (per[p.id] || 0); i++) { const d = ds.slice().sort((a, b) => tot[a.k] - tot[b.k] || q[p.id][a.k] - q[p.id][b.k])[0]; q[p.id][d.k]++; tot[d.k]++; }
    });
    return q;
  }
  /** 調整数の上限＝プランの食数（50プランなら50：受付簿 #272） */
  const adjCap = (o: Order) => site(o.site).plan;
  function sumBy(s: Site, m: string, q: Qty): Sum {
    const t: Sum = { total: 0, frozen: 0, cold: 0, byDl: {}, items: 0 };
    dls(s, m).forEach((d) => { t.byDl[d.k] = 0; });
    Object.keys(q).forEach((pid) => {
      const p = prod(pid); let any = 0;
      Object.keys(q[pid]).forEach((k) => { const n = q[pid][k] || 0; t.byDl[k] = (t.byDl[k] || 0) + n; t.total += n; if (p.st === 'frozen') t.frozen += n; else t.cold += n; any += n; });
      if (any) t.items++;
    });
    return t;
  }
  /**
   * 商品注文の保存前の条件（台帳 E「法人Web 商品注文の登録の条件」・受付簿 #79・#272）。文言は共通メッセージ（社内向け ja_o）：
   * E310 合計＝月のお届け数／E12 温度帯の範囲・調整数の上限／E311 便ごとの差 ±1。調整数は合計・便の差に入れない
   */
  function orderChecks(o: Order): Check[] {
    const s = site(o.site), t = sumBy(s, o.ym, o.q), ta = sumBy(s, o.ym, o.a), cap = adjCap(o), out: Check[] = [];
    out.push({ label: '合計が月のお届け数（' + s.plan + '個）と同じになるように入力してください。', state: t.total === s.plan ? 'ok' : 'ng' });
    ([['chilled', '冷蔵・常温', t.cold]] as [string, string, number][]).concat(isStd(s) ? [['frozen', '冷凍', t.frozen]] : []).forEach((x) => {
      const c = s.cap[x[0] as 'chilled' | 'frozen']!, ok = x[2] >= c[0] && x[2] <= c[1];
      out.push({ label: x[1] + 'は' + c[0] + '〜' + c[1] + 'の範囲で入力してください。', state: ok ? 'ok' : 'ng' });
    });
    /* 便ごとの数の差は温度帯ごとに ±1 以内（調整数は入れない） */
    const diffNg = (['chilled', 'frozen'] as const).some((g) => {
      const ds = dls(s, o.ym).filter((d) => (d.t === 'frozen') === (g === 'frozen'));
      if (ds.length < 2) return false;
      const ns = ds.map((d) => t.byDl[d.k] || 0);
      return Math.max(...ns) - Math.min(...ns) > 1;
    });
    out.push({ label: '便ごとの数の差が1個以内になるように入力してください。', state: diffNg ? 'ng' : 'ok' });
    out.push({ label: '調整数は0〜' + cap + 'の範囲で入力してください。', state: ta.total <= cap ? 'ok' : 'ng' });
    return out;
  }
  /**
   * 月間メニューの保存前の条件。基準注文数は保存のときに共通データが自動で入れ直す（手で直した値はそのまま）ので、
   * 合計が 50 でないのは警告（共通データの menu.get の warnings）で、保存は止めない
   */
  function menuChecks(d: Menu): Check[] {
    const cs: Check[] = [];
    cs.push({ label: 'メニュー公開日 ≦ オーダー開始日 ＜ オーダー締切日', state: d.pub <= d.from && d.from < d.to ? 'ok' : 'ng' });
    return cs;
  }

  /* ---------------- 代替品設定 ---------------- */
  /* 代替品設定の保存前の一覧・保存は共通データの order.altPreview／applyAlt（lib/domain/alt.ts。運営の領域 menu.altPreview／applyAlt から呼ぶ） */

  return {
    prod, site, MACHINES, dls, dlsOf, initBase, tgtOf, wOf, derived, cnt50, avgOf, laneCaps, fitCap, vmPlan, mixOf, prodsFor,
    makeQty, adjCap, sumBy, orderChecks, menuChecks,
  };
}
export type Calc = ReturnType<typeof calc>;

/* ---------------- 代替品設定の条件 ---------------- */
export const newAltCond = (): AltCond => ({ def: '', alt: '', found: '', from: '', to: '', scope: 'all', lot: '', reason: '' });
/**
 * 「条件を保存」の入力チェック（日付は <input type="date"> の値）。文言は共通メッセージ（社内向け ja_o）：
 * E01 必須（{項目名}は必須項目です。）・E02 選択（{項目名}を選択してください。）・E04 文字数・E08 終了日・E13 絵文字・E126 代替商品が不良商品と同じ
 */
export function altCondErrors(c: AltCond): Record<string, string> {
  const err: Record<string, string> = {};
  if (!c.def) err.def = '不良商品を選択してください。';
  if (!c.alt) err.alt = '代替商品を選択してください。';
  if (!c.found) err.found = '不良発覚日は必須項目です。';
  if (!c.from) err.from = '対象期間（開始日）は必須項目です。';
  if (!c.to) err.to = '対象期間（終了日）は必須項目です。';
  const reason = c.reason.trim();
  if (!reason) err.reason = '不良理由は必須項目です。';
  else if (reason.length > 500) err.reason = '500文字以内で入力してください。';
  else if (/\p{Extended_Pictographic}/u.test(reason)) err.reason = '不良理由に絵文字は使えません。';
  if (c.scope === 'lot' && !c.lot) err.lot = 'ロット番号は必須項目です。';
  if (c.def && c.def === c.alt) err.alt = '不良商品と同じ商品は代替商品に選べません。';
  if (c.from && c.to && c.from > c.to) err.to = '終了日は開始日以降の日付を選択してください。';
  return err;
}

/* ---------------- 資材注文 ---------------- */
/** 拠点のコースで使う資材 */
export const matsFor = <T extends { course: string }>(mats: T[], s: Site): T[] => mats.filter((m) => m.course.indexOf(s.course) >= 0 || (s.course === 'ESライト（自販機）' && m.course.indexOf('ESライト（冷蔵庫）') >= 0));
/** 納品予定日の初期値：注文日の翌日以降で、リードタイムを守れる最初の納品可能日（決定 #38。日曜は除く） */
export function nextDue(from: string, lead: number, today: string) { let d = addD(from, 1); for (let i = 0; i < 14; i++) { if (wd(d) !== '日' && pd(d).getTime() - pd(today).getTime() >= lead * 864e5) return d; d = addD(d, 1); } return d; }
/** 資材の注文数の上限（法人Web の資材注文と同じ・入力の共通基準：受付簿 #241 Q-M1） */
export const MAT_MAX = 999;
/** 資材注文の保存前のチェック（項目の下に出す文言：E02・E316・E12。なければ空） */
export function matChecks(d: { site: string; q: Record<string, number> }): { site?: string; q?: string } {
  const e: { site?: string; q?: string } = {};
  if (!d.site) e.site = '拠点を選択してください。';
  const ns = Object.values(d.q).map((n) => Number(n) || 0);
  if (ns.some((n) => n < 0 || n > MAT_MAX || !Number.isInteger(n))) e.q = `注文数は0〜${MAT_MAX}の範囲で入力してください。`;
  else if (!ns.some((n) => n > 0)) e.q = '注文数を1つ以上入力してください。';
  return e;
}
/** 資材注文の保存前のチェック（エラーの文言。なければ ''。サーバー用） */
export function matError(d: { site: string; q: Record<string, number> }) {
  const e = matChecks(d);
  return e.site ?? e.q ?? '';
}
/** 送り状番号の整え方：前後の空白を取り、全角の数字・ハイフンは半角に直す */
export const normTracking = (v: string) => (v ?? '').trim().replace(/[０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xFEE0)).replace(/[－ー―‐−]/g, '-');
/** 発送日・送り状番号のチェック（E06・E04・E64）。shippedOn は yyyy-mm-dd か yyyy/mm/dd、orderedOn は注文日 */
export function matShipChecks(shippedOn: string, trackingNo: string, orderedOn: string): { shippedOn?: string; trackingNo?: string } {
  const e: { shippedOn?: string; trackingNo?: string } = {};
  const sh = (shippedOn ?? '').replace(/-/g, '/'), od = (orderedOn ?? '').slice(0, 10).replace(/-/g, '/');
  if (sh && !isRealDate(sh)) e.shippedOn = '発送日は日付で入力してください。';
  else if (sh && od && sh < od) e.shippedOn = '発送日は注文日以降の日付で入力してください。';
  const t = normTracking(trackingNo);
  if (t.length > 30) e.trackingNo = '30文字以内で入力してください。';
  else if (t && !/^[0-9-]+$/.test(t)) e.trackingNo = '送り状番号は数字とハイフンで入力してください。';
  return e;
}
/** 取消の理由のチェック（E01・E04・E13）。なければ '' */
export function cancelReasonError(v: string) {
  const t = (v ?? '').trim();
  if (!t) return '取消の理由は必須項目です。';
  if (t.length > 500) return '500文字以内で入力してください。';
  if (/\p{Extended_Pictographic}/u.test(t)) return '取消の理由に絵文字は使えません。';
  return '';
}
/** 'yyyy-mm-dd(曜)'（資材注文の納品予定日・出荷予定日の表示。日付は yyyy-mm-dd：台帳 M-1） */
export const ymdW = (s: string) => fmtDate(s) + '(' + wd(s) + ')';
/** 変更履歴（保存した履歴＋状態から作る履歴） */
export function histOf(x: MatOrder | null): [string, string, string][] {
  if (!x || x.no.indexOf('MO-') < 0) return [];
  const r: [string, string, string][] = [[x.at, x.kind === '初期セット' ? '初期セットを自動作成（仮登録）・配送データを作成' : '資材注文を登録・配送データを作成', x.by]];
  if (x.sent) r.unshift([x.sent, '出荷指示を送信（THOMAS）', 'システム']);
  /* 送り状の取込の行は出荷したあとだけ（運営が資材注文管理で入れた送り状番号（受付簿 No.154）は配送の履歴に残る） */
  if (x.inv && (x.st === '出荷済' || x.st === '納品済')) r.unshift([addD(x.due, -2) + ' 18:10', '送り状番号を取込・出荷済', 'システム（CSV取込）']);
  if (x.st === '納品済') r.unshift([x.due + ' 12:00', '納品済（みなし完了）', 'システム']);
  if (x.st === '取消' && !(x.log || []).length) r.unshift(['2026/09/23 09:30', '取消（理由：法人からの依頼）', 'にっしぐち（運営）']);
  return r;
}

/* ---------------- 商品カテゴリ ---------------- */
export type CatDraft = { id: string; name: string; order: number | string; note: string; img: string };
/** カテゴリの入力チェック（文言は共通メッセージ：E01 必須・E04 文字数・E09 重複・E12 範囲・E13 絵文字） */
export function catErrors(d: CatDraft, list: Category[]): Record<string, string> {
  const err: Record<string, string> = {};
  const name = d.name.trim();
  if (!name) err.name = '商品カテゴリ名は必須項目です。';
  else if (name.length > 60) err.name = '60文字以内で入力してください。';
  else if (/\p{Extended_Pictographic}/u.test(name)) err.name = '商品カテゴリ名に絵文字は使えません。';
  else if (list.some((c) => c.name === name && c.id !== d.id)) err.name = '商品カテゴリ名は既に登録されています。';
  const max = list.length + (d.id ? 0 : 1), o = Number(d.order);
  if (!Number.isInteger(o) || o < 1 || o > max) err.order = `表示順は1〜${max}の範囲で入力してください。`;
  /* 画像は必須（法人Web・アプリの表示に使うため：受付簿 #274） */
  if (!d.img) err.img = 'カテゴリ画像は必須項目です。';
  if ((d.note ?? '').length > 500) err.note = '500文字以内で入力してください。';
  else if (/\p{Extended_Pictographic}/u.test(d.note ?? '')) err.note = '備考に絵文字は使えません。';
  return err;
}
/** 表示順に入れて、以降を繰り下げた一覧（order を 1 から振り直す） */
export function placeCat(d: CatDraft, list: Category[]): Category[] {
  const o = Number(d.order);
  const cats = list.filter((c) => c.id !== d.id).sort((a, b) => a.order - b.order);
  const id = d.id || 'CAT' + ('0000' + (Math.max(...list.map((c) => Number(c.id.slice(3)))) + 1)).slice(-5);
  cats.splice(o - 1, 0, { ...d, id, name: d.name.trim(), order: o });
  return cats.map((c, i) => ({ ...c, order: i + 1 }));
}
