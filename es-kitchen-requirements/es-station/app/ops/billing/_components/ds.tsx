'use client';

import Link from 'next/link';
import { useState, type ReactNode } from 'react';
import { useOps } from '../../_ui/OpsProvider';
import { sameConds, UnappliedMark } from '../../_general/list';
import { DS_ICONS } from './dsIcons';
import { fmtAutoNode } from '@/lib/format/date';
import { PER_OPTIONS } from '@/lib/ui/paging';
import { esTone } from '@/lib/format/status';
import { TAX_EX, TAX_IN, taxPair, yen, yenSigned } from '@/lib/format/money';
import { rem } from '@/lib/ui/rem';

/*
 * 請求の画面の部品（ES Kitchen デザインシステムの es-*）。元の請求デモは描画のあとに es-* へ置き換えていた（dsify）ので、
 * ここでは置き換えたあとの形をそのまま組む。クラスは app/ops/billing/billing.css
 */

export function DsIcon({ name, size = 20 }: { name: string; size?: number }) {
  const p = DS_ICONS[name];
  if (!p) return null;
  return (
    <svg className="es-icon" width={size} height={size} viewBox="0 0 32 32" fill="currentColor" aria-hidden="true">
      {p.map((x, i) => <path key={i} transform={`translate(${x[0]} ${x[1]})`} d={x[2]} fillRule={x[3] ? 'evenodd' : undefined} />)}
    </svg>
  );
}

/** 元のタグの色（ok・wait・no・info・mut・pur）→ Badge の色 */
const TONE: Record<string, string> = { ok: 'success', wait: 'warning', no: 'negative', info: 'info', mut: 'neutral', pur: 'neutral', req: 'info' };
export function Tag({ c = 'mut', children }: { c?: string; children: ReactNode }) {
  /* 状態の文字なら共通の色（lib/format/status.ts） */
  return <span className={`es-badge es-badge--${esTone(children, TONE[c] ?? 'neutral')}`}>{children}</span>;
}

/** ボタン。pri＝主な操作（solid）、red＝取消・解除（outline negative）、ほかは outline */
export function Btn({ kind, sm, children, onClick, disabled, title }: { kind?: 'pri' | 'red'; sm?: boolean; children: ReactNode; onClick?: () => void; disabled?: boolean; title?: string }) {
  const v = kind === 'pri' ? 'solid' : 'outline', t = kind === 'red' ? 'negative' : 'primary';
  return <button type="button" className={`es-btn es-btn--${v} es-btn--${t} es-btn--${sm ? 'sm' : 'md'}`} onClick={onClick} disabled={disabled} title={title}>{children}</button>;
}
/** 表の行の「編集」（鉛筆） */
export function PencilLink({ href }: { href: string }) {
  return <span className="es-rowactions"><Link className="es-btn es-btn--ghost es-btn--primary es-btn--sm es-btn--icon" href={href} aria-label="編集"><DsIcon name="PencilSimple" size={18} /></Link></span>;
}

export type Crumb = { t: string; href?: string };
/** ページヘッダー（パンくず＋タイトル＋ID＋右の操作） */
export function PageHead({ crumbs, title, id, actions }: { crumbs: Crumb[]; title: string; id?: string; actions?: ReactNode }) {
  return (
    <header className="es-pagehead">
      <div className="es-pagehead__text">
        <nav className="es-breadcrumb" aria-label="パンくず">
          {crumbs.map((c, i) => (
            <span key={i} style={{ display: 'contents' }}>
              {i > 0 && <span className="es-breadcrumb__sep" aria-hidden="true">/</span>}
              {i === crumbs.length - 1 ? <span className="es-breadcrumb__cur" aria-current="page">{c.t}</span>
                : c.href ? <Link href={c.href}>{c.t}</Link> : <a href="#" onClick={(e) => e.preventDefault()}>{c.t}</a>}
            </span>
          ))}
        </nav>
        <h1 className="es-pagehead__title">{title}{id && <span className="es-mono"> {id}</span>}</h1>
      </div>
      {actions && <div className="es-pagehead__actions">{actions}</div>}
    </header>
  );
}
/** 見出しの下のバッジと説明の1行 */
export const Meta = ({ children }: { children: ReactNode }) => <div className="bl-meta">{children}</div>;

