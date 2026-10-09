import './delivery.css';

/* 配送管理（スケジュール・出荷・配送管理・要確認・配送問い合わせ・資材の集計）。見た目は .ops-delivery の中だけ */
export default function DeliveryLayout({ children }: { children: React.ReactNode }) {
  return <div className="ops-delivery">{children}</div>;
}
