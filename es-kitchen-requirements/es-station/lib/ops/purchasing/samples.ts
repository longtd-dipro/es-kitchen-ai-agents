import { MONTHS, OPS_USER, SMP, TODAY, WD, WH_CODE, WH_ROWS, iso, prod } from './master';
import type { Sample, SampleForm, WeekClose } from './types';
import { fmtDate, fmtDateW, fmtMd, fmtYm } from '@/lib/format/date';

/*
 * 営業サンプル（フェーズ2・2026/10/01 承認の仕様）。日付は YYYY-MM-DD の文字列。
 * 登録は専用の簡易画面。宛先だけ入力し、法人・拠点・契約は作らない。件数は月の合計（メニュー管理 ＞ 月間メニューで設定）。
 * 「仮置き」は意味が未決のため仮に決めた点（画面にも「仮置き」と出す）。
 */

export const SMP_PREFS = ['北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県', '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県', '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県', '静岡県', '愛知県', '三重県', '滋賀県', '京都府', '大阪府', '兵庫県', '奈良県', '和歌山県', '鳥取県', '島根県', '岡山県', '広島県', '山口県', '徳島県', '香川県', '愛媛県', '高知県', '福岡県', '佐賀県', '長崎県', '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県'];
/** 担当エリア（倉庫マスタの「担当エリア」の値。仮置きの前提の表に出すだけ） */
export const SMP_AREA: Record<string, string[]> = {
  関東倉庫: ['北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県', '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県', '新潟県', '山梨県'],
  中部倉庫: ['富山県', '石川県', '福井県', '長野県', '岐阜県', '静岡県', '愛知県', '三重県'],
  関西倉庫: ['滋賀県', '京都府', '大阪府', '兵庫県', '奈良県', '和歌山県', '鳥取県', '島根県', '岡山県', '広島県', '山口県', '徳島県', '香川県', '愛媛県', '高知県', '福岡県', '佐賀県', '長崎県', '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県'],
};

export const smToday = () => iso(TODAY());
const smD = (s: string) => { const [y, m, d] = s.split('-').map(Number); return Date.UTC(y, m - 1, d); };
const smIso = (t: number) => new Date(t).toISOString().slice(0, 10);
export const smAdd = (s: string, n: number) => smIso(smD(s) + n * 86400000);
const smWd = (s: string) => new Date(smD(s)).getUTCDay();
/** 'MM-DD'（表示用。共通の表示ルール・決定 8-1） */
export const smMD = (s: string) => fmtMd(s);
export const smMDW = (s: string) => smMD(s) + '（' + WD[smWd(s)] + '）';
export const smSl = (s: string) => s.replace(/-/g, '/');
/** 'YYYY-MM-DD（曜）'（表示用。共通の表示ルール・決定 8-1） */
export const smSlW = (s: string) => fmtDateW(s);
export const smMon = (s: string) => smAdd(s, -((smWd(s) + 6) % 7));
/** 'YYYY-MM'（表示用。共通の表示ルール・決定 8-1） */
export const smYmL = (ym: string) => fmtYm(ym);
export const smNorm = (s: string) => String(s || '').normalize('NFKC').replace(/[\s-]/g, '').toLowerCase();
/** ピッキング倉庫（倉庫マスタの有効なピッキング倉庫） */
export const smWhOpts = () => WH_ROWS.filter((w) => w.kind === 'ピッキング倉庫' && w.status === '有効').map((w) => w.name);
/**
 * 営業サンプルの対象商品（月間メニューの商品ごとの「営業サンプル」＝共通データ dm.order.menus の items[].sample。商品マスタには持たない：台帳 F 2026-10-08）。
 * 一覧は query samples の targets（id・名前・保管方法・取扱倉庫＝ピッキング倉庫の名前）。
 */
export type SmTarget = { id: string; name: string; keep: string; wh: string[] };
export const smOrderNo = (week: string, wh: string) => 'SS-' + week.slice(2).replace(/-/g, '') + '-' + (WH_CODE[wh] || 'X');
export const smDestKey = (r: { company: string; pref: string; city: string; town: string; bld?: string }) => smNorm(r.company) + '|' + smNorm(r.pref + r.city + r.town + (r.bld || ''));
export const smItemsTxt = (items: { pid: string; qty: number }[]) => items.map((i) => `${prod(i.pid)?.name ?? i.pid}×${i.qty}`).join('、');
export const smOrderTxt = (r: Sample) => (r.status === '締め済' ? `あり（${r.shipOrder}）` : r.status === '締め後追加' ? 'なし（締め後追加）' : 'なし（締めると作成）');

