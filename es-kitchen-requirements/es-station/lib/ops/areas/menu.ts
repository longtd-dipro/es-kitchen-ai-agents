import { ApiError, STALE } from '@/lib/api/errors';
import { nowStamp, today } from '@/lib/supplier/dates';
import delivery from '@/lib/domain/areas/delivery';
import order from '@/lib/domain/areas/order';
import dmMenu, { saveMenu as saveDmMenu } from '@/lib/domain/areas/menu';
import { addYm, getMenu, inactiveError, listMenus, nextAvgTarget, phaseOf, unmetOf } from '@/lib/domain/menu';
import dmMaster from '@/lib/domain/areas/master';
import { tripOf, type AltArgs, type AltStockIn } from '@/lib/domain/alt';
import type { AltRow, AltSetting, Delivery, KariApproval, MaterialOrder, MonthlyMenu, OrderPref, Product as DProduct, ProductOrder, ProductTag } from '@/lib/domain/types';
import { defineArea, toDocs, type DocRepo } from '../core/area';
import sample, { usedOf } from '@/lib/domain/areas/sample';
import { vmView } from './masters';
import {
  a1For, adjustOf, itemsOf, linesOf, matFor, materialsFor, menuFor, orderFor, prefFor, productsFor, sitesFor, slotKey, type MenuX,
} from '../menu/fromDomain';
import { menuEditView, type MenuEditSave } from '../menu/edit';
import { assertFresh, nextVersion } from '../core/concurrency';
import { calc, cancelReasonError, catErrors, fromIso, matError, matShipChecks, md, normTracking, placeCat, type CatDraft } from '../menu/logic';
import { cycleMonthAt, MAT_EXTRA_OPTION } from '@/lib/domain/charges';
import { isTrialCycle, matDueWarn, matLeadDays, matLocked, matNextDue, matNextOrdinal, matVer } from '@/lib/domain/matOrder';
import { notifyBranch } from '@/lib/domain/notify';
import dmStock from '@/lib/domain/areas/stock';
import type { AltDone, AltInput, AltRec, Category, Master, MatOrder, Menu, Order, SitePref, VmLayout } from '../menu/types';

/*
 * 領域 menu：メニュー管理（月間メニュー・商品注文管理・代替品設定・資材注文管理）と マスタ管理 ＞ 商品カテゴリ管理。
 * 元：部品/18_運営_メニュー注文.html
 *
 * 事実は共通データ（lib/domain・dm.*）から読み、書くときは domain の action を呼ぶ（lib/ops/menu/fromDomain.ts）：
 *   商品＝dm.master.products、拠点と便＝dm.org（子契約の channels）、サイクルの A1＝dm.delivery.cycles、
 *   月間メニュー＝dm.order.menus（共通データの area: menu の save／publish／delete／recalcBase／readiness／importCsv。基準注文数もここ）、
 *   商品注文＝dm.order.orders（order.saveOrder・ES登録済）、
 *   拠点の設定＝dm.order.prefs（order.savePref）、資材注文＝dm.delivery.materialOrders（delivery.placeMaterialOrder／updateMaterialOrder／cancelMaterialOrder）、
 *   商品カテゴリ＝dm.master.productCategories（商品マスタ・法人Web と同じ。もとは menu.cats）
 *   代替品設定＝dm.order.alts（共通データの order.applyAlt／altPreview。注文の行・配送の明細・追加発注・仕入先への請求・お知らせまで反映。lib/domain/alt.ts）
 *   自販機の列の構成＝dm.master.vmLayouts（機種マスタと同じ）、営業サンプルの件数＝dm.sample.quotas（発注・入荷の営業サンプルと同じ）、
 *   平均単価の目標＝メニューごと（dm.order.menus の avgTarget。新規作成の初期値は前月の値）
 * 共通データにないものは運営の kind に持つ：
 *   menu.menuBase（月間メニューの自販機の品数・公開したときの目標）
 *   （menu.alts は前の形の名残。読まない）
 */

/** 運営の代理登録をするアカウント（見本） */
const OPS_ID = 'Ad00010';
/** 操作したアカウント（OPS_ID はログインのない mock のときだけ）。サーバーは lib/server/access.ts の gate がログイン中のアカウントを args.by に入れる */
type By = { by?: string };
const actor = (a: unknown): string => { const b = (a as By | null | undefined)?.by; return typeof b === 'string' && b ? b : OPS_ID; };
/** メニューの「最終更新」（日時＋操作した人の名前）。ログインのない mock は「運営」 */
const updOf = (repo: DocRepo, a: unknown) => { const b = (a as By | null | undefined)?.by; return nowStamp() + ' ' + (typeof b === 'string' && b ? repo.get<{ name: string }>('dm.account.accounts', b)?.name ?? b : '運営'); };

