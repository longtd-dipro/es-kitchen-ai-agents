'use client';

import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Fragment, Suspense } from 'react';
import corpDocs from '@/lib/corp/areas/corp-docs';
import { billTone, rebillBadge, sentLabel, yenS } from '@/lib/corp/docs/logic';
import { areaApi, useQuery } from '@/lib/ops/core/client';
import { useCorpSignedIn } from '../../_ui/CorpProvider';
import { Badge, Button, Card, DocsPage, EmptyState, Inline, LoadError, LoadingState, Ro, Table, Td, useWho } from '../../_docs/ds';

const api = areaApi(corpDocs);

/** 請求書詳細 */
export default function BillDetailPage() {
  return <Suspense><BillDetail /></Suspense>;
}

/**
 * 請求書詳細（元：22_法人_拠点管理.html の Inv）。2026/09/29 hong：請求書の表示・ダウンロードは Bill One になるため、システムでは請求書の内容を出す。
 * 法人あての請求書は、その請求書に入っている拠点をまとめる。拠点の画面から開いたとき（?site=）は、その拠点の分だけ（法人あてなら内訳（参考））。
 * 金額は運営Web の請求書（billing.inv）と同じ。消費税は請求書ごと・税率ごとにまとめて1円未満を四捨五入（2026/10/05 F2）。再請求は税込のまま加える（28-141）。
 * ?from＝戻り先：bills（請求書の一覧）／corp（法人情報の請求タブ）／site（拠点詳細の請求タブ）
 */
