import { ApiError, errorMessage } from '@/lib/api/errors';
import { defineArea, type DocRepo } from '@/lib/ops/core/area';
import account from '@/lib/domain/areas/account';
import { issueResetCode, passwordOk, resetPassword, verifyResetCode } from '@/lib/domain/driverAuth';
import delivery from '@/lib/domain/areas/delivery';
import notice from '@/lib/domain/areas/notice';
import report from '@/lib/domain/areas/report';
import type { Delivery as DDelivery, DeliveryReport, Driver, Leg, ParkingReport, Product, Trouble as DTrouble } from '@/lib/domain/types';
import { addDays, nowStamp, today } from '@/lib/supplier/dates';
import {
  baseline, dayOf, fileData, flowOf, invRows, K, newsOf, ptKey, staffOf, type FlowDoc, type FlowUi,
} from './fromDomain';
import { atOf, checkEta, checkTrouble, dispClean, dispDiffs, hmOf, missing, nrAll, recvKey, trOpen, TYPE_OF } from './logic';
import { DLV_REASONS, RECV_REASONS } from './seed';
import type { DeliveryDoc, DeliveryView, DriverMe, Effect, Flow, InvRow, OutboxItem, PointDoc, PointView, TroubleDoc, WasteRow } from './types';

/*
 * ドライバーの領域（40_ドライバーブラウザ.html の画面のデータ）。
 * データは共通データ（lib/domain・dm.*）：ドライバー（dm.master）、ログイン（dm.account の signIn）、今日の受取・配送（delivery.driverDay）、
 *   受取（delivery.pickup）・納品（delivery.complete／report の5ステップ start・saveStep・finish）・トラブル（delivery.reportTrouble・appendTrouble・resolveTrouble）、
 *   駐車場代（report.reportParking）、在庫・廃棄（report の報告の在庫・廃棄、棚卸しは report.fileStock）、お知らせ（notice）。画面の形は lib/driver/fromDomain.ts で作る。
 * 共通データにないもの（箱ごとの受取・到着予定・画面の途中の印・写真の中身・お知らせの既読・オフラインの未送信）だけ driver.* に持つ。
 * どの query / action も staff（ドライバーID）を受け取り、その人の区間だけを返す・書く。
 */

type S = { staff: string };
type Off = { offline?: boolean };

const day = () => today();
function meOf(repo: DocRepo, staff: string): DriverMe {
  const s = staffOf(repo, staff);
  if (!s || s.status !== '有効') throw new ApiError('ドライバーが見つかりません。ログインし直してください', 401);
  return s.me;
}
const queueOf = (repo: DocRepo, id: string) => repo.get<{ items: OutboxItem[] }>(K.out, id)?.items ?? [];
const getDelivery = (repo: DocRepo, no: string) => repo.get<DDelivery>('dm.delivery.deliveries', no);

/* ---------- 共通データに書く ---------- */

/** 写真を置いてファイル名にする（共通データにはファイル名だけ持つ） */
function fileName(repo: DocRepo, data: string) {
  if (!data.startsWith('data:')) return data;
  let h = 5381;
  for (let i = 0; i < data.length; i++) h = ((h * 33) ^ data.charCodeAt(i)) >>> 0;
  const name = `IMG-${h.toString(16)}-${data.length}.jpg`;
  if (!repo.get(K.file, name)) repo.put(K.file, name, { id: name, data });
  return name;
}

/** 報告（なければ始める） */
const ensureReport = (repo: DocRepo, no: string, driverId: string) =>
  repo.get<DeliveryReport>('dm.report.deliveryReports', no) ?? report.actions.start(repo, { deliveryId: no, driverId });

/**
 * 5ステップの在庫・廃棄の行。「廃棄・棚卸し」の画面で登録した廃棄は上書きしない：
 * 画面が読み込んだあとに足された廃棄の数（登録の合計 − 行の w）を、ドライバーが入れた廃棄数に足す（実在庫はそのまま、残っていた数＝実在庫＋廃棄数）。
 * 5ステップにない商品の廃棄は、報告の行をそのまま残す。どちらの画面で入れた数も消えない
 */
function stockRows(repo: DocRepo, no: string, f: Flow, rep: DeliveryReport): DeliveryReport['stock'] {
  const waste = repo.get<FlowDoc>(K.flow, no)?.ui.waste ?? {};
  const idOf = (r: { id?: string; n: string }) => r.id ?? repo.list<Product>('dm.master.products').find((p) => p.name === r.n)?.id ?? r.n;
  const rows = f.stock.map((r) => {
    const extra = Math.max(0, (waste[idOf(r)] ?? 0) - (r.w ?? 0));
    return { productId: idOf(r), remaining: r.ac + r.dc + extra, disposed: r.dc + extra };
  });
  const ids = new Set(rows.map((x) => x.productId));
  return [...rows, ...rep.stock.filter((x) => !ids.has(x.productId) && waste[x.productId])];
}

