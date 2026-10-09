'use client';

import { LEAVE_MSG, useOpsLeaveGuard } from '@/app/ops/_ui/leaveGuard';
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { DEMO } from '@/lib/demo';
import { areaApi } from '@/lib/ops/core/client';
import general from '@/lib/ops/areas/general';
import type { History } from '@/lib/ops/general/types';
import { Icon } from '../_ui/Icon';
import { useOps } from '../_ui/OpsProvider';
import { ConfirmModal } from '../_ui/ui';
import { fmtAuto, fmtDatesIn, fmtDateTime } from '@/lib/format/date';

/* 領域 general の画面で共通の部品（元の sec・histTable・demoBar・askDiscard など） */

export const api = areaApi(general);

/** デモのときは元の文言、開発用では普通の文言 */
export const demoMsg = (demo: string, dev: string) => (DEMO ? demo : dev);

/** 画面の上の DEMO 帯（元の demoBar。デモのときだけ） */
export function DemoNote() {
  if (!DEMO) return null;
  return (
    <div className="demo-bar">
      <span className="tag">DEMO</span>
      <span>Figma「ES Kitchen phase 2 / Admin Web (P2)」をもとにした画面モック。<b>代理・紹介管理</b>は一覧→詳細→編集まで操作可能（紹介履歴は法人・契約管理の親契約から自動作成）。<b>契約申請管理・法人・契約管理・配送管理・請求・レビュー</b>などは「運営Web デモ v1.74」を組み込み済みで、代理店・法人・契約・倉庫・配送のIDと名称はそちらに合わせています。その他は一覧画面のみ。データは架空のサンプルで、再読み込みで初期状態に戻ります。</span>
    </div>
  );
}

/** 開閉できる区切り（元の sec） */
export function Sec({ title, children }: { title: ReactNode; children: ReactNode }) {
  const [closed, setClosed] = useState(false);
  return (
    <section className={`sec${closed ? ' closed' : ''}`}>
      <div className="sec-h">
        <h2>{title}</h2>
        <button className="tog" aria-label={`${typeof title === 'string' ? title : ''}の開閉`} onClick={() => setClosed(!closed)}><Icon name="up" /></button>
      </div>
      <div className="sec-b">{children}</div>
    </section>
  );
}

/** 変更履歴の表 */
export function HistTable({ h }: { h: History[] }) {
  return (
    <div className="tbl-wrap">
      <table className="tbl">
        <thead><tr><th>変更日時</th><th>変更内容</th><th>変更者</th></tr></thead>
        <tbody>{h.map((x, i) => <tr key={i}><td>{fmtDateTime(x.at)}</td><td>{fmtDatesIn(x.what)}</td><td>{x.by}</td></tr>)}</tbody>
      </table>
    </div>
  );
}

/** 読むだけの入力欄 */
export const Ro = ({ v, ph }: { v: ReactNode; ph?: string }) => <input className="inp" disabled value={v == null ? '' : fmtAuto(String(v))} placeholder={ph} />;

/** 読み込み中 */
export const Loading = () => <div className="card"><div className="ph-empty"><span>読み込み中…</span></div></div>;

/**
 * 編集中の内容があるときの確認（元の askDiscard・beforeunload）。
 *   const g = useDirty(); g.mark() で編集中に、g.guard(() => 離れる処理)
 */
export function useDirty(on = true) {
  const { openModal } = useOps();
  const dirty = useRef(false);
  const [, force] = useState(0);
  useEffect(() => {
    if (!on) return;
    const f = (e: BeforeUnloadEvent) => { if (dirty.current) { e.preventDefault(); e.returnValue = ''; } };
    window.addEventListener('beforeunload', f);
    return () => window.removeEventListener('beforeunload', f);
  }, [on]);
  useOpsLeaveGuard(() => on && dirty.current);
  const mark = useCallback(() => { if (!dirty.current) { dirty.current = true; force((n) => n + 1); } }, []);
  const clear = useCallback(() => { dirty.current = false; }, []);
  const guard = useCallback((then: () => void) => {
    if (!dirty.current) { then(); return; }
    openModal(<ConfirmModal kind="warn" title={LEAVE_MSG.title} text={LEAVE_MSG.text} ok={LEAVE_MSG.ok} okCls="warn-solid" cancel={LEAVE_MSG.cancel} onOk={() => { dirty.current = false; then(); }} />);
  }, [openModal]);
  return { mark, clear, guard, get dirty() { return dirty.current; } };
}

/** 削除の確認（元の askDelete のダイアログ） */
export function useAskDelete() {
  const { openModal } = useOps();
  return useCallback((onOk: () => void | Promise<void>, text: ReactNode = <>このデータを削除してもよろしいですか？<br />削除したデータは元に戻せません。</>) => {
    openModal(<ConfirmModal title="削除確認" text={text} ok="削除" onOk={onOk} />);
  }, [openModal]);
}
/** 論理削除のあとのトースト */
export const DEL_MSG = '削除しました（「削除済」として残ります。検索条件の「削除済みを表示しない」を外すと表示されます）';
