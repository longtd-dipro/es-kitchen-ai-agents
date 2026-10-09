import { ApiError } from '@/lib/api/errors';
import { corpTerm } from '@/lib/domain/terms';
import type { DocRepo } from '@/lib/ops/core/area';
import { cycleMonthAt } from '@/lib/domain/charges';
import { md, rnd } from '@/lib/ops/menu/logic';
import { corpMaterialsOf } from '@/lib/domain/material';
import { matImg } from '@/lib/domain/matPhoto';
import order from '@/lib/domain/areas/order';
import { isNormal } from '@/lib/domain/alt';
import { shelfText, shortLabel } from '@/lib/domain/product';
import { slotDate } from '@/lib/domain/calendar';
import { listMenus, menuIds } from '@/lib/domain/menu';
import { today } from '@/lib/supplier/dates';
import type {
  Account, Branch, ChildContract, Contract, Corp, Cycle as DCycle, Delivery, Loan, MaterialOrder, Model, MonthlyMenu, Option, OrderPref, Pause,
  Plan, Product, ProductCategory, ProductOrder, Warehouse,
} from '@/lib/domain/types';
import { isOpenPause } from '@/lib/domain/types';
import { baseRatioOf } from '@/lib/domain/charges';
import { PROD_X } from './data';
import { matDueOf, mdWd, prevMonth, ym as ymJa } from './logic';
import { matLeadDays } from '@/lib/domain/matOrder';
import type { Acc, CDl, CMat, CSite, CurOrder, Cycle, LogRow, MatHist, Past, Pref, ProdX, Qty } from './types';
import type { Address, DeliveryLine } from '@/lib/domain/types';
import { DELIVERED } from '@/lib/domain/snapshot';

/*
 * 共通データ（lib/domain・dm.*）から、法人Web の月次注文の画面の形（Cycle・CSite・ProdX・CurOrder・資材）を作る。
 * 便のキー：画面は c1・c2（冷蔵・常温）／f1・f2（冷凍）、共通データは「温度帯:枠」（冷蔵:A2）。CDl.key で対応させる。
 * 商品の説明・アレルゲン・栄養成分・原材料・製造元、商品カテゴリの並びは共通データ（dm.master.products・dm.master.productCategories）。
 * 共通データにないもの：廃棄率・アンケートの見本・評価（data.ts の見本の値）。
 */

export type DPref = OrderPref & { applyNext?: boolean };

/* ---------------- サイクル（月間メニュー） ---------------- */

/** 今受け付けている月間メニュー（公開中。なければいちばん新しい月） */
export function curMenu(r: DocRepo): MonthlyMenu {
  const ms = listMenus(r).reverse();
  const m = ms.find((x) => x.status === '公開中') ?? ms[0];
  if (!m) throw new ApiError('月間メニューがありません', 404);
  return m;
}
const pd = (s: string) => { const a = s.split('/').map(Number); return Date.UTC(a[0], a[1] - 1, a[2]); };
export function cycleOf(m: MonthlyMenu, r?: DocRepo): Cycle {
  const open = m.status === '公開中' && m.orderFrom <= today() && today() <= m.orderTo;
  /* 受付中でないとき：締切を過ぎた直近の月（公開したメニューのうち締切日 < 今日のいちばん新しいもの） */
  const closed = !open && r ? listMenus(r).filter((x) => x.status !== '編集中' && x.orderTo < today()).map((x) => x.id).sort().pop() : undefined;
  return {
    ym: m.id, label: ymJa(m.id), from: m.orderFrom, to: m.orderTo,
    daysLeft: Math.max(0, Math.round((pd(m.orderTo) - pd(today())) / 864e5)),
    open, ...(closed ? { closedYm: closed } : {}),
  };
}

/* ---------------- 商品 ---------------- */

const TEMP: Record<string, ProdX['st']> = { 冷凍: 'frozen', 常温: 'ambient' };
const VM_L: Record<string, string> = { W: 'ダブル（8/10列）', S: 'シングル（8/10列）', B: 'ベルト' };
/** 写真の絵の種（M001〜M024＝1〜24、M025〜＝60〜。メイン画像がないとき） */
const imgOf = (id: string) => { const n = parseInt(id.slice(1), 10); return n <= 24 ? n : 35 + n; };
/**
 * 商品マスタの商品写真（メインの1枚）。運営のメニュー（menuEdit の imgOf）と同じ決め方：
 * 取り込んだ画像（data:／http／/）はそのまま src、見本のファイル名はファイル名から絵の種を作る
 */
