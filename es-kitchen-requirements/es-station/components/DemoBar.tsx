'use client';

import { useState, type ReactNode } from 'react';
import Link from 'next/link';
import { DEMO } from '@/lib/demo';
import { fromIso, toIso, today } from '@/lib/supplier/dates';
import { resetAllData } from '@/lib/ops/core/client';
import { fmtDate } from '@/lib/format/date';

/**
 * デモのときだけ出す帯（NEXT_PUBLIC_DEMO=1）。サイトごとの切替（仕入先・アカウントなど）は children で渡す。
 * 開発・本番では何も出さない。
 * 「今日」の日付を変えられる（共通 DB に置く＝全サイト・全タブで同じ日。先へ進めると間の日の日次バッチを1日ずつ動かす・lib/domain/batch.ts）
 */
export default function DemoBar({ note, children }: { note?: ReactNode; children?: ReactNode }) {
  if (!DEMO) return null;
  return (
    <div className="es-demo-bar">
      <span className="es-demo-tag">DEMO</span>
      <span>{note ?? 'データは架空です。'}今日：<b>{fmtDate(today())}</b></span>
      <DemoDate />
      <span style={{ flex: 1 }} />
      <Link href="/">デモ一覧</Link>
      {children}
      <button onClick={() => { if (confirm('データを見本に戻します。よろしいですか？')) resetAllData(); }}>データリセット</button>
    </div>
  );
}

/** デモの「今日」を変える（先へ：間の日の日次バッチを動かす／前へ：日付だけ・動かした処理は戻らない） */
function DemoDate() {
  const [busy, setBusy] = useState(false);
  const cur = today();
  const [v, setV] = useState(toIso(cur));
  const change = async (iso: string) => {
    const to = fromIso(iso);
    if (!/^\d{4}\/\d{2}\/\d{2}$/.test(to) || to === cur) return;
    const days = Math.round((new Date(iso).getTime() - new Date(toIso(cur)).getTime()) / 86400000);
    const msg = to > cur
      ? `今日を ${fmtDate(to)} に進めます。${fmtDate(cur)} の翌日から ${fmtDate(to)} までの ${days}日ぶんの日次バッチ（オーダー締切・自動公開・通知・休止／解約・アンケート・本発注のお知らせなど）をまとめて動かします。よろしいですか？`
      : `今日を ${fmtDate(to)} に戻します。日付だけが変わります。これまでに動かした日次バッチの処理（締切・通知など）は元に戻りません（元に戻すときはデータリセット）。よろしいですか？`;
    if (!confirm(msg)) return;
    setBusy(true);
    try {
      const base = process.env.NEXT_PUBLIC_API_BASE_URL ?? '/api';
      const r = await fetch(`${base}/demo/today`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ date: to }) });
      if (!r.ok) { alert((await r.json().catch(() => null))?.message ?? '日付を変えられませんでした'); return; }
      location.reload();
    } finally { setBusy(false); }
  };
  return (
    <label title="デモの「今日」を変えます（全サイト共通）">日付を変える
      <input type="date" value={v} disabled={busy} onChange={(e) => setV(e.target.value)} />
      <button type="button" disabled={busy || !v || fromIso(v) === cur} onClick={() => change(v)}>{busy ? '実行中…' : '変える'}</button>
    </label>
  );
}
