'use client';

import type { ReactNode } from 'react';
import { useSupplier } from '@/lib/supplier/store';
import { fmtAutoNode } from '@/lib/format/date';
import { opsCls, statusGroup } from '@/lib/format/status';
import { rem } from '@/lib/ui/rem';

/* ===== アイコン ===== */
const ICONS = {
  home: <path d="M3 11l9-8 9 8M5 10v10h14V10" />,
  box: <path d="M21 8l-9-5-9 5v8l9 5 9-5zM3 8l9 5 9-5M12 13v8" />,
  down: <path d="M12 3v12m0 0l-5-5m5 5l5-5M4 21h16" />,
  /* CSV取込（down の上向き） */
  upl: <path d="M12 15V3m0 0l-5 5m5-5l5 5M4 21h16" />,
  user: <><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 4-6 8-6s8 2 8 6" /></>,
  cal: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /></>,
  book: <path d="M4 4h12a4 4 0 014 4v12H8a4 4 0 01-4-4zM4 16a4 4 0 014-4h12" />,
  bell: <path d="M6 17V11a6 6 0 1112 0v6l2 2H4zM10 21h4" />,
  chev: <path d="m6 9 6 6 6-6" />,
  warn: <path d="M12 3l10 18H2zM12 10v5M12 18v.01" />,
  mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></>,
  truck: <path d="M3 6h11v10H3zM14 9h4l3 3v4h-7M7 19a2 2 0 100-4 2 2 0 000 4zM17 19a2 2 0 100-4 2 2 0 000 4z" />,
  menu: <path d="M4 6h16M4 12h16M4 18h16" />,
  x: <path d="M6 6l12 12M18 6L6 18" />,
};
export type IconName = keyof typeof ICONS;

export function Icon({ name, className }: { name: IconName; className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {ICONS[name]}
    </svg>
  );
}

/* ===== バッジ ===== */
const BADGE: Record<string, string> = {
  納期回答待ち: 'b-warn', キャンセル: 'b-ng', 納期回答済: 'b-info', 出荷済: 'b-ok', 本発注待ち: 'b-mute', 出荷可: 'b-pur', 未入荷: 'b-mute', 入荷済: 'b-ok',
  短消費期限: 'b-warn', 資材: 'b-info', 通常: 'b-mute', 本登録: 'b-ok', 仮発注: 'b-mute', 本発注: 'b-pur', 受注不可: 'b-ng', 却下: 'b-ng',
  一部出荷済: 'b-info', 本発注の承認待ち: 'b-warn', 未出荷: 'b-mute',
};
export function Badge({ v, cls, title }: { v: ReactNode; cls?: string; title?: string }) {
  /* 状態の文字なら共通の色（lib/format/status.ts）。種類の札（短消費期限・資材など）は BADGE */
  return <span className={`badge ${cls ?? (statusGroup(v, 'supplier') ? opsCls(v, 'b-mute', 'supplier') : BADGE[String(v)] ?? 'b-mute')}`} title={title}>{v}</span>;
}

/* ===== お知らせの帯 ===== */
export function Notice({ kind = '', icon = 'warn', children, style }: { kind?: '' | 'warn' | 'ng' | 'pur'; icon?: IconName; children: ReactNode; style?: React.CSSProperties }) {
  return (
    <div className={`notice ${kind}`} style={style}>
      <Icon name={icon} />
      <span>{children}</span>
    </div>
  );
}

/* ===== 入力欄（ラベル・必須・ヒント・エラー） ===== */
export function Field({ label, children, req, opt, hint, err, full }: { label: ReactNode; children: ReactNode; req?: boolean; opt?: boolean; hint?: ReactNode; err?: string; full?: boolean }) {
  return (
    <div className={`fld ${full ? 'full' : ''}`}>
      <label>
        {label}
        {req && <span className="req">必須</span>}
        {opt && <span className="opt">任意</span>}
      </label>
      {children}
      {hint && <div className="hint">{hint}</div>}
      {err && <div className="errmsg">{err}</div>}
    </div>
  );
}

export function KV({ l, children }: { l: string; children?: ReactNode }) {
  return (
    <div className="kv">
      <small>{l}</small>
      <b>{children === undefined || children === null || children === '' ? '—' : fmtAutoNode(children)}</b>
    </div>
  );
}

export function PageHead({ crumbs, title, children }: { crumbs: string[]; title: string; children?: ReactNode }) {
  return (
    <div className="ph">
      <div>
        <div className="crumb">{crumbs.map((c) => <span key={c}>{c}</span>)}</div>
        <h1>{title}</h1>
      </div>
      <div className="btns">{children}</div>
    </div>
  );
}

/* ===== モーダル ===== */
export function Modal({ title, width = 720, children, footer }: { title: string; width?: number; children: ReactNode; footer: ReactNode }) {
  const { closeModal } = useSupplier();
  return (
    <div className="ov" onClick={(e) => e.target === e.currentTarget && closeModal()}>
      <div className="mbox" style={{ width: `min(${rem(width)},100%)` }} role="dialog" aria-modal="true" aria-label={title}>
        <div className="mbox-h">
          <h3>{title}</h3>
          <button className="icon-btn" onClick={closeModal} aria-label="閉じる"><Icon name="x" /></button>
        </div>
        <div className="mbox-b">{children}</div>
        <div className="mbox-f">{footer}</div>
      </div>
    </div>
  );
}

export const NG_BTN: React.CSSProperties = { borderColor: 'var(--ng)', color: 'var(--ng)' };
