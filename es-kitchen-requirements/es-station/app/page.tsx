import Link from 'next/link';
import { SITES } from '@/lib/sites';
import ReviewSummary from '@/components/ReviewSummary';

/** 開発用の入口（本番では各サイトを別のドメイン・パスで出す想定） */
export default function Home() {
  return (
    <main style={{ maxWidth: '45.714286rem', margin: '0 auto', padding: '2.857143rem 1.142857rem' }}>
      <h1 style={{ fontSize: '1.571429rem', margin: '0 0 1.142857rem' }}>ESSTATION</h1>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '0.571429rem' }}>
        {SITES.map((s) => (
          <li key={s.key} style={{ background: '#fff', borderRadius: 8, padding: '0.857143rem 1.142857rem', display: 'flex', gap: '0.857143rem', alignItems: 'center' }}>
            <span style={{ color: '#6E7781', fontWeight: 700 }}>{s.no}</span>
            <Link href={s.href} style={{ flex: 1, fontWeight: 700 }}>{s.name}</Link>
            <span style={{ fontSize: '0.857143rem', color: s.status === 'done' ? '#044F1E' : '#6E7781' }}>{s.status === 'done' ? '実装済' : '未実装'}</span>
          </li>
        ))}
      </ul>
      <h2 style={{ fontSize: '1.142857rem', margin: '1.714286rem 0 0.571429rem' }}>開発用</h2>
      <ul style={{ margin: 0, paddingLeft: '1.428571rem' }}>
        <li>
          <Link href="/ops/orders">運営Web 発注管理（仮置き）</Link>：仕入先サイトと同じ共通 DB を読み書きする。別タブで仕入先サイトを開くと、変更が数秒で両方に出る
        </li>
      </ul>
      <ReviewSummary />
    </main>
  );
}
