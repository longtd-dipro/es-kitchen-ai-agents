import MenuProvider from '../../menu/_components/MenuProvider';
import '../../menu/menu.css';

/** マスタ管理 ＞ オプション区分マスタ（データは共通データ dm.master.optionCategories）。見た目は商品カテゴリ管理と同じ部品（es） */
export default function OptionCategoriesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="ops-menu">
      <MenuProvider>{children}</MenuProvider>
    </div>
  );
}
