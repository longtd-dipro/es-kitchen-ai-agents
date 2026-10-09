import TopLine from './_components/TopLine';
import './billing.css';

/** 請求（在庫管理・実績精算・請求の確定・請求書）。画面は .ops-billing の中に置く（billing.css が効く範囲） */
export default function BillingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="ops-billing">
      <TopLine />
      {children}
    </div>
  );
}
