import type { DocRepo } from '@/lib/ops/core/area';
import { nowStamp } from '@/lib/supplier/dates';
import type { OpsOp, Order } from '@/lib/supplier/types';
import { customerOff, customerSendAt, notify, notifyOnce, partnerTo } from './notify';
import { TEMPLATES } from './seed/notice';
import { KICKOFF_URL } from './urls';
import type { Account, Announcement, Application, Carrier, Contact, Delivery, Leg, MailTemplate, Notification, Tracking } from './types';

/*
 * 旧システムのメールとの突き合わせ（2026/10/03 決定「旧システムのメールを足す」）と、足したメールの送り口。
 * 文面は seed/notice.ts の TEMPLATES。予定のお知らせ（日次バッチ）は lib/domain/customerNotices.ts。
 * お客様（法人・拠点・アプリの利用者）への予定のお知らせは、お客様の休み（土日・全社の祝日）なら前の営業日に送る（notify.ts の customerSendDay）。
 * すぐ送るお知らせ（パスワード再設定・申請の受付など）は前倒ししない。
 * お問い合わせの新着を運営へメールで送るのはしない（2026/10/03：迷惑メールになるため・お客様の確認待ち）
 */

/** 旧システムのメール → こちらの文面（templateId）と送るとき（check.run が文面があるか確かめる） */
export const OLD_MAILS: { old: string; templateId: string; to: string; when: string }[] = [
  { old: 'メニュー公開・オーダー開始', templateId: 'menu_published', to: '法人・拠点', when: '公開したとき（自動公開は自動公開日。土日祝なら前の営業日に公開）' },
  { old: 'オーダー開始', templateId: 'order_open', to: '法人・拠点', when: '受付開始日（公開より後のときだけ。土日祝なら前の営業日）・日次バッチ' },
  { old: 'オーダー入力されていません', templateId: 'order_reminder', to: '注文を入れていない拠点（と法人）', when: 'オーダー締切の7日前と3日前（土日祝なら前の営業日）・日次バッチ。法人Web の法人情報で法人ごとに切れる' },
  { old: '次月発送/納品予定日のお知らせ', templateId: 'delivery_schedule', to: '法人・拠点', when: '前月21日（土日祝なら前の営業日）・日次バッチ' },
  { old: 'オーダー登録通知', templateId: 'order_registered', to: '法人・拠点', when: '拠点・運営が商品注文を登録・更新したとき（すぐ）' },
  { old: '（新規）デフォルト注文で確定', templateId: 'order_default_fixed', to: '拠点のメイン担当者（メール）・法人Web のお知らせは拠点と法人のアカウント', when: 'オーダー締切でご注文がなく基準注文数で確定したとき（日次バッチ・サイクルと拠点ごとに1回・お試しも）' },
  { old: '（新規）お申し込みの受付完了 M1', templateId: 'apply_received', to: 'お申し込み者・メイン担当者（メールだけ・同じ人なら1通）', when: '新規のお申し込みを受け付けたとき（すぐ）。いまは文面を作るだけで送らない' },
  { old: '（新規）お申し込みの結果（却下） No.28', templateId: 'apply_rejected', to: 'お申し込み者・メイン担当者（メールだけ・同じ人なら1通）', when: '運営が新規のお申し込みを却下したとき（理由つき・すぐ。取り下げでは送らない）' },
  { old: '（新規）新しいご担当者へのご案内 M13', templateId: 'contact_manual', to: '新しく追加・変更されたご担当者（メールだけ）', when: 'ご担当者を追加・変更したとき（すぐ。削除では送らない）' },
  { old: '担当者変更フォロー', templateId: 'contact_changed', to: '法人・拠点（メイン担当者・請求担当者）', when: 'ご担当者の変更を反映したとき（すぐ）' },
  { old: '仮発注通知', templateId: 'kari_order', to: '仕入先', when: '仮発注を送ったとき（すぐ）' },
  { old: '発注確定通知', templateId: 'hon_order', to: '仕入先', when: '本発注を送ったとき（すぐ）' },
  { old: '配送依頼通知', templateId: 'delivery_request', to: '委託配送先', when: '同じ出荷日・同じ会社の送り状（路線便）／出荷指示（委託）がそろったとき（すぐ・配送のコピー＝子の配送は数えない）' },
  { old: '新規ES配送プラン追加のお知らせ', templateId: 'es_plan_added', to: '委託配送先', when: 'ES配送便の拠点を仮登録したとき（便の設定がまだなら本登録のとき）' },
  { old: '重要お知らせ', templateId: 'important_notice', to: 'お知らせの宛先', when: '公開開始日の 8:00（過ぎていればすぐ。法人あては土日祝なら前の営業日）' },
  { old: 'お食事が届きます（路線便）', templateId: 'meal_arrived', to: 'アプリの利用者', when: 'お届け日の 9:00（土日祝なら前の営業日）' },
  { old: 'アンケートのリマインド', templateId: 'survey_remind', to: 'アンケートの対象', when: '終了の N 日前（土日祝なら前の営業日）' },
];

