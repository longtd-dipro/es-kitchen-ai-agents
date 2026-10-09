'use client';

import Link from 'next/link';
import { useState, type ReactNode } from 'react';
import { areaApi, useQuery } from '@/lib/ops/core/client';
import type { DashData, DashFav, DashFavArgs, DashLine, DashLineArgs } from '@/lib/ops/general/types';
import { MultiCheck, UnappliedMark } from './_general/list';
import { MonthInput } from '@/components/DateInput';
import { AREAS } from '@/lib/ops/registry';
import { parseDate, today } from '@/lib/supplier/dates';
import { api, Loading } from './_general/parts';
import { PageHead, yen } from './_ui/ui';
import { fmtDate, fmtMd, fmtYm } from '@/lib/format/date';
import dmBilling from '@/lib/domain/areas/billing';
import { useOps } from './_ui/OpsProvider';
import { useCanAct } from './_ui/perm';
import { domainApi, useDomainQuery } from '@/lib/domain/client';

/*
 * ダッシュボード（元：renderDash。S7C-20261001。最初に開く画面）。
 * 1段目＝お知らせ（アラート一覧）＋小さいスケジュール、2段目＝月次購入額推移、3段目＝お気に入り × 購入分析（横いっぱい）。
 * 支払い方法別のグラフは置かない（2026/10/03 決定）。グラフには条件（期間・法人・拠点・カテゴリ）があり、「検索」か Enter で効く（一覧と同じ）。
 * 「売上」は「購入」と書く（議事録：売上管理 → 購入管理）。グラフの数はデモの値。アラート一覧・スケジュールは共通データから作る（REQ-UI-001・002・2026/10/02。lib/ops/general/top.ts）。
 */
export default function DashPage() {
  const { data: D, error: dashErr, reload: dashReload } = useQuery(api, 'dash');
  if (!D) return dashErr ? <><PageHead crumbs={['ダッシュボード']} title="ダッシュボード" /><LoadFail onRetry={dashReload} /></> : <Loading />;
  return (
    <>
      <PageHead crumbs={['ダッシュボード']} title="ダッシュボード" />
      <ConfirmAlerts />
      <MenuAlerts />
      <LockedAlerts />
      <div className="dgrid">
        <div className="card"><div className="dhd"><h3>お知らせ（アラート一覧）</h3><span className="muted">今日 {fmtDate(today())}</span></div><Alerts /></div>
        <div className="card"><Sched /></div>
        <div className="card dwide"><LineCard D={D} /></div>
        <div className="card dwide"><FavCard D={D} /></div>
      </div>
    </>
  );
}

/** W103（画面設計書 _共通_メッセージ）。ダッシュボードの読込失敗は部品（アラート・スケジュール・グラフ）ごとに出し、「再読み込み」で読み直す（台帳 運営A Q-D6） */
const W103 = '一覧を読み込めませんでした。時間をおいて、もう一度お試しください。';
function LoadFail({ onRetry }: { onRetry: () => void }) {
  return (
    <div role="alert" className="muted" style={{ display: 'flex', gap: '0.571429rem', alignItems: 'center', flexWrap: 'wrap', margin: '0.285714rem 0' }}>
      <span>{W103}</span><button type="button" className="btn out sm" onClick={onRetry}>再読み込み</button>
    </div>
  );
}

/** グラフの条件の欄（一覧の検索条件と同じ見た目・同じ動き：「検索」か Enter で効く・変えたまま押していなければ「未適用」） */
function ChartFilter({ dirty, onApply, onClear, children }: { dirty: boolean; onApply: () => void; onClear: () => void; children: ReactNode }) {
  return (
    <div className="filter" style={{ marginBottom: '0.857143rem' }}>
      <div className="f-grid" role="search" onKeyDown={(e) => { const t = e.target as HTMLElement; if (e.key === 'Enter' && t.tagName === 'INPUT' && (t as HTMLInputElement).type !== 'checkbox') onApply(); }}>
        {children}
        <div className="f-act">
          <button className="btn out" onClick={onClear}>クリア</button>
          <UnappliedMark show={dirty} />
          <button className="btn pri" onClick={onApply}>検索</button>
        </div>
      </div>
    </div>
  );
}

