'use client';

import type { ReactNode } from 'react';
import {
  cellText, cycMonth, addMonth, ebCells, ebCommitRow, hideKeysOf, newRowFor, ebCodeOpts, ebHead, ebModelOpts, effText, feeNote, feeRowsFor, fid, fieldDisabled, fieldValue,
  MD_DISC, MD_KINDS, MD_MODELS, MD_OPTS, OP_ADD_YEN, RT_CAR, RT_CNT, RT_HEAD, RT_HUB, RT_LT, RT_NO_VIA, RT_ORDER, RT_PAT, RT_WD, RT_WH,
  routeExtra, routeStd, routeTotal, routeZeroNg, rowCells, rtIsMat, rtNgDays, rtOn, rtParse, rtYen, stripNotes, yenS,
  type EditTable, type IntakeState, type NewRow, type Route,
} from '@/lib/ops/applications/intake';
import type { Block, Cell, FieldDef, SwDef, TabDef, TableRow } from '@/lib/ops/applications/types';
import { Btn, Html, Table, esc } from '../ds';
import { useEngine, type Engine } from './engine';
import { DateInput } from '@/components/DateInput';
import { fmtDatesIn } from '@/lib/format/date';

/*
 * 受付画面のブロック（元：engine.js の blocks・field・table・routeInner・ebTable・ilTable など）。
 * ctx.ti＝拠点の番号（詳細情報設定）か 'p'（開始スケジュール）・'m'（ダイアログ）、ctx.tb＝タブの番号
 * 受付画面は説明文を出さない（注記・入力欄の説明・小見出しの補足。2026/09/29）
 */
export type Ctx = { ti: number | string; tb: number | string; tab?: TabDef };
const isNum = (x: unknown): x is number => typeof x === 'number';
/** 詳細情報設定で編集していないときは参照 */
const roCtx = (E: Engine, ctx: Ctx) => isNum(ctx.ti) && E.s.phase === 'D' && E.s.edit !== 'D';
const clearBad = (s: IntakeState, key: string) => { s.bad = s.bad.filter((x) => x !== key); };

