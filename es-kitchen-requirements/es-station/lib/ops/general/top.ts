import { addDays, nowStamp, parseDate, today } from '@/lib/supplier/dates';
import type { DocRepo } from '../core/area';
import notice from '@/lib/domain/areas/notice';
import report from '@/lib/domain/areas/report';
import dmStock from '@/lib/domain/areas/stock';
import { slotOf } from '@/lib/domain/calendar';
import type { Announcement, Cycle, Delivery, Invoice, MonthlyMenu, SalesSample, SampleQuota } from '@/lib/domain/types';
import { usedOf } from '@/lib/domain/areas/sample';
import deliveryArea from '../areas/delivery';
import applicationsArea from '../areas/applications';
import { docSupplierRepo } from '../purchasing/docRepo';
import { fmtMd, fmtYm } from '@/lib/format/date';

/*
 * 運営トップのアラート一覧とスケジュール（REQ-UI-001・REQ-UI-002・2026/10/02 決定）。
 * どちらも共通データから作る（固定の文言・件数は持たない）。表示する項目は固定（利用者が選ぶ機能は作らない・決定どおり）。
 */

export type TopAlert = { tone: 'ng' | 'warn' | 'info'; area: string; text: string; href: string; n: number };

/** アラート一覧：対応が必要な件数がある項目だけ（0件の項目は出さない） */
export function topAlerts(repo: DocRepo): TopAlert[] {
  const now = nowStamp(), t = today();
  const out: TopAlert[] = [];
  const add = (a: TopAlert) => { if (a.n > 0) out.push(a); };

  /* 配送：要確認（未対応）＝配送管理のバッジと同じ */
  const dv = deliveryArea.queries.navBadge(repo) as { count: number };
  add({ tone: 'ng', area: '配送', text: `要確認 ${dv.count}件（ドライバー未設定・変更の締切・短消費期限など）`, href: '/ops/delivery/review', n: dv.count });

  /* 発注：本発注から24時間を過ぎても仕入先が承認していない・仕入先が受注不可と回答した */
  const orders = docSupplierRepo(repo).listOrders();
  const dayAgo = `${addDays(t, -1)}${now.slice(10)}`;
  const late = orders.filter((o) => o.hon > 0 && !o.honAck && !['キャンセル', '受注不可', '出荷済'].includes(o.ans) && !!o.honAt && o.honAt <= dayAgo).length;
  const ng = orders.filter((o) => o.ans === '受注不可').length;
  add({ tone: 'ng', area: '発注', text: [late ? `本発注の未承認（24時間超）${late}件` : '', ng ? `仕入先の受注不可 ${ng}件` : ''].filter(Boolean).join('・'), href: '/ops/purchasing/orders', n: late + ng });

  /* 入荷：差異あり・対応待ち／分納の入荷予定日を過ぎた／追加発注の入荷予定日が便に間に合わない（対応するまで出し続ける） */
  const sa = dmStock.queries.alerts(repo) as { count: number; pending: { poNo: string; planQty: number; qty: number; receivedOn: string }[]; late: unknown[]; altLate: unknown[] };
  const pend = sa.pending.length;
  add({
    tone: 'ng', area: '入荷', href: '/ops/purchasing/receiving', n: pend + sa.late.length,
    text: [pend ? `入荷の差異の対応待ち ${pend}件（${sa.pending.map((x) => `${x.poNo}：予定 ${x.planQty}個 → 入荷 ${x.qty}個`).join('、')}）` : '', sa.late.length ? `分納の入荷予定日を過ぎた ${sa.late.length}件` : ''].filter(Boolean).join('・'),
  });
  add({ tone: 'ng', area: '追加発注', text: `入荷予定日が便に間に合わない追加発注 ${sa.altLate.length}件（便は自動で動かしません。スケジュールで直してください）`, href: '/ops/delivery/schedule', n: sa.altLate.length });

  /* 資材：在庫がしきい値を下回っている */
  const low = (dmStock.queries.materials(repo) as { low: boolean; warehouseName: string; name: string; qty: number; minQty: number }[]).filter((x) => x.low);
  add({ tone: 'ng', area: '資材', text: `資材の在庫不足 ${low.length}件（${low.map((x) => `${x.warehouseName} ${x.name} ${x.qty}（しきい値 ${x.minQty}）`).join('、')}）`, href: '/ops/purchasing/materials', n: low.length });

  /* 契約申請：対応が必要な申請＝契約申請管理のバッジと同じ */
  const ap = applicationsArea.queries.navBadge(repo) as { count: number };
  add({ tone: 'warn', area: '契約申請', text: `対応が必要な申請 ${ap.count}件`, href: '/ops/applications', n: ap.count });

  /* 請求：Bill One の送付エラー（請求書の確定のお知らせは上の「請求の確定がまだです」に出す） */
  const sendErr = repo.list<Invoice>('dm.billing.invoices').filter((i) => i.status !== '取消' && i.send?.status === 'エラー').length;
  add({ tone: 'warn', area: '請求', text: `Bill One の送付エラー ${sendErr}件`, href: '/ops/billing/confirm', n: sendErr });

  /* 棚卸：この締め（20日）でまだ申告していない拠点（棚卸なしの拠点は除く） */
  const due = report.queries.stockDue(repo) as unknown[];
  add({ tone: 'warn', area: '棚卸', text: `未申告の拠点 ${due.length}件（締め ${fmtMd(stockClose(t))}）`, href: '/ops/billing/stock', n: due.length });

  /* 営業サンプル：今月・来月の受付（月の枠の残り）と、出荷週の締めがまだの受付（台帳 E「運営 TOP のカレンダー」2026-10-05：警告を残す） */
  const samples = repo.list<SalesSample>('dm.sample.samples');
  const ym0 = t.slice(0, 7).replace('/', '-'), ym1 = addMonthYm(ym0);
  const quotas = repo.list<SampleQuota>('dm.sample.quotas').filter((q) => q.id === ym0 || q.id === ym1).sort((a, b) => a.id.localeCompare(b.id));
  const open = samples.filter((x) => x.status === '受付済').length;
  add({
    tone: 'info', area: '営業サンプル', href: '/ops/purchasing/samples', n: quotas.length + open,
    text: [...quotas.map((q) => { const u = usedOf(samples, q.id); return `${Number(q.id.slice(5))}月分の受付 ${u}／${q.n}件（残り ${Math.max(0, q.n - u)}件）`; }), open ? `出荷週の締めがまだ ${open}件` : ''].filter(Boolean).join('・'),
  });

  /* お知らせ：配信を予約している（公開開始が先）お知らせ */
  const booked = repo.list<Announcement>('dm.notice.announcements').filter((a) => a.publishFrom > t).length;
  add({ tone: 'info', area: 'お知らせ', text: `配信予約 ${booked}件`, href: '/ops/notices', n: booked });

  /* お問い合わせ：まだ開いていない（HubSpot 送信） */
  const iq = (notice.queries.inquiryNew(repo) as { count: number }).count;
  add({ tone: 'warn', area: 'お問い合わせ', text: `新しいお問い合わせ ${iq}件（HubSpot 送信）`, href: '/ops/inquiries', n: iq });
  return out;
}

