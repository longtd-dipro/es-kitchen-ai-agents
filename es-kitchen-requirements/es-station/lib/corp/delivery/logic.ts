import type { ChangeRequest } from '@/lib/ops/delivery/types';
import type { CalBadge, CalCell, CalItem, CalLine, CorpCr, CorpDelivery, CorpEvent, CrStatus, HomeCell, Tone } from './types';

/* 法人Web のホーム・お届け・申請の計算（画面と領域の両方で使う） */

export type Errors = Partial<Record<'reason' | 'first', string>>;

const WD = ['日', '月', '火', '水', '木', '金', '土'];
const DAY = 86400000;
const utc = (iso: string) => Date.UTC(+iso.slice(0, 4), +iso.slice(5, 7) - 1, +iso.slice(8, 10));
const isoOf = (t: number) => new Date(t).toISOString().slice(0, 10);
export const addDaysIso = (iso: string, n: number) => isoOf(utc(iso) + n * DAY);
/** 'YYYY-MM-DD' → 曜日 */
export const wdOf = (iso: string) => WD[new Date(utc(iso)).getUTCDay()];
/** 'YYYY-MM-DD' → 'MM-DD（曜）'（表示用。共通の表示ルール・決定 8-1） */
export const mdW = (iso: string) => `${iso.slice(5, 7)}-${iso.slice(8, 10)}（${wdOf(iso)}）`;
/** 'YYYY-MM-DD' → 'YYYY-MM-DD（曜）'（表示用） */
export const ymdW = (iso: string) => `${iso.slice(0, 10)}（${wdOf(iso)}）`;
/** 'YYYY-MM-DD' → 'MM-DD'（表示用。元は 'M/D'） */
export const md = (iso: string) => `${iso.slice(5, 7)}-${iso.slice(8, 10)}`;
/** 'YYYY-MM-DD' → 'MM-DD'（表示用） */
export const mm = (iso: string) => `${iso.slice(5, 7)}-${iso.slice(8, 10)}`;
/** 運営Web の申請の日付（'2026-11-25（水）'）→ 'YYYY-MM-DD'。希望日なしは '' */
export const isoFromOps = (s: string) => (/^\d{4}-\d{2}-\d{2}/.test(s) ? s.slice(0, 10) : '');
/** 'YYYY-MM-DD' → 運営Web の申請の日付の形（'2026-11-25（水）'） */
export const opsDate = (iso: string) => `${iso}（${wdOf(iso)}）`;

/* ---------- 拠点の名前 ---------- */

type BranchLike = { id: string; name: string; corpName: string; status?: string };
/** 拠点の短い名前（本社・大阪支店・仙台本社…）。拠点名が法人名と同じものは本社 */
export const siteShort = (b: BranchLike) => (b.name === b.corpName ? '本社' : b.name.replace(b.corpName, '').trim() || b.name);
/** カレンダーのマスの頭に付ける拠点（本社・大阪・名古屋…） */
export const sitePrefix = (b: BranchLike) => siteShort(b).replace(/(支店|営業所)$/, '');
/** レビューの拠点の表示（株式会社サンプル（本社）・株式会社サンプル 大阪支店） */
export const siteLong = (b: BranchLike) => (b.name === b.corpName ? `${b.name}（本社）` : b.name);

/* ---------- ホームのカレンダー ---------- */

/** 配送サイクル（dm.delivery.cycles の要るところ。日付は YYYY-MM-DD） */
export type CycleLike = { id: string; a1: string; orderCloseOn: string };
const utcYm = (ym: string) => Date.UTC(+ym.slice(0, 4), +ym.slice(5, 7) - 1, 1);
/** 'YYYY-MM' に n か月足す */
export const addMonthsYm = (ym: string, n: number) => new Date(Date.UTC(+ym.slice(0, 4), +ym.slice(5, 7) - 1 + n, 1)).toISOString().slice(0, 7);

/**
 * ホームで見られる月（決定 #54）：前はお届けのある最初の月まで、先は予定を作ってある月まで（今月から最大6か月先）。
 * お届けがなければ今月だけ
 */
export function homeMonths(eventMonths: string[], todayYm: string): string[] {
  const max = addMonthsYm(todayYm, 6);
  const ms = eventMonths.filter((m) => m <= max);
  let from = todayYm, to = todayYm;
  for (const m of ms) { if (m < from) from = m; if (m > to) to = m; }
  const out: string[] = [];
  for (let m = from; m <= to; m = addMonthsYm(m, 1)) out.push(m);
  return out;
}

