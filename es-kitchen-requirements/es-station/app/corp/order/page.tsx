'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useRef, useState, type ReactNode } from 'react';
import { capTxt, checks, clone, coldDl, dlsOf, FRAMES, frozDl, isStd, isVm, nextMonth, prods, split, sumBy, target, type Check } from '@/lib/corp/order/logic';
import type { ProdX, Qty } from '@/lib/corp/order/types';
import { today } from '@/lib/supplier/dates';
import { useOpsLeaveGuard } from '@/lib/ui/leaveGuard';
import { useCorpSignedIn } from '../_ui/CorpProvider';
import { About, AiPick, LogTable, MenuDetail, NgDialog, PrefDialog, Stats, SurveyDialog, SurveyStart } from './_components/modals';
import { Badge, Button, Card, Checkbox, ConfirmDiscard, EmptyState, Head, Icon, InlineMessage, Pager, Ro, SearchPanel, SegmentedControl, Select, Stepper, Table, Td, TempTag, TextField, TLink, type Col } from './_components/es';
import { api, useOrder } from './_components/OrderProvider';
import { AboutLink, DlLabel, FoldBtn, Loading, MenuPdfLink, MoreMenu, PlanLine, prefTxt, SiteTabs, StatusBadge, Tabs, Tags, Thumb } from './_components/parts';
import { prodImg } from './_components/photo';
import { fmtDate } from '@/lib/format/date';

type ModalT =
  | { type: 'discard'; go: () => void }
  | { type: 'ng'; cs: Check[] } | { type: 'menu'; p: string } | { type: 'stats' } | { type: 'pref' }
  | { type: 'aiPick' } | { type: 'surveyStart' } | { type: 'survey' } | { type: 'about' };

/** 表示の切替のアイコン（一覧／カード） */
function ico(kind: 'list' | 'grid') {
  const d = kind === 'list' ? 'M5 7h14M5 12h14M5 17h14' : 'M5 5h6v6H5zM13 5h6v6h-6zM5 13h6v6H5zM13 13h6v6h-6z';
  return <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d={d} /></svg>;
}

/** 代替品設定の対象の便の欄に出す理由（I220） */
/** 一覧に出すものがないとき（_共通_メッセージ I01） */
const I01 = '表示するデータがありません。';
const I220 = '代替品設定の対象のため注文できません。';
/** メニューから外れた商品（#266①）：行の印と、数を増やせない案内 */
const GONE = 'メニューから外れました';
const GONE_HINT = 'メニューから外れた商品のため、数を増やせません（減らす・0にするだけです）。';

/**
 * 月次注文 ＞ 商品注文（元：部品/23 の Order）。版 1.1（hong 2026-10-05 版1.0レビュー ①〜⑥・受付簿 No.153）：
 * 見出しは「登録」（主）・「キャンセル」（副）・「その他」メニュー、メニューPDF のリンク、受付期間・ご契約・検索・合計の帯は折りたためる（合計の帯は上に固定）、
 * 温度帯は写真の角にアイコン＋色、商品タグは商品名の下、一覧は保存方法の列、代替品の便の欄は無効（I220）、締切後は注文履歴 詳細へ移る
 */
export default function OrderPage() {
  return <Suspense fallback={<Loading />}><Order /></Suspense>;
}

