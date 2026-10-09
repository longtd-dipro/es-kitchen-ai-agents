'use client';

import Link from 'next/link';
import type { CSSProperties, ReactNode } from 'react';
import { DS_ICONS } from './dsIcons';
import { fmtDatesIn } from '@/lib/format/date';
import { esTone } from '@/lib/format/status';
import { rem } from '@/lib/ui/rem';

/*
 * ES Kitchen デザインシステムの部品（元：11_運営_申請受付.html の DSX。クラスは es-* のまま）。
 * 元は HTML の文字列で組み立てていたものを React の部品にした。見た目は applications.css。
 */

export function DsIcon({ n, s = 20 }: { n: string; s?: number }) {
  const p = DS_ICONS[n];
  if (!p) return null;
  return (
    <svg className="es-icon" width={s} height={s} viewBox="0 0 32 32" fill="currentColor" aria-hidden="true">
      {p.map((x, i) => <path key={i} transform={`translate(${x[0]} ${x[1]})`} d={x[2]} fillRule={x[3] ? 'evenodd' : undefined} />)}
    </svg>
  );
}

type BtnOpt = {
  variant?: 'solid' | 'outline' | 'ghost';
  tone?: 'primary' | 'neutral' | 'negative';
  size?: 'sm' | 'md' | 'lg';
  icon?: string;
  block?: boolean;
  cls?: string;
  id?: string;
  disabled?: boolean;
  onClick?: () => void;
};
/** Button：variant solid|outline|ghost × tone primary|neutral|negative × size sm|md|lg */
export function Btn({ children, variant = 'solid', tone = 'primary', size = 'md', icon, block, cls, id, disabled, onClick }: BtnOpt & { children?: ReactNode }) {
  return (
    <button type="button" id={id} disabled={disabled} onClick={onClick}
      className={`es-btn es-btn--${variant} es-btn--${tone} es-btn--${size}${children ? '' : ' es-btn--icon'}${block ? ' es-btn--block' : ''}${cls ? ' ' + cls : ''}`}>
      {icon && <DsIcon n={icon} s={size === 'lg' ? 24 : 20} />}
      {children !== undefined && children !== null && <span>{children}</span>}
    </button>
  );
}

/* ---------- 札（Badge） ---------- */
export type Tone = 'primary' | 'info' | 'success' | 'warning' | 'negative' | 'neutral';
/** 札の色は DS の決まり：文言で決め、決まらなければ元の色（bg の色クラス）から */
const BADGE_TXT: [RegExp, Tone][] = [
  [/仮登録|予定|自動公開|設定中|契約設定中|対応中|一部承認/, 'info'],
  [/本登録|正式登録|有効|公開|確定済み|承認済み|完了|発行済|ログイン済|自動生成|確認済み/, 'success'],
  [/休止中|要確認|受付中|承認待ち|未保存/, 'warning'],
  [/解約済|満了|非公開|削除済|取り下げ済み|対象外|未発行|—/, 'neutral'],
  [/解約|エラー|却下|停止中|超過/, 'negative'],
];
const BADGE_CLS: Record<string, Tone> = { blue: 'primary', pur: 'primary', org: 'warning', grn: 'success', amb: 'warning', red: 'negative', mut: 'neutral', teal: 'info', ind: 'info' };
export function badgeTone(text: string, cls = ''): Tone {
  for (const [re, t] of BADGE_TXT) if (re.test(text)) return t;
  const c = cls.split(/\s+/).find((x) => BADGE_CLS[x]);
  return c ? BADGE_CLS[c] : 'neutral';
}
export function Badge({ tone = 'neutral', children }: { tone?: Tone; children: ReactNode }) {
  /* 状態の文字なら共通の色（lib/format/status.ts） */
  return <span className={`es-badge es-badge--${esTone(children, tone)}`}>{children}</span>;
}
/** 元の span.bg（色は文言から決める） */
export function Bg({ c = '', children }: { c?: string; children: string }) {
  return <Badge tone={badgeTone(children, c)}>{children}</Badge>;
}
const escText = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);
export const esc = (s: unknown) => escText(String(s ?? ''));
/** 見本の HTML の中の span.bg を es-badge にする（元の fixBadges） */
export function fixBadgesHtml(html: string): string {
  return String(html ?? '').replace(/<span class="bg([^"]*)">([^<]*)<\/span>/g, (_m, cls: string, inner: string) => {
    const tx = inner.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
    return `<span class="es-badge es-badge--${badgeTone(tx, cls)}">${inner}</span>`;
  });
}
/** 見本の HTML（申込内容・注記など。中身はこの領域の見本データだけ） */
export function Html({ html, as: Tag = 'span', className, style }: { html: string; as?: 'span' | 'div' | 'td' | 'p'; className?: string; style?: CSSProperties }) {
  return <Tag className={className} style={style} dangerouslySetInnerHTML={{ __html: fixBadgesHtml(fmtDatesIn(html)) }} />;
}

