'use client';

import { useRouter } from 'next/navigation';
import { useState, type ReactNode } from 'react';
import { api } from '@/lib/ops/purchasing/client';
import { PRODS, TODAY, WD, WH, iso } from '@/lib/ops/purchasing/master';
import { WS_DOWN, WS_KINDS, WS_UP, wsDir } from '@/lib/ops/purchasing/stock';
import { Icon } from '../../_ui/Icon';
import { useOps } from '../../_ui/OpsProvider';
import { useCanAct } from '../../_ui/perm';
import { Field } from '../../_ui/ui';
import { Box, Sel } from './common';
import { DateInput } from '@/components/DateInput';
import { fmtDateW } from '@/lib/format/date';

/* 倉庫在庫の画面で共通の部品 */

export const KindBadge = ({ k }: { k: string }) => (
  <span className={`badge ${k === '入荷' || WS_UP.includes(k) ? 'b-ok' : k === '出荷' ? 'b-mute' : WS_DOWN.includes(k) ? 'b-ng' : k === 'THOMAS取込' ? 'b-info' : 'b-warn'}`}>{k}</span>
);
export const Signed = ({ v, plus = '' }: { v: number; plus?: string }) => (v ? <span className={v > 0 ? plus : ''}>{v > 0 ? '+' : '−'}{Math.abs(v).toLocaleString()}</span> : <span className="muted">0</span>);
/** 'YYYY-MM-DD（曜）'（表示用。共通の表示ルール・決定 8-1） */
export const ymdW = (s: string) => (iso(s) ? fmtDateW(s) : '');

/** 見出し（パンくずの「倉庫在庫」は戻るリンク） */
export function WsHead({ last, title, children }: { last: string; title: ReactNode; children?: ReactNode }) {
  const router = useRouter();
  return (
    <div className="ph">
      <div>
        <div className="crumb"><span>発注・入荷</span><span><button className="lnk u" onClick={() => router.push('/ops/purchasing/stock')}>倉庫在庫</button></span><span>{last}</span></div>
        <h1>{title}</h1>
      </div>
      <div className="btns">{children}</div>
    </div>
  );
}
/** 案内（一言＋「この画面について」で詳しく） */
export const About = ({ lead, more }: { lead: ReactNode; more: ReactNode }) => (
  <div className="notice ws-note"><Icon name="bell" /><div><span>{lead}</span><details className="ws-more"><summary>この画面について</summary><div>{more}</div></details></div></div>
);
export const stockId = (wh: string, pid: string) => `/ops/purchasing/stock/${encodeURIComponent(wh + '|' + pid)}`;

/** 在庫の記録を追加（決定 W1＝A） */
export function RecModal({ wh, pid, target = '商品', itemName }: { wh?: string; pid?: string; target?: '商品' | '資材'; itemName?: string }) {
  const isMat = target === '資材';
  const { closeModal, toast, toastError } = useOps();
  const canAct = useCanAct();
  const [m, setM] = useState({ wh: wh || WH[0], pid: pid || '', kind: 'NG品ロス', dir: '減る', qty: '', date: iso(TODAY()), reason: '' });
  const [e, setE] = useState<Record<string, string>>({});
  const save = async () => {
    const er: Record<string, string> = {};
    if (!m.pid) er.pid = '商品を選んでください';
    if (!(+m.qty > 0)) er.qty = '1以上の数を入れてください';
    else if (+m.qty > 999999) er.qty = '999,999以下で入れてください';
    if (!m.reason.trim()) er.reason = '理由を入れてください';
    if (!m.date) er.date = '日付を入れてください';
    if (Object.keys(er).length) { setE(er); toast('入力内容を確認してください'); return; }
    try {
      const no = await api.action('addStockRec', { ...m, qty: +m.qty });
      closeModal();
      toast(`${no} を記録しました。見込み在庫に反映しました`);
    } catch (err) { toastError(err); }
  };
  return (
    <Box title={isMat ? '資材の在庫の調整' : '在庫の記録を追加'} width={680} footer={<><button className="btn lg ghost" onClick={closeModal}>キャンセル</button>{canAct(api, 'addStockRec') && <button className="btn pri lg" onClick={save}>登録</button>}</>}>
      <p className="muted" style={{ margin: '0 0 0.857143rem' }}>THOMAS の数は書き換えません。見込み在庫の計算にだけ使います。</p>
      <div className="fg c2">
        {isMat && <Field label="対象"><div>資材</div></Field>}
        {isMat ? <Field label="倉庫"><div>{m.wh}</div></Field> : <Field label="倉庫" req htmlFor="wm-wh"><Sel id="wm-wh" value={m.wh} opts={WH} onChange={(v) => setM({ ...m, wh: v })} /></Field>}
        {isMat ? <Field label="資材"><div>{itemName ? `${itemName}（${m.pid}）` : m.pid}</div></Field> : <Field label="商品" req htmlFor="wm-pid" err={e.pid}><Sel id="wm-pid" value={m.pid} ph="商品を選ぶ" opts={PRODS.map((p) => [p.id, `${p.id} ${p.name}`])} err={!!e.pid} onChange={(v) => setM({ ...m, pid: v })} /></Field>}
        <Field label="区分" req htmlFor="wm-kind"><Sel id="wm-kind" value={m.kind} opts={WS_KINDS} onChange={(v) => setM({ ...m, kind: v, dir: wsDir(v) || m.dir })} /></Field>
        <Field label="日付" req htmlFor="wm-date"><DateInput className="inp" id="wm-date" value={m.date} onChange={(ev) => setM({ ...m, date: ev.target.value })} /></Field>
        <Field label="増減" req><div className="radios" role="radiogroup">{['増える', '減る'].map((o) => <label key={o}><input type="radio" name="wm-dir" checked={m.dir === o} onChange={() => setM({ ...m, dir: o })} />{o}</label>)}</div></Field>
        <Field label="数量" req htmlFor="wm-qty" err={e.qty}><input className={`inp${e.qty ? ' err' : ''}`} type="number" min={1} max={999999} id="wm-qty" value={m.qty} placeholder={isMat ? '資材の単位' : '個'} onChange={(ev) => setM({ ...m, qty: ev.target.value })} /></Field>
      </div>
      <div style={{ marginTop: '0.857143rem' }}>
        <Field label="理由" req htmlFor="wm-reason" err={e.reason}><textarea className={`inp${e.reason ? ' err' : ''}`} id="wm-reason" rows={3} style={{ height: 'auto', textAlign: 'left' }} placeholder="例：ピッキング前の検品で容器の破損（10食）" value={m.reason} onChange={(ev) => setM({ ...m, reason: ev.target.value })} /></Field>
      </div>
    </Box>
  );
}
