import type { DocRepo } from '@/lib/ops/core/area';
import { ADJ, anchorOf, billedOf, finalIssueMonth, isAnnual, totalOf } from './adjust';
import { finalDue } from './lifecycle';
import { addYm } from './menu';
import type { Account, BillAdjustment, ChildContract, Contract, Delivery, Invoice, Pause, StockMove, Warehouse } from './types';

/*
 * check.run の続き（機能パック1・2026/10/03「Chức năng chưa làm – chốt」）。
 *   調整明細（TL-7 A）：元の子契約・請求書・載せた請求書のつながり、差額の形、止めた請求済みの月は前払いを返している
 *   年払い（S3-1）：起算月の請求書に12サイクル分・毎月の前払いの行を出さない・請求済の子契約は年払いの請求書にある
 *   最終請求（解約）：備考「最終請求」の請求書は解約した拠点の締め月のもの・停止したアカウントは最終請求の入金期限のあと
 *   在庫戻し（REQ-PO-603・W6）：在庫の記録はピッキング倉庫から減らす
 */

export const BILLING_COUNT_KINDS = [ADJ];

export function billingProblems(r: DocRepo): string[] {
  const p: string[] = [];
  const need = (cond: boolean, msg: string) => { if (!cond) p.push(msg); };
  const invs = r.list<Invoice>('dm.billing.invoices');
  const invById = new Map(invs.map((x) => [x.id, x]));
  const adjs = r.list<BillAdjustment>(ADJ);
  const adjById = new Map(adjs.map((x) => [x.id, x]));
  const contracts = r.list<Contract>('dm.org.contracts');
  const children = r.list<ChildContract>('dm.org.childContracts');

  /* ---- 調整明細 ---- */
  const MONTHLY: BillAdjustment['kind'][] = ['プランの変更', '休止', '再開', '解約', '誤りの訂正'];
  for (const a of adjs) {
    need(/^AJ-\d{6}-\d{4}$/.test(a.id), `調整明細 ${a.id} の ID の形が違う`);
    const ct = r.get<Contract>('dm.org.contracts', a.contractId);
    need(!!ct && ct.branchId === a.branchId, `調整明細 ${a.id} の親契約 ${a.contractId} がない・拠点が違う`);
    need(a.lines.length > 0 && a.lines.every((l) => Number.isInteger(l.amountYen) && l.amountYen !== 0 && typeof l.taxRate === 'number' && l.taxRate >= 0 && !!l.name), `調整明細 ${a.id} の行の形が違う（0円・税率）`);
    const sum = a.lines.reduce((s, l) => s + l.amountYen, 0);
    need(a.afterYen - a.billedYen === sum, `調整明細 ${a.id} の差額（${a.afterYen} − ${a.billedYen}）が行の合計 ${sum} と合わない`);
    if (a.childContractId) {
      const cc = r.get<ChildContract>('dm.org.childContracts', a.childContractId);
      need(!!cc && cc.contractId === a.contractId && cc.cycleMonth === a.cycleMonth, `調整明細 ${a.id} の子契約 ${a.childContractId} がない・月が違う`);
      /* 月の差額は確定・請求済の月だけ（未確定の月は子契約を直す） */
      if (cc && MONTHLY.includes(a.kind)) need(cc.billStatus !== '未確定', `調整明細 ${a.id} の子契約 ${cc.id} が未確定（調整明細ではなく子契約を直す）`);
    } else need(!MONTHLY.includes(a.kind), `調整明細 ${a.id}（${a.kind}）に元の子契約がない`);
    if (a.fromInvoiceId) need(invById.has(a.fromInvoiceId), `調整明細 ${a.id} の元の請求書 ${a.fromInvoiceId} がない`);
    if (a.invoiceId) {
      const inv = invById.get(a.invoiceId);
      need(!!inv && inv.status !== '取消', `調整明細 ${a.id} を載せた請求書 ${a.invoiceId} がない・取消`);
      const ls = inv?.lines.filter((l) => l.adjId === a.id) ?? [];
      need(ls.reduce((s, l) => s + l.amountYen, 0) === sum && ls.every((l) => l.kind === '調整'), `調整明細 ${a.id} の額が請求書 ${a.invoiceId} の調整の行と合わない`);
    }
  }
  for (const inv of invs) for (const l of inv.lines.filter((x) => x.adjId)) {
    const a = adjById.get(l.adjId!);
    need(!!a && l.kind === '調整' && (inv.status === '取消' || a.invoiceId === inv.id), `請求書 ${inv.id} の調整の行 ${l.adjId} の調整明細がない・載せた請求書が違う`);
  }
  /* 休止・解約で止めた確定・請求済の月：配送はなく、先に請求した前払いは返している（請求した額＋調整明細＝0） */
  const pauses = r.list<Pause>('dm.org.pauses');
  const dels = r.list<Delivery>('dm.delivery.deliveries');
  for (const cc of children.filter((c) => !c.canceled && c.billStatus !== '未確定' && adjs.some((a) => a.childContractId === c.id && (a.kind === '休止' || a.kind === '解約')))) {
    const ct = contracts.find((c) => c.id === cc.contractId);
    const stopped = pauses.some((x) => x.contractId === cc.contractId && x.fromCycle <= cc.cycleMonth && cc.cycleMonth <= x.toCycle)
      || (!!ct?.endOn && ['解約手続き中', '終了'].includes(ct.status) && cc.cycleMonth > ct.endOn.slice(0, 7).replace('/', '-'));
    if (!stopped) continue;
    const b = billedOf(r, cc);
    need(Object.values(b).every((x) => x === 0), `止めた月の子契約 ${cc.id} の前払いを返していない（請求した額＋調整明細 ${totalOf(b)}円）`);
    need(!dels.some((d) => d.childContractId === cc.id && !['取消', '中止'].includes(d.status) && !['納品済', '一部納品済'].includes(d.status) && d.temp !== '資材'), `止めた月の子契約 ${cc.id} に配送が残っている`);
  }

  /* ---- 年払い ---- */
  for (const ct of contracts.filter((c) => isAnnual(r, c))) {
    const mine = invs.filter((x) => x.status !== '取消');
    for (const inv of mine) for (const l of inv.lines.filter((x) => x.kind === '前払い' && x.branchId === ct.branchId)) {
      need(!!l.cycleTo, `年払いの拠点 ${ct.branchId} の請求書 ${inv.id} に毎月の前払いの行がある`);
      if (l.cycleTo) need(anchorOf(ct.startCycle, inv.cycleMonth) === inv.cycleMonth && l.cycleTo === addYm(inv.cycleMonth, 11), `請求書 ${inv.id} の年払いの行が起算月（${ct.startCycle} から12ヶ月ごと）から12サイクル分でない`);
    }
    for (const cc of children.filter((c) => c.contractId === ct.id && c.billStatus === '請求済')) {
      need(mine.some((x) => x.lines.some((l) => l.kind === '前払い' && l.branchId === ct.branchId && !!l.cycleTo && x.cycleMonth <= cc.cycleMonth && cc.cycleMonth <= l.cycleTo)), `年払いの子契約 ${cc.id} が請求済なのに年払いの請求書がない`);
    }
  }
  for (const inv of invs) for (const l of inv.lines.filter((x) => x.cycleTo)) need(l.kind === '前払い' && l.cycleTo! > inv.cycleMonth, `請求書 ${inv.id} の cycleTo のある行が前払いでない・月が逆`);

  /* ---- 最終請求（解約） ---- */
  /* 最終請求書は解約した拠点だけの1通（拠点ごと・行もその拠点だけ）。解約日を含む締め月より前には出さない */
  const finals = invs.filter((x) => x.final && x.status !== '取消');
  for (const inv of finals) {
    const c = contracts.find((x) => x.branchId === inv.branchId);
    need(!!inv.branchId && inv.lines.every((l) => l.branchId === inv.branchId), `最終請求書 ${inv.id} が拠点だけの請求書でない（ほかの拠点の行がある）`);
    need(!!c && ['解約手続き中', '終了'].includes(c.status) && !!c.endOn && inv.issueMonth >= finalIssueMonth(c.endOn), `最終請求書 ${inv.id} の拠点が解約していない・解約日を含む締め月より前`);
    need(finals.filter((x) => x.branchId === inv.branchId).length === 1, `拠点 ${inv.branchId} に最終請求書が2通以上ある`);
  }
  for (const c of contracts.filter((x) => x.status === '終了' && x.endOn)) {
    const acc = r.get<Account>('dm.account.accounts', c.branchId);
    if (acc?.status === '利用停止') need(!!finalDue(r, c.branchId, c.endOn), `拠点 ${c.branchId} のアカウントは利用停止なのに、最終請求の請求書がない`);
  }

  /* ---- 在庫戻し（REQ-PO-603） ---- */
  for (const m of r.list<StockMove>('dm.stock.moves').filter((x) => x.kind === '在庫戻し')) {
    need(m.qty < 0 && Number.isInteger(m.qty), `在庫の記録 ${m.id}（在庫戻し）の数がマイナスの整数でない`);
    need(r.get<Warehouse>('dm.master.warehouses', m.warehouseId)?.type === 'picking', `在庫の記録 ${m.id}（在庫戻し）の倉庫 ${m.warehouseId} がピッキング倉庫でない`);
  }
  return p;
}
