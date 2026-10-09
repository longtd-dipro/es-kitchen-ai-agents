'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState, type ReactNode } from 'react';
import { DEMO } from '@/lib/demo';
import { useQuery } from '@/lib/ops/core/client';
import { SCHEDULE_OPTS } from '@/lib/ops/delivery/constants';
import { usePaging } from '@/lib/ui/paging';
import type { DayView, MonthView, WeekDay, WeekView } from '@/lib/ops/delivery/types';
import { useOpsCsvExport } from '../../_ui/csv';
import { useOps } from '../../_ui/OpsProvider';
import { useCanAct } from '../../_ui/perm';
import { api } from '../_components/api';
import ChangeRequestsFlow from '../_components/ChangeRequests';
import {
  Badge, Button, Card, CalendarCell, Checkbox, LinkButton, PageHead, Pagination, SearchPanel, SegmentedControl, Select,
  SelectionBar, StageIndicator, TempTag, TextField,
} from '../_components/kit';
import MoveShipments from '../_components/MoveShipments';

/*
 * スケジュール（部品 16 の ScheduleMonth・ScheduleMonthDraft・ScheduleWeek・ScheduleWeekEdit・ScheduleDay・ScheduleDayPlan）。
 * ?view=month|week|day&d=… で表示を切り替える。見本のデータがあるのは
 *   月：2026-10（確定）・2026-11（予定）／週：2026-10-05（確定）・2026-11-16（予定）／日：2026-10-05（確定）・2026-11-17（予定）
 */

type View = 'month' | 'week' | 'day';
const DEF: Record<View, { fixed: string; draft: string }> = {
  month: { fixed: '2026-10', draft: '2026-11' },
  week: { fixed: '2026-10-05', draft: '2026-11-16' },
  day: { fixed: '2026-10-05', draft: '2026-11-17' },
};
const isDraft = (v: View, d: string) => d === DEF[v].draft;
const href = (v: View, d: string) => `/ops/delivery/schedule?view=${v}&d=${d}`;
const VIEW_ITEMS = [{ value: 'month' as const, label: '月' }, { value: 'week' as const, label: '週' }, { value: 'day' as const, label: '日' }];
const BASIS_ITEMS = [{ value: 'ship' as const, label: '出荷' }, { value: 'dlv' as const, label: '納品・配送' }];
/** デモのときだけ「このデモでは」と書く */
const dm = (demo: string, dev: string) => (DEMO ? demo : dev);

export default function Page() {
  return <Suspense><Schedule /></Suspense>;
}

function Schedule() {
  const sp = useSearchParams(), router = useRouter();
  const view = (['month', 'week', 'day'].includes(sp.get('view') ?? '') ? sp.get('view') : 'month') as View;
  const d = sp.get('d') && [DEF[view].fixed, DEF[view].draft].includes(sp.get('d')!) ? sp.get('d')! : DEF[view].fixed;
  const draft = isDraft(view, d);
  const go = (v: View, dd: string) => router.push(href(v, dd));
  const { toast } = useOps();
  const { data: counts } = useQuery(api, 'headCounts');
  const [drawer, setDrawer] = useState(false);
  const [crOpen, setCrOpen] = useState(false);

  /* 月・週・日の切替（確定の表示どうし・予定の表示どうしで行き来する） */
  const switchView = (v: View) => { if (v !== view) go(v, draft ? DEF[v].draft : DEF[v].fixed); };
  const today = () => go(view, DEF[view].fixed);

  const head = (
    <PageHead crumbs={['配送管理', 'スケジュール']} title="スケジュール" actions={<>
      {view === 'month' && !draft
        ? <button type="button" className="hl" onClick={() => setDrawer(!drawer)}>要確認（{counts?.review ?? 0}件）</button>
        : <Link className="hl" href="/ops/delivery/review">要確認（{counts?.review ?? 0}件）</Link>}
      <button type="button" className="hl" onClick={() => setCrOpen(true)}>変更申請（{counts?.cr ?? 0}件）</button>
      <CsvOut view={view} d={d} />
      <LinkButton href="/ops/delivery/schedule/cycle" icon="GearSix">配送サイクル設定</LinkButton>
    </>} />
  );

  return (
    <>
      {head}
      {view === 'month' && <MonthPart id={d} draft={draft} drawer={drawer} setDrawer={setDrawer} switchView={switchView} today={today} go={go} toast={toast} />}
      {view === 'week' && <WeekPart id={d} draft={draft} switchView={switchView} today={today} go={go} toast={toast} />}
      {view === 'day' && <DayPart id={d} draft={draft} switchView={switchView} today={today} go={go} toast={toast} />}
      {crOpen && <ChangeRequestsFlow onClose={() => setCrOpen(false)} />}
    </>
  );
}

