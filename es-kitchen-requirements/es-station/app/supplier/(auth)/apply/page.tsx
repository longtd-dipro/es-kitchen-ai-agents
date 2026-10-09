'use client';

import Link from 'next/link';
import { useState } from 'react';
import { api, type ApplicationForm } from '@/lib/api/supplier';
import { errorMessage } from '@/lib/api/errors';
import { MAIL_RE } from '@/lib/supplier/orders';
import { R } from '@/lib/supplier/routes';
import { useLeaveGuard } from '@/lib/ui/leaveGuard';
import { AuthCard, MiniSteps } from '../../_components/AuthCard';
import { Field, Notice } from '../../_components/ui';

/** [キー, 項目名, 必須, 入力例] */
const AF: [string, string, boolean, string][] = [
  ['company', '会社名（法人名）', true, '株式会社サンプルフーズ'], ['companyKana', '会社名フリガナ', true, 'カブシキガイシャ サンプルフーズ'], ['rep', '代表者名', true, '山田 太郎'],
  ['zip', '郵便番号', true, '103-0027'], ['addr', '本社住所', true, '東京都中央区日本橋1-2-3'], ['tel', '代表電話番号', true, '03-0000-0000'],
  ['pic', '担当者名', true, '佐藤 直樹'], ['picKana', '担当者フリガナ', true, 'サトウ ナオキ'], ['mail', '担当者メールアドレス', true, 'n.sato@example.jp'], ['picTel', '担当者電話番号', true, '090-0000-0000'],
];
const GOODS = ['惣菜', '弁当', '肉類', '魚類', 'サラダ・スープ', 'パン・ごはん', 'おにぎり・サンドイッチ', '甘味・ドリンク', '資材（箸・容器など）'];
type Form = Record<string, string>;

