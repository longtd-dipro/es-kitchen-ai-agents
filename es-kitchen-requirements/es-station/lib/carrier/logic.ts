import type { CarrierDelivery, Cooler, DeliveryStatus, Food, QuoteAnswerInput, QuoteStatus, StaffDraft, Temp } from './types';
import { fmtDate, fmtDateW } from '@/lib/format/date';
import { PASSWORD_RULE, passwordValid } from '@/lib/auth/rules';

/*
 * 委託配送先Web の計算と入力チェック（画面と actions の両方で使う）。
 * 日付は 'YYYY-MM-DD'（元のデモの DELIV の形）。今日は呼ぶ側が today() から渡す。
 */

export type Errors = Record<string, string>;

export const WDAY = '日月火水木金土';
/** 'YYYY/MM/DD' → 'YYYY-MM-DD' */
export const isoOf = (s: string) => s.replace(/\//g, '-');
/** 'YYYY-MM-DD' → 'YYYY/MM/DD' */
export const fmtD = (d: string) => d.replace(/-/g, '/');
/** 'YYYY-MM-DD HH:mm' → 'YYYY-MM-DD（曜） HH:mm'（表示用。共通の表示ルール・決定 8-1） */
export const fmtDT = (s: string) => {
  const [d, t] = s.split(' ');
  return `${fmtDateW(d)}${t ? ' ' + t : ''}`;
};
/** 'YYYY/MM/DD' または 'YYYY-MM-DD' → 表示の 'YYYY-MM-DD'（共通の表示ルール・決定 8-1。名前は元のまま） */
export const jaDate = (s: string) => fmtDate(s);
import { yen as yenOf } from '@/lib/format/money';
export const yen = (n: number | string | undefined) => yenOf(Number(n || 0));
export const num = (n: number) => n.toLocaleString('ja-JP');
const pad = (n: number) => String(n).padStart(2, '0');
export const isoD = (t: Date) => `${t.getFullYear()}-${pad(t.getMonth() + 1)}-${pad(t.getDate())}`;
export const addDaysIso = (iso: string, n: number) => { const t = new Date(iso + 'T00:00:00'); t.setDate(t.getDate() + n); return isoD(t); };

export const TEMP_LABEL: Record<Temp, string> = { f: '冷凍', r: '冷蔵', m: '資材' };
export const TEMP_GOODS: Record<Temp, string> = { f: '冷凍惣菜', r: '冷蔵惣菜', m: '資材' };

/* ---------- カレンダー ---------- */

/**
 * RV-CARRIER-20261002 K-a：サイクル暦。各サイクルは月曜始まりの4週（A1〜D7）。
 * 2026年9月サイクル A1＝9/14、10月 A1＝10/12、11月 A1＝11/09。
 */
const CYC_A1: [string, string][] = [['2026-09-14', '9月'], ['2026-10-12', '10月'], ['2026-11-09', '11月']];
export function cycOf(iso: string) {
  const t = new Date(iso + 'T00:00:00');
  for (let i = CYC_A1.length - 1; i >= 0; i--) {
    const n = Math.round((t.getTime() - new Date(CYC_A1[i][0] + 'T00:00:00').getTime()) / 864e5);
    if (n >= 0 && n < 28) return { mo: CYC_A1[i][1], w: 'abcd'[Math.floor(n / 7)], lab: 'ABCD'[Math.floor(n / 7)] + (n % 7 + 1) };
  }
  return null;
}
export type CalCell = { d: number; cy: string | null; w: string; t: Record<Temp, number>; other: boolean; mo: string; today: boolean; un: number; iso: string };
/** 月のカレンダー（月曜始まりの週ごと）。件数・配送スタッフ未設定は配送の納品日で数える */
export function calRows(dels: { date: string; temp: Temp; staff: string | null }[], ym: string, todayIso: string): CalCell[][] {
  const first = new Date(ym + '-01T00:00:00'), last = new Date(first.getFullYear(), first.getMonth() + 1, 0);
  const st = new Date(first);
  st.setDate(1 - ((first.getDay() + 6) % 7));
  const rows: CalCell[][] = [];
  for (const w = new Date(st); w <= last; w.setDate(w.getDate() + 7)) {
    const row: CalCell[] = [];
    for (let i = 0; i < 7; i++) {
      const t = new Date(w);
      t.setDate(w.getDate() + i);
      const iso = isoD(t), c = cycOf(iso), ds = dels.filter((d) => d.date === iso), n = (k: Temp) => ds.filter((d) => d.temp === k).length;
      row.push({ d: t.getDate(), cy: c ? c.lab : null, w: c ? c.w : 'x', t: { f: n('f'), r: n('r'), m: n('m') }, other: iso.slice(0, 7) !== ym, mo: c ? c.mo : '', today: iso === todayIso, un: ds.filter((d) => !d.staff).length, iso });
    }
    rows.push(row);
  }
  return rows;
}

/* ---------- 配送 ---------- */

/** 状態の色（元の DST） */
export const DST: Record<DeliveryStatus, string> = {
  '予定': 'ds-prep', '確認中': 'ds-gray', '出荷待': 'ds-prep', '出荷済': 'ds-ship', '受取済': 'ds-recv', '納品済': 'ds-done', '一部納品済': 'ds-part', '再配達待': 'ds-trouble', '中止': 'ds-gray', '取消': 'ds-gray',
};
/** 配送スタッフを割り当てられるか（予定・出荷待。中継からの2次は出荷済も） */
export const dAssignable = (d: Pick<CarrierDelivery, 'st' | 'relay'>) => d.st === '予定' || d.st === '出荷待' || (d.st === '出荷済' && !!d.relay);
export const dLockReason = (d: Pick<CarrierDelivery, 'st'>) =>
  d.st === '確認中' ? '確認中のため、確定後に割り当てます' : (d.st === '出荷済' || d.st === '受取済') ? 'スタッフが荷物を受け取り済み（または出荷済み）のため変更できません' : 'この状態では変更できません';
/** 明日（今日の翌日）納品か */
export const isEve = (d: { date: string }, todayIso: string) => d.date === addDaysIso(todayIso, 1);
/** 実績の実際数（一部納品のときは納品数） */
export const foodActual = (f: Food, st: string) => (st === '一部納品済' ? f[8] : f[7]);
export const partItems = (foods: Food[]) => foods.filter((f) => f[8] < f[7]);
export function foodSum(foods: Food[], st: string) {
  const s = (i: number) => foods.reduce((a, f) => a + (f[i] as number), 0);
  return {
    dc: s(3), th: s(5), ac: s(6), df: foods.reduce((a, f) => a + (f[5] - f[6]), 0), pl: s(7),
    re: foods.reduce((a, f) => a + foodActual(f, st), 0), dd: foods.reduce((a, f) => a + (f[7] - foodActual(f, st)), 0),
  };
}

/* ---------- 配送スタッフ ---------- */

/** RV-CARRIER-20261002 K-c：担当中の配送（納品前の状態）・貸与中の保冷バッグがあるスタッフは削除できない */
export const STAFF_BUSY_ST: DeliveryStatus[] = ['予定', '確認中', '出荷待', '出荷済', '受取済', '再配達待'];
export function staffBlock(id: string, dels: Pick<CarrierDelivery, 'staff' | 'st'>[], coolers: Cooler[]) {
  const nd = dels.filter((d) => d.staff === id && STAFF_BUSY_ST.includes(d.st)).length;
  const nb = coolers.filter((r) => r.kind === '保冷バッグ' && r.status === '貸与中' && r.staff.startsWith(id + ' ')).reduce((a, r) => a + r.qty, 0);
  return [nd ? `担当中の配送 ${nd}件` : '', nb ? `貸与中の保冷バッグ ${nb}個` : ''].filter(Boolean).join('・');
}
/** ステータスの色 */
export const SST: Record<string, string> = { '有効': 'b-green', '利用停止': 'b-red', '無効': 'b-gray', '免許未登録': 'b-amber' }; /* 色は lib/format/status.ts の CARRIER_CLS と同じ */
/** 一括発行できない理由 */
export const issueNg = (s: { st: string; email: string }) => (s.st !== '有効' ? `ステータスが「${s.st}」` : !s.email ? 'メールアドレス未登録' : '');

/** 配送スタッフの入力チェック（キー＝元の data-err の名前） */
export function checkStaff(d: Partial<StaffDraft>, hasLic: boolean): Errors {
  const e: Errors = {};
  if (!(d.name || '').trim()) e.sf_name = '配送スタッフ名を入力してください。';
  if (!(d.kana || '').trim()) e.sf_kana = 'カナを入力してください。';
  else if (!/^[ァ-ヶー\s　]+$/.test(d.kana!)) e.sf_kana = '全角カタカナで入力してください。';
  if (!(d.email || '').trim()) e.sf_email = 'メールアドレスを入力してください。';
  else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(d.email!)) e.sf_email = 'メールアドレスの形式が正しくありません。';
  if (!hasLic) e.sf_lic = '免許証の写真を追加してください。';
  return e;
}

