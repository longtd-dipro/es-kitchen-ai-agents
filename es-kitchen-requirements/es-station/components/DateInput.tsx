'use client';

import { useEffect, useRef, useState, type CSSProperties, type InputHTMLAttributes } from 'react';
import { isoDate, isoYm, parseDateInput, parseYmInput } from '@/lib/format/date';

/*
 * 日付・年月の共通入力欄（全サイト共通・決定 8-1）。
 * ブラウザの言語に関係なく yyyy-mm-dd（年月は yyyy-mm）で表示・入力でき、右のボタンでカレンダーから選べる。
 * 値の受け渡しは <input type="date">／<input type="month"> と同じ（'yyyy-mm-dd'／'yyyy-mm'、空は ''）なので、
 *   <input type="date" value={v} onChange={(e) => set(e.target.value)} />
 * を
 *   <DateInput value={v} onChange={(e) => set(e.target.value)} />
 * に置き換えるだけでよい。className・style・id・aria-label・disabled・min・max もそのまま渡せる。
 * style は外側（入力欄＋ボタンの枠）に付く。es-input の中に置くときは fill を付ける。
 */

export type DateChange = { target: { value: string }; currentTarget: { value: string } };

type Base = Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'value' | 'defaultValue' | 'onChange' | 'min' | 'max' | 'style'> & {
  value?: string;
  defaultValue?: string;
  onChange?: (e: DateChange) => void;
  min?: string;
  max?: string;
  style?: CSSProperties;
  /** 入力欄そのものに付ける style */
  inputStyle?: CSSProperties;
  /** es-input などの flex の枠の中で、残りの幅いっぱいに広げる */
  fill?: boolean;
  /** 文の中に置く（inline-flex） */
  inline?: boolean;
};

const ev = (value: string): DateChange => ({ target: { value }, currentTarget: { value } });

const CalIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="4.5" width="18" height="16.5" rx="2" /><path d="M3 9.5h18M8 2.5v4M16 2.5v4" />
  </svg>
);

const btnCss = (dis: boolean): CSSProperties => ({
  position: 'absolute', right: '0.285714rem', top: '50%', transform: 'translateY(-50%)', width: '2rem', height: '2rem', padding: 0,
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', border: 0, borderRadius: 4, background: 'transparent',
  color: 'currentColor', opacity: dis ? 0.35 : 0.6, cursor: dis ? 'default' : 'pointer',
});
const wrapCss = (p: { fill?: boolean; inline?: boolean; style?: CSSProperties }): CSSProperties => ({
  position: 'relative', display: p.inline ? 'inline-flex' : 'flex', alignItems: 'stretch', minWidth: 0,
  ...(p.fill ? { flex: '1 1 auto', alignSelf: 'stretch' } : {}),
  ...p.style,
});

/** 文字の入力と、確定した値（親へ渡す値）を分けて持つ */
function useDraft(kind: 'date' | 'month', value: string | undefined, defaultValue: string | undefined, onChange?: (e: DateChange) => void) {
  const norm = kind === 'date' ? isoDate : isoYm;
  const parse = kind === 'date' ? parseDateInput : parseYmInput;
  const controlled = value !== undefined;
  const [inner, setInner] = useState(() => norm(defaultValue ?? ''));
  const cur = controlled ? norm(value) || '' : inner;
  const [draft, setDraft] = useState(cur);
  const last = useRef(cur);
  useEffect(() => {
    if (cur !== last.current) { last.current = cur; setDraft(cur); }
  }, [cur]);
  const emit = (v: string) => {
    last.current = v;
    if (!controlled) setInner(v);
    onChange?.(ev(v));
  };
  const type = (text: string) => {
    setDraft(text);
    const v = parse(text);
    if (v !== null && v !== cur) emit(v);
  };
  const pick = (v: string) => { setDraft(v); if (v !== cur) emit(v); };
  const blur = () => {
    const v = parse(draft);
    setDraft(v === null ? cur : v);
  };
  return { cur, draft, type, pick, blur };
}

