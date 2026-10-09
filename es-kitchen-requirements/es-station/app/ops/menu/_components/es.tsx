'use client';

import { Children, cloneElement, type ComponentProps, isValidElement, useLayoutEffect, useRef, useState, type ChangeEvent, type CSSProperties, type InputHTMLAttributes, type TextareaHTMLAttributes, type ReactElement, type ReactNode, type SelectHTMLAttributes } from 'react';
import { DateInput } from '@/components/DateInput';
import { useUnapplied } from '../../_general/list';
import { ES_ICONS } from './esIcons';
import { fmtAutoNode } from '@/lib/format/date';
import { esTone } from '@/lib/format/status';
import { rem } from '@/lib/ui/rem';

/*
 * ES Kitchen デザインシステム（system-admin テーマ）の部品（部品/18 の ESKitchen と同じ HTML・クラス名）。
 * 見た目は menu.css（.ops-menu の中だけ）。元は defaultValue（入力を持たない）の部品もあるが、ここでは値を外から渡す。
 */

const cx = (...a: (string | false | null | undefined)[]) => a.filter(Boolean).join(' ');

/* CSV取込・出力の線のアイコン（32px の格子） */
const STROKE: Record<string, string[]> = {
  UploadTray: ['M5 18v7.5a1.5 1.5 0 0 0 1.5 1.5h19a1.5 1.5 0 0 0 1.5-1.5V18', 'M16 21V4', 'M10 10l6-6 6 6'],
  DownloadTray: ['M5 18v7.5a1.5 1.5 0 0 0 1.5 1.5h19a1.5 1.5 0 0 0 1.5-1.5V18', 'M16 4v17', 'M10 15l6 6 6-6'],
};

export function Icon({ name, size = 20, className, label }: { name: string; size?: number; className?: string; label?: string }) {
  const a11y = label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true as const };
  if (STROKE[name]) {
    return (
      <svg className={cx('es-icon', className)} width={size} height={size} viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" {...a11y}>
        {STROKE[name].map((d, i) => <path key={i} d={d} />)}
      </svg>
    );
  }
  const d = ES_ICONS[name];
  if (!d) return null;
  return (
    <svg className={cx('es-icon', className)} width={size} height={size} viewBox="0 0 32 32" fill="currentColor" {...a11y}>
      {d.map((s, i) => <path key={i} transform={`translate(${s[0]} ${s[1]})`} d={s[2]} fillRule={s[3] ? 'evenodd' : 'nonzero'} />)}
    </svg>
  );
}

type BtnProps = {
  children?: ReactNode; onClick?: () => void; variant?: 'solid' | 'outline' | 'ghost'; tone?: 'primary' | 'neutral' | 'negative';
  size?: 'sm' | 'md' | 'lg'; icon?: string; disabled?: boolean; type?: 'button' | 'submit'; block?: boolean; className?: string; 'aria-label'?: string;
};
export function Button({ children, onClick, variant = 'solid', tone = 'primary', size = 'md', icon, disabled, type = 'button', block, className, ...rest }: BtnProps) {
  return (
    <button type={type} className={cx('es-btn', 'es-btn--' + variant, 'es-btn--' + tone, 'es-btn--' + size, icon && !children && 'es-btn--icon', block && 'es-btn--block', className)}
      disabled={disabled} onClick={onClick} aria-label={rest['aria-label']}>
      {icon ? <Icon name={icon} size={size === 'lg' ? 24 : 20} /> : null}
      {children ? <span>{children}</span> : null}
    </button>
  );
}

