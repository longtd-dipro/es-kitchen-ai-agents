'use client';

import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { DEMO } from '@/lib/demo';
import { api } from '@/lib/ops/purchasing/client';
import { IN_MENU, MONTHS, TODAY, WH, WH_ROWS, iso, prod } from '@/lib/ops/purchasing/master';
import { smYmL } from '@/lib/ops/purchasing/samples';
import { wsAll } from '@/lib/ops/purchasing/stock';
import { addDays } from '@/lib/supplier/dates';
import { Icon } from '../../../_ui/Icon';
import { OpsCsvExport, stateCsvFilters, tupleCols } from '../../../_ui/csv';
import { useOps } from '../../../_ui/OpsProvider';
import { useCanAct } from '../../../_ui/perm';
import { Field } from '../../../_ui/ui';
import { applyList, FilterBlock, ListTable, useList, type Col, type Filter } from '../../_components/List';
import { About, stockId, WsHead, ymdW } from '../../_components/stock';
import { useStockData } from '../../_components/usePo';
import { DateInput } from '@/components/DateInput';
import { fmtAuto, fmtDateTime } from '@/lib/format/date';

/* 在庫戻しの出荷指示（初期値＝決定 W6・送り先＝倉庫マスタの返送先 W7）。元のデモの renderWhsRet */

const dest = () => { const r = WH_ROWS.find((w) => w.kind === '返送先' && w.status === '有効'); return r ? `${r.id} ${r.name}` : 'ESキッチン 本社'; };

