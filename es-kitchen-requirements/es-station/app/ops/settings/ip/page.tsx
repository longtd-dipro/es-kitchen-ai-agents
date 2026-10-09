'use client';

import { useState } from 'react';
import { ApiError } from '@/lib/api/errors';
import { GenListPage } from '@/app/ops/_general/GenListPage';
import type { GenCol } from '@/app/ops/_general/gen';
import type { GenRow } from '@/lib/ops/general/types';
import { api } from '@/app/ops/_general/parts';
import { LEAVE_MSG, useLeaveGuard } from '@/app/ops/_ui/leaveGuard';
import { useOps } from '@/app/ops/_ui/OpsProvider';
import { ConfirmModal, Field, Modal } from '@/app/ops/_ui/ui';

/**
 * IPアドレスの登録・編集（AW_IPWL_002・台帳 F 2026-10-06／編集は hong 2026-10-07 で可に）。入力は IPアドレス（CIDR 可）と管理用備考。効かせるサイトは運営Webに固定（表示だけ）。
 * 入力の確かめはサーバー（account.addIp・updateIp：E263〜E265。同じ IP は自分の行を除いて重複）。400・409 は IPアドレスの欄の下に出す
 */
function IpModal({ row }: { row?: GenRow }) {
  const { toast, toastError, closeModal, openModal } = useOps();
  const ip0 = row ? String(row.ip ?? '') : '';
  const note0 = row ? String(row.note ?? '') : '';
  const [ip, setIp] = useState(ip0);
  const [note, setNote] = useState(note0);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  /* 入力中に画面を離れるときの確認（Q02・全サイト共通） */
  const dirty = ip !== ip0 || note !== note0;
  useLeaveGuard(dirty);
  const cancel = () => (dirty ? openModal(<ConfirmModal kind="warn" title={LEAVE_MSG.title} text={LEAVE_MSG.text} ok={LEAVE_MSG.ok} okCls="warn-solid" cancel={LEAVE_MSG.cancel} onOk={closeModal} />) : closeModal());
  const save = async () => {
    if (!ip.trim()) { setErr('IPアドレスは必須項目です。'); return; }
    setErr('');
    setBusy(true);
    try {
      if (row) await api.action('updateIp', { id: row._uid, ip: ip.trim(), note: note.trim() });
      else await api.action('addIp', { ip: ip.trim(), note: note.trim(), sites: ['ops'] });
      toast('保存しました。');
      closeModal();
    } catch (e) {
      if (e instanceof ApiError && (e.status === 400 || e.status === 409)) setErr(e.message); else toastError(e);
    } finally { setBusy(false); }
  };
  return (
    <Modal title={row ? 'IPアドレスの編集' : 'IPアドレスの登録'} width={560} onClose={cancel}
      footer={<><button className="btn lg" onClick={cancel}>キャンセル</button><button className="btn pri lg" disabled={busy} onClick={save}>{row ? '保存' : '登録'}</button></>}>
      <div className="f-grid">
        <Field label="IPアドレス" req htmlFor="ip-cidr" hint="範囲で入れるときは 203.0.113.0/24 のように書きます" err={err}>
          <input id="ip-cidr" className={`inp mono${err ? ' err' : ''}`} maxLength={18} placeholder="例）203.0.113.0/24" value={ip} onChange={(e) => setIp(e.target.value)} />
        </Field>
        <Field label="管理用備考" htmlFor="ip-note">
          <textarea id="ip-note" className="inp" rows={3} maxLength={500} placeholder="例）本社オフィス（東京）" value={note} onChange={(e) => setNote(e.target.value)} />
        </Field>
        <Field label="効かせるサイト"><span>運営Web</span></Field>
      </div>
    </Modal>
  );
}

/** 一覧の列：操作は 編集（鉛筆）・削除 */
const COLS: GenCol[] = [['note', '管理用備考'], ['ip', 'IPアドレス'], ['_act', '操作', 'ed']];

/** IPホワイトリスト管理（元：renderGen('ip')）。「新規登録」で登録、鉛筆で編集のモーダル */
export default function Page() {
  const { openModal } = useOps();
  return <GenListPage genKey="ip" cols={COLS} onNew={() => openModal(<IpModal />)} onEdit={(r) => openModal(<IpModal row={r} />)} />;
}
