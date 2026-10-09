'use client';

import { useMemo, useRef, useState, type ReactNode } from 'react';
import { avgCostOfKind, BASE_KINDS, BASE_LABEL, BASE_TOTAL, baseEligible, baseSums, MENU_PDF_KINDS, MENU_PDF_MAX, newItem, PRODUCT_TAG_MAX, suggestItems, targetOfKind, unmetOf } from '@/lib/domain/menu';
import { mgmtNameOf } from '@/lib/domain/product';
import type { AvgTarget, CorpPublish, MenuBaseKind, MenuItem, MenuPdf, MenuPdfKind, MonthlyMenu, Product } from '@/lib/domain/types';
import type { MenuEditView } from '@/lib/ops/menu/edit';
import { TAG_TONE, ymJa } from '@/lib/ops/menu/logic';
import type { Menu } from '@/lib/ops/menu/types';
import { MultiDrop, type DropOpt } from '@/app/ops/masters/products/_parts/MultiDrop';
import { Badge, Button, CheckList, Chk, Dialog, EmptyState, FieldError, Icon, Pager, Sel, Stepper, Table, Td } from './es';
import { photo } from './photo';
import { api } from './parts';
import { fmtDate, fmtDateTime } from '@/lib/format/date';
import { fmtNum, yen } from '@/lib/format/money';

/*
 * 月間メニュー登録・編集（Phase 1 画面 01〜09）の部品。データは共通データ（lib/domain）の形のまま持ち、
 * 基準注文数・公開の条件・CSV のテンプレートは lib/domain/menu.ts の関数をそのまま使う（画面で同じ計算をする）。
 *   ProductTable  商品一覧（≡ で並べ替え＝法人が見る順・公開可能・営業サンプル・商品タグ・基準注文数 3種類・削除）
 *   AddProduct    商品追加（絞り込み・リスト／グリッド・継続の印・ページ送り・選択済み：N（追加選択：N））
 *   PdfDialog     メニューPDF（ドラッグ＆ドロップ・PDF のみ・容量・種別 ライト用／スタンダード用・削除）
 *   Ask           保存の確認（保存して公開／「自動公開」に変更して保存／保存して自動公開）
 *   ReadyPanel    公開の条件（全商品が公開可能・メイン画像・メニューPDF・仮発注の承認）
 *   Stats         指標一覧（倉庫タブ・基準注文数合計・平均単価・コース別・価格帯・カテゴリ別・注目・タグ・公開状況）
 */

export type View = MenuEditView & { vmN: Menu['vmN'] | null; /** 同時更新の検知の版（E31） */ ver: string };
/** 画面で直すもの（保存するまで下書き） */
export type Draft = {
  items: MenuItem[]; corpPublish: CorpPublish; pdfs: MenuPdf[];
  publishOn: string; orderFrom: string; orderTo: string; vmN: Menu['vmN'] | null;
  /** 平均仕入単価の目標（冷蔵庫・自販機の 下限〜上限。メニューごと。公開したメニューは固定） */
  avgTarget: AvgTarget;
  /** 標準数の提案 ②（平均単価の調整）を使わない（「調整を戻す」） */
  noAdjust: boolean;
};
export const draftOf = (v: View): Draft => ({
  items: v.menu.items, corpPublish: v.menu.corpPublish, pdfs: v.menu.pdfs,
  publishOn: v.menu.publishOn, orderFrom: v.menu.orderFrom, orderTo: v.menu.orderTo, vmN: v.vmN, avgTarget: v.avgTarget, noAdjust: !!v.menu.noAdjust,
});
/** 下書きを共通データのメニューの形にする（公開の条件・合計の確かめに使う） */
export const asMenu = (v: View, d: Draft): MonthlyMenu => ({ ...v.menu, ...d, items: d.items.map((x, i) => ({ ...x, order: i + 1 })) });

/** 商品を引く道具（共通データの商品・仕入先名・倉庫名） */
export function useLookup(v: View) {
  return useMemo(() => {
    const PM = new Map(v.products.map((x) => [x.p.id, x]));
    const prod = (id: string) => PM.get(id)?.p;
    const weights = new Map(Object.entries(v.weights));
    const cost = (id: string) => PM.get(id)?.costYen ?? 0;
    /* 提案：①注文の割合で按分 → ②平均仕入単価が目標の幅に入るように調整（adjust＝false なら ①だけ） */
    const recalc = (items: MenuItem[], target: AvgTarget, adjust = true) => suggestItems(items, weights, prod, { cost, target, adjust });
    return { PM, prod, cost, row: (id: string) => PM.get(id), recalc };
  }, [v]);
}
export type Lookup = ReturnType<typeof useLookup>;

/* ---------------- 表示の小物 ---------------- */

const seedOf = (s: string) => [...s].reduce((a, c) => a + c.charCodeAt(0), 0) % 97;
/** 商品のメイン画像（見本のパスはカテゴリの絵。画像がなければ ''） */
export function imgOf(p: Product | undefined) {
  const m = p?.images.find((x) => x.main);
  if (!p || !m) return '';
  return /^(data:|https?:|\/)/.test(m.file) ? m.file : photo(p.category || '惣菜', seedOf(m.file));
}
export function Photo({ p, big }: { p: Product | undefined; big?: boolean }) {
  const src = imgOf(p);
  // eslint-disable-next-line @next/next/no-img-element
  if (src) return <img className={big ? 'me-gimg' : 'od-thumb'} src={src} alt="" />;
  return <span className={big ? 'me-gimg me-noimg' : 'od-thumb me-noimg'} title="メイン画像なし">{big ? '画像なし' : '—'}</span>;
}
const courseL = (p: Product) => p.courses.join('・') || '—';
/** 公開したメニューの販売価格（写し）。なければ商品マスタの価格 */
export function priceOf(v: View, p: Product) {
  const snap = v.priceLocked ? v.menu.prices?.[p.id] : undefined;
  return { yen: snap ? snap.priceYen : p.priceYen, snap: !!snap, master: p.priceYen };
}

/** 確認のモーダル（Phase 1 画面 05・07 の形：？／！の印・タイトル・本文・ボタンを並べる） */
export function Ask({ mark = '?', title, children, buttons, onClose }: { mark?: '?' | '!'; title: string; children?: ReactNode; buttons: ReactNode; onClose: () => void }) {
  return (
    <div className="es-modal" role="dialog" aria-modal="true" aria-labelledby="me-ask-t">
      <div className="es-modal__scrim" />
      <div className="es-modal__panel me-ask">
        <button className="es-modal__close" aria-label="閉じる" onClick={onClose}><Icon name="X" size={18} /></button>
        <div className={'es-modal__mark ' + (mark === '?' ? 'me-mark-q' : 'es-modal__mark--negative')} aria-hidden>{mark}</div>
        <h2 id="me-ask-t" className="es-modal__title">{title}</h2>
        {children ? <div className="es-modal__body">{children}</div> : null}
        <div className="me-ask__btns">{buttons}</div>
      </div>
    </div>
  );
}

