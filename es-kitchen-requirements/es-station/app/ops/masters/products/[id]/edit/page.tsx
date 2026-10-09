'use client';

import { useParams } from 'next/navigation';
import { ProductScreen } from '../../_parts/ProductScreen';

/** 商品マスタ編集（全項目。税率はドロップダウンからその場で追加・削除。商品タグは持たない：メニューの画面で付ける） */
export default function ProductEditPage() {
  const { id } = useParams<{ id: string }>();
  return <ProductScreen key={id} mode="edit" id={id} />;
}
