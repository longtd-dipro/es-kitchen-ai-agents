'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@/lib/ops/core/client';
import type { EquipFee, EquipProposal, EquipRow, NewSetup, SetupBranch } from '@/lib/domain/types';
import type { ChangeApp, ChangeBranch } from '@/lib/ops/applications/types';
import { fmtDatesIn } from '@/lib/format/date';
import { useOps } from '../../_ui/OpsProvider';
import { useCanAct } from '../../_ui/perm';
import { api } from './api';
import { useRefData } from '../../agency/_components/common';
import { Badge, Btn, Check, Field, Inline, Input, Select, Table, Textarea } from './ds';
import { yen } from '@/lib/format/money';

/*
 * 申請の承認で共通データを変えるための画面の部品（lib/domain/lifecycle.ts・課題 3-2・3-6・3-7）。
 *   EquipEditor  … 設備の異動の案（行と費用の案）を直して保存する。承認・本登録のときにこの案で貸出・子契約の費用を変える
 *   PlanEquipBlock … 変更申請（プランの変更）の「影響と設定」に出す
 *   SetupPanel   … 新規申込の受付画面：仮登録 → 拠点ごとの必須の情報 → 本登録（運営が確かめてから）
 */

const ACTIONS: EquipRow['action'][] = ['継続', '入替', '追加', '回収'];
const KINDS: EquipFee['kind'][] = ['単発', '月額'];

