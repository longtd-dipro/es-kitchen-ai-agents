'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Fragment, useEffect, useState, type ReactNode } from 'react';
import { carrierActive, CARRIER_MENU, PUBLIC_PATHS } from '@/lib/carrier/menu';
import { hasUnsavedChanges, LEAVE_MSG } from '@/lib/ui/leaveGuard';
import CarrierDemoBar from './CarrierDemoBar';
import { Icon } from './Icon';
import { useCarrier } from './CarrierProvider';
import { Modal } from './parts';

/** 編集中の内容を残したまま、サイドメニュー・ヘッダーで離れるときの確認（Q02・文言は全サイト共通 LEAVE_MSG。申し込みのキャンセルでも使う） */
export function DiscardDialog({ onOk }: { onOk: () => void }) {
  const { closeModal } = useCarrier();
  return (
    <Modal onClose={closeModal} cls="sm">
      <div className="mb" style={{ paddingTop: '1.714286rem' }}>
        <div className="big-ic" style={{ background: 'color-mix(in srgb,var(--amber) 18%,transparent)', color: 'var(--amber)' }}><Icon name="warn" /></div>
        <b>{LEAVE_MSG.title}</b>
        <p style={{ margin: 0, fontSize: '0.928571rem' }}>{LEAVE_MSG.text}</p>
      </div>
      <footer style={{ border: 0 }}>
        <button type="button" className="btn" style={{ flex: 1 }} onClick={closeModal}>{LEAVE_MSG.cancel}</button>
        <button type="button" className="btn pri" style={{ flex: 1, background: 'var(--red)', borderColor: 'var(--red)' }} onClick={() => { closeModal(); onOk(); }}>{LEAVE_MSG.ok}</button>
      </footer>
    </Modal>
  );
}

/**
 * 委託配送先Web の枠（サイドメニュー・ヘッダー）。30_委託配送先_まとめ.html の shell() と同じ見た目。
 * ログイン前の画面（ログイン・パスワード再設定・申し込み）は枠を出さない。ログインしていなければログイン画面へ。
 */
export default function CarrierShell({ children }: { children: ReactNode }) {
  const path = usePathname();
  const router = useRouter();
  const { ready, account, openModal, logout } = useCarrier();
  const pub = PUBLIC_PATHS.some((p) => path === p || path.startsWith(p + '/'));
  const [navOpen, setNavOpen] = useState(false);
  const [navMin, setNavMin] = useState(false);
  const [prof, setProf] = useState(false);
  const act = carrierActive(path);

  /* 保存していない変更があれば、確認を出してから移る（lib/ui/leaveGuard） */
  const guarded = (go: () => void) => (hasUnsavedChanges() ? openModal(<DiscardDialog onOk={go} />) : go());
  const leave = (href: string) => (e: React.MouseEvent) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || !hasUnsavedChanges()) return;
    e.preventDefault();
    openModal(<DiscardDialog onOk={() => router.push(href)} />);
  };

  useEffect(() => { if (ready && !account && !pub) router.replace('/carrier/login'); }, [ready, account, pub, router]);
  useEffect(() => { setNavOpen(false); setProf(false); }, [path]);
  useEffect(() => {
    if (!prof) return;
    const close = () => setProf(false);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [prof]);

  if (pub) {
    return (
      <>
        <CarrierDemoBar />
        {children}
      </>
    );
  }
  if (!ready || !account) return <CarrierDemoBar />;

  return (
    <>
      <CarrierDemoBar />
      <div className={`shell ${navOpen ? 'open' : ''}${navMin ? ' min' : ''}`}>
        <aside className="sider">
          <div>
            <div className="logo"><i role="img" aria-label="ES STATION" /></div>
            <nav className="menu">
              {CARRIER_MENU.map((m) => (
                <Fragment key={m.key}>
                  {m.group && <div className="mcap">{m.group}</div>}
                  <Link href={m.href} className={act === m.key ? 'on' : ''} onClick={leave(m.href)}><Icon name={m.icon} />{m.label}</Link>
                </Fragment>
              ))}
            </nav>
          </div>
          <div className="support">
            <div className="chara" aria-hidden="true" />
            <button type="button" className="fold" aria-label={navMin ? 'メニューを広げる' : 'メニューを折りたたむ'} title={navMin ? 'メニューを広げる' : 'メニューを折りたたむ'} onClick={() => setNavMin(!navMin)}><Icon name="fold" /></button>
          </div>
        </aside>
        {navOpen && <div className="scrim" onClick={() => setNavOpen(false)} />}
        <div className="main">
          <header className="hdr">
            <div className="hello">
              <button type="button" className="burger" aria-label="メニュー" onClick={() => setNavOpen(!navOpen)}><Icon name="menu" /></button>
              <i className="sun" aria-hidden="true" /><span>お帰りなさい</span>
            </div>
            <div className="r">
              <button type="button" className="x" aria-label="マニュアル"><Icon name="book" /></button>
              <button type="button" className="prof" aria-haspopup="menu" aria-expanded={prof} onClick={(e) => { e.stopPropagation(); setProf(!prof); }}>
                <span className="avatar" /><span className="nm">{account.name}</span><Icon name="down" />
              </button>
              {prof && (
                <div className="menu-pop prof-pop" role="menu" onClick={(e) => e.stopPropagation()}>
                  <button type="button" className="nm" onClick={() => { setProf(false); guarded(() => router.push('/carrier/profile')); }}><Icon name="user" />プロフィール</button>
                  <button type="button" onClick={() => { setProf(false); guarded(() => { logout(); router.push('/carrier/login'); }); }}><Icon name="fold" />ログアウト</button>
                </div>
              )}
            </div>
          </header>
          <div className="page">{children}</div>
        </div>
      </div>
    </>
  );
}
