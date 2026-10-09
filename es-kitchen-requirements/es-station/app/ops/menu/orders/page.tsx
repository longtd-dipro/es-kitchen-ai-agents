'use client';

import { SortMenu } from '@/components/SortMenu';

import { useQuery } from '@/lib/ops/core/client';
import { DEMO } from '@/lib/demo';
import { COURSES, DLV_KINDS, isVm, ordLabel, ORD_STATUSES, ORD_TONE, ymJa } from '@/lib/ops/menu/logic';
import type { AltDone, Order } from '@/lib/ops/menu/types';
import { useOpsCsvExport } from '../../_ui/csv';
import { Badge, Button, Card, CsvButton, Field, Head, Icon, InlineMessage, Pager, RowActions, SearchPanel, Sel, Select, Table, TextField, TLink, Td } from '../_components/es';
import { useKeep, useMenu } from '../_components/MenuProvider';
import { api, Loading, useMaster, WhoAt } from '../_components/parts';
import { useCanAct } from '../../_ui/perm';
import { fmtDate } from '@/lib/format/date';

/** m＝対象年月（空＝受付中のメニューの月）。dlv＝配送区分（ES配送便・COOL便） */
type OrdQ = { m: string; kw?: string; st?: string; course?: string; vm?: string; p?: string; dlv?: string };

/** 法人の登録・ES の変更の日時（変更履歴から。なければ ''） */
const whenOf = (o: Order, k: 'corp' | 'es') => (o.log || []).filter((x) => (k === 'corp' ? /法人アカウント|拠点アカウント/.test(x.who) : /運営|ESキッチン/.test(x.who)))[0]?.at ?? '';

