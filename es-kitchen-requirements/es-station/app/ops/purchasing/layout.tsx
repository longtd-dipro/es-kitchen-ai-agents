import './purchasing.css';

/* 発注・入荷（発注・資材発注・発注・入荷履歴・営業サンプル・倉庫在庫・入荷確認） */
export default function PurchasingLayout({ children }: { children: React.ReactNode }) {
  return <div className="ops-purchasing">{children}</div>;
}