/** 月の説明（決定 #54・受付簿 H2）：そのご利用月のサイクルから作る。締切済み／受付中（今日が締切より後か） */
export function monthNote(ym: string, cycles: CycleLike[], todayIso: string, ro = false): string {
  const c = cycles.find((x) => x.id === ym);
  if (!c) return '';
  const n = +ym.slice(5, 7);
  return todayIso > c.orderCloseOn
    ? `${n}月のお届けはご注文・変更の締切（${md(c.orderCloseOn)}）で確定しています。日付を変えたいときはESキッチンへお問い合わせください。`
    : ro ? `${n}月分（${md(c.a1)}〜）は予定です。` /* 解約後（参照のみ）は申請の案内を出さない */
    : `${n}月分（${md(c.a1)}〜）は予定です。ご注文・変更の締切 ${md(c.orderCloseOn)} まで、お届け日の変更を申請できます。`;
}

/** 配送サイクル（A1 の日で区切る）。その日を含むサイクルのご利用月（「10月分」）。サイクルがなければ暦の月 */
export function cycleOf(iso: string, cycles: CycleLike[]) {
  const sorted = [...cycles].sort((x, y) => (x.a1 < y.a1 ? -1 : 1));
  let hit: CycleLike | undefined;
  for (const c of sorted) { if (c.a1 <= iso) hit = c; else break; }
  const ym = hit ? hit.id : iso.slice(0, 7);
  return `${+ym.slice(5, 7)}月分`;
}
/** バッジは折り返さない（DS）。マスでは短い印にし、正式名はツールチップ・詳細で出す（#61） */
const SHORT: Record<string, string> = { 一部お届け済: '一部お届け', 再配送予定: '再配送', 再配送準備中: '再配送準備', 配送状況を確認中です: '確認中' };
/** 温度帯の並び（同じ日の一覧：冷蔵→冷凍→資材） */
const TEMP_ORDER: Record<string, number> = { 冷蔵: 0, 冷凍: 1, 資材: 2 };

/**
 * 月のカレンダー（月曜始まり）。events はもう絞り込んだもの、prefix は拠点ID → マスの頭の拠点名（全拠点のときだけ）。
 * prop＝別の日のご提案があるお届け（rec の id）、holidays＝祝日（YYYY-MM-DD → 名前）、cycles＝配送サイクル
 */
export function buildCells(ym: string, todayIso: string, events: CorpEvent[], prefix: Record<string, string> | null, prop: Set<string>, holidays: Record<string, string> = {}, cycles: CycleLike[] = []): HomeCell[] {
  const first = utcYm(ym);
  const y = +ym.slice(0, 4), m = +ym.slice(5, 7);
  const last = Date.UTC(y, m, 1) - DAY;
  const start = first - ((new Date(first).getUTCDay() + 6) % 7) * DAY;
  const end = last + (6 - ((new Date(last).getUTCDay() + 6) % 7)) * DAY;
  const cells: HomeCell[] = [];
  for (let t = start; t <= end; t += DAY) {
    const iso = isoOf(t);
    /* 同じ日の並び：拠点ID の昇順、同じ拠点は 冷蔵→冷凍→資材（Q-H2） */
    const evs = events.filter((e) => e.d === iso).sort((a, b) => (a.site < b.site ? -1 : a.site > b.site ? 1 : (TEMP_ORDER[a.t] ?? 9) - (TEMP_ORDER[b.t] ?? 9)));
    const state: string[] = [], lines: CalLine[] = [], badges: CalBadge[] = [], items: CalItem[] = [], seen = new Set<string>();
    if (iso.slice(0, 7) !== ym) state.push('out');
    const badge = (b: CalBadge) => { if (!seen.has(b.label)) { seen.add(b.label); badges.push(b); } return b; };
    for (const ev of evs) {
      const line = { pre: prefix ? (prefix[ev.site] ?? '') + ' ' : '', value: ev.t + ' ', post: ev.plan ? '' : ev.note };
      lines.push(line);
      const mine: CalBadge[] = [];
      if (ev.plan) { if (!state.includes('draft')) state.push('draft'); mine.push(badge({ tone: 'info', label: '予定' })); }
      else mine.push(badge({ tone: ev.tone, label: SHORT[ev.st] ?? ev.st, title: ev.why ? `${ev.st}：${ev.why}` : ev.st }));
      if (ev.chk) mine.push(badge({ tone: 'warning', label: '確認中', title: '配送状況を確認中です' }));
      if (ev.moved) mine.push(badge({ tone: 'info', label: '日付変更', title: ev.moved }));
      if (ev.rec && prop.has(ev.rec)) mine.push(badge({ tone: 'warning', label: 'ご提案あり', title: '別の日のご提案（ご返事が必要）' }));
      items.push({ go: ev.rec ?? null, line, badges: mine });
    }
    cells.push({
      date: new Date(t).getUTCDate(), iso, today: iso === todayIso, holiday: holidays[iso] ?? '', cycle: evs.length ? cycleOf(iso, cycles) : '',
      state, lines, badges, items, has: evs.length > 0, go: evs.length === 1 && evs[0].rec ? evs[0].rec : null,
    });
  }
  return cells;
}

/* ---------- お届け日の変更申請 ---------- */

