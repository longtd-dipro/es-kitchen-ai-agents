import { trialMonthsLabel } from '@/lib/domain/trial';
import { closeOf, hasPendingSwitch, PENDING_SWITCH_WHY, pauseRowsOf } from '@/lib/domain/lifecycle';
import { invoiceTotals, taxTotal } from '@/lib/domain/invoiceTax';
import { today } from '@/lib/supplier/dates';
import { fixedYenOf } from '@/lib/ops/billing/fromDomain';
import type { DocRepo } from '../core/area';
import type {
  Account, Agency, Application, AuditLog, Billing, Branch as DBranch, Carrier, Channel, ChildContract as DChild, Contact, Contract, Corp as DCorp,
  Discount, Invoice, Loan, Model, Option, OrderPref, Pause, Plan, Warehouse,
} from '@/lib/domain/types';
import { optionAmount, TRIAL_DISCOUNT } from '@/lib/domain/charges';
import { addM, BR_MSG, cellText, FORMS, flatOpts, jpM, toRow, type AmountDeadline, type BranchOps } from './logic';
import { SLOT_ROUTE_TABLE } from './forms';
import type { Branch, Cell, ChildContract, Corp, Entity, FormFill, FormVal, RouteSite, SelOpt, TableRow } from './types';

/*
 * 共通データ（lib/domain・dm.org.*／dm.master.*／dm.apply.*／dm.billing.*／dm.account.*）から、
 * 運営Web の法人・拠点・子契約の画面の形（Corp・Branch・ChildContract と、その form）を作る。
 *
 * form（詳細画面の値）は、共通データにある項目だけをここで作る。共通データにない項目（社内備考・配送番号・
 * 運営メモ・変更履歴の表など）は forms.ts の見本の値のまま。運営が直したその項目の値だけを contracts.extra に持つ。
 */

/** 運営だけの値（共通データにない項目）。id＝<entity>:<ID> */
export const EXTRA = 'contracts.extra';
type Extra = { id: string; form: FormFill };
export const extraOf = (r: DocRepo, e: Entity, id: string): FormFill => r.get<Extra>(EXTRA, `${e}:${id}`)?.form ?? {};
export const putExtra = (r: DocRepo, e: Entity, id: string, form: FormFill) => r.put<Extra>(EXTRA, `${e}:${id}`, { id: `${e}:${id}`, form });

/**
 * 契約変更の受付の締切＝そのサイクル月のオーダー締切（サイクル暦の値。なければ前月15日）。今日が締切より後なら passed（締切の日までは受け付ける。lifecycle.effectiveStart と同じ判定）。
 * 請求済・確定の子契約で金額に効く項目を直せるかの判定（E54・logic.amountBlock）に使う
 */
export const deadlineOf = (r: DocRepo, ym: string): AmountDeadline => { const closeOn = closeOf(r, ym); return { ym, closeOn, passed: today() > closeOn }; };

/** 今のサイクル月（今日が属する月。YYYY-MM） */
export const thisMonth = () => today().slice(0, 7).replace('/', '-');

/* ---------- 共通データをまとめて読む ---------- */

export type Ctx = ReturnType<typeof load>;
/** 読み取りの使い回し：root と stamp が同じ（lib/domain/csv.ts の重ねた DocRepo。CSV取込の確かめ）なら前の結果を返す。普通の DocRepo は毎回読む */
const LISTS = new WeakMap<object, Map<string, { s: number; v: unknown }>>();
export function load(r: DocRepo) {
  const sr = r as DocRepo & { root?: object; stamp?: (kind: string) => number };
  const memo = sr.root && sr.stamp ? (LISTS.get(sr.root) ?? LISTS.set(sr.root, new Map()).get(sr.root)!) : null;
  const memoOf = <T,>(key: string, kinds: string[], make: () => T): T => {
    if (!memo) return make();
    const s = kinds.reduce((a, k) => Math.max(a, sr.stamp!(k)), 0);
    const hit = memo.get(key);
    if (hit && hit.s === s) return hit.v as T;
    const v = make();
    memo.set(key, { s, v });
    return v;
  };
  const l = <T,>(k: string) => memoOf<T[]>(k, [k], () => r.list<T>(k));
  const CH = 'dm.org.childContracts';
  const byMonthDesc = (a: DChild, b: DChild) => (a.cycleMonth < b.cycleMonth ? 1 : a.cycleMonth > b.cycleMonth ? -1 : 0);
  return {
    corps: l<DCorp>('dm.org.corps'), branches: l<DBranch>('dm.org.branches'), contracts: l<Contract>('dm.org.contracts'),
    /* 取り消した子契約（休止・解約・canceled）は一覧・今の契約に出さない（決定 28-12。休止の帯で期間を出す） */
    children: memoOf('children', [CH], () => l<DChild>(CH).filter((c) => !c.canceled).sort(byMonthDesc)),
    contacts: l<Contact>('dm.org.contacts'), pauses: l<Pause>('dm.org.pauses'), loans: l<Loan>('dm.org.loans'), agencies: l<Agency>('dm.org.agencies'),
    accounts: l<Account>('dm.account.accounts'), apps: l<Application>('dm.apply.applications'), invoices: l<Invoice>('dm.billing.invoices'),
    plans: l<Plan>('dm.master.plans'), models: l<Model>('dm.master.models'), options: l<Option>('dm.master.options'), discounts: l<Discount>('dm.master.discounts'),
    warehouses: l<Warehouse>('dm.master.warehouses'), carriers: l<Carrier>('dm.master.carriers'),
    /* 拠点の注文の設定（基準数のパターン＝allowShortLife。REQ-CT-300） */
    prefs: l<OrderPref>('dm.order.prefs'),
    /* 操作の記録（金額の上書きなどの変更履歴） */
    audit: l<AuditLog>('dm.account.audit'),
    /* 取り消した子契約も含む全部（子契約一覧は取消を灰で出す） */
    allChildren: memoOf('allChildren', [CH], () => [...l<DChild>(CH)].sort(byMonthDesc)),
    /* 休止期間の行（lifecycle.pauseRowsOf）・承認待ちの切替申請 */
    pauseRows: (contractId: string) => pauseRowsOf(r, contractId),
    pendingSwitch: (branchId: string) => hasPendingSwitch(r, branchId),
    /* 当月請求額（税抜）＝① 固定額（前払い）の合計。値引きを引く＝請求の画面の固定額と同じ（lib/ops/billing/fromDomain.ts fixedYenOf） */
    fixedYen: (k: DChild) => fixedYenOf(r, k),
  };
}
/** ID で1件探す。配列ごとに索引（Map）を1回だけ作る（CSV取込のように1行ごとに探すとき、線形に探すと件数×行数で遅い）。同じ ID が重なれば先のもの（find と同じ） */
const INDEX = new WeakMap<object, Map<string, unknown>>();
export const byId = <T extends { id: string }>(xs: T[], id: string | null | undefined): T | undefined => {
  if (!id) return undefined;
  let m = INDEX.get(xs);
  if (!m) { m = new Map(); for (const x of xs) if (!m.has(x.id)) m.set(x.id, x); INDEX.set(xs, m); }
  return m.get(id) as T | undefined;
};
/*
 * 実データがある項目は実データ、なければ見本の値のまま（台帳 E 2026-10-05・受付簿 No.49 の確認）。
 * 操作の記録（dm.account.audit）を変更履歴の表の行にする
 */
