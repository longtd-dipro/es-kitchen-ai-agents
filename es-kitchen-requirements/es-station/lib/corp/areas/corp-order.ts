import { matNextDue } from '@/lib/domain/matOrder';
import { ApiError } from '@/lib/api/errors';
import { defineArea, type DocRepo } from '@/lib/ops/core/area';
import type { LogRow } from '@/lib/ops/menu/types';
import domainDelivery from '@/lib/domain/areas/delivery';
import domainOrder from '@/lib/domain/areas/order';
import { listMenus } from '@/lib/domain/menu';
import { nowStamp, today } from '@/lib/supplier/dates';
import { amountOf, cycleMonthAt, MAT_EXTRA_OPTION } from '@/lib/domain/charges';
import type { Option, ProductTag } from '@/lib/domain/types';
import {
  catsOf, curMenu, curOrder, cycleOf, linesOf, matHistOf, materialsOf, matOrders, matQ, pastOf, prefOf, prefRow, productsOf, rangeOf, sitesOf, whoOf,
  type SiteX,
} from '../order/fromDomain';
import { checks, matError, matFor, surveyError } from '../order/logic';
import type { Acc, CMat, CSite, ExtraLog, MatHist, OrderView, Pref, Qty, Survey } from '../order/types';

/*
 * 領域 corp-order：法人Web の 月次注文（商品注文・資材注文・注文履歴）。元：部品/23_法人_月次注文.html
 * データは共通データ（lib/domain・dm.*）：月間メニュー・商品注文・注文の設定（dm.order）、拠点・子契約・休止・貸出（dm.org）、
 *   商品・資材（dm.master）、便のお届け日・資材の注文・資材便（dm.delivery）。画面の形は lib/corp/order/fromDomain.ts で作る。
 * 商品カテゴリの並びは共通データ（dm.master.productCategories）。共通データにないもの：
 *   従業員アンケート（corp-order.surveys）、注文の設定・アンケートの変更履歴（corp-order.logs）。
 * 商品注文・資材注文・注文の設定は共通データだけに書く（運営Web のメニュー管理も共通データを読む）。
 * 拠点アカウントはその拠点だけ、お試しの法人はその法人の拠点だけ。
 */

const K = {
  /* 共通データにないもの（法人Web だけの値） */
  surveys: 'corp-order.surveys', logs: 'corp-order.logs',
} as const;

/** 画面に出す拠点（CSite）と、拠点ごとの過去の注文 */
function load(repo: DocRepo, a: Acc) {
  const m = curMenu(repo), cycle = cycleOf(m, repo), xs = sitesOf(repo, a, m.id), sites = xs.map((x) => x.s);
  const P = productsOf(repo, m, sites.map((s) => s.id)), cats = catsOf(repo, P);
  return { m, cycle, xs, sites, P, cats };
}
function mustSite(repo: DocRepo, a: Acc, id: string) {
  const L = load(repo, a), x = L.xs.find((v) => v.s.id === id);
  if (!x) throw new ApiError('この拠点の注文は見られません', 403);
  return { ...L, x, s: x.s };
}
/** 解約後（参照のみ）は書き込めない（受付簿 No.157。画面のボタンを隠すだけでなくサーバーでも断る） */
const mustWrite = (a: Acc) => { if (a.ro) throw new ApiError('解約後は参照のみのため、操作できません', 403); };
/** 変更した人（アカウント名）とアカウントID */
const whoName = (a: Acc, s: CSite) => (a.role === 'branch' ? s.short + '（拠点アカウント）' : s.corpName + '（法人アカウント）');
const accountOf = (a: Acc) => (a.role === 'branch' && a.branchId ? a.branchId : a.corpId);

/**
 * 今月の資材注文（通常注文・取消を除く・古い順。初期セットは数えない。2回目以降は資材の追加配送 OP000036：決定_STEP5 Q2）。
 * 「何回目」は納品予定日のサイクル月で数える（2026/10/06 受付簿 #277）：いま注文したときの納品予定日（matNextDue）が入るサイクル月の、納品予定日が同じサイクル月の注文
 */
const monthMats = (repo: DocRepo, site: string) => {
  const cyc = cycleMonthAt(repo, matNextDue(repo, site));
  return matOrders(repo, [site]).filter((x) => x.kind === 'regular' && x.status !== '取消' && cycleMonthAt(repo, x.dueOn) === cyc).sort((a, b) => (a.orderedAt < b.orderedAt ? -1 : 1));
};
const matLine = (mats: CMat[], q: Record<string, number>) => mats.filter((m) => q[m.id]).map((m) => m.name + ' ' + q[m.id] + m.unit).join('、');

/**
 * 変更履歴を P-HIST の列（操作・項目・変更前・変更後）に分ける（B-2）。
 * 商品注文の登録は「合計 n個」を項目「合計」に、変更前は前の登録の合計。注文の設定・アンケート・資材注文は変更後に内容を出す
 */
