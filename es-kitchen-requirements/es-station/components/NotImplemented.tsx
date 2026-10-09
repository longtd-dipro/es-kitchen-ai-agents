import Link from 'next/link';
import type { Site } from '@/lib/sites';

/** まだ作っていないサイトの入口 */
export default function NotImplemented({ site }: { site: Site }) {
  return (
    <main style={{ maxWidth: '45.714286rem', margin: '0 auto', padding: '4.571429rem 1.142857rem' }}>
      <h1 style={{ fontSize: '1.571429rem', margin: '0 0 0.571429rem' }}>{site.name}</h1>
      <p style={{ color: '#424A53' }}>この画面はまだ実装していません。仕様は <code>{site.spec}</code> を参照してください。</p>
      <Link href="/">← 一覧に戻る</Link>
    </main>
  );
}
