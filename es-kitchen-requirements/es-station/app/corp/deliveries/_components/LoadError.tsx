'use client';

import { Button, Card, InlineMessage } from '../../_delivery/kit';

/** 読み込めなかったとき（通信の失敗など）。「見つかりません」（I204）とは別の表示にして、再読み込みできるようにする（E346） */
export default function LoadError({ onRetry }: { onRetry: () => void }) {
  return (
    <Card>
      <InlineMessage tone="negative" title="読み込めませんでした。">
        時間をおいて再度お試しください。
        <div style={{ marginTop: '0.571429rem' }}><Button variant="outline" size="sm" onClick={onRetry}>再読み込み</Button></div>
      </InlineMessage>
    </Card>
  );
}
