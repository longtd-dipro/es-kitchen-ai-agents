import { invoiceTotals } from '../invoiceTax';
import { defineArea, type DocRepo } from '@/lib/ops/core/area';
import { canDeliver, canPick } from '../calendar';
import { buyoutOf, sellable, vmModelsOf } from '../product';
import { BASE_KINDS, BASE_LABEL, baseSums, listMenus, menuIds, monthlyLimit, slotDiffProblem } from '../menu';
import { adjustLinesOf, ALT_POS, ALTS, CLAIMS, countsToLimit, isNormal, toDeliveryLines } from '../alt';
import type { AltPo, AltSetting, SupplierClaim } from '../types';
import { statusOf } from './apply';
import { DELIVERED } from '../snapshot';
import type { Pause, Plan } from '../types';
import { isOpenPause } from '../types';
import { MORE_COUNT_KINDS, moreProblems } from '../checkMore';
import { INTEGRATION_COUNT_KINDS, integrationProblems } from '../checkIntegrations';
import { SURVEY_COUNT_KINDS, surveyProblems } from '../checkSurvey';
import { migrationProblems } from '../migrate';
import { holidayConfirmed, MOVE_COUNT_KINDS, moveProblems } from '../checkMove';
import { STOCK_COUNT_KINDS, stockProblems } from '../checkStock';
import { bulkAckedShip, decisionProblems } from '../checkDecisions';
import { billingProblems } from '../checkBilling';
import { batchProblems } from '../batch';
import { mailProblems } from '../mails';
import { packAProblems } from '../checkPackA';
import { arrTaxProblems } from '@/lib/ops/areas/billing';
import { menuMasterProblems } from '../checkMenuMaster';
import { mm1002Problems } from '../checkMm1002';
import { chargeProblems } from '../checkCharges';
import { trialProblems } from '../trial';
import type { KariApproval, Loan, Model, Product, ProductCategory, ProductHistory, ProductTag, Warehouse, Account, Application, Cooler, DeliveryReport, Notification, ParkingReport, Quote, StockCheck, Branch, ChildContract, Contract, Cycle, Delivery, DeliveryLine, Holiday, Invoice, Leg, MaterialOrder, ProductOrder, Tracking, Trouble } from '../types';
import { routeOfSlot } from '../route';

/*
 * 共通データの食い違いの確認（area: check）。データは持たない。
 * GET できる形：POST /api/domain/check/run → { ok, counts, problems }
 * seed や書き換えを直したら流して、problems が空なことを確かめる。
 */

