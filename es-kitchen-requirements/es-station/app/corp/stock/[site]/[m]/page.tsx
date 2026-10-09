'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import corpDocs from '@/lib/corp/areas/corp-docs';
import { janInput, sheetEmpty, skPaused, STOCK_FILED, STOCK_IDS, STOCK_MAX, STOCK_PROD, STOCK_WAY, stockCands, stockInput, stockMonths, stockStat, wayAt, yenS } from '@/lib/corp/docs/logic';
import type { StockItem, StockMonth, StockProduct, StockRec, WhoCand } from '@/lib/corp/docs/types';
import { areaApi, useQuery } from '@/lib/ops/core/client';
import { useOpsLeaveGuard } from '@/lib/ui/leaveGuard';
import { fmtDatesIn, fmtYm } from '@/lib/format/date';
import { CorpCsvExport } from '../../../_ui/csv';
import { useCorpSignedIn } from '../../../_ui/CorpProvider';
import { Badge, Breadcrumb, Button, Card, Dialog, DocsPage, Inline, LoadError, LoadingState, RoBadge, RoText, Sel, Table, Td, useWho } from '../../../_docs/ds';

const api = areaApi(corpDocs);
const monthLabel = (m: string) => fmtYm(m);
const TEMP: Record<string, string> = { 冷蔵: '冷蔵', 冷凍: '冷凍', 常温: '常温' };

/** 報告の確認（No.10）：拠点・月度・報告する商品の件数と報告した方（既定＝この拠点のメイン担当者） */
type FileRow = { productId: string; actual: number; disposed: number; arrived: number };
type FileModal = { site: string; siteName: string; M: StockMonth; rows: FileRow[]; who: string; whoErr: boolean; cands: WhoCand[] };
type K = 'n' | 'd' | 'a';
type BarcodeDetectorLike = { detect: (v: HTMLVideoElement) => Promise<{ rawValue: string }[]> };

/**
 * 棚卸報告（CW_STOCK_001・版 1.1）。棚卸一覧（/corp/stock）の行から開く：/corp/stock/<拠点ID>/<月度 YYYY-MM>。
 * 選んだ拠点・月度の報告だけを出す（「拠点ごとの状況」は棚卸一覧へ移した）。拠点・月度のプルダウンで一覧へ戻らずに切り替えられる。
 * 締め日（20日）の在庫を数えて20日までに報告する。COOL便など法人が棚卸する拠点は、ここで企業担当者が報告する。
 * ES配送便の拠点はドライバーがアプリで報告する。21日以降はESキッチンが追加・修正。
 * 報告すると運営Web の「請求 ＞ 在庫管理・実績精算」（billing.br の棚卸申告値）に反映する。
 */
