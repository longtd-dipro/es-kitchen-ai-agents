'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { PASSWORD_HINT } from '@/lib/auth/rules';
import { checkNewPassword } from '@/lib/carrier/logic';
import { Icon } from '../_ui/Icon';
import { useCarrier } from '../_ui/CarrierProvider';

/** パスワード再設定（元の pw()・OW_AUTH_002）。1＝ID・メール → 2＝認証コード → 3＝新しいパスワード → 4＝完了 */
export default function CarrierPassword() {
  const { toast, login, toastError } = useCarrier();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [rid, setRid] = useState('');
  const [rmail, setRmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '']);
  const [np, setNp] = useState({ a: '', c: '', showA: false, showC: false });
  const [hint, setHint] = useState('');
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (step === 2) refs.current[0]?.focus();
  }, [step]);

  const toStep2 = () => {
    if (!rid || !rmail) return toast('ログインIDとメールアドレスを入力してください');
    setStep(2);
  };
  const toStep4 = () => {
    const m = checkNewPassword(np.a, np.c);
    if (m) return setHint(m);
    setStep(4);
  };
  const home = async () => {
    try {
      await login(rid, np.a);
      router.push('/carrier');
    } catch (e) {
      toastError(e);
      router.push('/carrier/login');
    }
  };

  let body;
  if (step === 1) body = (
    <>
      <h1>パスワード再設定</h1>
      <p className="lead">登録済みのメールアドレスを入力してください。<br />再設定用認証コードをお送りします。</p>
      <div className="fld"><label htmlFor="rid">ログインID</label><input className="inp" id="rid" placeholder="ログインID" value={rid} onChange={(e) => setRid(e.target.value)} /></div>
      <div className="fld"><label htmlFor="rmail">メールアドレス</label><input className="inp" id="rmail" type="email" placeholder="メールアドレス" value={rmail} onChange={(e) => setRmail(e.target.value)} /></div>
      <button type="button" className="cta" onClick={toStep2}>認証コードを送信</button>
    </>
  );
  if (step === 2) body = (
    <>
      <h1>認証コードを入力してください。</h1>
      <p className="lead">パスワード再設定用メールを送信しました。<br />下記のメールアドレスをご確認ください。</p>
      <div className="mail"><Icon name="mail" />eskitchen@sample.com</div>
      <div className="otp">
        {otp.map((v, i) => (
          <input
            key={i} ref={(el) => { refs.current[i] = el; }} inputMode="numeric" maxLength={1} aria-label={`認証コード${i + 1}桁目`} className={v ? 'filled' : ''} value={v}
            onChange={(e) => {
              const x = e.target.value.replace(/\D/g, '');
              const next = otp.map((o, j) => (j === i ? x : o));
              setOtp(next);
              if (x && refs.current[i + 1]) refs.current[i + 1]!.focus();
            }}
            onKeyDown={(e) => { if (e.key === 'Backspace' && !v && refs.current[i - 1]) refs.current[i - 1]!.focus(); }}
          />
        ))}
      </div>
      <p className="lead" style={{ fontSize: '1rem' }}>
        コードが届かない場合： <button type="button" className="linkbtn" onClick={() => toast('認証コードを再送信しました')}>再送信</button><br />※認証コードの有効期限は5分です。
      </p>
      <button type="button" className="cta" disabled={!otp.every(Boolean)} onClick={() => setStep(3)}>確認</button>
    </>
  );
  if (step === 3) body = (
    <>
      <h1 style={{ fontWeight: 500 }}>パスワード再設定</h1>
      <div className="mail"><Icon name="mail" />eskitchen@sample.com</div>
      <div className="fld">
        <label htmlFor="np1">新しいパスワード</label>
        <div className="pw"><input className="inp" id="np1" type={np.showA ? 'text' : 'password'} placeholder="パスワードを入力してください" value={np.a} onChange={(e) => setNp({ ...np, a: e.target.value })} /><button type="button" aria-label="表示" onClick={() => setNp({ ...np, showA: !np.showA })}><Icon name="eye" /></button></div>
      </div>
      <div className="fld">
        <label htmlFor="np2">パスワード（確認用）</label>
        <div className="pw"><input className="inp" id="np2" type={np.showC ? 'text' : 'password'} placeholder="パスワードを入力してください" value={np.c} onChange={(e) => setNp({ ...np, c: e.target.value })} /><button type="button" aria-label="表示" onClick={() => setNp({ ...np, showC: !np.showC })}><Icon name="eye" /></button></div>
      </div>
      <div className="hint" style={hint ? { color: 'var(--red)' } : undefined}>{hint || `・${PASSWORD_HINT}`}</div>
      <button type="button" className="cta" onClick={toStep4}>確認</button>
    </>
  );
  if (step === 4) body = (
    <>
      <h1>パスワード再設定</h1>
      <div className="done-mark"><Icon name="check" /></div>
      <p className="lead">パスワードの再設定が完了し、ログインしました。<br />そのままご利用いただけます。</p>
      <button type="button" className="cta" onClick={home}>ホーム画面へ</button>
    </>
  );
  return (
    <div className="auth">
      <div className="auth-card">
        <div className="brand" role="img" aria-label="ES STATION" />
        {body}
        {step < 4 && <div style={{ textAlign: 'center' }}><Link className="linkbtn" href="/carrier/login">ログイン画面に戻る</Link></div>}
      </div>
    </div>
  );
}
