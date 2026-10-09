'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { api, type ShipmentInput } from '@/lib/api/supplier';
import { CARRIERS, METHODS } from '@/lib/supplier/constants';
import { fromIso, toIso } from '@/lib/supplier/dates';
import { canShip, nShipped, shipDefaults, validateShip, type Errors, type ShipDraft } from '@/lib/supplier/orders';
import { R } from '@/lib/supplier/routes';
import { useSignedIn } from '@/lib/supplier/store';
import type { Order } from '@/lib/supplier/types';
import { ConfirmModal } from '../../_components/modals';
import { Badge, Icon, Notice } from '../../_components/ui';
import { DateInput } from '@/components/DateInput';
import { fmtDate } from '@/lib/format/date';

/*
 * 出荷待ちの一覧（REQ-PO-621・2026/10/02）：賞味期限などの入力列を一覧で入れて「入力を一括保存」、
 * チェックした回を「出荷済みにする」でまとめて出荷報告する（1件でも入力に誤りがあれば報告しない）。
 * 1行＝出荷の1回（分納は回ごと）。本発注を承認していない発注は入力できない（本発注待ち）。
 * 初期値＝保存した値 → 前回の配送方法・運送会社 → 納品条件（REQ-PO-619）。運送会社・送り状番号は任意（REQ-PO-135）
 */
type Line = { key: string; o: Order; idx: number };
const keyOf = (no: string, idx: number) => `${no}#${idx}`;

