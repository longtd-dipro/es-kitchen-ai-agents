'use client';

import { useOpsLeaveGuard } from '@/app/ops/_ui/leaveGuard';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { altOf, menuPids, normalData, planId, poSum, shortData } from '@/lib/ops/purchasing/logic';
import { IN_MENU, MENU, MONTHS, n, prod, supName, supOK } from '@/lib/ops/purchasing/master';
import { Icon } from '../../_ui/Icon';
import { useOps } from '../../_ui/OpsProvider';
import { ConfirmModal, PageHead } from '../../_ui/ui';
import { B, Info, Kv, Sel, yen } from './common';
import { BulkModal, ShowPoModal } from './PoModals';
import { PO, usePo } from './usePo';
import NormalBody from '../orders/[pid]/NormalBody';
import ShortBody from '../orders/[pid]/ShortBody';

/**
 * 発注詳細の共通の枠。通常商品（発注単位ごと）と短消費期限商品（行〔倉庫×納品日〕ごと）は別の画面として使う
 * （orders/[pid]/NormalDetailPage.tsx・ShortDetailPage.tsx。台帳 I・2026-10-07）。
 */
export function PoDetailShell({ pid, short }: { pid: string; short: boolean }) {
  const router = useRouter();
  const { openModal, toast } = useOps();
  const { orders, plans, esLife } = usePo();
  /* 消費期限の保証日数は商品マスタの ES の期限（あれば。2026/10/03 回答） */
  const p0 = prod(pid), p = p0 && esLife?.[pid] ? { ...p0, g: esLife[pid] } : p0;
  const yms = MONTHS.filter((m) => menuPids(m, orders ?? []).includes(pid));
  const [ymSel, setYmState] = useState(PO.ym);
  /* 商品追加で足したメニュー外の商品は、発注の一覧が読めてから月が決まる */
  const ym = yms.includes(ymSel) ? ymSel : yms[0];
  /** 未保存の変更がある発注単位の番号（仮発注済の単位の数量変更） */
  const [dirty, setDirty] = useState<number[]>([]);
  useEffect(() => { if (orders && (!p || !ym)) router.replace('/ops/purchasing/orders'); }, [orders, p, ym, router]);
  useOpsLeaveGuard(dirty.length > 0);
  useEffect(() => {
    if (!dirty.length) return;
    const f = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', f);
    return () => window.removeEventListener('beforeunload', f);
  }, [dirty.length]);
  if (!p || !ym) return null;
  if (!orders || !plans) return <div className="card"><div className="empty">読み込み中…</div></div>;

  /* 未保存の変更があれば確かめてから移る */
  const guard = (then: () => void) => {
    if (!dirty.length) { then(); return; }
    openModal(<ConfirmModal kind="warn" title="未保存の変更" text={<>発注単位 {dirty.join('・')} の数量変更が保存されていません。<br />破棄すると変更前の数量に戻ります。破棄して移動しますか？</>} ok="破棄して移動" okCls="warn-solid" cancel="編集を続ける" onOk={() => { setDirty([]); then(); }} />);
  };
  const setYm = (v: string) => guard(() => { PO.ym = v; setYmState(v); });
  const plan = plans[planId(ym, pid)];
  const s = poSum(ym, p, orders, plan);
  /* 仕入先が未発行（仕入先Webのアカウントなし）でも、運営が発注し、回答・承認・出荷報告は運営が代理入力する（台帳 I・2026-10-08） */
  const unissued = !supOK(pid);
  const alt = altOf(ym, pid);
  const unitW = p.short ? '件' : '単位';
  const kv = (l: string, v: React.ReactNode, c = '') => <Kv l={l} v={v} c={c} />;
  const nDirty = dirty.length;

  return (
    <>
      <PageHead crumbs={['発注・入荷', '発注', short ? '発注詳細（短消費期限商品）' : '発注詳細（通常商品）']} title={short ? '発注詳細（短消費期限商品）' : '発注詳細（通常商品）'}>
        <button className="btn ghost lg" onClick={() => openModal(<ShowPoModal ym={ym} pid={pid} />)}><Icon name="down" />発注済データ確認</button>
        <button className="btn pri lg" onClick={() => openModal(<BulkModal kind="hon" ym={ym} ids={[pid]} onDone={() => undefined} />)}>本発注</button>
      </PageHead>
      {alt && <Info><b>代替品設定 ALT-2610-0001</b>：{alt.why} {alt.n > 0 ? '+' : '−'}{Math.abs(alt.n)}個。{alt.no ? <>本発注済みのため、追加の発注データ <b className="mono">{alt.no}</b>（関東倉庫・関西倉庫）を作成しました。仕入先の回答待ち。</> : '仮発注・本発注の必要数から引きました（本発注済みの分は倉庫の不良ロットとして出荷停止・仕入先へ返品）。'}</Info>}
      <div className="card">
        <div className="poPick" style={{ marginBottom: '0.714286rem' }}>
          <label htmlFor="po-prod">対象商品</label>
          <Sel id="po-prod" value={pid} opts={menuPids(ym, orders).map((id) => [id, `${prod(id)!.name}（${id}）`])} onChange={(v) => guard(() => router.push(`/ops/purchasing/orders/${v}`))} />
          <label htmlFor="po-ym">メニュー年月</label>
          <Sel id="po-ym" value={ym} opts={yms} onChange={setYm} />
          <span className={`badge ${p.short ? 'b-warn' : 'b-mute'}`} style={{ marginLeft: 'auto' }}>{short ? '短消費期限商品' : '通常商品'}</span>
        </div>
        {unissued && <Info>仕入先「{supName(p.sup)}」は未発行（仕入先Webのアカウントなし）です。仕入先の回答・本発注の承認・出荷報告は、メール・電話などシステム外で受けて、運営が代理入力します。</Info>}
        {p.short && <Info kind="warn">この商品は短消費期限商品です。1倉庫×1顧客納品日＝1発注データとして管理します。消費期限の残日数が保証基準（{p.g}日）を満たしているか確認してください。</Info>}
        {/* 商品の基本情報は1つの帯にまとめる（画面がうるさくならないように：hong 2026-10-08） */}
        <div className="pinfo" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.285714rem 1.714286rem', fontSize: '0.928571rem', color: 'var(--fg-2)', marginBottom: '0.714286rem' }}>
          <span>品番 <b className="mono">{pid}</b></span>
          <span>仕入時の商品名 <b>{p.pname}</b></span>
          <span>{p.cat}／{p.keep}</span>
          <span>仕入先 <b>{supName(p.sup)}</b>{unissued && <> <span className="badge b-ng" title="仕入先Webのアカウントが未発行です（回答・承認・出荷報告は運営が代理入力）">仕入先未発行</span></>}</span>
          <span>仕入単価 <b>{yen(p.cost)}</b>（税抜）</span>
          <span>ロット <b>{p.short ? '1個' : `${p.lot}個／箱`}</b></span>
          {p.short ? <span className="txt-ng">消費期限保証 <b>{p.g}日</b>（製造後 {p.life}日）</span> : <span>オーダー締切 <b>{MENU[ym].deadline}</b></span>}
        </div>
        <div className="sumbar">
          {kv('オーダー数', `${n(s.order)}個`)}{kv('総必要数', `${n(s.need)}個`)}{kv('総仮発注数', `${n(s.kari)}個`, 'txt-ac')}{kv('本発注数', `${n(s.hon)}個`)}{kv(p.short ? '発注件数' : '発注単位数', `${s.n}${unitW}`)}
          <div className="chipline">
            {s.nHon > 0 && <B v={`${s.nHon}${unitW} 本発注済`} c="b-ok" />}
            {s.nKari > 0 && <B v={`${s.nKari}${unitW} 仮発注済`} c="b-info" />}
            {s.nNone > 0 && <B v={`${s.nNone}${unitW} 未発注`} c="b-mute" />}
            {s.nErr > 0 && <B v={`${s.nErr}件 エラー`} c="b-ng" />}
            {nDirty > 0 && <B v={`${nDirty}単位 未保存の変更`} c="b-warn" />}
          </div>
        </div>
      </div>
      {p.short
        ? <ShortBody key={ym + pid} ym={ym} p={p} orders={orders} plan={plan} data={shortData(ym, p, orders, plan)} />
        : <NormalBody key={ym + pid} ym={ym} p={p} orders={orders} plan={plan} data={normalData(ym, p, orders, plan)} onDirty={setDirty} />}
    </>
  );
}
