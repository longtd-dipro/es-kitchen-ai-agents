'use client';

import type { ReactNode } from 'react';
import { useQuery } from '@/lib/ops/core/client';
import type { RefData } from '@/lib/ops/areas/general';
import { condSig, planAmountTxt, planPayTxt, planPeriodTxt } from '@/lib/ops/general/logic';
import type { FeeCond, FeePlan, Payment, RefContract, Referral } from '@/lib/ops/general/types';
import { api } from '@/app/ops/_general/parts';
import { Icon } from '@/app/ops/_ui/Icon';
import { Field } from '@/app/ops/_ui/ui';

/* 代理・紹介管理の画面で共通（元：main_script2 の 代理・紹介管理） */

export const R = {
  feeplan: '/ops/agency/fee-plans',
  agency: '/ops/agency/agencies',
  referral: '/ops/agency/referrals',
  payment: '/ops/agency/payments',
  /** 法人・契約管理 ＞ 拠点一覧（親契約） */
  branches: '/ops/branches',
  discounts: '/ops/masters/discounts',
};

/** 代理・紹介管理のデータ全部 */
export const useRefData = () => useQuery(api, 'refData').data as RefData | undefined;

export const planOf = (d: RefData, id: string) => d.plans.find((p) => p.id === id);
export const agencyOf = (d: RefData, id: string) => d.agencies.find((a) => a.id === id);
export const corpOf = (d: RefData, id: string) => d.corps.find((c) => c.id === id);
export const contractOf = (d: RefData, id: string) => d.contracts.find((c) => c.id === id) as RefContract;
export const corpName = (d: RefData, c: RefContract) => (c.cu ? corpOf(d, c.cu)?.name ?? '' : '（法人なし）');
export const srcName = (d: RefData, r: Referral) => (r.srcType === '代理店' ? agencyOf(d, r.src)?.name || r.src : corpOf(d, r.src)?.name || r.src);
export const targetName = (d: RefData, p: Payment) => (p.type === '代理店' ? agencyOf(d, p.target)?.name || p.target : corpOf(d, p.target)?.name || p.target);
/** 代理店の件数（紹介合計／支払対象＝契約中の紹介／現在契約中＝親契約が有効） */
export function agencyCounts(d: RefData, id: string): [number, number, number] {
  const rs = d.referrals.filter((r) => r.srcType === '代理店' && r.src === id);
  return [rs.length, rs.filter((r) => r.status === '有効').length, rs.filter((r) => ['有効', '解約手続き中'].includes(contractOf(d, r.contract).st)).length];
}

/** 詳細の見出しのボタン（削除・編集）。onDel・onEdit がなければ（権限がない）出さない */
export const ViewBtns = ({ del = true, onDel, onEdit }: { del?: boolean; onDel?: () => void; onEdit?: () => void }) => (
  <>
    {del && onDel && <button className="btn dan lg" onClick={onDel}><Icon name="trash" />削除</button>}
    {onEdit && <button className="btn pri lg" onClick={onEdit}><Icon name="edit" />編集</button>}
  </>
);
/** 編集の見出しのボタン（キャンセル・登録／保存） */
export const EditBtns = ({ isNew, onCancel, onSave }: { isNew?: boolean; onCancel: () => void; onSave: () => void }) => (
  <>
    <button className="btn lg ghost" onClick={onCancel}>キャンセル</button>
    <button className="btn pri lg" onClick={onSave}>{isNew ? '登録' : '保存'}</button>
  </>
);

/** 紹介フィープランの欄（元：planBlock）。cond があれば紹介に適用した時点の条件を出す */
/** src＝選べるプランの紹介元区分（代理店の画面は「代理店」、紹介履歴は紹介元の区分。いま選んでいるプランは残す） */
export function PlanBlock({ d, planId, dis, err, cond, src, onPick }: { d: RefData; planId: string; dis: boolean; err?: string; cond?: FeeCond | null; src?: '代理店' | '法人'; onPick: (id: string) => void }) {
  const m = planOf(d, planId);
  const p: Partial<FeePlan> | undefined = cond ? { ...m, ...cond } : m;
  const diff = cond && m && condSig(m) !== condSig(cond);
  const ro = (v: string, ph: string) => <input className="inp" disabled value={v} placeholder={ph} />;
  let hint: ReactNode = '支払区分・算定方式・金額・期間は選択した紹介フィーマスタから自動で反映されます。';
  if (cond) {
    hint = (
      <>この紹介に<b>適用した時点</b>の条件です（紹介フィーマスタを後から変更しても変わりません）。{diff && m && <> <span className="txt-warn">※現在の紹介フィーマスタ：{planPayTxt(m)}・{m.calc}・{planAmountTxt(m)}・{planPeriodTxt(m)}</span></>}</>
    );
  }
  return (
    <>
      <div className="fg">
        <Field label="紹介フィープラン" req htmlFor="f-plan" err={err}>
          <select className={`sel${err ? ' err' : ''}`} id="f-plan" disabled={dis} value={planId} onChange={(e) => onPick(e.target.value)}>
            <option value="">紹介フィープラン</option>
            {d.plans.filter((x) => x.id === planId || (x.status === '有効' && (!src || x.src === src))).map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
          </select>
        </Field>
        <Field label="フィー支払区分">{ro(planPayTxt(p), 'フィー支払区分')}</Field>
        <Field label="フィー算定方式">{ro(p?.calc || '', 'フィー算定方式')}</Field>
        <Field label="フィー金額・率（税込）">{ro(planAmountTxt(p), 'フィー金額・率')}</Field>
        <Field label="フィー支払期間">{ro(planPeriodTxt(p), 'フィー支払期間')}</Field>
      </div>
      <p className="hint" style={{ fontSize: '0.857143rem', color: 'var(--fg-2)', margin: '0.571429rem 0 0' }}>{hint}</p>
    </>
  );
}

/** 別の画面（ほかの領域）を開いて、何を開いたかをトーストで出す */
export const openOther = (push: (href: string) => void, toast: (m: string) => void, href: string, note?: string) => { push(href); if (note) toast(note); };
