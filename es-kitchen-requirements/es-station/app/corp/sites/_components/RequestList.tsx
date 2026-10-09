'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useQuery } from '@/lib/ops/core/client';
import { REQ_KINDS, REQ_STATES, TONE_AP } from '@/lib/corp/sites/logic';
import { useCorpSignedIn } from '../../_ui/CorpProvider';
import { Badge, Button, Card, EmptyState, PageHead, Pagination, SearchPanel, Select, Tabs, TextField } from './es';
import { api, Loading, Lnk, ReqDialog, Tbl, Td, useAcct } from './parts';

/*
 * 申請 ＞ 契約の申請（元：22_法人_拠点管理.html の Req）。受付番号から申請の詳細（取り下げ）を開く。
 * 「お届け日の変更」のタブは /corp/requests（ホーム・お届けの担当）へ。open＝最初から開く申請（/corp/requests/contract/[no]）
 */
type Q = { t?: string; kind?: string; st?: string };

export default function RequestList({ open }: { open?: string }) {
  const router = useRouter();
  const acct = useAcct();
  const { isBranch, view } = useCorpSignedIn();
  const ro = view === 'ro';   /* 解約後（参照のみ）：変更のお申し込み・拠点を追加は出さない（台帳 F 2026-10-08 Q2） */
  const { data } = useQuery(api, 'requests', { acct });
  const [q, setQ] = useState<Q>({});
  const [qv, setQv] = useState<Q>({});
  const [sel, setSel] = useState<string | null>(open ?? null);
  if (!data) return <Loading />;
  const rows = data.rows.filter((x) => {
    if (q.t && !(x.r[0] + x.site.name + x.site.id).includes(q.t)) return false;
    if (q.kind && x.r[1] !== q.kind) return false;
    if (q.st && x.st !== q.st) return false;
    return true;
  });
  const waiting = data.rows.filter((x) => x.st === 'ESキッチンが確認中').length;
  const cur = sel ? data.rows.find((x) => x.r[0] === sel) : null;
  const set = (k: keyof Q) => (v: string) => setQv({ ...qv, [k]: v });
  const close = () => { setSel(null); if (open) router.push('/corp/requests/contract'); };
  return (
    <>
      <PageHead crumbs={['申請', '契約の申請']} title="申請"
        stat={<><span>{data.corpName}</span><span className="k">権限</span><span>{isBranch ? '拠点アカウント（この拠点だけ）' : '法人アカウント（自社のすべての拠点）'}</span></>}
        actions={<>
          {!isBranch && !ro ? <Button variant="outline" icon="Plus" onClick={() => router.push('/corp/sites/new')}>拠点を追加</Button> : null /* RV-CORP-20261002 C-b：法人アカウントだけ */}
          {ro ? null : <Button onClick={() => router.push('/corp/requests/contract/new')}>変更のお申し込み</Button>}
        </>} />
      <Card>
        <Tabs items={[{ value: 'dlv', label: 'お届け日の変更' }, { value: 'contract', label: '契約の申請', count: waiting || undefined }]} value="contract" onChange={(x) => { if (x === 'dlv') router.push('/corp/requests'); }} />
        <SearchPanel onSearch={() => setQ(qv)} onClear={() => { setQ({}); setQv({}); }}>
          <TextField className="es-grow" icon="Search" placeholder="受付番号・拠点ID・拠点名" value={qv.t ?? ''} onChange={set('t')} />
          <Select placeholder="申請の種類" options={REQ_KINDS} value={qv.kind ?? ''} onChange={set('kind')} />
          <Select placeholder="承認状態" options={REQ_STATES} value={qv.st ?? ''} onChange={set('st')} />
        </SearchPanel>
        <div className="tools">
          <span><b style={{ color: 'var(--text-high)' }}>契約の申請 {rows.length}件</b>（申請日の新しい順）</span>
          <span className="note">プラン・配送・設備・休止・再開・解約は「変更のお申し込み」、拠点の情報は拠点詳細の「編集」から。</span>
        </div>
        {rows.length ? (
          <Tbl cols={['受付番号', '申請の種類', '対象の拠点', '申請日', '申請者', '開始ご利用月', '申請内容', '承認状態']}>
            {rows.map((x, i) => (
              <tr key={i} className={x.st === 'ESキッチンが確認中' ? 'att' : undefined}>
                <td className="es-mono"><Lnk onClick={() => setSel(x.r[0])}>{x.r[0]}</Lnk></td>
                <Td v={x.r[1]} />
                <td className="w"><b style={{ fontWeight: 400 }}>{x.site.name}</b><span className="sub es-mono">{x.site.id}</span></td>
                <Td v={x.r[2]} cls="es-num" /><Td v={x.r[3]} /><Td v={x.r[4]} /><Td v={x.r[5]} />
                <td><Badge tone={TONE_AP[x.st]}>{x.st}</Badge></td>
              </tr>
            ))}
          </Tbl>
        ) : <EmptyState title="条件に合う申請はありません" compact />}
        <Pagination total={rows.length} perPage={10} />
      </Card>
      {cur ? <ReqDialog row={cur} role={acct.role} onClose={close} /> : null}
    </>
  );
}
