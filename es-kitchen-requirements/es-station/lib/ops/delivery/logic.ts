import type { CalCell, CalLine, CycleSettings, Holiday, ListRow, NgDate, Pause, ReviewItem } from './types';

/*
 * 配送管理の計算と入力チェック（画面と actions の両方で使う）。
 * 日付は 'YYYY-MM-DD'（入力欄）か 'YYYY/MM/DD'（表示）の文字列で持つ。
 */

export const WD = ['日', '月', '火', '水', '木', '金', '土'];
const pad = (n: number) => String(n).padStart(2, '0');
const DAY = 86400000;

/** 'YYYY-MM-DD' か 'YYYY/MM/DD' → UTC の時刻（不正なら NaN） */
export function utcOf(s: string): number {
  const m = String(s || '').match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
  if (!m) return NaN;
  const t = Date.UTC(+m[1], +m[2] - 1, +m[3]);
  const d = new Date(t);
  return d.getUTCMonth() === +m[2] - 1 && d.getUTCDate() === +m[3] ? t : NaN;
}
export const isoOf = (t: number) => { const d = new Date(t); return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`; };
/** 2026-09-21 → 2026-09-21（月） */
export const isoW = (s: string) => { const t = utcOf(s); return Number.isNaN(t) ? s : `${isoOf(t)}（${WD[new Date(t).getUTCDay()]}）`; };
/** 2026-10-06 → 2026/10/06（火） */
export const slashW = (s: string) => isoW(s).replace(/-/g, '/');
export const addDaysIso = (s: string, n: number) => isoOf(utcOf(s) + n * DAY);
export const isValidDate = (s: string) => !Number.isNaN(utcOf(s));

/* ---------- 配送サイクル（A1〜D7）の暦 ---------- */

/** 休止の実際の終わり（7日単位にそろえるため、足りない日数を「調整」として後ろに足す） */
export function pauseSpan(p: Pick<Pause, 'start' | 'end'>) {
  const days = Math.round((utcOf(p.end) - utcOf(p.start)) / DAY) + 1;
  const adj = (7 - (days % 7)) % 7;
  return { start: p.start, end: addDaysIso(p.end, adj), days, adj, total: days + adj };
}
export const pauseLabel = (p: Pick<Pause, 'start' | 'end'>) => {
  const s = pauseSpan(p);
  return { period: `${isoW(s.start)} 〜 ${isoW(s.end)}`, days: s.adj ? `${s.total}日間（${s.days}日＋調整${s.adj}日）` : `${s.total}日間` };
};

type CycleDay = { cycleMonth: number; cycleYear: number; code: string; pause?: Pause };

/** その日のサイクル枠（A1〜D7）。最初の A1 から 28日ごと。休止のあいだは枠を進めない。a1s（サイクル月ごとの A1）があればそれで決める（間はサイクルなし） */
export function cycleOf(date: string, st: Pick<CycleSettings, 'a1' | 'pauses' | 'a1s'>): CycleDay {
  if (st.a1s && Object.keys(st.a1s).length) {
    const t0 = utcOf(date);
    for (const [ym, x] of Object.entries(st.a1s)) {
      const n = Math.round((t0 - utcOf(x)) / DAY);
      if (n >= 0 && n < 28) return { cycleYear: +ym.slice(0, 4), cycleMonth: +ym.slice(5), code: 'ABCD'[Math.floor(n / 7)] + ((n % 7) + 1) };
    }
    const ys = Object.keys(st.a1s).sort();
    if (t0 >= utcOf(st.a1s[ys[0]]) && t0 <= utcOf(st.a1s[ys[ys.length - 1]]) + 27 * DAY) {
      return { cycleYear: 0, cycleMonth: 0, code: '', pause: { id: 'gap', name: 'サイクルなし（A1 の間）', start: isoOf(t0), end: isoOf(t0), ship: true } };
    }
  }
  const a1 = utcOf(st.a1), t = utcOf(date);
  const first = new Date(a1);
  const monthOf = (k: number) => { const m = first.getUTCMonth() + k; return { cycleYear: first.getUTCFullYear() + Math.floor(m / 12), cycleMonth: ((m % 12) + 12) % 12 + 1 }; };
  if (t < a1) {
    const back = Math.round((a1 - t) / DAY), k = -Math.ceil(back / 28), idx = ((28 - (back % 28)) % 28);
    return { ...monthOf(k), code: 'ABCD'[Math.floor(idx / 7)] + (idx % 7 + 1) };
  }
  const spans = st.pauses.map((p) => ({ p, s: utcOf(pauseSpan(p).start), e: utcOf(pauseSpan(p).end) }));
  let n = 0;
  for (let x = a1; x <= t; x += DAY) {
    const ps = spans.find((q) => x >= q.s && x <= q.e);
    if (ps) { if (x === t) return { ...monthOf(Math.floor(n / 28)), code: '', pause: ps.p }; continue; }
    if (x === t) { const idx = n % 28; return { ...monthOf(Math.floor(n / 28)), code: 'ABCD'[Math.floor(idx / 7)] + (idx % 7 + 1) }; }
    n++;
  }
  return { ...monthOf(0), code: '' };
}

/** 配送サイクル設定のカレンダー（月曜始まり・6週）。休止・祝日・出荷不可の表示は元の Main と同じ */
export function cycleCalendar(st: CycleSettings, ym: string, wh = 'wh1'): CalCell[] {
  const [y, m] = ym.split('-').map(Number);
  const first = Date.UTC(y, m - 1, 1), wd = (new Date(first).getUTCDay() + 6) % 7, start = first - wd * DAY;
  const ng = new Set(st.ngSlots[wh] ?? []), ngd = new Map((st.ngDates[wh] ?? []).map((x) => [x.d, x.why]));
  const hol = new Map(st.holidays.map((h) => [h.d, h]));
  const cells: CalCell[] = [];
  for (let i = 0; i < 42; i++) {
    const t = start + i * DAY, d = new Date(t), mm = d.getUTCMonth() + 1, dd = d.getUTCDate(), key = isoOf(t);
    const state: string[] = [];
    if (mm !== m) state.push('out');
    const c = cycleOf(key, st), h = hol.get(key);
    let holiday = '', cycle = '', slot = '', s = false, v = false;
    if (c.pause) {
      state.push('pause'); holiday = h ? h.n : c.pause.name; cycle = 'サイクル休止'; s = c.pause.ship; v = true;
    } else {
      cycle = c.cycleMonth + '月 '; slot = c.code;
      if (c.code === 'A1') state.push('first');
      s = ng.has(c.code);
      if (h) { holiday = h.n; state.push('holiday'); s = s || h.s; v = h.v; }
      if (ngd.has(key)) { holiday = holiday || ngd.get(key)!; s = true; }
    }
    const lines: CalLine[] = s || v ? [{ parts: [{ text: '休：' }, { text: s ? '出荷' : '', tone: 'ship' }, { text: s && v ? '・' : '' }, { text: v ? '配送' : '', tone: 'deliver' }] }] : [];
    cells.push({ date: (mm !== m ? mm + '/' : '') + dd, holiday, cycle, slot, week: slot ? slot.charAt(0) : '', state, lines, badges: [] });
  }
  return cells;
}

/** 月タブの件数（出荷不可の日・配送祝日の日） */
export function monthCounts(st: CycleSettings, ym: string, wh = 'wh1') {
  const [y, m] = ym.split('-').map(Number);
  const ng = new Set(st.ngSlots[wh] ?? []), ngd = new Set((st.ngDates[wh] ?? []).map((x) => x.d));
  const hol = new Map(st.holidays.map((h) => [h.d, h]));
  let ship = 0, dlv = 0;
  for (let t = Date.UTC(y, m - 1, 1); new Date(t).getUTCMonth() === m - 1; t += DAY) {
    const key = isoOf(t), c = cycleOf(key, st), h = hol.get(key);
    if (h?.v) dlv++;
    if (c.pause ? c.pause.ship : (ng.has(c.code) || h?.s || ngd.has(key))) ship++;
  }
  return { ship, dlv };
}

/** 設定対象期間の月（YYYY-MM） */
export function periodMonths(st: Pick<CycleSettings, 'periodFrom' | 'periodTo'>) {
  const out: string[] = [];
  let [y, m] = st.periodFrom.split('-').map(Number);
  const [ty, tm] = st.periodTo.split('-').map(Number);
  while (y < ty || (y === ty && m <= tm)) { out.push(`${y}-${pad(m)}`); m++; if (m > 12) { m = 1; y++; } }
  return out;
}

/** 納品不可枠（出荷不可枠とリードタイムから逆算） */
export function leadRows(ngSlots: string[]) {
  const order: string[] = [];
  'ABCD'.split('').forEach((w) => { for (let k = 1; k <= 7; k++) order.push(w + k); });
  const ng = new Set(ngSlots);
  return [1, 2, 3].map((L) => ({ lead: L, codes: order.filter((_, idx) => ng.has(order[(idx - L + 28) % 28])) }));
}
export const SLOT_ORDER = 'ABCD'.split('').flatMap((w) => [1, 2, 3, 4, 5, 6, 7].map((k) => w + k));

/* ---------- 入力チェック ---------- */

export type Errors = Record<string, string>;

export function checkHoliday(h: Pick<Holiday, 'n' | 'd'> & { s: boolean; v: boolean }, list: Holiday[]): Errors {
  const e: Errors = {};
  if (!h.n.trim()) e.n = '休日名を入力してください';
  if (!h.d.trim()) e.d = '日付を入力してください';
  else if (!isValidDate(h.d)) e.d = '日付は yyyy-mm-dd で入力してください';
  else if (list.some((x) => x.d === h.d)) e.d = 'この日付はすでに登録されています';
  if (!h.s && !h.v) e.opt = '出荷不可・配送祝日のどちらかを選んでください';
  return e;
}
export function checkPause(p: Pick<Pause, 'name' | 'start' | 'end'>): Errors {
  const e: Errors = {};
  if (!p.name.trim()) e.name = '期間名を入力してください';
  if (!p.start.trim()) e.start = '開始日を入力してください';
  else if (!isValidDate(p.start)) e.start = '日付は yyyy-mm-dd で入力してください';
  if (!p.end.trim()) e.end = '終了日を入力してください';
  else if (!isValidDate(p.end)) e.end = '日付は yyyy-mm-dd で入力してください';
  else if (!e.start && utcOf(p.end) < utcOf(p.start)) e.end = '終了日は開始日より後にしてください';
  return e;
}
export function checkNgDate(x: Pick<NgDate, 'd' | 'why'>, list: NgDate[]): Errors {
  const e: Errors = {};
  if (!x.why.trim()) e.why = '理由を入力してください';
  if (!x.d.trim()) e.d = '日付を入力してください';
  else if (!isValidDate(x.d)) e.d = '日付は yyyy-mm-dd で入力してください';
  else if (list.some((y) => y.d === x.d)) e.d = 'この日付はすでに登録されています';
  return e;
}
/** 配送サイクル設定の保存（A1 は月曜日だけ） */
export function checkCycleSettings(st: Pick<CycleSettings, 'a1' | 'periodFrom' | 'periodTo'>): Errors {
  const e: Errors = {};
  if (!isValidDate(st.a1)) e.a1 = '日付は yyyy-mm-dd で入力してください';
  else if (new Date(utcOf(st.a1)).getUTCDay() !== 1) e.a1 = 'A1 は月曜日のみ選べます';
  const ym = /^\d{4}-\d{2}$/;
  if (!ym.test(st.periodFrom)) e.periodFrom = '年月は YYYY-MM で入力してください';
  if (!ym.test(st.periodTo)) e.periodTo = '年月は YYYY-MM で入力してください';
  else if (!e.periodFrom && st.periodTo < st.periodFrom) e.periodTo = '終わりの月は始まりの月より後にしてください';
  return e;
}

/** 配送データの編集（変更理由は必須） */
export function checkDeliveryEdit(x: { reason: string }): Errors {
  return x.reason.trim() ? {} : { reason: '変更理由を入力してください' };
}
export function checkCancel(x: { why: string; detail: string }): Errors {
  const e: Errors = {};
  if (!x.why) e.why = '理由を選んでください';
  if (!x.detail.trim()) e.detail = '理由の詳細を入力してください';
  return e;
}
export function checkDuplicate(x: { reason: string; date: string; kind?: string; dest?: string }): Errors {
  const e: Errors = {};
  if (x.kind === 'return' && !x.dest) e.dest = '返送先を選んでください';
  if (!x.reason.trim()) e.reason = '理由の詳細を入力してください';
  if (!x.date.trim()) e.date = '仮の納品日を入力してください';
  else if (!isValidDate(x.date)) e.date = '日付は yyyy-mm-dd で入力してください';
  return e;
}
export function checkTroubleReport(x: { from: string; kind: string; text: string }): Errors {
  const e: Errors = {};
  if (!x.from) e.from = '連絡元を選んでください';
  if (!x.kind) e.kind = '種別を選んでください';
  if (!x.text.trim()) e.text = '内容を入力してください';
  return e;
}
export function checkTroubleResolve(x: { reason: string; freight?: string; needKind?: boolean; kind2?: string }): Errors {
  const e: Errors = {};
  if (x.needKind && !x.kind2) e.kind2 = '種別を選んでください';
  if (!x.reason.trim()) e.reason = '理由を入力してください';
  return e;
}
/** 変更申請の確認：別日の提案・否認では理由が必須 */
export function checkCrProcess(x: { decision: 'approve' | 'reject'; pick: string; reason: string }): Errors {
  const needReason = x.decision === 'reject' || x.pick.startsWith('a');
  if (x.decision === 'approve' && !x.pick) return { pick: '納品日を選んでください' };
  return needReason && !x.reason.trim() ? { reason: '理由を入力してください（別日の提案・否認では必須）' } : {};
}
/** 委託配送会社への見積依頼の入力（台帳 B「委託配送会社への見積依頼の項目」2026/10/03。保有車両は委託配送会社のプロフィールにある） */
export type QuoteForm = {
  corpName: string; siteName: string; zip: string; pref: string; city: string; addr1: string;
  /** 取り扱い商品（冷蔵・冷凍・資材。冷蔵と冷凍の両方も） */
  temps: string[];
  weekend: boolean; planName: string; vending: boolean; perMonth: number; meals: number;
  /** 希望の曜日（複数） */
  weekdays: string[];
  priceCond: string;
  /** まとめて聞くほかの拠点（1行に「拠点名／住所」） */
  moreSites: string;
};
export function checkQuoteForm(x: QuoteForm): Errors {
  const e: Errors = {};
  if (!x.corpName.trim()) e.corpName = '法人名を入力してください';
  if (!x.pref || !x.city.trim()) e.city = '配送エリア（都道府県・市区町村）を入力してください';
  if (!x.temps.length) e.temps = '取り扱い商品を選んでください';
  if (!x.planName.trim()) e.planName = 'プランを入力してください';
  if (!(Number.isInteger(x.perMonth) && x.perMonth >= 1 && x.perMonth <= 8)) e.perMonth = '配送回数は1〜8回です';
  if (!(Number.isInteger(x.meals) && x.meals >= 1)) e.meals = '1回の食数を入力してください';
  return e;
}
export function checkMemo(text: string): Errors {
  return text.trim() ? {} : { memo: 'メモを入力してください' };
}

/* ---------- 一覧の絞り込み ---------- */

/** 'YYYY/MM/DD' か 'YYYY-MM-DD' を 20261005 の数にする */
export const dayNum = (s: string) => { const m = String(s || '').match(/(\d{4})[/-](\d{1,2})[/-](\d{1,2})/); return m ? +m[1] * 10000 + +m[2] * 100 + +m[3] : null; };

export type ListFilter = {
  basis?: 'ship' | 'dlv'; from?: string; to?: string; q?: string; status?: string; method?: string;
  /** 住所・郵便番号・電話番号 */
  addr?: string; slip?: string; course?: string; vending?: '' | '自販機あり' | '自販機なし'; temp?: string;
  wh?: string; carrier?: string; hub?: string; staff?: string; trouble?: '' | 'トラブル未解決あり' | '確認中の子あり';
  /** ドライバー（配送スタッフ）が決まっていない区間がある配送だけ（RD-DL-190） */
  unassigned?: boolean;
  /** 並び（RD-DL-189。既定は出荷日の昇順） */
  sort?: '' | 'ship' | 'shipDesc' | 'dlv' | 'dlvDesc';
};
/** 並びの選択肢（ラベル） */
export const LIST_SORTS: [NonNullable<ListFilter['sort']>, string][] = [['ship', '出荷日の昇順'], ['shipDesc', '出荷日の降順'], ['dlv', '納品日の昇順'], ['dlvDesc', '納品日の降順']];
/** 出荷・配送管理の絞り込み（RV3-OPS-20261002 #4：期間は「出荷」「納品・配送」の切替で出荷日・納品日のどちらか）。並びの既定は出荷日の昇順 */
export function filterList(rows: ListRow[], f: ListFilter): ListRow[] {
  const from = dayNum(f.from ?? ''), to = dayNum(f.to ?? ''), q = (f.q ?? '').trim(), ad = (f.addr ?? '').trim(), slip = (f.slip ?? '').trim();
  const sort = f.sort || 'ship', key = sort.startsWith('dlv') ? 'dlvIso' : 'shipIso', desc = sort.endsWith('Desc');
  return rows
    .filter((r) => {
      if (q && !(r.id + ' ' + r.site + ' ' + r.fq.who).includes(q)) return false;
      if (ad && !r.fq.addr.includes(ad)) return false;
      if (slip && !r.fq.slips.some((x) => x.includes(slip))) return false;
      if (f.status && r.st !== f.status) return false;
      if (f.method && r.method !== f.method) return false;
      if (f.temp && r.temp !== f.temp) return false;
      if (f.course && r.fq.course !== f.course) return false;
      if (f.vending && (r.fq.course === 'ESライト（自販機）') !== (f.vending === '自販機あり')) return false;
      if (f.wh && r.fq.wh !== f.wh) return false;
      if (f.carrier && !r.fq.carriers.includes(f.carrier)) return false;
      if (f.hub && !r.fq.hubs.includes(f.hub)) return false;
      if (f.staff && !r.fq.staffs.includes(f.staff)) return false;
      if (f.trouble === 'トラブル未解決あり' && !r.fq.trouble) return false;
      if (f.trouble === '確認中の子あり' && !r.fq.childCheck) return false;
      if (f.unassigned && !r.fq.unassigned) return false;
      if (from || to) {
        const d = dayNum(f.basis === 'dlv' ? r.dlvIso : r.shipIso);
        if (!d || (from && d < from) || (to && d > to)) return false;
      }
      return true;
    })
    .sort((a, b) => (desc ? -1 : 1) * a[key].localeCompare(b[key]) || a.id.localeCompare(b.id));
}

export type ReviewFilter = { q?: string; kind?: string; state?: string; from?: string; to?: string };
/** 要確認の絞り込み（RV3-OPS-20261002 #3：区分・状態・キーワード・納品日） */
export function filterReviews(rows: ReviewItem[], f: ReviewFilter): ReviewItem[] {
  const from = dayNum(f.from ?? ''), to = dayNum(f.to ?? ''), q = (f.q ?? '').trim();
  return rows.filter((r) => {
    if (f.kind && r.kind !== f.kind) return false;
    if (f.state && r.state !== f.state) return false;
    if (q && ![r.kind, r.what, r.target, r.site, r.dlv, r.found, r.last].join(' ').includes(q)) return false;
    if (from || to) {
      const m = r.dlv.match(/(\d{1,2})[/-](\d{1,2})/), d = m ? 2026 * 10000 + +m[1] * 100 + +m[2] : null;
      if (!d || (from && d < from) || (to && d > to)) return false;
    }
    return true;
  });
}

/** MM-DD（曜）・（仮） の表示を、配送No の年を使って 'YYYY-MM-DD（曜）' にする（元の rv3Full。表示は共通の表示ルール・決定 8-1） */
export function fullDate(id: string, md: string, shipMd?: string): string {
  const m = String(md || '').match(/(\d{1,2})[/-](\d{1,2})/);
  if (!m) return '';
  const im = id.match(/^DL-(\d\d)(\d\d)/), y = im ? 2000 + +im[1] : 2026;
  const sm = String(shipMd || '').match(/(\d{1,2})[/-](\d{1,2})/), shipM = sm ? +sm[1] : im ? +im[2] : +m[1];
  const yy = y + (shipMd !== undefined && +m[1] < shipM ? 1 : 0);
  const t = Date.UTC(yy, +m[1] - 1, +m[2]);
  return (/（仮）/.test(md) ? '（仮）' : '') + `${yy}-${pad(+m[1])}-${pad(+m[2])}（${WD[new Date(t).getUTCDay()]}）`;
}

/** 要確認の行の行き先（対象のリンク・「対応する」） */
export function reviewLinks(r: ReviewItem) {
  const isDl = /^DL-\d{6}-\d{4}(-\d+)?$/.test(r.target);
  const detail = `/ops/delivery/review/${r.id}`;
  const dl = isDl ? `/ops/delivery/list/${r.target}` : detail;
  const target = isDl ? dl
    : r.link === 'ScheduleMonth' ? '/ops/delivery/schedule?view=month&d=2026-10'
      : r.link === 'ScheduleDayPlan' ? '/ops/delivery/schedule?view=day&d=2026-11-17'
        : detail;
  const act: Record<string, string> = {
    'ドライバー未設定': dl, 'トラブル報告（未解決）': isDl ? dl + '?tab=trb' : detail, '子の確定待ち': dl,
    '消費期限の注意': detail, '出荷指示の再送': '/ops/delivery/list/ship-orders',
  };
  return { target, act: act[r.kind] ?? detail };
}

/** 要確認を「対応して閉じる」（日付・理由は必須） */
export function checkReviewResolve(x: { how: string; date: string; reason: string }): Errors {
  const e: Errors = {};
  if (x.how !== 'ign' && x.how !== 'skip' && x.how !== 'keep') {
    if (!x.date.trim()) e.date = '日付を入力してください';
    else if (!isValidDate(x.date)) e.date = '日付は yyyy-mm-dd で入力してください';
  }
  if (!x.reason.trim()) e.reason = '理由を入力してください';
  return e;
}
