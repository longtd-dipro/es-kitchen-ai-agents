import type { DocRepo } from '@/lib/ops/core/area';
import { CHARGE_IDS, EXTRA_DELIVERY_OPTION, extraCount, initialItemsOf, LINKS, linkedProblems, optionAmount, cycleMonthAt } from './charges';
import type { Application, ChildContract, Discount, Material, MaterialOrder, Option, Plan, Model } from './types';
import { isTrialCycle } from './matOrder';

/*
 * check.run の続き（オプション・値引き・プラン・資材の費目のマスタ。2026/10/03 決定：1つのマスタ・lib/domain/charges.ts）：
 *   ・コードが使う ID（CHARGE_IDS）がマスタにある・マスタの trigger が同じ
 *   ・子契約のオプション・値引きの ID がマスタにある
 *   ・A型（ES-QR・ゲスト・現金・配送回数）は契約項目とオプションが合う。配送回数追加の行＝回数 × 金額（未確定の子契約）
 *   ・プランマスタの設定（企業負担額・免責金額・基本比×倍・初期備品）がある
 *   ・資材の注文：同じサイクル月の2回目から有料・プランの数量を超えた分の単価
 */
export function chargeProblems(r: DocRepo): string[] {
  const p: string[] = [];
  const need = (c: boolean, m: string) => { if (!c) p.push(m); };
  const opts = new Map(r.list<Option>('dm.master.options').map((o) => [o.id, o]));
  const discs = new Map(r.list<Discount>('dm.master.discounts').map((d) => [d.id, d]));

  /* コードが使う ID */
  for (const [trigger, id] of Object.entries(CHARGE_IDS)) {
    const x = id.startsWith('OP') ? opts.get(id) : discs.get(id);
    need(!!x, `コードが使う ${id}（${trigger}）が${id.startsWith('OP') ? 'オプション' : '値引き'}マスタにない`);
    if (x) need(!x.trigger || x.trigger === trigger, `${id} の trigger「${x.trigger}」がコード（${trigger}）と違う`);
  }
  /* A型：契約項目のあるオプションは A型・ほかは連動しない */
  for (const [item, l] of Object.entries(LINKS)) {
    const o = opts.get(l.id);
    need(!!o && o.linkType === 'A' && o.linkedItem === item, `A型オプション ${l.id}（${l.label}）の連動タイプ・契約項目がマスタと合わない`);
  }
  for (const o of opts.values()) if (o.linkType === 'A') need(!!o.linkedItem, `A型オプション ${o.id} に連動する契約項目がない`);

  /* 子契約 */
  const plans = new Map(r.list<Plan>('dm.master.plans').map((x) => [x.id, x]));
  for (const cc of r.list<ChildContract>('dm.org.childContracts').filter((x) => !x.canceled)) {
    for (const id of cc.optionIds) need(opts.has(id), `子契約 ${cc.id} のオプション ${id} がマスタにない`);
    for (const id of cc.discountIds) need(discs.has(id), `子契約 ${cc.id} の値引き ${id} がマスタにない`);
    p.push(...linkedProblems(plans.get(cc.planId), cc));
    /* 配送回数追加の行（未確定の子契約）：回数 × 金額（子契約の上書き・マスタ） */
    const o = opts.get(EXTRA_DELIVERY_OPTION);
    const line = cc.fees?.lines.find((l) => l.refId === EXTRA_DELIVERY_OPTION);
    if (o && line && cc.billStatus === '未確定') {
      const want = optionAmount(o, cc) * Math.max(1, extraCount(cc.deliveryExtra));
      need(line.amountYen === want, `子契約 ${cc.id} の配送回数追加 ${line.amountYen}円 が 回数 ${extraCount(cc.deliveryExtra)} × ${optionAmount(o, cc)}円 と違う`);
    }
    if (cc.amounts) for (const [id, v] of Object.entries(cc.amounts)) need(Number.isInteger(v) && v >= 0 && opts.has(id), `子契約 ${cc.id} の金額の上書き ${id}=${v} が正しくない`);
  }

  /* プランマスタの設定（効く項目は値を持つ・初期備品がコースごとにある） */
  for (const pl of plans.values()) {
    if (pl.status === '削除済') continue;
    need((pl.welfareYenPerMeal ?? 100) >= 0 && (pl.deductibleYen ?? 0) >= 0 && (pl.baseRatio ?? 1) > 0, `プラン ${pl.id} の企業負担額・免責金額・基本比×倍が正しくない`);
    for (const c of pl.prices.map((x) => x.course)) {
      const items = initialItemsOf(pl, c);
      need(items.length > 0, `プラン ${pl.id}（${c}）の初期備品（資材の初期セット）がない`);
      for (const it of items) need(!!r.get<Material>('dm.master.materials', it.materialId), `プラン ${pl.id} の初期備品の資材 ${it.materialId} が資材マスタにない`);
    }
    for (const it of pl.initialItems ?? []) need(Number.isInteger(it.qty) && it.qty >= 0 && pl.prices.some((x) => x.course === it.course), `プラン ${pl.id} の初期備品（${it.course}・${it.materialId}）の数・コースが正しくない`);
    for (const it of pl.includedMaterials ?? []) need(!!r.get<Material>('dm.master.materials', it.materialId) && it.qty >= 0, `プラン ${pl.id} のプランに含む資材 ${it.materialId} が正しくない`);
  }  /* 自販機の初期料金（機種マスタ・OP000008 の初期値：台帳 2026/10/03） */
  for (const md of r.list<Model>('dm.master.models')) if (md.initFeeYen !== undefined) need(Number.isInteger(md.initFeeYen) && md.initFeeYen >= 0, `機種 ${md.id} の初期料金が正しくない`);


  /* 資材マスタ：単価（税抜・整数の円）と税率・取扱倉庫・コースがある */
  for (const m of r.list<Material>('dm.master.materials')) {
    need(m.priceYen === undefined || (Number.isInteger(m.priceYen) && m.priceYen >= 0), `資材 ${m.id} の単価 ${m.priceYen} が正しくない`);
    need(!m.taxRateId || !!r.get('dm.master.taxRates', m.taxRateId), `資材 ${m.id} の税率 ${m.taxRateId} が税率マスタにない`);
    for (const w of m.warehouseIds ?? []) need(!!r.get('dm.master.warehouses', w), `資材 ${m.id} の取扱倉庫 ${w} が倉庫マスタにない`);
    need(m.courses === undefined || m.courses.length > 0, `資材 ${m.id} のコースが空`);
  }
  /* 受付の初期費用・金額の上書き（新規申込の拠点）：整数の円・オプションはマスタにある */
  for (const a of r.list<Application>('dm.apply.applications')) {
    for (const b of a.setup?.branches ?? []) {
      need(b.initFeeYen === undefined || (Number.isInteger(b.initFeeYen) && b.initFeeYen >= 0), `申込 ${a.id} の拠点「${b.name}」の初期費用 ${b.initFeeYen} が正しくない`);
      for (const [id, v] of Object.entries(b.amounts ?? {})) need(Number.isInteger(v) && v >= 0 && opts.has(id), `申込 ${a.id} の拠点「${b.name}」の金額の上書き ${id}=${v} が正しくない`);
    }
  }

  /* 資材の注文：納品予定日の同じサイクル月の2回目から有料（取消は数えない・お試しの拠点は付けない：受付簿 #277）・超えた分の単価は 0 より大きい */
  const mos = r.list<MaterialOrder>('dm.delivery.materialOrders').filter((m) => m.kind === 'regular' && m.status !== '取消').sort((a, b) => a.orderedAt.localeCompare(b.orderedAt) || a.id.localeCompare(b.id));
  const seen = new Set<string>(), MAT = CHARGE_IDS['event.materialOrderPaid'];
  for (const m of mos) {
    const cyc = cycleMonthAt(r, m.dueOn), k = `${m.branchId}|${cyc}`;
    /* 2回目以降は有料（お試しの拠点を除く）。1回目は有料でない（前の注文を取り消したら付け直す） */
    const want = seen.has(k) && !isTrialCycle(r, m.branchId, cyc);
    need(m.paid === want, `資材の注文 ${m.id} は同じサイクル月（納品予定日）の${seen.has(k) ? '2回目以降' : '1回目'}なので有料（${MAT}）は${want ? '付く' : '付かない'}はず`);
    seen.add(k);
    for (const e of m.excess ?? []) need(e.unitYen > 0 && e.qty > 0, `資材の注文 ${m.id} のプランの数量を超えた資材 ${e.materialId} の数・単価が正しくない`);
  }
  return p;
}
