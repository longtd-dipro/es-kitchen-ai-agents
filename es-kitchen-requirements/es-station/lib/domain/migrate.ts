import { ApiError } from '@/lib/api/errors';
import type { DocRepo } from '@/lib/ops/core/area';
import { nowStamp, today } from '@/lib/supplier/dates';
import { feesOf, childLocked, corpLimitHit } from './snapshot';
import { monthlyOptionsYen, syncLinked, TRIAL_DISCOUNT, VM_LEASE_OPTION } from './charges';
import { applyResume, closeOf, cycleAt, withPlan } from './lifecycle';
import { addYm } from './menu';
import { DEFAULT_RATES } from './tax';
import type {
  Account, Address, Application, Billing, Branch, ChildContract, Contact, Contract, Corp, Course, Discount, Loan, Model, Option, Pause, Plan, PriceGen, Product, SetupBranch, TaxRate,
} from './types';
import { isOpenPause, PAUSE_OPEN } from './types';

/*
 * 既存のお客様（約600社）の移行（受付簿 No.28・台帳「既存のお客様の移行 CSV」・契約_01 §9-1・移行CSV_列の案_20261003.md）。
 *   フェーズ1の ID（法人・拠点：CU＋5桁）をそのまま ID にして、法人・拠点・親契約・子契約を「利用中」で直接作る（受付・承認・メールなし）。
 *   足りない項目は空のまま取り込み、「要補完」（todoOf）に出す。配送（便・枠・倉庫・配送会社）はフェーズ1から出せないので作らない（配送が未設定として要補完に出す）。
 *   4つのファイル：A 法人・拠点・契約（migrateSite）／B 設備（migrateLoan）／C 担当者（migrateContacts）／D 企業独自価格（migratePrice）。
 *   取り込み直し（2回のデータメンテナンス）：同じキー（拠点ID）なら更新。空欄の列は変えない。確定・請求済の子契約は変えない。配送は運営が入れたあとも消さない。
 *   フェーズ1の状態（法人だけ・hong 2026-10-05）：本登録＝通常／仮登録＝法人・拠点・親契約を 仮登録 で取り込む（子契約・配送・注文・ログインなし）／
 *   休止中＝親契約を 利用休止（終わりが未定の休止 PAUSE_OPEN・アカウントは参照のみ・要補完「休止の期間・再開月」）／解約済・削除済＝取り込まない（CSV の層で対象外にする）。
 * CSV の読み取り・列の定義は lib/csv/migrate.ts。ここは共通データ（dm.*）の書き込みだけ（画面にデータを持たない）。
 */

const K = {
  corps: 'dm.org.corps', branches: 'dm.org.branches', contacts: 'dm.org.contacts', contracts: 'dm.org.contracts', children: 'dm.org.childContracts',
  pauses: 'dm.org.pauses', loans: 'dm.org.loans', accounts: 'dm.account.accounts', agencies: 'dm.org.agencies', plans: 'dm.master.plans', models: 'dm.master.models',
  apps: 'dm.apply.applications', options: 'dm.master.options', discounts: 'dm.master.discounts', products: 'dm.master.products', taxRates: 'dm.master.taxRates',
} as const;

export const MIGRATED = '移行' as const;
/** フェーズ1の ID の形（法人・拠点とも CU＋5桁。移行CSV_列の案 E-1） */
export const PHASE1_ID = /^CU\d{5}$/;

const STD: Course = 'ESスタンダード';
const LIGHT: Course = 'ESライト（冷蔵庫）';
const LIGHT_VM: Course = 'ESライト（自販機）';
export const MIGRATE_LEAD: Record<string, Billing['lead']> = { '3ヶ月前': -3, '2ヶ月前': -2, '1ヶ月前': -1, 当月: 0, '翌月（後払い）': 1 };
const BLANK_BILLING: Billing = { lead: -1, invoiceUnit: 'まとめて発行（法人1通）', payMethod: '口座振替', debitStatus: '', payCycle: '月払い', dueRule: '請求月の27日', billonePayerId: '' };
const CORP_BILL_LABELS = { payMethod: '支払い方法', payCycle: '支払サイクル', lead: '請求書の発行時期', unit: '請求書の発行単位' } as const;

const pad = (n: number, w: number) => String(n).padStart(w, '0');
const nextNum = (ids: string[], re: RegExp) => Math.max(0, ...ids.map((x) => x.match(re)).filter(Boolean).map((m) => Number(m![1]))) + 1;
const ymStart = (ym: string) => `${ym.replace('-', '/')}/01`;
const monthOf = (day: string) => day.slice(0, 7).replace('/', '-');
function bad(m: string, code = 400): never { throw new ApiError(m, code); }

/** 「市区町村・番地」を市区町村と番地に（市・区・町・村の最後で切る。切れなければ全部を市区町村） */
export function splitCity(v: string): Pick<Address, 'city' | 'addr1'> {
  const m = /^(.+?[市区町村])(.*)$/.exec(v);
  return m && m[2] ? { city: m[1], addr1: m[2] } : { city: v, addr1: '' };
}
const addrOf = (zip: string, pref: string, city: string, bld: string): Address => ({ zip, pref, ...splitCity(city), addr2: bld });

/** 受取できる時間帯 `9:00-12:00;13:00-17:00` → [{from,to}]（形が違えば null） */
export function parseWindows(v: string): { from: string; to: string }[] | null {
  const out: { from: string; to: string }[] = [];
  for (const part of v.split(/[;；]/).map((x) => x.trim()).filter(Boolean)) {
    const m = /^(\d{1,2}):(\d{2})\s*[-〜~～]\s*(\d{1,2}):(\d{2})$/.exec(part);
    if (!m) return null;
    const w = { from: `${pad(+m[1], 2)}:${m[2]}`, to: `${pad(+m[3], 2)}:${m[4]}` };
    if (!(w.from < w.to)) return null;
    out.push(w);
  }
  return out;
}

/* ===================================================================== */
/* A. 法人・拠点・契約                                                      */
/* ===================================================================== */

/** 法人の列（同じ法人の行で同じ値）。undefined＝空欄（新規は既定・更新は変えない） */
export type CorpIn = {
  id: string; name: string; kana?: string; contractName?: string; billToName?: string;
  zip: string; pref: string; city: string; bld?: string; tel?: string; fax?: string; salesRepId?: string;
  payMethod?: Billing['payMethod']; debit?: Billing['debitStatus']; payCycle?: Billing['payCycle']; lead?: Billing['lead']; unit?: Billing['invoiceUnit']; billone?: string; reminder?: boolean;
  /** 法人の状態（フェーズ1の本登録／仮登録）。空欄＝変えない（新規は正式登録） */
  status?: '仮登録' | '正式登録';
};
export type SiteIn = {
  corp: CorpIn | null;
  /* 拠点 */
  branchId: string; name: string; kana?: string; zip: string; pref: string; city: string; bld?: string; tel?: string; fax?: string; floor?: string; employees?: number;
  windows?: { from: string; to: string }[]; deliveryNote?: string; noStockCheck?: boolean; memo?: string;
  /* 納品の条件 */
  ngDays?: string[]; shift?: '前倒す' | '後ろ倒す'; short?: '通常' | '短消費期限なし';
  /* 契約 */
  branchStatus?: '仮登録' | '本登録' | '閉鎖予定'; status?: '仮登録' | '有効' | '利用休止' | '解約手続き中'; pause?: { from: string; to: string; resume: string }; endOn?: string;
  kind?: '本導入' | 'お試し'; trialEnd?: string; startYm?: string; agencyId?: string;
  billTo: '法人' | 'この拠点'; bpay?: Billing['payMethod']; bcycle?: Billing['payCycle']; blead?: Billing['lead'];
  /* 子契約 */
  planId: string; course?: string; gen?: string; priceMode?: '通常価格' | '企業独自価格'; settle?: '従量' | '買取';
  options?: string[]; amounts?: Record<string, number>; discounts?: string[]; cash?: boolean; guest?: boolean; esqr?: boolean; cap?: number;
  issue?: boolean;
};
export type SiteOut = { created: boolean; changed: boolean; diff: { col: string; before: string; after: string }[]; notes: string[]; children: string[] };

/** プランの価格世代を名前で探す（「改訂第三回目」＝世代の備考の先頭。ID でもよい） */
export const genOf = (plan: Plan | undefined, name: string): PriceGen | undefined =>
  (plan?.priceGens ?? []).find((g) => g.id === name || g.note === name || g.note.startsWith(`${name}（`) || g.note.startsWith(name));

