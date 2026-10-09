'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { R } from '@/lib/supplier/routes';
import { useSupplier } from '@/lib/supplier/store';
import Shell from '../_components/Shell';

/** ログイン後の画面：ログインしていなければログイン画面へ。仕入先を読み込むまで中身を出さない */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { ready, supplierId, me } = useSupplier();
  const router = useRouter();
  useEffect(() => {
    if (ready && !supplierId) router.replace(R.login);
  }, [ready, supplierId, router]);
  if (!me) return <div className="empty">読み込み中…</div>;
  return <Shell>{children}</Shell>;
}
