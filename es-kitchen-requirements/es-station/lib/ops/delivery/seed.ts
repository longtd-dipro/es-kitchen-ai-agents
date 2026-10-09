import type { ImportLog } from './types';

/*
 * 配送管理の見本のうち、共通データ（lib/domain）にないものだけ（ほかは lib/ops/delivery/fromDomain.ts で共通データから作る）。
 *   ・配送データ詳細の「実績」タブの固定の表（画面の見本）
 *   ・出荷実績・送り状番号の CSV の取込の記録
 */

/** 配送データ詳細の「実績」タブ（done の見本）の固定の表 */
export const RESULT_SAMPLE = {
  checkItems: [
    { state: 'ok', label: '荷物受取（関西倉庫）', reason: '07:40' }, { state: 'ok', label: '① 陳列前', reason: '10:58 ・ 写真 2枚' }, { state: 'ok', label: '② 在庫/廃棄', reason: '廃棄 2食を登録' },
    { state: 'warn', label: '③ 陳列（検品）', reason: '2食の差異 → トラブル報告' }, { state: 'ok', label: '④ 陳列後', reason: '11:38 ・ 写真 2枚' }, { state: 'ok', label: '⑤ 集金登録', reason: '予定 3,240円 ・ 実収 3,240円' },
  ] as { state: 'ok' | 'ng' | 'warn' | 'na'; label: string; reason: string }[],
  stockRows: [
    { n: '日替わり惣菜 A', before: '6食', disp: '2食', dCls: 'ua', why: '期限切れ（09/28）', dlv: '10食', after: '14食', sub: '—' },
    { n: '日替わり惣菜 B', before: '4食', disp: '0', dCls: '', why: '—', dlv: '8食', after: '12食', sub: '—' },
    { n: 'グリーンサラダ', before: '3食', disp: '0', dCls: '', why: '—', dlv: '5食', after: '8食', sub: 'シーザーサラダ（元の単価で請求）' },
    { n: '手作りサンド', before: '5食', disp: '0', dCls: '', why: '—', dlv: '0（今回なし）', after: '5食', sub: '—' },
  ],
  files2: [
    { name: '駐車レシート（800円）', placeholder: '写真', meta: '西村 拓也 ・ 09/29 11:45', badge: '委託業者向け' },
    { name: '陳列前写真（2枚）', placeholder: '写真', meta: '西村 拓也 ・ 09/29 10:58', badge: '顧客向け' },
    { name: 'トラブル写真（破損 2食）', placeholder: '写真', meta: '西村 拓也 ・ 09/29 11:20', badge: '委託業者向け' },
    { name: '陳列後写真（2枚）', placeholder: '写真', meta: '西村 拓也 ・ 09/29 11:38', badge: '顧客向け' },
    { name: '納品報告', placeholder: '写真', meta: '西村 拓也 ・ 09/29 11:41', badge: '委託業者向け' },
  ],
};

/** CSV の取込の記録（共通データにない） */
export const importLogs = (): ImportLog[] => [
  { id: 'IM1', at: '09/28 18:05', file: 'thomas_result_20260928.csv', kind: '出荷実績', lines: 152, ok: 152, ng: 0, st: '完了', tone: 'success', sub: '' },
  { id: 'IM2', at: '09/28 18:06', file: 'yamato_tracking_20260928.csv', kind: '送り状番号', lines: 64, ok: 62, ng: 2, st: '一部エラー', tone: 'warning', sub: '配送Noが見つからない 2行', errCsv: true },
  { id: 'IM3', at: '09/23 18:04', file: 'thomas_result_20260923.csv', kind: '出荷実績', lines: 140, ok: 140, ng: 0, st: '完了', tone: 'success', sub: '数量差 1件 → 要確認' },
];