const md = (d: string) => `${Number(d.slice(5, 7))}/${Number(d.slice(8, 10))}`;
const accountOf = (r: DocRepo, id: string) => r.get<Account>('dm.account.accounts', id);

/* ---------------- 仕入先：仮発注・本発注（すぐ） ---------------- */

/**
 * 運営の発注の書き換え（runOps）のあとに呼ぶ。create＝仮発注（資材は発注）、issueHon＝本発注（発注確定）。仕入先ごとに1通。
 * 発注方法＝外部 の仕入先にはメールを1通も送らない（回答・本発注の承認・出荷報告は運営の代理入力。台帳 I 2026-10-05）
 */
export function supplierOrderNotices(r: DocRepo, op: OpsOp, out: Order[]) {
  if (op.op !== 'create' && op.op !== 'issueHon') return 0;
  const hon = op.op === 'issueHon';
  const bySup = new Map<string, Order[]>();
  for (const o of out) bySup.set(o.sup, [...(bySup.get(o.sup) ?? []), o]);
  let sent = 0;
  for (const [sup, os] of bySup) {
    const rec = r.get<{ name?: string; method?: string }>('db.suppliers', sup);
    if (rec?.method === '外部') continue;
    const company = rec?.name ?? accountOf(r, sup)?.name ?? sup;
    const rows = os.map((o) => `・${o.no} ${o.name}：${hon ? o.hon : o.kari}${o.unit}${o.rows?.[0]?.wish ? `（入荷希望 ${o.rows.map((x) => x.wish).filter(Boolean).sort()[0]}〜）` : ''}`).join('\n');
    const kind = hon ? '発注確定（本発注）' : os.every((o) => o.type === '資材') ? '発注' : '仮発注';
    notify(r, {
      ...partnerTo(r, 'supplier', sup), templateId: hon ? 'hon_order' : 'kari_order', link: { type: '', id: '' },
      title: `${kind}のお知らせ（${os.length}件）`,
      body: `${company} 御中\n${hon ? '次の発注が確定しました。仕入先サイトの「本発注の承認待ち」で承認してください。' : '次の発注をお送りしました。仕入先サイトの「発注一覧」で納期をご回答ください。'}\n${rows}`,
    });
    sent += 1;
  }
  return sent;
}

/* ---------------- 委託配送先：配送依頼（すぐ） ---------------- */

const liveTrip = (d: Delivery) => !d.parentId && d.temp !== '資材' && !['取消', '中止'].includes(d.status);

/**
 * 配送依頼：同じ出荷日・同じ会社の配送（配送のコピー＝子の配送は数えない・出さない）の送り状（路線便）／出荷指示（委託）がそろったら、その会社へ1回。
 * ready＝その配送の送り状・出荷指示がそろったか（kind＝路線：有効な送り状があるか／委託・引き取り：運営の出荷指示の送信の記録。ES が送り状を採番する）
 */
