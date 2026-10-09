'use client';

import { useCallback, useEffect, useState } from 'react';
import type { ListFilter, ListState } from './types';
import { isoDate, isoYm } from '@/lib/format/date';

/* 一覧の状態を一覧ごと（key）に覚えておく（元の S.list。画面を移って戻っても検索条件・ページが残る） */
const STORE = new Map<string, ListState>();
export const initList = (size = 10): ListState => ({ q: '', f: {}, page: 1, size, open: true, sk: '', dir: 'asc', hideDel: true });

/**
 * 一覧の状態。
 *   const list = useList('agency');
 *   list.st.q / list.set({ page: 2 }) / list.reset() / list.apply(rows)
 */
export function useList(key: string) {
  const [, setVer] = useState(0);
  const st = STORE.get(key) ?? initList();
  const set = useCallback((patch: Partial<ListState>) => {
    STORE.set(key, { ...(STORE.get(key) ?? initList()), ...patch });
    setVer((n) => n + 1);
  }, [key]);
  /** クリア（表示件数だけ残す） */
  const reset = useCallback(() => {
    STORE.set(key, initList((STORE.get(key) ?? initList()).size));
    setVer((n) => n + 1);
  }, [key]);
  return { key, st, set, reset, apply: <R extends object>(rows: R[], statusKey = 'status', keys?: string[], hides?: HideRule[]) => applyList(rows, st, statusKey, keys, hides) };
}
/** 一覧の状態を消す（タブを切り替えたときなど） */
export const dropList = (key: string) => STORE.delete(key);
export type ListApi = ReturnType<typeof useList>;

/** 期間の条件の値を入れるキー（st.f）。col の期間の始め・終わり */
export const rangeKey = (col: string, end: 'from' | 'to') => `${col}@${end}`;
/** 複数選べる条件の値（st.f）の区切り */
export const MULTI_SEP = '\u001f';
/** 検索の欄が見る列（filters の search の keys。なければ undefined＝行のどの値にでも） */
export const searchKeysOf = (filters: ListFilter[] | null | undefined) => filters?.find((f) => f.t === 'search')?.keys;
/** 「○○も表示」の条件（filters の show）。チェックが外れているとき col＝val の行を出さない */
export const hideRulesOf = (filters: ListFilter[] | null | undefined): HideRule[] => (filters ?? []).flatMap((f): HideRule[] =>
  f.t === 'show' ? [{ col: f.col, val: f.val }] : f.t === 'monthRange' ? [{ col: f.col, monthInit: f.init }] : f.t === 'select' && f.col && f.init ? [{ col: f.col, init: f.init, all: f.all }] : []);
/** 「○○も表示」（col＝val の行を既定で出さない）／既定で選んでおく選ぶ条件（init。all を選ぶとすべて出す） */
export type HideRule = { col: string; val: string } | { col: string; init: string; all?: string } | { col: string; monthInit: string };
/** 「○○も表示」の状態のキー（f の中） */
export const showKey = (col: string) => `show:${col}`;

/** 並べ替えに使う数（¥・カンマ・円・個・件… を外して数になれば数） */
const num = (v: unknown) => {
  const t = String(v ?? '').replace(/[−－]/g, '-').replace(/[¥,円個件台名品食%％\s]/g, '');
  return t !== '' && !isNaN(+t) ? +t : null;
};

/**
 * 検索・絞り込み・削除済み・並べ替えをかける（元の applyList）。
 * - 文字の検索：keys があればその列の値に、なければ行のどの値（オブジェクト以外）にでも部分一致（大文字小文字を区別しない）
 * - 選ぶ条件：その列の値に含まれる（期間 'col@from'・'col@to'、複数選択は区切りでつないだ値のどれか）
 * - 削除済み：「削除済みを表示しない」のとき status＝削除済 の行を出さない（条件で「削除済」を選んだときは出す）
 * - 並べ替え：項目（数なら数で、ほかは日本語の順）。降順は並びを逆にする
 */
