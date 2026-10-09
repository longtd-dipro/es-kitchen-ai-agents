'use client';

import { keepLoginClear, keepLoginGet, keepLoginSet } from '@/lib/api/keepLogin';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { ApiError, errorMessage } from '@/lib/api/errors';
import { accountOf, corpAccountOf, viewOfStatus, type CorpAccount, type CorpView } from '@/lib/corp/session';
import accountArea from '@/lib/domain/areas/account';
import applyArea from '@/lib/domain/areas/apply';
import { fmtDate } from '@/lib/format/date';
import orgArea from '@/lib/domain/areas/org';
import { domainApi, useDomainQuery } from '@/lib/domain/client';
import { listenUnauthorized, serverLogout } from '@/lib/api/site';

const accountApi = domainApi(accountArea);
const orgApi = domainApi(orgArea);
const applyApi = domainApi(applyArea);
/** 解約した契約が見つからないとき（DEMO の上書きで見るとき）の帯の文 */
const RO_SAMPLE = 'ご契約は 2026-11-22 に終了しました。2027-01-27（最後のご請求の入金期限）まで参照のみでご利用いただけます。';

/**
 * 法人Web の状態（ログイン中のアカウント・画面の状態）と共通の道具（トースト・ダイアログ）。
 * ログインは共通データのアカウント（account.signIn・site＝corp）で確かめ、sessionStorage にアカウントを持つ（開発用・Cognito はフェイク）。
 * 画面の状態（参照のみ・停止）はアカウントの状態から決める。DEMO 帯の「デモの表示」は上書き（viewOverride）。
 */
type Ctx = {
  /** sessionStorage を読み終わったか */
  ready: boolean;
  account: CorpAccount | null;
  /** 拠点アカウントか（拠点アカウントはその拠点のデータだけ・法人情報なし） */
  isBranch: boolean;
  /** 画面の状態（DEMO の上書きがあればそれ、なければアカウントの状態から） */
  view: CorpView;
  /** DEMO 帯の上書き（null＝アカウントの状態のまま） */
  setView: (v: CorpView | null) => void;
  /** 参照のみ（解約後）の帯の文（終了日・最後の請求書の入金期限は共通データから） */
  roTitle: string;
  login: (loginId: string, password: string) => Promise<void>;
  logout: () => void;
  toast: (msg: string) => void;
  toastError: (e: unknown) => void;
  openModal: (node: ReactNode) => void;
  closeModal: () => void;
};
const CorpContext = createContext<Ctx | null>(null);
const KEY = 'corp.session';
const VIEW = 'corp.view';

