'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { DEMO } from '@/lib/demo';
import { api, runOp } from '@/lib/ops/purchasing/client';
import { leadDaysError, MAT_LEAD_DEFAULT, matOrder, matRows } from '@/lib/ops/purchasing/logic';
import { MAT_WH, MAT_YM, TODAY, iso, mat, n, supName } from '@/lib/ops/purchasing/master';
import { addDays, nowStamp } from '@/lib/supplier/dates';
import { Icon } from '../../_ui/Icon';
import { OpsCsvExport } from '../../_ui/csv';
import { useOps } from '../../_ui/OpsProvider';
import { useCanAct } from '../../_ui/perm';
import { Field, PageHead } from '../../_ui/ui';
import { B, Box, Info, Kv, yen } from '../_components/common';
import { RecModal } from '../_components/stock';
import { usePo } from '../_components/usePo';
import { useDomainQuery } from '@/lib/domain/client';
import { poLike, stockApi } from '../_components/receipts';
import { DateInput } from '@/components/DateInput';
import { fmtDate, fmtDateTime } from '@/lib/format/date';

const NO_MAIL = 'メールは送りません。運営が代理入力';
/** 仕入先名＋発注方法（仕入先マスタ。ない仕入先は ESステーション） */
const supWith = (sup: string, mm?: Record<string, string>) => <>{supName(sup)}<br /><span className="hint">{mm?.[sup] || 'ESステーション'}</span></>;

/** 資材の発注の確認（元の s6Form「資材の発注（本発注）」） */
function MatOrderModal({ id, qty }: { id: string; qty: number }) {
  const { closeModal, toast, toastError } = useOps();
  const { orders, supMethod } = usePo();
  const [wish, setWish] = useState(iso(addDays(TODAY(), 3)));
  const [err, setErr] = useState('');
  const m = mat(id)!;
  const ok = async () => {
    if (!wish) { setErr('入荷希望日を入れてください'); return; }
    if (!orders) return;
    const cnt = orders.filter((o) => o.pid === id && o.ym === MAT_YM).length;
    const o = matOrder(id, qty, wish, cnt, nowStamp());
    try {
      await runOp({ op: 'create', orders: [o] }, orders);
      closeModal();
      toast(`資材を発注しました（${o.no}）。${supMethod?.[m.sup] === '外部' ? 'メールは送っていません（運営が代理入力）' : '仕入先にメールで知らせました'}`);
    } catch (e) { toastError(e); }
  };
  return (
    <Box title="資材の発注（本発注）" width={560} closable={false}
      footer={<><span style={{ flex: 1 }} /><button className="btn lg ghost" onClick={closeModal}>戻る</button><button className="btn pri lg" onClick={ok}>この内容で発注する</button></>}>
      <div className="stack">
        <div className="kvgrid"><Kv l="資材" v={`${m.name}（${m.id}）`} /><Kv l="仕入先" v={`${supName(m.sup)}（${supMethod?.[m.sup] || 'ESステーション'}）`} /><Kv l="数量" v={`${n(qty)}${m.unit}`} /><Kv l="納品先" v={MAT_WH} /><Kv l="金額（税抜）" v={yen(qty * m.cost)} /></div>
        <Field label="入荷希望日" req><DateInput className="inp" value={wish} onChange={(e) => setWish(e.target.value)} /></Field>
        {supMethod?.[m.sup] === '外部' && <div className="hint">{NO_MAIL}</div>}
      </div>
      <div className="emsg" style={{ marginTop: '0.571429rem' }}>{err}</div>
    </Box>
  );
}