/** 5ステップの内容を報告に書く（変わったステップだけ。検品は inspection のときだけ） */
function saveSteps(repo: DocRepo, no: string, driverId: string, f: Flow, inspection: boolean) {
  const rep = ensureReport(repo, no, driverId);
  const save = (step: 'photosBefore' | 'stock' | 'inspection' | 'photosAfter' | 'cash', data: unknown, cur: unknown) => {
    if (JSON.stringify(data) !== JSON.stringify(cur)) report.actions.saveStep(repo, { deliveryId: no, driverId, step, data });
  };
  const idOf = (r: { id?: string; n: string }) => r.id ?? repo.list<Product>('dm.master.products').find((p) => p.name === r.n)?.id ?? r.n;
  if (f.before.length) save('photosBefore', f.before.map((x) => fileName(repo, x)), rep.photosBefore);
  if (f.stockDone) save('stock', stockRows(repo, no, f, rep), rep.stock);
  if (inspection) save('inspection', f.disp.map((r) => ({ productId: idOf(r), ...(r.lid ? { lineId: r.lid } : {}), qty: Math.min(r.ac, r.pl) })), rep.inspection);
  if (f.after.length) save('photosAfter', f.after.map((x) => fileName(repo, x)), rep.photosAfter);
  if (rep.cash && f.cash !== '') {
    const got = Number(f.cash);
    save('cash', { expectedYen: rep.cash.expectedYen, collectedYen: got, note: got === rep.cash.expectedYen ? '' : '予定と違う（差額は後日の精算で調整）' }, rep.cash);
  }
}

/** 送るもの1件を共通データに書く */
function applyEffect(repo: DocRepo, me: DriverMe, e: Effect) {
  const driverId = me.id;
  switch (e.k) {
    case 'pickup': {
      if (!repo.get<Leg>('dm.delivery.legs', e.leg)?.pickedUpAt) delivery.actions.pickup(repo, { legId: e.leg, driverId });
      return;
    }
    case 'trouble': {
      const t = delivery.actions.reportTrouble(repo, { deliveryId: e.no, typeId: TYPE_OF[e.raw] ?? 'other', note: e.note ? `${e.raw}：${e.note}` : e.raw, site: 'driver', accountId: driverId });
      const doc = repo.get<TroubleDoc>(K.trb, e.tid);
      if (doc) repo.put<TroubleDoc>(K.trb, e.tid, { ...doc, dm: [...doc.dm, t.id] });
      return;
    }
    case 'append': {
      const ids = e.tid.startsWith('DT') ? repo.get<TroubleDoc>(K.trb, e.tid)?.dm ?? [] : [e.tid];
      for (const id of ids) if (!repo.get<DTrouble>('dm.delivery.troubles', id)?.resolution) delivery.actions.appendTrouble(repo, { id, text: e.text });
      return;
    }
    case 'resolve': {
      if (repo.list<DTrouble>('dm.delivery.troubles').some((t) => t.deliveryId === e.no && !t.resolution)) delivery.actions.resolveTrouble(repo, { deliveryId: e.no, resolution: 'full' });
      return;
    }
    case 'complete':
      delivery.actions.complete(repo, { deliveryId: e.no, driverId, earlyReason: e.early });
      return;
    case 'inspect':
      return saveSteps(repo, e.no, driverId, e.flow, true);
    case 'finish':
      saveSteps(repo, e.no, driverId, e.flow, true);
      report.actions.finish(repo, { deliveryId: e.no, driverId, earlyReason: e.flow.early });
      return;
    case 'edit':
      /* 完了後の修正（7日まで・トラブルがないとき）。検品の数も直せる（課題 4-4） */
      saveSteps(repo, e.no, driverId, e.flow, true);
      return;
    case 'park':
      report.actions.reportParking(repo, { driverId, deliveryId: e.no, feeYen: e.fee, receiptFile: e.file });
      return;
    case 'waste': {
      const d = getDelivery(repo, e.no);
      if (!d) return;
      const rep = ensureReport(repo, e.no, driverId);
      const base = baseline(repo, d);
      const cur = new Map(rep.stock.map((x) => [x.productId, { ...x }]));
      for (const w of e.rows) {
        const x = cur.get(w.productId) ?? { productId: w.productId, remaining: base.get(w.productId) ?? 0, disposed: 0 };
        x.disposed += w.qty;
        x.remaining = Math.max(x.remaining, x.disposed);
        cur.set(w.productId, x);
      }
      report.actions.saveStep(repo, { deliveryId: e.no, driverId, step: 'stock', data: [...cur.values()] });
      /* 5ステップの完了・修正で上書きしないよう、登録した廃棄の数を覚えておく（stockRows） */
      const doc = repo.get<FlowDoc>(K.flow, e.no) ?? { id: e.no, ui: {} };
      const waste = { ...(doc.ui.waste ?? {}) };
      for (const w of e.rows) waste[w.productId] = (waste[w.productId] ?? 0) + w.qty;
      repo.put<FlowDoc>(K.flow, e.no, { ...doc, ui: { ...doc.ui, waste } });
      return;
    }
    case 'stock': {
      const { disposedFor } = invRows(repo, e.branchId);
      report.actions.fileStock(repo, { branchId: e.branchId, rows: e.rows.map((x) => ({ ...x, disposed: disposedFor(x.productId, x.actual) })), site: 'driver', accountId: driverId });
      return;
    }
    case 'eta':
      return;
    case 'hist':
      return;
  }
}

/** 未送信の印。obj＝'pt:<受取地点の文書ID>'・'d:<配送No>'・'f:<配送No>'（5ステップの未送信の内容） */
function markUnsent(repo: DocRepo, objs: string[], on: boolean) {
  for (const o of objs) {
    const i = o.indexOf(':');
    const [k, id] = [o.slice(0, i), o.slice(i + 1)];
    if (k === 'f') {
      const doc = repo.get<FlowDoc>(K.flow, id);
      if (doc && !on) repo.put<FlowDoc>(K.flow, id, { id, ui: doc.ui });
      continue;
    }
    const kind = k === 'pt' ? K.pt : K.del;
    const doc = repo.get<Record<string, unknown>>(kind, id);
    if (doc) repo.put(kind, id, { ...doc, unsent: on || undefined });
  }
}

