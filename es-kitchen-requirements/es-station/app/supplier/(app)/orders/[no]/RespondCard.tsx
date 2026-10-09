'use client';

import { useState } from 'react';
import { api } from '@/lib/api/supplier';
import { REASONS, SPLIT_MAX } from '@/lib/supplier/constants';
import { fromIso, toIso, today } from '@/lib/supplier/dates';
import { canShip, needHon, qtyOf, tabOf, validateResp, type Errors, type RespDraft } from '@/lib/supplier/orders';
import { useSupplier } from '@/lib/supplier/store';
import type { Order } from '@/lib/supplier/types';
import { useLeaveGuard } from '@/lib/ui/leaveGuard';
import { ConfirmModal, DiscardModal } from '../../../_components/modals';
import { Field, Icon, NG_BTN, Notice } from '../../../_components/ui';
import { DateInput } from '@/components/DateInput';
import { fmtDate } from '@/lib/format/date';

/** 仮発注への回答（承認＝出荷予定日／受注できない）。reedit＝回答済みの修正（状態は保存まで変えない・RV-SUP S-b） */
export default function RespondCard({ o, reedit, onDone }: { o: Order; reedit: boolean; onDone: () => void }) {
  const { mergeOrders, setTab, toast, toastError, openModal } = useSupplier();
  const [busy, setBusy] = useState(false);
  const total = qtyOf(o);
  const [r, setR] = useState<RespDraft>(() => {
    const ps = o.parts?.length ? o.parts.map((x) => ({ eta: x.eta, qty: x.qty as number | '' })) : [{ eta: '', qty: total as number | '' }];
    return { mode: 'approve', split: ps.length > 1, parts: ps, reason: '', comment: o.comment || '' };
  });
  const [e, setE] = useState<Errors>({});
  /* 入力中に画面を離れるときの確認（Q02・全サイト共通）：開いたときの値から変えて保存していないとき（修正をやめる・サイドメニュー・ブラウザを閉じる） */
  const [r0] = useState(() => JSON.stringify(r));
  const dirty = JSON.stringify(r) !== r0;
  useLeaveGuard(dirty);
  const sum = r.parts.reduce((a, x) => a + (+x.qty || 0), 0);
  const setPart = (i: number, p: Partial<RespDraft['parts'][number]>) => setR({ ...r, parts: r.parts.map((x, j) => (j === i ? { ...x, ...p } : x)) });

  const toggleSplit = () => {
    let parts = r.parts;
    if (r.split) parts = [{ eta: parts[0].eta, qty: total }];
    else if (parts.length < 2) {
      const a = Math.ceil(total / 2 / 6) * 6;
      parts = [{ eta: parts[0].eta, qty: a }, { eta: '', qty: total - a }];
    }
    setR({ ...r, split: !r.split, parts });
    setE({});
  };

  const save = async () => {
    const er = validateResp(o, r);
    setE(er);
    if (Object.keys(er).length) return;
    if (r.mode === 'reject') {
      openModal(
        <ConfirmModal title="「受注できない」と回答しますか？" cancel="戻る" ok="受注できないと回答する" danger onOk={async () => {
          try {
            mergeOrders([await api.rejectOrder(o.no, r.reason, r.comment.trim())]);
          } catch (ex) {
            return toastError(ex);
          }
          setTab('受注不可');
          onDone();
          toast('「受注できない」と回答しました（運営に通知）');
        }}>
          <Notice kind="ng">発注番号 <b className="mono">{o.no}</b>（{o.name}）を「受注不可」にして、運営に通知します。<b>取り消しはできません。</b></Notice>
        </ConfirmModal>,
      );
      return;
    }
    let next: Order;
    setBusy(true);
    try {
      [next] = await api.answerOrders([{ no: o.no, parts: r.parts.map((p) => ({ eta: p.eta, qty: +p.qty })), comment: r.comment }]);
    } catch (ex) {
      setBusy(false);
      return toastError(ex);
    }
    mergeOrders([next]);
    const tab = tabOf(next);
    setTab(tab);
    onDone();
    if (reedit) return toast('回答を修正しました');
    toast(
      next.parts.length > 1 ? `分納依頼を登録し、承認しました（${next.parts.length}回）`
      : !needHon(next) && !canShip(next) ? '承認しました。運営の本発注をお待ちください（「出荷待ち」タブに「本発注待ち」と表示されます）'
      : `承認しました。「${tab}」タブに移動しました`,
    );
  };

  const cancelBtn = reedit && <button className="btn lg" style={{ marginRight: '0.857143rem' }} onClick={() => (dirty ? openModal(<DiscardModal onOk={onDone} />) : onDone())}>修正をやめる</button>;

  return (
    <div className="card">
      <h2>{reedit ? '回答の修正' : '発注への回答'}</h2>
      {reedit && <Notice kind="pur" style={{ marginBottom: '0.857143rem' }}>回答を修正しています。「修正を保存する」を押すまで、回答の内容と状態は変わりません。</Notice>}
      {o.re && (
        <Notice kind="warn" style={{ marginBottom: '0.857143rem' }}>数量が変更されました（<b>{o.re.prev}{o.unit} → {o.kari}{o.unit}</b>）。変更後の数量で、あらためて回答してください。</Notice>
      )}
      <div className="seg">
        <label className={r.mode === 'approve' ? 'on' : ''}>
          <input type="radio" name="rmode" checked={r.mode === 'approve'} onChange={() => { setR({ ...r, mode: 'approve' }); setE({}); }} />承認する（出荷予定日を回答）
        </label>
        <label className={r.mode === 'reject' ? 'on rj' : ''}>
          <input type="radio" name="rmode" checked={r.mode === 'reject'} onChange={() => { setR({ ...r, mode: 'reject' }); setE({}); }} />受注できない
        </label>
      </div>

      {r.mode === 'approve' ? (
        <>
          <div className="fg" style={{ margin: '1.142857rem 0 0.571429rem' }}>
            <Field label="希望納期（入荷希望日）"><input className="inp" readOnly value={fmtDate(o.rows[0].wish) + (o.rows.length > 1 ? ' 〜 ' + fmtDate(o.rows[o.rows.length - 1].wish) : '')} /></Field>
            <Field label="発注数量"><input className="inp" readOnly value={total.toLocaleString() + o.unit} /></Field>
          </div>
          <div style={{ margin: '0.571429rem 0', display: 'flex', gap: '0.714286rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <button className="btn out" onClick={toggleSplit}>{r.split ? '分納依頼を取り消す（全量を1回で納品）' : '分納依頼（出荷予定日を回ごとに登録）'}</button>
            {r.split && <span className="muted">回ごとに出荷予定日・数量を登録します（{SPLIT_MAX}回まで・どの回も最初の入荷希望日までに届くように）。箱数は本発注の承認時に入力します。</span>}
          </div>
          <div className="tbl-wrap">
            <table className="tbl">
              <thead><tr><th style={{ width: '5rem' }}>回</th><th>出荷予定日 <span className="req">必須</span></th><th>数量 <span className="req">必須</span></th><th style={{ width: '4.285714rem' }} /></tr></thead>
              <tbody>
                {r.parts.map((x, i) => (
                  <tr key={i}>
                    <td>{r.split ? `${i + 1}回目` : '全量'}</td>
                    <td>
                      <DateInput className={`inp ${e['e' + i] ? 'err' : ''}`} min={toIso(today())} value={toIso(x.eta)} onChange={(ev) => setPart(i, { eta: fromIso(ev.target.value) })} />
                      {e['e' + i] && <div className="errmsg">{e['e' + i]}</div>}
                    </td>
                    <td>
                      <input className={`inp ${e['q' + i] ? 'err' : ''}`} type="number" min={1} value={x.qty} disabled={!r.split} style={{ maxWidth: '11.428571rem' }} onChange={(ev) => setPart(i, { qty: ev.target.value === '' ? '' : +ev.target.value })} />
                      {e['q' + i] && <div className="errmsg">{e['q' + i]}</div>}
                    </td>
                    <td>
                      {r.split && r.parts.length > 1 && (
                        <button className="icon-btn" aria-label="削除" onClick={() => setR({ ...r, parts: r.parts.filter((_, j) => j !== i) })}><Icon name="x" /></button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.857143rem', marginTop: '0.571429rem', flexWrap: 'wrap' }}>
            {r.split && r.parts.length < SPLIT_MAX ? (
              <button className="btn sm out" onClick={() => setR({ ...r, parts: [...r.parts, { eta: '', qty: Math.max(total - sum, 0) }] })}>+ 分納を追加</button>
            ) : r.split ? <span className="muted">分納は{SPLIT_MAX}回までです</span> : null}
            <span style={{ flex: 1 }} />
            <span className={sum === total ? 'okc' : 'ngc'}>
              回答数量の合計 {sum.toLocaleString()} / {total.toLocaleString()}{o.unit}{sum === total ? '' : `（差 ${(total - sum).toLocaleString()}）`}
            </span>
          </div>
          {e.sum && <div className="errmsg">{e.sum}</div>}
          <Field label="備考・コメント" opt>
            <textarea className="inp" placeholder="例）2回に分けて納品します" value={r.comment} onChange={(ev) => setR({ ...r, comment: ev.target.value })} />
          </Field>
          <div style={{ marginTop: '1.142857rem', textAlign: 'right' }}>
            {cancelBtn}
            <button className="btn pri lg" disabled={busy} onClick={save}>{reedit ? '修正を保存する' : '承認して回答する'}</button>
          </div>
        </>
      ) : (
        <>
          <div className="fg" style={{ marginTop: '1.142857rem' }}>
            <Field label="却下の理由" req err={e.reason}>
              <select className={`sel ${e.reason ? 'err' : ''}`} value={r.reason} onChange={(ev) => setR({ ...r, reason: ev.target.value })}>
                <option value="">選択してください</option>
                {REASONS.map((x) => <option key={x}>{x}</option>)}
              </select>
            </Field>
            <div className="full">
              <Field label="コメント" req err={e.comment}>
                <textarea className={`inp ${e.comment ? 'err' : ''}`} placeholder="運営が代替の手配をするため、できるだけ具体的に記入してください" value={r.comment} onChange={(ev) => setR({ ...r, comment: ev.target.value })} />
              </Field>
            </div>
          </div>
          <Notice kind="warn" style={{ marginTop: '0.857143rem' }}>「受注できない」と回答すると、運営に通知され、この発注は「受注不可」になります。取り消しはできません。</Notice>
          <div style={{ marginTop: '1.142857rem', textAlign: 'right' }}>
            {cancelBtn}
            <button className="btn lg" style={NG_BTN} onClick={save}>受注できないと回答する</button>
          </div>
        </>
      )}
    </div>
  );
}
