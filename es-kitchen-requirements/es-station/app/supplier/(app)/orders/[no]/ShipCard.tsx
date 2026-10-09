'use client';

import { forwardRef, useState } from 'react';
import { fromIso, toIso } from '@/lib/supplier/dates';
import { api } from '@/lib/api/supplier';
import { CARRIERS, METHODS } from '@/lib/supplier/constants';
import { nShipped, shipDefaults, validateShip, type Errors, type ShipDraft } from '@/lib/supplier/orders';
import { useSignedIn } from '@/lib/supplier/store';
import type { Order } from '@/lib/supplier/types';
import { useLeaveGuard } from '@/lib/ui/leaveGuard';
import { ConfirmModal } from '../../../_components/modals';
import { Field, Icon, Notice } from '../../../_components/ui';
import { DateInput } from '@/components/DateInput';
import { fmtDate } from '@/lib/format/date';

/**
 * 出荷処理・報告（分納は回ごと）。入力中の値はこのカードの state に持ち、チェックを通るまで発注データに書かない（RV-SUP S-a）。
 * 初期値＝保存した値 → 前回の配送方法・運送会社 → 納品条件（REQ-PO-619）。運送会社・送り状番号は任意（REQ-PO-135 2026/10/02 改定）
 */
const ShipCard = forwardRef<HTMLButtonElement, { o: Order; idx: number; onDone: () => void }>(function ShipCard({ o, idx, onDone }, ref) {
  const { me, setMe, mergeOrders, setTab, toast, toastError, openModal } = useSignedIn();
  const [busy, setBusy] = useState(false);
  const ps = o.parts;
  const part = ps[idx];
  const [v, setV] = useState<ShipDraft>(() => shipDefaults(part, me));
  const [e, setE] = useState<Errors>({});
  /* 入力中に画面を離れるときの確認（Q02・全サイト共通）：開いたときの値から変えて報告していないとき（サイドメニュー・ブラウザを閉じる） */
  const [v0] = useState(() => JSON.stringify(v));
  useLeaveGuard(JSON.stringify(v) !== v0);
  const short = o.type === '短消費期限';
  const bbL = short ? '消費期限' : '賞味期限';
  const set = (k: keyof ShipDraft) => (ev: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setV({ ...v, [k]: ev.target.value });
  const setDate = (k: 'ship' | 'bb') => (ev: { target: { value: string } }) => setV({ ...v, [k]: fromIso(ev.target.value) });

  const commit = async () => {
    let next: Order;
    setBusy(true);
    try {
      next = await api.reportShipment({ no: o.no, partIndex: idx, ...v, bb: o.type === '資材' ? undefined : v.bb });
    } catch (ex) {
      setBusy(false);
      return toastError(ex);
    }
    mergeOrders([next]);
    setMe({ ...me, lastMethod: v.method || me.lastMethod, lastCarrier: v.carrier || me.lastCarrier });
    const shipped = nShipped(next);
    const all = next.ans === '出荷済';
    onDone();
    if (all) { setTab('出荷済'); toast('出荷を報告しました。「出荷済」タブに移動しました'); }
    else toast(`分納 ${shipped}/${ps.length}回目の出荷を報告しました`);
  };

  const save = () => {
    const er = validateShip(o, v);
    setE(er);
    if (Object.keys(er).length) return;
    if (o.wishBB && v.bb && v.bb < o.wishBB) {
      openModal(
        <ConfirmModal title="消費期限の確認" cancel="戻って直す" ok="このまま報告する" onOk={commit}>
          <Notice kind="warn">入力した消費期限（<b>{fmtDate(v.bb)}</b>）は、希望消費期限（<b>{fmtDate(o.wishBB)}</b>）より前です。</Notice>
          <p style={{ margin: '0.857143rem 0 0' }}>このまま出荷を報告しますか？</p>
        </ConfirmModal>,
      );
      return;
    }
    commit();
  };

  return (
    <div className="card">
      <h2>出荷処理・報告{ps.length > 1 && `｜${idx + 1}回目（${part.qty.toLocaleString()}${o.unit}）`}</h2>
      {ps.length > 1 && (
        <Notice kind="pur" icon="truck" style={{ marginBottom: '0.857143rem' }}>
          分納の発注です。出荷した回ごとに報告してください（{nShipped(o)}/{ps.length}回 報告済み）。すべて報告すると「出荷済み」になります。
        </Notice>
      )}
      <div className="fg">
        <Field label="出荷予定日（回答済み）"><input className="inp" readOnly value={fmtDate(part.eta)} /></Field>
        <Field label="納品日（本発注で入力済み）"><input className="inp" readOnly value={fmtDate(part.dlv) || '—'} /></Field>
        <Field label="入荷箱数（本発注で入力済み）"><input className="inp" readOnly value={part.box ? part.box + '箱' : '—'} /></Field>
        <Field label="配送方法" req err={e.method} hint="前回の出荷報告の値（なければプロフィールの納品条件）が入ります">
          <select className={`sel ${e.method ? 'err' : ''}`} value={v.method} onChange={set('method')}>
            <option value="">選択してください</option>
            {METHODS.map((m) => <option key={m}>{m}</option>)}
          </select>
        </Field>
        <Field label="出荷日" req err={e.ship}>
          <DateInput className={`inp ${e.ship ? 'err' : ''}`} value={toIso(v.ship)} onChange={setDate('ship')} />
        </Field>
        <Field label="運送会社名" req={v.method.startsWith('直送')} opt={!v.method.startsWith('直送')} err={e.carrier}>
          <select className={`sel ${e.carrier ? 'err' : ''}`} value={v.carrier} onChange={set('carrier')}>
            <option value="">選択してください</option>
            {CARRIERS.map((c) => <option key={c}>{c}</option>)}
          </select>
        </Field>
        <Field label="送り状番号" opt err={e.slip} hint="任意です。届かないときの追跡に使います">
          <input className={`inp mono ${e.slip ? 'err' : ''}`} inputMode="numeric" placeholder="送り状番号" value={v.slip} onChange={set('slip')} />
        </Field>
        {o.type !== '資材' && (
          <Field label={`${bbL}（納品分）`} req err={e.bb} hint={o.wishBB ? `希望消費期限：${fmtDate(o.wishBB)}。これより前の日付は警告が出ます` : `出荷する商品の${bbL}を入力します`}>
            <DateInput className={`inp ${e.bb ? 'err' : ''}`} value={toIso(v.bb)} onChange={setDate('bb')} />
          </Field>
        )}
        <Field label="備考" full opt>
          <textarea className="inp" placeholder="例）一部の箱は2便に分けて配送" value={v.note} onChange={set('note')} />
        </Field>
      </div>
      <div style={{ marginTop: '1.142857rem', textAlign: 'right' }}>
        <button ref={ref} className="btn pri lg" disabled={busy} onClick={save}><Icon name="truck" />{ps.length > 1 ? `${idx + 1}回目の` : ''}出荷を報告する</button>
      </div>
    </div>
  );
});

export default ShipCard;
