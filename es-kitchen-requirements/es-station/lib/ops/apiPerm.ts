import { GEN_FEATURES, type PermOp } from '@/lib/ops/permissions';

/*
 * 運営Web の API → 権限の機能・操作（lib/ops/permissions.ts）。サーバー（lib/server/access.ts）が確かめ、画面（app/ops/_ui/perm.ts の useCanAct）がボタンを出し分ける。
 *   機能：API ごとの表（API）→ 引数で決まるもの（kindOf）→ 領域の決まり（AREA）
 *   操作：読み取り（queries）＝閲覧、書き換え（actions）＝表（API の [機能, 操作]）か名前（add…／create…＝作成、delete…／remove…＝削除、ほか＝編集）
 *   読み取りは、その API を使う画面の機能（READ_ALSO）のどれかを閲覧できればよい（一覧の選択肢・ほかの画面のデータを読むため）
 * 新しい API を足したら、ここの表を見直す（表にない領域は「権限付与」＝フル権限だけ）。
 */

type Rule = string | [string, PermOp];

/** 領域の決まりの機能（kind:area） */
const AREA: Record<string, string> = {
  'ops:applications': 'contracts', 'ops:billing': 'collection', 'ops:contracts': 'corps', 'ops:delivery': 'delivery', 'ops:general': 'grant',
  'ops:masters': 'plans', 'ops:menu': 'menu', 'ops:purchasing': 'purchasing', 'ops:reviews': 'engagement',
  'domain:account': 'grant', 'domain:app': 'sales', 'domain:apply': 'contracts', 'domain:batch': 'grant', 'domain:billing': 'collection',
  'domain:bulk': 'contracts', 'domain:carrier': 'delivery', 'domain:delivery': 'delivery', 'domain:master': 'products', 'domain:menu': 'menu',
  'domain:notice': 'notices', 'domain:order': 'orders', 'domain:org': 'corps', 'domain:referral': 'agency', 'domain:report': 'disposal',
  'domain:sample': 'samples', 'domain:stock': 'stockFood', 'domain:survey': 'surveys',
};

