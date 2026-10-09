'use client';

import { SortMenu } from '@/components/SortMenu';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useLayoutEffect, useRef, useState, type FormEvent } from 'react';
import { areaApi, useQuery } from '@/lib/ops/core/client';
import reviews from '@/lib/ops/areas/reviews';
import { sameConds, UnappliedMark } from '../_general/list';
import { branchesOf, CSV_HEAD, DEFAULT_SORT, EMPTY_SEARCH, itemsByStar, SORT_COLS, sortLabel, splitSort } from '@/lib/ops/reviews/logic';
import type { ReviewRow, ReviewSearch, SortCol, SortKey } from '@/lib/ops/reviews/types';
import { today } from '@/lib/supplier/dates';
import { DEMO } from '@/lib/demo';
import { useOpsCsvExport } from '../_ui/csv';
import { useOps } from '../_ui/OpsProvider';
import { EsIcon } from './_components/EsIcon';
import { Crumbs, LeftBadge, Nick, None, Stars, Tag } from './_components/parts';
import { DateInput } from '@/components/DateInput';
import { fmtDate } from '@/lib/format/date';

/*
 * レビュー一覧（部品/17_運営_レビュー.html の「一覧」）。
 * 1行＝1回の投稿。商品は★の低い順に先頭2品だけ出し、3品以上は「他N品を表示」で開く。行を押すと詳細へ。
 * レビューIDは持たない：注文番号（OD＋7桁）で特定する。法人・拠点は別の列。並べ替えは全列＋昇順／降順。1ページ 10件（hong 2026-10-05）。
 * 検索条件・並べ替え・ページは sessionStorage に残し、詳細から戻ったときに元に戻す。
 */

const api = areaApi(reviews);
/** 一覧の商品セルに最初に出す品数 */
const SHOW = 2;
const PERS = [10, 20, 50];
const KEEP = 'ops-reviews-list';

type Form = Omit<ReviewSearch, 'sort'>;
/** 検索条件の名前（CSV のファイル名・出力の記録） */
const RV_LBL: Record<string, string> = { from: '投稿日から', to: '投稿日まで', prod: '商品', kw: 'キーワード', co: '法人', br: '拠点', user: 'ユーザー', tag: '評価タグ', star: '評価', hasCm: 'コメント' };
type Kept = { applied: ReviewSearch; page: number; per: number };
const { sort: _s, ...EMPTY_FORM } = EMPTY_SEARCH; // eslint-disable-line @typescript-eslint/no-unused-vars

