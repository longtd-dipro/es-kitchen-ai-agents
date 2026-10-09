'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loading, TopBar } from '../_ui/parts';
import { useDay } from '../_ui/useDay';

/** /driver/cool：今日の COOL便の最初の配送（未完了を優先）を開く */
export default function Page() {
  const { data } = useDay();
  const router = useRouter();
  useEffect(() => {
    if (!data) return;
    const t = data.dels.filter((d) => d.type === 'cool' && !d.later);
    const d = t.find((x) => x.status !== '配送完了') ?? t[0];
    router.replace(d ? `/driver/cool/${encodeURIComponent(d.no)}` : '/driver/list');
  }, [data, router]);
  return <><TopBar title="COOL便" trouble={false} /><Loading /></>;
}
