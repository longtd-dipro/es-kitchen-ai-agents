import { ApiError } from '@/lib/api/errors';
import type { DocRepo } from '@/lib/ops/core/area';
import { addDays, nowStamp, today } from '@/lib/supplier/dates';
import { schedule, slotDate, slotOf } from './calendar';
import { addYm, getMenu, monthlyLimit } from './menu';
import { notify, notifyBranch } from './notify';
import { childLocked, feesNow, methodOf, pricesAt, publicPricesOf, yenOf } from './snapshot';
import { recordLockedSkip, type LockedSkip } from './locked';
import { addCharge, adjustmentsOf, billedOf, finalIssueMonth, prepayOf, sameByRate, settleMonth } from './adjust';
import { countsToLimit, isNormal } from './alt';
import { deliversIn, refreshDefaultOrders, setBasePattern, slotsOf, syncDeliveryLines } from './areas/order';
import { activateReferral, setContractSource } from './areas/referral';
import type {
  Account, Address, Application, Billing, Branch, Carrier, Channel, ChildContract, Contact, Contract, Corp, Course, Cycle, Delivery, EquipFee, EquipProposal,
  EquipRow, ExtraFee, Holiday, Invoice, Leg, Loan, MaterialOrder, Model, Notification, NewSetup, Option, Pause, Plan, ProductOrder, SetupBranch, BillAdjustment,
} from './types';
import { isOpenPause } from './types';
import { yen } from '@/lib/format/money';
import { amountOf, CHARGE_IDS, EXTRA_DELIVERY_OPTION, initFeeOf, initialItemsOf, MIGRATE_DISCOUNT, monthlyOptionsYen, optionOf, syncLinked, TRIAL_DISCOUNT, VM_LEASE_OPTION } from './charges';
import { legsFor, routeOfSlot } from './route';

/*
 * 申請の承認で共通データを変える流れ（課題 3-2・3-4・3-5・3-6・3-7・3-12。決定は 00_確認してほしい/課題一覧 の「Bước 3」と 01_仕様/00_決定 の 28-xx）。
 *   新規申込：仮登録（法人・拠点・親契約・アカウント・最初の注文・資材の初期セット）→ 本登録（子契約・配送・資材便・貸出）。
 *             本登録は運営が「必須の情報をすべて入れた」と確かめてから（missingOf が空・checked）。締切を過ぎたら翌サイクルから（28-27）
 *   お試し→本導入：親契約はそのまま（契約種別を変えて kindHistory に残す）。設備は本導入の開始日から数える（28-17）。
 *             お試しの終わりから本導入までの間は休止と同じ（28-35）・1年を超えるなら新規申込（28-37）・メール M3
 *   休止：締切前のサイクルから子契約を「取消」（残す・一覧に出さない 28-12）、その月の配送・注文を取り消す。締切を過ぎた月は届ける。通算1年まで（28-10）
 *   解約：親契約を解約手続き中・拠点を閉鎖予定（28-62・28-65）、解約日のあとの子契約・配送・注文を取り消す、委託配送先へ通知、
 *         貸出を「回収予定」（回収の配送は作らない）、違約金＝回収額 × 残り月数 ÷ 最低利用期間（設備ごと・28-2）。アカウントは参照のみ → 最後の請求書の入金期限のあと停止（S4-3）
 *   プランの変更：まだ請求していない最初のサイクルから（28-5・28-27）。確定・請求済の子契約は変えない。1回の納品数＝月次提供上限 ÷ 配送回数（温度帯ごと 28-153・154）、
 *         デフォルトの注文は作り直す・登録済で新しい上限を超える注文はデフォルトに戻して法人へ再注文のお願い。設備の異動の案（入替・追加・回収と費用の案）を承認で貸出へ
 *   毎日の処理（dailyTick）：休止の開始・終わりで契約の状態、解約日で終了・閉鎖、入金期限のあとアカウント停止
 */

const K = {
  corps: 'dm.org.corps', branches: 'dm.org.branches', contacts: 'dm.org.contacts', contracts: 'dm.org.contracts', children: 'dm.org.childContracts',
  pauses: 'dm.org.pauses', loans: 'dm.org.loans', cycles: 'dm.delivery.cycles', holidays: 'dm.delivery.holidays', deliveries: 'dm.delivery.deliveries',
  legs: 'dm.delivery.legs', mos: 'dm.delivery.materialOrders', orders: 'dm.order.orders', accounts: 'dm.account.accounts', apps: 'dm.apply.applications',
} as const;

/**
 * 法人ステータスを拠点の状態から決め直す（台帳 F 運営A(1)：本登録の拠点があれば正式登録（最初の拠点の本登録で仮登録→正式登録・休眠からも戻る）／
 * 正式登録の法人は全拠点が閉鎖・取消になったら休眠。取消の法人は動かさない）。休眠＝法人アカウントは利用停止、戻ったら有効に戻す。
 * 拠点の状態・所属法人が変わるところ（運営の編集・CSV・付け替え・解約日の閉鎖・取消）から呼ぶ
 */
export function syncCorpStatus(r: DocRepo, corpId: string | null | undefined) {
  const c = corpId ? r.get<Corp>(K.corps, corpId) : undefined;
  if (!c || c.status === '取消') return;
  const bs = r.list<Branch>(K.branches).filter((b) => b.corpId === c.id);
  const next: Corp['status'] = bs.some((b) => b.status === '本登録') ? '正式登録'
    : c.status === '正式登録' && bs.length && bs.every((b) => b.status === '閉鎖' || b.status === '取消') ? '休眠' : c.status;
  if (next === c.status) return;
  r.put<Corp>(K.corps, c.id, { ...c, status: next });
  const acc = r.get<Account>(K.accounts, c.id);
  if (acc && next === '休眠' && acc.status === '有効') r.put<Account>(K.accounts, acc.id, { ...acc, status: '利用停止' });
  if (acc && c.status === '休眠' && next === '正式登録' && acc.status === '利用停止') r.put<Account>(K.accounts, acc.id, { ...acc, status: '有効' });
}

const STD: Course = 'ESスタンダード';
const LIGHT: Course = 'ESライト（冷蔵庫）';
/*
 * 費目の ID（旧ライト→スタンダード移行割 DC000021・お試しキャンペーン割引 DC000013・配送回数追加 OP000001・設備配送料 OP000019／020・
 * 階段作業 OP000021・サイズ差額 OP000023・設備引揚費 OP000022・初期費用 OP000008）は lib/domain/charges.ts の CHARGE_IDS。金額はオプションマスタ
 */
export { MIGRATE_DISCOUNT, PULL_OPTION } from './charges';

/** 設備の配送料（OP000019＝1台・OP000020＝2台以上。決定 28-16・28-53）。金額・名前はオプションマスタ */
function swapFee(r: DocRepo, moved: number) {
  const o = optionOf(r, moved === 1 ? 'event.equipSwapOne' : 'event.equipSwapMany');
  const one = amountOf(r, 'event.equipSwapOne'), many = amountOf(r, 'event.equipSwapMany'), stairs = optionOf(r, 'event.equipStairs');
  return {
    name: o?.name ?? '設備配送料', id: o?.id ?? '', amountYen: o?.amountYen ?? 0,
    basis: `オプションマスタ ${CHARGE_IDS['event.equipSwapOne']}（1台 ${yen(one)}）／${CHARGE_IDS['event.equipSwapMany']}（2台以上 ${yen(many)}）`
      + (stairs ? `。エレベーターなし3階以上は ${stairs.name}（${stairs.id}・${yen(stairs.amountYen)}）を足す` : '') + '（決定 28-16・28-53）',
  };
}
/** サイズ差額のオプション名（OP000023） */
const sizeName = (r: DocRepo) => optionOf(r, 'event.equipSizeDiff')?.name.replace(/（月額）$/, '') ?? 'サイズ差額';

/** 休止の理由：申請に書かれた「休止の理由」（詳しく があれば続けて）。申請の先頭の行は「変更したいこと＝休止」なので使わない */
export function pauseReasonOf(a: Pick<Application, 'request'>): string {
  const v = (k: string) => a.request.find((x) => x[0] === k)?.[1]?.trim() ?? '';
  const why = v('休止の理由'), memo = v('詳しく');
  return why && memo ? `${why}（${memo}）` : why || memo;
}

/* ---------------- サイクル ---------------- */

