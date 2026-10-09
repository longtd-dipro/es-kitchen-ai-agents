'use client';

import Link from 'next/link';
import { useDomainQuery } from '@/lib/domain/client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api, runOp } from '@/lib/ops/purchasing/client';
import {
  addOrder, addShortOrder, bulkPlan, isBefore, menuPids, newReqs, normalData, offMenuOrder, planId, poBase, poDefQty, poKariIn, poOrderCnt, poPast,
  type BulkCtx, type Req,
} from '@/lib/ops/purchasing/logic';
import { MENU, PRODS, SLOT, TODAY, WH, iso, lotUp, n, pname, prod, slash, slotDate, supName } from '@/lib/ops/purchasing/master';
import { lotOf } from '@/lib/ops/purchasing/stock';
import { disp } from '@/lib/ops/purchasing/labels';
import { CARRIERS, METHODS } from '@/lib/supplier/constants';
import { addDays, nowStamp } from '@/lib/supplier/dates';
import type { OrderRow } from '@/lib/supplier/types';
import { Icon } from '../../_ui/Icon';
import { useOps } from '../../_ui/OpsProvider';
import { useCanAct } from '../../_ui/perm';
import { Field, PageHead } from '../../_ui/ui';
import { B, Box, Info, Kv, Sec, Sel, yen } from './common';
import { poLike, stockApi } from './receipts';
import { PO, usePo } from './usePo';
import { useHonSchedule } from './payables';
import { honPhase } from '@/lib/domain/stock';
import { DateInput } from '@/components/DateInput';
import { fmtDate, fmtDatesIn, fmtDateTime } from '@/lib/format/date';

/* 発注の画面のモーダル（一括の仮発注・本発注／発注済データ確認／仕様確認／発注メールの文面／発注データ詳細） */

const typeBadge = (t: string) => (t === '短消費期限' ? <B v="短消費期限" c="b-warn" /> : t === '資材' ? <B v="資材" c="b-info" /> : <B v="通常" c="b-mute" />);

