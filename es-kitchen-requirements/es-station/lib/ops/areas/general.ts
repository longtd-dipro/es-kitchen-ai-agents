import { ApiError } from '@/lib/api/errors';
import { addDays, nowStamp, today } from '@/lib/supplier/dates';
import account from '@/lib/domain/areas/account';
import carrier, { type CoolerInput } from '@/lib/domain/areas/carrier';
import { importantMail } from '@/lib/domain/mails';
import { notify, partnerTo } from '@/lib/domain/notify';
import master, { type MasterKind as DmKind } from '@/lib/domain/areas/master';
import notice from '@/lib/domain/areas/notice';
import app from '@/lib/domain/areas/app';
import referral, { setContractSource } from '@/lib/domain/areas/referral';
import type { Account, AppUser, AppVersion, BillingSettings, Carrier, Contact, Cooler, Driver, FeePlan as DFeePlan, Site, TaxRate } from '@/lib/domain/types';
import { defineArea, type DocRepo, type Seed } from '../core/area';
import {
  condSig, normalizeFee, payTotals, refEnd, refStatus, snapCond, todayIso,
  validateAgency, validateFee, validateNotice, validatePay, validateRef, ymJa,
} from '../general/logic';
import { dmAgencyOf, dmPlanOf, planOf, refContracts, refDataOf, refMetas } from '../general/referral';
import { dashFavOf, dashLineOf, dashOf, favOf, salesOf, type FavArgs, type SalesArgs } from '../general/sales';
import { topAlerts, topSchedule } from '../general/top';
import {
  announcementOf, genRowsFromDomain, noticeOf, opsRowOf, siteMaint,
} from '../general/fromDomain';
import { deleteProduct, productBlockers, productDetail, productImpactOf, productMasters, saveProduct, type ProductInput, type SaveOpts } from '../general/product';
import * as S from '../general/seed';
import type { Product as DProduct } from '@/lib/domain/types';
import type { AgencyRow, DashFavArgs, DashLineArgs, FeePlan, GenKey, GenRow, MaintState, NoticeDetail, NoticeForm, SupplierApp } from '../general/types';
import { yen } from '@/lib/format/money';
import { allSuppliers } from '@/mocks/supplier/suppliers';
import { withMainContact } from '@/lib/supplier/view';
import { applyDetail, applyOf, getSupplierRec, listSuppliers, SUPPLIERS, supplierRow, type SupplierRec } from '../general/suppliers';
import { taxRateOpts } from '@/lib/domain/tax';
import { DEFAULT_BY, deleteGen, esFeesOf, genFormOpts, genHistory, genRec, saveGen, sendPassword, type SaveArgs } from '../general/masterRecs';
import { addPartnerHistory } from '@/lib/domain/partnerHistory';
import type { MKey } from '../general/masterForms';

/*
 * 一覧だけの画面の行は共通データ（dm.*）から作る（lib/ops/general/fromDomain.ts）。書き換えは共通データの領域の action を通す。
 *   アカウント一覧のユーザー（アプリの利用者）＝dm.app.users、
 *   代理・紹介管理＝dm.referral.*・dm.org.agencies（lib/ops/general/referral.ts）、
 *   売上管理・お気に入り・ダッシュボード＝dm.app.*（lib/ops/general/sales.ts）
 * 共通データにない列・画面（お知らせのメール設定・アプリのメンテナンス）は、いままでどおり general.* に持つ。
 * 仕入先（一覧・申込・承認）は共通 DB の suppliers（仕入先サイトと同じ。lib/ops/general/suppliers.ts）。
 *
 * 領域 general：ダッシュボード・一覧だけの画面（商品・資材・配送関連・仕入先・アカウント・権限・お知らせ・設定）・
 * 代理・紹介管理・売上管理・お気に入り・平均単価の目標。
 * 元：10_運営_まとめ.html 本体（main_script2・main_script5）
 */
const K = {
  gen: (key: GenKey) => `general.${key}`,
  noticeDetail: 'general.noticeDetail',
  supplierApp: 'general.supplierApp',
  maint: 'general.maint',
};
/** 操作した人（運営のログインユーザー） */
const ME = 'にっしぐち';
/** 共通データに書くときの操作したアカウントの既定（ログインのない mock のときだけ。lib/ops/general/masterRecs.ts） */
const OPS_ID = DEFAULT_BY;
/** 操作したアカウント（変更履歴の変更者）。サーバーは lib/server/access.ts の gate がログイン中のアカウントを args.by に入れる */
type By = { by?: string };
const actor = (a: unknown): string => { const b = (a as By | null | undefined)?.by; return typeof b === 'string' && b ? b : OPS_ID; };

const uidDocs = (rows: GenRow[]) => rows.map((data) => ({ id: data._uid, data }));
const one = <T>(id: string, data: T) => [{ id, data }];

