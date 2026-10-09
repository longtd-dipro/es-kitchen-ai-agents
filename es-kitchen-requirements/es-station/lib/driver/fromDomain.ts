import type { DocRepo } from '@/lib/ops/core/area';
import delivery from '@/lib/domain/areas/delivery';
import notice from '@/lib/domain/areas/notice';
import report, { CASH_PLAN_YEN } from '@/lib/domain/areas/report';
import type {
  Account, Address, Carrier, ChildContract, Contact, Delivery as DDelivery, DeliveryLine, DeliveryReport, Driver, Leg, ParkingReport, Product,
  StockCheck, Tracking, Trouble as DTrouble, TroubleType,
} from '@/lib/domain/types';
import { altIdOf, altLabel, altNotes } from '@/lib/domain/alt';
import { DELIVERED, deliveryBranchName, shownName } from '@/lib/domain/snapshot';
import { atOf, hmOf, mdW, recvKey } from './logic';
import { boxNos, MEALS_PER_BOX } from './seed';
import type {
  DeliveryDoc, DeliveryView, DriverMe, Flow, Inv, InvRow, News, Point, PointDoc, PointView, Trouble, TroubleDoc,
} from './types';

/*
 * 共通データ（lib/domain・dm.*）から、ドライバーの画面の形（DriverMe・PointView・DeliveryView・Flow・お知らせ・在庫）を作る。
 *   ドライバー・所属：dm.master.drivers・carriers、ログインできるか：dm.account.accounts
 *   今日の受取・配送：delivery.driverDay（区間 dm.delivery.legs ごと）。受取地点＝区間の出発（倉庫・中継）
 *   トラブル：dm.delivery.troubles、5ステップ・駐車場代・棚卸：dm.report.*、お知らせ：dm.notice.*
 * 共通データにないもの（箱ごとの受取のチェック・再受取の回数・到着予定・アプリの選択肢の原文・画面の途中の印・写真の中身）は driver.* に持つ。
 */

/** ドライバーの kind（共通データにないものだけ） */
export const K = {
  /** 受取地点の進み具合（ID＝'<スタッフ>|<受取地点>|<日付>'） */
  pt: 'driver.pointState',
  /** 配送の進み具合（到着予定・箱のチェック・追加の箱・未送信。ID＝配送ID） */
  del: 'driver.deliveryState',
  /** 5ステップの画面の印（進んだステップ・確認のチェック・駐車の下書き）とオフラインの未送信の内容（ID＝配送ID） */
  flow: 'driver.flowState',
  /** ドライバーが報告したトラブル（アプリの選択肢の原文・受取地点・写真の数 → 共通データのトラブルID） */
  trb: 'driver.troubles',
  /** お知らせの既読（ID＝スタッフ。通知の既読は共通データ） */
  news: 'driver.newsReadIds',
  /** 写真の中身（共通データにはファイル名だけ持つ。本番はファイルの置き場所に置き換える） */
  file: 'driver.files',
  /** オフラインの未送信（ID＝スタッフ） */
  out: 'driver.outbox',
} as const;

/** 自社ドライバーの所属先（ES配送便（自社）） */
export const OWN_CARRIER = 'DE00000';
const DONE: DDelivery['status'][] = ['納品済', '一部納品済'];
const CAN_LOGIN: Account['status'][] = ['有効', '発行済（ログイン前）'];

/** 配送（区間の見方では運営のメモを除く） */
type DL = Omit<DDelivery, 'internalMemo'>;

export const ptKey = (staff: string, pt: string, day: string) => `${staff}|${pt}|${day}`;
const addrOf = (a?: Address) => (a ? `${a.pref}${a.city}${a.addr1}${a.addr2 ? ' ' + a.addr2 : ''}` : '');
export const pname = (r: DocRepo, id: string) => r.get<Product>('dm.master.products', id)?.name ?? id;
export const linesOf = (r: DocRepo, id: string) => r.list<DeliveryLine>('dm.delivery.lines').filter((l) => l.deliveryId === id);
export const fileData = (r: DocRepo, name: string) => r.get<{ data: string }>(K.file, name)?.data ?? name;

/* ---------- ドライバー ---------- */

