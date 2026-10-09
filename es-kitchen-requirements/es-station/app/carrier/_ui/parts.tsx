'use client';

import { PER_OPTIONS, type PagerProps } from '@/lib/ui/paging';
import Link from 'next/link';
import { Fragment, useState, type ReactNode } from 'react';
import { TEMP_LABEL } from '@/lib/carrier/logic';
import type { DeliveryView, Staff, Temp } from '@/lib/carrier/types';
import { Icon } from './Icon';
import { useCarrier } from './CarrierProvider';
import { fmtAutoNode } from '@/lib/format/date';
import { carrierCls } from '@/lib/format/status';

/* 委託配送先Web の共通部品（元の fld・collap・crumb・tagHtml・dstBadge・lic など） */

/** 開閉できる区切り（元の collap） */
export function Collap({ title, children, id }: { title: ReactNode; children: ReactNode; id?: string }) {
  const [shut, setShut] = useState(false);
  return (
    <section className={`collap${shut ? ' shut' : ''}`} id={id}>
      <header>{title}<button type="button" className="icb" aria-label="開閉" onClick={() => setShut(!shut)}><Icon name="up" /></button></header>
      <div className="cbody">{children}</div>
    </section>
  );
}

/** 項目（元の fld。中身を渡さなければ読み取りの入力欄） */
export function Fld({ label, value, req, cls = '', children, ph }: { label: ReactNode; value?: string | number; req?: boolean; cls?: string; children?: ReactNode; ph?: string }) {
  return (
    <div className={`fld ${cls}`}>
      <span className="lb">{label}{req && <span className="req">*</span>}</span>
      {children ?? <input className="inp" readOnly value={fmtAutoNode(value) ?? ''} placeholder={ph ?? (typeof label === 'string' ? label : '')} />}
    </div>
  );
}

/** パンくず（最後以外はリンク） */
export function Crumb({ items }: { items: (string | [string, string])[] }) {
  return (
    <nav className="crumb" aria-label="パンくず">
      {items.map((x, i) => (Array.isArray(x)
        ? <Fragment key={i}><Link href={x[1]}>{x[0]}</Link><span>/</span></Fragment>
        : <span key={i}>{x}</span>))}
    </nav>
  );
}

const TEMP_IC: Record<Temp, string> = { f: 'snow', r: 'fridge', m: 'box' };
/** 温度帯のタグ（full＝「冷凍」などの名前、そうでなければ件数） */
export function Tags({ t, full }: { t: Partial<Record<Temp, number>>; full?: boolean }) {
  return <>{(['f', 'r', 'm'] as Temp[]).filter((k) => t[k]).map((k) => <span key={k} className={`tag t-${k}`}><Icon name={TEMP_IC[k]} />{full ? TEMP_LABEL[k] : `${t[k]}件`}</span>)}</>;
}
/** 温度帯のタグ（アイコンだけ） */
export const TagIcon = ({ k }: { k: Temp }) => <span className={`tag t-${k}`}><Icon name={TEMP_IC[k]} /></span>;

/** 配送の状態（トラブル報告・出荷指示の再送待ち・代替品の札つき） */
export function DstBadge({ d, plain }: { d: Pick<DeliveryView, 'st'> & Partial<DeliveryView>; plain?: boolean }) {
  return (
    <>
      <span className={`badge ${carrierCls(d.st)}`}>{d.st}</span>
      {!plain && d.trouble && <><br /><span className="badge b-warn" style={{ marginTop: 2 }}><Icon name="warn" />トラブル報告</span></>}
      {!plain && d.resend && <><br /><span className="badge b-amber" style={{ marginTop: 2 }}>出荷指示の再送待ち</span></>}
      {!plain && d.alt && <><br /><span className="badge b-amber" style={{ marginTop: 2 }} title={d.alt}>代替品あり・出荷指示 rev2</span></>}
    </>
  );
}

/** 免許証の絵（元の lic） */
export function Lic({ on, big }: { on: number | boolean; big?: boolean }) {
  return on
    ? <span className={`lic ${big ? 'big' : ''}`} role="img" aria-label="免許証"><i /><b /><em /></span>
    : <span className={`lic none ${big ? 'big' : ''}`} role="img" aria-label="免許証未登録"><Icon name="user" /></span>;
}

