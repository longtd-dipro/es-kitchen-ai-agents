'use client';

import { useOpsLeaveGuard } from '@/app/ops/_ui/leaveGuard';
import { useEffect, type ReactNode } from 'react';
import { DsModal } from './ds';
import { fmtDatesIn } from '@/lib/format/date';

/* 代理入力（新規登録・変更申請）で使う欄。元：approve.js の fld・selH（クラスは fld・fl・rq・fh・er） */

export function Fld({ label, req, hint, err, wide, bad, hidden, children }: { label: string; req?: boolean; hint?: ReactNode; err?: string; wide?: boolean; bad?: boolean; hidden?: boolean; children: ReactNode }) {
  return (
    <div className={`fld${wide ? ' wide' : ''}${bad ? ' bad' : ''}${hidden ? ' hidden' : ''}`}>
      <div className="fl">{label}{req && <span className="rq">必須</span>}</div>
      {children}
      {hint && <div className="fh">{hint}</div>}
      {req && <div className="er">{err || label + 'を入力してください'}</div>}
    </div>
  );
}
export function Sel({ value, opts, ph, onChange, disabled }: { value: string; opts: (string | { v: string; t: string; disabled?: boolean })[]; ph?: string; onChange: (v: string) => void; disabled?: boolean }) {
  return (
    <select value={value} disabled={disabled} onChange={(e) => onChange(e.target.value)}>
      {ph && <option value="">{ph}</option>}
      {opts.map((o) => (typeof o === 'object'
        ? <option key={o.v} value={o.v} disabled={o.disabled}>{fmtDatesIn(o.t)}</option>
        : <option key={o} value={o}>{fmtDatesIn(o)}</option>))}
    </select>
  );
}
/** 途中で離れるとき、入力があれば破棄の確認を出す */
export function DiscardModal({ onCancel, onOk }: { onCancel: () => void; onOk: () => void }) {
  return (
    <DsModal tone="negative" title="編集内容を破棄しますか？" onCancel={onCancel} onConfirm={onOk} confirmLabel="破棄">
      編集中の内容は保存されません。<br />編集内容を破棄してもよろしいですか？
    </DsModal>
  );
}
/** 入力があるまま、ページを離れようとしたら止める */
export function useLeaveGuard(dirty: boolean) {
  useOpsLeaveGuard(dirty);
  useEffect(() => {
    const h = (e: BeforeUnloadEvent) => { if (dirty) e.preventDefault(); };
    window.addEventListener('beforeunload', h);
    return () => window.removeEventListener('beforeunload', h);
  }, [dirty]);
}
/** 未入力の欄までスクロールする */
export const scrollToBad = () => setTimeout(() => document.querySelector('.ops-applications #nf .fld.bad')?.scrollIntoView({ block: 'center' }), 0);