function seed(): Seed {
  return {
    [K.gen('product')]: uidDocs(S.GEN_PRODUCT),
    [K.gen('consign')]: uidDocs(S.GEN_CONSIGN),
    [K.gen('warehouse')]: uidDocs(S.GEN_WAREHOUSE),
    /* product・consign・warehouse・notices の行は、共通データにない列を重ねるためだけに読む（ID で引く） */
    /* 仕入先は共通 DB の suppliers（kind db.suppliers・lib/ops/general/suppliers.ts）。メモリの DocRepo のときだけ見本を入れる（SQLite では seedDocs が入れない） */
    [SUPPLIERS]: allSuppliers().map((data) => ({ id: data.id, data })),
    [K.gen('notices')]: uidDocs(S.NOTICES),
    [K.noticeDetail]: Object.entries(S.NOTICE_DETAIL).map(([id, data]) => ({ id, data })),
    [K.maint]: one('state', S.MAINT),
  };
}

/* ---------- 読み取りの道具 ---------- */
const genRows = (repo: DocRepo, key: GenKey) => repo.list<GenRow>(K.gen(key));

/** 代理・紹介管理の全部（画面で絞り込み・計算する。共通データから作る） */
const refData = (repo: DocRepo) => refDataOf(repo);
export type RefData = ReturnType<typeof refData>;
/** 代理・紹介の履歴は名前で残す：ログイン中のアカウントの名前（args.by がないログインのない mock は見本の名前） */
const stamp = (repo: DocRepo, a?: unknown) => {
  const id = (a as By | null | undefined)?.by;
  return { at: nowStamp(), by: typeof id === 'string' && id ? repo.get<Account>('dm.account.accounts', id)?.name ?? id : ME };
};

/** 一覧の行（共通データから。仕入先は共通 DB の suppliers） */
const listRows = (repo: DocRepo, key: GenKey, tab?: number) => genRowsFromDomain(repo, key, tab ?? 0) ?? genRows(repo, key);

/** 一覧の行の削除。共通データに削除がないものは、それぞれの止め方にする */
function deleteFromDomain(repo: DocRepo, key: GenKey, uid: string, by: string) {
  const upd = (kind: DmKind, patch: Record<string, unknown>) => master.actions.update(repo, { kind, id: uid, patch, by });
  switch (key) {
    case 'product': return deleteProduct(repo, uid, OPS_ID), true;
    /* 委託配送先・倉庫・配送スタッフ・仕入先は論理削除（削除済）。使用中は 409（E241〜E244）・アカウントは止める（lib/ops/general/masterRecs.ts） */
    case 'consign': case 'warehouse': case 'driver': case 'supplier': return deleteGen(repo, key, uid, by), true;
    case 'cooler': {
      const c = repo.get<Cooler>('dm.carrier.coolers', uid);
      if (!c) throw new ApiError('データが見つかりません', 404);
      return carrier.actions.setCooler(repo, { id: uid, status: '廃棄', memo: c.memo, by }), true;
    }
    case 'perm': return account.actions.removeRole(repo, { id: uid, by }), true;
    case 'version': return account.actions.removeAppVersion(repo, { id: uid, by }), true;
    case 'ip': return account.actions.removeIp(repo, { id: uid, by }), true;
    case 'notices': return stopNotice(repo, uid, '削除済'), true;
    case 'accounts':
      /* ユーザー（アプリの利用者）は dm.app.users */
      if (repo.get<AppUser>('dm.app.users', uid)) return app.actions.setStatus(repo, { id: uid, status: '削除済' }), true;
      if (!repo.get<Account>('dm.account.accounts', uid)) return false;
      return account.actions.setStatus(repo, { id: uid, status: '削除済', by }), true;
    default: return false;
  }
}

/** お知らせを止める（削除済・配信停止）：共通データは昨日で公開を終わらせ、運営の行に状態と止めたときの期間を残す */
function stopNotice(repo: DocRepo, id: string, status: '削除済' | '配信停止') {
  const n = noticeOf(repo, id);
  if (!n) return;
  const yest = addDays(today(), -1);
  /* 公開前のお知らせは publishTo が publishFrom より前になり、どのサイトにも出ない */
  const publishTo = !n.a.publishTo || n.a.publishTo > yest ? yest : n.a.publishTo;
  notice.actions.saveAnnouncement(repo, { ...n.a, publishTo });
  putNoticeRow(repo, id, { ...n.row, status, period: n.row.period });
}
/** 運営の行（共通データにない列：最終更新日・配信日時・止めた状態） */
function putNoticeRow(repo: DocRepo, id: string, row: GenRow) {
  const o = opsRowOf(repo, 'notices', id);
  const _uid = o?._uid ?? 'n' + id;
  const { tgsTxt: _t, sites: _s, ...rest } = row;
  repo.put<GenRow>(K.gen('notices'), _uid, { ...rest, _uid, id });
}

