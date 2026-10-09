import { redirect } from 'next/navigation';

/* 仮置きだった運営の発注管理は、発注・入荷 ＞ 発注（/ops/purchasing/orders）に移した */
export default function OpsOrdersPage() {
  redirect('/ops/purchasing/orders');
}