export function deliveryRequestCheck(r: DocRepo, deliveryId: string, ready: (d: Delivery) => boolean, kind: Carrier['kind']) {
  const d = r.get<Delivery>('dm.delivery.deliveries', deliveryId);
  if (!d || !liveTrip(d)) return [];
  const legs = r.list<Leg>('dm.delivery.legs');
  const sent: string[] = [];
  for (const cid of new Set(legs.filter((l) => l.deliveryId === d.id).map((l) => l.carrierId))) {
    const c = r.get<Carrier>('dm.master.carriers', cid);
    if (!c || c.kind !== kind) continue;
    const mine = new Set(legs.filter((l) => l.carrierId === cid).map((l) => l.deliveryId));
    const group = r.list<Delivery>('dm.delivery.deliveries').filter((x) => x.shipOn === d.shipOn && liveTrip(x) && mine.has(x.id)).sort((a, b) => a.id.localeCompare(b.id));
    if (!group.every(ready)) continue;
    const n = notifyOnce(r, `delivery_request:${cid}:${d.shipOn}`, {
      ...partnerTo(r, 'carrier', cid), templateId: 'delivery_request', link: { type: 'delivery', id: group[0].id },
      title: `配送のご依頼（${md(d.shipOn)} 出荷・${group.length}件）`,
      body: `${c.name} ご担当者様\n${d.shipOn} 出荷の配送をご依頼します（送り状・出荷指示がそろいました）。\n${group.map((x) => `・${x.id} ${x.destination.name} ${x.temp} ${x.plannedQty}食（お届け ${x.deliverOn}）`).join('\n')}`,
    });
    if (n) sent.push(cid);
  }
  return sent;
}
/** 路線便：有効な送り状があるか */
export const hasTracking = (r: DocRepo) => {
  const ids = new Set(r.list<Tracking>('dm.delivery.tracking').filter((t) => t.status === 'active').map((t) => t.deliveryId));
  return (d: Delivery) => ids.has(d.id);
};

/* ---------------- 法人・拠点：ご担当者の変更（すぐ） ---------------- */

type Row = { kind: string; name: string; email: string };
/** ご担当者を変えたら、法人（拠点なら拠点と法人）へ。変更前・変更後のメイン担当者・請求担当者に届く（メールの宛先）。変わっていなければ出さない */
export function contactChangedNotice(r: DocRepo, owner: Contact['owner'], ownerName: string, before: Row[], after: Row[]) {
  const key = (x: Row) => `${x.kind}|${x.name}|${x.email}`;
  if (before.map(key).sort().join() === after.map(key).sort().join()) return 0;
  const kinds = [...new Set([...before, ...after].map((x) => x.kind))];
  const rows = kinds.map((k) => {
    const b = before.filter((x) => x.kind === k).map((x) => x.name).join('・') || '—', a = after.filter((x) => x.kind === k).map((x) => x.name).join('・') || '—';
    return b === a ? '' : `・${k}：${b} → ${a}`;
  }).filter(Boolean);
  const mails = [...new Set([...before, ...after].filter((x) => ['メイン担当者', '請求担当者'].includes(x.kind)).map((x) => x.email).filter(Boolean))];
  const corpId = owner.type === 'branch' ? r.get<{ corpId: string | null }>('dm.org.branches', owner.id)?.corpId ?? '' : owner.id;
  const ids = [...new Set([owner.type === 'branch' ? owner.id : '', corpId].filter((x) => x && accountOf(r, x)))];
  for (const id of ids) {
    notify(r, {
      to: { site: 'corp', accountId: id, role: '' }, templateId: 'contact_changed', link: { type: '', id: '' },
      title: `ご担当者の変更を受け付けました（${ownerName}）`,
      body: `${ownerName} のご担当者を次のとおり変更しました。\n${rows.join('\n') || '・連絡先（メールアドレス・電話番号）の変更'}\nこのお知らせはメイン担当者・請求担当者（変更前・変更後：${mails.join('、')}）にお送りしています。`,
    });
  }
  return ids.length;
}

/* ---------------- 法人・拠点：新しいご担当者へマニュアルのご案内 M13（すぐ） ---------------- */

/** マニュアル（動画＋資料）のリンク。お客様から受け取る（_OPEN一覧 1003-14）ので環境変数 NEXT_PUBLIC_CORP_MANUAL_URL で設定する */
const manualUrl = () => process.env.NEXT_PUBLIC_CORP_MANUAL_URL || '（準備中）';
/**
 * ご担当者が追加・変更されたら、新しいご担当者のメールアドレスへ M13（台帳「担当者の変更のメール」2026/10/03）。
 * すべての種類（メイン・請求・サブ）。メールアドレスだけ変えたときも送る（前に無かったアドレス＝新しいご担当者）。削除では送らない
 */
