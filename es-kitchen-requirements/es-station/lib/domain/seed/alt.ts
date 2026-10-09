import type { DocRepo } from '@/lib/ops/core/area';
import { applyAlt, type AltArgs } from '../alt';
import { altStockIn } from '../stock';

/*
 * 代替品設定の見本（シナリオ説明書 ⑦・運営デモ v1.66。今日＝2026/10/05 に運営が保存）。
 * デミグラスハンバーグ（M002・仕入先 SP00001）の全ロットに 10/02 にソースの味の異常が見つかり、チキンのチーズソテー（M003・メニュー外）に替える。
 * 対象期間（出荷日）9/21〜10/31。
 *   ・大阪支店（ES配送便・関西倉庫→みどり便）：9/29 の便 DL-260928-0014 は既納品 → ② 補償 2食（次の便 10/13 DL-261012-0011 で届け、不良品はドライバーが回収）、
 *     10/13 の便 → ① 差し替え 2食（出荷指示は送信済みのため rev+1 で再送）
 *   ・ほかの拠点の同じ便も同じ決まり（COOL便の拠点は不良品を法人が廃棄して棚卸報告で申告）
 *   ・倉庫の在庫が足りない分は追加発注（入荷予定は保存から3日後）。入荷のあとの便へ回す
 *   ・仕入先への請求＝不良の数 × 仕入単価（不良控除（返品））
 * 倉庫在庫・入荷予定は倉庫在庫の見込み（stock.altStockIn）から渡す（運営の代替品設定の画面と同じ）
 */
export const ALT_DEMO: AltArgs = {
  productId: 'M002', altProductId: 'M003', foundOn: '2026/10/02', from: '2026/09/21', to: '2026/10/31',
  scope: '全ロット', reason: 'ソースの味の異常（全ロット・製造元の配合ミス）', mode: '差し替え', comp: '注文数量', when: '次の便',
  lotAction: '返品', createPo: true, notify: true,
  today: '2026/10/05', at: '2026/10/05 10:30', accountId: 'Ad00010',
};

export function seedAlt(r: DocRepo) {
  return applyAlt(r, { ...ALT_DEMO, stock: altStockIn(r, ALT_DEMO.altProductId, undefined, ALT_DEMO.today) });
}
