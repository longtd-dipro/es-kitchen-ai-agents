'use client';

import { useOpsLeaveGuard } from '@/app/ops/_ui/leaveGuard';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { AP_REJECT_REASONS } from '@/lib/ops/applications/constants';
import {
  activeTargets, allConfirmed, capture, cellText, confirmedCount, draftForSave, fieldDisabled, firstOpen, fid, fieldValue, initState, MAPPED_KEYS, prepareCfg, routeBadKeys,
  routesFromCfg, routeMissing, targetReady, targetSaved, tok, type IntakeState, type NewRow,
} from '@/lib/ops/applications/intake';
import type { Block, IntakeCfg, IntakeRow } from '@/lib/ops/applications/types';
import { useOps } from '../../../_ui/OpsProvider';
import { useCanAct } from '../../../_ui/perm';
import { api, setFilter } from '../api';
import { Bg, Badge, Btn, Check, Dialog, DsModal, Field, Html, Inline, PageHead, Ro, Select, Table, Tabs, Textarea, esc } from '../ds';
import { Blocks, ilBadKeys, RouteACard, routeABadKeys, TargetMatrix } from './blocks';
import { EngineContext, type Engine } from './engine';
import { fmtDate, fmtDatesIn, fmtDateTime } from '@/lib/format/date';
import { pd } from '@/lib/ops/applications/logic';
import { today } from '@/lib/supplier/dates';
import { SetupPanel } from '../lifecycleBlocks';

/*
 * 受付画面（新規契約の申込：本導入の新規申込／お試しキャンペーン／お試し→本導入の切替）。
 * 元：11_運営_申請受付.html の engine.js（DEMO.go）と受付3画面の CFG。
 *   申込内容確認（タブ：申請内容／配送の設定／開始スケジュール／共通情報）→ 仮登録（アカウント発行）
 *   → 詳細情報設定（拠点ごと・タブごとに 参照 → 編集 → 保存）→ 拠点ごとに本登録
 * 仮登録で申込の状態は「契約設定中」、全拠点を本登録すると「完了」になる（RV3-OPS-20261002 #2）。
 * 本登録は拠点ごとの『この拠点を本登録』1つだけ（台帳 運営A 2026-10-06 (1)）：押すと共通データの拠点・親契約・法人の状態が変わる。画面だけで変わる『確定』は無い。
 * 画面の状態（ヘッダの状態・拠点の本登録済み）は共通データの申込から作る。詳細情報設定の入力は『保存』でサーバーに残り、再読込しても戻らない。
 */
type ModalState =
  | null
  | { k: 'B' } | { k: 'C' } | { k: 'E' } | { k: 'F1'; i: number; acctNow: boolean; note?: string } | { k: 'F' }
  | { k: 'X'; go: () => void; cl?: string } | { k: 'RJ' } | { k: 'WD' };

