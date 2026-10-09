'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { matFor } from '@/lib/corp/order/logic';
import { useQuery } from '@/lib/ops/core/client';
import { today } from '@/lib/supplier/dates';
import { useOpsLeaveGuard } from '@/lib/ui/leaveGuard';
import { yen } from '@/lib/format/money';
import { useCorpSignedIn } from '../../_ui/CorpProvider';
import { About, LogTable } from '../_components/modals';
import { Button, Card, ConfirmDiscard, EmptyState, Head, InlineMessage, Modal, Stepper, Table, Td, type Col } from '../_components/es';
import { api, useOrder } from '../_components/OrderProvider';
import { AboutLink, Loading, PlanLine, SiteTabs, StatusBadge, Tabs, Thumb } from '../_components/parts';
import { photo } from '../_components/photo';

type ModalT = { type: 'discard'; go: () => void } | { type: 'about' } | { type: 'q205' };

/**
 * 月次注文 ＞ 資材注文（CW_MAT_001・版 1.1）。元：部品/23 の Mat。
 * 数量はすべて 0 から入れる。登録すると資材注文（MO-YYMM-NNNN）と資材便が作られ、運営Web の資材注文管理に 出荷待 で出る。
 * 「今月 n回目のご注文」（No.20）を登録ボタンの左に出し、同じサイクル月の2回目以降は Q205 で確かめてから登録する。
 * お届け予定日は登録のときには決めない（運営が資材注文管理で送り状番号・発送日を入れ、リードタイムから出せるときに注文履歴に出る：受付簿 No.154）。
 */
export default function MatPage() {
  return <Suspense fallback={<Loading />}><Mat /></Suspense>;
}