/** 資材の一括発注の確認（台帳 F「資材発注の一括発注と仕入先の発注方法」・受付簿 #194）：共通の入荷希望日・資材ごとの数量。発注は資材ごとに1件 */
function MatBulkModal({ ids, qtys }: { ids: string[]; qtys: Record<string, string> }) {
  const { closeModal, toast, toastError } = useOps();
  const { orders, supMethod } = usePo();
  const ext = ids.filter((id) => supMethod?.[mat(id)!.sup] === '外部');
  const [wish, setWish] = useState(iso(TODAY()));
  const [q, setQ] = useState<Record<string, string>>(qtys);
  const [errs, setErrs] = useState<Record<string, string>>({});
  const [wErr, setWErr] = useState('');
  const ok = async () => {
    if (!orders) return;
    const e: Record<string, string> = {};
    for (const id of ids) {
      const m = mat(id)!;
      const v = +(q[id] ?? '');
      if (!(v > 0)) e[id] = '発注数を入れてください';
      else if (v > 999999) e[id] = '999,999以下で入れてください';
      else if (v % m.lot) e[id] = `${m.lot}${m.unit}単位で入れてください`;
    }
    const we = !wish ? '入荷希望日を入れてください' : wish < iso(TODAY()) ? '入荷希望日は今日以降を選んでください' : '';
    setErrs(e); setWErr(we);
    if (we || Object.keys(e).length) return;
    const at = nowStamp();
    const list = ids.map((id) => matOrder(id, +q[id], wish, orders.filter((o) => o.pid === id && o.ym === MAT_YM).length, at));
    try {
      await runOp({ op: 'create', orders: list }, orders);
      closeModal();
      toast(`資材を${list.length}件発注しました（${list.map((o) => o.no).join('、')}）${ext.length ? `。外部の仕入先 ${ext.length}件はメールを送っていません` : ''}`);
    } catch (er) { toastError(er); }
  };
  return (
    <Box title="資材の一括発注" width={720} closable={false}
      footer={<><span style={{ flex: 1 }} /><button className="btn lg ghost" onClick={closeModal}>戻る</button><button className="btn pri lg" onClick={ok}>この内容で発注する</button></>}>
      <div className="stack">
        <div className="tbl-wrap">
          <table className="tbl">
            <thead><tr><th>資材</th><th>仕入先（発注方法）</th><th className="num">数量</th><th className="num">金額（税抜）</th></tr></thead>
            <tbody>
              {ids.map((id) => {
                const m = mat(id)!;
                return (
                  <tr key={id}>
                    <td>{m.name}<br /><span className="hint mono">{m.id}</span></td>
                    <td>{supWith(m.sup, supMethod)}</td>
                    <td className="num" style={{ width: '10rem' }}>
                      <input className="inp" type="number" min={0} step={m.lot} value={q[id] ?? ''} placeholder={`${m.lot}の倍数`} aria-label={`${m.name}の発注数`} onChange={(e) => setQ({ ...q, [id]: e.target.value })} />
                      <div className="emsg">{errs[id]}</div>
                    </td>
                    <td className="num">{yen((+q[id] || 0) * m.cost)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="kvgrid"><Kv l="納品先" v={MAT_WH} /></div>
        <Field label="入荷希望日（全資材共通）" req><DateInput className="inp" min={iso(TODAY())} value={wish} onChange={(e) => setWish(e.target.value)} /></Field>
        {ext.length > 0 && <div className="hint">発注方法が「外部」の仕入先（{[...new Set(ext.map((id) => supName(mat(id)!.sup)))].join('、')}）：{NO_MAIL}</div>}
      </div>
      <div className="emsg" style={{ marginTop: '0.571429rem' }}>{wErr}</div>
    </Box>
  );
}

/** 資材発注（決定 R5・Q10：本発注だけ・随時・ES事務所に納品）。元のデモの renderMatPo（STEP6） */
export default function Page() {
  return <Suspense><MaterialsPage /></Suspense>;
}

function MaterialsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const tabQ = useSearchParams().get('tab');
  const tab = tabQ === 'stock' || tabQ === 'history' ? tabQ : 'order';
  const goTab = (k: string) => router.replace(k === 'order' ? pathname : `${pathname}?tab=${k}`);
  const { orders, supMethod } = usePo();
  const { openModal, toast } = useOps();
  const canAct = useCanAct();
  const [qty, setQty] = useState<Record<string, string>>({});
  const [sel, setSel] = useState<string[]>([]);
  /* 納品までの日数：発注の目安の計算に使う。資材マスタには持たず、この画面で毎回入れる（初期値 7。台帳 F「資材の納期（日）」・受付簿 #360） */
  const [days, setDays] = useState(String(MAT_LEAD_DEFAULT));
  /* 資材の在庫（共通データ dm.stock：すべてのピッキング倉庫・ES事務所。入荷−出荷（資材便）±記録・課題 2-5） */
  const { data: ms } = useDomainQuery(stockApi, 'materials', { orders: (orders ?? []).filter((o) => o.type === '資材' && o.hon > 0).map(poLike) });
  /* 資材注文の需要（受けて未出荷・直近28日。倉庫ごと）。目安の計算に使う */
  const { data: dem } = useDomainQuery(stockApi, 'materialDemand', {});
  if (!orders || !ms) return <div className="card"><div className="empty">読み込み中…</div></div>;
  const esStock = (id: string) => ms.find((x) => x.warehouseId === 'WH00004' && x.itemId === id)?.qty ?? 0;
  /* ES事務所の在庫は共通データの数。発注の目安＝（受けて未出荷の資材注文 ＋ 直近28日の1日あたり平均 × 納品までの日数）− 在庫 − 発注中（倉庫ごと・ES事務所の分） */
  const daysErr = leadDaysError(days);
  const nDays = daysErr ? MAT_LEAD_DEFAULT : Number(days);
  const demandOf = (id: string) => { const x = dem?.find((d) => d.warehouseId === 'WH00004' && d.itemId === id); return { pending: x?.pending ?? 0, recent: x?.recent ?? 0 }; };
  const rows = matRows(orders, esStock, dem ? demandOf : undefined, nDays);
  const low = ms.filter((x) => x.low);
  const nShort = rows.filter((r) => r.short).length;
  const hist = orders.filter((o) => o.type === '資材').sort((a, b) => String(b.honAt || b.orderedAt).localeCompare(String(a.honAt || a.orderedAt)));
  const order = (id: string, sug: number) => {
    const m = mat(id)!;
    const q = +(qty[id] ?? (sug || ''));
    if (!(q > 0)) { toast('発注数を入れてください'); return; }
    if (q % m.lot) { toast(`${m.lot}${m.unit}単位で入れてください`); return; }
    openModal(<MatOrderModal id={id} qty={q} />);
  };
  const canOrder = canAct(api, 'orderOp', { op: 'create' });
  const canAdj = canAct(api, 'addStockRec');
  const bulk = () => {
    const ids = rows.filter((r) => sel.includes(r.id)).map((r) => r.id);
    const qs: Record<string, string> = {};
    for (const r of rows) if (ids.includes(r.id)) qs[r.id] = String(qty[r.id] ?? (r.sug || ''));
    openModal(<MatBulkModal ids={ids} qtys={qs} />);
  };
  return (
    <>
      <PageHead crumbs={['発注・入荷', '資材発注']} title="資材発注">
        <OpsCsvExport<(typeof rows)[number]> screen="資材発注" rows={rows} source={{ kind: 'dm.master.materials', id: (r) => r.id }}
          columns={[{ label: '資材ID', get: (r) => r.id }, { label: '資材名', get: (r) => r.name }, { label: '規格', get: (r) => r.spec }, { label: '仕入先ID', get: (r) => r.sup }, { label: '仕入先名', get: (r) => supName(r.sup) }, { label: '発注方法', get: (r) => supMethod?.[r.sup] || 'ESステーション' },
            { label: 'ES事務所の在庫', type: 'int', get: (r) => r.stock }, { label: `必要数（受けて未出荷＋${nDays}日分）`, type: 'int', get: (r) => r.need }, { label: '発注中（未入荷）', type: 'int', get: (r) => r.open },
            { label: '単位', get: (r) => r.unit }, { label: 'ロット', type: 'int', get: (r) => r.lot }, { label: '発注の目安', type: 'int', get: (r) => r.sug }, { label: '状態', get: (r) => (r.short ? '要発注' : '足りる') }]} />
      </PageHead>
      {low.length > 0 && <Info kind="ng">資材の在庫が<b>しきい値を下回っています</b>：{low.map((x) => `${x.warehouseName} ${x.name} ${x.qty}（しきい値 ${x.minQty}）`).join('、')}。</Info>}
      <div className="card">
        <div className="tabs" role="tablist">
          {([['order', `発注${nShort ? ` (${nShort})` : ''}`], ['stock', '資材の在庫'], ['history', '発注の履歴']] as const).map(([k, l]) => <button key={k} role="tab" aria-selected={k === tab} className={k === tab ? 'on' : ''} onClick={() => goTab(k)}>{l}</button>)}
        </div>
      </div>
      {tab === 'stock' && (
      <div className="card">
        <h2 style={{ fontSize: '1.142857rem', margin: '0 0 0.714286rem' }}>資材の在庫（ピッキング倉庫・ES事務所）</h2>
        <Info>在庫＝棚卸しの数＋入荷（入荷登録）−出荷（資材便。資材は食品の便では送りません）±在庫の記録。しきい値を下回ると「在庫不足」になり、運営の TOP にも出ます。</Info>
        <div className="tbl-wrap">
          <table className="tbl">
            <thead><tr><th>倉庫</th><th>資材</th><th className="num">棚卸し（日）</th><th className="num">入荷</th><th className="num">出荷（資材便）</th><th className="num">記録</th><th className="num">在庫</th><th className="num">しきい値</th><th className="num">入荷予定</th><th>状態</th>{canAdj && <th className="act">操作</th>}</tr></thead>
            <tbody>
              {ms.map((x) => (
                <tr key={x.warehouseId + x.itemId}>
                  <td>{x.warehouseName}</td><td>{x.name}<br /><span className="hint mono">{x.itemId}</span></td>
                  <td className="num">{n(x.base)}{x.baseOn && <><br /><span className="hint">{fmtDate(x.baseOn)}</span></>}</td>
                  <td className="num">{x.inQ ? '+' + n(x.inQ) : '—'}</td><td className="num">{x.outQ ? '−' + n(x.outQ) : '—'}</td><td className="num">{x.moveQ ? (x.moveQ > 0 ? '+' : '') + n(x.moveQ) : '—'}</td>
                  <td className="num"><b>{n(x.qty)}</b></td><td className="num">{x.minQty ? n(x.minQty) : '—'}</td><td className="num">{x.incoming ? n(x.incoming) : '—'}</td>
                  <td>{x.low ? <B v="在庫不足" c="b-ng" /> : <B v="足りる" c="b-ok" />}</td>
                  {canAdj && <td className="act" style={{ whiteSpace: 'nowrap' }}><button className="btn sm" onClick={() => openModal(<RecModal target="資材" wh={x.warehouseName} pid={x.itemId} itemName={x.name} />)}>調整</button></td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      )}
      {tab === 'order' && (
      <div className="card">
        <Info>資材は<b>本発注だけ・随時</b>（仮発注なし・REQ-PO-411）。納品先は <b>{MAT_WH}</b>（倉庫マスタ WH00004・THOMAS 連携なし）。在庫と受けている資材注文（メニュー管理 ＞ 資材注文管理）を見て、足りない分をロット単位で発注します。発注の目安は、受けて未出荷の資材注文と直近28日の平均から「納品までの日数」ぶんを見込んだ参考値です。入荷は運営が「発注・入荷 ＞ 入荷登録」で入れます（THOMAS の入荷実績 CSV は使わない）。</Info>
        <div style={{ margin: '0 0 0.571429rem', maxWidth: '22rem' }}>
          <Field label="納品までの日数" req htmlFor="mat-days" hint="発注の目安の計算に使います（初期値 7。資材マスタには持たず、発注のたびにここで入れます）" err={daysErr}>
            <input id="mat-days" className="inp num" inputMode="numeric" value={days} aria-label="納品までの日数" onChange={(e) => setDays(e.target.value.replace(/[０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0)))} />
          </Field>
        </div>
        {canOrder && <div style={{ margin: '0 0 0.571429rem' }}><button className="btn pri" disabled={!sel.length} onClick={bulk}>選択した資材を発注</button></div>}
        <div className="tbl-wrap">
          <table className="tbl">
            <thead><tr>{canOrder && <th><input type="checkbox" aria-label="すべて選択" checked={rows.length > 0 && sel.length === rows.length} onChange={(e) => setSel(e.target.checked ? rows.map((r) => r.id) : [])} /></th>}<th>資材ID</th><th>資材名</th><th>仕入先（発注方法）</th><th className="num">ES事務所の在庫</th><th className="num">必要数（受けて未出荷＋{nDays}日分）</th><th className="num">発注中（未入荷）</th><th>状態</th><th>発注数</th><th className="act">操作</th></tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  {canOrder && <td><input type="checkbox" aria-label={`${r.name}を選択`} checked={sel.includes(r.id)} onChange={(e) => setSel(e.target.checked ? [...sel, r.id] : sel.filter((x) => x !== r.id))} /></td>}
                  <td className="mono">{r.id}</td>
                  <td>{r.name}<br /><span className="hint">{r.spec}</span></td>
                  <td>{supWith(r.sup, supMethod)}</td>
                  <td className="num">{n(r.stock)}{r.unit}</td>
                  <td className="num">{n(r.need)}{r.unit}</td>
                  <td className="num">{r.open ? n(r.open) + r.unit : '—'}</td>
                  <td>{r.short ? <B v="要発注" c="b-ng" /> : <B v="足りる" c="b-ok" />}</td>
                  <td style={{ width: '8.571429rem' }}><input className="inp" type="number" min={0} step={r.lot} value={qty[r.id] ?? (r.sug || '')} placeholder={`${r.lot}の倍数`} aria-label={`${r.name}の発注数`} onChange={(e) => setQty({ ...qty, [r.id]: e.target.value })} /></td>
                  <td className="act" style={{ whiteSpace: 'nowrap' }}>{canOrder && <button className="btn sm pri" onClick={() => order(r.id, r.sug)}>発注する</button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      )}
      {tab === 'history' && (
      <div className="card">
        <h2 style={{ fontSize: '1.142857rem', margin: '0 0 0.714286rem' }}>資材の発注の履歴</h2>
        <div className="tbl-wrap">
          <table className="tbl">
            <thead><tr><th>発注番号</th><th>発注日時</th><th>資材名</th><th className="num">数量</th><th>納品先</th><th>仕入先回答</th><th>出荷予定日</th><th>入荷</th></tr></thead>
            <tbody>
              {hist.length ? hist.map((o) => (
                <tr key={o.no}>
                  <td><button className="lnk mono" onClick={() => router.push(`/ops/purchasing/materials/${encodeURIComponent(o.no)}`)}>{o.no}</button></td>
                  <td>{fmtDateTime(String(o.honAt || o.orderedAt).slice(0, 16))}</td>
                  <td>{mat(o.pid)?.name ?? o.name}</td>
                  <td className="num">{n(o.hon || o.kari)}{o.unit}</td>
                  <td>{MAT_WH}</td>
                  <td><B v={o.ans} /></td>
                  <td>{fmtDate(o.eta) || '—'}</td>
                  <td><B v={o.recv || '未入荷'} />{o.recvDate && ' ' + fmtDate(o.recvDate)}</td>
                </tr>
              )) : <tr><td colSpan={8} className="empty">まだありません</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
      )}
    </>
  );
}
