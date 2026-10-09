'use client';

import { useMemo, useState } from 'react';
import { useDomainQuery } from '@/lib/domain/client';
import { defaultBb, etaOfPo, itemKind, SPLIT_MAX } from '@/lib/domain/stock';
import type { Receipt } from '@/lib/domain/types';
import { TODAY, iso, pname, slash, supName } from '@/lib/ops/purchasing/master';
import { lotOf } from '@/lib/ops/purchasing/stock';
import { disp } from '@/lib/ops/purchasing/labels';
import type { POrder } from '@/lib/ops/purchasing/types';
import { Icon } from '../../_ui/Icon';
import { OpsCsvExport, OpsCsvImport } from '../../_ui/csv';
import { useOps } from '../../_ui/OpsProvider';
import { useCanAct } from '../../_ui/perm';
import { PageHead } from '../../_ui/ui';
import { Info } from '../_components/common';
import { applyList, FilterBlock, useList, type Col, type Filter } from '../_components/List';
import { closePo, OPS_ID, poLike, ReceiptBadge, ResolveModal, stockApi, useReceiptAlerts } from '../_components/receipts';
import { usePo } from '../_components/usePo';
import { DateInput } from '@/components/DateInput';
import { fmtDate } from '@/lib/format/date';

/*
 * 入荷登録（課題 2-3・2026/10/02 決定）。倉庫にはアカウントがないので、システム管理（運営）が発注・分納の回ごとに
 * 入荷した商品の数と箱数を入れる。THOMAS の入荷実績 CSV は使わない（入荷指示 CSV は今までどおり出す）。
 * 発注の数と違えば「差異あり・対応待ち」で保存し、対応（分納を待つ／代替品で対応／不足を受け入れる）を選ぶまで運営の TOP・発注の一覧にアラートを出す。
 * 入荷の記録は共通データ（dm.stock.receipts）。倉庫在庫（入荷−出荷）・代替品設定の在庫の見込みにも使う。
 */
type Input = { qty: string; box: string; note: string };
type Err = { qty?: string; box?: string };
type Row = { o: POrder; st: { got: number; remain: number; part: number; open: boolean; closed: boolean; nextOn: string; receipts: Receipt[] }; due: string; state: string; no: string; name: string; sup: string; wh: string };
/* 並べ替えの項目（初期の並びは 入荷予定日の昇順 → 発注番号：台帳 I・2026-10-07） */
const COLS: Col[] = [['due', '入荷予定日'], ['no', '発注番号'], ['sup', '仕入先'], ['name', '商品'], ['wh', '納入倉庫'], ['state', '状態']];
const STATES = ['未入荷', '差異あり・対応待ち', '分納待ち', '入荷済'];
const errStyle = { color: 'var(--ng, #c0392b)' } as const;