export function CsvButton({ kind, size = 'lg', onClick, children }: { kind?: 'import'; size?: 'md' | 'lg'; onClick?: () => void; children?: ReactNode }) {
  const imp = kind === 'import';
  return (
    <button type="button" className={cx('es-btn es-btn--csv', 'es-btn--' + size)} onClick={onClick}>
      <Icon name={imp ? 'UploadTray' : 'DownloadTray'} size={24} />
      <span>{children || (imp ? 'CSV取込' : 'CSV出力')}</span>
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

/** 検索欄（アイコンつきの1行入力） */
export function TextField({ value, onChange, placeholder, icon, className }: { value: string; onChange: (v: string) => void; placeholder?: string; icon?: string; className?: string }) {
  return (
    <Field className={className}>
      <div className="es-input es-input--md">
        {icon ? <Icon name={icon} size={18} /> : null}
        <input type="text" placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} />
      </div>
    </Field>
  );
}

export type Opt = string | { value: string | number; label: string; disabled?: boolean };
/** 検索条件の選択（先頭は placeholder・選べない） */
export function Select({ value, onChange, placeholder, options, className }: { value: string; onChange: (v: string) => void; placeholder?: string; options: Opt[]; className?: string }) {
  return (
    <Field className={className}>
      <div className="es-input es-select es-input--md">
        <select value={value} onChange={(e) => onChange(e.target.value)} aria-label={placeholder}>
          {placeholder ? <option value="" disabled>{placeholder}</option> : null}
          {options.map((o) => (typeof o === 'string' ? <option key={o} value={o}>{o}</option> : <option key={o.value} value={o.value}>{o.label}</option>))}
        </select>
        <Icon name="CaretDown" size={16} />
      </div>
    </Field>
  );
}

/** 入力欄（元の inp） */
export function Inp(props: InputHTMLAttributes<HTMLInputElement>) {
  return <div className={cx('es-input es-input--md', props.disabled && 'es-input--disabled')}><input {...props} /></div>;
}
/** 複数行の入力欄（備考など） */
export function Area(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <div className={cx('es-input es-input--area', props.disabled && 'es-input--disabled')}><textarea rows={3} {...props} /></div>;
}
/** 日付の入力欄（yyyy-mm-dd・カレンダー付き。値は <input type="date"> と同じ 'YYYY-MM-DD'） */
export function DInp(props: ComponentProps<typeof DateInput>) {
  return <div className={cx('es-input es-input--md', props.disabled && 'es-input--disabled')}><DateInput fill {...props} /></div>;
}
/** 選択（元の sel） */
export function Sel({ options, ...props }: SelectHTMLAttributes<HTMLSelectElement> & { options: Opt[] }) {
  return (
    <div className={cx('es-input es-select es-input--md', props.disabled && 'es-input--disabled')}>
      <select {...props}>
        {options.map((o) => (typeof o === 'string' ? <option key={o} value={o}>{o}</option> : <option key={o.value} value={o.value} disabled={o.disabled}>{o.label}</option>))}
      </select>
      <Icon name="CaretDown" size={16} />
    </div>
  );
}
/** ラジオの並び。opts＝[値, ラベル, 説明?] */
export function Radios<T extends string>({ name, value, opts, onChange, disabled }: { name: string; value: T; opts: [T, string, string?][]; onChange: (v: T) => void; disabled?: boolean }) {
  return (
    <div className="mo-radios">
      {opts.map((o) => (
        <label key={o[0]} className={cx('es-radio', disabled && 'is-disabled')}>
          <input type="radio" name={name} checked={value === o[0]} disabled={disabled} onChange={() => onChange(o[0])} />
          <span className="es-radio__dot" aria-hidden />
          <span>{o[1]}{o[2] ? <small className="mo-rsub">{o[2]}</small> : null}</span>
        </label>
      ))}
    </div>
  );
}
/** チェックボックス（元の chk） */
export function Chk({ label, checked, onChange, disabled, ariaLabel }: { label?: ReactNode; checked: boolean; onChange: (v: boolean) => void; disabled?: boolean; ariaLabel?: string }) {
  return (
    <label className={cx('es-check', disabled && 'is-disabled')}>
      <input type="checkbox" checked={!!checked} disabled={disabled} aria-label={ariaLabel} onChange={(e) => onChange(e.target.checked)} />
      <span className="es-check__box" aria-hidden />
      {label ? <span>{label}</span> : null}
    </label>
  );
}

export function Badge({ children, tone = 'neutral', outline = true, className }: { children: ReactNode; tone?: string; outline?: boolean; className?: string }) {
  /* 状態の文字なら共通の色（lib/format/status.ts）。注文の受付中＝効いている */
  return <span className={cx('es-badge', 'es-badge--' + esTone(children, tone, 'order'), outline && 'es-badge--outline', className)}>{children}</span>;
}

export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return <div className="es-section-title"><h2>{children}</h2>{action ? <div>{action}</div> : null}</div>;
}
export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <section className={cx('es-card', className)}>{children}</section>;
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

/*
 * 保存エラーの出し方（台帳 E「保存エラーの出し方（全サイト）」・F「保存時のエラーの出し方（マスタ）」2026-10-05）：
 *   エラーは対象の項目の下に文言（FieldError・赤枠）、見出しの下に「保存できません（n件）。赤い項目を確認してください。」の1行だけ（SaveErrorBar）。
 *   エラーの一覧のダイアログ・箱は出さない
 */
