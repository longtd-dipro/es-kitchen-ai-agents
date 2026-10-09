import type { DocRepo } from '@/lib/ops/core/area';
import { costOn, selectedSupplier, shortLabel } from './product';
import type { AvgTarget, ChildContract, Course, KariApproval, MenuBaseKind, MenuItem, MenuPdf, MenuPdfKind, MenuPrice, MonthlyMenu, OrderPref, Product, ProductOrder, TaxRate } from './types';
import { AVG_TARGET } from './seed/settings';
import { today } from '@/lib/supplier/dates';

/*
 * 月間メニューの決まり（純粋な関数。seed・area・各サイトの fromDomain から使う）。
 *   ・基準注文数：50プランの代表値を3種類（std＝ライト・スタンダード／ns＝短消費期限なし／vm＝ライト（自販機））持つ。
 *     自動の値＝最近（前の2〜3サイクル月）の注文の割合で 50 を按分（新しい商品は同じカテゴリの平均）。合計＝50・1商品1以上。
 *     運営が手で直した値（manual）はそのまま、残りを按分する。ほかのプラン（30・80…）は食数に合わせて按分（scaleBase）
 *   ・月の注文の上限（拠点ごと）＝1回の食数 × 配送の回数（子契約）。便ごとの数は自由
 *   ・公開の条件：全商品が公開可能・メイン画像がある・メニューPDF がある・その月の仮発注が承認済
 *   ・前回メニュー／前回連続（商品追加のダイアログ）・CSV取込（00_確認してほしい/月間メニューCSV_Phase2テンプレート案.md）
 */

export const BASE_TOTAL = 50;
export const BASE_KINDS: MenuBaseKind[] = ['std', 'ns', 'vm'];
export const BASE_LABEL: Record<MenuBaseKind, string> = { std: '基準注文数', ns: '短消費期限なし基準注文数', vm: '自販機基準注文数' };
/** メニューPDF の上限（RD-MN-030：5MB 以下） */
export const MENU_PDF_MAX = 5 * 1024 * 1024;
/** 新しいメニューの営業サンプル件数の初期値（RD-MN-045・MM 2026/10/02：月60件＝15件×4） */
export const SAMPLE_QUOTA_DEFAULT = 60;
/* 商品タグはメニューの商品ごと（MenuItem.tags）に月ごとに付ける1種類だけ。固定のタグ（旧 NEW）はない（台帳 F 2026-10-08・受付簿 #179） */
/** 商品タグ（タグの名前）の上限（RD-MN-102「上限約20個」）。名前の足す・消すはメニューの画面 */
export const PRODUCT_TAG_MAX = 20;

/**
 * 平均仕入単価（税抜・50プラン。RD-MN-048 のメニュー一覧の列）：Σ（仕入単価 × 基準注文数）÷ 基準注文数の合計（ライト・スタンダード std）。
 * 仕入単価は選択中の仕入先の、その日の単価（改定は適用開始日から）。基準注文数がなければ商品の単純平均
 */
export function avgCostOf(m: Pick<MonthlyMenu, 'items'>, product: (id: string) => Product | undefined, day?: string): number {
  const xs = m.items.map((x) => ({ n: x.base.std, c: (() => { const p = product(x.productId); return p ? costOn(selectedSupplier(p), day) : 0; })() }));
  const n = xs.reduce((a, x) => a + x.n, 0);
  if (n) return Math.round(xs.reduce((a, x) => a + x.c * x.n, 0) / n);
  return xs.length ? Math.round(xs.reduce((a, x) => a + x.c, 0) / xs.length) : 0;
}

/* ---------------- メニューPDF（ライト用／スタンダード用） ---------------- */

export const MENU_PDF_KINDS: MenuPdfKind[] = ['ライト用', 'スタンダード用'];
/** 子契約のコース → そのコースの種別（ESスタンダード＝スタンダード用、ESライト（冷蔵庫・自販機）＝ライト用） */
export const pdfKindOfCourse = (course: Course | string): MenuPdfKind => (course === 'ESスタンダード' ? 'スタンダード用' : 'ライト用');
/**
 * その拠点（コース）に見せるメニューPDF：ESライトは「ライト用」だけ、ESスタンダードは**2つとも**（ライト用・スタンダード用）。
 * （hong 2026-10-06：ESスタンダードはライト用も見られる。ライトのお客様にスタンダード用は見せない）
 */
export const pdfsForCourse = (pdfs: MenuPdf[] | undefined, course: Course | string): MenuPdf[] =>
  (pdfs ?? []).filter((f) => course === 'ESスタンダード' || f.kind === pdfKindOfCourse(course))
    .sort((x, y) => MENU_PDF_KINDS.indexOf(x.kind) - MENU_PDF_KINDS.indexOf(y.kind));

