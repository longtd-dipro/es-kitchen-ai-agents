import { OrderProvider } from './_components/OrderProvider';
import './order.css';

/** 月次注文（商品注文・資材注文・注文履歴）。元：部品/23_法人_月次注文.html。拠点・入力中の数は OrderProvider が画面をまたいで持つ */
export default function OrderLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="corp-order">
      <OrderProvider>{children}</OrderProvider>
    </div>
  );
}
