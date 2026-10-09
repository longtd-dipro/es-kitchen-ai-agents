'use client';

import { useMemo, type CSSProperties, type ReactNode } from 'react';
import { DEMO } from '@/lib/demo';
import type { Who } from '@/lib/corp/docs/types';
import { useCorpSignedIn } from '../_ui/CorpProvider';
import { DOC_ICONS } from './dsIcons';
import { fmtDatesIn, fmtTextNode } from '@/lib/format/date';
import { esTone } from '@/lib/format/status';
import { rem } from '@/lib/ui/rem';

/*
 * 請求書・棚卸報告・売上の画面の部品。元のデモの ES Kitchen（window.ESKitchen）の部品と同じ形（クラスは app/corp/corp.css と app/corp/_docs/docs.css）。
 */

export function Icon({ name, size = 20 }: { name: string; size?: number }) {
  const d = DOC_ICONS[name];
  if (!d) return null;
  return (
    <svg className="es-icon" width={size} height={size} viewBox="0 0 32 32" fill="currentColor" aria-hidden="true">
      {d.map((s, i) => <path key={i} transform={`translate(${s[0]} ${s[1]})`} d={s[2]} fillRule={s[3] ? 'evenodd' : 'nonzero'} />)}
    </svg>
  );
}

export function Badge({ tone = 'neutral', children }: { tone?: string; children: ReactNode }) {
  /* 状態の文字なら共通の色（lib/format/status.ts） */
  return <span className={`es-badge es-badge--${esTone(children, tone)}`}>{children}</span>;
}

type BtnProps = { variant?: 'solid' | 'outline' | 'ghost'; tone?: 'primary' | 'neutral' | 'negative'; size?: 'sm' | 'md' | 'lg'; icon?: string; block?: boolean; onClick?: () => void; disabled?: boolean; children?: ReactNode; className?: string };
export function Button({ variant = 'solid', tone = 'primary', size = 'md', icon, block, onClick, disabled, children, className }: BtnProps) {
  return (
    <button type="button" className={`es-btn es-btn--${variant} es-btn--${tone} es-btn--${size}${icon && !children ? ' es-btn--icon' : ''}${block ? ' es-btn--block' : ''}${className ? ' ' + className : ''}`} onClick={onClick} disabled={disabled}>
      {icon ? <Icon name={icon} size={size === 'lg' ? 24 : 20} /> : null}{children ? <span>{children}</span> : null}
    </button>
  );
}

/** カード＋見出し（元の card(title, action, children)） */
export function Card({ title, action, children }: { title: ReactNode; action?: ReactNode; children?: ReactNode }) {
  return (
    <section className="es-card">
      <div className="es-section-title"><h2>{title}</h2>{action ? <div>{action}</div> : null}</div>
      {children}
    </section>
  );
}

export function Inline({ tone = 'info', title, children, style }: { tone?: 'info' | 'success' | 'warning' | 'negative'; title?: ReactNode; children?: ReactNode; style?: CSSProperties }) {
  const icon = { info: 'BellSimple', success: 'Checks', warning: 'ClockCountdown', negative: 'X' }[tone];
  return (
    <div className={`es-inline es-inline--${tone}`} role={tone === 'negative' ? 'alert' : 'status'} style={style}>
      <Icon name={icon} size={18} />
      <div>{title ? <strong>{title}</strong> : null}<div>{children}</div></div>
    </div>
  );
}

const show = (v: string | null | undefined) => (v === null || v === undefined || v === '' ? '—' : v);
/** 読み取り専用の欄（元の ro） */
export function Ro({ label, value, className }: { label: ReactNode; value: string | null | undefined; className?: string }) {
  return (
    <div className={`es-field${className ? ' ' + className : ''}`}>
      <label className="es-field__label">{label}</label>
      <div className="es-input es-input--md es-input--readonly"><input type="text" readOnly value={show(value == null ? value : fmtDatesIn(value))} title={value ?? undefined} /></div>
    </div>
  );
}
/** 読み取り専用の文章（元の roText。長い文は折り返す） */
export function RoText({ label, children, className }: { label: ReactNode; children: ReactNode; className?: string }) {
  return <div className={`es-field${className ? ' ' + className : ''}`}><label className="es-field__label">{label}</label><div className="ro">{fmtTextNode(children)}</div></div>;
}
/** 読み取り専用のバッジ（元の roBadge） */
export function RoBadge({ label, text, tone }: { label: ReactNode; text: string; tone: string }) {
  return (
    <div className="es-field">
      <label className="es-field__label">{label}</label>
      <div className="ro" style={{ height: '2.857143rem', boxSizing: 'border-box', padding: '0 0.857143rem', display: 'flex', alignItems: 'center', gap: '0.571429rem' }}><Badge tone={tone}>{text}</Badge></div>
    </div>
  );
}

