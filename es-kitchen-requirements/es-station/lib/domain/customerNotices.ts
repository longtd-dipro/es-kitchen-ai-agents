import type { DocRepo } from '@/lib/ops/core/area';
import { addDays, WD } from '@/lib/supplier/dates';
import { deliversIn } from './areas/order';
import { sendAnnouncementMails } from './mails';
import { addYm, listMenus } from './menu';
import { customerOff, customerSendDay, notifyOnce } from './notify';
import type { Account, ChildContract, Corp, Delivery, Notification, ProductOrder } from './types';

/*
 * 日次バッチの「お客様への予定のお知らせ」（batch.ts の customerNotice。2026/10/03 決定）。
 *   ・オーダー受付開始（order_open）：受付開始日。公開のお知らせ（menu_published）のほうが後なら出さない（同じ内容を2回送らない）
 *   ・オーダー入力されていません（order_reminder）：オーダー締切の7日前と3日前（7日前は 2026-10-03 決定）。商品注文を入れていない拠点（デフォルトのまま）だけ。
 *     お試しは出さない。法人が法人Web で「ご注文のリマインド」を切った法人の拠点（と法人）には出さない（Corp.orderReminder＝false）
 *   ・次月の発送・納品予定日（delivery_schedule）：前月21日。次のサイクル月のお届け予定日を拠点ごとに
 *   ・お知らせのメール（重要なお知らせの 8:00 など）：送る日時を過ぎたものを送ったことにする
 * どれも、その日がお客様の休み（土日・全社の祝日）なら前の営業日に送る（customerSendDay）。休みの日には送らない（前の営業日に送り損ねたら次の営業日・期限まで）。
 * 1回だけ（通知の key＝sched:…）。法人は拠点ごとではなくまとめて1通
 */

const ymJa = (ym: string) => `${ym.slice(0, 4)}年${Number(ym.slice(5))}月`;
const mdw = (d: string) => `${Number(d.slice(5, 7))}/${Number(d.slice(8, 10))}（${WD[new Date(+d.slice(0, 4), +d.slice(5, 7) - 1, +d.slice(8, 10)).getDay()]}）`;
const hasAcc = (r: DocRepo, id: string) => !!id && !!r.get<Account>('dm.account.accounts', id);
const corpOf = (r: DocRepo, branchId: string) => r.get<{ corpId: string | null }>('dm.org.branches', branchId)?.corpId ?? '';
const nameOf = (r: DocRepo, branchId: string) => r.get<{ name: string }>('dm.org.branches', branchId)?.name ?? branchId;

/** ご注文のリマインドを送る拠点か（法人が切っていない。法人なしの拠点は送る） */
const reminderOn = (r: DocRepo, branchId: string) => { const c = corpOf(r, branchId); return !c || r.get<Corp>('dm.org.corps', c)?.orderReminder !== false; };

/** 拠点ごとに1通、法人へはその拠点をまとめて1通 */
function toBranches(r: DocRepo, keyBase: string, branchIds: string[], n: Omit<Notification, 'id' | 'at' | 'readAt' | 'channels' | 'to' | 'body'> & { body: (ids: string[]) => string }) {
  const sent: string[] = [];
  const byCorp = new Map<string, string[]>();
  for (const b of branchIds) {
    if (hasAcc(r, b) && notifyOnce(r, `${keyBase}:${b}`, { ...n, to: { site: 'corp', accountId: b, role: '' }, body: n.body([b]) })) sent.push(b);
    const c = corpOf(r, b);
    if (c) byCorp.set(c, [...(byCorp.get(c) ?? []), b]);
  }
  for (const [c, ids] of byCorp) if (hasAcc(r, c) && notifyOnce(r, `${keyBase}:${c}`, { ...n, to: { site: 'corp', accountId: c, role: '' }, body: n.body(ids) })) sent.push(c);
  return sent;
}

/** そのサイクル月に配送する拠点（子契約。お試しを除くかどうか） */
const branchesIn = (r: DocRepo, ym: string, noTrial: boolean) =>
  [...new Set(r.list<ChildContract>('dm.org.childContracts').filter((c) => c.cycleMonth === ym && deliversIn(r, c) && !(noTrial && c.kind === 'お試しキャンペーン')).map((c) => c.branchId))].sort();

/** そのサイクル月の商品注文をまだ入れていない拠点（デフォルトのまま。お試しを除く） */
function notEntered(r: DocRepo, ym: string) {
  const entered = new Set(r.list<ProductOrder>('dm.order.orders').filter((o) => o.cycleMonth === ym && ['登録済', 'ES登録済'].includes(o.status)).map((o) => o.branchId));
  return branchesIn(r, ym, true).filter((b) => !entered.has(b));
}

