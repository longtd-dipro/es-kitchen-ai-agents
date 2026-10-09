import type { DocRepo } from '@/lib/ops/core/area';
import { today } from '@/lib/supplier/dates';
import domainDelivery from '@/lib/domain/areas/delivery';
import notice from '@/lib/domain/areas/notice';
import { shortLabel } from '@/lib/domain/product';
import { altIdOf, altLabel } from '@/lib/domain/alt';
import { DELIVERED, deliveryBranchName, shownName } from '@/lib/domain/snapshot';
import type {
  Account, Address, Announcement, AuditLog, Carrier, Cooler as DCooler, Delivery, DeliveryLine, DeliveryReport, Driver, Leg, ParkingReport, Product,
  Quote as DQuote, TempType, Tracking, Trouble, TroubleType,
} from '@/lib/domain/types';
import { trackingUrlOf } from '@/lib/domain/tracking';
import { jaDate } from './logic';
import type {
  CarrierTrouble, Cooler, DeliveryStatus, DeliveryView, Food, HistRow, NewsBody, NewsItem, PartInfo, Quote, QuoteAnswer, Staff, StaffExt, Temp,
} from './types';
import { fmtDate, fmtDateTime, fmtYm } from '@/lib/format/date';

/*
 * 共通データ（lib/domain・dm.*）から、委託配送先Web の画面の形（配送・トラブル・配送スタッフ・保冷バッグ・見積・お知らせ）を作る。
 * 委託配送先には自社の区間を含む配送だけを見せる（delivery.forCarrier と同じ範囲）。運営のメモは見せない。
 */

/** 委託配送先だけが持つ値（雇用形態・削除）。共通データのドライバーにないため carrier.staff に持つ */
export const STAFF_EXT = 'carrier.staff';

