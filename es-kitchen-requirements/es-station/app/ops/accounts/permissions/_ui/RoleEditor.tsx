'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import accountArea from '@/lib/domain/areas/account';
import { domainApi, useDomainQuery } from '@/lib/domain/client';
import { FEATURE, levelOf, OP_LABEL, opsOfLevel, PERM_FEATURES, type Grants, type Level, type PermOp } from '@/lib/ops/permissions';
import { LEAVE_MSG, useLeaveGuard } from '../../../_ui/leaveGuard';
import { useOps } from '../../../_ui/OpsProvider';
import { ConfirmModal, Field, PageHead } from '../../../_ui/ui';

const api = domainApi(accountArea);
/** 表の列（基本の操作）。機能ごとの操作（承認・公開…）は「その他」の列に出す */
export const BASIC: PermOp[] = ['read', 'create', 'update', 'delete', 'csvImport', 'csvExport'];
const LEVELS: (Level | 'カスタム')[] = ['×', 'R', 'R/U', 'CRUD'];
const LEVEL_LABEL: Record<string, string> = { '×': 'なし', R: '閲覧のみ', 'R/U': '閲覧＋編集', CRUD: 'すべて', 'カスタム': 'カスタム' };
const GROUPS = [...new Set(PERM_FEATURES.map((f) => f.group))];
/** 系統のまとめ行：機能の書き方がそろっていないとき */
const MIXED = 'まちまち';
/** チェックボックス（一部だけのとき indeterminate） */
function Tick({ checked, some, disabled, label, onChange }: { checked: boolean; some?: boolean; disabled?: boolean; label: string; onChange: () => void }) {
  return <input type="checkbox" checked={checked} disabled={disabled} aria-label={label} onChange={onChange} ref={(el) => { if (el) el.indeterminate = !checked && !!some; }} />;
}

/**
 * 権限（役割）の作成・編集（id＝new で作成）。機能ごとに、できる操作を選ぶ。
 * 「なし／閲覧のみ／閲覧＋編集／すべて」は運営の権限表の ×・R・R/U・CRUD。チェックを個別に変えると「カスタム」。
 * 系統ごとの見出し行で、操作の列・「まとめて」を系統の全機能にいっぺんに付けられる（チェック＝全部あり／一部だけは「－」）。系統は折りたたむ。
 * 役割は手でチェックする（自動の決まりはない）。
 * 「権限付与」の作成・編集ができる人だけ保存できる（サーバーでも確かめる）
 */
