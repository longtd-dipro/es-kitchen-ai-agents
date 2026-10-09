'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { DEMO } from '@/lib/demo';
import { api, useSamples } from '@/lib/ops/purchasing/client';
import { prod } from '@/lib/ops/purchasing/master';
import {
  SMP_YMS, smItemsTxt, smOrderTxt, smSl, smSlW, smStats, smToday, smWeekLabel, smWeeks, smWhOpts, smYmL,
} from '@/lib/ops/purchasing/samples';
import type { Sample, WeekClose } from '@/lib/ops/purchasing/types';
import { nowStamp } from '@/lib/supplier/dates';
import { Icon } from '../../_ui/Icon';
import { stateCsvFilters, useOpsCsvExport } from '../../_ui/csv';
import { useOps } from '../../_ui/OpsProvider';
import { useCanAct, useScreenCan } from '../../_ui/perm';
import { ConfirmModal, PageHead } from '../../_ui/ui';
import { applyList, FilterBlock, ListTable, useList, type Col, type Filter } from '../_components/List';
import { Basis, MemoModal, SMF, SmBadge } from '../_components/samples';
import { fmtDate, fmtDateTime } from '@/lib/format/date';

/* 営業サンプル（一覧・受付締め）。元のデモの renderSmp */

const COLS: Col[] = [['no', 'サンプルNo'], ['reg', '受付日'], ['company', '宛先'], ['items', '商品'], ['deliv', '納品日'], ['ship', '発送日'], ['status', '状態'], ['memoBtn', '操作']];

const viewRows = (rows: Sample[]) => rows.slice().sort((a, b) => (a.ship < b.ship ? -1 : a.ship > b.ship ? 1 : a.no < b.no ? -1 : 1)).map((r) => ({
  _no: r.no, _moved: r.note ? 1 : 0, _note: r.note, _why: r.why || '', no: r.no, reg: fmtDate(r.regDate), company: r.company, addr: r.pref + r.city, pic: r.pic, by: r.by, items: smItemsTxt(r.items),
  qty: String(r.items.reduce((s, i) => s + i.qty, 0)), deliv: smSlW(r.deliv), ship: smSlW(r.ship), wh: r.wh, route: r.routeCarrier + (r.routeHub ? ' ／ ' + r.routeHub : ''), track: r.trackingNo, status: r.status, order: smOrderTxt(r), wk: smWeekLabel(r.week), ymL: smYmL(r.ym),
}));

