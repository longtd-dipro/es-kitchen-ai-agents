'use client';

import Link from 'next/link';
import { useEffect, useState, type ReactNode } from 'react';
import { useCorpSignedIn } from '../_ui/CorpProvider';
import { ES_ICONS } from './icons';
import { fmtAuto } from '@/lib/format/date';
import { esTone } from '@/lib/format/status';

/*
 * ホーム・お届け・申請・お知らせ・レビューの画面の部品。部品 16 の ES Kitchen（window.ESKitchen）と同じ HTML・クラス名を出す。
 * 見た目は枠（corp.css）と delivery.css（.corp-delivery の中だけ）。
 */

export const cx = (...a: (string | false | null | undefined)[]) => a.filter(Boolean).join(' ');

/** ログイン中のアカウント（領域に渡す corpId・branchId） */
export function useWho() {
  const { account } = useCorpSignedIn();
  return { corpId: account.corpId, ...(account.role === 'branch' && account.branchId ? { branchId: account.branchId } : {}) };
}

/** 画面の外枠（元の es-shell__content の余白） */
export function Page({ children }: { children: ReactNode }) {
  return <div className="corp-delivery"><div className="es-shell__content">{children}</div></div>;
}

export function EsIcon({ name, size = 20 }: { name: string; size?: number }) {
  const d = ES_ICONS[name];
  if (!d) return null;
  return (
    <svg className="es-icon" width={size} height={size} viewBox="0 0 32 32" fill="currentColor" aria-hidden="true">
      {d.map((s, i) => <path key={i} transform={`translate(${s[0]} ${s[1]})`} d={s[2]} fillRule={s[3] ? 'evenodd' : 'nonzero'} />)}
    </svg>
  );
}

type BtnProps = {
  variant?: 'solid' | 'outline' | 'ghost';
  tone?: 'primary' | 'neutral' | 'negative';
  size?: 'sm' | 'md' | 'lg';
  icon?: string;
  children?: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  'aria-label'?: string;
};
const btnCls = (p: BtnProps, iconOnly: boolean) => cx('es-btn', 'es-btn--' + (p.variant ?? 'solid'), 'es-btn--' + (p.tone ?? 'primary'), 'es-btn--' + (p.size ?? 'md'), iconOnly && 'es-btn--icon');
export function Button(p: BtnProps) {
  const iconOnly = !!p.icon && p.children == null;
  return (
    <button type="button" className={btnCls(p, iconOnly)} onClick={p.onClick} disabled={p.disabled} aria-label={p['aria-label']}>
      {p.icon && <EsIcon name={p.icon} size={p.size === 'lg' ? 24 : 20} />}
      {p.children != null && <span>{p.children}</span>}
    </button>
  );
}

