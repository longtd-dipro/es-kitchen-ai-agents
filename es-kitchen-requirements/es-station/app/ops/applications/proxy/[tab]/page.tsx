'use client';

import { useParams } from 'next/navigation';
import ChangeProxyForm from '../../_components/ChangeProxyForm';
import NewProxyForm from '../../_components/NewProxyForm';

/*
 * 代理入力。/proxy/new＝新規登録（代理入力・新規契約タブ）／/proxy/change・/proxy/stop＝変更申請の代理入力（28-144）
 */
export default function ProxyPage() {
  const { tab } = useParams<{ tab: string }>();
  if (tab === 'change' || tab === 'stop') return <ChangeProxyForm tab={tab} />;
  return <NewProxyForm />;
}