/** ドライバーと、ログインできるか（アカウントが使えて、ドライバーが有効なら '有効'） */
export function staffOf(r: DocRepo, id: string): { me: DriverMe; status: string } | null {
  const dr = r.get<Driver>('dm.master.drivers', String(id ?? '').trim().toUpperCase());
  if (!dr) return null;
  const own = dr.carrierId === OWN_CARRIER;
  const ac = r.get<Account>('dm.account.accounts', dr.id);
  const status = !ac ? '未発行' : !CAN_LOGIN.includes(ac.status) ? ac.status : dr.status;
  return {
    me: { id: dr.id, name: dr.name, kana: dr.kana, tel: dr.tel, mail: dr.email, org: r.get<Carrier>('dm.master.carriers', dr.carrierId)?.name ?? dr.carrierId, own, company: own ? null : dr.carrierId },
    status,
  };
}

/* ---------- 今日の区間 ---------- */

export type LegV = ReturnType<typeof delivery.queries.driverDay>['pickups'][number];

/**
 * その日の区間：driverDay（その日に受け取る・届ける区間）に、受け取って持っている最後の区間（お届け日が先でも届けられる）と、
 * その日に納品を済ませた最後の区間を足す
 */
export function legsOf(r: DocRepo, driverId: string, day: string): LegV[] {
  const dd = delivery.queries.driverDay(r, { driverId, date: day });
  const out = new Map<string, LegV>([...dd.pickups, ...dd.deliveries].map((v) => [v.leg.id, v]));
  for (const l of r.list<Leg>('dm.delivery.legs')) {
    if (l.driverId !== driverId || !l.isFinal || out.has(l.id)) continue;
    const d = r.get<DDelivery>('dm.delivery.deliveries', l.deliveryId);
    if (!d || !((d.status === '受取済' && l.pickedUpAt) || d.deliveredAt.startsWith(day))) continue;
    const v = delivery.queries.driverDay(r, { driverId, date: d.shipOn }).pickups.find((x) => x.leg.id === l.id);
    if (v) out.set(l.id, v);
  }
  return [...out.values()].sort((x, y) => x.leg.from.id.localeCompare(y.leg.from.id) || x.delivery.deliverOn.localeCompare(y.delivery.deliverOn) || x.delivery.id.localeCompare(y.delivery.id));
}

/** 箱（送り状があればその番号、なければ食数から出した箱の番号） */
function boxesOf(r: DocRepo, d: DL): Inv[] {
  const tr = r.list<Tracking>('dm.delivery.tracking').filter((t) => t.deliveryId === d.id && t.status === 'active');
  return tr.length ? tr.map((t) => ({ no: t.trackingNo })) : boxNos(d.id, Math.max(1, Math.ceil(d.plannedQty / MEALS_PER_BOX)));
}

/** 集金の予定額（報告を始めたら報告の額。現金利用がない拠点は 0） */
export function cashPlan(r: DocRepo, d: DL) {
  const rep = r.get<DeliveryReport>('dm.report.deliveryReports', d.id);
  if (rep) return rep.cash?.expectedYen ?? 0;
  const cc = r.get<ChildContract>('dm.org.childContracts', d.childContractId);
  /* 取り消した子契約（canceled）の便は集金しない */
  return cc && !cc.canceled && cc.app.allowCash ? CASH_PLAN_YEN : 0;
}

/* ---------- トラブル ---------- */

const typeName = (r: DocRepo, id: string) => r.get<TroubleType>('dm.master.troubleTypes', id)?.name ?? id;
const dmTrouble = (r: DocRepo, id: string) => r.get<DTrouble>('dm.delivery.troubles', id);

/** ドライバーの報告（共通データのトラブルが全部解決したら解決済み） */
function fromDoc(r: DocRepo, t: TroubleDoc): Trouble {
  const xs = t.dm.map((id) => dmTrouble(r, id)).filter(Boolean) as DTrouble[];
  const resolved = xs.length > 0 && xs.every((x) => x.resolution);
  const last = xs.map((x) => x.resolvedAt).sort().pop();
  return { id: t.id, raw: t.raw, note: t.note, at: hmOf(t.at), auto: t.auto, resolved, resAt: resolved && last ? hmOf(last) : undefined };
}

