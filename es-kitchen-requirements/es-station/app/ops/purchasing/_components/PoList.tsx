'use client';

import { useRouter } from 'next/navigation';
import { useMemo, useState, type ReactNode } from 'react';
import { api } from '@/lib/ops/purchasing/client';
import { useQuery } from '@/lib/ops/core/client';
import { altOf, altOutside, menuPids, planId, poStatus, poSum, type Rec } from '@/lib/ops/purchasing/logic';
import { CATS, IN_MENU, MENU, MONTHS, SPLIT_MAX, WH, MAT_WH, n, prod, slotDate, supName, supOK } from '@/lib/ops/purchasing/master';
import { wsForPid } from '@/lib/ops/purchasing/stock';
import type { Bill } from '@/lib/ops/purchasing/types';
import { Icon } from '../../_ui/Icon';
import { OpsCsvExport, stateCsvFilters, tupleCols } from '../../_ui/csv';
import { useOps } from '../../_ui/OpsProvider';
import { useCanAct } from '../../_ui/perm';
import { PageHead } from '../../_ui/ui';
import { B, BD, Info, yen } from './common';
import { applyList, FilterBlock, ListTable, presetList, useList, type Col, type Filter } from './List';
import { AddProductModal, BulkModal, ShowPoModal } from './PoModals';
import { PO, usePo, useStockData } from './usePo';
import { useReceiptAlerts } from './receipts';
import { HonPlan, PayablesModal } from './payables';
import { fmtAuto, fmtDate, fmtDateTime, fmtYm } from '@/lib/format/date';

/* 発注一覧（商品ごと）と、発注データごと（発注・入荷の履歴を統合・決定 R6）。上に仕入先からの通知（決定 Q9） */

const SupBadge = ({ pid }: { pid: string }) => (supOK(pid) ? null : <> <span className="badge b-ng" title="仕入先Webのアカウントが未発行です（回答・承認・出荷報告は運営が代理入力）">仕入先未発行</span></>);

