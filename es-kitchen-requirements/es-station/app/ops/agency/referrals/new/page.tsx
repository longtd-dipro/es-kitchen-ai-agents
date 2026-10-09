'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { validateRef, ymJa, type Errs } from '@/lib/ops/general/logic';
import { api, Loading, Ro, Sec, useDirty } from '@/app/ops/_general/parts';
import { useOps } from '@/app/ops/_ui/OpsProvider';
import { Field, PageHead } from '@/app/ops/_ui/ui';
import { MonthInput } from '@/components/DateInput';
import { contractOf, corpName, EditBtns, PlanBlock, R, useRefData } from '../../_components/common';

/**
 * 紹介履歴の登録（紹介元が法人のとき・承認の後の後付け）。代理店コードのある親契約は、親契約から自動で作るのでここでは作らない。
 * 紹介元の法人・紹介先の親契約・支払い開始年月・紹介フィープラン（紹介元区分＝法人）・備考
 */
export default function Page() {
  const router = useRouter();
  const { toast, toastError } = useOps();
  const d = useRefData();
  const dirty = useDirty(true);
  const [f, setF] = useState({ srcCorp: '', contract: '', payStart: '', plan: '', note: '' });
  const [e, setE] = useState<Errs>({});
  if (!d) return <Loading />;

  const up = (patch: Partial<typeof f>) => { dirty.mark(); setF({ ...f, ...patch }); };
  const cands = d.contracts.filter((c) => !c.agent && !d.metas[c.id]);
  const c = f.contract ? contractOf(d, f.contract) : undefined;
  const err = (k: string) => (typeof e[k] === 'string' ? (e[k] as string) : undefined);
  const save = async () => {
    const x: Errs = c ? validateRef({ plan: f.plan, payStart: f.payStart }, c) : {};
    if (!f.srcCorp) x.srcCorp = '紹介元法人は必須項目です。';
    if (!f.contract) x.contract = '紹介先契約は必須項目です。';
    setE(x);
    if (Object.keys(x).length) { toast('入力内容を確認してください（赤枠の項目）'); return; }
    try {
      const r = await api.action('createReferral', f);
      dirty.clear();
      toast('保存しました。');
      router.push(`${R.referral}/${r.id}`);
    } catch (y) { toastError(y); }
  };
  const plan1 = d.plans.find((p) => p.id === f.plan);

  return (
    <>
      <PageHead crumbs={['代理・紹介管理', '紹介履歴', '紹介履歴登録']} title="紹介履歴登録">
        <EditBtns isNew onCancel={() => dirty.guard(() => router.push(R.referral))} onSave={save} />
      </PageHead>
      <div className="card">
        <Sec title="紹介基本情報">
          <div className="fg">
            <Field label="紹介ID"><Ro v="" /></Field>
            <Field label="紹介元区分" req><Ro v="法人" /></Field>
            <Field label="紹介元法人ID・法人名" req htmlFor="n-src" err={err('srcCorp')}>
              <select className={`sel${e.srcCorp ? ' err' : ''}`} id="n-src" value={f.srcCorp} onChange={(x) => up({ srcCorp: x.target.value })}>
                <option value="">紹介元法人</option>{d.corps.map((o) => <option key={o.id} value={o.id}>{o.id}・{o.name}</option>)}
              </select>
            </Field>
            <Field label="紹介先契約ID" req htmlFor="n-contract" err={err('contract')} hint="代理店コードのない親契約で、まだ紹介履歴がないものから選びます">
              <select className={`sel${e.contract ? ' err' : ''}`} id="n-contract" value={f.contract} onChange={(x) => { const cc = contractOf(d, x.target.value); up({ contract: x.target.value, payStart: cc?.start ?? '' }); }}>
                <option value="">紹介先契約ID</option>{cands.map((o) => <option key={o.id} value={o.id}>{o.id}　{corpName(d, o)}　{o.branch}</option>)}
              </select>
            </Field>
            <Field label="紹介先法人ID・法人名"><Ro v={c ? `${c.cu || '—'} ${corpName(d, c)}` : ''} /></Field>
            <Field label="紹介先拠点ID・拠点名"><Ro v={c ? `${c.br} ${c.branch}` : ''} /></Field>
            <Field label="契約開始年月"><Ro v={c ? ymJa(c.start) || '—（未開始）' : ''} /></Field>
            <Field label="支払い開始年月" req htmlFor="n-paystart" err={err('payStart')}>
              <MonthInput className={`inp${e.payStart ? ' err' : ''}`} id="n-paystart" value={f.payStart} onChange={(x) => up({ payStart: x.target.value })} />
            </Field>
            <Field label="備考" className="full" htmlFor="n-note"><input className="inp" id="n-note" value={f.note} placeholder="備考" onChange={(x) => up({ note: x.target.value })} /></Field>
          </div>
        </Sec>
        <Sec title="紹介フィープラン">
          <PlanBlock d={d} planId={f.plan} dis={false} err={err('plan')} src="法人" onPick={(plan) => up({ plan })} />
          {plan1 && null}
        </Sec>
      </div>
    </>
  );
}
