'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { checkTrouble, trOpen } from '@/lib/driver/logic';
import { DLV_REASONS, NEED_INV, RECV_REASONS } from '@/lib/driver/seed';
import type { DeliveryView, PointView } from '@/lib/driver/types';
import { useOpsLeaveGuard } from '@/lib/ui/leaveGuard';
import { Icon } from '../_ui/Icon';
import { useCommit, useDraft, useDriverSignedIn } from '../_ui/DriverProvider';
import { addPhotos, Av, Cb, DelCard, Drop, IMG, Loading, Modal, Nums, PtCard, PtNums, TopBar, tapProps, useBeforeUnload, useNav, useRun } from '../_ui/parts';
import { driverApi, useDay } from '../_ui/useDay';

export default function Page() {
  return <Suspense><DriverTrouble /></Suspense>;
}

type Tr = { target: string | null; inv: Record<string, boolean>; type: string | null; photos: string[]; note: string; q: string };
const TR0: Tr = { target: null, inv: {}, type: null, photos: [], note: '', q: '' };

/**
 * トラブル報告（元の V.trouble・V.troublef・DA_RPTD_001/002）。?target＝'pt:<受取地点>'・'d:<配送No>' で内容入力。
 * ret＝画面右上のボタンから来た（送ったら元の画面に戻る）。報告は運営Web の配送データと委託配送先Web のトラブルに届く
 */
function DriverTrouble() {
  const sp = useSearchParams();
  const target = sp.get('target');
  const ret = sp.get('ret') === '1';
  const [T, setT] = useDraft<Tr>('tr', TR0);
  const { data, delsOf, ptOf } = useDay();
  const cur = target && T.target !== target ? { ...TR0, target } : T;
  const dirty = !!target && (!!cur.type || Object.values(cur.inv).some(Boolean) || cur.photos.length > 0 || !!cur.note.trim());
  useOpsLeaveGuard(dirty);
  useBeforeUnload(dirty);
  if (!data) return <><TopBar title="トラブル報告" trouble={false} /><Loading /></>;
  if (target) {
    const isPt = target.startsWith('pt:');
    const id = target.slice(isPt ? 3 : 2);
    const o = isPt ? ptOf(id) : data.dels.find((d) => d.no === id);
    if (o) return <Form T={cur} setT={setT} isPt={isPt} o={o} dels={isPt ? delsOf(id) : [o as DeliveryView]} ret={ret} />;
  }
  return <Select T={T} setT={setT} />;
}

/** 対象選択（元の V.trouble） */
function Select({ T, setT }: { T: Tr; setT: (t: Tr) => void }) {
  const { data, delsOf, ptOf } = useDay();
  const nav = useNav();
  if (!data) return null;
  const q = T.q.trim();
  const pts = data.points.filter((p) => !q || p.name.includes(q) || delsOf(p.id).some((d) => d.inv.some((i) => i.no.includes(q))));
  const ds = data.dels.filter((d) => !q || d.name.includes(q) || (ptOf(d.pt)?.name ?? '').includes(q) || d.inv.some((i) => i.no.includes(q)));
  const sel = (t: string) => setT({ ...T, target: t, inv: {}, type: null });
  return (
    <>
      <TopBar title="トラブル報告" trouble={false} />
      <div className="scroll pad stack">
        <div className="search"><input placeholder="倉庫名・拠点名・送り状番号" aria-label="検索" value={T.q} onChange={(e) => setT({ ...T, q: e.target.value })} /><Icon name="search" /></div>
        <p className="hint muted" style={{ margin: 0 }}>※影響を受けた受取地点または納品先を選択してください。<br />※複数の拠点でトラブルが発生している場合は、拠点ごとに登録してください。<br />※報告は運営（ESキッチン）に届きます。</p>
        <div className="h3" style={{ margin: 0 }}>荷物受取</div>
        <div className="grid2">{pts.length ? pts.map((p) => <PtCard key={p.id} p={p} dels={delsOf(p.id)} radio={T.target === 'pt:' + p.id} onClick={() => sel('pt:' + p.id)} />) : <div className="empty">該当なし</div>}</div>
        <div className="h3" style={{ margin: 0 }}>配送</div>
        <div className="grid2">{ds.length ? ds.map((d) => <DelCard key={d.no} d={d} pt={ptOf(d.pt)} radio={T.target === 'd:' + d.no} onClick={() => sel('d:' + d.no)} />) : <div className="empty">該当なし</div>}</div>
      </div>
      <div className="foot">
        <button type="button" className="btn sec" onClick={() => nav.back()}>戻る</button>
        <button type="button" className="btn pri" disabled={!T.target} onClick={() => nav.router.push(`/driver/trouble?target=${encodeURIComponent(T.target!)}`)}>次へ</button>
      </div>
    </>
  );
}

