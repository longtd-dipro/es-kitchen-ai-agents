import { nowStamp } from '@/lib/supplier/dates';
import billing from '@/lib/domain/areas/billing';
import org from '@/lib/domain/areas/org';
import type { Account, ChildContract, Invoice as DInvoice, BillingSettings, InvoiceSendStatus, Option, TaxRate } from '@/lib/domain/types';
import { defineArea, type DocRepo } from '../core/area';
import { actPeriod, billingLogic, PENALTY_LINE, type BillingLogic } from '../billing/logic';
import { exTax } from '@/lib/format/money';
import { PENALTY_OPTION } from '@/lib/domain/charges';
import { branchesFor, cashAllOf, cashListOf, cashMonthsOf, corpsFor, frozenOf, invoiceFor, issueOf, prodsOf, type BrState, type CoState, type InvFlag } from '../billing/fromDomain';
import { META } from '../billing/seed';
import { confirmAlertOf } from '../billing/confirmAlert';
import type { AdjLine, Adjust, BillingState, Br, Invoice, LogRow, Meta, Tax } from '../billing/types';

/*
 * 請求（在庫管理・実績精算・請求の確定・請求書）。元は 02_デモ/部品/15_運営_請求.html。
 * 読み取りは state（全データ）だけ。画面は lib/ops/billing/logic.ts で金額などを計算して出す。
 * 書き換えは下の actions。中身の計算は logic.ts と同じ関数を使う。Bill One への登録・発行は状態を変えるだけ（外部には送らない）。
 *
 * 事実は共通データ（lib/domain・dm.*）から読む（lib/ops/billing/fromDomain.ts）：法人・拠点・契約・子契約・棚卸・配送の報告・商品・請求書。
 * 請求書の入金・繰越・取消・発行は domain の billing の action で書く（法人Web にも同じ請求書が出る）。
 * 共通データにない運営の月次の確定の流れは、運営の kind に拠点ID・法人ID で持つ：
 *   billing.br（①②の確定・内訳の確定・価格調整・③ 調整・リードタイムの上書き・棚卸の取り込みのデモ）・billing.co（法人確定）・
 *   billing.adj（在庫調整 ADJ-…）・billing.inv（作成済み・未発行＝Bill One 登録済みの請求書。発行すると共通データへ）・
 *   billing.meta（締め月・設定、doc 'invFlags'＝共通データの請求書に付ける運営だけの印）・billing.log（操作ログ）
 * DB に残っている以前の見本（B1…・C1…・ADJ-201 など運営の見本の ID のもの）は読まない。
 */

const K = { meta: 'billing.meta', co: 'billing.co', br: 'billing.br', inv: 'billing.inv', adj: 'billing.adj', log: 'billing.log' } as const;
const FLAGS = 'invFlags';
const OPS_ID = 'Ad00012';
/** 操作したアカウント。サーバーは lib/server/access.ts の gate がログイン中のアカウントを args.by に入れる（ないときはログインのない mock：見本） */
type By = { by?: string };
const actor = (a: unknown): string => { const b = (a as By | null | undefined)?.by; return typeof b === 'string' && b ? b : OPS_ID; };
/** 操作ログ・在庫調整の「操作した人」（名前）。logic.ts は見本の名前（佐藤）で書くので、ログインしているときはその名前に置き換える */
const SAMPLE_WHO = '佐藤';

const isDomainId = (id: string) => /^CU\d{5}$/.test(id);
const flagsOf = (repo: DocRepo) => repo.get<Record<string, InvFlag>>(K.meta, FLAGS) ?? {};
/** 作成済み・未発行の請求書（運営の billing.inv。法人が共通データの ID のものだけ） */
const drafts = (repo: DocRepo) => repo.list<Invoice>(K.inv).filter((i) => i.status === 'REGISTERED' && (i.co === '' || isDomainId(i.co)) && !repo.get('dm.billing.invoices', i.id));