export function Blocks({ list, ctx }: { list: Block[]; ctx: Ctx }) {
  return <>{(list || []).map((b, k) => <BlockView key={k} b={b} ctx={ctx} />)}</>;
}
function BlockView({ b, ctx }: { b: Block; ctx: Ctx }) {
  const E = useEngine();
  switch (b.b) {
    case 'h': return <div className="secttl">{b.text}</div>;
    case 'note': return null;
    case 'html': return <Html as="div" style={{ display: 'contents' }} html={stripNotes(b.html)} />;
    case 'kv': return <>{b.title && <div className="secttl">{b.title}</div>}<Kv items={b.items} /></>;
    case 'table': return <>{b.title && <div className="secttl">{b.title}</div>}<TableBlock b={b} ctx={ctx} /></>;
    case 'tot': {
      let tv = b.value;
      if (isNum(ctx.ti) && /^① 固定額/.test(b.label || '')) { const fr = feeRowsFor(E.cfg, E.s, ctx.ti); if (fr) tv = yenS(fr.sum.total); }
      return (
        <div className={`bigtot ${b.cls || ''}`}>
          <div><div className="bl">{b.label}</div><div className="bv">{tv}</div></div>
          {b.unit && <Html as="div" className="bu" html={b.unit} />}
        </div>
      );
    }
    case 'fields': return <div className="frow">{b.items.map((f) => <FieldView key={f.key} f0={f} ctx={ctx} />)}</div>;
    case 'sw': return <>{b.items.map((x) => <SwView key={x.key} sw={x} ctx={ctx} />)}</>;
    case 'files': return <FileTable b={b} />;
    case 'routes': return isNum(ctx.ti) ? <RouteRef ti={ctx.ti} ctx={ctx} /> : null;
    default: return null;
  }
}
export function Kv({ items }: { items: [string, string][] }) {
  return (
    <div className="kv">
      {items.map((p, k) => <div key={k}><div className="k">{p[0]}</div>{p[1] == null || p[1] === '' ? <span className="v mut">—</span> : <Html as="div" className="v" html={p[1]} />}</div>)}
    </div>
  );
}
/** 表のセル（文字列は見本の HTML・{t, c} は class 付き） */
function CellTd({ c }: { c: Cell }) {
  if (c && typeof c === 'object') return <Html as="td" className={c.c || ''} html={c.t == null ? '' : String(c.t)} />;
  return <Html as="td" html={c == null ? '' : String(c)} />;
}
function TableBlock({ b, ctx }: { b: Extract<Block, { b: 'table' }>; ctx: Ctx }) {
  const E = useEngine();
  const e = b._eid ? E.cfg.tables[b._eid] : undefined;
  if (e && e.kind === 'staff') return <IlTable e={e} />;
  if (e && b.edit) return <EbTable e={e} />;
  let rows = b.rows;
  if (isNum(ctx.ti) && (b.head || []).map((h) => (typeof h === 'object' ? h.t : h)).join().indexOf('料金項目') >= 0) {
    const fr = feeRowsFor(E.cfg, E.s, ctx.ti);
    if (fr) rows = fr.rows;
  }
  return (
    <div className="scrollx">
      <table className="t">
        <thead><tr>{(b.head || []).map((x, k) => (typeof x === 'object' ? <th key={k} className={x.c || ''}>{x.t}</th> : <th key={k}>{x}</th>))}</tr></thead>
        <tbody>{rows.map((r, k) => <tr key={k} className={!Array.isArray(r) && r.cls ? r.cls : undefined}>{rowCells(r).map((c, j) => <CellTd key={j} c={c} />)}</tr>)}</tbody>
      </table>
    </div>
  );
}
function FileTable({ b }: { b: Extract<Block, { b: 'files' }> }) {
  const E = useEngine();
  return (
    <>
      {b.title && <div className="secttl">{b.title}</div>}
      <div className="scrollx">
        <table className="t">
          <thead><tr><th>ファイル名</th><th>形式</th><th className="r">容量</th><th>登録日</th><th className="c">操作</th></tr></thead>
          <tbody>
            {b.rows.map((f, k) => (
              <tr key={k}>
                <td>{f[0]}</td><td>{f[1]}</td><td className="r">{f[2]}</td><td>{f[3]}</td>
                <td className="c">
                  <Btn variant="outline" size="sm" onClick={() => E.toast('プレビューを表示しました')}>表示</Btn>{' '}
                  <Btn variant="outline" size="sm" onClick={() => E.toast('ダウンロードしました')}>DL</Btn>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {b.add && E.canEdit !== false && <div style={{ marginTop: '0.642857rem' }}><Btn variant="outline" size="sm" icon="Plus" onClick={() => E.toast('ファイルを追加し、自動保存しました')}>ファイル追加</Btn></div>}
    </>
  );
}

/* ---------------- 入力欄 ---------------- */
const WD_ALL = ['月', '火', '水', '木', '金', '土', '日', '祝日'];
/** ①の合計・内訳・この月に効いているオプション・割引は、追加・削除した行から計算し直す */
function feeField(E: Engine, f: FieldDef, ctx: Ctx): FieldDef {
  if (!isNum(ctx.ti)) return f;
  if (f.key === 'eff') return { ...f, value: effText(E.cfg, E.s, ctx.ti, f.value || '') };
  if (f.key !== 'brk' && f.key !== 'ref') return f;
  const fr = feeRowsFor(E.cfg, E.s, ctx.ti, f.key === 'brk');
  if (!fr) return f;
  const s = fr.sum;
  return { ...f, value: f.key === 'ref' ? `<b>${yenS(s.total)}</b>` : `初期 ${yenS(s.init)} ・ 月額 ${yenS(s.month)} ・ 単発 ${yenS(s.single)} ・ 値引き ${yenS(s.disc)}` };
}
function FieldView({ f0, ctx }: { f0: FieldDef; ctx: Ctx }) {
  const E = useEngine(), s = E.s;
  const id = fid(ctx.ti, ctx.tb, f0.key);
  let f = feeField(E, f0, ctx);
  if (f0.key === 'dcount' && isNum(ctx.ti) && s.route[ctx.ti]?.length) f = { ...f, value: `月${routeTotal(s, ctx.ti)}回` };   /* 納品回数（合計・参照）は配送ルートに合わせる */
  const ro = roCtx(E, ctx);
  const dis = (f0.dep || f0.when) && isNum(ctx.ti) && isNum(ctx.tb) && ctx.tab ? fieldDisabled(s, ctx.tab, ctx.ti, ctx.tb, f0) : false;
  const v = fieldValue(s, id, f);
  const set = (nv: string) => E.update((x) => { x.val[id] = nv; clearBad(x, 'w_' + id); });
  let body: ReactNode;
  if (f.type === 'ro' || f.lock) {
    body = <div className={`ro${f.lock ? ' lock' : ''}`}>{f.value === '' || f.value == null ? <span style={{ color: '#8A949E' }}>—</span> : <Html html={f.value} />}</div>;
  } else if (ro) {
    /* 参照：入力欄を読み取り専用の表示にする（選択肢はその表示名） */
    let t = v;
    if (f.type === 'sel') (f.opts || []).forEach((o) => { if (typeof o === 'object' && String(o.v) === String(v)) t = o.t; });
    body = <div className="ro">{t === '' ? <span style={{ color: '#8A949E' }}>—</span> : t}</div>;
  } else if (f.type === 'sel') {
    body = (
      <select id={id} value={v} disabled={!!dis} onChange={(e) => set(e.target.value)}>
        {f.blank != null && <option value="">{f.blank}</option>}
        {(f.opts || []).map((o) => { const val = typeof o === 'object' ? o.v : o, tx = typeof o === 'object' ? o.t : o; return <option key={val} value={val}>{tx}</option>; })}
      </select>
    );
  } else if (f.type === 'wd') {
    /* 納品不可曜日：チェックボックス（どれにもチェックしない＝なし） */
    const on = v.split(/[・、,\s]+/);
    body = (
      <div className="wdck" id={id}>
        {WD_ALL.map((w) => (
          <label key={w}><input type="checkbox" checked={on.includes(w) || (w === '祝日' && on.includes('祝'))}
            onChange={(e) => set(WD_ALL.filter((x) => (x === w ? e.target.checked : on.includes(x) || (x === '祝日' && on.includes('祝')))).join('・'))} /> {w}</label>
        ))}
      </div>
    );
  } else if (f.type === 'ta') {
    body = <textarea id={id} value={v} placeholder={f.ph} onChange={(e) => set(e.target.value)} />;
  } else {
    body = f.type === 'date'
      ? <DateInput id={id} value={v} disabled={!!dis} onChange={(e) => set(e.target.value)} />
      : <input id={id} type="text" value={v} disabled={!!dis} placeholder={f.ph} onChange={(e) => set(e.target.value)} />;
  }
  return (
    <div className={`fld${f.wide ? ' wide' : ''}${s.bad.includes('w_' + id) ? ' bad' : ''}${dis ? ' dis' : ''}`} id={'w_' + id}>
      <div className="fl">{f.label}{f.req && <span className="rq">必須</span>}</div>
      {body}
      <div className="er">{f.err || f.label + 'を入力してください。'}</div>
    </div>
  );
}
function SwView({ sw, ctx }: { sw: SwDef; ctx: Ctx }) {
  const E = useEngine();
  const id = `sw_${ctx.ti}_${ctx.tb}_${sw.key}`, v = E.s.val[id];
  return (
    <div className="swrow">
      <div style={{ minWidth: 0 }}><div className="sn">{sw.n}</div></div>
      {sw.p && <div className="sp">{sw.p}</div>}
      <label className="sw"><input type="checkbox" checked={v !== undefined ? !!v : !!sw.on} disabled={roCtx(E, ctx)} onChange={(e) => E.update((x) => { x.val[id] = e.target.checked; })} />{sw.lab || '利用する'}</label>
    </div>
  );
}

/* ---------------- 異動の表（設備の異動・オプション・割引の異動） ---------------- */
function EbTable({ e }: { e: EditTable }) {
  const E = useEngine(), rows = E.s.eb[e.eid] || [], hd = ebHead(e);
  if (E.roD()) {
    return (
      <Table head={hd.map((x) => ({ t: x.t, align: x.c === 'r' ? 'right' as const : undefined }))}>
        {rows.length ? rows.map((r, k) => <tr key={k}>{ebCells(e, rowCells(r)).map((c, j) => <CellTd key={j} c={c} />)}</tr>)
          : <tr><td colSpan={hd.length} style={{ textAlign: 'center', color: 'var(--text-low)' }}>行がありません</td></tr>}
      </Table>
    );
  }
  const open = E.s.form === e.eid;
  const del = (ri: number) => E.update((s) => {
    const row = s.eb[e.eid][ri];
    if (!row) return;
    hideRow(s, e, row);
    s.eb[e.eid] = s.eb[e.eid].filter((_, x) => x !== ri);
  });
  return (
    <div id={'eb_' + e.eid}>
      <div className="scrollx">
        <table className="t etab">
          <thead><tr>{hd.map((x, k) => <th key={k} className={x.c || ''}>{x.t}</th>)}<th className="c" style={{ width: '4rem' }}>操作</th></tr></thead>
          <tbody>
            {rows.length ? rows.map((r, ri) => (
              <tr key={ri} className={!Array.isArray(r) && r.cls ? r.cls : undefined}>
                {ebCells(e, rowCells(r)).map((c, j) => <CellTd key={j} c={c} />)}
                <td className="c"><Btn variant="outline" tone="negative" size="sm" onClick={() => { del(ri); E.toast('行を削除しました'); }}>削除</Btn></td>
              </tr>
            )) : <tr className="empty"><td colSpan={hd.length + 1}><span className="mm">行がありません</span></td></tr>}
            {open && E.nf && <EbForm e={e} cols={hd.length} />}
          </tbody>
        </table>
      </div>
      {!open && <div style={{ marginTop: '0.571429rem' }}><Btn variant="outline" size="sm" icon="Plus" onClick={() => addRow(E, e)}>行を追加</Btn></div>}
    </div>
  );
}
/** 元の行を削除したら、その ID・名前を①の表から外す */
function hideRow(s: IntakeState, e: EditTable, row: TableRow) {
  s.hide[e.ti] = [...(s.hide[e.ti] || []), ...hideKeysOf(e, row)];
}
function addRow(E: Engine, e: EditTable) {
  E.setNf(newRowFor(e, E.cfg));
  E.setNfBad([]);
  E.update((s) => { s.form = e.eid; });
}
/** 行を追加する入力行（マスタから選ぶ） */
function EbForm({ e, cols }: { e: EditTable; cols: number }) {
  const E = useEngine(), f = E.nf!, bad = E.nfBad;
  const set = (p: Partial<NewRow>) => { E.setNf({ ...f, ...p }); E.setNfBad(bad.filter((k) => !(k in p))); };
  const cls = (k: keyof NewRow) => (bad.includes(k) ? 'bad' : undefined);
  const sel = (k: keyof NewRow, opts: (string | { v: string; t: string })[], blank: string | null, on?: (v: string) => void) => (
    <select className={cls(k)} value={f[k]} onChange={(ev) => (on ? on(ev.target.value) : set({ [k]: ev.target.value }))}>
      {blank != null && <option value="">{blank}</option>}
      {opts.map((o) => { const v = typeof o === 'object' ? o.v : o, t = typeof o === 'object' ? o.t : o; return <option key={v} value={v}>{t}</option>; })}
    </select>
  );
  let c: ReactNode[];
  if (e.kind === 'eq') {
    const nw = /新規|追加/.test(f.k), md = MD_MODELS.find((x) => x.id === f.m), q = parseInt(f.q, 10) || 1;
    c = [
      sel('k', ['新規貸出', '追加貸出', '回収', '機種変更'], null, (v) => { const n2 = /新規|追加/.test(v); set({ k: v, l: n2 ? '（新規）' : f.l === '（新規）' ? '' : f.l }); }),
      <input key="l" className={cls('l')} type="text" value={f.l} disabled={nw} placeholder="貸出ID" onChange={(ev) => set({ l: ev.target.value })} />,
      sel('c', MD_KINDS, '選択', (v) => set({ c: v, m: ebModelOpts(v).some((o) => o.v === f.m) ? f.m : '' })),
      f.c ? sel('m', ebModelOpts(f.c), '選択') : <select key="m" className={cls('m')} value=""><option value="">先に設備区分</option></select>,
      <input key="q" className={cls('q')} type="number" min={1} value={f.q} style={{ width: '4.571429rem' }} onChange={(ev) => set({ q: ev.target.value })} />,
      <span key="fm" className="mm">{md && !/回収/.test(f.k) ? yenS(md.m * q) : '—'}</span>,
      <span key="fi" className="mm">{md && md.init && nw ? yenS(md.init * q) : '—'}</span>,
      <DateInput key="d" className={cls('d')} value={f.d} onChange={(ev) => set({ d: ev.target.value })} />,
      <input key="r" type="text" value={f.r} placeholder="理由" onChange={(ev) => set({ r: ev.target.value })} />,
    ];
  } else {
    const disc = f.c === '値引き', ym = cycMonth(E.cfg, e.ti), x = (disc ? MD_DISC : MD_OPTS).find((o) => o.id === f.m) as { a?: number | null } | undefined;
    c = [
      sel('k', ['追加', '変更', '終了'], null),
      sel('c', ['オプション', '値引き'], null, (v) => set({ c: v, m: '', a: '' })),
      sel('m', ebCodeOpts(f.c), '選択', (v) => {
        const o = (f.c === '値引き' ? MD_DISC : MD_OPTS).find((y) => y.id === v) as { l?: string; a?: number | null } | undefined;
        if (!o) { set({ m: v }); return; }
        set({ m: v, a: f.c === '値引き' ? '−' + o.l : o.a == null ? '' : '+' + yenS(o.a) });
      }),
      <input key="q" className={cls('q')} type="number" min={1} value={f.q} disabled={disc} style={{ width: '4.571429rem' }} onChange={(ev) => set({ q: ev.target.value })} />,
      <input key="a" className={['r', cls('a')].filter(Boolean).join(' ')} type="text" value={f.a} readOnly={disc} placeholder={x && x.a == null && !disc ? '金額を入力（例：2,500円）' : '金額・率'} onChange={(ev) => set({ a: ev.target.value })} />,
      sel('d', [ym, addMonth(ym, 1), addMonth(ym, 2)], null),
      <input key="r" type="text" value={f.r} placeholder="理由" onChange={(ev) => set({ r: ev.target.value })} />,
    ];
    if (e.head.indexOf('適用開始月') < 0) c.splice(5, 1);   /* 切替の表は適用開始月の列を持たない */
  }
  const commit = () => {
    const out = ebCommitRow(E.cfg, e, f);
    if (!out.row) { E.setNfBad(out.bad); if (out.msg) E.toast(out.msg); return; }
    const row = out.row;
    E.update((s) => { s.eb[e.eid] = [...s.eb[e.eid], row]; s.form = null; });
    E.setNf(null);
    E.toast('行を追加しました');
  };
  return (
    <>
      <tr className="nform">{c.map((x, k) => <td key={k}>{x}</td>)}<td /></tr>
      <tr className="nform2"><td colSpan={cols + 1}>
        <Btn variant="outline" size="sm" onClick={() => { E.update((s) => { s.form = null; }); E.setNf(null); }}>キャンセル</Btn>{' '}
        <Btn size="sm" onClick={commit}>追加する</Btn>
      </td></tr>
    </>
  );
}

/* ---------------- 担当者の表（その場で編集） ---------------- */
const STAFF_KIND = ['メイン担当者', '請求担当者', 'サブ担当者'];
function IlTable({ e }: { e: EditTable }) {
  const E = useEngine(), rows = (E.s.eb[e.eid] || []) as Cell[][], hd = e.head.map((h) => (typeof h === 'object' ? h.t : h));
  if (E.roD()) return <Table head={hd}>{rows.map((r, k) => <tr key={k}>{hd.map((_, ci) => <td key={ci}>{cellText(r[ci])}</td>)}</tr>)}</Table>;
  const setCell = (ri: number, ci: number, v: string) => E.update((s) => {
    const rs = (s.eb[e.eid] as Cell[][]).map((r) => r.slice());
    rs[ri][ci] = v;
    s.eb[e.eid] = rs;
    clearBad(s, `il:${e.eid}:${ri}:${ci}`);
  });
  return (
    <div id={'il_' + e.eid}>
      <div className="scrollx">
        <table className="t itab">
          <thead><tr>{hd.map((x, k) => <th key={k}>{x}{/区分|担当者名|メール/.test(x) && <span className="rq">必須</span>}</th>)}<th className="c" style={{ width: '4rem' }}>操作</th></tr></thead>
          <tbody>
            {rows.map((r, ri) => (
              <tr key={ri}>
                {hd.map((h, ci) => {
                  const v = cellText(r[ci]), bad = E.s.bad.includes(`il:${e.eid}:${ri}:${ci}`) ? 'bad' : undefined;
                  return (
                    <td key={ci}>
                      {ci === 0
                        ? <select className={bad} value={v} onChange={(ev) => setCell(ri, ci, ev.target.value)}>{STAFF_KIND.map((k) => <option key={k}>{k}</option>)}</select>
                        : <input className={bad} type={/メール/.test(h) ? 'email' : 'text'} value={v} onChange={(ev) => setCell(ri, ci, ev.target.value)} />}
                    </td>
                  );
                })}
                <td className="c"><Btn variant="outline" tone="negative" size="sm" onClick={() => {
                  if (rows.length <= 1) { E.toast('担当者は1人以上必要です'); return; }
                  E.update((s) => { s.eb[e.eid] = s.eb[e.eid].filter((_, x) => x !== ri); });
                }}>削除</Btn></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ marginTop: '0.571429rem' }}><Btn variant="outline" size="sm" icon="Plus" onClick={() => E.update((s) => { s.eb[e.eid] = [...s.eb[e.eid], ['サブ担当者', '', '', '', '']]; })}>担当者を追加</Btn></div>
    </div>
  );
}
/** 担当者の表の必須（担当者名・メール。メイン担当者が1人もいなければ区分） */
export function ilBadKeys(E: Engine, tab: TabDef): string[] {
  const bad: string[] = [];
  tab.blocks.forEach((b) => {
    if (b.b !== 'table' || !b._eid) return;
    const e = E.cfg.tables[b._eid];
    if (!e || e.kind !== 'staff') return;
    const hd = e.head.map((h) => (typeof h === 'object' ? h.t : h)), rows = (E.s.eb[e.eid] || []) as Cell[][];
    let mains = 0;
    rows.forEach((r, ri) => hd.forEach((h, ci) => {
      const v = cellText(r[ci]);
      if (ci === 0 && v === 'メイン担当者') mains++;
      if (/担当者名|メール/.test(h) && !v.trim()) bad.push(`il:${e.eid}:${ri}:${ci}`);
    }));
    if (!mains && rows.length) bad.push(`il:${e.eid}:0:0`);
  });
  return bad;
}

/* ---------------- 配送ルート ---------------- */
/** 配送ルートの1つの欄を変える（ほかの入力は残す） */
export function rtChange(s: IntakeState, i: number, k: number, f: string, v: string) {
  const r = s.route[i][k];
  clearBad(s, `rt:${i}:${k}:${f}`);
  if (s.phase === 'D' && (f === 'wh' || f === 'cnt')) { s.rtWarn[i] = true; if (f === 'wh') { r.wh = v; return; } }
  if (f === 'cnt') { r.cnt = +v; r.slots = r.slots.slice(0, r.cnt); clearBad(s, `sp:${i}:${k}`); }
  else if (f === 'pat') { r.pat = v; r.slots = []; }
  else if (f === 'via') r.via = v;
  else if (f === 'c1') { if (!r.c2 || r.c2 === r.c1) r.c2 = v; r.c1 = v; }
  else (r as unknown as Record<string, string>)[f] = v;
}
function RtSel({ i, k, f, req, children, value }: { i: number; k: number; f: string; req?: boolean; children: ReactNode; value: string }) {
  const E = useEngine();
  return (
    <select value={value} className={req && E.s.bad.includes(`rt:${i}:${k}:${f}`) ? 'bad' : undefined}
      onChange={(ev) => E.update((s) => rtChange(s, i, k, f, ev.target.value))}>{children}</select>
  );
}
const rtOpt = (list: (string | { v: string; t: string })[], blank?: string) => (
  <>
    {blank != null && <option value="">{blank}</option>}
    {list.map((o) => { const v = typeof o === 'object' ? o.v : o, t = typeof o === 'object' ? o.t : o; return <option key={v} value={v}>{t}</option>; })}
  </>
);
const rtCarOpt = () => (
  <>
    <option value="">選択</option>
    {RT_CAR.map((g) => <optgroup key={g.g} label={g.g}>{g.o.map((o) => <option key={o}>{o}</option>)}</optgroup>)}
  </>
);
/** 納品回数（合計）とプラン標準・配送回数追加（HTML） */
export function routeSumHtml(E: Engine, i: number) {
  const tot = routeTotal(E.s, i), std = routeStd(E.cfg, i);
  let h = `納品回数（合計） <b>月${tot}回</b>`;
  if (std != null) {
    const ex = routeExtra(E.cfg, E.s, i), zn = routeZeroNg(E.cfg, E.s, i);
    h += `　／　プラン標準 冷蔵 月${std.c}回` + (std.f != null ? `・冷凍 月${std.f}回` : '（ESライトは冷凍なし）') + '（温度帯ごとに比べ、相殺しない）　→　' + (ex > 0
      ? `<b>配送回数追加 ${ex}回</b>（<span class="idc">OP000001</span> ${rtYen(OP_ADD_YEN)}／回 ＝ 月額 <b>${rtYen(ex * OP_ADD_YEN)}</b>。A型のため子契約の料金に自動で立つ）`
      : '配送回数追加なし');
    if (zn.length) h += `<div class="rtwarn"><b>${esc(zn.join('・'))}が0回です。</b>冷蔵は1回以上、ESスタンダードは冷凍も1回以上にしてください（28-156。冷凍を受け取らないなら ESライト）</div>`;
  }
  return h;
}
/** 詳細情報設定の配送ルート（編集） */
function RouteEdit({ i }: { i: number }) {
  const E = useEngine(), rs = E.s.route[i] || [];
  const t = E.cfg.targets[i];
  const rtDef = () => {
    E.update((s) => {
      const cur = s.route[i];
      s.route[i] = (t._rdef || []).map(rtParse).map((d, k) => { const c = cur[k]; if (c) { d.wh = c.wh; d.cnt = c.cnt; } d.slots = d.slots.slice(0, d.cnt || 0); return d; });
    });
    E.toast(t.name + ' にエリアの既定値を入れました');
  };
  return (
    <div id={'rtw' + i}>
      <div className="rth"><div className="secttl" style={{ margin: 0 }}>配送ルート設定（配送種別ごと）</div><Btn variant="outline" size="sm" onClick={rtDef}>エリアの既定値を入れる</Btn></div>
      {/* 中継／直送／委託の違い（2026/10/03 台帳 B「配送設定の画面・追加回」。当面は説明文） */}
      <p className="mm" style={{ margin: '0.285714rem 0 0.571429rem' }}>直送＝倉庫で受け取って拠点へそのまま届ける（途中経由「なし」・運送会社と納品会社は同じ）。中継＝倉庫 →（運送会社）→ 途中経由 →（納品会社）→ 拠点。委託＝委託配送会社のドライバーが運ぶ（自社便＝ES のドライバー、路線便＝ヤマトなどの送り状）。配送回数追加の回だけルートを変えるときは、本登録のあと子契約の「回ごとのルート」で入れる。</p>
      <div className="scrollx">
        <table className="t rtt">
          <thead><tr>{RT_HEAD.map(([h, req]) => <th key={h}>{h}{req && <span className="rq">必須</span>}</th>)}</tr></thead>
          <tbody>{rs.map((r, k) => <RouteRow key={k} i={i} k={k} r={r} />)}</tbody>
        </table>
      </div>
      <Html as="div" className="rtsum" html={routeSumHtml(E, i)} />
      <InitSet i={i} />
      {E.s.phase === 'D' && E.s.rtWarn[i] && <div className="rtwarn">倉庫・配送回数を申込内容確認で決めた値から変えました。<b>作成済みのオーダー・資材のオーダー（初期セット）に影響する</b>ため、オーダーの内容を運営で見直してください。</div>}
    </div>
  );
}
function RouteRow({ i, k, r }: { i: number; k: number; r: Route }) {
  const mat = rtIsMat(r);
  if (!rtOn(r)) {
    return (
      <tr className="off"><td><b>{r.kind}</b></td><td>—</td><td>—</td><td>—</td><td>—</td><td>—</td>
        <td><RtSel i={i} k={k} f="cnt" value={String(r.cnt ?? 0)}>{rtOpt(RT_CNT)}</RtSel></td><td>—</td></tr>
    );
  }
  return (
    <>
      <tr>
        <td><b>{r.kind}</b></td>
        <td><RtSel i={i} k={k} f="wh" req value={r.wh}>{rtOpt(RT_WH, '選択')}</RtSel></td>
        <td><RtSel i={i} k={k} f="c1" req value={r.c1}>{rtCarOpt()}</RtSel></td>
        <td><RtSel i={i} k={k} f="c2" req value={r.c2}>{rtCarOpt()}</RtSel></td>
        <td><RtSel i={i} k={k} f="via" req value={r.via}>{rtOpt([RT_NO_VIA, ...RT_HUB])}</RtSel>{r.via === RT_NO_VIA && r.c1 && r.c2 && r.c1 !== r.c2 && <div className="mm">中継しないときは運送会社と納品会社を同じにしてください</div>}</td>
        <td><RtSel i={i} k={k} f="lead" req value={r.lead}>{rtOpt(RT_LT, '選択')}</RtSel></td>
        <td>{mat ? '—' : <RtSel i={i} k={k} f="cnt" req value={String(r.cnt ?? 0)}>{rtOpt(RT_CNT)}</RtSel>}</td>
        <td>{mat ? '都度配送' : <RtSel i={i} k={k} f="pat" req value={r.pat}>{rtOpt(RT_PAT, '選択')}</RtSel>}</td>
      </tr>
      {/* 納品サイクルは配送回数の分だけ選ぶ（週×曜日の表をクリック。スペシャルは日付） */}
      {!mat && (r.cnt ?? 0) > 0 && <tr className="slotrow"><td /><td colSpan={RT_HEAD.length - 1}><SlotPicker i={i} k={k} r={r} /></td></tr>}
    </>
  );
}
function SlotPicker({ i, k, r }: { i: number; k: number; r: Route }) {
  const E = useEngine();
  const sel = r.slots.filter(Boolean), cnt = r.cnt ?? 0, full = sel.length >= cnt;
  const bad = E.s.bad.includes(`sp:${i}:${k}`);
  const head = (
    <div className="sph">
      <b>納品サイクル<span className="rq">必須</span></b>
      <span className={`spn${sel.length === cnt ? ' ok' : ''}`}>{sel.length} ／ {cnt} 回</span>
      <span className="spv">{sel.length ? sel.join(' ／ ') : <span className="mm">{r.pat ? '表から配送回数の分だけ選ぶ' : '先に配送パターンを選ぶ'}</span>}</span>
    </div>
  );
  if (!r.pat) return <div className={`slotpick off${bad ? ' bad' : ''}`}>{head}</div>;
  const pick = (code: string) => {
    const a = sel.slice(), x = a.indexOf(code);
    if (x >= 0) a.splice(x, 1);
    else if (a.length < cnt) a.push(code);
    else { E.toast(`配送回数（${cnt}回）の分まで選べます`); return; }
    a.sort((p, q) => RT_ORDER[p] - RT_ORDER[q]);
    E.update((s) => { s.route[i][k].slots = a; clearBad(s, `sp:${i}:${k}`); });
  };
  const btn = (code: string, label: string, ng: boolean, wide?: boolean) => {
    const on = sel.includes(code), dis = ng || (!on && full);
    return (
      <td key={code}><button type="button" className={`spc${wide ? ' wide' : ''}${on ? ' on' : ''}${ng ? ' ng' : ''}`} title={ng ? '納品不可曜日' : undefined}
        disabled={dis && !on} onClick={() => pick(code)}>{label}</button></td>
    );
  };
  let g: ReactNode;
  if (r.pat === 'スペシャル') {
    const cells: ReactNode[] = [];
    for (let d = 1; d <= 28; d++) cells.push(btn('毎月' + d + '日', String(d), false));
    cells.push(btn('毎月末日', '末日', false, true));
    const trs: ReactNode[] = [];
    for (let x = 0; x < cells.length; x += 10) trs.push(<tr key={x}>{cells.slice(x, x + 10)}</tr>);
    g = <table className="spg day"><tbody>{trs}</tbody></table>;
  } else {
    const ng = rtNgDays(E.cfg, E.s, i);
    g = (
      <table className="spg">
        <thead><tr><th />{RT_WD.split('').map((w) => <th key={w} className={ng.indexOf(w) >= 0 ? 'ng' : undefined}>{w}</th>)}</tr></thead>
        <tbody>{['A', 'B', 'C', 'D'].map((w) => (
          <tr key={w}><th>週{w}</th>{[1, 2, 3, 4, 5, 6, 7].map((d) => btn(w + d, w + d, ng.indexOf(RT_WD.charAt(d - 1)) >= 0))}</tr>
        ))}</tbody>
      </table>
    );
  }
  return <div className={`slotpick${bad ? ' bad' : ''}`}>{head}{g}</div>;
}
/** 資材の初期セット（無料）の納品日。v1.6：詳細情報設定の「子契約」タブ（配送ルートの下）で入れる */
function InitSet({ i, ro }: { i: number; ro?: boolean }) {
  const E = useEngine();
  if (!E.cfg.orderMode) return null;
  const mat = (E.s.route[i] || []).find(rtIsMat), v = E.s.init[i] || '';
  return (
    <div className="initset">
      <b>資材の初期セット</b><span className="es-badge es-badge--success">無料</span>
      {ro ? <span>納品日 <b>{v ? v.replace(/-/g, '/') : '—'}</b></span>
        : <label>納品日<span className="rq">必須</span><DateInput inline className={E.s.bad.includes(`init:${i}`) ? 'bad' : undefined} value={v}
          onChange={(ev) => { const nv = ev.target.value; E.update((s) => { s.init[i] = nv; if (nv) clearBad(s, `init:${i}`); }); }} /></label>}
      <span className="mm">倉庫 {mat && mat.wh ? mat.wh : '（資材配送の倉庫）'} ／ 中身：資材マスタの初期セット（プランの食数で数量が決まる） ／ 資材のオーダーは仮登録で作成済み・配送データは本登録で作成</span>
    </div>
  );
}
/** 子契約タブの配送ルート：編集中は入力、それ以外（確定済み・参照）は表 */
function RouteRef({ ti, ctx }: { ti: number; ctx: Ctx }) {
  const E = useEngine();
  if (!E.s.confirmed[ti] && !roCtx(E, ctx)) return <RouteEdit i={ti} />;
  const rs = E.s.route[ti] || [], d = (x: string | false | undefined) => (x ? x : '—');
  return (
    <>
      <div className="secttl">配送ルート設定（配送種別ごと）</div>
      <div className="scrollx">
        <table className="t">
          <thead><tr>{RT_HEAD.map(([h]) => <th key={h}>{h}</th>)}<th>納品サイクル</th></tr></thead>
          <tbody>{rs.map((r, k) => {
            const on = rtOn(r);
            return (
              <tr key={k}>
                <td>{d(r.kind)}</td><td>{d(on && r.wh)}</td><td>{d(on && r.c1)}</td><td>{d(on && r.c2)}</td>
                <td>{d(on && r.via)}</td><td>{d(on && r.lead)}</td>
                <td>{rtIsMat(r) ? '—' : r.cnt + '回'}</td><td>{d(on && r.pat)}</td><td>{d(on && r.slots.join(' ／ '))}</td>
              </tr>
            );
          })}</tbody>
        </table>
      </div>
      <Html as="div" className="rtsum" html={routeSumHtml(E, ti)} />
      <InitSet i={ti} ro />
    </>
  );
}

/** 申込内容確認の「配送の設定（倉庫・配送回数）」。オーダーを作るのに要るので、仮登録の前に決める（v1.6：1つの表） */
export function RouteACard({ onSave, onCancel, onEdit }: { onSave: () => void; onCancel: () => void; onEdit?: () => void }) {
  const E = useEngine(), cfg = E.cfg, s = E.s;
  const ed = s.edit === 'A';
  let any = false;
  const rows: ReactNode[] = [];
  cfg.targets.forEach((t, i) => {
    const rs = s.route[i];
    if (t.active === false || !rs || !rs.length) return;
    any = true;
    rs.forEach((r, k) => {
      const mat = rtIsMat(r), on = rtOn(r);
      rows.push(
        <tr key={`${i}-${k}`} className={on ? undefined : 'off'}>
          {k === 0 && (
            <td rowSpan={rs.length} className="rtbr">
              <span className="cno">{t.no}</span><b>{t.name}</b>
              {ed && <div style={{ marginTop: '0.428571rem' }}><Btn variant="outline" size="sm" onClick={() => {
                E.update((x) => { (t._rdef || []).map(rtParse).forEach((d, kk) => { const rr = x.route[i][kk]; if (rr && rtOn(rr)) { rr.wh = d.wh || rr.wh; if (rr.wh) clearBad(x, `rt:${i}:${kk}:wh`); } }); });
                E.toast(t.name + ' に既定の倉庫を入れました');
              }}>既定の倉庫を入れる</Btn></div>}
            </td>
          )}
          <td><b>{r.kind}</b></td>
          <td>{!on ? '—' : ed ? <RtSel i={i} k={k} f="wh" req value={r.wh}>{rtOpt(RT_WH, '選択')}</RtSel> : r.wh || '—'}</td>
          <td>{mat ? '都度配送' : ed ? <RtSel i={i} k={k} f="cnt" req value={String(r.cnt ?? 0)}>{rtOpt(RT_CNT)}</RtSel> : r.cnt + '回'}</td>
          {k === 0 && <Html as="td" className="rtsumc" html={routeSumHtml(E, i).replace('　／　', '<br>').replace('　→　', '<br>→ ')} />}
        </tr>,
      );
    });
  });
  if (!any) return null;
  return (
    <div className="card" id={ed ? 'rtcard' : 'rtview'}>
      <h2>配送の設定（倉庫・配送回数）<span className="r">
        {ed ? <><Btn variant="outline" size="sm" id="rtCancel" onClick={onCancel}>キャンセル</Btn><Btn size="sm" id="rtSave" onClick={onSave}>保存</Btn></>
          : onEdit && <Btn size="sm" id="rtEdit" icon="PencilSimple" onClick={onEdit}>編集</Btn>}
      </span></h2>
      <div className="pad">
        {cfg.trialTimeline && <div className="rttl"><b>お試しのタイムライン</b>　<Html html={cfg.trialTimeline} /></div>}
        <div className="scrollx">
          <table className="t rtt rta rt1">
            <thead><tr><th>拠点</th><th>配送種別</th><th>ピッキング倉庫{ed && <span className="rq">必須</span>}</th><th>配送回数{ed && <span className="rq">必須</span>}</th><th>納品回数（合計）・配送回数追加</th></tr></thead>
            <tbody>{rows}</tbody>
          </table>
        </div>
        {cfg.orderMode && <p className="es-field__msg">資材の初期セット（無料）の納品日は、仮登録のあと <b>詳細情報設定の「子契約」タブ</b>（配送ルートの下）で決めます。資材のオーダー（初期セット）は仮登録で自動で作ります。</p>}
      </div>
    </div>
  );
}
/** 申込内容確認：倉庫の未入力（rt:<拠点>:<行>:wh） */
export function routeABadKeys(E: Engine): string[] {
  const bad: string[] = [];
  E.cfg.targets.forEach((t, i) => { if (t.active === false) return; (E.s.route[i] || []).forEach((r, k) => { if (rtOn(r) && !r.wh) bad.push(`rt:${i}:${k}:wh`); }); });
  return bad;
}

/** 拠点別の申込内容（行＝項目／列＝拠点）。拠点によって違う行は色を付ける */
export function TargetMatrix() {
  const E = useEngine();
  const ts = E.cfg.targets.filter((t) => t.active !== false);
  if (!ts.length) return <div className="note mut" style={{ margin: 0 }}>対象の拠点がありません。</div>;
  const base: { title: string; kv: [string, string][] }[] = [];
  const byTitle: Record<string, { title: string; kv: [string, string][]; seen: Record<string, boolean> }> = {};
  ts.forEach((t) => (t.sections || []).forEach((sec) => {
    let e = byTitle[sec.title];
    if (!e) { e = byTitle[sec.title] = { title: sec.title, kv: [], seen: {} }; base.push(e); }
    (sec.kv || []).forEach((p) => { if (!e.seen[p[0]]) { e.seen[p[0]] = true; e.kv.push(p); } });
  }));
  return (
    <div className="scrollx">
      <table className="t mx">
        <thead><tr><th className="hd">項目</th>{ts.map((t, i) => (
          <th key={i}>
            <div className="cn">{t.no}</div><div className="ct">{t.name}</div>
            {t.applyDate && <div className="cs">{t.applyLabel || '適用日'} <b>{fmtDatesIn(t.applyDate)}</b></div>}
            {(t.badges || []).length > 0 && <div className="cs"><Html html={`<span class="bg ${t.badges![0].c}">${esc(t.badges![0].t)}</span>`} /></div>}
          </th>
        ))}</tr></thead>
        <tbody>
          {base.map((sec) => (
            <Sec key={sec.title} sec={sec} ts={ts} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
function Sec({ sec, ts }: { sec: { title: string; kv: [string, string][] }; ts: { sections?: { title: string; kv: [string, string][] }[] }[] }) {
  return (
    <>
      <tr className="sec"><th className="hd" colSpan={ts.length + 1}>{sec.title}</th></tr>
      {sec.kv.map(([key]) => {
        const vals = ts.map((t) => { let hit = ''; (t.sections || []).forEach((s2) => { if (s2.title !== sec.title) return; s2.kv.forEach((p2) => { if (p2[0] === key) hit = p2[1]; }); }); return hit; });
        const diff = vals.some((x) => x !== vals[0]);
        return (
          <tr key={key} className={diff && ts.length > 1 ? 'dx' : undefined}>
            <th className="hd">{key}</th>
            {vals.map((x, k) => (x == null || x === '' ? <td key={k}><span className="unset">—</span></td> : <Html key={k} as="td" html={feeNote(sec.title, x)} />))}
          </tr>
        );
      })}
    </>
  );
}