const addMonthYm = (ym: string) => { const [y, m] = ym.split('-').map(Number); return m === 12 ? `${y + 1}-01` : `${y}-${String(m + 1).padStart(2, '0')}`; };

/** 棚卸・実績精算の締め（毎月20日。今日が21日以降なら翌月の20日） */
const stockClose = (t: string) => {
  const d = parseDate(t);
  const m = d.getDate() > 20 ? new Date(d.getFullYear(), d.getMonth() + 1, 20, 12) : new Date(d.getFullYear(), d.getMonth(), 20, 12);
  return `${m.getFullYear()}/${String(m.getMonth() + 1).padStart(2, '0')}/20`;
};

export type TopDay = { date: string; slot: string; cycle: string; ev: { t: string; tone: 'ng' | 'warn' | 'info' | '' }[] };
export type TopSchedule = { title: string; from: string; to: string; prev: string; next: string; days: TopDay[] };

const mondayOf = (s: string) => addDays(s, -((parseDate(s).getDay() + 6) % 7));
const ymOfDate = (s: string) => s.slice(0, 7).replace('/', '-');

/**
 * スケジュール（REQ-UI-002）。表示は1ヶ月だけ（月曜始まりの週で並べる。4週間の ES サイクル表示はなくした・2026-10-05 hong）。
 * at＝表示する月の中の日（省く＝今日）。prev／next＝前後の月の at。
 * 表示する項目（固定）：サイクルの枠（A1・A2…）、サイクル開始、オーダー締切、メニュー公開・自動公開、出荷（件数）、資材便、棚卸・実績精算の締め、請求の確定の開始
 */
