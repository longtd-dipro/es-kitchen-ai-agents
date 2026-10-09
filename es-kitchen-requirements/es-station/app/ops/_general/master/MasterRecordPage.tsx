'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import { ApiError, isStale } from '@/lib/api/errors';
import { useQuery } from '@/lib/ops/core/client';
import { fmtDateTime } from '@/lib/format/date';
import {
  DRIVER_NO_LICENSE_NOTE, MSG, NEW_VALS, normalizeForm, SECS, shownFields, TABLES, validateForm, ZIP_DEMO,
  type FDef, type FormVals, type FRow, type MKey, type Opt,
} from '@/lib/ops/general/masterForms';
import { api, Loading } from '../parts';
import { LEAVE_MSG, useLeaveGuard } from '../../_ui/leaveGuard';
import { useOps } from '../../_ui/OpsProvider';
import { useCanAct } from '../../_ui/perm';
import { Badge, ConfirmModal, Field, Notice, PageHead } from '../../_ui/ui';
import { detailUrl, MASTER_UI } from './config';
import { ChipList, ChipPicker, EsFeesTab, HistTab, KvGrid, LicenseInput, PasswordButton, PrefPicker, RowsEdit, RowsView } from './parts';
import { useMasterDelete } from './useMasterDelete';

/*
 * 運営Web マスタ（仕入先・委託配送先・倉庫・配送スタッフ）の 詳細（表示だけ）・登録・編集（AW_SUPP_005/006・AW_CNSG_003/004・AW_WRHS_003/004・AW_DRVR_003/004）。
 *   詳細：ヘッダーに「削除」「パスワード送信」（仕入先・委託配送先・配送スタッフ）「編集」（権限のある役割だけ。削除済には出さない）。
 *     タブ「基本情報」「変更履歴」（委託配送先は「ES配送費」も。タブは URL の ?tab= に持つ：P-TAB）。基本情報はカード（基本情報・住所・担当者…）
 *   登録・編集：「キャンセル」「登録」（編集は「保存」）。タブは置かない。保存で全部まとめてチェック（項目の下に文言・赤枠、見出しの下に「保存できません（n件）」＝P-FORMBOX）。
 *     成功は S01「保存しました。」→ 詳細（新規は採番した ID）。入力を変えて離れるときは Q02。ほかの人が先に保存していたら E31（上書きして保存）
 * 項目・チェックは lib/ops/general/masterForms.ts（サーバーと同じ）。保存・削除・変更履歴・パスワード送信は lib/ops/general/masterRecs.ts
 */
type Mode = 'detail' | 'edit' | 'new';
const S01 = '保存しました。';
type Tab = 'basic' | 'fees' | 'hist';
const TAB_LABEL: Record<Tab, string> = { basic: '基本情報', fees: 'ES配送費', hist: '変更履歴' };

const asList = (x: FormVals[string] | undefined) => (Array.isArray(x) ? (x as unknown[]).filter((y): y is string => typeof y === 'string') : []);
const asStr = (x: FormVals[string] | undefined) => (typeof x === 'string' ? x : '');
const asRows = (x: FormVals[string] | undefined) => (Array.isArray(x) ? (x as unknown[]).filter((y): y is FRow => !!y && typeof y === 'object') : []);
const H3 = ({ children }: { children: ReactNode }) => <h3 style={{ margin: '0 0 0.857143rem', fontSize: '1.142857rem' }}>{children}</h3>;
/** 仕入先の詳細の「申込の内容」に出す項目（AW_SUPP_005 の 6） */
const SUPPLIER_APPLY = ['受付番号', '申込日時', '代表者', '許可・認証', '取扱・得意分野', '申込時のメモ'];

