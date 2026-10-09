'use client';

import { useOpsLeaveGuard } from '@/app/ops/_ui/leaveGuard';
import { useRouter } from 'next/navigation';
import { Fragment, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { errorMessage, isStale } from '@/lib/api/errors';
import contracts from '@/lib/ops/areas/contracts';
import { areaApi, useQuery } from '@/lib/ops/core/client';
import orgArea from '@/lib/domain/areas/org';
import { domainApi, useDomainQuery } from '@/lib/domain/client';
import {
  ACCOUNT_OPS, adjustNoAmount, amountBlock, type AmountDeadline, applyDeps, blankRow, BR_MSG, BRANCH_NEXT, cellText, CHILD_TABLE, CLOSED_EDITABLE_TABLE, childCol, dashOpt, FORMS, flatOpts, LIST_HREF, LIST_TITLE, NOUN, validate, vmFixed, VM_NOTE,
} from '@/lib/ops/contracts/logic';
import type { BranchOps } from '@/lib/ops/contracts/logic';
import type { Branch, CardDef, Cell, Entity, FieldDef, FormVal, SelOpt, TableRow } from '@/lib/ops/contracts/types';
import { today } from '@/lib/supplier/dates';
import { useOps } from '../../_ui/OpsProvider';
import { useCanAct, useScreenCan } from '../../_ui/perm';
import { AskDialog, BulkBillToDialog, EsConfirm, GenDialog, genToast, ReassignDialog, ScopeDialog, SwitchDialog, TrialExtendDialog } from './dialogs';
import { backToStored, fmtAuto, fmtAutoNode, fmtDatesIn } from '@/lib/format/date';
import { rem } from '@/lib/ui/rem';

const orgApi = domainApi(orgArea);

const api = areaApi(contracts);
const thisMonth = () => today().slice(0, 7).replace('/', '-');
/** 金額の入力（整数で、名前に「額」）は右寄せ */
const isMoney = (f: FieldDef) => f.meta?.type === 'integer' && /額/.test(f.name);

/*
 * 法人・拠点・子契約の詳細・編集（元の s-co・s-br・s-ct と mlSetMode）。
 * 上：パンくず・見出し・要約（sumbar）・ボタン。その下にタブ・項目の検索・目次、タブの中はカード（項目と表）。
 * 詳細（参照）は入力できない。編集はキャンセル・保存。仮登録の間は編集できない（契約申請管理の申請詳細で編集・決定 28-146）。
 */
export default function DetailScreen({ entity, id, mode, tab, from, back: back0 }: { entity: Entity; id: string; mode: 'detail' | 'edit'; tab?: string; from?: string; back?: string }) {
  const q = useQuery(api, entity, { id });
  if (q.error) return <div className="pane" style={{ borderTop: '1px solid var(--line)', borderRadius: 10 }}><div className="empty">{errorMessage(q.error)}</div></div>;
  if (q.loading) return <div className="empty">読み込み中…</div>;
  if (!q.data) return <div className="pane" style={{ borderTop: '1px solid var(--line)', borderRadius: 10 }}><div className="empty">{NOUN[entity]}（{id}）が見つかりません</div></div>;
  return <Screen key={`${entity}:${id}:${mode}`} entity={entity} id={id} mode={mode} tab={tab} from={from} back0={back0} data={q.data as Data} />;
}

type Data = {
  row: { id: string; apNo?: string; canceled?: boolean; status?: string; billStatus?: string; parentNo?: string; branchId?: string; corpId?: string; pending?: Branch['pending'] };
  values: Record<string, FormVal>;
  tables: Record<string, TableRow[]>;
  sum: { k: string; v: string }[];
  later?: { cyc: string; later: unknown[]; fixed: number; open: number; span: string };
  /** 契約変更の受付の締切（子契約。E54の判定） */
  deadline?: AmountDeadline;
  pending?: Branch['pending'] | null;
  /** 拠点：別操作（所属法人の付け替え・本導入への切替）ができるか・できない理由 */
  ops?: BranchOps;
  /** 読み込んだ版（保存で baseVersion として送る。E31） */
  version?: string;
};

function Screen({ entity, id, mode: mode0, tab: tab0, from, back0, data }: { entity: Entity; id: string; mode: 'detail' | 'edit'; tab?: string; from?: string; back0?: string; data: Data }) {
  const router = useRouter();
  const { toast, toastError, can, account } = useOps();
  const canAct = useCanAct();
  const screenCan = useScreenCan();
  const def = FORMS[entity];
  const noun = NOUN[entity];
  const row = data.row;
  const prov = !!row.apNo;
  /* 取消の拠点は全項目が参照のみ（I107・編集の画面を直接開いても詳細と同じ）。閉鎖の拠点は担当者の表（請求書の送り先メールを含む）だけ編集できる（I108） */
  const cancelled = ((entity === 'branch' || entity === 'corp') && row.status === '取消') || (entity === 'child' && !!row.canceled);
  const cancelMsg = entity === 'corp' ? BR_MSG.NEW_CORP_CANCEL : entity === 'child' ? BR_MSG.NEW_CHILD_CANCEL : BR_MSG.I107;
  const closedBr = entity === 'branch' && row.status === '閉鎖';
  const mode = prov || cancelled ? 'detail' : mode0;    /* 仮登録は編集にしない */
  const edit = mode === 'edit';
  const pending = entity === 'child' ? data.pending ?? null : null;
  const locked = pending?.fields ?? [];

  const [values, setValues] = useState(data.values);
  const [tables, setTables] = useState(data.tables);
  const [dirty, setDirty] = useState(false);
  const [errs, setErrs] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  /* 同時更新の検知（E31）：フォームを読み込んだときの版。保存で送り、違えば「上書きして保存」を出す（lib/ops/core/concurrency.ts） */
  const baseVer = useRef<string | undefined>(data.version);
  /* 詳細（参照）のときは、データが変わったら読み直す（アカウントの停止など） */
  useEffect(() => { if (!dirty) { setValues(data.values); setTables(data.tables); baseVer.current = data.version; } }, [data, dirty]);
  /* 編集中の印（I02）：編集の画面が開いている間、30秒ごとに送る。ほかの人が編集中なら帯を出す（ロックしない） */
  const [editors, setEditors] = useState<{ name: string; since: string }[]>([]);
  const meId = account?.id, meName = account?.name;
  const editable0 = mode0 === 'edit' && !row.apNo && !(((entity === 'branch' || entity === 'corp') && row.status === '取消') || (entity === 'child' && row.canceled));
  useEffect(() => {
    if (!editable0 || !meId) return;
    let alive = true;
    const ping = () => { api.action('editing', { entity, id, accountId: meId, name: meName ?? meId }).then((r) => { if (alive) setEditors(r.others); }).catch(() => { /* 印が送れなくても編集はできる */ }); };
    ping();
    const t = setInterval(ping, 30_000);
    return () => { alive = false; clearInterval(t); api.action('editing', { entity, id, accountId: meId, name: meName ?? meId, leave: true }).catch(() => { /* 離れる印が送れなくても、90秒で消える */ }); };
  }, [editable0, entity, id, meId, meName]);

  const firstTab = def.tabs.find((t) => t.label === tab0)?.label ?? def.tabs[0].label;
  const [tab, setTab] = useState(firstTab);
  const [closed, setClosed] = useState<Set<string>>(new Set());
  const [allLabel, setAllLabel] = useState('すべて閉じる');
  const [q, setQ] = useState('');
  const [editOnly, setEditOnly] = useState(false);
  const [layer, setLayer] = useState<ReactNode>(null);
  const close = useCallback(() => setLayer(null), []);
  const srchRef = useRef<HTMLInputElement>(null);
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const { values: shown, off } = useMemo(() => applyDeps(entity, values), [entity, values]);
  const vm = entity === 'child' && vmFixed(values);
  const lab = `${noun}${edit ? '編集' : '詳細'}`;
  /* アカウントの操作（法人・拠点とも同じ。API だけ分ける） */
  const who = entity === 'branch' ? '拠点' : '法人';
  const acctApi = entity === 'branch' ? 'branchAccount' : 'corpAccount';
  /* 子契約の戻り先：来た画面（?from=/ops/…。編集の間は ?back=）。なければ子契約一覧。画面内の URL だけ受ける */
  const okPath = (x?: string) => (x && /^\/ops\/[\w\-./%?=&]*$/.test(x) ? x : undefined);
  const backPath = entity === 'child' ? okPath(from) ?? okPath(back0) : undefined;
  const detailHref = `${LIST_HREF[entity]}/${encodeURIComponent(id)}${backPath ? `?from=${encodeURIComponent(backPath)}` : ''}`;
  const backHref = backPath ?? LIST_HREF[entity];
  /** いまの画面（子契約へのリンクに ?from= で付ける） */
  const hereHref = `${LIST_HREF[entity]}/${encodeURIComponent(id)}${tab && tab !== def.tabs[0].label ? `?tab=${encodeURIComponent(tab)}` : ''}`;

  /* 「/」で項目の検索へ。Esc でダイアログを閉じる */
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      const t = (document.activeElement?.tagName ?? '');
      if (e.key === '/' && !/^(INPUT|TEXTAREA|SELECT)$/.test(t)) { e.preventDefault(); srchRef.current?.focus(); }
      if (e.key === 'Escape') setLayer(null);
    };
    document.addEventListener('keydown', k);
    return () => document.removeEventListener('keydown', k);
  }, []);
  /* 編集の途中でページを離れるときはブラウザの確認を出す */
  useOpsLeaveGuard(dirty);
  useEffect(() => {
    if (!dirty) return;
    const h = (e: BeforeUnloadEvent) => { e.preventDefault(); };
    window.addEventListener('beforeunload', h);
    return () => window.removeEventListener('beforeunload', h);
  }, [dirty]);

  const set = (name: string, v: FormVal) => { setValues((s) => ({ ...s, [name]: v })); setDirty(true); setErrs((e) => { if (!e[name]) return e; const n = { ...e }; delete n[name]; return n; }); };
  const setRows = (title: string, rows: TableRow[]) => { setTables((t) => ({ ...t, [title]: rows })); setDirty(true); };

  /** 編集の途中で離れるときは破棄の確認（元の mlLeave） */
  const leave = (after: () => void) => {
    if (dirty && edit) setLayer(<EsConfirm title="編集内容を破棄しますか？" body="編集中の内容は保存されません。編集内容を破棄してもよろしいですか？" ok="破棄" onClose={close} onOk={() => { setDirty(false); after(); }} />);
    else after();
  };

  /* ---------- 保存 ---------- */
  const doSave = async (scope?: 'only' | 'after', force?: boolean) => {
    setBusy(true);
    try {
      const r = await api.action('save', { entity, id, values: shown, tables, scope, baseVersion: baseVer.current, ...(force ? { force: true } : {}) });
      setDirty(false);
      if (entity === 'child') {
        const l = data.later!;
        toast(!l.later.length
          ? `保存しました。${l.cyc} より後の子契約はまだ生成されていないため、適用範囲の確認は出しません（翌月以降はこの内容で生成されます。変更履歴の適用範囲：${l.cyc} 以降すべて）`
          : scope === 'after' ? `保存しました。未確定の子契約 ${r.extra || l.open}件も直しました。変更履歴の適用範囲：${l.cyc} 以降すべて` : `保存しました。変更履歴の適用範囲：${l.cyc} のみ`);
      } else toast('保存しました' + (r.warnings?.length ? '。' + r.warnings.join('') : ''));
      router.push(detailHref);
    } catch (e) {
      /* ほかの人が先に保存していた（E31）：警告のモーダル。「上書きして保存」は force で送り直す */
      if (isStale(e)) setLayer(<EsConfirm title="内容が更新されています" body={BR_MSG.E31} ok="上書きして保存" onClose={close} onOk={() => { void doSave(scope, true); }} />);
      else toastError(e);
    } finally { setBusy(false); }
  };
  const save = () => {
    const e = validate(entity, shown, locked);
    setErrs(e);
    if (Object.keys(e).length) {
      toast('入力内容を確認してください（赤枠の項目）');
      const f = Object.keys(e)[0];
      const t = def.tabs.find((x) => x.cards.some((c) => c.body.some((b) => b.t === 'fields' && b.fields.some((ff) => ff.name === f))));
      if (t) setTab(t.label);
      return;
    }
    /* 請求済・確定の子契約は、契約変更の受付の締切のあとは金額に効く項目を直して保存できない（E54。直した項目の下に出す。サーバーでも確かめる） */
    if (entity === 'child' && data.deadline) {
      const blk = amountBlock((row.billStatus ?? '').split(' ／ ')[0], data.values, shown, data.tables, tables, data.deadline);
      if (blk) {
        if (blk.name in shown) { setErrs({ [blk.name]: blk.msg }); const t = def.tabs.find((x) => x.cards.some((c) => c.body.some((b) => b.t === 'fields' && b.fields.some((ff) => ff.name === blk.name)))); if (t) setTab(t.label); }
        else toast(blk.msg);
        return;
      }
    }
    const l = data.later;
    if (entity === 'child' && l && l.later.length) {
      setLayer(<ScopeDialog cyc={l.cyc} n={l.later.length} span={l.span} open={l.open} fixed={l.fixed} onClose={close} onOk={(s) => doSave(s)} />);
      return;
    }
    doSave();
  };

  /* ---------- 項目の中のボタン ---------- */
  const mainContact = () => {
    const r = (tables['担当者（テーブル）'] ?? []).find((x) => 'c' in x && cellText(x.c[0]) === 'メイン担当者');
    return r && 'c' in r ? cellText(r.c[1]) : '';
  };
  const button = async (f: FieldDef, label: string, act?: string) => {
    if (act === 'pw') setLayer(<AskDialog title="パスワード再設定の案内を送りますか？" text={`${who}アカウント（${entity === 'branch' ? String(values['ログインID'] ?? id) : id}）のメイン担当者（${mainContact()}）に、パスワード再設定の案内（認証コード・有効期限5分）をメールで送ります。`} ok="送る" onClose={close} onOk={() => runAccount('pw', BR_MSG.S100)} />);
    else if (act === 'resend') setLayer(<AskDialog title="ログイン案内を再送しますか？" text={entity === 'branch' ? BR_MSG.Q105(id) : `法人アカウント（${id}）のログイン案内（M2）を、法人のメイン・サブ・請求担当者に送ります（同じ人は1通）。`} ok="再送する" onClose={close} onOk={() => runAccount('resend', BR_MSG.S101)} />);
    else if (act === 'stop') {
      if (values['アカウントのステータス'] !== '停止中') setLayer(<AskDialog title="アカウントを停止しますか？" text={entity === 'branch' ? BR_MSG.Q106(id) : `法人アカウント（${id}）でログインできなくなります。拠点アカウントは止まりません。再開するまで法人Web のホーム・法人情報・申請は使えません。`} ok="停止する" onClose={close} onOk={() => runAccount('stop', BR_MSG.S102(who))} />);
      else setLayer(<AskDialog title="アカウントを再開しますか？" text={entity === 'branch' ? BR_MSG.Q107(id) : `法人アカウント（${id}）で、またログインできるようになります。`} ok="再開する" onClose={close} onOk={() => runAccount('resume', BR_MSG.S103(who))} />);
    } else if (act === 'reassign') {
      /* 所属法人の付け替え（システム管理だけ。編集の保存とは別に、確認してその場で保存する） */
      const o = data.ops;
      if (!o) return;
      setLayer(<ReassignDialog branch={`${id} ${String(values['拠点名'] ?? '')}`} current={String(values['所属法人'] ?? '')} corps={o.corps} onClose={close} onOk={async (c) => {
        try { await api.action('reassignCorp', { branchId: id, corpId: c.id, by: account?.id }); toast(BR_MSG.S107(c.name)); } catch (e) { toastError(e); }
      }} />);
    } else if (act === 'switch') {
      /* お試し→本導入の切替（親契約の契約種別の履歴に1行足す。確認してその場で保存する） */
      setLayer(<SwitchDialog min={data.ops?.switchMin ?? ''} from={data.ops?.switchFrom ?? ''} onClose={close} onOk={async (startYm) => {
        try { await api.action('switchToHon', { branchId: id, startYm, by: account?.id }); toast(BR_MSG.S108); } catch (e) { toastError(e); }
      }} />);
    } else if (f.name === '拠点の請求先を一括変更') {
      try {
        const brs = await api.query('branches', { corpId: id });
        setLayer(<BulkBillToDialog branches={brs} onClose={close} onOk={async (changes) => {
          try { const r = await api.action('bulkBillTo', { corpId: id, changes }); toast(`${r.n}拠点の請求先を変更しました`); } catch (e) { toastError(e); }
        }} />);
      } catch (e) { toastError(e); }
    } else if (f.name === '子契約を先まで作る') {
      setLayer(<GenDialog rows={tables[CHILD_TABLE] ?? []} thisMonth={thisMonth()} onClose={close} onOk={async (until) => {
        try {
          const r = await api.action('genChildren', { branchId: id, until });
          const d = await api.query('branch', { id });
          if (d) setTables((t) => ({ ...t, [CHILD_TABLE]: d.tables[CHILD_TABLE] }));
          toast(genToast(r.n, r.first, r.last));
        } catch (e) { toastError(e); }
      }} />);
    } else if (f.name === 'お試しの延長') {
      /* お試しの延長（運営だけ・2026/10/03 決定。共通データの org.extendTrial） */
      try {
        const t = await api.query('trial', { branchId: id });
        if (!t) { toast('この拠点の親契約がまだありません'); return; }
        if (t.block) { toast(t.block); return; }
        setLayer(<TrialExtendDialog info={t} onClose={close} onOk={async (months, note) => {
          try {
            const r = await api.action('extendTrial', { branchId: id, months, note });
            /* 画面は action のあとの読み直しで新しい子契約・お試し期間になる */
            toast(`お試しを${months}ヶ月延長しました（お試し期間 ${r.from}〜${r.to}）。法人へお知らせしました`);
          } catch (e) { toastError(e); }
        }} />);
      } catch (e) { toastError(e); }
    } else if (f.name === '子契約で変更する') {
      try {
        const cid = await api.query('currentChild', { branchId: id });
        if (cid) leave(() => router.push(`/ops/contracts/${cid}?tab=${encodeURIComponent('設備・オプション')}`));
        else toast('この拠点の子契約がまだありません');
      } catch (e) { toastError(e); }
    } else if (/請求書?詳細を開く/.test(f.name)) {
      leave(() => router.push('/ops/billing/confirm'));
    } else {
      toast(`「${label}」は、まだつないでいません`);
    }
  };
  /** 項目の中のボタンを出すか（書き換えを呼ぶものは権限がなければ出さない） */
  const buttonOn = (f: FieldDef, act?: string) => {
    if (act === 'reassign') return can('grant', 'update') && canAct(api, 'reassignCorp');
    if (act === 'switch') return canAct(api, 'switchToHon');
    if (act === 'pw' || act === 'resend' || act === 'stop') return canAct(api, acctApi);
    if (f.name === '拠点の請求先を一括変更') return canAct(api, 'bulkBillTo');
    if (f.name === '子契約を先まで作る') return canAct(api, 'genChildren');
    if (f.name === 'お試しの延長') return canAct(api, 'extendTrial');
    return true;
  };
  const runAccount = async (op: 'pw' | 'resend' | 'stop' | 'resume', msg: string) => {
    try { await api.action(acctApi, { id, op }); toast(msg); }
    catch (e) { if (op === 'pw' || op === 'resend') toast(BR_MSG.W104); else toastError(e); }
  };

  /* ---------- 項目の検索・絞り込み（元の render） ---------- */
  const qn = q.trim().toLowerCase();
  const ftext = (f: FieldDef) => {
    const v = shown[f.name];
    const val = Array.isArray(v) ? v.join(' ') : v ?? (f.ctl.t === 'file' ? f.ctl.fn : f.ctl.t === 'buttons' ? f.ctl.items.map((b) => b.label).join(' ') : '');
    return `${f.label ?? f.name} ${val}`.toLowerCase();
  };
  /* 福利厚生の適用はシステム管理（権限付与を編集できる人）だけに見せる（台帳 E 2026-10-05） */
  const sysOnly = (f: FieldDef) => f.name === '福利厚生の適用' && !can('grant', 'update');
  /* 別操作のボタン（付け替え・切替）は詳細だけ。権限がない・取消・仮登録・編集では出さない */
  const opHidden = (f: FieldDef) => (f.name === '所属法人の付け替え' || f.name === '本導入に切り替える') && (edit || prov || !buttonOn(f, f.name === '所属法人の付け替え' ? 'reassign' : 'switch'));
  /* 「変更の適用範囲」は項目にしない：保存のとき、後ろの子契約があれば確認のダイアログで選ぶ（契約_05 契約 #4・台帳 F Q-C6） */
  const scopeItem = (f: FieldDef) => f.name === '変更の適用範囲（保存時に確認）';
  const fieldOn = (f: FieldDef) => !scopeItem(f) && !sysOnly(f) && !opHidden(f) && !(editOnly && !f.input) && (!qn || ftext(f).includes(qn));
  const tableText = (title: string, c: CardDef) => {
    const cols = c.body.flatMap((b) => (b.t === 'table' ? b.cols.map((x) => x.label) : []));
    return (cols.join(' ') + ' ' + (tables[title] ?? []).map((r) => ('c' in r ? r.c.map(cellText).join(' ') : '')).join(' ')).toLowerCase();
  };
  const cardOn = (c: CardDef) => {
    const anyField = c.body.some((b) => b.t === 'fields' && b.fields.some(fieldOn));
    const hasTable = c.body.some((b) => b.t === 'table');
    const tblM = hasTable && (!qn || tableText(c.title, c).includes(qn));
    const titleM = !qn || c.title.toLowerCase().includes(qn);
    return anyField || tblM || titleM;
  };
  const hits = qn ? def.tabs.flatMap((t) => t.cards.flatMap((c) => c.body.flatMap((b) => (b.t === 'fields' ? b.fields.filter(fieldOn) : [])))).length : 0;
  const pane = def.tabs.find((t) => t.label === tab)!;
  const cards = pane.cards.filter(cardOn);
  const toggleAll = () => {
    const anyOpen = pane.cards.some((c) => !closed.has(c.title));
    setClosed(anyOpen ? new Set([...closed, ...pane.cards.map((c) => c.title)]) : new Set([...closed].filter((t) => !pane.cards.some((c) => c.title === t))));
    setAllLabel(anyOpen ? 'すべて開く' : 'すべて閉じる');
  };
  const toggleCard = (t: string) => setClosed((s) => { const n = new Set(s); if (n.has(t)) n.delete(t); else n.add(t); return n; });

  /* ---------- 部品 ---------- */
  const editable = (f: FieldDef) => edit && !closedBr && !f.rop && !off[f.name] && !locked.includes(f.name);
  const cellEdit = (title: string) => edit && (!closedBr || title === CLOSED_EDITABLE_TABLE);
  const options = (opts: SelOpt[], cur: string, dropDash: boolean) => {
    const all = flatOpts(opts);
    const extra = cur && !all.includes(cur) ? [cur] : [];
    const keep = (o: string) => !(dropDash && /^—/.test(o) && o !== cur);
    return (
      <>
        {opts.map((o, i) => (typeof o === 'string'
          ? keep(o) && <option key={i} value={o}>{fmtDatesIn(o)}</option>
          : <optgroup key={i} label={o.group}>{o.opts.filter(keep).map((x) => <option key={x} value={x}>{fmtDatesIn(x)}</option>)}</optgroup>))}
        {extra.map((o) => <option key={'x' + o} value={o}>{fmtDatesIn(o)}</option>)}
      </>
    );
  };
  const ctl = (f: FieldDef): ReactNode => {
    const c = f.ctl;
    const on = editable(f);
    const v = shown[f.name];
    const sv = typeof v === 'string' ? v : '';
    switch (c.t) {
      case 'input': { const sv0 = data.values[f.name]; return <input className={isMoney(f) ? 'r' : undefined} value={fmtAuto(sv)} readOnly={!on} onChange={(e) => set(f.name, backToStored(e.target.value, typeof sv0 === 'string' && sv0 ? sv0 : sv))} />; }
      case 'textarea': return <textarea rows={c.rows} value={sv} readOnly={!on} onChange={(e) => set(f.name, e.target.value)} />;
      case 'select': {
        if (off[f.name]) return <select disabled value={dashOpt(off[f.name])}><option>{dashOpt(off[f.name])}</option></select>;
        if (vm && f.name === '配送区分') return <select disabled value="ES配送便"><option>ES配送便</option></select>;
        const isDep = Object.hasOwn(off, f.name) || ['請求書発行リードタイムの上書き', '支払方法', '支払サイクル', '入金期限', '起算月（年払いのとき）', '口座振替の手続きステータス'].includes(f.name);
        /* 拠点ステータスは先の状態にだけ（E118）：いまの値と、そこから変えられる値だけを出す */
        const opts = entity === 'branch' && f.name === '拠点ステータス' ? c.opts.filter((o) => typeof o === 'string' && (o === row.status || (BRANCH_NEXT[row.status ?? ''] ?? []).includes(o))) : c.opts;
        /* 契約ステータス：休止の開始月までは『休止予定』と表示だけ（値は有効のまま。開始月に利用休止になる。台帳 F 2026-10-06 (4)・Q12） */
        const soon = entity === 'branch' && !edit && f.name === '契約ステータス' && sv === '有効' && data.ops?.pauseSoon;
        if (soon) return <><select value="休止予定" disabled><option>休止予定</option></select><div className="note-s">{BR_MSG.NEW_PAUSE_SOON(soon)}</div></>;
        return <select value={sv} disabled={!on} onChange={(e) => set(f.name, e.target.value)}>{options(opts, sv, isDep)}</select>;
      }
      case 'zip': return (
        <div className="num"><input value={sv} readOnly={!on} onChange={(e) => set(f.name, e.target.value)} />
          <button type="button" className="mini zip" disabled={!on} onClick={() => toast('郵便番号の住所検索は、まだつないでいません')}>住所検索</button></div>
      );
      case 'buttons': {
        const always = ['子契約で変更する', 'アカウントの操作', 'パスワード再設定', '所属法人の付け替え', '本導入に切り替える'].includes(f.name);
        const accOps = f.name === 'アカウントの操作' ? ACCOUNT_OPS[String(values['アカウントのステータス'] ?? '')] : undefined;
        return c.items.filter((b) => buttonOn(f, b.act) && (!accOps || (b.act && (accOps as string[]).includes(b.act)))).map((b) => {
          /* 別操作はできないとき非活性にして理由（I102・I105・I106）を出す */
          const isExt = f.name === 'お試しの延長';
          /* お試しの延長は編集だけ（台帳 F 2026-10-06）。詳細では非活性にして理由を出す（I107・I109 が先） */
          const block = b.act === 'reassign' ? data.ops?.reassign : b.act === 'switch' ? data.ops?.switch : isExt ? (data.ops?.extend || (edit ? '' : '編集画面で押せます')) : '';
          const wait = (b.act === 'reassign' || b.act === 'switch' || isExt) && !data.ops;
          return (
            <Fragment key={b.label}>
              <button type="button" className="mini act" disabled={(!on && !always) || cancelled || !!block || wait} title={block || undefined} onClick={() => button(f, b.label, b.act)}>
                {b.act === 'stop' && values['アカウントのステータス'] === '停止中' ? 'アカウントの再開' : b.label}
              </button>
              {block && <div className="note-s opwhy" role="note">{block}</div>}
            </Fragment>
          );
        });
      }
      case 'file': return (
        <div className="file"><span className="fn">{c.fn}</span>
          {c.btns.map((b) => <button key={b} type="button" className="mini" disabled={!on} onClick={() => toast(b === 'DL' ? `${c.fn} をダウンロードしました` : `${c.fn} を開きました`)}>{b}</button>)}</div>
      );
      case 'chk': {
        const cur = Array.isArray(v) ? v : [];
        return (
          <div className="chk">{c.items.map((x) => (
            <label key={x}><input type="checkbox" disabled={!on} checked={cur.includes(x)} onChange={(e) => set(f.name, e.target.checked ? [...cur, x] : cur.filter((y) => y !== x))} /> {x}</label>
          ))}</div>
        );
      }
      case 'adjust': {
        const n = String(shown[f.name + '/n'] ?? '');
        const noAmt = adjustNoAmount(sv);
        return (
          <div className="stack"><div className="num">
            <select value={sv} disabled={!on} onChange={(e) => { set(f.name, e.target.value); if (adjustNoAmount(e.target.value)) set(f.name + '/n', ''); }}>{options(c.opts, sv, false)}</select>
            <input className="r" style={{ width: '5rem' }} value={n} readOnly={!on || noAmt} onChange={(e) => set(f.name + '/n', e.target.value)} />
            <span className="unit">{c.unit}</span>
          </div></div>
        );
      }
    }
  };
  const field = (f: FieldDef) => {
    if (!fieldOn(f)) return null;
    const cls = ['f', qn ? 'hit' : '', errs[f.name] ? 'err' : ''].filter(Boolean).join(' ');
    return (
      <div key={f.name} className={cls} data-na={off[f.name] ? '1' : '0'}>
        <label>{f.label ?? f.name}{f.mark === 'req' && <span className="req">*</span>}{f.mark === 'cond' && <span className="cond">△</span>}</label>
        <div className="ctl" style={f.ctl.t === 'buttons' && f.ctl.items.length > 1 ? { display: 'flex', gap: '0.571429rem', flexWrap: 'wrap' } : undefined}>{ctl(f)}</div>
        {vm && f.name === '配送区分' && <div className="note-s vmfix" style={{ color: '#A40E26' }}>{VM_NOTE}</div>}
        {pending && locked.includes(f.name) && <div className="pendnote pendmsg">承認待ちの申請 {pending.no} があるため、この項目は承認後に変えられます</div>}
        {errs[f.name] && <span className="emsg">{errs[f.name]}</span>}
      </div>
    );
  };

  /* 表のセル */
  const cellNode = (title: string, ri: number, ci: number, c: Cell): ReactNode => {
    const setCell = (nv: Cell) => setRows(title, (tables[title] ?? []).map((r, i) => (i === ri && 'c' in r ? { ...r, c: r.c.map((x, j) => (j === ci ? nv : x)) } : r)));
    if (typeof c === 'string') {
      if (title === CHILD_TABLE && ci === childCol('子契約ID') && /^CP\d{7}-\d{6}$/.test(c)) {
        return <a className="lnk" href={`/ops/contracts/${c}?from=${encodeURIComponent(hereHref)}`} onClick={(e) => { e.preventDefault(); leave(() => router.push(`/ops/contracts/${c}?from=${encodeURIComponent(hereHref)}`)); }}>{c}</a>;
      }
      /* 法人詳細の拠点・契約一覧：拠点ID→拠点詳細、親契約番号→拠点詳細の契約タブ（行全体は押さない。台帳 F 2026-10-06） */
      if (entity === 'corp' && title === '一覧') {
        const r = (tables[title] ?? [])[ri];
        const bid = r && 'c' in r ? cellText(r.c[0]) : '';
        const h = /^CU\d+$/.test(bid) ? (ci === 0 ? `/ops/branches/${bid}` : ci === 3 && /^CP\d+$/.test(c) ? `/ops/branches/${bid}?tab=${encodeURIComponent('契約')}` : '') : '';
        if (h) return <a className="lnk" href={h} onClick={(e) => { e.preventDefault(); leave(() => router.push(h)); }}>{c}</a>;
      }
      /* 契約種別の履歴：終了が空の行（いまの契約種別）に「現在」 */
      if (title === '契約種別の履歴' && ci === 0) {
        const r = (tables[title] ?? [])[ri];
        if (r && 'c' in r && cellText(r.c[2]) === '') return <>{c}<span className="nowbadge">現在</span></>;
      }
      return fmtDatesIn(c);
    }
    switch (c.t) {
      case 'in': return <input className={c.r ? 'r' : undefined} value={fmtAuto(c.v)} placeholder={c.ph} style={c.w ? { width: rem(c.w) } : undefined} readOnly={!cellEdit(title) || c.ro} onChange={(e) => setCell({ ...c, v: backToStored(e.target.value, c.v) })} />;
      case 'sel': return <select value={c.v} disabled={!cellEdit(title)} onChange={(e) => setCell({ ...c, v: e.target.value })}>{options(c.opts, c.v, false)}</select>;
      case 'cyc': return <div className="cyc">{c.v.map((v, k) => <select key={k} value={v} disabled={!cellEdit(title)} onChange={(e) => setCell({ ...c, v: c.v.map((x, j) => (j === k ? e.target.value : x)) })}>{options(c.opts, v, false)}</select>)}</div>;
      case 'del': return <span className="del" aria-label="削除" role="button" style={cellEdit(title) ? undefined : { display: 'none' }} onClick={() => setRows(title, (tables[title] ?? []).filter((_, i) => i !== ri))}><i className="dsi-Trash" /></span>;
      case 'html': return <span dangerouslySetInnerHTML={{ __html: fmtDatesIn(c.html) }} />;
    }
  };
  const card = (c: CardDef) => {
    const isClosed = closed.has(c.title);
    return (
      <div key={c.title} className={`card${isClosed ? ' closed' : ''}`} ref={(el) => { cardRefs.current[c.title] = el; }}>
        <button type="button" className="ch" onClick={() => toggleCard(c.title)}>{c.title}{c.chip && <span className="ownchip">{c.chip}</span>}<span className="chev">{isClosed ? '﹀' : '︿'}</span></button>
        <div className={`cb${isClosed ? ' hide' : ''}`}>
          {c.body.map((b, i) => {
            if (b.t === 'fields') return <div key={i} className="cols">{b.fields.map(field)}</div>;
            if (b.t === 'note') return null;
            if (b.t === 'add') return cellEdit(c.title) ? <div key={i} className="pad"><button type="button" className="mini add" onClick={() => setRows(c.title, [...(tables[c.title] ?? []), blankRow(def, c.title)])}>行を追加</button></div> : null;
            const rows = tables[c.title] ?? [];
            return (
              <div key={i} className="scroll"><table>
                <thead><tr>{b.cols.map((x, k) => <th key={k}>{x.label}</th>)}</tr></thead>
                <tbody>
                  {rows.map((r, ri) => ('band' in r
                    ? <tr key={ri} className="band"><td colSpan={b.cols.length} dangerouslySetInnerHTML={{ __html: fmtDatesIn(r.band.html) }} /></tr>
                    : <tr key={ri} className={r.cls}>{r.c.map((x, ci) => <td key={ci} className={typeof x !== 'string' && x.t === 'del' ? 'c' : undefined}>{cellNode(c.title, ri, ci, x)}</td>)}</tr>))}
                  {!rows.length && <tr><td colSpan={b.cols.length} style={{ color: '#8a96a3', textAlign: 'center' }}>まだ記録はありません</td></tr>}
                </tbody>
              </table></div>
            );
          })}
        </div>
      </div>
    );
  };
  /* 件数＝項目の数（表のある カードでは、表の上のボタン（子契約を先まで作る など）は数えない） */
  const idxCount = (c: CardDef) => c.body.reduce((n, b) => n + (b.t === 'fields' ? b.fields.filter((f) => fieldOn(f) && !(f.ctl.t === 'buttons' && c.body.some((x) => x.t === 'table'))).length : b.t === 'table' ? (tables[c.title] ?? []).filter((r) => 'c' in r).length : 0), 0);

  /* ---------- 画面 ---------- */
  const back = () => leave(() => router.push(backHref));
  const cancel = () => leave(() => router.push(from === 'detail' ? detailHref : backHref));
  const openAp = () => router.push(`/ops/applications/${encodeURIComponent(row.apNo!)}`);

  return (
    <section className="screen">
      <div className="phead">
        <div className="phl">
          <div className="crumb">法人・契約管理 / <a href={backHref} className="lnk" onClick={(e) => { e.preventDefault(); back(); }}>{backPath ? '前の画面' : LIST_TITLE[entity]}</a> / {lab}</div>
          <h2>{lab}<span className="pid">{id}</span></h2>
          {(entity === 'child' || entity === 'branch') && (
            <div className="idlinks" style={{ fontSize: '0.857143rem', margin: '0.285714rem 0' }}>
              {(entity === 'branch' ? [['法人', row.corpId, row.corpId && `/ops/corps/${row.corpId}`]] as const : [['拠点', row.branchId, row.branchId && `/ops/branches/${row.branchId}`], ['親契約', row.parentNo, row.branchId && row.parentNo && `/ops/branches/${row.branchId}?tab=${encodeURIComponent('契約')}`], ['法人', row.corpId, row.corpId && `/ops/corps/${row.corpId}`]] as const).map(([k, v, h]) => (v && h ? (
                <span key={k} style={{ marginRight: '1.142857rem' }}><i style={{ fontStyle: 'normal', color: '#6b7785', marginRight: '0.285714rem' }}>{k}</i><a className="lnk es-mono" href={h} onClick={(e) => { e.preventDefault(); leave(() => router.push(h)); }}>{v}</a></span>
              ) : null))}
            </div>
          )}
          <div className="sumbar">{data.sum.map((s) => <span key={s.k} className="s"><i>{s.k}</i><b>{fmtAutoNode(entitySum(s.k, s.v, shown))}</b></span>)}</div>
        </div>
        <div className="pbtn">
          {prov ? <button type="button" className="save" onClick={openAp}>申請詳細で編集</button>
            : !edit ? screenCan('update') && !cancelled && <button type="button" className="save" onClick={() => router.push(`${LIST_HREF[entity]}/${encodeURIComponent(id)}/edit?from=detail${backPath ? '&back=' + encodeURIComponent(backPath) : ''}${tab !== def.tabs[0].label ? '&tab=' + encodeURIComponent(tab) : ''}`)}>編集</button>
              : <><button type="button" className="cancel" onClick={cancel}>キャンセル</button><button type="button" className="save" disabled={busy} onClick={save}>保存</button></>}
        </div>
      </div>
      {prov && <div className="provbar"><b>仮登録中です（申請 <span className="es-mono">{row.apNo}</span> の詳細情報設定中）。</b>仮登録の間は、この画面では編集できません。編集は <b>契約申請管理 ＞ 申請詳細</b> で行います。拠点を確定（本登録）すると、この画面で編集できるようになります。</div>}
      {cancelled && <div className="provbar"><b>{cancelMsg}</b></div>}
      {closedBr && edit && <div className="provbar"><b>{BR_MSG.I108}</b></div>}
      {edit && editors.map((e) => <div key={e.name} className="provbar" role="status"><b>{BR_MSG.I02(e.name, e.since)}</b></div>)}
      {pending && <div className="provbar pendnote"><b>承認待ちの申請 <span className="es-mono">{pending.no}</span>（{pending.kind}）があります。</b>申請の対象の項目（{pending.fields.join('・')}）は、承認後に変えられます（承認すると申請の内容で書き換わります）。</div>}
      {entity === 'corp' && !edit && !cancelled && <CorpReminder id={id} />}
      <div className="stick">
        <div className="tabrow"><div className="tabs" role="tablist">
          {def.tabs.map((t) => <button key={t.label} role="tab" aria-selected={t.label === tab} className={t.label === tab ? 'on' : ''} onClick={() => setTab(t.label)}>{t.label}</button>)}
        </div></div>
        <div className="tools">
          <div className="srch"><span className="ic">&#128269;</span><input ref={srchRef} type="search" placeholder="項目を検索（/）" aria-label="項目を検索" value={q} onChange={(e) => setQ(e.target.value)} /><button type="button" className="clr" aria-label="検索をクリア" onClick={() => setQ('')}>&times;</button></div>
          <span className="hits">{qn ? `${hits} 件` : ''}</span>
          <button type="button" className="linkbtn" onClick={toggleAll}>{allLabel}</button>
          {!edit && !prov && !cancelled && screenCan('update') && <label><input type="checkbox" checked={editOnly} onChange={(e) => setEditOnly(e.target.checked)} /> 編集できる項目だけ</label>}
        </div>
        {cards.length >= 2 && (
          <div className="idx">{cards.map((c) => (
            <button key={c.title} type="button" onClick={() => { setClosed((s) => { const n = new Set(s); n.delete(c.title); return n; }); cardRefs.current[c.title]?.scrollIntoView({ block: 'start' }); }}>{c.title}<b>{idxCount(c)}</b></button>
          ))}</div>
        )}
      </div>
      <div className="pane">
        {cards.map(card)}
        {!cards.length && <div className="empty">{qn ? `「${q.trim()}」に一致する項目はありません` : 'このタブに表示する項目はありません'}</div>}
      </div>
      {layer}
    </section>
  );
}