function Order() {
  const router = useRouter();
  const sp = useSearchParams();
  /** 画面内のタブ（P-TAB・URL の ?tab=）：注文（既定）／変更履歴。変更履歴はモーダルをやめてタブにした（台帳 F 版 1.1 レビュー②） */
  const tab: 'order' | 'history' = sp.get('tab') === 'history' ? 'history' : 'order';
  const setTab = (t: 'order' | 'history') => router.replace(t === 'history' ? '/corp/order?tab=history' : '/corp/order');
  const { view } = useCorpSignedIn();
  const { data, s, S, set, qtyOf, dirtyO, acc, toast, toastError } = useOrder();
  const [modal, setModal] = useState<ModalT | null>(null);
  const [busy, setBusy] = useState(false);
  /** この画面で登録したあと（拠点ごと）：案内 I216「資材のご注文もできます」を出す */
  const [done, setDone] = useState<Record<string, boolean>>({});
  /** 合計の帯：商品の一覧をスクロールして上に固定されたら小さくする */
  const [stuck, setStuck] = useState(false);
  const sentinel = useRef<HTMLDivElement>(null);
  /* 入力中に サイドメニュー・ブラウザの戻る で離れるときは Q02（枠が hasUnsavedChanges を見る。資材注文と同じ） */
  useOpsLeaveGuard(() => !!s && dirtyO(s.id));
  const cycOpen = !!data?.cycle.open;
  /* 締切後は商品注文の画面を出さず、その月の注文履歴 詳細（参照）へ（版 1.1 ⑥・No.56）。休止中・お試しはそのまま */
  const redirect = !!data && !!s && !s.paused && !s.trial && !cycOpen;
  useEffect(() => { if (redirect && s && data) router.replace('/corp/order/history/' + s.id + '/' + (data.cycle.closedYm ?? data.cycle.ym)); }, [redirect, s, data, router]);
  useEffect(() => {
    const el = sentinel.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    /* 目印（合計の帯のすぐ上）がスクロールの枠（.corp-main）の上に出たら「固定」。下にあるとき（まだスクロールしていない）は違う */
    const root = el.closest('.corp-main') as HTMLElement | null;
    const io = new IntersectionObserver(([e]) => setStuck(!e.isIntersecting && e.boundingClientRect.top < (e.rootBounds?.top ?? 0) + 1), { root, threshold: 0 });
    io.observe(el);
    return () => io.disconnect();
  }, [data, s?.id, redirect]);
  if (!data || !s || redirect) return <Loading />;
  const P = data.products, CATS = data.cats, cyc = data.cycle;
  const close = () => setModal(null);
  const leave = (go: () => void) => { if (dirtyO(s.id)) setModal({ type: 'discard', go }); else go(); };
  const discard = () => set((o) => { const qq = { ...o.qty }, mm = { ...o.mqty }; delete qq[s.id]; delete mm[s.id]; return { qty: qq, mqty: mm }; });
  const pickSite = (id: string) => leave(() => set({ site: id, sel: {}, pg: 1 }));
  const head = (title: ReactNode) => <Head crumb={['月次注文', '商品注文']} title={title} />;
  /** 解約後（参照のみ）：登録・その他のボタンを出さず、数も変えられない（台帳 E 2026-10-05） */
  const ro = view === 'ro';
  const fold = (k: string) => !!S.fold[k];
  const toggle = (k: string) => set((o) => ({ fold: { ...o.fold, [k]: !o.fold[k] } }));

  const modals = (() => {
    const m = modal; if (!m) return null;
    if (m.type === 'discard') return <ConfirmDiscard onCancel={close} onConfirm={() => { discard(); close(); setTimeout(m.go, 0); }} />;
    if (m.type === 'ng') return <NgDialog cs={m.cs} onClose={close} />;
    if (m.type === 'menu') { const p = P.find((x) => x.id === m.p); return p ? <MenuDetail p={p} onClose={close} /> : null; }
    if (m.type === 'stats') return <Stats s={s} P={P} q={qtyOf(s.id)} cats={CATS} cycL={cyc.label} onClose={close} />;
    if (m.type === 'pref') return <PrefDialog s={s} P={P} cats={CATS} pref={data.prefs[s.id]} next={!!data.next[s.id]} onClose={close} onSave={async (p) => {
      try {
        await api.action('savePref', { acc, site: s.id, pref: p });
        close(); toast('保存しました。翌月（' + nextMonth(cyc.ym) + '）のメニューから自動注文・AI（自動提案）に反映します');
      } catch (e) { toastError(e); }
    }} />;
    if (m.type === 'aiPick') return <AiPick onClose={close} onPick={(mode) => { close(); router.push('/corp/order/ai?mode=' + mode); }} />;
    if (m.type === 'surveyStart') return <SurveyStart from={today()} to={cyc.to} onClose={close} onStart={async (due) => {
      try {
        await api.action('startSurvey', { acc, site: s.id, due });
        close(); toast('従業員アンケートの案内を送りました（デモでは途中の集計を表示します）');
      } catch (e) { toastError(e); }
    }} />;
    if (m.type === 'survey') { const sv = data.surveys[s.id]; return sv ? <SurveyDialog s={s} P={P} sv={sv} onClose={close} /> : null; }
    if (m.type === 'about') return <About cycL={cyc.label} from={cyc.from} to={cyc.to} today={today()} onClose={close} />;
    return null;
  })();
  const wrap = (body: ReactNode) => <>{body}{modals}<AboutLink onOpen={() => setModal({ type: 'about' })} /></>;

  /* 休止中 */
  if (s.paused) return wrap(
    <div className="od-stack">
      {head('商品注文 ' + cyc.label)}<SiteTabs kind="order" onPick={pickSite} />
      <Card><EmptyState title="この拠点は休止中です" icon="ClockCountdown">{s.pauseNote ?? 'この拠点は休止しています。'}休止中はご注文を作りません。再開の承認後、再開するご利用月からご注文できます。</EmptyState></Card>
    </div>,
  );
  /* STEP5-MORE-20261001 QC：お試しのオーダーは参照だけ（数・商品・お届け日） */
  if (s.trial) {
    const tq = qtyOf(s.id), tt = sumBy(s, P, tq), trs = prods(s, P).filter((p) => { const r0 = tq[p.id] || {}; return Object.keys(r0).some((k) => r0[k] > 0); });
    return wrap(
      <div className="od-stack">
        {head('商品注文 ' + cyc.label)}<SiteTabs kind="order" onPick={pickSite} />
        <InlineMessage tone="info" title="お試し中のご注文（参照のみ）">{s.trialNote}</InlineMessage>
        <Card>
          <div className="es-section-title"><h2>{'お届けする商品（合計 ' + tt.total + '個・' + trs.length + '品）'}</h2></div>
          <PlanLine x={s} />
          <Table cls="od-tbl" cols={[{ label: 'No', w: 48 }, { label: '写真', w: 60 }, { label: '商品名' }, { label: 'カテゴリ' }, { label: '保存方法' } as Col].concat(s.dl.map((d) => ({ label: <span><DlLabel d={d} /> {d.date}</span>, cls: 'c' })))}
            rows={trs.map((p, i) => (
              <tr key={p.id}><Td v={i + 1} /><td><Thumb src={prodImg(p)} name={p.name} /></td><td>{p.name}{p.nameEn ? <div className="od-small">{p.nameEn}</div> : null}</td><Td v={p.cat} /><td><TempTag kind={p.keep} /></td>
                {s.dl.map((d) => <Td key={d.k} v={((tq[p.id] || {})[d.k] || 0) + '個'} cls="c" />)}</tr>
            ))} />
        </Card>
      </div>,
    );
  }

  const q = qtyOf(s.id), t = sumBy(s, P, q), sv = data.surveys[s.id], ps = prods(s, P, true), fq = S.q, next = !!data.next[s.id], dirty = dirtyO(s.id);
  const list = ps.filter((p) => {
    /* 英語の商品名も大文字小文字を区別せずに探す（受付簿 #280 ②・#245）。項目ごとに探す（つなげた文字列だとつなぎ目で一致してしまう） */
    const kw = ((fq.kw as string | undefined) ?? '').toLowerCase();
    if (kw && ![p.name, p.nameEn ?? '', p.desc, p.raw, ...p.alg, ...p.alg2].some((f) => f.toLowerCase().indexOf(kw) >= 0)) return false;
    if (fq.cat && p.cat !== fq.cat) return false;
    if (fq.st && p.keep !== fq.st) return false;
    if (fq.tag && p.tags.indexOf(fq.tag as string) < 0) return false;
    if (fq.noShort && p.exp) return false;
    return true;
  });
  const selIds = Object.keys(S.sel).filter((k) => S.sel[k]);
  /** 代替品設定の対象（不良商品）で入れられない便：欄を無効（灰色・押せない）にしてツールチップ I220（版 1.1 ⑤・No.26） */
  const blk = (pid: string, k: string) => !!s.blocked?.[pid]?.includes(k);
  /** メニューから外れた商品（注文に残っている）：数は減らす・0にするだけ。増やせる上限＝登録済みの数（受付簿 #266①） */
  const gonePid = (id: string) => !!P.find((x) => x.id === id)?.gone;
  const origQ = (pid: string, k: string) => data.orders[s.id].q[pid]?.[k] ?? 0;
  const capGone = (pid: string, k: string, n: number) => (gonePid(pid) ? Math.min(n, origQ(pid, k)) : n);
  const allSel = !!list.length && list.every((p) => S.sel[p.id]);
  /** 数を変える（入力中の数に） */
  const editQ = (fn: (qq: Qty) => void) => set((o) => { const qq = clone(o.qty[s.id] ?? data.orders[s.id].q); fn(qq); return { qty: { ...o.qty, [s.id]: qq } }; });
  const setQty = (pid: string, k: string, n: number) => editQ((qq) => { qq[pid] = { ...(qq[pid] || {}), [k]: n }; });
  const qd = (k: string) => (v: string | boolean) => set((o) => ({ qd: { ...o.qd, [k]: v } }));
  const showMenu = (id: string) => setModal({ type: 'menu', p: id });
  const pickSel = (id: string, on: boolean) => set((o) => ({ sel: { ...o.sel, [id]: on ? 1 : 0 } }));
  /** 便ごとの数量の欄（代替品設定の対象の便は無効＋I220。参照のみも無効） */
  const stepper = (p: ProdX, dk: string, dl: string, v: number) => {
    const off = blk(p.id, dk);
    return <Stepper value={v} label={p.name + ' ' + dl} disabled={off || ro} title={off ? I220 : p.gone ? GONE_HINT : undefined} max={p.gone ? origQ(p.id, dk) : undefined} onChange={(n) => setQty(p.id, dk, n)} />;
  };

  async function register() {
    const cs = checks(s!, P, q);
    if (cs.some((c) => c.state === 'ng')) { setModal({ type: 'ng', cs }); return; }
    setBusy(true);
    try {
      await api.action('registerOrder', { acc, site: s!.id, q });
      set((o) => { const qq = { ...o.qty }; delete qq[s!.id]; return { qty: qq }; });
      /* hong 2026-10-05 B-9：モーダルは出さず、トースト S212 と画面の上の案内 I216 */
      toast('ご注文を登録しました。');
      setDone((o) => ({ ...o, [s!.id]: true }));
    } catch (e) { toastError(e); } finally { setBusy(false); }
  }

  /* 合計の帯（版 1.1 ③：スクロールすると小さくなって上に固定。「∨」で折りたためる） */
  const sumFold = fold('sum');
  const sumBar = (
    <>
      <div ref={sentinel} className="od-sum__sentinel" aria-hidden />
      <div className={'od-sum' + (stuck ? ' is-stuck' : '') + (sumFold ? ' is-folded' : '')}>
        <div className="od-sum__tot">
          <div className={'od-sum__row is-main' + (t.total !== s.plan ? ' ng' : '')}><span>合計</span><b>{t.total}</b>{'/ ' + s.plan + '個'}</div>
          {sumFold ? null : <>
            <div className={'od-sum__row' + (t.cold < s.cap.chilled[0] || t.cold > s.cap.chilled[1] ? ' ng' : '')}><span><TempTag kind="mixed" /></span><b>{t.cold}</b>{'（' + capTxt(s.cap.chilled) + '）'}</div>
            {isStd(s) ? <div className={'od-sum__row' + (t.frozen < s.cap.frozen![0] || t.frozen > s.cap.frozen![1] ? ' ng' : '')}><span><TempTag kind="frozen" /></span><b>{t.frozen}</b>{'（' + capTxt(s.cap.frozen!) + '）'}</div> : null}
          </>}
        </div>
        {sumFold ? null : (
          <div className="od-sum__dl">
            {s.dl.map((d) => {
              const n = t.byDl[d.k], tg = target(s, t, d), g = d.t === 'frozen' ? frozDl(s) : coldDl(s), v = g.map((x) => t.byDl[x.k]), ok = Math.abs(n - tg) <= 1 && Math.max(...v) - Math.min(...v) <= 1;
              return (
                <div key={d.k} className={'od-sum__d' + (ok ? '' : ' ng')}>
                  <DlLabel d={d} /><span>{d.date}</span><b>{n}<small>個</small></b>
                  <span className={'od-hint' + (ok ? ' ok' : '')}>{ok ? '目安どおり' : '目安 ' + tg + '個（' + (n > tg ? '+' : '') + (n - tg) + '）'}</span>
                </div>
              );
            })}
          </div>
        )}
        <div className="od-sum__act"><Button variant="outline" size={stuck ? 'sm' : 'md'} onClick={() => setModal({ type: 'stats' })}>統計</Button><FoldBtn open={!sumFold} label="合計の帯" onToggle={() => toggle('sum')} /></div>
      </div>
    </>
  );

  const bulk = selIds.length ? (
    <div className="od-bulk">
      <b>{selIds.length + '品を選択中'}</b>
      <Button variant="outline" size="sm" icon="Trash" onClick={() => editQ((qq) => { selIds.forEach((id) => { Object.keys(qq[id] || {}).forEach((k) => { if (!blk(id, k)) qq[id][k] = 0; }); }); })}>注文内容をクリア</Button>
      <Button variant="outline" size="sm" onClick={() => { editQ((qq) => { selIds.forEach((id) => { const r = qq[id], ks = Object.keys(r || {}); ks.forEach((k) => { if (!blk(id, k)) r[k] = capGone(id, k, r[ks[0]]); }); }); }); toast('第1便の数をほかの便にコピーしました。'); }}>第1便をコピー</Button>
      <SegmentedControl size="sm" className="od-viewseg" value={S.bulkMode} items={[{ value: 'each', label: '配送ごとの数量' }, { value: 'sum', label: '合計を振り分け' }]} onChange={(v) => set({ bulkMode: v })} />
      <Stepper value={S.bulkN} onChange={(n) => set({ bulkN: n })} label="一括の数量" />
      <Button size="sm" onClick={() => editQ((qq) => { selIds.forEach((id) => { const r = qq[id] || {}, ks = Object.keys(r); const a = S.bulkMode === 'sum' ? split(S.bulkN, ks.length) : ks.map(() => S.bulkN); ks.forEach((k, i) => { if (!blk(id, k)) r[k] = capGone(id, k, a[i]); }); }); })}>適用</Button>
    </div>
  ) : null;

  const tools = (
    <div className="od-tools">
      <Checkbox label="全てチェック" checked={allSel} indeterminate={!allSel && selIds.length > 0} onChange={(on) => { const mm: Record<string, number> = {}; if (on) list.forEach((p) => { mm[p.id] = 1; }); set({ sel: mm }); }} />
      {ro ? null : bulk}
      <div className="od-tools__r">
        <SegmentedControl size="sm" className="od-viewseg" label="表示" value={S.view} items={[{ value: 'list', label: ico('list') }, { value: 'grid', label: ico('grid') }]} onChange={(v) => set({ view: v, pg: 1 })} />
      </div>
    </div>
  );

  const Grid = (items: ProdX[]) => (
    <div className="od-grid">
      {items.map((p) => {
        const ds = dlsOf(s, p), tot = ds.reduce((a, d) => a + ((q[p.id] || {})[d.k] || 0), 0), on = !!S.sel[p.id];
        return (
          <article key={p.id} className={'od-pc' + (on ? ' is-sel' : '')}>
            <div className="od-pc__img">
              <Thumb src={prodImg(p)} name={p.name} cls="" />
              <span className="od-pc__chk"><Checkbox checked={on} ariaLabel={p.name} onChange={(v) => pickSel(p.id, v)} /></span>
              {/* 温度帯：アイコン＋色を写真の右上の角に（文字なし・マウスを乗せると名前。版 1.1 ④・No.9.4） */}
              <span className="od-pc__temp"><TempTag kind={p.keep} iconOnly /></span>
              {p.vm && isVm(s) ? <span className="od-pc__vm">{p.vmL}</span> : null}
            </div>
            <div className="od-pc__body">
              <div className="od-pc__name" title={p.name} onClick={() => showMenu(p.id)}>{p.name}{p.nameEn ? <div className="od-small">{p.nameEn}</div> : null}{p.gone ? <div className="od-small od-removed" title={GONE_HINT}>{GONE}</div> : null}</div>
              {/* 商品タグは商品名の下（写真の上には置かない。版 1.1 ④・No.9.3） */}
              {p.tags.length ? <span className="od-pc__tags"><Tags p={p} /></span> : null}
              <div className="od-pc__dls">{ds.map((d) => <div key={d.k} className="od-pc__dl"><DlLabel d={d} />{stepper(p, d.k, d.l, (q[p.id] || {})[d.k] || 0)}</div>)}</div>
              {sv ? <div className="od-pc__score">アンケート <b>{(p.like * 2 + p.cur) + '点'}</b>{'（食べたい ' + p.like + '人・気になる ' + p.cur + '人）'}</div> : null}
              <div className="od-pc__foot">合計<b>{tot + '個'}</b>{'定価（税込） ' + p.price + '円'}<Button variant="outline" size="sm" onClick={() => showMenu(p.id)}>詳細</Button></div>
            </div>
          </article>
        );
      })}
    </div>
  );
  const List = (items: ProdX[], paged: boolean) => {
    /* 保存方法は商品名の次の列（アイコン＋色＋文字。版 1.1 ④・No.55） */
    const cols: Col[] = [{ label: 'No', w: 48 }, { label: '', w: 40 }, { label: '写真', w: 60 }, { label: '商品名' }, { label: '保存方法' }, { label: 'カテゴリ' }, { label: '商品タグ' }, { label: '短消費期限' }];
    if (sv) cols.push({ label: <span>アンケート<br /><small className="od-small">{'〜' + fmtDate(sv.due)}</small></span>, cls: 'r' });
    cols.push({ label: '定価（税込）', cls: 'r' });
    s.dl.forEach((d) => cols.push({ label: <span><DlLabel d={d} /><br /><small className="od-small">{d.date}</small></span>, cls: 'dh' }));
    cols.push({ label: '合計数', cls: 'r' });
    const off = paged ? (S.pg - 1) * S.per : 0;
    return (
      <Table cls="od-tbl" cols={cols} rows={items.map((p, i) => {
        const on = !!S.sel[p.id]; let tot = 0;
        return (
          <tr key={p.id} className={on ? 'is-sel' : undefined}>
            <Td v={off + i + 1} />
            <td><Checkbox checked={on} ariaLabel={p.name} onChange={(v) => pickSel(p.id, v)} /></td>
            <td><Thumb src={prodImg(p)} name={p.name} /></td>
            <td className="w"><TLink onClick={() => showMenu(p.id)}>{p.name}</TLink>{p.nameEn ? <div className="od-small">{p.nameEn}</div> : null}{p.gone ? <div className="od-small od-removed" title={GONE_HINT}>{GONE}</div> : null}{p.vm && isVm(s) ? <div className="od-small">{p.vmL}</div> : null}</td>
            <td><TempTag kind={p.keep} /></td>
            <Td v={p.cat} /><td><Tags p={p} /></td><Td v={p.exp || '—'} />
            {sv ? <td className="r"><div className="od-scorecell"><b>{(p.like * 2 + p.cur) + '点'}</b><small>{(p.like + p.cur) + '人/' + sv.N + '人'}</small></div></td> : null}
            <Td v={p.price + '円'} cls="r" />
            {s.dl.map((d) => {
              const v = (q[p.id] || {})[d.k];
              /* 温度帯の違う便（冷凍の商品の冷蔵の便など）は「—」。代替品設定の対象の便は欄を無効にして出す */
              if (v == null && !blk(p.id, d.k)) return <td key={d.k} className="dz">—</td>;
              tot += v || 0;
              return <td key={d.k} className="c">{stepper(p, d.k, d.l, v || 0)}</td>;
            })}
            <Td v={tot + '個'} cls="r" />
          </tr>
        );
      })} />
    );
  };
  const body = (items: ProdX[], paged: boolean) => {
    const shown = paged ? items.slice((S.pg - 1) * S.per, S.pg * S.per) : items;
    if (!items.length) return <EmptyState title={I01} compact />;
    return (
      <>
        {S.view === 'grid' ? Grid(shown) : List(shown, paged)}
        {paged ? <Pager total={items.length} page={S.pg} per={S.per} onPage={(n) => set({ pg: n })} onPer={(n) => set({ per: n, pg: 1 })} /> : null}
      </>
    );
  };
  let content: ReactNode;
  if (isVm(s)) {
    const vmT = coldDl(s).map((d) => { let n = 0; list.forEach((p) => { if (p.vm) n += (q[p.id] || {})[d.k] || 0; }); return { d, n }; });
    content = (
      <>
        <InlineMessage tone={vmT.some((x) => x.n > 50) ? 'warning' : 'info'} title="自販機の商品は1回の配送で最大50個まで">
          {vmT.map((x) => x.d.l + ' ' + x.n + '個').join('／') + '。棚ごとの最大格納数は目安です（在庫・お客様の配置によって入らないことがあります）。この拠点には冷蔵庫がありません（ESライト（自販機））。自販機に入らない商品も注文できます。注文するか・届いた後の置き場所はお客様のご判断です。'}
        </InlineMessage>
        {FRAMES.map((f) => {
          const its = list.filter((p) => (p.vm || 'X') === f.k), open = S.open[f.k];
          if (!its.length) return null;
          const sums = s.dl.map((d) => { let n = 0; its.forEach((p) => { n += (q[p.id] && q[p.id][d.k]) || 0; }); return { d, n }; }).filter((x) => f.k === 'X' || x.d.t !== 'frozen');
          return (
            <section key={f.k} className={'od-frame' + (f.k === 'X' ? ' off' : '')}>
              <button type="button" className="od-frame__h" aria-expanded={open} onClick={() => set((o) => ({ open: { ...o.open, [f.k]: !open } }))}>
                <b>{f.label}<span className="od-small" style={{ fontWeight: 400, marginLeft: '0.571429rem' }}>{f.sub}</span></b>
                {f.cap ? <span>最大格納数（目安）<b>{' ' + f.cap + '個'}</b></span> : null}
                {sums.map((x) => <span key={x.d.k} className={f.cap && x.n > f.cap ? 'warn' : ''}>{x.d.l + '合計：'}<b>{x.n}</b></span>)}
                <span>{its.length + '品'}</span>
                <Icon name={open ? 'CaretUp' : 'CaretDown'} size={18} />
              </button>
              {open ? <div className="od-frame__b">{body(its, false)}</div> : null}
            </section>
          );
        })}
      </>
    );
  } else content = body(list, true);
  /* 自販機の拠点も、検索で 0 件のときは I01（枠の見出しだけが並ばない） */
  if (isVm(s) && !list.length) content = <EmptyState title={I01} compact />;

  /* 見出しの「その他」メニュー（AI・注文の設定・アンケート。版 1.1 ①・No.53。変更履歴は画面内のタブ） */
  const more = (
    <MoreMenu items={[
      { label: 'AI（自動提案）で注文', icon: 'CircleNotch', disabled: !cyc.open, onPick: () => setModal({ type: 'aiPick' }) },
      { label: '注文の設定', icon: 'GearSix', onPick: () => setModal({ type: 'pref' }) },
      { label: 'アンケート', icon: 'ReadCvLogo', disabled: !cyc.open && !sv, onPick: () => setModal({ type: sv ? 'survey' : 'surveyStart' }) },
    ]} />
  );
  const infoFold = fold('info'), kidFold = fold('kid'), searchFold = fold('search');

  return wrap(
    <div className="od-stack">
      {head('商品注文 ' + cyc.label)}
      <SiteTabs kind="order" onPick={pickSite} />
      {/* 登録のあとの案内 I216（続けて資材注文へ。押すのは任意） */}
      {done[s.id] && !dirty ? (
        <InlineMessage tone="info" title="資材のご注文もできます" action={<a href="#" className="od-link" onClick={(e) => { e.preventDefault(); router.push('/corp/order/materials'); }}>資材注文を開く</a>}>
          資材のご注文もできます。必要なときは「資材注文を開く」からご注文ください。
        </InlineMessage>
      ) : null}
      <Card>
        <div className="od-head">
          <PlanLine x={s} />
          <span className="od-status"><StatusBadge st={data.orders[s.id].status} />{sv ? <Badge tone="primary">{'アンケート 回答中（〜' + fmtDate(sv.due) + '）'}</Badge> : null}</span>
          {ro ? null : (
            <div className="od-head__act">
              {more}
              <Button variant="outline" tone="neutral" disabled={!dirty} onClick={() => setModal({ type: 'discard', go: () => {} })}>キャンセル</Button>
              <Button disabled={busy || !cyc.open} onClick={register}>登録</Button>
            </div>
          )}
        </div>
        <Tabs label="商品注文の表示" value={tab} onChange={setTab} items={[{ key: 'order', label: '注文' }, { key: 'history', label: '変更履歴' }]} />
        {tab === 'history' ? <LogTable list={data.logs[s.id] || []} /> : <>
        {/* 受付期間の案内 I205（折りたためる・右にメニューPDF のリンク。版 1.1 ②③） */}
        {/* 解約後（参照のみ）は「何度でも変更できます」など編集の案内を出さない：受付期間の見出しとメニューPDF だけ（受付簿 No.157） */}
        <InlineMessage tone="info" folded={infoFold} title={'受付期間 ' + fmtDate(cyc.from) + '〜' + fmtDate(cyc.to) + '（あと' + cyc.daysLeft + '日）'}
          action={<><MenuPdfLink pdfs={data.menuPdfs[cyc.ym]} course={s.course} /><FoldBtn open={!infoFold} label="受付期間の案内" onToggle={() => toggle('info')} /></>}>
          {ro ? null : '締切までは何度でも変更できます。締切までに一度も登録がないときは、' + (next ? '下書きの数（「次回以降も適用」の AI（自動提案））' : '自動注文（ESキッチンの標準数 × ' + s.mult + '倍に拠点の設定をかけた数）') + 'で確定します。' + 'ESキッチンのご利用月は、暦の月と少しずれます。' + (dirty ? '　※ 変更がまだ登録されていません。「登録」を押すと確定します。' : '')}
        </InlineMessage>
        {/* 締切の7日前から：まだご注文を入れていない（受付簿 No.30） */}
        {!ro && cyc.open && cyc.daysLeft <= 7 && data.orders[s.id].status === 'デフォルト' ? (
          <InlineMessage tone="warning" title={'ご注文がまだ入力されていません（締切 ' + fmtDate(cyc.to) + '・' + (cyc.daysLeft ? 'あと' + cyc.daysLeft + '日' : '本日まで') + '）'}>
            {'締切までに「登録」がない場合は、' + (next ? '下書きの数（「次回以降も適用」の AI（自動提案））' : '自動注文（ESキッチンの標準数）') + 'でお届けします。'}
          </InlineMessage>
        ) : null}
        {s.altNote ? <InlineMessage tone="warning" title="商品の不良のため注文できない便があります">{s.altNote}</InlineMessage> : null}
        {/* この月のご契約（折りたためる） */}
        <div className={'od-fold od-kid' + (kidFold ? ' is-folded' : '')}>
          <div className="od-fold__h"><b>この月のご契約</b><FoldBtn open={!kidFold} label="この月のご契約" onToggle={() => toggle('kid')} /></div>
          {kidFold ? null : (
            <div className="od-g4">
              <Ro label="この月のご契約" v={s.kid} />
              <Ro label="月のお届け数" v={'合計 ' + s.plan + '個（月' + s.plan + '個プラン）・冷蔵・常温 ' + capTxt(s.cap.chilled) + (isStd(s) ? '・冷凍 ' + capTxt(s.cap.frozen!) : '')} />
              <Ro label="お届け（お届けスケジュール）" v={'冷蔵 ' + coldDl(s).length + '回（' + coldDl(s).map((d) => d.slot + ' ' + d.date).join('・') + '）' + (isStd(s) ? '／冷凍 ' + frozDl(s).length + '回' : '')} />
              <Ro label="オプション・備考" v={[s.opt, s.note].filter(Boolean).join(' ／ ') || '—'} />
              <Ro label="ご注文いただける商品" v={s.wh ? '出荷元の倉庫（' + s.wh.replace(/^WH\d+\s*/, '') + '）で扱う商品' : '—'} />
              <Ro label="拠点の設定" v={prefTxt(data.prefs[s.id], CATS, next)} cls="od-pref" />
            </div>
          )}
        </div>
        {/* 検索条件（折りたためる。入れた条件はそのまま効く） */}
        <div className={'od-fold od-searchbox' + (searchFold ? ' is-folded' : '')}>
          <div className="od-fold__h"><b>検索条件</b><FoldBtn open={!searchFold} label="検索条件" onToggle={() => toggle('search')} /></div>
          {searchFold ? null : (
            <SearchPanel onSearch={() => set((o) => ({ q: { ...o.qd }, pg: 1, sel: {} }))} onClear={() => set({ q: {}, qd: {}, pg: 1 })}
              more={[
                <Select key="st" placeholder="保存方法" value={(S.qd.st as string) || ''} options={[{ value: 'chilled', label: '冷蔵' }, { value: 'ambient', label: '常温' }].concat(isStd(s) ? [{ value: 'frozen', label: '冷凍' }] : [])} onChange={qd('st')} />,
                <Select key="tag" placeholder="商品タグ" value={(S.qd.tag as string) || ''} options={data.tags} onChange={qd('tag')} />,
                <div key="ns" style={{ display: 'flex', alignItems: 'center', minHeight: '2.857143rem' }}><Checkbox label="短消費期限なし" checked={!!S.qd.noShort} onChange={qd('noShort')} /></div>,
              ]}>
              <TextField key="kw" className="es-grow" icon="Search" placeholder="商品名、詳細情報、原材料、アレルゲン情報" value={(S.qd.kw as string) || ''} onChange={qd('kw')} />
              <Select key="cat" placeholder="カテゴリ" value={(S.qd.cat as string) || ''} options={CATS} onChange={qd('cat')} />
            </SearchPanel>
          )}
        </div>
        {sumBar}
        {tools}
        {content}
        </>}
      </Card>
    </div>,
  );
}