function histColumns(rows: LogRow[]): LogRow[] {
  const sorted = rows.slice().sort((p, q) => (p.at < q.at ? -1 : p.at > q.at ? 1 : 0));
  let lastTotal: string | undefined;
  const out = sorted.map((r) => {
    const m = /^合計 (\d+個)$/.exec(r.detail);
    if (m) { const row = { ...r, item: '合計', before: lastTotal ?? '—', after: m[1] }; lastTotal = m[1]; return row; }
    const item = r.what.includes('資材') ? '資材注文' : r.what.includes('設定') ? '注文の設定' : r.what.includes('アンケート') ? 'アンケート' : r.what.includes('締切') ? '確定' : '';
    return { ...r, item, before: '—', after: r.detail };
  });
  return out.sort((p, q) => (p.at < q.at ? 1 : p.at > q.at ? -1 : 0));
}

function addLog(repo: DocRepo, site: string, ym: string, e: LogRow) {
  const id = site + '|' + ym + '|' + repo.nextSeq(K.logs);
  repo.put<ExtraLog>(K.logs, id, { ...e, id, site, ym });
}

/**
 * 注文の設定を共通データに保存。
 * 基準数のパターン（短消費期限なし＝allowShortLife）は契約の時に決め、変えられるのは運営だけ（REQ-CT-300・2026/10/02）。
 * 法人Web から送られた値は使わず、今の値のまま残す
 */
function savePrefTo(repo: DocRepo, a: Acc, s: CSite, all: string[], p: Pref & { next: boolean }) {
  const cats = p.cats.length >= all.length && all.every((x) => p.cats.includes(x)) ? null : p.cats;
  domainOrder.actions.savePref(repo, {
    branchId: s.id, categories: cats, allowShortLife: prefRow(repo, s.id)?.allowShortLife !== false, priceRange: rangeOf(p.price),
    excluded: p.ex, updatedBy: accountOf(a), applyNext: p.next,
  });
}

