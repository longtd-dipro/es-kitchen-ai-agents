'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useRef, useState } from 'react';
import { errorMessage } from '@/lib/api/errors';
import driver from '@/lib/driver/area';
import { checkNewPassword } from '@/lib/driver/logic';
import { areaApi } from '@/lib/ops/core/client';
import { Icon } from '../_ui/Icon';
import { useDriver } from '../_ui/DriverProvider';
import { IMG } from '../_ui/parts';

export default function Page() {
  return <Suspense><DriverPassword /></Suspense>;
}

/**
 * パスワードリセット（元の V.pw1〜pw4・DA_AUTHEN_002）。1＝ログインID → 2＝認証コード（登録メールアドレスへ4桁） → 3＝新しいパスワード → 4＝完了。
 * 認証コードの発行・確認・期限は共通データ（lib/domain/driverAuth.ts）。メールの送信はいまは仮（コードを画面とサーバーのログに出す：台帳 2026/10/03）。
 * ?step=2〜4 は DEMO 帯の画面ジャンプ用
 */
function DriverPassword() {
  const { toast, logout } = useDriver();
  const router = useRouter();
  const sp = useSearchParams();
  const init = Math.min(4, Math.max(1, Number(sp.get('step')) || 1));
  const [step, setStep] = useState(init);
  const [id, setId] = useState('');
  const [mail, setMail] = useState(init > 1 ? 'e***@sample.com' : '');
  const [min, setMin] = useState(5);
  const [dev, setDev] = useState('');
  const [busy, setBusy] = useState(false);
  const [code, setCode] = useState(['', '', '', '']);
  const [p, setP] = useState({ p1: '', p2: '', s1: false, s2: false });
  const [err, setErr] = useState('');
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => { setStep(init); }, [init]);

  const toLogin = () => { logout(); router.replace('/driver/login'); };
  const m = mail || '—';
  const api = areaApi(driver);
  const run = async (f: () => Promise<void>) => { if (busy) return; setBusy(true); setErr(''); try { await f(); } catch (e) { setErr(errorMessage(e)); } finally { setBusy(false); } };
  const send = (next?: () => void) => run(async () => {
    const r = await api.action('requestReset', { id });
    setMail(r.sentTo); setMin(r.minutes); setDev(r.devCode); setCode(['', '', '', '']);
    next?.();
  });
  const full = code.every((c) => c);
  const pwErr = p.p2 && p.p1 !== p.p2 ? 'パスワードが一致しません。' : '';

  if (step === 4) {
    return (
      <div className="scroll" style={{ background: `url(${IMG('hero')}) center/cover`, display: 'flex', alignItems: 'center', padding: '1.428571rem' }}>
        <div className="modal" style={{ gap: '1rem', margin: '0 auto' }}>
          <img src={IMG('hero')} alt="" style={{ width: '100%', borderRadius: 12 }} />
          <h3>パスワードリセットに成功しました。</h3>
          <p>現在は正常にログイン・ご利用いただけます。<br />引き続きよろしくお願いいたします。</p>
          <button type="button" className="btn pri" onClick={toLogin}>ホーム画面へ</button>
        </div>
      </div>
    );
  }
  return (
    <div className="scroll auth">
      <div className="hero" />
      <div className="sheet">
        <p className="slogan" style={{ fontSize: '1.714286rem' }}>パスワードリセット</p>
        {step === 1 && (
          <>
            <p className="center" style={{ margin: 0, lineHeight: 1.6 }}>ログインIDを入力してください。<br />登録済みのメールアドレスに再設定用認証コードをお送りします。</p>
            <div className="field"><input placeholder="ログインID" aria-label="ログインID" value={id} onChange={(e) => setId(e.target.value)} /></div>
            {err && <div className="err" role="alert">{err}</div>}
            <button type="button" className="btn pri" disabled={!id.trim() || busy} onClick={() => send(() => setStep(2))}>認証コードを送信</button>
            <div className="center"><button type="button" className="link" onClick={toLogin}>ログイン画面に戻る</button></div>
          </>
        )}
        {step === 2 && (
          <>
            <p className="center" style={{ margin: 0, fontSize: '1.285714rem' }}>認証コードを入力してください。</p>
            <p className="center muted" style={{ margin: 0, fontSize: '0.928571rem', lineHeight: 1.6 }}>パスワード再設定用メールを送信しました。<br />下記のメールアドレスをご確認ください。</p>
            <div className="center muted" style={{ display: 'flex', gap: '0.571429rem', justifyContent: 'center', alignItems: 'center' }}><Icon name="mail" />{m}</div>
            <div className="codebox">
              {code.map((c, i) => (
                <input key={i} ref={(el) => { refs.current[i] = el; }} inputMode="numeric" maxLength={1} value={c} aria-label={`コード${i + 1}桁目`}
                  onChange={(e) => {
                    const v = e.target.value.replace(/\D/g, '').slice(-1);
                    setCode(code.map((x, k) => (k === i ? v : x)));
                    if (v && i < 3) refs.current[i + 1]?.focus();
                  }}
                  onKeyDown={(e) => { if (e.key === 'Backspace' && !c && i > 0) refs.current[i - 1]?.focus(); }} />
              ))}
            </div>
            {err && <div className="err" role="alert">{err}</div>}
            <button type="button" className="btn pri" disabled={!full || busy} onClick={() => run(async () => { const r = await api.action('verifyReset', { id, code: code.join('') }); if (!r.ok) { setErr(r.message); return; } setStep(3); })}>確認 <Icon name="arrow" /></button>
            <p className="center muted" style={{ margin: 0, fontSize: '0.928571rem', lineHeight: 1.7 }}>
              コードが届かない場合： <button type="button" className="link" style={{ fontSize: '0.928571rem' }} onClick={() => send(() => { toast('認証コードを再送信しました'); })}>再送信</button>
              <br />※認証コードの有効期限は{min}分です。
              {dev && <><br /><span style={{ fontSize: '0.857143rem' }}>開発中：メールはまだ送っていません。認証コード {dev}</span></>}
            </p>
          </>
        )}
        {step === 3 && (
          <>
            <p className="center" style={{ margin: 0 }}>新しいパスワードを入力してください。</p>
            <div className="center muted" style={{ display: 'flex', gap: '0.571429rem', justifyContent: 'center' }}><Icon name="mail" />{m}</div>
            <div className="field">
              <input type={p.s1 ? 'text' : 'password'} placeholder="パスワード" aria-label="パスワード" autoComplete="new-password" value={p.p1} onChange={(e) => setP({ ...p, p1: e.target.value })} />
              <button type="button" className="eye" aria-label="表示切替" onClick={() => setP({ ...p, s1: !p.s1 })}><Icon name={p.s1 ? 'eye' : 'eyeoff'} /></button>
            </div>
            <div className="field">
              <input type={p.s2 ? 'text' : 'password'} placeholder="パスワード（確認用）" aria-label="パスワード（確認用）" autoComplete="new-password" value={p.p2} onChange={(e) => setP({ ...p, p2: e.target.value })} />
              <button type="button" className="eye" aria-label="表示切替" onClick={() => setP({ ...p, s2: !p.s2 })}><Icon name={p.s2 ? 'eye' : 'eyeoff'} /></button>
            </div>
            {pwErr && <div className="err" role="alert">{pwErr}</div>}
            {err && <div className="err" role="alert">{err}</div>}
            <button type="button" className="btn pri" disabled={!!checkNewPassword(p.p1, p.p2) || busy} onClick={() => run(async () => { await api.action('setPassword', { id, code: code.join(''), password: p.p1 }); setStep(4); })}>確認 <Icon name="check" /></button>
            <div className="center"><button type="button" className="link" onClick={toLogin}>ログイン画面に戻る</button></div>
          </>
        )}
      </div>
    </div>
  );
}
