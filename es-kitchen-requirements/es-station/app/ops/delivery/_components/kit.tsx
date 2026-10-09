'use client';

import Link from 'next/link';
import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import type { CalCell as CalCellT, StageStep, TempKind, Tone } from '@/lib/ops/delivery/types';
import { DateInput } from '@/components/DateInput';
import { useUnapplied } from '../../_general/list';
import { fmtAuto, fmtDatesIn } from '@/lib/format/date';
import { PER_OPTIONS } from '@/lib/ui/paging';
import { ES_ICONS, ES_STROKE } from './esIcons';
import { esTone } from '@/lib/format/status';

/*
 * 配送管理の画面の部品。部品 16 の ES Kitchen（window.ESKitchen）と同じ HTML・クラス名を出す。
 * 見た目は delivery.css（.ops-delivery の中だけ）。
 */

const cx = (...a: (string | false | null | undefined)[]) => a.filter(Boolean).join(' ');

export function EsIcon({ name, size = 20, className }: { name: string; size?: number; className?: string }) {
  const st = ES_STROKE[name];
  if (st) {
    return (
      <svg className={cx('es-icon', className)} width={size} height={size} viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {st.map((d, i) => <path key={i} d={d} />)}
      </svg>
    );
  }
  const d = ES_ICONS[name];
  if (!d) return null;
  return (
    <svg className={cx('es-icon', className)} width={size} height={size} viewBox="0 0 32 32" fill="currentColor" aria-hidden="true">
      {d.map((s, i) => <path key={i} transform={`translate(${s[0]} ${s[1]})`} d={s[2]} fillRule={s[3] ? 'evenodd' : 'nonzero'} />)}
    </svg>
  );
}

type BtnProps = {
  variant?: 'solid' | 'outline' | 'ghost';
  tone?: 'primary' | 'neutral' | 'negative';
  size?: 'sm' | 'md' | 'lg';
  icon?: string;
  block?: boolean;
  disabled?: boolean;
  children?: ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit';
  'aria-label'?: string;
  className?: string;
  title?: string;
};
const btnCls = (p: BtnProps, iconOnly: boolean) => cx('es-btn', 'es-btn--' + (p.variant ?? 'solid'), 'es-btn--' + (p.tone ?? 'primary'), 'es-btn--' + (p.size ?? 'md'), iconOnly && 'es-btn--icon', p.block && 'es-btn--block', p.className);

export function Button(p: BtnProps) {
  const iconOnly = !!p.icon && !p.children;
  return (
    <button type={p.type ?? 'button'} className={btnCls(p, iconOnly)} disabled={p.disabled} onClick={p.onClick} aria-label={p['aria-label']} title={p.title}>
      {p.icon && <EsIcon name={p.icon} size={p.size === 'lg' ? 24 : 20} />}
      {p.children != null && <span>{p.children}</span>}
    </button>
  );
}
/** ボタンの見た目のリンク（元の a.es-btn） */
export function LinkButton(p: BtnProps & { href: string }) {
  return (
    <Link href={p.href} className={btnCls(p, false)}>
      {p.icon && <EsIcon name={p.icon} size={p.size === 'lg' ? 24 : 20} />}{p.children}
    </Link>
  );
}

export function Field({ label, req, helper, error, children, className, htmlFor }: { label?: ReactNode; req?: boolean; helper?: ReactNode; error?: string; children: ReactNode; className?: string; htmlFor?: string }) {
  return (
    <div className={cx('es-field', error && 'es-field--error', className)}>
      {label != null && label !== '' && <label className="es-field__label" htmlFor={htmlFor}>{label}{req && <span className="es-field__req" aria-hidden="true">*</span>}</label>}
      {children}
      {error ? <p className="es-field__msg es-field__msg--error">{error}</p> : helper ? <p className="es-field__msg">{helper}</p> : null}
    </div>
  );
}

