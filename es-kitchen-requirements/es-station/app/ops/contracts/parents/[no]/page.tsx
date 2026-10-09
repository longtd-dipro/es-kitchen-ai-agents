'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import contracts from '@/lib/ops/areas/contracts';
import { areaApi, useQuery } from '@/lib/ops/core/client';

const api = areaApi(contracts);

/** 親契約（CP…）。親契約は拠点の「契約」タブにあるので、その拠点の詳細へ移る（元の OPS_ENTTAB 親契約 → 契約） */
export default function ParentPage() {
  const { no } = useParams<{ no: string }>();
  const router = useRouter();
  const { data, loading } = useQuery(api, 'parent', { no: decodeURIComponent(no) });
  useEffect(() => { if (data) router.replace(`/ops/branches/${data}?tab=${encodeURIComponent('契約')}`); }, [data, router]);
  return <div className="empty">{loading || data ? '読み込み中…' : `親契約（${decodeURIComponent(no)}）が見つかりません`}</div>;
}
