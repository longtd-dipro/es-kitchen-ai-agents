'use client';

import Link from 'next/link';
import { useState } from 'react';
import { usePaging } from '@/lib/ui/paging';
import { useQuery } from '@/lib/ops/core/client';
import { CR_JUDGE_TONE, CR_JUDGES } from '@/lib/ops/delivery/constants';
import type { ChangeRequest } from '@/lib/ops/delivery/types';
import { useOps } from '../../_ui/OpsProvider';
import { useCanAct } from '../../_ui/perm';
import { api } from './api';
import { Badge, Button, Checkbox, Dialog, EsModal, Pagination, SearchPanel, Select, TempTag, TextField } from './kit';

/*
 * 変更申請（未処理）→ 変更申請一括承認 → 一括承認の結果（部品 16 の ChangeRequests・ChangeApprove・ChangeResult）。
 * 「問題なし」の申請だけ選んで一括承認できる。ほかは申請番号から配送データ詳細を開いて1件ずつ処理する。
 */

const tpKind = (t: string) => (t === '冷凍' ? 'frozen' : 'mixed');
/** 申請番号から開く配送データ（見本の申請 DD-20260916-0001 は DL-261116-0007。ほかは元のデモと同じく見本の配送データ） */
const dlOf = (c: ChangeRequest) => `/ops/delivery/list/${c.dl ?? 'DL-261020-0021'}`;
/** 承認後のピッキング日（冷蔵はリードタイム 1日） */
const pickShift = (c: ChangeRequest) => {
  if (c.pick) return c.pick;
  const back = (s: string) => { const d = new Date(s.slice(0, 10) + 'T00:00:00Z'); d.setUTCDate(d.getUTCDate() - (c.temp === '冷凍' ? 2 : 1)); return d.toISOString().slice(5, 10).replace('-', '/'); };
  return `${back(c.cur)} → ${back(c.want)}`;
};