type TFProps = {
  /** 日付の欄（共通の DateInput：yyyy-mm-dd・カレンダー付き。値は 'YYYY-MM-DD'） */
  date?: boolean;
  id?: string;
  label?: ReactNode;
  req?: boolean;
  helper?: ReactNode;
  error?: string;
  placeholder?: string;
  icon?: string;
  suffix?: string;
  size?: 'sm' | 'md' | 'lg';
  readOnly?: boolean;
  disabled?: boolean;
  /** 値を親が持つとき */
  value?: string;
  onChange?: (v: string) => void;
  /** 値を自分で持つとき（元の default-value） */
  defaultValue?: string;
  className?: string;
  style?: CSSProperties;
  type?: string;
  onEnter?: () => void;
};
export function TextField(p: TFProps) {
  const [own, setOwn] = useState(p.defaultValue ?? '');
  const v = p.value !== undefined ? p.value : own;
  return (
    <Field label={p.label} req={p.req} helper={p.helper} error={p.error} className={p.className} htmlFor={p.id}>
      <div className={cx('es-input', 'es-input--' + (p.size ?? 'md'), p.disabled && 'es-input--disabled', p.readOnly && 'es-input--readonly')} style={p.style}>
        {p.icon && !p.date && <EsIcon name={p.icon} size={18} />}
        {p.date ? (
          <DateInput fill id={p.id} placeholder={p.placeholder ? `${p.placeholder}（yyyy-mm-dd）` : undefined} value={v} disabled={p.disabled} readOnly={p.readOnly} aria-invalid={!!p.error || undefined}
            aria-label={typeof p.label === 'string' ? undefined : p.placeholder}
            onKeyDown={(e) => { if (e.key === 'Enter' && p.onEnter) { e.preventDefault(); p.onEnter(); } }}
            onChange={(e) => { setOwn(e.target.value); p.onChange?.(e.target.value); }} />
        ) : (
          <input
            id={p.id} type={p.type ?? 'text'} placeholder={p.placeholder} value={p.readOnly ? fmtAuto(v) : v} disabled={p.disabled} readOnly={p.readOnly} aria-invalid={!!p.error || undefined}
            aria-label={typeof p.label === 'string' ? undefined : p.placeholder}
            onChange={(e) => { setOwn(e.target.value); p.onChange?.(e.target.value); }}
            onKeyDown={(e) => { if (e.key === 'Enter' && p.onEnter) { e.preventDefault(); p.onEnter(); } }}
          />
        )}
        {p.suffix && <span className="es-input__suffix">{p.suffix}</span>}
      </div>
    </Field>
  );
}

type SelProps = {
  id?: string;
  label?: ReactNode;
  req?: boolean;
  helper?: ReactNode;
  error?: string;
  placeholder?: string;
  options: (string | { value: string; label: string })[];
  value?: string;
  defaultValue?: string;
  onChange?: (v: string) => void;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
  style?: CSSProperties;
};
export function Select(p: SelProps) {
  const [own, setOwn] = useState(p.defaultValue ?? '');
  const v = p.value !== undefined ? p.value : own;
  return (
    <Field label={p.label} req={p.req} helper={p.helper} error={p.error} className={p.className} htmlFor={p.id}>
      <div className={cx('es-input', 'es-select', 'es-input--' + (p.size ?? 'md'), p.disabled && 'es-input--disabled')} style={p.style}>
        <select id={p.id} value={v} disabled={p.disabled} aria-label={typeof p.label === 'string' ? undefined : p.placeholder} onChange={(e) => { setOwn(e.target.value); p.onChange?.(e.target.value); }}>
          {p.placeholder != null && <option value="">{p.placeholder}</option>}
          {p.options.map((o) => { const val = typeof o === 'string' ? o : o.value; return <option key={val} value={val}>{typeof o === 'string' ? o : o.label}</option>; })}
        </select>
        <EsIcon name="CaretDown" size={16} />
      </div>
    </Field>
  );
}

export function Checkbox({ label, checked, defaultChecked, onChange, disabled, ariaLabel }: { label?: ReactNode; checked?: boolean; defaultChecked?: boolean; onChange?: (v: boolean) => void; disabled?: boolean; ariaLabel?: string }) {
  return (
    <label className={cx('es-check', disabled && 'is-disabled')}>
      <input type="checkbox" checked={checked} defaultChecked={defaultChecked} disabled={disabled} aria-label={ariaLabel} onChange={(e) => onChange?.(e.target.checked)} />
      <span className="es-check__box" aria-hidden="true" />
      {label != null && <span>{label}</span>}
    </label>
  );
}
export function Radio({ name, label, checked, onChange, disabled, ariaLabel }: { name: string; label?: ReactNode; checked?: boolean; onChange?: () => void; disabled?: boolean; ariaLabel?: string }) {
  return (
    <label className={cx('es-radio', disabled && 'is-disabled')}>
      <input type="radio" name={name} checked={!!checked} disabled={disabled} aria-label={ariaLabel} onChange={() => onChange?.()} />
      <span className="es-radio__dot" aria-hidden="true" />
      <span>{label}</span>
    </label>
  );
}
export function Switch({ label, checked, onChange }: { label: ReactNode; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="es-switch">
      <input type="checkbox" role="switch" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="es-switch__track" aria-hidden="true" />
      <span>{label}</span>
    </label>
  );
}