function Banner({ recs, meta }: { recs: Rec[]; meta: Record<string, { rejSeen?: boolean; splitSeen?: boolean }> }) {
  const router = useRouter();
  const { toast, toastError } = useOps();
  const canAct = useCanAct();
  const { data: ra } = useReceiptAlerts();
  const wait = recs.filter((x) => x.st === '本発注済' && x.st2 === '本発注済' && x.hon_.st === '承認待ち');
  const split = recs.filter((x) => x.order.split && !meta[x.no]?.splitSeen);
  const rej = recs.filter((x) => x.st2 === '受注不可' && !meta[x.no]?.rejSeen);
  /* 入荷の差異（入荷登録の 差異あり・対応待ち・分納の予定日を過ぎた入荷。課題 2-3） */
  const ng = ra ? [...ra.pending, ...ra.late] : [];
  /* 仕入先の回答の入荷予定日が、入荷を待って回した便の出荷に間に合わない（課題 4a-10。便は自動で動かさない） */
  const altLate = ra?.altLate ?? [];
  /* 1行に収める（長い文は … で切り、全文は title／クリックで見る）。場所をとりすぎない（hong 2026-10-08） */
  const item = (cls: string, txt: ReactNode, btn: ReactNode) => (
    <div className={`notice ${cls}`} style={{ marginBottom: '0.285714rem', padding: '0.285714rem 0.714286rem', alignItems: 'center' }}>
      <Icon name="warn" /><span style={{ flex: 1, minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{txt}</span>{btn}
    </div>
  );
  const see = (f: string, v: string) => { presetList('pod', { f: { [f]: v }, page: 1, q: '' }); router.push('/ops/purchasing/history'); };
  return (
    <div className="card" style={{ padding: '1rem 1.142857rem' }}>
      <div style={{ fontWeight: 700, marginBottom: '0.428571rem' }}>仕入先からの通知</div>
      {!wait.length && !rej.length && !split.length && !ng.length && !altLate.length && <div className="hint">新しい通知はありません。</div>}
      {wait.length > 0 && item('ng', <>本発注の承認待ち（仕入先が未処理）<b>{wait.length}件</b>。本発注から営業日24時間ごとに仕入先へアラートメールを送っています（{wait.map((x) => `${x.no}：${x.alerts}回`).join('、')}）。</>,
        <button className="btn sm" style={{ marginLeft: 'auto' }} onClick={() => see('honSt', '承認待ち')}>見る</button>)}
      {rej.length > 0 && item('ng', <>仕入先が<b>受注不可</b>と回答しました（{rej.map((x) => x.no).join('、')}）。別の仕入先への手配か、発注のキャンセルをしてください。</>,
        <button className="btn sm" style={{ marginLeft: 'auto' }} onClick={() => see('st2', '受注不可')}>見る</button>)}
      {split.length > 0 && item('warn', <>仕入先が<b>分納</b>を登録しました（{split.map((x) => `${x.no}：${x.order.parts.length}回`).join('、')}）。承認は不要です（画面アラートだけ・メールなし）。</>,
        canAct(api, 'markSeen') && <button className="btn sm" style={{ marginLeft: 'auto' }} onClick={async () => { try { await api.action('markSeen', { nos: split.map((x) => x.no), kind: 'split' }); toast('分納の通知を確認済みにしました'); } catch (e) { toastError(e); } }}>確認した</button>)}
      {ng.length > 0 && item('ng', <>入荷の差異が <b>対応待ち</b> {ra!.pending.length}件{ra!.late.length ? `・分納の入荷予定日を過ぎた ${ra!.late.length}件` : ''}あります（{ng.map((r) => `${prod(r.itemId)?.pname ?? r.itemId}（${r.poNo}・${r.qty}/${r.planQty}）`).join('、')}）。分納を待つ／代替品で対応／不足を受け入れる から選んでください。</>,
        <button className="btn sm" style={{ marginLeft: 'auto' }} onClick={() => router.push('/ops/purchasing/receiving')}>入荷登録を開く</button>)}
      {altLate.length > 0 && item('ng', <>仕入先が答えた入荷予定日が、入荷を待って回した便の出荷に<b>間に合いません</b>（{altLate.map((x) => `${x.poNo}：入荷予定 ${fmtDate(x.eta)} → ${x.trips.map((t) => `${t.name} 出荷 ${fmtDate(t.shipOn)}（${t.deliveryId}）`).join('・')}`).join('、')}）。便は自動で動かしません。スケジュールの移動などで直してください。</>,
        <button className="btn sm" style={{ marginLeft: 'auto' }} onClick={() => router.push('/ops/delivery/schedule')}>スケジュールを開く</button>)}
      <details style={{ marginTop: '0.285714rem' }}><summary className="hint" style={{ cursor: 'pointer' }}>発注の決まり</summary><div className="hint" style={{ margin: '0.285714rem 0 0' }}>数量を直せるのは仕入先が本発注を承認するまで（承認後は 増やす＝追加発注・減らす＝キャンセルして出し直し）｜分納は各回の納品日が最初の入荷希望日まで・{SPLIT_MAX}回まで（仮）｜オーダー締切後に増えた分（お試し・締切後の申込）は追加発注｜仕入先へのメールはログインする・しないに関係なく本文で送り、回答は運営が代理入力もできる</div></details>
    </div>
  );
}

function Tabs({ view }: { view: 'prod' | 'data' }) {
  const router = useRouter();
  return (
    <div className="seg2" style={{ margin: '0 0 0.857143rem' }}>
      <button className={view === 'prod' ? 'on' : ''} onClick={() => router.push('/ops/purchasing/orders')}>商品ごと</button>
      <button className={view === 'data' ? 'on' : ''} onClick={() => router.push('/ops/purchasing/history')}>発注データごと（発注・入荷の履歴）</button>
    </div>
  );
}

/* ---------- 商品ごと ---------- */
function ProdView() {
  const router = useRouter();
  const { openModal, toast } = useOps();
  const canAct = useCanAct();
  const { orders, plans, recs, stock, meta } = useStockData();
  const [st, set] = useList('po', { f: { ym: MONTHS[0] } });
  const [sel, setSel] = useState<Set<string>>(() => new Set(PO.sel));
  const ym = st.f.ym || MONTHS[0];
  PO.ym = ym;
  const toggle = (id: string, on: boolean) => { const s = new Set(sel); if (on) s.add(id); else s.delete(id); PO.sel = s; setSel(s); };
  /* 一括仮発注・本発注は通常商品だけ（短消費期限商品は発注詳細で行ごとに発注：台帳 I・2026-10-07・仕様 §2-10） */
  const selIds = [...sel].filter((id) => menuPids(ym, orders ?? []).includes(id) && !prod(id)?.short);
  const all = useMemo(() => (orders && plans ? menuPids(ym, orders).map((pid) => {
    const p = prod(pid)!;
    const s = poSum(ym, p, orders, plans[planId(ym, pid)]);
    return { id: p.id, ym, off: !(IN_MENU[ym] ?? []).includes(pid), name: p.name, cat: p.cat, supN: supName(p.sup), type: p.short ? '短消費期限' : '通常', kari: s.kari, order: s.order, need: s.need, hon: s.hon, status: poStatus(s), nErr: s.nErr, s };
  }) : []), [orders, plans, ym]);
  if (!orders || !plans || !recs || !stock) return <div className="card"><div className="empty">読み込み中…</div></div>;
  /* 納品予定＝その商品の発注データの、仕入先が答えた入荷予定日のうち いちばん早い日（RD-PO-027：納品予定期間で絞る）。仕入先の選択肢は商品の仕入先から */
  const etaOf = (pid: string) => recs.filter((x) => x.ym === ym && x.pid === pid && x.eta).map((x) => x.eta).sort()[0] ?? '';
  const withEta = all.map((r) => ({ ...r, eta: etaOf(r.id) }));
  const filters: Filter[] = [
    { t: 'select', ph: '対象年月', col: 'ym', opts: MONTHS }, { t: 'search', ph: '品番・商品名・仕入先', span: 2, keys: ['id', 'name', 'supN'] }, { t: 'select', ph: 'カテゴリ', col: 'cat', opts: CATS },
    { t: 'select', ph: '区分', col: 'type', opts: ['通常', '短消費期限'] }, { t: 'select', ph: '発注ステータス', col: 'status', opts: ['未発注', '一部仮発注', '仮発注済', '一部本発注', '本発注済'] },
    { t: 'select', ph: '仕入先', col: 'supN', opts: [...new Set(all.map((r) => r.supN))].sort((x, y) => x.localeCompare(y, 'ja')) },
    { t: 'range', ph: '納品予定', col: 'eta' },
  ];
  const rows = applyList(st, withEta, filters);
  const cols: Col[] = [['_chk', ''], ['id', '品番'], ['name', '商品名'], ['type', '区分'], ['cat', 'カテゴリ'], ['supN', '仕入先'], ['order', 'オーダー数', 'num'], ['need', '必要数', 'num'], ['alt', '代替品数', 'num'], ['kari', '仮発注', 'num'], ['hon', '本発注', 'num'], ['ws', '倉庫（見込み）', 'num'], ['status', '発注ステータス'], ['_act', '操作']];
  const go = (id: string) => { PO.ym = ym; router.push(`/ops/purchasing/orders/${id}`); };
  const cell = (c: Col, r: (typeof all)[number]) => {
    const k = c[0];
    if (k === '_chk') return <td style={{ width: '2.714286rem' }}><input type="checkbox" checked={sel.has(r.id)} disabled={r.type === '短消費期限'} title={r.type === '短消費期限' ? '短消費期限商品は発注詳細で発注します' : undefined} onChange={(e) => toggle(r.id, e.target.checked)} aria-label={`${r.name}を選択`} /></td>;
    if (k === 'id') return <td className="mono">{r.id}</td>;
    if (k === 'name') return <td><button className="lnk u" onClick={() => go(r.id)}>{r.name}</button>{r.off && <> <span className="badge b-info" title="その月のメニューにない商品（商品追加で足した）">メニュー外</span></>}<SupBadge pid={r.id} /></td>;
    if (k === 'type') return <td>{r.type === '短消費期限' ? <B v="短消費期限" c="b-warn" /> : <B v="通常" c="b-mute" />}</td>;
    if (k === 'alt') {
      const a = altOf(r.ym, r.id);
      return <td className="num">{a ? <><b title={a.why}>{a.n > 0 ? '+' : '−'}{Math.abs(a.n)}</b>{a.no && <><br /><span className="badge b-warn" title="本発注済みのため追加の発注データ">追加発注</span></>}</> : '—'}</td>;
    }
    if (k === 'order' || k === 'need' || k === 'kari' || k === 'hon') return <td className="num">{n(r[k])}</td>;
    if (k === 'ws') {
      const w = wsForPid(stock, r.id);
      return <td className="num"><button className="lnk" onClick={() => router.push('/ops/purchasing/stock')} title="倉庫在庫を開く">{n(w.fin)}</button>{w.short && <><br /><span className="badge b-ng" title={`${w.short} の出荷で不足見込み`}>不足見込み</span></>}</td>;
    }
    if (k === 'status') return <td><B v={r.status} />{r.nErr > 0 && <> <span className="badge b-ng">エラー{r.nErr}</span></>}</td>;
    if (k === '_act') return <td className="act"><button className="e" onClick={() => go(r.id)} aria-label="発注詳細"><Icon name="edit" /></button></td>;
    return <td>{fmtAuto((r as Record<string, unknown>)[k] ?? '')}</td>;
  };
  const m = MENU[ym];
  const bulk = (kind: 'kari' | 'hon') => {
    let ids = selIds.length ? selIds : menuPids(ym, orders ?? []).filter((pid) => !prod(pid)?.short);
    if (!selIds.length) ids = ids.filter((pid) => { const s = all.find((x) => x.id === pid)!.s; return kind === 'kari' ? s.nNone > 0 : s.nKari > 0; });
    if (!ids.length) { toast(kind === 'kari' ? '仮発注できる商品がありません（すべて仮発注済みです）' : '本発注できる商品がありません。先に仮発注してください'); return; }
    openModal(<BulkModal kind={kind} ym={ym} ids={ids} onDone={() => { PO.sel = new Set(); setSel(new Set()); }} />);
  };
  const outside = altOutside(ym);
  return (
    <>
      <PageHead crumbs={['発注・入荷', '発注']} title="発注">
        <OpsCsvExport<(typeof all)[number]> screen="発注（商品ごと）" filters={stateCsvFilters(st, filters)} rows={rows}
          columns={[...tupleCols<(typeof all)[number]>(cols, (r, k) => (k === 'ws' ? wsForPid(stock, r.id).fin : k === 'alt' ? altOf(r.ym, r.id)?.n ?? '' : (r as Record<string, unknown>)[k])), { label: 'エラー', type: 'int', get: (r) => r.nErr }]} />
        <button className="btn csv lg" onClick={() => openModal(<ShowPoModal ym={ym} />)}><Icon name="down" />発注済データ確認</button>
        {canAct(api, 'orderOp', { op: 'create' }) && <button className="btn out lg" onClick={() => openModal(<AddProductModal ym={ym} />)}>商品追加</button>}
        {/* 権限がなければ出さない（仮発注＝発注の作成、本発注＝発注の発行） */}
        {canAct(api, 'orderOp', { op: 'create' }) && <button className="btn out lg" onClick={() => bulk('kari')}>仮発注</button>}
        {canAct(api, 'orderOp', { op: 'issueHon' }) && <button className="btn pri lg" onClick={() => bulk('hon')}>本発注</button>}
      </PageHead>
      <Banner recs={recs} meta={meta ?? {}} />
      <HonPlan ym={ym} recs={recs} />
      <KariBar ym={ym} />
      <Tabs view="prod" />
      <div className="card">
        <Info><b>{fmtYm(ym)} メニュー</b>（{m.st}）｜オーダー締切 {fmtDate(m.deadline)}｜お客様への納品 {fmtDate(slotDate(ym, 0))}〜{fmtDate(slotDate(ym, 27))}（A1〜D7）。オーダー数・必要数は運営Web「メニュー管理 ＞ 商品注文管理」の注文数・調整数の合計（倉庫別）です。仮発注はメニューの公開の前、本発注は月2回（前半 A・B の便／後半 C・D の便。下の時期）に行います。{selIds.length > 0 && <> <b>{selIds.length}件選択中</b>：一括仮発注・本発注は選択した商品が対象です。</>}</Info>
        {outside.length > 0 && <Info><b>代替品設定 ALT-2610-0001 の追加発注</b>：{outside.map((id) => { const a = altOf(ym, id)!; return <span key={id}>{prod(id)?.name ?? id}（{id}）+{a.n}個・<span className="mono">{a.no}</span></span>; })}。この月のメニュー外の商品のため一覧には出ません。仕入先へ本発注のお知らせ（X9）を送り、回答待ち。</Info>}
        <FilterBlock st={st} set={(p) => set((s) => { const nx = typeof p === 'function' ? p(s) : { ...s, ...p }; if (!nx.f.ym) nx.f = { ...nx.f, ym: MONTHS[0] }; return nx; })} filters={filters} cols={cols} onSelect={(col) => { if (col === 'ym' || col === '') { PO.sel = new Set(); setSel(new Set()); } }} />
        <ListTable st={st} set={set} cols={cols} rows={rows} cell={cell} rowKey={(r) => r.id} />
      </div>
    </>
  );
}

/* ---------- 発注データごと ---------- */
type ClaimRow = { no: string; alt: string; ym: string; sup: string; pid: string; name: string; kind: string; qty: number; unit: number; amt: number; at: string };
function DataView() {
  const { openModal, toast, toastError, account } = useOps();
  const router = useRouter();
  const canAct = useCanAct();
  const { recs, meta, orders } = usePo();
  const { data: claims } = useQuery(api, 'claims', {});
  const { data: ra } = useReceiptAlerts();
  const [st, set] = useList('pod');
  if (!recs || !orders) return <div className="card"><div className="empty">読み込み中…</div></div>;
  /* 入荷の差異（対応待ち）の発注には入荷状況にバッジを付ける */
  const diff = new Set((ra?.pending ?? []).map((x) => x.poNo));
  /* 入荷予定日が回した便に間に合わない追加発注（課題 4a-10） */
  const lateAlt = new Set((ra?.altLate ?? []).map((x) => x.poNo));
  const all = [...recs.map((x) => ({
    no: x.no, ym: x.ym, name: x.name, pn: x.pn, kind: x.kind, type: x.type, supN: supName(x.sup), wh: x.wh, qty: x.qty, box: x.box, amt: x.amt,
    st2: x.st2, honSt: x.hon_.st, ansSt: x.ansSt, recvSt: diff.has(x.no) ? '差異あり・対応待ち' : x.recvSt, bill: x.bill, alerts: x.alerts, split: x.order.parts.length > 1, claim: '', at: x.at, eta: x.eta,
  })),
  /* 不良控除（返品）：代替品設定の仕入先への請求。その月の発注のマイナスの行（支払額から引く） */
  ...((claims ?? []) as ClaimRow[]).map((c) => ({
    no: c.no, ym: c.ym, name: c.name, pn: c.name, kind: c.kind, type: '不良控除', supN: supName(c.sup), wh: '—', qty: c.qty, box: 0, amt: c.amt,
    st2: '不良控除', honSt: '—', ansSt: '—', recvSt: '—', bill: '—' as const, alerts: 0, split: false, claim: c.alt, at: c.at, eta: '',
  }))];
  const filters: Filter[] = [
    { t: 'select', ph: '対象年月（すべて）', col: 'ym', opts: MONTHS }, { t: 'search', ph: '発注番号・商品名・仕入先', span: 2, keys: ['no', 'name', 'pn', 'supN'] }, { t: 'select', ph: '発注ステータス', col: 'st2', opts: ['仮発注済', '本発注済', '受注不可', '取消済'] },
    { t: 'select', ph: '本発注の承認', col: 'honSt', opts: ['承認待ち', '承認済'] }, { t: 'select', ph: '仕入先回答', col: 'ansSt', opts: ['納期回答待ち', '納期回答済', '出荷済', '受注不可'] },
    { t: 'select', ph: '入荷状況', col: 'recvSt', opts: ['未入荷', '差異あり・対応待ち', '入荷済'] }, { t: 'select', ph: '請求照合', col: 'bill', opts: ['未照合', '照合済', '差異あり'] }, { t: 'select', ph: '納入倉庫', col: 'wh', opts: [...WH, MAT_WH] },
    { t: 'select', ph: '仕入先', col: 'supN', opts: [...new Set(all.map((r) => r.supN))].sort((x, y) => x.localeCompare(y, 'ja')) },
    { t: 'range', ph: '発注日', col: 'at' }, { t: 'range', ph: '納品予定（入荷予定日）', col: 'eta' },
  ];
  const rows = applyList(st, all, filters);
  const cols: Col[] = [['no', '発注番号'], ['ym', '対象年月'], ['name', '商品名（仕入時の名前）'], ['kind', '種類'], ['supN', '仕入先'], ['wh', '納入倉庫'], ['qty', '数量', 'num'], ['box', '入荷箱数', 'num'], ['amt', '発注金額（税抜）', 'num'], ['st2', '発注ステータス'], ['honSt', '本発注の承認'], ['ansSt', '仕入先回答'], ['recvSt', '入荷状況'], ['bill', '請求照合'], ['_act', '操作']];
  const open = (no: string) => router.push(`/ops/purchasing/history/${encodeURIComponent(no)}`);
  const setBill = async (no: string, bill: Bill) => { try { await api.action('setBill', { no, bill, by: account?.id }); toast(`請求照合を「${bill}」にしました`); } catch (e) { toastError(e); } };
  const cell = (c: Col, r: (typeof all)[number]) => {
    const k = c[0];
    if (k === 'no') return <td>{r.claim ? <span className="mono" title={`代替品設定 ${r.claim}`}>{r.no}</span> : <button className="lnk mono" onClick={() => open(r.no)}>{r.no}</button>}</td>;
    if (k === 'name') return <td>{r.name}{r.pn !== r.name && <><br /><span className="hint">{r.pn}</span></>}</td>;
    if (k === 'kind') return <td>{r.claim ? <B v={r.kind} c="b-ng" title={`代替品設定 ${r.claim}`} /> : r.kind === 'メニュー外' ? <B v="メニュー外" c="b-info" title="その月のメニューにない商品（商品追加）" /> : r.kind === '追加発注' ? <B v="追加発注" /> : r.type === '短消費期限' ? <B v="短消費期限" c="b-warn" /> : r.type === '資材' ? <B v="資材" c="b-info" /> : <B v="通常" c="b-mute" />}</td>;
    if (k === 'qty') return <td className="num">{n(r.qty)}</td>;
    if (k === 'box') return <td className="num">{r.box ? n(r.box) + '箱' : '—'}</td>;
    if (k === 'amt') return <td className="num" style={r.amt < 0 ? { color: 'var(--ng, #c02339)' } : undefined}>{yen(r.amt)}</td>;
    if (k === 'honSt') return <td><BD v={r.honSt} />{r.alerts > 0 && <> <span className="badge b-ng">アラート{r.alerts}回</span></>}{r.split && <> <B v="分納" /></>}</td>;
    if (k === 'ansSt' && lateAlt.has(r.no)) return <td><BD v={r.ansSt} /> <span className="badge b-ng" title="入荷予定日が、入荷を待って回した便の出荷に間に合いません">便に間に合わない</span></td>;
    if (k === 'st2' || k === 'ansSt' || k === 'recvSt') return <td><BD v={r[k]} /></td>;
    if (k === 'bill') return r.bill === '—' ? <td><span className="muted">—</span></td> : <td><select className="sel" style={{ minWidth: '7.857143rem' }} value={r.bill} disabled={!canAct(api, 'setBill')} onChange={(e) => setBill(r.no, e.target.value as Bill)} aria-label="請求照合">{['未照合', '照合済', '差異あり'].map((v) => <option key={v}>{v}</option>)}</select></td>;
    if (k === '_act') return <td className="act">{!r.claim && <button className="e" onClick={() => open(r.no)} aria-label="詳細"><Icon name="edit" /></button>}</td>;
    return <td>{fmtAuto((r as Record<string, unknown>)[k] ?? '')}</td>;
  };
  const tot = rows.reduce((a, r) => a + r.amt, 0);
  return (
    <>
      <PageHead crumbs={['発注・入荷', '発注']} title="発注">
        <OpsCsvExport<(typeof all)[number]> screen="発注・入荷履歴" filters={stateCsvFilters(st, filters)} rows={rows} columns={tupleCols<(typeof all)[number]>(cols)}
          source={{ kind: 'orders', id: (r) => r.no }} />
        <button className="btn out lg" onClick={() => openModal(<PayablesModal orders={orders} ym0={st.f.ym || MONTHS[0]} />)}>仕入先への支払の集計</button>
      </PageHead>
      <Banner recs={recs} meta={meta ?? {}} />
      <Tabs view="data" />
      <div className="card">
        <Info>発注データ1件ごとの一覧です（発注・入荷の履歴を統合・REQ-PO-114）。仕入先の請求書と<b>発注金額</b>を突き合わせ、<b>請求照合</b>（未照合／照合済／差異あり）をここで変えます。<b>不良控除（返品）</b>は代替品設定の仕入先への請求（マイナスの行・その月の支払額から引く）です。月 × 仕入先の発注金額・不良控除・支払額・請求照合は「仕入先への支払の集計」で見られます。表示中の金額の合計：<b>{yen(tot)}</b>（税抜・不良控除を含む）。</Info>
        <FilterBlock st={st} set={set} filters={filters} cols={cols} />
        <ListTable st={st} set={set} cols={cols} rows={rows} cell={cell} rowKey={(r) => r.no} />
      </div>
    </>
  );
}

export function PoListPage({ view }: { view: 'prod' | 'data' }) {
  return view === 'data' ? <DataView /> : <ProdView />;
}

/**
 * 仮発注の承認（メニューの月ごと・共通データ dm.menu.kariApprovals）。承認済でないとメニューを公開できない（公開の条件）。
 * 承認した日時・者を出し、取り消しもできる
 */
function KariBar({ ym }: { ym: string }) {
  const { toast, toastError } = useOps();
  const canAct = useCanAct();
  const { data } = useQuery(api, 'kari', { ym });
  const k = data?.[0];
  const ok = k?.status === '承認';
  const run = async (approve: boolean) => {
    try { await api.action('approveKari', { ym, approve }); toast(`${fmtYm(ym)} メニューの仮発注を${approve ? '承認しました' : '未承認に戻しました'}`); } catch (e) { toastError(e); }
  };
  if (!data) return null;
  return (
    <Info kind={ok ? '' : 'warn'}>
      <b>仮発注の承認（{fmtYm(ym)} メニュー）</b>：{ok ? <>承認済（{fmtDateTime(k!.approvedAt)}・{k!.approvedByName}）</> : '未承認'}。承認するとメニューの公開の条件がそろいます（メニュー管理 ＞ 月間メニュー）。
      {' '}{!canAct(api, 'approveKari') ? null : ok ? <button className="btn sm" onClick={() => run(false)}>承認を取り消す</button> : <button className="btn pri sm" onClick={() => run(true)}>仮発注を承認</button>}
    </Info>
  );
}
