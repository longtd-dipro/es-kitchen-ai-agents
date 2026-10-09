'use client';

import { useState } from 'react';
import { addDays, fromIso, pad2, toIso, today, WD_M, ymJa, ymOf } from '@/lib/supplier/dates';
import { qtyOf } from '@/lib/supplier/orders';
import { useSupplier } from '@/lib/supplier/store';
import type { Order } from '@/lib/supplier/types';
import { Field, Icon } from '../../../_components/ui';
import { DateInput } from '@/components/DateInput';
import { fmtDate } from '@/lib/format/date';

type Period = { from: string; to: string };

/** この発注だけの入荷スケジュール（月曜始まり。入荷希望日・出荷予定・出荷のある週だけ出す） */
function OrderCalendar({ o, op }: { o: Order; op: Period }) {
  const ps = o.parts ?? [];
  const hl = new Set([...o.rows.map((r) => r.wish), ...ps.map((x) => x.eta), ...ps.map((x) => x.ship)].filter(Boolean) as string[]);
  const yms = [...new Set([...hl].map(ymOf))].sort();
  const t = today();

  return (
    <>
      {yms.map((ym) => {
        const [y, m] = ym.split('-').map(Number);
        const days = new Date(y, m, 0).getDate();
        const lead = (new Date(y, m - 1, 1).getDay() + 6) % 7;
        const first = `${y}/${pad2(m)}/01`;
        const last = `${y}/${pad2(m)}/${pad2(days)}`;
        /* 月の外の日は先頭に '~' を付ける */
        const cells: string[] = [];
        for (let i = lead; i > 0; i--) cells.push('~' + addDays(first, -i));
        for (let d = 1; d <= days; d++) cells.push(`${y}/${pad2(m)}/${pad2(d)}`);
        for (let k = 1; cells.length % 7; k++) cells.push('~' + addDays(last, k));
        const keep: string[] = [];
        for (let i = 0; i < cells.length; i += 7) {
          const w = cells.slice(i, i + 7);
          if (w.some((d) => d[0] !== '~' && hl.has(d))) keep.push(...w);
        }

        return (
          <div key={ym}>
            <div style={{ fontWeight: 700, margin: '0.571429rem 0 0.428571rem' }}>{ymJa(ym)}</div>
            <div className="es-cal">
              {WD_M.map((w) => <div className="es-cal__wd" key={w}>{w}</div>)}
              {keep.map((date) => {
                if (date[0] === '~') {
                  return (
                    <div className="es-calcell es-calcell--out" key={date}>
                      <div className="es-calcell__top"><span className="es-calcell__date">{+date.slice(9)}</span></div>
                    </div>
                  );
                }
                const rs = o.rows.filter((r) => r.wish === date);
                const inP = date >= op.from && date <= op.to;
                return (
                  <div key={date} className={`es-calcell ${inP ? 'es-calcell--inp' : ''} ${rs.length && !inP ? 'es-calcell--dim' : ''} ${date === t ? 'is-today' : ''}`}>
                    <div className="es-calcell__top"><span className="es-calcell__date">{+date.slice(8)}</span></div>
                    {rs.map((r, i) => (
                      <div className="chip hon" title={fmtDate(r.wish)} key={'r' + i}><span><b>{r.qty.toLocaleString()}{o.unit}</b></span></div>
                    ))}
                    {ps.map((x, i) => {
                      const n = ps.length > 1 ? `${i + 1}回目 ` : '';
                      return (
                        <span key={'p' + i} style={{ display: 'contents' }}>
                          {x.eta === date && x.st !== '出荷済' && <div className="chip eta"><Icon name="truck" />{n}出荷予定 {x.qty.toLocaleString()}</div>}
                          {x.st === '出荷済' && x.ship === date && <div className="chip eta"><Icon name="truck" />{n}出荷 {x.qty.toLocaleString()}</div>}
                        </span>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </>
  );
}

/** 入荷スケジュール・期間集計 */
export default function ScheduleCard({ o }: { o: Order }) {
  const { toast } = useSupplier();
  const ws = o.rows.map((r) => r.wish).sort();
  const all: Period = { from: ws[0], to: ws[ws.length - 1] };
  const [op, setOp] = useState<Period>(all);
  const [input, setInput] = useState<Period>(all);
  const pr = o.rows.filter((r) => r.wish >= op.from && r.wish <= op.to);
  const pq = pr.reduce((a, r) => a + r.qty, 0);

  return (
    <div className="card">
      <h2>入荷スケジュール・期間集計</h2>
      <div className="filter" style={{ marginBottom: '0.857143rem' }}>
        <Field label="期間（開始）"><DateInput className="inp" value={toIso(input.from)} onChange={(e) => setInput({ ...input, from: fromIso(e.target.value) })} /></Field>
        <Field label="期間（終了）"><DateInput className="inp" value={toIso(input.to)} onChange={(e) => setInput({ ...input, to: fromIso(e.target.value) })} /></Field>
        <div className="fa">
          <button className="btn out" onClick={() => { setOp(all); setInput(all); }}>全期間</button>
          <button
            className="btn pri"
            onClick={() => {
              if (!input.from || !input.to || input.from > input.to) return toast('期間を正しく入力してください');
              setOp(input);
            }}
          >
            集計する
          </button>
        </div>
      </div>
      <div className="kpis" style={{ marginBottom: '0.857143rem' }}>
        <div className="kpi" style={{ cursor: 'default' }}><small>期間内の数量（入荷希望日ベース）</small><b>{pq.toLocaleString()}</b><span>{o.unit}</span></div>
        <div className="kpi" style={{ cursor: 'default' }}><small>入荷日数</small><b>{pr.length}</b><span>日</span></div>
        <div className="kpi" style={{ cursor: 'default' }}><small>発注全体の数量</small><b>{qtyOf(o).toLocaleString()}</b><span>{o.unit}</span></div>
      </div>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', fontSize: '0.857143rem', marginBottom: '0.285714rem' }}>
        <span><i className="lg hon" />入荷希望日と数量（期間内）</span>
        <span><i className="lg eta" />出荷予定／出荷</span>
        <span><i className="lg per" />集計の期間</span>
      </div>
      <OrderCalendar o={o} op={op} />
    </div>
  );
}
