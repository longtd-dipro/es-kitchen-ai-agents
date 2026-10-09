'use client';

import { useOpsLeaveGuard } from '@/app/ops/_ui/leaveGuard';
import { useRouter } from 'next/navigation';
import { Fragment, useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { DEMO } from '@/lib/demo';
import { isStale } from '@/lib/api/errors';
import masters from '@/lib/ops/areas/masters';
import { areaApi, useQuery } from '@/lib/ops/core/client';
import {
  A_ONLY, ALL_CHECKS, blankRow, COURSE_PANE, coursesOf, deleteBlockedText, equipKind, fieldEditable, fieldShown, indexOf, isAType, kubunOf, newValues, planDerive, specOf, sumOf, validate,
  valueOfName, valueParts, withGenRows, type Check, type FieldAt, type Tables, type Values,
} from '@/lib/ops/masters/logic';
import { toCSV } from '@/lib/ops/masters/planCsv';
import { today } from '@/lib/supplier/dates';
import type { Block, Card, MasterKind, MasterRec, V, VmGrid, VmLayout } from '@/lib/ops/masters/types';
import { useOps } from '../../_ui/OpsProvider';
import { EditingNotice, useEditingNotice } from '../../_ui/editingNotice';
import { DemoTop } from './DemoTop';
import { download, EsModal, FieldView, isRadioCell, Pager, PHOTOS, setCell, TableView, vmCapacity, VmBox, vmGenerate, type PartCtx } from './parts';
import { EMPTY_MATERIALS, hasMaterials, materialsArgs, materialsOf, PlanMaterials, type PlanMaterialsValue } from './PlanMaterials';
import master from '@/lib/domain/areas/master';
import bulk from '@/lib/domain/areas/bulk';
import type { Plan, PlanCoursePrice } from '@/lib/domain/types';
import { fmtDateTime } from '@/lib/format/date';
import { BASE, DETAIL_CLS } from './routes';
import { useCanAct } from '../../_ui/perm';
import { domainApi, useDomainQuery } from '@/lib/domain/client';

/*
 * マスタの詳細・編集・新規登録（元の mlSetMode の3モード）。
 *   詳細：見出し「〇〇詳細」＋ 削除（赤の枠線）・編集。編集：キャンセル・保存。新規登録：キャンセル・登録
 *   編集・新規登録の途中で離れるときは、入力を変えていれば破棄の確認を出す
 * 項目は spec（lib/ops/masters/spec）から描く。仕様の印・説明・項目の検索などのツールは DEMO のときだけ。
 */
const api = areaApi(masters);
const masterApi = domainApi(master);
const bulkApi = domainApi(bulk);
/** 価格プランの表の「誤りの訂正」（子契約が使っている世代の金額を直す・理由が要る。lib/domain/bulk.ts correctPriceGen） */
type Fix = { genId: string; name: string; yen: Record<string, { cool: string; es: string }>; reason: string };
type Mode = 'detail' | 'edit' | 'new';
type St = { values: Values; tables: Tables };
type Lane = { k: 'W' | 'S' | 'B'; n: number; cols: number };
const LANE_NAME = { W: 'ダブル', S: 'シングル', B: 'ベルト' } as const;
const LANE_KEY: Record<string, Lane['k']> = { ダブル: 'W', シングル: 'S', ベルト: 'B' };
/**
 * 列の構成（自販機）＝レイアウトのマスの集計（hong 2026/10/05：別の表は持たず、自販機タブの表の上に集計だけ出す）。
 * 種類（ダブル／シングル／ベルト）× 1列の格納数 ごとに列数を数える。無効のマスは数えない。ダブルは横2マスで1列
 */
function lanesFromGrid(g?: VmGrid): Lane[] {
  const m = new Map<string, Lane>();
  for (const row of g?.rows ?? []) for (const c of row.c) {
    if (c.off) continue;
    const k = LANE_KEY[c.t.replace(/\d+$/, '')], n = parseInt(c.t.replace(/\D/g, ''), 10) || 0;
    if (!k) continue;
    const key = `${k}:${n}`, cur = m.get(key) ?? { k, n, cols: 0 };
    cur.cols += 1; m.set(key, cur);
  }
  return [...m.values()].sort((a, b) => a.k.localeCompare(b.k) || b.n - a.n);
}
const lanesTo = (ls: Lane[]): VmLayout['lanes'] => ({ W: [], S: [], B: [], ...Object.fromEntries((['W', 'S', 'B'] as const).map((k) => [k, ls.filter((x) => x.k === k).map((x) => [x.n, x.cols])])) });

export default function MasterDetail({ kind, id, mode }: { kind: MasterKind; id?: string; mode: Mode }) {
  const spec = specOf(kind);
  const d = spec.detail;
  const router = useRouter();
  const { toast, toastError, openModal, account } = useOps();
  const canAct = useCanAct();
  const { data, loading } = useQuery(api, 'get', { kind, id: id ?? '' });
  /* I02：同じマスタを編集中のほかの人を、先に知らせる（ロックしない。新規登録はまだ ID がないので対象外） */
  const editors = useEditingNotice(mode === 'edit' && !!id && !!account, (leave) => api.query('presence', { kind, id: id!, accountId: account!.id, name: account!.name, leave }));
  const vmId = kind === 'devices' && id && /^VM/.test(id) ? id : '';
  /* プラン：初期備品・プランに含む資材（共通データ dm.master.plans）。画面の 登録／保存 で一緒に保存する（受付簿 #101） */
  const { data: domPlans } = useDomainQuery(masterApi, 'list', { kind: kind === 'plans' ? 'plans' : 'taxRates' });
  const domPlan = kind === 'plans' && mode !== 'new' && id ? (domPlans as Plan[] | undefined)?.find((p) => p.id === id) : undefined;
  const [mats, setMats] = useState<PlanMaterialsValue>(EMPTY_MATERIALS);
  /* プランの新規登録：ほかのプランにある価格世代の名前（価格プランの表の初期の行。受付簿 #105） */
  const { data: genNames } = useQuery(api, 'planGenNames', { on: kind === 'plans' && mode === 'new' });
  /* プランの保存時の警告 W03（最大収納数 < 1回の納品数）に使う機種の最大収納数 */
  const { data: caps } = useQuery(api, 'modelCapacities', { on: kind === 'plans' });
  /* オプション区分の選択肢はオプション区分マスタから（受付簿 #117） */
  const { data: optCats } = useQuery(api, 'optionCategories');

  const [st, setSt] = useState<St | null>(null);
  const [dirty, setDirty] = useState(false);
  const [tab, setTab] = useState(d.tabs[0]?.id ?? '');
  const [closed, setClosed] = useState<Set<string>>(new Set());
  const [check, setCheck] = useState<Check | null>(null);
  const [modal, setModal] = useState<ReactNode>(null);
  const [vmSel, setVmSel] = useState<Set<string>>(new Set());
  /* 詳細の表の上のドロップダウン（hong 2026/10/05・受付簿 #114）：値引きの適用一覧＝適用の状態、機種の貸出中の拠点＝貸出ステータス */
  const [applyState, setApplyState] = useState('適用中');
  const [loanState, setLoanState] = useState('回収済を除く');
  const [fix, setFix] = useState<Fix | null>(null);
  /* 詳細の中の表のページ送り（機種「貸出中の拠点」：1ページ 10件・10／20／50。受付簿 #113） */
  const [tPage, setTPage] = useState(1);
  const [tPer, setTPer] = useState(10);
  const [busy, setBusy] = useState(false);
  /* DEMO のツール（項目の検索・項目定義・入力する項目だけ・フェーズ2の新規のみ） */
  const [q, setQ] = useState('');
  const [showdef, setShowdef] = useState(false);
  const [editOnly, setEditOnly] = useState(false);
  const [newOnly, setNewOnly] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  /* 同時更新の検知（E31）：フォームを読み込んだときの版。保存で送り、違えば「上書きして保存」を出す（lib/ops/core/concurrency.ts） */
  const baseVer = useRef<string | undefined>(undefined);
  /* 一覧の鉛筆から開いた編集は、キャンセルで一覧へ戻る（?from=list） */
  const [from, setFrom] = useState<string | null>(null);
  useEffect(() => { setFrom(new URLSearchParams(window.location.search).get('from')); }, []);

  /* 値を読み込む（新規は空の値）。編集中は読み直さない */
  useEffect(() => {
    if (mode === 'new') { if (!st && (kind !== 'plans' || genNames)) setSt(derive(withGenRows(newValues(kind), genNames ?? []))); return; }
    if (data && !dirty) { setSt(derive({ values: data.values, tables: data.tables })); baseVer.current = data.version; }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, mode, kind, genNames]);
  useEffect(() => { if (!dirty) setMats(domPlan ? materialsOf(domPlan as Plan) : EMPTY_MATERIALS); }, [domPlan, dirty]);
  useEffect(() => { setDirty(false); setCheck(null); }, [mode]);

  /* 編集中にブラウザを閉じる・再読み込みするときの確認 */
  useOpsLeaveGuard(dirty && mode !== 'detail');
  useEffect(() => {
    if (!dirty || mode === 'detail') return;
    const h = (e: BeforeUnloadEvent) => { e.preventDefault(); };
    window.addEventListener('beforeunload', h);
    return () => window.removeEventListener('beforeunload', h);
  }, [dirty, mode]);

  /* 「/」で項目の検索へ（DEMO のツール） */
  useEffect(() => {
    if (!DEMO) return;
    const h = (e: KeyboardEvent) => {
      if (e.key === '/' && !/^(INPUT|TEXTAREA|SELECT)$/.test((document.activeElement as HTMLElement)?.tagName ?? '')) { e.preventDefault(); searchRef.current?.focus(); }
    };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, []);

  function derive(s: St): St { return kind === 'plans' ? planDerive(s.values, s.tables) : s; }
  const update = useCallback((fn: (s: St) => St) => { setSt((s) => (s ? derive(fn(s)) : s)); setDirty(true); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [kind]);

  const listUrl = BASE[kind], detailUrl = id ? `${BASE[kind]}/${id}` : listUrl;
  /** 離れるときの確認（編集・新規で入力を変えていれば） */
  const guard = (go: () => void) => {
    if (dirty && mode !== 'detail') {
      setModal(<EsModal title="編集内容を破棄しますか？" body="編集中の内容は保存されません。編集内容を破棄してもよろしいですか？" ok="破棄" onClose={() => setModal(null)} onOk={() => { setDirty(false); go(); }} />);
    } else go();
  };

  if (mode !== 'new' && !loading && !data) {
    return <div className="wrap"><section className={`screen s-${DETAIL_CLS[kind]}`}><div className="phead"><div className="phl"><div className="crumb">{spec.list.crumb0} / <a href="#" className="lnk" onClick={(e) => { e.preventDefault(); router.push(listUrl); }}>{spec.list.title}</a></div><h2>{id} が見つかりません</h2></div></div></section></div>;
  }
  if (!st) return <div className="wrap" />;

  const rec = data?.rec;
  const values = st.values, tables = st.tables;
  const editing = mode !== 'detail';
  const kb = kubunOf(kind, values);
  /** プランのコース（コースのチェック）。初期備品の表の列と setPlanMaterials のコース */
  const coursesOfPlan = () => (kind === 'plans' ? coursesOf(values) : []);
  const aType = kind === 'options' && isAType(values);
  const aTypeLocked = kind === 'options' && mode === 'edit' && !!data && isAType(data.values);
  const bad = new Set(check?.bad ?? []);
  const noun = spec.list.noun;
  const label = { detail: `${noun}詳細`, edit: `${noun}編集`, new: `${noun}新規登録` }[mode];
  const sumRec = data ? ({ id: data.rec.id, row: data.rec.row, fill: data.fill ?? undefined, values: data.saved ? data.values : undefined } as MasterRec) : null;
  const sum = sumOf(kind, sumRec, data?.values ?? values, data?.tables ?? tables);

  /* ---------- 項目の出し分け ---------- */
  const qn = q.trim().toLowerCase();
  const fieldText = (at: FieldAt) => [at.f.label, at.f.note ?? '', at.f.meta ?? '', ...(values[at.f.k] ?? []).map((x) => (typeof x === 'object' ? '' : String(x)))].join(' ').replace(/<[^>]+>/g, '').toLowerCase();
  const fieldOff = (at: FieldAt) => (DEMO && newOnly && !at.f.newf) || (DEMO && editOnly && at.f.edit === '0');
  const fieldVisible = (at: FieldAt) => fieldShown(kind, at, values) && !fieldOff(at) && (!qn || fieldText(at).includes(qn));
  const atOf = new Map(indexOf(kind).fields.map((x) => [x.f, x]));
  const cardFields = (c: Card) => indexOf(kind).fields.filter((x) => x.card === c);
  const cardTables = (c: Card) => indexOf(kind).tables.filter((x) => x.card === c);
  const cardVisible = (c: Card) => {
    if (c.hide) return false;
    /* 価格プランの表はコースごとのタブの中に出す（hong 2026/10/05：現行画面どおり。行＝価格世代 Plan.priceGens・lib/ops/masters/fromDomain.ts） */
    const fs = cardFields(c).filter((x) => !x.kpanel || x.kpanel === kb);
    if (kind === 'options' && fs.length && !cardTables(c).length && fs.every((x) => x.f.name && A_ONLY.includes(x.f.name)) && !aType) return false;
    if (!qn && !(DEMO && (newOnly || editOnly))) return true;
    const anyField = fs.some(fieldVisible);
    const tblM = cardTables(c).some((t) => !qn || JSON.stringify(t.b.head).toLowerCase().includes(qn));
    const titleM = !qn || c.title.toLowerCase().includes(qn);
    return anyField || (!!qn && (tblM || titleM));
  };

  /* ---------- 値を変える ---------- */
  const setField = (k: string, i: number, v: V) => update((s) => {
    let cur = [...(s.values[k] ?? [])];
    cur[i] = v;
    /* オプションの「すべて」（先頭）：ON にすると個別を外す。個別を ON にすると「すべて」を外す（受付簿 #119） */
    const f = indexOf(kind).fields.find((x) => x.f.k === k)?.f;
    if (kind === 'options' && f && ALL_CHECKS.includes(f.name ?? '')) {
      if (i === 0 && v === true) cur = cur.map((_, j) => j === 0);
      else if (i > 0 && v === true) cur[0] = false;
    }
    return { ...s, values: { ...s.values, [k]: cur } };
  });
  const radioField = (k: string, f: FieldAt['f'], i: number) => update((s) => {
    const ps = valueParts(f.ctl), cur = [...(s.values[k] ?? [])];
    ps.forEach((p, j) => { if (p.t === 'ck' && p.type === 'radio') cur[j] = j === i; });
    return { ...s, values: { ...s.values, [k]: cur } };
  });
  const setGrid = (k: string, g: VmGrid) => update((s) => {
    const vs = { ...s.values, [k]: [g] };
    const cap = indexOf(kind).fields.find((x) => x.f.name === '最大収納数（自販機）');
    if (cap) vs[cap.f.k] = [String(vmCapacity(g))];
    return { ...s, values: vs };
  });

  /* ---------- 小さいボタン ---------- */
  const onButton = (lbl: string, at?: FieldAt) => {
    if (lbl === 'レイアウト生成' && at) {
      const fs = indexOf(kind).fields.filter((x) => x.kpanel === at.kpanel);
      const gv = (n: string) => parseInt(String(values[fs.find((x) => x.f.name === n)?.f.k ?? '']?.[0] ?? ''), 10) || 1;
      const g = vmGenerate(gv('段数（行）'), gv('列数'));
      const grid = fs.find((x) => x.f.ctl.some((p) => p.t === 'vmbox'));
      if (grid) setGrid(grid.f.k, g);
      setVmSel(new Set());
      toast(`レイアウトを作りました（${g.rows.length}行×${g.cols}列、すべてシングル8）。マスを選んで収納タイプ・有効／無効を決めてください${DEMO ? '（デモ）' : ''}`);
    } else if (lbl === 'CSVエクスポート') {
      const t = indexOf(kind).tables.find((x) => x.b.key === '貸出中の拠点');
      if (t) { download(`貸出中の拠点_${id}.csv`, toCSV([t.b.head.map((h) => h.text), ...(tables[t.b.key] ?? []).map((r) => r.c.map((c) => c.text ?? String(c.v?.[0] ?? '')))])); toast('CSVを出力しました'); }
    }
  };

  /* ---------- カード・ブロックを描く ---------- */
  const fieldCtx = (at: FieldAt): PartCtx => {
    const f = at.f;
    let editable = editing && fieldEditable(f);
    if (aTypeLocked && f.name === '連動タイプ') editable = false;
    return {
      editable,
      name: `${kind}-${f.k}`,
      set: (i, v) => setField(f.k, i, v),
      radio: (i) => radioField(f.k, f, i),
      button: (l) => onButton(l, at),
      mainPhoto: PHOTOS[Number(values[indexOf(kind).fields.find((x) => x.f.ctl.some((p) => p.t === 'photos'))?.f.k ?? '']?.[0] ?? 0)]?.value,
      /* レイアウトの上に列の構成の集計（種類・1列の格納数ごとの列数と格納数）を出す（hong 2026/10/05） */
      vm: (g) => (
        <>
          <div className="vml-sum" id="vml-sum">
            <span>列の構成：</span>
            {lanesFromGrid(g).map((l) => <span key={`${l.k}${l.n}`}>{LANE_NAME[l.k]}{l.n} <b>{l.cols}列</b>（{l.n * l.cols}個）</span>)}
            <span>合計 <b>{vmCapacity(g)}個</b></span>
          </div>
          <VmBox grid={g} editable={editable} sel={vmSel} setSel={setVmSel} onChange={(ng) => setGrid(f.k, ng)} />
        </>
      ),
      optDisabled: kind === 'options' && f.name === '連動タイプ' && mode === 'new' ? (o) => /^A/.test(o) : undefined,
      tax: /税率(（個別に指定）)?$/.test(f.name ?? ''),
      ckDisabled: kind === 'options' && ALL_CHECKS.includes(f.name ?? '') ? (i) => i > 0 && values[f.k]?.[0] === true : undefined,
      options: kind === 'options' && f.name === 'オプション区分' && optCats?.length ? optCats : undefined,
    };
  };
  const renderBlocks = (bs: Block[], card: Card, cardIdx: number): ReactNode => bs.map((b, bi) => {
    const key = `${cardIdx}-${bi}`;
    switch (b.t) {
      case 'cols':
        return (
          <div key={key} className="cols">
            {b.fields.map((f) => {
              const at = atOf.get(f)!;
              return <FieldView key={f.k} f={f} vals={values[f.k] ?? f.v} ctx={fieldCtx(at)} bad={bad.has(f.k)} msg={check?.msgs[f.k]} hidden={!fieldVisible(at)} />;
            })}
          </div>
        );
      case 'note':
        if (b.cls.includes('note-s') && !DEMO) return null;
        return <div key={key} className={b.cls} id={b.id} style={b.style ? { marginBottom: b.style.includes('margin-bottom') ? '0.571429rem' : undefined } : undefined} dangerouslySetInnerHTML={{ __html: b.html }} />;
      case 'table': {
        const all = tables[b.key] ?? [];
        const ended = (r: (typeof all)[number]) => { const e = r.c[3]?.text ?? ''; return /^\d{4}-\d{2}$/.test(e) && e < today().slice(0, 7).replace('/', '-'); };
        /* 貸出中の拠点：貸出ステータスで絞り、貸出日の新しい順・ページ送り（合計は lib/ops/masters/fromDomain.ts が全件から出す。受付簿 #113・#114） */
        const paged = b.key === '貸出中の拠点';
        const loanCol = b.head.findIndex((h) => h.text === '貸出ステータス');
        const dateCol = Math.max(0, b.head.findIndex((h) => h.text === '貸出日'));
        const loanFilter = (r: (typeof all)[number]) => { const st = loanCol >= 0 ? r.c[loanCol]?.text ?? '' : ''; return loanState === 'すべて' ? true : loanState === '回収済を除く' ? st !== '回収済' : st === loanState; };
        const sorted = paged ? all.filter(loanFilter).sort((x, y) => (y.c[dateCol]?.text ?? '').localeCompare(x.c[dateCol]?.text ?? '')) : all;
        const tPageNow = Math.min(tPage, Math.max(1, Math.ceil(sorted.length / tPer)));
        const paged0 = paged ? sorted.slice((tPageNow - 1) * tPer, tPageNow * tPer) : all;
        const applyFilter = b.key === '適用一覧' ? (r: (typeof all)[number]) => (applyState === 'すべて' ? true : applyState === '終了' ? ended(r) : !ended(r)) : undefined;
        const tfilter = paged
          ? <label className="tfilter">貸出ステータス<select aria-label="貸出ステータス" value={loanState} onChange={(e) => { setLoanState(e.target.value); setTPage(1); }}>{['回収済を除く', 'すべて', '配送中', '貸出中', '回収依頼中', '未返却', '回収済'].map((o) => <option key={o}>{o}</option>)}</select></label>
          : null;
        /*
         * 価格プラン（1行＝1つの価格世代）：使っている子契約の数の列と、使っている世代の「誤りの訂正」を表に統合（台帳 F・受付簿 #95）。
         * 子契約が使っている世代は、編集でも価格・開始期間を変えない・消さない（公開用と終了期間は変えられる）
         */
        const priceTbl = kind === 'plans' && /価格プラン$/.test(b.key);
        const gens = data?.gens ?? [];
        const rows = priceTbl ? paged0.map((r) => {
          const g = gens.find((x) => x.name === String(r.c[1]?.v?.[0] ?? '').trim());
          const used = g?.used ?? 0;
          const c = r.c.map((cell, ci) => (editing && used > 0 && cell.p && ci !== 0 && ci !== 3 && ci !== r.c.length - 1 ? { text: String(cell.v?.[0] ?? ''), cls: cell.cls, corp: cell.corp } : used > 0 ? { ...cell, lock: 1 as const } : cell));
          const usedCell = { corp: '0', cls: 'r', text: g ? `${used}件${g.fixes.length ? `（訂正 ${g.fixes.length}回）` : ''}` : '—' };
          const last = c[c.length - 1];
          const op = !editing && used > 0 ? { ...last, p: [{ t: 'btn' as const, cls: 'mini', label: '誤りの訂正' }], v: [] } : editing && used > 0 ? { ...last, p: undefined, text: '' } : last;
          return { ...r, c: [...c.slice(0, -1), usedCell, op] };
        }) : paged0;
        const head = priceTbl ? [...b.head.slice(0, -1), { text: '使っている子契約', cls: 'r' }, b.head[b.head.length - 1]] : b.head;
        const openFix = (ri: number) => {
          const g = gens.find((x) => x.name === String(paged0[ri]?.c[1]?.v?.[0] ?? '').trim());
          if (!g) return;
          const yen: Fix['yen'] = {};
          for (const c of data?.courses ?? []) { const x = g.prices.find((y) => y.course === c); yen[c] = { cool: x?.coolYen !== undefined ? String(x.coolYen) : '', es: String(x?.esYen ?? x?.monthlyYen ?? '') }; }
          setFix({ genId: g.id, name: g.name, yen, reason: '' });
        };
        return (
          <Fragment key={key}>
          {tfilter}
          <TableView head={head} rows={rows} tcls={b.tcls} editable={editing && !paged} name={b.key} bad={bad}
            onButton={priceTbl ? (r, l) => { if (l === '誤りの訂正') openFix(r); } : undefined}
            filter={applyFilter}
            onCell={(r, c, i, v) => update((s) => {
              const cell = s.tables[b.key]?.[r]?.c[c];
              let rs = setCell(s.tables[b.key] ?? [], r, c, i, v, isRadioCell(cell));
              /* 標準貸出設備：機種を選ぶと機種区分を入れ直す */
              if (/標準貸出設備$/.test(b.key) && c === 2) rs = setCell(rs, r, 1, 0, equipKind(String(v)));
              return { ...s, tables: { ...s.tables, [b.key]: rs } };
            })}
            onDel={(r) => update((s) => ({ ...s, tables: { ...s.tables, [b.key]: (s.tables[b.key] ?? []).filter((_, i) => i !== r) } }))}
          />
          {paged && <Pager total={sorted.length} page={tPage} per={tPer} onPage={setTPage} onPer={setTPer} />}
          </Fragment>
        );
      }
      case 'pad': {
        if (!editing) return null;
        const t = [...bs.slice(0, bi)].reverse().find((x) => x.t === 'table') as Extract<Block, { t: 'table' }> | undefined;
        return (
          <div key={key} className="pad">
            <button type="button" className="mini add" onClick={() => t && update((s) => {
              const row = blankRow(kind, t.key, s.tables[t.key] ?? []);
              return row ? { ...s, tables: { ...s.tables, [t.key]: [...(s.tables[t.key] ?? []), row] } } : s;
            })}>行を追加</button>
          </div>
        );
      }
      case 'ktabs':
        return <div key={key} className="ktabs">{b.o.map((k) => <span key={k} className={`ktab${k === kb ? ' on' : ''}`}>{k}</span>)}</div>;
      case 'kpanel':
        return <div key={key} className={`kpanel${b.k !== kb ? ' off' : ''}`}>{renderBlocks(b.blocks, card, cardIdx * 100 + bi)}</div>;
      case 'tbar':
        return (
          <div key={key} className="tbar">
            {/* 値引きの適用一覧：表の上のドロップダウン「適用の状態」（hong 2026/10/05・受付簿 #114。旧：トグル「終了分も表示」） */}
            {card.title === '適用一覧' && (
              <label className="tfilter">適用の状態<select aria-label="適用の状態" value={applyState} onChange={(e) => setApplyState(e.target.value)}>{['適用中', '終了', 'すべて'].map((o) => <option key={o}>{o}</option>)}</select></label>
            )}
            {b.btns.map((x) => (
              <button key={x.label} type="button" className={x.cls} title={x.title} onClick={() => toast(DEMO ? `${x.label}（デモ：取込の画面は未作成）` : `${x.label}はまだ使えません`)}>{x.label}</button>
            ))}
            {b.tsum && <span className="tsum" data-name={b.tsum.name}><i>{b.tsum.label}</i><b>{(typeof data?.fill?.[b.tsum.name] === 'string' ? data?.fill?.[b.tsum.name] : null) ?? b.tsum.value}</b></span>}
          </div>
        );
      case 'html':
        return <div key={key} dangerouslySetInnerHTML={{ __html: b.html }} />;
    }
  });
  const cardKey = (c: Card) => c.title;
  const renderCard = (c: Card, i: number) => {
    const isClosed = closed.has(cardKey(c));
    return (
      <div key={c.title} className={`card${isClosed ? ' closed' : ''}${cardVisible(c) ? '' : ' hide'}`} id={c.id ?? `sec-${i}`}>
        <button type="button" className="ch" onClick={() => setClosed((s) => { const n = new Set(s); if (n.has(cardKey(c))) n.delete(cardKey(c)); else n.add(cardKey(c)); return n; })}>
          {c.title}<span className="chev">{isClosed ? '﹀' : '︿'}</span>
        </button>
        <div className={`cb${isClosed ? ' hide' : ''}`}>{renderBlocks(c.blocks, c, i)}</div>
      </div>
    );
  };
  const pane = d.panes.find((p) => p.id === tab) ?? d.panes[0];
  const paneCards = pane?.cards ?? [];
  const paneCourse = Object.entries(COURSE_PANE).find(([, v]) => v === pane?.id)?.[0];
  const idxCards = paneCards.filter(cardVisible);
  const hits = qn ? indexOf(kind).fields.filter((x) => fieldVisible(x) && (x.pane === tab || x.pane === 'top')).length : 0;
  /* エラーのある項目が入っているタブ（見出しに赤い印・hong 2026/10/05） */
  const errPanes = new Set(check ? indexOf(kind).fields.filter((x) => check.bad.includes(x.f.k)).map((x) => x.pane) : []);

  /* ---------- 保存・登録・削除 ---------- */
  const save = async () => {
    const c = validate(kind, values, tables, mode === 'new' ? 'new' : 'edit', { capacity: (mid) => caps?.[mid] });
    if (c.errs.length) {
      setCheck(c);
      /* 見出しの下の枠（1行）で知らせる。赤枠の項目がほかのタブにあれば、そのタブを開く（hong 2026/10/05 A 案） */
      const first = indexOf(kind).fields.find((x) => c.bad.includes(x.f.k));
      if (first && first.pane !== 'top' && first.pane !== tab) setTab(first.pane);
      return;
    }
    setCheck(null);
    /* 警告（W03）：確かめてから保存 */
    if (c.warns.length) {
      setModal(<EsModal title="確認" body={<>{c.warns.map((w) => <div key={w}>{w}</div>)}</>} ok="このまま保存" cancel="戻る" onClose={() => setModal(null)} onOk={() => void doSave()} />);
      return;
    }
    await doSave();
  };
  const doSave = async (force = false) => {
    setBusy(true);
    try {
      /* 自販機の列の構成＝レイアウトのマスの集計（hong 2026/10/05） */
      const gridF = indexOf(kind).fields.find((x) => x.f.ctl.some((p) => p.t === 'vmbox'));
      const grid = gridF ? (values[gridF.f.k]?.[0] as VmGrid | undefined) : undefined;
      const lanesArg = kind === 'devices' && (vmId || kb === '自販機') ? lanesTo(lanesFromGrid(typeof grid === 'object' ? grid : undefined)) : undefined;
      /* プラン：初期備品・プランに含む資材も一緒に保存する（カードに保存ボタンはない。受付簿 #101）。新規登録はプランID が決まってから */
      const saveMats = async (planId: string) => {
        if (kind !== 'plans' || !hasMaterials(mats) || !canAct(masterApi, 'setPlanMaterials')) return;
        try { await masterApi.action('setPlanMaterials', { planId, ...materialsArgs(mats, coursesOfPlan()), by: account?.id ?? '運営' }); }
        catch (e) { toastError(e); }
      };
      if (mode === 'new') {
        const out = await api.action('create', { kind, values, tables, lanes: lanesArg });
        await saveMats(out.id);
        setDirty(false);
        toast('登録しました');
        router.replace(`${BASE[kind]}/${out.id}`);
      } else {
        const out = await api.action('save', { kind, id: id!, values, tables, lanes: lanesArg, baseVersion: baseVer.current, ...(force ? { force: true } : {}) });
        baseVer.current = out.version;
        await saveMats(id!);
        setDirty(false);
        toast('保存しました');
        router.push(detailUrl);
      }
    } catch (e) {
      /* 他のユーザーが先に保存していた（E31）：警告のモーダル。「上書きして保存」は force で送り直す */
      if (isStale(e)) {
        setModal(<EsModal title="内容が更新されています" body="他のユーザーにより内容が更新されています。上書きすると保存されます。" ok="上書きして保存" cancel="キャンセル" onClose={() => setModal(null)} onOk={() => { void doSave(true); }} />);
      } else toastError(e);
    } finally { setBusy(false); }
  };
  const del = () => {
    if (!rec) return;
    if (rec.use > 0) {
      setModal(<EsModal title="削除できません" body={<>{deleteBlockedText(rec.use)}<br /><b>{rec.id}</b></>} cancel="閉じる" onClose={() => setModal(null)} />);
      return;
    }
    setModal(
      <EsModal title="削除しますか？" body={<>削除済にします（一覧からは既定で隠れます。戻せません）。<br /><b>{rec.id}</b></>} ok="削除" onClose={() => setModal(null)}
        onOk={async () => { try { await api.action('remove', { kind, id: rec.id }); toast('削除しました'); router.push(listUrl); } catch (e) { toastError(e); } }} />,
    );
  };
  const cancel = () => guard(() => router.push(mode === 'edit' && from !== 'list' ? detailUrl : listUrl));

  return (
    <div className={`wrap${DEMO && showdef ? ' showdef' : ''}`}>
      <DemoTop kind={kind} />
      <section className={`screen s-${DETAIL_CLS[kind]}`}>
        <div className="phead">
          <div className="phl">
            <div className="crumb">{spec.list.crumb0} / <a href="#" className="lnk" onClick={(e) => { e.preventDefault(); guard(() => router.push(listUrl)); }}>{spec.list.title}</a> / {label}</div>
            <h2>{label}<span className="pid">{mode === 'new' ? '' : id}</span></h2>
            {mode !== 'new' && (
              <div className="sumbar">
                {sum.map((s) => <span key={s.label} className="s"><i>{s.label}</i><b>{s.value}</b></span>)}
                {rec?.deleted && <span className="s"><i>状態</i><b>削除済</b></span>}
              </div>
            )}
          </div>
          <div className="pbtn">
            {mode === 'detail' ? (
              !rec?.deleted && <>
                {/* 権限がなければ出さない */}
                {!rec?.system && canAct(api, 'remove', { kind }) && <button type="button" className="del" onClick={del}>削除</button>}
                {/* 「価格世代を一括切替」はプランマスタに置かない（契約の側＝子契約一覧の一括変更から。hong 2026/10/05 B 案） */}
                {canAct(api, 'save', { kind }) && <button type="button" className="save" onClick={() => router.push(`${detailUrl}/edit`)}>編集</button>}
              </>
            ) : (
              <>
                <button type="button" className="cancel" onClick={cancel}>キャンセル</button>
                <button type="button" className="save" disabled={busy} onClick={() => save()}>{mode === 'new' ? '登録' : '保存'}</button>
              </>
            )}
          </div>
        </div>
        <EditingNotice others={editors} className="provbar" />
        {check && check.errs.length > 0 && (
          /* エラーの一覧は出さない（項目の下の文言と二重になる）。1行だけ・エラーのあるタブに赤い印（hong 2026/10/05 A 案・受付簿 #83） */
          <div className="vbox" role="alert"><b>保存できません（{Math.max(check.errs.length, check.bad.length)}件）。</b>赤い項目を確認してください。</div>
        )}
        {d.top && <div className="toparea" id={`${DETAIL_CLS[kind]}-top`}>{d.top.map((c, i) => renderCard(c, 1000 + i))}</div>}
        <div className="stick">
          <div className="tabrow">
            <div className="tabs" role="tablist">
              {d.tabs.map((t) => <button key={t.id} type="button" role="tab" aria-selected={t.id === tab} className={[t.id === tab ? 'on' : '', errPanes.has(t.id) ? 'err' : ''].filter(Boolean).join(' ') || undefined} onClick={() => setTab(t.id)}>{t.label}</button>)}
            </div>
          </div>
          {DEMO && (
            <div className="tools">
              <div className="srch">
                <span className="ic">&#128269;</span>
                <input ref={searchRef} type="search" placeholder="項目を検索（/）" aria-label="項目を検索" value={q} onChange={(e) => setQ(e.target.value)} />
                <button type="button" className="clr" aria-label="検索をクリア" onClick={() => setQ('')}>&times;</button>
              </div>
              <span className="hits">{qn ? `${hits} 件` : ''}</span>
              <button type="button" className="linkbtn" onClick={() => {
                const anyOpen = paneCards.some((c) => !closed.has(cardKey(c)));
                setClosed((s) => { const n = new Set(s); paneCards.forEach((c) => (anyOpen ? n.add(cardKey(c)) : n.delete(cardKey(c)))); return n; });
              }}>{paneCards.some((c) => !closed.has(cardKey(c))) ? 'すべて閉じる' : 'すべて開く'}</button>
              <label><input type="checkbox" checked={showdef} onChange={(e) => setShowdef(e.target.checked)} /> 項目定義（物理名・型・説明）</label>
              <label><input type="checkbox" checked={editOnly} onChange={(e) => setEditOnly(e.target.checked)} /> 入力する項目だけ</label>
              <label><input type="checkbox" checked={newOnly} onChange={(e) => setNewOnly(e.target.checked)} /> フェーズ2の新規のみ</label>
            </div>
          )}
          {idxCards.length >= 2 && (
            <div className="idx">
              {idxCards.map((c) => {
                const n = cardFields(c).filter(fieldVisible).length + cardTables(c).reduce((a, t) => a + t.b.head.length, 0);
                return (
                  <button key={c.title} type="button" onClick={() => {
                    setClosed((s) => { const x = new Set(s); x.delete(cardKey(c)); return x; });
                    document.getElementById(c.id ?? `sec-${paneCards.indexOf(c)}`)?.scrollIntoView({ block: 'start' });
                  }}>{c.title}<b>{n}</b></button>
                );
              })}
            </div>
          )}
        </div>
        {pane && (
          <div className="pane" id={pane.id}>
            {paneCards.map((c, i) => renderCard(c, i))}
            {!idxCards.length && <div className="empty">{qn ? `「${q.trim()}」に一致する項目はありません` : 'このタブに表示する項目はありません'}</div>}
            {/* 初期備品・プランに含む資材は、コースごとのタブの中（標準貸出設備の下）に出す（hong 2026/10/05 画面設計書のコメント） */}
            {/* 編集・新規登録でも出す（入力は編集で・hong 2026/10/05・受付簿 #69）。保存は画面の 登録／保存 で一緒に（受付簿 #101） */}
            {kind === 'plans' && !rec?.deleted && paneCourse && coursesOfPlan().includes(paneCourse) && (
              <PlanMaterials courses={coursesOfPlan()} meals={valueOfName('plans', values, '月次提供上限の合計')} course={paneCourse} editable={editing} value={mats} onChange={(v) => { setMats(v); setDirty(true); }} />
            )}
          </div>
        )}
        {/* 価格世代のカードは置かない：価格プランの表（1行＝1世代）に統合した（台帳 F・受付簿 #63／#95） */}
      </section>
      {modal}
      {/* 価格プランの「誤りの訂正」：子契約が使っている世代の金額を直す（理由が要る・未確定の子契約の ① 費目を作り直す。確定・請求済は請求調整） */}
      {fix && id && (
        <EsModal title={`誤りの訂正（${fix.name}）`} ok="訂正する" cancel="やめる" onClose={() => setFix(null)}
          onOk={() => void (async () => {
            const n = (s: string) => Number(String(s).replace(/[^\d]/g, ''));
            const prices: PlanCoursePrice[] = (data?.courses ?? []).map((c) => {
              const y = fix.yen[c] ?? { cool: '', es: '' }, es = n(y.es), vm = c === 'ESライト（自販機）';
              return { course: c, monthlyYen: es || n(y.cool), esYen: es || undefined, ...(vm || !y.cool ? {} : { coolYen: n(y.cool) }) };
            });
            try {
              const r = await bulkApi.action('correctPriceGen', { planId: id, genId: fix.genId, prices, reason: fix.reason, by: account?.id ?? '運営' });
              toast(`価格プラン「${fix.name}」の誤りを訂正しました（子契約 ${r.updated.length}件の ① 費目を作り直し）${r.message ? `。${r.message}` : ''}`);
              setFix(null);
            } catch (e) { toastError(e); }
          })()}
          body={
            <div className="cols">
              {(data?.courses ?? []).map((c) => (
                <div key={c} className="f">
                  <label>{c}</label>
                  <div className="ctl">
                    {c !== 'ESライト（自販機）' && <input className="r" inputMode="numeric" aria-label={`${c} 価格（COOL便）`} placeholder="価格（COOL便）" value={fix.yen[c]?.cool ?? ''} onChange={(e) => setFix({ ...fix, yen: { ...fix.yen, [c]: { ...(fix.yen[c] ?? { cool: '', es: '' }), cool: e.target.value } } })} />}
                    <input className="r" inputMode="numeric" aria-label={`${c} 価格（ES配送便）`} placeholder="価格（ES配送便）" value={fix.yen[c]?.es ?? ''} onChange={(e) => setFix({ ...fix, yen: { ...fix.yen, [c]: { ...(fix.yen[c] ?? { cool: '', es: '' }), es: e.target.value } } })} />
                  </div>
                </div>
              ))}
              <div className="f"><label>訂正の理由<span className="req">*</span></label><div className="ctl"><input value={fix.reason} aria-label="訂正の理由" placeholder="例）登録の金額が誤っていた" onChange={(e) => setFix({ ...fix, reason: e.target.value })} /></div></div>
              {!!gens0(data?.gens, fix.genId)?.fixes.length && <div className="f"><label>これまでの訂正</label><div className="ctl">{gens0(data?.gens, fix.genId)!.fixes.map((f) => <div key={f.at} className="muted">{fmtDateTime(f.at)} {f.by}：{f.reason}</div>)}</div></div>}
            </div>
          }
        />
      )}
    </div>
  );
}
const gens0 = <T extends { id: string }>(gens: T[] | undefined, id: string) => gens?.find((g) => g.id === id);


