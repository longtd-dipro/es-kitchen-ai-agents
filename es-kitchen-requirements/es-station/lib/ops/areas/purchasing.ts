import { ApiError } from '@/lib/api/errors';
import { nowStamp } from '@/lib/supplier/dates';
import dmMenu from '@/lib/domain/areas/menu';
import { sampleIdsOf, sampleMenuOf } from '@/lib/domain/menu';
import dmSample from '@/lib/domain/areas/sample';
import { supplierService } from '@/lib/supplier/service';
import type { OpsOp, Order } from '@/lib/supplier/types';
import { defineArea, type DocRepo } from '../core/area';
import order from '@/lib/domain/areas/order';
import type { Product as DProduct, SalesSample, Warehouse } from '@/lib/domain/types';
import { stampUnitCost, unitCostOf } from '@/lib/domain/snapshot';
import { supplierOrderNotices } from '@/lib/domain/mails';
import { PRODUCTS } from '@/lib/domain/seed/products';
import { altPoOrders, docSupplierRepo, ORDER_KIND } from '../purchasing/docRepo';
import { draftKey, planId } from '../purchasing/logic';
import { OPS_USER, slotK, TODAY } from '../purchasing/master';
import { smMake, smNextBase, smOver, smToday, smValidate, smYmOf, type SmTarget } from '../purchasing/samples';
import S from '../purchasing/seed.json';
import dmStock from '@/lib/domain/areas/stock';
import { addMove, RECEIPTS, stockAt, stockLedgers, whIdOf } from '@/lib/domain/stock';
import type { Account, Cycle, Delivery, DeliveryLine, MonthlyMenu, Receipt, StockMove } from '@/lib/domain/types';
import { wsFromLedger, type WsData } from '../purchasing/stock';
import type { Bill, Draft, Group, OrderMeta, Plan, Sample, SampleForm, StockRec, StockRet, StockState, WeekClose } from '../purchasing/types';

/*
 * 発注・入荷（発注・資材発注・発注・入荷履歴・営業サンプル・倉庫在庫・入荷確認）。
 * 仕入先への発注は仕入先サイトと同じデータ（共通 DB の発注・lib/api/ops.ts）。ここには
 *   - 仕入先サイトのアカウントがない仕入先の発注（purchasing.orders。書き換えは仕入先サイトと同じ lib/supplier/service.ts）
 *   - 運営だけの情報（請求照合・通知を見たか・発注前の入力・発注単位の区切り）
 *   - THOMAS在庫の取り込みの記録・在庫戻しの出荷指示（倉庫在庫の数そのもの・在庫の記録は共通データ dm.stock。lib/domain/stock.ts）
 * 営業サンプル（と月の件数）は共通データ（dm.sample.*。メニュー管理 ＞ 月間メニューの件数と同じ）。
 * を持つ。代替品設定の不足分の追加発注（共通データ dm.order.altPos）もこの領域の発注として出す（書き換えは dm.order.altPos に戻す）。
 * 仕入先への請求（不良控除・dm.order.supplierClaims）は、その月の発注一覧のマイナスの行（claims）と、月×仕入先の集計（supplierPayables）に出す。
 */

/**
 * 仕入先・月ごとの集計：発注金額（本発注の数 × 仕入単価・キャンセル／受注不可を除く）・不良控除・支払額・請求照合。
 * 仕入単価は本発注したときの写し（発注の unitCostYen・影響一覧 A5）。写しのない古い発注だけ、いまの商品マスタの単価
 */