/* ================= 公開の条件（吹き出し） ================= */

/** 公開の条件（共通データの unmetOf の結果を項目ごとに）と、基準注文数の合計 */
export function readiness(v: View, L: Lookup, d: Draft, mode: 'publish' | 'saved' = 'publish') {
  const missing = unmetOf(asMenu(v, d), L.prod, v.kari ?? undefined, mode);
  const find = (s: string) => missing.find((x) => x.includes(s));
  const items = [
    { label: '全商品が公開可能', key: '公開可能' },
    { label: '全商品のメイン画像', key: 'メイン画像' },
    { label: 'メニューPDF のアップロード', key: 'メニューPDF' },
    { label: `${v.menu.id}の仮発注の承認`, key: '仮発注' },
  ].map((x) => { const m = find(x.key); return { label: x.label, state: (m ? 'ng' : 'ok') as 'ok' | 'ng', reason: m }; });
  /* 種類ごとの基準注文数の合計が 50 でない（公開は合計 50 が要る：E139）・商品なし・削除済の商品 */
  missing.filter((m) => !['公開可能', 'メイン画像', 'メニューPDF', '仮発注'].some((k) => m.includes(k))).forEach((m) => items.unshift({ label: m, state: 'ng', reason: undefined }));
  return { ready: !missing.length, missing, items };
}

export function ReadyPanel({ v, L, d }: { v: View; L: Lookup; d: Draft }) {
  const r = readiness(v, L, d, v.menu.status === '公開中' || v.menu.status === '締切済' ? 'saved' : 'publish');
  return (
    <div className={'me-bubble' + (r.ready ? ' ok' : '')} role="note" aria-label="公開の条件">
      <p>全商品が公開可能であり、かつメニューPDFがアップロード済みで、その月の仮発注が承認されていて、種類ごとの基準注文数の合計が50である場合に限り、メニューを公開します。</p>
      <CheckList items={r.items.map((x) => ({ label: x.label, state: x.state, reason: x.state === 'ng' ? x.reason?.replace(/^.*?（/, '（') : undefined }))} />
      <b className="me-bubble__res">{r.ready ? '公開できます' : '条件がそろうまで公開できません'}</b>
    </div>
  );
}

/* ================= 基準注文数の合計 ================= */

/**
 * 種類ごとの合計と、保存できない理由。保存を止めるのは「手で直した値だけで 50 を超える」とき（E123）だけ。
 * 合計が 50 でないこと（bad）は保存を止めず、保存の確認（No.11.14・Q115）で確かめる（受付簿 #249・#256）
 */
export function baseCheck(L: Lookup, items: MenuItem[]) {
  const { sums, bad } = baseSums(items, L.prod);
  const msgs = BASE_KINDS.filter((k) => items.filter((x) => x.manual[k] && baseEligible(k, L.prod(x.productId))).reduce((a, x) => a + x.base[k], 0) > BASE_TOTAL)
    .map((k) => `${BASE_LABEL[k]}は、手で直した値の合計が${BASE_TOTAL}を超えています。`);
  return { sums, bad, msgs };
}

/* ================= 商品一覧 ================= */

type PF = { kw: string; cat: string; course: string; smp: string };
const PF0: PF = { kw: '', cat: '', course: '', smp: '' };

