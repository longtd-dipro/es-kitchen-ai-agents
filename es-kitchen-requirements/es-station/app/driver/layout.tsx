import type { Metadata, Viewport } from 'next';
import { DriverProvider } from './_ui/DriverProvider';
import DriverShell from './_ui/DriverShell';
import './driver.css';

export const metadata: Metadata = { title: 'ドライバー｜ESSTATION' };
/* 元の <meta name=viewport content="width=device-width,initial-scale=1,viewport-fit=cover"> */
export const viewport: Viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover' };

export default function DriverLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="driver">
      {/* 元のデモは Noto Sans JP の 900（標語の太字）も読む */}
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@900&display=swap" precedence="default" />
      <DriverProvider>
        <DriverShell>{children}</DriverShell>
      </DriverProvider>
    </div>
  );
}
