'use client';

import { useParams, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { DEMO } from '@/lib/demo';
import { atOf, digits, dispClean, editUntil, mdW, nrAll, rcvd, resumeStep, STEPS, yen, yenNum, type Step } from '@/lib/driver/logic';
import { ALT_WASTE_REASON } from '@/lib/driver/seed';
import type { DeliveryView, Flow, PointView } from '@/lib/driver/types';
import { useQuery } from '@/lib/ops/core/client';
import { nowStamp, today } from '@/lib/supplier/dates';
import EtaCard from '../../_ui/EtaCard';
import { Icon } from '../../_ui/Icon';
import { useCommit, useDraft, useDriver, useDriverSignedIn } from '../../_ui/DriverProvider';
import {
  addPhotos, AckModal, Banner, Cb, Chk, DCard, Docs, Drop, EarlyModal, Help, IMG, Info, Loading, Modal, NotFound, NrFoot, Stepper, Steps, TopBar, TrBox, useNav, useRun,
} from '../../_ui/parts';
import { driverApi, useDay } from '../../_ui/useDay';

export default function Page() {
  return <Suspense><DriverEs /></Suspense>;
}

type Tab = 'base' | 'park' | 'disp';
type Ui = { q: string; only: boolean; dq: string; donly: boolean; parkEdit: boolean };
const UI0: Ui = { q: '', only: false, dq: '', donly: false, parkEdit: false };

/**
 * ES配送便（元の V.es・DA_ESDL_000〜005）。?tab＝基本情報・駐車報告・陳列情報、?step＝① 陳列前（s1）・② 在庫/廃棄（s2）・
 * バーコードスキャン（scan）・③ 陳列（s3）・④ 陳列後（s4）・⑤ 集金登録（s5）。
 * 途中の内容は画面を移っても残し（drafts）、ステップを進めたときにサーバーにも保存する。完了後は7日間、各ステップを修正できる
 */
function DriverEs() {
  const { id } = useParams<{ id: string }>();
  const no = decodeURIComponent(id);
  const sp = useSearchParams();
  const step = (STEPS as string[]).includes(sp.get('step') ?? '') ? (sp.get('step') as Step) : null;
  const tab = (['park', 'disp'].includes(sp.get('tab') ?? '') ? sp.get('tab') : 'base') as Tab;
  const { staff } = useDriverSignedIn();
  const { data, ptOf } = useDay();
  const saved = useQuery(driverApi(), 'flow', { staff, no });
  const [draft, setFlow] = useDraft<Flow | null>('flow.' + no, null);
  const [edit, setEdit] = useDraft('edit.' + no, false);
  const [ui, setUi] = useDraft<Ui>('esui.' + no, UI0);
  const title = step ? ({ s1: '陳列前', s2: '在庫/廃棄', scan: '在庫/廃棄', s3: '陳列', s4: '陳列後', s5: '完了' } as const)[step] : 'ES配送便';
  if (!data || saved.data === undefined) return <><TopBar title={title} /><Loading /></>;
  const d = data.dels.find((x) => x.no === no && x.type === 'es');
  if (!d) return <><TopBar title={title} trouble={false} /><NotFound text={`配送 ${no}（ES配送便）は今日の担当にありません。`} /></>;
  const f = draft ?? saved.data;
  const p: Props = { d, pt: ptOf(d.pt), f, setF: setFlow, edit, setEdit, ui, setUi, own: data.me.own };
  if (step === 's1') return <S1 {...p} />;
  if (step === 's2') return <S2 {...p} />;
  if (step === 'scan') return <Scan {...p} />;
  if (step === 's3') return <S3 {...p} />;
  if (step === 's4') return <S4 {...p} />;
  if (step === 's5') return <S5 {...p} />;
  return <Detail {...p} tab={tab} />;
}

type Props = {
  d: DeliveryView; pt: PointView | undefined; f: Flow; setF: (f: Flow) => void; edit: boolean; setEdit: (v: boolean) => void;
  ui: Ui; setUi: (u: Ui) => void; own: boolean;
};

/** ステップの移動・保存（元の go・gostep・editsave など） */
function useFlowNav(p: Props) {
  const nav = useNav();
  const { staff, offline, clearDrafts } = useDriverSignedIn();
  const commit = useCommit();
  const [busy, run] = useRun();
  const base = `/driver/es/${encodeURIComponent(p.d.no)}`;
  const api = driverApi();
  return {
    nav, busy, run, base,
    /** 次のステップへ（内容をサーバーにも保存）。replace＝元の gostep */
    to: (s: Step, f: Flow = p.f, replace = false) => run(async () => {
      p.setF(f);
      if (!p.edit && p.d.status !== '配送完了') await api.action('saveFlow', { staff, no: p.d.no, flow: f });
      const href = `${base}?step=${s}`;
      if (replace) nav.router.replace(href); else nav.router.push(href);
    }),
    /** 完了後の修正を保存（元の editsave） */
    saveEdit: () => run(async () => {
      const r = await api.action('saveFlowEdit', { staff, no: p.d.no, flow: p.f, offline });
      p.setEdit(false); clearDrafts('flow.' + p.d.no);
      nav.router.replace(`${base}?tab=disp`);
      commit(r);
    }),
    /** 修正をやめる（元の editcancel。入れた内容は捨ててサーバーの内容に戻す） */
    cancelEdit: () => { p.setEdit(false); clearDrafts('flow.' + p.d.no); nav.router.replace(`${base}?tab=disp`); },
    api, staff, offline, commit, clearDrafts,
  };
}

/** 完了後の修正中の注記・ステップの帯の位置（元の editNote・stepIdx） */
const EditNote = ({ edit }: { edit: boolean }) => (edit ? <div className="note2"><Icon name="edit" s />完了後の修正中です（{editUntil(today())} まで）。</div> : null);
const stepIdx = (edit: boolean, i: number) => (edit ? 5 : i);

/** 下のボタン（元の stepFoot。修正中は キャンセル・修正を保存） */
function Foot({ p, fn, back, next, enabled, label = '続ける' }: { p: Props; fn: ReturnType<typeof useFlowNav>; back?: () => void; next: () => void; enabled: boolean; label?: string }) {
  if (p.edit) {
    return <div className="foot"><button type="button" className="btn sec" onClick={fn.cancelEdit}>キャンセル</button><button type="button" className="btn pri" disabled={!enabled || fn.busy} onClick={fn.saveEdit}>修正を保存</button></div>;
  }
  return <div className="foot">{back && <button type="button" className="btn sec" onClick={back}>戻る</button>}<button type="button" className="btn pri" disabled={!enabled || fn.busy} onClick={next}>{label}</button></div>;
}

function StockTable({ f }: { f: Flow }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table className="tbl"><tbody>
        <tr><th /><th>商品名</th><th style={{ textAlign: 'center' }}>廃棄数(△)</th><th style={{ textAlign: 'center' }}>実在庫</th></tr>
        {f.stock.map((r, i) => <tr key={i}><td>{i + 1}</td><td>{r.n}</td><td className="num">{r.dc}</td><td className="num">{r.ac}</td></tr>)}
      </tbody></table>
    </div>
  );
}
function DispTable({ f }: { f: Flow }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table className="tbl"><tbody>
        <tr><th>商品名</th><th style={{ textAlign: 'center' }}>予定数</th><th style={{ textAlign: 'center' }}>実際数</th><th style={{ textAlign: 'center' }}>差異</th></tr>
        {f.disp.map((r, i) => <tr key={i}><td>{r.n}</td><td className="num">{r.pl}</td><td className="num">{r.ac}</td><td className={`num ${r.ac !== r.pl ? 'diff' : ''}`}>{r.ac - r.pl}</td></tr>)}
      </tbody></table>
    </div>
  );
}
const Thumbs = ({ arr }: { arr: string[] }) => <div className="thumbs">{arr.map((u, i) => <div key={i} style={{ backgroundImage: `url(${u})` }} />)}</div>;

