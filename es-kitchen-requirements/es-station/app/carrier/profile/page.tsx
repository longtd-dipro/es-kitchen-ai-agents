'use client';

import { useState } from 'react';
import carrier from '@/lib/carrier/area';
import { PREFS } from '@/lib/carrier/seed';
import type { Cooler, Profile } from '@/lib/carrier/types';
import { areaApi, useQuery } from '@/lib/ops/core/client';
import { OpsLeaveGuard } from '@/lib/ui/leaveGuard';
import { Icon } from '../_ui/Icon';
import { useCarrierSignedIn } from '../_ui/CarrierProvider';
import { Collap, Crumb, Loading, ZipButton } from '../_ui/parts';
import { fmtDate, fmtDateTime } from '@/lib/format/date';

const DAYS = ['月', '火', '水', '木', '金', '土', '日', '祝日'];

/** STEP4（2026/10/01）：保冷バッグ・保冷剤（運営の「保冷バッグ台帳」の参照。回収なし・返却なし） */
function CoolerCollap({ rows }: { rows: Cooler[] }) {
  const n = rows.filter((r) => r.kind === '保冷バッグ' && r.status === '貸与中').reduce((a, r) => a + r.qty, 0);
  return (
    <Collap title="保冷バッグ・保冷剤（ESキッチンから貸与）">
      <p className="hint" style={{ margin: '0 0 0.571429rem' }}>ESキッチンからお渡ししている保冷バッグ・保冷剤です（参照のみ・貸与中の保冷バッグ {n}個）。回収はしません。紛失・破損・追加が必要なときは運営へご連絡ください。</p>
      <div className="tbl-wrap">
        <table className="tbl">
          <thead><tr><th>番号</th><th>種類</th><th>数</th><th>渡した配送スタッフ</th><th>渡した日</th><th>状態</th><th>メモ</th></tr></thead>
          <tbody>{rows.map((r) => <tr key={r.no}><td className="num">{r.no}</td><td>{r.kind}</td><td className="num">{r.qty}</td><td>{r.staff}</td><td className="num">{fmtDate(r.date)}</td><td>{r.status}</td><td>{r.memo || '—'}</td></tr>)}</tbody>
        </table>
      </div>
    </Collap>
  );
}

