'use client';

import { useState, type ReactNode } from 'react';
import { api } from '@/lib/ops/purchasing/client';
import { smBlank, smHistRows, smItemsTxt, smSl, smSlW, smTrackingOk } from '@/lib/ops/purchasing/samples';
import type { Sample, SampleForm } from '@/lib/ops/purchasing/types';
import { Icon } from '../../_ui/Icon';
import { useOps } from '../../_ui/OpsProvider';
import { Field } from '../../_ui/ui';
import { Box } from './common';
import { fmtDate, fmtDateTime } from '@/lib/format/date';
import { opsCls } from '@/lib/format/status';

/* 営業サンプルの画面で共通の部品 */

const CLS: Record<string, string> = { 受付済: 'b-info', 締め済: 'b-ok', 締め後追加: 'b-warn' };
export const SmBadge = ({ v }: { v: string }) => <span className={`badge ${opsCls(v, CLS[v] ?? 'b-mute')}`}>{v}</span>;
/** 仮置き（意味が決まっていないため仮に決めた点） */
export const Kari = ({ t }: { t?: string }) => <span className="kari" title="意味が決まっていないため仮置き（要確認）">{t || '仮置き'}</span>;
export const Basis = ({ children }: { children: ReactNode }) => <div className="sm-basis"><Icon name="bell" /><span><b>決定の根拠：</b>{children}</span></div>;

export function HistTable({ rows }: { rows: Sample[] }) {
  return (
    <div className="tbl-wrap">
      <table className="tbl">
        <thead><tr><th>サンプルNo</th><th>受付日</th><th>商品</th><th>納品日</th><th>発送日</th><th>倉庫</th><th>状態</th></tr></thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.no}><td className="mono">{r.no}</td><td>{fmtDate(r.regDate)}</td><td><div className="clip" style={{ maxWidth: '21.428571rem' }} title={smItemsTxt(r.items)}>{smItemsTxt(r.items)}</div></td><td>{smSlW(r.deliv)}</td><td>{smSlW(r.ship)}</td><td>{r.wh}</td><td><SmBadge v={r.status} /></td></tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
export { smHistRows };

/** サンプル登録の入力（画面を移っても残す。宛先の履歴から「この宛先でサンプルを登録」で入れることもある） */
export const SMF: { form: SampleForm | null; ym: string } = { form: null, ym: '2026-11' };
export const newForm = (from?: Partial<SampleForm>) => ({ ...smBlank(), ...from });

/** メモ・送り状番号の編集（一覧の行・詳細の両方から開く）。変更履歴つき */
export function MemoModal({ r0 }: { r0: Sample }) {
  const { closeModal, toast, toastError } = useOps();
  const [memo, setMemo] = useState(r0.memo);
  const [trk, setTrk] = useState(r0.trackingNo);
  const [e, setE] = useState<Record<string, string>>({});
  const hist = (r0.history ?? []).slice().reverse();
  const save = async () => {
    const er: Record<string, string> = {};
    if (memo.length > 500) er.memo = 'メモは500文字以内で入力してください。';
    if (!smTrackingOk(trk.trim())) er.trk = '送り状番号は半角英数字とハイフンで入力してください。';
    if (Object.keys(er).length) { setE(er); return; }
    try { await api.action('updateSample', { no: r0.no, memo: memo.trim(), trackingNo: trk.trim() }); closeModal(); toast(`${r0.no} のメモ・送り状番号を保存しました`); } catch (err) { toastError(err); }
  };
  return (
    <Box title="メモ・送り状番号" width={640} footer={<><button className="btn lg ghost" onClick={closeModal}>キャンセル</button><button className="btn pri lg" onClick={save}>保存</button></>}>
      <p className="muted" style={{ margin: '0 0 0.857143rem' }}>{r0.no}（{r0.company}）。登録後に直せるのはメモと送り状番号だけです。宛先・商品・納品日などを直すときは、取消して登録し直してください。</p>
      <Field label="送り状番号（任意）" htmlFor="sm-trk" err={e.trk} hint="出荷後に分かった番号を入れます。半角英数字とハイフン・30文字まで"><input className={`inp${e.trk ? ' err' : ''}`} id="sm-trk" value={trk} maxLength={30} onChange={(ev) => setTrk(ev.target.value)} /></Field>
      <div style={{ marginTop: '0.857143rem' }}>
        <Field label="メモ（任意）" htmlFor="sm-memo-m" err={e.memo} hint={`${memo.length}/500文字`}><textarea className={`inp${e.memo ? ' err' : ''}`} id="sm-memo-m" rows={5} style={{ height: 'auto', textAlign: 'left' }} value={memo} onChange={(ev) => setMemo(ev.target.value)} /></Field>
      </div>
      <div style={{ marginTop: '1.142857rem' }}>
        <b>変更履歴</b>
        {hist.length ? (
          <div className="tbl-wrap" style={{ marginTop: '0.428571rem' }}>
            <table className="tbl">
              <thead><tr><th>日時</th><th>変更した人</th><th>項目</th><th>変更前</th><th>変更後</th></tr></thead>
              <tbody>{hist.map((h, i) => <tr key={i}><td>{fmtDateTime(h.at)}</td><td>{h.by}</td><td>{h.field}</td><td>{h.before || '（なし）'}</td><td>{h.after || '（なし）'}</td></tr>)}</tbody>
            </table>
          </div>
        ) : <p className="muted" style={{ margin: '0.428571rem 0 0' }}>変更履歴はまだありません。</p>}
      </div>
    </Box>
  );
}