/** 事務手数料（棚卸の未報告）のオプション（ID は lib/domain/charges.ts）。金額・税率はオプションマスタから読む（運営の設定 cfg.penalty の写しは使わない） */
export { PENALTY_OPTION };
/** 事務手数料の金額（税抜）・税率：オプションマスタ OP000016（なければ billing.meta の値） */
export function penaltyCfg(repo: DocRepo, cfg: Meta['cfg']): Pick<Meta['cfg'], 'penalty' | 'penaltyTax'> {
  const op = repo.get<Option>('dm.master.options', PENALTY_OPTION);
  if (!op) return { penalty: cfg.penalty, penaltyTax: cfg.penaltyTax ?? 10 };
  const rate = repo.get<TaxRate>('dm.master.taxRates', op.taxRateId ?? 'TX02')?.rate;
  /* 税率マスタのどの率でも（請求書は税率ごとの欄：2026-10-05） */
  return { penalty: op.amountYen, penaltyTax: rate ?? 10 };
}


function load(repo: DocRepo): BillingState {
  const meta = repo.get<Meta>(K.meta, 'meta') ?? META;
  const adjs = repo.list<Adjust>(K.adj).filter((a) => isDomainId(a.br)).sort((a, b) => b.seq - a.seq);
  const brs = branchesFor(repo, meta.month, (id) => repo.get<BrState>(K.br, id), adjs);
  const name = (id: string) => brs.find((b) => b.id === id)?.name ?? repo.get<{ name: string }>('dm.org.branches', id)?.name ?? id;
  const flags = flagsOf(repo);
  return {
    month: meta.month, cfg: { ...meta.cfg, ...penaltyCfg(repo, meta.cfg) }, prods: prodsOf(repo, meta.month),
    cos: corpsFor(repo, brs, (id) => repo.get<CoState>(K.co, id)), brs,
    invoices: [...repo.list<DInvoice>('dm.billing.invoices').map((d) => invoiceFor(d, name, flags[d.id])), ...drafts(repo)],
    adjs,
  };
}

/**
 * check.run の確かめ（請求の後払いの税・2026/10/03）：
 *   販売価格（税込）から出した後払いの行（実績精算差額・現金回収差額・代替品）は、請求書の明細では税抜（＝税込 ÷ 1.08）。税を二重にかけない
 *   事務手数料はオプションマスタ OP000016 の金額・税率
 *   拠点の後払いの合計＝請求書に載せる後払いの行の合計
 */
export function arrTaxProblems(repo: DocRepo): string[] {
  const p: string[] = [];
  const need = (c: boolean, m: string) => { if (!c) p.push(m); };
  const S = load(repo), L = billingLogic(S);
  const op = repo.get<Option>('dm.master.options', PENALTY_OPTION);
  for (const b of S.brs) {
    const ls = L.arrLines(b);
    for (const l of ls) {
      need(Number.isInteger(l.a), `請求（後払い）${b.id} の「${l.n}」の金額が整数でない（${l.a}）`);
      if (l.incl != null) {
        need(l.a === exTax(l.incl, l.t), `請求（後払い）${b.id} の「${l.n}」：税込 ${l.incl}円 の税抜が ${l.a}円（${exTax(l.incl, l.t)}円のはず。税の二重がけ）`);
        need(Math.abs(l.a) <= Math.abs(l.incl), `請求（後払い）${b.id} の「${l.n}」の税抜 ${l.a}円 が税込 ${l.incl}円 より大きい`);
      }
      if (l.n === PENALTY_LINE && op) need(l.a === op.amountYen && l.t === S.cfg.penaltyTax, `請求（後払い）${b.id} の事務手数料 ${l.a}円・${l.t}% がオプションマスタ ${PENALTY_OPTION}（${op.amountYen}円）と違う`);
    }
    /* 実績精算が未確定の拠点は請求書に後払いを載せない（REQ-CT-301：確定後に翌月の請求書で精算） */
    const inv = L.invLines([b]).filter((x) => x.k === '後払い').reduce((s, x) => s + x.a, 0), want = b.actOK ? L.arrTot(b) : 0;
    need(inv === want, `請求（後払い）${b.id} の請求書の行の合計 ${inv}円 が後払いの合計 ${want}円 と違う`);
  }
  return p;
}