export function contactManualNotice(r: DocRepo, ownerName: string, before: Row[], after: Row[]) {
  const had = new Set(before.map((x) => x.email.trim().toLowerCase()));
  const news = [...new Map(after.filter((x) => x.email.trim() && !had.has(x.email.trim().toLowerCase())).map((x) => [x.email.trim().toLowerCase(), x])).values()];
  for (const x of news) {
    notify(r, {
      to: { site: 'corp', accountId: '', role: `mail:${x.email.trim()}` }, channels: ['mail'], templateId: 'contact_manual', link: { type: '', id: '' },
      title: '【ESステーション】ご担当者のご登録とご利用マニュアルのご案内',
      body: `${x.name} 様\n${ownerName} の${x.kind}としてご登録いただきました。\nご利用マニュアル（動画・資料）：${manualUrl()}`,
    });
  }
  return news.length;
}

/* ---------------- M1 新規のお申し込み 受付完了（すぐ） ---------------- */

/**
 * 新規のお申し込みを受け付けたら M1（メール一覧 M1）。宛先＝お申し込み者とメイン担当者（同じ人なら1通）。
 * いまは**文面を作るだけ**（お知らせの記録 dm.notice.notifications・メールの経路。本物の送信はしない：hong 2026-10-05）
 */
export function applyReceivedMail(r: DocRepo, a: Pick<Application, 'id' | 'kubun' | 'companyName' | 'branchNames' | 'branchIds' | 'startCycle' | 'requestedAt'>, to: { name: string; email: string }[]) {
  const list = [...new Map(to.filter((x) => x.email?.trim()).map((x) => [x.email.trim().toLowerCase(), x])).values()];
  const names = [...a.branchNames, ...a.branchIds.map((id) => r.get<{ name: string }>('dm.org.branches', id)?.name ?? id)];
  const [y, m] = a.startCycle.split('-');
  for (const x of list) {
    notify(r, {
      to: { site: 'corp', accountId: '', role: `mail:${x.email.trim()}` }, channels: ['mail'], templateId: 'apply_received', link: { type: 'application', id: a.id },
      title: `お申し込みを受け付けました（受付番号 ${a.id}）`,
      body: [
        a.companyName, `${x.name || 'ご担当者'} 様`, '',
        'ES STATION へのお申し込みをありがとうございます。', '下記の内容で受け付けました。運営で内容を確認し、2〜3営業日でご連絡します。', '',
        `■ 受付番号　：${a.id}`, `■ お申し込み日：${a.requestedAt.slice(0, 10)}`, `■ 契約の種類：${a.kubun === 'お試し' ? 'お試しキャンペーン' : '本導入'}`,
        `■ 納品先　　：${names[0] ?? ''}${names.length > 1 ? ` ほか ${names.length - 1} 拠点` : ''}`, `■ 開始希望　：${y && m ? `${y}年${Number(m)}月` : a.startCycle}サイクルから`, '',
        `■ キックオフ面談のご予約：${KICKOFF_URL}`, '　 ご利用開始に向けたキックオフ面談（1時間）のご予約をお願いします。', '',
        'お問い合わせの際は、受付番号をお知らせください。',
      ].join('\n'),
    });
  }
  return list.length;
}

/**
 * 新規のお申し込みを運営が却下したら、お申し込み者とメイン担当者（同じ人なら1通）へ理由つきで知らせる（Mail List No.28・台帳「新規のお申し込みの却下メール」）。
 * M1 と同じく文面を作るだけ（本物の送信はしない）。申込ごとに1通（拠点ごとには分けない）
 */