/** API ごとの機能・操作（kind:area.op） */
const API: Record<string, Rule> = {
  /* 契約申請管理 */
  'ops:applications.approve': ['contracts', 'approve'], 'ops:applications.reject': ['contracts', 'approve'], 'ops:applications.intakeReject': ['contracts', 'approve'], 'ops:applications.intakeWithdraw': ['contracts', 'approve'],
  'ops:applications.navBadge': 'dashboard',
  'domain:apply.decide': ['contracts', 'approve'],
  /* 請求（集金）・在庫管理（廃棄） */
  'ops:billing.confirmAlert': 'dashboard', 'ops:billing.saveStock': 'disposalInput', 'ops:billing.addStockAdjBulk': ['disposal', 'create'],
  'ops:billing.bulkGrp': ['collection', 'confirm'], 'ops:billing.confirmFix': ['collection', 'confirm'], 'ops:billing.confirmAllFix': ['collection', 'confirm'], 'ops:billing.makeInvoice': ['collection', 'confirm'],
  'ops:billing.dispatch': ['collection', 'confirm'], 'ops:billing.advanceSend': ['collection', 'confirm'],
  'domain:billing.issue': ['collection', 'confirm'], 'domain:billing.advanceSend': ['collection', 'confirm'], 'domain:billing.lockedSkips': 'dashboard',
  /* 法人・拠点・子契約 */
  'ops:contracts.branch': 'branches', 'ops:contracts.branches': 'branches', 'ops:contracts.child': 'contracts', 'ops:contracts.children': 'contracts',
  'ops:contracts.currentChild': 'contracts', 'ops:contracts.parent': 'contracts', 'ops:contracts.trial': 'contracts', 'ops:contracts.extendTrial': 'contracts',
  'ops:contracts.genChildren': ['contracts', 'create'], 'ops:contracts.bulkBillTo': 'contracts',
  /* 所属法人の付け替えはシステム管理（権限付与の編集ができる人）だけ。本導入への切替は親契約の編集（プラン契約管理） */
  'ops:contracts.reassignCorp': ['grant', 'update'], 'ops:contracts.switchToHon': ['contracts', 'update'], 'ops:contracts.corpAccount': ['corps', 'update'], 'ops:contracts.branchAccount': ['branches', 'update'],
  'domain:org.branch': 'branches', 'domain:org.branches': 'branches', 'domain:org.updateBranch': 'branches', 'domain:org.updateBranchNow': 'branches',
  'domain:org.updateReceive': 'branches', 'domain:org.setAppLimits': 'branches',
  'domain:org.contracts': 'contracts', 'domain:org.childContracts': 'contracts', 'domain:org.canceledChildren': 'contracts', 'domain:org.trial': 'contracts',
  'domain:org.addChild': ['contracts', 'create'], 'domain:org.updateChild': 'contracts', 'domain:org.updateContract': 'contracts',
  'domain:org.repriceChildren': 'contracts', 'domain:org.extendTrial': 'contracts', 'domain:org.setMigrationPause': 'contracts', 'domain:org.setBillStatus': 'collection',
  'domain:org.loans': 'rental', 'domain:org.returnLoan': 'rental', 'domain:org.agencies': 'agency',
  'domain:bulk.priceGens': 'plans', 'domain:bulk.addPriceGen': ['plans', 'create'], 'domain:bulk.updatePriceGen': 'plans',
  'domain:bulk.correctPriceGen': 'plans', 'domain:bulk.deletePriceGen': ['plans', 'delete'],
  /* マスタ（運営の一般の画面） */
  'ops:general.dash': 'dashboard', 'ops:general.dashLine': 'dashboard', 'ops:general.dashFav': 'dashboard', 'ops:general.topAlerts': 'dashboard', 'ops:general.topSchedule': 'dashboard',
  'ops:general.product': 'products', 'ops:general.productImpact': 'products', 'ops:general.productBlockers': 'products', 'ops:general.productMasters': 'products', 'ops:general.taxRates': 'products',
  'ops:general.saveProduct': 'products', 'ops:general.addProductTag': 'products', 'ops:general.removeProductTag': 'products',
  /* 税率の追加・削除はシステム管理（権限付与）だけ（台帳 E 2026-10-05） */
  'ops:general.addTaxRate': ['grant', 'create'], 'ops:general.removeTaxRate': ['grant', 'delete'], 'ops:general.updateTaxRate': ['grant', 'update'],
  'ops:general.saveDriver': 'consign', 'ops:general.setDriverStatus': 'consign', 'ops:general.setCooler': 'rental', 'ops:general.createCooler': 'rental', 'ops:general.updateCooler': 'rental', 'ops:general.coolerForm': 'rental',
  'ops:general.supplierApps': 'suppliers', 'ops:general.supplierAppDetail': 'suppliers', 'ops:general.supplierApprove': ['suppliers', 'approve'], 'ops:general.supplierReject': ['suppliers', 'approve'],
  'ops:general.notice': 'notices', 'ops:general.noticeMailAt': 'notices', 'ops:general.saveNotice': 'notices', 'ops:general.deleteNotice': ['notices', 'delete'],
  'ops:general.refData': 'agency', 'ops:general.saveAgency': 'agency', 'ops:general.saveFeePlan': 'agency', 'ops:general.deleteRef': ['agency', 'delete'],
  'ops:general.saveReferral': 'agency', 'ops:general.createReferral': 'agency', 'ops:general.stopReferral': 'agency', 'ops:general.resumeReferral': 'agency', 'ops:general.savePayment': 'agency', 'ops:general.bulkPayments': 'agency',
  'ops:general.sales': 'sales', 'ops:general.fav': 'sales', 'ops:general.refund': 'sales',
  'ops:general.maint': 'grant', 'ops:general.maintToggle': 'grant', 'ops:general.maintEdit': 'grant', 'ops:general.siteMaintToggle': 'grant', 'ops:general.saveVersion': 'grant',
  'ops:general.addIp': ['grant', 'create'], 'ops:general.updateIp': ['grant', 'update'], 'ops:general.createAccount': ['grant', 'create'], 'ops:general.setAccountStatus': 'grant', 'ops:general.setAccountRoles': 'grant',
  'domain:master.drivers': 'consign', 'domain:master.addDriver': ['consign', 'create'], 'domain:master.updateDriver': 'consign', 'domain:master.setDriverStatus': 'consign',
  'domain:master.vmLayout': 'devices', 'domain:master.vmLayouts': 'devices', 'domain:master.setVmLayout': 'devices',
  'domain:master.setMaterialPrice': 'materials', 'domain:master.setPlanMaterials': 'plans', 'domain:master.formMaster': 'plans',
  'domain:master.supplierProducts': 'suppliers', 'domain:master.taxRates': 'products',
  /* 税率の追加・削除はシステム管理（権限付与）だけ（台帳 E 2026-10-05） */
  'domain:master.addTaxRate': ['grant', 'create'], 'domain:master.removeTaxRate': ['grant', 'delete'], 'domain:master.updateTaxRate': ['grant', 'update'],
  'ops:masters.planCsvPreview': ['plans', 'csvImport'], 'ops:masters.planCsvCommit': ['plans', 'csvImport'], 'ops:masters.planCsvExport': ['plans', 'csvExport'],
  'ops:masters.vmLayout': 'devices', 'ops:masters.vmLayouts': 'devices',
  /* 月間メニュー・オーダー（商品注文・資材注文）・カテゴリ */
  'ops:menu.publishMenu': ['menu', 'publish'], 'domain:menu.publish': ['menu', 'publish'], 'ops:menu.importCsv': ['menu', 'csvImport'], 'domain:menu.importCsv': ['menu', 'csvImport'],
  'ops:menu.menuAlerts': 'dashboard', 'domain:menu.alerts': 'dashboard', 'domain:menu.avgTarget': 'menu',
  'ops:menu.cats': 'products', 'ops:menu.saveCat': 'products', 'ops:menu.deleteCat': ['products', 'delete'], 'ops:menu.addTag': 'products', 'ops:menu.removeTag': 'products',
  'ops:menu.orders': 'orders', 'ops:menu.tags': 'orders', 'ops:menu.order': 'orders', 'ops:menu.saveOrder': 'orders', 'ops:menu.alts': 'orders', 'ops:menu.applyAlt': 'orders',
  'ops:menu.altPreview': 'orders', 'ops:menu.altSuggest': 'orders', 'ops:menu.mats': 'orders', 'ops:menu.mat': 'orders', 'ops:menu.createMat': ['orders', 'create'],
  'ops:menu.saveMat': 'orders', 'ops:menu.matPre': 'orders', 'ops:menu.cancelMat': ['orders', 'delete'], 'ops:menu.spref': 'orders', 'ops:menu.saveSpref': 'orders',
  'ops:menu.smpQuota': 'samples', 'ops:menu.smpUsed': 'samples', 'ops:menu.setSmpQuota': 'samples',
  'domain:menu.kari': 'purchasing', 'domain:menu.approveKari': ['purchasing', 'issue'],
  'domain:delivery.materialOrders': 'orders', 'domain:delivery.placeMaterialOrder': ['orders', 'create'], 'domain:delivery.updateMaterialOrder': 'orders',
  'domain:delivery.cancelMaterialOrder': ['orders', 'delete'], 'domain:order.supplierClaims': 'purchasing',
  /* 発注・入荷・倉庫在庫・サンプル */
  'ops:purchasing.approveKari': ['purchasing', 'issue'], 'ops:purchasing.setBill': ['purchasingBill', 'update'], 'ops:purchasing.samples': 'samples', 'ops:purchasing.addSample': ['samples', 'create'],
  'ops:purchasing.closeWeek': 'samples', 'ops:purchasing.reopenWeek': 'samples', 'ops:purchasing.updateSample': 'samples', 'ops:purchasing.stock': 'stockFood', 'ops:purchasing.addStockRec': ['stockFood', 'create'],
  'ops:purchasing.importStock': ['stockFood', 'csvImport'], 'ops:purchasing.createReturn': ['stockFood', 'create'],
  'domain:stock.receiving': 'receiving', 'domain:stock.receipts': 'receiving', 'domain:stock.receive': ['receiving', 'receive'], 'domain:stock.resolve': ['receiving', 'receive'],
  'domain:stock.materials': 'stockMaterial', 'domain:stock.alerts': 'dashboard', 'domain:stock.honSchedule': 'purchasing',
  /* 配送（駐車場・ドライバーの報告・見積もり・保冷バッグ）・棚卸 */
  'domain:account.issueDriverReset': 'consign', 'domain:report.parking': 'delivery', 'domain:report.reportParking': 'delivery', 'domain:report.driverReports': 'delivery',
  'domain:report.forDelivery': 'delivery', 'domain:report.start': 'delivery', 'domain:report.saveStep': 'delivery', 'domain:report.finish': 'delivery',
  'domain:report.fileStock': 'disposalInput', 'domain:report.confirmStock': 'disposal',
  'domain:carrier.coolers': 'rental', 'domain:carrier.cooler': 'rental', 'domain:carrier.setCooler': 'rental', 'domain:carrier.createCooler': 'rental', 'domain:carrier.updateCooler': 'rental',
  'ops:delivery.navBadge': 'dashboard', 'ops:delivery.recordImport': ['delivery', 'csvImport'], 'ops:delivery.duplicateDelivery': ['delivery', 'create'],
  'ops:delivery.cancelDelivery': ['delivery', 'delete'], 'domain:delivery.cancelDelivery': ['delivery', 'delete'],
  /* 名前は add／remove だが、中身は編集（メモ・繰越・調整の行） */
  'ops:delivery.addMemo': ['delivery', 'update'], 'domain:delivery.addMemo': ['delivery', 'update'],
  'ops:billing.addCarries': ['collection', 'update'], 'ops:billing.removeAdjust': ['collection', 'update'],
  /* お問い合わせ（HubSpot）・お知らせ・アカウント */
  'domain:notice.inquiries': 'hubspot', 'domain:notice.inquiryNew': 'hubspot', 'domain:notice.markInquiryRead': 'hubspot',
  'domain:app.reviews': 'engagement', 'domain:app.review': 'engagement', 'domain:app.reviewTags': 'engagement',
  'ops:reviews.csv': ['engagement', 'csvExport'],
};