type PartProps = { id: string; draft: boolean; switchView: (v: View) => void; today: () => void; go: (v: View, d: string) => void; toast: (m: string) => void };

/** CSV出力（いま開いている表示の全件。日の表示は配送データ dm.delivery.deliveries の全部の項目も） */
function CsvOut({ view, d }: { view: View; d: string }) {
  const csvExport = useOpsCsvExport();
  const tp = (k: string) => (k === 'frozen' ? '冷凍' : '冷蔵');
  const out = async () => {
    const filters = [{ label: view === 'month' ? '月' : view === 'week' ? '週' : '日', value: d }];
    if (view === 'month') {
      const m = await api.query('scheduleMonth', { id: d });
      type C = NonNullable<typeof m>['cells'][number];
      await csvExport<C>({ screen: 'スケジュール（月）', filters, rows: m?.cells ?? [], columns: [
        { label: '日付', get: (c) => c.date }, { label: 'サイクル', get: (c) => c.cycle ?? '' }, { label: '枠', get: (c) => c.slot ?? '' }, { label: '出荷', get: (c) => lineText(c.lines[0]) },
        { label: '配送', get: (c) => lineText(c.lines[1]) }, { label: 'お知らせ', get: (c) => c.allBadges ?? c.badges.map((b) => b.label) },
      ] });
    } else if (view === 'week') {
      const w = await api.query('scheduleWeek', { id: d });
      const items = (w?.ship ?? []).flatMap((x) => x.items.map((it) => ({ x, it })));
      await csvExport<(typeof items)[number]>({ screen: 'スケジュール（週）', filters, rows: items, columns: [
        { label: '曜日', get: (r) => r.x.wd }, { label: '日', get: (r) => r.x.d }, { label: '枠', get: (r) => r.x.slot }, { label: '拠点名', get: (r) => r.it.nm },
        { label: '温度帯', get: (r) => tp(r.it.tpKind) }, { label: '日付', get: (r) => r.it.dt },
      ] });
    } else {
      const v = await api.query('scheduleDay', { id: d });
      if (v?.rows) {
        const rs = v.rows;
        await csvExport<(typeof rs)[number]>({ screen: 'スケジュール（日）', filters, rows: rs, source: { kind: 'dm.delivery.deliveries', id: (r) => r.id }, columns: [
          { label: '配送No', get: (r) => r.id }, { label: '拠点名', get: (r) => r.site }, { label: '便種別', get: (r) => r.svc }, { label: '状態', get: (r) => r.st }, { label: '温度帯', get: (r) => tp(r.tpKind) },
          { label: 'プラン名', get: (r) => r.plan }, { label: '出荷日', get: (r) => r.pick }, { label: 'ピッキング倉庫', get: (r) => r.wh }, { label: '配送会社1', get: (r) => r.c1 },
          { label: '中継倉庫', get: (r) => r.hub }, { label: '配送会社2', get: (r) => r.c2 }, { label: 'ドライバー', get: (r) => r.drv }, { label: '配送日', get: (r) => r.dlv },
        ] });
      } else {
        const ps = v?.plans ?? [];
        await csvExport<(typeof ps)[number]>({ screen: 'スケジュール（日）', filters, rows: ps, columns: [
          { label: '予定', get: (r) => r.plan }, { label: '拠点名', get: (r) => r.site }, { label: '便種別', get: (r) => r.svc }, { label: '温度帯', get: (r) => tp(r.tpKind) }, { label: '出荷日', get: (r) => r.pick },
          { label: 'ピッキング倉庫', get: (r) => r.wh }, { label: '配送会社1', get: (r) => r.c1 }, { label: '中継倉庫', get: (r) => r.hub }, { label: '配送会社2', get: (r) => r.c2 },
          { label: '変更申請', get: (r) => r.cr }, { label: '配送日', get: (r) => r.dlv },
        ] });
      }
    }
  };
  return <Button variant="outline" icon="ReadCvLogo" onClick={out}>CSV出力</Button>;
}
const lineText = (l?: MonthView['cells'][number]['lines'][number]) => (!l ? '' : 'parts' in l ? l.parts.map((p) => p.text).join('') : `${l.pre ?? ''}${l.value ?? ''}${l.post ?? ''}`);

