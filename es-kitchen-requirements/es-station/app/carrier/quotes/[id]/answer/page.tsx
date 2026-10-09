'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import carrier from '@/lib/carrier/area';
import { checkQuoteAnswer, checkQuoteFile, sumRows, yen, type Errors } from '@/lib/carrier/logic';
import { NG_REASONS, PREV } from '@/lib/carrier/seed';
import type { Quote, QuoteAnswerInput } from '@/lib/carrier/types';
import { areaApi, useQuery } from '@/lib/ops/core/client';
import { useOpsLeaveGuard } from '@/lib/ui/leaveGuard';
import { Icon } from '../../../_ui/Icon';
import { useCarrierSignedIn } from '../../../_ui/CarrierProvider';
import { Crumb, Fld, Loading, NotFound } from '../../../_ui/parts';
import { DueBadge, KindTag, LockNote, ReqFields } from '../../_parts';
import { DateInput } from '@/components/DateInput';
import { fmtDate } from '@/lib/format/date';

type QA = Omit<QuoteAnswerInput, 'company' | 'id'>;

/** 見積依頼回答（元の quoteAnswer()・quote-response）：新規見積＝承認・NG、金額再確認＝変更なし・金額変更・NG */
export default function CarrierQuoteAnswer() {
  const { id } = useParams<{ id: string }>();
  const { company } = useCarrierSignedIn();
  const { data } = useQuery(areaApi(carrier), 'quote', { company, id });
  const crumb = <Crumb items={[['ホーム', '/carrier'], ['見積依頼一覧', '/carrier/quotes'], '見積依頼回答']} />;
  if (data === undefined) return <>{crumb}<Loading /></>;
  if (!data) return <>{crumb}<NotFound text={`見積依頼 ${id} は見つかりません。`} back="見積依頼一覧に戻る" href="/carrier/quotes" /></>;
  return <>{crumb}<AnswerForm key={data.q.id} q={data.q} company={company} self={data.company} /></>;
}