/** プロフィール（元の profile()・OW_ANNO_001-6/8）：基本情報・配送対応情報。変更は運営の承認後に反映 */
export default function CarrierProfile() {
  const { company, toast, toastError } = useCarrierSignedIn();
  const api = areaApi(carrier);
  const { data } = useQuery(api, 'profile', { company });
  const [tab, setTab] = useState<'basic' | 'area'>('basic');
  const [draft, setDraft] = useState<Profile | null>(null);
  const crumb = <Crumb items={[['ホーム', '/carrier'], 'プロフィール']} />;
  if (!data) return <>{crumb}<h1 className="ptitle">プロフィール</h1><Loading /></>;
  const e = !!draft;
  const p = draft ?? data.profile;
  const pend = data.pending;
  const set = (x: Partial<Profile>) => draft && setDraft({ ...draft, ...x });
  const f = (l: string, k: keyof Profile, req?: boolean) => (
    <div className="fld"><span className="lb">{l}{req && <span className="req">*</span>}</span><input className="inp" readOnly={!e} value={String(p[k] ?? '')} aria-label={l} onChange={(ev) => set({ [k]: ev.target.value })} /></div>
  );
  const ro = (l: string, v: string) => <div className="fld"><span className="lb">{l}</span><input className="inp" readOnly value={v} aria-label={l} /></div>;
  const chips = (xs: string[]) => xs.map((a) => <span key={a} className="badge" style={{ background: 'var(--line-2)', color: 'var(--text-2)' }}>{a}</span>);
  const radio = (l: string, k: 'frz' | 'ref' | 'sp', o: string[]) => (
    <div className="fld" key={k}>
      <span className="lb">{l}<span className="req">*</span></span>
      <div className="radios">{o.map((x) => <label key={x}><input type="radio" name={`p_${k}`} checked={p[k] === x} disabled={!e} onChange={() => set({ [k]: x })} />{x}</label>)}</div>
    </div>
  );

  const save = async () => {
    try {
      await api.action('requestProfile', { company, draft: draft ?? {} });
      setDraft(null);
      toast('変更を申請しました（運営の承認後に反映）');
    } catch (x) {
      toastError(x);
    }
  };
  const withdraw = async () => {
    try {
      await api.action('withdrawProfile', { company });
      toast('申請を取り下げました');
    } catch (x) {
      toastError(x);
    }
  };

  const body = tab === 'basic' ? (
    <>
      <Collap title="基本情報">
        <div className="grid3">
          {ro('委託配送先ID', company)}{f('委託配送先名', 'name', true)}{f('カナ', 'kana')}{ro('種別', p.kind)}
          <div style={{ display: 'flex', gap: '0.857143rem', alignItems: 'flex-end', minWidth: 0 }}><div style={{ flex: 1, minWidth: 0 }}>{f('郵便番号', 'zip', true)}</div>{e && <ZipButton />}</div>
          <div className="fld">
            <span className="lb">都道府県<span className="req">*</span></span>
            <select className="inp" disabled={!e} aria-label="都道府県" value={p.pref} onChange={(ev) => set({ pref: ev.target.value })}>{!p.pref && <option value="" />}{PREFS.map((x) => <option key={x}>{x}</option>)}</select>
          </div>
          {f('市区町村', 'city', true)}{f('町域・番地', 'addr', true)}{f('建物・部屋番号', 'bld')}{f('電話番号', 'tel', true)}{f('FAX番号', 'fax')}
        </div>
      </Collap>
      <Collap title="担当者">
        <div className="tbl-wrap">
          <table className="tbl">
            <thead><tr><th>区分 <span className="req">*</span></th><th>担当者名 <span className="req">*</span></th><th>フリガナ</th><th>メールアドレス <span className="req">*</span></th><th>電話番号</th></tr></thead>
            <tbody>{p.contacts.map((c, i) => <tr key={i}><td>{c.k}</td><td>{c.n}</td><td>{c.f}</td><td>{c.m}</td><td>{c.t}</td></tr>)}</tbody>
          </table>
        </div>
      </Collap>
    </>
  ) : (
    <>
      <Collap title="対応エリア">
        <div className="fld">
          <span className="lb">対応エリア<span className="req">*</span></span>
          <div className="inp ro" style={{ flexWrap: 'wrap', gap: '0.285714rem' }}>{chips(p.areas)}</div>
          <span className="hint">運営の委託配送先マスタの対応エリア「{p.masterArea}」と同じ内容です。</span>
        </div>
        <div className="fld">
          <span className="lb">配送不可曜日</span>
          <div className="checks">{DAYS.map((d) => <label key={d}><input type="checkbox" disabled={!e} checked={p.ngDays.includes(d)} onChange={(ev) => set({ ngDays: ev.target.checked ? [...p.ngDays, d] : p.ngDays.filter((x) => x !== d) })} />{d}</label>)}</div>
        </div>
        <div className="fld"><span className="lb">対応エリアに関する備考</span><textarea className="inp" readOnly={!e} aria-label="対応エリアに関する備考" value={p.areaNote} onChange={(ev) => set({ areaNote: ev.target.value })} /></div>
      </Collap>
      <Collap title="車両・設備情報">
        <div className="grid2">
          <div className="fld"><span className="lb">保有車両<span className="req">*</span></span><div className="inp ro" style={{ gap: '0.285714rem', flexWrap: 'wrap' }}>{chips(p.cars)}</div></div>
          <span />
          {radio('冷凍ボックスのレンタル希望', 'frz', ['不要', '要'])}
          {radio('冷蔵ボックスのレンタル希望', 'ref', ['不要', '要'])}
          {radio('冷蔵保管スペース', 'sp', ['あり', 'なし'])}
          <div className="fld"><span className="lb">車両・設備情報に関する備考</span><textarea className="inp" readOnly={!e} aria-label="車両・設備情報に関する備考" value={p.carNote} onChange={(ev) => set({ carNote: ev.target.value })} /></div>
        </div>
      </Collap>
      <CoolerCollap rows={data.coolers} />
    </>
  );

  return (
    <>
      <OpsLeaveGuard dirty={!!draft && JSON.stringify(draft) !== JSON.stringify(data.profile)} />
      {crumb}
      <div className="phead">
        <h1 className="ptitle">プロフィール</h1>
        {e ? (
          <div style={{ display: 'flex', gap: '0.857143rem' }}><button type="button" className="btn" onClick={() => setDraft(null)}>キャンセル</button><button type="button" className="btn pri" onClick={save}>変更を申請</button></div>
        ) : (
          <button type="button" className="btn pri" style={{ minHeight: '3.142857rem' }} disabled={!!pend} title={pend ? '承認待ちの申請があります' : undefined} onClick={() => setDraft(structuredClone(data.profile))}><Icon name="pen" />編集</button>
        )}
      </div>
      {pend ? (
        <div className="alert info"><Icon name="clip" /><span><b>運営の承認待ちの変更申請があります</b>（申請日時 {fmtDateTime(pend.at)}）。承認されるまで、表示は現在の登録内容のままです。</span><button type="button" className="linkbtn" onClick={withdraw}>申請を取り下げる</button></div>
      ) : e && <div className="alert info"><Icon name="clip" /><span>変更内容は運営が確認・承認してから反映されます。</span></div>}
      <div className="panel">
        <div className="tabs" role="tablist">
          <button type="button" className={tab === 'basic' ? 'on' : ''} onClick={() => setTab('basic')}>基本情報</button>
          <button type="button" className={tab === 'area' ? 'on' : ''} onClick={() => setTab('area')}>配送対応情報</button>
        </div>
        {body}
      </div>
    </>
  );
}