function BillDetail() {
  const { no } = useParams<{ no: string }>();
  const sp = useSearchParams();
  const router = useRouter();
  const who = useWho();
  const { view } = useCorpSignedIn();
  const site = sp.get('site');
  const from = sp.get('from') || 'bills';
  const { data: q, error, loading, reload } = useQuery(api, 'bill', { who, no, site, ro: view === 'ro' });
  if (loading) return <DocsPage><LoadingState /></DocsPage>;
  /* 読み込めなかった（通信・サーバーのエラー）：「見つからない」とは別に出す（E346）。見つからないのは、ない番号・見られない請求書（E328） */
  if (error && q === undefined) return <DocsPage><LoadError onRetry={() => reload()} onBack={() => router.push('/corp/bills')} backLabel="請求書の一覧へ戻る" /></DocsPage>;
  /* 見つからない（ない番号・見られない請求書）：標準の空表示だけ（版1.1・No.26。E328） */
  if (!q) {
    return (
      <DocsPage>
        <section className="es-card">
          <EmptyState icon="Receipt" title="請求書が見つかりません" action={<Button variant="outline" onClick={() => router.push('/corp/bills')}>請求書の一覧へ戻る</Button>}>
            請求書番号をご確認いただくか、一覧へお戻りください。
          </EmptyState>
        </section>
      </DocsPage>
    );
  }

  const fromBills = from === 'bills';
  const siteHref = q.site ? `/corp/sites/${q.site.id}?tab=bill` : '/corp/sites';
  const backHref = fromBills ? '/corp/bills' : q.corpInv ? '/corp/corp-info?tab=bill' : siteHref;
  /* 請求金額の表：税率の列（小さい率から・請求書にある率だけ）＋合計。0円のセルは「—」 */
  const cell = (v: number | undefined) => (v ? yenS(v) : '—');
  const hasAct = q.rows.some((r) => r.kind === 'ご利用実績の精算');
  const kindRows = (['固定額', 'ご利用実績の精算'] as const).map((k) => ({ k, rows: q.rows.filter((r) => r.kind === k) })).filter((g) => g.rows.length);
  const cols = q.corpInv ? 4 : 3;
  return (
    <DocsPage>
      <header className="es-pagehead page-h" data-cb-from={from}>
        <div className="es-pagehead__text">
          <nav className="es-breadcrumb" aria-label="パンくず">
            {fromBills ? <Link href={backHref}>請求書</Link> : q.corpInv ? <Link href={backHref}>法人情報</Link> : <Link href="/corp/sites">拠点管理</Link>}
            {q.corpInv || fromBills ? null : <><span className="es-breadcrumb__sep">/</span><Link href={backHref}>拠点詳細 {q.site?.id}</Link></>}
            <span className="es-breadcrumb__sep">/</span><span className="es-breadcrumb__cur">請求書詳細</span>
          </nav>
          <h1 className="es-pagehead__title">請求書詳細 <span className="es-mono">{q.no}</span>{q.final ? <> <Badge tone="neutral">最終請求書</Badge></> : null}</h1>
          <div className="stat">
            <span>{q.dest}</span><span className="k">ご請求月</span><span>{q.mon}</span>
            <span className="k">状態</span><Badge tone={billTone(q.st)}>{q.st}</Badge>
            {q.rebillMark ? <Badge tone="warning">{rebillBadge(q.no, q.rebillMark)}</Badge> : null}
            {/* Bill One：送付できたときだけ「送付済み」、それ以外は「—」（版1.1。送付のエラー・記録は法人に出さない） */}
            <span className="k">送付</span>{sentLabel(q.send?.status) ? <Badge tone="info">{sentLabel(q.send?.status)}</Badge> : <span>—</span>}
          </div>
        </div>
        <div className="es-pagehead__actions"><Button variant="outline" onClick={() => router.push(backHref)}>戻る</Button></div>
      </header>
      <Inline tone="info" title="請求書（PDF）は Bill One からお届けします">
        この画面は、ES STATION に登録されている請求の内容を確認するためのものです。請求書の原本（PDF）の受け取り・保存は、Bill One からのメールでお願いします。
        {q.toCorp ? 'この拠点の分は法人あての請求書にまとめて入るため、ここでは法人の請求書の内訳（参考）として、この拠点の分だけを出しています。' : ''}
      </Inline>
      <div className="cb-stack">
        {/* 番号・ご請求月・宛先・状態・送付は上の見出しに出している（ここでは重ねない）。4列 × 2行 */}
        <div className="cb-top">
        <Card title="請求書の情報">
          <div className="es-formgrid cb-g2">
            <Ro label="発行日" value={q.issued} /><Ro label="入金期限" value={q.due} /><Ro label="支払方法" value={q.pay} /><Ro label="固定額の対象" value={q.tgt} />
            <Ro label="ご利用実績の精算の対象" value={q.actPeriod} /><Ro label="請求書の送付先" value={q.sendTo} className="cb-span2" />
          </div>
        </Card>
        {/* 請求金額：1つの表（右寄せ・縦に短く）。固定額・ご利用実績の精算は税率の列ごと、消費税は税率ごと、再請求と請求金額は合計の列だけ */}
        <Card title={q.toCorp ? '請求金額（この拠点の分・参考）' : '請求金額'}>
          <div className="cb-sum">
            <Table compact cols={[{ label: '' }, ...q.rates.map((x) => ({ label: `${x.r}%対象`, cls: 'r' })), { label: '合計', cls: 'r' }]}>
              <tr><td>固定額（税抜）</td>{q.rates.map((x) => <td key={x.r} className="r es-num">{cell(q.byKind.固定額[x.r])}</td>)}<td className="r es-num">{yenS(q.fixed)}</td></tr>
              {hasAct ? <tr><td>ご利用実績の精算（税抜）</td>{q.rates.map((x) => <td key={x.r} className="r es-num">{cell(q.byKind.ご利用実績の精算[x.r])}</td>)}<td className="r es-num">{yenS(q.act)}</td></tr> : null}
              <tr className="cb-invsum"><td>小計（税抜）</td>{q.rates.map((x) => <td key={x.r} className="r es-num">{cell(x.base)}</td>)}<td className="r es-num">{yenS(q.sub)}</td></tr>
              <tr><td>消費税</td>{q.rates.map((x) => <td key={x.r} className="r es-num">{cell(x.tax)}</td>)}<td className="r es-num">{yenS(q.tax)}</td></tr>
              {q.rebill ? <tr><td>再請求（税込）<span className="es-field__msg">{q.rebill.no}</span></td>{q.rates.map((x) => <td key={x.r} />)}<td className="r es-num">{yenS(q.rebill.amt)}</td></tr> : null}
              <tr className="cb-invsum"><td><b>請求金額（税込）</b></td>{q.rates.map((x) => <td key={x.r} />)}<td className="r es-num"><b>{yenS(q.total)}</b></td></tr>
            </Table>
          </div>
        </Card>
        </div>
        <div className="cb-lines"><Card title="明細">
          {/* 区分（固定額／ご利用実績の精算）は見出しの行。調整は再請求だけ（B-24：調整の種類を出す） */}
          <Table compact cols={[...(q.corpInv ? [{ label: '拠点' }] : []), { label: '費目' }, { label: '数量', cls: 'r' }, { label: '税抜金額', cls: 'r' }, { label: '税率', cls: 'r' }]}>
            {kindRows.map((g) => (
              <Fragment key={g.k}>
                <tr className="cb-grp"><th colSpan={cols + 1} scope="colgroup">{g.k}</th></tr>
                {g.rows.map((r, i) => (
                  <tr key={i}>
                    {q.corpInv ? <Td v={i > 0 && g.rows[i - 1].siteName === r.siteName ? '' : r.siteName} /> : null}<Td v={r.n} /><Td v={r.qty} cls="r es-num" />
                    <Td v={yenS(r.a)} cls="r es-num" /><Td v={r.rate} cls="r es-num" />
                  </tr>
                ))}
              </Fragment>
            ))}
            {q.rebill ? (
              <Fragment>
                <tr className="cb-grp"><th colSpan={cols + 1} scope="colgroup">調整</th></tr>
                <tr>
                  {q.corpInv ? <Td v="—" /> : null}<td>前月以前のご請求の再請求（{q.rebill.no}） <Badge tone="warning">再請求</Badge></td>
                  <Td v="1" cls="r es-num" /><Td v={yenS(q.rebill.amt)} cls="r es-num" /><Td v="税込のまま" cls="r" />
                </tr>
              </Fragment>
            ) : null}
          </Table>
          <p className="note">
            費目は請求書に載る名前です。金額は税抜で、消費税は請求書ごとに税率ごとにまとめて計算し、1円未満は四捨五入します。プラン料金は、福利厚生の適用が ON のご契約は「基本料金」と「福利厚生（企業負担分）」の2行、OFF のご契約は1行でお出しします（どちらも費目ごとの税率で計算します）。
            {q.toCorp ? 'この画面は法人の請求書の内訳（参考）です。この拠点の分の消費税も、法人の請求書と同じ規則（税率ごとに合計して1円未満を四捨五入）で求めています。法人の請求書の消費税は請求書全体で計算するため、拠点ごとの合計と1円ずれることがあります。' : ''}
            {q.rebill ? '入金が確認できなかった前月以前の請求書は、この請求書に「調整（再請求）」として税込のまま加えて再請求します。' : ''}
          </p>
        </Card></div>
      </div>
    </DocsPage>
  );
}