/** 未送信の報告を送る（送れなかったものは理由を返して捨てる） */
function flushOut(repo: DocRepo, me: DriverMe) {
  const items = queueOf(repo, me.id);
  const failed: string[] = [];
  for (const it of items) {
    for (const e of it.effects) {
      try { applyEffect(repo, me, e); } catch (err) { failed.push(`${it.msg}：${errorMessage(err)}`); }
    }
    markUnsent(repo, it.objs, false);
  }
  repo.remove(K.out, me.id);
  return { n: items.length, failed };
}

/** 報告を送る（オフラインのときは driver.outbox にためて「未送信」にする。RV-DRIVER-20261002 D-e） */
function commit(repo: DocRepo, me: DriverMe, offline: boolean | undefined, msg: string, effects: Effect[], objs: string[]) {
  if (offline) {
    const items = [...queueOf(repo, me.id), { msg, effects, objs }];
    repo.put(K.out, me.id, { id: me.id, items });
    markUnsent(repo, objs, true);
    return { msg, unsent: true, queue: items.length };
  }
  /* 前に未送信のものがあれば先に送る（順番を守る） */
  if (queueOf(repo, me.id).length) flushOut(repo, me);
  for (const e of effects) applyEffect(repo, me, e);
  return { msg, unsent: false, queue: 0 };
}

/* ---------- 進み具合を書く ---------- */

function putDel(repo: DocRepo, me: DriverMe, no: string, patch: Partial<DeliveryDoc>) {
  const old = repo.get<DeliveryDoc>(K.del, no) ?? { no, staff: me.id };
  repo.put<DeliveryDoc>(K.del, no, { ...old, ...patch });
}
function putPt(repo: DocRepo, me: DriverMe, p: PointView, patch: Partial<PointDoc>) {
  const id = ptKey(me.id, p.id, day());
  repo.put<PointDoc>(K.pt, id, { ...(repo.get<PointDoc>(K.pt, id) ?? { id }), ...patch });
  return id;
}
/** 画面の印を保存（offline の内容はまだ送っていない 5ステップ） */
function putFlow(repo: DocRepo, no: string, f: Flow, pending?: Flow) {
  const ck = (rows: { id?: string; lid?: string; n: string; ck: boolean }[]) => Object.fromEntries(rows.map((r) => [r.lid ?? r.id ?? r.n, r.ck]));
  const reported = repo.list<ParkingReport>('dm.report.parking').some((x) => x.deliveryId === no);
  const ui: FlowUi = {
    step: f.step, stockDone: f.stockDone, stockAt: f.stockAt, dispAt: f.dispAt, stockCk: ck(f.stock), dispCk: ck(f.disp), park: reported ? undefined : f.park,
    waste: repo.get<FlowDoc>(K.flow, no)?.ui.waste,
  };
  repo.put<FlowDoc>(K.flow, no, { id: no, ui, ...(pending ? { pending } : {}) });
}
function newTrouble(repo: DocRepo, me: DriverMe, target: string, raw: string, note: string, auto: boolean, nos: string[], photos: number, at: string) {
  const id = 'DT' + String(repo.nextSeq('driver.trouble')).padStart(4, '0');
  const t: TroubleDoc = { id, staff: me.id, target, raw, note, at, auto, photos, nos, dm: [] };
  repo.put(K.trb, id, t);
  return t;
}
/** 配送を完了したとき、未解決のトラブルが遅延（交通渋滞・事故）だけなら解決済みにする（元の autoResolveDelay。D-f：消さずに残す） */
function delayResolve(d: DeliveryView, at: string): { effects: Effect[]; msg: string } {
  const open = trOpen(d);
  if (!open.length || !open.every((t) => TYPE_OF[t.raw] === 'delay' || t.raw === '遅延')) return { effects: [], msg: '' };
  return { effects: [{ k: 'resolve', no: d.no, at, why: '配送完了（遅延のみ）で解決' }], msg: '。遅延の報告は「解決済み」にしました' };
}

function findDel(repo: DocRepo, me: DriverMe, no: string) {
  const dd = dayOf(repo, me, day());
  const d = dd.dels.find((x) => x.no === no);
  const v = dd.legs.get(no);
  if (!d || !v) throw new ApiError(`配送 ${no} は担当の配送にありません`, 404);
  return { day: dd, d, v, pt: dd.points.find((p) => p.id === d.pt) };
}
const checkFlow = (f: Flow) => {
  if (!f || !Array.isArray(f.stock) || !Array.isArray(f.disp)) throw new ApiError('陳列の内容が正しくありません', 400);
  if ([...f.stock.flatMap((r) => [r.th, r.dc, r.ac]), ...f.disp.flatMap((r) => [r.pl, r.ac])].some((n) => !Number.isInteger(n) || n < 0 || n > 9999)) throw new ApiError('数量は0以上の整数で入力してください', 400);
  if (f.before.length > 6 || f.after.length > 6) throw new ApiError('写真は6枚までです', 400);
};
const esFinal = (dd: ReturnType<typeof dayOf>) => dd.dels.filter((d) => d.type === 'es' && dd.legs.get(d.no)?.leg.isFinal);