/** 法人・拠点の選択（法人を変えたら拠点は選び直し）。条件の手元の値 c を c.corpId・c.branchId で持つ */
function OrgSelects<C extends { corpId?: string; branchId?: string }>({ D, c, set }: { D: DashData; c: C; set: (p: Partial<C>) => void }) {
  const brs = D.branches.filter((b) => !c.corpId || b.corpId === c.corpId);
  return (
    <>
      <div>
        <select className="sel" aria-label="法人" value={c.corpId ?? ''} onChange={(e) => set({ corpId: e.target.value, branchId: '' } as Partial<C>)}>
          <option value="">法人（すべて）</option>{D.corps.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
        </select>
      </div>
      <div>
        <select className="sel" aria-label="拠点" value={c.branchId ?? ''} onChange={(e) => set({ branchId: e.target.value } as Partial<C>)}>
          <option value="">拠点（すべて）</option>{brs.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
        </select>
      </div>
    </>
  );
}

/** 期間（年月の から〜まで） */
function MonthRange({ c, set }: { c: { from?: string; to?: string }; set: (p: { from?: string; to?: string }) => void }) {
  return (
    <>
      <div><MonthInput className="inp" aria-label="期間（から）" placeholder="期間（から）" value={c.from ?? ''} onChange={(e) => set({ from: e.target.value })} /></div>
      <div><MonthInput className="inp" aria-label="期間（まで）" placeholder="期間（まで）" value={c.to ?? ''} onChange={(e) => set({ to: e.target.value })} /></div>
    </>
  );
}

const sameC = (a: object, b: object) => JSON.stringify(Object.entries(a).filter(([, v]) => (Array.isArray(v) ? v.length : v)).sort()) === JSON.stringify(Object.entries(b).filter(([, v]) => (Array.isArray(v) ? v.length : v)).sort());

/** 月次購入額推移（条件：期間・法人・拠点） */
function LineCard({ D }: { D: DashData }) {
  const init: DashLineArgs = { from: D.months[Math.max(0, D.months.length - 12)] ?? '', to: D.ym };
  const [draft, setDraft] = useState<DashLineArgs>(init);
  const [applied, setApplied] = useState<DashLineArgs>(init);
  const { data: L, error: err, reload } = useQuery(api, 'dashLine', applied);
  const set = (p: Partial<DashLineArgs>) => setDraft((d) => ({ ...d, ...p }));
  return (
    <>
      <div className="dhd">
        <h3>月次購入額推移</h3>
        <span className="muted">{L?.months.length ? `${L.months[0]}〜${L.months[L.months.length - 1]}` : ''}</span>
      </div>
      <ChartFilter dirty={!sameC(draft, applied)} onApply={() => setApplied(draft)} onClear={() => { setDraft(init); setApplied(init); }}>
        <MonthRange c={draft} set={set} />
        <OrgSelects D={D} c={draft} set={set} />
      </ChartFilter>
      {err ? <LoadFail onRetry={reload} /> : L ? <Line L={L} /> : <p className="muted">読み込み中…</p>}
    </>
  );
}

/** お気に入り × 購入分析（条件：期間・法人・拠点・カテゴリ） */
function FavCard({ D }: { D: DashData }) {
  const init: DashFavArgs = { from: D.ym, to: D.ym };
  const [draft, setDraft] = useState<DashFavArgs>(init);
  const [applied, setApplied] = useState<DashFavArgs>(init);
  const { data: F, error: err, reload } = useQuery(api, 'dashFav', applied);
  const set = (p: Partial<DashFavArgs>) => setDraft((d) => ({ ...d, ...p }));
  return (
    <>
      <div className="dhd">
        <h3>お気に入り × 購入分析</h3>
        <span className="muted">{F ? `${F.from === F.to ? F.from : `${F.from}〜${F.to}`}・${F.rows.length}商品` : ''}</span>
      </div>
      <ChartFilter dirty={!sameC(draft, applied)} onApply={() => setApplied(draft)} onClear={() => { setDraft(init); setApplied(init); }}>
        <MonthRange c={draft} set={set} />
        <OrgSelects D={D} c={draft} set={set} />
        <MultiCheck className="span2" label="カテゴリ" opts={D.cats} value={draft.cats ?? []} onChange={(v) => set({ cats: v })} />
      </ChartFilter>
      {err ? <LoadFail onRetry={reload} /> : F ? <Fav F={F} /> : <p className="muted">読み込み中…</p>}
    </>
  );
}

/**
 * 月間メニューの自動公開の条件（2026/10/02 決定：通知ではなく TOP に出す）。自動公開日の3日前から、足りない条件を出す。
 * データは共通データの menu.alerts（運営の領域 menu.menuAlerts）
 */
function MenuAlerts() {
  const { data } = useQuery(areaApi(AREAS.menu), 'menuAlerts');
  const xs = (data ?? []) as { menuId: string; title: string; autoPublishOn: string; late: boolean; missing: string[] }[];
  if (!xs.length) return null;
  return (
    <div className="card" style={{ borderLeft: '4px solid #d97706', marginBottom: '1.142857rem' }}>
      {xs.map((x) => (
        <div key={x.menuId} style={{ padding: '0.285714rem 0' }}>
          <div className="dhd" style={{ marginBottom: '0.285714rem' }}>
            <h3>{x.late ? `${x.title}を自動公開できませんでした（自動公開日 ${fmtDate(x.autoPublishOn)}）` : `${x.title}が自動公開の条件を満たしていません（自動公開日 ${fmtDate(x.autoPublishOn)}）`}</h3>
            <Link className="lnk u" href={`/ops/menu/monthly/${x.menuId}`}>メニューを開く</Link>
          </div>
          <p className="muted" style={{ margin: '0 0 0.285714rem' }}>{x.late ? '条件がそろうまで公開しません。' : `自動公開日 ${fmtDate(x.autoPublishOn)} までに次を済ませてください。`}</p>
          <ul style={{ margin: 0, paddingLeft: '1.285714rem' }}>{x.missing.map((m) => <li key={m}>{m}</li>)}</ul>
        </div>
      ))}
    </div>
  );
}

/**
 * 請求の確定（2026/10/03 決定：25日に自動で確定しない）。20日締めのあと 21日から、実績精算・前払いの確定が済むまで出す。
 * データは運営の billing.confirmAlert（lib/ops/billing/confirmAlert.ts）
 */
function ConfirmAlerts() {
  const { data } = useQuery(areaApi(AREAS.billing), 'confirmAlert');
  const x = data as { active: boolean; month: string; from: string; act: number; fix: number; groups: { key: string; href: string; name: string; act: { id: string; name: string }[]; fix: { id: string; name: string }[] }[] } | undefined;
  if (!x?.active) return null;
  return (
    <div className="card" style={{ borderLeft: '4px solid #c02339', marginBottom: '1.142857rem' }}>
      <div className="dhd" style={{ marginBottom: '0.285714rem' }}>
        <h3>請求の確定がまだです（締め {x.month}・未確定 実績精算 {x.act}件・前払い {x.fix}件）</h3>
        <Link className="lnk u" href={`/ops/billing/confirm?m=${x.month}`}>請求の確定を開く</Link>
      </div>
      <p className="muted" style={{ margin: '0 0 0.285714rem' }}>20日締めのあと（{fmtDate(x.from)} から）、確定が済むまで出します。25日に自動では確定しません。</p>
      <ul style={{ margin: 0, paddingLeft: '1.285714rem' }}>
        {x.groups.map((g) => (
          <li key={g.key}><Link className="lnk" href={g.href}>{g.name}</Link>：{[g.act.length ? `実績精算 未確定 ${g.act.map((b) => b.name).join('・')}` : '', g.fix.length ? `前払い 未確定 ${g.fix.map((b) => b.name).join('・')}` : ''].filter(Boolean).join('／')}</li>
        ))}
      </ul>
    </div>
  );
}

/**
 * 確定（まだ発行していない）の月にかかる変更の反映待ち（2026/10/03 決定）：プランの変更・誤りの訂正を承認したとき、確定済みの月はロックしたまま変えない。
 * 請求の画面で確定解除してから「反映」。データは共通データの billing.lockedSkips
 */
const billingApi = domainApi(dmBilling);
function LockedAlerts() {
  const { toast, toastError, account } = useOps();
  const canAct = useCanAct();
  const { data } = useDomainQuery(billingApi, 'lockedSkips', {});
  const xs = data ?? [];
  if (!xs.length) return null;
  const act = async (op: 'reapplyLocked' | 'dismissLocked', id: string) => {
    try { const r = await billingApi.action(op, { id, by: account?.id ?? 'Ad00010' }); toast('message' in r ? r.message : '反映しないにしました'); } catch (e) { toastError(e); }
  };
  return (
    <div className="card" style={{ borderLeft: '4px solid #d97706', marginBottom: '1.142857rem' }}>
      <div className="dhd" style={{ marginBottom: '0.285714rem' }}>
        <h3>確定済みの月に反映していない変更 {xs.length}件</h3>
        <Link className="lnk u" href="/ops/billing/confirm">請求の確定を開く</Link>
      </div>
      <p className="muted" style={{ margin: '0 0 0.285714rem' }}>プランの変更・誤りの訂正を承認したとき、請求の画面で確定済み（まだ発行していない）の月は変えていません。請求の画面で確定解除してから「反映」してください（反映しないときは請求調整で対応）。</p>
      <ul style={{ margin: 0, paddingLeft: '1.285714rem' }}>
        {xs.map((x) => (
          <li key={x.id} style={{ padding: '2px 0' }}>
            {x.branchName} {fmtYm(x.cycleMonth)} サイクル：{x.source}{x.applicationId ? `（${x.applicationId}）` : x.reason ? `（${x.reason}）` : ''}・請求の状態 {x.billStatus}{' '}
            {x.canApply
              ? canAct(billingApi, 'reapplyLocked') && <button className="btn pri sm" onClick={() => act('reapplyLocked', x.id)}>反映</button>
              : <Link className="lnk u" href={`/ops/billing/confirm/sub/${x.branchId}`}>確定解除へ</Link>}
            {/* 権限がなければ出さない */}
            {canAct(billingApi, 'dismissLocked') && <>{' '}<button className="btn out sm" onClick={() => act('dismissLocked', x.id)}>反映しない</button></>}
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * お知らせ（アラート一覧）（元：dashAlerts）。REQ-UI-001：共通データの件数から作り、0件の項目は出さない（固定の文言は持たない）。
 * 項目は固定：配送の要確認・発注（本発注の未承認24時間超・受注不可）・入荷（差異の対応待ち・分納の遅れ）・追加発注の入荷遅れ・資材の在庫不足（2026-10-05：別カードをやめてここに出す）・契約申請・請求（Bill One の送付エラー）・棚卸の未報告・営業サンプル（月の枠の残り・締めがまだの受付）・お知らせの配信予約・お問い合わせ
 */
function Alerts() {
  const { data, error, reload } = useQuery(api, 'topAlerts');
  if (error) return <LoadFail onRetry={reload} />;
  if (!data) return <p className="muted">読み込み中…</p>;
  if (!data.length) return <p className="muted" style={{ margin: 0 }}>対応が必要なものはありません。</p>;
  return <ul className="dalert">{data.map((a) => <li key={a.area} className={a.tone}><b>{a.area}</b><span>{a.text}</span><Link className="lnk u" href={a.href}>開く</Link></li>)}</ul>;
}

/**
 * スケジュール（元：dashSched）。REQ-UI-002：表示項目は固定。1ヶ月だけ出し（4週間の ES サイクル表示はない・2026-10-05）、前後の月へ移る。
 * 日ごとに ES サイクルの枠（A1〜D7）を出す。予定は共通データ（配送・サイクル・メニュー）から作る
 */
function Sched() {
  const [at, setAt] = useState('');
  const { data: S, error: err, reload } = useQuery(api, 'topSchedule', { at });
  const W = '月火水木金土日', t0 = today();
  const head = (
    <div className="dhd">
      <h3>スケジュール{S ? `｜${S.title}` : ''}</h3>
      <button className="btn out sm" disabled={!S} onClick={() => S && setAt(S.prev)}>‹ 前へ</button>
      <button className="btn out sm" disabled={!at} onClick={() => setAt('')}>今日</button>
      <button className="btn out sm" disabled={!S} onClick={() => S && setAt(S.next)}>次へ ›</button>
      <Link className="lnk u" href="/ops/delivery/schedule">配送管理のスケジュールへ</Link>
    </div>
  );
  if (err && !S) return <>{head}<LoadFail onRetry={reload} /></>;
  if (!S) return <>{head}<p className="muted">読み込み中…</p></>;
  const ym = S.title;
  return (
    <>
      {head}
      <div className="dcal">
        {W.split('').map((w) => <div key={w} className="muted" style={{ fontSize: '0.785714rem', textAlign: 'center' }}>{w}</div>)}
        {S.days.map((d) => {
          const wd = W[(parseDate(d.date).getDay() + 6) % 7], out = fmtYm(d.date.slice(0, 7).replace('/', '-')) !== ym;
          return (
            <div key={d.date} className={`dcell${d.date === t0 ? ' today' : ''}${'土日'.includes(wd) ? ' off' : ''}${out ? ' out' : ''}`}>
              <b>{fmtMd(d.date)}{d.slot && <span className="slot">{d.slot}</span>}</b>
              {d.ev.map((x, i) => <span key={i} className={x.tone}>{x.t}</span>)}
            </div>
          );
        })}
      </div>
    </>
  );
}

/** 月次購入額推移（元：dashLine） */
function Line({ L }: { L: DashLine }) {
  const v = L.sales, W = 1100, H = 240, Lm = 56, B = 28, T = 12;
  if (!v.length) return <p className="muted">条件に一致するデータがありません。条件を変えるか「クリア」を押してください。</p>;
  /* 購入が小さい・0 の月だけでも目盛りが NaN にならないように（最小 1万・刻み 1万） */
  const max = Math.max(10000, Math.ceil((Math.max(0, ...v) * 1.15) / 10000) * 10000);
  const x = (i: number) => Lm + (i * (W - Lm - 12)) / Math.max(1, v.length - 1), y = (n: number) => T + (H - T - B) * (1 - n / max);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="dsvg" role="img" aria-label="月次購入額推移">
      {[0, 0.25, 0.5, 0.75, 1].map((r) => (
        <g key={r}><line x1={Lm} x2={W - 8} y1={y(max * r)} y2={y(max * r)} className="dg" /><text x={Lm - 6} y={y(max * r) + 4} className="dt" textAnchor="end">{((max * r) / 10000).toLocaleString()}万</text></g>
      ))}
      <polyline points={v.map((n, i) => `${x(i)},${y(n)}`).join(' ')} fill="none" stroke="var(--accent,#2563EB)" strokeWidth={2.5} />
      {v.map((n, i) => (
        <g key={i}>
          <circle cx={x(i)} cy={y(n)} r={3.5} fill="#fff" stroke="var(--accent,#2563EB)" strokeWidth={2}><title>{`${L.months[i]}：${yen(n)}`}</title></circle>
          <text x={x(i)} y={H - 8} className="dt" textAnchor="middle">{L.months[i]}</text>
        </g>
      ))}
    </svg>
  );
}

/** お気に入り × 購入分析（元：dashFav。棒＝購入金額・線＝お気に入り件数） */
function Fav({ F }: { F: DashFav }) {
  const d = F.rows;
  if (!d.length) return <p className="muted">条件に一致するデータがありません。条件を変えるか「クリア」を押してください。</p>;
  const W = 1100, H = 270, L = 56, R = 44, B = 70, T = 12, bw = (W - L - R) / d.length;
  const maxA = Math.max(10000, Math.ceil((Math.max(...d.map((r) => r[1])) * 1.15) / 10000) * 10000), maxF = Math.max(100, Math.ceil((Math.max(...d.map((r) => r[2])) * 1.15) / 100) * 100);
  const y = (n: number, m: number) => T + (H - T - B) * (1 - n / m);
  return (
    <>
      <svg viewBox={`0 0 ${W} ${H}`} className="dsvg" role="img" aria-label="お気に入り×購入分析">
        {[0, 0.25, 0.5, 0.75, 1].map((r) => (
          <g key={r}>
            <line x1={L} x2={W - R} y1={y(maxA * r, maxA)} y2={y(maxA * r, maxA)} className="dg" />
            <text x={L - 6} y={y(maxA * r, maxA) + 4} className="dt" textAnchor="end">{((maxA * r) / 10000).toLocaleString()}万</text>
            <text x={W - R + 6} y={y(maxF * r, maxF) + 4} className="dt">{(maxF * r).toLocaleString()}</text>
          </g>
        ))}
        {d.map((r, i) => {
          const cx = L + i * bw + bw / 2;
          return (
            <g key={i}>
              <rect x={L + i * bw + bw * 0.2} y={y(r[1], maxA)} width={bw * 0.6} height={H - B - y(r[1], maxA)} rx={2} fill="#93C5FD"><title>{`${r[0]}：${yen(r[1])}・お気に入り ${r[2]}件`}</title></rect>
              <text x={cx} y={H - B + 12} className="dt" textAnchor="end" transform={`rotate(-30 ${cx} ${H - B + 12})`}>{r[0].length > 8 ? r[0].slice(0, 8) + '…' : r[0]}</text>
            </g>
          );
        })}
        <polyline points={d.map((r, i) => `${L + i * bw + bw / 2},${y(r[2], maxF)}`).join(' ')} fill="none" stroke="#EAB308" strokeWidth={2} />
        {d.map((r, i) => <circle key={i} cx={L + i * bw + bw / 2} cy={y(r[2], maxF)} r={3.5} fill="#fff" stroke="#EAB308" strokeWidth={2} />)}
      </svg>
      <div className="dleg"><span><i style={{ background: '#93C5FD' }} />購入金額（左）</span><span><i style={{ background: '#EAB308' }} />お気に入り件数（右）</span></div>
    </>
  );
}