const seedOf = (s: string) => [...s].reduce((a, c) => a + c.charCodeAt(0), 0) % 97;
const mainImg = (p: Product): { img: number; src?: string } => {
  const m = p.images.find((x) => x.main);
  if (!m) return { img: imgOf(p.id) };
  return /^(data:|https?:|\/)/.test(m.file) ? { img: imgOf(p.id), src: m.file } : { img: seedOf(m.file) };
};

/**
 * その月のメニューの商品（表示順。タグはその月のメニューの商品タグ）。past＝前の月の注文（見られる拠点の合計。画面は ×2 で出すので半分）。
 * あとに、公開したあとにメニューから外したが注文にまだ残っている商品（gone＝メニューから外れました。受付簿 #266①）
 */
export function productsOf(r: DocRepo, m: MonthlyMenu, branchIds: string[]): ProdX[] {
  const prev = r.list<ProductOrder>('dm.order.orders').filter((o) => o.cycleMonth === prevMonth(m.id) && branchIds.includes(o.branchId));
  const inMenu = menuIds(m);
  const goneIds = [...new Set(r.list<ProductOrder>('dm.order.orders').filter((o) => o.cycleMonth === m.id && branchIds.includes(o.branchId) && o.status !== '取消')
    .flatMap((o) => o.lines.filter(isNormal).map((l) => l.productId)))].filter((id) => !inMenu.includes(id)).sort();
  return [...inMenu.map((id) => [id, false] as const), ...goneIds.map((id) => [id, true] as const)]
    .map(([id, gone]) => [r.get<Product>('dm.master.products', id), gone] as const).filter((x): x is readonly [Product, boolean] => !!x[0]).map(([p, gone]) => {
    const i = parseInt(p.id.slice(1), 10) - 1, x = PROD_X[p.id] ?? [0, 0, 0], n = p.nutrition.perServing;
    const past = prev.reduce((a, o) => a + o.lines.filter((l) => l.productId === p.id).reduce((b, l) => b + l.qty, 0), 0);
    return {
      /* 価格は公開したときの写し（公開前は商品マスタ） */
      id: p.id, name: p.name, nameEn: p.nameEn?.trim() || undefined, cat: p.category, st: TEMP[p.temp] ?? 'chilled', keep: TEMP[p.storage?.display ?? p.temp] ?? 'chilled', price: m.prices?.[p.id]?.priceYen ?? p.priceYen, tags: m.items.find((x) => x.productId === p.id)?.tags ?? [], exp: shortLabel(p), life: shelfText(p),
      vm: p.vmFrame, vmL: p.vmFrame ? VM_L[p.vmFrame] : '', past: Math.round(past / 2), ...mainImg(p),
      waste: x[0], like: x[1], cur: x[2],
      /* 商品解説・アレルゲン・栄養成分（1食当たり）・成分表示・製造元は商品マスタ（表示用タブ） */
      desc: p.description, alg: p.allergens.specific, alg2: p.allergens.equivalent, maker: p.makerUrl,
      nut: { kcal: n.kcal, g: n.servingG, pro: n.protein.toFixed(1), fat: n.fat.toFixed(1), carb: n.carbs.toFixed(1), salt: n.salt.toFixed(1) },
      raw: p.ingredients, ...(gone ? { gone: true } : {}),
      add: p.additives, rating: (3.6 + rnd(i + 2) * 1.3).toFixed(1), reviews: 20 + Math.round(rnd(i + 4) * 120),
    };
  });
}

/** 商品カテゴリ（表示順）。共通データの商品カテゴリ（dm.master.productCategories。なければ商品から） */
export function catsOf(r: DocRepo, P: ProdX[]): string[] {
  const cs = r.list<ProductCategory>('dm.master.productCategories').sort((a, b) => a.order - b.order).map((c) => c.name);
  return cs.length ? cs : [...new Set(P.map((p) => p.cat))];
}

/* ---------------- 拠点 ---------------- */

const shortOf = (b: Branch, corp?: Corp) => (corp && b.name.startsWith(corp.name) ? b.name.slice(corp.name.length).trim() : b.name);
const pauseOf = (r: DocRepo, ct: Contract, cyc: string) => r.list<Pause>('dm.org.pauses').find((p) => p.contractId === ct.id && p.fromCycle <= cyc && cyc <= p.toCycle);

