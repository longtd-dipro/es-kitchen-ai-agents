import { trialMonthsLabel } from '@/lib/domain/trial';
import { billStateOf } from '@/lib/corp/docs/fromDomain';
import { rebillBadge } from '@/lib/corp/docs/logic';
import { invoiceTotals, taxTotal } from '@/lib/domain/invoiceTax';
import { methodOf, pricesAt, yenOf } from '@/lib/domain/snapshot';
import type { DocRepo } from '@/lib/ops/core/area';
import { today } from '@/lib/supplier/dates';
import { fixedYenOf } from '@/lib/ops/billing/fromDomain';
import type { ApplicationWithEdits, InfoEdits } from '@/lib/domain/areas/apply';
import type {
  Account, Application, Billing, Branch, ChildContract, Contact, Contract, Corp, Cycle, Delivery, Discount, Invoice, Loan, Model, Option, Pause, Plan,
} from '@/lib/domain/types';
import { isOpenPause, PAUSE_OPEN } from '@/lib/domain/types';
import { CFIELDS, FIELDS, NOW_CYC, ym } from './logic';
import { NO_EXTRA, SITE_EXTRA } from './seed';
import type { Acct, ChangeItem, CorpSeed, Kid, Pending, ReqRow, SiteBill, SiteSeed, SiteView, StaffRow } from './types';
import { yen } from '@/lib/format/money';
import { amountOf, optionAmount, welfareOf, welfarePerMeal } from '@/lib/domain/charges';
import { planWelfareTax, rateOf } from '@/lib/domain/tax';
import { corpTerm } from '@/lib/domain/terms';

/*
 * 共通データ（lib/domain・dm.*）から、法人Web の拠点管理・法人情報・契約の申請の画面の形（SiteView・法人の値・ReqRow）を作る。
 *   拠点・契約・子契約・休止・貸出・担当者（dm.org）、プラン・機種・オプション・値引き（dm.master）、申請（dm.apply）、請求書（dm.billing）、
 *   サイクル・配送（dm.delivery）、最終ログイン（dm.account）。
 * 共通データにない値（納品不可曜日・資料など）は seed.ts の SITE_EXTRA、1ヶ月上限金額・月ごとの配送備考は corp-sites の kind（K）。
 */

/** 共通データにまだない、法人Web で直した値（corp-sites.*） */
export const K = {
  /** 1ヶ月上限金額（1人あたり）。拠点ID → { id, month } */
  app: 'corp-sites.app',
  /** 月ごとのご契約の配送備考。子契約ID → Kover */
  kover: 'corp-sites.kover',
} as const;
export type Kover = { id: string; memo: string; at: string; scope: 'only' | 'after' };