/** ① 費目・月額を、選んだ価格世代の料金で作る（世代がなければ そのサイクル月の世代＝いつもどおり） */
function priced(r: DocRepo, cc: ChildContract, gen: PriceGen | undefined): ChildContract {
  if (!gen) return cc;
  const plan = r.get<Plan>(K.plans, cc.planId);
  const price = gen.prices.find((p) => p.course === cc.course)?.monthlyYen;
  if (!plan || price === undefined) return cc;
  /* 選んだ世代だけをこの子契約のサイクル月から使う形（pricesAt が必ずこの世代を引く） */
  const pl: Plan = { ...plan, prices: gen.prices, priceGens: [{ ...gen, fromCycle: '0000-00' }] };
  const monthlyYen = price + monthlyOptionsYen(r, cc);
  const fees = feesOf(cc, {
    plan: (id) => (id === pl.id ? pl : r.get<Plan>(K.plans, id)),
    option: (id) => r.get<Option>(K.options, id), discount: (id) => r.get<Discount>(K.discounts, id),
    rate: (id) => r.get<TaxRate>(K.taxRates, id)?.rate, skipDiscount: (d) => corpLimitHit(r, cc, d),
  });
  return { ...cc, monthlyYen, fees };
}

/** 変わっているときだけ書く（取り込み直しで同じファイルなら何も変わらない）。返り値＝変わったか */
function putIf<T extends { id: string }>(r: DocRepo, kind: string, prev: T | undefined, next: T, ignore: (x: T) => unknown = (x) => x): boolean {
  if (prev && JSON.stringify(ignore(prev)) === JSON.stringify(ignore(next))) return false;
  r.put<T>(kind, next.id, next);
  return true;
}
/** 子契約の比較（① 費目を写した日時だけ違うものは同じ） */
const kidSig = (x: ChildContract) => ({ ...x, fees: x.fees ? { ...x.fees, at: '' } : undefined });

/**
 * 取り込みの1回（検証・登録）で使う索引。取り込みの1行ごとに文書の一覧を読み直さない（約600社・1,000拠点を数十秒で処理するため。一覧の読み直しは行数の2乗で遅くなる）。
 * 索引は「保存に成功した行」のあとだけ更新する（エラーの行は重ねた DocRepo ごと捨てるので、索引も変えない）
 */
export class MigIndex {
  contracts = new Map<string, Contract>();
  loans = new Map<string, Loan[]>();
  contacts = new Map<string, Contact[]>();
  cp = 1;
  ln = 1;
  pc = 1;
  constructor(r: DocRepo) {
    const cps: string[] = [], lns: string[] = [], pcs: string[] = [];
    for (const c of r.list<Contract>(K.contracts)) { this.contracts.set(c.branchId, c); cps.push(c.id); }
    for (const l of r.list<Loan>(K.loans)) { this.loans.set(l.branchId, [...(this.loans.get(l.branchId) ?? []), l]); lns.push(l.id); }
    for (const c of r.list<Contact>(K.contacts)) { const k = `${c.owner.type}:${c.owner.id}`; this.contacts.set(k, [...(this.contacts.get(k) ?? []), c]); pcs.push(c.id); }
    this.cp = nextNum(cps, /^CP(\d{7})$/);
    this.ln = nextNum(lns, /^LN-(\d+)$/);
    this.pc = nextNum(pcs, /^PC(\d{5})$/);
  }
}

const hasVm = (r: DocRepo, ix: MigIndex, branchId: string) =>
  (ix.loans.get(branchId) ?? []).some((l) => l.status === '貸出中' && r.get<Model>(K.models, l.modelId)?.category === '自販機');

/** 親契約の子契約（取消は除く）。移行で作った範囲（Contract.migration.cycles）とその続きを1件ずつ引く（子契約の全件を読まない） */
function kidsOf(r: DocRepo, ct: Contract): ChildContract[] {
  const c = ct.migration?.cycles;
  if (!c) return r.list<ChildContract>(K.children).filter((x) => x.contractId === ct.id && !x.canceled);
  const out: ChildContract[] = [];
  const at = (ym: string) => r.get<ChildContract>(K.children, `${ct.id}-${ym.replace('-', '')}`);
  let ym = c[0];
  for (; ym <= c[1]; ym = addYm(ym, 1)) { const k = at(ym); if (k && !k.canceled) out.push(k); }
  /* 範囲のあとに日次バッチなどで足された月も（途切れるまで） */
  for (let k = at(ym); k; k = at(ym)) { if (!k.canceled) out.push(k); ym = addYm(ym, 1); }
  return out;
}

/** 選んだ価格世代の料金で、この子契約の月額・① 費目を作り直す（いまその世代の料金で請求している子契約だけ。運営が別の世代に切り替えたものは変えない） */
function usesGen(k: ChildContract, gen: PriceGen | undefined) {
  const price = gen?.prices.find((p) => p.course === k.course)?.monthlyYen;
  return price !== undefined && (k.fees?.lines ?? []).filter((l) => l.src === 'plan' && l.refId === k.planId).reduce((a, l) => a + l.amountYen, 0) === price;
}

/** 自販機リース（OP000037）の台数・1台の金額を貸出にそろえる（未確定の子契約だけ。lifecycle.refreshVmLease と同じ。価格世代は保つ） */
function refreshLease(r: DocRepo, ct: Contract) {
  const plan = (id: string) => r.get<Plan>(K.plans, id);
  for (const cc of kidsOf(r, ct).filter((x) => !childLocked(x) && x.optionIds.includes(VM_LEASE_OPTION))) {
    const next = syncLinked(r, cc, cc);
    if (next.optionQty?.[VM_LEASE_OPTION] === cc.optionQty?.[VM_LEASE_OPTION] && next.amounts?.[VM_LEASE_OPTION] === cc.amounts?.[VM_LEASE_OPTION]) continue;
    const gen = ct.migration?.gen ? genOf(plan(next.planId), ct.migration.gen) : undefined;
    const base: ChildContract = { ...next, monthlyYen: (plan(next.planId)?.prices.find((p) => p.course === next.course)?.monthlyYen ?? 0) + monthlyOptionsYen(r, next) };
    const fixed = priced(r, { ...base, fees: feesNowOf(r, base) }, gen && usesGen(cc, gen) ? gen : undefined);
    r.put<ChildContract>(K.children, cc.id, fixed);
  }
}
const feesNowOf = (r: DocRepo, cc: ChildContract) => feesOf(cc, {
  plan: (id) => r.get<Plan>(K.plans, id), option: (id) => r.get<Option>(K.options, id), discount: (id) => r.get<Discount>(K.discounts, id),
  rate: (id) => r.get<TaxRate>(K.taxRates, id)?.rate, skipDiscount: (d) => corpLimitHit(r, cc, d),
});

/** 移行が決める アカウントの状態（未発行＝仮登録・参照のみ＝休止中／解約手続き中・発行済（ログイン前）＝通常） */
type MigAccount = '未発行' | '発行済（ログイン前）' | '参照のみ';
function ensureAccount(r: DocRepo, ix: MigIndex, id: string, name: string, scope: Account['scope'], status: MigAccount) {
  const ex = r.get<Account>(K.accounts, id);
  const contact = ex ? undefined : (ix.contacts.get(`${scope.type === 'corp' ? 'corp' : 'branch'}:${id}`) ?? []).find((c) => c.kind === 'メイン担当者');
  if (ex) {
    /* 移行が動かすのは この4つだけ（無効・利用停止・削除済は運営が決めたので触らない）。ログイン済みなら「発行済（ログイン前）」は「有効」 */
    if (!['未発行', '発行済（ログイン前）', '参照のみ', '有効'].includes(ex.status)) return false;
    if (status === '発行済（ログイン前）' && ex.status === '有効') return false;
    const next: Account['status'] = status === '発行済（ログイン前）' && ex.lastLoginAt ? '有効' : status;
    if (next !== ex.status) r.put<Account>(K.accounts, id, { ...ex, status: next });
    return false;
  }
  /* メールを送らない（ログイン案内はリリースに合わせて別に送る・契約_01 §9-1）。メールが分かるまで空（担当者CSVで入ると入れる） */
  r.put<Account>(K.accounts, id, {
    id, site: 'corp', loginId: id, name, email: contact?.email ?? '', status, roleIds: [scope.type === 'corp' ? 'corp.corp' : 'corp.branch'], scope, issuedAt: nowStamp(), lastLoginAt: '',
  });
  return true;
}

