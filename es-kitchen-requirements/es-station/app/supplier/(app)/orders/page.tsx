'use client';

import { SupplierAnswerImport, SupplierCsvExport } from '../../_components/csv';
import { useRouter } from 'next/navigation';
import { Fragment, useState, type ReactNode } from 'react';
import { ymJa, ymOf } from '@/lib/supplier/dates';
import { alertCount, canShip, groupInfo, groupKey, needHon, nShipped, qtyOf, tabOf, TABS } from '@/lib/supplier/orders';
import { R } from '@/lib/supplier/routes';
import { useSignedIn } from '@/lib/supplier/store';
import type { Order, Supplier } from '@/lib/supplier/types';
import { BulkAnswerModal, BulkHonModal, CsvModal } from '../../_components/modals';
import { Badge, Field, Icon, Notice, PageHead } from '../../_components/ui';
import ShipList from './ShipList';
import { fmtDate, fmtMd, isoDate } from '@/lib/format/date';
import { DateInput } from '@/components/DateInput';

const STATUS_LABEL = { 納期回答待ち: '納期回答待ち', 本発注の承認待ち: '納期回答済（本発注の承認待ち）', 出荷待ち: '納期回答済', 出荷済: '出荷済', 受注不可: '受注不可', キャンセル: 'キャンセル' };

function EtaCell({ o }: { o: Order }) {
  const ps = o.parts ?? [];
  if (!ps.length) return <>—</>;
  if (ps.length === 1) return <>{fmtDate(ps[0].eta)}</>;
  return <>{ps.map((x) => fmtMd(x.eta)).join('・')} <Badge v={`分納${ps.length}回`} cls="b-info" /></>;
}
function ShipCell({ o }: { o: Order }) {
  const ps = (o.parts ?? []).filter((x) => x.st === '出荷済');
  return <>{ps.length ? ps.map((x) => (ps.length > 1 ? fmtMd(x.ship) : fmtDate(x.ship))).join('・') : '—'}</>;
}
function SlipCell({ o }: { o: Order }) {
  const ps = (o.parts ?? []).filter((x) => x.st === '出荷済');
  if (!ps.length) return <>—</>;
  return <>{ps[ps.length - 1].slip}{ps.length > 1 && <span className="muted"> ほか{ps.length - 1}</span>}</>;
}
function StatusCell({ o, me }: { o: Order; me: Supplier }) {
  const parts: ReactNode[] = [];
  if (tabOf(o) === '本発注の承認待ち') {
    parts.push(<Badge key="a" v="本発注の承認待ち" />);
    const n = alertCount(o, me);
    if (n) parts.push(<Fragment key="b"> <Badge v={`アラート${n}回`} cls="b-ng" title="本発注から営業日24時間ごとのアラートメール" /></Fragment>);
  } else parts.push(<Badge key="a" v={o.ans} />);
  if (o.ans === '納期回答済' && !needHon(o)) {
    parts.push(' ');
    parts.push(
      nShipped(o)
        ? <Fragment key="c"><Badge v="一部出荷済" /> <span className="muted">{nShipped(o)}/{o.parts.length}</span></Fragment>
        : <Badge key="c" v={canShip(o) ? '出荷可' : '本発注待ち'} />,
    );
  }
  if (o.ans === '出荷済') parts.push(<Fragment key="d"> <Badge v={o.recv} /></Fragment>);
  return <>{parts}</>;
}

