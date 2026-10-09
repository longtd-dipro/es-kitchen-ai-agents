'use client';

import { Fragment, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { Icon } from '../../_ui/Icon';
import { SortMenu } from '@/components/SortMenu';
import { hideRulesOf, MULTI_SEP, rangeKey, searchKeysOf, showKey, type ListApi } from './useList';
import type { ListCol, ListFilter } from './types';
import { DateInput, MonthInput } from '@/components/DateInput';
import { fmtAuto } from '@/lib/format/date';

/* 一覧の共通の部品（元の filterBlock・table・pager）。クラスは ops.css（.filter・.tbl・.pager） */

/** 複数選べる条件（チェックの並び。何も選ばない＝すべて）。FilterBlock の multi と、画面ごとの条件の欄で使う */
export function MultiCheck({ label, opts, value, onChange, className }: { label: string; opts: string[]; value: string[]; onChange: (v: string[]) => void; className?: string }) {
  return (
    <div className={className} role="group" aria-label={label}>
      <span className="muted" style={{ fontSize: '0.857143rem' }}>{label}（複数選べます）</span>
      <div style={{ display: 'flex', flexWrap: 'wrap', columnGap: '1.142857rem' }}>
        {opts.map((o) => <label key={o} className="delchk"><input type="checkbox" checked={value.includes(o)} onChange={() => onChange(value.includes(o) ? value.filter((x) => x !== o) : [...value, o])} />{o}</label>)}
      </div>
    </div>
  );
}

/**
 * 「未適用」の印（条件を変えたが、まだ「検索」を押していない）。検索ボタンのそばに置く。
 * 検索条件は「検索」か Enter で初めて効く（2026/10/03 決定：入力の途中で一覧が動かないように）
 */
export function UnappliedMark(_: { show: boolean; /** ES Kitchen の部品（es-…）の画面で使うとき */ es?: boolean }) {
  /* 「未適用」の印は出さない（hong 2026/10/05：全部の一覧から外す。旧：条件を変えてまだ「検索」を押していないときに「検索」の横に出す） */
  return null;
}

/** 空の値は同じものとして、2つの条件（列 → 値）が同じか */
export const sameConds = (a: Record<string, string>, b: Record<string, string>) => {
  const ks = new Set([...Object.keys(a), ...Object.keys(b)]);
  return [...ks].every((k) => (a[k] ?? '') === (b[k] ?? ''));
};

/**
 * 検索条件（元の filterBlock）。cols は並べ替えの項目に使う。選ぶ・入れる条件はいったん手元に持ち、「検索」か Enter で一覧に効かせる。
 * 見た目は ES Kitchen デザインシステムの es-search（マスタ一覧と同じ。hong 2026-10-05：全部の一覧でそろえる）：
 * 条件の欄は左に折り返し、右に「クリア」「検索」と並べ替え。欄が2行以上に折り返すときだけ開閉のボタンを出す。
 */
export function FilterBlock<R>({ list, filters, cols, extra, hasDel, onReset, onApply, extraDirty }: {
  list: ListApi; filters: ListFilter[] | null; cols: ListCol<R>[];
  /** 条件の並びの最後（クリア・検索の前）に足すもの */
  extra?: ReactNode;
  /** 「削除済みを表示しない」を出す */
  hasDel?: boolean;
  /** クリアを押したとき、一覧の状態のほかに戻すもの（画面ごとの条件など） */
  onReset?: () => void;
  /** 「検索」・Enter を押したとき、一覧の状態のほかに効かせるもの（extra の条件など） */
  onApply?: () => void;
  /** extra の条件を変えたが、まだ「検索」を押していない（「未適用」を出す） */
  extraDirty?: boolean;
}) {
  const { st, set, reset: resetList } = list;
  const reset = () => { resetList(); onReset?.(); };
  const [q, setQ] = useState(st.q);
  const [d, setD] = useState(st.f);
  const [hd, setHd] = useState(st.hideDel);
  useEffect(() => setQ(st.q), [st.q]);
  useEffect(() => setD(st.f), [st.f]);
  useEffect(() => setHd(st.hideDel), [st.hideDel]);
  /* 条件の欄が2行以上に折り返したときだけ開閉のボタンを出す（レビュー・マスタ一覧と同じ） */
  const fieldsRef = useRef<HTMLDivElement>(null);
  const [wrapped, setWrapped] = useState(false);
  useLayoutEffect(() => {
    const f = fieldsRef.current;
    if (!f) return;
    const check = () => {
      let top: number | null = null, w = false;
      for (const c of Array.from(f.children) as HTMLElement[]) {
        if (top === null) top = c.offsetTop;
        else if (c.offsetTop > top + 4) { w = true; break; }
      }
      setWrapped(w);
    };
    check();
    if (!window.ResizeObserver) return;
    const ro = new ResizeObserver(check);
    ro.observe(f);
    return () => ro.disconnect();
  }, [filters]);
  if (!filters) return null;
  const setC = (k: string, v: string) => setD((x) => ({ ...x, [k]: v }));
  const apply = () => { set({ q: q.trim(), f: d, hideDel: hd, page: 1 }); onApply?.(); };
  const dirty = q.trim() !== st.q || !sameConds(d, st.f) || hd !== st.hideDel || !!extraDirty;
  const sortCols = cols.filter((c) => c.key && c.key[0] !== '_');
  const showDel = hasDel || filters.some((f) => f.t === 'select' && !f.init && f.opts.includes('削除済'));
  const collapsed = wrapped && !st.open;
  return (
    <form className={`filter es-search${collapsed ? ' is-collapsed' : ''}`} role="search" onSubmit={(e) => { e.preventDefault(); apply(); }}>
      <div className="es-search__left">
        <button type="button" className={`tog es-search__toggle${wrapped ? '' : ' hide'}`} aria-expanded={!collapsed} aria-label={collapsed ? '検索条件を開く' : '検索条件を閉じる'} onClick={() => set({ open: !st.open })}><Icon name="up" /></button>
        <div className="es-search__fields" ref={fieldsRef}>
          {filters.map((f, i) => {
            const cls = f.span === 2 ? 'span2' : '';
            const col = ('col' in f && f.col) || `none:${i}`;
            if (f.t === 'search') {
              return (
                <div key={i} className={`search ${cls}`}>
                  <Icon name="search" />
                  <input className="inp" placeholder={f.ph} value={q} onChange={(e) => setQ(e.target.value)} />
                </div>
              );
            }
            if (f.t === 'month') {
              return (
                <div key={i} className={cls}>
                  <MonthInput className="inp" aria-label={f.ph} value={d[col] ?? ''} onChange={(e) => setC(col, e.target.value)} />
                </div>
              );
            }
            if (f.t === 'range') {
              /* 期間（から〜まで）。2つの欄は別々のマス */
              return (['from', 'to'] as const).map((end) => {
                const k = rangeKey(f.col, end), label = `${f.ph}（${end === 'from' ? 'から' : 'まで'}）`;
                return (
                  <div key={`${i}${end}`} className={cls}>
                    <DateInput className="inp" aria-label={label} placeholder={label} value={d[k] ?? ''} onChange={(e) => setC(k, e.target.value)} />
                  </div>
                );
              });
            }
            if (f.t === 'monthRange') {
              /* 月の範囲（開始月〜終了月）。終了月は開始月より前を選べない。開始月を終了月より後にしたら終了月も合わせる */
              const kf = rangeKey(f.col, 'from'), kt = rangeKey(f.col, 'to'), from = d[kf] || f.init, to = d[kt] || f.init;
              return (
                <Fragment key={i}>
                  <div className={cls}>
                    <select className="sel" aria-label={`${f.ph}（開始月）`} value={from} onChange={(e) => { const v = e.target.value; setD((x) => ({ ...x, [kf]: v, [kt]: to < v ? v : (x[kt] ?? '') })); }}>
                      {f.opts.map((o) => <option key={o} value={o}>{fmtAuto(o)}</option>)}
                    </select>
                  </div>
                  <div className={cls}>
                    <select className="sel" aria-label={`${f.ph}（終了月）`} value={to} onChange={(e) => setC(kt, e.target.value)}>
                      {f.opts.map((o) => <option key={o} value={o} disabled={o < from}>{fmtAuto(o)}</option>)}
                    </select>
                  </div>
                </Fragment>
              );
            }
            if (f.t === 'multi') {
              const on = (d[f.col] ?? '').split(MULTI_SEP).filter(Boolean);
              return <MultiCheck key={i} className="span2" label={f.ph} opts={f.opts} value={on} onChange={(v) => setC(f.col, v.join(MULTI_SEP))} />;
            }
            if (f.t === 'show') {
              /* 「○○も表示」：外れているとき（既定）は col＝val の行を出さない */
              return (
                <label key={i} className={`delchk ${cls}`}>
                  <input type="checkbox" checked={d[showKey(f.col)] === '1'} onChange={(e) => setC(showKey(f.col), e.target.checked ? '1' : '')} />{f.ph}
                </label>
              );
            }
            return (
              <div key={i} className={cls}>
                <select className="sel" aria-label={f.ph} value={d[col] || f.init || ''} onChange={(e) => setC(col, e.target.value)}>
                  {f.init ? null : <option value="">{f.ph}</option>}
                  {f.opts.map((o) => <option key={o} value={o}>{fmtAuto(o)}</option>)}
                </select>
              </div>
            );
          })}
          {extra}
          {showDel && (
            <label className="delchk">
              <input type="checkbox" checked={hd} onChange={(e) => setHd(e.target.checked)} />削除済みを表示しない
            </label>
          )}
        </div>
      </div>
      <div className="es-search__actions">
        <div className="f-act es-search__main">
          <button type="button" className="btn out" onClick={reset}>クリア</button>
          <UnappliedMark show={dirty} />
          <button type="submit" className="btn pri">検索</button>
        </div>
        <div className="es-search__extra">
          <SortMenu options={sortCols.map((c) => [c.key, c.label])} value={st.sk} dir={st.dir} initialLabel="初期の順" onChange={(k, d) => set({ sk: k, dir: d, page: 1 })} />
        </div>
      </div>
    </form>
  );
}

/** ページ送り（元の pager） */
export function Pager({ list, total }: { list: ListApi; total: number }) {
  const { st, set } = list;
  const pages = Math.max(1, Math.ceil(total / st.size));
  const page = Math.min(st.page, pages);
  const a = total ? (page - 1) * st.size + 1 : 0, b = Math.min(total, page * st.size);
  return (
    <div className="pager">
      <span>{total}件中 {a}–{b}件</span>
      <button disabled={page <= 1} aria-label="前へ" onClick={() => set({ page: page - 1 })}>‹</button>
      {Array.from({ length: pages }, (_, i) => i + 1).map((n) => <button key={n} className={n === page ? 'on' : ''} onClick={() => set({ page: n })}>{n}</button>)}
      <button disabled={page >= pages} aria-label="次へ" onClick={() => set({ page: page + 1 })}>›</button>
      <select className="sel" aria-label="表示件数" value={st.size} onChange={(e) => set({ size: +e.target.value, page: 1 })}>
        {[10, 20, 50].map((n) => <option key={n} value={n}>{n}件／ページ</option>)}
      </select>
    </div>
  );
}

/** 一覧の表＋ページ送り（元の table）。rows は絞り込んだ後の行 */
export function ListTable<R>({ list, cols, rows, noNo, nopage, foot, rowKey }: {
  list: ListApi; cols: ListCol<R>[]; rows: R[];
  /** No の列を出さない */
  noNo?: boolean;
  /** ページ送りをしない（全部出す） */
  nopage?: boolean;
  /** 表の最後に足す行（合計など） */
  foot?: ReactNode;
  rowKey?: (r: R, i: number) => string;
}) {
  const { st } = list;
  const pages = Math.max(1, Math.ceil(rows.length / st.size));
  const page = Math.min(st.page, pages);
  const start = nopage ? 0 : (page - 1) * st.size;
  const pageRows = nopage ? rows : rows.slice(start, start + st.size);
  const cell = (c: ListCol<R>, r: R, i: number) => c.td ? c.td(r, i) : <td className={c.num ? 'num' : ''}>{fmtAuto((r as Record<string, unknown>)[c.key] ?? '')}</td>;
  return (
    <>
      <div className="tbl-wrap">
        <table className="tbl">
          <thead>
            <tr>
              {!noNo && <th>No</th>}
              {cols.map((c) => <th key={c.key} className={`${c.num ? 'num' : ''}${c.act ? ' act' : ''}`}>{c.label}</th>)}
            </tr>
          </thead>
          <tbody>
            {pageRows.length ? pageRows.map((r, i) => (
              <tr key={rowKey ? rowKey(r, i) : start + i}>
                {!noNo && <td>{start + i + 1}</td>}
                {cols.map((c) => <Fragment key={c.key}>{cell(c, r, start + i)}</Fragment>)}
              </tr>
            )) : (
              <tr><td colSpan={cols.length + 1} className="empty">表示するデータがありません。</td></tr>
            )}
            {foot}
          </tbody>
        </table>
      </div>
      {!nopage && <Pager list={list} total={rows.length} />}
    </>
  );
}

/**
 * 検索条件＋表＋ページ送り（ほとんどの一覧はこれ1つ）。rows は全部の行（ここで絞り込む）。
 *   const list = useList('agency');
 *   <ListView list={list} filters={filters} cols={cols} rows={rows} />
 */
export function ListView<R extends object>({ list, filters, cols, rows, extra, statusKey = 'status', onReset, onApply, extraDirty, ...t }: {
  list: ListApi; filters: ListFilter[] | null; cols: ListCol<R>[]; rows: R[]; extra?: ReactNode; statusKey?: string; onReset?: () => void; onApply?: () => void; extraDirty?: boolean;
  noNo?: boolean; nopage?: boolean; foot?: ReactNode; rowKey?: (r: R, i: number) => string;
}) {
  const hasDel = rows.some((r) => (r as Record<string, unknown>)[statusKey] === '削除済');
  return (
    <>
      <FilterBlock list={list} filters={filters} cols={cols} extra={extra} hasDel={hasDel} onReset={onReset} onApply={onApply} extraDirty={extraDirty} />
      <ListTable list={list} cols={cols} rows={list.apply(rows, statusKey, searchKeysOf(filters), hideRulesOf(filters))} {...t} />
    </>
  );
}

/** 操作の列（鉛筆＝編集・ごみ箱＝削除。元の actCell） */
export function ActCell({ onEdit, onDel, extra }: { onEdit?: () => void; onDel?: () => void; extra?: ReactNode }) {
  return (
    <td className="act">
      {extra}
      {onEdit && <button className="e" aria-label="編集" onClick={onEdit}><Icon name="edit" /></button>}
      {onDel && <button className="d" aria-label="削除" onClick={onDel}><Icon name="trash" /></button>}
    </td>
  );
}

/** 表示中の一覧を CSV（BOM 付き UTF-8）で保存する */
export function downloadCsv<R>(name: string, cols: { key: string; label: string }[], rows: R[]) {
  const use = cols.filter((c) => c.key[0] !== '_');
  const lines = [use.map((c) => c.label), ...rows.map((r) => use.map((c) => String((r as Record<string, unknown>)[c.key] ?? '')))]
    .map((r) => r.map((v) => `"${v.replace(/"/g, '""')}"`).join(','));
  try {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob(['﻿' + lines.join('\r\n')], { type: 'text/csv' }));
    a.download = `${name}.csv`;
    a.click();
  } catch {
    /* ダウンロードできない環境では何もしない */
  }
}