export function applyRejectedMail(r: DocRepo, a: Pick<Application, 'id' | 'kubun' | 'companyName' | 'branchNames' | 'branchIds' | 'requestedAt' | 'request' | 'setup'>, reason: string) {
  const v = (k: string) => a.request.find((x) => x[0] === k)?.[1]?.trim() ?? '';
  const main = a.setup?.corp?.contact ?? a.setup?.branches[0]?.contact;
  const to = [{ name: v('申込者'), email: v('申込者メール') }, { name: main?.name ?? '', email: main?.email ?? '' }];
  const list = [...new Map(to.filter((x) => x.email?.trim()).map((x) => [x.email.trim().toLowerCase(), x])).values()];
  const names = [...a.branchNames, ...a.branchIds.map((id) => r.get<{ name: string }>('dm.org.branches', id)?.name ?? id)];
  for (const x of list) {
    notify(r, {
      to: { site: 'corp', accountId: '', role: `mail:${x.email.trim()}` }, channels: ['mail'], templateId: 'apply_rejected', link: { type: 'application', id: a.id },
      title: `【ESステーション】新規のお申し込みについて（受付番号：${a.id}）`,
      body: [
        `${x.name || 'ご担当者'} 様`, '', 'ESステーションをご利用いただきありがとうございます。', '誠に恐れ入りますが、以下のお申し込みは今回はお受けできませんでした。', '',
        `■ 受付番号：${a.id}`, `■ お申し込み日：${a.requestedAt.slice(0, 10)}`, `■ 契約の種類：${a.kubun === 'お試し' ? 'お試しキャンペーン' : '本導入'}`, `■ 法人名：${a.companyName}`,
        `■ 納品先：${names[0] ?? ''}${names.length > 1 ? ` ほか ${names.length - 1} 拠点` : ''}`, `■ 理由：${reason}`, '',
        '内容をご確認のうえ、あらためてお申し込みいただくこともできます。ご不明な点はサポート窓口までお問い合わせください。',
      ].join('\n'),
    });
  }
  return list.length;
}

/* ---------------- 委託配送先：新規ES配送プラン追加（仮登録・すぐ） ---------------- */

/** 仮登録・本登録のあとに呼ぶ。ES配送便の委託配送先へ、拠点・会社ごとに1回（仮登録で便がまだなら本登録のとき） */
export function esPlanNotices(r: DocRepo, a: Application) {
  let n = 0;
  for (const b of a.setup?.branches ?? []) {
    if (!b.branchId || !b.stage) continue;
    for (const ch of b.channels.filter((x) => x.serviceForm === 'ES配送便')) {
      for (const cid of [ch.carrierId, ch.carrier2Id]) {
        const c = r.get<Carrier>('dm.master.carriers', cid);
        if (!c || c.kind !== '委託・引き取り') continue;
        const x = notifyOnce(r, `es_plan:${b.branchId}:${cid}`, {
          ...partnerTo(r, 'carrier', cid), templateId: 'es_plan_added', link: { type: 'application', id: a.id },
          title: `新しいお届け先が追加されます（${b.name}）`,
          body: `${c.name} ご担当者様\n新しいお届け先（ES配送便）が${b.stage}されました。\n・お届け先：${b.name}（${b.address.pref}${b.address.city}${b.address.addr1}）\n・開始：${a.setup?.startCycle || a.startCycle} サイクル\n・温度帯・枠：${ch.temp} ${ch.slots.join('・')}\n・受取時間：${b.receiveWindows.map((w) => `${w.from}〜${w.to}`).join('・') || '—'}`,
        });
        if (x) n++;
      }
    }
  }
  return n;
}

/* ---------------- 重要なお知らせ（8:00） ---------------- */

/** お知らせのメールの件名の先頭（Message List のメールと同じ。hong 2026-10-05） */
export const MAIL_PREFIX = '【ESステーション】';
/** お知らせのメールの件名（入れた件名がなければタイトル。先頭に【ESステーション】。すでに付いていれば重ねない） */
export const noticeMailSubject = (a: Pick<Announcement, 'title'> & { mail?: { subject?: string } | null }) => {
  const s = a.mail?.subject || a.title;
  return s.startsWith(MAIL_PREFIX) ? s : MAIL_PREFIX + s;
};

