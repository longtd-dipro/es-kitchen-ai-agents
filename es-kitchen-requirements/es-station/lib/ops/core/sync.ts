'use client';

/*
 * データの版を見て、変わったら画面に読み直させる。
 * http：/api/sync/version を数秒ごと（とタブに戻ったとき）に見る（ほかのタブ・サイトの変更も拾う）
 * mock：このタブの中の書き換えだけ
 * 書き換え（action）のあとは notify() ですぐ読み直す。
 */
const listeners = new Set<() => void>();
let last = -1;
let started = false;

export function notify() {
  listeners.forEach((f) => f());
}

export function subscribe(f: () => void) {
  listeners.add(f);
  if (!started && typeof window !== 'undefined' && process.env.NEXT_PUBLIC_API_MODE === 'http') {
    started = true;
    const base = process.env.NEXT_PUBLIC_API_BASE_URL ?? '/api';
    const check = async () => {
      if (document.visibilityState !== 'visible') return;
      try {
        const { version, today } = await (await fetch(`${base}/sync/version`, { credentials: 'include' })).json();
        /* デモの「今日」が変わった（DEMO 帯・ほかのタブ）→ components/DemoToday.tsx が画面を作り直す */
        if (typeof today === 'string') window.dispatchEvent(new CustomEvent('es-demo-today', { detail: today }));
        if (last !== -1 && version !== last) notify();
        last = version;
      } catch {
        /* つながらないときは次の回に */
      }
    };
    check();
    setInterval(check, 3000);
    document.addEventListener('visibilitychange', check);
  }
  return () => { listeners.delete(f); };
}