/** 画面設計書の見本の履歴の行がある法人・拠点（forms.ts）。ほかの法人・拠点には見本の行を出さない */
const SAMPLE_CORP = 'CU00001', SAMPLE_BRANCH = 'CU00643';
const auditRows = (cx: Ctx, targets: string[]) => cx.audit.filter((x) => targets.includes(x.target)).reverse();
/** 企業負担額・税率（子契約の ① 費目の写しのプラン料金の2行から） */
function welfareText(cx: Ctx, k: DChild) {
  const pl = (k.fees?.lines ?? []).filter((l) => l.src === 'plan');
  if (pl.length < 2) return undefined;
  const [base, wel] = pl, plan = byId(cx.plans, k.planId);
  return `企業負担額 ${(plan?.welfareYenPerMeal ?? 100).toLocaleString('ja-JP')}円（税込・1食）× 月次提供上限 ${k.fees?.meals ?? plan?.monthlyMeals ?? 0}食 → 企業負担分 ${yen(wel.amountYen)}（${wel.taxRate}%）＋ 基本料金 ${yen(base.amountYen)}（${base.taxRate}%）（${plan?.name ?? k.planId} ${k.course} ${yen(base.amountYen + wel.amountYen)}）`;
}
/** 解約時の回収額：貸出中の設備の機種マスタの回収額（ある機種だけ） */
function recoveryText(cx: Ctx, branchId: string) {
  const xs = cx.loans.filter((l) => l.branchId === branchId && l.status === '貸出中').flatMap((l) => {
    const m = byId(cx.models, l.modelId);
    return m?.recoveryYen ? [`${l.id} ${m.id} ${m.name}：${yen(m.recoveryYen)}${l.qty > 1 ? ` × ${l.qty}台` : ''}`] : [];
  });
  return xs.length ? xs.join('／') : undefined;
}
/* 拠点→親契約・親契約→子契約の索引（配列ごとに1回だけ作る。CSV取込で1行ごとに探すとき、線形に探さない。順序は元の配列のまま） */
const BY_BRANCH = new WeakMap<object, Map<string, Contract>>();
const contractOf = (cx: Ctx, branchId: string) => {
  let m = BY_BRANCH.get(cx.contracts);
  if (!m) { m = new Map(); for (const c of cx.contracts) if (!m.has(c.branchId)) m.set(c.branchId, c); BY_BRANCH.set(cx.contracts, m); }
  return m.get(branchId);
};
const BY_CONTRACT = new WeakMap<object, Map<string, DChild[]>>();
/** 親契約の子契約（新しい順） */
const kidsOf = (cx: Ctx, contractId: string): DChild[] => {
  let m = BY_CONTRACT.get(cx.children);
  if (!m) { m = new Map(); for (const c of cx.children) { const xs = m.get(c.contractId); if (xs) xs.push(c); else m.set(c.contractId, [c]); } BY_CONTRACT.set(cx.children, m); }
  return m.get(contractId) ?? [];
};
/** 今のサイクル月の子契約（なければいちばん新しいもの） */
export const currentOf = (cx: Ctx, contractId: string) => { const k = kidsOf(cx, contractId); return k.find((c) => c.cycleMonth === thisMonth()) ?? k[0]; };

/* ---------- 表示の形 ---------- */

export { yen } from '@/lib/format/money';
import { yen } from '@/lib/format/money';
const LEAD: Record<string, string> = { '-3': '3ヶ月前（−3）', '-2': '2ヶ月前（−2）', '-1': '1ヶ月前（−1）', '0': '当月（0）', '1': '翌月（+1・後払い）' };
export const leadOpt = (n: number) => LEAD[String(n)] ?? LEAD['-1'];
export const leadOfOpt = (s: string): Billing['lead'] | null => {
  const m = /^(\d)ヶ月前/.exec(s);
  return m ? (-Number(m[1]) as Billing['lead']) : /^当月/.test(s) ? 0 : /^翌月/.test(s) ? 1 : null;
};
const leadList = (n: number) => (n < 0 ? `${-n}ヶ月前請求` : n === 0 ? '0ヶ月前請求' : '翌月請求');
/** 2026/10/05 08:40 → 2026年10月5日 08:40:00 */
const jpDateTime = (s: string) => {
  const m = /^(\d{4})\/(\d{2})\/(\d{2})(?: (\d{2}:\d{2}))?/.exec(s ?? '');
  return m ? `${m[1]}年${+m[2]}月${+m[3]}日 ${m[4] ?? '00:00'}:00` : '—';
};
const planName = (cx: Ctx, id: string) => byId(cx.plans, id)?.name ?? id;
/** 拠点ステータス（休止は拠点に持たない＝契約ステータスの利用休止。台帳 F 2026-10-05） */
const branchStateOf = (b: DBranch, _ct?: Contract): Branch['status'] => b.status;
const corpLabel = (c?: DCorp) => (c ? `${c.id} ${c.name}` : '（法人なし）');
/** 法人・拠点のアカウントの状態（運営の画面の言い方） */
const accLabel = (a?: Account) => (!a ? '未発行' : a.status === '有効' ? (a.lastLoginAt ? 'ログイン済' : '発行済（ログイン前）') : a.status === '発行済（ログイン前）' ? '発行済（ログイン前）' : ['利用停止', '無効'].includes(a.status) ? '停止中' : a.status);
const contactRows = (cx: Ctx, type: 'corp' | 'branch', id: string) =>
  cx.contacts.filter((c) => c.owner.type === type && c.owner.id === id).map((c) => [c.kind, c.name, c.kana, c.email, c.tel, '']);
/** 担当者の表（画面の行）→ 共通データの担当者 */
export const contactsFromRows = (rows: TableRow[]) =>
  rows.flatMap((r) => ('c' in r ? [r.c.map(cellText)] : [])).filter((c) => c.slice(1, 5).some((x) => x.trim()))
    .map((c) => ({ kind: c[0] as Contact['kind'], name: c[1], kana: c[2], email: c[3], tel: c[4] }));
