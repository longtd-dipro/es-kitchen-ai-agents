import { PASSWORD_RULE, passwordValid } from '@/lib/auth/rules';
import { addDays } from '@/lib/supplier/dates';
import { fmtMdW } from '@/lib/format/date';
import type { TroubleType } from '@/lib/domain/types';
import { NEED_INV } from './seed';
import type { Delivery, DeliveryView, Flow, PointView, Trouble } from './types';
import { fmtNum, yen as yenOf } from '@/lib/format/money';

/*
 * ドライバーの計算と入力チェック（画面と actions の両方で使う）。
 * 今日・いまの日時は呼ぶ側が today()・nowStamp()（'YYYY/MM/DD'・'YYYY/MM/DD HH:mm'）を渡す。
 */

/** 'YYYY/MM/DD' → 'MM-DD（曜）'（表示用。共通の表示ルール・決定 8-1） */
export const mdW = (d: string) => fmtMdW(d);
/** 'YYYY/MM/DD HH:mm' → 時刻 'H:mm'（元の hm()） */
export const hmOf = (stamp: string) => { const [h, m] = (stamp.split(' ')[1] ?? '0:00').split(':'); return `${Number(h)}:${m}`; };
/** 'YYYY/MM/DD HH:mm' → '10-05（月） 10:23'（元の now()） */
export const atOf = (stamp: string) => `${mdW(stamp.slice(0, 10))} ${hmOf(stamp)}`;
/** 完了後に内容を修正できる日（元の EDIT_UNTIL：今日から7日） */
export const editUntil = (today: string) => mdW(addDays(today, 7));
/** 配送一覧の期間（今日から1週間） */
export const weekRange = (today: string) => `${mdW(today)}〜${mdW(addDays(today, 6))}`;

/** 金額（単位なしの桁区切り。入力欄の「円」の前など）。全サイト共通の lib/format/money */
export const yenNum = (n: number | string) => fmtNum(Number(n || 0));
export const yen = (n: number | string) => yenOf(Number(n || 0));
export const winTxt = (d: Pick<Delivery, 'win'>) => (d.win.length ? d.win.map((w) => w.join('〜')).join(' / ') : '—');

/** 到着予定の時刻（8:00〜18:30 の30分ごと） */
export const TIMES: string[] = [];
for (let h = 8; h <= 18; h++) { TIMES.push(`${String(h).padStart(2, '0')}:00`); TIMES.push(`${String(h).padStart(2, '0')}:30`); }

/* ---------- 状態とトラブルの印（RV-DRIVER-20261002 D-d・D-f） ---------- */

export const trOpen = (o: { tr: Trouble[] }) => o.tr.filter((t) => !t.resolved);
/** 一覧の絞り込みのステータス（未解決のトラブルがあれば「トラブル」） */
export const badgeOf = (o: { tr: Trouble[]; status: string }) => (trOpen(o).length ? 'トラブル' : o.status);

/* ---------- 受取（D-a：受取地点で受け取っていない箱は配送でチェックできない） ---------- */

export const recvKey = (no: string, invNo: string) => `${no}|${invNo}`;
export const rcvd = (pt: Pick<PointView, 'recv'> | undefined, d: Pick<DeliveryView, 'no'>, invNo: string) => !!pt?.recv[recvKey(d.no, invNo)];
/** 1箱も受け取っていない */
export const nrAll = (pt: Pick<PointView, 'recv'> | undefined, d: Pick<DeliveryView, 'no' | 'inv'>) => !d.inv.some((i) => rcvd(pt, d, i.no));
/** 受取地点の荷物がすべてチェック済み */
export const allRecv = (recv: Record<string, boolean>, dels: Pick<DeliveryView, 'no' | 'inv'>[]) => dels.every((d) => d.inv.every((i) => recv[recvKey(d.no, i.no)]));
/** 受け取っていない送り状番号 */
export const missing = (recv: Record<string, boolean>, dels: Pick<DeliveryView, 'no' | 'inv'>[]) => dels.flatMap((d) => d.inv.filter((i) => !recv[recvKey(d.no, i.no)]).map((i) => i.no));

/* ---------- ES配送便の5ステップ ---------- */

/** 再開する画面（元の ['s1','s1','s2','s3','s4','s5'][f.step]） */
export const resumeStep = (f: Flow) => (['s1', 's1', 's2', 's3', 's4', 's5'][f.step] ?? 's1') as Step;
export type Step = 's1' | 's2' | 'scan' | 's3' | 's4' | 's5';
export const STEPS: Step[] = ['s1', 's2', 'scan', 's3', 's4', 's5'];
/** 陳列の差異（「鯖の味噌煮 -2」） */
export const dispDiffs = (f: Flow) => f.disp.filter((r) => r.ac !== r.pl).map((r) => `${r.n} ${r.ac - r.pl > 0 ? '+' : ''}${r.ac - r.pl}`);
/** 陳列が予定どおり（すべて確認済み・差異なし） */
export const dispClean = (f: Flow) => f.disp.every((r) => r.ck && r.ac === r.pl);

/* ---------- トラブル ---------- */

/**
 * アプリの選択肢（原文）→ 共通データのトラブルの種類（dm.master.troubleTypes。2026/10/01 決定 A3 の6区分）。
 * 「商品不足・誤配送」は運営が中身を見て区分を決める（運営の画面の「種別未定」）ので、共通データでは「種別未定」にして原文をメモに残す
 */
export const TYPE_OF: Record<string, TroubleType['id']> = {
  '箱数不足': 'qty_diff', '誤配送': 'wrong_delivery', '荷物破損': 'damage',
  '商品不足・誤配送': 'undecided', '交通渋滞・事故': 'delay', '不在・連絡不可': 'absent',
  '一部未配送のまま完了': 'qty_diff', 'その他': 'other',
};

export type TroubleInput = { type: string | null; nos: string[]; note: string };
/** トラブル報告の入力チェック（元の送信ボタンが押せる条件）。エラーの文言を返す（なければ ''） */
export function checkTrouble(t: TroubleInput, reasons: string[]): string {
  if (!t.type || !reasons.includes(t.type)) return 'トラブル内容を選択してください';
  if (NEED_INV.includes(t.type) && !t.nos.length) return '影響を受けた送り状番号を選択してください';
  if (t.type === 'その他' && !t.note.trim()) return '備考を入力してください';
  if (t.note.length > 1000) return '備考は1000文字以内で入力してください';
  return '';
}

/** 到着予定のチェック */
export const checkEta = (e: [string, string]) => (!TIMES.includes(e[0]) || !TIMES.includes(e[1]) ? '時刻を選択してください' : e[0] >= e[1] ? '終了時刻は開始時刻より後にしてください' : '');

/** 金額の入力（数字だけ） */
export const digits = (s: string) => s.replace(/\D/g, '').slice(0, 9);

/* ---------- ログイン・パスワードリセット ---------- */

export const checkLogin = (id: string, pw: string) => (!id.trim() || !pw ? 'ログインIDとパスワードを入力してください。' : '');
export const checkNewPassword = (p1: string, p2: string) => (!p1 ? 'パスワードを入力してください。' : !passwordValid(p1) ? `パスワードは${PASSWORD_RULE}` : p1 !== p2 ? 'パスワードが一致しません。' : '');
