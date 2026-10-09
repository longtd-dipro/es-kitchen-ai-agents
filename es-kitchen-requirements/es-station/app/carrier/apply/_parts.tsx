'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { Icon } from '../_ui/Icon';

/** ログイン前の枠（元の pubWrap：上のバー・下のフッター） */
export function PubWrap({ children }: { children: ReactNode }) {
  return (
    <div className="pub">
      <header className="topnav">
        <div className="l"><div className="logo" role="img" aria-label="ES STATION" /><a href="https://es-kitchen.biz/" target="_blank" rel="noopener noreferrer">ESキッチンホームページ</a></div>
        <div style={{ display: 'flex', gap: '1.142857rem', alignItems: 'center' }}><Link className="pill-btn" href="/carrier/login" style={{ textDecoration: 'none' }}>ログイン</Link><span className="avatar" /></div>
      </header>
      <main>{children}</main>
      <footer className="foot"><div className="fl" role="img" aria-label="ES KITCHEN" />© 2026 ES Kitchen. All rights reserved.</footer>
    </div>
  );
}

/** お申し込みフォームの見出しとステップ（元の regHead） */
export function RegHead({ step }: { step: 1 | 2 }) {
  return (
    <div className="stepper">
      <div className="row"><h1>お申し込みフォーム</h1><span className="chip-step">ステップ {step} / 2</span></div>
      <div className="steps">
        <div className="on"><i className="bar" /><span className="lbl"><Icon name="layers" />基本情報</span></div>
        <div className={step === 2 ? 'on' : ''}><i className="bar" /><span className="lbl"><Icon name="truck" />配送対応情報</span></div>
      </div>
    </div>
  );
}
