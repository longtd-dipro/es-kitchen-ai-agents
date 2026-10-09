'use client';

import { useState } from 'react';
import type { SaveOpts } from '@/lib/ops/general/product';
import { useOps } from '@/app/ops/_ui/OpsProvider';
import { Modal } from '@/app/ops/_ui/ui';
import { fmtDatesIn, fmtYm } from '@/lib/format/date';

/*
 * 商品マスタの保存の前の確認（2026/10/02 決定）。
 *   公開中・締切済・配送中のメニューにある商品の販売価格・税率を変える → 価格改定／誤りの訂正（理由）・法人へ通知する
 *   ピッキング倉庫・コース・自販機の変更で、注文している拠点に出せなくなる → 一覧を見て確認
 * 中身は共通データの master.productImpact（運営の領域 general.productImpact）
 */
export type Impact = {
  needPriceMode: boolean; needConfirm: boolean;
  menus: { menuId: string; status: string; priceYen: number }[];
  branches: { branchId: string; orderId: string; slot: string; reason: string }[];
};
type Mode = '' | '価格改定' | '誤りの訂正';

export function PriceDialog({ imp, onOk }: { imp: Impact; onOk: (o: SaveOpts) => void }) {
  const { closeModal } = useOps();
  const [mode, setMode] = useState<Mode>('');
  const [reason, setReason] = useState('');
  const [notify, setNotify] = useState(false);
  const [seen, setSeen] = useState(false);
  /* 訂正の理由は 500文字まで（E04。切り詰めない） */
  const tooLong = mode === '誤りの訂正' && reason.length > 500;
  const can = (!imp.needPriceMode || mode === '価格改定' || (mode === '誤りの訂正' && !!reason.trim() && !tooLong)) && (!imp.needConfirm || seen);
  const ok = () => onOk({ ...(imp.needPriceMode ? { priceMode: mode as Exclude<Mode, ''>, reason: reason.trim(), notify } : {}), ...(imp.needConfirm ? { confirm: true } : {}) });
  const opt = (v: Exclude<Mode, ''>, label: string, help: string) => (
    <label style={{ display: 'flex', gap: '0.571429rem', alignItems: 'flex-start', padding: '0.428571rem 0' }}>
      <input type="radio" name="pm-pricemode" checked={mode === v} onChange={() => setMode(v)} />
      <span><b>{label}</b><br /><small className="muted">{help}</small></span>
    </label>
  );
  return (
    <Modal title={imp.needPriceMode ? '価格の変更方法を選んでください' : '保存の前に確認してください'} width={600}
      footer={<><button className="btn ghost lg" onClick={closeModal}>キャンセル</button><button className="btn pri lg" disabled={!can} onClick={ok}>保存</button></>}>
      {imp.needPriceMode && (
        <div>
          <p className="muted" style={{ marginTop: 0 }}>この商品は公開したメニュー（{imp.menus.map((m) => `${m.menuId} ${m.status}・${m.priceYen}円`).join('／')}）にあります。</p>
          {opt('価格改定', '価格改定（次のメニューから適用）', '公開中のメニューと受付済みの注文は、今の価格のまま。次に公開するメニューから新しい価格になります。')}
          {opt('誤りの訂正', '誤りの訂正（今すぐ全体に適用）', '公開中のメニュー・注文・未確定の請求に新しい価格を使います。理由の入力が必要です。確定済みの請求書がある場合は、一覧を表示します（請求調整が必要）。')}
          {mode === '誤りの訂正' && <textarea className={`inp${tooLong ? ' err' : ''}`} rows={2} aria-label="訂正の理由" placeholder="訂正の理由（必須）" value={reason} onChange={(e) => setReason(e.target.value)} style={{ width: '100%' }} />}
          {tooLong && <span className="emsg" style={{ color: 'var(--ng)', fontSize: '0.857143rem' }}>500文字以内で入力してください。</span>}
          <label style={{ display: 'flex', gap: '0.571429rem', alignItems: 'center', marginTop: '0.571429rem' }}><input type="checkbox" checked={notify} onChange={(e) => setNotify(e.target.checked)} />法人へ通知する</label>
        </div>
      )}
      {imp.needConfirm && (
        <div style={{ marginTop: imp.needPriceMode ? '1.142857rem' : 0 }}>
          <p style={{ marginTop: 0 }}><b>ピッキング倉庫・コース・自販機の変更で、公開したメニューで注文している拠点に出せなくなります。</b></p>
          <ul style={{ margin: '0.285714rem 0 0.571429rem', paddingLeft: '1.285714rem' }}>
            {imp.branches.map((b) => <li key={b.orderId + b.slot}>{b.branchId}（{b.orderId}・{b.slot}）：{b.reason}</li>)}
          </ul>
          <label style={{ display: 'flex', gap: '0.571429rem', alignItems: 'center' }}><input type="checkbox" checked={seen} onChange={(e) => setSeen(e.target.checked)} />確認しました（注文の商品は代替品設定などで直します）</label>
        </div>
      )}
    </Modal>
  );
}

/** 誤りの訂正のあと：確定済みの請求書（請求調整が必要） */
export function InvoiceFixList({ list }: { list: { id: string; issueMonth: string; actualPeriod: string; status: string }[] }) {
  const { closeModal } = useOps();
  return (
    <Modal title="請求調整が必要な請求書" width={560} footer={<button className="btn pri lg" onClick={closeModal}>閉じる</button>}>
      <p style={{ marginTop: 0 }}>次の請求書は確定済みのため、新しい価格は入っていません。請求調整をしてください。</p>
      <ul style={{ paddingLeft: '1.285714rem' }}>{list.map((x) => <li key={x.id}>{x.id}（{fmtYm(x.issueMonth)} 発行・実績精算 {fmtDatesIn(x.actualPeriod)}・{x.status}）</li>)}</ul>
    </Modal>
  );
}
