'use client';

import { useState } from 'react';
import { api, runOp } from '@/lib/ops/purchasing/client';
import { bbOK, draftKey, lineOrder, remain, type Line, type shortData } from '@/lib/ops/purchasing/logic';
import { WH, WISH, dShow, pickDate, slash, wishDate } from '@/lib/ops/purchasing/master';
import type { Draft, Plan, POrder, Prod } from '@/lib/ops/purchasing/types';
import { nowStamp } from '@/lib/supplier/dates';
import type { OpsOp } from '@/lib/supplier/types';
import { useOps } from '../../../_ui/OpsProvider';
import { useCanAct } from '../../../_ui/perm';
import { ConfirmModal } from '../../../_ui/ui';
import { B, Sel } from '../../_components/common';
import { AddShortLineModal } from '../../_components/PoModals';
import { DateInput } from '@/components/DateInput';

/* 発注詳細：短消費期限商品モード（1倉庫×1顧客納品日＝1発注データ） */

const wishLabel = (v: string) => WISH.find((w) => w[0] === v)?.[1] ?? '';

export default function ShortBody({ ym, p, orders, data }: { ym: string; p: Prod; orders: POrder[]; plan?: Plan; data: ReturnType<typeof shortData> }) {
  const { toast, toastError, openModal } = useOps();
  const canAct = useCanAct();
  /* 発注の書き換え（orderOp の op ごとの権限）。権限がなければボタンを出さない */
  const canOp = (o: string) => canAct(api, 'orderOp', { op: o });
  const [whTab, setWhTab] = useState('all');
  const [cyc, setCyc] = useState('all');
  const [rowSel, setRowSel] = useState<Set<number>>(new Set());
  /** 入力中の値（確定したら保存する） */
  const [typing, setTyping] = useState<Record<string, Partial<Line>>>({});
  const [busy, setBusy] = useState(false);
  const lines = data.lines.map((l) => ({ ...l, ...typing[l.base] }));
  const op = (o: OpsOp) => runOp(o, orders);
  const call = async (f: () => Promise<unknown>) => { setBusy(true); try { await f(); } catch (e) { toastError(e); } finally { setBusy(false); } };
  /* 下書きの保存は発注管理の編集ができる人だけ */
  const drafts = (m: Record<string, Draft | null>) => (canAct(api, 'saveDrafts') ? api.action('saveDrafts', { ym, pid: p.id, drafts: m }) : Promise.resolve());
  const clearTyping = (base: string) => setTyping((t) => { const x = { ...t }; delete x[base]; return x; });
  const rowsWith = (l: Line, patch: { wish?: string; kari?: number }) => l.order!.rows.map((r) => ({ ...r, ...(patch.wish !== undefined ? { wish: wishDate(ym, l.k, patch.wish) } : {}), ...(patch.kari !== undefined ? { qty: patch.kari } : {}) }));
  const isErr = (l: Line) => { const rm = remain(ym, l); return l.st === 'エラー' || (rm !== null && rm < p.g && l.st !== '本発注済'); };

  /** 1行の変更を確定する（未発注は発注前の入力として残す／仮発注済は発注データを直す） */
  const commit = (l: Line, patch: { kari?: number; wish?: string; bb?: string }) => call(async () => {
    const nl = { ...l, ...patch };
    if (!l.order) {
      const rm = remain(ym, nl);
      if (l.st === 'エラー' && patch.bb !== undefined && rm !== null && rm >= p.g) {
        /* エラーの行は、希望消費期限を直すと仮発注になる（元のデモと同じ） */
        await op({ op: 'create', orders: [lineOrder(ym, p, { ...nl, kari: nl.kari || nl.need }, nowStamp())] });
        await drafts({ [draftKey(l.wh, l.k)]: null });
      } else await drafts({ [draftKey(l.wh, l.k)]: { kari: nl.kari, wish: nl.wish, bb: nl.bb } });
    } else if (patch.kari !== undefined && patch.kari !== l.order.kari) {
      const re = l.order.ans === '納期回答済';
      if (!(patch.kari > 0)) { toast('仮発注数は1以上にしてください'); clearTyping(l.base); return; }
      await op({ op: 'reviseKari', no: l.order.no, rows: rowsWith(l, { kari: patch.kari }), reanswer: re });
      if (re) toast('数量を変更したため、仕入先に再回答を依頼しました');
    } else if (patch.wish !== undefined) await op({ op: 'reviseKari', no: l.order.no, rows: rowsWith(l, { wish: patch.wish }), reanswer: false });
    else if (patch.bb !== undefined) await op({ op: 'reviseKari', no: l.order.no, rows: l.order.rows, wishBB: slash(patch.bb), reanswer: false });
    clearTyping(l.base);
  });

  const ls = lines.filter((l) => (whTab === 'all' || l.wh === whTab) && (cyc === 'all' || 'ABCD'[Math.floor(l.k / 7)] === cyc));
  const cnt = (w: string) => lines.filter((l) => w === 'all' || l.wh === w).length;
  const nSel = rowSel.size;
  const selErr = [...rowSel].some((i) => lines[i] && isErr(lines[i]));
  const need = ls.reduce((a, l) => a + l.need, 0);
  const kari = ls.filter((l) => ['仮発注済', '本発注済'].includes(l.st)).reduce((a, l) => a + l.kari, 0);
  const targets = () => (rowSel.size ? [...rowSel].map((i) => lines[i]) : lines).filter((l) => l && l.st !== '本発注済');

  const wishAll = (v: string) => call(async () => {
    if (!v) return;
    const ts = targets();
    const un = ts.filter((l) => !l.order);
    if (un.length) await drafts(Object.fromEntries(un.map((l) => [draftKey(l.wh, l.k), { kari: l.kari, wish: v, bb: l.bb }])));
    for (const l of ts.filter((x) => x.order)) await op({ op: 'reviseKari', no: l.order!.no, rows: rowsWith(l, { wish: v }), reanswer: false });
    toast(`入荷希望日を「${wishLabel(v)}」に一括変更しました`);
  });
  const bbAuto = () => call(async () => {
    const ts = targets();
    const at = nowStamp();
    const err = ts.filter((l) => !l.order && l.st === 'エラー');
    const un = ts.filter((l) => !l.order && l.st !== 'エラー');
    if (err.length) {
      await op({ op: 'create', orders: err.map((l) => lineOrder(ym, p, { ...l, kari: l.kari || l.need, bb: bbOK(ym, p, l.k) }, at)) });
      await drafts(Object.fromEntries(err.map((l) => [draftKey(l.wh, l.k), null])));
    }
    if (un.length) await drafts(Object.fromEntries(un.map((l) => [draftKey(l.wh, l.k), { kari: l.kari, wish: l.wish, bb: bbOK(ym, p, l.k) }])));
    for (const l of ts.filter((x) => x.order)) await op({ op: 'reviseKari', no: l.order!.no, rows: l.order!.rows, wishBB: slash(bbOK(ym, p, l.k)), reanswer: false });
    toast(`一括反映しました：${ts.length}行の消費期限を自動設定しました`);
  });
  const shortKari = () => call(async () => {
    const at = nowStamp();
    const ts = [...rowSel].map((i) => lines[i]).filter((l) => l && l.st !== '本発注済' && !l.order);
    if (ts.length) {
      await op({ op: 'create', orders: ts.map((l) => lineOrder(ym, p, { ...l, kari: l.kari || l.need, bb: l.bb || bbOK(ym, p, l.k) }, at)) });
      await drafts(Object.fromEntries(ts.map((l) => [draftKey(l.wh, l.k), null])));
    }
    setRowSel(new Set());
    toast(`仮発注が完了しました：${ts.length}件の発注データを作成しました`);
  });

  return (
    <>
      <div className="po-row">
        <div className="seg2">
          {[['all', '全倉庫'], ...WH.filter((w) => cnt(w)).map((w) => [w, w])].map(([v, l]) => <button key={v} className={whTab === v ? 'on' : ''} onClick={() => { setWhTab(v); setRowSel(new Set()); }}>{l}（{cnt(v)}件）</button>)}
        </div>
        <div className="seg2">
          {[['all', '全サイクル'], ['A', 'A'], ['B', 'B'], ['C', 'C'], ['D', 'D']].map(([v, l]) => <button key={v} className={cyc === v ? 'on' : ''} onClick={() => { setCyc(v); setRowSel(new Set()); }}>{l}</button>)}
        </div>
        <span className="muted">※倉庫・サイクルで明細を絞り込めます</span>
      </div>
      <div className="card pobar">
        <label style={{ display: 'flex', gap: '0.571429rem', alignItems: 'center' }}>
          <input type="checkbox" checked={nSel > 0} onChange={() => {
            if (rowSel.size) setRowSel(new Set());
            else setRowSel(new Set(ls.filter((l) => l.st !== '本発注済').map((l) => l.i)));
          }} /> 選択した行のみ適用
        </label>
        <b className="txt-ac">{nSel} / {lines.length} 件</b>
        <span>入荷希望日 一括：</span>
        <Sel value="" opts={WISH} ph="選択…" onChange={wishAll} />
        {canOp('reviseKari') && <button className="btn out sm" disabled={busy} onClick={bbAuto}>基準適合消費期限を自動設定</button>}
        {canOp('create') && <button className="btn out sm" onClick={() => openModal(<AddShortLineModal ym={ym} pid={p.id} />)}>追加発注（行を足す）</button>}
      </div>
      <section className="card">
        <div className="unit-h">
          <h3>全倉庫明細一覧</h3>
          <span className="mono po" title="行ごとの発注番号">PO-{ym.replace('-', '')}-{p.id}-（倉庫記号＋Slot）</span>
          <span className="muted">保証期限：{p.g}日厳守</span>
          <span className="muted" style={{ marginLeft: 'auto' }}>※エラーの行は本発注できません</span>
        </div>
        <div className="tbl-wrap">
          <table className="tbl">
            <thead>
              <tr><th style={{ width: '2.714286rem' }}></th><th>倉庫</th><th>ピッキング日</th><th className="num" title="注文数／調整数（運営Web 商品注文管理）">注文／調整</th><th className="num">日別必要</th><th className="txt-ac">仮発注数</th><th>入荷希望日</th><th>希望消費期限</th><th>残日数</th><th>ステータス</th><th>仕入先回答</th></tr>
            </thead>
            <tbody>
              {ls.length ? ls.map((l) => {
                const pk = pickDate(ym, l.k);
                const rm = remain(ym, l);
                const okd = rm === null ? null : rm >= p.g;
                const err = isErr(l);
                const ed = l.st !== '本発注済';
                const on = rowSel.has(l.i);
                const set = (patch: Partial<Line>) => setTyping((t) => ({ ...t, [l.base]: { ...t[l.base], ...patch } }));
                return (
                  <tr key={l.base} className={`${err ? 'rerr' : ''} ${on ? 'rsel' : ''}`}>
                    <td><input type="checkbox" checked={on} disabled={!ed} onChange={(e) => { const s = new Set(rowSel); if (e.target.checked) s.add(l.i); else s.delete(l.i); setRowSel(s); }} aria-label={`${l.wh} の行を選択`} /></td>
                    <td>{l.wh}</td>
                    <td>{dShow(pk)}</td>
                    <td className="num">{l.std}／{l.free}</td>
                    <td className="num"><b>{l.need}個</b></td>
                    <td style={{ width: '7.142857rem' }}>
                      {ed ? <input className={`inp ${err ? 'err' : ''}`} type="number" min={0} value={l.kari || l.need} aria-label="仮発注数" disabled={busy}
                        onChange={(e) => set({ kari: Math.max(0, +e.target.value || 0) })} onBlur={() => { if (typing[l.base]?.kari !== undefined) commit(data.lines[l.i], { kari: typing[l.base].kari }); }} />
                        : <span className="num">{l.hon}個</span>}
                    </td>
                    <td style={{ minWidth: '12.142857rem' }}>
                      {ed ? <Sel value={l.wish} ph={null} opts={WISH.map(([v, lb]) => [v, `${dShow(wishDate(ym, l.k, v), false)}（${lb}）`])} ariaLabel="入荷希望日" disabled={busy} onChange={(v) => commit(data.lines[l.i], { wish: v })} />
                        : dShow(wishDate(ym, l.k, l.wish), false)}
                    </td>
                    <td style={{ width: '10.714286rem' }}>
                      {ed ? <DateInput className={`inp ${err ? 'err' : ''}`} value={l.bb} aria-label="希望消費期限" disabled={busy} onChange={(e) => commit(data.lines[l.i], { bb: e.target.value })} />
                        : slash(l.bb)}
                    </td>
                    <td>{rm === null ? <span className="muted">—</span> : <span className={`badge ${okd ? 'b-ok' : 'b-ng'}`}>{rm}日 {okd ? '適合' : '不足'}</span>}</td>
                    <td><B v={err ? 'エラー' : l.st} /></td>
                    <td>{l.order && <B v={l.order.ans} />}{l.order?.recv === '入荷済' && <> <B v="入荷済" /></>}</td>
                  </tr>
                );
              }) : <tr><td colSpan={11} className="empty">該当する明細がありません</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="unitfoot">
          {selErr ? <span className="txt-ng">※選択した行にエラーがあるため、一括仮発注できません。希望消費期限を直すか「基準適合消費期限を自動設定」を押してください。</span> : <span>※残日数＝希望消費期限 − 顧客納品日。保証残日数以上で適合です。</span>}
          {canOp('create') && <button className="btn pri sm" disabled={!nSel || selErr || busy} onClick={shortKari}>選択した行を一括仮発注</button>}
          <span>必要数合計 <b>{need}個</b></span>
          <span>仮発注数合計 <b className="txt-ok">{kari}個</b></span>
        </div>
      </section>
    </>
  );
}
