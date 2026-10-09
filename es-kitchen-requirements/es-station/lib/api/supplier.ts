import type { Notice, Order, Supplier } from '@/lib/supplier/types';
import { httpSupplierApi } from './supplier.http';
import { mockSupplierApi } from './supplier.mock';

export { ApiError } from './errors';

/* ===== 仕入先サイトの API。画面はこのファイルの api だけを呼ぶ ===== */

export type ApplicationForm = {
  company: string; companyKana: string; rep: string; zip: string; addr: string; tel: string;
  pic: string; picKana: string; mail: string; picTel: string;
  biz: 'はい' | 'いいえ'; kind: string; goods: string[]; memo: string; cert: string;
};
export type Manual = { title: string; version: string; updatedAt: string; file: string };

/** 仮発注への回答（承認＝出荷予定日。分納なら回ごと） */
export type AnswerInput = { no: string; parts: { eta: string; qty: number }[]; comment?: string };
/** 本発注の承認（回ごとの出荷予定日・納品日・数量・入荷箱数） */
export type HonInput = { no: string; parts: { eta: string; dlv: string; qty: number; box: number; bb?: string }[] };
/** 出荷報告（分納は回ごと） */
export type ShipmentInput = { no: string; partIndex: number; method: string; ship: string; carrier: string; slip: string; bb?: string; note: string };

export interface SupplierApi {
  /* 認証 */
  login(loginId: string, password: string): Promise<{ supplierId: string }>;
  logout(): Promise<void>;
  /** パスワード再設定：認証コード（4桁・5分）をメールで送る（台帳 K・F 2026-10-07） */
  requestPasswordReset(loginId: string, mail: string): Promise<void>;
  verifyResetCode(loginId: string, code: string): Promise<{ token: string }>;
  resetPassword(token: string, password: string): Promise<void>;
  /** 取引の申込。受付番号を返す */
  submitApplication(form: ApplicationForm): Promise<{ receiptNo: string }>;

  /* 仕入先 */
  getSupplier(supplierId: string): Promise<Supplier>;
  /** プロフィールの更新（運営の仕入先マスタに反映）。更新後の値を返す */
  updateSupplier(s: Supplier): Promise<Supplier>;
  /** 登録メールアドレスに再設定メールを送る */
  sendPasswordResetMail(supplierId: string): Promise<void>;

  /* お知らせ・マニュアル */
  listNotices(supplierId: string): Promise<Notice[]>;
  listManuals(): Promise<Manual[]>;
  /** 添付・マニュアルのファイル（ダウンロード用の URL を返す） */
  getFileUrl(file: string): Promise<string>;

  /* 発注 */
  listOrders(supplierId: string): Promise<Order[]>;
  markSeen(no: string): Promise<Order>;
  answerOrders(items: AnswerInput[]): Promise<Order[]>;
  rejectOrder(no: string, reason: string, comment: string): Promise<Order>;
  approveHon(items: HonInput[]): Promise<Order[]>;
  reportShipment(input: ShipmentInput): Promise<Order>;
  /** 出荷一覧の入力（賞味期限・配送方法など）をまとめて保存する。出荷済みにはしない（REQ-PO-621） */
  saveShipDrafts(items: ShipmentInput[]): Promise<Order[]>;
  /** チェックした回をまとめて出荷済みにする（REQ-PO-621。途中で失敗したら全部取り消す） */
  reportShipments(items: ShipmentInput[]): Promise<Order[]>;

  /** データの版。書き換えのたびに増える。ほかのタブ・サイトでの変更に気づいて読み直すために使う */
  getVersion(): Promise<number>;
}

/** NEXT_PUBLIC_API_MODE=http で API（開発中は共通 DB の app/api）、それ以外はブラウザだけのモック */
export const api: SupplierApi = process.env.NEXT_PUBLIC_API_MODE === 'http' ? httpSupplierApi : mockSupplierApi;