/* ---------- パンくず・見出し ---------- */
export type Crumb = string | { t: string; href?: string; on?: () => void };
export function Breadcrumb({ items }: { items: Crumb[] }) {
  return (
    <nav className="es-breadcrumb" aria-label="パンくず">
      {items.map((it, i) => {
        const last = i === items.length - 1, t = typeof it === 'object' ? it.t : it;
        return (
          <span key={i} style={{ display: 'contents' }}>
            {i > 0 && <span className="es-breadcrumb__sep" aria-hidden="true">/</span>}
            {last ? <span className="es-breadcrumb__cur" aria-current="page">{t}</span>
              : typeof it === 'object' && it.href && !it.on ? <Link href={it.href}>{t}</Link>
                : <a href="#" onClick={(e) => { e.preventDefault(); if (typeof it === 'object') it.on?.(); }}>{t}</a>}
          </span>
        );
      })}
    </nav>
  );
}
/** PageHeader：パンくず＋タイトル（ID は等幅）＋右に操作ボタン */
export function PageHead({ crumb, title, id, badge, actions }: { crumb: Crumb[]; title: string; id?: string; badge?: ReactNode; actions?: ReactNode }) {
  return (
    <header className="es-pagehead">
      <div className="es-pagehead__text">
        <Breadcrumb items={crumb} />
        <h1 className="es-pagehead__title">{title}{id && <span className="es-mono"> {id}</span>}{badge && <> {badge}</>}</h1>
      </div>
      {actions && <div className="es-pagehead__actions">{actions}</div>}
    </header>
  );
}

/* ---------- タブ ---------- */
export type TabItem = { key: string; label: ReactNode; on: boolean; onClick: () => void; count?: ReactNode; sub?: ReactNode };
export function Tabs({ items }: { items: TabItem[] }) {
  return (
    <div className="es-tabs" role="tablist">
      {items.map((it) => (
        <button key={it.key} type="button" role="tab" className={`es-tab${it.on ? ' is-active' : ''}`} aria-selected={it.on} onClick={it.onClick}>
          {it.label}
          {it.count !== null && it.count !== undefined && it.count !== '' && it.count !== 0 && <span className="es-tab__count">{it.count}</span>}
          {it.sub}
        </button>
      ))}
    </div>
  );
}

/* ---------- 欄 ---------- */
export function Field({ label, req, msg, error, cls, children, style }: { label?: ReactNode; req?: boolean; msg?: ReactNode; error?: boolean; cls?: string; children: ReactNode; style?: CSSProperties }) {
  return (
    <div className={`es-field${error ? ' es-field--error' : ''}${cls ? ' ' + cls : ''}`} style={style}>
      {label && <label className="es-field__label">{label}{req && <span className="es-field__req" aria-hidden="true">*</span>}</label>}
      {children}
      {msg && <p className={`es-field__msg${error ? ' es-field__msg--error' : ''}`}>{msg}</p>}
    </div>
  );
}
/** 読み取り専用の値（灰色の箱）。html は見本の HTML */
export function Ro({ label, html, children, cls }: { label: ReactNode; html?: string; children?: ReactNode; cls?: string }) {
  const empty = (html === undefined || html === null || html === '') && (children === undefined || children === null || children === '');
  return (
    <Field label={label} cls={cls}>
      <div className="es-input es-input--md es-input--readonly es-roval">
        {empty ? <span className="es-roval__none">—</span> : html !== undefined ? <Html html={html} /> : typeof children === 'string' ? fmtDatesIn(children) : children}
      </div>
    </Field>
  );
}