/** 子契約の便（画面の CDl）。お届け日はその月の配送（なければサイクル暦の枠の日） */
function dlsOf(r: DocRepo, cc: ChildContract): CDl[] {
  const cyc = r.get<DCycle>('dm.delivery.cycles', cc.cycleMonth);
  const ds = r.list<Delivery>('dm.delivery.deliveries').filter((d) => d.childContractId === cc.id && !d.parentId);
  const cold = cc.channels.filter((c) => c.temp !== '冷凍'), froz = cc.channels.filter((c) => c.temp === '冷凍');
  const mk = (chs: ChildContract['channels'], fz: boolean) => chs.flatMap((ch) => ch.slots.map((slot) => ({ ch, slot })))
    .map(({ ch, slot }, i): CDl => {
      const d = ds.find((x) => x.slot === slot && x.temp === ch.temp);
      const date = d?.deliverOn ?? (cyc ? slotDate(cyc, slot) : '');
      return { k: (fz ? 'f' : 'c') + (i + 1), l: (fz ? '冷凍 第' : '第') + (i + 1) + '便', slot, t: fz ? 'frozen' : 'chilled', n: i + 1, date: date ? md(date) : '', key: `${ch.temp}:${slot}`, meals: ch.mealsPerDelivery };
    });
  return mk(cold, false).concat(mk(froz, true));
}

/** 拠点の注文の設定（なければ既定） */
export const prefRow = (r: DocRepo, branchId: string) => r.get<DPref>('dm.order.prefs', branchId);

/** 内部で使う拠点（画面の CSite ＋ その月の子契約） */
export type SiteX = { s: CSite; cc?: ChildContract };

/**
 * アカウントで見られる拠点（法人アカウント＝自社の拠点、拠点アカウント＝その拠点だけ）。
 * その月の子契約がある拠点と、休止中の拠点を出す（仮登録・終了・お試しが終わった拠点は出さない）
 */
export function sitesOf(r: DocRepo, a: Acc, cyc: string): SiteX[] {
  const corp = r.get<Corp>('dm.org.corps', a.corpId);
  /* 取り消した子契約（休止・解約・canceled）はお届けしない月なので使わない */
  const ccs = r.list<ChildContract>('dm.org.childContracts').filter((x) => !x.canceled);
  const out: SiteX[] = [];
  for (const b of r.list<Branch>('dm.org.branches').filter((x) => x.corpId === a.corpId && (a.role !== 'branch' || x.id === a.branchId))) {
    const ct = r.list<Contract>('dm.org.contracts').find((c) => c.branchId === b.id && ['有効', '解約手続き中', '利用休止'].includes(c.status));
    if (!ct) continue;
    const pz = pauseOf(r, ct, cyc), paused = ct.status === '利用休止' || !!pz;
    const cc = ccs.find((x) => x.contractId === ct.id && x.cycleMonth === cyc) ?? (paused ? ccs.filter((x) => x.contractId === ct.id).pop() : undefined);
    if (!cc && !paused) continue;
    const s = siteOf(r, b, corp, ct, cc, cyc, pz);
    /* 選べる商品＝共通データの order.forBranch の便ごとの商品（コース・温度帯・注文の設定の対象外・短消費期限） */
    if (cc?.cycleMonth === cyc && r.get('dm.order.menus', cyc)) {
      const fb = order.queries.forBranch(r, { branchId: b.id, cycleMonth: cyc });
      s.ok = [...new Set(fb.slots.flatMap((x) => x.products))];
      /* 公開したあとにメニューから外れた商品でも、注文に残っていれば出す（数は減らす・0にするだけ：受付簿 #266①） */
      const mn = r.get<MonthlyMenu>('dm.order.menus', cyc), po = orderRow(r, b.id, cyc);
      if (mn && po && po.status !== '取消') for (const l of po.lines.filter(isNormal)) if (!s.ok.includes(l.productId) && !menuIds(mn).includes(l.productId)) s.ok.push(l.productId);
      /* 代替品設定の対象（不良商品）は、その便には入れ直せない（共通データの order.saveOrder でも止める） */
      const bl: Record<string, string[]> = {}, alts = new Set<string>(), names = new Set<string>();
      for (const sl of fb.slots) for (const x of sl.blocked) {
        const k = s.dl.find((d) => d.key === sl.key)?.k;
        if (!k || sl.products.includes(x.productId)) continue;
        (bl[x.productId] ??= []).push(k); alts.add(x.altId); names.add(r.get<Product>('dm.master.products', x.productId)?.name ?? x.productId);
      }
      if (Object.keys(bl).length) {
        s.blocked = bl;
        s.altNote = `${[...names].join('・')}は商品の不良のため（代替品設定 ${[...alts].join('・')}）、対象の便では注文できません。代替品は「代替品（元：〇〇）」としてお届けします。`;
      }
    }
    out.push({ s, cc: cc?.cycleMonth === cyc ? cc : undefined });
  }
  return out;
}