export function CorpProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [account, setAccount] = useState<CorpAccount | null>(null);
  const [override, setOverride] = useState<CorpView | null>(null);
  /* アカウントの状態（参照のみ・利用停止）は共通データから読み直す（apply.tick で変わる） */
  const { data: corpAccs } = useDomainQuery(accountApi, 'list', { site: 'corp' }, { skip: !account });
  const status = corpAccs?.find((x) => x.loginId.toUpperCase() === account?.loginId.toUpperCase())?.status;
  const view: CorpView = override ?? viewOfStatus(status);
  const { data: close } = useDomainQuery(applyApi, 'closeInfo', account?.branchId ? { branchId: account.branchId } : { corpId: account?.corpId ?? '' }, { skip: !account });
  const roTitle = close
    ? `ご契約は ${fmtDate(close.endOn)} に終了しました。${close.due ? `${fmtDate(close.due)}（最後のご請求の入金期限）まで` : '最後のご請求の入金期限まで'}参照のみでご利用いただけます。`
    : RO_SAMPLE;
  const [toasts, setToasts] = useState<{ id: number; msg: string }[]>([]);
  const [modal, setModal] = useState<ReactNode>(null);
  const n = useRef(0);

  useEffect(() => {
    try {
      const raw = keepLoginGet(KEY);
      if (raw) {
        /* 前の形（ログインID だけ）も読む */
        let a: CorpAccount | null = null;
        try { a = JSON.parse(raw) as CorpAccount; } catch { a = accountOf(raw) ?? null; }
        setAccount(a?.loginId ? a : null);
      }
      const v = sessionStorage.getItem(VIEW) as CorpView | null;
      if (v) setOverride(v);
    } catch {
      /* 使えないときはログインからやり直す */
    }
    setReady(true);
  }, []);

  const toast = useCallback((msg: string) => {
    const id = ++n.current;
    setToasts((t) => [...t, { id, msg }]);
    /* デモの撮影用：URL に ?toastHold=1 があるとトーストを消さない（約2.6秒で消えるため、設計書の画像に写らないので） */
    if (process.env.NEXT_PUBLIC_DEMO === '1' && typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('toastHold')) return;
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2600);
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
    isBranch: account?.role === 'branch',
    view,
    roTitle,
    setView(v) {
      setOverride(v);
      try { if (v) sessionStorage.setItem(VIEW, v); else sessionStorage.removeItem(VIEW); } catch { /* 無視 */ }
    },
    async login(loginId, password) {
      if (!loginId.trim() || !password) throw new ApiError('ログインID またはパスワードが正しくありません', 401);
      const res = await accountApi.action('signIn', { site: 'corp', loginId });
      if (!res.ok) {
        /* 解約のあと最後の請求の入金期限を過ぎたアカウント（利用停止・Message List WEB No.76） */
        /* 仮登録のあとに申込を取り消したアカウント（台帳 2026/10/03） */
        if (res.stopped && res.stopReason === '申込取消') throw new ApiError('お申し込みは取り消されました。ご不明な点は ESキッチンへお問い合わせください。', 403);
        if (res.stopped) throw new ApiError('このアカウントはご解約により停止しています。お問い合わせは ESキッチンサポート窓口までご連絡ください。', 403);
        throw new ApiError('ログインID またはパスワードが正しくありません', 401);
      }
      const acc = res.account;
      loginAt.current = Date.now();
      const scope = acc.scope as { type: string; corpId?: string; branchId?: string };
      let a: CorpAccount;
      if (scope.type === 'branch' && scope.branchId) {
        const b = await orgApi.query('branch', { id: scope.branchId });
        if (!b.corp) throw new ApiError('この拠点アカウントは法人Web を使えません（法人がありません）', 403);
        a = corpAccountOf(acc, b.corp, b.branch, b.contract ? [b.contract.kind] : []);
      } else if (scope.type === 'corp' && scope.corpId) {
        const c = await orgApi.query('corp', { id: scope.corpId });
        a = corpAccountOf(acc, c.corp, null, c.branches.map((x) => x.contract?.kind).filter((k): k is NonNullable<typeof k> => !!k));
      } else throw new ApiError('ログイン ID またはパスワードが正しくありません', 401);
      keepLoginSet(KEY, JSON.stringify(a));
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
  }), [ready, account, view, roTitle, toast]);

  return (
    <CorpContext.Provider value={value}>
      {children}
      {modal}
      {toasts.map((t) => <div key={t.id} className="hd-toast" role="status">{t.msg}</div>)}
    </CorpContext.Provider>
  );
}

export function useCorp() {
  const c = useContext(CorpContext);
  if (!c) throw new Error('useCorp は CorpProvider の中で使ってください');
  return c;
}

/** ログイン後の画面用（account が必ずある） */
export function useCorpSignedIn() {
  const c = useCorp();
  if (!c.account) throw new Error('ログイン後の画面でだけ使ってください');
  return { ...c, account: c.account };
}

/** 枠と同じ見た目のダイアログ（元の hd-dlg） */
export function CorpDialog({ children, login }: { children: ReactNode; login?: boolean }) {
  const { closeModal } = useCorp();
  return (
    <div className={`hd-ov${login ? ' login' : ''}`} onClick={(e) => { if (!login && e.target === e.currentTarget) closeModal(); }}>
      <div className="hd-dlg" role="dialog" aria-modal="true">{children}</div>
    </div>
  );
}
