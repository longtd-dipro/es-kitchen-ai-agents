'use client';

import { CorpCsvExport } from '../_ui/csv';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import corpDocs from '@/lib/corp/areas/corp-docs';
import { PAY } from '@/lib/corp/docs/seed';
import { sortRows } from '@/lib/corp/docs/logic';
import { today } from '@/lib/supplier/dates';
import { areaApi, useQuery } from '@/lib/ops/core/client';
import { useCorpSignedIn } from '../_ui/CorpProvider';
import { useWho } from '../_docs/ds';
import { Pager, SalesPage, SBadge, SortCtl, SSel, yen } from './_components/SalesParts';
import { DateInput } from '@/components/DateInput';
import { fmtDate, fmtDateTime } from '@/lib/format/date';
import { APP_AGES, APP_GENDERS } from '@/lib/domain/areas/app';

const api = areaApi(corpDocs);

/** 購入・ユーザー管理（2026/10/02 名称変更・REQ-UI-004。旧：売上・ユーザー管理） */
export default function Page() {
  return <Suspense><Sales /></Suspense>;
}

/* 拠点・性別・年代は購入とユーザーの両方のタブで使う（性別・年代の絞り込み：台帳 E 2026-10-05） */
const S0 = { site: '', gender: '', age: '', q: '', st: '', pay: '', from: '2026-09-28', to: '2026-10-05', sk: '', dir: 'asc' as 'asc' | 'desc', page: 1, size: 10 };
const U0 = { uq: '', ulink: '', usk: '', udir: 'asc' as 'asc' | 'desc', upage: 1, usize: 10 };

/**
 * 購入・ユーザー管理（旧：売上・ユーザー管理。S7C-20261001：フェーズ1 の売上管理・ユーザー一覧を法人Web の画面として作り直し。元：iframe fsl）。
 * 法人アカウント＝自社のすべての拠点、拠点アカウント＝自分の拠点だけ（§10-7）。一覧は10件（10／20／50）・並べ替え（項目＋昇順／降順）。
 * 現金は Phase2 で扱わない（決済方法に出さない）。タブは ?tab=users（ユーザー一覧）
 * QR コード出力は法人情報の画面へ移した（REQ-UI-009・2026/10/02）
 */
