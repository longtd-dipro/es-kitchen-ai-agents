'use client';

import { ZoomImage } from '../../_ui/ImageViewer';
import { Children, cloneElement, isValidElement, useLayoutEffect, useRef, useState, type ReactElement, type ReactNode } from 'react';
import { ES_ICONS } from './esIcons';
import { fmtDatesIn } from '@/lib/format/date';
import { esTone } from '@/lib/format/status';
import { rem } from '@/lib/ui/rem';

/*
 * ES Kitchen デザインシステム（company-admin テーマ）の部品（部品/22 の window.ESKitchen と同じ HTML・クラス名）。
 * 見た目は app/corp/corp.css（枠）と sites.css（.corp-sites の中だけ）。
 */
export const cx = (...a: (string | false | null | undefined)[]) => a.filter(Boolean).join(' ');

export function Icon({ name, size = 20, className }: { name: string; size?: number; className?: string }) {
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
  size?: 'sm' | 'md' | 'lg'; icon?: string; disabled?: boolean; type?: 'button' | 'submit'; block?: boolean; className?: string; 'aria-label'?: string; id?: string;
};
export function Button({ children, onClick, variant = 'solid', tone, size = 'md', icon, disabled, type = 'button', block, className, id, ...rest }: BtnProps) {
  const t = tone ?? 'primary';
  return (
    <button id={id} type={type} className={cx('es-btn', 'es-btn--' + variant, 'es-btn--' + t, 'es-btn--' + size, icon && !children && 'es-btn--icon', block && 'es-btn--block', className)}
      disabled={disabled} onClick={onClick} aria-label={rest['aria-label']}>
      {icon ? <Icon name={icon} size={size === 'lg' ? 24 : 20} /> : null}
      {children ? <span>{children}</span> : null}
    </button>
  );
}

export function Badge({ children, tone = 'neutral', outline, className }: { children: ReactNode; tone?: string; outline?: boolean; className?: string }) {
  /* 状態の文字なら共通の色（lib/format/status.ts） */
  return <span className={cx('es-badge', 'es-badge--' + esTone(children, tone), outline && 'es-badge--outline', className)}>{children}</span>;
}
export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return <div className="es-section-title"><h2>{children}</h2>{action ? <div>{action}</div> : null}</div>;
}
export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <section className={cx('es-card', className)}>{children}</section>;
}
/** 見出しつきのカード（元の card()） */
export function CardT({ title, action, children }: { title: ReactNode; action?: ReactNode; children: ReactNode }) {
  return <Card><SectionTitle action={action}>{title}</SectionTitle>{children}</Card>;
}

export function InlineMessage({ tone = 'info', title, children }: { tone?: 'info' | 'success' | 'warning' | 'negative'; title?: ReactNode; children?: ReactNode }) {
  const icon = { info: 'BellSimple', success: 'Checks', warning: 'ClockCountdown', negative: 'X' }[tone];
  return (
    <div className={cx('es-inline', 'es-inline--' + tone)} role={tone === 'negative' ? 'alert' : 'status'}>
      <Icon name={icon} size={18} />
      <div>{title ? <strong>{title}</strong> : null}<div>{children}</div></div>
    </div>
  );
}

