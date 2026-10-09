import type { DocRepo } from '@/lib/ops/core/area';
import { PRODUCT_TAG_MAX } from './areas/master';
import { listMenus, MENU_PDF_MAX } from './menu';
import { crossesFrames, JAN_MAX, JAN_RE, jansOf, perServingOf } from './product';
import type { Product, ProductTag, SampleQuota } from './types';

/*
 * check.run の続き（月間メニュー・商品マスタ：MM（議事録）の決定との突合・2026/10/03）。
 *   商品タグ：「おすすめ」は使わない（RD-MN-106）・短消費期限はタグではない（RD-MN-099）・約20個まで（RD-MN-102）
 *   商品：JAN 8〜13桁（RD-MN-069）・写真 5枚まで（RD-MN-068）・シングルとダブルをまたがない（RD-MN-129）・
 *         1食当たりの栄養成分＝100g当たり × 内容量（RD-MN-118）・仕入単価の改定は単価と適用開始日がある（RD-MN-076）
 *   メニュー：PDF は 5MB 以下（RD-MN-030）・編集中／公開中のメニューは営業サンプル件数がある（RD-MN-045）
 */

const NO_TAGS = ['おすすめ', '短消費期限'];

export function menuMasterProblems(r: DocRepo): string[] {
  const p: string[] = [];
  const need = (c: boolean, m: string) => { if (!c) p.push(m); };
  const tags = r.list<ProductTag>('dm.master.productTags');
  need(tags.length <= PRODUCT_TAG_MAX, `商品タグが ${tags.length}個ある（${PRODUCT_TAG_MAX}個まで）`);
  for (const t of NO_TAGS) need(!tags.some((x) => x.name === t), `商品タグ「${t}」がある（使わない）`);
  const janSeen = new Map<string, string>();
  for (const x of r.list<Product>('dm.master.products')) {
    /* JAN は複数（先頭が主＝jan）。1件ごとに8〜13桁・10件まで・商品をまたいで重複しない（台帳 F 2026-10-08） */
    const js = jansOf(x);
    need(js.every((j) => JAN_RE.test(j)) && js.length <= JAN_MAX && new Set(js).size === js.length, `商品 ${x.id} の JAN（${js.join(';')}）が8〜13桁の数字・10件まで・重複なし でない`);
    need((x.jan ?? '') === (js[0] ?? ''), `商品 ${x.id} の主 JAN（${x.jan}）が JAN の先頭（${js[0] ?? ''}）と違う`);
    if (x.status !== '削除済') for (const j of js) { need(!janSeen.has(j), `JAN ${j} が商品 ${janSeen.get(j)} と ${x.id} で重複している`); janSeen.set(j, x.id); }
    need(!(x.vending.subColumns ?? []).some((c) => x.vending.columns.includes(c)), `商品 ${x.id} のサブコラムがメインコラムと重なっている`);
    need(x.images.length <= 5, `商品 ${x.id} の写真が ${x.images.length}枚（5枚まで）`);
    need(!crossesFrames(x.vending.columns), `商品 ${x.id} の自販機コラムがシングルとダブルをまたいでいる（${x.vending.columns.join('・')}）`);
    need(JSON.stringify(x.nutrition.perServing) === JSON.stringify(perServingOf(x.nutrition.per100g)), `商品 ${x.id} の1食当たりの栄養成分が 100g当たり × 内容量 と合わない`);
    for (const s of x.suppliers) {
      if (s.nextCost) need(s.nextCost.unitCostYen >= 0 && /^\d{4}\/\d{2}\/\d{2}$/.test(s.nextCost.from), `商品 ${x.id} の仕入単価の改定（${s.supplierId}）の単価・適用開始日が正しくない`);
    }
  }
  const quotas = new Set(r.list<SampleQuota>('dm.sample.quotas').map((q) => q.id));
  for (const m of listMenus(r)) {
    const big = m.pdfs.filter((f) => f.size > MENU_PDF_MAX);
    need(!big.length, `メニュー ${m.id} の PDF が 5MB を超える（${big.map((f) => f.name).join('・')}）`);
    if (m.status === '編集中' || m.status === '公開中') need(quotas.has(m.id), `メニュー ${m.id} の営業サンプル件数がない（新しいメニューは月60件）`);
    const old = m.items.flatMap((x) => x.tags.filter((t) => NO_TAGS.includes(t)).map((t) => `${x.productId}:${t}`));
    need(!old.length, `メニュー ${m.id} の商品に使わないタグがある（${old.join('・')}）`);
  }
  return p;
}
