import { taxTotal } from '@/lib/domain/invoiceTax';
import type { DocRepo } from '@/lib/ops/core/area';
import { corpTerm } from '@/lib/domain/terms';
import type { Branch, ChildContract, Contact, Contract, Corp, Invoice, Pause, StockCheck } from '@/lib/domain/types';
import { actPeriodOf, STOCK_IDS, ymJa } from './logic';
import type { BillState, CorpInv, CorpInvLine, CorpMeta, SiteMeta, Staff, StockCfg, StockRec } from './types';
import { today } from '@/lib/supplier/dates';

/*
 * 共通データ（lib/domain・dm.*）から、法人Web の請求書・棚卸報告の画面の形（CorpMeta・SiteMeta・CorpInv・StockCfg・StockRec）を作る。
 *   法人・拠点・担当者・契約 … dm.org
 *   請求書               … dm.billing.invoices
 *   棚卸報告             … dm.report.stockChecks
 */

const contactsOf = (r: DocRepo, type: 'corp' | 'branch', id: string) =>
  r.list<Contact>('dm.org.contacts').filter((c) => c.owner.type === type && c.owner.id === id);
/** 担当者の表の1行：[区分, 担当者名, フリガナ, メールアドレス, 電話番号] */
const staffOf = (cs: Contact[]): Staff[] => cs.map((c) => [c.kind, c.name, c.kana, c.email, c.tel]);
const contractOf = (r: DocRepo, branchId: string) => r.list<Contract>('dm.org.contracts').find((c) => c.branchId === branchId);
/** いちばん新しいサイクル月の子契約（取り消した子契約＝canceled は除く） */
const childOf = (r: DocRepo, branchId: string) =>
  r.list<ChildContract>('dm.org.childContracts').filter((x) => x.branchId === branchId && !x.canceled).sort((x, y) => y.cycleMonth.localeCompare(x.cycleMonth))[0];

/* ---------------- 法人・拠点 ---------------- */

export function corpMeta(r: DocRepo, corpId: string): CorpMeta | undefined {
  const c = r.get<Corp>('dm.org.corps', corpId);
  if (!c) return undefined;
  const cs = contactsOf(r, 'corp', corpId);
  const bill = cs.find((x) => x.kind === '請求担当者');
  return {
    id: c.id, name: c.name, bname: c.billToName || c.name, pay: c.billing.payMethod,
    billTo: bill ? `請求担当者：${bill.name} ／ ${bill.email}` : '—', staff: staffOf(cs),
  };
}

/** 法人の拠点（dm.org.branches の並び）。拠点アカウントのしぼり込みは呼ぶ側で */
export function siteMetas(r: DocRepo, corp: CorpMeta): SiteMeta[] {
  return r.list<Branch>('dm.org.branches').filter((b) => b.corpId === corp.id).map((b, seq) => {
    const ct = contractOf(r, b.id), ch = childOf(r, b.id);
    const paused = ct?.status === '利用休止';
    const forms = [...new Set((ch?.channels ?? []).map((x) => x.serviceForm).filter((x) => x !== '資材便'))];
    return {
      id: b.id, corpId: corp.id, seq, name: b.name,
      short: b.name.replace(corp.name, '').trim() || b.name,
      dlv: paused || !forms.length ? '—' : forms.map(corpTerm).join('・'),
      billTo: ct?.billTo ?? '法人',
      pay: ct?.billTo === 'この拠点' && ct.billing ? ct.billing.payMethod : corp.pay,
      esqr: !!ch?.app.allowEsqr, paused, staff: staffOf(contactsOf(r, 'branch', b.id)),
    };
  });
}

/* ---------------- 請求書 ---------------- */

/**
 * 請求書の状態 → 法人Web の表示（台帳 E 2026-10-05）：確定（金額は確定・Bill One へまだ送れていない）／請求済み（Bill One への送付が成功）だけ。入金済・未入金は出さない。
 * 再請求はバッジ（rebill＝相手の請求書番号）。取消は出さない（null）
 */
export function billStateOf(i: Invoice, todayYmd = today()): { st: BillState; rebill?: string } | null {
  if (i.status === '取消') return null;
  /* 請求済み＝Bill One への送付が成功した（送付済・開封済）。送付待ち・エラー・まだ送っていないものは 確定（送付の記録がない古い請求書は、入金済・未入金・繰越済なら請求済み）。hong 2026-10-05 */
  const st: BillState = i.send ? (i.send.status === '送付済' || i.send.status === '開封済' ? '請求済' : '確定') : ['入金済', '未入金', '繰越済'].includes(i.status) ? '請求済' : '確定';
  const carried = i.lines.find((l) => l.kind === '繰越')?.fromInvoiceId;
  const rebill = i.status === '繰越済' && i.carriedTo ? i.carriedTo : carried || undefined;
  return rebill ? { st, rebill } : { st };
}

