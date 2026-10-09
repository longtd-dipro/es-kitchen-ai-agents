/*
 * 状態の名前の表示（台帳 I・2026-10-08）：運営Web の画面の表示だけ仕様 §3 の名前にする。
 * 保存する値（仕入先サイト・共通データ・CSV）は変えない。
 */
const LABEL: Record<string, string> = {
  取消済: 'キャンセル',
  入荷済: '入荷済',
  納期回答済: '納期回答済',
  出荷済: '出荷済',
  本発注承認済: '本発注承認済',
};
export const disp = (v: string): string => LABEL[v] ?? v;
