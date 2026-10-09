import { ApiError } from '@/lib/api/errors';
import { disposalsOfBranch } from '../alt';
import { defineArea, toDocs, type DocRepo } from '@/lib/ops/core/area';
import { notify } from '../notify';
import { addDays, nowStamp, today } from '@/lib/supplier/dates';
import { buildChildContracts } from '../seed/delivery';
import { buildReports, periodRange } from '../seed/report';
import type { AppPurchase, Branch, ChildContract, Contract, Delivery, DeliveryLine, DeliveryReport, Driver, Leg, ParkingReport, Product, StockCheck, Trouble } from '../types';
import { esExpiryOn } from '../product';
import { completeDelivery, lineQtys, reinspect } from './delivery';

/*
 * 現場の報告（area: report）。kind：dm.report.deliveryReports／parking／stockChecks
 *   ドライバー：配送の報告（5ステップ）→ 完了で配送が納品済（足りなければ一部納品済＋数量相違のトラブル）。駐車場代の報告
 *   委託配送先・運営：駐車報告を見る（承認はない。運営は理由つきで代理入力・修正）
 *   法人（COOL便の拠点）・ドライバー：棚卸の申告 → 運営が確認
 */

const STEPS = ['photosBefore', 'stock', 'inspection', 'photosAfter', 'cash'] as const;
type Step = (typeof STEPS)[number];

const reports = (r: DocRepo) => r.list<DeliveryReport>('dm.report.deliveryReports');
const getDelivery = (r: DocRepo, id: string) => {
  const d = r.get<Delivery>('dm.delivery.deliveries', id);
  if (!d) throw new ApiError(`配送が見つかりません（${id}）`, 404);
  return d;
};
const finalLeg = (r: DocRepo, deliveryId: string) => r.list<Leg>('dm.delivery.legs').find((l) => l.deliveryId === deliveryId && l.isFinal);
const linesOf = (r: DocRepo, id: string) => r.list<DeliveryLine>('dm.delivery.lines').filter((l) => l.deliveryId === id);
const childOf = (r: DocRepo, d: Delivery) => r.get<ChildContract>('dm.org.childContracts', d.childContractId);