/* ---------------- 小さな道具 ---------------- */
export const addMonth = (cyc: string, n: number) => {
  const [y, m] = cyc.split('-').map(Number);
  const d = new Date(y, m - 1 + n, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};
const monthsOf = (from: string, to: string) => {
  const [a, b] = [from, to].map((x) => x.split('-').map(Number));
  return (b[0] - a[0]) * 12 + (b[1] - a[1]) + 1;
};
/** ご注文・変更の締切（前月15日） */
export const closeOf = (cyc: string) => `${addMonth(cyc, -1).replace('-', '/')}/15`;
export const cycText = (c: string) => (c === PAUSE_OPEN ? '未定' : c ? ym(c) + '分' : '—');
/** 「2026年11月」「2026年11月サイクル」→ '2026-11' */
export const cycOfJa = (v: string) => {
  const m = /^(\d{4})年(\d{1,2})月/.exec(v || '');
  return m ? `${m[1]}-${m[2].padStart(2, '0')}` : '';
};
/** 'YYYY/MM/DD' に月を足して1日前（最低利用期間の満了日） */
function termEnd(start: string, months: number) {
  const [y, m, d] = start.split('/').map(Number);
  const x = new Date(y, m - 1 + months, d - 1);
  return `${x.getFullYear()}/${String(x.getMonth() + 1).padStart(2, '0')}/${String(x.getDate()).padStart(2, '0')}`;
}
/** 継続年月（'0年7ヶ月'） */
function duration(from: string) {
  if (!from) return '—';
  const [y, m, d] = from.split('/').map(Number), [ty, tm, td] = today().split('/').map(Number);
  const n = Math.max(0, (ty - y) * 12 + (tm - m) - (td < d ? 1 : 0));
  return `${Math.floor(n / 12)}年${n % 12}ヶ月`;
}
const LEAD: Record<number, string> = { [-3]: '3ヶ月前（−3）', [-2]: '2ヶ月前（−2）', [-1]: '1ヶ月前（−1）', 0: '当月（0）', 1: '翌月（＋1）' };
const KIND_ORDER: Contact['kind'][] = ['メイン担当者', '請求担当者', 'サブ担当者'];

/* ---------------- 読む ---------------- */
const contractOf = (r: DocRepo, branchId: string) => r.list<Contract>('dm.org.contracts').find((c) => c.branchId === branchId);
/** 子契約（新しいサイクルが先。取り消した子契約＝canceled は一覧に出さない・決定 28-12） */
const childrenOf = (r: DocRepo, contractId?: string) =>
  r.list<ChildContract>('dm.org.childContracts').filter((x) => x.contractId === contractId && !x.canceled).sort((x, y) => y.cycleMonth.localeCompare(x.cycleMonth));
/** 今のサイクルの子契約（なければいちばん近いもの） */
const currentOf = (kids: ChildContract[]) => kids.find((x) => x.cycleMonth <= NOW_CYC) ?? kids[kids.length - 1];
const planOf = (r: DocRepo, id?: string) => (id ? r.get<Plan>('dm.master.plans', id) : undefined);
const pausesOf = (r: DocRepo, contractId?: string) =>
  r.list<Pause>('dm.org.pauses').filter((p) => p.contractId === contractId).sort((x, y) => x.fromCycle.localeCompare(y.fromCycle));

export function staffOf(r: DocRepo, type: Contact['owner']['type'], id: string): StaffRow[] {
  return r.list<Contact>('dm.org.contacts').filter((c) => c.owner.type === type && c.owner.id === id)
    .sort((x, y) => KIND_ORDER.indexOf(x.kind) - KIND_ORDER.indexOf(y.kind) || x.id.localeCompare(y.id))
    .map((c) => [c.kind, c.name, c.kana, c.email, c.tel]);
}
/** 法人Web の表の行 → 共通データのご担当者 */
export const contactRows = (staff: StaffRow[]) =>
  staff.map(([kind, name, kana, email, tel]) => ({ kind: kind as Contact['kind'], name, kana, email, tel }));

/** 見えている拠点（法人アカウント＝自社のすべての拠点、拠点アカウント＝その拠点だけ）。並びは登録の順 */
export const branchesOf = (r: DocRepo, a: Acct) =>
  r.list<Branch>('dm.org.branches').filter((b) => b.corpId === a.corpId && (a.role !== 'branch' || b.id === a.branchId))
    .sort((x, y) => x.registeredAt.localeCompare(y.registeredAt));

/** 拠点の表示用の状態（休止は契約から） */
export const siteStatus = (b: Branch, ct?: Contract) => (ct?.status === '利用休止' ? '休止中' : b.status);

/* ---------------- 子契約・契約 ---------------- */
const dlvOf = (cc?: ChildContract) => (cc ? [...new Set(cc.channels.map((c) => corpTerm(c.serviceForm)))].join('・') : '—');
/** 納品回数（冷蔵と冷凍が別のときは「冷蔵2回・冷凍2回」） */
function timesOf(cc?: ChildContract) {
  if (!cc || !cc.channels.length) return '—';
  return cc.channels.length > 1 ? cc.channels.map((c) => `${c.temp}${c.slots.length}回`).join('・') : `${cc.channels[0].slots.length}回`;
}
const planText = (r: DocRepo, cc?: ChildContract) => {
  const p = planOf(r, cc?.planId);
  return p ? `${p.id} ${p.name}` : '—';
};

/** 価格補助（企業負担額）の参照だけの表示：プランの企業負担額（税込・1食）× 月次提供上限の合計 ÷（1＋税率）＝月の企業負担分（税抜・28-148） */
function subsidyOf(r: DocRepo, cc: ChildContract): Kid['subsidy'] {
  const p = planOf(r, cc.planId);
  if (!p) return undefined;
  const perMeal = welfarePerMeal(p), ratePct = rateOf(r, planWelfareTax(p), 8), meals = p.monthlyMeals;
  return { perMeal: yen(perMeal), monthly: yen(welfareOf(meals, perMeal, ratePct)), meals, ratePct };
}

function kidsOf(r: DocRepo, kids: ChildContract[], lead: number): Kid[] {
  return kids.map((cc) => ({
    cyc: cc.cycleMonth, id: cc.id, plan: `${planText(r, cc)}（${cc.course}）`, dlv: dlvOf(cc), n: timesOf(cc),
    billFor: ym(addMonth(cc.cycleMonth, lead)), amt: yen(fixedYenOf(r, cc)), pre: cc.billStatus === '請求済' ? '請求済' : cc.billStatus,
    /* 後払い（ご利用実績の精算）は、サイクルが終わってから請求する */
    post: cc.billStatus === '未確定' || cc.cycleMonth >= NOW_CYC ? '未確定' : '請求済',
    subsidy: subsidyOf(r, cc),
  }));
}

/** 最低利用期間・違約金（貸出中の設備ごと） */
function termOf(r: DocRepo, ct: Contract | undefined, loans: Loan[]) {
  if (ct?.kind === 'お試しキャンペーン') return { long: 'お試しのため最低利用期間・違約金はありません。', short: 'お試しのため最低利用期間・違約金なし' };
  const rows = loans.filter((l) => l.status !== '回収済').map((l) => ({ l, m: r.get<Model>('dm.master.models', l.modelId) }))
    .filter((x) => x.m && x.m.minMonths > 0).map((x) => ({ ...x, end: termEnd(x.l.startOn, x.m!.minMonths) }));
  if (!rows.length) return { long: '最低利用期間のある設備はありません（違約金はかかりません）。', short: '最低利用期間のある設備なし' };
  const kinds = [...new Map(rows.map((x) => [x.m!.category, `${x.m!.category}${x.m!.minMonths}ヶ月`])).values()].join('・');
  const live = rows.filter((x) => x.end >= today());
  return {
    long: `最低利用期間は設備ごとに、貸出日から数えます（${kinds}）。` + (live.length ? `いま解約すると、期間内の${live.map((x) => `${x.m!.category} ${x.l.qty}台`).join('・')}分の違約金がかかります。` : 'いま解約しても違約金はかかりません。'),
    short: live.length ? `設備ごと（${live.map((x) => `${x.m!.category} ${x.end} まで`).join('・')}）` : '設備ごと（期間内の設備なし）',
  };
}

/** ご契約の作成状況・次回の自動作成 */
function nextOf(kids: ChildContract[], pauses: Pause[], ct?: Contract) {
  const paused = pauses.find((x) => x.fromCycle <= NOW_CYC && NOW_CYC <= x.toCycle);
  if (!kids.length && paused) return `休止中（${ym(paused.fromCycle)}〜${cycText(paused.toCycle)}）のため、月ごとのご契約は作りません。${paused.resumeCycle ? `再開の ${cycText(paused.resumeCycle)}分から作ります。` : ''}`;
  if (!kids.length) return '月ごとのご契約はまだありません。ご契約の開始月のご注文・変更の締切までに作ります。';
  const last = kids[0].cycleMonth;
  let text = `${cycText(last)}分まで作成済み。`;
  if (ct && ['解約手続き中', '終了', '停止'].includes(ct.status)) return text + 'ご解約のため、これより後は作りません。';
  let next = addMonth(last, 1);
  const p = pauses.find((x) => x.toCycle >= next);
  if (p) {
    text += `${ym(p.fromCycle > next ? p.fromCycle : next)}〜${cycText(p.toCycle)}は休止のため作りません。`;
    /* 終わりが未定の休止（移行の休止中）は、再開月が決まるまで次を作らない */
    if (isOpenPause(p)) return text + '再開月が決まりしだい、次のご契約を作ります。';
    if (p.fromCycle <= next) next = p.resumeCycle || addMonth(p.toCycle, 1);
  }
  return text + `次は ${cycText(next)}を、そのご利用月のご注文・変更の締切までに作ります。`;
}

/** 休止の帯（いまの休止・これからの休止） */
function bandOf(pauses: Pause[]): SiteSeed['band'] {
  const p = pauses.filter((x) => x.toCycle >= NOW_CYC).pop();
  if (!p) return null;
  const later = p.fromCycle > NOW_CYC;
  return {
    kind: later ? '休止（予定）' : '休止中', from: cycText(p.fromCycle), to: cycText(p.toCycle), n: isOpenPause(p) ? '未定' : `${monthsOf(p.fromCycle, p.toCycle)}ヶ月`,
    resume: p.resumeCycle ? cycText(p.resumeCycle) : '—', reason: p.reason || '—', eq: p.keepEquipment ? '置いたまま（保管料なし）' : '引き揚げる', at: later ? 1 : 0,
  };
}

/** 貸出一覧（16列） */
function loanRows(r: DocRepo, loans: Loan[], trial: boolean): (string | number)[][] {
  return loans.map((l) => {
    const m = r.get<Model>('dm.master.models', l.modelId);
    const done = l.status === '回収済';
    const end = m && m.minMonths > 0 && !trial ? termEnd(l.startOn, m.minMonths) : '';
    return [
      l.id, m?.category ?? '—', m?.name ?? l.modelId, '—', l.qty, done ? l.qty : 0, done ? 0 : l.qty, l.startOn, '—', '—', l.status, '—',
      end || (trial ? '—（お試しのため期間なし）' : '—（期間なし）'), trial ? '発生しない（お試し）' : end && end >= today() && !done ? '発生する' : '発生しない', '', l.startOn,
    ];
  });
}

/** 適用一覧（オプション・値引き。13列）。子契約に付いているサイクルから適用開始月・終了月を出す */
function optRows(r: DocRepo, kids: ChildContract[], ct?: Contract): string[][] {
  const cur = currentOf(kids);
  const rows: string[][] = [];
  const add = (kind: 'オプション' | '値引き', id: string, name: string, amount: string, basis: string, on: (cc: ChildContract) => boolean) => {
    const mine = kids.filter(on).sort((x, y) => x.cycleMonth.localeCompare(y.cycleMonth)), cycles = mine.map((x) => x.cycleMonth);
    const active = !!cur && on(cur);
    /* 適用ID は持たない（2026/10/03）：オプション・値引きは子契約ID＋コードで特定。子契約は今の子契約（終わったものは最後の子契約） */
    rows.push([(active ? cur : mine[mine.length - 1])?.id ?? '—', kind, id, name, '—', '月ごとのご契約', '1', amount, cycles[0], active ? '—' : cycles[cycles.length - 1], active ? '適用中' : '終了', basis, '—']);
  };
  for (const id of [...new Set(kids.flatMap((x) => x.optionIds))]) {
    const o = r.get<Option>('dm.master.options', id);
    add('オプション', id, o?.name ?? id, o ? `${yen(optionAmount(o, cur))}${cur?.optionQty?.[id] && cur.optionQty[id] > 1 ? ` × ${cur.optionQty[id]}${o.unit || ''}` : ''}` : '—', o ? `${o.category}・${o.feeType}` : '—', (cc) => cc.optionIds.includes(id));
  }
  for (const id of [...new Set(kids.flatMap((x) => x.discountIds))]) {
    const d = r.get<Discount>('dm.master.discounts', id);
    /* 価格は子契約の世代 × コース × 配送方法（台帳 E 2026-10-05） */
    const price = cur ? yenOf(pricesAt(planOf(r, cur.planId), cur.cycleMonth, cur.priceGenId).find((p) => p.course === cur.course), methodOf(cur)) : undefined;
    add('値引き', id, d?.name ?? id, d?.target === 'プラン料金' && price ? yen(-price) : '—', d?.note ?? '—', (cc) => cc.discountIds.includes(id));
  }
  return rows;
}

/* ---------------- 請求 ---------------- */
/** 状態（確定／請求済み）。再請求はバッジ用に「／再請求（番号）」を添える（台帳 E 2026-10-05） */
const invStatus = (x: Invoice) => { const st = billStateOf(x); return st ? st.st + (st.rebill ? `／${rebillBadge(x.id, st.rebill)}` : '') : ''; };
const sum = (lines: Invoice['lines'], kind: Invoice['lines'][number]['kind']) => lines.filter((l) => l.kind === kind).reduce((s, l) => s + l.amountYen, 0);
/** 税率ごとに合計して四捨五入（請求書と同じ規則） */
const taxOf = (lines: Invoice['lines']) => invoiceTotals(lines).byRate.reduce((a, b) => a + b.tax, 0);
const invoices = (r: DocRepo) => r.list<Invoice>('dm.billing.invoices').filter((x) => x.status !== '取消').sort((x, y) => y.id.localeCompare(x.id));

/** 拠点の請求書（11列）。請求先が法人のときは、法人の請求書のうちこの拠点の分（参考） */
function siteInv(r: DocRepo, b: Branch, ct?: Contract): string[][] {
  const own = ct?.billTo === 'この拠点';
  return invoices(r).filter((x) => (own ? x.branchId === b.id : x.branchId === null && x.corpId === b.corpId && x.lines.some((l) => l.branchId === b.id))).map((x) => {
    const lines = own ? x.lines : x.lines.filter((l) => l.branchId === b.id && l.kind !== '繰越');
    const post = sum(lines, '後払い');
    const tax = own ? taxTotal(x) : taxOf(lines);
    const total = own ? x.total : lines.reduce((s, l) => s + l.amountYen, 0) + tax;
    return [x.id, x.issuedOn, ym(x.issueMonth), yen(sum(lines, '前払い')), cycText(x.cycleMonth), post ? yen(post) : '—', post ? x.actualPeriod : '—', yen(tax), yen(total), x.dueOn, invStatus(x)];
  });
}

/** 法人の請求書（13列） */
function corpInv(r: DocRepo, corpId: string): string[][] {
  return invoices(r).filter((x) => x.corpId === corpId).map((x) => {
    const to = x.branchId ? r.get<Branch>('dm.org.branches', x.branchId)?.name ?? x.branchId : '法人';
    const n = new Set(x.lines.filter((l) => l.kind !== '繰越').map((l) => l.branchId)).size;
    return [x.id, x.issuedOn, ym(x.issueMonth), to, String(n), yen(sum(x.lines, '前払い')), cycText(x.cycleMonth), yen(sum(x.lines, '後払い')), x.actualPeriod, yen(x.tax8 + x.tax10), yen(x.total), x.dueOn, invStatus(x)];
  });
}

function siteBill(corp: Corp | undefined, ct?: Contract): SiteBill {
  const own = ct?.billing ?? null, base: Billing | undefined = own ?? corp?.billing;
  if (!base) return { unit: '—', pay: '—', debit: '', lead: '—', cycle: '—', start: '—', due: '—' };
  const byCorp = own ? '' : '（法人の設定）';
  return {
    unit: base.invoiceUnit + byCorp, pay: base.payMethod, debit: base.payMethod === '口座振替' ? base.debitStatus : '',
    lead: own ? LEAD[own.lead] : `上書きなし（法人の設定：${LEAD[base.lead]}）`,
    cycle: base.payCycle === '月払い' ? '月払い' : '年払い', start: base.payCycle === '月払い' ? '—（月払いのため）' : '—',
    due: base.dueRule.replace('請求月', 'ご請求月') + byCorp,
  };
}

/* ---------------- 申請（dm.apply） ---------------- */
const OPEN: Application['status'][] = ['承認待ち', '対応中'];
/** 法人の申請（新しい順） */
export const corpApps = (r: DocRepo, corpId: string) =>
  r.list<ApplicationWithEdits>('dm.apply.applications').filter((x) => x.corpId === corpId).sort((x, y) => y.requestedAt.localeCompare(x.requestedAt));

const ST_OF = { '': 'ESキッチンが確認中', ok: '承認', ng: 'お受けできませんでした', wd: '取り下げ' } as const;
const NEW_ST: Partial<Record<Application['status'], string>> = { 完了: 'ご契約開始済', 却下: 'お受けできませんでした', 取り下げ済: '取り下げ' };

/** 申請者（「中村 里奈（拠点アカウント）」→ 名前・アカウント。代理入力は「ESキッチンが代わりに受け付けました（…）」） */
export function applicantOf(a: Application) {
  const n = a.requestedBy.name;
  if (a.proxy || a.requestedBy.site === 'ops') {
    const m = /代理入力：(.+?)）?$/.exec(n);
    return { cell: 'ESキッチンが代わりに受け付けました（' + (m ? m[1].replace(/）$/, '') : n) + '）', who: n, acct: '' };
  }
  if (a.requestedBy.site === 'public') return { cell: `${n}（ログイン前の申込フォーム）`, who: n, acct: '' };
  const m = /^(.*)（(.+アカウント)）$/.exec(n);
  return { cell: n, who: m ? m[1] : n, acct: m ? m[2] : '' };
}
const val = (a: Application, ...keys: string[]) => keys.map((k) => a.request.find((x) => x[0] === k)?.[1]).find(Boolean);
/** 一覧に出す申請内容（短く） */
const whatOf = (a: Application) => corpTerm(val(a, '申請内容', '変更したいこと', '休止したい期間', '解約の理由', 'プラン') ?? a.kind);
const fromOf = (a: Application) => (a.kind === '法人情報の変更' ? '承認後すぐ' : cycText(a.startCycle));

/** 承認したら直す欄 → 変更の1項目（承認待ちの表示）。edits がなければ申請の中身 */
function itemsOf(a: ApplicationWithEdits, cur: (k: string) => string): ChangeItem[] {
  const e = a.edits;
  if (!e) return a.request.filter(([k]) => k !== '受付').map(([k, v]) => ({ k, label: corpTerm(k), from: '', to: corpTerm(v) }));
  const defs = a.kind === '法人情報の変更' ? CFIELDS : FIELDS;
  return Object.entries(editsToFields(e)).map(([k, to]) => ({ k, label: defs[k]?.label ?? k, from: cur(k), to }));
}
/** 共通データの欄 → 法人Web の欄 */
export function editsToFields(e: InfoEdits): Record<string, string> {
  const out: Record<string, string> = {};
  const map: [keyof InfoEdits, string][] = [['name', 'name'], ['kana', 'kana'], ['zip', 'zip'], ['pref', 'pref'], ['city', 'city'], ['addr1', 'a1'], ['addr2', 'a2'], ['tel', 'tel'], ['fax', 'fax'], ['billTo', 'billTo']];
  for (const [d, f] of map) if (e[d] !== undefined) out[f] = String(e[d]);
  if (e.allowGuest !== undefined) out.guest = e.allowGuest ? '利用する' : '利用しない';
  return out;
}
/** 法人Web の欄 → 共通データの欄（承認が必要な欄だけ） */
export function fieldsToEdits(d: Record<string, string>): InfoEdits {
  const e: InfoEdits = {};
  const map: Record<string, keyof InfoEdits> = { name: 'name', kana: 'kana', zip: 'zip', pref: 'pref', city: 'city', a1: 'addr1', a2: 'addr2', tel: 'tel', fax: 'fax' };
  for (const [k, v] of Object.entries(d)) {
    if (map[k]) (e as Record<string, string>)[map[k]] = v;
    if (k === 'billTo' && (v === '法人' || v === 'この拠点')) e.billTo = v;
    if (k === 'guest') e.allowGuest = v === '利用する';
  }
  return e;
}

function pendingRow(a: ApplicationWithEdits, cur: (k: string) => string): Pending {
  const who = applicantOf(a);
  return { no: a.id, kind: a.kind, at: a.requestedAt.slice(0, 10), from: fromOf(a), what: whatOf(a), who: who.who, acct: who.acct, items: itemsOf(a, cur) };
}

/** 承認待ちの申請（拠点情報の変更は pinfo、ほかは pend） */
function pendingOf(apps: ApplicationWithEdits[], siteId: string, cur: (k: string) => string) {
  let pinfo: Pending | null = null, pend: Pending | null = null;
  for (const a of apps) {
    if (a.type !== 'change' || !OPEN.includes(a.status) || !a.results.some((x) => x.branchId === siteId && x.result === '')) continue;
    if (a.kind === '拠点情報の変更') pinfo ??= pendingRow(a, cur); else pend ??= pendingRow(a, cur);
  }
  return { pinfo, pend };
}

/** 法人情報の承認待ち（法人情報の変更） */
export function corpPending(r: DocRepo, corpId: string, cur: (k: string) => string): Pending | null {
  const a = corpApps(r, corpId).find((x) => x.kind === '法人情報の変更' && OPEN.includes(x.status) && x.results.some((y) => y.branchId === corpId && y.result === ''));
  return a ? pendingRow(a, cur) : null;
}

/** 申請の一覧の行。sites＝見えている拠点、corp＝法人あての申請・拠点を追加も出す（法人アカウント） */
export function reqRowsOf(r: DocRepo, corpId: string, sites: { id: string; name: string }[], corp: { name: string } | null): ReqRow[] {
  const rows: ReqRow[] = [];
  for (const a of corpApps(r, corpId)) {
    const who = applicantOf(a), date = a.requestedAt.slice(0, 10);
    if (a.type === 'new') {
      const site = sites.find((s) => a.branchIds.includes(s.id));
      if (!site && !corp) continue;
      const st = NEW_ST[a.status] ?? 'ESキッチンが確認中';
      const kind = a.requestedBy.site === 'corp' && a.branchNames.length ? '拠点を追加' : a.kubun === 'お試し' ? 'お試しのお申し込み' : '新規のお申し込み';
      rows.push({
        r: [a.id, kind, date, who.cell, cycText(a.startCycle), whatOf(a), st, a.status === '却下' ? a.reason || '—' : '—', '—'], st,
        site: site ? { id: site.id, name: site.name } : { id: '—', name: a.branchNames.join('・') || '—' }, acct: who.acct,
      });
      continue;
    }
    for (const x of a.results) {
      const isCorp = x.branchId === corpId;
      const site = isCorp ? (corp ? { id: corpId, name: corp.name + '（法人）', corp: true } : null) : sites.find((s) => s.id === x.branchId);
      if (!site) continue;
      const st = ST_OF[x.result];
      rows.push({
        r: [a.id, a.kind, date, who.cell, fromOf(a), whatOf(a), st, x.result === 'ng' ? x.reason.replace(/^その他（下に詳しく書く）：/, '') || '—' : '—', x.result === 'wd' ? x.at || '—' : '—'],
        st, site: { id: site.id, name: site.name, ...(isCorp ? { corp: true } : {}) }, acct: who.acct, ...(a.kind === '拠点情報の変更' ? { info: true } : {}),
      });
    }
  }
  return rows.sort((p, q) => (p.r[2] < q.r[2] ? 1 : p.r[2] > q.r[2] ? -1 : 0));
}

/* ---------------- 拠点の値 ---------------- */
export function siteView(r: DocRepo, b: Branch): SiteView {
  const ct = contractOf(r, b.id);
  const corp = b.corpId ? r.get<Corp>('dm.org.corps', b.corpId) : undefined;
  const kids = childrenOf(r, ct?.id);
  const cur = currentOf(kids);
  const pauses = pausesOf(r, ct?.id);
  const loans = r.list<Loan>('dm.org.loans').filter((l) => l.branchId === b.id);
  const ex = SITE_EXTRA[b.id] ?? NO_EXTRA;
  const trial = ct?.kind === 'お試しキャンペーン';
  const term = termOf(r, ct, loans);
  const band = bandOf(pauses);
  const lead = (ct?.billing ?? corp?.billing)?.lead ?? -1;
  const status = siteStatus(b, ct);
  const esqr = kids.filter((x) => x.app.allowEsqr).map((x) => x.cycleMonth).sort();
  const trialKids = kids.filter((x) => x.kind === 'お試しキャンペーン').map((x) => x.cycleMonth).sort();
  const extMonths = (ct?.trialExt ?? []).reduce((n, e) => n + e.months, 0);
  /* 「お試し 10月＋延長 11月」（お試しの月と延長の月：受付簿 No.53） */
  const trialLabel = trialMonthsLabel(trialKids, (ct?.trialExt ?? []).flatMap((e) => e.childIds.map((id) => id.slice(-6)).map((x) => `${x.slice(0, 4)}-${x.slice(4)}`)));
  const cycle = (c: string) => r.get<Cycle>('dm.delivery.cycles', c);
  const vend = cur?.course === 'ESライト（自販機）' || loans.some((l) => l.modelId.startsWith('VM') && l.status !== '回収済');
  const dstd = cur?.channels[0]?.slots.length ?? 1;
  const susUsed = pauses.filter((p) => !isOpenPause(p)).reduce((s, p) => s + monthsOf(p.fromCycle, p.toCycle), 0);
  const pausedNow = band && !band.at ? pauses.filter((x) => x.toCycle >= NOW_CYC).pop() : undefined;
  const firstDl = r.list<Delivery>('dm.delivery.deliveries').filter((d) => d.branchId === b.id && d.temp !== '資材' && d.status !== '取消').map((d) => d.deliverOn).sort()[0];
  const acct = r.get<Account>('dm.account.accounts', b.id);
  const ad = b.address;
  const view: SiteView = {
    id: b.id, order: 0,
    day: String(cur?.app.dailyCapMeals ?? 0), month: r.get<{ month: string }>(K.app, b.id)?.month ?? ex.monthCap,
    guest: cur?.app.allowGuest ? '利用する' : '利用しない', qr: cur?.app.allowEsqr ? '利用する（月額料金あり）' : '利用しない',
    qrHist: esqr.length ? `ESキッチンが ${ym(esqr[0])}から設定` : undefined,
    bill: siteBill(corp, ct),
    ct: {
      no: ct?.id ?? '—', kind: ct?.kind ?? '—', status: ct?.status ?? '—', startCyc: ct ? cycText(ct.startCycle) : '—',
      startOn: (ct && cycle(ct.startCycle)?.a1) || b.originalStartOn || '—',
      orig: b.originalStartOn ? `${ym(b.originalStartOn.slice(0, 7).replace('/', '-'))}（継続 ${duration(b.originalStartOn)}）` : '—',
      origYm: b.originalStartOn ? b.originalStartOn.slice(0, 7) : '—', dur: duration(b.originalStartOn), endOn: ct?.endOn || '—',
      trial: trial ? (extMonths ? trialLabel : `${trialKids.length}ヶ月（${ym(trialKids[0] ?? ct!.startCycle)}〜${cycText(trialKids[trialKids.length - 1] ?? ct!.startCycle)}）`) : '—（本導入のため）',
      switch: ct && ct.kindHistory.length > 1 ? `${cycText(ct.kindHistory[ct.kindHistory.length - 1].from)}から本導入（お試しから切替）` : trial ? '—（お試し中）' : '—（お試しからの切替ではありません）',
      plan: planText(r, cur), course: cur?.course ?? '—', dlv: dlvOf(cur), times: timesOf(cur), amt: cur ? yen(fixedYenOf(r, cur)) : '—',
      term: term.long, next: nextOf(kids, pauses, ct),
    },
    band, kids: kidsOf(r, kids, lead), loans: loanRows(r, loans, trial), opts: optRows(r, kids, ct), inv: siteInv(r, b, ct), files: ex.files, aps: [],
    kidInfo: { ...ex.kid, memo: b.deliveryNote || '—' },
    trialInfo: trial ? {
      from: cycText(trialKids[0] ?? ct!.startCycle), to: cycText(trialKids[trialKids.length - 1] ?? ct!.startCycle),
      first: firstDl ? `${firstDl} の便から` : 'まだお届けはありません',
      /* お試しの延長（運営だけが延長する・決定 T3：法人Web に出す。lib/domain/trial.ts） */
      ext: (ct!.trialExt ?? []).map((e) => [e.at.slice(0, 10), `${e.months}ヶ月延長（${ym(e.fromCycle)}〜${cycText(e.toCycle)}）`, '延長済', 'プラン料金を請求（お試しキャンペーン割引なし）']), decide: closeOf(addMonth(trialKids[trialKids.length - 1] ?? ct!.startCycle, 1)),
    } : undefined,
    apply: {
      term: term.short,
      ...(band?.at ? { block: ['plan', 'pause'], blockWhy: `${band.from}からの休止（${pauses.filter((x) => x.toCycle >= NOW_CYC).pop()?.applicationNo ?? '—'}）が承認済みのため、休止明けまで` } : {}),
      susUsed,
      cur: { ship: dlvOf(cur), dcount: `${timesOf(cur)}（プラン標準）`, ng: ex.kid.ng.join('／') || 'なし' },
      vend, dstd, dlvFee: amountOf(r, 'item.deliveryOver'),
      ...(pausedNow && cur ? { prev: { plan: `${planText(r, cur)}（${cur.course}）`, ship: dlvOf(cur), dcount: timesOf(cur), eq: pausedNow.keepEquipment ? '置いたまま' : '引き揚げ', bill: ct?.billTo === '法人' ? '法人に請求' : 'この拠点に請求' } } : {}),
    },
    name: b.name, kana: b.kana, emp: String(b.employees), note: b.note, status, created: b.registeredAt.slice(0, 10),
    zip: ad.zip, pref: ad.pref, city: ad.city, a1: ad.addr1, a2: ad.addr2, tel: b.tel, fax: b.fax,
    billTo: ct?.billTo ?? '法人', staff: staffOf(r, 'branch', b.id),
    acct: { login: acct?.loginId ?? b.id, last: acct?.lastLoginAt || '—' },
    pinfo: null, pend: null,
  };
  if (b.corpId) Object.assign(view, pendingOf(corpApps(r, b.corpId), b.id, (k) => String((view as unknown as Record<string, unknown>)[k] ?? '')));
  return view;
}

/* ---------------- 法人の値 ---------------- */
export function corpView(r: DocRepo, corpId: string) {
  const c = r.get<Corp>('dm.org.corps', corpId);
  if (!c) return null;
  const d: Record<string, string> = {
    name: c.name, cname: c.contractName, kana: c.kana, bname: c.billToName,
    zip: c.address.zip, pref: c.address.pref, city: c.address.city, a1: c.address.addr1, a2: c.address.addr2, tel: c.tel, fax: c.fax,
  };
  const staff = staffOf(r, 'corp', corpId);
  const brs = r.list<Branch>('dm.org.branches').filter((b) => b.corpId === corpId);
  const short = (b: Branch) => b.name.replace(c.name, '').trim() || b.name;
  const toCorp = brs.filter((b) => contractOf(r, b.id)?.billTo === '法人'), toSite = brs.filter((b) => contractOf(r, b.id)?.billTo === 'この拠点');
  const last = invoices(r).find((x) => x.corpId === corpId && x.branchId === null) ?? invoices(r).find((x) => x.corpId === corpId);
  const billMain = r.list<Contact>('dm.org.contacts').find((x) => x.owner.type === 'corp' && x.owner.id === corpId && x.kind === '請求担当者');
  const bill: CorpSeed['bill'] = {
    lead: LEAD[c.billing.lead], unit: c.billing.invoiceUnit, pay: c.billing.payMethod, debit: c.billing.payMethod === '口座振替' ? c.billing.debitStatus || '—' : '—（口座振替ではありません）',
    cycle: c.billing.payCycle, start: c.billing.payCycle === '月払い' ? '—（月払いのため）' : '—', due: c.billing.dueRule.replace('請求月', 'ご請求月'),
    now: last ? `${ym(last.issueMonth)}の請求書（${+last.issuedOn.slice(5, 7)}/${+last.issuedOn.slice(8, 10)} 発行）＝ ${cycText(last.cycleMonth)}分の固定額 ＋ ${last.actualPeriod} のご利用実績の精算` : 'まだ請求書はありません',
    split: `法人請求 ${toCorp.length}拠点${toCorp.length ? `（${toCorp.map(short).join('・')}）` : ''}／拠点請求 ${toSite.length}拠点${toSite.length ? `（${toSite.map(short).join('・')}）` : ''}`,
    to: billMain ? `請求担当者：${billMain.name} ／ ${billMain.email}` : '—（請求担当者がいません）',
  };
  return { corp: c, d, staff, name: c.name, status: c.status, bill, inv: corpInv(r, corpId) };
}
