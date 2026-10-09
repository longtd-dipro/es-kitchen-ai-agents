import { jansOf } from '@/lib/domain/product';
import { ApiError } from '@/lib/api/errors';
import { defineArea, type DocRepo } from '@/lib/ops/core/area';
import domainApp from '@/lib/domain/areas/app';
import domainBilling from '@/lib/domain/areas/billing';
import domainReport, { firstStockPending } from '@/lib/domain/areas/report';
import { ALTS } from '@/lib/domain/alt';
import type { AltSetting, Delivery, Invoice, Option, Product, StockCheck } from '@/lib/domain/types';
import { PENALTY_OPTION } from '@/lib/domain/charges';
import { formMasterOf } from '@/lib/domain/formMaster';
import { submitApply, type ApplySubmit } from '../docs/apply/actions';
import { corpInv, corpMeta, siteMetas, stockCfg, stockRec, type StockBy } from '../docs/fromDomain';
import { billDetail, billRows, STOCK_IDS, STOCK_MAX, STOCK_PROD, stockErrors, stockMonths, wayAt, whoCands } from '../docs/logic';
import type { AppUser, Buy, CorpInv, CorpMeta, SiteMeta, StockProduct, StockSheetView, Who } from '../docs/types';

/*
 * 法人Web の 請求書・棚卸報告・申込フォーム・売上・ユーザー管理（元：20_法人_まとめ.html の iframe fcb・fsl と 部品/21_法人_申込フォーム.html）。
 *
 * データは共通データ（lib/domain・dm.*）：法人・拠点・担当者・契約（dm.org）、請求書（dm.billing.invoices）、棚卸報告（dm.report.stockChecks）、
 *   新規申込（dm.apply.applications）。画面の形は lib/corp/docs/fromDomain.ts で作る。
 * 売上・ユーザー（アプリの購入・利用者）は共通データ（dm.app.purchases・dm.app.users。運営の売上管理・アカウント一覧と同じ）。
 * 棚卸報告の「申告した方」（共有アカウントのどなたか）は共通データに項目がないので corp-docs.stockBy に持つ。
 * 棚卸報告の申告は共通データ（report.fileStock）だけに書く（運営Web の「請求 ＞ 在庫管理・実績精算」も共通データを読む）。
 */
const K = { stockBy: 'corp-docs.stockBy' } as const;

function corpOf(repo: DocRepo, who: Who): CorpMeta {
  const c = who?.corpId ? corpMeta(repo, who.corpId) : undefined;
  if (!c) throw new ApiError('法人が見つかりません', 404);
  return c;
}
/** このアカウントで見られる拠点（拠点アカウントはその拠点だけ） */
const sitesOf = (repo: DocRepo, who: Who, corp: CorpMeta): SiteMeta[] =>
  siteMetas(repo, corp).filter((s) => who.role !== 'branch' || s.id === who.branchId).sort((a, b) => a.id.localeCompare(b.id));

/** この法人の請求書 */
const invoicesOf = (repo: DocRepo, corpId: string): CorpInv[] =>
  domainBilling.queries.forCorp(repo, { corpId }).map(corpInv).filter((x): x is CorpInv => !!x);

/** Bill One の送付の状態と記録（共通データの請求書の send。課題 0-2。古い DB の請求書は null） */
const sendOf = (repo: DocRepo, id: string) => repo.get<Invoice>('dm.billing.invoices', id)?.send ?? null;

const roleName = (who: Who) => (who.role === 'branch' ? '拠点アカウント' : '法人アカウント');
/** 共通データに記録するアカウント（拠点アカウントは拠点ID、法人アカウントは法人ID） */
const accountOf = (who: Who) => (who.role === 'branch' && who.branchId ? who.branchId : who.corpId);

