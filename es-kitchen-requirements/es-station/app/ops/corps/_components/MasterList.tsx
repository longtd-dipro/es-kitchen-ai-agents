'use client';

import { SortMenu } from '@/components/SortMenu';

import { useRouter } from 'next/navigation';
import { useEffect, useLayoutEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { OpsCsvExport, OpsCsvImport } from '../../_ui/csv';
import { UnappliedMark } from '../../_general/list';
import { useScreenCan } from '../../_ui/perm';
import { EsIcon } from './EsIcon';
import { DateInput, MonthInput } from '@/components/DateInput';
import { fmtAutoNode, isoDate, isoYm } from '@/lib/format/date';
import { esTone } from '@/lib/format/status';

/*
 * 法人一覧・拠点一覧・子契約一覧（ES Kitchen の一覧＋詳細の共通パターン。元の .mlist）。
 * 検索：入力欄は列の文字を含むか、ドロップダウンは列の文字がその選択肢で始まるか（元の mlFilter）。
 * 「検索」を押したときに絞り込む。新規登録・削除は置かない（新しい法人・拠点・契約は契約申請管理から・追補 28-33）。
 */
export type SearchDef =
  | { t: 'text'; keys: string[]; ph: string }
  | { t: 'select'; key: string; ph: string; opts: string[] }
  /** 期間（から〜まで）。key の文字が日付（yyyy-mm-dd・YYYY/MM/DD）か年月（yyyy-mm）で、範囲に入る行だけ出す */
  | { t: 'range'; key: string; ph: string; /** 年月（yyyy-mm）で入れる */ month?: boolean };
/** 選択肢を行の値から作る（空・重複を除いて並べる。画面に固定の一覧を持たない） */
export const uniq = (xs: (string | undefined)[]) => [...new Set(xs.filter((x): x is string => !!x && x !== '—'))].sort((a, b) => a.localeCompare(b, 'ja'));
/** 表の件数の選択肢（決定 STEP7 L-1。全部の一覧で 10／20／50） */
const PER = [10, 20, 50];
const RANGE_SEP = '|';
export type ColDef<R> = {
  label: string; key?: string; cell: (r: R) => ReactNode; mono?: boolean; /** 金額など数値（右寄せ） */ num?: boolean;
  /** 並べ替えの値（数なら数で並ぶ）。省くと、1列目は ID・ほかはセルの文字（文字でも数でもないセルは並べ替えの値なし＝最後） */
  sort?: (r: R) => string | number | undefined;
};
/** 並べ替え：列の番号と向き。null＝初期の並び（行が来た順）。台帳 K「一覧の決まり」 */
type SortState = { col: number; dir: 'asc' | 'desc' } | null;

type Props<R> = {
  title: string;
  crumb: string;
  search: SearchDef[];
  cols: ColDef<R>[];
  rows: R[] | undefined;
  rowId: (r: R) => string;
  /** 検索で比べる列の文字（key → 文字） */
  text: (r: R, key: string) => string;
  /** 詳細・編集の URL（id） */
  href: (id: string) => string;
  /** 仮登録の行の申請番号（あれば「申請で編集」） */
  apNo?: (r: R) => string | undefined;
  name: (r: R) => string;
  /** 灰にする行（取消の子契約など） */
  muted?: (r: R) => boolean;
  /** CSV のエンティティ（lib/csv/data.ts の corps・branches・contracts）と、行 → そのキー（省くと rowId） */
  /** CSV：出力のエンティティと、取込の画面（…/import。なければ取込のボタンを出さない） */
  csv: { entity: string; key?: (r: R) => string; importHref?: string };
  /** 初期の並び（並べ替えを選んでいないとき）：この値の新しい順（降順）。同じ値は ID の昇順（子契約＝サイクル月・法人／拠点＝登録日時）。省くと行が来た順 */
  initialDesc?: (r: R) => string | undefined;
  /** 見出しの右に足すボタン（子契約一覧の「一括変更」など。CSV出力・CSV取込の左に並べる） */
  actions?: ReactNode;
};

export default function MasterList<R>(p: Props<R>) {
  const router = useRouter();
  const screenCan = useScreenCan();
  const [draft, setDraft] = useState<string[]>(() => p.search.map(() => ''));
  const [applied, setApplied] = useState<string[]>(draft);
  const [folded, setFolded] = useState(false);
  const [wraps, setWraps] = useState(false);
  const fieldsRef = useRef<HTMLDivElement>(null);

  /* 検索の欄が2行になるときだけ、たたむボタンを出す（元の mlFoldAll） */
  useLayoutEffect(() => {
    const el = fieldsRef.current;
    if (!el) return;
    const check = () => {
      const kids = [...el.children] as HTMLElement[];
      setWraps(kids.length > 1 && kids[kids.length - 1].offsetTop > kids[0].offsetTop + 4);
    };
    check();
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => ro.disconnect();
  }, [folded]);
  useEffect(() => { if (!wraps) setFolded(false); }, [wraps]);

  const hit = (r: R) => p.search.every((s, i) => {
    const v = applied[i].trim();
    if (s.t === 'range') {
      const [a0 = '', b0 = ''] = applied[i].split(RANGE_SEP);
      if (!a0 && !b0) return true;
      /* 年月で入れたときは、月の初め〜終わりとして比べる */
      const a = s.month && a0 ? `${a0}-01` : a0, b = s.month && b0 ? `${b0}-31` : b0;
      const raw = p.text(r, s.key), d = isoDate(raw) || (isoYm(raw) ? isoYm(raw) + '-01' : '');
      /* 年月だけの値は、その月のどこかが範囲に入ればよい */
      const dEnd = isoDate(raw) ? d : d ? d.slice(0, 7) + '-31' : '';
      return !!d && (!a || dEnd >= a) && (!b || d <= b);
    }
    if (!v) return true;
    if (s.t === 'select') return p.text(r, s.key).startsWith(v);
    return s.keys.some((k) => p.text(r, k).toLowerCase().includes(v.toLowerCase()));
  });
  const filtered = (p.rows ?? []).filter(hit);
  /* 並べ替え（列見出しのクリックと、検索の枠の「並べ替え」ドロップダウンは同じ状態）。同じ値の行は ID の昇順、空の値は最後 */
  const [sort, setSort] = useState<SortState>(null);
  const sortVal = (r: R, i: number) => {
    const c = p.cols[i];
    const v = c.sort ? c.sort(r) : i === 0 ? p.rowId(r) : (() => { const x = c.cell(r); return typeof x === 'string' || typeof x === 'number' ? x : undefined; })();
    return v === '' || v === '—' || v === undefined ? undefined : v;
  };
  const shown = useMemo(() => {
    if (!sort && !p.initialDesc) return filtered;
    const dir = sort ? sort.dir : 'desc';
    const val = (r: R) => { const v = sort ? sortVal(r, sort.col) : p.initialDesc!(r); return v === '' || v === '—' ? undefined : v; };
    const cmp = (a: string | number, b: string | number) => (typeof a === 'number' && typeof b === 'number' ? a - b : String(a).localeCompare(String(b), 'ja', { numeric: true }));
    return filtered.map((r, i) => ({ r, i, v: val(r), id: p.rowId(r) })).sort((x, y) => {
      if (x.v === undefined || y.v === undefined) return x.v === y.v ? x.id.localeCompare(y.id, 'ja', { numeric: true }) : x.v === undefined ? 1 : -1;
      const d = cmp(x.v, y.v);
      return d ? (dir === 'asc' ? d : -d) : x.id.localeCompare(y.id, 'ja', { numeric: true }) || x.i - y.i;
    }).map((x) => x.r);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtered.length, p.rows, applied, sort]);
  const pickSort = (col: number | null, dir: 'asc' | 'desc' = sort?.dir ?? 'asc') => { setSort(col === null ? null : { col, dir }); setPage(1); };
  /* 見出しを押すと 昇順 → 降順 → 初期の並び */
  const headSort = (i: number) => { if (sort?.col !== i) pickSort(i, 'asc'); else if (sort.dir === 'asc') pickSort(i, 'desc'); else pickSort(null); };
  const [per, setPer] = useState(10);
  const [page, setPage] = useState(1);
  const pages = Math.max(1, Math.ceil(shown.length / per));
  const cur = Math.min(page, pages);
  const pageRows = shown.slice((cur - 1) * per, cur * per);
  const submit = (e: FormEvent) => { e.preventDefault(); setApplied(draft); setPage(1); };
  const dirty = draft.some((x, i) => x !== applied[i]);
  const clear = () => { const z = p.search.map(() => ''); setDraft(z); setApplied(z); setPage(1); };
  const openAp = (no: string) => router.push(`/ops/applications/${encodeURIComponent(no)}`);

  return (
    <section className="screen mlist">
      <header className="es-pagehead">
        <div className="es-pagehead__text">
          <nav className="es-breadcrumb" aria-label="パンくず"><a href="/ops/corps" onClick={(e) => e.preventDefault()}>法人・契約管理</a><span className="es-breadcrumb__sep">/</span><span className="es-breadcrumb__cur">{p.crumb}</span></nav>
          <h1 className="es-pagehead__title">{p.title}</h1>
        </div>
        <div className="es-pagehead__actions">
          {p.actions}
          {/* CSV（00_確認してほしい/CSV入出力_定義_20261003.md）：検索条件のとおりの全件の出力と、取込（更新だけ・新しい法人・拠点は申込から）。ボタンは『CSV出力』『CSV取込』の順（台帳 F） */}
          <OpsCsvExport<R> className="es-btn es-btn--csv es-btn--lg" screen={p.title} entity={p.csv.entity} rows={() => shown} keys={p.csv.key ?? p.rowId}
            filters={p.search.flatMap((x, i) => (applied[i].replace(RANGE_SEP, '').trim() ? [{ label: x.t === 'text' ? '検索' : x.ph, value: x.t === 'range' ? applied[i].replace(RANGE_SEP, '〜') : applied[i].trim() }] : []))}><EsIcon name="csv" size={20} />CSV出力</OpsCsvExport>
          {p.csv.importHref && <OpsCsvImport className="es-btn es-btn--csv es-btn--lg" href={p.csv.importHref}><EsIcon name="csv" size={20} />CSV取込</OpsCsvImport>}
        </div>
      </header>
      <div className="es-shell__content">
        <section className="es-card">
          <form className={`es-search${folded ? ' is-collapsed' : ''}`} role="search" onSubmit={submit}>
            <div className="es-search__left">
              <button type="button" className={`es-search__toggle${wraps ? '' : ' hide'}`} aria-expanded={!folded} aria-label="検索条件を閉じる" onClick={() => setFolded((f) => !f)}><EsIcon name="up" size={20} /></button>
              <div className="es-search__fields" ref={fieldsRef}>
                {p.search.map((s, i) => {
                  const set = (v: string) => setDraft((d) => d.map((x, j) => (j === i ? v : x)));
                  if (s.t === 'range') {
                    const [a = '', b = ''] = draft[i].split(RANGE_SEP);
                    return (['from', 'to'] as const).map((end) => {
                      const label = `${s.ph}（${end === 'from' ? 'から' : 'まで'}）`;
                      return (
                        <div key={`${i}${end}`} className="es-field"><div className="es-input es-input--md">
                          {s.month
                            ? <MonthInput fill value={end === 'from' ? a : b} placeholder={label} aria-label={label} onChange={(e) => set(end === 'from' ? `${e.target.value}${RANGE_SEP}${b}` : `${a}${RANGE_SEP}${e.target.value}`)} />
                            : <DateInput fill value={end === 'from' ? a : b} placeholder={label} aria-label={label} onChange={(e) => set(end === 'from' ? `${e.target.value}${RANGE_SEP}${b}` : `${a}${RANGE_SEP}${e.target.value}`)} />}
                        </div></div>
                      );
                    });
                  }
                  return s.t === 'text' ? (
                    <div key={i} className="es-field es-grow"><div className="es-input es-input--md"><EsIcon name="search" /><input value={draft[i]} onChange={(e) => set(e.target.value)} placeholder={s.ph} aria-label={s.ph} /></div></div>
                  ) : (
                    <div key={i} className="es-field"><div className="es-input es-input--md es-select">
                      <select value={draft[i]} onChange={(e) => set(e.target.value)} aria-label={s.ph}><option value="">{s.ph}</option>{s.opts.map((o) => <option key={o}>{o}</option>)}</select>
                      <EsIcon name="caret" size={16} />
                    </div></div>
                  );
                })}
              </div>
            </div>
            <div className="es-search__actions"><div className="es-search__main">
              <button type="button" className="es-btn es-btn--outline es-btn--primary es-btn--md" onClick={clear}>クリア</button>
              <UnappliedMark es show={dirty} />
              <button type="submit" className="es-btn es-btn--solid es-btn--primary es-btn--md"><EsIcon name="search" /><span>検索</span></button>
            </div>
            {/* 並べ替え（項目・昇順／降順。列見出しのクリックと同じ状態。台帳 K「一覧の決まり」：並べる項目は一覧の全列） */}
            <div className={`es-search__extra${folded ? ' hide' : ''}`}>
              <SortMenu options={p.cols.map((c, i) => [String(i), c.label])} value={sort ? String(sort.col) : ''} dir={sort?.dir ?? 'asc'} initialLabel="初期の並び" onChange={(k, d) => pickSort(k === '' ? null : Number(k), d)} />
            </div></div>
          </form>
          <div className="es-table-wrap">
            <table className="es-table">
              <thead><tr>{p.cols.map((c, i) => (
                <th key={c.label} className={c.num ? 'r' : undefined} aria-sort={sort?.col === i ? (sort.dir === 'asc' ? 'ascending' : 'descending') : undefined}>
                  <button type="button" onClick={() => headSort(i)} style={{ all: 'unset', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.285714rem' }}>
                    {c.label}{sort?.col === i && <span aria-hidden="true" style={{ fontSize: '0.714286rem' }}>{sort.dir === 'asc' ? '▲' : '▼'}</span>}
                  </button>
                </th>
              ))}<th>操作</th></tr></thead>
              <tbody>
                {p.rows === undefined && <tr><td colSpan={p.cols.length + 1} style={{ textAlign: 'center', color: '#8a96a3' }}>読み込み中…</td></tr>}
                {pageRows.map((r) => {
                  const id = p.rowId(r);
                  const ap = p.apNo?.(r);
                  return (
                    <tr key={id} style={p.muted?.(r) ? { color: '#8a96a3' } : undefined} data-muted={p.muted?.(r) ? '1' : undefined}>
                      {p.cols.map((c, i) => (
                        <td key={c.label} className={[c.mono && 'es-mono', c.num && 'r es-num'].filter(Boolean).join(' ') || undefined}>
                          {i === 0 ? <><a href={p.href(id)} onClick={(e) => { e.preventDefault(); router.push(p.href(id)); }}>{id}</a>{fmtAutoNode(c.cell(r))}</> : fmtAutoNode(c.cell(r))}
                        </td>
                      ))}
                      <td>
                        <span className="es-rowactions">
                          {ap
                            ? <button type="button" className="es-btn es-btn--outline es-btn--neutral es-btn--sm" title={`仮登録中は契約申請管理の申請詳細で編集します（${ap}）`} onClick={() => openAp(ap)}>申請で編集</button>
                            : screenCan('update') && <button type="button" className="es-btn es-btn--ghost es-btn--neutral es-btn--sm es-btn--icon" aria-label={`${p.name(r)}を編集`} onClick={() => router.push(p.href(id) + '/edit')}><EsIcon name="edit" /></button>}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {p.rows && !shown.length && <tr><td colSpan={p.cols.length + 1} style={{ textAlign: 'center', color: '#8a96a3' }}>条件に一致するデータがありません。条件を変えるか「クリア」を押してください。</td></tr>}
              </tbody>
            </table>
          </div>
          <div className="es-pagination">
            <span className="es-pagination__meta">{shown.length ? `${shown.length}件中 ${(cur - 1) * per + 1}–${Math.min(cur * per, shown.length)}件` : '0件'}</span>
            <button type="button" className="es-page" disabled={cur <= 1} aria-label="前のページ" onClick={() => setPage(cur - 1)}><EsIcon name="prev" size={16} /></button>
            {Array.from({ length: pages }, (_, i) => i + 1).map((n) => <button key={n} type="button" className={`es-page${n === cur ? ' is-current' : ''}`} onClick={() => setPage(n)}>{n}</button>)}
            <button type="button" className="es-page" disabled={cur >= pages} aria-label="次のページ" onClick={() => setPage(cur + 1)}><EsIcon name="next" size={16} /></button>
            <div className="es-input es-input--sm es-select es-pagination__per">
              <select aria-label="表示件数" value={per} onChange={(e) => { setPer(+e.target.value); setPage(1); }}>{PER.map((n) => <option key={n} value={n}>{n}件／ページ</option>)}</select>
              <EsIcon name="caret" size={16} />
            </div>
          </div>
        </section>
      </div>
    </section>
  );
}

/** ES Kitchen の状態バッジ */
export function EsBadge({ v, tone }: { v: string; tone: string }) {
  /* 状態の文字なら共通の色（lib/format/status.ts） */
  return <span className={`es-badge es-badge--${esTone(v, tone)}`}>{v}</span>;
}
