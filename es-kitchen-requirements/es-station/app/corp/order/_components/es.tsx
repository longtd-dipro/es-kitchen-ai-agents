'use client';

import { Children, cloneElement, isValidElement, useLayoutEffect, useRef, useState, type ChangeEvent, type ReactElement, type ReactNode } from 'react';
import { ES_ICONS } from './esIcons';
import { fmtAutoNode, fmtDatesIn } from '@/lib/format/date';
import { esTone } from '@/lib/format/status';
import { rem } from '@/lib/ui/rem';

/*
 * ES Kitchen デザインシステム（company-admin テーマ）の部品（部品/23 の ESKitchen と同じ HTML・クラス名）。
 * 見た目は corp.css（枠）と order.css（.corp-order の中だけ）。元は defaultValue（入力を持たない）の部品もあるが、ここでは値を外から渡す。
 */

export const cx = (...a: (string | false | null | undefined)[]) => a.filter(Boolean).join(' ');

/* 線のアイコン（32px の格子） */
const STROKE: Record<string, string[]> = {
  DownloadTray: ['M5 18v7.5a1.5 1.5 0 0 0 1.5 1.5h19a1.5 1.5 0 0 0 1.5-1.5V18', 'M16 4v17', 'M10 15l6 6 6-6'],
  /* 参照（目）：注文履歴の操作（版 1.1 No.5.11） */
  Eye: ['M2 16s5-9 14-9 14 9 14 9-5 9-14 9S2 16 2 16z', 'M16 20a4 4 0 1 0 0-8 4 4 0 0 0 0 8z'],
  /* 印刷（納品書の PDF） */
  Printer: ['M8 11V5h16v6', 'M8 22H5a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h22a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-3', 'M8 18h16v9H8z'],
};

export function Icon({ name, size = 20, className }: { name: string; size?: number; className?: string }) {
  if (STROKE[name]) {
    return (
      <svg className={cx('es-icon', className)} width={size} height={size} viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        {STROKE[name].map((d, i) => <path key={i} d={d} />)}
      </svg>
    );
  }
  const d = ES_ICONS[name];
  if (!d) return null;
  return (
    <svg className={cx('es-icon', className)} width={size} height={size} viewBox="0 0 32 32" fill="currentColor" aria-hidden>
      {d.map((s, i) => <path key={i} transform={`translate(${s[0]} ${s[1]})`} d={s[2]} fillRule={s[3] ? 'evenodd' : 'nonzero'} />)}
    </svg>
  );
}

type BtnProps = {
  children?: ReactNode; onClick?: () => void; variant?: 'solid' | 'outline' | 'ghost'; tone?: 'primary' | 'neutral' | 'negative';
  size?: 'sm' | 'md' | 'lg'; icon?: string; disabled?: boolean; type?: 'button' | 'submit'; block?: boolean; className?: string; 'aria-label'?: string;
  /** マウスを乗せたときの説明（アイコンだけのボタンなど） */
  title?: string;
};
export function Button({ children, onClick, variant = 'solid', tone = 'primary', size = 'md', icon, disabled, type = 'button', block, className, title, ...rest }: BtnProps) {
  return (
    <button type={type} className={cx('es-btn', 'es-btn--' + variant, 'es-btn--' + tone, 'es-btn--' + size, icon && !children && 'es-btn--icon', block && 'es-btn--block', className)}
      disabled={disabled} onClick={onClick} aria-label={rest['aria-label']} title={title ?? rest['aria-label']}>
      {icon ? <Icon name={icon} size={size === 'lg' ? 24 : 20} /> : null}
      {children ? <span>{children}</span> : null}
    </button>
  );
}

export function Field({ label, required, helper, error, children, className }: { label?: ReactNode; required?: boolean; helper?: ReactNode; error?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <div className={cx('es-field', !!error && 'es-field--error', className)}>
      {label ? <label className="es-field__label">{label}{required ? <span className="es-field__req" aria-hidden>*</span> : null}</label> : null}
      {children}
      {error ? <p className="es-field__msg es-field__msg--error">{error}</p> : helper ? <p className="es-field__msg">{helper}</p> : null}
    </div>
  );
}

