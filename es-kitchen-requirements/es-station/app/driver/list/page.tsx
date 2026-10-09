'use client';

import { badgeOf, mdW, weekRange } from '@/lib/driver/logic';
import type { DeliveryView } from '@/lib/driver/types';
import { today } from '@/lib/supplier/dates';
import { Icon } from '../_ui/Icon';
import { useDraft, useDriver } from '../_ui/DriverProvider';
import { delHref, ptHref } from '../_ui/nav';
import { DelCard, HHead, Loading, Modal, PtCard, TabBar, useNav } from '../_ui/parts';
import { useDay } from '../_ui/useDay';

type L = { tab: 'A' | 'B' | 'C'; q: string; st: string; pt: string; type: string; tonly: boolean };
const L0: L = { tab: 'A', q: '', st: 'all', pt: 'all', type: 'all', tonly: false };

/** 配送一覧（元の V.list・DA_LIST_001〜003）：倉庫受取・未配送・配送完了 */
export default function DriverList() {
  const { data, ptOf, delsOf } = useDay();
  const { toast, openModal, closeModal } = useDriver();
  const nav = useNav();
  const [L, setL] = useDraft<L>('list', L0);
  if (!data) return <><Loading /><TabBar on="list" /></>;
  const { points, dels, me } = data;
  const q = L.q.trim();
  const uns = dels.filter((d) => d.status !== '配送完了' && !d.later), dn = dels.filter((d) => d.status === '配送完了');
  const openDel = (d: DeliveryView) => (d.later ? toast(`この配送の納品日は ${d.later} です。今日は受取だけです`) : nav.go(delHref(d)));
  const date = mdW(today());

  /** 絞り込み（元の filter モーダル。下から出るシート） */
  const filter = () => {
    const Sheet = () => {
      const [x, setX] = useDraft<L>('list', L0);
      const opt = (k: 'st' | 'pt' | 'type', v: string, l: string) => <button type="button" key={v} className={`fopt ${x[k] === v ? 'on' : ''}`} onClick={() => setX({ ...x, [k]: v })}>{l}</button>;
      return (
        <Modal sheet onBack={closeModal}>
          <h3>絞り込み</h3>
          {x.tab === 'A' ? (
            <><div className="flab">ステータス</div><div className="fopts">{opt('st', 'all', 'すべて')}{opt('st', '未受取', '未受取')}{opt('st', '受取済', '受取済')}{opt('st', 'トラブル', 'トラブル')}</div></>
          ) : (
            <>
              <div className="flab">倉庫・中継</div><div className="fopts">{opt('pt', 'all', 'すべて')}{points.map((p) => opt('pt', p.id, p.name))}</div>
              <div className="flab">便の種類</div><div className="fopts">{opt('type', 'all', 'すべて')}{opt('type', 'es', 'ES配送便')}{opt('type', 'cool', 'COOL便')}</div>
              <div className="flab">ステータス</div><div className="fopts"><button type="button" className={`fopt ${x.tonly ? 'on' : ''}`} onClick={() => setX({ ...x, tonly: !x.tonly })}>トラブルのみ</button></div>
            </>
          )}
          <button type="button" className="btn pri" onClick={closeModal}>閉じる</button>
        </Modal>
      );
    };
    openModal(<Sheet />);
  };

  let body;
  if (L.tab === 'A') {
    const arr = points.filter((p) => (!q || p.name.includes(q) || p.addr.includes(q) || p.code.includes(q) || delsOf(p.id).some((d) => d.name.includes(q) || d.inv.some((i) => i.no.includes(q)))) && (L.st === 'all' || badgeOf(p) === L.st));
    body = (
      <>
        <div className="frow"><button type="button" className="chip" onClick={filter}><Icon name="filter" s />ステータス：{L.st === 'all' ? 'すべて' : L.st}</button></div>
        <div className="search"><input placeholder="倉庫・中継先・納品先拠点名・住所・送り状番号" aria-label="検索" value={L.q} onChange={(e) => setL({ ...L, q: e.target.value })} /><Icon name="search" /></div>
        {arr.length ? <div className="grid2">{arr.map((p) => <PtCard key={p.id} p={p} dels={delsOf(p.id)} extra={<div className="meta"><Icon name="cal" s />{date}</div>} onClick={() => nav.go(ptHref(p))} />)}</div> : <div className="empty">該当する受取地点はありません。</div>}
      </>
    );
  } else {
    const hit = (d: DeliveryView) => !q || d.name.includes(q) || d.addr.includes(q) || (ptOf(d.pt)?.name ?? '').includes(q) || d.inv.some((i) => i.no.includes(q));
    const arr = (L.tab === 'B' ? uns : dn).filter((d) => hit(d) && (L.pt === 'all' || d.pt === L.pt) && (L.type === 'all' || d.type === L.type) && (!L.tonly || d.tr.length));
    const lab = [L.pt === 'all' ? '' : ptOf(L.pt)?.name ?? '', L.type === 'all' ? '' : ({ es: 'ES配送便', cool: 'COOL便' } as Record<string, string>)[L.type], L.tonly ? 'トラブルのみ' : ''].filter(Boolean).join('・') || '倉庫・中継';
    body = (
      <>
        <div className="frow"><button type="button" className="chip" onClick={filter}><Icon name="filter" s />{lab}</button></div>
        <div className="search"><input placeholder="納品先拠点名・住所・倉庫名・送り状番号" aria-label="検索" value={L.q} onChange={(e) => setL({ ...L, q: e.target.value })} /><Icon name="search" /></div>
        {arr.length ? <div className="grid2">{arr.map((d) => <DelCard key={d.no} d={d} pt={ptOf(d.pt)} date={date} onClick={() => openDel(d)} />)}</div> : <div className="empty">該当する配送はありません。</div>}
      </>
    );
  }
  return (
    <>
      <div className="scroll">
        <HHead name={me.name} unread={data.unread} />
        <div className="hbody" style={{ marginTop: 0 }}>
          <div className="lhead"><b style={{ fontWeight: 500, fontSize: '1.142857rem' }}>配送一覧</b><div className="drange">{weekRange(today())} <Icon name="cal" /></div></div>
          <div className="tabs">
            {([['A', '倉庫受取', points.length], ['B', '未配送', uns.length], ['C', '配送完了', dn.length]] as const).map(([k, l, c]) => (
              <button type="button" key={k} className={L.tab === k ? 'on' : ''} onClick={() => setL({ ...L, tab: k, q: '' })}>{l}<span className="cnt">{c}</span></button>
            ))}
          </div>
          <div className="pad stack">{body}</div>
        </div>
      </div>
      <TabBar on="list" />
    </>
  );
}
