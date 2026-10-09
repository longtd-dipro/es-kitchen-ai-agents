'use client';

import { useEffect, useState } from 'react';
import { api, runOp } from '@/lib/ops/purchasing/client';
import { draftKey, honInfo, rNeed, roundLot, setQty, uNeed, unitOrder, unitRows, uSum, type normalData, type Unit, type URow } from '@/lib/ops/purchasing/logic';
import { SLOT, TODAY, WISH, dShow, lotUp, pickDate, slotDate, wdOf, wishDate } from '@/lib/ops/purchasing/master';
import type { Plan, POrder, Prod } from '@/lib/ops/purchasing/types';
import { addDays, nowStamp } from '@/lib/supplier/dates';
import type { OpsOp } from '@/lib/supplier/types';
import { Icon } from '../../../_ui/Icon';
import { useOps } from '../../../_ui/OpsProvider';
import { useCanAct } from '../../../_ui/perm';
import { ConfirmModal } from '../../../_ui/ui';
import { B, Info, Sel } from '../../_components/common';
import { fmtDate } from '@/lib/format/date';

/* 発注詳細：通常商品モード（発注単位＝サイクル範囲×納入倉庫） */

const wishLabel = (v: string) => WISH.find((w) => w[0] === v)?.[1] ?? '';
const same = (a: URow[], b: URow[]) => a.every((r, i) => r.kari === b[i]?.kari && r.wish === b[i]?.wish);

