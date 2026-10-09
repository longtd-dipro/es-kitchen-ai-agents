'use client';

import { useState } from 'react';
import { api } from '@/lib/api/supplier';
import { SPLIT_MAX } from '@/lib/supplier/constants';
import { addDays, fromIso, toIso, today } from '@/lib/supplier/dates';
import { alertCount, needHon, validateHon, type Errors, type HonDraft } from '@/lib/supplier/orders';
import { useSignedIn } from '@/lib/supplier/store';
import type { Order } from '@/lib/supplier/types';
import { useLeaveGuard } from '@/lib/ui/leaveGuard';
import { BulkHonModal, HonRejectModal } from '../../../_components/modals';
import { Badge, Icon, KV, NG_BTN, Notice } from '../../../_components/ui';
import { DateInput } from '@/components/DateInput';
import { fmtDate, fmtDateTime } from '@/lib/format/date';

/** 本発注の承認（出荷予定日・納品日・入荷箱数・賞味期限（必須・資材は持たない：台帳 E 2026-10-05）。分納にもできる・却下は理由必須） */
export default function HonCard({ o }: { o: Order }) {
  const { orders: mine, me, mergeOrders, setTab, toast, toastError, openModal } = useSignedIn();
  const [busy, setBusy] = useState(false);
  const [h, setH] = useState<HonDraft>(() => {
    const ps = (o.parts ?? []).map((x) => ({ eta: x.eta, dlv: x.dlv || addDays(x.eta, 1), qty: x.qty as number | '', box: x.box ?? '', bb: x.bb ?? '' }));
    if (ps.length === 1) ps[0].qty = o.hon;
    return { split: ps.length > 1, parts: ps, warned: {} };
  });
  const [e, setE] = useState<Errors>({});
  /* 入力中に画面を離れるときの確認（Q02・全サイト共通）：開いたときの値から変えて保存していないとき（サイドメニュー・ブラウザを閉じる） */
  const [h0] = useState(() => JSON.stringify(h));
  useLeaveGuard(JSON.stringify(h) !== h0);
  const sum = h.parts.reduce((a, x) => a + (+x.qty || 0), 0);
  const boxSum = h.parts.reduce((a, x) => a + (+x.box || 0), 0);
  const siblings = mine.filter((x) => x.no !== o.no && needHon(x) && x.pid === o.pid && x.ym === o.ym);
  const diff = o.hon !== o.kari;
  const alerts = alertCount(o, me);
  /* 資材は期限を持たない。短消費期限の商品は「消費期限」 */
  const bbL = o.type === '資材' ? '' : o.type === '短消費期限' ? '消費期限' : '賞味期限';
  const setPart = (i: number, p: Partial<HonDraft['parts'][number]>) => setH({ ...h, parts: h.parts.map((x, j) => (j === i ? { ...x, ...p } : x)) });

  const toggleSplit = () => {
    const f = h.parts[0];
    let parts = h.parts;
    if (h.split) parts = [{ eta: f.eta, dlv: f.dlv, qty: o.hon, box: f.box, bb: f.bb }];
    else if (parts.length < 2) {
      const a = Math.ceil(o.hon / 2 / 6) * 6;
      parts = [{ eta: f.eta, dlv: f.dlv, qty: a, box: '', bb: f.bb }, { eta: '', dlv: '', qty: o.hon - a, box: '', bb: '' }];
    }
    setH({ ...h, split: !h.split, parts });
    setE({});
  };

  const approve = async () => {
    const { errors, warned } = validateHon(o, h);
    setH({ ...h, warned });
    setE(errors);
    if (Object.keys(errors).length) return;
    setBusy(true);
    try {
      mergeOrders(await api.approveHon([{ no: o.no, parts: h.parts.map((x) => ({ eta: x.eta, dlv: x.dlv, qty: +x.qty, box: +x.box, ...(bbL && x.bb ? { bb: x.bb } : {}) })) }]));
    } catch (ex) {
      setBusy(false);
      return toastError(ex);
    }
    setTab('出荷待ち');
    toast(h.parts.length > 1 ? `分納依頼を登録し、本発注を承認しました（${h.parts.length}回）` : '本発注を承認しました。出荷報告ができます');
  };

  const err = (k: string) => e[k] && <div className="errmsg">{e[k]}</div>;

  return (
    <div className="card">
      <h2>本発注の承認</h2>
      <Notice kind="warn" style={{ marginBottom: '0.857143rem' }}>
        運営が本発注（数量確定）を行いました（{fmtDateTime(o.honAt) || '—'}）。<b>納品日</b>と<b>入荷箱数</b>を入力して、承認してください（承認は必須です）。承認すると出荷報告ができます。
      </Notice>
      {alerts > 0 && (
        <Notice kind="ng" style={{ marginBottom: '0.857143rem' }}>
          本発注（{fmtDateTime(o.honAt)}）から営業日24時間ごとに確認し、未処理のため、<b>アラートメールを{alerts}回送信</b>しました。処理が完了するまで繰り返します。
        </Notice>
      )}
      <div className="kvgrid">
        <KV l="仮発注数">{o.kari.toLocaleString() + o.unit}</KV>
        <KV l="本発注数">
          <b style={diff ? { color: 'var(--ng)' } : undefined}>{o.hon.toLocaleString()}{o.unit}</b>
          {diff && <> <Badge v={`${o.hon > o.kari ? '+' : ''}${o.hon - o.kari}${o.unit}`} cls="b-warn" /></>}
        </KV>
        <KV l="仮発注時に回答した出荷予定日">{(o.parts ?? []).map((x) => `${fmtDate(x.eta)}（${x.qty}${o.unit}）`).join('、')}</KV>
      </div>
      {diff && <Notice kind="warn" style={{ marginTop: '0.857143rem' }}>本発注の数量が仮発注から変わっています。下の表の数量を、本発注数に合わせて確認してください。</Notice>}
      {siblings.length > 0 && (
        <Notice kind="pur" style={{ marginTop: '0.857143rem' }}>
          同じ商品・同じ月の本発注が、ほかに <b>{siblings.length}件</b> 承認待ちです（{siblings.map((x) => x.no).join('、')}）。まとめて承認すると承認の回数が減ります。
        </Notice>
      )}

      <h3 style={{ fontSize: '1rem', margin: '1.285714rem 0 0.285714rem' }}>納品日・入荷箱数 <span className="req">必須</span>{bbL && <span style={{ fontWeight: 400 }}>　{bbL} <span className="req">必須</span></span>}</h3>
      <div className="hint" style={{ marginBottom: '0.571429rem' }}>納品日は、倉庫に届く日です。本発注の時点で、分納に変更することもできます（回ごとに納品日・数量・箱数を入力）。{bbL && `${bbL}も入力してください（出荷報告の初期値になります）。`}</div>
      <div style={{ margin: '0.571429rem 0', display: 'flex', gap: '0.714286rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <button className="btn out" onClick={toggleSplit}>{h.split ? '分納依頼を取り消す（全量を1回で納品）' : '分納依頼（出荷予定日・納品日・箱数を回ごとに登録）'}</button>
        {h.split && <span className="muted">{SPLIT_MAX}回まで・どの回も納品日は最初の入荷希望日まで。</span>}
      </div>
      <div className="tbl-wrap">
        <table className="tbl">
          <thead>
            <tr><th style={{ width: '5rem' }}>{h.split ? '回' : ''}</th><th>出荷予定日 <span className="req">必須</span></th><th>納品日 <span className="req">必須</span></th><th>数量 <span className="req">必須</span></th><th>入荷箱数 <span className="req">必須</span></th>{bbL && <th>{bbL} <span className="req">必須</span></th>}<th style={{ width: '4.285714rem' }} /></tr>
          </thead>
          <tbody>
            {h.parts.map((x, i) => (
              <tr key={i}>
                <td>{h.split ? `${i + 1}回目` : '全量'}</td>
                <td><DateInput className={`inp ${e['he' + i] ? 'err' : ''}`} min={toIso(today())} value={toIso(x.eta)} onChange={(ev) => setPart(i, { eta: fromIso(ev.target.value) })} />{err('he' + i)}</td>
                <td><DateInput className={`inp ${e['hd' + i] ? 'err' : ''}`} min={toIso(today())} value={toIso(x.dlv)} onChange={(ev) => setPart(i, { dlv: fromIso(ev.target.value) })} />{err('hd' + i)}</td>
                <td><input className={`inp ${e['hq' + i] ? 'err' : ''}`} type="number" min={1} value={x.qty} disabled={!h.split} style={{ maxWidth: '9.285714rem' }} onChange={(ev) => setPart(i, { qty: ev.target.value === '' ? '' : +ev.target.value })} />{err('hq' + i)}</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.428571rem' }}>
                    <input className={`inp ${e['hb' + i] ? 'err' : ''}`} type="number" min={1} step={1} inputMode="numeric" placeholder="例）20" value={x.box} style={{ maxWidth: '7.857143rem' }} onChange={(ev) => setPart(i, { box: ev.target.value })} />
                    <span className="muted">箱</span>
                  </div>
                  {err('hb' + i)}
                </td>
                {bbL && <td><DateInput className={`inp ${e['hbb' + i] ? 'err' : ''}`} value={toIso(x.bb ?? '')} onChange={(ev) => setPart(i, { bb: fromIso(ev.target.value) })} />{err('hbb' + i)}</td>}
                <td>
                  {h.split && h.parts.length > 1 && (
                    <button className="icon-btn" aria-label="削除" onClick={() => setH({ ...h, parts: h.parts.filter((_, j) => j !== i) })}><Icon name="x" /></button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.857143rem', marginTop: '0.571429rem', flexWrap: 'wrap' }}>
        {h.split && h.parts.length < SPLIT_MAX ? (
          <button className="btn sm out" onClick={() => setH({ ...h, parts: [...h.parts, { eta: '', dlv: '', qty: Math.max(o.hon - sum, 0), box: '', bb: '' }] })}>+ 分納を追加</button>
        ) : h.split ? <span className="muted">分納は{SPLIT_MAX}回までです</span> : null}
        <span style={{ flex: 1 }} />
        <span className={sum === o.hon ? 'okc' : 'ngc'}>
          数量の合計 {sum.toLocaleString()} / {o.hon.toLocaleString()}{o.unit}{sum === o.hon ? '' : `（差 ${(o.hon - sum).toLocaleString()}）`}　入荷箱数の合計 {boxSum.toLocaleString()}箱
        </span>
      </div>
      {e.hsum && <div className="errmsg">{e.hsum}</div>}
      <div style={{ marginTop: '1.142857rem', display: 'flex', gap: '0.857143rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
        <button className="btn lg" style={NG_BTN} onClick={() => openModal(<HonRejectModal o={o} />)}>却下する</button>
        {siblings.length > 0 && (
          <button className="btn out lg" onClick={() => openModal(<BulkHonModal list={[o, ...siblings].sort((a, b) => mine.indexOf(a) - mine.indexOf(b))} />)}>
            同じ商品・月の{siblings.length + 1}件をまとめて承認
          </button>
        )}
        <button className="btn pri lg" disabled={busy} onClick={approve}>この発注の本発注を承認する</button>
      </div>
    </div>
  );
}
