import { ApiError } from '@/lib/api/errors';
import { defineArea, toDocs, type DocRepo } from '@/lib/ops/core/area';
import { notifyBranch } from '../notify';
import { nowStamp, today } from '@/lib/supplier/dates';
import { buildChildContracts } from '../seed/delivery';
import { vmModelsOf } from '../product';
import { buildOrderSeed, eligible, ORDER_PREFS, slotKey, type EligibleCtx } from '../seed/order';
import { baseKindOf, defaultLines, getMenu, listMenus, menuIds, monthlyLimit, slotDiffProblem } from '../menu';
import type { AltPo, AltSetting, ChildContract, Contract, Cycle, Delivery, DeliveryLine, Loan, Model, MonthlyMenu, OrderLine, OrderPref, Pause, Product, ProductOrder, SupplierClaim } from '../types';
import { adjustLinesOf, ALT_POS, ALTS, altBillRows, altSuggest, applyAlt, CLAIMS, countsToLimit, isNormal, toDeliveryLines, type AltArgs } from '../alt';
import { routeOfSlot } from '../route';

/*
 * 月次注文（area: order）。kind：order.menus／order.orders／order.prefs
 * 法人Web：月間メニューを見て、便ごとに商品と個数を決める（受付期間＝前月1日〜15日・公開中のメニューだけ）。
 * 月の合計は上限（1回の食数 × 配送の回数）まで。便ごとの数は自由（lib/domain/menu.ts の monthlyLimit）。
 * 保存すると、その便の配送（予定）の明細と予定数も同じ中身にする（倉庫・ドライバーが見る品目と同じになる）。
 * 月間メニューの作成・公開・基準注文数・公開の条件は area: menu（lib/domain/areas/menu.ts）。
 * 代替品設定（dm.order.alts・追加発注 dm.order.altPos・仕入先への請求 dm.order.supplierClaims）は lib/domain/alt.ts：
 *   注文の行の kind＝通常／差替／補償／除外。法人・運営が注文を保存しても、代替品の行（通常でない行）はそのまま残す
 */

const orders = (r: DocRepo) => r.list<ProductOrder>('dm.order.orders');
const menuOf = (r: DocRepo, ym: string) => getMenu(r, ym);
const productsOf = (r: DocRepo, ids: string[]) => ids.map((id) => r.get<Product>('dm.master.products', id)).filter(Boolean) as Product[];
/** 選べる商品を決める材料（商品マスタ・拠点に置いている自販機） */
export const eligibleCtx = (r: DocRepo, branchId: string): EligibleCtx => ({
  product: (id) => r.get<Product>('dm.master.products', id),
  vmModelIds: vmModelsOf(r.list<Loan>('dm.org.loans'), r.list<Model>('dm.master.models'), branchId),
});

/** 子契約の便（温度帯:枠 → 食数・お届け日） */
export function slotsOf(r: DocRepo, cc: ChildContract) {
  const ds = r.list<Delivery>('dm.delivery.deliveries').filter((d) => d.childContractId === cc.id && !d.parentId);
  return cc.channels.flatMap((ch) => ch.slots.map((slot) => {
    const key = slotKey(ch.temp, slot);
    const d = ds.find((x) => x.slot === slot && x.temp === ch.temp);
    return { key, temp: ch.temp, warehouseId: routeOfSlot(ch, slot).warehouseId, slot, meals: ch.mealsPerDelivery, deliverOn: d?.deliverOn ?? '', deliveryId: d?.id ?? '' };
  }));
}

/**
 * 代替品設定で外した商品（不良商品）：対象期間（出荷日）に入る便には、法人・運営の注文で入れ直せない。
 * 返り値＝便のキー（温度帯:枠）→ 品番 → 代替品設定の ID。スコープ（全ロット・ロット単位）は問わない（倉庫で良いロットを選べないため）
 */