/**
 * 画面の警告（受付簿 No.30・hong 回答 2026-10-05）：受付中のメニューの締切の7日前から締切の日まで、
 * まだご注文を入れていない拠点（branchIds のうち）。なければ null。法人Web のホーム・商品注文の画面に出す。
 * 「ご注文のリマインド」の ON/OFF は通知・メールだけのもので、画面の警告は切らない
 */
export function orderDueWarning(r: DocRepo, branchIds: string[], day: string): { ym: string; label: string; to: string; daysLeft: number; branches: { id: string; name: string }[] } | null {
  const m = listMenus(r).find((x) => x.status === '公開中' && x.orderFrom <= day && day <= x.orderTo);
  if (!m || day < addDays(m.orderTo, -7)) return null;
  const ids = notEntered(r, m.id).filter((b) => branchIds.includes(b));
  if (!ids.length) return null;
  const daysLeft = Math.round((Date.parse(m.orderTo.replace(/\//g, '-')) - Date.parse(day.replace(/\//g, '-'))) / 864e5);
  return { ym: m.id, label: ymJa(m.id), to: m.orderTo, daysLeft, branches: ids.map((id) => ({ id, name: nameOf(r, id) })) };
}

export function customerNotices(r: DocRepo, day: string) {
  const out = { orderOpen: [] as string[], orderReminder: [] as string[], deliverySchedule: [] as string[], mails: sendAnnouncementMails(r, `${day} 09:00`) };
  if (customerOff(r, day)) return out;
  const inWindow = (nominal: string, until: string) => day >= customerSendDay(r, nominal) && day <= until;

  for (const m of listMenus(r)) {
    if (m.status !== '公開中' || !m.orderFrom || !m.orderTo) continue;
    /* 受付開始（公開のお知らせが受付開始の送る日より前のときだけ） */
    if (inWindow(m.orderFrom, m.orderTo) && m.publishedAt && m.publishedAt.slice(0, 10) < customerSendDay(r, m.orderFrom)) {
      out.orderOpen.push(...toBranches(r, `sched:order_open:${m.id}`, branchesIn(r, m.id, false), {
        templateId: 'order_open', link: { type: 'menu', id: m.id }, title: `${ymJa(m.id)}のご注文の受付を開始しました（${m.orderTo} まで）`,
        body: () => `ご注文の受付：${m.orderFrom}〜${m.orderTo}\n法人Web の「月次注文」で便ごとに商品と個数を選んでください（ご注文がない拠点は基準数でお届けします）。`,
      }));
    }
    /* 締切の7日前・3日前：注文を入れていない拠点（7日前は3日前の送る日の前日まで。送り損ねたら3日前だけ） */
    for (const [days, key, until] of [[7, 'order_reminder7', addDays(customerSendDay(r, addDays(m.orderTo, -3)), -1)], [3, 'order_reminder', m.orderTo]] as const) {
      if (!inWindow(addDays(m.orderTo, -days), until)) continue;
      const todo = notEntered(r, m.id).filter((b) => reminderOn(r, b));
      out.orderReminder.push(...toBranches(r, `sched:${key}:${m.id}`, todo, {
        templateId: 'order_reminder', link: { type: 'menu', id: m.id }, title: `${ymJa(m.id)}のご注文は ${m.orderTo} までです（まだ入力されていません）`,
        body: (ids) => `${ids.map((b) => nameOf(r, b)).join('・')} の${ymJa(m.id)}のご注文がまだ入力されていません。締切 ${m.orderTo} までにご注文がない場合は基準数でお届けします。`,
      }));
    }
  }

  /* 前月21日：次のサイクル月のお届け予定日 */
  const ym = day.slice(0, 7);
  if (inWindow(`${ym}/21`, `${ym}/31`)) {
    const next = addYm(ym.replace('/', '-'), 1);
    const ds = r.list<Delivery>('dm.delivery.deliveries').filter((d) => d.cycleMonth === next && !d.parentId && d.temp !== '資材' && !['取消', '中止'].includes(d.status));
    const byB = new Map<string, Delivery[]>();
    for (const d of ds) byB.set(d.branchId, [...(byB.get(d.branchId) ?? []), d]);
    const rows = (b: string) => (byB.get(b) ?? []).sort((x, y) => x.deliverOn.localeCompare(y.deliverOn) || x.temp.localeCompare(y.temp)).map((d) => `・${mdw(d.deliverOn)} ${d.temp} ${d.plannedQty}食（出荷 ${mdw(d.shipOn)}）`).join('\n');
    out.deliverySchedule.push(...toBranches(r, `sched:delivery_schedule:${next}`, [...byB.keys()].sort(), {
      templateId: 'delivery_schedule', link: { type: '', id: '' }, title: `${ymJa(next)}のお届け予定日のお知らせ`,
      body: (ids) => `${ymJa(next)}のお届け予定日は次のとおりです。\n${ids.map((b) => `■ ${nameOf(r, b)}\n${rows(b)}`).join('\n')}\nお届け日の変更：法人Web の「お届け予定」から申請できます。`,
    }));
  }
  return out;
}
