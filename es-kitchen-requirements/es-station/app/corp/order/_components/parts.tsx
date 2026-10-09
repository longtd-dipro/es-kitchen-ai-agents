'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { pdfsForCourse } from '@/lib/domain/menu';
import type { MenuPdf } from '@/lib/domain/types';
import { ST_TONE, stLabel, TAG_TONE } from '@/lib/corp/order/logic';
import type { CDl, CSite, Pref, ProdX } from '@/lib/corp/order/types';
import { DEMO } from '@/lib/demo';
import { Badge, Card, Icon, TLink } from './es';
import { useOrder } from './OrderProvider';
import { ZoomImage } from '../../_ui/ImageViewer';

/** 商品・資材の写真のサムネイル（押すと拡大：受付簿 No.56） */
export function Thumb({ src, name, cls = 'od-thumb' }: { src: string; name: string; cls?: string }) {
  return <ZoomImage className={cls} src={src} alt={name} title={name} />;
}

/** 枠の開閉ボタン「∨」（版 1.1 ③：受付期間・この月のご契約・検索条件・合計の帯）。open＝今開いている */
export function FoldBtn({ open, onToggle, label }: { open: boolean; onToggle: () => void; label: string }) {
  return (
    <button type="button" className="od-fold__btn" aria-expanded={open} aria-label={open ? label + 'を閉じる' : label + 'を開く'} title={open ? '閉じる' : '開く'} onClick={onToggle}>
      <Icon name={open ? 'CaretUp' : 'CaretDown'} size={18} />
    </button>
  );
}

export type MenuItemT = { label: string; icon?: string; disabled?: boolean; onPick: () => void };
/**
 * 「その他」メニュー（版 1.1 ①・CW_ORDER No.53）：押すとドロップダウンで項目を出す。押せない項目は灰色で残す。
 * 項目を選ぶか、外側を押すか、Esc で閉じる
 */
