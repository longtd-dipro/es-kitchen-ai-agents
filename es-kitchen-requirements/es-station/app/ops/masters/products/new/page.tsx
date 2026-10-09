'use client';

import { ProductScreen } from '../_parts/ProductScreen';

/** 商品マスタ新規登録（品番は登録時に続き番号で付く） */
export default function ProductNewPage() {
  return <ProductScreen mode="new" />;
}