const addressFill = (a: DBranch['address'], tel: string, fax: string, sfx = '') => ({
  [`郵便番号${sfx}`]: a.zip, [`都道府県${sfx}`]: a.pref, [`市区町村${sfx}`]: a.city, [`町名・番地${sfx}`]: a.addr1, [`建物等${sfx}`]: a.addr2,
  [`電話番号${sfx}`]: tel, [`FAX番号${sfx}`]: fax,
});
export const addressOf = (v: Record<string, FormVal>, sfx = '') => {
  const s = (n: string) => String(v[n + sfx] ?? '');
  return { address: { zip: s('郵便番号'), pref: s('都道府県'), city: s('市区町村'), addr1: s('町名・番地'), addr2: s('建物等') }, tel: s('電話番号'), fax: s('FAX番号') };
};
const billingFill = (b: Billing) => ({
  支払方法: b.payMethod, 口座振替の手続きステータス: b.debitStatus || '—', 支払サイクル: b.payCycle, 入金期限: b.dueRule, 'Bill One 発行先ID': b.billonePayerId || '—',
});
/** 請求の欄（画面）→ 共通データの請求条件 */
export function billingOf(base: Billing, v: Record<string, FormVal>): Billing {
  const s = (n: string) => String(v[n] ?? '');
  const dash = (x: string) => /^—/.test(x);
  return {
    ...base,
    payMethod: dash(s('支払方法')) ? base.payMethod : (s('支払方法') as Billing['payMethod']),
    debitStatus: dash(s('口座振替の手続きステータス')) ? '' : (s('口座振替の手続きステータス') as Billing['debitStatus']),
    payCycle: dash(s('支払サイクル')) ? base.payCycle : (s('支払サイクル') as Billing['payCycle']),
    dueRule: (/翌月/.test(s('入金期限')) ? '請求月の翌月27日' : '請求月の27日'),
    billonePayerId: dash(s('Bill One 発行先ID')) ? '' : s('Bill One 発行先ID'),
  };
}

/* ---------- 請求書・申請の表 ---------- */

const invStatus = (i: Invoice) => (i.carriedTo ? `${i.status}（${i.carriedTo} で再請求）` : i.status);
const sumOf = (ls: Invoice['lines'], k: string) => ls.filter((l) => l.kind === k).reduce((a, l) => a + l.amountYen, 0);
/* 税率ごとに合計して四捨五入（税率マスタのどの率でも：lib/domain/invoiceTax.ts） */
const taxOf = (ls: Invoice['lines']) => invoiceTotals(ls).byRate.reduce((a, b) => a + b.tax, 0);
const corpInvoices = (cx: Ctx, corpId: string) => cx.invoices.filter((i) => i.corpId === corpId).sort((a, b) => b.id.localeCompare(a.id)).map((i) => {
  const post = sumOf(i.lines, '後払い');
  const n = new Set(i.lines.map((l) => l.branchId)).size;
  return [i.id, i.issuedOn, i.issueMonth, i.branchId ? byId(cx.branches, i.branchId)?.name ?? i.branchId : '法人', `${n}拠点`, yen(sumOf(i.lines, '前払い')), `${i.cycleMonth} サイクル分`,
    post ? yen(post) : '—', post ? i.actualPeriod || '—' : '—', yen(taxTotal(i)), yen(i.total) + (i.carried ? `（再請求 ${yen(i.carried)} を含む）` : ''), i.dueOn, invStatus(i)];
});
const branchInvoices = (cx: Ctx, branchId: string) => cx.invoices.filter((i) => i.lines.some((l) => l.branchId === branchId)).sort((a, b) => b.id.localeCompare(a.id)).map((i) => {
  const ls = i.lines.filter((l) => l.branchId === branchId && l.kind !== '繰越');
  const post = sumOf(ls, '後払い');
  const tax = taxOf(ls);
  return [i.id, i.issuedOn, i.issueMonth, yen(sumOf(ls, '前払い')), `${i.cycleMonth} サイクル分`, post ? yen(post) : '—', post ? i.actualPeriod || '—' : '—', yen(tax),
    yen(ls.reduce((a, l) => a + l.amountYen, 0) + tax), i.dueOn, invStatus(i)];
});
const RESULT: Record<string, string> = { '': '運営が確認中', ok: '承認済', ng: '却下', wd: '取り下げ' };
const appRows = (cx: Ctx, branchId: string) => cx.apps.filter((a) => a.branchIds.includes(branchId)).sort((a, b) => b.requestedAt.localeCompare(a.requestedAt)).map((a) => {
  const res = a.results.find((x) => x.branchId === branchId);
  const st = a.type === 'new' ? a.status : RESULT[res?.result ?? ''];
  return [a.id, a.type === 'new' ? '新規のお申し込み' : a.kind, a.requestedAt.slice(0, 10), a.requestedBy.name, a.startCycle || '—',
    a.request.map(([k, v]) => `${k}：${v}`).join('・') || '—', st, res?.by ? `${byId(cx.accounts, res.by)?.name ?? res.by} ${res.at}` : '—', res?.result === 'ng' ? res.reason || '—' : '—', res?.result === 'wd' ? res.at || '—' : '—'];
});
/** 仮登録の間の新規申込（契約申請管理の申請詳細で編集する） */
const apNoOf = (cx: Ctx, corpId: string | null, branchId?: string) =>
  cx.apps.find((a) => a.type === 'new' && ['受付中', '契約設定中'].includes(a.status) && (branchId ? a.branchIds.includes(branchId) : a.corpId === corpId))?.id;
/** 承認待ちの変更申請で、子契約の承認後に変えられる項目（決定 TL-1） */
const PEND_FIELDS: Partial<Record<string, string[]>> = {
  プランの変更: ['プランID', 'メニュー種別（コース）'], 配送の変更: ['配送区分', '納品不可曜日', '納品予定日になった場合'],
};
const pendingOf = (cx: Ctx, branchId: string): Branch['pending'] => {
  const a = cx.apps.find((x) => x.type === 'change' && PEND_FIELDS[x.kind] && x.results.some((y) => y.branchId === branchId && y.result === ''));
  return a ? { no: a.id, kind: a.kind, fields: PEND_FIELDS[a.kind]! } : undefined;
};

