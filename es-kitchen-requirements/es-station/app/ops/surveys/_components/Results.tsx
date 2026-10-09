'use client';

import { useState } from 'react';
import { useDomainQuery } from '@/lib/domain/client';
import { SURVEY_QTYPES, type SurveyQType } from '@/lib/domain/survey';
import { fmtDateTime } from '@/lib/format/date';
import { Icon } from '../../_ui/Icon';
import { OpsCsvExport } from '../../_ui/csv';
import { MiniPager, svApi } from './parts';

const Q_PER = 10, T_PER = 5;
type Flt = { q: string; corpId: string; branchId: string; qtype: SurveyQType | '' };
const NONE: Flt = { q: '', corpId: '', branchId: '', qtype: '' };

/**
 * 回答の集計（Phase 1 画面 28：公開中・終了・配信停止のアンケートの 設問 タブ）。
 * 絞り込み：設問文・法人・拠点・設問タイプ。選択の設問は選択肢ごとの割合（その設問に答えた人のうち）と件数のバー、
 * 自由記述は回答の一覧（回答者／法人・拠点）。
 * 回答の CSV出力（2026/10/03 決定）：1行＝回答者1人、列＝回答ID・ユーザー・法人・拠点・回答日時＋設問ごと（選択肢は「;」でつなぐ）。法人・拠点の絞り込みのとおり
 */