const INLINE_ICON: Record<string, string> = { info: 'BellSimple', success: 'Checks', warning: 'ClockCountdown', negative: 'X' };
export function Inline({ tone = 'info', title, children, html }: { tone?: 'info' | 'success' | 'warning' | 'negative'; title?: string; children?: ReactNode; html?: string }) {
  return (
    <div className={`es-inline es-inline--${tone}`} role={tone === 'negative' ? 'alert' : 'status'}>
      <DsIcon n={INLINE_ICON[tone]} s={18} />
      <div>
        {title && <strong>{title}</strong>}
        {html !== undefined ? <Html as="div" html={html} /> : <div>{children}</div>}
      </div>
    </div>
  );
}

/* ---------- モーダル ---------- */
/** Dialog：表やフォームの入る大きいモーダル */
export function Dialog({ title, id, width = '720px', onClose, children, foot, note }: { title: string; id?: string; width?: string; onClose: () => void; children: ReactNode; foot?: ReactNode; note?: ReactNode }) {
  return (
    <div className="es-dialog">
      <div className="es-dialog__scrim" onClick={onClose} />
      <div className="es-dialog__panel" role="dialog" aria-modal="true" aria-label={title} style={{ width: rem(width) }}>
        <div className="es-dialog__head">
          <h2>{title}{id && <span className="es-mono es-dialog__id">{id}</span>}</h2>
          <button type="button" className="es-dialog__close" aria-label="閉じる" onClick={onClose}><DsIcon n="X" s={22} /></button>
        </div>
        <div className="es-dialog__body">{children}</div>
        {(foot || note) && <div className="es-dialog__foot"><b>{note}</b>{foot}</div>}
      </div>
    </div>
  );
}
/** Modal：小さい確認（却下・破棄など）。左 キャンセル、右 実行 */
export function DsModal({ tone = 'warning', title, children, onCancel, onConfirm, cancelLabel, confirmLabel }: { tone?: 'negative' | 'warning' | 'success' | 'info'; title: string; children?: ReactNode; onCancel: () => void; onConfirm?: () => void; cancelLabel?: string; confirmLabel?: string }) {
  const mark = { negative: '!', warning: '!', success: '✓', info: 'i' }[tone];
  return (
    <div className="es-modal" role="dialog" aria-modal="true">
      <div className="es-modal__scrim" onClick={onCancel} />
      <div className="es-modal__panel">
        <button type="button" className="es-modal__close" aria-label="閉じる" onClick={onCancel}><DsIcon n="X" s={18} /></button>
        <div className={`es-modal__mark es-modal__mark--${tone}`} aria-hidden="true">{mark}</div>
        <h2 className="es-modal__title">{title}</h2>
        {children && <div className="es-modal__body">{children}</div>}
        <div className="es-modal__actions">
          {onConfirm ? (
            <>
              <Btn variant="outline" size="lg" block onClick={onCancel}>{cancelLabel || 'キャンセル'}</Btn>
              <Btn tone={tone === 'negative' ? 'negative' : 'primary'} size="lg" block onClick={onConfirm}>{confirmLabel || 'OK'}</Btn>
            </>
          ) : <Btn variant="outline" size="lg" block onClick={onCancel}>{cancelLabel || '閉じる'}</Btn>}
        </div>
      </div>
    </div>
  );
}