/** 承認待ちの申請（変更申請で、この拠点の結果がまだ出ていないもの）。所属法人の付け替え・本導入への切替の前提 */
export const pendingAppOf = (cx: Ctx, branchId: string) => cx.apps.find((x) => x.type === 'change' && x.results.some((y) => y.branchId === branchId && y.result === ''));
/** 契約種別の履歴の表（新しいものが上。開始＝その月の1日、終了＝次の種別の開始の前日。今の種別の終了は空） */
const kindRows = (ct: Contract): string[][] => {
  const day = (ym: string) => (/^\d{4}-\d{2}$/.test(ym) ? `${ym}-01` : ym);
  const before = (ym: string) => (/^\d{4}-\d{2}$/.test(ym) ? new Date(Date.UTC(+ym.slice(0, 4), +ym.slice(5) - 1, 0)).toISOString().slice(0, 10) : ym);
  const h = ct.kindHistory;
  return h.map((x, i): string[] => [x.kind, day(x.from), h[i + 1] ? before(h[i + 1].from) : '']).reverse();
};
/** 拠点の別操作（所属法人の付け替え・本導入への切替）の状態。空の文字＝できる、それ以外＝できない理由 */
export function branchOpsOf(cx: Ctx, b: DBranch): BranchOps {
  const ct = contractOf(cx, b.id);
  const pend = pendingAppOf(cx, b.id);
  const billed = cx.invoices.some((i) => i.status !== '取消' && i.lines.some((l) => l.branchId === b.id)) || cx.children.some((k) => k.branchId === b.id && (k.billStatus === '確定' || k.billStatus === '請求済'));
  /* お試し割引（DC000013）は1法人1回：お試しの拠点（割引の子契約がある・お試しの契約）は、割引をもう使っている拠点がいる法人へ付け替えられない */
  const usesTrial = (id: string) => cx.children.some((k) => k.branchId === id && k.discountIds.includes(TRIAL_DISCOUNT));
  const mine = ct?.kind === 'お試しキャンペーン' || usesTrial(b.id);
  /* 切替・延長は、本登録の拠点で契約が有効のときだけ（仮登録・閉鎖予定・閉鎖・取消・利用休止・解約手続き中・終了は不可。取消 I107・閉鎖 I108 を先に出す） */
  const state = b.status === '取消' ? BR_MSG.I107 : b.status === '閉鎖' ? BR_MSG.I108 : '';
  const live = b.status === '本登録' && ct?.status === '有効' ? '' : BR_MSG.NEW_OP_STATE;
  return {
    /* 取消・閉鎖の拠点は参照のみ（閉鎖は担当者・請求書の送り先メールだけ編集できる）なので、付け替えもできない（I107・I108） */
    reassign: b.status === '取消' ? BR_MSG.I107 : b.status === '閉鎖' ? BR_MSG.NEW_REASSIGN_CLOSED : billed ? BR_MSG.I105 : pend ? BR_MSG.I102(pend.id) : '',
    switch: state || (ct?.kind !== 'お試しキャンペーン' ? BR_MSG.I106 : live || (cx.pendingSwitch(b.id) ? PENDING_SWITCH_WHY : pend ? BR_MSG.I102(pend.id) : '')),
    extend: state || (ct?.kind !== 'お試しキャンペーン' ? BR_MSG.I109 : live),
    /* 休止予定（承認済み・まだ始まっていない休止の開始月）。契約ステータスの値は有効のままで、詳細の表示だけ『休止予定』にする（台帳 F 2026-10-06 (4)・Q12） */
    pauseSoon: ct?.status === '有効' ? cx.pauseRows(ct.id).filter((p) => p.state === '休止予定').map((p) => p.fromCycle).sort()[0] : undefined,
    corps: cx.corps.filter((c) => c.id !== b.corpId && (c.status === '正式登録' || c.status === '休眠')).map((c) => {
      const used = mine && cx.branches.some((x) => x.corpId === c.id && x.id !== b.id && usesTrial(x.id));
      return { id: c.id, name: c.name, ...(used ? { block: BR_MSG.NEW_TRIAL_USED(`${c.id} ${c.name}`) } : {}) };
    }),
  };
}

/* ---------- 法人 ---------- */

export function corpFill(cx: Ctx, c: DCorp): FormFill {
  const acc = byId(cx.accounts, c.id);
  const brs = cx.branches.filter((b) => b.corpId === c.id);
  return {
    法人名: c.name, '法人名（契約）': c.contractName, 法人名フリガナ: c.kana, 請求先法人名: c.billToName, ES営業担当: byId(cx.accounts, c.salesRepId)?.name ?? '',
    法人ID: c.id, 法人ステータス: c.status, ...addressFill(c.address, c.tel, c.fax, '（請求書に載る住所）'),
    '#担当者（テーブル）': contactRows(cx, 'corp', c.id),
    'ログインID（法人ID）': acc?.loginId ?? c.id, アカウントのステータス: accLabel(acc), 最終ログイン日時: jpDateTime(acc?.lastLoginAt ?? ''),
    請求書発行リードタイム: leadOpt(c.billing.lead), 請求書の発行単位: c.billing.invoiceUnit, ...billingFill(c.billing),
    '#一覧（発行した請求書）': corpInvoices(cx, c.id),
    '#一覧': brs.map((b) => {
      const ct = contractOf(cx, b.id);
      const cur = ct ? currentOf(cx, ct.id) : undefined;
      const off = !cur || ct?.status === '利用休止';
      return [b.id, b.name, b.status, ct?.id ?? '—', ct?.kind ?? '—', ct?.status ?? '—', off ? `—${ct?.status === '利用休止' ? '（休止中）' : ''}` : planName(cx, cur.planId),
        off ? '—' : jpM(addM(cur.cycleMonth, -1)), off ? '—' : yen(cx.fixedYen(cur)), `${ct ? kidsOf(cx, ct.id).length : 0}件`];
    }),
    /* 変更履歴：法人・配下の拠点・契約の操作の記録（あれば。なければ見本の行のまま：受付簿 No.49） */
    ...((() => {
      const cts = cx.contracts.filter((x) => brs.some((b) => b.id === x.branchId));
      const kids = cx.children.filter((x) => cts.some((y) => y.id === x.contractId));
      const kind = (t: string) => (t === c.id ? '法人' : brs.some((b) => b.id === t) ? '拠点' : cts.some((y) => y.id === t) ? '親契約' : '子契約');
      const rows = auditRows(cx, [c.id, ...brs.map((b) => b.id), ...cts.map((x) => x.id), ...kids.map((x) => x.id)]);   /* 付け替えは元の法人（target＝法人ID）にも記録される */
      const out: FormFill = {};
      /* 見本の履歴の行は見本の法人（CU00001）だけ。ほかの法人は実際の記録だけ（なければ空） */
      if (rows.length || c.id !== SAMPLE_CORP) out['#履歴（配下の拠点・契約の参照）'] = rows.map((x): string[] => [x.at, kind(x.target), x.target, x.detail, x.accountId, '—', '—', '—']);
      return out;
    })()),
    '@請求書発行リードタイム': leadOpt(c.billing.lead), '@請求書の発行単位': c.billing.invoiceUnit.replace(/（.*$/, ''), '@配下の拠点': `${brs.length}拠点`,
  };
}
export function corpRow(r: DocRepo, cx: Ctx, c: DCorp): Corp {
  return {
    id: c.id, name: c.name, status: c.status, invoiceUnit: c.billing.invoiceUnit, branchLabel: `${cx.branches.filter((b) => b.corpId === c.id).length}拠点`,
    invoiceLead: leadList(c.billing.lead), salesRep: byId(cx.accounts, c.salesRepId)?.name ?? '', registeredAt: c.registeredAt,
    apNo: c.status === '仮登録' ? apNoOf(cx, c.id) : undefined, form: { ...corpFill(cx, c), ...extraOf(r, 'corp', c.id) },
  };
}