export function RoleEditor({ id }: { id: string }) {
  const isNew = id === 'new';
  const router = useRouter();
  const { toast, toastError, can, openModal } = useOps();
  const { data: roles } = useDomainQuery(api, 'roles', { site: 'ops' });
  const role = roles?.find((r) => r.id === id);
  const [name, setName] = useState('');
  const [note, setNote] = useState('');
  const [grants, setGrants] = useState<Grants>({});
  const [loaded, setLoaded] = useState(isNew);
  const [busy, setBusy] = useState(false);
  const [nameErr, setNameErr] = useState('');
  const [closed, setClosed] = useState<Record<string, boolean>>({});
  const editable = can('grant', isNew ? 'create' : 'update');

  useEffect(() => {
    if (loaded || !role) return;
    setName(role.name); setNote(role.note); setGrants(role.grants ?? {}); setLoaded(true);
  }, [role, loaded]);

  const has = (f: string, o: PermOp) => !!grants[f]?.includes(o);
  const toggle = (f: string, o: PermOp) => setGrants((g) => {
    const cur = new Set(g[f] ?? []);
    if (cur.has(o)) { cur.delete(o); if (o === 'read') cur.clear(); } else { cur.add(o); cur.add('read'); }
    return { ...g, [f]: FEATURE[f].ops.filter((x) => cur.has(x)) };
  });
  const setLevel = (f: string, lv: Level) => setGrants((g) => ({ ...g, [f]: opsOfLevel(FEATURE[f], lv) }));
  /* 系統まとめ：その操作を持つ機能のうち、いくつにあるか */
  const groupOp = (g: string, o: PermOp) => {
    const fs = PERM_FEATURES.filter((f) => f.group === g && f.ops.includes(o));
    const on = fs.filter((f) => has(f.key, o)).length;
    return { fs, all: fs.length > 0 && on === fs.length, some: on > 0 && on < fs.length };
  };
  /* 全部あり→全部外す／それ以外→全部付ける（付けると閲覧も付く。閲覧を外すとその機能の操作は全部なくなる） */
  const toggleGroupOp = (g: string, o: PermOp) => setGrants((cur) => {
    const { fs, all } = groupOp(g, o);
    const next = { ...cur };
    for (const f of fs) {
      const set = new Set(cur[f.key] ?? []);
      if (all) { set.delete(o); if (o === 'read') set.clear(); } else { set.add(o); set.add('read'); }
      next[f.key] = f.ops.filter((x) => set.has(x));
    }
    return next;
  });
  const groupLevel = (g: string): Level | 'カスタム' | typeof MIXED => {
    const lvs = new Set(PERM_FEATURES.filter((f) => f.group === g).map((f) => levelOf(f, grants[f.key])));
    return lvs.size === 1 ? [...lvs][0] : MIXED;
  };
  const setGroupLevel = (g: string, lv: Level) => setGrants((cur) => {
    const next = { ...cur };
    for (const f of PERM_FEATURES.filter((x) => x.group === g)) next[f.key] = opsOfLevel(f, lv);
    return next;
  });
  /* 全系統の列まとめ：その操作を持つ機能のうち、いくつにあるか（機能モジュール・権限設定マトリクスの見出し行） */
  const allOp = (o: PermOp) => {
    const fs = PERM_FEATURES.filter((f) => f.ops.includes(o));
    const on = fs.filter((f) => has(f.key, o)).length;
    return { all: fs.length > 0 && on === fs.length, some: on > 0 && on < fs.length };
  };
  const toggleAllOp = (o: PermOp) => setGrants((cur) => {
    const { all } = allOp(o);
    const next = { ...cur };
    for (const f of PERM_FEATURES.filter((x) => x.ops.includes(o))) {
      const set = new Set(cur[f.key] ?? []);
      if (all) { set.delete(o); if (o === 'read') set.clear(); } else { set.add(o); set.add('read'); }
      next[f.key] = f.ops.filter((x) => set.has(x));
    }
    return next;
  });
  const count = useMemo(() => PERM_FEATURES.filter((f) => grants[f.key]?.length).length, [grants]);
  /* 入力中に画面を離れるときの確認（Q02・全サイト共通）：開いたときの値と違えば、キャンセル・サイドメニュー・ブラウザを閉じるときに出す */
  const [saved, setSaved] = useState(false);
  const dirty = editable && loaded && !saved && (isNew
    ? !!(name || note || Object.values(grants).some((x) => x?.length))
    : !!role && (name !== role.name || note !== role.note || JSON.stringify(grants) !== JSON.stringify(role.grants ?? {})));
  useLeaveGuard(dirty);
  const cancel = () => {
    const go = () => router.push('/ops/accounts/permissions');
    if (!dirty) { go(); return; }
    openModal(<ConfirmModal kind="warn" title={LEAVE_MSG.title} text={LEAVE_MSG.text} ok={LEAVE_MSG.ok} okCls="warn-solid" cancel={LEAVE_MSG.cancel} onOk={go} />);
  };

  const save = async () => {
    /* 保存でまとめてチェック（P-FORM）：権限名は項目の下に E01・E04・E260（同じ名前）を出す */
    const nm = name.trim();
    if (!nm) { setNameErr('権限名は必須項目です。'); return; }
    if (nm.length > 60) { setNameErr('60文字以内で入力してください。'); return; }
    setNameErr('');
    setBusy(true);
    try {
      const r = await api.action('saveRole', { ...(isNew ? {} : { id }), name, note, grants, by: '' });
      setSaved(true);
      toast(isNew ? '権限を登録しました' : '権限を保存しました');
      /* 保存したあとはその権限の詳細へ（登録＝作った権限） */
      router.push(`/ops/accounts/permissions/${encodeURIComponent(r.id)}`);
    } catch (e) {
      if (e instanceof Error && /同じ名前の権限/.test(e.message)) setNameErr('同じ名前の権限があります。');
      else toastError(e);
    } finally { setBusy(false); }
  };

  if (!isNew && roles && !role) return <div className="card"><p>権限が見つかりません（{id}）</p></div>;
  return (
    <>
      <PageHead crumbs={['アカウント管理', '権限', isNew ? '権限登録' : name || id]} title={isNew ? '権限登録' : '権限の編集'}>
        <button className="btn lg" onClick={cancel}>{editable ? 'キャンセル' : '一覧へ戻る'}</button>
        {editable && <button className="btn pri lg" disabled={busy || !loaded} onClick={save}>{isNew ? '登録' : '保存'}</button>}
      </PageHead>
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.142857rem' }}>
        <div className="fg c2">
          <Field label="権限名" req htmlFor="role-name" err={nameErr}><input id="role-name" className={`inp${nameErr ? ' err' : ''}`} value={name} disabled={!editable} onChange={(e) => setName(e.target.value)} /></Field>
          <Field label="備考" htmlFor="role-note"><input id="role-note" className="inp" value={note} disabled={!editable} onChange={(e) => setNote(e.target.value)} /></Field>
        </div>
        <p className="hint">
          機能ごとに、できる操作を選びます（{count}機能で操作あり）。「閲覧」を外すと、その機能の操作はすべてなくなります。各系統の先頭の行で、その系統の全機能にまとめて付けられます（▼で系統を折りたためます）。
          2つ以上の権限を持つアカウントは、どれかの権限でできる操作ができます（上位の方）。
        </p>
      </div>
      <div className="card">
        <div className="tbl-wrap">
          <table className="tbl" style={{ tableLayout: 'fixed', minWidth: '64.285714rem' }} aria-label="機能モジュール・権限設定マトリクス">
            <colgroup>
              <col style={{ width: '28%' }} />
              {BASIC.map((o) => <col key={o} style={{ width: '5.142857rem' }} />)}
              <col />
            </colgroup>
            <thead>
              <tr>
                <th style={{ fontSize: '1.142857rem' }}>機能モジュール・権限設定マトリクス</th>
                {BASIC.map((o) => {
                  const t = allOp(o);
                  return <th key={o} style={{ textAlign: 'center' }}><Tick checked={t.all} some={t.some} disabled={!editable} label={`全機能：${OP_LABEL[o]}`} onChange={() => toggleAllOp(o)} /><div>{OP_LABEL[o]}</div></th>;
                })}
                <th>その他</th>
              </tr>
            </thead>
          </table>
        </div>
      </div>
      {GROUPS.map((g) => {
        const gfs = PERM_FEATURES.filter((f) => f.group === g);
        const gcount = gfs.filter((f) => grants[f.key]?.length).length;
        const isClosed = !!closed[g];
        return (
        <div key={g} className="card">
          <h3 style={{ margin: '0 0 0.571429rem', fontSize: '1.142857rem' }}>
            <button type="button" className="btn ghost" aria-expanded={!isClosed} aria-controls={`perm-${g}`} onClick={() => setClosed((c) => ({ ...c, [g]: !c[g] }))}
              style={{ fontSize: 'inherit', fontWeight: 'inherit', padding: 0, gap: '0.428571rem' }}>
              <span aria-hidden="true">{isClosed ? '▶' : '▼'}</span>{g}
            </button>
            <span className="hint" style={{ marginLeft: '0.857143rem', fontWeight: 'normal' }}>{gcount}／{gfs.length}機能で操作あり</span>
          </h3>
          <div className="tbl-wrap" id={`perm-${g}`}>
            {/* 列の幅はグループの表どうしで揃える */}
            <table className="tbl" style={{ tableLayout: 'fixed', minWidth: '64.285714rem' }}>
              <colgroup>
                <col style={{ width: '28%' }} />
                {BASIC.map((o) => <col key={o} style={{ width: '5.142857rem' }} />)}
                <col />
              </colgroup>
              <thead>
                <tr>
                  <th>機能</th>
                  {BASIC.map((o) => <th key={o} style={{ textAlign: 'center' }}>{OP_LABEL[o]}</th>)}
                  <th>その他</th>
                </tr>
              </thead>
              <tbody>
                {/* 系統まとめ行：この系統の全機能にいっぺんに付ける・外す（閉じていても使える） */}
                <tr>
                  <td style={{ background: 'var(--surface-2)' }}><b>{g}：すべての機能</b></td>
                  {BASIC.map((o) => {
                    const t = groupOp(g, o);
                    return (
                      <td key={o} style={{ textAlign: 'center', background: 'var(--surface-2)' }}>
                        {t.fs.length ? <Tick checked={t.all} some={t.some} disabled={!editable} label={`${g}：${OP_LABEL[o]}（全機能）`} onChange={() => toggleGroupOp(g, o)} /> : <span className="hint">—</span>}
                      </td>
                    );
                  })}
                  <td style={{ background: 'var(--surface-2)' }} />
                </tr>
                {!isClosed && gfs.map((f) => {
                  const extra = f.ops.filter((o) => !BASIC.includes(o));
                  return (
                    <tr key={f.key}>
                      <td>
                        <b>{f.label}</b>
                        <div className="hint">{f.screens.length ? f.screens.join('・') : '（画面は準備中）'}</div>
                      </td>
                      {BASIC.map((o) => (
                        <td key={o} style={{ textAlign: 'center' }}>
                          {f.ops.includes(o) ? <input type="checkbox" checked={has(f.key, o)} disabled={!editable} aria-label={`${f.label}：${OP_LABEL[o]}`} onChange={() => toggle(f.key, o)} /> : <span className="hint">—</span>}
                        </td>
                      ))}
                      <td>
                        {extra.map((o) => (
                          <label key={o} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.285714rem', marginRight: '0.857143rem', whiteSpace: 'nowrap' }}>
                            <input type="checkbox" checked={has(f.key, o)} disabled={!editable} onChange={() => toggle(f.key, o)} />{OP_LABEL[o]}
                          </label>
                        ))}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
        );
      })}
    </>
  );
}