/** 月・週・日の切替と、期間の操作・段階 */
function Bar({ view, nav, stage, switchView }: { view: View; nav: ReactNode; stage?: MonthView['stage']; switchView: (v: View) => void }) {
  return (
    <div className="bar">
      <div>
        <SegmentedControl items={VIEW_ITEMS} value={view} onChange={switchView} label="表示" />
        <div className="dnav">{nav}</div>
      </div>
      {stage && <StageIndicator {...stage} />}
    </div>
  );
}

/** 検索条件（スケジュール共通。月は2列目から、週・日は基準の切替つき） */
function useSearch() {
  const empty = { sq1: '', sq2: '', sq3: '', s1: '', s2: '', s3: '', s4: '', s5: '', s6: '', s7: '', s8: '', s9: '', s10: '' };
  const [f, setF] = useState(empty);
  const [args, setArgs] = useState(empty);
  const set = (k: keyof typeof empty) => (v: string) => setF({ ...f, [k]: v });
  const selects = (['s1', 's2', 's3', 's4', 's5', 's6', 's7', 's8', 's9'] as const).map((k, i) => {
    const ph = ['コース', 'ステータス', '自販機', '配送パターン', '配送方法', '配送回数', 'ピッキング倉庫', '委託配送会社', '中継倉庫'][i];
    const opts = [SCHEDULE_OPTS.course, SCHEDULE_OPTS.status, SCHEDULE_OPTS.vending, SCHEDULE_OPTS.pattern, SCHEDULE_OPTS.method, SCHEDULE_OPTS.count, SCHEDULE_OPTS.wh, SCHEDULE_OPTS.carrier, SCHEDULE_OPTS.hub][i];
    return <Select key={k} placeholder={ph} options={opts} value={f[k]} onChange={set(k)} />;
  });
  const sq1 = (span: string) => <TextField key="sq1" className={span} icon="Search" placeholder="法人ID・名、拠点ID・名、契約ID" value={f.sq1} onChange={set('sq1')} />;
  const sq2 = <TextField key="sq2" className="es-span-2" icon="Search" placeholder="住所、郵便番号、電話番号、担当者電話番号" value={f.sq2} onChange={set('sq2')} />;
  const sq3 = <TextField key="sq3" icon="Search" placeholder="送り状番号" value={f.sq3} onChange={set('sq3')} />;
  const s10 = <Select key="s10" placeholder="配送スタッフID・名" options={SCHEDULE_OPTS.staff} value={f.s10} onChange={set('s10')} />;
  return { args, sig: JSON.stringify(f), search: () => setArgs(f), clear: () => { setF(empty); setArgs(empty); }, selects, sq1, sq2, sq3, s10 };
}

/* ---------------- 月 ---------------- */

