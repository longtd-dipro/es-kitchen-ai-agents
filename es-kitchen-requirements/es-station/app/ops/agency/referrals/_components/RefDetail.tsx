'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { validateRef, ymJa, type Errs } from '@/lib/ops/general/logic';
import { api, HistTable, Loading, Ro, Sec, useDirty } from '@/app/ops/_general/parts';
import { useOps } from '@/app/ops/_ui/OpsProvider';
import { useCanAct, useScreenCan } from '@/app/ops/_ui/perm';
import { Badge, ConfirmModal, Field, PageHead } from '@/app/ops/_ui/ui';
import { StopReferralModal } from '../../_components/StopReferralModal';
import { contractOf, corpName, EditBtns, PlanBlock, R, srcName, useRefData, ViewBtns } from '../../_components/common';
import { MonthInput } from '@/components/DateInput';

/** 紹介履歴の詳細・編集（元：renderRefDetail・saveRef。変更できるのは紹介フィープラン・支払い開始年月・備考） */
export default function RefDetail({ mode, id }: { mode: 'view' | 'edit'; id: string }) {
  const router = useRouter();
  const { toast, toastError, openModal } = useOps();
  const canAct = useCanAct();
  const screenCan = useScreenCan();
  const d = useRefData();
  const dirty = useDirty(mode !== 'view');
  const [f, setF] = useState<{ plan: string; payStart: string; note: string } | null>(null);
  const [e, setE] = useState<Errs>({});
  const r = d?.referrals.find((x) => x.id === id);
  useEffect(() => { if (r && !f) setF({ plan: r.plan, payStart: r.payStart, note: r.note }); }, [r, f]);
  useEffect(() => { if (d && !r) router.replace(R.referral); }, [d, r, router]);
  if (!d || !r || !f) return <Loading />;

  const dis = mode === 'view', c = contractOf(d, r.contract), m = d.metas[r.contract];
  const up = (patch: Partial<typeof f>) => { dirty.mark(); setF({ ...f, ...patch }); };
  const crumb = mode === 'edit' ? '紹介履歴編集' : '紹介履歴詳細';
  const openBranch = () => { router.push(R.branches); toast(`法人・契約管理 ＞ 拠点一覧を開きました（親契約 ${c.id}）`); };
  const err = (k: string) => (typeof e[k] === 'string' ? (e[k] as string) : undefined);

  const save = async () => {
    const x = validateRef(f, c);
    setE(x);
    if (Object.keys(x).length) { toast('入力内容を確認してください（赤枠の項目）'); return; }
    try {
      await api.action('saveReferral', { contract: r.contract, ...f });
      dirty.clear();
      toast('紹介履歴を保存しました');
      router.push(`${R.referral}/${id}`);
    } catch (y) { toastError(y); }
  };

  return (
    <>
      <PageHead crumbs={['代理・紹介管理', '紹介履歴', crumb]} title={`${crumb} ${r.id}`}>
        {dis ? <>{canAct(api, 'stopReferral', {}) && (r.status === '中止'
          ? <button className="btn out lg" onClick={() => openModal(<ConfirmModal kind="warn" title="中止を取り消す" text="紹介の中止を取り消します（中止する前の状態に戻ります）。中止のあいだに止めた月の支払は作り直しません。よろしいですか？" ok="取り消す" okCls="warn-solid" onOk={async () => { try { await api.action('resumeReferral', { id: r.id }); toast('保存しました。'); } catch (y) { toastError(y); } }} />)}>中止を取り消す</button>
          : ['契約前', '有効'].includes(r.status) && <button className="btn dan lg" onClick={() => openModal(<StopReferralModal id={r.id} />)}>紹介の中止</button>)}
        <ViewBtns del={false} onEdit={screenCan('update') ? () => router.push(`${R.referral}/${id}/edit`) : undefined} /></> : <EditBtns onCancel={() => dirty.guard(() => router.push(`${R.referral}/${id}`))} onSave={save} />}
      </PageHead>
      <div className="card">
        <Sec title="紹介基本情報">
          <div className="fg">
            <Field label="紹介ID"><Ro v={r.id} /></Field>
            <Field label="紹介元区分" req><Ro v={r.srcType} /></Field>
            <Field label={r.srcType === '代理店' ? '紹介元（代理店）' : '紹介元（法人）'} req hint={r.srcType === '法人' ? '親契約に「紹介元法人」の項目がまだないため仮データです（要仕様決定）' : undefined}><Ro v={`${r.src} ${srcName(d, r)}`} /></Field>
            <Field label="親契約番号" req>
              <div style={{ display: 'flex', gap: '0.571429rem' }}><Ro v={c.id} /><button className="btn sm out" style={{ height: '2.857143rem' }} onClick={openBranch}>親契約を開く</button></div>
            </Field>
            <Field label="紹介先法人"><Ro v={`${c.cu || '—'} ${corpName(d, c)}`} /></Field>
            <Field label="紹介先拠点"><Ro v={`${c.br} ${c.branch}`} /></Field>
            <Field label="契約ステータス（親契約）"><Ro v={c.st} /></Field>
            <Field label="契約開始年月"><Ro v={ymJa(c.start) || '—（未開始）'} /></Field>
            <Field label="支払い開始年月" req htmlFor="r-paystart" err={err('payStart')}>
              <MonthInput className={`inp${e.payStart ? ' err' : ''}`} id="r-paystart" value={f.payStart} disabled={dis} onChange={(x) => up({ payStart: x.target.value })} />
            </Field>
            <Field label="紹介ステータス"><div style={{ height: '2.857143rem', display: 'flex', alignItems: 'center' }}><Badge v={r.status} /></div></Field>
            <Field label="終了予定月"><Ro v={ymJa(r.endPlan) || '—'} /></Field>
            <Field label="終了月"><Ro v={ymJa(r.end) || '—'} /></Field>
            <Field label="備考" className="full" htmlFor="r-note"><input className="inp" id="r-note" value={f.note} placeholder="備考" disabled={dis} onChange={(x) => up({ note: x.target.value })} /></Field>
          </div>
          <p className="hint" style={{ fontSize: '0.857143rem', color: 'var(--fg-3)', margin: '0.571429rem 0 0' }}>紹介元・親契約・紹介先は、法人・契約管理の親契約（代理店コード）から反映されます。変更は親契約で行ってください。</p>
        </Sec>
        <Sec title="紹介フィープラン">
          <PlanBlock d={d} planId={f.plan} dis={dis} err={err('plan')} src={r.srcType} cond={m && f.plan === m.plan ? m.cond : null} onPick={(plan) => up({ plan })} />
        </Sec>
      </div>
      <div className="card"><div className="tabs"><button className="on">変更履歴</button></div><HistTable h={r.history} /></div>
    </>
  );
}