/** 新規と保存が同じ API：引数から新規か（新規＝作成、ほか＝編集） */
const SAVE_NEW: Record<string, (a: Record<string, unknown>) => boolean> = {
  'domain:survey.save': (a) => !a.id, 'ops:general.saveProduct': (a) => !a.id, 'ops:general.saveNotice': (a) => !a.id,
  'ops:general.saveAgency': (a) => a.mode === 'new', 'ops:general.saveFeePlan': (a) => a.mode === 'new', 'ops:general.createReferral': () => true, 'ops:general.saveMaster': (a) => !!a.isNew,
  /* 仕入先・委託配送先・倉庫・配送スタッフの登録・保存（機能は key：kindOf） */
  'ops:general.saveGen': (a) => !a.id,
  'domain:notice.saveAnnouncement': (a) => !a.id,
};

/** 引数で機能が決まる API */
function kindOf(key: string, args: Record<string, unknown>): string | null {
  const kind = String(args.kind ?? '');
  /* 共通データのマスタ（商品・資材・倉庫・委託配送先・ドライバー・プラン…） */
  if (key.startsWith('domain:master.') || key === 'ops:general.saveMaster') {
    const m: Record<string, string> = {
      plans: 'plans', models: 'devices', options: 'plans', discounts: 'plans', warehouses: 'relay', carriers: 'consign', drivers: 'consign',
      products: 'products', materials: 'materials', troubleTypes: 'delivery', taxRates: 'grant', productTags: 'products', productCategories: 'products', optionCategories: 'plans',
    };
    return m[kind] ?? null;
  }
  /* 法人・拠点・子契約の保存（contracts.save の entity） */
  if (key === 'ops:contracts.save' || key === 'ops:contracts.editing') return ({ corp: 'corps', branch: 'branches', child: 'contracts', contract: 'contracts' } as Record<string, string>)[String(args.entity ?? '')] ?? 'corps';
  /* 運営のマスタ（機種・プラン・オプション・値引き） */
  if (key.startsWith('ops:masters.')) return kind === 'devices' ? 'devices' : kind === 'materials' ? 'materials' : kind ? 'plans' : null;
  /* 一覧だけの画面（general.genList・deleteRow）の key */
  if (key === 'ops:general.genList' || key === 'ops:general.deleteRow' || key === 'ops:general.genRec' || key === 'ops:general.genFormOpts' || key === 'ops:general.saveGen'
    || key === 'ops:general.genHistory' || key === 'ops:general.genSendPassword' || key === 'ops:general.esFees') {
    return GEN_FEATURES[String(args.key ?? '')] ?? 'grant';
  }
  return null;
}

