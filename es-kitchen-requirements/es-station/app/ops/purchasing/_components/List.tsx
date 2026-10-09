'use client';

import { SortMenu } from '@/components/SortMenu';

import { useEffect, useState, type ReactNode } from 'react';
import { Icon } from '../../_ui/Icon';
import { disp } from '@/lib/ops/purchasing/labels';
import { applyList as sharedApply, MultiCheck, sameConds, UnappliedMark } from '../../_general/list';
import { MULTI_SEP, rangeKey } from '../../_general/list/useList';
import { DateInput } from '@/components/DateInput';

/*
 * 一覧の共通処理（元の filterBlock・applyList・table・pager）。
 * 検索条件・ページは画面を離れても残す（元のデモの S.list と同じ。key ごと）。
 */
export type ListState = { q: string; f: Record<string, string>; page: number; size: number; open: boolean; sk: string; dir: 'asc' | 'desc' };
/** search＝文字の検索（keys の列だけ見る。なければ行のどの値でも）、select＝選ぶ、range＝期間（から〜まで。col の日付）、multi＝複数選べる（col の値がどれかに一致） */
export type Filter = { t: 'search' | 'select' | 'range' | 'multi'; ph: string; col?: string; opts?: string[]; span?: number; keys?: string[] };
/** [項目, 見出し, 'num' など] */
export type Col = [string, string, string?];

const STORE = new Map<string, ListState>();
const blank = (size = 10): ListState => ({ q: '', f: {}, page: 1, size, open: true, sk: '', dir: 'asc' });

/** 一覧の検索条件を先に決めておく（ほかの画面から「見る」で絞り込んで開くとき） */
export function presetList(key: string, patch: Partial<ListState>) {
  STORE.set(key, { ...(STORE.get(key) ?? blank()), ...patch });
}

export function useList(key: string, init?: Partial<ListState>) {
  const [st, setSt] = useState<ListState>(() => STORE.get(key) ?? { ...blank(), ...init });
  const set = (patch: Partial<ListState> | ((s: ListState) => ListState)) => {
    setSt((s) => {
      const next = typeof patch === 'function' ? patch(s) : { ...s, ...patch };
      STORE.set(key, next);
      return next;
    });
  };
  return [st, set] as const;
}
export type SetList = ReturnType<typeof useList>[1];

/** 検索・絞り込み・並べ替え（共通の一覧 ListView と同じ処理。filters を渡すと検索は keys の列だけ見る） */
export function applyList<T extends object>(st: ListState, rows: T[], filters?: Filter[]): T[] {
  return sharedApply(rows, { ...st, hideDel: false }, 'status', filters?.find((f) => f.t === 'search')?.keys);
}