export function applyList<R extends object>(rows: R[], st: ListState, statusKey = 'status', keys?: string[], hides: HideRule[] = []): R[] {
  const get = (r: R, k: string) => (r as Record<string, unknown>)[k];
  let out = rows;
  if (st.q) {
    const q = st.q.toLowerCase();
    const vals = (r: R) => (keys ? keys.map((k) => get(r, k)) : Object.values(r));
    out = out.filter((r) => vals(r).some((v) => v != null && typeof v !== 'object' && String(v).toLowerCase().includes(q)));
  }
  const defs = hides.filter((h): h is { col: string; init: string; all?: string } => 'init' in h);
  const defCols = new Set(defs.map((h) => h.col));
  /* 月の範囲：未選択は init。開始月〜終了月（両端を含む）に入る行だけ */
  for (const h of hides) {
    if (!('monthInit' in h)) continue;
    const from = st.f[rangeKey(h.col, 'from')] || h.monthInit, to = st.f[rangeKey(h.col, 'to')] || h.monthInit;
    defCols.add(rangeKey(h.col, 'from')); defCols.add(rangeKey(h.col, 'to'));
    out = out.filter((r) => { const m = String(get(r, h.col) ?? ''); return m >= from && m <= to; });
  }
  /* 既定で選んでおく条件：選んでいなければ init。all を選んだときは絞らない。値は完全に一致（「有効」が「無効」を含まない形で） */
  for (const h of defs) {
    const v = st.f[h.col] || h.init;
    if (v !== h.all) out = out.filter((r) => String(get(r, h.col) ?? '') === v);
  }
  Object.entries(st.f).forEach(([c, v]) => {
    if (!v || c.startsWith('none') || c.startsWith('show:') || defCols.has(c)) return;
    if (c.endsWith('@from') || c.endsWith('@to')) {
      const [col, end] = c.split('@');
      /* 年月の列（yyyy-mm）は月の初め〜終わりとして比べる */
      out = out.filter((r) => {
        const raw = String(get(r, col) ?? ''), d = isoDate(raw) || (isoYm(raw) ? isoYm(raw) + (end === 'from' ? '-01' : '-31') : '');
        return !!d && (end === 'from' ? d >= v : d <= v);
      });
    } else if (v.includes(MULTI_SEP)) {
      const vs = v.split(MULTI_SEP).filter(Boolean);
      out = out.filter((r) => vs.includes(String(get(r, c) ?? '')));
    } else out = out.filter((r) => String(get(r, c) ?? '').includes(v));
  });
  if (st.hideDel && st.f[statusKey] !== '削除済' && !defCols.has(statusKey)) out = out.filter((r) => get(r, statusKey) !== '削除済');
  /* 「○○も表示」が外れているとき（既定）はその値の行を出さない（条件でその値を選んだときは出す） */
  for (const h of hides) if ('val' in h && st.f[showKey(h.col)] !== '1' && st.f[h.col] !== h.val) out = out.filter((r) => String(get(r, h.col) ?? '') !== h.val);
  if (st.sk) {
    out = [...out].sort((a, b) => {
      const x = get(a, st.sk), y = get(b, st.sk), nx = num(x), ny = num(y);
      if (nx !== null && ny !== null) return nx - ny;
      return String(x ?? '').localeCompare(String(y ?? ''), 'ja', { numeric: true });
    });
  }
  if (st.dir === 'desc') out = [...out].reverse();
  return out;
}

/**
 * 「未適用」の判定（検索条件を手元で変えたが、まだ「検索」を押していない）。
 * sig＝手元の条件を文字にしたもの（JSON.stringify など）。検索したとき・クリアしたときの条件を「適用済み」として覚え、違えば dirty。
 *   const u = useUnapplied(JSON.stringify(draft));  →  onSearch の最初に u.onSearch()、onClear の最初に u.onClear()、<UnappliedMark show={u.dirty} />
 */
export function useUnapplied(sig: string) {
  const [applied, setApplied] = useState(sig);
  const [cleared, setCleared] = useState(false);
  useEffect(() => { if (cleared) { setApplied(sig); setCleared(false); } }, [cleared, sig]);
  return { dirty: !cleared && sig !== applied, onSearch: () => setApplied(sig), onClear: () => setCleared(true) };
}