/** 商品注文管理（一覧） */
export default function OrdersPage() {
  const { nav } = useMenu();
  const canAct = useCanAct();
  const csvExport = useOpsCsvExport();
  const mm = useMaster();
  const [q, setQ] = useKeep<OrdQ>('ord.q', { m: '' });
  const [qd, setQd] = useKeep<OrdQ>('ord.qd', { m: '' });
  /* 並べ替え（一覧の全列。初期は最終更新の降順：台帳 F・K）・ページ（10・20・50件。初期10） */
  const [sort, setSort] = useKeep<{ k: string; dir: 'asc' | 'desc' }>('ord.sort', { k: 'upd', dir: 'desc' });
  const [pg, setPg] = useKeep('ord.pg', 1);
  const [per, setPer] = useKeep('ord.per', 10);
  const [done, setDone] = useKeep<AltDone | null>('ord.done', null);
  const { data: menus } = useQuery(api, 'menus');
  /* 対象年月の初期値＝受付中（なければいちばん新しい）メニューの月。選択肢は登録してあるメニューの月（新しい順） */
  const months = (menus ?? []).map((m) => m.ym).sort().reverse();
  const defM = (menus ?? []).find((m) => m.status === '公開中')?.ym ?? months[0] ?? '';
  const qm = q.m || defM;
  const { data: orders } = useQuery(api, 'orders', { ym: qm });
  const { data: menu } = useQuery(api, 'menu', { ym: qm });
  if (!mm || !orders || !menus) return <Loading />;
  const { C } = mm;
  const closed = menu ? menu.status !== '公開中' : false;
  const dlvOf = (o: Order) => C.site(o.site).dlvKind;
  const adjN = (o: Order) => C.sumBy(C.site(o.site), o.ym, o.a).total;
  const SORTS: { k: string; label: string; get: (o: Order) => string | number }[] = [
    { k: 'no', label: 'オーダーNo', get: (o) => o.no }, { k: 'corp', label: '法人名', get: (o) => C.site(o.site).corpName }, { k: 'site', label: '拠点名', get: (o) => C.site(o.site).short },
    { k: 'plan', label: 'プラン名', get: (o) => C.site(o.site).plan }, { k: 'course', label: 'コース', get: (o) => C.site(o.site).course }, { k: 'vm', label: '自販機', get: (o) => (isVm(C.site(o.site)) ? 1 : 0) },
    { k: 'st', label: 'ステータス', get: (o) => ordLabel(o.status) }, { k: 'dlv', label: '配送区分', get: dlvOf }, { k: 'corpAt', label: '法人の登録', get: (o) => whenOf(o, 'corp') },
    { k: 'esAt', label: 'ES の変更', get: (o) => whenOf(o, 'es') }, { k: 'total', label: 'オーダー数', get: (o) => C.sumBy(C.site(o.site), o.ym, o.q).total }, { k: 'adj', label: '調整数', get: adjN },
    { k: 'upd', label: '最終更新', get: (o) => o.upd },
  ];
  /* 商品名の選択肢＝その月のメニューの商品＋注文に残っている商品（メニューから外した商品も出す：受付簿 #266） */
  const prodIds = new Set<string>(menu?.items ?? []);
  orders.forEach((o) => Object.keys(o.q).forEach((id) => { if (Object.values(o.q[id]).some((n) => n > 0) || Object.values(o.a[id] ?? {}).some((n) => n > 0)) prodIds.add(id); }));
  const filtered = orders.filter((o) => {
    const s = C.site(o.site);
    if (q.kw && (s.corp + s.corpName + s.id + s.short + s.planId + s.plan + 'プラン' + s.kid).indexOf(q.kw) < 0) return false;
    if (q.st && o.status !== q.st) return false;
    if (q.course && s.course !== q.course) return false;
    if (q.vm && (isVm(s) ? 'あり' : 'なし') !== q.vm) return false;
    if (q.dlv && s.dlvKind.indexOf(q.dlv) < 0) return false;
    if (q.p && !(o.q[q.p] && Object.keys(o.q[q.p]).some((k) => o.q[q.p!][k] > 0))) return false;
    return true;
  });
  const sk = SORTS.find((x) => x.k === sort.k) ?? SORTS[SORTS.length - 1];
  const list = [...filtered].sort((a, b) => {
    const x = sk.get(a), y = sk.get(b);
    const c = typeof x === 'number' && typeof y === 'number' ? x - y : String(x).localeCompare(String(y), 'ja');
    return c * (sort.dir === 'desc' ? -1 : 1) || a.no.localeCompare(b.no);
  });
  const pages = Math.max(1, Math.ceil(list.length / per)), cur = Math.min(pg, pages);
  const shown = list.slice((cur - 1) * per, cur * per);
  const qdSet = (k: keyof OrdQ) => (v: string) => setQd({ ...qd, [k]: v });
  const rateTxt = (o: Order) => { const n = adjN(o); return n ? n + '個（' + (Math.round(n / C.site(o.site).plan * 1000) / 10).toFixed(1) + '%）' : '—'; };

  return (
    <>
      <Head crumb={['メニュー管理', '商品注文管理']} title="商品注文管理" actions={<>
        <CsvButton onClick={() => csvExport<Order>({
          screen: '商品注文管理', rows: list,
          filters: [{ label: '対象年月', value: qm }, { label: '検索', value: q.kw ?? '' }, { label: 'ステータス', value: q.st ? ordLabel(q.st) : '' }, { label: 'コース', value: q.course ?? '' },
            { label: '自販機', value: q.vm ?? '' }, { label: '配送区分', value: q.dlv ?? '' }, { label: '商品', value: q.p ?? '' }],
          columns: [
            { label: 'オーダーNo', get: (o) => o.no }, { label: '法人ID', get: (o) => C.site(o.site).corp }, { label: '法人名', get: (o) => C.site(o.site).corpName },
            { label: '拠点ID', get: (o) => o.site }, { label: '拠点名', get: (o) => C.site(o.site).short }, { label: 'プランID', get: (o) => C.site(o.site).planId },
            { label: 'コース', get: (o) => C.site(o.site).course }, { label: '自販機', get: (o) => (isVm(C.site(o.site)) ? 'あり' : 'なし') }, { label: 'ステータス', get: (o) => ordLabel(o.status) },
            { label: '配送区分', get: dlvOf }, { label: '法人の登録日時', get: (o) => whenOf(o, 'corp') }, { label: '法人の登録の担当者', get: (o) => (o.log || []).filter((x) => /法人アカウント|拠点アカウント/.test(x.who))[0]?.who.replace(/（.*）/, '') ?? '' },
            { label: 'ES の変更日時', get: (o) => whenOf(o, 'es') }, { label: 'ES の変更の担当者', get: (o) => (o.log || []).filter((x) => /運営|ESキッチン/.test(x.who))[0]?.who.replace(/（.*）/, '') ?? '' },
            { label: 'オーダー数', type: 'int', get: (o) => C.sumBy(C.site(o.site), o.ym, o.q).total }, { label: '調整数', type: 'int', get: adjN }, { label: '調整率（%）', type: 'num', get: (o) => o.rate },
          ],
          /* 1行＝注文の1行（品番×便。注文の項目をくり返す） */
          source: { kind: 'dm.order.orders', id: (o) => o.no, childKey: 'lines' },
        })} />
        {canAct(api, 'applyAlt') && <Button variant="outline" size="lg" icon="GearSix" onClick={() => nav('/ops/menu/orders/alt')}>代替品設定</Button>}
      </>} />
      {done ? (
        <InlineMessage tone="success" title={'代替品設定 ' + done.id + ' を保存しました'}>
          <div>{done.msg}
            <table className="es-table ord-flow" style={{ marginTop: '0.571429rem' }}><tbody>{done.flow.map((f, i) => <tr key={i}><th style={{ whiteSpace: 'nowrap', textAlign: 'left' }}>{f[0]}</th><td>{f[1]}</td></tr>)}</tbody></table>
          </div>
        </InlineMessage>
      ) : null}
      <Card>
        {menu ? (
          <InlineMessage tone={closed ? 'warning' : 'info'} title={ymJa(qm) + 'サイクル（メニュー ' + menu.id + '・' + (closed ? '締切済・' + menu.status : 'オーダー受付中') + '）'}>
            {closed ? 'オーダー締切（' + fmtDate(menu.to) + '）を過ぎています。締切後の変更（代替品・欠品など）は ES が行い、ステータスは「ESキッチン入力済み」、法人の変更履歴に「締切後に ES が変更」と残ります。ただし発注締め日（B7・D7）を過ぎた注文は運営も編集できません（参照のみ。変更は代替品設定）。'
              : '受付期間 ' + fmtDate(menu.from) + '〜' + fmtDate(menu.to) + '。締切までに法人が登録しないと、自動注文で確定します（次回以降も適用 ON の拠点は AI の下書き、OFF の拠点は運営の標準数に拠点の設定をかけた数）。ES が代わりに登録・変更するとステータスは「ESキッチン入力済み」になります。'}
          </InlineMessage>
        ) : null}
        <SearchPanel sig={JSON.stringify(qd) + JSON.stringify(sort)} onSearch={() => { setQ({ ...qd, m: qd.m || defM }); setPg(1); setDone(null); }} onClear={() => { setQ({ m: qd.m || defM }); setQd({ m: qd.m || defM }); setSort({ k: 'upd', dir: 'desc' }); setPg(1); }}
          more={[
            <Select key="co" className="ord-msel" placeholder="コース" value={qd.course ?? ''} options={COURSES} onChange={qdSet('course')} />,
            <Select key="vm" placeholder="自販機" value={qd.vm ?? ''} options={['あり', 'なし']} onChange={qdSet('vm')} />,
            <Select key="dlv" placeholder="配送区分" value={qd.dlv ?? ''} options={DLV_KINDS} onChange={qdSet('dlv')} />,
            <Select key="p" className="ord-wsel" placeholder="商品名" value={qd.p ?? ''} options={[...prodIds].map((id) => ({ value: id, label: C.prod(id)?.name ?? id }))} onChange={qdSet('p')} />,
            /* 並べ替え：一覧の全列から選び、昇順・降順を切り替える（台帳 K） */
            <SortMenu key="so" options={SORTS.map((x) => [x.k, x.label])} value={sort.k} dir={sort.dir} onChange={(k, d) => { setSort({ k, dir: d }); setPg(1); }} />,
          ]}>
          <Field key="m">
            <div className="es-input es-select es-input--md">
              <select value={qd.m || defM} aria-label="対象年月" onChange={(e) => setQd({ ...qd, m: e.target.value })}>
                {months.map((m) => <option key={m} value={m}>{ymJa(m)}</option>)}
              </select>
              <Icon name="CaretDown" size={16} />
            </div>
          </Field>
          <TextField key="kw" className="es-grow ord-kw" icon="Search" placeholder="法人ID・名、拠点ID・名、プラン名、契約ID" value={qd.kw ?? ''} onChange={qdSet('kw')} />
          <Select key="st" className="ord-msel" placeholder="ステータス" value={qd.st ?? ''} options={ORD_STATUSES} onChange={qdSet('st')} />
        </SearchPanel>
        <Table cls="ord-wrap" empty="表示するデータがありません。"
          cols={[{ label: 'No', w: 48 }, { label: 'オーダーNo' }, { label: '法人名' }, { label: '拠点名' }, { label: 'プラン名' }, { label: 'コース' }, { label: '自販機', cls: 'c' }, { label: 'ステータス' }, { label: '配送区分' }, { label: '法人の登録' }, { label: 'ES の変更' }, { label: 'オーダー数', cls: 'r' }, { label: '調整数（調整率）', cls: 'r' }, { label: '操作', w: 64 }]}
          rows={shown.map((o, i) => {
            const s = C.site(o.site), t = C.sumBy(s, o.ym, o.q);
            /* 編集は、更新の権限があり、取消でなく、前半・後半とも発注締め日を過ぎていない注文だけ（受付簿 #264・#270） */
            const editable = canAct(api, 'saveOrder') && o.status !== '取消' && Object.keys(o.shut).length < C.dls(s, o.ym).length;
            return (
              <tr key={o.no}>
                <Td v={(cur - 1) * per + i + 1} />
                <td><TLink onClick={() => nav(`/ops/menu/orders/${o.no}`)}>{o.no}</TLink></td>
                <td>{s.corpName}<div className="od-small es-mono">{s.corp}</div></td>
                <td>{s.short}<div className="od-small es-mono">{s.id}</div></td>
                <td>{s.plan}プラン<div className="od-small es-mono">{s.planId}</div></td>
                <Td v={s.course.replace('ES', '')} />
                <Td v={isVm(s) ? '✓' : ''} cls="c" />
                <td>{o.status ? <Badge tone={ORD_TONE[o.status]}>{ordLabel(o.status)}</Badge> : null}</td>
                <Td v={s.dlvKind} />
                <td><WhoAt o={o} k="corp" /></td>
                <td><WhoAt o={o} k="es" /></td>
                <Td v={t.total + '個'} cls="r" />
                <Td v={rateTxt(o)} cls="r" />
                <td><RowActions label={o.no} onEdit={editable ? () => nav(`/ops/menu/orders/${o.no}/edit`) : undefined} /></td>
              </tr>
            );
          })}
        />
        <Pager total={list.length} page={cur} per={per} opts={[10, 20, 50]} onPage={setPg} onPer={(n) => { setPer(n); setPg(1); }} />
        {DEMO ? <p className="mo-note">一覧に削除は置いていません（注文は子契約から自動で作るため。Figma の削除アイコンは外した）。</p> : null}
      </Card>
    </>
  );
}
