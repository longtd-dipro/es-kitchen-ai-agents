import type { DocRepo } from '@/lib/ops/core/area';
import { nowStamp, today } from '@/lib/supplier/dates';
import { addYm } from './menu';
import type { BillAdjustment, Billing, Branch, ChildContract, ChildFees, Contract, Corp, Invoice } from './types';

/*
 * 請求済みの月にかかる変更の調整明細（決定 TL-7 A・仕様整理 §1-1・§3）と、年払い（S3-1・S3-2）・解約の最終請求の決まり。
 *   調整明細（dm.billing.adjustments）：承認したとき、請求済みの子契約のサイクル月ごとに
 *     差額＝変更後のその月の前払い（① 費目＋費用）−（請求した前払い＋これまでの調整明細）
 *   を税率ごとに作る。日割りしない。次の請求書を作るとき、まだ載っていないものを1行ずつ載せる（運営の請求：lib/ops/billing/fromDomain.ts）。
 *   価格改定（価格世代の切り替え）では作らない（年払いも次の起算月まで今の料金・S3-2）。誤りの訂正では作る
 *   年払い：支払サイクル＝年払いの請求先は、起算月（契約開始のサイクル月から12ヶ月ごと）の前払いで12サイクル分を1通で請求。実績精算は毎月
 *   最終請求：解約日を含む実績精算の締め月の請求書（別の請求書は作らない・備考「最終請求」）。その入金期限のあとアカウントを停止
 */

export const ADJ = 'dm.billing.adjustments';
/** 税率（％）。税率マスタのどの率でもよい（2026-10-05：請求書は税率ごとの欄） */
type Rate = number;
/** 税率ごとの金額（税抜）。ない税率は 0 として読む（at） */
export type ByRate = Record<number, number>;

const zero = (): ByRate => ({});
const at = (m: ByRate, t: number) => m[t] ?? 0;
const byRate = (lines: { amountYen: number; taxRate: number }[]) => {
  const m = zero();
  for (const l of lines) m[l.taxRate] = at(m, l.taxRate) + l.amountYen;
  return m;
};
export const totalOf = (m: ByRate) => Object.values(m).reduce((a, x) => a + x, 0);
/** 2つの ByRate が同じか（ない税率は 0） */
export const sameByRate = (a: ByRate, b: ByRate) => ratesInAll(a, b).every((t) => (a[t] ?? 0) === (b[t] ?? 0));
const ratesInAll = (...ms: ByRate[]) => [...new Set(ms.flatMap((m) => Object.keys(m).map(Number)))];
const total = (m: ByRate) => Object.values(m).reduce((a, x) => a + x, 0);
/** 2つの ByRate の税率（大きい順） */
const ratesIn = (...ms: ByRate[]) => [...new Set(ms.flatMap((m) => Object.keys(m).map(Number)))].sort((a, b) => b - a);

/** 子契約のその月の前払い（税率ごと・税抜）＝① 費目（fees を渡すとその値）＋費用（extras）。null＝その月を止めた（0円） */
export function prepayOf(cc: Pick<ChildContract, 'fees' | 'extras'>, fees?: ChildFees | null): ByRate {
  if (fees === null) return zero();
  return byRate([...((fees ?? cc.fees)?.lines ?? []), ...(cc.extras ?? [])]);
}

/** この子契約の調整明細 */
export const adjustmentsOf = (r: DocRepo, ccId: string) => r.list<BillAdjustment>(ADJ).filter((a) => a.childContractId === ccId);

/** 費用の調整明細（違約金・設備の費用）。月の前払いの差額とは別に数える（プランの変更などで打ち消さない） */
const CHARGE_KINDS: BillAdjustment['kind'][] = ['違約金', '設備の費用', '資材の追加配送'];
/** いままでに請求した（する）その月の前払い＝前払い＋これまでの差額の調整明細 */
export function billedOf(r: DocRepo, cc: ChildContract): ByRate {
  const b = prepayOf(cc);
  for (const a of adjustmentsOf(r, cc.id).filter((x) => !CHARGE_KINDS.includes(x.kind))) for (const l of a.lines) b[l.taxRate] = at(b, l.taxRate) + l.amountYen;
  return b;
}

/** その月の前払いを請求した請求書（年払いは cycleTo までの行） */
export function prepayInvoiceOf(r: DocRepo, branchId: string, ym: string) {
  return r.list<Invoice>('dm.billing.invoices').find((x) => x.status !== '取消' && x.lines.some((l) => l.kind === '前払い' && l.branchId === branchId
    && (x.cycleMonth === ym || (!!l.cycleTo && x.cycleMonth <= ym && ym <= l.cycleTo))));
}

export const nextId = (r: DocRepo) => {
  const p = `AJ-${today().slice(2).replace(/\//g, '')}-`;
  const n = Math.max(0, ...r.list<BillAdjustment>(ADJ).filter((x) => x.id.startsWith(p)).map((x) => Number(x.id.slice(p.length)) || 0)) + 1;
  return `${p}${String(n).padStart(4, '0')}`;
};