export default function StockReportPage() {
  const { site: pSite, m: pM } = useParams<{ site: string; m: string }>();
  const router = useRouter();
  const { toast, toastError } = useCorpSignedIn();
  const who = useWho();
  const { data, error, reload } = useQuery(api, 'stock', { who });
  const [skin, setSkin] = useState<Record<string, string>>({});
  const [skErr, setSkErr] = useState(false);
  const [redo, setRedo] = useState<string | null>(null);
  /* 「商品を追加」で足した行（拠点|月度 → 行）。入力中の数と一緒にブラウザに残す（再読み込みで消える） */
  const [added, setAdded] = useState<Record<string, StockItem[]>>({});
  const [modal, setModal] = useState<FileModal | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  /* 入力した棚卸の数を残したまま、サイドメニューで離れるときの確認（Q02） */
  useOpsLeaveGuard(() => Object.values(skin).some((v) => String(v).trim() !== ''));

  const list = data?.sites ?? [];
  const sid = list.some((x) => x.id === pSite) ? pSite : list[0]?.id ?? '';
  /* 月度：今回＋過去3か月（台帳 E 2026-10-05・今日から決める） */
  const MONTHS = stockMonths();
  const M = MONTHS.find((x) => x.m === pM) ?? MONTHS[0];
  /* URL の拠点・月度が見られないものなら、見られる先頭の拠点・今回の月度に直す */
  useEffect(() => { if (data && sid && (sid !== pSite || M.m !== pM)) router.replace(`/corp/stock/${sid}/${M.m}`); }, [data, sid, M.m, pSite, pM, router]);
  if (error && !data) return <DocsPage className="cb-stockpg"><LoadError onRetry={() => reload()} onBack={() => router.push('/corp/stock')} backLabel="棚卸一覧へ戻る" /></DocsPage>;
  if (!data) return <DocsPage className="cb-stockpg"><LoadingState /></DocsPage>;
  if (!list.length) return <DocsPage className="cb-stockpg">{null}</DocsPage>;

  const s = list.find((x) => x.id === sid)!;
  const cfgOf = (id: string) => data.cfg.find((c) => c.id === id);
  const recOf = (id: string, m: string): StockRec | null => data.recs.find((r) => r.site === id && r.m === m) ?? null;
  const cfg = cfgOf(sid) ?? { id: sid, way: 'none' as const };
  const cur = recOf(sid, M.m), prev = recOf(sid, M.prev);
  const PM = MONTHS.find((x) => x.m === M.prev), prevLabel = PM ? PM.label : fmtYm(M.prev);
  const way = wayAt(cfg, M.m), paused = skPaused(cfg, M.m), wayK = paused ? 'paused' : way, isRedo = redo === sid + '|' + M.m;
  const noCheck = cfg.way === 'none' || cfg.way === 'nocheck';
  /* 休止中は棚卸報告なし（TL-2）。ES配送便の拠点（ドライバーが報告する拠点）も法人・拠点が報告できる（台帳 E 2026-10-05 B-21） */
  const checks = way === 'corp' || way === 'driver';
  const beforeStart = !!(cfg.from && M.m < cfg.from);
  const canIn = checks && !paused && !beforeStart && !!M.open && (!cur || isRedo);
  /* 休止中・ご契約前の月度は報告する表も棚卸用の表（PDF）もない */
  const noSheet = noCheck || paused || beforeStart;
  /* 報告の方法＝最後に報告した方（企業担当者／ES配送便ドライバー）。まだなければ拠点の決まり */
  const wayText = cur ? (cur.who === 'ES配送便ドライバー' ? STOCK_WAY.driver : STOCK_WAY.corp) : paused ? STOCK_WAY.paused : way === 'driver' ? STOCK_WAY.both : STOCK_WAY[wayK];
  /* 棚卸する商品：この拠点に関係する商品だけ（前回の棚卸にある・この締めで届けた・お届け中・廃棄する。課題 4-6）＋「商品を追加」で足した行 */
  const sheet = data.sheets.find((x) => x.site === sid && x.m === M.m);
  const nameOf = (id: string) => STOCK_PROD[STOCK_IDS.indexOf(id)] ?? data.products.find((p) => p.id === id)?.name ?? id;
  const enOf = (id: string) => data.products.find((p) => p.id === id)?.nameEn;
  const key = `${sid}|${M.m}`;
  const extra = added[key] ?? [];
  const base: StockItem[] = canIn && sheet ? sheet.items
    : (cur?.ids ?? (cur ? STOCK_IDS.filter((_, i) => cur.n[i] > 0) : sheet?.items.map((x) => x.id) ?? [])).map((id) => sheet?.items.find((x) => x.id === id) ?? { id, name: nameOf(id), prev: 0, delivered: 0, inTransit: 0, toDispose: 0 });
  const items: StockItem[] = canIn ? base.concat(extra) : base;
  const inKey = (id: string, k: K) => `${sid}|${M.m}|${id}|${k}`;
  const setIn = (id: string, k: K, v: string) => { setSkin((o) => ({ ...o, [inKey(id, k)]: stockInput(v) })); };
  /** 項目の下のエラー：未入力（E01・今ある数だけ必須）／上限 999,999 超え（E12・切り詰めない） */
  const fname = (k: K) => (k === 'n' ? '今ある数' : k === 'd' ? '捨てた数' : '届いた数');
  const fieldErr = (id: string, k: K) => { const v = skin[inKey(id, k)]; if (v && Number(v) > STOCK_MAX) return `${fname(k)}は0〜999,999の範囲でご入力ください。`; if (k === 'n' && skErr && !v) return `${fname(k)}をご入力ください。`; return ''; };
  const errId = (id: string, k: K) => `sk-err-${id}-${k}`;
  /** 最初のエラー欄へ画面を動かして焦点を移す */
  const focusFirstErr = () => setTimeout(() => { const el = document.querySelector<HTMLInputElement>('table.sk-in input[aria-invalid="true"]'); el?.scrollIntoView({ block: 'center', behavior: 'smooth' }); el?.focus({ preventScroll: true }); }, 0);
  const st = stockStat(cfg, M, cur, sheetEmpty(sheet?.items));
  const valOf = (rec: StockRec | null, id: string, k: K) => { const i = STOCK_IDS.indexOf(id); const arr = rec?.[k]; return rec && arr && i >= 0 ? arr[i] : null; };
  /* E321（届いた数＞お届け中）・E327（今ある数＋捨てた数＞前回の数＋届けた数。サーバーと同じ式。「商品を追加」の行は E327 の対象外：サーバーと同じ）。入力が済んだ行だけ見る */
  const rowErr = (x: StockItem): { code: 'E321' | 'E327'; text: string } | null => {
    const n = skin[inKey(x.id, 'n')], d = Number(skin[inKey(x.id, 'd')] || 0), a = Number(skin[inKey(x.id, 'a')] || 0);
    if (a > x.inTransit) return { code: 'E321', text: '届いた数はお届け中の数までの数でご入力ください。' };
    if (!x.added && n && Number(n) + d > x.prev + x.delivered + a) return { code: 'E327', text: '今ある数と捨てた数の合計が、前回の数と届いた数の合計を超えています。' };
    return null;
  };
  const clearIn = () => { const o = { ...skin }; Object.keys(o).filter((k) => k.startsWith(`${sid}|${M.m}|`)).forEach((k) => { delete o[k]; }); setSkin(o); setSkErr(false); };
  /* 数え直して報告し直す：今の報告（ドライバーの報告も）の数を初期値に入れて、直せるようにする */
  function startRedo() {
    if (cur && sheet) {
      const o = { ...skin };
      for (const x of sheet.items) for (const k of ['n', 'd', 'a'] as K[]) { const v = valOf(cur, x.id, k); if (v != null && !(k === 'a' && !x.inTransit)) o[`${sid}|${M.m}|${x.id}|${k}`] = String(v); }
      setSkin(o);
    }
    setRedo(sid + '|' + M.m);
  }
  const go = (site: string, m: string) => { setSkErr(false); setRedo(null); router.replace(`/corp/stock/${site}/${m}`); };

  /** 報告する：入力をまとめて確かめ（E323・E320・E321）、問題がなければ確認モーダル（No.10） */
  function file() {
    if (!items.length) { toast('この月度に報告する商品がないため、報告できません。'); return; }
    if (items.some((x) => !skin[inKey(x.id, 'n')])) { setSkErr(true); toast('すべての商品の今ある数をご入力ください（ない商品は 0）。'); focusFirstErr(); return; }
    if (items.some((x) => (['n', 'd', 'a'] as K[]).some((k) => Number(skin[inKey(x.id, k)] || 0) > STOCK_MAX))) { setSkErr(true); focusFirstErr(); return; }
    if (items.some((x) => Number(skin[inKey(x.id, 'a')] || 0) > x.inTransit)) { setSkErr(true); toast('届いた数はお届け中の数までの数でご入力ください。'); return; }
    const bad = items.find((x) => rowErr(x)?.code === 'E327');
    if (bad) { setSkErr(true); toast(`${bad.name}の今ある数と捨てた数の合計が、前回の数と届いた数の合計を超えています。`); return; }
    const rows: FileRow[] = items.map((x) => ({ productId: x.id, actual: Number(skin[inKey(x.id, 'n')]), disposed: Number(skin[inKey(x.id, 'd')] || 0), arrived: Number(skin[inKey(x.id, 'a')] || 0) }));
    const cands = data!.cands[sid] ?? [];
    /* 報告した方の既定＝この拠点のメイン担当者（hong 2026-10-05 版1.0レビュー ③） */
    setModal({ site: sid, siteName: s.name, M, rows, who: cands.find((c) => c.main)?.value ?? '', whoErr: false, cands });
  }
  async function doFile(mo: FileModal) {
    if (!mo.who) { setModal({ ...mo, whoErr: true }); return; }
    setBusy(true);
    try {
      await api.action('fileStock', { who, site: mo.site, m: mo.M.m, rows: mo.rows, by: mo.who });
      setModal(null);
      setRedo(null);
      const o = { ...skin }; Object.keys(o).filter((k) => k.startsWith(`${mo.site}|${mo.M.m}|`)).forEach((k) => { delete o[k]; }); setSkin(o);
      setAdded((a) => { const n = { ...a }; delete n[`${mo.site}|${mo.M.m}`]; return n; });
      toast('棚卸を報告しました。ESキッチンの在庫管理に反映します。');
    } catch (e) {
      toastError(e);
    } finally {
      setBusy(false);
    }
  }
  /** 「商品を追加」：表の最後に前回の数 0 の行を足し（No.42）、その行の今ある数まで画面を動かす */
  function addProduct(p: StockProduct) {
    if (items.some((x) => x.id === p.id)) { toast(`${p.name}はすでに表にあります。`); return; }
    setAdded((a) => ({ ...a, [key]: [...(a[key] ?? []), { id: p.id, name: p.name, prev: 0, delivered: 0, inTransit: 0, toDispose: 0, added: true }] }));
    setAddOpen(false);
    toast(`${p.name}を表に追加しました。`);
    setTimeout(() => { const el = document.querySelector<HTMLInputElement>(`table.sk-in input[aria-label="${p.name} の今ある数"]`); el?.scrollIntoView({ block: 'center', behavior: 'smooth' }); el?.focus(); }, 80);
  }
  const removeAdded = (id: string) => {
    setAdded((a) => ({ ...a, [key]: (a[key] ?? []).filter((x) => x.id !== id) }));
    const o = { ...skin }; (['n', 'd', 'a'] as K[]).forEach((k) => { delete o[inKey(id, k)]; }); setSkin(o);
  };
  /** 棚卸用の表（PDF・No.1.4・No.40）：ブラウザの印刷（A4 縦）。ファイル名は 棚卸用の表_<拠点ID>_<yyyymm>.pdf */
  function printSheet() {
    const w = window.open('', '_blank');
    if (!w) { toast('印刷の画面を開けませんでした。ブラウザのポップアップの設定をご確認ください。'); return; }
    const esc = (v: string) => String(v).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c] as string));
    const fname = `棚卸用の表_${sid}_${M.m.replace('-', '')}`;
    const now = new Date(), stamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const tr = (i: number, name: string, pv: string, arrive: boolean, en = '') =>
      `<tr><td class="c">${i}</td><td>${esc(name)}${en ? `<div class="en">${esc(en)}</div>` : ''}</td><td class="r">${esc(pv)}</td><td></td><td></td><td class="${arrive ? '' : 'x'}"></td></tr>`;
    const body = items.map((x, i) => { const pv = prev ? valOf(prev, x.id, 'n') : null; return tr(i + 1, x.name, pv == null ? (x.prev ? String(x.prev) : '—') : String(pv), x.inTransit > 0, x.nameEn ?? enOf(x.id) ?? ''); })
      .concat([1, 2, 3].map((k) => tr(items.length + k, '', '', false))).join('');
    w.document.write(`<!doctype html><html lang="ja"><head><meta charset="utf-8"><title>${esc(fname)}</title>
<style>@page{size:A4 portrait;margin:14mm 12mm}body{font-family:"Hiragino Sans","Noto Sans JP","Yu Gothic",sans-serif;color:#111;font-size:11pt;margin:0}
h1{font-size:16pt;margin:0 0 6pt}.meta{display:grid;grid-template-columns:auto 1fr auto 1fr;gap:2pt 10pt;font-size:10pt;margin:0 0 8pt}.meta b{font-weight:600;color:#444}
table{width:100%;border-collapse:collapse;page-break-inside:auto}thead{display:table-header-group}tr{page-break-inside:avoid}th,td{border:1px solid #333;padding:6pt 5pt;height:22pt;vertical-align:middle}
th{background:#eee;font-size:10pt;font-weight:700}td.c,th.c{text-align:center}td.r{text-align:right}td.x{background:repeating-linear-gradient(135deg,#fff 0 4pt,#bbb 4pt 5pt)}
.en{font-size:8pt;color:#555;font-weight:400}.note{margin:8pt 0 0;font-size:10pt}@media screen{body{padding:16px}}</style></head><body>
<h1>棚卸用の表</h1>
<div class="meta"><b>法人名</b><span>${esc(data!.corpName)}</span><b>拠点名</b><span>${esc(s.name)}（${esc(sid)}）</span>
<b>月度</b><span>${esc(M.label)}</span><b>対象期間</b><span>${esc(M.period)}</span>
<b>報告期限</b><span>${esc(fmtDatesIn(M.due))}</span><b>出力日時</b><span>${esc(stamp)}</span></div>
<table><thead><tr><th class="c" style="width:9mm">No</th><th>商品名</th><th style="width:22mm">前回の数</th><th style="width:24mm">今ある数</th><th style="width:24mm">捨てた数</th><th style="width:24mm">届いた数</th></tr></thead><tbody>${body}</tbody></table>
<p class="note">数えたら、法人Web の棚卸報告に入力してください（報告期限 ${esc(fmtDatesIn(M.due))}）。「届いた数」はお届け中の商品がある行だけ入れます（斜線の行は入れません）。最後の空の行は一覧にない商品を書くための行です。</p>
<script>window.onload=function(){window.print();};</script></body></html>`);
    w.document.close();
    toast('棚卸用の表（PDF）を出力しました。');
  }

  const dueTxt = fmtDatesIn(M.due);
  const msg = beforeStart && cfg.from
    ? <Inline tone="info" title="ご契約の前の月です。">この拠点は {monthLabel(cfg.from)} から棚卸報告の対象です。この月の報告はありません。</Inline>
    : paused
      ? <Inline tone="info" title="休止中は棚卸報告はありません。">休止の始めに棚卸報告をして、それまでのご利用実績を精算しました。休止中はご利用実績の精算も事務手数料もありません。</Inline>
      : noCheck
          ? <Inline tone="info" title="棚卸報告はありません。">この拠点は棚卸報告の対象ではありません。</Inline>
          : cur && !isRedo
            ? (
              <Inline tone="success" title={`${STOCK_FILED}です（${fmtDatesIn(cur.at)}・${cur.who}）。`}>
                報告した数はESキッチンの在庫管理とご利用実績の精算に使います。{M.open && !cur.confirmed ? `報告期限（${dueTxt}）までは何度でも報告し直せます（最後の報告が有効）。` : ''}
                {M.open && !cur.confirmed ? <div style={{ marginTop: '0.571429rem' }}><Button variant="outline" size="sm" onClick={startRedo}>数え直して報告し直す</Button></div> : null}
                {M.open && cur.confirmed ? <div style={{ marginTop: '0.571429rem' }}>ESキッチンが確認済みのため、報告し直すことはできません。</div> : null}
              </Inline>
            )
            : M.open
              ? <Inline tone="info" title={`報告期限（${dueTxt}）までに在庫を数えてご報告ください。`}>この拠点に関係する商品ごとに、いまある数をご入力ください（ない商品は 0）。{fmtDatesIn(M.judge)}までに報告がない場合は事務手数料（{yenS(data.penaltyYen)}・税抜）をご請求します。</Inline>
              : st.t === '棚卸なし'
                ? null
                : !M.judged
                  ? <Inline tone="warning" title={`報告期限（${dueTxt}）を過ぎました。`}>21日からはESキッチンが代理で追加・修正します。{fmtDatesIn(M.judge)}までに数が入れば事務手数料はかかりません。お急ぎの場合はESキッチンへお問い合わせください。</Inline>
                  : <Inline tone="negative" title="報告されていません。">{fmtDatesIn(M.judge)}の時点で報告がなかったため、事務手数料（{yenS(data.penaltyYen)}・税抜）がかかります。数はESキッチンが確認して入力します。</Inline>;

  return (
    <DocsPage className="cb-stockpg">
      <header className="es-pagehead page-h">
        <div className="es-pagehead__text">
          <Breadcrumb items={[<a key="l" href="/corp/stock" onClick={(e) => { e.preventDefault(); router.push('/corp/stock'); }}>棚卸一覧</a>, '棚卸報告']} />
          <h1 className="es-pagehead__title">棚卸報告</h1>
          <div className="stat"><span>{data.corpName}</span><span className="k">権限</span><span>{data.roleName}（{data.scope}）</span></div>
        </div>
        <div className="es-pagehead__actions">
          {/* 棚卸用の表（PDF）：棚卸の表に商品があるときだけ（No.1.4） */}
          {!noSheet && items.length > 0 ? <Button variant="outline" onClick={printSheet}>棚卸用の表（PDF）</Button> : null}
          {/* CSV出力：見てよい拠点の、選んでいる月度の棚卸報告（1行＝棚卸の1商品。dm.report.stockChecks の項目をくり返す） */}
          <CorpCsvExport<(typeof list)[number]> screen="棚卸報告" rows={list} filters={[{ label: '対象月', value: M.m }]}
            columns={[{ label: '拠点ID', get: (x) => x.id }, { label: '拠点名', get: (x) => x.name }, { label: '配送の方法', get: (x) => x.dlv },
              { label: '棚卸する人', get: (x) => { const c = cfgOf(x.id), w = wayAt(c, M.m); return skPaused(c, M.m) ? 'なし（休止中）' : w === 'corp' ? '企業担当者' : w === 'driver' ? 'ES配送便ドライバー・企業担当者' : c?.way === 'nocheck' ? 'なし（棚卸なし）' : ''; } },
              { label: '状態', get: (x) => stockStat(cfgOf(x.id), M, recOf(x.id, M.m), sheetEmpty(data.sheets.find((y) => y.site === x.id && y.m === M.m)?.items)).t }, { label: '報告日時', get: (x) => recOf(x.id, M.m)?.at ?? '' }, { label: '報告者', get: (x) => recOf(x.id, M.m)?.who ?? '' }]}
            source={{ kind: 'dm.report.stockChecks', id: (x) => `SC-${M.m}-${x.id}`, childKey: 'rows' }} />
        </div>
      </header>
      <div className="cb-stack">
        <Card
          title={`${s.name} の棚卸報告`}
          action={(
            <div style={{ display: 'flex', gap: '0.571429rem' }}>
              {list.length > 1 ? <Sel id="sk-site" minWidth={304} value={sid} opts={list.map((x) => [x.id, x.name])} onChange={(v) => go(v, M.m)} /> : null}
              <Sel id="sk-m" value={M.m} opts={MONTHS.map((x) => [x.m, x.label + (x.open ? '（今回）' : '')])} onChange={(v) => go(sid, v)} />
            </div>
          )}
        >
          <div className="es-formgrid">
            <RoText label="対象期間">{M.period}</RoText>
            <RoText label="在庫を数える基準日">{fmtDatesIn(M.close)}（対象期間の最終日）</RoText>
            <RoText label="報告期限">{dueTxt}（21日以降はESキッチンが追加・修正。未報告の判定は {fmtDatesIn(M.judge)}）</RoText>
            <RoBadge label="状態" text={st.t} tone={st.tone} />
            <RoText label="報告日">{cur ? fmtDatesIn(cur.at) : '—'}</RoText>
            <RoText label="報告者">{cur ? cur.who + (cur.acct ? `（${cur.acct}）` : '') : '—'}</RoText>
            <RoText label="報告の方法">{wayText}</RoText>
          </div>
          {/* I213：ES配送便の拠点はドライバーも報告する（法人・拠点も最終確認として報告し直せる：B-21） */}
          {way === 'driver' && !paused && cfg.pauseCheck !== M.m ? (
            <Inline tone="info" title="この拠点はドライバーも棚卸を報告します。">ES配送便の拠点は、お届けのときにドライバーが在庫を数えてアプリから報告します。ドライバーの報告があれば数を表示します。最終確認として数え直して報告し直すこともできます（報告期限までは最後の報告が有効。21日以降はESキッチンが追加・修正します）。</Inline>
          ) : null}
          {cfg.pauseCheck === M.m && !paused && <Inline tone="warning" title="休止の始めの棚卸報告です。">この月度は休止の前の最後のお届けの月です。ES配送便の拠点も、お客様がこの画面でご報告ください。この分までのご利用実績を精算します。</Inline>}
          {msg}
          {/* 代替品の回収・廃棄のお知らせ（代替品の設定のデータから出す：決定_代替品 Q-ALT8）。今回の月度だけ */}
          {M.open ? data.alts.filter((x) => x.site === sid).map((x) => {
            const md = (d: string) => (d ? `${Number(d.slice(5, 7))}/${Number(d.slice(8, 10))}` : '');
            const driver = x.how === 'ドライバーが回収・廃棄';
            return (
              <Inline key={x.id + x.product} tone="info" title={`代替品の回収（受付番号 ${x.id}）`}>
                {x.origOn ? `${md(x.origOn)} にお届けした` : ''}{x.product} {x.qty}食は商品の不良のため、{driver ? `${md(x.on)} のお届けで担当者が回収・廃棄します。` : 'お客様で廃棄して、棚卸報告の「捨てた数」にご入力ください。'}
                廃棄した分はESキッチンの計算上の在庫から引き、在庫差額（ご請求）にはしません。
              </Inline>
            );
          }) : null}
          {noSheet ? null : (
            <>
              {canIn && sheet && sheet.transit.length > 0 ? (
                <Inline tone="info" title="お届け中の商品があります">{sheet.transit.map((t) => `${fmtDatesIn(t.deliverOn)} のお届け（${t.status}）：${t.lines.map((l) => `${nameOf(l.productId)} ${l.qty}個`).join('・')}`).join('／')}。届いていれば「届いた数」に入れてください。</Inline>
              ) : null}
              <Table compact cls="sk-in" cols={[{ label: '商品' }, { label: `前回の棚卸（${prevLabel}）`, w: 150, cls: 'es-num' }, { label: 'お届け中', w: 110, cls: 'es-num' }, { label: '廃棄する', w: 110, cls: 'es-num' },
                { label: canIn ? '今ある数' : '棚卸した数', w: 130, cls: canIn ? 'c' : 'es-num' }, { label: '捨てた数', w: 120, cls: canIn ? 'c' : 'es-num' }, { label: '届いた数', w: 120, cls: canIn ? 'c' : 'es-num' }]}>
                {items.map((x) => {
                  const pv = x.added ? 0 : prev ? valOf(prev, x.id, 'n') : null;
                  const re = canIn ? rowErr(x) : null;
                  const box = (k: K, dis = false) => {
                    const iv = skin[inKey(x.id, k)];
                    if (dis) return <td className="c"><span className="dim">—</span></td>;
                    const err = fieldErr(x.id, k);
                    /* 行のエラー（E321・E327）：該当の欄を赤枠にする（理由の文は商品名の下） */
                    const rowHi = (re?.code === 'E321' && k === 'a') || (re?.code === 'E327' && (k === 'n' || k === 'd'));
                    return (
                      <td className="c">
                        <div className="sk-fld">
                          <div className={`es-input es-input--sm${err || rowHi ? ' es-input--error' : ''}`} style={{ width: '6.428571rem' }}>
                            <input type="text" inputMode="numeric" aria-label={`${x.name} の${fname(k)}`} aria-invalid={err || rowHi ? true : undefined} aria-describedby={err ? errId(x.id, k) : undefined} value={iv || ''} placeholder={k === 'n' ? '—' : '0'} onChange={(e) => setIn(x.id, k, e.target.value)} style={{ textAlign: 'right' }} />
                            <span className="es-input__suffix">個</span>
                          </div>
                          {err ? <p id={errId(x.id, k)} className="es-field__msg es-field__msg--error">{err}</p> : null}
                        </div>
                      </td>
                    );
                  };
                  const shown = (k: K) => { const v = valOf(cur, x.id, k); return <Td v={v == null ? '—' : v + '個'} cls="es-num" />; };
                  return (
                    <tr key={x.id} className={x.added ? 'sk-added' : x.toDispose || x.expired ? 'rv-skwarn' : undefined}>
                      <td>
                        {x.name}
                        {(x.nameEn ?? enOf(x.id)) ? <div className="sk-en">{x.nameEn ?? enOf(x.id)}</div> : null}
                        {re ? <div className="es-field__msg es-field__msg--error" role="alert" data-msg={re.code}>{re.text}</div> : null}
                        {x.added ? <span className="sk-added__note"><span>追加した商品です（前回の数 0）。</span><button type="button" className="sk-added__x" aria-label={`${x.name} の行を外す`} title="行を外す" onClick={() => removeAdded(x.id)}>×</button></span> : null}
                      </td>
                      <Td v={pv == null ? (x.prev ? x.prev + '個' : '—') : pv + '個'} cls="es-num" />
                      <Td v={x.inTransit ? x.inTransit + '個' : '—'} cls="es-num" /><Td v={x.toDispose || x.expired ? [x.toDispose ? x.toDispose + '個' : '', x.expired ? `期限切れの見込み ${x.expired}個` : ''].filter(Boolean).join('・') : '—'} cls="es-num" />
                      {canIn ? <>{box('n')}{box('d')}{box('a', !x.inTransit)}</> : <>{shown('n')}{shown('d')}{shown('a')}</>}
                    </tr>
                  );
                })}
                {!items.length ? <tr><td colSpan={7} className="c dim">この月度に棚卸する商品はありません</td></tr> : null}
              </Table>
            </>
          )}
          {canIn ? (
            /* スマホ幅では画面の下に固定（No.7） */
            <div className="rv-skact" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.857143rem', marginTop: '1.142857rem', flexWrap: 'wrap' }}>
              <Button variant="outline" tone="neutral" onClick={() => setAddOpen(true)}>商品を追加</Button>
              <Button variant="outline" onClick={clearIn}>クリア</Button>
              <Button icon="Checks" onClick={file}>報告する</Button>
            </div>
          ) : null}
          <p className="note" style={{ marginTop: '0.857143rem' }}>数えるのは冷蔵庫・棚にある商品です（賞味期限切れで捨てた分は含めません）。報告した数と、ESキッチンが計算した在庫（前回の棚卸＋お届け−販売−廃棄）との差が在庫差額です。許容範囲を超えた在庫差額は、ご利用実績の精算として請求書に載ります。たとえば、計算上は10個のところ報告が8個なら、差の2個が在庫差額です（許容範囲の中なら、ご請求はありません）。</p>
        </Card>
      </div>
      {modal ? <FileDialog m={modal} busy={busy} roleName={data.roleName} onChange={setModal} onClose={() => setModal(null)} onOk={() => doFile(modal)} /> : null}
      {addOpen ? <AddDialog products={data.products} inTable={items.map((x) => x.id)} onAdd={addProduct} onClose={() => setAddOpen(false)} toast={toast} /> : null}
    </DocsPage>
  );
}

