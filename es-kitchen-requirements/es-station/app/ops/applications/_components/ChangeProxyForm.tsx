'use client';

import ChangeKindForm from './ChangeKindForm';

/*
 * 変更申請の代理入力（契約変更タブ・休止・解約タブ）。台帳 運営A 2026-10-07 Q17：休止・再開・解約も契約変更と同じ形
 * （複数拠点・データから選ぶ法人・開始月の選べる最早月・種類ごとの項目は法人Web の『ご希望の内容』と同じ・理由は500文字まで）。
 * 登録すると承認待ちの申請が1件以上でき、法人Webからの申請と同じ申請詳細（影響と設定 → 拠点ごとの承認）で進める。
 */
export default function ChangeProxyForm({ tab }: { tab: 'change' | 'stop' }) {
  return <ChangeKindForm tab={tab} />;
}