export default defineArea({
  name: 'driver',
  /* 自分の見本データは持たない（共通データを読む） */
  seed: () => ({}),

  queries: {
    /**
     * ログイン（有効なドライバーだけ）。ログインの記録を残すため、共通データの account.signIn を呼ぶ
     * （画面が query として呼ぶので、query だが記録だけ書く）
     */
    login: (repo, a: { id: string; pw?: string }) => {
      /* パスワードを確かめる（台帳 B「ドライバーのログイン」。まだ設定していない見本は空でなければ通す：lib/domain/driverAuth.ts） */
      const dr = repo.get<Driver>('dm.master.drivers', String(a.id ?? '').trim().toUpperCase());
      const r = account.actions.signIn(repo, { site: 'driver', loginId: String(a.id ?? ''), badPassword: !!dr && !passwordOk(dr, String(a.pw ?? '')) });
      const s = staffOf(repo, a.id);
      if (!s || (!r.ok && s.status === '有効')) return { ok: false as const, msg: 'ログインIDまたはパスワードが正しくありません。' };
      if (s.status !== '有効') return { ok: false as const, msg: `このアカウントは利用できません（${s.status}）。所属先にお問い合わせください。` };
      return { ok: true as const, me: s.me };
    },
    /** ログイン中のドライバー（アカウント画面）と未送信の件数。いなくなった・使えなくなったときは me が null */
    session: (repo, a: S) => {
      const s = staffOf(repo, a.staff);
      if (!s || s.status !== '有効') return { staff: a.staff, me: null, queue: 0 };
      return { staff: a.staff, me: s.me, queue: queueOf(repo, s.me.id).length };
    },
    /** DEMO 帯のドライバーの切替（ログインできるドライバー） */
    staffList: (repo) =>
      repo.list<{ id: string }>('dm.master.drivers').map((d) => staffOf(repo, d.id)).filter((s) => s && s.status === '有効')
        .map((s) => ({ id: s!.me.id, name: s!.me.name, org: s!.me.org })),

    /** 今日の受取地点・配送（ホーム・配送一覧・荷物受取・COOL便・ES配送便・トラブル報告） */
    day: (repo, a: S) => {
      const me = meOf(repo, a.staff);
      const { points, dels } = dayOf(repo, me, day());
      return { me, points, dels, unread: newsOf(repo, me.id).some((n) => !n.read), queue: queueOf(repo, me.id).length };
    },
    /** ES配送便の5ステップの内容（共通データの報告。まだなければ初期値） */
    flow: (repo, a: S & { no: string }): Flow => {
      const me = meOf(repo, a.staff);
      const { v } = findDel(repo, me, a.no);
      return flowOf(repo, me.id, v.delivery);
    },
    /** お知らせ（ドライバー向けのお知らせ・自分あての通知） */
    news: (repo, a: S) => newsOf(repo, a.staff),
    /** 廃棄・棚卸し：納品先（ES配送便）と、納品先ごとの棚卸しの理論在庫（棚卸の下書き） */
    stock: (repo, a: S) => {
      const me = meOf(repo, a.staff);
      const dd = dayOf(repo, me, day());
      const sites = esFinal(dd).map((d) => ({ no: d.no, name: d.name }));
      /* 棚卸なしの拠点（課題 2-1）は棚卸しの行を出さない（廃棄登録はできる） */
      const inv = (b: string) => (repo.get<{ noStockCheck?: boolean }>('dm.org.branches', b)?.noStockCheck ? [] : invRows(repo, b).rows);
      return { sites, inv: Object.fromEntries(sites.map((s) => [s.no, inv(dd.legs.get(s.no)!.delivery.branchId)])) as Record<string, InvRow[]> };
    },
  },

  actions: {
    /* パスワード再設定（ログイン前の画面）：ID → 登録メールへ4桁の認証コード（メールは仮）→ コード → 新しいパスワード */
    requestReset: (repo, a: { id: string }) => issueResetCode(repo, { loginId: a.id }),
    verifyReset: (repo, a: { id: string; code: string }) => verifyResetCode(repo, { loginId: a.id, code: a.code }),
    setPassword: (repo, a: { id: string; code: string; password: string }) => resetPassword(repo, { loginId: a.id, code: a.code, password: a.password }),
    /** 荷物の受取を完了（区間を受取済にする。未受取分はトラブル「箱数不足」として自動で報告） */
    receive: (repo, a: S & Off & { pt: string; recv: Record<string, boolean>; ack?: boolean }) => {
      const me = meOf(repo, a.staff);
      const dd = dayOf(repo, me, day());
      const p = dd.points.find((x) => x.id === a.pt);
      if (!p) throw new ApiError('受取地点が見つかりません', 404);
      if (p.status === '受取済') throw new ApiError('この受取地点の荷物は受取済みです', 409);
      const dels = dd.dels.filter((d) => d.pt === p.id);
      const recv: Record<string, boolean> = {};
      for (const d of dels) for (const i of d.inv) if (a.recv?.[recvKey(d.no, i.no)] || p.recv[recvKey(d.no, i.no)]) recv[recvKey(d.no, i.no)] = true;
      const miss = missing(recv, dels);
      if (miss.length && !a.ack) throw new ApiError('未受取分を ESキッチンへ連絡済みにチェックしてください', 400);
      const at = nowStamp();
      const key = putPt(repo, me, p, { status: '受取済', doneAt: atOf(at), round: p.round, recv });
      for (const d of dels) {
        const doc = repo.get<DeliveryDoc>(K.del, d.no);
        if (doc?.extra?.some((i) => i.late)) repo.put(K.del, d.no, { ...doc, extra: doc.extra.map((i) => (recv[recvKey(d.no, i.no)] ? { ...i, late: false } : i)) });
      }
      const effects: Effect[] = [];
      for (const d of dels.filter((x) => x.inv.some((i) => recv[recvKey(x.no, i.no)]))) {
        effects.push({ k: 'pickup', no: d.no, leg: dd.legs.get(d.no)!.leg.id, what: `荷物受取（${p.name}${p.round > 1 ? `・${p.round}回目` : ''}）`, at });
      }
      if (miss.length) {
        const t = newTrouble(repo, me, 'pt:' + p.id, '箱数不足', `未受取 ${miss.length}箱（${miss.join('、')}）`, true, miss, 0, at);
        for (const d of dels.filter((x) => x.inv.some((i) => miss.includes(i.no)))) {
          const m = d.inv.filter((i) => miss.includes(i.no)).map((i) => i.no);
          effects.push({ k: 'trouble', tid: t.id, no: d.no, raw: '箱数不足', note: `未受取 ${m.length}箱（${m.join('、')}）（自動）`, at });
        }
      }
      return commit(repo, me, a.offline, miss.length ? '受取を完了しました。未受取分をトラブル（箱数不足）として運営に報告しました' : '荷物の受取を完了しました', effects, ['pt:' + key]);
    },

    /** 追加の荷物を受け取る（同日・再受取） */
    reReceive: (repo, a: S & { pt: string }) => {
      const me = meOf(repo, a.staff);
      const dd = dayOf(repo, me, day());
      const p = dd.points.find((x) => x.id === a.pt);
      if (!p) throw new ApiError('受取地点が見つかりません', 404);
      if (p.status !== '受取済') throw new ApiError('受取を完了してから使えます', 409);
      const mine = dd.dels.filter((d) => d.pt === p.id);
      const x = mine.find((d) => d.status !== '配送完了') ?? mine[0];
      if (!x) throw new ApiError('この受取地点の配送はありません', 409);
      const doc = repo.get<DeliveryDoc>(K.del, x.no);
      putDel(repo, me, x.no, { extra: [...(doc?.extra ?? []), { no: `${x.no}-9${p.round}`, late: true }] });
      putPt(repo, me, p, { status: '未受取', round: p.round + 1, recv: p.recv, doneAt: p.doneAt });
      return { msg: '追加の荷物を受け取れる状態にしました' };
    },

    /** 到着予定を納品先・運営と共有（共通データに項目がないため driver.deliveryState に持つ） */
    shareEta: (repo, a: S & Off & { no: string; eta: [string, string] }) => {
      const me = meOf(repo, a.staff);
      const err = checkEta(a.eta);
      if (err) throw new ApiError(err, 400);
      const { d } = findDel(repo, me, a.no);
      if (d.status === '配送完了') throw new ApiError('配送完了のあとは変えられません', 409);
      const at = nowStamp();
      putDel(repo, me, d.no, { eta: a.eta, etaAt: hmOf(at) });
      return commit(repo, me, a.offline, `到着予定 ${a.eta.join('〜')} を納品先・運営と共有しました`, [{ k: 'eta', no: d.no, eta: a.eta, at }], []);
    },

    /** COOL便の配送完了（渡せなかった荷物は「一部未配送のまま完了」としてトラブルを自動で報告） */
    completeCool: (repo, a: S & Off & { no: string; ck: Record<string, boolean>; ack?: boolean; early?: string }) => {
      const me = meOf(repo, a.staff);
      const { d, v, pt } = findDel(repo, me, a.no);
      if (d.status === '配送完了') return { msg: '', unsent: false, queue: 0, already: true };
      if (d.type !== 'cool') throw new ApiError('COOL便ではありません', 400);
      if (!v.leg.isFinal || d.later) throw new ApiError('この区間は届け先への配送ではありません', 409);
      if (nrAll(pt, d)) throw new ApiError('荷物を受け取っていません', 409);
      const ck = Object.fromEntries(d.inv.filter((i) => a.ck?.[i.no] && pt?.recv[recvKey(d.no, i.no)]).map((i) => [i.no, true]));
      if (!Object.keys(ck).length) throw new ApiError('渡した荷物をチェックしてください', 400);
      const miss = d.inv.filter((i) => !ck[i.no]).map((i) => i.no);
      if (miss.length && !a.ack) throw new ApiError('ESキッチンへ連絡済みにチェックしてください', 400);
      if (d.early && !a.early?.trim()) throw new ApiError(`納品日（${d.early}）より前です。前に納品する理由を入れてください`, 409);
      const at = nowStamp();
      const effects: Effect[] = [];
      const dr = miss.length ? { effects: [], msg: '' } : delayResolve(d, at);
      effects.push(...dr.effects, { k: 'complete', no: d.no, what: miss.length ? `納品報告（COOL便・未配送 ${miss.length}箱）` : '納品報告（COOL便）', at, early: d.early ? a.early!.trim() : undefined });
      if (miss.length) {
        const note = `未配送 ${miss.length}箱（${miss.join('、')}）`;
        const t = newTrouble(repo, me, 'd:' + d.no, '一部未配送のまま完了', note, true, miss, 0, at);
        effects.push({ k: 'trouble', tid: t.id, no: d.no, raw: '一部未配送のまま完了', note: note + '（自動）', at });
      }
      putDel(repo, me, d.no, { status: '配送完了', doneAt: atOf(at), ck });
      return commit(repo, me, a.offline, (miss.length ? '未配送分をトラブルとして運営に報告しました' : '配送を完了しました') + dr.msg, effects, ['d:' + d.no]);
    },

    /** COOL便の完了後の修正（箱のチェックは共通データにないため driver.deliveryState。運営には履歴で知らせる） */
    saveCoolEdit: (repo, a: S & Off & { no: string; ck: Record<string, boolean> }) => {
      const me = meOf(repo, a.staff);
      const { d, pt } = findDel(repo, me, a.no);
      if (d.status !== '配送完了') throw new ApiError('配送完了のあとに使えます', 409);
      const ck = Object.fromEntries(d.inv.filter((i) => a.ck?.[i.no] && pt?.recv[recvKey(d.no, i.no)]).map((i) => [i.no, true]));
      putDel(repo, me, d.no, { ck });
      return commit(repo, me, a.offline, '修正を保存しました（運営に通知）', [{ k: 'hist', no: d.no, what: `配送完了後に荷物のチェックを修正（${Object.keys(ck).length}/${d.inv.length}箱）`, at: nowStamp() }], ['d:' + d.no]);
    },

    /** ES配送便の途中の内容を保存（ステップを進めたとき。共通データの報告を始めて、写真・在庫を書く） */
    saveFlow: (repo, a: S & { no: string; flow: Flow }) => {
      const me = meOf(repo, a.staff);
      checkFlow(a.flow);
      const { d, v, pt } = findDel(repo, me, a.no);
      if (d.type !== 'es') throw new ApiError('ES配送便ではありません', 400);
      if (nrAll(pt, d)) throw new ApiError('荷物を受け取っていません', 409);
      if (!v.leg.isFinal) throw new ApiError('この区間は届け先への配送ではありません', 409);
      /* 未送信の受取があるときは、送るまで端末に置く */
      const wait = queueOf(repo, me.id).length > 0;
      putFlow(repo, a.no, a.flow, wait ? a.flow : undefined);
      if (!wait && d.status !== '配送完了') saveSteps(repo, a.no, me.id, a.flow, false);
      return { ok: true };
    },

    /** ③ 陳列（検品）の確認（予定と違う・未確認があればトラブル「商品不足・誤配送」を自動で報告） */
    finishDisp: (repo, a: S & Off & { no: string; flow: Flow; ack?: boolean }) => {
      const me = meOf(repo, a.staff);
      checkFlow(a.flow);
      const { d } = findDel(repo, me, a.no);
      const f: Flow = structuredClone(a.flow);
      const at = nowStamp();
      const withDiff = !dispClean(f);
      if (withDiff && !a.ack) throw new ApiError('ESキッチンへ連絡済みにチェックしてください', 400);
      if (!f.disp.some((r) => r.ck)) throw new ApiError('陳列した商品をチェックしてください', 400);
      Object.assign(f, { dispDone: true, dispAt: atOf(at), step: Math.max(f.step, 4) });
      putFlow(repo, a.no, f, a.offline ? f : undefined);
      const effects: Effect[] = [{ k: 'inspect', no: d.no, flow: f, at }];
      let msg = '商品の陳列が完了しました';
      if (withDiff) {
        const un = f.disp.filter((r) => !r.ck).length;
        const note = [dispDiffs(f).join('、'), un ? `未確認 ${un}品目` : ''].filter(Boolean).join('／');
        const t = newTrouble(repo, me, 'd:' + d.no, '商品不足・誤配送', note, true, [], 0, at);
        effects.push({ k: 'trouble', tid: t.id, no: d.no, raw: '商品不足・誤配送', note: `陳列（検品）で予定と差異：${note}（自動）`, at });
        msg = '陳列を完了しました。差異をトラブルとして運営に報告しました';
      }
      return { ...commit(repo, me, a.offline, msg, effects, ['f:' + d.no]), flow: f };
    },

    /** ES配送便の配送完了（⑤ 完了の確認のあと。報告を完了にして配送を納品済にする。二度押しでは二重に報告しない） */
    completeEs: (repo, a: S & Off & { no: string; flow: Flow }) => {
      const me = meOf(repo, a.staff);
      checkFlow(a.flow);
      const { d, v, pt } = findDel(repo, me, a.no);
      if (d.status === '配送完了') return { msg: '', unsent: false, queue: 0, already: true };
      if (d.type !== 'es') throw new ApiError('ES配送便ではありません', 400);
      if (!v.leg.isFinal || d.later) throw new ApiError('この区間は届け先への配送ではありません', 409);
      if (nrAll(pt, d)) throw new ApiError('荷物を受け取っていません', 409);
      const f: Flow = { ...structuredClone(a.flow), step: 6 };
      const need = [!f.before.length && '陳列前の写真', !f.stockDone && '在庫・廃棄', !f.dispDone && '陳列（検品）', !f.after.length && '陳列後の写真'].filter(Boolean);
      if (need.length) throw new ApiError(`まだ入れていないステップがあります：${need.join('・')}`, 400);
      if (f.plan > 0 && f.cash === '') throw new ApiError('実集金額を入れてください（集金できなかったときは 0）', 400);
      /* 納品日より前は確認と理由（課題 4-1） */
      if (d.early && !f.early?.trim()) throw new ApiError(`納品日（${d.early}）より前です。前に納品する理由を入れてください`, 409);
      const at = nowStamp();
      putFlow(repo, a.no, f, a.offline ? f : undefined);
      putDel(repo, me, d.no, { status: '配送完了', doneAt: atOf(at), ck: Object.fromEntries(d.inv.map((i) => [i.no, true])) });
      const dr = delayResolve(d, at);
      const cash = f.plan && f.cash !== '' ? Number(f.cash) : undefined;
      const effects: Effect[] = [...dr.effects, { k: 'finish', no: d.no, flow: f, what: `納品報告（ES配送便${cash != null ? `・集金 ${cash.toLocaleString('ja-JP')}円` : ''}）`, at }];
      return commit(repo, me, a.offline, '配送完了を報告しました' + dr.msg, effects, ['d:' + d.no, 'f:' + d.no]);
    },

    /** 完了後の修正を保存（写真・在庫・検品・集金。完了から7日まで・トラブルがある配送は直せない＝課題 4-4。運営に通知） */
    saveFlowEdit: (repo, a: S & Off & { no: string; flow: Flow }) => {
      const me = meOf(repo, a.staff);
      checkFlow(a.flow);
      const { d } = findDel(repo, me, a.no);
      if (d.status !== '配送完了') throw new ApiError('配送完了のあとに使えます', 409);
      const rep = repo.get<DeliveryReport>('dm.report.deliveryReports', d.no);
      if (rep?.editableUntil && today() > rep.editableUntil) throw new ApiError('完了から7日を過ぎたので直せません', 409);
      if (repo.list<DTrouble>('dm.delivery.troubles').some((t) => t.deliveryId === d.no)) throw new ApiError('トラブルがある配送の報告は直せません（運営に連絡してください）', 409);
      const f: Flow = { ...structuredClone(a.flow), stockDone: true };
      putFlow(repo, a.no, f, a.offline ? f : undefined);
      return commit(repo, me, a.offline, '修正を保存しました（運営に通知）', [{ k: 'edit', no: d.no, flow: f, what: '配送完了後に報告の内容を修正', at: nowStamp() }], ['f:' + d.no]);
    },

    /** 駐車報告（レシート画像・駐車料金の両方が要る）→ 共通データの駐車報告（入力したら確定。納品日から7日まで直せる） */
    savePark: (repo, a: S & Off & { no: string; flow: Flow }) => {
      const me = meOf(repo, a.staff);
      checkFlow(a.flow);
      const { d } = findDel(repo, me, a.no);
      const raw = String(a.flow.park.fee ?? '').trim(), fee = Number(raw);
      if (!raw || !Number.isInteger(fee) || fee < 0 || fee > 999999) throw new ApiError('駐車料金は0以上の数字で入力してください', 400);
      const rc = a.flow.park.rc;
      if (!rc) throw new ApiError('レシートの写真をアップロードしてください', 400);
      const cur = repo.list<ParkingReport>('dm.report.parking').filter((x) => x.deliveryId === d.no && x.driverId === me.id).pop();
      if (cur && cur.feeYen === fee && fileData(repo, cur.receiptFile) === rc) return { msg: '駐車報告を保存しました', unsent: false, queue: 0 };
      const dd = getDelivery(repo, d.no);
      if (dd?.deliveredAt && day() > addDays(dd.deliverOn, 7)) throw new ApiError('納品日から7日を過ぎたため直せません（運営に連絡してください）', 409);
      putFlow(repo, a.no, a.flow);
      return commit(repo, me, a.offline, '駐車報告を保存しました', [{ k: 'park', no: d.no, fee, file: fileName(repo, rc), at: nowStamp() }], []);
    },

    /** トラブル報告（同じ内容の未解決の報告があるときは add で追記。D-b） */
    reportTrouble: (repo, a: S & Off & { target: string; type: string; nos: string[]; note: string; photos: number; add?: boolean }) => {
      const me = meOf(repo, a.staff);
      const dd = dayOf(repo, me, day());
      const isPt = a.target?.startsWith('pt:');
      const id = String(a.target ?? '').slice(isPt ? 3 : 2);
      const o: PointView | DeliveryView | undefined = isPt ? dd.points.find((p) => p.id === id) : dd.dels.find((d) => d.no === id);
      if (!o) throw new ApiError('報告する受取地点・配送を選んでください', 400);
      const dels = isPt ? dd.dels.filter((d) => d.pt === id) : [o as DeliveryView];
      const all = dels.flatMap((d) => d.inv.map((i) => i.no));
      const nos = (a.nos ?? []).filter((n) => all.includes(n));
      const note = String(a.note ?? '');
      const err = checkTrouble({ type: a.type, nos, note }, isPt ? RECV_REASONS : DLV_REASONS);
      if (err) throw new ApiError(err, 400);
      const at = nowStamp();
      const det = [nos.length ? `送り状 ${nos.length}件` : '', note.trim()].filter(Boolean).join('／');
      const dup = trOpen(o).find((t) => t.raw === a.type);
      if (dup && !a.add) throw new ApiError(`「${a.type}」は報告済みです（運営の確認待ち）`, 409);
      if (dup) {
        const text = `追記 ${hmOf(at)}${det ? '：' + det : ''}`;
        const doc = repo.get<TroubleDoc>(K.trb, dup.id) ?? repo.list<TroubleDoc>(K.trb).find((t) => t.dm.includes(dup.id));
        if (doc) repo.put<TroubleDoc>(K.trb, doc.id, { ...doc, note: [doc.note, text].filter(Boolean).join('／'), nos: [...new Set([...doc.nos, ...nos])] });
        /* まだ送っていない報告は、送るときに追記した内容ごと送る */
        const effects: Effect[] = doc && !doc.dm.length ? [] : [{ k: 'append', tid: dup.id, text, at }];
        return commit(repo, me, a.offline, `「${o.name}」の報告済みのトラブルに追記しました`, effects, []);
      }
      const photos = Math.max(0, Math.min(6, Number(a.photos) || 0));
      const t = newTrouble(repo, me, a.target, a.type, det, false, nos, photos, at);
      const hit = isPt ? dels.filter((d) => !nos.length || d.inv.some((i) => nos.includes(i.no))) : dels;
      const effects: Effect[] = hit.map((d) => {
        const m = d.inv.filter((i) => nos.includes(i.no)).map((i) => i.no);
        const n2 = [m.length ? `送り状 ${m.join('、')}` : '', note.trim(), photos ? `写真 ${photos}枚` : ''].filter(Boolean).join('／');
        return { k: 'trouble', tid: t.id, no: d.no, raw: a.type, note: n2, at };
      });
      return commit(repo, me, a.offline, `「${o.name}」のトラブルを運営に報告しました`, effects, []);
    },

    /** 廃棄の登録（ES配送便の納品先ごと）→ その配送の報告の「在庫・廃棄」に足す */
    saveWaste: (repo, a: S & Off & { site: string; rows: WasteRow[] }) => {
      const me = meOf(repo, a.staff);
      const site = esFinal(dayOf(repo, me, day())).find((d) => d.no === a.site);
      if (!site) throw new ApiError('納品先を選択してください', 400);
      if ((a.rows ?? []).some((r) => !Number.isInteger(r.qty) || r.qty < 0 || r.qty > 9999)) throw new ApiError('廃棄数は0以上の整数で入力してください', 400);
      const products = repo.list<Product>('dm.master.products');
      const rows = (a.rows ?? []).filter((r) => r.qty > 0).map((r) => ({ ...r, productId: products.find((p) => p.name === r.n)?.id ?? '' })).filter((r) => r.productId);
      const n = rows.reduce((x, r) => x + r.qty, 0);
      if (!n) throw new ApiError('廃棄する商品の数を入れてください', 400);
      const an = rows.filter((r) => r.reason === '代替品の回収（不良品）').reduce((x, r) => x + r.qty, 0);
      const effects: Effect[] = [{ k: 'waste', no: site.no, rows: rows.map((r) => ({ productId: r.productId, qty: r.qty })), at: nowStamp() }];
      return commit(repo, me, a.offline, `廃棄 ${n}点を登録しました（在庫に反映${an ? `・うち代替品の回収 ${an}点は管理ロスにしない` : ''}）`, effects, []);
    },

    /** 棚卸しの送信 → 共通データの棚卸の申告（この締め。運営が確認する） */
    sendInventory: (repo, a: S & Off & { site: string; rows: InvRow[] }) => {
      const me = meOf(repo, a.staff);
      const dd = dayOf(repo, me, day());
      const site = esFinal(dd).find((d) => d.no === a.site);
      if (!site) throw new ApiError('納品先を選択してください', 400);
      const branchId = dd.legs.get(site.no)!.delivery.branchId;
      if (repo.get<{ noStockCheck?: boolean }>('dm.org.branches', branchId)?.noStockCheck) throw new ApiError('この納品先は棚卸なしの拠点です（棚卸しはいりません）', 409);
      const cur = invRows(repo, branchId).rows;
      if (!cur.length) throw new ApiError('この締めで点検する商品がありません', 409);
      const rows = cur.map((r) => ({ ...r, ac: a.rows?.find((x) => x.id === r.id || x.n === r.n)?.ac ?? r.ac }));
      if (rows.some((r) => !Number.isInteger(r.ac) || r.ac < 0 || r.ac > 9999)) throw new ApiError('実在庫は0以上の整数で入力してください', 400);
      if (rows.some((r) => r.ac > r.th)) throw new ApiError('実在庫が理論在庫より多い商品があります（届けた数・捨てた数を確かめてください）', 400);
      const n = rows.filter((r) => r.ac !== r.th).length;
      const effects: Effect[] = [{ k: 'stock', branchId, rows: rows.map((r) => ({ productId: r.id, actual: r.ac })), at: nowStamp() }];
      return commit(repo, me, a.offline, n ? `棚卸しを送信しました（差異 ${n}件。運営が確認します）` : '棚卸しを送信しました（差異なし）', effects, []);
    },

    /** お知らせを既読にする（i＝一覧の順番。通知は共通データの既読） */
    readNews: (repo, a: S & { i: number }) => {
      const n = newsOf(repo, a.staff)[a.i];
      if (!n) throw new ApiError('お知らせが見つかりません', 404);
      const [k, id] = [n.key.slice(0, 1), n.key.slice(2)];
      if (k === 'n') notice.actions.markRead(repo, { ids: [id], accountId: a.staff });
      else {
        const ids = repo.get<{ ids: string[] }>(K.news, a.staff)?.ids ?? [];
        if (!ids.includes(id)) repo.put(K.news, a.staff, { id: a.staff, ids: [...ids, id] });
      }
      return { ok: true };
    },

    /** 未送信の報告を送る（電波が戻った・再送する） */
    flush: (repo, a: S) => flushOut(repo, meOf(repo, a.staff)),
  },
});
