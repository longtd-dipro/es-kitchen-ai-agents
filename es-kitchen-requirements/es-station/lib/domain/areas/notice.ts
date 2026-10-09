import { ApiError } from '@/lib/api/errors';
import { defineArea, toDocs, type DocRepo } from '@/lib/ops/core/area';
import { nowStamp, today } from '@/lib/supplier/dates';
import { ANNOUNCEMENTS, INQUIRIES, NOTIFICATIONS, TEMPLATES } from '../seed/notice';
import { importantMail, noticeMailSubject } from '../mails';
import type { Account, Announcement, Inquiry, MailTemplate, Notification, Site } from '../types';
import { notify } from '../notify';

/**
 * 新しいお問い合わせを運営へメールで知らせる先。設定画面（お問い合わせ通知先メール）はなくした（hong 2026-10-07）ので、
 * サーバーの環境変数 INQUIRY_NOTIFY_MAIL で決める（空＝送らない。いままでの既定と同じ）
 */
const inquiryNotifyMail = () => (process.env.INQUIRY_NOTIFY_MAIL ?? '').trim();

/*
 * お知らせ・通知（area: notice）。kind：dm.notice.announcements／notifications／templates
 *   お知らせ：運営・システム管理が出す（サイトごと・期間つき）
 *   通知：操作のたびに作る（lib/domain/notify.ts）。各サイトのベル・メール
 *   メールの文面：システム管理が直す
 *   お問い合わせ（dm.notice.inquiries）：法人Web から HubSpot へ送ったもの（Phase 2。デモは送ったことにして記録だけ）
 */

/** 出した通知（予約 scheduledAt のものはまだ出さない） */
const notes = (r: DocRepo) => r.list<Notification>('dm.notice.notifications').filter((n) => !n.scheduledAt);
/** そのアカウントあての通知か（アカウントあて・サイト全体・役割あて） */
const forAccount = (n: Notification, a: Account) =>
  n.to.site === a.site && (n.to.accountId === a.id || (!n.to.accountId && (!n.to.role || a.roleIds.includes(n.to.role))));

/**
 * 重要なお知らせのメール（旧システムの「重要お知らせ」）：メールの設定がなければ、公開開始日の 8:00 に自動で送る（過ぎていればすぐ。法人あては土日祝なら前の営業日）。
 * 送ったあと・公開開始日が同じなら送る日時を変えない。重要でなくなったら自動のメールは外す
 */
function autoMail(r: DocRepo, a: Omit<Announcement, 'id'> & { id?: string }): Announcement['mail'] {
  if (a.mail && !a.mail.auto) return a.mail;
  if (!a.important || !a.sites.length) return undefined;
  const cur = a.id ? r.get<Announcement>('dm.notice.announcements', a.id) : undefined;
  if (cur?.mail?.auto && (cur.sendLog?.some((x) => x.kind === 'メール送信') || (cur.publishFrom === a.publishFrom && cur.title === a.title && cur.sites.join() === a.sites.join()))) return cur.mail;
  return importantMail(r, a);
}


/** HubSpot に送れなかったときに法人Web へ出す文言（台帳 F 2026-10-05） */
export const INQUIRY_SEND_FAILED = '送信できませんでした。時間をおいてもう一度お試しください。';

/**
 * お問い合わせを HubSpot へ送る（Phase 2 の本番接続までは、送ったことにして受付番号を作る）。
 * 送れなかったときは ApiError（INQUIRY_SEND_FAILED・503）を投げ、呼び出し側は ES に保存しない
 */
function sendToHubspot(_r: DocRepo, a: { id: string }): string {
  /* 本番接続：ここで HubSpot の API を呼び、失敗したら throw new ApiError(INQUIRY_SEND_FAILED, 503) */
  return `HS-${a.id.slice(3).replace('-', '')}`;
}