export type Col = { label: ReactNode; cls?: string; w?: number };
/** 表（元の table(cols, rows, opt)） */
export function Table({ cols, children, compact, cls }: { cols: Col[]; children: ReactNode; compact?: boolean; cls?: string }) {
  return (
    <div className="es-table-wrap">
      <table className={`es-table${compact ? ' compact' : ''}${cls ? ' ' + cls : ''}`}>
        <thead><tr>{cols.map((c, i) => <th key={i} className={c.cls} style={c.w ? { width: rem(c.w) } : undefined}>{c.label}</th>)}</tr></thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}
/** 表のセル（空は —。文字は title にも入れる） */
export function Td({ v, cls }: { v: ReactNode; cls?: string }) {
  return <td className={cls} title={typeof v === 'string' ? v : undefined}>{v === '' || v === null || v === undefined ? '—' : fmtTextNode(v)}</td>;
}

export function Breadcrumb({ items }: { items: ReactNode[] }) {
  return (
    <nav className="es-breadcrumb" aria-label="パンくず">
      {items.map((it, i) => (
        <span key={i} style={{ display: 'contents' }}>
          {i ? <span className="es-breadcrumb__sep" aria-hidden="true">/</span> : null}
          {i === items.length - 1 ? <span aria-current="page" className="es-breadcrumb__cur">{it}</span> : it}
        </span>
      ))}
    </nav>
  );
}

/** 大きいダイアログ（元の E.Dialog） */
export function Dialog({ title, id, width, onClose, footer, children }: { title: ReactNode; id?: string; width?: number; onClose: () => void; footer?: ReactNode; children: ReactNode }) {
  return (
    <div className="es-dialog">
      <div className="es-dialog__scrim" onClick={onClose} />
      <div className="es-dialog__panel" role="dialog" aria-modal="true" aria-label={typeof title === 'string' ? title : undefined} style={{ width: rem(width) }}>
        <div className="es-dialog__head">
          <h2>{title}{id ? <span className="es-mono es-dialog__id">{id}</span> : null}</h2>
          <button type="button" className="es-dialog__close" aria-label="閉じる" onClick={onClose}><Icon name="X" size={22} /></button>
        </div>
        <div className="es-dialog__body">{children}</div>
        {footer ? <div className="es-dialog__foot"><b />{footer}</div> : null}
      </div>
    </div>
  );
}

/** 標準の空表示（ESKitchen.EmptyState）：アイコン・タイトル・本文・ボタン。compact＝一覧の中の0件（タイトルだけ・余白を小さく） */
export function EmptyState({ title, icon, compact, action, children }: { title: ReactNode; icon?: string; compact?: boolean; action?: ReactNode; children?: ReactNode }) {
  return (
    <div className={`es-empty${compact ? ' es-empty--compact' : ''}`}>
      {icon ? <span className="es-empty__icon"><Icon name={icon} size={28} /></span> : null}
      <b>{title}</b>
      {children ? <div className="es-empty__desc">{children}</div> : null}
      {action ? <div className="es-empty__act">{action}</div> : null}
    </div>
  );
}

/** 読み込み中（白い画面にしない） */
export function LoadingState() {
  return <EmptyState title="読み込み中…" compact />;
}
/** 読み込めなかったとき（E346：通信・サーバーのエラー。「見つかりません」とは別。再読み込みのボタンつき） */
export function LoadError({ onRetry, onBack, backLabel }: { onRetry: () => void; onBack?: () => void; backLabel?: string }) {
  return (
    <Inline tone="negative" title="読み込めませんでした。">
      時間をおいて再度お試しください。
      <div style={{ marginTop: '0.571429rem', display: 'flex', gap: '0.571429rem' }}>
        <Button variant="outline" size="sm" onClick={onRetry}>再読み込み</Button>
        {onBack ? <Button variant="outline" size="sm" onClick={onBack}>{backLabel ?? '戻る'}</Button> : null}
      </div>
    </Inline>
  );
}

/** 選択（元の sel：es-select） */
export function Sel({ id, value, opts, onChange, minWidth = 220 }: { id?: string; value: string; opts: [string, string][]; onChange: (v: string) => void; minWidth?: number }) {
  return (
    <div className="es-input es-select es-input--md" style={{ minWidth: rem(minWidth) }}>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)}>
        {opts.map(([v, t]) => <option key={v} value={v}>{t}</option>)}
      </select>
      <Icon name="CaretDown" size={16} />
    </div>
  );
}

/** ログイン中のアカウント（queries・actions に渡す） */
export function useWho(): Who {
  const { account } = useCorpSignedIn();
  return useMemo(() => ({ corpId: account.corpId, branchId: account.branchId, role: account.role }), [account.corpId, account.branchId, account.role]);
}

/**
 * この区切りの画面の外枠。元の部品は iframe の中で es-shell__content（左右 24px・下 24px・間 16px）の余白を持っていた。
 * 解約後（参照のみ）は元と同じお知らせを上に出す（RV2-CORP-20261002 S4-3）。
 */
export function DocsPage({ children, className }: { children: ReactNode; className?: string }) {
  const { view, roTitle } = useCorpSignedIn();
  const body = className ? <div className={className}>{children}</div> : children;
  return (
    <div className="corp-docs">
      <div className="es-shell__content">
        {view === 'ro' ? (
          <div>
            <div style={{ margin: '0 0 1.142857rem' }}>
              <Inline tone="warning" title={roTitle}>
                入金期限の翌日にアカウントを停止し、メールでお知らせします。参照のみの期間は、編集・お申し込みはできません（棚卸報告は最終請求書のためにご入力いただけます）。請求担当者だけは最終請求まで変更できます（拠点詳細の「編集」から）。{DEMO ? '（デモ：大阪支店を解約後の拠点として表示。ボタンは押せるままです）' : ''}
              </Inline>
            </div>
            {body}
          </div>
        ) : body}
      </div>
    </div>
  );
}
