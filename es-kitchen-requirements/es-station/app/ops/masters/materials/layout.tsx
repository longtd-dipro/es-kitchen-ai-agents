import '../_masters/masters.css';

/* 資材マスタ（一覧・詳細・編集・新規登録・CSV取込）。見た目は masters.css（.ops-masters の中だけ） */
export default function Layout({ children }: { children: React.ReactNode }) {
  return <div className="ops-masters">{children}</div>;
}
