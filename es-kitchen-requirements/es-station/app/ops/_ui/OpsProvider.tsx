'use client';

import { keepLoginClear, keepLoginGet, keepLoginSet } from '@/lib/api/keepLogin';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { ApiError, errorMessage } from '@/lib/api/errors';
import { listenUnauthorized, serverLogout } from '@/lib/api/site';
import accountArea from '@/lib/domain/areas/account';
import { domainApi, useDomainQuery } from '@/lib/domain/client';
import type { Perm } from '@/lib/domain/types';
import { can as canDo, type Grants, type PermOp } from '@/lib/ops/permissions';

const accountApi = domainApi(accountArea);
const KEY = 'ops.session';

/** ログイン中の運営のアカウント（役割の権限。API はサーバーでも役割で確かめる：lib/server/access.ts） */
export type OpsAccount = { id: string; name: string; roleIds: string[]; perms: Record<string, Perm>; grants: Grants; readOnly: boolean };
/** 認証コード待ち（IP ホワイトリスト外からのログイン）。devCode は DEMO だけ（画面のトーストで見せて試せるように） */
export type OtpWait = { otpRequired: true; sentTo: string; minutes: number; devCode?: string; message: string };

/**
 * 運営Web の状態（ログイン中のアカウント）と画面で共通の道具（トースト・モーダル）。
 * ログインは共通データのアカウント（account.signIn・site＝ops）で確かめ、サーバーがログインの Cookie を入れる。画面は sessionStorage にアカウントを持つ（開発用）。
 */
type Ctx = {
  /** sessionStorage を読み終わったか */
  ready: boolean;
  account: OpsAccount | null;
  /** 今の権限（役割を直したら読み直す）。メニュー・ボタンの出し分けに使う（API はサーバーでも確かめる） */
  grants: Grants;
  /** 機能の操作ができるか */
  can: (feature: string, op: PermOp) => boolean;
  /** ログイン。IP ホワイトリスト外なら認証コードをメールで送り { otpRequired } を返す（受付簿 #61）→ verifyOtp で完了 */
  login: (loginId: string, password: string) => Promise<OtpWait | undefined>;
  /** 認証コードでログインを完了する */
  verifyOtp: (loginId: string, code: string) => Promise<void>;
  logout: () => void;
  toast: (msg: string) => void;
  /** API のエラーをトーストで出す */
  toastError: (e: unknown) => void;
  openModal: (node: ReactNode) => void;
  closeModal: () => void;
};
const OpsContext = createContext<Ctx | null>(null);

export function OpsProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [account, setAccount] = useState<OpsAccount | null>(null);
  /* 今の権限（MeSync が読む）。読むまではログインしたときの権限 */
  const [live, setLive] = useState<Grants | null>(null);
  const [toasts, setToasts] = useState<{ id: number; msg: string }[]>([]);
  const [modal, setModal] = useState<ReactNode>(null);
  const n = useRef(0);
  const toast = useCallback((msg: string) => {
    const id = ++n.current;
    setToasts((t) => [...t, { id, msg }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2600);
  }, []);
  useEffect(() => {
    try {
      const raw = keepLoginGet(KEY);
      if (raw) setAccount(JSON.parse(raw) as OpsAccount);
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

  const value = useMemo<Ctx>(() => ({
    ready,
    account,
    grants: live ?? account?.grants ?? {},
    can: (feature, op) => canDo(live ?? account?.grants, feature, op),
    async login(loginId, password) {
      if (!loginId.trim() || !password) throw new ApiError('ログインIDまたはパスワードが正しくありません', 401);
      const res = await accountApi.action('signIn', { site: 'ops', loginId });
      if (!res.ok) {
        /* IP ホワイトリスト外：認証コードをメールで送った（受付簿 #61）。画面はコードの入力を出す */
        if (res.otpRequired) return { otpRequired: true, sentTo: res.sentTo, minutes: res.minutes, devCode: res.devCode, message: res.message };
        throw new ApiError(res.message, 401);
      }
      loginAt.current = Date.now();
      const a: OpsAccount = { id: res.account.id, name: res.account.name, roleIds: res.account.roleIds, perms: res.perms, grants: res.grants, readOnly: res.readOnly };
      keepLoginSet(KEY, JSON.stringify(a));
      setAccount(a);
      return undefined;
    },
    async verifyOtp(loginId, code) {
      if (!/^\d{4}$/.test(code.trim())) throw new ApiError('認証コード（4桁の数字）を入れてください', 400);
      const res = await accountApi.action('verifyOtp', { site: 'ops', loginId, code: code.trim() });
      if (!res.ok) throw new ApiError(res.message, 401);
      loginAt.current = Date.now();
      const a: OpsAccount = { id: res.account.id, name: res.account.name, roleIds: res.account.roleIds, perms: res.perms, grants: res.grants, readOnly: res.readOnly };
      keepLoginSet(KEY, JSON.stringify(a));
      setAccount(a);
    },
    logout() {
      keepLoginClear(KEY);
      setAccount(null);
      setLive(null);
      serverLogout();
    },
    toast,
    toastError: (e) => toast(errorMessage(e)),
    openModal: setModal,
    closeModal: () => setModal(null),
  }), [ready, account, live, toast]);
  return (
    <OpsContext.Provider value={value}>
      {account && <MeSync id={account.id} onGrants={setLive} />}
      {children}
      {modal}
      {toasts.map((t) => <div key={t.id} className="toast" role="status">{t.msg}</div>)}
    </OpsContext.Provider>
  );
}

export function useOps() {
  const c = useContext(OpsContext);
  if (!c) throw new Error('useOps は OpsProvider の中で使ってください');
  return c;
}

/** ログイン中のアカウントの今の権限を読む（役割・アカウントが変わったら読み直す） */
function MeSync({ id, onGrants }: { id: string; onGrants: (g: Grants) => void }) {
  const { data } = useDomainQuery(accountApi, 'me', { id });
  useEffect(() => { if (data) onGrants(data.grants); }, [data, onGrants]);
  return null;
}