export default defineArea({
  name: 'corp-order',
  /* 自分のデータは持たない（共通データを読む。アンケート・変更履歴の追加分は画面の操作で作る） */
  seed: () => ({}),
  queries: {
    /** 月次注文の画面に要るもの（商品注文・資材注文・注文履歴で同じ） */
    view: (repo, a: Acc): OrderView => {
      const { m, cycle, xs, sites, P, cats } = load(repo, a);
      const ids = sites.map((s) => s.id), mats = materialsOf(repo);
      const surveys = repo.list<Survey>(K.surveys).filter((x) => x.ym === m.id);
      const extra = repo.list<ExtraLog>(K.logs).filter((x) => x.ym === m.id);
      const allMats = matOrders(repo, ids);
      const v: OrderView = {
        cycle, products: P, cats, sites, orders: {}, prefs: {}, next: {}, surveys: {}, logs: {},
        materials: mats, matInit: {}, matStatus: {}, matThisMonth: {}, matHist: [], past: {},
        menuPdfs: Object.fromEntries(listMenus(repo).filter((x) => x.pdfs?.length).map((x) => [x.id, x.pdfs])),
        matExtraYen: repo.get<Option>('dm.master.options', MAT_EXTRA_OPTION)?.amountYen ?? 0,
        tags: repo.list<ProductTag>('dm.master.productTags').map((t) => t.name),
      };
      xs.forEach((x: SiteX) => {
        const s = x.s, o = curOrder(repo, x, m.id, P, sites), mm = monthMats(repo, s.id), sp = prefRow(repo, s.id);
        const pp = pastOf(repo, s, m.id, sites);
        s.pastQ = pp.pastQ;
        if (pp.past) v.past[s.id] = pp.past;
        v.orders[s.id] = o;
        v.prefs[s.id] = prefOf(sp, cats);
        v.next[s.id] = !!sp?.applyNext;
        const sv = surveys.find((y) => y.site === s.id); if (sv) v.surveys[s.id] = sv;
        // 変更履歴：商品注文の履歴 ＋ 受付が始まってからの資材注文 ＋ 法人Web で足したもの（新しい順）
        const ml: LogRow[] = allMats.filter((y) => y.branchId === s.id && y.kind === 'regular' && y.orderedAt >= m.orderFrom)
          .map((y) => ({ at: y.orderedAt, who: whoOf(repo, y.orderedBy, sites), what: '資材注文を登録', detail: matLine(mats, matQ(y)) }));
        v.logs[s.id] = histColumns(o.log.concat(ml, extra.filter((y) => y.site === s.id).map(({ at, who, what, detail }) => ({ at, who, what, detail }))));
        // 資材：数量の初期値はすべて 0（台帳 E 2026-10-05）。状態＝休止中／お試し／登録済（このサイクル月に注文あり）／未注文
        v.matInit[s.id] = {};
        v.matStatus[s.id] = s.paused ? '休止中' : s.trial ? 'お試し' : mm.length ? '登録済' : '未注文';
        v.matThisMonth[s.id] = mm.map((y) => ({ no: y.id, at: y.orderedAt }));
      });
      const hist: MatHist[] = allMats.filter((y) => y.status !== '取消').map((y) => matHistOf(repo, y, mats));
      v.matHist = hist.sort((p, q) => (p.od < q.od ? 1 : p.od > q.od ? -1 : p.no < q.no ? 1 : -1));
      return v;
    },
    /** 資材の追加配送（OP000036）の料金（税抜）。資材注文の案内・「今月 n回目のご注文」・Q205 の {金額} */
    matFee: (repo) => amountOf(repo, 'event.materialOrderPaid'),
  },
  actions: {
    /** 商品注文を登録（共通データの order.saveOrder。配送の明細も同じ中身になる。ステータス 登録済） */
    registerOrder: (repo, a: { acc: Acc; site: string; q: Qty }) => {
      mustWrite(a.acc);
      const { m, cycle, s, P } = mustSite(repo, a.acc, a.site);
      if (s.paused) throw new ApiError('この拠点は休止中です', 409);
      if (s.trial) throw new ApiError('お試しのご注文は変更できません', 409);
      if (!cycle.open) throw new ApiError('受付期間が終わったため登録できません', 409);
      const ng = checks(s, P, a.q).filter((x) => x.state === 'ng');
      if (ng.length) throw new ApiError('登録できません。' + ng.map((x) => x.label).join('・'), 400);
      domainOrder.actions.saveOrder(repo, { branchId: s.id, cycleMonth: m.id, lines: linesOf(s, a.q), site: 'corp', accountId: accountOf(a.acc) });
    },
    /** 注文の設定（共通データの order.savePref。翌月のメニューから使う） */
    savePref: (repo, a: { acc: Acc; site: string; pref: Pref & { next: boolean } }) => {
      mustWrite(a.acc);
      const { m, s, cats } = mustSite(repo, a.acc, a.site), p = a.pref;
      savePrefTo(repo, a.acc, s, cats, p);
      addLog(repo, s.id, m.id, { at: nowStamp(), who: whoName(a.acc, s), what: '注文の設定を変更', detail: 'カテゴリ ' + p.cats.length + '／対象外 ' + p.ex.length + '品／次回以降も適用 ' + (p.next ? 'あり' : 'なし') });
    },
    /** 「次回以降も適用」だけ変える（AI の提案を確定したとき） */
    setNext: (repo, a: { acc: Acc; site: string; next: boolean }) => {
      mustWrite(a.acc);
      const { s, cats } = mustSite(repo, a.acc, a.site);
      savePrefTo(repo, a.acc, s, cats, { ...prefOf(prefRow(repo, s.id), cats), next: a.next });
    },
    /** 従業員アンケートを開始（締切は受付期間の終わりまで。人数は拠点の従業員数） */
    startSurvey: (repo, a: { acc: Acc; site: string; due: string }) => {
      mustWrite(a.acc);
      const { m, s } = mustSite(repo, a.acc, a.site);
      if (repo.get<Survey>(K.surveys, s.id + '|' + m.id)) throw new ApiError('この拠点のアンケートはすでに開始しています', 409);
      const err = surveyError(a.due, today(), m.orderTo); if (err) throw new ApiError(err, 400);
      const id = s.id + '|' + m.id;
      const N = repo.get<{ employees: number }>('dm.org.branches', s.id)?.employees || 1;
      repo.put<Survey>(K.surveys, id, { id, site: s.id, ym: m.id, due: a.due, N });
      addLog(repo, s.id, m.id, { at: nowStamp(), who: whoName(a.acc, s), what: 'アンケートを開始', detail: '締切 ' + a.due });
    },
    /** 資材注文を登録（共通データの delivery.placeMaterialOrder。資材便の配送もできる）。資材注文No を返す */
    registerMat: (repo, a: { acc: Acc; site: string; q: Record<string, number> }) => {
      mustWrite(a.acc);
      const { s } = mustSite(repo, a.acc, a.site);
      if (s.paused) throw new ApiError('この拠点は休止中です。休止中は資材のご注文はできません。', 409);
      /* お試しの拠点は資材注文できない（台帳 E 2026-10-05：初期セットを自動でお届け） */
      if (s.trial) throw new ApiError('お試し中は資材のご注文はできません。ご希望はESキッチンへお問い合わせください。', 409);
      const q: Record<string, number> = {};
      materialsOf(repo).filter((x) => matFor(s, x)).forEach((x) => { if (a.q[x.id] > 0) q[x.id] = a.q[x.id]; });
      const err = matError(q); if (err) throw new ApiError(err, 400);
      const mo = domainDelivery.actions.placeMaterialOrder(repo, { branchId: s.id, lines: Object.entries(q).map(([materialId, qty]) => ({ materialId, qty })), accountId: accountOf(a.acc) });
      return mo.id;
    },
  },
});
