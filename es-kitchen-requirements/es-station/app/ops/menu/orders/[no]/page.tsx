'use client';

import { useParams } from 'next/navigation';
import OrderDetail from '../../_components/OrderDetail';

/** 商品注文詳細 */
export default function OrderDetailPage() {
  const { no } = useParams<{ no: string }>();
  return <OrderDetail key={no} no={no} edit={false} />;
}
