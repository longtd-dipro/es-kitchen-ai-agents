'use client';

import { SortMenu } from '@/components/SortMenu';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@/lib/ops/core/client';
import { AP_ROUTES, AP_TABS, CHANGE_STATUSES, INTAKE_STATUSES } from '@/lib/ops/applications/constants';
import { chRows, pendingSplit, rangeError, tabCount, uniq, ymd } from '@/lib/ops/applications/logic';
import type { ApTab, IntakeRow, ListFilter } from '@/lib/ops/applications/types';
import { today } from '@/lib/supplier/dates';
import { useOpsCsvExport } from '../_ui/csv';
import { useOps } from '../_ui/OpsProvider';
import { useCanAct, useScreenCan } from '../_ui/perm';
import { api, getFilter, setFilter, tabFilter } from './_components/api';
import { Badge, Bg, Btn, Check, Dialog, Input, Pagination, PageHead, Ro, Select, Table, Tabs } from './_components/ds';
import { fmtDate, fmtDatesIn } from '@/lib/format/date';
import { DateInput, MonthInput } from '@/components/DateInput';

const NEW_SORTS: [string, string][] = [['no', '申請ID'], ['kubun', '契約区分'], ['company', '法人名'], ['plan', 'プラン'], ['course', 'コース'], ['eq', '設備区分'], ['ship', '配送区分'], ['cnt', '納品回数'], ['acct', 'アカウント状態'], ['es', 'ES営業担当'], ['st', 'ステータス'], ['date', '申請日']];
const CHG_SORTS: [string, string][] = [['no', '申請ID'], ['kind', '申請の種類'], ['company', '法人名'], ['head', '変更の内容'], ['start', '開始サイクル月'], ['dl', 'オーダー締切'], ['es', 'ES営業担当'], ['st', 'ステータス'], ['date', '申請日']];

/*
 * 契約申請管理（一覧）。元：11_運営_申請受付.html の APX.list（2026/09/28：実画面「契約申請管理」の内容に合わせた）。
 * タブ：新規契約（申込の受付）／契約変更・休止・解約（法人Webからの変更申請の承認）。申請IDを押すと申請詳細を開く。
 */