export function Badge({ tone = 'neutral', children, outline }: { tone?: Tone | string; children: ReactNode; outline?: boolean }) {
  /* 状態の文字なら共通の色（lib/format/status.ts） */
  return <span className={cx('es-badge', 'es-badge--' + esTone(children, tone), outline && 'es-badge--outline')}>{children}</span>;
}

export function Tabs<T extends string>({ items, value, onChange }: { items: { value: T; label: ReactNode; count?: number }[]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="es-tabs" role="tablist">
      {items.map((it) => (
        <button key={it.value} type="button" role="tab" aria-selected={it.value === value} className={cx('es-tab', it.value === value && 'is-active')} onClick={() => onChange(it.value)}>
          {it.label}{it.count != null && <span className="es-tab__count">{it.count}</span>}
        </button>
      ))}
    </div>
  );
}

/** パンくず。links があればその段をリンクにする */
export function Breadcrumb({ items, links = {} }: { items: string[]; links?: Record<number, string> }) {
  return (
    <nav className="es-breadcrumb" aria-label="パンくず">
      {items.map((it, i) => {
        const last = i === items.length - 1;
        return (
          <span key={i} style={{ display: 'contents' }}>
            {i > 0 && <span className="es-breadcrumb__sep" aria-hidden="true">/</span>}
            {last ? <span aria-current="page" className="es-breadcrumb__cur">{it}</span> : links[i] ? <Link href={links[i]}>{it}</Link> : <span>{it}</span>}
          </span>
        );
      })}
    </nav>
  );
}

/** 画面の見出し（es-pagehead） */
export function PageHead({ crumbs, links, title, stat, actions }: { crumbs: string[]; links?: Record<number, string>; title: ReactNode; stat?: ReactNode; actions?: ReactNode }) {
  return (
    <header className="es-pagehead page-h">
      <div className="es-pagehead__text">
        <Breadcrumb items={crumbs} links={links} />
        <h1 className="es-pagehead__title">{title}</h1>
        {stat && <div className="stat">{stat}</div>}
      </div>
      {actions && <div className="es-pagehead__actions" style={{ alignItems: 'center' }}>{actions}</div>}
    </header>
  );
}

export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return <div className="es-section-title"><h2>{children}</h2>{action && <div>{action}</div>}</div>;
}
export function Card({ children, className, style }: { children: ReactNode; className?: string; style?: CSSProperties }) {
  return <section className={cx('es-card', className)} style={style}>{children}</section>;
}

/** ページ送り。total は件数（元のデモの見本の件数ではなく、実際の行数） */
/** ページ送り。page・onPage・onPer を渡すと外（usePaging）が行を切る。渡さないときは表示だけ（行は呼び出し側が全部出す） */
export function Pagination({ total, per, page, onPage, onPer }: { total: number; per: number; page?: number; onPage?: (n: number) => void; onPer?: (n: number) => void }) {
  const [own, setOwn] = useState(1);
  const pages = Math.max(1, Math.ceil(total / per));
  const cur = Math.min(page ?? own, pages);
  const go = (n: number) => { setOwn(n); onPage?.(n); };
  const list: (number | '…')[] = [];
  for (let i = 1; i <= pages; i++) if (i === 1 || i === pages || Math.abs(i - cur) <= 2) list.push(i); else if (list[list.length - 1] !== '…') list.push('…');
  return (
    <div className="es-pagination">
      <span className="es-pagination__meta">{total}件中 {total ? (cur - 1) * per + 1 : 0}–{Math.min(cur * per, total)}件</span>
      <button className="es-page" disabled={cur === 1} onClick={() => go(cur - 1)} aria-label="前へ"><EsIcon name="CaretLeft" size={14} /></button>
      {list.map((n, i) => n === '…'
        ? <span key={'e' + i} className="es-page es-page--gap">…</span>
        : <button key={n} className={cx('es-page', n === cur && 'is-current')} aria-current={n === cur ? 'page' : undefined} onClick={() => go(n)}>{n}</button>)}
      <button className="es-page" disabled={cur === pages} onClick={() => go(cur + 1)} aria-label="次へ"><EsIcon name="CaretRight" size={14} /></button>
      <div className="es-input es-select es-input--sm es-pagination__per">
        <select value={per} aria-label="表示件数" onChange={(e) => { go(1); onPer?.(+e.target.value); }}>{PER_OPTIONS.map((n) => <option key={n} value={n}>{n}件/ページ</option>)}</select>
        <EsIcon name="CaretDown" size={14} />
      </div>
    </div>
  );
}

