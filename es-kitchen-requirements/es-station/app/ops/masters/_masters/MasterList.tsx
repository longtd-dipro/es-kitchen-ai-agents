'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SortMenu } from '@/components/SortMenu';
import { useEffect, useLayoutEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { DEMO } from '@/lib/demo';
import { hasUnsavedChanges } from '../../_ui/leaveGuard';
import { sameConds, UnappliedMark } from '../../_general/list';
import masters, { type MasterRow } from '@/lib/ops/areas/masters';
import { areaApi, useQuery } from '@/lib/ops/core/client';
import { deleteBlockedText, SORT_COLS, specOf, type SortKey } from '@/lib/ops/masters/logic';
import type { MasterKind } from '@/lib/ops/masters/types';
import { useOps } from '../../_ui/OpsProvider';
import { useCanAct, useScreenCan } from '../../_ui/perm';
import { useOpsCsvExport } from '../../_ui/csv';
import { DemoTop } from './DemoTop';
import { EsIcon } from './EsIcon';
import { EsModal, Pager, PER } from './parts';
import { BASE, LIST_CLS } from './routes';
import { fmtAutoNode } from '@/lib/format/date';
import { esTone, statusGroup } from '@/lib/format/status';
import { catImg } from '@/app/ops/menu/_components/photo';
import { materialBlockedText, materialInUse } from '@/lib/domain/material';

/*
 * マスタの一覧（元の .mlist：ES Kitchen の CrudPattern）。機種・プラン・オプション・値引き・資材が同じ作り（資材は列に写真、削除は E259 の確認つき）。
 * IDのリンク＝詳細／鉛筆＝編集／ゴミ箱＝削除の確認／新規登録。削除は論理削除で、削除済みは既定で隠す（「削除済みを表示しない」）。
 * 検索は「検索」を押したときに絞り込む（元の mlFilter と同じ）。
 */
const api = areaApi(masters);

type Saved = { q: Record<string, string>; hideDeleted: boolean; per: number; page: number; sort?: SortKey | null };
const storeKey = (kind: MasterKind) => `ops-masters-list-${kind}`;
function loadSaved(kind: MasterKind): Saved | null {
  try { const s = sessionStorage.getItem(storeKey(kind)); return s ? JSON.parse(s) : null; } catch { return null; }
}

export default function MasterList({ kind }: { kind: MasterKind }) {
  const spec = specOf(kind).list;
  const router = useRouter();
  const { toast, toastError } = useOps();
  const canAct = useCanAct();
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [q, setQ] = useState<Record<string, string>>({});
  const [hideDeleted, setHideDeleted] = useState(true);
  const [draftHide, setDraftHide] = useState(true);
  const [per, setPer] = useState(10);
  const [page, setPage] = useState(1);
  /* 並べ替え（列の見出しを押す。null＝初期の並び。受付簿 #87・台帳 F） */
  const [sort, setSort] = useState<SortKey | null>(null);
  const [ready, setReady] = useState(false);
  const [modal, setModal] = useState<ReactNode>(null);
  const csvExport = useOpsCsvExport();
  /* CSV取込は、この画面の「CSV取込」の権限があるときだけ出す */
  const canImport = useScreenCan()('csvImport');

  /* 詳細から戻ったときに検索条件・ページを戻す */
  useEffect(() => {
    const s = loadSaved(kind);
    if (s) { setDraft(s.q); setQ(s.q); setHideDeleted(s.hideDeleted); setDraftHide(s.hideDeleted); setPer(PER.includes(s.per) ? s.per : 10); setPage(s.page); setSort(s.sort ?? null); }
    setReady(true);
  }, [kind]);
  useEffect(() => {
    if (!ready) return;
    try { sessionStorage.setItem(storeKey(kind), JSON.stringify({ q, hideDeleted, per, page, sort })); } catch { /* 保存できなくてもよい */ }
  }, [kind, q, hideDeleted, per, page, sort, ready]);

  const { data } = useQuery(api, 'list', { kind, q, hideDeleted, sort });
  /* 並べ替えの選択肢（列の見出し）。空＝初期の並び（プラン：月次提供上限数 → プランID。lib/ops/masters/logic.ts の DEFAULT_SORT） */
  const sortCols = SORT_COLS[kind].map((k) => ({ k, label: spec.cols[spec.keys.indexOf(k)]?.text ?? k }));
  const pickSort = (k: string, dir: SortKey['dir'] = sort?.dir ?? 'asc') => { setSort(k ? { key: k, dir } : null); setPage(1); };
  const rows = data?.rows ?? [];
  const pages = Math.max(1, Math.ceil(rows.length / per));
  const cur = Math.min(page, pages);
  const shown = rows.slice((cur - 1) * per, cur * per);

  /* 検索条件の折りたたみ：項目が2行以上に折り返したときだけ「閉じる」ボタンを出す（元の mlFoldAll） */
  const fieldsRef = useRef<HTMLDivElement>(null);
  const [wraps, setWraps] = useState(false);
  const [folded, setFolded] = useState(false);
  useLayoutEffect(() => {
    const el = fieldsRef.current;
    if (!el) return;
    const check = () => {
      const kids = Array.from(el.children) as HTMLElement[];
      if (folded) return;
      setWraps(kids.length > 1 && kids[kids.length - 1].offsetTop > kids[0].offsetTop + 4);
    };
    check();
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => ro.disconnect();
  }, [folded]);

  /* 条件は「検索」か Enter で効く。変えたまま押していないときは「未適用」を出す（2026/10/03 決定） */
  const submit = (e: FormEvent) => { e.preventDefault(); setQ({ ...draft }); setHideDeleted(draftHide); setPage(1); };
  const clear = () => { setDraft({}); setQ({}); setDraftHide(true); setHideDeleted(true); setPage(1); };
  const dirty = !sameConds(draft, q) || draftHide !== hideDeleted;
  const detail = (id: string) => `${BASE[kind]}/${id}`;

  const del = async (r: MasterRow) => {
    /* 資材：使用中（プラン・未納品の資材注文・資材在庫のある倉庫）は E259 のモーダルだけ。使っていなければ確認（Q01）→ 論理削除（S02）。サーバーでも同じ決まりで止める */
    if (kind === 'materials') {
      try {
        const u = await api.query('materialUse', { id: r.id });
        if (materialInUse(u)) { setModal(<EsModal title="削除できません" body={<>{materialBlockedText(u)}<br /><b>{r.id} {r.name}</b></>} cancel="閉じる" onClose={() => setModal(null)} />); return; }
      } catch (e) { toastError(e); return; }
      setModal(
        <EsModal title="削除確認" body={<>本当に削除してもよろしいですか？<br />削除すると元に戻せません。<br /><b>{r.id} {r.name}</b></>} ok="削除する" onClose={() => setModal(null)}
          onOk={async () => { try { await api.action('remove', { kind, id: r.id }); toast('削除が完了しました。'); } catch (e) { toastError(e); } }} />,
      );
      return;
    }
    if (r.use > 0) {
      setModal(<EsModal title="削除できません" body={<>{deleteBlockedText(r.use)}<br /><b>{r.id} {r.name}</b></>} cancel="閉じる" onClose={() => setModal(null)} />);
      return;
    }
    setModal(
      <EsModal title="削除しますか？" body={<>削除済にします（一覧からは既定で隠れます。戻せません）。<br /><b>{r.id} {r.name}</b></>} ok="削除" onClose={() => setModal(null)}
        onOk={async () => { try { await api.action('remove', { kind, id: r.id }); toast('削除しました'); } catch (e) { toastError(e); } }} />,
    );
  };
  /*
   * CSV（00_確認してほしい/CSV入出力_定義_20261003.md）：取込と同じ列（lib/csv/master.ts）で、検索条件のとおりの全件。
   * プランマスタは決定 28-183 の形（プラン／コース／価格【削除】／設備の行）
   */
  const csvOut = () => csvExport<MasterRow>({
    screen: spec.title, entity: kind, rows: rows, keys: (r) => r.id,
    filters: [
      ...spec.search.flatMap((x) => {
        if (x.t === 'range' || x.t === 'date') {
          const [a, b] = x.t === 'range' ? [q[x.keys + '_min'], q[x.keys + '_max']] : [q[x.keys + '_from'], q[x.keys + '_to']];
          return a || b ? [{ label: x.label, value: `${a ?? ''}〜${b ?? ''}` }] : [];
        }
        return q[x.keys] ? [{ label: x.t === 'in' ? '検索' : x.label, value: q[x.keys] }] : [];
      }),
      ...(hideDeleted ? [] : [{ label: '削除済', value: '含む' }]),
    ],
  });
  /* CSV取込はモーダルではなく画面（hong 2026/10/05）。列の定義（テンプレート）は画面には出さず、画面設計書に書く */
  const csvIn = () => {
    /* E35：編集中（未保存）のまま CSV取込を押した */
    if (hasUnsavedChanges()) { toastError(new Error('編集中の内容を保存してから取り込んでください。')); return; }
    router.push(`${BASE[kind]}/import`);
  };

  return (
    <div className="wrap">
      <DemoTop kind={kind} />
      <section className={`screen mlist s-${LIST_CLS[kind]}`}>
        <header className="es-pagehead">
          <div className="es-pagehead__text">
            <nav className="es-breadcrumb" aria-label="パンくず"><a href="#" onClick={(e) => e.preventDefault()}>{spec.crumb0}</a><span className="es-breadcrumb__sep">/</span><span className="es-breadcrumb__cur">{spec.crumbCur}</span></nav>
            <h1 className="es-pagehead__title">{spec.title}</h1>
          </div>
          <div className="es-pagehead__actions">
            {canImport && <button type="button" className="es-btn es-btn--csv es-btn--lg" onClick={csvIn}><EsIcon name="CsvIn" />CSV取込</button>}
            <button type="button" className="es-btn es-btn--csv es-btn--lg" onClick={csvOut}><EsIcon name="CsvOut" />CSV出力</button>
            {/* 値引きの適用：子契約に直接書く（適用開始月から先。確定・請求済の月は変えない：台帳 2026/10/03） */}
            {kind === 'discounts' && canImport && <button type="button" className="es-btn es-btn--csv es-btn--lg" onClick={() => router.push(`${BASE[kind]}/import-apply`)}><EsIcon name="CsvIn" />適用 CSV取込</button>}
            {kind === 'discounts' && <button type="button" className="es-btn es-btn--csv es-btn--lg" onClick={() => csvExport({ screen: '値引きの適用', entity: 'discountApply' })}><EsIcon name="CsvOut" />適用 CSV出力</button>}
            {canAct(api, 'create', { kind }) && <button type="button" className="es-btn es-btn--solid es-btn--primary es-btn--lg" onClick={() => router.push(`${BASE[kind]}/new`)}><EsIcon name="Plus" /><span>新規登録</span></button>}
          </div>
        </header>
        <div className="es-shell__content">
          <section className="es-card">
            <form className={`es-search${folded ? ' is-collapsed' : ''}`} role="search" onSubmit={submit}>
              <div className="es-search__left">
                <button type="button" className={`es-search__toggle${wraps ? '' : ' hide'}`} aria-expanded={!folded} aria-label={folded ? '検索条件を開く' : '検索条件を閉じる'} onClick={() => setFolded(!folded)}>
                  <EsIcon name={folded ? 'CaretDown' : 'CaretUp'} size={20} />
                </button>
                <div className="es-search__fields" ref={fieldsRef}>
                  {spec.search.map((s) => (
                    <div key={s.keys} className={s.cls}>
                      {s.t === 'in' ? (
                        <div className="es-input es-input--md"><EsIcon name="Search" /><input value={draft[s.keys] ?? ''} placeholder={s.ph} aria-label={s.ph} onChange={(e) => setDraft({ ...draft, [s.keys]: e.target.value })} /></div>
                      ) : s.t === 'range' ? (
                        /* 数の範囲（下限〜上限。空＝無制限。hong 2026/10/05 A） */
                        <div className="es-range" role="group" aria-label={s.label}>
                          <span className="es-range__label">{s.label}</span>
                          <div className="es-input es-input--md"><input inputMode="numeric" value={draft[s.keys + '_min'] ?? ''} placeholder="下限" aria-label={`${s.label} 下限`} onChange={(e) => setDraft({ ...draft, [s.keys + '_min']: e.target.value })} /></div>
                          <span className="es-range__sep">〜</span>
                          <div className="es-input es-input--md"><input inputMode="numeric" value={draft[s.keys + '_max'] ?? ''} placeholder="上限" aria-label={`${s.label} 上限`} onChange={(e) => setDraft({ ...draft, [s.keys + '_max']: e.target.value })} /></div>
                          {s.unit && <span className="es-range__unit">{s.unit}</span>}
                        </div>
                      ) : s.t === 'date' ? (
                        /* 日付の範囲（hong 2026/10/05 E） */
                        <div className="es-range" role="group" aria-label={s.label}>
                          <span className="es-range__label">{s.label}</span>
                          <div className="es-input es-input--md"><input type="date" value={draft[s.keys + '_from'] ?? ''} aria-label={`${s.label} から`} onChange={(e) => setDraft({ ...draft, [s.keys + '_from']: e.target.value })} /></div>
                          <span className="es-range__sep">〜</span>
                          <div className="es-input es-input--md"><input type="date" value={draft[s.keys + '_to'] ?? ''} aria-label={`${s.label} まで`} onChange={(e) => setDraft({ ...draft, [s.keys + '_to']: e.target.value })} /></div>
                        </div>
                      ) : (
                        <div className="es-input es-input--md es-select">
                          <select value={draft[s.keys] ?? ''} aria-label={s.label} onChange={(e) => setDraft({ ...draft, [s.keys]: e.target.value })}>
                            <option value="">{s.label}</option>
                            {(s.dyn ? (data?.opts as Record<string, string[]> | undefined)?.[s.keys] ?? [] : s.o).map((o) => <option key={o} value={o}>{o}</option>)}
                          </select>
                          <EsIcon name="CaretDown" />
                        </div>
                      )}
                    </div>
                  ))}
                  <label className="delchk"><input type="checkbox" checked={draftHide} onChange={(e) => setDraftHide(e.target.checked)} /> 削除済みを表示しない</label>
                </div>
              </div>
              <div className="es-search__actions">
                <div className="es-search__main">
                  <button type="button" className="es-btn es-btn--outline es-btn--primary es-btn--md" onClick={clear}>クリア</button>
                  <UnappliedMark es show={dirty} />
                  <button type="submit" className="es-btn es-btn--solid es-btn--primary es-btn--md"><EsIcon name="Search" /><span>検索</span></button>
                </div>
                {/* 並べ替え（項目・昇順／降順）。押したときに効く（検索と別。受付簿 #87・台帳 F「プランマスタ一覧の並べ替え」） */}
                <div className={`es-search__extra${folded ? ' hide' : ''}`}>
                  <SortMenu options={sortCols.map((c) => [c.k, c.label])} value={sort?.key ?? ''} dir={sort?.dir ?? 'asc'} initialLabel="初期の順" onChange={(k, d) => pickSort(k, d)} />
                </div>
              </div>
            </form>
            <div className="es-table-wrap">
              <table className="es-table">
                <thead><tr>{spec.cols.map((c, i) => <th key={c.text} className={[c.cls, kind === 'materials' && i < spec.keys.length ? `mtc-${spec.keys[i]}` : kind === 'materials' ? 'mtc-ops' : ''].filter(Boolean).join(' ') || undefined} aria-sort={sort && spec.keys[i] === sort.key ? (sort.dir === 'asc' ? 'ascending' : 'descending') : undefined}>{c.text}</th>)}</tr></thead>
                <tbody>
                  {shown.map((r) => (
                    <tr key={r.id} className={r.deleted ? 'is-deleted' : undefined}>
                      {spec.keys.map((k) => (
                        <td key={k} className={kind === 'materials' ? [spec.tdcls[k], `mtc-${k}`].filter(Boolean).join(' ') : spec.tdcls[k]}>
                          {k === 'id' ? <Link href={detail(r.id)}>{r.id}</Link>
                            : k === 'photo' ? (r.row.photo ? <img className="mt-thumb" src={catImg(r.row.photo)} alt="" /> : '—')
                            : r.badge[k] ? <span className={`es-badge ${statusGroup(r.row[k]) ? 'es-badge--' + esTone(r.row[k]) : r.badge[k]}`}>{r.row[k]}</span>
                            : kind === 'materials' && (k === 'name' || k === 'course' || k === 'wh') ? <span className="mt-cell" title={r.row[k]}>{fmtAutoNode(r.row[k])}</span>
                            : fmtAutoNode(r.row[k])}
                        </td>
                      ))}
                      <td className={kind === 'materials' ? 'mtc-ops' : undefined}>
                        {!r.deleted && (
                          <span className="es-rowactions">
                            {/* 権限がなければ出さない */}
                            {canAct(api, 'save', { kind }) && <button type="button" className="es-btn es-btn--ghost es-btn--neutral es-btn--sm es-btn--icon" aria-label={`${r.name}を編集`} onClick={() => router.push(`${detail(r.id)}/edit?from=list`)}><EsIcon name="Pencil" /></button>}
                            {!r.system && canAct(api, 'remove', { kind }) && <button type="button" className="es-btn es-btn--ghost es-btn--negative es-btn--sm es-btn--icon" aria-label={`${r.name}を削除`} onClick={() => del(r)}><EsIcon name="Trash" /></button>}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {data && !rows.length && <tr><td colSpan={spec.cols.length} style={{ textAlign: 'center', color: 'var(--text-low)' }}>{kind === 'materials' ? '表示するデータがありません。' : '条件に一致するデータがありません。条件を変えるか「クリア」を押してください。'}</td></tr>}
                </tbody>
              </table>
            </div>
            <Pager total={rows.length} page={cur} per={per} onPage={setPage} onPer={setPer} />
          </section>
          {DEMO && spec.info && (
            <details className="info">
              <summary>デモの説明</summary>
              <div className="banner" dangerouslySetInnerHTML={{ __html: spec.info }} />
            </details>
          )}
        </div>
      </section>
      {modal}
    </div>
  );
}