/** 発注の書き換え（purchasing.orderOp・/api/ops/orders/op）の操作 */
export function orderOpRule(op: string): [string, PermOp] {
  if (op === 'receive') return ['receiving', 'receive'];
  if (op === 'create') return ['purchasing', 'create'];
  if (['issueHon', 'changeHon', 'cancel', 'proxyHon', 'proxyShip'].includes(op)) return ['purchasing', 'issue'];
  return ['purchasing', 'update'];
}

/** 名前から書き換えの操作 */
const opOfName = (name: string): PermOp =>
  /^(create|add|new|register|place|duplicate|submitNew)/.test(name) ? 'create' : /^(delete|remove)/.test(name) ? 'delete' : 'update';

/** CSV（共通データの csv）の entity → 機能 */
const CSV_FEATURE: Record<string, string> = {
  products: 'products', categories: 'products', tags: 'products', taxRates: 'grant', plans: 'plans', warehouses: 'relay', carriers: 'consign',
  /* 機種・オプション・値引きの CSV（2026/10/05：抜けていて 403 になっていた） */
  devices: 'devices', options: 'plans', discounts: 'plans',
  materials: 'materials', discountApply: 'plans', drivers: 'consign', suppliers: 'suppliers', carrierStaff: 'consign', newApplications: 'contracts', corps: 'corps',
  branches: 'branches', contracts: 'contracts', menu: 'menu', menuRequest: 'menu', receiving: 'receiving', stockMoves: 'stockFood',
  supplierAnswers: 'purchasing', surveyQuestions: 'surveys',
  /* 委託配送先の ES配送費（委託配送先詳細の「ES配送費」タブ） */
  carrierEsFees: 'consign',
  /* 既存のお客様の移行（取込だけ・受付簿 No.28）：法人・拠点・契約＝法人情報管理、設備・企業独自価格＝プラン契約管理 */
  migrationSites: 'corps', migrationContacts: 'corps', migrationLoans: 'contracts', migrationPrices: 'contracts',
};