const cyclesOf = (r: DocRepo) => r.list<Cycle>(K.cycles);
const cycleOf = (r: DocRepo, ym: string) => r.get<Cycle>(K.cycles, ym);
/** オーダー締切（サイクル暦にあればその値、なければ前月15日） */
export function closeOf(r: DocRepo, ym: string) {
  const c = cycleOf(r, ym);
  if (c) return c.orderCloseOn;
  const p = addYm(ym, -1);
  return `${p.replace('-', '/')}/15`;
}
/** 締切を過ぎていたら翌サイクルへ（決定 28-27）。返すのは反映するサイクル月 */
export function effectiveStart(r: DocRepo, ym: string, day = today()) {
  let x = ym;
  for (let i = 0; i < 24 && day > closeOf(r, x); i++) x = addYm(x, 1);
  return x;
}
/** その日を含むサイクル（暦の外は ''） */
export function cycleAt(r: DocRepo, day = today()) {
  return cyclesOf(r).find((c) => c.a1 <= day && day <= c.d7)?.id ?? '';
}
/** from〜to のサイクル数（両端を含む） */
export const monthsIn = (from: string, to: string) => {
  const [a, b] = [from, to].map((x) => x.split('-').map(Number));
  return (b[0] - a[0]) * 12 + (b[1] - a[1]) + 1;
};
/** サイクルの最終日（暦の D7。暦の外は月末） */
const cycleEnd = (r: DocRepo, ym: string) => {
  const c = cycleOf(r, ym);
  if (c) return c.d7;
  const n = addYm(ym, 1).replace('-', '/');
  return addDays(`${n}/01`, -1);
};
export const cycleStart = (r: DocRepo, ym: string) => cycleOf(r, ym)?.a1 ?? `${ym.replace('-', '/')}/01`;
const pad = (n: number, w: number) => String(n).padStart(w, '0');
const yymmdd = (d: string) => d.slice(2).replace(/\//g, '');
const nextNum = (ids: string[], re: RegExp) => Math.max(0, ...ids.map((x) => x.match(re)).filter(Boolean).map((m) => Number(m![1]))) + 1;

/* ---------------- 書き換えの記録（日次バッチで失敗した処理だけ戻す：batch.ts） ---------------- */

/** 変えたドキュメントの元。通知・操作の記録・申請そのものは戻さない */
export type Journal = { kind: string; id: string; prev: unknown }[];
const NO_JOURNAL = new Set<string>(['dm.notice.notifications', 'dm.account.audit', K.apps]);
/** 書き換えを記録する DocRepo（最初の元の値だけを残す） */
export function journaled(r: DocRepo, j: Journal): DocRepo {
  const seen = new Set<string>();
  const note = (kind: string, id: string) => {
    const key = `${kind}|${id}`;
    if (NO_JOURNAL.has(kind) || seen.has(key)) return;
    seen.add(key);
    j.push({ kind, id, prev: r.get(kind, id) ?? null });
  };
  return {
    list: <T>(kind: string) => r.list<T>(kind),
    get: <T>(kind: string, id: string) => r.get<T>(kind, id),
    put: <T>(kind: string, id: string, data: T) => { note(kind, id); r.put<T>(kind, id, data); },
    remove: (kind: string, id: string) => { note(kind, id); r.remove(kind, id); },
    nextSeq: (key: string) => r.nextSeq(key),
  };
}
/** 記録した元に戻す（新しく作ったものは消す） */
export function rollback(r: DocRepo, j: Journal) {
  for (const x of [...j].reverse()) {
    if (x.prev === null || x.prev === undefined) r.remove(x.kind, x.id);
    else r.put(x.kind, x.id, x.prev);
  }
}

/* ---------------- 配送・注文 ---------------- */

const contractOfBranch = (r: DocRepo, branchId: string) => r.list<Contract>(K.contracts).find((c) => c.branchId === branchId);
/** 親契約の子契約（取消は除く・サイクル月の順） */
export const liveChildren = (r: DocRepo, contractId: string) =>
  r.list<ChildContract>(K.children).filter((x) => x.contractId === contractId && !x.canceled).sort((x, y) => x.cycleMonth.localeCompare(y.cycleMonth));

export { legsFor } from './route';
const newDeliveryId = (r: DocRepo, shipOn: string) => {
  const prefix = `DL-${yymmdd(shipOn)}`;
  return `${prefix}-${pad(nextNum(r.list<Delivery>(K.deliveries).map((x) => x.id), new RegExp(`^${prefix}-(\\d{4})$`)), 4)}`;
};

/**
 * 子契約の便の配送を作る（ない便だけ。取り消した同じ便があれば戻す）。サイクル暦にない月・お届けできない枠は作らない。
 * 状態は締切前＝予定、締切後＝出荷待。返り値＝作った・戻した配送ID
 */
export function ensureDeliveries(r: DocRepo, cc: ChildContract): string[] {
  const cy = cycleOf(r, cc.cycleMonth), b = r.get<Branch>(K.branches, cc.branchId);
  if (!cy || !b || cc.canceled || !deliversIn(r, cc)) return [];
  /* その月の配送をまだ作っていない（日次バッチの前の）サイクルは作らない */
  if (!r.list<Delivery>(K.deliveries).some((d) => d.cycleMonth === cc.cycleMonth && d.temp !== '資材' && d.childContractId !== cc.id)) return [];
  const cycles = cyclesOf(r), hs = r.list<Holiday>(K.holidays);
  const mine = r.list<Delivery>(K.deliveries).filter((d) => d.childContractId === cc.id && !d.parentId);
  const status: Delivery['status'] = today() > cy.orderCloseOn ? '出荷待' : '予定';
  const out: string[] = [];
  for (const ch of cc.channels) {
    for (const slot of ch.slots) {
      /* 回ごとのルート（上書きがあればその回だけ倉庫・運び手・中継が違う） */
      const rc = routeOfSlot(ch, slot);
      const ex = mine.filter((d) => d.slot === slot && d.temp === ch.temp);
      if (ex.some((d) => d.status !== '取消')) continue;
      const s = schedule(cycles, hs, slotDate(cy, slot), ch.leadDays);
      if (!s) continue;
      const back = ex.find((d) => d.shipOn === s.shipOn && d.deliverOn === s.deliverOn);
      if (back) {
        r.put<Delivery>(K.deliveries, back.id, { ...back, status, changeState: status === '予定' ? '変更可' : '変更不可' });
        out.push(back.id);
        continue;
      }
      const id = newDeliveryId(r, s.shipOn);
      r.put<Delivery>(K.deliveries, id, {
        id, parentId: '', branchId: b.id, contractId: cc.contractId, childContractId: cc.id, cycleMonth: cc.cycleMonth, slot,
        temp: ch.temp, serviceForm: rc.serviceForm, regime: rc.regime, warehouseId: rc.warehouseId, shipOn: s.shipOn, deliverOn: s.deliverOn, status,
        plannedQty: 0, deliveredQty: null, deliveredAt: '', completion: '',
        destination: { name: b.name, address: b.address, tel: b.tel, windows: b.receiveWindows, note: b.deliveryNote },
        changeState: status === '予定' ? '変更可' : '変更不可', internalMemo: '',
      });
      for (const l of legsFor(id, rc, b.id)) r.put<Leg>(K.legs, l.id, l);
      out.push(id);
    }
  }
  return out;
}

/** 子契約のまだ出荷していない配送を取り消す（only＝その温度帯だけ）。返り値＝取り消した配送 */
export function cancelDeliveries(r: DocRepo, ccId: string, why: string, only?: (d: Delivery) => boolean): Delivery[] {
  const out: Delivery[] = [];
  for (const d of r.list<Delivery>(K.deliveries).filter((x) => x.childContractId === ccId && ['予定', '出荷待', '確認中'].includes(x.status) && (!only || only(x)))) {
    const next: Delivery = { ...d, status: '取消', changeState: '変更不可', internalMemo: [d.internalMemo, `取消：${why}`].filter(Boolean).join('\n') };
    r.put<Delivery>(K.deliveries, d.id, next);
    out.push(next);
  }
  return out;
}

/** 取り消した配送を、委託配送先（委託・引き取り）へ知らせる */
function notifyCarriers(r: DocRepo, ds: Delivery[], why: string) {
  const by = new Map<string, Delivery[]>();
  for (const d of ds) {
    for (const l of r.list<Leg>(K.legs).filter((x) => x.deliveryId === d.id)) {
      if (r.get<Carrier>('dm.master.carriers', l.carrierId)?.kind !== '委託・引き取り') continue;
      by.set(l.carrierId, [...(by.get(l.carrierId) ?? []), d]);
    }
  }
  for (const [carrierId, xs] of by) {
    const uniq = [...new Map(xs.map((d) => [d.id, d])).values()].sort((a, b) => a.deliverOn.localeCompare(b.deliverOn));
    notify(r, {
      to: { site: 'carrier', accountId: r.get(K.accounts, carrierId) ? carrierId : '', role: '' }, templateId: '', title: `配送の取消（${uniq[0].destination.name}・${uniq.length}件）`,
      body: `${why}のため、${uniq.map((d) => d.deliverOn).join('・')} のお届けを取り消しました。`, link: { type: 'delivery', id: uniq[0].id },
    });
  }
}

/** 子契約を取り消す（データは残す・一覧に出さない 28-12）。その月の配送を取り消し、注文を消す。返り値＝取り消した配送 */
export function cancelChild(r: DocRepo, cc: ChildContract, why: string, applicationId: string): Delivery[] {
  r.put<ChildContract>(K.children, cc.id, { ...cc, canceled: { at: nowStamp(), reason: why, applicationId } });
  const ds = cancelDeliveries(r, cc.id, why);
  for (const o of r.list<ProductOrder>(K.orders).filter((x) => x.childContractId === cc.id)) r.remove(K.orders, o.id);
  return ds;
}

/**
 * 確定・請求済の子契約の月を止める（子契約は変えない＝7-1。配送・注文だけ取り消し、返金は請求調整）。返り値＝取り消した配送
 */
function stopLockedMonth(r: DocRepo, cc: ChildContract, why: string): Delivery[] {
  const ds = cancelDeliveries(r, cc.id, why);
  for (const o of r.list<ProductOrder>(K.orders).filter((x) => x.childContractId === cc.id)) r.remove(K.orders, o.id);
  return ds;
}

/** 休止の状態を今のサイクルに合わせる（やり直しのあと。休止中なら利用休止、そうでなければ有効） */
export function syncPauseState(r: DocRepo, contractId: string) {
  const c = r.get<Contract>(K.contracts, contractId), cur = cycleAt(r);
  if (!c || !cur || !['有効', '利用休止'].includes(c.status)) return;
  const paused = r.list<Pause>(K.pauses).some((p) => p.contractId === c.id && p.fromCycle <= cur && cur <= p.toCycle);
  const status = paused ? '利用休止' : '有効';
  if (c.status !== status) r.put<Contract>(K.contracts, c.id, { ...c, status });
}

/** 取り消した子契約を戻す（再開・やり直し）。配送を作り直し、デフォルトの注文を作る */
function restoreChild(r: DocRepo, cc: ChildContract, orders = true) {
  const { canceled: _c, ...rest } = cc;
  void _c;
  r.put<ChildContract>(K.children, cc.id, rest);
  ensureDeliveries(r, rest);
  if (orders) refreshOrders(r, rest);
}

/** その月のデフォルトの注文を作り直し（メニューが公開中のときだけ。ほかは公開のときに作る）、配送の明細を注文にそろえる */
export function refreshOrders(r: DocRepo, cc: ChildContract) {
  const st = getMenu(r, cc.cycleMonth)?.status;
  if (st === '公開中') refreshDefaultOrders(r, cc.cycleMonth);
  /* 公開前（編集中）の月にデフォルトの注文があれば、この子契約の分だけ作り直す（便・上限・倉庫が変わったとき） */
  else if (st === '編集中' && r.list<ProductOrder>(K.orders).some((o) => o.childContractId === cc.id)) refreshDefaultOrders(r, cc.cycleMonth, [cc.id]);
  const now = r.get<ChildContract>(K.children, cc.id) ?? cc;
  const o = r.list<ProductOrder>(K.orders).find((x) => x.childContractId === cc.id);
  syncDeliveryLines(r, slotsOf(r, now), o?.lines ?? []);
}

/**
 * プランの変更で、登録済の注文が新しい上限を超える・なくなった便に行がある → デフォルトに戻す（決定：Bước 3 (a)）。
 * 代替品の行は残す。戻したら true（法人へ再注文のお願いを出す）
 */
function resetIfOver(r: DocRepo, cc: ChildContract, by: string) {
  const o = r.list<ProductOrder>(K.orders).find((x) => x.childContractId === cc.id);
  if (!o || !['登録済', 'ES登録済'].includes(o.status)) return false;
  const keys = new Set(slotsOf(r, cc).map((s) => s.key));
  const total = o.lines.filter(countsToLimit).reduce((a, l) => a + l.qty, 0), limit = monthlyLimit(cc);
  if (total <= limit && o.lines.every((l) => keys.has(l.slot))) return false;
  const at = nowStamp();
  r.put<ProductOrder>(K.orders, o.id, {
    ...o, status: 'デフォルト', lines: o.lines.filter((l) => !isNormal(l) && keys.has(l.slot)), updatedAt: at, updatedBy: by,
    log: [{ at, by, what: 'プランの変更でデフォルトに戻しました', detail: `登録済の合計 ${total}個・新しい上限 ${limit}個` }, ...o.log],
  });
  return true;
}

/* ---------------- プラン・食数 ---------------- */

const planOf = (r: DocRepo, id: string) => r.get<Plan>('dm.master.plans', id);
const isFrozen = (ch: Pick<Channel, 'temp'>) => ch.temp === '冷凍';

/**
 * プランとコースに合わせた便：ESスタンダードで冷凍の上限があり冷凍の便がなければ、冷蔵の便と同じ枠で冷凍の便を足す。冷凍の上限がなければ冷凍の便を外す。
 * 1回の納品数＝温度帯の月次提供上限 ÷ その温度帯の便の回数（切り捨て・決定 28-153・28-154）。extra＝プランの標準の配送回数を超える回数（配送回数追加）
 */
export function planChannels(plan: Plan | undefined, course: Course | '', channels: Channel[]) {
  const lim = (t: '冷蔵' | '冷凍') => plan?.limits?.find((x) => x.course === course && x.temp === t);
  const cool = lim('冷蔵'), frozen = lim('冷凍');
  let chs = channels.map((c) => ({ ...c, slots: [...c.slots] }));
  if (frozen && frozen.meals > 0 && !chs.some(isFrozen)) {
    const base = chs.find((c) => !isFrozen(c));
    if (base) chs.push({ ...base, slots: [...base.slots], temp: '冷凍' });
  }
  if (!(frozen && frozen.meals > 0) && chs.some((c) => !isFrozen(c))) chs = chs.filter((c) => !isFrozen(c));
  let extra = 0;
  for (const [group, l] of [[false, cool], [true, frozen]] as const) {
    const mine = chs.filter((c) => isFrozen(c) === group);
    const n = mine.reduce((a, c) => a + c.slots.length, 0);
    if (!n) continue;
    const meals = l?.meals ?? (group ? 0 : plan?.monthlyMeals ?? 0);
    for (const c of mine) c.mealsPerDelivery = Math.floor(meals / n);
    extra += Math.max(0, n - (l?.deliveries ?? n));
  }
  return { channels: chs, extra };
}

/** 子契約の月額（税抜）＝プランのコースの価格＋月額のオプション（金額の上書き・配送回数追加の回数を含む。運営の画面と同じ見方） */
function monthlyOf(r: DocRepo, plan: Plan | undefined, cc: Pick<ChildContract, 'course' | 'optionIds' | 'amounts' | 'deliveryExtra' | 'optionQty'> & Partial<Pick<ChildContract, 'cycleMonth' | 'priceGenId' | 'channels'>>) {
  /* 価格は子契約の世代（priceGenId・なければサイクル月、どちらもなければ公開用）× コース × 配送方法（台帳 E 2026-10-05） */
  const list = cc.cycleMonth || cc.priceGenId ? pricesAt(plan, cc.cycleMonth, cc.priceGenId) : publicPricesOf(plan);
  const price = yenOf(list.find((p) => p.course === cc.course), methodOf(cc));
  return price + monthlyOptionsYen(r, cc);
}

/**
 * 子契約をプラン・コースに合わせる（便・1回の納品数・配送回数追加・移行割・月額・① 費目）。
 * migrate＝今のライト（冷蔵庫）からスタンダードへ上げる（旧ライト→スタンダード移行割・7-2）
 */
export function withPlan(r: DocRepo, cc: ChildContract, planId: string, course: Course, opts: { migrate?: boolean; dropMigrate?: boolean; kind?: ChildContract['kind'] } = {}): ChildContract {
  const plan = planOf(r, planId);
  const pc = planChannels(plan, course, cc.channels);
  const kind = opts.kind ?? cc.kind;
  let discountIds = cc.discountIds.filter((x) => x !== MIGRATE_DISCOUNT && (kind !== '本導入' || x !== TRIAL_DISCOUNT));
  /* dropMigrate＝承認の画面で運営が移行割のチェックを外した（受付簿 No.16） */
  if (course === STD && !opts.dropMigrate && (opts.migrate || cc.discountIds.includes(MIGRATE_DISCOUNT))) discountIds = [...discountIds, MIGRATE_DISCOUNT];
  /* 配送回数追加（温度帯ごとの回数）・A型のオプションと契約項目は lib/domain/charges.ts の syncLinked でそろえる */
  const synced = syncLinked(r, { ...cc, kind, planId, course, channels: pc.channels, discountIds }, cc);
  const next: ChildContract = { ...synced, monthlyYen: monthlyOf(r, plan, synced) };
  return { ...next, fees: feesNow(r, next) };
}

/* ---------------- 設備の異動（3-6・お試し→本導入） ---------------- */

const modelOf = (r: DocRepo, id: string) => r.get<Model>('dm.master.models', id);
const sizeOf = (r: DocRepo, id: string) => modelOf(r, id)?.monthlyYen ?? 0;

/** 設備の異動の案の種類：plan＝プランの変更／trial＝お試し→本導入／equip＝設備の変更（申請） */
export type EquipMode = 'plan' | 'trial' | 'equip';

/**
 * 今の貸出（貸出中）とプランの標準貸出設備を比べて、設備の異動の行を作る（equip は今の貸出をそのまま並べる）。
 * mode＝plan（プランの変更：小さいものは入替・足りないものは追加・余るものは回収）／trial（お試し→本導入：余る・大きいものは置いたまま・差額を1回だけ）
 */
export function equipRows(r: DocRepo, branchId: string, planId: string, course: Course | '', mode: EquipMode): EquipRow[] {
  const std = (planOf(r, planId)?.stdEquipment ?? []).filter((x) => x.course === course);
  const cur = r.list<Loan>(K.loans).filter((l) => l.branchId === branchId && l.status === '貸出中');
  const cat = (id: string) => modelOf(r, id)?.category ?? '資材ボックス';
  /* 設備の変更（申請）：今の貸出を「継続」で並べる。運営がお客様の申請に合わせて入替・追加・回収に直す（決定 28-18・28-163） */
  if (mode === 'equip') return cur.map((l) => ({ category: cat(l.modelId), action: '継続', fromModelId: l.modelId, toModelId: l.modelId, qty: l.qty, loanId: l.id, note: '' }));
  const cats = [...new Set([...std.map((x) => cat(x.modelId)), ...cur.map((l) => cat(l.modelId))])];
  const rows: EquipRow[] = [];
  const add = (x: EquipRow) => {
    const same = rows.find((y) => y.category === x.category && y.action === x.action && y.fromModelId === x.fromModelId && y.toModelId === x.toModelId && y.loanId === x.loanId && y.note === x.note);
    if (same) same.qty += x.qty; else rows.push(x);
  };
  for (const category of cats) {
    const has = cur.filter((l) => cat(l.modelId) === category).flatMap((l) => Array.from({ length: l.qty }, () => l)).sort((a, b) => sizeOf(r, b.modelId) - sizeOf(r, a.modelId));
    const want = std.filter((x) => cat(x.modelId) === category).flatMap((x) => Array.from({ length: x.qty }, () => x.modelId)).sort((a, b) => sizeOf(r, b) - sizeOf(r, a));
    const n = Math.min(has.length, want.length);
    for (let i = 0; i < n; i++) {
      const l = has[i], m = want[i], d = sizeOf(r, m) - sizeOf(r, l.modelId);
      if (d > 0) add({ category, action: '入替', fromModelId: l.modelId, toModelId: m, qty: 1, loanId: l.id, note: '標準のサイズへ' });
      else if (d < 0) add({ category, action: '継続', fromModelId: l.modelId, toModelId: l.modelId, qty: 1, loanId: l.id, note: 'サイズが標準より大きい' });
      else add({ category, action: '継続', fromModelId: l.modelId, toModelId: l.modelId, qty: 1, loanId: l.id, note: '' });
    }
    for (const m of want.slice(n)) add({ category, action: '追加', fromModelId: '', toModelId: m, qty: 1, loanId: '', note: '' });
    for (const l of has.slice(n)) add({ category, action: mode === 'plan' ? '回収' : '継続', fromModelId: l.modelId, toModelId: mode === 'plan' ? '' : l.modelId, qty: 1, loanId: l.id, note: '標準を超える分' });
  }
  return rows;
}

/** 設備の異動の行のキー（費用の案の key） */
const k = (x: EquipRow) => `${x.category}:${x.fromModelId}>${x.toModelId}`;

/** 標準の同じ区分で、いちばん大きい機種の月額（サイズ差額の元） */
const stdSize = (r: DocRepo, planId: string, course: Course | '', category: Model['category']) =>
  Math.max(0, ...(planOf(r, planId)?.stdEquipment ?? []).filter((x) => x.course === course && modelOf(r, x.modelId)?.category === category).map((x) => sizeOf(r, x.modelId)));

/**
 * 設備の異動の費用の案（運営が承認の前に直せる）。
 *   plan：入れ替えの配送（28-16 のたたき台・単発）／標準を超えて置いたままの台の月額（28-182）／標準より大きいサイズの差額（月額）／移行割のお客様の冷凍庫の賃料（月額・7-2）
 *   trial：お試しで置いた設備がプランの標準より多い・大きい分を1回だけ（本導入の最初の請求書。少ないときは返さない）。金額＝月額 × 最低利用期間【仮】
 */
export function equipFees(r: DocRepo, rows: EquipRow[], ctx: { planId: string; course: Course | ''; mode: EquipMode; migrate: boolean }): EquipFee[] {
  const fees: EquipFee[] = [];
  const name = (id: string) => modelOf(r, id)?.name ?? id;
  if (ctx.mode === 'equip') {
    /*
     * 設備の変更（申請・決定 28-16・28-18・28-163・2026/10/01 P3）：入替・追加・回収の配送（単発）、
     * サイズアップは機種の月額の差（サイズ差額・月額）、追加は機種の月額（月額）。回収は費用なし（今の月額の費用はそのまま。要るなら運営が直す）
     */
    const moved = rows.filter((x) => x.action !== '継続').reduce((a, x) => a + x.qty, 0);
    if (moved) { const f = swapFee(r, moved); fees.push({ key: 'swap', name: `${f.name}（入替・追加・回収 ${moved}台）`, amountYen: f.amountYen, kind: '単発', src: '入れ替えの配送', on: true, basis: f.basis }); }
    for (const x of rows) {
      const to = modelOf(r, x.toModelId), from = modelOf(r, x.fromModelId);
      /* 自販機の月額は自販機リース（OP000037）の台数で請求する（二重にしない・台帳 2026/10/03） */
      if (to?.category === '自販機') continue;
      if (x.action === '入替' && to && from && to.monthlyYen > from.monthlyYen) {
        fees.push({ key: `size:${x.loanId || k(x)}`, name: `${sizeName(r)}：${from.name} → ${to.name}（${x.qty}台）`, amountYen: (to.monthlyYen - from.monthlyYen) * x.qty, kind: '月額', src: 'サイズ差額', on: true, basis: `機種マスタの月額の差 ${yen(to.monthlyYen - from.monthlyYen)} × ${x.qty}台（2026/10/01 回答 P3：差額はオプション請求）` });
      }
      if (x.action === '追加' && to?.monthlyYen) {
        fees.push({ key: `add:${k(x)}`, name: `${to.name}（追加・${x.qty}台）`, amountYen: to.monthlyYen * x.qty, kind: '月額', src: '設備の異動', on: true, basis: `機種マスタの月額 ${yen(to.monthlyYen)} × ${x.qty}台（決定 28-182）` });
      }
    }
    return fees;
  }
  if (ctx.mode === 'plan') {
    const moved = rows.filter((x) => x.action !== '継続').reduce((a, x) => a + x.qty, 0);
    if (moved) { const f = swapFee(r, moved); fees.push({ key: 'swap', name: `${f.name}（入れ替え ${moved}台）`, amountYen: f.amountYen, kind: '単発', src: '入れ替えの配送', on: true, basis: f.basis }); }
  }
  for (const x of rows.filter((y) => y.action === '継続' && y.note)) {
    const m = modelOf(r, x.fromModelId);
    if (!m || m.category === '自販機') continue;
    const per = x.note === '標準を超える分' ? m.monthlyYen : m.monthlyYen - stdSize(r, ctx.planId, ctx.course, x.category);
    if (per <= 0) continue;
    if (ctx.mode === 'plan') {
      fees.push({ key: `${x.note === '標準を超える分' ? 'beyond' : 'size'}:${x.loanId}`, name: `${name(x.fromModelId)}（${x.note}・${x.qty}台）`, amountYen: per * x.qty, kind: '月額', src: x.note === '標準を超える分' ? '設備の異動' : 'サイズ差額', on: true, basis: x.note === '標準を超える分' ? `機種マスタの月額 ${yen(m.monthlyYen)} × ${x.qty}台（決定 28-182）` : `標準の機種との月額の差 ${yen(per)} × ${x.qty}台（決定 28-182【暫定】）` });
    } else {
      const months = Math.max(1, m.minMonths);
      fees.push({ key: `trial:${x.loanId}:${x.note}`, name: `お試しの設備の差額：${name(x.fromModelId)}（${x.note}・${x.qty}台）`, amountYen: per * months * x.qty, kind: '単発', src: 'お試し設備の差額', on: true, basis: `月額 ${yen(per)} × 最低利用期間 ${months}ヶ月 × ${x.qty}台【仮】（本導入の最初の請求書で1回だけ。少ないときは返金しない）` });
    }
  }
  if (ctx.mode === 'plan' && ctx.migrate) {
    for (const x of rows.filter((y) => y.category === '冷凍庫' && y.action !== '回収')) {
      const m = modelOf(r, x.toModelId || x.fromModelId);
      if (m?.monthlyYen) fees.push({ key: `fz:${m.id}`, name: `冷凍庫の賃料：${m.name}（${x.qty}台）`, amountYen: m.monthlyYen * x.qty, kind: '月額', src: '冷凍庫の賃料', on: true, basis: '旧ライト→スタンダード移行割のお客様は冷凍庫の賃料（機種マスタの月額）をいただく（7-2。新しくスタンダードを申し込んだお客様は無料）' });
    }
  }
  return fees;
}

/** 移行割の対象か（今の子契約がライト（冷蔵庫）・移行割を持ち、スタンダードに上げる） */
export const migrating = (cc: Pick<ChildContract, 'course' | 'discountIds'> | undefined, course: Course | '') =>
  !!cc && course === STD && (cc.course === LIGHT || cc.discountIds.includes(MIGRATE_DISCOUNT));

/** 設備の異動の案（保存した案があればそれ、なければ今のデータから作る） */
export function proposalFor(r: DocRepo, a: { equipment?: Application['equipment']; startCycle?: string }, branchId: string, mode: EquipMode, planId: string, course: Course | ''): EquipProposal {
  const saved = a.equipment?.[branchId];
  if (saved) return saved;
  const ct = contractOfBranch(r, branchId);
  const cur = ct ? liveChildren(r, ct.id).filter((x) => !a.startCycle || x.cycleMonth < a.startCycle).pop() ?? liveChildren(r, ct.id)[0] : undefined;
  const rows = equipRows(r, branchId, planId, course, mode);
  return { rows, fees: equipFees(r, rows, { planId, course, mode, migrate: mode === 'plan' && migrating(cur, course) }), note: '', updatedAt: '', updatedBy: '', edited: false };
}

/**
 * 自販機リース（OP000037）の台数を、拠点に貸出中の自販機の台数にそろえる（設備の異動・本登録のあと）。
 * 未確定の子契約だけ（確定・請求済は変えない）。1台の金額（契約ごとに直した値）はそのまま
 */
export function refreshVmLease(r: DocRepo, branchId: string) {
  for (const cc of r.list<ChildContract>(K.children).filter((x) => x.branchId === branchId && !childLocked(x) && !x.canceled && x.optionIds.includes(VM_LEASE_OPTION))) {
    const next = syncLinked(r, cc, cc);
    if (next.optionQty?.[VM_LEASE_OPTION] === cc.optionQty?.[VM_LEASE_OPTION] && next.amounts?.[VM_LEASE_OPTION] === cc.amounts?.[VM_LEASE_OPTION]) continue;
    const m = { ...next, monthlyYen: monthlyOf(r, planOf(r, next.planId), next) };
    r.put<ChildContract>(K.children, cc.id, { ...m, fees: feesNow(r, m) });
  }
}

const newLoanId = (r: DocRepo) => `LN-${pad(nextNum(r.list<Loan>(K.loans).map((x) => x.id), /^LN-(\d+)$/), 4)}`;

/** 貸出の qty 台を回収予定にする（一部なら行を分ける） */
function collect(r: DocRepo, loan: Loan, qty: number, dueOn: string, applicationId: string) {
  if (qty >= loan.qty) { r.put<Loan>(K.loans, loan.id, { ...loan, status: '回収予定', dueOn, applicationId }); return; }
  r.put<Loan>(K.loans, loan.id, { ...loan, qty: loan.qty - qty });
  const id = newLoanId(r);
  r.put<Loan>(K.loans, id, { ...loan, id, qty, status: '回収予定', dueOn, applicationId });
}

/**
 * 設備の異動の案を貸出に反映する（入替・回収＝回収予定、入替・追加＝貸出中を足す）。費用の案（on）は子契約の extras に付ける：
 * 単発＝最初の子契約、月額＝対象の子契約すべて。確定・請求済の子契約には付けない（返り値の注意に出す）
 */
export function applyEquipment(r: DocRepo, a: Pick<Application, 'id'>, branchId: string, p: EquipProposal, startOn: string, targets: ChildContract[], countFrom?: string): string {
  for (const x of p.rows) {
    const loan = x.loanId ? r.get<Loan>(K.loans, x.loanId) : undefined;
    if ((x.action === '入替' || x.action === '回収') && loan && loan.status === '貸出中') collect(r, loan, x.qty, startOn, a.id);
    if ((x.action === '入替' || x.action === '追加') && x.toModelId) {
      const id = newLoanId(r);
      r.put<Loan>(K.loans, id, { id, branchId, modelId: x.toModelId, qty: x.qty, startOn, status: '貸出中', countFrom: startOn, applicationId: a.id });
    }
  }
  /* お試し→本導入：置いたままの設備は本導入の開始日から数える（28-17） */
  if (countFrom) for (const l of r.list<Loan>(K.loans).filter((x) => x.branchId === branchId && x.status === '貸出中' && x.applicationId !== a.id)) r.put<Loan>(K.loans, l.id, { ...l, countFrom });
  refreshVmLease(r, branchId);
  const on = p.fees.filter((f) => f.on && f.amountYen);
  if (!on.length) return '';
  const open = targets.filter((c) => !childLocked(c) && !c.canceled);
  /* 確定・請求済の月（前払い・年払いで請求した月）には付けられないので、次の請求書の調整明細にする（TL-7 A） */
  const locked = targets.filter((c) => childLocked(c) && !c.canceled);
  const adj: string[] = [];
  const put = (cc: ChildContract, f: EquipFee) => {
    const now = r.get<ChildContract>(K.children, cc.id) ?? cc;
    const x: ExtraFee = { name: f.name, amountYen: Math.round(f.amountYen), taxRate: 10, kind: f.kind, src: f.src, applicationId: a.id };
    r.put<ChildContract>(K.children, cc.id, { ...now, extras: [...(now.extras ?? []).filter((e) => !(e.applicationId === a.id && e.name === f.name)), x] });
  };
  const charge = (cc: ChildContract | undefined, f: EquipFee) => {
    const ct = cc ? undefined : contractOfBranch(r, branchId);
    const x = addCharge(r, { cc, branchId, contractId: cc?.contractId ?? ct?.id ?? '', name: `${f.name}（${f.kind}）`, amountYen: Math.round(f.amountYen), taxRate: 10, kind: '設備の費用', reason: f.name, applicationId: a.id, by: '' });
    if (x) adj.push(`${cc ? cc.cycleMonth + ' ' : ''}${f.name} ${yen(f.amountYen)}`);
  };
  for (const f of on) {
    if (f.kind === '単発') { if (open[0]) put(open[0], f); else charge(locked[0], f); }
    else { open.forEach((cc) => put(cc, f)); locked.forEach((cc) => charge(cc, f)); if (!open.length && !locked.length) charge(undefined, f); }
  }
  return adj.length ? `確定・請求済の月の費用（${adj.join('・')}）は、調整明細として次の請求書に載せます。` : '';
}

/* ---------------- プランの変更 ---------------- */

/**
 * プランの変更を反映する（拠点1つ）。開始＝締切前の最初のサイクル（late＝代理なら申請の月のまま）。確定・請求済の子契約は変えない。
 * 便・食数・注文・配送をそろえ、設備の異動の案を貸出・子契約の費用に反映する。返り値＝通知に足す注意
 */
export function applyPlanChange(r: DocRepo, a: Application, branchId: string, opts: { late?: '繰り下げ' | '代理'; by: string; migrate?: boolean }): string {
  const contract = contractOfBranch(r, branchId);
  const planId = a.change.planId;
  if (!contract || !planId) return '';
  const notes: string[] = [];
  let start = a.startCycle;
  if (opts.late !== '代理') {
    const s2 = effectiveStart(r, start);
    if (s2 !== start) notes.push(`オーダー締切（${closeOf(r, start)}）を過ぎたため、${s2} サイクルから反映します（決定 28-27）。`);
    start = s2;
  }
  const mine = liveChildren(r, contract.id);
  const before = mine.filter((x) => x.cycleMonth < start).pop() ?? mine[0];
  const course = a.change.course ?? before?.course ?? STD;
  /* 移行割：承認の画面であらかじめチェック（運営が外せる：台帳 2026/10/03）。外したら DC000021 だけ付けない（冷凍庫賃料などはそのまま） */
  const migrate = migrating(before, course) && opts.migrate !== false, dropMigrate = opts.migrate === false;
  const targets = mine.filter((x) => x.cycleMonth >= start);
  /* 確定（まだ発行していない）の月は変えない（請求の画面で確定解除してから）。請求済の月は下で調整明細 */
  const locked = targets.filter((x) => x.billStatus === '確定');
  const changed: ChildContract[] = [];
  const adjs: BillAdjustment[] = [];
  const nameOf = (id: string) => planOf(r, id)?.name ?? id;
  for (const cc of targets.filter((x) => x.billStatus !== '確定')) {
    const next = withPlan(r, cc, planId, course, { migrate, dropMigrate });
    if (cc.billStatus === '請求済') {
      /*
       * 請求済みの月（前払い・年払いで先に請求した月）：契約（プラン・コース・便）は新しい値、① 費目は請求したときの値のまま。
       * 差額（日割りなし・サイクル月の満額の差）を調整明細にして次の請求書に載せる（決定 TL-7 A・仕様整理 §1-1）
       */
      r.put<ChildContract>(K.children, cc.id, { ...next, fees: cc.fees });
      const x = settleMonth(r, cc, prepayOf(next), { kind: 'プランの変更', reason: `${nameOf(cc.planId)}${cc.course !== course ? ` ${cc.course}` : ''} → ${nameOf(planId)}${cc.course !== course ? ` ${course}` : ''}`, applicationId: a.id, by: opts.by });
      if (x) adjs.push(x);
      changed.push(r.get<ChildContract>(K.children, cc.id)!);
      continue;
    }
    r.put<ChildContract>(K.children, cc.id, next);
    changed.push(next);
  }
  /* 確定の月は反映待ちとして残す（承認の画面・運営の TOP にアラート。確定解除してから billing.reapplyLocked で反映・2026/10/03 決定） */
  for (const cc of locked) recordLockedSkip(r, cc, { source: 'プランの変更', applicationId: a.id, planId, course, migrate, reason: '', by: opts.by });
  if (locked.length) notes.push(`${locked.map((x) => `${x.cycleMonth}（${x.billStatus}）`).join('・')} サイクルは請求の画面で確定済みのため変えていません（確定解除してから「反映」してください。運営の TOP にも出ます）。`);
  if (adjs.length) notes.push(`請求済みの月 ${adjs.length}件（${adjs.map((x) => x.cycleMonth).join('・')}）の差額 合計 ${yen(adjs.reduce((s2, x) => s2 + x.afterYen - x.billedYen, 0))}（税抜）を調整明細にし、次の請求書で精算します。`);
  /* 開始月より後に未確定の子契約がないときは、次のサイクル月の子契約を新しいプランで作る（変更が後の月に引き継がれるように） */
  const last = mine[mine.length - 1];
  if (last && !changed.length) {
    const ym = addYm(last.cycleMonth, 1);
    const id = `${contract.id}-${ym.replace('-', '')}`;
    const next: ChildContract = { ...withPlan(r, last, planId, course, { migrate, dropMigrate }), id, cycleMonth: ym, billStatus: '未確定', gen: '手動生成', extras: (last.extras ?? []).filter((e) => e.kind === '月額') };
    r.put<ChildContract>(K.children, id, { ...next, fees: feesNow(r, next) });
    changed.push(r.get<ChildContract>(K.children, id)!);
    notes.push(`${ym} サイクルから反映します。`);
  }
  /* 配送：なくなった温度帯の便は取り消し、新しい便は作る。注文：登録済で上限を超えるものはデフォルトに戻す・デフォルトは作り直す */
  let reset = 0;
  const canceled: Delivery[] = [];
  for (const cc of changed) {
    canceled.push(...cancelDeliveries(r, cc.id, `${a.id} プランの変更`, (d) => !cc.channels.some((c) => c.temp === d.temp && c.slots.includes(d.slot))));
    ensureDeliveries(r, cc);
    if (resetIfOver(r, cc, opts.by)) reset++;
    refreshOrders(r, cc);
  }
  if (canceled.length) notifyCarriers(r, canceled, 'プランの変更');
  if (reset) {
    notifyBranch(r, branchId, {
      templateId: 'order_reset', title: 'プランの変更にともない、商品注文をデフォルトに戻しました',
      body: `新しいプランの月の上限（1回の食数 × 配送の回数）を超えるため、${changed.filter((c) => r.list<ProductOrder>(K.orders).some((o) => o.childContractId === c.id && o.status === 'デフォルト')).map((c) => c.cycleMonth).join('・')} サイクルの注文をデフォルトに戻しました。受付期間中にあらためてご注文ください。`,
      link: { type: '', id: '' },
    });
    notes.push(`登録済の注文 ${reset}件は新しい上限を超えるためデフォルトに戻しました（法人へ再注文のお願い）。`);
  }
  /* 設備の異動（承認の前に運営が直した案があればそれ） */
  const p = proposalFor(r, a, branchId, 'plan', planId, course);
  const startOn = cycleStart(r, changed[0]?.cycleMonth ?? start);
  const en = applyEquipment(r, a, branchId, p, startOn, changed);
  if (en) notes.push(en);
  if (p.rows.some((x) => x.action !== '継続')) notes.push(`設備の異動：${p.rows.filter((x) => x.action !== '継続').map((x) => `${x.action} ${modelOf(r, x.toModelId || x.fromModelId)?.name ?? ''}×${x.qty}`).join('・')}（${startOn}）。`);
  return notes.join('');
}

/* ---------------- 設備の変更（申請） ---------------- */

/**
 * 設備の変更の申請を反映する（拠点1つ・決定 28-16・28-18・28-163）。運営が承認の前に直した設備の異動の案（なければ今の貸出のまま＝変更なし）で、
 * 貸出（入替・回収＝回収予定、入替・追加＝貸出中）と子契約の費用（単発＝最初の未確定の子契約、月額＝開始月からの未確定の子契約）を変える。
 * 確定・請求済の月の費用は調整明細（次の請求書）。開始＝締切前の最初のサイクル（late＝代理なら申請の月のまま）
 */
export function applyEquipChange(r: DocRepo, a: Application, branchId: string, opts: { late?: '繰り下げ' | '代理'; by: string }): string {
  const contract = contractOfBranch(r, branchId);
  if (!contract) return '';
  const notes: string[] = [];
  let start = a.startCycle || cycleAt(r) || addYm(today().slice(0, 7).replace('/', '-'), 1);
  if (opts.late !== '代理') {
    const s2 = effectiveStart(r, start);
    if (s2 !== start) notes.push(`オーダー締切（${closeOf(r, start)}）を過ぎたため、${s2} サイクルから反映します（決定 28-27）。`);
    start = s2;
  }
  const mine = liveChildren(r, contract.id);
  const cur = mine.filter((x) => x.cycleMonth < start).pop() ?? mine[0];
  const p = proposalFor(r, a, branchId, 'equip', cur?.planId ?? '', cur?.course ?? '');
  if (!p.rows.some((x) => x.action !== '継続') && !p.fees.some((f) => f.on && f.amountYen)) return [...notes, '設備の異動の案に変更がないため、貸出・費用は変えていません。'].join('');
  const targets = mine.filter((x) => x.cycleMonth >= start);
  const startOn = cycleStart(r, start);
  const en = applyEquipment(r, a, branchId, p, startOn, targets);
  if (en) notes.push(en);
  const moved = p.rows.filter((x) => x.action !== '継続');
  if (moved.length) notes.push(`設備の異動：${moved.map((x) => `${x.action} ${modelOf(r, x.toModelId || x.fromModelId)?.name ?? ''}×${x.qty}`).join('・')}（${startOn}）。回収の配送はシステムでは作りません（回収したら貸出を「回収済」に）。`);
  return notes.join('');
}

/* ---------------- 休止・再開 ---------------- */

/** 契約の休止の通算（サイクル数）。except＝数えない休止 */
export const pausedMonths = (r: DocRepo, contractId: string, except = '') =>
  r.list<Pause>(K.pauses).filter((p) => p.contractId === contractId && p.id !== except && !p.voided && !isOpenPause(p)).reduce((s, p) => s + monthsIn(p.fromCycle, p.toCycle), 0);

/** 休止の状態：取消（取り消した休止）／休止予定（まだ始まっていない）／休止中／終了。契約ステータスの値ではなく表示 */
export type PauseState = '取消' | '休止予定' | '休止中' | '終了';
const nowCycle = (r: DocRepo) => cycleAt(r) || today().slice(0, 7).replace('/', '-');
export function pauseStateOf(r: DocRepo, p: Pause, cur = nowCycle(r)): PauseState {
  if (p.voided) return '取消';
  if (p.fromCycle > cur) return '休止予定';
  return cur <= p.toCycle ? '休止中' : '終了';
}
/**
 * 拠点の契約タブの『休止期間』の行（開始の新しい順）。months＝休止期間のサイクル数（取消・終わりが未定の移行の休止は0・通算1年に入れない）。open＝終わりが未定（移行の休止中）。
 * 取消した休止は label＝『取消した休止（0か月）』。子契約の『取消』の行は org.canceledChildren（canceled つきの子契約）
 */
export function pauseRowsOf(r: DocRepo, contractId: string) {
  const cur = nowCycle(r);
  return r.list<Pause>(K.pauses).filter((p) => p.contractId === contractId).sort((x, y) => y.fromCycle.localeCompare(x.fromCycle)).map((p) => {
    const state = pauseStateOf(r, p, cur), months = p.voided || isOpenPause(p) ? 0 : monthsIn(p.fromCycle, p.toCycle);
    return { id: p.id, state, fromCycle: p.fromCycle, toCycle: p.voided ? '' : p.toCycle, resumeCycle: p.resumeCycle, months, applicationNo: p.applicationNo, cancelApplicationNo: p.cancelApplicationNo ?? '', reason: p.reason, keepEquipment: p.keepEquipment, voided: !!p.voided, open: isOpenPause(p), label: p.voided ? '取消した休止（0か月）' : isOpenPause(p) ? `${state}（終わり未定）` : `${state}（${months}か月）` };
  });
}
/** 『再開』できる休止（休止中を先に、なければこれから始まる休止予定）。ない拠点は再開できない（台帳 運営A Q12・Q14） */
export function resumablePause(r: DocRepo, contractId: string): { pause: Pause; state: '休止中' | '休止予定' } | undefined {
  const cur = nowCycle(r), ps = r.list<Pause>(K.pauses).filter((p) => p.contractId === contractId && !p.voided);
  const on = ps.find((p) => p.fromCycle <= cur && cur <= p.toCycle);
  if (on) return { pause: on, state: '休止中' };
  const next = ps.filter((p) => p.fromCycle > cur).sort((x, y) => x.fromCycle.localeCompare(y.fromCycle))[0];
  return next ? { pause: next, state: '休止予定' } : undefined;
}
/** 再開の対象の拠点（休止中・休止予定）。運営の代理入力の選択肢に使う。pauseFrom＝休止予定の開始月（再開予定月＝この月・休止期間0） */
export function resumableBranches(r: DocRepo) {
  const out: { branchId: string; state: '休止中' | '休止予定'; fromCycle: string; toCycle: string; pauseId: string }[] = [];
  for (const c of r.list<Contract>(K.contracts)) {
    const x = resumablePause(r, c.id);
    if (x) out.push({ branchId: c.branchId, state: x.state, fromCycle: x.pause.fromCycle, toCycle: x.pause.toCycle, pauseId: x.pause.id });
  }
  return out;
}
/** 承認待ち（受付中・契約設定中）の『切替』申請がある拠点か。あれば拠点の『本導入に切り替える』は非活性（台帳 運営A 2026-10-06 (5)） */
export function hasPendingSwitch(r: DocRepo, branchId: string): boolean {
  return r.list<Application>(K.apps).some((a) => a.type === 'new' && a.kubun === '切替' && ['受付中', '契約設定中'].includes(a.status)
    && (a.branchIds.includes(branchId) || !!a.setup?.branches.some((b) => b.branchId === branchId)));
}
export const PENDING_SWITCH_WHY = '承認待ちの切替申請があります（契約申請管理で処理してください）';

/**
 * 休止を反映する。締切を過ぎたサイクルは届ける（休止は締切前の最初のサイクルから）。通算1年まで（28-10）。
 * 休止の月の子契約は取消（確定・請求済は残して請求調整）、配送・注文も取り消す。休止中に入っていれば親契約を利用休止にする（拠点は休止中・28-65）。
 * 設備を置いたままにしない（既定）なら、貸出を回収予定にする（回収の配送は作らない）
 */
export function applyPause(r: DocRepo, a: Application, branchId: string, by = ''): string {
  const contract = contractOfBranch(r, branchId);
  const from0 = a.change.fromCycle, to = a.change.toCycle;
  if (!contract || !from0 || !to) return '';
  const notes: string[] = [];
  const from = effectiveStart(r, from0);
  if (from > to) throw new ApiError(`休止の期間（${from0}〜${to}）はすべてオーダー締切を過ぎています。期間を直して申請し直してください`, 409);
  if (from !== from0) notes.push(`${from0} サイクルはオーダー締切を過ぎているためお届けし、${from} サイクルから休止します（決定 28-27）。`);
  const used = pausedMonths(r, contract.id, a.id);
  if (used + monthsIn(from, to) > 12) throw new ApiError(`休止は通算12サイクル（1年）までです（いま ${used}サイクル・決定 28-10）。1年を超えるときは解約をご案内してください`, 409);
  r.put<Pause>(K.pauses, a.id, { id: a.id, contractId: contract.id, fromCycle: from, toCycle: to, resumeCycle: a.change.resumeCycle ?? addYm(to, 1), applicationNo: a.id, keepEquipment: !!a.change.keepEquipment, reason: pauseReasonOf(a) });
  const canceled: Delivery[] = [];
  const locked: string[] = [];
  for (const cc of liveChildren(r, contract.id).filter((x) => from <= x.cycleMonth && x.cycleMonth <= to)) {
    if (childLocked(cc)) {
      locked.push(`${cc.cycleMonth}（${cc.billStatus}）`);
      canceled.push(...stopLockedMonth(r, cc, `${a.id} 休止`));
      /* 先に請求した前払いは次の請求書で返す（調整明細・TL-7 A） */
      settleMonth(r, cc, prepayOf(cc, null), { kind: '休止', reason: `${from}〜${to}`, applicationId: a.id, by });
      continue;
    }
    canceled.push(...cancelChild(r, cc, `${a.id} 休止`, a.id));
  }
  if (locked.length) notes.push(`${locked.join('・')} サイクルは確定・請求済のため子契約は残し、配送・注文だけ取り消しました（先に請求した前払いは調整明細にして次の請求書で返します）。`);
  if (canceled.length) notifyCarriers(r, canceled, '休止');
  const cur = cycleAt(r);
  if (cur && from <= cur && cur <= to && contract.status === '有効') r.put<Contract>(K.contracts, contract.id, { ...contract, status: '利用休止' });
  if (!a.change.keepEquipment) {
    const due = cycleStart(r, from);
    for (const l of r.list<Loan>(K.loans).filter((x) => x.branchId === branchId && x.status === '貸出中')) r.put<Loan>(K.loans, l.id, { ...l, status: '回収予定', dueOn: due, applicationId: a.id });
  }
  return notes.join('');
}

/**
 * 再開を反映する。対象の休止は 休止中があればそれ、なければ休止予定（まだ始まっていない休止）、なければいちばん新しい休止。
 * 休止予定の取消（台帳 運営A 2026-10-06 Q14＝B）：再開予定月＝休止の開始月・休止期間0か月にして履歴に『取消した休止』を残し（通算1年に入れない）、
 * 先行して取り消した子契約を未確定に戻して配送予定を作り直す（注文は戻さない＝お客様がもう一度入れる）。
 * 休止中の再開は、再開の月からの取り消した子契約を戻す（配送・デフォルトの注文を作り直す）
 */
export function applyResume(r: DocRepo, a: Application, branchId: string, by = ''): string {
  const contract = contractOfBranch(r, branchId);
  let res = a.change.resumeCycle;
  if (!contract || !res) return '';
  const target = resumablePause(r, contract.id);
  const p = target?.pause ?? r.list<Pause>(K.pauses).filter((x) => x.contractId === contract.id).sort((x, y) => x.fromCycle.localeCompare(y.fromCycle)).pop();
  const cancelPlanned = target?.state === '休止予定';
  if (p && cancelPlanned) {
    res = p.fromCycle;
    r.put<Pause>(K.pauses, p.id, { ...p, voided: true, cancelApplicationNo: a.id, resumeCycle: res, toCycle: addYm(res, -1) });
  } else if (p) r.put<Pause>(K.pauses, p.id, { ...p, resumeCycle: res, toCycle: res <= p.toCycle ? addYm(res, -1) : p.toCycle });
  for (const cc of r.list<ChildContract>(K.children).filter((x) => x.contractId === contract.id && x.canceled && x.cycleMonth >= res! && !childLocked(x))) restoreChild(r, cc, !cancelPlanned);
  /* 休止で止めた確定・請求済の月（前払いを返す調整明細がある）を早めて再開する：配送を作り直し、返した前払いを次の請求書で請求し直す */
  const again: string[] = [];
  for (const cc of liveChildren(r, contract.id).filter((x) => x.cycleMonth >= res! && childLocked(x) && adjustmentsOf(r, x.id).some((y) => y.kind === '休止'))) {
    const b = billedOf(r, cc), want = prepayOf(cc);
    if (sameByRate(b, want)) continue;
    ensureDeliveries(r, cc);
    if (!cancelPlanned) refreshOrders(r, cc);
    if (settleMonth(r, cc, want, { kind: '再開', reason: `${res} から再開`, applicationId: a.id, by })) again.push(cc.cycleMonth);
  }
  /* 休止予定の取消で設備を回収予定にしていたら、貸出中に戻す（この休止の申請で回収予定にしたもの） */
  if (p && cancelPlanned) for (const l of r.list<Loan>(K.loans).filter((x) => x.branchId === branchId && x.status === '回収予定' && x.applicationId === p.applicationNo)) r.put<Loan>(K.loans, l.id, { ...l, status: '貸出中' });
  const cur = cycleAt(r);
  const now = r.get<Contract>(K.contracts, contract.id)!;
  if (cur && cur >= res && now.status === '利用休止') r.put<Contract>(K.contracts, contract.id, { ...now, status: '有効' });
  const head = cancelPlanned ? `休止予定（${p!.fromCycle}〜${p!.toCycle}）を取り消しました（休止の履歴に『取消した休止（0か月）』を残し、通算1年には入れません）。取り消した子契約を未確定に戻して配送予定を作り直しました。注文は戻りません（お客様がもう一度入れてください）。` : '';
  return head + (again.length ? `${again.join('・')} サイクルは休止で返した前払いを、調整明細にして次の請求書で請求し直します。` : '');
}

/* ---------------- 解約 ---------------- */

/** 日付の月数の差（from から to まで。日がまだなら1つ少なく） */
const monthsBetween = (from: string, to: string) => {
  const [a, b] = [from, to].map((x) => x.split('/').map(Number));
  return (b[0] - a[0]) * 12 + (b[1] - a[1]) - (b[2] < a[2] ? 1 : 0);
};

/** 違約金（設備ごと・28-2）：回収額 ×（最低利用期間の残り月数 ÷ 最低利用期間）。休止中は数えない（28-1b） */
export function penaltyOf(r: DocRepo, loan: Loan, endOn: string, contractId: string) {
  const m = modelOf(r, loan.modelId);
  if (!m || !m.minMonths || !m.recoveryYen) return { yen: 0, remaining: 0, used: 0, model: m };
  const from = loan.countFrom || loan.startOn;
  const paused = r.list<Pause>(K.pauses).filter((p) => p.contractId === contractId && !isOpenPause(p) && cycleStart(r, p.fromCycle) >= from && cycleEnd(r, p.toCycle) <= endOn).reduce((s, p) => s + monthsIn(p.fromCycle, p.toCycle), 0);
  const used = Math.max(0, monthsBetween(from, endOn) - paused);
  const remaining = Math.max(0, m.minMonths - used);
  return { yen: Math.round((m.recoveryYen * remaining) / m.minMonths) * loan.qty, remaining, used, model: m };
}

/** 法人・拠点のアカウントを参照のみにする（解約の承認。法人アカウントは全拠点が解約・終了のとき） */
function readOnlyAccounts(r: DocRepo, branchId: string) {
  const set = (id: string) => {
    const x = r.get<Account>(K.accounts, id);
    if (x && ['有効', '発行済（ログイン前）'].includes(x.status)) r.put<Account>(K.accounts, id, { ...x, status: '参照のみ' });
  };
  set(branchId);
  const corpId = r.get<Branch>(K.branches, branchId)?.corpId;
  if (!corpId) return;
  const all = r.list<Branch>(K.branches).filter((b) => b.corpId === corpId);
  if (all.every((b) => ['解約手続き中', '終了'].includes(contractOfBranch(r, b.id)?.status ?? '終了'))) set(corpId);
}

/**
 * 解約を反映する。解約日＝最後のサイクルの最終日。親契約＝解約手続き中・拠点＝閉鎖予定。解約日のあとの子契約・配送・注文を取り消し、委託配送先へ知らせる。
 * 貸出は回収予定（回収の配送は作らない）、違約金は最後の子契約の extras（確定・請求済なら注意だけ）。アカウントは参照のみ（3-12）
 */
export function applyCancel(r: DocRepo, a: Application, branchId: string, by = ''): string {
  const contract = contractOfBranch(r, branchId);
  if (!contract) return '';
  const last = a.change.lastCycle || (a.startCycle ? addYm(a.startCycle, -1) : liveChildren(r, contract.id).pop()?.cycleMonth ?? '');
  if (!last) return '';
  const endOn = cycleEnd(r, last);
  const notes: string[] = [];
  r.put<Contract>(K.contracts, contract.id, { ...contract, status: '解約手続き中', endOn });
  const b = r.get<Branch>(K.branches, branchId);
  if (b && b.status !== '閉鎖') r.put<Branch>(K.branches, b.id, { ...b, status: '閉鎖予定' });
  const canceled: Delivery[] = [];
  const locked: string[] = [];
  for (const cc of liveChildren(r, contract.id).filter((x) => x.cycleMonth > last)) {
    if (childLocked(cc)) {
      locked.push(`${cc.cycleMonth}（${cc.billStatus}）`);
      canceled.push(...stopLockedMonth(r, cc, `${a.id} 解約`));
      /* 解約日のあとの月に先に請求した前払いは、最終請求の請求書で返す（調整明細） */
      settleMonth(r, cc, prepayOf(cc, null), { kind: '解約', reason: `解約日 ${endOn}`, applicationId: a.id, by });
      continue;
    }
    canceled.push(...cancelChild(r, cc, `${a.id} 解約`, a.id));
  }
  if (locked.length) notes.push(`${locked.join('・')} サイクルは確定・請求済のため子契約は残し、配送・注文だけ取り消しました（先に請求した前払いは調整明細にして次の請求書で返します）。`);
  if (canceled.length) notifyCarriers(r, canceled, '解約');
  /* 貸出：回収予定（解約日）。違約金は設備ごとに計算して合算 */
  const pens: string[] = [];
  let total = 0, units = 0;
  for (const l of r.list<Loan>(K.loans).filter((x) => x.branchId === branchId && x.status === '貸出中')) {
    const p = penaltyOf(r, l, endOn, contract.id);
    if (p.yen > 0) { total += p.yen; pens.push(`${p.model?.name}×${l.qty}（残り${p.remaining}ヶ月）${yen(p.yen)}`); }
    r.put<Loan>(K.loans, l.id, { ...l, status: '回収予定', dueOn: endOn, applicationId: a.id });
    units += l.qty;
  }
  /*
   * 設備引揚費（OP000022）：0円（2026/10/03 回答）。解約では自動で載せない。必要なときは運営が請求の ③ 調整で入れる
   */
  void units;
  if (total > 0) {
    /* 違約金は調整明細にして、解約のあとの最終請求書（拠点ごとに別の1通・2026/10/03 決定）に載せる */
    addCharge(r, { branchId, contractId: contract.id, name: `違約金（${pens.join('・')}）`, amountYen: total, taxRate: 10, kind: '違約金', reason: `解約日 ${endOn}`, applicationId: a.id, by });
    notes.push(`違約金 ${yen(total)}（${pens.join('・')}）は最終請求書に載せます。`);
  }
  readOnlyAccounts(r, branchId);
  notes.push(`解約日は ${endOn} です。設備は回収予定にしました（回収の日程は運営からご連絡します）。最後のご請求は ${finalIssueMonth(endOn)} 発行の最終請求書（この拠点だけの1通：最後の実績精算・違約金・回収の費用・調整）です。`);
  return notes.join('');
}

/**
 * 反映待ちの確定の月を反映する（確定解除したあと。lib/domain/locked.ts）。
 * プランの変更＝その月の子契約をプランの変更と同じに直す（便・配送・注文）。誤りの訂正＝① 費目をいまのマスタの値にする
 */
export function reapplyLockedMonth(r: DocRepo, s: LockedSkip, by: string): string {
  const cc = r.get<ChildContract>(K.children, s.childContractId);
  if (!cc || cc.canceled) throw new ApiError('子契約が見つかりません（取り消されています）', 404);
  if (cc.billStatus !== '未確定') throw new ApiError(`${cc.cycleMonth} サイクルは${cc.billStatus}です。${cc.billStatus === '確定' ? '請求の画面で確定解除してから反映してください' : '請求済みの月は調整明細で対応してください'}`, 409);
  if (s.source === '誤りの訂正') {
    r.put<ChildContract>(K.children, cc.id, { ...cc, fees: feesNow(r, cc) });
    return `${cc.cycleMonth} サイクルの費目をいまのマスタの値にしました。`;
  }
  if (!s.planId || !s.course) throw new ApiError('プランがわかりません', 400);
  const next = withPlan(r, cc, s.planId, s.course, { migrate: s.migrate });
  r.put<ChildContract>(K.children, cc.id, { ...next, fees: feesNow(r, next) });
  const now = r.get<ChildContract>(K.children, cc.id)!;
  const canceled = cancelDeliveries(r, now.id, `${s.applicationId} プランの変更（反映）`, (d) => !now.channels.some((c) => c.temp === d.temp && c.slots.includes(d.slot)));
  ensureDeliveries(r, now);
  const reset = resetIfOver(r, now, by);
  refreshOrders(r, now);
  if (canceled.length) notifyCarriers(r, canceled, 'プランの変更');
  return `${cc.cycleMonth} サイクルをプランの変更（${s.applicationId}）に合わせました${reset ? '（上限を超える注文はデフォルトに戻しました）' : ''}。`;
}

/** 設備引揚費の調整明細の理由（③ 調整で直せる印。今までに解約で自動でできたもの） */
export const PULL_REASON = '設備引揚費';
/** 初期費用（OP000008）の調整明細の理由（③ 調整で金額を直せる・0円で外せる） */
export const INIT_REASON = '初期費用';

/* ---------------- 毎日の処理 ---------------- */

/** 解約した拠点の最後の請求書の入金期限（解約日のあとに発行した請求書がまだなければ ''） */
export function finalDue(r: DocRepo, branchId: string, endOn: string) {
  const inv = r.list<Invoice>('dm.billing.invoices').filter((x) => x.status !== '取消' && (x.branchId === branchId || x.lines.some((l) => l.branchId === branchId)));
  if (!inv.length) return endOn;
  /* 最終請求書＝解約日を含む実績精算の締め月の、この拠点だけの請求書（翌月1日発行・final。2026/10/03 決定） */
  const fin = inv.filter((x) => x.final && x.branchId === branchId);
  if (fin.length) return fin.map((x) => x.dueOn).sort().pop()!;
  const after = inv.filter((x) => x.issueMonth >= finalIssueMonth(endOn));
  return after.length ? after.map((x) => x.dueOn).sort().pop()! : '';
}

/**
 * 毎日の処理（apply.tick）：休止の開始・終わりで親契約の状態（利用休止／有効）、解約日を過ぎたら終了・拠点を閉鎖（28-62・28-65）、
 * 最後の請求書の入金期限を過ぎたら参照のみのアカウントを利用停止にしてメール（S4-3・メール No.16）
 */
export function dailyTick(r: DocRepo, day = today()) {
  const cur = cycleAt(r, day);
  const out = { paused: 0, resumed: 0, ended: 0, stopped: 0 };
  for (const c of r.list<Contract>(K.contracts)) {
    if (c.status === '解約手続き中' && c.endOn && c.endOn < day) {
      r.put<Contract>(K.contracts, c.id, { ...c, status: '終了' });
      const b = r.get<Branch>(K.branches, c.branchId);
      if (b) { r.put<Branch>(K.branches, b.id, { ...b, status: '閉鎖' }); syncCorpStatus(r, b.corpId); }
      out.ended++;
      continue;
    }
    if (!cur) continue;
    const paused = r.list<Pause>(K.pauses).some((p) => p.contractId === c.id && p.fromCycle <= cur && cur <= p.toCycle);
    if (c.status === '有効' && paused) { r.put<Contract>(K.contracts, c.id, { ...c, status: '利用休止' }); out.paused++; }
    else if (c.status === '利用休止' && !paused) { r.put<Contract>(K.contracts, c.id, { ...c, status: '有効' }); out.resumed++; }
  }
  for (const c of r.list<Contract>(K.contracts).filter((x) => x.status === '終了' && x.endOn)) {
    const acc = r.get<Account>(K.accounts, c.branchId);
    if (!acc || acc.status !== '参照のみ') continue;
    const due = finalDue(r, c.branchId, c.endOn);
    if (!due || due >= day) continue;
    r.put<Account>(K.accounts, acc.id, { ...acc, status: '利用停止' });
    notifyBranch(r, c.branchId, { templateId: 'account_stopped', title: 'アカウント停止のお知らせ', body: `最後の請求書のお支払い期日（${due}）を過ぎたため、${acc.name} のアカウントを停止しました。ご利用ありがとうございました。`, link: { type: '', id: '' } });
    out.stopped++;
    const corpId = r.get<Branch>(K.branches, c.branchId)?.corpId;
    const corpAcc = corpId ? r.get<Account>(K.accounts, corpId) : undefined;
    if (corpAcc && corpAcc.status === '参照のみ' && r.list<Branch>(K.branches).filter((b) => b.corpId === corpId).every((b) => r.get<Account>(K.accounts, b.id)?.status === '利用停止')) {
      r.put<Account>(K.accounts, corpAcc.id, { ...corpAcc, status: '利用停止' });
    }
  }
  return out;
}

/* ---------------- 新規申込：仮登録 → 本登録 ---------------- */

/** お試しキャンペーンの期間の既定（月数。契約_00 §0.4：既定1ヶ月・延長は運営だけ） */
export const TRIAL_MONTHS = 1;
const EMPTY_ADDR: Address = { zip: '', pref: '', city: '', addr1: '', addr2: '' };
const DEFAULT_BILLING: Billing = { lead: -1, invoiceUnit: 'まとめて発行（法人1通）', payMethod: '口座振替', debitStatus: '未手続き', payCycle: '月払い', dueRule: '請求月の27日', billonePayerId: '' };
const reqOf = (a: Application, k: string) => a.request.find((x) => x[0] === k)?.[1] ?? '';
/** 申込の基準数のパターン（REQ-CT-300）。「基準数のパターン（拠点N）」→ なければ「基準数のパターン」。N＝新しい拠点の並び（1から） */
const noShortOf = (a: Application, n: number) => ['短消費期限なし', '短賞味期限なし'].includes(reqOf(a, `基準数のパターン（拠点${n}）`) || reqOf(a, '基準数のパターン')); // 旧表記（短賞味期限なし）の申込も読む
/** 申込の「設置フロア（拠点N）」（台帳 2026/10/03） */
const floorOf = (a: Application, n: number) => reqOf(a, `設置フロア（拠点${n}）`);
/** 申込（代理入力）の住所の文字（都道府県から建物名まで）を 都道府県・市区町村・町名番地に分ける */
function parseAddr(zip: string, text: string): Address {
  const t = text.trim().replace(/^〒?\s*\d{3}-?\d{4}\s*/, '');
  const pref = t.match(/^(北海道|東京都|大阪府|京都府|.{2,3}?県)/)?.[1] ?? '';
  const rest = t.slice(pref.length);
  const city = rest.match(/^(.+?[市区町村郡])/)?.[1] ?? '';
  const addr = rest.slice(city.length).trim();
  const sp = addr.search(/\s|　/);
  return { zip: zip.trim().replace(/^(\d{3})-?(\d{4})$/, '$1-$2'), pref, city, addr1: sp > 0 ? addr.slice(0, sp) : addr, addr2: sp > 0 ? addr.slice(sp).trim() : '' };
}
/** 代理入力の「拠点のご担当者」（氏名・フリガナ・メール）の文字から、氏名とメールを取る */
function parseStaff(v: string): { name: string; email: string } {
  const email = v.match(/[^\s@・,，、／/]+@[^\s@・,，、／/]+\.[^\s@・,，、／/]+/)?.[0] ?? '';
  const name = v.replace(email, '').split(/[・,，、／/]+/).map((x) => x.trim()).filter(Boolean)[0] ?? '';
  return { name, email };
}
const COURSES: Course[] = ['ESスタンダード', 'ESライト（冷蔵庫）', 'ESライト（自販機）'];

/** 申込の「プラン」（ES000003 50プラン（ESライト））からプランとコース */
function planFromRequest(v: string): { planId: string; course: Course | '' } {
  const id = v.match(/^(ES\d{6})/)?.[1] ?? '';
  const c = v.match(/（(.+)）$/)?.[1] ?? '';
  const course = COURSES.find((x) => x === c) ?? (c === 'ESライト' ? LIGHT : c === 'ESスタンダード' ? STD : '');
  return { planId: id, course };
}
const stdEquip = (r: DocRepo, planId: string, course: Course | '') => (planOf(r, planId)?.stdEquipment ?? []).filter((x) => x.course === course).map((x) => ({ modelId: x.modelId, qty: x.qty }));

/** 申込から受付の中身の初期値を作る（今ある拠点は拠点・いちばん新しい子契約から） */
export function defaultSetup(r: DocRepo, a: Application): NewSetup {
  const p = planFromRequest(reqOf(a, 'プラン'));
  const trial = a.kubun === 'お試し';
  const existing: SetupBranch[] = a.branchIds.map((id) => {
    const b = r.get<Branch>(K.branches, id);
    const ct = contractOfBranch(r, id);
    const cc = ct ? liveChildren(r, ct.id).pop() : undefined;
    const main = r.list<Contact>(K.contacts).find((c) => c.owner.type === 'branch' && c.owner.id === id && c.kind === 'メイン担当者');
    const planId = p.planId || cc?.planId || '', course = p.course || cc?.course || '';
    return {
      name: b?.name ?? id, kana: b?.kana ?? '', address: b?.address ?? EMPTY_ADDR, tel: b?.tel ?? '', employees: b?.employees ?? 0,
      receiveWindows: b?.receiveWindows ?? [], deliveryNote: b?.deliveryNote ?? '', floor: b?.floor ?? '',
      contact: { name: main?.name ?? '', email: main?.email ?? '', tel: main?.tel ?? '' },
      planId, course, channels: cc?.channels ?? [], optionIds: (cc?.optionIds ?? []).filter((x) => x !== EXTRA_DELIVERY_OPTION),
      discountIds: trial ? [TRIAL_DISCOUNT] : [], equipment: stdEquip(r, planId, course), billTo: ct?.billTo ?? '法人',
      noShortLife: r.get<{ allowShortLife: boolean }>('dm.order.prefs', id)?.allowShortLife === false,
      branchId: id, contractId: ct?.id ?? '', stage: ct && ct.status !== '仮登録' && (ct.kind === '本導入' || a.kubun === 'お試し') ? '本登録' : ct ? '仮登録' : '', checked: false,
    };
  });
  /* 代理入力（運営）・申込で入れた 住所・電話・担当者は受付に引き継ぐ（二重入力にしない：台帳 運営A 2026-10-06 (2)） */
  const applicant = { name: reqOf(a, '申込者') || a.requestedBy.name, email: reqOf(a, '申込者メール'), tel: reqOf(a, '申込者電話') };
  const fresh: SetupBranch[] = a.branchNames.map((n, j) => {
    const sf = parseStaff(reqOf(a, `拠点のご担当者（拠点${j + 1}）`));
    /* 拠点ごとのプラン・コース（複数拠点・法人Web の申込も受付に渡す：結合テスト B2・B9）。なければ申込全体の「プラン」 */
    const pj = planFromRequest(reqOf(a, `プラン（拠点${j + 1}）`)).planId ? planFromRequest(reqOf(a, `プラン（拠点${j + 1}）`)) : p;
    return {
    /* 申込の画面に法人名の欄がすでにあるので、拠点名に法人名を前置きしない（長くなりすぎる：結合テスト B6・hong 2026-10-09） */
    name: n, kana: '', address: parseAddr(reqOf(a, `郵便番号（拠点${j + 1}）`), reqOf(a, `住所（拠点${j + 1}）`)) , tel: reqOf(a, `電話番号（拠点${j + 1}）`) || applicant.tel || reqOf(a, '法人電話'), employees: 0,
    receiveWindows: [{ from: '09:00', to: '12:00' }, { from: '13:00', to: '17:00' }], deliveryNote: reqOf(a, `配送備考（拠点${j + 1}）`), floor: floorOf(a, j + 1),
    /* 拠点のご担当者は申込で入れた方だけ。空のときに申込者で埋めない（拠点にメイン担当者がいないことを本登録のチェックで止める：結合テスト B9） */
    contact: { name: sf.name, email: sf.email, tel: '' },
    planId: pj.planId, course: pj.course, channels: [], optionIds: [], discountIds: trial ? [TRIAL_DISCOUNT] : [], equipment: stdEquip(r, pj.planId, pj.course),
    billTo: '法人', noShortLife: noShortOf(a, j + 1), branchId: '', contractId: '', stage: '', checked: false,
    };
  });
  return {
    startCycle: a.startCycle,
    corp: a.corpId ? null : { name: a.companyName, kana: reqOf(a, '法人名フリガナ'), address: parseAddr(reqOf(a, '法人郵便番号'), reqOf(a, '法人住所')), tel: reqOf(a, '法人電話'), contact: applicant },
    branches: [...existing, ...fresh], notes: [],
  };
}

export const setupOf = (r: DocRepo, a: Application) => a.setup ?? defaultSetup(r, a);

/** 本登録に足りない情報（空なら、運営が確かめれば本登録できる）。運営の確認（checked）は含めない */
export function missingOf(r: DocRepo, s: NewSetup, i: number): string[] {
  const b = s.branches[i];
  if (!b) return ['拠点がありません'];
  const m: string[] = [];
  if (b.stage === '') m.push('仮登録がまだです');
  if (!b.name.trim()) m.push('拠点名');
  if (!b.address.pref || !b.address.city || !b.address.addr1) m.push('住所（都道府県・市区町村・町名番地）');
  if (!b.tel.trim()) m.push('電話番号');
  if (!b.contact.name.trim() || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(b.contact.email)) m.push('メイン担当者（氏名・メールアドレス）');
  const plan = planOf(r, b.planId);
  if (!plan) m.push('プラン');
  else if (!plan.prices.some((p) => p.course === b.course)) m.push('コース（プランにない）');
  if (!b.channels.length) m.push('配送の設定（便）');
  b.channels.forEach((c, k) => {
    const w = r.get<{ type: string }>('dm.master.warehouses', c.warehouseId);
    if (!w || w.type !== 'picking') m.push(`便${k + 1}：ピッキング倉庫`);
    if (!r.get('dm.master.carriers', c.carrierId)) m.push(`便${k + 1}：運び手（委託配送先・路線便）`);
    /* 資材の便は都度配送なので、お届けの枠（A2〜D7）は求めない（台帳 R・受付簿 #423・結合テスト B8） */
    if (c.temp !== '資材' && (!c.slots.length || c.slots.some((x) => !/^[A-D][2-7]$/.test(x)))) m.push(`便${k + 1}：お届けの枠（A2〜D7）`);
    if (!(c.leadDays >= 1)) m.push(`便${k + 1}：出荷からお届けの日数`);
  });
  return m;
}

const nextCu = (r: DocRepo) => `CU${pad(nextNum([...r.list<Corp>(K.corps), ...r.list<Branch>(K.branches)].map((x) => x.id), /^CU(\d{5})$/), 5)}`;
const nextCp = (r: DocRepo) => `CP${pad(nextNum(r.list<Contract>(K.contracts).map((x) => x.id), /^CP(\d{7})$/), 7)}`;
const nextPc = (r: DocRepo) => `PC${pad(nextNum(r.list<Contact>(K.contacts).map((x) => x.id), /^PC(\d{5})$/), 5)}`;

function addContacts(r: DocRepo, owner: Contact['owner'], c: { name: string; email: string; tel: string }) {
  if (!c.name.trim()) return;
  for (const kind of ['メイン担当者', '請求担当者'] as const) {
    if (r.list<Contact>(K.contacts).some((x) => x.owner.type === owner.type && x.owner.id === owner.id && x.kind === kind)) continue;
    const id = nextPc(r);
    r.put<Contact>(K.contacts, id, { id, owner, kind, name: c.name, kana: '', email: c.email, tel: c.tel });
  }
}
function addAccount(r: DocRepo, id: string, name: string, email: string, scope: Account['scope']) {
  const ex = r.get<Account>(K.accounts, id);
  /* 移行の仮登録のお客様のアカウントは「未発行」で入っている：受付の仮登録で発行する（ログインできるようになる） */
  if (ex?.status === '未発行' && ex.site === 'corp') { r.put<Account>(K.accounts, id, { ...ex, status: '発行済（ログイン前）', issuedAt: nowStamp() }); return true; }
  if (ex) return false;
  r.put<Account>(K.accounts, id, {
    id, site: 'corp', loginId: id, name, email: email || `${scope.type === 'corp' ? 'corp' : 'branch'}-${id.toLowerCase()}@example.jp`, status: '発行済（ログイン前）',
    roleIds: [scope.type === 'corp' ? 'corp.corp' : 'corp.branch'], scope, issuedAt: nowStamp(), lastLoginAt: '',
  });
  return true;
}
/** 資材の初期セット（無料。配送データは本登録で作る）。資材と数はプランマスタの初期備品（コースごと・lib/domain/charges.ts の initialItemsOf） */
function initialSet(r: DocRepo, branchId: string, planId: string, course: Course | '', by: string) {
  if (r.list<MaterialOrder>(K.mos).some((m) => m.branchId === branchId && m.kind === 'initial_set' && m.status !== '取消')) return;
  const lines = initialItemsOf(planOf(r, planId), course);
  if (!lines.length) return;
  const prefix = `MO-${today().slice(2, 4)}${today().slice(5, 7)}`;
  const id = `${prefix}-${pad(nextNum(r.list<MaterialOrder>(K.mos).map((x) => x.id), new RegExp(`^${prefix}-(\\d{4})$`)), 4)}`;
  r.put<MaterialOrder>(K.mos, id, {
    id, branchId, kind: 'initial_set', orderedAt: nowStamp(), orderedBy: by, dueOn: '', deliveryId: '', paid: false, status: '出荷待', lines,
  });
}

/**
 * 仮登録のあとに申込を却下・取り下げしたとき（台帳「仮登録のあとの却下・取り下げ」2026/10/03）：
 * まだ本登録していない拠点の 拠点・親契約・最初の注文・資材の初期セット（出荷前）を取消、拠点のアカウントを利用停止（申込取消）。
 * この申込で作った法人は、ほかに生きている拠点がなければ取消・アカウント停止。本登録した拠点は変えない（解約の手続き）。
 * 今ある拠点（切替・拠点を追加の既存の拠点）は変えない。返り値＝取り消した拠点の名前
 */
export function cancelProvisional(r: DocRepo, a: Application, by: string): string[] {
  const s = a.setup;
  if (!s) return [];
  const stopAcc = (id: string) => {
    const acc = r.get<Account>(K.accounts, id);
    if (acc && acc.status !== '削除済') r.put<Account>(K.accounts, id, { ...acc, status: '利用停止', stopReason: '申込取消' });
  };
  const done: string[] = [];
  for (const b of s.branches) {
    /* stage が空で拠点がある＝移行の仮登録のお客様（受付中の申込。拠点・親契約は取り込みのときに仮登録で作ってある） */
    if ((b.stage !== '仮登録' && !(b.stage === '' && b.branchId)) || !b.branchId) continue;
    const br = r.get<Branch>(K.branches, b.branchId);
    if (!br || br.status !== '仮登録') continue;
    r.put<Branch>(K.branches, br.id, { ...br, status: '取消' });
    syncCorpStatus(r, br.corpId);
    const ct = b.contractId ? r.get<Contract>(K.contracts, b.contractId) : contractOfBranch(r, br.id);
    if (ct && ct.status === '仮登録') r.put<Contract>(K.contracts, ct.id, { ...ct, status: '取消' });
    for (const o of r.list<ProductOrder>(K.orders).filter((x) => x.branchId === br.id && x.status !== '取消')) r.put<ProductOrder>(K.orders, o.id, { ...o, status: '取消', updatedAt: nowStamp(), updatedBy: by });
    for (const m of r.list<MaterialOrder>(K.mos).filter((x) => x.branchId === br.id && x.status === '出荷待')) r.put<MaterialOrder>(K.mos, m.id, { ...m, status: '取消' });
    stopAcc(br.id);
    b.stage = '取消';
    done.push(br.name);
  }
  /* この申込で作った法人（仮登録のまま）は、生きている拠点がなければ取消 */
  const corp = a.corpId ? r.get<Corp>(K.corps, a.corpId) : undefined;
  if (corp && corp.status === '仮登録' && !r.list<Branch>(K.branches).some((x) => x.corpId === corp.id && x.status !== '取消')) {
    r.put<Corp>(K.corps, corp.id, { ...corp, status: '取消' });
    stopAcc(corp.id);
  }
  return done;
}

/**
 * 仮登録（受付の「仮登録」）：法人（申込に法人がなければ）・拠点（仮登録）・親契約（仮登録）・担当者・アカウント（ログイン前）・
 * 最初の注文（デフォルト。子契約は本登録で作る）・資材の初期セットを作り、ログイン案内を送る。申込は契約設定中
 */
export function provisional(r: DocRepo, a: Application, by: string): Application {
  if (a.type !== 'new' || !['受付中', '契約設定中'].includes(a.status)) throw new ApiError(`${a.status} の申込は仮登録できません`, 409);
  /* 切替（お試し→本導入）は今あるお試しの拠点・親契約のまま（新しい拠点・親契約を作らない。B2） */
  if (a.kubun === '切替' && !a.branchIds.length) throw new ApiError('切替の申込にお試し中の拠点が結びついていません（申込を作り直してください）', 409);
  const s: NewSetup = structuredClone(setupOf(r, a));
  if (s.corp && !s.corp.name.trim()) throw new ApiError('法人名を入れてください', 400);
  if (s.branches.some((b) => !b.name.trim())) throw new ApiError('拠点名を入れてください', 400);
  /* 締切後：運営が選んだ扱い（代理オーダー＝希望の月のまま／繰り下げ＝翌サイクルへ。未選択は繰り下げ。申込フォーム §10-5） */
  const want = s.startCycle || a.startCycle;
  const st = s.late === '代理' ? want : effectiveStart(r, want);
  if (today() > closeOf(r, want)) {
    s.notes.push(s.late === '代理'
      ? `オーダー締切（${closeOf(r, want)}）を過ぎていますが、運営が代理でオーダーするため、${st} サイクルから開始します。`
      : `オーダー締切（${closeOf(r, want)}）を過ぎたため、開始を ${st} サイクルにしました（運営が「繰り下げ」を選択）。`);
  }
  s.startCycle = st;
  let corpId = a.corpId;
  const at = nowStamp();
  if (!corpId && s.corp) {
    corpId = nextCu(r);
    r.put<Corp>(K.corps, corpId, {
      id: corpId, name: s.corp.name, contractName: s.corp.name, kana: s.corp.kana, billToName: reqOf(a, '請求先法人名') || s.corp.name, status: '仮登録', salesRepId: r.list<Account>(K.accounts).find((x) => x.site === 'ops' && x.name === reqOf(a, 'ES営業担当'))?.id ?? 'Ad00003',
      address: s.corp.address, tel: s.corp.tel, fax: s.corp.fax ?? '', billing: { ...DEFAULT_BILLING, ...(s.corp.billing ?? {}) }, registeredAt: at,
    });
    addContacts(r, { type: 'corp', id: corpId }, s.corp.contact);
  }
  if (corpId) {
    const c = r.get<Corp>(K.corps, corpId);
    if (c && !s.accountsOff && addAccount(r, corpId, c.name, s.corp?.contact.email ?? '', { type: 'corp', corpId })) {
      notify(r, { to: { site: 'corp', accountId: corpId, role: '' }, templateId: 'account_issued', title: 'ES Station のアカウントを発行しました（ログインのご案内）', body: `${c.name} さまの法人アカウント（ログインID ${corpId}）を発行しました。`, link: { type: 'application', id: a.id } });
    }
  }
  s.corp = null;
  const branchIds = [...a.branchIds];
  for (const b of s.branches) {
    if (b.stage !== '') continue;
    const id = b.branchId || nextCu(r);
    if (!r.get(K.branches, id)) {
      r.put<Branch>(K.branches, id, {
        id, corpId: corpId ?? null, name: b.name, kana: b.kana, status: '仮登録', employees: b.employees, originalStartOn: '', address: b.address, tel: b.tel, fax: b.fax ?? '',
        receiveWindows: b.receiveWindows, deliveryNote: b.deliveryNote, floor: b.floor ?? '', note: '', registeredAt: at,
      });
    }
    let ct = contractOfBranch(r, id);
    if (!ct) {
      ct = { id: nextCp(r), branchId: id, kind: a.kubun === 'お試し' ? 'お試しキャンペーン' : '本導入', kindHistory: [{ kind: a.kubun === 'お試し' ? 'お試しキャンペーン' : '本導入', from: st }], status: '仮登録', startCycle: st, endOn: '', agencyId: s.agencyId ?? '', billTo: b.billTo, billing: b.billTo === 'この拠点' ? { ...DEFAULT_BILLING, ...(b.billing ?? {}) } : null };
      r.put<Contract>(K.contracts, ct.id, ct);
      if (s.srcCorpId) setContractSource(r, { contractId: ct.id, agencyId: '', srcCorpId: s.srcCorpId, by: '運営', at });
    }
    addContacts(r, { type: 'branch', id }, b.contact);
    if (!s.accountsOff && addAccount(r, id, b.name, b.contact.email, { type: 'branch', branchId: id })) {
      notify(r, { to: { site: 'corp', accountId: id, role: '' }, templateId: 'account_issued', title: 'ES Station のアカウントを発行しました（ログインのご案内）', body: `${b.name} の拠点アカウント（ログインID ${id}）を発行しました。`, link: { type: 'application', id: a.id } });
    }
    /* 最初の注文（デフォルト。行は本登録で子契約・便ができてから作る）と資材の初期セット */
    const ym = st.replace('-', '');
    const oid = `O-${ym}-${id}`;
    if (!r.get(K.orders, oid)) {
      const trial = ct.kind === 'お試しキャンペーン';
      r.put<ProductOrder>(K.orders, oid, { id: oid, branchId: id, childContractId: `${ct.id}-${ym}`, cycleMonth: st, status: trial ? 'お試し（自動）' : 'デフォルト', lines: [], updatedAt: at, updatedBy: 'system', log: [{ at, by: 'system', what: '仮登録で作成', detail: '行は本登録（子契約・便）のあと基準注文数で作る' }] });
    }
    initialSet(r, id, b.planId, b.course, by);
    /* 基準数のパターン（REQ-CT-300：契約（申込）の時に決める） */
    setBasePattern(r, { branchId: id, noShortLife: !!b.noShortLife, by });
    b.branchId = id; b.contractId = ct.id; b.stage = '仮登録';
    if (!branchIds.includes(id)) branchIds.push(id);
  }
  const next: Application = { ...a, corpId: corpId ?? a.corpId, branchIds, branchNames: [], startCycle: st, orderCloseOn: closeOf(r, st), status: '契約設定中', setup: s };
  r.put<Application>(K.apps, a.id, next);
  return next;
}

/**
 * 本登録（拠点ごと）：運営が必須の情報を入れたと確かめた拠点だけ（checked・missingOf が空）。
 * 子契約（開始サイクル〜作ってある最後のサイクル）・配送・注文（デフォルト）・資材便・貸出を作り、拠点・親契約を本登録・有効にする。
 * お試しの親契約なら、同じ親契約のまま本導入にする（switchTrial）。全拠点が本登録になったら申込は完了
 */
export function register(r: DocRepo, a: Application, i: number, by: string): { app: Application; note: string } {
  if (a.type !== 'new' || a.status !== '契約設定中' || !a.setup) throw new ApiError('仮登録のあとに本登録してください', 409);
  const s: NewSetup = structuredClone(a.setup);
  const b = s.branches[i];
  if (!b) throw new ApiError('拠点が見つかりません', 404);
  if (b.stage === '本登録') throw new ApiError('この拠点は本登録済みです', 409);
  const miss = missingOf(r, s, i);
  if (miss.length) throw new ApiError(`本登録に必要な情報が足りません：${miss.join('・')}`, 400);
  if (!b.checked) throw new ApiError('「必須の情報をすべて入れた」の確認をしてください', 400);
  const notes: string[] = [];
  const st = s.late === '代理' ? s.startCycle : effectiveStart(r, s.startCycle);
  if (st !== s.startCycle) {
    notes.push(`オーダー締切（${closeOf(r, s.startCycle)}）を過ぎたため、${st} サイクルから開始します（決定 28-27）。`);
    const old = r.get<ProductOrder>(K.orders, `O-${s.startCycle.replace('-', '')}-${b.branchId}`);
    if (old && !old.lines.length) r.remove(K.orders, old.id);
  }
  const ct = r.get<Contract>(K.contracts, b.contractId);
  const br = r.get<Branch>(K.branches, b.branchId);
  if (!ct || !br) throw new ApiError('仮登録の拠点・親契約が見つかりません', 404);
  /* 基準数のパターン（REQ-CT-300）：仮登録のあとに受付で直した値を入れる（仮登録の間は契約の画面では直せない） */
  if (b.noShortLife !== undefined) setBasePattern(r, { branchId: br.id, noShortLife: b.noShortLife, by });
  /* 仮登録でアカウントを発行しなかったときは、本登録で発行してログイン案内を送る */
  if (s.accountsOff) {
    const corp = br.corpId ? r.get<Corp>(K.corps, br.corpId) : undefined;
    if (corp && addAccount(r, corp.id, corp.name, '', { type: 'corp', corpId: corp.id })) {
      notify(r, { to: { site: 'corp', accountId: corp.id, role: '' }, templateId: 'account_issued', title: 'ES Station のアカウントを発行しました（ログインのご案内）', body: `${corp.name} さまの法人アカウント（ログインID ${corp.id}）を発行しました。`, link: { type: 'application', id: a.id } });
    }
    if (addAccount(r, br.id, b.name, b.contact.email, { type: 'branch', branchId: br.id })) {
      notify(r, { to: { site: 'corp', accountId: br.id, role: '' }, templateId: 'account_issued', title: 'ES Station のアカウントを発行しました（ログインのご案内）', body: `${b.name} の拠点アカウント（ログインID ${br.id}）を発行しました。`, link: { type: 'application', id: a.id } });
    }
  }
  const course = b.course as Course;
  const trialSwitch = ct.kind === 'お試しキャンペーン' && a.kubun !== 'お試し';
  if (trialSwitch) notes.push(switchTrial(r, a, b, ct, st, by));
  else {
    const at = nowStamp();
    r.put<Branch>(K.branches, br.id, { ...br, name: b.name, kana: b.kana, address: b.address, tel: b.tel, employees: b.employees, receiveWindows: b.receiveWindows, deliveryNote: b.deliveryNote, floor: b.floor ?? br.floor ?? '', status: '本登録', originalStartOn: br.originalStartOn || cycleStart(r, st) });
    r.put<Contract>(K.contracts, ct.id, { ...ct, status: '有効', startCycle: ct.status === '仮登録' ? st : ct.startCycle, billTo: b.billTo, kindHistory: ct.status === '仮登録' ? [{ kind: ct.kind, from: st }] : ct.kindHistory });
    activateReferral(r, { contractId: ct.id, startCycle: st, at: nowStamp() });
    const made = makeChildren(r, ct, b, course, st, ct.kind, notes);
    if (ct.kind === 'お試しキャンペーン') {
      const after = made.reduce((n, c) => n + (c.fees?.lines ?? []).reduce((m, l) => m + l.amountYen, 0), 0);
      notes.push(`お試しの子契約を ${made.length}か月分（${made[0]?.cycleMonth ?? st}〜${made[made.length - 1]?.cycleMonth ?? st}）作りました。割引後の請求額（税抜）${yen(after)}。`);
    }
    chargeInitFee(r, a, b, ct, by, notes);
    /* 資材便（初期セット）：最初のお届けの前の日に届ける */
    const first = r.list<Delivery>(K.deliveries).filter((d) => made.some((c) => c.id === d.childContractId) && d.status !== '取消').sort((x, y) => x.deliverOn.localeCompare(y.deliverOn))[0];
    shipInitialSet(r, br.id, ct.id, first?.deliverOn ?? cycleStart(r, st));
    /* 貸出（置く設備。省くとプランの標準貸出設備） */
    const startOn = first?.deliverOn ?? cycleStart(r, st);
    for (const x of b.equipment.length ? b.equipment : stdEquip(r, b.planId, course)) {
      const id = newLoanId(r);
      r.put<Loan>(K.loans, id, { id, branchId: br.id, modelId: x.modelId, qty: x.qty, startOn, status: '貸出中', countFrom: startOn, applicationId: a.id });
    }
    refreshVmLease(r, br.id);
    syncCorpStatus(r, br.corpId);
    notifyBranch(r, br.id, { templateId: 'contract_registered', title: `ご契約の登録が完了しました（${br.name}）`, body: `${st} サイクルからお届けします。${notes.join('')}`, link: { type: 'application', id: a.id } });
    void at;
  }
  b.stage = '本登録';
  s.notes.push(...notes);
  const done = s.branches.every((x) => x.stage === '本登録');
  const next: Application = { ...a, setup: s, status: done ? '完了' : a.status };
  r.put<Application>(K.apps, a.id, next);
  return { app: next, note: notes.join('') };
}

/** 子契約を作る（開始サイクル〜作ってある最後のサイクル）。あれば未確定のものだけ上書き。配送・注文もそろえる */
function makeChildren(r: DocRepo, ct: Contract, b: SetupBranch, course: Course, st: string, kind: ChildContract['kind'], notes: string[]) {
  /* お試しキャンペーンは自動更新せず、お試し期間の月数（既定1ヶ月）ぶんだけ作る（契約_00 §0.4。延長は運営が trial.ts で）。本導入は作ってある最後のサイクルまで */
  const lastYm = kind === 'お試しキャンペーン' ? addYm(st, TRIAL_MONTHS - 1) : r.list<ChildContract>(K.children).map((x) => x.cycleMonth).sort().pop() ?? st;
  const made: ChildContract[] = [];
  for (let ym = st; ym <= (lastYm > st ? lastYm : st); ym = addYm(ym, 1)) {
    const id = `${ct.id}-${ym.replace('-', '')}`;
    const ex = r.get<ChildContract>(K.children, id);
    if (ex && childLocked(ex)) { notes.push(`${ym} サイクルの子契約は確定・請求済のため変えていません。`); continue; }
    const base: ChildContract = ex && !ex.canceled ? { ...ex, channels: b.channels, optionIds: b.optionIds, discountIds: b.discountIds, ...(b.amounts ? { amounts: b.amounts } : {}) } : {
      id, contractId: ct.id, branchId: ct.branchId, cycleMonth: ym, kind, planId: b.planId, course, channels: b.channels, optionIds: b.optionIds, discountIds: b.discountIds,
      ...(b.amounts ? { amounts: b.amounts } : {}),
      monthlyYen: 0, app: { allowCash: false, allowGuest: false, allowEsqr: false, dailyCapMeals: 3 }, billStatus: '未確定', gen: '手動生成',
      pricing: { mode: '通常価格', billing: '従量', prices: {} },
    };
    const next = withPlan(r, { ...base, kind }, b.planId, course, { kind });
    r.put<ChildContract>(K.children, id, next);
    made.push(next);
  }
  for (const cc of made) { ensureDeliveries(r, cc); refreshOrders(r, cc); }
  return made;
}

/**
 * 初期費用（OP000008・契約ごとに1回）：金額は受付で直した値、なければ機種マスタ（自販機）・OP000008 の金額。
 * 契約に初期費用があれば請求する（お試し・切替でも自動では外さない。0円＝請求しない：台帳 E「初期費用」2026-10-05）。
 * 調整明細にして当月の請求書に載せる（REQ-CT-182）。運営は請求の ③ 調整で金額を直せる・0円で外せる
 */
function chargeInitFee(r: DocRepo, a: Pick<Application, 'id'>, b: SetupBranch, ct: Contract, by: string, notes: string[]) {
  const o = optionOf(r, 'event.contractInit'), fee = b.initFeeYen ?? initFeeOf(r, b.equipment);
  if (!o || o.status !== '使用中' || !(fee > 0) || r.list<BillAdjustment>('dm.billing.adjustments').some((x) => x.contractId === ct.id && x.reason === INIT_REASON)) return;
  addCharge(r, { branchId: ct.branchId, contractId: ct.id, name: `${o.name}（${o.id}）`, amountYen: fee, taxRate: 10, kind: '初期費用', reason: INIT_REASON, applicationId: a.id, by });
  notes.push(`${o.name} ${yen(fee)}（税抜）は当月の請求書に載せます。`);
}

/** 初期セットの資材便を作る（仮登録で作った資材の注文に配送をつける） */
function shipInitialSet(r: DocRepo, branchId: string, contractId: string, firstDeliverOn: string) {
  const mo = r.list<MaterialOrder>(K.mos).find((m) => m.branchId === branchId && m.kind === 'initial_set' && !m.deliveryId && m.status === '出荷待');
  const b = r.get<Branch>(K.branches, branchId);
  if (!mo || !b) return;
  let due = addDays(firstDeliverOn, -1);
  if (due <= addDays(today(), 2)) due = addDays(today(), 3);
  const shipOn = addDays(due, -2);
  const id = newDeliveryId(r, shipOn);
  const qty = mo.lines.reduce((a, l) => a + l.qty, 0);
  r.put<Delivery>(K.deliveries, id, {
    id, parentId: '', branchId, contractId, childContractId: '', cycleMonth: '', slot: '', temp: '資材', serviceForm: '資材便', regime: 'parcel_carrier', warehouseId: 'WH00004',
    shipOn, deliverOn: due, status: '出荷待', plannedQty: qty, deliveredQty: null, deliveredAt: '', completion: '',
    destination: { name: b.name, address: b.address, tel: b.tel, windows: b.receiveWindows, note: b.deliveryNote }, changeState: '変更不可', internalMemo: '資材の初期セット（無料）',
  });
  r.put<Leg>(K.legs, `${id}:1`, { id: `${id}:1`, deliveryId: id, legNo: 1, from: { type: 'warehouse', id: 'WH00004' }, to: { type: 'destination', id: branchId }, carrierId: 'DE00002', regime: 'parcel_carrier', isFinal: true, assignScope: 'ops', driverId: '', pickedUpAt: '' });
  r.put<MaterialOrder>(K.mos, mo.id, { ...mo, dueOn: due, deliveryId: id });
}

/**
 * 運営の「切替」（拠点詳細・申込を通さない）：お試し→本導入の開始年月 st の範囲。
 * min＝選べる最小の月（お試しの開始より後・確定済みの子契約の月より後）、def＝既定（次のサイクル月と min の遅いほう）
 */
export function switchRange(r: DocRepo, contractId: string) {
  const ct = r.get<Contract>(K.contracts, contractId);
  const live = ct ? liveChildren(r, ct.id) : [];
  const trialStart = live.find((x) => x.kind === 'お試しキャンペーン')?.cycleMonth ?? ct?.startCycle ?? '';
  const locked = live.filter((x) => childLocked(x)).map((x) => x.cycleMonth).sort().pop() ?? '';
  const min = [trialStart ? addYm(trialStart, 1) : '', locked ? addYm(locked, 1) : ''].sort().pop() ?? '';
  const nextCycle = addYm(cycleAt(r) || today().slice(0, 7).replace('/', '-'), 1);
  return { trialStart, locked, min, def: [min, nextCycle].sort().pop() ?? min };
}

/**
 * 運営の「切替」（拠点詳細。契約_01 §6-1）：申込を通さずに、申込の切替（switchTrial）と同じ処理をする。
 * st（YYYY-MM）から本導入の子契約にし（お試し割引 DC000013 を外す）、契約種別の履歴に st から本導入を足し（お試しは前の月まで）、
 * 設備の最低利用期間・違約金の数え始めを本導入の開始日にし、初期費用（契約にあれば）・メール M3 まで申込と同じ
 */
export function switchTrialByOps(r: DocRepo, branchId: string, st: string, by: string) {
  const ct = contractOfBranch(r, branchId);
  if (!ct) throw new ApiError(`拠点 ${branchId} の親契約が見つかりません`, 404);
  if (ct.kind !== 'お試しキャンペーン') throw new ApiError('お試しキャンペーンの契約だけ、本導入に切り替えられます。', 409);
  /* 承認待ちの切替申請がある拠点は、運営の切替もできない（二重に切り替えない。台帳 運営A 2026-10-06 (5)） */
  if (hasPendingSwitch(r, branchId)) throw new ApiError(PENDING_SWITCH_WHY, 409);
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(st)) throw new ApiError('本導入の開始年月は 2026-11 の形（年-月）で入力してください。', 400);
  const range = switchRange(r, ct.id);
  if (st <= range.trialStart) throw new ApiError(`本導入の開始は、お試しの開始（${range.trialStart}）より後の月にしてください。`, 400);
  if (range.locked && st <= range.locked) throw new ApiError(`${+range.locked.slice(0, 4)}年${+range.locked.slice(5)}月の請求が確定済みのため、それ以前の月からは切り替えられません。`, 400);
  const live = liveChildren(r, ct.id);
  const base = live.find((x) => x.cycleMonth === st && !childLocked(x)) ?? live.filter((x) => x.cycleMonth < st).pop() ?? live[0];
  if (!base) throw new ApiError('お試しの子契約がありません', 409);
  const b = r.get<Branch>(K.branches, branchId);
  if (!b) throw new ApiError(`拠点（${branchId}）が見つかりません`, 404);
  const setup: SetupBranch = {
    name: b.name, kana: b.kana, address: b.address, tel: b.tel, employees: b.employees, receiveWindows: b.receiveWindows, deliveryNote: b.deliveryNote,
    contact: { name: '', email: '', tel: '' }, planId: base.planId, course: base.course, channels: base.channels, optionIds: base.optionIds, discountIds: base.discountIds,
    ...(base.amounts ? { amounts: base.amounts } : {}),
    equipment: r.list<Loan>(K.loans).filter((l) => l.branchId === branchId && l.status === '貸出中').map((l) => ({ modelId: l.modelId, qty: l.qty })),
    billTo: ct.billTo, branchId, contractId: ct.id, stage: '本登録', checked: true,
  };
  const note = switchTrial(r, { id: '' }, setup, ct, st, by, { type: '', id: ct.id });
  const after = liveChildren(r, ct.id);
  const honFrom = after.filter((x) => x.kind === '本導入' && x.cycleMonth >= st);
  const startOn = r.list<Loan>(K.loans).filter((l) => l.branchId === branchId && l.status === '貸出中').map((l) => l.countFrom || l.startOn).sort().pop() ?? '';
  return { note, honChildren: honFrom.length, trialEnd: addYm(st, -1), countFrom: startOn };
}

