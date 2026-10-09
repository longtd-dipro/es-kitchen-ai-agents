import type { Metadata } from 'next';
import { CarrierProvider } from './_ui/CarrierProvider';
import CarrierShell from './_ui/CarrierShell';
import './carrier.css';

export const metadata: Metadata = { title: '委託配送先Web｜ESSTATION' };

export default function CarrierLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="carrier">
      <CarrierProvider>
        <CarrierShell>{children}</CarrierShell>
      </CarrierProvider>
    </div>
  );
}
