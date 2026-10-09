'use client';

import type { BillingLogic } from '@/lib/ops/billing/logic';
import { yen } from '@/lib/ops/billing/logic';
import { useAsk } from './ds';
import { useBilling } from './useBilling';

/** 請求書の操作（作成の確認・Bill One で発行・前払いの確定） */
export function useInvoiceOps(L: BillingLogic | null) {
  const ask = useAsk();
  const { run, can } = useBilling();
  return {
    /** 書き換えを呼べるか（useBilling の can） */
    can,
    /** 「請求書を作成」は Bill One に登録する前に確認する。再請求が加わって金額が変わるときは、その理由も出す（RV3-OPS-20261002 #6） */
    askMake(cid: string, bid: string | null) {
      const p = L?.makePreview(cid, bid);
      if (!p) return run('makeInvoice', { co: cid, br: bid });   // 作れないときは今までどおりのお知らせ
      ask({
        title: '請求書を作成しますか？', ok: '作成する',
        body: <>Bill One に登録します。登録後は取り下げの手続きが必要です。
          {p.add > 0 && <><br />再請求を指定した {p.carries.map((u) => `${u.id}（${yen(u.amt)}）`).join('・')} を加えるため、請求金額（税込）が {yen(p.tot)} から {yen(p.tot + p.add)} になります。</>}</>,
        onOk: () => { run('makeInvoice', { co: cid, br: bid }); },
      });
    },
    dispatch: (id: string) => run('dispatch', { id }),
    confirmAllFix(ids: string[]) {
      ask({
        title: `${ids.length}件の子契約を確定しますか？`, body: '前払い（固定額）・調整の金額を確定します。確定した子契約から請求書を作成できます。',
        onOk: () => { run('confirmAllFix', { ids }); },
      });
    },
    bulk(kind: 'make' | 'send', keys: string[], n: number, done: () => void) {
      ask({
        title: kind === 'make' ? `${n}通の請求書を作成しますか？` : `${n}通を Bill One で発行しますか？`,
        body: kind === 'make' ? '確定済みの子契約で請求書を作り、Bill One に登録します。' : '発行すると法人へ送付されます。発行したあとに直すときは取消（WITHDRAWN）して作り直します。',
        onOk: async () => { if (await run('bulkGrp', { kind, keys })) done(); },
      });
    },
  };
}
