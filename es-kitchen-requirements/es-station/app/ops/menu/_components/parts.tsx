'use client';

import { useMemo, type ReactNode } from 'react';
import { areaApi, useQuery } from '@/lib/ops/core/client';
import menuArea from '@/lib/ops/areas/menu';
import { calc, md, type Calc } from '@/lib/ops/menu/logic';
import type { Dl, Master, Order, Product } from '@/lib/ops/menu/types';
import { photo } from './photo';
import { fmtDateTime } from '@/lib/format/date';

/** 領域 menu を呼ぶ口 */
export const api = areaApi(menuArea);

/** 固定のデータと計算の道具。読み込み中は null */
export function useMaster(): { M: Master; C: Calc } | null {
  const { data } = useQuery(api, 'master');
  return useMemo(() => (data ? { M: data, C: calc(data) } : null), [data]);
}

export function Loading() {
  return <div className="mo-empty" style={{ padding: '1.714286rem' }}>読み込み中…</div>;
}
export function NotFound({ what }: { what: string }) {
  return <div className="mo-empty" style={{ padding: '1.714286rem' }}>{what}が見つかりません</div>;
}

/** 商品の写真 */
export function Thumb({ src }: { src: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img className="od-thumb" src={src} alt="" />;
}
export const prodImg = (p: Product) => photo(p.cat, p.img);

/** 便のラベル（色つき） */
export function DlLabel({ d, withDate }: { d: Dl; withDate?: boolean }) {
  return <span className={'od-dl ' + (d.t === 'frozen' ? 'fz' : 'd' + d.n)}><i />{d.l + (withDate ? ' ' + md(d.date) : '')}</span>;
}
/** 法人が入れたか・ES が直したかを日時で分けて出す（要件シート 行130） */
export function WhoAt({ o, k }: { o: Order; k: 'corp' | 'es' }): ReactNode {
  const e = (o.log || []).filter((x) => (k === 'corp' ? /法人アカウント|拠点アカウント/.test(x.who) : /運営|ESキッチン/.test(x.who)))[0];
  if (!e) return <span className="od-small">{k === 'corp' && o.status === 'お試し（自動）' ? '参照のみ' : '—'}</span>;
  return <span>{fmtDateTime(e.at)}<div className="od-small">{e.who.replace(/（.*）/, '')}</div></span>;
}
