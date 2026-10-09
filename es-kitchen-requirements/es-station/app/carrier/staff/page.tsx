'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import carrier from '@/lib/carrier/area';
import { issueNg, SST } from '@/lib/carrier/logic';
import type { Staff } from '@/lib/carrier/types';
import { areaApi, useQuery } from '@/lib/ops/core/client';
import { Icon } from '../_ui/Icon';
import { useCarrierSignedIn } from '../_ui/CarrierProvider';
import { Crumb, Lic, Loading, Modal, ModalHead, Pager, Unapplied } from '../_ui/parts';
import { CarrierCsvExport, CarrierCsvImport } from '../_ui/csv';
import { StaffDeleteModal } from './_parts';
import { carrierCls } from '@/lib/format/status';

type SF = { name: string; kbn: string; st: string };
const SF0: SF = { name: '', kbn: '', st: '' };

/** アカウント一括発行のメール送信の確認（元の opsModal 'bulk'） */
function BulkModal({ rows, onClose, onIssue }: { rows: Staff[]; onClose: () => void; onIssue: () => Promise<void> }) {
  const [busy, setBusy] = useState(false);
  const bad = rows.filter((r) => issueNg(r));
  return (
    <Modal onClose={onClose} busy={busy} label="アカウント一括発行のメール送信の確認">
      <ModalHead onClose={onClose} busy={busy}>アカウント一括発行のメール送信の確認</ModalHead>
      <div className="mb">
        <p style={{ margin: 0 }}>選択した配送スタッフに、ログイン情報（ID・パスワード）をメールで送信します。<br />実行してよろしいですか？</p>
        <p className="hint" style={{ margin: 0 }}>※既存アカウントがある場合、パスワードはリセットされ、再ログインが必要になります。</p>
        {bad.length > 0 && <p className="err" style={{ margin: 0 }}>エラー：{bad.length}件発生しています。<br />※エラーが発生した行は、メール送信の対象外となります。</p>}
        <div className="tbl-wrap">
          <table className="tbl" style={{ minWidth: '37.142857rem' }}>
            <thead><tr><th>No</th><th>配送スタッフID</th><th>配送スタッフ名</th><th>ステータス</th><th>メールアドレス</th></tr></thead>
            <tbody>{rows.map((r, i) => (
              <tr key={r.id} style={issueNg(r) ? { background: 'var(--line-2)' } : undefined}>
                <td className="num">{i + 1}</td><td>{r.id}</td><td style={{ color: 'var(--blue)' }}>{r.name}</td><td><span className={`badge ${SST[r.st]}`}>{r.st}</span></td>
                <td>{r.email || <span className="err">未登録</span>}{issueNg(r) && <><br /><small className="err">{issueNg(r)}</small></>}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </div>
      <footer>
        <button type="button" className="btn out" disabled={busy} onClick={onClose}>キャンセル</button>
        <button type="button" className="btn pri" disabled={busy || bad.length === rows.length} onClick={async () => { setBusy(true); await new Promise((r) => setTimeout(r, 1200)); await onIssue(); }}>{busy && <i className="spin" />}発行する</button>
      </footer>
    </Modal>
  );
}

/** 発行の結果（元の bulkDone） */
function BulkDone({ ok, fail, onClose, onRetry }: { ok: number; fail: number; onClose: () => void; onRetry: () => void }) {
  const part = fail > 0;
  return (
    <Modal onClose={onClose} cls="sm">
      <header style={{ border: 0, justifyContent: 'flex-end' }}><button type="button" className="x" aria-label="閉じる" onClick={onClose}><Icon name="x" /></button></header>
      <div className="mb">
        <div className="big-ic" style={{ background: part ? 'color-mix(in srgb,var(--red) 15%,transparent)' : 'var(--green-50)', color: part ? 'var(--red)' : 'var(--green)' }}>{part ? <b style={{ fontSize: '2.571429rem' }}>!</b> : <Icon name="check" />}</div>
        <b>アカウント発行が完了しました{part && <><br />（一部エラーあり）</>}</b>
        <p style={{ margin: 0, fontSize: '0.928571rem' }}>{part ? 'アカウント発行処理が完了しました。' : <>選択した配送スタッフへのアカウント発行および<br />ログイン情報のメール送信が完了しました。</>}</p>
        {part && <p className="hint" style={{ textAlign: 'left', margin: 0 }}>成功：{ok}件<br />失敗：{fail}件<br />※失敗した配送スタッフについてはメール送信されていません。<br />内容をご確認のうえ、再度実行してください。</p>}
      </div>
      <footer style={{ border: 0 }}>
        <button type="button" className="btn out" style={{ flex: 1 }} onClick={onClose}>完了</button>
        {part && <button type="button" className="btn pri" style={{ flex: 1 }} onClick={onRetry}>再度実行</button>}
      </footer>
    </Modal>
  );
}

/** 配送スタッフ一覧（元の staffList()・OW_SCHED_001）：絞り込み・アカウント一括発行・削除 */
export default function CarrierStaff() {
  const { company, toast, toastError } = useCarrierSignedIn();
  const router = useRouter();
  const api = areaApi(carrier);
  const { data } = useQuery(api, 'staff', { company });
  const [f, setF] = useState<SF>(SF0);
  const [draft, setDraft] = useState<SF>(SF0);
  const [sel, setSel] = useState<Set<string>>(new Set());
  const [modal, setModal] = useState<null | { type: 'bulk' } | { type: 'done'; ok: number; fail: number } | { type: 'del'; id: string }>(null);
  const crumb = <Crumb items={[['ホーム', '/carrier'], '配送スタッフ']} />;
  if (!data) return <>{crumb}<h1 className="ptitle">配送スタッフ</h1><Loading /></>;
  const list = data.staff.filter((s) => (!f.name || (s.name + s.kana + s.id).includes(f.name)) && (!f.kbn || s.kbn === f.kbn) && (!f.st || s.st === f.st));
  const n = sel.size;
  const allOn = list.length > 0 && list.every((s) => sel.has(s.id));
  const toggle = (id: string, on: boolean) => { const x = new Set(sel); if (on) x.add(id); else x.delete(id); setSel(x); };
  const del = modal?.type === 'del' ? data.staff.find((s) => s.id === modal.id) : null;
  return (
    <>
      {crumb}
      <div className="phead">
        <h1 className="ptitle">配送スタッフ</h1>
        <div style={{ display: 'flex', gap: '0.857143rem', flexWrap: 'wrap' }}>
          {/* CSV（2026/10/03 決定）：新しい配送スタッフをまとめて登録（lib/csv/sites.ts の carrierStaff・登録は「新規登録」と同じ確かめ）と、検索条件のとおりの出力 */}
          <CarrierCsvImport className="btn out" href="/carrier/staff/import" />
          <CarrierCsvExport<(typeof list)[number]> screen="配送スタッフ" rows={list} entity="carrierStaff" keys={(s) => s.id}
            filters={[{ label: '配送スタッフ名', value: f.name }, { label: '雇用形態', value: f.kbn }, { label: 'ステータス', value: f.st }]} />
          <button type="button" className="btn out" disabled={!n} style={{ minHeight: '3.142857rem' }} onClick={() => setModal({ type: 'bulk' })}><Icon name="users" />アカウント一括発行{n ? `（${n}名）` : ''}</button>
          <button type="button" className="btn pri" style={{ minHeight: '3.142857rem' }} onClick={() => router.push('/carrier/staff/new')}>新規登録</button>
        </div>
      </div>
      <div className="panel">
        <form className="search-row" onSubmit={(e) => { e.preventDefault(); setF({ ...draft, name: draft.name.trim() }); }}>
          <div className="inp" style={{ maxWidth: '18.571429rem' }}><Icon name="search" /><input className="bare" placeholder="配送スタッフ名" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} /></div>
          <select className="inp" style={{ maxWidth: '14.285714rem' }} aria-label="雇用形態" value={draft.kbn} onChange={(e) => setDraft({ ...draft, kbn: e.target.value })}><option value="">雇用形態</option>{['社員', '個人事業主'].map((k) => <option key={k}>{k}</option>)}</select>
          <select className="inp" style={{ maxWidth: '14.285714rem' }} aria-label="ステータス" value={draft.st} onChange={(e) => setDraft({ ...draft, st: e.target.value })}><option value="">ステータス</option>{Object.keys(SST).map((k) => <option key={k}>{k}</option>)}</select>
          <span style={{ flex: 1 }} />
          <button type="button" className="btn out" onClick={() => { setF(SF0); setDraft(SF0); }}>クリア</button><Unapplied show={JSON.stringify({ ...draft, name: draft.name.trim() }) !== JSON.stringify(f)} /><button className="btn pri">検索</button>
        </form>
        <div className="tbl-wrap">
          <table className="tbl">
            <thead><tr><th>No</th><th><input type="checkbox" aria-label="すべて選択" checked={allOn} onChange={(e) => { const x = new Set(sel); list.filter((s) => !s.del).forEach((s) => (e.target.checked ? x.add(s.id) : x.delete(s.id))); setSel(x); }} /></th><th>免許</th><th>配送スタッフID</th><th>配送スタッフ名</th><th>雇用形態</th><th>電話番号</th><th>ステータス</th><th>アカウント状態</th><th>操作</th></tr></thead>
            <tbody>{list.map((s, i) => (
              <tr key={s.id} className={s.del ? 'muted' : ''}>
                <td className="num">{i + 1}</td>
                <td><input type="checkbox" checked={sel.has(s.id)} disabled={!!s.del} aria-label={`${s.name}を選択`} onChange={(e) => toggle(s.id, e.target.checked)} /></td>
                <td><Lic on={s.lic} /></td><td>{s.id}</td>
                <td><button type="button" className="lnk" onClick={() => router.push(`/carrier/staff/${s.id}`)}>{s.name}</button></td>
                <td>{s.kbn}</td><td className="num">{s.tel}</td>
                <td><span className={`badge ${SST[s.st]}`}>{s.st}</span>{s.del && <> <span className="badge b-gray">削除済</span></>}</td>
                <td><span className={`badge ${carrierCls(s.acct)}`}>{s.acct}</span></td>
                <td>{!s.del && (
                  <span style={{ display: 'flex', gap: '0.285714rem' }}>
                    <button type="button" className="x" style={{ color: 'var(--blue)' }} aria-label={`${s.name}を編集`} onClick={() => router.push(`/carrier/staff/${s.id}?edit=1`)}><Icon name="pen" /></button>
                    <button type="button" className="x" style={{ color: 'var(--red)' }} aria-label={`${s.name}を削除`} onClick={() => setModal({ type: 'del', id: s.id })}><Icon name="trash" /></button>
                  </span>
                )}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
        <Pager text={`${list.length}件中 1-${list.length}件`} />
      </div>
      {modal?.type === 'bulk' && (
        <BulkModal
          rows={data.staff.filter((s) => sel.has(s.id))} onClose={() => setModal(null)}
          onIssue={async () => {
            try {
              const r = await api.action('issueAccounts', { company, ids: [...sel] });
              setModal({ type: 'done', ok: r.ok, fail: r.fail });
            } catch (e) {
              setModal(null);
              toastError(e);
            }
          }}
        />
      )}
      {modal?.type === 'done' && <BulkDone ok={modal.ok} fail={modal.fail} onClose={() => setModal(null)} onRetry={() => setModal({ type: 'bulk' })} />}
      {del && (
        <StaffDeleteModal
          name={del.name} id={del.id} block={data.blocks[del.id] ?? ''} onClose={() => setModal(null)}
          onOk={async () => {
            try {
              const r = await api.action('deleteStaff', { company, id: del.id });
              toggle(del.id, false);
              setModal(null);
              toast(`${r.name} を削除しました`);
            } catch (e) {
              setModal(null);
              toastError(e);
            }
          }}
        />
      )}
    </>
  );
}