/* ---------------- 平均単価の目標（メニューごと） ---------------- */

/** メニューの平均仕入単価の目標（冷蔵庫・自販機の 下限〜上限）。持っていないメニューは見本の既定 */
export const avgTargetOf = (m: Pick<MonthlyMenu, 'avgTarget'> | undefined): AvgTarget => ({ fr: { ...(m?.avgTarget?.fr ?? AVG_TARGET.fr) }, vm: { ...(m?.avgTarget?.vm ?? AVG_TARGET.vm) } });
/** 新しいメニューの目標の初期値＝前月（いちばん新しい前の）メニューの値、なければ見本の既定 */
export const nextAvgTarget = (menus: MonthlyMenu[], ym: string): AvgTarget => avgTargetOf([...menus].filter((m) => m.id < ym).sort((a, b) => b.id.localeCompare(a.id))[0]);
/** 目標の幅の確かめ（下限・上限は正の整数で 下限 ≦ 上限）。エラーの文言か null */
export function avgTargetError(t: AvgTarget | undefined): string | null {
  for (const k of ['fr', 'vm'] as const) {
    const x = t?.[k];
    if (!x || !Number.isInteger(x.min) || !Number.isInteger(x.max) || x.min <= 0 || x.max <= 0 || x.min > x.max) return `平均単価の目標（${k === 'fr' ? '冷蔵庫' : '自販機'}）は、下限・上限を正の整数で 下限 ≦ 上限 にしてください`;
  }
  return null;
}
/** 標準数の種類 → 使う目標（std・ns＝冷蔵庫、vm＝自販機） */
export const targetOfKind = (t: AvgTarget, k: MenuBaseKind) => (k === 'vm' ? t.vm : t.fr);

/* ---------------- 形をそろえる ---------------- */

/** メニューの1商品（初期値） */
export const newItem = (productId: string, order: number, p?: Partial<MenuItem>): MenuItem => ({
  productId, order, publishable: false, tags: [], sample: false, base: { std: 0, ns: 0, vm: 0 }, manual: { std: false, ns: false, vm: false }, note: '', ...p,
});

/** 保存のときに渡す商品（品番だけ、または変える項目だけ） */
export type SaveItemIn = string | (Partial<MenuItem> & { productId: string });

/** 表示順に並べて 1 から振り直す */
export const sortItems = (items: MenuItem[]) => [...items].sort((a, b) => a.order - b.order).map((x, i) => ({ ...x, order: i + 1 }));

/** 共通 DB のメニューを今の形にする（items が品番の配列だった前の形も読む） */
export function normMenu(raw: MonthlyMenu | (Omit<MonthlyMenu, 'items'> & { items: (string | MenuItem)[] })): MonthlyMenu {
  const m = raw as Partial<MonthlyMenu> & { id: string; status: MonthlyMenu['status']; items: (string | Partial<MenuItem>)[] };
  const items = (m.items ?? []).map((x, i) => {
    if (typeof x === 'string') return newItem(x, i + 1, { publishable: m.status !== '編集中' });
    const d = newItem(x.productId ?? '', x.order ?? i + 1);
    return { ...d, ...x, base: { ...d.base, ...x.base }, manual: { ...d.manual, ...x.manual } } as MenuItem;
  });
  const d: Omit<MonthlyMenu, 'id' | 'status' | 'items'> = {
    publishOn: '', orderFrom: '', orderTo: '', corpPublish: m.status === '編集中' ? '非公開' : '公開', autoPublishOn: '', pdfs: [], publishedAt: '', updatedAt: '', updatedBy: '',
  };
  /* 種別のない前の形の PDF はスタンダード用（冷蔵＋冷凍の全部）として読む */
  const pdfs = (m.pdfs ?? []).map((f) => ({ ...f, kind: f.kind ?? 'スタンダード用' }));
  return { ...d, ...(m as Partial<MonthlyMenu>), id: m.id, status: m.status, items: sortItems(items), pdfs };
}
export const getMenu = (r: DocRepo, ym: string) => { const m = r.get<MonthlyMenu>('dm.order.menus', ym); return m ? normMenu(m) : undefined; };
export const listMenus = (r: DocRepo) => r.list<MonthlyMenu>('dm.order.menus').map(normMenu).sort((a, b) => a.id.localeCompare(b.id));
/** メニューの品番（表示順） */
export const menuIds = (m: Pick<MonthlyMenu, 'items'>) => m.items.map((x) => x.productId);

/* ---------------- 営業サンプル（台帳 F 2026-10-08：商品マスタには持たない。メニューの商品ごとの「営業サンプル」で指定する） ---------------- */

