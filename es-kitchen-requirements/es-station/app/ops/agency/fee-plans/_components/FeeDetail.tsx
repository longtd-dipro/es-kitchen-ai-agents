'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { condSig, tierLabel, validateFee, type Errs } from '@/lib/ops/general/logic';
import type { FeePlan, PayKind, CalcKind, Tier } from '@/lib/ops/general/types';
import { api, HistTable, Loading, Sec, useDirty } from '@/app/ops/_general/parts';
import { Icon } from '@/app/ops/_ui/Icon';
import { useOps } from '@/app/ops/_ui/OpsProvider';
import { useCanAct, useScreenCan } from '@/app/ops/_ui/perm';
import { ConfirmModal, Field, PageHead } from '@/app/ops/_ui/ui';
import { EditBtns, planOf, R, useRefData, ViewBtns } from '../../_components/common';
import { useDeleteRef } from '../../_components/useDeleteRef';

const blank = (): FeePlan => ({ id: '', name: '', src: '法人', pay: '単発', calc: '固定額', amount: '', rate: '', months: 1, tiers: [[50, ''], [100, ''], [9999, '']], status: '有効', note: '' });

/** 紹介フィーマスタの登録・詳細・編集（元：renderFeeDetail・saveFee） */
export default function FeeDetail({ mode, id }: { mode: 'new' | 'view' | 'edit'; id?: string }) {
  const router = useRouter();
  const { toast, toastError, openModal } = useOps();
  const canAct = useCanAct();
  const screenCan = useScreenCan();
  const d = useRefData();
  const dirty = useDirty(mode !== 'view');
  const del = useDeleteRef('feeplan');
  const [p, setP] = useState<FeePlan | null>(mode === 'new' ? blank() : null);
  const [e, setE] = useState<Errs>({});
  const base = d && id ? planOf(d, id) : undefined;
  useEffect(() => { if (d && id && !p && base) setP(structuredClone({ ...base, tiers: base.tiers ?? [[50, ''], [100, ''], [9999, '']] })); }, [d, id, p, base]);
  useEffect(() => { if (d && id && !base) router.replace(R.feeplan); }, [d, id, base, router]);
  if (!d || !p) return <Loading />;

  const isNew = mode === 'new', dis = mode === 'view';
  const shown = isNew ? { ...p, id: '' } : p;
  const tiers = (p.tiers ?? []) as Tier[];
  const up = (patch: Partial<FeePlan>) => { dirty.mark(); setP({ ...p, ...patch }); };
  const users = isNew ? 0 : Object.values(d.metas).filter((m) => m.plan === p.id).length;
  const crumb = isNew ? '紹介フィーマスタ登録' : mode === 'edit' ? '紹介フィーマスタ編集' : '紹介フィーマスタ詳細';
  const title = isNew ? '紹介フィーマスタ登録' : `${crumb} ${p.id}`;

  const run = async () => {
    try {
      const r = await api.action('saveFeePlan', { mode: isNew ? 'new' : 'edit', plan: p });
      dirty.clear();
      toast(isNew ? `紹介フィーマスタ「${p.name}」を登録しました` : r.condChg && r.users ? `紹介フィーマスタを保存しました。適用済みの紹介履歴 ${r.users}件は変更前の条件のままです` : '紹介フィーマスタを保存しました');
      router.push(`${R.feeplan}/${r.id}`);
    } catch (x) { toastError(x); }
  };
  const save = () => {
    const err = validateFee(p);
    setE(err);
    if (Object.keys(err).length) { toast('入力内容を確認してください（赤枠の項目）'); return; }
    const condChg = !isNew && base && condSig(base) !== condSig({ ...p, tiers: tiers.map((t) => [t[0], +t[1]]) });
    if (condChg && users) {
      openModal(<ConfirmModal kind="warn" title="使用中のフィープラン" text={<>このフィープランは紹介履歴 {users}件に適用済みです。<br />変更後の条件は<b>これから適用する紹介</b>から使われます。<b>適用済みの紹介履歴は変更前の条件のまま</b>です（終了予定月・状態・フィー計算は変わりません）。保存しますか？</>} ok="保存する" okCls="warn-solid" onOk={run} />);
      return;
    }
    run();
  };
  const leave = () => dirty.guard(() => router.push(isNew ? R.feeplan : `${R.feeplan}/${id}`));

  const radios = (name: string, v: string, opts: string[], on: (v: string) => void) => (
    <div className="radios" role="radiogroup">
      {opts.map((o) => <label key={o}><input type="radio" name={name} value={o} checked={o === v} disabled={dis} onChange={() => on(o)} />{o}</label>)}
    </div>
  );
  const num = (idv: string, v: unknown, ph: string, on: (v: string) => void, err?: boolean) => (
    <input className={`inp num${err ? ' err' : ''}`} id={idv} type="number" value={v == null ? '' : String(v)} placeholder={ph} disabled={dis} onChange={(x) => on(x.target.value)} />
  );
  /* 支払区分を変えたとき：単発＝1回、永続＝なし、ヶ月＝入れ直し（元の readFee） */
  const setPay = (pay: string) => up({ pay: pay as PayKind, months: pay === '単発' ? 1 : pay === '継続（永続）' ? null : p.pay === '継続（ヶ月）' ? p.months : '' });

  let calcBox;
  if (p.calc === '固定額') {
    calcBox = <div className="box"><div className="box-h">固定額設定<small>必須</small></div>
      <Field label="フィー金額（円）税込" req htmlFor="fp-amount" err={e.amount as string}>{num('fp-amount', p.amount, 'フィー金額（円）', (v) => up({ amount: v }), !!e.amount)}</Field></div>;
  } else if (p.calc === '請求額割合') {
    calcBox = <div className="box"><div className="box-h">請求額割合設定<small>必須</small></div>
      <Field label="フィー率（%）" req htmlFor="fp-rate" hint="紹介先法人への月次請求額（税込）に対する割合" err={e.rate as string}>{num('fp-rate', p.rate, '例：10', (v) => up({ rate: v }), !!e.rate)}</Field></div>;
  } else {
    calcBox = <div className="box"><div className="box-h">月次提供数別の金額設定<small>必須</small></div>
      <div className="tbl-wrap"><table className="tbl"><thead><tr><th>月次提供数</th><th className="num">フィー金額（円）税込</th></tr></thead><tbody>
        {tiers.map((t, i) => <tr key={i}><td>{tierLabel(tiers, i)}</td><td style={{ maxWidth: '18.571429rem' }}>{num(`fp-tier-${i}`, t[1], '', (v) => up({ tiers: tiers.map((x, j) => (j === i ? [x[0], v] : x)) as Tier[] }), !!e['t' + i])}</td></tr>)}
      </tbody></table></div></div>;
  }
  const perDis = dis || p.pay !== '継続（ヶ月）';
  const linked = d.linked[p.id] ?? [];

  return (
    <>
      <PageHead crumbs={['代理・紹介管理', '紹介フィーマスタ', crumb]} title={title}>
        {dis ? <ViewBtns onDel={canAct(api, 'deleteRef', { kind: 'feeplan' }) ? () => del(p.id, d) : undefined} onEdit={screenCan('update') ? () => router.push(`${R.feeplan}/${id}/edit`) : undefined} /> : <EditBtns isNew={isNew} onCancel={leave} onSave={save} />}
      </PageHead>
      <div className="card">
        <Sec title="紹介フィー情報">
          <div className="fg c2">
            <Field label="フィープランID"><input className="inp" id="fp-id" disabled value={shown.id} placeholder="フィープランID" /></Field>
            <Field label="フィープラン名" req htmlFor="fp-name" err={e.name as string}>
              <input className={`inp${e.name ? ' err' : ''}`} id="fp-name" value={p.name} placeholder="フィープラン名" disabled={dis} onChange={(x) => up({ name: x.target.value })} />
            </Field>
            <Field label="紹介元区分" req>{radios('fp-src', p.src === '法人' ? '法人紹介' : '代理店紹介', ['法人紹介', '代理店紹介'], (v) => up({ src: v === '法人紹介' ? '法人' : '代理店' }))}</Field>
            <Field label="ステータス" req>{radios('fp-status', p.status, ['有効', '無効'], (v) => up({ status: v }))}</Field>
            <Field label="備考" className="full" htmlFor="fp-note"><input className="inp" id="fp-note" value={p.note} placeholder="備考" disabled={dis} onChange={(x) => up({ note: x.target.value })} /></Field>
            {!isNew && (
              <Field label="連動する値引き（値引きマスタ）" className="full" hint="値引きマスタの「紹介フィープラン（請求名称）」でこのプランを選んだ値引きが表示されます（参照のみ）">
                <div className="chipline">
                  {linked.map((x) => <button key={x} className="chip" onClick={() => { router.push(R.discounts); toast('値引きマスタを開きました'); }}>{x}</button>)}
                  {!linked.length && <span style={{ color: 'var(--fg-3)' }}>連動する値引きはありません</span>}
                </div>
              </Field>
            )}
          </div>
        </Sec>
        <Sec title="フィー条件">
          {users > 0 && <div className="notice"><Icon name="bell" /><span>このプランは紹介履歴 <b>{users}件</b>に適用済みです。条件を変更しても、適用済みの紹介履歴は適用時点の条件のまま変わりません（変更後の条件は、これから適用する紹介から使われます）。</span></div>}
          <div className="fg c2">
            <Field label="支払区分" req>{radios('fp-pay', p.pay, ['単発', '継続（ヶ月）', '継続（永続）'], setPay)}</Field>
            <Field label="支払い期間" req htmlFor="fp-months" err={e.months as string}>
              <div style={{ position: 'relative' }}>
                <input className={`inp${e.months ? ' err' : ''}`} id="fp-months" placeholder="支払い期間" disabled={perDis} type={p.pay === '継続（ヶ月）' ? 'number' : 'text'}
                  value={p.pay === '単発' ? '1回' : p.pay === '継続（永続）' ? '永続' : p.months == null ? '' : String(p.months)} onChange={(x) => up({ months: x.target.value })} />
                <span style={{ position: 'absolute', right: '0.857143rem', top: '0.714286rem', color: 'var(--fg-2)' }}>{p.pay === '継続（ヶ月）' ? 'ヶ月' : ''}</span>
              </div>
            </Field>
            <Field label="算定方法" className="full" hint="契約条件に応じて、適切な算定方法を選択してください。">{radios('fp-calc', p.calc, ['固定額', '月次提供数別の金額', '請求額割合'], (v) => up({ calc: v as CalcKind }))}</Field>
            <div className="full">{calcBox}</div>
          </div>
        </Sec>
      </div>
      {!isNew && <div className="card"><div className="tabs"><button className="on">変更履歴</button></div><HistTable h={p.history ?? []} /></div>}
    </>
  );
}
