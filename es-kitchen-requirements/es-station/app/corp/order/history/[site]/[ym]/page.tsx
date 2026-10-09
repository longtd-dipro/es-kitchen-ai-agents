'use client';

import { useParams, usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { fmtD, MAT_TONE, menuId, orderFrom, orderTo, pastQty, stLabel, sumBy, TEMP_L, ym } from '@/lib/corp/order/logic';
import { today } from '@/lib/supplier/dates';
import { useCorpSignedIn } from '../../../../_ui/CorpProvider';
import { About, LogTable, logListOf, MenuDetail } from '../../../_components/modals';
import { Badge, Button, Card, EmptyState, Head, Ro, SectionTitle, Table, Td, TLink, type Col } from '../../../_components/es';
import { useOrder } from '../../../_components/OrderProvider';
import { AboutLink, DlLabel, Loading, MenuPdfLinks, Tabs, Thumb } from '../../../_components/parts';
import { prodImg } from '../../../_components/photo';

/**
 * 月次注文 ＞ 注文履歴 ＞ 詳細（元：部品/23 の HistD）。/corp/order/history/<拠点ID>/<対象年月>。
 * 締切後は商品注文の画面を開かず、この画面が締切後の唯一の参照の画面（版 1.1 ⑥・CW_HIST No.23）
 */
export default function HistDetailPage() {
  return <Suspense fallback={<Loading />}><HistDetail /></Suspense>;
}

function HistDetail() {
  const router = useRouter();
  const path = usePathname();
  const sp = useSearchParams();
  /** 画面内のタブ（P-TAB・URL の ?tab=）：注文（既定）／変更履歴。変更履歴はモーダルをやめてタブにした（受付簿 No.157） */
  const tab: 'order' | 'history' = sp.get('tab') === 'history' ? 'history' : 'order';
  const setTab = (t: 'order' | 'history') => router.replace(t === 'history' ? path + '?tab=history' : path);
  const { view } = useCorpSignedIn();
  const prm = useParams<{ site: string; ym: string }>();
  const { data, set, qtyOf } = useOrder();
  const [modal, setModal] = useState<{ type: 'menu'; p: string } | { type: 'about' } | null>(null);
  if (!data) return <Loading />;
  const x = data.sites.find((v) => v.id === prm.site), m = prm.ym, P = data.products, cyc = data.cycle;
  const back = () => router.push('/corp/order/history');
  const pastSt = x ? data.past[x.id]?.st ?? {} : {};
  if (!x || (m !== cyc.ym && !pastSt[m])) return (
    <div className="od-stack">
      <Head crumb={[['月次注文', null], ['注文履歴', back], menuId(m)]} title="注文履歴 詳細" actions={<Button variant="outline" onClick={back}>戻る</Button>} />
      <Card><EmptyState title="この注文は見られません。" compact>注文履歴から開き直してください。</EmptyState></Card>
    </div>
  );
  const open = m === cyc.ym, q = open ? qtyOf(x.id) : pastQty(x, P, m), t = sumBy(x, P, q);
  const stx = open ? data.orders[x.id]?.status : pastSt[m];
  /* 資材はそのサイクル月に登録した資材注文を資材注文No ごとに出す（B-19） */
  const mats = data.matHist.filter((h) => h.site === x.id && h.ym === m);
  const rows = P.filter((p) => { const r = q[p.id]; return r && Object.keys(r).some((k) => r[k] > 0); });
  const mm = parseInt(m.split('-')[1], 10);
  const dls = x.dl.map((d) => ({ ...d, date: d.date ? String(mm).padStart(2, '0') + d.date.slice(d.date.indexOf('-'), d.date.indexOf('(')) : '' }));
  const close = () => setModal(null);
  const modals = !modal ? null
    : modal.type === 'menu' ? <MenuDetail p={P.find((p) => p.id === modal.p)!} onClose={close} />
        : <About cycL={cyc.label} from={cyc.from} to={cyc.to} today={today()} onClose={close} />;
  const toEdit = () => { set({ site: x.id, sel: {} }); router.push('/corp/order'); };
  /* 注文を変更：受付中の月（受付期間内）で、休止中・お試し・解約後（参照のみ）でないときだけ（台帳 E 2026-10-05・版 1.1 ⑥） */
  const canEdit = open && cyc.open && !x.trial && !x.paused && view !== 'ro';
  const cols: Col[] = [{ label: 'No', w: 48 }, { label: '写真', w: 60 }, { label: '商品名' }, { label: 'カテゴリ' }, { label: '保存方法' }, { label: '定価（税込）', cls: 'r' }];
  dls.forEach((d) => cols.push({ label: <span><DlLabel d={d} /><br /><small className="od-small">{d.date}</small></span>, cls: 'r' }));
  cols.push({ label: '合計数', cls: 'r' });

  return (
    <div className="od-stack">
      <Head crumb={[['月次注文', null], ['注文履歴', back], menuId(m)]} title={<>注文履歴 詳細 <span className="es-mono">{menuId(m)}</span></>}
        actions={<>
          {canEdit ? <Button icon="PencilSimple" onClick={toEdit}>注文を変更</Button> : null}
          <Button variant="outline" onClick={back}>戻る</Button>
        </>} />
      <Tabs label="注文履歴 詳細の表示" value={tab} onChange={setTab} items={[{ key: 'order', label: '注文' }, { key: 'history', label: '変更履歴' }]} />
      {tab === 'history' ? (
        <Card><LogTable list={logListOf({ m, cyc: cyc.ym, cur: data.logs[x.id] || [], past: data.past[x.id]?.log, pastSt })} /></Card>
      ) : <>
      <Card>
        <SectionTitle>注文の情報</SectionTitle>
        <div className="od-g4">
          <Ro label="拠点名" v={x.short} /><Ro label="対象年月" v={ym(m)} /><Ro label="プラン" v={x.planId + ' ' + '月' + x.plan + '個プラン（' + x.course + '）'} /><Ro label="ご注文の状態" v={stx ? stLabel(stx) : stx} />
          <Ro label="ご注文の受付期間" v={fmtD(orderFrom(m)) + '〜' + fmtD(orderTo(m))} /><Ro label="合計" v={t.items + '品・' + t.total + '個'} />
          <Ro label="配送回ごと" v={dls.map((d) => d.l + ' ' + t.byDl[d.k]).join('／')} /><Ro label="ご契約" v={x.kid === '—' ? '—' : x.kid.replace(/\d{6}$/, m.replace('-', ''))} />
        </div>
      </Card>
      <Card>
        <SectionTitle action={<span><span className="od-small">メニューPDF　</span><MenuPdfLinks pdfs={data.menuPdfs[m]} course={x.course} /></span>}>{'商品（' + rows.length + '品）'}</SectionTitle>
        <Table cls="od-tbl" cols={cols} rows={rows.map((p, i) => {
          let n = 0;
          return (
            <tr key={p.id}><Td v={i + 1} /><td><Thumb src={prodImg(p)} name={p.name} /></td>
              <td className="w"><TLink onClick={() => setModal({ type: 'menu', p: p.id })}>{p.name}</TLink>{p.nameEn ? <div className="od-small">{p.nameEn}</div> : null}{open && p.gone ? <div className="od-small od-removed">メニューから外れました</div> : null}</td><Td v={p.cat} /><Td v={TEMP_L[p.keep]} /><Td v={p.price + '円'} cls="r" />
              {dls.map((d) => { const v = q[p.id][d.k]; if (v != null) n += v; return <Td key={d.k} v={v == null ? '—' : v} cls="r" />; })}<Td v={n + '個'} cls="r" /></tr>
          );
        })} />
      </Card>
      <Card>
        <SectionTitle>{'資材（' + ym(m) + '分に登録した資材注文・' + mats.length + '件）'}</SectionTitle>
        {mats.length ? mats.map((h) => (
          <div key={h.no} className="od-mathist" style={{ marginBottom: '0.857143rem' }}>
            <div className="od-small" style={{ marginBottom: '0.428571rem' }}><span className="es-mono">{h.no}</span>　{h.kind}　注文日 {h.od}　お届け予定日 {h.dd || '—'}　<Badge tone={MAT_TONE[h.st] || 'neutral'}>{h.st}</Badge></div>
            <Table cols={[{ label: 'No', w: 48 }, { label: '資材名' }, { label: '注文数量', cls: 'r' }]}
              rows={h.lines.map((l, i) => <tr key={l.id}><Td v={i + 1} /><Td v={l.name} /><Td v={l.qty + l.unit} cls="r" /></tr>)} />
          </div>
        )) : <EmptyState title="表示するデータがありません。" compact />}
      </Card>
      </>}
      {modals}<AboutLink onOpen={() => setModal({ type: 'about' })} />
    </div>
  );
}
