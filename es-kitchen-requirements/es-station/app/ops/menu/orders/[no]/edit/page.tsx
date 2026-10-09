'use client';

import { useParams } from 'next/navigation';
import OrderDetail from '../../../_components/OrderDetail';

/** 商品注文編集（ES が代わりに登録・締切後の変更） */
export default function OrderEditPage() {
  const { no } = useParams<{ no: string }>();
  return <OrderDetail key={no} no={no} edit />;
}
