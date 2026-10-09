import type { DocRepo } from '@/lib/ops/core/area';
import { isYamato, isYamatoNo, trackingDigits } from './tracking';
import type { Announcement, Carrier, Delivery, Inquiry, Invoice, Tracking } from './types';

/*
 * check.run の続き：外部とのつながり（課題 0-2・5-4・HubSpot Phase 2）のデータ。
 *   Bill One の送付の状態（dm.billing.invoices の send）・送り状番号（dm.delivery.tracking。ヤマトは12桁）・
 *   メールだけのお知らせ（dm.notice.announcements）・HubSpot へ送ったお問い合わせ（dm.notice.inquiries）
 */

export const INTEGRATION_COUNT_KINDS = ['dm.delivery.tracking', 'dm.notice.announcements', 'dm.notice.inquiries'];

const SEND_ST = ['送付待ち', '送付済', '開封済', 'エラー'];
const SEND_NEXT: Record<string, string[]> = { 送付待ち: ['送付済', 'エラー'], 送付済: ['開封済', 'エラー'], 開封済: [], エラー: ['送付待ち'] };

export function integrationProblems(r: DocRepo): string[] {
  const p: string[] = [];
  const has = (kind: string, id: string) => !!id && !!r.get(kind, id);
  const need = (cond: boolean, msg: string) => { if (!cond) p.push(msg); };

  /* ---------- Bill One の送付（状態は記録の最後と同じ・記録は時刻の順・進み方の順） ---------- */
  for (const inv of r.list<Invoice>('dm.billing.invoices')) {
    const s = inv.send;
    if (!s) continue;
    need(s.method === 'Bill One' && SEND_ST.includes(s.status), `請求書 ${inv.id} の送付の状態 ${s.status} が違う`);
    need(s.log.length > 0 && s.log[s.log.length - 1].status === s.status, `請求書 ${inv.id} の送付の状態が記録の最後と合わない`);
    need(s.log[0]?.status === '送付待ち', `請求書 ${inv.id} の送付の記録が送付待ちから始まらない`);
    s.log.forEach((x, i) => {
      if (!i) return;
      need(s.log[i - 1].at <= x.at, `請求書 ${inv.id} の送付の記録の時刻の順が違う`);
      need(SEND_NEXT[s.log[i - 1].status]?.includes(x.status), `請求書 ${inv.id} の送付が ${s.log[i - 1].status} → ${x.status} と進んでいる`);
    });
    need(!s.log.length || s.log[0].at.slice(0, 10) >= inv.issuedOn, `請求書 ${inv.id} の送付が発行日より前`);
  }

  /* ---------- 送り状番号（路線便。ヤマトは12桁の数字・有効な番号は重ならない） ---------- */
  const seen = new Map<string, string>();
  for (const t of r.list<Tracking>('dm.delivery.tracking')) {
    const c = r.get<Carrier>('dm.master.carriers', t.carrierId);
    const d = r.get<Delivery>('dm.delivery.deliveries', t.deliveryId);
    need(!!c, `送り状 ${t.trackingNo} の運送会社 ${t.carrierId} がない`);
    if (t.status !== 'active') continue;
    if (c && isYamato(c)) need(isYamatoNo(t.trackingNo), `送り状 ${t.trackingNo}（ヤマト）が12桁の数字でない`);
    if (d) need(d.regime === 'parcel_carrier', `送り状 ${t.trackingNo} の配送 ${d.id} が路線便でない`);
    const k = trackingDigits(t.trackingNo);
    need(!seen.has(k), `送り状番号 ${t.trackingNo} が ${seen.get(k)} と ${t.deliveryId} で重なっている`);
    seen.set(k, t.deliveryId);
    need(t.boxNo >= 1 && t.boxNo <= t.boxTotal, `送り状 ${t.id} の箱の番号が違う`);
  }

  /* ---------- お知らせ（出すサイトがないときはメールで送る＝課題 5-4） ---------- */
  for (const a of r.list<Announcement>('dm.notice.announcements')) {
    need(a.sites.length > 0 || !!a.mail, `お知らせ ${a.id} は出すサイトもメールもない`);
    if (a.mail) need(a.mail.to.length > 0 && /^\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}$/.test(a.mail.sendAt), `お知らせ ${a.id} のメールの宛先・送る日時がない`);
    if (a.mail && a.sendLog) need(a.sendLog.some((x) => x.kind === 'メール送信予約'), `お知らせ ${a.id} にメールの送信の記録がない`);
    if (a.sendLog) need(a.sendLog.every((x, i) => !i || a.sendLog![i - 1].at <= x.at), `お知らせ ${a.id} の送信の記録の時刻の順が違う`);
  }

  /* ---------- お問い合わせ（HubSpot） ---------- */
  const iqs = r.list<Inquiry>('dm.notice.inquiries');
  for (const q of iqs) {
    need(/^IQ-\d{6}-\d{4}$/.test(q.id) && q.id.slice(3, 9) === q.at.slice(2, 10).replace(/\//g, ''), `お問い合わせ ${q.id} の ID の形・日付が違う`);
    need(has('dm.org.corps', q.corpId), `お問い合わせ ${q.id} の法人 ${q.corpId} がない`);
    if (q.branchId) need(r.get<{ corpId: string }>('dm.org.branches', q.branchId)?.corpId === q.corpId, `お問い合わせ ${q.id} の拠点 ${q.branchId} が法人 ${q.corpId} の拠点でない`);
    need(!!q.subject && !!q.body && q.email.includes('@'), `お問い合わせ ${q.id} の件名・内容・メールアドレスがない`);
    need(q.status !== '送信済（HubSpot）' || !!q.hubspotId, `お問い合わせ ${q.id} は送信済なのに HubSpot の番号がない`);
  }
  need(new Set(iqs.map((q) => q.hubspotId).filter(Boolean)).size === iqs.filter((q) => q.hubspotId).length, 'HubSpot の番号が重なっている');
  return p;
}
