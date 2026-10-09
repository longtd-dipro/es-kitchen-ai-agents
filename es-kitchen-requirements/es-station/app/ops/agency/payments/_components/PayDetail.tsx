'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { payTotals, todayIso, validatePay, ymJa, type Errs } from '@/lib/ops/general/logic';
import type { Payment } from '@/lib/ops/general/types';
import { api, HistTable, Loading, Ro, Sec, useDirty } from '@/app/ops/_general/parts';
import { useOps } from '@/app/ops/_ui/OpsProvider';
import { useScreenCan } from '@/app/ops/_ui/perm';
import { Field, PageHead, yen } from '@/app/ops/_ui/ui';
import { EditBtns, R, targetName, useRefData, ViewBtns } from '../../_components/common';
import { DateInput } from '@/components/DateInput';

/** フィー支払履歴の詳細・編集（元：renderPayDetail・savePay。調整額を入れると合計を計算し直す） */
export default function PayDetail({ mode, id }: { mode: 'view' | 'edit'; id: string }) {
  const router = useRouter();
  const { toast, toastError } = useOps();
  const screenCan = useScreenCan();
  const d = useRefData();
  const dirty = useDirty(mode !== 'view');
  const [p, setP] = useState<Payment | null>(null);
  const [e, setE] = useState<Errs>({});
  const base = d?.payments.find((x) => x.id === id);
  useEffect(() => { if (base && !p) setP(structuredClone({ ...base, date: base.date.replace(/\//g, '-') })); }, [base, p]);
  useEffect(() => { if (d && !base) router.replace(R.payment); }, [d, base, router]);
  if (!d || !base || !p) return <Loading />;

  const dis = mode === 'view', t = payTotals(p), name = dis ? 'フィー支払履歴詳細' : 'フィー支払履歴編集';
  const up = (patch: Partial<Payment>) => { dirty.mark(); setP({ ...p, ...patch }); };
  const save = async () => {
    const x = validatePay(p.status, p.date);
    setE(x);
    if (Object.keys(x).length) { toast('入力内容を確認してください（赤枠の項目）'); return; }
    try {
      await api.action('savePayment', { id, method: p.method, status: p.status, date: p.date, note: p.note.trim(), adj: p.lines.map((l) => +l.adj || 0) });
      dirty.clear();
      toast('支払履歴を保存しました');
      router.push(`${R.payment}/${id}`);
    } catch (y) { toastError(y); }
  };
  const sumBox = (
    <>
      <div><small>算定対象合計額</small><b>{yen(t.calcBase)}</b><small>※フィー計算の元になった請求額の合計</small></div>
      <div><small>算定合計額</small><b>{yen(t.fee)}</b><small>※フィーとして算定された金額の合計</small></div>
      <div><small>調整合計額</small><b>{yen(t.adj)}</b><small>&nbsp;</small></div>
      <div className="hl"><small>支払い合計額</small><b>{yen(t.total)}</b><small>&nbsp;</small></div>
    </>
  );

  return (
    <>
      <PageHead crumbs={['代理・紹介管理', '支払履歴', name]} title={`${name} ${p.id}`}>
        {dis ? <ViewBtns del={false} onEdit={screenCan('update') ? () => router.push(`${R.payment}/${id}/edit`) : undefined} /> : <EditBtns onCancel={() => dirty.guard(() => router.push(`${R.payment}/${id}`))} onSave={save} />}
      </PageHead>
      <div className="card">
        <Sec title="支払い基本情報">
          <div className="fg c2">
            <Field label="支払いID"><Ro v={p.id} /></Field>
            <Field label="支払対象月"><Ro v={ymJa(p.month)} /></Field>
            <Field label="支払い先区分"><Ro v={p.type} /></Field>
            <Field label={p.type === '代理店' ? '支払い先（紹介元代理店）' : '支払い先（紹介元法人）'}><Ro v={`${p.target} ${targetName(d, p)}`} /></Field>
            <Field label="紹介件数"><Ro v={`${p.lines.length}件`} /></Field>
          </div>
        </Sec>
        <Sec title="紹介フィー">
          <div className="fg c2">
            <Field label="支払い状況" req>
              <div className="radios" role="radiogroup">
                {['未払い', '支払済', '対象外'].map((o) => (
                  <label key={o}><input type="radio" name="p-status" checked={p.status === o} disabled={dis} onChange={() => up({ status: o, date: o === '支払済' && !p.date ? todayIso() : p.date })} />{o}</label>
                ))}
              </div>
            </Field>
            <Field label="支払日" req htmlFor="p-date" err={e.date as string}>
              <DateInput className={`inp${e.date ? ' err' : ''}`} id="p-date" value={p.date} disabled={dis || p.status !== '支払済'} onChange={(x) => up({ date: x.target.value })} />
            </Field>
            <Field label="処理方法" req htmlFor="p-method">
              <select className="sel" id="p-method" disabled={dis} value={p.method} onChange={(x) => up({ method: x.target.value })}>
                {['振込', '請求値引き'].map((o) => <option key={o}>{o}</option>)}
              </select>
            </Field>
            <div className="full sum">{sumBox}</div>
            <Field label="備考" className="full" htmlFor="p-note"><input className="inp" id="p-note" value={p.note} placeholder="備考" disabled={dis} onChange={(x) => up({ note: x.target.value })} /></Field>
          </div>
        </Sec>
        <Sec title="紹介フィー内訳">
          <div className="tbl-wrap">
            <table className="tbl">
              <thead><tr><th>No</th><th>紹介ID</th><th>紹介先法人</th><th>紹介フィープラン</th><th>支払区分</th><th className="num">拠点数</th><th>算定方式</th><th className="num">算定対象額</th><th>フィー金額・率（税込）</th><th className="num">算定額</th><th className="num">調整額</th><th className="num">支払額(税込)</th></tr></thead>
              <tbody>
                {p.lines.map((l, i) => (
                  <tr key={i}>
                    <td>{i + 1}</td>
                    <td><Link className="lnk u mono" href={`${R.referral}/${l.ref}`}>{l.ref}</Link></td>
                    <td>{l.corp}</td>
                    <td><div className="clip" style={{ maxWidth: '8.571429rem' }}>{l.plan}</div></td>
                    <td>{l.pay}</td>
                    <td className="num">{l.sites}</td>
                    <td>{l.calc}</td>
                    <td className="num">{yen(l.base)}</td>
                    <td>{l.rateTxt}</td>
                    <td className="num">{yen(l.fee)}</td>
                    <td style={{ minWidth: '7.857143rem' }}>
                      {dis ? <div className="num" style={{ textAlign: 'right' }}>{yen(+l.adj || 0)}</div>
                        : <input className="inp" type="number" step={100} value={String(l.adj)} aria-label="調整額" onChange={(x) => up({ lines: p.lines.map((y, j) => (j === i ? { ...y, adj: x.target.value } : y)) })} />}
                    </td>
                    <td className="num">{yen(l.fee + (+l.adj || 0))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!dis && <p style={{ fontSize: '0.857143rem', color: 'var(--fg-2)', margin: '0.571429rem 0 0' }}>調整額を入力すると、支払額と上部の合計が自動で再計算されます（マイナスは減額）。</p>}
        </Sec>
      </div>
      <div className="card"><div className="tabs"><button className="on">変更履歴</button></div><HistTable h={p.history} /></div>
    </>
  );
}
