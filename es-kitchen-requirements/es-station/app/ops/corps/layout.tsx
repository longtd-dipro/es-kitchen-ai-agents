import './contracts.css';

/* 法人・契約管理の画面（.ops-contracts の中だけに contracts.css が効く） */
export default function Layout({ children }: { children: React.ReactNode }) {
  return <div className="ops-contracts">{children}</div>;
}
