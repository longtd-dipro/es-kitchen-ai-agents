'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { DEMO } from '@/lib/demo';
import { useQuery } from '@/lib/ops/core/client';
import { REVIEW_KINDS, REVIEW_STATES } from '@/lib/ops/delivery/constants';
import { reviewLinks, type ReviewFilter } from '@/lib/ops/delivery/logic';
import { usePaging } from '@/lib/ui/paging';
import { useOpsCsvExport } from '../../_ui/csv';
import { useOps } from '../../_ui/OpsProvider';
import { api } from '../_components/api';
import { Badge, Button, Card, PageHead, Pagination, SearchPanel, Select, TextField } from '../_components/kit';

/*
 * 要確認（部品 16 の ReviewList）。
 * RV3-OPS-20261002 #3：区分・状態・キーワード・納品日で絞り込み、件数を出す。「対応する」・対象は押した行の配送データ／要確認を開く。
 */

const STATE_TONE = { '未対応': 'warning', '対応済': 'success', '対象外': 'neutral' } as const;

export default function Page() {
  return <Suspense><ReviewList /></Suspense>;
}

function ReviewList() {
  const sp = useSearchParams();
  const { toast } = useOps();
  const init = { q: '', kind: sp.get('kind') ?? '', state: '未対応', from: '', to: '' };
  const [f, setF] = useState(init);
  const [args, setArgs] = useState<ReviewFilter>(init);
  const { data } = useQuery(api, 'reviewList', args);
  const rows = data?.rows ?? [];
  const pg = usePaging(rows);
  const search = () => {
    setArgs(f);
    api.query('reviewList', f).then((r) => toast(`検索しました（${r.rows.length}件）`));
  };
  const clear = () => { const e = { q: '', kind: '', state: '未対応', from: '', to: '' }; setF(e); setArgs(e); };
  /* CSV出力：検索条件のとおりの全件（要確認は配送・トラブル・申請などから作る一覧なので、画面の列＋対象の配送の全部の項目） */
  const csvExport = useOpsCsvExport();
  const csv = () => csvExport<(typeof rows)[number]>({
    screen: '要確認', rows,
    filters: [{ label: '検索', value: args.q ?? '' }, { label: '区分', value: args.kind ?? '' }, { label: '状態', value: args.state ?? '' }, { label: '期間', value: args.from || args.to ? `${args.from ?? ''}〜${args.to ?? ''}` : '' }],
    columns: [
      { label: 'ID', get: (r) => r.id }, { label: '区分', get: (r) => r.kind }, { label: '内容', get: (r) => r.what }, { label: '対象', get: (r) => r.target }, { label: '法人・拠点', get: (r) => r.site },
      { label: '納品日', get: (r) => r.dlv }, { label: '検出', get: (r) => r.found }, { label: '最終検出', get: (r) => r.last }, { label: '状態', get: (r) => r.state },
    ],
    source: { kind: 'dm.delivery.deliveries', id: (r) => String(r.target ?? '') },
  });
  return (
    <>
      <PageHead crumbs={['配送管理', '要確認']} title="要確認" actions={<Button variant="outline" icon="ReadCvLogo" onClick={csv}>CSV出力</Button>} />
      <SearchPanel sig={JSON.stringify(f)} onSearch={search} onClear={clear}>
        {[
          <TextField key="k1" className="es-grow" icon="Search" placeholder="配送No・予定ID、法人・拠点・契約ID" value={f.q} onChange={(q) => setF({ ...f, q })} />,
          <Select key="k2" placeholder="区分" options={REVIEW_KINDS} value={f.kind} onChange={(kind) => setF({ ...f, kind })} />,
          <Select key="k3" placeholder="すべての状態" options={[...REVIEW_STATES]} value={f.state} onChange={(state) => setF({ ...f, state })} />,
          <TextField date key="k4" icon="CalendarBlank" placeholder="納品日（から）" value={f.from} onChange={(from) => setF({ ...f, from })} style={{ width: '12.571429rem' }} />,
          <TextField date key="k5" icon="CalendarBlank" placeholder="納品日（まで）" value={f.to} onChange={(to) => setF({ ...f, to })} style={{ width: '12.571429rem' }} />,
        ]}
      </SearchPanel>
      <Card>
        <div className="tools">
          <span><b style={{ color: 'var(--text-high)' }}>{(args.state || 'すべて') + ' ' + rows.length}件</b>（検出日時の新しい順）</span>
          <span className="note">要確認は解消するまで残ります。同じ問題を再検出したときは件数を増やさず、最終検出日時だけを更新します。</span>
        </div>
        <div className="es-table-wrap">
          <table className="es-table">
            <thead><tr><th>No</th><th>区分</th><th>内容</th><th>対象</th><th>法人・拠点</th><th>納品日</th><th>検出</th><th>最終検出</th><th>状態</th><th className="c">操作</th></tr></thead>
            <tbody>
              {pg.rows.map((r, i) => {
                const l = reviewLinks(r);
                return (
                  <tr key={r.id}>
                    <td>{pg.start + i + 1}</td>
                    <td><Badge tone={r.tone}>{r.kind}</Badge></td>
                    <td className="clip" style={{ maxWidth: '20rem' }} title={r.what}>{r.what}</td>
                    <td className="es-mono"><Link href={l.target}>{r.target}</Link></td>
                    <td className="clip" style={{ maxWidth: '14.285714rem' }}>{r.site}</td>
                    <td className="es-num">{r.dlv}</td>
                    <td className="es-num">{r.found}</td>
                    <td className="es-num">{r.last}</td>
                    <td><Badge tone={STATE_TONE[r.state]}>{r.state}</Badge></td>
                    <td className="c">{r.state === '未対応' ? <Link href={l.act}>対応する ›</Link> : <Link href={`/ops/delivery/review/${r.id}`}>詳細 ›</Link>}</td>
                  </tr>
                );
              })}
              {!rows.length && <tr><td colSpan={10} style={{ textAlign: 'center', color: 'var(--text-low)', padding: '1.714286rem' }}>条件に合うデータはありません</td></tr>}
            </tbody>
          </table>
        </div>
        <Pagination {...pg.props} />
      </Card>
    </>
  );
}
