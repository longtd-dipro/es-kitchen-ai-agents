'use client';

import { usePathname, useRouter } from 'next/navigation';
import DemoBar from '@/components/DemoBar';
import { DEMO } from '@/lib/demo';
import { R } from '@/lib/supplier/routes';
import { useSupplier } from '@/lib/supplier/store';
import { mockSuppliers } from '@/mocks/supplier/suppliers';

/* デモのときだけ：画面ジャンプと仕入先の切替（見本の仕入先にログインし直す） */
const JUMPS: [string, string][] = [
  [R.login, 'S01 ログイン'], [R.forgot, 'S02 パスワード再設定'], [R.apply, 'S03 申込フォーム'], [R.home, 'S04 ホーム（お知らせ）'],
  [R.orders, 'S06 受注一覧'], [R.profile, 'S08 プロフィール'], [R.manual, 'S09 操作マニュアル'],
];
const SUPPLIERS = Object.values(mockSuppliers());

export default function SupplierDemoBar() {
  const { supplierId, login, orders } = useSupplier();
  const router = useRouter();
  const path = usePathname();
  if (!DEMO) return null;
  const cur = JUMPS.find(([p]) => path === p)?.[0] ?? '';
  const auth = [R.login, R.forgot, R.apply].includes(path);
  return (
    <DemoBar note="仕入先サイト（運営Web「発注・入荷」の仕入先回答に対応）。データは架空です。">
      <label>
        画面{' '}
        <select value={cur} onChange={(e) => router.push(e.target.value)}>
          <option value="" disabled>（詳細など）</option>
          {JUMPS.map(([p, l]) => <option key={p} value={p}>{l}</option>)}
        </select>
      </label>
      {orders[0] && (
        <button onClick={() => router.push(R.order(orders.find((o) => o.ans === '納期回答待ち')?.no ?? orders[0].no))}>S07 発注詳細</button>
      )}
      <label>
        仕入先{' '}
        <select
          value={supplierId ?? ''}
          onChange={async (e) => {
            await login(e.target.value, 'demo');
            if (auth) router.push(R.home);
          }}
        >
          {!supplierId && <option value="">（未ログイン）</option>}
          {SUPPLIERS.map((s) => <option key={s.id} value={s.id}>{s.name}（{s.kind}）</option>)}
        </select>
      </label>
    </DemoBar>
  );
}