function AnswerForm({ q, company, self }: { q: Quote; company: string; self: string }) {
  const router = useRouter();
  const { toast, toastError } = useCarrierSignedIn();
  const re = q.kind === '金額再確認';
  const [a, setA] = useState<QA>({ mode: re ? 'same' : 'ok', rows: [['基本配送料（月額）', ''], ['クール便加算', ''], ['車両・人員費', '']], ng: '', ngc: '', newAmt: '' });
  const [touched, setTouched] = useState(false);
  const [errs, setErrs] = useState<Errors>({});
  const [busy, setBusy] = useState(false);
  useOpsLeaveGuard(touched && !busy);
  const set = (p: Partial<QA>) => { setA({ ...a, ...p }); setTouched(true); };
  const done = q.st === '対応不可' || q.st === '期限切れ';
  const err = (k: string) => (errs[k] ? <span className="err">{errs[k]}</span> : null);

  const fileField = (k: 'file' | 'file2', id: string, label: string) => {
    const f = a[k];
    return (
      <div className="fld">
        <span className="lb">{label}<span className="req">*</span></span>
        <label className={`drop ${f ? 'has' : ''}`} htmlFor={id}>
          <Icon name={f ? 'check' : 'plus'} /><span>{f || 'ファイルをドラッグ＆ドロップ、またはクリックして選択'}</span>
          <input type="file" id={id} hidden accept=".pdf,.xls,.xlsx" onChange={(e) => {
            const x = e.target.files?.[0];
            if (!x) return;
            const m = checkQuoteFile(x.name, x.size);
            if (m) { setErrs({ ...errs, [k === 'file' ? 'qfile' : 'qfile2']: m }); return; }
            setErrs({ ...errs, [k === 'file' ? 'qfile' : 'qfile2']: '' });
            set({ [k]: x.name });
          }} />
        </label>
        <span className="hint">PDFまたはExcel形式、最大10MB</span>
        {err(k === 'file' ? 'qfile' : 'qfile2')}
      </div>
    );
  };
  const ngBlock = (
    <>
      <div className="fld">
        <span className="lb">NG理由<span className="req">*</span></span>
        <div className="radios col">{NG_REASONS.map((r) => <label key={r}><input type="radio" name="ngr" value={r} checked={a.ng === r} onChange={() => set({ ng: r })} />{r}</label>)}</div>
        {err('ngr')}
      </div>
      <div className="fld">
        <label htmlFor="ngc">コメント{a.ng === 'その他' && <span className="req">*</span>}</label>
        <textarea className="inp" id="ngc" maxLength={500} placeholder={a.ng === 'その他' ? 'NG理由を具体的に入力してください。' : '補足があれば入力してください。'} value={a.ngc ?? ''} onChange={(e) => set({ ngc: e.target.value })} />
        {err('ngc')}
      </div>
    </>
  );

  const submit = async () => {
    const e = checkQuoteAnswer({ ...a, company, id: q.id });
    setErrs(e);
    if (Object.keys(e).length) return;
    setBusy(true);
    try {
      const r = await areaApi(carrier).action('answerQuote', { ...a, company, id: q.id });
      router.push(`/carrier/quotes/${q.id}`);
      toast(r.msg);
    } catch (x) {
      setBusy(false);
      toastError(x);
    }
  };

  let form;
  if (!re) {
    const sum = sumRows(a.rows);
    form = (
      <>
        <div className="fld">
          <span className="lb">対応可否<span className="req">*</span></span>
          <div className="seg" role="radiogroup">
            <label className={a.mode === 'ok' ? 'on' : ''}><input type="radio" name="mode" value="ok" checked={a.mode === 'ok'} onChange={() => set({ mode: 'ok' })} />承認・見積可能</label>
            <label className={a.mode === 'ng' ? 'on ng' : ''}><input type="radio" name="mode" value="ng" checked={a.mode === 'ng'} onChange={() => set({ mode: 'ng' })} />対応不可（NG）</label>
          </div>
        </div>
        {a.mode === 'ok' ? (
          <>
            <div className="fld">
              <span className="lb">料金内訳（税抜）</span>
              <div className="tbl-wrap">
                <table className="tbl brk" style={{ minWidth: 0 }}>
                  <thead><tr><th>項目</th><th className="r" style={{ width: '10.714286rem' }}>金額（税抜）</th><th style={{ width: '3.142857rem' }} /></tr></thead>
                  <tbody>{a.rows.map((r, i) => (
                    <tr key={i}>
                      <td><input className="inp" value={r[0]} placeholder="項目名" aria-label="項目名" onChange={(e) => set({ rows: a.rows.map((x, j) => (j === i ? [e.target.value, x[1]] : x)) })} /></td>
                      <td><input className="inp num" inputMode="numeric" value={r[1] ? Number(r[1]).toLocaleString('ja-JP') : ''} placeholder="0" aria-label="金額（税抜）" onChange={(e) => set({ rows: a.rows.map((x, j) => (j === i ? [x[0], e.target.value.replace(/\D/g, '')] : x)) })} /></td>
                      <td><button type="button" className="x" style={{ color: 'var(--red)' }} aria-label="行を削除" disabled={a.rows.length < 2} onClick={() => set({ rows: a.rows.filter((_, j) => j !== i) })}><Icon name="trash" /></button></td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
              <div><button type="button" className="btn out sm" onClick={() => set({ rows: [...a.rows, ['', '']] })}><Icon name="plus" />行を追加</button></div>
            </div>
            <div className="fld">
              <span className="lb">見積金額（税抜）<span className="req">*</span></span>
              <div className="total"><b className="num">{yen(sum)}</b><span className="hint">料金内訳の合計が自動で反映されます</span></div>
              {err('sum')}
            </div>
            {fileField('file', 'qfile', '見積書添付')}
            <div className="fld"><label htmlFor="sd">最短開始可能日<span className="req">*</span></label><DateInput className="inp" id="sd" value={a.sd ?? ''} onChange={(e) => set({ sd: e.target.value })} />{err('sd')}</div>
            <div className="fld"><label htmlFor="qcm">補足コメント</label><textarea className="inp" id="qcm" maxLength={1000} placeholder="補足情報や特記事項、条件等があれば入力してください。" value={a.cm ?? ''} onChange={(e) => set({ cm: e.target.value })} /></div>
            <button className="btn pri submit" disabled={busy || done}>回答を送信</button>
          </>
        ) : <>{ngBlock}<button className="btn submit ngbtn" disabled={busy || done}>NG回答を送信</button></>}
      </>
    );
  } else {
    form = (
      <>
        <div className="prev">
          <div className="grid3">
            <Fld label="前回見積金額（税抜）" value={yen(PREV.amount)} />
            <Fld label="前回見積書"><div className="inp ro"><a href="#" onClick={(e) => e.preventDefault()}>{`見積書_${self}.pdf`}</a><Icon name="ext" /></div></Fld>
            <Fld label="前回回答日" value={fmtDate(PREV.date)} />
          </div>
          <p className="sub" style={{ marginTop: '0.714286rem' }}>運営からのメッセージ：{PREV.msg}</p>
        </div>
        <div className="fld">
          <span className="lb">再確認の回答<span className="req">*</span></span>
          <div className="radios col">{([['same', '金額・条件とも変更なし'], ['change', '金額変更あり'], ['ng', '対応不可（NG）']] as const).map(([v, l]) => <label key={v}><input type="radio" name="mode" value={v} checked={a.mode === v} onChange={() => set({ mode: v })} />{l}</label>)}</div>
        </div>
        {a.mode === 'change' && (
          <>
            <div className="fld"><label htmlFor="newAmt">新しい見積金額（税抜）<span className="req">*</span></label><input className="inp num" id="newAmt" inputMode="numeric" placeholder="例：360,000" value={a.newAmt ? yen(a.newAmt) : ''} onChange={(e) => set({ newAmt: e.target.value.replace(/\D/g, '') })} />{err('newAmt')}</div>
            {fileField('file2', 'qfile2', '新しい見積書')}
            <div className="fld"><label htmlFor="chg">変更理由</label><textarea className="inp" id="chg" placeholder="例：燃料費の上昇に伴い、クール便加算を見直しました。" value={a.chg ?? ''} onChange={(e) => set({ chg: e.target.value })} /></div>
          </>
        )}
        {a.mode === 'ng' && ngBlock}
        <button className={`btn submit ${a.mode === 'ng' ? 'ngbtn' : 'pri'}`} disabled={busy || done}>{a.mode === 'ng' ? 'NG回答を送信' : '再確認の回答を送信'}</button>
      </>
    );
  }

  return (
    <>
      <div className="phead"><div><h1 className="ptitle">見積依頼回答 <span className="badge b-amber" style={{ fontSize: '0.928571rem' }}>{re ? '再確認待ち' : '未回答'}</span></h1><p className="sub">運営が設定した依頼内容を確認し、対応可否と見積情報を回答してください。</p></div></div>
      <div className="card qhead">
        <div><KindTag k={q.kind} /></div>
        <div className="grid4">
          <Fld label="案件ID" value={q.id} />
          <Fld label="件名" cls="span2"><div className="inp ro">{q.t}</div></Fld>
          <Fld label="対象法人"><div className="inp ro">{q.corp}</div></Fld>
          <Fld label="回答期限"><div className="inp ro">{q.req.dueJ} <DueBadge due={q.due} /></div></Fld>
        </div>
      </div>
      <div className="qgrid">
        <section className="card"><h2 className="ch">運営が設定した依頼内容</h2><LockNote /><ReqFields q={q} /></section>
        <form className="card qform" noValidate onSubmit={(e) => { e.preventDefault(); submit(); }}>
          <h2 className="ch">{re ? '金額再確認への回答' : '回答フォーム'}</h2>
          {done && <p className="err" style={{ margin: 0 }}>この見積依頼は{q.st}のため、回答できません。</p>}
          {form}
        </form>
      </div>
    </>
  );
}
