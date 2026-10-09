'use client';

import { DEMO } from '@/lib/demo';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { addM, hit, jm, monthsBetween, yen, type BillingLogic, type GroupView } from '@/lib/ops/billing/logic';
import { fieldCsvFilters, OpsCsvExport } from '../../_ui/csv';
import { Btn, Card, Check, Foot, Inline, Meta, PageHead, Pagination, SearchBar, SelBar, Table, Tag, type SearchField } from '../_components/ds';
import NextBtn from '../_components/NextBtn';
import { useInvoiceOps } from '../_components/useInvoiceOps';
import { R, pLabel, useBilling } from '../_components/useBilling';
import { pageOf, usePager } from '@/lib/ui/paging';
import { fmtDate } from '@/lib/format/date';

/** 請求の確定・請求書（1行＝1通の請求書）。元の vConfirm（v1.5）と blSteps */
export default function ConfirmPage() {
  return <Suspense><Confirm /></Suspense>;
}

const INIT = { m: '2026-10', m2: '2026-10', co: '', no: '', gst: '', chg: '', pay: '' };

function Confirm() {
  const sp = useSearchParams();
  const router = useRouter();
  const { L } = useBilling();
  const ops = useInvoiceOps(L);
  const [f, setF] = useState({ ...INIT, m: sp.get('m') || INIT.m, m2: sp.get('m2') || sp.get('m') || INIT.m2, gst: sp.get('gst') || '' });
  const [sel, setSel] = useState<Record<string, boolean>>({});
  const pager = usePager();
  if (!L) return null;
  /* 締め月は「開始月〜終了月」の範囲（同じ月なら1か月）。行は請求書×締め月。操作は当月の行だけ・過去月は確定済みの記録（参照のみ） */
  const m = f.m || L.month, m2 = f.m2 || m, ms = monthsBetween(L.monthChoices(), m, m2), multi = ms.length > 1, hasCur = ms.includes(L.month), pastMs = ms.filter((x) => x < L.month);
  const all = ms.flatMap((mm) => L.groupsOf(mm));
  const cur = hasCur ? all.filter((x) => !x.past) : [];
  const xs = all.filter((x) => {
    const c = x.g.c, bn = x.g.bs.map((b) => b.name + ' ' + b.code + ' ' + L.subNo(b, x.m)).join(' ');
    return (!f.co || hit(f.co, c.name, c.code, bn)) && (!f.no || (x.i && hit(f.no, x.i.id)))
      && (!f.pay || c.pay === f.pay) && (!f.gst || x.st.k === f.gst) && (!f.chg || x.past || (f.chg === 'yes') === x.g.bs.some((b) => L.chgOf(b)));
  });
  const noAct = !hasCur ? 0 : L.S.brs.filter((b) => !b.actOK).length;
  const selectable = (x: GroupView) => !x.past && (x.st.k === 'ready' || x.st.k === 'made');
  const canKeys = xs.filter(selectable).map((x) => x.key);
  const keys = Object.keys(sel).filter((k) => sel[k]);
  const selX = cur.filter((x) => keys.includes(x.key));
  const nMk = selX.filter((x) => x.st.k === 'ready').length, nDs = selX.filter((x) => x.st.k === 'made').length;
  const fields: SearchField[] = [
    { k: 'm', k2: 'm2', type: 'mrange', ph: '締め月', all: false, w: 200, opts: L.monthChoices().map((x) => [x, pLabel(x, L.month)]) },
    { k: 'co', type: 'text', ph: '請求先（法人名・拠点名・ID）', w: 260 },
    { k: 'no', type: 'text', ph: '請求書番号', w: 180 },
    { k: 'gst', type: 'sel', ph: '状態（すべて）', w: 200, opts: [['wait', '子契約の確定待ち'], ['ready', '請求書を作成できます'], ['made', '作成済み・未発行'], ['sent', '発行済'], ['carried', '発行済み（当月で再請求）'], ['wd', '取消済']] },
    { k: 'chg', type: 'sel', ph: '先月からの変更（すべて）', w: 210, opts: [['yes', '変更あり'], ['no', '変更なし']] },
    { k: 'pay', type: 'sel', ph: '支払方法（すべて）', w: 200, opts: [...new Set(all.map((x) => x.g.c.pay).filter((p): p is string => !!p))].map((p): [string, string] => [p, p]) },
  ];
  const pick = (gst: string) => { setF({ ...f, m: L.month, m2: L.month, gst }); setSel({}); };
  return (
    <>
      <PageHead crumbs={[{ t: '請求' }, { t: '請求の確定・請求書' }]} title={multi ? `請求の確定・請求書（締め ${jm(m)}〜${jm(m2)}）` : `請求の確定・請求書（締め ${jm(m)}・${addM(m, 1)}-01 発行）`} actions={
        <OpsCsvExport<GroupView> className="es-btn es-btn--outline es-btn--primary es-btn--md" screen="請求書" filters={fieldCsvFilters(fields, f)} rows={xs}
          columns={[
            ...(multi ? [{ label: '締め月', get: (x: GroupView) => x.m }] : []),
            { label: '法人ID', get: (x) => x.g.c.code }, { label: '請求先', get: (x) => { const b = x.g.bid ? L.br(x.g.bid) : null; return b ? `${x.g.c.id ? x.g.c.name + ' ／ ' : ''}${b.name}` : x.g.c.name; } },
            { label: '子契約の数', type: 'int', get: (x) => x.n }, { label: '状態', get: (x) => x.st.label },
            { label: '請求金額', type: 'money', get: (x) => x.amt }, { label: '請求金額の種類', get: (x) => (x.i ? '税込' : '見込み・税抜') },
          ]}
          source={{ kind: 'dm.billing.invoices', id: (x) => x.i?.id ?? '' }} />
      } />
      <Meta><span className="small">{!hasCur ? (multi ? 'これらの締め月は確定済みです（参照のみ）。' : 'この締め月は確定済みです（参照のみ）。') : '20日締め・25日確定・翌月1日発行。金額は25日の確定で固めます。宛名・送付先（請求先法人名・請求担当者）は発行時の値を使います（確定後〜発行前に変わっても、その月の請求書に入ります）。上の4つを順に進めます。押すと、その手順で対応が必要な請求書だけを表示します（① は実績精算の画面へ）。'}</span></Meta>
      {pastMs.length > 0 && <Inline>{multi ? `${pastMs.map((x) => pLabel(x, L.month)).join('・')}の行` : pLabel(m, L.month)}は確定済みです。確定したときの記録を表示しています（参照のみ）。</Inline>}
      {hasCur && <Steps L={L} xs={cur} onPick={pick} onAct={() => router.push(R.act + '?st=no')} />}
      {hasCur && noAct > 0 && (
        <Inline tone="warning"><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.857143rem' }}>
          <span><b>実績精算が未確定の子契約が {noAct}件</b>あります。前払いの確定・請求書の発行はできます（未確定の実績精算はその請求書に入れず、確定後に翌月の請求書で精算します・REQ-CT-301）。</span>
          <Btn sm onClick={() => router.push(R.act + '?st=no')}>実績精算を開く</Btn></div></Inline>
      )}
      <Card title="請求書" right={`${xs.length}通`}>
        <SearchBar key={JSON.stringify(f)} fields={fields} value={f} init={INIT} onApply={(v) => { setF(v); setSel({}); }} />
        <Table>
          <thead><tr>
            {hasCur && <th className="c" style={{ width: '3.428571rem' }}>{canKeys.length > 0 && <Check label="すべて選択" checked={keys.length > 0 && keys.length === canKeys.length} onChange={(on) => setSel(on ? Object.fromEntries(canKeys.map((k) => [k, true])) : {})} />}</th>}
            {multi && <th>締め月</th>}<th>請求先</th><th>状態</th><th className="r">請求金額</th>{hasCur && <th className="c">次にすること</th>}
          </tr></thead>
          <tbody>
            {pageOf(pager, xs).rows.map((x) => {
              const c = x.g.c, b = x.g.bid ? L.br(x.g.bid) : null;
              const nm = b ? `${c.id ? c.name + ' ／ ' : ''}${b.name}` : c.name;
              const unit = !b ? 'まとめて発行' : (c.id && L.ownBill(b)) ? '請求先＝この拠点' : c.issue === 'merged' ? '拠点で1通' : '拠点ごと発行';
              const ps = x.i ? L.payStatus(x.i) : null, nch = x.past ? 0 : x.g.bs.filter((bb) => L.chgOf(bb)).length;
              const act = x.past ? x.n : x.g.bs.filter((bb) => bb.actOK).length, rq = x.past ? [] : L.carryFor(x.g);
              return (
                <tr key={`${x.m}|${x.key}`} className={sel[x.key] ? 'is-selected' : undefined}>
                  {hasCur && <td className="c">{selectable(x) && <Check checked={!!sel[x.key]} onChange={(on) => setSel((s) => ({ ...s, [x.key]: on }))} />}</td>}
                  {multi && <td style={{ whiteSpace: 'nowrap' }}>{x.m}</td>}
                  <td><Link href={R.grp(L.groupHref(x), x.i ? undefined : x.m)} style={{ fontWeight: 700 }}>{nm}</Link>
                    <div className="small">{c.id ? c.code : '法人なし'} ・ {unit} ・ 子契約 {x.n}件{x.i && <> ・ <span className="es-mono">{x.i.id}</span></>}</div>
                    {nch > 0 && <div style={{ marginTop: '0.285714rem' }}><Tag c="wait">先月から変更 {nch}件</Tag></div>}</td>
                  <td><Tag c={x.st.tone}>{x.st.label}</Tag>{ps && ps[1] !== '—' && <> <Tag c={ps[0]}>{ps[1]}</Tag></>}
                    {x.i?.send && <div className="small" style={{ marginTop: '0.285714rem' }}>Bill One：{x.i.send.status === 'エラー' ? <b style={{ color: 'var(--es-color-negative, #c0392b)' }}>送付エラー</b> : x.i.send.status}</div>}
                    {!x.past && !x.i && <div className="small" style={{ marginTop: '0.285714rem' }}>後払い {act}/{x.n} ・ 前払い {x.ok}/{x.n}</div>}</td>
                  <td className="r es-num"><b>{yen(x.amt)}</b><div className="small">{x.i ? `税込 ・ 入金期限 ${fmtDate(x.i.due)}` : '見込み・税抜'}</div>
                    {rq.length > 0 && <div className="small" style={{ color: '#5b3fb0' }}>＋再請求 {yen(rq.reduce((a, u) => a + L.invRest(u), 0))}</div>}</td>
                  {hasCur && <td className="c" style={{ whiteSpace: 'nowrap' }}>{!x.past && <NextBtn L={L} x={x} sm />}</td>}
                </tr>
              );
            })}
            {!xs.length && <tr><td colSpan={(hasCur ? 5 : 3) + (multi ? 1 : 0)} className="c dim">条件に合う請求書はありません</td></tr>}
          </tbody>
        </Table>
        <Pagination {...pageOf(pager, xs).props} />
        <Foot><div className="small">請求先を押すと請求書詳細を開きます。まとめて作成・発行するときは左のチェックで選びます。</div></Foot>
      </Card>
      {hasCur && (
        <SelBar n={keys.length} onClear={() => setSel({})}>
          {/* 権限がなければ出さない */}
          {nMk > 0 && ops.can('bulkGrp') && <Btn kind="pri" onClick={() => ops.bulk('make', keys, nMk, () => setSel({}))}>請求書を作成（{nMk}通）</Btn>}
          {nDs > 0 && ops.can('bulkGrp') && <Btn kind={nMk ? undefined : 'pri'} onClick={() => ops.bulk('send', keys, nDs, () => setSel({}))}>Bill One で発行（{nDs}通）{DEMO ? '（デモ）' : ''}</Btn>}
        </SelBar>
      )}
    </>
  );
}

