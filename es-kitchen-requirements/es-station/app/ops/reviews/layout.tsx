import './reviews.css';

/* レビュー・ご意見（部品/17_運営_レビュー.html）。見た目は reviews.css（.ops-reviews の中だけ） */
export default function ReviewsLayout({ children }: { children: React.ReactNode }) {
  return <div className="ops-reviews">{children}</div>;
}