/* ---------- 詳細（基本情報・駐車報告・陳列情報） ---------- */

function Detail(p: Props & { tab: Tab }) {
  const { d, f, tab } = p;
  const fn = useFlowNav(p);
  const { toast, openModal } = useDriver();
  const done = d.status === '配送完了';
  const setTab = (t: Tab) => fn.nav.router.replace(`${fn.base}${t === 'base' ? '' : `?tab=${t}`}`, { scroll: false });
  let body;
  if (tab === 'base') {
    body = (
      <div className="cols">
        <div><Info d={d} /><Docs docs={d.docs} own={p.own} />{!done && <EtaCard d={d} />}</div>
        <div>
          <div className="h3">荷物情報</div>
          <div className="pk">
            <div className="hd"><span><Icon name="box" s /> <b>{d.boxes}</b> 箱</span><span><Icon name="fridge" s /> <b>{d.fr ?? '—'}</b> 品</span><span><Icon name="snow" s /> <b>{d.fz ?? '—'}</b> 品</span></div>
            {d.inv.map((i, k) => {
              const ok = rcvd(p.pt, d, i.no);
              return <div key={i.no} className={`inv ${ok ? '' : 'nr'}`}><span style={{ width: '1rem' }}>{k + 1}</span><span className="no"><Icon name="box" s />{i.no}{!ok && <> <span className="nrtag">未受取</span></>}</span></div>;
            })}
          </div>
        </div>
      </div>
    );
  } else if (tab === 'park') {
    const pk = f.park, ed = p.ui.parkEdit || !done;
    const setPk = (x: Partial<Flow['park']>) => p.setF({ ...f, park: { ...pk, ...x } });
    body = (
      <div style={{ background: '#fff', border: '1px solid #e6e9ee', borderRadius: 10, padding: '0.857143rem' }} className="stack">
        <div className="bar-h" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          駐車報告{done && !p.ui.parkEdit && <button type="button" className="scanbtn" style={{ width: '2.571429rem', height: '2.571429rem', boxShadow: 'none' }} aria-label="編集" onClick={() => p.setUi({ ...p.ui, parkEdit: true })}><Icon name="edit" /></button>}
        </div>
        <div>レシート画像（必須）</div>
        {pk.rc ? (
          <div className="thumbs"><div style={{ backgroundImage: `url(${pk.rc})` }}>{ed && <button type="button" aria-label="削除" onClick={() => setPk({ rc: null })}><Icon name="x" s /></button>}</div></div>
        ) : (
          <div className="money ro" style={{ justifyContent: 'space-between' }}>
            <span>領収書をアップロード</span>
            {ed && (
              <label style={{ cursor: 'pointer', background: '#6b7280', color: '#fff', borderRadius: 4, padding: '0.214286rem', display: 'grid' }} aria-label="領収書をアップロード">
                <Icon name="upload" />
                <input type="file" accept="image/*" hidden onChange={(e) => { const file = e.target.files?.[0]; if (!file) return; const r = new FileReader(); r.onload = () => setPk({ rc: String(r.result) }); r.readAsDataURL(file); e.target.value = ''; }} />
              </label>
            )}
          </div>
        )}
        <div>駐車料金を入力してください（必須）</div>
        <div className={`money ${ed ? '' : 'ro'}`}><input inputMode="numeric" aria-label="駐車料金（税込）" value={pk.fee} placeholder="0" disabled={!ed} onChange={(e) => setPk({ fee: digits(e.target.value) })} /><span>円</span></div>
        {ed && (
          <button type="button" className="btn pri" style={{ height: '3.142857rem', fontSize: '1.071429rem' }} disabled={fn.busy} onClick={() => fn.run(async () => {
            const r = await fn.api.action('savePark', { staff: fn.staff, no: d.no, flow: f, offline: fn.offline });
            p.setUi({ ...p.ui, parkEdit: false });
            fn.commit(r);
          })}>保存</button>
        )}
        <div style={{ fontSize: '0.857143rem', color: '#6b7280' }}>レシートの写真と駐車料金の両方を入れます。納品日から7日まで直せます。駐車料金は集金とは別に所属先が精算します。</div>
      </div>
    );
  } else {
    const editStep = (s: Step) => { p.setEdit(true); p.setF(s === 's2' ? { ...f, stockDone: false } : f); fn.nav.router.push(`${fn.base}?step=${s}`); };
    body = (
      <>
        {d.tr.length ? (
          <div className="editbox"><Icon name="edit" s /><div><b>トラブルがあるため修正できません</b><span>直すときは運営に連絡してください（課題 4-4）。</span></div></div>
        ) : (
          <>
            <div className="editbox"><Icon name="edit" s /><div><b>{editUntil(today())} まで修正できます</b><span>検品（陳列）の数も直せます。修正内容は運営に通知されます。</span></div></div>
            <div className="editbtns">{([['s1', '① 陳列前写真'], ['s2', '② 在庫/廃棄'], ['s3', '③ 陳列'], ['s4', '④ 陳列後写真'], ...(f.plan > 0 ? [['s5', '⑤ 集金']] : [])] as [Step, string][]).map(([s, l]) => <button type="button" key={s} onClick={() => editStep(s)}>{l}</button>)}</div>
          </>
        )}
        <div className="bar-h">陳列前写真</div><Thumbs arr={f.before.length ? f.before : [IMG('photo')]} />
        <div className="bar-h">廃棄登録と実在庫</div><StockTable f={f} />
        <div className="bar-h">陳列</div><DispTable f={f} />
        <div className="bar-h">陳列後写真</div><Thumbs arr={f.after.length ? f.after : [IMG('photo2')]} />
        {f.plan > 0 && (
          <>
            <div className="bar-h">集金</div>
            <div className="info">
              <div className="r" style={{ gridTemplateColumns: '1fr auto' }}><span className="k">集金予定額</span><span>{yen(f.plan)}</span></div>
              <div className="r" style={{ gridTemplateColumns: '1fr auto' }}><span className="k">実集金額</span><span>{f.cash === '' ? '未入力' : yen(f.cash)}</span></div>
            </div>
          </>
        )}
      </>
    );
  }
  const start = () => {
    if (nrAll(p.pt, d)) return toast('荷物を受け取っていません');
    if (d.later) return toast(`この配送の納品日は ${d.later} です。今日は受取だけです`);
    const go = (fl: Flow) => { p.setEdit(false); fn.nav.router.push(`${fn.base}?step=${resumeStep(fl)}`); };
    /* 納品日より前は、確認して理由を入れたときだけ（課題 4-1） */
    if (d.early && !f.early) return openModal(<EarlyModal date={d.early} onOk={(why) => { const nf = { ...f, early: why }; p.setF(nf); go(nf); }} />);
    go(f);
  };
  return (
    <>
      <TopBar title="ES配送便" trouble={'d:' + d.no} />
      {done && <Banner t="荷物の配送は完了しました。" s={d.doneAt ?? ''} o={d} />}
      <div className="scroll pad stack">
        <DCard d={d} date={mdW(today())} />
        <TrBox o={d} />
        <div className="segs">
          {([['base', '基本情報'], ['park', '駐車報告'], ['disp', '陳列情報']] as const).map(([k, l]) => (
            <button type="button" key={k} className={tab === k ? 'on' : ''} disabled={k === 'disp' && !done} onClick={() => setTab(k)}>{l}</button>
          ))}
        </div>
        {body}
      </div>
      {!done && (nrAll(p.pt, d) ? <NrFoot /> : <div className="foot"><button type="button" className="btn pri" onClick={start}>{f.step > 0 ? '陳列を再開する' : '陳列を開始する'}</button></div>)}
    </>
  );
}

