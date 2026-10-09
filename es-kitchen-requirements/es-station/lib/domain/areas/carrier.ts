import { ApiError } from '@/lib/api/errors';
import { defineArea, toDocs, type DocRepo } from '@/lib/ops/core/area';
import { addDays, nowStamp, today } from '@/lib/supplier/dates';
import { notify } from '../notify';
import { COOLERS, QUOTES } from '../seed/carrier';
import { deliveryBranchName } from '../snapshot';
import { carrierFeeFor } from '../carrierFee';
import { log } from './account';
import type { Account, AuditLog, Branch, Carrier, Cooler, Delivery, DeliveryReport, Driver, Leg, ParkingReport, Quote } from '../types';

/*
 * 委託配送先（area: carrier）。kind：dm.carrier.coolers／dm.carrier.quotes
 *   保冷バッグの台帳、見積（運営が依頼 → 委託配送先が回答 → 運営が決める）、
 *   月の集計（集金・駐車場代・件数＝CSV の元）、ドライバーが決まっていない区間の警告（D-3・D-1）
 */

/** 保冷バッグ台帳の登録・編集の入力（運営。AW_COOL_002）。日付は YYYY/MM/DD */
export type CoolerInput = { kind: Cooler['kind']; qty: number; carrierId: string; driverId?: string; issuedOn: string; status?: Cooler['status']; memo?: string; returnedOn?: string; returnedQty?: number | string | null; by?: string };

/** 入力の確かめ（メッセージは _共通_メッセージ E01・E04・E12・E14・E300）。直した値を返す */
function checkCooler(r: DocRepo, a: CoolerInput, cur?: Cooler): Omit<Cooler, 'id'> {
  const bad = (m: string): never => { throw new ApiError(m, 400); };
  if (a.kind !== '保冷バッグ' && a.kind !== '保冷剤') bad('種類は必須項目です。');
  if (a.qty === undefined || a.qty === null || String(a.qty).trim() === '') bad('数は必須項目です。');
  const q = Number(String(a.qty).trim());
  if (!Number.isInteger(q)) bad('数は数値で入力してください。');
  if (q < 1 || q > 9999) bad('数は1〜9999の範囲で入力してください。');
  if (!a.carrierId) bad('委託配送先は必須項目です。');
  const c = r.get<Carrier>('dm.master.carriers', a.carrierId);
  if (!c || c.kind === '自社') return bad('委託配送先が見つかりません。');
  if (c.status === '無効' && cur?.carrierId !== a.carrierId) bad('無効の委託配送先は選べません。');
  if (a.driverId) {
    const d = r.get<Driver>('dm.master.drivers', a.driverId);
    if (!d || d.carrierId !== a.carrierId) bad('渡した配送スタッフは、選んだ委託配送先のスタッフから選んでください。');
  }
  if (!a.issuedOn) bad('渡した日は必須項目です。');
  const m = /^(\d{4})[/-](\d{2})[/-](\d{2})$/.exec(a.issuedOn);
  if (!m) return bad('この日は選べません。');
  const day = `${m[1]}/${m[2]}/${m[3]}`;
  if (day > today()) bad('この日は選べません。');
  const status = a.status ?? cur?.status ?? '貸与中';
  if (!['貸与中', '紛失', '廃棄', '返却'].includes(status)) bad('状態は必須項目です。');
  const memo = (a.memo ?? '').trim();
  if (memo.length > 500) bad('500文字以内で入力してください。');
  /* 返却日・返却数（任意）：返却日は渡した日より前にしない、返却数は 0〜数 */
  let returnedOn: string | undefined;
  if (a.returnedOn) {
    const rm = /^(\d{4})[/-](\d{2})[/-](\d{2})$/.exec(a.returnedOn);
    if (!rm) return bad('この日は選べません。');
    returnedOn = `${rm[1]}/${rm[2]}/${rm[3]}`;
    if (returnedOn < day) bad('返却日は渡した日以降の日付を入力してください。');
  }
  let returnedQty: number | undefined;
  if (a.returnedQty !== undefined && a.returnedQty !== null && String(a.returnedQty).trim() !== '') {
    returnedQty = Number(String(a.returnedQty).trim());
    if (!Number.isInteger(returnedQty)) bad('返却数は数値で入力してください。');
    if (returnedQty < 0 || returnedQty > q) bad(`返却数は0〜${q}の範囲で入力してください。`);
  }
  /* 都道府県は委託配送先の対応エリアの都道府県、なければこの会社の前の記録のもの */
  const pref = c.areas.find((x) => /[都道府県]$/.test(x)) ?? r.list<Cooler>('dm.carrier.coolers').find((x) => x.carrierId === a.carrierId)?.pref ?? cur?.pref ?? '';
  return { kind: a.kind, qty: q, carrierId: a.carrierId, pref, driverId: a.driverId ?? '', issuedOn: day, status, memo, ...(returnedOn ? { returnedOn } : {}), ...(returnedQty !== undefined ? { returnedQty } : {}) };
}

