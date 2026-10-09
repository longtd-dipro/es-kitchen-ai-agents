import { ApiError } from '@/lib/api/errors';
import { addDays, nowStamp } from '@/lib/supplier/dates';
import { defineArea, toDocs, type DocRepo } from '../core/area';
import domainCarrier from '@/lib/domain/areas/carrier';
import domainDelivery from '@/lib/domain/areas/delivery';
import { orderDeadlineWarnings, unfitCycles } from '@/lib/domain/move';
import { deliveryRequestCheck } from '@/lib/domain/mails';
import type { ChangeRequest as DCr, Cycle, Delivery, Driver } from '@/lib/domain/types';
import { DUP_KINDS, REVIEW_GROUPS, TROUBLE_KINDS } from '../delivery/constants';
import {
  checkCancel, checkCrProcess, checkCycleSettings, checkDeliveryEdit, checkDuplicate, checkMemo, checkQuoteForm, type QuoteForm, checkTroubleReport, checkTroubleResolve,
  filterList, filterReviews, isValidDate, type Errors, type ListFilter, type ReviewFilter,
} from '../delivery/logic';
import {
  altDate, consignees, crAltDates, crProcess, crView, ctxOf, cycleImpact, cycleSettings, dateAlt, dayView, deliveryRecord, esInvoices, holidaysFrom, hubs, inquiries, NG_TABS,
  judgeOf, listOpts, listRows, matShipments, monthView, quoteTemp, RESOLUTION, reviewItems, scheduleCtx, shipOrders, thomasCsv, TROUBLE_TYPE, weekView, type ReviewState, type ScheduleFilter,
} from '../delivery/fromDomain';
import { importLogs } from '../delivery/seed';
import type { CycleSettings, DeliveryDetail, ImportLog } from '../delivery/types';

/*
 * 配送管理（スケジュール・出荷・配送管理・要確認・変更申請・出荷指示・配送サイクル設定・配送問い合わせ・資材の集計）の領域。
 *
 * データは共通データ（lib/domain・dm.*）：サイクル・祝日・配送・明細・区間・送り状・トラブル・お届け日の変更・資材の注文（dm.delivery）、
 *   倉庫・委託配送会社・ドライバー・商品（dm.master）、拠点・子契約（dm.org）、見積（dm.carrier）。画面の形は lib/ops/delivery/fromDomain.ts で作る。
 * 書き換えは共通データの action（decideDateChange・reportTrouble・resolveTrouble・assignDriver・cancelDelivery…）を呼ぶ（通知もそこで出る）。
 * 共通データにないので運営の kind に持つもの：
 *   出荷指示の送信の記録（delivery.shipOrderSends。出荷指示そのものは配送から毎回作る）、CSV の取込の記録（delivery.imports）、
 *   要確認の対応の状態（delivery.reviewStates。要確認そのものは共通データから毎回見つける）。出荷データの移動の記録は共通データ（dm.delivery.moves）
 */

const K = { imp: 'delivery.imports', sends: 'delivery.shipOrderSends', reviewState: 'delivery.reviewStates', move: 'delivery.moves', cfg: 'delivery.cycleConfig' } as const;
/** 運営の操作のアカウントの既定（ログインのない mock のときだけ）。サーバーは lib/server/access.ts の gate がログイン中のアカウントを args.by に入れる */
const OPS = 'Ad00001';
type By = { by?: string };
const actor = (a: unknown): string => { const b = (a as By | null | undefined)?.by; return typeof b === 'string' && b ? b : OPS; };

const fail = (errors: Errors) => { if (Object.keys(errors).length) throw new ApiError(Object.values(errors)[0], 400); };
const stamp = () => nowStamp().slice(5);
const slash = (d: string) => d.replace(/-/g, '/');

const states = (repo: DocRepo) => new Map(repo.list<ReviewState>(K.reviewState).map((x) => [x.id, x]));
const reviews = (repo: DocRepo) => reviewItems(ctxOf(repo), states(repo));
const openReviews = (repo: DocRepo) => reviews(repo).filter((r) => r.state === '未対応');
const sends = (repo: DocRepo) => new Map(repo.list<{ id: string; at: string }>(K.sends).map((x) => [x.id, x.at]));
const openCrs = (repo: DocRepo) => repo.list<DCr>('dm.delivery.changeRequests').filter((c) => ['申請中', '別の日のご提案'].includes(c.status));