/* ---- 配送サイクル（配送サイクル設定と同じ：A1 は月曜・28日＝A〜D×7日） ---- */
export function smCycle(s: string) {
  let a: [string, string] | null = null;
  SMP.a1.forEach((x) => { if (x[0] <= s) a = x; });
  if (!a) return null;
  const [a0, aym] = a as [string, string];
  let idx = Math.round((smD(s) - smD(a0)) / 86400000);
  for (const p of SMP.pauses) {
    if (p[0] >= a0 && p[0] <= s) {
      if (s <= p[1]) return { ym: aym, idx: -1, code: null as string | null };
      idx -= Math.round((smD(p[1]) - smD(p[0])) / 86400000) + 1;
    }
  }
  return { ym: aym, idx, code: idx > 27 ? null : 'ABCD'[Math.floor(idx / 7)] + (idx % 7 + 1) };
}
/** ピッキングできない理由（できるなら null） */
export function smPickable(s: string) {
  const p = SMP.pauses.find((x) => s >= x[0] && s <= x[1]);
  if (p) return 'サイクル休止（' + p[2] + '）';
  if (SMP.ngDates[s]) return '出荷不可日（' + SMP.ngDates[s] + '）';
  const c = smCycle(s);
  if (c && c.code && SMP.ng.includes(c.code)) return '出荷不可枠 ' + c.code;
  return null;
}
/** 納品日から発送日を逆算：ピッキングできない日なら直前のピッキング可能日へ前倒しし、納品日も振り替える（T4-5＝B） */
export function smShip(deliv: string, lead: number) {
  const s0 = smAdd(deliv, -lead);
  const skipped: [string, string][] = [];
  let s = s0;
  let r = smPickable(s);
  while (r && skipped.length < 60) { skipped.push([s, r]); s = smAdd(s, -1); r = smPickable(s); }
  let note = '';
  if (skipped.length) {
    note = `発送日${smMDW(s0)}は${skipped[0][1]}のため、直前のピッキング可能日${smMDW(s)}に前倒しし、納品日も${smMDW(deliv)}→${smMDW(smAdd(s, lead))}に振り替えました（契約の配送と同じ）`;
    if (skipped.length > 1) note += '。途中の ' + skipped.slice(1).map(([d, w]) => smMD(d) + '（' + w + '）').join('・') + ' もピッキングできません';
  }
  return { lead, s0, ship: s, deliv: skipped.length ? smAdd(s, lead) : deliv, moved: skipped.length > 0, note, why: skipped.length ? skipped[0][1] : '' };
}
export const smWeekLabel = (mon: string) => {
  const c = smCycle(mon);
  return `${smMD(mon)}〜${smMD(smAdd(mon, 6))}${c && c.code ? `（${+c.ym.slice(5)}月サイクル ${c.code[0]}週）` : ''}`;
};
export function smWeeks(rows: Sample[], closed: WeekClose[]) {
  const set = new Set([...rows.map((r) => r.week), ...closed.map((c) => c.id)]);
  [0, 7, 14, 21].forEach((d) => set.add(smAdd('2026-11-09', d)));
  return [...set].sort();
}

/* ---- 配送ルート（2026-10-08 台帳 F）：登録のたびにピッキング倉庫・配送会社・中継先を入れる。1回の登録＝1倉庫＝1つの出荷（枝番なし） ---- */
/** その倉庫が扱う商品か（商品マスタの取扱倉庫） */
export const smHandles = (t: SmTarget, wh: string) => t.wh.includes(wh);
/** リードタイム（日）の入力 → 0〜30 の整数（違えば null） */
export const smLeadOf = (s: string | number) => { const t = String(s ?? '').replace(/[０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0)).trim(); return /^\d{1,2}$/.test(t) && +t <= 30 ? +t : null; };
/** 選んだ商品（倉庫が扱うものだけ） */
export const smPicked = (f: Pick<SampleForm, 'items' | 'wh'>, targets: SmTarget[]) =>
  targets.filter((p) => f.items[p.id]?.on && f.wh && smHandles(p, f.wh)).map((p) => ({ pid: p.id, qty: Math.max(1, +f.items[p.id].qty || 1), how: '配送ルートの倉庫' }));
/** 発送日の計算（納品日とリードタイムが揃ったとき） */
export function smPlan(f: Pick<SampleForm, 'items' | 'wh' | 'deliv' | 'lead'>, targets: SmTarget[]) {
  const items = smPicked(f, targets);
  const lead = smLeadOf(f.lead);
  return { items, ship: f.deliv && lead != null ? smShip(f.deliv, lead) : null };
}

/* ---- 月の枠（件数は共通データ dm.sample.quotas。メニュー管理 ＞ 月間メニューで決める。query samples の quota を渡す） ---- */
export function smStats(rows: Sample[], ym: string, quota: Record<string, number> = {}) {
  const bases = new Set<string>();
  rows.forEach((r) => { if (r.ym === ym) bases.add(r.base); });
  const q = quota[ym] ?? null;
  return { q, used: bases.size, rest: q == null ? null : q - bases.size };
}
export const smYmOf = (deliv: string, fallback: string) => { const c = deliv ? smCycle(deliv) : null; return c ? c.ym : deliv ? deliv.slice(0, 7) : fallback; };
/** 月の合計件数を超える登録はできない（U6-4） */
export function smOver(rows: Sample[], deliv: string, fallback: string, quota: Record<string, number> = {}) {
  const s = smStats(rows, smYmOf(deliv, fallback), quota);
  return s.q != null && s.used + 1 > s.q;
}
export function smNextBase(rows: Sample[], ym: string) {
  const p = 'SM-' + ym.slice(2, 4) + ym.slice(5, 7) + '-';
  let mx = 0;
  rows.forEach((r) => { if (r.base.startsWith(p)) mx = Math.max(mx, +r.base.slice(p.length)); });
  return p + String(mx + 1).padStart(3, '0');
}
export const smHistRows = (rows: Sample[], key: string) =>
  rows.filter((r) => smDestKey(r) === key).sort((a, b) => (a.regDate < b.regDate ? 1 : a.regDate > b.regDate ? -1 : a.no < b.no ? -1 : 1));

