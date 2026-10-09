/** 解約のときの残り在庫の扱い（2026-10-06 台帳 L・受付簿 No.167。商品ごとには分けない） */
export const CXL_STOCK_BUY = '全て買取（最終のご請求書に買取として載せます）';
export const CXL_STOCK_RETURN = '返却（全部。送料はお客様のご負担〈元払い〉）';
export const CXL_STOCK = [CXL_STOCK_BUY, CXL_STOCK_RETURN];
/** 申請の「残った商品（在庫）の扱い」の値が返却か（値がない昔の申請は買取として扱う） */
export const isStockReturn = (v?: string) => /^返却/.test(v ?? '');