/* ---------- 入力 ---------- */
export function Check({ checked, onChange, disabled, children }: { checked: boolean; onChange?: (v: boolean) => void; disabled?: boolean; children: ReactNode }) {
  return (
    <label className={`es-check${disabled ? ' is-disabled' : ''}`}>
      <input type="checkbox" checked={checked} disabled={disabled} onChange={(e) => onChange?.(e.target.checked)} />
      <span className="es-check__box" aria-hidden="true" />
      <span>{children}</span>
    </label>
  );
}
export type Opt = string | { v: string; t: string; disabled?: boolean };
export const optV = (o: Opt) => (typeof o === 'object' ? o.v : o);
export const optT = (o: Opt) => (typeof o === 'object' ? o.t : o);
/** Select（ネイティブ select を es-input で包む） */
export function Select({ value, opts, ph, onChange, disabled, size = 'md', aria }: { value: string; opts: Opt[]; ph?: string; onChange: (v: string) => void; disabled?: boolean; size?: 'sm' | 'md' | 'lg'; /** 項目名（aria-label） */ aria?: string }) {
  return (
    <div className={`es-input es-select es-input--${size}${disabled ? ' es-input--disabled' : ''}`}>
      <select value={value} disabled={disabled} aria-label={aria} onChange={(e) => onChange(e.target.value)}>
        {ph !== undefined && <option value="">{ph}</option>}
        {opts.map((o) => <option key={optV(o)} value={optV(o)} disabled={typeof o === 'object' ? o.disabled : undefined}>{fmtDatesIn(optT(o))}</option>)}
      </select>
      <DsIcon n="CaretDown" s={16} />
    </div>
  );
}
export function Input({ value, onChange, icon, ph, type = 'text', size = 'md', onEnter, num }: { value: string; onChange: (v: string) => void; icon?: string; ph?: string; type?: string; size?: 'sm' | 'md' | 'lg'; onEnter?: () => void; num?: boolean /* 金額など数値（右寄せ） */ }) {
  return (
    <div className={`es-input es-input--${size}${num ? ' es-input--num' : ''}`}>
      {icon && <DsIcon n={icon} s={18} />}
      <input type={type} value={value} placeholder={ph} onChange={(e) => onChange(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') onEnter?.(); }} />
    </div>
  );
}
export function Textarea({ value, onChange, ph, rows = 3 }: { value: string; onChange: (v: string) => void; ph?: string; rows?: number }) {
  return <textarea className="es-textarea" rows={rows} placeholder={ph} value={value} onChange={(e) => onChange(e.target.value)} />;
}

/* ---------- 表 ---------- */
export type Head = string | { t: string; align?: 'right' | 'left' | 'center'; w?: string };
export function Table({ head, children, cls }: { head: Head[]; children: ReactNode; cls?: string }) {
  return (
    <div className="es-table-wrap">
      <table className={`es-table${cls ? ' ' + cls : ''}`}>
        <thead>
          <tr>
            {head.map((h, i) => {
              const t = typeof h === 'object' ? h.t : h, a = typeof h === 'object' ? h.align : undefined, w = typeof h === 'object' ? h.w : undefined;
              return <th key={i} className={a === 'right' ? 'r' : undefined} style={(a && a !== 'right') || w ? { textAlign: a === 'right' ? undefined : a, width: rem(w) } : undefined}>{t}</th>;
            })}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}
/** ページ送り（見本は1ページだけ） */
export function Pagination({ total, per = 10, page = 1, onPage, onPer }: { total: number; per?: number; page?: number; onPage?: (n: number) => void; onPer?: (n: number) => void }) {
  const pages = Math.max(1, Math.ceil(total / per));
  const cur = Math.min(page, pages);
  return (
    <div className="es-pagination">
      <span className="es-pagination__meta">{total}件中 {total ? (cur - 1) * per + 1 : 0}–{Math.min(cur * per, total)}件</span>
      <button type="button" className="es-page" disabled={cur <= 1} aria-label="前へ" onClick={() => onPage?.(cur - 1)}><DsIcon n="CaretLeft" s={14} /></button>
      {Array.from({ length: pages }, (_, i) => i + 1).map((n) => <button key={n} type="button" className={`es-page${n === cur ? ' is-current' : ''}`} aria-current={n === cur ? 'page' : undefined} onClick={() => onPage?.(n)}>{n}</button>)}
      <button type="button" className="es-page" disabled={cur >= pages} aria-label="次へ" onClick={() => onPage?.(cur + 1)}><DsIcon n="CaretRight" s={14} /></button>
      <div className="es-input es-select es-input--sm es-pagination__per">
        <select value={per} aria-label="表示件数" onChange={(e) => onPer?.(+e.target.value)}>{[10, 20, 50].map((n) => <option key={n} value={n}>{n}件/ページ</option>)}</select>
        <DsIcon n="CaretDown" s={14} />
      </div>
    </div>
  );
}
