'use client';

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState, type ReactNode } from 'react';
import { corpActive, CORP_MENU, PUBLIC_PATHS } from '@/lib/corp/menu';
import { hasUnsavedChanges, LEAVE_MSG } from '@/lib/ui/leaveGuard';
import CorpChatbot from './CorpChatbot';
import CorpDemoBar from './CorpDemoBar';
import { PASSWORD_HINT, PASSWORD_RULE, passwordValid } from '@/lib/auth/rules';
import { CorpIcon } from './CorpIcon';
import { CorpDialog, useCorp } from './CorpProvider';

/** ヘルプ（操作マニュアル）のリンク先（設定値。客先から届いたら .env に入れる。空なら出さない：台帳 F・受付簿 No.58） */
const HELP_URL = process.env.NEXT_PUBLIC_CORP_HELP_URL ?? '';

/** パスワードの変更（ご担当者で共有のアカウント） */
function PasswordDialog() {
  const { closeModal, toast } = useCorp();
  const [v, setV] = useState({ a: '', b: '', c: '' });
  const [err, setErr] = useState<{ k?: 'a' | 'b' | 'c'; msg: string }>({ msg: '' });
  const ok = () => {
    if (!v.a) return setErr({ k: 'a', msg: '現在のパスワードを入力してください' });
    if (!passwordValid(v.b)) return setErr({ k: 'b', msg: `新しいパスワードは${PASSWORD_RULE}` });
    if (v.b !== v.c) return setErr({ k: 'c', msg: '確認のパスワードが一致しません' });
    closeModal();
    toast('パスワードを変更しました');
  };
  const inp = (k: 'a' | 'b' | 'c', label: string, ac: string) => (
    <label>{label}<input type="password" autoComplete={ac} className={err.k === k ? 'err' : ''} value={v[k]} onChange={(e) => setV({ ...v, [k]: e.target.value })} /></label>
  );
  return (
    <CorpDialog>
      <h3>パスワードの変更</h3>
      <p>このアカウントはご担当者の皆さまで共有しています。変更したら、ほかのご担当者にも新しいパスワードをお知らせください。</p>
      {inp('a', '現在のパスワード', 'current-password')}
      {inp('b', `新しいパスワード（${PASSWORD_HINT}）`, 'new-password')}
      {inp('c', '新しいパスワード（確認）', 'new-password')}
      <div className="msg" role="alert">{err.msg}</div>
      <div className="ft">
        <button type="button" className="es-btn es-btn--outline es-btn--neutral es-btn--md" onClick={closeModal}>キャンセル</button>
        <button type="button" className="es-btn es-btn--solid es-btn--primary es-btn--md" onClick={ok}>変更する</button>
      </div>
    </CorpDialog>
  );
}

/** 編集中の内容を残したまま、サイドメニュー・ヘッダーで離れるときの確認（Q02・文言は全サイト共通 LEAVE_MSG） */
export function DiscardDialog({ onOk }: { onOk: () => void }) {
  const { closeModal } = useCorp();
  return (
    <CorpDialog>
      <h3>{LEAVE_MSG.title}</h3>
      <p>{LEAVE_MSG.text}</p>
      <div className="ft">
        <button type="button" className="es-btn es-btn--outline es-btn--neutral es-btn--md" onClick={closeModal}>{LEAVE_MSG.cancel}</button>
        <button type="button" className="es-btn es-btn--solid es-btn--negative es-btn--md" onClick={() => { closeModal(); onOk(); }}>{LEAVE_MSG.ok}</button>
      </div>
    </CorpDialog>
  );
}

function LogoutDialog() {
  const { closeModal, logout, toast } = useCorp();
  const router = useRouter();
  return (
    <CorpDialog>
      <h3>ログアウト</h3>
      <p>ログアウトしますか？ 入力中で保存していない内容は消えます。</p>
      <div className="ft">
        <button type="button" className="es-btn es-btn--outline es-btn--neutral es-btn--md" onClick={closeModal}>キャンセル</button>
        <button type="button" className="es-btn es-btn--solid es-btn--primary es-btn--md" onClick={() => { closeModal(); logout(); toast('ログアウトしました'); router.push('/corp/login'); }}>ログアウト</button>
      </div>
    </CorpDialog>
  );
}