/** 画面内のタブ（P-TAB・URL の ?tab=）：注文（既定）／変更履歴。変更履歴はモーダルをやめてタブにした（受付簿 No.157） */
function Mat() {
  const router = useRouter();
  const sp = useSearchParams();
  const tab: 'order' | 'history' = sp.get('tab') === 'history' ? 'history' : 'order';
  const setTab = (t: 'order' | 'history') => router.replace(t === 'history' ? '/corp/order/materials?tab=history' : '/corp/order/materials');
  const { data, s, set, mqtyOf, dirtyM, acc, toast, toastError } = useOrder();
  const { view } = useCorpSignedIn();
  const { data: fee } = useQuery(api, 'matFee', {});
  const [modal, setModal] = useState<ModalT | null>(null);
  const [busy, setBusy] = useState(false);
  const [err316, setErr316] = useState(false);
  /* 入力中に サイドメニュー・ブラウザの戻る で離れるときは Q02（枠が hasUnsavedChanges を見る） */
  useOpsLeaveGuard(() => !!s && dirtyM(s.id));
  if (!data || !s) return <Loading />;
  const cyc = data.cycle, close = () => setModal(null);
  const discard = () => set((o) => { const qq = { ...o.qty }, mm = { ...o.mqty }; delete qq[s.id]; delete mm[s.id]; return { qty: qq, mqty: mm }; });
  const pickSite = (id: string) => { const go = () => set({ site: id, sel: {}, pg: 1 }); setErr316(false); if (dirtyM(s.id)) setModal({ type: 'discard', go }); else go(); };
  /* タイトルにサイクル月は付けない（hong 2026-10-05 B-16） */
  const head = <Head crumb={['月次注文', '資材注文']} title="資材注文" />;
  const feeTxt = yen(fee ?? 0) + '・税抜';
  const mq = mqtyOf(s.id), items = data.materials.filter((m) => matFor(s, m)), mine = data.matThisMonth[s.id] || [];
  /* 解約後（参照のみ）は資材注文できない（台帳 E 2026-10-05）。表は見るだけ */
  const ro = view === 'ro';
  const canOrder = !s.paused && !s.trial && !ro;
  const n = mine.length + 1;
  const matCols: Col[] = [{ label: 'No', w: 48 }, { label: '写真', w: 64 }, { label: '資材名' }, { label: '単位' }];
  if (!ro) matCols.push({ label: '注文数量', cls: 'r', w: 180 });
  const setM = (id: string, v: number) => { setErr316(false); set((o) => ({ mqty: { ...o.mqty, [s.id]: { ...(o.mqty[s.id] ?? data.matInit[s.id] ?? {}), [id]: v } } })); };
  const doRegister = async () => {
    setBusy(true);
    try {
      await api.action('registerMat', { acc, site: s.id, q: mq });
      set((o) => { const mm = { ...o.mqty }; delete mm[s.id]; return { mqty: mm }; });
      toast('資材のご注文を登録しました。');
    } catch (e) { toastError(e); } finally { setBusy(false); }
  };
  /** 登録：数量 1 以上の資材がなければ E316。このサイクル月に注文済みなら Q205 を出してから登録 */
  const register = () => {
    if (!items.some((m) => (mq[m.id] || 0) > 0)) { setErr316(true); return; }
    if (mine.length >= 1) { setModal({ type: 'q205' }); return; }
    void doRegister();
  };
  const modals = !modal ? null
    : modal.type === 'discard' ? <ConfirmDiscard onCancel={close} onConfirm={() => { const g = modal.go; discard(); close(); setTimeout(g, 0); }} />
      : modal.type === 'q205'
          ? <Modal tone="warning" title="資材を注文しますか？" confirmLabel="注文する" onCancel={close} onClose={close} onConfirm={() => { close(); void doRegister(); }}>{'同じご利用月の2回目以降のご注文のため、資材の追加配送の料金（' + feeTxt + '）がかかります。'}</Modal>
          : <About cycL={cyc.label} from={cyc.from} to={cyc.to} today={today()} onClose={close} />;
  const about = <AboutLink onOpen={() => setModal({ type: 'about' })} />;

  /* 休止中：表・ボタンを出さず I209 だけ */
  if (s.paused) return (
    <div className="od-stack">
      {head}<SiteTabs kind="mat" onPick={pickSite} />
      <Card><EmptyState title="この拠点は休止中です。" icon="ClockCountdown">休止中は資材のご注文はできません。</EmptyState></Card>
      {modals}{about}
    </div>
  );

  return (
    <div className="od-stack">
      {head}
      <SiteTabs kind="mat" onPick={pickSite} />
      <Card>
        <div className="od-head">
          <PlanLine x={s} />
          <span className="od-status"><StatusBadge st={data.matStatus[s.id]} /></span>
          {/* 解約後（参照のみ）は登録・キャンセルを出さない（受付簿 No.157） */}
          {canOrder ? <div className="od-head__act">
              {/* No.20：今月 n回目のご注文（1回目は I222・2回目以降は W210） */}
              <span className={'od-count' + (n >= 2 ? ' is-warn' : '')} role="status">
                {n >= 2 ? `今月 ${n}回目のご注文です。資材の追加配送の料金（${feeTxt}）がかかります。` : '今月 1回目のご注文です。料金に含みます。'}
              </span>
              <Button variant="outline" tone="neutral" disabled={!dirtyM(s.id)} onClick={() => setModal({ type: 'discard', go: () => {} })}>キャンセル</Button>
              <Button disabled={busy} onClick={register}>登録</Button>
          </div> : null}
        </div>
        <Tabs label="資材注文の表示" value={tab} onChange={setTab} items={[{ key: 'order', label: '注文' }, { key: 'history', label: '変更履歴' }]} />
        {tab === 'history' ? <LogTable list={data.logs[s.id] || []} /> : <>
        {s.trial ? (
          /* お試しの拠点：資材は初期セットを自動でお届けするため、法人Web からは注文できない（I210） */
          <EmptyState title="お試し中は資材のご注文はできません。" icon="ClockCountdown">ご希望はESキッチンへお問い合わせください。</EmptyState>
        ) : (
          <>
            {/* No.8：案内は2行だけ（解約後の参照のみは注文の案内を出さない：受付簿 No.157） */}
            {ro ? null : (
              <InlineMessage tone="info">
                <div>資材はいつでも注文できます。</div>
                <div>{'月1回までは料金に含み、2回目以降は資材の追加配送の料金（' + feeTxt + '）がかかります。'}</div>
              </InlineMessage>
            )}
            {items.length ? (
              <Table cls="od-tbl od-mat" cols={matCols}
                rows={items.map((m, i) => (
                  <tr key={m.id}><Td v={i + 1} /><td><Thumb src={m.src || photo('資材', m.img)} name={m.name} /></td><Td v={m.name} /><Td v={m.unit} />
                    {ro ? null : <td className="r"><Stepper value={mq[m.id] || 0} label={m.name} disabled={!canOrder} onChange={(v) => setM(m.id, v)} /></td>}</tr>
                ))} />
            ) : <EmptyState title="表示するデータがありません。" compact />}
            {err316 ? <p className="od-err es-field__msg es-field__msg--error" role="alert">ご注文数を1つ以上ご入力ください。</p> : null}
          </>
        )}
        </>}
      </Card>
      {modals}{about}
    </div>
  );
}
