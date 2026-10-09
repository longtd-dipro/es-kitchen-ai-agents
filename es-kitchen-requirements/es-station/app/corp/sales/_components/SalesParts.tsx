'use client';

import { SortMenu } from '@/components/SortMenu';

import type { ReactNode } from 'react';
import { esTone } from '@/lib/format/status';
import { rem } from '@/lib/ui/rem';

/* 購入・ユーザー管理（旧：売上・ユーザー管理。元：iframe fsl）の部品。元は素の JS で innerHTML に組んでいた */

export { yen } from '@/lib/format/money';
const TONE: Record<string, string> = { 支払済: 'success', 返金済: 'negative', 返金中: 'warning', 連携中: 'success', 解除済: 'info', なし: 'neutral', 購入不可: 'negative' };
export const SBadge = ({ t }: { t: string }) => <span className={`es-badge es-badge--${esTone(t, TONE[t] ?? 'neutral')}`}>{t}</span>;

/** 選択（先頭は「すべて」にあたる見出し） */
export function SSel({ value, opts, ph, w = 160, onChange }: { value: string; opts: (string | [string, string])[]; ph: string; w?: number; onChange: (v: string) => void }) {
  return (
    <div className="es-input es-input--md es-select" style={{ minWidth: rem(w) }}>
      <select aria-label={ph} value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">{ph}</option>
        {opts.map((o) => { const [v, t] = typeof o === 'string' ? [o, o] : o; return <option key={v} value={v}>{t}</option>; })}
      </select>
    </div>
  );
}

/** 並べ替え（ボタン1つ。共通の SortMenu） */
export function SortCtl({ cols, sk, dir, onSk, onDir }: { cols: [string, string][]; sk: string; dir: 'asc' | 'desc'; onSk: (v: string) => void; onDir: () => void }) {
  return <SortMenu options={cols} value={sk} dir={dir} initialLabel="初期の順" onChange={(k, d) => { if (k !== sk) onSk(k); if (d !== dir) onDir(); }} />;
}

/** ページ送り（10／20／50件） */
export function Pager({ total, page, size, onPage, onSize }: { total: number; page: number; size: number; onPage: (p: number) => void; onSize: (n: number) => void }) {
  const pages = Math.max(1, Math.ceil(total / size));
  const p = Math.min(page, pages);
  const a = total ? (p - 1) * size + 1 : 0, b = Math.min(total, p * size);
  return (
    <div className="es-pagination" style={{ marginTop: '0.857143rem' }}>
      <span className="es-pagination__meta">{total}件中 {a}–{b}件</span>
      {Array.from({ length: pages }, (_, i) => i + 1).map((i) => (
        <button key={i} type="button" className={`es-page${i === p ? ' is-current' : ''}`} onClick={() => onPage(i)}>{i}</button>
      ))}
      <div className="es-input es-input--sm es-select es-pagination__per" style={{ width: '8.571429rem' }}>
        <select aria-label="表示件数" value={size} onChange={(e) => onSize(+e.target.value)}>
          {[10, 20, 50].map((n) => <option key={n} value={n}>{n}件／ページ</option>)}
        </select>
      </div>
    </div>
  );
}

/** 画面の外枠（元の fsl：ページ見出しの下に左右 24px・下 24px の余白） */
export function SalesPage({ head, children, modal }: { head: ReactNode; children: ReactNode; modal?: ReactNode }) {
  return (
    <div className="corp-docs s7-page">
      {head}
      <div style={{ padding: '0 1.714286rem 1.714286rem' }}>{children}</div>
      {modal}
    </div>
  );
}
