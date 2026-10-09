'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import DemoBar from '@/components/DemoBar';
import { areaApi, useQuery } from '@/lib/ops/core/client';
import { activeOf, isCaption, isGroup, MENU, visibleMenu, type MenuItem } from '@/lib/ops/menu';
import { AREAS } from '@/lib/ops/registry';
import { Icon } from './Icon';
import { hasUnsavedChanges, LEAVE_MSG } from './leaveGuard';
import { useOps } from './OpsProvider';
import { ConfirmModal } from './ui';
import { canOpenPath, canSee, featuresOfLeaf } from './perm';
import { OpsLogin } from './OpsLogin';
import { DEMO } from '@/lib/demo';
import accountArea from '@/lib/domain/areas/account';
import { domainApi, useDomainQuery } from '@/lib/domain/client';

const accountApi = domainApi(accountArea);
/** DEMO 帯に出す役割の名前（lib/domain/seed/account.ts の ROLES） */
const ROLE_NAME: Record<string, string> = {
  'ops.full': 'フル権限', 'ops.accounting': '経理', 'ops.sales': '営業', 'ops.cs': 'CS', 'ops.master': '商品管理',
  'ops.dev': '商品開発', 'ops.delivery': '物流', 'ops.viewer': '閲覧のみ', 'ops.warehouse': '倉庫スタッフ',
};

/** メニューのバッジ。領域に navBadge（{ count, tip }）があれば出す */
function NavBadge({ area }: { area: string }) {
  const a = AREAS[area];
  const has = !!a && Object.hasOwn(a.queries, 'navBadge');
  if (!has) return null;
  return <NavBadgeInner area={area} />;
}
function NavBadgeInner({ area }: { area: string }) {
  const { data } = useQuery(areaApi(AREAS[area]), 'navBadge');
  const d = data as { count: number; tip?: string } | undefined;
  return d?.count ? <span className="nbadge" title={d.tip}>{d.count}</span> : null;
}

/** DEMO 帯：運営のアカウントの切替（役割ごとの権限を見る） */
function DemoAccounts() {
  const { account, login, logout, toast, toastError } = useOps();
  const { data } = useDomainQuery(accountApi, 'list', { site: 'ops' });
  /* IP ホワイトリスト外なら認証コード待ち（受付簿 #61）：切替はログイン画面から（DEMO はコードをトーストで見せる） */
  const sw = async (id: string) => { const w = await login(id, 'demo'); if (w) { logout(); toast(`${w.message}${w.devCode ? `（DEMO コード ${w.devCode}）` : ''}`); } };
  return (
    <label>アカウント
      <select value={account?.id ?? ''} onChange={async (e) => { try { if (e.target.value) await sw(e.target.value); else logout(); } catch (x) { toastError(x); } }}>
        <option value="">（ログアウト）</option>
        {(data ?? []).filter((a) => a.status === '有効' || a.id === account?.id).map((a) => <option key={a.id} value={a.id}>{a.id} {a.name}（{a.roleIds.map((r) => ROLE_NAME[r] ?? r).join('・')}）</option>)}
      </select>
    </label>
  );
}

