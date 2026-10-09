'use client';

import { useParams } from 'next/navigation';
import { prod } from '@/lib/ops/purchasing/master';
import NormalDetailPage from './NormalDetailPage';
import ShortDetailPage from './ShortDetailPage';

/** 発注詳細。商品の区分で画面が分かれる：通常商品＝NormalDetailPage（AW_PURC_003）／短消費期限商品＝ShortDetailPage（AW_PURC_004） */
export default function Page() {
  const { pid } = useParams<{ pid: string }>();
  return prod(pid)?.short ? <ShortDetailPage pid={pid} /> : <NormalDetailPage pid={pid} />;
}