export function MasterRecordPage({ mkey, id, mode, actions }: {
  mkey: MKey;
  id?: string;
  mode: Mode;
  /** 詳細のヘッダーに足すボタン（「この配送先の契約を一括変更」など）。rec＝読み込んだ値 */
  actions?: (rec: { id: string; name: string; status: string; form: FormVals }) => ReactNode;
}) {
  const ui = MASTER_UI[mkey];
  const router = useRouter();
  const { toast, toastError, openModal } = useOps();
  const canAct = useCanAct();
  const del = useMasterDelete(mkey);
  const { data: rec, loading } = useQuery(api, 'genRec', { key: mkey, id: id ?? '' });
  const { data: newOpts } = useQuery(api, 'genFormOpts', { key: mkey });

  const [vals, setVals] = useState<FormVals | null>(mode === 'new' ? structuredClone(NEW_VALS[mkey]) : null);
  const [init, setInit] = useState<string>(mode === 'new' ? JSON.stringify(NEW_VALS[mkey]) : '');
  const [ver, setVer] = useState<string | undefined>(undefined);
  const [errs, setErrs] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [from, setFrom] = useState<string | null>(null);
  const tabs: Tab[] = mkey === 'consign' ? ['basic', 'fees', 'hist'] : ['basic', 'hist'];
  const [tab, setTabState] = useState<Tab>('basic');
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    setFrom(q.get('from'));
    const t = q.get('tab') as Tab | null;
    if (t && tabs.includes(t)) setTabState(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  /* タブは URL（?tab=）に持つ（P-TAB：再読み込み・戻るでも同じタブ） */
  const setTab = (t: Tab) => {
    setTabState(t);
    const u = new URL(window.location.href);
    if (t === 'basic') u.searchParams.delete('tab'); else u.searchParams.set('tab', t);
    window.history.replaceState(window.history.state, '', u.toString());
  };
  /* 編集：読み込んだ値をフォームに（入力を始めたら読み直さない） */
  useEffect(() => {
    if (mode !== 'edit' || !rec || vals) return;
    setVals(structuredClone(rec.form)); setInit(JSON.stringify(rec.form)); setVer(rec.version);
  }, [mode, rec, vals]);

  const editing = mode !== 'detail';
  const dirty = editing && !saved && !!vals && JSON.stringify(vals) !== init;
  useLeaveGuard(dirty);
  const opts: Record<string, Opt[]> = (mode === 'new' ? newOpts : rec?.opts) ?? {};

  const listUrl = ui.base;
  const backUrl = mode === 'edit' && from !== 'list' && id ? detailUrl(mkey, id) : listUrl;
  const title = mode === 'new' ? `${ui.noun}の登録` : mode === 'edit' ? `${ui.noun}の編集` : `${ui.noun}詳細 ${id ?? ''}`;
  const errCount = Object.keys(errs).length;
  /* 配送スタッフ：免許証の写真がなく、アカウントもないときは「免許未登録」（台帳 K・hong 2026-10-06） */
  const noAccount = mode === 'new' || ['未発行', '削除済'].includes(rec?.account ?? '');
  const noLicense = mkey === 'driver' && !!vals && !asStr(vals.license) && noAccount;

  const set = (k: string, v: FormVals[string]) => setVals((cur) => {
    const next: FormVals = { ...(cur ?? {}), [k]: v };
    if (mkey === 'driver' && k === 'license') {
      if (!v && noAccount) next.status = '免許未登録';
      else if (v && cur?.status === '免許未登録' && noAccount) next.status = '有効';
    }
    /* 倉庫：中継倉庫でなくなったら中継倉庫区分を外す */
    if (mkey === 'warehouse' && k === 'kind' && v !== '中継倉庫') next.relayKind = '';
    return next;
  });
  useEffect(() => {
    if (noLicense && vals?.status !== '免許未登録') setVals((c) => (c ? { ...c, status: '免許未登録' } : c));
  }, [noLicense, vals?.status]);

  /* ---------- 住所検索（郵便番号 → 都道府県・市区町村・町域・番地。見本の表。本番は郵便番号の API） ---------- */
  const zipSearch = () => {
    const key = asStr(vals?.zip).replace(/[^0-9０-９]/g, '').replace(/[０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0));
    if (!/^\d{7}$/.test(key)) { setErrs((e) => ({ ...e, zip: MSG.E05 })); return; }
    const hit = ZIP_DEMO[key];
    if (!hit) { toast(MSG.ZIP_NONE); return; }
    setVals((c) => ({ ...(c ?? {}), ...hit }));
    setErrs((e) => { const n = { ...e }; ['zip', 'pref', 'city', 'addr1'].forEach((k) => delete n[k]); return n; });
    toast('住所を入力しました（番地・建物・部屋番号は手で入れてください）');
  };

  /* ---------- 保存 ---------- */
  const doSave = async (form: FormVals, force = false) => {
    setBusy(true);
    try {
      const out = await api.action('saveGen', { key: mkey, ...(mode === 'edit' && id ? { id } : {}), form, ...(mode === 'edit' ? { baseVersion: ver } : {}), ...(force ? { force: true } : {}) });
      setSaved(true);
      toast(S01);
      router.push(detailUrl(mkey, out.id));
    } catch (e) {
      if (isStale(e)) {
        /* E31：ほかの人が先に保存していた（「キャンセル」「上書きして保存」） */
        openModal(<ConfirmModal kind="warn" title="内容が更新されています" text="他のユーザーにより内容が更新されています。上書きすると保存されます。" ok="上書きして保存" okCls="warn-solid" onOk={() => doSave(form, true)} />);
      } else if (e instanceof ApiError && e.message === MSG.E09('メールアドレス')) {
        setErrs({ email: e.message });
      } else toastError(e);
    } finally { setBusy(false); }
  };
  const save = () => {
    if (!vals || busy) return;
    const form = normalizeForm(mkey, vals);
    setVals(form);
    const e = validateForm(mkey, form, mode === 'new' ? 'new' : 'edit');
    setErrs(e);
    if (Object.keys(e).length) {
      /* 最初のエラーの項目へ */
      const first = Object.keys(e)[0];
      setTimeout(() => document.getElementById(`${mkey}-${first}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 0);
      return;
    }
    void doSave(form);
  };
  const cancel = () => {
    const go = () => router.push(backUrl);
    if (!dirty) { go(); return; }
    openModal(<ConfirmModal kind="warn" title={LEAVE_MSG.title} text={LEAVE_MSG.text} ok={LEAVE_MSG.ok} okCls="warn-solid" cancel={LEAVE_MSG.cancel} onOk={go} />);
  };

  /* ---------- 表示（詳細） ---------- */
  const showOf = (f: FDef, v: FormVals): ReactNode => {
    const x = v[f.k];
    if (f.off?.(v)) return '—';
    if (f.t === 'chips' || f.t === 'prefs') return <ChipList xs={asList(x)} />;
    if (f.t === 'license') return asStr(x) ? <img src={asStr(x)} alt="免許証の写真" className="mr-lic" /> : <span>なし（免許未登録）</span>;
    if (Array.isArray(x)) return asList(x).length ? asList(x).join('・') : '—';
    if (f.k === 'status') return <span><Badge v={rec?.status === '削除済' ? '削除済' : asStr(x) || '未発行'} /></span>;
    if (f.k === 'carrierId') return rec?.labels?.carrierId || (opts.carrierId ?? []).find((o) => o.v === x)?.l || asStr(x) || '—';
    if (f.k === 'lastLogin') return x ? fmtDateTime(asStr(x)) : '—';
    return asStr(x) || '—';
  };

  if (mode !== 'new' && !loading && !rec) {
    return <div className="card"><p>{ui.noun}が見つかりません（{id}）</p><Link className="btn" href={listUrl}>一覧へ戻る</Link></div>;
  }
  if (mode !== 'new' && !rec) return <Loading />;
  if (editing && !vals) return <Loading />;

  const crumbs = [...ui.crumbs, mode === 'new' ? `${ui.noun}の登録` : mode === 'edit' ? `${ui.noun}の編集` : `${ui.noun}詳細`];
  /* 編集・削除の権限（API と同じ表）。削除済には出さない。仕入先の申込中・却下は申込の確認で処理する（編集は出さない。CSV取込と同じ） */
  const applying = mkey === 'supplier' && ['申込中', '却下'].includes(rec?.status ?? '');
  const canEdit = !!rec && !rec.deleted && !applying && canAct(api, 'saveGen', { key: mkey, id: id ?? '', form: {} });
  const canDel = !!rec && !rec.deleted && canAct(api, 'deleteRow', { key: ui.genKey, uid: id ?? '' });
  const canPw = !!rec?.password && !rec.deleted && canAct(api, 'genSendPassword', { key: mkey, id: id ?? '' });

  /* ---------- 詳細（表示だけ） ---------- */
  if (mode === 'detail' && rec) {
    const v = rec.form;
    const card = (sec: string) => {
      const fs = shownFields(mkey, v).filter((f) => f.sec === sec);
      const ts = TABLES[mkey].filter((t) => t.sec === sec);
      return (
        <div className="card" key={sec}>
          <H3>{sec}</H3>
          {fs.length > 0 && (
            <div className="fg c2">
              {sec === '基本情報' && <Field label={`${ui.noun}ID`}><span className="mono">{rec.id}</span></Field>}
              {fs.map((f) => (
                <Field key={f.k} label={f.label} className={f.full || f.t === 'license' ? 'full' : ''}>
                  <span style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{showOf(f, v)}</span>
                </Field>
              ))}
              {/* 委託配送先：保冷バッグ（貸与中の数）は基本情報の最後（AW_CNSG_003 の 3） */}
              {sec === '基本情報' && mkey === 'consign' && rec.extra.map(([l, x]) => <Field key={l} label={l}><span>{x || '—'}</span></Field>)}
              {sec === '担当者' && mkey === 'driver' && rec.password && (
                <Field label="パスワード">
                  <span>{canPw ? <PasswordButton mkey={mkey} id={rec.id} to={rec.password.to} ok={rec.password.ok} className="btn out" /> : '—'}</span>
                </Field>
              )}
            </div>
          )}
          {ts.map((t) => <RowsView key={t.k} t={t} rows={asRows(v[t.k])} />)}
        </div>
      );
    };
    const apply = mkey === 'supplier' ? rec.extra.filter(([l]) => SUPPLIER_APPLY.includes(l)) : [];
    return (
      <>
        <PageHead crumbs={crumbs} title={title}>
          {!rec.deleted && actions?.({ id: rec.id, name: rec.name, status: rec.status, form: v })}
          {canDel && <button className="btn dan-solid lg" onClick={() => del(rec.id, () => router.push(listUrl))}>削除</button>}
          {canPw && <PasswordButton mkey={mkey} id={rec.id} to={rec.password!.to} ok={rec.password!.ok} />}
          {canEdit && <Link className="btn pri lg" href={`${detailUrl(mkey, rec.id)}/edit`}>編集</Link>}
        </PageHead>
        {rec.deleted && <Notice kind="ng" style={{ marginBottom: '0.857143rem' }}>この{ui.noun}は削除済です（編集・削除はできません）。</Notice>}
        <div className="tabs" role="tablist">
          {tabs.map((t) => <button key={t} role="tab" aria-selected={tab === t} className={tab === t ? 'on' : ''} onClick={() => setTab(t)}>{TAB_LABEL[t]}</button>)}
        </div>
        {tab === 'basic' && (
          <>
            {SECS[mkey].map(card)}
            {apply.length > 0 && <div className="card"><H3>申込の内容</H3><KvGrid items={apply} /></div>}
            {mkey !== 'warehouse' && (
              <div className="card">
                <H3>アカウントの状態</H3>
                <Field label="アカウントの状態" hint="「無効」「削除済」のアカウントはログインできません（状態は編集で変えます）"><span><Badge v={rec.account} /></span></Field>
              </div>
            )}
          </>
        )}
        {tab === 'fees' && <div className="card"><EsFeesTab id={rec.id} name={rec.name} /></div>}
        {tab === 'hist' && <div className="card"><HistTab mkey={mkey} id={rec.id} /></div>}
      </>
    );
  }

  /* ---------- 登録・編集 ---------- */
  const v = vals!;
  const input = (f: FDef) => {
    const bad = !!errs[f.k];
    const cls = (base: string) => `${base}${bad ? ' err' : ''}`;
    const fid = `${mkey}-${f.k}`;
    const off = !!f.off?.(v);
    /* 登録後は変えない項目（倉庫区分・所属先）・システムが決める項目（ステータスなど）・免許未登録 */
    if (f.t === 'ro') {
      if (f.k === 'loginId') return <input id={fid} className="inp" disabled value={mode === 'new' ? '' : rec?.id ?? ''} placeholder="登録すると配送スタッフIDと同じIDになります" aria-label={f.label} />;
      if (f.k === 'lastLogin') return <input id={fid} className="inp" disabled value={asStr(v.lastLogin) ? fmtDateTime(asStr(v.lastLogin)) : '—'} aria-label={f.label} />;
      return <span><Badge v={mode === 'new' ? '未発行' : rec?.status ?? ''} /></span>;
    }
    const locked = (f.newOnly && mode === 'edit') || (f.k === 'status' && noLicense);
    if (locked) {
      const shown = f.k === 'carrierId' ? (rec?.labels?.carrierId || asStr(v[f.k])) : asStr(v[f.k]);
      return <input id={fid} className="inp" disabled value={shown} aria-label={f.label} />;
    }
    if (f.t === 'checks') {
      const cur = asList(v[f.k]);
      return (
        <div id={fid} className="radios" role="group" aria-label={f.label}>
          {(f.opts ?? []).map((o) => (
            <label key={o}><input type="checkbox" checked={cur.includes(o)} onChange={(e) => set(f.k, e.target.checked ? (f.opts ?? []).filter((x) => x === o || cur.includes(x)) : cur.filter((x) => x !== o))} />{o}</label>
          ))}
        </div>
      );
    }
    if (f.t === 'radio') {
      return (
        <div id={fid} className={`radios${off ? ' mr-off' : ''}${bad ? ' mr-bad' : ''}`} role="radiogroup" aria-label={f.label}>
          {(f.opts ?? []).map((o) => (
            <label key={o}><input type="radio" name={fid} disabled={off} checked={asStr(v[f.k]) === o} onChange={() => set(f.k, o)} />{o}</label>
          ))}
        </div>
      );
    }
    if (f.t === 'chips') return <ChipPicker id={fid} opts={f.opts ?? []} value={asList(v[f.k])} onChange={(x) => set(f.k, x)} bad={bad} />;
    if (f.t === 'prefs') return <PrefPicker id={fid} value={asList(v[f.k])} onChange={(x) => set(f.k, x)} bad={bad} />;
    if (f.t === 'license') return <LicenseInput id={fid} value={asStr(v[f.k])} onChange={(x) => set(f.k, x)} bad={bad} />;
    if (f.t === 'select') {
      const os: Opt[] = f.opts ? f.opts.map((o) => ({ v: o, l: o })) : opts[f.k] ?? [];
      return (
        <select id={fid} className={cls('sel')} disabled={off} value={asStr(v[f.k])} onChange={(e) => set(f.k, e.target.value)}>
          <option value="">選択してください</option>
          {os.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}
        </select>
      );
    }
    if (f.t === 'textarea') return <textarea id={fid} className={cls('inp')} rows={3} placeholder={f.ex ? `例）${f.ex}` : undefined} value={asStr(v[f.k])} onChange={(e) => set(f.k, e.target.value)} />;
    if (f.fmt === 'yen') {
      return (
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.428571rem' }}>
          <input id={fid} className={cls('inp num')} inputMode="numeric" placeholder={f.ex ? `例）${f.ex}` : undefined} value={asStr(v[f.k])} onChange={(e) => set(f.k, e.target.value)} />円
        </span>
      );
    }
    const box = <input id={fid} className={cls('inp')} disabled={off} type={f.fmt === 'mail' ? 'email' : 'text'} inputMode={f.fmt === 'tel' || f.fmt === 'zip' ? 'tel' : undefined} placeholder={off ? '' : f.ex ? `例）${f.ex}` : undefined} value={off ? '' : asStr(v[f.k])} onChange={(e) => set(f.k, e.target.value)} />;
    if (f.zipSearch) return <span style={{ display: 'flex', gap: '0.571429rem' }}>{box}<button type="button" className="btn" style={{ whiteSpace: 'nowrap' }} onClick={zipSearch}>住所検索</button></span>;
    return box;
  };
  const formCard = (sec: string) => {
    const fs = shownFields(mkey, v).filter((f) => f.sec === sec);
    const ts = TABLES[mkey].filter((t) => t.sec === sec);
    return (
      <div className="card" key={sec}>
        <H3>{sec}</H3>
        {fs.length > 0 && (
          <div className="fg c2">
            {sec === '基本情報' && mode === 'edit' && rec && <Field label={`${ui.noun}ID`}><input className="inp" disabled value={rec.id} aria-label={`${ui.noun}ID`} /></Field>}
            {fs.map((f) => (
              <Field key={f.k} label={f.label} req={(f.req || !!f.reqIf?.(v)) && f.t !== 'ro' && !(f.newOnly && mode === 'edit') && !f.off?.(v)}
                htmlFor={['checks', 'radio', 'chips', 'prefs', 'license', 'ro'].includes(f.t) ? undefined : `${mkey}-${f.k}`} className={f.full || f.t === 'license' ? 'full' : ''}
                hint={f.k === 'status' && noLicense ? DRIVER_NO_LICENSE_NOTE : f.hint} err={errs[f.k]}>
                {input(f)}
              </Field>
            ))}
            {sec === '担当者' && mkey === 'driver' && (
              <Field label="パスワード" hint="登録前・無効・削除済のときは送れません">
                <span>{mode === 'edit' && rec?.password && canPw ? <PasswordButton mkey={mkey} id={rec.id} to={rec.password.to} ok={rec.password.ok} className="btn out" /> : <button type="button" className="btn out" disabled>パスワード送信</button>}</span>
              </Field>
            )}
          </div>
        )}
        {ts.map((t) => <RowsEdit key={t.k} mkey={mkey} t={t} rows={asRows(v[t.k])} errs={errs} onChange={(rows) => set(t.k, rows)} />)}
      </div>
    );
  };
  return (
    <>
      <PageHead crumbs={crumbs} title={title}>
        <button className="btn lg" onClick={cancel}>キャンセル</button>
        <button className="btn pri lg" disabled={busy} onClick={save}>{mode === 'new' ? '登録' : '保存'}</button>
      </PageHead>
      {errCount > 0 && <Notice kind="ng" style={{ marginBottom: '0.857143rem' }}><b>保存できません（{errCount}件）。</b>赤い項目を確認してください。</Notice>}
      {SECS[mkey].map(formCard)}
      {mode === 'edit' && rec && mkey !== 'warehouse' && (
        <div className="card">
          <div className="fg c2">
            <Field label="アカウントの状態" hint="表示だけ"><span><Badge v={rec.account} /></span></Field>
          </div>
        </div>
      )}
    </>
  );
}
