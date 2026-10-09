'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import { menuOf, R } from '@/lib/supplier/routes';
import { useSignedIn } from '@/lib/supplier/store';
import { hasUnsavedChanges } from '@/lib/ui/leaveGuard';
import { DiscardModal } from './modals';
import { Icon, type IconName } from './ui';

/** ログイン後の画面の枠（サイドメニュー・ヘッダー） */
export default function Shell({ children }: { children: ReactNode }) {
  const { me, orders, logout, openModal } = useSignedIn();
  const path = usePathname();
  const router = useRouter();
  const [nav, setNav] = useState(false);
  const [menu, setMenu] = useState(false);
  const active = menuOf(path);
  const unseen = orders.filter((o) => !o.seen).length;
  /* 入力中に画面を離れるときの確認（Q02・全サイト共通）：保存していない入力があれば、サイドメニュー・ヘッダーで離れる前に出す（lib/ui/leaveGuard） */
  const guarded = (go: () => void) => (hasUnsavedChanges() ? openModal(<DiscardModal onOk={go} />) : go());
  const leave = (href: string) => (e: React.MouseEvent) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || !hasUnsavedChanges()) return;
    e.preventDefault();
    openModal(<DiscardModal onOk={() => router.push(href)} />);
  };

  useEffect(() => setNav(false), [path]);
  useEffect(() => {
    if (!menu) return;
    const close = () => setMenu(false);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [menu]);

  const items: [keyof typeof R, string, IconName, number?][] = [
    ['home', 'ホーム', 'home'],
    ['orders', '受注一覧', 'box', unseen],
    ['profile', 'プロフィール', 'user'],
    ['manual', '操作マニュアル', 'book'],
  ];

  return (
    <div className={`app ${nav ? 'open' : ''}`}>
      <aside className="side">
        <div className="brand">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/supplier/logo.png" alt="ESSTATION" />
          <small>仕入先</small>
        </div>
        <nav className="nav">
          {items.map(([k, l, i, b]) => (
            <Link key={k} href={R[k] as string} className={`nav-g ${active === k ? 'on' : ''}`} onClick={leave(R[k] as string)}>
              <Icon name={i} />
              <span className="lbl">{l}</span>
              {b ? <span className="nbadge">{b}</span> : null}
            </Link>
          ))}
        </nav>
        <div className="side-foot">ES Kitchen 仕入先サイト</div>
      </aside>
      <div className="main">
        <header className="top">
          <button className="icon-btn burger" aria-label="メニュー" onClick={() => setNav(!nav)}><Icon name="menu" /></button>
          <div className="hello">{me.name} 様</div>
          <div className="user">
            <button onClick={(e) => { e.stopPropagation(); setMenu(!menu); }}>
              <span className="avatar">{(me.contacts[0]?.name || me.name)[0]}</span>
              <span>{me.contacts[0]?.name || me.name}</span>
              <Icon name="chev" className="chev" />
            </button>
            {menu && (
              <div className="menu">
                <button onClick={() => guarded(() => router.push(R.profile))}>プロフィール</button>
                <button onClick={() => guarded(async () => { await logout(); router.push(R.login); })}>ログアウト</button>
              </div>
            )}
          </div>
        </header>
        <div className="content">{children}</div>
      </div>
    </div>
  );
}
