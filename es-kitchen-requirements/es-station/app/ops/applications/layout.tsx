import './applications.css';

/* 契約申請管理（一覧・申請詳細・受付・代理入力）。見た目は applications.css（.ops-applications の中だけ） */
export default function ApplicationsLayout({ children }: { children: React.ReactNode }) {
  return <div className="ops-applications">{children}</div>;
}
