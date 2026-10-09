import { costOn, shortLabel, supplierNameOf } from '@/lib/domain/product';
import type { Product } from '@/lib/domain/types';
import type { ProductRow } from './types';

/**
 * 仕入先の取扱商品（プロフィールの「取扱商品（商品マスタ）」）＝共通データの商品マスタ（dm.master.products）で、
 * 商品の仕入先（product.suppliers）にこの仕入先がある商品。入り数・仕入単価はその仕入先の行の値。
 * 資材（S001〜。商品マスタにない品番）は、いままでどおり仕入先のデータの行を残す。
 */
export function supplierProductRows(products: Product[], supplierId: string, stored: ProductRow[] = []): ProductRow[] {
  const ids = new Set(products.map((p) => p.id));
  const rows = products.filter((p) => p.status !== '削除済').flatMap((p): ProductRow[] => {
    const sp = p.suppliers.find((x) => x.supplierId === supplierId);
    if (!sp) return [];
    const short = shortLabel(p);
    /* 仕入先に見せる名前は「仕入先向けの名前」（2026/10/03 決定）。仕入単価は今日の単価（改定の適用開始日から新しい単価） */
    return [[p.id, supplierNameOf(p), p.storage.admin, short ? `短消費期限（${short}）` : '通常', sp.lot, costOn(sp)]];
  });
  return [...rows, ...stored.filter((r) => !ids.has(r[0]))];
}

