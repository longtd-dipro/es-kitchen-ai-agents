'use client';

import { DEMO } from '@/lib/demo';
import type { MasterKind } from '@/lib/ops/masters/types';
import { DEMO_INFO } from './demoInfo';

/** 画面の上の「デモの説明・凡例」（DEMO のときだけ） */
export function DemoTop({ kind }: { kind: MasterKind }) {
  if (!DEMO || kind === 'materials') return null;
  const html = DEMO_INFO[kind === 'devices' || kind === 'plans' ? 'fmd' : 'fop'];
  return (
    <details className="info">
      <summary>デモの説明・凡例</summary>
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </details>
  );
}
