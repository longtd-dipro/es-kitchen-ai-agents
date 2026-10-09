'use client';

import { useState } from 'react';
import { runCsvExport } from '@/components/csv/api';
import { ORDERS_CSV_HEAD, ordersCsvRows } from '@/lib/supplier/csv';
import { api } from '@/lib/api/supplier';
import { REASONS } from '@/lib/supplier/constants';
import { addDays, formatDate, fromIso, parseDate, toIso, today } from '@/lib/supplier/dates';
import { qtyOf, wishRange } from '@/lib/supplier/orders';
import { useSupplier } from '@/lib/supplier/store';
import type { Order } from '@/lib/supplier/types';
import { LEAVE_MSG } from '@/lib/ui/leaveGuard';
import { Badge, Field, Icon, Modal, NG_BTN, Notice } from './ui';
import { DateInput } from '@/components/DateInput';
import { fmtDate } from '@/lib/format/date';

/** はい／いいえの確認 */
/** 入力中に画面を離れるときの確認（Q02・文言は全サイト共通 LEAVE_MSG。サイドメニュー・キャンセル・修正をやめる） */
export function DiscardModal({ onOk }: { onOk: () => void }) {
  return <ConfirmModal title={LEAVE_MSG.title} cancel={LEAVE_MSG.cancel} ok={LEAVE_MSG.ok} danger onOk={onOk}><p style={{ margin: 0 }}>{LEAVE_MSG.text}</p></ConfirmModal>;
}

export function ConfirmModal({ title, children, cancel, ok, danger, onOk }: { title: string; children: React.ReactNode; cancel: string; ok: string; danger?: boolean; onOk: () => void | Promise<void> }) {
  const { closeModal } = useSupplier();
  const [busy, setBusy] = useState(false);
  return (
    <Modal
      title={title}
      width={540}
      footer={
        <>
          <button className="btn lg" onClick={closeModal}>{cancel}</button>
          <button className={`btn lg ${danger ? '' : 'pri'}`} style={danger ? NG_BTN : undefined} disabled={busy} onClick={async () => { setBusy(true); try { await onOk(); } finally { setBusy(false); } closeModal(); }}>{ok}</button>
        </>
      }
    >
      {children}
    </Modal>
  );
}

/** CSV ダウンロード（期間・商品） */
export function CsvModal() {
  const { orders, closeModal, toast, supplierId } = useSupplier();
  /* 初期値は今月 */
  const t = parseDate(today());
  const [from, setFrom] = useState(formatDate(new Date(t.getFullYear(), t.getMonth(), 1, 12)));
  const [to, setTo] = useState(formatDate(new Date(t.getFullYear(), t.getMonth() + 1, 0, 12)));
  const [pid, setPid] = useState('');
  const prods = [...new Map(orders.map((o) => [o.pid, o.name])).entries()];
  return (
    <Modal
      title="CSVダウンロード"
      width={560}
      footer={
        <>
          <button className="btn lg" onClick={closeModal}>キャンセル</button>
          <button
            className="btn pri lg"
            onClick={async () => {
              if (!from || !to || from > to) return toast('期間を正しく入力してください');
              /* 共通の仕組み（UTF-8 BOM・CRLF・ファイル名 <画面名>_<条件>_<日時>.csv・出力の記録）。列は今までの発注明細と同じ */
              const rows = ordersCsvRows(orders, from, to, pid);
              const { count } = await runCsvExport<string[]>({
                screen: '発注明細', site: 'supplier', by: supplierId ?? '', rows,
                filters: [{ label: '入荷希望日', value: `${from}〜${to}` }, { label: '品番', value: pid }],
                columns: ORDERS_CSV_HEAD.map((h, i) => ({ label: h, get: (r: string[]) => r[i] })),
              });
              toast(`CSVを出力しました（${count}行）`);
            }}
          >
            <Icon name="down" />ダウンロード
          </button>
        </>
      }
    >
      <div className="fg">
        <Field label="期間（開始）" req hint="入荷希望日で絞り込みます">
          <DateInput className="inp" value={toIso(from)} onChange={(e) => setFrom(fromIso(e.target.value))} />
        </Field>
        <Field label="期間（終了）" req>
          <DateInput className="inp" value={toIso(to)} onChange={(e) => setTo(fromIso(e.target.value))} />
        </Field>
        <Field label="商品" full>
          <select className="sel" value={pid} onChange={(e) => setPid(e.target.value)}>
            <option value="">すべての商品</option>
            {prods.map(([k, n]) => <option key={k} value={k}>{k} {n}</option>)}
          </select>
        </Field>
      </div>
    </Modal>
  );
}

const OrderTags = ({ o }: { o: Order }) => (
  <>
    {o.re && <> <Badge v="数量変更" cls="b-warn" /></>}
    {o.add && <> <Badge v="追加発注" cls="b-info" /></>}
  </>
);

