'use client';

import { useState } from 'react';
import { api } from '@/app/ops/_general/parts';
import { LEAVE_MSG, useLeaveGuard } from '@/app/ops/_ui/leaveGuard';
import { useOps } from '@/app/ops/_ui/OpsProvider';
import { ConfirmModal, Field, Modal } from '@/app/ops/_ui/ui';
import { useQuery } from '@/lib/ops/core/client';
import type { GenRow } from '@/lib/ops/general/types';
import { today } from '@/lib/supplier/dates';

/*
 * 保冷バッグ台帳の「貸与の記録の登録・編集」モーダル（AW_COOL_002）。一覧（新規登録・鉛筆）と詳細（編集）で使う。
 * row は一覧の行の形（_uid・kind・qty・cid・did・date・status・memo・retOn・retQty）
 */
const KINDS = ['保冷バッグ', '保冷剤'] as const;
const STATUSES = ['貸与中', '紛失', '廃棄'] as const;
type Errs = Partial<Record<'kind' | 'qty' | 'carrierId' | 'issuedOn' | 'status' | 'memo' | 'returnedOn' | 'returnedQty', string>>;
const ymd = (s: string) => s.replace(/\//g, '-');

export function CoolerModal({ row }: { row?: GenRow }) {
  const { toast, toastError, closeModal, openModal } = useOps();
  const { data: opt } = useQuery(api, 'coolerForm');
  const isNew = !row;
  const todayIso = ymd(today());
  const init = {
    kind: row ? String(row.kind) : '', qty: row ? String(row.qty) : '', carrierId: row ? String(row.cid) : '', driverId: row ? String(row.did ?? '') : '',
    issuedOn: row ? ymd(String(row.date)) : todayIso, status: row ? String(row.status) : '貸与中', memo: row ? String(row.memo ?? '') : '',
    returnedOn: row?.retOn ? ymd(String(row.retOn)) : '', returnedQty: row?.retQty !== undefined && row?.retQty !== null && row?.retQty !== '' ? String(row.retQty) : '',
  };
  const [f, setF] = useState(init);
  const [err, setErr] = useState<Errs>({});
  const [busy, setBusy] = useState(false);
  const dirty = JSON.stringify(f) !== JSON.stringify(init);
  useLeaveGuard(dirty);
  const set = <K extends keyof typeof init>(k: K, v: string) => setF((x) => ({ ...x, [k]: v }));
  const cancel = () => (dirty ? openModal(<ConfirmModal kind="warn" title={LEAVE_MSG.title} text={LEAVE_MSG.text} ok={LEAVE_MSG.ok} okCls="warn-solid" cancel={LEAVE_MSG.cancel} onOk={closeModal} />) : closeModal());

  /* 無効の委託配送先は選べない（編集中の記録の会社だけは、そのまま残す） */
  const carriers = (opt?.carriers ?? []).filter((c) => c.status !== '無効' || c.id === init.carrierId);
  const drivers = (opt?.drivers ?? []).filter((d) => d.carrierId === f.carrierId && (d.status !== '無効' || d.id === init.driverId));
  const statuses = [...new Set<string>([...STATUSES, init.status])];

  const check = (): Errs => {
    const e: Errs = {};
    if (!f.kind) e.kind = '種類は必須項目です。';
    const q = f.qty.normalize('NFKC').trim();
    if (!q) e.qty = '数は必須項目です。';
    else if (!/^-?\d+$/.test(q)) e.qty = '数は数値で入力してください。';
    else if (+q < 1 || +q > 9999) e.qty = '数は1〜9999の範囲で入力してください。';
    if (!f.carrierId) e.carrierId = '委託配送先は必須項目です。';
    if (!f.issuedOn) e.issuedOn = '渡した日は必須項目です。';
    else if (f.issuedOn > todayIso) e.issuedOn = 'この日は選べません。';
    if (!f.status) e.status = '状態は必須項目です。';
    if (f.memo.length > 500) e.memo = '500文字以内で入力してください。';
    /* 返却日・返却数（任意）：返却日は渡した日より前にしない、返却数は 0〜数 */
    if (f.returnedOn && f.issuedOn && f.returnedOn < f.issuedOn) e.returnedOn = '返却日は渡した日以降の日付を入力してください。';
    const rq = f.returnedQty.normalize('NFKC').trim();
    if (rq) {
      const max = /^\d+$/.test(q) ? +q : 9999;
      if (!/^-?\d+$/.test(rq)) e.returnedQty = '返却数は数値で入力してください。';
      else if (+rq < 0 || +rq > max) e.returnedQty = `返却数は0〜${max}の範囲で入力してください。`;
    }
    return e;
  };
  const save = async () => {
    const e = check();
    setErr(e);
    if (Object.keys(e).length) return;
    setBusy(true);
    const a = { kind: f.kind as (typeof KINDS)[number], qty: Number(f.qty.normalize('NFKC').trim()), carrierId: f.carrierId, driverId: f.driverId, issuedOn: f.issuedOn.replace(/-/g, '/'), memo: f.memo,
      returnedOn: f.returnedOn ? f.returnedOn.replace(/-/g, '/') : '', returnedQty: f.returnedQty.normalize('NFKC').trim() };
    try {
      if (row) await api.action('updateCooler', { ...a, id: row._uid, status: f.status as '貸与中' }); else await api.action('createCooler', a);
      toast('保存しました。');
      closeModal();
    } catch (x) {
      toastError(x);
    } finally { setBusy(false); }
  };
  const cls = (k: keyof Errs) => `inp${err[k] ? ' err' : ''}`;
  return (
    <Modal title={isNew ? '貸与の記録の登録' : '貸与の記録の編集'} width={600} onClose={cancel}
      footer={<><button className="btn lg" onClick={cancel}>キャンセル</button><button className="btn pri lg" disabled={busy} onClick={save}>{isNew ? '登録' : '保存'}</button></>}>
      <div className="f-grid">
        <Field label="種類" req htmlFor="cl-kind" err={err.kind}>
          <select id="cl-kind" className={cls('kind')} value={f.kind} onChange={(e) => set('kind', e.target.value)}>
            <option value="">選択してください</option>
            {KINDS.map((k) => <option key={k} value={k}>{k}</option>)}
          </select>
        </Field>
        <Field label="数" req htmlFor="cl-qty" err={err.qty}>
          <input id="cl-qty" className={`${cls('qty')} num`} inputMode="numeric" maxLength={4} placeholder="例）10" value={f.qty} onChange={(e) => set('qty', e.target.value)} />
        </Field>
        <Field label="委託配送先" req htmlFor="cl-carrier" err={err.carrierId}>
          <select id="cl-carrier" className={cls('carrierId')} value={f.carrierId} onChange={(e) => setF((x) => ({ ...x, carrierId: e.target.value, driverId: '' }))}>
            <option value="">選択してください</option>
            {carriers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </Field>
        <Field label="渡した配送スタッフ" htmlFor="cl-driver" hint="分からなければ空欄">
          <select id="cl-driver" className="inp" value={f.driverId} disabled={!f.carrierId} onChange={(e) => set('driverId', e.target.value)}>
            <option value="">選択しない</option>
            {drivers.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </Field>
        <Field label="渡した日" req htmlFor="cl-date" err={err.issuedOn}>
          <input id="cl-date" type="date" className={cls('issuedOn')} max={todayIso} value={f.issuedOn} onChange={(e) => set('issuedOn', e.target.value)} />
        </Field>
        <Field label="状態" req htmlFor="cl-status" err={err.status}>
          {/* 新規は「貸与中」。紛失・廃棄にするのは編集で */}
          <select id="cl-status" className={cls('status')} value={f.status} disabled={isNew} onChange={(e) => set('status', e.target.value)}>
            {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </Field>
        <Field label="返却日" htmlFor="cl-ret-date" err={err.returnedOn} hint="返してもらった日（任意）">
          <input id="cl-ret-date" type="date" className={cls('returnedOn')} min={f.issuedOn || undefined} value={f.returnedOn} onChange={(e) => set('returnedOn', e.target.value)} />
        </Field>
        <Field label="返却数" htmlFor="cl-ret-qty" err={err.returnedQty} hint="0〜数（任意）">
          <input id="cl-ret-qty" className={`${cls('returnedQty')} num`} inputMode="numeric" maxLength={4} placeholder="例）2" value={f.returnedQty} onChange={(e) => set('returnedQty', e.target.value)} />
        </Field>
        <Field label="メモ" htmlFor="cl-memo" err={err.memo}>
          <textarea id="cl-memo" className={cls('memo')} rows={3} maxLength={500} placeholder="例）返却予定：11月末" value={f.memo} onChange={(e) => set('memo', e.target.value)} />
        </Field>
      </div>
    </Modal>
  );
}