/** カード＋見出し（右に補足） */
export function Card({ title, right, children, id }: { title?: ReactNode; right?: ReactNode; children?: ReactNode; id?: string }) {
  return (
    <div className="es-card bl-card" id={id}>
      {title !== undefined && (
        <div className="es-section-title"><h2>{title}</h2>{right !== undefined && right !== '' && <div className="bl-sact">{right}</div>}</div>
      )}
      {children}
    </div>
  );
}
export const Foot = ({ children }: { children: ReactNode }) => <div className="foot">{children}</div>;

/** お知らせ（info・warning・negative） */
export function Inline({ tone = 'info', children, style }: { tone?: 'info' | 'warning' | 'negative'; children: ReactNode; style?: React.CSSProperties }) {
  const ic = { info: 'BellSimple', warning: 'ClockCountdown', negative: 'X' }[tone];
  return (
    <div className={`es-inline es-inline--${tone}`} role={tone === 'negative' ? 'alert' : 'status'} style={style}>
      <DsIcon name={ic} size={18} /><div><div>{children}</div></div>
    </div>
  );
}

/** 読み取り専用の欄 */
export function Ro({ label, children, msg, className }: { label: ReactNode; children: ReactNode; msg?: ReactNode; className?: string }) {
  return (
    <div className={`es-field ${className ?? ''}`}>
      <label className="es-field__label">{label}</label>
      <div className="es-input es-input--md es-input--readonly es-roval">{children === '' || children === null || children === undefined ? <span className="es-roval__none">—</span> : fmtAutoNode(children)}</div>
      {msg && <p className="es-field__msg">{msg}</p>}
    </div>
  );
}
/** 入力欄（ラベル＋中身） */
export function Field({ label, req, msg, children, className }: { label: ReactNode; req?: boolean; msg?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <div className={`es-field ${className ?? ''}`}>
      <label className="es-field__label">{label}{req && <span className="es-field__req">*</span>}</label>
      {children}
      {msg && <p className="es-field__msg">{msg}</p>}
    </div>
  );
}
/** 金額のまとめ（読み取り専用の欄を横に並べる） */
export function SumGrid({ items }: { items: { k: ReactNode; v: ReactNode; s?: ReactNode }[] }) {
  return (
    <section className="es-card">
      <div className="es-formgrid bl-sumgrid" style={{ gridTemplateColumns: `repeat(${Math.min(items.length, 4)},minmax(0,1fr))` }}>
        {items.map((m, i) => <Ro key={i} label={m.k} msg={m.s}><b className="es-num">{m.v}</b></Ro>)}
      </div>
    </section>
  );
}

/** 表（横にはみ出すときはスクロール） */
export function Table({ children, minWidth }: { children: ReactNode; minWidth?: number }) {
  return <div className="es-table-wrap"><table className="es-table" style={minWidth ? { minWidth } : undefined}>{children}</table></div>;
}
/** 件数の表示（1ページ目だけ。元と同じ） */
/** ページ送り。page・onPage・onPer を渡すと外（usePaging）が行を切る */
export function Pagination({ total, per = 10, page = 1, onPage, onPer }: { total: number; per?: number; page?: number; onPage?: (n: number) => void; onPer?: (n: number) => void }) {
  const pages = Math.max(1, Math.ceil(total / per));
  const cur = Math.min(page, pages);
  return (
    <div className="es-pagination">
      <span className="es-pagination__meta">{total}件中 {total ? (cur - 1) * per + 1 : 0}–{Math.min(cur * per, total)}件</span>
      <button type="button" className="es-page" disabled={cur <= 1} aria-label="前へ" onClick={() => onPage?.(cur - 1)}><DsIcon name="CaretLeft" size={14} /></button>
      {Array.from({ length: pages }, (_, i) => i + 1).map((n) => <button key={n} type="button" className={`es-page${n === cur ? ' is-current' : ''}`} aria-current={n === cur ? 'page' : undefined} onClick={() => onPage?.(n)}>{n}</button>)}
      <button type="button" className="es-page" disabled={cur >= pages} aria-label="次へ" onClick={() => onPage?.(cur + 1)}><DsIcon name="CaretRight" size={14} /></button>
      <div className="es-input es-select es-input--sm es-pagination__per">
        <select value={per} aria-label="表示件数" onChange={(e) => onPer?.(+e.target.value)}>{PER_OPTIONS.map((n) => <option key={n} value={n}>{n}件/ページ</option>)}</select>
        <DsIcon name="CaretDown" size={14} />
      </div>
    </div>
  );
}