export type AdjCtx = { kind: BillAdjustment['kind']; reason: string; applicationId: string; by: string };

/**
 * 請求済みの月の差額を調整明細にする（target＝変更後のその月の前払い。prepayOf で作る）。差がなければ作らない。
 * 行の名前の例：「2026-12 サイクル分 プランの変更（100プラン → 50プラン）差額」。返り値＝作った調整明細
 */
export function settleMonth(r: DocRepo, cc: ChildContract, target: ByRate, ctx: AdjCtx): BillAdjustment | null {
  const cur = billedOf(r, cc);
  const diffs = ratesIn(target, cur).map((t) => ({ t, d: at(target, t) - at(cur, t) })).filter((x) => x.d !== 0);
  if (!diffs.length) return null;
  /* 運営が請求済の子契約を締切までに直した差額は「{サイクル月}分の契約変更による差額」（台帳 F 運営A QC6） */
  const head = ctx.kind === '契約の変更'
    ? `${cc.cycleMonth} サイクル分の契約変更による差額${ctx.reason ? `（${ctx.reason}）` : ''}`
    : `${cc.cycleMonth} サイクル分 ${ctx.kind}${ctx.reason ? `（${ctx.reason}）` : ''}${total(target) === 0 && ctx.kind !== 'プランの変更' ? ' 前払いの返金' : ' 差額'}`;
  const x: BillAdjustment = {
    id: nextId(r), branchId: cc.branchId, contractId: cc.contractId, childContractId: cc.id, cycleMonth: cc.cycleMonth,
    kind: ctx.kind, reason: ctx.reason, applicationId: ctx.applicationId,
    lines: diffs.map(({ t, d }) => ({ name: diffs.length > 1 ? `${head}（${t}%対象）` : head, amountYen: d, taxRate: t })),
    billedYen: total(cur), afterYen: total(target),
    fromInvoiceId: prepayInvoiceOf(r, cc.branchId, cc.cycleMonth)?.id ?? '', invoiceId: '', at: nowStamp(), by: ctx.by,
  };
  r.put<BillAdjustment>(ADJ, x.id, x);
  return x;
}

/**
 * 運営が請求済の子契約の金額に効く項目を、契約変更の受付の締切までに直したときの差額（台帳 F 運営A QC6・2026-10-08）。
 * すでに出した請求書は変えない。差額（変更後の固定額 − 請求した額。マイナス＝減額・返金）を調整明細（契約の変更）にして次の請求書に1回だけ載せる。
 *   before／after＝この保存の前・後の前払い（prepayOf。同じマスタで計算するので、マスタの改定の差は入らない）。
 *   まだ請求書に載っていない「契約の変更」の調整明細は作り直す（続けて直したら合算・請求した額に戻したら消える）。載せ終えた分はそのまま、その後の差を新しく作る
 */
export function settleChange(r: DocRepo, cc: ChildContract, before: ByRate, after: ByRate, ctx: AdjCtx): BillAdjustment | null {
  const pend = adjustmentsOf(r, cc.id).filter((a) => a.kind === '契約の変更' && !a.invoiceId);
  const target = billedOf(r, cc);   /* 請求した額＋これまでの調整明細（載せていない分を含む） */
  for (const t of ratesIn(before, after)) target[t] = at(target, t) + at(after, t) - at(before, t);
  for (const a of pend) r.remove(ADJ, a.id);
  const reasons = [...new Set([...pend.map((a) => a.reason), ctx.reason].flatMap((x) => x.split('、')).filter(Boolean))];
  return settleMonth(r, cc, target, { ...ctx, reason: reasons.join('、') });
}

/** 請求済みの子契約に付けられない費用（違約金・設備の費用）を、次の請求書に載せる調整明細にする */
export function addCharge(r: DocRepo, a: { cc?: ChildContract; branchId: string; contractId: string; name: string; amountYen: number; taxRate: Rate } & AdjCtx): BillAdjustment | null {
  if (!a.amountYen) return null;
  const x: BillAdjustment = {
    id: nextId(r), branchId: a.branchId, contractId: a.contractId, childContractId: a.cc?.id ?? '', cycleMonth: a.cc?.cycleMonth ?? '',
    kind: a.kind, reason: a.reason, applicationId: a.applicationId,
    lines: [{ name: a.cc ? `${a.cc.cycleMonth} サイクル分 ${a.name}` : a.name, amountYen: a.amountYen, taxRate: a.taxRate }],
    billedYen: 0, afterYen: a.amountYen,
    fromInvoiceId: a.cc ? prepayInvoiceOf(r, a.cc.branchId, a.cc.cycleMonth)?.id ?? '' : '', invoiceId: '', at: nowStamp(), by: a.by,
  };
  r.put<BillAdjustment>(ADJ, x.id, x);
  return x;
}

