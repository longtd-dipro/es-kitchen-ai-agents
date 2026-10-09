'use client';

import { useState } from 'react';
import { errorMessage } from '@/lib/api/errors';
import { useOps, type OtpWait } from './OpsProvider';

/**
 * 運営Web のログイン（運営のアカウント：dm.account・site＝ops）。開発中はパスワードを確かめない（空でなければよい・ほかのサイトと同じ）。
 * ログインすると、API は役割（フル権限・マスタ管理者・配送担当 …）の権限で動く（lib/server/access.ts）。
 * IP ホワイトリスト外からのログインは、登録メールに送った認証コード（4桁・5分）を入れて完了する（台帳 E・受付簿 #61）。DEMO はコードをトーストで見せる
 */
export function OpsLogin() {
  const { login, verifyOtp, toast } = useOps();
  const [id, setId] = useState('');
  const [pw, setPw] = useState('');
  const [code, setCode] = useState('');
  const [otp, setOtp] = useState<OtpWait | null>(null);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErr('');
    try {
      if (otp) { await verifyOtp(id, code); return; }
      const w = await login(id, pw);
      if (w) {
        setOtp(w); setCode('');
        if (w.devCode) toast(`（DEMO）認証コード：${w.devCode}`);
      }
    } catch (x) { setErr(errorMessage(x)); } finally { setBusy(false); }
  };
  const restart = async () => {
    /* もう一度送る＝ログインをやり直す（前のコードは無効になる） */
    setBusy(true); setErr('');
    try { const w = await login(id, pw); if (w) { setOtp(w); setCode(''); toast(`認証コードをもう一度送りました（${w.sentTo}）`); if (w.devCode) toast(`（DEMO）認証コード：${w.devCode}`); } } catch (x) { setErr(errorMessage(x)); } finally { setBusy(false); }
  };
  return (
    <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: '1.142857rem' }}>
      <form className="card" onSubmit={submit} style={{ width: 'min(28.571429rem, 100%)', display: 'flex', flexDirection: 'column', gap: '1.142857rem', padding: '1.714286rem' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/ops/logo.png" alt="ESSTATION" style={{ height: '2.142857rem', width: 'auto', alignSelf: 'flex-start' }} />
        <h1 style={{ fontSize: '1.428571rem', margin: 0 }}>運営Web ログイン</h1>
        {!otp ? (
          <>
            <div className="fld">
              <label htmlFor="ops-login-id">ログインID</label>
              <input id="ops-login-id" className="inp" value={id} onChange={(e) => setId(e.target.value)} placeholder="例 Ad00001" autoComplete="username" />
            </div>
            <div className="fld">
              <label htmlFor="ops-login-pw">パスワード</label>
              <input id="ops-login-pw" className="inp" type="password" value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="current-password" />
              {err && <span className="emsg" role="alert">{err}</span>}
            </div>
            <button className="btn pri lg" type="submit" disabled={busy}>ログイン</button>
          </>
        ) : (
          <>
            <div className="notice" role="status"><span>登録されていない接続元からのログインです。<b>{otp.sentTo}</b> に送った認証コード（4桁・{otp.minutes}分間有効）を入れてください。</span></div>
            <div className="fld">
              <label htmlFor="ops-login-otp">認証コード</label>
              <input id="ops-login-otp" className="inp" inputMode="numeric" autoComplete="one-time-code" maxLength={4} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} placeholder="例 1234" autoFocus />
              {err && <span className="emsg" role="alert">{err}</span>}
            </div>
            <button className="btn pri lg" type="submit" disabled={busy || code.length !== 4}>認証コードでログイン</button>
            <div style={{ display: 'flex', gap: '0.571429rem', justifyContent: 'space-between' }}>
              <button className="btn out" type="button" disabled={busy} onClick={() => { setOtp(null); setCode(''); setErr(''); }}>最初からやり直す</button>
              <button className="btn out" type="button" disabled={busy} onClick={restart}>コードをもう一度送る</button>
            </div>
          </>
        )}
      </form>
    </main>
  );
}