/** メニューで営業サンプルに指定した商品の品番（表示順） */
export const sampleIdsOf = (m: Pick<MonthlyMenu, 'items'>) => m.items.filter((x) => x.sample).map((x) => x.productId);
/** 営業サンプルの対象を決めるメニュー：サイクル月 ym のメニュー。なければ ym より前でいちばん新しい公開済み（編集中でない）メニュー */
export function sampleMenuOf(r: DocRepo, ym: string): MonthlyMenu | undefined {
  const ms = listMenus(r);
  return ms.find((m) => m.id === ym) ?? ms.filter((m) => m.id <= ym && m.status !== '編集中').pop();
}

/* ---------------- 販売価格の写し（公開したときの価格） ---------------- */

/** 公開・ロックされたメニュー（公開中・締切済・配送中）。この月の価格は写しを使う */
/* 終了（D7 の翌日・日次バッチ）も公開したメニュー（価格の影響を見る。受付簿 No.50） */
export const PRICE_LOCKED: MonthlyMenu['status'][] = ['公開中', '締切済', '配送中', '終了'];
/** 商品マスタの今の価格の写し */
export function priceSnap(r: DocRepo, p: Product, at: string): MenuPrice {
  const t = r.get<TaxRate>('dm.master.taxRates', p.taxRateId);
  return { priceYen: p.priceYen, taxRateId: p.taxRateId, rate: t?.rate ?? 0, at };
}
/** その月の販売価格（税込）：公開したメニューの写し、なければ商品マスタ */
export function unitPrice(r: DocRepo, ym: string, productId: string): number {
  const snap = getMenu(r, ym)?.prices?.[productId];
  return snap ? snap.priceYen : r.get<Product>('dm.master.products', productId)?.priceYen ?? 0;
}

/**
 * いまの状態（締切済は「今日 ＞ オーダー締切日」で決める：締切日の翌日0時から。日次バッチの実行を待たずに画面・編集の可否を決める。受付簿 #266・レビュー B6）。
 * 保存してある状態が公開中でも、締切日を過ぎていれば締切済
 */
export const phaseOf = (m: Pick<MonthlyMenu, 'status' | 'orderTo'>, day = today()): MonthlyMenu['status'] => (m.status === '公開中' && !!m.orderTo && day > m.orderTo ? '締切済' : m.status);

/* ---------------- 日付 ---------------- */