export function altBlocked(r: DocRepo, cc: ChildContract): Map<string, Map<string, string>> {
  const out = new Map<string, Map<string, string>>();
  const alts = r.list<AltSetting>(ALTS);
  if (!alts.length) return out;
  for (const s of slotsOf(r, cc)) {
    const d = s.deliveryId ? r.get<Delivery>('dm.delivery.deliveries', s.deliveryId) : undefined;
    if (!d) continue;
    for (const a of alts) {
      if (d.shipOn < a.from || d.shipOn > a.to) continue;
      if (!out.has(s.key)) out.set(s.key, new Map());
      out.get(s.key)!.set(a.productId, a.id);
    }
  }
  return out;
}
/** 便に入れられない商品か（今の注文にその便の通常の行があるもの＝代替品設定で対象から外した便は、その数まではそのまま） */
const blockedIn = (blocked: Map<string, Map<string, string>>, cur: ProductOrder | null | undefined, slot: string, productId: string) =>
  blocked.get(slot)?.has(productId) && !(cur?.lines.some((l) => isNormal(l) && l.slot === slot && l.productId === productId && l.qty > 0));

/** その月に配送する契約か（有効・解約手続き中・その月から休止に入る利用休止で、休止の月でない・取り消した子契約でない） */
export function deliversIn(r: DocRepo, cc: ChildContract) {
  const c = r.get<Contract>('dm.org.contracts', cc.contractId);
  return !!c && !cc.canceled && ['有効', '解約手続き中', '利用休止'].includes(c.status)
    && !r.list<Pause>('dm.org.pauses').some((p) => p.contractId === c.id && p.fromCycle <= cc.cycleMonth && cc.cycleMonth <= p.toCycle)
    /* 解約日のあとのサイクル（確定・請求済で子契約を残した月）は配送しない */
    && !(c.status === '解約手続き中' && c.endOn && (r.get<{ a1: string }>('dm.delivery.cycles', cc.cycleMonth)?.a1 ?? `${cc.cycleMonth.replace('-', '/')}/01`) > c.endOn);
}

/** 予定・出荷待の配送の明細と予定数を注文と同じにする（除外の行・追加配送の行は除く。代替品の行は代替元つき） */
export function syncDeliveryLines(r: DocRepo, slots: ReturnType<typeof slotsOf>, lines: ProductOrder['lines']) {
  for (const s of slots) {
    const d = s.deliveryId ? r.get<Delivery>('dm.delivery.deliveries', s.deliveryId) : undefined;
    if (!d || !['予定', '出荷待'].includes(d.status)) continue;
    r.list<DeliveryLine>('dm.delivery.lines').filter((l) => l.deliveryId === d.id).forEach((l) => r.remove('dm.delivery.lines', l.id));
    /* 調整数（サービスで足す数）も明細・予定数に入れる（出荷指示・発注・理論在庫に反映。請求・月の上限・便の差には入れない） */
    const adj = adjustLinesOf(orders(r).find((o) => o.childContractId === d.childContractId));
    const mine = toDeliveryLines(d.id, [...lines, ...adj].filter((l) => l.slot === s.key && !l.deliveryId));
    mine.forEach((l) => r.put<DeliveryLine>('dm.delivery.lines', l.id, l));
    r.put<Delivery>('dm.delivery.deliveries', d.id, { ...d, plannedQty: mine.reduce((a, l) => a + l.plannedQty, 0) });
  }
}

/**
 * 運営が直せない（締めた）便のキー（温度帯:枠）。「締め」＝発注締め日（便ごと）：便が前半（A・B週）の分は B7、後半（C・D週）の分は D7 のあと
 * （台帳 H「運営の注文の編集は発注締め日まで」・受付簿 #264・#270）。b7・d7＝そのサイクルの暦（dm.delivery.cycles）
 */
