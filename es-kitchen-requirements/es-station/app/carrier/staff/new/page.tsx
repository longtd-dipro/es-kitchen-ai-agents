'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import carrier from '@/lib/carrier/area';
import { checkStaff, type Errors } from '@/lib/carrier/logic';
import type { StaffDraft } from '@/lib/carrier/types';
import { areaApi } from '@/lib/ops/core/client';
import { useOpsLeaveGuard } from '@/lib/ui/leaveGuard';
import { useCarrierSignedIn } from '../../_ui/CarrierProvider';
import { Crumb } from '../../_ui/parts';
import { StaffForm } from '../_parts';

const EMPTY: StaffDraft = { name: '', kana: '', kbn: '社員', st: '有効', tel: '', email: '', lic: 0 };

/** 配送スタッフ登録（元の staffNew()・OW_SCHED_001）。運営の配送スタッフマスタにも足す */
export default function CarrierStaffNew() {
  const { company, account, toast, toastError } = useCarrierSignedIn();
  const router = useRouter();
  const [s, setS] = useState<StaffDraft>(EMPTY);
  const [errs, setErrs] = useState<Errors>({});
  const [busy, setBusy] = useState(false);
  useOpsLeaveGuard(!busy && JSON.stringify(s) !== JSON.stringify(EMPTY));
  const create = async () => {
    const x = checkStaff(s, !!s.lic);
    setErrs(x);
    if (Object.keys(x).length) return;
    setBusy(true);
    try {
      const r = await areaApi(carrier).action('createStaff', { company, draft: s });
      router.push(`/carrier/staff/${r.id}`);
      toast('配送スタッフを登録しました');
    } catch (e) {
      setBusy(false);
      toastError(e);
    }
  };
  return (
    <>
      <Crumb items={[['ホーム', '/carrier'], ['配送スタッフ', '/carrier/staff'], '配送スタッフ登録']} />
      <div className="phead">
        <h1 className="ptitle">配送スタッフ登録</h1>
        <div style={{ display: 'flex', gap: '0.857143rem' }}>
          <button type="button" className="btn" onClick={() => router.push('/carrier/staff')}>キャンセル</button>
          <button type="button" className="btn pri" disabled={busy} onClick={create}>登録</button>
        </div>
      </div>
      <div className="panel">
        <div className="tabs"><button type="button" className="on">基本情報</button><button type="button" disabled>担当配送情報</button><button type="button" disabled>変更履歴</button></div>
        <form noValidate onSubmit={(e) => { e.preventDefault(); create(); }}>
          <StaffForm s={s} edit isNew errs={errs} org={`${account.name}（${company}）・委託`} onChange={(p) => setS({ ...s, ...p })} />
        </form>
      </div>
    </>
  );
}