export function payables(repo: DocRepo, ym: string, orders: Order[]) {
  const unit = (pid: string, sup: string) => {
    const p = repo.get<DProduct>('dm.master.products', pid);
    return unitCostOf(p, sup) ?? 0;
  };
  const metas = new Map(repo.list<OrderMeta>(K.meta).map((m) => [m.id, m]));
  const claims = order.queries.supplierClaims(repo, { ym });
  /* 同じ発注が2つ渡ってきたら1つにする（追加発注は共通 DB の発注一覧にも出る） */
  orders = orders.filter((o, i) => orders.findIndex((x) => x.no === o.no) === i);
  const sups = [...new Set([...orders.filter((o) => o.ym === ym).map((o) => o.sup), ...claims.map((c) => c.supplierId)])].sort();
  return sups.map((sup) => {
    const os = orders.filter((o) => o.ym === ym && o.sup === sup && !['キャンセル', '受注不可'].includes(o.ans) && o.hon > 0);
    /* 多い分を受け入れたとき、運営が「入荷数」で払うと選んだ分は、多い数 × 仕入単価を足す（発注数を選んだら足さない） */
    const over = (o: Order) => repo.list<Receipt>(RECEIPTS).filter((x) => x.poNo === o.no && x.fix?.how === '多い分を受け入れる' && x.fix.payBasis === '入荷数').reduce((s, x) => s + (x.qty - x.planQty), 0);
    const orderYen = os.reduce((s, o) => s + (o.hon + over(o)) * (o.unitCostYen ?? unit(o.pid, sup)), 0);
    const deductYen = claims.filter((c) => c.supplierId === sup).reduce((s, c) => s + c.amountYen, 0);
    const bills = os.map((o) => metas.get(o.no)?.bill ?? '未照合');
    const bill = !bills.length ? '—' : bills.includes('差異あり') ? '差異あり' : bills.every((b) => b === '照合済') ? '照合済' : '未照合';
    return { ym, supplierId: sup, orders: os.length, orderYen, deductYen, payYen: orderYen + deductYen, bill };
  });
}

const K = {
  orders: ORDER_KIND,
  meta: 'purchasing.meta',
  plans: 'purchasing.plans',
  /** THOMAS在庫の取り込みの記録（id＝state） */
  stock: 'purchasing.stock',
  rets: 'purchasing.stockRets',
} as const;

function seed() {
  /* 本発注済みの見本は、商品マスタの見本の仕入単価を写しておく（本発注したときの単価） */
  const orders = structuredClone(S.orders as unknown as Order[]);
  orders.forEach((o) => stampUnitCost(o, (id) => PRODUCTS.find((x) => x.id === id)));
  const plans: Record<string, Plan> = {};
  S.errLines.forEach((l) => {
    const id = planId(l.ym, l.pid);
    plans[id] ??= { id, group: '4', drafts: {} };
    plans[id].drafts[draftKey(l.wh, l.k)] = { kari: l.kari, bb: l.bb, wish: l.wish };
  });
  return {
    [K.orders]: orders.map((o) => ({ id: o.no, data: o })),
    [K.plans]: Object.values(plans).map((p) => ({ id: p.id, data: p })),
    /* 取り込みの記録だけ（棚卸しの数は共通データ dm.stock.bases の見本・2026/09/30） */
    [K.stock]: [{ id: 'state', data: { id: 'state', imp: S.ws.imp } }],
  };
}

/* ---------- 営業サンプル（共通データ ↔ 画面の形。倉庫は 倉庫マスタの ID ↔ 名前） ---------- */
const whs = (repo: DocRepo) => repo.list<Warehouse>('dm.master.warehouses');
const sampleOf = (repo: DocRepo, x: SalesSample): Sample => {
  const { id, warehouseId, items, ...rest } = x;
  return { ...rest, routeCarrier: x.routeCarrier ?? '', routeHub: x.routeHub ?? '', trackingNo: x.trackingNo ?? '', no: id, wh: whs(repo).find((w) => w.id === warehouseId)?.name ?? warehouseId, items: items.map((i) => ({ pid: i.productId, qty: i.qty, how: i.how })) } as Sample;
};
const dmSampleOf = (repo: DocRepo, x: Sample): SalesSample => {
  const { no, wh, items, ...rest } = x;
  const w = whs(repo).find((y) => y.name === wh && y.type === 'picking');
  if (!w) throw new ApiError(`ピッキング倉庫 ${wh} がありません`, 400);
  return { ...rest, id: no, warehouseId: w.id, items: items.map((i) => ({ productId: i.pid, qty: i.qty, how: i.how })) } as SalesSample;
};
const samples = (repo: DocRepo) => dmSample.queries.list(repo).map((x) => sampleOf(repo, x));
/**
 * 営業サンプルの対象：今日のサイクル月の月間メニューで「営業サンプル」にチェックした有効な商品（メニューの表示順）。
 * その月のメニューがなければ、それより前でいちばん新しい公開済みのメニュー（lib/domain/menu.ts の sampleMenuOf）。
 * 商品マスタには営業サンプルの項目を持たない（台帳 F 2026-10-08）。取扱倉庫＝ピッキング倉庫の名前
 */