export default function IntakeScreen({ row, cfg: src }: { row: IntakeRow; cfg: IntakeCfg }) {
  const router = useRouter();
  const { toast, toastError } = useOps();
  const canAct = useCanAct();
  /* 受付の入力（編集・保存・アカウント発行）は契約申請の編集ができる人だけ */
  const cfg = useMemo(() => prepareCfg(src), [src]);
  /* 完了した申込は参照のみ（台帳 運営A Q1） */
  const canEdit = canAct(api, 'intakeStatus') && !cfg.done;
  const sRef = useRef<IntakeState | null>(null);
  if (!sRef.current) sRef.current = initState(cfg);
  const s = sRef.current;
  /* 拠点の「本登録済み」は共通データから（画面の中だけの状態にしない） */
  cfg.targets.forEach((t, i) => { s.confirmed[i] = !!t.reg?.done; });
  const [, setTick] = useState(0);
  const redraw = () => setTick((t) => t + 1);
  const [modal, setModal] = useState<ModalState>(null);
  const [nf, setNf] = useState<NewRow | null>(null);
  const [nfBad, setNfBad] = useState<string[]>([]);
  const scrollBad = useRef(false);

  const update = (fn: (x: IntakeState) => void) => { fn(sRef.current!); redraw(); };

  /* ---------- 編集（参照 → 編集 → 保存／キャンセル。DS の CrudPattern） ---------- */
  const startEdit = (kind: 'A' | 'D') => { s.edit = kind; s.form = null; s.snap = capture(s); setNf(null); };
  const endEdit = (discard: boolean) => {
    if (discard && s.snap) { const o = JSON.parse(s.snap); s.val = o.v; s.route = o.r; s.init = o.i; s.eb = o.e; s.hide = o.h; }
    s.edit = null; s.snap = null; s.form = null; s.bad = []; setNf(null);
  };
  const isDirty = () => !!(s.edit && s.snap && capture(s) !== s.snap);
  /** 必須でまだ保存していないタブ・未入力の配送の設定は、開いたときから編集で始める */
  const autoEdit = () => {
    if (s.phase === 'D') {
      const tb = cfg.targets[s.target]?.tabs[s.tab];
      if (tb && tb.req && !tb.auto && !s.saved[s.target][s.tab] && !s.confirmed[s.target]) startEdit('D');
    } else if (s.atab === 'route' && routeMissing(cfg, s)) startEdit('A');
  };
  /** 編集中に変更があるまま移ろうとしたら、破棄の確認を出す */
  const guard = (go: () => void, cl?: string) => {
    if (!s.edit) { go(); return; }
    if (!isDirty()) { endEdit(false); go(); return; }
    setModal({ k: 'X', go, cl });
  };
  const roD = () => s.phase === 'D' && s.edit !== 'D';

  /* 仮登録のあと（契約設定中・完了）の申込は詳細情報設定から開く（RV3-OPS-20261002 #2・28-146。再読込しても受付中に戻さない） */
  useEffect(() => {
    if (row.st !== '受付中') toD();
    else autoEdit();
    redraw();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  /* サーバーの内容を読み直したら、共通データへ入れた欄・配送ルートは共通データのものに合わせる（編集中でなければ） */
  useEffect(() => {
    if (s.edit) return;
    Object.keys(s.val).forEach((id) => { if (MAPPED_KEYS.has(id.split('_').slice(3).join('_'))) delete s.val[id]; });
    s.route = routesFromCfg(cfg, s.route);
    redraw();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cfg]);
  /* 未入力の欄を出したら、そこまでスクロールする */
  useEffect(() => {
    if (!scrollBad.current) return;
    scrollBad.current = false;
    document.querySelector('.ops-applications #app .bad')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
  useOpsLeaveGuard(isDirty);
  /* 編集中に変更があるまま、ページを離れようとしたら止める */
  useEffect(() => {
    const h = (e: BeforeUnloadEvent) => { if (isDirty()) e.preventDefault(); };
    window.addEventListener('beforeunload', h);
    return () => window.removeEventListener('beforeunload', h);
  });

  const E: Engine = { cfg, s, update, toast, nf, setNf, nfBad, setNfBad, roD, startEdit, guard, canEdit };

  /* ---------- 移動 ---------- */
  const scrollTop = () => window.scrollTo(0, 0);
  const atab = (k: string) => { if (k === s.atab) return; guard(() => { s.atab = k; autoEdit(); redraw(); scrollTop(); }); };
  const toD = () => {
    setModal(null); endEdit(false);
    s.target = cfg.targets.findIndex((t) => t.active !== false);
    s.tab = firstOpen(cfg, s, s.target); s.phase = 'D'; s.saveBad = null;
    autoEdit(); redraw();
  };
  const pick = (i: number) => {
    if (cfg.targets[i].active === false || i === s.target) return;
    guard(() => { s.target = i; s.tab = firstOpen(cfg, s, i); s.saveBad = null; autoEdit(); redraw(); });
  };
  const tabTo = (j: number) => { if (j === s.tab) return; guard(() => { s.tab = j; s.saveBad = null; autoEdit(); redraw(); scrollTop(); }); };
  const gList = () => guard(() => router.push('/ops/applications'));

  /* ---------- 保存とバリデーション ---------- */
  /** 共通データへ入れる内容（拠点の欄・担当者の表・設備の表）と、画面だけの入力をサーバーへ保存する（J1-6）。保存できたら true */
  const persist = async (ti?: number, tb?: number) => {
    try {
      let scope;
      if (ti !== undefined && tb !== undefined) {
        const tab = cfg.targets[ti].tabs[tb], vals: Record<string, string> = {};
        const tbl = { corpStaff: undefined as string[][] | undefined, staff: undefined as string[][] | undefined, eq: undefined as string[][] | undefined };
        tab.blocks.forEach((b) => {
          if (b.b === 'fields') b.items.forEach((f) => { if (f.type !== 'ro' && !f.lock) vals[f.key] = fieldValue(s, fid(ti, tb, f.key), f); });
          if (b.b === 'table' && b._eid) {
            const e = cfg.tables[b._eid], rows = (s.eb[e.eid] || []).map((r) => (Array.isArray(r) ? r : r.cells).map(cellText));
            if (e.kind === 'staff') { if (tab.key === 'corp') tbl.corpStaff = rows; else tbl.staff = rows; }
            if (e.kind === 'eq') tbl.eq = rows;
          }
        });
        scope = { ti, tab: tab.key, vals, ...tbl };
      }
      await api.action('saveDetail', { no: row.no, draft: draftForSave(cfg, s), scope });
      return true;
    } catch (e) { toastError(e); return false; }
  };
  const save = async () => {
    if (s.confirmed[s.target]) { toast('この拠点は本登録済みのため編集できません'); return; }
    const t = cfg.targets[s.target], tb = t.tabs[s.tab], bad: string[] = [];
    tb.blocks.forEach((b) => {
      if (b.b !== 'fields') return;
      b.items.forEach((f) => {
        if (!f.req || f.type === 'ro' || f.lock) return;
        const id = fid(s.target, s.tab, f.key);
        if ((f.dep || f.when) && fieldDisabled(s, tb, s.target, s.tab, f)) return;   /* 非活性の欄（請求先＝法人のときの請求条件など）は必須にしない */
        if (!fieldValue(s, id, f).trim()) bad.push('w_' + id);
      });
    });
    bad.push(...ilBadKeys(E, tb));
    if (tb.blocks.some((b) => b.b === 'routes')) bad.push(...routeBadKeys(cfg, s, s.target));
    if (bad.length) {
      s.bad = bad; s.saveBad = `${s.target}:${s.tab}`; scrollBad.current = true; redraw();
      toast(`入力内容に不足があります（${bad.length}件）`);
      return;
    }
    s.saved[s.target][s.tab] = { at: cfg.saveStamp };
    if (!(await persist(s.target, s.tab))) { s.saved[s.target][s.tab] = null; redraw(); return; }
    s.saveBad = null;
    endEdit(false); redraw();
    toast(`${t.name}／${tb.label} を保存しました`);
  };
  const cancelEdit = () => {
    if (isDirty()) { guard(() => redraw(), '破棄する'); return; }
    endEdit(false); redraw();
  };
  /** 申込内容確認の配送の設定（倉庫）を確かめる。そろっていれば編集中の内容はそのまま保存して進む */
  const routeAOK = () => {
    if (routeMissing(cfg, s) && (s.atab !== 'route' || s.edit !== 'A')) { s.atab = 'route'; if (s.edit !== 'A') startEdit('A'); }
    const bad = routeABadKeys(E);
    if (bad.length) { s.bad = bad; scrollBad.current = true; redraw(); toast(`ピッキング倉庫が未設定です（${bad.length}件）`); return false; }
    if (s.edit === 'A') endEdit(false);
    redraw();
    return true;
  };
  const rtSave = async () => {
    const bad = routeABadKeys(E);
    if (bad.length) { s.bad = bad; scrollBad.current = true; redraw(); toast(`ピッキング倉庫が未設定です（${bad.length}件）`); return; }
    if (!(await persist())) return;
    endEdit(false); redraw(); toast('配送の設定を保存しました');
  };

  /* ---------- 仮登録・本登録 ---------- */
  const openB = () => { if (s.phase === 'A' && !routeAOK()) return; setModal({ k: 'B' }); };
  const doB = async (acct: boolean) => {
    s.acct = acct || !!cfg.modalB.check?.fixed;
    /* 配送の設定を保存してから仮登録（申込内容の確認を完了 → 仮登録の順。RV3-OPS-20261002 #2） */
    if (!(await persist())) return;
    try { await api.action('intakeStatus', { no: row.no, st: '契約設定中', acct: s.acct }); } catch (e) { toastError(e); return; }
    setModal({ k: 'C' });
  };
  /** 拠点の本登録の確認を開く。必須の情報がそろい、必須のタブを保存した拠点だけ */
  const openE = (i = s.target) => {
    const t = cfg.targets[i];
    if (!t.reg || t.reg.done || t.reg.stage !== '仮登録') return;
    if (t.reg.missing.length) { toast(`本登録に必要な情報が足りません：${t.reg.missing.join('・')}`); return; }
    if (!targetReady(cfg, s, i)) { toast('必須のタブを保存してから本登録してください'); return; }
    setModal({ k: 'E' });
  };
  const confirmAt = (i: number) => guard(() => {
    if (i !== s.target) { s.target = i; s.tab = firstOpen(cfg, s, i); autoEdit(); redraw(); }
    openE(i);
  });
  /** 『この拠点を本登録』：共通データの 拠点・親契約・法人 の状態が変わる（保存される） */
  const doE = async () => {
    const i = s.target;
    try {
      const out = await api.action('register', { no: row.no, index: i });
      setModal({ k: 'F1', i, acctNow: false, note: out.note });
    } catch (e) { toastError(e); setModal(null); }
  };

  /* ---------- 見出し ---------- */
  /* ヘッダの状態は共通データの申込の状態（再読込しても同じ） */
  const st: { t: string; tone: 'warning' | 'success' | 'info' } = { t: row.st, tone: row.st === '完了' ? 'success' : row.st === '契約設定中' ? 'info' : 'warning' };
  const apDate = fmtDatesIn(cfg.apDate);
  const summary = cfg.summary || [];
  let acts: ReactNode = null;
  if (row.st === '完了') {
    acts = <Btn id="btnDone" onClick={() => setModal({ k: 'F' })}>申請完了の内容を確認</Btn>;
  } else if (s.phase === 'A') {
    /* 権限がなければ出さない。受付中の申込も運営が取り下げられる（お客様からのご連絡・台帳 運営A Q9） */
    acts = <>{canAct(api, 'intakeReject') && <Btn variant="outline" tone="negative" onClick={() => setModal({ k: 'RJ' })}>却下</Btn>}{canAct(api, 'intakeWithdraw') && <Btn variant="outline" tone="negative" onClick={() => setModal({ k: 'WD' })}>取り下げ</Btn>}{canAct(api, 'intakeStatus') && <Btn id="btnMain" onClick={openB}>{cfg.mainBtn}</Btn>}</>;
  } else {
    const tbx = cfg.targets[s.target]?.tabs[s.tab];
    acts = (
      <>
        {/* 仮登録のあとの却下・取り下げ（運営だけ：台帳 2026/10/03） */}
        {canAct(api, 'intakeReject') && <Btn variant="outline" tone="negative" onClick={() => setModal({ k: 'RJ' })}>却下</Btn>}
        {canAct(api, 'intakeWithdraw') && <Btn variant="outline" tone="negative" onClick={() => setModal({ k: 'WD' })}>取り下げ</Btn>}
        {canEdit && !s.confirmed[s.target] && tbx && !tbx.auto && (s.edit === 'D'
          ? <><Btn variant="outline" id="btnCancel" onClick={cancelEdit}>キャンセル</Btn><Btn id="btnSave" onClick={save}>保存</Btn></>
          : <Btn id="btnEdit" icon="PencilSimple" onClick={() => { startEdit('D'); redraw(); }}>編集</Btn>)}
      </>
    );
  }
  const head = (
    <div id="phead" className="phead">
      <PageHead crumb={[{ t: '契約申請管理', on: gList }, '申請詳細']} title="申請詳細" id={row.no} badge={<Badge tone={st.tone}>{st.t}</Badge>} actions={acts} />
    </div>
  );

  /* ---------- 申込内容確認（A） ---------- */
  const renderA = () => {
    const miss = routeMissing(cfg, s);
    let P: [string, string][] = [['info', '申請内容'], ['route', '配送の設定'], ['sched', '開始スケジュール'], ['common', '共通情報']];
    if (!(cfg.preBlocks || []).length) P = P.filter((x) => x[0] !== 'sched');
    const cur = P.some((x) => x[0] === s.atab) ? s.atab : 'info';
    const body = cur === 'info' ? (
      <>
        <div className="card"><h2>申請情報</h2><div className="pad"><div className="es-formgrid">
          <Ro label="申請日">{apDate}</Ro>
          {summary.map((x, k) => <Ro key={k} label={x.l} html={x.v} />)}
        </div></div></div>
        <div className="card acc"><h2>{cfg.mainHeading}</h2><div className="pad"><TargetMatrix /></div></div>
      </>
    ) : cur === 'route' ? <RouteACard onSave={rtSave} onCancel={cancelEdit} onEdit={canEdit ? () => { startEdit('A'); redraw(); } : undefined} />
      : cur === 'sched' ? <><DeadlineBand close={cfg.orderClose} />{cfg.late?.choose && <LateChoice no={row.no} late={cfg.late} canEdit={canEdit} />}<Blocks list={cfg.preBlocks || []} ctx={{ ti: 'p', tb: 'p' }} /></>
        : <CommonCard cfg={cfg} phase={s.phase} />;
    return (
      <div id="ascreen"><div className="cols"><div id="main" style={{ minWidth: 0 }}>
        <section className="es-card ptabs">
          <Tabs items={P.map(([k, l]) => ({ key: k, label: l, on: cur === k, onClick: () => atab(k), count: k === 'route' && miss ? '要入力' : null }))} />
        </section>
        {body}
      </div><aside id="side" className="side" /></div></div>
    );
  };

  /* ---------- 詳細情報設定（D） ---------- */
  const renderD = () => {
    const t = cfg.targets[s.target], tb = t.tabs[s.tab], sv = s.saved[s.target][s.tab];
    const lab = cfg.targets[0]?.applyLabel || '適用日';
    const meta = s.edit === 'D' ? '編集中' : s.confirmed[s.target] ? '本登録済'
      : sv ? (sv.pre ? '申込内容確認で確認済' : sv.auto ? '自動保存' : `最終更新 ${fmtDateTime(sv.at)}　${cfg.opUser}`) : tb.req ? '未保存' : '任意';
    return (
      <div id="dscreen">
        <div className="card"><h2>拠点</h2><div className="pad">
          <Table cls="brtab" head={['No', '拠点名', 'プラン', lab, '状態', { t: '操作', align: 'right' }]}>
            {cfg.targets.map((x, i) => (x.active === false ? (
              <tr key={i} className="is-deleted"><td className="es-mono">{x.no}</td><td><b>{x.name}</b></td><td>{x.sub || ''}</td><td>—</td><td><Badge>対象外</Badge></td><td /></tr>
            ) : (
              <tr key={i} className={`brow${s.target === i ? ' is-selected' : ''}`} onClick={() => pick(i)}>
                <td className="es-mono">{x.no}</td><td><b>{x.name}</b></td><td>{x.sub || ''}</td><td>{fmtDatesIn(x.applyDate) || '—'}</td>
                <td>{s.confirmed[i] ? <Badge tone="success">本登録済</Badge> : <Badge tone="info">仮登録</Badge>}</td>
                <td style={{ textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                  {/* 本登録の入口はこの1つだけ（台帳 運営A 2026-10-06 (1)）。足りないものは理由を出して押せなくする */}
                  {!s.confirmed[i] && !cfg.done && canAct(api, 'register') && <Btn size="sm" cls="brconf" disabled={!x.reg || x.reg.stage !== '仮登録' || !!x.reg.missing.length || !targetReady(cfg, s, i)} onClick={() => confirmAt(i)}>この拠点を本登録</Btn>}
                  {!s.confirmed[i] && x.reg && (x.reg.missing.length > 0 || !targetReady(cfg, s, i)) && (
                    <div className="mm" style={{ marginTop: '0.285714rem' }}>
                      {x.reg.missing.length > 0 ? `足りない情報：${x.reg.missing.join('・')}` : `必須のタブを保存してください（${targetSaved(cfg, s, i).n}／${targetSaved(cfg, s, i).tot}）`}
                    </div>
                  )}
                </td>
              </tr>
            )))}
          </Table>
        </div></div>
        <div className="card dcard2"><div className="pad"><div className="dtabs">
          <Tabs items={t.tabs.map((x, j) => ({
            key: String(j), label: x.label, on: s.tab === j, onClick: () => tabTo(j),
            count: s.saveBad === `${s.target}:${j}` ? '要確認' : x.req && !s.saved[s.target][j] && !s.confirmed[s.target] ? '未保存' : null,
          }))} />
          <div className="vbody">
            <p className="tsub">{t.no}｜{t.name}<span className="tmeta">{meta}</span></p>
            <Blocks key={`${s.target}-${s.tab}`} list={tb.blocks} ctx={{ ti: s.target, tb: s.tab, tab: tb }} />
          </div>
        </div></div></div>
      </div>
    );
  };

  return (
    <EngineContext.Provider value={E}>
      <div id="app">
        <div className="page">
          {head}
          {s.phase === 'A' ? renderA() : renderD()}
          {/* 課題 3-2：タブにない共通データの設定（開始サイクル月・基準数のパターン・初期費用） */}
          <SetupPanel no={row.no} />
        </div>
      </div>
      {modal?.k === 'B' && <ModalB cfg={cfg} s={s} onClose={() => setModal(null)} onOk={doB} />}
      {modal?.k === 'C' && <ModalC cfg={cfg} s={s} onNext={toD} />}
      {modal?.k === 'E' && <ModalE cfg={cfg} s={s} onClose={() => setModal(null)} onOk={doE} />}
      {modal?.k === 'F1' && (() => {
        const t = cfg.targets[modal.i], all = confirmedCount(cfg, s) + (s.confirmed[modal.i] ? 0 : 1) >= activeTargets(cfg).length, rows = t.confirmRows || [['契約情報', t.name, '仮登録', '本登録', 'grn']];
        return (
          <Dialog title={`${t.no}｜${t.name} を本登録しました`} onClose={() => setModal(null)}
            foot={<><Btn variant="outline" onClick={() => setModal(null)}>閉じる</Btn>{all && <Btn onClick={() => setModal({ k: 'F' })}>申請完了の内容を確認</Btn>}</>}>
            <Table head={['項目', '名称', '本登録前', '本登録後']}>
              {rows.map((r, k) => <tr key={k}><td>{r[0]}</td><td><b>{r[1]}</b></td><td><Bg c="mut">{fmtDatesIn(r[2])}</Bg></td><td><Bg c={r[4] || 'grn'}>{fmtDatesIn(r[3])}</Bg></td></tr>)}
            </Table>
            {modal.note && <Inline tone="info">{modal.note}</Inline>}
            {all ? <Inline tone="success">全{activeTargets(cfg).length}拠点の本登録が完了しました。</Inline>
              : <Inline tone="info">残り {activeTargets(cfg).length - confirmedCount(cfg, s) - (s.confirmed[modal.i] ? 0 : 1)}拠点 は、準備ができ次第、個別に本登録してください。</Inline>}
          </Dialog>
        );
      })()}
      {modal?.k === 'F' && (
        <Dialog title={cfg.modalF.title} onClose={() => setModal(null)}
          foot={<><Btn onClick={() => setModal(null)}>閉じる</Btn></>}>
          {cfg.modalF.desc && <Html as="p" className="dsx-desc" html={cfg.modalF.desc} />}
          <Table head={['項目', '名称', '変更前', '変更後']}>
            {cfg.modalF.rows.map((r, k) => <tr key={k}><td>{r[0]}</td><td><b>{r[1]}</b></td><td><Bg c="mut">{fmtDatesIn(r[2])}</Bg></td><td><Bg c={r[4] || 'grn'}>{fmtDatesIn(r[3])}</Bg></td></tr>)}
          </Table>
          {cfg.modalF.after && <Inline tone="success" html={cfg.modalF.after} />}
        </Dialog>
      )}
      {modal?.k === 'X' && (
        <DsModal tone="warning" title="編集中の内容を破棄しますか？" cancelLabel="編集を続ける" confirmLabel={modal.cl || '破棄して移動'}
          onCancel={() => setModal(null)} onConfirm={() => { const go = modal.go; setModal(null); endEdit(true); go(); redraw(); }}>
          <p className="dsx-desc">保存していない変更は失われます。</p>
        </DsModal>
      )}
      {(modal?.k === 'RJ' || modal?.k === 'WD') && (
        <IntakeRejectModal withdraw={modal.k === 'WD'} provisional={s.phase === 'D'} onClose={() => setModal(null)} onOk={async (reason, memo) => {
          try {
            await api.action(modal.k === 'WD' ? 'intakeWithdraw' : 'intakeReject', { no: row.no, reason, memo });
            setFilter({ tab: 'new', q: '', sort: 'date' });
            toast(`${modal.k === 'WD' ? '取り下げ' : '却下'}しました（${row.no}）`);
            router.push('/ops/applications');
          } catch (e) { toastError(e); }
        }} />
      )}
    </EngineContext.Provider>
  );
}

/** 共通情報（申込担当者の表＋法人情報） */
function CommonCard({ cfg, phase }: { cfg: IntakeCfg; phase: 'A' | 'D' }) {
  const sd = cfg.side;
  return (
    <div className="card"><h2>共通情報</h2><div className="pad">
      {/* 2026/10/01：申込担当者は「法人のご担当者」＋「拠点のご担当者」の2段。申込者はこの中から1名を選ぶ */}
      <div className="secttl">申込担当者 <span style={{ fontWeight: 400, fontSize: '0.857143rem', color: 'var(--text-muted)' }}>仮登録で、法人のご担当者は法人詳細、拠点のご担当者は拠点詳細の担当者テーブルに入ります</span></div>
      <Table head={['所属', '区分', '氏名', 'フリガナ', 'メールアドレス', '電話番号']}>
        {sd.contacts.map((c, k) => (
          <tr key={k}>
            <td>{c.at === '法人' ? <Badge tone="primary">法人</Badge> : <Badge>拠点</Badge>} {c.at === '法人' ? '法人のご担当者' : c.at}</td>
            <td>{c.role}</td>
            <td><b>{c.name}</b>{c.appl && <> <Badge tone="warning">申込者</Badge></>}{c.same && <><br /><span style={{ fontSize: '0.857143rem', color: 'var(--text-muted)' }}>法人のメイン担当者と同じ</span></>}</td>
            <td>{c.kana || ''}</td><td>{c.mail}</td><td>{c.tel}</td>
          </tr>
        ))}
      </Table>
      <div className="secttl">法人情報 <Badge>{sd.company.existing ? '既存の法人' : '新規の法人'}</Badge></div>
      {sd.company.none ? <Inline tone="info">法人情報なし</Inline> : (
        <div className="es-formgrid">{sd.company.rows.filter((r) => !(phase === 'A' && !sd.company.existing && /ステータス/.test(r[0]))).map((r, k) => <Ro key={k} label={r[0]} html={r[1]} />)}</div>
      )}
      {sd.company.existing && sd.billing && <><div className="secttl">請求情報</div><div className="es-formgrid">{sd.billing.map((r, k) => <Ro key={k} label={r[0]} html={r[1]} />)}</div></>}
      {sd.extra && <><div className="secttl">{sd.extra.title}</div><div className="es-formgrid">{sd.extra.rows.map((r, k) => <Ro key={k} label={r[0]} html={r[1]} />)}</div></>}
    </div></div>
  );
}

const acctMsgText = (on: boolean) => (on
  ? 'ON（既定）：仮登録のときに、法人アカウント・拠点アカウントを発行し、全担当者へログイン案内を送ります。'
  : 'OFF：仮登録ではアカウントを発行しません。拠点の本登録のときに発行し、全担当者へログイン案内を送ります。');

/** 仮登録の確認（アカウント発行のチェック・ログイン案内メールの宛先） */
function ModalB({ cfg, s, onClose, onOk }: { cfg: IntakeCfg; s: IntakeState; onClose: () => void; onOk: (acct: boolean) => void }) {
  const m = cfg.modalB;
  const [acct, setAcct] = useState(s.acctChk);
  const [cf, setCf] = useState(false);
  const [cfErr, setCfErr] = useState(false);
  const corpAcctNew = !cfg.side.company.existing;
  const ok = () => {
    if (m.confirm && !cf) { setCfErr(true); return; }
    s.acctChk = acct;
    onOk(acct);
  };
  return (
    <Dialog title={m.title} onClose={onClose}
      foot={<><Btn variant="outline" onClick={onClose}>キャンセル</Btn><Btn tone={m.btnCls === 'red' ? 'negative' : 'primary'} onClick={ok}>{m.btn}</Btn></>}>
      {m.desc && <Html as="p" className="dsx-desc" html={m.desc} />}
      {m.notes && m.notes.length > 0 && (
        <Inline tone={m.noteTone === 'warn' ? 'warning' : 'info'} title="注意事項" html={`<ul class="dsx-ul">${m.notes.map((n) => `<li>${n}</li>`).join('')}</ul>`} />
      )}
      {m.counts && (
        <>
          {m.countsTitle && <div className="secttl">{m.countsTitle}</div>}
          <Table head={m.counts.map((c) => c.l)}><tr>{m.counts.map((c, k) => <td key={k}>{c.v}{c.u ?? '件'}</td>)}</tr></Table>
        </>
      )}
      <Blocks list={(m.extra || []) as Block[]} ctx={{ ti: 'm', tb: 'b' }} />
      {m.check && (
        <>
          <div className="secttl">{m.check.secttl || 'アカウント発行確認'}</div>
          {m.check.fixed
            ? <p className="es-field__msg" id="acctMsg"><b>仮登録のときに、{corpAcctNew ? '法人アカウント・' : ''}拠点アカウントを発行し、全担当者へログイン案内を送ります。</b></p>
            : <>
              <Check checked={acct} onChange={setAcct}>{m.check.label}</Check>
              {m.check.hint && <Html as="p" className="es-field__msg" html={m.check.hint} />}
              {m.check.acct ? <p className="es-field__msg" id="acctMsg"><b>{acctMsgText(acct)}</b></p> : m.check.note ? <Html as="p" className="es-field__msg" html={m.check.note} /> : null}
            </>}
          {/* 2026/09/29 28-139：ログイン案内メールの宛先＝メイン・サブ・請求担当者の全員＋（担当者でなければ）お申し込み者 */}
          {m.check.to && (
            <>
              <div className="secttl">ログイン案内メールの宛先</div>
              <Table head={['アカウント', '宛先', 'お名前', 'メールアドレス']}>
                {m.check.to.map((r, k) => <tr key={k}><Html as="td" html={r[0]} /><Html as="td" html={r[1]} /><td>{r[2]}</td><td className="es-mono">{r[3]}</td></tr>)}
              </Table>
              {m.check.toNote && <Html as="p" className="es-field__msg" html={m.check.toNote} />}
            </>
          )}
        </>
      )}
      {m.confirm && (
        <>
          <div id="cfBox"><Check checked={cf} onChange={(v) => { setCf(v); if (v) setCfErr(false); }}><Html html={m.confirm.label} /></Check></div>
          {cfErr && <p className="es-field__msg es-field__msg--error" id="cfErr">{m.confirm.err || '確認にチェックを入れてください。'}</p>}
        </>
      )}
    </Dialog>
  );
}

const idc = (x: string) => <div className="cid es-mono">{x}</div>;
/** 仮登録の完了。v1.6（決定 28-145）：拠点ごとに1行で、親契約・子契約・オーダー・資材の初期セット・アカウントを並べる */
function ModalC({ cfg, s, onNext }: { cfg: IntakeCfg; s: IntakeState; onNext: () => void }) {
  const m = cfg.modalC, acct = s.acct, trial = cfg.orderMode === 'trial';
  if (m.branches) {
    const ca = m.corpAcct || { id: '' };
    return (
      <Dialog title={m.title} width="1180px" onClose={onNext} foot={<Btn onClick={onNext}>{m.btn || '詳細情報の設定へ進む'}</Btn>}>
        {m.desc && <Html as="p" className="dsx-desc" html={m.desc} />}
        <div className="c2corp">
          <div><div className="c2l">法人</div><b>{m.corp?.name}</b>{idc(m.corp?.id || '')}<Badge tone="info">{m.corp?.st || '仮登録'}</Badge></div>
          <div><div className="c2l">法人アカウント（法人のご担当者で共有）</div>
            {ca.existing ? <><b>発行済み（既存）</b>{idc('ログインID ' + ca.id)}<span className="mm">既存のアカウントのまま。新しい拠点も見られるようになります</span></>
              : acct ? <><b>{ca.to || ''}</b>{idc('ログインID ' + ca.id)}<Badge tone="success">発行済・案内送信済</Badge></>
                : <><b>未発行（仮登録でOFF）</b><div className="mm">本登録のときに発行し、全担当者へログイン案内を送ります（ページ上部の「アカウント発行」から先に発行もできます）</div></>}
          </div>
        </div>
        <div className="secttl">拠点ごとに作ったもの（{m.branches.length}拠点・1行＝1拠点）</div>
        <Table cls="c2tab" head={['拠点', '親契約', '子契約（最初のサイクル）', 'オーダー', '資材の初期セット', '拠点アカウント']}>
          {m.branches.map((b, k) => {
            const ti = cfg.targets.findIndex((t) => t.name === b.name), d = ti >= 0 ? s.init[ti] : '';
            const canOrder = acct || !!ca.existing;
            return (
              <tr key={k}>
                <td><span className="cno">{b.no}</span><b>{b.name}</b>{idc(b.id)}<Badge tone="info">仮登録</Badge></td>
                <td><b>{b.cpKind}</b>{idc(b.cp)}<Badge tone="info">仮登録</Badge></td>
                <td><b>{b.cyc}</b>{idc(b.ch)}<Badge tone="primary">生成済</Badge></td>
                <td>{trial ? <><b>お試しのオーダー</b>{idc(b.ch)}<Badge tone="success">自動生成</Badge><div className="mm">個数は割合で自動計算・法人は編集不可</div></>
                  : <><b>最初のサイクルのオーダー</b>{idc(b.ch)}{canOrder ? <Badge tone="success">法人がオーダーできる</Badge> : <Badge>アカウント発行後にオーダーできる</Badge>}
                    {!canOrder && <div className="mm">未入力のまま締切を過ぎたら標準数量</div>}</>}</td>
                <td><b>資材のオーダー</b>{idc('初期セット・無料')}<Badge tone="success">自動生成</Badge><div className="mm">{d ? '納品日 ' + d.replace(/-/g, '/') : '納品日は詳細情報設定（子契約タブ）で決める'}</div></td>
                <td>{acct ? <><b>{b.acctTo || ''}</b>{idc('ログインID ' + b.acct)}<Badge tone="success">発行済・案内送信済</Badge></> : <><b>未発行</b><div className="mm">本登録時に発行</div></>}</td>
              </tr>
            );
          })}
        </Table>
        {m.after && <Inline tone="info" html={m.after} />}
      </Dialog>
    );
  }
  return (
    <Dialog title={m.title} onClose={onNext} foot={<Btn onClick={onNext}>{m.btn || '詳細情報の設定へ進む'}</Btn>}>
      {m.desc && <Html as="p" className="dsx-desc" html={m.desc} />}
      <Table head={['項目', '名称', '状態', 'ID']}>
        {(m.rows || []).map((r, k) => <tr key={k}><td>{r[0]}</td><td><b>{r[1]}</b></td><td><Bg c={r[4] || 'blue'}>{r[2]}</Bg></td><td className="es-mono">{r[3]}</td></tr>)}
        {m.acctRow && <tr><td>アカウント</td><td><b>{m.acctRow.name}</b></td><td><Badge tone={acct ? 'success' : 'neutral'}>{acct ? m.acctRow.yes : m.acctRow.no}</Badge></td><td className="es-mono">{acct ? m.acctRow.id : '—'}</td></tr>}
        {/* 2026/09/29：仮登録でオーダーと資材のオーダー（初期セット）を自動で作る。お試しは割合で自動計算したオーダー */}
        {cfg.orderMode && activeTargets(cfg).map((t) => {
          const ti = cfg.targets.indexOf(t), d = s.init[ti];
          return [
            trial
              ? <tr key={t.name + 'o'}><td>オーダー</td><td><b>{t.name}（お試し）</b></td><td><Badge tone="success">自動生成</Badge> <span className="mm">個数は割合で自動計算・法人は編集不可</span></td><td><span className="idc">—</span></td></tr>
              : <tr key={t.name + 'o'}><td>オーダー</td><td><b>{t.name}（最初のサイクル）</b></td><td><Bg c={acct ? 'grn' : 'mut'}>{acct || cfg.side.company.existing ? '法人がオーダーできる' : 'アカウント発行後にオーダーできる（未入力なら締切で標準数量）'}</Bg></td><td><span className="idc">—</span></td></tr>,
            <tr key={t.name + 'm'}><td>資材オーダー</td><td><b>{t.name}（初期セット・無料）</b></td><td><Badge tone="success">自動生成</Badge> <span className="mm">{d ? `納品日 ${d.replace(/-/g, '/')}・配送データは本登録で作成` : '配送データは本登録で作成'}</span></td><td><span className="idc">—</span></td></tr>,
          ];
        })}
      </Table>
      {m.after && <Inline tone="info" html={m.after} />}
    </Dialog>
  );
}

/** 拠点の本登録の確認 */
function ModalE({ cfg, s, onClose, onOk }: { cfg: IntakeCfg; s: IntakeState; onClose: () => void; onOk: () => void }) {
  const t = cfg.targets[s.target], m = cfg.confirm;
  return (
    <Dialog title={tok(m.title, t)} width="640px" onClose={onClose}
      foot={<><Btn variant="outline" onClick={onClose}>キャンセル</Btn><Btn tone={m.btnCls === 'red' ? 'negative' : 'primary'} onClick={onOk}>{m.btn || 'この拠点を本登録'}</Btn></>}>
      {m.desc && <Html as="p" className="dsx-desc" html={tok(m.desc, t)} />}
      <div className="es-formgrid">
        <Ro label="対象">{t.no}｜{t.name}</Ro>
        <Ro label={t.applyLabel || '適用日'}>{fmtDatesIn(t.applyDate) || '—'}</Ro>
        <Ro label="この本登録で進む">{confirmedCount(cfg, s) + 1}／{activeTargets(cfg).length}拠点</Ro>
      </div>
      {t.confirmNote && <Inline tone="info" html={t.confirmNote} />}
    </Dialog>
  );
}

/** 受付画面（申込内容確認）からの却下。理由は必須（28-25） */
function IntakeRejectModal({ onClose, onOk, withdraw, provisional }: { onClose: () => void; onOk: (reason: string, memo: string) => void; withdraw?: boolean; provisional?: boolean }) {
  const [r, setR] = useState('');
  const [memo, setMemo] = useState('');
  const [err, setErr] = useState(false);
  const w = withdraw ? '取り下げ' : '却下';
  /* 取り下げはお客様からのご連絡（理由は文字で）。仮登録のあとは、まだ本登録していない拠点などを取消・アカウント停止（台帳 2026/10/03） */
  const ok = withdraw ? !!memo.trim() : !!r;
  return (
    <DsModal tone="negative" title={`この申込を${w}しますか？`} onCancel={onClose} confirmLabel={`${w}する`} onConfirm={() => { if (!ok) { setErr(true); return; } onOk(withdraw ? memo.trim() : r, memo); }}>
      {!withdraw && <Field label="却下理由" req error={err && !r}><Select value={r} opts={AP_REJECT_REASONS} ph="選んでください" onChange={(v) => { setR(v); setErr(false); }} /></Field>}
      <Field label={withdraw ? '取り下げの理由（お客様からのご連絡）' : '詳しい理由'} req={withdraw} error={withdraw && err && !memo.trim()}><Textarea value={memo} onChange={(v) => { setMemo(v); setErr(false); }} /></Field>
      {err && !ok && <p className="es-field__msg es-field__msg--error">{withdraw ? '取り下げの理由を入れてください。' : '却下理由を選んでください。'}</p>}
      {provisional && <p className="dsx-desc">仮登録した拠点のうち、まだ本登録していない拠点の 拠点・親契約・注文・資材の初期セットを取消にし、アカウントを停止します（本登録した拠点は解約の手続きで）。</p>}
    </DsModal>
  );
}

/**
 * 開始スケジュールのタブ：オーダー締切を過ぎた申込の、開始月の扱いの2択（申込フォーム §10-5・台帳 B）。
 * 繰り下げ（開始サイクル月を締切に間に合う翌サイクルへ・既定）／運営が代理でオーダー（希望の月から開始）。選ぶとすぐ保存し、変更履歴に残る。
 * 仮登録（申込内容の確認の完了）で反映する
 */
function LateChoice({ no, late, canEdit }: { no: string; late: NonNullable<IntakeCfg['late']>; canEdit: boolean }) {
  const { toast, toastError } = useOps();
  const [v, setV] = useState<string>(late.value);
  useEffect(() => setV(late.value), [late.value]);
  const ym = (x: string) => `${+x.slice(0, 4)}年${+x.slice(5, 7)}月`;
  const opts = [
    { v: '繰り下げ', t: `開始月を翌サイクルへ繰り下げる（${ym(late.shift)}サイクルから）` },
    { v: '代理', t: `運営が代理でオーダーする（希望の${ym(late.start)}サイクルから開始）` },
  ];
  const pick = async (nv: string) => {
    const was = v;
    setV(nv);
    try { await api.action('intakeLate', { no, late: nv as '繰り下げ' | '代理' }); toast('保存しました。'); } catch (e) { setV(was); toastError(e); }
  };
  return (
    <div className="card acc" id="lateChoice">
      <h2>締切後の開始月の扱い</h2>
      <div className="pad">
        <Field label="開始月の扱い" req msg="申込内容の確認を完了（仮登録）するときに反映します。選んだ内容は変更履歴に残ります。">
          <Select value={v} opts={opts} disabled={!canEdit} onChange={pick} />
        </Field>
      </div>
    </div>
  );
}

/** 開始スケジュールのタブの上：開始サイクル月のオーダー締切までの日数（受付中のとき。台帳 運営A 2026-10-07 Q19・申込フォーム §10-5） */
function DeadlineBand({ close }: { close?: string }) {
  const c = pd(close), t = pd(today());
  if (!c || !t) return null;
  const d = Math.round((c.getTime() - t.getTime()) / 86400000);
  return (
    <div style={{ marginBottom: '1rem' }}>
      {d >= 0
        ? <Inline tone={d <= 3 ? 'warning' : 'info'}>オーダー締切 {fmtDate(c)} まで あと {d}日（今日 {fmtDate(t)}）</Inline>
        : <Inline tone="negative">オーダー締切 {fmtDate(c)} を {-d}日 過ぎています（今日 {fmtDate(t)}）</Inline>}
    </div>
  );
}