/** 運営だけが持つ拠点の月次の状態 */
/* ③ 調整は運営が入れた行だけ（共通データの調整明細＝dm は共通データにある） */
const brState = (b: Br): BrState => ({ id: b.id, fixOK: b.fixOK, actOK: b.actOK, actParts: b.actParts, adjMode: b.adjMode, adjYen: b.adjYen, adj: b.adj.filter((l) => !l.dm), leadOv: b.leadOv, filed: b.filed, ...(b.actLater ? { actLater: b.actLater } : {}) });

/** 請求書の変化を共通データへ（入金の指定・繰越・取消・発行）。未発行は運営の billing.inv へ */
function saveInvoices(repo: DocRepo, S: BillingState, by: string) {
  const flags = flagsOf(repo), idOf = (n: string) => S.brs.find((b) => b.name === n)?.id ?? '';
  for (const i of S.invoices) {
    const d = repo.get<DInvoice>('dm.billing.invoices', i.id);
    const { rqWd, unpaidAt, sendErr, retried, reissueOf, reissuedTo } = i;
    if (!d) {
      if (i.status === 'REGISTERED') { repo.put(K.inv, i.id, i); continue; }
      /* 発行した：共通データの請求書にする */
      billing.actions.issue(repo, { invoice: issueOf(i, idOf, actPeriod(i.m)) });
      repo.remove(K.inv, i.id);
      flags[i.id] = { reissueOf, retried };
      continue;
    }
    const st = () => repo.get<DInvoice>('dm.billing.invoices', i.id)!.status;
    if (i.status === 'WITHDRAWN' && st() !== '取消') billing.actions.withdraw(repo, { id: i.id, by });
    if (i.status === 'DISPATCHED' && st() === '繰越済') billing.actions.uncarry(repo, { fromId: i.id, by });
    /* 再請求の指定（未入金）→ 繰越の順に当てる */
    if ((i.unpaid || i.status === 'CARRIED') && ['発行済', '入金済'].includes(st())) billing.actions.setPayment(repo, { id: i.id, status: '未入金', by });
    if (i.status === 'CARRIED' && i.carriedTo && st() !== '繰越済') billing.actions.carry(repo, { fromId: i.id, toId: i.carriedTo, by });
    if (i.status === 'DISPATCHED' && !i.unpaid && !rqWd && st() === '未入金') billing.actions.setPayment(repo, { id: i.id, status: '発行済', by });
    flags[i.id] = { rqWd, unpaidAt, sendErr, retried, reissueOf, reissuedTo };
  }
  repo.put(K.meta, FLAGS, flags);
}

/** state を読み、logic で書き換えて保存する。返り値はトーストの文言 */
function mutate(repo: DocRepo, a: unknown, fn: (L: BillingLogic) => string | void) {
  const S = load(repo), before = new Set(S.adjs.map((x) => x.id)), logs: LogRow[] = [];
  const by = actor(a), name = (a as By | undefined)?.by ? repo.get<Account>('dm.account.accounts', by)?.name ?? by : '';
  const L = billingLogic(S, (who, what) => logs.push({ t: nowStamp(), who: name && who === SAMPLE_WHO ? name : who, what }));
  const msg = fn(L) ?? '';
  S.cos.forEach((c) => repo.put<CoState>(K.co, c.id, { id: c.id, confirmed: c.confirmed }));
  const at = nowStamp();
  S.brs.forEach((b) => {
    const prev = repo.get<BrState>(K.br, b.id);
    /* 確定したら金額を写して固める・確定解除で外す（影響一覧 A6） */
    const frozen = frozenOf(b, prev?.frozen, S.month, S.prods, at);
    repo.put<BrState>(K.br, b.id, { ...brState(b), ...(frozen ? { frozen } : {}) });
    /* ① 固定額の確定・確定解除 → その前払いの子契約の請求の状態（確定＝変えられない。請求済は変えない） */
    if (!!prev?.fixOK !== !!b.fixOK) {
      const cc = repo.get<ChildContract>('dm.org.childContracts', `${b.ct.no}-${L.tgtM(b).replace('-', '')}`);
      if (cc && !cc.canceled && cc.billStatus !== '請求済') org.actions.setBillStatus(repo, { id: cc.id, status: b.fixOK ? '確定' : '未確定', by });
    }
  });
  saveInvoices(repo, S, by);
  S.adjs.forEach((x) => {
    /* この操作で足した在庫調整の登録者 */
    repo.put(K.adj, x.id, name && !before.has(x.id) && x.by === `運営 ${SAMPLE_WHO}` ? { ...x, by: `運営 ${name}` } : x);
    before.delete(x.id);
  });
  before.forEach((id) => repo.remove(K.adj, id));
  logs.forEach((l) => repo.put(K.log, 'L' + repo.nextSeq(K.log), l));
  return { msg };
}