const smTargetsOf = (repo: DocRepo): SmTarget[] => {
  const m = sampleMenuOf(repo, cycleNow(repo));
  return (m ? sampleIdsOf(m) : []).map((id) => repo.get<DProduct>('dm.master.products', id)).filter((p): p is DProduct => !!p && p.status === '有効')
    .map((p) => ({ id: p.id, name: p.name, keep: p.storage.admin, wh: p.pickWarehouseIds.map((id) => whName(repo, id)) }));
};
/** 今日を含むサイクル月（暦の外は今日の月） */
const cycleNow = (repo: DocRepo) => {
  const day = TODAY().replace(/-/g, '/');
  return repo.list<Cycle>('dm.delivery.cycles').find((c) => c.a1 <= day && day <= c.d7)?.id ?? day.slice(0, 7).replace('/', '-');
};

const plan = (repo: DocRepo, ym: string, pid: string): Plan => repo.get<Plan>(K.plans, planId(ym, pid)) ?? { id: planId(ym, pid), group: '4', drafts: {} };
const meta = (repo: DocRepo, no: string): OrderMeta => repo.get<OrderMeta>(K.meta, no) ?? { id: no };
const stock = (repo: DocRepo) => repo.get<StockState>(K.stock, 'state')!;
/** 操作したアカウントの既定（ログインのない mock のときだけ）。サーバーは lib/server/access.ts の gate がログイン中のアカウントを args.by に入れる */
const OPS_ID = 'Ad00010';
type By = { by?: string };
const actor = (a: unknown): string => { const b = (a as By | null | undefined)?.by; return typeof b === 'string' && b ? b : OPS_ID; };
/** 調整数の必要数：キー＝メニュー年月|商品ID|倉庫名|k（枠の日数。A1＝0）。追加の子配送は親と二重に数えない */
function serviceDemandOf(repo: DocRepo, wh: (id: string) => string): Record<string, number> {
  const ds = new Map(repo.list<Delivery>('dm.delivery.deliveries').filter((d) => !d.parentId && d.temp !== '資材' && d.status !== '取消' && d.cycleMonth && d.slot).map((d) => [d.id, d]));
  const out: Record<string, number> = {};
  for (const l of repo.list<DeliveryLine>('dm.delivery.lines')) {
    const d = ds.get(l.deliveryId);
    if (!d || !(l.serviceQty && l.serviceQty > 0)) continue;
    const key = `${d.cycleMonth}|${l.productId}|${wh(d.warehouseId)}|${slotK(d.slot)}`;
    out[key] = (out[key] ?? 0) + l.serviceQty;
  }
  return out;
}
const whName = (repo: DocRepo, id: string) => whs(repo).find((w) => w.id === id)?.name ?? id;
const byName = (repo: DocRepo) => (id: string) => repo.get<Account>('dm.account.accounts', id)?.name ?? id;
/** 名前で残す記録（締めた人・取り込んだ人）：ログイン中のアカウントの名前（mock は見本の名前） */
const userOf = (repo: DocRepo, a: unknown) => ((a as By | undefined)?.by ? byName(repo)(actor(a)) : OPS_USER);
/** 倉庫在庫の画面のデータ：数は共通データの倉庫在庫の見込み（入荷予定＝共通 DB の発注＋この領域の発注＋追加発注）、在庫の記録は dm.stock.moves */
function stockView(repo: DocRepo): WsData {
  const nameOf = byName(repo);
  const rows = stockLedgers(repo, { item: '商品' }).map((l) => wsFromLedger(l, nameOf));
  const recs: StockRec[] = dmStock.queries.moves(repo).filter((m) => m.item === '商品').map((m: StockMove) => ({
    no: m.id, date: m.on, wh: whName(repo, m.warehouseId), pid: m.itemId, kind: m.kind, qty: m.qty, reason: m.reason, by: nameOf(m.by), at: m.at,
  }));
  return { state: { id: 'state', imp: stock(repo).imp }, recs, rets: repo.list<StockRet>(K.rets), rows, nextMenu: nextMenuOf(repo) };
}
/**
 * 次のメニュー（今日のサイクルより後で、まだ注文を受ける月間メニュー＝公開中・編集中のいちばん早い月。共通データ dm.order.menus）の商品。
 * 締切済・配送中の月の出荷は倉庫在庫の見込み（余り）に入っているので、戻す数を余りまでにすれば足りなくならない。
 * 在庫戻し（REQ-PO-603・決定 W6）：使わない商品は余り全部・チェックあり、使う商品は 0・チェックなしで始める
 */