/** サイクル月を n か月ずらす（'2026-11', -1 → '2026-10'） */
export function addYm(ym: string, n: number) {
  const [y, m] = ym.split('-').map(Number);
  const d = new Date(y, m - 1 + n, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

/* ---------------- 按分 ---------------- */

/** total を重み w で按分（大きい端数から1ずつ。重みが全部0なら均等）。運営のメニューの alloc と同じ */
export function alloc(total: number, w: number[]): number[] {
  const n = w.length;
  if (!n || total <= 0) return w.map(() => 0);
  let s = w.reduce((a, b) => a + b, 0);
  if (!(s > 0)) { w = w.map(() => 1); s = n; }
  const raw = w.map((x) => (total * x) / s), out = raw.map(Math.floor);
  const rest = total - out.reduce((a, b) => a + b, 0);
  raw.map((x, i) => [x - Math.floor(x), i]).sort((a, b) => b[0] - a[0] || a[1] - b[1]).slice(0, rest).forEach((t) => { out[t[1]]++; });
  return out;
}
/** 按分して、0 の商品にいちばん多い商品から1ずつ回す（合計は変えない。足りなければ 0 が残る） */
export function allocMin1(total: number, w: number[]): number[] {
  const q = alloc(total, w);
  for (let i = 0; i < q.length; i++) {
    if (q[i] > 0) continue;
    let j = -1;
    q.forEach((x, k) => { if (x > 1 && (j < 0 || x > q[j])) j = k; });
    if (j < 0) break;
    q[j]--; q[i] = 1;
  }
  return q;
}

/* ---------------- 基準注文数 ---------------- */

/** その種類の基準注文数を持つ商品か（std＝全部、ns＝短消費期限でない、vm＝自販機に入る・冷凍でない） */
export function baseEligible(kind: MenuBaseKind, p: Product | undefined): boolean {
  if (!p || p.status === '削除済') return false;
  if (kind === 'ns') return !shortLabel(p);
  if (kind === 'vm') return p.temp !== '冷凍' && p.vending.columns.length > 0;
  return true;
}

/**
 * 自動の値の重み（品番 → 重み）。
 * 前の3サイクル月までのメニュー（あるもの）にあった商品＝その月の注文の数の割合、新しい商品＝同じカテゴリの最近の商品の平均（なければ全体の平均、履歴がなければ1）
 */
/** 直近の注文（前の3サイクル月までのメニューがある月）：月・その月のメニューにあった商品・品番ごとの注文数・合計。補償（ES の負担）・除外（届けない）の行は数えない */
function recentOrders(ym: string, menus: MonthlyMenu[], orders: ProductOrder[]) {
  const months = [1, 2, 3].map((n) => addYm(ym, -n)).filter((x) => menus.some((m) => m.id === x));
  const recent = new Set(menus.filter((m) => months.includes(m.id)).flatMap(menuIds));
  const qty = new Map<string, number>();
  for (const o of orders) if (months.includes(o.cycleMonth)) for (const l of o.lines) if (!l.kind || l.kind === '通常' || l.kind === '差替') qty.set(l.productId, (qty.get(l.productId) ?? 0) + l.qty);
  const total = [...qty.values()].reduce((a, b) => a + b, 0);
  return { months, recent, qty, total };
}
/**
 * 直近3ヶ月の注文数と注文の割合（品番 → { qty, share }）。メニュー作成の画面の列（2026-10-05 台帳 F「人気の商品の見せ方」）。
 * 標準数の提案（baseWeights）と同じ月・同じ数え方。share＝その商品の注文数 ÷ 直近3ヶ月の全商品の注文数（0〜1）
 */
export function recentOrderStats(ym: string, ids: string[], menus: MonthlyMenu[], orders: ProductOrder[]) {
  const { qty, total } = recentOrders(ym, menus, orders);
  return new Map(ids.map((id) => [id, { qty: qty.get(id) ?? 0, share: total ? (qty.get(id) ?? 0) / total : 0 }]));
}

export function baseWeights(ym: string, ids: string[], product: (id: string) => Product | undefined, menus: MonthlyMenu[], orders: ProductOrder[]) {
  const { recent, qty, total } = recentOrders(ym, menus, orders);
  const share = (id: string) => (total ? (qty.get(id) ?? 0) / total : 1);
  const avg = (xs: string[]) => (xs.length ? xs.reduce((a, id) => a + share(id), 0) / xs.length : 0);
  const out = new Map<string, number>();
  for (const id of ids) {
    if (recent.has(id)) { out.set(id, share(id)); continue; }
    const cat = product(id)?.category;
    const same = [...recent].filter((x) => product(x)?.category === cat);
    out.set(id, avg(same) || avg([...recent]) || 1);
  }
  return out;
}

/**
 * 基準注文数を入れ直す（3種類）。手で直した値はそのまま、残り（50−手で直した値の合計）を対象の商品に重みで按分する。
 * 対象でない商品（短消費期限の商品の ns、自販機に入らない商品の vm）は 0
 */
export function recalcItems(items: MenuItem[], weights: Map<string, number>, product: (id: string) => Product | undefined): MenuItem[] {
  const out = items.map((x) => ({ ...x, base: { ...x.base }, manual: { ...x.manual } }));
  for (const k of BASE_KINDS) {
    const fixed = out.filter((x) => x.manual[k]).reduce((a, x) => a + x.base[k], 0);
    const free = out.filter((x) => !x.manual[k] && baseEligible(k, product(x.productId)));
    out.filter((x) => !x.manual[k]).forEach((x) => { x.base[k] = 0; });
    allocMin1(Math.max(0, BASE_TOTAL - fixed), free.map((x) => weights.get(x.productId) ?? 0)).forEach((n, i) => { free[i].base[k] = n; });
  }
  return out;
}

/** 標準数の調整（②）で移す回数の上限（商品ごとの上限は設けない。無限ループを防ぐだけ） */
export const ADJUST_MAX_MOVES = 10000;
export type SuggestOpts = {
  /** 仕入単価（税抜。選択中の仕入先のその日の単価） */
  cost: (id: string) => number;
  /** このメニューの平均単価の目標（std・ns＝冷蔵庫、vm＝自販機） */
  target: AvgTarget;
  /** false＝②をしない（「調整を戻す」。①の按分のまま） */
  adjust?: boolean;
};
export type SuggestResult = { items: MenuItem[]; /** 調整しても目標の幅に届かなかった種類（警告） */ unreachable: MenuBaseKind[] };

/** 種類ごとの平均仕入単価（税抜・標準数の加重平均。整数に丸める）。対象の商品の標準数がなければ null */
export function avgCostOfKind(items: MenuItem[], kind: MenuBaseKind, product: (id: string) => Product | undefined, cost: (id: string) => number): number | null {
  const xs = items.filter((x) => baseEligible(kind, product(x.productId)));
  const n = xs.reduce((a, x) => a + x.base[kind], 0);
  return n ? Math.round(xs.reduce((a, x) => a + cost(x.productId) * x.base[kind], 0) / n) : null;
}

/**
 * 標準数の提案 ②（2026-10-05 台帳 F「標準数（基準数）の提案のしかた」）：平均仕入単価（50プラン・税抜）が目標の幅に入るように自動で調整する。
 *   ・平均が幅より高ければ、いちばん高い商品 → いちばん安い商品へ1つずつ移す（高い商品が 1 になったら次に高い商品から）。低ければ逆（いちばん安い商品 → いちばん高い商品）
 *   ・手で直した商品（manual）は動かさない／どの商品も 1 未満にしない／合計は変えない／商品ごとの上限は設けない（幅に入るまで）
 *   ・移す回数は ADJUST_MAX_MOVES まで。同じ単価の商品しか残らない・行ったり来たりになる（幅に入る整数の組み合わせがない）ときは届かない（unreachable）：
 *     その種類は ①の按分のままにして警告を出す（途中まで動かした極端な数は残さない。要確認）
 *   ・調整した数は adj（①との差）に持ち、画面に ↑n／↓n を出す。std・ns は冷蔵庫の目標、vm は自販機の目標
 */
export function adjustItems(items: MenuItem[], product: (id: string) => Product | undefined, o: Pick<SuggestOpts, 'cost' | 'target'>): SuggestResult {
  const out = items.map((x) => ({ ...x, base: { ...x.base }, manual: { ...x.manual }, adj: { std: 0, ns: 0, vm: 0 } as Record<MenuBaseKind, number> }));
  const unreachable: MenuBaseKind[] = [];
  for (const k of BASE_KINDS) {
    const t = targetOfKind(o.target, k);
    const all = out.filter((x) => baseEligible(k, product(x.productId)));
    const total = all.reduce((a, x) => a + x.base[k], 0);
    if (!all.length || total <= 0) continue;
    const c = (x: MenuItem) => o.cost(x.productId);
    const avg = () => Math.round(all.reduce((a, x) => a + c(x) * x.base[k], 0) / total);
    /* 高い順（同じ単価は品番の順）。動かせるのは手で直していない商品だけ */
    const free = all.filter((x) => !x.manual[k]).sort((x, y) => c(y) - c(x) || x.productId.localeCompare(y.productId));
    const cheapFirst = [...free].reverse();
    let dir = 0, moves = 0, ok = true;
    while (moves < ADJUST_MAX_MOVES) {
      const a = avg();
      if (a >= t.min && a <= t.max) break;
      const d = a > t.max ? 1 : -1;
      /* 1つ移したら反対側に出た（幅に入る整数の組み合わせがない）→ 止める */
      if (dir && d !== dir) { ok = false; break; }
      dir = d;
      const from = (d === 1 ? free : cheapFirst).find((x) => x.base[k] > 1);
      const to = (d === 1 ? cheapFirst : free).find((x) => x !== from);
      if (!from || !to || c(from) === c(to)) { ok = false; break; }
      from.base[k]--; to.base[k]++; from.adj[k]--; to.adj[k]++; moves++;
    }
    const a = avg();
    if (!ok || !(a >= t.min && a <= t.max)) {
      unreachable.push(k);
      /* 届かない：①の按分に戻す */
      for (const x of free) { x.base[k] -= x.adj[k]; x.adj[k] = 0; }
    }
  }
  return { items: out.map((x) => (BASE_KINDS.some((k) => x.adj[k]) ? x : (({ adj: _a, ...y }) => y)(x))), unreachable };
}

/** 標準数の提案（①按分 → ②平均単価の調整）。o を省く・adjust＝false なら ①だけ（adj は消す） */
export function suggestItems(items: MenuItem[], weights: Map<string, number>, product: (id: string) => Product | undefined, o?: SuggestOpts): SuggestResult {
  const step1 = recalcItems(items, weights, product).map((x) => (({ adj: _a, ...y }) => y)(x) as MenuItem);
  if (!o || o.adjust === false) return { items: step1, unreachable: [] };
  return adjustItems(step1, product, o);
}

/** 基準注文数の合計（種類ごと）と、対象の商品があるのに 50 でない種類 */
export function baseSums(items: MenuItem[], product: (id: string) => Product | undefined) {
  const sums = Object.fromEntries(BASE_KINDS.map((k) => [k, items.reduce((a, x) => a + x.base[k], 0)])) as Record<MenuBaseKind, number>;
  const bad = BASE_KINDS.filter((k) => items.some((x) => baseEligible(k, product(x.productId))) && sums[k] !== BASE_TOTAL);
  return { sums, bad };
}

/** 拠点が使う基準注文数の種類（ライト（自販機）＝vm、短消費期限NG の拠点＝ns、ほか＝std） */
export const baseKindOf = (cc: Pick<ChildContract, 'course'>, pref?: Pick<OrderPref, 'allowShortLife'> | null): MenuBaseKind =>
  cc.course === 'ESライト（自販機）' ? 'vm' : pref && !pref.allowShortLife ? 'ns' : 'std';

/** ほかのプラン（食数）の数：50プランの基準注文数を食数に合わせて按分（ids で商品を絞れる） */
export function scaleBase(m: Pick<MonthlyMenu, 'items'>, kind: MenuBaseKind, meals: number, ids?: string[]): Record<string, number> {
  const xs = m.items.filter((x) => !ids || ids.includes(x.productId));
  const q = alloc(meals, xs.map((x) => x.base[kind]));
  return Object.fromEntries(xs.map((x, i) => [x.productId, q[i]]));
}

/**
 * デフォルト注文（基準数のまま）の行：便ごとに、出せる商品の基準注文数をその便の食数に按分。
 * お試しは全商品に均等（trial）
 */
export function defaultLines(m: Pick<MonthlyMenu, 'items'>, kind: MenuBaseKind, slots: { key: string; meals: number; ids: string[] }[], trial = false) {
  return slots.flatMap((s) => {
    const xs = m.items.filter((x) => s.ids.includes(x.productId));
    const q = alloc(s.meals, xs.map((x) => (trial ? 1 : x.base[kind])));
    return xs.map((x, i) => ({ productId: x.productId, slot: s.key, qty: q[i] })).filter((l) => l.qty > 0);
  });
}

/* ---------------- 月の注文の上限 ---------------- */

/** 拠点の月の注文の上限＝便ごとの（1回の食数 × 配送の回数）の合計（子契約） */
export const monthlyLimit = (cc: Pick<ChildContract, 'channels'>) => cc.channels.reduce((a, ch) => a + ch.mealsPerDelivery * ch.slots.length, 0);

/**
 * 便ごとの数の差（温度帯ごと：冷蔵・常温／冷凍）。差が ±1 を超える温度帯があればその説明、なければ null（台帳 E「法人Web 商品注文の登録の条件」2026-10-05）。
 * lines は月の上限に数える行（通常・差替）。便のキーは `${温度帯}:${枠}`（注文の行の slot と同じ）
 */
export function slotDiffProblem(cc: Pick<ChildContract, 'channels'>, lines: { slot: string; qty: number }[]): string | null {
  const groups: [string, (t: string) => boolean][] = [['冷蔵・常温', (t) => t !== '冷凍'], ['冷凍', (t) => t === '冷凍']];
  for (const [label, of] of groups) {
    const keys = cc.channels.filter((ch) => of(ch.temp)).flatMap((ch) => ch.slots.map((s) => `${ch.temp}:${s}`));
    if (keys.length < 2) continue;
    const sums = keys.map((k) => lines.filter((l) => l.slot === k).reduce((a, l) => a + l.qty, 0));
    const diff = Math.max(...sums) - Math.min(...sums);
    if (diff > 1) return `${label}の便ごとの数の差が ${diff}個あります（${sums.join('／')}）。差が1個以内になるように分けてください`;
  }
  return null;
}

/* ---------------- 公開の条件 ---------------- */

/**
 * 無効・削除済の商品がすでに入っているメニューは、保存も公開もできない（受付簿 #285。メニューから外せば保存できる）。
 * 入っていなければ null。メッセージは E58（無効）・E59（削除済）。商品の品番を並べる
 */
export function inactiveError(items: { productId: string }[], product: (id: string) => Product | undefined): string | null {
  const ids = (st: string) => items.filter((x) => product(x.productId)?.status === st).map((x) => x.productId);
  const off = ids('無効'), del = ids('削除済');
  const out = [
    off.length ? `${off.join('・')} は無効の商品です。メニューから外してください。` : '',
    del.length ? `${del.join('・')} は削除済の商品です。メニューから外してください。` : '',
  ].filter(Boolean);
  return out.length ? out.join('／') : null;
}

/**
 * 公開の条件のうち満たしていないもの（空なら公開できる）。
 *   mode＝publish（既定）：公開する（非公開→公開・自動公開）とき。PDF が1つ以上・全商品が公開可能・メイン画像あり・その月の仮発注が承認済・種類ごとの基準注文数の合計が 50
 *   mode＝saved：すでに公開済み（公開中・締切済）の保存。合計 50 と仮発注の承認は見ない（保存の確認ダイアログ No.11.14 だけ。受付簿 #256・#265）
 */
export function unmetOf(m: MonthlyMenu, product: (id: string) => Product | undefined, kari: KariApproval | undefined, mode: 'publish' | 'saved' = 'publish'): string[] {
  const out: string[] = [];
  if (!m.items.length) out.push('商品が1つもありません');
  const notOk = m.items.filter((x) => !x.publishable).map((x) => x.productId);
  if (notOk.length) out.push(`公開可能になっていない商品があります（${notOk.length}品：${notOk.join('・')}）`);
  const gone = m.items.filter((x) => { const p = product(x.productId); return !p || p.status === '削除済'; }).map((x) => x.productId);
  if (gone.length) out.push(`商品マスタにない・削除済の商品があります（${gone.join('・')}）`);
  /* 無効の商品が入っていると公開できない（手動・自動公開とも。受付簿 #285） */
  const off = m.items.filter((x) => product(x.productId)?.status === '無効').map((x) => x.productId);
  if (off.length) out.push(`${off.join('・')} は無効の商品です。メニューから外してください。`);
  const noImg = m.items.filter((x) => { const p = product(x.productId); return p && !p.images.some((i) => i.main); }).map((x) => x.productId);
  if (noImg.length) out.push(`メイン画像がない商品があります（${noImg.join('・')}）`);
  /* PDF は1つ以上（ライト用・スタンダード用のどちらでもよい。ライトのお客様にはライト用だけ見せる。2026-10-05 台帳 F・hong 回答） */
  if (!m.pdfs.length) out.push('メニューPDF がアップロードされていません（ライト用・スタンダード用のどちらか1つ以上）');
  if (mode === 'publish') {
    if (kari?.status !== '承認') out.push(`${m.id} の仮発注が承認されていません`);
    /* 公開は種類ごとの合計が 50 でないと止める（E139。受付簿 #254） */
    const { sums, bad } = baseSums(m.items, product);
    for (const k of bad) out.push(`${BASE_LABEL[k]}の合計が50ではありません（現在${sums[k]}）`);
  }
  return out;
}

/* ---------------- 前回メニュー・前回連続 ---------------- */

/** 商品ごとの前回メニュー（その月より前でいちばん新しく入っていた月。なければ ''）と前回連続（前月と前々月の両方に入っていた） */
export function prevInfoOf(menus: MonthlyMenu[], ym: string, ids: string[]) {
  const before = menus.filter((m) => m.id < ym).sort((a, b) => b.id.localeCompare(a.id));
  const has = (mid: string, id: string) => !!before.find((m) => m.id === mid)?.items.some((x) => x.productId === id);
  return Object.fromEntries(ids.map((id) => [id, {
    prevMenu: before.find((m) => m.items.some((x) => x.productId === id))?.id ?? '',
    consecutive: has(addYm(ym, -1), id) && has(addYm(ym, -2), id),
  }])) as Record<string, { prevMenu: string; consecutive: boolean }>;
}

/* ---------------- CSV取込 ---------------- */

export const MENU_CSV_HEADER = ['年月', '表示順', '品番', '商品名（参考）', '公開可能', '商品タグ', '基準注文数', '短消費期限なし基準注文数', '自販機基準注文数', '営業サンプル'];
export type CsvIssue = { row: number; message: string };

/** CSV の文字列を行×列にする（"…" の中のカンマ・改行・"" に対応。BOM は外す） */
export function parseCsv(text: string): string[][] {
  const s = text.replace(/^﻿/, '');
  const rows: string[][] = [];
  let row: string[] = [], cell = '', q = false;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (q) {
      if (c === '"' && s[i + 1] === '"') { cell += '"'; i++; } else if (c === '"') q = false; else cell += c;
    } else if (c === '"') q = true;
    else if (c === ',') { row.push(cell); cell = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && s[i + 1] === '\n') i++;
      row.push(cell); rows.push(row); row = []; cell = '';
    } else cell += c;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  return rows.filter((r) => r.some((x) => x.trim()));
}

/**
 * 月間メニューの CSV を読む（行ごとに取り込む：受付簿 #239）。エラーの行は items に入れず bad に持つ（ほかの行は登録できる）。
 * ファイル全体のエラー（見出し・年月・商品の行がない）は row ≦ 1 で errors に入れる（取り込めない）。
 * CSV の基準注文数は運営が入れた値（manual）、自販機基準注文数が空なら自動。行番号はファイルの行（ヘッダー＝1）
 */
export function parseMenuCsv(csv: string, ctx: { menuId: string; product: (id: string) => Product | undefined; tagNames: Set<string> }) {
  const errors: CsvIssue[] = [], warnings: CsvIssue[] = [];
  const bad: { row: number; productId: string }[] = [];
  const rows = parseCsv(csv);
  const items: MenuItem[] = [];
  if (!rows.length) return { items, bad, errors: [{ row: 1, message: 'ファイルが空です' }], warnings };
  const head = rows[0].map((x) => x.trim());
  if (head.length !== MENU_CSV_HEADER.length || head.some((h, i) => h !== MENU_CSV_HEADER[i])) {
    return { items, bad, errors: [{ row: 1, message: `1行目の見出しをテンプレートの列の順にしてください（${MENU_CSV_HEADER.join(',')}）` }], warnings };
  }
  if (rows.length < 2) errors.push({ row: 1, message: '商品の行がありません' });
  const yms = new Set<string>(), seen = new Map<string, number>(), orders = new Map<number, number>();
  let ymBad = false;
  rows.slice(1).forEach((cells, i) => {
    const row = i + 2, n0 = errors.length;
    const err = (message: string) => errors.push({ row, message });
    const int = (v: string, label: string, need: boolean) => {
      const t = v.trim();
      if (!t) { if (need) err(`${label}を入れてください`); return null; }
      if (!/^\d+$/.test(t)) { err(`${label}は 0 以上の整数にしてください（${t}）`); return null; }
      return Number(t);
    };
    const flag = (v: string, label: string) => {
      const t = v.trim();
      if (t !== '' && t !== '0' && t !== '1') err(`${label}は 1 か空にしてください（${t}）`);
      return t === '1';
    };
    const c = MENU_CSV_HEADER.map((_, j) => (cells[j] ?? '').trim());
    if (cells.length > MENU_CSV_HEADER.length && cells.slice(MENU_CSV_HEADER.length).some((x) => x.trim())) err('列が多すぎます');
    const [ym, ord, id, , pub, tags, std, ns, vm, sample] = c;
    /* 年月が取込先と違う・混ざっている＝ファイル全体のエラー（E132。行の数には数えない） */
    let fileErr = 0;
    if (!/^\d{4}-\d{2}$/.test(ym)) err(`年月の形が違います（${ym || '空'}。例 2026-12）`);
    else { yms.add(ym); if (ym !== ctx.menuId) { if (!ymBad) errors.push({ row: 1, message: `年月は取込先のメニュー（${ctx.menuId}）と同じにしてください（${row}行目：${ym}）` }); ymBad = true; fileErr = 1; } }
    const order = int(ord, '表示順', true);
    if (order === 0) err('表示順は 1 から始めてください');
    if (order) { if (orders.has(order)) warnings.push({ row, message: `表示順 ${order} が ${orders.get(order)}行目と同じです（ファイルの順に並べます）` }); else orders.set(order, row); }
    const p = id ? ctx.product(id) : undefined;
    if (!id) err('品番を入れてください');
    else if (seen.has(id)) err(`品番 ${id} が ${seen.get(id)}行目と重複しています`);
    else if (!p) err(`品番 ${id} は商品マスタにありません`);
    else if (p.status === '削除済') err(`品番 ${id} は削除済の商品です`);
    else if (p.status === '無効') err(`品番 ${id} は無効の商品です`);
    if (id && !seen.has(id)) seen.set(id, row);
    const tagList = tags.split(';').map((t) => t.trim()).filter(Boolean);
    const badTags = tagList.filter((t) => !ctx.tagNames.has(t));
    if (badTags.length) err(`商品タグ「${badTags.join('・')}」はタグのマスタにありません（画面で先に追加してください）`);
    const nStd = int(std, '基準注文数', true), nNs = int(ns, '短消費期限なし基準注文数', true), nVm = int(vm, '自販機基準注文数', false);
    const isPub = flag(pub, '公開可能'), isSample = flag(sample, '営業サンプル');
    if (p) {
      if (!p.pickWarehouseIds.length) warnings.push({ row, message: `${id} はどのピッキング倉庫にもありません（どの拠点にも出ません）` });
      if (!p.courses.length) warnings.push({ row, message: `${id} にコースがありません（どの拠点にも出ません）` });
      if (!p.images.some((x) => x.main)) warnings.push({ row, message: `${id} にメイン画像がありません（公開の条件を満たしません）` });
      if (nVm && !baseEligible('vm', p)) warnings.push({ row, message: `${id} は自販機に入らない商品なので、自販機基準注文数は使いません` });
      if (nNs && !baseEligible('ns', p)) warnings.push({ row, message: `${id} は短消費期限の商品なので、短消費期限なし基準注文数は使いません` });
    }
    if (!isPub) warnings.push({ row, message: `${id || '（品番なし）'} は公開可能になっていません（このままでは自動公開されません）` });
    /* エラーの行は取り込まない（行ごと）。年月の違いはファイル全体のエラー */
    if (errors.length - n0 - fileErr > 0) { bad.push({ row, productId: id }); return; }
    const useVm = nVm != null && (!p || baseEligible('vm', p)), useNs = !p || baseEligible('ns', p);
    items.push(newItem(id, order || 9999 + i, {
      publishable: isPub, tags: tagList, sample: isSample,
      base: { std: nStd ?? 0, ns: useNs ? nNs ?? 0 : 0, vm: useVm ? nVm! : 0 },
      manual: { std: nStd != null, ns: useNs && nNs != null, vm: useVm },
    }));
  });
  if (yms.size > 1) errors.push({ row: 1, message: `年月が混在しています（${[...yms].join('・')}）` });
  /* ファイルの順を保ったまま表示順で並べる */
  return { items: sortItems(items.map((x, i) => ({ ...x, order: x.order * 10000 + i }))), bad, errors, warnings };
}