export function Results({ id }: { id: string }) {
  const [inp, setInp] = useState<Flt>(NONE);
  const [flt, setFlt] = useState<Flt>(NONE);
  const [open, setOpen] = useState(true);
  const [page, setPage] = useState(1);
  const [tp, setTp] = useState<Record<string, number>>({});
  const { data } = useDomainQuery(svApi, 'results', { id, ...flt });
  const { data: tbl } = useDomainQuery(svApi, 'answersTable', { id, corpId: flt.corpId, branchId: flt.branchId });
  if (!data) return <div className="ph-empty"><span>読み込み中…</span></div>;
  const branches = data.branches.filter((b) => !inp.corpId || b.corpId === inp.corpId);
  const qs = data.questions.slice((page - 1) * Q_PER, page * Q_PER);
  const go = (f: Flt) => { setFlt(f); setPage(1); setTp({}); };

  return (
    <>
      <div className={`filter${open ? '' : ' closed'}`}>
        <button className="tog" aria-label="絞り込みの開閉" onClick={() => setOpen(!open)}><Icon name="up" /></button>
        <div className="f-grid">
          <div className="search"><Icon name="search" /><input className="inp" placeholder="設問文" value={inp.q} onChange={(e) => setInp({ ...inp, q: e.target.value })} onKeyDown={(e) => { if (e.key === 'Enter') go(inp); }} /></div>
          <div>
            <select className="sel" aria-label="法人" value={inp.corpId} onChange={(e) => setInp({ ...inp, corpId: e.target.value, branchId: '' })}>
              <option value="">法人</option>{data.corps.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <select className="sel" aria-label="拠点" value={inp.branchId} onChange={(e) => setInp({ ...inp, branchId: e.target.value })}>
              <option value="">拠点</option>{branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
          <div className="f-extra">
            <select className="sel" aria-label="設問タイプ" value={inp.qtype} onChange={(e) => setInp({ ...inp, qtype: e.target.value as Flt['qtype'] })}>
              <option value="">設問タイプ</option>{SURVEY_QTYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="f-act">
            <button className="btn out" onClick={() => { setInp(NONE); go(NONE); }}>クリア</button>
            <button className="btn pri" onClick={() => go(inp)}>検索</button>
          </div>
        </div>
      </div>
      {tbl && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.571429rem' }}>
          <OpsCsvExport<(typeof tbl.rows)[number]> className="btn csv" screen={`アンケート回答_${id}`} rows={tbl.rows}
            filters={[{ label: '法人', value: data.corps.find((c) => c.id === flt.corpId)?.name ?? '' }, { label: '拠点', value: data.branches.find((b) => b.id === flt.branchId)?.name ?? '' }]}
            columns={[
              { label: '回答ID', get: (r) => r.responseId }, { label: 'ユーザーID', get: (r) => r.userId }, { label: 'ユーザー', get: (r) => r.name },
              { label: '法人ID', get: (r) => r.corpId }, { label: '法人名', get: (r) => r.corpName }, { label: '拠点ID', get: (r) => r.branchId }, { label: '拠点名', get: (r) => r.branchName },
              { label: '回答日時', type: 'datetime', get: (r) => r.answeredAt },
              ...tbl.questions.map((q) => ({ label: `Q${q.order} ${q.text}`, get: (r: (typeof tbl.rows)[number]) => r.answers[q.id] ?? '' })),
            ]}>
            <Icon name="down" />回答のCSV出力（{tbl.rows.length}名）
          </OpsCsvExport>
        </div>
      )}
      <p className="hint" style={{ margin: '0 0 0.857143rem' }}>回答者 {data.respondents} 名{flt.corpId || flt.branchId ? '（絞り込み中）' : ''}。割合＝その設問に答えた人のうち、その選択肢を選んだ人の割合（複数選択は合計が100%を超えます）。</p>
      {!qs.length && <div className="ph-empty"><span>条件に合う設問がありません。</span></div>}
      {qs.map((q) => {
        const p = tp[q.id] ?? 1;
        return (
          <section key={q.id} className="sec">
            <div className="sec-h">
              <h2 style={{ flex: 1 }}>Q{q.order}　{q.text}</h2>
              <span style={{ display: 'flex', gap: '0.571429rem', alignItems: 'center' }}>
                <span className="badge b-info">{q.type}</span>
                {q.required ? <span className="badge b-ng">必須</span> : <span className="badge b-mute">任意</span>}
                <span className="muted" style={{ whiteSpace: 'nowrap' }}>回答 {q.n} 名</span>
              </span>
            </div>
            {q.type !== '自由記述' ? (
              <div className="sec-b">
                {q.options.map((o) => (
                  <div key={o.label} style={{ display: 'grid', gridTemplateColumns: 'minmax(8.571429rem,12.857143rem) 1fr 4rem 4rem', gap: '1.142857rem', alignItems: 'center', padding: '0.428571rem 0' }}>
                    <span>{o.label}</span>
                    <span role="img" aria-label={`${o.label} ${o.pct}%`} className="meter"><span style={{ width: `${o.pct}%` }} /></span>
                    <b style={{ textAlign: 'right', fontSize: '1.142857rem' }}>{o.pct}%</b>
                    <span style={{ textAlign: 'right' }}>{o.count}件</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="sec-b">
                {!q.texts.length && <span className="muted">回答はまだありません。</span>}
                {q.texts.slice((p - 1) * T_PER, p * T_PER).map((t, i) => (
                  <div key={i} style={{ borderLeft: '3px solid var(--line-strong)', background: 'var(--surface-2)', padding: '0.714286rem 1rem', marginBottom: '0.571429rem' }}>
                    <div>{t.text}</div>
                    <div className="muted" style={{ fontSize: '0.857143rem', marginTop: '0.285714rem' }}>
                      {t.name}／{[t.corpName, t.branchName.replace(t.corpName, '').trim()].filter(Boolean).join('・') || '—'}<span style={{ marginLeft: '0.571429rem' }}>{fmtDateTime(t.at)}</span>
                    </div>
                  </div>
                ))}
                {q.texts.length > 0 && <MiniPager total={q.texts.length} page={p} per={T_PER} onPage={(n) => setTp({ ...tp, [q.id]: n })} />}
              </div>
            )}
          </section>
        );
      })}
      {data.questions.length > Q_PER && <MiniPager total={data.questions.length} page={page} per={Q_PER} onPage={setPage} />}
    </>
  );
}