/* ---------- ① 陳列前 ---------- */

function S1(p: Props) {
  const fn = useFlowNav(p);
  const { d, f } = p;
  return (
    <>
      <TopBar title="陳列前" trouble={'d:' + d.no} />
      <div className="scroll pad stack">
        <DCard d={d} date={mdW(today())} /><EditNote edit={p.edit} /><Steps cash={f.plan > 0} cur={stepIdx(p.edit, 0)} />
        <div className="bar-h">陳列前</div>
        <p className="hint" style={{ margin: 0 }}>冷蔵庫・ボックス内の陳列前写真をアップロードしてください。</p>
        <Drop photos={f.before} onAdd={(u) => p.setF({ ...f, before: addPhotos(f.before, u) })} onRemove={(i) => p.setF({ ...f, before: f.before.filter((_, k) => k !== i) })} />
        <Help />
      </div>
      <Foot p={p} fn={fn} back={() => fn.nav.back()} next={() => fn.to('s2', { ...f, step: Math.max(f.step, 2) })} enabled={f.before.length > 0} />
    </>
  );
}

/* ---------- ② 在庫/廃棄 ---------- */

function S2(p: Props) {
  const fn = useFlowNav(p);
  const { d, f, ui } = p;
  if (f.stockDone && !p.edit) {
    return (
      <>
        <TopBar title="在庫/廃棄" trouble={'d:' + d.no} />
        <Banner t="在庫/廃棄が成功しました。" s={f.stockAt ?? ''} />
        <div className="scroll pad stack"><DCard d={d} date={mdW(today())} /><Steps cash={f.plan > 0} cur={2} /><div className="bar-h">廃棄登録と実在庫の確認</div><StockTable f={f} /></div>
        <div className="foot">
          <button type="button" className="btn sec" onClick={() => p.setF({ ...f, stockDone: false })}>戻る</button>
          <button type="button" className="btn pri" disabled={fn.busy} onClick={() => fn.to('s3', { ...f, step: Math.max(f.step, 3) }, true)}>続ける</button>
        </div>
      </>
    );
  }
  const q = ui.q.trim(), all = f.stock.every((r) => r.ck);
  const rows = f.stock.map((r, i) => ({ r, i })).filter(({ r }) => (!q || r.n.includes(q)) && (!ui.only || !r.ck));
  const setRow = (i: number, x: Partial<Flow['stock'][number]>) => p.setF({ ...f, stock: f.stock.map((r, k) => (k === i ? { ...r, ...x } : r)) });
  return (
    <>
      <TopBar title="在庫/廃棄" trouble={'d:' + d.no} />
      <div className="scroll pad stack">
        <DCard d={d} date={mdW(today())} /><EditNote edit={p.edit} /><Steps cash={f.plan > 0} cur={stepIdx(p.edit, 1)} />
        <div className="bar-h">廃棄登録と実在庫の確認</div>
        <p className="hint" style={{ margin: 0 }}>廃棄数を確認し、実在庫をチェックしてください。<br />在庫数が一致しない場合は、実在庫数に修正してからチェックしてください。<br />※検索または商品のバーコードスキャンからも廃棄登録できます。</p>
        <div style={{ display: 'flex', gap: '0.857143rem' }}>
          <div className="search" style={{ flex: 1 }}><input placeholder="名前またはコードで商品を検索" aria-label="商品を検索" value={ui.q} onChange={(e) => p.setUi({ ...ui, q: e.target.value })} /><Icon name="search" /></div>
          <button type="button" className="scanbtn" aria-label="バーコードスキャン" onClick={() => fn.nav.router.replace(`${fn.base}?step=scan`)}><Icon name="scan" /></button>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.928571rem' }} className="muted">
          <span>※次回納品日 10/16（金）</span><Chk on={ui.only} label="未確認のみ表示" onClick={() => p.setUi({ ...ui, only: !ui.only })} />
        </div>
        <div style={{ overflowX: 'auto', margin: '0 -1.142857rem' }}>
          <table className="tbl"><tbody>
            <tr><th>確認</th><th>理論在庫</th><th>廃棄数(△)</th><th>実在庫(廃棄後)</th></tr>
            {rows.map(({ r, i }) => [
              <tr key={i + 'a'}>
                <td rowSpan={2} style={{ width: '3.142857rem', textAlign: 'center' }}><Cb on={r.ck} onClick={() => setRow(i, { ck: !r.ck })} /></td>
                <td colSpan={3} style={{ border: 0, paddingBottom: 0 }} className="pname">{r.n}{r.alt && <><br /><small style={{ color: '#b45309', fontWeight: 400 }}>理由：{ALT_WASTE_REASON}・管理ロスにしない</small></>}</td>
              </tr>,
              <tr key={i + 'b'}>
                <td><Stepper val={r.th} ro /></td>
                <td><Stepper val={r.dc} onStep={(dv) => { const dc = Math.max(0, Math.min(r.th, r.dc + dv)); setRow(i, { dc, ac: r.th - dc }); }} /></td>
                <td><Stepper val={r.ac} onStep={(dv) => setRow(i, { ac: Math.max(0, r.ac + dv) })} /></td>
              </tr>,
            ])}
          </tbody></table>
        </div>
        {!rows.length && <div className="empty">該当する商品はありません。</div>}
      </div>
      {p.edit ? <Foot p={p} fn={fn} next={() => {}} enabled={all} />
        : <Foot p={p} fn={fn} back={() => fn.nav.router.replace(`${fn.base}?step=s1`)} label="確認" enabled={all}
          next={() => fn.run(async () => {
            const nf = { ...f, stockDone: true, stockAt: stockStamp() };
            p.setF(nf);
            await fn.api.action('saveFlow', { staff: fn.staff, no: d.no, flow: nf });
          })} />}
    </>
  );
}
/** 在庫/廃棄の確認の時刻（元の now()） */
const stockStamp = () => atOf(nowStamp());

