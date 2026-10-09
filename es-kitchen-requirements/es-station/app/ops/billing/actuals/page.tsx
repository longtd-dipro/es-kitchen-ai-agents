'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { actPeriod, hit, monthsBetween, yen } from '@/lib/ops/billing/logic';
import { fieldCsvFilters, OpsCsvExport } from '../../_ui/csv';
import { Btn, Card, Check, Foot, Inline, Meta, PageHead, Pagination, PencilLink, SearchBar, SelBar, SumGrid, Table, Tag, TaxYen, useAsk, type SearchField } from '../_components/ds';
import { exTax } from '@/lib/format/money';

/** 実績精算の金額の税率（軽減8%・販売単価（税込）から出した額。2026/10/03 決定：税込・税抜の両方を出す） */
const R8 = 8;
import { R, pLabel, useBilling } from '../_components/useBilling';
import { useScreenCan } from '../../_ui/perm';
import { pageOf, usePager } from '@/lib/ui/paging';
import { fmtDate, fmtDatesIn } from '@/lib/format/date';
import { RateTds } from '../_components/Rates';

/** 実績精算（子契約ごとの実績精算の一覧）。元の vAct */
export default function ActualsPage() {
  return <Suspense><Actuals /></Suspense>;
}

const INIT = { m: '2026-10', m2: '2026-10', co: '', br: '', filed: '', st: '' };

