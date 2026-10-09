'use client';

import { Fragment, useEffect, useState, type ReactNode } from 'react';
import { setDemoToday, today } from '@/lib/supplier/dates';

/*
 * デモの「今日」（DEMO 帯の日付・共通 DB の dm.demo.settings）を画面の today() に入れる（デモのビルドのときだけ app/layout.tsx が使う）。
 * 開いたときと、データの版を見るとき（lib/ops/core/sync.ts が es-demo-today を出す）に、サーバーの「今日」と違えば入れて画面を作り直す
 */
export default function DemoToday({ children }: { children: ReactNode }) {
  const [k, setK] = useState(0);
  useEffect(() => {
    const apply = (d: unknown) => {
      if (typeof d !== 'string' || !/^\d{4}\/\d{2}\/\d{2}$/.test(d) || d === today()) return;
      setDemoToday(d);
      setK((x) => x + 1);
    };
    const base = process.env.NEXT_PUBLIC_API_BASE_URL ?? '/api';
    fetch(`${base}/sync/version`, { credentials: 'include' }).then((r) => r.json()).then((x) => apply(x?.today)).catch(() => {});
    const on = (e: Event) => apply((e as CustomEvent<string>).detail);
    window.addEventListener('es-demo-today', on);
    return () => window.removeEventListener('es-demo-today', on);
  }, []);
  return <Fragment key={k}>{children}</Fragment>;
}
