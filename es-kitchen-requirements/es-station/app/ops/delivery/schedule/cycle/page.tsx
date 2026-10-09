'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@/lib/ops/core/client';
import { usePaging } from '@/lib/ui/paging';
import {
  checkCycleSettings, checkHoliday, checkNgDate, checkPause, cycleCalendar, leadRows, monthCounts, pauseLabel, periodMonths, SLOT_ORDER, type Errors,
} from '@/lib/ops/delivery/logic';
import type { CycleBand, CycleSettings, Holiday, Pause } from '@/lib/ops/delivery/types';
import { useOps } from '../../../_ui/OpsProvider';
import { useCanAct } from '../../../_ui/perm';
import { api } from '../../_components/api';
import { Button, Card, CalendarCell, Checkbox, EmptyState, EsIcon, EsModal, Field, MonthTabs, PageHead, Pagination, SectionTitle, SlotChip, Tabs, TextField } from '../../_components/kit';
import { fmtYm } from '@/lib/format/date';

/*
 * 配送サイクル設定（部品 16 の Main・CycleSaveConfirm）。
 * カレンダーは設定（最初の A1・休止・祝日・出荷不可）から計算する。保存するまでは画面の中だけで変わる。
 */

const ymLabel = (ym: string) => fmtYm(ym);
const uid = () => Math.random().toString(36).slice(2, 8);

export default function Page() {
  const { data } = useQuery(api, 'cycleSettings');
  return data ? <CycleEditor key={JSON.stringify(data)} saved={data} /> : null;
}

