'use client';

import { useRef, useState } from 'react';
import { DEMO } from '@/lib/demo';
import { useQuery } from '@/lib/ops/core/client';
import type { SalesArgs } from '@/lib/ops/general/sales';
import type { SalesSite, SalesUser } from '@/lib/ops/general/types';
import { formatDate, parseDate, today } from '@/lib/supplier/dates';
import { ListView, MultiCheck, useList, type ListCol } from '@/app/ops/_general/list';
import { DateInput } from '@/components/DateInput';
import { api, demoMsg, Loading } from '@/app/ops/_general/parts';
import { Icon } from '@/app/ops/_ui/Icon';
import { OpsCsvExport } from '../_ui/csv';
import { useOps } from '@/app/ops/_ui/OpsProvider';
import { useCanAct } from '@/app/ops/_ui/perm';
import { Badge, Field, PageHead, yen } from '@/app/ops/_ui/ui';
import { fmtYm } from '@/lib/format/date';

/*
 * 購入管理（2026/10/02 名称変更・REQ-UI-004。旧：売上管理。元：renderSales2。S7E-20261001。フェーズ1 の形：拠点別・商品別・ユーザー別）。
 * 商品別の下に、メニューの注文数・発注数ランキング（元：renderSales・STEP6 R13）。Phase2 は現金なし。数はデモの値。
 */
type Tab = 'site' | 'item' | 'user';
const TABS: [Tab, string][] = [['site', '拠点別'], ['item', '商品別'], ['user', 'ユーザー別']];
let TAB: Tab = 'site';
type Data = NonNullable<ReturnType<typeof useSales>>;
const useSales = (c: SalesArgs) => useQuery(api, 'sales', c).data;

export default function SalesPage() {
  /* 条件（期間・法人・拠点・カテゴリー）は3つのタブで共通。購入を絞ってから集計する */
  const [applied, setApplied] = useState<SalesArgs>({});
  const [cond, setCond] = useState<SalesArgs>({});
  const data = useSales(applied);
  /* 条件は「検索」か Enter で効く（2026/10/03 決定）。空の値は同じものとして比べる */
  const norm = (c: SalesArgs) => JSON.stringify(Object.entries(c).filter(([, v]) => (Array.isArray(v) ? v.length : v)).sort());
  const lv = { onReset: () => { setCond({}); setApplied({}); }, onApply: () => setApplied(cond), extraDirty: norm(cond) !== norm(applied) };
  const [tab, setTab] = useState<Tab>(TAB);
  const { toast } = useOps();
  /* CSV に出す、いま表示中の列と行（タブが描くときに入れる） */
  const csv = useRef<{ cols: { key: string; label: string }[]; rows: object[] }>({ cols: [], rows: [] });
  if (!data) return <Loading />;
  const t = TABS.find((x) => x[0] === tab)![1];
  return (
    <>
      <PageHead crumbs={['購入管理', `購入管理（${t}）`]} title={`購入管理（${t}）`}>
        {/* CSV出力：いまのタブの検索条件のとおりの全件（ページ送りの前）。売上は購入（dm.app.purchases）の集計なので画面の列 */}
        <OpsCsvExport<object> screen={`購入管理（${t}）`} filters={[]} rows={() => csv.current.rows}
          columns={csv.current.cols.filter((c) => c.key[0] !== '_').map((c) => ({ label: c.label, get: (r: object) => (r as Record<string, unknown>)[c.key] }))} />
      </PageHead>
      <div className="card">
        <div className="tabs">{TABS.map(([k, l]) => <button key={k} className={tab === k ? 'on' : ''} onClick={() => { TAB = k; setTab(k); }}>{l}</button>)}</div>
        {tab === 'site' ? <SiteTab d={data} cond={cond} setCond={setCond} lv={lv} onShown={(c, r) => (csv.current = { cols: c, rows: r })} /> : tab === 'item' ? <ItemTab d={data} cond={cond} setCond={setCond} lv={lv} onShown={(c, r) => (csv.current = { cols: c, rows: r })} /> : <UserTab d={data} cond={cond} setCond={setCond} lv={lv} onShown={(c, r) => (csv.current = { cols: c, rows: r })} />}
      </div>
    </>
  );
}
type Shown = (cols: { key: string; label: string }[], rows: object[]) => void;
/** cond・setCond＝手元の条件（「検索」で効く）。lv＝ListView に渡す、検索・クリア・未適用の受け口 */
type CondProps = { cond: SalesArgs; setCond: (c: SalesArgs) => void; lv: { onReset: () => void; onApply: () => void; extraDirty: boolean } };