export function closedSlots(r: DocRepo, cycleMonth: string, slotKeys: string[], day = today()): Set<string> {
  const c = r.get<Cycle>('dm.delivery.cycles', cycleMonth);
  const out = new Set<string>();
  if (!c) return out;
  for (const k of slotKeys) {
    const w = (k.split(':')[1] ?? '')[0];
    if (day > (w === 'A' || w === 'B' ? c.b7 : c.d7)) out.add(k);
  }
  return out;
}

/**
 * デフォルトの注文を作る・作り直す（メニューを公開したとき・公開中のメニューの基準注文数を変えたとき）。
 * 注文がない拠点＝デフォルト（お試しはお試し（自動））で作る、デフォルト・お試し（自動）のままの注文＝基準注文数で作り直す。登録済・ES登録済は変えない
 */
export function refreshDefaultOrders(r: DocRepo, ym: string, only?: string[], opt?: { kinds?: ProductOrder['status'][]; why?: string }) {
  const menu = menuOf(r, ym);
  if (!menu) return 0;
  let n = 0;
  /* 作り直す注文の種類（既定は自動注文＝デフォルトとお試し（自動）の両方）。標準数だけ変わったときは自動注文だけ（お試し（自動）は標準数を使わない：台帳 F・受付簿 #266） */
  const kinds = opt?.kinds ?? ['デフォルト', 'お試し（自動）'];
  /* only＝この子契約だけ作り直す（公開前の月：一括変更・プランの変更で便が変わった子契約。ほかの拠点のデフォルトは公開のときに作る） */
  for (const cc of r.list<ChildContract>('dm.org.childContracts').filter((x) => x.cycleMonth === ym && deliversIn(r, x) && (!only || only.includes(x.id)))) {
    const id = `O-${ym.replace('-', '')}-${cc.branchId}`;
    const cur = r.get<ProductOrder>('dm.order.orders', id);
    if (cur && !kinds.includes(cur.status)) continue;
    /* 調整数のある注文は作り直さない（登録済・ES登録済・取消も上の条件で作り直さない：受付簿 #266） */
    if (cur?.adjust?.some((x) => x.qty > 0)) continue;
    const pref = r.get<OrderPref>('dm.order.prefs', cc.branchId);
    const trial = cc.kind === 'お試しキャンペーン', ctx = eligibleCtx(r, cc.branchId), slots = slotsOf(r, cc);
    /* 代替品設定の対象（不良商品）の便には入れない */
    const blocked = altBlocked(r, cc);
    const lines = [
      ...defaultLines(menu, baseKindOf(cc, pref), slots.map((s) => ({ key: s.key, meals: s.meals, ids: eligible(menu, cc, s, pref, ctx).map((p) => p.id).filter((id) => !blocked.get(s.key)?.has(id)) })), trial),
      /* 代替品の行はそのまま */
      ...(cur?.lines.filter((l) => !isNormal(l)) ?? []),
    ];
    if (cur && JSON.stringify(cur.lines) === JSON.stringify(lines)) continue;
    const at = nowStamp();
    r.put<ProductOrder>('dm.order.orders', id, {
      id, branchId: cc.branchId, childContractId: cc.id, cycleMonth: ym, status: trial ? 'お試し（自動）' : 'デフォルト', lines, updatedAt: at, updatedBy: 'system',
      log: [{
        at, by: 'system', what: cur ? '作り直し' : trial ? 'お試しのオーダーを作成' : 'オーダー受付開始',
        detail: `${cur ? (opt?.why ?? '基準注文数で作り直し') + '・' : ''}自動注文（基準注文数）・合計 ${lines.reduce((a, l) => a + l.qty, 0)}個`,
        ...(cur ? { item: '注文内容', before: `合計 ${cur.lines.filter(countsToLimit).reduce((a, l) => a + l.qty, 0)}個`, after: `合計 ${lines.reduce((a, l) => a + l.qty, 0)}個`, why: opt?.why ?? '基準注文数が変わったため' } : {}),
      }, ...(cur?.log ?? [])],
    });
    syncDeliveryLines(r, slots, lines);
    n++;
  }
  return n;
}

