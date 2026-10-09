'use client';

import { useState, type ReactNode } from 'react';
import { STAFF_KINDS } from '@/lib/corp/docs/apply/data';
import type { FieldDef, Staff } from '@/lib/corp/docs/apply/types';
import { MonthInput } from '@/components/DateInput';
import { fmtAutoNode } from '@/lib/format/date';
import { corpTerm } from '@/lib/domain/terms';

/* 申込フォームの共通の部品（元の field・fields・staffTable・more・kv） */

/** HTML に入れる文字を逃がす（確認画面の表は元と同じく HTML の文字列で組む） */
export const esc = (s: unknown) =>
  String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
/** 決まった文言の HTML（補足・注記。入力値は入れない） */
export const H = ({ html, as: T = 'span', className }: { html: string; as?: 'span' | 'div'; className?: string }) => (
  <T className={className} dangerouslySetInnerHTML={{ __html: html }} />
);

/** 長い説明は畳む。読まなくても進める人の邪魔をしない */
export function More({ label, children }: { label: string; children: ReactNode }) {
  return (
    <details className="more">
      <summary>{label}</summary>
      <div className="mbx">{children}</div>
    </details>
  );
}

export function Kv({ rows }: { rows: [string, ReactNode][] }) {
  return (
    <div className="kv">
      {rows.map(([k, v], i) => (
        <div key={i}><div className="k">{k}</div><div className={`v${v ? '' : ' mut'}`}>{fmtAutoNode(v) || '—'}</div></div>
      ))}
    </div>
  );
}

type FieldProps = {
  f: FieldDef;
  value: unknown;
  err?: string;
  onChange: (v: string) => void;
  onZip?: (scope: string) => void;
};
/** 入力欄1つ。補足は常に出さない。？を押すか、その欄に入ったときだけ出す */
export function Field({ f, value, err, onChange, onZip }: FieldProps) {
  const [hint, setHint] = useState(false);
  const v = value == null ? '' : String(value);
  let body: ReactNode;
  if (f.type === 'ro') body = <div className="ro lock">{f.value || '—'}</div>;
  else if (f.type === 'sel') {
    const o0 = f.opts?.[0], first = o0 == null ? '' : typeof o0 === 'object' ? o0.v : o0;
    body = (
      <select id={f.id} value={v || (f.ph ? '' : first)} onChange={(e) => onChange(e.target.value)}>
        {f.ph && <option value="">{f.ph}</option>}
        {(f.opts || []).map((o, j) => {
          const ov = typeof o === 'object' ? o.v : o, ot = corpTerm(typeof o === 'object' ? o.t : o);
          return <option key={j} value={ov} disabled={typeof o === 'object' && o.ok === false}>{ot}</option>;
        })}
      </select>
    );
  } else if (f.type === 'ta') body = <textarea id={f.id} value={v} placeholder={f.ph || ''} onChange={(e) => onChange(e.target.value)} />;
  else if (f.type === 'month') body = <MonthInput id={f.id} value={v} onChange={(e) => onChange(e.target.value)} />;
  else if (f.type === 'zip') {
    body = (
      <div className="zipwrap">
        <input id={f.id} type="text" value={v} placeholder={f.ph || undefined} onChange={(e) => onChange(e.target.value)} />
        <button type="button" className="btn" onClick={() => onZip?.(f.scope || '')}><span className="ico">🔍</span>住所検索</button>
      </div>
    );
  } else body = <input id={f.id} type="text" value={v} placeholder={f.ph || undefined} onChange={(e) => onChange(e.target.value)} />;
  return (
    <div className={`fld${f.wide ? ' wide' : ''}${err ? ' bad' : ''}${hint ? ' hintopen' : ''}`} id={'w_' + f.id}>
      <div className="fl">
        <label htmlFor={f.id}>{f.label}{f.req && <span className="rq">必須</span>}</label>
        {f.hint && (
          <button type="button" className="fq" onClick={() => setHint(!hint)} aria-label={f.label + 'の説明を表示'} aria-expanded={hint}>?</button>
        )}
      </div>
      {body}
      {f.hint && <H as="div" className="fh" html={f.hint} />}
      <div className="er">{err || f.err || f.label + 'をご入力ください。'}</div>
    </div>
  );
}

/** 欄を並べる（store の f.key の値を出し、変えたら onSet） */
export function Fields({ list, store, errs, onSet, onZip }: {
  list: FieldDef[];
  store: Record<string, unknown>;
  errs: Record<string, string>;
  onSet: (f: FieldDef, v: string) => void;
  onZip: (scope: string) => void;
}) {
  return (
    <div className="frow">
      {list.map((f) => <Field key={f.id} f={f} value={store[f.key]} err={errs[f.id]} onChange={(v) => onSet(f, v)} onZip={onZip} />)}
    </div>
  );
}

/** 担当者テーブル（法人・拠点で同じもの） */
export function StaffTable({ scope, rows, note, err, onSet, onAdd, onDel }: {
  scope: string;
  rows: Staff[];
  note: ReactNode;
  err?: { msg: string; rows: number[] };
  onSet: (i: number, k: keyof Staff, v: string) => void;
  onAdd: () => void;
  onDel: (i: number) => void;
}) {
  const cell = (r: Staff, i: number, k: 'name' | 'kana' | 'mail' | 'tel', ph: string) => (
    <td><input id={`st_${scope}_${i}_${k}`} type="text" value={r[k] || ''} placeholder={ph} onChange={(e) => onSet(i, k, e.target.value)} /></td>
  );
  return (
    <>
      <div className="scrollx">
        <table className="t stf">
          <thead>
            <tr>
              <th style={{ minWidth: '9.142857rem' }}>区分<span className="rq">必須</span></th>
              <th style={{ minWidth: '9.285714rem' }}>担当者名<span className="rq">必須</span></th>
              <th style={{ minWidth: '10rem' }}>フリガナ<span className="rq">必須</span></th>
              <th style={{ minWidth: '13.571429rem' }}>メールアドレス<span className="rq">必須</span></th>
              <th style={{ minWidth: '9.285714rem' }}>電話番号</th>
              <th className="c" style={{ minWidth: '4.857143rem' }}>操作</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} id={`w_st_${scope}_${i}_row`} className={err?.rows.includes(i) ? 'bad' : undefined}>
                <td>
                  <select id={`st_${scope}_${i}_kind`} value={r.kind} onChange={(e) => onSet(i, 'kind', e.target.value)}>
                    {STAFF_KINDS.map((k) => <option key={k} value={k}>{k}</option>)}
                  </select>
                </td>
                {cell(r, i, 'name', '例）佐藤 誠')}
                {cell(r, i, 'kana', '例）サトウ マコト')}
                {cell(r, i, 'mail', '例）sato@example.co.jp')}
                {cell(r, i, 'tel', '例）03-5555-0101')}
                <td className="c">
                  {rows.length > 1 ? <button type="button" className="btn sm ghostred" onClick={() => onDel(i)}>削除</button> : <span className="mm">—</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ marginTop: '0.642857rem', display: 'flex', gap: '0.714286rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <button type="button" className="btn sm" onClick={onAdd}><span className="ico">＋</span>担当者を追加</button>
        <span className="mm">{note}</span>
      </div>
      <div id={`e_st_${scope}`} className="stfer" style={{ display: err?.msg ? 'block' : 'none' }}>{err?.msg}</div>
    </>
  );
}
