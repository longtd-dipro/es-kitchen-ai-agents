'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { errorMessage } from '@/lib/api/errors';
import { DEMO } from '@/lib/demo';
import { checkLogin } from '@/lib/driver/logic';
import { Icon } from '../_ui/Icon';
import { useDriver } from '../_ui/DriverProvider';

/** ログイン（元の V.login・DA_AUTHEN_001）。ログインID＝配送スタッフID（運営の配送スタッフマスタ・委託配送先のスタッフ） */
export default function DriverLogin() {
  const { login, toast } = useDriver();
  const router = useRouter();
  // デモのときだけ、見本の配送スタッフを最初から入れておく
  const [id, setId] = useState(DEMO ? 'DR00014' : '');
  const [pw, setPw] = useState(DEMO ? 'password1' : '');
  const [show, setShow] = useState(false);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const submit = async () => {
    const m = checkLogin(id, pw);
    if (m) return setErr(m);
    setBusy(true);
    try {
      await login(id, pw);
      router.replace('/driver');
      toast('ログインしました');
    } catch (e) {
      setErr(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };
  return (
    <form className="scroll auth" noValidate onSubmit={(e) => { e.preventDefault(); submit(); }}>
      <div className="hero" />
      <div className="sheet">
        <p className="slogan">今日も一日、<br />安全運転で頑張りましょう。</p>
        <div className="field"><input id="lid" placeholder="ログインID" aria-label="ログインID" autoComplete="username" value={id} onChange={(e) => { setId(e.target.value); setErr(''); }} /></div>
        <div className="field">
          <input id="lpw" type={show ? 'text' : 'password'} placeholder="パスワード" aria-label="パスワード" autoComplete="current-password" value={pw} onChange={(e) => { setPw(e.target.value); setErr(''); }} />
          <button type="button" className="eye" aria-label="表示切替" onClick={() => setShow(!show)}><Icon name={show ? 'eye' : 'eyeoff'} /></button>
        </div>
        {err && <div className="err" role="alert">{err}</div>}
        <div style={{ textAlign: 'right' }}><button type="button" className="link" onClick={() => router.push('/driver/password')}>パスワードを忘れた方はこちら</button></div>
        <button type="submit" className="btn pri" disabled={busy}>ログイン</button>
      </div>
    </form>
  );
}
