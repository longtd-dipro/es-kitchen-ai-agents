'use client';

import { useOpsLeaveGuard } from '@/app/ops/_ui/leaveGuard';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import { ApiError } from '@/lib/api/errors';
import type { AdjOp } from '@/lib/ops/areas/billing';
import { addM, billingLogic, checkAdjLine, jm, sign, yen, type BillingLogic } from '@/lib/ops/billing/logic';
import { LEADLBL } from '@/lib/ops/billing/masters';
import type { AdjLine, Br, Tax } from '@/lib/ops/billing/types';
import { useOps } from '../../../../_ui/OpsProvider';
import { Btn, Card, Foot, Inline, Inp, Meta, PageHead, Ro, Sel, SumGrid, Table, Tabs, Tag, useAsk } from '../../../_components/ds';
import { R, pLabel, useBilling } from '../../../_components/useBilling';
import { useScreenCan } from '../../../../_ui/perm';
import { fmtDate, fmtDatesIn, fmtDateTime } from '@/lib/format/date';
import { TaxRateSelect } from '@/app/ops/_ui/TaxRateSelect';

type Tab = 'fix' | 'act' | 'adj';

/** 請求詳細・請求編集（子契約ごとの ① 固定額・② 実績精算・③ 調整）。元の vBranch・vBranchPast */
export default function SubDetail({ edit }: { edit: boolean }) {
  const { id } = useParams<{ id: string }>();
  const sp = useSearchParams();
  const { L } = useBilling();
  if (!L) return null;
  const b = L.br(id);
  if (!b) return <Inline tone="warning">拠点が見つかりません。</Inline>;
  const m = (!edit && sp.get('m')) || L.month;
  if (m < L.month) return <SubPast L={L} b={b} m={m} />;
  const tab = (edit ? 'adj' : (sp.get('tab') as Tab)) || 'fix';
  return <SubNow key={b.id + String(edit)} L={L} b={b} edit={edit && !L.editLock(b) && !b.fixOK} tab0={tab} />;
}

const KINDS: [AdjLine['kind'], string][] = [['spot', 'スポット費用（次回請求分）'], ['init', '初期費用（当月請求）'], ['adj', 'その他の調整']];

