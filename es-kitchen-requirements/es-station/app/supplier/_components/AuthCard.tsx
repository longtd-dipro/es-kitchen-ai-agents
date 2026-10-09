import Link from 'next/link';
import type { ReactNode } from 'react';
import { R } from '@/lib/supplier/routes';

/** ログイン前の画面の枠（紫のグラデーション＋中央のカード） */
export function AuthCard({ title, wide, children, back = true }: { title: string; wide?: boolean; children: ReactNode; back?: boolean }) {
  return (
    <div className="auth">
      <div className={`auth-card ${wide ? 'wide' : ''}`}>
        <div className="logo">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/supplier/logo.png" alt="ESSTATION" />
          <b>{title}</b>
        </div>
        {children}
        {back && (
          <div className="auth-links">
            <Link className="lnk" href={R.login}>ログインに戻る</Link>
          </div>
        )}
      </div>
    </div>
  );
}

export function MiniSteps({ steps, cur }: { steps: string[]; cur: number }) {
  return (
    <div className="mini-steps">
      {steps.map((t, i) => (
        <span key={t} className={i + 1 === cur ? 'on' : i + 1 < cur ? 'done' : ''}>{i + 1}. {t}</span>
      ))}
    </div>
  );
}