export const smBlank = (): SampleForm => ({ company: '', pic: '', tel: '', zip: '', pref: '', city: '', town: '', bld: '', deliv: '', memo: '', items: {}, wh: '', routeCarrier: '', routeHub: '', lead: '' });

/** 入力チェック（画面と登録の両方で使う） */
export function smValidate(f: SampleForm, targets: SmTarget[]) {
  const e: Record<string, string> = {};
  const d = (s: string) => String(s || '').replace(/[０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0)).replace(/\D/g, '');
  if (!f.company.trim()) e.company = '法人名を入力してください';
  if (!f.pic.trim()) e.pic = '担当者名を入力してください';
  if (d(f.tel).length < 9) e.tel = '電話番号を入力してください（例：03-1234-5678）';
  if (d(f.zip).length !== 7) e.zip = '郵便番号を7桁で入力してください（例：103-0027）';
  if (!f.pref) e.pref = '都道府県を選んでください';
  if (!f.city.trim()) e.city = '市区町村を入力してください';
  if (!f.town.trim()) e.town = '町域・番地を入力してください';
  if (!f.deliv) e.deliv = '納品日を入力してください';
  if (!f.wh || !smWhOpts().includes(f.wh)) e.wh = 'ピッキング倉庫は必須項目です。';
  if (!f.routeCarrier.trim()) e.routeCarrier = '配送会社は必須項目です。';
  else if (f.routeCarrier.trim().length > 60) e.routeCarrier = '配送会社は60文字以内で入力してください。';
  if (f.routeHub.trim().length > 60) e.routeHub = '中継先は60文字以内で入力してください。';
  if (!String(f.lead ?? '').trim()) e.lead = 'リードタイム（日）は必須項目です。';
  else if (smLeadOf(f.lead) == null) e.lead = 'リードタイム（日）は0〜30の範囲で入力してください。';
  if (f.memo.length > 500) e.memo = 'メモは500文字以内で入力してください。';
  const plan = smPlan(f, targets);
  if (!plan.items.length) e.items = f.wh && targets.some((p) => f.items[p.id]?.on) ? '選んだ商品はこの倉庫では扱えません。倉庫を変えるか、商品を選び直してください' : '送る商品を1つ以上選んでください';
  if (f.deliv && plan.ship && plan.ship.ship < smToday()) e.deliv = `発送日が今日（${fmtDate(smToday())}）より前になります。納品日を後ろにするか、リードタイムを短くしてください`;
  return e;
}

/** 送り状番号の形（半角英数字とハイフン・30文字まで・空も可） */
export const smTrackingOk = (s: string) => /^[0-9A-Za-z-]{0,30}$/.test(s);

/** 1回の登録 → 1つのサンプル（1倉庫＝1つの出荷。枝番は付けない） */
export function smMake(f: SampleForm, base: string, closed: WeekClose[], reg: string, time: string, after: boolean, targets: SmTarget[]): Sample[] {
  const c = smCycle(f.deliv);
  const ym = c ? c.ym : f.deliv.slice(0, 7);
  const plan = smPlan(f, targets);
  const x = plan.ship!;
  const week = smMon(x.ship);
  const isClosed = closed.some((w) => w.id === week);
  const status: Sample['status'] = isClosed ? (after ? '締め後追加' : '締め済') : '受付済';
  return [{
    no: base, base, branch: 0, split: 1, regDate: reg, regAt: smSl(reg) + ' ' + time, by: OPS_USER,
    company: f.company.trim(), pic: f.pic.trim(), tel: f.tel.trim(), zip: f.zip.trim(), pref: f.pref, city: f.city.trim(), town: f.town.trim(), bld: f.bld.trim(),
    items: plan.items, deliv: x.deliv, ship: x.ship, lead: x.lead, note: x.note, why: x.why, wh: f.wh, ym, week, status,
    shipOrder: status === '締め済' ? smOrderNo(week, f.wh) : '', memo: f.memo.trim(),
    routeCarrier: f.routeCarrier.trim(), routeHub: f.routeHub.trim(), trackingNo: '',
  }];
}

export const SMP_YMS = ['2026-09', '2026-10', '2026-11', '2026-12'];
export const SMP_DEF_YM = MONTHS[0];