/** 報告の確認（No.10・版 1.1）：幅 560px。拠点・月度・報告する商品の件数と、報告した方（プルダウン・既定＝この拠点のメイン担当者）だけ */
function FileDialog({ m, busy, roleName, onChange, onClose, onOk }: { m: FileModal; busy: boolean; roleName: string; onChange: (m: FileModal) => void; onClose: () => void; onOk: () => void }) {
  const word = '報告した方';
  return (
    <Dialog title="棚卸を報告しますか？" width={560} onClose={onClose}
      footer={<div style={{ display: 'flex', gap: '0.857143rem' }}><Button variant="outline" onClick={onClose}>キャンセル</Button><Button onClick={onOk} disabled={busy}>報告する</Button></div>}>
      <div className="cb-dlg">
        <div>
          <b className="cb-mh">{m.siteName}・{m.M.label}（報告期限 {fmtDatesIn(m.M.due)}）／報告する商品 {m.rows.length}件</b>
          <p>報告した数はESキッチンの在庫管理とご利用実績の精算（在庫差額）に使います。報告期限までは何度でも報告し直せます。</p>
        </div>
        <div>
          <b className="cb-mh">{word}<span className="es-field__req" aria-hidden="true">*</span></b>
          <div className={`es-field${m.whoErr ? ' es-field--error' : ''}`}>
            <Sel id="sk-who" value={m.who} minWidth={280} opts={[['', '選んでください'], ...m.cands.map((c): [string, string] => [c.value, `${c.name}（${c.where}・${c.kind}）`])]} onChange={(v) => onChange({ ...m, who: v, whoErr: false })} />
            {m.whoErr ? <p className="es-field__msg es-field__msg--error">{word}をお選びください。</p> : null}
          </div>
          <p className="note" style={{ marginTop: '0.428571rem' }}>ログインは{roleName}（共有）なので、{word}をご確認ください（違う方なら選び直してください）。報告の記録に残り、ESキッチンからのご連絡はこの方へお送りします。</p>
        </div>
      </div>
    </Dialog>
  );
}

