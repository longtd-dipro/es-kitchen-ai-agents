'use client';

import { usePathname, useRouter } from 'next/navigation';
import DemoBar from '@/components/DemoBar';
import { DEMO } from '@/lib/demo';
import { ACCOUNTS, type CorpView } from '@/lib/corp/session';
import accountArea from '@/lib/domain/areas/account';
import { domainApi, useDomainQuery } from '@/lib/domain/client';
import { useCorp } from './CorpProvider';

const accountApi = domainApi(accountArea);

/**
 * デモのときだけ：元のサイドメニューの下にあった「デモの表示」「アカウント」の切替。
 * 「デモの表示」はアカウントの状態（参照のみ・利用停止）の上書き。「アカウントの状態のまま」で上書きをやめる。
 * アカウントは共通データの法人Web のアカウント（dm.account）からどれでも選べる（見本の3つを先に出す）
 */
export default function CorpDemoBar() {
  const { account, view, setView, login, toastError } = useCorp();
  const router = useRouter();
  const path = usePathname();
  const { data: accs } = useDomainQuery(accountApi, 'list', { site: 'corp' });
  if (!DEMO) return null;
  const shown = path.startsWith('/corp/apply') ? 'pub' : view;
  const top = new Set(ACCOUNTS.map((a) => a.loginId));
  const rest = (accs ?? []).filter((a) => !top.has(a.loginId) && a.status !== '削除済').sort((x, y) => x.loginId.localeCompare(y.loginId));
  return (
    <DemoBar note="法人Web。データは架空です。">
      <label>
        デモの表示{' '}
        <select
          value={shown}
          onChange={(e) => {
            const v = e.target.value;
            if (v === 'pub') return router.push('/corp/apply');
            setView(v === 'data' ? null : (v as CorpView));
            if (path.startsWith('/corp/apply') || path.startsWith('/corp/login')) router.push('/corp');
          }}
        >
          <option value="data">アカウントの状態のまま</option>
          <option value="in">ログイン中</option>
          <option value="pub">ログイン前（新規）</option>
          <option value="ro">解約後（参照のみ）</option>
          <option value="stopped">停止後（ログインできない）</option>
        </select>
      </label>
      <label>
        アカウント{' '}
        <select
          value={account?.loginId ?? ''}
          onChange={async (e) => {
            try {
              await login(e.target.value, 'demo');
              if (path.startsWith('/corp/login') || path.startsWith('/corp/apply')) router.push('/corp');
            } catch (err) { toastError(err); }
          }}
        >
          {!account && <option value="">（未ログイン）</option>}
          {account && !top.has(account.loginId) && !rest.some((a) => a.loginId === account.loginId) && <option value={account.loginId}>{account.label}</option>}
          {ACCOUNTS.map((a) => <option key={a.loginId} value={a.loginId}>{a.label}</option>)}
          {rest.map((a) => <option key={a.loginId} value={a.loginId}>{a.loginId} {a.name}（{a.scope.type === 'corp' ? '法人' : '拠点'}・{a.status}）</option>)}
        </select>
      </label>
    </DemoBar>
  );
}