export default function ReceivingPage() {
  const { openModal, toast, toastError, account } = useOps();
  const canAct = useCanAct();
  /* 権限がなければ入荷の登録・差異の対応を出さない */
  const canReceive = canAct(stockApi, 'receive'), canResolve = canAct(stockApi, 'resolve');
  const { orders } = usePo();
  const [st, setList] = useList('receiving');
  const setPage = (page: number) => setList({ page });
  const [inp, setInp] = useState<Record<string, Partial<Input>>>({});
  const [errs, setErrs] = useState<Record<string, Err>>({});
  /* 入荷日は一括登録の欄で1回だけ入れる（初期は今日・今日以前だけ。台帳 I・2026-10-08） */
  const [recvOn, setRecvOn] = useState(iso(TODAY()));
  const [onErr, setOnErr] = useState('');
  const [busy, setBusy] = useState(false);
  const pos = useMemo(() => (orders ?? []).filter((o) => o.hon > 0 && !['キャンセル', '受注不可'].includes(o.ans)), [orders]);
  const { data: rv } = useDomainQuery(stockApi, 'receiving', { orders: pos.map(poLike) });
  const { data: al } = useReceiptAlerts();
  if (!orders || !rv) return <div className="card"><div className="empty">読み込み中…</div></div>;
  const stOf = new Map(rv.map((x) => [x.no, x]));
  const all: Row[] = pos.flatMap((o) => {
    const s = stOf.get(o.no);
    if (!s) return [];
    const state = s.open ? '差異あり・対応待ち' : s.closed ? '入荷済' : s.nextOn ? '分納待ち' : '未入荷';
    return [{ o, st: s, due: s.nextOn || etaOfPo(poLike(o)), state, no: o.no, name: pname(o.pid), sup: supName(o.sup), wh: o.wh }];
  }).sort((a, b) => a.due.localeCompare(b.due) || a.no.localeCompare(b.no));
  /* 状態を選ばないときは入荷済み以外（と今日入荷済みにしたもの） */
  const base = st.f.state ? all : all.filter((r) => r.state !== '入荷済' || r.st.receipts.some((x) => x.receivedOn === TODAY()));
  const FILTERS: Filter[] = [
    { t: 'search', ph: '発注番号・商品・仕入先で検索', keys: ['no', 'name', 'sup'], span: 2 },
    { t: 'range', ph: '入荷予定日', col: 'due' },
    { t: 'select', ph: '納入倉庫（すべて）', col: 'wh', opts: [...new Set(all.map((r) => r.wh))].sort() },
    { t: 'select', ph: '入荷の状態（入荷済み以外）', col: 'state', opts: STATES },
  ];
  const filtered = applyList(st, base, FILTERS);
  /* CSV出力は絞り込みの全件（ページで切らない） */
  const total = filtered.length;
  const pages = Math.max(1, Math.ceil(total / st.size));
  const pg = Math.min(st.page, pages);
  const rows = filtered.slice((pg - 1) * st.size, pg * st.size);
  const key = (r: Row) => r.o.no;
  const planBox = (r: Row) => Number(r.o.parts[r.st.receipts.length]?.box) || Math.ceil(r.st.remain / lotOf(r.o.pid));
  /* 賞味期限／消費期限は表示のみ（仕入先が本発注の承認で入れた期限。運営が発注で入れた希望の期限があればそれ。台帳 I・2026-10-08） */
  const bbOf = (r: Row) => fmtDate(r.o.wishBB || defaultBb(r.o, r.st.receipts.length)) || '—';
  const val = (r: Row, k: keyof Input) => inp[key(r)]?.[k] ?? '';
  const set = (r: Row, k: keyof Input, v: string) => {
    setInp({ ...inp, [key(r)]: { ...inp[key(r)], [k]: v } });
    if (errs[key(r)]) setErrs({ ...errs, [key(r)]: { ...errs[key(r)], [k]: undefined } });
  };
  /* 入れた行（数か箱数を入れた行）をまとめて登録する。ひとつでもエラーがあれば何も保存せず、エラーの欄を赤く出す */
  const entered = all.filter((r) => !['入荷済', '差異あり・対応待ち'].includes(r.state) && (val(r, 'qty') !== '' || val(r, 'box') !== ''));
  const saveAll = async () => {
    const on = slash(recvOn) || TODAY();
    setOnErr(on > TODAY() ? '入荷日は今日以前の日付で入力してください。' : '');
    const e: Record<string, Err> = {};
    for (const r of entered) {
      const q = val(r, 'qty'), b = val(r, 'box'), er: Err = {};
      if (q === '') er.qty = '入荷した数は必須項目です。'; else if (!Number.isInteger(+q) || +q < 0) er.qty = '入荷した数は数値で入力してください。'; else if (+q > 999999) er.qty = '入荷した数は999,999以下で入力してください。';
      if (b === '') er.box = '箱数は必須項目です。'; else if (!Number.isInteger(+b) || +b < 0) er.box = '箱数は数値で入力してください。'; else if (+b > 999999) er.box = '箱数は999,999以下で入力してください。';
      if (er.qty || er.box) e[key(r)] = er;
    }
    setErrs(e);
    if (Object.keys(e).length || on > TODAY()) { toast('入力エラーがあります。直してから保存してください。'); return; }
    setBusy(true);
    let ok = 0; const diffs: { rc: Receipt; r: Row }[] = [];
    try {
      for (const r of entered) {
        const out = await stockApi.action('receive', { po: poLike(r.o), poNo: r.o.no, qty: +val(r, 'qty'), box: +val(r, 'box'), receivedOn: on, bb: slash(bbOf(r) === '—' ? '' : bbOf(r)), note: val(r, 'note'), by: account?.id ?? OPS_ID });
        if (out.closePo) await closePo(r.o.no, on, orders);
        setInp((m) => { const x = { ...m }; delete x[key(r)]; return x; });
        ok++;
        if (out.receipt.status !== '一致') diffs.push({ rc: out.receipt, r });
      }
      if (diffs.length) {
        toast(`${ok}件のうち${diffs.length}件は差異あり・対応待ちで保存しました。`);
        /* 差異が複数あるときは、1件ずつ続けて対応を開く（閉じると次の行） */
        const chain = (i: number) => openModal(<ResolveModal rc={diffs[i].rc} po={diffs[i].r.o} orders={orders} next={i + 1 < diffs.length ? () => chain(i + 1) : undefined} />);
        chain(0);
      } else toast(`入荷を登録しました（${ok}件）。`);
    } catch (e2) { toastError(e2); } finally { setBusy(false); }
  };
  const resolve = (r: Row) => {
    const rc = r.st.receipts.find((x) => x.status === '差異あり・対応待ち');
    if (rc) openModal(<ResolveModal rc={rc} po={r.o} orders={orders} />);
  };
  return (
    <>
      <PageHead crumbs={['発注・入荷', '入荷登録']} title="入荷登録">
        {/* CSV取込：多くの発注の入荷をまとめて登録（画面 …/import。lib/csv/data.ts の receiving・stock.receive と同じ確かめ）。CSV出力は絞り込みの全件。入荷指示 CSV（THOMAS）は今までどおり */}
        <OpsCsvImport href="/ops/purchasing/receiving/import" />
        <OpsCsvExport<Row> screen="入荷登録" rows={filtered} source={{ kind: 'orders', id: (r) => r.o.no }}
          filters={[{ label: '入荷予定日', value: [st.f['due@from'], st.f['due@to']].filter(Boolean).join('〜') }, { label: '納入倉庫', value: st.f.wh ?? '' }, { label: '入荷の状態', value: st.f.state ?? '' }]}
          columns={[
            { label: '発注番号', get: (r) => r.o.no }, { label: '入荷予定日', get: (r) => r.due }, { label: '仕入先', get: (r) => supName(r.o.sup) }, { label: '品番', get: (r) => r.o.pid },
            { label: '商品名', get: (r) => pname(r.o.pid) }, { label: '納入倉庫', get: (r) => r.o.wh }, { label: '予定の数', type: 'int', get: (r) => r.st.remain }, { label: '入荷済みの数', type: 'int', get: (r) => r.st.got },
            { label: '回', get: (r) => `${r.st.part}/${SPLIT_MAX}` }, { label: '入荷の状態', get: (r) => r.state },
          ]} />
        <button className="btn csv lg" onClick={() => toast('入荷指示（THOMAS）の CSV を出力しました')}><Icon name="down" />入荷指示 CSV（THOMAS）</button>
      </PageHead>
      {al && al.count > 0 && (
        <Info kind="ng">入荷の差異の対応待ちが <b>{al.pending.length}件</b>{al.late.length ? <>、分納の入荷予定日を過ぎたものが <b>{al.late.length}件</b></> : null}あります（{[...al.pending, ...al.late].map((x) => x.poNo).join('、')}）。「差異の対応」から対応を選んでください。</Info>
      )}
      <div className="card">
        <Info>倉庫にはアカウントがないため、<b>運営（システム管理）が入荷した商品の数と箱数を入れます</b>。入れた行を、上の<b>「保存」でまとめて登録</b>します。発注の数（分納の2回目からは残り）と同じなら入荷済み。違えば <b>差異あり・対応待ち</b> で保存し、影響する法人の注文・便を確かめて、<b>分納を待つ（{SPLIT_MAX}回まで）／代替品で対応／不足を受け入れる（③ 除外・請求しない・法人へ通知）</b> から選びます。賞味期限／消費期限は仕入先が入れたものを表示するだけです。</Info>
        <FilterBlock st={st} set={setList} filters={FILTERS} cols={COLS} />
        <div style={{ display: 'flex', gap: '0.857143rem', alignItems: 'center', flexWrap: 'wrap', margin: '0.857143rem 0' }}>
          <label htmlFor="rrecv" style={{ fontWeight: 700 }}>入荷日</label>
          <DateInput className="inp" id="rrecv" style={{ width: '12.142857rem' }} max={iso(TODAY())} value={recvOn} aria-invalid={!!onErr} onChange={(e) => { setRecvOn(e.target.value); setOnErr(''); }} />
          {onErr && <span className="hint" style={errStyle}>{onErr}</span>}
          <span className="hint">入れた行（{entered.length}件）の入荷日になります。今日以前の日だけ</span>
          <span style={{ flex: 1 }} />
          {canReceive && <button className="btn pri" disabled={busy || !entered.length} onClick={saveAll}>保存</button>}
        </div>
        <div className="tbl-wrap">
          <table className="tbl">
            <thead><tr><th>入荷予定日</th><th>仕入先</th><th>商品（仕入時の名前）／発注番号</th><th>納入倉庫</th><th className="num">予定 数</th><th className="num">予定 箱数</th><th>入荷の回</th><th>入荷した数</th><th>箱数</th><th>入荷日</th><th>賞味期限／消費期限</th><th>メモ</th><th>状態</th><th className="act">操作</th></tr></thead>
            <tbody>
              {rows.length ? rows.map((r) => {
                const done = r.state === '入荷済', open = r.state === '差異あり・対応待ち';
                const lot = lotOf(r.o.pid);
                const q = val(r, 'qty'), b = val(r, 'box'), er = errs[key(r)] ?? {};
                const boxWarn = q !== '' && b !== '' && lot > 1 && Math.abs(+b * lot - +q) >= lot;
                const last = r.st.receipts[r.st.receipts.length - 1];
                const nth = done || open ? r.st.receipts.length : r.st.part;
                return (
                  <tr key={key(r)} style={open ? { background: 'var(--ng-bg, #fff5f5)' } : undefined}>
                    <td>{r.due ? fmtDate(r.due) : '—'}{r.st.nextOn && <><br /><span className="hint">分納の次の回</span></>}</td>
                    <td>{supName(r.o.sup)}</td>
                    <td>{pname(r.o.pid)}<br /><span className="hint mono">{r.o.no}</span>{r.o.add && <> <span className="badge b-info">追加発注</span></>}</td>
                    <td>{r.o.wh}</td>
                    <td className="num">{done ? r.st.got.toLocaleString() : r.st.remain.toLocaleString()}{r.st.got > 0 && !done && <><br /><span className="hint">入荷済 {r.st.got}</span></>}</td>
                    <td className="num">{done ? '—' : `${planBox(r)}箱`}</td>
                    <td>{nth}回目{nth > 1 && <><br /><span className="hint">分納</span></>}</td>
                    {done || open ? (
                      <>
                        <td className="num">{last ? `${last.qty}個` : '—'}</td><td className="num">{last ? `${last.box}箱` : '—'}</td><td>{last ? fmtDate(last.receivedOn) : '—'}</td>
                      </>
                    ) : (
                      <>
                        <td style={{ width: '6.428571rem' }}><input className="inp" type="number" min={0} max={999999} value={q} aria-label="入荷した数" aria-invalid={!!er.qty} style={er.qty ? { borderColor: 'var(--ng, #c0392b)' } : undefined} onChange={(e) => set(r, 'qty', e.target.value)} />{er.qty && <span className="hint" style={errStyle}>{er.qty}</span>}</td>
                        <td style={{ width: '5.714286rem' }}><input className="inp" type="number" min={0} max={999999} value={b} aria-label="箱数" aria-invalid={!!er.box} style={er.box ? { borderColor: 'var(--ng, #c0392b)' } : undefined} onChange={(e) => set(r, 'box', e.target.value)} />{er.box && <span className="hint" style={errStyle}>{er.box}</span>}{boxWarn && <span className="hint" style={{ color: 'var(--warn)' }}>箱数×入り数と合わない</span>}</td>
                        <td>—</td>
                      </>
                    )}
                    <td>{bbOf(r)}</td>
                    {done || open ? <td style={{ minWidth: '10rem' }}>{last?.note || last?.fix?.note || ''}</td>
                      : <td style={{ minWidth: '10rem' }}><input className="inp" value={val(r, 'note')} placeholder="メモ" maxLength={60} onChange={(e) => set(r, 'note', e.target.value)} /></td>}
                    <td><ReceiptBadge st={r.state} />{last?.fix && <><br /><span className="hint">{last.fix.how}{last.fix.altId ? `（${last.fix.altId}）` : ''}</span></>}</td>
                    <td className="act" style={{ whiteSpace: 'nowrap' }}>
                      {open ? canResolve && <button className="btn sm pri" disabled={busy} onClick={() => resolve(r)}>差異の対応</button>
                        : done ? <span className="hint">{last ? fmtDate(last.receivedOn) : ''}</span> : null}
                    </td>
                  </tr>
                );
              }) : <tr><td colSpan={14} className="empty">入荷予定はありません</td></tr>}
            </tbody>
          </table>
        </div>
        {/* ページ送り（10／20／50件：一覧の共通） */}
        <div className="pager">
          <span>{total}件中 {total ? (pg - 1) * st.size + 1 : 0}–{Math.min(total, pg * st.size)}件</span>
          <button onClick={() => setPage(pg - 1)} disabled={pg <= 1} aria-label="前へ">‹</button>
          {Array.from({ length: pages }, (_, i) => i + 1).map((i) => <button key={i} className={i === pg ? 'on' : ''} onClick={() => setPage(i)}>{i}</button>)}
          <button onClick={() => setPage(pg + 1)} disabled={pg >= pages} aria-label="次へ">›</button>
          <select className="sel" aria-label="表示件数" value={st.size} onChange={(e) => setList({ size: +e.target.value, page: 1 })}>
            {[10, 20, 50].map((x) => <option key={x} value={x}>{x}件／ページ</option>)}
          </select>
        </div>
      </div>
    </>
  );
}