/** 運営Web の枠（サイドメニュー・ヘッダー）。10_運営_まとめ.html の renderNav と同じ見た目 */
export default function OpsShell({ children }: { children: ReactNode }) {
  const path = usePathname();
  const { leaf, chain } = activeOf(path);
  const [open, setOpen] = useState<Set<string>>(() => new Set(chain));
  const [nav, setNav] = useState(false);
  const router = useRouter();
  const { openModal, ready, account, logout, grants } = useOps();
  const menu = useMemo(() => visibleMenu(MENU, grants), [grants]);
  /* 見られない画面（URL で開いたとき）は中身を出さない */
  const blocked = !!leaf && !!featuresOfLeaf(leaf.key) && (!canSee(grants, leaf.key) || !canOpenPath(grants, path, featuresOfLeaf(leaf.key)));

  /* 編集中の変更があれば、破棄の確認を出してから移る（leaveGuard.ts） */
  const leave = (href: string) => (e: React.MouseEvent) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || !hasUnsavedChanges()) return;
    e.preventDefault();
    openModal(
      <ConfirmModal kind="warn" title={LEAVE_MSG.title} text={LEAVE_MSG.text} ok={LEAVE_MSG.ok} okCls="warn-solid" cancel={LEAVE_MSG.cancel} onOk={() => router.push(href)} />,
    );
  };

  /* 画面が変わったら、その画面の親グループを開く */
  useEffect(() => {
    setOpen((s) => new Set([...s, ...chain]));
    setNav(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path]);

  const toggle = (k: string) => setOpen((s) => { const n = new Set(s); if (n.has(k)) n.delete(k); else n.add(k); return n; });

  const item = (m: MenuItem, lvl: number): ReactNode => {
    if (isCaption(m)) return <div key={m.key} className="nav-cap">{m.caption}</div>;
    if (isGroup(m)) {
      const exp = open.has(m.key);
      if (lvl === 0) {
        return (
          <div key={m.key} style={{ display: 'contents' }}>
            <button className={`nav-g${chain.includes(m.key) ? ' on' : ''}`} aria-expanded={exp} onClick={() => toggle(m.key)}>
              <Icon name={m.icon ?? 'folder'} className="ic" /><span className="lbl">{m.label}</span><Icon name="chev" className="chev" />
            </button>
            {exp && <div className="nav-sub">{m.children.map((c) => item(c, 1))}</div>}
          </div>
        );
      }
      return (
        <div key={m.key} style={{ display: 'contents' }}>
          <button className="nav-i" aria-expanded={exp} onClick={() => toggle(m.key)}>{m.label}<Icon name={exp ? 'up' : 'chev'} className="chev" /></button>
          {exp && m.children.map((c) => item(c, 2))}
        </div>
      );
    }
    const on = leaf?.key === m.key;
    const badge = m.badge ? <NavBadge area={m.area} /> : null;
    if (lvl === 0) {
      return (
        <Link key={m.key} href={m.href} className={`nav-g${on ? ' on' : ''}`} onClick={leave(m.href)}>
          <Icon name={m.icon ?? 'chart'} className="ic" /><span className="lbl">{m.label}</span>{badge}
        </Link>
      );
    }
    return <Link key={m.key} href={m.href} className={`nav-i${lvl === 2 ? ' lv2' : ''}${on ? ' on' : ''}`} onClick={leave(m.href)}>{m.label}{badge}</Link>;
  };

  const demo = <DemoBar note="運営Web。データは架空です。">{DEMO && <DemoAccounts />}</DemoBar>;
  if (!ready) return null;
  if (!account) return <>{demo}<OpsLogin /></>;

  return (
    <>
      {demo}
      <div className={`app${nav ? ' open' : ''}`}>
        <aside className="side">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <div className="brand"><img src="/ops/logo.png" alt="ESSTATION" /></div>
          <nav className="nav" aria-label="メインメニュー">{menu.map((m) => item(m, 0))}</nav>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <div className="mascot"><img src="/ops/mascot.png" alt="" /></div>
          <div className="side-foot"><Icon name="menu" size={18} /></div>
        </aside>
        <div className="scrim" onClick={() => setNav(false)} />
        <div className="main">
          <header className="top">
            <button className="icon-btn burger" aria-label="メニューを開く" onClick={() => setNav(true)}><Icon name="menu" /></button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <div className="hello"><img src="/ops/hello.png" alt="" /><span>お帰りなさい</span></div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <div className="user"><img src="/ops/avatar.png" alt="" /><span>{account.name}</span><button className="btn" onClick={logout}>ログアウト</button></div>
          </header>
          <main className="content">
            {blocked
              ? <div className="card"><div className="notice"><Icon name="warn" /><div><b>この画面を見る権限がありません</b><br />必要な場合は、システム管理（権限付与の担当）に権限の追加を依頼してください。</div></div></div>
              : children}
          </main>
        </div>
      </div>
    </>
  );
}
