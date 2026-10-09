'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { DEMO } from '@/lib/demo';
import { actPeriod, hit, monthsBetween } from '@/lib/ops/billing/logic';
import { fieldCsvFilters, OpsCsvExport } from '../../_ui/csv';
import { Btn, Card, Check, Inline, Meta, PageHead, Pagination, PencilLink, SearchBar, SelBar, Table, Tag, type SearchField } from '../_components/ds';
import { R, pLabel, useBilling } from '../_components/useBilling';
import { useScreenCan } from '../../_ui/perm';
import { pageOf, usePager } from '@/lib/ui/paging';
import { fmtDate, fmtDatesIn } from '@/lib/format/date';
import { RateTds } from '../_components/Rates';

/** 在庫管理（在庫一覧）。元の vAdjList */
export default function StockListPage() {
  return <Suspense><StockList /></Suspense>;
}

const INIT = { m: '2026-10', m2: '2026-10', co: '', br: '', st: '', act: '' };

function StockList() {
  const { L, can: canOp } = useBilling();
  const screenCan = useScreenCan();
  const sp = useSearchParams();
  const router = useRouter();
  const [f, setF] = useState({ ...INIT, m: sp.get('m') || INIT.m, m2: sp.get('m2') || sp.get('m') || INIT.m2 });
  const [sel, setSel] = useState<Record<string, boolean>>({});
  const pager = usePager();
  if (!L) return null;
  /* 月は「開始月〜終了月」の範囲（同じ月なら1か月）。行は拠点×月。操作は当月の行だけ・過去月は確定済みの記録（参照のみ） */
  const m = f.m, m2 = f.m2 || f.m, ms = monthsBetween(L.monthChoices(), m, m2), multi = ms.length > 1, hasCur = ms.includes(L.month), pastMs = ms.filter((x) => x < L.month);
  const list = ms.flatMap((mm) => L.S.brs.filter((b) => {
    const x = mm < L.month ? L.pastB(b, mm) : b, c = L.co(b.co);
    return hit(f.co, c.name, c.code, b.co) && hit(f.br, b.name, b.code, L.subNo(b, mm))
      && (!f.st || (f.st === 'after') === !!x.filed) && (!f.act || (f.act === 'ok') === !!x.actOK);
  }).map((b) => ({ b, mm, pst: mm < L.month, x: mm < L.month ? L.pastB(b, mm) : b })));
  const canIds = list.filter((r) => !r.pst && L.canAdj(r.b)).map((r) => r.b.id);
  const ids = Object.keys(sel).filter((k) => sel[k]);
  const fields: SearchField[] = [
    { k: 'm', k2: 'm2', type: 'mrange', ph: '対象月', all: false, w: 200, opts: L.monthChoices().map((x) => [x, pLabel(x, L.month)]) },
    { k: 'co', type: 'text', ph: '法人名・法人ID', w: 220 },
    { k: 'br', type: 'text', ph: '拠点名・拠点ID', w: 220 },
    { k: 'st', type: 'sel', ph: '棚卸（すべて）', w: 180, opts: [['before', '棚卸前'], ['after', '棚卸後']] },
    { k: 'act', type: 'sel', ph: '実績精算（すべて）', w: 190, opts: [['ok', '確定'], ['no', '未確定']] },
  ];
  return (
    <>
      <PageHead crumbs={[{ t: '請求' }, { t: '棚卸し（拠点在庫）' }]} title="棚卸し（拠点在庫）" actions={
        <OpsCsvExport<(typeof list)[number]> className="es-btn es-btn--outline es-btn--primary es-btn--md" screen="在庫一覧" filters={fieldCsvFilters(fields, f)} rows={list}
          columns={[
            ...(multi ? [{ label: '対象月', get: (r: (typeof list)[number]) => r.mm }] : []),
            { label: '拠点ID', get: (r) => r.b.code }, { label: '拠点名', get: (r) => r.b.name }, { label: '法人ID', get: (r) => r.b.co }, { label: '法人名', get: (r) => L.co(r.b.co).name },
            { label: '子契約番号', get: (r) => L.subNo(r.b, r.mm) },
            { label: '棚卸', get: (r) => (r.x.noCheck ? '棚卸なし' : r.x.filed ? '棚卸後' : '棚卸前') }, { label: '申告日', get: (r) => (r.x.filed ? r.x.stockDay : '') },
            { label: '計算在庫（合計）', type: 'int', get: (r) => L.theoTot(r.x) },
            { label: '在庫調整（件）', type: 'int', get: (r) => (r.pst ? 0 : L.S.adjs.filter((x) => x.br === r.b.id).length) },
            { label: '在庫調整（点）', type: 'int', get: (r) => (r.pst ? 0 : L.S.adjs.filter((x) => x.br === r.b.id).reduce((s, x) => s + x.delta, 0)) },
            { label: '管理ロス（点）', type: 'int', get: (r) => (r.x.filed && !r.x.noCheck && !L.firstWait(r.x) ? L.stockLoss(r.x) : '') },
            { label: '差分率', type: 'num', get: (r) => L.rates(r.x).diff }, { label: '廃棄率', type: 'num', get: (r) => L.rates(r.x).waste },
            { label: '実績精算', get: (r) => (r.x.actOK ? '確定' : '未確定') },
          ]}
          source={{ kind: 'dm.org.branches', id: (r) => r.b.code }} />
      } />
      <Meta>
        <Tag>{multi ? `${pLabel(m, L.month)}〜${pLabel(m2, L.month)}` : pLabel(m, L.month)}</Tag>{!multi && <Tag>対象期間 {fmtDatesIn(actPeriod(m))}</Tag>}
        <span className="small">拠点ごとの在庫・棚卸報告・在庫調整。当月の棚卸の前か後かで詳細の表示が変わります。<b>差分率</b>＝(理論 − 申告) ÷ 理論、<b>廃棄率</b>＝廃棄 ÷ (前回 ＋ 納品)。10%以上は赤で表示します。{DEMO_NOTE}</span>
      </Meta>
      {pastMs.length > 0 && <Inline>{multi ? `${pastMs.map((x) => pLabel(x, L.month)).join('・')}の行` : pLabel(m, L.month)}は確定済みです。確定したときの記録を表示しています（参照のみ）。</Inline>}
      <Card>
        <SearchBar key={JSON.stringify(f)} fields={fields} value={f} init={INIT} onApply={(v) => { setF(v); setSel({}); }} />
        <Table>
          <thead><tr>
            <th className="c" style={{ width: '3.428571rem' }}>{canIds.length > 0 && <Check label="すべて選択" checked={ids.length > 0 && ids.length === canIds.length} onChange={(on) => setSel(on ? Object.fromEntries(canIds.map((i) => [i, true])) : {})} />}</th>
            {multi && <th>対象月</th>}<th>拠点ID</th><th>拠点名</th><th>法人名</th><th>棚卸（{!hasCur ? '申告日' : '当月'}）</th><th className="r">計算在庫（合計）</th><th className="r">在庫調整</th><th className="r">管理ロス（点）</th><th className="r">差分率</th><th className="r">廃棄率</th><th className="c">実績精算</th><th className="c">操作</th>
          </tr></thead>
          <tbody>
            {pageOf(pager, list).rows.map(({ b: b0, x: b, mm, pst }) => {
              const a = pst ? [] : L.S.adjs.filter((x) => x.br === b.id), q = a.reduce((s, x) => s + x.delta, 0), l = b.filed ? L.stockLoss(b) : null;
              const can = !pst && L.canAdj(b0);
              return (
                <tr key={`${mm}|${b.id}`} className={sel[b.id] ? 'is-selected' : undefined}>
                  <td className="c">{can && <Check checked={!!sel[b.id]} onChange={(on) => setSel((s) => ({ ...s, [b.id]: on }))} />}</td>
                  {multi && <td style={{ whiteSpace: 'nowrap' }}>{mm}</td>}
                  <td><Link className="es-mono" href={R.stockD(b.id, mm)}>{b.code}</Link></td>
                  <td>{b.name}</td>
                  <td>{L.co(b.co).name || '（法人なし）'}</td>
                  <td>{b.noCheck ? <Tag>棚卸なし</Tag> : b.filed ? <><Tag c="ok">棚卸後</Tag><div className="small">申告 {fmtDate(b.stockDay)}</div></> : L.firstWait(b) ? <><Tag c="wait">棚卸前</Tag><div className="small">最初の報告待ち</div></> : <Tag c="wait">棚卸前</Tag>}</td>
                  <td className="r es-num">{L.theoTot(b)}点</td>
                  <td className="r es-num">{a.length ? `${a.length}件（${q > 0 ? '+' : ''}${q}点）` : '—'}</td>
                  <td className="r es-num">{b.noCheck || L.firstWait(b) ? <span className="dim">—</span> : l === null ? <span className="dim">棚卸前</span> : l > 0 ? '−' + l : l < 0 ? '+' + -l : '0'}</td>
                  <RateTds L={L} b={b} />
                  <td className="c">{b.actOK ? <Tag c="ok">確定</Tag> : <Tag c="wait">未確定</Tag>}</td>
                  <td className="c">{can && screenCan('update') && <PencilLink href={R.stockE(b.id)} />}</td>
                </tr>
              );
            })}
            {!list.length && <tr><td colSpan={multi ? 13 : 12} className="c dim">条件に合う拠点はありません</td></tr>}
          </tbody>
        </Table>
        <Pagination {...pageOf(pager, list).props} />
      </Card>
      {hasCur && (
        <SelBar n={ids.length} onClear={() => setSel({})}>
          {/* 権限がなければ出さない */}
          {canOp('addStockAdjBulk') && <Btn kind="pri" onClick={() => router.push(R.stockBulk(ids))}>まとめて在庫調整</Btn>}
        </SelBar>
      )}
    </>
  );
}

/* 請求デモの見本の説明はデモのときだけ */
const DEMO_NOTE = DEMO ? '（請求デモの見本は 株式会社サンプル の本社・大阪支店・名古屋営業所・千葉営業所・横浜営業所）' : '';
