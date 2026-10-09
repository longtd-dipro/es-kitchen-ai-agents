'use client';

import { useParams } from 'next/navigation';
import RequestList from '../../../sites/_components/RequestList';
import { SitesFrame } from '../../../sites/_components/parts';

/** 申請の詳細（元は一覧の上のダイアログ。一覧を出してダイアログを開いた状態にする） */
export default function Page() {
  const { no } = useParams<{ no: string }>();
  return <SitesFrame><RequestList key={no} open={decodeURIComponent(no)} /></SitesFrame>;
}
