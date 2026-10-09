'use client';

import { useParams } from 'next/navigation';
import { PoDetailPage } from '../../_components/PoModals';

/** 発注データ詳細（画面）。発注・入荷履歴の発注番号から開く（台帳 I・2026-10-08：モーダルではなく画面） */
export default function Page() {
  const { no } = useParams<{ no: string }>();
  return <PoDetailPage no={decodeURIComponent(no)} />;
}