/** 内容入力（元の V.troublef） */
function Form({ T, setT, isPt, o, dels, ret }: { T: Tr; setT: (t: Tr) => void; isPt: boolean; o: PointView | DeliveryView; dels: DeliveryView[]; ret: boolean }) {
  const { staff, offline, openModal, closeModal } = useDriverSignedIn();
  const commit = useCommit();
  const nav = useNav();
  const reasons = isPt ? RECV_REASONS : DLV_REASONS;
  const invs = dels.flatMap((d) => d.inv.map((i) => ({ d, no: i.no })));
  const allP = invs.length > 0 && invs.every((i) => T.inv[i.no]);
  const nos = invs.filter((i) => T.inv[i.no]).map((i) => i.no);
  const ok = !checkTrouble({ type: T.type, nos, note: T.note }, reasons);
  const dup = trOpen(o).find((t) => t.raw === T.type);

  const send = (add: boolean) => {
    const Confirm = () => {
      const [busy, run] = useRun();
      const go = () => run(async () => {
        const r = await driverApi().action('reportTrouble', { staff, target: T.target!, type: T.type!, nos, note: T.note, photos: T.photos.length, add, offline });
        closeModal();
        setT(TR0);
        // 元の画面（荷物受取・配送）から来たときはそこへ戻る。タブから来たときはホーム
        setTimeout(() => { if (ret) nav.router.back(); else nav.router.replace('/driver'); }, 0);
        commit(r);
      });
      return add ? (
        <Modal onBack={closeModal}>
          <img src={IMG('girl')} alt="" style={{ width: '10.714286rem' }} />
          <h3>報告済みです。追記しますか？</h3>
          <p>「{T.type}」は {dup?.at ?? ''} に報告済みです（運営の確認待ち）。<br />追記すると、報告済みのトラブルに内容を足して運営に送ります（報告は増えません）。</p>
          <button type="button" className="btn pri" disabled={busy} onClick={go}>追記して送信</button>
          <button type="button" className="btn sec" onClick={closeModal}>キャンセル</button>
        </Modal>
      ) : (
        <Modal onBack={closeModal}>
          <img src={IMG('girl')} alt="" style={{ width: '10.714286rem' }} />
          <h3>この内容で報告を送信しますか？</h3>
          <p>報告は運営（ESキッチン）に届きます。<br />取消・再配送などの対応は運営が行います。</p>
          <button type="button" className="btn pri" disabled={busy} onClick={go}>報告する</button>
          <button type="button" className="btn sec" onClick={closeModal}>キャンセル</button>
        </Modal>
      );
    };
    openModal(<Confirm />);
  };

  return (
    <>
      <TopBar title="トラブル報告" trouble={false} />
      <div className="scroll pad stack">
        <div className="kind">{isPt ? '荷物受取時のトラブル' : '配達時のトラブル'}</div>
        <div className="pk">
          <div className="hd" style={{ gap: '0.714286rem', alignItems: 'center' }}>
            <Av t={isPt ? 'wh' : (o as DeliveryView).type} />
            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '0.285714rem' }}>
              <b style={{ color: '#1f2733', fontSize: '1.142857rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{o.name}</b>
              {isPt ? <PtNums dels={dels} /> : <Nums d={o as DeliveryView} />}
            </div>
            <Cb on={allP} onClick={() => setT({ ...T, inv: Object.fromEntries(invs.map((i) => [i.no, !allP])) })} />
          </div>
          {invs.map((i, k) => {
            const tg = () => setT({ ...T, inv: { ...T.inv, [i.no]: !T.inv[i.no] } });
            return (
              <div key={i.no} className="inv tap" {...tapProps(tg)}>
                <span style={{ width: '1rem' }}>{k + 1}</span>
                <span className="no"><Icon name="box" s />{i.no}{isPt && <> <span className="muted" style={{ fontSize: '0.857143rem' }}>{i.d.name.slice(0, 10)}…</span></>}</span>
                <Cb on={!!T.inv[i.no]} onClick={tg} />
              </div>
            );
          })}
        </div>
        <p className="hint muted" style={{ margin: 0 }}>※影響を受けた送り状番号を選択してください{T.type && NEED_INV.includes(T.type) ? '（必須）' : ''}</p>
        <div className="h3">トラブル内容</div>
        <div className="opts">{reasons.map((t) => <button type="button" key={t} onClick={() => setT({ ...T, type: t })}><span className={`radio ${T.type === t ? 'on' : ''}`} />{t}</button>)}</div>
        <div className="h3">画像</div>
        <Drop photos={T.photos} onAdd={(u) => setT({ ...T, photos: addPhotos(T.photos, u) })} onRemove={(i) => setT({ ...T, photos: T.photos.filter((_, k) => k !== i) })} />
        <div className="h3">備考{T.type === 'その他' ? '（必須）' : ''}</div>
        <textarea className="textarea" aria-label="備考" placeholder="状況を入力してください" maxLength={1000} value={T.note} onChange={(e) => setT({ ...T, note: e.target.value })} />
      </div>
      <div className="foot">
        <button type="button" className="btn sec" onClick={() => nav.back()}>戻る</button>
        <button type="button" className="btn pri" disabled={!ok} onClick={() => send(!!dup)}>送信</button>
      </div>
    </>
  );
}