export function TextField({ value, onChange, placeholder, icon, className, label, num }: { value: string; onChange: (v: string) => void; placeholder?: string; icon?: string; className?: string; label?: string; num?: boolean /* 金額など数値（右寄せ） */ }) {
  return (
    <Field className={className} label={label}>
      <div className={`es-input es-input--md${num ? ' es-input--num' : ''}`}>
        {icon ? <Icon name={icon} size={18} /> : null}
        <input type="text" placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} />
      </div>
    </Field>
  );
}

export type Opt = string | { value: string; label: string };
/** 選択（先頭は placeholder・選べない） */
export function Select({ value, onChange, placeholder, options }: { value: string; onChange: (v: string) => void; placeholder?: string; options: Opt[] }) {
  return (
    <Field>
      <div className="es-input es-select es-input--md">
        <select value={value} onChange={(e) => onChange(e.target.value)} aria-label={placeholder}>
          {placeholder ? <option value="" disabled>{placeholder}</option> : null}
          {options.map((o) => (typeof o === 'string' ? <option key={o} value={o}>{fmtDatesIn(o)}</option> : <option key={o.value} value={o.value}>{o.label}</option>))}
        </select>
        <Icon name="CaretDown" size={16} />
      </div>
    </Field>
  );
}

export function Checkbox({ label, checked, onChange, indeterminate, ariaLabel }: { label?: ReactNode; checked: boolean; onChange: (v: boolean) => void; indeterminate?: boolean; ariaLabel?: string }) {
  return (
    <label className="es-check">
      <input type="checkbox" checked={!!checked} aria-label={ariaLabel} onChange={(e) => onChange(e.target.checked)} ref={(el) => { if (el) el.indeterminate = !!indeterminate; }} />
      <span className="es-check__box" aria-hidden />
      {label ? <span>{label}</span> : null}
    </label>
  );
}

export function Switch({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="es-switch">
      <input type="checkbox" role="switch" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="es-switch__track" aria-hidden />
    </label>
  );
}

export function SegmentedControl<T extends string>({ value, items, onChange, size, className, label }: { value: T; items: { value: T; label: ReactNode }[]; onChange: (v: T) => void; size?: 'sm'; className?: string; label?: string }) {
  return (
    <div className={cx('es-seg', size === 'sm' && 'es-seg--sm', className)} role="radiogroup" aria-label={label}>
      {items.map((it) => (
        <button key={it.value} type="button" role="radio" aria-checked={it.value === value} className={cx('es-seg__item', it.value === value && 'is-on')} onClick={() => onChange(it.value)}>{it.label}</button>
      ))}
    </div>
  );
}

export function Badge({ children, tone = 'neutral', outline = false }: { children: ReactNode; tone?: string; outline?: boolean }) {
  /* 状態の文字なら共通の色（lib/format/status.ts）。注文の受付中＝効いている。見た目は他の法人Web の画面と同じ塗り（hong 2026-10-06）。 */
  return <span className={cx('es-badge', 'es-badge--' + esTone(children, tone, 'order'), outline && 'es-badge--outline')}>{children}</span>;
}

export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return <div className="es-section-title"><h2>{children}</h2>{action ? <div>{action}</div> : null}</div>;
}
export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <section className={cx('es-card', className)}>{children}</section>;
}

/** 画面の中の案内。action＝右側に置くもの（リンク・開閉ボタン）。folded＝本文を隠して見出しの1行だけ（版 1.1 の折りたたみ） */
export function InlineMessage({ tone = 'info', title, children, action, folded }: { tone?: 'info' | 'success' | 'warning' | 'negative'; title?: ReactNode; children?: ReactNode; action?: ReactNode; folded?: boolean }) {
  const icon = { info: 'BellSimple', success: 'Checks', warning: 'ClockCountdown', negative: 'X' }[tone];
  return (
    <div className={cx('es-inline', 'es-inline--' + tone, folded && 'is-folded')} role={tone === 'negative' ? 'alert' : 'status'}>
      <Icon name={icon} size={18} />
      <div className="es-inline__body">{title ? <strong>{title}</strong> : null}{folded ? null : <div>{children}</div>}</div>
      {action ? <div className="es-inline__act">{action}</div> : null}
    </div>
  );
}

export function Toast({ tone = 'success', children, onClose }: { tone?: string; children: ReactNode; onClose?: () => void }) {
  return (
    <div className={cx('es-toast', 'es-toast--' + tone)} role="status">
      <Icon name={tone === 'negative' ? 'X' : 'Checks'} size={18} />
      <span>{children}</span>
      {onClose ? <button className="es-toast__close" aria-label="閉じる" onClick={onClose}><Icon name="X" size={14} /></button> : null}
    </div>
  );
}

