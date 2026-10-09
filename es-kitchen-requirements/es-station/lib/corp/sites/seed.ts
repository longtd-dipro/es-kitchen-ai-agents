/*
 * 拠点管理の、共通データ（lib/domain）にまだない値だけ（部品/22_法人_拠点管理.html の SITES の値）。
 * 法人・拠点・契約・子契約・休止・貸出・申請・請求書は共通データ（dm.*）から読むので、ここには持たない（lib/corp/sites/fromDomain.ts）。
 * ここに持つのは：納品不可曜日・お届け日の振替・配送番号・申込時の設備の希望・プラン外の備考・資料（添付ファイル）・1ヶ月上限金額の初期値。
 * 共通データに項目ができたら、そちらへ移す。
 */
import type { KidInfo, SiteFile } from './types';

/** 拠点ごとの値（配送備考 memo は共通データの拠点の「設置場所・納品の条件」を使う） */
export type SiteExtra = { kid: Omit<KidInfo, 'memo'>; monthCap: string; files: SiteFile[] };

const kid = (ng: string[], shift: string, dno: string, wish: string, wishFridge: string, wishOther: string, free = '—'): SiteExtra['kid'] =>
  ({ ng, shift, dno, wish, wishFridge, wishOther, free });

export const SITE_EXTRA: Record<string, SiteExtra> = {
  CU00643: {
    kid: kid(['土', '日', '祝日'], '前の日に早める', 'DN-0643-01', '自動販売機（ESライト（自販機））', '自販機 1台・資材ボックス 2個', '電子レンジ：希望あり／冷凍庫：なし', '自販機は 8F 社員食堂の入口横に置きたい'),
    monthCap: '0',
    files: [
      { name: '搬入経路_8F社員食堂.pdf', meta: '搬入経路資料（顧客向け） ・ 2026/02/12', ph: 'PDF' },
      { name: '設置場所_正面.jpg', meta: '設置場所写真 ・ 2026/03/28', ph: '写真' },
      { name: '設置場所_配線.jpg', meta: '設置場所写真 ・ 2026/03/28', ph: '写真' },
      { name: '申込書_控え.pdf', meta: '申込時の添付資料 ・ 2026/02/10', ph: 'PDF', ro: 1 },
    ],
  },
  CU00871: {
    kid: kid(['土', '日'], '後の日に遅らせる', 'DN-0871-01', '冷蔵庫', '冷蔵庫 1台・資材ボックス 1個', '電子レンジ：希望なし／冷凍庫：なし'),
    monthCap: '10000',
    files: [
      { name: '設置場所_12F休憩室.jpg', meta: '設置場所写真 ・ 2026/05/08', ph: '写真' },
      { name: '搬入経路資料（顧客向け）', meta: 'まだありません', missing: 1 },
    ],
  },
  CU00961: {
    kid: kid(['日'], '前の日に早める', 'DN-0961-01', '冷蔵庫', '冷蔵庫 1台', '電子レンジ：希望なし／冷凍庫：なし'),
    monthCap: '0',
    files: [{ name: '設置場所_3F給湯室.jpg', meta: '設置場所写真 ・ 2026/06/01', ph: '写真' }],
  },
  CU00950: {
    kid: kid(['土', '日', '祝日'], '前の日に早める', 'DN-0950-01', '冷蔵庫・冷凍庫', '冷蔵庫 1台・冷凍庫 1台・資材ボックス 1個', '電子レンジ：希望なし／冷凍庫：あり'),
    monthCap: '0',
    files: [{ name: '設置場所_2F休憩室.jpg', meta: '設置場所写真 ・ 2026/07/01', ph: '写真' }],
  },
  CU00902: {
    kid: kid(['土', '日'], '前の日に早める', 'DN-0902-01', '冷蔵庫', '冷蔵庫 1台', '電子レンジ：希望なし／冷凍庫：なし'),
    monthCap: '0',
    files: [{ name: '設置場所_5F.jpg', meta: '設置場所写真 ・ 2026/06/01', ph: '写真' }],
  },
  CU00975: {
    kid: kid(['土', '日'], '前の日に早める', 'DN-0975-01', '冷蔵庫', '冷蔵庫 1台', '電子レンジ：希望なし／冷凍庫：なし'),
    monthCap: '0',
    files: [],
  },
};

/** 見本のない拠点 */
export const NO_EXTRA: SiteExtra = { kid: kid([], '前の日に早める', '—', '—', '—', '—'), monthCap: '0', files: [] };