function siteOf(r: DocRepo, b: Branch, corp: Corp | undefined, ct: Contract, cc: ChildContract | undefined, cyc: string, pz: Pause | undefined): CSite {
  const dl = cc ? dlsOf(r, cc) : [];
  const cold = dl.filter((d) => d.t !== 'frozen').reduce((x, d) => x + (d.meals ?? 0), 0), froz = dl.filter((d) => d.t === 'frozen').reduce((x, d) => x + (d.meals ?? 0), 0);
  const plan = cold + froz, ch = cc?.channels[0];
  const wh = ch ? r.get<Warehouse>('dm.master.warehouses', ch.warehouseId) : undefined;
  const eq = r.list<Loan>('dm.org.loans').filter((l) => l.branchId === b.id && l.status !== '回収済')
    .map((l) => r.get<Model>('dm.master.models', l.modelId)).filter((m): m is Model => !!m && m.category !== '資材ボックス').map((m) => m.name).join('・');
  const opt = (cc?.optionIds ?? []).map((id) => r.get<Option>('dm.master.options', id)?.name).filter(Boolean).join('・');
  /* これからの休止（承認済み）は備考に出す */
  const later = r.list<Pause>('dm.org.pauses').find((p) => p.contractId === ct.id && p.fromCycle > cyc);
  const ccs = r.list<ChildContract>('dm.org.childContracts').filter((x) => x.contractId === ct.id && !x.canceled).map((x) => x.cycleMonth).sort();
  const trial = cc?.kind === 'お試しキャンペーン';
  return {
    id: b.id, corp: b.corpId ?? '', corpName: corp?.name ?? '', short: shortOf(b, corp), name: b.name,
    plan, planId: cc?.planId ?? '—', course: cc?.course ?? '—', dlvKind: [...new Set(cc?.channels.map((c) => corpTerm(c.serviceForm)) ?? [])].join('・') || '—',
    kid: cc?.id ?? '—', eq: eq || '—', wh: wh ? wh.id + ' ' + wh.name : '',
    /* 月の上限（下限はなし。便ごとの数は自由） */
    cap: { chilled: [0, cold], ...(cc?.course === 'ESスタンダード' ? { frozen: [0, froz] as [number, number] } : {}) },
    /* 基本比×倍＝プランマスタの設定（なければ食数 ÷ 50） */
    mult: baseRatioOf(cc ? r.get<Plan>('dm.master.plans', cc.planId) : undefined, plan), ai: prefRow(r, b.id)?.applyNext ? 'ON' : 'OFF',
    dl, opt: opt || undefined,
    note: later ? (isOpenPause(later) ? ymJa(later.fromCycle) + '分から休止（再開月は未定）のため、次のご注文は再開月が決まってからです。' : ymJa(later.fromCycle) + '〜' + ymJa(later.toCycle) + '分は休止（承認済み）のため、次のご注文は ' + ymJa(later.resumeCycle) + '分です。') : undefined,
    start: ct.startCycle, paused: !!pz || ct.status === '利用休止', pauseFrom: pz?.fromCycle,
    pauseNote: pz ? (isOpenPause(pz) ? `${shortOf(b, corp)}は ${ymJa(pz.fromCycle)}分から休止しています（再開の予定は未定です）。` : `${shortOf(b, corp)}は ${ymJa(pz.fromCycle)}分から ${ymJa(pz.toCycle)}分まで休止しています（${pz.reason || '休止'}。再開の予定は ${ymJa(pz.resumeCycle)}分）。`) : undefined,
    trial, trialNote: trial ? 'お試し ' + ymJa(ccs[0]) + '〜' + ymJa(ccs[ccs.length - 1]) + '分。お試しのご注文はシステムが、すべての商品に均等に振り分けて自動で作成します。法人Webでは見るだけです（変更・AI・アンケートはありません）。数を変えたいときはESキッチンへご相談ください。' : undefined,
  };
}

