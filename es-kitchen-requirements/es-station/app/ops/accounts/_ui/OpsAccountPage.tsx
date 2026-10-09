'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ApiError, isStale } from '@/lib/api/errors';
import accountArea from '@/lib/domain/areas/account';
import { domainApi, useDomainQuery } from '@/lib/domain/client';
import { Loading } from '@/app/ops/_general/parts';
import { LEAVE_MSG, useLeaveGuard } from '@/app/ops/_ui/leaveGuard';
import { useOps } from '@/app/ops/_ui/OpsProvider';
import { Badge, ConfirmModal, Field, PageHead } from '@/app/ops/_ui/ui';

const api = domainApi(accountArea);
const LIST = '/ops/accounts';
const CRUMB = 'アカウント管理（運営）';
const STATUSES = ['有効', '無効'] as const;
const S01 = '保存しました。';
const MAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const fmtAt = (s: string) => (s ? s.slice(0, 16).replace(/\//g, '-') : '—');
type Errs = Partial<Record<'name' | 'email' | 'roleIds' | 'status', string>>;
type Form = { name: string; email: string; roleIds: string[]; status: string };

/**
 * アカウント管理（運営）の詳細（mode='view'）と編集（mode='edit'）。アカウント一覧の運営タブの名前から開く。
 *   基本情報：ユーザーID（表示）・ユーザー名*・メール*・ロール（運営の権限。2つ以上可・× で外す）・アカウント状態*（有効／無効。無効はログインできない）・最終ログイン（表示）
 *   新規の発行はここではしない（権限画面の「権限付与」から）。編集は「権限付与」の編集ができる役割だけ（ほかは詳細を見るだけ）
 *   入力チェック：E01 必須・E07 メールの形式・E09 メールの重複（サーバー）・E31 同時更新（上書きして保存）。成功 S01 → 詳細。入力を変えてキャンセル Q02
 */
export function OpsAccountPage({ id, mode }: { id: string; mode: 'view' | 'edit' }) {
  const router = useRouter();
  const { can, toast, toastError, openModal } = useOps();
  const { data: acc } = useDomainQuery(api, 'get', { id });
  const { data: roles } = useDomainQuery(api, 'roles', { site: 'ops' });
  const [form, setForm] = useState<Form | null>(null);
  const [base, setBase] = useState<Form | null>(null);
  const [ver, setVer] = useState<string>('0');
  const [errs, setErrs] = useState<Errs>({});
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const a = acc?.account;
  const editing = mode === 'edit';

  useEffect(() => {
    if (!a || form) return;
    const f: Form = { name: a.name, email: a.email, roleIds: [...a.roleIds], status: a.status };
    setForm(f); setBase(f); setVer(a.version ?? '0');
  }, [a, form]);

  const dirty = editing && !saved && !!form && !!base && JSON.stringify({ ...form, roleIds: [...form.roleIds].sort() }) !== JSON.stringify({ ...base, roleIds: [...base.roleIds].sort() });
  useLeaveGuard(dirty);

  if (acc === undefined || !roles) return <Loading />;
  if (!a || a.site !== 'ops') return <div className="card"><p>アカウントが見つかりません（{id}）</p><Link className="lnk u" href={LIST}>一覧へ戻る</Link></div>;
  const detailUrl = `${LIST}/${encodeURIComponent(id)}`;
  const deleted = a.status === '削除済';
  const editable = can('grant', 'update') && !deleted;
  const roleName = (rid: string) => roles.find((r) => r.id === rid)?.name ?? rid;

  /* ---------- 詳細（表示だけ） ---------- */
  if (!editing || !form) {
    if (editing && !form) return <Loading />;
    return (
      <>
        <PageHead crumbs={['アカウント管理', CRUMB, `${CRUMB}詳細`]} title={`${CRUMB}詳細 ${a.id}`}>
          <Link className="btn lg" href={LIST}>一覧へ戻る</Link>
          {editable && <Link className="btn pri lg" href={`${detailUrl}/edit`}>編集</Link>}
        </PageHead>
        <div className="card">
          <h3 style={{ margin: '0 0 0.857143rem', fontSize: '1.142857rem' }}>基本情報</h3>
          <div className="fg c2">
            <Field label="ユーザーID"><span className="mono">{a.id}</span></Field>
            <Field label="ユーザー名"><span>{a.name}</span></Field>
            <Field label="メール"><span>{a.email || '—'}</span></Field>
            <Field label="ロール"><span className="pm-chips">{a.roleIds.length ? a.roleIds.map((r) => <span key={r} className="pm-chip">{roleName(r)}</span>) : '—'}</span></Field>
            <Field label="アカウント状態"><Badge v={a.status} /></Field>
            <Field label="最終ログイン"><span>{fmtAt(a.lastLoginAt)}</span></Field>
          </div>
        </div>
      </>
    );
  }

  /* ---------- 編集 ---------- */
  if (!editable) return <div className="card"><p>{deleted ? '削除済みのため編集できません。' : 'この操作の権限がありません。'}</p><Link className="lnk u" href={detailUrl}>詳細へ戻る</Link></div>;
  const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm((f) => (f ? { ...f, [k]: v } : f));
  const statuses = [...new Set<string>([...STATUSES, base?.status ?? '有効'])];
  const addable = roles.filter((r) => !form.roleIds.includes(r.id));

  const check = (f: Form): Errs => {
    const e: Errs = {};
    if (!f.name.trim()) e.name = 'ユーザー名は必須項目です。';
    if (!f.email.trim()) e.email = 'メールは必須項目です。';
    else if (!MAIL_RE.test(f.email.trim())) e.email = '正しいメールアドレスの形式で入力してください。';
    if (!f.roleIds.length) e.roleIds = 'ロールは必須項目です。';
    if (!f.status) e.status = 'アカウント状態は必須項目です。';
    return e;
  };
  const doSave = async (force = false) => {
    setBusy(true);
    try {
      await api.action('updateAccount', { id, name: form.name.trim(), email: form.email.trim(), roleIds: form.roleIds, status: form.status as typeof a.status, by: '', baseVersion: ver, ...(force ? { force: true } : {}) });
      setSaved(true);
      toast(S01);
      router.push(detailUrl);
    } catch (e) {
      if (isStale(e)) {
        /* E31：ほかの人が先に保存していた（「キャンセル」「上書きして保存」） */
        openModal(<ConfirmModal kind="warn" title="内容が更新されています" text="他のユーザーにより内容が更新されています。上書きすると保存されます。" ok="上書きして保存" okCls="warn-solid" onOk={() => doSave(true)} />);
      } else if (e instanceof ApiError && /メール/.test(e.message) && (e.status === 400 || e.status === 409)) {
        setErrs({ email: e.message });
      } else if (e instanceof ApiError && e.status === 400 && /ユーザー名/.test(e.message)) {
        setErrs({ name: e.message });
      } else toastError(e);
    } finally { setBusy(false); }
  };
  const save = () => {
    if (busy) return;
    const e = check(form);
    setErrs(e);
    if (Object.keys(e).length) return;
    void doSave();
  };
  const cancel = () => {
    const go = () => router.push(detailUrl);
    if (!dirty) { go(); return; }
    openModal(<ConfirmModal kind="warn" title={LEAVE_MSG.title} text={LEAVE_MSG.text} ok={LEAVE_MSG.ok} okCls="warn-solid" cancel={LEAVE_MSG.cancel} onOk={go} />);
  };
  const cls = (k: keyof Errs) => `inp${errs[k] ? ' err' : ''}`;
  return (
    <>
      <PageHead crumbs={['アカウント管理', CRUMB, `${CRUMB}編集`]} title={`${CRUMB}編集 ${a.id}`}>
        <button className="btn lg" onClick={cancel}>キャンセル</button>
        <button className="btn pri lg" disabled={busy} onClick={save}>保存</button>
      </PageHead>
      <div className="card">
        <h3 style={{ margin: '0 0 0.857143rem', fontSize: '1.142857rem' }}>基本情報</h3>
        <div className="fg c2">
          <Field label="ユーザーID"><span className="mono">{a.id}</span></Field>
          <Field label="ユーザー名" req htmlFor="oa-name" err={errs.name}>
            <input id="oa-name" className={cls('name')} maxLength={50} value={form.name} onChange={(e) => set('name', e.target.value)} />
          </Field>
          <Field label="メール" req htmlFor="oa-mail" err={errs.email}>
            <input id="oa-mail" type="email" className={cls('email')} maxLength={254} placeholder="例）taro@example.jp" value={form.email} onChange={(e) => set('email', e.target.value)} />
          </Field>
          <Field label="ロール" req htmlFor="oa-role" err={errs.roleIds} hint="2つ以上選ぶと、どれかの権限でできる操作ができます（上位の方）">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.428571rem' }}>
              <div className="pm-chips">
                {form.roleIds.map((r) => (
                  <span key={r} className="pm-chip">
                    {roleName(r)}
                    <button type="button" className="btn ghost" aria-label={`${roleName(r)} を外す`} style={{ padding: '0 0 0 0.285714rem', minHeight: 0, height: 'auto' }}
                      onClick={() => set('roleIds', form.roleIds.filter((x) => x !== r))}>×</button>
                  </span>
                ))}
              </div>
              <select id="oa-role" className={cls('roleIds')} value="" disabled={!addable.length} onChange={(e) => e.target.value && set('roleIds', [...form.roleIds, e.target.value])}>
                <option value="">{addable.length ? 'ロールを追加' : '追加できるロールはありません'}</option>
                {addable.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </div>
          </Field>
          <Field label="アカウント状態" req htmlFor="oa-status" err={errs.status} hint="無効にするとログインできません">
            <select id="oa-status" className={cls('status')} value={form.status} onChange={(e) => set('status', e.target.value)}>
              {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="最終ログイン"><span>{fmtAt(a.lastLoginAt)}</span></Field>
        </div>
      </div>
    </>
  );
}
