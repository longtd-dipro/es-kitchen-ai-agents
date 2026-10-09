'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import corpDocs from '@/lib/corp/areas/corp-docs';
import { BILL_STATES, billHref, billTone, rebillBadge, sentLabel, yenS } from '@/lib/corp/docs/logic';
import { areaApi, useQuery } from '@/lib/ops/core/client';
import { useCorpSignedIn } from '../_ui/CorpProvider';
import { CorpCsvExport } from '../_ui/csv';
import { Badge, Breadcrumb, Button, Card, DocsPage, EmptyState, LoadError, LoadingState, Sel, Table, Td, useWho } from '../_docs/ds';
import { Pagination } from '../_delivery/kit';

const api = areaApi(corpDocs);
const EMPTY = { mon: '', to: '', st: '' };
/** 詳細から戻ったときに検索条件・ページ・件数を戻す（タブの中だけ覚える・P-LIST。棚卸一覧と同じ） */
const KEEP = 'corp.bills.list';

/**
 * 請求書の一覧（RV2-CORP-20261002 法人Web の「請求書」）。元：22_法人_拠点管理.html の Bills。
 * 法人アカウント：請求先が法人の請求書（法人あて）＋請求先が拠点の請求書（拠点あて）を全部。
 * 拠点アカウント：自分の拠点の分だけ（請求先が法人の拠点は、法人あての請求書のうちこの拠点の分＝内訳）。
 * 金額は運営Web の請求書（billing.inv）と同じ。押すと請求書詳細。
 * 一覧は P-LIST（検索：ご請求月・請求先・状態、10件ずつ）。状態は 確定／請求済み だけ、再請求はバッジ（台帳 E 2026-10-05）
 * 並びは固定（発行日の降順。同じ日は請求書番号の降順）で、並べ替えの選択はない（受付簿 No.157）。
 * 読み込めなかったときは白い画面にせず E346 を出す。請求書が1通もないときは「まだ請求書はありません」、検索で0件のときは I01。
 */