/** 設備の異動の案（行・費用の案）。ro＝処理済み */
export function EquipEditor({ no, i, branchId, initial, saved, ro, mode }: { no: string; i?: number; branchId?: string; initial: EquipProposal; saved: boolean; ro: boolean; mode: 'plan' | 'trial' | 'equip' }) {
  const { toast, toastError } = useOps();
  const canAct = useCanAct();
  const { data: m } = useQuery(api, 'masters');
  const [p, setP] = useState<EquipProposal>(initial);
  const [dirty, setDirty] = useState(false);
  const key = JSON.stringify(initial);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (!dirty) setP(JSON.parse(key)); }, [key]);
  const models = m?.models ?? [];
  const nameOf = (id: string) => (id ? models.find((x) => x.id === id)?.name ?? id : '—');
  const change = (next: EquipProposal) => { setP(next); setDirty(true); };
  const setRow = (k: number, patch: Partial<EquipRow>) => change({ ...p, rows: p.rows.map((x, j) => (j === k ? { ...x, ...patch } : x)) });
  const setFee = (k: number, patch: Partial<EquipFee>) => change({ ...p, fees: p.fees.map((x, j) => (j === k ? { ...x, ...patch } : x)) });
  const save = async (recalc: boolean) => {
    try {
      await api.action('saveEquipment', { no, i, branchId, proposal: p, recalc });
      setDirty(false);
      toast(recalc ? '行から費用の案を作り直して保存しました' : '設備の異動の案を保存しました');
    } catch (e) { toastError(e); }
  };
  const addRow = (category: EquipRow['category']) => change({ ...p, rows: [...p.rows, { category, action: '追加', fromModelId: '', toModelId: '', qty: 1, loanId: '', note: '' }] });
  const reset = async () => {
    try { await api.action('resetEquipment', { no, i, branchId }); setDirty(false); toast('今のデータから案を作り直しました'); } catch (e) { toastError(e); }
  };
  const on = p.fees.filter((f) => f.on);
  const once = on.filter((f) => f.kind === '単発').reduce((a, f) => a + f.amountYen, 0), monthly = on.filter((f) => f.kind === '月額').reduce((a, f) => a + f.amountYen, 0);
  return (
    <>
      <div className="secttl">設備の異動の案 {saved ? <Badge tone="info">運営が直した案</Badge> : <Badge>自動の案</Badge>}{dirty && <> <Badge tone="warning">未保存</Badge></>}</div>
      <p className="es-field__msg">
        {mode === 'equip'
          ? '今の貸出を並べた案です。お客様の申請に合わせて、行の「異動」を入替（異動後の機種を選ぶ）・追加・回収に直し、「行から費用の案を作り直す」で費用の案（配送・サイズ差額・追加の月額）を作ってください。回収の配送はシステムでは作りません。承認すると、この案で貸出と子契約の費用を変えます（確定・請求済の月の費用は調整明細で次の請求書に載ります）。'
          : mode === 'plan'
          ? '今の貸出とプランの標準貸出設備を比べた案です（入替＝大きいサイズへ・追加・回収）。回収の配送はシステムでは作りません（回収したら貸出を「回収済」に）。承認すると、この案で貸出と子契約の費用を変えます。'
          : 'お試しで置いた設備とプランの標準貸出設備を比べた案です。多い・大きい分は本導入の最初の請求書で1回だけいただきます（少ないときは返金しません）。本登録で反映します。'}
      </p>
      <Table head={['区分', '異動', '今の機種', '異動後の機種', { t: '台数', w: '90px' }, 'メモ']}>
        {p.rows.map((x, k) => (
          <tr key={k}>
            <td>{x.category}</td>
            <td><Select size="sm" value={x.action} opts={ACTIONS} disabled={ro} onChange={(v) => setRow(k, { action: v as EquipRow['action'] })} /></td>
            <td>{nameOf(x.fromModelId)}{x.loanId && <div className="mm">{x.loanId}</div>}</td>
            <td>{x.action === '回収' || x.action === '継続' ? nameOf(x.action === '継続' ? x.fromModelId : '')
              : <Select size="sm" value={x.toModelId} ph="選択してください" disabled={ro} opts={models.filter((y) => y.category === x.category).map((y) => ({ v: y.id, t: `${y.name}（月額 ${yen(y.monthlyYen)}）` }))} onChange={(v) => setRow(k, { toModelId: v })} />}</td>
            <td>{ro ? x.qty : <Input size="sm" type="number" value={String(x.qty)} onChange={(v) => setRow(k, { qty: Math.max(1, Math.floor(Number(v) || 1)) })} />}</td>
            <td>{ro ? x.note : <Input size="sm" value={x.note} onChange={(v) => setRow(k, { note: v })} />}</td>
          </tr>
        ))}
        {!p.rows.length && <tr><td colSpan={6} className="mut">異動はありません</td></tr>}
      </Table>
      {!ro && (
        <div style={{ display: 'flex', gap: '0.571429rem', margin: '0.571429rem 0' }}>
          {[...new Set(['冷蔵庫', '冷凍庫', ...(mode === 'equip' ? models.map((x) => x.category) : [])])].map((c) => (
            <Btn key={c} size="sm" variant="outline" onClick={() => addRow(c as EquipRow['category'])}>{c}の行を足す</Btn>
          ))}
        </div>
      )}
      <div className="secttl">費用の案（税抜・承認の前に直せる）</div>
      <Table head={[{ t: '請求', w: '60px' }, '費目', { t: '金額（税抜）', w: '130px', align: 'right' }, { t: '単発／月額', w: '110px' }, '根拠']}>
        {p.fees.map((f, k) => (
          <tr key={f.key + k}>
            <td><Check checked={f.on} disabled={ro} onChange={(v) => setFee(k, { on: v })}>{''}</Check></td>
            <td>{f.name}</td>
            <td className="r">{ro ? yen(f.amountYen) : <Input size="sm" num type="number" value={String(f.amountYen)} onChange={(v) => setFee(k, { amountYen: Math.max(0, Math.floor(Number(v) || 0)) })} />}</td>
            <td><Select size="sm" value={f.kind} opts={KINDS} disabled={ro} onChange={(v) => setFee(k, { kind: v as EquipFee['kind'] })} /></td>
            <td className="mm">{f.basis}</td>
          </tr>
        ))}
        {!p.fees.length && <tr><td colSpan={5} className="mut">費用はありません</td></tr>}
        <tr className="tot"><td /><td>合計（請求する分・税抜）</td><td className="r"><b>{yen(once)}</b>{monthly ? <div className="mm">月額 {yen(monthly)}</div> : null}</td><td colSpan={2} /></tr>
      </Table>
      <Field label="メモ（運営だけ）"><Textarea value={p.note} rows={2} onChange={(v) => change({ ...p, note: v })} ph="例）エレベーターなし3階のため入れ替えの配送 +3,000円" /></Field>
      {!ro && (
        <div style={{ display: 'flex', gap: '0.571429rem', justifyContent: 'flex-end' }}>
          {/* 権限がなければ出さない */}
          {saved && canAct(api, 'resetEquipment') && <Btn variant="outline" size="sm" onClick={reset}>自動の案に戻す</Btn>}
          {canAct(api, 'saveEquipment') && <Btn variant="outline" size="sm" onClick={() => save(true)}>行から費用の案を作り直す</Btn>}
          {canAct(api, 'saveEquipment') && <Btn size="sm" disabled={!dirty} onClick={() => save(false)}>案を保存</Btn>}
        </div>
      )}
      {p.updatedAt && <p className="es-field__msg">最終更新 {fmtDatesIn(p.updatedAt)}　{p.updatedBy}</p>}
    </>
  );
}

