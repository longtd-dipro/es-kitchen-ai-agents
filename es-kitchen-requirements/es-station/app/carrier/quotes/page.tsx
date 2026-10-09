'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import carrier from '@/lib/carrier/area';
import { isoOf, OPEN_ST, QSTATUS } from '@/lib/carrier/logic';
import { areaApi, useQuery } from '@/lib/ops/core/client';
import { Icon } from '../_ui/Icon';
import { useCarrierSignedIn } from '../_ui/CarrierProvider';
import { Crumb, Loading, Unapplied } from '../_ui/parts';
import { DueCell, KindTag, StBadge } from './_parts';
import { DateInput } from '@/components/DateInput';
import { carrierCls } from '@/lib/format/status';

type QF = { kw: string; kind: string; st: string; due: string };
const QF0: QF = { kw: '', kind: 'すべて', st: 'すべて', due: '' };

/** 見積依頼一覧（元の quotes()・quote-list） */
export default function CarrierQuotes() {
  const { company } = useCarrierSignedIn();
  const router = useRouter();
  const { data } = useQuery(areaApi(carrier), 'quotes', { company });
  const [draft, setDraft] = useState<QF>(QF0);
  const [f, setF] = useState<QF | null>(null);
  const crumb = <><Crumb items={[['ホーム', '/carrier'], '見積依頼一覧']} /><div className="phead"><div><h1 className="ptitle">見積依頼一覧</h1><p className="sub">自社に届いた新規見積と契約前の再確認依頼を確認できます。</p></div></div></>;
  if (!data) return <>{crumb}<Loading /></>;
  const shown = data.filter((q) => !f || ((f.st === 'すべて' || q.st === f.st) && (f.kind === 'すべて' || q.kind === f.kind)
    && (!f.kw || [q.id, q.t, q.corp, q.kind, q.ship, q.due, q.st].join(' ').includes(f.kw)) && (!f.due || isoOf(q.due) === f.due)));
  const kpis: [string, number, string, string][] = [
    ['未回答', data.filter((q) => q.st === '未回答').length, 'var(--amber)', '要対応'],
    ['回答済', data.filter((q) => q.st === '回答済').length, 'var(--green)', ''],
    ['金額再確認', data.filter((q) => q.kind === '金額再確認').length, 'var(--purple)', '確認待ち'],
    ['すべての依頼', data.length, 'var(--text)', ''],
  ];
  const kpi = (k: string) => {
    const m = ({ '未回答': ['すべて', '未回答'], '回答済': ['すべて', '回答済'], '金額再確認': ['金額再確認', 'すべて'], 'すべての依頼': ['すべて', 'すべて'] } as Record<string, string[]>)[k];
    const next = { ...draft, kind: m[0], st: m[1] };
    setDraft(next); setF({ ...next, kw: next.kw.trim() });
  };
  const sinput = { border: 0, outline: 0, background: 'none', flex: 1, minWidth: 0 } as const;
  return (
    <>
      {crumb}
      <form className="box filters" onSubmit={(e) => { e.preventDefault(); setF({ ...draft, kw: draft.kw.trim() }); }} onReset={() => { setDraft(QF0); setF(QF0); }}>
        <div className="fld span2"><label htmlFor="qk">キーワード</label><div className="inp"><Icon name="search" /><input id="qk" style={sinput} placeholder="法人名・件名・案件IDで検索" value={draft.kw} onChange={(e) => setDraft({ ...draft, kw: e.target.value })} /></div></div>
        <div className="fld"><label htmlFor="qt">依頼種別</label><select className="inp" id="qt" value={draft.kind} onChange={(e) => setDraft({ ...draft, kind: e.target.value })}><option>すべて</option><option>新規見積</option><option>金額再確認</option></select></div>
        <div className="fld"><label htmlFor="qs">回答状況</label><select className="inp" id="qs" value={draft.st} onChange={(e) => setDraft({ ...draft, st: e.target.value })}><option>すべて</option>{Object.keys(QSTATUS).map((s) => <option key={s}>{s}</option>)}</select></div>
        <div className="fld"><label htmlFor="qd">回答期限</label><DateInput className="inp" id="qd" value={draft.due} onChange={(e) => setDraft({ ...draft, due: e.target.value })} /></div>
        <span />
        <button type="reset" className="btn out">クリア</button><Unapplied show={JSON.stringify({ ...draft, kw: draft.kw.trim() }) !== JSON.stringify(f ?? QF0)} /><button className="btn pri" style={{ minHeight: '2.857143rem' }}>絞り込む</button>
      </form>
      <div className="kpis">
        {kpis.map((k) => (
          <button type="button" key={k[0]} className="kpi" onClick={() => kpi(k[0])}>
            <div className="h">{k[0]}{k[3] && <span className={`badge ${carrierCls(k[0])}`}>{k[3]}</span>}</div>
            <b className="num" style={{ color: k[2] }}>{k[1]}</b><small>件</small>
          </button>
        ))}
      </div>
      <div className="box">
        <div className="tbl-wrap">
          <table className="tbl" id="qtbl">
            <thead><tr><th>案件ID</th><th>件名</th><th>対象法人</th><th>依頼種別</th><th>配送方法</th><th>回答期限</th><th>ステータス</th><th>操作</th></tr></thead>
            <tbody>
              {shown.map((q) => {
                const open = OPEN_ST.includes(q.st);
                return (
                  <tr key={q.id} className={open ? 'open' : ''}>
                    <td className="num">{q.id}</td><td style={{ minWidth: '18.571429rem' }}>{q.t}</td><td>{q.corp}</td><td><KindTag k={q.kind} /></td><td>{q.ship}</td><td><DueCell q={q} /></td><td><StBadge s={q.st} /></td>
                    <td>{open
                      ? <button type="button" className="btn pri sm" onClick={() => router.push(`/carrier/quotes/${q.id}/answer`)}>回答する</button>
                      : <button type="button" className="btn sm" onClick={() => router.push(`/carrier/quotes/${q.id}`)}>詳細を見る</button>}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {!shown.length && <p className="empty">条件に一致する見積依頼はありません。</p>}
        <div className="pager">
          <span>{f ? `${shown.length}件を表示` : `${data.length}件中 1-${data.length}件を表示`}</span>
          <button type="button" aria-label="前へ">‹</button><button type="button" className="on">1</button><button type="button" aria-label="次へ">›</button>
        </div>
        <div className="legend" style={{ border: 0, padding: 0 }}><div className="row"><span><span className="badge b-amber">残りN日</span> 回答期限まで3日以内</span><span><span className="badge b-red">本日期限</span> 当日・期限超過</span></div></div>
      </div>
    </>
  );
}
