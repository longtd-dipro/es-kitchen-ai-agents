'use client';

import { useRouter } from 'next/navigation';
import { apply1Ok } from '@/lib/carrier/logic';
import type { ApplyContact, ApplyForm } from '@/lib/carrier/types';
import { useLeaveGuard } from '@/lib/ui/leaveGuard';
import { Icon } from '../_ui/Icon';
import { REG2_EMPTY, useCarrier } from '../_ui/CarrierProvider';
import { DiscardDialog } from '../_ui/CarrierShell';
import { Collap, ZipButton } from '../_ui/parts';
import { PubWrap, RegHead } from './_parts';

/** 申し込みフォーム 1/2（元の reg1・R01）：基本情報・担当者 */
export default function CarrierApply1() {
  const { reg, setReg, setReg2, openModal } = useCarrier();
  const router = useRouter();
  const contacts: ApplyContact[] = reg.contacts?.length ? reg.contacts : [{ k: 'メイン担当者' }];
  /* 入力中に画面を離れるときの確認（Q02・全サイト共通）：何か入れたまま キャンセル・ブラウザを閉じる／再読み込み */
  const dirty = Object.entries(reg).some(([k, v]) => (k === 'contacts' ? contacts.some((c) => !!(c.n || c.f || c.m || c.t)) : !!v));
  useLeaveGuard(dirty);
  const cancel = () => {
    const go = () => { setReg({}); setReg2(REG2_EMPTY); router.push('/carrier/login'); };
    if (dirty) openModal(<DiscardDialog onOk={go} />); else go();
  };
  const set = (k: keyof ApplyForm, v: string) => setReg({ ...reg, [k]: v });
  const setC = (i: number, k: keyof ApplyContact, v: string) => setReg({ ...reg, contacts: contacts.map((c, j) => (j === i ? { ...c, [k]: v } : c)) });
  const inp = (k: keyof ApplyForm, l: string, req: boolean, cls = '', style?: React.CSSProperties) => (
    <div className={`fld ${cls}`} style={style}>
      <label htmlFor={`r_${k}`}>{l}{req && <span className="req">*</span>}</label>
      <input className="inp" id={`r_${k}`} placeholder={l} value={String(reg[k] ?? '')} onChange={(e) => set(k, e.target.value)} />
    </div>
  );
  const ok = apply1Ok({ ...reg, contacts });
  return (
    <PubWrap>
      <div className="reg">
        <RegHead step={1} />
        <form className="reg-body" noValidate onSubmit={(e) => { e.preventDefault(); if (ok) router.push('/carrier/apply/2'); }}>
          <Collap title="基本情報">
            <div className="grid3">
              {inp('name', '委託配送先名', true)}{inp('kana', 'カナ', false)}<span />
              <div style={{ display: 'flex', gap: '0.857143rem', alignItems: 'flex-end', minWidth: 0 }}>{inp('zip', '郵便番号', true, '', { flex: 1 })}<ZipButton /></div>
              {inp('pref', '都道府県', true)}{inp('city', '市区町村', true)}
              {inp('addr', '町域・番地', true)}{inp('bld', '建物・部屋番号', false, 'span2')}{inp('tel', '電話番号', true)}{inp('fax', 'FAX番号', false)}
            </div>
          </Collap>
          <Collap title="担当者">
            <div className="tbl-wrap">
              <table className="tbl">
                <thead><tr><th>区分 <span className="req">*</span></th><th>担当者名 <span className="req">*</span></th><th>フリガナ</th><th>メールアドレス <span className="req">*</span></th><th>TEL <span className="req">*</span></th><th>操作</th></tr></thead>
                <tbody>
                  {contacts.map((c, i) => (
                    <tr key={i}>
                      <td><select className="inp" aria-label="区分" value={c.k} onChange={(e) => setC(i, 'k', e.target.value)}><option>メイン担当者</option><option>サブ担当者</option></select></td>
                      <td><input className="inp" placeholder="担当者名" aria-label="担当者名" value={c.n ?? ''} onChange={(e) => setC(i, 'n', e.target.value)} /></td>
                      <td><input className="inp" placeholder="フリガナ" aria-label="フリガナ" value={c.f ?? ''} onChange={(e) => setC(i, 'f', e.target.value)} /></td>
                      <td><input className="inp" type="email" placeholder="メールアドレス" aria-label="メールアドレス" value={c.m ?? ''} onChange={(e) => setC(i, 'm', e.target.value)} /></td>
                      <td><input className="inp" placeholder="TEL" aria-label="電話番号" value={c.t ?? ''} onChange={(e) => setC(i, 't', e.target.value)} /></td>
                      <td><button type="button" className="x" style={{ color: 'var(--red)' }} aria-label="行を削除" disabled={contacts.length < 2} onClick={() => setReg({ ...reg, contacts: contacts.filter((_, j) => j !== i) })}><Icon name="trash" /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div><button type="button" className="btn out" onClick={() => setReg({ ...reg, contacts: [...contacts, { k: 'サブ担当者' }] })}>行を追加</button></div>
          </Collap>
          <div style={{ display: 'flex', gap: '1.714286rem', width: 'min(43.857143rem,100%)' }}>
            <button type="button" className="btn lg" onClick={cancel}>キャンセル</button>
            <button className="btn lg pri" disabled={!ok}>次へ</button>
          </div>
        </form>
      </div>
    </PubWrap>
  );
}
