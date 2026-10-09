'use client';

import { useCallback, useEffect, useState } from 'react';
import { DEMO } from '@/lib/demo';
import { SITES } from '@/lib/sites';

/*
 * トップページの「画面ごとのコメント」のまとめ（デモのときだけ）。
 * コメントは各画面の右下「💬 コメント」で書く（public/review/comments.js・lib/server/review.ts）。
 */
type Comment = { id: number; site: string; screen: string; url: string; target: string; body: string; author: string; status: 'open' | 'done'; createdAt: string };

const box: React.CSSProperties = { background: '#fff', borderRadius: 8, padding: '0.857143rem 1.142857rem' };
const btn: React.CSSProperties = { border: '1px solid #D0D7DE', background: '#fff', borderRadius: 6, padding: '0.285714rem 0.714286rem', fontSize: '0.857143rem', cursor: 'pointer' };

export default function ReviewSummary() {
  const [list, setList] = useState<Comment[] | null>(null);
  const [err, setErr] = useState('');
  const [msg, setMsg] = useState('');

  const load = useCallback(() => {
    fetch('/api/review/comments')
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((x: Comment[]) => { setList(x); setErr(''); }, () => setErr('コメントを読めませんでした'));
  }, []);
  useEffect(() => {
    if (!DEMO) return;
    load();
    const t = setInterval(load, 15000);
    return () => clearInterval(t);
  }, [load]);
  if (!DEMO) return null;

  const open = (list ?? []).filter((c) => c.status === 'open');
  const siteNames = [...SITES.map((s) => s.name), ...new Set(open.map((c) => c.site).filter((n) => !SITES.some((s) => s.name === n)))];
  const groups = new Map<string, Comment[]>();
  for (const c of open) groups.set(`${c.site}｜${c.screen}`, [...(groups.get(`${c.site}｜${c.screen}`) ?? []), c]);

  const done = (id: number) => fetch(`/api/review/comments/${id}`, {
    method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'done' }),
  }).then(load);
  const save = () => fetch('/api/review/export', { method: 'POST' }).then((r) => r.json()).then((r: { path?: string; message?: string }) => setMsg(r.path ? `置きました：${r.path}` : r.message ?? ''));

  return (
    <section>
      <h2 style={{ fontSize: '1.142857rem', margin: '1.714286rem 0 0.571429rem', display: 'flex', alignItems: 'center', gap: '0.571429rem' }}>
        画面ごとのコメント
        <span style={{ fontSize: '0.857143rem', fontWeight: 400, color: '#6E7781' }}>未対応 {open.length} 件／全 {list?.length ?? 0} 件</span>
        <span style={{ flex: 1 }} />
        <a href="/api/review/export?open=1" style={{ ...btn, textDecoration: 'none', color: 'inherit' }}>⬇ Markdown</a>
        <button style={btn} onClick={save}>📁 00_確認してほしい に置く</button>
      </h2>
      {msg && <p style={{ fontSize: '0.857143rem', color: '#044F1E', margin: '0 0 0.571429rem' }}>{msg}</p>}
      <p style={{ fontSize: '0.857143rem', color: '#6E7781', margin: '0 0 0.571429rem' }}>各画面の右下の「💬 コメント」から書く。02_デモ の HTML から書いたものもここに入る。</p>
      {err && <p style={{ fontSize: '0.857143rem', color: '#CF222E' }}>{err}</p>}

      <div style={{ display: 'flex', gap: '0.428571rem', flexWrap: 'wrap', marginBottom: '0.571429rem' }}>
        {siteNames.map((n) => {
          const k = open.filter((c) => c.site === n).length;
          return (
            <span key={n} style={{ ...box, padding: '0.285714rem 0.714286rem', fontSize: '0.857143rem', color: k ? '#9A6700' : '#6E7781', fontWeight: k ? 700 : 400 }}>
              {n} {k}
            </span>
          );
        })}
      </div>

      {list && !open.length && <div style={{ ...box, color: '#6E7781', fontSize: '0.928571rem' }}>未対応のコメントはありません</div>}
      <div style={{ display: 'grid', gap: '0.571429rem' }}>
        {[...groups].map(([key, cs]) => {
          const url = cs.find((c) => c.url.startsWith('/'))?.url;
          return (
            <div key={key} style={box}>
              <div style={{ display: 'flex', gap: '0.571429rem', alignItems: 'baseline', marginBottom: '0.285714rem' }}>
                <b style={{ fontSize: '0.928571rem' }}>{key}</b>
                <span style={{ flex: 1 }} />
                {url && <a href={url} style={{ fontSize: '0.857143rem' }}>この画面へ</a>}
              </div>
              <ul style={{ margin: 0, paddingLeft: '1.285714rem', fontSize: '0.928571rem' }}>
                {cs.map((c) => (
                  <li key={c.id} style={{ marginBottom: '0.285714rem' }}>
                    <span style={{ whiteSpace: 'pre-wrap' }}>{c.body}</span>
                    {c.target && <span style={{ color: '#6E7781' }}>（場所：{c.target}）</span>}
                    <span style={{ fontSize: '0.785714rem', color: '#8C959F', marginLeft: '0.428571rem' }}>#{c.id}・{c.createdAt.slice(5, 16)}{c.author && `・${c.author}`}</span>
                    <button style={{ ...btn, marginLeft: '0.428571rem', padding: '1px 0.428571rem', fontSize: '0.785714rem' }} onClick={() => done(c.id)}>対応済</button>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </section>
  );
}
