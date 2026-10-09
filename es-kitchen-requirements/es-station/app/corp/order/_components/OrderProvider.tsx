'use client';

import { usePathname, useRouter } from 'next/navigation';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import corpOrder from '@/lib/corp/areas/corp-order';
import { sameQ, type AiState } from '@/lib/corp/order/logic';
import type { Acc, CSite, OrderView, Qty } from '@/lib/corp/order/types';
import { areaApi, useQuery } from '@/lib/ops/core/client';
import { errorMessage } from '@/lib/api/errors';
import { useCorpSignedIn } from '../../_ui/CorpProvider';
import { Toast } from './es';

export const api = areaApi(corpOrder);

/**
 * 月次注文の画面で共通の状態（元の App の state）。商品注文・AI の提案・資材注文・注文履歴で、
 * 選んでいる拠点・入力中の数（登録前）・表示の切替を持ち続ける。データは query view（運営Web の menu.* ほか）。
 */
export type UiState = {
  site: string;
  view: 'grid' | 'list';
  /** 検索条件（q＝検索した条件、qd＝入力中） */
  q: Record<string, string | boolean>; qd: Record<string, string | boolean>;
  sel: Record<string, number>; bulkN: number; bulkMode: 'each' | 'sum'; pg: number; per: number;
  open: Record<string, boolean>;
  /** 商品注文の枠の折りたたみ（info＝受付期間・kid＝この月のご契約・search＝検索条件・sum＝合計の帯。true＝閉じる。拠点タブを変えても保つ。版 1.1 ③） */
  fold: Record<string, boolean>;
  /** 入力中の数（拠点ごと）。登録・破棄で消す */
  qty: Record<string, Qty>; mqty: Record<string, Record<string, number>>;
  ai: AiState | null;
  hq: Record<string, string>; hqd: Record<string, string>; hpg: number; hper: number;
};
const init = (site: string): UiState => ({
  site, view: 'grid', q: {}, qd: {}, sel: {}, bulkN: 10, bulkMode: 'each', pg: 1, per: 10,
  open: { W: true, S: true, B: false, X: true }, fold: {}, qty: {}, mqty: {}, ai: null,
  hq: {}, hqd: {}, hpg: 1, hper: 10,
});
/** 最初に開く拠点：拠点アカウントはその拠点、法人アカウントは一覧の最初（見られない拠点 ID なら sites[0]） */
const firstSite = (a: { branchId?: string }) => a.branchId ?? '';

type Ctx = {
  acc: Acc; role: string;
  data: OrderView | undefined;
  S: UiState; set: (p: Partial<UiState> | ((o: UiState) => Partial<UiState>)) => void;
  /** 選んでいる拠点（見られない拠点なら最初の拠点） */
  s: CSite | undefined;
  /** 拠点の数（入力中があればそれ、なければ登録済みの数） */
  qtyOf: (id: string) => Qty;
  mqtyOf: (id: string) => Record<string, number>;
  dirtyO: (id: string) => boolean; dirtyM: (id: string) => boolean;
  toast: (t: string, tone?: string) => void; toastError: (e: unknown) => void;
};
/** 0 の数量は入れていないのと同じ（資材注文の「変更あり」の判定では 0 を無視する） */
const positive = (o: Record<string, number>) => Object.fromEntries(Object.entries(o).filter(([, v]) => v > 0));
const C = createContext<Ctx | null>(null);

export function OrderProvider({ children }: { children: ReactNode }) {
  const { account, view } = useCorpSignedIn();
  const router = useRouter();
  const path = usePathname();
  /* ro＝解約後（参照のみ）：サーバーの書き込みの操作も断る（受付簿 No.157） */
  const ro = view === 'ro';
  const acc = useMemo<Acc>(() => ({ corpId: account.corpId, branchId: account.branchId, role: account.role, ro }), [account.corpId, account.branchId, account.role, ro]);
  const { data } = useQuery(api, 'view', acc);
  const [S, setS] = useState<UiState>(() => init(firstSite(account)));
  const set = useCallback((p: Partial<UiState> | ((o: UiState) => Partial<UiState>)) => setS((o) => ({ ...o, ...(typeof p === 'function' ? p(o) : p) })), []);
  const [tst, setTst] = useState<{ t: string; tone?: string } | null>(null);
  const tm = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toast = useCallback((t: string, tone?: string) => {
    setTst({ t, tone });
    if (tm.current) clearTimeout(tm.current);
    tm.current = setTimeout(() => setTst(null), 3800);
  }, []);

  /* アカウントを切り替えたら（元の {cmd:'role'}）：その権限の最初の拠点に。AI の提案・注文履歴の詳細は一覧へ */
  const prev = useRef(account.loginId);
  useEffect(() => {
    if (prev.current === account.loginId) return;
    prev.current = account.loginId;
    setS((o) => ({ ...init(firstSite({ branchId: account.branchId })), view: o.view, fold: o.fold }));
    if (path.startsWith('/corp/order/ai')) router.push('/corp/order');
    else if (/^\/corp\/order\/history\/./.test(path)) router.push('/corp/order/history');
  }, [account.loginId, account.branchId, path, router]);

  const value = useMemo<Ctx>(() => {
    const sites = data?.sites ?? [];
    const s = sites.find((x) => x.id === S.site) ?? sites[0];
    const qtyOf = (id: string) => S.qty[id] ?? data?.orders[id]?.q ?? {};
    const mqtyOf = (id: string) => S.mqty[id] ?? data?.matInit[id] ?? {};
    return {
      acc, role: account.role, data, S, set, s, qtyOf, mqtyOf,
      dirtyO: (id) => !!S.qty[id] && !sameQ(S.qty[id], data?.orders[id]?.q),
      dirtyM: (id) => !!S.mqty[id] && !sameQ(positive(S.mqty[id]), positive(data?.matInit[id] ?? {})),
      toast, toastError: (e) => toast(errorMessage(e), 'negative'),
    };
  }, [acc, account.role, data, S, set, toast]);

  return (
    <C.Provider value={value}>
      {children}
      {tst ? <div className="es-toast-host"><Toast tone={tst.tone} onClose={() => setTst(null)}>{tst.t}</Toast></div> : null}
    </C.Provider>
  );
}

export function useOrder() {
  const c = useContext(C);
  if (!c) throw new Error('useOrder は OrderProvider の中で使ってください');
  return c;
}