export default defineArea({
  name: 'corp-docs',
  /* 自分のデータは持たない（棚卸報告の「申告した方」corp-docs.stockBy は申告のときに書く） */
  seed: () => ({}),
  queries: {
    /** 申込フォームのマスタ（プラン・機種・オプション・値引き。共通データのマスタ・ログイン前に読む。マスタを直すと開いている申込も読み直す） */
    applyMaster: (repo) => formMasterOf(repo),
    /** 請求書の一覧。ro＝解約後（参照のみ）：この拠点の請求書だけの出し方 */
    bills: (repo, { who, ro }: { who: Who; ro?: boolean }) => {
      const corp = corpOf(repo, who), sites = sitesOf(repo, who, corp);
      const branchMode = who.role === 'branch' || !!ro;
      const rows = billRows(invoicesOf(repo, who.corpId), sites, corp, branchMode);
      return {
        corpName: corp.name, branchMode, roleName: roleName(who), siteName: sites[0]?.name ?? '',
        rows: rows.map((x) => ({ ...x, send: sendOf(repo, x.no)?.status ?? '' })), anyPart: rows.some((r) => r.part),
      };
    },
    /** 請求書詳細。site＝拠点の分（拠点アカウントは必ず自分の拠点） */
    bill: (repo, { who, no, site, ro }: { who: Who; no: string; site?: string | null; ro?: boolean }) => {
      const corp = corpOf(repo, who), sites = sitesOf(repo, who, corp);
      /* 解約後（参照のみ）も一覧（bills）と同じく、この拠点の分だけ */
      const sid = who.role === 'branch' || ro ? who.branchId ?? site ?? null : site || null;
      const inv = invoicesOf(repo, who.corpId).find((x) => x.id === no);
      if (!inv) return null;
      const d = billDetail(inv, corp, sites, !sid && inv.site ? inv.site : sid);
      return d && { ...d, send: sendOf(repo, no) };
    },
    /** 棚卸報告（棚卸一覧・棚卸報告の画面）：拠点・棚卸の設定・報告（月度ごと）・下書き（拠点×月度）・報告した方の候補・商品を追加の候補 */
    stock: (repo, { who }: { who: Who }) => {
      const corp = corpOf(repo, who), sites = sitesOf(repo, who, corp), ids = sites.map((s) => s.id);
      const recs = domainReport.queries.stockChecks(repo, {}).filter((x) => ids.includes(x.branchId))
        .map((x) => stockRec(x, corp.id, repo.get<StockBy>(K.stockBy, x.id)));
      const name = (pid: string) => STOCK_PROD[STOCK_IDS.indexOf(pid)] ?? pid;
      return {
        corpName: corp.name, roleName: roleName(who), scope: who.role === 'branch' ? 'この拠点だけ' : '自社のすべての拠点',
        sites: sites.map((s) => ({ id: s.id, name: s.name, dlv: s.dlv })),
        cfg: ids.map((id) => stockCfg(repo, id)),
        /* 最初の棚卸報告をまだしていない拠点（受付簿 No.134） */
        firstStock: firstStockPending(repo, ids),
        recs,
        /* 棚卸の下書き（拠点 × 今回＋過去3か月。この拠点に関係する商品だけ：在庫・お届け中・廃棄する。課題 4-6） */
        sheets: ids.flatMap((id) => stockMonths().map((M): StockSheetView => {
          const sh = domainReport.queries.stockSheet(repo, { branchId: id, period: M.m });
          return {
            site: id, m: sh.period,
            items: sh.rows.map((x) => ({ id: x.productId, name: name(x.productId), nameEn: repo.get<Product>('dm.master.products', x.productId)?.nameEn?.trim() || undefined, prev: x.prev, delivered: x.delivered, inTransit: x.inTransit, toDispose: x.toDispose, expired: x.expired, expiresOn: x.expiresOn })),
            transit: sh.inTransit,
          };
        })),
        /* 代替品の回収・廃棄のお知らせ（決定_代替品 Q-ALT8：代替品の設定のデータから出す。この拠点に残っている不良品の分） */
        alts: repo.list<AltSetting>(ALTS).flatMap((a) => a.disposals.filter((x) => ids.includes(x.branchId)).map((x) => {
          const orig = a.rows.find((r) => r.branchId === x.branchId && r.toDeliveryId === x.deliveryId)?.deliveryId;
          return { id: a.id, site: x.branchId, product: name(x.productId), qty: x.qty, how: x.how, on: repo.get<Delivery>('dm.delivery.deliveries', x.deliveryId)?.deliverOn ?? '', origOn: orig ? repo.get<Delivery>('dm.delivery.deliveries', orig)?.deliverOn ?? '' : '' };
        })),
        cands: Object.fromEntries(sites.map((s) => [s.id, whoCands(corp, [s], who.role === 'branch')])),
        /* 「商品を追加」の候補：ESキッチンの商品マスタで販売中の商品（資材は除く） */
        products: repo.list<Product>('dm.master.products').filter((p) => p.status !== '削除済' && p.temp !== '資材').sort((a, b) => a.id.localeCompare(b.id))
          .map((p): StockProduct => ({ id: p.id, name: p.name, nameEn: p.nameEn?.trim() || undefined, kana: p.kana, jan: p.jan, jans: jansOf(p), temp: p.temp })),
        /* 事務手数料（棚卸報告の未報告）の金額（税抜）＝オプションマスタ OP000016（2026/10/03：直書きしない） */
        penaltyYen: repo.get<Option>('dm.master.options', PENALTY_OPTION)?.amountYen ?? 0,
      };
    },
    /** QR コード出力の拠点（法人情報の画面。REQ-UI-009：2026/10/02 に購入管理の画面から移した） */
    qrSites: (repo, { who }: { who: Who }) =>
      sitesOf(repo, who, corpOf(repo, who)).map((s) => ({ id: s.id, n: s.name, s: s.short, esqr: s.esqr, paused: s.paused })),
    /** 購入・ユーザー管理（2026/10/02 名称変更・REQ-UI-004。旧：売上・ユーザー管理）：このアカウントの拠点の購入・ユーザー（絞り込み・並べ替えは画面で） */
    sales: (repo, { who }: { who: Who }) => {
      const sites = sitesOf(repo, who, corpOf(repo, who)), ids = sites.map((s) => s.id);
      const us = domainApp.queries.users(repo, { branchIds: ids });
      const uOf = new Map(us.map((x) => [x.id, x]));
      return {
        sites: sites.map((s) => ({ id: s.id, n: s.name, s: s.short, esqr: s.esqr, paused: s.paused })),
        buys: domainApp.queries.purchases(repo, { branchIds: ids }).map((p, seq): Buy => ({
          id: p.id, no: p.id, uid: p.userId, site: p.branchId, item: p.productName, code: p.productId, qty: p.qty, amt: p.amountYen, pay: p.payMethod, st: p.status, reason: p.refundReason, at: p.at, seq,
          gender: uOf.get(p.userId)?.gender ?? '', age: uOf.get(p.userId)?.ageGroup ?? '',
        })),
        users: us.map((u, seq): AppUser => ({
          id: u.id, site: u.branchId, emp: u.employeeNo, link: u.link, limit: u.limit, since: u.registeredOn, seq, gender: u.gender, age: u.ageGroup,
        })),
      };
    },
  },
  actions: {
    /** 棚卸を報告する（今回の月度だけ。報告期限までは報告し直せる。ES配送便の拠点も法人・拠点が報告できる）。共通データの report.fileStock で記録する */
    /**
     * rows＝棚卸した商品ごとの 今ある数（actual）・捨てた数（disposed）・お届け中で届いて数に入れた数（arrived）。この拠点に関係する商品だけ（課題 4-6）。
     * 下書きにない商品（「商品を追加」で足した行・No.3.15）も受け付ける：前回の数 0・E327 の確認はしない。
     * n（全商品の並びの今ある数）でも申告できる（古い画面）
     */
    fileStock: (repo, a: { who: Who; site: string; m: string; n?: (number | string)[]; rows?: { productId: string; actual: number | string; disposed?: number | string; arrived?: number | string }[]; by: string }) => {
      const corp = corpOf(repo, a.who), s = sitesOf(repo, a.who, corp).find((x) => x.id === a.site);
      if (!s) throw new ApiError('拠点が見つかりません', 404);
      const c = stockCfg(repo, s.id), M = stockMonths().find((x) => x.m === a.m);
      /* ES配送便の拠点も法人・拠点が報告できる（ドライバーの報告と最後の報告が有効：台帳 E 2026-10-05 B-21）。棚卸なしの拠点だけ止める */
      const way = wayAt(c, a.m);
      if (way !== 'corp' && way !== 'driver') throw new ApiError('この拠点は棚卸報告の対象ではありません（棚卸なし）', 400);
      /* E324 */
      if (!M || !M.open) throw new ApiError('報告期限を過ぎた月度は報告できません。ESキッチンが追加・修正します。', 400);
      if ((c.pauseFrom && a.m >= c.pauseFrom) || (c.from && a.m < c.from)) throw new ApiError('この月度は棚卸報告の対象ではありません', 400);
      /* E326：運営が確認済みの報告は直せない */
      if (domainReport.queries.stockChecks(repo, { branchId: s.id, period: a.m }).some((x) => x.status === '確認済')) throw new ApiError('ESキッチンが確認済みのため、報告し直すことはできません。', 409);
      const cand = whoCands(corp, [s], a.who.role === 'branch').find((x) => x.value === a.by);
      const sheet = domainReport.queries.stockSheet(repo, { branchId: s.id, period: a.m });
      const pname = (id: string) => STOCK_PROD[STOCK_IDS.indexOf(id)] ?? repo.get<Product>('dm.master.products', id)?.name ?? id;
      let rows: { productId: string; actual: number; disposed: number; arrived: number }[];
      if (a.rows) {
        /* この拠点に関係する商品（下書きの行）だけ。全部の行に数が要る（E320） */
        const num = (v: number | string | undefined) => (v === undefined || v === '' ? 0 : Number(v));
        const check = (out: { actual: number; disposed: number; arrived: number }) => {
          if ([out.actual, out.disposed, out.arrived].some((n) => !Number.isInteger(n) || n < 0 || n > STOCK_MAX)) throw new ApiError('数は0〜999,999の範囲でご入力ください。', 400);
        };
        rows = sheet.rows.map((x) => {
          const v = a.rows!.find((y) => y.productId === x.productId);
          if (!v || v.actual === '' || v.actual === undefined) throw new ApiError('すべての商品の今ある数をご入力ください（ない商品は 0）。', 400);
          const out = { productId: x.productId, actual: num(v.actual), disposed: num(v.disposed), arrived: num(v.arrived) };
          check(out);
          /* E321・E327（「商品を追加」で足した行は対象外） */
          if (out.arrived > x.inTransit) throw new ApiError('届いた数はお届け中の数までの数でご入力ください。', 400);
          if (out.actual + out.disposed > x.prev + x.delivered + out.arrived) throw new ApiError(`${pname(x.productId)}の今ある数と捨てた数の合計が、前回の数と届いた数の合計を超えています。`, 400);
          return out;
        });
        /* 「商品を追加」で足した商品（下書きにない・販売中の商品だけ）。前回の数 0 */
        for (const v of a.rows.filter((y) => !sheet.rows.some((x) => x.productId === y.productId))) {
          const p = repo.get<Product>('dm.master.products', v.productId);
          if (!p || p.status === '削除済' || p.temp === '資材') throw new ApiError('商品が見つかりません。JANコードか商品名をご確認ください。', 400);
          if (v.actual === '' || v.actual === undefined) throw new ApiError('すべての商品の今ある数をご入力ください（ない商品は 0）。', 400);
          const out = { productId: v.productId, actual: num(v.actual), disposed: num(v.disposed), arrived: 0 };
          check(out);
          rows.push(out);
        }
      } else {
        const err = stockErrors(a.n ?? []);
        if (err) throw new ApiError(err, 400);
        const n = (a.n ?? []).map(Number);
        /* この締めで扱っていない商品（前回の数も届けた数もない）に数があるときは申告できない */
        const extra = STOCK_IDS.findIndex((id, i) => n[i] > 0 && !sheet.rows.some((x) => x.productId === id));
        if (extra >= 0) throw new ApiError(`${STOCK_PROD[extra]} はこの月度にお届けしていない商品です。数をお確かめください`, 400);
        rows = sheet.rows.map((x) => ({ productId: x.productId, actual: n[STOCK_IDS.indexOf(x.productId)] ?? 0, disposed: 0, arrived: 0 }));
      }
      if (!cand) throw new ApiError('報告した方をお選びください。', 400);
      const accountId = accountOf(a.who);
      const sc: StockCheck = domainReport.actions.fileStock(repo, { branchId: s.id, period: a.m, site: 'corp', accountId, rows, name: cand.name });
      repo.put<StockBy>(K.stockBy, sc.id, { id: sc.id, at: sc.checkedOn, accountId, who: cand.name });
      return { ok: true };
    },
    /** 購入制限をかける／解除する */
    toggleLimit: (repo, a: { who: Who; id: string }) => {
      const ids = sitesOf(repo, a.who, corpOf(repo, a.who)).map((s) => s.id);
      const u = domainApp.queries.user(repo, { id: a.id });
      if (!u || !ids.includes(u.branchId)) throw new ApiError('ユーザーが見つかりません', 404);
      return domainApp.actions.setLimit(repo, { id: u.id, limit: u.limit === '購入不可' ? 'なし' : '購入不可' });
    },
    /** 申込フォーム（ログイン前の新規のお申し込み）の「登録」。共通データの新規申込に受付中の申込を1件書く */
    submitApply: (repo, a: ApplySubmit) => submitApply(repo, a),
  },
});
