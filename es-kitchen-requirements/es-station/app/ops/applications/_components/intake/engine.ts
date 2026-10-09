'use client';

import { createContext, useContext } from 'react';
import type { IntakeState, NewRow, PreparedCfg } from '@/lib/ops/applications/intake';

/*
 * 受付画面の部品が共有する道具（元の DEMO.* の関数）。状態（IntakeState）は受付画面が持ち、
 * 部品は s を読み、書き換えは update(fn) を通す（書き換えたら描き直す）
 */
export type Engine = {
  cfg: PreparedCfg;
  /** 受付の入力ができるか（権限。false＝見るだけ） */
  canEdit?: boolean;
  s: IntakeState;
  /** 状態を書き換えて描き直す */
  update: (fn: (s: IntakeState) => void) => void;
  toast: (msg: string) => void;
  /** 編集中の入力行（行を追加） */
  nf: NewRow | null;
  setNf: (f: NewRow | null) => void;
  nfBad: string[];
  setNfBad: (b: string[]) => void;
  /** 参照のみ（詳細情報設定で編集していないとき） */
  roD: () => boolean;
  /** 編集を始める・やめる */
  startEdit: (kind: 'A' | 'D') => void;
  /** 編集中で変更があれば破棄の確認を出してから go */
  guard: (go: () => void, cl?: string) => void;
};
export const EngineContext = createContext<Engine | null>(null);
export function useEngine() {
  const e = useContext(EngineContext);
  if (!e) throw new Error('useEngine は受付画面の中で使ってください');
  return e;
}
