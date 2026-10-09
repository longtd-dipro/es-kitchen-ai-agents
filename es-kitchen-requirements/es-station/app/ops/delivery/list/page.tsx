'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { DEMO } from '@/lib/demo';
import { useQuery } from '@/lib/ops/core/client';
import { LIST_OPTS, LIST_PERIOD } from '@/lib/ops/delivery/constants';
import { LIST_SORTS, type ListFilter } from '@/lib/ops/delivery/logic';
import { pageOf, usePager } from '@/lib/ui/paging';
import { useOpsCsvExport } from '../../_ui/csv';
import { useOps } from '../../_ui/OpsProvider';
import { useScreenCan } from '../../_ui/perm';
import { api } from '../_components/api';
import { Badge, Button, Card, InlineMessage, LinkButton, PageHead, Pagination, SearchPanel, SegmentedControl, Select, Switch, TextField } from '../_components/kit';

/*
 * 出荷・配送管理（部品 16 の DeliveryList）。
 * RV3-OPS-20261002 #4：絞り込みが効く・出荷日の昇順・「出荷」「納品・配送」の切替で期間を出荷日・納品日のどちらで絞るか。
 */

const EMPTY = { sq1: '', sq2: '', sq3: '', s1: '', s2: '', s2b: '', s3: '', s5: '', s7: '', s8: '', s9: '', s10: '', s11: '', sort: '' };

