'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import { useQuery } from '@/lib/ops/core/client';
import DriverDemoBar from './DriverDemoBar';
import { Icon } from './Icon';
import { useDriver } from './DriverProvider';
import { IMG, TABS, useNav } from './parts';
import { driverApi } from './useDay';

/** ログインしなくても開ける画面（枠を出さない） */
const PUBLIC_PATHS = ['/driver/login', '/driver/password'];

/** URL に合うメニュー（ホーム・お知らせはホーム、廃棄・棚卸しは廃棄・棚卸し、マニュアルはアカウント、配送の画面は配送一覧） */
export function navOn(path: string) {
  if (path === '/driver' || path.startsWith('/driver/news')) return 'home';
  if (path.startsWith('/driver/stock')) return 'stock';
  if (path.startsWith('/driver/account')) return 'account';
  if (path.startsWith('/driver/trouble')) return 'trouble';
  if (path.startsWith('/driver/manuals')) return 'account';
  return 'list';
}

/** 900px 以上の左のメニュー（元の snav） */
function Snav({ on }: { on: string }) {
  const nav = useNav();
  return (
    <nav className="snav">
      <img src={IMG('logo')} alt="ES STATION" />
      {TABS.map(([i, s, l, href]) => <button type="button" key={s} className={on === s ? 'on' : ''} onClick={() => nav.go(href)}><Icon name={i} />{l}</button>)}
    </nav>
  );
}

/** オフライン・未送信の帯（元の offbar） */
function OffBar({ staff }: { staff: string }) {
  const { offline, toast, toastError } = useDriver();
  const api = driverApi();
  const { data } = useQuery(api, 'session', { staff });
  const queue = data?.queue ?? 0;
  if (!offline && !queue) return null;
  const resend = async () => {
    if (offline) { toast('まだ通信できません。電波の良い場所で再送してください'); return; }
    try {
      const r = await api.action('flush', { staff });
      toast(`未送信の報告 ${r.n}件を送信しました`);
    } catch (e) {
      toastError(e);
    }
  };
  return (
    <div className="offbar">
      <Icon name="cloud" s /><span>{offline ? 'オフライン' : 'オンライン'}・未送信 {queue}件</span>
      {queue > 0 && <button type="button" onClick={resend}>再送する</button>}
    </div>
  );
}

/**
 * ドライバーの枠（元の render()：900px 以上の左のメニュー・オフラインの帯。下のタブは各画面が出す）。
 * ログイン前の画面（ログイン・パスワードリセット）は枠を出さない。ログインしていなければログイン画面へ。
 */
export default function DriverShell({ children }: { children: ReactNode }) {
  const path = usePathname();
  const router = useRouter();
  const { ready, staff, logout, toast } = useDriver();
  const pub = PUBLIC_PATHS.some((p) => path === p || path.startsWith(p + '/'));
  const { data: session } = useQuery(driverApi(), 'session', { staff: staff ?? '' }, { skip: !staff });

  useEffect(() => { if (ready && !staff && !pub) router.replace('/driver/login'); }, [ready, staff, pub, router]);
  /* 配送スタッフがいなくなった・使えなくなった（データリセット・無効にした）ときはログインからやり直す */
  useEffect(() => {
    if (staff && session && session.staff === staff && !session.me) { logout(); toast('ログインし直してください'); }
  }, [staff, session, logout, toast]);

  if (pub) {
    return (
      <>
        <DriverDemoBar />
        <div className="app"><div className="main">{children}</div></div>
      </>
    );
  }
  return (
    <>
      <DriverDemoBar />
      <div className="app">
        {ready && staff && (
          <>
            <Snav on={navOn(path)} />
            <div className="main"><OffBar staff={staff} />{children}</div>
          </>
        )}
      </div>
    </>
  );
}
