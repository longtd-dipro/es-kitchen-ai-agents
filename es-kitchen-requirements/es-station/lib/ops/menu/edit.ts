import type { DocRepo } from '@/lib/ops/core/area';
import { avgTargetOf, baseWeights, getMenu, listMenus, phaseOf, PRICE_LOCKED, prevInfoOf, recentOrderStats } from '@/lib/domain/menu';
import { costOn, selectedSupplier, shortLabel } from '@/lib/domain/product';
import type { AvgTarget, KariApproval, MonthlyMenu, Product, ProductCategory, ProductOrder, ProductTag, TaxRate, Warehouse } from '@/lib/domain/types';
import { supplierName } from '../general/fromDomain';

/*
 * 月間メニュー登録・編集の画面（Phase 1 画面 01〜09）に渡すもの。事実はすべて共通データ（dm.*）から読む：
 *   メニュー＝dm.order.menus、商品＝dm.master.products（写真・コース・ピッキング倉庫・仕入先・仕入単価・短消費期限・自販機コラム）、
 *   商品タグ＝dm.master.productTags、仮発注の承認＝dm.menu.kariApprovals、前回メニュー・前回連続＝lib/domain/menu.ts の prevInfoOf、
 *   基準注文数の自動の重み＝lib/domain/menu.ts の baseWeights（画面で suggestItems をそのまま使い、手で直した値以外を入れ直して合計 50 にし、平均仕入単価を目標の幅に調整する）
 * ここで作るのは表示の言い方（倉庫名・仕入先名）だけ。
 */

/** 画面の商品の行（共通データの商品 ＋ 表示用の名前） */
export type EditProduct = {
  p: Product;
  /** 仕入先（選択中）の名前・仕入単価（税抜） */
  supplier: string; costYen: number;
  /** ピッキング倉庫の名前 */
  whNames: string[];
  /** 短消費期限の表示（対象外は ''） */
  short: string;
  /** 税率の表示 */
  tax: string;
};

/** 月間メニュー登録・編集の画面のデータ（メニューがなければ null） */
export function menuEditView(r: DocRepo, ym: string) {
  const menu0 = getMenu(r, ym);
  if (!menu0) return null;
  /* 状態は「今日 ＞ オーダー締切日」で決める（締切済） */
  const menu = { ...menu0, status: phaseOf(menu0) };
  const all = r.list<Product>('dm.master.products').filter((p) => p.temp !== '資材');
  const byId = new Map(all.map((p) => [p.id, p]));
  const whs = r.list<Warehouse>('dm.master.warehouses');
  const whName = (id: string) => whs.find((w) => w.id === id)?.name ?? id;
  const tax = r.list<TaxRate>('dm.master.taxRates');
  const products: EditProduct[] = all.sort((a, b) => a.id.localeCompare(b.id)).map((p) => {
    const sel = selectedSupplier(p);
    return {
      p, supplier: sel ? supplierName(r, sel.supplierId) : '', costYen: costOn(sel),
      whNames: p.pickWarehouseIds.map(whName), short: shortLabel(p), tax: tax.find((t) => t.id === p.taxRateId)?.label ?? '',
    };
  });
  const menus = listMenus(r);
  const others = menus.filter((m) => m.id !== ym);
  const orders = r.list<ProductOrder>('dm.order.orders');
  /* 自動の基準注文数の重み（前の3サイクル月までの注文の割合。新しい商品は同じカテゴリの平均） */
  const weights = Object.fromEntries(baseWeights(ym, all.map((p) => p.id), (id) => byId.get(id), others, orders));
  /* 直近3ヶ月の注文数・注文の割合（商品一覧の列。提案に使っている値と同じ） */
  const recent = Object.fromEntries(recentOrderStats(ym, all.map((p) => p.id), others, orders));
  /* 商品タグ（使っている月間メニューの数。0 なら消せる。商品マスタには商品タグを持たない：台帳 F 2026-10-08） */
  const tags = r.list<ProductTag>('dm.master.productTags').map((t) => ({
    ...t,
    inMenus: menus.filter((m) => m.items.some((x) => x.tags.includes(t.name))).length,
  }));
  /* ピッキング倉庫（指標一覧のタブ）：メニューの商品か商品マスタにある倉庫 */
  const whIds = [...new Set(all.flatMap((p) => p.pickWarehouseIds))].sort();
  /* 統計の 注文合計・注文数合計（RD-MN-057）：この月の注文（登録済・ES登録済・デフォルト）の数。補償・除外の行は数えない */
  const monthOrders = orders.filter((o) => o.cycleMonth === ym && o.lines.length);
  const orderQty: Record<string, number> = {};
  for (const o of monthOrders) for (const l of o.lines) if (!l.kind || l.kind === '通常' || l.kind === '差替') orderQty[l.productId] = (orderQty[l.productId] ?? 0) + l.qty;
  const cats = r.list<ProductCategory>('dm.master.productCategories').sort((a, b) => a.order - b.order).map((c) => c.name);
  return {
    menu, products, weights, recent, tags, cats, orderQty, orderN: monthOrders.length,
    warehouses: whIds.map((id) => ({ id, name: whName(id) })),
    prev: prevInfoOf(menus, ym, all.map((p) => p.id)),
    kari: r.get<KariApproval>('dm.menu.kariApprovals', ym) ?? null,
    /** 公開・ロックされたメニュー（販売価格は公開したときの写し） */
    priceLocked: PRICE_LOCKED.includes(menu.status),
    /** 平均仕入単価の目標（このメニューの値。冷蔵庫・自販機。統計の倉庫ごとの確認・標準数の提案に使う） */
    avgTarget: avgTargetOf(menu),
  };
}
export type MenuEditView = NonNullable<ReturnType<typeof menuEditView>>;
/** 保存するときに画面から渡すもの（共通データの menu.save の引数のうち、画面で直すもの） */
export type MenuEditSave = Pick<MonthlyMenu, 'items' | 'corpPublish' | 'pdfs' | 'publishOn' | 'orderFrom' | 'orderTo'> & { avgTarget: AvgTarget; noAdjust?: boolean };
