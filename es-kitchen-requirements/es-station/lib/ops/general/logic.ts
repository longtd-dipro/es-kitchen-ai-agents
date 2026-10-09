/*
 * 領域 general の計算と入力チェック（画面と actions の両方で使う）。
 * 元：10_運営_まとめ.html 本体（main_script2 の 代理・紹介管理、main_script5 のお知らせ・平均単価の目標）
 */
import { today } from '@/lib/supplier/dates';
import type { AgencyRow, FeeCond, FeePlan, NoticeCond, NoticeForm, Payment, RefContract, RefMeta, Referral } from './types';
import { fmtYm } from '@/lib/format/date';
import { yen } from '@/lib/format/money';


/** 'YYYY-MM' → 表示の 'YYYY-MM'（空なら空。共通の表示ルール・決定 8-1） */
export const ymJa = (v: string | undefined) => fmtYm(v);
/** 今日（YYYY-MM-DD） */
export const todayIso = () => today().replace(/\//g, '-');

/* ---------- 紹介フィー ---------- */
export const planAmountTxt = (p?: Partial<FeePlan> | null) => (!p ? '' : p.calc === '固定額' ? yen(+(p.amount ?? 0)) : p.calc === '請求額割合' ? p.rate + '%' : 'プラン別設定');
export const planPeriodTxt = (p?: Partial<FeePlan> | null) => (!p ? '' : p.pay === '単発' ? '1回' : p.pay === '継続（永続）' ? '永続' : p.months + 'ヶ月');
export const planPayTxt = (p?: Partial<FeePlan> | null) => (!p || !p.pay ? '' : p.pay.replace(/（.*/, ''));

const COND_KEYS = ['pay', 'months', 'calc', 'amount', 'rate', 'tiers'] as const;
/** フィー条件の比較用の文字列 */
export const condSig = (p?: Partial<FeeCond> | null) =>
  !p ? '' : JSON.stringify([p.pay, p.pay === '継続（ヶ月）' ? +(p.months ?? 0) : null, p.calc, p.calc === '固定額' ? +(p.amount ?? 0) : p.calc === '請求額割合' ? +(p.rate ?? 0) : (p.tiers || []).map((t) => [t[0], +t[1]])]);
/** 紹介に適用する時点のフィー条件を写す */
export const snapCond = (p?: FeePlan | null): FeeCond | null =>
  p ? (structuredClone(Object.fromEntries(COND_KEYS.map((k) => [k, p[k] ?? null]))) as FeeCond) : null;

/** 月次提供数の段のラベル（〜50食・51〜100食・101食〜） */
export const tierLabel = (tiers: [number, unknown][], i: number) =>
  i === 0 ? `〜${tiers[0][0]}食` : i === tiers.length - 1 ? `${tiers[i - 1][0] + 1}食〜` : `${tiers[i - 1][0] + 1}〜${tiers[i][0]}食`;

/** 紹介の実効フィー条件＝名前はマスタ、条件は適用時点のもの */
export const refPlan = (r: { plan: string; cond: FeeCond | null }, plans: FeePlan[]): FeePlan => ({ ...(plans.find((p) => p.id === r.plan) as FeePlan), ...(r.cond || {}) });

/** フィーの金額 */
export function feeFor(plan: FeePlan, base: number, meals: number) {
  if (plan.calc === '固定額') return +(plan.amount ?? 0);
  if (plan.calc === '請求額割合') return Math.round((base * +(plan.rate ?? 0)) / 100);
  const tiers = plan.tiers ?? [];
  const t = tiers.find((x) => meals <= x[0]) || tiers.at(-1);
  return t ? +t[1] : 0;
}

/** 紹介履歴の支払い終了予定月 */
export function refEnd(p: Pick<FeePlan, 'pay' | 'months'>, payStart: string) {
  if (!payStart) return '';
  if (p.pay === '継続（ヶ月）') {
    const [y, mo] = payStart.split('-').map(Number);
    const d = new Date(y, mo - 1 + +(p.months ?? 0) - 1, 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  }
  return p.pay === '単発' ? payStart : '';
}
/** 紹介履歴の状態と終了月 */
export function refStatus(c: RefContract, endPlan: string) {
  const cur = todayIso().slice(0, 7);
  const status = c.st === '仮登録' ? '契約前' : c.st === '終了' ? (endPlan && c.end && endPlan <= c.end ? '満了' : '途中解約') : endPlan && endPlan < cur ? '満了' : '有効';
  return { status, end: status === '満了' ? endPlan : c.st === '終了' ? c.end ?? '' : '' };
}

/** 紹介履歴＝親契約から作る（代理店コードか紹介元法人がある親契約） */
export function buildReferrals(contracts: RefContract[], metas: Record<string, RefMeta>, plans: FeePlan[], agencies: AgencyRow[]): Referral[] {
  let n = Object.keys(metas).length;
  return contracts.filter((c) => c.agent || c.corpSrc).map((c) => {
    const m = metas[c.id] ?? (() => {
      const plan = agencies.find((a) => a.id === c.agent)?.plan || 'RFP000002';
      return { id: 'REF' + String(++n).padStart(6, '0'), plan, cond: snapCond(plans.find((p) => p.id === plan)), payStart: c.start, status: c.st === '仮登録' ? '契約前' : '有効', endPlan: '', end: '', note: '', history: [{ at: '2026/08/17 09:15', what: '親契約の代理店コードから紹介履歴を作成', by: 'システム' }] };
    })();
    return { ...m, contract: c.id, srcType: c.agent ? '代理店' : '法人', src: c.agent || c.corpSrc || '', start: c.start };
  });
}

/** 支払の合計 */
export const payTotals = (p: Pick<Payment, 'lines'>) => {
  const calcBase = p.lines.reduce((s, l) => s + l.base, 0);
  const fee = p.lines.reduce((s, l) => s + l.fee, 0);
  const adj = p.lines.reduce((s, l) => s + (+l.adj || 0), 0);
  return { calcBase, fee, adj, total: fee + adj };
};

/* ---------- 入力チェック（エラーは 項目 → 文言。1 は赤枠だけ） ---------- */
export type Errs = Record<string, string | 1>;
const REQ = '必須項目です';

export function validateAgency(a: AgencyRow): Errs {
  const e: Errs = {};
  (['name', 'kana', 'tel', 'zip', 'pref', 'city', 'addr', 'plan'] as const).forEach((k) => { if (!a[k]) e[k] = REQ; });
  if (a.tel && !/^[0-9-]{10,13}$/.test(a.tel)) e.tel = '電話番号は半角数字とハイフンで入力してください';
  if (a.zip && !/^\d{3}-?\d{4}$/.test(a.zip)) e.zip = '郵便番号は 000-0000 の形式で入力してください';
  if (!a.contacts.length) e.contacts = '担当者を1名以上登録してください';
  a.contacts.forEach((c, i) => {
    if (!c.kind) e['ck' + i] = 1;
    if (!c.name) e['cn' + i] = 1;
    if (!c.email || !/.+@.+\..+/.test(c.email)) e['cm' + i] = 1;
  });
  if (a.contacts.some((_, i) => e['ck' + i] || e['cn' + i] || e['cm' + i])) e.contacts = '担当者の区分・担当者名・メールアドレス（正しい形式）を入力してください';
  return e;
}

export function validateFee(p: FeePlan): Errs {
  const e: Errs = {};
  if (!p.name) e.name = REQ;
  if (p.pay === '継続（ヶ月）' && !(+(p.months ?? 0) > 0)) e.months = '1以上の月数を入力してください';
  if (p.calc === '固定額' && !(+(p.amount ?? 0) > 0)) e.amount = '金額を入力してください';
  if (p.calc === '請求額割合' && !(+(p.rate ?? 0) > 0 && +(p.rate ?? 0) <= 100)) e.rate = '1〜100の数値を入力してください';
  if (p.calc === '月次提供数別の金額') (p.tiers ?? []).forEach((t, i) => { if (!(+t[1] > 0)) e['t' + i] = 1; });
  return e;
}
/** 保存する形（数値にそろえる） */
export function normalizeFee(p: FeePlan): FeePlan {
  return { ...p, amount: +(p.amount ?? 0), rate: +(p.rate ?? 0), months: p.months === null ? null : +p.months, tiers: (p.tiers ?? []).map((t) => [t[0], +t[1]]) };
}

export function validateRef(r: { plan: string; payStart: string }, c: RefContract): Errs {
  const e: Errs = {};
  if (!r.plan) e.plan = REQ;
  if (!r.payStart && c.st !== '仮登録') e.payStart = REQ;
  if (c.start && r.payStart && r.payStart < c.start) e.payStart = '支払い開始年月は契約開始年月以降を指定してください';
  return e;
}

export function validatePay(status: string, date: string): Errs {
  return status === '支払済' && !date ? { date: '支払日は必須項目です。' } : {};
}

/* ---------- お知らせ ---------- */
export const NT_KEYS = ['corp', 'app', 'dlv', 'staff', 'sup'] as const;
const NT_LABEL: Record<string, string> = { corp: '法人・拠点', app: 'アプリユーザー', dlv: '委託配送先', staff: '配送スタッフ', sup: '仕入先' };
export const blankNoticeCond = (): NoticeCond => ({ ym: '', kind: 'menu', vending: 'any' });
/** 条件で絞るの文字（例：2026年10月のメニューを注文・自販機あり）。条件が空なら '' */
export function ntCondText(c?: NoticeCond) {
  if (!c) return '';
  const [y, m] = c.ym.split('-');
  return [c.ym ? `${y}年${Number(m)}月の${c.kind === 'menu' ? 'メニュー' : '商品'}を注文` : '', c.vending === 'yes' ? '自販機あり' : c.vending === 'no' ? '自販機なし' : ''].filter(Boolean).join('・');
}
/** 配信対象の指定の文字（個別 n件／条件） */
export const ntModeText = (t: Pick<NoticeForm['tg'][string], 'mode' | 'picks' | 'cond'>) => (t.mode === 'pick' ? `（個別 ${t.picks.length}件）` : t.mode === 'cond' ? `（条件：${ntCondText(t.cond)}）` : '');
/** 一覧の「配信対象」の文字 */
export function ntTgText(n: Pick<NoticeForm, 'tg'>) {
  return NT_KEYS.filter((k) => n.tg[k].ess || n.tg[k].mail.length).map((k) => NT_LABEL[k] + ntModeText(n.tg[k])).join('・') || '—';
}
/** 表示期間から今日の状態 */
export function ntTodayStatus(start: string, end: string) {
  const t = today();
  if (start > t + ' 23:59') return '予約中';
  if (end && end < t + ' 00:00') return '終了';
  return '公開中';
}
/** 新規のお知らせのフォーム（空） */
export const blankNoticeForm = (): NoticeForm => ({
  title: '', cat: '', start: '', end: '', files: 0, body: '', subj: '', mailAt: '', mailBody: '',
  tg: Object.fromEntries(NT_KEYS.map((k) => [k, { ess: false, mail: [], mode: 'all', picks: [] }])),
});
const DT = /^\d{4}\/\d\d\/\d\d \d\d:\d\d$/;
export function validateNotice(d: NoticeForm): Errs {
  const e: Errs = {};
  if (!NT_KEYS.some((x) => d.tg[x].ess || d.tg[x].mail.length)) e.tg = '配信対象を1つ以上選んでください（ESSへお知らせ または メール送信）';
  NT_KEYS.forEach((x) => { if (d.tg[x].mode === 'pick' && !d.tg[x].picks.length && (d.tg[x].ess || d.tg[x].mail.length)) e.tg = `${NT_LABEL[x]} の個別選択で対象を選んでください`; });
  NT_KEYS.forEach((x) => { if (d.tg[x].mode === 'cond' && !ntCondText(d.tg[x].cond) && (d.tg[x].ess || d.tg[x].mail.length)) e.tg = `${NT_LABEL[x]} の条件（注文した年月・自販機のあり／なし）を1つ以上指定してください`; });
  if (!d.title) e.title = 'タイトルを入力してください';
  if (!d.cat) e.cat = 'カテゴリを選んでください';
  if (!d.body) e.body = '本文を入力してください';
  if (!DT.test(d.start)) e.start = '表示開始日時を yyyy-mm-dd HH:mm で入力してください';
  if (NT_KEYS.some((x) => d.tg[x].mail.length) && !DT.test(d.mailAt || '')) e.mailAt = 'メールの日時指定を yyyy-mm-dd HH:mm で入力してください';
  /* メール送信があるときメール本文は必須（既定値はお知らせの本文：hong 2026-10-05） */
  if (NT_KEYS.some((x) => d.tg[x].mail.length) && !(d.mailBody || d.body)) e.mailBody = 'メール本文を入力してください';
  return e;
}