function MonthPart({ id, draft, drawer, setDrawer, switchView, today, go, toast }: PartProps & { drawer: boolean; setDrawer: (v: boolean) => void }) {
  const s = useSearch();
  const { data: m } = useQuery(api, 'scheduleMonth', { id, f: s.args });
  const prev = () => (draft ? go('month', DEF.month.fixed) : toast(dm('前の月はこのデモでは省略しています', '前の月の予定はありません')));
  const next = () => (draft ? toast(dm('12月以降の予定はこのデモでは省略しています', '12月以降の予定はまだありません')) : go('month', DEF.month.draft));
  /* 日付のマス → その日を含む週の週表示 */
  const openWeek = (wk: string) => {
    const to = wk >= '2026-11-09' ? DEF.week.draft : DEF.week.fixed;
    go('week', to);
    if (wk !== to) {
      const lbl = `${+wk.slice(5, 7)}/${wk.slice(8)}`;
      const shown = to === DEF.week.fixed ? '10/05〜10/11' : '11/16〜11/22';
      toast(dm(`${lbl}〜 の週へ移動します（デモは ${shown} の週のデータだけ用意しています）`, `${lbl}〜 の週のデータはないため、${shown} の週を表示しています`));
    }
  };
  return (
    <Card>
      <Bar view="month" switchView={switchView} stage={m?.stage} nav={<>
        <TextField icon="CalendarBlank" value={id} onChange={() => {}} style={{ width: '12.857143rem' }} />
        <Button variant="outline" icon="CaretLeft" aria-label="前の月" onClick={prev} />
        <Button variant="outline" icon="CaretRight" aria-label="次の月" onClick={next} />
        <Button variant="outline" onClick={today}>今日</Button>
      </>} />
      <SearchPanel columns={6} first={2} sig={s.sig} onSearch={s.search} onClear={s.clear}>
        {[s.sq1('es-span-3'), s.sq2, ...s.selects, s.sq3, s.s10]}
      </SearchPanel>
      <div style={{ position: 'relative' }}>
        <div className="es-cal es-cal--tall">
          {['月', '火', '水', '木', '金', '土', '日'].map((w) => <div key={w} className="es-cal__wd">{w}</div>)}
          {(m?.cells ?? []).map((c, i) => <CalendarCell key={i} c={c} onClick={c.wk ? () => openWeek(c.wk!) : undefined} />)}
        </div>
        {drawer && !draft && <ReviewDrawer onClose={() => setDrawer(false)} />}
      </div>
      {m?.legend && (
        <div className="legend">
          <span><i className="sw" style={{ border: '1px dashed #8C959F' }}></i>予定（未確定）</span>
          <span><i className="sw" style={{ border: '2px solid #CF222E' }}></i>出荷件数がしきい値（300件）を超えた日</span>
          <span><i className="sw" style={{ border: '1px solid #8C959F' }}></i>配送データ（10月サイクル・確定）</span>
          <span><Badge tone="negative">赤</Badge>上限超過・トラブル（過ぎた日も出す）</span>
          <span><Badge tone="warning">黄</Badge>未割当（出荷待から）・変更申請</span>
          <span><Badge tone="neutral">灰</Badge>移動・変更・取消。1日に2つまで、残りは「+N」（重ねると中身）</span>
          <span><i className="sw" style={{ background: '#EDF0F3' }}></i>選択月以外</span>
        </div>
      )}
    </Card>
  );
}

/** 要確認のパネル（月表示の右上）。区分ごとの件数と一覧へのリンク */
function ReviewDrawer({ onClose }: { onClose: () => void }) {
  const { data } = useQuery(api, 'reviewSummary');
  return (
    <div className="drawer">
      <Card>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <b style={{ fontSize: '1.285714rem' }}>要確認　{data?.total ?? 0}件</b>
          <Button variant="ghost" tone="neutral" icon="X" aria-label="閉じる" onClick={onClose} />
        </div>
        <div>
          {(data?.groups ?? []).map((g) => (
            <div key={g.title}>
              <div className="grp">{g.title}</div>
              {g.rows.map((r) => <div key={r.label} className="rv">{r.label}<span className="c">{r.count}</span><Link href={`/ops/delivery/review?kind=${encodeURIComponent(r.kinds[0])}`}>一覧 ›</Link></div>)}
            </div>
          ))}
        </div>
        <div style={{ fontSize: '0.857143rem', lineHeight: '1.285714rem', color: 'var(--text-low)' }}>要確認は解消するまで残ります。法人へは通知しません。</div>
      </Card>
    </div>
  );
}

/* ---------------- 週 ---------------- */