export default function StockReturnsPage() {
  const router = useRouter();
  const { toast, toastError } = useOps();
  const canAct = useCanAct();
  const { stock } = useStockData();
  const [st, set] = useList('whsret');
  const [sel, setSel] = useState<Set<string> | null>(null);
  const [qty, setQty] = useState<Record<string, number>>({});
  const [date, setDate] = useState(iso(addDays(TODAY(), 1)));
  const [busy, setBusy] = useState(false);
  const cand = useMemo(() => (stock ? wsAll(stock).filter((c) => !c.shortDate && c.fin > 0) : null), [stock]);
  if (!cand || !stock) return <div className="card"><div className="empty">読み込み中…</div></div>;
  /* 次のメニュー＝共通データの次のサイクル月の月間メニュー（なければ見本のメニュー） */
  const nextYm = stock.nextMenu?.ym ?? MONTHS[0];
  const nextUse = (pid: string) => (stock.nextMenu?.ids ?? IN_MENU[MONTHS[0]] ?? []).includes(pid);
  /* 次のメニューで使わない商品は余り全部・選択済み、使う商品は 0・未選択で始める（W6） */
  const init = () => {
    const s = new Set<string>();
    const q: Record<string, number> = {};
    cand.forEach((c) => { const id = c.wh + '|' + c.pid; if (nextUse(c.pid)) q[id] = 0; else { q[id] = c.fin; s.add(id); } });
    return { s, q };
  };
  const cur = sel ?? init().s;
  const curQ = sel ? qty : { ...init().q, ...qty };
  const all = cand.map((c) => { const id = c.wh + '|' + c.pid; const p = prod(c.pid)!; return { ...c, id, name: p.name, keep: p.keep, short: p.short, next: nextUse(c.pid) ? '使う' : '使わない' }; })
    .sort((a, b) => (a.next === '使わない' ? 0 : 1) - (b.next === '使わない' ? 0 : 1));
  const filters: Filter[] = [{ t: 'select', ph: '倉庫（すべて）', col: 'wh', opts: WH }, { t: 'select', ph: '保管方法', col: 'keep', opts: ['冷蔵', '冷凍', '常温'] }, { t: 'select', ph: '次のメニュー', col: 'next', opts: ['使わない', '使う'] }, { t: 'search', ph: '品番・商品名', keys: ['pid', 'name'] }];
  const rows = applyList(st, all, filters);
  const cols: Col[] = [['_sel', ''], ['pid', '品番'], ['name', '商品名'], ['wh', '倉庫'], ['keep', '保管方法'], ['fin', '見込み在庫（余り）', 'num'], ['next', '次のメニュー'], ['_qty', '戻す数']];
  const toggle = (id: string, on: boolean) => { const s = new Set(cur); if (on) s.add(id); else s.delete(id); setSel(s); if (!sel) setQty(curQ); };
  const cell = (c: Col, r: (typeof all)[number]) => {
    const k = c[0];
    if (k === '_sel') return <td style={{ width: '2.714286rem' }}><input type="checkbox" checked={cur.has(r.id)} onChange={(e) => toggle(r.id, e.target.checked)} aria-label={`${r.name}を選択`} /></td>;
    if (k === 'pid') return <td className="mono">{r.pid}</td>;
    if (k === 'name') return <td><button className="lnk u" onClick={() => router.push(stockId(r.wh, r.pid))}>{r.name}</button>{r.short && <> <span className="badge b-warn">短消費期限</span></>}</td>;
    if (k === 'fin') return <td className="num"><b>{r.fin.toLocaleString()}</b></td>;
    if (k === 'next') return <td>{r.next === '使わない' ? <span className="badge b-warn">{smYmL(nextYm)} メニューで使わない</span> : <span className="muted">—</span>}</td>;
    if (k === '_qty') return <td style={{ width: '7.857143rem' }}><input className="inp" type="number" min={0} max={r.fin} value={curQ[r.id] ?? 0} aria-label="戻す数" onChange={(e) => { setQty({ ...curQ, [r.id]: Math.max(0, +e.target.value || 0) }); if (!sel) setSel(cur); }} /></td>;
    return <td>{fmtAuto((r as Record<string, unknown>)[k] ?? '')}</td>;
  };
  const nQty = [...cur].reduce((s, id) => s + (+curQ[id] || 0), 0);
  const run = async () => {
    if (!date) { toast('出荷日を入れてください'); return; }
    const lines = [...cur].map((id) => { const [wh, pid] = id.split('|'); const c = cand.find((x) => x.wh === wh && x.pid === pid); return { wh, pid, qty: Math.min(c?.fin ?? 0, +curQ[id] || 0) }; }).filter((l) => l.qty > 0);
    if (!lines.length) { toast('選んだ商品の戻す数を入れてください'); return; }
    setBusy(true);
    try {
      const no = await api.action('createReturn', { date, to: dest(), lines });
      setSel(null); setQty({});
      toast(`出荷指示 ${no} を作成しました（${lines.length}商品）。THOMAS用CSVを出力しました${DEMO ? '（デモ）' : ''}`);
    } catch (e) { toastError(e); } finally { setBusy(false); }
  };
  return (
    <>
      <WsHead last="在庫戻しの出荷指示" title="在庫戻しの出荷指示">
        <OpsCsvExport<(typeof all)[number]> screen="在庫戻しの候補" filters={stateCsvFilters(st, filters)} rows={rows}
          columns={[...tupleCols<(typeof all)[number]>(cols), { label: '短消費期限(1=対象)', type: 'bool', get: (r) => !!r.short }, { label: '戻す数（入力中）', type: 'int', get: (r) => (cur.has(r.id) ? curQ[r.id] ?? 0 : 0) }]} />
        {canAct(api, 'createReturn') && <button className="btn pri lg" disabled={!cur.size || busy} onClick={run}>出荷指示を作成（THOMAS用CSV）</button>}
      </WsHead>
      <div className="card">
        <About lead="棚卸し後、次のメニューで使わない商品を返送先（本社）へ戻すための出荷指示です。発注は伴いません。"
          more={<>作成すると THOMAS 用の CSV を出力し、倉庫在庫に「在庫戻し」として記録します（2026-09-30 決定）。候補は見込み在庫が余る商品です。<b>次のメニューで使わない商品は余り全部・選択済み、使う商品は 0・未選択</b>で始まります（2026-10-01 決定 W6）。送り先は倉庫マスタの「返送先」です（W7）。</>} />
        <div className="fg c2" style={{ marginBottom: '0.857143rem' }}>
          <Field label="出荷日" req htmlFor="wr-date"><DateInput className="inp" id="wr-date" value={date} onChange={(e) => setDate(e.target.value)} /><span className="hint">{ymdW(date)}</span></Field>
          <Field label="送り先（倉庫マスタの返送先）"><input className="inp" disabled value={dest()} /></Field>
        </div>
        <FilterBlock st={st} set={set} filters={filters} cols={cols} />
        <ListTable st={st} set={set} cols={cols} rows={rows} cell={cell} noNo rowKey={(r) => r.id} />
        <p className="muted" style={{ fontSize: '0.857143rem', margin: '0.571429rem 0 0' }}>{cur.size}商品・{nQty}個を選択中。次のメニューで使う商品も、選んで数を入れれば戻せます。</p>
      </div>
      <div className="card">
        <div className="sec-h" style={{ marginBottom: '0.857143rem' }}><h2>作成した出荷指示</h2></div>
        <div className="tbl-wrap">
          <table className="tbl">
            <thead><tr><th>出荷指示番号</th><th>作成日時</th><th>出荷日</th><th>数量</th><th>内容</th><th>送り先</th><th>CSV</th></tr></thead>
            <tbody>
              {stock.rets.length ? stock.rets.slice().reverse().map((r) => (
                <tr key={r.no}>
                  <td className="mono">{r.no}</td><td>{fmtDateTime(r.at)}</td><td>{ymdW(r.date)}</td><td>{r.lines.length}商品／{r.lines.reduce((s, l) => s + l.qty, 0)}個</td>
                  <td className="ws-l" style={{ fontSize: '0.928571rem' }}>{r.lines.map((l) => `${prod(l.pid)?.name ?? l.pid}（${l.wh} ${l.qty}）`).join('、')}</td>
                  <td>{r.to}</td>
                  <td><button className="btn sm ghost" onClick={() => toast(`THOMAS用CSV（${r.no}.csv）をダウンロードしました${DEMO ? '（デモ）' : ''}`)}><Icon name="down" />CSV</button></td>
                </tr>
              )) : <tr><td colSpan={7} className="empty">まだ出荷指示はありません</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