function upsertCorp(r: DocRepo, c: CorpIn): { rec: Corp; before?: Corp } {
  const ex = r.get<Corp>(K.corps, c.id);
  if (ex && ex.source !== MIGRATED) bad(`法人 ${c.id} はフェーズ2で作った法人です（移行で作った法人ではありません）。フェーズ1の ID がフェーズ2の番号とぶつかっています`, 409);
  if (r.get(K.branches, c.id)) bad(`法人ID ${c.id} は拠点の ID として使われています（フェーズ2は法人と拠点で1つの連番です。移行CSV_列の案 E-1）`, 409);
  const base: Corp = ex ?? {
    id: c.id, name: '', contractName: '', kana: '', billToName: '', status: '正式登録', salesRepId: '', address: { zip: '', pref: '', city: '', addr1: '', addr2: '' }, tel: '', fax: '',
    billing: { ...BLANK_BILLING }, registeredAt: nowStamp(), source: MIGRATED,
  };
  const next: Corp = { ...base, address: { ...base.address }, billing: { ...base.billing } };
  if (c.status) {
    if (ex?.status === '正式登録' && c.status === '仮登録') bad(`法人 ${c.id} はすでに正式登録です（仮登録には戻せません。フェーズ1の状態を確かめてください）`, 409);
    /* 休眠・取消は運営が決めた状態なので、移行では変えない */
    if (!ex || ex.status === '仮登録' || ex.status === '正式登録') next.status = c.status;
  }
  next.name = c.name;
  next.contractName = c.contractName ?? (ex ? ex.contractName : c.name);
  if (c.kana !== undefined) next.kana = c.kana;
  if (c.billToName !== undefined) next.billToName = c.billToName;
  next.address = addrOf(c.zip, c.pref, c.city, c.bld ?? (ex ? ex.address.addr2 : ''));
  if (c.tel !== undefined) next.tel = c.tel;
  if (c.fax !== undefined) next.fax = c.fax;
  if (c.salesRepId !== undefined) next.salesRepId = c.salesRepId;
  if (c.reminder !== undefined) next.orderReminder = c.reminder;
  /* 請求条件：空欄は新規なら既定（billingBlank に印）、更新なら変えない。入れれば印を外す */
  const blank = new Set(ex?.billingBlank ?? []);
  const take = <T,>(label: string, v: T | undefined, set: (x: T) => void) => { if (v !== undefined) { set(v); blank.delete(label); } else if (!ex) blank.add(label); };
  take(CORP_BILL_LABELS.payMethod, c.payMethod, (x) => { next.billing.payMethod = x; });
  take(CORP_BILL_LABELS.payCycle, c.payCycle, (x) => { next.billing.payCycle = x; });
  take(CORP_BILL_LABELS.lead, c.lead, (x) => { next.billing.lead = x; });
  take(CORP_BILL_LABELS.unit, c.unit, (x) => { next.billing.invoiceUnit = x; });
  if (c.debit !== undefined) next.billing.debitStatus = c.debit;
  if (c.billone !== undefined) next.billing.billonePayerId = c.billone;
  next.billingBlank = blank.size ? [...blank] : undefined;
  if (!next.billingBlank) delete next.billingBlank;
  putIf(r, K.corps, ex, next);
  return { rec: next, before: ex };
}

/* ---------- 仮登録の申込（受付中） ---------- */

/** 移行で作った申込（運営の代理入力・申込者＝移行）か */
export const isMigApp = (x: Application) => x.type === 'new' && x.requestedBy.site === 'ops' && x.requestedBy.name === MIGRATED;
const appOfSite = (r: DocRepo, branchId: string, corpId: string | null) =>
  r.list<Application>(K.apps).find((x) => isMigApp(x) && (corpId ? x.corpId === corpId : x.branchIds.includes(branchId)));