/* ---------- バーコードスキャン ---------- */

function Scan(p: Props) {
  const fn = useFlowNav(p);
  const { toast } = useDriver();
  const { d, f } = p;
  /* カメラ・バーコードはまだつないでいない。画像を押すと読み取りを再現する（元のデモと同じ） */
  const scan = () => {
    const i = Math.floor(Math.random() * f.stock.length), row = f.stock[i];
    const dc = row.dc < row.th ? row.dc + 1 : row.dc;
    p.setF({ ...f, stock: f.stock.map((r, k) => (k === i ? { ...r, dc, ac: r.th - dc } : r)) });
    fn.nav.router.replace(`${fn.base}?step=s2`);
    toast(`「${row.n}」を読み取り、廃棄数を1追加しました`);
  };
  return (
    <>
      <TopBar title="在庫/廃棄" trouble={'d:' + d.no} />
      <div className="scroll pad stack">
        <DCard d={d} date={mdW(today())} />
        <div className="bar-h">廃棄登録と実在庫の確認</div>
        <p className="hint" style={{ margin: 0 }}>商品のバーコードをスキャンして廃棄登録できます。<br />※一覧に表示されていない商品もスキャン可能です。</p>
        <button type="button" className="cam" aria-label={DEMO ? 'スキャン（デモ）' : 'スキャン'} onClick={scan} />
        <p className="center muted" style={{ fontSize: '0.857143rem', margin: 0 }}>{DEMO ? 'デモ：画像をタップすると読み取りを再現します' : 'カメラはまだつないでいません。画像をタップすると読み取りを再現します'}</p>
      </div>
      <div className="foot"><button type="button" className="btn sec" onClick={() => fn.nav.router.replace(`${fn.base}?step=s2`)}>一覧に戻る</button></div>
    </>
  );
}