function WeekPart({ id, draft, switchView, today, go, toast }: PartProps) {
  const [basis, setBasis] = useState<'ship' | 'dlv'>('ship');
  const s = useSearch();
  const { data: w } = useQuery(api, 'scheduleWeek', { id, f: s.args });
  const prev = () => toast(dm('前の週はこのデモでは省略しています', '前の週のデータはありません'));
  const next = () => toast(draft ? dm('次の週はこのデモでは省略しています', '次の週のデータはありません') : dm('10/05〜の週（確定）はこのデモでは省略しています。予定の週は 月表示 → 次の月（11月）から', '次の週のデータはありません。予定の週は 月表示 → 次の月（11月）から'));
  const seg = draft
    ? <SegmentedControl key="b" size="sm" items={BASIS_ITEMS} value="ship" onChange={() => {}} label="基準" />
    : <SegmentedControl key="b" size="sm" items={BASIS_ITEMS} value={basis} onChange={setBasis} label="基準" />;
  return (
    <>
      <Card>
        <Bar view="week" switchView={switchView} stage={w?.stage} nav={<>
          <TextField icon="CalendarBlank" value={w?.from ?? id} onChange={() => {}} style={{ width: '12.142857rem' }} />
          <span style={{ color: 'var(--text-low)' }}>〜</span>
          <TextField icon="CalendarBlank" value={w?.to ?? ''} onChange={() => {}} style={{ width: '12.142857rem' }} />
          <Button variant="outline" icon="CaretLeft" aria-label="前の週" onClick={prev} />
          <Button variant="outline" icon="CaretRight" aria-label="次の週" onClick={next} />
          <Button variant="outline" onClick={today}>今日</Button>
        </>} />
        <SearchPanel columns={6} first={3} sig={JSON.stringify([s.sig, basis])} onSearch={s.search} onClear={s.clear}>
          {[seg, s.sq1('es-span-2'), s.sq2, s.sq3, ...s.selects, s.s10]}
        </SearchPanel>
        {w && (draft ? <WeekEdit w={w} go={go} /> : <WeekFixed days={(basis === 'ship' ? w.ship : w.dlv) ?? []} label={w.cycleLabel} />)}
        {w && !draft && (
          <div className="legend">
            <span><i className="sw" style={{ background: 'var(--info-50)', boxShadow: 'inset 3px 0 0 var(--info-500)' }}></i>確定後に変更したもの（分納・代替便・配送スタッフの変更など）</span>
            <span><i className="sw" style={{ background: 'var(--warning-50)' }}></i>要対応（トラブル・ドライバー未割当）</span>
            <span><s style={{ color: 'var(--text-low)' }}>拠点名</s>取消</span>
            <span>タグを押すと配送データ詳細を開きます（マウスを乗せると変更の内容）</span>
          </div>
        )}
      </Card>
    </>
  );
}