/** まだ請求書に載っていない調整明細（拠点ごと） */
export const pendingAdjustments = (r: DocRepo, branchId?: string) =>
  r.list<BillAdjustment>(ADJ).filter((x) => !x.invoiceId && (!branchId || x.branchId === branchId)).sort((x, y) => x.id.localeCompare(y.id));

/** 請求書を発行・取消したとき、載せた調整明細の「載せた請求書」を付け外しする */
export function markAdjustments(r: DocRepo, inv: Pick<Invoice, 'id' | 'lines'>, on: boolean) {
  const ids = new Set(inv.lines.map((l) => l.adjId).filter(Boolean) as string[]);
  for (const x of r.list<BillAdjustment>(ADJ)) {
    if (on && ids.has(x.id) && x.invoiceId !== inv.id) r.put<BillAdjustment>(ADJ, x.id, { ...x, invoiceId: inv.id });
    if (!on && x.invoiceId === inv.id) r.put<BillAdjustment>(ADJ, x.id, { ...x, invoiceId: '' });
  }
}

/* ---------------- 年払い（S3-1・S3-2） ---------------- */

/** 親契約の請求の設定（請求先＝この拠点 なら親契約、ほかは法人） */
export function billingOfContract(r: DocRepo, ct: Pick<Contract, 'billTo' | 'billing' | 'branchId'>): Billing | undefined {
  if (ct.billTo === 'この拠点' && ct.billing) return ct.billing;
  const corpId = r.get<Branch>('dm.org.branches', ct.branchId)?.corpId;
  return corpId ? r.get<Corp>('dm.org.corps', corpId)?.billing : undefined;
}
export const isAnnual = (r: DocRepo, ct: Pick<Contract, 'billTo' | 'billing' | 'branchId'> | undefined) => !!ct && billingOfContract(r, ct)?.payCycle === '年払い';

const monthsFrom = (from: string, to: string) => {
  const [a, b] = [from, to].map((x) => x.split('-').map(Number));
  return (b[0] - a[0]) * 12 + (b[1] - a[1]);
};
/** 年払いの起算月：契約開始のサイクル月から12ヶ月ごと（S3-1）。ym を含む年の起算月 */
export const anchorOf = (startCycle: string, ym: string) => addYm(startCycle, Math.floor(monthsFrom(startCycle, ym) / 12) * 12);

/** 年払いの請求書（発行済・取消でない）でその月の前払いを請求したか */
export const annualCovered = (r: DocRepo, branchId: string, ym: string) =>
  r.list<Invoice>('dm.billing.invoices').some((x) => x.status !== '取消' && x.lines.some((l) => l.kind === '前払い' && l.branchId === branchId && !!l.cycleTo && x.cycleMonth <= ym && ym <= l.cycleTo));

/* ---------------- 解約の最終請求 ---------------- */

/** 解約日を含む実績精算の締め月（前月21日〜当月20日）。この締め月の請求書（翌月1日発行）が最終請求 */
export function finalBillMonth(endOn: string) {
  const [y, m, d] = endOn.split('/');
  const ym = `${y}-${m}`;
  return Number(d) <= 20 ? ym : addYm(ym, 1);
}
/** 最終請求の請求書の発行月 */
export const finalIssueMonth = (endOn: string) => addYm(finalBillMonth(endOn), 1);

/* ---------------- 承認の前の試算（データを変えない） ---------------- */

/**
 * DocRepo に書かずに fn を動かす（書いた中身は writes に残す）。承認の画面で「請求済みの月 n件・差額の合計」を出すときに使う。
 * 一覧（list）は元のデータに書いた中身を重ねる（ドキュメントの id で突き合わせる）
 */
export function dryRun<T>(r: DocRepo, fn: (x: DocRepo) => T): { out?: T; error?: string; writes: Map<string, Map<string, unknown>> } {
  const writes = new Map<string, Map<string, unknown>>();
  const w = (kind: string) => writes.get(kind) ?? writes.set(kind, new Map()).get(kind)!;
  let seq = 900000;
  const x: DocRepo = {
    list: <T2,>(kind: string) => {
      const ov = writes.get(kind);
      const base = r.list<T2>(kind);
      if (!ov) return base;
      const out = base.filter((d) => !ov.has(String((d as { id?: string }).id))).concat([...ov.values()].filter((v) => v !== null) as T2[]);
      return out.map((d) => structuredClone(d));
    },
    get: <T2,>(kind: string, id: string) => {
      const ov = writes.get(kind);
      if (ov?.has(id)) { const v = ov.get(id); return v === null ? undefined : structuredClone(v) as T2; }
      return r.get<T2>(kind, id);
    },
    put: (kind, id, data) => { w(kind).set(id, structuredClone(data)); },
    remove: (kind, id) => { w(kind).set(id, null); },
    nextSeq: () => ++seq,
  };
  try { return { out: fn(x), writes }; } catch (e) { return { error: e instanceof Error ? e.message : String(e), writes }; }
}
