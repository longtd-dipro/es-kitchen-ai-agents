'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * 並べ替え（デザインシステムの「並べ替え」ボタン。1つの欄）。
 * 押すとメニューが開き、上に「昇順／降順」、下に項目（initialLabel があれば先頭に「初期の順」）が並ぶ。選ぶとすぐ効く（検索ボタンは要らない）。
 * ボタンの文字：項目を選んでいないときは「並べ替え」、選んでいるときは「並べ替え：項目（昇順）」。
 * 全サイト・全一覧で共通（運営Web の ListView・マスタ一覧・レビュー・メニュー・発注・申請、法人Web の売上一覧。hong 2026-10-08「全画面同様」）。
 * 見た目のクラスは es-btn（outline／primary）と es-sortmenu（app/globals.css）。
 */
export function SortMenu({ options, value, dir, onChange, initialLabel, className }: {
  /** [値, 表示] の並び（一覧の列） */
  options: [string, string][];
  /** 選んでいる項目の値（'' ＝初期の順） */
  value: string;
  dir: 'asc' | 'desc';
  /** 項目か向きが変わったとき。項目を選んだときは value に新しい項目、向きだけ変えたときは今の value */
  onChange: (value: string, dir: 'asc' | 'desc') => void;
  /** 先頭の「初期の順」の表示（省くと「初期の順」の選択肢を出さない＝初期の項目が常に選ばれている一覧） */
  initialLabel?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const away = (e: MouseEvent) => { if (!wrap.current?.contains(e.target as Node)) setOpen(false); };
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', away); document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('mousedown', away); document.removeEventListener('keydown', esc); };
  }, [open]);
  const cur = options.find(([k]) => k === value);
  const pick = (k: string) => { onChange(k, dir); setOpen(false); };
  return (
    <div className={`es-sortmenu${className ? ' ' + className : ''}`} ref={wrap}>
      <button type="button" className="es-btn es-btn--outline es-btn--primary es-btn--md es-sortbtn" aria-label="並べ替え" aria-haspopup="listbox" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        <span>並べ替え{cur && (value || !initialLabel) ? `：${cur[1]}（${dir === 'desc' ? '降順' : '昇順'}）` : ''}</span>
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 7h10M4 12h7M4 17h4M17 6v12M13.5 14.5 17 18l3.5-3.5" /></svg>
      </button>
      {open && (
        <div className="es-sortmenu__list" role="listbox" aria-label="並べ替えの項目">
          <div className="es-sortmenu__dirs" role="group" aria-label="昇順・降順">
            {(['asc', 'desc'] as const).map((d) => (
              <button key={d} type="button" aria-pressed={dir === d} className={dir === d ? 'on' : ''} onClick={() => onChange(value, d)}>{d === 'asc' ? '昇順' : '降順'}</button>
            ))}
          </div>
          {initialLabel !== undefined && (
            <button type="button" role="option" aria-selected={!value} className={!value ? 'on' : ''} onClick={() => pick('')}>{initialLabel}</button>
          )}
          {options.map(([k, l]) => (
            <button key={k} type="button" role="option" aria-selected={value === k} className={value === k ? 'on' : ''} onClick={() => pick(k)}>{l}</button>
          ))}
        </div>
      )}
    </div>
  );
}