function WeekCard({ rows, closed }: { rows: Sample[]; closed: WeekClose[] }) {
  const router = useRouter();
  const { openModal, toast, toastError } = useOps();
  const canAct = useCanAct();
  const close = (mon: string) => {
    const rs = rows.filter((r) => r.week === mon && r.status === '受付済');
    openModal(<ConfirmModal kind="warn" title="受付を締める" text={<>出荷週 {smWeekLabel(mon)} の受付を締めます。受付済の {rs.length}件に出荷指示を作ります。<br />締めた後に追加したサンプルは「締め後追加」と表示し、出荷指示は作りません。</>} ok="締める" okCls="warn-solid"
      onOk={async () => { try { const cnt = await api.action('closeWeek', { mon }); toast(`出荷週 ${smWeekLabel(mon)} の受付を締めました（出荷指示 ${cnt}件を作成${DEMO ? '。デモ' : ''}）`); } catch (e) { toastError(e); } }} />);
  };
  const reopen = (mon: string) => {
    const n = rows.filter((r) => r.week === mon && r.status === '締め済').length;
    openModal(<ConfirmModal kind="warn" title="締めを取り消す" text={<>出荷週 {smWeekLabel(mon)} の締めを取り消します。締め済の {n}件を受付済に戻し、出荷指示を取り消します。<br />締めた後に追加したサンプルはそのままです。取り消した後は、変更行の CSV を出力して再登録してください。</>} ok="締めを取り消す" okCls="warn-solid"
      onOk={async () => { try { const cnt = await api.action('reopenWeek', { mon }); toast(`出荷週 ${smWeekLabel(mon)} の締めを取り消しました（${cnt}件を受付済に戻しました${DEMO ? '。デモ' : ''}）。出荷指示を取り消しました。変更行のCSVを出力して再登録してください`); } catch (e) { toastError(e); } }} />);
  };
  return (
    <>
      <div className="sec-h" style={{ marginBottom: '0.857143rem' }}><h2>出荷週ごとの受付</h2></div>
      <p className="muted" style={{ margin: '0 0 0.714286rem' }}>出荷週は発送日の週（月曜〜日曜）。締めると、受付済のサンプルに出荷指示を作ります。締めた後に追加したサンプルは「締め後追加」と表示し、出荷指示を作りません。最初の発送日の前日までなら、締めを取り消せます。締め後の余りは、既存の「在庫戻しの出荷指示」で自社へ戻します（REQ-PO-603）。</p>
      <div className="tbl-wrap">
        <table className="tbl sm-ws">
          <thead><tr><th>出荷週</th><th className="num">サンプル</th><th>内訳</th><th>受付</th><th></th></tr></thead>
          <tbody>
            {smWeeks(rows, closed).map((mon) => {
              const rs = rows.filter((r) => r.week === mon);
              const c = closed.find((w) => w.id === mon);
              const cnt = (s: string) => rs.filter((r) => r.status === s).length;
              const firstShip = rs.map((r) => r.ship).sort()[0];
              const canReopen = !!c && (!firstShip || smToday() < firstShip);
              const parts = ['受付済', '締め済', '締め後追加'].filter((s) => cnt(s));
              return (
                <tr key={mon}>
                  <td className="l">{smWeekLabel(mon)}</td>
                  <td className="num">{rs.length}</td>
                  <td>{parts.length ? parts.map((s, i) => <span key={s}>{i > 0 && '　'}<SmBadge v={s} /> {cnt(s)}</span>) : <span className="muted">—</span>}</td>
                  <td>{c ? <><span className="badge b-ok">締め済</span> <span className="muted">{fmtDateTime(c.at)}</span></> : <span className="badge b-info">受付中</span>}</td>
                  <td style={{ textAlign: 'right' }}>{c
                    ? <>
                      {canAct(api, 'reopenWeek') && (canReopen
                        ? <button className="btn sm out" onClick={() => reopen(mon)}>締めを取り消す</button>
                        : <span className="muted">最初の発送日（{fmtDate(firstShip)}）を過ぎたため、取り消せません　</span>)}
                      <button className="btn sm out" onClick={() => { toast('締め後の余りは「在庫戻しの出荷指示」で自社へ戻します（REQ-PO-603）'); router.push('/ops/purchasing/stock/returns'); }}>余りを在庫へ戻す →</button>
                    </>
                    : canAct(api, 'closeWeek') && <button className="btn sm pri" onClick={() => close(mon)}>受付を締める</button>}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default function Page() {
  return <Suspense><SamplesPage /></Suspense>;
}

const TAB_WEEK = '出荷週の受付';

function SamplesPage() {
  const router = useRouter();
  const pathname = usePathname();
  const tab = useSearchParams().get('tab') === TAB_WEEK ? TAB_WEEK : 'list';
  const goTab = (k: string) => router.replace(k === 'list' ? pathname : `${pathname}?tab=${encodeURIComponent(k)}`);
  const { openModal } = useOps();
  const canCreate = useScreenCan()('create');
  const canAct = useCanAct();
  const csvExport = useOpsCsvExport();
  const { data } = useSamples();
  const [ym, setYmS] = useState(SMF.ym);
  const setYm = (v: string) => { SMF.ym = v; setYmS(v); };
  const [st, set] = useList('smp');
  if (!data) return <div className="card"><div className="empty">読み込み中…</div></div>;
  const { rows, closed, quota, targets } = data;
  const all = viewRows(rows);
  const yms = [...new Set([...Object.keys(quota), ...rows.map((r) => r.ym)])].sort().map(smYmL);
  const filters: Filter[] = [{ t: 'search', ph: 'サンプルNo・法人名・担当者', span: 2, keys: ['no', 'company', 'pic'] }, { t: 'select', ph: '出荷週', col: 'wk', opts: smWeeks(rows, closed).map(smWeekLabel) }, { t: 'select', ph: '月', col: 'ymL', opts: yms }, { t: 'select', ph: '倉庫', col: 'wh', opts: smWhOpts() }, { t: 'select', ph: '状態', col: 'status', opts: ['受付済', '締め済', '締め後追加'] }, { t: 'range', ph: '受付日', col: 'reg' }];
  const list = applyList(st, all, filters);
  const s = smStats(rows, ym, quota);
  const nT = targets.length;
  const cell = (c: Col, r: (typeof all)[number]) => {
    switch (c[0]) {
      case 'no': return <td className="mono"><button className="lnk u" onClick={() => router.push(`/ops/purchasing/samples/${encodeURIComponent(r.no)}`)}>{r.no}</button></td>;
      case 'company': return <td><div>{r.company}</div><div className="muted" style={{ lineHeight: '1.285714rem' }}>{r.addr}</div></td>;
      case 'items': return <td><div className="clip" style={{ maxWidth: '18.571429rem' }} title={r.items}>{r.items}</div></td>;
      case 'memoBtn': return <td>{canAct(api, 'updateSample') ? <button className="btn sm out" onClick={() => openModal(<MemoModal r0={rows.find((x) => x.no === r._no)!} />)}>メモ・送り状番号</button> : <span className="muted">—</span>}</td>;
      case 'qty': return <td className="num">{r.qty}</td>;
      case 'ship': return <td>{r.ship}{r._moved ? <> <span className="badge b-warn" title={r._note}>前倒し</span><div className="txt-warn" style={{ fontSize: '0.857143rem', lineHeight: '1.285714rem' }} title={r._note}>{r._why}のため</div></> : null}</td>;
      case 'status': return <td><SmBadge v={r.status} /></td>;
      case 'order': return <td className={r.status === '締め後追加' ? 'txt-warn' : r.status === '締め済' ? 'txt-ok' : ''}>{r.order}</td>;
      default: return <td>{String((r as Record<string, unknown>)[c[0]] ?? '')}</td>;
    }
  };
  /* CSV出力：検索条件のとおりの全件。1行＝サンプルの1商品（サンプルの項目をくり返す）＋営業サンプルの全部の項目（dm.sample.samples） */
  const csv = () => {
    type It = { r: (typeof rows)[number]; it: (typeof rows)[number]['items'][number] };
    const out: It[] = list.flatMap((v) => { const r = rows.find((x) => x.no === v._no); return r ? r.items.map((it) => ({ r, it })) : []; });
    return csvExport<It>({
      screen: '営業サンプル', filters: stateCsvFilters(st, filters), rows: out,
      columns: [
        { label: 'サンプルNo', get: (x) => x.r.no }, { label: '受付日', get: (x) => x.r.regDate }, { label: '法人名', get: (x) => x.r.company }, { label: '郵便番号', get: (x) => x.r.zip },
        { label: '住所', get: (x) => x.r.pref + x.r.city + x.r.town + (x.r.bld ? ' ' + x.r.bld : '') }, { label: '担当者名', get: (x) => x.r.pic }, { label: '登録者', get: (x) => x.r.by }, { label: '電話番号', get: (x) => x.r.tel },
        { label: '品番', get: (x) => x.it.pid }, { label: '商品', get: (x) => prod(x.it.pid)?.name ?? x.it.pid }, { label: '数量', type: 'int', get: (x) => x.it.qty },
        { label: '納品日', get: (x) => x.r.deliv }, { label: '発送日', get: (x) => x.r.ship }, { label: '倉庫', get: (x) => x.r.wh }, { label: '配送会社', get: (x) => x.r.routeCarrier }, { label: '中継先', get: (x) => x.r.routeHub }, { label: '送り状番号', get: (x) => x.r.trackingNo }, { label: 'リードタイム（日）', type: 'int', get: (x) => x.r.lead }, { label: '出荷週', get: (x) => smWeekLabel(x.r.week) },
        { label: '状態', get: (x) => x.r.status }, { label: '出荷指示', get: (x) => smOrderTxt(x.r) }, { label: '前倒しの理由', get: (x) => x.r.note }, { label: 'メモ', get: (x) => x.r.memo },
      ],
      source: { kind: 'dm.sample.samples', id: (x) => x.r.no, childKey: null },
    });
  };
  return (
    <>
      <PageHead crumbs={['発注・入荷', '営業サンプル']} title="営業サンプル">
        <button className="btn csv lg" onClick={csv}><Icon name="down" />CSV出力</button>
        {canCreate && <button className="btn pri lg" onClick={() => { SMF.form = null; router.push('/ops/purchasing/samples/new'); }}><Icon name="plus" />サンプルを登録</button>}
      </PageHead>
      {DEMO && <Basis>サンプル_仕様まとめ 決定 #5（一覧・CSV出力）・#6／REQ-PO-309（受付締め後も追加でき、締め後追加分は出荷指示を作らない）・#9／REQ-PO-603（締め後の余りは在庫戻しの出荷指示）・#10（納品日から発送日を逆算）／決定_STEP1回答 2026-10-01（専用の簡易登録・宛先だけ入力）／台帳 F 2026-10-08（宛先の履歴モーダルは作らない・メモと送り状番号の変更履歴）</Basis>}
      <div className="card">
        <div className="po-row" style={{ marginBottom: '0.857143rem' }}>
          <div className="seg2" role="group" aria-label="枠の月">{SMP_YMS.map((m) => <button key={m} className={m === ym ? 'on' : ''} onClick={() => setYm(m)}>{smYmL(m)}</button>)}</div>
        </div>
        <div className="kpis">
          <div><small>営業サンプル枠（{smYmL(ym)}の合計）</small><b>{s.q == null ? '未設定' : s.q + '件'}</b><small>メニュー管理 ＞ 月間メニューで設定</small></div>
          <div><small>受付済（宛先の数）</small><b>{s.used}件</b><small>宛先1か所＝1件</small></div>
          <div><small>残り枠</small><b className={s.rest != null && s.rest < 0 ? 'txt-ng' : ''}>{s.rest == null ? '—' : s.rest + '件'}</b><small>{s.rest != null && s.rest < 0 ? '枠を超えています' : '月の合計 − 受付済'}</small></div>
          <div><small>対象商品</small><b>{nT}品</b><small>月間メニューの「営業サンプル」・各2個（初期値）</small></div>
        </div>
      </div>
      <div className="card">
        <div className="tabs" role="tablist">
          {([['list', 'サンプル一覧'], [TAB_WEEK, TAB_WEEK]] as const).map(([k, l]) => <button key={k} role="tab" aria-selected={k === tab} className={k === tab ? 'on' : ''} onClick={() => goTab(k)}>{l}</button>)}
        </div>
      </div>
      {tab === TAB_WEEK ? <div className="card"><WeekCard rows={rows} closed={closed} /></div> : (
        <div className="card">
          <FilterBlock st={st} set={set} filters={filters} cols={COLS} />
          <ListTable st={st} set={set} cols={COLS} rows={list} cell={cell} rowKey={(r) => r.no} />
        </div>
      )}
    </>
  );
}