/** 3つのタブ共通の条件（RD-CM-028：期間・法人・拠点・カテゴリー（複数）。性別・年代（複数）はユーザーの登録情報） */
function SalesCond({ d, cond, setCond }: { d: Data } & Omit<CondProps, 'lv'>) {
  const set = (p: Partial<SalesArgs>) => setCond({ ...cond, ...p });
  const brs = d.branches.filter((b) => !cond.corpId || b.corpId === cond.corpId);
  return (
    <>
      {(['from', 'to'] as const).map((end) => {
        const label = `購入日（${end === 'from' ? 'から' : 'まで'}）`;
        return <div key={end}><DateInput className="inp" aria-label={label} placeholder={label} value={cond[end] ?? ''} onChange={(e) => set(end === 'from' ? { from: e.target.value } : { to: e.target.value })} /></div>;
      })}
      <div>
        <select className="sel" aria-label="法人" value={cond.corpId ?? ''} onChange={(e) => set({ corpId: e.target.value, branchId: '' })}>
          <option value="">法人</option>
          {d.corps.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>
      <div>
        <select className="sel" aria-label="拠点" value={cond.branchId ?? ''} onChange={(e) => set({ branchId: e.target.value })}>
          <option value="">拠点</option>
          {brs.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
      </div>
      <MultiCheck className="span2" label="カテゴリー" opts={d.cats} value={cond.cats ?? []} onChange={(v) => set({ cats: v })} />
      <MultiCheck label="性別" opts={d.genders} value={cond.genders ?? []} onChange={(v) => set({ genders: v })} />
      <MultiCheck label="年代" opts={d.ageGroups} value={cond.ageGroups ?? []} onChange={(v) => set({ ageGroups: v })} />
    </>
  );
}

/** 拠点別（元：slSite。キャッシュレスの内訳を開くと決済方法ごとの列が出る） */
function SiteTab({ d, cond, setCond, lv, onShown }: { d: Data; onShown: Shown } & CondProps) {
  const { toast } = useOps();
  const list = useList('sl-site');
  const [open, setOpen] = useState(false);
  type Row = SalesSite & Record<string, unknown>;
  const rows: Row[] = d.sites.map((r) => ({ ...r, ...Object.fromEntries(d.pay.map((_, j) => [`p${j}`, r.pay[j]])) }));
  const money = (k: string) => ['amt', 'refAmt', 'cl'].includes(k) || /^p\d+$/.test(k);
  const numTd = (k: string) => (r: Row) => <td className="num" style={k === 'cl' || /^p\d+$/.test(k) ? { background: '#FFF8E6' } : undefined}>{money(k) ? yen(+(r[k] as number)) : (+(r[k] as number)).toLocaleString()}</td>;
  const nums: [string, string][] = [['cnt', '購入数'], ['amt', '購入金額'], ['payN', '支払い回数'], ['refN', '返金回数'], ['refAmt', '返金金額'], ['cl', 'キャッシュレス計'], ...(open ? d.pay.map((p, j) => [`p${j}`, p] as [string, string]) : [])];
  const cols: ListCol<Row>[] = [
    { key: 'id', label: '拠点ID', td: (r) => <td className="mono">{r.id}</td> },
    { key: 'name', label: '拠点名', td: (r) => <td><button className="lnk u" onClick={() => toast(demoMsg('拠点の売上の詳細（日別）はデモの対象外です', '拠点の売上の詳細（日別）は準備中です'))}>{r.name}</button></td> },
    ...nums.map(([k, l]) => ({ key: k, label: l, num: true, td: numTd(k) })),
  ];
  const shown = list.apply(rows, 'status', ['id', 'name']);
  onShown(cols, shown);
  const sum = (k: string) => shown.reduce((a, r) => a + (+(r[k] as number) || 0), 0);
  const foot = (
    <tr style={{ background: '#EAF4FF', fontWeight: 700 }}>
      <td /><td colSpan={2}>合計</td>
      {cols.slice(2).map((c) => <td key={c.key} className="num">{money(c.key) ? yen(sum(c.key)) : sum(c.key).toLocaleString()}</td>)}
    </tr>
  );
  return (
    <>
      <ListView {...lv} list={list} filters={[{ t: 'search', ph: '拠点ID・拠点名', span: 2, keys: ['id', 'name'] }]} cols={cols} rows={rows} foot={foot} rowKey={(r) => r.id}
        extra={<><SalesCond d={d} cond={cond} setCond={setCond} /><div className="f-extra"><button className="btn out" onClick={() => setOpen(!open)}>{open ? 'キャッシュレスの内訳を閉じる' : 'キャッシュレスの内訳を開く'}</button></div></>} />
      <p className="muted" style={{ fontSize: '0.857143rem' }}>購入数・購入金額はアプリの購入（返金済みを含む）。Phase2 は現金なし（キャッシュレス計＝購入金額）。{DEMO && '数はデモの値。'}</p>
    </>
  );
}

/** 商品別（元：slItem）＋メニューの注文数・発注数ランキング（元：renderSales） */
function ItemTab({ d, cond, setCond, lv, onShown }: { d: Data; onShown: Shown } & CondProps) {
  const { toast } = useOps();
  const list = useList('sl-item');
  const [ym, setYm] = useState('2026-10');
  type Row = Data['items'][number];
  const cols: ListCol<Row>[] = [
    { key: 'pid', label: '品番', td: (r) => <td className="mono">{r.pid}</td> },
    { key: 'name', label: '商品名' },
    { key: 'menu', label: 'メニューID', td: (r) => <td className="mono">{r.menu}</td> },
    { key: 'cnt', label: '購入数', num: true, td: (r) => <td className="num">{r.cnt.toLocaleString()}</td> },
    { key: 'amt', label: '購入金額（税込）', num: true, td: (r) => <td className="num">{yen(r.amt)}</td> },
    { key: 'ord', label: 'オーダー件数', num: true, td: (r) => <td className="num">{r.ord.toLocaleString()}</td> },
    { key: 'fav', label: 'お気に入り件数', num: true, td: (r) => <td className="num">{r.fav.toLocaleString()}</td> },
  ];
  /* 並びの初めは購入数の多い順（RD-PY-042） */
  const items = [...d.items].sort((a, b) => b.cnt - a.cnt || a.pid.localeCompare(b.pid));
  onShown(cols, list.apply(items, 'status', ['pid', 'name', 'menu']));
  const rank = d.rank[ym] ?? [];
  const tot = rank.reduce((a, x) => a + x.order, 0) || 1;
  return (
    <>
      <ListView {...lv} list={list} filters={[{ t: 'search', ph: '品番・商品名・メニューID', span: 2, keys: ['pid', 'name', 'menu'] }, { t: 'select', ph: '全商品（月メニューで絞る）', col: 'menu', opts: [...new Set(d.items.map((x) => x.menu).filter(Boolean))].sort().reverse() }]} cols={cols} rows={items} rowKey={(r) => r.pid} extra={<SalesCond d={d} cond={cond} setCond={setCond} />} />
      <h3 style={{ margin: '1.428571rem 0 0.571429rem', fontSize: '1.142857rem' }}>メニューの注文数・発注数ランキング（法人の注文）</h3>
      <div>
        <div className="seg2" style={{ marginBottom: '0.857143rem' }}>
          <button className="on">商品別</button>
          <button onClick={() => toast(demoMsg('このデモでは「商品別」だけを作っています', '売上の推移は準備中です'))}>売上の推移</button>
        </div>
        <div style={{ display: 'flex', gap: '0.571429rem', alignItems: 'center', marginBottom: '0.857143rem' }}>
          <label htmlFor="sym" style={{ fontWeight: 700 }}>対象のメニュー</label>
          <select className="sel" id="sym" style={{ width: '12.857143rem' }} value={ym} onChange={(e) => setYm(e.target.value)}>{Object.keys(d.rank).map((m) => <option key={m} value={m}>{fmtYm(m)}</option>)}</select>
        </div>
        <div className="notice"><Icon name="bell" /><span>メニューの商品ごとに、全顧客の<b>注文数</b>と<b>発注数</b>を並べたランキングです（要件シート「月ごとの発注の割合」・REQ-PO-208）。アプリでの購入数は売上データとつなぐ段階で足します（{DEMO ? 'デモは' : 'いまは'}法人の注文数）。</span></div>
        <div className="tbl-wrap">
          <table className="tbl">
            <thead><tr><th className="num">順位</th><th>品番</th><th>商品名</th><th>カテゴリ</th><th className="num">注文数</th><th className="num">割合</th><th className="num">発注数（本発注・なければ仮発注）</th><th className="num">発注金額（税抜）</th></tr></thead>
            <tbody>{rank.map((x, i) => <tr key={x.pid}><td className="num">{i + 1}</td><td className="mono">{x.pid}</td><td>{x.name}</td><td>{x.cat}</td><td className="num">{x.order.toLocaleString()}</td><td className="num">{((x.order / tot) * 100).toFixed(1)}%</td><td className="num">{x.q.toLocaleString()}</td><td className="num">{yen(x.amt)}</td></tr>)}</tbody>
          </table>
        </div>
      </div>
    </>
  );
}

/** ユーザー別（元：slUser。返金は過去3ヶ月分まで） */
function UserTab({ d, cond, setCond, lv, onShown }: { d: Data; onShown: Shown } & CondProps) {
  const { openModal } = useOps();
  const canAct = useCanAct();
  const list = useList('sl-user');
  /* 3ヶ月より前の注文は返金できない（デモの今日 2026/10/05 → 2026/07/05） */
  const d0 = parseDate(today());
  d0.setMonth(d0.getMonth() - 3);
  const lim = formatDate(d0);
  const cols: ListCol<SalesUser>[] = [
    { key: 'uid', label: 'ユーザーID', td: (r) => <td className="mono">{r.uid}</td> },
    { key: 'no', label: '購入番号', td: (r) => <td className="mono">{r.no}</td> },
    { key: 'site', label: '拠点ID', td: (r) => <td className="mono">{r.site}</td> },
    { key: 'sname', label: '拠点名' },
    { key: 'amt', label: '支払金額（税込）', num: true, td: (r) => <td className="num">{yen(r.amt)}</td> },
    { key: 'pay', label: '決済方法' },
    { key: 'st', label: 'ステータス', td: (r) => <td><Badge v={r.st} /></td> },
    { key: 'reason', label: '返金理由' },
    { key: 'at', label: '注文日時' },
    { key: '_ref', label: '操作', td: (r) => {
      const old = r.at < lim, ok = r.st === '支払済' && !old;
      /* 権限がなければ出さない */
      if (!canAct(api, 'refund')) return <td />;
      return <td><button className="btn out" style={{ height: '2.285714rem', ...(ok ? { color: 'var(--ng)', borderColor: 'var(--ng)' } : {}) }} disabled={!ok} title={ok ? '返金する' : old ? '3ヶ月より前の注文は返金できません' : '返金できません'} onClick={() => openModal(<RefundModal no={r.no} />)}>返金</button></td>;
    } },
  ];
  const rows = list.apply(d.users, 'st', ['no', 'uid']);
  onShown(cols, rows);
  const paid = rows.filter((r) => r.st !== '返金済');
  const kpi = (l: string, v: string | number, u: string) => (
    <div style={{ flex: 1, minWidth: '14.285714rem', display: 'flex', alignItems: 'baseline', gap: '0.571429rem', background: '#EAF4FF', border: '1px solid #CFE3FA', borderRadius: 8, padding: '0.857143rem 1.142857rem' }}>
      <span style={{ flex: 1 }}>{l}</span><b style={{ fontSize: '1.571429rem' }}>{v}</b><small>{u}</small>
    </div>
  );
  const foot = (
    <tr style={{ background: '#EAF4FF', fontWeight: 700 }}>
      <td /><td colSpan={4}>合計（この条件の {rows.length}件・返金済みを含む）</td><td className="num">{yen(rows.reduce((a, r) => a + r.amt, 0))}</td><td colSpan={5} />
    </tr>
  );
  return (
    <>
      <div style={{ display: 'flex', gap: '0.857143rem', flexWrap: 'wrap', margin: '0.285714rem 0 0.857143rem' }}>
        {kpi('購入総個数（返金済みを除く）', paid.reduce((a, r) => a + r.qty, 0).toLocaleString(), '個')}{kpi('ユーザー総数', new Set(paid.map((r) => r.uid)).size, '人')}{kpi('合計支払金額（返金済みを除く）', paid.reduce((a, r) => a + r.amt, 0).toLocaleString(), '円')}
      </div>
      <ListView {...lv} list={list} statusKey="st" filters={[{ t: 'search', ph: '購入番号・ユーザーID', span: 2, keys: ['no', 'uid'] }, { t: 'select', ph: 'ステータス', col: 'st', opts: ['支払済', '返金中', '返金済'] }, { t: 'select', ph: '決済方法', col: 'pay', opts: d.pay }]} cols={cols} rows={d.users} foot={foot} rowKey={(r) => r.no} extra={<SalesCond d={d} cond={cond} setCond={setCond} />} />
      <p className="muted" style={{ fontSize: '0.857143rem' }}>返金処理は過去3ヶ月分まで対応できます（それより前はボタンが押せません）。Phase2 は現金の決済がないため、現金の返金はありません。</p>
    </>
  );
}

/** 返金（元：data-sl="refund" のダイアログ） */
function RefundModal({ no }: { no: string }) {
  const { closeModal, toast, toastError } = useOps();
  const [reason, setReason] = useState('注文が重複している');
  const ok = async () => {
    try { await api.action('refund', { no, reason }); closeModal(); toast('返金を受け付けました（返金中）'); } catch (e) { toastError(e); }
  };
  return (
    <div className="ov" onClick={(e) => e.target === e.currentTarget && closeModal()}>
      <div className="mbox" role="dialog" aria-modal="true" aria-label="返金" style={{ width: 'min(37.142857rem,100%)' }}>
        <div className="mbox-h"><h3>返金</h3><button className="icon-btn" aria-label="閉じる" onClick={closeModal}><Icon name="x" /></button></div>
        <div className="mbox-b">
          <p style={{ margin: '0 0 0.857143rem' }}>購入番号 <b className="mono">{no}</b> を返金します。決済の取消は各決済サービスで行われ、反映まで数日かかることがあります。</p>
          <Field label="返金理由" req>
            <select className="sel" value={reason} onChange={(e) => setReason(e.target.value)}>{['注文が重複している', '注文を間違えた', '商品が品切れだった', '商品に不具合があった', 'その他'].map((o) => <option key={o}>{o}</option>)}</select>
          </Field>
        </div>
        <div className="mbox-f"><button className="btn out" onClick={closeModal}>キャンセル</button><button className="btn pri" style={{ background: 'var(--ng)', borderColor: 'var(--ng)' }} onClick={ok}>返金する</button></div>
      </div>
    </div>
  );
}
