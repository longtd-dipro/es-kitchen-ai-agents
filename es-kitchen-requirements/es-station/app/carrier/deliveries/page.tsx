'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import carrier from '@/lib/carrier/area';
import { addDaysIso, dAssignable, dLockReason, DST, fmtD, isEve, isoOf } from '@/lib/carrier/logic';
import { WH } from '@/lib/carrier/seed';
import type { DeliveryView, Staff, Temp } from '@/lib/carrier/types';
import { areaApi, useQuery } from '@/lib/ops/core/client';
import { today } from '@/lib/supplier/dates';
import { Icon } from '../_ui/Icon';
import { useCarrierSignedIn } from '../_ui/CarrierProvider';
import { Crumb, DstBadge, Loading, Modal, ModalHead, Pager, Tags, Unapplied } from '../_ui/parts';
import { pageOf, usePager } from '@/lib/ui/paging';
import { CarrierCsvExport } from '../_ui/csv';
import { DateInput } from '@/components/DateInput';
import { fmtMd } from '@/lib/format/date';

/** 検索条件。期間は 基準（納品日／出荷日）の日付で絞る。拠点・住所・配送No は部分一致 */
type Filter = {
  temp: string; st: string; kw: string; unset: boolean;
  from: string; to: string; basis: 'date' | 'ship'; site: string; addr: string; leg: string; pick: string; no: string;
};
const f0 = (t: string): Filter => ({ temp: '', st: '', kw: '', unset: false, from: addDaysIso(t, -3), to: addDaysIso(t, 10), basis: 'date', site: '', addr: '', leg: '', pick: '', no: '' });