function SubNow({ L, b: bLive, edit, tab0 }: { L: BillingLogic; b: Br; edit: boolean; tab0: Tab }) {
  const router = useRouter();
  const ask = useAsk();
  const { toast } = useOps();
  const { run, can } = useBilling();
  const screenCan = useScreenCan();
  const [tab, setTab] = useState<Tab>(tab0);
  const [ops, setOps] = useState<AdjOp[]>([]);
  const months = [0, 1, 2, 3].map((i) => addM(L.month, i));
  const [f, setF] = useState({ n: '', kind: 'spot' as AdjLine['kind'], rep: 'once' as AdjLine['rep'], m: months[1], to: '', t: '10', a: '' });
  /* 編集中は、追加・終了・削除を当てた状態で見せる（保存するまで請求には効かない） */
  const D = useMemo(() => {
    if (!ops.length) return L;
    const d = billingLogic(structuredClone(L.S));
    ops.forEach((o) => applyOp(d, bLive.id, o));
    return d;
  }, [L, ops, bLive.id]);
  const b = D.br(bLive.id)!, c = D.co(b.co), lock = D.editLock(b), inv = D.invNow(b);
  const nm = edit ? '請求編集' : '請求詳細';
  const back = () => router.push(R.sub(b.id, undefined, 'adj'));
  const tryOp = (o: AdjOp) => {
    try {
      const msg = applyOp(billingLogic(structuredClone(D.S)), b.id, o);
      setOps((x) => [...x, o]);
      if (msg) toast(msg);
      return true;
    } catch (e) { toast(e instanceof ApiError ? e.message : String(e)); return false; }
  };
  const add = () => {
    const x = { n: f.n, a: Number(f.a || 0), t: Number(f.t) as Tax, kind: f.kind, m: f.m, rep: f.rep, to: f.to };
    const err = checkAdjLine(L.month, x);
    if (err) { toast(err); return; }
    if (tryOp({ op: 'add', x })) setF((v) => ({ ...v, n: '', a: '' }));
  };
  const save = async () => { if (await run('saveAdj', { id: b.id, ops })) back(); };
  useOpsLeaveGuard(ops.length > 0);
  const cancel = () => (ops.length ? ask({ tone: 'negative', title: '編集内容を破棄しますか？', body: '編集中の内容は保存されません。編集内容を破棄してもよろしいですか？', ok: '破棄', onOk: back }) : back());
  const lead = D.leadOf(b), tgt = D.tgtM(b), fr = D.fixRows(b), k = D.calc(b), dis = !edit || lock || b.fixOK;

  return (
    <>
      <PageHead crumbs={[{ t: '請求' }, { t: '請求の確定・請求書', href: R.cfm }, { t: nm }]} title={nm} id={D.subNo(b, L.month)}
        actions={edit ? <><Btn onClick={cancel}>キャンセル</Btn><Btn kind="pri" onClick={save}>保存</Btn></>
          /* 権限がなければ出さない */
          : <>{inv || !can('setFix') ? null : D.brOK(b) ? <Btn kind="red" onClick={() => run('setFix', { id: b.id, v: false })}>確定を解除</Btn>
            : <Btn onClick={() => run('setFix', { id: b.id, v: true })}>{b.actOK ? 'この子契約を確定' : 'この子契約を確定（実績精算は翌月の請求書で精算）'}</Btn>}
            {!lock && !b.fixOK && screenCan('update') && <Btn kind="pri" onClick={() => router.push(R.subE(b.id))}>編集</Btn>}</>} />
      <Meta>
        <Tag>{b.name}</Tag>
        {b.fixOK ? <Tag c="ok">① 固定額 確定</Tag> : <Tag c="wait">① 固定額 未確定</Tag>}
        {b.actOK ? <Tag c="ok">② 実績精算 確定</Tag> : <Tag c="wait">② 実績精算 未確定</Tag>}
        {D.brOK(b) && <Tag c="ok">子契約 確定済</Tag>}
        {inv ? <Tag c="info">請求書 {inv.id}（{inv.status}）</Tag> : <Tag>請求書 未作成</Tag>}
        <Tag>{LEADLBL[c.lead]}</Tag>
        {b.fixLines.some((l) => l.tim === 'Y') && <Tag c="pur">1年一括前払いの費目あり</Tag>}
        <Tag>{c.name} {c.code}</Tag>
      </Meta>
      <SumGrid items={[
        { k: `前払い（${jm(tgt)}分）`, v: yen(D.advTot(b)), s: '固定額' },
        { k: '後払い（9/21〜10/20）', v: yen(D.arrTot(b)), s: '実績精算' },
        { k: '当月の調整', v: yen(D.adjTot(b)), s: `${b.adj.filter((l) => D.adjOn(l, L.month)).length}件 適用中 ／ 登録 ${b.adj.length}件` },
        { k: '子契約の合計（税抜）', v: yen(D.brTot(b)), s: inv ? <><Link className="es-mono" href={R.grp(inv.id)}>{inv.id}</Link> に計上</> : `${addM(L.month, 1)}-01 発行の請求書に載る予定` },
      ]} />
      <Tabs cur={tab} onPick={setTab} items={[
        { k: 'fix' as const, label: '① 固定額（前払い）' },
        { k: 'act' as const, label: <>② 実績精算（後払い）<span className="small" style={{ marginLeft: '0.285714rem' }}>サマリ</span></> },
        { k: 'adj' as const, label: '③ 調整（単発・繰越）' },
      ]} />

      {tab === 'fix' && (
        <>
          <Inline><b>{c.name} は「{LEADLBL[lead]}」の法人です。</b>
            {addM(L.month, 1)}-01 に出す請求書（請求月 {addM(L.month, 1)}）には、前払いとして <b>{jm(tgt)}分</b> が載ります。
            後払い（実績精算）はリードタイムに関係なく <b>2026-09-21〜10-20</b> の分です。</Inline>
          <Card title="当月の内訳" right={`請求月 ${addM(L.month, 1)} に載る前払い分（対象月 ${jm(tgt)}）`}>
            <Table>
              <thead><tr><th>費目</th><th>支払タイミング</th><th>対象期間</th><th className="r">月額（税抜）</th><th className="c">税率</th><th className="r">当月請求額（税抜）</th></tr></thead>
              <tbody>{fr.map((r) => (
                <tr key={r.id} className={r.amt === 0 ? 'dim' : undefined}>
                  <td>{r.n}</td>
                  <td>{r.tim === 'Y' ? <Tag c="pur">1年一括前払い</Tag> : <Tag>毎月前払い・{LEADLBL[lead]}</Tag>}<div className="small" style={{ whiteSpace: 'normal', maxWidth: '24.285714rem' }}>{r.note}</div></td>
                  <td style={{ whiteSpace: 'normal' }}>{fmtDatesIn(r.period)}{r.state === 'cov' && <> <Tag>カバー済</Tag></>}</td>
                  <td className="r es-num">{yen(r.a)}</td><td className="c">{r.t}%</td>
                  <td className="r es-num" style={r.a < 0 ? { color: '#c02339' } : undefined}>{r.amt === 0 ? '0' : yen(r.amt)}</td>
                </tr>
              ))}</tbody>
              <tfoot><tr><td colSpan={5}>前払い分 合計（当月請求）</td><td className="r es-num">{yen(D.advTot(b))}</td></tr></tfoot>
            </Table>
            <Foot><div className="small">金額は契約マスタから。ここでは変更できません（変更は翌月度から）</div></Foot>
          </Card>
          <Card title="前払いのカバー状況" right="二重請求・請求漏れの確認">
            <Table>
              <thead><tr><th>費目</th><th>カバー済</th><th>当月の請求</th><th>次回の請求月</th><th className="r">次回金額</th></tr></thead>
              <tbody>{fr.filter((r) => r.a > 0).map((r) => (
                <tr key={r.id}><td>{r.n}</td><td>{fmtDatesIn(r.covered)}</td><td>{r.amt ? <Tag c="ok">あり</Tag> : <Tag>なし（前払い済）</Tag>}</td><td>{r.next}</td><td className="r es-num">{yen(r.tim === 'Y' ? r.a * 12 : r.a)}</td></tr>
              ))}</tbody>
            </Table>
            <Inline>数えるのは「<b>対象月 × 費目</b>のマス目が1回ずつ請求されたか」。<b>いつ出したか（リードタイム）は関係ありません。</b><br />
              1年一括の費目は残り11ヶ月ぶん請求が立ちませんが、<b>カバー期間を持っているので請求漏れではない</b>と判定できます。</Inline>
          </Card>
        </>
      )}

      {tab === 'act' && (
        <>
          <Inline><b>実績精算は専用画面で行います。</b>棚卸の結果から精算差額を出す作業と、金額の確定はそちらにまとめました。</Inline>
          <Card title="実績精算のサマリ" right="対象期間 2026-09-21〜10-20 ・ 25日確定">
            <div className="es-formgrid bl-sumgrid">
              <Ro label="現金回収差額" msg={b.cash ? '回収予定 − ドライバーの回収' : '現金利用なし'}><b className="es-num">{b.cash ? sign(k.cashDiff) : '—'}</b></Ro>
              <Ro label="管理ロス 免責超過分" msg={`管理ロス ${yen(k.T.mgYen)} − 免責 ${yen(k.ded)}`}><b className="es-num">{yen(k.over)}</b></Ro>
              <Ro label="請求へ繰入" msg={`この拠点の後払い分 ${yen(D.arrTot(b))}`}><b className="es-num">{sign(k.bill)}</b></Ro>
            </div>
            <Foot>
              <div className="small">{b.filed ? `棚卸 申告済（${fmtDate(b.stockDay)} ／ ${b.by}）` : <span style={{ color: '#c02339' }}>棚卸が未申告です</span>}
                {' '}／ {b.actOK ? <Tag c="ok">② 実績精算 確定済</Tag> : <Tag c="wait">② 実績精算 未確定</Tag>}</div>
              <Btn onClick={() => router.push(R.actD(b.id))}>実績精算詳細へ</Btn>
            </Foot>
          </Card>
        </>
      )}

      {tab === 'adj' && (
        <>
          <Card title="初期費用・スポット費用・調整（単発／繰越）" right="恒久的な変更は契約画面で">
            <Table>
              <thead><tr><th>内容</th><th className="c">区分</th><th className="c">単発／繰越</th><th className="c">請求月</th><th className="c">税率</th><th className="r">金額（税抜）</th>{edit && <th className="c">操作</th>}</tr></thead>
              <tbody>
                {b.adj.map((l, i) => {
                  const on = D.adjOn(l, L.month), ev = l.rep === 'every';
                  return (
                    <tr key={i} style={on ? undefined : { background: '#fbfbfd' }}>
                      <td>{l.n}{l.dm && <div className="small dim">調整明細 {l.dm}（申請の承認で自動{l.dmEdit ? '・金額を直せます' : ''}）</div>}</td>
                      <td className="c">{l.dm ? <Tag c="wait">調整明細（自動）</Tag> : l.kind === 'init' ? <Tag c="info">初期費用</Tag> : l.kind === 'spot' ? <Tag c="pur">スポット費用</Tag> : <Tag>調整</Tag>}</td>
                      <td className="c">{ev ? <Tag c="pur">繰越（毎月）</Tag> : <Tag>単発</Tag>}</td>
                      <td className="c">{ev ? `${l.m}〜${l.to || '無期限'}` : (l.m || L.month)}{!on && <> <Tag c="wait">当月対象外</Tag></>}</td>
                      <td className="c">{l.t}%</td><td className="r es-num">{yen(l.a)}</td>
                      {edit && l.dm && l.dmEdit && <td className="c" style={{ whiteSpace: 'nowrap' }}><DmAdjEdit id={l.dm} a={l.a} /></td>}
                      {edit && !(l.dm && l.dmEdit) && <td className="c" style={{ whiteSpace: 'nowrap' }}>
                        {!l.dm && ev && (!l.to || l.to > L.month) && <><Btn sm onClick={() => tryOp({ op: 'stop', i })}>今月で終了</Btn> </>}
                        {!l.dm && <Btn sm kind="red" onClick={() => tryOp({ op: 'del', i })}>×</Btn>}
                      </td>}
                    </tr>
                  );
                })}
                {!b.adj.length && <tr><td colSpan={edit ? 7 : 6} className="c dim">まだありません</td></tr>}
              </tbody>
              <tfoot><tr><td colSpan={5}>当月（{L.month}）の請求に載る調整 合計</td><td className="r es-num">{yen(D.adjTot(b))}</td>{edit && <td />}</tr></tfoot>
            </Table>
            <div style={{ display: 'flex', gap: '0.571429rem', flexWrap: 'wrap', alignItems: 'flex-end', borderTop: '1px solid #eef0f3', paddingTop: '0.857143rem' }}>
              <div><div className="small">内容（請求書に印字）</div><Inp width={270} ph="冷蔵庫 設置代行" disabled={dis} value={f.n} onChange={(v) => setF({ ...f, n: v })} /></div>
              <div><div className="small">区分</div><Sel width={230} disabled={dis} value={f.kind} onChange={(v) => setF({ ...f, kind: v as AdjLine['kind'] })} opts={KINDS} /></div>
              <div><div className="small">単発／繰越</div><Sel width={190} disabled={dis} value={f.rep} onChange={(v) => setF({ ...f, rep: v as AdjLine['rep'] })} opts={[['once', '単発（その月だけ）'], ['every', '繰越（毎月 継続）']]} /></div>
              <div><div className="small">請求月（繰越は開始月）</div><Sel width={170} disabled={dis || f.kind === 'init'} value={f.m} onChange={(v) => setF({ ...f, m: v })} opts={months.map((x, i) => [x, x + (i === 0 ? '（当月）' : '')])} /></div>
              <div><div className="small">終了月（繰越のみ）</div><Sel width={170} disabled={dis || f.rep !== 'every'} value={f.to} onChange={(v) => setF({ ...f, to: v })} opts={[['', '無期限'], ...[1, 2, 3, 4, 5, 6, 11, 23].map((i): [string, string] => [addM(L.month, i), addM(L.month, i) + ' まで'])]} /></div>
              <div style={{ width: '12.142857rem' }}><div className="small">税率</div><TaxRateSelect by="rate" disabled={dis} value={f.t} onChange={(v) => setF({ ...f, t: v })} /></div>
              <div><div className="small">金額（税抜）</div><Inp type="number" num width={120} disabled={dis} value={f.a} onChange={(v) => setF({ ...f, a: v })} /></div>
              {edit && <Btn kind="pri" disabled={dis} onClick={add}>追加</Btn>}
            </div>
          </Card>
          <Inline><b>何月分の費用かは、請求月とは別に行ごとの「対象期間」で持ちます</b>（費目名にカッコ書きする運用は廃止）。<br />
            <b>単発</b>＝選んだ請求月に1回だけ。<b>繰越</b>＝開始月から毎月ずっと（終了月を決めるか、あとから「今月で終了」）。<br />
            <b>スポット費用は次回請求分に計上し、初期費用は当月請求</b>。運営が請求月を選べるのは<b>将来分だけ</b>です <Tag c="req">REQ-CT-182</Tag><br />
            値引きは契約の費目ではなく<b>値引きマスタ</b>で管理します（ここに手入力しない）。</Inline>
          {D.adjNext(b).length > 0 && (
            <Card title={`翌月（${D.nextM()}）以降に載る費用`} right="繰越の調整と、将来月に予約した費用">
              <Table>
                <thead><tr><th>請求月</th><th>内容</th><th className="c">区分</th><th className="c">単発／繰越</th><th className="c">税率</th><th className="r">金額（税抜）</th></tr></thead>
                <tbody>{D.adjNext(b).map((l, i) => (
                  <tr key={i}><td><Tag c="wait">{l.rep === 'every' ? `${D.nextM()}〜${l.to || '無期限'}` : l.m}</Tag></td><td>{l.n}</td>
                    <td className="c">{l.kind === 'spot' ? 'スポット費用' : l.kind === 'init' ? '初期費用' : '調整'}</td>
                    <td className="c">{l.rep === 'every' ? <Tag c="pur">繰越</Tag> : <Tag>単発</Tag>}</td><td className="c">{l.t}%</td><td className="r es-num">{yen(l.a)}</td></tr>
                ))}</tbody>
              </Table>
            </Card>
          )}
        </>
      )}
      {edit && <Inline>編集できるのは <b>③ 調整（単発・繰越）</b> です。① 固定額は契約から、② 実績精算は実績精算の画面で直します。</Inline>}
    </>
  );
}

