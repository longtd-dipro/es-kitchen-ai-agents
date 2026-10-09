'use client';

import { usePathname, useRouter } from 'next/navigation';
import DemoBar from '@/components/DemoBar';
import { DEMO } from '@/lib/demo';
import { SCREENS } from '@/lib/driver/seed';
import { useQuery } from '@/lib/ops/core/client';
import { useDriver } from './DriverProvider';
import { driverApi } from './useDay';

const PUB = ['/driver/login', '/driver/password'];
/** デモで最初にログインする配送スタッフ（高橋 誠・ES配送便（自社）。10/05 に関東倉庫で受取あり） */
const DEMO_STAFF = 'DR00002';

/**
 * デモのときだけ：配送スタッフの切替、元の idxHTML（右下の「画面一覧」）にあたる画面ジャンプ、オフライン（デモ）の切替。
 * 元の画面一覧の「データを初期化」は DEMO 帯の「データリセット」を使う。
 */
export default function DriverDemoBar() {
  const { staff, login, offline, setOffline, toast, toastError, clearDrafts } = useDriver();
  const router = useRouter();
  const path = usePathname();
  const api = driverApi();
  const { data: list } = useQuery(api, 'staffList', undefined, { skip: !DEMO });
  if (!DEMO) return null;
  const pub = PUB.some((p) => path.startsWith(p));

  /** 画面ジャンプ（元の jump()）。配送の画面は、いまの担当の配送から選ぶ */
  const jump = async (href: string) => {
    try {
      let sid = staff;
      if (!PUB.some((p) => href.startsWith(p)) && !sid) { await login(DEMO_STAFF, 'demo'); sid = DEMO_STAFF; }
      if (PUB.some((p) => href.startsWith(p)) || !sid) { router.push(href); return; }
      const [base, q] = href.split('?');
      if (base === '/driver/es' || base === '/driver/cool' || (base === '/driver/trouble' && q)) {
        const day = await api.query('day', { staff: sid });
        const today = day.dels.filter((d) => !d.later);
        const es = today.find((d) => d.type === 'es' && d.status !== '配送完了') ?? today.find((d) => d.type === 'es');
        const co = today.find((d) => d.type === 'cool' && d.status !== '配送完了') ?? today.find((d) => d.type === 'cool');
        if (base === '/driver/cool') {
          if (!co) return toast('この配送スタッフの今日の担当に COOL便はありません（スタッフを切り替えてください）');
          clearDrafts('cool.');
          return router.push(`/driver/cool/${co.no}`);
        }
        if (!es) return toast('この配送スタッフの今日の担当に ES配送便はありません（スタッフを切り替えてください）');
        if (base === '/driver/trouble') return router.push(`/driver/trouble?target=${encodeURIComponent('d:' + es.no)}`);
        clearDrafts('edit.' + es.no);
        return router.push(`/driver/es/${es.no}${q ? '?' + q : ''}`);
      }
      router.push(href);
    } catch (e) {
      toastError(e);
    }
  };

  /** 元の「オフラインにする（デモ）」。オンラインに戻すと未送信の報告を送る */
  const toggleOffline = async () => {
    if (!offline) { setOffline(true); toast('オフラインにしました（デモ）。完了報告は端末に保存されます'); return; }
    setOffline(false);
    if (!staff) { toast('オンラインに戻しました'); return; }
    try {
      const r = await api.action('flush', { staff });
      toast(r.n ? `電波が戻りました。未送信の報告 ${r.n}件を送信しました` : 'オンラインに戻しました');
    } catch (e) {
      toastError(e);
    }
  };

  return (
    <DemoBar note="ドライバー。データは架空です。">
      <label>
        配送スタッフ{' '}
        <select
          value={staff ?? ''}
          onChange={async (e) => {
            try {
              await login(e.target.value, 'demo');
              if (pub) router.push('/driver');
            } catch (err) { toastError(err); }
          }}
        >
          {!staff && <option value="">（未ログイン）</option>}
          {(list ?? []).map((s) => <option key={s.id} value={s.id}>{s.name}（{s.id}・{s.org}）</option>)}
        </select>
      </label>
      <label>
        画面一覧{' '}
        <select value="" onChange={(e) => { if (e.target.value) jump(e.target.value); }}>
          <option value="">（画面を選ぶ）</option>
          {SCREENS.map((s, i) => <option key={i} value={s.href}>【{s.group}】{s.label}（{s.code}）</option>)}
        </select>
      </label>
      <button type="button" onClick={toggleOffline}>{offline ? 'オンラインに戻す' : 'オフラインにする（デモ）'}</button>
    </DemoBar>
  );
}
