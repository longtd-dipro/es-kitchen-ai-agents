import { ApiError } from '@/lib/api/errors';
import { defineArea, toDocs, type DocRepo } from '@/lib/ops/core/area';
import { notify } from '../notify';
import { buildInvoices, totals } from '../seed/billing';
import { buildChildContracts } from '../seed/delivery';
import { buyoutOf } from '../product';
import type { ChildContract, Delivery, DeliveryLine, Invoice, InvoiceSend, InvoiceSendStatus } from '../types';
import { nowStamp } from '@/lib/supplier/dates';
import { altBillRows } from '../alt';
import { feesNow } from '../snapshot';
import { ADJ, markAdjustments, pendingAdjustments } from '../adjust';
import type { BillAdjustment } from '../types';
import { LOCKED_KIND, lockedSkips, type LockedSkip } from '../locked';
import { INIT_REASON, PULL_REASON, reapplyLockedMonth } from '../lifecycle';

/*
 * 請求（area: billing）。kind：billing.invoices
 * 法人Web：法人アカウント＝法人の全請求書／拠点アカウント＝自分の拠点の請求書と、自分の拠点の行がある法人あての請求書
 * 運営：一覧・入金の記録（Bill One の入金を見て 入金済／未入金 にする）
 */

const invoices = (r: DocRepo) => r.list<Invoice>('dm.billing.invoices');

/**
 * 請求書の前払いの行がある子契約（拠点×前払いのサイクル月）の請求の状態をそろえる（影響一覧 A3・A6）。
 * 発行＝請求済（もう変えられない）、取消＝確定に戻す（ロックのまま。直すときは請求の画面で確定解除）
 */
function markChildren(r: DocRepo, inv: Invoice, status: ChildContract['billStatus']) {
  /* 拠点ごとの前払いの月（年払いの行は cycleTo までの12サイクル分・S3-1） */
  const until = new Map<string, string>();
  for (const l of inv.lines.filter((x) => x.kind === '前払い')) until.set(l.branchId, [until.get(l.branchId) ?? inv.cycleMonth, l.cycleTo ?? inv.cycleMonth].sort().pop()!);
  const covers = (x: Invoice, branchId: string, ym: string) => x.lines.some((l) => l.kind === '前払い' && l.branchId === branchId && (x.cycleMonth === ym || (!!l.cycleTo && x.cycleMonth <= ym && ym <= l.cycleTo)));
  for (const cc of r.list<ChildContract>('dm.org.childContracts').filter((c) => until.has(c.branchId) && inv.cycleMonth <= c.cycleMonth && c.cycleMonth <= until.get(c.branchId)!)) {
    if (cc.billStatus === status) continue;
    /* 取消で戻すのは請求済だけ（ほかの請求書で請求済のものは、その請求書がまだあるなら請求済のまま） */
    if (status === '確定' && invoices(r).some((x) => x.id !== inv.id && x.status !== '取消' && covers(x, cc.branchId, cc.cycleMonth))) continue;
    r.put<ChildContract>('dm.org.childContracts', cc.id, { ...cc, billStatus: status, fees: cc.fees ?? feesNow(r, cc) });
  }
}

/** Bill One の送付の状態の進み方（デモ：送付待ち → 送付済 → 開封済。エラーは再送で送付待ちへ） */
const SEND_NEXT: Record<InvoiceSendStatus, InvoiceSendStatus | null> = { 送付待ち: '送付済', 送付済: '開封済', 開封済: null, エラー: '送付待ち' };
const SEND_NOTE: Record<InvoiceSendStatus, string> = {
  送付待ち: 'Bill One に送付を依頼しました', 送付済: 'Bill One から法人へメールで送付しました', 開封済: '法人が請求書を開きました', エラー: '送付できませんでした（宛先のメールアドレスを確認してください）',
};
/** 送付の記録に1行足す（時刻は前の記録・発行日より前にしない＝デモの暦が先の日付の請求書でも順がそろう） */
function sendStep(cur: InvoiceSend | undefined, status: InvoiceSendStatus, note?: string, notBefore = ''): InvoiceSend {
  const at = [nowStamp(), cur?.log[cur.log.length - 1]?.at ?? '', notBefore].sort().pop()!;
  return { method: 'Bill One', status, log: [...(cur?.log ?? []), { at, status, note: note || SEND_NOTE[status] }] };
}

