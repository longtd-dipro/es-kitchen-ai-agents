'use client';

import { usePathname, useRouter } from 'next/navigation';
import DemoBar from '@/components/DemoBar';
import { DEMO } from '@/lib/demo';
import { SCREEN_LIST } from '@/lib/carrier/menu';
import { ACCOUNTS } from '@/lib/carrier/session';
import { useCarrier } from './CarrierProvider';

/** デモのときだけ：アカウントの切替と、元の proto()（右下の「画面一覧」）にあたる画面ジャンプ */
export default function CarrierDemoBar() {
  const { account, login } = useCarrier();
  const router = useRouter();
  const path = usePathname();
  if (!DEMO) return null;
  const pub = ['/carrier/login', '/carrier/password', '/carrier/apply'].some((p) => path.startsWith(p));
  return (
    <DemoBar note="委託配送先Web。データは架空です。">
      <label>
        アカウント{' '}
        <select
          value={account?.loginId ?? ''}
          onChange={async (e) => {
            await login(e.target.value, 'demo');
            if (pub) router.push('/carrier');
          }}
        >
          {!account && <option value="">（未ログイン）</option>}
          {ACCOUNTS.map((a) => <option key={a.loginId} value={a.loginId}>{a.name}（{a.loginId}）</option>)}
        </select>
      </label>
      <label>
        画面一覧{' '}
        <select
          value=""
          onChange={async (e) => {
            const href = e.target.value;
            if (!href) return;
            // ログイン後の画面へ飛ぶときは、未ログインなら見本のアカウントでログインする
            if (!account && !['/carrier/login', '/carrier/password', '/carrier/apply'].some((p) => href.startsWith(p))) await login(ACCOUNTS[0].loginId, 'demo');
            router.push(href);
          }}
        >
          <option value="">（画面を選ぶ）</option>
          {SCREEN_LIST.map((s, i) => (
            <option key={i} value={s.href}>{s.group ? `【${s.group}】` : '　'}{s.label}（{s.code}）</option>
          ))}
        </select>
      </label>
    </DemoBar>
  );
}