/* ---------------- 商品注文 ---------------- */

/** 変更した人（アカウントID → 画面の名前） */
export function whoOf(r: DocRepo, id: string, sites: CSite[]): string {
  if (!id || id === 'system') return 'システム';
  const s = sites.find((x) => x.id === id);
  if (s) return s.short + '（拠点アカウント）';
  const c = r.get<Corp>('dm.org.corps', id);
  if (c) return c.name + '（法人アカウント）';
  const ac = r.get<Account>('dm.account.accounts', id);
  return ac ? ac.name + (ac.site === 'ops' ? '（運営）' : '') : id;
}
const logRows = (r: DocRepo, o: ProductOrder, sites: CSite[]): LogRow[] => o.log.map((e) => ({ at: e.at, who: whoOf(r, e.by, sites), what: e.what, detail: e.detail }));

/**
 * 注文の行 → 画面の数（商品 → 便 → 数）。zeros＝選べる商品・便は 0 で埋める。
 * 法人が直す数は通常の行だけ（代替品の行＝差替・補償・除外は変更履歴に「代替品（元：〇〇）」で出し、保存しても残る）
 */
export function qtyOf(s: CSite, lines: ProductOrder['lines'], P?: ProdX[]): Qty {
  const q: Qty = {};
  (P ?? []).forEach((p) => { q[p.id] = {}; s.dl.forEach((d) => { if ((d.t === 'frozen') === (p.st === 'frozen')) q[p.id][d.k] = 0; }); });
  lines.filter(isNormal).forEach((l) => { const d = s.dl.find((x) => x.key === l.slot); if (d) q[l.productId] = { ...(q[l.productId] ?? {}), [d.k]: l.qty }; });
  return q;
}
/** 画面の数 → 注文の行（共通データの saveOrder に渡す形） */
export function linesOf(s: CSite, q: Qty) {
  const out: { productId: string; slot: string; qty: number }[] = [];
  Object.keys(q).forEach((pid) => Object.keys(q[pid]).forEach((k) => {
    const d = s.dl.find((x) => x.k === k), n = q[pid][k] || 0;
    if (d?.key && n > 0) out.push({ productId: pid, slot: d.key, qty: n });
  }));
  return out;
}

export const orderRow = (r: DocRepo, branchId: string, cyc: string) => r.list<ProductOrder>('dm.order.orders').find((o) => o.branchId === branchId && o.cycleMonth === cyc);

/** 今のサイクルの商品注文。休止中は作らない */
export function curOrder(r: DocRepo, x: SiteX, cyc: string, P: ProdX[], sites: CSite[]): CurOrder {
  const s = x.s;
  if (s.paused) return { no: '', status: '休止中', q: {}, log: [] };
  const o = orderRow(r, s.id, cyc), list = P.filter((p) => s.ok?.includes(p.id) ?? true);
  /* 代替品設定で入れられない便（0 の欄）は出さない */
  const cut = (q: Qty) => { Object.entries(s.blocked ?? {}).forEach(([pid, ks]) => ks.forEach((k) => { if (q[pid] && !q[pid][k]) delete q[pid][k]; })); return q; };
  if (!o) return { no: '', status: 'デフォルト', q: cut(qtyOf(s, [], list)), log: [] };
  return { no: o.id, status: o.status, q: cut(qtyOf(s, o.lines, list)), log: logRows(r, o, sites) };
}

/** 注文履歴：今のサイクルより前の月のオーダーステータス・変更履歴・数 */
export function pastOf(r: DocRepo, s: CSite, cyc: string, sites: CSite[]): { past?: Past; pastQ: Record<string, Qty> } {
  const os = r.list<ProductOrder>('dm.order.orders').filter((o) => o.branchId === s.id && o.cycleMonth < cyc);
  if (!os.length) return { pastQ: {} };
  const p: Past = { id: s.id, st: {}, log: {} }, pastQ: Record<string, Qty> = {};
  os.forEach((o) => { p.st[o.cycleMonth] = o.status; p.log![o.cycleMonth] = logRows(r, o, sites); pastQ[o.cycleMonth] = qtyOf(s, o.lines); });
  return { past: p, pastQ };
}

