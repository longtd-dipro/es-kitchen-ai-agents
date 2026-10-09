'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import carrier from '@/lib/carrier/area';
import { apply2Ok } from '@/lib/carrier/logic';
import { areaApi } from '@/lib/ops/core/client';
import type { ApplyForm2 } from '@/lib/carrier/types';
import { useLeaveGuard } from '@/lib/ui/leaveGuard';
import { REG2_EMPTY, useCarrier } from '../../_ui/CarrierProvider';
import { Collap } from '../../_ui/parts';
import { PubWrap, RegHead } from '../_parts';

const DAYS = ['月', '火', '水', '木', '金', '土', '日', '祝日'];

/** 申し込みフォーム 2/2（元の reg2・R02）：対応エリア・車両・設備情報・契約書への同意 */
export default function CarrierApply2() {
  const { reg, setReg, reg2, setReg2, toast, toastError } = useCarrier();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const f = reg2;
  const set = (p: Partial<ApplyForm2>) => setReg2({ ...f, ...p });
  /* 入力中に画面を離れるときの確認（Q02・全サイト共通）：1/2 か 2/2 に入力があるまま ブラウザを閉じる／再読み込み（「戻る」は入力を残したまま 1/2 へ） */
  useLeaveGuard(Object.values(reg).some((v) => (Array.isArray(v) ? v.length > 0 : !!v)) || JSON.stringify(f) !== JSON.stringify(REG2_EMPTY));
  const submit = async () => {
    if (!apply2Ok(f) || busy) return;
    setBusy(true);
    try {
      await areaApi(carrier).action('apply', { form1: reg, form2: f });
      setReg({});
      setReg2(REG2_EMPTY);
      router.push('/carrier/login');
      toast('お申し込みを受け付けました');
    } catch (e) {
      toastError(e);
    } finally {
      setBusy(false);
    }
  };
  const radios = (k: 'frz' | 'ref' | 'sp', l: string, o: string[]) => (
    <div className="fld" key={k}>
      <span className="lb">{l}<span className="req">*</span></span>
      <div className="radios">{o.map((x) => <label key={x}><input type="radio" name={k} value={x} checked={f[k] === x} onChange={() => set({ [k]: x })} />{x}</label>)}</div>
    </div>
  );
  return (
    <PubWrap>
      <div className="reg">
        <RegHead step={2} />
        <form className="reg-body" noValidate onSubmit={(e) => { e.preventDefault(); submit(); }}>
          <Collap title="対応エリア">
            <div className="fld">
              <label htmlFor="area">対応エリア<span className="req">*</span></label>
              <select className="inp" id="area" value={f.area} onChange={(e) => set({ area: e.target.value })}><option value="">対応エリア</option><option>東京</option><option>千葉</option><option>神奈川</option><option>大阪</option><option>北海道</option></select>
              <span className="hint">※一部でも対応可能なエリアを選択してください。</span>
            </div>
            <div className="fld">
              <span className="lb">配送不可曜日</span>
              <div className="checks">{DAYS.map((d) => <label key={d}><input type="checkbox" checked={f.ng.includes(d)} onChange={(e) => set({ ng: e.target.checked ? [...f.ng, d] : f.ng.filter((x) => x !== d) })} />{d}</label>)}</div>
            </div>
            <div className="fld"><label htmlFor="areaNote">対応エリアに関する備考</label><textarea className="inp" id="areaNote" placeholder="対応エリアに関する備考" value={f.areaNote} onChange={(e) => set({ areaNote: e.target.value })} /></div>
          </Collap>
          <Collap title="車両・設備情報">
            <div className="grid2">
              <div className="fld">
                <label htmlFor="car">保有車両<span className="req">*</span></label>
                <select className="inp" id="car" value={f.car} onChange={(e) => set({ car: e.target.value })}><option value="">保有車両</option><option>軽四車両</option><option>保冷車あり</option><option>冷凍車あり</option></select>
              </div>
              <span />
              {radios('frz', '冷凍ボックスのレンタル希望', ['不要', '要'])}
              {radios('ref', '冷蔵ボックスのレンタル希望', ['不要', '要'])}
              {radios('sp', '冷蔵保管スペース', ['あり', 'なし'])}
              <div className="fld"><label htmlFor="carNote">車両・設備情報に関する備考</label><textarea className="inp" id="carNote" value={f.carNote} onChange={(e) => set({ carNote: e.target.value })} /></div>
            </div>
          </Collap>
          <label style={{ display: 'flex', gap: '0.571429rem', alignItems: 'center' }}><input type="checkbox" checked={f.agree} onChange={(e) => set({ agree: e.target.checked })} />契約書に同意します。</label>
          <div style={{ display: 'flex', gap: '1.714286rem', width: 'min(43.857143rem,100%)' }}>
            <button type="button" className="btn lg" onClick={() => router.push('/carrier/apply')}>戻る</button>
            <button className="btn lg pri" disabled={!apply2Ok(f) || busy}>登録</button>
          </div>
        </form>
      </div>
    </PubWrap>
  );
}
