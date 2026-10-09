'use client';

import { SortMenu } from '@/components/SortMenu';

import { useQuery } from '@/lib/ops/core/client';
import { DEMO } from '@/lib/demo';
import { COURSES, DLV_TONE, ymdW } from '@/lib/ops/menu/logic';
import type { MatOrder } from '@/lib/ops/menu/types';
import { useOpsCsvExport } from '../../_ui/csv';
import { Badge, Button, Card, CsvButton, Head, InlineMessage, DInp, Pager, RowActions, SearchPanel, Sel, Select, Table, TextField, TLink, Td } from '../_components/es';
import { useKeep, useMenu } from '../_components/MenuProvider';
import { api, Loading, useMaster } from '../_components/parts';
import { useCanAct } from '../../_ui/perm';

type MQ = { kw?: string; st?: string; kind?: string; course?: string; from?: string; to?: string };

/** 資材注文管理（一覧） */
export default function MaterialsPage() {
  const { nav } = useMenu();
  const canAct = useCanAct();
  const csvExport = useOpsCsvExport();
  const mm = useMaster();
  const { data: mats } = useQuery(api, 'mats');
  const [q, setQ] = useKeep<MQ>('mat.q', {});
  const [qd, setQd] = useKeep<MQ>('mat.qd', {});
  /* 並べ替え（一覧の全列。初期は注文日時の降順）・ページ（10・20・50件。初期10）：台帳 F・K */
  const [sort, setSort] = useKeep<{ k: string; dir: 'asc' | 'desc' }>('mat.sort', { k: 'at', dir: 'desc' });
  const [pg, setPg] = useKeep('mat.pg', 1);
  const [per, setPer] = useKeep('mat.per', 10);
  if (!mm || !mats) return <Loading />;
  const { C } = mm;
  const tot = (x: MatOrder) => Object.keys(x.q).reduce((a, k) => a + x.q[k], 0);
  const SORTS: { k: string; label: string; get: (x: MatOrder) => string | number }[] = [
    { k: 'no', label: '資材注文No', get: (x) => x.no }, { k: 'kind', label: '注文区分', get: (x) => x.kind }, { k: 'corp', label: '法人名', get: (x) => C.site(x.site).corpName },
    { k: 'site', label: '拠点名', get: (x) => C.site(x.site).short }, { k: 'at', label: '注文日時', get: (x) => x.at }, { k: 'due', label: '納品予定日', get: (x) => x.due },
    { k: 'qty', label: '資材', get: tot }, { k: 'dl', label: '配送データ', get: (x) => (x.st === '取消' ? '' : x.dlId) }, { k: 'st', label: '配送状態', get: (x) => x.st },
  ];
  const filtered = mats.filter((x) => {
    const s = C.site(x.site);
    if (q.kw && (x.no + s.corpName + s.short + s.id).indexOf(q.kw) < 0) return false;
    if (q.st && x.st !== q.st) return false;
    if (q.kind && x.kind !== q.kind) return false;
    if (q.course && s.course !== q.course) return false;
    if (q.from && x.due < q.from.replace(/-/g, '/')) return false;
    if (q.to && x.due > q.to.replace(/-/g, '/')) return false;
    return true;
  });
  const sk = SORTS.find((x) => x.k === sort.k) ?? SORTS[4];
  const list = [...filtered].sort((a, b) => {
    const p = sk.get(a), q = sk.get(b);
    const c = typeof p === 'number' && typeof q === 'number' ? p - q : String(p).localeCompare(String(q), 'ja');
    return c * (sort.dir === 'desc' ? -1 : 1) || a.no.localeCompare(b.no);
  });
  const pages = Math.max(1, Math.ceil(list.length / per)), cur = Math.min(pg, pages);
  const shown = list.slice((cur - 1) * per, cur * per);
  const qdSet = (k: keyof MQ) => (v: string) => setQd({ ...qd, [k]: v });

  return (
    <>
      <Head crumb={['メニュー管理', '資材注文管理']} title="資材注文管理" actions={<>
        <CsvButton onClick={() => csvExport<(typeof list)[number]>({
          screen: '資材注文管理', rows: list,
          filters: [{ label: '検索', value: q.kw ?? '' }, { label: '配送状態', value: q.st ?? '' }, { label: '注文区分', value: q.kind ?? '' }, { label: 'コース', value: q.course ?? '' },
            { label: '納品予定日', value: q.from || q.to ? `${q.from ?? ''}〜${q.to ?? ''}` : '' }],
          columns: [
            { label: '資材注文No', get: (x) => x.no }, { label: '注文区分', get: (x) => x.kind }, { label: '法人名', get: (x) => C.site(x.site).corpName }, { label: '拠点ID', get: (x) => x.site },
            { label: '拠点名', get: (x) => C.site(x.site).short }, { label: '注文日時', get: (x) => x.at }, { label: '納品予定日', get: (x) => x.due },
            { label: '配送データ', get: (x) => (x.st === '取消' ? '' : x.dlId) }, { label: '配送状態', get: (x) => x.st },
            /* 台帳 M-1「全部のデータを CSV で出せる」：法人ID・納品先住所・注文者・送り状番号・発送日・出荷指示の日時も */
            { label: '法人ID', get: (x) => C.site(x.site).corp }, { label: '納品先住所', get: (x) => C.site(x.site).addr }, { label: '注文者', get: (x) => x.by },
            { label: '送り状番号', get: (x) => x.inv }, { label: '発送日', get: (x) => x.shippedOn ?? '' }, { label: '出荷指示の日時', get: (x) => x.sent },
          ],
          source: { kind: 'dm.delivery.materialOrders', id: (x) => x.no, childKey: 'lines' },
        })} />
        {canAct(api, 'createMat') && <Button icon="Plus" size="lg" onClick={() => nav('/ops/menu/materials/new')}>新規登録</Button>}
      </>} />
      <Card>
        <InlineMessage tone="info" title="状態は資材便の配送データから表示します">
          資材の注文を確定するたびに配送データ（資材便）を作ります。出荷指示CSV（THOMAS）・送り状用CSV（ヤマト）は「配送管理 ＞ 出荷・配送管理 ＞ 出荷指示・取込」で出します。ピッキングは倉庫で行うため、この画面では記録しません。資材はいつでも注文でき、納品予定日のサイクル月の1回目は料金に含み、2回目以降は「資材の追加配送」（OP000036）を子契約に付けます（初期セットは数えない・お試しの拠点には付けない）。
        </InlineMessage>
        <SearchPanel sig={JSON.stringify(qd) + JSON.stringify(sort)} onSearch={() => { setQ({ ...qd }); setPg(1); }} onClear={() => { setQ({}); setQd({}); setSort({ k: 'at', dir: 'desc' }); setPg(1); }}
          more={[
            <div key="dr" className="mo-range mo-range--s">
              <span className="od-small">納品予定日</span>
              <DInp value={qd.from ?? ''} onChange={(e) => qdSet('from')(e.target.value)} aria-label="納品予定日から" />
              <span>〜</span>
              <DInp value={qd.to ?? ''} onChange={(e) => qdSet('to')(e.target.value)} aria-label="納品予定日まで" />
            </div>,
            <Select key="co" placeholder="コース" value={qd.course ?? ''} options={COURSES} onChange={qdSet('course')} />,
            /* 並べ替え：一覧の全列から選び、昇順・降順を切り替える（台帳 K） */
            <SortMenu key="so" options={SORTS.map((x) => [x.k, x.label])} value={sort.k} dir={sort.dir} onChange={(k, d) => { setSort({ k, dir: d }); setPg(1); }} />,
          ]}>
          <TextField key="kw" className="es-grow" icon="Search" placeholder="資材注文No、法人名、拠点名" value={qd.kw ?? ''} onChange={qdSet('kw')} />
          <Select key="st" placeholder="配送状態" value={qd.st ?? ''} options={['出荷待', '出荷指示済', '出荷済', '納品済', '取消']} onChange={qdSet('st')} />
          <Select key="k" placeholder="注文区分" value={qd.kind ?? ''} options={['通常注文', '初期セット']} onChange={qdSet('kind')} />
        </SearchPanel>
        <Table cls="ord-wrap" empty="表示するデータがありません。"
          cols={[{ label: 'No', w: 48 }, { label: '資材注文No' }, { label: '注文区分' }, { label: '法人名' }, { label: '拠点名' }, { label: '注文日' }, { label: '納品予定日' }, { label: '資材', cls: 'r' }, { label: '配送データ' }, { label: '配送状態' }, { label: '操作', w: 64 }]}
          rows={shown.map((x, i) => {
            const s = C.site(x.site), n = Object.keys(x.q).length, tt = tot(x);
            return (
              <tr key={x.no}>
                <Td v={(cur - 1) * per + i + 1} />
                <td><TLink onClick={() => nav(`/ops/menu/materials/${x.no}`)}>{x.no}</TLink></td>
                <td><Badge tone={x.kind === '初期セット' ? 'primary' : 'neutral'}>{x.kind}</Badge></td>
                <Td v={s.corpName} /><Td v={s.short} />
                <Td v={x.at.slice(0, 10)} cls="mo-sm" />
                <Td v={ymdW(x.due)} />
                <td className="r">{n + '種類・' + tt}{(x.nth ?? 0) >= 2 && !x.trial ? <div><Badge tone="warning">{x.nth}回目</Badge></div> : null}</td>
                <Td v={x.st === '取消' ? '—' : x.dlId} cls="es-mono" />
                <td><Badge tone={DLV_TONE[x.st]}>{x.st}</Badge></td>
                <td>{x.st !== '取消' && canAct(api, 'saveMat') ? <RowActions label={x.no} onEdit={() => nav(`/ops/menu/materials/${x.no}/edit`)} /> : null}</td>
              </tr>
            );
          })}
        />
        <Pager total={list.length} page={cur} per={per} opts={[10, 20, 50]} onPage={setPg} onPer={(n) => { setPer(n); setPg(1); }} />
      </Card>
    </>
  );
}