/** 商品の金額（注文の設定で選ぶもの） */
const PRICES = [100, 200];
/** 注文の設定（画面の形。金額は単価の範囲に入る金額） */
export const prefOf = (p: DPref | undefined, cats: string[]): Pref =>
  ({ cats: p?.categories ?? cats.slice(), short: p?.allowShortLife !== false, price: PRICES.filter((y) => !p || (p.priceRange[0] <= y && y <= p.priceRange[1])), ex: p?.excluded ?? [] });
/** 画面の金額（選んだ金額の一覧）→ 共通データの単価の範囲 */
export const rangeOf = (price: number[]): [number, number] => (price.length ? [Math.min(...price), Math.max(...price)] : [PRICES[0], PRICES[PRICES.length - 1]]);

/* ---------------- 資材 ---------------- */

/**
 * 資材（資材マスタ dm.master.materials のコース・単位・写真）。公開ステータスが非公開・削除済の資材は出さない
 * （カートに入れてあっても注文できない：台帳 F「資材マスタの作り」③・受付簿 #361。既存の注文は変えない）
 */
export function materialsOf(r: DocRepo): CMat[] {
  return corpMaterialsOf(r).map((m, i) => ({ id: m.id, name: m.name, course: m.courses.join('・'), unit: m.unit, ...matImg(m.photo, 40 + i) }));
}
export const matOrders = (r: DocRepo, ids: string[]) => r.list<MaterialOrder>('dm.delivery.materialOrders').filter((m) => ids.includes(m.branchId));
export const matQ = (m: MaterialOrder) => Object.fromEntries(m.lines.map((l) => [l.materialId, l.qty])) as Record<string, number>;
export const matKind = (m: MaterialOrder) => (m.kind === 'initial_set' ? '初期セット' : '通常注文');

/** 資材便の配送状態（法人向けの言い方） */
const MAT_ST: Partial<Record<Delivery['status'], string>> = {
  予定: '出荷待', 出荷待: '出荷待', 出荷済: '出荷済', 受取済: '出荷済', 納品済: 'お届け済', 一部納品済: 'お届け済', 再配達待: '再配送予定', 確認中: 'お届け済', 中止: 'お届け中止', 取消: '取消',
};
/**
 * 注文履歴（資材注文）の行。発送日・送り状番号は運営が資材注文管理で入れた値（MaterialOrder.shippedOn・trackingNo）だけを出し、
 * お届け予定日は 発送日＋リードタイム（契約の配送区分（資材）の値：lib/domain/matOrder.ts の matLeadDays。入っていなければ2日）。発送日がなければ「—」（hong 2026-10-05 版1.0レビュー ⑩・受付簿 No.154）。
 * mats＝資材マスタ（名前・単位）。lines は注文履歴 詳細で資材注文No ごとに資材の数を出すため
 */
export function matHistOf(r: DocRepo, m: MaterialOrder, mats: CMat[]): MatHist {
  const d = r.get<Delivery>('dm.delivery.deliveries', m.deliveryId);
  const n = m.lines.reduce((a, l) => a + l.qty, 0);
  const due = matDueOf(m.shippedOn, matLeadDays(r, m.branchId, m.orderedAt.slice(0, 10)));
  const trouble = d && (d.status === '確認中' || r.list<{ deliveryId: string; resolution: string }>('dm.delivery.troubles').some((t) => t.deliveryId === d.id && !t.resolution));
  return {
    no: m.id, kind: matKind(m), site: m.branchId, od: m.orderedAt.slice(0, 10),
    sd: m.shippedOn ? m.shippedOn.replace(/-/g, '/') : '', dd: due ? mdWd(due) : '', slip: m.trackingNo ?? '',
    what: m.lines.length + '種類・' + n + '点', st: (d && MAT_ST[d.status]) ?? m.status, check: trouble ? '配送状況を確認中' : undefined,
    ym: m.cycleMonth ?? cycleMonthAt(r, m.orderedAt.slice(0, 10)),
    lines: m.lines.map((l) => { const x = mats.find((y) => y.id === l.materialId); return { id: l.materialId, name: x?.name ?? l.materialId, qty: l.qty, unit: x?.unit ?? '' }; }),
  };
}