/** タブ（下線） */
export function Tabs<K extends string>({ items, cur, onPick }: { items: { k: K; label: ReactNode }[]; cur: K; onPick: (k: K) => void }) {
  return (
    <div className="es-tabs" role="tablist">
      {items.map((t) => <button key={t.k} type="button" role="tab" className={`es-tab${cur === t.k ? ' is-active' : ''}`} aria-selected={cur === t.k} onClick={() => onPick(t.k)}>{t.label}</button>)}
    </div>
  );
}

/* ---------- 入力 ---------- */
export function Sel({ value, onChange, opts, ph, disabled, sm, width }: { value: string; onChange: (v: string) => void; opts: [string, string][]; ph?: string; disabled?: boolean; sm?: boolean; width?: number }) {
  return (
    <div className={`es-input es-input--${sm ? 'sm' : 'md'} es-select${disabled ? ' es-input--disabled' : ''}`} style={width ? { width } : undefined}>
      <select value={value} onChange={(e) => onChange(e.target.value)} disabled={disabled}>
        {ph !== undefined && <option value="">{ph}</option>}
        {opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
      <DsIcon name="CaretDown" size={16} />
    </div>
  );
}
export function Inp({ value, onChange, ph, type = 'text', disabled, sm, width, onEnter, err, id, num }: { value: string; onChange: (v: string) => void; ph?: string; type?: string; disabled?: boolean; sm?: boolean; width?: number | string; onEnter?: () => void; err?: boolean; id?: string; num?: boolean /* 金額など数値（右寄せ） */ }) {
  return (
    <div className={`es-input es-input--${sm ? 'sm' : 'md'}${num ? ' es-input--num' : ''}${disabled ? ' es-input--disabled' : ''}`} style={{ ...(width ? { width: rem(width) } : {}), ...(err ? { borderColor: 'var(--negative-500)' } : {}) }}>
      <input id={id} type={type} value={value} placeholder={ph} disabled={disabled} onChange={(e) => onChange(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && onEnter) onEnter(); }} />
    </div>
  );
}
export function Check({ checked, onChange, label = '選択', disabled }: { checked: boolean; onChange: (v: boolean) => void; label?: string; disabled?: boolean }) {
  return (
    <label className={`es-check${disabled ? ' is-disabled' : ''}`} aria-label={label}>
      <input type="checkbox" checked={checked} disabled={disabled} onChange={(e) => onChange(e.target.checked)} /><span className="es-check__box" />
    </label>
  );
}

/* ---------- 検索（条件名はプレースホルダー。「検索」か Enter で絞り込む） ---------- */
/** type 'mrange'＝月の範囲（開始月 k〜終了月 k2。opts＝選べる月）。終了月は開始月より前を選べない（台帳 F 2026-10-08「月の選択は…」） */
export type SearchField = { k: string; k2?: string; type: 'sel' | 'text' | 'mrange'; ph: string; w?: number; opts?: [string, string][]; all?: false };
export function SearchBar<F extends Record<string, string>>({ fields, value, onApply, init }: { fields: SearchField[]; value: F; onApply: (v: F) => void; init: F }) {
  const [d, setD] = useState<F>(value);
  const set = (k: string, v: string) => setD((x) => ({ ...x, [k]: v }));
  const dirty = !sameConds(d, value);
  return (
    <div className="es-search">
      <div className="es-search__left"><div className="es-search__fields bl-sf">
        {fields.map((f) => f.type === 'mrange' && f.k2
          ? <span key={f.k} style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-8, 0.571429rem)', flex: '0 0 auto', maxWidth: 'none' }}>
              <span className="small" style={{ whiteSpace: 'nowrap' }}>{f.ph}</span>
              <Sel value={d[f.k] ?? ''} onChange={(v) => setD((x) => ({ ...x, [f.k]: v, ...(f.k2 && (x[f.k2] ?? '') < v ? { [f.k2]: v } : {}) }))} opts={f.opts ?? []} width={f.w} />
              <span style={{ flex: '0 0 auto' }}>〜</span>
              <Sel value={d[f.k2] ?? ''} onChange={(v) => set(f.k2 as string, v)} opts={(f.opts ?? []).filter(([o]) => o >= (d[f.k] ?? ''))} width={f.w} />
            </span>
          : f.type === 'sel'
          ? <Sel key={f.k} value={d[f.k] ?? ''} onChange={(v) => set(f.k, v)} opts={f.opts ?? []} ph={f.all === false ? undefined : f.ph} width={f.w} />
          : <Inp key={f.k} value={d[f.k] ?? ''} onChange={(v) => set(f.k, v)} ph={f.ph} width={f.w} onEnter={() => onApply(d)} />)}
      </div></div>
      <div className="es-search__actions"><div className="es-search__main">
        <Btn onClick={() => { setD(init); onApply(init); }}>クリア</Btn>
        <UnappliedMark es show={dirty} />
        <Btn kind="pri" onClick={() => onApply(d)}>検索</Btn>
      </div></div>
    </div>
  );
}