export function MoreMenu({ items, label = 'その他' }: { items: MenuItemT[]; label?: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', close); document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('mousedown', close); document.removeEventListener('keydown', esc); };
  }, [open]);
  return (
    <div className="od-more" ref={ref}>
      <button type="button" className="es-btn es-btn--outline es-btn--neutral es-btn--md" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen(!open)}>
        <span>{label}</span><Icon name={open ? 'CaretUp' : 'CaretDown'} size={16} />
      </button>
      {open ? (
        <div className="od-more__menu" role="menu" aria-label={label}>
          {items.map((it) => (
            <button key={it.label} type="button" role="menuitem" disabled={it.disabled} onClick={() => { if (it.disabled) return; setOpen(false); it.onPick(); }}>
              {it.icon ? <Icon name={it.icon} size={18} /> : null}<span>{it.label}</span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

/** 便の名前（色の点つき） */
export function DlLabel({ d, withDate }: { d: CDl; withDate?: boolean }) {
  return <span className={'od-dl ' + (d.t === 'frozen' ? 'fz' : 'd' + d.n)}><i />{d.l + (withDate ? ' ' + d.date : '')}</span>;
}
export function StatusBadge({ st }: { st: string }) {
  return <Badge tone={ST_TONE[st] || 'neutral'}>{stLabel(st)}</Badge>;
}
export function Tags({ p, extra }: { p: ProdX; extra?: ReactNode }) {
  return <span className="od-badges">{p.tags.map((t) => <Badge key={t} tone={TAG_TONE[t]}>{t}</Badge>)}{extra || null}</span>;
}
export function PlanLine({ x }: { x: CSite }) {
  return <div className="od-plan"><span className="es-mono">{x.planId}</span><b>月{x.plan}個プラン</b><span className="od-course">{'（' + x.course + '）'}</span><span>{x.dlvKind + '・' + x.eq}</span></div>;
}

/** 拠点タブ（拠点名＋オーダーステータス）。押したら onPick（入力中なら破棄の確認は呼ぶ側で） */

/** 画面内のタブ（P-TAB：role=tablist／tab、押したタブは URL の ?tab= に持たせる側で処理）。拠点タブの下の段に使う */
export function Tabs<K extends string>({ items, value, onChange, label }: { items: { key: K; label: string; count?: number }[]; value: K; onChange: (k: K) => void; label: string }) {
  return (
    <div className="od-sitetabs od-subtabs" role="tablist" aria-label={label}>
      {items.map((t) => (
        <button key={t.key} type="button" role="tab" aria-selected={t.key === value} className={'od-sitetab' + (t.key === value ? ' is-active' : '')} onClick={() => { if (t.key !== value) onChange(t.key); }}>
          {t.label}{t.count != null ? <small>{'（' + t.count + '）'}</small> : null}
        </button>
      ))}
    </div>
  );
}

export function SiteTabs({ kind, onPick }: { kind: 'order' | 'mat'; onPick: (id: string) => void }) {
  const { data, s } = useOrder();
  if (!data || !s) return null;
  return (
    <Card className="od-tabcard">
      <div className="od-sitetabs" role="tablist">
        {data.sites.map((x) => {
          const stx = kind === 'mat' ? data.matStatus[x.id] : data.orders[x.id]?.status;
          const cls = ({ '登録済': 'st-ok', 'ES登録済': 'st-es', 'デフォルト': 'st-def', '未注文': 'st-def' } as Record<string, string>)[stx] || '';
          return (
            <button key={x.id} type="button" role="tab" aria-selected={x.id === s.id} className={'od-sitetab' + (x.id === s.id ? ' is-active' : '')} onClick={() => { if (x.id !== s.id) onPick(x.id); }}>
              {x.short}<small className={cls}>{'（' + stLabel(stx) + '）'}</small>
            </button>
          );
        })}
      </div>
    </Card>
  );
}

/** 拠点の設定の1行 */
export function prefTxt(p: Pref, cats: string[], next: boolean) {
  const a: string[] = [];
  a.push(p.cats.length === cats.length ? 'カテゴリ すべて' : 'カテゴリ ' + p.cats.length + '／' + cats.length);
  a.push(p.short ? '短消費期限 取る' : '短消費期限 取らない'); a.push('金額（税込） ' + p.price.map((y) => y + '円').join('・'));
  if (p.ex.length) a.push('対象外 ' + p.ex.length + '品');
  a.push(next ? '次回以降も適用 ON（AI（自動提案））' : '次回以降も適用 OFF（ESキッチンの標準数）');
  return a.join('／');
}

/** 読み込み中 */
export function Loading() {
  return <div className="od-stack"><div className="es-skel-lines" aria-busy aria-label="読み込み中"><span className="es-skel" style={{ width: '40%' }} /><span className="es-skel" style={{ width: '86%' }} /><span className="es-skel" style={{ width: '64%' }} /></div></div>;
}

/** デモのときだけ：「月次注文デモの説明を開く」（元は外枠のサイドメニューの下） */
export function AboutLink({ onOpen }: { onOpen: () => void }) {
  if (!DEMO) return null;
  return <button type="button" className="od-aboutlink" onClick={onOpen}>月次注文デモの説明を開く</button>;
}

/**
 * メニューPDF（運営がメニュー編集で載せたファイル）。ファイル名で出し、押すと開く。
 * デモ：ファイルそのものの保存先はまだないので、開くときはお知らせだけ出す
 */
export function MenuPdfLinks({ pdfs: all, course }: { pdfs?: MenuPdf[]; course: string }) {
  const { toast } = useOrder();
  /* スタンダードのお客様は2つ（ライト用・スタンダード用）、ライトのお客様はライト用だけ（2026-10-06 受付簿 #238・台帳 F） */
  const pdfs = pdfsForCourse(all, course);
  if (!pdfs?.length) return <span className="od-small">未掲載</span>;
  /* 表のセルはファイル名を出さず「PDFを開く」だけ（名前は title）。ファイル名が長く表が横にはみ出るため */
  return <>{pdfs.map((f, i) => <span key={f.name} title={f.name}>{i > 0 ? '　' : ''}<TLink onClick={() => toast(f.name + ' を開きます' + (DEMO ? '（デモ：PDFの保存先はまだつないでいません）' : ''))}>{pdfs.length > 1 ? f.kind : 'PDFを開く'}</TLink></span>)}</>;
}
/**
 * 商品注文の受付期間の案内の右のリンク「メニューPDF」（版 1.1 ②・No.54）。新しいタブで開く（デモ：保存先はまだないのでお知らせだけ）。
 * スタンダードのお客様は2つ、ライトのお客様はライト用だけ（受付簿 No.63・#238・台帳 F）。複数あるときはファイル名を添えて並べる
 */
export function MenuPdfLink({ pdfs: all, course }: { pdfs?: MenuPdf[]; course: string }) {
  const { toast } = useOrder();
  const pdfs = pdfsForCourse(all, course);
  if (!pdfs.length) return <span className="od-small">メニューPDF 未掲載</span>;
  return <>{pdfs.map((f, i) => (
    <a key={f.name} href="#" className="od-link" title={f.name} style={i > 0 ? { marginLeft: '1em' } : undefined} onClick={(e) => { e.preventDefault(); toast(f.name + ' を新しいタブで開きます' + (DEMO ? '（デモ：PDFの保存先はまだつないでいません）' : '')); }}>{pdfs.length > 1 ? 'メニューPDF（' + f.name + '）' : 'メニューPDF'}</a>
  ))}</>;
}
