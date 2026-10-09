'use client';

import { usePathname } from 'next/navigation';
import { activeOf } from '@/lib/ops/menu';
import { PageHead } from '../_ui/ui';

/** まだ作っていない画面（メニューにはあるが、app/ops の下に画面がない） */
export default function NotYet() {
  const { leaf } = activeOf(usePathname());
  return (
    <>
      <PageHead crumbs={[leaf?.label ?? '運営Web']} title={leaf?.label ?? 'ページが見つかりません'} />
      <div className="card">
        <div className="ph-empty">
          <b>{leaf ? 'この画面は準備中です' : 'ページが見つかりません'}</b>
          <span>仕様は 02_デモ/10_運営_まとめ.html を参照してください。</span>
        </div>
      </div>
    </>
  );
}