function Actuals() {
  const sp = useSearchParams();
  const ask = useAsk();
  const { L, run, can: canOp } = useBilling();
  /* 現金回収差額の税率（設定管理・既定 8%：台帳 E 2026-10-05） */
  const RC = 8;   // 合計の行だけの代表値（各拠点は k.cashRate＝商品の税率）
  const screenCan = useScreenCan();
  const [f, setF] = useState({ ...INIT, m: sp.get('m') || INIT.m, m2: sp.get('m2') || sp.get('m') || INIT.m2, st: sp.get('st') || '' });
  const [sel, setSel] = useState<Record<string, boolean>>({});
  const pager = usePager();
  if (!L) return null;
  /* 月は「開始月〜終了月」の範囲（同じ月なら1か月）。行は拠点×月。操作は当月の行だけ・過去月は確定済みの記録（参照のみ） */
  const m = f.m, m2 = f.m2 || f.m, ms = monthsBetween(L.monthChoices(), m, m2), multi = ms.length > 1, hasCur = ms.includes(L.month), pastMs = ms.filter((x) => x < L.month);
  const rows = ms.flatMap((mm) => L.S.brs.filter((b0) => {
    const b = mm < L.month ? L.pastB(b0, mm) : b0, c = L.co(b0.co);
    return hit(f.co, c.name, c.code, b0.co) && hit(f.br, b0.name, b0.code, L.subNo(b0, mm))
      && (!f.st || (f.st === 'ok') === !!b.actOK) && (!f.filed || (f.filed === 'yes') === !!b.filed);
  }).map((b0) => { const pst = mm < L.month, b = pst ? L.pastB(b0, mm) : b0; return { b, k: L.calc(b), mm, pst }; }));
  const T = rows.reduce((a, r) => ({ sales: a.sales + r.k.cashDiff, mg: a.mg + r.k.T.mgYen, over: a.over + r.k.over, adjD: a.adjD + r.k.adjD, bill: a.bill + r.k.bill }), { sales: 0, mg: 0, over: 0, adjD: 0, bill: 0 });
  const nf = L.S.brs.filter((b) => !b.filed && !b.noCheck).length, nc = L.S.brs.filter((b) => b.noCheck).length;
  /* 差分率・廃棄率のアラート（10%以上）がある子契約は、詳細で確かめて1件ずつ確定する（まとめて確定は選べない・課題 2-1） */
  const canIds = rows.filter((r) => !r.pst && !r.b.actOK && !L.actLock(r.b) && !L.rates(r.b).alert).map((r) => r.b.id);
  const nAlert = rows.filter((r) => !r.pst && !r.b.actOK && L.rates(r.b).alert).length;
  const ids = Object.keys(sel).filter((k) => sel[k]);
  const fields: SearchField[] = [
    { k: 'm', k2: 'm2', type: 'mrange', ph: '対象月', all: false, w: 200, opts: L.monthChoices().map((x) => [x, pLabel(x, L.month)]) },
    { k: 'co', type: 'text', ph: '法人名・法人ID', w: 220 },
    { k: 'br', type: 'text', ph: '拠点名・子契約番号', w: 220 },
    { k: 'filed', type: 'sel', ph: '棚卸報告（すべて）', w: 190, opts: [['yes', '申告済'], ['no', '未申告']] },
    { k: 'st', type: 'sel', ph: '実績精算（すべて）', w: 190, opts: [['ok', '確定'], ['no', '未確定']] },
  ];
  const bulk = () => ask({
    title: `${ids.length}件の実績精算を確定しますか？`, body: '差分率・廃棄率のアラートがない子契約だけを確定します。棚卸報告が25日までに未申告の子契約は、事務手数料が計上されます（お客様の入力は20日まで・21〜25日は運営が代理で入れられます）（棚卸なし・休止中・お試しの拠点を除く）。確定したあとの誤りは、翌月の実績精算の中の調整で相殺します。',
    onOk: async () => { if (await run('bulkAct', { ids })) setSel({}); },
  });
  return (
    <>
      <PageHead crumbs={[{ t: '請求' }, { t: '実績精算' }]} title="実績精算" actions={
        <OpsCsvExport<(typeof rows)[number]> className="es-btn es-btn--outline es-btn--primary es-btn--md" screen="実績精算" filters={fieldCsvFilters(fields, f)} rows={rows}
          columns={[
            ...(multi ? [{ label: '対象月', get: (r: (typeof rows)[number]) => r.mm }] : []), { label: '子契約番号', get: (r) => L.subNo(r.b, r.mm) }, { label: '拠点ID', get: (r) => r.b.code }, { label: '拠点名', get: (r) => r.b.name },
            { label: '法人ID', get: (r) => r.b.co }, { label: '法人名', get: (r) => L.co(r.b.co).name }, { label: '適用プラン', get: (r) => `${L.planOf(r.b).id} ${r.b.plan}` },
            { label: '免責（税込）', type: 'money', get: (r) => r.k.ded },
            { label: '棚卸', get: (r) => (r.b.noCheck ? '棚卸なし' : r.b.filed ? '申告済' : '未申告') }, { label: '申告日', get: (r) => (r.b.filed ? r.b.stockDay : '') },
            { label: '差分率', type: 'num', get: (r) => L.rates(r.b).diff }, { label: '廃棄率', type: 'num', get: (r) => L.rates(r.b).waste },
            { label: '管理ロス（税込）', type: 'money', get: (r) => r.k.T.mgYen }, { label: '管理ロス（税抜）', type: 'money', get: (r) => exTax(r.k.T.mgYen, R8) },
            { label: '免責超過（税込）', type: 'money', get: (r) => r.k.over }, { label: '免責超過（税抜）', type: 'money', get: (r) => exTax(r.k.over, R8) },
            { label: '現金回収差額（税込）', type: 'money', get: (r) => (r.b.cash ? r.k.cashDiff : '') }, { label: '現金回収差額（税抜）', type: 'money', get: (r) => (r.b.cash ? exTax(r.k.cashDiff, RC) : '') },
            { label: '価格調整差額（税込）', type: 'money', get: (r) => r.k.adjD }, { label: '価格調整差額（税抜）', type: 'money', get: (r) => exTax(r.k.adjD, R8) },
            { label: '当月へ繰入（税込）', type: 'money', get: (r) => r.k.bill }, { label: '当月へ繰入（税抜）', type: 'money', get: (r) => exTax(r.k.bill, R8) }, { label: '実績精算', get: (r) => (r.b.actOK ? '確定' : '未確定') },
          ]}
          source={{ kind: 'dm.org.childContracts', id: (r) => L.subNo(r.b, r.mm) }} />
      } />
      <Meta>
        <Tag>{multi ? `${pLabel(m, L.month)}〜${pLabel(m2, L.month)}` : pLabel(m, L.month)}</Tag>{!multi && <Tag c="info">対象期間 {fmtDatesIn(actPeriod(m))}</Tag>}
        <Tag c={nf ? 'no' : 'ok'}>棚卸 {L.S.brs.length - nf - nc}/{L.S.brs.length - nc} 申告済{nc ? `（棚卸なし ${nc}拠点）` : ''}</Tag>
        {nAlert > 0 && <Tag c="no">要確認 {nAlert}件（差分率・廃棄率 10%以上）</Tag>}
        <span className="small">棚卸の結果から<b>精算差額</b>を出し、<b>後払い分</b>として子契約に載せます</span>
      </Meta>
      <SumGrid items={[
        { k: '現金回収差額', v: <TaxYen v={T.sales} rate={RC} />, s: 'アプリの現金支払い：回収予定 − ドライバーの回収' },
        { k: '管理ロス', v: <TaxYen v={T.mg} rate={R8} />, s: `うち免責超過 ${yen(T.over)}（税込）` },
        { k: '当月の請求へ繰入', v: <TaxYen v={T.bill} rate={R8} />, s: '免責超過 ＋ 現金回収差額（価格調整差額は翌月）' },
      ]} />
      <Card title="子契約ごとの実績精算" right="対象期間 2026-09-21〜10-20">
        <SearchBar key={JSON.stringify(f)} fields={fields} value={f} init={INIT} onApply={(v) => { setF(v); setSel({}); }} />
        {pastMs.length > 0 && <Inline>{multi ? `${pastMs.map((x) => pLabel(x, L.month)).join('・')}の行` : pLabel(m, L.month)}は確定済みです。確定したときの記録を表示しています（参照のみ）。</Inline>}
        <Table minWidth={1340}>
          <thead><tr>
            <th className="c" style={{ width: '3.428571rem' }}>{canIds.length > 0 && <Check label="すべて選択" checked={ids.length > 0 && ids.length === canIds.length} onChange={(on) => setSel(on ? Object.fromEntries(canIds.map((i) => [i, true])) : {})} />}</th>
            {multi && <th>対象月</th>}<th>子契約番号<div className="small">拠点</div></th><th>適用プラン<div className="small">免責</div></th><th className="c">棚卸</th><th className="r">差分率</th><th className="r">廃棄率</th>
            <th className="r">管理ロス<div className="small">税込／税抜</div></th><th className="r">免責超過<div className="small">税込／税抜</div></th><th className="r">現金回収差額<div className="small">税込／税抜</div></th>
            <th className="r">価格調整差額<div className="small">翌月の前請求へ・税込／税抜</div></th><th className="r">当月へ繰入<div className="small">税込／税抜</div></th><th className="c">確定</th><th className="c">操作</th>
          </tr></thead>
          <tbody>
            {pageOf(pager, rows).rows.map(({ b, k, mm, pst }) => {
              const can = !pst && !b.actOK && !L.actLock(b);
              return (
                <tr key={`${mm}|${b.id}`} className={sel[b.id] ? 'is-selected' : undefined}>
                  <td className="c">{can && <Check checked={!!sel[b.id]} onChange={(on) => setSel((s) => ({ ...s, [b.id]: on }))} />}</td>
                  {multi && <td style={{ whiteSpace: 'nowrap' }}>{mm}</td>}
                  <td style={{ whiteSpace: 'nowrap' }}><Link className="es-mono" href={R.actD(b.id, mm)}>{L.subNo(b, mm)}</Link><div className="small">{b.name}</div></td>
                  <td className="small">{L.planOf(b).id} {b.plan}<div className="small">免責 {yen(k.ded)}（税込）</div></td>
                  <td className="c">{b.noCheck ? <Tag>棚卸なし</Tag> : b.filed ? <><Tag c="ok">申告済</Tag><div className="small">{fmtDate(b.stockDay)}</div></> : <Tag c="no">未申告</Tag>}</td>
                  <RateTds L={L} b={b} />
                  <td className="r es-num"><TaxYen v={k.T.mgYen} rate={R8} /></td>
                  <td className="r es-num" style={k.over ? { color: 'var(--negative-500)' } : undefined}><TaxYen v={k.over} rate={R8} /></td>
                  <td className="r es-num">{b.cash ? <TaxYen v={k.cashDiff} rate={k.cashRate} signed /> : <span className="dim">現金なし</span>}</td>
                  <td className="r es-num">{k.adjD ? <TaxYen v={k.adjD} rate={R8} /> : '—'}</td>
                  <td className="r es-num" style={{ fontWeight: 600, color: 'var(--info-500)' }}><TaxYen v={k.bill} rate={R8} /></td>
                  <td className="c">{b.actOK ? <Tag c="ok">確定</Tag> : <Tag c="wait">未確定 {L.partsN(b)}/3</Tag>}{!pst && !b.actOK && L.rates(b).alert && <div><Link href={R.actD(b.id, mm)}><Tag c="no">要確認（詳細で確定）</Tag></Link></div>}</td>
                  <td className="c" style={{ whiteSpace: 'nowrap' }}>{can && screenCan('update') && <PencilLink href={R.actE(b.id)} />}</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot><tr><td colSpan={multi ? 7 : 6}>合計</td><td className="r es-num"><TaxYen v={T.mg} rate={R8} /></td><td className="r es-num"><TaxYen v={T.over} rate={R8} /></td><td className="r es-num"><TaxYen v={T.sales} rate={RC} signed /></td><td className="r es-num"><TaxYen v={T.adjD} rate={R8} /></td><td className="r es-num"><TaxYen v={T.bill} rate={R8} /></td><td colSpan={2} /></tr></tfoot>
        </Table>
        <Pagination {...pageOf(pager, rows).props} />
        <Foot><div className="small"><b>差分率</b>＝(理論 − 申告) ÷ 理論、<b>廃棄率</b>＝廃棄 ÷ (前回 ＋ 納品)。<b>どちらかが10%以上の子契約は赤</b>で、まとめて確定できません（詳細で確かめて確定）。アラートのない子契約は選んでまとめて確定できます。計算在庫 ＝ 前回の棚卸報告 ＋ 納品 − 販売（アプリ） − 廃棄 ± 在庫調整。アプリで決済済みの支払いは実績精算に出しません。<b>アプリで現金を選んだ分は、回収予定額とドライバーの回収額の差だけ</b>を載せます。金額は上が税込（販売単価（税込）から出した額）、下が税抜（軽減8%で割り戻し・1円未満四捨五入）</div></Foot>
      </Card>
      {/* 権限がなければ出さない */}
      {hasCur && <SelBar n={ids.length} onClear={() => setSel({})}>{canOp('bulkAct') && <Btn kind="pri" onClick={bulk}>まとめて確定</Btn>}</SelBar>}
    </>
  );
}