/** 共通データの調整明細（解約の設備引揚費）の金額を直す・外す（0円で外す）。すぐ保存する */
function DmAdjEdit({ id, a }: { id: string; a: number }) {
  const { run } = useBilling();
  const [v, setV] = useState(String(a));
  const n = Number(v);
  const ok = v.trim() !== '' && Number.isInteger(n) && n >= 0;
  return (
    <span style={{ display: 'inline-flex', gap: '0.428571rem', alignItems: 'center' }}>
      <Inp sm num width={100} value={v} err={!ok} onChange={setV} /><span>円</span>
      <Btn sm disabled={!ok || n === a} onClick={() => run('editDmAdj', { adjId: id, amountYen: n })}>金額を保存</Btn>
      <Btn sm kind="red" onClick={() => run('editDmAdj', { adjId: id, amountYen: 0 })}>×</Btn>
    </span>
  );
}

/** 調整の操作を当てる（actions の saveAdj と同じ順） */
function applyOp(d: BillingLogic, id: string, o: AdjOp) {
  if (o.op === 'add') return d.addAdj(id, o.x);
  if (o.op === 'stop') return d.stopAdj(id, o.i);
  return d.delAdj(id, o.i);
}

/** 過去の締め月の請求詳細（確定したときの内訳。参照のみ）。元の vBranchPast */
function SubPast({ L, b, m }: { L: BillingLogic; b: Br; m: string }) {
  const mo = L.monthOf(b, m), s = mo?.snap;
  const inv = mo?.inv && mo.inv !== '—' ? mo.inv : '';
  return (
    <>
      <PageHead crumbs={[{ t: '請求' }, { t: '請求の確定・請求書', href: R.cfm }, { t: '請求詳細' }]} title="請求詳細" id={L.subNo(b, m)} />
      <Meta><Tag>{b.name}</Tag><Tag>{L.co(b.co).name || '法人なし'}</Tag><Tag>{pLabel(m, L.month)}</Tag><Tag c="ok">確定済</Tag></Meta>
      <Inline>{pLabel(m, L.month)}は確定済みです。確定したときの記録を表示しています（参照のみ）。</Inline>
      <SumGrid items={[
        { k: `前払い（${jm(mo?.tgt || m)}分）`, v: yen(mo?.adv || 0), s: '固定額' },
        { k: `後払い（${fmtDatesIn(mo?.actPeriod)}）`, v: yen(mo?.arr || 0), s: '実績精算' },
        { k: '調整', v: yen(mo?.adj || 0), s: ' ' },
        { k: '合計', v: yen((mo?.adv || 0) + (mo?.arr || 0) + (mo?.adj || 0)), s: `請求書 ${mo?.inv || '—'}` },
      ]} />
      <Card title="確定したときの内訳（前払い）">
        <Table>
          <thead><tr><th>費目</th><th className="c">税率</th><th className="r">金額（税抜）</th></tr></thead>
          <tbody>{(s?.lines ?? []).map((l, i) => <tr key={i}><td>{l.n}</td><td className="c">{l.t}%</td><td className="r es-num">{yen(l.a)}</td></tr>)}</tbody>
          <tfoot><tr><td colSpan={2}>前払い 合計</td><td className="r es-num">{yen(mo?.adv || 0)}</td></tr></tfoot>
        </Table>
      </Card>
      <Card title="確定の記録">
        <div className="es-formgrid">
          <Ro label="プラン（確定時）">{s?.plan || '—'}／{s?.prName || ''}</Ro>
          <Ro label="確定日時・確定者">{fmtDateTime(mo?.at) || '—'} ／ {mo?.by || '—'}</Ro>
          <Ro label="載った請求書">{inv ? <Link className="es-mono" href={R.grp(inv)}>{inv}</Link> : '—'}</Ro>
        </div>
      </Card>
    </>
  );
}
