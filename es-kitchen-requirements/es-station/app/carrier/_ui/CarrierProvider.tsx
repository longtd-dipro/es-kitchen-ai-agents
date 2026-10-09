'use client';

import { keepLoginClear, keepLoginGet, keepLoginSet } from '@/lib/api/keepLogin';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { ApiError, errorMessage } from '@/lib/api/errors';
import { accountOf, type CarrierAccount } from '@/lib/carrier/session';
import type { ApplyForm, ApplyForm2 } from '@/lib/carrier/types';
import { listenUnauthorized, serverLogout } from '@/lib/api/site';
import accountArea from '@/lib/domain/areas/account';
import { domainApi } from '@/lib/domain/client';

const accountApi = domainApi(accountArea);

/**
 * 委託配送先Web の状態（ログイン中のアカウント・申し込みフォームの入力）と共通の道具（トースト・モーダル）。
 * ログインは共通データのアカウント（account.signIn・site＝carrier）で確かめ、サーバーがログインの Cookie を入れる。画面は sessionStorage にログインID を持つ（開発用）。
 */
type Ctx = {
  /** sessionStorage を読み終わったか */
  ready: boolean;
  account: CarrierAccount | null;
  login: (loginId: string, password: string) => Promise<void>;
  logout: () => void;
  toast: (msg: string) => void;
  toastError: (e: unknown) => void;
  openModal: (node: ReactNode) => void;
  closeModal: () => void;
  /** 申し込みフォーム 1/2・2/2 の入力（ステップを行き来しても残す） */
  reg: ApplyForm;
  setReg: (f: ApplyForm) => void;
  reg2: ApplyForm2;
  setReg2: (f: ApplyForm2) => void;
};
const CarrierContext = createContext<Ctx | null>(null);
const KEY = 'carrier.session';
export const REG2_EMPTY: ApplyForm2 = { area: '', ng: [], areaNote: '', car: '', frz: '', ref: '', sp: '', carNote: '小回り、配送の融通が利く', agree: false };

export function CarrierProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [account, setAccount] = useState<CarrierAccount | null>(null);
  const [toasts, setToasts] = useState<{ id: number; msg: string }[]>([]);
  const [modal, setModal] = useState<ReactNode>(null);
  const [reg, setReg] = useState<ApplyForm>({});
  const [reg2, setReg2] = useState<ApplyForm2>(REG2_EMPTY);
  const n = useRef(0);

  useEffect(() => {
    try {
      const id = keepLoginGet(KEY);
      if (id) setAccount(accountOf(id) ?? null);
    } catch {
      /* 使えないときはログインからやり直す */
    }
    setReady(true);
  }, []);

  /* サーバーのログインが切れた（ログインのあとに呼んだ API が 401）：ログイン画面に戻す */
  const loginAt = useRef(0);
  useEffect(() => listenUnauthorized(() => loginAt.current, () => {
      keepLoginClear(KEY);
      setAccount(null);
  }), []);

  const toast = useCallback((msg: string) => {
    const id = ++n.current;
    setToasts((t) => [...t, { id, msg }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2200);
  }, []);

  /* Esc でモーダルを閉じる（元の keydown） */
  useEffect(() => {
    if (!modal) return;
    const f = (e: KeyboardEvent) => { if (e.key === 'Escape') setModal(null); };
    document.addEventListener('keydown', f);
    return () => document.removeEventListener('keydown', f);
  }, [modal]);

  const value = useMemo<Ctx>(() => ({
    ready,
    account,
    async login(loginId, password) {
      const a = accountOf(loginId);
      if (!a || !password) throw new ApiError('ログインIDまたはパスワードが正しくありません', 401);
      /* サーバーで確かめ、ログインの Cookie を入れてもらう（API は自社のデータだけ返す） */
      const res = await accountApi.action('signIn', { site: 'carrier', loginId: a.loginId });
      if (!res.ok) throw new ApiError('ログインIDまたはパスワードが正しくありません', 401);
      loginAt.current = Date.now();
      keepLoginSet(KEY, a.loginId);
      setAccount(a);
    },
    logout() {
      keepLoginClear(KEY);
      setAccount(null);
      serverLogout();
    },
    toast,
    toastError: (e) => toast(errorMessage(e)),
    openModal: setModal,
    closeModal: () => setModal(null),
    reg, setReg, reg2, setReg2,
  }), [ready, account, toast, reg, reg2]);

  return (
    <CarrierContext.Provider value={value}>
      {children}
      {modal}
      {toasts.map((t) => <div key={t.id} className="toast" role="status">{t.msg}</div>)}
    </CarrierContext.Provider>
  );
}

export function useCarrier() {
  const c = useContext(CarrierContext);
  if (!c) throw new Error('useCarrier は CarrierProvider の中で使ってください');
  return c;
}

/** ログイン後の画面用（account が必ずある）。company＝領域の args に渡す委託配送会社ID */
export function useCarrierSignedIn() {
  const c = useCarrier();
  if (!c.account) throw new Error('ログイン後の画面でだけ使ってください');
  return { ...c, account: c.account, company: c.account.company };
}
