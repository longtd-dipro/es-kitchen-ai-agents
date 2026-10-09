'use client';

import { useRouter } from 'next/navigation';
import { useStock } from '@/lib/ops/purchasing/client';
import { WH, prod } from '@/lib/ops/purchasing/master';
import { WS_KINDS } from '@/lib/ops/purchasing/stock';
import { Icon } from '../../../_ui/Icon';
import { OpsCsvExport, OpsCsvImport, stateCsvFilters } from '../../../_ui/csv';
import { useOps } from '../../../_ui/OpsProvider';
import { applyList, FilterBlock, ListTable, useList, type Col, type Filter } from '../../_components/List';
import { About, KindBadge, RecModal, stockId, WsHead } from '../../_components/stock';
import { fmtAuto, fmtDateTime } from '@/lib/format/date';

/** 在庫の記録（記録の一覧＋入力はモーダル・決定 W1＝A）。元のデモの renderWhsRec */
export default function StockRecordsPage() {
  const router = useRouter();
  const { openModal } = useOps();
  const { data } = useStock();
  const [st, set] = useList('whsrec');
  if (!data) return <div className="card"><div className="empty">読み込み中…</div></div>;
  const impDate = data.state.imp.date;
  const all = data.recs.slice().sort((a, b) => (b.date < a.date ? -1 : b.date > a.date ? 1 : b.no < a.no ? -1 : 1))
    .map((r) => ({ ...r, name: prod(r.pid)?.name ?? r.pid, ym: r.date.slice(0, 7), refl: r.date <= impDate ? 'THOMAS取込で反映済' : '見込みに反映中' }));
  const months = [...new Set(data.recs.map((r) => r.date.slice(0, 7)))].sort().reverse();
  const filters: Filter[] = [{ t: 'select', ph: '倉庫（すべて）', col: 'wh', opts: WH }, { t: 'select', ph: '区分（すべて）', col: 'kind', opts: WS_KINDS }, { t: 'select', ph: '期間（月）', col: 'ym', opts: months }, { t: 'search', ph: '記録番号・商品名・理由', keys: ['no', 'name', 'reason'] }, { t: 'range', ph: '日付', col: 'date' }];
  const rows = applyList(st, all, filters);
  const cols: Col[] = [['no', '記録番号'], ['date', '日付'], ['wh', '倉庫'], ['name', '商品'], ['kind', '区分'], ['qty', '数量', 'num'], ['reason', '理由'], ['by', '登録者'], ['refl', '反映']];
  const cell = (c: Col, r: (typeof all)[number]) => {
    const k = c[0];
    if (k === 'no') return <td className="mono">{r.no}</td>;
    if (k === 'name') return <td><button className="lnk u" onClick={() => router.push(stockId(r.wh, r.pid))}>{r.name}</button></td>;
    if (k === 'kind') return <td><KindBadge k={r.kind} /></td>;
    if (k === 'qty') return <td className={`num ${r.qty > 0 ? 'txt-ok' : ''}`}>{r.qty > 0 ? '+' : '−'}{Math.abs(r.qty)}</td>;
    if (k === 'reason') return <td className="ws-l" style={{ fontSize: '0.928571rem', minWidth: '15.714286rem' }}>{r.reason}</td>;
    if (k === 'by') return <td>{r.by}<br /><span className="muted" style={{ fontSize: '0.857143rem' }}>{fmtDateTime(r.at)}</span></td>;
    if (k === 'refl') return <td>{r.date <= impDate ? <span className="muted">THOMAS取込で反映済</span> : <span className="badge b-info">見込みに反映中</span>}</td>;
    return <td>{fmtAuto((r as Record<string, unknown>)[k] ?? '')}</td>;
  };
  return (
    <>
      <WsHead last="在庫の記録" title="在庫の記録">
        {/* CSV取込（画面 …/import。足すだけ・lib/csv/data.ts の stockMoves）と、検索条件のとおりの全件の出力（取込と同じ列） */}
        <OpsCsvImport href="/ops/purchasing/stock/records/import" />
        <OpsCsvExport<(typeof all)[number]> screen="在庫の記録" filters={stateCsvFilters(st, filters)} rows={rows} entity="stockMoves" keys={(r) => r.no} />
        <button className="btn pri lg" onClick={() => openModal(<RecModal />)}><Icon name="plus" />記録を追加</button>
      </WsHead>
      <div className="card">
        <About lead={<>ESステーションを通らない倉庫の出し入れ（NG品ロス・棚卸し差異・再送・ES外発注の入荷など）の記録です。<b>THOMAS の数は書き換えません。</b></>}
          more="記録は見込み在庫の計算にだけ使います。THOMAS在庫を取り込むと、棚卸し日までの記録は「THOMAS取込で反映済」になります。入力は「記録を追加」から（倉庫在庫の詳細の「この商品を記録」でも同じ入力画面が、倉庫・商品を入れた状態で開きます）。" />
        <FilterBlock st={st} set={set} filters={filters} cols={cols} />
        <ListTable st={st} set={set} cols={cols} rows={rows} cell={cell} noNo rowKey={(r) => r.no} />
      </div>
    </>
  );
}