/** 確認のモーダル（450px） */
export function Modal({ tone = 'warning', title, children, confirmLabel = 'OK', cancelLabel = 'キャンセル', onConfirm, onCancel, onClose }: { tone?: 'negative' | 'warning' | 'success' | 'info'; title: string; children?: ReactNode; confirmLabel?: string; cancelLabel?: string; onConfirm: () => void; onCancel: () => void; onClose?: () => void }) {
  const mark = { negative: '!', warning: '!', success: '✓', info: 'i' }[tone];
  return (
    <div className="es-modal" role="dialog" aria-modal="true" aria-labelledby="es-modal-t">
      <div className="es-modal__scrim" />
      <div className="es-modal__panel">
        {onClose ? <button className="es-modal__close" aria-label="閉じる" onClick={onClose}><Icon name="X" size={18} /></button> : null}
        <div className={cx('es-modal__mark', 'es-modal__mark--' + tone)} aria-hidden>{mark}</div>
        <h2 id="es-modal-t" className="es-modal__title">{title}</h2>
        {children ? <div className="es-modal__body">{children}</div> : null}
        <div className="es-modal__actions">
          <Button variant="outline" size="lg" block onClick={onCancel}>{cancelLabel}</Button>
          <Button tone={tone === 'negative' ? 'negative' : 'primary'} size="lg" block onClick={onConfirm}>{confirmLabel}</Button>
        </div>
      </div>
    </div>
  );
}
export function ConfirmDiscard({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return <Modal tone="negative" title="編集内容を破棄しますか？" confirmLabel="破棄" onConfirm={onConfirm} onCancel={onCancel} onClose={onCancel}>編集中の内容は保存されません。<br />編集内容を破棄してもよろしいですか？</Modal>;
}

/** 大きいモーダル（一覧・設定） */
export function Dialog({ title, id, width, onClose, footer, footerNote, children }: { title: string; id?: string; width?: number; onClose: () => void; footer?: ReactNode; footerNote?: ReactNode; children: ReactNode }) {
  return (
    <div className="es-dialog">
      <div className="es-dialog__scrim" onClick={onClose} />
      <div className="es-dialog__panel" role="dialog" aria-modal="true" aria-label={title} style={{ width: rem(width) }}>
        <div className="es-dialog__head">
          <h2>{title}{id ? <span className="es-mono es-dialog__id">{id}</span> : null}</h2>
          <button type="button" className="es-dialog__close" aria-label="閉じる" onClick={onClose}><Icon name="X" size={22} /></button>
        </div>
        <div className="es-dialog__body">{children}</div>
        {footer || footerNote ? <div className="es-dialog__foot"><b>{footerNote}</b>{footer}</div> : null}
      </div>
    </div>
  );
}
export function DialogSection({ title, note }: { title: string; note?: string }) {
  return <div className="es-dialog__sec"><span>{title}</span>{note ? <small>{note}</small> : null}</div>;
}

export function EmptyState({ title, children, compact, icon = 'Search' }: { title: string; children?: ReactNode; compact?: boolean; icon?: string }) {
  return (
    <div className={cx('es-empty', compact && 'es-empty--compact')}>
      <span className="es-empty__icon"><Icon name={icon} size={28} /></span>
      <b>{title}</b>
      {children ? <div className="es-empty__desc">{children}</div> : null}
    </div>
  );
}

export function CheckList({ items }: { items: { label: string; state: 'ok' | 'ng'; reason?: string }[] }) {
  const mk = { ok: '✓', ng: '×' }, al = { ok: 'OK', ng: 'NG' };
  return (
    <div className="es-checklist">
      {items.map((it, i) => (
        <div key={i} className={'es-checklist__item es-checklist__item--' + it.state}>
          <span className="es-checklist__mark" aria-label={al[it.state]}>{mk[it.state]}</span>
          <span className="es-checklist__label">{it.label}</span>
          {it.reason ? <span className="es-checklist__why">{it.reason}</span> : null}
        </div>
      ))}
    </div>
  );
}

const TEMP: Record<string, string> = { frozen: '冷凍', chilled: '冷蔵', ambient: '常温', mixed: '冷蔵・常温', material: '資材' };
/** 温度帯の印（アイコン＋色＋文字）。iconOnly＝アイコン＋色だけ（文字なし・マウスを乗せると名前。カードの写真の角・版 1.1 No.9.4） */
export function TempTag({ kind, iconOnly }: { kind: string; iconOnly?: boolean }) {
  if (iconOnly) return <span className={'es-temptag es-temptag--' + kind + ' es-temptag--ico'} title={TEMP[kind]} aria-label={TEMP[kind]} role="img" />;
  return <span className={'es-temptag es-temptag--' + kind}>{TEMP[kind]}</span>;
}

/**
 * 検索条件（1行に流し、折り返したときだけ開閉ボタン）。children＝1行目、more＝続き。
 * Enter・「検索」で onSearch、「クリア」で onClear
 */
export function SearchPanel({ children, more, onSearch, onClear }: { children: ReactNode; more?: ReactNode[]; onSearch: () => void; onClear: () => void }) {
  const fields = [...Children.toArray(children), ...(more ?? [])].filter(Boolean) as ReactElement[];
  const [open, setOpen] = useState(true);
  const [wraps, setWraps] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const el = ref.current; if (!el) return;
    const check = () => {
      let top: number | null = null, w = false;
      for (const k of Array.from(el.children) as HTMLElement[]) { const t = k.offsetTop; if (top === null) top = t; else if (t > top + 4) { w = true; break; } }
      setWraps(w);
    };
    check();
    if (typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(check); ro.observe(el); return () => ro.disconnect();
  }, [fields.length]);
  const collapsed = wraps && !open;
  return (
    <form className={cx('es-search', collapsed && 'is-collapsed')} role="search" onSubmit={(e) => { e.preventDefault(); onSearch(); }}>
      <div className="es-search__left">
        {wraps ? <button type="button" className="es-search__toggle" aria-expanded={open} aria-label={open ? '検索条件を閉じる' : '検索条件を開く'} onClick={() => setOpen(!open)}><Icon name={open ? 'CaretUp' : 'CaretDown'} size={20} /></button> : null}
        <div className="es-search__fields" ref={ref}>{fields.map((f, i) => (isValidElement(f) && f.key == null ? cloneElement(f, { key: 'f' + i }) : f))}</div>
      </div>
      <div className="es-search__actions">
        <div className="es-search__main">
          <Button variant="outline" onClick={onClear}>クリア</Button>
          <Button type="submit">検索</Button>
        </div>
      </div>
    </form>
  );
}

