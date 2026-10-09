'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { ymJa } from '@/lib/supplier/dates';
import { canShip, honVisible, needHon, nShipped, wishRange } from '@/lib/supplier/orders';
import { R } from '@/lib/supplier/routes';
import { useSignedIn } from '@/lib/supplier/store';
import { api } from '@/lib/api/supplier';
import type { Order } from '@/lib/supplier/types';
import { Badge, KV, Notice, PageHead } from '../../../_components/ui';
import HonCard from './HonCard';
import RespondCard from './RespondCard';
import ScheduleCard from './ScheduleCard';
import ShipCard from './ShipCard';
import { fmtDate, fmtDatesIn, fmtDateTime } from '@/lib/format/date';

const STEPS = ['仮発注済', '納期回答済', '本発注済', '出荷済', '入荷済'];

/** S07 発注詳細 */
export default function OrderPage() {
  const { no } = useParams<{ no: string }>();
  const key = decodeURIComponent(no);
  /* 発注が変わったら入力中の値を捨てる */
  return <OrderDetail key={key} no={key} />;
}

function OrderDetail({ no }: { no: string }) {
  const { orders, mergeOrders } = useSignedIn();
  const o = orders.find((x) => x.no === no);
  const [reedit, setReedit] = useState(false);
  const [shipIdx, setShipIdx] = useState<number | null>(null);
  const shipBtn = useRef<HTMLButtonElement>(null);
  const scrollToShip = useRef(false);

  /* 開いたら既読にする */
  useEffect(() => {
    if (o && !o.seen) api.markSeen(o.no).then((x) => mergeOrders([x]), () => undefined);
  }, [o, mergeOrders]);
  useEffect(() => {
    if (scrollToShip.current) {
      shipBtn.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      scrollToShip.current = false;
    }
  }, [shipIdx]);

  if (!o) {
    return (
      <>
        <PageHead crumbs={['受注一覧', '発注詳細']} title="発注詳細" />
        <div className="empty">発注が見つかりません</div>
      </>
    );
  }

  const rej = o.ans === '受注不可';
  const cancel = o.ans === 'キャンセル';
  const ps = o.parts ?? [];
  const canReedit = reedit && o.ans === '納期回答済' && nShipped(o) === 0;
  /* 本発注が届いたら「本発注済」（RV3-SUP ⑧） */
  const cur = o.recv === '入荷済' ? 4 : o.ans === '出荷済' ? 3 : o.ans === '納期回答済' && o.hon > 0 ? 2 : o.ans === '納期回答済' ? 1 : 0;

  /* 出荷報告する回：選んだ回が未出荷でなければ、最初の未出荷の回 */
  const unshipped = ps.findIndex((x) => x.st === '未出荷');
  const idx = shipIdx != null && ps[shipIdx]?.st === '未出荷' ? shipIdx : unshipped;
  const showShip = canShip(o) && unshipped >= 0;

  return (
    <>
      <PageHead crumbs={['受注一覧', '発注詳細']} title={`発注詳細 ${o.no}`}>
        <Link className="btn" href={R.orders} style={{ textDecoration: 'none' }}>一覧に戻る</Link>
      </PageHead>

      {!rej && !cancel && (
        <div className="card">
          <ol className="steps">
            {STEPS.map((s, i) => (
              <li key={s} className={`${i <= cur ? 'done' : ''} ${i === cur ? 'cur' : ''}`}><i>{i + 1}</i>{s}</li>
            ))}
          </ol>
        </div>
      )}

      <OrderInfo o={o} />

      {(o.ans === '納期回答待ち' || canReedit) && <RespondCard o={o} reedit={canReedit} onDone={() => setReedit(false)} />}
      {needHon(o) && <HonCard o={o} />}

      {rej && (
        <div className="card">
          <h2>却下（受注不可）</h2>
          <Notice kind="ng" style={{ marginBottom: '0.857143rem' }}>この発注は却下済みです。運営が確認します。</Notice>
          <div className="kvgrid"><KV l="却下の理由">{o.reject?.reason}</KV><KV l="コメント">{o.reject?.comment}</KV></div>
        </div>
      )}
      {cancel && o.cancel && (
        <div className="card">
          <h2>キャンセル（運営）</h2>
          <Notice kind="ng" style={{ marginBottom: '0.857143rem' }}>運営がこの発注をキャンセルしました。出荷しないでください。</Notice>
          <div className="kvgrid"><KV l="キャンセル日時">{o.cancel.at}</KV><KV l="操作">{o.cancel.by}</KV><KV l="理由">{o.cancel.reason}</KV></div>
          <h3 style={{ fontSize: '1rem', margin: '1.142857rem 0 0.428571rem' }}>履歴</h3>
          <div className="tbl-wrap">
            <table className="tbl">
              <thead><tr><th>日時</th><th>操作者</th><th>内容</th></tr></thead>
              <tbody>{(o.hist ?? []).map((h, i) => <tr key={i}><td>{fmtDateTime(h.at)}</td><td>{h.who}</td><td>{fmtDatesIn(h.t)}</td></tr>)}</tbody>
            </table>
          </div>
        </div>
      )}

      {(o.ans === '納期回答済' || o.ans === '出荷済') && (
        <PartsCard
          o={o}
          canEdit={o.ans === '納期回答済' && nShipped(o) === 0 && !reedit}
          onEdit={() => setReedit(true)}
          onShip={(i) => { scrollToShip.current = true; setShipIdx(i); }}
        />
      )}

      {showShip ? (
        <ShipCard key={`${o.no}#${idx}`} ref={shipBtn} o={o} idx={idx} onDone={() => setShipIdx(null)} />
      ) : o.ans === '納期回答済' && !canShip(o) && !needHon(o) ? (
        <div className="card">
          <h2>出荷処理・報告</h2>
          <Notice kind="pur">この発注は<b>本発注待ち</b>です。運営が本発注（数量確定）を行うと、ここから出荷報告ができます。メールでお知らせします。</Notice>
        </div>
      ) : null}

      <ScheduleCard o={o} />
    </>
  );
}

