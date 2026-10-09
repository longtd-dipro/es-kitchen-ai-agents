import type { DocRepo } from '@/lib/ops/core/area';
import { lockedProblems } from './locked';
import { PULL_OPTION, PULL_REASON } from './lifecycle';
import type { Account, BillAdjustment, Driver, Inquiry, Loan, Notification, Option } from './types';

/*
 * check.run の続き（2026/10/03 朝の決定・グループ A）：
 *   ・確定の月の反映待ち（lib/domain/locked.ts）
 *   ・オプションの管理名（同じ請求書表示名のオプションは管理名で見分けられる）・設備引揚費（金額あり・【仮】のメモ・解約の回収予定の台数分）
 *   ・免許未登録の配送スタッフにアカウントを発行していない
 *   ・お問い合わせの通知先メール（形）・送った記録と通知が合う
 */
export function packAProblems(r: DocRepo): string[] {
  const p: string[] = [...lockedProblems(r)];
  const need = (c: boolean, m: string) => { if (!c) p.push(m); };

  /* オプション：同じ請求書表示名なら管理名が要る・管理名は重ならない */
  const opts = r.list<Option>('dm.master.options').filter((o) => o.status !== '削除済');
  const byName = new Map<string, Option[]>();
  for (const o of opts) byName.set(o.name, [...(byName.get(o.name) ?? []), o]);
  for (const [n, xs] of byName) if (xs.length > 1) need(xs.every((o) => !!o.mgmtName?.trim()) && new Set(xs.map((o) => o.mgmtName)).size === xs.length, `オプション ${xs.map((o) => o.id).join('・')} は請求書表示名「${n}」が同じなのに管理名で見分けられない`);
  /* 設備引揚費（OP000022）：0円・必要なときは運営が ③ 調整で入れる（2026/10/03 回答）。マスタにあること */
  const pull = r.get<Option>('dm.master.options', PULL_OPTION);
  need(!!pull, `設備引揚費（${PULL_OPTION}）がオプションマスタにない`);
  /* 設備引揚費の調整明細（今までに解約で自動でできたもの）：解約の申請ごとに1つ・金額は回収予定の台数 × 単価を超えない（③ 調整で下げる・外すのは可） */
  const pulls = r.list<BillAdjustment>('dm.billing.adjustments').filter((x) => x.kind === '設備の費用' && x.reason === PULL_REASON);
  const seen = new Set<string>();
  for (const x of pulls) {
    need(!seen.has(x.applicationId), `解約 ${x.applicationId} の設備引揚費の調整明細が2つある`);
    seen.add(x.applicationId);
    const units = r.list<Loan>('dm.org.loans').filter((l) => l.applicationId === x.applicationId && (l.status === '回収予定' || l.status === '回収済')).reduce((s, l) => s + l.qty, 0);
    need(units > 0, `設備引揚費の調整明細 ${x.id} の解約 ${x.applicationId} に回収予定の設備がない`);
    if (pull && pull.amountYen > 0) need(x.afterYen <= units * pull.amountYen, `設備引揚費の調整明細 ${x.id} の金額 ${x.afterYen} が ${units}台 × ${pull.amountYen} を超えている`);
  }

  /* 免許未登録の配送スタッフにアカウントを発行していない（2026/10/03 決定） */
  for (const d of r.list<Driver>('dm.master.drivers').filter((x) => x.status === '免許未登録')) {
    const a = r.get<Account>('dm.account.accounts', d.id);
    need(!a || ['未発行', '削除済', '利用停止'].includes(a.status), `免許未登録のドライバー ${d.id} にアカウント（${a?.status}）を発行している`);
  }

  /* お問い合わせ：送った記録には通知（メール）がある */
  const mails = r.list<Notification>('dm.notice.notifications').filter((n) => n.templateId === 'inquiry_new');
  for (const q of r.list<Inquiry>('dm.notice.inquiries').filter((x) => x.mailedTo)) {
    need(mails.some((n) => n.to.role === `mail:${q.mailedTo}` && n.body.includes(q.hubspotId)), `お問い合わせ ${q.id} を ${q.mailedTo} に送った通知がない`);
  }
  for (const q of r.list<Inquiry>('dm.notice.inquiries')) if (q.readAt) need(q.readAt >= q.at, `お問い合わせ ${q.id} の開いた日時 ${q.readAt} が送信より前`);
  return p;
}
