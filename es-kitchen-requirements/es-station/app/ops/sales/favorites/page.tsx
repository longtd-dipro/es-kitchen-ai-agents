'use client';

import { DEMO } from '@/lib/demo';
import { useState } from 'react';
import { useQuery } from '@/lib/ops/core/client';
import type { FavRow } from '@/lib/ops/general/types';
import { ListView, MultiCheck, useList, type ListCol, type ListFilter } from '@/app/ops/_general/list';
import { ListCsv } from '@/app/ops/_ui/csv';
import { api, demoMsg, Loading } from '@/app/ops/_general/parts';
import { Icon } from '@/app/ops/_ui/Icon';
import { useOps } from '@/app/ops/_ui/OpsProvider';
import { PageHead } from '@/app/ops/_ui/ui';

const AGES = ['10代', '20代', '30代', '40代', '50代', '60代以上'];

/* 選択肢は一覧の行の値から作る。拠点名は、お気に入りの集計が商品ごと（拠点の区別なし。dm.app.favoriteStats）なので絞れず、置かない */
const uniq = (xs: string[]) => [...new Set(xs.filter(Boolean))];
const FILTERS = (rows: FavRow[]): ListFilter[] => [
  { t: 'select', ph: 'カテゴリ', col: 'cat', opts: uniq(rows.map((r) => r.cat)).sort((a, b) => a.localeCompare(b, 'ja')) },
  { t: 'select', ph: '前回登場年月', col: 'last', opts: uniq(rows.map((r) => r.last)).filter((x) => x !== '—') },
  { t: 'search', ph: '商品名', keys: ['name'] },
];

/** 購入管理 ＞ お気に入り（元：renderFav。S7E・決定 S7-38＝A） */
export default function FavPage() {
  const { toast } = useOps();
  /* 性別・年代（複数）で絞ると、その条件の件数に数え直す（RD-AP-090） */
  const [cond, setCond] = useState<{ genders?: string[]; ageGroups?: string[] }>({});
  const [applied, setApplied] = useState<{ genders?: string[]; ageGroups?: string[] }>({});
  const { data } = useQuery(api, 'fav', applied);
  const list = useList('fav');
  if (!data) return <Loading />;
  const n = (k: string) => (r: FavRow) => <td className="num">{(+r[k]).toLocaleString()}</td>;
  const cols: ListCol<FavRow>[] = [
    { key: 'pid', label: '品番', td: (r) => <td className="mono">{r.pid}</td> },
    { key: 'name', label: '商品名', td: (r) => <td><button className="lnk u" onClick={() => toast(demoMsg('商品の詳細はメニュー管理の商品マスタで開きます（デモの対象外）', '商品の詳細はメニュー管理の商品マスタで開きます'))}>{r.name}</button></td> },
    { key: 'last', label: '前回登場年月' },
    { key: 'n', label: '登場回数', num: true, td: n('n') },
    { key: 'cat', label: 'カテゴリ' },
    ...([['tot', '合計件数'], ['m', '男性'], ['f', '女性'], ...AGES.map((g, i) => [`a${i}`, g])] as [string, string][]).map(([k, l]) => ({ key: k, label: l, num: true, td: n(k) })),
  ];
  return (
    <>
      <PageHead crumbs={['購入管理', 'お気に入り集計']} title="お気に入り集計">
        <ListCsv screen="お気に入り" list={list} filters={FILTERS(data.rows)} cols={cols} rows={data.rows} source={{ kind: 'dm.app.favoriteStats', id: (r) => r.pid }} />
      </PageHead>
      <div className="card">
        <ListView list={list} cols={cols} rows={data.rows} rowKey={(r) => r.pid} filters={FILTERS(data.rows)} onReset={() => { setCond({}); setApplied({}); }} onApply={() => setApplied(cond)} extraDirty={JSON.stringify([cond.genders ?? [], cond.ageGroups ?? []]) !== JSON.stringify([applied.genders ?? [], applied.ageGroups ?? []])}
          extra={<><MultiCheck label="性別" opts={data.genders} value={cond.genders ?? []} onChange={(v) => setCond({ ...cond, genders: v })} /><MultiCheck label="年代" opts={data.ageGroups} value={cond.ageGroups ?? []} onChange={(v) => setCond({ ...cond, ageGroups: v })} /></>} />
        <p className="muted" style={{ fontSize: '0.857143rem' }}>お気に入り件数は、アプリでその商品をお気に入りにしているユーザーの数（性別・年代はユーザーの登録情報）。{DEMO && '数はデモの値。'}</p>
      </div>
    </>
  );
}
