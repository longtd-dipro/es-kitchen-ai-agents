import type { DocRepo } from '../core/area';
import app, { APP_AGES, APP_GENDERS, APP_PAY_METHODS } from '@/lib/domain/areas/app';
import { costOn, selectedSupplier } from '@/lib/domain/product';
import type { AppPurchase, Branch, Corp, FavoriteStat, MonthlySales, Product, ProductOrder } from '@/lib/domain/types';
import type { Order as POrder } from '@/lib/supplier/types';
import { ORDER_KIND } from '../purchasing/docRepo';
import type { DashData, DashFav, DashFavArgs, DashLine, DashLineArgs, FavRow, RankRow, SalesItem, SalesSite, SalesUser } from './types';

/*
 * 売上管理・お気に入り・ダッシュボードの画面の形を共通データから作る（もとは general.sales*・general.fav・general.dash）。
 *   拠点別・商品別・ユーザー別＝アプリの購入（dm.app.purchases。法人Web の売上・ユーザー管理と同じ購入）、
 *   お気に入り件数＝dm.app.favoriteStats、登場回数・前回登場年月＝月間メニュー（dm.order.menus）、
 *   メニューの注文数ランキング＝商品注文（dm.order.orders）、発注数・発注金額＝運営の発注（purchasing.orders。共通データにまだない）、
 *   ダッシュボードの月次売上・決済方法別＝月ごとの売上の集計（dm.app.monthlySales）
 */

const nameOf = (r: DocRepo, id: string) => r.get<Branch>('dm.org.branches', id)?.name ?? id;
const product = (r: DocRepo, id: string) => r.get<Product>('dm.master.products', id);
const ymJa = (ym: string) => (ym ? `${ym.slice(0, 4)}年${Number(ym.slice(5))}月` : '—');
const favTotal = (r: DocRepo) => new Map(app.queries.favoriteStats(r).map((f) => [f.id, f.total]));

/** メニューの注文数（法人の注文の数）・発注数（本発注・なければ仮発注）・発注金額（税抜）のランキング。キー＝メニュー年月 */
function rankOf(r: DocRepo): Record<string, RankRow[]> {
  const orders = r.list<ProductOrder>('dm.order.orders');
  const pos = r.list<POrder>(ORDER_KIND).filter((o) => !['キャンセル', '受注不可'].includes(o.ans));
  const yms = [...new Set(orders.map((o) => o.cycleMonth))].sort().reverse();
  return Object.fromEntries(yms.map((ym) => {
    const q = new Map<string, number>();
    for (const o of orders.filter((x) => x.cycleMonth === ym)) for (const l of o.lines) {
      if (l.kind && l.kind !== '通常') continue;
      q.set(l.productId, (q.get(l.productId) ?? 0) + l.qty);
    }
    const rows = [...q.entries()].filter(([, n]) => n > 0).map(([pid, order]) => {
      const p = product(r, pid);
      const mine = pos.filter((o) => o.ym === ym && o.pid === pid);
      const qty = mine.reduce((s, o) => s + (o.hon || o.kari), 0);
      const amt = mine.reduce((s, o) => s + (o.hon || o.kari) * (o.unitCostYen ?? (p ? costOn(selectedSupplier(p)) : 0)), 0);
      return { pid, name: p?.name ?? pid, cat: p?.category ?? '', order, q: qty, amt };
    }).sort((a, b) => b.order - a.order || a.pid.localeCompare(b.pid));
    return [ym, rows];
  }));
}