/**
 * サイドメニューの項目。いま開いている項目を光らせる（URL で決める。お届け詳細だけは開いた元 ?from= で決める：台帳 2026-10-05・受付簿 No.157）。
 * useSearchParams を使うので、Suspense の中に置く
 */
function SideMenu({ leave }: { leave: (href: string) => (e: React.MouseEvent) => void }) {
  const path = usePathname();
  const from = useSearchParams().get('from');
  const { isBranch } = useCorp();
  const act = corpActive(path, from);
  return (
    <nav className="es-sidenav__menu">
      {CORP_MENU.filter((m) => !(m.adminOnly && isBranch)).map((m) => {
        /* グループの子も adminOnly は拠点アカウントに出さない。グループを押したら最初に見える子へ */
        const kids = m.children?.filter((c) => !(c.adminOnly && isBranch));
        const href = kids?.[0]?.href ?? m.href;
        return kids ? (
          <div key={m.key} className={`es-navgroup od-group${act.item === m.key ? ' is-open' : ''}`}>
            <Link href={href} className={`es-navitem${act.item === m.key ? ' is-active' : ''}`} onClick={leave(href)}>
              <CorpIcon name={m.icon ?? ''} /><span className="es-navitem__label">{m.label}</span><span className="od-caret"><CorpIcon name="caret" /></span>
            </Link>
            <div className="es-subnav od-sub">
              {kids.map((c) => (
                <Link key={c.key} href={c.href} className={`es-subitem${act.sub === c.key ? ' is-active' : ''}`} onClick={leave(c.href)}>{c.label}</Link>
              ))}
            </div>
          </div>
        ) : (
          <Link key={m.key} href={m.href} className={`es-navitem${act.item === m.key ? ' is-active' : ''}`} onClick={leave(m.href)}>
            <CorpIcon name={m.icon ?? ''} /><span className="es-navitem__label">{m.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

/**
 * 法人Web の枠（サイドメニュー・ヘッダー）。20_法人_まとめ.html と同じ見た目。
 * ログイン前の画面（ログイン・申込フォーム）は枠を出さない。ログインしていなければログイン画面へ。
 */
export default function CorpShell({ children }: { children: ReactNode }) {
  const path = usePathname();
  const router = useRouter();
  const { ready, account, isBranch, view, openModal } = useCorp();
  const pub = PUBLIC_PATHS.some((p) => path === p || path.startsWith(p + '/'));
  const [collapsed, setCollapsed] = useState(false);
  const [nav, setNav] = useState(false);
  const [menu, setMenu] = useState(false);

  /* 保存していない変更があれば、確認を出してから移る（lib/ui/leaveGuard） */
  const leave = (href: string) => (e: React.MouseEvent) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || !hasUnsavedChanges()) return;
    e.preventDefault();
    openModal(<DiscardDialog onOk={() => router.push(href)} />);
  };
  const goGuarded = (href: string) => (hasUnsavedChanges() ? openModal(<DiscardDialog onOk={() => router.push(href)} />) : router.push(href));

  useEffect(() => { if (ready && !account && !pub) router.replace('/corp/login'); }, [ready, account, pub, router]);
  useEffect(() => { setNav(false); setMenu(false); }, [path]);
  useEffect(() => {
    if (!menu) return;
    const close = () => setMenu(false);
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') setMenu(false); };
    document.addEventListener('click', close);
    document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('click', close); document.removeEventListener('keydown', esc); };
  }, [menu]);

  const rootCls = `corp${pub ? ' pub' : ''}${view === 'ro' ? ' ro' : ''}${view === 'stopped' ? ' stopped' : ''}${nav ? ' nav-open' : ''}`;

  if (pub) {
    return (
      <div className={rootCls}>
        <CorpDemoBar />
        <div className="corp-main">{children}</div>
      </div>
    );
  }
  if (!ready || !account) return <div className="corp"><CorpDemoBar /></div>;

  return (
    <div className={rootCls}>
      <CorpDemoBar />
      <div className="es-shell">
        <aside className={`es-sidenav${collapsed ? ' is-collapsed' : ''}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <div className="es-sidenav__logo"><img src="/corp/logo.png" alt="ES STATION" /></div>
          <Suspense fallback={<nav className="es-sidenav__menu" />}><SideMenu leave={leave} /></Suspense>
          <button type="button" className="es-navitem sn-toggle" title={collapsed ? 'メニューを開く' : 'メニューを閉じる'} onClick={() => setCollapsed(!collapsed)}>
            <CorpIcon name="toggle" /><span className="es-navitem__label">{collapsed ? 'メニューを開く' : 'メニューを閉じる'}</span>
          </button>
        </aside>
        <div className="es-shell__main">
          <header className="es-appheader">
            <div className="es-appheader__left">
              <button type="button" className="es-btn es-btn--ghost es-btn--neutral es-btn--md es-btn--icon hd-burger" aria-label={nav ? 'メニューを閉じる' : 'メニューを開く'} aria-expanded={nav} onClick={() => setNav(!nav)}>
                <CorpIcon name="burger" />
              </button>
              <div className="es-appheader__greet"><span className="es-appheader__sun" aria-hidden="true"><CorpIcon name="sun" /></span>お帰りなさい</div>
            </div>
            <div className="es-appheader__right">
              {HELP_URL && (
                <a className="es-btn es-btn--ghost es-btn--neutral es-btn--md" href={HELP_URL} target="_blank" rel="noopener noreferrer" title="操作マニュアル（別のタブで開きます）"><span>ヘルプ</span></a>
              )}
              <button type="button" className="es-btn es-btn--ghost es-btn--neutral es-btn--md es-btn--icon" aria-label="お知らせ" title="お知らせ一覧" onClick={() => goGuarded('/corp/news')}>
                <CorpIcon name="news" />
              </button>
              <button type="button" className="es-profile" aria-haspopup="menu" aria-expanded={menu} onClick={(e) => { e.stopPropagation(); setMenu(!menu); }}>
                <span className="es-avatar">{account.corpName.replace(/^株式会社/, '')[0]}</span><span id="who">{account.label}</span>
              </button>
            </div>
          </header>
          <div className="corp-main">{children}</div>
        </div>
      </div>
      <div className="nav-scrim" onClick={() => setNav(false)} />
      {/* HubSpot Phase 2：AI チャットボット（デモ。決まった質問と答えだけ） */}
      <CorpChatbot />
      {menu && (
        <div className="hd-menu" role="menu" aria-label="アカウント" onClick={(e) => e.stopPropagation()}>
          <div className="hd-menu__who">{account.label}・ご担当者で共有のアカウント</div>
          {!isBranch && <button type="button" role="menuitem" onClick={() => { setMenu(false); goGuarded('/corp/corp-info'); }}>法人情報</button>}
          <button type="button" role="menuitem" onClick={() => { setMenu(false); goGuarded('/corp/sites'); }}>拠点管理（ご担当者・アカウント）</button>
          <button type="button" role="menuitem" onClick={() => { setMenu(false); openModal(<PasswordDialog />); }}>パスワードの変更</button>
          {HELP_URL && <a role="menuitem" href={HELP_URL} target="_blank" rel="noopener noreferrer" onClick={() => setMenu(false)}>ヘルプ（操作マニュアル）</a>}
          <hr />
          <button type="button" role="menuitem" className="dan" onClick={() => { setMenu(false); openModal(<LogoutDialog />); }}>ログアウト</button>
        </div>
      )}
    </div>
  );
}
