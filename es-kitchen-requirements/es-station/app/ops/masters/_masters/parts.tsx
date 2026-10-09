'use client';

import { Fragment, type CSSProperties, type ReactNode } from 'react';
import { DEMO } from '@/lib/demo';
import { valueParts, vmCapacity } from '@/lib/ops/masters/logic';
import type { Cell, Field, Part, TRow, THead, V, VmGrid } from '@/lib/ops/masters/types';
import { DateInput } from '@/components/DateInput';
import { fmtAuto, fmtDatesIn } from '@/lib/format/date';
import { TaxRateSelect } from '@/app/ops/_ui/TaxRateSelect';
import { EsIcon } from './EsIcon';
import { rem } from '@/lib/ui/rem';

/*
 * マスタの詳細・編集の部品（元の .f・.ctl・表・写真・自販機レイアウト・確認ダイアログ）。
 * クラス名は元のデモのまま（masters.css）。仕様の印（P1・P2新…）と説明は DEMO のときだけ出す。
 */

/** "width:80px;color:red" → style */
export function css(s?: string | null): CSSProperties | undefined {
  if (!s) return undefined;
  const o: Record<string, string> = {};
  for (const kv of s.split(';')) {
    const i = kv.indexOf(':');
    if (i < 0) continue;
    const k = kv.slice(0, i).trim().replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
    if (k) o[k] = rem(kv.slice(i + 1).trim());
  }
  return o as CSSProperties;
}

/** 入力欄の描き方（読み取りか、変えたときに何をするか） */
export type PartCtx = {
  /** この欄を入力できるか（詳細は false） */
  editable: boolean;
  /** ラジオのまとまりの名前 */
  name: string;
  set: (i: number, v: V) => void;
  /** ラジオ：i を選び、同じまとまりのほかを外す */
  radio: (i: number) => void;
  /** 小さいボタン（.mini）を押した */
  button?: (label: string) => void;
  /** 表の行の削除（.del） */
  del?: () => void;
  /** 写真の表示（メイン写真） */
  mainPhoto?: string;
  /** 自販機レイアウトの欄 */
  vm?: (grid: VmGrid) => ReactNode;
  /** 選べない選択肢（オプションの新規登録では A型を選べない） */
  optDisabled?: (o: string) => boolean;
  /** 税率の欄：税率マスタの共通ドロップダウン（TaxRateSelect・値は税率の表示）にする */
  tax?: boolean;
  /** 選べないチェック（「すべて」が ON のときの個別のチェック） */
  ckDisabled?: (i: number) => boolean;
  /** ドロップダウンの選択肢を差し替える（オプション区分＝オプション区分マスタ） */
  options?: string[];
};

/** 写真（元のデモの見本の3枚。写真の登録は未作成） */
export const PHOTOS = [
  { label: '正面', value: '1枚目（正面）', svg: '<rect x="8" y="2" width="44" height="76" rx="3" fill="#e5e9ef" stroke="#8a949e"/><line x1="8" y1="38" x2="52" y2="38" stroke="#8a949e"/><rect x="44" y="14" width="3" height="14" fill="#8a949e"/><rect x="44" y="48" width="3" height="14" fill="#8a949e"/>' },
  { label: '電源プラグ', value: '2枚目（電源プラグ）', svg: '<rect x="6" y="12" width="48" height="56" rx="4" fill="#eef4fb" stroke="#8a949e"/><rect x="18" y="30" width="6" height="14" fill="#8a949e"/><rect x="36" y="30" width="6" height="14" fill="#8a949e"/><circle cx="30" cy="54" r="3" fill="#8a949e"/>' },
  { label: '斜め', value: '3枚目（斜め）', svg: '<rect x="8" y="2" width="44" height="76" rx="3" fill="#e5e9ef" stroke="#8a949e"/><line x1="8" y1="38" x2="52" y2="38" stroke="#8a949e"/><rect x="44" y="14" width="3" height="14" fill="#8a949e"/><rect x="44" y="48" width="3" height="14" fill="#8a949e"/>' },
];