/**
 * お試し→本導入（課題 3-7）：親契約はそのまま（契約種別を本導入にして kindHistory に残す）。
 * お試しの最後のサイクルから本導入の開始までの間は休止と同じ（28-35。休止として登録・料金なし）。間が1年を超えるなら新規申込（28-37）。
 * 設備は本導入の開始日から数える（28-17）。お試しの設備がプランの標準より多い・大きい分は、本導入の最初の請求書で1回だけ（運営が直した案があればそれ）。メール M3
 */
function switchTrial(r: DocRepo, a: { id: string; equipment?: Application['equipment']; startCycle?: string }, b: SetupBranch, ct: Contract, st: string, by: string, link: Notification['link'] = { type: 'application', id: a.id }): string {
  const notes: string[] = [];
  const trial = liveChildren(r, ct.id).filter((x) => x.kind === 'お試しキャンペーン' && x.cycleMonth < st);
  const lastTrial = trial[trial.length - 1]?.cycleMonth ?? addYm(st, -1);
  const gapFrom = addYm(lastTrial, 1), gapTo = addYm(st, -1);
  const gap = gapFrom <= gapTo ? monthsIn(gapFrom, gapTo) : 0;
  if (gap > 12) throw new ApiError(`お試しの終わり（${lastTrial}）から本導入の開始（${st}）までが1年を超えるため、切替ではなく新規申込として受けてください（決定 28-37）`, 409);
  const course = b.course as Course;
  if (gap > 0) {
    const pid = `${a.id || 'ops'}-${ct.branchId}`;
    r.put<Pause>(K.pauses, pid, { id: pid, contractId: ct.id, fromCycle: gapFrom, toCycle: gapTo, resumeCycle: st, applicationNo: a.id, keepEquipment: true, reason: 'お試しの終わりから本導入の開始までの間（決定 28-35）' });
    for (const cc of liveChildren(r, ct.id).filter((x) => gapFrom <= x.cycleMonth && x.cycleMonth <= gapTo && !childLocked(x))) cancelChild(r, cc, `${a.id} お試しから本導入までの間`, a.id);
    notes.push(`${gapFrom}〜${gapTo} サイクルは休止と同じ扱いです（配送・料金なし）。`);
  }
  const cur = cycleAt(r);
  const inGap = gap > 0 && !!cur && gapFrom <= cur && cur <= gapTo;
  r.put<Contract>(K.contracts, ct.id, { ...ct, kind: '本導入', kindHistory: [...ct.kindHistory, { kind: '本導入', from: st }], status: inGap ? '利用休止' : '有効', billTo: b.billTo });
  const made = makeChildren(r, r.get<Contract>(K.contracts, ct.id)!, { ...b, discountIds: b.discountIds.filter((x) => x !== TRIAL_DISCOUNT) }, course, st, '本導入', notes);
  /* 初期費用：切替でも契約にあれば請求（お試しの本登録で請求済みなら2回目は付けない） */
  chargeInitFee(r, a, b, ct, by, notes);
  const first = r.list<Delivery>(K.deliveries).filter((d) => made.some((c) => c.id === d.childContractId) && d.status !== '取消').sort((x, y) => x.deliverOn.localeCompare(y.deliverOn))[0];
  const startOn = first?.deliverOn ?? cycleStart(r, st);
  const p = proposalFor(r, a, ct.branchId, 'trial', b.planId, course);
  const en = applyEquipment(r, a, ct.branchId, p, startOn, made, startOn);
  if (en) notes.push(en);
  const charged = p.fees.filter((f) => f.on && f.amountYen).reduce((s, f) => s + f.amountYen, 0);
  if (charged) notes.push(`お試しの設備の差額 ${yen(charged)} を正式なご契約の最初の請求書で1回だけ請求します。`);
  notifyBranch(r, ct.branchId, {
    templateId: 'M3', title: '正式なご契約へのお切り替えが完了しました',
    body: `${st} サイクルから正式なご契約でお届けします（ご契約番号 ${ct.id} はそのままです）。設備の最低利用期間は正式なご契約の開始日（${startOn}）から数えます。${notes.join('')}`,
    link,
  });
  void by;
  return notes.join('');
}
