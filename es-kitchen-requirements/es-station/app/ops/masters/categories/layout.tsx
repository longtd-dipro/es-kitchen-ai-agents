import MenuProvider from '../../menu/_components/MenuProvider';
import '../../menu/menu.css';

/** マスタ管理 ＞ 商品カテゴリ管理（データは領域 menu）。元：部品/18_運営_メニュー注文.html */
export default function CategoriesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="ops-menu">
      <MenuProvider>{children}</MenuProvider>
    </div>
  );
}