function run(r: DocRepo) {
  const p: string[] = [];
  const has = (kind: string, id: string) => !!id && !!r.get(kind, id);
  const need = (cond: boolean, msg: string) => { if (!cond) p.push(msg); };

  const branches = r.list<Branch>('dm.org.branches');
  const contracts = r.list<Contract>('dm.org.contracts');
  const children = r.list<ChildContract>('dm.org.childContracts');
  const deliveries = r.list<Delivery>('dm.delivery.deliveries');
  const cycles = r.list<Cycle>('dm.delivery.cycles');
  const holidays = r.list<Holiday>('dm.delivery.holidays');

  for (const b of branches) if (b.corpId) need(has('dm.org.corps', b.corpId), `拠点 ${b.id} の法人 ${b.corpId} がない`);
  for (const c of contracts) {
    need(has('dm.org.branches', c.branchId), `契約 ${c.id} の拠点 ${c.branchId} がない`);
    need(contracts.filter((x) => x.branchId === c.branchId).length === 1, `拠点 ${c.branchId} に親契約が複数ある`);
    if (c.agencyId) need(has('dm.org.agencies', c.agencyId), `契約 ${c.id} の代理店 ${c.agencyId} がない`);
  }
  for (const ch of children) {
    need(ch.id === `${ch.contractId}-${ch.cycleMonth.replace('-', '')}`, `子契約 ${ch.id} の ID の形が違う`);
    need(has('dm.master.plans', ch.planId), `子契約 ${ch.id} のプラン ${ch.planId} がない`);
    for (const o of ch.optionIds) need(has('dm.master.options', o), `子契約 ${ch.id} のオプション ${o} がない`);
    for (const x of ch.channels) {
      need(has('dm.master.warehouses', x.warehouseId), `子契約 ${ch.id} の倉庫 ${x.warehouseId} がない`);
      need(has('dm.master.carriers', x.carrierId), `子契約 ${ch.id} の運び手 ${x.carrierId} がない`);
      /* 配送会社②は常に必須。中継しないときは①と同じ会社（2026/10/03・REQ-DL-710） */
      need(has('dm.master.carriers', x.carrier2Id), `子契約 ${ch.id} の配送会社② ${x.carrier2Id || '（空）'} がない`);
      if (!x.hubId) need(x.carrier2Id === x.carrierId, `子契約 ${ch.id} は中継しないのに配送会社①② が違う（${x.carrierId}・${x.carrier2Id}）`);
      /* 回ごとのルートの上書き：その便の回だけ・倉庫・運び手・中継があり、中継しないときは①＝② */
      for (const [slot, o] of Object.entries(x.slotRoutes ?? {})) {
        need(x.slots.includes(slot), `子契約 ${ch.id} の回ごとのルート ${x.temp}:${slot} が便の回にない`);
        need(has('dm.master.warehouses', o.warehouseId) && has('dm.master.carriers', o.carrierId) && has('dm.master.carriers', o.carrier2Id) && (!o.hubId || has('dm.master.warehouses', o.hubId)), `子契約 ${ch.id} の回ごとのルート ${x.temp}:${slot} の倉庫・運び手・中継がない`);
        if (!o.hubId) need(o.carrier2Id === o.carrierId, `子契約 ${ch.id} の回ごとのルート ${x.temp}:${slot} は中継しないのに①②が違う`);
      }
      if (x.driverId) need(has('dm.master.drivers', x.driverId), `子契約 ${ch.id} のドライバー ${x.driverId} がない`);
    }
  }
  for (const d of deliveries) {
    need(/^DL-\d{6}-\d{4}(-\d)?$/.test(d.id), `配送 ${d.id} の ID の形が違う`);
    /* 配送No の日付は作ったときの予定の出荷日。日付を変えても番号は変えないので、いまの出荷日とは比べない（2026/10/03） */
    /* 出荷日（実績）は倉庫から出たあとの配送だけが持つ */
    if (d.shippedOn) need(/^\d{4}\/\d{2}\/\d{2}$/.test(d.shippedOn) && !['予定', '出荷待', '取消'].includes(d.status), `配送 ${d.id} の出荷日（実績）${d.shippedOn} が正しくない（状態 ${d.status}）`);
    /* 資材の配送は子契約に付かない */
    if (d.temp !== '資材') need(has('dm.org.childContracts', d.childContractId), `配送 ${d.id} の子契約 ${d.childContractId} がない`);
    need(has('dm.org.branches', d.branchId), `配送 ${d.id} の拠点がない`);
    need(d.shipOn <= d.deliverOn, `配送 ${d.id} の出荷日がお届け日より後`);
    if (!d.parentId && d.temp !== '資材' && d.status !== '取消') {
      /* スケジュールの移動で「お届けしない日」を確かめて動かした配送はよい（課題 2-4）。出荷日は倉庫ごとの出荷禁止日も見る（課題 4-10） */
      need(canDeliver(cycles, holidays, d.deliverOn) || holidayConfirmed(r, d), `配送 ${d.id} のお届け日 ${d.deliverOn} はお届けできない日`);
      /* 一括変更で SA が注意（新しい倉庫の出荷禁止日）を確かめて変えた配送はよい（課題 4b-6） */
      need(canPick(cycles, holidays, d.shipOn, d.warehouseId) || bulkAckedShip(r, d), `配送 ${d.id} の出荷日 ${d.shipOn} は出荷できない日`);
    }
    /* 資材の配送は資材の注文（delivery.materialOrders）が明細 */
    const ls = d.temp === '資材'
      ? r.list<MaterialOrder>('dm.delivery.materialOrders').filter((m) => m.deliveryId === d.id).flatMap((m) => m.lines.map((l) => ({ plannedQty: l.qty })))
      : r.list<DeliveryLine>('dm.delivery.lines').filter((l) => l.deliveryId === d.id);
    need(ls.reduce((a, l) => a + l.plannedQty, 0) === d.plannedQty, `配送 ${d.id} の明細の合計が予定数と違う`);
    /* 明細は行ごと（同じ商品でも通常・代替品の行は別。B1）：同じ商品・種類・代替品設定の行は1つ・届けた数は予定数まで */
    if (d.temp !== '資材') {
      const dl = ls as DeliveryLine[];
      need(new Set(dl.map((l) => `${l.productId}|${l.kind ?? ''}|${l.altId ?? ''}`)).size === dl.length, `配送 ${d.id} の明細に同じ商品・同じ種類の行が2つ以上ある`);
      for (const l of dl) if (l.deliveredQty !== null) need(l.deliveredQty >= 0 && l.deliveredQty <= l.plannedQty, `明細 ${l.id} の届けた数が予定数を超えている`);
    }
    const lg = r.list<Leg>('dm.delivery.legs').filter((l) => l.deliveryId === d.id);
    need(lg.filter((l) => l.isFinal).length === 1, `配送 ${d.id} の最後の区間が1つでない`);
    for (const l of lg) {
      need(has('dm.master.carriers', l.carrierId), `区間 ${l.id} の運び手がない`);
      if (l.driverId) {
        const dr = r.get<{ carrierId: string }>('dm.master.drivers', l.driverId);
        need(!!dr && dr.carrierId === l.carrierId, `区間 ${l.id} のドライバー ${l.driverId} が運び手 ${l.carrierId} の所属でない`);
      }
      if (l.regime === 'parcel_carrier') need(!l.driverId, `区間 ${l.id} は路線便なのにドライバーがいる`);
    }
    if (d.parentId) need(has('dm.delivery.deliveries', d.parentId), `配送 ${d.id} の親 ${d.parentId} がない`);
  }
  for (const t of r.list<Tracking>('dm.delivery.tracking')) need(has('dm.delivery.deliveries', t.deliveryId), `送り状 ${t.trackingNo} の配送がない`);
  for (const t of r.list<Trouble>('dm.delivery.troubles')) {
    need(has('dm.delivery.deliveries', t.deliveryId), `トラブル ${t.id} の配送がない`);
    if (t.childDeliveryId) need(has('dm.delivery.deliveries', t.childDeliveryId), `トラブル ${t.id} の子 ${t.childDeliveryId} がない`);
  }
  for (const a of r.list<Account>('dm.account.accounts')) {
    for (const rid of a.roleIds) need(r.get<{ site: string }>('dm.account.roles', rid)?.site === a.site, `アカウント ${a.id} の役割 ${rid} がサイトに合わない`);
    const s = a.scope;
    if (s.type === 'corp') need(has('dm.org.corps', s.corpId), `アカウント ${a.id} の法人がない`);
    if (s.type === 'branch') need(has('dm.org.branches', s.branchId), `アカウント ${a.id} の拠点がない`);
    if (s.type === 'carrier') need(has('dm.master.carriers', s.carrierId), `アカウント ${a.id} の委託配送会社がない`);
    if (s.type === 'driver') need(has('dm.master.drivers', s.driverId), `アカウント ${a.id} のドライバーがない`);
    if (s.type === 'warehouse') need(has('dm.master.warehouses', s.warehouseId), `アカウント ${a.id} の倉庫がない`);
  }

  /* 月次注文：月の合計（通常＋差替）＝月のお届け数（1回の食数 × 配送の回数）・便ごとの差は ±1（台帳 E 2026-10-05）、明細＝注文（除外の行は明細にしない・追加配送の行はその配送の明細） */
  const allDl = r.list<DeliveryLine>('dm.delivery.lines');
  for (const o of r.list<ProductOrder>('dm.order.orders')) {
    const cc = r.get<ChildContract>('dm.org.childContracts', o.childContractId);
    if (!cc) {
      /* 仮登録の拠点の最初の注文（子契約は本登録で作る。行はまだない） */
      const ct = contracts.find((c) => o.childContractId.startsWith(`${c.id}-`));
      if (!['仮登録', '取消'].includes(ct?.status ?? '') || (o.lines.length && o.status !== '取消')) p.push(`注文 ${o.id} の子契約がない`);
      continue;
    }
    const total = o.lines.filter(countsToLimit).reduce((a, l) => a + l.qty, 0);
    need(total === monthlyLimit(cc), `注文 ${o.id} の合計 ${total} が月のお届け数 ${monthlyLimit(cc)} と違う`);
    const diffNg = o.status !== '取消' && slotDiffProblem(cc, o.lines.filter(countsToLimit));
    need(!diffNg, `注文 ${o.id}：${diffNg}`);
    need(o.lines.every((l) => Number.isInteger(l.qty) && l.qty > 0), `注文 ${o.id} に 0 以下・整数でない個数がある`);
    /* 調整数：0以上の整数・合計はプランの食数まで・冷凍の便にも足せる（#282）・お試し（自動）にはない */
    const adj = o.adjust ?? [];
    need(adj.every((x) => Number.isInteger(x.qty) && x.qty > 0), `注文 ${o.id} の調整数が正しくない（整数）`);
    need(adj.reduce((a, x) => a + x.qty, 0) <= monthlyLimit(cc), `注文 ${o.id} の調整数の合計がプランの食数 ${monthlyLimit(cc)} を超えている`);
    need(!(adj.length && o.status === 'お試し（自動）'), `お試し（自動）の注文 ${o.id} に調整数がある`);
    need(o.lines.every((l) => cc.channels.some((ch) => ch.slots.some((s) => `${ch.temp}:${s}` === l.slot))), `注文 ${o.id} に子契約にない便がある`);
    for (const ch of cc.channels) for (const slot of ch.slots) {
      const key = `${ch.temp}:${slot}`;
      const d = deliveries.find((x) => x.childContractId === cc.id && x.slot === slot && x.temp === ch.temp && !x.parentId);
      if (d && !['一部納品済'].includes(d.status)) {
        const dl = allDl.filter((l) => l.deliveryId === d.id);
        const same = toDeliveryLines(d.id, [...o.lines, ...adjustLinesOf(o)].filter((l) => l.slot === key && !l.deliveryId)).every((l) => dl.some((x) => x.id === l.id && x.productId === l.productId && x.plannedQty === l.plannedQty));
        need(same, `配送 ${d.id} の明細が注文 ${o.id} と違う`);
      }
    }
    /* 追加配送の行：その配送（子）の明細にある */
    for (const cid of [...new Set(o.lines.filter((l) => l.deliveryId).map((l) => l.deliveryId!))]) {
      const c = deliveries.find((x) => x.id === cid);
      if (!c) { p.push(`注文 ${o.id} の追加配送 ${cid} がない`); continue; }
      need(c.childContractId === o.childContractId && !!c.parentId, `追加配送 ${cid} が注文 ${o.id} の子契約の子の配送でない`);
      const dl = allDl.filter((l) => l.deliveryId === cid);
      need(toDeliveryLines(cid, o.lines.filter((l) => l.deliveryId === cid)).every((l) => dl.some((x) => x.id === l.id && x.plannedQty === l.plannedQty)), `追加配送 ${cid} の明細が注文 ${o.id} と違う`);
    }
    for (const l of o.lines) need(has('dm.master.products', l.productId), `注文 ${o.id} の商品 ${l.productId} がない`);
  }
  /* 商品マスタ：仕入先・ピッキング倉庫・税率・タグ・カテゴリ・同梱資材・対応機種があるか、選択中の仕入先が1社で supplierId と同じか */
  const products = r.list<Product>('dm.master.products');
  const supplierIds = new Set(r.list<Account>('dm.account.accounts').filter((a) => a.site === 'supplier').map((a) => a.id));
  const tagNames = new Set(r.list<ProductTag>('dm.master.productTags').map((t) => t.name));
  const catIds = new Set(r.list<ProductCategory>('dm.master.productCategories').map((c) => c.id));
  const catNames = new Set(r.list<ProductCategory>('dm.master.productCategories').map((c) => c.name));
  const menuProductIds = new Set(listMenus(r).flatMap(menuIds));
  for (const pr of products) {
    for (const s of pr.suppliers) need(supplierIds.has(s.supplierId), `商品 ${pr.id} の仕入先 ${s.supplierId} がない`);
    const sel = pr.suppliers.filter((s) => s.selected);
    /* 仕入先は1社以上（複数可・使うのは選択中の1社。受付簿 #286）。削除済の商品は問わない。メニューに入れた商品はピッキング倉庫・コースが要る */
    if (pr.status !== '削除済') need(pr.suppliers.length >= 1, `商品 ${pr.id} の仕入先がない`);
    need(new Set(pr.suppliers.map((s) => s.supplierId)).size === pr.suppliers.length, `商品 ${pr.id} の仕入先が重なっている`);
    if (pr.suppliers.length) need(sel.length === 1 && sel[0].supplierId === pr.supplierId, `商品 ${pr.id} の選択中の仕入先が1社でない／supplierId と違う`);
    else need(!pr.supplierId, `商品 ${pr.id} に仕入先がないのに supplierId（${pr.supplierId}）がある`);
    const inMenu = menuProductIds.has(pr.id);
    if (inMenu) need(pr.pickWarehouseIds.length > 0, `商品 ${pr.id}（メニューにある）にピッキング倉庫がない`);
    for (const w of pr.pickWarehouseIds) need(r.get<Warehouse>('dm.master.warehouses', w)?.type === 'picking', `商品 ${pr.id} のピッキング倉庫 ${w} がない`);
    need(has('dm.master.taxRates', pr.taxRateId), `商品 ${pr.id} の税率 ${pr.taxRateId} がない`);
    /* 商品はカテゴリを ID で持つ（受付簿 #233）。削除済の商品が持つカテゴリは、カテゴリを消してもそのまま残す */
    /* ID のない古いデータ（名前だけ）は名前で見る（次に保存したとき ID が入る） */
    if (pr.status !== '削除済') need(pr.categoryId ? catIds.has(pr.categoryId) : catNames.has(pr.category), `商品 ${pr.id} のカテゴリ ${pr.categoryId ?? pr.category} がない`);
    for (const m of pr.bundledMaterialIds) need(has('dm.master.materials', m), `商品 ${pr.id} の同梱資材 ${m} がない`);
    for (const m of pr.vending.models) need(r.get<Model>('dm.master.models', m)?.category === '自販機', `商品 ${pr.id} の対応機種 ${m} がない`);
    need(!!pr.vmFrame === pr.vending.columns.length > 0, `商品 ${pr.id} の vmFrame と自販機コラムが合わない`);
    if (inMenu) need(pr.courses.length > 0, `商品 ${pr.id}（メニューにある）にコースがない`);
    need(pr.images.length === 0 || pr.images.filter((x) => x.main).length === 1, `商品 ${pr.id} のメインの写真が1枚でない`);
  }
  for (const h of r.list<ProductHistory>('dm.master.productHistory')) need(has('dm.master.products', h.productId), `変更履歴 ${h.id} の商品がない`);

  /* 月間メニュー：商品があるか・表示順・基準注文数（種類ごとの合計＝50）・公開の状態 */
  const menus = listMenus(r);
  const prodOf = (id: string) => r.get<Product>('dm.master.products', id);
  for (const m of menus) {
    need(/^\d{4}-\d{2}$/.test(m.id), `メニュー ${m.id} の ID の形が違う`);
    need(new Set(menuIds(m)).size === m.items.length, `メニュー ${m.id} に同じ商品が2つある`);
    need(m.items.every((x, i) => x.order === i + 1), `メニュー ${m.id} の表示順が 1 からの連番でない`);
    for (const x of m.items) {
      need(!!prodOf(x.productId), `メニュー ${m.id} の商品 ${x.productId} がない`);
      for (const t of x.tags) need(tagNames.has(t), `メニュー ${m.id} の ${x.productId} のタグ ${t} がない`);
      need(BASE_KINDS.every((k) => Number.isInteger(x.base[k]) && x.base[k] >= 0), `メニュー ${m.id} の ${x.productId} の基準注文数が 0 以上の整数でない`);
    }
    /* 基準注文数は種類ごとの合計＝50（対象の商品があるとき。保存のときに 50 でなければ 400） */
    for (const k of baseSums(m.items, prodOf).bad) need(false, `メニュー ${m.id} の${BASE_LABEL[k]}の合計が 50 でない（${m.items.reduce((a, x) => a + x.base[k], 0)}）`);
    /* 公開したメニューは販売価格の写し（公開したときの価格）を全商品に持つ */
    if (m.status !== '編集中') need(m.items.every((x) => { const pr = m.prices?.[x.productId]; return !!pr && Number.isInteger(pr.priceYen) && pr.priceYen >= 0 && has('dm.master.taxRates', pr.taxRateId); }), `メニュー ${m.id} に販売価格の写しがない商品がある`);
    need(m.status === '編集中' ? m.corpPublish !== '公開' : m.corpPublish === '公開', `メニュー ${m.id} の状態 ${m.status} と法人向けの公開 ${m.corpPublish} が合わない`);
    if (m.corpPublish === '自動公開') need(!!m.autoPublishOn, `メニュー ${m.id} は自動公開なのに自動公開日付がない`);
    if (m.status !== '編集中') need(!!m.publishedAt, `メニュー ${m.id} の公開日時がない`);
    need(m.orderFrom <= m.orderTo, `メニュー ${m.id} のオーダー開始日が締切日より後`);
  }
  for (const k of r.list<KariApproval>('dm.menu.kariApprovals')) need(/^\d{4}-\d{2}$/.test(k.id) && (k.status === '承認') === !!k.approvedAt, `仮発注の承認 ${k.id} の形・日時が合わない`);

  /* 月次注文の商品が拠点に出せる商品か（便の倉庫∈ピッキング倉庫・コース・自販機・温度帯・メニューにある） */
  const loans = r.list<Loan>('dm.org.loans'), models = r.list<Model>('dm.master.models');
  for (const o of r.list<ProductOrder>('dm.order.orders')) {
    const cc = r.get<ChildContract>('dm.org.childContracts', o.childContractId);
    const menu = menus.find((m) => m.id === o.cycleMonth);
    if (!cc) continue;
    const vm = vmModelsOf(loans, models, cc.branchId);
    for (const l of o.lines) {
      const [temp, slot] = l.slot.split(':');
      const c0 = cc.channels.find((c) => c.temp === temp && c.slots.includes(slot)), ch = c0 && routeOfSlot(c0, slot);
      const pr = r.get<Product>('dm.master.products', l.productId);
      if (!ch || !pr) { p.push(`注文 ${o.id} の ${l.slot} ${l.productId} の便・商品がない`); continue; }
      /* 代替品の行（ES が作る）はメニュー・便の条件を見ない（商品マスタにあればよい） */
      if (!isNormal(l)) continue;
      need(!menu || menuIds(menu).includes(l.productId), `注文 ${o.id} の ${l.productId} が ${o.cycleMonth} のメニューにない`);
      need(sellable(pr, { course: cc.course, temp: ch.temp, warehouseId: ch.warehouseId, vmModelIds: vm }),
        `注文 ${o.id} の ${l.productId} は ${cc.branchId} の便（${ch.warehouseId}・${cc.course}・${ch.temp}）に出せない商品`);
      if (cc.pricing?.mode === '企業独自価格') need(cc.pricing.prices[l.productId] != null, `注文 ${o.id} の ${l.productId} に企業独自価格がない（${cc.id}）`);
    }
  }
  /* 子契約の価格と精算：企業独自価格は買取、買取の金額＝届けた数×企業の価格 */
  const allLines = r.list<DeliveryLine>('dm.delivery.lines');
  for (const ch of children) {
    const pr = ch.pricing;
    need(!!pr && (pr.mode === '通常価格') === (pr.billing === '従量'), `子契約 ${ch.id} の価格と精算（${pr?.mode}／${pr?.billing}）の組み合わせが違う`);
    if (pr?.billing !== '買取') continue;
    const b = buyoutOf(ch, deliveries, allLines);
    need(!b.missing.length, `子契約 ${ch.id} の買取で企業独自価格がない商品 ${b.missing.join('・')}`);
    need(b.totalYen === b.rows.reduce((a, x) => a + x.qty * x.unitYen, 0) && b.rows.every((x) => x.qty >= 0), `子契約 ${ch.id} の買取の金額が合わない`);
  }

  /* 請求書：合計の計算 */
  for (const inv of r.list<Invoice>('dm.billing.invoices')) {
    /* 税率ごとの欄（税率マスタのどの率でも・lib/domain/invoiceTax.ts）。byRate を持つ請求書はその値とも合わせる */
    const want = invoiceTotals(inv.lines);
    need(inv.total === want.total, `請求書 ${inv.id} の合計が合わない`);
    if (inv.byRate) need(JSON.stringify(inv.byRate) === JSON.stringify(want.byRate), `請求書 ${inv.id} の税率ごとの欄が行と合わない`);
    for (const l of inv.lines) need(has('dm.org.branches', l.branchId), `請求書 ${inv.id} の拠点 ${l.branchId} がない`);
    if (inv.corpId) need(has('dm.org.corps', inv.corpId), `請求書 ${inv.id} の法人がない`);
  }
  /*
   * マスタを変えても古いデータが変わらないための写しとロック（マスタ・データ変更の影響一覧 A1〜A6）
   *   子契約の ① 費目の写し（fees）がある／請求済の子契約には前払いの行のある請求書がある・前払いを発行した子契約は請求済（確定・請求済は変えられない）
   *   納品した配送：明細の商品名・区間の支払額の写しがある／追加発注：仕入単価の写しがある
   */
  const invs = r.list<Invoice>('dm.billing.invoices').filter((x) => x.status !== '取消');
  /* 年払いの前払いの行は請求書の cycleMonth〜cycleTo の12サイクル分（S3-1） */
  const billedFor = (branchId: string, cycle: string) => invs.some((x) => x.lines.some((l) => l.kind === '前払い' && l.branchId === branchId && (x.cycleMonth === cycle || (!!l.cycleTo && x.cycleMonth <= cycle && cycle <= l.cycleTo))));
  /* 請求済みの月にプランを変えた子契約は、① 費目が請求したときの値のまま（差額は調整明細・TL-7 A。lib/domain/checkBilling.ts で確かめる） */
  const replanned = new Set(r.list<{ childContractId: string; kind: string }>('dm.billing.adjustments').filter((x) => x.kind === 'プランの変更').map((x) => x.childContractId));
  for (const ch of children) {
    const f = ch.fees;
    need(!!f && f.lines.length >= 2 && f.lines.every((l) => Number.isInteger(l.amountYen) && typeof l.taxRate === 'number' && l.taxRate >= 0) && Number.isInteger(f.meals), `子契約 ${ch.id} に ① 費目の写し（fees）がない・形が違う`);
    if (f && !(ch.billStatus === '請求済' && replanned.has(ch.id))) need(f.lines.filter((l) => l.src === 'plan').every((l) => l.refId === ch.planId) && f.lines.filter((l) => l.src === 'option').every((l) => ch.optionIds.includes(l.refId)) && f.lines.filter((l) => l.src === 'discount').every((l) => ch.discountIds.includes(l.refId)),
      `子契約 ${ch.id} の ① 費目の写しがプラン・オプション・値引きと合わない`);
    if (ch.billStatus === '請求済') need(billedFor(ch.branchId, ch.cycleMonth), `子契約 ${ch.id} は請求済なのに前払いの請求書がない`);
    else need(!billedFor(ch.branchId, ch.cycleMonth), `子契約 ${ch.id} は前払いを請求したのに ${ch.billStatus}（請求済にする）`);
  }
  /* 前払いの行はその月の子契約がある拠点だけ（子契約のない月＝お試しの終わったあと・休止・解約の月に前払いを出さない。B3） */
  const liveCc = new Set(children.filter((c) => !c.canceled).map((c) => `${c.branchId}|${c.cycleMonth}`));
  for (const inv of invs) for (const l of inv.lines.filter((x) => x.kind === '前払い' && !x.cycleTo)) need(liveCc.has(`${l.branchId}|${inv.cycleMonth}`), `請求書 ${inv.id} に子契約のない月（${inv.cycleMonth}）の前払いの行がある（拠点 ${l.branchId}）`);
  /* 調整明細・年払い・最終請求・事務手数料・在庫戻し（lib/domain/checkBilling.ts） */
  p.push(...billingProblems(r));
  const allLegs = r.list<Leg>('dm.delivery.legs');
  for (const d of deliveries.filter((x) => DELIVERED.includes(x.status))) {
    if (d.temp !== '資材') need(allDl.filter((l) => l.deliveryId === d.id).every((l) => !!l.productName), `納品した配送 ${d.id} の明細に商品名の写しがない`);
    need(allLegs.filter((l) => l.deliveryId === d.id).every((l) => Number.isInteger(l.feeYen) && l.feeYen! >= 0), `納品した配送 ${d.id} の区間に支払額の写し（feeYen）がない`);
  }
  for (const x of r.list<AltPo>(ALT_POS)) {
    const o = x.order as { hon?: number; unitCostYen?: number };
    if ((o.hon ?? 0) > 0) need(o.unitCostYen === x.unitCostYen, `追加発注 ${x.id} の仕入単価の写しがない・追加発注の単価と違う`);
  }

  /* 申請：拠点があるか・状態が結果と合うか */
  for (const a of r.list<Application>('dm.apply.applications')) {
    for (const b of a.branchIds) need(has('dm.org.branches', b), `申請 ${a.id} の拠点 ${b} がない`);
    if (a.corpId) need(has('dm.org.corps', a.corpId), `申請 ${a.id} の法人 ${a.corpId} がない`);
    if (a.type === 'change') need(statusOf(a.results) === a.status, `申請 ${a.id} の状態 ${a.status} が結果と合わない`);
    /* 切替（お試し→本導入）は今ある拠点に結びつく（新しい拠点・親契約を作らない。B2） */
    if (a.type === 'new' && a.kubun === '切替' && !['却下', '取り下げ済'].includes(a.status)) need(a.branchIds.length > 0, `申込 ${a.id} は切替なのにお試しの拠点が結びついていない`);
    if (a.type === 'new' && a.corpId) for (const b of a.branchIds) need(r.get<Branch>('dm.org.branches', b)?.corpId === a.corpId, `申込 ${a.id} の拠点 ${b} が法人 ${a.corpId} の拠点でない`);
  }

  /*
   * 申請の承認で変えたデータ（lib/domain/lifecycle.ts・課題 3-2〜3-7・3-12）
   *   取り消した子契約（休止・解約）に出荷前の配送・注文が残っていない／休止の月に出荷前の配送がない／休止は通算12サイクルまで
   *   解約：終了日・拠点（閉鎖予定・閉鎖）・解約日のあとの配送・貸出（回収予定）・アカウント（参照のみ・利用停止）
   *   契約種別の履歴（お試し→本導入は同じ親契約）／未確定の子契約の月の上限 ≦ プランの月次提供数／費用（extras）・貸出の形／新規申込の仮登録・本登録
   */
  const pauses = r.list<Pause>('dm.org.pauses'), loanRows = r.list<Loan>('dm.org.loans'), orderRows = r.list<ProductOrder>('dm.order.orders');
  const OPEN_DL: Delivery['status'][] = ['予定', '出荷待', '確認中'];
  for (const ch of children.filter((x) => x.canceled)) {
    need(!deliveries.some((d) => d.childContractId === ch.id && OPEN_DL.includes(d.status)), `取り消した子契約 ${ch.id} に出荷前の配送が残っている`);
    need(!orderRows.some((o) => o.childContractId === ch.id), `取り消した子契約 ${ch.id} に注文が残っている`);
  }
  for (const d of deliveries.filter((x) => x.cycleMonth && !x.parentId && ['予定', '出荷待'].includes(x.status))) {
    need(!pauses.some((q) => q.contractId === d.contractId && q.fromCycle <= d.cycleMonth && d.cycleMonth <= q.toCycle), `休止の月の配送 ${d.id}（${d.cycleMonth}）が取り消されていない`);
  }
  for (const c of contracts) {
    /* 終わりが未定の休止（移行の休止中）は月数に数えない */
    const used = pauses.filter((q) => q.contractId === c.id && !isOpenPause(q)).reduce((a, q) => a + (+q.toCycle.slice(0, 4) - +q.fromCycle.slice(0, 4)) * 12 + (+q.toCycle.slice(5) - +q.fromCycle.slice(5)) + 1, 0);
    need(used <= 12, `契約 ${c.id} の休止が通算12サイクルを超えている（${used}）`);
    const h = c.kindHistory;
    need(h.length > 0 && h[h.length - 1].kind === c.kind, `契約 ${c.id} の契約種別の履歴の最後が今の種別（${c.kind}）と違う`);
    for (const ch of children.filter((x) => x.contractId === c.id && !x.canceled)) {
      const k = h.filter((x) => x.from <= ch.cycleMonth).pop()?.kind ?? h[0]?.kind;
      need(ch.kind === k, `子契約 ${ch.id} の種別 ${ch.kind} が親契約の履歴（${k}）と違う`);
    }
    if (c.status === '仮登録') need(!deliveries.some((d) => d.contractId === c.id && d.status !== '取消'), `仮登録の契約 ${c.id} に配送がある（本登録で作る）`);
    if (c.status !== '解約手続き中' && c.status !== '終了') continue;
    need(!!c.endOn, `契約 ${c.id}（${c.status}）に終了日がない`);
    const b = branches.find((x) => x.id === c.branchId);
    need(!!b && (c.status === '終了' ? b.status === '閉鎖' : ['閉鎖予定', '閉鎖'].includes(b.status)), `契約 ${c.id}（${c.status}）の拠点 ${c.branchId} の状態が ${b?.status}`);
    need(!deliveries.some((d) => d.contractId === c.id && d.deliverOn > c.endOn && OPEN_DL.includes(d.status)), `契約 ${c.id} の解約日 ${c.endOn} のあとに出荷前の配送がある`);
    need(!loanRows.some((l) => l.branchId === c.branchId && l.status === '貸出中'), `解約した拠点 ${c.branchId} に貸出中の設備がある（回収予定にする）`);
    const acc = r.get<Account>('dm.account.accounts', c.branchId);
    if (acc) need(['参照のみ', '利用停止'].includes(acc.status), `解約した拠点のアカウント ${acc.id} が ${acc.status}（参照のみ → 利用停止）`);
  }
  for (const ch of children.filter((x) => !x.canceled && x.billStatus === '未確定')) {
    const pl = r.get<Plan>('dm.master.plans', ch.planId);
    if (pl) need(monthlyLimit(ch) <= pl.monthlyMeals, `子契約 ${ch.id} の月の上限 ${monthlyLimit(ch)} がプランの月次提供数 ${pl.monthlyMeals} を超えている`);
  }
  for (const ch of children) for (const e of ch.extras ?? []) {
    need(Number.isInteger(e.amountYen) && e.amountYen >= 0 && has('dm.apply.applications', e.applicationId), `子契約 ${ch.id} の費用「${e.name}」の金額・申請が正しくない`);
  }
  for (const l of loanRows) {
    need(has('dm.org.branches', l.branchId) && has('dm.master.models', l.modelId) && Number.isInteger(l.qty) && l.qty >= 1, `貸出 ${l.id} の拠点・機種・台数が正しくない`);
    if (l.status === '回収予定') need(!!l.dueOn, `貸出 ${l.id} は回収予定なのに回収予定日がない`);
    if (l.status === '回収済') need(!!l.returnedOn || !l.dueOn, `貸出 ${l.id} は回収済なのに回収日がない`);
  }
  for (const a of r.list<Application>('dm.apply.applications').filter((x) => x.setup)) {
    const bs = a.setup!.branches;
    for (const b of bs.filter((x) => x.stage)) {
      const ct = r.get<Contract>('dm.org.contracts', b.contractId), br = branches.find((x) => x.id === b.branchId);
      need(!!ct && !!br && ct.branchId === b.branchId && a.branchIds.includes(b.branchId), `申込 ${a.id} の ${b.name} の拠点・親契約がない`);
      if (b.stage === '本登録') need(!!ct && ct.status !== '仮登録' && br?.status !== '仮登録', `申込 ${a.id} の ${b.name} は本登録なのに拠点・親契約が仮登録`);
    }
    if (bs.some((x) => x.stage)) need(a.status !== '受付中', `申込 ${a.id} は仮登録したのに受付中`);
    need((a.status === '完了') === bs.every((x) => x.stage === '本登録'), `申込 ${a.id} の状態 ${a.status} が拠点の本登録と合わない`);
  }

  /* 現場の報告・棚卸 */
  for (const x of r.list<DeliveryReport>('dm.report.deliveryReports')) {
    need(has('dm.delivery.deliveries', x.deliveryId), `報告 ${x.id} の配送がない`);
    need(has('dm.master.drivers', x.driverId), `報告 ${x.id} のドライバーがない`);
  }
  for (const x of r.list<StockCheck>('dm.report.stockChecks')) {
    need(has('dm.org.branches', x.branchId), `棚卸 ${x.id} の拠点がない`);
    for (const row of x.rows) need(row.sold === row.prev + row.delivered + (row.arrived ?? 0) - row.disposed - row.actual && row.sold >= 0, `棚卸 ${x.id} の ${row.productId} の計算が合わない`);
  }
  for (const x of r.list<ParkingReport>('dm.report.parking')) need(has('dm.delivery.deliveries', x.deliveryId) && has('dm.master.drivers', x.driverId), `駐車場代 ${x.id} の配送・ドライバーがない`);
  /* 委託配送先 */
  for (const x of r.list<Cooler>('dm.carrier.coolers')) {
    const dr = r.get<{ carrierId: string }>('dm.master.drivers', x.driverId);
    need(!!dr && dr.carrierId === x.carrierId, `保冷バッグ ${x.id} のドライバー ${x.driverId} が ${x.carrierId} の所属でない`);
  }
  for (const q of r.list<Quote>('dm.carrier.quotes')) {
    /* 商談中（申込の前）に運営の配送問い合わせから出した見積は申請なし */
    if (q.applicationId) need(has('dm.apply.applications', q.applicationId),`見積 ${q.id} の申請 ${q.applicationId} がない`);
    for (const x of q.responses) need(has('dm.master.carriers', x.carrierId), `見積 ${q.id} の会社 ${x.carrierId} がない`);
  }
  /* 通知のリンク先 */
  const LINK: Record<string, string> = { delivery: 'dm.delivery.deliveries', application: 'dm.apply.applications', invoice: 'dm.billing.invoices', order: 'dm.order.orders', trouble: 'dm.delivery.troubles', parking: 'dm.report.parking', quote: 'dm.carrier.quotes', menu: 'dm.order.menus', survey: 'dm.survey.surveys' };
  const notes = r.list<Notification>('dm.notice.notifications');
  for (const n of notes) {
    if (n.link.type) need(has(LINK[n.link.type], n.link.id), `通知 ${n.id} のリンク先 ${n.link.type} ${n.link.id} がない`);
    /* アプリの利用者あては拠点ID（アンケートの通知は利用者ID） */
    if (n.to.site === 'app') need(has('dm.org.branches', n.to.accountId) || (n.link.type === 'survey' && has('dm.app.users', n.to.accountId)), `通知 ${n.id} のあて先の拠点 ${n.to.accountId} がない`);
    else if (n.to.accountId) need(has('dm.account.accounts', n.to.accountId), `通知 ${n.id} のあて先 ${n.to.accountId} がない`);
  }

  /* 代替品設定：注文の行（差替は代替元・補償は0円・除外は明細にしない）・設定の便ごとの結果・追加発注・仕入先への請求がそろっているか */
  const alts = r.list<AltSetting>(ALTS), claims = r.list<SupplierClaim>(CLAIMS), altPos = r.list<AltPo>(ALT_POS);
  const orders = r.list<ProductOrder>('dm.order.orders');
  for (const o of orders) for (const l of o.lines.filter((x) => !isNormal(x))) {
    /* 入荷の不足を受け入れて外した行（③ 除外・代替品設定なし。lib/domain/checkStock.ts で確かめる） */
    if (l.shortId) { need(l.kind === '除外' && l.altOf === l.productId && !l.altId, `注文 ${o.id} の入荷の不足の行 ${l.productId} が除外の形でない`); continue; }
    need(!!l.altId && alts.some((a) => a.id === l.altId), `注文 ${o.id} の代替品の行 ${l.productId} の代替品設定 ${l.altId} がない`);
    need(has('dm.master.products', l.altOf ?? ''), `注文 ${o.id} の代替品の行 ${l.productId} に代替元がない`);
    if (l.kind === '差替') need(Number.isInteger(l.billPrice) && l.billPrice! >= 0, `注文 ${o.id} の差替 ${l.productId} の請求の単価がない`);
    if (l.kind === '補償') need(l.billPrice === 0, `注文 ${o.id} の補償 ${l.productId} の請求が 0円でない`);
    if (l.kind === '除外') need(l.productId === l.altOf, `注文 ${o.id} の除外の行が不良商品でない`);
  }
  need(!allDl.some((l) => l.kind === '除外'), '除外の行が配送の明細にある（届けない・請求しない数）');
  for (const l of allDl.filter((x) => x.kind === '差替' || x.kind === '補償')) need(!!l.substitutedFrom && (l.kind !== '補償' || l.billPrice === 0), `明細 ${l.id} の代替元・請求の単価が合わない`);
  for (const a of alts) {
    const mine = orders.flatMap((o) => o.lines.filter((l) => l.altId === a.id));
    const altQty = mine.filter((l) => l.kind === '差替' || l.kind === '補償').reduce((s, l) => s + l.qty, 0);
    need(altQty === a.rows.reduce((s, x) => s + x.altQty, 0), `代替品設定 ${a.id} の代替品の数が注文の行と合わない`);
    need(mine.filter((l) => l.kind === '除外' && !l.movedTo).reduce((s, l) => s + l.qty, 0) === a.rows.filter((x) => x.pattern === '③ 除外のみ').reduce((s, x) => s + x.qty, 0), `代替品設定 ${a.id} の除外の数が注文の行と合わない`);
    for (const x of a.rows) {
      need(has('dm.delivery.deliveries', x.deliveryId) && has('dm.delivery.deliveries', x.toDeliveryId) && has('dm.order.orders', x.orderId) && has('dm.order.orders', x.toOrderId), `代替品設定 ${a.id} の便 ${x.deliveryId} → ${x.toDeliveryId} の配送・注文がない`);
      if (x.pattern !== '③ 除外のみ') need(mine.some((l) => (l.kind === (x.pattern === '② 補償' ? '補償' : '差替')) && orders.find((o) => o.id === x.toOrderId)?.lines.includes(l)), `代替品設定 ${a.id} の ${x.deliveryId} の代替品の行が注文 ${x.toOrderId} にない`);
    }
    const c = claims.find((y) => y.id === a.claimId);
    need(!!c && c.altId === a.id && c.productId === a.productId && c.qty === a.rows.reduce((s, x) => s + x.qty, 0) && c.amountYen === -c.qty * c.unitCostYen && c.lotAction === a.lotAction,
      `代替品設定 ${a.id} の仕入先への請求（不良控除）が合わない`);
    for (const po of a.poIds) need(altPos.some((y) => y.id === po && y.altId === a.id), `代替品設定 ${a.id} の追加発注 ${po} がない`);
    for (const x of a.disposals) need(has('dm.delivery.deliveries', x.deliveryId) && x.productId === a.productId, `代替品設定 ${a.id} の回収・廃棄の配送 ${x.deliveryId} がない`);
  }
  for (const c of claims) need(alts.some((a) => a.id === c.altId) && c.amountYen <= 0, `仕入先への請求 ${c.id} の代替品設定がない・額がマイナスでない`);
  for (const x of altPos) need(alts.some((a) => a.id === x.altId) && x.qty > 0, `追加発注 ${x.id} の代替品設定がない`);
  for (const d of deliveries.filter((x) => x.altId)) need(d.feeBy === 'ES' && !!d.parentId && alts.some((a) => a.id === d.altId), `追加配送 ${d.id} の配送費の負担（ES）・代替品設定が合わない`);

  /* アプリ・代理店と紹介フィー・営業サンプル・自販機の列・平均単価の目標（lib/domain/checkMore.ts） */
  p.push(...moreProblems(r));
  /* Bill One の送付・送り状番号・メールだけのお知らせ・HubSpot のお問い合わせ（lib/domain/checkIntegrations.ts） */
  p.push(...integrationProblems(r));
  /* アンケート（lib/domain/checkSurvey.ts） */
  p.push(...surveyProblems(r));
  /* 既存のお客様の移行（lib/domain/migrate.ts・受付簿 No.28） */
  p.push(...migrationProblems(r));
  /* スケジュールの移動・サイクル暦・ドライバーの報告・価格世代・一括変更（lib/domain/checkMove.ts） */
  p.push(...moveProblems(r));
  /* 倉庫在庫・入荷・棚卸なし（lib/domain/checkStock.ts） */
  p.push(...stockProblems(r));
  /* 4a・4b の答え（棚卸の数える配送・移動のトラブル・一括変更の確認・価格世代・入荷予定日の注意。lib/domain/checkDecisions.ts） */
  p.push(...decisionProblems(r));
  /* お試しの延長（lib/domain/trial.ts）・日次バッチの記録（lib/domain/batch.ts） */
  p.push(...trialProblems(r));
  p.push(...batchProblems(r));
  /* 旧システムのメール・予定のお知らせ（お客様の休みの日に出さない）・1回だけの通知（lib/domain/mails.ts） */
  p.push(...mailProblems(r));
  /* 2026/10/03 朝の決定（確定の月の反映待ち・オプションの管理名・設備引揚費・免許未登録のアカウント・お問い合わせの通知） */
  p.push(...packAProblems(r));
  /* 請求の後払いの税（販売価格は税込 → 請求書の明細は税抜）・事務手数料はオプションマスタ（lib/ops/areas/billing.ts） */
  p.push(...arrTaxProblems(r));
  /* 月間メニュー・商品マスタ（MM の決定との突合・2026/10/03。lib/domain/checkMenuMaster.ts） */
  p.push(...menuMasterProblems(r));
  /* 2026/10/02 定例の決定・優先 A（基準数のパターン・購入管理の名称・仕入先の出荷の入力。lib/domain/checkMm1002.ts） */
  p.push(...mm1002Problems(r));
  /* オプション・値引き・プラン・資材の費目のマスタ（2026/10/03 統一モデル。lib/domain/checkCharges.ts） */
  p.push(...chargeProblems(r));

  const counts = Object.fromEntries(
    [...MORE_COUNT_KINDS, ...INTEGRATION_COUNT_KINDS, ...SURVEY_COUNT_KINDS, ...MOVE_COUNT_KINDS, ...STOCK_COUNT_KINDS,'dm.org.corps', 'dm.org.branches', 'dm.org.contracts', 'dm.org.childContracts', 'dm.master.carriers', 'dm.master.drivers', 'dm.master.products', 'dm.master.productHistory', 'dm.delivery.deliveries', 'dm.delivery.legs', 'dm.delivery.troubles', 'dm.order.menus', 'dm.order.orders', 'dm.order.alts', 'dm.order.supplierClaims', 'dm.menu.kariApprovals', 'dm.apply.applications', 'dm.billing.invoices', 'dm.billing.adjustments', 'dm.report.deliveryReports', 'dm.report.stockChecks', 'dm.carrier.quotes', 'dm.notice.notifications', 'dm.account.accounts', 'dm.account.loginHistory']
      .map((k) => [k, r.list(k).length]),
  );
  return { ok: p.length === 0, counts, problems: p };
}

export default defineArea({ name: 'check', seed: () => ({}), queries: { run }, actions: {} });
