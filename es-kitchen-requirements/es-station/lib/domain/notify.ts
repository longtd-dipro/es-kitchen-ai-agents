import type { DocRepo } from '@/lib/ops/core/area';
import { addDays, nowStamp, parseDate, today } from '@/lib/supplier/dates';
import type { Holiday, Notification } from './types';

/** 通知を作る（actions の中から呼ぶ）。ID＝NT-YYMMDD-NNNN */
export function notify(r: DocRepo, n: Omit<Notification, 'id' | 'at' | 'readAt' | 'channels'> & { channels?: Notification['channels'] }) {
  const ymd = today().slice(2).replace(/\//g, '');
  const k = r.list<Notification>('dm.notice.notifications').filter((x) => x.id.startsWith(`NT-${ymd}-`)).length + 1;
  const x: Notification = { channels: ['site', 'mail'], ...n, id: `NT-${ymd}-${String(k).padStart(4, '0')}`, at: nowStamp(), readAt: '' };
  r.put('dm.notice.notifications', x.id, x);
  return x;
}

/** 法人・拠点あての通知（拠点アカウントと、法人があれば法人アカウントにも） */
export function notifyBranch(r: DocRepo, branchId: string, n: Omit<Parameters<typeof notify>[1], 'to'>) {
  notify(r, { ...n, to: { site: 'corp', accountId: branchId, role: '' } });
  const corpId = r.get<{ corpId: string | null }>('dm.org.branches', branchId)?.corpId;
  if (corpId) notify(r, { ...n, to: { site: 'corp', accountId: corpId, role: '' } });
}

/**
 * アプリの利用者あての通知（拠点のアプリ利用者みんな。to.site＝app・accountId＝拠点ID。プッシュ＝site）。
 * scheduledAt を渡すと予約（その日時まで出さない。menu.tick が出す）
 */
export function notifyApp(r: DocRepo, branchId: string, n: Omit<Parameters<typeof notify>[1], 'to' | 'channels'>, scheduledAt?: string) {
  const x = notify(r, { ...n, to: { site: 'app', accountId: branchId, role: '' }, channels: ['site'] });
  if (!scheduledAt) return x;
  const y: Notification = { ...x, scheduledAt };
  r.put('dm.notice.notifications', y.id, y);
  return y;
}

/* ---------------- お客様の休みの日（2026/10/03 決定・メール一覧 X1） ---------------- */

/**
 * お客様（法人・拠点・アプリの利用者）の休み＝土曜・日曜・全社のお届けしない日（祝日・年末年始。dm.delivery.holidays の noDelivery で倉庫だけの日でないもの）。
 * 拠点ごとの休日は見ない（メール一覧 X1・課題 4b-3）
 */
export function customerOff(r: DocRepo, date: string, holidays = r.list<Holiday>('dm.delivery.holidays')) {
  const wd = parseDate(date).getDay();
  return wd === 0 || wd === 6 || holidays.some((h) => h.date === date && h.noDelivery && !h.warehouseIds?.length);
}
/** 予定のお知らせを送る日：その日がお客様の休みなら、前の営業日（前倒し）。immediate のお知らせ（パスワード再設定など）には使わない */
export function customerSendDay(r: DocRepo, date: string) {
  const hs = r.list<Holiday>('dm.delivery.holidays');
  let d = date;
  for (let i = 0; i < 14 && customerOff(r, d, hs); i++) d = addDays(d, -1);
  return d;
}
/** 予定の日時（YYYY/MM/DD HH:mm）を、お客様の休みなら前の営業日の同じ時刻に */
export const customerSendAt = (r: DocRepo, at: string) => `${customerSendDay(r, at.slice(0, 10))}${at.slice(10)}`;

/** 1回だけ出す通知（key が同じ通知がもうあれば出さない）。予定のお知らせの key は 'sched:' で始める（check.run が休みの日でないか確かめる） */
export function notifyOnce(r: DocRepo, key: string, n: Parameters<typeof notify>[1]) {
  if (r.list<Notification>('dm.notice.notifications').some((x) => x.key === key)) return null;
  return notify(r, { ...n, key });
}
/** 取引先（委託配送先・仕入先）のあて先。サイトのアカウントがなければメールだけ（role＝mail:ID。どのアカウントの一覧にも出さない） */
export function partnerTo(r: DocRepo, site: 'carrier' | 'supplier', id: string): Pick<Notification, 'to' | 'channels'> {
  return r.get('dm.account.accounts', id) ? { to: { site, accountId: id, role: '' }, channels: ['site', 'mail'] } : { to: { site, accountId: '', role: `mail:${id}` }, channels: ['mail'] };
}

/** 予約した通知のうち、now（YYYY/MM/DD HH:mm）までのものを出す（at＝予約の日時にする）。出した数 */
export function releaseScheduled(r: DocRepo, now: string) {
  let n = 0;
  for (const x of r.list<Notification>('dm.notice.notifications')) {
    if (!x.scheduledAt || x.scheduledAt > now) continue;
    const { scheduledAt, ...rest } = x;
    r.put<Notification>('dm.notice.notifications', x.id, { ...rest, at: scheduledAt });
    n++;
  }
  return n;
}