export const CR_TONE: Record<CrStatus, Tone> = {
  申請中: 'info', 別の日のご提案: 'warning', 承認: 'success', 否認: 'neutral', 取り下げ: 'neutral', 'お断り済（ESキッチンで調整中）': 'neutral',
};
export const CR_STATES: CrStatus[] = ['申請中', '別の日のご提案', '承認', '否認', '取り下げ', 'お断り済（ESキッチンで調整中）'];

/** 申請の状況。運営Web の申請（delivery.changeRequests）があればそちらで決める */
export function crStatus(c: CorpCr, ops?: ChangeRequest): CrStatus {
  if (!ops) return c.st;
  if (ops.state === '承認') return '承認';
  if (ops.state === '否認') return '否認';
  if (c.declinedAt) return 'お断り済（ESキッチンで調整中）';
  if (ops.state === '提案中' || ops.judge === '提案中（法人の返事待ち）') return '別の日のご提案';
  return '申請中';
}
/** 申請中・ご提案・お断り済（まだ決まっていない）か */
export const crOpen = (s: CrStatus) => s === '申請中' || s === '別の日のご提案' || s === 'お断り済（ESキッチンで調整中）';

/** 一覧の「変更したい日」 */
export function wantText(c: CorpCr) {
  if (!c.wants.length) return '希望日なし';
  return c.wants.map((w, i) => `${i ? '第二希望' : '第一希望'} ${mdW(w)}`).join('・');
}

/** 申請できるか（予定・締切まで・まだ決まっていない申請がない） */
export function canApply(d: CorpDelivery, todayYmd: string, open: boolean) {
  return !!d.plan && !!d.deadline && todayYmd <= d.deadline && !open;
}

/**
 * 申請のモーダルの月のカレンダー（版1.1・CW_DLV No.22.4）：ご利用月（サイクル）の全日を週ごと（月曜始まり・7列）に並べる。
 * 選べる日＝今のお届け日と同じ半分（前半＝第1・第2週／後半＝第3・第4週・#57）で、休日マスタ・お届けできない曜日・今のお届け日のどれでもない日（Q-D4）。
 * blocked＝その日を選べない理由（休日・受け取れない曜日。共通データを見る側（領域）が渡す。''＝選べる）
 */
export function pickCalendar(d: Pick<CorpDelivery, 'dateIso' | 'window' | 'cycleRange'>, blocked: (iso: string) => string): CalCell[][] {
  if (!d.window || !d.cycleRange) return [];
  const weeks: CalCell[][] = [];
  for (let iso = d.cycleRange.from; iso <= d.cycleRange.to; iso = addDaysIso(iso, 1)) {
    const wd = wdOf(iso), cur = iso === d.dateIso;
    const inHalf = iso >= d.window.from && iso <= d.window.to;
    const tip = cur ? '今のお届け日' : !inHalf ? '別の半分' : blocked(iso);
    if (wd === '月' || !weeks.length) weeks.push([]);
    weeks[weeks.length - 1].push({ iso, day: +iso.slice(8, 10), wd, dis: !!tip, tip, cur });
  }
  return weeks;
}

/** 理由：500文字まで・絵文字なし（入力の共通基準） */
const REASON_MAX = 500;
const EMOJI = /\p{Extended_Pictographic}/u;

/** ステップ①（日）の入力チェック（「次へ」で出す：E02・E300・E301）。cal＝モーダルの月のカレンダー（選べない日の判定） */
export function checkDates(a: { how: 'pick' | 'any'; first?: string; second?: string }, cal?: CalCell[][]): string | undefined {
  if (a.how !== 'pick') return undefined;
  if (!a.first) return '変更したい日をお選びください。';
  if (cal) {
    const ok = (iso?: string) => !iso || cal.flat().some((x) => x.iso === iso && !x.dis);
    if (!ok(a.first) || !ok(a.second)) return 'この日は選べません。';
  }
  if (a.second && a.first === a.second) return '第一希望と第二希望は別の日をお選びください。';
  return undefined;
}

/** ステップ②（理由）の入力チェック（「申請する」で出す：E01・E04・E13） */
export function checkReason(reason: string): string | undefined {
  if (!reason.replace(/[\s　]/g, '')) return '理由をご入力ください。';
  if ([...reason].length > REASON_MAX) return `${REASON_MAX}文字以内でご入力ください。`;
  if (EMOJI.test(reason)) return '理由に絵文字はご利用いただけません。';
  return undefined;
}

/** 申請の入力チェック（画面（ステップごと）と actions（まとめて）の両方で使う） */
export function checkChangeRequest(a: { how: 'pick' | 'any'; first?: string; second?: string; reason: string }, cal?: CalCell[][]): Errors {
  const e: Errors = {};
  const f = checkDates(a, cal);
  if (f) e.first = f;
  const r = checkReason(a.reason);
  if (r) e.reason = r;
  return e;
}
