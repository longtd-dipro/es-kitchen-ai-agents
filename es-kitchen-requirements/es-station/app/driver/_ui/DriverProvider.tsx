'use client';

import { keepLoginClear, keepLoginGet, keepLoginSet } from '@/lib/api/keepLogin';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { ApiError, errorMessage } from '@/lib/api/errors';
import { listenUnauthorized, serverLogout } from '@/lib/api/site';
import driver from '@/lib/driver/area';
import { areaApi } from '@/lib/ops/core/client';
import { Icon } from './Icon';

/**
 * ドライバーの状態（ログイン中の配送スタッフ・オフライン（デモ）・入力の途中のもの）と共通の道具（トースト・モーダル）。
 * ログインは driver.login（共通データの account.signIn）で確かめ、サーバーがログインの Cookie を入れる。画面は sessionStorage に配送スタッフID を持つ（開発用）。
 * 受取のチェック・ES配送便の5ステップなど、元のデモで画面を移っても残っていたものは drafts に持つ（ログインし直すと消える）。
 */
type Ctx = {
  /** sessionStorage を読み終わったか */
  ready: boolean;
  staff: string | null;
  login: (id: string, password: string) => Promise<void>;
  logout: () => void;
  toast: (msg: string, warn?: boolean) => void;
  toastError: (e: unknown) => void;
  openModal: (node: ReactNode) => void;
  closeModal: () => void;
  /** オフラインにした（デモ）。完了の報告は端末に保存（未送信）にする */
  offline: boolean;
  setOffline: (v: boolean) => void;
  drafts: Record<string, unknown>;
  setDraft: (key: string, v: unknown) => void;
  clearDrafts: (prefix?: string) => void;
};
const DriverContext = createContext<Ctx | null>(null);
const KEY = 'driver.session';

export function DriverProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [staff, setStaff] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<{ msg: string; warn: boolean; n: number } | null>(null);
  const [modal, setModal] = useState<ReactNode>(null);
  const [offline, setOffline] = useState(false);
  const [drafts, setDrafts] = useState<Record<string, unknown>>({});
  const t = useRef<ReturnType<typeof setTimeout> | null>(null);
  const n = useRef(0);

  useEffect(() => {
    try {
      const id = keepLoginGet(KEY);
      if (id) setStaff(id);
    } catch {
      /* 使えないときはログインからやり直す */
    }
    setReady(true);
  }, []);

  /* サーバーのログインが切れた（ログインのあとに呼んだ API が 401）：ログイン画面に戻す */
  const loginAt = useRef(0);
  useEffect(() => listenUnauthorized(() => loginAt.current, () => {
      keepLoginClear(KEY);
      setStaff(null);
  }), []);

  /* 元の toast()：3秒で消える。warn＝オフラインで端末に保存（黄色） */
  const toast = useCallback((msg: string, warn = false) => {
    if (t.current) clearTimeout(t.current);
    setToastMsg({ msg, warn, n: ++n.current });
    t.current = setTimeout(() => setToastMsg(null), 3000);
  }, []);

  /* Esc でモーダルを閉じる */
  useEffect(() => {
    if (!modal) return;
    const f = (e: KeyboardEvent) => { if (e.key === 'Escape') setModal(null); };
    document.addEventListener('keydown', f);
    return () => document.removeEventListener('keydown', f);
  }, [modal]);

  const value = useMemo<Ctx>(() => ({
    ready,
    staff,
    async login(id, password) {
      const r = await areaApi(driver).query('login', { id, pw: password });
      if (!r.ok) throw new ApiError(r.msg, 401);
      loginAt.current = Date.now();
      if (!password) throw new ApiError('ログインIDとパスワードを入力してください。', 400);
      keepLoginSet(KEY, r.me.id);
      setDrafts({});
      setStaff(r.me.id);
    },
    logout() {
      keepLoginClear(KEY);
      setDrafts({});
      setStaff(null);
      serverLogout();
    },
    toast,
    toastError: (e) => toast(errorMessage(e)),
    openModal: setModal,
    closeModal: () => setModal(null),
    offline,
    setOffline,
    drafts,
    setDraft: (key, v) => setDrafts((d) => ({ ...d, [key]: v })),
    clearDrafts: (prefix) => setDrafts((d) => (prefix ? Object.fromEntries(Object.entries(d).filter(([k]) => !k.startsWith(prefix))) : {})),
  }), [ready, staff, toast, offline, drafts]);

  return (
    <DriverContext.Provider value={value}>
      {children}
      {modal}
      {toastMsg && (
        <div key={toastMsg.n} className={`toast${toastMsg.warn ? ' warn' : ''}`} role="status">
          {toastMsg.warn && <Icon name="cloud" s />}<span>{toastMsg.msg}</span>
        </div>
      )}
    </DriverContext.Provider>
  );
}

export function useDriver() {
  const c = useContext(DriverContext);
  if (!c) throw new Error('useDriver は DriverProvider の中で使ってください');
  return c;
}

/** ログイン後の画面用（staff が必ずある） */
export function useDriverSignedIn() {
  const c = useDriver();
  if (!c.staff) throw new Error('ログイン後の画面でだけ使ってください');
  return { ...c, staff: c.staff };
}

/** 画面を移っても残す入力（元の S にあったもの）。key はスタッフごとに分けない（ログインし直すと消える） */
export function useDraft<T>(key: string, init: T | (() => T)): [T, (v: T | ((p: T) => T)) => void] {
  const { drafts, setDraft } = useDriver();
  const has = Object.prototype.hasOwnProperty.call(drafts, key);
  const cur = (has ? drafts[key] : typeof init === 'function' ? (init as () => T)() : init) as T;
  const ref = useRef(cur);
  ref.current = cur;
  const set = useCallback((v: T | ((p: T) => T)) => {
    const next = typeof v === 'function' ? (v as (p: T) => T)(ref.current) : v;
    ref.current = next;
    setDraft(key, next);
  }, [key, setDraft]);
  return [cur, set];
}

/** 報告を送ったあとのトースト（オフラインのときは黄色で「未送信」。元の commit()） */
export function useCommit() {
  const { toast } = useDriver();
  return useCallback((r: { msg: string; unsent?: boolean; queue?: number; already?: boolean }) => {
    if (r.already || !r.msg) return;
    if (r.unsent) toast(`端末に保存しました（未送信）。電波が戻ると送ります（未送信 ${r.queue ?? 1}件）`, true);
    else toast(r.msg);
  }, [toast]);
}