export function InlineMessage({ tone = 'info', title, children }: { tone?: 'info' | 'success' | 'warning' | 'negative'; title?: ReactNode; children?: ReactNode }) {
  const icon = { info: 'BellSimple', success: 'Checks', warning: 'ClockCountdown', negative: 'X' }[tone];
  return (
    <div className={cx('es-inline', 'es-inline--' + tone)} role={tone === 'negative' ? 'alert' : 'status'}>
      <EsIcon name={icon} size={18} />
      <div>{title && <strong>{title}</strong>}<div>{children}</div></div>
    </div>
  );
}

export function SegmentedControl<T extends string>({ items, value, onChange, size, label }: { items: { value: T; label: string }[]; value: T; onChange: (v: T) => void; size?: 'sm'; label: string }) {
  return (
    <div className={cx('es-seg', size === 'sm' && 'es-seg--sm')} role="radiogroup" aria-label={label}>
      {items.map((it) => (
        <button key={it.value} type="button" role="radio" aria-checked={it.value === value} className={cx('es-seg__item', it.value === value && 'is-on')} onClick={() => onChange(it.value)}>{it.label}</button>
      ))}
    </div>
  );
}

export function StageIndicator({ mode, title, detail, steps }: { mode: 'fixed' | 'edit'; title: string; detail: string; steps: StageStep[] }) {
  const edit = mode === 'edit';
  return (
    <div className="es-stage">
      <div className="es-stage__row">
        <span className={cx('es-stage__mode', edit && 'es-stage__mode--edit')}>{edit ? '予定・編集中' : '確定・参照中'}</span>
        <b className="es-stage__title">{title}</b>
        <span className="es-stage__detail">{detail}</span>
      </div>
      <div className="es-stage__steps">
        {steps.map((st, i) => (
          <span key={i} style={{ display: 'contents' }}>
            {i > 0 && <span className="es-stage__arrow" aria-hidden="true">▶</span>}
            <span className={cx('es-stage__step', 'es-stage__step--' + st.state)} aria-current={st.state === 'current' ? 'step' : undefined}>{st.label}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

const TEMP: Record<TempKind, string> = { frozen: '冷凍', chilled: '冷蔵', ambient: '常温', mixed: '冷蔵・常温', material: '資材' };
export function TempTag({ kind }: { kind: TempKind }) {
  return <span className={cx('es-temptag', 'es-temptag--' + kind)}>{TEMP[kind]}</span>;
}

/** カレンダーのマス（ESKitchen.CalendarCell） */
export function CalendarCell({ c, onClick, selected, title, disabled }: { c: CalCellT; onClick?: () => void; selected?: boolean; title?: string; disabled?: boolean }) {
  return (
    <div
      className={cx('es-calcell', c.today && 'is-today', selected && 'is-selected', onClick && 'is-clickable', ...c.state.map((s) => 'es-calcell--' + s))}
      title={title} aria-disabled={disabled || undefined} aria-pressed={onClick && selected !== undefined ? selected : undefined}
      onClick={onClick} role={onClick ? 'button' : undefined} tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter') onClick(); } : undefined}
    >
      <div className="es-calcell__top">
        <span className="es-calcell__date">{c.date}</span>
        {c.holiday && <span className="es-calcell__hol">{c.holiday}</span>}
      </div>
      {(c.cycle || c.slot) && <div className="es-calcell__cycle">{c.cycle}{c.slot && <b className={cx('es-calcell__slot', c.week && 'es-wk--' + c.week.toLowerCase())}>{c.slot}</b>}</div>}
      {c.lines.map((l, i) => (
        'parts' in l
          ? <div key={i} className="es-calcell__line">{l.parts.map((pt, j) => (pt.tone ? <span key={j} className={'es-calcell__v es-calcell__v--' + pt.tone}>{pt.text}</span> : <span key={j}>{pt.text}</span>))}</div>
          : <div key={i} className="es-calcell__line">{l.pre}{l.value != null && l.value !== '' && <span className={'es-calcell__v es-calcell__v--' + (l.tone || 'plain')}>{l.value}</span>}{l.post}</div>
      ))}
      {c.badges.length > 0 && <div className="es-calcell__badges">{c.badges.map((b, i) => <span key={i} title={b.title}><Badge tone={b.tone}>{b.label}</Badge></span>)}</div>}
    </div>
  );
}

export function MonthTabs({ items, value, onChange }: { items: { value: string; label: string; meta: { text: string; tone: string }[] }[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="es-monthtabs" role="tablist">
      {items.map((it) => (
        <button key={it.value} type="button" role="tab" aria-selected={it.value === value} className={cx('es-monthtabs__tab', it.value === value && 'is-active')} onClick={() => onChange(it.value)}>
          <b>{it.label}</b>
          {it.meta.map((m, i) => <small key={i} className={'es-monthtabs__meta es-monthtabs__meta--' + m.tone}>{m.text}</small>)}
        </button>
      ))}
    </div>
  );
}

export function SlotChip({ code, state = 'off', onClick }: { code: string; state?: 'on' | 'off' | 'dis' | 'pick'; onClick?: () => void }) {
  return (
    <button type="button" className={cx('es-slot', 'es-slot--' + state)} disabled={state === 'dis'} aria-pressed={state === 'on' || state === 'pick'} onClick={onClick}>
      <span>{code}</span>
    </button>
  );
}

export function SelectionBar({ label, onClear, children }: { label: string; onClear: () => void; children: ReactNode }) {
  return (
    <div className="es-selbar es-selbar--floating" role="region" aria-label="選択中の操作">
      <b className="es-selbar__count">{label}</b>
      <button type="button" className="es-selbar__clear" onClick={onClear}>選択を解除</button>
      <div className="es-selbar__actions">{children}</div>
    </div>
  );
}

/** 大きいモーダル（ESKitchen.Dialog を元の demo-ov・demo-mbox の大きさで出す） */
export function Dialog({ m, title, id, headExtra, toolbar, footerNote, footer, onClose, children }: { m: string; title: string; id?: string; headExtra?: ReactNode; toolbar?: ReactNode; footerNote?: ReactNode; footer?: ReactNode; onClose: () => void; children: ReactNode }) {
  useEsc(onClose);
  return (
    <div className="ops-delivery">
      <div className="demo-ov" onClick={(e) => e.target === e.currentTarget && onClose()}>
        <div className="demo-mbox" data-m={m} role="dialog" aria-modal="true" aria-label={title}>
          <div className="demo-mroot" data-trs={m === 'TroubleResolve' ? '1' : undefined}>
            <div className="es-dialog es-dialog--inline" style={{ height: '100%' }}>
              <div className="es-dialog__panel">
                <div className="es-dialog__head">
                  <h2>{title}{id && <span className="es-mono es-dialog__id">{id}</span>}</h2>
                  {headExtra}
                  <button type="button" className="es-dialog__close" aria-label="閉じる" onClick={onClose}><EsIcon name="X" size={22} /></button>
                </div>
                {toolbar && <div className="es-dialog__toolbar">{toolbar}</div>}
                <div className="es-dialog__body es-dialog__body--flush">{children}</div>
                {(footer || footerNote) && <div className="es-dialog__foot"><b>{footerNote}</b>{footer}</div>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export function DialogSection({ title, note, action }: { title: ReactNode; note?: ReactNode; action?: ReactNode }) {
  return <div className="es-dialog__sec"><span>{title}</span>{note && <small>{note}</small>}{action && <span className="es-dialog__secact">{action}</span>}</div>;
}

/** 確認のモーダル（ESKitchen.Modal） */
export function EsModal({ m, tone = 'warning', title, children, cancelLabel = 'キャンセル', confirmLabel = 'OK', confirmDisabled, onCancel, onConfirm }: { m: string; tone?: 'warning' | 'negative' | 'success' | 'info'; title: string; children?: ReactNode; cancelLabel?: string; confirmLabel?: string; confirmDisabled?: boolean; onCancel: () => void; onConfirm?: () => void }) {
  useEsc(onCancel);
  const mark = { negative: '!', warning: '!', success: '✓', info: 'i' }[tone];
  return (
    <div className="ops-delivery">
      <div className="demo-ov" onClick={(e) => e.target === e.currentTarget && onCancel()}>
        <div className="demo-mbox" data-m={m} role="dialog" aria-modal="true" aria-label={title}>
          <div className="es-modal es-modal--inline">
            <div className="es-modal__panel">
              <div className={cx('es-modal__mark', 'es-modal__mark--' + tone)} aria-hidden="true">{mark}</div>
              <h2 className="es-modal__title">{title}</h2>
              {children && <div className="es-modal__body">{children}</div>}
              <div className="es-modal__actions">
                <Button variant="outline" size="lg" block onClick={onCancel}>{cancelLabel}</Button>
                {onConfirm && <Button tone={tone === 'negative' ? 'negative' : 'primary'} size="lg" block disabled={confirmDisabled} onClick={onConfirm}>{confirmLabel}</Button>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function useEsc(fn: () => void) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') fn(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [fn]);
}

export function EmptyState({ title, icon, children }: { title: ReactNode; icon?: string; children?: ReactNode }) {
  return (
    <div className="es-empty">
      <span className="es-empty__icon"><EsIcon name={icon ?? 'Search'} size={28} /></span>
      <b>{title}</b>
      {children && <div className="es-empty__desc">{children}</div>}
    </div>
  );
}

export function CheckList({ items }: { items: { state: 'ok' | 'ng' | 'warn' | 'na'; label: string; reason?: string }[] }) {
  const mk = { ok: '✓', ng: '×', warn: '!', na: '—' }, al = { ok: 'OK', ng: 'NG', warn: '注意', na: '対象外' };
  return (
    <div className="es-checklist">
      {items.map((it, i) => (
        <div key={i} className={'es-checklist__item es-checklist__item--' + it.state}>
          <span className="es-checklist__mark" aria-label={al[it.state]}>{mk[it.state]}</span>
          <span className="es-checklist__label">{it.label}</span>
          {it.reason && <span className="es-checklist__why">{it.reason}</span>}
        </div>
      ))}
    </div>
  );
}

export function Timeline({ items, compact }: { items: { time: string; who: string; what: string }[]; compact?: boolean }) {
  return (
    <div className={cx('es-timeline', compact && 'es-timeline--compact')}>
      {items.map((it, i) => (
        <div key={i} className="es-timeline__ev">
          <span className="es-timeline__t">{fmtAuto(it.time)}</span>
          <span className="es-timeline__who">{it.who}</span>
          <span className="es-timeline__what">{fmtDatesIn(it.what)}</span>
        </div>
      ))}
    </div>
  );
}

export function FileCard({ name, placeholder, meta, badge }: { name: string; placeholder: string; meta?: string; badge?: ReactNode }) {
  return (
    <div className="es-filecard">
      <div className="es-filecard__thumb">{placeholder}</div>
      <div className="es-filecard__body">
        <b title={name}>{name}</b>
        {meta && <span className="es-filecard__meta">{meta}</span>}
        {badge && <span>{badge}</span>}
      </div>
    </div>
  );
}

/** 検索条件（ESKitchen.SearchPanel）。columns があれば格子（1行目の最後の列に クリア／検索）、なければ折り返し */
export function SearchPanel({ columns, first, more, onSearch, onClear, sig, children }: { columns?: number; first?: number; more?: ReactNode[]; onSearch: () => void; onClear: () => void; /** 手元の条件を文字にしたもの。（「未適用」の印は出さない：台帳 F 2026-10-05） */ sig?: string; children: ReactNode[] }) {
  const [open, setOpen] = useState(true);
  const u = useUnapplied(sig ?? '');
  const actions = [
    <Button key="clear" variant="outline" onClick={() => { u.onClear(); onClear(); }}>クリア</Button>,
    <Button key="search" type="submit">検索</Button>,
  ];
  const submit = (e: React.FormEvent) => { e.preventDefault(); u.onSearch(); onSearch(); };
  if (columns) {
    const all = children.filter(Boolean), n = first ?? all.length;
    const head = all.slice(0, n), rest = [...all.slice(n), ...(more ?? [])];
    return (
      <form className={cx('es-search', 'es-search--grid', !open && 'is-collapsed')} role="search" style={{ ['--search-cols' as string]: columns }} onSubmit={submit}>
        <div className="es-search__gutter">
          {rest.length > 0 && <button type="button" className="es-search__toggle" aria-expanded={open} aria-label={open ? '検索条件を閉じる' : '検索条件を開く'} onClick={() => setOpen(!open)}><EsIcon name={open ? 'CaretUp' : 'CaretDown'} size={18} /></button>}
        </div>
        <div className="es-search__grid">
          {head}
          <div className="es-search__gridact">{actions}</div>
          {open && rest}
        </div>
      </form>
    );
  }
  return (
    <form className="es-search" role="search" onSubmit={submit}>
      <div className="es-search__left"><div className="es-search__fields">{children}</div></div>
      <div className="es-search__actions"><div className="es-search__main">{actions}</div></div>
    </form>
  );
}