export type SalesArgs = {
  /** 期間（yyyy-mm-dd。購入日） */
  from?: string; to?: string;
  /** 法人・拠点（拠点が優先） */
  corpId?: string; branchId?: string;
  /** カテゴリー（複数。商品マスタのカテゴリ） */
  cats?: string[];
  /** 性別・年代（複数。利用者の登録情報。RD-CM-028） */
  genders?: string[]; ageGroups?: string[];
};
/** 売上管理（拠点別・商品別・ユーザー別・ランキング・決済方法）。条件（期間・法人・拠点・カテゴリー）で購入を絞ってから集計する */
export function salesOf(r: DocRepo, a: SalesArgs = {}) {
  const allBranches = r.list<Branch>('dm.org.branches');
  const branchIds = a.branchId ? [a.branchId] : a.corpId ? allBranches.filter((b) => b.corpId === a.corpId).map((b) => b.id) : undefined;
  const productIds = a.cats?.length ? r.list<Product>('dm.master.products').filter((p) => a.cats!.includes(p.category)).map((p) => p.id) : undefined;
  const q = { branchIds, productIds, genders: a.genders, ageGroups: a.ageGroups, from: a.from?.replaceAll('-', '/'), to: a.to?.replaceAll('-', '/') };
  const { byBranch, byProduct } = app.queries.sales(r, q);
  const ps = app.queries.purchases(r, q);
  /* 条件の選択肢（購入のある拠点の法人・拠点、商品マスタのカテゴリ） */
  const used = new Set(app.queries.purchases(r).map((p) => p.branchId));
  const brs = allBranches.filter((b) => used.has(b.id)).sort((x, y) => x.id.localeCompare(y.id)).map((b) => ({ id: b.id, name: b.name, corpId: b.corpId ?? '' }));
  const corpName = new Map(r.list<Corp>('dm.org.corps').map((c) => [c.id, c.name]));
  const corps = [...new Set(brs.map((b) => b.corpId).filter(Boolean))].sort().map((id) => ({ id, name: corpName.get(id) ?? id }));
  const cats = [...new Set(r.list<Product>('dm.master.products').map((p) => p.category).filter(Boolean))].sort();
  const fav = favTotal(r);
  const sites: SalesSite[] = byBranch.map((x) => ({
    id: x.key, name: nameOf(r, x.key), cnt: x.qty, amt: x.amountYen, payN: x.paidCount, refN: x.refundCount, refAmt: x.refundYen, cl: x.amountYen,
    pay: APP_PAY_METHODS.map((m) => x.byPay[m] ?? 0),
  })).sort((a, b) => a.id.localeCompare(b.id));
  const lastYm = (pid: string) => ps.find((p) => p.productId === pid)?.at.slice(0, 7).replace('/', '-') ?? '';
  const items: SalesItem[] = byProduct.map((x) => ({
    pid: x.key, name: product(r, x.key)?.name ?? x.key, menu: lastYm(x.key), cnt: x.qty, amt: x.amountYen, ord: x.count, fav: fav.get(x.key) ?? 0,
  })).sort((a, b) => a.pid.localeCompare(b.pid));
  const users: SalesUser[] = ps.map((p: AppPurchase) => ({
    uid: p.userId, no: p.id, site: p.branchId, sname: nameOf(r, p.branchId), amt: p.amountYen, qty: p.qty, pay: p.payMethod, st: p.status, reason: p.refundReason, at: p.at,
  }));
  return { sites, items, users, rank: rankOf(r), pay: APP_PAY_METHODS, corps, branches: brs, cats, genders: APP_GENDERS, ageGroups: APP_AGES };
}

export type FavArgs = { genders?: string[]; ageGroups?: string[] };
/** お気に入り（品番ごと。性別・年代はユーザーの登録情報の集計。性別・年代で絞ると、その条件の件数に数え直す＝RD-AP-090） */
export function favOf(r: DocRepo, a: FavArgs = {}) {
  const hist = app.queries.menuHistory(r);
  const gs = a.genders?.length ? a.genders : APP_GENDERS, as = a.ageGroups?.length ? a.ageGroups : APP_AGES;
  const rows: FavRow[] = app.queries.favoriteStats(r).map((f: FavoriteStat) => {
    const p = product(r, f.id);
    /* 性別×年代の件数のうち、条件に合う分だけ数える */
    const cell = (g: number, i: number) => (gs.includes(APP_GENDERS[g]) && as.includes(APP_AGES[i]) ? f.cells[g][i] : 0);
    const sum = (xs: number[]) => xs.reduce((x, y) => x + y, 0);
    const m = sum(f.cells[0].map((_, i) => cell(0, i))), fe = sum(f.cells[1].map((_, i) => cell(1, i)));
    return {
      pid: f.id, name: p?.name ?? f.id, last: ymJa(hist[f.id]?.last ?? ''), n: hist[f.id]?.n ?? 0, cat: p?.category ?? '', tot: m + fe, m, f: fe,
      ...Object.fromEntries(APP_AGES.map((_, i) => [`a${i}`, cell(0, i) + cell(1, i)])),
    };
  }).sort((a, b) => b.tot - a.tot);
  const sites = [...new Set(app.queries.users(r).map((u) => u.branchId))].sort().map((id) => nameOf(r, id));
  return { rows, sites, genders: APP_GENDERS, ageGroups: APP_AGES };
}

