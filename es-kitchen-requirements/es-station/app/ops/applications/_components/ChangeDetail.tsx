'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AP_REJECT_REASONS, AP_TAB } from '@/lib/ops/applications/constants';
import {
  appState, approveError, blockWhy, deadline, entityHref, isWaiting, setDone, setItems, setValueOf, ymd, type SetItem,
} from '@/lib/ops/applications/logic';
import type { ChangeApp, ChangeBranch } from '@/lib/ops/applications/types';
import { today } from '@/lib/supplier/dates';
import { useOps } from '../../_ui/OpsProvider';
import { useCanAct } from '../../_ui/perm';
import { api, backTo } from './api';
import {
  BeforeCheckNote, BilledBlock, LockedBlock, CxlBlock, CxlMini, ImpactRules, ImpactTable, NoteBlocks, NoticeBlock, PauseBlock, SizeUpNote,
} from './changeBlocks';
import { Badge, Bg, Btn, Check, Dialog, DsModal, Field, Inline, PageHead, Ro, Select, Table, Tabs, Textarea, Input } from './ds';
import { PlanEquipBlock } from './lifecycleBlocks';
import { DateInput } from '@/components/DateInput';
import { fmtDate, fmtDatesIn } from '@/lib/format/date';

/*
 * 申請詳細（変更申請の承認）。元：approve.js の open（2026/09/28 作り直し・案A）。
 * どの申請も同じ4つのタブ：申請内容／変更される項目／影響と設定／拠点ごとの承認（決定 1B。法人情報の変更は法人単位）。
 */
type ATab = 'req' | 'chg' | 'imp' | 'board';
const LATE = ['開始月を翌サイクルへ繰り下げる', '運営が代理でオーダーする（今月分）'];