/**
 * API に要る権限（機能・操作）。alsoRead＝閲覧なら、この機能のどれかの閲覧でもよい。
 * any＝運営のだれでも（CSV の出力の記録・取込の続き）
 */
export function ruleOf(kind: 'ops' | 'domain', area: string, op: string, action: boolean, rawArgs: unknown):
  { feature: string; op: PermOp; alsoRead: string[] } | 'any' {
  const key = `${kind}:${area}.${op}`;
  const args = (rawArgs && typeof rawArgs === 'object' && !Array.isArray(rawArgs) ? rawArgs : {}) as Record<string, unknown>;
  if (key === 'domain:csv.logExport' || key === 'domain:csv.jobStep' || key === 'domain:csv.job') return 'any';
  /* 自分の権限（画面のメニュー・ボタンの出し分け）は運営のだれでも */
  if (key === 'domain:account.me') return 'any';
  /* 権限（役割）の作成・変更 */
  if (key === 'domain:account.saveRole') return { feature: 'grant', op: args.id ? 'update' : 'create', alsoRead: [] };
  /* 仕入先・委託配送先のアカウント一括発行（受付簿 #62）：その一覧の機能の「作成」 */
  if (key === 'ops:general.issueAccounts') return { feature: args.key === 'supplier' ? 'suppliers' : 'consign', op: 'create', alsoRead: [] };
  if (kind === 'domain' && area === 'csv') {
    const feature = CSV_FEATURE[String(args.entity ?? '')] ?? 'grant';
    const imp = op === 'importPreview' || op === 'importCommit' || op === 'template';
    /* 出力だけの一覧（records）は、その文書を持つ機能の CSV 出力 */
    if (op === 'records') return { feature: recordsFeature(String(args.kind ?? '')), op: 'csvExport', alsoRead: [] };
    /* 取込・出力の記録（entity なし）は運営のだれでも */
    if (!args.entity) return 'any';
    return { feature, op: imp ? 'csvImport' : 'csvExport', alsoRead: [] };
  }
  /* 商品注文の調整数を保存するときは、システム管理（権限付与の編集ができる人）だけ（台帳 H「商品注文の調整数・調整率」・受付簿 #263）。数だけ直す保存はオーダー管理の編集 */
  if (key === 'ops:menu.saveOrder' && args.adjust) return { feature: 'grant', op: 'update', alsoRead: [] };
  /* 共通データの商品注文（domain:order.saveOrder）を直接呼んでも同じ：呼び手の site の申告ではなく、権限で止める（adjust を持つ呼び出し＝調整数を書く） */
  if (key === 'domain:order.saveOrder' && 'adjust' in args) return { feature: 'grant', op: 'update', alsoRead: [] };
  /* 資材注文の発送日・送り状番号を入れるのもシステム管理だけ（物流に更新権限は足さない：台帳 H・受付簿 #277）。数・納品予定日だけ直す保存はオーダー管理の編集 */
  if (key === 'ops:menu.saveMat' && args.ship) return { feature: 'grant', op: 'update', alsoRead: [] };
  if (key === 'ops:purchasing.orderOp') { const [f, o] = orderOpRule(String(args.op ?? '')); return { feature: f, op: o, alsoRead: [] }; }
  /* 新規も保存も同じ API のもの：新規なら作成 */
  if (SAVE_NEW[key]) {
    const r = API[key];
    const feature = (Array.isArray(r) ? r[0] : r) ?? kindOf(key, args) ?? AREA[`${kind}:${area}`] ?? 'grant';
    return { feature, op: SAVE_NEW[key](args) ? 'create' : 'update', alsoRead: [] };
  }
  const rule = API[key];
  const feature = (Array.isArray(rule) ? rule[0] : rule) ?? kindOf(key, args) ?? AREA[`${kind}:${area}`] ?? 'grant';
  const pop: PermOp = Array.isArray(rule) ? rule[1] : !action ? 'read' : opOfName(op);
  /* 一覧だけの画面（genList）は key で機能が決まるので、ほかの画面の閲覧では読めない */
  const also = key === 'ops:general.genList' ? [] : READ_ALSO[key] ?? [];
  return { feature, op: pop, alsoRead: !action || pop === 'read' ? also : [] };
}