/* ================= 画面で共通の小さな部品（元の td・ro・table・link・Stepper・Pager・head） ================= */

/** 表のセル（空は —） */
export function Td({ v, cls }: { v?: ReactNode; cls?: string }) {
  return <td className={cls || undefined}>{v === '' || v == null ? '—' : fmtAutoNode(v)}</td>;
}
export type Col = { label: ReactNode; cls?: string; w?: number };
export function Table({ cols, rows, cls }: { cols: Col[]; rows: ReactNode[]; cls?: string }) {
  return (
    <div className={'es-table-wrap' + (cls ? ' ' + cls : '')}>
      <table className="es-table">
        <thead><tr>{cols.map((c, i) => <th key={i} className={c.cls || undefined} style={c.w ? { width: rem(c.w) } : undefined}>{c.label}</th>)}</tr></thead>
        <tbody>{rows}</tbody>
      </table>
    </div>
  );
}
/** 参照の項目（ラベル＋値） */
export function Ro({ label, v, cls }: { label: ReactNode; v?: ReactNode; cls?: string }) {
  return <div className={'od-ro' + (cls ? ' ' + cls : '')}><label>{label}</label><div>{v == null || v === '' ? '—' : fmtAutoNode(v)}</div></div>;
}
/** 文字のリンク（画面の中の移動） */
export function TLink({ children, onClick }: { children: ReactNode; onClick?: () => void }) {
  return <a href="#" className="od-link" onClick={(e) => { e.preventDefault(); onClick?.(); }}>{children}</a>;
}

/**
 * 数の入力（－・＋つき）。0〜9,999（入力の共通基準）。全角の数字は半角に直す。
 * disabled＝無効（灰色・押せない・数は見える）。title＝無効の理由（マウスを乗せると出す。代替品設定の対象＝I220）
 */