/** 日付の入力欄（yyyy-mm-dd） */
export function DateInput({ value, defaultValue, onChange, min, max, style, inputStyle, fill, inline, className, disabled, readOnly, placeholder = 'yyyy-mm-dd', onBlur, ...rest }: Base) {
  const d = useDraft('date', value, defaultValue, onChange);
  const pk = useRef<HTMLInputElement>(null);
  const dis = !!disabled || !!readOnly;
  const open = () => {
    const el = pk.current;
    if (!el || dis) return;
    try {
      if (typeof el.showPicker === 'function') el.showPicker();
      else { el.focus(); el.click(); }
    } catch {
      el.focus();
    }
  };
  return (
    <span style={wrapCss({ fill, inline, style })}>
      <input {...rest} type="text" inputMode="numeric" autoComplete="off" className={className} disabled={disabled} readOnly={readOnly} placeholder={placeholder}
        value={d.draft} onChange={(e) => d.type(e.target.value)} onBlur={(e) => { d.blur(); onBlur?.(e); }}
        onKeyDown={(e) => { if (e.key === 'ArrowDown' && e.altKey) { e.preventDefault(); open(); } rest.onKeyDown?.(e); }}
        style={{ width: '100%', flex: '1 1 auto', minWidth: 0, paddingRight: '2.428571rem', ...inputStyle }} />
      {/* カレンダー（ブラウザのカレンダーを使う。値は常に yyyy-mm-dd） */}
      <input ref={pk} type="date" tabIndex={-1} aria-hidden="true" value={d.cur} min={min} max={max} disabled={dis}
        onChange={(e) => d.pick(e.target.value)}
        style={{ position: 'absolute', right: '0.285714rem', bottom: 0, width: '2rem', height: 1, opacity: 0, pointerEvents: 'none', border: 0, padding: 0 }} />
      <button type="button" tabIndex={-1} aria-label="カレンダーから選ぶ" title="カレンダーから選ぶ" disabled={dis} onClick={open} style={btnCss(dis)}><CalIcon /></button>
    </span>
  );
}

/** 年月の入力欄（yyyy-mm）。カレンダーは月の一覧（ブラウザの対応に関係なく同じ見た目） */
export function MonthInput({ value, defaultValue, onChange, min, max, style, inputStyle, fill, inline, className, disabled, readOnly, placeholder = 'yyyy-mm', onBlur, ...rest }: Base) {
  const d = useDraft('month', value, defaultValue, onChange);
  const dis = !!disabled || !!readOnly;
  const [open, setOpen] = useState(false);
  const thisYear = new Date().getFullYear();
  const [year, setYear] = useState(thisYear);
  const box = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => { if (box.current && !box.current.contains(e.target as Node)) setOpen(false); };
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('mousedown', close); document.removeEventListener('keydown', esc); };
  }, [open]);
  const toggle = () => {
    if (dis) return;
    if (!open) setYear(d.cur ? +d.cur.slice(0, 4) : thisYear);
    setOpen(!open);
  };
  const lo = min ? isoYm(min) : '', hi = max ? isoYm(max) : '';
  const cell = (m: number) => {
    const v = `${year}-${String(m).padStart(2, '0')}`;
    const off = (!!lo && v < lo) || (!!hi && v > hi);
    const on = v === d.cur;
    return (
      <button key={m} type="button" disabled={off} onClick={() => { d.pick(v); setOpen(false); }}
        style={{ height: '2.285714rem', border: '1px solid ' + (on ? 'var(--accent, var(--primary-text, #1F6FEB))' : 'transparent'), borderRadius: 4, background: on ? 'var(--accent-muted, var(--primary-muted, #DDF4FF))' : 'transparent', color: 'inherit', fontSize: '0.928571rem', cursor: off ? 'default' : 'pointer', opacity: off ? 0.35 : 1 }}>
        {String(m).padStart(2, '0')}
      </button>
    );
  };
  const nav: CSSProperties = { width: '2rem', height: '2rem', border: 0, background: 'transparent', cursor: 'pointer', fontSize: '1.142857rem', color: 'inherit' };
  return (
    <span ref={box} style={wrapCss({ fill, inline, style })}>
      <input {...rest} type="text" inputMode="numeric" autoComplete="off" className={className} disabled={disabled} readOnly={readOnly} placeholder={placeholder}
        value={d.draft} onChange={(e) => d.type(e.target.value)} onBlur={(e) => { d.blur(); onBlur?.(e); }}
        onKeyDown={(e) => { if (e.key === 'ArrowDown' && e.altKey) { e.preventDefault(); toggle(); } rest.onKeyDown?.(e); }}
        style={{ width: '100%', flex: '1 1 auto', minWidth: 0, paddingRight: '2.428571rem', ...inputStyle }} />
      <button type="button" aria-label="月を選ぶ" title="月を選ぶ" aria-expanded={open} disabled={dis} onClick={toggle} style={btnCss(dis)}><CalIcon /></button>
      {open && (
        <span role="dialog" aria-label="月を選ぶ" style={{ position: 'absolute', top: 'calc(100% + 0.285714rem)', left: 0, zIndex: 1000, width: '16.571429rem', padding: '0.571429rem', background: 'var(--surface, #fff)', color: 'var(--fg, var(--text-high, #1F2328))', border: '1px solid var(--line-strong, var(--divider-middle, #D0D7DE))', borderRadius: 6, boxShadow: '0 8px 24px rgba(0,0,0,.15)', display: 'block' }}>
          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.428571rem' }}>
            <button type="button" aria-label="前の年" style={nav} onClick={() => setYear(year - 1)}>‹</button>
            <b style={{ fontSize: '1rem' }}>{year}</b>
            <button type="button" aria-label="次の年" style={nav} onClick={() => setYear(year + 1)}>›</button>
          </span>
          <span style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.285714rem' }}>{Array.from({ length: 12 }, (_, i) => cell(i + 1))}</span>
        </span>
      )}
    </span>
  );
}