/** S06 受注一覧（2026/10/02 名称変更・REQ-PO-620。旧：発注一覧。仮発注・本発注などの表記と運営サイトの名称は変えない） */
export default function OrdersPage() {
  const { orders: mine, me, tab, setTab, group, setGroup, selected, setSelected, filter, setFilter, openModal } = useSignedIn();
  const router = useRouter();
  const [ym, setYm] = useState(filter.ym);
  const [kw, setKw] = useState(filter.kw);
  /* 納入倉庫・種類・希望納期（から〜まで）。「検索」か Enter で効く */
  const [x, setX] = useState({ wh: '', type: '', from: '', to: '' });
  const [xa, setXa] = useState(x);
  const uniq = (xs: string[]) => [...new Set(xs.filter(Boolean))].sort((a, b) => a.localeCompare(b, 'ja'));
  const whs = uniq(mine.map((o) => o.wh)), types = uniq(mine.map((o) => o.type));
  const search = () => { setFilter({ ym, kw: kw.trim() }); setXa(x); };

  const yms = [...new Set(mine.map((o) => ymOf(o.ship || o.eta || o.rows[0]?.wish || o.orderedAt)))].sort().reverse();
  const tabRows = mine.filter((o) => tabOf(o) === tab);
  let rows = tabRows;
  if (filter.ym) rows = rows.filter((o) => ymOf(o.ship || o.eta || '') === filter.ym);
  if (filter.kw) rows = rows.filter((o) => (o.no + o.name).includes(filter.kw));
  if (xa.wh) rows = rows.filter((o) => o.wh === xa.wh);
  if (xa.type) rows = rows.filter((o) => o.type === xa.type);
  if (xa.from || xa.to) rows = rows.filter((o) => { const d = isoDate(o.rows[0]?.wish); return !!d && (!xa.from || d >= xa.from) && (!xa.to || d <= xa.to); });
  rows = [...rows].sort(
    group
      ? (a, b) => (a.pid + b.ym).localeCompare(b.pid + a.ym) || a.no.localeCompare(b.no)
      : (a, b) => Number(a.seen) - Number(b.seen) || b.orderedAt.localeCompare(a.orderedAt),
  );
  const bulk = tab === '納期回答待ち' || tab === '本発注の承認待ち';
  const selN = rows.filter((o) => selected.has(o.no)).length;
  const colN = bulk ? 12 : 11;

  const toggle = (no: string, on: boolean) => setSelected((s) => { if (on) s.add(no); else s.delete(no); return s; });
  const switchTab = (t: typeof tab) => { setTab(t); setSelected((s) => { s.clear(); return s; }); };
  const bulkGo = () => {
    const list = tabRows.filter((o) => selected.has(o.no));
    openModal(tab === '納期回答待ち' ? <BulkAnswerModal list={list} /> : <BulkHonModal list={list} />);
  };

  const body: ReactNode[] = [];
  let last = '';
  rows.forEach((o) => {
    if (group && groupKey(o) !== last) {
      last = groupKey(o);
      const g = groupInfo(o, mine);
      const ids = rows.filter((x) => groupKey(x) === last).map((x) => x.no);
      body.push(
        <tr className="grp" key={'g' + last}>
          <td colSpan={colN}>
            <div className="grpbar">
              <b>{o.name}</b>
              <span className="muted">{ymJa(o.ym)} メニュー｜{g.n}件・合計 {g.qty.toLocaleString()}{o.unit}</span>
              <Badge v={`仮発注の回答 ${g.kari}/${g.n}`} cls="b-mute" title="仮発注への回答" />
              <Badge
                v={`本発注の承認 ${g.honOk}/${g.hon || 0}${g.hon && g.hon < g.n ? `（本発注は${g.hon}/${g.n}件のみ）` : ''}`}
                cls={g.hon ? (g.honOk === g.hon ? 'b-ok' : 'b-warn') : 'b-mute'}
                title="本発注の承認"
              />
              <Badge v={`出荷済 ${g.shipped}/${g.n}`} cls="b-mute" />
              <span style={{ flex: 1 }} />
              {bulk && ids.length > 1 && (
                <button className="btn sm out" onClick={() => setSelected((s) => { ids.forEach((n) => s.add(n)); return s; })}>この{ids.length}件を選択</button>
              )}
            </div>
          </td>
        </tr>,
      );
    }
    body.push(
      <tr key={o.no} className={`rowlink ${o.seen ? '' : 'unseen'}`} onClick={() => router.push(R.order(o.no))}>
        {bulk && (
          <td onClick={(e) => e.stopPropagation()}>
            <input type="checkbox" className="rsel" checked={selected.has(o.no)} aria-label="選択" onChange={(e) => toggle(o.no, e.target.checked)} />
          </td>
        )}
        <td className="mono"><span className="lnk">{o.no}</span>{!o.seen && <span className="newdot">NEW</span>}</td>
        <td>{fmtDate(o.orderedAt.slice(0, 10))}</td>
        <td><Badge v={o.type} /></td>
        <td>
          {o.name}
          {o.re && <> <Badge v="数量変更" cls="b-warn" /></>}
          {o.add && <> <Badge v="追加発注" cls="b-info" /></>}
          {needHon(o) && o.hon !== o.kari && <> <Badge v="本発注で数量変更" cls="b-warn" /></>}
        </td>
        <td><StatusCell o={o} me={me} /></td>
        <td>{o.wh}</td>
        <td>{fmtDate(o.rows[0].wish)}{o.rows.length > 1 ? ' 〜' : ''}</td>
        <td><EtaCell o={o} /></td>
        <td className="num">{qtyOf(o).toLocaleString()}{o.unit}</td>
        <td><ShipCell o={o} /></td>
        <td className="mono"><SlipCell o={o} /></td>
      </tr>,
    );
  });

  return (
    <>
      <PageHead crumbs={['受注一覧']} title="受注一覧">
        {/* CSV（2026/10/03 決定）：受注の回答の取込・いまのタブの検索条件のとおりの出力（1行＝発注の入荷希望の1行）・期間で選ぶ発注明細（納品・請求の照合用） */}
        <SupplierAnswerImport />
        <SupplierCsvExport<{ o: (typeof rows)[number]; r: (typeof rows)[number]['rows'][number] }> screen="受注一覧"
          filters={[{ label: 'タブ', value: tab }, { label: '年月', value: filter.ym }, { label: '検索', value: filter.kw }, { label: '納入倉庫', value: xa.wh }, { label: '種類', value: xa.type }, { label: '希望納期', value: xa.from || xa.to ? `${xa.from}〜${xa.to}` : '' }]}
          rows={() => rows.flatMap((o) => o.rows.map((r) => ({ o, r })))}
          columns={[
            { label: '発注番号', get: (x) => x.o.no }, { label: '発注日時', get: (x) => x.o.orderedAt }, { label: '種類', get: (x) => x.o.type }, { label: '品番', get: (x) => x.o.pid }, { label: '商品名', get: (x) => x.o.name },
            { label: '対象年月', get: (x) => x.o.ym }, { label: '納入倉庫', get: (x) => x.o.wh }, { label: '区分', get: (x) => (x.o.hon > 0 ? '本発注' : '仮発注') }, { label: '仮発注数', type: 'int', get: (x) => x.o.kari },
            { label: '本発注数', type: 'int', get: (x) => x.o.hon }, { label: '単位', get: (x) => x.o.unit }, { label: '回答の状態', get: (x) => x.o.ans }, { label: '本発注の承認', get: (x) => (x.o.hon > 0 ? (x.o.honAck ? '承認済' : '承認待ち') : '') },
            { label: '出荷予定日', get: (x) => x.o.eta }, { label: '出荷日', get: (x) => x.o.ship }, { label: '送り状番号', get: (x) => x.o.slip }, { label: '入荷', get: (x) => x.o.recv },
            { label: '便', get: (x) => x.r.slot }, { label: 'お届け日', get: (x) => x.r.deliver }, { label: '入荷希望日', get: (x) => x.r.wish }, { label: '数量', type: 'int', get: (x) => x.r.qty },
          ]} />
        <button className="btn out" onClick={() => openModal(<CsvModal />)}><Icon name="down" />発注明細（期間）</button>
      </PageHead>
      <div className="card">
        <div className="tabs">
          {TABS.map((t) => {
            const n = mine.filter((o) => tabOf(o) === t);
            const nu = n.filter((o) => !o.seen).length;
            return (
              <button key={t} className={`tab ${tab === t ? 'on' : ''}`} onClick={() => switchTab(t)}>
                {t}<span className="cnt">{n.length}</span>{nu > 0 && <span className="new">新着 {nu}</span>}
              </button>
            );
          })}
        </div>

        <div className="filter" onKeyDown={(e) => { if (e.key === 'Enter' && (e.target as HTMLElement).tagName === 'INPUT') search(); }}>
          <Field label="出荷年月">
            <select className="sel" value={ym} onChange={(e) => setYm(e.target.value)}>
              <option value="">すべて</option>
              {yms.map((y) => <option key={y} value={y}>{ymJa(y)}</option>)}
            </select>
          </Field>
          <Field label="ステータス" hint="上のタブで切り替えます">
            <select className="sel" disabled><option>{STATUS_LABEL[tab]}</option></select>
          </Field>
          <Field label="発注番号・商品名">
            <input className="inp" value={kw} placeholder="キーワード" onChange={(e) => setKw(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') search(); }} />
          </Field>
          <Field label="納入倉庫">
            <select className="sel" value={x.wh} onChange={(e) => setX({ ...x, wh: e.target.value })}><option value="">すべて</option>{whs.map((w) => <option key={w}>{w}</option>)}</select>
          </Field>
          <Field label="種類">
            <select className="sel" value={x.type} onChange={(e) => setX({ ...x, type: e.target.value })}><option value="">すべて</option>{types.map((t) => <option key={t}>{t}</option>)}</select>
          </Field>
          <Field label="希望納期（から）"><DateInput className="inp" value={x.from} onChange={(e) => setX({ ...x, from: e.target.value })} /></Field>
          <Field label="希望納期（まで）"><DateInput className="inp" value={x.to} onChange={(e) => setX({ ...x, to: e.target.value })} /></Field>
          <div className="fa">
            <button className="btn out" onClick={() => { const z = { wh: '', type: '', from: '', to: '' }; setYm(''); setKw(''); setX(z); setXa(z); setFilter({ ym: '', kw: '' }); }}>クリア</button>
            <button className="btn pri" onClick={search}>検索</button>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.857143rem', flexWrap: 'wrap', marginBottom: '0.857143rem' }}>
          <div className="seg2">
            <button className={group ? 'on' : ''} onClick={() => setGroup(true)}>商品・月でまとめる</button>
            <button className={group ? '' : 'on'} onClick={() => setGroup(false)}>発注ごと</button>
          </div>
          <span className="muted" style={{ fontSize: '0.928571rem' }}>同じ商品・同じ月（サイクル）の発注は、仮発注の回答・本発注の承認をまとめて行えます。</span>
        </div>

        {tab === '納期回答待ち' && (
          <Notice kind="warn" style={{ marginBottom: '0.857143rem' }}>
            発注を受け取ったら、<b>承認（出荷予定日）</b>か<b>受注できない</b>を回答してください。分納する場合は「分納依頼」から、出荷予定日を回ごとに登録します。複数の発注を選んで<b>一括承認</b>もできます。数量が変更された発注には「数量変更」の印が付きます。
          </Notice>
        )}
        {tab === '本発注の承認待ち' && (
          <Notice kind="warn" style={{ marginBottom: '0.857143rem' }}>
            運営が<b>本発注</b>（数量確定）を行いました。内容を確認して承認してください。本発注は発注ごとに確定のタイミングが異なる場合があり、<b>承認も確定された分ごと</b>に行います（同時に確定された分は一括承認できます）。
          </Notice>
        )}
        {tab === '本発注の承認待ち' && mine.some((o) => alertCount(o, me) > 0) && (
          <Notice kind="ng" style={{ marginBottom: '0.857143rem' }}>未処理の本発注があります。本発注から営業日24時間ごとにアラートメールをお送りしています（処理が完了するまで繰り返します）。</Notice>
        )}
        {tab === '出荷待ち' && (
          <Notice kind="pur" icon="truck" style={{ marginBottom: '0.857143rem' }}>
            出荷報告ができるのは<b>本発注を承認</b>した発注です。「本発注待ち」は運営の本発注（オーダー締切後）をお待ちください。分納の発注は、回ごとに出荷報告をします。
            一覧で<b>賞味期限・配送方法・運送会社・送り状番号</b>を入れて「入力を一括保存」、チェックした回を「出荷済みにする」でまとめて報告できます（配送方法・運送会社は前回の値が入ります。運送会社・送り状番号は任意）。
          </Notice>
        )}
        {tab === 'キャンセル' && (
          <Notice kind="warn" style={{ marginBottom: '0.857143rem' }}>運営がキャンセルした発注です。出荷しないでください。キャンセルの履歴は、発注の詳細で確認できます。</Notice>
        )}
        {tab === '受注不可' && (
          <Notice kind="ng" style={{ marginBottom: '0.857143rem' }}>「受注できない」と回答した発注です。運営が確認し、別の仕入先への手配などを行います。</Notice>
        )}

        {bulk && (
          <div className="bulkbar">
            <span><b>{selN}</b>件を選択中</span>
            <span style={{ flex: 1 }} />
            <button className="btn sm" disabled={!selN} onClick={() => setSelected((s) => { s.clear(); return s; })}>選択を解除</button>
            <button className="btn pri" disabled={!selN} onClick={bulkGo}>
              {tab === '納期回答待ち' ? '選択した発注を一括承認（納期回答）' : '選択した発注の本発注を一括承認'}
            </button>
          </div>
        )}

        {tab === '出荷待ち' ? <ShipList rows={rows} /> : (
        <div className="tbl-wrap">
          <table className="tbl">
            <thead>
              <tr>
                {bulk && (
                  <th style={{ width: '2.857143rem' }}>
                    <input
                      type="checkbox"
                      id="selall"
                      aria-label="すべて選択"
                      checked={rows.length > 0 && selN === rows.length}
                      onChange={(e) => setSelected((s) => { tabRows.forEach((o) => (e.target.checked ? s.add(o.no) : s.delete(o.no))); return s; })}
                    />
                  </th>
                )}
                <th>発注番号</th><th>発注日</th><th>種類</th><th>商品名</th><th>ステータス</th><th>納入倉庫</th><th>希望納期</th><th>出荷予定日</th><th className="num">数量</th><th>出荷日</th><th>送り状番号</th>
              </tr>
            </thead>
            <tbody>
              {body.length ? body : <tr><td colSpan={colN} className="empty">該当する発注はありません</td></tr>}
            </tbody>
          </table>
        </div>
        )}
      </div>
    </>
  );
}
