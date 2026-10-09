'use client';

import { useParams } from 'next/navigation';
import { ProductScreen } from '../_parts/ProductScreen';

/** 商品マスタ詳細（Phase 1 画面 10〜12：基本情報・管理用・表示用・変更履歴）。削除・編集 */
export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  return <ProductScreen key={id} mode="detail" id={id} />;
}
