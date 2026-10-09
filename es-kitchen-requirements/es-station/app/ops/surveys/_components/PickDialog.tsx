'use client';

import { useState } from 'react';
import { useDomainQuery } from '@/lib/domain/client';
import type { SurveyTarget } from '@/lib/domain/survey';
import { Icon } from '../../_ui/Icon';
import { useOps } from '../../_ui/OpsProvider';
import { MiniPager, svApi } from './parts';

type Pick = SurveyTarget['picks'][number];
const PER = 10;

/**
 * 配信対象の個別選択（Phase 1 画面 21・27）。選ぶのはアプリの利用者だけ（2026/10/03 決定）。法人・拠点で絞り込む。
 * キーワード（ユーザー名・法人名・拠点名・ID）・クリア・検索、すべて選択（絞り込んだ行）、ページ送り、
 * 「選択済み：N（追加選択：N）」＝いまの選択の数（このダイアログで足した数）
 */
export function PickDialog({ init, onOk }: { init: Pick[]; onOk: (picks: Pick[]) => void }) {
  const { closeModal } = useOps();
  const [sel, setSel] = useState(() => new Set(init.map((p) => p.id)));
  const [qIn, setQIn] = useState('');
  const [f, setF] = useState({ q: '', corpId: '', branchId: '' });
  const [page, setPage] = useState(1);
  const { data } = useDomainQuery(svApi, 'candidates', f);
  const rows = data?.rows ?? [];
  const branches = (data?.branches ?? []).filter((b) => !f.corpId || b.corpId === f.corpId);
  const pageRows = rows.slice((page - 1) * PER, page * PER);
  const initKeys = new Set(init.map((p) => p.id));
  const added = [...sel].filter((x) => !initKeys.has(x)).length;
  const toggle = (id: string, on: boolean) => setSel((s) => { const n = new Set(s); if (on) n.add(id); else n.delete(id); return n; });
  const allOn = !!rows.length && rows.every((r) => sel.has(r.id));
  const go = (p: Partial<typeof f>) => { setF({ ...f, ...p }); setPage(1); };

  return (
    <div className="ov">
      <div className="mbox" role="dialog" aria-modal="true" aria-label="アプリユーザーの個別選択" style={{ width: 'min(70rem,100%)' }}>
        <div className="mbox-h"><h3>アプリユーザーの個別選択</h3><button className="icon-btn" aria-label="閉じる" onClick={closeModal}><Icon name="x" /></button></div>
        <div className="mbox-b">
          <div style={{ display: 'flex', gap: '0.571429rem', alignItems: 'center', marginBottom: '0.857143rem', flexWrap: 'wrap' }}>
            <b style={{ whiteSpace: 'nowrap' }}>絞り込み条件</b>
            <select className="sel" aria-label="法人" style={{ width: '14.285714rem' }} value={f.corpId} onChange={(e) => go({ corpId: e.target.value, branchId: '' })}>
              <option value="">法人（すべて）</option>{(data?.corps ?? []).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <select className="sel" aria-label="拠点" style={{ width: '14.285714rem' }} value={f.branchId} onChange={(e) => go({ branchId: e.target.value })}>
              <option value="">拠点（すべて）</option>{branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
            <input className="inp" style={{ flex: 1, minWidth: '12.857143rem' }} placeholder="ユーザー名、法人名、拠点名、ID" value={qIn}
              onChange={(e) => setQIn(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') go({ q: qIn }); }} />
            <button className="btn out" onClick={() => { setQIn(''); go({ q: '', corpId: '', branchId: '' }); }}>クリア</button>
            <button className="btn pri" onClick={() => go({ q: qIn })}>検索</button>
          </div>
          <div className="tbl-wrap">
            <table className="tbl">
              <thead>
                <tr>
                  <th style={{ width: '3.142857rem' }}><input type="checkbox" aria-label="絞り込んだ行をすべて選択" checked={allOn} onChange={(e) => rows.forEach((r) => toggle(r.id, e.target.checked))} /></th>
                  <th style={{ width: '9.285714rem' }}>ID</th><th>ユーザー</th><th>法人名</th><th>拠点</th>
                </tr>
              </thead>
              <tbody>
                {pageRows.map((r) => (
                  <tr key={r.id}>
                    <td><input type="checkbox" aria-label={`${r.id} ${r.name}`} checked={sel.has(r.id)} onChange={(e) => toggle(r.id, e.target.checked)} /></td>
                    <td className="mono">{r.id}</td><td>{r.name}</td><td>{r.corpName}</td><td>{r.branchName}</td>
                  </tr>
                ))}
                {data && !rows.length && <tr><td colSpan={5} className="empty">該当するデータがありません。</td></tr>}
                {!data && <tr><td colSpan={5} className="empty">読み込み中…</td></tr>}
              </tbody>
            </table>
          </div>
          <MiniPager total={rows.length} page={page} per={PER} onPage={setPage} />
        </div>
        <div className="mbox-f" style={{ justifyContent: 'space-between' }}>
          <b>選択済み：{sel.size}（追加選択：{added}）</b>
          <span style={{ display: 'flex', gap: '0.571429rem' }}>
            <button className="btn out" onClick={closeModal}>キャンセル</button>
            <button className="btn pri" onClick={() => { onOk([...sel].map((id) => ({ type: 'user' as const, id }))); closeModal(); }}>選択を確定</button>
          </span>
        </div>
      </div>
    </div>
  );
}