const iso = (d: string) => d.replace(/\//g, '-');
const addrText = (a: Address) => `${a.pref}${a.city}${a.addr1}`;
/** 'YYYY/MM/DD HH:mm' → 表示の 'YYYY-MM-DD HH:mm' */
const jaStamp = (s: string) => fmtDateTime(s);

export const carrierOf = (r: DocRepo, id: string) => r.get<Carrier>('dm.master.carriers', id);
export const carrierName = (r: DocRepo, id: string) => carrierOf(r, id)?.name ?? id;

/* ---------- 配送 ---------- */

const TEMP: Record<TempType, Temp> = { 冷凍: 'f', 冷蔵: 'r', 常温: 'r', 資材: 'm' };
const ST: Partial<Record<Delivery['status'], DeliveryStatus>> = { 再配達待: '再配達待' };
const stOf = (s: Delivery['status']) => ST[s] ?? (s as DeliveryStatus);

/** 担当区間の言い方 */
const legLabel = (l: Leg) => (l.legNo === 2 ? '2次（中継 → 拠点）' : l.isFinal ? '1次（＝最終区間）' : '1次（倉庫 → 中継）');

/** 集金額（最終区間だけ。報告が終わっていれば集めた額、まだなら予定額） */
function cashOf(r: DocRepo, l: Leg) {
  const rep = l.isFinal ? r.get<DeliveryReport>('dm.report.deliveryReports', l.deliveryId) : undefined;
  if (!rep?.cash) return 0;
  return Math.max(0, rep.status === '完了' ? rep.cash.collectedYen : rep.cash.expectedYen);
}
/** 駐車料金（その区間のドライバーの報告。否認は数えない） */
const parkOf = (r: DocRepo, l: Leg) =>
  r.list<ParkingReport>('dm.report.parking').filter((p) => p.deliveryId === l.deliveryId && p.driverId === l.driverId).reduce((s, p) => s + p.feeYen, 0);

/** 自社の区間（運ぶ区間ごとに1行。同じ配送の2区間を運ぶときは no を区間ID にする） */
export function deliveryViews(r: DocRepo, company: string): DeliveryView[] {
  const rows = domainDelivery.queries.forCarrier(r, { carrierId: company });
  const n = new Map<string, number>();
  rows.forEach((v) => n.set(v.delivery.id, (n.get(v.delivery.id) ?? 0) + 1));
  return rows.map(({ leg: l, delivery: d, troubles }) => {
    const open = troubles.filter((t) => !t.resolution);
    const kinds = [...new Set(open.map((t) => troubleKind(r, t)))];
    const trs = r.list<Tracking>('dm.delivery.tracking').filter((t) => t.deliveryId === d.id && t.status === 'active');
    const tracking = trs.length;
    /* 路線便の送り状（ヤマトなど）は番号と追跡ページを出す（ES採番の番号は出さない） */
    const track = trs.map((t) => ({ t, c: r.get<Carrier>('dm.master.carriers', t.carrierId) })).filter((x) => x.c?.kind === '路線')
      .map(({ t, c }) => ({ no: t.trackingNo, carrier: c!.name, url: trackingUrlOf(c, t.trackingNo) }));
    return {
      no: (n.get(d.id) ?? 0) > 1 ? l.id : d.id, legId: l.id, deliveryId: d.id, company,
      date: iso(d.deliverOn), ship: iso(d.shipOn), shipped: d.shippedOn ? iso(d.shippedOn) : undefined, temp: TEMP[d.temp], from: l.from.id, leg: legLabel(l),
      to: DELIVERED.includes(d.status) ? deliveryBranchName(r, d as Delivery) : d.destination.name, addr: addrText(d.destination.address), staff: l.driverId || null, st: stOf(d.status), kbn: d.serviceForm,
      boxes: Math.max(1, tracking), cash: cashOf(r, l), park: parkOf(r, l), parkFile: r.list<ParkingReport>('dm.report.parking').filter((p) => p.deliveryId === l.deliveryId && p.driverId === l.driverId).map((p) => p.receiptFile).join('・') || undefined, relay: l.from.type === 'relay' || undefined,
      doneAt: d.deliveredAt ? d.deliveredAt.slice(11) : undefined,
      trouble: open.length ? `対応中 ${open.length}件（${kinds.join('／')}）` : undefined, linked: true,
      /* 代替品設定（明細の代替品・除外・回収／廃棄の指示は delivery.forCarrier の lines・excluded・instructions） */
      alt: altIdOf(r, d as Delivery) || undefined,
      track: track.length ? track : undefined,
    };
  });
}

/** 実績の商品（明細・配送の報告の在庫と廃棄） */
export function foodsOf(r: DocRepo, deliveryId: string): Food[] {
  const rep = r.get<DeliveryReport>('dm.report.deliveryReports', deliveryId);
  return r.list<DeliveryLine>('dm.delivery.lines').filter((l) => l.deliveryId === deliveryId).map((l) => {
    const p = r.get<Product>('dm.master.products', l.productId);
    const st = rep?.stock.find((x) => x.productId === l.productId);
    const name = shownName(l.productName, p?.name ?? l.productId) + (l.kind ? `（${altLabel(l, (x) => r.get<Product>('dm.master.products', x)?.name ?? x)}）` : '');
    return [l.productId, name, p?.category ?? '', st?.disposed ?? 0, (p && shortLabel(p)) || '—', st?.remaining ?? 0, st?.remaining ?? 0, l.plannedQty, l.deliveredQty ?? l.plannedQty];
  });
}

/* ---------- トラブル ---------- */

const RESOLUTION: Record<Exclude<Trouble['resolution'], ''>, string> = {
  full: '全数を納品して解決', partial: '一部納品で解決（不足は再配送）', partial_no_resend: '一部納品で解決（不足は再配送なし）',
  redelivery: '再配送で解決', same_day_revisit: '当日の再訪問で解決', stop: '配送を中止して解決',
};
const troubleKind = (r: DocRepo, t: Trouble) => r.get<TroubleType>('dm.master.troubleTypes', t.typeId)?.name ?? t.typeId;

/** 一部納品の内訳（理由＝数量相違の報告、再配送＝子の配送・解決の仕方） */
export function partOf(r: DocRepo, d: Delivery): PartInfo | null {
  if (d.status !== '一部納品済') return null;
  const ts = r.list<Trouble>('dm.delivery.troubles').filter((t) => t.deliveryId === d.id);
  const child = r.list<Delivery>('dm.delivery.deliveries').find((x) => x.parentId === d.id);
  const res = ts.find((t) => t.resolution)?.resolution;
  return {
    why: ts.map((t) => t.note).filter(Boolean).join('／') || '数量の相違',
    resend: child ? `あり（${child.id}・${fmtDate(child.deliverOn)} 納品）` : res ? RESOLUTION[res] : '運営（ESキッチン）が決めます',
  };
}

/** 自社の区間を含む配送のトラブル */
export function troubleViews(r: DocRepo, company: string, views = deliveryViews(r, company)): CarrierTrouble[] {
  const legOf = new Map(views.map((v) => [v.deliveryId!, v]));
  return r.list<Trouble>('dm.delivery.troubles').filter((t) => legOf.has(t.deliveryId)).map((t) => {
    const v = legOf.get(t.deliveryId)!;
    const child = t.childDeliveryId ? `。送り直し用の配送 ${t.childDeliveryId}（確認中）は運営が作成済みです` : '';
    return {
      id: t.id, company, at: iso(t.reportedAt), no: v.no, scene: '配達時', kind: troubleKind(r, t), note: t.note,
      staff: t.reportedBy.site === 'driver' ? t.reportedBy.accountId : v.staff ?? '', photo: 0, auto: t.note.includes('自動') || undefined,
      st: t.resolution ? '解決済' : '対応中', resAt: t.resolvedAt ? iso(t.resolvedAt) : undefined,
      res: t.resolution ? RESOLUTION[t.resolution] : `運営（ESキッチン）が対応を決めます${child}`,
    };
  });
}

/* ---------- 配送スタッフ ---------- */

const ISSUED: Account['status'][] = ['発行済（ログイン前）', '有効', '参照のみ', '無効', '利用停止'];

/** 配送スタッフ（共通データのドライバー ＋ ドライバーのアカウント ＋ 雇用形態・削除） */
export function staffList(r: DocRepo, company: string): Staff[] {
  return r.list<Driver>('dm.master.drivers').filter((d) => d.carrierId === company).map((d) => {
    const acc = r.get<Account>('dm.account.accounts', d.id);
    const ext = r.get<StaffExt>(STAFF_EXT, d.id);
    return {
      /* 運営が削除した（削除済）スタッフは、委託配送先Web では削除したスタッフと同じに見せる */
      id: d.id, name: d.name, kana: d.kana, kbn: ext?.kbn ?? '社員', tel: d.tel, st: d.status === '削除済' ? '無効' : d.status,
      acct: acc && ISSUED.includes(acc.status) ? '発行済' : '未発行', email: d.email, lic: d.status === '免許未登録' ? 0 : 1,
      last: jaStamp(acc?.lastLoginAt ?? '') || '—', del: d.status === '削除済' || ext?.del, inMaster: true,
    };
  });
}

/** 変更履歴（操作の記録 dm.account.audit のそのドライバーの分。新しい順） */
export const staffHist = (r: DocRepo, id: string): HistRow[] =>
  r.list<AuditLog>('dm.account.audit').filter((x) => x.target === id).reverse()
    .map((x) => [x.at, x.detail ? `${x.action}（${x.detail}）` : x.action, r.get<Account>('dm.account.accounts', x.accountId)?.name ?? x.accountId]);

/** 保冷バッグの台帳（自社の分） */
export const coolersOf = (r: DocRepo, company: string): Cooler[] =>
  r.list<DCooler>('dm.carrier.coolers').filter((c) => c.carrierId === company).map((c) => ({
    no: c.id, kind: c.kind, qty: c.qty, staff: `${c.driverId} ${r.get<Driver>('dm.master.drivers', c.driverId)?.name ?? ''}`.trim(),
    date: c.issuedOn, status: c.status, memo: c.memo,
  }));

/* ---------- 見積 ---------- */

/** 自社の回答の状態 → 画面の状態（回答待ちで期限が過ぎた・ほかで決まった＝期限切れ） */
function quoteSt(q: DQuote, row: DQuote['responses'][number]): Quote['st'] {
  if (row.status === '回答済') return '回答済';
  if (row.status === '辞退') return '対応不可';
  return q.status !== '依頼中' || q.answerBy < today() ? '期限切れ' : '未回答';
}

/** 自社の回答（まだのときは受信の履歴だけ） */
function answerOf(q: DQuote, row: DQuote['responses'][number], st: Quote['st'], comp: string): QuoteAnswer {
  const hist: HistRow[] = [[q.requestedAt, '見積依頼を受信', 'ESキッチン']];
  const at = row.answeredAt;
  if (row.status === '回答済') {
    return {
      type: 'ok', rows: [['1件あたりの配送料', row.feeYen]], start: row.startCycle ? `${fmtYm(row.startCycle)} サイクルから` : '—',
      comment: [row.note, row.weekdays && `対応できる曜日：${row.weekdays}`].filter(Boolean).join('　'), date: jaDate(at.slice(0, 10)), at,
      hist: [...hist, [at, '承認回答を送信', comp]],
    };
  }
  if (row.status === '辞退') return { type: 'ng', reason: row.note.split('：')[0] || 'その他', comment: row.note, date: jaDate(at.slice(0, 10)), at, hist: [...hist, [at, 'NG回答を送信', comp]] };
  if (st === '期限切れ') return { type: 'expired', dueAt: `${q.answerBy} 23:59`, hist: [...hist, [`${q.answerBy} 23:59`, '回答しないまま回答期限が過ぎました', 'ESキッチン']] };
  return { type: 'ok', rows: [], hist };
}

/** 自社に来た見積（新しい順） */
export function quoteViews(r: DocRepo, company: string): Quote[] {
  const comp = carrierName(r, company);
  return r.list<DQuote>('dm.carrier.quotes').flatMap((q) => {
    const row = q.responses.find((x) => x.carrierId === company);
    if (!row) return [];
    const st = quoteSt(q, row), area = `${q.address.pref}${q.address.city}`;
    return [{
      id: q.id, company, t: `【ESキッチン】${(q.temps ?? [q.temp]).join('・')}_${area}_見積依頼`, corp: q.corpName ? `${q.corpName}（${q.branchName}）` : q.branchName, kind: '新規見積' as const, ship: 'ES配送便',
      due: q.answerBy, st, recv: q.requestedAt.slice(0, 10),
      req: {
        pick: '—', area, goods: (q.temps ?? [q.temp]).join('・'), vend: q.vending === undefined ? '—' : q.vending ? 'あり' : 'なし',
        plan: `${q.planName ? `${q.planName}・` : ''}月${q.deliveriesPerMonth}回・1回 ${q.mealsPerDelivery}食`, course: '—',
        addr: `${q.address.zip ? `〒${q.address.zip} ` : ''}${q.address.pref}${q.address.city}${q.address.addr1}` || '—', weekend: q.weekend === undefined ? '—' : q.weekend ? '要（土日も配送）' : '不要',
        priceCond: q.priceCond || '—', moreSites: (q.moreSites ?? []).map((x) => `${x.name}${x.address ? `（${x.address}）` : ''}`).join('\n') || '—',
        ship: 'ES配送便', cycle: `月${q.deliveriesPerMonth}回（希望：${q.wishWeekdays || '—'}）`, start: '—', dueJ: jaDate(q.answerBy),
        note: `${q.applicationId ? `申込 ${q.applicationId} の拠点` : '商談中の拠点'}の配送です。1件あたりの配送料と、対応できる曜日・開始できるサイクルをご回答ください。`,
      },
      answer: row.status === '回答待ち' && st === '未回答' ? undefined : answerOf(q, row, st, comp),
    }];
  }).sort((x, y) => y.recv.localeCompare(x.recv));
}
/** 回答の画面に出す回答（まだのときは受信の履歴だけの空の回答） */
export function answerFor(q: Quote): QuoteAnswer {
  return q.answer ?? { type: 'ok', rows: [], hist: [[`${q.recv} 00:00`, '見積依頼を受信', 'ESキッチン']] };
}

/* ---------- お知らせ ---------- */

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);
const announcements = (r: DocRepo) => notice.queries.announcements(r, { site: 'carrier' }) as Announcement[];

/** ホームのお知らせ（委託配送先向け・公開中・新しい順） */
export const newsItems = (r: DocRepo): NewsItem[] =>
  announcements(r).map((a) => ({ id: Number(a.id), when: a.publishFrom === today() ? '今日' : a.publishFrom, cat: a.important ? '重要' : a.category, t: a.title }));

/** お知らせの本文（段落・添付） */
export function newsBody(r: DocRepo, id: number): { item: NewsItem; body: NewsBody } | null {
  const a = announcements(r).find((x) => Number(x.id) === id) ?? announcements(r)[0];
  if (!a) return null;
  const files = a.files.length ? `<h3>■ 添付</h3><ul>${a.files.map((f) => `<li>${esc(f)}</li>`).join('')}</ul>` : '';
  return {
    item: newsItems(r).find((n) => n.id === Number(a.id))!,
    body: { at: jaDate(a.publishFrom), body: a.body.split('\n').filter(Boolean).map((p) => `<p>${esc(p)}</p>`).join('') + files },
  };
}