/** 配送スタッフ一括設定（元の opsModal 'assign'） */
function AssignModal({ rows, all, staff, onUnsel, onClose, onDone }: { rows: DeliveryView[]; all: DeliveryView[]; staff: Staff[]; onUnsel: (no: string) => void; onClose: () => void; onDone: (sid: string) => Promise<void> }) {
  const [sid, setSid] = useState('');
  const [busy, setBusy] = useState(false);
  const dates = [...new Set(rows.map((r) => r.date))];
  const one = dates.length === 1 ? dates[0] : null;
  const over = rows.filter((r) => r.staff).length;
  const active = staff.filter((s) => s.st === '有効' && !s.del);
  /* 担当件数は、絞り込みに関係なく全部の配送で数える */
  const count = (id: string, date: string) => all.filter((d) => d.staff === id && d.date === date).length;
  return (
    <Modal onClose={onClose} label="配送スタッフ一括設定">
      <ModalHead onClose={onClose}>配送スタッフ一括設定</ModalHead>
      <div className="mb">
        <p style={{ margin: 0 }}>選択した <b>{rows.length}件</b> の配送に、同じ配送スタッフを設定します。</p>
        {over > 0 && <p className="warnbox"><Icon name="warn" />{over}件はすでに配送スタッフが設定されています。確定すると上書きされ、出荷指示の送信後の配送は「出荷指示の再送待ち」になります。</p>}
        <p className="hint" style={{ margin: 0 }}>割当は自社が運ぶ区間（担当区間）に対して行います。割当期間は納品日の7日前〜前日です。</p>
        <div className="fld">
          <label htmlFor="asStaff">配送スタッフ<span className="req">*</span></label>
          <select className="inp" id="asStaff" value={sid} onChange={(e) => setSid(e.target.value)}>
            <option value="">配送スタッフを選択</option>
            {active.map((s) => <option key={s.id} value={s.id}>{s.name}　ID: {s.id}　{one ? `${fmtMd(one)}の担当件数：${count(s.id, one)}件` : ''}</option>)}
          </select>
          <span className="hint">ステータスが「有効」の配送スタッフのみ選択できます。</span>
        </div>
        <div className="tbl-wrap">
          <table className="tbl" style={{ minWidth: '40rem' }}>
            <thead><tr><th>納品日</th><th>配送No</th><th>担当区間</th><th>届け先拠点名</th><th>温度帯</th><th>現在の配送スタッフ</th><th></th></tr></thead>
            <tbody>
              {rows.map((r) => {
                const s = staff.find((x) => x.id === r.staff);
                return (
                  <tr key={r.no}>
                    <td className="num">{r.date}</td><td>{r.no}</td><td>{r.leg}</td><td>{r.to}</td><td><Tags t={{ [r.temp]: 1 }} full /></td>
                    <td>{s ? s.name : <span className="badge b-warn">未設定</span>}</td>
                    <td><button type="button" className="x" aria-label={`${r.no}を対象から外す`} onClick={() => onUnsel(r.no)}><Icon name="x" /></button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      <footer>
        <button type="button" className="btn out" onClick={onClose}>キャンセル</button>
        <button type="button" className="btn pri" disabled={!sid || busy} onClick={async () => { setBusy(true); try { await onDone(sid); } finally { setBusy(false); } }}>確定（{rows.length}件）</button>
      </footer>
    </Modal>
  );
}

/** 配送管理（元の deliveries()・OW_SCHED_001）：一覧・絞り込み・配送スタッフの一括設定 */
export default function CarrierDeliveries() {
  const { company, account, toast, toastError } = useCarrierSignedIn();
  const router = useRouter();
  const api = areaApi(carrier);
  const { data } = useQuery(api, 'deliveries', { company });
  const t = isoOf(today());
  const [f, setF] = useState<Filter>(() => f0(t));
  const [draft, setDraft] = useState<Filter>(() => f0(t));
  const [adv, setAdv] = useState(false);
  const pager = usePager();
  const [sel, setSel] = useState<Set<string>>(new Set());
  const [modal, setModal] = useState(false);

  if (!data) return <><Crumb items={[['ホーム', '/carrier'], '配送管理']} /><h1 className="ptitle">配送管理</h1><Loading /></>;
  const all = data.deliveries, staff = data.staff;
  const stfOf = (id: string | null) => staff.find((s) => s.id === id);
  /* 引取先は倉庫・中継の ID（WH00001）か名前で絞る。選択肢は、いまの配送の引取先から作る */
  const picks = [...new Set(all.map((d) => d.from))].sort();
  const list = all.filter((d) => {
    const day = f.basis === 'ship' ? d.ship : d.date;
    return (!f.from || day >= f.from) && (!f.to || day <= f.to)
      && (!f.temp || d.temp === f.temp) && (!f.st || d.st === f.st) && (!f.unset || !d.staff)
      && (!f.leg || d.leg.includes(f.leg)) && (!f.pick || d.from === f.pick) && (!f.site || d.to.includes(f.site))
      && (!f.addr || d.addr.includes(f.addr)) && (!f.no || d.no.includes(f.no))
      && (!f.kw || [d.no, d.deliveryId, d.track?.map((x) => x.no).join(' '), d.staff, stfOf(d.staff)?.name].join(' ').includes(f.kw));
  });
  const pg = pageOf(pager, list);
  const unsetN = all.filter((d) => !d.staff && dAssignable(d)).length;
  const eves = all.filter((d) => !d.staff && isEve(d, t));
  const n = sel.size;
  const selectable = list.filter(dAssignable);
  const allOn = selectable.length > 0 && selectable.every((d) => sel.has(d.no));
  const toggle = (no: string, on: boolean) => { const s = new Set(sel); if (on) s.add(no); else s.delete(no); setSel(s); };
  const apply = () => { setF({ ...draft, kw: draft.kw.trim(), site: draft.site.trim(), addr: draft.addr.trim(), no: draft.no.trim(), unset: f.unset }); pager.setPage(1); };

  const assign = async (sid: string) => {
    try {
      const r = await api.action('assignStaff', { company, nos: [...sel], staff: sid });
      setSel(new Set());
      setModal(false);
      toast(`${r.n}件の配送に ${r.name} を設定しました` + (r.rs ? `（${r.rs}件は出荷指示の再送待ち）` : ''));
    } catch (e) {
      toastError(e);
    }
  };
  const bare = 'bare';
  return (
    <>
      <Crumb items={[['ホーム', '/carrier'], '配送管理']} />
      <div className="phead">
        <h1 className="ptitle">配送管理</h1>
        {/* CSV出力：検索条件のとおりの全件（自社の区間だけ・運営のメモなどは出さない） */}
        <CarrierCsvExport<(typeof list)[number]> screen="配送一覧" rows={list}
          filters={[{ label: f.basis === 'ship' ? '期間（出荷日）' : '期間（納品日）', value: `${f.from}〜${f.to}` }, { label: '温度帯', value: f.temp }, { label: '状態', value: f.st }, { label: '拠点', value: f.site }, { label: '住所など', value: f.addr }, { label: '担当区間', value: f.leg }, { label: '引取先', value: f.pick }, { label: '配送No', value: f.no }, { label: '検索', value: f.kw }, { label: '配送スタッフ', value: f.unset ? '未設定' : '' }]}
          columns={[
            { label: '配送No', get: (d) => d.no }, { label: '配送ID', get: (d) => d.deliveryId ?? d.no }, { label: '区間ID', get: (d) => d.legId ?? '' }, { label: '納品日', get: (d) => d.date }, { label: '出荷予定日', get: (d) => d.ship }, { label: '出荷日（実績）', get: (d) => d.shipped ?? '' },
            { label: '温度帯', get: (d) => d.temp }, { label: '配送区分', get: (d) => d.kbn }, { label: '引取先', get: (d) => d.from }, { label: '担当区間', get: (d) => d.leg },
            { label: '届け先', get: (d) => d.to }, { label: '住所', get: (d) => d.addr }, { label: '配送スタッフID', get: (d) => d.staff ?? '' }, { label: '配送スタッフ名', get: (d) => stfOf(d.staff)?.name ?? '' },
            { label: '状態', get: (d) => d.st }, { label: '箱数', type: 'int', get: (d) => d.boxes }, { label: '集金額（税込）', type: 'money', get: (d) => d.cash }, { label: '駐車料金（税込）', type: 'money', get: (d) => d.park },
            { label: '納品の時刻', get: (d) => d.doneAt ?? '' }, { label: 'トラブル', get: (d) => d.trouble ?? '' },
          ]} />
      </div>
      {eves.length > 0 && (
        <div className="alert">
          <Icon name="warn" />
          <span><b>明日（{fmtMd(eves[0].date)}）納品の {eves.length}件が配送スタッフ未設定です。</b>納品日の前日になっても未設定の配送は、運営の「要確認」に表示されます。</span>
          <button type="button" className="btn sm" onClick={() => setF({ ...f, unset: true })}>未設定を表示</button>
        </div>
      )}
      <div className="panel">
        <form className="search-row dsearch" onSubmit={(e) => { e.preventDefault(); apply(); }}>
          <button type="button" className="icb" style={{ border: 0 }} aria-label="詳細検索" aria-expanded={adv} onClick={() => setAdv(!adv)}><Icon name={adv ? 'up' : 'down'} /></button>
          <DateInput className="inp" value={draft.from} onChange={(e) => setDraft({ ...draft, from: e.target.value })} aria-label="開始日" style={{ width: '12.142857rem', flex: 'none' }} /><span>〜</span>
          <DateInput className="inp" value={draft.to} onChange={(e) => setDraft({ ...draft, to: e.target.value })} aria-label="終了日" style={{ width: '12.142857rem', flex: 'none' }} />
          <div className="radios"><label><input type="radio" checked={draft.basis === 'date'} onChange={() => setDraft({ ...draft, basis: 'date' })} name="dtype" />納品日</label><label><input type="radio" checked={draft.basis === 'ship'} onChange={() => setDraft({ ...draft, basis: 'ship' })} name="dtype" />出荷日</label></div>
          <span style={{ flex: 1 }} />
          <button type="button" className="btn out" onClick={() => { setF(f0(t)); setDraft(f0(t)); pager.setPage(1); }}>クリア</button><Unapplied show={JSON.stringify({ ...draft, kw: draft.kw.trim(), site: draft.site.trim(), addr: draft.addr.trim(), no: draft.no.trim(), unset: f.unset }) !== JSON.stringify(f)} /><button className="btn pri">検索</button>
          {adv && (
            <div className="adv">
              <div className="inp"><Icon name="search" /><input className={bare} placeholder="拠点名" value={draft.site} onChange={(e) => setDraft({ ...draft, site: e.target.value })} /></div>
              <div className="inp"><Icon name="search" /><input className={bare} placeholder="配送先住所" value={draft.addr} onChange={(e) => setDraft({ ...draft, addr: e.target.value })} /></div>
              <select className="inp" aria-label="温度帯" value={draft.temp} onChange={(e) => setDraft({ ...draft, temp: e.target.value as Temp | '' })}><option value="">温度帯</option><option value="f">冷凍</option><option value="r">冷蔵</option><option value="m">資材</option></select>
              <select className="inp" aria-label="状態" value={draft.st} onChange={(e) => setDraft({ ...draft, st: e.target.value })}><option value="">状態</option>{Object.keys(DST).map((s) => <option key={s}>{s}</option>)}</select>
              <select className="inp" aria-label="担当区間" value={draft.leg} onChange={(e) => setDraft({ ...draft, leg: e.target.value })}><option value="">担当区間</option><option value="1次">1次</option><option value="2次">2次</option></select>
              <select className="inp" aria-label="引取先" value={draft.pick} onChange={(e) => setDraft({ ...draft, pick: e.target.value })}><option value="">引取先</option>{picks.map((id) => <option key={id} value={id}>{WH[id] ?? id}</option>)}</select>
              <div className="inp"><Icon name="search" /><input className={bare} placeholder="配送No" value={draft.no} onChange={(e) => setDraft({ ...draft, no: e.target.value })} /></div>
              <div className="inp"><Icon name="search" /><input className={bare} placeholder="配送No、送り状番号、配送スタッフID・名" value={draft.kw} onChange={(e) => setDraft({ ...draft, kw: e.target.value })} /></div>
            </div>
          )}
        </form>
        <div className={`bulkbar ${n ? 'on' : ''}`}>
          <button type="button" className={`chip ${f.unset ? 'on' : ''}`} onClick={() => setF({ ...f, unset: !f.unset })}><Icon name="warn" />配送スタッフ未設定のみ（{unsetN}件）</button>
          <span style={{ flex: 1 }} />
          {n ? <><b>{n}件選択中</b><button type="button" className="linkbtn" onClick={() => setSel(new Set())}>選択解除</button></>
            : <span className="hint">出荷待の配送（中継からの2次は出荷済も）を選択すると、配送スタッフを一括設定できます</span>}
          <button type="button" className="btn pri" disabled={!n} onClick={() => setModal(true)}><Icon name="users" />配送スタッフを一括設定</button>
        </div>
        <div className="tbl-wrap">
          <table className="tbl dtbl">
            <thead><tr><th><input type="checkbox" checked={allOn} aria-label="すべて選択" onChange={(e) => { const s = new Set(sel); selectable.forEach((d) => (e.target.checked ? s.add(d.no) : s.delete(d.no))); setSel(s); }} /></th><th>No</th><th>出荷予定日</th><th>納品日</th><th>配送No</th><th>状態</th><th>配送スタッフID</th><th>配送スタッフ名</th><th>温度帯</th><th>担当区間</th><th>引取先</th><th>届け先拠点名</th><th>届け先住所</th><th>送り状番号</th><th>配送区分</th></tr></thead>
            <tbody>
              {pg.rows.map((d, i) => {
                const s = stfOf(d.staff), ok = dAssignable(d);
                return (
                  <tr key={d.no} className={`${d.staff ? '' : 'unassigned'} ${sel.has(d.no) ? 'sel' : ''}`}>
                    <td><input type="checkbox" checked={sel.has(d.no)} disabled={!ok} title={ok ? undefined : dLockReason(d)} aria-label={`${d.no}を選択`} onChange={(e) => toggle(d.no, e.target.checked)} /></td>
                    <td className="num">{pg.start + i + 1}</td><td className="num">{d.ship}</td><td className="num">{d.date}</td>
                    <td><button type="button" className="lnk" onClick={() => router.push(`/carrier/deliveries/${d.no}`)}>{d.no}</button>{d.shipped && <div className="hint">出荷 {d.shipped}（実績）</div>}</td>
                    <td><DstBadge d={d} /></td>
                    <td className="num">{s ? s.id : ''}</td>
                    <td>{s ? s.name : <><span className="badge b-warn"><Icon name="warn" />未設定</span>{isEve(d, t) && <><br /><small className="err">前日・要対応</small></>}</>}</td>
                    <td><Tags t={{ [d.temp]: 1 }} full /></td><td>{d.leg}</td><td style={{ whiteSpace: 'normal', minWidth: '9.285714rem' }}>{WH[d.from]}</td><td>{d.to}</td><td>{d.addr}</td>
                    <td className="num" style={{ fontSize: '0.857143rem' }}>{d.no}-01{d.boxes > 1 && <><br />{d.no}-02</>}</td><td>{d.kbn}</td>
                  </tr>
                );
              })}
              {!list.length && <tr><td colSpan={15} className="empty">条件に一致する配送はありません。</td></tr>}
            </tbody>
          </table>
        </div>
        <Pager pg={pg.props} />
        <p className="hint">※状態は運営と同じです（確認中 → 出荷待 → 出荷済 → 受取済 → 納品済、ほかに一部納品済・再配達待・中止・取消）。状態はドライバーアプリの受取・納品報告で変わります。トラブルは状態ではなく「トラブル報告」として表示します。<br />※配送スタッフは、自社（{account.name}）が運ぶ区間に割り当てます。ES配送便・COOL便のどちらも対象です（運送会社が運ぶ区間は対象外）。中継先では、配送スタッフがアプリで箱ごとに受取を確認します。割当は納品日の7日前〜前日。送り状番号は引き取り便のため ES が採番（配送No＋箱番号）。</p>
      </div>
      {modal && n > 0 && (
        <AssignModal
          rows={all.filter((d) => sel.has(d.no))} all={all} staff={staff} onClose={() => setModal(false)} onDone={assign}
          onUnsel={(no) => { const s = new Set(sel); s.delete(no); setSel(s); if (!s.size) setModal(false); }}
        />
      )}
    </>
  );
}