const isoDate = (s: string) => s.replace(/\//g, '-');

/** 部品を順に描く。cnt は値の位置（V[] の何番目か） */
export function Parts({ ps, vals, ctx }: { ps: Part[]; vals: V[]; ctx: PartCtx }): ReactNode {
  return renderParts(ps, vals, ctx, { i: 0 });
}
/* 箱（.num・.chk など）の中も同じ数え方で続けるため、コンポーネントにせず関数で呼ぶ */
function renderParts(ps: Part[], vals: V[], ctx: PartCtx, cnt: { i: number }): ReactNode[] {
  return ps.map((p, key) => {
    switch (p.t) {
      case 'in': {
        const i = cnt.i++, v = vals[i];
        const ro = !ctx.editable || !!p.ro;
        if (p.type === 'date') return <DateInput key={key} value={isoDate(String(v ?? ''))} readOnly={ro} disabled={!!p.dis} style={css(p.style)} onChange={(e) => ctx.set(i, e.target.value.replace(/-/g, '/'))} />;
        return <input key={key} className={p.num ? 'r' : undefined} value={ro ? fmtAuto(String(v ?? '')) : String(v ?? '')} readOnly={ro} disabled={!!p.dis} placeholder={p.ph} style={css(p.style)} onChange={(e) => ctx.set(i, e.target.value)} />;
      }
      case 'sel': {
        const i = cnt.i++, v = String(vals[i] ?? '');
        if (ctx.tax) return <TaxRateSelect key={key} by="label" value={v} disabled={!ctx.editable || !!p.dis} onChange={(x) => ctx.set(i, x)} />;
        const base = ctx.options ?? p.o;
        const opts = base.includes(v) || v === '' ? base : [...base, v];
        return (
          <select key={key} value={v} disabled={!ctx.editable || !!p.dis} style={css(p.style)} onChange={(e) => ctx.set(i, e.target.value)}>
            {opts.map((o) => <option key={o} value={o} disabled={ctx.optDisabled?.(o)}>{o}</option>)}
          </select>
        );
      }
      case 'ta': {
        const i = cnt.i++;
        return <textarea key={key} rows={p.rows} value={String(vals[i] ?? '')} readOnly={!ctx.editable || !!p.ro} onChange={(e) => ctx.set(i, e.target.value)} />;
      }
      case 'ck': {
        const i = cnt.i++;
        return p.type === 'radio'
          ? <input key={key} type="radio" name={ctx.name} checked={vals[i] === true} disabled={!ctx.editable} onChange={() => ctx.radio(i)} />
          : <input key={key} type="checkbox" checked={vals[i] === true} disabled={!ctx.editable || ctx.ckDisabled?.(i)} onChange={(e) => ctx.set(i, e.target.checked)} />;
      }
      case 'txt': {
        if (p.cls === 'del') return ctx.del ? <span key={key} className="del" aria-label="削除" role="button" tabIndex={0} onClick={ctx.del} onKeyDown={(e) => e.key === 'Enter' && ctx.del?.()}><i className="dsi-Trash" /></span> : null;
        if (!p.tag) return <Fragment key={key}>{' '}{p.text}{' '}</Fragment>;
        const Tag = p.tag as 'span';
        return p.html !== undefined
          ? <Tag key={key} className={p.cls || undefined} dangerouslySetInnerHTML={{ __html: p.html }} />
          : <Tag key={key} className={p.cls || undefined}>{p.text}</Tag>;
      }
      case 'btn': {
        if (/\b(vt|ve)\b/.test(p.cls)) return null;
        const enabled = ctx.editable || p.label === 'CSVエクスポート' || p.label === '誤りの訂正';
        return <button key={key} type="button" className={p.cls} disabled={!enabled || !!p.dis} onClick={() => ctx.button?.(p.label)}>{p.label}</button>;
      }
      case 'box': {
        const Tag = p.tag as 'div';
        return <Tag key={key} className={p.cls || undefined} style={css(p.style)}>{renderParts(p.kids, vals, ctx, cnt)}</Tag>;
      }
      case 'photos': {
        const i = cnt.i++, main = Number(vals[i] ?? 0);
        return (
          <div key={key} className="photos">
            {PHOTOS.map((ph, n) => (
              <div key={n} className="ph">
                <div className="img"><svg viewBox="0 0 60 80" width="46" height="62" aria-hidden="true" dangerouslySetInnerHTML={{ __html: ph.svg }} /><span>{ph.label}</span></div>
                <label><input type="radio" name={ctx.name} checked={main === n} disabled={!ctx.editable} onChange={() => ctx.set(i, n)} /> メイン</label>
              </div>
            ))}
            <div className="ph add"><div className="img">＋<span>写真を追加</span></div></div>
          </div>
        );
      }
      case 'mainphoto':
        return <span key={key} className="unit mainphoto">{ctx.mainPhoto ?? PHOTOS[0].value}（写真の下のラジオで選ぶ）</span>;
      case 'vmbox': {
        const i = cnt.i++;
        return <Fragment key={key}>{ctx.vm?.(vals[i] as VmGrid)}</Fragment>;
      }
      case 'html':
        return <div key={key} dangerouslySetInnerHTML={{ __html: p.html }} />;
    }
  });
}

/** 1つの項目（元の .f） */
export function FieldView({ f, vals, ctx, bad, hidden, msg }: { f: Field; vals: V[]; ctx: PartCtx; bad?: boolean; hidden?: boolean; msg?: string[] }) {
  return (
    /* 備考・説明（複数行）の欄は3列分の幅（セクションの最後に置く・hong 2026/10/05 共通） */
    <div className={`f${f.newf ? ' newf' : ''}${f.chgf ? ' chgf' : ''}${bad ? ' verr' : ''}${hidden ? ' hide' : ''}${f.ctl.some((p) => p.t === 'ta') ? ' span3' : ''}`} style={css(f.style)} data-name={f.name ?? undefined}>
      <label>
        {f.label}
        {f.req === 'req' && <span className="req">*</span>}
        {f.req === 'cond' && <span className="cond">△</span>}
        {DEMO && f.tags?.map(([c, t]) => <Fragment key={t}>{' '}<span className={`tag ${c}`}>{t}</span></Fragment>)}
      </label>
      <div className={(f.ctlCls ?? 'ctl') + (ctx.editable && f.ctlCls?.includes('vmbox') ? ' on' : '')}><Parts ps={f.ctl} vals={vals} ctx={ctx} /></div>
      {/* 必須などのエラーは対象の項目の下に出す（hong 2026/10/05）。見出しの下のまとめ（vbox）にも同じ文言が並ぶ */}
      {bad && !!msg?.length && <div className="ferr" role="alert">{msg.map((m, i) => <div key={i}>{m}</div>)}</div>}
      {DEMO && f.note && <div className="note-s" dangerouslySetInnerHTML={{ __html: fmtDatesIn(f.note) }} />}
      {DEMO && f.meta && <div className="meta" dangerouslySetInnerHTML={{ __html: fmtDatesIn(f.meta) }} />}
    </div>
  );
}

/** 表（元の .scroll > table）。rows の入力欄は editable のときだけ入力できる */
export function TableView({ head, rows, tcls, editable, name, onCell, onDel, bad, filter, onButton }: {
  head: THead[]; rows: TRow[]; tcls?: string; editable: boolean; name: string;
  onCell: (r: number, c: number, i: number, v: V) => void; onDel?: (r: number) => void; bad?: Set<string>; filter?: (r: TRow) => boolean;
  /** 行の小さいボタン（価格プランの「誤りの訂正」） */
  onButton?: (r: number, label: string) => void;
}) {
  const cellCtx = (r: number, c: number, cell: Cell): PartCtx => ({
    editable,
    name: `${name}-${r}-${c}`,
    set: (i, v) => onCell(r, c, i, v),
    radio: () => onCell(r, c, 0, true),
    del: editable && onDel && !cell.lock ? () => onDel(r) : undefined,
    button: onButton ? (l) => onButton(r, l) : undefined,
  });
  const shown = rows.map((r, i) => [r, i] as const).filter(([r]) => !filter || filter(r));
  return (
    <div className="scroll">
      <table className={tcls}>
        <thead><tr>{head.map((h, i) => <th key={i} style={css(h.style)} className={h.cls}>{h.text}</th>)}</tr></thead>
        <tbody>
          {shown.length ? shown.map(([r, ri]) => (
            <tr key={ri} className={r.cls}>
              {r.c.map((cell, ci) => {
                const Tag = cell.th ? 'th' : 'td';
                const isBad = bad?.has(`${name}#${ri}#${ci}`);
                return (
                  /* 見出しの .r（右寄せ）をセルにも効かせる（金額の列・hong 2026/10/05） */
                  <Tag key={ci} className={[cell.cls ?? (cell.th ? undefined : head[ci]?.cls), isBad ? 'verr' : ''].filter(Boolean).join(' ') || undefined} colSpan={cell.span} style={css(cell.style)}>
                    {cell.p ? <Parts ps={cell.p} vals={cell.v ?? []} ctx={cellCtx(ri, ci, cell)} /> : cell.text}
                  </Tag>
                );
              })}
            </tr>
          )) : <tr><td colSpan={head.length} style={{ color: '#8a96a3', textAlign: 'center' }}>まだ記録はありません</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

/** 表示件数は 10／20／50（決定 STEP7 L-1。全部の一覧で同じ） */
export const PER = [10, 20, 50];
/** ページ送り（一覧と詳細の中の表で同じ部品。es-pagination） */
export function Pager({ total, page, per, onPage, onPer }: { total: number; page: number; per: number; onPage: (p: number) => void; onPer: (n: number) => void }) {
  const pages = Math.max(1, Math.ceil(total / per));
  const cur = Math.min(page, pages);
  return (
    <div className="es-pagination">
      <span className="es-pagination__meta">{total ? `${total}件中 ${(cur - 1) * per + 1}–${Math.min(cur * per, total)}件` : '0件'}</span>
      <button type="button" className="es-page" disabled={cur <= 1} aria-label="前のページ" onClick={() => onPage(cur - 1)}><EsIcon name="CaretLeft" /></button>
      {Array.from({ length: pages }, (_, i) => i + 1).map((p) => <button key={p} type="button" className={`es-page${p === cur ? ' is-current' : ''}`} onClick={() => onPage(p)}>{p}</button>)}
      <button type="button" className="es-page" disabled={cur >= pages} aria-label="次のページ" onClick={() => onPage(cur + 1)}><EsIcon name="CaretRight" /></button>
      <div className="es-input es-input--sm es-select es-pagination__per">
        <select aria-label="表示件数" value={per} onChange={(e) => { onPer(+e.target.value); onPage(1); }}>{PER.map((n) => <option key={n} value={n}>{n}件／ページ</option>)}</select>
        <EsIcon name="CaretDown" />
      </div>
    </div>
  );
}

/** 表の1つのセルの値を変えた行の配列 */
export function setCell(rows: TRow[], r: number, c: number, i: number, v: V, radioCol?: boolean): TRow[] {
  return rows.map((row, ri) => {
    if (radioCol) {
      /* 公開用（ラジオ）は表の中で1つだけ */
      return { ...row, c: row.c.map((cell, ci) => (ci === c && cell.v ? { ...cell, v: [ri === r] } : cell)) };
    }
    if (ri !== r) return row;
    return { ...row, c: row.c.map((cell, ci) => (ci === c ? { ...cell, v: (cell.v ?? []).map((x, k) => (k === i ? v : x)) } : cell)) };
  });
}
/** セルがラジオか */
export const isRadioCell = (cell: Cell | undefined) => !!cell?.p && valueParts(cell.p).some((p) => p.t === 'ck' && p.type === 'radio');

/** 自販機レイアウト（元の .vmbox：マスを選んで収納タイプ・有効／無効を決める） */
export function VmBox({ grid, editable, sel, setSel, onChange }: { grid: VmGrid; editable: boolean; sel: Set<string>; setSel: (s: Set<string>) => void; onChange: (g: VmGrid) => void }) {
  const TYPES = ['シングル8', 'シングル10', 'ダブル8', 'ダブル10', 'ベルト5'];
  const key = (r: number, c: number) => `${r}:${c}`;
  const toggle = (r: number, c: number) => { if (!editable) return; const s = new Set(sel); if (s.has(key(r, c))) s.delete(key(r, c)); else s.add(key(r, c)); setSel(s); };
  const toggleRow = (r: number) => {
    if (!editable) return;
    const ks = grid.rows[r].c.map((_, c) => key(r, c)), all = ks.every((k) => sel.has(k)), s = new Set(sel);
    ks.forEach((k) => (all ? s.delete(k) : s.add(k)));
    setSel(s);
  };
  /** 選んだマスを収納タイプにする（ダブルは2列ぶん） */
  const setType = (ty: string) => {
    const dbl = ty.indexOf('ダブル') === 0;
    const rows = grid.rows.map((row, r) => {
      const src = row.c.map((x) => ({ ...x })), out: typeof row.c = [];
      src.forEach((cell, c) => {
        if (cell.t === '__drop__') return;
        if (!sel.has(key(r, c))) { out.push(cell); return; }
        if (dbl && cell.span !== 2) {
          const nx = src[c + 1];
          out.push({ t: ty, span: nx ? 2 : 1, off: false });
          if (nx) nx.t = '__drop__';
        } else if (!dbl && cell.span === 2) {
          out.push({ t: ty, span: 1, off: false }, { t: ty, span: 1, off: false });
        } else out.push({ t: ty, span: cell.span, off: false });
      });
      return { ...row, c: out };
    });
    setSel(new Set());
    onChange({ ...grid, rows });
  };
  const setOn = (on: boolean) => {
    onChange({ ...grid, rows: grid.rows.map((row, r) => ({ ...row, c: row.c.map((cell, c) => (sel.has(key(r, c)) ? { ...cell, off: !on } : cell)) })) });
    setSel(new Set());
  };
  const none = !sel.size || !editable;
  return (
    <>
      <div className="vmtool">
        <div>{TYPES.map((t) => <button key={t} type="button" className="mini vt" disabled={none} onClick={() => setType(t)}>{t}</button>)}</div>
        <div>
          <button type="button" className="mini ve" disabled={none} onClick={() => setOn(true)}>有効</button>
          <button type="button" className="mini ve" disabled={none} onClick={() => setOn(false)}>無効</button>
        </div>
      </div>
      <div className="scroll">
        <table className="vmgrid">
          <thead><tr><th />{Array.from({ length: grid.cols }, (_, i) => <th key={i}>{i + 1}</th>)}</tr></thead>
          <tbody>
            {grid.rows.map((row, r) => (
              <tr key={r}>
                <th className="rh" onClick={() => toggleRow(r)}>{row.h}</th>
                {row.c.map((cell, c) => (
                  <td key={c} colSpan={cell.span > 1 ? cell.span : undefined} className={[cell.off ? 'off' : '', sel.has(key(r, c)) ? 'sel' : ''].filter(Boolean).join(' ') || undefined} onClick={() => toggle(r, c)}>
                    {cell.off ? '無効' : cell.t}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
/** レイアウト生成：段数×列数、すべてシングル8 */
export function vmGenerate(rowsN: number, colsN: number): VmGrid {
  const rows = Math.max(1, Math.min(26, rowsN || 1)), cols = Math.max(1, Math.min(20, colsN || 1));
  return { cols, rows: Array.from({ length: rows }, (_, r) => ({ h: String.fromCharCode(65 + r), c: Array.from({ length: cols }, () => ({ t: 'シングル8', span: 1, off: false })) })) };
}
export { vmCapacity };

/** 確認のダイアログ（元の mlModal：es-modal・警告の印） */
export function EsModal({ title, body, ok, onOk, onClose, cancel = 'キャンセル' }: { title: string; body: ReactNode; ok?: string; onOk?: () => void; onClose: () => void; cancel?: string }) {
  return (
    <div className="es-modal" role="dialog" aria-modal="true" aria-label={title} onKeyDown={(e) => e.key === 'Escape' && onClose()}>
      <div className="es-modal__scrim" onClick={onClose} />
      <div className="es-modal__panel">
        <div className="es-modal__mark es-modal__mark--warning">!</div>
        <h2 className="es-modal__title">{title}</h2>
        <div className="es-modal__body">{body}</div>
        <div className="es-modal__actions">
          <button type="button" className="es-btn es-btn--outline es-btn--neutral es-btn--md" onClick={onClose} autoFocus={!ok}>{cancel}</button>
          {ok && <button type="button" className="es-btn es-btn--solid es-btn--negative es-btn--md" autoFocus onClick={() => { onClose(); onOk?.(); }}>{ok}</button>}
        </div>
      </div>
    </div>
  );
}

/** ファイルを保存させる */
export function download(name: string, text: string, type = 'text/csv') {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([text], { type }));
  a.download = name;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
}