/* ---------- 拠点（親契約つき） ---------- */

/** 拠点の「一覧（子契約）」の行（休止の帯つき。新しい順） */
function childTable(cx: Ctx, ct: Contract): TableRow[] {
  const rows: TableRow[] = kidsOf(cx, ct.id).map((k) => ({ c: childLine(cx, ct, k) }));
  for (const p of cx.pauseRows(ct.id)) {
    /* 終わりが未定の休止（移行の休止中）は期間の月数を出さない */
    const html = `<span class="bst">${p.state}</span><span class="bl">休止期間</span> <b>${p.voided ? `${p.fromCycle}（${p.label}）` : p.open ? `${p.fromCycle} 〜 未定` : `${p.fromCycle} 〜 ${p.toCycle}（${p.months}サイクル）`}</b><span class="bl">再開予定</span> <b>${p.resumeCycle || (p.open ? '未定' : '—')}</b>`
      + `<span class="bl">休止理由</span> ${p.reason || '—'}<span class="bl">休止中の設備</span> ${p.keepEquipment ? '置いたまま' : '引き揚げ'}<span class="bn">この期間は子契約を作りません</span>`;
    const at = rows.findIndex((x) => 'c' in x && cellText(x.c[0]) < p.fromCycle);
    rows.splice(at < 0 ? rows.length : at, 0, { band: { from: p.fromCycle, to: p.voided ? '' : p.toCycle, html } });
  }
  return rows;
}
/** 納品回数（温度帯が2つ以上のときは 冷蔵2回・冷凍2回） */
const shipCount = (k: DChild) => (k.channels.length > 1 ? k.channels.map((c) => `${c.temp}${c.slots.length}回`).join('・') : `${k.channels[0]?.slots.length ?? 0}回`);
const childLine = (cx: Ctx, ct: Contract, k: DChild): Cell[] =>
  [k.cycleMonth, '—', k.id, planName(cx, k.planId), ct.status, k.channels[0]?.serviceForm ?? '—', shipCount(k), jpM(addM(k.cycleMonth, -1)), yen(cx.fixedYen(k)), `${k.billStatus} ／ —`, k.gen];

function loanFill(cx: Ctx, branchId: string) {
  const ls = cx.loans.filter((l) => l.branchId === branchId);
  const out = (l: Loan) => (l.status === '回収済' ? 0 : l.qty);
  const by: Record<string, number> = {};
  for (const l of ls.filter((x) => x.status !== '回収済')) { const c = byId(cx.models, l.modelId)?.category ?? '設備'; by[c] = (by[c] ?? 0) + l.qty; }
  const total = Object.values(by).reduce((a, n) => a + n, 0);
  return {
    '回収未完了（アラート）': `${ls.filter((l) => l.status === '回収予定').length} 件`,
    '#貸出一覧': ls.map((l) => {
      const m = byId(cx.models, l.modelId);
      const end = m?.minMonths ? addM(l.startOn.slice(0, 7).replace('/', '-'), m.minMonths).replace('-', '/') + l.startOn.slice(7) : '—';
      return [l.id, m?.category ?? '—', `${l.modelId} ${m?.name ?? ''}`.trim(), '—', String(l.qty), String(l.qty - out(l)), String(out(l)), l.startOn, '—', '—', l.status, '—', end, '—', '', l.startOn];
    }),
    '貸出中 合計': `${total} 点` + (total ? `（${Object.entries(by).map(([k, n]) => `${k}${n}`).join('・')}）` : ''),
    '未返却 合計': `${ls.reduce((a, l) => a + out(l), 0)} 点`,
  };
}
/** 子契約のオプション・値引き（いつから付いているか）。amt＝金額（税抜・子契約の上書きを含む）、edit＝子契約ごとに金額を直せる（金額の種類＝契約ごと・ES-QR・すでに上書きがある） */
function optionLines(cx: Ctx, k: DChild) {
  const since = (pick: (x: DChild) => string[], id: string) => {
    let m = k.cycleMonth;
    for (const x of kidsOf(cx, k.contractId)) if (x.cycleMonth < k.cycleMonth && pick(x).includes(id) && x.cycleMonth < m) m = x.cycleMonth;
    return m;
  };
  return [
    ...k.optionIds.map((id) => {
      const o = byId(cx.options, id);
      const edit = !!o && ((o.amountKind === '契約ごと' || o.amountKind === '機種参照') || o.linkedItem === 'esqr' || k.amounts?.[id] !== undefined);
      return { kind: 'オプション', code: `${id} ${o?.mgmtName || o?.name || ''}`.trim(), amt: o ? `${yen(optionAmount(o, k))}${k.optionQty?.[id] && k.optionQty[id] > 1 ? ` × ${k.optionQty[id]}${o.unit || ''}` : ''}` : '—', from: since((x) => x.optionIds, id), edit };
    }),
    ...k.discountIds.map((id) => ({ kind: '値引き', code: `${id} ${byId(cx.discounts, id)?.name ?? ''}`.trim(), amt: '—', from: since((x) => x.discountIds, id), edit: false })),
  ];
}

