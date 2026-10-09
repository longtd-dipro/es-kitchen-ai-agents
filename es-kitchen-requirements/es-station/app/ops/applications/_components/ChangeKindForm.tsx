'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useQuery } from '@/lib/ops/core/client';
import { CF_ROUTES, PROXY_USER } from '@/lib/ops/applications/constants';
import { PC_KINDS, PS_KINDS, type PcForm } from '@/lib/ops/applications/logic';
import { chFields, type ChField, type ChKind } from '@/lib/corp/sites/logic';
import { today } from '@/lib/supplier/dates';
import { useOps } from '../../_ui/OpsProvider';
import { useCanAct } from '../../_ui/perm';
import { api, backTo } from './api';
import { Btn, Check, Inline, PageHead } from './ds';
import { DiscardModal, Fld, scrollToBad, Sel, useLeaveGuard } from './proxyParts';
import { DateInput } from '@/components/DateInput';

/*
 * 変更申請の代理入力（契約変更タブ：プラン・配送・設備・拠点情報・法人情報）。台帳 運営A 2026-10-05 契約申請管理 Q7・2026-10-06 Q11：
 * 種類ごとの項目は法人Web の『ご希望の内容』と同じ（lib/corp/sites/logic.ts の chFields）。拠点は複数選べる（拠点ごとに入力）。受付経路＝代理入力。
 * 登録すると承認待ちの申請ができ、法人Webからの申請と同じ申請詳細（影響と設定 → 拠点ごとの承認）で進める。
 */
const KIND_NOTE: Partial<Record<ChKind, string>> = {
  chg: 'プランとコースを選びます（いまと同じプランは選べません）。承認の前に、申請詳細の「影響と設定」で設備の異動の案を直せます。',
  opt: '配送方法（ES配送便／COOL便）とお届け回数の変更です。設備が自販機の拠点は ES配送便に固定です。納品不可曜日・設備の希望日は「拠点情報の変更」で登録します。',
  eqp: '設備の追加・サイズ／機種の変更・返却です。入力から設備の異動の案を作ります（承認の前に、申請詳細で行と費用を直せます）。',
  inf: '承認が必要な項目（拠点名・フリガナ・住所・電話・請求書の宛先・ゲストモード・納品不可曜日・設備の希望日）が対象です。変えたいものだけチェックします。',
  cop: '請求書に載る法人の住所・電話番号・FAX番号です。法人1件として承認します（拠点は選びません）。',
  sus: '休止は通算1年（12ヶ月）が上限です。休止したい期間は、通算の残り月数までの中から選びます。再開予定月は、開始したいご利用月と期間から決まります。',
  rsm: '再開できるのは休止中と休止予定の拠点だけです。休止予定の拠点に出すと「休止予定の取消」になり、再開するご利用月は休止の開始月で決まります（休止期間0か月・通算1年には入れません。注文は戻りません）。',
  cxl: '解約日は、受付日とオーダー締切（既定は前月15日）で決まる最短の日より前は選べません。自販機の拠点も同じ締切です。',
};

