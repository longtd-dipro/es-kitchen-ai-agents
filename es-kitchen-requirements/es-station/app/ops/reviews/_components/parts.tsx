'use client';

import Link from 'next/link';
import type { MouseEvent, ReactNode } from 'react';
import { ANON } from '@/lib/ops/reviews/logic';

/* レビュー・ご意見の小さな部品（元の stars()・tag()・none・nick()） */

/** ★評価（★の数＋数字） */
export function Stars({ s }: { s: number }) {
  return (
    <span className="rv-stars" aria-label={`評価${s}`}>
      <span className="s">{'★'.repeat(s)}<i>{'★'.repeat(5 - s)}</i></span><b>{s}</b>
    </span>
  );
}

/** 評価タグ */
export const Tag = ({ t }: { t: string }) => <span className="es-badge es-badge--neutral">{t}</span>;

/** なし（—） */
export const None = () => <span className="rv-none">—</span>;

/** ニックネーム（未設定は「匿名ユーザー」） */
export const Nick = ({ nick }: { nick: string }) => (nick ? <>{nick}</> : <span className="rv-anon">{ANON}</span>);

/** 退会済のバッジ */
export const LeftBadge = () => <span className="es-badge es-badge--neutral">退会済</span>;

/** 見た目だけのリンク（元でもどこへも飛ばない） */
export function DeadLink({ children, className = 'es-mono' }: { children: ReactNode; className?: string }) {
  return <a href="#" className={className} onClick={(e: MouseEvent) => e.preventDefault()}>{children}</a>;
}

/** パンくず（レビュー・ご意見 / …） */
export function Crumbs({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav className="es-breadcrumb" aria-label="パンくず">
      <DeadLink className="">レビュー・ご意見</DeadLink>
      {items.map((c, i) => (
        <span key={i} style={{ display: 'contents' }}>
          <span className="es-breadcrumb__sep">/</span>
          {c.href ? <Link href={c.href}>{c.label}</Link> : <span className="es-breadcrumb__cur">{c.label}</span>}
        </span>
      ))}
    </nav>
  );
}