export default function ChangeRequestsFlow({ onClose }: { onClose: () => void }) {
  const { toast, toastError } = useOps();
  const canAct = useCanAct();
  /* 権限がなければ一括承認を出さない */
  const canApprove = canAct(api, 'approveChangeRequests');
  const [step, setStep] = useState<'list' | 'approve' | 'done'>('list');
  const [f, setF] = useState({ q: '', judge: '', svc: '' });
  const [args, setArgs] = useState(f);
  const { data } = useQuery(api, 'changeRequests', args);
  const rows = data ?? [];
  const pg = usePaging(rows);
  const [sel, setSel] = useState<Record<string, boolean> | null>(null);
  const on = (c: ChangeRequest) => (sel ? !!sel[c.id] : c.on) && c.judge === '問題なし';
  const picked = rows.filter(on);
  const [count, setCount] = useState(0);
  const toggle = (c: ChangeRequest, v: boolean) => setSel({ ...Object.fromEntries(rows.map((r) => [r.id, on(r)])), [c.id]: v });

  if (step === 'done') {
    return (
      <EsModal m="ChangeResult" tone="success" title="一括承認が完了しました" cancelLabel="閉じる" onCancel={() => { onClose(); toast(`${count}件の変更申請を承認しました`); }}>
        {count}件の変更申請を承認しました。<br />各申請の変更履歴に、承認日時・担当者を保存しました。
      </EsModal>
    );
  }
  if (step === 'approve') {
    const approve = async () => {
      try {
        const r = await api.action('approveChangeRequests', { ids: picked.map((c) => c.id) });
        setCount(r.count); setStep('done');
      } catch (e) { toastError(e); }
    };
    return (
      <Dialog m="ChangeApprove" title="変更申請一括承認" onClose={() => setStep('list')}
        footer={<><Button variant="outline" size="lg" onClick={() => setStep('list')}>閉じる</Button>{canApprove && <Button size="lg" onClick={approve}>一括承認</Button>}</>}>
        <div className="mdl-b">
          <div className="es-inline es-inline--info" role="status"><div>次の {picked.length}件を承認し、納品日を第一希望日に変更します。ピッキング日はリードタイムを保って一緒に動きます。承認すると法人の申請履歴と配送カレンダーに反映され、スケジュールでは青い印（移動）が付きます。</div></div>
          <div className="es-table-wrap">
            <table className="es-table">
              <thead><tr><th>No</th><th>申請番号</th><th>拠点名</th><th>温度帯</th><th>納品日</th><th>承認後の納品日</th><th>ピッキング日</th><th>判定ステータス</th><th>理由</th></tr></thead>
              <tbody>
                {picked.map((c, i) => (
                  <tr key={c.id}>
                    <td>{pg.start + i + 1}</td>
                    <td className="es-mono"><Link href={dlOf(c)}>{c.id}</Link></td>
                    <td>{c.site}</td>
                    <td><TempTag kind={c.temp === '冷凍' ? 'frozen' : 'chilled'} /></td>
                    <td className="es-num">{c.cur}</td>
                    <td className="es-num new">{c.after ?? c.want}</td>
                    <td className="es-num">{pickShift(c)}</td>
                    <td><Badge tone="success">問題なし</Badge></td>
                    <td className="w">{c.why}{c.note && <span className="sub">{c.note}</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Dialog>
    );
  }
  return (
    <Dialog m="ChangeRequests" title="変更申請（未処理）" onClose={onClose}
      footer={<><Button variant="outline" size="lg" onClick={onClose}>閉じる</Button>{canApprove && <Button size="lg" disabled={!picked.length} onClick={() => setStep('approve')}>一括承認（{picked.length}件）</Button>}</>}>
      <div className="mdl-b">
        <SearchPanel sig={JSON.stringify(f)} onSearch={() => setArgs(f)} onClear={() => { const e = { q: '', judge: '', svc: '' }; setF(e); setArgs(e); }}>
          {[
            <TextField key="q" className="es-grow" icon="Search" placeholder="法人ID・名、拠点ID・名、契約ID" value={f.q} onChange={(q) => setF({ ...f, q })} />,
            <Select key="j" placeholder="システム判定" options={[...CR_JUDGES]} value={f.judge} onChange={(judge) => setF({ ...f, judge })} />,
            <Select key="s" placeholder="便種別" options={['ES配送便', 'COOL便']} value={f.svc} onChange={(svc) => setF({ ...f, svc })} />,
          ]}
        </SearchPanel>
        <div className="hint">「問題なし」の申請だけ選んで一括承認できます。「希望日なし」「要再確認」は申請番号から配送データ詳細を開き、1件ずつ処理します。同じ拠点・同じ納品日の冷蔵と冷凍は一緒に動きます。</div>
        <div className="es-table-wrap">
          <table className="es-table">
            <thead><tr><th style={{ width: '3.142857rem' }}></th><th>No</th><th>申請番号</th><th>受付日</th><th>拠点名</th><th>便種別</th><th>温度帯</th><th>納品日</th><th>第一希望日</th><th>判定ステータス</th><th>理由</th></tr></thead>
            <tbody>
              {pg.rows.map((c, i) => {
                const ok = c.judge === '問題なし';
                return (
                  <tr key={c.id} className={ok ? '' : 'dis'}>
                    <td><Checkbox checked={on(c)} disabled={!ok} onChange={(v) => toggle(c, v)} ariaLabel={c.id + 'を選ぶ'} /></td>
                    <td>{i + 1}</td>
                    <td className="es-mono"><Link href={dlOf(c)}>{c.id}</Link></td>
                    <td className="es-num">{c.rcv}</td>
                    <td className="w">{c.site}</td>
                    <td>{c.svc}</td>
                    <td><TempTag kind={tpKind(c.temp)} /></td>
                    <td className="es-num">{c.cur}</td>
                    <td className="es-num">{c.want}</td>
                    <td><Badge tone={CR_JUDGE_TONE[c.judge]}>{c.judge}</Badge></td>
                    <td className="clip">{c.why}</td>
                  </tr>
                );
              })}
              {!rows.length && <tr><td colSpan={11} style={{ textAlign: 'center', color: 'var(--text-low)', padding: '1.714286rem' }}>条件に合う申請はありません</td></tr>}
            </tbody>
          </table>
        </div>
        <Pagination {...pg.props} />
      </div>
    </Dialog>
  );
}
