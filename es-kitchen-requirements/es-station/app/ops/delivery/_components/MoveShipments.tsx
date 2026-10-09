'use client';

import { useState } from 'react';
import { useQuery } from '@/lib/ops/core/client';
import { fmtDate } from '@/lib/format/date';
import { useOps } from '../../_ui/OpsProvider';
import { api } from './api';
import { Badge, Button, CalendarCell, Checkbox, Dialog, DialogSection, EsModal, InlineMessage, Select, TextField } from './kit';

/*
 * 出荷データの移動（部品 16 の MoveShipments を課題 2-4 の決まりで作り直したもの。ドラッグはしない）。
 * スケジュールでチェックした配送（1件・複数・その日全部）を、選んだお届け日へ動かす。決まりは共通データ（lib/domain/move.ts）：
 *   本発注の前＝複数を一度に（同じサイクルの中）／本発注の後＝1便だけ（同じ日の冷凍・冷蔵は一緒）・理由が要る・A↔B／C↔D の中だけ
 *   お届けしない日（祝日・日曜・月曜）＝確認して動かす／別のサイクル＝トラブルの対応のときだけ（記録したトラブルを選ぶ・確認して動かす。課題 4b-4）
 *   選べない日＝倉庫が出荷できない日（倉庫の出荷禁止日・出荷不可の枠）と過ぎた日（課題 4b-2：月曜で一律に止めない）
 *   件数・ドライバーが多いときは警告。出荷指示を送ったあとは版番号つきで再送。委託配送先へ通知、法人へは「法人に通知」のとき
 */