/* ---------- ③ 陳列 ---------- */

function S3(p: Props) {
  const fn = useFlowNav(p);
  const { toast, openModal } = useDriver();
  const { d, f, ui } = p;
  const q = ui.dq.trim();
  const rows = f.disp.map((r, i) => ({ r, i })).filter(({ r }) => (!q || r.n.includes(q)) && (!ui.donly || !r.ck));
  const any = f.disp.some((r) => r.ck);
  const setRow = (i: number, x: Partial<Flow['disp'][number]>) => p.setF({ ...f, disp: f.disp.map((r, k) => (k === i ? { ...r, ...x } : r)) });
  const finish = (ack: boolean) => fn.api.action('finishDisp', { staff: fn.staff, no: d.no, flow: f, ack, offline: fn.offline }).then((r) => {
    p.setF(r.flow);
    fn.nav.router.replace(`${fn.base}?step=s4`);
    if (r.unsent) fn.commit(r); else toast(r.msg);
  });
  const ok = () => {
    if (dispClean(f)) return fn.run(() => finish(false));
    openModal(<AckModal title="荷物の陳列は完了しましたか？" text={<>一部の荷物が未確認の状態、<br />または差異が発生しております。<br />内容はトラブル（商品不足・誤配送）として運営に自動で報告されます。</>}
      ack="ESキッチンへ連絡済みです。" okLabel="報告完了" onOk={() => finish(true)} />);
  };
  const dscan = () => {
    const i = Math.max(0, f.disp.findIndex((r) => !r.ck));
    setRow(i, { ck: true });
    toast(`「${f.disp[i].n}」を読み取り、確認済みにしました`);
  };
  return (
    <>
      <TopBar title="陳列" trouble={'d:' + d.no} />
      {f.dispDone && !p.edit && <Banner t="商品の陳列が完了しました。" s={f.dispAt ?? ''} />}
      <div className="scroll pad stack">
        <DCard d={d} date={mdW(today())} /><EditNote edit={p.edit} /><Steps cash={f.plan > 0} cur={stepIdx(p.edit, 2)} />
        <div className="bar-h">検品・陳列</div>
        <div style={{ display: 'flex', gap: '0.857143rem' }}>
          <div className="search" style={{ flex: 1 }}><input placeholder="名前またはコードで商品を検索" aria-label="商品を検索" value={ui.dq} onChange={(e) => p.setUi({ ...ui, dq: e.target.value })} /><Icon name="search" /></div>
          <button type="button" className="scanbtn" aria-label="バーコードスキャン" onClick={dscan}><Icon name="scan" /></button>
        </div>
        <div style={{ textAlign: 'right' }}><Chk on={ui.donly} label="未確認のみ表示" style={{ marginLeft: 'auto' }} onClick={() => p.setUi({ ...ui, donly: !ui.donly })} /></div>
        <div style={{ overflowX: 'auto', margin: '0 -1.142857rem' }}>
          <table className="tbl"><tbody>
            <tr><th>確認</th><th>商品数</th><th>実際数</th></tr>
            {rows.map(({ r, i }) => (
              <tr key={i}>
                <td style={{ width: '3.142857rem', textAlign: 'center' }}><Cb on={r.ck} onClick={() => setRow(i, { ck: !r.ck })} /></td>
                <td><div className="pname">{r.n}</div><div className="sub2">予定数：{r.pl}個{r.ac !== r.pl && <> <span className="diff">差異 {r.ac - r.pl}</span></>}</div></td>
                <td><Stepper val={r.ac} onStep={(dv) => setRow(i, { ac: Math.max(0, r.ac + dv) })} /></td>
              </tr>
            ))}
          </tbody></table>
        </div>
        <p className="hint muted" style={{ margin: 0 }}>※予定数と違う場合や未確認の商品がある場合は、自動でトラブル（商品不足・誤配送）として運営に報告されます。</p>
      </div>
      {p.edit ? <Foot p={p} fn={fn} next={() => {}} enabled />
        : <Foot p={p} fn={fn} back={() => fn.nav.router.replace(`${fn.base}?step=s2`)} next={ok} enabled={any} label="確認" />}
    </>
  );
}

