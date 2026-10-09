import type { Metadata } from 'next';
import { OpsProvider } from './_ui/OpsProvider';
import OpsShell from './_ui/OpsShell';
import './ops.css';

export const metadata: Metadata = { title: '運営Web｜ESSTATION' };

export default function OpsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="ops">
      <OpsProvider>
        <OpsShell>{children}</OpsShell>
      </OpsProvider>
    </div>
  );
}