const WD = ['月', '火', '水', '木', '金', '土', '日'];
const iso = (d: string) => d.replace(/\//g, '-');

export default function MoveShipments({ ids, onClose, onDone }: { ids: string[]; onClose: () => void; onDone: () => void }) {
  const { toast, toastError } = useOps();
  const [to, setTo] = useState('');
  const [reason, setReason] = useState('');
  const [trouble, setTrouble] = useState(false);
  const [troubleId, setTroubleId] = useState('');
  const [notifyCorp, setNotifyCorp] = useState(true);
  const [ask, setAsk] = useState<'holiday' | 'cross' | null>(null);
  const [busy, setBusy] = useState(false);
  const { data: plan } = useQuery(api, 'movePlan', { ids, to, reason, trouble, troubleId });
  const { data: cal } = useQuery(api, 'moveCalendar', { ids, trouble });

  /* 移動先を選ぶ前のエラー（「移動先を選んでください」）は出さない */
  const errors = (plan?.errors ?? []).filter((e) => to || !e.startsWith('移動先のお届け日'));
  const ready = !!plan && !!to && !errors.length;
  const run = async (confirmHoliday: boolean, confirmCross: boolean) => {
    if (!plan) return;
    if (plan.needs.holiday && !confirmHoliday) { setAsk('holiday'); return; }
    if (plan.needs.cross && !confirmCross) { setAsk('cross'); return; }
    setBusy(true);
    try {
      const r = await api.action('moveShipments', { ids, to, reason, trouble, troubleId, confirmHoliday, confirmCross, notifyCorp });
      onClose(); onDone();
      toast(`${r.count}件を ${to} へ移動しました（${r.id}${r.resent ? `・出荷指示を再送 ${r.resent}件` : ''}${r.carriers ? `・委託配送先 ${r.carriers}社へ通知` : ''}${notifyCorp ? '・法人へ通知' : ''}）`);
    } catch (e) { toastError(e); } finally { setBusy(false); setAsk(null); }
  };

  return (
    <>
      <Dialog m="MoveShipments" title="出荷データの移動" footerNote={`${ids.length}件 選択中${plan && plan.rows.length > ids.length ? `（同じ日の冷凍・冷蔵を含めて ${plan.rows.length}件）` : ''}`} onClose={onClose}
        footer={<><Button variant="outline" size="lg" onClick={onClose}>キャンセル</Button><Button size="lg" disabled={!ready || busy} onClick={() => run(false, false)}>確認して移動</Button></>}>
        {plan && (
          plan.lockReason
            ? <InlineMessage tone="negative" title="まとめて動かせません">{plan.lockReason}。1便だけ選んでください。</InlineMessage>
            : plan.phase === '本発注後'
              ? <InlineMessage tone="warning" title="本発注の後の便です">1便ずつ・理由が必要です。同じ半分（A↔B／C↔D）の中だけ動かせます（ほかは、トラブルの対応のときだけ）。本発注：{plan.deadline.join('・') || '—'}</InlineMessage>
              : <InlineMessage tone="info" title="本発注の前の便です">複数の便をまとめて動かせます（同じサイクルの中）。同じ拠点・同じ日の冷凍・冷蔵は一緒に動きます。本発注：{plan.deadline.join('・') || '—'}まで</InlineMessage>
        )}
        <DialogSection title="移動先のお届け日" note="出荷日はリードタイムを保って一緒に動きます。グレー＝選べない（倉庫が出荷できない日・過ぎた日・移動の決まりに合わない日。カーソルを置くと理由が出ます）、赤枠＝お届けしない日（祝日・日曜・月曜：確認して動かす）、点線＝いまのお届け日、「本発注後」＝本発注の後の半分" />
        <div className="mdl-b">
          <div style={{ display: 'flex', gap: '1.142857rem', alignItems: 'flex-end', marginBottom: '0.571429rem' }}>
            <TextField date label="お届け日" value={to} onChange={setTo} style={{ width: '14.285714rem' }} />
            {to && <span style={{ fontSize: '0.928571rem', color: 'var(--text-low)', paddingBottom: '0.714286rem' }}>{plan?.rows[0] ? `出荷日 ${fmtDate(plan.rows[0].toShip)}` : ''}</span>}
          </div>
          <div style={{ display: 'flex', gap: '1.142857rem', flexWrap: 'wrap' }}>
            {(cal ?? []).map((c) => (
              <div key={c.cycle} style={{ minWidth: '21.428571rem' }}>
                <div style={{ fontSize: '0.928571rem', fontWeight: 700, marginBottom: '0.285714rem' }}>{c.cycle} サイクル</div>
                <div className="es-cal es-cal--sm">
                  {WD.map((w) => <div key={w} className="es-cal__wd">{w}</div>)}
                  {c.days.map((x) => {
                    /* 選べない日＝過ぎた日・倉庫が出荷できない日・移動の決まりに合わない日（理由は title と aria に出す） */
                    const why = x.past ? '出荷日が今日以前の日は選べません' : !x.canShip ? '倉庫が出荷できない日は選べません' : x.block;
                    const dis = !!why, on = iso(x.date) === to;
                    return (
                      <CalendarCell key={x.date} selected={on} disabled={dis}
                        title={`${fmtDate(x.date)} ${x.slot}${x.off ? `（${x.off}）` : ''} ・ 出荷 ${fmtDate(x.ship)}（${x.ships}件）${x.afterHon ? ' ・ 本発注の後' : ''}${why ? ` ・ 選べません：${why}` : ''}`}
                        onClick={dis ? undefined : () => setTo(iso(x.date))}
                        c={{ date: String(+x.date.slice(8)), holiday: x.off || undefined, slot: x.slot, state: [dis ? 'out' : '', x.off ? 'holiday' : '', x.cur ? 'draft' : ''].filter(Boolean), lines: x.afterHon ? [{ value: '本発注後', tone: 'plan' }] : [], badges: [] }} />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '1.142857rem', alignItems: 'end', marginTop: '0.857143rem' }}>
            <TextField label="理由" req={plan?.phase === '本発注後' || trouble} placeholder="例）倉庫の都合で前倒し／誤配送の再送" value={reason} onChange={setReason} />
            <Checkbox label="トラブルの対応（別のサイクルへ）" checked={trouble} onChange={(v) => { setTrouble(v); if (!v) setTroubleId(''); }} />
            <Checkbox label="法人に通知する" checked={notifyCorp} onChange={setNotifyCorp} />
          </div>
          {trouble && (
            <Select label="対応するトラブル" req placeholder={plan?.troubles.length ? '選んでください' : '動かす便の拠点に記録したトラブルがありません'} value={troubleId} onChange={setTroubleId}
              helper="別のサイクルへ動かすのは、記録したトラブルの対応のときだけです（移動の履歴にトラブルをつなぎます）"
              options={(plan?.troubles ?? []).map((t) => ({ value: t.id, label: `${t.id}　${t.name}（${fmtDate(t.deliverOn)} の便 ${t.deliveryId}）${t.note ? `：${t.note}` : ''}${t.resolved ? '・解決済' : ''}` }))} />
          )}
          {errors.length > 0 && <InlineMessage tone="negative" title="移動できません"><ul style={{ margin: '0.285714rem 0', paddingLeft: '1.428571rem' }}>{errors.map((e) => <li key={e}>{e}</li>)}</ul></InlineMessage>}
          {!!plan?.warnings.length && <InlineMessage tone="warning" title="確認してください（移動はできます）"><ul style={{ margin: '0.285714rem 0', paddingLeft: '1.428571rem' }}>{plan.warnings.map((e) => <li key={e}>{e}</li>)}</ul></InlineMessage>}
          {to && plan && (plan.needs.holiday || plan.needs.cross) && (
            <InlineMessage tone="warning" title="移動の前に確認します">{[plan.needs.holiday && `${to} はお届けしない日（${plan.needs.holiday}）です`, plan.needs.cross].filter(Boolean).join('。')}</InlineMessage>
          )}
          <DialogSection title="動かす配送" note="同じ拠点・同じ日の冷凍・冷蔵は一緒に動きます。出荷指示を送ったあとの便は版番号つきで再送します" />
          <div className="es-table-wrap">
            <table className="es-table">
              <thead><tr><th>配送No</th><th>拠点名</th><th>温度帯</th><th>お届け日</th><th>出荷日</th><th>出荷指示</th></tr></thead>
              <tbody>
                {(plan?.rows ?? []).map((x) => (
                  <tr key={x.deliveryId}>
                    <td className="es-mono">{x.deliveryId}</td><td>{x.name}</td><td>{x.temp}</td>
                    <td>{fmtDate(x.fromDeliver)}{to && <> → <b>{fmtDate(x.toDeliver)}</b></>}</td>
                    <td>{fmtDate(x.fromShip)}{to && <> → {fmtDate(x.toShip)}</>}</td>
                    <td>{x.resent ? <Badge tone="warning">再送（rev+1）</Badge> : '次の出荷指示に載る'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Dialog>
      {ask === 'holiday' && (
        <EsModal m="MoveConfirm" tone="warning" title="本当に移動しますか？お客様に確認済みですか？" confirmLabel="移動する" onCancel={() => setAsk(null)} onConfirm={() => run(true, false)}>
          <div style={{ fontSize: '1rem', lineHeight: '1.571429rem' }}>{to} は拠点のお届けしない日（{plan?.needs.holiday}）です。</div>
        </EsModal>
      )}
      {ask === 'cross' && (
        <EsModal m="MoveConfirm" tone="warning" title="別のサイクル・別の半分へ移動しますか？" confirmLabel="トラブルの対応として移動する" onCancel={() => setAsk(null)} onConfirm={() => run(!!plan?.needs.holiday, true)}>
          <div style={{ fontSize: '1rem', lineHeight: '1.571429rem' }}>{plan?.needs.cross}。トラブルの対応のときだけ動かせます（トラブル：{troubleId || '—'}・理由：{reason || '—'}）。</div>
        </EsModal>
      )}
    </>
  );
}