/* ---------- 見積依頼 ---------- */

export const QSTATUS: Record<QuoteStatus, string> = { '未回答': 'b-amber', '再確認待ち': 'b-purple', '回答済': 'b-green', '対応不可': 'b-gray', '期限切れ': 'b-red' };
export const OPEN_ST: QuoteStatus[] = ['未回答', '再確認待ち'];
/** 回答期限までの日数（期限の日の 23:59:59 まで。今日は 09:00 として数える：元のデモの基準） */
export function daysLeft(due: string, todayIso: string) {
  const d = new Date(isoOf(due) + 'T23:59:59').getTime(), t = new Date(todayIso + 'T09:00:00').getTime();
  return Math.floor((d - t) / 864e5);
}
export const sumRows = (rows: [string, number | string][]) => rows.reduce((s, r) => s + (Number(r[1]) || 0), 0);

/** 見積の回答の入力チェック（キー＝元の data-err の名前） */
export function checkQuoteAnswer(a: QuoteAnswerInput): Errors {
  const e: Errors = {};
  if (a.mode === 'ng') {
    if (!a.ng) e.ngr = 'NG理由を選択してください。';
    if (a.ng === 'その他' && !(a.ngc || '').trim()) e.ngc = '「その他」の場合はコメントを入力してください。';
  } else if (a.mode === 'ok') {
    if (!sumRows(a.rows)) e.sum = '料金内訳に金額を入力してください。見積金額は必須です。';
    if (!a.file) e.qfile = '見積書を添付してください。';
    if (!a.sd) e.sd = '最短開始可能日を選択してください。';
  } else if (a.mode === 'change') {
    if (!a.newAmt) e.newAmt = '新しい見積金額を入力してください。';
    if (!a.file2) e.qfile2 = '新しい見積書を添付してください。';
  }
  return e;
}
/** 添付ファイルのチェック（PDF・Excel・10MB まで） */
export function checkQuoteFile(name: string, size: number) {
  if (!/\.(pdf|xlsx|xls)$/i.test(name)) return 'PDFまたはExcel形式のファイルを選択してください。';
  if (size > 10 * 1024 * 1024) return 'ファイルサイズが10MBを超えています。';
  return '';
}