export default function Page() {
  const { toast } = useOps();
  const canEdit = useScreenCan()('update');
  const router = useRouter();
  const [basis, setBasis] = useState<'ship' | 'dlv'>('ship');
  const [period, setPeriod] = useState(LIST_PERIOD);
  const [f, setF] = useState(EMPTY);
  const [args, setArgs] = useState<ListFilter>({});
  const [searched, setSearched] = useState(false);
  const [route, setRoute] = useState(false);
  const [unassigned, setUnassigned] = useState(false);
  const pager = usePager();
  const { data } = useQuery(api, 'list', args);
  const { data: opts } = useQuery(api, 'listOpts');
  const rows = data ?? [];
  const pg = pageOf(pager, rows);
  const set = (k: keyof typeof EMPTY) => (v: string) => setF({ ...f, [k]: v });

  const search = () => {
    const a: ListFilter = {
      basis, from: period.from, to: period.to, q: f.sq1, addr: f.sq2, slip: f.sq3, course: f.s1, status: f.s2, trouble: f.s2b as ListFilter['trouble'], vending: f.s3 as ListFilter['vending'],
      method: f.s5, wh: f.s7, carrier: f.s8, hub: f.s9, staff: f.s10, temp: f.s11, unassigned, sort: f.sort as ListFilter['sort'],
    };
    setArgs(a); setSearched(true); pager.setPage(1);
    api.query('list', a).then((r) => toast(`検索しました（${basis === 'dlv' ? '納品日' : '出荷日'}で絞り込み・${r.length}件）`));
  };
  const clear = () => { setPeriod(LIST_PERIOD); setF(EMPTY); setUnassigned(false); setArgs({}); setSearched(false); pager.setPage(1); };
  /* CSV出力：検索条件のとおりの全件・配送データ（dm.delivery.deliveries）の全部の項目 */
  const csvExport = useOpsCsvExport();
  const csv = () => csvExport<(typeof rows)[number]>({
    screen: '出荷・配送管理', rows,
    filters: searched ? [
      { label: args.basis === 'dlv' ? '期間（納品日）' : '期間（出荷日）', value: `${args.from ?? ''}〜${args.to ?? ''}` },
      { label: '検索', value: args.q ?? '' }, { label: '住所など', value: args.addr ?? '' }, { label: '送り状番号', value: args.slip ?? '' }, { label: 'コース', value: args.course ?? '' },
      { label: '状態', value: args.status ?? '' }, { label: 'トラブル', value: args.trouble ?? '' }, { label: '自販機', value: args.vending ?? '' }, { label: '配送方法', value: args.method ?? '' },
      { label: '温度帯', value: args.temp ?? '' }, { label: 'ピッキング倉庫', value: args.wh ?? '' }, { label: '委託配送会社', value: args.carrier ?? '' }, { label: '中継倉庫', value: args.hub ?? '' },
      { label: '配送スタッフ', value: args.staff ?? '' }, { label: 'ドライバー未割当', value: args.unassigned ? 'のみ' : '' }, { label: '並び', value: LIST_SORTS.find((x) => x[0] === (args.sort || 'ship'))?.[1] ?? '' },
    ] : [],
    columns: [
      { label: '配送No', get: (r) => r.id }, { label: '出荷日（実績）', get: (r) => r.shipped }, { label: '拠点名', get: (r) => r.site }, { label: '温度帯', get: (r) => r.temp }, { label: '配送方法', get: (r) => r.method },
      { label: '状態', get: (r) => r.st }, { label: '変更申請', get: (r) => r.cr }, { label: '出荷予定日', get: (r) => r.ship }, { label: '納品日', get: (r) => r.dlv }, { label: '配送スタッフ（区間）', get: (r) => r.staff },
    ],
    source: { kind: 'dm.delivery.deliveries', id: (r) => r.id },
  });

  const sel = (k: keyof typeof EMPTY, ph: string, opts: string[]) => <Select key={k} placeholder={ph} options={opts} value={f[k]} onChange={set(k)} />;
  return (
    <>
      <PageHead crumbs={['配送管理', '出荷・配送管理']} title="出荷・配送管理" actions={<>
        <LinkButton href="/ops/delivery/list/ship-orders" variant="outline">出荷指示・取込</LinkButton>
        <Button variant="outline" onClick={csv}>CSV出力</Button>
      </>} />
      <div className="dnav" style={{ marginTop: 0 }}>
        <span className="lbl" style={{ margin: '0 0.285714rem 0 0' }}>期間</span>
        <TextField date placeholder="開始日" value={period.from} onChange={(from) => setPeriod({ ...period, from })} style={{ width: '12.571429rem' }} onEnter={search} />
        <span style={{ color: 'var(--text-low)' }}>〜</span>
        <TextField date placeholder="終了日" value={period.to} onChange={(to) => setPeriod({ ...period, to })} style={{ width: '12.571429rem' }} onEnter={search} />
        <span className="note">「出荷」「納品・配送」の切替で、出荷日と納品日のどちらで期間を絞るかが変わります</span>
      </div>
      <SearchPanel columns={6} first={3} sig={JSON.stringify([basis, period, f, unassigned])} onSearch={search} onClear={clear}>
        {[
          <SegmentedControl key="b" size="sm" items={[{ value: 'ship' as const, label: '出荷' }, { value: 'dlv' as const, label: '納品・配送' }]} value={basis} onChange={setBasis} label="基準" />,
          <TextField key="sq1" className="es-span-2" icon="Search" placeholder="法人ID・名、拠点ID・名、契約ID" value={f.sq1} onChange={set('sq1')} />,
          <TextField key="sq2" className="es-span-2" icon="Search" placeholder="住所、郵便番号、電話番号、担当者電話番号" value={f.sq2} onChange={set('sq2')} />,
          sel('s1', 'コース', opts?.course ?? []), sel('s2', 'ステータス', opts?.status ?? LIST_OPTS.status), sel('s2b', 'トラブル', LIST_OPTS.trouble), sel('s3', '自販機', LIST_OPTS.vending),
          sel('s11', '温度帯', opts?.temp ?? []), sel('s5', '配送方法', opts?.method ?? LIST_OPTS.method), sel('s7', 'ピッキング倉庫', opts?.wh ?? []),
          sel('s8', '委託配送会社', opts?.carrier ?? []), sel('s9', '中継倉庫', opts?.hub ?? []),
          <TextField key="sq3" icon="Search" placeholder="送り状番号" value={f.sq3} onChange={set('sq3')} />,
          sel('s10', '配送スタッフID・名', opts?.staff ?? []),
          <Switch key="un" label="ドライバー未割当のみ" checked={unassigned} onChange={setUnassigned} />,
          <Select key="sort" label="並び" options={LIST_SORTS.map(([value, label]) => ({ value, label }))} value={f.sort || 'ship'} onChange={set('sort')} />,
        ]}
      </SearchPanel>
      <Card>
        <InlineMessage tone="info">この期間には予定が 1,284件あります（2026-11-09 以降）。予定は配送データになるまでこの一覧に出ません。<Link href="/ops/delivery/schedule?view=day&d=2026-10-05">スケジュールの日表示で見る ›</Link></InlineMessage>
        <div className="tools">
          <span><b style={{ color: 'var(--text-high)' }}>{rows.length}件</b>（{LIST_SORTS.find((x) => x[0] === (args.sort || 'ship'))?.[1]}）</span>
          {/* 元のデモでも表示の切替だけ（経路の列はまだない） */}
          <Switch label="経路の列を表示" checked={route} onChange={setRoute} />
        </div>
        <div className="es-table-wrap">
          <table className="es-table">
            <thead><tr><th style={{ width: '4rem' }}>No</th><th>配送No</th><th>拠点名（温度帯）</th><th>配送方法</th><th>状態</th><th>変更申請</th><th>出荷予定日</th><th>納品日</th><th>配送スタッフ（区間）</th><th style={{ width: '5.142857rem', textAlign: 'center' }}>操作</th></tr></thead>
            <tbody>
              {pg.rows.map((r, i) => (
                <tr key={r.id} className={r.cls}>
                  <td>{pg.start + i + 1}</td>
                  <td className="es-mono"><Link href={`/ops/delivery/list/${r.id}${r.go === 'trouble' ? '?tab=trb' : ''}`}>{r.id}</Link>{r.shipped && <span className="sub">出荷 {r.shipped}（実績）</span>}</td>
                  <td className="w">{r.site}<span className="sub">{r.sub}</span></td>
                  <td>{r.method}</td>
                  <td><Badge tone={r.stTone}>{r.st}</Badge></td>
                  <td>{r.cr}</td>
                  <td>{r.ship}</td>
                  <td>{r.dlv}</td>
                  <td style={r.staffMuted ? { color: 'var(--text-low)' } : undefined}>{r.staff}</td>
                  <td style={{ textAlign: 'center' }}>{r.canEdit && canEdit && <Button variant="ghost" size="sm" icon="PencilSimple" aria-label="編集" onClick={() => router.push(`/ops/delivery/list/${r.id}/edit`)} />}</td>
                </tr>
              ))}
              {!rows.length && <tr className="rv3-empty"><td colSpan={10} style={{ textAlign: 'center', color: 'var(--text-low)', padding: '1.714286rem' }}>条件に合うデータはありません</td></tr>}
            </tbody>
          </table>
        </div>
        <Pagination {...pg.props} />
      </Card>
    </>
  );
}