/* ---------- ④ 陳列後 ---------- */

function S4(p: Props) {
  const fn = useFlowNav(p);
  const { d, f } = p;
  return (
    <>
      <TopBar title="陳列後" trouble={'d:' + d.no} />
      <div className="scroll pad stack">
        <DCard d={d} date={mdW(today())} /><EditNote edit={p.edit} /><Steps cash={f.plan > 0} cur={stepIdx(p.edit, 3)} />
        <div className="bar-h">アップロード（陳列後）</div>
        <Drop photos={f.after} onAdd={(u) => p.setF({ ...f, after: addPhotos(f.after, u) })} onRemove={(i) => p.setF({ ...f, after: f.after.filter((_, k) => k !== i) })} />
        <Help />
      </div>
      <Foot p={p} fn={fn} back={() => fn.nav.router.replace(`${fn.base}?step=s3`)} next={() => fn.to('s5', { ...f, step: Math.max(f.step, 5) }, true)} enabled={f.after.length > 0} />
    </>
  );
}

/* ---------- ⑤ 集金登録・完了 ---------- */

function S5(p: Props) {
  const fn = useFlowNav(p);
  const { openModal, closeModal } = useDriver();
  const { d, f } = p;
  /** 配送完了の確認（RV-DRIVER-20261002 D-f。閉じる・二度押しで二重に報告しない） */
  const confirm = () => {
    const Done = () => {
      const [busy, run] = useRun();
      return (
        <Modal onBack={closeModal}>
          <img src={IMG('boxes')} alt="" />
          <h3>配送を完了しますか？</h3>
          <p>完了すると、運営に配送完了を報告します。<br />{editUntil(today())} まで内容を修正できます。</p>
          <button type="button" className="btn pri" disabled={busy} onClick={() => run(async () => {
            const r = await fn.api.action('completeEs', { staff: fn.staff, no: d.no, flow: f, offline: fn.offline });
            closeModal();
            fn.clearDrafts('flow.' + d.no);
            p.setEdit(false);
            fn.nav.router.replace(fn.base);
            fn.commit(r);
          })}>完了する</button>
          <button type="button" className="btn sec" onClick={closeModal}>キャンセル</button>
        </Modal>
      );
    };
    openModal(<Done />);
  };
  return (
    <>
      <TopBar title="完了" trouble={'d:' + d.no} />
      <div className="scroll pad stack">
        <DCard d={d} date={mdW(today())} /><EditNote edit={p.edit} /><Steps cash={f.plan > 0} cur={stepIdx(p.edit, 4)} />
        {f.plan ? (
          <>
            <div className="h3" style={{ fontSize: '1.071429rem' }}>集金予定額</div>
            <div className="money ro"><input value={yenNum(f.plan)} disabled aria-label="集金予定額" /><span>円</span></div>
            <div className="h3" style={{ fontSize: '1.071429rem' }}>実集金額 <span className="muted" style={{ fontSize: '0.857143rem' }}>（集金できなかったときは 0）</span></div>
            <div className="money"><input inputMode="numeric" placeholder="0" aria-label="実集金額（税込）" value={f.cash} onChange={(e) => p.setF({ ...f, cash: digits(e.target.value) })} /><span>円</span></div>
            {f.cash !== '' && Number(f.cash) !== f.plan && <div className="err">集金予定額と実集金額が一致しません。差額は後日の精算で調整されます。</div>}
          </>
        ) : <div className="info muted" style={{ padding: '1rem' }}>この納品先は集金がありません。「完了」を押して報告を終えてください。</div>}
      </div>
      {p.edit ? <Foot p={p} fn={fn} next={() => {}} enabled />
        : <Foot p={p} fn={fn} back={() => fn.nav.router.replace(`${fn.base}?step=s4`)} next={confirm} enabled label="完了" />}
    </>
  );
}