/** 変更申請（プランの変更・設備の変更）の設備の異動の案 */
export function PlanEquipBlock({ a, b, i }: { a: ChangeApp; b: ChangeBranch; i: number }) {
  const { data } = useQuery(api, 'equipment', { no: a.no, i });
  if ((a.kind !== 'プランの変更' && a.kind !== '設備の変更') || !data) return null;
  return <EquipEditor no={a.no} i={i} initial={data.proposal} saved={data.saved} ro={!!a.done || !!b.res.st} mode={a.kind === '設備の変更' ? 'equip' : 'plan'} />;
}

/* ---------- 新規申込：仮登録 → 本登録 ---------- */

/** 受付画面の「共通データの登録」：仮登録（法人・拠点・親契約・アカウント…）と拠点ごとの本登録（子契約・配送・貸出…） */
export function SetupPanel({ no }: { no: string }) {
  const { toast, toastError } = useOps();
  const canAct = useCanAct();
  const { data } = useQuery(api, 'setup', { no });
  const { data: m } = useQuery(api, 'masters');
  const [s, setS] = useState<NewSetup | null>(null);
  const [dirty, setDirty] = useState(false);
  const key = JSON.stringify(data?.setup ?? null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (!dirty) setS(JSON.parse(key)); }, [key]);
  /* hooks は早期 return より前に呼ぶ（B1：後に置くと描画ごとに hooks の数が変わって白画面になる） */
  const ref = useRefData();
  if (!data || !s) return null;
  const st = data.status;
  if (!['受付中', '契約設定中', '完了'].includes(st)) return null;
  const setB = (k: number, patch: Partial<SetupBranch>) => { setS({ ...s, branches: s.branches.map((x, j) => (j === k ? { ...x, ...patch } : x)) }); setDirty(true); };
  const run = async (p: Promise<unknown>, msg: string) => { try { const out = await p; setDirty(false); toast(msg + (typeof out === 'object' && out && 'note' in out && (out as { note: string }).note ? `（${(out as { note: string }).note}）` : '')); } catch (e) { toastError(e); } };
  /* 紹介元（代理店・法人）の選択肢は上の ref。代理店・紹介の権限がなければ取れないので、取れたときだけ出す */
  const save = () => run(api.action('saveSetup', { no, setup: s }), '受付の内容を保存しました');
  return (
    <div className="card acc">
      <h2>受付のそのほかの設定（共通データ）<span className="r"><Badge tone={st === '完了' ? 'success' : 'info'}>{st}</Badge></span></h2>
      <div className="pad">
        <p className="es-field__msg">
          拠点の基本情報・住所・担当者・プラン・配送ルート・設備は、下の「詳細情報設定」の各タブで入れて『保存』します（保存すると共通データに入ります）。
          ここには、タブにない設定（開始サイクル月・基準数のパターン・初期費用）を置きます。仮登録は『申込内容の確認を完了』、本登録は拠点ごとの『この拠点を本登録』で行います。
          オーダー締切（開始サイクルの前月15日）を過ぎていたら、開始月の扱い（翌サイクルへ繰り下げ／運営が代理でオーダー）を、申込内容確認の「開始スケジュール」タブで選びます。
        </p>
        <div className="es-formgrid">
          <Field label="開始サイクル月"><Input value={s.startCycle} onChange={(v) => { setS({ ...s, startCycle: v }); setDirty(true); }} ph="2026-11" /></Field>
          {ref && (<>
            {/* 紹介元は運営が承認（受付）のときに入れる（受付簿 #399）。代理店か法人のどちらか一方 */}
            <Field label="紹介元（代理店）" msg="有効な代理店だけ選べます。親契約の代理店コードになり、紹介履歴が自動で作られます">
              <Select value={s.agencyId ?? ''} ph="紹介なし" opts={[{ v: '', t: '（紹介なし）' }, ...ref.agencies.filter((a) => a.status === '有効' || a.id === s.agencyId).map((a) => ({ v: a.id, t: `${a.id} ${a.name}` }))]}
                onChange={(v) => { setS({ ...s, agencyId: v, srcCorpId: v ? '' : s.srcCorpId }); setDirty(true); }} />
            </Field>
            <Field label="紹介元（法人・企業紹介）" msg="紹介元の法人があるとき。紹介履歴（企業紹介）が作られます。代理店とは同時に選べません">
              <Select value={s.srcCorpId ?? ''} ph="紹介なし" opts={[{ v: '', t: '（紹介なし）' }, ...ref.corps.map((c) => ({ v: c.id, t: `${c.id} ${c.name}` }))]}
                onChange={(v) => { setS({ ...s, srcCorpId: v, agencyId: v ? '' : s.agencyId }); setDirty(true); }} />
            </Field>
          </>)}
        </div>
        {s.notes.map((n, k) => <Inline key={k} tone="info">{n}</Inline>)}
        {s.branches.map((b, k) => {
          const v = data.branches[k], done = b.stage === '本登録';
          return (
            <div key={k} style={{ borderTop: '1px solid var(--divider-low)', marginTop: '0.857143rem', paddingTop: '0.857143rem' }}>
              <div className="secttl">{b.name || '（拠点名なし）'} {b.branchId && <span className="idc">{b.branchId} ／ {b.contractId}</span>} <Badge tone={done ? 'success' : b.stage ? 'info' : 'neutral'}>{b.stage || '未登録'}</Badge>{v?.trial && <> <Badge tone="warning">お試し→本導入（同じ親契約）</Badge></>}</div>
              {!done && (
                <div className="es-formgrid">
                  {/* REQ-CT-300：基準数のパターン（申込の値。仮登録・本登録で拠点の注文の設定に入れる。自販機は自販機の基準数） */}
                  {b.course !== 'ESライト（自販機）' && <Field label="基準数のパターン" msg="短消費期限なし＝消費期限の短い商品をデフォルト注文に入れない（料金は同じ）"><Select value={b.noShortLife ? '短消費期限なし' : '通常'} opts={['通常', '短消費期限なし']} onChange={(x) => setB(k, { noShortLife: x === '短消費期限なし' })} /></Field>}
                  {/* 初期費用（OP000008・契約ごとに1回・当月の請求書の調整明細）。お試し・切替でも出す（台帳 E 2026-10-05）。空欄＝機種マスタ・OP000008 の金額。0＝請求しない */}
                  <Field label="初期費用（税抜）" msg={`空欄＝マスタの金額（${yen(v?.initFeeDefaultYen ?? 0)}）。0円＝請求しない${v?.trial ? '。お試しの本登録で請求済みなら付きません' : ''}`}>
                    <Input num type="number" value={b.initFeeYen === undefined ? '' : String(b.initFeeYen)} ph={String(v?.initFeeDefaultYen ?? 0)}
                      onChange={(x) => setB(k, { initFeeYen: x.trim() === '' ? undefined : Math.max(0, Math.floor(Number(x) || 0)) })} />
                  </Field>
                </div>
              )}
              {v?.trial && v.equipment && b.branchId && !done && (
                <EquipEditor no={no} branchId={b.branchId} initial={v.equipment} saved={false} ro={false} mode="trial" />
              )}
            </div>
          );
        })}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.571429rem', marginTop: '0.857143rem' }}>
          {dirty && <Btn variant="outline" onClick={() => { setDirty(false); setS(JSON.parse(key)); }}>元に戻す</Btn>}
          {/* 権限がなければ出さない */}
          {canAct(api, 'saveSetup') && <Btn variant="outline" disabled={!dirty} onClick={save}>受付の内容を保存</Btn>}
        </div>
        {dirty && <p className="es-field__msg">保存してから本登録できます。</p>}
        {data.history.length > 0 && (
          <>
            <div className="secttl" style={{ marginTop: '0.857143rem' }}>変更履歴</div>
            <Table head={['日時', '変更内容', '変更者']}>
              {data.history.map((h) => <tr key={h.id}><td>{fmtDatesIn(h.at)}</td><td>{h.detail}</td><td>{h.accountId}</td></tr>)}
            </Table>
          </>
        )}
      </div>
    </div>
  );
}