/** 重要なお知らせの自動のメール：公開開始日の 8:00（法人あてがあれば、土日祝なら前の営業日）。過ぎていればすぐ（いま） */
export function importantMail(r: DocRepo, a: Pick<Announcement, 'title' | 'sites' | 'publishFrom'>): NonNullable<Announcement['mail']> {
  const base = `${a.publishFrom} 08:00`;
  const at = a.sites.includes('corp') ? customerSendAt(r, base) : base;
  const now = nowStamp();
  const label: Record<string, string> = { corp: '法人・拠点：全員', carrier: '委託配送先：全員', driver: 'ドライバー：全員', supplier: '仕入先：全員', ops: '運営：全員', sysadmin: 'システム管理：全員' };
  return { subject: `${MAIL_PREFIX}【重要】${a.title}`, sendAt: at < now ? now : at, to: a.sites.map((s) => label[s] ?? s), auto: true };
}

/** 日次バッチ：送る日時を過ぎたお知らせのメールを送ったことにする（送信の記録に「メール送信」） */
export function sendAnnouncementMails(r: DocRepo, now: string) {
  const out: string[] = [];
  for (const a of r.list<Announcement>('dm.notice.announcements')) {
    if (!a.mail || a.mail.sendAt > now || a.sendLog?.some((x) => x.kind === 'メール送信')) continue;
    const log = a.sendLog ?? [];
    const at = [a.mail.sendAt, ...log.map((x) => x.at)].sort().pop()!;
    const to = a.mail.to.join('・'), subject = `件名：${noticeMailSubject(a)}`;
    /* 予約の記録がない（見本・自動のメール）ときは、送る日時の予約の記録も残す */
    const plan = log.some((x) => x.kind === 'メール送信予約') ? [] : [{ at, kind: 'メール送信予約' as const, to, note: `${a.mail.sendAt} に送信（${subject}）` }];
    r.put<Announcement>('dm.notice.announcements', a.id, { ...a, sendLog: [...log, ...plan, { at, kind: 'メール送信', to, note: subject }] });
    out.push(a.id);
  }
  return out;
}

/* ---------------- check.run ---------------- */

const OFF_SITES = ['corp', 'app'];

export function mailProblems(r: DocRepo): string[] {
  const p: string[] = [];
  const need = (cond: boolean, msg: string) => { if (!cond) p.push(msg); };
  const known = new Set([...TEMPLATES.map((t) => t.id), ...r.list<MailTemplate>('dm.notice.templates').map((t) => t.id)]);
  /* 旧システムのメールはすべて文面がある（見本の文面） */
  for (const m of OLD_MAILS) need(TEMPLATES.some((t) => t.id === m.templateId), `旧システムのメール「${m.old}」の文面 ${m.templateId} がない`);
  const notes = r.list<Notification>('dm.notice.notifications');
  const keys = new Map<string, string>();
  for (const n of notes) {
    if (n.templateId) need(known.has(n.templateId), `通知 ${n.id} の文面 ${n.templateId} がない`);
    if (!n.key) continue;
    need(!keys.has(n.key), `1回だけの通知 ${n.key} が ${keys.get(n.key)} と ${n.id} で重なっている`);
    keys.set(n.key, n.id);
    /* 予定のお知らせはお客様の休み（土日・全社の祝日）に出さない */
    if (n.key.startsWith('sched:') && OFF_SITES.includes(n.to.site)) {
      const day = (n.scheduledAt ?? n.at).slice(0, 10);
      need(!customerOff(r, day), `予定のお知らせ ${n.id}（${n.key}）がお客様の休みの日 ${day} に出ている`);
    }
  }
  /* 運営へのお問い合わせ新着メールは出さない（2026/10/03） */
  need(!notes.some((n) => n.to.site === 'ops' && n.templateId === 'inquiry_new'), 'お問い合わせの新着を運営へ通知している（出さない決まり）');
  /* 重要なお知らせの自動のメールは公開開始日の 8:00 まで（前倒しはお客様の休みのときだけ） */
  for (const a of r.list<Announcement>('dm.notice.announcements')) {
    if (!a.mail?.auto) continue;
    need(a.important, `お知らせ ${a.id} は重要でないのに自動のメールがある`);
    if (a.sites.includes('corp')) need(a.mail.sendAt.slice(0, 10) > a.publishFrom || !customerOff(r, a.mail.sendAt.slice(0, 10)), `お知らせ ${a.id} の重要のメールがお客様の休みの日（${a.mail.sendAt}）`);
  }
  return p;
}