export function Tabs({ items, value, onChange }: { items: { value: string; label: string; count?: number }[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="es-tabs" role="tablist">
      {items.map((it) => (
        <button key={it.value} type="button" role="tab" aria-selected={it.value === value} className={cx('es-tab', it.value === value && 'is-active')} onClick={() => onChange(it.value)}>
          {it.label}{it.count != null ? <span className="es-tab__count">{it.count}</span> : null}
        </button>
      ))}
    </div>
  );
}

/** パンくず。文字は [文字, 押したとき] でリンクになる */
export function Crumbs({ items }: { items: (string | [string, () => void])[] }) {
  return (
    <nav className="es-breadcrumb" aria-label="パンくず">
      {items.map((c, i) => {
        const last = i === items.length - 1, lbl = typeof c === 'string' ? c : c[0];
        return (
          <span key={i} style={{ display: 'contents' }}>
            {i ? <span className="es-breadcrumb__sep" aria-hidden>/</span> : null}
            {last ? <span aria-current="page" className="es-breadcrumb__cur">{lbl}</span>
              : <a href="#" onClick={(e) => { e.preventDefault(); if (typeof c !== 'string') c[1](); }}>{lbl}</a>}
          </span>
        );
      })}
    </nav>
  );
}

/** ページの頭（パンくず・タイトル・状態・ボタン） */
export function PageHead({ crumbs, title, stat, actions }: { crumbs: (string | [string, () => void])[]; title: ReactNode; stat?: ReactNode; actions?: ReactNode }) {
  return (
    <header className="es-pagehead page-h">
      <div className="es-pagehead__text">
        <Crumbs items={crumbs} />
        <h1 className="es-pagehead__title">{title}</h1>
        {stat ? <div className="stat">{stat}</div> : null}
      </div>
      <div className="es-pagehead__actions">{actions}</div>
    </header>
  );
}

export function Pagination({ total, perPage = 10 }: { total: number; perPage?: number }) {
  const [cur, set] = useState(1);
  const pages = Math.max(1, Math.ceil(total / perPage)), list: (number | '…')[] = [];
  for (let i = 1; i <= pages; i++) if (i === 1 || i === pages || Math.abs(i - cur) <= 2) list.push(i); else if (list[list.length - 1] !== '…') list.push('…');
  return (
    <div className="es-pagination">
      <span className="es-pagination__meta">{total + '件中 ' + (total ? (cur - 1) * perPage + 1 : 0) + '–' + Math.min(cur * perPage, total) + '件'}</span>
      <button className="es-page" disabled={cur === 1} onClick={() => set(cur - 1)} aria-label="前へ"><Icon name="CaretLeft" size={14} /></button>
      {list.map((n, i) => (n === '…' ? <span key={'e' + i} className="es-page es-page--gap">…</span>
        : <button key={n} className={cx('es-page', n === cur && 'is-current')} aria-current={n === cur ? 'page' : undefined} onClick={() => set(n)}>{n}</button>))}
      <button className="es-page" disabled={cur === pages} onClick={() => set(cur + 1)} aria-label="次へ"><Icon name="CaretRight" size={14} /></button>
      <div className="es-input es-select es-input--sm es-pagination__per">
        <select defaultValue={perPage} aria-label="表示件数">{[10, 20, 50].map((n) => <option key={n} value={n}>{n}件/ページ</option>)}</select>
        <Icon name="CaretDown" size={14} />
      </div>
    </div>
  );
}

export function EmptyState({ title, icon = 'Search', compact }: { title: string; icon?: string | false; compact?: boolean }) {
  return (
    <div className={cx('es-empty', compact && 'es-empty--compact')}>
      {icon !== false ? <span className="es-empty__icon"><Icon name={icon} size={28} /></span> : null}
      <b>{title}</b>
    </div>
  );
}

export function RowActions({ label = '', onEdit }: { label?: string; onEdit?: () => void }) {
  return (
    <div className="es-rowactions">
      {onEdit ? <Button variant="ghost" tone="neutral" size="sm" icon="PencilSimple" aria-label={label + '編集'} onClick={onEdit} /> : null}
    </div>
  );
}

export function Checkbox({ label, checked, onChange }: { label?: ReactNode; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="es-check">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="es-check__box" aria-hidden />
      {label ? <span>{label}</span> : null}
    </label>
  );
}
export function Radio({ name, label, checked, onChange }: { name: string; label: ReactNode; checked: boolean; onChange: () => void }) {
  return (
    <label className="es-radio">
      <input type="radio" name={name} checked={checked} onChange={onChange} />
      <span className="es-radio__dot" aria-hidden />
      <span>{label}</span>
    </label>
  );
}

/** 資料のカード。src（画像）があればサムネイルを出し、押すと拡大する（画像だけ・受付簿 No.56） */
export function FileCard({ name, meta, placeholder, missing, badge, src }: { name: string; meta?: string; placeholder?: string; missing?: boolean; badge?: ReactNode; src?: string }) {
  return (
    <div className={cx('es-filecard', missing && 'es-filecard--missing')}>
      <div className="es-filecard__thumb">{src ? <ZoomImage src={src} alt={name} title={name} /> : placeholder || (missing ? '未提出' : '画像')}</div>
      <div className="es-filecard__body">
        <b title={name}>{name}</b>
        {meta ? <span className="es-filecard__meta">{meta}</span> : null}
        {badge ? <span>{badge}</span> : null}
      </div>
    </div>
  );
}

/** 確認のモーダル（450px） */
export function Modal({ tone = 'warning', title, children, confirmLabel = 'OK', onConfirm, onCancel }: { tone?: 'negative' | 'warning' | 'success' | 'info'; title: string; children?: ReactNode; confirmLabel?: string; onConfirm: () => void; onCancel: () => void }) {
  const mark = { negative: '!', warning: '!', success: '✓', info: 'i' }[tone];
  return (
    <div className="es-modal" role="dialog" aria-modal="true" aria-labelledby="es-modal-t">
      <div className="es-modal__scrim" />
      <div className="es-modal__panel">
        <button className="es-modal__close" aria-label="閉じる" onClick={onCancel}><Icon name="X" size={18} /></button>
        <div className={cx('es-modal__mark', 'es-modal__mark--' + tone)} aria-hidden>{mark}</div>
        <h2 id="es-modal-t" className="es-modal__title">{title}</h2>
        {children ? <div className="es-modal__body">{children}</div> : null}
        <div className="es-modal__actions">
          <Button variant="outline" size="lg" block onClick={onCancel}>キャンセル</Button>
          <Button tone={tone === 'negative' ? 'negative' : 'primary'} size="lg" block onClick={onConfirm}>{confirmLabel}</Button>
        </div>
      </div>
    </div>
  );
}
export function ConfirmDiscard({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return <Modal tone="negative" title="編集内容を破棄しますか？" confirmLabel="破棄" onConfirm={onConfirm} onCancel={onCancel}>編集中の内容は保存されません。<br />編集内容を破棄してもよろしいですか？</Modal>;
}

/** 大きいモーダル */
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

/** 検索条件（1行に流し、折り返したときだけ開閉ボタン） */
export function SearchPanel({ children, onSearch, onClear }: { children: ReactNode; onSearch: () => void; onClear: () => void }) {
  const fields = Children.toArray(children).filter(Boolean) as ReactElement[];
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
  return (
    <form className={cx('es-search', wraps && !open && 'is-collapsed')} role="search" onSubmit={(e) => { e.preventDefault(); onSearch(); }}>
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
/** 検索の1行入力 */
export function TextField({ value, onChange, placeholder, icon, className }: { value: string; onChange: (v: string) => void; placeholder?: string; icon?: string; className?: string }) {
  return (
    <div className={cx('es-field', className)}>
      <div className="es-input es-input--md">
        {icon ? <Icon name={icon} size={18} /> : null}
        <input type="text" placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} />
      </div>
    </div>
  );
}
/** 検索の選択（先頭は placeholder） */
export function Select({ value, onChange, placeholder, options }: { value: string; onChange: (v: string) => void; placeholder?: string; options: string[] }) {
  return (
    <div className="es-field">
      <div className="es-input es-select es-input--md">
        <select value={value} onChange={(e) => onChange(e.target.value)} aria-label={placeholder}>
          {placeholder ? <option value="" disabled>{placeholder}</option> : null}
          {options.map((o) => <option key={o} value={o}>{fmtDatesIn(o)}</option>)}
        </select>
        <Icon name="CaretDown" size={16} />
      </div>
    </div>
  );
}
