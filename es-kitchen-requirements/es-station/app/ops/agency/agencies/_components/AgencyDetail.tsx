'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { payTotals, planPayTxt, refPlan, validateAgency, ymJa, type Errs } from '@/lib/ops/general/logic';
import type { AgencyRow, Contact } from '@/lib/ops/general/types';
import { api, HistTable, Loading, Sec, useDirty } from '@/app/ops/_general/parts';
import { Icon } from '@/app/ops/_ui/Icon';
import { useOps } from '@/app/ops/_ui/OpsProvider';
import { useCanAct, useScreenCan } from '@/app/ops/_ui/perm';
import { Badge, Field, PageHead, yen } from '@/app/ops/_ui/ui';
import { agencyOf, contractOf, corpName, EditBtns, PlanBlock, R, useRefData, ViewBtns } from '../../_components/common';
import { useDeleteRef } from '../../_components/useDeleteRef';
import { fmtDate } from '@/lib/format/date';

const PREFS = ['東京都', '神奈川県', '大阪府', '京都府', '愛知県', '兵庫県', '福岡県', '北海道', '宮城県', '広島県'];
const blank = (): AgencyRow => ({ id: '', name: '', kana: '', plan: '', status: '有効', tel: '', fax: '', zip: '', pref: '', city: '', addr: '', bldg: '', note: '', contacts: [{ kind: 'メイン担当者', name: '', kana: '', email: '', tel: '' }], history: [] });
/** 詳細のタブ（元の S.tab.agency） */
let TAB = 0;

