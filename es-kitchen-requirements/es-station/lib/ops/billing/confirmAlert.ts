import { today } from '@/lib/supplier/dates';
import { billingLogic } from './logic';
import type { BillingState } from './types';

/*
 * 請求の確定のアラート（2026/10/03 決定：25日に自動で確定しない。20日締めのあと 21日から、確定が済むまで運営の TOP に出す）。
 * 締め月（billing.meta の month）の 21日以降に、子契約の確定待ちの請求書（グループ）と、まだ確定していない 実績精算（後払い）・前払い（固定額）の拠点を返す。
 * 日次バッチ（lib/domain/batch.ts の confirmAlert）は記録だけ。中身はここで、運営の確定の状態（billing.br）から毎回数える
 */
export function confirmAlertOf(S: BillingState, day = today()) {
  const L = billingLogic(S);
  const from = `${S.month.replace('-', '/')}/21`;
  const groups = day < from ? [] : L.groupsOf(S.month).filter((x) => x.st.k === 'wait').map((x) => {
    const c = x.g.c, b = x.g.bid ? L.br(x.g.bid) : null;
    return {
      key: x.key, href: `/ops/billing/confirm/${L.groupHref(x)}?m=${S.month}`,
      name: b ? `${c.id ? c.name + ' ／ ' : ''}${b.name}` : c.name,
      act: x.g.bs.filter((y) => !y.actOK).map((y) => ({ id: y.id, name: y.name })),
      fix: x.g.bs.filter((y) => !y.fixOK).map((y) => ({ id: y.id, name: y.name })),
    };
  });
  return {
    active: groups.length > 0, month: S.month, from,
    act: groups.reduce((n, g) => n + g.act.length, 0), fix: groups.reduce((n, g) => n + g.fix.length, 0), groups,
  };
}