/**
 * 基準数のパターン（通常／短消費期限なし）を拠点の注文の設定に入れる（REQ-CT-300・2026/10/02）。
 * 契約（申込）の時に決め、変えられるのは運営だけ（法人Web の注文の設定では変えない）。料金は変わらない。
 * 注文の設定がまだない拠点は既定（全カテゴリ・100〜200円・除く商品なし）で作る。ほかの項目はそのまま
 */
export function setBasePattern(r: DocRepo, a: { branchId: string; noShortLife: boolean; by: string }): OrderPref {
  if (!r.get('dm.org.branches', a.branchId)) throw new ApiError('拠点が見つかりません', 404);
  const cur = r.get<OrderPref & { applyNext?: boolean }>('dm.order.prefs', a.branchId);
  if (cur && cur.allowShortLife === !a.noShortLife) return cur;
  const next: OrderPref & { applyNext: boolean } = {
    id: a.branchId, categories: cur?.categories ?? null, allowShortLife: !a.noShortLife, priceRange: cur?.priceRange ?? [100, 200], excluded: cur?.excluded ?? [],
    updatedAt: nowStamp(), updatedBy: a.by, applyNext: cur?.applyNext ?? false,
  };
  r.put('dm.order.prefs', a.branchId, next);
  return next;
}
/** 基準数のパターンの表示（REQ-CT-300） */
export const BASE_PATTERNS = ['通常', '短消費期限なし'] as const;
export const basePatternOf = (pref: Pick<OrderPref, 'allowShortLife'> | null | undefined) => (pref && pref.allowShortLife === false ? '短消費期限なし' : '通常');