/** 出力だけの一覧（csv.records）で読む文書 → 機能 */
function recordsFeature(docKind: string): string {
  const m: [RegExp, string][] = [
    [/^dm\.org\.corps|^contracts\.corp/, 'corps'], [/^dm\.org\.branches/, 'branches'], [/^dm\.org\.(contracts|childContracts)|^dm\.apply/, 'contracts'],
    [/^dm\.billing/, 'collection'], [/^dm\.delivery/, 'delivery'], [/^dm\.app\.(purchases|users)/, 'sales'], [/^dm\.app\.reviews/, 'engagement'],
    [/^dm\.master\.products|^dm\.master\.product/, 'products'], [/^dm\.master\.materials/, 'materials'], [/^dm\.master\.(plans|options|discounts)/, 'plans'],
    [/^dm\.order|^menu\./, 'orders'], [/^purchasing\.|^dm\.stock/, 'purchasing'], [/^dm\.notice/, 'notices'], [/^dm\.survey/, 'surveys'], [/^dm\.referral/, 'agency'],
    [/^dm\.carrier/, 'consign'], [/^masters\./, 'plans'], [/^general\./, 'grant'],
  ];
  return m.find(([re]) => re.test(docKind))?.[1] ?? 'grant';
}

/**
 * 読み取りの API を使っている画面の機能（画面を開いて読んだ API を集めたもの・2026-10-03）。
 * ここにある機能のどれかの閲覧があれば読める（例：倉庫在庫の画面は発注の一覧も読む）
 */