export function ProductTable({ v, L, d, edit, lockItems, onItems, onDelete, onAddTag, onRemoveTag, toolbar }: {
  v: View; L: Lookup; d: Draft; edit: boolean;
  /** 締切済：商品の追加・外す・基準注文数の変更はできない（E124。表示の項目・並びは直せる） */
  lockItems?: boolean;
  onItems: (items: MenuItem[], recalc?: boolean) => void;
  onDelete: (productId: string) => void;
  onAddTag: (name: string) => Promise<string>;
  onRemoveTag: (name: string) => Promise<void>;
  toolbar?: ReactNode;
}) {
  const [qd, setQd] = useState<PF>(PF0);
  const [q, setQ] = useState<PF>(PF0);
  /* 並べ替え（直近3ヶ月の注文数・注文の割合。見出しを押すと 降順 → 昇順 → 表示順）。並べ替え中はドラッグで並び替えできない */
  const [sort, setSort] = useState<{ k: 'qty' | 'share'; dir: 'asc' | 'desc' } | null>(null);
  const [arm, setArm] = useState('');
  const [drag, setDrag] = useState('');
  const [over, setOver] = useState('');
  /* ページ送り（表示件数を選べる・初期値は全件。RD-MN-020） */
  const [pg, setPg] = useState(1);
  const [per, setPer] = useState(0);
  const filtering = !!(q.kw || q.cat || q.course || q.smp) || !!sort;
  const items = d.items;
  const recentOf = (id: string) => v.recent[id] ?? { qty: 0, share: 0 };
  const hit0 = items.filter((x) => {
    const p = L.prod(x.productId);
    if (q.kw && !(p?.name ?? '').includes(q.kw) && !(p ? mgmtNameOf(p) : '').includes(q.kw) && !x.productId.includes(q.kw)) return false;
    if (q.cat && p?.category !== q.cat) return false;
    if (q.course && !p?.courses.includes(q.course as Product['courses'][number])) return false;
    if (q.smp && (q.smp === 'あり') !== x.sample) return false;
    return true;
  });
  const hit = sort ? [...hit0].sort((a, b) => (recentOf(a.productId)[sort.k] - recentOf(b.productId)[sort.k]) * (sort.dir === 'asc' ? 1 : -1) || a.order - b.order) : hit0;
  const sortHead = (k: 'qty' | 'share', label: ReactNode) => (
    <button type="button" className="me-sorth" aria-sort={sort?.k === k ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'} title="押すと並べ替え（降順 → 昇順 → 表示順）"
      onClick={() => setSort(sort?.k !== k ? { k, dir: 'desc' } : sort.dir === 'desc' ? { k, dir: 'asc' } : null)}>
      {label}{sort?.k === k ? (sort.dir === 'asc' ? ' ▲' : ' ▼') : ' ◇'}
    </button>
  );
  const size = per > 0 ? per : Math.max(1, hit.length), pages = Math.max(1, Math.ceil(hit.length / size)), cur = Math.min(pg, pages);
  const shown = hit.slice((cur - 1) * size, cur * size);
  const set = (pid: string, patch: Partial<MenuItem>, recalc = false) => onItems(items.map((x) => (x.productId === pid ? { ...x, ...patch } : x)), recalc);
  const setBase = (pid: string, k: MenuBaseKind, n: number) => {
    const x = items.find((i) => i.productId === pid)!;
    set(pid, { base: { ...x.base, [k]: n }, manual: { ...x.manual, [k]: true } }, true);
  };
  const unsetManual = (pid: string, k: MenuBaseKind) => {
    const x = items.find((i) => i.productId === pid)!;
    set(pid, { manual: { ...x.manual, [k]: false } }, true);
  };
  const move = (from: string, to: string) => {
    if (!from || from === to) return;
    const a = items.slice(), i = a.findIndex((x) => x.productId === from), j = a.findIndex((x) => x.productId === to);
    if (i < 0 || j < 0) return;
    const [m] = a.splice(i, 1);
    a.splice(j, 0, m);
    onItems(a.map((x, n) => ({ ...x, order: n + 1 })));
  };
  const allPub = !!items.length && items.every((x) => x.publishable);
  const inDraft = new Set(items.flatMap((x) => x.tags));
  /*
   * 商品タグ：メニューの画面で月ごとに付ける1種類だけ。タグの名前の足す・消すもここ（20個まで・同じ名前は E09・月間メニューで使っていれば消せない）。
   * NEW も特別扱いしない（台帳 F 2026-10-08・受付簿 #179）。used＝使っている月間メニューの数
   */
  const tagOpts: DropOpt[] = v.tags.map((t) => ({ value: t.name, label: t.name, used: t.inMenus, removable: !t.inMenus && !inDraft.has(t.name),
    lockedTip: inDraft.has(t.name) ? 'このメニューで使っているため削除できません' : '月間メニューで使っているため削除できません' }));
  const bc = baseCheck(L, items);
  /* ②の結果：種類ごとの平均仕入単価が目標の幅の外なら警告（調整しても届かなかった・手で直した値で外れた） */
  const adjWarn = d.noAdjust ? [] : BASE_KINDS.flatMap((k) => {
    const a = avgCostOfKind(items, k, L.prod, L.cost), t = targetOfKind(d.avgTarget, k);
    return a != null && (a < t.min || a > t.max) ? [`${BASE_LABEL[k]}の平均仕入単価 ${yen(a)} が目標（${t.min}〜${t.max}円）の幅に入っていません（自動の調整では届かないので、注文の割合の按分のままです。手で直してください）`] : [];
  });
  const lock = !edit;

  const baseCell = (x: MenuItem, p: Product | undefined, k: MenuBaseKind) => {
    if (!baseEligible(k, p)) return <td key={k} className="c"><span className="od-small" title={k === 'ns' ? '短消費期限の商品（対象外）' : '自販機に入らない商品（対象外）'}>—</span></td>;
    const man = x.manual[k], adj = x.adj?.[k] ?? 0;
    return (
      <td key={k} className="c">
        <span className={'me-base' + (man ? ' is-man' : '')}>
          {edit && !lockItems ? <Stepper value={x.base[k]} label={(p?.name ?? x.productId) + ' ' + BASE_LABEL[k]} onChange={(n) => setBase(x.productId, k, n)} /> : <b>{x.base[k]}</b>}
          {adj ? <span className="me-adj" title={`平均仕入単価が目標の幅に入るように自動で調整した数（注文の割合の按分 ${x.base[k] - adj} から ${adj > 0 ? '+' : ''}${adj}）`}>{adj > 0 ? `↑${adj}` : `↓${-adj}`}</span> : null}
          {man ? (edit && !lockItems
            ? <button type="button" className="me-man" title="手で直した値（再計算で上書きしない）。押すと自動に戻す" aria-label="自動に戻す" onClick={() => unsetManual(x.productId, k)}>手</button>
            : <span className="me-man" title="手で直した値（再計算で上書きしない）">手</span>) : null}
        </span>
      </td>
    );
  };

  return (
    <>
      <div className="me-filter">
        <div className="es-input es-input--md me-kw"><Icon name="Search" size={18} /><input placeholder="品番・商品名" value={qd.kw} onChange={(e) => setQd({ ...qd, kw: e.target.value })} onKeyDown={(e) => { if (e.key === 'Enter') { setQ(qd); setPg(1); } }} /></div>
        <Sel aria-label="カテゴリ" value={qd.cat} onChange={(e) => setQd({ ...qd, cat: e.target.value })} options={[{ value: '', label: '全てカテゴリ' }, ...v.cats]} />
        <Sel aria-label="コース" value={qd.course} onChange={(e) => setQd({ ...qd, course: e.target.value })} options={[{ value: '', label: '全てコース' }, 'ライト', 'スタンダード']} />
        <Sel aria-label="営業サンプル" value={qd.smp} onChange={(e) => setQd({ ...qd, smp: e.target.value })} options={[{ value: '', label: '営業サンプル' }, 'あり', 'なし']} />
        <Button variant="outline" onClick={() => { setQd(PF0); setQ(PF0); setSort(null); setPg(1); }}>クリア</Button>
        <Button onClick={() => { setQ(qd); setPg(1); }}>検索</Button>
        {toolbar ? <div className="me-filter__r">{toolbar}</div> : null}
      </div>
      <p className="mo-note">フィルタで表示を絞り込めます。（※フィルタ中・注文数の並べ替え中は並び替えできません）。「直近3ヶ月の注文数・注文の割合」は標準数の提案に使っている値（前の3サイクル月までの注文）です。並び順（≡ をドラッグ）は、法人が注文画面で見る順です。商品名は管理名（法人・アプリには公開名を出します）。横にスクロールしても 商品名 までの列は固定です。</p>
      <div className="me-sums" role="status">
        {BASE_KINDS.map((k) => (
          <span key={k} className={'me-sum' + (bc.bad.includes(k) ? ' ng' : '')}>{BASE_LABEL[k]} <b>{bc.sums[k]}</b> / {BASE_TOTAL}</span>
        ))}
        <span className="od-small">「手」＝運営が手で直した値（再計算で上書きしない）。ほかの値は、合計が {BASE_TOTAL} になるように自動で入れ直し（①前の2〜3サイクル月の注文の割合・新しい商品は同じカテゴリの平均）、平均仕入単価が目標の幅に入るように高い商品から安い商品へ1つずつ移します（②。↑n／↓n＝調整した数）。</span>
      </div>
      {/* 合計のエラーは合計の下にインラインで（台帳 E「保存エラーの出し方」・受付簿 #76。エラーの枠は出さない） */}
      {bc.msgs.map((m) => <FieldError key={m}>{m}</FieldError>)}
      {adjWarn.length ? <div className="me-err" role="alert">{adjWarn.map((m) => <div key={m}>{m}</div>)}</div> : null}
      {d.noAdjust ? <p className="mo-note">平均単価の調整（提案 ②）を戻しています（注文の割合の按分のまま）。「調整をやり直す」で目標の幅に入るように調整します。</p> : null}
      <Table cls="me-ptbl" empty="表示するデータがありません。"
        cols={[{ label: '', w: 28 }, { label: 'No', w: 40 }, { label: '写真', w: 56 }, { label: '品番' }, { label: '商品名' },
          { label: edit ? <label className="me-hchk"><input type="checkbox" checked={allPub} aria-label="全商品を公開可能にする" onChange={(e) => onItems(items.map((x) => ({ ...x, publishable: e.target.checked })))} />公開可能</label> : '公開可能', cls: 'c' },
          { label: 'カテゴリ' }, { label: '営業サンプル', cls: 'c' }, { label: 'コース' }, { label: 'ピッキング倉庫' }, { label: '仕入先' }, { label: '商品タグ', w: 200 },
          { label: '短消費期限' }, { label: '販売価格（税込）', cls: 'r' }, { label: '仕入価格（税抜）', cls: 'r' },
          /* 直近3ヶ月の注文数・注文の割合（標準数の提案に使っている値と同じ。並べ替えできる。2026-10-05 台帳 F） */
          { label: sortHead('qty', <span>直近3ヶ月の<br />注文数</span>), cls: 'r' }, { label: sortHead('share', <span>注文の<br />割合</span>), cls: 'r' },
          { label: '基準注文数', cls: 'c' }, { label: <span>短消費期限なし<br />基準注文数</span>, cls: 'c' }, { label: <span>自販機<br />基準注文数</span>, cls: 'c' },
          { label: '自販機コラム' }, ...(edit ? [{ label: '外す', w: 48 }] : [])]}
        rows={shown.map((x) => {
          const r = L.row(x.productId), p = r?.p;
          const pr = p ? priceOf(v, p) : null;
          const canDrag = edit && !filtering;
          return (
            <tr key={x.productId} draggable={canDrag && arm === x.productId}
              className={(drag === x.productId ? 'me-dragging' : '') + (over === x.productId && drag && drag !== x.productId ? ' me-over' : '')}
              onDragStart={(e) => { setDrag(x.productId); e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', x.productId); }}
              onDragOver={(e) => { if (!drag) return; e.preventDefault(); if (over !== x.productId) setOver(x.productId); }}
              onDrop={(e) => { e.preventDefault(); move(drag, x.productId); setDrag(''); setOver(''); setArm(''); }}
              onDragEnd={() => { setDrag(''); setOver(''); setArm(''); }}>
              <td className="c">
                <span className={'me-handle' + (canDrag ? '' : ' is-off')} title={canDrag ? 'ドラッグで並べ替え' : filtering ? (sort ? '注文数・割合で並べ替え中は並び替えできません' : 'フィルタ中は並び替えできません') : ''}
                  onMouseDown={() => canDrag && setArm(x.productId)} onMouseUp={() => setArm('')} aria-hidden>≡</span>
              </td>
              <Td v={x.order} />
              <td><Photo p={p} /></td>
              <td className="es-mono">{x.productId}</td>
              <td className="w" title={p && mgmtNameOf(p) !== p.name ? `公開名：${p.name}` : undefined}>{p ? mgmtNameOf(p) : '（商品マスタにない）'}{p?.status === '削除済' ? <> <Badge tone="negative">削除済</Badge></> : p?.status === '無効' ? <> <Badge tone={edit ? 'negative' : undefined}>無効</Badge></> : null}</td>
              <td className="c"><Chk checked={x.publishable} disabled={lock} ariaLabel={(p?.name ?? '') + ' 公開可能'} onChange={(b) => set(x.productId, { publishable: b })} /></td>
              <Td v={p?.category} />
              <td className="c"><Chk checked={x.sample} disabled={lock} ariaLabel={(p?.name ?? '') + ' 営業サンプル'} onChange={(b) => set(x.productId, { sample: b })} /></td>
              <Td v={p ? courseL(p) : ''} />
              <Td v={r?.whNames.join('・')} />
              <td className="me-ell" title={r?.supplier}>{r?.supplier || '—'}</td>
              <td className="me-tagcell">
                {edit
                  ? <MultiDrop label={(p?.name ?? '') + ' 商品タグ'} value={x.tags} opts={tagOpts} ph="" addPh={`新しいタグ（${v.tags.length}/${PRODUCT_TAG_MAX}）`}
                    kind="商品タグ" addMax={PRODUCT_TAG_MAX} onChange={(t) => set(x.productId, { tags: t })} onAdd={onAddTag} onRemove={onRemoveTag} />
                  : <span className="od-badges">{x.tags.length ? x.tags.map((t) => <Badge key={t} tone={TAG_TONE[t]}>{t}</Badge>) : '—'}</span>}
              </td>
              <Td v={r?.short} />
              <td className="r">{pr ? <span title={pr.snap ? `公開したときの販売価格（税込）。商品マスタの今の価格は ${yen(pr.master)}` : '商品マスタの販売価格（税込）。公開したときにこの値を写します'}>
                {yen(pr.yen)}{pr.snap ? <small className="me-snap">公開時</small> : null}</span> : '—'}</td>
              <Td v={r ? yen(r.costYen) : ''} cls="r" />
              <Td v={fmtNum(recentOf(x.productId).qty) + '個'} cls="r" />
              <Td v={(Math.round(recentOf(x.productId).share * 1000) / 10).toFixed(1) + '%'} cls="r" />
              {BASE_KINDS.map((k) => baseCell(x, p, k))}
              <Td v={p?.vending.columns.join('・')} />
              {edit ? <td className="c"><Button variant="ghost" tone="negative" size="sm" icon="Trash" aria-label={(p?.name ?? x.productId) + 'を外す'} disabled={lockItems} onClick={() => onDelete(x.productId)} /></td> : null}
            </tr>
          );
        })}
      />
      <Pager all total={hit.length} page={cur} per={per} onPage={setPg} onPer={(n) => { setPer(n); setPg(1); }} />
    </>
  );
}

/* ================= 商品追加 ================= */

type AF = { kw: string; prev: string; cons: string; cat: string; course: string; sup: string };
const AF0: AF = { kw: '', prev: '', cons: '', cat: '', course: '', sup: '' };

export function AddProduct({ v, L, d, onClose, onAdd }: { v: View; L: Lookup; d: Draft; onClose: () => void; onAdd: (ids: string[]) => void }) {
  const [fd, setFd] = useState<AF>(AF0);
  const [f, setF] = useState<AF>(AF0);
  const [mode, setMode] = useState<'list' | 'grid'>('list');
  const [pg, setPg] = useState(1);
  const [per, setPer] = useState(10);
  const [sel, setSel] = useState<Record<string, boolean>>({});
  /* 状態「無効」の商品（スポット商品など）は既定で出さない（2026-10-05 台帳 F）。チェックで見える */
  const [showOff, setShowOff] = useState(false);
  const inMenu = new Set(d.items.map((x) => x.productId));
  const prevMonths = [...new Set(Object.values(v.prev).map((x) => x.prevMenu).filter(Boolean))].sort().reverse();
  const sups = [...new Set(v.products.map((x) => x.supplier).filter(Boolean))].sort();
  const list = v.products.filter(({ p, supplier }) => {
    if (p.status === '削除済') return false;
    if (p.status === '無効' && !showOff) return false;
    const pi = v.prev[p.id];
    if (f.kw && !p.name.includes(f.kw) && !mgmtNameOf(p).includes(f.kw) && !p.id.includes(f.kw)) return false;
    if (f.prev && (f.prev === 'なし' ? !!pi?.prevMenu : pi?.prevMenu !== f.prev)) return false;
    if (f.cons && (f.cons === 'あり') !== !!pi?.consecutive) return false;
    if (f.cat && p.category !== f.cat) return false;
    if (f.course && !p.courses.includes(f.course as Product['courses'][number])) return false;
    if (f.sup && supplier !== f.sup) return false;
    return true;
  });
  const pages = Math.max(1, Math.ceil(list.length / per)), cur = Math.min(pg, pages);
  const shown = list.slice((cur - 1) * per, cur * per);
  const ids = Object.keys(sel).filter((k) => sel[k] && !inMenu.has(k));
  const pick = (id: string, b: boolean) => setSel((s) => ({ ...s, [id]: b }));
  const search = () => { setF(fd); setPg(1); };

  return (
    <Dialog title="商品追加" width={1080} onClose={onClose} footerNote={`選択済み：${inMenu.size + ids.length}（追加選択：${ids.length}）`}
      footer={<div className="mo-row"><Button variant="outline" size="lg" onClick={onClose}>キャンセル</Button><Button size="lg" disabled={!ids.length} onClick={() => onAdd(ids)}>追加する</Button></div>}>
      <div className="me-afilter">
        <b>絞り込み条件</b>
        <div className="es-input es-input--md"><input placeholder="商品名" value={fd.kw} onChange={(e) => setFd({ ...fd, kw: e.target.value })} onKeyDown={(e) => { if (e.key === 'Enter') search(); }} /></div>
        <Sel aria-label="前回メニュー" value={fd.prev} onChange={(e) => setFd({ ...fd, prev: e.target.value })} options={[{ value: '', label: '前回メニュー' }, ...prevMonths.map((m) => ({ value: m, label: ymJa(m) })), { value: 'なし', label: 'なし（初めて）' }]} />
        <Sel aria-label="前回連続" value={fd.cons} onChange={(e) => setFd({ ...fd, cons: e.target.value })} options={[{ value: '', label: '前回連続' }, { value: 'あり', label: '前回連続あり（2回続けて）' }, { value: 'なし', label: '前回連続なし' }]} />
        <Sel aria-label="カテゴリー" value={fd.cat} onChange={(e) => setFd({ ...fd, cat: e.target.value })} options={[{ value: '', label: 'カテゴリー' }, ...v.cats]} />
        <Sel aria-label="コース" value={fd.course} onChange={(e) => setFd({ ...fd, course: e.target.value })} options={[{ value: '', label: 'コース' }, 'ライト', 'スタンダード']} />
        <Sel aria-label="仕入先" value={fd.sup} onChange={(e) => setFd({ ...fd, sup: e.target.value })} options={[{ value: '', label: '仕入れ先' }, ...sups]} />
        <label className="mo-row"><Chk checked={showOff} ariaLabel="無効も表示" onChange={(b) => { setShowOff(b); setPg(1); }} />無効も表示</label>
        <div className="mo-row"><Button variant="outline" onClick={() => { setFd(AF0); setF(AF0); setPg(1); }}>クリア</Button><Button onClick={search}>検索</Button></div>
      </div>
      <div className="me-ahead">
        <b>商品一覧（{list.length}）</b>
        <div className="me-seg" role="group" aria-label="表示の切り替え">
          <button type="button" className={mode === 'list' ? 'on' : ''} aria-pressed={mode === 'list'} aria-label="リスト" onClick={() => setMode('list')}>
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" /></svg>
          </button>
          <button type="button" className={mode === 'grid' ? 'on' : ''} aria-pressed={mode === 'grid'} aria-label="グリッド" onClick={() => setMode('grid')}>
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden><rect x="3" y="3" width="8" height="8" rx="1.5" fill="currentColor" /><rect x="13" y="3" width="8" height="8" rx="1.5" fill="currentColor" /><rect x="3" y="13" width="8" height="8" rx="1.5" fill="currentColor" /><rect x="13" y="13" width="8" height="8" rx="1.5" fill="currentColor" /></svg>
          </button>
        </div>
      </div>
      {!list.length ? <EmptyState title="表示するデータがありません。" compact /> : mode === 'list' ? (
        <Table cls="me-atbl" cols={[{ label: '選択', w: 56 }, { label: '商品名' }, { label: '継続', cls: 'c', w: 56 }, { label: '前回メニュー' }, { label: 'カテゴリ' }, { label: 'コース' }, { label: '仕入先' }, { label: '仕入価格（税抜）', cls: 'r' }, { label: '販売価格（税込）', cls: 'r' }]}
          rows={shown.map(({ p, supplier, costYen }) => {
            const on = inMenu.has(p.id) || !!sel[p.id], pi = v.prev[p.id];
            return (
              <tr key={p.id} className={inMenu.has(p.id) ? 'is-deleted' : undefined}>
                <td><Chk checked={on} disabled={inMenu.has(p.id)} ariaLabel={p.name} onChange={(b) => pick(p.id, b)} /></td>
                <td className="w"><a href="#" className="od-link" onClick={(e) => { e.preventDefault(); if (!inMenu.has(p.id)) pick(p.id, !sel[p.id]); }}>{mgmtNameOf(p)}</a>{p.status === '無効' ? <> <Badge>無効</Badge></> : null}<div className="od-small es-mono">{p.id}{inMenu.has(p.id) ? '・メニューに登録済' : ''}</div></td>
                <td className="c" title={pi?.consecutive ? '前月と前々月の両方に入っていた（前回連続）' : ''}>{pi?.consecutive ? '＊' : ''}</td>
                <Td v={pi?.prevMenu ? ymJa(pi.prevMenu) : ''} />
                <Td v={p.category} />
                <Td v={courseL(p)} />
                <Td v={supplier} />
                <Td v={yen(costYen)} cls="r" />
                <Td v={yen(p.priceYen)} cls="r" />
              </tr>
            );
          })} />
      ) : (
        <div className="me-grid">
          {shown.map(({ p, supplier }) => {
            const on = inMenu.has(p.id) || !!sel[p.id];
            return (
              <label key={p.id} className={'me-gcard' + (on ? ' on' : '') + (inMenu.has(p.id) ? ' dis' : '')} title={inMenu.has(p.id) ? 'メニューに登録済' : p.name}>
                <span className="me-gchk"><input type="checkbox" checked={on} disabled={inMenu.has(p.id)} onChange={(e) => pick(p.id, e.target.checked)} aria-label={p.name} /></span>
                <Photo p={p} big />
                <span className="me-gname">{mgmtNameOf(p)}</span>
                <span className="me-gsup">{supplier || '—'}</span>
              </label>
            );
          })}
        </div>
      )}
      <Pager total={list.length} page={cur} per={per} onPage={setPg} onPer={(n) => { setPer(n); setPg(1); }} />
      <p className="mo-note">＊（継続）＝前月と前々月の両方のメニューに入っていた商品。前回メニュー＝この月より前で、いちばん新しく入っていた月。</p>
    </Dialog>
  );
}

/* ================= メニューPDF ================= */

const mb = (n: number) => (n / 1024 / 1024).toFixed(2) + 'MB';

export function PdfDialog({ pdfs, edit, onClose, onApply }: { pdfs: MenuPdf[]; edit: boolean; onClose: () => void; onApply: (pdfs: MenuPdf[]) => void }) {
  const [list, setList] = useState<MenuPdf[]>(pdfs);
  const [err, setErr] = useState('');
  const [over, setOver] = useState(false);
  const ref = useRef<HTMLInputElement>(null);
  const take = (files: FileList | null) => {
    if (!files?.length) return;
    const fs = Array.from(files), bad = fs.filter((x) => !/\.pdf$/i.test(x.name) || (x.type && x.type !== 'application/pdf'));
    /* 1ファイル 5MB 以下（RD-MN-030） */
    const big = fs.filter((x) => !bad.includes(x) && x.size > MENU_PDF_MAX);
    bad.push(...big);
    setErr([fs.some((x) => bad.includes(x) && !big.includes(x)) ? `PDFファイルのみアップロードできます（${bad.filter((x) => !big.includes(x)).map((x) => x.name).join('・')}）` : '',
      big.length ? `5MB を超えるファイルはアップロードできません（${big.map((x) => x.name).join('・')}）` : ''].filter(Boolean).join('／'));
    /* 種別（ライト用／スタンダード用）：ファイル名から推せれば入れる。わからなければ表で選ぶ（選ぶまでアップロードできない） */
    const guess = (name: string): MenuPdfKind | '' => (/ライト|lite|light/i.test(name) ? 'ライト用' : /スタンダード|standard|std/i.test(name) ? 'スタンダード用' : '');
    const ok = fs.filter((x) => !bad.includes(x)).map((x) => ({ name: x.name, size: x.size, uploadedAt: new Date().toLocaleString('sv-SE').slice(0, 16).replace(/-/g, '/'), kind: guess(x.name) as MenuPdfKind }));
    setList((l) => [...l.filter((x) => !ok.some((y) => y.name === x.name)), ...ok]);
  };
  const setKind = (name: string, kind: MenuPdfKind) => setList((l) => l.map((x) => (x.name === name ? { ...x, kind } : x)));
  const noKind = list.some((x) => !MENU_PDF_KINDS.includes(x.kind));
  const changed = JSON.stringify(list) !== JSON.stringify(pdfs);
  return (
    <Dialog title="メニューPDF" width={900} onClose={onClose} footerNote="※PDFファイルのみ（1ファイル 5MB 以下）アップロード可能です。"
      footer={<div className="mo-row"><Button variant="outline" size="lg" onClick={onClose}>{edit ? 'キャンセル' : '閉じる'}</Button>{edit ? <Button size="lg" disabled={!changed || noKind} onClick={() => onApply(list)}>アップロード</Button> : null}</div>}>
      {edit ? (
        <div className={'me-drop' + (over ? ' over' : '')} onDragOver={(e) => { e.preventDefault(); setOver(true); }} onDragLeave={() => setOver(false)}
          onDrop={(e) => { e.preventDefault(); setOver(false); take(e.dataTransfer.files); }}>
          <span className="me-drop__ic"><Icon name="UploadTray" size={28} /></span>
          <div><a href="#" className="od-link" onClick={(e) => { e.preventDefault(); ref.current?.click(); }}>ファイル選択</a><div>またはファイルをドラッグ＆ドロップ</div></div>
          <input ref={ref} type="file" accept="application/pdf,.pdf" multiple hidden onChange={(e) => { take(e.target.files); e.target.value = ''; }} />
        </div>
      ) : null}
      {err ? <div className="me-err" role="alert">{err}</div> : null}
      {edit && noKind ? <div className="me-err" role="alert">種別（ライト用／スタンダード用）を選んでください</div> : null}
      {edit && !noKind && list.length ? <p className="mo-note">公開の条件：PDF が1つ以上（ライト用・スタンダード用のどちらでもよい）。ライトのお客様にはライト用だけ表示します。</p> : null}
      <Table cols={[{ label: 'No', w: 56 }, { label: 'ファイル名' }, { label: '種別', w: 224 }, { label: '容量', w: 160 }, ...(edit ? [{ label: '操作', w: 72, cls: 'c' }] : [])]}
        rows={list.map((x, i) => (
          <tr key={x.name}>
            <Td v={i + 1} />
            <td><span className="od-link">{x.name}</span>{x.uploadedAt ? <div className="od-small">{fmtDateTime(x.uploadedAt)}</div> : null}</td>
            <td>{edit
              ? <Sel aria-label={x.name + ' の種別'} value={x.kind ?? ''} onChange={(e) => setKind(x.name, e.target.value as MenuPdfKind)} options={[{ value: '', label: '種別を選択' }, ...MENU_PDF_KINDS]} />
              : <Badge>{x.kind}</Badge>}</td>
            <Td v={mb(x.size)} />
            {edit ? <td className="c"><Button variant="ghost" tone="negative" size="sm" icon="Trash" aria-label={x.name + 'を外す'} onClick={() => setList((l) => l.filter((y) => y.name !== x.name))} /></td> : null}
          </tr>
        ))} />
      <p className="mo-note">法人Web に出すメニューPDF です（公開の条件の1つ）。メニューは1ヶ月に1つで、PDF だけ分けます：ESスタンダードのお客様には2つとも、ESライトのお客様にはライト用（冷蔵のみ）だけを出します（スタンダード用は1ページ目 冷蔵・2ページ目 冷凍。ライトのお客様にスタンダード用は見せません）。デモではファイル名と容量だけを保存します（ファイルの中身は本番でストレージに置きます）。「アップロード」のあと、画面の「保存」で確定します。</p>
    </Dialog>
  );
}

/* CSV取込は共通の仕組み（components/csv・lib/csv/data.ts の menu。MenuDetail の「CSV取込」から開く） */

/* ================= 指標一覧 ================= */

type StatRow = { x: MenuItem; p: Product; r: NonNullable<ReturnType<Lookup['row']>> };
/**
 * 倉庫ごとの統計（2026-10-05 決定・台帳 F「メニューの統計のタブ」：「全体」は置かず倉庫ごとだけ。
 * 標準数の合計（50）と平均仕入単価（目標の幅）の確認も倉庫ごとに行い、ずれた倉庫のタブに警告を出す）
 */
function whStat(v: View, L: Lookup, d: Draft, whId: string) {
  const items = d.items.filter((x) => L.prod(x.productId)?.pickWarehouseIds.includes(whId));
  const ps = items.map((x) => ({ x, p: L.prod(x.productId), r: L.row(x.productId) })).filter((y): y is StatRow => !!y.p && !!y.r);
  const sums = Object.fromEntries(BASE_KINDS.map((k) => [k, ps.reduce((a, y) => a + y.x.base[k], 0)])) as Record<MenuBaseKind, number>;
  const has = (k: MenuBaseKind) => ps.some((y) => baseEligible(k, y.p));
  const wavg = (f: (y: StatRow) => number, k: MenuBaseKind) => { const n = ps.reduce((a, y) => a + y.x.base[k], 0); return n ? Math.round(ps.reduce((a, y) => a + f(y) * y.x.base[k], 0) / n) : 0; };
  /* 合計が 50 でない種類（対象の商品があるとき） */
  const badSum = BASE_KINDS.filter((k) => has(k) && sums[k] !== BASE_TOTAL);
  /* 平均仕入単価（税抜・標準数の加重平均）：std・ns は冷蔵庫の目標、vm は自販機の目標 */
  const T = d.avgTarget;
  const avgCost = { std: wavg((y) => y.r.costYen, 'std'), ns: wavg((y) => y.r.costYen, 'ns'), vm: wavg((y) => y.r.costYen, 'vm') };
  const tgt: Record<MenuBaseKind, { min: number; max: number }> = { std: T.fr, ns: T.fr, vm: T.vm };
  const badAvg = BASE_KINDS.filter((k) => has(k) && sums[k] > 0 && (avgCost[k] < tgt[k].min || avgCost[k] > tgt[k].max));
  const warns = [
    ...badSum.map((k) => `${BASE_LABEL[k]}の合計が ${sums[k]} です（${BASE_TOTAL} にしてください）`),
    ...badAvg.map((k) => `${BASE_LABEL[k]}の平均仕入単価 ${yen(avgCost[k])} が目標（${tgt[k].min}〜${tgt[k].max}円）の外です`),
  ];
  return { ps, sums, has, wavg, avgCost, tgt, badSum, badAvg, warns };
}

export function Stats({ v, L, d, onClose }: { v: View; L: Lookup; d: Draft; onClose: () => void }) {
  const used = v.warehouses.filter((w) => d.items.some((x) => L.prod(x.productId)?.pickWarehouseIds.includes(w.id)));
  /* 「全体」のタブは置かない。最初のタブ＝最初の倉庫（2026-10-05 決定） */
  const [tab0, setTab] = useState(used[0]?.id ?? '');
  const tab = used.some((w) => w.id === tab0) ? tab0 : used[0]?.id ?? '';
  const S = whStat(v, L, d, tab);
  const { ps, sums, wavg, avgCost, tgt } = S;
  const price = (y: StatRow) => priceOf(v, y.p).yen;
  const avg = (f: (y: (typeof ps)[number]) => number) => (ps.length ? Math.round(ps.reduce((a, y) => a + f(y), 0) / ps.length) : 0);
  const group = (key: (y: (typeof ps)[number]) => string[], order?: string[]) => {
    const m = new Map<string, { n: number; std: number }>();
    ps.forEach((y) => key(y).forEach((k) => { const c = m.get(k) ?? { n: 0, std: 0 }; c.n++; c.std += y.x.base.std; m.set(k, c); }));
    const ks = [...m.keys()].sort((a, b) => (order ? (order.indexOf(a) + 1 || 999) - (order.indexOf(b) + 1 || 999) : 0) || a.localeCompare(b));
    return ks.map((k) => ({ k, ...m.get(k)! }));
  };
  const band = (y: (typeof ps)[number]) => { const b = Math.floor(price(y) / 50) * 50; return [`${b}〜${b + 49}円`]; };
  const bands = group(band).sort((a, b) => parseInt(a.k) - parseInt(b.k));
  const rd = readiness(v, L, d);
  const pub = ps.filter((y) => y.x.publishable).length, img = ps.filter((y) => y.p.images.some((i) => i.main)).length;
  /* 注文合計（金額・税込）・注文数合計・短消費期限数（RD-MN-057） */
  const oq = (y: (typeof ps)[number]) => v.orderQty[y.p.id] ?? 0;
  const orderSum = ps.reduce((a, y) => a + oq(y) * price(y), 0), orderQtySum = ps.reduce((a, y) => a + oq(y), 0);
  const shortN = ps.filter((y) => !!y.r.short).length;
  const share = (n: number, all: number) => (all ? Math.round((n / all) * 100) + '%' : '—');
  const gTable = (title: string, rows: { k: string; n: number; std: number }[]) => (
    <section className="me-stat">
      <h3>{title}</h3>
      <Table cols={[{ label: '' }, { label: '品数', cls: 'r' }, { label: '基準注文数', cls: 'r' }, { label: '割合', cls: 'r' }]}
        rows={rows.map((r) => <tr key={r.k}><Td v={r.k} /><Td v={r.n + '品'} cls="r" /><Td v={r.std} cls="r" /><Td v={share(r.std, sums.std)} cls="r" /></tr>)} />
    </section>
  );
  return (
    <Dialog title="指標一覧" width={1100} onClose={onClose} footer={<Button variant="outline" size="lg" onClick={onClose}>閉じる</Button>}>
      <div className="es-tabs me-wtabs" role="tablist">
        {used.map((w) => {
          const warn = whStat(v, L, d, w.id).warns;
          return (
            <button key={w.id} type="button" role="tab" aria-selected={tab === w.id} className={'es-tab' + (tab === w.id ? ' is-active' : '')} onClick={() => setTab(w.id)}>
              {w.name}{warn.length ? <span className="mo-ng" title={warn.join('／')} aria-label="要確認">　！</span> : null}
            </button>
          );
        })}
      </div>
      {!used.length ? <EmptyState title="商品がありません" compact>商品を追加すると、ピッキング倉庫ごとの統計が出ます。</EmptyState> : null}
      <p className="mo-note">{`ピッキング倉庫が ${used.find((w) => w.id === tab)?.name ?? '—'} の商品だけ（${ps.length}品）。その倉庫の便の拠点が選べる商品です。`}基準注文数は 50プランの代表値（ライト・スタンダード／短消費期限なし／ライト（自販機））。合計（{BASE_TOTAL}）と平均仕入単価の目標は倉庫ごとに確かめます（ずれた倉庫のタブに「！」）。</p>
      {S.warns.length ? <div className="me-err" role="alert">{S.warns.map((m) => <div key={m}>{m}</div>)}</div> : null}
      <div className="me-stats">
        <section className="me-stat">
          <h3>基準注文数合計</h3>
          <div className="me-kv">{BASE_KINDS.map((k) => <div key={k} className={S.badSum.includes(k) ? 'ng' : ''}><span>{BASE_LABEL[k]}</span><b>{sums[k]} / {BASE_TOTAL}</b></div>)}</div>
        </section>
        <section className="me-stat">
          <h3>平均単価</h3>
          <div className="me-kv">
            <div className={S.badAvg.includes('std') ? 'ng' : ''}><span>平均仕入単価（税抜・基準注文数の加重平均）目標 {tgt.std.min}〜{tgt.std.max}円</span><b>{yen(avgCost.std)}</b></div>
            <div className={S.badAvg.includes('ns') ? 'ng' : ''}><span>短消費期限なし（税抜・加重平均）目標 {tgt.ns.min}〜{tgt.ns.max}円</span><b>{yen(avgCost.ns)}</b></div>
            <div className={S.badAvg.includes('vm') ? 'ng' : ''}><span>自販機（税抜・自販機基準注文数の加重平均）目標 {tgt.vm.min}〜{tgt.vm.max}円</span><b>{yen(avgCost.vm)}</b></div>
            <div><span>販売価格（税込・基準注文数の加重平均）</span><b>{yen(wavg(price, 'std'))}</b></div>
            <div><span>販売価格（税込・商品の単純平均）</span><b>{yen(avg(price))}</b></div>
          </div>
        </section>
        <section className="me-stat">
          <h3>注文</h3>
          <div className="me-kv">
            <div><span>注文合計（販売価格・税込）</span><b>{yen(orderSum)}</b></div>
            <div><span>注文数合計</span><b>{fmtNum(orderQtySum)}個</b></div>
            <div><span>注文した拠点（デフォルト注文を含む）</span><b>{v.orderN}件</b></div>
            <div><span>短消費期限数（ショート・セミショートの商品）</span><b>{shortN}品</b></div>
          </div>
        </section>
        <section className="me-stat">
          <h3>公開状況</h3>
          <div className="me-kv">
            <div><span>法人向け公開ステータス</span><b>{d.corpPublish}{d.corpPublish === '自動公開' ? ' ' + fmtDate(d.publishOn) : ''}</b></div>
            <div className={pub < ps.length ? 'ng' : ''}><span>公開可能</span><b>{pub} / {ps.length}品</b></div>
            <div className={img < ps.length ? 'ng' : ''}><span>メイン画像あり</span><b>{img} / {ps.length}品</b></div>
            <div className={d.pdfs.length ? '' : 'ng'}><span>メニューPDF</span><b>{d.pdfs.length ? d.pdfs.length + '件' : 'なし'}</b></div>
            <div className={v.kari?.status === '承認' ? '' : 'ng'}><span>仮発注</span><b>{v.kari?.status ?? '未承認'}</b></div>
            <div className={rd.ready ? '' : 'ng'}><span>公開の条件</span><b>{rd.ready ? 'そろっている' : `足りない（${rd.missing.length}）`}</b></div>
          </div>
        </section>
        {gTable('コース別', group((y) => (y.p.courses.length ? y.p.courses : ['（なし）'])))}
        {gTable('価格帯（販売価格）', bands)}
        {gTable('カテゴリ別', group((y) => [y.p.category], v.cats))}
        {gTable('注目・タグ', [
          ...group((y) => y.x.tags),
          { k: '営業サンプル', n: ps.filter((y) => y.x.sample).length, std: ps.filter((y) => y.x.sample).reduce((a, y) => a + y.x.base.std, 0) },
          { k: '前回連続（継続）', n: ps.filter((y) => v.prev[y.p.id]?.consecutive).length, std: ps.filter((y) => v.prev[y.p.id]?.consecutive).reduce((a, y) => a + y.x.base.std, 0) },
          { k: '初めての商品', n: ps.filter((y) => !v.prev[y.p.id]?.prevMenu).length, std: ps.filter((y) => !v.prev[y.p.id]?.prevMenu).reduce((a, y) => a + y.x.base.std, 0) },
        ])}
      </div>
    </Dialog>
  );
}

/* 新しい商品（商品タグは空から。タグはメニューの商品ごと：台帳 F 2026-10-08）を足して提案し直す */
export const addItems = (L: Lookup, d: Draft, ids: string[]) =>
  L.recalc([...d.items, ...ids.map((id, i) => newItem(id, d.items.length + i + 1))], d.avgTarget, !d.noAdjust).items;