export default defineArea({
  name: 'general',
  seed,
  queries: {
    /** 一覧だけの画面の行。accounts は tab（タブの番号）で絞る */
    genList: (repo, { key, tab }: { key: GenKey; tab?: number }) => listRows(repo, key, tab),
    /** 商品マスタ詳細・編集（id＝品番）。商品と変更履歴。削除済み・ないときは null */
    product: (repo, { id }: { id: string }) => productDetail(repo, id),
    /** 商品マスタの画面で選ぶもの（カテゴリ・税率・商品タグ・ピッキング倉庫・自販機の機種・資材・仕入先・次の品番） */
    productMasters: (repo) => productMasters(repo),
    /** 税率の選択肢（全画面の税率ドロップダウン app/ops/_ui/TaxRateSelect.tsx） */
    taxRates: (repo) => taxRateOpts(repo),
    /** 商品の保存の前の確認（価格の変更方法を選ぶか・出せなくなる拠点） */
    productImpact: (repo, { id, data }: { id: string; data: ProductInput }) => productImpactOf(repo, id, data),
    /** 商品を削除・無効にできない理由（有効なメニューに入っている・在庫がある。受付簿 #232・#268） */
    productBlockers: (repo, { id }: { id: string }) => productBlockers(repo, id),
    /** 仕入先・委託配送先・倉庫・配送スタッフの詳細・編集の値（ないときは null。lib/ops/general/masterRecs.ts） */
    genRec: (repo, { key, id }: { key: MKey; id: string }) => genRec(repo, key, id),
    /** 登録の画面の選択肢（所属先・運営している委託配送会社） */
    genFormOpts: (repo, { key }: { key: MKey }) => genFormOpts(repo, key),
    /** 仕入先・委託配送先・倉庫・配送スタッフの変更履歴（新しい順。詳細の「変更履歴」タブ） */
    genHistory: (repo, { key, id }: { key: MKey; id: string }) => genHistory(repo, key, id),
    /** 委託配送先の ES配送費（詳細の「ES配送費」タブ。key は権限のため 'consign'） */
    esFees: (repo, { id }: { key: 'consign'; id: string }) => esFeesOf(repo, id),
    /** 仕入先の申込の内容（AW_SUPP_007：申込フォームの項目を全部）。申込中でなければ null */
    supplierAppDetail: (repo, { id }: { id: string }) => {
      const s = getSupplierRec(repo, id);
      return s && s.status === '申込中' ? { id: s.id, name: s.name, items: applyDetail(s) ?? [] } : null;
    },
    /** 仕入先の申込（申込中の仕入先） */
    supplierApps: (repo) => listSuppliers(repo).filter((s) => s.status === '申込中').map((s) => ({ row: supplierRow(s), app: applyOf(s) ?? repo.get<SupplierApp>(K.supplierApp, s.id) ?? null })),
    /** お知らせ1件（一覧の行と詳細）。id＝お知らせID */
    notice: (repo, { id }: { id: string }) => {
      const n = noticeOf(repo, id);
      /* 送信の記録（登録・更新・メール送信の予約）と、メールだけのお知らせか（課題 5-4） */
      return n ? { row: n.row, detail: n.detail, important: n.a.important, sendLog: n.a.sendLog ?? [], mailOnly: !n.a.sites.length && !!n.a.mail } : null;
    },
    /**
     * お知らせのメールのおすすめの送信日時（2026-10-03 決定）：公開開始日の 8:00（重要なお知らせの自動のメールと同じ）。
     * 法人・拠点あてがあれば、その日がお客様の休み（土日・全社の祝日）なら前の営業日の 8:00。過ぎていれば今
     */
    noticeMailAt: (repo, { start, corp }: { start: string; corp: boolean }) =>
      /^\d{4}[/-]\d{2}[/-]\d{2}/.test(start ?? '') ? importantMail(repo, { title: '', sites: corp ? ['corp'] : [], publishFrom: start.slice(0, 10).replace(/-/g, '/') }).sendAt : '',
    /** アプリ（iOS・Android）のメンテナンスは共通データにないので general.maint。サイトのメンテナンスは dm.account.siteSettings */
    maint: (repo) => ({ ...(repo.get<MaintState>(K.maint, 'state') as MaintState), sites: siteMaint(repo) }),
    /** 保冷バッグ台帳のモーダルの選択肢：委託配送先（自社を除く）と配送スタッフ */
    coolerForm: (repo) => ({
      carriers: repo.list<Carrier>('dm.master.carriers').filter((c) => c.kind !== '自社').map((c) => ({ id: c.id, name: c.name, status: c.status })),
      drivers: repo.list<Driver>('dm.master.drivers').map((d) => ({ id: d.id, name: d.name, carrierId: d.carrierId, status: d.status })),
    }),
    refData,
    /** 売上管理・お気に入り・ダッシュボード（共通データ dm.app.*。lib/ops/general/sales.ts） */
    sales: (repo, a?: SalesArgs) => salesOf(repo, a),
    fav: (repo, a?: FavArgs) => favOf(repo, a),
    dash: (repo) => dashOf(repo),
    dashLine: (repo, a?: DashLineArgs) => dashLineOf(repo, a),
    dashFav: (repo, a?: DashFavArgs) => dashFavOf(repo, a),
    /** 運営トップのアラート一覧（REQ-UI-001。共通データから。0件の項目は出さない） */
    topAlerts: (repo) => topAlerts(repo),
    /** 運営トップのスケジュール（REQ-UI-002。ES サイクルの4週間／1ヶ月・前後へ） */
    topSchedule: (repo, a?: { at?: string }) => topSchedule(repo, a),
  },
  actions: {
    /** 一覧の行の削除。状態のある行は「削除済」にして残す（論理削除）、ない行（IP など）は消す */
    deleteRow: (repo, a: { key: GenKey; uid: string } & By) => {
      const { key, uid } = a;
      if (deleteFromDomain(repo, key, uid, actor(a))) return;
      const kind = K.gen(key), r = repo.get<GenRow>(kind, uid);
      if (!r) throw new ApiError('データが見つかりません', 404);
      if ('status' in r) repo.put(kind, uid, { ...r, status: '削除済' });
      else repo.remove(kind, uid);
    },
    /** 商品マスタの登録・保存（id がなければ新規）。共通データの master.create / update で変更履歴を残す */
    /** 商品の登録・更新。opts＝価格の変更方法（公開したメニューにある商品）・法人への通知・出せなくなる拠点の確認（先に productImpact で聞く） */
    /* 商品の状態「有効」⇔「無効」は編集の「状態」欄（saveProduct の data.status。受付簿 #278・#279）。一覧の「無効にする」ボタンは作らない */
    saveProduct: (repo, a: { id?: string; data: ProductInput; opts?: SaveOpts; baseVersion?: string; force?: boolean } & By) => saveProduct(repo, { id: a.id, data: a.data, by: actor(a), opts: a.opts, baseVersion: a.baseVersion, force: a.force }),
    /** 商品タグ・税率をドロップダウンからその場で足す・消す（使っている商品があれば消せない＝409） */
    addProductTag: (repo, { name }: { name: string }) => master.actions.addProductTag(repo, { name }),
    removeProductTag: (repo, { id }: { id: string }) => master.actions.removeProductTag(repo, { id }),
    addTaxRate: (repo, { label, rate }: { label: string; rate: number }) => master.actions.addTaxRate(repo, { label, rate }),
    removeTaxRate: (repo, { id }: { id: string }) => master.actions.removeTaxRate(repo, { id }),
    updateTaxRate: (repo, { id, label, rate }: { id: string; label: string; rate: number }) => master.actions.updateTaxRate(repo, { id, label, rate }),
    /** 仕入先・委託配送先・倉庫・配送スタッフの登録・保存（id がなければ新規）。返り値＝ID・版（E31） */
    saveGen: (repo, a: SaveArgs) => saveGen(repo, { ...a, by: actor(a) }),
    /** 仕入先・委託配送先・配送スタッフのパスワード送信（パスワード設定の案内。Q173 → S173） */
    genSendPassword: (repo, a: { key: MKey; id: string } & By) => sendPassword(repo, a.key, a.id, actor(a)),
    /** 仕入先の申込を承認（アカウントを発行） */
    supplierApprove: (repo, a: { id: string } & By) => {
      const { id } = a, by = actor(a);
      /* 共通 DB の仕入先（仕入先サイトが読む suppliers）を本登録にする＝運営が作った仕入先と同じ置き場・同じ ID でログインできる（課題 11） */
      const s = getSupplierRec(repo, id);
      if (!s) throw new ApiError('仕入先が見つかりません', 404);
      repo.put<SupplierRec>(SUPPLIERS, id, withMainContact({ ...s, status: '本登録', since: s.since || today() }));
      addPartnerHistory(repo, 'suppliers', id, '申込を承認（アカウントを発行）', by);
      /* 仕入先サイトのアカウントを共通データに発行する（もうあれば何もしない） */
      if (!repo.get<Account>('dm.account.accounts', id)) {
        account.actions.create(repo, {
          account: { id, site: 'supplier', loginId: id, name: s.name, email: s.mail, roleIds: ['supplier.staff'], scope: { type: 'supplier', supplierId: id } }, by,
        });
      }
      return { name: s.name };
    },
    /**
     * 仕入先・委託配送先のアカウント一括発行（運営Web の一覧で選んだ行。受付簿 #62・台帳 E）。
     * 発行した人には ログイン案内（account_issued。法人の発行・委託配送先Web のスタッフの発行と同じ文面）をサイトのお知らせとメールで送る。
     * 飛ばす：発行済み・メールアドレスなし・無効の委託配送先・申込中／却下の仕入先（申込中は「申込を確認する」の承認から）
     */
    issueAccounts: (repo, a: { key: 'consign' | 'supplier'; ids: string[] } & By) => {
      const { key, ids } = a, by = actor(a);
      const site: Site = key === 'supplier' ? 'supplier' : 'carrier';
      const issued: { id: string; name: string; email: string }[] = [];
      const skipped: { id: string; name: string; reason: string }[] = [];
      for (const id of [...new Set(ids)]) {
        let name = '', email = '', why = '';
        if (key === 'consign') {
          const c = repo.get<Carrier>('dm.master.carriers', id);
          const ct = repo.list<Contact>('dm.org.contacts').find((x) => x.owner.type === 'carrier' && x.owner.id === id && x.kind === 'メイン担当者');
          if (!c) why = '委託配送先が見つかりません';
          else if (c.status !== '有効') why = '無効';
          else { name = c.name; email = ct?.email ?? ''; }
        } else {
          const s = getSupplierRec(repo, id);
          if (!s) why = '仕入先が見つかりません';
          else if (s.status === '申込中') why = '申込中（承認で発行）';
          else if (s.status === '却下') why = '却下';
          else if (s.status === '削除済') why = '無効';
          else { name = s.name; email = s.mail || s.contacts?.find((c) => c.kind === 'メイン担当者')?.mail || s.contacts?.[0]?.mail || ''; }
        }
        const acc = repo.get<Account>('dm.account.accounts', id);
        /* 理由は E240 のモーダルの表の文言（無効／発行済み／メールアドレスがない／申込中（承認で発行）／却下。台帳 F 2026-10-06） */
        if (!why && acc && acc.status !== '削除済') why = '発行済';
        if (!why && !email) why = 'メールアドレスがない';
        if (why) { skipped.push({ id, name, reason: why }); continue; }
        try {
          if (acc) account.actions.setStatus(repo, { id, status: '発行済（ログイン前）', by });
          else account.actions.create(repo, {
            account: key === 'consign'
              ? { id, site, loginId: id, name, email, roleIds: ['carrier.admin'], scope: { type: 'carrier', carrierId: id } }
              : { id, site, loginId: id, name, email, roleIds: ['supplier.staff'], scope: { type: 'supplier', supplierId: id } },
            by,
          });
        } catch (e) { skipped.push({ id, name, reason: e instanceof ApiError ? e.message : String(e) }); continue; }
        /* 仕入先は本登録に（アカウントがある＝仕入先サイトにログインできる） */
        if (key === 'supplier') { const s = getSupplierRec(repo, id)!; repo.put<SupplierRec>(SUPPLIERS, id, withMainContact({ ...s, status: '本登録', since: s.since || today() })); }
        notify(repo, {
          ...partnerTo(repo, site, id), templateId: 'account_issued', link: { type: '', id: '' },
          title: 'ES Station のアカウントを発行しました（ログインのご案内）',
          body: `${name} 御中\n${site === 'supplier' ? '仕入先サイト' : '委託配送先Web'}のアカウント（ログインID ${id}）を発行しました。初回ログインのときにパスワードを決めてください。`,
        });
        issued.push({ id, name, email });
      }
      return { issued, skipped };
    },
    /** 仕入先の申込を却下（理由をメールで知らせる） */
    supplierReject: (repo, a: { id: string; reason: string } & By) => {
      const { id, reason } = a;
      const s = getSupplierRec(repo, id);
      if (!s) throw new ApiError('仕入先が見つかりません', 404);
      if (!reason?.trim()) throw new ApiError('理由は必須項目です。', 400); /* E01 */
      if ([...reason.trim()].length > 500) throw new ApiError('500文字以内で入力してください。', 400); /* E04 */
      repo.put<SupplierRec>(SUPPLIERS, id, { ...s, status: '却下' });
      addPartnerHistory(repo, 'suppliers', id, '申込を却下', actor(a));
      return { name: s.name };
    },
    /** お知らせの登録・保存。id がなければ新規。返り値＝お知らせID と状態 */
    saveNotice: (repo, { id, form }: { id?: string; form: NoticeForm }) => {
      const e = validateNotice(form);
      if (Object.keys(e).length) throw new ApiError('入力内容を確認してください', 400);
      const cur = id ? noticeOf(repo, id) : null;
      if (id && !cur) throw new ApiError('お知らせが見つかりません', 404);
      const data = announcementOf(form, cur?.a);
      /* 課題 5-4：メールだけのお知らせは置ける（サイトには出さない）。アプリユーザーだけのお知らせはまだ置けない */
      if (!data.sites.length && !data.mail) throw new ApiError('ESSへのお知らせ（法人・拠点・委託配送先・配送スタッフ・仕入先のどれか）を選ぶか、メールで送る設定にしてください。アプリユーザーだけのお知らせはまだ共通データに置けません', 400);
      const a = notice.actions.saveAnnouncement(repo, { ...data, ...(id ? { id } : {}) });
      const { tg, start, end, files, body, subj, mailAt, mailBody, sign } = form;
      /* 件名・メール本文の既定値はタイトル・本文（hong 2026-10-05）。署名欄は設定値と同じなら持たない */
      repo.put<NoticeDetail>(K.noticeDetail, a.id, { tg, start, end, files, body, subj: subj || form.title, mailAt, mailBody: mailBody || body, ...(sign ? { sign } : {}) });
      const n = noticeOf(repo, a.id)!;
      const how = String(n.row.how);
      const prev = cur?.row.status;
      const row: GenRow = {
        ...n.row, upd: today().replace(/\//g, '-') + ' ' + nowStamp().slice(11),
        send: (how !== 'ESSのみ' ? form.mailAt || form.start : form.start).replace(/\//g, '-'),
        status: prev === '配信停止' || prev === '削除済' ? prev : n.row.status,
      };
      putNoticeRow(repo, a.id, row);
      if (row.status === '配信停止' || row.status === '削除済') stopNotice(repo, a.id, row.status);
      return { id: a.id, status: String(row.status) };
    },
    /** お知らせの削除（削除済として残す。共通データは公開を終わらせる） */
    deleteNotice: (repo, { id }: { id: string }) => { stopNotice(repo, id, '削除済'); },
    /** メンテナンスの開始・終了 */
    /** 開始のときは案内（タイトル・説明内容）も受け取る（開始のモーダルで直した値。保存した案内を初期値に出す） */
    maintToggle: (repo, { k, on, title, body }: { k: 'ios' | 'android'; on: boolean; title?: string; body?: string }) => {
      const m = repo.get<MaintState>(K.maint, 'state') as MaintState;
      if (on && (title !== undefined || body !== undefined) && (!title?.trim() || !body?.trim())) throw new ApiError('タイトルと説明内容は必須項目です。', 400);
      const text = on && title !== undefined && body !== undefined ? { title: title.trim(), body: body.trim() } : {};
      repo.put(K.maint, 'state', { ...m, [k]: { ...m[k], ...text, on } });
    },
    /** メンテナンスの案内（タイトル・説明内容）の編集。メンテナンス中でも直せる */
    maintEdit: (repo, { k, title, body }: { k: 'ios' | 'android'; title: string; body: string }) => {
      if (!title?.trim() || !body?.trim()) throw new ApiError('タイトルと説明内容は必須項目です。', 400);
      const m = repo.get<MaintState>(K.maint, 'state') as MaintState;
      repo.put(K.maint, 'state', { ...m, [k]: { ...m[k], title: title.trim(), body: body.trim() } });
    },
    /** サイト（法人Web・委託配送先Web など）のメンテナンス＝共通データ */
    siteMaintToggle: (repo, a: { site: Site; on: boolean; message: string } & By) =>
      account.actions.setMaintenance(repo, { site: a.site, on: a.on, message: a.message, by: actor(a) }),

    /* ---------- 一覧の画面から共通データへの書き換え（登録・編集の画面が使う） ---------- */
    /** 商品・資材・倉庫・委託配送先の登録・更新（共通データの項目の名前で渡す） */
    saveMaster: (repo, a: { kind: 'products' | 'warehouses' | 'carriers'; id: string; patch: Record<string, unknown>; isNew?: boolean } & By) => {
      const { kind, id, patch, isNew } = a, by = actor(a);
      return isNew ? master.actions.create(repo, { kind, data: { ...patch, id }, by }) : master.actions.update(repo, { kind, id, patch, by });
    },
    /** 配送スタッフの基本情報・状態 */
    saveDriver: (repo, a: { id: string } & Partial<Pick<Driver, 'name' | 'kana' | 'tel' | 'email' | 'status'>> & By) => master.actions.updateDriver(repo, { ...a, by: actor(a) }),
    setDriverStatus: (repo, a: { id: string; status: Driver['status'] } & By) => master.actions.setDriverStatus(repo, { id: a.id, status: a.status, by: actor(a) }),
    /** 保冷バッグ台帳の貸与の記録の登録・編集（AW_COOL_002。削除はない：廃棄は状態） */
    createCooler: (repo, a: CoolerInput & By) => carrier.actions.createCooler(repo, { ...a, by: actor(a) }),
    updateCooler: (repo, a: CoolerInput & { id: string } & By) => carrier.actions.updateCooler(repo, { ...a, by: actor(a) }),
    /** 保冷バッグの状態（紛失・廃棄・返却） */
    setCooler: (repo, a: { id: string; status: Cooler['status']; memo: string } & By) => carrier.actions.setCooler(repo, { ...a, by: actor(a) }),
    /** アカウントの発行・状態・役割 */
    createAccount: (repo, a: { account: Omit<Account, 'issuedAt' | 'lastLoginAt' | 'status'> } & By) => account.actions.create(repo, { account: a.account, by: actor(a) }),
    setAccountStatus: (repo, a: { id: string; status: Account['status'] } & By) => account.actions.setStatus(repo, { id: a.id, status: a.status, by: actor(a) }),
    setAccountRoles: (repo, a: { id: string; roleIds: string[] } & By) => account.actions.setRoles(repo, { id: a.id, roleIds: a.roleIds, by: actor(a) }),
    /** IP ホワイトリストの追加（運営・システム管理に効かせる） */
    addIp: (repo, a: { ip: string; note: string; sites?: Site[] } & By) =>
      account.actions.addIp(repo, { cidr: a.ip, note: a.note, sites: a.sites ?? ['ops', 'sysadmin'], by: actor(a) }),
    /** IP ホワイトリストの編集（IPアドレス・管理用備考） */
    updateIp: (repo, a: { id: string; ip: string; note: string } & By) => account.actions.updateIp(repo, { id: a.id, cidr: a.ip, note: a.note, by: actor(a) }),
    /** アプリのバージョン（強制アップデート） */
    saveVersion: (repo, a: { os: 'IOS' | 'iOS' | 'Android'; ver: string; force: boolean; note: string; isNew?: boolean } & By) =>
      account.actions.setAppVersion(repo, { os: (a.os === 'Android' ? 'Android' : 'iOS') as AppVersion['os'], version: a.ver, force: a.force, note: a.note, by: actor(a), create: a.isNew }),

    /* ---------- 代理・紹介管理（共通データ dm.referral.*・dm.org.agencies） ---------- */
    /** 代理店の登録・保存。返り値＝代理店ID */
    saveAgency: (repo, a: { mode: 'new' | 'edit'; agency: AgencyRow } & By) => {
      const { mode, agency } = a;
      if (Object.keys(validateAgency(agency)).length) throw new ApiError('入力内容を確認してください', 400);
      return referral.actions.saveAgency(repo, { agency: dmAgencyOf(agency), isNew: mode === 'new', ...stamp(repo, a) });
    },
    /** 紹介フィーマスタの登録・保存。返り値＝ID・適用済みの紹介の数・条件が変わったか */
    saveFeePlan: (repo, a: { mode: 'new' | 'edit'; plan: FeePlan } & By) => {
      const { mode, plan } = a;
      if (Object.keys(validateFee(plan)).length) throw new ApiError('入力内容を確認してください', 400);
      const p = { ...normalizeFee(plan), updated: today().replace(/\//g, '-') };
      const old = mode === 'edit' ? repo.get<DFeePlan>('dm.referral.feePlans', p.id) : undefined;
      if (mode === 'edit' && !old) throw new ApiError('紹介フィーマスタが見つかりません', 404);
      const res = referral.actions.saveFeePlan(repo, { plan: dmPlanOf(mode === 'new' ? { ...p, id: '' } : p, old), isNew: mode === 'new', ...stamp(repo, a) });
      return { id: res.id, users: res.users, condChg: !!old && condSig(planOf(old)) !== condSig(p) };
    },
    /** 代理店・紹介フィーマスタの削除（使われていれば理由を返して消さない）。削除済として残す */
    deleteRef: (repo, { kind, id }: { kind: 'agency' | 'feeplan'; id: string }) => {
      if (kind === 'agency') referral.actions.deleteAgency(repo, { id });
      else referral.actions.deleteFeePlan(repo, { id });
    },
    /** 紹介履歴の保存（紹介フィープラン・支払い開始年月・備考）。終了予定月・状態を計算し直す */
    saveReferral: (repo, a: { contract: string; plan: string; payStart: string; note: string } & By) => {
      const { contract, plan, payStart, note } = a;
      const c = refContracts(repo).find((x) => x.id === contract), m = refMetas(repo)[contract];
      if (!c || !m) throw new ApiError('紹介履歴が見つかりません', 404);
      if (Object.keys(validateRef({ plan, payStart }, c)).length) throw new ApiError('入力内容を確認してください', 400);
      const plans = repo.list<DFeePlan>('dm.referral.feePlans').map(planOf), old = plans.find((x) => x.id === m.plan), np = plans.find((x) => x.id === plan);
      const chg = m.plan !== plan;
      const cond = chg ? snapCond(np) : m.cond || snapCond(np);
      const p = { ...np, ...(cond || {}) } as FeePlan;
      const endPlan = payStart ? refEnd(p, payStart) : m.endPlan;
      /* 中止中は状態・終了月を計算し直さない（取り消すまで中止のまま） */
      const { status, end } = m.status === '中止' ? { status: '中止', end: m.end } : refStatus(c, endPlan);
      const what = [old?.id !== p.id ? `紹介フィープランを「${old?.name} → ${p.name}」に変更` : '', m.payStart !== payStart ? `支払い開始年月を「${ymJa(m.payStart) || '—'} → ${ymJa(payStart) || '—'}」に変更` : ''].filter(Boolean).join('、') || '備考を更新';
      return referral.actions.saveReferral(repo, {
        contractId: contract, patch: { feePlanId: plan, cond: cond as never, payStart, note, endPlan, status: status as never, end }, what, ...stamp(repo, a),
      });
    },
    /** 支払履歴の一括変更（支払状況・支払日）。調整額・処理方法・備考は変えない。支払済にするときは支払日が要る */
    bulkPayments: (repo, a: { ids: string[]; status: string; date?: string } & By) => {
      const { ids, status } = a;
      const date = (a.date ?? '').replace(/\//g, '-');
      if (!Array.isArray(ids) || !ids.length) throw new ApiError('支払を選択してください', 400);
      if (!['未払い', '支払済', '対象外'].includes(status)) throw new ApiError('支払状況を選択してください', 400);
      if (Object.keys(validatePay(status, date)).length) throw new ApiError('支払済の場合は支払日を入力してください', 400);
      const all = refDataOf(repo).payments;
      const target = ids.map((id) => all.find((x) => x.id === id));
      if (target.some((x) => !x)) throw new ApiError('支払履歴が見つかりません', 404);
      for (const p of target as NonNullable<(typeof target)[number]>[]) {
        referral.actions.savePayment(repo, {
          id: p.id, status: status as '未払い' | '支払済' | '対象外', paidOn: status === '支払済' ? date.replace(/-/g, '/') : '', note: p.note, adj: p.lines.map((l) => +l.adj || 0),
          what: `一括で支払状況を「${status}」に変更`, ...stamp(repo, a),
        });
      }
      return { n: target.length };
    },
    /**
     * 紹介履歴の手での登録（紹介元が法人のとき・承認の後の後付け）。代理店コードのある親契約からは作らない（親契約から自動で作る）。
     * 紹介元の法人・親契約・支払い開始年月・紹介フィープラン（紹介元区分＝法人の有効なプラン）・備考
     */
    createReferral: (repo, a: { contract: string; srcCorp: string; payStart: string; plan: string; note: string } & By) => {
      const c = refContracts(repo).find((x) => x.id === a.contract);
      if (!c) throw new ApiError('親契約が見つかりません', 404);
      if (c.agent) throw new ApiError('代理店コードのある親契約には、手で紹介履歴を作れません（親契約の代理店コードから自動で作ります）', 409);
      if (refMetas(repo)[a.contract]) throw new ApiError('この親契約にはすでに紹介履歴があります', 409);
      if (!a.srcCorp) throw new ApiError('紹介元の法人を選択してください', 400);
      const np = repo.list<DFeePlan>('dm.referral.feePlans').map(planOf).find((x) => x.id === a.plan && x.src === '法人' && x.status === '有効');
      if (!np) throw new ApiError('紹介フィープランを選択してください（紹介元区分が「法人」の有効なプラン）', 400);
      if (Object.keys(validateRef({ plan: a.plan, payStart: a.payStart }, c)).length) throw new ApiError('入力内容を確認してください', 400);
      const st = stamp(repo, a);
      setContractSource(repo, { contractId: a.contract, agencyId: '', srcCorpId: a.srcCorp, payStart: a.payStart, note: a.note, by: st.by, at: st.at });
      const x = refMetas(repo)[a.contract];
      const endPlan = a.payStart ? refEnd(np, a.payStart) : '';
      const { status, end } = refStatus(c, endPlan);
      referral.actions.saveReferral(repo, { contractId: a.contract, patch: { feePlanId: a.plan, cond: snapCond(np) as never, payStart: a.payStart, note: a.note, endPlan, status: status as never, end }, what: '紹介元の法人・紹介フィープランを設定', ...st });
      return { id: x.id };
    },
    /** 紹介の中止（契約の中止ではない）。理由は必須（500文字まで）。中止した年月は今月 */
    stopReferral: (repo, a: { id: string; reason: string } & By) => {
      const reason = String(a.reason ?? '').trim();
      if (!reason) throw new ApiError('理由を入力してください', 400);
      if (reason.length > 500) throw new ApiError('理由は500文字以内で入力してください', 400);
      return referral.actions.stopReferral(repo, { id: a.id, reason, month: todayIso().slice(0, 7), ...stamp(repo, a) });
    },
    /** 紹介の中止の取り消し */
    resumeReferral: (repo, a: { id: string } & By) => referral.actions.resumeReferral(repo, { id: a.id, ...stamp(repo, a) }),
    /** 支払履歴の保存（支払状況・支払日・備考・調整額） */
    savePayment: (repo, a: { id: string; status: string; date: string; note: string; adj: number[]; method?: string } & By) => {
      const { id, status, date, note, adj, method } = a;
      if (method !== undefined && !['振込', '請求値引き'].includes(method)) throw new ApiError('処理方法を選択してください', 400);
      const p = refDataOf(repo).payments.find((x) => x.id === id);
      if (!p) throw new ApiError('支払履歴が見つかりません', 404);
      if (Object.keys(validatePay(status, date)).length) throw new ApiError('支払日は必須項目です。', 400);
      const lines = p.lines.map((l, i) => ({ ...l, adj: +adj[i] || 0 }));
      referral.actions.savePayment(repo, {
        id, method: method as '振込' | '請求値引き' | undefined, status: status as '未払い' | '支払済' | '対象外', paidOn: status === '支払済' ? date.replace(/-/g, '/') : '', note, adj: lines.map((l) => Number(l.adj)),
        what: `支払状況「${status}」・調整合計 ${yen(payTotals({ lines }).adj)} で更新`, ...stamp(repo, a),
      });
    },

    /* ---------- 売上（共通データ dm.app.purchases） ---------- */
    /** 返金（返金中にする） */
    refund: (repo, { no, reason }: { no: string; reason: string }) => { app.actions.refund(repo, { id: no, reason }); },
  },
});