/** max＝これ以上は増やせない（メニューから外れた商品：数は減らす・0にするだけ。受付簿 #266①） */
export function Stepper({ value, onChange, disabled, label = '数量', title, max }: { value: number; onChange: (n: number) => void; disabled?: boolean; label?: string; title?: string; max?: number }) {
  const v = value || 0, top = max ?? 9999;
  return (
    <span className={'od-step' + (v ? '' : ' is-zero') + (disabled ? ' is-off' : '')} title={title}>
      <button type="button" aria-label="減らす" disabled={disabled || v <= 0} onClick={() => onChange(Math.max(0, v - 1))}><Icon name="Minus" size={14} /></button>
      <input value={v} inputMode="numeric" disabled={disabled} aria-label={label} onFocus={(e) => e.target.select()}
        onChange={(e: ChangeEvent<HTMLInputElement>) => { const n = parseInt(String(e.target.value).replace(/[０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0)).replace(/[^0-9]/g, ''), 10); onChange(isNaN(n) ? 0 : Math.min(n, top)); }} />
      <button type="button" aria-label="増やす" disabled={disabled || v >= top} onClick={() => onChange(Math.min(v + 1, top))}><Icon name="Plus" size={14} /></button>
    </span>
  );
}

/** ページ送り（表示件数 10／20／50・初期 10。決定 STEP7 L1・hong 2026-10-05 B-11） */
export function Pager({ total, page, per, opts = [10, 20, 50], onPage, onPer }: { total: number; page: number; per: number; opts?: number[]; onPage: (n: number) => void; onPer: (n: number) => void }) {
  const pages = Math.max(1, Math.ceil(total / per)), cur = Math.min(page, pages), list: (number | '…')[] = [];
  for (let i = 1; i <= pages; i++) if (i === 1 || i === pages || Math.abs(i - cur) <= 2) list.push(i); else if (list[list.length - 1] !== '…') list.push('…');
  return (
    <div className="od-pg">
      <div className="es-pagination">
        <span className="es-pagination__meta">{total + '件中 ' + (total ? (cur - 1) * per + 1 : 0) + '–' + Math.min(cur * per, total) + '件'}</span>
        <button className="es-page" disabled={cur === 1} onClick={() => onPage(cur - 1)} aria-label="前へ"><Icon name="CaretLeft" size={14} /></button>
        {list.map((n, i) => (n === '…'
          ? <span key={'e' + i} className="es-page es-page--gap">…</span>
          : <button key={n} className={'es-page' + (n === cur ? ' is-current' : '')} onClick={() => onPage(n)}>{n}</button>))}
        <button className="es-page" disabled={cur === pages} onClick={() => onPage(cur + 1)} aria-label="次へ"><Icon name="CaretRight" size={14} /></button>
        <div className="es-input es-select es-input--sm es-pagination__per">
          <select value={per} aria-label="表示件数" onChange={(e) => onPer(Number(e.target.value))}>{opts.map((n) => <option key={n} value={n}>{n}件/ページ</option>)}</select>
          <Icon name="CaretDown" size={14} />
        </div>
      </div>
    </div>
  );
}

/** ページの頭（パンくず・タイトル・ボタン）。crumb は 文字 か [文字, 押したとき] */
export function Head({ crumb, title, actions }: { crumb: (string | [string, (() => void) | null])[]; title: ReactNode; actions?: ReactNode }) {
  return (
    <header className="es-pagehead page-h">
      <div className="es-pagehead__text">
        <nav className="es-breadcrumb" aria-label="パンくず">
          {crumb.map((c, i) => {
            const last = i === crumb.length - 1, lbl = typeof c === 'string' ? c : c[0];
            return (
              <span key={i} style={{ display: 'contents' }}>
                {i ? <span className="es-breadcrumb__sep">/</span> : null}
                {last
                  ? <span className="es-breadcrumb__cur">{lbl}</span>
                  : <a href="#" onClick={(e) => { e.preventDefault(); if (typeof c !== 'string' && c[1]) c[1](); }}>{lbl}</a>}
              </span>
            );
          })}
        </nav>
        <h1 className="es-pagehead__title">{title}</h1>
      </div>
      {actions ? <div className="es-pagehead__actions">{actions}</div> : null}
    </header>
  );
}