export default defineArea({
  name: 'order',
  seed: () => {
    const s = buildOrderSeed(buildChildContracts());
    /* 代替品設定の見本は lib/domain/registry.ts（ほかの領域の見本を入れたあとに applyAlt で作る） */
    return { 'dm.order.menus': toDocs(s.menus), 'dm.order.orders': toDocs(s.orders), 'dm.order.prefs': toDocs(ORDER_PREFS), [ALTS]: [], [ALT_POS]: [], [CLAIMS]: [] };
  },
  queries: {
    menus: (r): MonthlyMenu[] => listMenus(r),
    /** 月間メニュー（商品の中身付き。商品は表示順） */
    menu(r, { cycleMonth }: { cycleMonth: string }) {
      const m = menuOf(r, cycleMonth);
      if (!m) throw new ApiError(`${cycleMonth} のメニューがありません`, 404);
      return { menu: m, products: productsOf(r, menuIds(m)) };
    },
    /**
     * 法人Web の商品注文の画面：注文・選べる商品（便ごと）・便のお届け日・注文の設定・直せるか
     */
    forBranch(r, { branchId, cycleMonth }: { branchId: string; cycleMonth: string }) {
      const cc = r.list<ChildContract>('dm.org.childContracts').find((x) => x.branchId === branchId && x.cycleMonth === cycleMonth && !x.canceled);
      if (!cc) throw new ApiError(`${cycleMonth} の契約がありません`, 404);
      const menu = menuOf(r, cycleMonth);
      const order = orders(r).find((o) => o.childContractId === cc.id) ?? null;
      const pref = r.get<OrderPref>('dm.order.prefs', branchId) ?? null;
      const open = !!menu && menu.status === '公開中' && menu.orderFrom <= today() && today() <= menu.orderTo;
      const trial = cc.kind === 'お試しキャンペーン';
      const ctx = eligibleCtx(r, branchId);
      const blocked = altBlocked(r, cc);
      return {
        childContract: cc, menu: menu ?? null, order, pref,
        /** 月の注文の上限（1回の食数 × 配送の回数） */
        limit: monthlyLimit(cc),
        /** products＝選べる商品（代替品設定の対象の不良商品は除く）、blocked＝代替品設定で入れられない商品（品番・代替品設定 ID） */
        slots: slotsOf(r, cc).map((s) => ({
          ...s,
          products: menu ? eligible(menu, cc, s, pref ?? undefined, ctx).map((p) => p.id).filter((id) => !blockedIn(blocked, order, s.key, id)) : [],
          blocked: [...(blocked.get(s.key) ?? new Map<string, string>())].map(([productId, altId]) => ({ productId, altId })),
        })),
        /** 直せるか（受付期間内・お試しは法人は参照のみ） */
        editable: open && !trial,
        reason: !menu ? 'メニューがまだありません' : !open ? `受付期間（${menu.orderFrom}〜${menu.orderTo}）の外です` : trial ? 'お試しの注文は運営が作ります（参照のみ）' : '',
      };
    },
    /** 運営：注文の一覧 */
    list: (r, a?: { cycleMonth?: string; status?: ProductOrder['status'] }) =>
      orders(r).filter((o) => (!a?.cycleMonth || o.cycleMonth === a.cycleMonth) && (!a?.status || o.status === a.status))
        .map((o) => ({ ...o, total: o.lines.reduce((s, l) => s + l.qty, 0) })),
    prefs: (r, a?: { branchId?: string }) => r.list<OrderPref>('dm.order.prefs').filter((p) => !a?.branchId || p.id === a.branchId),
    /** 代替品設定（新しい順） */
    alts: (r) => r.list<AltSetting>(ALTS).sort((a, b) => b.id.localeCompare(a.id)),
    /** 代替商品の候補（同じ温度帯・コース・倉庫＝suggested。ほかの商品は警告つき） */
    altSuggest: (r, { productId }: { productId: string }) => altSuggest(r, productId),
    /** 代替品設定の保存前の確認（便ごとの結果・在庫の見込み・不足・警告。何も保存しない） */
    altPreview: (r, a: AltArgs) => applyAlt(r, { ...a, dryRun: true }),
    /** 代替品の不足分の追加発注 */
    altPos: (r, a?: { altId?: string }) => r.list<AltPo>(ALT_POS).filter((x) => !a?.altId || x.altId === a.altId),
    /** 仕入先への請求（不良控除。ym＝不良発覚の月） */
    supplierClaims: (r, a?: { ym?: string; supplierId?: string }) =>
      r.list<SupplierClaim>(CLAIMS).filter((x) => (!a?.ym || x.ym === a.ym) && (!a?.supplierId || x.supplierId === a.supplierId)),
    /** 代替品の請求の行（差替＝元の商品の単価・補償＝0円・除外は出さない） */
    altBill: (r, a: { branchId?: string; cycleMonth?: string }) => altBillRows(r, a),
  },
  actions: {
    /**
     * 商品注文の保存。site＝corp（法人Web）／ops（運営の代理登録＝ES登録済）。
     * メニューにあって便の倉庫・温度帯・コース・自販機に合う商品だけ（seed/order.ts の eligible）。
     * 月の合計は上限（1回の食数 × 配送の回数）まで。便ごとの数はばらついてよい
     */
    saveOrder(r, a: { branchId: string; cycleMonth: string; lines: { productId: string; slot: string; qty: number }[]; site: 'corp' | 'ops'; accountId: string; adjust?: { productId: string; slot: string; qty: number }[]; why?: string; notify?: boolean }) {
      const cc = r.list<ChildContract>('dm.org.childContracts').find((x) => x.branchId === a.branchId && x.cycleMonth === a.cycleMonth && !x.canceled);
      const menu = menuOf(r, a.cycleMonth);
      if (!cc || !menu) throw new ApiError('このサイクルの契約・メニューがありません', 404);
      const ops = a.site === 'ops';
      if (a.site === 'corp') {
        if (menu.status !== '公開中' || today() < menu.orderFrom || today() > menu.orderTo) throw new ApiError(`受付期間（${menu.orderFrom}〜${menu.orderTo}）の外です`, 409);
        if (cc.kind === 'お試しキャンペーン') throw new ApiError('お試しの注文は直せません（運営が作ります）', 403);
      }
      const id = `O-${a.cycleMonth.replace('-', '')}-${a.branchId}`;
      const prev = r.get<ProductOrder>('dm.order.orders', id);
      /* 取消した注文（休止・解約）は参照のみ */
      if (prev?.status === '取消') throw new ApiError('取消した注文は編集できません（参照のみです）。', 409);
      const pref = r.get<OrderPref>('dm.order.prefs', a.branchId);
      const slots = slotsOf(r, cc);
      if (a.lines.some((l) => !slots.some((s) => s.key === l.slot) || !Number.isInteger(l.qty) || l.qty < 0)) throw new ApiError('便・個数が正しくありません', 400);
      /* 画面から来る行は通常の行だけ（代替品の行は代替品設定で作る） */
      const lines: OrderLine[] = a.lines.filter((l) => l.qty > 0).map((l) => ({ productId: l.productId, slot: l.slot, qty: l.qty }));
      const ctx = eligibleCtx(r, a.branchId);
      const hadIn = (slot: string, productId: string) => prev?.lines.filter((x) => isNormal(x) && x.slot === slot && x.productId === productId).reduce((s, x) => s + x.qty, 0) ?? 0;
      for (const s of slots) {
        const ok = eligible(menu, cc, s, pref, ctx).map((p) => p.id);
        /* メニューから外れた商品は注文に残る。数は減らす・0にするだけ（増やせない：受付簿 #266） */
        const bad = lines.find((l) => l.slot === s.key && !ok.includes(l.productId) && l.qty > hadIn(l.slot, l.productId));
        if (bad) {
          const gone = !menuIds(menu).includes(bad.productId);
          throw new ApiError(gone ? `${r.get<Product>('dm.master.products', bad.productId)?.name ?? bad.productId}はメニューから外れたため、数を増やせません（減らす・0にするだけです）。` : `${s.deliverOn || s.slot} の便に ${bad.productId} は入れられません`, 400);
        }
      }
      /* 運営の編集は便ごとの発注締め日（前半の便 B7・後半の便 D7）まで。締めた便は数も調整数も変えられない（変更は代替品設定：台帳 H・受付簿 #264・#270） */
      const shut = ops ? closedSlots(r, a.cycleMonth, slots.map((s) => s.key)) : new Set<string>();
      const sumBy = (xs: { productId: string; slot: string; qty: number }[], slot: string) => {
        const m = new Map<string, number>();
        xs.filter((x) => x.slot === slot && x.qty > 0).forEach((x) => m.set(x.productId, (m.get(x.productId) ?? 0) + x.qty));
        return JSON.stringify([...m].sort());
      };
      for (const k of shut) {
        const changed = sumBy(lines, k) !== sumBy((prev?.lines ?? []).filter(isNormal), k)
          || (a.adjust !== undefined && sumBy(a.adjust, k) !== sumBy(prev?.adjust ?? [], k));
        if (changed) throw new ApiError(`${slots.find((s) => s.key === k)?.deliverOn ?? k}の便は発注締め日を過ぎたため、直せません。変更は代替品設定を使ってください。`, 409);
      }
      /* 代替品設定の対象（不良商品）は、その便に入れ直せない（今の注文にある通常の行の数まではそのまま） */
      const blocked = altBlocked(r, cc);
      for (const l of lines) {
        const altId = blocked.get(l.slot)?.get(l.productId);
        if (!altId) continue;
        const had = hadIn(l.slot, l.productId);
        if (l.qty <= had) continue;
        const s = slots.find((x) => x.key === l.slot);
        const pn = r.get<Product>('dm.master.products', l.productId)?.name ?? l.productId;
        throw new ApiError(`${s?.deliverOn || l.slot} の便の ${pn}（${l.productId}）は代替品設定（${altId}）の対象の商品のため、注文に入れられません。代替品は「代替品（元：${pn}）」としてお届けします`, 409);
      }
      /* 代替品の行（差替・補償・除外）は残す。差替は月の合計に数える */
      const kept = prev?.lines.filter((l) => !isNormal(l)) ?? [];
      /* 登録の条件（台帳 E 2026-10-05）：合計＝月のお届け数（1回の食数 × 配送の回数）、便ごとの数の差は温度帯ごとに ±1 以内。調整数は数えない */
      const counted = [...lines, ...kept].filter(countsToLimit);
      const total = counted.reduce((x, l) => x + l.qty, 0), limit = monthlyLimit(cc);
      if (total !== limit) throw new ApiError(ops ? `合計が月のお届け数（${limit}個）と同じになるように入力してください。` : `今月の注文の合計（${total}個）が月のお届け数（${limit}個＝1回の食数 × 配送の回数）と同じではありません。${total > limit ? `${total - limit}個減らして` : `${limit - total}個増やして`}ください`, 400);
      const diffNg = slotDiffProblem(cc, counted);
      if (diffNg) throw new ApiError(ops ? '便ごとの数の差が1個以内になるように入力してください。' : diffNg, 400);
      /* 調整数：システム管理が0以上の整数を自由に入れる。上限＝プランの食数。冷凍の便にも足せる（#282）・お試し（自動）には足せない（受付簿 #263・#270・#272・#282） */
      let adjust = prev?.adjust;
      if (a.adjust !== undefined) {
        if (!ops) throw new ApiError('この操作を行う権限がありません。', 403);
        const adj = a.adjust.filter((x) => x.qty > 0);
        if (a.adjust.some((x) => !Number.isInteger(x.qty) || x.qty < 0 || !slots.some((s) => s.key === x.slot))) throw new ApiError('便・個数が正しくありません', 400);
        if (adj.length && cc.kind === 'お試しキャンペーン') throw new ApiError('お試し（自動）の注文には調整数を足せません。', 409);
        if (adj.reduce((s, x) => s + x.qty, 0) > limit) throw new ApiError(`調整数は0〜${limit}の範囲で入力してください。`, 400);
        for (const x of adj) {
          const s = slots.find((y) => y.key === x.slot)!;
          if (!eligible(menu, cc, s, pref, ctx).some((p) => p.id === x.productId) && !(prev?.adjust ?? []).some((y) => y.slot === x.slot && y.productId === x.productId)) throw new ApiError(`${s.deliverOn || s.slot} の便に ${x.productId} は入れられません`, 400);
        }
        adjust = adj.map((x) => ({ productId: x.productId, slot: x.slot, qty: x.qty }));
      }
      const at = nowStamp();
      const prevTotal = (prev?.lines ?? []).filter(countsToLimit).reduce((x, l) => x + l.qty, 0);
      const adjSum = (xs: { qty: number }[] | undefined) => (xs ?? []).reduce((x, l) => x + l.qty, 0);
      const adjChanged = JSON.stringify(adjust ?? []) !== JSON.stringify(prev?.adjust ?? []);
      /* 数（通常の行）が変わらず調整数だけ足した・直したときは、注文の中身は変わらない：ステータス（自動注文など）はそのまま・登録の履歴・お知らせは出さない */
      const canon = (xs: { productId: string; slot: string; qty: number }[]) => JSON.stringify(xs.filter((x) => x.qty > 0).map((x) => [x.productId, x.slot, x.qty]).sort());
      const onlyAdjust = !!prev && adjChanged && canon(lines) === canon(prev.lines.filter(isNormal));
      const next: ProductOrder = {
        id, branchId: a.branchId, childContractId: cc.id, cycleMonth: a.cycleMonth, status: onlyAdjust ? prev!.status : ops ? 'ES登録済' : '登録済', lines: [...lines, ...kept],
        ...(adjust?.length ? { adjust } : {}),
        updatedAt: at, updatedBy: a.accountId,
        log: [
          ...(adjChanged ? [{ at, by: a.accountId, what: '調整数を変更', detail: `調整数 ${adjSum(prev?.adjust)}個 → ${adjSum(adjust)}個（請求しない）`, item: '調整数', before: `${adjSum(prev?.adjust)}個`, after: `${adjSum(adjust)}個`, why: a.why ?? '' }] : []),
          ...(onlyAdjust ? [] : [{ at, by: a.accountId, what: ops ? 'ES が代理で登録' : '商品注文を登録', detail: `合計 ${total}個`, item: '注文内容', before: prev ? `合計 ${prevTotal}個` : '—', after: `合計 ${total}個`, why: ops ? (a.why ?? '') : '' }]),
          ...(prev?.log ?? []),
        ],
      };
      r.put('dm.order.orders', id, next);
      /* オーダー登録通知（旧システムの「オーダー登録通知」・すぐ）：法人Web の登録・更新も、運営の代理登録も拠点と法人へ */
      const act = prev && ['登録済', 'ES登録済'].includes(prev.status) ? '更新' : '登録';
      const bName = r.get<{ name: string }>('dm.org.branches', a.branchId)?.name ?? a.branchId;
      /* 運営の代理登録・変更は、運営が「お客様へ知らせる」を選んだとき（notify）だけお知らせを作る（受付簿 #281。初期値は送らない）。変更履歴は常に残す */
      if (onlyAdjust) { /* お知らせなし */ } else if (ops) { if (a.notify) notifyBranch(r, a.branchId, { templateId: 'order_registered', title: `${a.cycleMonth} の商品注文を ES が${act}しました`, body: `${bName}：合計 ${total}個`, link: { type: 'order', id } }); }
      else notifyBranch(r, a.branchId, { templateId: 'order_registered', title: `${a.cycleMonth} の商品注文を${act}しました（${bName}）`, body: `${bName} の商品注文を${act}しました（合計 ${total}個）。締切 ${menu.orderTo} までは「月次注文」で直せます。`, link: { type: 'order', id } });
      /* 予定の配送の明細を注文と同じにする（調整数も足す） */
      syncDeliveryLines(r, slots, next.lines);
      return next;
    },
    /**
     * 代替品設定（運営）：① 差し替え／② 補償／③ 除外のみ を注文・配送・追加発注・仕入先への請求・お知らせに反映する（lib/domain/alt.ts）。
     * 不足分の追加発注（createPo・既定 true）、便ごとの届け方（override）、対象から外す便（skip）
     */
    applyAlt: (r, a: AltArgs) => applyAlt(r, a),
    /**
     * 注文の設定（短消費期限・除く商品など）。
     * applyNext＝「次回以降も適用」（AI の提案を翌月の下書きに入れる。法人Web）。省くと今の値のまま
     */
    savePref(r, a: Omit<OrderPref, 'id' | 'updatedAt'> & { branchId: string; applyNext?: boolean }) {
      if (!r.get('dm.org.branches', a.branchId)) throw new ApiError('拠点が見つかりません', 404);
      if (!(a.priceRange[0] <= a.priceRange[1])) throw new ApiError('単価の範囲が正しくありません', 400);
      const applyNext = a.applyNext ?? r.get<OrderPref & { applyNext?: boolean }>('dm.order.prefs', a.branchId)?.applyNext ?? false;
      const next: OrderPref & { applyNext: boolean } = { id: a.branchId, categories: a.categories, allowShortLife: a.allowShortLife, priceRange: a.priceRange, excluded: a.excluded, updatedAt: nowStamp(), updatedBy: a.updatedBy, applyNext };
      r.put('dm.order.prefs', a.branchId, next);
      return next;
    },
    /** 基準数のパターン（通常／短消費期限なし）を運営が変える（REQ-CT-300。法人は変えられない） */
    setBasePattern: (r, a: { branchId: string; noShortLife: boolean; by: string }) => setBasePattern(r, a),
  },
});
