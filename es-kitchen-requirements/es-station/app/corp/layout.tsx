import type { Metadata } from 'next';
import { CorpProvider } from './_ui/CorpProvider';
import CorpShell from './_ui/CorpShell';
import './corp.css';

export const metadata: Metadata = { title: '法人Web｜ES STATION' };

export default function CorpLayout({ children }: { children: React.ReactNode }) {
  return (
    <div data-theme="company-admin">
      <CorpProvider>
        <CorpShell>{children}</CorpShell>
      </CorpProvider>
    </div>
  );
}