export default defineArea({
  name: 'notice',
  seed: () => ({ 'dm.notice.announcements': toDocs(ANNOUNCEMENTS), 'dm.notice.notifications': toDocs(NOTIFICATIONS), 'dm.notice.templates': toDocs(TEMPLATES), 'dm.notice.inquiries': toDocs(INQUIRIES) }),
  queries: {
    /** サイトのお知らせ（公開中だけ。all＝期間外も） */
    announcements: (r, a: { site: Site; all?: boolean }) =>
      r.list<Announcement>('dm.notice.announcements').filter((x) => x.sites.includes(a.site) && (a.all || (x.publishFrom <= today() && (!x.publishTo || today() <= x.publishTo))))
        .sort((x, y) => y.publishFrom.localeCompare(x.publishFrom)),
    /** アカウントの通知（新しい順）と未読の数 */
    inbox(r, { accountId }: { accountId: string }) {
      const a = r.get<Account>('dm.account.accounts', accountId);
      if (!a) throw new ApiError('アカウントが見つかりません', 404);
      const list = notes(r).filter((n) => forAccount(n, a)).sort((x, y) => y.at.localeCompare(x.at));
      return { unread: list.filter((n) => !n.readAt).length, list };
    },
    /** アプリの利用者あての通知（拠点ごと。お食事が届いた など） */
    forApp: (r, { branchId }: { branchId: string }) =>
      notes(r).filter((n) => n.to.site === 'app' && n.to.accountId === branchId).sort((x, y) => y.at.localeCompare(x.at)),
    /** システム管理・運営：通知の一覧 */
    list: (r, a?: { site?: Site; templateId?: string }) => notes(r).filter((n) => (!a?.site || n.to.site === a.site) && (!a?.templateId || n.templateId === a.templateId)).reverse(),
    templates: (r) => r.list<MailTemplate>('dm.notice.templates'),
    /** システム管理・運営：お知らせのすべて（メールだけのお知らせ・期間外も。新しい番号が先）と送信の記録 */
    adminList: (r) => r.list<Announcement>('dm.notice.announcements').slice().sort((x, y) => Number(y.id) - Number(x.id))
      .map((a) => ({ ...a, mailOnly: !a.sites.length && !!a.mail, sendLog: a.sendLog ?? [] })),
    /** システム管理：HubSpot へ送ったお問い合わせ（新しい順。corpId で絞れる） */
    /** 運営の TOP：新しい（まだ開いていない）お問い合わせの数 */
    inquiryNew: (r) => ({ count: r.list<Inquiry>('dm.notice.inquiries').filter((x) => !x.readAt).length }),
    /** お問い合わせ詳細（運営の詳細の画面：hong 2026-10-05 I4＝B）。法人名・拠点名も付ける */
    inquiry: (r, a: { id: string }) => {
      const x = r.get<Inquiry>('dm.notice.inquiries', a.id);
      if (!x) return null;
      const corpName = r.get<{ name: string }>('dm.org.corps', x.corpId)?.name ?? '';
      const branchName = x.branchId ? r.get<{ name: string }>('dm.org.branches', x.branchId)?.name ?? '' : '';
      return { ...x, corpName, branchName };
    },
    inquiries: (r, a?: { corpId?: string }) => r.list<Inquiry>('dm.notice.inquiries').filter((x) => !a?.corpId || x.corpId === a.corpId).sort((x, y) => y.at.localeCompare(x.at) || y.id.localeCompare(x.id)),
  },
  actions: {
    markRead(r, { ids, accountId }: { ids: string[]; accountId: string }) {
      const a = r.get<Account>('dm.account.accounts', accountId);
      if (!a) throw new ApiError('アカウントが見つかりません', 404);
      let n = 0;
      for (const id of ids) {
        const x = r.get<Notification>('dm.notice.notifications', id);
        if (x && forAccount(x, a) && !x.readAt) { r.put('dm.notice.notifications', id, { ...x, readAt: nowStamp() }); n++; }
      }
      return { read: n };
    },
    /** 運営・システム管理：お知らせの登録・更新（id がなければ新しい番号） */
    /* 課題 5-4：出すサイトがなくても、メールで送るお知らせ（mail）なら置ける（どのサイトにも出さない・送信の記録に残す） */
    saveAnnouncement(r, x: Omit<Announcement, 'id'> & { id?: string }) {
      const a = { ...x, mail: autoMail(r, x) };
      if (!a.title.trim()) throw new ApiError('タイトルを入れてください', 400);
      if (!a.sites.length && !a.mail) throw new ApiError('出すサイトを選ぶか、メールで送る設定にしてください', 400);
      if (a.mail && (!a.mail.to.length || !/^\d{4}\/\d{2}\/\d{2}/.test(a.mail.sendAt))) throw new ApiError('メールの宛先と送る日時を入れてください', 400);
      const cur = a.id ? r.get<Announcement>('dm.notice.announcements', a.id) : undefined;
      const id = a.id || String(Math.max(0, ...r.list<Announcement>('dm.notice.announcements').map((x) => Number(x.id))) + 1);
      const at = nowStamp();
      const where = a.sites.length ? a.sites.join('・') : 'サイトには出さない（メールのみ）';
      const log = [...(cur?.sendLog ?? a.sendLog ?? []), { at, kind: cur ? '更新' as const : '登録' as const, to: where, note: `公開 ${a.publishFrom}〜${a.publishTo || ''}` }];
      /* メールの宛先・日時・件名が変わったときだけ送信の予約を記録する（同じ内容で保存し直しても重ねない） */
      const mailKey = (m?: Announcement['mail']) => (m ? `${m.subject}|${m.sendAt}|${m.to.join(',')}` : '');
      if (a.mail && mailKey(a.mail) !== mailKey(cur?.mail)) log.push({ at, kind: 'メール送信予約', to: a.mail.to.join('・'), note: `${a.mail.sendAt} に送信（件名：${noticeMailSubject(a)}）` });
      const next: Announcement = { ...a, id, sendLog: log };
      r.put('dm.notice.announcements', id, next);
      return next;
    },
    /**
     * 法人Web：お問い合わせを HubSpot へ送る（Phase 2。デモは外部に送らず 送信済（HubSpot）として残す）。
     * 返事は HubSpot から（システムの通知は出さない）。システム管理の「お問い合わせ（HubSpot 送信）」に出る。
     * HubSpot に送れなかったら INQUIRY_SEND_FAILED を返し、ES には残さない（お客様が送り直す。台帳 F 2026-10-05）
     */
    sendInquiry(r, a: { corpId: string; branchId?: string; accountId: string; name: string; email: string; tel?: string; category: string; subject: string; body: string }) {
      const miss = [!a.name?.trim() && 'お名前', !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(a.email ?? '') && 'メールアドレス', !a.category && 'お問い合わせの種類', !a.subject?.trim() && '件名', !a.body?.trim() && '内容'].filter(Boolean);
      if (miss.length) throw new ApiError(`${miss.join('・')}を入れてください`, 400);
      if (a.body.length > 2000) throw new ApiError('内容は2000文字までです', 400);
      const at = nowStamp();
      const ymd = at.slice(2, 10).replace(/\//g, '');
      const n = r.list<Inquiry>('dm.notice.inquiries').filter((x) => x.id.startsWith(`IQ-${ymd}-`)).length + 1;
      const id = `IQ-${ymd}-${String(n).padStart(4, '0')}`;
      const hubspotId = sendToHubspot(r, { id, ...a });
      const next: Inquiry = {
        id, at, corpId: a.corpId, branchId: a.branchId ?? '', accountId: a.accountId, name: a.name.trim(), email: a.email.trim(), tel: a.tel?.trim() ?? '',
        category: a.category, subject: a.subject.trim(), body: a.body.trim(), status: '送信済（HubSpot）', hubspotId,
      };
      /* 通知先メール（環境変数 INQUIRY_NOTIFY_MAIL）があれば、運営へメールで知らせる（空なら送らない） */
      const to = inquiryNotifyMail();
      if (to) {
        notify(r, { to: { site: 'ops', accountId: '', role: `mail:${to}` }, channels: ['mail'], templateId: 'inquiry_new', title: `新しいお問い合わせ（${next.category}）：${next.subject}`, body: `${next.name}（${next.corpId}${next.branchId ? ` ／ ${next.branchId}` : ''}）\n受付番号 ${next.hubspotId}`, link: { type: '', id: '' } });
        next.mailedTo = to;
      }
      r.put('dm.notice.inquiries', id, next);
      return next;
    },
    /** 運営：お問い合わせを開いた（新しい件数から外す） */
    markInquiryRead(r, { id }: { id: string; by?: string }) {
      const x = r.get<Inquiry>('dm.notice.inquiries', id);
      if (!x) throw new ApiError('お問い合わせが見つかりません', 404);
      if (!x.readAt) r.put<Inquiry>('dm.notice.inquiries', id, { ...x, readAt: nowStamp() });
      return { ok: true };
    },
    /** システム管理：メールの文面の更新 */
    saveTemplate(r, a: { id: string; subject: string; body: string }) {
      const t = r.get<MailTemplate>('dm.notice.templates', a.id);
      if (!t) throw new ApiError('文面が見つかりません', 404);
      if (!a.subject.trim() || !a.body.trim()) throw new ApiError('件名と本文を入れてください', 400);
      const next = { ...t, subject: a.subject, body: a.body, updatedAt: nowStamp() };
      r.put('dm.notice.templates', a.id, next);
      return next;
    },
  },
});
