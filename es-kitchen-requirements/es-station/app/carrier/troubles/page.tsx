'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import carrier from '@/lib/carrier/area';
import { addDaysIso, cycOf, fmtD, fmtDT, isoOf } from '@/lib/carrier/logic';
import { TRB_KINDS } from '@/lib/carrier/seed';
import { areaApi, useQuery } from '@/lib/ops/core/client';
import { today } from '@/lib/supplier/dates';
import { Icon } from '../_ui/Icon';
import { useCarrierSignedIn } from '../_ui/CarrierProvider';
import { Crumb, Loading, stfName, Unapplied } from '../_ui/parts';
import { DateInput } from '@/components/DateInput';
import { fmtDate, fmtYm } from '@/lib/format/date';
import { carrierCls } from '@/lib/format/status';

/** 今日のサイクル（月曜始まりの4週）の初日と最終日 */
function cycleRange(t: string) {
  const c = cycOf(t);
  if (!c) return { from: '', to: '', mo: '' };
  const n = 'ABCD'.indexOf(c.lab[0]) * 7 + Number(c.lab.slice(1)) - 1;
  const from = addDaysIso(t, -n);
  return { from, to: addDaysIso(from, 27), mo: c.mo };
}

/** トラブル一覧（RV2-CARRIER-20261002 で足した画面）：配送スタッフがドライバーアプリで報告したトラブル */
export default function CarrierTroubles() {
  const { company } = useCarrierSignedIn();
  const router = useRouter();
  const { data } = useQuery(areaApi(carrier), 'troubles', { company });
  const t = isoOf(today());
  const cyc = cycleRange(t);
  const TF0 = { from: cyc.from, to: cyc.to, st: '', kind: '' };
  const [f, setF] = useState(TF0);
  const [draft, setDraft] = useState(TF0);

  if (!data) return <><Crumb items={[['ホーム', '/carrier'], 'トラブル']} /><h1 className="ptitle">トラブル</h1><Loading /></>;
  const all = data.troubles;
  const list = all.filter((x) => { const d = x.at.slice(0, 10); return (!f.from || d >= f.from) && (!f.to || d <= f.to) && (!f.st || x.st === f.st) && (!f.kind || x.kind === f.kind); })
    .sort((a, b) => b.at.localeCompare(a.at));
  const openN = all.filter((x) => x.st === '対応中').length;
  const open = (no: string) => { if (data.deliveries.some((d) => d.no === no)) router.push(`/carrier/deliveries/${no}?tab=trouble`); };
  return (
    <>
      <Crumb items={[['ホーム', '/carrier'], 'トラブル']} />
      <h1 className="ptitle">トラブル</h1>
      {openN > 0 && <div className="alert"><Icon name="warn" /><span><b>対応中のトラブルが {openN}件あります。</b>対応は運営（ESキッチン）が決めます。決まると「解決済み」になります。</span></div>}
      <div className="panel">
        <form className="search-row" onSubmit={(e) => { e.preventDefault(); setF(draft); }}>
          <span style={{ fontSize: '0.928571rem', color: 'var(--text-2)' }}>受付日</span>
          <DateInput className="inp" value={draft.from} onChange={(e) => setDraft({ ...draft, from: e.target.value })} aria-label="開始日" style={{ width: '12.142857rem', flex: 'none' }} /><span>〜</span>
          <DateInput className="inp" value={draft.to} onChange={(e) => setDraft({ ...draft, to: e.target.value })} aria-label="終了日" style={{ width: '12.142857rem', flex: 'none' }} />
          <select className="inp" aria-label="対応状況" style={{ width: '10.714286rem', flex: 'none' }} value={draft.st} onChange={(e) => setDraft({ ...draft, st: e.target.value })}><option value="">対応状況</option>{['対応中', '解決済'].map((s) => <option key={s}>{s}</option>)}</select>
          <select className="inp" aria-label="種類" style={{ width: '13.571429rem', flex: 'none' }} value={draft.kind} onChange={(e) => setDraft({ ...draft, kind: e.target.value })}><option value="">種類</option>{TRB_KINDS.map((s) => <option key={s}>{s}</option>)}</select>
          <span style={{ flex: 1 }} />
          <button type="button" className="btn out" onClick={() => { setF(TF0); setDraft(TF0); }}>クリア</button><Unapplied show={JSON.stringify(draft) !== JSON.stringify(f)} /><button className="btn pri">検索</button>
        </form>
        <div className="tbl-wrap">
          <table className="tbl">
            <thead><tr><th>No</th><th>受付日時</th><th>配送No</th><th>届け先</th><th>種類</th><th>内容</th><th>報告者（配送スタッフ）</th><th>対応状況</th></tr></thead>
            <tbody>
              {list.map((x, i) => {
                const d = data.deliveries.find((y) => y.no === x.no);
                return (
                  <tr key={x.id} tabIndex={0} style={{ cursor: 'pointer' }} title={`${x.no} の配送詳細を開く`} onClick={() => open(x.no)} onKeyDown={(e) => { if (e.key === 'Enter') open(x.no); }}>
                    <td className="num">{i + 1}</td><td className="num" style={{ whiteSpace: 'nowrap' }}>{fmtDT(x.at)}</td><td style={{ whiteSpace: 'nowrap' }}><span className="lnk">{x.no}</span></td>
                    <td>{d?.to || '—'}</td><td style={{ whiteSpace: 'nowrap' }}>{x.kind}</td><td style={{ whiteSpace: 'normal', minWidth: '18.571429rem' }}>{x.note}</td>
                    <td>{stfName(data.staff, x.staff)}</td><td><span className={`badge ${carrierCls(x.st, 'b-amber')}`}>{x.st}</span></td>
                  </tr>
                );
              })}
              {!list.length && <tr><td colSpan={8} className="empty">条件に一致するトラブルはありません。</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="pager"><span>{list.length}件中 {list.length ? 1 : 0}-{list.length}件</span></div>
        <p className="hint">
          ※配送スタッフがドライバーアプリから報告したトラブルです。種類はアプリと同じです（荷物受取時：箱数不足・誤配送・荷物破損・その他／配達時：商品不足・誤配送・交通渋滞・事故・不在・連絡不可・その他）。陳列（検品）の差異・未配送は自動で報告されます。<br />
          ※行を押すと、その配送の配送詳細（トラブル）を開きます。対応（分納・再配送・取消）は運営（ESキッチン）が決めます。<br />
          ※初期の期間は今日のサイクル（{fmtYm(`${t.slice(0, 4)}-${parseInt(cyc.mo, 10)}`)} サイクル {fmtDate(cyc.from)}〜{fmtDate(cyc.to)}）です。
        </p>
      </div>
    </>
  );
}
