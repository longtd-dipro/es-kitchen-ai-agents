import type { Metadata } from 'next';
import './globals.css';
import { DEMO } from '@/lib/demo';
import DemoToday from '@/components/DemoToday';
import A11yEnhancer from '@/components/A11yEnhancer';

export const metadata: Metadata = {
  title: 'ESSTATION',
  description: 'ESSTATION の運営・法人・委託配送先・ドライバー・仕入先の Web',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700&family=BIZ+UDGothic:wght@400;700&display=swap"
        />
      </head>
      <body>
        {/* 全ダイアログの焦点・Esc・Tab と、名前のない入力欄への aria-label（UI/UX レビュー #1・#12） */}
        <A11yEnhancer />
        {/* デモの「今日」（DEMO 帯で選んだ日）を画面にも入れる（デモのときだけ） */}
        {DEMO ? <DemoToday>{children}</DemoToday> : children}
        {/* 画面ごとのコメント（デモのときだけ。public/review/comments.js） */}
        {DEMO && <script src="/review/comments.js" defer />}
      </body>
    </html>
  );
}