function deliveryOf(repo: DocRepo, id: string) {
  const d = repo.get<Delivery>('dm.delivery.deliveries', id);
  if (!d) throw new ApiError(`配送データ ${id} が見つかりません`, 404);
  return d;
}
/** 変更申請（id がなければ、いちばん古い処理待ち＝画面が id を渡さないとき） */
function crOf(repo: DocRepo, id?: string) {
  const c = id ? repo.get<DCr>('dm.delivery.changeRequests', id) : openCrs(repo).sort((a, b) => a.requestedAt.localeCompare(b.requestedAt))[0];
  if (!c) throw new ApiError('変更申請が見つかりません', 404);
  return c;
}
/** 時間帯の文字（10:00〜12:00・13:00〜15:00）→ 受取の時間帯 */
const parseWindows = (s: string) => s.split(/[・,、]/).map((x) => x.trim().match(/^(\d{1,2}:\d{2})\s*[〜~-]\s*(\d{1,2}:\d{2})$/)).filter(Boolean).map((m) => ({ from: m![1], to: m![2] }));

export default defineArea({
  name: 'delivery',
  /* 共通データにない CSV の取込の記録だけ見本を持つ */
  seed: () => ({ [K.imp]: toDocs(importLogs()) }),

  queries: {
    /** メニューの「要確認」のバッジ（未対応の件数） */
    navBadge: (repo) => {
      const n = openReviews(repo).length;
      return { count: n, tip: `要確認（未対応 ${n}件）` };
    },
    /** スケジュールの見出しの件数（要確認・変更申請） */
    headCounts: (repo) => ({ review: openReviews(repo).length, cr: openCrs(repo).length }),
    /** 月表示の「要確認」パネル（区分ごとの件数） */
    reviewSummary: (repo) => {
      const open = openReviews(repo);
      return { total: open.length, groups: REVIEW_GROUPS.map((g) => ({ title: g.title, rows: g.rows.map((r) => ({ label: r.label, kinds: r.kinds, count: open.filter((x) => r.kinds.includes(x.kind)).length })) })) };
    },
    /** 月（YYYY-MM）・週（その週の月曜 YYYY-MM-DD）・日（出荷日 YYYY-MM-DD） */
    scheduleMonth: (repo, a: { id: string; f?: ScheduleFilter }) => monthView(scheduleCtx(ctxOf(repo), a.f), a.id),
    scheduleWeek: (repo, a: { id: string; f?: ScheduleFilter }) => weekView(scheduleCtx(ctxOf(repo), a.f), a.id),
    scheduleDay: (repo, a: { id: string; f?: ScheduleFilter }) => dayView(scheduleCtx(ctxOf(repo), a.f), a.id),

    reviewList: (repo, f: ReviewFilter) => {
      const all = reviews(repo);
      return { rows: filterReviews(all, f ?? {}), all: all.length };
    },
    review: (repo, a: { id: string }) => reviews(repo).find((r) => r.id === a.id) ?? null,

    list: (repo, f: ListFilter) => filterList(listRows(ctxOf(repo)), f ?? {}),
    /** 出荷・配送管理の選択肢（倉庫・委託配送会社・中継倉庫・配送スタッフ・コース・温度帯は配送のデータから） */
    listOpts: (repo) => listOpts(ctxOf(repo)),
    delivery: (repo, a: { id: string }): DeliveryDetail | null => {
      const c = ctxOf(repo), d = c.byId.get(a.id);
      return d ? { ...deliveryRecord(c, d), isSample: false } : null;
    },

    changeRequests: (repo, f: { q?: string; judge?: string; svc?: string }) => {
      const c = ctxOf(repo), q = (f?.q ?? '').trim();
      return c.crs.map((x) => ({ x, v: crView(c, x) })).filter(({ x, v }) => v.state === '未処理'
        && (!q || [v.id, v.site, x.branchId, x.deliveryId, c.byId.get(x.deliveryId)?.contractId].join(' ').includes(q)) && (!f?.judge || v.judge === f.judge) && (!f?.svc || v.svc === f.svc))
        .map(({ v }) => v);
    },
    /** 変更申請の確認の候補（id がなければいちばん古い処理待ち） */
    crProcess: (repo, a?: { id?: string }) => {
      const x = openCrs(repo).length || a?.id ? crOf(repo, a?.id) : null;
      return x ? crProcess(ctxOf(repo), x) : { want: [], alt: [] };
    },
    /** 日付の変更の候補（締切後・同じサイクルの同じ半分）。id がないときは空 */
    dateAlt: (repo, a?: { id?: string }) => {
      const c = ctxOf(repo), d = a?.id ? c.byId.get(a.id) : undefined;
      return d ? dateAlt(c, d) : [];
    },

    shipOrders: (repo) => {
      const c = ctxOf(repo), imp = repo.list<ImportLog>(K.imp);
      return {
        orders: shipOrders(c, sends(repo)),
        /* 出荷指示 CSV（THOMAS）の中身：配送の明細から作る（同梱資材・出荷時の特殊指示つき・2026/10/03） */
        thomasCsv: thomasCsv(c),
        invoices: esInvoices(c),
        // 新しく取り込んだもの（IMX…）を上に
        imports: [...imp.filter((x) => x.id.startsWith('IMX')).reverse(), ...imp.filter((x) => !x.id.startsWith('IMX'))],
      };
    },

    cycleSettings: (repo) => cycleSettings(ctxOf(repo)),
    /** 配送サイクル設定の変更履歴（新しい順・共通データ dm.delivery.cycleSettingsLog） */
    cycleHistory: (repo) => domainDelivery.queries.cycleSettingsLog(repo),
    /** 配送サイクル設定を保存したときの影響（保存の確認。共通データの配送から数える） */
    cycleImpact: (repo, a: { settings: CycleSettings }) => cycleImpact(ctxOf(repo), a.settings),
    /** 移動の確認（選んだ配送・移動先のお届け日 'YYYY-MM-DD'） */
    movePlan: (repo, a: { ids: string[]; to: string; reason?: string; trouble?: boolean; troubleId?: string }) => domainDelivery.queries.movePlan(repo, { ...a, to: slash(a.to ?? '') }),
    /** 移動先の候補（前後のサイクルの28枠） */
    moveCalendar: (repo, a: { ids: string[]; trouble?: boolean }) => domainDelivery.queries.moveCalendar(repo, a),
    /** 移動の履歴 */
    moves: (repo, a?: { deliveryId?: string }) => domainDelivery.queries.moves(repo, a),

    consignees: (repo) => consignees(ctxOf(repo)),
    hubs: (repo) => hubs(ctxOf(repo)),
    inquiries: (repo) => inquiries(ctxOf(repo)),
    matShipments: (repo) => matShipments(ctxOf(repo)),
  },

  actions: {
    /** 要確認を「対応済」「対象外」にする（要確認は共通データから毎回見つけるので、状態だけ持つ） */
    resolveReview: (repo, a: { id: string; state: '対応済' | '対象外'; memo?: string }) => {
      const r = reviews(repo).find((x) => x.id === a.id);
      if (!r) throw new ApiError('要確認が見つかりません', 404);
      if (r.state !== '未対応') throw new ApiError('この要確認はすでに閉じています', 409);
      repo.put<ReviewState>(K.reviewState, r.id, { id: r.id, state: a.state, memo: a.memo, doneBy: '運営 ・ ' + stamp() });
      return { ok: true };
    },

    /** 送り状番号の登録・訂正（路線便。共通データの delivery.setTracking。ヤマトは12桁の数字） */
    setTracking: (repo, a: { deliveryId: string; trackingNo: string; id?: string }) => {
      const t = domainDelivery.actions.setTracking(repo, { ...a, by: '運営' });
      return { ok: true, msg: a.id ? `送り状番号を ${t.trackingNo} に直しました` : `送り状番号 ${t.trackingNo} を登録しました` };
    },
    /** 送り状番号を無効にする（誤って入れた番号） */
    voidTracking: (repo, a: { id: string }) => (domainDelivery.actions.voidTracking(repo, { id: a.id, by: '運営' }), { ok: true, msg: '送り状番号を無効にしました' }),

    /** 配送データの編集（この配送だけ：時間帯・配送スタッフ・日付） */
    saveDelivery: (repo, a: { id: string; time: string; carrier2: string; staff: string; addr: string; reason: string; alt?: string }) => {
      fail(checkDeliveryEdit(a));
      const c = ctxOf(repo), d = deliveryOf(repo, a.id), rec = deliveryRecord(c, d);
      if (!rec.canEdit) throw new ApiError('この配送データは編集できません', 409);
      /* 配送会社②：最後の区間の運送会社を変える（出荷指示のあとでも可：版を上げて再送・配送_08 §15-13）。表示名の「（引き取り）」は外して照合 */
      let carrier2Id: string | undefined;
      if (a.carrier2 !== rec.carrier2) {
        const nm = a.carrier2.replace(/（引き取り）$/, '');
        const ca = [...c.carriers.values()].find((x) => x.name === nm || (nm === '自社便' && x.kind === '自社'));
        if (!ca) throw new ApiError('配送会社を選んでください', 400);
        carrier2Id = ca.id;
      }
      /* 納品先の住所：「都道府県＋市区町村＋番地 建物」の文字から分けて、この配送だけ変える（送り状は無効にして取り直し） */
      let address: { pref: string; city: string; addr1: string; addr2: string } | undefined;
      if (a.addr !== rec.addr) {
        const t = a.addr.trim().replace(/\s+/g, ' ');
        const pref = t.match(/^(北海道|東京都|大阪府|京都府|.{2,3}県)/)?.[1];
        if (!pref) throw new ApiError('納品先の住所は 都道府県から入力してください', 400);
        const rest = t.slice(pref.length);
        const city = rest.match(/^(.+?郡.+?[町村]|.+?市.+?区|.+?[市区町村])/)?.[1];
        if (!city) throw new ApiError('納品先の住所は 市区町村まで入力してください', 400);
        const [addr1, ...r2] = rest.slice(city.length).trim().split(' ');
        address = { pref, city, addr1: addr1 ?? '', addr2: r2.join(' ') };
      }
      const notes: string[] = [];
      /* 配送スタッフ：最後の区間（委託・自社）に割り当てる */
      if (a.staff !== rec.staff) {
        const leg = c.legs.filter((l) => l.deliveryId === d.id && l.regime !== 'parcel_carrier').sort((x, y) => y.legNo - x.legNo)[0];
        if (!leg) throw new ApiError('運送会社の区間には配送スタッフを割り当てません', 400);
        const dr = [...c.drivers.values()].find((x: Driver) => x.name === a.staff && x.carrierId === leg.carrierId);
        if (a.staff && !dr) throw new ApiError(`${a.staff} は ${c.carriers.get(leg.carrierId)?.name ?? leg.carrierId} のドライバーではありません`, 400);
        domainDelivery.actions.assignDriver(repo, { legId: leg.id, driverId: dr?.id ?? '', carrierId: leg.carrierId });
        notes.push(`配送スタッフ ${rec.staff || '未割当'} → ${a.staff || '未割当'}`);
      }
      const windows = a.time !== rec.time ? parseWindows(a.time) : undefined;
      if (windows && !windows.length) throw new ApiError('配達時間帯は 10:00〜12:00 の形で入れてください', 400);
      let deliverOn: string | undefined;
      if (a.alt && a.alt !== 'cur') {
        const row = dateAlt(c, d).find((x) => x.v === a.alt);
        if (!row || row.dis) throw new ApiError('この日には変えられません（出荷不可・納品不可）', 400);
        deliverOn = altDate(c, d, a.alt);
      }
      domainDelivery.actions.editDelivery(repo, { id: d.id, reason: a.reason, windows, deliverOn, carrierId: carrier2Id, address, note: notes.join('、') || undefined });
      return { ok: true };
    },

    /** 取消（倉庫から出る前・確認中の子だけ） */
    cancelDelivery: (repo, a: { id: string; why: string; detail: string; alt: boolean }) => {
      fail(checkCancel(a));
      domainDelivery.actions.cancelDelivery(repo, { id: a.id, reason: `${a.why}：${a.detail}` });
      return { ok: true };
    },

    /** 複製（分納・再配送・代替便・返送・その他）。子は確認中で作る */
    duplicateDelivery: (repo, a: { id: string; kind: string; reason: string; date: string; dest?: string; wh?: string; qty: string[] }) => {
      fail(checkDuplicate(a));
      const c = ctxOf(repo), d = deliveryOf(repo, a.id);
      const label = DUP_KINDS.find((k) => k.v === a.kind)?.label ?? 'その他';
      /* 画面の数量は明細の上から3つ */
      const lines = c.lines.filter((l) => l.deliveryId === d.id);
      const qty = lines.map((l, i) => ({ productId: l.productId, lineId: l.id, qty: i < a.qty.length ? Math.max(0, Number(a.qty[i]) || 0) : 0 }));
      const wh = a.kind === 'alternative' ? a.wh?.match(/WH\d{5}/)?.[0] : undefined;
      const reason = a.kind === 'return' && a.dest ? `${a.reason}・返送先 ${a.dest}` : a.reason;
      const child = domainDelivery.actions.addChild(repo, { id: d.id, kind: label, reason, deliverOn: slash(a.date), warehouseId: wh, qty });
      return { id: child.id, label };
    },

    /** トラブルの代理登録（連絡元・連絡者・日時は内容に残す） */
    reportTrouble: (repo, a: { id: string; from: string; who: string; at: string; kind: string; text: string } & By) => {
      fail(checkTroubleReport(a));
      const typeId = (Object.keys(TROUBLE_TYPE) as (keyof typeof TROUBLE_TYPE)[]).find((k) => TROUBLE_TYPE[k] === a.kind && TROUBLE_KINDS.includes(a.kind));
      if (!typeId) throw new ApiError(`種別は ${TROUBLE_KINDS.join('・')} から選んでください`, 400);
      const t = domainDelivery.actions.reportTrouble(repo, {
        deliveryId: a.id, typeId, site: 'ops', accountId: actor(a),
        note: `${a.text}（代理登録：${a.from}${a.who ? ` ${a.who}` : ''}${a.at ? ` ${a.at}` : ''}）`,
      });
      return { child: t.childDeliveryId || null };
    },

    /** トラブルの対応を決める（配送単位でまとめて解決） */
    resolveTrouble: (repo, a: { id: string; option: string; kind2?: string; reason: string; freight?: string; childDate?: string; qty?: { id: string; qty: number }[] }) => {
      fail(checkTroubleResolve(a));
      const resolution = RESOLUTION[a.option];
      if (!resolution) throw new ApiError('対応を選んでください', 400);
      const reason = a.reason + (a.freight === '請求する' ? '・運賃を請求する' : '');
      /* 種別未定の付け直し（6区分の名前 → 種類。種別未定の報告があるときに適用）。数量は商品ごとの納品できた数 */
      const typeId = a.kind2 ? (Object.keys(TROUBLE_TYPE) as (keyof typeof TROUBLE_TYPE)[]).find((k) => TROUBLE_TYPE[k] === a.kind2 && TROUBLE_KINDS.includes(a.kind2!)) : undefined;
      if (a.kind2 && !typeId) throw new ApiError(`種別は ${TROUBLE_KINDS.join('・')} から選んでください`, 400);
      /* 区分を付けて解決するまで、種別未定の報告は未解決のまま残る（配送_07 §13-1） */
      if (!typeId && repo.list<{ deliveryId: string; typeId: string; resolution: string }>('dm.delivery.troubles').some((t) => t.deliveryId === a.id && !t.resolution && t.typeId === 'undecided')) throw new ApiError('種別未定の報告があります。種別を選んでください', 400);
      const lines = (a.qty ?? []).map((x) => ({ productId: x.id, qty: Number(x.qty) }));
      domainDelivery.actions.resolveTrouble(repo, { deliveryId: a.id, resolution, reason, childDate: a.childDate && isValidDate(a.childDate) ? slash(a.childDate) : undefined, lines, typeId });
      return { ok: true, st: deliveryRecord(ctxOf(repo), deliveryOf(repo, a.id)).st };
    },

    /** 確認中の子の日付を確定して出荷待へ（親のトラブルが解決してから） */
    confirmChild: (repo, a: { id: string; date: string }) => {
      if (!isValidDate(a.date)) throw new ApiError('納品日は YYYY-MM-DD で入力してください', 400);
      domainDelivery.actions.confirmChild(repo, { id: a.id, deliverOn: slash(a.date) });
      return { ok: true };
    },

    /** 変更申請の確認（1件ずつ：希望日 w… で承認・別日 a… を提案・否認） */
    processChangeRequest: (repo, a: { id: string; decision: 'approve' | 'reject'; pick: string; reason: string }) => {
      fail(checkCrProcess(a));
      const x = crOf(repo, a.id || undefined);
      if (!['申請中', '別の日のご提案'].includes(x.status)) throw new ApiError('この変更申請は処理済みです', 409);
      const c = ctxOf(repo), rows = crProcess(c, x), all = [...rows.want, ...rows.alt], p = all.find((y) => y.v === a.pick);
      if (a.decision === 'approve' && (!p || p.dis)) throw new ApiError('この日は選べません（出荷不可・納品不可）', 400);
      const date = a.pick.startsWith('w') ? x.wishDates[Number(a.pick.slice(1)) - 1] : crAltDates(c, x)[Number(a.pick.slice(1)) - 1];
      const decision = a.decision === 'reject' ? '否認' : a.pick.startsWith('a') ? '別の日のご提案' : '承認';
      domainDelivery.actions.decideDateChange(repo, { id: x.id, decision, date: decision === '否認' ? undefined : date, reason: a.reason });
      const short = date ? date.slice(5) : '';
      const msg = decision === '否認' ? `変更申請 ${x.id} を否認しました（理由を法人に表示）`
        : decision === '別の日のご提案' ? `${short}を法人へご提案しました（法人Web でご返事を待ちます）` : `変更申請 ${x.id} を承認しました（納品日 ${short}）`;
      return { msg, state: decision === '否認' ? '否認' : decision === '承認' ? '承認' : '提案中' };
    },

    /** 変更申請の一括承認（判定が「問題なし」のものだけ・第一希望日で） */
    approveChangeRequests: (repo, a: { ids: string[] }) => {
      const c = ctxOf(repo);
      const list = (a.ids ?? []).map((id) => c.crs.find((x) => x.id === id)).filter((x): x is DCr => !!x && x.status === '申請中' && judgeOf(c, x) === '問題なし');
      if (!list.length) throw new ApiError('承認できる申請を選んでください（判定が「問題なし」のものだけ）', 400);
      for (const x of list) domainDelivery.actions.decideDateChange(repo, { id: x.id, decision: '承認', date: x.wishDates[0] });
      return { count: list.length };
    },

    /**
     * 出荷データの移動（スケジュールの週・日表示でチェックした配送 → 選んだお届け日。課題 2-4）。
     * 決まりは共通データの delivery.move（本発注の前は複数・後は1便・理由・休日と別のサイクルの確認・出荷指示の再送・通知・記録）
     */
    moveShipments: (repo, a: { ids: string[]; to: string; reason?: string; trouble?: boolean; troubleId?: string; confirmHoliday?: boolean; confirmCross?: boolean; notifyCorp?: boolean } & By) => {
      const m = domainDelivery.actions.move(repo, { ...a, to: slash(a.to ?? ''), by: actor(a) });
      return { id: m.id, count: m.rows.length, resent: m.rows.filter((x) => x.resent).length, carriers: m.carriers.length };
    },

    /** 配送サイクル設定を保存（祝日・出荷しない日は共通データの暦へ。A1・サイクル休止・出荷不可枠は共通データの決まり） */
    saveCycleSettings: (repo, a: { settings: CycleSettings }) => {
      fail(checkCycleSettings(a.settings));
      const cur = cycleSettings(ctxOf(repo));
      /* 変更履歴の元（保存で変わる前の祝日・出荷不可日と、影響の件数） */
      const heldBefore = domainDelivery.queries.holidays(repo);
      const impact = cycleImpact(ctxOf(repo), a.settings);
      /* A1 は配送データを作っていない月だけ変えられる（課題 4-10）。前の月から順に（重なる後ろの月は同じ日数だけ動く）。
         オーダー締切は動かさない（月間メニューの受付期間が元）。合わなくなった締切は warnings で返す（課題 4b-10） */
      const moved: string[] = [];
      const before = unfitCycles(repo, Object.keys(a.settings.a1s ?? {}));
      for (const [ym, a1] of Object.entries(a.settings.a1s ?? {}).sort(([x], [y]) => x.localeCompare(y))) {
        /* 画面で変えた月だけ（後ろの月がつられて動いたあとは、その月は変えない） */
        if (a1 === (cur.a1s ?? {})[ym] || a1 === (cycleSettings(ctxOf(repo)).a1s ?? {})[ym]) continue;
        if (cur.readOnly.includes(ym)) throw new ApiError(`${ym} サイクルは${cur.lockReasons?.[ym] ?? '変えられない月'}のため A1 を変えられません`, 409);
        domainDelivery.actions.setCycleA1(repo, { cycleMonth: ym, a1: slash(a1) });
        moved.push(ym);
      }
      /* サイクル休止・倉庫ごとの出荷不可枠は、運営の設定として保存する（配送_02 §4-5・§4-6） */
      repo.put(K.cfg, 'pauses', { id: 'pauses', items: a.settings.pauses });
      /* 倉庫ごとの出荷不可枠は暦（Cycle.ngSlots）だけに持つ（出荷日の判定 canPick もここを読む）。全サイクルへ書くので、あとで足したサイクルも次の保存で揃う */
      const bySlots = Object.fromEntries(Object.entries(NG_TABS).map(([k, wh]) => [wh, a.settings.ngSlots[k] ?? []]));
      for (const cy of repo.list<Cycle>('dm.delivery.cycles')) repo.put<Cycle>('dm.delivery.cycles', cy.id, { ...cy, ngSlots: bySlots });
      const heldAfter = holidaysFrom(a.settings);
      domainDelivery.actions.setHolidays(repo, { holidays: heldAfter });
      /* 変更履歴：変えた項目ごとに1行（P-HIST）。影響＝作り直した配送（日付は自動では動かさないので0）／要確認に出した配送（新しい休みにかかる配送） */
      const kindOf = (h: { noDelivery: boolean; noPicking: boolean; warehouseIds?: string[] }) => (h.noDelivery ? '祝日・臨休' : `出荷不可日${h.warehouseIds?.length ? '（倉庫指定）' : ''}`);
      const flag = (h: { date: string; name: string; noDelivery: boolean; noPicking: boolean; warehouseIds?: string[] }) => `${h.date}|${h.name}|${h.noDelivery}|${h.noPicking}|${(h.warehouseIds ?? []).join(',')}`;
      const logRows: { op: '登録' | '変更' | '削除'; item: string; before: string; after: string }[] = [];
      const byDate = (l: typeof heldBefore) => new Map(l.map((h) => [`${h.date}|${h.noDelivery ? 'D' : 'P'}`, h]));
      const mb = byDate(heldBefore), ma = byDate(heldAfter);
      for (const [k, h] of ma) {
        const o = mb.get(k);
        if (!o) logRows.push({ op: '登録', item: `${kindOf(h)}（${h.date}）`, before: '—', after: h.name });
        else if (flag(o) !== flag(h)) logRows.push({ op: '変更', item: `${kindOf(h)}（${h.date}）`, before: o.name, after: h.name });
      }
      for (const [k, h] of mb) if (!ma.has(k)) logRows.push({ op: '削除', item: `${kindOf(h)}（${h.date}）`, before: h.name, after: '—' });
      for (const ym of moved) logRows.push({ op: '変更', item: `${ym} サイクルの A1`, before: slash((cur.a1s ?? {})[ym] ?? ''), after: slash(a.settings.a1s?.[ym] ?? '') });
      if (logRows.length) domainDelivery.actions.logCycleSettings(repo, { by: OPS, rows: logRows.map((x) => ({ ...x, rebuilt: 0, flagged: impact.deliveries })) });
      return { ok: true, warnings: moved.length ? orderDeadlineWarnings(repo, moved, before) : [] };
    },

    /** 出荷指示を送る（再送）。出荷指示は配送から作るので、送った記録だけ持つ */
    resendShipOrder: (repo, a: { id: string }) => {
      const o = shipOrders(ctxOf(repo), sends(repo)).find((x) => x.id === a.id);
      if (!o) throw new ApiError('出荷指示が見つかりません', 404);
      if (o.st === '送信済') throw new ApiError('この出荷指示は送信済みです', 409);
      repo.put(K.sends, o.id, { id: o.id, at: stamp() });
      /* 同じ出荷日・同じ委託配送先の出荷指示（ES の送り状）がそろったら配送依頼（旧システムの「配送依頼通知」・lib/domain/mails.ts。子の配送＝コピーは数えない） */
      const sent = sends(repo), today = nowStamp().slice(0, 10);
      deliveryRequestCheck(repo, o.target, (d) => sent.has(d.id.replace(/^DL-/, 'SO-')) || d.shipOn < today, '委託・引き取り');
      return { ok: true };
    },

    /** 出荷実績・送り状番号の CSV を取り込んだ記録 */
    recordImport: (repo, a: { file: string; kind: '出荷実績' | '送り状番号'; lines: number }) => {
      if (!a.file) throw new ApiError('ファイルを選んでください', 400);
      const id = 'IMX' + String(repo.nextSeq('delivery.import')).padStart(3, '0');
      repo.put<ImportLog>(K.imp, id, { id, at: stamp(), file: a.file, kind: a.kind, lines: a.lines, ok: a.lines, ng: 0, st: '完了', tone: 'success', sub: '' });
      return { id };
    },

    /** 配送問い合わせから委託配送先へ見積依頼（共通データの見積。委託配送先Web の見積依頼に届く）。商談中なので申込はまだない */
    requestQuote: (repo, a: QuoteForm & { id: string } & By) => {
      const c = ctxOf(repo), carrier = c.carriers.get(a.id);
      if (!carrier) throw new ApiError('委託配送先が見つかりません', 404);
      if (carrier.kind !== '委託・引き取り') throw new ApiError('路線の運送会社は運賃表で確認します（見積依頼は出せません）', 400);
      fail(checkQuoteForm(a));
      const temps = a.temps.map(quoteTemp);
      const q = domainCarrier.actions.requestQuote(repo, {
        applicationId: '', branchName: a.siteName.trim() || `商談中（${a.pref}${a.city}）`, address: { zip: a.zip, pref: a.pref, city: a.city, addr1: a.addr1, addr2: '' },
        temp: temps[0], temps, deliveriesPerMonth: a.perMonth, mealsPerDelivery: a.meals, wishWeekdays: a.weekdays.join('・'),
        corpName: a.corpName.trim(), weekend: a.weekend, planName: a.planName.trim(), vending: a.vending, priceCond: a.priceCond.trim(),
        moreSites: a.moreSites.split('\n').map((x) => x.trim()).filter(Boolean).map((x) => { const [name, ...addr] = x.split(/[／\/]/); return { name: name.trim(), address: addr.join('／').trim() }; }),
        requestedBy: actor(a), answerBy: addDays(c.today, 5), carrierIds: [carrier.id],
      });
      return { id: q.id, name: carrier.name };
    },

    /** 運営メモを追加（共通データの配送の運営だけのメモ） */
    addMemo: (repo, a: { id: string; text: string }) => {
      fail(checkMemo(a.text));
      domainDelivery.actions.addMemo(repo, { id: a.id, text: a.text });
      return { ok: true };
    },
  },
});
