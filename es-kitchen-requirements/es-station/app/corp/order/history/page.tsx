'use client';

import { CorpCsvExport } from '../../_ui/csv';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { histRows, isVm, MAT_TONE, menuId, pastQty, fmtD, stLabel, ym } from '@/lib/corp/order/logic';
import { MONTHS } from '@/lib/corp/order/data';
import { today } from '@/lib/supplier/dates';
import { useCorpSignedIn } from '../../_ui/CorpProvider';
import { About } from '../_components/modals';
import { Badge, Button, Card, EmptyState, Head, Pager, SearchPanel, Select, Table, Td, TextField, TLink } from '../_components/es';
import { useOrder } from '../_components/OrderProvider';
import { AboutLink, Loading, MenuPdfLinks, StatusBadge } from '../_components/parts';

/** 一覧の「—」（I01・I223） */
const I01 = '表示するデータがありません。';
const I223 = 'お届け予定日は、発送の手配が済むとお知らせします。';

/**
 * 月次注文 ＞ 注文履歴（元：部品/23 の Hist・HistItem・HistMat）。商品注文／資材注文の切替。
 * 版 1.1（hong 2026-10-05 版1.0レビュー ⑥⑩・受付簿 No.153・154）：メニューID・操作は受付中で変更できる行は商品注文（編集）、それ以外は注文履歴 詳細（参照）。
 * 資材注文に 発送日・お届け予定日（発送日＋リードタイム）・送り状番号。納品書は注文履歴からは出さない（お届け詳細だけ・版 1.1 レビュー①）。
 * 商品注文／資材注文の切替は URL（?tab=mat・P-TAB）に持つ（受付簿 No.132・B-18）。資材注文は注文日の降順（view で並べ済み）・10件ずつ
 */
export default function HistPage() {
  return <Suspense fallback={<Loading />}><Hist /></Suspense>;
}

