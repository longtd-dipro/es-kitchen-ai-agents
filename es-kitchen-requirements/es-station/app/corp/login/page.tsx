'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { errorMessage } from '@/lib/api/errors';
import { DEMO } from '@/lib/demo';
import { useCorp } from '../_ui/CorpProvider';

/** ログイン（元のデモのログインのカード）。法人アカウントは法人ID、拠点アカウントは拠点ID（共通データのアカウント・認証はフェイク） */
export default function CorpLogin() {
  const { login, toast } = useCorp();
  const router = useRouter();
  const [id, setId] = useState('');
  const [pw, setPw] = useState(DEMO ? 'password1' : '');
  const [msg, setMsg] = useState('');
  const submit = async () => {
    if (!id || !pw) return setMsg('ログインID とパスワードを入力してください');
    try {
      await login(id, pw);
      toast('ログインしました');
      router.push('/corp');
    } catch (e) {
      setMsg(errorMessage(e));
    }
  };
  return (
    <div className="hd-ov login" style={{ position: 'static', minHeight: '100%' }}>
      <form className="hd-dlg" onSubmit={(e) => { e.preventDefault(); submit(); }}>
        <h3>ES STATION 法人Web ログイン</h3>
        <p>ES STATION は、ESキッチンのご契約・ご注文・ご請求をお手続きいただくサイトの名前です。サービスの名前は ESキッチンです。</p>
        <p>法人アカウントは法人ID、拠点アカウントは拠点ID でログインします。{DEMO ? '（開発中：登録済みの法人・拠点のアカウントならどれでも。パスワードは確かめません）' : ''}</p>
        <label>ログインID<input type="text" placeholder="法人ID または 拠点ID（例 CU00001）" autoComplete="username" value={id} onChange={(e) => setId(e.target.value)} /></label>
        <label>パスワード<input type="password" autoComplete="current-password" value={pw} onChange={(e) => setPw(e.target.value)} /></label>
        <div className="msg" role="alert">{msg}</div>
        <button type="button" className="lnk" onClick={() => toast('ログインID とメールアドレスを入れると、認証コード（有効期限5分）を送ります')}>パスワードをお忘れの方</button>
        <div className="ft"><button type="submit" className="es-btn es-btn--solid es-btn--primary es-btn--md">ログイン</button></div>
        <a className="lnk" href="/corp/apply">はじめてのお申し込みはこちら</a>
      </form>
    </div>
  );
}