/** 保冷バッグ台帳の変更履歴（操作の記録 dm.account.audit の target＝coolers:CB-####） */
const coolerTarget = (id: string) => `coolers:${id}`;
const COOLER_LABEL: Record<string, string> = { kind: '種類', qty: '数', carrierId: '委託配送先', driverId: '渡した配送スタッフ', issuedOn: '渡した日', status: '状態', memo: 'メモ', returnedOn: '返却日', returnedQty: '返却数' };
/** 変わった項目（「数：2 → 3」のように） */
function coolerDiff(prev: Cooler, next: Cooler) {
  return Object.keys(COOLER_LABEL).filter((k) => String(prev[k as keyof Cooler] ?? '') !== String(next[k as keyof Cooler] ?? ''))
    .map((k) => `${COOLER_LABEL[k]}：${String(prev[k as keyof Cooler] ?? '') || '—'} → ${String(next[k as keyof Cooler] ?? '') || '—'}`).join('／');
}

const quotes = (r: DocRepo) => r.list<Quote>('dm.carrier.quotes');

export default defineArea({
  name: 'carrier',
  seed: () => ({ 'dm.carrier.coolers': toDocs(COOLERS), 'dm.carrier.quotes': toDocs(QUOTES) }),
  queries: {
    coolers: (r, a?: { carrierId?: string; status?: Cooler['status'] }) =>
      r.list<Cooler>('dm.carrier.coolers').filter((x) => (!a?.carrierId || x.carrierId === a.carrierId) && (!a?.status || x.status === a.status)),
    /** 運営：保冷バッグ台帳の詳細（AW_COOL_003）。委託配送先・配送スタッフの名前と変更履歴（新しい順）。ないときは null */
    cooler: (r, { id }: { id: string }) => {
      const c = r.get<Cooler>('dm.carrier.coolers', id);
      if (!c) return null;
      const history = r.list<AuditLog>('dm.account.audit').filter((x) => x.target === coolerTarget(id))
        .map((x) => ({ id: x.id, at: x.at, action: x.action, detail: x.detail, by: r.get<Account>('dm.account.accounts', x.accountId)?.name ?? x.accountId }))
        .sort((x, y) => y.at.localeCompare(x.at) || y.id.localeCompare(x.id));
      return {
        cooler: c, carrierName: r.get<Carrier>('dm.master.carriers', c.carrierId)?.name ?? c.carrierId,
        driverName: c.driverId ? r.get<Driver>('dm.master.drivers', c.driverId)?.name ?? '' : '', history,
      };
    },
    /** 見積：運営は全部、委託配送先は自社に来たものだけ（ほかの会社の回答は見せない） */
    quotes(r, a?: { carrierId?: string }) {
      return quotes(r).filter((q) => !a?.carrierId || q.responses.some((x) => x.carrierId === a.carrierId))
        .map((q) => (a?.carrierId ? { ...q, responses: q.responses.filter((x) => x.carrierId === a.carrierId), decidedCarrierId: q.decidedCarrierId === a.carrierId ? a.carrierId : q.decidedCarrierId ? '（ほかの会社）' : '' } : q));
    },
    /**
     * 月の集計（CSV の元）：自社のドライバーが届けた配送ごとの 件数・支払額・集金・駐車場代。month＝YYYY-MM（お届け日の月）。
     * 支払額は納品したときの写し（区間の feeYen）。写しのない古いデータだけ、いまの配送会社の金額（影響一覧 A4）
     */
    monthly(r, { carrierId, month }: { carrierId: string; month: string }) {
      const c = r.get<Carrier>('dm.master.carriers', carrierId);
      if (!c) throw new ApiError('委託配送会社が見つかりません', 404);
      const legs = r.list<Leg>('dm.delivery.legs').filter((l) => l.carrierId === carrierId && l.isFinal);
      const rows = legs.map((l) => ({ l, d: r.get<Delivery>('dm.delivery.deliveries', l.deliveryId)! }))
        .filter(({ d }) => d && d.deliverOn.slice(0, 7).replace('/', '-') === month && ['納品済', '一部納品済'].includes(d.status))
        .map(({ l, d }) => {
          const rep = r.get<DeliveryReport>('dm.report.deliveryReports', d.id);
          const parking = r.list<ParkingReport>('dm.report.parking').filter((p) => p.deliveryId === d.id).reduce((s, p) => s + p.feeYen, 0);
          return {
            date: d.deliverOn, deliveryId: d.id, branch: deliveryBranchName(r, d) || d.branchId,
            driverId: l.driverId, driver: r.get<Driver>('dm.master.drivers', l.driverId)?.name ?? '', qty: d.deliveredQty ?? 0,
            feeYen: l.feeYen ?? carrierFeeFor(c, r.get<Branch>('dm.org.branches', d.branchId)?.address?.pref), cashYen: rep?.cash?.collectedYen && rep.cash.collectedYen > 0 ? rep.cash.collectedYen : 0, parkingYen: parking,
          };
        }).sort((x, y) => x.date.localeCompare(y.date));
      return { carrier: c, month, rows, total: { count: rows.length, feeYen: rows.reduce((s, x) => s + x.feeYen, 0), cashYen: rows.reduce((s, x) => s + x.cashYen, 0), parkingYen: rows.reduce((s, x) => s + x.parkingYen, 0) } };
    },
    /** ドライバーが決まっていない自社の区間（お届け日まで3日以内＝警告。D-3・D-1 にメール） */
    alerts(r, a: { carrierId: string; date?: string }) {
      const day = a.date ?? today();
      return r.list<Leg>('dm.delivery.legs').filter((l) => l.carrierId === a.carrierId && l.assignScope === 'carrier' && !l.driverId)
        .map((l) => ({ leg: l, delivery: r.get<Delivery>('dm.delivery.deliveries', l.deliveryId)! }))
        .filter(({ delivery: d }) => d && !['取消', '中止', '納品済'].includes(d.status) && d.deliverOn >= day)
        .map((x) => ({ ...x, level: x.delivery.deliverOn <= addDays(day, 1) ? 'D-1' : x.delivery.deliverOn <= addDays(day, 3) ? 'D-3' : '' }));
    },
  },
  actions: {
    /** 委託配送先・運営：保冷バッグの状態（紛失・廃棄・返却） */
    setCooler(r, a: { id: string; status: Cooler['status']; memo: string; carrierId?: string; by?: string }) {
      const x = r.get<Cooler>('dm.carrier.coolers', a.id);
      if (!x) throw new ApiError('台帳が見つかりません', 404);
      if (a.carrierId && x.carrierId !== a.carrierId) throw new ApiError('ほかの会社の台帳です', 403);
      const next = { ...x, status: a.status, memo: a.memo };
      r.put('dm.carrier.coolers', a.id, next);
      const diff = coolerDiff(x, next);
      if (diff) log(r, a.by ?? a.carrierId ?? '', '状態の変更', coolerTarget(a.id), diff);
      return next;
    },
    /** 運営：貸与の記録の登録（状態は貸与中で始まる）。ID＝CB-#### */
    createCooler(r, a: CoolerInput) {
      const v = checkCooler(r, { ...a, status: '貸与中' });
      const n = Math.max(0, ...r.list<Cooler>('dm.carrier.coolers').map((x) => Number(x.id.slice(3)) || 0)) + 1;
      const next: Cooler = { id: `CB-${String(n).padStart(4, '0')}`, ...v };
      r.put('dm.carrier.coolers', next.id, next);
      log(r, a.by ?? '', '登録', coolerTarget(next.id), `${next.kind} ${next.qty}・${r.get<Carrier>('dm.master.carriers', next.carrierId)?.name ?? next.carrierId}・渡した日 ${next.issuedOn}`);
      return next;
    },
    /** 運営：貸与の記録の編集 */
    updateCooler(r, a: CoolerInput & { id: string }) {
      const x = r.get<Cooler>('dm.carrier.coolers', a.id);
      if (!x) throw new ApiError('台帳が見つかりません', 404);
      const next: Cooler = { id: a.id, ...checkCooler(r, a, x) };
      r.put('dm.carrier.coolers', a.id, next);
      const diff = coolerDiff(x, next);
      if (diff) log(r, a.by ?? '', '編集', coolerTarget(a.id), diff);
      return next;
    },
    /** 運営：見積の依頼 */
    requestQuote(r, a: Omit<Quote, 'id' | 'requestedAt' | 'responses' | 'status' | 'decidedCarrierId'> & { carrierIds: string[] }) {
      if (!a.carrierIds.length) throw new ApiError('依頼する委託配送会社を選んでください', 400);
      const md = today().slice(5).replace('/', '');
      const n = quotes(r).filter((q) => q.id.startsWith(`QT-${today().slice(0, 4)}-${md}-`)).length + 1;
      const id = `QT-${today().slice(0, 4)}-${md}-${String(n).padStart(3, '0')}`;
      const { carrierIds, ...rest } = a;
      const q: Quote = { ...rest, id, requestedAt: nowStamp(), status: '依頼中', decidedCarrierId: '',
        responses: carrierIds.map((carrierId) => ({ carrierId, status: '回答待ち', feeYen: 0, weekdays: '', startCycle: '', note: '', answeredAt: '' })) };
      r.put('dm.carrier.quotes', id, q);
      for (const c of carrierIds) notify(r, { to: { site: 'carrier', accountId: c, role: '' }, templateId: 'quote_request', title: `見積のお願い（${id}）`, body: `${a.branchName} の配送の見積をお願いします。回答期限：${a.answerBy}`, link: { type: 'quote', id } });
      return q;
    },
    /** 委託配送先：見積の回答・辞退 */
    answerQuote(r, a: { id: string; carrierId: string; decline?: boolean; feeYen?: number; weekdays?: string; startCycle?: string; note?: string }) {
      const q = quotes(r).find((x) => x.id === a.id);
      const row = q?.responses.find((x) => x.carrierId === a.carrierId);
      if (!q || !row) throw new ApiError('この見積は自社に来ていません', 403);
      if (q.status !== '依頼中') throw new ApiError('この見積はもう決まっています', 409);
      if (!a.decline && !((a.feeYen ?? 0) > 0 && a.weekdays)) throw new ApiError('金額と対応できる曜日を入れてください', 400);
      const next: Quote = { ...q, responses: q.responses.map((x) => (x.carrierId === a.carrierId
        ? { ...x, status: a.decline ? '辞退' : '回答済', feeYen: a.decline ? 0 : a.feeYen!, weekdays: a.weekdays ?? '', startCycle: a.startCycle ?? '', note: a.note ?? '', answeredAt: nowStamp() } : x)) };
      r.put('dm.carrier.quotes', q.id, next);
      notify(r, { to: { site: 'ops', accountId: q.requestedBy, role: '' }, templateId: 'quote_request', title: `見積の${a.decline ? '辞退' : '回答'}（${q.id}）`, body: `${r.get<Carrier>('dm.master.carriers', a.carrierId)?.name}：${a.decline ? '辞退' : `${a.feeYen}円／件`}`, link: { type: 'quote', id: q.id } });
      return next;
    },
    /** 運営：見積の決定（回答済みの会社から） */
    decideQuote(r, a: { id: string; carrierId: string }) {
      const q = quotes(r).find((x) => x.id === a.id);
      if (!q || q.status !== '依頼中') throw new ApiError('決められる見積がありません', 409);
      if (q.responses.find((x) => x.carrierId === a.carrierId)?.status !== '回答済') throw new ApiError('回答済みの会社から選んでください', 400);
      const next: Quote = { ...q, status: '決定', decidedCarrierId: a.carrierId };
      r.put('dm.carrier.quotes', q.id, next);
      return next;
    },
  },
});