export default function ChangeDetail({ a }: { a: ChangeApp }) {
  const router = useRouter();
  const { toast, toastError } = useOps();
  const canAct = useCanAct();
  const [atab, setAtab] = useState<ATab>('req');
  const [approving, setApproving] = useState<number | null>(null);
  const [rejecting, setRejecting] = useState<number | null>(null);
  /* 別の申請を開いたら、申請内容のタブから */
  useEffect(() => { setAtab('req'); }, [a.no]);

  const corp = a.kind === '法人情報の変更';
  const st = appState(a), dl = deadline(a, today());
  const waiting = isWaiting(st);
  const go = (k: ATab) => { setAtab(k); window.scrollTo(0, 0); };
  const back = () => { backTo(AP_TAB[a.kind] || 'change'); router.push('/ops/applications'); };
  const run = async (p: Promise<unknown>) => { try { await p; } catch (e) { toastError(e); } };

  const pend = a.branches.filter((b) => !b.res.st).length;
  const need = a.branches.filter((b, i) => !b.res.st && !setDone(a, i)).length;
  const boardLabel = corp ? '法人単位の承認' : '拠点ごとの承認';
  const P: [ATab, string][] = [['req', '申請内容'], ['chg', '変更される項目'], ['imp', '影響と設定'], ['board', boardLabel]];

  const acts = !a.done && waiting
    ? (need && atab !== 'imp' ? <Btn variant="outline" onClick={() => go('imp')}>影響と設定へ</Btn>
      : atab !== 'board' ? <Btn variant="outline" onClick={() => go('board')}>{corp ? '法人単位の承認へ' : '拠点ごとの承認へ'}</Btn> : null)
    : null;

  /* ① 申請情報・お客様の申請内容 */
  const info = (
    <>
      <div className="card"><h2>申請情報</h2><div className="pad"><div className="es-formgrid">
        <Ro label="申請の種類"><Badge tone="primary">{a.kind}</Badge></Ro>
        <Ro label="法人">{a.company} <span className="idc">{a.companyId}</span></Ro>
        <Ro label="申請者">{a.applicant}{a.proxy ? '' : '（法人Web）'}</Ro>
        <Ro label="申請日">{fmtDate(a.date)}</Ro>
        <Ro label="開始">{fmtDatesIn(a.start)}</Ro>
      </div></div></div>
      <div className="card"><h2>お客様の申請内容</h2><div className="pad"><div className="es-formgrid">
        {([['対象の拠点', a.branches.map((b) => b.name).join('・')] as [string, string]].concat(a.request)).map((r, k) => (
          <Ro key={k} label={r[0]} cls={String(r[1]).length > 46 ? 'span2' : undefined}>{r[1]}</Ro>
        ))}
      </div></div></div>
    </>
  );

  /* ② 変更される項目（法人画面の項目名で、変わる行だけ） */
  const chg = (
    <div className="card">
      <h2>変更される項目<span className="r"><Link className="es-btn es-btn--outline es-btn--primary es-btn--sm" href={`/ops/corps/${encodeURIComponent(a.companyId)}`}><span>法人画面を開く</span></Link></span></h2>
      <div className="pad">
        {a.branches.map((b, i) => (
          <div key={i}>
            {a.branches.length > 1 && (
              <div className="secttl">{b.name} <span className="idc">{b.ids}</span>{b.amount && b.amount !== '—' && <> <Badge tone={b.amtCls === 'grn' ? 'success' : 'negative'}>月額 {b.amount}</Badge></>}</div>
            )}
            <Table cls="apx-chg" head={[{ t: '画面 ＞ 項目', w: '28%' }, '変更前', '変更後', { t: 'いつから', w: '16%' }]}>
              {b.changes.map((c, k) => (
                <tr key={k}>
                  <td><Link className="apx-loc" href={entityHref(`${c[0]} ＞ ${c[1]}`)} title="法人画面で開く">{c[0]} ＞ {c[1]}</Link><div className="apx-fld">{c[2]}</div></td>
                  <td className="apx-before">{fmtDatesIn(c[3])}</td>
                  <td className="apx-after"><b>{fmtDatesIn(c[4])}</b></td>
                  <td>{fmtDatesIn(c[5])}</td>
                </tr>
              ))}
              {b.total && <tr className="tot"><td>{b.total[0]}</td><td>{b.total[1]}</td><td><b>{b.total[2]}</b></td><td /></tr>}
            </Table>
          </div>
        ))}
      </div>
    </div>
  );

  /* ③ 承認すると動くもの・承認の前にする設定 */
  const imp = a.branches.map((b, i) => {
    const I = setItems(a, b), done = setDone(a, i);
    return (
      <div className="card" key={i}>
        <h2>{b.name} <span className="idc">{b.ids}</span><span className="r">{I.length ? (done ? <Badge tone="success">設定済</Badge> : <Badge tone="warning">要入力</Badge>) : <Badge>設定なし</Badge>}</span></h2>
        <div className="pad">
          <PauseBlock a={a} b={b} />
          <CxlBlock a={a} b={b} />
          <div className="secttl">承認すると動くもの（影響）</div>
          <ImpactTable b={b} cls="apx-imp" />
          {(b.warn || []).map((w, k) => <Inline key={k} tone="warning">{w}</Inline>)}
          <BilledBlock a={a} b={b} />
          <LockedBlock a={a} b={b} />
          <PlanEquipBlock a={a} b={b} i={i} />
          <NoteBlocks a={a} b={b} />
          {I.length > 0 && <><div className="secttl">承認の前にする設定</div><SetForm a={a} b={b} i={i} items={I} /></>}
        </div>
      </div>
    );
  });

  /* ④ 拠点ごとの承認 */
  const dlh = dl && waiting ? (dl.d >= 0
    ? <Inline tone={dl.d <= 3 ? 'warning' : 'info'}>オーダー締切 {fmtDate(dl.close)} まで あと {dl.d}日（今日 {fmtDate(dl.today)}）。締切を過ぎてから承認するときは、開始月の扱いを2択から選びます。</Inline>
    : <Inline tone="negative">オーダー締切 {fmtDate(dl.close)} を {-dl.d}日 過ぎています。承認するときに「開始月を翌サイクルへ繰り下げる」か「運営が代理でオーダーする（今月分）」を選びます。選んだ内容はお知らせにも書きます。</Inline>) : null;
  const board = (
    <div className="card acc" id="apxboard">
      <h2>{boardLabel}<span className="r"><Bg>{st.t}</Bg></span></h2>
      <div className="pad">
        {corp && <Inline tone="info">法人情報は法人単位の変更です。拠点ごとではなく、法人1件として承認・却下します（承認すると法人全体に反映されます）。</Inline>}
        {dlh}
        <SizeUpNote a={a} />
        <ImpactRules a={a} />
        <Table head={[corp ? '法人' : '拠点', '変更の内容', { t: '月額への影響（税抜）', align: 'right' }, '状態', { t: '操作', align: 'right' }]}>
          {a.branches.map((b, i) => {
            const x = b.res, why = blockWhy(a, b);
            /* 承認・却下した拠点はその場で確定（やり直しは置かない：課題一覧 4-8）。権限がなければ出さない */
            const ops = a.done || x.st ? (x.by ? <span className="mut">{x.by}</span> : null)
                : <>
                  {canAct(api, 'reject') && <Btn variant="outline" tone="negative" size="sm" onClick={() => setRejecting(i)}>却下</Btn>}
                  {why ? <>
                    {canAct(api, 'approve') && <Btn size="sm" disabled>{corp ? '法人の変更を承認' : 'この拠点を承認'}</Btn>}
                    <div className="mm" style={{ maxWidth: '22.857143rem', textAlign: 'left', color: 'var(--red,#CF222E)', marginTop: '0.285714rem' }}>{why}</div>
                  </> : setDone(a, i) ? (canAct(api, 'approve') && <Btn size="sm" onClick={() => setApproving(i)}>{corp ? '法人の変更を承認' : 'この拠点を承認'}</Btn>)
                    : <Btn variant="outline" size="sm" onClick={() => go('imp')}>影響と設定を入力</Btn>}
                </>;
            return (
              <tr key={i}>
                <td><b>{b.name}</b><div className="mm">{b.ids}</div></td>
                <td>{fmtDatesIn(b.head)}<CxlMini a={a} b={b} /></td>
                <td className="r">{b.amount || '—'}</td>
                <td>
                  {x.st === 'ok' ? <><Badge tone="success">✓ 承認済</Badge>{x.late && <div className="mm">{fmtDatesIn(x.late)}</div>}</>
                    : x.st === 'ng' ? <Badge tone="negative">却下</Badge> : x.st === 'wd' ? <Badge>取り下げ済</Badge> : <Badge tone="warning">承認待ち</Badge>}
                  {x.st === 'ng' && x.why && <div className="mm">{x.why}</div>}
                </td>
                <td style={{ textAlign: 'right' }}><div className="apx-ops">{ops}</div></td>
              </tr>
            );
          })}
        </Table>
        {!a.done && !waiting && <Inline tone="success">すべての拠点を処理しました（{st.t}）。承認した拠点へ反映のお知らせ、却下した拠点へ理由つきのお知らせを送りました。</Inline>}
      </div>
    </div>
  );

  const body: Record<ATab, React.ReactNode> = { req: info, chg, imp, board };
  return (
    <div id="apx">
      <div className="page" id="apxbody">
        <PageHead crumb={[{ t: '契約申請管理', on: back }, '申請詳細']} title="申請詳細" id={a.no} badge={<Bg>{st.t}</Bg>} actions={acts} />
        <div className="apx-narrow">
          <section className="es-card ptabs">
            <Tabs items={P.map(([k, l]) => ({
              key: k, label: l + (k === 'imp' && need && !a.done ? '（要入力）' : ''), on: atab === k, onClick: () => go(k),
              count: k === 'board' && pend && !a.done ? pend : k === 'imp' && need && !a.done ? need : null,
            }))} />
          </section>
          {body[atab]}
        </div>
      </div>
      {approving !== null && (
        <ApproveDialog a={a} i={approving} onClose={() => setApproving(null)} onDone={(msg) => { setApproving(null); toast(msg); }} />
      )}
      {rejecting !== null && (
        <RejectModal a={a} b={a.branches[rejecting]} onClose={() => setRejecting(null)}
          onOk={async (why, note) => {
            try {
              await api.action('reject', { no: a.no, i: rejecting, why, note });
              toast(`${a.branches[rejecting].name} を却下しました。法人へ理由つきのお知らせを送ります`);
              setRejecting(null);
            } catch (e) { toastError(e); }
          }} />
      )}
    </div>
  );
}

