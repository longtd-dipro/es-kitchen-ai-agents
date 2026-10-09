'use client';

import { useParams } from 'next/navigation';
import MenuDetail from '../../../_components/MenuDetail';

/** 月間メニュー編集（編集中のメニューだけ） */
export default function MonthlyEditPage() {
  const { ym } = useParams<{ ym: string }>();
  return <MenuDetail key={ym} ym={ym} edit />;
}