export default function BillsPage() {
  const { view } = useCorpSignedIn();
  const who = useWho();
  const { data, error, reload } = useQuery(api, 'bills', { who, ro: view === 'ro' });
  const [f, setF] = useState(EMPTY);
  const [args, setArgs] = useState(EMPTY);
  const [page, setPage] = useState(1);
  const [per, setPer] = useState(10);
  useEffect(() => {
    try {
      const v = JSON.parse(sessionStorage.getItem(KEEP) || 'null') as { args: typeof EMPTY; page: number; per: number } | null;
      if (v && v.args) { setF({ ...EMPTY, ...v.args }); setArgs({ ...EMPTY, ...v.args }); setPage(v.page || 1); setPer(v.per || 10); }
    } catch { /* 覚えていなければ既定のまま */ }
  }, []);
  const keep = (a: typeof EMPTY, pg: number, pr: number) => { try { sessionStorage.setItem(KEEP, JSON.stringify({ args: a, page: pg, per: pr })); } catch { /* 覚えられなくてもよい */ } };
  const search = (a: typeof EMPTY) => { setArgs(a); setPage(1); keep(a, 1, per); };
  if (error && !data) return <DocsPage><LoadError onRetry={() => reload()} /></DocsPage>;
  if (!data) return <DocsPage><LoadingState /></DocsPage>;
  const { rows: all, branchMode } = data;
  const scope = branchMode ? 'この拠点の請求書だけ表示' : '請求先が法人の請求書と、請求先が拠点の請求書をすべて表示';
  /* 検索：請求月・請求先（すべて／法人あて／拠点あて（拠点ごと））・状態（すべて／確定／請求済み） */
  const months = [...new Set(all.map((r) => r.mon))];
  const dests = [...new Map(all.filter((r) => r.site && !r.part).map((r) => [r.site!, r.to])).entries()];
  const rows = all.filter((r) => (!args.mon || r.mon === args.mon) && (!args.st || r.st === args.st)
    && (!args.to || (args.to === 'corp' ? !r.site || r.part : r.site === args.to)));
  const pages = Math.max(1, Math.ceil(rows.length / per)), cur = Math.min(page, pages);
  const shown = rows.slice((cur - 1) * per, cur * per);
  return (
    <DocsPage>
      <header className="es-pagehead page-h cb-bills">
        <div className="es-pagehead__text">
          <Breadcrumb items={['請求書']} />
          <h1 className="es-pagehead__title">請求書</h1>
          <div className="stat">
            <span>{branchMode ? data.siteName : data.corpName}</span>
            <span className="k">権限</span><span>{data.roleName}（{scope}）</span>
            <span className="k">件数</span><span>{rows.length}件</span>
          </div>
        </div>
        <div className="es-pagehead__actions">
          {/* CSV出力：検索条件のとおりの全件（見てよい分だけ）・1行＝請求書の1明細（請求書の項目をくり返す） */}
          <CorpCsvExport<(typeof rows)[number]> screen="請求書" rows={rows} disabled={!rows.length} filters={[{ label: 'ご請求月', value: args.mon }, { label: '請求先', value: args.to }, { label: '状態', value: args.st }]}
            columns={[{ label: '請求書番号', get: (r) => r.no }, { label: '発行日', get: (r) => r.at }, { label: 'ご請求月', get: (r) => r.mon }, { label: '請求先', get: (r) => r.to },
              { label: '金額（税込）', type: 'money', get: (r) => r.amt }, { label: 'この拠点の分（参考）(1=参考)', type: 'bool', get: (r) => !!r.part }, { label: '入金期限', get: (r) => r.due },
              { label: '状態', get: (r) => r.st }, { label: '再請求', get: (r) => r.rebillMark ?? '' }, { label: '最終請求書(1=最終)', type: 'bool', get: (r) => !!r.final }, { label: '請求書のメール送付（Bill One）', get: (r) => sentLabel(r.send) }]}
            source={{ kind: 'dm.billing.invoices', id: (r) => r.no, childKey: 'lines' }} />
        </div>
      </header>
      <div className="cb-stack">
        <Card title="請求書一覧">
          <form className="es-search" role="search" onSubmit={(e) => { e.preventDefault(); search(f); }}>
            <div className="es-search__left">
              <div className="es-search__fields">
                <Sel id="bl-mon" value={f.mon} opts={[['', 'ご請求月：すべて'], ...months.map((m): [string, string] => [m, m])]} onChange={(v) => setF({ ...f, mon: v })} minWidth={180} />
                {!branchMode ? <Sel id="bl-to" value={f.to} opts={[['', '請求先：すべて'], ['corp', '法人あて'], ...dests.map(([id, label]): [string, string] => [id, label])]} onChange={(v) => setF({ ...f, to: v })} minWidth={220} /> : null}
                <Sel id="bl-st" value={f.st} opts={[['', '状態：すべて'], ...BILL_STATES.map((x): [string, string] => [x, x])]} onChange={(v) => setF({ ...f, st: v })} minWidth={160} />
              </div>
            </div>
            <div className="es-search__actions">
              <div className="es-search__main">
                <Button variant="outline" onClick={() => { setF(EMPTY); search(EMPTY); }}>クリア</Button>
                <button type="submit" className="es-btn es-btn--solid es-btn--primary es-btn--md"><span>検索</span></button>
              </div>
            </div>
          </form>
          {rows.length ? (
            <Table compact cols={[{ label: '請求書番号' }, { label: '発行日' }, { label: 'ご請求月' }, { label: '請求先' }, { label: '金額（税込）', cls: 'r' }, { label: '入金期限' }, { label: '状態' }, { label: 'メール送付' }]}>
              {shown.map((r, i) => (
                <tr key={i}>
                  <td className="es-mono"><Link href={billHref(r.no, r.site)} onClick={() => keep(args, cur, per)}>{r.no}</Link>{r.final ? <div><Badge tone="neutral">最終請求書</Badge></div> : null}</td>
                  <Td v={r.at} cls="es-num" /><Td v={r.mon} /><Td v={r.to} />
                  <td className="r es-num">{yenS(r.amt)}{r.part ? <div className="es-field__msg">この拠点の分（参考）</div> : null}</td>
                  <Td v={r.due} cls="es-num" />
                  <td><Badge tone={billTone(r.st)}>{r.st}</Badge>{r.rebillMark ? <> <Badge tone="warning">{rebillBadge(r.no, r.rebillMark)}</Badge></> : null}</td>
                  {/* Bill One：送付できた請求書だけ「送付済み」。送付前・送付できなかったときは「—」（版1.1・送付のエラーは法人に出さない） */}
                  <td>{sentLabel(r.send) ? <Badge tone="success">{sentLabel(r.send)}</Badge> : '—'}</td>
                </tr>
              ))}
            </Table>
          ) : <EmptyState title={all.length ? '表示するデータがありません。' : 'まだ請求書はありません。'} compact>{all.length ? null : '請求書は、毎月25日の確定のあと、翌月1日にお送りします。'}</EmptyState>}
          {rows.length ? <Pagination total={rows.length} page={cur} per={per} onPage={(n) => { setPage(n); keep(args, n, per); }} onPer={(n) => { setPer(n); setPage(1); keep(args, 1, n); }} /> : null}
          <ul className="cb-notes">
            <li>請求書番号を押すと、請求書の内容（明細）を確認できます。</li>
            <li>請求書は、毎月20日までのご利用分を集計し、25日に確定、翌月1日にお送りします。請求書（PDF）は Bill One（請求書のオンライン受け取りサービス）からメールでお届けします。</li>
            <li>固定額＝ご利用月の前にお支払いいただく月額です。ご利用実績の精算＝在庫の差額などを、あとからご精算いただくものです。</li>
            <li>状態の「請求済み」は請求書をメールでお送りしたもの、「確定」は請求内容が確定済みでまだお送りしていないものです。前の請求書を再請求した請求書と、再請求された前の請求書には「再請求」のバッジを添えます。</li>
            <li>
              {branchMode
              ? (data.anyPart ? 'この拠点の請求先は法人のため、請求書は法人あてにまとめて発行されます。金額は、法人あての請求書のうちこの拠点の分（参考・税込）です。' : '')
              : '請求先が法人の拠点の分は、法人あての請求書にまとめて入ります（その拠点あての請求書は出ません）。請求先が拠点の拠点は、拠点ごとに請求書が出ます。'}
            </li>
          </ul>
        </Card>
      </div>
    </DocsPage>
  );
}