/** 承認の前にする設定（入れた値はすぐ保存する。処理済みの拠点は参照だけ） */
function SetForm({ a, b, i, items }: { a: ChangeApp; b: ChangeBranch; i: number; items: SetItem[] }) {
  const { toastError } = useOps();
  const ro = !!a.done || !!b.res.st;
  const save = (k: string, v: string | boolean) => api.action('setValue', { no: a.no, i, k, v }).catch(toastError);
  return (
    <div className="es-formgrid">
      {items.map((f) => {
        const x = setValueOf(b, f);
        const req = f.req ? <span className="es-field__req">必須</span> : null;
        if (f.t === 'check') return <div key={f.k} className="es-span-3"><Check checked={!!x} disabled={ro} onChange={(v) => save(f.k, v)}>{f.l}{req}</Check></div>;
        const err = !!f.req && !String(x).trim() && !ro;
        return (
          <div key={f.k} className={`es-field${err ? ' es-field--error' : ''}`}>
            <label className="es-field__label">{f.l}{req}</label>
            {f.t === 'sel'
              ? <div className="es-input es-input--md es-select"><select value={String(x)} disabled={ro} onChange={(e) => save(f.k, e.target.value)}>{(f.o || []).map((o) => <option key={o}>{o}</option>)}</select></div>
              : <SetText value={String(x)} type={f.t === 'date' ? 'date' : 'text'} ph={f.ph} ro={ro} onCommit={(v) => save(f.k, v)} />}
            {f.h && <p className="es-field__msg">{f.h}</p>}
          </div>
        );
      })}
    </div>
  );
}
/** 文字・日付の欄：入力中は手元に持ち、確定（change）したら保存する */
function SetText({ value, type, ph, ro, onCommit }: { value: string; type: string; ph?: string; ro: boolean; onCommit: (v: string) => void }) {
  const [v, setV] = useState(value);
  useEffect(() => { setV(value); }, [value]);
  const commit = (nv: string) => { if (nv !== value) onCommit(nv); };
  return (
    <div className={`es-input es-input--md${ro ? ' es-input--disabled' : ''}`}>
      {type === 'date'
        ? <DateInput fill value={v} readOnly={ro} onChange={(e) => { setV(e.target.value); commit(e.target.value); }} />
        : <input type={type} value={v} placeholder={ph} readOnly={ro}
          onChange={(e) => setV(e.target.value)}
          onBlur={(e) => commit(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') commit((e.target as HTMLInputElement).value); }} />}
    </div>
  );
}

/** 承認のダイアログ（確認チェック必須。締切後は開始月の扱いを選ぶ） */
function ApproveDialog({ a, i, onClose, onDone }: { a: ChangeApp; i: number; onClose: () => void; onDone: (msg: string) => void }) {
  const { toastError } = useOps();
  const b = a.branches[i], I = setItems(a, b), dl0 = deadline(a, today());
  const [ok, setOk] = useState(false);
  const [checks, setChecks] = useState<Record<string, boolean>>({});
  const [texts, setTexts] = useState<Record<string, string>>(() => Object.fromEntries((a.approveFields || []).filter((f) => !f.check && !f.opts).map((f) => [f.key, f.text || ''])));
  const [sels, setSels] = useState<Record<string, string>>(() => Object.fromEntries((a.approveFields || []).filter((f) => f.opts).map((f) => [f.key, f.opts![0]])));
  const [late, setLate] = useState(LATE[0]);
  /* 移行割 DC000021：対象ならあらかじめチェック・運営が外せる（台帳 2026/10/03） */
  const [migrate, setMigrate] = useState(true);
  /* 冷蔵庫→自販機の開始月（運営が決める。既定は法人の希望月、間に合わなければいちばん早い月） */
  const [vmStart, setVmStart] = useState(() => (b.vmStarts?.includes(a.start ?? '') ? a.start! : b.vmStarts?.[0] ?? ''));
  const [err, setErr] = useState<{ msg: string; badTexts: string[] } | null>(null);

  const submit = async () => {
    const e = approveError(a, { ok, checks, texts });
    if (e.msg) { setErr(e); return; }
    const lateV = dl0 && dl0.d < 0 && !b.toVm ? late : '';
    try {
      const out = await api.action('approve', { no: a.no, i, ok, checks, texts, late: lateV, ...(b.migrate ? { migrate } : {}), ...(b.toVm ? { startCycle: vmStart } : {}) });
      onDone(`${b.name} を承認しました${lateV ? `（締切後のため：${lateV}）` : ''}。法人へお知らせを送ります${out?.note ? `。${out.note}` : ''}`);
    } catch (x) { toastError(x); }
  };
  /* RV3-OPS-20261002 #5：エラーを出したら、エラーの所までスクロールする */
  useEffect(() => {
    if (!err) return;
    const el = document.querySelector('.es-dialog .es-field--error') || document.getElementById('apxErr');
    el?.scrollIntoView({ block: 'center' });
  }, [err]);

  return (
    <Dialog title={`${b.name} の ${a.kind} を承認しますか？`} width="900px" onClose={onClose}
      foot={<><Btn variant="outline" onClick={onClose}>キャンセル</Btn><Btn onClick={submit}>承認する</Btn></>}>
      <p className="dsx-desc">{b.head}</p>
      <PauseBlock a={a} b={b} />
      <CxlBlock a={a} b={b} />
      <ImpactTable b={b} />
      {b.migrate && (
        <label style={{ display: 'flex', gap: '0.571429rem', alignItems: 'flex-start', margin: '0.571429rem 0' }}>
          <input type="checkbox" checked={migrate} onChange={(e) => setMigrate(e.target.checked)} style={{ marginTop: '0.285714rem' }} />
          <span><b>移行割（DC000021）を付ける</b><span className="mm" style={{ display: 'block' }}>旧ライト→スタンダードの移行。外すと移行割だけ付けません（ほかの費目は変わりません）</span></span>
        </label>
      )}
      <BilledBlock a={a} b={b} />
      <LockedBlock a={a} b={b} />
      <BeforeCheckNote a={a} />
      <NoticeBlock a={a} b={b} />
      {I.length > 0 && (
        <>
          <div className="secttl">承認の前にした設定</div>
          <Table head={['設定', '内容']}>
            {I.map((f) => { const x = setValueOf(b, f); return <tr key={f.k}><td>{f.l}</td><td><b>{f.t === 'check' ? (x ? '確認済' : '—') : (String(x) || '—')}</b></td></tr>; })}
          </Table>
        </>
      )}
      {(a.approveFields || []).map((f) => {
        if (f.check) return <div key={f.key}><Check checked={!!checks[f.key]} onChange={(v) => setChecks({ ...checks, [f.key]: v })}>{f.check}</Check></div>;
        if (f.opts) return <Field key={f.key} label={f.label}><Select value={sels[f.key]} opts={f.opts} onChange={(v) => setSels({ ...sels, [f.key]: v })} /></Field>;
        return (
          <Field key={f.key} label={f.label} req msg={f.hint} error={!!err?.badTexts.includes(f.key) && !String(texts[f.key] ?? '').trim()}>
            <Input value={texts[f.key] ?? ''} onChange={(v) => setTexts({ ...texts, [f.key]: v })} />
          </Field>
        );
      })}
      {b.toVm && (
        <>
          <div className="secttl">冷蔵庫→自販機：開始月</div>
          <Field label="自販機に切り替える開始月（承認のときに決める）" req msg="法人の希望月は参考。現場調査・自販機の手配に合わせて選びます">
            <Select value={vmStart} opts={b.vmStarts ?? []} onChange={setVmStart} />
          </Field>
        </>
      )}
      {dl0 && dl0.d < 0 && !b.toVm && (
        <>
          <div className="secttl">オーダー締切を過ぎています：開始月の扱い</div>
          <Field label="開始月の扱い（承認のときに選ぶ）" req msg="繰り下げる＝開始サイクル月を1つ後ろに直し、お客様へのお知らせに書きます。代理でオーダーする＝今月分は運営が代わりにオーダーを入れ、開始月は変えません。">
            <Select value={late} opts={LATE} onChange={setLate} />
          </Field>
        </>
      )}
      <p className="es-field__msg">{a.kind === '法人情報の変更' ? '承認すると、法人へお知らせメールを1通送ります（法人単位）。' : '承認すると、法人へこの拠点のお知らせメールを送ります。'}</p>
      <div><Check checked={ok} onChange={setOk}>変更される項目・影響・設定を確認しました</Check></div>
      {err && <p className="es-field__msg es-field__msg--error" id="apxErr">{err.msg}</p>}
    </Dialog>
  );
}
/** 却下（理由は必須・28-25）。法人へこの拠点の却下のお知らせを理由つきで送る */
function RejectModal({ b, onClose, onOk }: { a: ChangeApp; b: ChangeBranch; onClose: () => void; onOk: (why: string, note: string) => void }) {
  const [why, setWhy] = useState('');
  const [note, setNote] = useState('');
  const [err, setErr] = useState(false);
  return (
    <DsModal tone="negative" title={`${b.name} の申請を却下しますか？`} onCancel={onClose} confirmLabel="却下する"
      onConfirm={() => { if (!why) { setErr(true); return; } onOk(why, note); }}>
      却下の理由は必須です。法人へ、この拠点の却下のお知らせを理由つきで送ります。
      <Field label="却下の理由" req error={err && !why}>
        <Select value={why} opts={AP_REJECT_REASONS} ph="選択してください" onChange={(v) => { setWhy(v); setErr(false); }} />
      </Field>
      <Field label="お客様へのひとこと（任意）">
        <Textarea value={note} onChange={setNote} ph="例）設置場所の寸法を確認のうえ、あらためてお申し込みください。" />
      </Field>
      {err && !why && <p className="es-field__msg es-field__msg--error">却下の理由を選んでください。</p>}
    </DsModal>
  );
}
