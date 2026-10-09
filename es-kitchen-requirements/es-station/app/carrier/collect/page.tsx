'use client';

import dmCarrierArea from '@/lib/domain/areas/carrier';
import { domainApi } from '@/lib/domain/client';
import { CarrierCsvExport } from '../_ui/csv';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import carrier from '@/lib/carrier/area';
import { addDaysIso, fmtD, isoOf } from '@/lib/carrier/logic';
import { DEMO } from '@/lib/demo';
import { areaApi, useQuery } from '@/lib/ops/core/client';
import { today } from '@/lib/supplier/dates';
import { Icon } from '../_ui/Icon';
import { useCarrierSignedIn } from '../_ui/CarrierProvider';
import { Crumb, Loading, Modal, ModalHead, Pager, Unapplied } from '../_ui/parts';
import { DateInput } from '@/components/DateInput';

const dmCarrier = domainApi(dmCarrierArea);

/** 集金管理（元の collect()・OW_SCHED_001）：配送スタッフごとの集金・駐車の合計と CSV 出力（共通の仕組み） */
export default function CarrierCollect() {
  const { company, toast } = useCarrierSignedIn();
  const router = useRouter();
  const { data } = useQuery(areaApi(carrier), 'deliveries', { company });
  const t = isoOf(today());
  const F0 = { from: addDaysIso(t, -20), to: addDaysIso(t, 10) };
  /* 期間・キーワードは手元（rangeD・kwIn）に持ち、「検索」か Enter で効かせる */
  const [range, setRange] = useState(F0);
  const [rangeD, setRangeD] = useState(F0);
  const [kwIn, setKwIn] = useState('');
  const [kw, setKw] = useState('');

  if (!data) return <><Crumb items={[['ホーム', '/carrier'], '集金管理']} /><h1 className="ptitle">集金管理</h1><Loading /></>;
  const { deliveries: dels, staff } = data;
  // RV-CARRIER-20261002 K-e：担当の配送がなければ 0 円（表は「—」）
  const rows = staff.filter((s) => !kw || (s.id + s.name).includes(kw)).map((s) => {
    const ds = dels.filter((d) => d.staff === s.id);
    return { ...s, n: ds.length, cash: ds.reduce((a, d) => a + d.cash, 0), park: ds.reduce((a, d) => a + d.park, 0) };
  });
  const tc = rows.reduce((a, r) => a + r.cash, 0), tp = rows.reduce((a, r) => a + r.park, 0);

  /* CSV出力（共通の仕組み）：期間・配送スタッフの条件のとおりの配送ごとの集金・駐車。支払の明細（月）は委託の支払額（納品したときの区間の額）も */
  const name = (id: string) => staff.find((s) => s.id === id)?.name ?? '';
  const csvRows = () => dels.filter((d) => d.staff && d.date >= range.from && d.date <= range.to && (!kw || (d.staff + name(d.staff)).includes(kw)));
  const filters = [{ label: '期間', value: `${range.from}〜${range.to}` }, { label: '配送スタッフ', value: kw }];
  const month = range.from.slice(0, 7);
  type Mon = ReturnType<typeof dmCarrierArea.queries.monthly>['rows'][number];
  return (
    <>
      <Crumb items={[['ホーム', '/carrier'], '集金管理']} />
      <div className="phead"><h1 className="ptitle">集金管理</h1>
        <div style={{ display: 'flex', gap: '0.857143rem', flexWrap: 'wrap' }}>
          <CarrierCsvExport<Mon> className="btn out" screen="支払の明細" filters={[{ label: '月', value: month }]}
            rows={async () => (await dmCarrier.query('monthly', { carrierId: company, month })).rows}
            columns={[{ label: '納品日', get: (r) => r.date }, { label: '配送ID', get: (r) => r.deliveryId }, { label: '届け先', get: (r) => r.branch }, { label: '配送スタッフID', get: (r) => r.driverId },
              { label: '配送スタッフ名', get: (r) => r.driver }, { label: '納品数', type: 'int', get: (r) => r.qty }, { label: '支払額（税抜）', type: 'money', get: (r) => r.feeYen },
              { label: '集金額（税込）', type: 'money', get: (r) => r.cashYen }, { label: '駐車料金（税込）', type: 'money', get: (r) => r.parkingYen }]}>
            <Icon name="dl" />支払の明細（{month}）
          </CarrierCsvExport>
          <CarrierCsvExport<(typeof dels)[number]> className="btn pri" screen="集金管理" filters={filters} rows={csvRows}
            columns={[{ label: '配送日', get: (d) => d.date }, { label: '配送ID', get: (d) => d.no }, { label: '配送スタッフID', get: (d) => d.staff ?? '' }, { label: '配送スタッフ名', get: (d) => name(d.staff ?? '') },
              { label: '配送先名', get: (d) => d.to }, { label: '集金金額（税込）', type: 'money', get: (d) => d.cash }, { label: '駐車料金（税込）', type: 'money', get: (d) => d.park }]} />
        </div>
      </div>
      <div className="panel">
        <form className="search-row" onSubmit={(e) => { e.preventDefault(); setKw(kwIn.trim()); setRange(rangeD); }}>
          <DateInput className="inp" value={rangeD.from} onChange={(e) => setRangeD({ ...rangeD, from: e.target.value })} style={{ width: '12.142857rem', flex: 'none' }} aria-label="開始日" /><span>〜</span>
          <DateInput className="inp" value={rangeD.to} onChange={(e) => setRangeD({ ...rangeD, to: e.target.value })} style={{ width: '12.142857rem', flex: 'none' }} aria-label="終了日" />
          <div className="inp" style={{ maxWidth: '18.571429rem' }}><Icon name="search" /><input className="bare" placeholder="配送スタッフID・名" value={kwIn} onChange={(e) => setKwIn(e.target.value)} /></div>
          <span style={{ flex: 1 }} />
          <button type="button" className="btn out" onClick={() => { setKw(''); setKwIn(''); setRange(F0); setRangeD(F0); }}>クリア</button><Unapplied show={kwIn.trim() !== kw || rangeD.from !== range.from || rangeD.to !== range.to} /><button className="btn pri">検索</button>
        </form>
        <div className="stat"><div><small>集金合計金額</small><b className="num">{tc.toLocaleString('ja-JP')}円</b></div><div><small>駐車合計料金</small><b className="num">{tp.toLocaleString('ja-JP')}円</b></div></div>
        <div className="tbl-wrap">
          <table className="tbl">
            <thead><tr><th>No</th><th>配送スタッフID</th><th>配送スタッフ名</th><th className="r">集金合計金額（税込）</th><th className="r">駐車合計料金（税込）</th></tr></thead>
            <tbody>{rows.map((r, i) => (
              <tr key={r.id}>
                <td className="num">{i + 1}</td><td>{r.id}</td>
                <td><button type="button" className="lnk" onClick={() => router.push(`/carrier/staff/${r.id}?tab=deliv`)}>{r.name}</button></td>
                <td className="num r">{r.n ? r.cash.toLocaleString('ja-JP') : '—'}</td>
                <td className="num r">{r.n ? r.park.toLocaleString('ja-JP') : '—'}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
        <Pager text={`${rows.length}件中 1-${rows.length}件`} />
      </div>
    </>
  );
}