/** 今月の作業の4つの手順（元の blSteps） */
function Steps({ L, xs, onPick, onAct }: { L: BillingLogic; xs: GroupView[]; onPick: (gst: string) => void; onAct: () => void }) {
  const bs = xs.flatMap((x) => x.g.bs), nSub = bs.length, act = bs.filter((b) => b.actOK).length, fix = bs.filter(L.brOK).length;
  const made = xs.filter((x) => x.i && x.i.status !== 'WITHDRAWN').length, sent = xs.filter((x) => x.i && (x.i.status === 'DISPATCHED' || x.i.status === 'CARRIED')).length, all = xs.length;
  const cur = act < nSub ? 1 : fix < nSub ? 2 : made < all ? 3 : sent < all ? 4 : 5;
  const iss = addM(L.month, 1).replace('-', '/') + '/01', d25 = L.month.replace('-', '/') + '/25', d20 = L.month.replace('-', '/') + '/20';
  const step = (no: number, t: string, cnt: string, dl: string, how: string, on: () => void) => (
    <button type="button" className={`bl-step ${no < cur ? 'is-done' : no === cur ? 'is-current' : ''}`} onClick={on}>
      <span className="bl-step__no">{no < cur ? '✓' : no}</span>
      <span className="bl-step__body"><span className="bl-step__t">{t}</span>
        <span className="bl-step__cnt"><b>{cnt}</b><span className="bl-step__dl">期限 {dl}</span></span><span className="bl-step__how">{how}</span></span>
    </button>
  );
  return (
    <div className="bl-steps" style={{ gridTemplateColumns: 'repeat(4,minmax(0,1fr))' }}>
      {step(1, '後払いを確定する', `${act} / ${nSub}件`, d25, '棚卸（' + d20 + ' 締め）の結果から実績精算を確定します〔実績精算の画面〕。未確定でも請求書は発行でき、確定後に翌月の請求書で精算します', onAct)}
      {step(2, '前払いを確定する', `${fix} / ${nSub}件`, d25, '先月との差（色付きの行）を確かめ、子契約ごとに前払い・調整を確定します', () => onPick('wait'))}
      {step(3, '請求書を作成する', `${made} / ${all}通`, d25, '確定した請求先ごとに作成します。Bill One に登録されます', () => onPick('ready'))}
      {step(4, 'Bill One で発行する', `${sent} / ${all}通`, iss, '明細を確かめて発行します。法人へ送付されます', () => onPick('made'))}
    </div>
  );
}
