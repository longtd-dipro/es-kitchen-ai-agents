'use client';

import { OpsLeaveGuard } from '@/app/ops/_ui/leaveGuard';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { checkStockBulk } from '@/lib/ops/billing/logic';
import { PROD } from '@/lib/ops/billing/masters';
import { useOps } from '../../../_ui/OpsProvider';
import { Btn, Card, Field, Inline, Inp, Meta, PageHead, Table, Tag, useAsk } from '../../_components/ds';
import { R, pLabel, useBilling } from '../../_components/useBilling';

/** 在庫調整（まとめて）。在庫一覧で選んだ拠点 × 商品に数量を入れ、同じ理由で登録する。元の vAdjBulk */
export default function StockBulkPage() {
  return <Suspense><StockBulk /></Suspense>;
}

function StockBulk() {
  const sp = useSearchParams();
  const router = useRouter();
  const ask = useAsk();
  const { toast } = useOps();
  const { L, run, can } = useBilling();
  const [q, setQ] = useState<Record<string, string>>({});
  const [reason, setReason] = useState('');
  const [rErr, setRErr] = useState(false);
  if (!L) return null;
  const ids = (sp.get('ids') || '').split(',').filter(Boolean);
  const bs = ids.map((x) => L.br(x)).filter((b): b is NonNullable<typeof b> => !!b);
  if (!bs.length) return <Inline tone="warning">拠点が選ばれていません。在庫一覧で拠点を選んでください。</Inline>;
  const cells = () => bs.flatMap((b) => PROD.map((p) => ({ br: b.id, prod: p.id, q: Number(q[b.id + '-' + p.id] || 0) })));
  const dirty = !!reason.trim() || Object.values(q).some((v) => String(v).trim());
  const save = async () => {
    const err = checkStockBulk(cells(), reason);
    if (err) { if (!reason.trim() && cells().some((c) => c.q)) setRErr(true); toast(err); return; }
    if (await run('addStockAdjBulk', { ids, reason, cells: cells().filter((c) => c.q) })) router.push(R.stock);
  };
  const cancel = () => (dirty ? ask({ tone: 'negative', title: '編集内容を破棄しますか？', body: '編集中の内容は保存されません。編集内容を破棄してもよろしいですか？', ok: '破棄', onOk: () => router.push(R.stock) }) : router.push(R.stock));
  return (
    <>
      <OpsLeaveGuard dirty={dirty} />
      <PageHead crumbs={[{ t: '請求' }, { t: '在庫管理', href: R.stock }, { t: '在庫調整（まとめて）' }]} title="在庫調整（まとめて）"
        actions={<><Btn onClick={cancel}>キャンセル</Btn>{can('addStockAdjBulk') && <Btn kind="pri" onClick={save}>保存</Btn>}</>} />
      <Meta><Tag>{pLabel(L.month, L.month)}</Tag><Tag>{bs.length}拠点</Tag><span className="small">{[...new Set(bs.map((b) => L.co(b.co).name || '法人なし'))].join('・')}</span></Meta>
      <Inline>調整したい拠点×商品のマスに数量（＋増やす／−減らす）を入れ、理由を書いて「保存」してください。<b>保存するとすぐ計算在庫に反映</b>されます。理由は入れたマスすべてに同じものが入り、監査ログに残ります。</Inline>
      <Card title="拠点 × 商品">
        <div className="es-formgrid">
          <Field label="理由" req className="es-span-3" ><Inp value={reason} err={rErr} ph="例）拠点間移動・カウント訂正・誤納品" onChange={(v) => { setReason(v); setRErr(false); }} /></Field>
        </div>
        <Table minWidth={240 + bs.length * 230}>
          <thead><tr><th>商品</th>{bs.map((b) => <th key={b.id} className="c">{b.name}<div className="small">{b.code}・{b.filed ? '棚卸後' : '棚卸前'}</div></th>)}</tr></thead>
          <tbody>
            {PROD.map((p) => (
              <tr key={p.id}><td>{p.n}</td>
                {bs.map((b) => {
                  const r = b.rows.find((x) => x.id === p.id)!, k = b.id + '-' + p.id;
                  return (
                    <td key={b.id}><div style={{ display: 'flex', gap: '0.571429rem', alignItems: 'center', justifyContent: 'center' }}>
                      <span className="small">計算在庫 {L.theo(r)}</span>
                      <Inp sm type="number" width={96} ph="±点" value={q[k] ?? ''} onChange={(v) => setQ((x) => ({ ...x, [k]: v }))} />
                    </div></td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>
    </>
  );
}