/** ダッシュボードの条件の選択肢（月ごとの購入の集計がある月・購入のある拠点の法人と拠点・商品マスタのカテゴリ） */
export function dashOf(r: DocRepo): DashData {
  const ms: MonthlySales[] = app.queries.monthlySales(r);
  const ids = new Set(ms.flatMap((m) => Object.keys(m.byBranch)));
  const branches = r.list<Branch>('dm.org.branches').filter((b) => ids.has(b.id)).sort((x, y) => x.id.localeCompare(y.id)).map((b) => ({ id: b.id, name: b.name, corpId: b.corpId ?? '' }));
  const corpName = new Map(r.list<Corp>('dm.org.corps').map((c) => [c.id, c.name]));
  const corps = [...new Set(branches.map((b) => b.corpId).filter(Boolean))].sort().map((id) => ({ id, name: corpName.get(id) ?? id }));
  const cats = [...new Set(r.list<Product>('dm.master.products').map((p) => p.category).filter(Boolean))].sort();
  return { ym: ms[ms.length - 1]?.id ?? '', months: ms.map((m) => m.id), corps, branches, cats };
}

/** 条件の法人・拠点に入る拠点の ID（なし＝すべて。拠点が優先） */
const branchesOfCond = (r: DocRepo, a: DashLineArgs) => (a.branchId ? [a.branchId] : a.corpId ? r.list<Branch>('dm.org.branches').filter((b) => b.corpId === a.corpId).map((b) => b.id) : undefined);
const inRange = (id: string, a: DashLineArgs) => (!a.from || id >= a.from) && (!a.to || id <= a.to);

/** 月次購入額推移（期間・法人・拠点で絞る。月ごとの購入の集計 dm.app.monthlySales の、法人・拠点に入る拠点の合計）。期間の既定＝いちばん新しい月までの12ヶ月 */
export function dashLineOf(r: DocRepo, a: DashLineArgs = {}): DashLine {
  const all: MonthlySales[] = app.queries.monthlySales(r);
  const ms = a.from || a.to ? all.filter((m) => inRange(m.id, a)) : all.slice(-12);
  const bs = branchesOfCond(r, a);
  return { months: ms.map((m) => m.id), sales: ms.map((m) => (bs ? bs.reduce((s, b) => s + (m.byBranch[b] ?? 0), 0) : m.totalYen)) };
}

/** お気に入り × 購入分析（期間・法人・拠点・カテゴリで絞る）。購入金額＝月ごとの購入の集計の商品別を期間で足し、法人・拠点は その月の購入に占める割合で按分。お気に入り件数＝商品ごと（法人・拠点の区別なし）。期間の既定＝いちばん新しい月 */
export function dashFavOf(r: DocRepo, a: DashFavArgs = {}): DashFav {
  const all: MonthlySales[] = app.queries.monthlySales(r);
  const last = all[all.length - 1]?.id ?? '';
  const q: DashLineArgs = a.from || a.to ? a : { from: last, to: last };
  const bs = branchesOfCond(r, a);
  const prods = new Map(r.list<Product>('dm.master.products').map((p) => [p.id, p]));
  const fav = favTotal(r);
  const sum = new Map<string, number>();
  for (const m of all.filter((x) => inRange(x.id, q))) {
    const k = bs && m.totalYen ? bs.reduce((s, b) => s + (m.byBranch[b] ?? 0), 0) / m.totalYen : 1;
    for (const [pid, yen] of Object.entries(m.byProduct)) {
      if (a.cats?.length && !a.cats.includes(prods.get(pid)?.category ?? '')) continue;
      sum.set(pid, (sum.get(pid) ?? 0) + Math.round(yen * k));
    }
  }
  return { rows: [...sum.entries()].map(([pid, yen]): [string, number, number] => [prods.get(pid)?.name ?? pid, yen, fav.get(pid) ?? 0]), from: q.from ?? '', to: q.to ?? '' };
}