export default function ApplicationsListPage() {
  const router = useRouter();
  const { toast } = useOps();
  const canAct = useCanAct();
  const screenCan = useScreenCan();
  const { data } = useQuery(api, 'overview');
  const [f, setF] = useState<ListFilter>(getFilter);
  const [q, setQ] = useState(f.q);
  const [closed, setClosed] = useState<IntakeRow | null>(null);
  const [page, setPage] = useState(1);
  const [per, setPer] = useState(10);

  const put = (nf: ListFilter) => { setF(nf); setFilter(nf); };
  /* 条件は手元（d・q）に持ち、「検索」か Enter で一覧に効かせる（2026/10/03 決定）。タブを切り替えたときは、そのタブの条件に戻る */
  const [d, setD] = useState<ListFilter>(f);
  useEffect(() => { setD(f); setQ(f.q); }, [f]);
  const filt = (k: keyof ListFilter, v: string) => setD({ ...d, [k]: v });
  /* 申請日の範囲が逆のときは E08 を「まで」の下に出し、検索しない */
  const rangeMsg = rangeError(d);
  const applyQ = () => { if (rangeMsg) return; put({ ...d, q }); };

  const td = today();
  const intakes = useMemo(() => data?.intakes ?? [], [data]);
  const changes = useMemo(() => data?.changes ?? [], [data]);
  const rowsAll = useMemo(() => chRows(changes, td), [changes, td]);
  const tab = f.tab;

  /* 絞り込みはサーバー側（領域の search）。条件に合う申請の番号を一覧の並びで受け取る */
  const { data: hit } = useQuery(api, 'search', { f });
  const newRows = useMemo(() => (hit && tab === 'new' ? hit.nos.map((no) => intakes.find((x) => x.no === no)).filter((x): x is IntakeRow => !!x) : []), [hit, intakes, tab]);
  const tabAll = rowsAll.filter((r) => r.tab === tab);
  const chgRows = useMemo(() => (hit && tab !== 'new' ? hit.nos.map((no) => rowsAll.find((x) => x.no === no)).filter((x): x is (typeof rowsAll)[number] => !!x) : []), [hit, rowsAll, tab]);
  const n = tab === 'new' ? newRows.length : chgRows.length;
  /* 検索条件・タブが変わったら 1 ページ目へ */
  useEffect(() => { setPage(1); }, [f]);
  const pageNew = useMemo(() => newRows.slice((page - 1) * per, page * per), [newRows, page, per]);
  const pageChg = useMemo(() => chgRows.slice((page - 1) * per, page * per), [chgRows, page, per]);
  const base = (page - 1) * per;
  const split = pendingSplit(intakes, changes);

  /** 新規契約の行：却下・取り下げ済みは受付画面を開かず、理由と日時だけを出す（2026/09/29） */
  const openIntake = (x: IntakeRow) => {
    if (x.st === '却下' || x.st === '取り下げ済') { setClosed(x); return; }
    router.push(`/ops/applications/${x.no}`);
  };

  /** 表示中の条件で CSV を出力する（共通の仕組み：検索条件のとおりの全件・申請の全部の項目＝dm.apply.applications） */
  const csvExport = useOpsCsvExport();
  const exportCsv = () => {
    const LBL: Record<string, string> = { q: '検索', kubun: '契約区分', plan: 'プラン', course: 'コース', eq: '設備区分', es: 'ES営業担当', st: 'ステータス', route: '受付経路', kind: '申請の種類', br: '拠点', st2: '状態', from: '申請日（から）', to: '申請日（まで）', corp: '法人', start: '開始サイクル月', over: 'オーダー締切を過ぎたもの' };
    const filters = [{ label: 'タブ', value: AP_TABS.find((t) => t[0] === tab)?.[1] ?? tab },
      ...Object.entries(f).filter(([k, v]) => k in LBL && v).map(([k, v]) => ({ label: LBL[k], value: String(v) }))];
    if (tab === 'new') {
      return csvExport<IntakeRow>({
        screen: '契約申請管理', filters, rows: newRows, source: { kind: 'dm.apply.applications', id: (x) => x.no },
        columns: [['申請ID', 'no'], ['契約区分', 'kubun'], ['法人名', 'company'], ['拠点名', 'branch'], ['プラン', 'plan'], ['コース', 'course'], ['設備区分', 'eq'], ['配送区分', 'ship'], ['納品回数', 'cnt'], ['アカウント状態', 'acct'], ['ES営業担当', 'es'], ['ステータス', 'st'], ['申請日', 'date']]
          .map(([label, k]) => ({ label, get: (x: IntakeRow) => (x as unknown as Record<string, unknown>)[k] })),
      });
    }
    type Ch = (typeof chgRows)[number];
    return csvExport<Ch>({
      screen: '契約申請管理', filters, rows: chgRows, source: { kind: 'dm.apply.applications', id: (r) => r.no },
      columns: [
        { label: '申請ID', get: (r) => r.no }, { label: '申請の種類', get: (r) => r.kind }, { label: '法人名', get: (r) => r.company }, { label: '拠点名', get: (r) => r.br },
        { label: '変更の内容', get: (r) => r.head }, { label: '開始サイクル月', get: (r) => r.start }, { label: 'オーダー締切', get: (r) => (r.dl ? ymd(r.dl.close) : '') },
        { label: 'ES営業担当', get: (r) => r.es }, { label: 'ステータス', get: (r) => r.st.t }, { label: '申請日', get: (r) => r.date },
      ],
    });
  };

  const sel = (key: keyof ListFilter, opts: string[], ph: string) => (
    <div><Select value={String(d[key] ?? '')} opts={opts} ph={ph} onChange={(v) => filt(key, v)} /></div>
  );
  /* 台帳 運営A Q5：3つのタブ共通の追加条件（申請日の範囲・法人・開始サイクル月） */
  const dateBox = (key: 'from' | 'to', label: string) => (
    <div className="es-field" style={{ minWidth: '12rem' }}>
      <div className="es-input es-input--md"><DateInput fill value={String(d[key] ?? '')} placeholder={`${label} yyyy-mm-dd`} aria-label={label} onChange={(e) => filt(key, e.target.value)} /></div>
      {key === 'to' && rangeMsg && <p className="es-field__msg es-field__msg--error">{rangeMsg}</p>}
    </div>
  );
  const extra = (companies: string[]) => (
    <>
      {dateBox('from', '申請日（から）')}
      {dateBox('to', '申請日（まで）')}
      <div><Select value={String(d.corp ?? '')} opts={companies} ph="法人" aria="法人" onChange={(v) => filt('corp', v)} /></div>
      <div className="es-field" style={{ minWidth: '10rem' }}>
        <div className="es-input es-input--md"><MonthInput fill value={String(d.start ?? '')} placeholder="開始サイクル月 yyyy-mm" aria-label="開始サイクル月" onChange={(e) => filt('start', e.target.value)} /></div>
      </div>
    </>
  );
  /* 並べ替え：一覧の全列から選ぶ＋昇順／降順（台帳 K「一覧の決まり」） */
  const sortSel = (opts: [string, string][]) => {
    const key = d.sort === 'id' ? 'no' : d.sort;
    const dir = d.dir ?? (key === 'date' ? 'desc' : 'asc');
    return <SortMenu options={opts} value={key} dir={dir} onChange={(k, dd) => setD({ ...d, sort: k, dir: dd })} />;
  };
  const search = <Input value={q} icon="Search" ph="申請ID・法人名・拠点名・担当者名" onChange={setQ} onEnter={applyQ} />;

  return (
    <div id="apx">
      <div className="page" id="apxbody">
        <PageHead crumb={['契約申請管理']} title="契約申請管理" actions={<>
          <button type="button" className="es-btn es-btn--csv es-btn--lg" onClick={exportCsv}>
            <svg className="es-icon" width="20" height="20" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 18v7.5a1.5 1.5 0 0 0 1.5 1.5h19a1.5 1.5 0 0 0 1.5-1.5V18" /><path d="M16 4v17" /><path d="M10 15l6 6 6-6" /></svg>
            CSV出力
          </button>
          {tab === 'new' && screenCan('csvImport') && (
            /* 新規申込の一括登録（CSV・2026/10/03 決定）：取込の画面（新規申込CSV取込）へ進む。台帳 F：ボタンは『CSV出力』『CSV取込』の順 */
            <button type="button" className="es-btn es-btn--csv es-btn--lg" onClick={() => router.push('/ops/applications/import')}>
              <svg className="es-icon" width="20" height="20" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 18v7.5a1.5 1.5 0 0 0 1.5 1.5h19a1.5 1.5 0 0 0 1.5-1.5V18" /><path d="M16 21V4" /><path d="M10 10l6-6 6 6" /></svg>
              CSV取込
            </button>
          )}
          {/* 権限がなければ出さない */}
          {tab === 'new'
            ? screenCan('create') && <Btn icon="Plus" size="lg" onClick={() => router.push('/ops/applications/proxy/new')}>新規登録（代理入力）</Btn>
            : canAct(api, 'createChanges') && <Btn icon="Plus" size="lg" onClick={() => router.push(`/ops/applications/proxy/${tab}`)}>変更申請の代理入力</Btn>}
        </>} />
        <section className="es-card apxcard">
          <Tabs items={AP_TABS.map(([k, label]) => ({
            key: k, label, on: tab === k, onClick: () => { const nf = tabFilter(k as ApTab, q); put(nf); },
            count: tabCount(k, intakes, changes) || null,
            /* RV4-OPS-20261002 #1：新規契約タブに内訳（受付中／契約設定中） */
            sub: k === 'new' && (split.u || split.c) ? <span className="apx-tabsub" style={{ marginLeft: '0.428571rem', fontSize: '0.857143rem', fontWeight: 400, color: 'var(--text-low)' }}>受付中 {split.u}／契約設定中 {split.c}</span> : undefined,
          }))} />
          <div className="es-search" id="apxf">
            <div className="es-search__left">
              <div className="es-search__fields">
                <div className="es-grow">{search}</div>
                {tab === 'new' ? (
                  <>
                    {sel('kubun', ['本導入', 'お試し', '切替'], '契約区分')}
                    {sel('plan', uniq(intakes.map((x) => x.plan)), 'プラン')}
                    {sel('course', ['ESライト', 'ESスタンダード'], 'コース')}
                    {sel('eq', uniq(intakes.map((x) => x.eq)), '設備区分')}
                    {sel('es', uniq(intakes.map((x) => x.es)), 'ES営業担当')}
                    {sel('st', INTAKE_STATUSES, 'ステータス')}
                    {sel('route', AP_ROUTES, '受付経路')}
                    {extra(uniq(intakes.map((x) => x.company)))}
                    {sortSel(NEW_SORTS)}
                  </>
                ) : (
                  <>
                    {sel('kind', uniq(tabAll.map((r) => r.kind)), '申請の種類')}
                    {sel('br', uniq(tabAll.flatMap((r) => r.brs)), '拠点')}
                    {sel('st2', CHANGE_STATUSES, 'ステータス')}
                    {sel('route', AP_ROUTES, '受付経路')}
                    <div><Select value={String(d.es ?? '')} opts={uniq(tabAll.map((r) => r.es))} ph="ES営業担当" aria="ES営業担当" onChange={(v) => filt('es', v)} /></div>
                    {extra(uniq(tabAll.map((r) => r.company)))}
                    <div className="es-field" style={{ alignSelf: 'center' }}><Check checked={!!d.over} onChange={(on) => filt('over', on ? '1' : '')}>オーダー締切を過ぎたもの</Check></div>
                    {sortSel(CHG_SORTS)}
                  </>
                )}
              </div>
            </div>
            <div className="es-search__actions">
              <div className="es-search__main">
                <Btn variant="outline" onClick={() => { setQ(''); put({ tab, q: '', sort: tab === 'new' ? 'no' : 'date' }); }}>クリア</Btn>
                <Btn onClick={applyQ}>検索</Btn>
              </div>
            </div>
          </div>
          {tab === 'new' ? (
            <Table cls="apx-list" head={['No', '申請ID', '契約区分', '法人名／拠点名', 'プラン', 'コース', '設備区分', '配送区分', '納品回数', 'アカウント状態', 'ES営業担当', 'ステータス', '申請日']}>
              {!data || !hit ? null : n ? pageNew.map((x, k) => {
                const m = String(x.cnt).match(/^(.*?)（(.+)）$/);
                return (
                  <tr key={x.no} className={x.fresh ? 'is-selected' : ''}>
                    <td>{base + k + 1}</td>
                    <td>
                      <a href="#" className="idlink" onClick={(e) => { e.preventDefault(); openIntake(x); }}>{x.no}</a>
                      {x.route && <div className="mm"><Badge>代理入力</Badge> {x.route}</div>}
                    </td>
                    <td>{x.kubun}</td>
                    <td><b>{x.company}</b><div className="mm">{x.branch}</div></td>
                    <td>{x.plan}</td><td>{x.course}</td><td>{x.eq}</td><td>{x.ship}</td>
                    <td>{m ? <>{m[1]}<div className="mm">（{m[2]}）</div></> : x.cnt}</td>
                    <td><Bg>{x.acct}</Bg></td>
                    <td>{x.es}</td>
                    <td><Bg>{x.st}</Bg></td>
                    <td>{fmtDate(x.date)}</td>
                  </tr>
                );
              }) : <tr><td colSpan={13} style={{ textAlign: 'center', color: 'var(--text-low)' }}>条件に合う申請はありません</td></tr>}
            </Table>
          ) : (
            <Table cls="apx-list" head={['No', '申請ID', '申請の種類', '法人名／拠点名', '変更の内容', '開始サイクル月', 'オーダー締切', 'ES営業担当', 'ステータス', '申請日']}>
              {!data || !hit ? null : n ? pageChg.map((r, k) => (
                <tr key={r.no}>
                  <td>{base + k + 1}</td>
                  <td>
                    <Link href={`/ops/applications/${r.no}`} className="idlink">{r.no}</Link>
                    {r.a.proxy && <div className="mm"><Badge>代理入力</Badge></div>}
                  </td>
                  <td><Badge tone="primary">{r.kind}</Badge></td>
                  <td><b>{r.company}</b><div className="mm">{r.br}</div></td>
                  <td className="apx-head">{fmtDatesIn(r.head)}</td>
                  <td className="apx-st">{fmtDatesIn(r.start)}</td>
                  <td>{r.dl ? (r.dl.d >= 0
                    ? <><span className={r.dl.d <= 3 ? 'apx-warn' : ''}>あと {r.dl.d}日</span><div className="mm">{fmtDate(r.dl.close)}</div></>
                    : <span className="apx-dang">{-r.dl.d}日 超過</span>) : <span className="mut">—</span>}</td>
                  <td>{r.es}</td>
                  <td><Bg>{r.st.t}</Bg></td>
                  <td>{fmtDate(r.date)}</td>
                </tr>
              )) : <tr><td colSpan={10} style={{ textAlign: 'center', color: 'var(--text-low)' }}>条件に合う申請はありません</td></tr>}
            </Table>
          )}
          <Pagination total={n} per={per} page={page} onPage={setPage} onPer={(v) => { setPer(v); setPage(1); }} />
        </section>
      </div>
      {closed && (
        <Dialog title="申請詳細" id={closed.no} width="560px" onClose={() => setClosed(null)} foot={<Btn variant="outline" onClick={() => setClosed(null)}>閉じる</Btn>}>
          <div className="es-formgrid" style={{ gridTemplateColumns: '1fr' }}>
            <Ro label="法人／拠点">{closed.company}／{closed.branch}</Ro>
            <Ro label="ステータス"><Bg>{closed.st}</Bg></Ro>
            <Ro label={closed.st === '却下' ? '却下した人・日時' : '取り下げ日時'}>{closed.by || '—'}</Ro>
            <Ro label={closed.st === '却下' ? '却下理由' : '取り下げ理由'}>{closed.reason || '—'}{closed.memo && <div className="mm">{closed.memo}</div>}</Ro>
          </div>
        </Dialog>
      )}
    </div>
  );
}