export default function ReviewListPage() {
  const router = useRouter();
  const { toast, toastError } = useOps();
  const { data: opts } = useQuery(api, 'options');

  const [form, setForm] = useState<Form>(EMPTY_FORM);
  const [sort, setSort] = useState<SortKey>(DEFAULT_SORT);
  const [applied, setApplied] = useState<ReviewSearch>(EMPTY_SEARCH);
  const [page, setPage] = useState(1);
  const [per, setPer] = useState(10);
  const [opened, setOpened] = useState<Set<string>>(new Set());
  const [restored, setRestored] = useState(false);

  const { data: rows } = useQuery(api, 'list', applied);

  /* 詳細から戻ったとき：前の検索条件・並べ替え・ページに戻す */
  useEffect(() => {
    try {
      const k = JSON.parse(sessionStorage.getItem(KEEP) ?? 'null') as Kept | null;
      if (k) {
        const { sort: so, ...f } = { ...EMPTY_SEARCH, ...k.applied };
        setForm(f);
        setSort(so);
        setApplied({ ...f, sort: so });
        setPage(k.page || 1);
        setPer(PERS.includes(k.per) ? k.per : 10);
      }
    } catch { /* 読めなければ初めから */ }
    setRestored(true);
  }, []);
  useEffect(() => {
    if (!restored) return;
    try { sessionStorage.setItem(KEEP, JSON.stringify({ applied, page, per } satisfies Kept)); } catch { /* 残せなくてもよい */ }
  }, [restored, applied, page, per]);

  /* 検索条件の折りたたみ：項目が2行以上に折り返したときだけ開閉のボタンを出す（元の checkWrap） */
  const fieldsRef = useRef<HTMLDivElement>(null);
  const [wrapped, setWrapped] = useState(false);
  const [sOpen, setSOpen] = useState(true);
  useLayoutEffect(() => {
    const f = fieldsRef.current;
    if (!f) return;
    const check = () => {
      let top: number | null = null, w = false;
      for (const c of Array.from(f.children) as HTMLElement[]) {
        if (top === null) top = c.offsetTop;
        else if (c.offsetTop > top + 4) { w = true; break; }
      }
      setWrapped(w);
    };
    check();
    if (!window.ResizeObserver) return;
    const ro = new ResizeObserver(check);
    ro.observe(f);
    return () => ro.disconnect();
  }, []);
  const collapsed = wrapped && !sOpen;

  const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm((f) => ({ ...f, [k]: v }));
  const search = (f: Form = form, so: SortKey = sort) => {
    setApplied({ ...f, sort: so });
    setPage(1);
    setOpened(new Set());
  };
  const onSubmit = (e: FormEvent) => { e.preventDefault(); search(); };
  const clear = () => {
    setForm(EMPTY_FORM);
    setSort(DEFAULT_SORT);
    search(EMPTY_FORM, DEFAULT_SORT);
  };
  /* 並べ替えは、いま効いている条件のまま並びだけ変える（条件は「検索」で効く）。項目（全列）＋昇順／降順 */
  const pickSort = (k: SortKey) => { setSort(k); setApplied((a) => ({ ...a, sort: k })); setPage(1); };
  const [sortCol, sortDir] = splitSort(sort);
  const strs = (x: Record<string, unknown>) => Object.fromEntries(Object.entries(x).map(([k, v]) => [k, String(v ?? '')]));
  const { sort: _as, ...appliedForm } = applied; // eslint-disable-line @typescript-eslint/no-unused-vars
  const dirty = !sameConds(strs(form), strs(appliedForm));

  /* CSV出力：検索条件のとおりの全件・1行＝レビューの1商品（レビューの項目をくり返す）。メールアドレスは出さない（2026-09-28 決定） */
  const csvExport = useOpsCsvExport();
  const csv = () => csvExport<string[]>({
    screen: 'レビュー一覧',
    filters: Object.entries(applied).filter(([k, v]) => k !== 'sort' && v !== '' && v !== undefined && v !== null && !(Array.isArray(v) && !v.length))
      .map(([k, v]) => ({ label: RV_LBL[k] ?? k, value: Array.isArray(v) ? v.join(';') : String(v) })),
    rows: async () => (await api.query('csv', applied)).rows,
    columns: CSV_HEAD.map((h, i) => ({ label: h, get: (r: string[]) => r[i] })),
  });

  const list = rows ?? [];
  const tot = list.length;
  const pages = Math.max(1, Math.ceil(tot / per));
  const pg = Math.min(page, pages);
  const s = (pg - 1) * per;
  const sl = list.slice(s, s + per);
  const toggleOpen = (id: string) => setOpened((o) => { const n = new Set(o); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  const cos = opts?.companies ?? [];

  return (
    <section>
      <header className="es-pagehead">
        <div className="es-pagehead__text">
          <Crumbs items={[{ label: 'レビュー・ご意見' }]} />
          <h1 className="es-pagehead__title">レビュー・ご意見</h1>
        </div>
        <div className="es-pagehead__actions">
          <button type="button" className="es-btn es-btn--outline es-btn--primary es-btn--md" onClick={csv}><EsIcon n="ReadCvLogo" />CSV出力</button>
        </div>
      </header>
      <div className="es-shell__content">
        {DEMO && <DemoNote />}

        <section className="es-card">
          <form className={`es-search${collapsed ? ' is-collapsed' : ''}`} role="search" onSubmit={onSubmit}>
            <div className="es-search__left">
              <button
                type="button" className={`es-search__toggle${wrapped ? '' : ' hide'}`} aria-expanded={sOpen}
                aria-label={sOpen ? '検索条件を閉じる' : '検索条件を開く'} onClick={() => setSOpen((o) => !o)}
              >
                <EsIcon n={sOpen ? 'CaretUp' : 'CaretDown'} />
              </button>
              <div className="es-search__fields" ref={fieldsRef}>
                <div className="es-field es-grow"><div className="es-input es-input--md"><EsIcon n="Search" s={18} /><input value={form.prod} onChange={(e) => set('prod', e.target.value)} placeholder="注文番号、商品名、商品ID" /></div></div>
                <Select value={form.star} onChange={(v) => set('star', v as Form['star'])}>
                  <option value="">評価</option>
                  {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>★{n}</option>)}
                  <option value="low">★2以下</option>
                </Select>
                {(['from', 'to'] as const).map((k) => (
                  <div className="es-field" key={k}>
                    <div className="es-input es-input--md">
                      <EsIcon n="Calendar" s={18} />
                      <DateInput fill value={form[k]} placeholder={k === 'from' ? '投稿日（から）yyyy-mm-dd' : '投稿日（まで）yyyy-mm-dd'}
                        aria-label={k === 'from' ? '投稿日（から）' : '投稿日（まで）'} onChange={(e) => set(k, e.target.value)} />
                    </div>
                  </div>
                ))}
                <Select value={form.co} onChange={(v) => setForm((f) => ({ ...f, co: v, br: '' }))}>
                  <option value="">法人</option>
                  {cos.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </Select>
                <Select value={form.br} onChange={(v) => set('br', v)}>
                  <option value="">拠点</option>
                  {branchesOf(cos, form.co).map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                </Select>
                <Select value={form.tag} onChange={(v) => set('tag', v)}>
                  <option value="">評価タグ</option>
                  <optgroup label="不満（★1〜2）">{(opts?.ng ?? []).map((t) => <option key={t}>{t}</option>)}</optgroup>
                  <optgroup label="満足（★3〜5）">{(opts?.ok ?? []).map((t) => <option key={t}>{t}</option>)}</optgroup>
                </Select>
                <div className="es-field es-wide"><div className="es-input es-input--md"><input value={form.user} onChange={(e) => set('user', e.target.value)} placeholder="ユーザーID、ニックネーム" /></div></div>
                <div className="es-field es-wide"><div className="es-input es-input--md"><input value={form.kw} onChange={(e) => set('kw', e.target.value)} placeholder="コメントのキーワード" /></div></div>
                <Select value={form.hasCm} onChange={(v) => set('hasCm', v as Form['hasCm'])}>
                  <option value="">コメント有無</option>
                  <option value="1">コメントあり</option>
                  <option value="0">コメントなし</option>
                </Select>
              </div>
            </div>
            <div className="es-search__actions">
              <div className="es-search__main">
                <button type="button" className="es-btn es-btn--outline es-btn--primary es-btn--md" onClick={clear}>クリア</button>
                <UnappliedMark es show={dirty} />
                <button type="submit" className="es-btn es-btn--solid es-btn--primary es-btn--md">検索</button>
              </div>
              <div className={`es-search__extra${collapsed ? ' hide' : ''}`}>
                <SortMenu options={SORT_COLS.map(([k, l]) => [k, l])} value={sortCol} dir={sortDir} onChange={(k, d) => pickSort(`${k as SortCol}:${d}`)} />
              </div>
            </div>
          </form>

          <div className="list-head">
            <h2>一覧</h2><span className="cnt">{rows ? `${tot}件` : ''}</span>
            <span className="cnt" style={{ marginLeft: 'auto' }}>並べ替え：{sortLabel(sort)}</span>
          </div>
          <div className="es-table-wrap">
            <table className="es-table rv-table" style={{ minWidth: '92rem' }}>
              <thead><tr><th style={{ width: '2.857143rem' }}>No</th><th>注文番号</th><th>投稿日時</th><th>投稿者</th><th>法人</th><th>拠点</th><th style={{ textAlign: 'right' }}>品数</th><th>商品と評価・評価タグ</th><th>コメント</th></tr></thead>
              <tbody>
                {sl.length ? sl.map((r, i) => (
                  <tr key={r.order} onClick={(e) => { if (!(e.target as Element).closest('a,button')) router.push(`/ops/reviews/${r.order}`); }}>
                    <td className="nw es-num">{s + i + 1}</td>
                    <td className="nw"><Link href={`/ops/reviews/${r.order}`} className="es-mono">{r.order}</Link></td>
                    <td className="nw es-num">{fmtDate(r.dt.slice(0, 10))}<span className="rv-sub">{r.dt.slice(11)}</span></td>
                    <td style={{ minWidth: '10rem' }}>
                      <span className="rv-nick"><Nick nick={r.user.nick} /></span> <span className="es-mono rv-uid">{r.user.uid}</span>
                      {r.user.left && <> <LeftBadge /></>}
                    </td>
                    <td style={{ minWidth: '9rem' }}>{r.co.name}</td>
                    <td style={{ minWidth: '9rem' }}>{r.br.name}</td>
                    <td className="nw es-num" style={{ textAlign: 'right' }}>{r.items.length}品</td>
                    <td><ProdCell r={r} open={opened.has(r.id)} onToggle={() => toggleOpen(r.id)} /></td>
                    <td>{r.comment ? <div className="rv-cm">{r.comment}</div> : <None />}</td>
                  </tr>
                )) : rows && <tr className="rv-empty"><td colSpan={9}>条件に一致するレビューはありません</td></tr>}
              </tbody>
            </table>
          </div>
          <div className="es-pagination">
            <span className="es-pagination__meta">{tot ? `${tot}件中 ${s + 1}–${Math.min(s + per, tot)}件` : '0件'}</span>
            <button type="button" className="es-page" disabled={pg === 1} aria-label="前へ" onClick={() => setPage(pg - 1)}><EsIcon n="CaretLeft" s={14} /></button>
            {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
              <button key={p} type="button" className={`es-page${p === pg ? ' is-current' : ''}`} onClick={() => setPage(p)}>{p}</button>
            ))}
            <button type="button" className="es-page" disabled={pg === pages} aria-label="次へ" onClick={() => setPage(pg + 1)}><EsIcon n="CaretRight" s={14} /></button>
            <select aria-label="表示件数" value={per} onChange={(e) => { setPer(+e.target.value); setPage(1); }}>
              {PERS.map((n) => <option key={n} value={n}>{n}件／ページ</option>)}
            </select>
          </div>
        </section>
      </div>
    </section>
  );
}

/** 選択の入力欄（右に▼） */
function Select({ value, onChange, children }: { value: string; onChange: (v: string) => void; children: React.ReactNode }) {
  return (
    <div className="es-field">
      <div className="es-input es-input--md es-select">
        <select value={value} onChange={(e) => onChange(e.target.value)}>{children}</select>
        <EsIcon n="CaretDown" s={16} />
      </div>
    </div>
  );
}

/** 商品セル：★の低い順に先頭2品。3品以上は「他N品を表示」で開く。★2以下の品数は常に出す */
function ProdCell({ r, open, onToggle }: { r: ReviewRow; open: boolean; onToggle: () => void }) {
  const its = itemsByStar(r);
  const vis = open ? its : its.slice(0, SHOW);
  const rest = its.length - SHOW;
  const low = its.filter((x) => x.star <= 2).length;
  return (
    <>
      <table className="rv-items">
        <tbody>
          {vis.map((x) => (
            <tr key={x.pid}>
              <td className="pn" title={x.name}>{x.name}</td>
              <td className="st"><Stars s={x.star} /></td>
              <td className="tg">{x.tags.length ? x.tags.map((t) => <Tag key={t} t={t} />) : <None />}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {(rest > 0 || low > 0) && (
        <div className="rv-foot">
          {rest > 0 && (
            <button type="button" className="rv-more" aria-expanded={open} onClick={(e) => { e.stopPropagation(); onToggle(); }}>
              {open ? '閉じる' : `他${rest}品を表示`}<EsIcon n={open ? 'CaretUp' : 'CaretDown'} s={14} />
            </button>
          )}
          {low > 0 && <span className="es-badge es-badge--negative">★2以下 {low}品</span>}
        </div>
      )}
    </>
  );
}

/** デモの説明・前提（DEMO のときだけ） */
function DemoNote() {
  return (
    <details className="demo-note">
      <summary>デモの説明・前提 <EsIcon n="CaretDown" s={16} /></summary>
      <div className="es-inline es-inline--info" role="status">
        <EsIcon n="BellSimple" s={18} />
        <div>
          <strong>個人アプリ「マイページ ＞ レビュー・ご意見」の投稿を、運営Web（システム管理者）で見るための画面です。</strong>
          <ul>
            <li>できることは<b>閲覧・検索・CSV出力だけ</b>（2026-09-28 hong 決定）。非表示・返信・対応ステータス・社内メモは持たない</li>
            <li>一覧は<b>1行＝1回の投稿</b>。1回の投稿に複数の商品（★評価＋評価タグ）と、投稿全体に1つのコメントがつく</li>
            <li>一覧の商品は<b>★の低い順に先頭2品だけ</b>表示し、3品以上は「＋他N品」で開く。全品は詳細で確認する。★2以下の品数は常に表示</li>
            <li>ユーザーは<b>ユーザーIDとニックネーム</b>で表示し、メールアドレスは一覧・詳細・検索・CSVのどこにも出さない</li>
            <li>投稿は<b>注文（注文番号 OD＋7桁）に紐付く</b>（1回の注文に1回の投稿）。<b>レビューIDは持たない</b>ので、一覧・詳細・CSV・検索は注文番号で特定する（hong 2026-10-05）。ユーザーは投稿を<b>編集・削除できない</b>。<b>退会したユーザーの投稿も残す</b>（一覧・詳細で「退会済」を表示）。ユーザーIDは <b>U＋7桁</b>（例：U0000123）。<b>ニックネーム未設定のユーザーは「匿名ユーザー」</b>と表示する（検索の「ニックネーム」でも「匿名ユーザー」で探せる）</li>
            <li>評価タグは固定（運営Webでマスタ管理しない）。★1〜2 は不満タグ、<b>★3〜5 は満足タグ</b>（★3 も ★5 と同じタグ）。★評価は人気ランキング「アンケート評価順」（REQ-MO-031）の元データ</li>
            <li>サイドメニューは「レビュー・ご意見」（一覧）だけ。詳細は一覧から開く（サイドメニューに置かない）</li>
            <li>画面は ES Kitchen デザインシステム（System admin テーマ）に合わせている</li>
          </ul>
        </div>
      </div>
      <div className="es-inline es-inline--warning" role="status">
        <EsIcon n="ClockCountdown" s={18} />
        <div>
          <strong>要確認（推測で埋めていない点）</strong>
          <ul>
            <li>CSVの形式（デモは1行＝1商品の生データ・検索条件に一致する全件）</li>
          </ul>
        </div>
      </div>
    </details>
  );
}