function Sales() {
  const { account } = useCorpSignedIn();
  const who = useWho();
  const router = useRouter();
  const sp = useSearchParams();
  const tab = sp.get('tab') === 'users' ? 'users' : 'sales';
  const { data } = useQuery(api, 'sales', { who });
  const [f, setF] = useState(S0);
  const [u, setU] = useState(U0);
  if (!data) return <SalesPage head={null}>{null}</SalesPage>;

  const sites = data.sites, multi = sites.length > 1, siteOf = (id: string) => sites.find((x) => x.id === id);
  const set = (p: Partial<typeof S0>) => setF((o) => ({ ...o, ...p, page: 'page' in p ? p.page! : 1 }));
  const setu = (p: Partial<typeof U0>) => setU((o) => ({ ...o, ...p, upage: 'upage' in p ? p.upage! : 1 }));
  const siteOpts = sites.map((x) => [x.id, x.s] as [string, string]);

  const salesRows = data.buys.filter((r) => {
    if (f.site && r.site !== f.site) return false;
    if (f.gender && r.gender !== f.gender) return false;
    if (f.age && r.age !== f.age) return false;
    const d = r.at.slice(0, 10).replace(/\//g, '-');
    if (f.from && d < f.from) return false;
    if (f.to && d > f.to) return false;
    if (f.q && (r.no + r.uid).toLowerCase().indexOf(f.q.toLowerCase()) < 0) return false;
    if (f.st && r.st !== f.st) return false;
    if (f.pay && r.pay !== f.pay) return false;
    return true;
  });
  const userRows = data.users.filter((x) => {
    if (f.site && x.site !== f.site) return false;
    if (f.gender && x.gender !== f.gender) return false;
    if (f.age && x.age !== f.age) return false;
    if (u.uq && (x.id + x.emp).toLowerCase().indexOf(u.uq.toLowerCase()) < 0) return false;
    if (u.ulink && x.link !== u.ulink) return false;
    return true;
  });
  const goTab = (t: string) => router.replace(t === 'users' ? '/corp/sales?tab=users' : '/corp/sales');

  const head = (
    <header className="es-pagehead">
      <div className="es-pagehead__text">
        <nav className="es-breadcrumb" aria-label="パンくず"><span className="es-breadcrumb__cur">購入・ユーザー管理</span></nav>
        <h1 className="es-pagehead__title">購入・ユーザー管理</h1>
        <div style={{ fontSize: '0.857143rem', color: 'var(--text-low)' }}>{account.label}・{multi ? '自社のすべての拠点' : 'この拠点だけ'}・今日 {fmtDate(today())}</div>
      </div>
      <div className="es-pagehead__actions">
        {/* CSV出力：いまのタブの検索条件のとおりの全件（見てよい拠点だけ）。購入＝アプリの購入（dm.app.purchases）、ユーザー＝画面の列（メールアドレスは出さない） */}
        {tab === 'sales'
          ? <CorpCsvExport<(typeof salesRows)[number]> className="es-btn es-btn--solid es-btn--primary es-btn--md" screen="購入管理" rows={sortRows(salesRows, f.sk, f.dir)}
            filters={[{ label: '検索', value: f.q }, { label: '拠点', value: f.site ? siteOf(f.site)?.s ?? f.site : '' }, { label: '性別', value: f.gender }, { label: '年代', value: f.age }, { label: '期間', value: f.from || f.to ? `${f.from}〜${f.to}` : '' }, { label: '状態', value: f.st }, { label: '決済方法', value: f.pay }]}
            columns={[{ label: '購入番号', get: (r) => r.no }, { label: 'ユーザーID', get: (r) => r.uid }, { label: '性別', get: (r) => r.gender }, { label: '年代', get: (r) => r.age }, { label: '拠点ID', get: (r) => r.site }, { label: '拠点', get: (r) => siteOf(r.site)?.s },
              { label: '商品', get: (r) => r.item }, { label: '購入個数', type: 'int', get: (r) => r.qty }, { label: '支払金額（税込）', type: 'money', get: (r) => r.amt }, { label: '決済方法', get: (r) => r.pay },
              { label: '状態', get: (r) => r.st }, { label: '返金理由', get: (r) => r.reason }, { label: '注文日時', get: (r) => r.at }]}
            source={{ kind: 'dm.app.purchases', id: (r) => r.no }} />
          : <CorpCsvExport<(typeof userRows)[number]> className="es-btn es-btn--solid es-btn--primary es-btn--md" screen="ユーザー一覧" rows={userRows}
            filters={[{ label: '拠点', value: f.site ? siteOf(f.site)?.s ?? f.site : '' }, { label: '性別', value: f.gender }, { label: '年代', value: f.age }, { label: '検索', value: u.uq }, { label: '連携状態', value: u.ulink }]}
            columns={[{ label: 'ユーザーID', get: (x) => x.id }, { label: '社員ID', get: (x) => x.emp }, { label: '性別', get: (x) => x.gender }, { label: '年代', get: (x) => x.age }, { label: '拠点ID', get: (x) => x.site }, { label: '拠点', get: (x) => siteOf(x.site)?.s },
              { label: '連携状態', get: (x) => x.link }, { label: '購入制限', get: (x) => x.limit }, { label: '連携日', get: (x) => x.since }]} />}
      </div>
    </header>
  );

  let body;
  if (tab === 'sales') {
    const all = sortRows(salesRows, f.sk, f.dir), paid = all.filter((r) => r.st !== '返金済');
    const qty = paid.reduce((a, r) => a + r.qty, 0), amt = paid.reduce((a, r) => a + r.amt, 0);
    const users = new Set(paid.map((r) => r.uid)).size;
    const start = (f.page - 1) * f.size, rows = all.slice(start, start + f.size);
    const tot = all.reduce((a, r) => a + r.qty, 0), totA = all.reduce((a, r) => a + r.amt, 0);
    const kpi = (lab: string, v: string | number, unit: string) => <div className="s7-kpi"><span>{lab}</span><b className="es-num">{v}</b><small>{unit}</small></div>;
    body = (
      <>
        <div className="s7-kpis">{kpi('購入総個数（返金済みを除く）', qty.toLocaleString(), '個')}{kpi('ユーザー総数', users, '人')}{kpi('合計支払金額（返金済みを除く）', amt.toLocaleString(), '円')}</div>
        <div className="es-search" style={{ marginTop: '0.857143rem' }}>
          <div className="s7-flt">
            <SearchBox ph="購入番号・ユーザーID" value={f.q} onEnter={(v) => set({ q: v })} />
            {multi ? <SSel value={f.site} opts={siteOpts} ph="すべての拠点" w={170} onChange={(v) => { set({ site: v }); setu({}); }} /> : null}
            <SSel value={f.gender} opts={APP_GENDERS} ph="性別" w={110} onChange={(v) => { set({ gender: v }); setu({}); }} />
            <SSel value={f.age} opts={APP_AGES} ph="年代" w={120} onChange={(v) => { set({ age: v }); setu({}); }} />
            <div className="es-input es-input--md"><DateInput fill value={f.from} aria-label="期間（から）" onChange={(e) => set({ from: e.target.value })} /></div>
            <span style={{ alignSelf: 'center' }}>〜</span>
            <div className="es-input es-input--md"><DateInput fill value={f.to} aria-label="期間（まで）" onChange={(e) => set({ to: e.target.value })} /></div>
            <SSel value={f.st} opts={['支払済', '返金中', '返金済']} ph="状態" w={140} onChange={(v) => set({ st: v })} />
            <SSel value={f.pay} opts={PAY} ph="決済方法" w={150} onChange={(v) => set({ pay: v })} />
            <SortCtl cols={[['at', '注文日時'], ['amt', '支払金額'], ['qty', '購入個数'], ['uid', 'ユーザーID'], ['site', '拠点']]} sk={f.sk} dir={f.dir} onSk={(v) => set({ sk: v })} onDir={() => setF((o) => ({ ...o, dir: o.dir === 'desc' ? 'asc' : 'desc' }))} />
            <button type="button" className="es-btn es-btn--outline es-btn--primary es-btn--md" onClick={() => setF(S0)}>クリア</button>
          </div>
        </div>
        <div className="es-table-wrap" style={{ marginTop: '0.857143rem' }}>
          <table className="es-table s7-tbl">
            <thead><tr><th>No</th><th>ユーザーID</th><th>購入番号</th>{multi ? <th>拠点</th> : null}<th>商品</th><th className="r">購入個数</th><th className="r">支払金額（税込）</th><th>決済方法</th><th>状態</th><th>返金理由</th><th>注文日時</th></tr></thead>
            <tbody>
              {rows.length ? rows.map((r, i) => (
                <tr key={r.id}>
                  <td className="es-num">{start + i + 1}</td>
                  <td className="es-mono"><Link href={`/corp/sales/users/${r.uid}`}>{r.uid}</Link></td>
                  <td className="es-mono">{r.no}</td>
                  {multi ? <td>{siteOf(r.site)?.s}</td> : null}
                  <td>{r.item}</td><td className="es-num r">{r.qty}</td><td className="es-num r">{yen(r.amt)}</td>
                  <td>{r.pay}</td><td><SBadge t={r.st} /></td><td>{r.reason}</td><td className="es-num">{fmtDateTime(r.at)}</td>
                </tr>
              )) : <tr><td colSpan={11} style={{ textAlign: 'center', color: 'var(--text-low)', padding: '1.714286rem' }}>該当するデータがありません。</td></tr>}
              <tr className="s7-tot">
                <td /><td colSpan={multi ? 4 : 3}><b>合計（この条件の {all.length}件）</b></td>
                <td className="es-num r"><b>{tot}</b></td><td className="es-num r"><b>{yen(totA)}</b></td>
                <td colSpan={4} style={{ color: 'var(--text-low)', fontSize: '0.857143rem' }}>返金済みを含む。上の合計支払金額は返金済みを除く</td>
              </tr>
            </tbody>
          </table>
        </div>
        <Pager total={all.length} page={f.page} size={f.size} onPage={(p) => setF((o) => ({ ...o, page: p }))} onSize={(n) => set({ size: n })} />
        <p className="s7-note">返金は運営が行います（法人Web では見るだけ）。決済はキャッシュレスだけ（現金は Phase2 で扱わない）。</p>
      </>
    );
  } else {
    const all = sortRows(userRows, u.usk, u.udir), start = (u.upage - 1) * u.usize, rows = all.slice(start, start + u.usize);
    body = (
      <>
        <div className="es-search">
          <div className="s7-flt">
            <SearchBox ph="ユーザーID・社員ID" value={u.uq} onEnter={(v) => setu({ uq: v })} />
            {multi ? <SSel value={f.site} opts={siteOpts} ph="すべての拠点" w={170} onChange={(v) => { set({ site: v }); setu({}); }} /> : null}
            <SSel value={f.gender} opts={APP_GENDERS} ph="性別" w={110} onChange={(v) => { set({ gender: v }); setu({}); }} />
            <SSel value={f.age} opts={APP_AGES} ph="年代" w={120} onChange={(v) => { set({ age: v }); setu({}); }} />
            <SSel value={u.ulink} opts={['連携中', '解除済']} ph="連携状態" w={150} onChange={(v) => setu({ ulink: v })} />
            <SortCtl cols={[['id', 'ユーザーID'], ['since', '連携日'], ['site', '拠点']]} sk={u.usk} dir={u.udir} onSk={(v) => setu({ usk: v })} onDir={() => setU((o) => ({ ...o, udir: o.udir === 'desc' ? 'asc' : 'desc' }))} />
            <button type="button" className="es-btn es-btn--outline es-btn--primary es-btn--md" onClick={() => { setU(U0); set({ site: '', gender: '', age: '' }); }}>クリア</button>
          </div>
        </div>
        <div className="es-table-wrap" style={{ marginTop: '0.857143rem' }}>
          <table className="es-table s7-tbl">
            <thead><tr><th>No</th><th>ユーザーID</th><th>社員ID</th>{multi ? <th>拠点</th> : null}<th>連携状態</th><th>購入制限</th><th>連携日</th></tr></thead>
            <tbody>
              {rows.length ? rows.map((x, i) => (
                <tr key={x.id}>
                  <td className="es-num">{start + i + 1}</td>
                  <td className="es-mono"><Link href={`/corp/sales/users/${x.id}`}>{x.id}</Link></td>
                  <td>{x.emp || '—'}</td>{multi ? <td>{siteOf(x.site)?.s}</td> : null}
                  <td><SBadge t={x.link} /></td><td><SBadge t={x.limit} /></td><td className="es-num">{fmtDate(x.since)}</td>
                </tr>
              )) : <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-low)', padding: '1.714286rem' }}>該当するデータがありません。</td></tr>}
            </tbody>
          </table>
        </div>
        <Pager total={all.length} page={u.upage} size={u.usize} onPage={(p) => setU((o) => ({ ...o, upage: p }))} onSize={(n) => setu({ usize: n })} />
      </>
    );
  }

  return (
    <SalesPage head={head}>
      <div className="es-card">
        <div className="es-tabs" role="tablist">
          <button type="button" role="tab" className={`es-tab${tab === 'sales' ? ' is-active' : ''}`} onClick={() => goTab('sales')}>購入管理</button>
          <button type="button" role="tab" className={`es-tab${tab === 'users' ? ' is-active' : ''}`} onClick={() => goTab('users')}>ユーザー一覧</button>
        </div>
        {body}
      </div>
    </SalesPage>
  );
}

/** 文字の検索（元は Enter か、ほかの欄を変えたときに絞り込む） */
function SearchBox({ ph, value, onEnter }: { ph: string; value: string; onEnter: (v: string) => void }) {
  const [v, setV] = useState(value);
  return (
    <div className="es-input es-input--md" style={{ minWidth: '17.142857rem', flex: 1 }}>
      <input placeholder={ph} value={v} onChange={(e) => setV(e.target.value)} onBlur={() => { if (v !== value) onEnter(v); }} onKeyDown={(e) => { if (e.key === 'Enter') onEnter(v); }} />
    </div>
  );
}