/** 代理店の登録・詳細・編集（元：renderAgencyDetail・agencyForm・saveAgency） */
export default function AgencyDetail({ mode, id }: { mode: 'new' | 'view' | 'edit'; id?: string }) {
  const router = useRouter();
  const { toast, toastError } = useOps();
  const canAct = useCanAct();
  const screenCan = useScreenCan();
  const d = useRefData();
  const dirty = useDirty(mode !== 'view');
  const del = useDeleteRef('agency');
  const [a, setA] = useState<AgencyRow | null>(mode === 'new' ? blank() : null);
  const [e, setE] = useState<Errs>({});
  const [tab, setTab] = useState(TAB);
  const base = d && id ? agencyOf(d, id) : undefined;
  useEffect(() => { if (d && id && !a && base) setA(structuredClone(base)); }, [d, id, a, base]);
  useEffect(() => { if (d && id && !base) router.replace(R.agency); }, [d, id, base, router]);
  if (!d || !a) return <Loading />;

  const isNew = mode === 'new', dis = mode === 'view';
  const up = (patch: Partial<AgencyRow>) => { dirty.mark(); setA({ ...a, ...patch }); };
  const upC = (i: number, patch: Partial<Contact>) => up({ contacts: a.contacts.map((c, j) => (j === i ? { ...c, ...patch } : c)) });
  const crumb = isNew ? '代理店登録' : mode === 'edit' ? '代理店情報編集' : '代理店情報詳細';
  const title = isNew ? '代理店登録' : `${crumb} ${a.id}`;

  const save = async () => {
    const err = validateAgency(a);
    setE(err);
    if (Object.keys(err).length) { toast('入力内容を確認してください（赤枠の項目）'); return; }
    try {
      const r = await api.action('saveAgency', { mode: isNew ? 'new' : 'edit', agency: a });
      dirty.clear();
      toast(isNew ? `代理店「${a.name}」を登録しました` : '代理店情報を保存しました');
      router.push(`${R.agency}/${r.id}`);
    } catch (x) { toastError(x); }
  };
  const leave = () => dirty.guard(() => router.push(isNew ? R.agency : `${R.agency}/${id}`));

  const inp = (k: keyof AgencyRow, ph: string, o: { type?: string; noErr?: boolean } = {}) => (
    <input className={`inp${!o.noErr && e[k] ? ' err' : ''}`} id={`f-${k}`} type={o.type ?? 'text'} value={String(a[k] ?? '')} placeholder={ph} disabled={dis} onChange={(x) => up({ [k]: x.target.value } as Partial<AgencyRow>)} />
  );
  const err = (k: string) => (typeof e[k] === 'string' ? (e[k] as string) : undefined);
  const req = <span style={{ color: 'var(--ng)' }}>*</span>;

  const info = (
    <div className="fg">
      <Field label="代理店ID" htmlFor="f-id"><input className="inp" id="f-id" disabled value={a.id} placeholder="代理店ID" /></Field>
      <Field label="代理店名" req htmlFor="f-name" err={err('name')}>{inp('name', '代理店名')}</Field>
      <Field label="代理店名カナ" req htmlFor="f-kana" err={err('kana')}>{inp('kana', '代理店名カナ')}</Field>
      <Field label="ステータス" req htmlFor="f-status">
        <select className="sel" id="f-status" disabled={dis} value={a.status} onChange={(x) => up({ status: x.target.value })}>{['有効', '無効'].map((o) => <option key={o}>{o}</option>)}</select>
      </Field>
      <Field label="電話番号" req htmlFor="f-tel" err={err('tel')}>{inp('tel', '000-0000-0000', { type: 'tel' })}</Field>
      <Field label="FAX番号" htmlFor="f-fax">{inp('fax', '00-0000-0000', { type: 'tel', noErr: true })}</Field>
      <Field label="郵便番号" req htmlFor="f-zip" err={err('zip')}>{inp('zip', '000-0000')}</Field>
      <Field label="都道府県" req htmlFor="f-pref" err={err('pref')}>
        <select className={`sel${e.pref ? ' err' : ''}`} id="f-pref" disabled={dis} value={a.pref} onChange={(x) => up({ pref: x.target.value })}>
          <option value="">都道府県</option>{PREFS.map((o) => <option key={o}>{o}</option>)}
        </select>
      </Field>
      <Field label="市区町村" req htmlFor="f-city" err={err('city')}>{inp('city', '市区町村')}</Field>
      <Field label="町域・番地" req htmlFor="f-addr" err={err('addr')}>{inp('addr', '町域・番地')}</Field>
      <Field label="建物・部屋番号" className="span2" htmlFor="f-bldg">{inp('bldg', '建物・部屋番号', { noErr: true })}</Field>
      <Field label="備考" className="full" htmlFor="f-note">{inp('note', '備考項目', { noErr: true })}</Field>
    </div>
  );
  const contacts = (
    <>
      <div className="tbl-wrap">
        <table className="tbl">
          <thead><tr><th>区分{!dis && <span className="req" style={{ color: 'var(--ng)' }}>*</span>}</th><th>担当者名{!dis && req}</th><th>フリガナ</th><th>メールアドレス{!dis && req}</th><th>電話番号</th>{!dis && <th className="act">操作</th>}</tr></thead>
          <tbody>
            {a.contacts.map((c, i) => dis ? (
              <tr key={i}><td>{c.kind}</td><td>{c.name}</td><td>{c.kana}</td><td>{c.email}</td><td>{c.tel}</td></tr>
            ) : (
              <tr key={i}>
                <td><select className={`sel${e['ck' + i] ? ' err' : ''}`} value={c.kind} onChange={(x) => upC(i, { kind: x.target.value })}><option value="" />{['メイン担当者', 'サブ担当者', '経理担当者'].map((o) => <option key={o}>{o}</option>)}</select></td>
                <td><input className={`inp${e['cn' + i] ? ' err' : ''}`} value={c.name} onChange={(x) => upC(i, { name: x.target.value })} /></td>
                <td><input className="inp" value={c.kana} onChange={(x) => upC(i, { kana: x.target.value })} /></td>
                <td><input className={`inp${e['cm' + i] ? ' err' : ''}`} type="email" value={c.email} onChange={(x) => upC(i, { email: x.target.value })} /></td>
                <td><input className="inp" type="tel" value={c.tel} onChange={(x) => upC(i, { tel: x.target.value })} /></td>
                <td className="act"><button className="d" aria-label="行を削除" onClick={() => up({ contacts: a.contacts.filter((_, j) => j !== i) })}><Icon name="trash" /></button></td>
              </tr>
            ))}
            {!a.contacts.length && <tr><td colSpan={6} className="empty">担当者が登録されていません</td></tr>}
          </tbody>
        </table>
      </div>
      {!dis && (
        <div style={{ marginTop: '0.857143rem' }}>
          <button className="btn out sm" onClick={() => up({ contacts: [...a.contacts, { kind: 'サブ担当者', name: '', kana: '', email: '', tel: '' }] })}>行を追加</button>
          {e.contacts && <span className="emsg" style={{ marginLeft: '0.857143rem', color: 'var(--ng)', fontSize: '0.857143rem' }}>{e.contacts}</span>}
        </div>
      )}
    </>
  );

  let tabs = null;
  if (!isNew) {
    const refs = d.referrals.filter((r) => r.srcType === '代理店' && r.src === a.id);
    const pays = d.payments.filter((p) => p.type === '代理店' && p.target === a.id);
    let body;
    if (tab === 0) {
      body = (
        <div className="tbl-wrap"><table className="tbl">
          <thead><tr><th>No</th><th>紹介ID</th><th>親契約番号</th><th>法人名</th><th>拠点名</th><th>紹介フィープラン</th><th>支払区分</th><th>ステータス</th><th>算定方式</th><th>開始月</th><th>終了予定月</th><th>終了月</th></tr></thead>
          <tbody>
            {refs.map((r, i) => { const c = contractOf(d, r.contract), p = refPlan(r, d.plans); return (
              <tr key={r.id}><td>{i + 1}</td><td><Link className="lnk u mono" href={`${R.referral}/${r.id}`}>{r.id}</Link></td><td className="mono">{c.id}</td><td>{corpName(d, c)}</td><td>{c.branch}</td><td>{p.name}</td><td>{planPayTxt(p)}</td><td><Badge v={r.status} /></td><td>{p.calc}</td><td>{ymJa(r.start)}</td><td>{ymJa(r.endPlan)}</td><td>{ymJa(r.end)}</td></tr>
            ); })}
            {!refs.length && <tr><td colSpan={12} className="empty">この代理店からの紹介はまだありません。法人・契約管理 ＞ 拠点（親契約）で代理店コードを設定すると表示されます</td></tr>}
          </tbody>
        </table></div>
      );
    } else if (tab === 1) {
      body = (
        <div className="tbl-wrap"><table className="tbl">
          <thead><tr><th>No</th><th>支払対象月</th><th>支払いID</th><th className="num">対象件数</th><th className="num">支払合計額（税込）</th><th>支払状況</th><th>支払日</th></tr></thead>
          <tbody>
            {pays.map((p, i) => <tr key={p.id}><td>{i + 1}</td><td>{ymJa(p.month)}</td><td><Link className="lnk" href={`${R.payment}/${p.id}`}>{p.id}</Link></td><td className="num">{p.lines.length}</td><td className="num">{yen(payTotals(p).total)}</td><td><Badge v={p.status} /></td><td>{fmtDate(p.date)}</td></tr>)}
            {!pays.length && <tr><td colSpan={7} className="empty">支払履歴はまだありません</td></tr>}
          </tbody>
        </table></div>
      );
    } else body = <HistTable h={a.history} />;
    tabs = (
      <div className="card">
        <div className="tabs">{['紹介履歴', '支払履歴', '変更履歴'].map((n, i) => <button key={n} className={i === tab ? 'on' : ''} onClick={() => { TAB = i; setTab(i); }}>{n}</button>)}</div>
        {body}
      </div>
    );
  }

  return (
    <>
      <PageHead crumbs={['代理・紹介管理', '代理店マスタ', crumb]} title={title}>
        {dis ? <ViewBtns onDel={canAct(api, 'deleteRef', { kind: 'agency' }) ? () => del(a.id, d) : undefined} onEdit={screenCan('update') ? () => router.push(`${R.agency}/${id}/edit`) : undefined} /> : <EditBtns isNew={isNew} onCancel={leave} onSave={save} />}
      </PageHead>
      <div className="card">
        <Sec title="代理店情報">{info}</Sec>
        <Sec title="紹介フィープラン"><PlanBlock d={d} planId={a.plan} dis={dis} err={err('plan')} src="代理店" onPick={(plan) => up({ plan })} /></Sec>
        <Sec title="担当者">{contacts}</Sec>
      </div>
      {tabs}
    </>
  );
}