/** スタッフの名前（ID つき） */
export const stfName = (staff: Staff[], id: string | null) => { const s = staff.find((x) => x.id === id); return s ? `${s.name}（${s.id}）` : '—'; };

/** モーダル（元の modal-back。背景を押すと閉じる） */
export function Modal({ onClose, children, cls = '', label, busy }: { onClose: () => void; children: ReactNode; cls?: string; label?: string; busy?: boolean }) {
  return (
    <div className="modal-back" onClick={(e) => { if (e.target === e.currentTarget && !busy) onClose(); }} onKeyDown={(e) => { if (e.key === 'Escape' && !busy) onClose(); }}>
      <div className={`modal ${cls}`} role="dialog" aria-modal="true" aria-label={label}>{children}</div>
    </div>
  );
}
/** モーダルの見出し（閉じるボタンつき） */
export function ModalHead({ children, onClose, busy }: { children: ReactNode; onClose: () => void; busy?: boolean }) {
  return <header><span>{children}</span><button type="button" className="x" aria-label="閉じる" disabled={busy} onClick={onClose}><Icon name="x" /></button></header>;
}

/** 一覧の下のページ送り（見本は1ページだけ） */
export function Pager({ text, per, pg }: { text?: ReactNode; per?: boolean; pg?: PagerProps }) {
  /* pg（usePaging の props）があれば、ページ送りと表示件数（10／20／50）が実際に効く */
  if (pg) {
    const pages = Math.max(1, Math.ceil(pg.total / pg.per));
    const a = pg.total ? (pg.page - 1) * pg.per + 1 : 0, b = Math.min(pg.total, pg.page * pg.per);
    return (
      <div className="pager">
        <span>{pg.total}件中 {a}–{b}件</span>
        <button type="button" aria-label="前へ" disabled={pg.page <= 1} onClick={() => pg.onPage(pg.page - 1)}>‹</button>
        {Array.from({ length: pages }, (_, i) => i + 1).map((n) => <button key={n} type="button" className={n === pg.page ? 'on' : ''} onClick={() => pg.onPage(n)}>{n}</button>)}
        <button type="button" aria-label="次へ" disabled={pg.page >= pages} onClick={() => pg.onPage(pg.page + 1)}>›</button>
        <select className="inp" style={{ width: '8.571429rem', minHeight: '2rem', padding: '2px 2.142857rem 2px 0.571429rem', fontSize: '0.928571rem' }} aria-label="表示件数" value={pg.per} onChange={(e) => pg.onPer(+e.target.value)}>
          {PER_OPTIONS.map((n) => <option key={n} value={n}>{n}件/ページ</option>)}
        </select>
      </div>
    );
  }
  return (
    <div className="pager">
      <span>{text}</span>
      <button type="button" aria-label="前へ">‹</button><button type="button" className="on">1</button><button type="button" aria-label="次へ">›</button>
      {per && <select className="inp" style={{ width: '8.571429rem', minHeight: '2rem', padding: '2px 2.142857rem 2px 0.571429rem', fontSize: '0.928571rem' }} aria-label="表示件数"><option>10件/ページ</option></select>}
    </div>
  );
}

/** 郵便番号の「住所検索」（郵便番号のデータがまだないので、押すとお知らせだけ出す） */
export function ZipButton() {
  const { toast } = useCarrier();
  return <button type="button" className="btn" onClick={() => toast('住所検索はまだつないでいません（郵便番号のデータがありません）')}>住所検索</button>;
}

/** 検索条件を変えたが、まだ「検索」を押していない印（2026/10/03 決定：検索は「検索」か Enter で効く） */
/** 「未適用」の印は出さない（台帳 F 2026-10-05：全部の一覧）。呼び出し側の書き方を変えないため残す */
export const Unapplied = (_: { show: boolean }) => null;

/** 読み込み中・見つからない */
export const Loading = () => <p className="hint" style={{ padding: '1.142857rem' }}>読み込み中…</p>;
export function NotFound({ text, back, href }: { text: string; back: string; href: string }) {
  return <div className="placeholder"><p style={{ margin: '0 0 0.857143rem' }}>{text}</p><Link href={href} className="linkbtn">{back}</Link></div>;
}