const nextAppNo = (r: DocRepo) => {
  const ymd = today().replace(/\//g, '');
  const max = Math.max(0, ...r.list<Application>(K.apps).filter((x) => x.id.startsWith(`AP-${ymd}-`)).map((x) => Number(x.id.slice(-4))));
  return `AP-${ymd}-${String(max + 1).padStart(4, '0')}`;
};
const MIG_REQUEST: [string, string][] = [
  ['申込の種類', '移行（フェーズ1の仮登録のお客様）'],
  ['備考', 'フェーズ1 で仮登録だったお客様を、移行CSVで仮登録のまま取り込みました。申込の内容は運営が確かめて入れてください（受付 → 契約設定 → 本登録）。'],
];

/**
 * 移行した仮登録のお客様の申込（法人ごとに1件。法人なしの拠点は拠点ごと）。受付中のあいだだけ中身を合わせる（運営が受付を進めたあとは変えない）。
 * 拠点の中身は stage＝''（仮登録がまだ）で持つ。受付の「仮登録」で注文・資材の初期セット・アカウントの発行がそろい、「本登録」で子契約・配送ができる（lifecycle.provisional／register）
 */
function syncApplication(
  r: DocRepo, a: SiteIn, p: { corp: Corp | undefined; branch: Branch; ct: Contract; plan: Plan; course: Course; gen?: string; st: string },
): { before: string; after: string } | null {
  const cid = p.corp?.id ?? null;
  const ex = appOfSite(r, a.branchId, cid);
  if (ex && ex.status !== '受付中') return null;
  const main = r.list<Contact>(K.contacts).find((c) => c.owner.type === 'branch' && c.owner.id === a.branchId && c.kind === 'メイン担当者');
  const trial = p.ct.kind === 'お試しキャンペーン';
  const old = ex?.setup?.branches.find((b) => b.branchId === a.branchId);
  const sb: SetupBranch = {
    name: p.branch.name, kana: p.branch.kana, address: p.branch.address, tel: p.branch.tel, employees: p.branch.employees, receiveWindows: p.branch.receiveWindows,
    deliveryNote: p.branch.deliveryNote, floor: p.branch.floor ?? '', fax: p.branch.fax,
    contact: old?.contact ?? { name: main?.name ?? '', email: main?.email ?? '', tel: main?.tel ?? '' },
    planId: p.plan.id, course: p.course, channels: old?.channels ?? [],
    optionIds: a.options ?? old?.optionIds ?? [], discountIds: [...new Set([...(a.discounts ?? old?.discountIds.filter((x) => x !== TRIAL_DISCOUNT) ?? []), ...(trial ? [TRIAL_DISCOUNT] : [])])],
    equipment: old?.equipment ?? [], billTo: p.ct.billTo, ...(p.ct.billing ? { billing: p.ct.billing } : {}),
    ...(a.amounts ?? old?.amounts ? { amounts: a.amounts ?? old?.amounts } : {}),
    ...(old?.noShortLife !== undefined ? { noShortLife: old.noShortLife } : {}), ...(old?.initFeeYen !== undefined ? { initFeeYen: old.initFeeYen } : {}),
    branchId: a.branchId, contractId: p.ct.id, stage: '', checked: old?.checked ?? false,
  };
  const at = nowStamp();
  const kubun: Application['kubun'] = trial ? 'お試し' : '本導入';
  if (!ex) {
    const id = nextAppNo(r);
    const next: Application = {
      id, type: 'new', kind: '新規申込', kubun, status: '受付中', corpId: cid, companyName: p.corp?.name ?? p.branch.name, branchIds: [a.branchId], branchNames: [],
      requestedBy: { site: 'ops', accountId: '', name: MIGRATED }, requestedAt: at, startCycle: p.st, orderCloseOn: closeOf(r, p.st), request: MIG_REQUEST, change: {}, results: [], proxy: true, reason: '',
      setup: { startCycle: p.st, corp: null, branches: [sb], notes: [] },
    };
    r.put<Application>(K.apps, id, next);
    return { before: '', after: `${id}（新規・受付中）` };
  }
  const setup = structuredClone(ex.setup ?? { startCycle: p.st, corp: null, branches: [], notes: [] });
  const i = setup.branches.findIndex((b) => b.branchId === a.branchId);
  if (i < 0) setup.branches.push(sb); else setup.branches[i] = sb;
  const next: Application = {
    ...ex, companyName: p.corp?.name ?? ex.companyName, branchIds: ex.branchIds.includes(a.branchId) ? ex.branchIds : [...ex.branchIds, a.branchId], kubun: ex.branchIds.length > 1 ? ex.kubun : kubun, setup,
  };
  if (JSON.stringify(next) === JSON.stringify(ex)) return null;
  r.put<Application>(K.apps, ex.id, next);
  return { before: ex.id, after: `${ex.id}（更新）` };
}

/** 仮登録でなくなった拠点（フェーズ1が本登録になった）の、受付中の申込を取り下げる（拠点がほかにあれば、その拠点だけ外す） */
function withdrawApplication(r: DocRepo, branchId: string, corpId: string | null) {
  const ex = appOfSite(r, branchId, corpId);
  if (!ex || ex.status !== '受付中') return;
  const rest = ex.branchIds.filter((x) => x !== branchId);
  if (rest.length) {
    const setup = ex.setup ? { ...structuredClone(ex.setup), branches: ex.setup.branches.filter((b) => b.branchId !== branchId) } : undefined;
    r.put<Application>(K.apps, ex.id, { ...ex, branchIds: rest, ...(setup ? { setup } : {}) });
  } else r.put<Application>(K.apps, ex.id, { ...ex, status: '取り下げ済', reason: '移行CSVで本登録として取り込み直したため（フェーズ1の状態が仮登録でなくなった）' });
}

/**
 * 1拠点（A の1行）を作る・更新する：法人（同じ法人の行は1回）・拠点・親契約・子契約・アカウント。
 * st＝切替のサイクル月（この月から子契約を作る）、lastYm＝いま子契約がある最後のサイクル月（そこまで作る）
 */
export function migrateSite(r: DocRepo, a: SiteIn, o: { st: string; lastYm: string; corpDone: boolean; ix: MigIndex }): SiteOut {
  if (!PHASE1_ID.test(a.branchId)) bad(`拠点ID は CU＋5桁（フェーズ1の ID）で入れてください（${a.branchId}）`);
  if (a.corp && a.corp.id === a.branchId) bad(`法人ID と拠点ID が同じです（${a.branchId}）。フェーズ2は法人と拠点で1つの連番です（移行CSV_列の案 E-1）`);
  const notes: string[] = [];
  const diff: SiteOut['diff'] = [];
  const at = nowStamp();

  /* ---- 法人 ---- */
  let corpBefore: Corp | undefined, corp: Corp | undefined;
  if (a.corp) {
    if (!PHASE1_ID.test(a.corp.id)) bad(`法人ID は CU＋5桁（フェーズ1の ID）で入れてください（${a.corp.id}）`);
    if (!o.corpDone) {
      const u = upsertCorp(r, a.corp);
      corp = u.rec; corpBefore = u.before;
      if (!u.before) diff.push({ col: '法人', before: '', after: `${corp.id} ${corp.name}（新規）` });
      else diff.push(...diffRec('法人', u.before, u.rec));
    } else corp = r.get<Corp>(K.corps, a.corp.id);
  }

  /* ---- 拠点 ---- */
  if (r.get(K.corps, a.branchId)) bad(`拠点ID ${a.branchId} は法人の ID として使われています（フェーズ2は法人と拠点で1つの連番です。移行CSV_列の案 E-1）`, 409);
  const exB = r.get<Branch>(K.branches, a.branchId);
  if (exB && exB.source !== MIGRATED) bad(`拠点 ${a.branchId} はフェーズ2で作った拠点です（移行で作った拠点ではありません）。フェーズ1の ID がフェーズ2の番号とぶつかっています`, 409);
  const exC = o.ix.contracts.get(a.branchId);
  if (exB && exB.corpId !== (corp?.id ?? null)) bad(`拠点 ${a.branchId} の法人が違います（いま ${exB.corpId ?? '法人なし'}。法人の付け替えは画面で）`, 409);
  if (exC && !['仮登録', '有効', '利用休止', '解約手続き中'].includes(exC.status)) bad(`この契約は ${exC.status} です（仮登録・有効・利用休止・解約手続き中だけ取り込み直せます）`, 409);
  if (a.status === '仮登録' && exC && exC.status !== '仮登録') bad(`この契約はすでに ${exC.status} です（仮登録には戻せません。フェーズ1の状態を確かめてください）`, 409);
  /* 運営が解約の手続きに入れた契約は、移行の「本登録（有効）」で有効に戻さない */
  const status = exC?.status === '解約手続き中' && a.status === '有効' ? exC.status : a.status ?? (exC ? exC.status : '有効');
  const closing = status === '解約手続き中';
  const tentative = status === '仮登録';
  const baseB: Branch = exB ?? {
    id: a.branchId, corpId: corp?.id ?? null, name: '', kana: '', status: '本登録', employees: 0, originalStartOn: '', address: { zip: '', pref: '', city: '', addr1: '', addr2: '' },
    tel: '', fax: '', receiveWindows: [], deliveryNote: '', floor: '', note: '', registeredAt: at, source: MIGRATED,
  };
  const nextB: Branch = { ...baseB, address: { ...baseB.address } };
  nextB.name = a.name;
  if (a.kana !== undefined) nextB.kana = a.kana;
  nextB.address = addrOf(a.zip, a.pref, a.city, a.bld ?? (exB ? exB.address.addr2 : ''));
  if (a.tel !== undefined) nextB.tel = a.tel;
  if (a.fax !== undefined) nextB.fax = a.fax;
  if (a.floor !== undefined) nextB.floor = a.floor;
  if (a.employees !== undefined) nextB.employees = a.employees;
  if (a.windows !== undefined) nextB.receiveWindows = a.windows;
  if (a.deliveryNote !== undefined) nextB.deliveryNote = a.deliveryNote;
  if (a.memo !== undefined) nextB.note = a.memo;
  if (a.noStockCheck !== undefined) nextB.noStockCheck = a.noStockCheck;
  if (a.startYm !== undefined) nextB.originalStartOn = ymStart(a.startYm);
  nextB.status = closing ? '閉鎖予定' : tentative ? '仮登録' : a.branchStatus === '仮登録' ? '本登録' : a.branchStatus ?? (exB ? exB.status : '本登録');
  /* 納品の条件（空欄は新規なら空＝要補完、更新なら変えない） */
  const dc = baseB.deliveryCond ?? { ngDays: [], shift: '', short: '' };
  nextB.deliveryCond = { ngDays: a.ngDays ?? dc.ngDays, shift: a.shift ?? dc.shift, short: a.short ?? dc.short };
  putIf(r, K.branches, exB, nextB);
  if (!exB) diff.push({ col: '拠点', before: '', after: `${a.branchId} ${a.name}（新規・${nextB.status}）` });
  else diff.push(...diffRec('拠点', exB, nextB));
  if (a.short) {
    /* 基準数のパターン（消費期限の短い商品の扱い）は拠点の注文の設定へ（REQ-CT-300） */
    const pref = r.get<{ id: string; allowShortLife: boolean; categories: string[] | null; priceRange: [number, number]; excluded: string[]; updatedAt: string; updatedBy: string }>('dm.order.prefs', a.branchId);
    const allow = a.short !== '短消費期限なし';
    if (!pref || pref.allowShortLife !== allow) {
      r.put('dm.order.prefs', a.branchId, { id: a.branchId, categories: pref?.categories ?? null, allowShortLife: allow, priceRange: pref?.priceRange ?? [100, 200], excluded: pref?.excluded ?? [], updatedAt: at, updatedBy: '移行', applyNext: false });
    }
  }

  /* ---- 親契約 ---- */
  const plan = r.get<Plan>(K.plans, a.planId);
  if (!plan || plan.status === '削除済') bad(`プランID ${a.planId} がありません`);
  const kind = a.kind === 'お試し' ? 'お試しキャンペーン' : a.kind === '本導入' ? '本導入' : exC?.kind ?? '本導入';
  const billTo = a.billTo;
  if (billTo === '法人' && !corp) bad('法人なしの拠点は 請求先＝この拠点 にしてください');
  const startCycle = a.startYm ?? exC?.startCycle ?? o.st;
  const ctId = exC?.id ?? `CP${pad(o.ix.cp, 7)}`;
  /* この拠点に請求するときの請求条件（空欄は法人の請求条件・印） */
  let billing: Billing | null = null;
  let billingBlank: string[] | undefined;
  if (billTo === 'この拠点') {
    const blank = new Set(exC?.billingBlank ?? []);
    const base: Billing = { ...(exC?.billing ?? corp?.billing ?? BLANK_BILLING), invoiceUnit: '拠点ごと発行' };
    const take = <T,>(label: string, v: T | undefined, set: (x: T) => void) => { if (v !== undefined) { set(v); blank.delete(label); } else if (!exC?.billing) blank.add(label); };
    take('支払い方法', a.bpay, (x) => { base.payMethod = x; });
    take('支払サイクル', a.bcycle, (x) => { base.payCycle = x; });
    take('請求書の発行時期', a.blead, (x) => { base.lead = x; });
    billing = base; billingBlank = blank.size ? [...blank] : undefined;
  }
  const kindHistory = exC ? (exC.kind !== kind ? [...exC.kindHistory, { kind, from: o.st }] : exC.kindHistory) : [{ kind, from: startCycle }];
  /* コース：空（または ESライト）＝自販機の貸出があれば ESライト（自販機）、なければ ESライト（冷蔵庫）（hong 回答 2026-10-05）。取り込み直しで空欄なら今のコースのまま */
  const courseGiven = a.course && a.course !== 'ESライト' ? a.course : '';
  const courseBlank = !courseGiven;
  const defaultCourse: Course = hasVm(r, o.ix, a.branchId) ? LIGHT_VM : LIGHT;
  const course: Course = (courseGiven as Course) || defaultCourse;
  const prevMig = exC?.migration;
  const ct: Contract = {
    ...(exC ?? { id: ctId, branchId: a.branchId, endOn: '', agencyId: '' }), id: ctId, branchId: a.branchId, kind, kindHistory, status, startCycle, billTo, billing,
    endOn: closing ? a.endOn ?? exC?.endOn ?? '' : status === '有効' || status === '利用休止' ? '' : exC?.endOn ?? '',
    agencyId: a.agencyId ?? exC?.agencyId ?? '', source: MIGRATED,
    migration: { at: prevMig?.at ?? at, courseBlank: a.course !== undefined ? courseBlank : prevMig?.courseBlank ?? courseBlank, courseDefault: a.course !== undefined ? (courseBlank ? defaultCourse : '') : prevMig?.courseDefault ?? (courseBlank ? defaultCourse : '') },
  } as Contract;
  if (billingBlank) ct.billingBlank = billingBlank; else delete ct.billingBlank;
  if (closing && !ct.endOn) bad('契約の状態が解約手続き中のときは「解約日」を入れてください');

  /* 休止（利用休止のとき）：休止の月の子契約は作らない。終わりが未定の休止（PAUSE_OPEN）は、運営が期間を決めたあとの取り込み直しで未定に戻さない */
  const pid = `MG-${ctId}`;
  if (status === '利用休止' && a.pause) {
    if (!(isOpenPause({ toCycle: a.pause.to }) && r.get(K.pauses, pid))) r.put<Pause>(K.pauses, pid, { id: pid, contractId: ctId, fromCycle: a.pause.from, toCycle: a.pause.to, resumeCycle: a.pause.resume, applicationNo: '', keepEquipment: true, reason: '移行（フェーズ1の休止中。休止の期間・再開月は未定）' });
  } else if (status === '利用休止' && !r.get(K.pauses, pid)) bad('契約の状態が利用休止のときは休止の期間が要ります（法人ステータス＝休止中）');
  else if (status !== '利用休止' && r.get(K.pauses, pid)) r.remove(K.pauses, pid);
  const pauses = r.list<Pause>(K.pauses).filter((p) => p.contractId === ctId);

  /* ---- 子契約（切替のサイクル月から、いま子契約がある最後のサイクル月まで。お試しはお試しの終わりまで） ---- */
  const trial = kind === 'お試しキャンペーン';
  let endYm = o.lastYm > o.st ? o.lastYm : o.st;
  if (trial && !tentative) {
    const te = a.trialEnd ?? (exC ? kidsOf(r, exC).filter((x) => x.kind === 'お試しキャンペーン').map((x) => x.cycleMonth).sort().pop() : '') ?? '';
    if (!te) bad('契約区分がお試しのときは「お試しの終了月」を入れてください');
    if (te < o.st) bad(`お試しの終了月 ${te} が切替のサイクル月 ${o.st} より前です（終わったお試しは取り込みません）`);
    endYm = te;
  }
  if (closing && ct.endOn && monthOf(ct.endOn) < endYm) endYm = monthOf(ct.endOn);
  const gen = a.gen ? genOf(plan, a.gen) : undefined;
  if (a.gen && !gen) bad(`プラン ${plan.id} に価格世代「${a.gen}」がありません（プランマスタの価格世代の名前）`);
  const made: ChildContract[] = [];
  let touched = 0;
  /* 仮登録：子契約は作らない（本登録のときに作る） */
  for (let ym = o.st; !tentative && ym <= endYm; ym = addYm(ym, 1)) {
    if (pauses.some((p) => p.fromCycle <= ym && ym <= p.toCycle)) continue;
    const id = `${ctId}-${ym.replace('-', '')}`;
    const ex = r.get<ChildContract>(K.children, id);
    if (ex && childLocked(ex)) { notes.push(`${ym} サイクルの子契約は確定・請求済のため変えていません。`); continue; }
    const kidCourse: Course = courseGiven ? course : ex && plan.prices.some((p) => p.course === ex.course) ? ex.course : defaultCourse;
    if (!plan.prices.some((p) => p.course === kidCourse)) bad(`${plan.id} には ${kidCourse} の料金がありません（コースの列を入れてください）`);
    const mode = a.priceMode ?? ex?.pricing.mode ?? '通常価格';
    const billing2 = a.settle ?? (a.priceMode ? (mode === '企業独自価格' ? '買取' : '従量') : ex?.pricing.billing ?? (mode === '企業独自価格' ? '買取' : '従量'));
    const app = { allowCash: a.cash ?? ex?.app.allowCash ?? false, allowGuest: a.guest ?? ex?.app.allowGuest ?? false, allowEsqr: a.esqr ?? ex?.app.allowEsqr ?? false, dailyCapMeals: a.cap ?? ex?.app.dailyCapMeals ?? 3 };
    const optionIds = a.options ?? ex?.optionIds ?? [];
    const discountIds = [...new Set([...(a.discounts ?? ex?.discountIds.filter((x) => x !== TRIAL_DISCOUNT) ?? []), ...(trial ? [TRIAL_DISCOUNT] : [])])];
    const amounts = a.amounts ?? ex?.amounts;
    const base: ChildContract = {
      ...(ex ?? { id, contractId: ctId, branchId: a.branchId, cycleMonth: ym, channels: [], monthlyYen: 0, billStatus: '未確定' as const, gen: '手動生成' as const }),
      id, contractId: ctId, branchId: a.branchId, cycleMonth: ym, kind, planId: plan.id, course: kidCourse, optionIds, discountIds, app,
      pricing: { mode, billing: billing2, prices: ex?.pricing.prices ?? {} }, ...(amounts ? { amounts } : {}),
    };
    delete (base as { canceled?: unknown }).canceled;
    const next = priced(r, withPlan(r, base, plan.id, kidCourse, { kind }), gen);
    if (putIf(r, K.children, ex, next, kidSig)) touched++;
    made.push(next);
  }
  const kidDiff: SiteOut['diff'] = [];
  if (touched) kidDiff.push({ col: '子契約', before: '', after: `${touched}件（${made[0].cycleMonth}〜${made[made.length - 1].cycleMonth}・${plan.id} ${made[0].course}${gen ? `・${gen.note.split('（')[0]}` : ''}）` });
  if (a.priceMode === '企業独自価格' || made.some((m) => m.pricing.mode === '企業独自価格')) notes.push('企業独自価格の単価は D（企業独自価格）のファイルで入れます。');

  /* 親契約（移行で子契約を作った範囲・価格世代を記録する。自販機リースの台数は子契約を作るときに貸出から決まる。B のあとは refreshLease） */
  const cyc: [string, string] = made.length ? [prevMig?.cycles && prevMig.cycles[0] < made[0].cycleMonth ? prevMig.cycles[0] : made[0].cycleMonth, prevMig?.cycles && prevMig.cycles[1] > made[made.length - 1].cycleMonth ? prevMig.cycles[1] : made[made.length - 1].cycleMonth] : prevMig?.cycles ?? [o.st, o.st];
  /* 休止の状態は今のサイクルから決める（lifecycle.syncPauseState と同じ見方。取り込むたびに行き来しない） */
  const cur = cycleAt(r);
  const status2: Contract['status'] = status === '有効' || status === '利用休止' ? (cur && pauses.some((q) => q.fromCycle <= cur && cur <= q.toCycle) ? '利用休止' : '有効') : status;
  const ct2: Contract = { ...ct, status: status2, migration: { ...ct.migration!, cycles: cyc, ...(a.gen ?? prevMig?.gen ? { gen: a.gen ?? prevMig?.gen } : {}) } };
  putIf(r, K.contracts, exC, ct2);
  if (!exC) diff.push({ col: '親契約', before: '', after: `${ctId}（${kind}・${status}・開始 ${startCycle}）` });
  else diff.push(...diffRec('親契約', exC, ct2));
  diff.push(...kidDiff);

  /* ---- アカウント（メールは送らない）：仮登録＝未発行（ログインできない）、休止中・解約手続き中の拠点＝参照のみ、ほかは 発行済（ログイン前） ---- */
  if (a.issue !== false) {
    const corpAcc: MigAccount = tentative ? '未発行' : status === '利用休止' ? '参照のみ' : '発行済（ログイン前）';
    const branchAcc: MigAccount = tentative ? '未発行' : status === '利用休止' || closing ? '参照のみ' : '発行済（ログイン前）';
    if (corp) ensureAccount(r, o.ix, corp.id, corp.name, { type: 'corp', corpId: corp.id }, corpAcc);
    ensureAccount(r, o.ix, a.branchId, nextB.name, { type: 'branch', branchId: a.branchId }, branchAcc);
  }
  /* 仮登録は申込（受付中）にして、運営の申込の受付（受付 → 契約設定 → 本登録）に載せる。仮登録でなくなった申込は取り下げる */
  if (tentative) {
    const app = syncApplication(r, a, { corp, branch: nextB, ct: ct2, plan, course, gen: a.gen, st: o.st });
    if (app) diff.push({ col: '申込', before: app.before, after: app.after });
  } else if (exC?.status === '仮登録') withdrawApplication(r, a.branchId, corp?.id ?? null);
  void corpBefore;
  o.ix.contracts.set(a.branchId, ct2);
  if (!exC) o.ix.cp++;
  const changed = diff.some((d) => !(d.col === '法人' && d.after === '' && d.before === ''));
  return { created: !exB, changed, diff: exB ? diff.filter((d) => d.before !== d.after) : diff, notes, children: made.map((m) => m.id) };
}

/* ===================================================================== */
/* B. 設備（貸出）                                                          */
/* ===================================================================== */

export type LoanIn = { branchId: string; modelId: string; qty: number; startOn?: string; memo?: string };

/** 1行＝1拠点 × 1機種。同じ拠点・機種の貸出があれば上書き。貸出日が空なら当初契約開始年月（なければ契約の開始月）の1日を推定として入れて印を付ける（§9） */
export function migrateLoan(r: DocRepo, a: LoanIn, ix: MigIndex): { created: boolean; diff: SiteOut['diff'] } {
  const br = r.get<Branch>(K.branches, a.branchId);
  if (!br) bad(`拠点 ${a.branchId} がありません（先に A ファイルで拠点を取り込んでください）`);
  if (br!.source !== MIGRATED) bad(`拠点 ${a.branchId} は移行で作った拠点ではありません`);
  const model = r.get<Model>(K.models, a.modelId);
  if (!model || model.status === '削除済') bad(`機種ID ${a.modelId} がありません`);
  if (!Number.isInteger(a.qty) || a.qty < 1) bad('台数は1以上の整数で入れてください');
  const ct = ix.contracts.get(a.branchId);
  const mine = ix.loans.get(a.branchId) ?? [];
  const ex = mine.find((l) => l.modelId === a.modelId && l.status !== '回収済');
  const keep = ex && !ex.startOnBlank ? ex.startOn : undefined;
  const startOn = a.startOn ?? keep ?? (br!.originalStartOn || ymStart(ct?.startCycle ?? monthOf(today())));
  const blank = !a.startOn && !keep;
  const closing = ct?.status === '解約手続き中';
  const id = ex?.id ?? `LN-${pad(ix.ln, 4)}`;
  const loan: Loan = {
    ...(ex ?? {}), id, branchId: a.branchId, modelId: a.modelId, qty: a.qty, startOn, status: closing ? '回収予定' : '貸出中', countFrom: startOn, source: MIGRATED,
    ...(closing ? { dueOn: ct!.endOn } : {}), ...(a.memo !== undefined ? { note: a.memo } : {}),
  };
  if (blank) loan.startOnBlank = true; else delete loan.startOnBlank;
  r.put<Loan>(K.loans, id, loan);
  ix.loans.set(a.branchId, [...mine.filter((l) => l.id !== id), loan]);
  if (!ex) ix.ln++;
  /* 自販機があれば、コースが空だった契約は ESライト（自販機）に合わせ直し・自販機リースの台数をそろえる */
  try {
    if (ct) { alignCourse(r, ix, ct); refreshLease(r, ix.contracts.get(a.branchId) ?? ct); }
  } catch (e) {
    ix.loans.set(a.branchId, mine);
    if (!ex) ix.ln--;
    throw e;
  }
  const diff = ex ? diffRec(`設備 ${a.modelId}`, ex, loan) : [{ col: `設備 ${a.modelId}`, before: '', after: `${a.qty}台（${blank ? `貸出日 未入力・推定 ${startOn}` : startOn}）` }];
  return { created: !ex, diff };
}

/** コースが空で既定にした契約：自販機の貸出の有無で ESライト（自販機）／ESライト（冷蔵庫）に合わせる（運営が直したコースは変えない） */
function alignCourse(r: DocRepo, ix: MigIndex, ct: Contract) {
  const m = ct.migration;
  if (!m?.courseBlank || !m.courseDefault) return;
  const want: Course = hasVm(r, ix, ct.branchId) ? LIGHT_VM : LIGHT;
  if (want === m.courseDefault) return;
  let moved = 0;
  const gen = m.gen;
  for (const cc of kidsOf(r, ct).filter((x) => !childLocked(x) && x.course === m.courseDefault)) {
    const plan = r.get<Plan>(K.plans, cc.planId);
    if (!plan?.prices.some((p) => p.course === want)) continue;
    const g = gen ? genOf(plan, gen) : undefined;
    r.put<ChildContract>(K.children, cc.id, priced(r, withPlan(r, { ...cc, course: want }, cc.planId, want), g && usesGen(cc, g) ? g : undefined));
    moved++;
  }
  if (moved) {
    const next: Contract = { ...ct, migration: { ...m, courseDefault: want } };
    r.put<Contract>(K.contracts, ct.id, next);
    ix.contracts.set(ct.branchId, next);
  }
}

/* ===================================================================== */
/* C. 担当者                                                                */
/* ===================================================================== */

export type ContactIn = { kind: Contact['kind']; name: string; kana?: string; email?: string; tel?: string };
const MAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
export const isMail = (s: string) => MAIL.test(s);

/**
 * 1つの法人・拠点の担当者を、ファイルの中身で置き換える（取り直し：キーにできる項目がないため）。メイン担当者は1人。請求担当者がいなければメイン担当者と同じ。
 * マニュアルのご案内（M13）・担当者の変更の通知は送らない。法人・拠点のアカウントのメールが空ならメイン担当者のメールを入れる
 */
export function migrateContacts(r: DocRepo, owner: { type: 'corp' | 'branch'; id: string }, rows: ContactIn[], ix: MigIndex) {
  const rec = owner.type === 'corp' ? r.get<Corp>(K.corps, owner.id) : r.get<Branch>(K.branches, owner.id);
  if (!rec) bad(`${owner.type === 'corp' ? '法人' : '拠点'} ${owner.id} がありません（先に A ファイルを取り込んでください）`);
  if (rec!.source !== MIGRATED) bad(`${owner.id} は移行で作った${owner.type === 'corp' ? '法人' : '拠点'}ではありません`);
  const mains = rows.filter((x) => x.kind === 'メイン担当者');
  if (mains.length > 1) bad(`メイン担当者が${mains.length}人います（1人だけ。ほかはサブ担当者に）`);
  if (rows.filter((x) => x.kind === '請求担当者').length > 1) bad('請求担当者が2人以上います（1人だけ）');
  const list = [...rows];
  if (!list.some((x) => x.kind === '請求担当者') && mains[0]) list.push({ ...mains[0], kind: '請求担当者' });
  const key = `${owner.type}:${owner.id}`;
  const old = ix.contacts.get(key) ?? [];
  const order: Contact['kind'][] = ['メイン担当者', '請求担当者', 'サブ担当者'];
  const sig = (xs: { kind: string; name: string; kana?: string; email?: string; tel?: string }[]) =>
    JSON.stringify(xs.map((x) => [x.kind, x.name, x.kana ?? '', x.email ?? '', x.tel ?? '']).sort());
  /* 前と同じ内容なら変えない（同じファイルを取り込み直しても何も変わらない） */
  if (old.length && sig(old) === sig(list)) return { before: old.length, after: list.length, same: true };
  for (const c of old) r.remove(K.contacts, c.id);
  let n = ix.pc;
  const made: Contact[] = [];
  for (const x of [...list].sort((a, b) => order.indexOf(a.kind) - order.indexOf(b.kind))) {
    const id = `PC${pad(n++, 5)}`;
    const c: Contact = { id, owner, kind: x.kind, name: x.name, kana: x.kana ?? '', email: x.email ?? '', tel: x.tel ?? '' };
    r.put<Contact>(K.contacts, id, c);
    made.push(c);
  }
  const acc = r.get<Account>(K.accounts, owner.id);
  if (acc && !acc.email && mains[0]?.email) r.put<Account>(K.accounts, acc.id, { ...acc, email: mains[0].email });
  /* 仮登録の申込（受付中）の拠点のメイン担当者も合わせる（受付で「メイン担当者（氏名・メール）」が要るため） */
  if (owner.type === 'branch' && mains[0]) {
    const app = r.list<Application>(K.apps).find((x) => isMigApp(x) && x.status === '受付中' && x.branchIds.includes(owner.id));
    const i = app?.setup?.branches.findIndex((b) => b.branchId === owner.id) ?? -1;
    if (app?.setup && i >= 0) {
      const setup = structuredClone(app.setup);
      setup.branches[i].contact = { name: mains[0].name, email: mains[0].email ?? '', tel: mains[0].tel ?? '' };
      r.put<Application>(K.apps, app.id, { ...app, setup });
    }
  }
  ix.contacts.set(key, made);
  ix.pc = n;
  return { before: old.length, after: list.length, same: false };
}

/* ===================================================================== */
/* D. 企業独自価格                                                          */
/* ===================================================================== */

export type PriceIn = { branchId: string; productId: string; netYen: number };

/** 税抜の単価 → 税込（商品マスタの税率・1円未満切り捨て）。子契約の価格（pricing.prices）は税込の円（lib/domain/types.ts） */
export function grossOf(r: DocRepo, productId: string, netYen: number) {
  const p = r.get<Product>(K.products, productId);
  const rate = r.get<TaxRate>(K.taxRates, p?.taxRateId ?? '')?.rate ?? DEFAULT_RATES[p?.taxRateId ?? ''] ?? 8;
  return Math.floor((netYen * (100 + rate)) / 100);
}

/** 拠点の契約の子契約（確定・請求済を除く）に、品番の企業独自価格を入れる（同じ品番は上書き） */
export function migratePrice(r: DocRepo, a: PriceIn, ix: MigIndex) {
  const br = r.get<Branch>(K.branches, a.branchId);
  if (!br) bad(`拠点 ${a.branchId} がありません（先に A ファイルを取り込んでください）`);
  const ct = ix.contracts.get(a.branchId);
  if (!ct) bad(`拠点 ${a.branchId} の契約がありません`);
  const kids = kidsOf(r, ct);
  if (!kids.length || !kids.some((k) => k.pricing.mode === '企業独自価格')) bad(`拠点 ${a.branchId} は 価格＝企業独自価格 ではありません（A ファイルの「価格」を企業独自価格にしてください）`);
  const p = r.get<Product>(K.products, a.productId);
  if (!p || p.status === '削除済') bad(`品番 ${a.productId} が商品マスタにありません`);
  if (!Number.isInteger(a.netYen) || a.netYen < 0) bad('単価（税抜）は0以上の整数の円で入れてください');
  const gross = grossOf(r, a.productId, a.netYen);
  let before = '';
  let n = 0;
  for (const k of kids) {
    if (childLocked(k) || k.pricing.mode !== '企業独自価格') continue;
    if (!before && k.pricing.prices[a.productId] !== undefined) before = String(k.pricing.prices[a.productId]);
    r.put<ChildContract>(K.children, k.id, { ...k, pricing: { ...k.pricing, prices: { ...k.pricing.prices, [a.productId]: gross } } });
    n++;
  }
  if (!n) bad(`拠点 ${a.branchId} の子契約はすべて確定・請求済です（変えられません）`);
  return { before, gross, children: n };
}

/* ===================================================================== */
/* 差分の表示                                                               */
/* ===================================================================== */

const LABEL: Record<string, string> = {
  name: '名前', kana: 'フリガナ', contractName: '契約名義', billToName: '請求先名', salesRepId: 'ES営業担当', address: '住所', tel: '電話番号', fax: 'FAX', billing: '請求条件',
  employees: '従業員数', originalStartOn: '当初契約開始日', receiveWindows: '受取できる時間帯', deliveryNote: '設置場所・納品の条件', floor: '設置フロア', note: 'メモ',
  noStockCheck: '棚卸なし', status: '状態', orderReminder: 'ご注文のリマインド', deliveryCond: '納品の条件', kind: '契約区分', startCycle: '開始サイクル月', endOn: '解約日',
  agencyId: '代理店', billTo: '請求先', qty: '台数', startOn: '貸出日', billingBlank: '空だった請求条件',
};
const SKIP = new Set(['id', 'registeredAt', 'source', 'kindHistory', 'migration', 'countFrom', 'startOnBlank', 'branchId', 'corpId', 'modelId', 'trialExt']);
const show = (v: unknown): string => (v === undefined || v === null ? '' : typeof v === 'object' ? (Array.isArray(v) ? v.map(show).join('・') : Object.values(v as object).map(show).filter(Boolean).join(' ')) : String(v));

function diffRec(title: string, before: object, after: object): SiteOut['diff'] {
  const out: SiteOut['diff'] = [];
  const b = before as Record<string, unknown>, a = after as Record<string, unknown>;
  for (const k of Object.keys(a)) {
    if (SKIP.has(k) || JSON.stringify(a[k]) === JSON.stringify(b[k])) continue;
    out.push({ col: `${title}：${LABEL[k] ?? k}`, before: show(b[k]), after: show(a[k]) });
  }
  return out;
}

/* ===================================================================== */
/* 要補完                                                                   */
/* ===================================================================== */

export type TodoItem = { code: string; label: string; level: '法人' | '拠点' | '契約' | '設備' | '担当者'; where: 'corp' | 'branch' | 'child' | 'csv' | 'application' };
export type TodoRow = {
  id: string; branchId: string; branchName: string; corpId: string; corpName: string; contractId: string; kind: string; status: string; planId: string;
  childId: string; appId: string; importedAt: string; items: TodoItem[]; labels: string; codes: string; count: number;
  /** 終わりが未定の休止の開始月（要補完「休止の期間・再開月」の入力画面の初期値。なければ ''） */
  pauseFrom: string;
};

/** 要補完の項目の一覧（検索の選択肢。画面と CSV で同じ名前） */
export const TODO_LABELS: Record<string, string> = {
  'corp.kana': '法人名フリガナ', 'corp.billTo': '請求先法人名', 'corp.tel': '法人の電話番号', 'corp.billing': '法人の請求条件', 'corp.debit': '口座振替の手続き状況', 'corp.contact': '法人のメイン担当者',
  'branch.kana': '拠点名フリガナ', 'branch.tel': '拠点の電話番号', 'branch.floor': '設置フロア', 'branch.emp': '従業員数概算', 'branch.windows': '受取できる時間帯',
  'branch.start': '当初契約開始年月', 'branch.cond': '納品の条件', 'branch.contact': '拠点のメイン担当者',
  'contract.billing': '拠点の請求条件', 'contract.price': '企業独自価格の単価', 'contract.delivery': '配送の設定', 'loan.date': '貸出日',
  'contract.application': '仮登録（申込の承認が必要）', 'contract.pause': '休止の期間・再開月',
};

/**
 * 移行した拠点のうち、補完する項目が残っているもの（拠点ごと）。運営が画面で埋める（または A〜D を取り込み直す）と一覧から消える。
 * 補完する項目（移行CSV_列の案 の「補完」と契約_01 §9-1）：フリガナ・電話・請求条件・設置フロア（自販機）・従業員数・受取時間帯・当初契約開始年月・貸出日・
 *   納品の条件・メイン担当者のメール・企業独自価格の単価・配送（枠・倉庫・配送会社＝フェーズ1から出せない）
 */
export function todoOf(r: DocRepo): TodoRow[] {
  const corps = new Map(r.list<Corp>(K.corps).map((c) => [c.id, c]));
  const contracts = new Map(r.list<Contract>(K.contracts).map((c) => [c.branchId, c]));
  const kids = new Map<string, ChildContract[]>();
  for (const k of r.list<ChildContract>(K.children)) if (!k.canceled) kids.set(k.contractId, [...(kids.get(k.contractId) ?? []), k]);
  const loans = new Map<string, Loan[]>();
  for (const l of r.list<Loan>(K.loans)) loans.set(l.branchId, [...(loans.get(l.branchId) ?? []), l]);
  const models = new Map(r.list<Model>(K.models).map((m) => [m.id, m]));
  /* 終わりが未定の休止（移行の休止中）・仮登録の申込（受付中・契約設定中） */
  const openPauses = new Map(r.list<Pause>(K.pauses).filter(isOpenPause).map((p) => [p.contractId, p.fromCycle] as const));
  const openPause = new Set(openPauses.keys());
  const appOf = new Map<string, string>();
  for (const x of r.list<Application>(K.apps)) if (isMigApp(x) && ['受付中', '契約設定中'].includes(x.status)) for (const id of x.branchIds) appOf.set(id, x.id);
  const contacts = r.list<Contact>(K.contacts);
  const mainOf = (type: 'corp' | 'branch', id: string) => contacts.find((c) => c.owner.type === type && c.owner.id === id && c.kind === 'メイン担当者');
  const out: TodoRow[] = [];
  for (const b of r.list<Branch>(K.branches)) {
    if (b.source !== MIGRATED || b.status === '取消') continue;
    const corp = b.corpId ? corps.get(b.corpId) : undefined;
    const ct = contracts.get(b.id);
    const items: TodoItem[] = [];
    const add = (code: string, level: TodoItem['level'], where: TodoItem['where']) => items.push({ code, label: TODO_LABELS[code], level, where });
    if (corp?.source === MIGRATED) {
      if (!corp.kana.trim()) add('corp.kana', '法人', 'corp');
      if (!corp.billToName.trim()) add('corp.billTo', '法人', 'corp');
      if (!corp.tel.trim()) add('corp.tel', '法人', 'corp');
      if (corp.billingBlank?.length) items.push({ code: 'corp.billing', label: `${TODO_LABELS['corp.billing']}（${corp.billingBlank.join('・')}）`, level: '法人', where: 'corp' });
      if (corp.billing.payMethod === '口座振替' && !corp.billing.debitStatus) add('corp.debit', '法人', 'corp');
      const m = mainOf('corp', corp.id);
      if (!m || !isMail(m.email)) items.push({ code: 'corp.contact', label: `${TODO_LABELS['corp.contact']}${m ? 'のメール' : ''}（アカウントを作るため）`, level: '担当者', where: 'corp' });
    }
    if (!b.kana.trim()) add('branch.kana', '拠点', 'branch');
    if (!b.tel.trim()) add('branch.tel', '拠点', 'branch');
    const vm = (loans.get(b.id) ?? []).some((l) => l.status === '貸出中' && models.get(l.modelId)?.category === '自販機') || (kids.get(ct?.id ?? '') ?? []).some((k) => k.course === LIGHT_VM);
    if (vm && !(b.floor ?? '').trim()) add('branch.floor', '拠点', 'child');
    if (!(b.employees > 0)) add('branch.emp', '拠点', 'branch');
    if (!b.receiveWindows.length) add('branch.windows', '拠点', 'csv');
    if (!b.originalStartOn && ct?.status !== '仮登録') add('branch.start', '拠点', 'branch');
    const dc = b.deliveryCond;
    if (dc && (!dc.shift || !dc.short)) items.push({ code: 'branch.cond', label: `${TODO_LABELS['branch.cond']}（${[!dc.shift ? '納品不可になった場合' : '', !dc.short ? '消費期限の短い商品の扱い' : ''].filter(Boolean).join('・')}）`, level: '拠点', where: 'csv' });
    const bm = mainOf('branch', b.id);
    if (!bm || !isMail(bm.email)) items.push({ code: 'branch.contact', label: `${TODO_LABELS['branch.contact']}${bm ? 'のメール' : ''}`, level: '担当者', where: 'branch' });
    if (ct?.billingBlank?.length) items.push({ code: 'contract.billing', label: `${TODO_LABELS['contract.billing']}（${ct.billingBlank.join('・')}）`, level: '契約', where: 'branch' });
    if (ct?.status === '仮登録') add('contract.application', '契約', 'application');
    if (ct && openPause.has(ct.id)) add('contract.pause', '契約', 'branch');
    const live = (kids.get(ct?.id ?? '') ?? []).sort((x, y) => x.cycleMonth.localeCompare(y.cycleMonth));
    if (live.some((k) => k.pricing.mode === '企業独自価格') && !live.some((k) => Object.keys(k.pricing.prices).length)) add('contract.price', '契約', 'csv');
    if (live.length && !live.some((k) => k.channels.length)) add('contract.delivery', '契約', 'child');
    const blankLoans = (loans.get(b.id) ?? []).filter((l) => l.startOnBlank);
    if (blankLoans.length) items.push({ code: 'loan.date', label: `${TODO_LABELS['loan.date']}が未入力（${blankLoans.map((l) => l.modelId).join('・')}。最低利用期間・違約金は推定）`, level: '設備', where: 'csv' });
    if (!items.length) continue;
    out.push({
      id: b.id, branchId: b.id, branchName: b.name, corpId: corp?.id ?? '', corpName: corp?.name ?? '（法人なし）', contractId: ct?.id ?? '', kind: ct?.kind ?? '', status: ct?.status ?? '',
      planId: live[0]?.planId ?? '', childId: live[0]?.id ?? '', appId: appOf.get(b.id) ?? '', importedAt: (ct?.migration?.at ?? b.registeredAt).slice(0, 10), items,
      labels: items.map((x) => x.label).join(' ／ '), codes: items.map((x) => x.code).join(' '), count: items.length, pauseFrom: openPauses.get(ct?.id ?? '') ?? '',
    });
  }
  return out.sort((x, y) => x.branchId.localeCompare(y.branchId));
}

/* ===================================================================== */
/* check.run（台帳「既存のお客様の移行 CSV」・契約_01 §9-1）                  */
/* ===================================================================== */

/**
 * 移行（source＝移行）の法人・拠点・契約の決まり：ID はフェーズ1の ID（CU＋5桁）・拠点に親契約が1つ・移行の拠点の法人は移行の法人（または法人なし）・
 * 担当者のメイン担当者は1人・請求担当者も1人・移行の貸出は移行の拠点・貸出日 未入力は推定の日付つき・企業独自価格の品番は商品マスタにある
 */
export function migrationProblems(r: DocRepo): string[] {
  const p: string[] = [];
  const need = (cond: boolean, msg: string) => { if (!cond) p.push(msg); };
  const corps = new Map(r.list<Corp>(K.corps).map((c) => [c.id, c]));
  const branches = r.list<Branch>(K.branches);
  const contracts = r.list<Contract>(K.contracts);
  for (const c of corps.values()) if (c.source === MIGRATED) need(PHASE1_ID.test(c.id), `移行の法人 ${c.id} の ID がフェーズ1の形（CU＋5桁）でない`);
  for (const b of branches) {
    if (b.source !== MIGRATED) continue;
    need(PHASE1_ID.test(b.id), `移行の拠点 ${b.id} の ID がフェーズ1の形（CU＋5桁）でない`);
    need(!b.corpId || corps.get(b.corpId)?.source === MIGRATED, `移行の拠点 ${b.id} の法人 ${b.corpId} が移行の法人でない`);
    need(contracts.filter((c) => c.branchId === b.id && c.source === MIGRATED).length === 1, `移行の拠点 ${b.id} に移行の親契約が1つない`);
  }
  /* 仮登録で取り込んだ契約：子契約がなく、運営の申込（受付中・契約設定中）がある。終わりが未定の休止は移行の契約だけ */
  const apps = r.list<Application>(K.apps).filter((x) => isMigApp(x) && ['受付中', '契約設定中'].includes(x.status));
  const kidOf = new Set(r.list<ChildContract>(K.children).filter((k) => !k.canceled).map((k) => k.contractId));
  for (const c of contracts) {
    if (c.source !== MIGRATED) continue;
    if (c.status === '仮登録') {
      need(!kidOf.has(c.id), `仮登録の移行の契約 ${c.id} に子契約がある（本登録で作る）`);
      need(apps.some((x) => x.branchIds.includes(c.branchId)), `仮登録の移行の契約 ${c.id} の申込（受付中・契約設定中）がない`);
    }
  }
  for (const q of r.list<Pause>(K.pauses)) if (isOpenPause(q)) need(contracts.find((c) => c.id === q.contractId)?.source === MIGRATED, `終わりが未定の休止 ${q.id} が移行の契約でない`);
  const mains = new Map<string, number>();
  const bills = new Map<string, number>();
  for (const c of r.list<Contact>(K.contacts)) {
    const rec = c.owner.type === 'corp' ? corps.get(c.owner.id) : c.owner.type === 'branch' ? r.get<Branch>(K.branches, c.owner.id) : undefined;
    if (rec?.source !== MIGRATED) continue;
    const key = `${c.owner.type}:${c.owner.id}`;
    if (c.kind === 'メイン担当者') mains.set(key, (mains.get(key) ?? 0) + 1);
    if (c.kind === '請求担当者') bills.set(key, (bills.get(key) ?? 0) + 1);
  }
  for (const [k, n] of mains) need(n === 1, `移行の ${k} のメイン担当者が ${n}人（1人）`);
  for (const [k, n] of bills) need(n === 1, `移行の ${k} の請求担当者が ${n}人（1人）`);
  for (const l of r.list<Loan>(K.loans)) {
    if (l.source !== MIGRATED) { need(!l.startOnBlank, `貸出 ${l.id} は移行でないのに貸出日 未入力の印がある`); continue; }
    need(r.get<Branch>(K.branches, l.branchId)?.source === MIGRATED, `移行の貸出 ${l.id} の拠点 ${l.branchId} が移行の拠点でない`);
    need(/^\d{4}\/\d{2}\/\d{2}$/.test(l.startOn), `移行の貸出 ${l.id} の貸出日（推定を含む）の形が違う`);
  }
  for (const k of r.list<ChildContract>(K.children)) {
    if (k.canceled || k.pricing.mode !== '企業独自価格' || contracts.find((c) => c.id === k.contractId)?.source !== MIGRATED) continue;
    for (const id of Object.keys(k.pricing.prices)) need(!!r.get(K.products, id), `子契約 ${k.id} の企業独自価格の品番 ${id} が商品マスタにない`);
  }
  return p;
}

/**
 * 移行した「休止中」のお客様の休止の期間・再開月を決める（要補完「休止の期間・再開月」の画面から。専用の画面を置く：hong 2026-10-05）。
 * 終わりが未定の休止（PAUSE_OPEN）の、開始月（省くと今の開始月のまま）と再開月を入れる。
 * 再開の申請を承認したときと同じ反映（lifecycle.applyResume：休止の終わり＝再開月の前月・再開の月からの子契約・今のサイクルが再開月以降なら契約を有効に戻す）
 */
export function setMigrationPause(r: DocRepo, a: { contractId: string; fromCycle?: string; resumeCycle: string }) {
  const ct = r.get<Contract>(K.contracts, a.contractId);
  if (!ct || ct.source !== MIGRATED) throw new ApiError('移行した契約ではありません', 400);
  const p = r.list<Pause>(K.pauses).find((x) => x.contractId === ct.id && isOpenPause(x));
  if (!p) throw new ApiError('終わりが未定の休止がありません（もう期間が決まっています）', 409);
  const ym = /^\d{4}-(0[1-9]|1[0-2])$/;
  const from = a.fromCycle || p.fromCycle;
  if (!ym.test(from) || !ym.test(a.resumeCycle)) throw new ApiError('開始月・再開月は yyyy-mm で入れてください', 400);
  if (a.resumeCycle <= from) throw new ApiError('再開月は、休止の開始月より後にしてください', 400);
  if (from !== p.fromCycle) r.put<Pause>(K.pauses, p.id, { ...p, fromCycle: from });
  const branchId = ct.branchId;
  const note = applyResume(r, { id: p.id, change: { resumeCycle: a.resumeCycle } } as unknown as Application, branchId, '移行');
  return { id: p.id, fromCycle: from, resumeCycle: a.resumeCycle, note };
}
