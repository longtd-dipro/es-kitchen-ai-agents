'use client';

import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { DEMO } from '@/lib/demo';
import { api } from '@/lib/ops/purchasing/client';
import { TODAY, WH, iso, prod } from '@/lib/ops/purchasing/master';
import { wsAll, wsState, wsType } from '@/lib/ops/purchasing/stock';
import { Icon } from '../../_ui/Icon';
import { OpsCsvExport, stateCsvFilters, tupleCols } from '../../_ui/csv';
import { useOps } from '../../_ui/OpsProvider';
import { useCanAct } from '../../_ui/perm';
import { Field, PageHead } from '../../_ui/ui';
import { Box } from '../_components/common';
import { applyList, FilterBlock, ListTable, useList, type Col, type Filter } from '../_components/List';
import { About, Signed, stockId } from '../_components/stock';
import { useStockData } from '../_components/usePo';
import { DateInput } from '@/components/DateInput';
import { fmtAuto, fmtDate, fmtMd } from '@/lib/format/date';

/* 倉庫在庫（フェーズ2：見るだけ・記録するだけ。決定 W1〜W7）。元のデモの renderWhs */

function ImportModal() {
  const { closeModal, toast, toastError } = useOps();
  const { stock } = useStockData();
  const [d, setD] = useState(iso(TODAY()));
  const run = async () => {
    const date = d.replace(/-/g, '/') || TODAY();
    if (date > TODAY()) { toast('棚卸し日に未来の日付は選べません'); return; }
    if (!stock) return;
    try {
      await api.action('importStock', { date });
      closeModal();
      toast(`THOMAS在庫（${fmtDate(date)} 棚卸し分）を取り込みました`);
    } catch (e) { toastError(e); }
  };
  return (
    <Box title="THOMAS在庫を取り込む" width={640} footer={<><button className="btn lg ghost" onClick={closeModal}>キャンセル</button><button className="btn pri lg" onClick={run}>取り込む</button></>}>
      <p className="muted" style={{ margin: '0 0 0.857143rem' }}>倉庫から届く在庫状況（棚卸し後）の CSV を取り込みます。取り込むと、その日までの在庫の記録は在庫に反映済みとして扱い、見込み在庫の起点が新しい在庫になります。</p>
      <div className="fg c2">
        <Field label="ファイル" req><input className="inp" type="file" accept=".csv" aria-label="CSVファイル" /></Field>
        <Field label="棚卸し日" req htmlFor="wi-date"><DateInput className="inp" id="wi-date" value={d} onChange={(e) => setD(e.target.value)} /></Field>
      </div>
      {DEMO && <div className="notice warn" style={{ marginTop: '0.857143rem' }}><Icon name="warn" /><span>デモではファイルを読みません。棚卸し日の終わりの在庫（入荷の記録−出荷±在庫の記録）を THOMAS の数として取り込みます。</span></div>}
    </Box>
  );
}

