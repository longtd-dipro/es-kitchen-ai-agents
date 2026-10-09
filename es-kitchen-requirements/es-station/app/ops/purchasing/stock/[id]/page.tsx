'use client';

import { useParams, useRouter } from 'next/navigation';
import { Fragment, useEffect } from 'react';
import { IN_MENU, MONTHS, WH, prod, supName } from '@/lib/ops/purchasing/master';
import { smYmL } from '@/lib/ops/purchasing/samples';
import { wsCalc, wsLead, wsState, wsType } from '@/lib/ops/purchasing/stock';
import { useOps } from '../../../_ui/OpsProvider';
import { Info, Kv } from '../../_components/common';
import { KindBadge, RecModal, WsHead } from '../../_components/stock';
import { PO, useStockData } from '../../_components/usePo';
import { fmtDate, fmtDatesIn, fmtYm } from '@/lib/format/date';

/** 倉庫在庫の詳細（商品×倉庫・月で区切った明細）。元のデモの renderWhsDetail */
export default function StockDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [wh, pid] = decodeURIComponent(id).split('|');
  const p = prod(pid);
  const router = useRouter();
  const { openModal } = useOps();
  const { stock } = useStockData();
  const bad = !p || !WH.includes(wh);
  useEffect(() => { if (bad) router.replace('/ops/purchasing/stock'); }, [bad, router]);
  if (bad) return null;
  if (!stock) return <div className="card"><div className="empty">読み込み中…</div></div>;
  const imp = stock.state.imp;
  const c = wsCalc(stock, wh, pid);
  const state = wsState(c);
  const stCls = c.shortDate ? 'b-ng' : c.fin > 0 ? 'b-info' : 'b-mute';
  const nextOut = c.rows.find((r) => r.kind === '出荷' && !r.done);
  const poYm1 = nextOut ? nextOut.ref.slice(0, 7) : MONTHS[0];
  const firstM = imp.date.slice(0, 7);
  let lastM = firstM;
  const mLabel = (m: string) => fmtYm(m);
  return (
    <>
      <WsHead last="倉庫在庫の詳細" title={<>{p.name}（{pid}）｜{wh} <span className={`badge ${stCls}`} style={{ fontSize: '0.928571rem', verticalAlign: 'middle' }}>{state}</span></>}>
        <button className="btn out lg" onClick={() => openModal(<RecModal wh={wh} pid={pid} />)}>この商品を記録</button>
        {IN_MENU[poYm1]?.includes(pid) && <button className="btn out lg" onClick={() => { PO.ym = poYm1; router.push(`/ops/purchasing/orders/${pid}`); }}>発注詳細（{smYmL(poYm1)}メニュー）</button>}
      </WsHead>
      <div className="card">
        <div className="sec-h" style={{ marginBottom: '0.857143rem' }}><h2>基本情報</h2></div>
        {c.shortDate && <Info kind="warn"><b>{fmtDate(c.shortDate)} の出荷で在庫が足りなくなる見込みです</b>（いちばん少ない日 {fmtDate(c.minDate)}：{c.minV}個）。追加の発注・代替品・調整数で対応してください。出荷は止めません。</Info>}
        <div className="kvgrid">
          <Kv l="品番" v={<span className="mono">{pid}</span>} /><Kv l="商品名" v={p.name} /><Kv l="倉庫" v={wh} /><Kv l="区分" v={wsType(p.short)} />
          <Kv l="保管方法" v={p.keep} /><Kv l="仕入先" v={supName(p.sup)} /><Kv l="発注ロット" v={p.short ? '1個単位' : p.lot + '個／箱'} /><Kv l="出荷のリードタイム" v={wsLead(wh) + '日（倉庫ごと）'} />
          <Kv l={`THOMAS在庫（${fmtDate(imp.date)} 棚卸し）`} v={c.base.toLocaleString() + '個'} /><Kv l="入荷予定" v={(c.inQ ? '+' : '') + c.inQ.toLocaleString() + '個'} c={c.inQ ? 'txt-ok' : ''} />
          <Kv l="出荷予定" v={(c.outQ ? '−' : '') + Math.abs(c.outQ).toLocaleString() + '個'} /><Kv l="在庫の記録" v={(c.recQ > 0 ? '+' : c.recQ < 0 ? '−' : '') + Math.abs(c.recQ) + '個'} />
          <Kv l="見込み在庫" v={c.fin.toLocaleString() + '個'} c={c.fin < 0 ? 'txt-ng' : 'txt-ac'} /><Kv l="今日時点の計算在庫" v={c.now.toLocaleString() + '個'} />
        </div>
        <p className="muted" style={{ fontSize: '0.857143rem', margin: '0.285714rem 0 0' }}>見込み在庫は参考値で、正しい数は THOMAS です。</p>
      </div>
      <div className="card">
        <div className="sec-h" style={{ marginBottom: '0.857143rem' }}><h2>見込みの推移と入出庫の記録</h2></div>
        <div className="tbl-wrap">
          <table className="tbl">
            <thead><tr><th>日付</th><th>区分</th><th>発注番号・納品・記録番号</th><th>実績／予定</th><th className="num">数量</th><th className="num">見込み在庫</th><th>メモ</th></tr></thead>
            <tbody>
              <tr className="ws-grp"><td colSpan={7}>{mLabel(firstM)}</td></tr>
              <tr><td>{fmtDate(imp.date)}</td><td><KindBadge k="THOMAS取込" /></td><td className="mono" style={{ fontSize: '0.857143rem' }}>{imp.file}</td><td><span className="muted">実績</span></td><td className="num">—</td><td className="num"><b>{c.base.toLocaleString()}</b></td><td className="ws-l" style={{ fontSize: '0.857143rem' }}>棚卸し後の在庫（起点）</td></tr>
              {c.rows.map((r, i) => {
                const m = r.date.slice(0, 7);
                const sep = m !== lastM;
                lastM = m;
                return (
                  <Fragment key={i}>
                    {sep && <tr className="ws-grp"><td colSpan={7}>{mLabel(m)}</td></tr>}
                    <tr className={r.bal! < 0 ? 'rerr' : ''}>
                      <td>{fmtDate(r.date)}</td><td><KindBadge k={r.kind} /></td><td className="mono" style={{ fontSize: '0.857143rem' }}>{fmtDatesIn(r.ref)}</td><td>{r.done ? <span className="muted">実績</span> : '予定'}</td>
                      <td className={`num ${r.qty > 0 ? 'txt-ok' : ''}`}>{r.qty > 0 ? '+' : '−'}{Math.abs(r.qty).toLocaleString()}</td>
                      <td className="num"><b className={r.bal! < 0 ? 'txt-ng' : ''}>{r.bal!.toLocaleString()}</b></td>
                      <td className="ws-l" style={{ fontSize: '0.857143rem' }}>{r.note}{r.rec && <><br /><span className="muted">{r.rec.by}</span></>}</td>
                    </tr>
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
        {!c.rows.length && <p className="muted" style={{ margin: '0.714286rem 0 0' }}>取り込み後の入出庫はありません。</p>}
        <p className="muted" style={{ fontSize: '0.857143rem', margin: '0.571429rem 0 0' }}>入荷日は入荷済みなら入荷日、未入荷なら入荷予定日。出荷日は顧客納品日から倉庫のリードタイム（{wh}：{wsLead(wh)}日）分前の日。赤い行は在庫がマイナスになる日です。</p>
      </div>
    </>
  );
}
