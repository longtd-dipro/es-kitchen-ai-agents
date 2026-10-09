import type { AltInfo } from '@/lib/carrier/types';
import { fmtDate } from '@/lib/format/date';

/* ALT-APPS-20261001：代替品（商品不良）のお知らせ・配送詳細の「荷物の中身の変更」で使う文 */

/** 回収・廃棄のお願い */
export const altTask = (a: AltInfo) =>
  `前回お届けした${a.bad} 2個を回収・廃棄（理論在庫から引く・管理ロスにしない）。配送スタッフはドライバーアプリの ② 在庫/廃棄 の画面で『代替品の回収（${a.id}）』として登録`;

/** 対応のしかた（差し替え・補償・除外のみ） */
export function AltPatterns({ a }: { a: AltInfo }) {
  return (
    <ul style={{ margin: '0.285714rem 0 0', paddingLeft: '1.428571rem', fontSize: '0.928571rem', lineHeight: 1.8 }}>
      <li>① 差し替え：出荷日が不良発覚日（{fmtDate(a.found)}）より後の便。{a.bad}を{a.sub}に替えて届けます（請求は元の商品の単価）</li>
      <li>② 補償：すでに届けた便の分。次の便で{a.sub}を届けます（請求なし）</li>
      <li>③ 除外のみ：{a.bad}を外すだけ（代わりの商品は届けません）</li>
    </ul>
  );
}