export function SaveErrorBar({ n }: { n: number }) {
  return n > 0 ? <InlineMessage tone="negative"><b>保存できません（{n}件）。</b>赤い項目を確認してください。</InlineMessage> : null;
}
/** 項目・行の下のエラーの文言（Field の error と同じ見た目。表や合計の下など Field がない所に置く） */
export function FieldError({ children }: { children?: ReactNode }) {
  return children ? <p className="es-field__msg es-field__msg--error" role="alert">{children}</p> : null;
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
export function ConfirmDelete({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return <Modal tone="negative" title="削除しますか？" confirmLabel="削除" onConfirm={onConfirm} onCancel={onCancel} onClose={onCancel}>本当に削除してもよろしいですか？<br />削除すると元に戻せません。</Modal>;
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
export function DialogSection({ title }: { title: string }) {
  return <div className="es-dialog__sec"><span>{title}</span></div>;
}

export function EmptyState({ title, children, compact }: { title: string; children?: ReactNode; compact?: boolean }) {
  return (
    <div className={cx('es-empty', compact && 'es-empty--compact')}>
      <span className="es-empty__icon"><Icon name="Search" size={28} /></span>
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

export function RowActions({ label = '', onEdit, onDelete }: { label?: string; onEdit?: () => void; onDelete?: () => void }) {
  return (
    <div className="es-rowactions">
      {onEdit ? <Button variant="ghost" tone="neutral" size="sm" icon="PencilSimple" aria-label={label + '編集'} onClick={onEdit} /> : null}
      {onDelete ? <Button variant="ghost" tone="negative" size="sm" icon="Trash" aria-label={label + '削除'} onClick={onDelete} /> : null}
    </div>
  );
}

const TEMP: Record<string, string> = { frozen: '冷凍', chilled: '冷蔵', ambient: '常温', mixed: '冷蔵・常温', material: '資材' };
export function TempTag({ kind }: { kind: string }) {
  return <span className={'es-temptag es-temptag--' + kind}>{TEMP[kind]}</span>;
}

/**
 * 検索条件（1行に流し、折り返したときだけ開閉ボタン）。children＝1行目、more＝続き。
 * Enter・「検索」で onSearch、「クリア」で onClear
 */
export function SearchPanel({ children, more, onSearch, onClear, sig }: { children: ReactNode; more?: ReactNode[]; onSearch: () => void; onClear: () => void; /** 手元の条件を文字にしたもの。渡すと、変えたまま検索していないとき「未適用」を出す（2026/10/03 決定） */ sig?: string }) {
  const u = useUnapplied(sig ?? '');
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
    <form className={cx('es-search', collapsed && 'is-collapsed')} role="search" onSubmit={(e) => { e.preventDefault(); u.onSearch(); onSearch(); }}>
      <div className="es-search__left">
        {wraps ? <button type="button" className="es-search__toggle" aria-expanded={open} aria-label={open ? '検索条件を閉じる' : '検索条件を開く'} onClick={() => setOpen(!open)}><Icon name={open ? 'CaretUp' : 'CaretDown'} size={20} /></button> : null}
        <div className="es-search__fields" ref={ref}>{fields.map((f, i) => (isValidElement(f) && f.key == null ? cloneElement(f, { key: 'f' + i }) : f))}</div>
      </div>
      <div className="es-search__actions">
        <div className="es-search__main">
          <Button variant="outline" onClick={() => { u.onClear(); onClear(); }}>クリア</Button>
          <Button type="submit">検索</Button>
        </div>
      </div>
    </form>
  );
}

/* ================= 画面で共通の小さな部品（元の td・ro・table・Stepper・Pager ほか） ================= */

/** 表のセル（空は —） */
export function Td({ v, cls }: { v?: ReactNode; cls?: string }) {
  return <td className={cls || undefined}>{v === '' || v == null ? '—' : fmtAutoNode(v)}</td>;
}
export type Col = { label: ReactNode; cls?: string; w?: number };
/** 表（行がなければ「該当するデータがありません」） */
export function Table({ cols, rows, cls, head, empty = '該当するデータがありません' }: { cols?: Col[]; rows: ReactNode[]; cls?: string; head?: ReactNode; /** 0件のときの文言（既定は「該当するデータがありません」。月間メニューは I01） */ empty?: string }) {
  return (
    <div className={'es-table-wrap od-tbl' + (cls ? ' ' + cls : '')}>
      <table className="es-table">
        <thead>{head || <tr>{(cols ?? []).map((c, i) => <th key={i} className={c.cls || undefined} style={c.w ? { width: rem(c.w) } : undefined}>{c.label}</th>)}</tr>}</thead>
        <tbody>{rows.length ? rows : <tr><td colSpan={30} className="mo-empty">{empty}</td></tr>}</tbody>
      </table>
    </div>
  );
}
/** 参照の項目（ラベル＋値） */
export function Ro({ label, v, cls }: { label: ReactNode; v?: ReactNode; cls?: string }) {
  return <div className={'od-ro' + (cls ? ' ' + cls : '')}><label>{label}</label><div>{v == null || v === '' ? '—' : fmtAutoNode(v)}</div></div>;
}
/** 文字のリンク（画面の中の移動） */
export function TLink({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return <a href="#" className="od-link" onClick={(e) => { e.preventDefault(); onClick(); }}>{children}</a>;
}
/** 意味が決まっていない項目の印 */
export function Kari({ t }: { t?: string }) {
  return <span className="mo-kari" title="意味が決まっていないため仮置き（要確認）">{t || '仮'}</span>;
}
export function Kpi({ l, v, sub, ng }: { l: string; v: ReactNode; sub?: ReactNode; ng?: boolean }) {
  return <div className={'mo-kpi' + (ng ? ' ng' : '')}><span>{l}</span><b>{v}</b>{sub ? <small>{sub}</small> : null}</div>;
}

/** 数の入力（－・＋つき）。max＝これ以上は増やせない（メニューから外れた商品：数は減らす・0にするだけ） */
export function Stepper({ value, onChange, disabled, label = '数量', max }: { value: number; onChange: (n: number) => void; disabled?: boolean; label?: string; max?: number }) {
  const v = value || 0, top = max ?? 9999;
  return (
    <span className={'od-step' + (v ? '' : ' is-zero')}>
      <button type="button" aria-label="減らす" disabled={disabled || v <= 0} onClick={() => onChange(Math.max(0, v - 1))}><Icon name="Minus" size={14} /></button>
      <input value={v} inputMode="numeric" disabled={disabled} aria-label={label} onFocus={(e) => e.target.select()}
        onChange={(e: ChangeEvent<HTMLInputElement>) => { const n = parseInt(String(e.target.value).replace(/[^0-9]/g, ''), 10); onChange(isNaN(n) ? 0 : Math.min(n, top)); }} />
      <button type="button" aria-label="増やす" disabled={disabled || v >= top} onClick={() => onChange(Math.min(v + 1, top))}><Icon name="Plus" size={14} /></button>
    </span>
  );
}

/** ページ送り（10・50・100件/ページ） */
/** all＝「全件」を選べる（per＝0 が全件） */
export function Pager({ total, page, per: per0, onPage, onPer, all, opts = [10, 50, 100] }: { total: number; page: number; per: number; onPage: (n: number) => void; onPer: (n: number) => void; all?: boolean; /** 表示件数の選択肢（既定 10・50・100。一覧の決まり 10・20・50 の画面は渡す：台帳 K） */ opts?: number[] }) {
  const per = per0 > 0 ? per0 : Math.max(1, total);
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
          <select value={per0 > 0 ? per0 : 0} aria-label="表示件数" onChange={(e) => onPer(Number(e.target.value))}>{(all ? [0, ...opts] : opts).map((n) => <option key={n} value={n}>{n ? n + '件/ページ' : '全件'}</option>)}</select>
          <Icon name="CaretDown" size={14} />
        </div>
      </div>
    </div>
  );
}

/** ページの頭（パンくず・タイトル・ボタン）。crumb は 文字 か [文字, 押したとき] */
export function Head({ crumb, title, actions, cls }: { crumb: (string | [string, () => void])[]; title: ReactNode; actions?: ReactNode; cls?: string }) {
  return (
    <header className={'es-pagehead' + (cls ? ' ' + cls : '')}>
      <div className="es-pagehead__text">
        <nav className="es-breadcrumb" aria-label="パンくず">
          {crumb.map((c, i) => {
            const last = i === crumb.length - 1, lbl = typeof c === 'string' ? c : c[0];
            return (
              <span key={i} style={{ display: 'contents' }}>
                {i ? <span className="es-breadcrumb__sep">/</span> : null}
                {last || typeof c === 'string'
                  ? <span className={last ? 'es-breadcrumb__cur' : undefined}>{lbl}</span>
                  : <a href="#" onClick={(e) => { e.preventDefault(); c[1](); }}>{lbl}</a>}
              </span>
            );
          })}
        </nav>
        <h1 className="es-pagehead__title mo-title">{title}</h1>
      </div>
      {actions ? <div className="es-pagehead__actions">{actions}</div> : null}
    </header>
  );
}

export const noteStyle: CSSProperties = { marginTop: '0.571429rem' };
