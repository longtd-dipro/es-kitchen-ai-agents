'use client';

import { useState } from 'react';
import { useDomainQuery } from '@/lib/domain/client';
import { honPhase } from '@/lib/domain/stock';
import { api } from '@/lib/ops/purchasing/client';
import type { Rec } from '@/lib/ops/purchasing/logic';
import { MONTHS, n, supName } from '@/lib/ops/purchasing/master';
import type { POrder } from '@/lib/ops/purchasing/types';
import { useQuery } from '@/lib/ops/core/client';
import { fmtDate, fmtYm } from '@/lib/format/date';
import { useOps } from '../../_ui/OpsProvider';
import { B, Box, Info, yen } from './common';
import { stockApi } from './receipts';

/* 仕入先への支払（課題「Thống kê tiền trả nhà cung cấp」：新しい画面は作らず、発注の一覧のボタン → モーダル）と、本発注の時期（月2回・課題 2-4） */

type Pay = { ym: string; supplierId: string; orders: number; orderYen: number; deductYen: number; payYen: number; bill: string };

/** 月 × 仕入先の集計（発注金額・不良控除（返品）・支払額・請求照合）のモーダル */
export function PayablesModal({ orders, ym0 }: { orders: POrder[]; ym0: string }) {
  const { closeModal } = useOps();
  const { data: claims } = useQuery(api, 'claims', {});
  const months = [...new Set([...MONTHS, ...orders.map((o) => o.ym), ...((claims ?? []) as { ym: string }[]).map((c) => c.ym)])].filter(Boolean).sort().reverse();
  const [ym, setYm] = useState(ym0);
  /* 仕入先サイトの共通 DB の発注は画面が読んでいるものを渡す（この領域の発注・追加発注は領域が足す。同じ番号は1つにする） */
  const { data } = useQuery(api, 'supplierPayables', { ym, dbOrders: orders.filter((o) => o.src === 'db') });
  const rows = (data ?? []) as Pay[];
  const tot = rows.reduce((a, r) => ({ o: a.o + r.orderYen, d: a.d + r.deductYen, p: a.p + r.payYen }), { o: 0, d: 0, p: 0 });
  return (
    <Box title="仕入先への支払（月 × 仕入先）" width={880} footer={<><span style={{ flex: 1 }} /><button className="btn lg ghost" onClick={closeModal}>閉じる</button></>}>
      <div style={{ display: 'flex', gap: '0.571429rem', alignItems: 'center', marginBottom: '0.857143rem' }}>
        <label htmlFor="pay-ym" style={{ fontWeight: 700 }}>対象年月</label>
        <select id="pay-ym" className="sel" style={{ width: '11.428571rem' }} value={ym} onChange={(e) => setYm(e.target.value)}>{months.map((m) => <option key={m} value={m}>{fmtYm(m)}</option>)}</select>
        <span className="hint">発注金額＝本発注の数 × 仕入単価（本発注したときの写し・取消／受注不可を除く）。不良控除＝代替品設定の不良の数 × 仕入単価（マイナス）。支払額＝発注金額＋不良控除</span>
      </div>
      <div className="tbl-wrap">
        <table className="tbl">
          <thead><tr><th>仕入先</th><th className="num">発注（件）</th><th className="num">発注金額（税抜）</th><th className="num">不良控除（返品）</th><th className="num">支払額（税抜）</th><th>請求照合</th></tr></thead>
          <tbody>
            {!data ? <tr><td colSpan={6} className="empty">読み込み中…</td></tr>
              : rows.length ? rows.map((r) => (
                <tr key={r.supplierId}><td>{supName(r.supplierId)}<br /><span className="hint mono">{r.supplierId}</span></td><td className="num">{n(r.orders)}</td><td className="num">{yen(r.orderYen)}</td>
                  <td className={r.deductYen ? 'num txt-ng' : 'num'}>{r.deductYen ? yen(r.deductYen) : '—'}</td><td className="num"><b>{yen(r.payYen)}</b></td>
                  <td>{r.bill === '—' ? <span className="muted">—</span> : <B v={r.bill} />}</td></tr>
              )) : <tr><td colSpan={6} className="empty">この月の本発注・不良控除はありません</td></tr>}
          </tbody>
          {rows.length > 0 && <tfoot><tr><td colSpan={2}>合計</td><td className="num">{yen(tot.o)}</td><td className="num">{tot.d ? yen(tot.d) : '—'}</td><td className="num"><b>{yen(tot.p)}</b></td><td /></tr></tfoot>}
        </table>
      </div>
      <p className="hint" style={{ marginTop: '0.571429rem' }}>請求照合は「発注データごと」の一覧で発注ごとに変えます（1件でも差異ありなら差異あり、すべて照合済なら照合済）。</p>
    </Box>
  );
}

/** 仮発注・本発注（前半・後半）の時期（共通データの stock.honSchedule） */
export function useHonSchedule(ym: string) {
  return useDomainQuery(stockApi, 'honSchedule', { cycleMonth: ym }).data ?? null;
}
/** 本発注の時期の案内（発注の一覧の上）。仮発注のまま本発注していない発注の数も出す */
export function HonPlan({ ym, recs }: { ym: string; recs: Rec[] }) {
  const s = useHonSchedule(ym);
  if (!s) return null;
  const left = (half: '前半' | '後半') => recs.filter((x) => x.ym === ym && x.st === '仮発注済' && x.st2 === '仮発注済' && x.type !== '資材' && (half === '前半' ? x.from < 14 : x.from >= 14)).length;
  return (
    <Info kind={s.halves.some((h) => honPhase(h) === '過ぎた' && left(h.half) > 0) ? 'ng' : ''}>
      <b>{fmtYm(ym)} サイクルの発注の時期</b>：仮発注はメニューの公開の前（仮発注の承認が公開の条件{s.kari.by ? `・公開 ${fmtDate(s.kari.by)}` : ''}）。
      本発注は<b>月2回</b>{s.halves.map((h) => {
        const ph = honPhase(h), l = left(h.half);
        return <span key={h.half}>｜<b>{h.half}（{h.slots} の便・最初のお届け {fmtDate(h.firstDeliver)}）</b>：{fmtDate(h.from)}〜{fmtDate(h.to)} <B v={ph === '本発注の時期' ? '本発注の時期' : ph === '過ぎた' ? (l ? `期限切れ・未本発注 ${l}件` : '済') : 'まだ'} c={ph === '本発注の時期' ? 'b-warn' : ph === '過ぎた' ? (l ? 'b-ng' : 'b-ok') : 'b-mute'} />{ph !== '過ぎた' && l > 0 ? `（仮発注のまま ${l}件）` : ''}</span>;
      })}
    </Info>
  );
}
