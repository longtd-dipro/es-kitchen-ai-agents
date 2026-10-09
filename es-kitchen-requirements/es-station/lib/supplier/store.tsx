'use client';

import { keepLoginClear, keepLoginGet, keepLoginSet } from '@/lib/api/keepLogin';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { api } from '@/lib/api/supplier';
import { ApiError, errorMessage } from '@/lib/api/errors';
import type { Notice, Order, Supplier, Tab } from './types';

/**
 * 仕入先サイトの状態（ログイン中の仕入先・発注・お知らせ・一覧の表示）。
 * データは lib/api/supplier の api から読み、書き換えたら API が返した発注で置き換える。
 * 入力途中の値（回答・本発注・出荷報告・プロフィールの編集など）は各画面のローカル state に持つ。
 * ほかのタブ・サイト（運営Web など）が同じデータを書き換えたら、データの版（api.getVersion）が変わるので読み直す。
 */
type Ctx = {
  /** ログインの確認が終わったか（sessionStorage を読むまで false） */
  ready: boolean;
  supplierId: string | null;
  login: (loginId: string, password: string) => Promise<void>;
  logout: () => Promise<void>;

  me: Supplier | null;
  orders: Order[];
  notices: Notice[];
  loading: boolean;
  reload: () => Promise<void>;
  /** API が返した発注で置き換える */
  mergeOrders: (list: Order[]) => void;
  setMe: (s: Supplier) => void;

  /* 受注一覧の表示（詳細から戻っても残す） */
  tab: Tab;
  setTab: (t: Tab) => void;
  group: boolean;
  setGroup: (g: boolean) => void;
  selected: Set<string>;
  setSelected: (fn: (s: Set<string>) => Set<string>) => void;
  filter: { ym: string; kw: string };
  setFilter: (f: { ym: string; kw: string }) => void;
  noticeOpen: number | null;
  setNoticeOpen: (id: number | null) => void;

  toast: (msg: string) => void;
  /** API のエラーをトーストで出す */
  toastError: (e: unknown) => void;
  openModal: (node: ReactNode) => void;
  closeModal: () => void;
};

const SupplierContext = createContext<Ctx | null>(null);
/** データの版を見に行く間隔（ミリ秒） */
const SYNC_INTERVAL = 3000;
/* ログイン中の仕入先 ID。本番の認証は Cookie（セッション）で、ここは画面の再読み込みで ID を失わないためだけに持つ */
const SESSION_KEY = 'supplier.session';

export function SupplierProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [supplierId, setSupplierId] = useState<string | null>(null);
  const [me, setMe] = useState<Supplier | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<Tab>('納期回答待ち');
  const [group, setGroup] = useState(true);
  const [selected, setSelectedState] = useState<Set<string>>(() => new Set());
  const [filter, setFilter] = useState({ ym: '', kw: '' });
  const [noticeOpen, setNoticeOpen] = useState<number | null>(null);
  const [toasts, setToasts] = useState<{ id: number; msg: string }[]>([]);
  const [modal, setModal] = useState<ReactNode>(null);
  const toastId = useRef(0);

  const toast = useCallback((msg: string) => {
    const id = ++toastId.current;
    setToasts((t) => [...t, { id, msg }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2600);
  }, []);
  const toastError = useCallback((e: unknown) => toast(errorMessage(e)), [toast]);

  useEffect(() => {
    try {
      setSupplierId(keepLoginGet(SESSION_KEY));
    } catch {
      /* sessionStorage が使えないときはログインからやり直す */
    }
    setReady(true);
  }, []);

  const clearSession = useCallback(() => {
    keepLoginClear(SESSION_KEY);
    setSupplierId(null);
    setMe(null);
    setOrders([]);
    setNotices([]);
  }, []);

  /** 読み込んだときのデータの版 */
  const version = useRef(0);

  /** quiet＝裏での読み直し（読み込み中の表示もエラーのトーストも出さない） */
  const load = useCallback(async (id: string, quiet = false) => {
    if (!quiet) setLoading(true);
    try {
      const v = await api.getVersion();
      const [s, os, ns] = await Promise.all([api.getSupplier(id), api.listOrders(id), api.listNotices(id)]);
      version.current = v;
      setMe(s);
      setOrders(os);
      setNotices(ns);
    } catch (e) {
      /* Cookie が切れた（サーバーの再起動・ブラウザを閉じた）ときはログインからやり直す */
      if (e instanceof ApiError && e.status === 401) clearSession();
      else if (!quiet) toastError(e);
    } finally {
      if (!quiet) setLoading(false);
    }
  }, [toastError, clearSession]);

  useEffect(() => {
    if (supplierId) load(supplierId);
  }, [supplierId, load]);

  /* ほかのタブ・サイトでの書き換えに気づいたら読み直す（数秒ごと＋画面に戻ったとき） */
  useEffect(() => {
    if (!supplierId) return;
    const check = async () => {
      const v = await api.getVersion().catch(() => version.current);
      if (v !== version.current) await load(supplierId, true);
    };
    const t = setInterval(check, SYNC_INTERVAL);
    window.addEventListener('focus', check);
    document.addEventListener('visibilitychange', check);
    return () => {
      clearInterval(t);
      window.removeEventListener('focus', check);
      document.removeEventListener('visibilitychange', check);
    };
  }, [supplierId, load]);

  const value = useMemo<Ctx>(() => ({
    ready,
    supplierId,
    async login(loginId, password) {
      const { supplierId: id } = await api.login(loginId, password);
      keepLoginSet(SESSION_KEY, id);
      setTab('納期回答待ち');
      setSelectedState(new Set());
      setSupplierId(id);
    },
    async logout() {
      await api.logout().catch(() => undefined);
      clearSession();
    },
    me,
    orders,
    notices,
    loading,
    reload: () => (supplierId ? load(supplierId) : Promise.resolve()),
    /* 版は上がるので、次の確認で裏で読み直す（同時にあったほかのタブ・サイトの変更もそこで入る） */
    mergeOrders: (list) => setOrders((prev) => prev.map((o) => list.find((x) => x.no === o.no) ?? o)),
    setMe,
    tab,
    setTab,
    group,
    setGroup,
    selected,
    setSelected: (fn) => setSelectedState((s) => fn(new Set(s))),
    filter,
    setFilter,
    noticeOpen,
    setNoticeOpen,
    toast,
    toastError,
    openModal: setModal,
    closeModal: () => setModal(null),
  }), [ready, supplierId, me, orders, notices, loading, load, clearSession, tab, group, selected, filter, noticeOpen, toast, toastError]);

  return (
    <SupplierContext.Provider value={value}>
      {children}
      {modal}
      {toasts.map((t) => (
        <div key={t.id} className="toast" role="status">{t.msg}</div>
      ))}
    </SupplierContext.Provider>
  );
}

export function useSupplier() {
  const c = useContext(SupplierContext);
  if (!c) throw new Error('useSupplier は SupplierProvider の中で使ってください');
  return c;
}

/** ログイン後の画面用：me が必ずある前提で使う（(app)/layout が読み込み終わるまで子を出さない） */
export function useSignedIn() {
  const c = useSupplier();
  if (!c.me) throw new Error('ログイン後の画面でだけ使ってください');
  return { ...c, me: c.me };
}
