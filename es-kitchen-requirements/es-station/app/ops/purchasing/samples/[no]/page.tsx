'use client';

import { useParams, useRouter } from 'next/navigation';
import { api, useSamples } from '@/lib/ops/purchasing/client';
import { prod } from '@/lib/ops/purchasing/master';
import { smOrderTxt, smSlW, smWeekLabel } from '@/lib/ops/purchasing/samples';
import { fmtDate, fmtDateTime } from '@/lib/format/date';
import { useOps } from '../../../_ui/OpsProvider';
import { useCanAct } from '../../../_ui/perm';
import { Kv } from '../../_components/common';
import { MemoModal, SmBadge } from '../../_components/samples';

/* 営業サンプルの詳細（AW_SMP_003）。一覧の列を絞った分と、メモ・送り状番号の変更履歴を1画面で見る */

const BASE = '/ops/purchasing/samples';

export default function SampleDetailPage() {
  const { no: raw } = useParams<{ no: string }>();
  const no = decodeURIComponent(raw);
  const router = useRouter();
  const { openModal } = useOps();
  const canAct = useCanAct();
  const { data } = useSamples();
  if (!data) return <div className="card"><div className="empty">読み込み中…</div></div>;
  const r = data.rows.find((x) => x.no === no);
  const head = (
    <div className="crumb"><span>発注・入荷</span><span><button className="lnk u" onClick={() => router.push(BASE)}>営業サンプル</button></span><span>詳細</span></div>
  );
  if (!r) {
    return (
      <>
        <div className="ph"><div>{head}<h1>サンプル詳細</h1></div></div>
        <div className="card">
          <div className="empty">サンプルNo「{no}」は見つかりません。</div>
          <p style={{ textAlign: 'center' }}><button className="btn out lg" onClick={() => router.push(BASE)}>一覧へ戻る</button></p>
        </div>
      </>
    );
  }
  const hist = (r.history ?? []).slice().reverse();
  const qty = r.items.reduce((s, i) => s + i.qty, 0);
  return (
    <>
      <div className="ph">
        <div>{head}<h1>サンプル詳細 <span className="mono">{r.no}</span> <SmBadge v={r.status} /></h1></div>
        <div className="btns">
          {canAct(api, 'updateSample') && <button className="btn out lg" onClick={() => openModal(<MemoModal r0={r} />)}>メモ・送り状番号を編集</button>}
          <button className="btn out lg" onClick={() => router.push(BASE)}>一覧へ戻る</button>
        </div>
      </div>
      <div className="card">
        <div className="sec-h" style={{ marginBottom: '0.857143rem' }}><h2>基本情報</h2></div>
        <div className="kvgrid">
          <Kv l="サンプルNo" v={<span className="mono">{r.no}</span>} /><Kv l="受付日" v={fmtDate(r.regDate)} /><Kv l="登録者" v={r.by} /><Kv l="状態" v={<SmBadge v={r.status} />} />
        </div>
      </div>
      <div className="card">
        <div className="sec-h" style={{ marginBottom: '0.857143rem' }}><h2>宛先</h2></div>
        <div className="kvgrid">
          <Kv l="法人名" v={r.company} /><Kv l="担当者" v={r.pic} /><Kv l="電話番号" v={r.tel} /><Kv l="郵便番号" v={r.zip} />
          <Kv l="住所" v={r.pref + r.city + r.town + (r.bld ? ' ' + r.bld : '')} />
        </div>
      </div>
      <div className="card">
        <div className="sec-h" style={{ marginBottom: '0.857143rem' }}><h2>商品と数量</h2></div>
        <div className="tbl-wrap">
          <table className="tbl">
            <thead><tr><th>品番</th><th>商品</th><th className="num">数量</th></tr></thead>
            <tbody>
              {r.items.map((i) => <tr key={i.pid}><td className="mono">{i.pid}</td><td>{prod(i.pid)?.name ?? i.pid}</td><td className="num">{i.qty}</td></tr>)}
              <tr><td colSpan={2}><b>合計</b></td><td className="num"><b>{qty}</b></td></tr>
            </tbody>
          </table>
        </div>
      </div>
      <div className="card">
        <div className="sec-h" style={{ marginBottom: '0.857143rem' }}><h2>配送ルートと日程</h2></div>
        <div className="kvgrid">
          <Kv l="ピッキング倉庫" v={r.wh} /><Kv l="配送会社" v={r.routeCarrier} /><Kv l="中継先" v={r.routeHub} /><Kv l="リードタイム" v={r.lead + '日'} />
          <Kv l="納品日" v={smSlW(r.deliv)} />
          <Kv l="発送日" v={<>{smSlW(r.ship)}{r.note ? <> <span className="badge b-warn" title={r.note}>前倒し</span><div className="txt-warn" style={{ fontSize: '0.857143rem' }} title={r.note}>{r.why}のため</div></> : null}</>} />
          <Kv l="出荷週" v={smWeekLabel(r.week)} />
        </div>
      </div>
      <div className="card">
        <div className="sec-h" style={{ marginBottom: '0.857143rem' }}><h2>出荷指示と送り状</h2></div>
        <div className="kvgrid">
          <Kv l="出荷指示番号" v={smOrderTxt(r)} c={r.status === '締め後追加' ? 'txt-warn' : r.status === '締め済' ? 'txt-ok' : ''} />
          <Kv l="送り状番号" v={r.trackingNo} />
        </div>
        <div style={{ marginTop: '0.857143rem' }}><Kv l="メモ" v={r.memo ? <span style={{ whiteSpace: 'pre-wrap' }}>{r.memo}</span> : ''} /></div>
      </div>
      <div className="card">
        <div className="sec-h" style={{ marginBottom: '0.857143rem' }}><h2>変更履歴</h2></div>
        {hist.length ? (
          <div className="tbl-wrap">
            <table className="tbl">
              <thead><tr><th>日時</th><th>変更した人</th><th>項目</th><th>変更前</th><th>変更後</th></tr></thead>
              <tbody>{hist.map((h, i) => <tr key={i}><td>{fmtDateTime(h.at)}</td><td>{h.by}</td><td>{h.field}</td><td>{h.before || '（なし）'}</td><td>{h.after || '（なし）'}</td></tr>)}</tbody>
            </table>
          </div>
        ) : <p className="muted" style={{ margin: 0 }}>変更履歴はまだありません。</p>}
      </div>
    </>
  );
}