export function branchFill(cx: Ctx, b: DBranch): FormFill {
  const corp = byId(cx.corps, b.corpId);
  const ct = contractOf(cx, b.id);
  const acc = byId(cx.accounts, b.id);
  const cur = ct ? currentOf(cx, ct.id) : undefined;
  const own = ct?.billTo === 'この拠点';
  const bill = (own && ct?.billing) || corp?.billing;
  /* お試しの期間（お試しの子契約の月）と延長（運営だけ・lib/domain/trial.ts） */
  const tk = ct?.kind === 'お試しキャンペーン' ? kidsOf(cx, ct.id).filter((k) => k.kind === 'お試しキャンペーン').map((k) => k.cycleMonth).sort() : [];
  const ext = ct?.trialExt ?? [];
  /* 「お試し 10月＋延長 11月」（受付簿 No.53。延長の月は請求） */
  const extYm = ext.flatMap((e) => e.childIds.map((id) => id.slice(-6)).map((x) => `${x.slice(0, 4)}-${x.slice(4)}`));
  const trial = ct?.kind === 'お試しキャンペーン'
    ? (ext.length ? `${trialMonthsLabel(tk, extYm)}（延長の月はプラン料金を請求）` : `${tk.length}ヶ月${tk.length ? `（${tk[0]}〜${tk[tk.length - 1]}）` : ''}`) : '—（本導入のため）';
  const agency = byId(cx.agencies, ct?.agencyId);
  return {
    拠点名: b.name, 拠点名フリガナ: b.kana, 所属法人: corpLabel(corp), 従業員数: String(b.employees), 当初契約開始年月: b.originalStartOn || '—',
    拠点ステータス: branchStateOf(b, ct), 備考: b.note, 棚卸報告: b.noStockCheck ? 'なし（棚卸なし）' : 'あり', 基準数のパターン: byId(cx.prefs, b.id)?.allowShortLife === false ? '短消費期限なし' : '通常', 拠点ID: b.id, ...addressFill(b.address, b.tel, b.fax),
    '#担当者（テーブル）': contactRows(cx, 'branch', b.id),
    ログインID: acc?.loginId ?? b.id, アカウントのステータス: accLabel(acc), 最終ログイン日時: jpDateTime(acc?.lastLoginAt ?? ''),
    ...(ct ? {
      契約種別: ct.kind, 契約ステータス: ct.status, 開始サイクル月: jpM(ct.startCycle), 契約終了日: ct.endOn || '—（解約の申し出なし）', 'お試し期間（月数）': trial,
      '代理店コード（紹介有無）': agency ? `${agency.id} ${agency.name}` : '（紹介なし）', '親契約番号（契約ID）': ct.id, 契約開始日: `${jpM(ct.startCycle)}（開始サイクル月）`,
      '#一覧（子契約）': childTable(cx, ct), '#契約種別の履歴': kindRows(ct), 請求先: ct.billTo,
    } : { '#一覧（子契約）': [], '#契約種別の履歴': [] }),
    ...loanFill(cx, b.id),
    '#オプション・割引（今のサイクル月）': cur ? optionLines(cx, cur).map((o) => [cur.id, o.kind, o.code, '1', o.amt, o.from, '—']) : [],
    '請求書発行リードタイムの上書き': own && bill ? leadOpt(bill.lead) : '—（法人に従う）',
    ...(bill ? billingFill(bill) : {}),
    '#一覧（この拠点の請求書）': branchInvoices(cx, b.id),
    '#申請履歴（法人Webからの変更申請）': appRows(cx, b.id),
    /* 変更履歴：拠点・親契約の操作の記録（あれば。なければ見本の行のまま：受付簿 No.49） */
    ...(auditRows(cx, [b.id, ...(ct ? [ct.id] : [])]).length || b.id !== SAMPLE_BRANCH ? { '#履歴（拠点・親契約）': auditRows(cx, [b.id, ...(ct ? [ct.id] : [])]).map((x): string[] => [x.at, x.detail, x.accountId, '—', '—', '—']) } : {}),
    '@所属法人': corpLabel(corp), '@当月請求額': cur && ct?.status !== '利用休止' ? yen(cx.fixedYen(cur)) : '—',
  };
}
export function branchRow(r: DocRepo, cx: Ctx, b: DBranch): Branch {
  const corp = byId(cx.corps, b.corpId);
  const ct = contractOf(cx, b.id);
  const cur = ct ? currentOf(cx, ct.id) : undefined;
  const start = ct?.startCycle ?? '';
  const months = start ? (+thisMonth().slice(0, 4) - +start.slice(0, 4)) * 12 + (+thisMonth().slice(5) - +start.slice(5)) : 0;
  return {
    id: b.id, name: b.name, corpId: b.corpId ?? '', corpName: corp?.name ?? '（法人なし）', status: branchStateOf(b, ct), parentNo: ct?.id ?? '',
    contractStatus: ct?.status ?? '—', contractKind: ct?.kind ?? '—',
    plan: ct?.status === '利用休止' ? '—（休止中）' : cur ? `${cur.planId} ${planName(cx, cur.planId)}` : '—',
    startYm: start.replace('-', '/') || '—', duration: start ? `${Math.floor(Math.max(0, months) / 12)}年${Math.max(0, months) % 12}ヶ月` : '—',
    billTo: ct?.billTo ?? '法人', addr: b.address.pref + b.address.city, registeredAt: b.registeredAt,
    apNo: b.status === '仮登録' ? apNoOf(cx, b.corpId, b.id) : undefined, pending: pendingOf(cx, b.id),
    form: { ...branchFill(cx, b), ...extraOf(r, 'branch', b.id) },
  };
}

/* ---------- 子契約 ---------- */

/** 運び手の名前（配送ルートの画面の言い方）。委託は（委託）、自社は selfName */
export const carrierLabel = (c: Carrier | undefined, selfName: string) =>
  !c ? '—' : c.kind === '自社' ? selfName : c.kind === '路線' ? c.name : /）$/.test(c.name) ? c.name.replace(/）$/, '・委託）') : `${c.name}（委託）`;
