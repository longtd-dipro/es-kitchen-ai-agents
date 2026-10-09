'use client';

import type { ReactNode } from 'react';
import survey from '@/lib/domain/areas/survey';
import { domainApi } from '@/lib/domain/client';
import { DateInput } from '@/components/DateInput';
import { isoDate } from '@/lib/format/date';
import type { SurveyStatus } from '@/lib/domain/survey';
import { opsCls } from '@/lib/format/status';

/* アンケート管理の画面で共通の部品（データは共通データ lib/domain/areas/survey.ts） */

export const svApi = domainApi(survey);
export const LIST = '/ops/surveys';
/** 運営の操作した人（運営Web の見本のログイン中のユーザー） */
export const ME = 'にっしぐち';

const ST_CLS: Record<SurveyStatus, string> = { 公開中: 'b-ok', 予定中: 'b-info', 終了: 'b-mute', 配信停止: 'b-warn', 削除済: 'b-ng' };
export function StBadge({ v }: { v: SurveyStatus | string }) {
  return <span className={`badge ${opsCls(v, ST_CLS[v as SurveyStatus] ?? 'b-mute')}`}>{v}</span>;
}

/**
 * 日時の入力（yyyy-mm-dd ＋ HH:mm）。値は共通データの形 'YYYY/MM/DD HH:mm'（日付だけなら時刻は def）
 */
export function DateTimeInput({ value, onChange, disabled, id, err, def = '09:00', label }: {
  value: string; onChange: (v: string) => void; disabled?: boolean; id?: string; err?: boolean; def?: string; label: string;
}) {
  const d = isoDate(value.slice(0, 10)), t = value.slice(11, 16);
  const emit = (date: string, time: string) => onChange(date ? `${date.replace(/-/g, '/')} ${time || def}` : '');
  return (
    <div style={{ display: 'flex', gap: '0.571429rem' }}>
      <DateInput id={id} className={`inp${err ? ' err' : ''}`} aria-label={`${label}（日付）`} value={d} disabled={disabled} fill onChange={(e) => emit(e.target.value, t)} />
      <input className={`inp${err ? ' err' : ''}`} type="time" step={60} aria-label={`${label}（時刻）`} style={{ width: '8.571429rem', flex: 'none' }} value={t} disabled={disabled || !d}
        onChange={(e) => emit(d, e.target.value)} />
    </div>
  );
}

/** 小さいページ送り（表・カードの中。全N件 ‹ 1 2 3 ›） */
export function MiniPager({ total, page, per, onPage }: { total: number; page: number; per: number; onPage: (n: number) => void }) {
  const pages = Math.max(1, Math.ceil(total / per));
  if (total <= per) return <div className="pager" style={{ justifyContent: 'flex-end' }}><span>全{total}件</span></div>;
  const nums = Array.from({ length: pages }, (_, i) => i + 1).filter((n) => n === 1 || n === pages || Math.abs(n - page) <= 2);
  const out: ReactNode[] = [];
  nums.forEach((n, i) => {
    if (i && n - nums[i - 1] > 1) out.push(<span key={`g${n}`} className="muted">…</span>);
    out.push(<button key={n} className={n === page ? 'on' : ''} onClick={() => onPage(n)}>{n}</button>);
  });
  return (
    <div className="pager" style={{ justifyContent: 'flex-end' }}>
      <span>全{total}件</span>
      <button disabled={page <= 1} aria-label="前へ" onClick={() => onPage(page - 1)}>‹</button>
      {out}
      <button disabled={page >= pages} aria-label="次へ" onClick={() => onPage(page + 1)}>›</button>
    </div>
  );
}
