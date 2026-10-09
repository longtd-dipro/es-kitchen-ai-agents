'use client';

import { useState } from 'react';
import { DEMO } from '@/lib/demo';
import { useQuery } from '@/lib/ops/core/client';
import { slashW } from '@/lib/ops/delivery/logic';
import type { Material } from '@/lib/ops/delivery/types';
import { Icon } from '../../_ui/Icon';
import { OpsCsvExport } from '../../_ui/csv';
import { UnappliedMark } from '../../_general/list';
import { useOps } from '../../_ui/OpsProvider';
import { Field, PageHead } from '../../_ui/ui';
import { api } from '../_components/api';
import { downloadCsv } from '../_components/csv';
import { fmtAuto, fmtDateW } from '@/lib/format/date';
import { todayIso } from '@/lib/ops/general/logic';

/*
 * 資材の集計（本体 main_script2.js の renderMatSum）。資材は ES事務所でピッキングしてヤマト運輸で直送する（THOMAS 連携なし・2026/10/01 A2）。
 * 出荷日ごとに、資材の合計（ピッキングの数）と配送ごとの中身を出す。
 */

export default function Page() {
  const { toast } = useOps();
  const { data } = useQuery(api, 'matShipments');
  const all = data ?? [];
  /* 出荷日は手元（dateD）で選び、「検索」で効かせる（2026/10/03 決定） */
  const [dateA, setDate] = useState('');
  const [dateDraft, setDateD] = useState('');
  const dates0 = [...new Set(all.map((x) => x.date))].sort();
  /* 初期値は今日以降で一番近い出荷日（なければ最初の日） */
  const date = dateA || (dates0.find((d) => d >= todayIso()) ?? dates0[0] ?? '');
  const dateD = dateDraft || date;
  const list = all.filter((x) => x.date === date);
  const tot: Record<string, { mm: Material; q: number; n: number }> = {};
  list.forEach((x) => x.lines.forEach(([mm, q]) => { tot[mm.id] ??= { mm, q: 0, n: 0 }; tot[mm.id].q += q; tot[mm.id].n++; }));
  const T = Object.values(tot);
  const dates = [...new Set(all.map((x) => x.date))];
  const csv = () => {
    downloadCsv(`yamato_material_${date.replace(/-/g, '')}.csv`, ['配送No', '拠点', 'お届け予定日', '中身'], list.map((x) => [x.dl, x.site, x.deliv, x.lines.map(([mm, q]) => mm.name + ' ' + q).join('、')]));
    toast(`ヤマト運輸の送り状CSV（${list.length}件）を出力しました${DEMO ? '（デモ）' : ''}`);
  };
  return (
    <>
      <PageHead crumbs={['配送管理', '資材の集計']} title="資材の集計（ES事務所）">
        {/* CSV出力（この画面の一覧：1行＝配送の1資材）。下の「送り状CSV（ヤマト）」はヤマトへの連携の形のまま */}
        <OpsCsvExport<{ x: (typeof list)[number]; mm: Material; q: number }> screen="資材の集計" filters={[{ label: '出荷日', value: date }]}
          rows={() => list.flatMap((x) => x.lines.map(([mm, q]) => ({ x, mm, q })))}
          columns={[{ label: '配送No', get: (r) => r.x.dl }, { label: '拠点', get: (r) => r.x.site }, { label: '出荷日', get: (r) => r.x.date }, { label: 'お届け予定日', get: (r) => r.x.deliv },
            { label: '資材ID', get: (r) => r.mm.id }, { label: '資材名', get: (r) => r.mm.name }, { label: '数', type: 'int', get: (r) => r.q }]}
          source={{ kind: 'dm.delivery.deliveries', id: (r) => r.x.dl }} />
        <button className="btn out lg" onClick={csv}><Icon name="down" />送り状CSV（ヤマト）</button>
        <button className="btn pri lg" onClick={() => window.print()}>印刷</button>
      </PageHead>
      <div className="card">
        <div className="notice"><Icon name="bell" /><span>資材は <b>ES事務所でピッキングしてヤマト運輸で直送</b>します（倉庫マスタ WH00004・THOMAS 連携なし。2026-10-01 お客様回答 A2）。出荷日ごとに、資材の合計（ピッキングの数）と配送ごとの中身を出します。印刷はブラウザの印刷で1ページに収まる表（A3）。月の2回目以降の注文には資材の追加配送（OP000036・仮 1,000円）が付きます。</span></div>
        <div className="fg c2" style={{ marginBottom: '0.857143rem' }}>
          <Field label="出荷日"><select className="sel" aria-label="出荷日" value={dateD} onChange={(e) => setDateD(e.target.value)}>{dates.map((d) => <option key={d} value={d}>{fmtDateW(d)}</option>)}</select></Field>
          <Field label="ピッキング場所"><input className="inp" disabled value="WH00004 ES事務所（資材）" /></Field>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '0.571429rem', marginBottom: '0.857143rem' }}>
          <UnappliedMark show={dateD !== date} />
          <button className="btn out" onClick={() => { setDate(''); setDateD(''); }}>クリア</button>
          <button className="btn pri" onClick={() => setDate(dateD)}>検索</button>
        </div>
        <div className="sec-h" style={{ marginBottom: '0.571429rem' }}><h2>資材の合計（{list.length}件の配送）</h2></div>
        <div className="tbl-wrap">
          <table className="tbl">
            <thead><tr><th>資材ID</th><th>資材名</th><th className="num">合計数</th><th className="num">配送の件数</th></tr></thead>
            <tbody>
              {T.map((t) => <tr key={t.mm.id}><td className="mono">{t.mm.id}</td><td>{t.mm.name}</td><td className="num"><b>{t.q}</b></td><td className="num">{t.n}</td></tr>)}
              {!T.length && <tr><td colSpan={4} className="empty">この日の資材の配送はありません</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="sec-h" style={{ margin: '1.142857rem 0 0.571429rem' }}><h2>配送ごとの中身</h2></div>
        <div className="tbl-wrap">
          <table className="tbl">
            <thead><tr><th>配送No</th><th>拠点</th><th>種類</th><th>中身</th><th>納品予定日</th><th>料金（税抜）</th></tr></thead>
            <tbody>
              {list.map((x) => (
                <tr key={x.dl}>
                  <td className="mono">{x.dl}</td><td>{x.site}</td><td style={{ fontSize: '0.928571rem' }}>{x.kind}</td>
                  <td style={{ fontSize: '0.928571rem' }}>{x.lines.map(([mm, q]) => mm.name + ' ' + q).join('、')}</td><td>{fmtAuto(x.deliv)}</td>
                  <td style={{ fontSize: '0.928571rem' }}>{x.fee || <span className="muted">—</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="muted" style={{ fontSize: '0.857143rem', margin: '0.571429rem 0 0' }}>{DEMO ? '見本のデータです。' : ''}資材の配送データは注文（カート）を確定したたびに作り、同じ拠点・同じ納品日・出荷前なら1件にまとめます（統合 7-5）。状況はヤマトの送り状番号で追跡ページを開いて確かめます。</p>
      </div>
    </>
  );
}
