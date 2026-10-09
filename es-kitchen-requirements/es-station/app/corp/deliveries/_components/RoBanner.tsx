'use client';

import { useCorpSignedIn } from '../../_ui/CorpProvider';
import { InlineMessage } from '../../_delivery/kit';

/*
 * 解約後（参照のみ）の黄色い帯（ホーム・お届け詳細。ほかの法人Web の画面と同じ roTitle＝終了日と最後の請求の入金期限）。
 * 台帳 2026-10-05（法人Web 版 1.1 のレビュー 2回目）・受付簿 No.157。お届け日の変更の申請・ご提案へのご返事・取り下げはできない
 */
export default function RoBanner() {
  const { view, roTitle } = useCorpSignedIn();
  if (view !== 'ro') return null;
  return (
    <InlineMessage tone="warning" title={roTitle}>
      参照のみの期間は、お届け日の変更の申請・ご提案へのご返事はできません。お届けの確認はできます。
    </InlineMessage>
  );
}