/* ---------- ログイン・申し込み ---------- */

/** パスワード再設定の新しいパスワード（8〜64文字・半角・英字と数字を含む：台帳 F 2026-10-07） */
export function checkNewPassword(a: string, c: string) {
  if (!passwordValid(a)) return `・${PASSWORD_RULE}`;
  if (a !== c) return '・確認用パスワードが一致しません';
  return '';
}
/** 申し込みフォーム 1/2 の必須（委託配送先名・郵便番号・都道府県・市区町村・町域・番地・電話番号、担当者の名前・メール・TEL） */
export const APPLY_REQ = ['name', 'zip', 'pref', 'city', 'addr', 'tel'] as const;
export function apply1Ok(f: Record<string, unknown> & { contacts?: { n?: string; m?: string; t?: string }[] }) {
  const cs = f.contacts?.length ? f.contacts : [{}];
  return APPLY_REQ.every((k) => String(f[k] ?? '').trim()) && cs.every((c: { n?: string; m?: string; t?: string }) => (c.n ?? '').trim() && (c.m ?? '').trim() && (c.t ?? '').trim());
}
export function apply2Ok(f: { area: string; car: string; frz: string; ref: string; sp: string; agree: boolean }) {
  return !!(f.area && f.car && f.frz && f.ref && f.sp && f.agree);
}
