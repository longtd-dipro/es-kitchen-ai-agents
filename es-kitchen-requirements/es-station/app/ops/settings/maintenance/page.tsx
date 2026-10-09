'use client';

import { useState } from 'react';
import { useQuery } from '@/lib/ops/core/client';
import type { MaintState } from '@/lib/ops/general/types';
import { ListTable, useList, type ListCol } from '@/app/ops/_general/list';
import { ListCsv } from '@/app/ops/_ui/csv';
import { api, DemoNote, Loading } from '@/app/ops/_general/parts';
import { Icon } from '@/app/ops/_ui/Icon';
import { useOps } from '@/app/ops/_ui/OpsProvider';
import { useCanAct } from '@/app/ops/_ui/perm';
import { LEAVE_MSG, useLeaveGuard } from '@/app/ops/_ui/leaveGuard';
import { Badge, ConfirmModal, Field, Modal, PageHead } from '@/app/ops/_ui/ui';

type Log = MaintState['log'][number];
const os = (v: string) => <td><span className="os"><i>{v === 'IOS' ? '' : 'A'}</i>{v}</span></td>;
const COLS: ListCol<Log>[] = [
  { key: '_os', label: '端末OS', td: (r) => os(r.os) },
  { key: 'title', label: 'タイトル' },
  { key: 'body', label: '説明内容', td: (r) => <td><div className="clip" title={r.body}>{r.body}</div></td> },
  { key: 's', label: '開始日時' },
  { key: 'e', label: '終了日時' },
];

/**
 * 案内の入力（AW_MNTN_001・台帳 F 2026-10-06）。端末OSごとにタイトル（60）・説明内容（500）。必須（E01）はここで確かめる。
 *   mode='start'：「メンテナンス開始」の確認。保存してある案内を初期値に出し、直してから開始できる（Q180 → 開始と同時に案内も保存）
 *   mode='edit'：案内の編集。メンテナンス中でも直せる（「編集」→ 保存 → S01）
 */
function MaintModal({ mode, k, name, title: t0, body: b0 }: { mode: 'start' | 'edit'; k: 'ios' | 'android'; name: string; title: string; body: string }) {
  const { toast, toastError, closeModal, openModal } = useOps();
  const [title, setTitle] = useState(t0);
  const [body, setBody] = useState(b0);
  const [errs, setErrs] = useState<{ title?: string; body?: string }>({});
  const [busy, setBusy] = useState(false);
  const start = mode === 'start';
  /* 入力中に画面を離れるときの確認（Q02・全サイト共通）：開いたときの値と違うとき */
  const dirty = title !== t0 || body !== b0;
  useLeaveGuard(dirty);
  const cancel = () => (dirty ? openModal(<ConfirmModal kind="warn" title={LEAVE_MSG.title} text={LEAVE_MSG.text} ok={LEAVE_MSG.ok} okCls="warn-solid" cancel={LEAVE_MSG.cancel} onOk={closeModal} />) : closeModal());
  const save = async () => {
    const e = { title: title.trim() ? undefined : 'タイトルは必須項目です。', body: body.trim() ? undefined : '説明内容は必須項目です。' };
    setErrs(e);
    if (e.title || e.body) return;
    setBusy(true);
    try {
      if (start) {
        await api.action('maintToggle', { k, on: true, title, body });
        toast(`${name} のメンテナンスを開始しました。`);
      } else {
        await api.action('maintEdit', { k, title, body });
        toast('保存しました。');
      }
      closeModal();
    } catch (x) { toastError(x); } finally { setBusy(false); }
  };
  return (
    <Modal title={start ? 'メンテナンスの開始' : `${name} の案内を編集`} width={560} onClose={cancel}
      footer={<><button className="btn lg" onClick={cancel}>キャンセル</button><button className={`btn ${start ? 'warn-solid' : 'pri'} lg`} disabled={busy} onClick={save}>{start ? '開始する' : '保存'}</button></>}>
      {start && <p style={{ marginTop: 0 }}>{name} アプリをメンテナンス中にします。<br />利用中の方もアプリが使えなくなり、下の案内（タイトル・説明内容）が表示されます。<br />内容を確かめて、開始してよろしいですか？</p>}
      <div className="f-grid" style={{ gridTemplateColumns: '1fr' }}>
        <Field label="タイトル" req htmlFor="mt-title" err={errs.title}>
          <input id="mt-title" className={`inp${errs.title ? ' err' : ''}`} style={{ width: '100%' }} maxLength={60} placeholder="例）システムメンテナンスのお知らせ" value={title} onChange={(e) => setTitle(e.target.value)} />
        </Field>
        <Field label="説明内容" req htmlFor="mt-body" err={errs.body}>
          <textarea id="mt-body" className={`inp${errs.body ? ' err' : ''}`} style={{ width: '100%' }} rows={5} maxLength={500} value={body} onChange={(e) => setBody(e.target.value)} />
        </Field>
      </div>
    </Modal>
  );
}

/** 設定管理 ＞ メンテナンス管理（元：renderMaint） */
export default function Page() {
  const { toast, toastError, openModal } = useOps();
  const canAct = useCanAct();
  const list = useList('maint');
  const { data: m } = useQuery(api, 'maint');
  if (!m) return <Loading />;

  const toggle = (k: 'ios' | 'android') => {
    const nm = k === 'ios' ? 'iOS' : 'Android';
    /* 開始：案内（タイトル・説明内容）を直してから開始できるモーダル */
    if (!m[k].on) { openModal(<MaintModal mode="start" k={k} name={nm} title={m[k].title} body={m[k].body} />); return; }
    const run = async () => {
      try { await api.action('maintToggle', { k, on: false }); toast(`${nm} のメンテナンスを終了しました。`); } catch (e) { toastError(e); }
    };
    openModal(<ConfirmModal kind="warn" title="メンテナンスの終了" text={<>{nm} アプリのメンテナンスを終了します。<br />利用者はすぐにアプリを使えるようになります。<br />終了してよろしいですか？</>} ok="終了する" okCls="pri" onOk={run} />);
  };
  const card = (k: 'ios' | 'android', name: string, mark: string) => {
    const c = m[k];
    return (
      <div className={`mcard${c.on ? ' on' : ''}`}>
        <div className="hd"><i>{mark}</i><b>{name}</b><Badge v={c.on ? 'メンテナンス中' : '稼働中'} /></div>
        <div className="bd"><small>タイトル:</small><span>{c.title}</span><small>説明内容:</small><span>{c.body}</span></div>
        <div className="ft">
          {canAct(api, 'maintToggle') && <button className={`btn ${c.on ? 'warn-solid' : ''}`} onClick={() => toggle(k)}><Icon name="power" />{c.on ? 'メンテナンス終了' : 'メンテナンス開始'}</button>}
          {canAct(api, 'maintToggle') && <button className="btn" onClick={() => openModal(<MaintModal mode="edit" k={k} name={k === 'ios' ? 'iOS' : 'Android'} title={c.title} body={c.body} />)}><Icon name="edit" />編集</button>}
        </div>
      </div>
    );
  };
  return (
    <>
      <DemoNote />
      <PageHead crumbs={['設定管理', 'メンテナンス管理']} title="メンテナンス管理">
        <ListCsv screen="メンテナンス管理" list={list} filters={null} cols={COLS} rows={m.log} />
      </PageHead>
      <div className="card">
        <div className="mcards">{card('ios', 'IOS', '')}{card('android', 'Android', 'A')}</div>
        <div style={{ height: '1.142857rem' }} />
        <ListTable list={list} cols={COLS} rows={m.log} />
      </div>
    </>
  );
}