const dmMenus = (repo: DocRepo) => listMenus(repo);
/** 拠点の値を取るサイクル＝受付中のメニューのサイクル（なければいちばん新しいメニュー） */
const siteCycle = (repo: DocRepo) => {
  const ms = dmMenus(repo).sort((a, b) => a.id.localeCompare(b.id));
  return (ms.find((m) => m.status === '公開中') ?? ms[ms.length - 1])?.id ?? today().slice(0, 7).replace('/', '-');
};
const prevYm = (ym: string) => { const [y, m] = ym.split('-').map(Number); const d = new Date(y, m - 2, 1); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`; };

function master(repo: DocRepo): Master {
  const cyc = siteCycle(repo);
  return {
    products: productsFor(repo, prevYm(cyc)),
    sites: sitesFor(repo, cyc),
    materials: materialsFor(repo),
    a1: a1For(repo),
    vmLayout: dmMaster.queries.vmLayouts(repo).map((v) => vmView(repo, v.id)).filter((x) => !!x) as VmLayout[],
  };
}
const menuX = (repo: DocRepo, ym: string) => repo.get<MenuX>('menu.menuBase', ym);
/** 月間メニューの版（同時更新の検知：E31）。保存のたびに更新日時・変更履歴が進む */
const menuVer = (m: MonthlyMenu) => `${m.updatedAt}|${m.log?.length ?? 0}`;
const menusOf = (repo: DocRepo) => dmMenus(repo).map((m) => menuFor(repo, m, menuX(repo, m.id))).sort((a, b) => (a.ym < b.ym ? 1 : -1));
function mustMenu(repo: DocRepo, ym: string) {
  const m = getMenu(repo, ym);
  if (!m) throw new ApiError('メニューが見つかりません', 404);
  return menuFor(repo, m, menuX(repo, ym));
}
/** 商品注文（拠点が今の拠点の一覧にあるもの） */
function ordersOf(repo: DocRepo, M: Master, ym?: string): Order[] {
  const C = calc(M), menus = menusOf(repo);
  return repo.list<ProductOrder>('dm.order.orders').filter((o) => (!ym || o.cycleMonth === ym) && M.sites.some((s) => s.id === o.branchId)).map((o) => {
    const s = C.site(o.branchId), menu = menus.find((m) => m.ym === o.cycleMonth);
    return orderFor(repo, o, s, menu ? C.prodsFor(s, menu) : []);
  });
}
/** 商品カテゴリ＝共通データの商品カテゴリ（dm.master.productCategories） */
const CATS = 'dm.master.productCategories';
const cats = (repo: DocRepo) => repo.list<Category>(CATS).sort((a, b) => a.order - b.order);
const quotaOf = (repo: DocRepo, ym: string) => sample.queries.quota(repo, { ym });
const matQ = (q: Record<string, number>) => Object.entries(q).map(([materialId, qty]) => ({ materialId, qty: Number(qty) || 0 }));

/** 商品注文を共通データに保存する（運営の代理登録＝ES登録済。合計・商品の条件は domain で確かめる。代替品の行は domain が残す）。adjust＝調整数（システム管理だけ。省くと今のまま） */
function saveOrderToDomain(repo: DocRepo, M: Master, o: Order, adjust: boolean, notify: boolean, by = OPS_ID) {
  const s = calc(M).site(o.site);
  order.actions.saveOrder(repo, { branchId: o.site, cycleMonth: o.ym, lines: linesOf(o, s), ...(adjust ? { adjust: adjustOf(o, s) } : {}), site: 'ops', accountId: by, notify });
}

/* ---------------- 代替品設定（共通データの order.applyAlt につなぐ） ---------------- */

/**
 * 代替商品の倉庫在庫・入荷予定（倉庫ごと）。共通データの倉庫在庫（dm.stock：THOMAS の棚卸し＋入荷の記録−便の出荷±在庫の記録）から、
 * これからの出荷の予定を引いた数と、発注の入荷予定（lib/domain/stock.ts の altStockIn・課題 2c-3）。
 * 発注は共通 DB の発注（仕入先サイトと同じ orders テーブル）＋この領域の発注（purchasing.orders）。同じ番号は1つ・追加発注は applyAlt が足す（knownOrders）
 */
function altStock(repo: DocRepo, pid: string): AltStockIn {
  return dmStock.queries.altStock(repo, { productId: pid });
}
const COMP = { order: '注文数量', stock: '残理論在庫' } as const;
const WHEN = { next: '次の便', date: '日付を指定', extra: '追加配送' } as const;
const ROWW = { next: '次の便', next2: 'その次の便', extra: '追加配送' } as const;
/** 画面の代替品設定の入力 → 共通データの applyAlt の引数（対象から外した行・行ごとの届け方は配送 ID に直す） */
function altArgsOf(repo: DocRepo, M: Master, A: AltInput, notify: boolean, by = OPS_ID): AltArgs {
  const c = A.cond, sites = calc(M);
  const toDelivery = (key: string) => {
    const o = repo.list<ProductOrder>('dm.order.orders').find((x) => key.startsWith(x.id) && sites.site(x.branchId)?.dl.some((d) => d.k === key.slice(x.id.length)));
    if (!o) return '';
    const d = sites.site(o.branchId).dl.find((x) => x.k === key.slice(o.id.length))!;
    return tripOf(repo, o.childContractId, `${d.t === 'frozen' ? '冷凍' : '冷蔵'}:${d.slot}`)?.id ?? '';
  };
  const override: AltArgs['override'] = {};
  Object.entries(A.rowWhen ?? {}).forEach(([k, v]) => { const id = toDelivery(k); if (id && v !== 'auto') override[id] = ROWW[v]; });
  return {
    productId: c.def, altProductId: c.alt, foundOn: c.found, from: c.from, to: c.to, scope: c.scope === 'lot' ? 'ロット単位' : '全ロット', lotNo: c.lot, reason: c.reason,
    mode: A.m.swap === 'exclude' ? '除外のみ' : '差し替え', comp: COMP[A.m.comp], when: WHEN[A.m.when], whenDate: A.m.whenDate ? fromIso(A.m.whenDate) : '',
    lotAction: A.m.lotAct === 'dispose' ? '廃棄' : '返品', createPo: A.createPo ?? true, notify,
    skip: Object.entries(A.off ?? {}).filter(([, v]) => v).map(([k]) => toDelivery(k)).filter(Boolean), override,
    stock: altStock(repo, c.alt), accountId: by,
  };
}
/** 共通データの代替品設定 → 画面の代替品設定の記録 */
const altRecOf = (a: AltSetting): AltRec => ({
  id: a.id,
  cond: { def: a.productId, alt: a.altProductId, found: a.foundOn, from: a.from, to: a.to, scope: a.scope === 'ロット単位' ? 'lot' : 'all', lot: a.lotNo, reason: a.reason },
  m: { comp: a.comp === '残理論在庫' ? 'stock' : 'order', when: a.when === '追加配送' ? 'extra' : a.when === '日付を指定' ? 'date' : 'next', whenDate: a.whenDate.replace(/\//g, '-'), swap: a.mode === '除外のみ' ? 'exclude' : 'swap', lotAct: a.lotAction === '廃棄' ? 'dispose' : 'return' },
});
const HOW_L: Record<AltRow['how'], string> = { 同じ便: '同じ便', 次の便: '次の便', 指定の便: '指定した日のあとの便', 追加配送: '追加配送', 入荷後の便: '入荷のあとの便', 届けない: '届けない' };
/**
 * 代替品設定の保存前の一覧（便ごと）。共通データの altPreview の行（rows）に、画面の行のキー（注文ID＋便）・法人・拠点・便の名前・お届け日を付ける。
 * all＝対象から外した便も含めた行、live＝外した便を除いた結果（在庫の不足で入荷のあとの便に回すなどはこちら）
 */
function altViewRows(repo: DocRepo, M: Master, all: AltRow[], live: AltRow[], skip: string[]) {
  const C = calc(M);
  const dOf = (id: string) => repo.get<Delivery>('dm.delivery.deliveries', id);
  return all.map((r0) => {
    const off = skip.includes(r0.deliveryId);
    const r = (!off && live.find((x) => x.deliveryId === r0.deliveryId)) || r0;
    const s = C.site(r.branchId), dl = s?.dl.find((x) => slotKey(x) === r.slot);
    const d = dOf(r.deliveryId), to = r.toDeliveryId && r.toDeliveryId !== r.deliveryId ? dOf(r.toDeliveryId) : undefined;
    const on = d?.deliverOn ?? '';
    const resent = r.resent ? '・出荷指示を再送 rev+1' : '';
    const when = r.how === '同じ便' ? `${on ? md(on) : ''} ${dl?.l ?? ''}（差し替え${resent}）`
      : r.how === '届けない' ? `送らない（除外のみ${resent}）`
        : r.how === '追加配送' ? '追加配送（別便・配送費は ES 負担）'
          : `${to ? md(to.deliverOn) + ' の便' : HOW_L[r.how]}に追加（${HOW_L[r.how]}）`;
    return {
      key: r.orderId + (dl?.k ?? r.slot), off, deliveryId: r.deliveryId, orderId: r.orderId, ym: d?.cycleMonth ?? '', branchId: r.branchId,
      corpName: s?.corpName ?? r.branchId, short: s?.short ?? '', dlvKind: s?.dlvKind ?? '', vm: s?.course === 'ESライト（自販機）',
      dlLabel: (on ? md(on) + ' ' : '') + (dl?.l ?? r.slot), pattern: r.pattern, qty: r.qty, altQty: r.altQty, when, note: r.note, short_: r.short,
    };
  }).sort((a, b) => a.dlLabel.localeCompare(b.dlLabel) || a.branchId.localeCompare(b.branchId));
}

/** 保存の結果の一覧（下流への反映） */
function altDoneOf(repo: DocRepo, a: AltSetting, orders: string[], deliveries: string[]): AltDone {
  const pn = (id: string) => repo.get<DProduct>('dm.master.products', id)?.name ?? id;
  const dp = pn(a.productId), ap = pn(a.altProductId), rows = a.rows;
  const by = (p: string) => rows.filter((x) => x.pattern === p);
  const sum = (xs: typeof rows, k: 'qty' | 'altQty') => xs.reduce((s, x) => s + x[k], 0);
  const short = a.shortage.filter((x) => x.short > 0);
  return {
    id: a.id, shortage: a.shortage, pos: a.poIds, warnings: a.warnings,
    msg: `${dp} → ${ap}。${new Set(rows.map((x) => x.branchId)).size}拠点・${rows.length}便に反映しました（① 差し替え ${by('① 差し替え').length}便・② 補償 ${by('② 補償').length}便・③ 除外のみ ${by('③ 除外のみ').length}便）。反映した内容は各注文の「代替品・補償の追加」と変更履歴で見られます。`,
    flow: [
      ['注文', `${orders.length}件の注文の行を直した（差替・補償・除外の行。代替元＝${dp}）`],
      ['配送データ', `明細を代替商品に（代替元つき）。追加配送 ${deliveries.length}件を作成（配送費は ES 負担）${deliveries.length ? `：${deliveries.join('・')}` : ''}`],
      ['出荷指示', rows.some((x) => x.resent) ? `送信済みの ${rows.filter((x) => x.resent).length}便は版番号つきで再送（rev+1）。ほかは次の出荷指示に載る` : '送信済みの便なし（次の出荷指示に載る）'],
      ['在庫・発注', short.length ? `不足 ${short.map((x) => `${x.warehouseId} ${x.short}個`).join('・')}。${a.poIds.length ? `追加発注 ${a.poIds.join('・')}（入荷予定 ${short[0].eta}）。入荷前の便は入荷のあとの便へ回し、法人へ知らせた` : '追加発注はしていない'}` : `${ap} の在庫・入荷予定で足りる（必要 ${sum(rows, 'altQty')}個）`],
      ['倉庫', `不良ロット（${a.scope}${a.lotNo ? ' ' + a.lotNo : ''}）を出荷停止・${a.lotAction === '返品' ? '仕入先へ返品' : '倉庫で廃棄'}`],
      ['仕入先', `不良控除（${a.lotAction}）：${dp} ${sum(rows, 'qty')}個 × 仕入単価（${a.claimId}・支払額から引く）`],
      ['拠点の在庫', a.disposals.length ? a.disposals.map((x) => `${x.branchId} ${x.qty}個：${x.how}`).join('／') + '（管理ロスにしない）' : '既納品の不良品なし'],
      ['請求', '差し替え＝元の商品の単価・補償＝請求書の実績精算に0円の行・除外のみ＝請求しない・追加配送の配送費＝ES 負担'],
      ['お客様', a.notify ? `メール・法人Webのお知らせで通知。お届け詳細・納品書・月次注文に「代替品（元：${dp}）」` : `通知していない（お届け詳細・納品書・月次注文には「代替品（元：${dp}）」と出る）`],
      ['配送の現場', `ドライバーアプリ・委託配送先ポータルの納品リストに「代替品（元：${dp}）」と回収・廃棄の指示`],
    ],
  };
}

export default defineArea({
  name: 'menu',
  /* 事実は共通データ。ここは共通データにない設定だけ */
  seed: () => ({
    'menu.alts': [],
  }),
  queries: {
    /** 画面の計算に使う固定のデータ（商品・拠点・資材マスタ・サイクル・平均単価の目標・自販機の列の構成） */
    master: (repo) => master(repo),
    /** 月間メニュー（新しい月から） */
    menus: (repo) => menusOf(repo),
    menu: (repo, a: { ym: string }) => menusOf(repo).find((m) => m.ym === a.ym) ?? null,
    /** 月間メニューの一覧（新しい月から）：いまのメニュー＋論理削除したメニュー（状態「削除済」。一覧の絞り込みで選んだときだけ出す。受付簿 #247） */
    menuList: (repo) => [
      ...menusOf(repo),
      ...dmMenu.queries.deleted(repo).map((m) => menuFor(repo, m as MonthlyMenu, undefined)),
    ].sort((a, b) => (a.ym < b.ym ? 1 : a.ym > b.ym ? -1 : a.status === '削除済' ? 1 : -1)),
    /** 新規登録で選べる年月：まだメニューがない月だけ（オーダーが締まった月は選べない。先12か月） */
    newMenuMonths: (repo) => {
      const cur = today().slice(0, 7).replace('/', '-'), have = new Set(dmMenus(repo).map((m) => m.id));
      return Array.from({ length: 13 }, (_, i) => addYm(cur, i)).filter((ym) => !have.has(ym) && `${addYm(ym, -1).replace('-', '/')}/15` >= today());
    },
    /**
     * 商品を外すときの確認（保存の前）：その商品を含む注文の件数。keep＝残る注文（登録済・ES登録済・調整数のある注文）、
     * rebuild＝作り直される注文（自動注文・お試し（自動））。注文の一覧は ids（商品注文管理へのリンクに使う）
     */
    impact: (repo, a: { ym: string; productIds: string[] }) => dmMenu.queries.impact(repo, { menuId: a.ym, productIds: a.productIds }),
    /** 公開の条件のうち満たしていないもの（共通データの menu.readiness） */
    readiness: (repo, a: { ym: string }) => dmMenu.queries.readiness(repo, { menuId: a.ym }),
    /** 基準注文数の合計・警告・公開の条件（共通データの menu.get） */
    menuInfo: (repo, a: { ym: string }) => dmMenu.queries.get(repo, { menuId: a.ym }),
    /** 商品追加：前回メニュー・前回連続 */
    prevInfo: (repo, a: { ym: string }) => dmMenu.queries.prevInfo(repo, { menuId: a.ym }),
    /** 商品タグ（商品タグのマスタ。注文の商品の絞り込みの選択肢：台帳 F） */
    tags: (repo) => repo.list<ProductTag>('dm.master.productTags').map((t) => t.name),
    /** 商品注文（ym を省くと全部） */
    orders: (repo, a: { ym?: string } | null) => ordersOf(repo, master(repo), a?.ym),
    order: (repo, a: { no: string }) => ordersOf(repo, master(repo)).find((o) => o.no === a.no) ?? null,
    /** 資材注文（注文日の新しい順） */
    mats: (repo) => repo.list<MaterialOrder>('dm.delivery.materialOrders').map((m) => matFor(repo, m)).sort((a, b) => (a.at < b.at ? 1 : a.at > b.at ? -1 : 0)),
    mat: (repo, a: { no: string }) => {
      const m = repo.get<MaterialOrder>('dm.delivery.materialOrders', a.no);
      return m ? matFor(repo, m) : null;
    },
    /**
     * 資材注文の新規登録・編集の前の確認：リードタイム・納品予定日の初期値・「何回目」（納品予定日のサイクル月）・お試しか・追加配送料・納品予定日の警告（休日・納品不可曜日・リードタイム未満）
     * due を省くと初期値の納品予定日。no＝直す注文（自分は数えない）
     */
    matPre: (repo, a: { site: string; due?: string; no?: string }) => {
      const t = today(), lead = matLeadDays(repo, a.site, t), def = matNextDue(repo, a.site, t);
      const due = a.due || def, mo = a.no ? repo.get<MaterialOrder>('dm.delivery.materialOrders', a.no) : undefined;
      const on = mo ? mo.orderedAt.slice(0, 10) : t;
      return {
        lead: mo ? matLeadDays(repo, a.site, on) : lead, def, due, nth: matNextOrdinal(repo, a.site, due, a.no ?? ''), trial: isTrialCycle(repo, a.site, cycleMonthAt(repo, due)),
        fee: repo.get<{ amountYen: number }>('dm.master.options', MAT_EXTRA_OPTION)?.amountYen ?? 0, warn: matDueWarn(repo, a.site, due, t),
      };
    },
    /** 商品カテゴリ（表示順）。法人Webの月次注文・商品マスタも同じカテゴリを使う */
    cats: (repo) => cats(repo),
    /** 代替品設定（共通データ dm.order.alts） */
    alts: (repo) => order.queries.alts(repo).map(altRecOf),
    /** 代替品設定の保存前の確認（便ごとの結果・在庫の見込み 必要数／倉庫在庫／入荷予定／不足・警告。何も保存しない） */
    altPreview: (repo, a: { alt: AltInput | null }) => {
      if (!a?.alt) return null;
      const M = master(repo), args = altArgsOf(repo, M, a.alt, false);
      const out = order.queries.altPreview(repo, args);
      /* 対象から外した便も一覧に出す（外さないときの結果。チェックを戻せるように） */
      const all = args.skip?.length ? order.queries.altPreview(repo, { ...args, skip: [] }) : out;
      return {
        rows: altViewRows(repo, M, all.setting.rows, out.setting.rows, args.skip ?? []),
        shortage: out.setting.shortage, warnings: out.setting.warnings,
        pos: out.pos.map((x) => ({ id: x.id, warehouseId: x.warehouseId, qty: x.qty, eta: x.eta })),
      };
    },
    /** 月間メニュー登録・編集の画面（Phase 1 画面 01〜09）のデータ。共通データのメニュー・商品・タグ・前回メニュー・基準注文数の重み */
    menuEdit: (repo, a: { ym: string }) => {
      const v = menuEditView(repo, a.ym);
      return v ? { ...v, vmN: menuX(repo, a.ym)?.vmN ?? null, ver: menuVer(v.menu) } : null;
    },
    /** 代替商品の候補（同じ温度帯・コース・倉庫＝suggested。ほかは警告つき） */
    altSuggest: (repo, a: { productId: string }) => order.queries.altSuggest(repo, { productId: a.productId }),
    /** 運営の TOP（ダッシュボード）のアラート：自動公開の3日前から、公開の条件が足りないメニュー */
    menuAlerts: (repo) => dmMenu.queries.alerts(repo, {}),
    /** 拠点の設定（共通データの注文の設定） */
    spref: (repo) => Object.fromEntries(repo.list<OrderPref>('dm.order.prefs').map((p) => [p.id, prefFor(repo, p)])) as Record<string, SitePref>,
    /** 営業サンプルの件数（月の合計）。null＝未設定 */
    smpQuota: (repo, a: { ym: string }) => quotaOf(repo, a.ym),
    /** 営業サンプルの受付済（宛先の数。発注・入荷 ＞ 営業サンプルの登録） */
    smpUsed: (repo, a: { ym: string }) => usedOf(sample.queries.list(repo, { ym: a.ym }), a.ym),
  },
  actions: {
    /**
     * 新規登録：選んだ年月のメニューを作る（編集中・非公開。まだメニューがない月だけ選べる：受付簿 #276）。
     * 前のメニューは複製しない（RD-MN-012・022：自動の引き継ぎ・過去メニューの複製はなし。前回の商品は「商品追加」の「前回メニュー」で絞って選ぶ）。
     * 商品は空から始める（2026-10-05 決定：「定番」の自動追加はしない。台帳 F「『定番』の商品」）。営業サンプル件数は月60件（共通データの menu.save）。
     * 受付は前月1日〜15日（共通データの既定）。平均単価の目標の初期値は前月の値。作ったサイクル月を返す
     */
    createMenu: (repo, a: { ym: string } & By) => {
      const ym = a?.ym;
      if (!/^\d{4}-\d{2}$/.test(ym ?? '')) throw new ApiError('年月を選んでください', 400);
      if (dmMenus(repo).some((m) => m.id === ym)) throw new ApiError(`${ym} のメニューはすでにあります`, 409);
      const pm = addYm(ym, -1).replace('-', '/');
      if (`${pm}/15` < today()) throw new ApiError('オーダーが締まった月のメニューは作れません', 400);
      saveDmMenu(repo, {
        menuId: ym, publishOn: `${pm}/01`, orderFrom: `${pm}/01`, orderTo: `${pm}/15`, corpPublish: '非公開', pdfs: [], accountId: actor(a),
        /* 平均単価の目標の初期値＝前月のメニューの値（なければ見本の既定） */
        avgTarget: nextAvgTarget(dmMenus(repo), ym), items: [],
      });
      repo.put<MenuX>('menu.menuBase', ym, { id: ym, upd: updOf(repo, a) });
      return ym;
    },
    /**
     * 月間メニュー登録・編集の保存（Phase 1 画面 07 保存の確認）。共通データの menu.save（基準注文数は手で直した値以外を入れ直す。合計は 50 でなくても保存できる：受付簿 #254・#256）。
     *   publish＝保存して公開（編集中のメニュー。公開の条件を画面の内容で先に確かめ、満たしていなければ何も保存しない。条件を見ない公開はない。公開は種類ごとの合計 50 も要る）
     *   公開済み（公開中・締切済）の保存でも、公開の条件のうち PDF・全商品が公開可能・メイン画像は確かめて止める（合計 50 は見ない：受付簿 #265）
     *   notify＝公開中のメニューを直したとき法人へ再通知する
     *   baseVersion・force＝同時更新の検知（E31）。画面が読み込んだ版と違えば 409（STALE）。force で上書き
     * 返り値：保存したあとの状態（トーストの文：非公開／自動公開されます／公開されました）・新しい版
     */
    saveMenuEdit: (repo, a: { ym: string; data: MenuEditSave; publish?: boolean; notify?: boolean; vmN?: Menu['vmN'] | null; baseVersion?: string; force?: boolean } & By) => {
      const cur = getMenu(repo, a.ym);
      if (!cur) throw new ApiError('メニューが見つかりません', 404);
      const phase = phaseOf(cur);
      if (phase !== '編集中' && phase !== '公開中' && phase !== '締切済') throw new ApiError(`オーダー締切日（${cur.orderTo.replace(/\//g, '-')}）を過ぎたため、メニューは変更できません。`, 409);
      assertFresh(menuVer(cur), a.baseVersion, a.force);
      const d = a.data, published = phase !== '編集中';
      if (!(d.publishOn <= d.orderFrom && d.orderFrom < d.orderTo)) throw new ApiError('メニュー公開日はオーダー開始日以前、開始日は締切日より前にしてください。', 400);
      const prod = (id: string) => repo.get<DProduct>('dm.master.products', id);
      /* 無効・削除済の商品が入っているメニューは、保存も公開もできない（受付簿 #285。メニューから外せば保存できる） */
      const inactive = inactiveError(d.items, prod);
      if (inactive) throw new ApiError(inactive, 400);
      if (published || a.publish) {
        const missing = unmetOf({ ...cur, ...d }, prod, repo.get<KariApproval>('dm.menu.kariApprovals', a.ym), published ? 'saved' : 'publish');
        if (missing.length) throw new ApiError(`公開の条件を満たしていません。${missing.join('／')}`, 400);
      }
      saveDmMenu(repo, {
        menuId: a.ym, items: d.items, publishOn: d.publishOn, orderFrom: d.orderFrom, orderTo: d.orderTo, pdfs: d.pdfs, avgTarget: d.avgTarget, noAdjust: d.noAdjust,
        /* 公開は publish（menu.publish）で行う。保存は今の法人向けの公開のまま（公開済みは変えない） */
        corpPublish: published ? undefined : d.corpPublish === '公開' ? '非公開' : d.corpPublish,
        notify: published && a.notify, accountId: actor(a),
      });
      repo.put<MenuX>('menu.menuBase', a.ym, { ...menuX(repo, a.ym), id: a.ym, base: undefined, ...(a.vmN ? { vmN: a.vmN } : {}), upd: updOf(repo, a) });
      let notified = 0;
      if (a.publish && !published) {
        const out = dmMenu.actions.publish(repo, { menuId: a.ym, accountId: actor(a) });
        notified = out.notified;
      }
      const after = getMenu(repo, a.ym)!;
      return { status: after.status, corpPublish: after.corpPublish, autoPublishOn: after.autoPublishOn, notified, ver: menuVer(after) };
    },
    /** 商品タグをその場で足す（共通データ master.addProductTag。同じ名前は 409） */
    addTag: (repo, a: { name: string }) => dmMaster.actions.addProductTag(repo, { name: a.name }),
    /** 商品タグを消す（月間メニューで使っていれば 409。商品マスタには商品タグを持たない：台帳 F 2026-10-08） */
    removeTag: (repo, a: { name: string }) => {
      const t = repo.list<ProductTag>('dm.master.productTags').find((x) => x.name === a.name);
      if (!t) throw new ApiError(`タグ「${a.name}」が見つかりません`, 404);
      return dmMaster.actions.removeProductTag(repo, { id: t.id });
    },
    /** 月間メニューを保存（編集中・公開中。公開中は notify＝true で法人に知らせ直す）。変えた基準注文数は「手で直した値」になる */
    saveMenu: (repo, a: { menu: Menu; notify?: boolean } & By) => {
      const M = master(repo), cur = mustMenu(repo, a.menu.ym);
      if (cur.status !== '編集中' && cur.status !== '公開中') throw new ApiError('編集中・公開中のメニューだけ変えられます', 409);
      const cs = calc(M).menuChecks(a.menu);
      if (cs.some((c) => c.state === 'ng')) throw new ApiError('保存できません。' + cs.filter((c) => c.state === 'ng').map((c) => c.label).join('・'), 400);
      const d = a.menu.dm;
      saveDmMenu(repo, {
        menuId: cur.ym, items: itemsOf(a.menu, cur.dm), publishOn: a.menu.pub, orderFrom: a.menu.from, orderTo: a.menu.to,
        ...(d ? { corpPublish: cur.status === '公開中' ? undefined : d.corpPublish, autoPublishOn: d.autoPublishOn, pdfs: d.pdfs } : {}),
        notify: a.notify, accountId: actor(a),
      });
      repo.put<MenuX>('menu.menuBase', cur.ym, { ...menuX(repo, cur.ym), id: cur.ym, base: undefined, vmN: a.menu.vmN, upd: updOf(repo, a) });
    },
    /** 公開する（公開の条件を満たしていないと 400。条件を見ない公開はない）。平均単価の目標は公開時の値で固定（共通データの menu.publish） */
    publishMenu: (repo, a: { ym: string } & By) => {
      const out = dmMenu.actions.publish(repo, { menuId: a.ym, accountId: actor(a) });
      repo.put<MenuX>('menu.menuBase', a.ym, { ...menuX(repo, a.ym), id: a.ym, upd: updOf(repo, a) });
      return { defaultOrders: out.defaultOrders, notified: out.notified };
    },
    /** 月間メニューを削除（論理削除。公開したメニュー・オーダーが締まった月は 409） */
    deleteMenu: (repo, a: { ym: string }) => {
      dmMenu.actions.delete(repo, { menuId: a.ym, accountId: OPS_ID });
      repo.remove('menu.menuBase', a.ym);
    },
    /** 基準注文数を自動で入れ直す（手で直した値はそのまま） */
    recalcBase: (repo, a: { ym: string } & By) => dmMenu.actions.recalcBase(repo, { menuId: a.ym, accountId: actor(a) }),
    /** 月間メニューの CSV取込（エラーがあれば何も保存しない） */
    importCsv: (repo, a: { ym: string; csv: string; overwrite?: boolean; notify?: boolean } & By) =>
      dmMenu.actions.importCsv(repo, { menuId: a.ym, csv: a.csv, overwrite: a.overwrite, notify: a.notify, accountId: actor(a) }),
    /** 毎日の処理（自動公開・運営への通知・路線便の「届きました」）。開発中に日付を指定して動かす */
    tick: (repo, a?: { today?: string; now?: string }) => dmMenu.actions.tick(repo, a),
    /** 営業サンプルの件数（月の合計）を保存（編集中・公開中のメニューだけ） */
    setSmpQuota: (repo, a: { ym: string; n: number }) => {
      const m = mustMenu(repo, a.ym);
      if (m.status !== '編集中' && m.status !== '公開中') throw new ApiError('このメニューは締切後のため、件数は変えられません。', 409);
      sample.actions.setQuota(repo, { ym: a.ym, n: a.n });
    },
    /**
     * 商品注文を ES が保存（共通データの order.saveOrder・ステータスは ES登録済。配送の明細も同じ中身になる）。
     * notify＝お客様（法人・拠点）へお知らせを出す（省くと出さない：受付簿 #281）。adjust＝調整数も保存する（システム管理だけ：lib/ops/apiPerm.ts。省くと今の調整数のまま）。便ごとの発注締め日（B7・D7）のあとの便は直せない
     */
    saveOrder: (repo, a: { order: Order; adjust?: boolean; notify?: boolean; baseVersion?: string; force?: boolean } & By) => {
      const M = master(repo);
      const cur = ordersOf(repo, M).find((o) => o.no === a.order.no);
      if (!cur) throw new ApiError('注文が見つかりません', 404);
      /* ほかの人が先に保存した・出荷指示に拾い上げられた（版が違う）ときは E31。上書きは force */
      assertFresh(cur.ver, a.baseVersion, a.force);
      const cs = calc(M).orderChecks(a.order);
      if (cs.some((c) => c.state === 'ng')) throw new ApiError(cs.filter((c) => c.state === 'ng').map((c) => c.label).join('\n'), 400);
      saveOrderToDomain(repo, M, a.order, !!a.adjust, !!a.notify, actor(a));
    },
    /** 拠点の設定を運営が直す（共通データの order.savePref。翌月のメニューから使う） */
    saveSpref: (repo, a: { site: string; pref: Omit<SitePref, 'upd'> } & By) => {
      const p = a.pref;
      order.actions.savePref(repo, { branchId: a.site, categories: p.cats, allowShortLife: p.short, priceRange: [p.price[0], p.price[1]], excluded: p.ex, updatedBy: actor(a), applyNext: p.next });
    },
    /**
     * 代替品設定を保存して反映する（共通データの order.applyAlt：注文の行・配送の明細・出荷指示の再送・追加配送・
     * 不足分の追加発注（dm.order.altPos。運営の発注一覧に出る）・仕入先への請求（不良控除）・法人へのお知らせ）
     */
    applyAlt: (repo, a: { alt: AltInput; notify: boolean } & By): AltDone => {
      /* お客様へ知らせるのは、運営がチェックしたときだけ（省いたら知らせない：受付簿 #282 ②） */
      const out = order.actions.applyAlt(repo, altArgsOf(repo, master(repo), a.alt, !!a.notify, actor(a)));
      return altDoneOf(repo, out.setting, out.orders, out.deliveries);
    },
    /**
     * 資材注文を ES が代理で登録（共通データの delivery.placeMaterialOrder。資材便の配送も作る）。登録した資材注文No を返す。
     * お試しの拠点も運営は登録できる（追加配送料 OP000036 は付かない：受付簿 #277）。notify＝お客様へ知らせる（省くと知らせない：#282 ②）
     */
    createMat: (repo, a: { site: string; q: Record<string, number>; notify?: boolean } & By) => {
      const err = matError(a); if (err) throw new ApiError(err, 400);
      const mo = delivery.actions.placeMaterialOrder(repo, { branchId: a.site, lines: matQ(a.q), accountId: actor(a) });
      /* お客様（法人・拠点）へ知らせるのは、運営がチェックしたときだけ（省いたら知らせない：受付簿 #282 ②） */
      if (a.notify) {
        const b = repo.get<{ name: string }>('dm.org.branches', a.site);
        notifyBranch(repo, a.site, { templateId: '', title: `資材注文 ${mo.id} を ES が登録しました`, body: `${b?.name ?? a.site} の資材注文（お届け予定日 ${mo.dueOn}）を ES が代わりに登録しました。注文履歴でご確認ください。`, link: { type: 'delivery', id: mo.deliveryId } });
      }
      return mo.id;
    },
    /**
     * 資材注文を保存。出荷待のときは 注文数・納品予定日（資材便の配送も直す：delivery.updateMaterialOrder）、
     * 発送日・送り状番号（ship）は システム管理だけが入れられる（権限は lib/ops/apiPerm.ts：ship があれば 権限付与の編集）。
     * 取消した注文は直せない（参照のみ）。出荷指示のあとは 発送日・送り状番号だけ。baseVersion が違えば E31（force で上書き）。
     * notify＝お客様（法人・拠点）へ知らせる（代替品設定と同じ形）
     */
    saveMat: (repo, a: { mat: MatOrder; baseVersion?: string; force?: boolean; notify?: boolean; ship?: { shippedOn: string; trackingNo: string } }) => {
      const mo = repo.get<MaterialOrder>('dm.delivery.materialOrders', a.mat.no);
      if (!mo) throw new ApiError('資材注文が見つかりません', 404);
      if (mo.status === '取消') throw new ApiError('取り消した資材注文は直せません（参照のみ）', 409);
      assertFresh(matVer(repo, mo), a.baseVersion, a.force);
      const draftDue = a.mat.due, q = Object.fromEntries(mo.lines.map((l) => [l.materialId, l.qty]));
      const sameQ = JSON.stringify(Object.entries(q).filter(([, n]) => n > 0).sort()) === JSON.stringify(Object.entries(a.mat.q).filter(([, n]) => n > 0).sort());
      const linesChanged = !sameQ || draftDue !== mo.dueOn;
      /* 開いたあとに出荷指示へ拾い上げられた：数・日付は直せない（E31・上書きもできない） */
      if (linesChanged && matLocked(repo, mo)) throw new ApiError('他のユーザーにより内容が更新されています。出荷指示を送ったあとは数・納品予定日を直せません。', 409, STALE);
      if (linesChanged) {
        const err = matError({ site: mo.branchId, q: a.mat.q }); if (err) throw new ApiError(err, 400);
        delivery.actions.updateMaterialOrder(repo, { id: mo.id, lines: matQ(a.mat.q), dueOn: draftDue, reason: '注文数・納品予定日を変更（運営）', accountId: OPS_ID });
      }
      if (a.ship) {
        const e = matShipChecks(a.ship.shippedOn, a.ship.trackingNo, mo.orderedAt);
        const msg = e.shippedOn ?? e.trackingNo; if (msg) throw new ApiError(msg, 400);
        const shippedOn = (a.ship.shippedOn ?? '').trim().replace(/\//g, '-'), trackingNo = normTracking(a.ship.trackingNo);
        const cur = repo.get<MaterialOrder>('dm.delivery.materialOrders', mo.id)!;
        if (shippedOn !== (cur.shippedOn ?? '') || trackingNo !== (cur.trackingNo ?? '')) {
          const { shippedOn: _s, trackingNo: _t, ...rest } = cur;
          void _s; void _t;
          repo.put('dm.delivery.materialOrders', mo.id, { ...rest, ...(shippedOn ? { shippedOn } : {}), ...(trackingNo ? { trackingNo } : {}) } as MaterialOrder);
          const d = repo.get<Delivery>('dm.delivery.deliveries', mo.deliveryId);
          if (d) repo.put('dm.delivery.deliveries', d.id, { ...d, internalMemo: [d.internalMemo, `${nowStamp()} 発送日・送り状番号を入力（発送日 ${shippedOn || '—'}・送り状番号 ${trackingNo || '—'}）`].filter(Boolean).join('\n') });
        }
      }
      if (a.notify) { /* チェックしたときだけ（初期値は知らせない：受付簿 #282 ②） */
        const b = repo.get<{ name: string }>('dm.org.branches', mo.branchId);
        notifyBranch(repo, mo.branchId, { templateId: '', title: `資材注文 ${mo.id} を ES が変更しました`, body: `${b?.name ?? mo.branchId} の資材注文の内容（数・お届け予定日・発送の情報）が変わりました。注文履歴でご確認ください。`, link: { type: 'delivery', id: mo.deliveryId } });
      }
      return matVer(repo, repo.get<MaterialOrder>('dm.delivery.materialOrders', mo.id)!);
    },
    /**
     * 資材注文を取り消す（資材便の配送も取消：delivery.cancelMaterialOrder）。理由は必須・500文字・絵文字なし。
     * 取り消したら、同じサイクル月の次の注文が繰り上がる（有料を付け直す）。出荷指示のあとは取り消せない（E31）
     */
    cancelMat: (repo, a: { no: string; reason: string; baseVersion?: string; force?: boolean }) => {
      const err = cancelReasonError(a.reason); if (err) throw new ApiError(err, 400);
      const mo = repo.get<MaterialOrder>('dm.delivery.materialOrders', a.no);
      if (!mo) throw new ApiError('資材注文が見つかりません', 404);
      assertFresh(matVer(repo, mo), a.baseVersion, a.force);
      if (mo.status !== '取消' && matLocked(repo, mo)) throw new ApiError('他のユーザーにより内容が更新されています。出荷指示を送ったあとは取り消せません。', 409, STALE);
      delivery.actions.cancelMaterialOrder(repo, { id: a.no, reason: a.reason.trim(), accountId: OPS_ID });
    },
    /** 商品カテゴリを登録・保存（表示順を途中に入れると、以降は繰り下がる） */
    saveCat: (repo, a: { d: CatDraft; baseVersion?: string; force?: boolean }) => {
      const list = cats(repo), err = catErrors(a.d, list);
      if (Object.keys(err).length) throw new ApiError(Object.values(err)[0], 400);
      /* 他の人が先に保存していたら E31（CSV取込は版を送らないので確かめない） */
      if (a.d.id) assertFresh(list.find((c) => c.id === a.d.id)?.ver, a.baseVersion, a.force);
      const next = placeCat(a.d, list);
      const saved = a.d.id || next.find((c) => !list.some((x) => x.id === c.id))?.id;
      next.forEach((c) => repo.put(CATS, c.id, c.id === saved ? { ...c, ver: nextVersion(list.find((x) => x.id === c.id)?.ver) } : c));
      /* 商品はカテゴリを ID で持つ（受付簿 #233）：名前を変えても商品は外れない。商品に持つ名前の写しだけ直す */
      for (const c of next) for (const p of repo.list<DProduct>('dm.master.products')) if (p.categoryId === c.id && p.category !== c.name) repo.put('dm.master.products', p.id, { ...p, category: c.name });
    },
    /** 商品カテゴリを削除（商品マスタに登録商品があるカテゴリは削除できない） */
    deleteCat: (repo, a: { id: string }) => {
      const list = cats(repo), c = list.find((x) => x.id === a.id);
      if (!c) throw new ApiError('カテゴリが見つかりません', 404);
      /* 削除できるのは登録商品が0件のカテゴリだけ（受付簿 #274。削除済の商品は数えず、その商品が持つカテゴリはそのまま残す） */
      const n = repo.list<DProduct>('dm.master.products').filter((p) => p.status !== '削除済' && (p.categoryId ? p.categoryId === c.id : p.category === c.name)).length;
      if (n) throw new ApiError(`登録商品が${n}件あるため削除できません。`, 409);
      repo.remove(CATS, a.id);
      list.filter((x) => x.id !== a.id).forEach((x, i) => repo.put(CATS, x.id, { ...x, order: i + 1 }));
    },
  },
});