function Hist() {
  const router = useRouter();
  const sp = useSearchParams();
  const { view } = useCorpSignedIn();
  const { data, S, set, qtyOf } = useOrder();
  const [modal, setModal] = useState<{ type: 'about' } | null>(null);
  if (!data) return <Loading />;
  const sites = data.sites, P = data.products, cyc = data.cycle, hq = S.hq;
  const k: 'item' | 'mat' = sp.get('tab') === 'mat' || sp.get('kind') === 'mat' ? 'mat' : 'item';
  const switchKind = (kind: 'item' | 'mat') => { set({ hpg: 1 }); router.push(kind === 'mat' ? '/corp/order/history?tab=mat' : '/corp/order/history'); };
  const site = (id: string) => sites.find((x) => x.id === id)!;
  const qd = (key: string) => (v: string) => set((o) => ({ hqd: { ...o.hqd, [key]: v } }));
  const close = () => setModal(null);
  const siteSel = sites.length > 1 ? <Select key="s" placeholder="拠点名" value={S.hqd.site || ''} options={sites.map((x) => ({ value: x.id, label: x.short }))} onChange={qd('site')} /> : null;
  const kindTabs = (
    <div style={{ display: 'flex', gap: '0.571429rem', marginBottom: '0.857143rem' }}>
      <Button variant={k === 'item' ? 'solid' : 'outline'} size="sm" onClick={() => switchKind('item')}>商品注文</Button>
      <Button variant={k === 'mat' ? 'solid' : 'outline'} size="sm" onClick={() => switchKind('mat')}>資材注文</Button>
    </div>
  );
  const search = (children: React.ReactNode) => (
    <SearchPanel onSearch={() => set((o) => ({ hq: { ...o.hqd }, hpg: 1 }))} onClear={() => set({ hq: {}, hqd: {}, hpg: 1 })}>{children}</SearchPanel>
  );
  const modals = !modal ? null
    : <About cycL={cyc.label} from={cyc.from} to={cyc.to} today={today()} onClose={close} />;
  const tail = <>{modals}<AboutLink onOpen={() => setModal({ type: 'about' })} /></>;

  if (k === 'mat') {
    /* 注文日の降順（view で並べ済み）・10件ずつ（B-18） */
    const rows = data.matHist.filter((r) => !hq.site || r.site === hq.site);
    const mshown = rows.slice((S.hpg - 1) * S.hper, S.hpg * S.hper);
    const dash = (title: string) => <span className="od-small" title={title}>—</span>;
    return (
      <div className="od-stack">
        <Head crumb={['月次注文', '注文履歴']} title="注文履歴" actions={
          <CorpCsvExport<(typeof rows)[number]> screen="注文履歴（資材注文）" rows={rows} filters={[{ label: '拠点', value: hq.site ? site(hq.site)?.short ?? hq.site : '' }]}
            columns={[{ label: '資材注文No', get: (r) => r.no }, { label: '注文区分', get: (r) => r.kind }, { label: '拠点ID', get: (r) => r.site }, { label: '拠点名', get: (r) => site(r.site)?.short },
              { label: '注文日', get: (r) => r.od }, { label: '発送日', get: (r) => r.sd }, { label: 'お届け予定日', get: (r) => r.dd }, { label: '送り状番号', get: (r) => r.slip }, { label: '資材', get: (r) => r.what }, { label: '配送状態', get: (r) => r.st }]}
            source={{ kind: 'dm.delivery.materialOrders', id: (r) => r.no, childKey: 'lines' }} />
        } />
        <Card>
          {kindTabs}
          {search(siteSel)}
          {rows.length
            ? <Table cols={[{ label: 'No', w: 48 }, { label: '資材注文No' }, { label: '注文区分' }, { label: '拠点名' }, { label: '注文日' }, { label: '発送日' }, { label: 'お届け予定日' }, { label: '送り状番号' }, { label: '資材' }, { label: '配送状態' }]}
              rows={mshown.map((r, i) => (
                <tr key={r.no}><Td v={(S.hpg - 1) * S.hper + i + 1} /><td className="es-mono">{r.no}</td><Td v={r.kind} /><Td v={site(r.site)?.short} /><Td v={r.od} />
                  <td>{r.sd ? fmtD(r.sd) : dash('発送日は、ESキッチンが発送の手配をすると出ます。')}</td>
                  <td>{r.dd || dash(I223)}</td>
                  <td className="es-mono">{r.slip || dash('送り状番号は、ESキッチンが発送の手配をすると出ます。')}</td>
                  <Td v={r.what} />
                  <td><Badge tone={MAT_TONE[r.st] || 'neutral'}>{r.st}</Badge>{r.check ? <span className="od-small" style={{ marginLeft: '0.428571rem' }}>{r.check}</span> : null}</td></tr>
              ))} />
            : <EmptyState title={I01} compact />}
          {rows.length ? <Pager total={rows.length} page={S.hpg} per={S.hper} opts={[10, 20, 50]} onPage={(n) => set({ hpg: n })} onPer={(n) => set({ hper: n, hpg: 1 })} /> : null}
          <p className="od-small" style={{ marginTop: '0.857143rem' }}>{'配送状態は、ESキッチンが資材便の配送データから反映します。お届け予定日と送り状番号は、ESキッチンが発送の手配をすると出ます。資材はいつでも注文でき、同じご利用月の2回目以降は資材の追加配送の料金（' + data.matExtraYen.toLocaleString('ja-JP') + '円）がかかります。'}</p>
        </Card>
        {tail}
      </div>
    );
  }

  const curSt: Record<string, string> = {};
  sites.forEach((x) => { curSt[x.id] = data.orders[x.id]?.status; });
  const pastSt: Record<string, Record<string, string>> = {};
  Object.keys(data.past).forEach((id) => { pastSt[id] = data.past[id].st; });
  const rows = histRows(sites, cyc.ym, curSt, pastSt).filter((r) => {
    if (hq.m && r.m !== hq.m) return false;
    if (hq.site && r.site.id !== hq.site) return false;
    if (hq.kw) {
      if (r.st === '休止中') return false;
      const q = r.open ? qtyOf(r.site.id) : pastQty(r.site, P, r.m);
      const hit = P.some((p) => (p.name.indexOf(hq.kw) >= 0 || (p.nameEn ?? '').toLowerCase().indexOf(hq.kw.toLowerCase()) >= 0) && !!q[p.id] && Object.keys(q[p.id]).some((kk) => q[p.id][kk] > 0));
      if (!hit) return false;
    }
    return true;
  });
  const shown = rows.slice((S.hpg - 1) * S.hper, S.hpg * S.hper);
  /** 受付中の月で注文を変更できる行（休止中・お試し・解約後（参照のみ）でない）→ 商品注文（編集）。それ以外 → 注文履歴 詳細（参照） */
  const canEdit = (r: (typeof rows)[number]) => r.open && cyc.open && !r.site.trial && !r.site.paused && view !== 'ro';
  const toEdit = (siteId: string) => { set({ site: siteId, sel: {} }); router.push('/corp/order'); };
  const toDetail = (r: (typeof rows)[number]) => router.push('/corp/order/history/' + r.site.id + '/' + r.m);
  const go = (r: (typeof rows)[number]) => (canEdit(r) ? toEdit(r.site.id) : toDetail(r));
  return (
    <div className="od-stack">
      <Head crumb={['月次注文', '注文履歴']} title="注文履歴" actions={
        /* 1行＝注文の1行（品番×便。注文の項目をくり返す・dm.order.orders） */
        <CorpCsvExport<(typeof rows)[number]> screen="注文履歴（商品注文）" rows={rows}
          filters={[{ label: '商品名', value: hq.kw ?? '' }, { label: '対象年月', value: hq.m ?? '' }, { label: '拠点', value: hq.site ? site(hq.site)?.short ?? hq.site : '' }]}
          columns={[{ label: 'メニューID', get: (r) => menuId(r.m) }, { label: '対象年月', get: (r) => r.m }, { label: '拠点ID', get: (r) => r.site.id }, { label: '拠点名', get: (r) => r.site.short },
            { label: 'ご注文の受付開始日', get: (r) => r.from }, { label: 'ご注文の締切日', get: (r) => r.to }, { label: '自販機', get: (r) => (isVm(r.site) ? 'あり' : '') }, { label: 'ご注文の状態', get: (r) => stLabel(r.st) }]}
          source={{ kind: 'dm.order.orders', id: (r) => `O-${r.m.replace('-', '')}-${r.site.id}`, childKey: 'lines' }} />
      } />
      <Card>
        {kindTabs}
        {search([
          <TextField key="kw" className="es-grow" icon="Search" placeholder="商品名（その商品を注文した月を探します）" value={S.hqd.kw || ''} onChange={qd('kw')} />,
          <Select key="m" placeholder="対象年月" value={S.hqd.m || ''} options={MONTHS.map((m) => ({ value: m, label: ym(m) }))} onChange={qd('m')} />,
          siteSel,
        ])}
        {rows.length
          ? <Table cols={[{ label: 'No', w: 48 }, { label: 'メニューID' }, { label: '対象年月' }, { label: '拠点名' }, { label: 'ご注文の受付開始日' }, { label: 'ご注文の締切日' }, { label: '自販機', cls: 'c' }, { label: 'メニューPDF' }, { label: 'ご注文の状態' }, { label: '操作', cls: 'c', w: 64 }]}
            rows={shown.map((r, i) => (
              <tr key={r.site.id + r.m}>
                <Td v={(S.hpg - 1) * S.hper + i + 1} />
                <td className="es-mono">{r.st === '休止中' ? menuId(r.m) : <TLink onClick={() => go(r)}>{menuId(r.m)}</TLink>}</td>
                <Td v={ym(r.m)} /><Td v={r.site.short} /><Td v={fmtD(r.from)} /><Td v={fmtD(r.to)} /><Td v={isVm(r.site) ? '✓' : ''} cls="c" />
                <td><MenuPdfLinks pdfs={data.menuPdfs[r.m]} course={r.site.course} /></td>
                <td><StatusBadge st={r.st} />{r.open ? <span className="od-small" style={{ marginLeft: '0.428571rem' }}>受付中</span> : null}</td>
                <td className="c">{r.st === '休止中' ? null
                  : canEdit(r)
                    ? <Button variant="ghost" tone="neutral" size="sm" icon="PencilSimple" aria-label="注文を変更" title="注文を変更" className="od-op" onClick={() => toEdit(r.site.id)} />
                    : <Button variant="ghost" tone="neutral" size="sm" icon="Eye" aria-label="参照" title="参照" className="od-op" onClick={() => toDetail(r)} />}</td>
              </tr>
            ))} />
          : <EmptyState title={I01} compact />}
        {rows.length ? <Pager total={rows.length} page={S.hpg} per={S.hper} opts={[10, 20, 50]} onPage={(n) => set({ hpg: n })} onPer={(n) => set({ hper: n, hpg: 1 })} /> : null}
      </Card>
      {tail}
    </div>
  );
}