function CycleEditor({ saved }: { saved: CycleSettings }) {
  const router = useRouter();
  const { toast, toastError } = useOps();
  const canAct = useCanAct();
  const [st, setSt] = useState<CycleSettings>(saved);
  const [ym, setYm] = useState('2026-12');
  const [tab, setTab] = useState<'hol' | 'pause' | 'ng'>('hol');
  const [err, setErr] = useState<Errors>({});
  const [confirm, setConfirm] = useState(false);

  const months = periodMonths(st);
  const cur = months.includes(ym) ? ym : months[0];
  const cells = useMemo(() => cycleCalendar(st, cur), [st, cur]);
  const monthTabs = months.map((m) => {
    const c = monthCounts(st, m);
    return { value: m, label: ymLabel(m), meta: [{ text: `出荷不可：${c.ship}日`, tone: 'ship' }, { text: `配送祝日：${c.dlv}日`, tone: 'deliver' }, { text: st.readOnly.includes(m) ? '参照のみ' : ' ', tone: 'plain' }] };
  });

  const askSave = () => {
    const e = checkCycleSettings(st);
    /* 月ごとの A1（月曜） */
    for (const [ym, v] of Object.entries(st.a1s ?? {})) {
      if (v === saved.a1s?.[ym]) continue;
      if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) e.a1 = `${ymLabel(ym)} の A1 は yyyy-mm-dd で入力してください`;
      else if (new Date(v + 'T00:00:00').getDay() !== 1) e.a1 = `${ymLabel(ym)} の A1 は月曜日のみ選べます`;
    }
    setErr(e);
    if (Object.keys(e).length) { toast(Object.values(e)[0]); return; }
    setConfirm(true);
  };
  const save = async () => {
    try {
      const r = await api.action('saveCycleSettings', { settings: st });
      setConfirm(false);
      /* A1 を動かしてもオーダー締切は動かない（月間メニューの受付期間が元）。合わなくなったら知らせる（課題 4b-10） */
      toast(r.warnings?.length ? `配送サイクル設定を保存しました。${r.warnings.join('／')}` : '配送サイクル設定を保存しました');
    } catch (e) { toastError(e); }
  };

  return (
    <>
      <PageHead crumbs={['配送管理', 'スケジュール', '配送サイクル設定']} links={{ 1: '/ops/delivery/schedule' }} title="配送サイクル設定" actions={<>
        <Button variant="outline" onClick={() => router.push('/ops/delivery/schedule')}>キャンセル</Button>
        {/* 権限がなければ出さない */}
        {canAct(api, 'saveCycleSettings') && <Button onClick={askSave}>設定を保存</Button>}
      </>} />

      {st.band && <StatusBand band={st.band} cur={cur} onPick={(m) => months.includes(m) && setYm(m)} />}

      <Card>
        <div style={{ display: 'flex', gap: '2.285714rem', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.428571rem' }}>
            <span style={{ fontSize: '1rem', fontWeight: 700 }}>設定対象期間</span>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.571429rem' }}>
              <TextField icon="CalendarBlank" value={st.periodFrom} onChange={(v) => setSt({ ...st, periodFrom: v })} error={err.periodFrom} style={{ width: '11.428571rem' }} />
              <span style={{ color: 'var(--text-low)', lineHeight: '2.857143rem' }}>〜</span>
              <TextField icon="CalendarBlank" value={st.periodTo} onChange={(v) => setSt({ ...st, periodTo: v })} error={err.periodTo} style={{ width: '11.428571rem' }} />
            </div>
          </div>
          {/* 入力欄の幅で止める（横の説明が長いと縮んで重なるため） */}
          <div style={{ flexShrink: 0 }}>
            <TextField date label={`${ymLabel(cur)} サイクルの A1`} icon="CalendarBlank" value={st.a1s?.[cur] ?? ''} disabled={st.readOnly.includes(cur)} helper={st.readOnly.includes(cur) ? `参照のみ：${st.lockReasons?.[cur] ?? '変えられない月'}` : ''}
              onChange={(v) => setSt({ ...st, a1s: { ...(st.a1s ?? {}), [cur]: v } })} error={err.a1} style={{ width: '17.142857rem' }} />
          </div>
          <div style={{ flexGrow: 1, paddingTop: '2.428571rem', fontSize: '0.857143rem', lineHeight: '1.285714rem', color: 'var(--text-low)' }}>
            A1 は月曜日のみ選べます。確定済みの月（当月・メニューを公開した月・オーダー期間が始まった月・配送データを作った月。上の帯の灰色）は参照のみです。A1 を後ろへ動かすと、重なる後ろの月も同じ日数だけ動きます（間はサイクルなし）。オーダー締切は動きません（月間メニューの受付期間で決まります。合わなくなったら保存のときに知らせます）。
          </div>
        </div>
      </Card>

      <div style={{ display: 'flex', gap: '1.142857rem', alignItems: 'flex-start' }}>
        <Card style={{ flexGrow: 1, minWidth: 0 }}>
          <MonthTabs items={monthTabs} value={cur} onChange={setYm} />
          <div className="es-cal">
            {['月', '火', '水', '木', '金', '土', '日'].map((w) => <div key={w} className="es-cal__wd">{w}</div>)}
            {cells.map((c, i) => <CalendarCell key={i} c={c} />)}
          </div>
          <div className="notes">
            <b>注釈</b>
            <span className="k"><i className="sw" style={{ background: '#F6F8FA' }}></i>背景（グレー）</span><span>選択月以外の日付</span>
            <span className="k" style={{ color: '#0969DA' }}><i className="sw" style={{ boxShadow: 'inset 3px 0 0 #0969DA' }}></i>サイクル A1〜D7</span><span>配送サイクルの区分と、サイクル内の日番号（左の青線はサイクル初日 A1）</span>
            <span className="k" style={{ color: '#A40E26' }}>祝日名・休業名</span><span>国民の祝日、または臨時休業日</span>
            <span className="k"><i className="sw" style={{ background: '#FFF6F5', borderColor: '#FFE5E4' }}></i>「サイクル休止」</span><span>配送サイクルを止める期間（設定により出荷も休止）。枠は消費せず、休止明けの翌日から再開</span>
            <span className="k" style={{ color: '#B3410A' }}>「休：出荷」</span><span>出荷不可（関東倉庫の出荷不可枠・出荷不可日）</span>
            <span className="k" style={{ color: '#044F1E' }}>「休：配送」</span><span>配送祝日。祝日に配送できない会社の配送日を自動で再計算します</span>
          </div>
        </Card>

        <Card style={{ width: '27.142857rem', flexShrink: 0 }}>
          <div className="pnl">
            <div className="pnl-h"><EsIcon name="GearSix" size={22} />休止設定</div>
            <Tabs items={[{ value: 'hol' as const, label: '祝日・臨休' }, { value: 'pause' as const, label: 'サイクル休止' }, { value: 'ng' as const, label: '出荷不可' }]} value={tab} onChange={setTab} />
            {tab === 'hol' && <HolidayPanel st={st} setSt={setSt} />}
            {tab === 'pause' && <PausePanel st={st} setSt={setSt} />}
            {tab === 'ng' && <NgPanel st={st} setSt={setSt} />}
          </div>
        </Card>
      </div>

      <HistoryCard />

      {confirm && <SaveConfirm st={st} onCancel={() => setConfirm(false)} onSave={save} />}
    </>
  );
}

type PanelProps = { st: CycleSettings; setSt: (s: CycleSettings) => void };

function HolidayPanel({ st, setSt }: PanelProps) {
  /* 祝日の取り込みは配送サイクルの設定を保存できる人だけ */
  const canAct = useCanAct();
  const { toast } = useOps();
  const empty = { n: '', d: '', s: true, v: true };
  const [f, setF] = useState(empty);
  const [err, setErr] = useState<Errors>({});
  const upd = (id: string, p: Partial<Holiday>) => setSt({ ...st, holidays: st.holidays.map((h) => (h.id === id ? { ...h, ...p } : h)) });
  const add = () => {
    const e = checkHoliday(f, st.holidays);
    setErr(e);
    if (Object.keys(e).length) return;
    setSt({ ...st, holidays: [...st.holidays, { id: 'H' + uid(), ...f }].sort((a, b) => a.d.localeCompare(b.d)) });
    setF(empty);
    toast(`休日「${f.n}」を追加しました（保存すると反映します）`);
  };
  return (
    <>
      <p className="note">※配送サイクルは停止しません。「配送祝日」にした日は、祝日に配送できない会社の配送日を自動で再計算します。「出荷不可」にした日は、その日に出荷する配送を自動で再計算します。</p>
      <div className="acts">
        <Button variant="outline" size="sm" icon="Plus" onClick={() => document.getElementById('h-n')?.focus()}>休日を手動で追加</Button>
        {canAct(api, 'saveCycleSettings') && <Button variant="outline" size="sm" icon="CalendarBlank" onClick={() => toast('祝日を再取得しました（国民の祝日に変更はありません）')}>祝日を再取得</Button>}
      </div>
      <table className="mini">
        <thead><tr><th>休日名</th><th>日付</th><th className="c">出荷不可</th><th className="c">配送祝日</th><th></th></tr></thead>
        <tbody>
          {st.holidays.map((r) => (
            <tr key={r.id}>
              <td>{r.n}</td><td className="m">{r.d}</td>
              <td className="c"><Checkbox checked={r.s} onChange={(s) => upd(r.id, { s })} ariaLabel={r.n + 'の出荷不可'} /></td>
              <td className="c"><Checkbox checked={r.v} onChange={(v) => upd(r.id, { v })} ariaLabel={r.n + 'の配送祝日'} /></td>
              <td className="c"><Button variant="ghost" tone="neutral" size="sm" icon="X" aria-label="削除" onClick={() => setSt({ ...st, holidays: st.holidays.filter((h) => h.id !== r.id) })} /></td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="form">
        <span className="t">休日を手動で追加</span>
        <TextField id="h-n" label="休日名" req placeholder="例）臨時休業日" value={f.n} onChange={(n) => setF({ ...f, n })} error={err.n} />
        <TextField date label="日付" req placeholder="日付" icon="CalendarBlank" value={f.d} onChange={(d) => setF({ ...f, d })} error={err.d} />
        <Field label="追加設定" req error={err.opt}>
          <div className="checks">
            <Checkbox label="出荷不可" checked={f.s} onChange={(s) => setF({ ...f, s })} />
            <Checkbox label="配送祝日" checked={f.v} onChange={(v) => setF({ ...f, v })} />
          </div>
        </Field>
        <Button variant="outline" icon="Plus" block onClick={add}>追加</Button>
      </div>
    </>
  );
}

function PausePanel({ st, setSt }: PanelProps) {
  const { toast } = useOps();
  const empty = { name: '', start: '', end: '', ship: true };
  const [f, setF] = useState(empty);
  const [editId, setEditId] = useState<string | null>(null);
  const [err, setErr] = useState<Errors>({});
  const add = () => {
    const e = checkPause(f);
    setErr(e);
    if (Object.keys(e).length) return;
    const p: Pause = { id: editId ?? 'P' + uid(), ...f };
    setSt({ ...st, pauses: (editId ? st.pauses.map((x) => (x.id === editId ? p : x)) : [...st.pauses, p]).sort((a, b) => a.start.localeCompare(b.start)) });
    toast(`サイクル休止「${f.name}」を${editId ? '更新' : '追加'}しました（保存すると反映します）`);
    setF(empty); setEditId(null);
  };
  return (
    <>
      <p className="note">※休止期間中は配送サイクルを止めます。「出荷不可」を選ぶと同じ期間の出荷も止めます。休止は7日単位にそろえるため、足りない日数は「調整」として休止の直後に自動で足し、次のサイクルから配送を再開します。</p>
      <div className="acts"><Button variant="outline" size="sm" icon="Plus" onClick={() => { setEditId(null); setF(empty); document.getElementById('z-n')?.focus(); }}>サイクル休止を追加</Button></div>
      {st.pauses.map((p) => {
        const l = pauseLabel(p);
        return (
          <div key={p.id} className="pz">
            <div className="row">
              <span className="nm">{p.name}</span>
              <span className="off">休：{p.ship && <><span className="s">出荷</span>・</>}<span className="v">配送</span></span>
              <Button variant="ghost" size="sm" icon="PencilSimple" aria-label="編集" onClick={() => { setEditId(p.id); setF({ name: p.name, start: p.start, end: p.end, ship: p.ship }); }} />
              <Button variant="ghost" tone="negative" size="sm" icon="Trash" aria-label="削除" onClick={() => setSt({ ...st, pauses: st.pauses.filter((x) => x.id !== p.id) })} />
            </div>
            <div className="per"><EsIcon name="CalendarBlank" size={16} /><span className="es-mono">{l.period}</span><span className="days">{l.days}</span></div>
          </div>
        );
      })}
      <div className="form">
        <span className="t">{editId ? 'サイクル休止を編集' : 'サイクル休止を追加'}</span>
        <TextField id="z-n" label="期間名" req placeholder="例）夏季休業" value={f.name} onChange={(name) => setF({ ...f, name })} error={err.name} />
        <div className="two">
          <TextField date label="開始日" req placeholder="開始日" icon="CalendarBlank" value={f.start} onChange={(start) => setF({ ...f, start })} error={err.start} />
          <TextField date label="終了日" req placeholder="終了日" icon="CalendarBlank" value={f.end} onChange={(end) => setF({ ...f, end })} error={err.end} />
        </div>
        <Field label="追加設定" req helper="配送は休止期間中つねに止まります">
          <div className="checks">
            <Checkbox label="出荷不可" checked={f.ship} onChange={(ship) => setF({ ...f, ship })} />
            <Checkbox label="配送（常に停止）" checked disabled />
          </div>
        </Field>
        <Button variant="outline" icon={editId ? 'Checks' : 'Plus'} block onClick={add}>{editId ? '更新' : '追加'}</Button>
      </div>
    </>
  );
}

function NgPanel({ st, setSt }: PanelProps) {
  const { toast } = useOps();
  const [wh, setWh] = useState<'wh1' | 'wh2'>('wh1');
  const [open, setOpen] = useState({ slot: true, lead: true, date: true });
  const [f, setF] = useState({ why: '', d: '' });
  const [err, setErr] = useState<Errors>({});
  useEffect(() => { setErr({}); }, [wh]);
  const ng = st.ngSlots[wh] ?? [], dates = st.ngDates[wh] ?? [];
  const toggleSlot = (code: string) => setSt({ ...st, ngSlots: { ...st.ngSlots, [wh]: ng.includes(code) ? ng.filter((c) => c !== code) : [...ng, code] } });
  const add = () => {
    const e = checkNgDate(f, dates);
    setErr(e);
    if (Object.keys(e).length) return;
    setSt({ ...st, ngDates: { ...st.ngDates, [wh]: [...dates, { id: 'N' + uid(), ...f }].sort((a, b) => a.d.localeCompare(b.d)) } });
    toast(`出荷不可日（${f.d}）を追加しました（保存すると反映します）`);
    setF({ why: '', d: '' });
  };
  const Acc = ({ k, children }: { k: keyof typeof open; children: string }) => (
    <button type="button" className="acc" style={{ border: 0, width: '100%', cursor: 'pointer', font: 'inherit' }} onClick={() => setOpen({ ...open, [k]: !open[k] })} aria-expanded={open[k]}>
      {children}<EsIcon name={open[k] ? 'CaretUp' : 'CaretDown'} size={16} />
    </button>
  );
  return (
    <>
      <p className="note">倉庫ごとに、出荷しないサイクル枠と日付を設定します。日別の出荷不可日はこの倉庫だけに効きます（両方の倉庫にある日は全倉庫の日）。</p>
      <Tabs items={[{ value: 'wh1' as const, label: '関東倉庫' }, { value: 'wh2' as const, label: '関西倉庫' }]} value={wh} onChange={setWh} />
      <Acc k="slot">出荷不可枠</Acc>
      {open.slot && (
        <div className="grid7">
          {['月', '火', '水', '木', '金', '土', '日'].map((w) => <span key={w} className="hd">{w}</span>)}
          {SLOT_ORDER.map((code) => <SlotChip key={code} code={code} state={ng.includes(code) ? 'on' : 'off'} onClick={() => toggleSlot(code)} />)}
        </div>
      )}
      <Acc k="lead">納品不可枠（自動計算）</Acc>
      {open.lead && (
        <div>
          <p className="note">出荷不可枠とリードタイムから逆算した、納品できない枠です。契約の枠選択ではグレーになります。</p>
          {leadRows(ng).map((l) => (
            <div key={l.lead}>
              <div className="lt">リードタイム：{l.lead}日</div>
              <div className="rowchips">{l.codes.map((c) => <SlotChip key={c} code={c} state="dis" />)}</div>
            </div>
          ))}
        </div>
      )}
      <Acc k="date">日別の出荷不可日</Acc>
      {open.date && (
        <>
          <div className="acts"><Button variant="outline" size="sm" icon="Plus" onClick={() => document.getElementById('n-w')?.focus()}>出荷不可日を追加</Button></div>
          <table className="mini">
            <thead><tr><th>理由</th><th>日付</th><th className="c">出荷不可</th><th></th></tr></thead>
            <tbody>
              {dates.map((r) => (
                <tr key={r.id}>
                  <td>{r.why}</td><td className="m">{r.d}</td>
                  <td className="c"><Checkbox checked onChange={() => setSt({ ...st, ngDates: { ...st.ngDates, [wh]: dates.filter((x) => x.id !== r.id) } })} ariaLabel={r.d + 'の出荷不可'} /></td>
                  <td className="c"><Button variant="ghost" tone="neutral" size="sm" icon="X" aria-label="削除" onClick={() => setSt({ ...st, ngDates: { ...st.ngDates, [wh]: dates.filter((x) => x.id !== r.id) } })} /></td>
                </tr>
              ))}
              {!dates.length && <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-low)' }}>出荷不可日はありません</td></tr>}
            </tbody>
          </table>
          <div className="form">
            <span className="t">出荷不可日を追加</span>
            <TextField id="n-w" label="理由" req placeholder="例）棚卸し" value={f.why} onChange={(why) => setF({ ...f, why })} error={err.why} />
            <TextField date label="日付" req placeholder="日付" icon="CalendarBlank" value={f.d} onChange={(d) => setF({ ...f, d })} error={err.d} />
            <Button variant="outline" icon="Plus" block onClick={add}>追加</Button>
          </div>
        </>
      )}
    </>
  );
}

/** 変更履歴（P-HIST：日時・操作した人・操作・項目・変更前・変更後・理由（あれば）＋影響件数。新しい順・画面の一番下。共通データ dm.delivery.cycleSettingsLog） */
function HistoryCard() {
  const { data } = useQuery(api, 'cycleHistory');
  const rows = data ?? [];
  const pg = usePaging(rows);
  const why = rows.some((x) => x.reason);
  return (
    <Card>
      <SectionTitle>変更履歴</SectionTitle>
      {rows.length ? (
        <>
          <div className="es-table-wrap">
            <table className="es-table">
              <thead><tr><th>日時</th><th>操作した人</th><th>操作</th><th>項目</th><th>変更前</th><th>変更後</th>{why && <th>理由</th>}<th>影響件数</th></tr></thead>
              <tbody>
                {pg.rows.map((x) => (
                  <tr key={x.id}>
                    <td className="es-num">{x.at}</td><td>{x.by}</td><td>{x.op}</td><td className="w">{x.item}</td>
                    <td className="w">{x.before}</td><td className="w">{x.after}</td>
                    {why && <td className="w">{x.reason ?? ''}</td>}
                    <td className="es-num">作り直した {x.rebuilt}件／要確認に出した {x.flagged}件</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination {...pg.props} />
        </>
      ) : <EmptyState title="表示するデータがありません。" />}
    </Card>
  );
}

/** 設定を保存しますか？（影響の件数は共通データの配送から数える：delivery.cycleImpact） */
function SaveConfirm({ st, onCancel, onSave }: { st: CycleSettings; onCancel: () => void; onSave: () => void }) {
  const [ok, setOk] = useState(false);
  const { data: im } = useQuery(api, 'cycleImpact', { settings: st });
  const need = !!im && im.deliveries > 0;
  const what = im
    ? [
      ...im.added.map((h) => `${h.date} ${h.name}（${h.kind}）を追加`),
      ...im.removed.map((h) => `${h.date} ${h.name}を削除`),
      ...im.a1Changed.map((ym) => `${ymLabel(ym)} サイクルの A1 を変更`),
    ]
    : [];
  return (
    <EsModal m="CycleSaveConfirm" tone="warning" title="設定を保存しますか？" confirmLabel="確認して保存" confirmDisabled={!im || (need && !ok)} onCancel={onCancel} onConfirm={onSave}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.857143rem', textAlign: 'left' }}>
        <div style={{ fontSize: '1rem', lineHeight: '1.571429rem', color: 'var(--text-middle)' }}>
          {!im ? '影響を数えています…' : what.length ? `${what.join('・')}します。` : '変更はありません。'}
        </div>
        {im && (
          <table className="imp">
            <tbody>
              <tr><td>お届け日・出荷日が新しい休み（祝日・出荷不可日）にかかる配送（予定・出荷待）</td><td className="n">{im.deliveries}件</td></tr>
              <tr className="sub"><td>お届けできない日になる</td><td className="n">{im.noDeliver}件</td></tr>
              <tr className="sub"><td>出荷できない日になる</td><td className="n">{im.noShip}件</td></tr>
              <tr className={im.sent ? 'warn' : ''}><td>そのうち出荷指示を送った配送（日付を変えたら再送・rev+1）</td><td className="n">{im.sent}件</td></tr>
              <tr className={im.requests ? 'warn' : ''}><td>そのうちお届け日の変更申請（申請中）がある配送</td><td className="n">{im.requests}件</td></tr>
              <tr><td>知らせる委託配送先</td><td className="n">{im.carriers}社</td></tr>
            </tbody>
          </table>
        )}
        {im && im.sample.length > 0 && <div style={{ fontSize: '0.857143rem', lineHeight: '1.285714rem', color: 'var(--text-low)' }}>例：{im.sample.join('、')}{im.deliveries > im.sample.length ? ' ほか' : ''}</div>}
        {need && (
          <div style={{ background: 'var(--warning-50)', border: '1px solid var(--warning-100)', borderRadius: 4, padding: '0.714286rem 0.857143rem' }}>
            <Checkbox label={`保存しても配送の日付は自動では変わりません。${im!.deliveries}件の配送をスケジュールの「日付を変える」で動かすことを確認した`} checked={ok} onChange={setOk} />
          </div>
        )}
        <div style={{ fontSize: '0.857143rem', lineHeight: '1.285714rem', color: 'var(--text-low)' }}>保存は止めません（設備点検・棚卸しは動かせないため）。{need ? 'チェックを入れると「確認して保存」を押せます。' : ''}</div>
      </div>
    </EsModal>
  );
}

/* 設定状況の帯（配送_02 §4-2・REQ-DL-718）：上段＝配送サイクル設定、下段＝メニューの公開。未設定の月は「!」。押すとその月のタブ */
const CYC: Record<CycleBand['months'][number]['cycle'], { t: string; bg: string; fg: string }> = {
  locked: { t: '確定済', bg: '#D0D7DE', fg: '#24292F' },
  set: { t: '設定済', bg: '#DAFBE1', fg: '#116329' },
  hole: { t: '未設定（穴）', bg: '#FFEBE9', fg: '#CF222E' },
  future: { t: '未設定（今後）', bg: '#F6F8FA', fg: '#6E7781' },
};
const MENU: Record<CycleBand['months'][number]['menu'], { bg: string; fg: string }> = {
  運用中: { bg: '#D0D7DE', fg: '#24292F' }, 公開済: { bg: '#DDF4FF', fg: '#0969DA' }, 公開準備中: { bg: '#FFF8C5', fg: '#9A6700' }, 未公開: { bg: '#F6F8FA', fg: '#6E7781' },
};
function StatusBand({ band, cur, onPick }: { band: CycleBand; cur: string; onPick: (ym: string) => void }) {
  const cell = (bg: string, fg: string, on: boolean) => ({ flex: '1 0 4.571429rem', padding: '0.285714rem 0.142857rem', textAlign: 'center' as const, background: bg, color: fg, fontSize: '0.785714rem', lineHeight: '1.142857rem', borderRadius: 4, outline: on ? '2px solid #0969DA' : undefined, cursor: 'pointer' });
  const head = { width: '7.428571rem', flexShrink: 0, fontSize: '0.857143rem', fontWeight: 700, alignSelf: 'center' as const };
  const warn = band.remain < 2;
  return (
    <Card>
      <div style={{ overflowX: 'auto' }}>
        <div style={{ display: 'flex', gap: '0.285714rem', minWidth: 'max-content', marginBottom: '0.285714rem' }}>
          <span style={head}>配送サイクル設定</span>
          {band.months.map((m) => (
            <div key={m.ym} role="button" title={m.reason || CYC[m.cycle].t} style={cell(CYC[m.cycle].bg, CYC[m.cycle].fg, m.ym === cur)} onClick={() => onPick(m.ym)}>
              <b>{fmtYm(m.ym)}{(m.cycle === 'hole' || m.cycle === 'future') && ' !'}</b><br />{CYC[m.cycle].t}
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '0.285714rem', minWidth: 'max-content' }}>
          <span style={head}>メニュー公開</span>
          {band.months.map((m) => <div key={m.ym} style={cell(MENU[m.menu].bg, MENU[m.menu].fg, false)} onClick={() => onPick(m.ym)}>{m.menu}</div>)}
        </div>
      </div>
      <div style={{ marginTop: '0.571429rem', fontSize: '0.857143rem', lineHeight: '1.285714rem', color: warn ? '#CF222E' : 'var(--text-middle)', fontWeight: warn ? 700 : 400 }}>
        設定済みの最終月は {fmtYm(band.lastSet)}（残り {band.remain}ヶ月）。{band.lockedTo && `確定済み（編集不可）は ${fmtYm(band.lockedTo)} まで、`}{band.editableFrom ? `変更できるのは ${fmtYm(band.editableFrom)} 以降です。` : '変更できる月はありません（設定対象期間を後ろへ延ばしてください）。'}
      </div>
      {band.holes.length > 0 && (
        <div style={{ marginTop: '0.285714rem', fontSize: '0.857143rem', color: '#CF222E' }}>
          設定のない月があります：{band.holes.map(fmtYm).join('・')}　この月は納品予定も配送データも作られません。法人にも表示されず、変更申請もできません。
        </div>
      )}
    </Card>
  );
}
