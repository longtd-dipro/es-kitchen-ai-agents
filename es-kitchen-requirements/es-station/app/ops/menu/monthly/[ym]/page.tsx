'use client';

import { useParams } from 'next/navigation';
import MenuDetail from '../../_components/MenuDetail';

/** 月間メニュー詳細 */
export default function MonthlyDetailPage() {
  const { ym } = useParams<{ ym: string }>();
  return <MenuDetail key={ym} ym={ym} edit={false} />;
}