export function FilterBlock({ st, set, filters, cols, onSelect }: { st: ListState; set: SetList; filters: Filter[]; cols: Col[]; onSelect?: (col: string, v: string) => void }) {
  /* 条件は手元に持ち、「検索」か Enter で一覧に効かせる（2026/10/03 決定） */
  const [q, setQ] = useState(st.q);
  const [d, setD] = useState(st.f);
  useEffect(() => setQ(st.q), [st.q]);
  useEffect(() => setD(st.f), [st.f]);
  const setC = (k: string, v: string) => setD((x) => ({ ...x, [k]: v }));
  const apply = () => {
    set((s) => ({ ...s, q: q.trim(), f: d, page: 1 }));
    if (onSelect) Object.keys({ ...st.f, ...d }).filter((k) => (st.f[k] ?? '') !== (d[k] ?? '')).forEach((k) => onSelect(k, d[k] ?? ''));
  };
  const dirty = q.trim() !== st.q || !sameConds(d, st.f);
  const sortCols = cols.filter((c) => c[0] && c[0][0] !== '_');
  return (
    <div className={`filter${st.open ? '' : ' closed'}`}>
      <button className="tog" onClick={() => set({ open: !st.open })} aria-label="検索条件の開閉"><Icon name="up" /></button>
      <div className="f-grid" onKeyDown={(e) => { const t = e.target as HTMLElement; if (e.key === 'Enter' && t.tagName === 'INPUT' && (t as HTMLInputElement).type !== 'checkbox') apply(); }}>
        {filters.map((f, i) => {
          const cls = (f.span === 2 ? 'span2 ' : '') + (i >= 3 ? 'f-extra' : '');
          if (f.t === 'search') {
            return (
              <div key={i} className={`search ${cls}`}>
                <Icon name="search" />
                <input className="inp" placeholder={f.ph} value={q} onChange={(e) => setQ(e.target.value)} />
              </div>
            );
          }
          if (f.t === 'range' && f.col) {
            return (['from', 'to'] as const).map((end) => {
              const k = rangeKey(f.col!, end), label = `${f.ph}（${end === 'from' ? 'から' : 'まで'}）`;
              return <div key={`${i}${end}`} className={cls}><DateInput className="inp" aria-label={label} placeholder={label} value={d[k] ?? ''} onChange={(e) => setC(k, e.target.value)} /></div>;
            });
          }
          if (f.t === 'multi' && f.col) {
            const col = f.col, on = (d[col] ?? '').split(MULTI_SEP).filter(Boolean);
            return <MultiCheck key={i} className={`span2 ${cls}`} label={f.ph} opts={f.opts ?? []} value={on} onChange={(v) => setC(col, v.join(MULTI_SEP))} />;
          }
          return (
            <div key={i} className={cls}>
              <select className="sel" aria-label={f.ph} value={d[f.col ?? 'none'] ?? ''} onChange={(e) => setC(f.col ?? 'none', e.target.value)}>
                <option value="">{f.ph}</option>
                {(f.opts ?? []).map((o) => <option key={o} value={o}>{disp(o)}</option>)}
              </select>
            </div>
          );
        })}
        <div className="f-act">
          <button className="btn out" onClick={() => { setQ(''); set((s) => ({ ...blank(s.size), open: true })); onSelect?.('', ''); }}>クリア</button>
          <UnappliedMark show={dirty} />
          <button className="btn pri" onClick={apply}>検索</button>
        </div>
        <div className="f-right f-extra">
          <SortMenu options={sortCols.map((c) => [c[0], c[1]])} value={st.sk} dir={st.dir} initialLabel="初期の順" onChange={(k, d) => set({ sk: k, dir: d, page: 1 })} />
        </div>
      </div>
    </div>
  );
}

function Pager({ st, set, total }: { st: ListState; set: SetList; total: number }) {
  const pages = Math.max(1, Math.ceil(total / st.size));
  const page = Math.min(st.page, pages);
  const a = total ? (page - 1) * st.size + 1 : 0;
  const b = Math.min(total, page * st.size);
  return (
    <div className="pager">
      <span>{total}件中 {a}–{b}件</span>
      <button onClick={() => set({ page: page - 1 })} disabled={page <= 1} aria-label="前へ">‹</button>
      {Array.from({ length: pages }, (_, i) => i + 1).map((i) => <button key={i} className={i === page ? 'on' : ''} onClick={() => set({ page: i })}>{i}</button>)}
      <button onClick={() => set({ page: page + 1 })} disabled={page >= pages} aria-label="次へ">›</button>
      <select className="sel" aria-label="表示件数" value={st.size} onChange={(e) => set({ size: +e.target.value, page: 1 })}>
        {[10, 20, 50].map((x) => <option key={x} value={x}>{x}件／ページ</option>)}
      </select>
    </div>
  );
}

/** 一覧の表（ページ送りつき）。cell は <td> を返す */
export function ListTable<T>({ st, set, cols, rows, cell, noNo, rowKey }: { st: ListState; set: SetList; cols: Col[]; rows: T[]; cell: (c: Col, r: T) => ReactNode; noNo?: boolean; rowKey: (r: T) => string }) {
  const pages = Math.max(1, Math.ceil(rows.length / st.size));
  const page = Math.min(st.page, pages);
  const start = (page - 1) * st.size;
  const pageRows = rows.slice(start, start + st.size);
  return (
    <>
      <div className="tbl-wrap">
        <table className="tbl">
          <thead>
            <tr>
              {!noNo && <th>No</th>}
              {cols.map((c) => <th key={c[0]} className={`${c[2]?.includes('num') ? 'num' : ''}${c[0] === '_act' ? ' act' : ''}`}>{c[1]}</th>)}
            </tr>
          </thead>
          <tbody>
            {pageRows.length ? pageRows.map((r, i) => (
              <tr key={rowKey(r)}>
                {!noNo && <td>{start + i + 1}</td>}
                {cols.map((c) => <CellFrag key={c[0]}>{cell(c, r)}</CellFrag>)}
              </tr>
            )) : (
              <tr><td colSpan={cols.length + 1} className="empty">条件に一致するデータがありません。検索条件を変えるか「クリア」を押してください。</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <Pager st={st} set={set} total={rows.length} />
    </>
  );
}
const CellFrag = ({ children }: { children: ReactNode }) => <>{children}</>;
