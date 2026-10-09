import type { MKey } from '@/lib/ops/general/masterForms';
import type { GenKey } from '@/lib/ops/general/types';

/*
 * 運営Web マスタ（仕入先・委託配送先・倉庫・配送スタッフ）の画面の URL・見出し（AW_SUPP／AW_CNSG／AW_WRHS／AW_DRVR）。
 * 一覧 …/<m>、詳細 …/<m>/[id]、登録 …/<m>/new、編集 …/<m>/[id]/edit、CSV取込 …/<m>/import
 */
export type MasterUi = { base: string; crumbs: string[]; noun: string; genKey: GenKey };

export const MASTER_UI: Record<MKey, MasterUi> = {
  supplier: { base: '/ops/masters/suppliers', crumbs: ['マスタ管理', '仕入先マスタ'], noun: '仕入先', genKey: 'supplier' },
  consign: { base: '/ops/masters/consignees', crumbs: ['マスタ管理', '配送関連', '委託配送先'], noun: '委託配送先', genKey: 'consign' },
  warehouse: { base: '/ops/masters/warehouses', crumbs: ['マスタ管理', '配送関連', '倉庫マスタ'], noun: '倉庫', genKey: 'warehouse' },
  driver: { base: '/ops/masters/drivers', crumbs: ['マスタ管理', '配送関連', '配送スタッフ'], noun: '配送スタッフ', genKey: 'driver' },
};

export const detailUrl = (k: MKey, id: string) => `${MASTER_UI[k].base}/${encodeURIComponent(id)}`;
/** 一覧の鉛筆から開いた編集は、キャンセルで一覧へ戻る（?from=list） */
export const editUrl = (k: MKey, id: string, fromList = false) => `${detailUrl(k, id)}/edit${fromList ? '?from=list' : ''}`;

/** 一覧の操作（GenListPage の onNew・onLink・onEdit）。詳細・登録・編集の画面へ */
export function listLinks(k: MKey, push: (href: string) => void) {
  return {
    onNew: () => push(`${MASTER_UI[k].base}/new`),
    onLink: (r: { _uid: string }) => push(detailUrl(k, r._uid)),
    onEdit: (r: { _uid: string }) => push(editUrl(k, r._uid, true)),
  };
}