export function topSchedule(repo: DocRepo, a?: { at?: string }): TopSchedule {
  const at = a?.at || today();
  const cycles = repo.list<Cycle>('dm.delivery.cycles').sort((x, y) => x.a1.localeCompare(y.a1));
  const d = parseDate(at), first = new Date(d.getFullYear(), d.getMonth(), 1, 12), last = new Date(d.getFullYear(), d.getMonth() + 1, 0, 12);
  const f = `${first.getFullYear()}/${String(first.getMonth() + 1).padStart(2, '0')}/01`;
  const l = `${last.getFullYear()}/${String(last.getMonth() + 1).padStart(2, '0')}/${String(last.getDate()).padStart(2, '0')}`;
  const from = mondayOf(f), to = addDays(mondayOf(l), 6), title = fmtYm(ymOfDate(f)), prev = addDays(f, -1), next = addDays(l, 1);

  const evs = new Map<string, TopDay['ev']>();
  const push = (date: string, t: string, tone: TopDay['ev'][number]['tone'] = '') => { if (date >= from && date <= to) evs.set(date, [...(evs.get(date) ?? []), { t, tone }]); };
  for (const c of cycles) {
    push(c.a1, `${fmtYm(c.id)} サイクル開始`, 'info');
    if (c.orderCloseOn) push(c.orderCloseOn, `オーダー締切（${fmtYm(c.id)}）`, 'warn');
  }
  for (const m of repo.list<MonthlyMenu>('dm.order.menus')) {
    if (m.publishOn) push(m.publishOn, `メニュー公開（${fmtYm(m.id)}）`, 'info');
    if (m.autoPublishOn && m.autoPublishOn !== m.publishOn) push(m.autoPublishOn, `メニュー自動公開（${fmtYm(m.id)}）`, 'info');
  }
  const ship = new Map<string, number>(), mat = new Map<string, number>();
  for (const d of repo.list<Delivery>('dm.delivery.deliveries')) {
    if (d.parentId || ['取消', '中止'].includes(d.status) || d.shipOn < from || d.shipOn > to) continue;
    const m = d.temp === '資材' ? mat : ship;
    m.set(d.shipOn, (m.get(d.shipOn) ?? 0) + 1);
  }
  for (const [d, n] of ship) push(d, `出荷 ${n}件`);
  for (const [d, n] of mat) push(d, `資材便 ${n}件`);
  /* 毎月の締め（20日）と請求の確定（21日から。25日に自動では確定しない・2026/10/03 決定） */
  for (let d = from; d <= to; d = addDays(d, 1)) {
    const day = parseDate(d).getDate();
    if (day === 20) push(d, '棚卸・実績精算の締め', 'warn');
    if (day === 21) push(d, '請求の確定（この日から）', 'warn');
  }

  const days: TopDay[] = [];
  for (let d = from; d <= to; d = addDays(d, 1)) {
    const s = slotOf(cycles, d);
    days.push({ date: d, slot: s?.slot ?? '', cycle: s?.cycle.id ?? '', ev: evs.get(d) ?? [] });
  }
  return { title, from, to, prev, next, days };
}