function OrderInfo({ o }: { o: Order }) {
  const hv = honVisible(o);
  return (
    <div className="card">
      <h2>発注情報</h2>
      <div className="kvgrid">
        <KV l="発注番号"><span className="mono">{o.no}</span></KV>
        <KV l="種類"><Badge v={o.type} /></KV>
        <KV l="商品名">{o.name}</KV>
        <KV l="品番"><span className="mono">{o.pid}</span></KV>
        <KV l="対象年月">{ymJa(o.ym) + ' メニュー'}</KV>
        <KV l="納品先（納入倉庫）">{o.wh}</KV>
        <KV l="納品期間（入荷希望日）">{wishRange(o)}</KV>
        <KV l="仮発注数">{o.kari.toLocaleString() + o.unit}</KV>
        <KV l="本発注数">{hv ? o.hon.toLocaleString() + o.unit : o.hon > 0 ? '—（納期を回答すると、本発注の承認に進みます）' : '—（未確定）'}</KV>
        <KV l="本発注の承認">
          {hv ? (o.honAck ? <><Badge v="承認済" cls="b-ok" /> {fmtDateTime(o.honAckAt)}</> : <Badge v="承認待ち" cls="b-warn" />) : '—'}
        </KV>
        {o.honAck && hv && (
          <>
            <KV l="納品日">{[...new Set(o.parts.map((x) => x.dlv))].map(fmtDate).join('・')}</KV>
            <KV l="入荷箱数（合計）">{o.parts.reduce((a, x) => a + (+(x.box ?? 0) || 0), 0).toLocaleString() + '箱'}</KV>
          </>
        )}
        <KV l="発注日時">{fmtDateTime(o.orderedAt)}</KV>
        {o.add && <KV l="追加発注の理由">{o.add}</KV>}
        {o.wishBB && <KV l="希望消費期限">{fmtDate(o.wishBB)}</KV>}
        <KV l="入荷状況">{o.recv ? <><Badge v={o.recv} />{o.recvDate ? ' ' + fmtDate(o.recvDate) : ''}</> : '—'}</KV>
      </div>
    </div>
  );
}

/** 回答内容（分納の一覧） */
function PartsCard({ o, canEdit, onEdit, onShip }: { o: Order; canEdit: boolean; onEdit: () => void; onShip: (i: number) => void }) {
  const ps = o.parts;
  const bbL = o.type === '短消費期限' ? '消費期限' : '賞味期限';
  return (
    <div className="card">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.857143rem', flexWrap: 'wrap', marginBottom: '0.857143rem' }}>
        <h2 style={{ margin: 0 }}>回答内容{ps.length > 1 && `（分納 ${ps.length}回）`}</h2>
        <span style={{ flex: 1 }} />
        {canEdit && <button className="btn sm out" onClick={onEdit}>回答を修正する</button>}
      </div>
      <div className="tbl-wrap">
        <table className="tbl">
          <thead>
            <tr>
              <th>{ps.length > 1 ? '回' : ''}</th><th>出荷予定日</th><th>納品日</th><th className="num">数量</th><th className="num">入荷箱数</th><th>状況</th>
              <th>出荷日</th><th>配送方法</th><th>運送会社</th><th>送り状番号</th>{o.type !== '資材' && <th>{bbL}</th>}<th />
            </tr>
          </thead>
          <tbody>
            {ps.map((x, i) => (
              <tr key={i}>
                <td>{ps.length > 1 ? `${i + 1}回目` : '全量'}</td>
                <td>{fmtDate(x.eta)}</td>
                <td>{fmtDate(x.dlv) || '—'}</td>
                <td className="num">{x.qty.toLocaleString()}{o.unit}</td>
                <td className="num">{x.box ? (+x.box).toLocaleString() + '箱' : '—'}</td>
                <td><Badge v={x.st} /></td>
                <td>{fmtDate(x.ship) || '—'}</td>
                <td>{x.method || '—'}</td>
                <td>{x.carrier || '—'}</td>
                <td className="mono">{x.slip || '—'}</td>
                {o.type !== '資材' && <td>{fmtDate(x.bb) || '—'}</td>}
                <td>{canShip(o) && x.st === '未出荷' && <button className="btn sm pri" onClick={() => onShip(i)}>出荷報告</button>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
