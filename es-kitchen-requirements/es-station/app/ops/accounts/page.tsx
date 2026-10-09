'use client';

import { useRouter } from 'next/navigation';
import { GenListPage } from '@/app/ops/_general/GenListPage';
import accountArea from '@/lib/domain/areas/account';
import { domainApi, useDomainQuery } from '@/lib/domain/client';
import type { GenRow } from '@/lib/ops/general/types';
import { useOps } from '../_ui/OpsProvider';
import { Modal } from '../_ui/ui';

const accountApi = domainApi(accountArea);
/** 運営のアカウントのタブ（0 運営。倉庫スタッフは運営のロールの1つで、運営タブに出す）。ユーザー名から アカウント管理（運営）詳細 へ */
const OPS_TABS = [0];
/** 配送スタッフのタブ（パスワード再設定の代行） */
const DRIVER_TAB = 5;

/** アカウント一覧（タブ：運営・拠点・ユーザー・委託配送・仕入先・配送スタッフ）（元：renderGen('accounts')）。新規登録はない（運営アカウントの発行は権限画面の「権限付与」から） */
export default function Page() {
  const { openModal, toast } = useOps();
  const router = useRouter();
  /* 名前を押したとき（受付簿 No.172・hong 2026-10-07）：運営＝アカウント管理（運営）詳細（/ops/accounts/[id]）／配送スタッフ＝再設定の代行／法人・拠点・委託配送・仕入先＝各マスタの詳細／ユーザー＝リンクなし */
  const onLink = (r: GenRow) => (OPS_TABS.includes(Number(r.tab)) ? router.push(`/ops/accounts/${encodeURIComponent(r._uid)}`)
    : Number(r.tab) === DRIVER_TAB ? openModal(<DriverResetModal id={r._uid} name={String(r.name)} />)
      : typeof r.href === 'string' ? router.push(r.href) : toast('詳細画面は準備中です'));
  return <GenListPage genKey="accounts" onLink={onLink} />;
}

/** 配送スタッフのパスワード再設定の代行（4桁の認証コードを登録メールへ。メールは仮：2026/10/03） */
function DriverResetModal({ id, name }: { id: string; name: string }) {
  const { closeModal, toast, toastError, can } = useOps();
  const { data: acc } = useDomainQuery(accountApi, 'get', { id });
  const driverId = acc?.account.scope.type === 'driver' ? acc.account.scope.driverId : acc?.account.loginId ?? '';
  const send = async () => {
    try {
      const r = await accountApi.action('issueDriverReset', { id: driverId, by: '' });
      toast(`パスワード再設定の認証コードを ${r.sentTo} に送りました（開発中：メールは仮。コード ${r.devCode}・${r.minutes}分有効）`);
      closeModal();
    } catch (e) { toastError(e); }
  };
  return (
    <Modal title={`${name}（${driverId || id}）`} width={480}
      footer={<><button className="btn lg" onClick={closeModal}>閉じる</button>{can('consign', 'update') && <button className="btn pri lg" disabled={!driverId} onClick={send}>パスワード再設定を代行</button>}</>}>
      <p className="hint" style={{ marginTop: 0 }}>登録メールアドレスへ4桁の認証コードを送ります。ドライバーはアプリの「パスワードリセット」でコードと新しいパスワードを入れます。</p>
    </Modal>
  );
}
