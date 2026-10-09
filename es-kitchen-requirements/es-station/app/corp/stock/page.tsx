'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import corpDocs from '@/lib/corp/areas/corp-docs';
import { sheetEmpty, skPaused, STOCK_STATES, stockMonths, stockRank, stockStat, stockWayShort } from '@/lib/corp/docs/logic';
import type { StockRec } from '@/lib/corp/docs/types';
import { areaApi, useQuery } from '@/lib/ops/core/client';
import { fmtDatesIn } from '@/lib/format/date';
import { Badge, Breadcrumb, Button, Card, DocsPage, EmptyState, Inline, LoadError, LoadingState, Sel, Table, Td, useWho } from '../_docs/ds';

const api = areaApi(corpDocs);
const PER = 10;
const KEEP = 'corp.stock.list';

/** 絞り込み（「検索」か Enter で反映・P-LIST）。月度の既定は今回の月度 */
type Q = { m: string; site: string; st: string; sort: 'todo' | 'month' | 'site' };
const q0 = (m: string): Q => ({ m, site: '', st: '', sort: 'todo' });

/**
 * 棚卸一覧（CW_STOCK_002・版 1.1）。サイドメニュー「棚卸報告」で開く。
 * 見られる拠点（法人アカウント＝自社のすべての拠点／拠点アカウント＝この拠点）× 月度（今回＋過去3か月）の報告の状況を1行ずつ並べ、
 * 行を押すとその拠点・月度の棚卸報告（CW_STOCK_001・/corp/stock/<拠点ID>/<月度>）を開く。
 * 既定の並びはやることがある順：未報告 → 報告済み → 棚卸なし・休止中・ご契約前、その中は拠点ID の昇順、同じ拠点は月度の降順（hong 2026-10-05 B-20）。
 */
