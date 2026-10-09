'use client';

import { useParams, useRouter } from 'next/navigation';
import carrier from '@/lib/carrier/area';
import { sumRows, yen } from '@/lib/carrier/logic';
import { areaApi, useQuery } from '@/lib/ops/core/client';
import { Icon } from '../../_ui/Icon';
import { useCarrierSignedIn } from '../../_ui/CarrierProvider';
import { Crumb, Fld, Loading, NotFound } from '../../_ui/parts';
import { KindTag, LockNote, ReqFields, StBadge } from '../_parts';
import { fmtDateTime } from '@/lib/format/date';
import { carrierCls } from '@/lib/format/status';

/** 見積依頼詳細（元の quoteDetail()・quote-details）：依頼内容・自社の回答・回答履歴 */
export default function CarrierQuoteDetail() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { company } = useCarrierSignedIn();
  const { data } = useQuery(areaApi(carrier), 'quote', { company, id });
  const crumb = <Crumb items={[['ホーム', '/carrier'], ['見積依頼一覧', '/carrier/quotes'], '見積依頼詳細']} />;
  if (data === undefined) return <>{crumb}<Loading /></>;
  if (!data) return <>{crumb}<NotFound text={`見積依頼 ${id} は見つかりません。`} back="見積依頼一覧に戻る" href="/carrier/quotes" /></>;
  const { q, answer: a } = data;
  const ng = a.type === 'ng', exp = a.type === 'expired', done = q.st === '対応不可' || q.st === '期限切れ';
  const total = a.rows ? sumRows(a.rows) : 0;
  const link = (s?: string) => <div className="inp ro"><a href="#" onClick={(e) => e.preventDefault()}>{s}</a><Icon name="ext" /></div>;
  return (
    <>
      {crumb}
      <div className="phead"><div><h1 className="ptitle">見積依頼詳細 <StBadge s={q.st} /></h1><p className="sub">依頼内容、自社の回答、見積書、回答履歴を確認できます。</p></div></div>
      <div className="qgrid">
        <section className="card"><h2 className="ch">依頼内容 <KindTag k={q.kind} /></h2><LockNote /><ReqFields q={q} withHead /></section>
        <section className="card qform">
          <h2 className="ch">自社の回答</h2>
          {exp ? (
            <><div className="fld"><span className="lb">回答</span><span><b>回答しないまま期限が過ぎました</b></span></div><Fld label="回答期限" value={fmtDateTime(a.dueAt)} /></>
          ) : (
            <>
              <div className="fld"><span className="lb">回答</span><span>{ng ? <span className={`badge ${carrierCls('対応不可')}`}>対応不可</span> : <span className={`badge ${carrierCls('承認')}`}>承認</span>}</span></div>
              {ng ? (
                <><Fld label="NG理由" value={a.reason} /><Fld label="コメント"><textarea className="inp" readOnly value={a.comment || '—'} /></Fld></>
              ) : (
                <>
                  <Fld label="見積金額（税抜）"><div className="total"><b className="num">{yen(total)}</b></div></Fld>
                  <div className="fld"><span className="lb">料金内訳</span><div className="tbl-wrap"><table className="tbl" style={{ minWidth: 0 }}><tbody>{(a.rows ?? []).filter((r) => r[0]).map((r, i) => <tr key={i}><td>{r[0]}</td><td className="num r">{yen(r[1])}</td></tr>)}</tbody></table></div></div>
                  <Fld label="見積書">{link(a.file)}</Fld>
                  <Fld label="最短開始可能日" value={a.start} />
                  <Fld label="補足コメント"><textarea className="inp" readOnly value={a.comment || '—'} /></Fld>
                </>
              )}
              {a.at ? <Fld label="回答日時" value={fmtDateTime(a.at)} /> : <Fld label="回答日" value={a.date} />}
            </>
          )}
          {!done && <button type="button" className="btn out" onClick={() => router.push(`/carrier/quotes/${q.id}/answer`)}><Icon name="pen" />回答を修正</button>}
        </section>
      </div>
      <section className="card">
        <h2 className="ch">回答履歴</h2>
        <ol className="tl">{a.hist.map((h, i) => <li key={i} className={h[2] === 'ESキッチン' ? 'ops' : 'self'}><time className="num">{fmtDateTime(h[0])}</time><div><b>{h[1]}</b><span>{h[2]}</span></div></li>)}</ol>
      </section>
    </>
  );
}