/** S03 申込フォーム（入力 → 確認 → 完了） */
export default function ApplyPage() {
  const [step, setStep] = useState(1);
  const [a, setA] = useState<Form>({} as Form);
  const [goods, setGoods] = useState<string[]>([]);
  const [agree, setAgree] = useState(false);
  const [e, setE] = useState<Record<string, string>>({});
  const [receiptNo, setReceiptNo] = useState('');
  const [busy, setBusy] = useState(false);
  const ro = step === 2;
  const set = (k: string) => (ev: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setA({ ...a, [k]: ev.target.value });
  /* 入力中に画面を離れるときの確認（Q02・全サイト共通）：送る前に何か入れたまま ブラウザを閉じる／再読み込み（ログイン前の画面なのでサイドメニューはない） */
  useLeaveGuard(step < 3 && (Object.values(a).some((v) => !!v) || goods.length > 0 || agree));

  const next = () => {
    const er: Record<string, string> = {};
    AF.forEach(([k, l]) => { if (!(a[k] || '').trim()) er[k] = `${l}を入力してください`; });
    if (a.mail && !MAIL_RE.test(a.mail)) er.mail = 'メールアドレスの形式で入力してください';
    if (!a.biz) er.biz = '選択してください';
    if (!a.kind) er.kind = '選択してください';
    if (!goods.length) er.goods = '1つ以上選択してください';
    if (!agree) er.agree = '同意が必要です';
    setE(er);
    if (Object.keys(er).length) return;
    setStep(2);
    window.scrollTo(0, 0);
  };

  const send = async () => {
    setBusy(true);
    try {
      const form = { ...a, goods, memo: a.memo ?? '', cert: a.cert ?? '' } as unknown as ApplicationForm;
      setReceiptNo((await api.submitApplication(form)).receiptNo);
      setStep(3);
      window.scrollTo(0, 0);
    } catch (ex) {
      setE({ agree: errorMessage(ex) });
    } finally {
      setBusy(false);
    }
  };

  const input = ([k, l, r, ph]: (typeof AF)[number]) => (
    <Field key={k} label={l} req={r} err={e[k]}>
      <input className={`inp ${e[k] ? 'err' : ''}`} value={a[k] || ''} placeholder={`例）${ph}`} readOnly={ro} onChange={set(k)} />
    </Field>
  );

  return (
    <AuthCard title="仕入先 取引のお申し込み" wide>
      <MiniSteps steps={['入力', '確認', '完了']} cur={step} />
      {step < 3 ? (
        <>
          {ro && <Notice kind="pur" style={{ marginBottom: '1.142857rem' }}>内容をご確認のうえ、「この内容で申し込む」を押してください。</Notice>}
          <div className="formsec">
            <h3>① 会社情報</h3>
            <div className="fg">
              {AF.slice(0, 6).map(input)}
              <Field label="土日祝を営業日とするか" req err={e.biz} hint="本発注の未処理アラート（24時間ごと）で、営業日の数え方に使います">
                <select className={`sel ${e.biz ? 'err' : ''}`} value={a.biz || ''} disabled={ro} onChange={set('biz')}>
                  <option value="">選択してください</option>
                  {['はい', 'いいえ'].map((x) => <option key={x}>{x}</option>)}
                </select>
              </Field>
            </div>
          </div>
          <div className="formsec">
            <h3>② 担当者情報</h3>
            <div className="fg">{AF.slice(6).map(input)}</div>
          </div>
          <div className="formsec">
            <h3>③ 取扱商品情報</h3>
            <div className="fg">
              <Field label="仕入れ先区分" req err={e.kind} hint="主に扱う区分を選んでください。区分は商品ごとに決まり、1社で通常商品と短消費期限商品の両方を扱えます">
                <select className={`sel ${e.kind ? 'err' : ''}`} value={a.kind || ''} disabled={ro} onChange={set('kind')}>
                  <option value="">選択してください</option>
                  {['通常商品', '短消費期限商品', '資材'].map((x) => <option key={x}>{x}</option>)}
                </select>
              </Field>
              <Field label="作れる商品（複数選択可）" req err={e.goods}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.428571rem 1rem' }}>
                  {GOODS.map((g) => (
                    <label className="chk" key={g}>
                      <input type="checkbox" checked={goods.includes(g)} disabled={ro} onChange={(ev) => setGoods(ev.target.checked ? [...goods, g] : goods.filter((x) => x !== g))} />
                      {g}
                    </label>
                  ))}
                </div>
              </Field>
              <Field label="主な取扱商品・得意分野" full opt>
                <textarea className="inp" readOnly={ro} placeholder="例）冷蔵惣菜（煮物・焼き物）の製造。ロット6個単位。" value={a.memo || ''} onChange={set('memo')} />
              </Field>
              <Field label="保有している許可・認証" full opt>
                <input className="inp" readOnly={ro} placeholder="例）食品製造業許可、HACCP" value={a.cert || ''} onChange={set('cert')} />
              </Field>
            </div>
          </div>
          <div className="chk" style={{ margin: '0.285714rem 0 1.142857rem' }}>
            <input type="checkbox" id="agree" checked={agree} disabled={ro} onChange={(ev) => setAgree(ev.target.checked)} />
            <label htmlFor="agree">取引条件・個人情報の取り扱いに同意します</label>
          </div>
          {e.agree && <div className="errmsg" style={{ marginTop: '-0.571429rem', marginBottom: '0.857143rem' }}>{e.agree}</div>}
          <div style={{ display: 'flex', gap: '0.857143rem', justifyContent: 'flex-end' }}>
            {ro ? (
              <>
                <button className="btn lg" onClick={() => setStep(1)}>修正する</button>
                <button className="btn pri lg" disabled={busy} onClick={send}>この内容で申し込む</button>
              </>
            ) : (
              <button className="btn pri lg" onClick={next}>確認画面へ</button>
            )}
          </div>
        </>
      ) : (
        <>
          <Notice kind="pur" icon="mail">
            お申し込みを受け付けました（受付番号：{receiptNo}）。運営が内容を確認し、承認後にアカウントを発行します。結果はご担当者のメールアドレスにご連絡します。
          </Notice>
          <Link href={R.login} className="btn pri lg" style={{ marginTop: '1.142857rem', textDecoration: 'none' }}>ログイン画面へ戻る</Link>
        </>
      )}
    </AuthCard>
  );
}
