'use client';

import { useState } from 'react';
import { ApiError } from '@/lib/api/errors';
import type { GenRow } from '@/lib/ops/general/types';
import { GenListPage } from '@/app/ops/_general/GenListPage';
import { api } from '@/app/ops/_general/parts';
import { LEAVE_MSG, useLeaveGuard } from '@/app/ops/_ui/leaveGuard';
import { useOps } from '@/app/ops/_ui/OpsProvider';
import { ConfirmModal, Field, Modal } from '@/app/ops/_ui/ui';

/**
 * バージョンの登録・編集（AW_VERS_002・台帳 F 2026-10-06）。編集のとき 端末OS・バージョン名は変えられない（表示だけ）。
 * 同じ端末OS＋バージョン名は登録できない（E267。サーバー account.setAppVersion の create）。400・409 はバージョン名の欄の下に出す
 */
function VersionModal({ row }: { row?: GenRow }) {
  const { toast, toastError, closeModal, openModal } = useOps();
  const edit = !!row;
  const [os, setOs] = useState(row ? (row.os === 'IOS' ? 'iOS' : 'Android') : '');
  const [ver, setVer] = useState(row ? String(row.ver) : '');
  const [force, setForce] = useState(row?.force === 'ON');
  const [note, setNote] = useState(row ? String(row.note ?? '') : '');
  const [errs, setErrs] = useState<{ os?: string; ver?: string }>({});
  const [busy, setBusy] = useState(false);
  /* 入力中に画面を離れるときの確認（Q02・全サイト共通）：開いたときの値と違うとき */
  const dirty = edit ? force !== (row.force === 'ON') || note !== String(row.note ?? '') : !!os || !!ver || force || !!note;
  useLeaveGuard(dirty);
  const cancel = () => (dirty ? openModal(<ConfirmModal kind="warn" title={LEAVE_MSG.title} text={LEAVE_MSG.text} ok={LEAVE_MSG.ok} okCls="warn-solid" cancel={LEAVE_MSG.cancel} onOk={closeModal} />) : closeModal());
  const save = async () => {
    const e: typeof errs = {};
    if (!os) e.os = '端末OSは必須項目です。';
    if (!ver.trim()) e.ver = 'バージョン名は必須項目です。';
    else if (!/^\d+\.\d+\.\d+$/.test(ver.trim())) e.ver = 'バージョン名は 2.1.0 の形式で入力してください。';
    setErrs(e);
    if (e.os || e.ver) return;
    setBusy(true);
    try {
      await api.action('saveVersion', { os: os as 'iOS' | 'Android', ver: ver.trim(), force, note: note.trim(), isNew: !edit });
      toast('保存しました。');
      closeModal();
    } catch (x) {
      if (x instanceof ApiError && (x.status === 400 || x.status === 409)) setErrs({ ver: x.message }); else toastError(x);
    } finally { setBusy(false); }
  };
  return (
    <Modal title={edit ? 'バージョンの編集' : 'バージョンの登録'} width={560} onClose={cancel}
      footer={<><button className="btn lg" onClick={cancel}>キャンセル</button><button className="btn pri lg" disabled={busy} onClick={save}>{edit ? '保存' : '登録'}</button></>}>
      <div className="f-grid">
        <Field label="端末OS" req htmlFor="ver-os" err={errs.os}>
          <select id="ver-os" className={`sel${errs.os ? ' err' : ''}`} value={os} disabled={edit} onChange={(e) => setOs(e.target.value)}>
            <option value="">選択してください</option>
            <option value="iOS">iOS</option>
            <option value="Android">Android</option>
          </select>
        </Field>
        <Field label="バージョン名" req htmlFor="ver-name" err={errs.ver}>
          <input id="ver-name" className={`inp mono${errs.ver ? ' err' : ''}`} maxLength={14} placeholder="例）2.1.0" value={ver} readOnly={edit} onChange={(e) => setVer(e.target.value)} />
        </Field>
        <Field label="強制アップデート" hint="ON にすると、このバージョンより古いアプリは更新するまで使えません">
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.428571rem' }}><input type="checkbox" checked={force} onChange={(e) => setForce(e.target.checked)} />強制アップデートにする</label>
        </Field>
        <Field label="管理用備考" htmlFor="ver-note">
          <textarea id="ver-note" className="inp" rows={3} maxLength={500} placeholder="例）セキュリティ修正のため必須" value={note} onChange={(e) => setNote(e.target.value)} />
        </Field>
      </div>
    </Modal>
  );
}

/** バージョン&強制アップデート（元：renderGen('version')）。「新規登録」・鉛筆でモーダル */
export default function Page() {
  const { openModal } = useOps();
  return <GenListPage genKey="version" onNew={() => openModal(<VersionModal />)} onEdit={(r) => openModal(<VersionModal row={r} />)} />;
}