export default function NormalBody({ ym, p, orders, plan, data, onDirty }: {
  ym: string; p: Prod; orders: POrder[]; plan?: Plan; data: ReturnType<typeof normalData>; onDirty: (nos: number[]) => void;
}) {
  const { toast, toastError, openModal } = useOps();
  const canAct = useCanAct();
  /* 発注の書き換え（orderOp の op ごとの権限）。権限がなければボタンを出さない */
  const canOp = (o: string) => canAct(api, 'orderOp', { op: o });
  const canGroup = canAct(api, 'setGroup');
  const [open, setOpen] = useState(0);
  const [rowSel, setRowSel] = useState<Set<string>>(new Set());
  const [edits, setEdits] = useState<Record<string, URow[]>>({});
  const [busy, setBusy] = useState(false);
  const { units, group, locked } = data;
  const rowsOf = (u: Unit) => edits[u.base] ?? u.rows;
  const isDirty = (u: Unit) => u.st === '仮発注済' && !!edits[u.base] && !same(edits[u.base], u.rows);
  const dirtyNos = units.filter(isDirty).map((u) => u.no);
  const dirtyKey = dirtyNos.join(',');
  useEffect(() => { onDirty(dirtyKey ? dirtyKey.split(',').map(Number) : []); }, [dirtyKey, onDirty]);
  void plan;

  const call = async (f: () => Promise<unknown>) => {
    setBusy(true);
    try { await f(); } catch (e) { toastError(e); } finally { setBusy(false); }
  };
  const op = (o: OpsOp) => runOp(o, orders);
  /** 未発注の行の入力は残す（発注前の入力） */
  /* 下書きの保存は発注管理の編集ができる人だけ（できない人は画面の上だけで直す） */
  const saveDrafts = (u: Unit, rows: URow[]) => !canAct(api, 'saveDrafts') ? undefined : api.action('saveDrafts', { ym, pid: p.id, drafts: Object.fromEntries(rows.map((r) => [draftKey(u.wh, r.k), { kari: r.kari, wish: r.wish }])) }).catch(toastError);
  const edit = (changes: { u: Unit; f: (rows: URow[]) => void }[], persist = true) => {
    const next = { ...edits };
    const touched = new Map<string, Unit>();
    changes.forEach(({ u, f }) => {
      if (u.st === '本発注済') return;
      const rows = (next[u.base] ?? u.rows).map((r) => ({ ...r }));
      f(rows);
      next[u.base] = rows;
      touched.set(u.base, u);
    });
    setEdits(next);
    if (persist) touched.forEach((u) => { if (u.st === '未発注') saveDrafts(u, next[u.base]); });
    return touched.size;
  };
  /** 選択行があれば選択行、なければ展開中の単位の全行 */
  const targets = () => {
    if (rowSel.size) return [...rowSel].map((key) => { const [ui, k] = key.split(':').map(Number); return { u: units[ui], k }; }).filter((x) => x.u);
    const u = units[Math.max(0, open)];
    return u ? rowsOf(u).map((r) => ({ u, k: r.k })) : [];
  };
  const byUnit = (ts: { u: Unit; k: number }[]) => {
    const m = new Map<string, { u: Unit; ks: number[] }>();
    ts.forEach(({ u, k }) => { if (!m.has(u.base)) m.set(u.base, { u, ks: [] }); m.get(u.base)!.ks.push(k); });
    return [...m.values()];
  };

  const ou = units[Math.max(0, open)];
  const nSel = rowSel.size;

  const saveUnit = (u: Unit) => call(async () => {
    const rows = rowsOf(u).map((r) => ({ ...r }));
    if (!uSum(rows, 'kari')) { toast('仮発注数が0です。「必要数を仮発注数に一括コピー」で入力してください'); return; }
    const add = roundLot(rows, p.lot);
    const first = u.st === '未発注';
    if (first) await op({ op: 'create', orders: [unitOrder(ym, p, u, rows, nowStamp())] });
    else await op({ op: 'reviseKari', no: u.order!.no, rows: unitRows(ym, rows, 'kari'), reanswer: true });
    setEdits((e) => { const x = { ...e }; delete x[u.base]; return x; });
    if (first) await api.action('saveDrafts', { ym, pid: p.id, drafts: Object.fromEntries(rows.map((r) => [draftKey(u.wh, r.k), null])) });
    const tot = uSum(rows, 'kari');
    toast((first ? `発注単位${u.no}を仮発注しました（${tot}個）。仕入先に納期回答を依頼しました` : `発注単位${u.no}の仮発注を更新しました（${tot}個）。仕入先に再回答を依頼しました`) + (add ? `（ロット単位に +${add}個 切り上げ）` : ''));
  });
  const unitAll = () => call(async () => {
    const at = nowStamp();
    const list = units.filter((u) => u.st === '未発注' && !u.add).map((u) => {
      const rows = rowsOf(u).map((r) => ({ ...r }));
      if (!uSum(rows, 'kari')) setQty(rows, lotUp(uNeed(rows), p.lot), 'kari');
      else roundLot(rows, p.lot);
      return unitOrder(ym, p, u, rows, at);
    }).filter((o) => o.kari > 0);
    if (list.length) {
      await op({ op: 'create', orders: list });
      await api.action('saveDrafts', { ym, pid: p.id, drafts: Object.fromEntries(units.filter((u) => u.st === '未発注').flatMap((u) => u.rows.map((r) => [draftKey(u.wh, r.k), null]))) });
      setEdits({});
    }
    toast(list.length ? `仮発注が完了しました：${list.length}単位の発注データを作成しました` : '未発注の単位はありません');
  });
  const setGroup = (g: '4' | '2' | '1') => {
    if (locked && group !== g) { toast('仮発注済の単位があるため切り替えられません。取り消してからやり直してください'); return; }
    call(async () => { await api.action('setGroup', { ym, pid: p.id, group: g }); setOpen(0); setRowSel(new Set()); setEdits({}); });
  };
  const seg = (
    <div className="seg2">
      {([['4', '4Cycle別'], ['2', '2Cycle別'], ['1', '全1単位']] as const).map(([g, l]) => (
        <button key={g} className={group === g ? 'on' : ''} disabled={!canGroup && group !== g} onClick={() => setGroup(g)} title={locked && group !== g ? '仮発注済の単位があるため切り替えられません（データリセットで戻せます）' : undefined}>{l}</button>
      ))}
    </div>
  );
  const bar = (
    <div className="card pobar">
      <label style={{ display: 'flex', gap: '0.571429rem', alignItems: 'center' }}>
        <input type="checkbox" checked={nSel > 0} onChange={() => {
          if (rowSel.size) setRowSel(new Set());
          else if (ou) setRowSel(new Set(rowsOf(ou).map((r) => `${Math.max(0, open)}:${r.k}`)));
        }} /> 選択した行のみ適用
      </label>
      <b className="txt-ac">{nSel} / {ou ? ou.rows.length : 0} 行</b>
      <span>入荷希望日 一括：</span>
      <Sel value="" opts={WISH} ph="選択…" onChange={(v) => {
        if (!v) return;
        edit(byUnit(targets()).map(({ u, ks }) => ({ u, f: (rows) => rows.forEach((r) => { if (ks.includes(r.k)) r.wish = v; }) })));
        toast(`入荷希望日を「${wishLabel(v)}」に一括変更しました`);
      }} />
      <button className="btn out sm" onClick={() => {
        let cnt = 0;
        edit(byUnit(targets()).filter(({ u }) => u.st !== '本発注済').map(({ u, ks }) => ({ u, f: (rows) => rows.forEach((r) => { if (ks.includes(r.k)) { r.kari = rNeed(r); cnt++; } }) })));
        toast(`${cnt}行の必要数を仮発注数にコピーしました`);
      }}>必要数を仮発注数に一括コピー</button>
      <button className="btn out sm" onClick={() => {
        let add = 0;
        edit(byUnit(targets()).filter(({ u }) => u.st !== '本発注済').map(({ u }) => ({ u, f: (rows) => { add += roundLot(rows, p.lot); } })));
        toast(add ? `発注単位の合計をロット（${p.lot}個／箱）単位に切り上げました（+${add}個）` : `すでにロット（${p.lot}個／箱）単位です`);
      }}>ロット単位（{p.lot}個）に切り上げ</button>
      {canOp('create') && <button className="btn sm ghost" disabled={busy} onClick={unitAll}>未発注の全単位を一括仮発注</button>}
    </div>
  );

  return (
    <>
      <div className="po-row">{seg}<span className="muted">※発注単位＝サイクル範囲×納入倉庫（必要数がある倉庫だけ）。区切りは一括変更できます（仮発注済の単位があるときは変更できません）</span></div>
      {bar}
      {units.length ? units.map((u, ui) => {
        const rs = rowsOf(u);
        const need = uNeed(rs);
        const kari = uSum(rs, 'kari');
        const hon = uSum(rs, 'hon');
        const isOpen = open === ui;
        const ed = u.st !== '本発注済';
        const lotNG = kari % p.lot !== 0;
        const dirty = isDirty(u);
        const o = u.order;
        const h = o && u.st === '本発注済' ? honInfo(o) : null;
        const cyc = group === '4' || u.add ? 'ABCD'[Math.floor(u.from / 7)] + ' CYCLE' : group === '2' ? (u.from === 0 ? 'A・B' : 'C・D') + ' CYCLE' : 'ALL';
        const btn = !ed || !canOp(u.st === '未発注' ? 'create' : 'reviseKari') ? null
          : u.st === '未発注' ? <button className="btn sm pri" disabled={busy} onClick={() => saveUnit(u)}>仮発注保存</button>
              : <button className={`btn sm ${dirty ? 'pri' : 'out'}`} disabled={busy} onClick={() => saveUnit(u)}>{dirty ? '変更を保存（再回答依頼）' : '仮発注を更新'}</button>;
        return (
          <section key={u.base} className={`card unit ${isOpen ? 'is-open' : ''}`}>
            <div className="unit-h">
              <span className={`cyc c${'ABCD'[Math.floor(u.from / 7)]}`}>{cyc}</span>
              <h3>発注単位 {u.no}</h3>
              <B v={u.st} />
              {u.add && <B v="追加発注" />}
              {dirty && <B v="未保存" c="b-warn" />}
              <span className="mono po">{o?.no ?? u.base}</span>
              <span className="muted">サイクル範囲：{SLOT(u.from)} 〜 {SLOT(u.to)}（{u.to - u.from + 1}日分）｜納入倉庫：<b>{u.wh}</b></span>
              <span className="unit-sum">必要 {need}個 ／ <span className={kari ? 'txt-ok' : 'txt-warn'}>仮発注 {kari}個</span>{hon > 0 && ` ／ 本発注 ${hon}個`}</span>
              {btn}
              <button className="btn sm ghost" onClick={() => { setOpen(isOpen ? -1 : ui); setRowSel(new Set()); }}>{isOpen ? '明細を閉じる' : '明細を開く'}</button>
            </div>
            {o && (
              <div className="ansline">
                <Icon name="truck" /><span>仕入先回答：</span><B v={o.ans} />
                {o.eta && <span>出荷予定日 <b>{fmtDate(o.eta)}</b></span>}
                {o.slip && <span>送り状 <b className="mono">{o.slip}</b></span>}
                <B v={o.recv || '未入荷'} />
                {h && <>
                  <span>本発注の承認：</span><B v={h.st} />
                  {h.parts && <><span>納品日 <b>{[...new Set(h.parts.map((z) => z.dlv))].map(fmtDate).join('・')}</b></span><span>入荷箱数 <b>{h.box}箱</b></span>{h.parts.length > 1 && <B v={`分納${h.parts.length}回`} c="b-info" />}</>}
                </>}
                {dirty && <span className="txt-warn"><b>数量を変更しました（未保存）。</b>「変更を保存」で仕入先に再回答を依頼します。</span>}
              </div>
            )}
            {!o && u.prev.length > 0 && (
              <div className="ansline"><Icon name="truck" /><span>前回の発注 <b className="mono">{u.prev[u.prev.length - 1].no}</b> は取消済です（{u.prev[u.prev.length - 1].cancel?.reason}）。仮発注保存で出し直します。</span></div>
            )}
            {isOpen && (
              <>
                <div className="tbl-wrap">
                  <table className="tbl">
                    <thead>
                      <tr><th style={{ width: '2.714286rem' }}></th><th>ピッキング日</th><th className="num">注文数</th><th className="num">調整数（無料枠）</th><th className="num">サンプル枠</th><th className="num">日別必要数</th><th className="txt-ac">仮発注数</th>{u.st === '本発注済' && <th className="num">本発注数</th>}<th>入荷希望日</th></tr>
                    </thead>
                    <tbody>
                      {rs.map((r) => {
                        const nd = rNeed(r);
                        const pk = pickDate(ym, r.k);
                        const key = `${ui}:${r.k}`;
                        const on = rowSel.has(key);
                        return (
                          <tr key={r.k} className={on ? 'rsel' : ''}>
                            <td><input type="checkbox" checked={on} onChange={(e) => { const s = new Set(rowSel); if (e.target.checked) s.add(key); else s.delete(key); setRowSel(s); }} aria-label={`${SLOT(r.k)}を選択`} /></td>
                            <td>{pk} ({wdOf(pk)})</td>
                            <td className="num">{r.std}個{r.tmp > 0 && <><br /><span className="badge b-warn" title="仮登録の契約の分（本登録で確定）">うち仮 {r.tmp}</span></>}</td>
                            <td className="num">{r.free}個</td>
                            <td className="num">{r.smp}個</td>
                            <td className="num"><b>{nd}個</b></td>
                            <td style={{ width: '8.571429rem' }}>
                              {ed ? <input className={`inp ${r.kari && r.kari !== nd ? 'chg' : ''}`} type="number" min={0} step={1} value={r.kari} aria-label={`${SLOT(r.k)}の仮発注数`}
                                onChange={(e) => edit([{ u, f: (rows) => { rows.find((x) => x.k === r.k)!.kari = Math.max(0, +e.target.value || 0); } }], false)}
                                onBlur={() => { if (u.st === '未発注' && edits[u.base]) saveDrafts(u, edits[u.base]); }} />
                                : <span className="num">{r.kari}個</span>}
                            </td>
                            {u.st === '本発注済' && <td className="num"><b>{r.hon}個</b></td>}
                            <td style={{ width: '12.142857rem' }}>
                              {ed ? <Sel value={r.wish} ph={null} opts={WISH.map(([v, l]) => [v, `${l}（${dShow(wishDate(ym, r.k, v), false)}）`])} ariaLabel={`${SLOT(r.k)}の入荷希望日`}
                                onChange={(v) => edit([{ u, f: (rows) => { rows.find((x) => x.k === r.k)!.wish = v; } }])} />
                                : dShow(wishDate(ym, r.k, r.wish), false)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <div className="unitfoot">
                  <span>※日別必要数＝注文数（うち仮＝仮登録の契約の分）＋調整数＋サンプル枠（運営Web 商品注文管理）。発注数は発注単位の合計をロット（{p.lot}個／箱）単位にします。{lotNG && ed && <> <b className="txt-warn">合計がロットの倍数ではありません（保存時に切り上げます）</b></>}</span>
                  <span>必要数合計 <b>{need}個</b></span>
                  <span>仮発注数合計 <b className="txt-ok">{kari}個（{Math.ceil(kari / p.lot)}箱）</b></span>
                </div>
              </>
            )}
          </section>
        );
      }) : <div className="card"><div className="empty">このメニュー年月の注文はありません</div></div>}
      <Info kind="warn" icon="bell">複数の単位を同時に展開すると縦に長くなるため、操作中の1単位のみ展開します。仮発注済の単位の数量を変えたときは「変更を保存」で仕入先に再回答を依頼します（保存しないで画面を離れると確認が出ます）。</Info>
    </>
  );
}
