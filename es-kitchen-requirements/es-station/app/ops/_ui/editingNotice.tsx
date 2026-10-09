'use client';

import { useEffect, useRef, useState } from 'react';

/*
 * 「〇〇さんが編集中です」の知らせ（I02・台帳 K「同時に編集」：ロックしない・先に知らせる）。
 * 編集画面を開いている間、beat を 30秒ごとに呼ぶ（サーバーは 90秒知らせがなければ編集中でなくす）。離れるときは leave を知らせる。
 * beat(false)＝自分の編集中を知らせて、ほかの人の編集中を受け取る。beat(true)＝離れたことを知らせる。
 */
export type Editor = { name: string; since: number };
const BEAT_MS = 30_000;

export function useEditingNotice(active: boolean, beat: (leave: boolean) => Promise<Editor[]>): Editor[] {
  const [others, setOthers] = useState<Editor[]>([]);
  const fn = useRef(beat);
  useEffect(() => { fn.current = beat; });
  useEffect(() => {
    if (!active) { setOthers([]); return; }
    let on = true;
    const tick = () => { fn.current(false).then((r) => { if (on) setOthers(r); }).catch(() => { /* 知らせが届かなくても編集は止めない */ }); };
    tick();
    const t = setInterval(tick, BEAT_MS);
    return () => { on = false; clearInterval(t); fn.current(true).catch(() => {}); };
  }, [active]);
  return others;
}

const hhmm = (ms: number) => { const d = new Date(ms); return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`; };

/** I02：ページ上部の情報（人ごとに1行） */
export function EditingNotice({ others, className }: { others: Editor[]; className?: string }) {
  if (!others.length) return null;
  return (
    <div role="status" className={className}>
      {others.map((o) => <div key={o.name + o.since}>{o.name}さんが編集中です（{hhmm(o.since)}〜）。同時に保存すると、あとから保存した方がエラーになります。</div>)}
    </div>
  );
}
