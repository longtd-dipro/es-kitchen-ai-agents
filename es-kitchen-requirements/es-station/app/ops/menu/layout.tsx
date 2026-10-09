import MenuProvider from './_components/MenuProvider';
import './menu.css';

/** メニュー管理（月間メニュー・商品注文管理・代替品設定・資材注文管理）。元：部品/18_運営_メニュー注文.html */
export default function MenuLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="ops-menu">
      <MenuProvider>{children}</MenuProvider>
    </div>
  );
}
