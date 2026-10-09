'use client';

import { useRouter } from 'next/navigation';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { errorMessage } from '@/lib/api/errors';
import { DEMO } from '@/lib/demo';
import { today } from '@/lib/supplier/dates';
import { About } from './About';
import { ConfirmDiscard, Toast } from './es';
import { fmtDate } from '@/lib/format/date';

/*
 * メニュー管理・商品カテゴリ管理の画面で共通の道具（元の App の state のうち、画面をまたぐもの）。
 *   - toast：右上のトースト（4秒弱で消える）
 *   - useKeep：一覧の検索条件・ページを、詳細から戻っても残す
 *   - useDirty・leave：編集中に画面を離れるときの「編集内容を破棄しますか？」（サイドメニューのリンクも止める）
 */
type Tone = 'success' | 'negative';
type Ctx = {
  toast: (t: string, tone?: Tone) => void;
  toastError: (e: unknown) => void;
  /** 編集中なら破棄の確認を出してから go */
  leave: (go: () => void) => void;
  /** leave してから href へ */
  nav: (href: string) => void;
  setDirty: (d: boolean) => void;
  store: Record<string, unknown>;
  put: (key: string, v: unknown) => void;
};
const C = createContext<Ctx | null>(null);

export function useMenu() {
  const c = useContext(C);
  if (!c) throw new Error('useMenu は MenuProvider の中で使ってください');
  return c;
}
/** 画面をまたいで残す値（一覧の検索条件など） */
export function useKeep<T>(key: string, init: T): [T, (v: T | ((o: T) => T)) => void] {
  const { store, put } = useMenu();
  const v = (key in store ? store[key] : init) as T;
  const set = useCallback((x: T | ((o: T) => T)) => put(key, typeof x === 'function' ? (x as (o: T) => T)((key in store ? store[key] : init) as T) : x), [key, store, put, init]);
  return [v, set];
}
/** 編集中かどうかを知らせる（画面を離れると解除） */
export function useDirty(dirty: boolean) {
  const { setDirty } = useMenu();
  useEffect(() => { setDirty(dirty); return () => setDirty(false); }, [dirty, setDirty]);
}

export default function MenuProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [toastS, setToast] = useState<{ t: string; tone: Tone } | null>(null);
  const [discard, setDiscard] = useState<null | (() => void)>(null);
  const [about, setAbout] = useState(false);
  const [store, setStore] = useState<Record<string, unknown>>({});
  const dirty = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const toast = useCallback((t: string, tone: Tone = 'success') => {
    setToast({ t, tone });
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(null), 3800);
  }, []);
  const leave = useCallback((go: () => void) => {
    if (dirty.current) setDiscard(() => go);
    else go();
  }, []);
  const value = useMemo<Ctx>(() => ({
    toast,
    toastError: (e) => toast(errorMessage(e), 'negative'),
    leave,
    nav: (href) => leave(() => { router.push(href); window.scrollTo(0, 0); }),
    setDirty: (d) => { dirty.current = d; },
    store,
    put: (key, v) => setStore((s) => ({ ...s, [key]: v })),
  }), [toast, leave, router, store]);

  /* 編集中：サイドメニューなど画面の外のリンクを押したら、破棄の確認を出す。ページを閉じるときはブラウザの確認 */
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!dirty.current || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
      const a = (e.target as HTMLElement).closest?.('a[href]') as HTMLAnchorElement | null;
      const href = a?.getAttribute('href');
      if (!a || !href || !href.startsWith('/') || a.target === '_blank') return;
      e.preventDefault(); e.stopPropagation();
      setDiscard(() => () => router.push(href));
    };
    const onUnload = (e: BeforeUnloadEvent) => { if (dirty.current) e.preventDefault(); };
    document.addEventListener('click', onClick, true);
    window.addEventListener('beforeunload', onUnload);
    return () => { document.removeEventListener('click', onClick, true); window.removeEventListener('beforeunload', onUnload); };
  }, [router]);

  return (
    <C.Provider value={value}>
      <div className="od-stack mo-page">{children}</div>
      {discard ? <ConfirmDiscard onCancel={() => setDiscard(null)} onConfirm={() => { const g = discard; dirty.current = false; setDiscard(null); setTimeout(g, 0); }} /> : null}
      {toastS ? <div className="es-toast-host"><Toast tone={toastS.tone} onClose={() => setToast(null)}>{toastS.t}</Toast></div> : null}
      {DEMO ? (
        <div className="od-demo mo-demo" role="group" aria-label="デモ">
          <span>デモの今日 {fmtDate(today())}</span>
          <button type="button" className="about" onClick={() => setAbout(true)}>このデモについて</button>
        </div>
      ) : null}
      {DEMO && about ? <About onClose={() => setAbout(false)} /> : null}
    </C.Provider>
  );
}