export default function ShipList({ rows }: { rows: Order[] }) {
  const { me, setMe, mergeOrders, toast, toastError, openModal } = useSignedIn();
  const router = useRouter();
  const [draft, setDraft] = useState<Record<string, ShipDraft>>({});
  const [errs, setErrs] = useState<Record<string, Errors>>({});
  const [sel, setSel] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);

  const lines: Line[] = rows.flatMap((o) => (canShip(o) ? o.parts.flatMap((p, idx) => (p.st === '未出荷' ? [{ key: keyOf(o.no, idx), o, idx }] : [])) : []));
  const waiting = rows.filter((o) => !canShip(o));
  const valOf = (l: Line) => draft[l.key] ?? shipDefaults(l.o.parts[l.idx], me);
  const dirty = Object.keys(draft).filter((k) => lines.some((l) => l.key === k));
  const selN = lines.filter((l) => sel.has(l.key)).length;
  const setV = (l: Line, p: Partial<ShipDraft>) => {
    setDraft((d) => ({ ...d, [l.key]: { ...valOf(l), ...p } }));
    setErrs((e) => { const n = { ...e }; delete n[l.key]; return n; });
  };
  const input = (l: Line): ShipmentInput => { const v = valOf(l); return { no: l.o.no, partIndex: l.idx, ...v, bb: l.o.type === '資材' ? undefined : v.bb }; };
  const toggle = (k: string, on: boolean) => setSel((s) => { const n = new Set(s); if (on) n.add(k); else n.delete(k); return n; });
  const forget = (keys: string[]) => setDraft((d) => { const n = { ...d }; keys.forEach((k) => delete n[k]); return n; });

  /** 入力を一括保存（出荷済みにはしない）。入れた欄だけ形式を確かめる */
  const saveAll = async () => {
    const targets = lines.filter((l) => dirty.includes(l.key));
    const bad: Record<string, Errors> = {};
    for (const l of targets) {
      const v = valOf(l), e = validateShip(l.o, v), only: Errors = {};
      if (e.slip && v.slip) only.slip = e.slip;
      if (e.bb && v.bb) only.bb = e.bb;
      if (Object.keys(only).length) bad[l.key] = only;
    }
    setErrs(bad);
    if (Object.keys(bad).length) return toast(`入力に誤りがあります（${Object.keys(bad).length}件）。赤い欄を直してください`);
    setBusy(true);
    try {
      mergeOrders(await api.saveShipDrafts(targets.map(input)));
      forget(targets.map((l) => l.key));
      toast(`${targets.length}件の入力を保存しました（出荷済みにはしていません）`);
    } catch (ex) { toastError(ex); }
    setBusy(false);
  };

  /** チェックした回を出荷済みにする */
  const shipSelected = () => {
    const targets = lines.filter((l) => sel.has(l.key));
    const bad: Record<string, Errors> = {};
    for (const l of targets) { const e = validateShip(l.o, valOf(l)); if (Object.keys(e).length) bad[l.key] = e; }
    setErrs(bad);
    if (Object.keys(bad).length) return toast(`入力が足りない回があります（${Object.keys(bad).length}件）。赤い欄を直してください`);
    const go = async () => {
      setBusy(true);
      try {
        mergeOrders(await api.reportShipments(targets.map(input)));
        const last = valOf(targets[targets.length - 1]);
        setMe({ ...me, lastMethod: last.method || me.lastMethod, lastCarrier: last.carrier || me.lastCarrier });
        forget(targets.map((l) => l.key));
        setSel(new Set());
        toast(`${targets.length}件の出荷を報告しました`);
      } catch (ex) { toastError(ex); }
      setBusy(false);
    };
    /* 希望消費期限より前の期限があれば、出荷詳細と同じ確認を出す */
    const early = targets.filter((l) => { const v = valOf(l); return l.o.wishBB && v.bb && v.bb < l.o.wishBB; });
    if (early.length) {
      openModal(
        <ConfirmModal title="消費期限の確認" cancel="戻って直す" ok="このまま報告する" onOk={go}>
          <Notice kind="warn">次の発注は、入力した消費期限が希望消費期限より前です：{early.map((l) => `${l.o.no}（${fmtDate(valOf(l).bb)}／希望 ${fmtDate(l.o.wishBB)}）`).join('、')}</Notice>
          <p style={{ margin: '0.857143rem 0 0' }}>このまま出荷を報告しますか？</p>
        </ConfirmModal>,
      );
      return;
    }
    go();
  };

  const err = (k: string, f: keyof ShipDraft) => errs[k]?.[f];
  const allOn = lines.length > 0 && selN === lines.length;
  return (
    <>
      <div className="bulkbar">
        <span><b>{selN}</b>件を選択中</span>
        {dirty.length > 0 && <Badge v={`未保存の入力 ${dirty.length}件`} cls="b-warn" />}
        <span style={{ flex: 1 }} />
        <button className="btn sm" disabled={!selN} onClick={() => setSel(new Set())}>選択を解除</button>
        <button className="btn out" disabled={!dirty.length || busy} onClick={saveAll}>入力を一括保存</button>
        <button className="btn pri" disabled={!selN || busy} onClick={shipSelected}><Icon name="truck" />選択した{selN}件を出荷済みにする</button>
      </div>
      <div className="tbl-wrap">
        <table className="tbl">
          <thead>
            <tr>
              <th style={{ width: '2.857143rem' }}><input type="checkbox" className="rsel" aria-label="すべて選択" checked={allOn} onChange={(e) => setSel(e.target.checked ? new Set(lines.map((l) => l.key)) : new Set())} /></th>
              <th>発注番号</th><th>商品名</th><th>回</th><th className="num">数量</th><th>納入倉庫</th><th>納品日</th>
              <th>出荷日 <span className="req">必須</span></th><th>配送方法 <span className="req">必須</span></th><th>運送会社</th><th>送り状番号</th><th>賞味期限（消費期限） <span className="req">必須</span></th>
            </tr>
          </thead>
          <tbody>
            {lines.map((l) => {
              const v = valOf(l), p = l.o.parts[l.idx], e = (f: keyof ShipDraft) => (err(l.key, f) ? ' err' : '');
              const msg = Object.values(errs[l.key] ?? {});
              return (
                <tr key={l.key}>
                  <td><input type="checkbox" className="rsel" aria-label="選択" checked={sel.has(l.key)} onChange={(ev) => toggle(l.key, ev.target.checked)} /></td>
                  <td className="mono"><a className="lnk" href={R.order(l.o.no)} onClick={(ev) => { ev.preventDefault(); router.push(R.order(l.o.no)); }}>{l.o.no}</a></td>
                  <td>{l.o.name}{msg.length > 0 && <div className="errmsg">{msg.join('／')}</div>}</td>
                  <td>{l.o.parts.length > 1 ? `${l.idx + 1}/${l.o.parts.length}回目` : '全量'}{nShipped(l.o) > 0 && <div className="muted">{nShipped(l.o)}回 報告済み</div>}</td>
                  <td className="num">{p.qty.toLocaleString()}{l.o.unit}</td>
                  <td>{l.o.wh}</td>
                  <td>{fmtDate(p.dlv) || '—'}</td>
                  <td><DateInput className={`inp${e('ship')}`} value={toIso(v.ship)} onChange={(ev) => setV(l, { ship: fromIso(ev.target.value) })} /></td>
                  <td>
                    <select className={`sel${e('method')}`} value={v.method} onChange={(ev) => setV(l, { method: ev.target.value })}>
                      <option value="">選択してください</option>
                      {METHODS.map((m) => <option key={m}>{m}</option>)}
                    </select>
                  </td>
                  <td>
                    <select className={`sel${e('carrier')}`} value={v.carrier} onChange={(ev) => setV(l, { carrier: ev.target.value })}>
                      <option value="">（なし）</option>
                      {CARRIERS.map((c) => <option key={c}>{c}</option>)}
                    </select>
                  </td>
                  <td><input className={`inp mono${e('slip')}`} inputMode="numeric" placeholder="任意" value={v.slip} onChange={(ev) => setV(l, { slip: ev.target.value })} /></td>
                  <td>{l.o.type === '資材' ? <span className="muted">—</span> : <DateInput className={`inp${e('bb')}`} value={toIso(v.bb)} onChange={(ev) => setV(l, { bb: fromIso(ev.target.value) })} />}</td>
                </tr>
              );
            })}
            {waiting.map((o) => (
              <tr key={o.no} className="rowlink" onClick={() => router.push(R.order(o.no))}>
                <td />
                <td className="mono"><span className="lnk">{o.no}</span></td>
                <td>{o.name}</td>
                <td colSpan={9}><Badge v="本発注待ち" /> <span className="muted">本発注の承認のあとで出荷を入力できます</span></td>
              </tr>
            ))}
            {!lines.length && !waiting.length && <tr><td colSpan={12} className="empty">該当する発注はありません</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