type ActualOp = { key: 'filed' | 'adjMode' | 'adjYen'; v: boolean | string | number };
type AdjInput = { n: string; a: number; t: Tax; kind: AdjLine['kind']; m: string; rep: AdjLine['rep']; to: string };
export type AdjOp = { op: 'add'; x: AdjInput } | { op: 'stop'; i: number } | { op: 'del'; i: number };

export default defineArea({
  name: 'billing',
  /* 事実は共通データ。ここは締め月・設定だけ（月次の確定などは操作したときにできる） */
  seed: () => ({ [K.meta]: [{ id: 'meta', data: META }] }),
  queries: {
    /** 請求の全データ（画面で logic.ts を使って計算する） */
    state: (repo): BillingState => load(repo),
    /** 請求の確定のアラート（21日から確定が済むまで・運営の TOP。lib/ops/billing/confirmAlert.ts） */
    confirmAlert: (repo) => confirmAlertOf(load(repo)),
    /** 操作ログ（新しい順） */
    log: (repo) => repo.list<LogRow>(K.log).reverse(),
    /** 集金管理（簡易版）：締め月の現金の集金（配送の報告）の一覧。台帳 F 2026-10-05 */
    cash: (repo, a: { m: string }) => cashListOf(repo, a.m),
    /** 集金管理で選べる月（現金の集金の報告がある月。台帳 F 2026-10-08） */
    cashMonths: (repo) => cashMonthsOf(repo),
    /** 集金管理の全行（月つき。検索の条件で月を絞る） */
    cashAll: (repo) => cashAllOf(repo),
  },
  actions: {
    /* ----- 実績精算（後払い） ----- */
    setPart: (repo, a: { id: string; k: 'loss' | 'cash' | 'adj'; v: boolean }) => mutate(repo, a, (L) => L.setPart(a.id, a.k, a.v)),
    /** 残りをまとめて確定 */
    actAll: (repo, a: { id: string }) => mutate(repo, a, (L) => L.actAll(a.id)),
    /** 確定を解除 */
    unAct: (repo, a: { id: string }) => mutate(repo, a, (L) => L.unAct(a.id)),
    bulkAct: (repo, a: { ids: string[] }) => mutate(repo, a, (L) => L.bulkAct(a.ids)),
    /** 実績精算の編集を保存（価格調整・棚卸の申告） */
    saveActual: (repo, a: { id: string; ops: ActualOp[] }) => mutate(repo, a, (L) => {
      a.ops.forEach((o) => L.editActual(a.id, o.key, o.v));
      return '保存しました';
    }),
    remind: (repo, a: { id: string }) => mutate(repo, a, (L) => L.remind(a.id)),

    /* ----- 在庫調整 ----- */
    /** 在庫調整の編集を保存（取り消す在庫調整と、商品ごとの数量・理由） */
    saveStock: (repo, a: { id: string; rows: { prod: number; q: number; r: string }[]; remove?: string[] }) => mutate(repo, a, (L) => {
      (a.remove ?? []).forEach((x) => L.removeAdjust(x));
      return L.addStockAdj(a.id, a.rows);
    }),
    addStockAdjBulk: (repo, a: { ids: string[]; reason: string; cells: { br: string; prod: number; q: number }[] }) => mutate(repo, a, (L) => L.addStockAdjBulk(a.ids, a.reason, a.cells)),
    removeAdjust: (repo, a: { id: string }) => mutate(repo, a, (L) => L.removeAdjust(a.id)),

    /* ----- 請求の確定（前払い）・③ 調整 ----- */
    setFix: (repo, a: { id: string; v: boolean }) => mutate(repo, a, (L) => L.setFix(a.id, a.v)),
    confirmFix: (repo, a: { id: string }) => mutate(repo, a, (L) => L.confirmFix(a.id)),
    confirmAllFix: (repo, a: { ids: string[] }) => mutate(repo, a, (L) => L.confirmAllFix(a.ids)),
    /** ③ 調整：共通データの調整明細（解約の設備引揚費）の金額を直す（0円＝外す） */
    editDmAdj: (repo, a: { adjId: string; amountYen: number } & By) => {
      const x = billing.actions.editAdjustment(repo, { id: a.adjId, amountYen: a.amountYen, by: actor(a) });
      return { msg: x.removed ? '調整明細を外しました' : '金額を保存しました' };
    },
    /** ③ 調整の編集を保存（追加・今月で終了・削除を順に当てる） */
    saveAdj: (repo, a: { id: string; ops: AdjOp[] }) => mutate(repo, a, (L) => {
      a.ops.forEach((o) => { if (o.op === 'add') L.addAdj(a.id, o.x); else if (o.op === 'stop') L.stopAdj(a.id, o.i); else L.delAdj(a.id, o.i); });
      return '保存しました';
    }),

    /* ----- 請求書（Bill One） ----- */
    /** 請求書を作成（Bill One に登録。外部には送らない） */
    makeInvoice: (repo, a: { co: string; br: string | null }) => mutate(repo, a, (L) => L.makeInvGrp(a.co, a.br)),
    /** Bill One で発行（DISPATCHED にする。外部には送らない） */
    dispatch: (repo, a: { id: string }) => mutate(repo, a, (L) => L.dispatchOne(a.id)),
    bulkGrp: (repo, a: { kind: 'make' | 'send'; keys: string[] }) => mutate(repo, a, (L) => L.bulkGrp(a.kind, a.keys)),
    withdraw: (repo, a: { id: string }) => mutate(repo, a, (L) => L.withdraw(a.id)),
    markUnpaid: (repo, a: { id: string; v: boolean }) => mutate(repo, a, (L) => L.markUnpaid(a.id, a.v)),
    carryOver: (repo, a: { from: string; to: string }) => mutate(repo, a, (L) => L.carryOver(a.from, a.to)),
    unCarry: (repo, a: { from: string }) => mutate(repo, a, (L) => L.unCarry(a.from)),
    addCarries: (repo, a: { id: string }) => mutate(repo, a, (L) => L.addCarries(a.id)),
    saveInvoice: (repo, a: { id: string; names: Record<number, string>; note: string }) => mutate(repo, a, (L) => L.saveInvoice(a.id, a.names, a.note)),
    /**
     * （デモ）Bill One の送付の状態を進める（共通データの billing.advanceSend。外部には送らない・課題 0-2）。
     * to＝'エラー' で送付エラー、省くと次へ（送付待ち → 送付済 → 開封済、エラー → 再送で送付待ち）
     */
    advanceSend: (repo, a: { id: string; to?: InvoiceSendStatus } & By) => {
      const x = billing.actions.advanceSend(repo, { id: a.id, to: a.to, by: actor(a) });
      return { msg: `${a.id}：送付の状態を「${x.send!.status}」にしました（デモ）` };
    },
  },
});