/** 共通データの請求書を法人Web の形にする（後払いの内訳は共通データにないので1行のまま） */
export function corpInv(i: Invoice): CorpInv | null {
  const state = billStateOf(i);
  if (!state) return null;
  const lines: CorpInvLine[] = i.lines.map((l) => {
    /* 繰越（前の請求書の再請求）は区分「調整」・種類「再請求」（B-24） */
    if (l.kind === '繰越') return { site: '', kind: '調整', adj: '再請求', n: l.name, a: l.amountYen, rate: '—', tx: {}, qty: '1', from: l.fromInvoiceId };
    const kind = l.kind === '後払い' ? 'ご利用実績の精算' : '固定額';
    return { site: l.branchId, kind, n: l.name, a: l.amountYen, rate: `${l.taxRate}%`, tx: { [l.taxRate]: l.amountYen }, qty: '1', ...(l.group ? { mg: l.group } : {}) };
  });
  return {
    id: i.id, corpId: i.corpId, site: i.branchId, issued: i.issuedOn, mon: ymJa(i.issueMonth), tgt: `${ymJa(i.cycleMonth)}分`,
    actPeriod: actPeriodOf(i.actualPeriod) || '—', due: i.dueOn, st: state.st, ...(state.rebill ? { rebillMark: state.rebill } : {}), lines, total: i.total, tax: taxTotal(i), final: !!i.final,
  };
}

/* ---------------- 棚卸報告 ---------------- */

/** 棚卸する人：COOL便（路線便）だけの拠点＝企業担当者、ほかはドライバー（report.stockSheet と同じ決め方）。休止は休止の始めの月度から */
export function stockCfg(r: DocRepo, branchId: string): StockCfg {
  const ct = contractOf(r, branchId), ch = childOf(r, branchId);
  /* 棚卸報告なしの拠点（課題 2-1） */
  if (r.get<Branch>('dm.org.branches', branchId)?.noStockCheck) return { id: branchId, way: 'nocheck' };
  const last = ct ? r.list<Pause>('dm.org.pauses').filter((p) => p.contractId === ct.id).sort((x, y) => y.fromCycle.localeCompare(x.fromCycle))[0] : undefined;
  const pause = ct?.status === '利用休止' ? last : undefined;
  if (!ch && !pause) return { id: branchId, way: 'none' };
  const parcel = !!ch && ch.channels.filter((x) => x.temp !== '資材').every((x) => x.regime === 'parcel_carrier');
  /* 休止の始めの棚卸報告：休止の前の最後のお届けの月度（お客様が報告。休止の予定があれば、始まる前から） */
  const [y, m] = (last?.fromCycle ?? '').split('-').map(Number);
  const pauseCheck = last && y && m ? (m === 1 ? `${y - 1}-12` : `${y}-${String(m - 1).padStart(2, '0')}`) : undefined;
  return { id: branchId, way: parcel ? 'corp' : 'driver', ...(ct?.startCycle ? { from: ct.startCycle } : {}), ...(pause ? { pauseFrom: pause.fromCycle } : {}), ...(pauseCheck ? { pauseCheck } : {}) };
}

/** 申告した方（共通データには申告したアカウントしかないので、法人Web で選んだ方の名前を corp-docs.stockBy に持つ） */
export type StockBy = { id: string; at: string; accountId: string; who: string };

/** 共通データの棚卸報告を法人Web の形に（商品の並びは STOCK_IDS、扱っていない商品は 0） */
export function stockRec(sc: StockCheck, corpId: string, by?: StockBy): StockRec {
  const corp = sc.checkedBy.site === 'corp';
  /* 申告した方の氏名：共通データ（受付簿 No.44）、古い記録は法人Web の stockBy */
  const named = corp ? sc.checkedBy.name || (by && by.at === sc.checkedOn && by.accountId === sc.checkedBy.accountId ? by.who : '') : '';
  return {
    id: `${sc.branchId}|${sc.period}`, site: sc.branchId, m: sc.period, at: sc.checkedOn,
    who: corp ? named || '企業担当者' : 'ES配送便ドライバー',
    acct: corp ? (sc.checkedBy.accountId === corpId ? '法人アカウント' : '拠点アカウント') : undefined,
    n: STOCK_IDS.map((id) => sc.rows.find((x) => x.productId === id)?.actual ?? 0),
    ids: sc.rows.map((x) => x.productId),
    d: STOCK_IDS.map((id) => sc.rows.find((x) => x.productId === id)?.disposed ?? 0),
    a: STOCK_IDS.map((id) => sc.rows.find((x) => x.productId === id)?.arrived ?? 0),
    ...(sc.status === '確認済' ? { confirmed: true } : {}),
  };
}