/** 契約変更タブ（プラン・配送・設備・拠点情報・法人情報）と休止・解約タブ（休止・再開・解約）は、同じ形のフォーム（台帳 運営A 2026-10-07 Q17） */
export default function ChangeKindForm({ tab = 'change' }: { tab?: 'change' | 'stop' }) {
  const kinds = tab === 'stop' ? PS_KINDS : PC_KINDS;
  const router = useRouter();
  const { toast, toastError } = useOps();
  const canAct = useCanAct();
  const { data: sites } = useQuery(api, 'proxyBranches');
  const [f, setF] = useState<PcForm>({ route: '', recv: today().replace(/\//g, '-'), kind: kinds[0].k, corpId: '', sites: [], vals: {} });
  const [dirty, setDirty] = useState(false);
  const [bad, setBad] = useState<string[]>([]);
  const [leave, setLeave] = useState(false);
  useLeaveGuard(dirty);

  /* 選べる開始月・解約日は、今日ではなく受付日から決める（台帳 運営A H10） */
  const recvDay = (f.recv || today()).replace(/-/g, '/');
  const all = sites ?? [];
  const corps = [...new Map(all.map((s) => [s.corpId, `${s.corpId} ${s.corpName}`])).entries()].map(([v, t]) => ({ v, t }));
  const mine = all.filter((s) => s.corpId === f.corpId);
  const isCorp = f.kind === 'cop';
  const set = (p: Partial<PcForm>) => { setF({ ...f, ...p }); setDirty(true); };
  /* 受付日を変えたら、受付日で決まる選択（開始月・解約日）は選び直す */
  const setRecv = (v: string) => {
    const vals = Object.fromEntries(Object.entries(f.vals).map(([id, x]) => [id, Object.fromEntries(Object.entries(x).filter(([k]) => k !== 'cyc' && k !== 'end'))]));
    setF({ ...f, recv: v, vals }); setDirty(true);
  };
  const setVal = (id: string, k: string, v: string) => {
    setF({ ...f, vals: { ...f.vals, [id]: { ...f.vals[id], [k]: v } } });
    setDirty(true); setBad(bad.filter((x) => x !== `${id}.${k}`));
  };
  const toggle = (id: string, on: boolean) => set({ sites: on ? [...f.sites, id] : f.sites.filter((x) => x !== id) });
  const targets = isCorp ? (f.corpId ? [{ id: f.corpId, name: `${f.corpId}（法人）`, ch: null as null | (typeof all)[number]['ch'], loans: [] as (typeof all)[number]['loans'] }] : []) : mine.filter((s) => f.sites.includes(s.id));
  const fieldsOf = (id: string, ch: (typeof all)[number]['ch'] | null) => {
    const fs = chFields(f.kind, ch, f.vals[id] ?? {}, recvDay);
    /* 休止予定の拠点の再開（休止予定の取消）：再開するご利用月は休止の開始月で決まる */
    const plan = f.kind === 'rsm' ? all.find((x) => x.id === id)?.pausePlan : undefined;
    return plan ? fs.map((x) => (x.key === 'cyc' ? { ...x, type: 'ro' as const, req: false, value: `${+plan.slice(0, 4)}年${+plan.slice(5)}月分　休止予定の取消（休止の開始月）`, hint: undefined } : x)) : fs;
  };
  const toList = () => { backTo(tab); router.push('/ops/applications'); };
  const cancel = () => (dirty ? setLeave(true) : toList());

  const save = async () => {
    const miss: string[] = [];
    if (!f.route) miss.push('route');
    if (!f.corpId) miss.push('corp');
    if (!isCorp && !f.sites.length) miss.push('sites');
    targets.forEach((t) => fieldsOf(t.id, t.ch).forEach((x) => { if (x.req && x.type !== 'ro' && !String(f.vals[t.id]?.[x.key] ?? '').trim()) miss.push(`${t.id}.${x.key}`); }));
    if (miss.length) { setBad(miss); scrollToBad(); toast(`入力されていない項目があります（${miss.length}件）`); return; }
    try {
      const { no, nos } = await api.action('createChanges', { form: f });
      setDirty(false);
      toast(`登録しました。承認待ちの申請として追加しました（${nos.join('・')}）`);
      router.push(nos.length > 1 ? '/ops/applications' : `/ops/applications/${no}`);
    } catch (e) { toastError(e); }
  };

  const bd = (k: string) => bad.includes(k);
  const renderField = (id: string, x: ChField, loans: { label: string }[]) => {
    const v = f.vals[id]?.[x.key] ?? '';
    const key = `${id}.${x.key}`;
    let body;
    if (x.type === 'ro') body = <div className="ro lock">{x.value || '—'}</div>;
    else if (x.type === 'sel') body = <Sel value={v} opts={x.opts ?? []} ph="選択してください" onChange={(nv) => setVal(id, x.key, nv)} />;
    else if (x.type === 'ta') body = <textarea rows={2} maxLength={500} value={v} placeholder={x.ph} onChange={(e) => setVal(id, x.key, e.target.value)} />;
    else if (x.type === 'date') body = <DateInput value={v} onChange={(e) => setVal(id, x.key, e.target.value)} />;
    else if (x.type === 'chk') {
      const on = v.split('／').filter(Boolean);
      body = <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem 1.25rem' }}>{(x.opts ?? []).map((o) => (
        <Check key={o} checked={on.includes(o)} onChange={(c) => setVal(id, x.key, (c ? [...on, o] : on.filter((y) => y !== o)).sort((a, b) => (x.opts ?? []).indexOf(a) - (x.opts ?? []).indexOf(b)).join('／'))}>{o}</Check>
      ))}</div>;
    } else if (x.key === 'target') body = <Sel value={v} opts={loans.map((l) => l.label)} ph="いまお使いの設備から選ぶ" onChange={(nv) => setVal(id, x.key, nv)} />;
    else body = <input value={v} placeholder={x.ph} onChange={(e) => setVal(id, x.key, e.target.value)} />;
    return <Fld key={x.key} label={x.label} req={x.req && x.type !== 'ro'} hint={x.hint} wide={x.wide || x.type === 'chk'} bad={bd(key)}>{body}</Fld>;
  };

  return (
    <div id="apx">
      <div className="page" id="apxbody">
        <div className="apx-narrow" id="nf">
          <PageHead crumb={[{ t: '契約申請管理', on: cancel }, '変更申請の代理入力']} title="変更申請の代理入力"
            actions={<><Btn variant="outline" onClick={cancel}>キャンセル</Btn>{canAct(api, 'createChanges') && <Btn onClick={save}>登録</Btn>}</>} />
          <div className="card"><h2>受付の情報<span className="sub">どこから受けたか（履歴に残ります）</span></h2><div className="pad"><div className="frow">
            <Fld label="受付経路" req err="受付経路を選んでください" bad={bd('route')}><Sel value={f.route} opts={CF_ROUTES} ph="選択してください" onChange={(v) => set({ route: v })} /></Fld>
            <Fld label="受付日" req>
              <DateInput value={f.recv} onChange={(e) => setRecv(e.target.value)} />
            </Fld>
            <Fld label="入力者"><div className="ro lock">{PROXY_USER}</div></Fld>
          </div></div></div>
          <div className="card"><h2>申請の内容<span className="sub">1回の申請で1種類（法人Webと同じ）</span></h2><div className="pad"><div className="frow">
            <Fld label="申請の種類" req><Sel value={f.kind} opts={kinds.map((x) => ({ v: x.k, t: x.t }))} onChange={(v) => set({ kind: v as ChKind, sites: [], vals: {} })} /></Fld>
            <Fld label="法人" req err="法人を選んでください" bad={bd('corp')}><Sel value={f.corpId} opts={corps} ph="法人ID・法人名で選ぶ" onChange={(v) => set({ corpId: v, sites: [], vals: {} })} /></Fld>
            <div className="fld wide"><Inline tone="info">{KIND_NOTE[f.kind]}</Inline></div>
            {!isCorp && (
              <Fld label="拠点（複数選べます）" req err="拠点を1つ以上選んでください" wide bad={bd('sites')} hint="承認待ちの申請がある拠点・この手続きの対象外の拠点は選べません">
                {!f.corpId ? <div className="ro lock">先に法人を選んでください</div> : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    {mine.map((s) => (
                      <Check key={s.id} checked={f.sites.includes(s.id)} disabled={!!s.why[f.kind]} onChange={(c) => toggle(s.id, c)}>
                        {s.id}　{s.name}（{s.ch.plan}）{s.why[f.kind] ? <span className="mm">　{s.why[f.kind]}</span> : null}
                      </Check>
                    ))}
                    {!mine.length && <span className="mm">この法人にご利用中の拠点がありません</span>}
                  </div>
                )}
              </Fld>
            )}
          </div></div></div>
          {targets.map((t) => (
            <div className="card nf-br" key={t.id}>
              <h2>{isCorp ? '法人情報の変更' : `${t.name}のご希望の内容`}<span className="sub">{!isCorp && t.ch ? `いまのプラン：${t.ch.plan}` : '法人1件として承認します'}</span>
                {targets.length > 1 && f.vals[targets[0].id] && t.id !== targets[0].id && (
                  <span className="r"><Btn variant="outline" size="sm" onClick={() => { setF({ ...f, vals: { ...f.vals, [t.id]: { ...f.vals[targets[0].id] } } }); setDirty(true); }}>{targets[0].name} と同じ内容を入れる</Btn></span>
                )}
              </h2>
              <div className="pad"><div className="frow">{fieldsOf(t.id, t.ch).map((x) => renderField(t.id, x, t.loans))}</div></div>
            </div>
          ))}
        </div>
      </div>
      {leave && <DiscardModal onCancel={() => setLeave(false)} onOk={() => { setLeave(false); setDirty(false); toList(); }} />}
    </div>
  );
}
