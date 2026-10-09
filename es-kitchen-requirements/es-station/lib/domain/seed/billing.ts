import { invoiceTotals } from '../invoiceTax';
import type { Billing, ChildContract, Invoice, InvoiceLine, InvoiceSend, InvoiceSendStatus } from '../types';
import { DISCOUNTS, OPTIONS, PLANS } from './master';
import { BRANCHES, CONTRACTS, CORPS } from './org';
import { feesOf } from '../snapshot';
import { annualAnchor, annualContract, issueMonthOf } from './delivery';

/*
 * 請求書の見本。子契約から作る（共通サンプルデータ §1・§2 の決まり）：
 *   毎月1日に発行。前払い＝請求月（サイクル月＋リードタイム）が発行月の子契約の固定額（リードタイム −1＝翌月サイクル・0＝当月サイクル）、
 *   後払い（実績精算）＝前々月21日〜前月20日、8%。お試しだけの請求書は実績精算の行を出さない（0円の請求書・シナリオ説明書 ②⑩）
 *   プラン料金は 福利厚生（企業負担分・8%）＝食数×100円（税込）÷1.08 の切り捨て、残りが基本料金（10%）
 *   消費税は請求書ごと・税率ごとに四捨五入
 *   法人あて（請求先＝法人）でまとめて発行の法人は1通、ほかは拠点ごと
 * 共通サンプル：INV-2026080001＝¥90,000（未入金→繰越）、INV-2026100001＝¥181,080（再請求 ¥90,000 を含む）。
 * 運営の請求の見本（lib/ops/billing/seed.ts）の千葉 INV-2026100015・横浜 INV-2026100016 と同じ番号・金額。
 */

/** 実績精算（後払い）の金額（見本の値。株式会社サンプルの法人あては共通サンプルの値） */
const ACTUAL: Record<string, number> = {
  'CU00001|2026-08': 1600, 'CU00001|2026-09': 2100, 'CU00001|2026-10': 2600,
  'CU00961|2026-10': 800, 'CU00950|2026-10': 1000,
};
/** 決まっている番号（宛先|発行月 → 連番。運営の請求の INVFIX と同じ：法人あて 0001・名古屋 0014・千葉 0015・横浜 0016） */
const FIXED_NO: Record<string, number> = { 'CU00001|*': 1, 'CU00902|*': 14, 'CU00961|*': 15, 'CU00950|*': 16 };
const ISSUE_MONTHS = ['2026-08', '2026-09', '2026-10'];