/* ===== 一括仮発注／一括本発注（確認画面つき・決定 G10・R10） ===== */
export function BulkModal({ kind, ym, ids, onDone }: { kind: 'kari' | 'hon'; ym: string; ids: string[]; onDone: () => void }) {
  const { orders, plans } = usePo();
  const { closeModal, toast, toastError } = useOps();
  const router = useRouter();
  const hon = kind === 'hon';
  const [tab, setTab] = useState(0);
  const [reqs, setReqs] = useState<Req[]>(() => newReqs(ym));
  /* 本発注は月2回（前半 A・B＝前のサイクルの B5〜C1、後半 C・D＝D5〜A1・課題 2-4）。時期に入っている半分だけを初めに出す */
  const hs = useHonSchedule(ym);
  const [picked, setPicked] = useState(false);
  useEffect(() => {
    if (!hon || !hs || picked) return;
    const open = hs.halves.filter((h) => honPhase(h) === '本発注の時期').map((h) => h.half);
    if (open.length === 1) setReqs(newReqs(ym).filter((r) => r.half === open[0]));
    setPicked(true);
  }, [hon, hs, picked, ym]);
  const [wh, setWh] = useState('全倉庫');
  const [qty, setQty] = useState<Record<string, number>>({});
  const [step, setStep] = useState<'edit' | 'confirm'>('edit');
  const [busy, setBusy] = useState(false);
  if (!orders || !plans) return <Box title={hon ? '一括本発注' : '一括仮発注'}><div className="empty">読み込み中…</div></Box>;
  const c: BulkCtx = { ym, wh, orders, plans };
  const R = reqs[tab];
  const q = (ti: number, pid: string) => qty[`${ti}:${pid}`] ?? poDefQty(c, kind, pid, reqs[ti]);
  const setR = (patch: Partial<Req>, resetQty = false) => {
    setReqs((rs) => rs.map((r, i) => (i === tab ? { ...r, ...patch } : r)));
    if (resetQty) setQty((m) => Object.fromEntries(Object.entries(m).filter(([k]) => !k.startsWith(tab + ':'))));
  };
  const opts = Array.from({ length: 28 }, (_, k) => [k, SLOT(k)] as [number, string]);
  const total = ids.reduce((s, pid) => s + (q(tab, pid) || 0), 0);

  const lines = reqs.flatMap((r, ti) => ids.map((pid) => ({ r, pid, q: q(ti, pid) || 0 })).filter((l) => l.q));
  const run = async () => {
    setBusy(true);
    try {
      const plan = bulkPlan(c, kind, ids, reqs, Object.fromEntries(reqs.flatMap((_, ti) => ids.map((pid) => [`${ti}:${pid}`, q(ti, pid) || 0]))));
      const cnt = plan.create.length + plan.hon.length;
      if (plan.create.length) await runOp({ op: 'create', orders: plan.create }, orders);
      if (plan.hon.length) await runOp({ op: 'issueHon', items: plan.hon.map((h) => ({ no: h.order.no, qty: h.qty, rows: h.rows })) }, orders);
      closeModal();
      onDone();
      toast(cnt ? `${hon ? '本発注' : '仮発注'}が完了しました：${cnt}件の発注データを${hon ? '確定' : '作成'}しました${plan.skipped ? `（対象外 ${plan.skipped}件はスキップ）` : ''}` : '対象になる発注データがありませんでした');
    } catch (e) {
      toastError(e);
    } finally {
      setBusy(false);
    }
  };

  if (step === 'confirm') {
    const tot = lines.reduce((a, l) => a + l.q, 0);
    const amt = lines.reduce((a, l) => a + l.q * prod(l.pid)!.cost, 0);
    return (
      <Box title={`${hon ? '本発注' : '仮発注'}の内容の確認`} width={820} closable={false}
        footer={<><span style={{ flex: 1 }} /><button className="btn lg ghost" onClick={() => setStep('edit')}>戻って直す</button><button className="btn pri lg" disabled={!lines.length || busy} onClick={run}>この内容で{hon ? '本発注' : '仮発注'}する</button></>}>
        <Info kind="warn">この内容で{hon ? '本発注' : '仮発注'}します。仕入先にはメール（本文）で知らせ、仕入先サイトのホームにも出ます。{hon ? '本発注の数量を直せるのは、仕入先が本発注を承認するまでです。' : ''}</Info>
        <div className="tbl-wrap">
          <table className="tbl">
            <thead><tr><th>納品希望</th><th>品番</th><th>商品名（仕入時の名前）</th><th>仕入先</th><th>倉庫</th><th className="num">数量</th><th className="num">金額（税抜）</th></tr></thead>
            <tbody>
              {lines.length ? lines.map((l, i) => (
                <tr key={i}><td>{l.r.half}（{SLOT(l.r.from)}〜{SLOT(l.r.to)}）</td><td className="mono">{l.pid}</td><td>{pname(l.pid)}</td><td>{supName(prod(l.pid)!.sup)}</td><td>{wh}</td><td className="num">{n(l.q)}</td><td className="num">{yen(l.q * prod(l.pid)!.cost)}</td></tr>
              )) : <tr><td colSpan={7} className="empty">数量が入っていません</td></tr>}
            </tbody>
          </table>
        </div>
        <div style={{ marginTop: '0.571429rem', textAlign: 'right' }}>合計 <b>{n(tot)}個</b>・<b>{yen(amt)}</b></div>
      </Box>
    );
  }

  return (
    <Box title={hon ? '一括本発注' : '一括仮発注'}
      footer={<><span style={{ flex: 1, color: 'var(--fg-3)', fontSize: '0.928571rem' }}>{ids.length}商品｜{reqs.length}つの納品希望｜{wh}</span><button className="btn lg ghost" onClick={closeModal}>キャンセル</button><button className="btn pri lg" onClick={() => setStep('confirm')}>{hon ? '本発注' : '仮発注'}</button></>}>
      {hon && isBefore(ym) && <Info kind="warn">オーダー締切（{fmtDate(MENU[ym].deadline)}）の前です。本発注数はオーダーが確定してから見直してください。</Info>}
      {hon && hs && (
        <Info kind={hs.halves.some((h) => honPhase(h) === '本発注の時期') ? '' : 'warn'}>
          本発注は月2回です：{hs.halves.map((h) => `${h.half}（${h.slots} の便）${fmtDate(h.from)}〜${fmtDate(h.to)}【${honPhase(h)}】`).join('／')}。
          {hs.halves.some((h) => honPhase(h) === '本発注の時期') ? '時期に入っている半分の納品希望を出しています（ほかの半分は「希望納期の追加」で足せます）。' : 'いまは本発注の時期ではありません。'}
        </Info>
      )}
      <div className="fg c2">
        <Field label="メニュー年月"><input className="inp" disabled value={ym} /></Field>
        <Field label="納品先倉庫" htmlFor="pm-wh" hint="全倉庫：倉庫ごとに発注データを作ります"><Sel id="pm-wh" value={wh} opts={['全倉庫', ...WH]} onChange={(v) => { setWh(v); setQty({}); }} /></Field>
      </div>
      <div className="card" style={{ padding: '0.857143rem 1.142857rem', marginTop: '1rem', border: '1px solid var(--line)' }}>
        <div className="tabs" style={{ alignItems: 'center' }}>
          {reqs.map((_, i) => <button key={i} className={i === tab ? 'on' : ''} onClick={() => setTab(i)}>納品希望{'①②③'[i]}</button>)}
          {reqs.length < 3 && <button className="btn sm out" style={{ margin: '0.285714rem 0 0.285714rem 0.571429rem' }} onClick={() => { setReqs((rs) => [...rs, { half: 'その他', from: 7, to: 20, wish: rs[0].wish, bb: rs[0].bb, note: '' }]); setTab(reqs.length); }}>希望納期の追加</button>}
        </div>
        <div className="fg">
          <Field label={`希望納期_${tab + 1}`} htmlFor="pm-wish"><DateInput className="inp" id="pm-wish" value={R.wish} onChange={(e) => setR({ wish: e.target.value })} /></Field>
          <Field label="期間">
            <div className="radios">
              {(['前半', '後半', 'その他'] as const).map((h) => (
                <label key={h}><input type="radio" name="pm-half" value={h} checked={R.half === h} onChange={() => setR(h === '前半' ? { half: h, from: 0, to: 13 } : h === '後半' ? { half: h, from: 14, to: 27 } : { half: h }, true)} />{h}</label>
              ))}
            </div>
          </Field>
          <Field label={hon ? 'お客様に納品予定期間' : 'お客様に納品予定サイクル'}>
            <div style={{ display: 'flex', gap: '0.571429rem', alignItems: 'center' }}>
              <Sel value={R.from} opts={opts} disabled={R.half !== 'その他'} onChange={(v) => setR({ from: +v, to: Math.max(+v, R.to) }, true)} ariaLabel="開始" />
              <span>〜</span>
              <Sel value={R.to} opts={opts} disabled={R.half !== 'その他'} onChange={(v) => setR({ to: Math.max(R.from, +v) }, true)} ariaLabel="終了" />
            </div>
          </Field>
          <Field label="対象期間（顧客納品日）"><input className="inp" disabled value={`${fmtDate(slotDate(ym, R.from))} 〜 ${fmtDate(slotDate(ym, R.to))}`} /></Field>
          <Field label="希望賞味期限" htmlFor="pm-bb"><DateInput className="inp" id="pm-bb" value={R.bb} onChange={(e) => setR({ bb: e.target.value })} /></Field>
          <Field label={hon ? '本発注合計数' : '仮発注合計数'}><input className="inp" disabled value={n(total)} /></Field>
          <Field label="備考" className="full" htmlFor="pm-note"><input className="inp" id="pm-note" value={R.note} maxLength={60} placeholder="備考（仕入先に伝える内容）" onChange={(e) => setR({ note: e.target.value })} /></Field>
        </div>
        <div className="tbl-wrap" style={{ marginTop: '0.857143rem' }}>
          <table className="tbl">
            <thead>
              <tr>
                <th>No</th><th>品番</th><th>商品名</th><th>カテゴリ</th><th>仕入先</th>
                <th className="num" title="前月メニューの同じ期間・倉庫の本発注数">過去発注</th>
                <th className="num" title="対象期間・倉庫の必要数の合計（注文数＋調整数＋サンプル枠）">基準値</th>
                {hon && <><th className="num">オーダー</th><th className="num">仮発注数</th></>}
                <th>{hon ? '本発注数' : '仮発注数'}</th>
              </tr>
            </thead>
            <tbody>
              {ids.map((pid, i) => {
                const p = prod(pid)!;
                const kariIn = poKariIn(c, pid, R.from, R.to);
                const key = `${tab}:${pid}`;
                const dis = hon && !kariIn;
                const setV = (v: number) => setQty((m) => ({ ...m, [key]: Math.max(0, v || 0) }));
                return (
                  <tr key={pid}>
                    <td>{i + 1}</td>
                    <td className="mono">{pid}</td>
                    <td><button className="lnk u" onClick={() => { PO.ym = ym; closeModal(); router.push(`/ops/purchasing/orders/${pid}`); }}>{p.name}</button>{p.short && <> <B v="短消費期限" c="b-warn" /></>}</td>
                    <td>{p.cat}</td>
                    <td>{supName(p.sup)}</td>
                    <td className="num">{n(poPast(c, pid, R.from, R.to))}</td>
                    <td className="num">{n(poBase(c, pid, R.from, R.to))}</td>
                    {hon && <><td className="num">{n(poOrderCnt(c, pid, R.from, R.to))}</td><td className="num">{n(kariIn)}</td></>}
                    <td style={{ width: '9.285714rem' }}>
                      <input className="inp" type="number" min={0} max={999999} step={p.short ? 1 : p.lot} value={q(tab, pid)} disabled={dis} title={dis ? 'この期間は仮発注されていません' : undefined} aria-label={`${p.name}の数量`} onChange={(e) => setV(+e.target.value)} />
                      {!dis && <div className="adj">{[3, 5, 10].map((d) => <button key={d} type="button" className="btn sm out" onClick={() => setV(q(tab, pid) + d)}>+{d}</button>)}</div>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p style={{ fontSize: '0.857143rem', color: 'var(--fg-3)', margin: '0.571429rem 0 0' }}>
          基準値＝対象期間の必要数（運営Web 商品注文管理の注文数＋調整数＋サンプル枠）。{hon ? '本発注数の初期値は仮発注数です。' : '仮発注数の初期値は、発注単位（サイクル×倉庫）ごとの必要数をロット（箱）単位に切り上げた数の合計です（短消費期限の商品は1倉庫×1納品日ごとに発注データを作ります）。'}
        </p>
      </div>
    </Box>
  );
}

/* ===== 発注済データ確認 ===== */
export function ShowPoModal({ ym, pid }: { ym: string; pid?: string }) {
  const { recs } = usePo();
  const { closeModal, toast } = useOps();
  const list = (recs ?? []).filter((x) => x.ym === ym && x.type !== '資材' && (!pid || x.pid === pid));
  const qty = list.reduce((s, x) => s + x.qty, 0);
  const amt = list.reduce((s, x) => s + x.amt, 0);
  const last = list.map((x) => x.at).sort().pop() || '—';
  return (
    <Box title={`発注済データ確認${pid ? `｜${prod(pid)!.name}` : ''}`} width={1100}
      head={<button className="btn csv sm" onClick={() => toast('CSVをダウンロードしました')}><Icon name="down" />CSVダウンロード</button>}
      footer={<><span style={{ flex: 1, color: 'var(--fg-3)', fontSize: '0.928571rem' }}>表示データ：{list.length}件</span><button className="btn lg" onClick={closeModal}>閉じる</button></>}>
      <p className="muted" style={{ margin: '0 0 0.857143rem' }}>{ym}メニューで作成済みの発注データ（仮発注・本発注）と金額です。</p>
      <div className="kpis">
        <div><small>発注件数</small><b>{list.length}件</b></div>
        <div><small>合計数量</small><b>{n(qty)}個</b></div>
        <div><small>合計金額（税抜）</small><b className="txt-ac">{yen(amt)}</b></div>
        <div><small>最終発注日</small><b>{last.slice(0, 10)}</b></div>
      </div>
      <div className="tbl-wrap">
        <table className="tbl">
          <thead><tr><th>発注番号</th><th>商品名</th><th>タイプ</th><th>仕入先</th><th>倉庫</th><th>納品期間</th><th className="num">数量</th><th className="num">金額（税抜）</th><th>ステータス</th><th>仕入先回答</th></tr></thead>
          <tbody>
            {list.length ? list.map((x) => (
              <tr key={x.no}><td className="mono">{x.no}</td><td>{x.name}</td><td>{typeBadge(x.type)}</td><td>{supName(x.sup)}</td><td>{x.wh}</td><td>{fmtDatesIn(x.period)}</td><td className="num">{n(x.qty)}個</td><td className="num">{yen(x.amt)}</td><td><B v={x.st2} /></td><td><B v={x.ansSt === '—' ? '' : x.ansSt} /></td></tr>
            )) : <tr><td colSpan={10} className="empty">まだ発注データはありません</td></tr>}
          </tbody>
        </table>
      </div>
    </Box>
  );
}

/* ===== 発注データ詳細（仕入先の回答・本発注の承認・入荷。受注不可・キャンセル・追加発注・代理入力） ===== */
const scaleRows = (rows: OrderRow[], q: number): OrderRow[] => {
  const tot = rows.reduce((a, r) => a + r.qty, 0) || 1;
  let left = q;
  const out = rows.map((r) => { const v = Math.floor((q * r.qty) / tot); left -= v; return { ...r, qty: v }; });
  if (out[0]) out[0].qty += left;
  return out.filter((r) => r.qty > 0);
};

type FormKind = null | 'pxEta' | 'pxHon' | 'pxShip' | 'fix' | 'cxl' | 'add';

function DetailFrame({ page, no, title, foot, children }: { page: boolean; no: string; title: React.ReactNode; foot: React.ReactNode; children: React.ReactNode }) {
  return page
    ? (
      <>
        <PageHead crumbs={['発注・入荷', '発注・入荷履歴', no]} title="発注データ詳細" />
        <div className="card">{children}<div style={{ display: 'flex', gap: '0.571429rem', alignItems: 'center', marginTop: '1.142857rem' }}>{foot}</div></div>
      </>
    )
    : <Box title={title} width={900} footer={foot}>{children}</Box>;
}
/** 発注データ詳細（page＝画面として開く。発注・入荷履歴の行から。台帳 I・2026-10-08） */
export function PoDetailPage({ no }: { no: string }) {
  return <PoDetailModal no={no} page />;
}
export function PoDetailModal({ no: no0, page = false }: { no: string; page?: boolean }) {
  const { orders, meta, plans, recs } = usePo();
  const { closeModal: closeM, toast, toastError } = useOps();
  const router = useRouter();
  const closeModal = () => (page ? router.push('/ops/purchasing/history') : closeM());
  const canAct = useCanAct();
  /* 発注の書き換え（orderOp の op ごとの権限）。権限がなければボタンを出さない */
  const canOp = (op: string) => canAct(api, 'orderOp', { op });
  const [no, setNo] = useState(no0);
  const [form, setForm] = useState<FormKind>(null);
  const [v, setV] = useState<Record<string, string>>({});
  const [err, setErr] = useState('');
  const x = recs?.find((r) => r.no === no);
  const o = x?.order;
  /* 詳細のタブ（詳細／変更履歴）。入荷の記録（回ごとの予定と実数・差異・対応）は共通データの入荷の記録から読む */
  const [tab, setTab] = useState<'detail' | 'hist'>('detail');
  const { data: rcv } = useDomainQuery(stockApi, 'receiving', { orders: o ? [poLike(o)] : [] });
  const rejUnseen = !!x && x.st2 === '受注不可' && !meta?.[no]?.rejSeen;
  useEffect(() => { if (rejUnseen) api.action('markSeen', { nos: [no], kind: 'reject' }).catch(() => undefined); }, [rejUnseen, no]);
  if (!orders || !x || !o) return <Box title={<>発注データ詳細 <span className="mono" style={{ fontSize: '1.142857rem' }}>{no}</span></>}><div className="empty">読み込み中…</div></Box>;

  const hn = x.hon_;
  const st = x.st2;
  const step = ['仮発注済', '納期回答済', '本発注済', '本発注承認済', '出荷済', '入荷済'];
  const cur = x.recvSt === '入荷済' ? 5 : x.ansSt === '出荷済' ? 4 : hn.st === '承認済' ? 3 : x.st === '本発注済' ? 2 : x.ansSt === '納期回答済' ? 1 : 0;
  const run = async (op: Parameters<typeof runOp>[0], msg: string) => {
    try {
      await runOp(op, orders);
      toast(msg);
      setForm(null);
      setErr('');
    } catch (e) {
      toastError(e);
    }
  };
  const open = (k: FormKind, init: Record<string, string> = {}) => { setForm(k); setV(init); setErr(''); };

  /* ---- 小さな入力モーダル（元の s6Form） ---- */
  if (form) {
    const back = () => { setForm(null); setErr(''); };
    const val = (k: string) => v[k] ?? '';
    const inp = (k: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => <input className="inp" id={'s6' + k} value={val(k)} onChange={(e) => setV({ ...v, [k]: e.target.value })} {...props} />;
    const F = ({ title, ok, okCls = 'pri', onOk, children }: { title: string; ok: string; okCls?: string; onOk: () => string | void | Promise<string | void>; children: React.ReactNode }) => (
      <Box title={title} width={560} closable={false}
        footer={<><span style={{ flex: 1 }} /><button className="btn lg ghost" onClick={back}>戻る</button><button className={`btn ${okCls} lg`} onClick={async () => { const e = await onOk(); if (e) setErr(e); }}>{ok}</button></>}>
        <div className="stack">{children}</div>
        <div className="emsg" style={{ marginTop: '0.571429rem' }}>{err}</div>
      </Box>
    );
    if (form === 'pxEta') return F({
      title: '代理入力：納期回答', ok: '入力する',
      onOk: () => { if (!val('d')) return '出荷予定日を入れてください'; return run({ op: 'proxyAnswer', no, eta: slash(val('d')), how: val('h') || 'メール' }, '納期回答を代理入力しました'); },
      children: <>
        <Field label="出荷予定日" req><DateInput className="inp" id="s6d" value={val('d')} onChange={(e) => setV({ ...v, d: e.target.value })} /></Field>
        <Field label="回答の受け方"><Sel value={val('h') || 'メール'} opts={['メール', '電話', 'FAX']} onChange={(h) => setV({ ...v, h })} /></Field>
        <div className="hint">ログインしない仕入先（発注方法＝メール）などの回答を、運営が代わりに入れます。</div>
      </>,
    });
    if (form === 'pxHon') return F({
      title: '代理入力：本発注の承認', ok: '承認を入力する',
      onOk: () => {
        if (!val('d') || !(+val('b') > 0)) return '納品日と入荷箱数を入れてください';
        /* 賞味期限（消費期限）は必須・資材は持たない（台帳 E 2026-10-05） */
        if (o.type !== '資材' && !val('bb')) return `${o.type === '短消費期限' ? '消費期限' : '賞味期限'}を入れてください`;
        return run({ op: 'proxyHon', no, dlv: slash(val('d')), box: +val('b'), ...(o.type !== '資材' ? { bb: slash(val('bb')) } : {}) }, '本発注の承認を代理入力しました');
      },
      children: <>
        <Field label="納品日（倉庫に届く日）" req><DateInput className="inp" id="s6d" value={val('d')} onChange={(e) => setV({ ...v, d: e.target.value })} /></Field>
        <Field label="入荷箱数" req>{inp('b', { type: 'number', min: 1, max: 999999 })}</Field>
        {o.type !== '資材' && <Field label={o.type === '短消費期限' ? '消費期限' : '賞味期限'} req><DateInput className="inp" id="s6bb" value={val('bb')} onChange={(e) => setV({ ...v, bb: e.target.value })} /></Field>}
      </>,
    });
    if (form === 'pxShip') return F({
      title: '出荷報告を代理入力', ok: '出荷報告を入力する',
      onOk: () => {
        if (!val('d')) return '出荷日を入れてください';
        if (!(val('m') || METHODS[0])) return '配送方法を選択してください';
        if ((val('m') || METHODS[0]).startsWith('直送') && !val('c')) return '運送会社を選択してください';
        /* 賞味期限（消費期限）は必須・資材は持たない。出荷日より後（台帳 E 2026-10-05） */
        if (o.type !== '資材') {
          const lb = o.type === '短消費期限' ? '消費期限' : '賞味期限';
          if (!val('bb')) return `${lb}を入れてください`;
          if (val('bb') <= val('d')) return `${lb}は出荷日より後の日付にしてください`;
        }
        return run({ op: 'proxyShip', no, ship: slash(val('d')), method: val('m') || METHODS[0], carrier: val('c'), slip: val('s'), ...(o.type !== '資材' ? { bb: slash(val('bb')) } : {}) }, '出荷報告を代理入力しました');
      },
      children: <>
        <Field label="出荷日" req><DateInput className="inp" id="s6d" value={val('d')} onChange={(e) => setV({ ...v, d: e.target.value })} /></Field>
        <Field label="配送方法" req><Sel value={val('m') || METHODS[0]} opts={METHODS} ph={null} onChange={(m) => setV({ ...v, m })} /></Field>
        <Field label="運送会社" req={(val('m') || METHODS[0]).startsWith('直送')}><Sel value={val('c')} opts={CARRIERS} ph="（選ばない）" onChange={(c) => setV({ ...v, c })} /></Field>
        <Field label="送り状番号">{inp('s', { maxLength: 60 })}</Field>
        {o.type !== '資材' && <Field label={o.type === '短消費期限' ? '消費期限' : '賞味期限'} req><DateInput className="inp" id="s6bb" value={val('bb')} onChange={(e) => setV({ ...v, bb: e.target.value })} /></Field>}
        <div className="hint">発注方法＝外部の仕入先（仕入先の発注システムで出荷した分）の出荷報告を、運営が代わりに入れます。分納のときは、まだ出荷していない先の回から順に入れます。出荷報告のあとは、入荷登録ができます。</div>
      </>,
    });
    if (form === 'fix') return F({
      title: '本発注数を直す（承認前だけ）', ok: '直す',
      onOk: () => { const q = +val('q'); if (!(q > 0)) return '1以上の数を入れてください'; return run({ op: 'changeHon', no, qty: q, rows: scaleRows(o.rows, q) }, `本発注数を ${x.hon} → ${q} に直しました。仕入先に再承認を依頼しました`); },
      children: <>
        <Field label="本発注数" req>{inp('q', { type: 'number', min: 1, max: 999999 })}</Field>
        <div className="hint">仕入先がまだ本発注を承認していないので直せます。直すと仕入先に再承認をメールで依頼し、変更前後を履歴に残します。</div>
      </>,
    });
    if (form === 'cxl') return F({
      title: '発注を取り消す', ok: '取り消す', okCls: 'dan-solid',
      onOk: () => { if (!val('r').trim()) return '理由を入れてください'; return run({ op: 'cancel', nos: [no], reason: val('r').trim() }, '発注を取り消しました（仕入先にメール）'); },
      children: <>
        <Field label="理由" req>{inp('r', { placeholder: '例）メニュー変更のため', maxLength: 60 })}</Field>
        <div className="hint">キャンセルは消さずに履歴に残し、仕入先サイトの「キャンセル」タブとメールで知らせます。減らしたいときは、キャンセルして出し直します。</div>
      </>,
    });
    if (form === 'add') return F({
      title: '追加発注', ok: '追加発注する',
      onOk: async () => {
        const q = +val('q');
        if (!(q > 0)) return '1以上の数を入れてください';
        const p = prod(x.pid)!;
        const d = normalData(x.ym, p, orders, plans?.[planId(x.ym, x.pid)]);
        const base = d.units.find((u) => u.order?.no === no) ?? d.units.find((u) => u.wh === x.wh);
        if (!base) return 'この発注の発注単位が見つかりません';
        const nu = addOrder(x.ym, p, base, d.units.length, q, val('r') || '締切後に承認された申込', nowStamp());
        try {
          await runOp({ op: 'create', orders: [nu] }, orders);
          toast(`追加発注しました（${nu.no}）`);
          setForm(null);
          setNo(nu.no);
        } catch (e) {
          toastError(e);
        }
      },
      children: <>
        <Field label="数量" req>{inp('q', { type: 'number', min: 1, max: 999999 })}</Field>
        <Field label="理由"><Sel value={val('r') || '締切後に承認された申込'} opts={['締切後に承認された申込', 'お試し（発注締め日に間に合った分）', '営業サンプルの締め後の追加', 'その他']} onChange={(r) => setV({ ...v, r })} /></Field>
        <div className="hint">オーダー締切の後に増えた分を、新しい発注データ（本発注）として作ります。仕入先には納期回答と本発注の承認を依頼します。</div>
      </>,
    });
  }

  const rcRows = (rcv ?? []).find((r) => r.no === o.no)?.receipts ?? [];
  const live = st !== '取消済' && st !== '受注不可';
  /* 入荷の記録は入荷登録の1か所（数・箱数・入荷日・期限を入れる：台帳 I・2026-10-07）。ここは入荷登録を開くリンクだけ。資材は出荷の報告がなく、運営が入荷を入れる */
  let act: React.ReactNode = null;
  if (st !== '取消済' && x.recvSt !== '入荷済' && canOp('receive') && (x.ansSt === '出荷済' || (x.type === '資材' && x.st === '本発注済'))) {
    act = <Link className="btn pri" href="/ops/purchasing/receiving" onClick={closeModal}>入荷登録を開く</Link>;
  }
  const add: React.ReactNode[] = [];
  let cx: React.ReactNode = null;
  if (live) {
    if (x.ansSt === '納期回答待ち') {
      if (canOp('proxyAnswer')) add.push(<button key="px" className="btn out" onClick={() => open('pxEta', { d: iso(addDays(TODAY(), 3)), h: 'メール' })}>代理入力：納期回答</button>);
    }
    if (x.st === '本発注済' && hn.st === '承認待ち') {
      if (canOp('changeHon')) add.push(<button key="fix" className="btn out" onClick={() => open('fix', { q: String(x.hon) })}>本発注数を直す（承認前だけ）</button>);
      if (canOp('proxyHon')) add.push(<button key="pxh" className="btn out" onClick={() => open('pxHon', { d: iso(addDays(x.eta || TODAY(), 1)), b: String(Math.ceil(x.hon / lotOf(x.pid))) })}>代理入力：本発注の承認</button>);
    }
    if (x.st === '本発注済' && hn.st === '承認済' && x.ansSt !== '出荷済' && canOp('proxyShip')) {
      const p0 = o.parts.find((p) => p.st === '未出荷');
      add.push(<button key="pxs" className="btn out" onClick={() => open('pxShip', { d: iso(TODAY()), c: '', s: '', bb: p0?.bb ? iso(p0.bb) : '' })}>代理入力：出荷報告</button>);
    }
    if (x.recvSt !== '入荷済' && x.ansSt !== '出荷済' && canOp('cancel')) cx = <button className="btn dan" onClick={() => open('cxl')}>発注を取り消す</button>;
  }
  if (x.st === '本発注済' && x.type === '通常' && st !== '取消済' && canOp('create')) add.push(<button key="add" className="btn out" onClick={() => open('add', { q: String(lotOf(x.pid) * 2), r: '締切後に承認された申込' })}>追加発注</button>);
  if (st === '受注不可' && canOp('cancel')) cx = <button className="btn dan" onClick={() => open('cxl')}>発注を取り消す</button>;

  const title = <>発注データ詳細 <span className="mono" style={{ fontSize: '1.142857rem' }}>{no}</span></>;
  const foot = <>{cx}<span style={{ flex: 1 }} />{add}{act}<button className="btn lg" onClick={closeModal}>{page ? '履歴へ戻る' : '閉じる'}</button></>;
  return (
    <DetailFrame page={page} no={no} title={title} foot={foot}>
      {o.add && <Info><B v="追加発注" /> {fmtDateTime(o.orderedAt)}｜理由：{o.add}（オーダー締切の後に増えた分）</Info>}
      {st === '受注不可' && <Info kind="ng"><b>仕入先が受注不可と回答</b>｜理由：{o.reject?.reason}｜{o.reject?.comment}<br />別の仕入先に手配するか、この発注をキャンセルしてください。</Info>}
      {st === '取消済' && <Info kind="ng"><b>取消済</b>（{fmtDateTime(o.cancel?.at)}・{o.cancel?.by}）｜理由：{o.cancel?.reason}。仕入先サイトの「キャンセル」タブとメールで知らせています。</Info>}
      {o.proxy && <Info><B v="代理入力" /> {o.proxy}</Info>}
      {x.st === '本発注済' && hn.st === '承認済' && st !== '取消済' && <div className="hint" style={{ margin: '0 0 0.571429rem' }}>仕入先が本発注を承認したため、数量は直せません。増やすときは「追加発注」、減らすときは「キャンセル」して出し直します（どちらも履歴に残ります）。</div>}
      <div className="tabs" style={{ marginBottom: '0.857143rem' }}>
        <button className={tab === 'detail' ? 'on' : ''} onClick={() => setTab('detail')}>詳細</button>
        <button className={tab === 'hist' ? 'on' : ''} onClick={() => setTab('hist')}>変更履歴</button>
      </div>
      {tab === 'hist' ? (
        <>
          <div className="hint" style={{ margin: '0 0 0.571429rem' }}>数量を直した・キャンセルした・追加した・請求照合を変えたことを、新しいものを上にして残します（直せない・消せない）。</div>
          <div className="tbl-wrap"><table className="tbl">
            <thead><tr><th>日時</th><th>操作した人</th><th>操作</th></tr></thead>
            <tbody>
              {[...(o.hist ?? []).map((h) => ({ at: h.at, who: h.who, t: h.t })), ...((meta?.[no]?.billLog ?? []).map((l) => ({ at: l.at, who: l.by, t: `請求照合：${l.from} → ${l.to}` })))]
                .sort((a, b) => (a.at < b.at ? 1 : a.at > b.at ? -1 : 0))
                .map((h, i) => <tr key={i}><td>{fmtDateTime(h.at)}</td><td>{h.who}</td><td>{h.t}</td></tr>)}
              {!(o.hist ?? []).length && !(meta?.[no]?.billLog ?? []).length && <tr><td colSpan={3} className="empty">履歴はありません</td></tr>}
            </tbody>
          </table></div>
        </>
      ) : (
        <>
      <ol className="steps">{step.map((s, i) => <li key={s} className={`${i <= cur ? 'done' : ''} ${i === cur ? 'cur' : ''}`}><i>{i + 1}</i>{disp(s)}</li>)}</ol>
      <Sec title="発注情報">
        <div className="kvgrid">
          <Kv l="商品名" v={x.name} /><Kv l="品番" v={<span className="mono">{x.pid}</span>} /><Kv l="メニュー年月" v={x.ym} /><Kv l="仕入先" v={supName(x.sup)} />
          <Kv l="納入倉庫" v={x.wh} /><Kv l="納品期間" v={fmtDatesIn(x.period)} /><Kv l="仮発注数" v={n(x.kari) + '個'} /><Kv l="本発注数" v={x.st === '本発注済' ? n(x.hon) + '個' : '—（未確定）'} />
          <Kv l="発注金額（税抜）" v={yen(x.amt)} /><Kv l="発注ステータス" v={<B v={st} />} />{x.bb && <Kv l="希望消費期限" v={fmtDate(x.bb)} />}<Kv l="最終発注日時" v={x.at} />
        </div>
      </Sec>
      {x.st === '本発注済' && (
        <Sec title={<>本発注の承認（仕入先） <B v={hn.st} /></>}>
          <div className="kvgrid">
            <Kv l="本発注日時" v={x.at} /><Kv l="承認日時" v={hn.at} /><Kv l="納品日" v={hn.parts ? [...new Set(hn.parts.map((z) => z.dlv))].map(fmtDate).join('・') : ''} /><Kv l="入荷箱数（合計）" v={hn.box ? n(hn.box) + '箱' : ''} />
          </div>
          {hn.parts ? (
            <div className="tbl-wrap" style={{ marginTop: '0.714286rem' }}>
              <table className="tbl">
                <thead><tr><th>{hn.parts.length > 1 ? '回' : ''}</th><th>出荷予定日</th><th>納品日</th><th className="num">数量</th><th className="num">入荷箱数</th></tr></thead>
                <tbody>{hn.parts.map((z, i) => <tr key={i}><td>{hn.parts!.length > 1 ? `${i + 1}回目` : '全量'}</td><td>{fmtDate(z.eta) || '—'}</td><td>{fmtDate(z.dlv) || '—'}</td><td className="num">{n(z.qty)}個</td><td className="num">{n(z.box)}箱</td></tr>)}</tbody>
              </table>
            </div>
          ) : <div className="hint" style={{ marginTop: '0.571429rem' }}>仕入先が本発注を承認すると、納品日と入荷箱数がここに表示されます。</div>}
        </Sec>
      )}
      <Sec title={<>仕入先回答 {x.ansSt !== '—' && <B v={x.ansSt} />}</>}>
        <div className="kvgrid">
          <Kv l="出荷予定日（納期回答）" v={x.eta} /><Kv l="出荷日" v={x.ship} /><Kv l="配送方法" v={x.ship ? o.method || '直送（運送会社利用）' : ''} /><Kv l="運送会社" v={x.carrier} />
          <Kv l="送り状番号" v={x.slip ? <span className="mono">{x.slip}</span> : ''} /><Kv l="賞味期限" v={x.bbOut} />
        </div>
      </Sec>
      {(meta?.[no]?.billLog?.length ?? 0) > 0 && (
        <Sec title="請求照合の変更履歴">
          <div className="tbl-wrap"><table className="tbl">
            <thead><tr><th>日時</th><th>変更した人</th><th>変更前</th><th>変更後</th></tr></thead>
            <tbody>{[...meta![no].billLog!].reverse().map((l, i) => <tr key={i}><td>{fmtDateTime(l.at)}</td><td className="mono">{l.by}</td><td><B v={l.from} /></td><td><B v={l.to} /></td></tr>)}</tbody>
          </table></div>
        </Sec>
      )}
      <Sec title={<>入荷状況 <B v={x.recvSt} /></>}>
        <div className="kvgrid">
          <Kv l="入荷日" v={x.recvDate} /><Kv l="入荷数" v={x.recvSt === '入荷済' ? n(x.qty) + '個' : ''} /><Kv l="入荷倉庫" v={x.recvSt === '入荷済' ? x.wh : ''} />
        </div>
        {rcRows.length > 0 && (
          <div className="tbl-wrap" style={{ marginTop: '0.714286rem' }}>
            <table className="tbl">
              <thead><tr><th>回</th><th>入荷日</th><th className="num">予定の数</th><th className="num">入荷した数</th><th className="num">箱数</th><th>賞味期限／消費期限</th><th>状態</th><th>差異の対応</th></tr></thead>
              <tbody>
                {rcRows.map((r) => (
                  <tr key={r.id}>
                    <td>{r.part}回目</td><td>{fmtDate(r.receivedOn)}</td><td className="num">{n(r.planQty)}個</td><td className="num">{n(r.qty)}個</td><td className="num">{n(r.box)}箱</td>
                    <td>{r.bb ? fmtDate(r.bb) : '—'}</td><td><B v={r.status === '一致' ? '一致' : r.status} c={r.status === '一致' ? 'b-ok' : r.status === '対応済' ? 'b-info' : 'b-ng'} /></td>
                    <td>{r.fix ? <>{r.fix.how}{r.fix.nextOn ? `（次の入荷予定 ${fmtDate(r.fix.nextOn)}）` : ''}{r.fix.altId ? `（${r.fix.altId}）` : ''}</> : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Sec>
        </>
      )}
    </DetailFrame>
  );
}

/* ===== 商品追加（メニューにない商品を、その月の発注に足す。台帳 I・2026-10-07・資材は足さない） ===== */
const OFF_REASONS = ['代替品', '営業サンプルの追加', 'その他'];
export function AddProductModal({ ym }: { ym: string }) {
  const { orders } = usePo();
  const { closeModal, toast, toastError } = useOps();
  const inMenu = new Set(menuPids(ym, orders ?? []));
  const cands = PRODS.filter((p) => !inMenu.has(p.id));
  const [pid, setPid] = useState('');
  const [wh, setWh] = useState('');
  const [k, setK] = useState('');
  const [qty, setQty] = useState('');
  const [wish, setWish] = useState('');
  const [bb, setBb] = useState('');
  const [reason, setReason] = useState('その他');
  const [err, setErr] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const p = prod(pid);
  const slotOpts: [string, string][] = Array.from({ length: 28 }, (_, i) => [String(i), `${SLOT(i)}（${slash(slotDate(ym, i)).slice(5)}）`]);
  /* 納品日を選んだら、入荷希望日と期限の初期値を入れる（直せる） */
  const pickK = (v: string) => {
    setK(v);
    if (v === '') return;
    const d = slotDate(ym, +v);
    if (!wish) setWish(iso(addDays(d, -3)));
    if (!bb && p) setBb(iso(addDays(d, p.short ? p.g : 30)));
  };
  const submit = async () => {
    const e: Record<string, string> = {};
    if (!p) e.pid = '商品を選択してください';
    if (!wh) e.wh = '納入倉庫を選択してください';
    if (k === '') e.k = '顧客納品日を選択してください';
    const q = Number(qty);
    if (!qty || !(q >= 1) || !Number.isInteger(q) || q > 999999) e.qty = '数量は1〜999,999の整数で入力してください';
    if (!wish) e.wish = '入荷希望日を入力してください';
    if (!bb) e.bb = (p?.short ? '希望消費期限' : '希望賞味期限') + 'を入力してください';
    else if (p?.short && k !== '' && slash(bb) <= slash(slotDate(ym, +k))) e.bb = '希望消費期限は顧客納品日より後にしてください';
    else if (p?.short && k !== '' && (new Date(slash(bb)).getTime() - new Date(slotDate(ym, +k)).getTime()) / 86400000 < p.g) e.bb = `希望消費期限が保証日数（${p.g}日）に足りません`;
    setErr(e);
    if (Object.keys(e).length || !p) return;
    setBusy(true);
    try {
      const order = offMenuOrder(ym, p, { wh, k: +k, qty: p.short ? q : lotUp(q, p.lot), wish, bb, reason }, orders ?? [], nowStamp());
      await runOp({ op: 'create', orders: [order] }, orders ?? []);
      closeModal();
      toast(`商品を追加しました（${order.no}）。メニュー外の商品として一覧に出ます`);
    } catch (x) { toastError(x); } finally { setBusy(false); }
  };
  return (
    <Box title="商品追加（メニュー以外の商品）" width={640}
      footer={<><span style={{ flex: 1 }} /><button className="btn lg ghost" onClick={closeModal}>キャンセル</button><button className="btn pri lg" disabled={busy} onClick={submit}>追加</button></>}>
      <Info>{ym} のメニューにない商品（お菓子・ドレッシングなど）を仮発注として足します。<b>資材は足せません</b>（資材発注から）。足した商品は一覧に「メニュー外」の印つきで出ます。</Info>
      <div className="fg c2">
        <Field label="商品" req err={err.pid}><Sel value={pid} opts={cands.map((c) => [c.id, `${c.name}（${c.id}・${c.short ? '短消費期限' : '通常'}）`])} ph="選択…" onChange={(v) => { setPid(v); setBb(''); }} err={!!err.pid} ariaLabel="商品" /></Field>
        <Field label="納入倉庫" req err={err.wh}><Sel value={wh} opts={WH} ph="選択…" onChange={setWh} err={!!err.wh} ariaLabel="納入倉庫" /></Field>
        <Field label="顧客納品日" req err={err.k}><Sel value={k} opts={slotOpts} ph="選択…" onChange={pickK} err={!!err.k} ariaLabel="顧客納品日" /></Field>
        <Field label={`数量${p && !p.short ? `（${p.lot}個／箱単位に切り上げ）` : ''}`} req err={err.qty}><input className={`inp ${err.qty ? 'err' : ''}`} type="number" min={1} max={999999} value={qty} onChange={(ev) => setQty(ev.target.value)} aria-label="数量" /></Field>
        <Field label="入荷希望日" req err={err.wish}><DateInput className={`inp ${err.wish ? 'err' : ''}`} value={wish} onChange={(ev) => setWish(ev.target.value)} /></Field>
        <Field label={p?.short ? '希望消費期限' : '希望賞味期限'} req err={err.bb}><DateInput className={`inp ${err.bb ? 'err' : ''}`} value={bb} onChange={(ev) => setBb(ev.target.value)} /></Field>
        <Field label="理由"><Sel value={reason} opts={OFF_REASONS} ph={null} onChange={setReason} ariaLabel="理由" /></Field>
      </div>
    </Box>
  );
}

/* ===== 短消費期限商品の追加発注（行を足す。台帳 I・2026-10-07） ===== */
const ADD_REASONS = ['締切後に承認された申込', 'お試し（発注締め日に間に合った分）', '営業サンプルの締め後の追加', 'その他'];
export function AddShortLineModal({ ym, pid }: { ym: string; pid: string }) {
  const { orders } = usePo();
  const { closeModal, toast, toastError } = useOps();
  const p = prod(pid)!;
  const [wh, setWh] = useState('');
  const [k, setK] = useState('');
  const [qty, setQty] = useState('');
  const [wish, setWish] = useState('');
  const [bb, setBb] = useState('');
  const [reason, setReason] = useState(ADD_REASONS[0]);
  const [err, setErr] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const slotOpts: [string, string][] = Array.from({ length: 28 }, (_, i) => [String(i), `${SLOT(i)}（${slash(slotDate(ym, i)).slice(5)}）`]);
  const pickK = (v: string) => {
    setK(v);
    if (v === '') return;
    const d = slotDate(ym, +v);
    if (!wish) setWish(iso(addDays(d, -3)));
    setBb(iso(addDays(d, p.g)));
  };
  const submit = async () => {
    const e: Record<string, string> = {};
    if (!wh) e.wh = '納入倉庫を選択してください';
    if (k === '') e.k = '顧客納品日を選択してください';
    const q = Number(qty);
    if (!qty || !(q >= 1) || !Number.isInteger(q) || q > 999999) e.qty = '数量は1〜999,999の整数で入力してください';
    if (!wish) e.wish = '入荷希望日を入力してください';
    if (!bb) e.bb = '希望消費期限を入力してください';
    else if (k !== '' && (new Date(slash(bb)).getTime() - new Date(slotDate(ym, +k)).getTime()) / 86400000 < p.g) e.bb = `希望消費期限が保証日数（${p.g}日）に足りません`;
    setErr(e);
    if (Object.keys(e).length) return;
    setBusy(true);
    try {
      const order = addShortOrder(ym, p, { wh, k: +k, qty: q, wish, bb, reason }, orders ?? [], nowStamp());
      await runOp({ op: 'create', orders: [order] }, orders ?? []);
      closeModal();
      toast(`追加発注しました（${order.no}）`);
    } catch (x) { toastError(x); } finally { setBusy(false); }
  };
  return (
    <Box title={`追加発注（行を足す）｜${p.name}`} width={640}
      footer={<><span style={{ flex: 1 }} /><button className="btn lg ghost" onClick={closeModal}>キャンセル</button><button className="btn pri lg" disabled={busy} onClick={submit}>追加発注する</button></>}>
      <Info>オーダー締切の後に増えた分を、行（倉庫×顧客納品日）として足し、新しい発注データ（本発注）を作ります。仕入先には納期回答と本発注の承認を依頼します。</Info>
      <div className="fg c2">
        <Field label="納入倉庫" req err={err.wh}><Sel value={wh} opts={WH} ph="選択…" onChange={setWh} err={!!err.wh} ariaLabel="納入倉庫" /></Field>
        <Field label="顧客納品日" req err={err.k}><Sel value={k} opts={slotOpts} ph="選択…" onChange={pickK} err={!!err.k} ariaLabel="顧客納品日" /></Field>
        <Field label="数量" req err={err.qty}><input className={`inp ${err.qty ? 'err' : ''}`} type="number" min={1} max={999999} value={qty} onChange={(ev) => setQty(ev.target.value)} aria-label="数量" /></Field>
        <Field label="入荷希望日" req err={err.wish}><DateInput className={`inp ${err.wish ? 'err' : ''}`} value={wish} onChange={(ev) => setWish(ev.target.value)} /></Field>
        <Field label="希望消費期限" req err={err.bb}><DateInput className={`inp ${err.bb ? 'err' : ''}`} value={bb} onChange={(ev) => setBb(ev.target.value)} /></Field>
        <Field label="理由"><Sel value={reason} opts={ADD_REASONS} ph={null} onChange={setReason} ariaLabel="理由" /></Field>
      </div>
    </Box>
  );
}