/** 配送のトラブル：まだ送っていない自分の報告＋共通データのトラブル（受取地点の報告から書いたものは受取地点に出す） */
function delTroubles(r: DocRepo, no: string, docs: TroubleDoc[]): Trouble[] {
  const pending = docs.filter((t) => t.target === 'd:' + no && !t.dm.length).map((t) => fromDoc(r, t));
  const shown = r.list<DTrouble>('dm.delivery.troubles').filter((t) => t.deliveryId === no).flatMap((t): Trouble[] => {
    const doc = docs.find((x) => x.dm.includes(t.id));
    if (doc?.target.startsWith('pt:')) return [];
    return [{
      id: t.id, raw: doc?.raw ?? typeName(r, t.typeId), note: doc ? doc.note : t.note, at: hmOf(t.reportedAt), auto: doc?.auto ?? t.note.includes('（自動）'),
      resolved: !!t.resolution, resAt: t.resolvedAt ? hmOf(t.resolvedAt) : undefined,
    }];
  });
  return [...shown, ...pending];
}

/* ---------- 受取地点・配送 ---------- */

function delView(r: DocRepo, me: DriverMe, v: LegV, day: string, docs: TroubleDoc[]): DeliveryView {
  const { delivery: d, leg } = v;
  const doc = r.get<DeliveryDoc>(K.del, d.id);
  const prog = r.get<PointDoc>(K.pt, ptKey(me.id, leg.from.id, day));
  const inv = [...boxesOf(r, d), ...(doc?.extra ?? [])];
  const picked = !!leg.pickedUpAt || inv.some((i) => prog?.recv?.[recvKey(d.id, i.no)]);
  const done = doc?.status === '配送完了' || (leg.isFinal && DONE.includes(d.status));
  const relay = leg.isFinal ? null : v.to;
  const qty = (t: string) => v.lines.filter((l) => r.get<Product>('dm.master.products', l.productId)?.temp === t).reduce((a, l) => a + l.plannedQty, 0);
  const person = r.list<Contact>('dm.org.contacts').find((c) => c.owner.type === 'branch' && c.owner.id === d.branchId && c.kind === 'メイン担当者')?.name ?? '';
  return {
    no: d.id, staff: me.id, pt: leg.from.id, type: d.serviceForm === 'COOL便' ? 'cool' : 'es',
    name: DELIVERED.includes(d.status) ? deliveryBranchName(r, d) : d.destination.name, zip: d.destination.address.zip, addr: addrOf(d.destination.address), person, tel: d.destination.tel,
    win: d.destination.windows.map((w) => [w.from, w.to] as [string, string]),
    /* 納品備考：代替品（元：〇〇）・届けない不良商品・回収／廃棄の指示（代替品設定） */
    cond: relay ? `中継先「${relay.name}」まで運ぶ（お届けは2次のドライバー）` : d.destination.note, note: altNotes(r, d as DDelivery).join('\n'), docs: [],
    boxes: inv.length, fr: qty('冷蔵'), fz: qty('冷凍'), inv, cash: relay ? 0 : cashPlan(r, d),
    /* 中継までの区間は届けない。最後の区間は、受け取るまではお届け日が先なら受取だけ */
    later: relay || (!picked && d.deliverOn > day) ? mdW(d.deliverOn) : undefined,
    /* 受け取ったあとでも、納品日の前に納品するときは確認と理由が要る（課題 4-1） */
    early: !relay && picked && d.deliverOn > day && !done ? mdW(d.deliverOn) : undefined,
    status: done ? '配送完了' : '未配送',
    doneAt: doc?.doneAt ?? (done && d.deliveredAt ? atOf(d.deliveredAt) : null),
    ck: doc?.ck ?? (done ? Object.fromEntries(inv.map((i) => [i.no, true])) : {}),
    eta: doc?.eta ?? null, etaAt: doc?.etaAt, extra: doc?.extra, unsent: doc?.unsent,
    tr: delTroubles(r, d.id, docs),
    ops: false, carrier: leg.carrierId !== OWN_CARRIER, alt: altIdOf(r, d as DDelivery) || undefined,
  };
}