/** 納期回答の一括承認（全量を1回で出荷する前提） */
export function BulkAnswerModal({ list }: { list: Order[] }) {
  const { closeModal, toast, toastError, mergeOrders, setSelected } = useSupplier();
  const eta0 = list.map((o) => o.rows[0].wish).sort()[0];
  const def = addDays(eta0, -2) < today() ? today() : addDays(eta0, -2);
  const [busy, setBusy] = useState(false);
  const [common, setCommon] = useState(def);
  const [dates, setDates] = useState<Record<string, string>>(() => Object.fromEntries(list.map((o) => [o.no, def])));
  const [err, setErr] = useState('');

  const ok = async () => {
    if (Object.values(dates).some((d) => !d || d < today())) return setErr('すべての出荷予定日に、今日以降の日付を入力してください');
    setBusy(true);
    try {
      mergeOrders(await api.answerOrders(list.map((o) => ({ no: o.no, parts: [{ eta: dates[o.no], qty: qtyOf(o) }] }))));
    } catch (e) {
      setBusy(false);
      return toastError(e);
    }
    setSelected((s) => { list.forEach((o) => s.delete(o.no)); return s; });
    closeModal();
    toast(`${list.length}件を承認しました（納期回答）`);
  };

  return (
    <Modal
      title={`納期回答を一括承認（${list.length}件）`}
      width={860}
      footer={<><button className="btn lg" onClick={closeModal}>キャンセル</button><button className="btn pri lg" disabled={busy} onClick={ok}>{list.length}件を承認する</button></>}
    >
      <Notice kind="pur" style={{ marginBottom: '0.857143rem' }}>全量を1回で出荷する前提で、まとめて承認します。<b>分納する発注は、個別に回答してください。</b></Notice>
      <div className="fg" style={{ marginBottom: '0.857143rem' }}>
        <Field label="出荷予定日（全件に反映）">
          <DateInput className="inp" min={toIso(today())} value={toIso(common)} onChange={(e) => setCommon(fromIso(e.target.value))} />
        </Field>
        <div style={{ alignSelf: 'end' }}>
          <button className="btn out" onClick={() => setDates(Object.fromEntries(list.map((o) => [o.no, common])))}>全件に反映する</button>
        </div>
      </div>
      <div className="tbl-wrap">
        <table className="tbl">
          <thead><tr><th>発注番号</th><th>商品名</th><th>納入倉庫</th><th>期間</th><th className="num">数量</th><th>出荷予定日</th></tr></thead>
          <tbody>
            {list.map((o) => (
              <tr key={o.no}>
                <td className="mono">{o.no}</td>
                <td>{o.name}<OrderTags o={o} /></td>
                <td>{o.wh}</td>
                <td>{wishRange(o)}</td>
                <td className="num">{qtyOf(o).toLocaleString()}{o.unit}</td>
                <td><DateInput className="inp" min={toIso(today())} value={toIso(dates[o.no])} onChange={(e) => setDates({ ...dates, [o.no]: fromIso(e.target.value) })} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="errmsg">{err}</div>
    </Modal>
  );
}

/** 本発注の一括承認（分納している発注は除く）。賞味期限は必須（資材は持たない：台帳 E 2026-10-05） */
export function BulkHonModal({ list }: { list: Order[] }) {
  const { closeModal, toast, toastError, mergeOrders, setSelected, setTab } = useSupplier();
  const [busy, setBusy] = useState(false);
  const ok = list.filter((o) => (o.parts ?? []).length <= 1);
  const ng = list.filter((o) => !ok.includes(o));
  const [v, setV] = useState<Record<string, { dlv: string; box: string; bb: string }>>(() =>
    Object.fromEntries(ok.map((o) => { const x = o.parts[0]; return [o.no, { dlv: x?.dlv ?? '', box: x?.box ? String(x.box) : '', bb: x?.bb ?? '' }]; })),
  );
  const [err, setErr] = useState('');

  const submit = async () => {
    if (ok.some((o) => { const d = v[o.no].dlv; const x = o.parts[0]; return !d || d < today() || (x && d < x.eta); }))
      return setErr('すべての納品日を入力してください（今日以降で、出荷予定日と同じかそれ以降）');
    if (ok.some((o) => !/^[1-9]\d*$/.test(v[o.no].box))) return setErr('すべての入荷箱数に、1以上の整数を入力してください');
    if (ok.some((o) => o.type !== '資材' && !v[o.no].bb)) return setErr('賞味期限（消費期限）を入力してください（資材以外）');
    if (ok.some((o) => { const b = v[o.no].bb, x = o.parts[0]; return !!b && !!x && b <= x.eta; })) return setErr('賞味期限（消費期限）は出荷予定日より後の日付にしてください');
    setBusy(true);
    try {
      mergeOrders(await api.approveHon(ok.map((o) => ({ no: o.no, parts: [{ eta: o.parts[0]?.eta || v[o.no].dlv, dlv: v[o.no].dlv, qty: o.hon, box: +v[o.no].box, ...(o.type !== '資材' && v[o.no].bb ? { bb: v[o.no].bb } : {}) }] }))));
    } catch (e) {
      setBusy(false);
      return toastError(e);
    }
    setSelected((s) => { ok.forEach((o) => s.delete(o.no)); return s; });
    closeModal();
    setTab('出荷待ち');
    toast(`${ok.length}件の本発注を承認しました。「出荷待ち」タブに移動しました`);
  };

  return (
    <Modal
      title={`本発注を一括承認（${ok.length}件）`}
      width={980}
      footer={<><button className="btn lg" onClick={closeModal}>キャンセル</button><button className="btn pri lg" disabled={!ok.length || busy} onClick={submit}>{ok.length}件の本発注を承認する</button></>}
    >
      {ng.length > 0 && (
        <Notice kind="warn" style={{ marginBottom: '0.857143rem' }}>
          分納している発注（{ng.map((o) => o.no).join('、')}）は一括承認できません。個別に、回ごとの納品日・数量・箱数を入力して承認してください。
        </Notice>
      )}
      <div className="tbl-wrap">
        <table className="tbl">
          <thead>
            <tr><th>発注番号</th><th>商品名</th><th>納入倉庫</th><th className="num">仮発注数</th><th className="num">本発注数</th><th>出荷予定日</th><th>納品日 <span className="req">必須</span></th><th>入荷箱数 <span className="req">必須</span></th><th>賞味期限（消費期限） <span className="req">必須</span></th></tr>
          </thead>
          <tbody>
            {ok.map((o) => {
              const x = o.parts[0];
              const diff = o.hon !== o.kari;
              return (
                <tr key={o.no}>
                  <td className="mono">{o.no}</td>
                  <td>{o.name}</td>
                  <td>{o.wh}</td>
                  <td className="num">{o.kari.toLocaleString()}{o.unit}</td>
                  <td className="num">
                    <b style={diff ? { color: 'var(--ng)' } : undefined}>{o.hon.toLocaleString()}{o.unit}</b>
                    {diff && <> <Badge v={`${o.hon > o.kari ? '+' : ''}${o.hon - o.kari}`} cls="b-warn" /></>}
                  </td>
                  <td>{fmtDate(x?.eta) || '—'}</td>
                  <td><DateInput className="inp" min={toIso(today())} value={toIso(v[o.no].dlv)} onChange={(e) => setV({ ...v, [o.no]: { ...v[o.no], dlv: fromIso(e.target.value) } })} /></td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.428571rem' }}>
                      <input className="inp" type="number" min={1} step={1} placeholder="例）20" style={{ maxWidth: '7.142857rem' }} value={v[o.no].box} onChange={(e) => setV({ ...v, [o.no]: { ...v[o.no], box: e.target.value } })} />
                      <span className="muted">箱</span>
                    </div>
                  </td>
                  <td>{o.type === '資材' ? <span className="muted">—</span> : <DateInput className="inp" value={toIso(v[o.no].bb)} onChange={(e) => setV({ ...v, [o.no]: { ...v[o.no], bb: fromIso(e.target.value) } })} />}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="hint" style={{ marginTop: '0.571429rem' }}>納品日と入荷箱数は、発注ごとに入力します。賞味期限（消費期限）も入力してください（資材は不要・出荷報告の初期値になります）。数量が変わった発注は、本発注数に合わせて承認します。</div>
      <div className="errmsg">{err}</div>
    </Modal>
  );
}

/** 本発注を却下する（受注不可にする） */
export function HonRejectModal({ o }: { o: Order }) {
  const { closeModal, toast, toastError, mergeOrders, setTab } = useSupplier();
  const [busy, setBusy] = useState(false);
  const [reason, setReason] = useState('');
  const [comment, setComment] = useState('');
  const [err, setErr] = useState('');
  const submit = async () => {
    if (!reason || !comment.trim()) return setErr('理由とコメントを入力してください');
    setBusy(true);
    try {
      mergeOrders([await api.rejectOrder(o.no, reason, comment.trim())]);
    } catch (e) {
      setBusy(false);
      return toastError(e);
    }
    closeModal();
    setTab('受注不可');
    toast('本発注を却下しました（運営に通知）');
  };
  return (
    <Modal
      title="本発注を却下する"
      width={560}
      footer={<><button className="btn lg" onClick={closeModal}>キャンセル</button><button className="btn lg" style={NG_BTN} disabled={busy} onClick={submit}>却下する</button></>}
    >
      <div className="stack">
        <Field label="却下の理由" req>
          <select className="sel" value={reason} onChange={(e) => setReason(e.target.value)}>
            <option value="">選択してください</option>
            {REASONS.map((x) => <option key={x}>{x}</option>)}
          </select>
        </Field>
        <Field label="コメント" req>
          <textarea className="inp" value={comment} onChange={(e) => setComment(e.target.value)} />
        </Field>
        <Notice kind="ng">運営に通知され、この発注は「受注不可」になります。<b>取り消しはできません。</b></Notice>
        <div className="errmsg">{err}</div>
      </div>
    </Modal>
  );
}
