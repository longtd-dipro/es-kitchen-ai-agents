'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { errorMessage } from '@/lib/api/errors';
import { R } from '@/lib/supplier/routes';
import { useSupplier } from '@/lib/supplier/store';
import { AuthCard } from '../../_components/AuthCard';
import { Field } from '../../_components/ui';

/** S01 ログイン */
export default function LoginPage() {
  const { login } = useSupplier();
  const router = useRouter();
  const [id, setId] = useState('');
  const [pw, setPw] = useState('');
  const [err, setErr] = useState<{ id?: string; pw?: string }>({});
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    const e: typeof err = {};
    if (!id.trim()) e.id = 'ログインIDを入力してください';
    if (!pw) e.pw = 'パスワードを入力してください';
    setErr(e);
    if (Object.keys(e).length) return;
    setBusy(true);
    try {
      await login(id.trim(), pw);
      router.push(R.home);
    } catch (ex) {
      setErr({ id: errorMessage(ex) });
      setBusy(false);
    }
  };

  return (
    <AuthCard title="仕入先サイト" back={false}>
      <h1>ログイン</h1>
      <p className="sub">運営から発行されたアカウントでログインしてください。</p>
      <form className="stack" onSubmit={(e) => { e.preventDefault(); submit(); }}>
        <Field label="ログインID" err={err.id}>
          <input className={`inp ${err.id ? 'err' : ''}`} value={id} onChange={(e) => setId(e.target.value)} autoComplete="username" />
        </Field>
        <Field label="パスワード" err={err.pw}>
          <input className={`inp ${err.pw ? 'err' : ''}`} type="password" value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="current-password" />
        </Field>
        <button className="btn pri lg" style={{ width: '100%' }} disabled={busy}>ログイン</button>
      </form>
      <div className="auth-links">
        <Link className="lnk" href={R.forgot}>パスワードを忘れた方</Link>
        <Link className="lnk" href={R.apply}>取引の申込はこちら</Link>
      </div>
    </AuthCard>
  );
}