function pointView(r: DocRepo, me: DriverMe, v: LegV, vs: LegV[], dels: DeliveryView[], day: string, docs: TroubleDoc[]): PointView {
  const f = v.from;
  const w = r.get<{ address: Address }>('dm.master.warehouses', f.id);
  const p: Point = { id: f.id, staff: me.id, type: f.type === 'relay' ? 'hub' : 'wh', name: f.name, code: f.id, zip: w?.address.zip ?? '', addr: addrOf(w?.address), tel: f.tel ?? '', docs: [] };
  const mine = vs.filter((x) => x.leg.from.id === f.id);
  const prog = r.get<PointDoc>(K.pt, ptKey(me.id, f.id, day));
  /* 共通データで受取済の区間の箱は受け取った扱い（この日に受け取ったものは、箱ごとのチェックを使う） */
  const recv: Record<string, boolean> = {};
  for (const x of mine) {
    const d = dels.find((y) => y.no === x.delivery.id)!;
    const own = d.inv.some((i) => prog?.recv && recvKey(d.no, i.no) in prog.recv);
    for (const i of d.inv) if (own ? prog!.recv![recvKey(d.no, i.no)] : x.leg.pickedUpAt && !i.late) recv[recvKey(d.no, i.no)] = true;
  }
  const all = mine.length > 0 && mine.every((x) => x.leg.pickedUpAt);
  const status = prog?.status ?? (all ? '受取済' : '未受取');
  const last = mine.map((x) => x.leg.pickedUpAt).filter(Boolean).sort().pop();
  return {
    ...p, status, doneAt: prog?.doneAt ?? (status === '受取済' && last ? atOf(last) : null), round: prog?.round ?? 1, recv, unsent: prog?.unsent,
    tr: docs.filter((t) => t.target === 'pt:' + f.id && t.at.startsWith(day)).map((t) => fromDoc(r, t)),
  };
}

/** その日の受取地点・配送（legs＝配送ID → 区間） */
export function dayOf(r: DocRepo, me: DriverMe, day: string) {
  const vs = legsOf(r, me.id, day);
  const docs = r.list<TroubleDoc>(K.trb).filter((t) => t.staff === me.id);
  const dels = vs.map((v) => delView(r, me, v, day, docs));
  const seen = new Set<string>();
  const points = vs.filter((v) => !seen.has(v.leg.from.id) && seen.add(v.leg.from.id)).map((v) => pointView(r, me, v, vs, dels, day, docs));
  return { points, dels, legs: new Map(vs.map((v) => [v.delivery.id, v])) };
}

/* ---------- ES配送便の5ステップ ---------- */

/** 画面の印（共通データの報告にないもの） */
export type FlowUi = {
  step?: number; stockDone?: boolean; stockAt?: string; dispAt?: string;
  stockCk?: Record<string, boolean>; dispCk?: Record<string, boolean>; park?: Flow['park'];
  /** 「廃棄・棚卸し」の画面で登録した廃棄の数の合計（商品ID → 数）。5ステップの完了で上書きしないために持つ */
  waste?: Record<string, number>;
};
export type FlowDoc = { id: string; ui: FlowUi; pending?: Flow };

/** 理論在庫：棚卸しと同じ棚卸の下書き（report.stockSheet）の数。この配送の納品・廃棄は入れない（この配送の前の在庫） */
export const baseline = (r: DocRepo, d: DL) => new Map(invRows(r, d.branchId, d).rows.map((x) => [x.id, x.th]));

/** 共通データの報告 → 5ステップの画面の形（オフラインで送っていない内容があればそれ） */
export function flowOf(r: DocRepo, staff: string, d: DL): Flow {
  const doc = r.get<FlowDoc>(K.flow, d.id);
  if (doc?.pending) return doc.pending;
  const ui = doc?.ui ?? {};
  const rep = r.get<DeliveryReport>('dm.report.deliveryReports', d.id);
  const lines = linesOf(r, d.id);
  const done = rep?.status === '完了';
  const base = baseline(r, d);
  const saved = new Map((rep?.stock ?? []).map((x) => [x.productId, x]));
  let ids = [...new Set([...base.keys(), ...saved.keys()])];
  if (!ids.length) ids = lines.map((l) => l.productId);
  const stock = ids.map((id) => {
    const s = saved.get(id);
    const th = base.get(id) ?? s?.remaining ?? 0;
    return { id, n: pname(r, id), th, dc: s?.disposed ?? 0, ac: s ? s.remaining - s.disposed : th, ck: ui.stockCk?.[id] ?? done, w: ui.waste?.[id] ?? 0 };
  });
  /* 検品の数は明細の行ごと（lineId。古い報告は商品ID）。B1 */
  const insp = new Map((rep?.inspection ?? []).map((x) => [x.lineId ?? x.productId, x.qty]));
  const disp = lines.map((l) => {
    const k = insp.has(l.id) ? l.id : l.productId;
    return { id: l.productId, lid: l.id, n: shownName(l.productName, pname(r, l.productId)) + (l.kind ? `（${altLabel(l, (x) => pname(r, x))}）` : ''), pl: l.plannedQty, ac: insp.get(k) ?? l.plannedQty, ck: ui.dispCk?.[l.id] ?? ui.dispCk?.[l.productId] ?? insp.has(k) };
  });
  const pk = r.list<ParkingReport>('dm.report.parking').filter((x) => x.deliveryId === d.id && x.driverId === staff).pop();
  const step = ui.step ?? (done ? 6 : rep?.photosAfter.length ? 5 : insp.size ? 4 : rep?.stock.length ? 3 : rep?.photosBefore.length ? 2 : 0);
  return {
    step, before: (rep?.photosBefore ?? []).map((f) => fileData(r, f)), after: (rep?.photosAfter ?? []).map((f) => fileData(r, f)),
    stock, stockDone: done || !!ui.stockDone, stockAt: ui.stockAt, disp, dispDone: insp.size > 0, dispAt: ui.dispAt,
    plan: rep?.cash?.expectedYen ?? cashPlan(r, d), cash: rep?.cash && rep.cash.collectedYen >= 0 ? String(rep.cash.collectedYen) : '',
    park: pk ? { fee: String(pk.feeYen), rc: fileData(r, pk.receiptFile) } : ui.park ?? { fee: '', rc: null },
  };
}

