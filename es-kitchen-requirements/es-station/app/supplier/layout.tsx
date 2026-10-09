import type { Metadata } from 'next';
import { SupplierProvider } from '@/lib/supplier/store';
import SupplierDemoBar from './_components/SupplierDemoBar';
import './supplier.css';

export const metadata: Metadata = { title: 'ESSTATION 仕入先サイト' };

export default function SupplierLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="sup">
      <SupplierProvider>
        <SupplierDemoBar />
        {children}
      </SupplierProvider>
    </div>
  );
}