export const carrierByLabel = (cx: Ctx, label: string) => cx.carriers.find((c) => carrierLabel(c, '自社便') === label || carrierLabel(c, 'ES配送便（自社）') === label);
const TEMP_ROUTE: Record<string, string> = { 冷蔵: '冷蔵配送', 冷凍: '冷凍配送', 資材: '資材配送', 常温: '冷蔵配送' };
const sel = (v: string, opts: SelOpt[]): Cell => ({ t: 'sel', v, opts: flatOpts(opts).includes(v) ? opts : [...opts, v] });
const NO_HUB = 'なし（倉庫で受け取ってそのまま配送）';
/** 配送ルート設定の表の1行目（選択肢の元） */
const routeTpl = () => {
  const card = FORMS.child.tabs.flatMap((t) => t.cards).find((c) => c.title === '配送ルート設定（テーブル）');
  const t = card?.body.find((b) => b.t === 'table');
  return (t && t.t === 'table' ? t.rows.find((r) => 'c' in r) : undefined) as { c: Cell[] } | undefined;
};
function routeRows(cx: Ctx, k: DChild): TableRow[] {
  const tpl = routeTpl()?.c ?? [];
  const opts = (i: number) => { const c = tpl[i]; return c && typeof c !== 'string' && c.t === 'sel' ? c.opts : []; };
  return k.channels.map((ch) => {
    const wh = byId(cx.warehouses, ch.warehouseId);
    const hub = byId(cx.warehouses, ch.hubId);
    const c1 = byId(cx.carriers, ch.carrierId);
    return {
      c: [
        sel(TEMP_ROUTE[ch.temp], opts(0)), sel(`${ch.warehouseId} ${wh?.name ?? ''}`.trim(), opts(1)), sel(carrierLabel(c1, '自社便'), opts(2)),
        sel(carrierLabel(byId(cx.carriers, ch.carrier2Id), '自社便'), opts(3)), sel(hub ? `${hub.name}（${hub.id}）` : NO_HUB, opts(4)),
        { t: 'in', v: `${ch.leadDays} 日` }, { t: 'in', v: `${ch.slots.length} 回` }, sel('ESサイクル', opts(7)),
        { t: 'cyc', v: ch.slots, opts: (tpl[8] && typeof tpl[8] !== 'string' && tpl[8].t === 'cyc' ? tpl[8].opts : []) },
        { t: 'in', v: c1?.trackingUrl || '—（ES採番の送り状・リンクなし）' }, { t: 'del' },
      ],
    };
  });
}
/** 配送ルート設定の表 → 配送の流れ（ドライバー・食数は同じ行の元の値を残す。運び手を変えたらドライバーは外す） */
export function channelsFromRows(cx: Ctx, rows: TableRow[], old: Channel[], serviceForm: string): Channel[] {
  return rows.flatMap((r) => ('c' in r ? [r.c] : [])).map((c, i) => {
    const t = (n: number) => cellText(c[n] ?? '');
    const prev = old[i] ?? old[0];
    const c1 = carrierByLabel(cx, t(2));
    const c2 = carrierByLabel(cx, t(3));
    if (!c1) throw new Error(`配送会社「${t(2)}」が共通データの配送会社にありません`);
    /* 配送会社①②は常に必須。途中経由は「なし」を明示して選ぶ。中継しないときは①②に同じ会社（2026/10/03・REQ-DL-710） */
    if (!c2) throw new Error(t(3) ? `配送会社②「${t(3)}」が共通データの配送会社にありません` : '配送会社②を選んでください（中継しないときは①と同じ会社）');
    const hub = /（(HU\d{5})）/.exec(t(4))?.[1] ?? '';
    if (!hub && t(4) !== NO_HUB) throw new Error(t(4) ? `途中経由「${t(4)}」が共通データの中継先にありません` : '途中経由を選んでください（中継しないときは「なし」）');
    if (!hub && c2.id !== c1.id) throw new Error(`中継しないときは配送会社①②に同じ会社を入れてください（①「${t(2)}」・②「${t(3)}」）`);
    /* 中継があるときの区間1（倉庫→中継）は、中継を運営する会社か委託配送会社（課題 4b-7。一括変更と同じ決まり） */
    const hubOp = hub ? cx.warehouses.find((w) => w.id === hub)?.carrierId : '';
    if (hub && c1.id !== hubOp && c1.kind !== '委託・引き取り') throw new Error(`中継（${hub}）を通すときの運送会社（区間1）は、中継を運営する会社か委託配送会社を選んでください（「${t(2)}」は選べません）`);
    const temp = (t(0).replace('配送', '') || '冷蔵') as Channel['temp'];
    const slots = c[8] && typeof c[8] !== 'string' && c[8].t === 'cyc' ? c[8].v.filter(Boolean) : prev?.slots ?? [];
    return {
      temp, serviceForm: temp === '資材' ? '資材便' : (serviceForm as Channel['serviceForm']),
      regime: c1.kind === '路線' ? 'parcel_carrier' : c1.kind === '自社' ? 'self' : 'partner_driver',
      warehouseId: /^(WH\d{5})/.exec(t(1))?.[1] ?? prev?.warehouseId ?? '', hubId: hub, carrierId: c1.id, carrier2Id: c2.id,
      driverId: prev && prev.carrierId === c1.id ? prev.driverId : '', leadDays: Number(t(5).replace(/\D/g, '')) || prev?.leadDays || 1,
      slots, mealsPerDelivery: prev?.mealsPerDelivery ?? 0,
      /* 回ごとのルートの上書きは同じ温度帯の今の値を引き継ぐ（回ごとのルートの表で直す） */
      ...((x) => (x ? { slotRoutes: x } : {}))(old.find((o) => o.temp === temp)?.slotRoutes),
    };
  });
}

/** 回ごとのルートの表（上書きのある回だけ1行ずつ。2026/10/03 案B） */
function slotRouteRows(cx: Ctx, k: DChild): TableRow[] {
  const card = FORMS.child.tabs.flatMap((t) => t.cards).find((c) => c.title === SLOT_ROUTE_TABLE);
  const t = card?.body.find((b) => b.t === 'table');
  const tpl = (t && t.t === 'table' ? t.rows.find((r) => 'c' in r) : undefined) as { c: Cell[] } | undefined;
  const opts = (i: number) => { const c = tpl?.c[i]; return c && typeof c !== 'string' && c.t === 'sel' ? c.opts : []; };
  return k.channels.flatMap((ch) => Object.entries(ch.slotRoutes ?? {}).map(([slot, o]): TableRow => {
    const wh = byId(cx.warehouses, o.warehouseId), hub = byId(cx.warehouses, o.hubId);
    return { c: [
      sel(TEMP_ROUTE[ch.temp], opts(0)), sel(slot, opts(1)), sel(`${o.warehouseId} ${wh?.name ?? ''}`.trim(), opts(2)),
      sel(carrierLabel(byId(cx.carriers, o.carrierId), '自社便'), opts(3)), sel(carrierLabel(byId(cx.carriers, o.carrier2Id), '自社便'), opts(4)),
      sel(hub ? `${hub.name}（${hub.id}）` : NO_HUB, opts(5)), { t: 'del' },
    ] };
  }));
}
/** 回ごとのルートの表 → 便（温度帯）ごとの slotRoutes（決まりは配送ルートと同じ：①②必須・途中経由は「なし」を明示・中継しないときは①＝②） */
export function slotRoutesFromRows(cx: Ctx, rows: TableRow[], channels: Channel[]): Channel[] {
  const by = new Map<string, NonNullable<Channel['slotRoutes']>>();
  for (const c of rows.flatMap((r) => ('c' in r ? [r.c] : []))) {
    const t = (n: number) => cellText(c[n] ?? '');
    const temp = t(0).replace('配送', ''), slot = t(1), at = `回ごとのルート（${temp} ${slot}）`;
    const ch = channels.find((x) => x.temp === temp);
    if (!ch) throw new Error(`${at}：${temp}の便がありません`);
    if (!ch.slots.includes(slot)) throw new Error(`${at}：${slot} は${temp}の便の納品サイクルにありません`);
    const wh = /^(WH\d{5})/.exec(t(2))?.[1], c1 = carrierByLabel(cx, t(3)), c2 = carrierByLabel(cx, t(4));
    if (!wh) throw new Error(`${at}：ピッキング倉庫を選んでください`);
    if (!c1 || !c2) throw new Error(`${at}：配送会社①②を選んでください`);
    const hub = /（(HU\d{5})）/.exec(t(5))?.[1] ?? '';
    if (!hub && t(5) !== NO_HUB) throw new Error(`${at}：途中経由を選んでください（中継しないときは「なし」）`);
    if (!hub && c1.id !== c2.id) throw new Error(`${at}：中継しないときは配送会社①②に同じ会社を入れてください`);
    const m = by.get(temp) ?? {};
    if (m[slot]) throw new Error(`${at}：同じ回が2行あります`);
    m[slot] = { warehouseId: wh, hubId: hub, carrierId: c1.id, carrier2Id: c2.id, regime: c2.kind === '路線' ? 'parcel_carrier' : c2.kind === '自社' ? 'self' : 'partner_driver' };
    by.set(temp, m);
  }
  return channels.map((ch) => {
    const { slotRoutes: _old, ...rest } = ch;
    void _old;
    const m = by.get(ch.temp);
    return m ? { ...rest, slotRoutes: m } : rest;
  });
}

