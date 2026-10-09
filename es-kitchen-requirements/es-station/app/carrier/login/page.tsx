'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { DEMO } from '@/lib/demo';
import { Icon } from '../_ui/Icon';
import { useCarrier } from '../_ui/CarrierProvider';

/** ログイン（元の login()・OW_AUTH_001）。ログインID＝委託配送先ID */
export default function CarrierLogin() {
  const { login, toast, toastError } = useCarrier();
  const router = useRouter();
  // デモのときだけ、見本のアカウントを最初から入れておく（RV-CARRIER-20261002）
  const [lid, setLid] = useState(DEMO ? 'DE00001' : '');
  const [lpw, setLpw] = useState(DEMO ? 'password1' : '');
  const [show, setShow] = useState(false);
  const submit = async () => {
    if (!lid || !lpw) return toast('ログインIDとパスワードを入力してください');
    try {
      await login(lid, lpw);
      router.push('/carrier');
      toast('ログインしました');
    } catch (e) {
      toastError(e);
    }
  };
  return (
    <div className="auth photo">
      <form className="auth-card" noValidate onSubmit={(e) => { e.preventDefault(); submit(); }}>
        <div className="brand" role="img" aria-label="ES STATION" />
        <h1>ログイン</h1>
        <div className="fld"><label htmlFor="lid">ログインID</label><input className="inp" id="lid" placeholder="ログインID" autoComplete="username" value={lid} onChange={(e) => setLid(e.target.value)} /></div>
        <div className="fld">
          <label htmlFor="lpw">パスワード</label>
          <div className="pw">
            <input className="inp" id="lpw" type={show ? 'text' : 'password'} placeholder="パスワード" autoComplete="current-password" value={lpw} onChange={(e) => setLpw(e.target.value)} />
            <button type="button" aria-label="パスワードを表示" onClick={() => setShow(!show)}><Icon name="eye" /></button>
          </div>
        </div>
        <button className="cta" type="submit">ログイン</button>
        <button className="cta-sub" type="button" onClick={() => router.push('/carrier/apply')}>新規登録</button>
        <div style={{ textAlign: 'center' }}><Link className="linkbtn" href="/carrier/password">パスワードを忘れた方はこちら</Link></div>
      </form>
    </div>
  );
}
