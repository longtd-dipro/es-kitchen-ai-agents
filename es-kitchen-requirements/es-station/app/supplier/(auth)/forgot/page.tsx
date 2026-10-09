'use client';

import Link from 'next/link';
import { useState } from 'react';
import { api } from '@/lib/api/supplier';
import { errorMessage } from '@/lib/api/errors';
import { isCode, PASSWORD_HINT, PASSWORD_RULE, passwordValid } from '@/lib/auth/rules';
import { MAIL_RE } from '@/lib/supplier/orders';
import { R } from '@/lib/supplier/routes';
import { AuthCard, MiniSteps } from '../../_components/AuthCard';
import { Field, Notice } from '../../_components/ui';

/** S02 パスワード再設定（ID・メール → 認証コード（4桁・5分・台帳 K）→ 新パスワード → 完了） */
export default function ForgotPage() {
  const [step, setStep] = useState(1);
  const [f, setF] = useState({ id: '', mail: '', code: '', p1: '', p2: '' });
  const [token, setToken] = useState('');
  const [err, setErr] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.value });

  /** API を呼び、失敗したら key の欄にエラーを出す */
  const run = async (key: string, fn: () => Promise<void>) => {
    setBusy(true);
    try {
      await fn();
    } catch (e) {
      setErr({ [key]: errorMessage(e) });
    } finally {
      setBusy(false);
    }
  };

  const step1 = () => {
    const e: Record<string, string> = {};
    if (!f.id.trim()) e.id = 'ログインIDを入力してください';
    if (!MAIL_RE.test(f.mail.trim())) e.mail = 'メールアドレスの形式で入力してください';
    setErr(e);
    if (!Object.keys(e).length) run('mail', async () => { await api.requestPasswordReset(f.id.trim(), f.mail.trim()); setStep(2); });
  };
  const step2 = () => {
    if (!isCode(f.code)) return setErr({ code: '認証コード（4桁の数字）を入力してください' });
    setErr({});
    run('code', async () => { setToken((await api.verifyResetCode(f.id.trim(), f.code)).token); setStep(3); });
  };
  const step3 = () => {
    const e: Record<string, string> = {};
    if (!passwordValid(f.p1)) e.p1 = PASSWORD_RULE;
    if (f.p1 !== f.p2) e.p2 = '確認用のパスワードが一致しません';
    setErr(e);
    if (!Object.keys(e).length) run('p1', async () => { await api.resetPassword(token, f.p1); setStep(4); });
  };

  return (
    <AuthCard title="仕入先サイト" back={step < 4}>
      <h1>パスワードの再設定</h1>
      <div style={{ marginTop: '0.857143rem' }}>
        <MiniSteps steps={['ID・メール入力', '認証コード', '新パスワード', '完了']} cur={step} />
      </div>
      {step === 1 && (
        <>
          <p className="sub">ご登録のログインIDとメールアドレスを入力してください。認証コード（4桁）をメールでお送りします。</p>
          <div className="stack">
            <Field label="ログインID" err={err.id}><input className={`inp ${err.id ? 'err' : ''}`} value={f.id} onChange={set('id')} /></Field>
            <Field label="メールアドレス" err={err.mail}><input className={`inp ${err.mail ? 'err' : ''}`} type="email" value={f.mail} onChange={set('mail')} /></Field>
            <button className="btn pri lg" disabled={busy} onClick={step1}>認証コードを送る</button>
          </div>
        </>
      )}
      {step === 2 && (
        <>
          <Notice kind="pur" icon="mail">認証コード（4桁）をメールで送りました（有効期限：5分）。メールに書かれたコードを入力してください。</Notice>
          <div className="stack" style={{ marginTop: '1.142857rem' }}>
            <Field label="認証コード" err={err.code} hint="5分を過ぎたら、もう一度「認証コードを送る」からやり直してください">
              <input className={`inp ${err.code ? 'err' : ''}`} inputMode="numeric" maxLength={4} value={f.code} onChange={set('code')} />
            </Field>
            <button className="btn pri lg" disabled={busy} onClick={step2}>確認する</button>
            <button className="btn out" disabled={busy} onClick={() => { setStep(1); setErr({}); }}>認証コードを送り直す</button>
          </div>
        </>
      )}
      {step === 3 && (
        <div className="stack">
          <Field label="新しいパスワード" hint={PASSWORD_HINT} err={err.p1}><input className={`inp ${err.p1 ? 'err' : ''}`} type="password" value={f.p1} onChange={set('p1')} /></Field>
          <Field label="新しいパスワード（確認）" err={err.p2}><input className={`inp ${err.p2 ? 'err' : ''}`} type="password" value={f.p2} onChange={set('p2')} /></Field>
          <button className="btn pri lg" disabled={busy} onClick={step3}>パスワードを設定する</button>
        </div>
      )}
      {step === 4 && (
        <>
          <Notice kind="pur" icon="mail">パスワードを再設定しました。新しいパスワードでログインしてください。</Notice>
          <Link href={R.login} className="btn pri lg" style={{ width: '100%', marginTop: '1.142857rem', textDecoration: 'none' }}>ログイン画面へ</Link>
        </>
      )}
    </AuthCard>
  );
}