/** オプション・割引の表の1行目（入力欄・ドロップダウンの形） */
const optionTpl = () => {
  const card = FORMS.child.tabs.flatMap((t) => t.cards).find((c) => c.title === 'オプション・割引（このサイクル月）');
  const t = card?.body.find((b) => b.t === 'table');
  return (t && t.t === 'table' ? (t.rows.find((r) => 'c' in r) as { c: Cell[] } | undefined)?.c : undefined);
};

export function childFill(cx: Ctx, k: DChild): FormFill {
  const ct = byId(cx.contracts, k.contractId);
  const b = byId(cx.branches, k.branchId);
  const corp = byId(cx.corps, b?.corpId);
  const bill = (ct?.billTo === 'この拠点' && ct.billing) || corp?.billing;
  const ym = k.cycleMonth.replace('-', '/');
  return {
    プランID: `${k.planId}　${planName(cx, k.planId)}`, 'メニュー種別（コース）': k.course, 適用開始月: ym, 適用終了月: ym,
    /* 福利厚生の適用（28-150・既定 OFF・システム管理だけに見せる：台帳 E 2026-10-05） */
    福利厚生の適用: k.welfareOn ? 'ON' : 'OFF（既定 OFF）',
    ユーザー現金利用: k.app.allowCash ? '可' : '不可', '1日上限数（1人あたり）': String(k.app.dailyCapMeals), ゲストモード: k.app.allowGuest ? '利用する' : '利用しない',
    'ES-QR': k.app.allowEsqr ? '利用する（月額料金あり）' : '利用しない', 配送区分: k.channels.find((c) => c.temp !== '資材')?.serviceForm ?? 'ES配送便',
    配送備考: b?.deliveryNote ?? '', 設置フロア: b?.floor ?? '', '#配送ルート設定（テーブル）': routeRows(cx, k), [`#${SLOT_ROUTE_TABLE}`]: slotRouteRows(cx, k),
    '支払方法（スナップショット）': bill?.payMethod ?? '—', '支払サイクル（スナップショット）': bill?.payCycle ?? '—',
    /* 金額（税抜）は右寄せ。入力できるのは子契約ごとに直せるオプションだけ（金額の種類＝契約ごと・ES-QR・すでに上書きがある）。直した金額は子契約の amounts（REQ-CT-304） */
    '#オプション・割引（このサイクル月）': optionLines(cx, k).map((o): TableRow => {
      const row = toRow(optionTpl(), ['—（継続）', o.kind, o.code, '1', o.amt, o.from, '—', '', '', '']) as { c: Cell[] };
      row.c[4] = { t: 'in', v: o.amt, r: true, ...(o.edit ? {} : { ro: true }) };
      return row;
    }),
    /* 実データがあれば（なければ見本の値のまま：受付簿 No.49） */
    ...(welfareText(cx, k) ? { '企業負担額・税率（プランから）': welfareText(cx, k)! } : {}),
    ...(recoveryText(cx, k.branchId) ? { '解約時の回収額（上書き）': recoveryText(cx, k.branchId)! } : {}),
    /* 変更履歴：金額の上書きなど、この子契約の操作の記録（あれば。なければ見本の行のまま） */
    ...(cx.audit.some((x) => x.target === k.id) ? { '#履歴（子契約）': cx.audit.filter((x) => x.target === k.id).reverse().map((x): string[] => [x.at, x.detail, x.accountId, '手入力', `${k.cycleMonth} のみ`, '—', '—']) } : {}),
    '@拠点': b ? `${b.id} ${b.name}` : k.branchId, '@契約種別': k.kind, '@契約ステータス': ct?.status ?? '—',
    '@① 前払い': `${jpM(addM(k.cycleMonth, -1))}請求／${k.billStatus}`, '@合計（参考）': `${yen(cx.fixedYen(k))}（税抜）`,
  };
}
export function childRow(r: DocRepo, cx: Ctx, k: DChild): ChildContract {
  const b = byId(cx.branches, k.branchId);
  const corp = byId(cx.corps, b?.corpId);
  const ct = byId(cx.contracts, k.contractId);
  const ch = k.channels.filter((c) => c.temp !== '資材');
  const ship = ch.length > 1 ? `${ch[0].serviceForm} ${shipCount(k)}` : `${ch[0]?.serviceForm ?? '—'} 月${ch[0]?.slots.length ?? 0}回`;
  return {
    id: k.id, parentNo: k.contractId, branchId: k.branchId, corpId: corp?.id, ...(k.canceled ? { canceled: true } : {}), month: k.cycleMonth, branchName: b?.name ?? k.branchId, corpName: corp?.name ?? '（法人なし）',
    kind: k.kind, plan: `${k.planId} ${planName(cx, k.planId)}`, ship, billMonth: addM(k.cycleMonth, -1), amount: yen(cx.fixedYen(k)), amountYen: cx.fixedYen(k),
    billStatus: `${k.billStatus} ／ —`, gen: k.gen, apNo: ct?.status === '仮登録' && b ? apNoOf(cx, b.corpId, b.id) : undefined,
    form: { ...childFill(cx, k), ...extraOf(r, 'child', k.id) },
  };
}

/* ---------- 配送ルートの一括変更 ---------- */

/** 拠点ごとの配送ルート（今のサイクル月の子契約の1つめの流れ） */
export function routeSites(cx: Ctx): RouteSite[] {
  return cx.branches.flatMap((b) => {
    const ct = contractOf(cx, b.id);
    if (!ct || ['終了', '仮登録'].includes(ct.status)) return [];
    const k = currentOf(cx, ct.id);
    const ch = k?.channels.find((c) => c.temp !== '資材');
    if (!k || !ch) return [];
    const wh = byId(cx.warehouses, ch.warehouseId);
    const hub = byId(cx.warehouses, ch.hubId);
    return [{
      id: b.id, name: b.name, pref: b.address.pref, course: k.course, kind: [...new Set(k.channels.map((c) => c.temp))].join('・'),
      wh: `${ch.warehouseId} ${wh?.name ?? ''}`.trim(), c1: carrierLabel(byId(cx.carriers, ch.carrierId), 'ES配送便（自社）'),
      hub: hub ? `${hub.id} ${hub.name}` : '—', c2: carrierLabel(byId(cx.carriers, ch.carrier2Id), 'ES配送便（自社）'), lead: `${ch.leadDays}日`,
    }];
  });
}

/** 倉庫マスタ（ピッキング倉庫・中継先の選択肢） */
export const warehouseOpts = (cx: Ctx) => ({
  whs: cx.warehouses.filter((w) => w.type === 'picking' && w.status === '有効').map((w) => `${w.id} ${w.name}`),
  hubs: cx.warehouses.filter((w) => w.type === 'relay' && w.status === '有効').map((w) => `${w.id} ${w.name}`),
});