export function Badge({ tone = 'neutral', children, outline, title, fixed }: { tone?: string; children: ReactNode; outline?: boolean; title?: string; fixed?: boolean }) {
  /* 状態の文字なら共通の色（lib/format/status.ts）。fixed＝渡した色のまま（ホームのマスのバッジ：台帳 E 2026-10-05 #42・#61 の色） */
  return <span className={cx('es-badge', 'es-badge--' + (fixed ? tone : esTone(children, tone)), outline && 'es-badge--outline')}>{title ? <span title={title}>{children}</span> : children}</span>;
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

/** 画面の見出し（es-pagehead page-h） */
export function PageHead({ crumbs, links, title, stat, sub, actions }: { crumbs: string[]; links?: Record<number, string>; title: ReactNode; stat?: ReactNode; sub?: ReactNode; actions?: ReactNode }) {
  return (
    <header className="es-pagehead page-h">
      <div className="es-pagehead__text">
        <Breadcrumb items={crumbs} links={links} />
        <h1 className="es-pagehead__title">{title}</h1>
        {stat && <div className="stat">{stat}</div>}
        {sub}
      </div>
      {actions && <div className="es-pagehead__actions">{actions}</div>}
    </header>
  );
}

export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return <div className="es-section-title"><h2>{children}</h2>{action && <div>{action}</div>}</div>;
}
export function Card({ children }: { children: ReactNode }) {
  return <section className="es-card">{children}</section>;
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

export function EmptyState({ title, icon, compact, children }: { title: ReactNode; icon?: string; compact?: boolean; children?: ReactNode }) {
  return (
    <div className={cx('es-empty', compact && 'es-empty--compact')}>
      <span className="es-empty__icon"><EsIcon name={icon ?? 'Search'} size={28} /></span>
      <b>{title}</b>
      {children && <div className="es-empty__desc">{children}</div>}
    </div>
  );
}

/** 読み取りだけの入力欄（ESKitchen.TextField read-only） */
export function ReadField({ label, value, helper }: { label: string; value: string; helper?: string }) {
  return (
    <div className="es-field">
      <label className="es-field__label">{label}</label>
      <div className="es-input es-input--md es-input--readonly"><input type="text" value={fmtAuto(value)} readOnly /></div>
      {helper && <p className="es-field__msg">{helper}</p>}
    </div>
  );
}

export type Notice = { at: string; category: string; tone?: string; note?: string; title: string; href?: string };
/** お知らせ・確認が必要な項目（ESKitchen.NoticeList）。href がないものは onNoLink。empty＝0件の文（I203） */
export function NoticeList({ items, onNoLink, empty = 'お知らせはありません。' }: { items: Notice[]; onNoLink: () => void; empty?: ReactNode }) {
  if (!items.length) return <EmptyState title={empty} icon="BellSimple" compact />;
  return (
    <ul className="es-notice">
      {items.map((it, i) => {
        const inner = <><span>{it.title}</span><EsIcon name="CaretRight" size={18} /></>;
        return (
          <li key={i} className="es-notice__item">
            <div className="es-notice__meta">
              {it.at && <span>{fmtAuto(it.at)}</span>}
              {it.category && <Badge tone={it.tone ?? 'neutral'}>{it.category}</Badge>}
              {it.note && <span className="es-notice__note">{it.note}</span>}
            </div>
            {it.href
              ? <Link className="es-notice__title" href={it.href}>{inner}</Link>
              : <a className="es-notice__title" href="#" onClick={(e) => { e.preventDefault(); onNoLink(); }}>{inner}</a>}
          </li>
        );
      })}
    </ul>
  );
}

/** ページ送り（ESKitchen.Pagination）。page・per は呼ぶ側が持つ */
export function Pagination({ total, page, per, onPage, onPer }: { total: number; page: number; per: number; onPage: (n: number) => void; onPer: (n: number) => void }) {
  const pages = Math.max(1, Math.ceil(total / per));
  const list: (number | '…')[] = [];
  for (let i = 1; i <= pages; i++) if (i === 1 || i === pages || Math.abs(i - page) <= 2) list.push(i); else if (list[list.length - 1] !== '…') list.push('…');
  return (
    <div className="es-pagination">
      <span className="es-pagination__meta">{total}件中 {total ? (page - 1) * per + 1 : 0}–{Math.min(page * per, total)}件</span>
      <button type="button" className="es-page" disabled={page === 1} onClick={() => onPage(page - 1)} aria-label="前へ"><EsIcon name="CaretLeft" size={14} /></button>
      {list.map((n, i) => n === '…'
        ? <span key={'e' + i} className="es-page es-page--gap">…</span>
        : <button type="button" key={n} className={cx('es-page', n === page && 'is-current')} aria-current={n === page ? 'page' : undefined} onClick={() => onPage(n)}>{n}</button>)}
      <button type="button" className="es-page" disabled={page === pages} onClick={() => onPage(page + 1)} aria-label="次へ"><EsIcon name="CaretRight" size={14} /></button>
      <div className="es-input es-select es-input--sm es-pagination__per">
        <select value={per} aria-label="表示件数" onChange={(e) => onPer(+e.target.value)}>{[10, 20, 50].map((n) => <option key={n} value={n}>{n}件/ページ</option>)}</select>
        <EsIcon name="CaretDown" size={14} />
      </div>
    </div>
  );
}

/** Esc で閉じる */
export function useEsc(fn: () => void, on = true) {
  useEffect(() => {
    if (!on) return;
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') fn(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [fn, on]);
}

/** 確認ダイアログ（RV-CORP-20261002 の rv-dlg） */
export function ConfirmDialog({ title, body, ok, onOk, onCancel }: { title: string; body: string[]; ok: string; onOk: () => void; onCancel: () => void }) {
  useEsc(onCancel);
  return (
    <div className="rv-ov" onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}>
      <div className="rv-dlg" role="dialog" aria-modal="true" aria-labelledby="rvDlgT">
        <h3 id="rvDlgT">{title}</h3>
        <div className="bd">{body.map((b, i) => <p key={i}>{b}</p>)}</div>
        <div className="ft">
          <button type="button" className="es-btn es-btn--outline es-btn--neutral es-btn--md" autoFocus onClick={onCancel}>キャンセル</button>
          <button type="button" className="es-btn es-btn--solid es-btn--negative es-btn--md" onClick={onOk}>{ok}</button>
        </div>
      </div>
    </div>
  );
}

/** 読み込み中・見つからないとき */
export function Loading() {
  return <Card><div className="es-skel-lines" aria-busy="true" aria-label="読み込み中"><span className="es-skel" style={{ width: '100%' }} /><span className="es-skel" style={{ width: '86%' }} /><span className="es-skel" style={{ width: '64%' }} /></div></Card>;
}
export function NotFound({ title, back, backLabel }: { title: string; back: string; backLabel: string }) {
  return <Card><EmptyState title={title} icon="Search"><Link href={back}>{backLabel}</Link></EmptyState></Card>;
}

/** ページ送りの状態（条件が変わったら 1ページ目へ） */
export function usePaging(key: string, per0 = 10) {
  const [page, setPage] = useState(1);
  const [per, setPer] = useState(per0);
  useEffect(() => { setPage(1); }, [key]);
  return { page, per, setPage, setPer: (n: number) => { setPer(n); setPage(1); } };
}
