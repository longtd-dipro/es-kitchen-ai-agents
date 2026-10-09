'use client';

import Link from 'next/link';
import { useState } from 'react';
import dmStock from '@/lib/domain/areas/stock';
import order from '@/lib/domain/areas/order';
import org from '@/lib/domain/areas/org';
import { domainApi, useDomainQuery } from '@/lib/domain/client';
import { itemKind, SPLIT_MAX, type PoLike } from '@/lib/domain/stock';
import type { Receipt, ReceiptFix } from '@/lib/domain/types';
import { runOp } from '@/lib/ops/purchasing/client';
import { iso, pname, slash, supName } from '@/lib/ops/purchasing/master';
import type { POrder } from '@/lib/ops/purchasing/types';
import { DateInput } from '@/components/DateInput';
import { fmtDate } from '@/lib/format/date';
import { useOps } from '../../_ui/OpsProvider';
import { useCanAct } from '../../_ui/perm';
import { Field } from '../../_ui/ui';
import { B, Box, Info, Kv } from './common';
import { opsCls } from '@/lib/format/status';

/*
 * 入荷登録（課題 2-3）の部品。データは共通データの stock（lib/domain/stock.ts：入荷の記録・差異の対応・影響する便）。
 * 発注そのもの（仕入先サイトと同じ発注データ）は画面が持っている一覧（usePo）を発注の形（PoLike）にして渡す。
 */
export const stockApi = domainApi(dmStock);
const orderApi = domainApi(order);
const orgApi = domainApi(org);
export const OPS_ID = 'Ad00010';

/** 発注 → 共通データに渡す発注の形（使う項目だけ） */
export const poLike = (o: POrder): PoLike => ({
  no: o.no, sup: o.sup, pid: o.pid, type: o.type, wh: o.wh, ym: o.ym, hon: o.hon, ans: o.ans, recv: o.recv, eta: o.eta, rows: o.rows,
  parts: o.parts.map((p) => ({ eta: p.eta, qty: p.qty, box: p.box, bb: p.bb })), lot: o.lot,
});

/** 入荷の差異のアラート（運営の TOP・発注の一覧の上の帯） */
export function useReceiptAlerts() {
  return useDomainQuery(stockApi, 'alerts');
}

/** 発注を入荷済にする（仕入先サイトと同じ発注データ。代替品の追加発注は共通データの側で入荷済にしてある） */
export async function closePo(no: string, date: string, orders: POrder[]) {
  const o = orders.find((x) => x.no === no);
  if (o && o.recv !== '入荷済') await runOp({ op: 'receive', no, date }, orders);
}

type Impact = { short: number; impacts: { deliveryId: string; branchId: string; orderId: string; slot: string; shipOn: string; deliverOn: string; qty: number }[] };

/**
 * 入荷の差異の対応（確認画面）。不足の数と、影響する法人の注文・便を先に見せてから、
 * 分納を待つ（3回まで）／代替品で対応（代替品設定へ・できた設定を選ぶ）／不足を受け入れる（③ 除外・請求しない・法人へ通知）を選ぶ。
 * 仕入先に確かめてから決めるときは「あとで決める」で閉じる（差異あり・対応待ちのまま、アラートが出続ける）
 */