export default function StockPage() {
  const router = useRouter();
  const { openModal } = useOps();
  const canAct = useCanAct();
  const { stock } = useStockData();
  const [st, set] = useList('whs');
  const all = useMemo(() => (stock ? wsAll(stock) : []), [stock]);
  if (!stock) return <div className="card"><div className="empty">読み込み中…</div></div>;
  const imp = stock.state.imp;
  const filters: Filter[] = [{ t: 'select', ph: '倉庫（すべて）', col: 'wh', opts: WH }, { t: 'search', ph: '品番・商品名', span: 2, keys: ['pidS', 'name'] }, { t: 'select', ph: '状態', col: 'state', opts: ['不足見込み', '余り見込み', '過不足なし'] }, { t: 'select', ph: '区分', col: 'type', opts: ['通常', '短消費期限'] }, { t: 'select', ph: '保管方法', col: 'keep', opts: ['冷蔵', '冷凍', '常温'] }, { t: 'select', ph: 'カテゴリ', col: 'cat', opts: [...new Set(all.map((c) => prod(c.pid)?.cat ?? ''))].filter(Boolean).sort((a, b) => a.localeCompare(b, 'ja')) }];
  const rows = applyList(st, all.map((c) => { const p = prod(c.pid)!; return { ...c, id: c.wh + '|' + c.pid, pidS: c.pid, name: p.name, type: wsType(p.short), keep: p.keep, cat: p.cat, state: wsState(c) }; }));
  const nShort = all.filter((c) => c.shortDate).length;
  const nLeft = all.filter((c) => !c.shortDate && c.fin > 0).length;
  const nRec = stock.recs.filter((r) => r.date > imp.date).length;
  const cols: Col[] = [['pidS', '品番'], ['name', '商品名'], ['type', '区分'], ['keep', '保管方法'], ['wh', '倉庫'], ['base', 'THOMAS在庫', 'num'], ['inQ', '入荷予定', 'num'], ['outQ', '出荷予定', 'num'], ['recQ', 'ES記録', 'num'], ['fin', '見込み在庫', 'num'], ['state', '状態']];
  const cell = (c: Col, r: (typeof rows)[number]) => {
    const k = c[0];
    if (k === 'pidS') return <td className="mono">{r.pid}</td>;
    if (k === 'name') return <td><button className="lnk u" onClick={() => router.push(stockId(r.wh, r.pid))}>{r.name}</button></td>;
    if (k === 'type') return <td>{r.type === '短消費期限' ? <span className="badge b-warn">短消費期限</span> : <span className="muted">通常</span>}</td>;
    if (k === 'base') return <td className="num"><b>{r.base ? r.base.toLocaleString() : <span className="muted">0</span>}</b></td>;
    if (k === 'inQ') return <td className="num"><Signed v={r.inQ} plus="txt-ok" /></td>;
    if (k === 'outQ') return <td className="num"><Signed v={r.outQ} /></td>;
    if (k === 'recQ') return <td className="num"><Signed v={r.recQ} plus="txt-ok" /></td>;
    if (k === 'fin') return <td className="num"><b className={r.fin < 0 ? 'txt-ng' : ''}>{r.fin.toLocaleString()}</b></td>;
    if (k === 'state') return <td>{r.shortDate ? <><span className="badge b-ng">不足見込み</span> <span style={{ fontSize: '0.857143rem' }}>{fmtMd(r.shortDate)}〜</span></> : r.fin > 0 ? <span className="badge b-info">余り見込み</span> : <span className="badge b-mute">過不足なし</span>}</td>;
    return <td>{fmtAuto((r as Record<string, unknown>)[k] ?? '')}</td>;
  };
  const kb = (v: string, label: string, cnt: number, unit: string, cls = '') => (
    <button className={`kpi${st.f.state === v ? ' on' : ''}`} aria-pressed={st.f.state === v} onClick={() => set((s) => ({ ...s, f: { ...s.f, state: s.f.state === v ? '' : v }, page: 1 }))}>
      <small>{label}</small><b className={cls}>{cnt}<span style={{ fontSize: '0.928571rem' }}>{unit}</span></b>
    </button>
  );
  return (
    <>
      <PageHead crumbs={['発注・入荷', '倉庫在庫']} title="倉庫在庫">
        <OpsCsvExport<(typeof rows)[number]> screen="倉庫在庫" filters={stateCsvFilters(st, filters)} rows={rows}
          columns={[{ label: '倉庫', get: (r) => r.wh }, ...tupleCols<(typeof rows)[number]>(cols.filter((c) => c[0] !== 'wh'), (r, k) => (k === 'pidS' ? r.pid : (r as Record<string, unknown>)[k])),
            { label: 'カテゴリ', get: (r) => r.cat }, { label: '不足になる日', get: (r) => r.shortDate ?? '' }]} />
        <button className="btn out lg" onClick={() => router.push('/ops/purchasing/stock/records')}>在庫の記録</button>
        <button className="btn out lg" onClick={() => router.push('/ops/purchasing/stock/returns')}>在庫戻しの出荷指示</button>
        {canAct(api, 'importStock') && <button className="btn pri lg" onClick={() => openModal(<ImportModal />)}><Icon name="down" />THOMAS在庫を取り込む</button>}
      </PageHead>
      <div className="card">
        <About lead={<><b>正しい在庫は THOMAS（倉庫システム）です。</b>ここに出す見込み在庫は参考値で、引き当てや出荷の停止はしません。</>}
          more={<>THOMAS の在庫（棚卸し後）を取り込み、ESステーションを通る入荷・出荷・在庫の記録を足し引きして<b>見込み在庫</b>を出します。入荷は入荷登録の記録（実績）と、本発注済で入荷が終わっていない発注の残り（予定。仕入先サイトの発注・代替品の追加発注も含む）。出荷は配送データの便の予定数（出荷日）です。入荷登録・代替品設定・発注一覧と同じ数です。今日：{TODAY()}</>} />
        <div className="kpis">
          <div><small>THOMAS在庫</small><b style={{ fontSize: '1.142857rem' }}>{fmtDate(imp.date)} 棚卸し分</b><span className="muted" style={{ fontSize: '0.857143rem' }}>{imp.file}／{imp.by}</span></div>
          {kb('不足見込み', '不足見込み（押すと絞り込み）', nShort, '商品', nShort ? 'txt-ng' : '')}
          {kb('余り見込み', '余り見込み（在庫戻しの候補）', nLeft, '商品')}
          <button className="kpi" onClick={() => router.push('/ops/purchasing/stock/records')}><small>取り込み後の在庫の記録</small><b>{nRec}<span style={{ fontSize: '0.928571rem' }}>件</span></b></button>
        </div>
        <FilterBlock st={st} set={set} filters={filters} cols={cols} />
        <ListTable st={st} set={set} cols={cols} rows={rows} cell={cell} noNo rowKey={(r) => r.id} />
      </div>
    </>
  );
}