export default function StockListPage() {
  const router = useRouter();
  const who = useWho();
  const { data, error, reload } = useQuery(api, 'stock', { who });
  /* 月度：今回＋過去3か月（台帳 E 2026-10-05・今日から決める） */
  const MONTHS = stockMonths();
  const Q0 = q0(MONTHS[0].m);
  /* 詳細から戻ったときは絞り込みとページを戻す（タブの中だけ覚える・P-LIST） */
  const [q, setQ] = useState<Q>(Q0);
  const [qd, setQd] = useState<Q>(Q0);
  const [pg, setPg] = useState(1);
  useEffect(() => {
    try {
      const v = JSON.parse(sessionStorage.getItem(KEEP) || 'null') as { q: Q; pg: number } | null;
      if (v && v.q) { setQ({ ...Q0, ...v.q }); setQd({ ...Q0, ...v.q }); setPg(v.pg || 1); }
    } catch { /* 覚えていなければ既定のまま */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const keep = (nq: Q, npg: number) => { try { sessionStorage.setItem(KEEP, JSON.stringify({ q: nq, pg: npg })); } catch { /* 覚えられなくてもよい */ } };
  if (error && !data) return <DocsPage className="cb-stockpg"><LoadError onRetry={() => reload()} /></DocsPage>;
  if (!data) return <DocsPage className="cb-stockpg"><LoadingState /></DocsPage>;
  if (!data.sites.length) return <DocsPage className="cb-stockpg">{null}</DocsPage>;

  const list = data.sites;
  const cfgOf = (id: string) => data.cfg.find((c) => c.id === id);
  const recOf = (id: string, m: string): StockRec | null => data.recs.find((r) => r.site === id && r.m === m) ?? null;
  const emptyOf = (id: string, m: string) => sheetEmpty(data.sheets.find((x) => x.site === id && x.m === m)?.items);

  /* 1行＝1拠点×1月度 */
  const rows = list.flatMap((s) => MONTHS.map((M) => {
    const c = cfgOf(s.id), r = recOf(s.id, M.m), t = stockStat(c, M, r, emptyOf(s.id, M.m));
    return { site: s.id, name: s.name, dlv: skPaused(c, M.m) ? '—' : s.dlv, M, r, t, way: stockWayShort(c, M.m) };
  }));
  const hit = rows.filter((x) => (!q.m || x.M.m === q.m) && (!q.site || x.site === q.site) && (!q.st || x.t.t === q.st));
  hit.sort((a, b) => {
    if (q.sort === 'month') return b.M.m.localeCompare(a.M.m) || a.site.localeCompare(b.site);
    if (q.sort === 'site') return a.site.localeCompare(b.site) || b.M.m.localeCompare(a.M.m);
    return stockRank(a.t.t) - stockRank(b.t.t) || a.site.localeCompare(b.site) || b.M.m.localeCompare(a.M.m);
  });
  const pages = Math.max(1, Math.ceil(hit.length / PER)), cur = Math.min(pg, pages);
  const shown = hit.slice((cur - 1) * PER, cur * PER);
  const search = () => { setQ(qd); setPg(1); keep(qd, 1); };
  const open = (site: string, m: string) => { keep(q, cur); router.push(`/corp/stock/${site}/${m}`); };
  const page = (n: number) => { setPg(n); keep(q, n); };

  return (
    <DocsPage className="cb-stockpg">
      <header className="es-pagehead page-h">
        <div className="es-pagehead__text">
          <Breadcrumb items={['棚卸一覧']} />
          <h1 className="es-pagehead__title">棚卸一覧</h1>
          <div className="stat"><span>{data.corpName}</span><span className="k">権限</span><span>{data.roleName}（{data.scope}）</span></div>
        </div>
      </header>
      <div className="cb-stack">
        {/* 切り替えのあとの最初の棚卸報告：報告するまで出す（受付簿 No.134） */}
        {data.firstStock.length > 0 && (
          <Inline tone="warning" title="最初の棚卸報告をしてください">
            {data.firstStock.map((b) => b.name).join('・')}：新しいシステムへの切り替えのあと、まだ棚卸報告をいただいていません。商品の数を数えて、最初の棚卸報告をお願いします（ない商品は 0）。報告いただいた数が、在庫の始まりの数になります。報告をいただくまでは、管理ロスは計算しません。
          </Inline>
        )}
        <Card title="絞り込み">
          <form className="sk-filter" role="search" onSubmit={(e) => { e.preventDefault(); search(); }}>
            <div className="es-field"><label className="es-field__label" htmlFor="sk-m">月度</label>
              <Sel id="sk-m" value={qd.m} minWidth={200} opts={[['', 'すべて'], ...MONTHS.map((x): [string, string] => [x.m, x.label + (x.open ? '（今回）' : '')])]} onChange={(v) => setQd({ ...qd, m: v })} /></div>
            {list.length > 1 ? (
              <div className="es-field"><label className="es-field__label" htmlFor="sk-site">拠点</label>
                <Sel id="sk-site" value={qd.site} minWidth={304} opts={[['', 'すべて'], ...list.map((x): [string, string] => [x.id, x.name])]} onChange={(v) => setQd({ ...qd, site: v })} /></div>
            ) : null}
            <div className="es-field"><label className="es-field__label" htmlFor="sk-st">状態</label>
              <Sel id="sk-st" value={qd.st} minWidth={288} opts={[['', 'すべて'], ...STOCK_STATES.map((x): [string, string] => [x, x])]} onChange={(v) => setQd({ ...qd, st: v })} /></div>
            <div className="es-field"><label className="es-field__label" htmlFor="sk-sort">並べ替え</label>
              <Sel id="sk-sort" value={qd.sort} minWidth={200} opts={[['todo', 'やることがある順'], ['month', '月度（新しい順）'], ['site', '拠点ID']]} onChange={(v) => setQd({ ...qd, sort: v as Q['sort'] })} /></div>
            <div className="sk-filter__act">
              <Button variant="outline" onClick={() => { setQd(Q0); setQ(Q0); setPg(1); keep(Q0, 1); }}>クリア</Button>
              <button type="submit" className="es-btn es-btn--solid es-btn--primary es-btn--md"><span>検索</span></button>
            </div>
          </form>
        </Card>
        <Card title={`棚卸一覧（${hit.length}件）`}>
          <Table compact cls="sk-st" cols={[{ label: '月度', w: 130 }, { label: '拠点ID', w: 100 }, { label: '拠点名' }, { label: '配送の方法' }, { label: '状態' }, { label: '報告日' }, { label: '報告者' }, { label: '報告の方法' }]}>
            {shown.map((x) => (
              <tr key={x.site + '|' + x.M.m} className="sk-row" tabIndex={0} role="link" aria-label={`${x.name} ${x.M.label} の棚卸報告を開く`} onClick={() => open(x.site, x.M.m)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(x.site, x.M.m); } }}>
                <Td v={x.M.label + (x.M.open ? '（今回）' : '')} cls="es-num" />
                <td className="es-mono"><a href={`/corp/stock/${x.site}/${x.M.m}`} onClick={(e) => { e.preventDefault(); open(x.site, x.M.m); }}>{x.site}</a></td>
                <Td v={x.name} /><Td v={x.dlv} />
                <td><Badge tone={x.t.tone}>{x.t.t}</Badge></td>
                <Td v={x.r ? fmtDatesIn(x.r.at) : '—'} cls="es-num" /><Td v={x.r ? x.r.who : '—'} /><Td v={x.way} />
              </tr>
            ))}
            {!hit.length ? <tr><td colSpan={8} className="c"><EmptyState title="表示するデータがありません。" /></td></tr> : null}
          </Table>
          {hit.length > PER ? (
            <div className="sk-pager">
              <span className="es-pagination__meta">{`${hit.length}件中 ${(cur - 1) * PER + 1}–${Math.min(cur * PER, hit.length)}件`}</span>
              <Button variant="outline" size="sm" disabled={cur <= 1} onClick={() => page(cur - 1)}>前へ</Button>
              <span className="sk-pager__n">{cur} / {pages}</span>
              <Button variant="outline" size="sm" disabled={cur >= pages} onClick={() => page(cur + 1)}>次へ</Button>
            </div>
          ) : null}
          <p className="note" style={{ marginTop: '0.857143rem' }}>行を押すと、その拠点・月度の棚卸報告を開きます。お客様の入力期限は毎月20日です（21〜25日はESキッチンが代理で追加・修正します。未報告の判定は25日です）。</p>
        </Card>
      </div>
    </DocsPage>
  );
}