/**
 * 商品を追加（No.41・版 1.1）：幅 560px。スマホはカメラで JAN コードを読み取る（JANをスキャン）、PC は JAN コードの入力か商品名の検索。
 * 候補はESキッチンの商品マスタで販売中の商品（この拠点の棚卸の表にない商品）。デモでは getUserMedia が使えない環境もあるので、JAN を手で入れる欄も一緒に出す
 */
function AddDialog({ products, inTable, onAdd, onClose, toast }: { products: StockProduct[]; inTable: string[]; onAdd: (p: StockProduct) => void; onClose: () => void; toast: (m: string) => void }) {
  const [jan, setJan] = useState('');
  const [name, setName] = useState('');
  const [pick, setPick] = useState('');
  const [scan, setScan] = useState(false);
  const video = useRef<HTMLVideoElement>(null);
  const stream = useRef<MediaStream | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasCamera = typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia;
  const cands = stockCands(products, jan, name, inTable);
  const janDone = jan.length === 8 || jan.length === 13;
  /* JAN が表にある商品なら W211（候補には出さない） */
  const dup = janDone ? products.find((p) => (p.jans?.length ? p.jans : [p.jan]).includes(jan) && inTable.includes(p.id)) : undefined;
  const nameErr = name.length > 60 ? '60文字以内でご入力ください。' : '';
  const stop = () => {
    if (timer.current) { clearInterval(timer.current); timer.current = null; }
    stream.current?.getTracks().forEach((t) => t.stop()); stream.current = null;
    setScan(false);
  };
  useEffect(() => () => { if (timer.current) clearInterval(timer.current); stream.current?.getTracks().forEach((t) => t.stop()); }, []);
  useEffect(() => {
    if (!janDone) return;
    if (dup) toast(`${dup.name}はすでに表にあります。`);
    else if (!cands.length) toast('商品が見つかりません。JANコードか商品名をご確認ください。');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jan]);
  async function startScan() {
    const Det = (window as unknown as { BarcodeDetector?: new (o: { formats: string[] }) => BarcodeDetectorLike }).BarcodeDetector;
    try {
      if (!Det) throw new Error('no detector');
      const ms = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      stream.current = ms;
      setScan(true);
      await new Promise((r) => setTimeout(r, 50));
      if (video.current) { video.current.srcObject = ms; await video.current.play(); }
      const det = new Det({ formats: ['ean_13', 'ean_8'] });
      timer.current = setInterval(async () => {
        if (!video.current) return;
        try {
          const found = await det.detect(video.current);
          const v = found.map((x) => janInput(x.rawValue)).find((x) => x.length === 8 || x.length === 13);
          if (v) { setJan(v); setName(''); setPick(''); stop(); }
        } catch { /* 読み取れないフレームは飛ばす */ }
      }, 300);
    } catch {
      stop();
      toast('カメラが使えないため、JANコードをご入力ください。');
    }
  }
  const sel = cands.find((p) => p.id === pick);
  return (
    <Dialog title="商品を追加" width={560} onClose={() => { stop(); onClose(); }}
      footer={<div style={{ display: 'flex', gap: '0.857143rem' }}><Button variant="outline" onClick={() => { stop(); onClose(); }}>キャンセル</Button><Button disabled={!sel} onClick={() => { if (sel) { stop(); onAdd(sel); } }}>追加する</Button></div>}>
      <div className="cb-dlg sk-add">
        <Inline tone="info" title="スマホではカメラでJANコードを読み取れます。">PCではJANコードをご入力いただくか、商品名でお探しください。</Inline>
        {hasCamera ? (
          <div className="sk-add__scan">
            <Button variant="outline" tone="neutral" onClick={() => (scan ? stop() : startScan())}>{scan ? 'スキャンをやめる' : 'JANをスキャン'}</Button>
            {scan ? <video ref={video} className="sk-video" muted playsInline aria-label="カメラ" /> : null}
          </div>
        ) : null}
        <div className="sk-add__f">
          <div className="es-field">
            <label className="es-field__label">JANコード</label>
            <div className="es-input es-input--md"><input type="text" inputMode="numeric" aria-label="JANコード" placeholder="8桁または13桁の数字" value={jan} onChange={(e) => { setJan(janInput(e.target.value)); setPick(''); }} /></div>
          </div>
          <div className={`es-field${nameErr ? ' es-field--error' : ''}`}>
            <label className="es-field__label">商品名で探す</label>
            <div className="es-input es-input--md"><input type="text" aria-label="商品名で探す" placeholder="商品名の一部（2文字以上）" value={name} maxLength={61} onChange={(e) => { setName(e.target.value); setJan(''); setPick(''); }} /></div>
            {nameErr ? <p className="es-field__msg es-field__msg--error">{nameErr}</p> : null}
          </div>
        </div>
        <Table compact cls="sk-cand" cols={[{ label: '', w: 40, cls: 'c' }, { label: '商品名' }, { label: 'JAN', w: 140 }, { label: '温度帯', w: 80 }]}>
          {cands.map((p) => {
            const on = pick === p.id;
            return (
              <tr key={p.id} className={`cb-whorow${on ? ' is-on' : ''}`} onClick={() => setPick(p.id)}>
                <td className="c"><label className="es-radio"><input type="radio" name="sk-cand" value={p.id} checked={on} onChange={() => setPick(p.id)} aria-label={p.name} /><span className="es-radio__dot" aria-hidden="true" /><span /></label></td>
                <td><b>{p.name}</b>{p.nameEn ? <div className="sk-en">{p.nameEn}</div> : null}</td><Td v={p.jan} cls="es-mono" /><Td v={TEMP[p.temp] ?? p.temp} />
              </tr>
            );
          })}
          {!cands.length ? <tr><td colSpan={4} className="c dim">{dup ? `${dup.name}はすでに表にあります。` : (janDone || name.length >= 2) ? '商品が見つかりません。JANコードか商品名をご確認ください。' : 'JANコードを入れるか、商品名で探すと候補が出ます'}</td></tr> : null}
        </Table>
      </div>
    </Dialog>
  );
}