/** 要約は、直した値をそのまま出す（保存前でも） */
function entitySum(k: string, v: string, values: Record<string, FormVal>) {
  const map: Record<string, string> = { 法人名: '法人名', 拠点名: '拠点名', 請求先: '請求先', 拠点ステータス: '拠点ステータス' };
  const f = map[k];
  return f && typeof values[f] === 'string' && values[f] ? (values[f] as string) : v;
}

/** 法人のご注文のリマインド（締切の7日前・3日前のお知らせ）の入り切り。法人Web の法人情報と同じ値（Corp.orderReminder） */
function CorpReminder({ id }: { id: string }) {
  const { toast, toastError } = useOps();
  const canAct = useCanAct();
  const { data } = useDomainQuery(orgApi, 'corp', { id });
  if (!data) return null;
  const on = data.corp.orderReminder !== false;
  const may = canAct(orgApi, 'setOrderReminder');
  return (
    <div className="provbar">
      <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.428571rem' }}>
        <input type="checkbox" checked={on} disabled={!may}
          onChange={async (e) => { try { await orgApi.action('setOrderReminder', { id, on: e.target.checked }); toast(e.target.checked ? 'ご注文のリマインドを送る設定にしました' : 'ご注文のリマインドを送らない設定にしました'); } catch (x) { toastError(x); } }} />
        <b>ご注文のリマインドを送る</b>
      </label>
      （締切の7日前・3日前。ご注文がまだの拠点と法人へ。法人Web の法人情報でも切り替えられます）
    </div>
  );
}