/** 今日が入る締め月（21日から次の締め月） */
export const periodOf = (date: string) => {
  const [y, m, d] = date.split('/').map(Number);
  const x = new Date(y, m - 1 + (d >= 21 ? 1 : 0), 1);
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}`;
};
/** 集金の予定額（仮。本番はアプリの現金利用の合計）。報告を始める前の画面（ドライバー）でも使う */
export const CASH_PLAN_YEN = 1200;

/** お届け中（出荷したがまだ納品していない）の配送の状態（棚卸で「届いていれば数に入れる」もの・課題 4-6） */
export const IN_TRANSIT: Delivery['status'][] = ['出荷済', '受取済', '再配達待', '確認中'];
/** アプリの販売数（締めの期間・返金済みを除く）。理論在庫の「販売」 */
export function appSoldOf(r: DocRepo, branchId: string, from: string, to: string) {
  const m = new Map<string, number>();
  for (const p of r.list<AppPurchase>('dm.app.purchases')) {
    const on = p.at.slice(0, 10);
    if (p.branchId !== branchId || on < from || on > to || p.status === '返金済') continue;
    m.set(p.productId, (m.get(p.productId) ?? 0) + p.qty);
  }
  return m;
}
/** 棚卸なしの拠点（課題 2-1：管理ロス・点検の督促を出さない） */
export const noStockCheck = (r: DocRepo, branchId: string) => !!r.get<Branch>('dm.org.branches', branchId)?.noStockCheck;

/**
 * 最初の棚卸報告をまだしていない拠点（受付簿 No.134・台帳 N「切り替えのときの最初の在庫」）。
 *   購入はロックしない（理論在庫は 0 から始まり、前から残っている商品はスキャンで買える）。法人Web に「最初の棚卸報告をしてください」を、報告するまで出す。
 *   最初の棚卸報告までは管理ロスを出さない（始まりの数がないため。実績精算の管理ロスの行を作らない）。最初の報告で実在庫に置き換わる
 * 点検の対象の拠点（有効な契約があり、棚卸なしでない）で、棚卸（dm.report.stockChecks）が1つもないもの
 */
export const hasStockCheck = (r: DocRepo, branchId: string, upTo?: string) =>
  r.list<StockCheck>('dm.report.stockChecks').some((x) => x.branchId === branchId && (!upTo || x.period <= upTo));
export function firstStockPending(r: DocRepo, branchIds?: string[]) {
  const live = new Set(r.list<Contract>('dm.org.contracts').filter((c) => c.status === '有効').map((c) => c.branchId));
  const filed = new Set(r.list<StockCheck>('dm.report.stockChecks').map((x) => x.branchId));
  return r.list<Branch>('dm.org.branches')
    .filter((b) => (!branchIds || branchIds.includes(b.id)) && b.status === '本登録' && live.has(b.id) && !b.noStockCheck && !filed.has(b.id))
    .map((b) => ({ id: b.id, name: b.name }));
}

/** その拠点の前回の棚卸（この締め月より前でいちばん新しいもの。締め月を飛ばしていても前回から数える） */
export function prevCheck(r: DocRepo, branchId: string, period: string) {
  return r.list<StockCheck>('dm.report.stockChecks').filter((x) => x.branchId === branchId && x.period < period).sort((a, b) => a.period.localeCompare(b.period)).pop();
}
/**
 * 棚卸で数に入れた配送（届けた数）。deliveryIds を持たない古い点検は、その締めの期間の届けた配送（前の決め方）。
 * 次の点検は、ここにない届けた配送を数える（課題 4a-11：点検の日より後に届いた分を次の点検に入れる）
 */
export function countedDeliveries(r: DocRepo, c: StockCheck, all = r.list<Delivery>('dm.delivery.deliveries')) {
  if (c.deliveryIds) return new Set(c.deliveryIds);
  const [f, t] = periodRange(c.period);
  return new Set(all.filter((d) => d.branchId === c.branchId && d.temp !== '資材' && d.deliverOn >= f && d.deliverOn <= t && d.deliveredQty !== null).map((d) => d.id));
}

/**
 * 棚卸の下書き：前回の数・前回の点検のあとに届けた数・お届け中の数・廃棄する数・アプリの販売数（拠点で入れるのは actual・disposed・arrived）。
 * 点検する商品はこの拠点に関係する商品だけ（前回の点検にある・届けた・お届け中・廃棄する。全商品は並べない・課題 4-6）。
 * 届けた数＝前回の点検で数えていない届けた配送（前回の締めの初日から。点検の日より後に届いた分は次の点検に入る・課題 4a-11）。
 * 前回の点検で「お届け中で届いていた（arrived）」と数えた分は引く。販売・廃棄は前回の点検の日の翌日から
 */
function stockSheet(r: DocRepo, branchId: string, period: string) {
  const [from, to] = periodRange(period);
  const prev = prevCheck(r, branchId, period);
  const all = r.list<Delivery>('dm.delivery.deliveries').filter((d) => d.branchId === branchId && d.temp !== '資材');
  const counted = prev ? countedDeliveries(r, prev, all) : new Set<string>();
  const start = prev ? periodRange(prev.period)[0] : from;
  const ds = all.filter((d) => d.deliverOn >= start && d.deliveredQty !== null && !counted.has(d.id) && (!!prev || d.deliverOn <= to));
  const delivered = new Map<string, number>();
  for (const d of ds) for (const l of linesOf(r, d.id)) delivered.set(l.productId, (delivered.get(l.productId) ?? 0) + (l.deliveredQty ?? 0));
  /* 前回の点検でお届け中から数に入れた分（その配送が届いて、いま数える分から引く） */
  const seen = prev?.transitIds ? new Set(prev.transitIds) : null;
  if (seen) {
    const back = new Map<string, number>();
    for (const d of ds.filter((x) => seen.has(x.id))) for (const l of linesOf(r, d.id)) back.set(l.productId, (back.get(l.productId) ?? 0) + (l.deliveredQty ?? 0));
    for (const x of prev!.rows) if (x.arrived) delivered.set(x.productId, (delivered.get(x.productId) ?? 0) - Math.min(x.arrived, back.get(x.productId) ?? 0));
  }
  /* お届け中：出荷したがまだ納品していない配送（締め日までのお届け） */
  const moving = all.filter((d) => IN_TRANSIT.includes(d.status) && d.deliverOn <= to);
  const transit = new Map<string, number>();
  for (const d of moving) for (const l of linesOf(r, d.id)) transit.set(l.productId, (transit.get(l.productId) ?? 0) + l.plannedQty);
  /* 販売・廃棄は前回の点検の日の翌日から（前回の点検の数に入っているので） */
  const since = prev ? addDays(prev.checkedOn, 1) : from;
  /* 締め日を過ぎてから点検するときは今日まで（点検の日の数に入るので） */
  const until = today() > to ? today() : to;
  const altDisposals = disposalsOfBranch(r, branchId, since, until);
  const dispose = new Map<string, number>();
  for (const x of altDisposals) dispose.set(x.productId, (dispose.get(x.productId) ?? 0) + x.qty);
  const sold = appSoldOf(r, branchId, since, until);
  const ids = [...new Set([...(prev?.rows.map((x) => x.productId) ?? []), ...delivered.keys(), ...transit.keys(), ...dispose.keys()])];
  /*
   * ES の期限を過ぎた見込み（2026/10/03 回答：廃棄の提案）：今ある見込み（前回＋届けた−アプリの販売−廃棄する）を新しいお届けから順に当て、
   * お届け日＋ES の期限（商品マスタ）が点検の日より前の分を「期限切れの見込み」にする。古い記録のない分は数えない
   */
  const doneDs = all.filter((d) => d.deliveredQty !== null && d.deliverOn <= until).sort((a, b) => b.deliverOn.localeCompare(a.deliverOn));
  const expiryOf = (productId: string, left: number) => {
    const p = r.get<Product>('dm.master.products', productId);
    let rest = left, expired = 0, soonest = '';
    for (const d of doneDs) {
      if (rest <= 0) break;
      const q = linesOf(r, d.id).filter((l) => l.productId === productId).reduce((a, l) => a + (l.deliveredQty ?? 0), 0);
      if (!q) continue;
      const take = Math.min(rest, q), on = esExpiryOn(p, d.deliverOn);
      rest -= take;
      if (!on) continue;
      if (on < until) expired += take;
      else if (!soonest || on < soonest) soonest = on;
    }
    return { expired, expiresOn: soonest };
  };
  const parcel = ds.length > 0 && ds.every((d) => d.regime === 'parcel_carrier');
  return {
    branchId, period, from, to,
    /** 申告する人（COOL便だけの拠点は法人、ほかはドライバー。どちらでも申告はできる） */
    by: parcel ? 'corp' as const : 'driver' as const,
    /** 棚卸なしの拠点（課題 2-1） */
    noCheck: noStockCheck(r, branchId),
    /** この点検で数に入れる届けた配送・お届け中の配送（申告に残す。課題 4a-11） */
    deliveryIds: ds.map((d) => d.id),
    transitIds: moving.map((d) => d.id),
    rows: ids.map((productId) => {
      const pv = prev?.rows.find((x) => x.productId === productId)?.actual ?? 0, dv = Math.max(0, delivered.get(productId) ?? 0);
      const ex = expiryOf(productId, pv + dv - (sold.get(productId) ?? 0) - (dispose.get(productId) ?? 0));
      return {
      productId, prev: pv, delivered: dv,
      /** お届け中の数（届いていれば今の数に入れて、arrived に入れる） */
      inTransit: transit.get(productId) ?? 0,
      /** 廃棄する数（代替品設定の不良品。管理ロスにしない） */
      toDispose: dispose.get(productId) ?? 0,
      /** アプリの販売数（理論在庫の販売） */
      appSold: sold.get(productId) ?? 0,
      /** ES の期限を過ぎた見込みの数（廃棄の提案）・まだ期限内の分のいちばん近い期限の日 */
      expired: ex.expired, expiresOn: ex.expiresOn,
      };
    }),
    /** お届け中の配送（点検の画面に出す） */
    inTransit: moving.map((d) => ({ deliveryId: d.id, deliverOn: d.deliverOn, status: d.status, lines: linesOf(r, d.id).map((l) => ({ productId: l.productId, qty: l.plannedQty })) })),
    /** 代替品設定の不良品（廃棄として申告する分。管理ロスにしない。COOL便＝法人が廃棄して申告、ES配送便＝ドライバーが回収） */
    altDisposals,
  };
}

export default defineArea({
  name: 'report',
  seed: () => {
    const s = buildReports(buildChildContracts());
    return { 'dm.report.deliveryReports': toDocs(s.reports), 'dm.report.parking': toDocs(s.parking), 'dm.report.stockChecks': toDocs(s.stockChecks) };
  },
  queries: {
    /** ドライバー：配送の報告（なければ下書き）。品目・予定数・現金の予定も返す */
    forDelivery(r, { deliveryId }: { deliveryId: string }) {
      const d = getDelivery(r, deliveryId);
      return {
        delivery: d, report: r.get<DeliveryReport>('dm.report.deliveryReports', deliveryId) ?? null,
        lines: linesOf(r, d.id), cashRequired: !!childOf(r, d)?.app.allowCash, steps: STEPS,
      };
    },
    driverReports: (r, a: { driverId: string; status?: DeliveryReport['status'] }) =>
      reports(r).filter((x) => x.driverId === a.driverId && (!a.status || x.status === a.status)).sort((x, y) => y.startedAt.localeCompare(x.startedAt)),
    /** 運営・法人：拠点の報告（法人Web には写真と数だけ。ドライバー名は出さない） */
    forBranch: (r, a: { branchId: string; forCorp?: boolean }) =>
      reports(r).filter((x) => x.branchId === a.branchId).map((x) => (a.forCorp ? { ...x, driverId: '' } : x)),
    parking: (r, a?: { driverId?: string; carrierId?: string }) =>
      r.list<ParkingReport>('dm.report.parking').filter((x) => (!a?.driverId || x.driverId === a.driverId) && (!a?.carrierId || x.carrierId === a.carrierId)),
    stockChecks: (r, a?: { branchId?: string; period?: string }) =>
      r.list<StockCheck>('dm.report.stockChecks').filter((x) => (!a?.branchId || x.branchId === a.branchId) && (!a?.period || x.period === a.period)),
    /** 棚卸の入力画面の下書き（period 省略で今日の締め月） */
    stockSheet: (r, a: { branchId: string; period?: string }) => stockSheet(r, a.branchId, a.period ?? periodOf(today())),
    /** 最初の棚卸報告をまだしていない拠点（法人Web のホーム・棚卸報告に「最初の棚卸報告をしてください」を出す。受付簿 No.134） */
    firstStockPending: (r, a?: { branchIds?: string[] }) => firstStockPending(r, a?.branchIds),
    /** 運営：この締めでまだ申告していない拠点 */
    stockDue(r, a?: { period?: string }) {
      const period = a?.period ?? periodOf(today());
      const [from, to] = periodRange(period);
      /* 棚卸なしの拠点は督促しない（課題 2-1） */
      const ids = [...new Set(r.list<Delivery>('dm.delivery.deliveries').filter((d) => d.temp !== '資材' && d.deliverOn >= from && d.deliverOn <= to && !['取消', '中止'].includes(d.status)).map((d) => d.branchId))]
        .filter((b) => !noStockCheck(r, b));
      return ids.filter((b) => !r.get('dm.report.stockChecks', `SC-${period}-${b}`)).map((b) => ({ ...stockSheet(r, b, period), rows: undefined }));
    },
  },
  actions: {
    /** ドライバー：報告を始める（受け取ったあと、届け先で） */
    start(r, { deliveryId, driverId }: { deliveryId: string; driverId: string }) {
      const d = getDelivery(r, deliveryId);
      const leg = finalLeg(r, deliveryId);
      if (!leg || leg.driverId !== driverId) throw new ApiError('自分の配送ではありません', 403);
      if (!leg.pickedUpAt || d.status !== '受取済') throw new ApiError('受取のあとに始めてください', 409);
      const cur = r.get<DeliveryReport>('dm.report.deliveryReports', deliveryId);
      if (cur) return cur;
      const next: DeliveryReport = {
        id: deliveryId, deliveryId, branchId: d.branchId, driverId, status: '入力中', photosBefore: [], stock: [], inspection: [], photosAfter: [],
        /* 集金の予定額は仮（本番はアプリの現金利用の合計） */
        cash: childOf(r, d)?.app.allowCash ? { expectedYen: CASH_PLAN_YEN, collectedYen: -1, note: '' } : null, startedAt: nowStamp(), completedAt: '', editableUntil: '',
      };
      r.put('dm.report.deliveryReports', deliveryId, next);
      return next;
    },
    /** ドライバー：ステップの保存（集金は collectedYen を入れる。-1＝まだ）。完了後は7日まで・トラブルがない配送だけ（検品の数も直せる。課題 4-4） */
    saveStep(r, a: { deliveryId: string; driverId: string; step: Step; data: unknown }) {
      const rep = r.get<DeliveryReport>('dm.report.deliveryReports', a.deliveryId);
      if (!rep || rep.driverId !== a.driverId) throw new ApiError('報告が見つかりません（先に開始してください）', 404);
      if (rep.status === '完了') {
        if (today() > rep.editableUntil) throw new ApiError('完了から7日を過ぎたので直せません', 409);
        /* 完了から7日まで直せる。トラブルがある配送は直せない（課題 4-4） */
        if (r.list<Trouble>('dm.delivery.troubles').some((t) => t.deliveryId === a.deliveryId)) throw new ApiError('トラブルがある配送の報告は直せません（運営に連絡してください）', 409);
      }
      const lines = linesOf(r, a.deliveryId);
      const next = { ...rep };
      if (a.step === 'photosBefore' || a.step === 'photosAfter') {
        const files = a.data as string[];
        if (!Array.isArray(files) || files.length < 1 || files.length > 20) throw new ApiError('写真は1〜20枚にしてください', 400);
        next[a.step] = files;
      } else if (a.step === 'stock') {
        const rows = a.data as DeliveryReport['stock'];
        if (rows.some((x) => x.remaining < 0 || x.disposed < 0 || x.disposed > x.remaining)) throw new ApiError('残っていた数・捨てた数を正しく入れてください（捨てた数は残っていた数まで）', 400);
        next.stock = rows;
      } else if (a.step === 'inspection') {
        const rows = a.data as DeliveryReport['inspection'];
        if (!Array.isArray(rows)) throw new ApiError('検品の数を入れてください', 400);
        /* 明細の行ごと（lineId）。lineId のない行は商品ごとの合計（同じ商品の通常＋代替品の行を上から埋める。B1） */
        const has = (l: (typeof lines)[number]) => rows.some((x) => x.lineId === l.id || (!x.lineId && x.productId === l.productId));
        const miss = lines.find((l) => !has(l));
        if (miss) throw new ApiError(`${miss.productId} の数を 0〜${miss.plannedQty} で入れてください`, 400);
        const qs = lineQtys(lines, rows, (l) => l.plannedQty);
        next.inspection = lines.map((l) => ({ productId: l.productId, lineId: l.id, qty: qs.get(l.id)! }));
        /* 完了したあとの直し：配送の届けた数・状態も直す（課題 4-4） */
        if (rep.status === '完了') reinspect(r, { deliveryId: a.deliveryId, driverId: a.driverId, lines: next.inspection });
      } else if (a.step === 'cash') {
        if (!rep.cash) throw new ApiError('この拠点は現金の集金がありません', 400);
        const c = a.data as NonNullable<DeliveryReport['cash']>;
        if (c.collectedYen < 0) throw new ApiError('集金額を正しく入れてください', 400);
        if (c.collectedYen !== c.expectedYen && !c.note?.trim()) throw new ApiError('集金額が予定と違うときはメモを入れてください', 400);
        next.cash = c;
      }
      r.put('dm.report.deliveryReports', a.deliveryId, next);
      return next;
    },
    /** ドライバー：報告の完了 → 配送を完了にする（検品の数で納品済／一部納品済） */
    finish(r, { deliveryId, driverId, earlyReason }: { deliveryId: string; driverId: string; earlyReason?: string }) {
      const rep = r.get<DeliveryReport>('dm.report.deliveryReports', deliveryId);
      if (!rep || rep.driverId !== driverId) throw new ApiError('報告が見つかりません', 404);
      if (rep.status === '完了') throw new ApiError('もう完了しています', 409);
      const missing = [!rep.photosBefore.length && '陳列前の写真', !rep.stock.length && '在庫・廃棄', !rep.inspection.length && '検品', !rep.photosAfter.length && '陳列後の写真', rep.cash && rep.cash.collectedYen < 0 && '集金'].filter(Boolean);
      if (missing.length) throw new ApiError(`まだ入れていないステップがあります：${missing.join('・')}`, 400);
      const d = completeDelivery(r, { deliveryId, driverId, earlyReason, lines: rep.inspection.map((x) => ({ productId: x.productId, qty: x.qty, ...(x.lineId ? { lineId: x.lineId } : {}) })) });
      const next: DeliveryReport = { ...rep, status: '完了', completedAt: nowStamp(), editableUntil: addDays(today(), 7), ...(today() < d.deliverOn ? { earlyReason: earlyReason!.trim() } : {}) };
      r.put('dm.report.deliveryReports', deliveryId, next);
      return { report: next, delivery: d };
    },
    /**
     * 駐車報告（レシートの写真と駐車料金の両方が要る。入力したら確定・承認はない：2026/10/03）。
     * ドライバー：自分の区間の配送だけ。納品まで入れられ、納品日から7日まで直せる（ほかの報告と同じ）。
     * 運営（by）：代理で入れる・直す（理由が要る）。配送・ドライバーごとに1つ（入れ直したら上書きして修正の記録を残す）
     */
    reportParking(r, a: { driverId: string; deliveryId: string; feeYen: number; receiptFile: string; by?: string; reason?: string }) {
      const dr = r.get<Driver>('dm.master.drivers', a.driverId);
      const d = r.get<Delivery>('dm.delivery.deliveries', a.deliveryId);
      if (!dr || !d) throw new ApiError('配送・ドライバーが見つかりません', 404);
      if (a.by) { if (!a.reason?.trim()) throw new ApiError('代理で入れる・直す理由を入れてください', 400); }
      else if (!r.list<Leg>('dm.delivery.legs').some((l) => l.deliveryId === a.deliveryId && l.driverId === a.driverId)) throw new ApiError('自分の配送ではありません', 403);
      if (!Number.isInteger(a.feeYen) || a.feeYen < 0 || a.feeYen > 999999) throw new ApiError('駐車料金は0以上の整数（円）で入れてください', 400);
      if (!a.receiptFile) throw new ApiError('レシートの写真を入れてください', 400);
      if (['予定', '取消'].includes(d.status)) throw new ApiError('この配送には駐車報告を入れられません', 409);
      if (!a.by && d.deliveredAt && today() > addDays(d.deliverOn, 7)) throw new ApiError('納品日から7日を過ぎたため直せません（運営に連絡してください）', 409);
      const cur = r.list<ParkingReport>('dm.report.parking').find((x) => x.deliveryId === a.deliveryId && x.driverId === a.driverId);
      const by = a.by ?? a.driverId, at = nowStamp();
      if (cur) {
        const next: ParkingReport = { ...cur, feeYen: a.feeYen, receiptFile: a.receiptFile, correctedBy: by, correctedAt: at, correctionReason: a.reason ?? '' };
        r.put('dm.report.parking', cur.id, next);
        return next;
      }
      const ymd = today().slice(2).replace(/\//g, '');
      const n = r.list<ParkingReport>('dm.report.parking').filter((x) => x.id.startsWith(`PK-${ymd}-`)).length + 1;
      const next: ParkingReport = { id: `PK-${ymd}-${String(n).padStart(4, '0')}`, driverId: a.driverId, carrierId: dr.carrierId, deliveryId: a.deliveryId, date: d.deliverOn, feeYen: a.feeYen, receiptFile: a.receiptFile,
        reportedBy: by, reportedAt: at, ...(a.by ? { correctionReason: a.reason } : {}) };
      r.put('dm.report.parking', next.id, next);
      return next;
    },
    /**
     * 法人・ドライバー：棚卸の申告（今の数と捨てた数・お届け中のうち届いて数に入れた数 arrived）。売れた数は計算する。
     * 点検する商品はこの拠点に関係する商品だけ（下書きの行）。棚卸なしの拠点は申告しない
     */
    fileStock(r, a: { branchId: string; period?: string; rows: { productId: string; actual: number; disposed: number; arrived?: number }[]; site: 'corp' | 'driver'; accountId: string; name?: string }) {
      const sheet = stockSheet(r, a.branchId, a.period ?? periodOf(today()));
      if (sheet.noCheck) throw new ApiError('この拠点は棚卸報告の対象ではありません（棚卸なしの拠点）', 409);
      const id = `SC-${sheet.period}-${a.branchId}`;
      const cur = r.get<StockCheck>('dm.report.stockChecks', id);
      if (cur?.status === '確認済') throw new ApiError('運営が確認済みなので直せません', 409);
      const rows = sheet.rows.map(({ inTransit, toDispose: _d, ...x }) => {
        const v = a.rows.find((y) => y.productId === x.productId);
        if (!v) throw new ApiError(`${x.productId} の数を入れてください`, 400);
        if (![v.actual, v.disposed].every((n) => Number.isInteger(n) && n <= 999999)) throw new ApiError(`${x.productId}：数は0〜999,999の範囲で入れてください`, 400);
        const arrived = v.arrived ?? 0;
        if (!(Number.isInteger(arrived) && arrived >= 0 && arrived <= inTransit)) throw new ApiError(`${x.productId}：届いた数はお届け中の数（${inTransit}）までで入れてください`, 400);
        const sold = x.prev + x.delivered + arrived - v.disposed - v.actual;
        if (v.actual < 0 || v.disposed < 0 || sold < 0) throw new ApiError(`${x.productId}：今の数＋捨てた数が、前回の数＋届けた数（${x.prev + x.delivered + arrived}）を超えています`, 400);
        return { ...x, disposed: v.disposed, actual: v.actual, sold, ...(arrived ? { arrived } : {}) };
      });
      /*
       * 下書きにない商品（法人Web の「商品を追加」・hong 2026-10-05 版1.0レビュー ⑤）：前回の数 0・届けた数 0 で受け付ける（販売数の計算はしない）。
       * 次の点検からはこの商品が前回の点検にある商品になる
       */
      for (const v of a.rows.filter((y) => !sheet.rows.some((x) => x.productId === y.productId))) {
        if (!r.get('dm.master.products', v.productId)) throw new ApiError(`${v.productId}：商品が見つかりません`, 400);
        if (!(Number.isInteger(v.actual) && v.actual >= 0 && Number.isInteger(v.disposed) && v.disposed >= 0)) throw new ApiError(`${v.productId}：数は0以上の整数で入れてください`, 400);
        rows.push({ productId: v.productId, prev: 0, delivered: 0, disposed: v.disposed, actual: v.actual, sold: 0, appSold: 0, expired: 0, expiresOn: '' });
      }
      /* 数に入れた配送を残す（次の点検は、これにない届けた配送を数える・課題 4a-11） */
      const next: StockCheck = {
        id, branchId: a.branchId, period: sheet.period, checkedOn: today(), checkedBy: { site: a.site, accountId: a.accountId, ...(a.name ? { name: a.name } : {}) }, rows, status: '申告済',
        deliveryIds: sheet.deliveryIds, transitIds: sheet.transitIds,
      };
      r.put('dm.report.stockChecks', id, next);
      return next;
    },
    /** 運営：棚卸の確認（確認後は申告者が直せない） */
    confirmStock(r, { id }: { id: string; by: string }) {
      const x = r.get<StockCheck>('dm.report.stockChecks', id);
      if (!x) throw new ApiError('棚卸が見つかりません', 404);
      const next = { ...x, status: '確認済' as const };
      r.put('dm.report.stockChecks', id, next);
      return next;
    },
  },
});
