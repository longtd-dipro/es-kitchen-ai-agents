'use client';

import type { CSSProperties, ReactNode } from 'react';
import { Icon } from './Icon';
import { useOps } from './OpsProvider';
import { opsCls } from '@/lib/format/status';
import { rem } from '@/lib/ui/rem';

/* 運営Web の共通部品。クラス名は ops.css（10_運営_まとめ.html と同じ） */

/** 状態の文字に合う色（全サイト共通の表 lib/format/status.ts。表にない文字は灰） */
export function badgeCls(v: string): string {
  return opsCls(v);
}

export function Badge({ v, cls, title }: { v: ReactNode; cls?: string; title?: string }) {
  if (v === '' || v === null || v === undefined) return null;
  return <span className={`badge ${cls ?? badgeCls(String(v))}`} title={title}>{v}</span>;
}

export function PageHead({ crumbs, title, children }: { crumbs: string[]; title: string; children?: ReactNode }) {
  return (
    <div className="ph">
      <div>
        <div className="crumb">{crumbs.map((c, i) => <span key={i}>{c}</span>)}</div>
        <h1>{title}</h1>
      </div>
      {children && <div className="btns">{children}</div>}
    </div>
  );
}

export function Notice({ kind = '', children, style }: { kind?: '' | 'warn' | 'ng' | 'ok'; children: ReactNode; style?: CSSProperties }) {
  return (
    <div className={`notice ${kind}`} style={style}>
      <Icon name="warn" />
      <span>{children}</span>
    </div>
  );
}

/** 入力欄（元の fld：ラベル・必須の * ・ヒント・エラー） */
export function Field({ label, children, req, hint, err, className = '', htmlFor }: { label: ReactNode; children: ReactNode; req?: boolean; hint?: ReactNode; err?: string; className?: string; htmlFor?: string }) {
  return (
    <div className={`fld ${className}`}>
      <label htmlFor={htmlFor}>{label}{req && <span className="req">*</span>}</label>
      {hint && <span className="hint">{hint}</span>}
      {children}
      {err && <span className="emsg">{err}</span>}
    </div>
  );
}

/** 確認のダイアログ（元の modal()：削除・破棄の確認など） */
export function ConfirmModal({ kind = 'ng', title, text, ok, okCls = 'dan-solid', cancel = 'キャンセル', onOk }: { kind?: 'ng' | 'warn'; title: string; text: ReactNode; ok: string; okCls?: string; cancel?: string; onOk: () => void | Promise<void> }) {
  const { closeModal } = useOps();
  return (
    <div className="ov" onClick={(e) => e.target === e.currentTarget && closeModal()}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={title}>
        <div className={`mi ${kind}`}><Icon name={kind === 'ng' ? 'trash' : 'warn'} /></div>
        <h3>{title}</h3>
        <p>{text}</p>
        <div className="mb">
          <button className="btn" onClick={closeModal} autoFocus>{cancel}</button>
          <button className={`btn ${okCls}`} onClick={async () => { closeModal(); await onOk(); }}>{ok}</button>
        </div>
      </div>
    </div>
  );
}

/** onClose：閉じる（×・外側）を押したときの動き（入力中の確認 Q02 を出すときに渡す。省略＝そのまま閉じる） */
export function Modal({ title, width = 720, children, footer, onClose }: { title: string; width?: number; children: ReactNode; footer?: ReactNode; onClose?: () => void }) {
  const { closeModal } = useOps();
  const close = onClose ?? closeModal;
  return (
    <div className="ov" onClick={(e) => e.target === e.currentTarget && close()}>
      <div className="mbox" style={{ width: `min(${rem(width)},100%)` }} role="dialog" aria-modal="true" aria-label={title}>
        <div className="mbox-h">
          <h3>{title}</h3>
          <button className="icon-btn" onClick={close} aria-label="閉じる"><Icon name="x" /></button>
        </div>
        <div className="mbox-b">{children}</div>
        {footer && <div className="mbox-f">{footer}</div>}
      </div>
    </div>
  );
}

/** 金額（例：12,345円）。全サイト共通の lib/format/money */
export { yen } from '@/lib/format/money';
