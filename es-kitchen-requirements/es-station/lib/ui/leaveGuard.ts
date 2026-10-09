'use client';

import { useEffect, useRef } from 'react';

/*
 * 編集中に画面を離れるときの確認（元の askDiscard）。サイドメニューのリンクは各サイトの枠（OpsShell・CorpShell）がここを見て、
 * 保存していない変更があれば「編集内容の破棄」を出してから移る。
 *   useOpsLeaveGuard(dirty)            … 真偽値
 *   useOpsLeaveGuard(() => isDirty())  … 押した時点で調べる関数
 * 再読み込み・タブを閉じるときの確認（beforeunload）は、これまでどおり各画面で出す。
 */
const checks = new Set<() => boolean>();

export function useOpsLeaveGuard(dirty: boolean | (() => boolean)) {
  const ref = useRef(dirty);
  ref.current = dirty;
  useEffect(() => {
    const f = () => (typeof ref.current === 'function' ? ref.current() : ref.current);
    checks.add(f);
    return () => { checks.delete(f); };
  }, []);
}

/** 保存していない変更がある画面が開いているか */
export const hasUnsavedChanges = () => [...checks].some((f) => f());

/** 早く return する画面で、フックの代わりに JSX の中に置いて使う */
export function OpsLeaveGuard({ dirty }: { dirty: boolean }) {
  useOpsLeaveGuard(dirty);
  return null;
}

/*
 * Q02 の文言（Message List No.25・台帳 F「入力中に画面を離れるときの確認（Q02）」2026-10-05：全サイト共通）。
 * 対象：登録・編集のフォームで入力を変えたあとの キャンセル・ほかの画面への移動・ブラウザを閉じる／再読み込み
 */
export const LEAVE_MSG = {
  title: '編集内容を破棄しますか？',
  text: '編集中の内容は保存されません。編集内容を破棄してもよろしいですか？',
  ok: '破棄',
  cancel: 'キャンセル',
} as const;

/** ブラウザを閉じる・再読み込みの確認（beforeunload。文言はブラウザのもの） */
export function useBeforeUnload(dirty: boolean | (() => boolean)) {
  const ref = useRef(dirty);
  ref.current = dirty;
  useEffect(() => {
    const f = (e: BeforeUnloadEvent) => {
      if (typeof ref.current === 'function' ? ref.current() : ref.current) { e.preventDefault(); e.returnValue = ''; }
    };
    window.addEventListener('beforeunload', f);
    return () => window.removeEventListener('beforeunload', f);
  }, []);
}

/** 画面の移動（各サイトの枠が見る）と beforeunload の両方 */
export function useLeaveGuard(dirty: boolean | (() => boolean)) {
  useOpsLeaveGuard(dirty);
  useBeforeUnload(dirty);
}