export function ResolveModal({ rc, po, orders, next }: { rc: Receipt; po?: POrder; orders: POrder[]; /** 続けて対応するとき、閉じたあとに次の差異の対応を開く */ next?: () => void }) {
  const { closeModal, toast, toastError, account } = useOps();
  const canAct = useCanAct();
  const { data: imp } = useDomainQuery(stockApi, 'impact', { id: rc.id, po: po ? poLike(po) : undefined });
  const { data: alts } = useDomainQuery(orderApi, 'alts');
  const { data: branches } = useDomainQuery(orgApi, 'branches');
  const over = rc.qty > rc.planQty;
  /* 資材は食品の便と一緒に送らない：代替品・影響する便・法人への連絡はない（台帳 I・2026-10-08） */
  const mat = itemKind(rc.itemId) === '資材';
  const [how, setHow] = useState<ReceiptFix | ''>(over ? '多い分を受け入れる' : '');
  const [nextOn, setNextOn] = useState('');
  const [altId, setAltId] = useState('');
  const [note, setNote] = useState('');
  const [payBasis, setPayBasis] = useState<'発注数' | '入荷数'>('発注数');
  const [busy, setBusy] = useState(false);
  const x = imp as Impact | undefined;
  const mine = ((alts ?? []) as { id: string; productId: string; altProductId: string; createdAt: string }[]).filter((a) => a.productId === rc.itemId);
  const bName = (id: string) => (branches ?? []).find((b) => b.branch.id === id)?.branch.name ?? id;
  const lastPart = rc.part >= SPLIT_MAX;
  const altHref = `/ops/menu/orders/alt?def=${encodeURIComponent(rc.itemId)}&found=${iso(rc.receivedOn)}&from=${iso(rc.receivedOn)}&to=${iso(x?.impacts[x.impacts.length - 1]?.shipOn ?? rc.receivedOn)}&reason=${encodeURIComponent(`入荷の不足（${rc.poNo}・${rc.qty}/${rc.planQty}）`)}`;
  const ok = async () => {
    if (!how) { toast('対応を選んでください'); return; }
    setBusy(true);
    try {
      const out = await stockApi.action('resolve', { id: rc.id, how, note, nextOn: how === '分納を待つ' ? slash(nextOn) : undefined, altId: how === '代替品で対応' ? altId : undefined, po: po ? poLike(po) : undefined, by: account?.id ?? OPS_ID, notify: !mat, payBasis: over ? payBasis : undefined });
      if (out.closePo) await closePo(rc.poNo, rc.receivedOn, orders);
      closeModal();
      next?.();
      toast(how === '分納を待つ' ? `分納を待ちます（次の入荷予定 ${fmtDate(slash(nextOn))}）` : how === '不足を受け入れる' ? `不足を受け入れました。影響する便 ${x?.impacts.length ?? 0}件は ③ 除外（請求しない）にし、法人へ知らせました` : '対応を記録しました');
    } catch (e) { toastError(e); } finally { setBusy(false); }
  };
  const radio = (v: ReceiptFix, label: string, dis = false, hint = '') => (
    <label style={{ display: 'flex', gap: '0.571429rem', alignItems: 'flex-start', opacity: dis ? 0.5 : 1, margin: '0.428571rem 0' }}>
      <input type="radio" name="rc-how" checked={how === v} disabled={dis} onChange={() => setHow(v)} />
      <span><b>{label}</b>{hint && <><br /><span className="hint">{hint}</span></>}</span>
    </label>
  );
  return (
    <Box title="入荷の差異の対応" width={860}
      footer={<><span style={{ flex: 1 }} /><button className="btn lg ghost" onClick={() => { closeModal(); next?.(); }}>あとで決める（対応待ちのまま）</button>{canAct(stockApi, 'resolve') && <button className="btn pri lg" disabled={busy || !how} onClick={ok}>この対応にする</button>}</>}>
      <div className="kvgrid" style={{ marginBottom: '0.857143rem' }}>
        <Kv l="発注番号" v={<span className="mono">{rc.poNo}</span>} /><Kv l="商品" v={pname(rc.itemId)} /><Kv l="仕入先" v={supName(rc.supplierId)} />
        <Kv l="入荷日" v={fmtDate(rc.receivedOn)} /><Kv l={`予定（${rc.part}回目）`} v={`${rc.planQty}個・${rc.planBox}箱`} /><Kv l="入荷" v={`${rc.qty}個・${rc.box}箱`} c="ng" />
      </div>
      {over ? <Info kind="warn">予定より <b>{rc.qty - rc.planQty}個 多く</b>入荷しました。多い分を受け入れると発注を閉じます（多い分は倉庫在庫になります）。</Info>
        : <Info kind="warn">予定より <b>{x?.short ?? rc.planQty - rc.qty}個 足りません</b>。仕入先に確かめてから対応を選んでください（決めるまでは「差異あり・対応待ち」で、運営の TOP と発注の一覧にアラートが出続けます）。</Info>}
      {!over && !mat && (
        <>
          <h4 style={{ margin: '0.857143rem 0 0.428571rem' }}>影響する法人の注文・便（不足を受け入れたとき ③ 除外になる便）</h4>
          <div className="tbl-wrap">
            <table className="tbl">
              <thead><tr><th>拠点</th><th>お届け日</th><th>出荷日</th><th>便</th><th>配送</th><th>注文</th><th className="num">足りなくなる数</th></tr></thead>
              <tbody>
                {!x ? <tr><td colSpan={7} className="empty">読み込み中…</td></tr>
                  : x.impacts.length ? x.impacts.map((i) => (
                    <tr key={i.deliveryId}><td>{bName(i.branchId)}<br /><span className="hint mono">{i.branchId}</span></td><td>{fmtDate(i.deliverOn)}</td><td>{fmtDate(i.shipOn)}</td><td>{i.slot}</td>
                      <td className="mono">{i.deliveryId}</td><td className="mono">{i.orderId}</td><td className="num"><b>{i.qty}</b></td></tr>
                  )) : <tr><td colSpan={7} className="empty">この発注の期間に、まだ出荷していない便でこの商品の注文はありません（在庫で足りるか、もう出荷済み）</td></tr>}
              </tbody>
            </table>
          </div>
          <p className="hint" style={{ margin: '0.428571rem 0 0.857143rem' }}>不足は、この倉庫から出る便のうち後ろの便から割り当てます（先に出る便には入荷した分を回す）。</p>
        </>
      )}
      <div className="stack">
        {over ? <>
          {radio('多い分を受け入れる', '多い分を受け入れる', false, '発注を閉じます')}
          <Field label="仕入先への支払いの数">
            <div style={{ display: 'flex', gap: '1.428571rem', flexWrap: 'wrap' }}>
              <label><input type="radio" name="rc-pay" checked={payBasis === '発注数'} onChange={() => setPayBasis('発注数')} /> 発注した数（{rc.planQty}個）で払う</label>
              <label><input type="radio" name="rc-pay" checked={payBasis === '入荷数'} onChange={() => setPayBasis('入荷数')} /> 入荷した数（{rc.qty}個）で払う</label>
            </div>
            <span className="hint">多い分（{rc.qty - rc.planQty}個）の代金を払うか、そのとき運営が選びます。仕入先への支払いの集計に反映します。</span>
          </Field>
        </>
          : <>
            {radio('分納を待つ', '分納を待つ', lastPart, lastPart ? `分納は${SPLIT_MAX}回までです（この入荷が${rc.part}回目）` : `仕入先が残り ${rc.planQty - rc.qty}個を後で納品します（分納は${SPLIT_MAX}回まで・いまは${rc.part}回目）。次の入荷予定日を入れます`)}
            {how === '分納を待つ' && <Field label="次の入荷予定日（仕入先の回答）" req><DateInput className="inp" value={nextOn} onChange={(e) => setNextOn(e.target.value)} style={{ width: '14.285714rem' }} /></Field>}
            {!mat && <>
            {radio('代替品で対応', '代替品で対応', false, '代替品設定で代わりの商品を届けます。代替品設定を開いて保存したあと、ここでその設定を選びます')}
            {how === '代替品で対応' && (
              <div style={{ display: 'flex', gap: '0.571429rem', alignItems: 'center', flexWrap: 'wrap', marginLeft: '1.714286rem' }}>
                <Link className="btn sm out" href={altHref} onClick={closeModal}>代替品設定を開く（不良商品・期間を入れて開く）</Link>
                <select className="sel" style={{ width: '22.857143rem' }} value={altId} onChange={(e) => setAltId(e.target.value)} aria-label="代替品設定">
                  <option value="">この商品の代替品設定を選ぶ</option>
                  {mine.map((a) => <option key={a.id} value={a.id}>{a.id}（{pname(a.productId)} → {pname(a.altProductId)}）</option>)}
                </select>
              </div>
            )}
            </>}
            {radio('不足を受け入れる', '不足を受け入れる（③ 除外）', false, '上の便のこの商品を足りない数だけ外します（納品分に含まれません・請求しません）。出荷指示を送った便は版番号つきで再送します')}
          </>}
        <Field label="メモ"><input className="inp" value={note} onChange={(e) => setNote(e.target.value)} placeholder="仕入先とのやり取りなど" /></Field>
      </div>
    </Box>
  );
}

/** 状態のバッジ */
export function ReceiptBadge({ st }: { st: string }) {
  return <B v={st} c={opsCls(st)} />;
}