/** 複数選択のバー（下に浮く） */
export function SelBar({ n, onClear, children }: { n: number; onClear: () => void; children: ReactNode }) {
  if (!n) return null;
  return (
    <div className="es-selbar es-selbar--floating">
      <span className="es-selbar__count">{n}件選択中</span>
      <button type="button" className="es-selbar__clear" onClick={onClear}>選択を解除</button>
      <div className="es-selbar__actions">{children}</div>
    </div>
  );
}

/** 確認のモーダル（元の askBulk・crudGuard の DSX.modal）。useOps().openModal で出す */
export function useAsk() {
  const { openModal, closeModal } = useOps();
  return (o: { tone?: 'info' | 'warning' | 'negative'; title: string; body: ReactNode; ok?: string; cancel?: string; onOk: () => void | Promise<void> }) => {
    const tone = o.tone ?? 'info', mark = { negative: '!', warning: '!', info: 'i' }[tone];
    openModal(
      <div className="ops-billing">
        <div className="es-modal" role="dialog" aria-modal="true" aria-label={o.title}>
          <div className="es-modal__scrim" onClick={closeModal} />
          <div className="es-modal__panel">
            <button type="button" className="es-modal__close" aria-label="閉じる" onClick={closeModal}><DsIcon name="X" size={18} /></button>
            <div className={`es-modal__mark es-modal__mark--${tone}`} aria-hidden="true">{mark}</div>
            <h2 className="es-modal__title">{o.title}</h2>
            <div className="es-modal__body"><p className="dsx-desc" style={{ margin: 0 }}>{o.body}</p></div>
            <div className="es-modal__actions">
              <button type="button" className="es-btn es-btn--outline es-btn--primary es-btn--lg es-btn--block" onClick={closeModal} autoFocus>{o.cancel ?? 'キャンセル'}</button>
              <button type="button" className={`es-btn es-btn--solid es-btn--${tone === 'negative' ? 'negative' : 'primary'} es-btn--lg es-btn--block`} onClick={async () => { closeModal(); await o.onOk(); }}>{o.ok ?? '確定する'}</button>
            </div>
          </div>
        </div>
      </div>,
    );
  };
}

/**
 * 金額の税込・税抜を2段で出す（2026/10/03 決定：実績精算は税込と税抜の両方）。上＝税込、下＝税抜（小さい字）。
 * base＝持っている金額が税込（実績精算の販売単価から出した額）か税抜（事務手数料・オプション）か。rate＝その行の税率
 */
export function TaxYen({ v, rate, base = 'in', signed, strong }: { v: number; rate: number; base?: 'in' | 'ex'; signed?: boolean; strong?: boolean }) {
  const p = taxPair(v, rate, base), f = signed ? yenSigned : yen;
  return <>{strong ? <b>{f(p.incl)}{TAX_IN}</b> : <>{f(p.incl)}{TAX_IN}</>}<div className="small">{f(p.ex)}{TAX_EX}</div></>;
}