/** チェックで選んだ配送（配送ID）。その日の「全て選択」は画面に出していない分も選ぶ（課題 2-4：ドラッグはしない） */
function useSel() {
  const [sel, setSel] = useState<Set<string>>(new Set());
  const toggle = (id: string) => setSel((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  const toggleAll = (ids: string[]) => setSel((s) => { const n = new Set(s); const all = ids.length > 0 && ids.every((x) => n.has(x)); ids.forEach((x) => (all ? n.delete(x) : n.add(x))); return n; });
  return { sel, toggle, toggleAll, clear: () => setSel(new Set()), has: (id?: string) => !!id && sel.has(id) };
}

function WeekFixed({ days, label }: { days: WeekDay[]; label: string }) {
  const s = useSel();
  const canAct = useCanAct();
  const [move, setMove] = useState(false);
  return (
    <>
      <div className="week">
        {days.map((c, i) => {
          const items = c.items;
          const ids = c.ids ?? [];
          return (
            <div key={i} className={'col' + (c.today ? ' today' : '') + (c.off ? ' off' : '')}>
              <div className="wd">{c.wd}</div>
              <div className="hd">
                <span className={'d' + (c.today ? ' today' : '')}>{c.d}</span>
                <div className="cy">{label}<b>{c.slot}</b></div>
                <div className="ln">{c.a}<span className={c.wc}>{c.w}</span>{c.b}</div>
                {c.badge && <div><Badge tone="warning">{c.badge}</Badge></div>}
              </div>
              {ids.length > 0 && <label className="all"><Checkbox checked={ids.every((x) => s.sel.has(x))} onChange={() => s.toggleAll(ids)} ariaLabel="全て選択" />全て選択（{ids.length}件）</label>}
              <div className="list">
                {items.map((it, k) => (
                  <div key={k} style={{ display: 'flex', alignItems: 'center', gap: '0.285714rem' }}>
                    {it.dl && ids.includes(it.dl) && <Checkbox checked={s.has(it.dl)} onChange={() => s.toggle(it.dl!)} ariaLabel={it.nm + 'を選ぶ'} />}
                    <Link className={it.cls + (s.has(it.dl) ? ' on' : '')} style={{ flex: 1, minWidth: 0 }} href={`/ops/delivery/list/${it.dl ?? 'DL-261020-0021'}`} title={it.tip}>
                      <TempTag kind={it.tpKind} /><span className="nm">{it.nm}</span><span className={it.dtCls}>{it.dt}</span>
                    </Link>
                  </div>
                ))}
                {c.more > 0 && <div className="more">ほか {c.more}件 ›</div>}
              </div>
            </div>
          );
        })}
      </div>
      {s.sel.size > 0 && (
        <>
          <div style={{ height: '4.571429rem' }} />
          <SelectionBar label={s.sel.size + '件 選択中'} onClear={s.clear}>
            {canAct(api, 'moveShipments') && <Button onClick={() => setMove(true)}>出荷データの移動</Button>}
          </SelectionBar>
        </>
      )}
      {move && <MoveShipments ids={[...s.sel]} onClose={() => setMove(false)} onDone={s.clear} />}
    </>
  );
}

function WeekEdit({ w, go }: { w: WeekView; go: (v: View, d: string) => void }) {
  const s = useSel();
  const canAct = useCanAct();
  const [move, setMove] = useState(false);
  return (
    <>
      <div className="week">
        {w.ship.map((c, i) => (
          <div key={i} className={'col' + (c.off ? ' off' : '')}>
            <div className="wd">{c.wd}</div>
            <div className="hd">
              <span style={{ fontSize: '1.071429rem' }}>{c.d}</span>
              <div className="cy">{w.cycleLabel}<b>{c.slot}</b></div>
              <div className="ln">{c.a}<span className="s">{c.w}</span><span className="p">{c.p}</span>{c.b}</div>
            </div>
            {!c.off && (
              <>
                <label className="all"><Checkbox checked={!!c.ids?.length && c.ids.every((x) => s.sel.has(x))} onChange={() => s.toggleAll(c.ids ?? [])} ariaLabel="全て選択" />全て選択（{c.ids?.length ?? c.n}件）</label>
                {c.items.map((it, k) => {
                  const on = s.has(it.dl);
                  const can = !!it.dl && (c.ids ?? []).includes(it.dl);
                  return (
                    <label key={k} className={it.cls + (on ? ' on' : '')}>
                      <Checkbox checked={on} disabled={!can} onChange={() => it.dl && s.toggle(it.dl)} ariaLabel={it.nm + 'を選ぶ'} />
                      <TempTag kind={it.tpKind} />
                      <Link className="nm" href={it.dl ? `/ops/delivery/list/${it.dl}` : href('day', DEF.day.draft)} title={it.tip}>{it.nm}</Link>
                      <span className="dt">{it.dt}</span>
                    </label>
                  );
                })}
                {c.more > 0 && <div className="more">ほか {c.more}件</div>}
              </>
            )}
          </div>
        ))}
      </div>
      <div style={{ height: '4.571429rem' }} />
      <SelectionBar label={s.sel.size + '件 選択中'} onClear={s.clear}>
        <Button variant="outline" tone="neutral" onClick={() => go('month', DEF.month.draft)}>キャンセル</Button>
        {canAct(api, 'moveShipments') && <Button disabled={!s.sel.size} onClick={() => setMove(true)}>出荷データの移動</Button>}
      </SelectionBar>
      {move && <MoveShipments ids={[...s.sel]} onClose={() => setMove(false)} onDone={s.clear} />}
    </>
  );
}

/* ---------------- 日 ---------------- */

function DayPart({ id, draft, switchView, today, toast }: PartProps) {
  const s = useSearch();
  const { data: v } = useQuery(api, 'scheduleDay', { id, f: s.args });
  const step = (dir: string) => toast(dm(`${dir}はこのデモでは省略しています`, `${dir}のデータはありません`));
  return (
    <Card>
      <Bar view="day" switchView={switchView} stage={v?.stage} nav={<>
        <TextField icon="CalendarBlank" value={id} onChange={() => {}} style={{ width: '12.142857rem' }} />
        <Button variant="outline" icon="CaretLeft" aria-label="前の日" onClick={() => step('前の日')} />
        <Button variant="outline" icon="CaretRight" aria-label="次の日" onClick={() => step('次の日')} />
        <Button variant="outline" onClick={today}>今日</Button>
      </>} />
      <SearchPanel columns={6} first={3} sig={s.sig} onSearch={s.search} onClear={s.clear}>
        {[<SegmentedControl key="b" size="sm" items={BASIS_ITEMS} value="ship" onChange={() => {}} label="基準" />, s.sq1('es-span-2'), s.sq2, s.sq3, ...s.selects, s.s10]}
      </SearchPanel>
      {v && <DayHead v={v} />}
      {v && (draft ? <DayPlan v={v} /> : <DayFixed v={v} />)}
    </Card>
  );
}

function DayHead({ v }: { v: DayView }) {
  return (
    <div className="dayh">
      <b>{v.head}</b>
      {v.stats.map((x, i) => (
        <span key={i}>
          {x.badge && <Badge tone="info">{x.badge}</Badge>}
          {x.text}{x.strong && <b style={{ fontSize: '1rem', color: 'var(--warning-800)' }}>{x.strong}</b>}{x.tail}
        </span>
      ))}
    </div>
  );
}

function DayFixed({ v }: { v: DayView }) {
  const rows = v.rows ?? [];
  const s = useSel();
  const canAct = useCanAct();
  const pg = usePaging(rows);
  const [move, setMove] = useState(false);
  /* 動かせる配送（出荷の前） */
  const movable = rows.filter((r) => ['予定', '出荷待'].includes(r.st) && r.tpKind !== 'material').map((r) => r.id);
  return (
    <>
      <div className="es-table-wrap">
        <table className="es-table">
          <thead><tr><th style={{ width: '3.142857rem' }}><Checkbox checked={!!movable.length && movable.every((x) => s.sel.has(x))} disabled={!movable.length} onChange={() => s.toggleAll(movable)} ariaLabel="全て選択" /></th><th>No</th><th>配送No</th><th>拠点名</th><th>便種別</th><th>状態</th><th>変更申請</th><th>温度帯</th><th>プラン名</th><th>出荷日（出）</th><th>ピッキング倉庫</th><th>配送会社1</th><th>中継倉庫</th><th>配送会社2</th><th>ドライバー</th><th>配送日（着）</th></tr></thead>
          <tbody>
            {pg.rows.map((r, i) => (
              <tr key={r.id} className={s.has(r.id) ? 'sel' : r.cls}>
                <td><Checkbox checked={s.has(r.id)} disabled={!movable.includes(r.id)} onChange={() => s.toggle(r.id)} ariaLabel="選択" /></td>
                <td>{pg.start + i + 1}</td>
                <td className="es-mono"><Link href={`/ops/delivery/list/${r.id}`}>{r.id}</Link></td>
                <td className="w">{r.site}{r.mv && <span className="mvnote">{r.mv}</span>}{r.att && <span className="sub" style={{ color: 'var(--warning-800)' }}>{r.att}</span>}</td>
                <td>{r.svc}</td>
                <td><Badge tone={r.stTone}>{r.st}</Badge></td>
                <td>{r.cr}</td>
                <td><TempTag kind={r.tpKind} /></td>
                <td>{r.plan}</td>
                <td className="es-num">{r.pick}</td>
                <td>{r.wh}</td>
                <td>{r.c1}</td>
                <td className="w">{r.hub}</td>
                <td>{r.c2}</td>
                <td className={r.drvCls}>{r.drv}</td>
                <td className="es-num">{r.dlv}</td>
              </tr>
            ))}
            {!rows.length && <tr><td colSpan={16} style={{ textAlign: 'center', color: 'var(--text-low)', padding: '1.714286rem' }}>条件に合うデータはありません</td></tr>}
          </tbody>
        </table>
      </div>
      <Pagination {...pg.props} />
      {s.sel.size > 0 && (
        <>
          <div style={{ height: '4.571429rem' }} />
          <SelectionBar label={s.sel.size + '件 選択中'} onClear={s.clear}>
            {canAct(api, 'moveShipments') && <Button onClick={() => setMove(true)}>出荷データの移動</Button>}
          </SelectionBar>
        </>
      )}
      {move && <MoveShipments ids={[...s.sel]} onClose={() => setMove(false)} onDone={s.clear} />}
    </>
  );
}

function DayPlan({ v }: { v: DayView }) {
  const plans = v.plans ?? [];
  const shown = plans;
  const pg = usePaging(shown);
  const s = useSel();
  const canAct = useCanAct();
  const [move, setMove] = useState(false);
  const ids = plans.map((r) => r.id);
  const count = s.sel.size, allOn = !!ids.length && ids.every((x) => s.sel.has(x));
  const router = useRouter();
  return (
    <>
      <div className="es-table-wrap">
        <table className="es-table">
          <thead><tr><th style={{ width: '3.142857rem' }}><Checkbox checked={allOn} onChange={() => s.toggleAll(ids)} ariaLabel="全て選択" /></th><th>No</th><th>予定（契約・枠）</th><th>拠点名</th><th>便種別</th><th>温度帯</th><th>出荷日（出）</th><th>ピッキング倉庫</th><th>配送会社1</th><th>中継倉庫</th><th>配送会社2</th><th>変更申請</th><th>配送日（着）</th></tr></thead>
          <tbody>
            {pg.rows.map((r, i) => {
              const on = s.has(r.id);
              return (
                <tr key={r.id} className={on ? 'sel' : r.mv ? 'mv' : ''}>
                  <td><Checkbox checked={on} onChange={() => s.toggle(r.id)} ariaLabel="選択" /></td>
                  <td>{pg.start + i + 1}</td>
                  <td className="es-mono">{r.plan}</td>
                  <td className="w">{r.site}{r.mv && <span className="mvnote">{r.mv}</span>}</td>
                  <td>{r.svc}</td>
                  <td><TempTag kind={r.tpKind} /></td>
                  <td className="es-num">{r.pick}</td>
                  <td>{r.wh}</td>
                  <td>{r.c1}</td>
                  <td className="w">{r.hub}</td>
                  <td>{r.c2}</td>
                  <td className="w">{r.cr}</td>
                  <td className="es-num">{r.dlv}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <Pagination {...pg.props} />
      <div className="legend">
        <span><i className="sw" style={{ background: 'var(--info-50)', boxShadow: 'inset 3px 0 0 var(--info-500)' }}></i>移動・変更済み（移動前の日付と理由を行に表示。変更履歴にも残ります）</span>
        <span><i className="sw" style={{ background: 'var(--primary-subtle)' }}></i>選択中</span>
      </div>
      <div style={{ height: '4.571429rem' }} />
      <SelectionBar label={count + '件 選択中'} onClear={s.clear}>
        <Button variant="outline" tone="neutral" onClick={() => router.push(href('month', DEF.month.draft))}>キャンセル</Button>
        {canAct(api, 'moveShipments') && <Button disabled={!count} onClick={() => setMove(true)}>出荷データの移動</Button>}
      </SelectionBar>
      {move && <MoveShipments ids={[...s.sel]} onClose={() => setMove(false)} onDone={s.clear} />}
    </>
  );
}