const READ_ALSO: Record<string, string[]> = {
  'domain:billing.lockedSkips': ['dashboard'],
  'domain:bulk.priceGens': ['plans'],
  /* 移行の要補完（法人・契約管理の画面。受付簿 No.28） */
  'domain:org.migrationTodo': ['branches', 'contracts'],
  /* 移行CSV取込の「切替のサイクル月」の選択肢 */
  'domain:delivery.cycles': ['corps', 'branches', 'contracts'],
  'domain:master.get': ['plans'],
  'domain:master.history': ['plans'],
  'domain:master.list': ['plans'],
  'domain:notice.inquiries': ['hubspot'],
  'domain:notice.markInquiryRead': ['hubspot'],
  'domain:stock.alerts': ['dashboard', 'purchasing', 'receiving'],
  'domain:stock.honSchedule': ['purchasing'],
  'domain:stock.materials': ['dashboard', 'purchasing'],
  'domain:stock.materialDemand': ['purchasing'],
  'domain:stock.receiving': ['receiving'],
  'domain:survey.audience': ['surveys'],
  'domain:survey.get': ['surveys'],
  'domain:survey.list': ['surveys'],
  'domain:survey.templates': ['surveys'],
  'ops:applications.intake': ['contracts', 'engagement'],
  'ops:applications.masters': ['engagement'],
  'ops:applications.navBadge': ['agency', 'branches', 'collection', 'consign', 'contracts', 'corps', 'dashboard', 'delivery', 'devices', 'disposal', 'disposalInput', 'engagement', 'grant', 'hubspot', 'materials', 'menu', 'notices', 'orders', 'plans', 'products', 'purchasing', 'receiving', 'relay', 'rental', 'sales', 'samples', 'stockFood', 'stockMaterial', 'suppliers', 'surveys'],
  'ops:applications.overview': ['contracts'],
  'ops:applications.setup': ['engagement'],
  'ops:billing.confirmAlert': ['dashboard'],
  'ops:billing.state': ['collection', 'disposal', 'disposalInput'],
  'ops:contracts.branch': ['branches'],
  'ops:contracts.branches': ['branches'],
  'ops:contracts.child': ['contracts'],
  'ops:contracts.children': ['contracts'],
  'ops:contracts.corp': ['corps'],
  'ops:contracts.corps': ['corps'],
  'ops:delivery.consignees': ['delivery'],
  'ops:delivery.cycleSettings': ['delivery'],
  'ops:delivery.dateAlt': ['delivery'],
  'ops:delivery.delivery': ['delivery'],
  'ops:delivery.headCounts': ['delivery'],
  'ops:delivery.list': ['delivery'],
  'ops:delivery.listOpts': ['delivery'],
  'ops:delivery.matShipments': ['delivery'],
  'ops:delivery.navBadge': ['delivery'],
  'ops:delivery.reviewList': ['delivery'],
  'ops:delivery.scheduleMonth': ['delivery'],
  'ops:delivery.shipOrders': ['delivery'],
  'ops:general.dash': ['dashboard'],
  'ops:general.fav': ['sales'],
  'ops:general.genList': ['consign', 'grant', 'notices', 'products', 'relay', 'rental', 'suppliers'],
  'ops:general.maint': ['grant'],
  'ops:general.notice': ['notices'],
  'ops:general.product': ['products'],
  'ops:general.productMasters': ['products'],
  'ops:general.refData': ['agency'],
  'ops:general.sales': ['sales'],
  'ops:general.supplierApps': ['suppliers'],
  'ops:general.taxRates': ['grant', 'plans', 'products'],
  'ops:general.topAlerts': ['dashboard'],
  'ops:general.topSchedule': ['dashboard'],
  'ops:masters.get': ['devices', 'plans'],
  'ops:masters.list': ['devices', 'plans'],
  'ops:masters.vmLayout': ['devices', 'plans'],
  'ops:menu.altPreview': ['orders'],
  'ops:menu.cats': ['orders', 'products'],
  'ops:menu.master': ['menu', 'orders', 'products'],
  'ops:menu.mat': ['orders'],
  'ops:menu.matPre': ['orders'],
  'ops:menu.mats': ['orders'],
  'ops:menu.menu': ['orders'],
  'ops:menu.menuAlerts': ['dashboard'],
  'ops:menu.menuEdit': ['orders'],
  'ops:menu.menus': ['menu', 'orders'],
  'ops:menu.order': ['orders'],
  'ops:menu.orders': ['orders'],
  'ops:menu.smpQuota': ['orders'],
  'ops:menu.smpUsed': ['orders'],
  'ops:menu.spref': ['orders'],
  'ops:purchasing.claims': ['purchasing'],
  'ops:purchasing.kari': ['purchasing'],
  'ops:purchasing.meta': ['purchasing', 'receiving', 'stockFood', 'stockMaterial'],
  'ops:purchasing.orders': ['purchasing', 'receiving', 'stockFood', 'stockMaterial'],
  'ops:purchasing.samples': ['samples'],
  'ops:purchasing.stock': ['purchasing', 'stockFood', 'stockMaterial'],
  'ops:reviews.detail': ['engagement'],
  'ops:reviews.list': ['engagement'],
  'ops:reviews.options': ['engagement'],
};