export default defineArea({
  name: 'billing',
  seed: () => ({ 'dm.billing.invoices': toDocs(buildInvoices(buildChildContracts())), [ADJ]: [], [LOCKED_KIND]: [] }),
  queries: {
    list: (r, a?: { issueMonth?: string; corpId?: string; status?: Invoice['status'] }) =>
      invoices(r).filter((x) => (!a?.issueMonth || x.issueMonth === a.issueMonth) && (!a?.corpId || x.corpId === a.corpId) && (!a?.status || x.status === a.status))
        .sort((x, y) => y.id.localeCompare(x.id)),
    get(r, { id }: { id: string }) {
      const x = r.get<Invoice>('dm.billing.invoices', id);
      if (!x) throw new ApiError(`請求書が見つかりません（${id}）`, 404);
      return x;
    },
    /**
     * 買取（企業独自価格）の金額：子契約の届けた数 × 企業の価格（税込）。通常価格（従量）は 0円・rows なし。
     * まだ請求書（実績精算の行）には入れていない（請求の画面・バッチで使う）
     */
    buyout(r, { childContractId }: { childContractId: string }) {
      const cc = r.get<ChildContract>('dm.org.childContracts', childContractId);
      if (!cc) throw new ApiError(`子契約が見つかりません（${childContractId}）`, 404);
      return { pricing: cc.pricing, ...buyoutOf(cc, r.list<Delivery>('dm.delivery.deliveries'), r.list<DeliveryLine>('dm.delivery.lines')) };
    },
    /**
     * 代替品の実績精算の行（lib/domain/alt.ts）：差替＝元の商品のメニューの単価、補償＝0円の行（お客様に見える）、除外＝出さない。
     * 追加配送の配送費は ES の負担（請求しない）。請求書の行にはまだ入れていない（請求の画面・バッチで使う）
     */
    altLines: (r, a: { branchId?: string; cycleMonth?: string }) => altBillRows(r, a),
    /**
     * 調整明細（TL-7 A：請求済みの月にかかる変更の差額・違約金などの費用）。pending＝まだ請求書に載っていないものだけ。
     * 運営の請求（③ 調整）・法人Web の請求書の明細と同じデータ
     */
    adjustments: (r, a?: { branchId?: string; applicationId?: string; pending?: boolean }) =>
      (a?.pending ? pendingAdjustments(r, a.branchId) : r.list<BillAdjustment>(ADJ).filter((x) => !a?.branchId || x.branchId === a.branchId))
        .filter((x) => !a?.applicationId || x.applicationId === a.applicationId).sort((x, y) => x.id.localeCompare(y.id)),
    /** 確定の月の反映待ち（プランの変更・誤りの訂正。承認の画面・運営の TOP。lib/domain/locked.ts） */
    lockedSkips: (r, a?: { branchId?: string; applicationId?: string; all?: boolean }) => lockedSkips(r, a),
    forCorp: (r, a: { corpId?: string; branchId?: string }) =>
      invoices(r).filter((x) => (a.branchId ? x.branchId === a.branchId || (x.branchId === null && x.lines.some((l) => l.branchId === a.branchId)) : x.corpId === a.corpId))
        .sort((x, y) => y.id.localeCompare(x.id)),
  },
  actions: {
    /** 運営：確定解除した月に、反映待ちの変更を反映する */
    reapplyLocked(r, { id, by }: { id: string; by?: string }) {
      const x = r.get<LockedSkip>(LOCKED_KIND, id);
      if (!x || x.status !== '反映待ち') throw new ApiError('反映待ちの記録が見つかりません', 404);
      const message = reapplyLockedMonth(r, x, by ?? '');
      r.put<LockedSkip>(LOCKED_KIND, id, { ...x, status: '反映済', doneAt: nowStamp(), doneBy: by ?? '' });
      return { message };
    },
    /** 運営：反映しない（請求調整で対応するなど） */
    dismissLocked(r, { id, by }: { id: string; by?: string }) {
      const x = r.get<LockedSkip>(LOCKED_KIND, id);
      if (!x || x.status !== '反映待ち') throw new ApiError('反映待ちの記録が見つかりません', 404);
      r.put<LockedSkip>(LOCKED_KIND, id, { ...x, status: '取り下げ', doneAt: nowStamp(), doneBy: by ?? '' });
      return { ok: true };
    },
    /**
     * 運営：まだ請求書に載っていない設備の費用の調整明細（解約の設備引揚費など）の金額を直す（0円＝外す）。③ 調整から
     */
    editAdjustment(r, { id, amountYen }: { id: string; amountYen: number; by?: string }) {
      const x = r.get<BillAdjustment>(ADJ, id);
      if (!x) throw new ApiError('調整明細が見つかりません', 404);
      if (x.invoiceId) throw new ApiError('請求書に載った調整明細は直せません', 409);
      /* 直せるのは設備引揚費・初期費用（OP000008：受付・本登録で立てた金額を契約ごとに直す・REQ-PM-055） */
      if (!((x.kind === '設備の費用' && x.reason === PULL_REASON) || (x.kind === '初期費用' && x.reason === INIT_REASON))) throw new ApiError('この調整明細は直せません（申請の承認で自動でできた差額）', 409);
      if (!Number.isInteger(amountYen) || amountYen < 0) throw new ApiError('金額は0以上の整数で入れてください', 400);
      if (!amountYen) { r.remove(ADJ, id); return { removed: true }; }
      const next: BillAdjustment = { ...x, lines: x.lines.map((l, i) => (i === 0 ? { ...l, amountYen } : l)), afterYen: amountYen };
      r.put<BillAdjustment>(ADJ, id, next);
      return { removed: false };
    },
    /** 運営：入金の記録（発行済＝運営の画面で「未入金（再請求）」の指定を外したとき） */
    setPayment(r, { id, status }: { id: string; status: '入金済' | '未入金' | '発行済'; by: string }) {
      const x = r.get<Invoice>('dm.billing.invoices', id);
      if (!x) throw new ApiError(`請求書が見つかりません（${id}）`, 404);
      if (!['発行済', '入金済', '未入金'].includes(x.status)) throw new ApiError(`${x.status} の請求書は変えられません`, 409);
      const next = { ...x, status };
      r.put('dm.billing.invoices', id, next);
      if (status === '未入金') notify(r, { to: { site: 'corp', accountId: x.corpId || x.branchId || '', role: '' }, templateId: 'invoice_unpaid', title: `ご入金の確認ができませんでした（${id}）`, body: `お支払い期日 ${x.dueOn} までにご入金を確認できませんでした。次回の請求書で再請求します。`, link: { type: 'invoice', id } });
      return next;
    },
    /** 運営：Bill One で発行した請求書を入れる（運営の画面で作って登録した請求書。合計・税はここで計算する） */
    issue(r, { invoice }: { invoice: Omit<Invoice, 'subtotal10' | 'subtotal8' | 'carried' | 'tax10' | 'tax8' | 'total' | 'status'> }) {
      if (r.get('dm.billing.invoices', invoice.id)) throw new ApiError(`${invoice.id} はすでにあります`, 409);
      const next: Invoice = { ...invoice, ...totals(invoice.lines), status: '発行済', send: sendStep(undefined, '送付待ち', undefined, invoice.issuedOn ? `${invoice.issuedOn} 06:00` : '') };
      r.put('dm.billing.invoices', next.id, next);
      markChildren(r, next, '請求済');
      /* 載せた調整明細に「載せた請求書」を付ける */
      markAdjustments(r, next, true);
      return next;
    },
    /**
     * 運営（デモの操作）：Bill One の送付の状態を進める（課題 0-2：外部には送らない）。
     * to を省くと次へ（送付待ち → 送付済 → 開封済、エラー → 送付待ち＝再送）。to＝'エラー' で送付エラーにする（送付待ち・送付済のときだけ）
     */
    advanceSend(r, { id, to, note }: { id: string; to?: InvoiceSendStatus; note?: string; by?: string }) {
      const x = r.get<Invoice>('dm.billing.invoices', id);
      if (!x) throw new ApiError(`請求書が見つかりません（${id}）`, 404);
      if (x.status === '取消') throw new ApiError('取消の請求書は送付しません', 409);
      const cur = x.send?.status ?? '送付待ち';
      const next = to ?? SEND_NEXT[cur];
      if (!next) throw new ApiError('この請求書は開封済みです（これ以上は進みません）', 409);
      if (next === 'エラー' && !['送付待ち', '送付済'].includes(cur)) throw new ApiError(`${cur} の請求書はエラーにできません`, 409);
      if (to && to !== 'エラー' && to !== SEND_NEXT[cur]) throw new ApiError(`${cur} から ${to} には進めません`, 409);
      /* 古い DB の請求書（send なし）は、発行日の 送付待ち から記録を始める */
      const base = x.send ?? sendStep(undefined, '送付待ち', undefined, `${x.issuedOn} 06:00`);
      const send = sendStep(base, next, next === '送付待ち' && cur === 'エラー' ? 'Bill One で再送を依頼しました' : note);
      const upd = { ...x, send };
      r.put('dm.billing.invoices', id, upd);
      return upd;
    },
    /** 運営：取消（Bill One で取り消した請求書。再発行は別の番号で issue する） */
    withdraw(r, { id }: { id: string; by: string }) {
      const x = r.get<Invoice>('dm.billing.invoices', id);
      if (!x) throw new ApiError(`請求書が見つかりません（${id}）`, 404);
      if (x.status === '繰越済' || x.status === '取消') throw new ApiError(`${x.status} の請求書は取り消せません`, 409);
      const next = { ...x, status: '取消' as const };
      r.put('dm.billing.invoices', id, next);
      markChildren(r, next, '確定');
      /* 取消した請求書に載せた調整明細は、次の請求書（再発行）に載せ直す */
      markAdjustments(r, next, false);
      return next;
    },
    /** 運営：未入金の請求書を別の請求書で再請求する（繰越）。先の請求書がもうあれば、そこに繰越の行を足す */
    carry(r, { fromId, toId }: { fromId: string; toId: string; by: string }) {
      const f = r.get<Invoice>('dm.billing.invoices', fromId);
      if (!f) throw new ApiError(`請求書が見つかりません（${fromId}）`, 404);
      if (f.carriedTo || !['発行済', '未入金'].includes(f.status)) throw new ApiError(`${fromId} は繰越できません（${f.status}）`, 409);
      r.put('dm.billing.invoices', fromId, { ...f, status: '繰越済', carriedTo: toId });
      const t = r.get<Invoice>('dm.billing.invoices', toId);
      if (t && !t.lines.some((l) => l.fromInvoiceId === fromId)) {
        const lines = [...t.lines, { branchId: f.branchId ?? f.lines[0]?.branchId ?? '', name: `${fromId} の再請求（繰越）`, amountYen: f.total, taxRate: 0 as const, kind: '繰越' as const, fromInvoiceId: fromId }];
        r.put('dm.billing.invoices', toId, { ...t, lines, ...totals(lines) });
      }
      return r.get<Invoice>('dm.billing.invoices', fromId);
    },
    /** 運営：繰越を取り下げる（元の請求書は未入金に戻る。先の請求書にあれば繰越の行を外す） */
    uncarry(r, { fromId }: { fromId: string; by: string }) {
      const f = r.get<Invoice>('dm.billing.invoices', fromId);
      if (!f || f.status !== '繰越済') throw new ApiError('繰越が見つかりません', 404);
      const t = f.carriedTo ? r.get<Invoice>('dm.billing.invoices', f.carriedTo) : undefined;
      if (t) {
        const lines = t.lines.filter((l) => l.fromInvoiceId !== fromId);
        r.put('dm.billing.invoices', t.id, { ...t, lines, ...totals(lines) });
      }
      const next = { ...f, status: '未入金' as const, carriedTo: '' };
      r.put('dm.billing.invoices', fromId, next);
      return next;
    },
  },
});