function nextMenuOf(repo: DocRepo) {
  const cur = cycleNow(repo);
  const menus = repo.list<MonthlyMenu>('dm.order.menus').filter((m) => m.id > cur && ['公開中', '編集中'].includes(m.status)).sort((a, b) => a.id.localeCompare(b.id));
  const m = menus[0];
  return m ? { ym: m.id, ids: m.items.map((x) => x.productId) } : undefined;
}
/** 在庫の記録を共通データに足す（倉庫は名前でも ID でも） */
const move = (repo: DocRepo, a: { wh: string; pid: string; kind: string; qty: number; on: string; reason: string }, by: string) => {
  const warehouseId = whIdOf(repo, a.wh);
  if (!warehouseId) throw new ApiError(`倉庫 ${a.wh} がありません`, 400);
  return addMove(repo, { warehouseId, itemId: a.pid, on: a.on, kind: a.kind, qty: a.qty, reason: a.reason, by });
};

export default defineArea({
  name: 'purchasing',
  seed,
  queries: {
    /** 仕入先サイトのアカウントがない仕入先の発注＋代替品の不足分の追加発注（dm.order.altPos） */
    orders: (repo) => [...repo.list<Order>(K.orders), ...altPoOrders(repo)],
    /** 不良控除の行（その月の発注一覧に出すマイナスの行。代替品設定の仕入先への請求） */
    claims: (repo, a?: { ym?: string }) => order.queries.supplierClaims(repo, { ym: a?.ym }).map((c) => ({
      no: c.id, alt: c.altId, ym: c.ym, sup: c.supplierId, pid: c.productId, name: repo.get<DProduct>('dm.master.products', c.productId)?.name ?? c.productId,
      kind: c.label, qty: -c.qty, unit: c.unitCostYen, amt: c.amountYen, at: c.at,
    })),
    /**
     * 月 × 仕入先の集計（発注金額・不良控除・支払額・請求照合）。この領域の発注と追加発注で数える。
     * 仕入先サイトの共通 DB の発注は画面が読んでいる（useOrders）ので、画面から dbOrders で渡す
     */
    supplierPayables: (repo, a: { ym: string; dbOrders?: Order[] }) => payables(repo, a.ym, [...(a.dbOrders ?? []), ...repo.list<Order>(K.orders), ...altPoOrders(repo)]),
    /** 運営だけの情報（請求照合・通知）と発注の設定（区切り・発注前の入力） */
    meta: (repo) => ({
      meta: Object.fromEntries(repo.list<OrderMeta>(K.meta).map((m) => [m.id, m])) as Record<string, OrderMeta>,
      plans: Object.fromEntries(repo.list<Plan>(K.plans).map((p) => [p.id, p])) as Record<string, Plan>,
      /* 調整数（サービスで足した数）の必要数：共通データの配送の明細（serviceQty）から。発注の必要数に足す（受付簿 #252。lib/ops/purchasing/logic.ts の setServiceDemand） */
      svc: serviceDemandOf(repo, (id) => whName(repo, id)),
      /*
       * 商品マスタの ES の期限（日。ヶ月は30日）。発注の希望消費期限＝顧客納品日＋この日数（2026/10/03 回答：商品マスタの ES の期限を発注で使う）。
       * 期限のない（0）商品は入れない（発注の見本の保証日数のまま）
       */
      esLife: Object.fromEntries(repo.list<DProduct>('dm.master.products').filter((p) => p.shelfLife?.esValue > 0)
        .map((p) => [p.id, p.shelfLife.esUnit === 'ヶ月' ? p.shelfLife.esValue * 30 : p.shelfLife.esValue])) as Record<string, number>,
      /* 仕入先ごとの発注方法（仕入先マスタ。ESステーション／メール／外部。値がなければ ESステーション。台帳 I・F 2026-10-08） */
      supMethod: Object.fromEntries(repo.list<{ id: string; method?: string }>('db.suppliers').map((s) => [s.id, s.method || 'ESステーション'])) as Record<string, string>,
    }),
    /** 営業サンプル・締めた出荷週・月の件数（共通データ dm.sample.*） */
    samples: (repo) => ({ rows: samples(repo), closed: dmSample.queries.weekCloses(repo) as WeekClose[], quota: dmSample.queries.quotas(repo), targets: smTargetsOf(repo) }),
    /** 倉庫在庫（共通データの倉庫在庫の見込み・在庫の記録）と THOMAS の取り込み・在庫戻しの出荷指示 */
    stock: (repo) => stockView(repo),
    /** 仮発注の承認（メニューの月ごと。共通データの dm.menu.kariApprovals。承認済でないとメニューを公開できない） */
    kari: (repo, a?: { ym?: string }) => dmMenu.queries.kari(repo, { menuId: a?.ym }).map((k) => ({ ...k, approvedByName: k.approvedBy ? byName(repo)(k.approvedBy) : '' })),
  },
  actions: {
    /** 仮発注を承認する（approve＝false で取り消す）。メニューの公開の条件になる */
    approveKari: (repo, a: { ym: string; approve?: boolean } & By) => dmMenu.actions.approveKari(repo, { menuId: a.ym, approve: a.approve, accountId: actor(a) }),
    /** 発注の書き換え（仕入先サイトのアカウントがない仕入先の発注）。中身は仕入先サイトと同じ */
    /* 仮発注・本発注は仕入先へ通知（旧システムの「仮発注通知」「発注確定通知」・lib/domain/mails.ts） */
    orderOp: (repo, op: OpsOp) => { const out = supplierService(docSupplierRepo(repo)).runOps(op); supplierOrderNotices(repo, op, out); return out; },

    setBill(repo, { no, bill, by }: { no: string; bill: Bill; by?: string }) {
      if (!['未照合', '照合済', '差異あり'].includes(bill)) throw new ApiError('請求照合の値が正しくありません', 400);
      const m = meta(repo, no);
      const from: Bill = m.bill ?? '未照合';
      if (from === bill) return;
      /* 変えた人・日時・変更前後を履歴に残す（台帳 I・2026-10-08） */
      repo.put(K.meta, no, { ...m, bill, billLog: [...(m.billLog ?? []), { at: nowStamp(), by: by ?? OPS_ID, from, to: bill }] });
    },
    /** 通知を見た（受注不可・分納） */
    markSeen(repo, { nos, kind }: { nos: string[]; kind: 'reject' | 'split' }) {
      nos.forEach((no) => repo.put(K.meta, no, { ...meta(repo, no), [kind === 'reject' ? 'rejSeen' : 'splitSeen']: true }));
    },
    /** 発注単位の区切り（4Cycle別・2Cycle別・全1単位） */
    setGroup(repo, { ym, pid, group }: { ym: string; pid: string; group: Group }) {
      if (!['4', '2', '1'].includes(group)) throw new ApiError('区切りが正しくありません', 400);
      repo.put(K.plans, planId(ym, pid), { ...plan(repo, ym, pid), group, drafts: {} });
    },
    /** 発注前の入力（仮発注数・入荷希望日・希望消費期限）を残す。値が undefined の項目は消す */
    saveDrafts(repo, { ym, pid, drafts }: { ym: string; pid: string; drafts: Record<string, Draft | null> }) {
      const p = plan(repo, ym, pid);
      const next = { ...p.drafts };
      Object.entries(drafts).forEach(([k, d]) => { if (d) next[k] = { ...next[k], ...d }; else delete next[k]; });
      repo.put(K.plans, p.id, { ...p, drafts: next });
    },

    /* ===== 営業サンプル ===== */
    addSample(repo, { form, ym }: { form: SampleForm; ym: string }) {
      const targets = smTargetsOf(repo);
      const e = smValidate(form, targets);
      if (Object.keys(e).length) throw new ApiError('入力内容を確認してください', 400);
      const rows = samples(repo);
      const y = smYmOf(form.deliv, ym);
      if (smOver(rows, form.deliv, ym, dmSample.queries.quotas(repo))) throw new ApiError(`${y.slice(0, 4)}年${+y.slice(5)}月の営業サンプル枠を超えるため登録できません（残り枠 0件）`, 409);
      const closed = dmSample.queries.weekCloses(repo) as WeekClose[];
      const out = smMake(form, smNextBase(rows, y), closed, smToday(), nowStamp().slice(11), true, targets);
      dmSample.actions.add(repo, { rows: out.map((r) => dmSampleOf(repo, r)) });
      return out;
    },
    /** 登録後に直せるのはメモと送り状番号だけ（台帳 F 2026-10-08）。締める・取消と同じく機能ごとの操作 */
    updateSample(repo, { no, memo, trackingNo }: { no: string; memo: string; trackingNo: string }) {
      return dmSample.actions.update(repo, { id: no, memo, trackingNo, at: nowStamp(), by: OPS_USER });
    },
    /** 出荷週の受付を締める（受付済に出荷指示を作る） */
    closeWeek(repo, a: { mon: string } & By) {
      return dmSample.actions.closeWeek(repo, { mon: a.mon, at: nowStamp(), by: userOf(repo, a) });
    },

    /** 締めの取消（最初の発送日の前日まで。締め済を受付済に戻し、出荷指示を取り消す）。戻した件数を返す */
    reopenWeek(repo, { mon }: { mon: string }) {
      return dmSample.actions.reopenWeek(repo, { mon, today: smToday() });
    },

    /* ===== 倉庫在庫 ===== */
    /** 在庫の記録（共通データ dm.stock.moves に足す）。記録の ID を返す */
    addStockRec(repo, m: { wh: string; pid: string; kind: string; dir: string; qty: number; date: string; reason: string } & By) {
      if (!m.pid || !(m.qty > 0) || !m.reason.trim() || !m.date) throw new ApiError('入力内容を確認してください', 400);
      if (m.qty > 999999) throw new ApiError('数量は999,999以下で入れてください', 400);
      return move(repo, { wh: m.wh, pid: m.pid, kind: m.kind, qty: (m.dir === '増える' ? 1 : -1) * Math.floor(m.qty), on: m.date.replace(/-/g, '/'), reason: m.reason.trim() }, actor(m)).id;
    },
    /**
     * THOMAS在庫を取り込む：棚卸し日の終わりの倉庫在庫（共通データ・入荷の記録−出荷±在庫の記録。マイナスは 0）を、その日の在庫の起点（dm.stock.bases）にする。
     * デモではファイルを読まない。前回の取り込みより前の日は選べない（その間の出し入れが消えるため）
     */
    importStock(repo, a: { date: string } & By) {
      const { date } = a;
      if (date > TODAY()) throw new ApiError('棚卸し日に未来の日付は選べません', 400);
      const st = stock(repo);
      if (date < st.imp.date) throw new ApiError(`前回の取り込み（${st.imp.date}）より前の日は選べません`, 400);
      for (const l of stockLedgers(repo, { item: '商品' })) {
        dmStock.actions.setBase(repo, { warehouseId: l.warehouseId, itemId: l.itemId, qty: Math.max(0, stockAt(repo, l.warehouseId, l.itemId, date).qty), on: date });
      }
      repo.put(K.stock, 'state', { ...st, imp: { date, file: 'THOMAS_在庫状況_' + date.replace(/\//g, '') + '.csv', by: userOf(repo, a), at: nowStamp() } });
    },
    /** 在庫戻しの出荷指示（THOMAS用CSV）を作り、在庫戻しとして記録する */
    createReturn(repo, a: { date: string; to: string; lines: StockRet['lines'] } & By) {
      const { date, to, lines } = a;
      if (!date) throw new ApiError('出荷日を入れてください', 400);
      const ls = lines.filter((l) => l.qty > 0);
      if (!ls.length) throw new ApiError('選んだ商品の戻す数を入れてください', 400);
      /* 戻す数は余り（倉庫在庫の見込み）まで・整数（決定 W6） */
      const rows = stockView(repo).rows;
      for (const l of ls) {
        const c = rows.find((x) => (x.wh === l.wh || whIdOf(repo, x.wh) === whIdOf(repo, l.wh)) && x.pid === l.pid);
        if (!Number.isInteger(l.qty)) throw new ApiError(`${l.pid} の戻す数は整数で入れてください`, 400);
        if (!c || c.shortDate || l.qty > c.fin) throw new ApiError(`${l.pid}（${l.wh}）の戻す数 ${l.qty} が余り ${c && !c.shortDate ? c.fin : 0} を超えています`, 400);
      }
      const d = date.replace(/-/g, '/');
      const no = 'RT-' + d.replace(/\//g, '').slice(2) + '-' + String(repo.list(K.rets).length + 1).padStart(3, '0');
      repo.put(K.rets, no, { no, at: nowStamp(), date: d, to, lines: ls });
      ls.forEach((l) => move(repo, { wh: l.wh, pid: l.pid, kind: '在庫戻し', qty: -l.qty, on: d, reason: `出荷指示 ${no}（${to} へ戻す）` }, actor(a)));
      return no;
    },

  },
});