/* ---------- 棚卸し ---------- */

/**
 * 棚卸しの行：この締めの棚卸の下書き（前回の数＋届けた数−この締めの報告で捨てた数。申告済みならその数）。
 * exclude＝その配送の納品・廃棄を入れない（ES配送便の5ステップの理論在庫＝その配送の前の在庫）
 */
export function invRows(r: DocRepo, branchId: string, exclude?: DL) {
  const sheet = report.queries.stockSheet(r, { branchId });
  const disposed = new Map<string, number>();
  const own = new Map<string, number>();
  /* この点検で数える配送（前回の点検のあとに届けた配送・課題 4a-11）に入っていれば引く */
  if (exclude && exclude.deliveredQty !== null && sheet.deliveryIds.includes(exclude.id)) {
    for (const l of linesOf(r, exclude.id)) own.set(l.productId, l.deliveredQty ?? 0);
  }
  for (const rep of r.list<DeliveryReport>('dm.report.deliveryReports')) {
    const on = rep.startedAt.slice(0, 10);
    if (rep.branchId !== branchId || on < sheet.from || on > sheet.to || rep.id === exclude?.id) continue;
    for (const s of rep.stock) disposed.set(s.productId, (disposed.get(s.productId) ?? 0) + s.disposed);
  }
  const check = r.get<StockCheck>('dm.report.stockChecks', `SC-${sheet.period}-${branchId}`);
  const rows: (InvRow & { id: string })[] = sheet.rows.map((x) => {
    const c = check?.rows.find((y) => y.productId === x.productId);
    const th = c ? c.actual : Math.max(0, x.prev + x.delivered - (own.get(x.productId) ?? 0) - (disposed.get(x.productId) ?? 0));
    return { id: x.productId, n: pname(r, x.productId), th, ac: th };
  });
  /* 申告に使う廃棄の数（前回の数＋届けた数−今の数を超えない。報告の在庫と点検の下書きの数がずれていても申告できるように） */
  const disposedFor = (productId: string, actual: number) => {
    const x = sheet.rows.find((y) => y.productId === productId);
    return Math.max(0, Math.min(disposed.get(productId) ?? 0, (x ? x.prev + x.delivered : 0) - actual));
  };
  return { rows, disposedFor };
}

/* ---------- お知らせ ---------- */

/** お知らせ（ドライバー向けのお知らせ＋自分あての通知。新しい順）。key＝'a:<お知らせID>'・'n:<通知ID>' */
export function newsOf(r: DocRepo, staff: string): (News & { key: string })[] {
  const read = r.get<{ ids: string[] }>(K.news, staff)?.ids ?? [];
  const an = notice.queries.announcements(r, { site: 'driver' }).map((a) => ({
    key: 'a:' + a.id, sort: a.publishFrom + ' 00:00', t: mdW(a.publishFrom), title: a.important && !a.title.startsWith('【') ? `【重要】${a.title}` : a.title, body: a.body, read: read.includes(a.id),
  }));
  const inbox = r.get('dm.account.accounts', staff) ? notice.queries.inbox(r, { accountId: staff }).list.map((n) => ({
    key: 'n:' + n.id, sort: n.at, t: atOf(n.at), title: n.title, body: n.body, read: !!n.readAt,
  })) : [];
  return [...an, ...inbox].sort((x, y) => y.sort.localeCompare(x.sort)).map(({ sort: _s, ...x }) => x);
}