const addMonth = (ym: string, n: number) => {
  const [y, m] = ym.split('-').map(Number);
  const d = new Date(y, m - 1 + n, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};
const slash = (ym: string, day: string) => `${ym.replace('-', '/')}/${day}`;

/** 子契約の前払いの費目＝子契約の ① 費目の写し（fees。lib/domain/snapshot.ts の feesOf で作ったときに固めた金額） */
export function fixedLines(cc: ChildContract): InvoiceLine[] {
  const fees = cc.fees ?? feesOf(cc, { plan: (id) => PLANS.find((x) => x.id === id), option: (id) => OPTIONS.find((x) => x.id === id), discount: (id) => DISCOUNTS.find((x) => x.id === id) });
  /* 福利厚生の適用 OFF（既定）のプラン料金の2行は、請求書で1行にまとめて出す（group・28-150） */
  return fees.lines.map((l) => ({ branchId: cc.branchId, name: l.name, amountYen: l.amountYen, taxRate: l.taxRate, kind: '前払い', ...(l.src === 'plan' && !cc.welfareOn ? { group: `plan:${cc.id}` } : {}) }));
}

/** 請求書の合計（税率ごとの欄・繰越・合計。lib/domain/invoiceTax.ts） */
export const totals = (lines: InvoiceLine[]) => invoiceTotals(lines);

/**
 * Bill One の送付の見本（課題 0-2：状態だけ）。発行日の 06:00 に送付待ち → 09:00 に送付済 → 開いた日に開封済。
 * 10月発行：INV-2026100001＝開封済、横浜 INV-2026100016＝エラー（宛先のメールアドレス不明）、ほかは送付済
 */
const SEND_SEED: Record<string, InvoiceSendStatus> = { 'INV-2026100001': '開封済', 'INV-2026100016': 'エラー' };
function seedSend(id: string, issuedOn: string, issueMonth: string): InvoiceSend {
  const last = SEND_SEED[id] ?? (issueMonth === '2026-10' ? '送付済' : '開封済');
  const log: InvoiceSend['log'] = [{ at: `${issuedOn} 06:00`, status: '送付待ち', note: 'Bill One に送付を依頼しました' }];
  if (last === 'エラー') log.push({ at: `${issuedOn} 09:00`, status: 'エラー', note: '送付できませんでした（宛先のメールアドレスが見つかりません）' });
  else {
    log.push({ at: `${issuedOn} 09:00`, status: '送付済', note: 'Bill One から法人へメールで送付しました' });
    if (last === '開封済') log.push({ at: `${issuedOn.slice(0, 8)}03 10:15`, status: '開封済', note: '法人が請求書を開きました' });
  }
  return { method: 'Bill One', status: last, log };
}

/**
 * 年払いの起算月の請求書（シナリオ説明書 ⑬：淀屋橋ES CP0000051・2026年4月サイクル起算・12サイクル分を1通・S3-1）。
 * 金額は起算月の ① 費目（月額）× 12（期中の料金改定は次の起算月から・S3-2）。見本の子契約は 2026-09 からなので、いちばん早い子契約の ① 費目で作る。
 * 行の cycleTo＝12サイクル目（請求書の cycleMonth〜cycleTo を請求済にする）
 */
function annualInvoices(children: ChildContract[]): Invoice[] {
  const out: Invoice[] = [];
  const byContract = new Map<string, ChildContract[]>();
  for (const c of children.filter((x) => !x.canceled && annualContract(x.contractId))) byContract.set(c.contractId, [...(byContract.get(c.contractId) ?? []), c]);
  for (const [cid, ccs] of byContract) {
    const first = [...ccs].sort((x, y) => x.cycleMonth.localeCompare(y.cycleMonth))[0];
    const anchor = annualAnchor(cid, first.cycleMonth), to = addMonth(anchor, 11), issue = issueMonthOf(cid, anchor);
    if (!ISSUE_MONTHS.concat(['2026-04', '2026-05', '2026-06', '2026-07']).includes(issue)) continue;
    const ct = CONTRACTS.find((x) => x.id === cid)!;
    const corp = CORPS.find((c) => c.id === BRANCHES.find((b) => b.id === ct.branchId)?.corpId);
    const billing = ct.billTo === 'この拠点' && ct.billing ? ct.billing : corp!.billing;
    const lines: InvoiceLine[] = fixedLines(first).map((l) => ({ ...l, name: `${l.name}（${anchor}〜${to}・12ヶ月分）`, amountYen: l.amountYen * 12, cycleTo: to }));
    const id = `INV-${issue.replace('-', '')}0001`;
    const issuedOn = slash(issue, '01');
    out.push({
      id, corpId: corp?.id ?? '', branchId: ct.branchId, issueMonth: issue, issuedOn, dueOn: billing.dueRule === '請求月の27日' ? slash(issue, '27') : slash(addMonth(issue, 1), '27'),
      cycleMonth: anchor, actualPeriod: '—', lines, ...totals(lines), status: '入金済', carriedTo: '', note: `年払い（${anchor}〜${to} の12サイクル分）`, send: seedSend(id, issuedOn, issue),
    });
  }
  return out;
}

export function buildInvoices(children: ChildContract[]): Invoice[] {
  const out: Invoice[] = [];
  for (const issue of ISSUE_MONTHS) {
    const ccs = children.filter((c) => !c.canceled && issueMonthOf(c.contractId, c.cycleMonth) === issue && c.billStatus !== '未確定');
    /* 宛先ごとにまとめる */
    const groups = new Map<string, { corpId: string; branchId: string | null; billing: Billing; ccs: ChildContract[] }>();
    for (const cc of ccs) {
      const ct = CONTRACTS.find((x) => x.id === cc.contractId)!;
      const br = BRANCHES.find((b) => b.id === cc.branchId)!;
      const corp = CORPS.find((c) => c.id === br.corpId);
      const merged = ct.billTo === '法人' && corp?.billing.invoiceUnit === 'まとめて発行（法人1通）';
      const key = merged ? corp!.id : br.id;
      const billing = ct.billTo === 'この拠点' ? ct.billing! : corp!.billing;
      const g = groups.get(key) ?? { corpId: corp?.id ?? '', branchId: merged ? null : br.id, billing, ccs: [] };
      g.ccs.push(cc);
      groups.set(key, g);
    }
    let seq = 1;
    const used = new Set(Object.values(FIXED_NO));
    for (const [key, g] of groups) {
      let no = FIXED_NO[`${key}|*`];
      if (!no) { while (used.has(seq)) seq++; no = seq++; }
      const id = `INV-${issue.replace('-', '')}${String(no).padStart(4, '0')}`;
      const actualFrom = slash(addMonth(issue, -2), '21');
      const actualTo = slash(addMonth(issue, -1), '20');
      const actual = ACTUAL[`${key}|${issue}`] ?? 500 + (no % 5) * 100;
      /* お試しの拠点だけの請求書は実績精算なし（お試し期間は前払い − お試しキャンペーン割引＝0円） */
      const trialOnly = g.ccs.every((c) => c.kind === 'お試しキャンペーン');
      const lines: InvoiceLine[] = [
        /* 年払いの拠点は毎月の前払いなし（起算月の請求書で12サイクル分・下の annualInvoices）。実績精算は毎月 */
        ...g.ccs.filter((c) => !annualContract(c.contractId)).flatMap(fixedLines),
        ...(trialOnly ? [] : [{ branchId: g.branchId ?? g.ccs[0].branchId, name: `ご利用実績の精算（${actualFrom}〜${actualTo}）`, amountYen: actual, taxRate: 8 as const, kind: '後払い' as const }]),
      ];
      const dueOn = g.billing.dueRule === '請求月の27日' ? slash(issue, '27') : slash(addMonth(issue, 1), '27');
      out.push({
        id, corpId: g.corpId, branchId: g.branchId, issueMonth: issue, issuedOn: slash(issue, '01'), dueOn, cycleMonth: g.ccs[0].cycleMonth,
        actualPeriod: `${actualFrom}〜${actualTo}`, lines, ...totals(lines),
        status: issue === '2026-10' ? '発行済' : '入金済', carriedTo: '', note: '', send: seedSend(id, slash(issue, '01'), issue),
      });
    }
  }
  out.push(...annualInvoices(children));
  /* 株式会社サンプル：8月発行分が未入金 → 10月発行分で再請求（繰越） */
  const aug = out.find((x) => x.id === 'INV-2026080001')!;
  const oct = out.find((x) => x.id === 'INV-2026100001')!;
  aug.status = '繰越済';
  aug.carriedTo = oct.id;
  aug.note = '期日までに入金がなかったため INV-2026100001 で再請求';
  oct.lines.push({ branchId: 'CU00643', name: `${aug.id} の再請求（繰越）`, amountYen: aug.total, taxRate: 0, kind: '繰越', fromInvoiceId: aug.id });
  Object.assign(oct, totals(oct.lines));
  return out;
}
